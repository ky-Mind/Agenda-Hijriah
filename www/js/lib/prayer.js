import {get,set} from "../store.js";
export const CITIES={Jakarta:[-6.2088,106.8456,420],Bandung:[-6.9175,107.6191,420],Bogor:[-6.595,106.8166,420],Semarang:[-6.9667,110.4167,420],Yogyakarta:[-7.7956,110.3695,420],Surabaya:[-7.2575,112.7521,420],Malang:[-7.9666,112.6326,420],Denpasar:[-8.65,115.2167,480],Medan:[3.5952,98.6722,420],Palembang:[-2.9761,104.7754,420],Pekanbaru:[0.5071,101.4478,420],Padang:[-0.9471,100.4172,420],Banjarmasin:[-3.3186,114.5944,480],Pontianak:[-0.0263,109.3425,420],Balikpapan:[-1.2379,116.8529,480],Makassar:[-5.1477,119.4327,480],Manado:[1.4748,124.8421,480],Jayapura:[-2.5337,140.7181,540]};
export const NAMES=[["Imsak","Imsak"],["Fajr","Subuh"],["Sunrise","Terbit"],["Dhuhr","Dzuhur"],["Asr","Ashar"],["Maghrib","Maghrib"],["Isha","Isya"]];
export const PRAYERS=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
export const loc=()=>get("loc",{name:"Bandung",lat:CITIES.Bandung[0],lng:CITIES.Bandung[1],tz:420});
export const setLoc=l=>{set("loc",l);document.dispatchEvent(new CustomEvent("kl-loc"))};
/* Zona waktu lokasi (menit dari UTC): tersimpan > aturan WIB/WITA/WIT untuk Indonesia > zona perangkat */
export function tzOffset(l=loc(),date=new Date()){
  if(typeof l.tz==="number")return l.tz;
  if(l.lat>-11.5&&l.lat<6.5&&l.lng>94&&l.lng<141.5)return l.lng<114.5?420:l.lng<127?480:540;
  return -date.getTimezoneOffset()}
export const tzLabel=o=>o===420?"WIB":o===480?"WITA":o===540?"WIT":"UTC"+(o>=0?"+":"−")+Math.abs(o/60);
/* Jam dinding di lokasi, dinyatakan sebagai Date lokal (hanya gunakan field jam/tanggalnya) */
export function wallNow(l=loc()){const t=Date.now();return new Date(t+new Date(t).getTimezoneOffset()*6e4+tzOffset(l)*6e4)}
const hm=s=>String(s).slice(0,5);
const fmt=m=>{if(m==null||!isFinite(m))return"--:--";m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
/* Perhitungan lokal (tanpa internet): sudut Subuh 20°, Isya 18° (Kemenag), Ashar mazhab Syafi'i, ihtiyat 2 menit. */
export function localTimes(date,l=loc()){
  const R=Math.PI/180,off=tzOffset(l,date);
  const doy=Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(date.getFullYear(),0,0))/864e5),g=2*Math.PI/365*(doy-1);
  const eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const phi=l.lat*R,noon=720-4*l.lng-eq+off;
  const span=z=>{const c=(Math.cos(z*R)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec));return c>1||c<-1?null:Math.acos(c)/R*4};
  const asrAlt=Math.atan(1/(1+Math.tan(Math.abs(phi-dec))))/R;
  const f=span(110),s=span(90.833),a=span(90-asrAlt),i=span(108),n=(x,d)=>x==null?null:noon+d*x;
  const fajr=n(f,-1);
  return{Imsak:fmt(fajr!=null?fajr+2-10:null),Fajr:fmt(fajr!=null?fajr+2:null),Sunrise:fmt(n(s,-1)!=null?n(s,-1)-2:null),Dhuhr:fmt(noon+2),Asr:fmt(n(a,1)!=null?n(a,1)+2:null),Maghrib:fmt(n(s,1)!=null?n(s,1)+2:null),Isha:fmt(n(i,1)!=null?n(i,1)+2:null)}}
async function fetchMonth(y,m,l){
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),9000);
  try{const r=await fetch(`https://api.aladhan.com/v1/calendar/${y}/${m}?latitude=${l.lat}&longitude=${l.lng}&method=20`,{signal:ac.signal});
    if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json(),days={};
    for(const it of j.data||[]){const d=parseInt(it.date.gregorian.day),t={};for(const[id]of NAMES)t[id]=hm(it.timings[id]);days[d]=t}
    if(!Object.keys(days).length)throw new Error("kosong");return days}finally{clearTimeout(tm)}}
export async function monthTimings(y,m,l=loc()){
  const k=`cache_pm_${y}_${m}_${l.lat.toFixed(2)}_${l.lng.toFixed(2)}`,c=get(k);if(c)return{days:c,src:"api"};
  try{const days=await fetchMonth(y,m,l);set(k,days);return{days,src:"api"}}catch(e){
    const n=new Date(y,m,0).getDate(),days={};for(let d=1;d<=n;d++)days[d]=localTimes(new Date(y,m-1,d),l);return{days,src:"local"}}}
/* Waktu shalat sebuah tanggal. Mengutamakan Aladhan (Kemenag); bila gagal memakai perhitungan lokal. */
export async function timings(date,l=loc()){
  const {days,src}=await monthTimings(date.getFullYear(),date.getMonth()+1,l),t=days[date.getDate()]||localTimes(date,l);
  return{...t,_src:days[date.getDate()]?src:"local",_off:tzOffset(l,date)}}
const at=(s,w)=>{const[h,m]=s.split(":").map(Number),d=new Date(w);d.setHours(h,m,0,0);return d};
export function nextOf(t,w){for(const id of PRAYERS){if(!/^\d/.test(t[id]))continue;const d=at(t[id],w);if(d>w)return{id,nm:NAMES.find(n=>n[0]===id)[1],time:t[id],ms:d-w}}return null}
/* Shalat berikutnya (hari ini, atau Subuh besok bila hari ini sudah habis) */
export async function upcoming(l=loc()){
  const w=wallNow(l),t=await timings(w,l),n=nextOf(t,w);if(n)return{...n,t};
  const tm=new Date(w);tm.setDate(tm.getDate()+1);const t2=await timings(tm,l);
  return{id:"Fajr",nm:"Subuh",time:t2.Fajr,ms:at(t2.Fajr,tm)-w,tomorrow:true,t:t2}}
export const KAABA=[21.4225,39.8262];
export function bearing(l){const r=x=>x*Math.PI/180,[a,b]=KAABA,dl=r(b-l.lng);const y=Math.sin(dl)*Math.cos(r(a)),x=Math.cos(r(l.lat))*Math.sin(r(a))-Math.sin(r(l.lat))*Math.cos(r(a))*Math.cos(dl);return(Math.atan2(y,x)*180/Math.PI+360)%360}
export function distance(l){const r=x=>x*Math.PI/180,[a,b]=KAABA,dp=r(a-l.lat),dl=r(b-l.lng);const h=Math.sin(dp/2)**2+Math.cos(r(l.lat))*Math.cos(r(a))*Math.sin(dl/2)**2;return Math.round(12742*Math.asin(Math.sqrt(h)))}
