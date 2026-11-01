import {toast} from "../store.js";
/* Tandai bagian yang bermasalah untuk laporan bug, tanpa perlu screenshot.
   Pengguna bebas pindah halaman lewat navigasi, lalu mengetuk bagian yang bermasalah. Bagian itu difoto (html-to-image,
   dirender oleh browser sendiri sehingga CSS modern ikut tampil), disimpan ke draf laporan, lalu kembali ke Profil › Bantuan.
   Draf laporan ada di sessionStorage (kl_bug_draft) agar tetap utuh walau halaman Profil sempat ditutup. */
const DRAFT="kl_bug_draft",LIB="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js",MAX_W=720,MAX_BYTES=260000;

export const loadDraft=()=>{try{return JSON.parse(sessionStorage.getItem(DRAFT))||{type:"bug",name:"",text:"",shots:[]}}catch(e){return{type:"bug",name:"",text:"",shots:[]}}};
export const saveDraft=d=>{try{sessionStorage.setItem(DRAFT,JSON.stringify(d))}catch(e){toast("Draf laporan terlalu besar, hapus salah satu gambar")}};
export const clearDraft=()=>{try{sessionStorage.removeItem(DRAFT)}catch(e){}};

let lib=null;
const loadLib=()=>lib??=new Promise((ok,no)=>{if(window.htmlToImage)return ok(window.htmlToImage);const s=document.createElement("script");s.src=LIB;s.onload=()=>ok(window.htmlToImage);s.onerror=()=>{lib=null;no(new Error("lib"))};document.head.appendChild(s)});

/* Jalur elemen yang mudah dibaca admin, mis. "main#view > div.card:nth-of-type(2) > button.btn" */
function path(el){
  const out=[];
  for(let e=el;e&&e!==document.body&&out.length<6;e=e.parentElement){
    let s=e.tagName.toLowerCase();
    if(e.id){out.unshift(s+"#"+e.id);break}
    const cls=[...e.classList].filter(c=>!/^(on|sel|in|hover|pick-)/.test(c)).slice(0,2);if(cls.length)s+="."+cls.join(".");
    const sib=e.parentElement?[...e.parentElement.children].filter(x=>x.tagName===e.tagName):[];
    if(sib.length>1)s+=`:nth-of-type(${sib.indexOf(e)+1})`;
    out.unshift(s);
  }
  return out.join(" > ");
}
/* Elemen yang terlalu kecil (ikon, teks pendek) difoto bersama kartu/baris tempatnya agar konteksnya terlihat */
const target=el=>{const r=el.getBoundingClientRect();return r.width<64||r.height<36?el.closest(".card,.item,.tile,.row,section,li,button,a")||el:el};

async function snap(el){
  try{
    const h=await loadLib(),r=el.getBoundingClientRect(),ratio=Math.min(2,MAX_W/Math.max(1,r.width));
    const bg=getComputedStyle(document.body).backgroundColor;
    let q=.8,url=await h.toJpeg(el,{quality:q,pixelRatio:ratio,backgroundColor:bg,cacheBust:true,skipFonts:false});
    while(url.length>MAX_BYTES*1.37&&q>.35){q-=.15;url=await h.toJpeg(el,{quality:q,pixelRatio:ratio*.8,backgroundColor:bg})}
    return url.length>MAX_BYTES*1.37?"":url;
  }catch(e){console.warn("foto bagian",e);return""}
}

