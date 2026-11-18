/* Catatan akun untuk dasbor admin: akun/{uid} -> nama, email, merek & model HP, sistem, aplikasi (APK/Web), versi, kota.
   Ditulis saat masuk dan saat aplikasi dibuka (paling sering 30 menit sekali, atau langsung bila isinya berubah).
   Hanya pemilik akun yang boleh menulis, hanya admin yang boleh membaca (lihat firestore.rules). */
import {get} from "../store.js";
import {loc} from "./prayer.js";
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

async function catat(u){
  const db=window.__klDb;if(!u||!db||!window.firebase)return;
  try{
    const apk=window.KLAndroid?.versi?.()||"",p=get("profil",{})||{},l=loc(),d=await perangkat();
    const data={uid:u.uid,email:u.email||null,name:s(p.name||u.displayName||""),brand:d.brand,model:d.model,os:d.os,
      app:apk?"APK":"Web",ver:s(apk?`apk ${apk} / web ${VERSION}`:VERSION),kota:s(l?.name||""),
      lat:Math.round((+l?.lat||0)*100)/100,lng:Math.round((+l?.lng||0)*100)/100};
    const sig=JSON.stringify(data),now=Date.now();
    if(localStorage.getItem(S)===sig&&now-(+localStorage.getItem(T)||0)<JEDA)return;
    const ref=db.collection("akun").doc(u.uid),TS=firebase.firestore.FieldValue.serverTimestamp(),ada=(await ref.get()).exists;
    await ref.set(ada?{...data,last:TS}:{...data,first:TS,last:TS},{merge:true});
    localStorage.setItem(S,sig);localStorage.setItem(T,String(now));
  }catch(e){console.warn("catat akun",e&&e.code||e)}
}

export function initAkun(){
  let u=null,t=0;const lagi=()=>{clearTimeout(t);t=setTimeout(()=>catat(u),1500)};
  window.__klAuth?.onAuthStateChanged(x=>{u=x;if(x)lagi()});
  ["kl-loc","kl-profile"].forEach(e=>document.addEventListener(e,()=>u&&lagi()));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&u)lagi()});
}
