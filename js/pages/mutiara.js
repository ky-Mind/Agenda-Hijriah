import {esc,copy,json,fail,hasAr} from "../lib/ui.js";
export default async function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let Q;
  try{Q=await json("data/mutiara.json")}catch(e){$("list").innerHTML=fail("Kata mutiara gagal dimuat.",e.message);return}
  const card=q=>(hasAr(q.text)?`<div class="arab" style="font-size:26px">${esc(q.text)}</div>`:`<p class="quote">“${esc(q.text)}”</p>`)+(q.detail&&q.detail!==q.text?`<p>${esc(q.detail)}</p>`:"")+`<p class="src">${esc(q.source)}</p>`;
  const rnd=()=>{const q=Q[Math.floor(Math.random()*Q.length)];$("acak").innerHTML=`<div class="row sp"><h2>Acak</h2><button class="btn sm" data-r2>Acak lagi</button></div>`+card(q)};
  $("list").innerHTML=Q.map((q,i)=>`<div class="card">${card(q)}<div class="row mt"><button class="btn sm" data-i="${i}">Salin</button></div></div>`).join("");
  rnd();root.onclick=e=>{if(e.target.closest("[data-r2]"))rnd();const b=e.target.closest("[data-i]");if(b){const q=Q[+b.dataset.i];copy(`${q.text}\n${q.detail}\n${q.source}`)}};
}