let active=false;
export function pickPart(){
  if(active)return;active=true;
  const html=document.documentElement,view=document.getElementById("view");
  const box=document.createElement("div");box.className="pick-box";box.hidden=true;
  const bar=document.createElement("div");bar.className="pick-bar";bar.setAttribute("role","status");
  bar.innerHTML=`<span class="pick-grip" aria-hidden="true" title="Geser"><svg viewBox="0 0 24 24"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/></svg></span><div class="pick-msg"><b>Tandai bagian yang bermasalah</b><span data-t>Buka halamannya lewat menu, lalu ketuk bagiannya.</span></div><div class="pick-acts"><button type="button" class="btn sm" data-x>Batal</button><button type="button" class="btn sm primary" data-ok hidden>Pakai bagian ini</button></div>`;
  document.body.append(box,bar);html.classList.add("bugpick");
  /* Bilah bisa digeser (seret di mana saja selain tombol) supaya tidak menutupi bagian yang mau ditandai */
  let drag=null;
  bar.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const r=bar.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};bar.setPointerCapture(e.pointerId);bar.classList.add("drag")});
  bar.addEventListener("pointermove",e=>{if(!drag)return;const w=bar.offsetWidth,h=bar.offsetHeight;
    Object.assign(bar.style,{left:Math.min(Math.max(8,e.clientX-drag.dx),innerWidth-w-8)+"px",top:Math.min(Math.max(8,e.clientY-drag.dy),innerHeight-h-8)+"px",right:"auto",bottom:"auto",width:w+"px"})});
  const drop=()=>{drag=null;bar.classList.remove("drag")};
  bar.addEventListener("pointerup",drop);bar.addEventListener("pointercancel",drop);
  let chosen=null;
  const show=el=>{const r=el.getBoundingClientRect();box.hidden=false;Object.assign(box.style,{left:r.left-3+"px",top:r.top-3+"px",width:r.width+6+"px",height:r.height+6+"px"})};
  const inView=t=>view.contains(t)&&t!==view;
  const over=e=>{if(chosen||e.pointerType!=="mouse"||!inView(e.target))return;show(target(e.target))};
  const tap=e=>{
    if(bar.contains(e.target)||!inView(e.target))return;
    e.preventDefault();e.stopPropagation();
    chosen=target(e.target);show(chosen);
    bar.querySelector("[data-t]").textContent=(chosen.innerText||chosen.getAttribute("aria-label")||chosen.tagName).trim().replace(/\s+/g," ").slice(0,60)||"Bagian dipilih";
    bar.querySelector("[data-ok]").hidden=false;
  };
  const swallow=e=>{if(!bar.contains(e.target)&&inView(e.target)){e.preventDefault();e.stopPropagation()}};
  const onScroll=()=>chosen&&show(chosen);
  const onRoute=()=>{chosen=null;box.hidden=true;bar.querySelector("[data-ok]").hidden=true;bar.querySelector("[data-t]").textContent="Ketuk bagian yang bermasalah di halaman ini."};
  const end=()=>{active=false;html.classList.remove("bugpick");box.remove();bar.remove();
    removeEventListener("pointerover",over,true);removeEventListener("click",tap,true);["pointerdown","mousedown"].forEach(t=>removeEventListener(t,swallow,{capture:true}));
    view.removeEventListener("scroll",onScroll);removeEventListener("hashchange",onRoute)};
  const back=()=>{try{sessionStorage.setItem("kl_ptab","bantuan")}catch(e){}location.hash="#/profil"};
  bar.querySelector("[data-x]").onclick=()=>{end();back()};
  bar.querySelector("[data-ok]").onclick=async()=>{
    if(!chosen)return;
    const okBtn=bar.querySelector("[data-ok]");okBtn.disabled=true;okBtn.textContent="Mengambil gambar…";box.hidden=true;
    const el=chosen,r=el.getBoundingClientRect(),img=await snap(el);
    const d=loadDraft();
    d.shots=[...(d.shots||[]),{page:location.hash||"#/beranda",title:document.title.replace(/ · Kisah Lillah$/,""),sel:path(el),text:(el.innerText||"").trim().replace(/\s+/g," ").slice(0,160),w:Math.round(r.width),h:Math.round(r.height),img}].slice(-3);
    saveDraft(d);end();back();toast(img?"Bagian ditandai":"Bagian ditandai (tanpa gambar)");
  };
  addEventListener("pointerover",over,true);addEventListener("click",tap,true);
  /* Tahan aksi tombol/seret di halaman selama memilih (scroll tetap jalan); navigasi dan bilah ini tetap bisa dipakai */
  ["pointerdown","mousedown"].forEach(t=>addEventListener(t,swallow,{capture:true}));
  view.addEventListener("scroll",onScroll,{passive:true});addEventListener("hashchange",onRoute);
}
