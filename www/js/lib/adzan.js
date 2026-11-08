import {get,set,toast} from "../store.js";
import {loc,timings,wallNow,WAKTU,TAMBAHAN,dhuhaOf} from "./prayer.js";
/* Pengingat berjalan selama aplikasi/tab terbuka. Saat aplikasi benar-benar tertutup butuh push server (FCM). */
export const NAMA={Imsak:"Imsak",Fajr:"Subuh",Sunrise:"Terbit",Dhuha:"Dhuha",Dhuhr:"Dzuhur",Asr:"Ashar",Maghrib:"Maghrib",Isha:"Isya"};
/* Mode tiap waktu: adzan (notifikasi + suara adzan) · notif (notifikasi berbunyi biasa) · senyap (notifikasi tanpa bunyi) · off.
   Imsak, Terbit, Dhuha tidak memakai adzan. Bila belum pernah diatur, mengikuti pengaturan lama (sound/off). */
export const MODE=[["adzan","Adzan"],["notif","Notif"],["senyap","Senyap"],["off","Mati"]];
export function modeOf(id,s=settings()){const m=(s.mode||{})[id];if(m&&!(m==="adzan"&&TAMBAHAN.includes(id)))return m;if(TAMBAHAN.includes(id))return"off";if((s.off||{})[id])return"off";return s.sound?"adzan":"notif"}
export const ISI={Imsak:"Waktu imsak telah tiba. Segera akhiri sahur.",Sunrise:"Matahari terbit, waktu Subuh telah berakhir.",Dhuha:"Waktu shalat Dhuha telah tiba."};
export const settings=()=>({notif:false,sound:false,...get("adzan",{})});
export const save=s=>set("adzan",{...settings(),...s});
let timer=null,audio=null,seq=0;
export const swReady=()=>Promise.race([navigator.serviceWorker?navigator.serviceWorker.ready:null,new Promise(r=>setTimeout(()=>r(null),2000))]);
export function stop(){if(audio){audio.pause();audio=null}}
export function play(subuh){stop();audio=new Audio(subuh?"assets/audio/adzan-subuh.mp3":"assets/audio/adzan.mp3");return audio.play().catch(()=>toast("Browser menahan suara. Ketuk layar sekali lalu coba lagi."))}
/* icon = gambar besar berwarna; badge = ikon kecil bilah status: WAJIB siluet putih berlatar transparan (kalau tidak, Android menampilkannya sebagai kotak putih). */
const abs=p=>new URL(p,location.href).href;
const opts=(id,senyap)=>({silent:!!senyap,body:ISI[id]||`Waktu ${NAMA[id]} telah tiba untuk wilayah ${loc().name}.`,icon:abs("assets/icon-192.png"),badge:abs("assets/badge-96.png"),tag:"adzan-"+id,renotify:true,lang:"id",vibrate:[200,100,200,100,300],timestamp:Date.now(),data:{url:abs("./#/shalat")}});
export async function fire(id,force){
  const s=settings(),m=force?"adzan":modeOf(id,s);if(m==="off")return;toast("Waktu "+(NAMA[id]||id)+" telah tiba");
  if((s.notif||force)&&"Notification"in window&&Notification.permission==="granted"){
    const o=opts(id,m==="senyap");
    try{const r=await swReady();if(r?.showNotification)await r.showNotification("Waktu "+NAMA[id],o);else new Notification("Waktu "+NAMA[id],o)}catch(e){try{new Notification("Waktu "+NAMA[id],o)}catch(_){}}}
  if(m==="adzan"&&(s.sound||force||s.mode))play(id==="Fajr")}
export const test=kind=>fire(kind==="subuh"?"Fajr":"Dhuhr",true);
export async function enable(){
  if(!("Notification"in window))return"unsupported";
  if(!isSecureContext)return"insecure";
  let p=Notification.permission;if(p==="default")p=await Notification.requestPermission();return p}
/* Jadwalkan waktu berikutnya yang tidak dimatikan (termasuk Imsak/Terbit/Dhuha bila diaktifkan); setelah berbunyi, jadwalkan lagi. */
async function berikutnya(s){const l=loc(),w=wallNow(l),c=w.getHours()*60+w.getMinutes()+w.getSeconds()/60;
  for(let d=0;d<2;d++){const tg=new Date(w);tg.setDate(tg.getDate()+d);const t=await timings(tg,l);t.Dhuha=dhuhaOf(t,l);
    let best=null;for(const [id] of WAKTU){if(modeOf(id,s)==="off")continue;const m=/^(\d+):(\d+)/.exec(t[id]||"");if(!m)continue;const x=+m[1]*60+ +m[2]+d*1440;if(x>c&&(!best||x<best.x))best={id,x}}
    if(best)return{id:best.id,ms:Math.round((best.x-c)*6e4)}}
  return null}
export async function schedule(){
  clearTimeout(timer);const my=++seq,s=settings();if(!s.notif&&!s.sound)return;
  let n;try{n=await berikutnya(s)}catch(e){return}
  if(!n||my!==seq)return;
  /* Notification Triggers (Chrome tertentu): notifikasi tetap tampil walau tab tidak aktif */
  if(s.notif&&Notification.permission==="granted"&&typeof TimestampTrigger!=="undefined"){
    try{const r=await navigator.serviceWorker?.ready;await r?.showNotification("Waktu "+NAMA[n.id],{...opts(n.id,modeOf(n.id,s)==="senyap"),showTrigger:new TimestampTrigger(Date.now()+n.ms)})}catch(e){}}
  timer=setTimeout(async()=>{await fire(n.id);setTimeout(schedule,1500)},Math.min(Math.max(n.ms,500),2147483000))}
