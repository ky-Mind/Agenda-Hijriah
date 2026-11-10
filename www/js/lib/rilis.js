/* Rilis APK terbaru (GitHub) + jendela ajakan di depan layar:
   - Situs web (browser apa pun): "Pasang aplikasi Kisah Lillah" (unduh APK) SETIAP kali situs dibuka.
   - Aplikasi Android (APK) versi lama: "Pembaruan tersedia" dengan tombol Update SETIAP kali aplikasi dibuka / kembali dibuka
     (paling sering 30 menit sekali), plus notifikasi Android sekali per versi baru.
   Info rilis disimpan 6 jam (kl_rilis) agar tidak memanggil GitHub terus-menerus. */
import {esc} from "./ui.js";
const REPO="https://api.github.com/repos/ky-Mind/Agenda-Hijriah/releases/latest",HAL="https://github.com/ky-Mind/Agenda-Hijriah/releases/latest";
export const lebihBaru=(a,b)=>{const x=String(a).split(".").map(Number),y=String(b).split(".").map(Number);for(let i=0;i<3;i++)if((x[i]||0)!==(y[i]||0))return(x[i]||0)>(y[i]||0);return false};
export async function terbaru(){
  let r=null;try{r=JSON.parse(localStorage.getItem("kl_rilis")||"null")}catch(e){}
  if(r&&r.v&&Date.now()-r.t<6*36e5)return r;
  try{const j=await fetch(REPO,{cache:"no-store"}).then(x=>x.ok?x.json():null);if(!j)return r;
    const a=(j.assets||[]).find(x=>/\.apk$/i.test(x.name));
    r={v:String(j.tag_name||"").replace(/^v/,""),url:a?a.browser_download_url:HAL,mb:a?(a.size/1048576).toFixed(1):"",t:Date.now()};
    localStorage.setItem("kl_rilis",JSON.stringify(r))}catch(e){}
  return r}
const hp=()=>/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const tunggu=t=>new Promise(r=>setTimeout(r,t));
/* Tunggu sampai tidak ada jendela lain (mis. Selamat datang) */
export async function giliran(){for(let i=0;i<120&&document.querySelector(".modal");i++)await tunggu(1000)}
function jendela({judul,teks,poin,tombol,url,info}){
  const m=document.createElement("div");m.className="modal rilis-m";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label",judul);
  m.innerHTML=`<div class="box"><div class="rilis-h"><img src="assets/logo.png" alt=""><div><h2>${esc(judul)}</h2><small class="muted">${esc(info)}</small></div></div>
    <p style="margin:10px 0 8px">${esc(teks)}</p><ul class="rilis-p">${poin.map(p=>`<li>${esc(p)}</li>`).join("")}</ul>
    <div class="dlg-actions"><button class="btn" data-a="nanti">Nanti saja</button><a class="btn primary" data-a="ok" href="${esc(url)}" target="_blank" rel="noopener">${esc(tombol)}</a></div></div>`;
  document.body.appendChild(m);
  const tutup=()=>m.remove();
  m.onclick=e=>{const b=e.target.closest("[data-a]");if(e.target===m||b?.dataset.a==="nanti")return tutup();if(b?.dataset.a==="ok")setTimeout(tutup,300)};
}
let terakhir=0;
export async function cekRilis(){
  try{
    if(Date.now()-terakhir<30*6e4||document.querySelector(".rilis-m"))return;
    const apk=window.KLAndroid?.versi?.()||"";
    const r=await terbaru();if(!r||!r.v)return;
    if(apk&&!lebihBaru(r.v,apk))return;
    terakhir=Date.now();
    if(apk&&localStorage.getItem("kl_rilis_notif")!==r.v){localStorage.setItem("kl_rilis_notif",r.v);try{window.KLAndroid.notif("Pembaruan Kisah Lillah "+r.v,"Versi baru sudah rilis. Buka aplikasi lalu ketuk Update sekarang.")}catch(e){}}
    await tunggu(2500);await giliran();if(document.querySelector(".rilis-m"))return;
    if(apk)jendela({judul:"Pembaruan tersedia",info:`Versi ${r.v}${r.mb?" · "+r.mb+" MB":""} · kamu memakai ${apk}`,
      teks:"Versi baru Kisah Lillah sudah rilis. Perbarui agar mendapat fitur dan perbaikan terbaru.",
      poin:["Ketuk Update untuk mengunduh, lalu buka file-nya dan pilih Perbarui","Data dan akunmu tetap aman"],tombol:"Update sekarang",url:r.url});
    else jendela({judul:"Pasang aplikasi Kisah Lillah",info:`Aplikasi Android · versi ${r.v}${r.mb?" · "+r.mb+" MB":""}`,
      teks:hp()?"Lebih lengkap dari versi browser:":"Untuk HP Android. Buka situs ini di HP lalu unduh, atau unduh sekarang dan kirim file-nya ke HP:",
      poin:["Adzan tetap berbunyi walau aplikasi ditutup dan layar mati","Notifikasi pesan masuk di latar belakang","Widget jadwal shalat di layar utama","Bisa dibuka tanpa internet"],tombol:"Unduh APK",url:r.url});
  }catch(e){}
}
/* APK: dibuka lagi dari latar belakang -> periksa lagi */
addEventListener("kl-android-kembali",()=>cekRilis());
