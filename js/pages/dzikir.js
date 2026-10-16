import {get,set,toast} from "../store.js";
import {key} from "../lib/hijri.js";
import {esc,json,fail,ask} from "../lib/ui.js";
const paras=a=>(Array.isArray(a)?a:[a]).map(s=>String(s||"").trim().replace(/^\[\s*/,"").replace(/\s*\]$/,"")).filter(Boolean);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function head(t){t=cap(String(t||"").trim());const m=/^(.*?)\s*—\s*(\d+)\s*kali(.*)$/.exec(t);return m?{base:m[1]||t,n:m[2],rest:m[3].trim()}:{base:t,n:"",rest:""}}
export default async function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let w=new Date().getHours()<12?"pagi":"petang",D;
  try{D=await json("data/dzikir.json")}catch(e){$("list").innerHTML=fail("Dzikir gagal dimuat.",e.message);return}
  const rk=()=>"dz_"+key(new Date());
  const draw=()=>{const done=get(rk(),{})[w]||[],l=D[w]||[];
    root.querySelectorAll("[data-w]").forEach(c=>c.classList.toggle("on",c.dataset.w===w));
    $("sub").textContent=`${l.length} bacaan. Tandai yang sudah dibaca, tersimpan per hari.`;$("prog").textContent=`${done.length} dari ${l.length} dibaca`;
    $("list").innerHTML=l.map((d,i)=>{const h=head(d.judul),on=done.includes(i);
      return `<div class="card"><div class="row sp"><h2>${i+1}. ${esc(h.base)}${h.n?`<span class="cnt">${h.n}×</span>`:""}${h.rest?` <small class="muted">${esc(h.rest)}</small>`:""}</h2><button class="btn sm" data-d="${i}" aria-pressed="${on}">${on?"✓ Dibaca":"Tandai dibaca"}</button></div>${paras(d.arab).map(p=>`<div class="arab">${esc(p)}</div>`).join("")}<p>${esc(d.arti)}</p>${(d.catatan||[]).map(c=>`<p class="muted" style="font-size:13px">Catatan: ${esc(c)}</p>`).join("")}${d.sumber?`<p class="src">Sumber: ${esc(d.sumber)}</p>`:""}</div>`}).join("")+`<div class="row" style="justify-content:center"><button class="btn sm" data-reset>Atur ulang hari ini</button></div>`};
  root.onclick=async e=>{const c=e.target.closest("[data-w]");if(c){w=c.dataset.w;draw();root.scrollTo({top:0})}
    const b=e.target.closest("[data-d]");if(b){const all=get(rk(),{}),a=new Set(all[w]||[]),i=+b.dataset.d;a.has(i)?a.delete(i):a.add(i);set(rk(),{...all,[w]:[...a]});draw()}
    if(e.target.closest("[data-reset]")&&await ask("Atur ulang?","Semua tanda dibaca untuk dzikir "+w+" hari ini dihapus.","Atur ulang")){const all=get(rk(),{});set(rk(),{...all,[w]:[]});draw()}};
  draw();
}
