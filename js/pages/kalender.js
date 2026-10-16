import {esc} from "../lib/ui.js";
import {hijri,hijriText,masehiText,key,fromKey,events,hijriMonth,addDays,BULAN,MASEHI} from "../lib/hijri.js";
import {progress} from "../lib/ibadah.js";
import {loc,timings,NAMES} from "../lib/prayer.js";
import {get,set} from "../store.js";
let view=get("cal_view","hijri"),anchor=new Date(),sel=key(new Date());
const big=e=>e.filter(x=>!/^Puasa sunnah (Senin|Kamis)/.test(x)&&x!=="Hari Jumat");
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`),todayK=key(new Date());let seq=0;
  function draw(){
    root.querySelectorAll("[data-v]").forEach(c=>c.classList.toggle("on",c.dataset.v===view));
    let days,first,lead;
    if(view==="hijri"){const m=hijriMonth(anchor);days=m.days;first=m.days[0];$("title").textContent=`${BULAN[m.m-1]} ${m.y} H`;
      const a=days[0],b=days[days.length-1];$("sub").textContent=`${MASEHI[a.getMonth()]} ${a.getFullYear()}${a.getMonth()!==b.getMonth()?" – "+MASEHI[b.getMonth()]+" "+b.getFullYear():""}`}
    else{const y=anchor.getFullYear(),m=anchor.getMonth(),n=new Date(y,m+1,0).getDate();days=Array.from({length:n},(_,i)=>new Date(y,m,i+1));first=days[0];$("title").textContent=`${MASEHI[m]} ${y}`;
      const a=hijri(days[0]),b=hijri(days[n-1]);$("sub").textContent=a.m===b.m?`${BULAN[a.m-1]} ${a.y} H`:`${BULAN[a.m-1]} ${a.y} – ${BULAN[b.m-1]} ${b.y} H`}
    lead=first.getDay();
    let h=["Ahd","Sen","Sel","Rab","Kam","Jum","Sab"].map(x=>`<div class="dh">${x}</div>`).join("")+"<div></div>".repeat(lead);
    for(const dt of days){const k=key(dt),p=progress(k),hj=hijri(dt),ev=big(events(dt)).length,main=view==="hijri"?hj.d:dt.getDate(),sub=view==="hijri"?dt.getDate():hj.d;
      h+=`<button class="d ${k===todayK?"today":""} ${k===sel?"sel":""}" data-k="${k}" aria-label="${esc(masehiText(dt))}, ${esc(hijriText(dt))}"><span>${main}</span><small>${sub}</small>${ev?'<b class="ev"></b>':""}${p.done?`<i class="${p.done<p.total?"p":""}"></i>`:""}</button>`}
    $("grid").innerHTML=h;detail()}
  async function detail(){
    const my=++seq,dt=fromKey(sel),p=progress(sel),ev=events(dt);
    $("detail").innerHTML=`<h2>${esc(masehiText(dt))}</h2><p>${esc(hijriText(dt))}</p>${ev.length?`<ul class="muted" style="margin:8px 0 0 18px">${ev.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>`:""}<div class="bar mt"><i style="width:${p.pct}%"></i></div><p class="muted" style="margin-top:6px">${p.done} dari ${p.total} ibadah terlaksana</p><div class="times mt" data-t></div><div class="row mt"><a class="btn primary sm" href="#/absensi/${sel}">Isi absensi tanggal ini</a></div>`;
    try{const t=await timings(dt,loc());if(my!==seq)return;$("detail").querySelector("[data-t]").innerHTML=NAMES.filter(([id])=>id!=="Imsak"&&id!=="Sunrise").map(([id,nm])=>`<div class="t"><span class="muted">${nm}</span><b>${esc(t[id])}</b></div>`).join("")}catch(e){}}
  $("grid").onclick=e=>{const b=e.target.closest("[data-k]");if(b){sel=b.dataset.k;draw()}};
  root.onclick=e=>{const v=e.target.closest("[data-v]");if(v){view=v.dataset.v;set("cal_view",view);anchor=fromKey(sel);draw()}};
  const move=n=>{if(view==="hijri"){const m=hijriMonth(anchor);anchor=n>0?addDays(m.days[m.days.length-1],1):addDays(m.start,-1)}else anchor=new Date(anchor.getFullYear(),anchor.getMonth()+n,1);draw()};
  $("prev").onclick=()=>move(-1);$("nextm").onclick=()=>move(1);
  $("today").onclick=()=>{anchor=new Date();sel=key(anchor);draw()};
  draw();
}
