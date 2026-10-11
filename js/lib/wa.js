import {get} from "../store.js";
import {HARI,MASEHI,hijriText,fromKey} from "./hijri.js";
import {agenda,day} from "./ibadah.js";
export const DEV="6289506138191";
export const normalize=v=>{const r=String(v||"").replace(/\D/g,"");if(!r)return"";if(r.startsWith("62"))return r;if(r.startsWith("0"))return"62"+r.slice(1);if(r.startsWith("8"))return"62"+r;return r};
export const validNumber=v=>{const n=normalize(v);return n.length>=10&&n.length<=15};
export const waNumber=()=>normalize(get("profil",{}).whatsapp);
export const waUrl=(n,t)=>`https://wa.me/${n||""}?text=${encodeURIComponent(t)}`;
export const openUrl=u=>{const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener noreferrer";document.body.appendChild(a);a.click();a.remove()};
const mark=v=>v===1||v===3?"—✅️":v===2?"—🌑":"—❌️";
export function rekap(k,r=day(k)){
  const d=fromKey(k);
  const head=`${HARI[d.getDay()]}, ${d.getDate()} ${MASEHI[d.getMonth()]} ${d.getFullYear()} M/${hijriText(d)}`;
  return head+"\n\n"+agenda().map(i=>`${i.nama} ${mark(r[i.id])}`).join("\n\n")}
