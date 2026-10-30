import {get,toast} from "./store.js";
import {paint} from "./lib/avatar.js";
import {schedule} from "./lib/adzan.js";
import * as chat from "./lib/chat.js";
import * as push from "./lib/push.js";
import {confirmLeave,wait} from "./lib/ui.js";
import {onboard} from "./lib/onboard.js";
import {hijriText} from "./lib/hijri.js";
import {loc} from "./lib/prayer.js";
import {initKili} from "./lib/kili.js";
const view=document.getElementById("view"),LABEL={beranda:"Beranda",absensi:"Absensi",rekap:"Rekap",kalender:"Kalender",shalat:"Shalat",koleksi:"Koleksi",quran:"Al-Qur'an",hadits:"Hadits",doa:"Do'a",dzikir:"Dzikir",mutiara:"Kata Mutiara",pesan:"Pesan",tasbih:"Tasbih",profil:"Profil"};
const PARENT={rekap:"absensi",quran:"koleksi",hadits:"koleksi",doa:"koleksi",dzikir:"koleksi",mutiara:"koleksi",tasbih:"koleksi"};
const html={},mods={};let cleanup=null,seq=0,shown=location.hash,skip=false;
window.KLGuard=null; /* halaman dapat mengisi {dirty(),save(),discard()} untuk menahan perpindahan saat ada perubahan belum tersimpan */
const loadHtml=n=>html[n]??=fetch(`pages/${n}.html`,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error(`pages/${n}.html (HTTP ${r.status})`);return r.text()}).catch(e=>{delete html[n];throw e});
const NOJS=new Set(["koleksi"]);
const loadMod=n=>NOJS.has(n)?Promise.resolve(null):mods[n]??=import(`./pages/${n}.js`).catch(e=>{console.error("Modul halaman gagal dimuat:",n,e);delete mods[n];return null});
const ROOTS=["beranda","absensi","kalender","shalat","koleksi","profil","pesan"],bar=document.getElementById("bar"),backBtn=document.getElementById("back"),ttl=document.getElementById("ttl"),root=document.documentElement;
const depth=(n,a)=>(n==="quran"||n==="pesan")&&a.length?2:ROOTS.includes(n)?0:1;let prev=null;
const backTarget=(n,a)=>(n==="quran"||n==="pesan")&&a.length?"#/"+n:PARENT[n]?"#/"+PARENT[n]:null;
function direction(n,a){const d=depth(n,a),i=ROOTS.indexOf(n);if(!prev)return"none";if(d>prev.d)return"fwd";if(d<prev.d)return"back";return d===0?(i>prev.i?"next":"prev"):"fwd"}
/* Bilah atas ponsel berbeda per halaman (ala Instagram): aksi khusus tiap halaman */
const ico=i=>`<svg class="ic"><use href="#i-${i}" /></svg>`;
const ACT={chat:()=>`<a class="icb chatb" href="#/pesan" aria-label="Pesan">${ico("chat")}<span class="nbadge" id="chatBadge" hidden></span></a>`,
  tasbih:()=>`<button class="icb" type="button" data-act="tasbih" aria-label="Tasbih melayang">${ico("beads")}</button>`,
  rekap:()=>`<a class="icb" href="#/rekap" aria-label="Rekap ibadah">${ico("chart")}</a>`,
  today:()=>`<button class="icb" type="button" data-act="today" aria-label="Ke hari ini">${ico("cal")}</button>`,
  gps:()=>`<button class="icb" type="button" data-act="gps" aria-label="Gunakan lokasi saya">${ico("gps")}</button>`,
  resume:()=>`<a class="icb" href="${get("quran_last")?`#/quran/${get("quran_last").surah}/${get("quran_last").ayat}`:"#/quran"}" aria-label="Lanjut membaca Al-Qur'an">${ico("bookmark")}</a>`,
  ai:()=>`<button class="icb" type="button" data-act="ai" aria-label="Asisten AI">${ico("sparkles")}</button>`,
  menu:()=>`<button class="icb" type="button" data-act="menu" aria-label="Menu pengaturan">${ico("menu")}</button>`};
