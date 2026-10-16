import {esc,copy,json,fail} from "../lib/ui.js";
export default async function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let all,cat="Semua",q="";
  try{all=await json("data/doa.json")}catch(e){$("list").innerHTML=fail("Do'a gagal dimuat.",e.message);return}
  const cats=["Semua",...new Set(all.map(d=>d.kategori))];
  const draw=()=>{$("cats").innerHTML=cats.map(c=>`<button class="chip ${c===cat?"on":""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    const l=all.filter(d=>(cat==="Semua"||d.kategori===cat)&&(!q||(d.judul+" "+d.arti+" "+d.latin).toLowerCase().includes(q)));
    $("list").innerHTML=l.map(d=>`<div class="card"><div class="row sp"><h2>${esc(d.judul)}</h2><button class="btn sm" data-copy="${all.indexOf(d)}">Salin</button></div><div class="arab">${esc(d.arab)}</div><p class="latin">${esc(d.latin)}</p><p>${esc(d.arti)}</p>${d.sumber?`<p class="src">${esc(d.sumber)}</p>`:""}</div>`).join("")||'<div class="empty">Do\'a tidak ditemukan.</div>'};
  root.onclick=e=>{const c=e.target.closest("[data-c]");if(c){cat=c.dataset.c;draw()}const b=e.target.closest("[data-copy]");if(b){const d=all[+b.dataset.copy];copy(`${d.judul}\n${d.arab}\n${d.latin}\n${d.arti}`)}};
  $("q").oninput=e=>{q=e.target.value.toLowerCase().trim();draw()};draw();
}
