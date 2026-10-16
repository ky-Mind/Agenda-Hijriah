import {toast} from "../store.js";
export const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const copy=async t=>{try{await navigator.clipboard.writeText(t);toast("Disalin")}catch(e){toast("Tidak bisa menyalin")}};
const J={};export const json=u=>J[u]??=fetch(u,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error(`${u} (HTTP ${r.status})`);return r.json()}).catch(e=>{delete J[u];throw e});
export const skeleton=n=>Array.from({length:n},()=>'<div class="skel"></div>').join("");
/* Tampilan gagal-muat dengan tombol coba lagi (tangani lewat [data-retry]) */
export const fail=(msg="Gagal memuat data.",detail="")=>`<div class="empty"><p>${esc(msg)}</p>${detail?`<p class="muted" style="font-size:12px;margin-top:4px;word-break:break-all">${esc(detail)}</p>`:""}<button class="btn sm mt" data-retry>Coba lagi</button></div>`;
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
/* Dialog modal. Mengembalikan value tombol yang dipilih, atau null jika ditutup (Esc / klik latar). */
export function dialog({title,text="",html="",actions=[{label:"OK",value:true,cls:"primary"}]}){
  return new Promise(done=>{
    const m=document.createElement("div");m.className="modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label",title);
    m.innerHTML=`<div class="box"><h2>${esc(title)}</h2>${text?`<p style="margin:8px 0 0">${esc(text)}</p>`:""}${html}<div class="dlg-actions">${actions.map((a,i)=>`<button class="btn ${a.cls||""}" data-i="${i}">${esc(a.label)}</button>`).join("")}</div></div>`;
    const prev=document.activeElement;
    const close=v=>{document.removeEventListener("keydown",key,true);m.remove();prev?.focus?.();done(v)};
    const key=e=>{if(e.key==="Escape"){e.stopPropagation();close(null)}};
    document.addEventListener("keydown",key,true);
    m.onclick=e=>{if(e.target===m)return close(null);const b=e.target.closest("[data-i]");if(b)close(actions[+b.dataset.i].value)};
    document.body.appendChild(m);(m.querySelector(".primary")||m.querySelector("button")).focus();
  });
}
export const confirmLeave=()=>dialog({title:"Simpan perubahan?",text:"Absensi yang kamu isi belum disimpan. Simpan datanya, atau lewati dan keluar tanpa menyimpan?",actions:[{label:"Simpan data",value:"save",cls:"primary"},{label:"Lewati, keluar",value:"discard"},{label:"Tetap di sini",value:null,cls:"ghost"}]});
export const ask=(title,text,ok="Ya")=>dialog({title,text,actions:[{label:ok,value:true,cls:"primary"},{label:"Batal",value:false}]}).then(v=>v===true);

export const hasAr=s=>/[\u0600-\u06FF]/.test(String(s||""));