const PAGE_ACTS={beranda:["tasbih","ai","chat"],absensi:["today","rekap"],kalender:["today"],shalat:["gps"],koleksi:["resume","ai","chat"],profil:["menu"]};
const barActs=document.getElementById("barActs"),ttlsub=document.getElementById("ttlsub");
const SUB={absensi:()=>hijriText(new Date()),kalender:()=>hijriText(new Date()),shalat:()=>loc().name};
function setBadge(){const n=chat.state.unread+chat.state.incoming;["nbPesan","chatBadge"].forEach(i=>{const b=document.getElementById(i);if(b){b.hidden=!n;b.textContent=n>99?"99+":n}})}
barActs.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const k=b.dataset.act;
  if(k==="tasbih")document.dispatchEvent(new CustomEvent("kl-ftasbih-toggle"));
  else if(k==="ai")document.dispatchEvent(new CustomEvent("kl-ai-toggle"));
  else if(k==="menu")document.dispatchEvent(new CustomEvent("kl-action",{detail:{name:"menu"}}));
  else view.querySelector(`[data-r="${k}"]`)?.click()});
view.addEventListener("scroll",()=>bar.classList.toggle("scrolled",view.scrollTop>6),{passive:true});
function paintBar(n,a){root.dataset.chat=n==="pesan"&&a.length?"1":"0";const r=ROOTS.includes(n)&&n!=="pesan";bar.dataset.root=r?"1":"0";root.dataset.nav=r?"1":"0";backBtn.hidden=r;backBtn.dataset.to=backTarget(n,a)||"#/beranda";ttl.textContent=LABEL[n];bar.dataset.page=r?n:"child";bar.classList.remove("scrolled");ttlsub.textContent=r&&SUB[n]?SUB[n]():"";barActs.innerHTML=r?(PAGE_ACTS[n]||[]).map(k=>ACT[k]()).join(""):"";setBadge()}
backBtn.addEventListener("click",()=>{location.hash=backBtn.dataset.to||"#/beranda"});
document.addEventListener("kl-title",e=>{if(bar.dataset.root==="0")ttl.textContent=e.detail});document.addEventListener("kl-loc",()=>{if(bar.dataset.page==="shalat")ttlsub.textContent=loc().name});
async function render(){
  const my=++seq,[name0,...args]=(location.hash.replace(/^#\/?/,"")||"beranda").split("/"),name=LABEL[name0]?name0:"beranda";
  document.querySelectorAll("[data-nav]").forEach(a=>{const on=a.dataset.nav===(document.querySelector(`[data-nav="${name}"]`)?name:(PARENT[name]||name));a.classList.toggle("on",on);on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
  document.title=LABEL[name]+" · Kisah Lillah";
  const dir=direction(name,args);prev={d:depth(name,args),i:ROOTS.indexOf(name)};
  const slow=setTimeout(()=>view.classList.add("busy"),160);
  let h,m,err="";try{[h,m]=await Promise.all([loadHtml(name),loadMod(name)])}catch(e){err=e.message;h=`<div class="wrap"><div class="empty"><p>Halaman tidak dapat dimuat.</p><p class="muted" style="font-size:12px;word-break:break-all">${String(err).replace(/</g,"&lt;")}</p><button class="btn sm mt" onclick="location.reload()">Muat ulang</button></div></div>`;m=null}
  clearTimeout(slow);if(my!==seq)return;
  const swap=()=>{
    if(cleanup){try{cleanup()}catch(e){}cleanup=null}
    window.KLGuard=null;view.onclick=null;view.oninput=null;view.innerHTML=h;view.scrollTop=0;view.classList.remove("busy");
    paintBar(name,args);
    const heading=view.querySelector("h1");
    if(heading&&ROOTS.includes(name)&&name!=="beranda")ttl.textContent=heading.textContent.trim();
    if(heading&&heading.textContent.trim()===ttl.textContent.trim())view.dataset.mobileTitle="header";
    else delete view.dataset.mobileTitle;
  };
  const run=()=>{try{if(m?.default)Promise.resolve(m.default(view,args)).then(c=>{if(my!==seq){try{c?.()}catch(e){}}else cleanup=c||null}).catch(e=>{console.error(e);toast("Terjadi kesalahan di halaman ini")});
    else if(!err&&m===null&&!NOJS.has(name))view.insertAdjacentHTML("afterbegin",'<div class="wrap"><div class="empty">Skrip halaman ini gagal dimuat. Muat ulang dengan Ctrl+Shift+R.</div></div>')}catch(e){console.error(e);toast("Terjadi kesalahan di halaman ini")}};
  root.dataset.dir=dir;
  /* Konten halaman meluncur dengan animasi #view (lihat css); bilah atas dan navigasi bawah langsung ikut berubah */
  swap();run();view.dataset.anim=dir;view.classList.remove("in");void view.offsetWidth;view.classList.add("in");
}
/* Penjaga navigasi: tahan perpindahan jika ada perubahan belum tersimpan, tanyakan Simpan / Lewati */
async function onHash(){
  const target=location.hash,g=window.KLGuard;
  if(skip||!g?.dirty?.()){skip=false;shown=target;return render()}
  history.replaceState(null,"",shown||"#/beranda");
  const a=await confirmLeave();
  if(a==="save"){if(await g.save()===false)return}else if(a==="discard"){g.discard?.()}else return;
  skip=true;location.hash=target;
}
addEventListener("hashchange",onHash);
view.addEventListener("click",e=>{if(e.target.closest("[data-retry]"))render()});
addEventListener("beforeunload",e=>{if(window.KLGuard?.dirty?.()){e.preventDefault();e.returnValue=""}});
document.addEventListener("kl-data-changed",()=>{if(window.KLGuard?.dirty?.())return;if(!view.contains(document.activeElement)||document.activeElement===view)render()});
document.getElementById("nav").addEventListener("pointerover",e=>{const a=e.target.closest("[data-nav]");if(a){const n=a.dataset.nav;loadHtml(n).catch(()=>{});loadMod(n)}});
const sy=document.getElementById("sync"),L={off:"Belum masuk",busy:"Menyimpan…",ok:"Tersimpan di cloud",err:"Gagal sinkron"};
document.addEventListener("kl-sync",e=>{sy.dataset.s=e.detail.s;sy.lastChild.textContent=e.detail.s==="err"&&e.detail.code==="permission-denied"?"Rules Firestore menolak":L[e.detail.s]});document.addEventListener("kl-legacy",e=>toast(`Data lama Agenda diimpor${e.detail.days?` (${e.detail.days} hari)`:""}`));
const av=[document.getElementById("meAv"),document.getElementById("meAv2")],meName=document.getElementById("meName");
function paintMe(){const p=get("profil",{}),u=window.__klAuth?.currentUser,n=p.name||u?.displayName||"Tamu";av.forEach(a=>paint(a,n,p.photo||u?.photoURL));meName.textContent=n}
["kl-profile","kl-data-changed"].forEach(e=>document.addEventListener(e,paintMe));window.__klAuth?.onAuthStateChanged(paintMe);paintMe();
["kl-loc","kl-adzan","kl-data-changed"].forEach(e=>document.addEventListener(e,schedule));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule()});schedule();
addEventListener("offline",()=>toast("Kamu sedang offline"));addEventListener("online",()=>toast("Kembali online"));
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
import("./lib/widgetdata.js").then(w=>{w.pushWidget();["kl-loc","kl-data-changed"].forEach(e=>document.addEventListener(e,()=>w.pushWidget()))}).catch(()=>{});
render().then(()=>{if(location.protocol.startsWith("http")&&!localStorage.getItem("kl_onboard"))setTimeout(onboard,1500)});
/* Muat semua halaman di latar belakang agar perpindahan halaman langsung tampil tanpa jeda */
setTimeout(()=>Object.keys(LABEL).forEach((n,i)=>setTimeout(()=>{loadHtml(n).catch(()=>{});loadMod(n)},200*i)),1500);

let sw=null;addEventListener("touchstart",e=>{const t=e.touches[0];sw=!backBtn.hidden&&t.clientX<28?{x:t.clientX,y:t.clientY}:null},{passive:true});
addEventListener("touchend",e=>{if(!sw)return;const t=e.changedTouches[0];if(t.clientX-sw.x>80&&Math.abs(t.clientY-sw.y)<60)backBtn.click();sw=null},{passive:true});
const offp=document.getElementById("offp"),offUp=()=>{offp.hidden=navigator.onLine};addEventListener("online",offUp);addEventListener("offline",offUp);offUp();

/* Pesan: inisialisasi per akun + lencana belum dibaca */
window.__klAuth?.onAuthStateChanged(u=>{chat.init(u);push.refresh(u)});
document.addEventListener("kl-chat",setBadge);
initKili();
document.addEventListener("kl-profile",()=>chat.register(window.__klAuth?.currentUser));

/* Tampilan seperti aplikasi: tidak ada menu konteks/pilih-teks tekan-lama di layar sentuh (kolom isian tetap normal) */
if(matchMedia("(pointer:coarse)").matches)document.addEventListener("contextmenu",e=>{if(!e.target.closest("input,textarea,[contenteditable]"))e.preventDefault()});
