/* Catatan pengunjung & akun untuk dasbor admin.
   kunjungan/{id acak perangkat} -> semua pengunjung (tanpa login juga): HP, kota (IP & jadwal shalat), sumber link, jumlah kunjungan;
   nama & email ikut tercatat begitu pengunjung itu login.
   akun/{uid} -> nama, email, merek & model HP, sistem, aplikasi (APK/Web), versi, kota.
   Ditulis saat masuk dan saat aplikasi dibuka (paling sering 30 menit sekali, atau langsung bila isinya berubah).
   Hanya pemilik akun yang boleh menulis, hanya admin yang boleh membaca (lihat firestore.rules). */
import {get} from "../store.js";
import {VERSION} from "../version.js";

const T="kl_akun_t",S="kl_akun_sig",JEDA=30*60000;
const s=(v,n=80)=>String(v??"").trim().slice(0,n);

/* Merek dari kode model (Build.MODEL / user agent) */
export function merek(m){
  const x=String(m||"");
  const L=[[/^(SM-|GT-|Galaxy)/i,"Samsung"],[/^(Redmi|POCO|Mi |MI |Xiaomi|M\d{4}[A-Z]|2\d{4}[A-Z0-9]{3,})/i,"Xiaomi"],[/^CPH/i,"OPPO"],[/^RMX/i,"realme"],
    [/^(V\d{4}|vivo|I\d{4})/i,"vivo"],[/^Infinix|^X\d{3,4}[A-Z]?$/i,"Infinix"],[/^TECNO/i,"Tecno"],[/^itel/i,"itel"],[/^Pixel/i,"Google"],[/^(ASUS|ASUS_)/i,"ASUS"],
    [/^moto/i,"Motorola"],[/^Nokia/i,"Nokia"],[/^LM-/i,"LG"],[/^(HUAWEI|[A-Z]{3}-[A-Z]{1,2}\d{2})/,"Huawei"],[/^Lenovo/i,"Lenovo"],[/^(OnePlus|NE2|LE2|KB2)/i,"OnePlus"],[/^(iPhone|iPad)/,"Apple"]];
  for(const[r,b]of L)if(r.test(x))return b;return"";
}

export async function perangkat(){
  /* APK baru: langsung dari Android (Build.MANUFACTURER / MODEL) */
  try{const j=JSON.parse(window.KLAndroid?.perangkat?.()||"null");if(j&&j.model)return{brand:s(j.brand),model:s(j.model),os:s(j.os)}}catch(e){}
  const ua=navigator.userAgent;let model="",os="",brand="";
  try{const d=navigator.userAgentData;if(d?.getHighEntropyValues){const h=await d.getHighEntropyValues(["model","platformVersion"]);
    model=h.model||"";if(d.platform==="Android"&&h.platformVersion)os="Android "+h.platformVersion.replace(/\.0(\.0)?$/,"")}}catch(e){}
  const a=/Android ([\d.]+);\s*([^;)]*?)(?:\s+Build\/[^;)]*)?(?:;|\))/.exec(ua);
  if(a){os=os||"Android "+a[1];if(!model&&a[2]&&a[2]!=="K")model=a[2]}
  else if(/iPhone|iPad/.test(ua)){brand="Apple";model=/iPad/.test(ua)?"iPad":"iPhone";const v=/OS (\d+)[_.](\d+)/.exec(ua);os="iOS"+(v?` ${v[1]}.${v[2]}`:"")}
  else{os=/Windows/.test(ua)?"Windows":/Mac OS/.test(ua)?"macOS":/CrOS/.test(ua)?"ChromeOS":/Linux/.test(ua)?"Linux":"";model=os?"Komputer":""}
  if(model==="Komputer")brand="";else brand=brand||merek(model);
  return{brand:s(brand),model:s(model),os:s(os)};
}

/* Kota perkiraan dari IP (sekali per sesi) */
async function ipKota(){
  try{const c=sessionStorage.getItem("kl_ipkota");if(c!=null)return c}catch(e){}
  let v="";try{const ac=new AbortController();setTimeout(()=>ac.abort(),5000);
    const j=await fetch("/api/geo",{cache:"no-store",signal:ac.signal}).then(r=>r.ok?r.json():{});
    v=[j.city,j.region].filter(Boolean).join(", ");if(j.country&&j.country!=="ID")v=[v,j.country].filter(Boolean).join(", ")}catch(e){}
  try{sessionStorage.setItem("kl_ipkota",v)}catch(e){}return s(v)}

