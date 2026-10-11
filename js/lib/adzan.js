import {get,set,toast} from "../store.js";
import {loc,upcoming} from "./prayer.js";
/* Pengingat berjalan selama aplikasi/tab terbuka. Saat aplikasi benar-benar tertutup butuh push server (FCM). */
export const NAMA={Fajr:"Subuh",Dhuhr:"Dzuhur",Asr:"Ashar",Maghrib:"Maghrib",Isha:"Isya"};
export const settings=()=>({notif:false,sound:false,...get("adzan",{})});
export const save=s=>set("adzan",{...settings(),...s});
let timer=null,audio=null,seq=0;
export function stop(){if(audio){audio.pause();audio=null}}
export function play(subuh){stop();audio=new Audio(subuh?"assets/audio/adzan-subuh.mp3":"assets/audio/adzan.mp3");return audio.play().catch(()=>toast("Browser menahan suara. Ketuk layar sekali lalu coba lagi."))}
const opts=id=>({body:`Waktu ${NAMA[id]} telah tiba untuk wilayah ${loc().name}.`,icon:"assets/logo.png",badge:"assets/logo.png",tag:"adzan-"+id,renotify:true,data:{url:"./#/shalat"}});
export async function fire(id){
  const s=settings();toast("Waktu "+(NAMA[id]||id)+" telah tiba");
  if(s.notif&&"Notification"in window&&Notification.permission==="granted"){
    try{const r=await navigator.serviceWorker?.ready;if(r?.showNotification)await r.showNotification("Waktu "+NAMA[id],opts(id));else new Notification("Waktu "+NAMA[id],opts(id))}catch(e){try{new Notification("Waktu "+NAMA[id],opts(id))}catch(_){}}}
  if(s.sound)play(id==="Fajr")}
export const test=()=>fire("Dhuhr");
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
  if(s.notif&&Notification.permission==="granted"&&typeof TimestampTrigger!=="undefined"){
    try{const r=await navigator.serviceWorker?.ready;await r?.showNotification("Waktu "+n.nm,{...opts(n.id),showTrigger:new TimestampTrigger(Date.now()+n.ms)})}catch(e){}}
  timer=setTimeout(async()=>{await fire(n.id);setTimeout(schedule,1500)},Math.min(Math.max(n.ms,500),2147483000))}
