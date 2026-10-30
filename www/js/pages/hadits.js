import {esc,copy,skeleton,fail} from "../lib/ui.js";
/* [id, nama, id API gading, kandidat edisi fawazahmed0 (cadangan)] */
const BOOKS=[["bukhari","Bukhari","bukhari",["bukhari"]],["muslim","Muslim","muslim",["muslim"]],["tirmidzi","Tirmidzi","tirmidzi",["tirmidhi"]],["nasai","An-Nasa'i","nasai",["nasai"]],["abudaud","Abu Daud","abu-daud",["abudawud"]],["ibnumajah","Ibnu Majah","ibnu-majah",["ibnmajah","ibnumajah"]],["ahmad","Ahmad","ahmad",null],["darimi","Darimi","darimi",null],["malik","Malik","malik",["malik"]]],N=20;
const FW="https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/";
async function getJ(u,ms=12000){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(u,{signal:ac.signal});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json()}finally{clearTimeout(t)}}
const good={};
async function ed(pre,names,n){for(const nm of (good[pre+names[0]]?[good[pre+names[0]]]:names)){try{const j=await getJ(`${FW}${pre}-${nm}/${n}.json`,9000);good[pre+names[0]]=nm;const t=j.text??j.hadiths?.[0]?.text;if(t)return String(t)}catch(e){}}return ""}
async function viaGading(b,page){const j=(await getJ(`https://api.hadith.gading.dev/books/${b[2]}?range=${page*N+1}-${page*N+N}`)).data;if(!j?.hadiths?.length)throw new Error("data kosong");return{src:"api.hadith.gading.dev",total:j.available,items:j.hadiths.map(h=>({n:h.number,ar:h.arab,id:h.id}))}}
async function viaFawaz(b,page){if(!b[3])throw new Error("kitab ini tidak tersedia di sumber cadangan");
  const nums=Array.from({length:N},(_,i)=>page*N+i+1);
  const rows=await Promise.all(nums.map(async n=>{const[ar,id]=await Promise.all([ed("ara",b[3],n),ed("ind",b[3],n)]);return ar||id?{n,ar,id}:null}));
  const items=rows.filter(Boolean);if(!items.length)throw new Error("data kosong");return{src:"fawazahmed0/hadith-api",total:items.length<N?page*N+items.length:null,items}}
/* Halaman yang sudah dimuat disimpan di memori, dan permintaan yang sama tidak diulang */
const pages=new Map();
function fetchPage(bi,page){const k=bi+":"+page;if(!pages.has(k)){const b=BOOKS[bi];pages.set(k,(async()=>{const errs=[];for(const f of [viaGading,viaFawaz]){try{return await f(b,page)}catch(e){errs.push(e.message)}}throw new Error(errs.join(" | "))})().catch(e=>{pages.delete(k);throw e}))}return pages.get(k)}
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let book=0,page=0,seq=0,data=[],alive=true;
  $("books").innerHTML=BOOKS.map(([id,nm],i)=>`<button class="chip" data-b="${i}">${nm}</button>`).join("");
  async function load(){const my=++seq,b=BOOKS[book],list=$("list");root.querySelectorAll("[data-b]").forEach(c=>c.classList.toggle("on",+c.dataset.b===book));
    /* Daftar lama tetap tampil (sedikit pudar) saat halaman berikutnya dimuat, supaya tidak ada kedip */
    if(list.children.length)list.classList.add("busy");else list.innerHTML=skeleton(5);
    $("pager").innerHTML="";let r,err="";
    try{r=await fetchPage(book,page)}catch(e){err=e.message}
    list.classList.remove("busy");
    if(!alive||my!==seq)return;
    if(!r){list.innerHTML=fail("Hadits gagal dimuat dari semua sumber.",err);return}
    data=r.items;
    list.innerHTML=data.map((h,i)=>`<div class="card"><div class="row sp"><b>HR. ${b[1]} no. ${h.n}</b><button class="btn sm" data-c="${i}">Salin</button></div>${h.ar?`<div class="arab" style="font-size:24px">${esc(h.ar)}</div>`:""}<p>${esc(h.id||"Terjemahan Indonesia belum tersedia untuk hadits ini.")}</p></div>`).join("")+`<p class="src" style="text-align:center">Sumber: ${esc(r.src)}</p>`;
    const more=r.total==null?data.length===N:(page+1)*N<r.total;
    $("pager").innerHTML=`<button class="btn" data-pg="-1" ${page?"":"disabled"}>‹ Sebelumnya</button><span class="muted">${page*N+1}–${page*N+data.length}${r.total?" dari "+r.total.toLocaleString("id-ID"):""}</span><button class="btn" data-pg="1" ${more?"":"disabled"}>Berikutnya ›</button>`;
    /* Halaman berikutnya diambil diam-diam, jadi tombol Berikutnya langsung terasa */
    if(more)fetchPage(book,page+1).catch(()=>{})}
  root.onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.b!=null){book=+b.dataset.b;page=0;load()}else if(b.dataset.pg){page+=+b.dataset.pg;load();document.getElementById("view")?.scrollTo({top:0,behavior:"smooth"})}
    else if(b.dataset.c){const h=data[+b.dataset.c];copy(`${h.ar||""}\n\n${h.id||""}\n\nHR. ${BOOKS[book][1]} no. ${h.n}`.trim())}};
  const j=root.querySelector("[data-j]");if(j)j.onchange=e=>{const n=+e.target.value;if(n>=1){page=Math.floor((n-1)/N);load()}};
  load();return()=>{alive=false};
}
