import {get,toast} from "./store.js";
import {paint} from "./lib/avatar.js";
import {schedule} from "./lib/adzan.js";
import {confirmLeave,wait} from "./lib/ui.js";
import {onboard} from "./lib/onboard.js";
const view=document.getElementById("view"),LABEL={beranda:"Beranda",absensi:"Absensi",rekap:"Rekap",kalender:"Kalender",shalat:"Shalat",koleksi:"Koleksi",quran:"Al-Qur'an",hadits:"Hadits",doa:"Do'a",dzikir:"Dzikir",mutiara:"Kata Mutiara",tasbih:"Tasbih",profil:"Profil"};
const PARENT={rekap:"absensi",quran:"koleksi",hadits:"koleksi",doa:"koleksi",dzikir:"koleksi",mutiara:"koleksi",tasbih:"koleksi"};
const html={},mods={};let cleanup=null,seq=0,shown=location.hash,skip=false;
window.KLGuard=null; /* halaman dapat mengisi {dirty(),save(),discard()} untuk menahan perpindahan saat ada perubahan belum tersimpan */
const loadHtml=n=>html[n]??=fetch(`pages/${n}.html`,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error(`pages/${n}.html (HTTP ${r.status})`);return r.text()}).catch(e=>{delete html[n];throw e});
const NOJS=new Set(["koleksi"]);
const loadMod=n=>NOJS.has(n)?Promise.resolve(null):mods[n]??=import(`./pages/${n}.js`).catch(e=>{console.error("Modul halaman gagal dimuat:",n,e);delete mods[n];return null});
const ROOTS=["beranda","absensi","kalender","shalat","koleksi","profil"],bar=document.getElementById("bar"),backBtn=document.getElementById("back"),ttl=document.getElementById("ttl"),root=document.documentElement;
const depth=(n,a)=>ROOTS.includes(n)?0:n==="quran"&&a.length?2:1;let prev=null;
const backTarget=(n,a)=>n==="quran"&&a.length?"#/quran":PARENT[n]?"#/"+PARENT[n]:null;
function direction(n,a){const d=depth(n,a),i=ROOTS.indexOf(n);if(!prev)return"none";if(d>prev.d)return"fwd";if(d<prev.d)return"back";return d===0?(i>prev.i?"next":"prev"):"fwd"}
function paintBar(n,a){const r=ROOTS.includes(n);bar.dataset.root=r?"1":"0";backBtn.hidden=r;backBtn.dataset.to=backTarget(n,a)||"#/beranda";ttl.textContent=r?"":LABEL[n]}
backBtn.addEventListener("click",()=>{location.hash=backBtn.dataset.to||"#/beranda"});
document.addEventListener("kl-title",e=>{if(bar.dataset.root==="0")ttl.textContent=e.detail});
async function render(){
  const my=++seq,[name0,...args]=(location.hash.replace(/^#\/?/,"")||"beranda").split("/"),name=LABEL[name0]?name0:"beranda";
  document.querySelectorAll("[data-nav]").forEach(a=>{const on=a.dataset.nav===(PARENT[name]||name);a.classList.toggle("on",on);on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
  document.title=LABEL[name]+" · Kisah Lillah";
  const dir=direction(name,args);prev={d:depth(name,args),i:ROOTS.indexOf(name)};
  const slow=setTimeout(()=>view.classList.add("busy"),160);
  let h,m,err="";try{[h,m]=await Promise.all([loadHtml(name),loadMod(name)])}catch(e){err=e.message;h=`<div class="wrap"><div class="empty"><p>Halaman tidak dapat dimuat.</p><p class="muted" style="font-size:12px;word-break:break-all">${String(err).replace(/</g,"&lt;")}</p><button class="btn sm mt" onclick="location.reload()">Muat ulang</button></div></div>`;m=null}
  clearTimeout(slow);if(my!==seq)return;
  const swap=()=>{if(cleanup){try{cleanup()}catch(e){}cleanup=null}window.KLGuard=null;view.onclick=null;view.oninput=null;view.innerHTML=h;view.scrollTop=0;view.classList.remove("busy");paintBar(name,args)};
  const run=()=>{try{if(m?.default)Promise.resolve(m.default(view,args)).then(c=>{if(my!==seq){try{c?.()}catch(e){}}else cleanup=c||null}).catch(e=>{console.error(e);toast("Terjadi kesalahan di halaman ini")});
    else if(!err&&m===null&&!NOJS.has(name))view.insertAdjacentHTML("afterbegin",'<div class="wrap"><div class="empty">Skrip halaman ini gagal dimuat. Muat ulang dengan Ctrl+Shift+R.</div></div>')}catch(e){console.error(e);toast("Terjadi kesalahan di halaman ini")}};
  root.dataset.dir=dir;
  if(dir!=="none"&&document.startViewTransition&&!matchMedia("(prefers-reduced-motion:reduce)").matches)document.startViewTransition(()=>{swap();run()});
  else{swap();run();view.dataset.anim=dir;view.classList.remove("in");void view.offsetWidth;view.classList.add("in")}
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
document.addEventListener("kl-sync",e=>{sy.dataset.s=e.detail.s;sy.lastChild.textContent=L[e.detail.s]});
const av=[document.getElementById("meAv"),document.getElementById("meAv2")],meName=document.getElementById("meName");
function paintMe(){const p=get("profil",{}),u=window.__klAuth?.currentUser,n=p.name||u?.displayName||"Tamu";av.forEach(a=>paint(a,n,p.photo||u?.photoURL));meName.textContent=n}
["kl-profile","kl-data-changed"].forEach(e=>document.addEventListener(e,paintMe));window.__klAuth?.onAuthStateChanged(paintMe);paintMe();
["kl-loc","kl-adzan","kl-data-changed"].forEach(e=>document.addEventListener(e,schedule));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule()});schedule();
addEventListener("offline",()=>toast("Kamu sedang offline"));addEventListener("online",()=>toast("Kembali online"));
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
render().then(()=>{if(location.protocol.startsWith("http")&&!localStorage.getItem("kl_onboard"))setTimeout(onboard,1500)});

let sw=null;addEventListener("touchstart",e=>{const t=e.touches[0];sw=!backBtn.hidden&&t.clientX<28?{x:t.clientX,y:t.clientY}:null},{passive:true});
addEventListener("touchend",e=>{if(!sw)return;const t=e.changedTouches[0];if(t.clientX-sw.x>80&&Math.abs(t.clientY-sw.y)<60)backBtn.click();sw=null},{passive:true});
const offp=document.getElementById("offp"),offUp=()=>{offp.hidden=navigator.onLine};addEventListener("online",offUp);addEventListener("offline",offUp);offUp();
