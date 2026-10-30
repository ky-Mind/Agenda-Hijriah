import {timings,PRAYERS,NAMES,loc,tzOffset,tzLabel} from "./prayer.js";
/* Jadwal 7 hari ke depan dan kalimat pengingat untuk widget layar utama (Android dan iPhone).
   Widget membaca daftar ini langsung, jadi tetap berganti sesuai waktu meski aplikasi tertutup. */
const DAYS=7;
let msgs=null;
const loadMsgs=()=>msgs??=fetch("data/widget-messages.json").then(r=>r.json()).catch(()=>({}));
/* Waktu lokal lokasi (wall clock) diubah ke epoch milidetik */
const epoch=(d,hm,off)=>{const[h,m]=hm.split(":").map(Number);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),h,m)-off*6e4};
export async function buildPayload(l=loc()){
  const M=await loadMsgs(),slots=[];
  for(let i=0;i<DAYS;i++){
    const d=new Date();d.setDate(d.getDate()+i);
    const t=await timings(d,l),off=tzOffset(l,d);
    PRAYERS.forEach((id,k)=>{if(!/^\d/.test(t[id]))return;const list=M[id]||[];
      const text=list.length?list[(i*PRAYERS.length+k)%list.length]:"";
      slots.push({at:epoch(d,t[id],off),prayer:NAMES.find(x=>x[0]===id)[1],time:t[id],text})});
  }
  return{updated:Date.now(),location:`${l.name} · ${tzLabel(tzOffset(l))}`,slots};
}
/* Dikirim ke bagian native lewat plugin KLWidget. Di browser biasa tidak melakukan apa-apa */
export async function pushWidget(){
  const plug=window.Capacitor?.Plugins?.KLWidget;if(!plug)return;
  try{await plug.setData({json:JSON.stringify(await buildPayload())})}catch(e){console.warn("widget:",e)}
}
