/* Enkripsi ujung-ke-ujung: ECDH P-256 + AES-GCM (Web Crypto). Kunci privat dibungkus PIN (PBKDF2 250rb putaran) dan disimpan
   di users/{uid}/data/chatkey (hanya terbaca pemilik) agar bisa dibuka di perangkat lain; di perangkat ini disimpan sebagai
   CryptoKey non-extractable di IndexedDB. Server hanya melihat ciphertext. */
const enc=new TextEncoder(),dec=new TextDecoder(),S=()=>crypto.subtle,cache=new Map();
export const PREFIX="e2e1:";
const b64=u=>{const a=new Uint8Array(u);let s="";for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
const ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open("kl-e2e",1);r.onupgradeneeded=()=>r.result.createObjectStore("k");r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const idbGet=async k=>{const d=await idb();return new Promise((ok,no)=>{const q=d.transaction("k").objectStore("k").get(k);q.onsuccess=()=>{d.close();ok(q.result)};q.onerror=()=>{d.close();no(q.error)}})};
const idbPut=async(k,v)=>{const d=await idb();return new Promise((ok,no)=>{const t=d.transaction("k","readwrite");t.objectStore("k").put(v,k);t.oncomplete=()=>{d.close();ok()};t.onerror=()=>{d.close();no(t.error)}})};
export const state={uid:null,priv:null,pub:"",ready:false,exists:undefined,err:""};
const ev=()=>document.dispatchEvent(new CustomEvent("kl-e2e"));
const ref=uid=>window.__klDb.collection("users").doc(uid).collection("data").doc("chatkey");
const kdf=async(pin,salt)=>S().deriveKey({name:"PBKDF2",salt,iterations:250000,hash:"SHA-256"},await S().importKey("raw",enc.encode(pin),"PBKDF2",false,["deriveKey"]),{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
const pubStr=j=>JSON.stringify({kty:j.kty,crv:j.crv,x:j.x,y:j.y});
async function keep(uid,pj,pub){const priv=await S().importKey("jwk",pj,{name:"ECDH",namedCurve:"P-256"},false,["deriveKey"]);cache.clear();Object.assign(state,{uid,priv,pub,ready:true,exists:true,err:""});try{await idbPut(uid,{priv,pub})}catch(e){}ev()}
export async function init(uid){
  cache.clear();Object.assign(state,{uid:uid||null,priv:null,pub:"",ready:false,exists:undefined,err:""});if(!uid){ev();return}
  try{const k=await idbGet(uid);if(k&&k.priv&&k.pub){Object.assign(state,{priv:k.priv,pub:k.pub,ready:true,exists:true})}}catch(e){}
  if(!state.ready){try{state.exists=(await ref(uid).get()).exists}catch(e){state.exists=null;state.err=e&&e.code||"err"}}
  ev()}
export async function setup(uid,pin){
  const kp=await S().generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveKey"]),pj=await S().exportKey("jwk",kp.privateKey),pub=pubStr(await S().exportKey("jwk",kp.publicKey));
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),ct=await S().encrypt({name:"AES-GCM",iv},await kdf(pin,salt),enc.encode(JSON.stringify(pj)));
  await ref(uid).set({v:1,salt:b64(salt),iv:b64(iv),ct:b64(ct),pub});await keep(uid,pj,pub)}
export async function unlock(uid,pin){
  const d=await ref(uid).get();if(!d.exists)throw new Error("nokey");const x=d.data();let pj;
  try{pj=JSON.parse(dec.decode(await S().decrypt({name:"AES-GCM",iv:ub(x.iv)},await kdf(pin,ub(x.salt)),ub(x.ct))))}catch(e){throw new Error("pin")}
  await keep(uid,pj,x.pub)}
async function shared(otherPub){if(!state.priv)throw new Error("locked");let k=cache.get(otherPub);
  if(!k){const pk=await S().importKey("jwk",JSON.parse(otherPub),{name:"ECDH",namedCurve:"P-256"},false,[]);k=await S().deriveKey({name:"ECDH",public:pk},state.priv,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);cache.set(otherPub,k)}return k}
export async function encrypt(otherPub,text){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await S().encrypt({name:"AES-GCM",iv},await shared(otherPub),enc.encode(text));return PREFIX+b64(iv)+"."+b64(ct)}
/* null = tidak bisa dibuka (kunci berubah/rusak); teks tanpa awalan dianggap pesan lama (plaintext) */
export async function decrypt(otherPub,env){if(typeof env!=="string")return null;if(!env.startsWith(PREFIX))return env;
  try{const[i,c]=env.slice(PREFIX.length).split(".");return dec.decode(await S().decrypt({name:"AES-GCM",iv:ub(i)},await shared(otherPub),ub(c)))}catch(e){return null}}
export async function fingerprint(a,b){const[x,y]=[a,b].sort(),h=new Uint8Array(await S().digest("SHA-256",enc.encode(x+"|"+y)));return Array.from(h.slice(0,10),n=>n.toString(16).padStart(2,"0")).join("").match(/.{4}/g).join(" ")}
