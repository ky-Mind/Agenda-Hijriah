import {get,set,toast} from "../store.js";
import {loc,upcoming} from "./prayer.js";
/* Pengingat berjalan selama aplikasi/tab terbuka. Saat aplikasi benar-benar tertutup butuh push server (FCM). */
export const NAMA={Fajr:"Subuh",Dhuhr:"Dzuhur",Asr:"Ashar",Maghrib:"Maghrib",Isha:"Isya"};
export const settings=()=>({notif:false,sound:false,...get("adzan",{})});
export const save=s=>set("adzan",{...settings(),...s});
let timer=null,audio=null,seq=0;
export const swReady=()=>Promise.race([navigator.serviceWorker?navigator.serviceWorker.ready:null,new Promise(r=>setTimeout(()=>r(null),2000))]);
export function stop(){if(audio){audio.pause();audio=null}}
export function play(subuh){stop();audio=new Audio(subuh?"assets/audio/adzan-subuh.mp3":"assets/audio/adzan.mp3");return audio.play().catch(()=>toast("Browser menahan suara. Ketuk layar sekali lalu coba lagi."))}
/* icon = gambar besar berwarna; badge = ikon kecil bilah status: WAJIB siluet putih berlatar transparan (kalau tidak, Android menampilkannya sebagai kotak putih). */
const abs=p=>new URL(p,location.href).href;
const opts=id=>({body:`Waktu ${NAMA[id]} telah tiba untuk wilayah ${loc().name}.`,icon:abs("assets/icon-192.png"),badge:abs("assets/badge-96.png"),tag:"adzan-"+id,renotify:true,lang:"id",vibrate:[200,100,200,100,300],timestamp:Date.now(),data:{url:abs("./#/shalat")}});
export async function fire(id,force){
  const s=settings();toast("Waktu "+(NAMA[id]||id)+" telah tiba");
  if((s.notif||force)&&"Notification"in window&&Notification.permission==="granted"){
    try{const r=await swReady();if(r?.showNotification)await r.showNotification("Waktu "+NAMA[id],opts(id));else new Notification("Waktu "+NAMA[id],opts(id))}catch(e){try{new Notification("Waktu "+NAMA[id],opts(id))}catch(_){}}}
  if(s.sound||force)play(id==="Fajr")}
export const test=kind=>fire(kind==="subuh"?"Fajr":"Dhuhr",true);
export async function enable(){
  if(!("Notification"in window))return"unsupported";
  if(!isSecureContext)return"insecure";
  let p=Notification.permission;if(p==="default")p=await Notification.requestPermission();return p}
/* Jadwalkan shalat berikutnya; setelah berbunyi, jadwalkan lagi. */
export async function schedule(){
  clearTimeout(timer);const my=++seq,s=settings();if(!s.notif&&!s.sound)return;
  let n;try{n=await upcoming(loc())}catch(e){return}
  if(my!==seq)return;
  /* Notification Triggers (Chrome tertentu): notifikasi tetap tampil walau tab tidak aktif */
  if(s.notif&&!(s.off||{})[n.id]&&Notification.permission==="granted"&&typeof TimestampTrigger!=="undefined"){
    try{const r=await navigator.serviceWorker?.ready;await r?.showNotification("Waktu "+n.nm,{...opts(n.id),showTrigger:new TimestampTrigger(Date.now()+n.ms)})}catch(e){}}
  timer=setTimeout(async()=>{if(!(settings().off||{})[n.id])await fire(n.id);setTimeout(schedule,1500)},Math.min(Math.max(n.ms,500),2147483000))}