/* Dari mana pengunjung datang (sekali per sesi): ?utm_source / ?ref, situs perujuk, atau langsung */
function sumber(){
  try{const c=sessionStorage.getItem("kl_ref");if(c!=null)return c}catch(e){}
  let v="";const q=new URLSearchParams(location.search);
  if(window.KLAndroid)v="Aplikasi Android";
  else if(q.get("utm_source")||q.get("ref"))v=[q.get("utm_source")||q.get("ref"),q.get("utm_medium"),q.get("utm_campaign")].filter(Boolean).join(" / ");
  else{try{const r=document.referrer?new URL(document.referrer):null;v=r&&r.host!==location.host?r.host.replace(/^www\./,""):"Langsung"}catch(e){v="Langsung"}}
  v=s(v,120);try{sessionStorage.setItem("kl_ref",v)}catch(e){}return v}

function vid(){let v=localStorage.getItem("kl_vid");
  if(!v||!/^[a-z0-9]{20}$/.test(v)){const a=new Uint8Array(20);crypto.getRandomValues(a);v=[...a].map(x=>"abcdefghijklmnopqrstuvwxyz0123456789"[x%36]).join("");localStorage.setItem("kl_vid",v);localStorage.removeItem("kl_vid_ok")}
  return v}

/* Bot perayap, browser otomatis, dan pratinjau tautan tidak dihitung sebagai pengunjung */
const robot=()=>navigator.webdriver||/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|vercel|prerender|pagespeed/i.test(navigator.userAgent);
let sibuk=false;
async function catat(u){
  const db=window.__klDb;if(!db||!window.firebase||sibuk||robot())return;sibuk=true;
  try{
    const apk=window.KLAndroid?.versi?.()||"",p=get("profil",{})||{},l=get("loc",null),d=await perangkat(),ip=await ipKota(),ref=sumber();
    const dasar={brand:d.brand,model:d.model,os:d.os,app:apk?"APK":"Web",ver:s(apk?`apk ${apk} / web ${VERSION}`:VERSION),
      kota:s(l?.name||""),ipkota:ip};
    const siapa=u?{uid:u.uid,email:u.email||null,name:s(p.name||u.displayName||"")}:null;
    const baruSesi=!sessionStorage.getItem("kl_ses"),sig=JSON.stringify([dasar,siapa]),now=Date.now(),FV=firebase.firestore.FieldValue,TS=FV.serverTimestamp();
    if(!baruSesi&&localStorage.getItem(S)===sig&&now-(+localStorage.getItem(T)||0)<JEDA)return;
    /* 1. Pengunjung (siapa pun, tanpa login juga) */
    const id=vid(),ref1=db.collection("kunjungan").doc(id);
    const ubah={vid:id,...dasar,ref,masuk:s(location.pathname+location.hash,120),last:TS,...(siapa||{})};
    if(baruSesi)ubah.n=FV.increment(1);
    const buat={...ubah,uid:siapa?.uid||null,email:siapa?.email||null,name:siapa?.name||null,ref1:ref,n:1,first:TS};
    const coba=async(a,b)=>{try{await a()}catch(e){if(e?.code!=="permission-denied"&&e?.code!=="not-found")throw e;await b()}};
    const tulisBuat=()=>ref1.set(buat),tulisUbah=()=>ref1.set(ubah,{merge:true});
    if(localStorage.getItem("kl_vid_ok"))await coba(tulisUbah,tulisBuat);else await coba(tulisBuat,tulisUbah);
    localStorage.setItem("kl_vid_ok","1");sessionStorage.setItem("kl_ses","1");
    /* 2. Akun (hanya bila login) */
    if(u){
      const data={uid:u.uid,email:u.email||null,name:siapa.name,...dasar,
        lat:Math.round((+l?.lat||0)*100)/100,lng:Math.round((+l?.lng||0)*100)/100};
      const ra=db.collection("akun").doc(u.uid),ada=(await ra.get()).exists;
      await ra.set(ada?{...data,last:TS}:{...data,first:TS,last:TS},{merge:true});
    }
    localStorage.setItem(S,sig);localStorage.setItem(T,String(now));
  }catch(e){console.warn("catat kunjungan",e&&e.code||e)}
  finally{sibuk=false}
}

export function initAkun(){
  sumber();  /* baca ?utm_source / perujuk segera, sebelum alamat halaman berubah */
  let u=null,t=0;const lagi=()=>{clearTimeout(t);t=setTimeout(()=>catat(u),1500)};
  if(window.__klAuth)window.__klAuth.onAuthStateChanged(x=>{u=x;lagi()});else lagi();
  ["kl-loc","kl-profile"].forEach(e=>document.addEventListener(e,lagi));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)lagi()});
}
