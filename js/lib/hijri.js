import {get} from "../store.js";
export const BULAN=["Muharram","Safar","Rabiul Awal","Rabiul Akhir","Jumadil Awal","Jumadil Akhir","Rajab","Syaban","Ramadhan","Syawal","Dzulqaidah","Dzulhijjah"];
export const HARI=["Ahad","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
export const MASEHI=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const f=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"numeric",year:"numeric"});
export function hijri(date){const d=new Date(date.getTime()+(get("hijri_offset",0))*864e5);const p=Object.fromEntries(f.formatToParts(d).map(x=>[x.type,x.value]));return{d:+p.day,m:+p.month,y:parseInt(p.year)}}
export const hijriText=date=>{const h=hijri(date);return `${h.d} ${BULAN[h.m-1]} ${h.y} H`};
export const masehiText=date=>`${HARI[date.getDay()]}, ${date.getDate()} ${MASEHI[date.getMonth()]} ${date.getFullYear()}`;
export const key=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export const fromKey=k=>{const[a,b,c]=k.split("-").map(Number);return new Date(a,b-1,c)};
const EV={"1-1":"Tahun Baru Hijriah","10-1":"Asyura (puasa sunnah)","12-3":"Maulid Nabi","27-7":"Isra Mi'raj","15-8":"Nisfu Syaban","1-9":"Awal Ramadhan","17-9":"Nuzulul Qur'an","1-10":"Idul Fitri","9-12":"Hari Arafah (puasa sunnah)","10-12":"Idul Adha"};
export function events(date){const h=hijri(date),o=[];const e=EV[`${h.d}-${h.m}`];if(e)o.push(e);
  if([13,14,15].includes(h.d)&&h.m!==12)o.push("Ayyamul Bidh (puasa sunnah)");
  if([1,4].includes(date.getDay()))o.push("Puasa sunnah "+HARI[date.getDay()]);
  if(date.getDay()===5)o.push("Hari Jumat");return o}
/* Seluruh tanggal (Masehi) dalam bulan Hijriah yang memuat `anchor`. */
export function hijriMonth(anchor){
  const h=hijri(anchor),s=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()-(h.d-1)),days=[];
  for(let i=0;i<31;i++){const d=new Date(s.getFullYear(),s.getMonth(),s.getDate()+i),x=hijri(d);if(x.m!==h.m||x.y!==h.y)break;days.push(d)}
  return{start:s,days,m:h.m,y:h.y}}
export const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);

export function nextEvent(from=new Date()){for(let i=0;i<420;i++){const d=addDays(from,i),h=hijri(d),e=EV[`${h.d}-${h.m}`];if(e)return{name:e,date:d,days:i}}return null}
