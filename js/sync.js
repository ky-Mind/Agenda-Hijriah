/* Sinkron localStorage (kunci kl2_*) <-> Firestore users/{uid}/data/store. Terbaru menang per kunci, realtime antar perangkat.
   Gagal? coba ulang otomatis (backoff) dan pulih sendiri saat Rules/koneksi diperbaiki.
   Sekali per perangkat: impor data lama Agenda (users/{uid} dan users/{uid}/absensi_harian/{tanggal}). */
(function(){
const OK=/^kl2_/,SKIP=/^kl2_(cache|sync_meta|theme)/,META="kl2_sync_meta",LEG={terlaksana:1,tidak_terlaksana:0,datang_bulan:2};
const rawSet=Storage.prototype.setItem,rawDel=Storage.prototype.removeItem;
let ref=null,unsub=null,timer=null,retryT=null,applying=false,tries=0,cur=null,legDone=false;const dirty=new Set();
const meta=()=>{try{return JSON.parse(localStorage.getItem(META)||"{}")}catch(e){return{}}};
const saveMeta=m=>rawSet.call(localStorage,META,JSON.stringify(m));
const status=(s,code)=>{KLSync.state=s;KLSync.code=code||"";if(s==="ok")KLSync.t=Date.now();document.dispatchEvent(new CustomEvent("kl-sync",{detail:{s,code:KLSync.code,t:KLSync.t}}))};
const track=k=>OK.test(k)&&!SKIP.test(k),fid=k=>k.replace(/[.\/]/g,"_");
function touch(k){if(applying||!track(k))return;const m=meta();m[k]=Date.now();saveMeta(m);dirty.add(k);schedule()}
Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(this===localStorage)touch(k)};
Storage.prototype.removeItem=function(k){rawDel.call(this,k);if(this===localStorage)touch(k)};
function fail(e){console.warn("sync",e);status("err",e&&e.code||"unknown");clearTimeout(retryT);
  retryT=setTimeout(()=>start(cur,true),e&&e.code==="permission-denied"?20000:Math.min(60000,3000*2**Math.min(tries++,5)))}
function schedule(){if(!ref)return;if(KLSync.state!=="err")status("busy");clearTimeout(timer);timer=setTimeout(push,700)}
async function push(){
  if(!ref||!dirty.size)return status(ref?(KLSync.state==="err"?"err":"ok"):"off",KLSync.code);
  const m=meta(),patch={};
  dirty.forEach(k=>{const v=localStorage.getItem(k);patch[fid(k)]={k,v,t:m[k]||Date.now(),del:v===null}});
  try{await ref.set(patch,{merge:true});dirty.clear();tries=0;status("ok")}catch(e){fail(e)}
}
function pull(snap){
  const d=(snap&&snap.data&&snap.data())||{},m=meta();let changed=false;
  applying=true;
  try{for(const id in d){const e=d[id];if(!e||!e.k||!track(e.k)||(m[e.k]||0)>=e.t)continue;
    if(e.del)rawDel.call(localStorage,e.k);else rawSet.call(localStorage,e.k,e.v);m[e.k]=e.t;changed=true}}
  finally{applying=false}
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
    if(track(k)){const e=d[fid(k)];if(!e||e.t<(m[k]||0))dirty.add(k);if(!m[k])m[k]=Date.now()}}
  saveMeta(m);tries=0;
  if(dirty.size)schedule();else status("ok");
  if(changed)document.dispatchEvent(new CustomEvent("kl-data-changed"));
  if(!legDone&&cur){legDone=true;legacy(cur)}
}
const shrink=u=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas");c.width=c.height=256;const s=Math.min(i.width,i.height);c.getContext("2d").drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,256,256);r(c.toDataURL("image/jpeg",.85))};i.onerror=()=>r("");i.src=u});
async function legacy(u){
  const FL="kl_legacy_"+u.uid;if(localStorage.getItem(FL)||!window.__klDb)return;
  try{
    const ud=__klDb.collection("users").doc(u.uid),[pd,days]=await Promise.all([ud.get(),ud.collection("absensi_harian").get()]);
    let n=0;days.forEach(d=>{if(!/^\d{4}-\d\d-\d\d$/.test(d.id))return;const k="kl2_abs_"+d.id,x=d.data()||{};let rec={},ch=false;
      try{rec=JSON.parse(localStorage.getItem(k)||"{}")}catch(e){}
      for(const id in x)if(x[id] in LEG&&rec[id]==null){rec[id]=LEG[x[id]];ch=true}
      if(ch){localStorage.setItem(k,JSON.stringify(rec));n++}});
    const p=(pd&&pd.data&&pd.data())||{};let pr={};try{pr=JSON.parse(localStorage.getItem("kl2_profil")||"{}")}catch(e){}let pc=false;
    if(!pr.name&&p.display_name){pr.name=p.display_name;pc=true}
    if(!pr.whatsapp&&p.whatsapp){pr.whatsapp=String(p.whatsapp);pc=true}
    if(!pr.photo&&/^data:image\//.test(p.photo_url||"")){const s=await shrink(p.photo_url);if(s){pr.photo=s;pc=true}}
    if(pc)localStorage.setItem("kl2_profil",JSON.stringify(pr));
    rawSet.call(localStorage,FL,"1");
    if(n||pc){document.dispatchEvent(new CustomEvent("kl-data-changed"));document.dispatchEvent(new CustomEvent("kl-profile"));document.dispatchEvent(new CustomEvent("kl-legacy",{detail:{days:n}}))}
  }catch(e){console.warn("impor data lama",e&&e.code||e)}
}
function start(user,quiet){
  if(unsub){try{unsub()}catch(e){}unsub=null}
  cur=user||null;
  if(!user||!window.__klDb){ref=null;clearTimeout(retryT);return status("off")}
  ref=__klDb.collection("users").doc(user.uid).collection("data").doc("store");
  if(!quiet||KLSync.state!=="err")status("busy");
  unsub=ref.onSnapshot(pull,fail);
}
window.KLSync={state:"off",code:"",t:0,flush:push,now(){tries=0;clearTimeout(retryT);legDone=false;start(cur)}};
document.addEventListener("visibilitychange",()=>{if(document.hidden)push()});
window.addEventListener("pagehide",push);
window.addEventListener("online",()=>{tries=0;if(KLSync.state==="err")start(cur,true);else if(dirty.size)schedule()});
if(window.__klAuth)__klAuth.onAuthStateChanged(start);
})();
