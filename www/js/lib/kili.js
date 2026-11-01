import {get,toast} from "../store.js";
import {esc} from "./ui.js";
import {hijriText,masehiText,key as dkey} from "./hijri.js";
import {loc,wallNow,timings,nextOf} from "./prayer.js";
import {progress} from "./ibadah.js";
/* Kili AI: asisten melayang. Tiga keadaan: ✨ kecil (min), kartu (open), dan layar penuh (max). Bisa digeser seperti Tasbih melayang.
   Konteks halaman dan data pengguna dikirim bersama pertanyaan. Riwayat chat hanya di memori. */
const ON="kl_ai_on",POS="kl_ai_pos",WAIT=2500;
const LABEL={beranda:"Beranda",absensi:"Absensi",rekap:"Rekap",kalender:"Kalender",shalat:"Shalat",koleksi:"Koleksi",quran:"Al-Qur'an",hadits:"Hadits",doa:"Do'a",dzikir:"Dzikir",mutiara:"Kata Mutiara",pesan:"Pesan",tasbih:"Tasbih",profil:"Profil"};
const pos=(()=>{try{return JSON.parse(localStorage.getItem(POS))||{x:12,y:150}}catch(e){return{x:12,y:150}}})();
const hist=[];
let el,bub,card,msgs,input,st="off",busy=false;
const place=()=>{el.style.right=pos.x+"px";el.style.bottom=pos.y+"px"};
const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/^- /gm,"• ").replace(/\n/g,"<br>");
const scroll=()=>msgs.scrollTo({top:msgs.scrollHeight,behavior:"smooth"});
const add=(cls,html)=>{const d=document.createElement("div");d.className="kili-msg "+cls;d.innerHTML=html;msgs.appendChild(d);scroll();return d};
const withWait=(p,fb)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(fb),WAIT))]);
/* Ringkasan kondisi saat ini untuk AI: halaman, tanggal, salat berikutnya, progres ibadah, dan Qur'an */
async function context(){
  const now=new Date(),route=(location.hash.replace(/^#\/?/,"")||"beranda").split("/")[0],p=get("profil",{}),last=get("quran_last"),bm=get("qbm",{});
  const w=wallNow(),next=await withWait(timings(w).then(t=>{const n=nextOf(t,w);return n?`${n.nm} pukul ${n.time} (±${Math.round(n.ms/60000)} menit lagi)`:"sudah lewat untuk hari ini"}).catch(()=>"tidak tersedia"),"tidak tersedia");
  const pg=progress(dkey(now));
  return [
    `Nama pengguna: ${p.name||"belum diisi"}`,
    `Halaman yang sedang dibuka: ${LABEL[route]||route}`,
    `Tanggal hari ini: ${masehiText(now)} / ${hijriText(now)}`,
    `Lokasi shalat: ${loc().name}. Shalat berikutnya: ${next}`,
    `Agenda ibadah hari ini: ${pg.filled}/${pg.total} terisi, ${pg.done} terlaksana (${pg.pct}%)`,
    `Al-Qur'an terakhir dibaca: ${last?`${last.nama} ayat ${last.ayat}`:"belum ada"}. Bookmark Qur'an: ${(bm.items||[]).length} ayat`
  ].join("\n");
}
async function send(text){
  if(!text||busy)return;busy=true;
  hist.push({role:"user",content:text});add("me",fmt(text));input.value="";
  const wait=add("ai muted",'<span class="dots"><i></i><i></i><i></i></span>');
  try{
    const user=window.__klAuth?.currentUser;
    if(!user)throw new Error("Masuk ke akun dulu (Profil › Akun) untuk memakai Kili AI");
    const token=await user.getIdToken();
    const ctx=await context().catch(()=>"");
    const r=await fetch("api/ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({messages:hist.slice(-10),context:ctx})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.error||"Gagal menghubungi Kili AI");
    hist.push({role:"assistant",content:j.reply});
    wait.className="kili-msg ai";wait.innerHTML=fmt(j.reply);
  }catch(e){
    hist.pop();
    wait.className="kili-msg ai err";
    wait.textContent=location.protocol==="file:"?"Buka aplikasi lewat server, bukan file.":navigator.onLine?e.message:"Kili AI butuh koneksi internet.";
  }
  scroll();busy=false;
}
/* Pastikan kartu atau bubble tidak keluar layar */
function clampPos(){const w=st==="open"?card.offsetWidth:bub.offsetWidth,h=st==="open"?card.offsetHeight:bub.offsetHeight;pos.x=Math.min(Math.max(8,pos.x),innerWidth-w-8);pos.y=Math.min(Math.max(8,pos.y),innerHeight-h-8);place()}
function setSt(s){
  const prev=st;st=s;el.dataset.s=s;
  localStorage.setItem(ON,s==="off"?"0":"1");
  if(s==="open"||s==="min")clampPos();
  if(s!==prev)document.dispatchEvent(new CustomEvent("kl-ai",{detail:{on:s!=="off"}}));
}
const open=()=>setSt("open"),minimize=()=>setSt("min"),maximize=()=>setSt(st==="max"?"open":"max");
const close=()=>{setSt("off");toast("Kili AI disembunyikan")};
const toggle=()=>st==="off"?open():close();
/* Geser dengan pointer (mouse dan sentuh). Tanpa geseran, ketukan dianggap tap */
function dragger(handle){
  let d=null,moved=false;
  handle.onpointerdown=e=>{if(handle!==bub&&e.target.closest("button"))return;d={x:e.clientX,y:e.clientY,ox:pos.x,oy:pos.y};moved=false;handle.setPointerCapture(e.pointerId)};
  handle.onpointermove=e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!moved&&Math.hypot(dx,dy)<6)return;moved=true;
    const w=st==="open"?card.offsetWidth:bub.offsetWidth,h=st==="open"?card.offsetHeight:bub.offsetHeight;
    pos.x=Math.min(Math.max(8,d.ox-dx),innerWidth-w-8);pos.y=Math.min(Math.max(8,d.oy-dy),innerHeight-h-8);place()};
  handle.onpointerup=()=>{if(!d)return;const was=moved;d=null;if(was){handle.dataset.moved="1";localStorage.setItem(POS,JSON.stringify(pos))}};
}
export function initKili(){
  el=document.createElement("div");el.id="kili";el.dataset.s="off";
  el.innerHTML=`<button class="kili-bub" type="button" aria-label="Buka Kili AI" title="Kili AI">✨</button>
  <div class="kili-card" role="dialog" aria-label="Kili AI">
    <div class="kili-head" data-drag><span>✨ Kili AI</span><span class="kili-acts"><button type="button" data-max aria-label="Perbesar">⤢</button><button type="button" data-min aria-label="Kecilkan">–</button><button type="button" data-x aria-label="Tutup">✕</button></span></div>
    <div class="kili-msgs" data-m><div class="kili-msg ai">Assalamu'alaikum! Saya Kili, asisten Kisah Lillah. Tanyakan tentang ibadah, doa, atau cara memakai aplikasi.</div></div>
    <form class="kili-form" data-f><input data-in maxlength="1000" placeholder="Tulis pertanyaanmu…" autocomplete="off" aria-label="Pertanyaan"><button class="btn primary sm" type="submit">Kirim</button></form>
  </div>`;
  document.body.appendChild(el);
  bub=el.querySelector(".kili-bub");card=el.querySelector(".kili-card");msgs=el.querySelector("[data-m]");input=el.querySelector("[data-in]");
  place();
  el.querySelector("[data-min]").onclick=minimize;el.querySelector("[data-max]").onclick=maximize;el.querySelector("[data-x]").onclick=close;
  el.querySelector("[data-f]").onsubmit=e=>{e.preventDefault();send(input.value.trim())};
  dragger(bub);dragger(el.querySelector("[data-drag]"));
  bub.onclick=()=>{if(bub.dataset.moved){delete bub.dataset.moved;return}open()};
  bub.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}};
  addEventListener("resize",()=>{if(st==="open"||st==="min")clampPos()});
  window.KLAi={toggle,isOn:()=>st!=="off"};
  document.addEventListener("kl-ai-toggle",toggle);
  setSt(localStorage.getItem(ON)==="1"?"min":"off");
}
