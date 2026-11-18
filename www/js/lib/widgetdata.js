import {timings,PRAYERS,NAMES,loc,tzOffset,tzLabel,dhuhaOf} from "./prayer.js";
import {agendaFor,day} from "./ibadah.js";
import {key} from "./hijri.js";
import {get} from "../store.js";
/* Jadwal 7 hari ke depan dan kalimat pengingat untuk widget layar utama (Android dan iPhone).
   Widget membaca daftar ini langsung, jadi tetap berganti sesuai waktu meski aplikasi tertutup. */
const DAYS=7;
let msgs=null;
const loadMsgs=()=>msgs??=fetch("data/widget-messages.json").then(r=>r.json()).catch(()=>({}));
/* Waktu lokal lokasi (wall clock) diubah ke epoch milidetik */
const epoch=(d,hm,off)=>{const[h,m]=hm.split(":").map(Number);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),h,m)-off*6e4};
/* Pengingat ibadah harian: [waktu acuan, selisih menit, judul, isi, hanya hari (0=Ahad … 6=Sabtu)].
   Muncul 3 kali tiap 5 menit, lalu berhenti. Tidak muncul bila ibadah itu sudah dicatat di absensi hari itu. */
const INGAT={
  tahajjud:["Fajr",-60,"Waktunya shalat Tahajjud","Sepertiga malam terakhir, waktu terbaik untuk bermunajat."],
  sahur:["Imsak",-40,"Waktunya sahur","Sahur untuk puasa sunnah hari ini. Ada berkah di dalamnya.",[1,4]],
  dzikir_pagi:["Fajr",20,"Waktunya dzikir pagi","Awali hari dengan dzikir pagi."],
  ar_rahman:["Fajr",40,"Waktunya membaca Ar-Rahman","Luangkan waktu membaca surat Ar-Rahman."],
  dhuha:["Dhuha",0,"Waktunya shalat Dhuha","Sempatkan shalat Dhuha, walau dua rakaat."],
  al_kahfi:["Dhuha",30,"Waktunya membaca Al-Kahfi","Hari Jumat, saatnya membaca surat Al-Kahfi."],
  sedekah:["Dhuhr",30,"Sudah bersedekah hari ini?","Sedekah tidak mengurangi harta. Sedikit pun berarti."],
  dzikir_petang:["Asr",20,"Waktunya dzikir petang","Tutup sore dengan dzikir petang."],
  al_waqiah:["Maghrib",15,"Waktunya membaca Al-Waqi'ah","Luangkan waktu membaca surat Al-Waqi'ah."],
  yasin:["Maghrib",25,"Waktunya membaca Yasin","Malam Jumat, saatnya membaca surat Yasin."],
  tadarus:["Isha",20,"Waktunya tadarus","Lanjutkan bacaan Al-Qur'an hari ini."],
  al_mulk:["Isha",60,"Waktunya membaca Al-Mulk","Bacalah Al-Mulk sebelum tidur."],
  witir:["Isha",90,"Waktunya shalat Witir","Tutup malam dengan shalat Witir sebelum tidur."]};
export const ULANG=3,JEDA=5;
export async function buildPayload(l=loc()){
  const M=await loadMsgs(),slots=[],extra=[],ibadah=[],ingat=get("ibadah_ingat",true)!==false,now=Date.now();
  for(let i=0;i<DAYS;i++){
    const d=new Date();d.setDate(d.getDate()+i);
    const t=await timings(d,l),off=tzOffset(l,d);
    PRAYERS.forEach((id,k)=>{if(!/^\d/.test(t[id]))return;const list=M[id]||[];
      const text=list.length?list[(i*PRAYERS.length+k)%list.length]:"";
      slots.push({at:epoch(d,t[id],off),prayer:NAMES.find(x=>x[0]===id)[1],time:t[id],text})});
    /* Imsak, Terbit, Dhuha: hanya untuk pengingat (alarm native), tidak tampil di widget */
    [["Imsak","Imsak",t.Imsak],["Sunrise","Terbit",t.Sunrise],["Dhuha","Dhuha",dhuhaOf(t,l)]].forEach(([id,nm,v])=>{if(/^\d/.test(v||""))extra.push({at:epoch(d,v,off),prayer:nm,time:v})});
    if(ingat){const k=key(d),rec=day(k),acuan={...t,Dhuha:dhuhaOf(t,l)};
      agendaFor(k).forEach(it=>{const r=INGAT[it.id];if(!r||rec[it.id]!=null)return;const[ref,sel,judul,isi,hari]=r;
        if(hari&&!hari.includes(d.getDay())||!/^\d/.test(acuan[ref]||""))return;
        const t0=epoch(d,acuan[ref],off)+sel*6e4;
        for(let n=0;n<ULANG;n++){const at=t0+n*JEDA*6e4;if(at>now)ibadah.push({at,judul,isi:n?`${isi} (pengingat ${n+1}/${ULANG})`:isi,tag:`${it.id}-${k}`})}})}
  }
  return{updated:Date.now(),location:`${l.name} · ${tzLabel(tzOffset(l))}`,slots,extra,ibadah:ibadah.sort((a,b)=>a.at-b.at)};
}
/* Dikirim ke bagian native lewat plugin KLWidget. Di browser biasa tidak melakukan apa-apa */
export async function pushWidget(){
  const plug=window.Capacitor?.Plugins?.KLWidget;if(!plug)return;
  try{await plug.setData({json:JSON.stringify(await buildPayload())})}catch(e){console.warn("widget:",e)}
}
