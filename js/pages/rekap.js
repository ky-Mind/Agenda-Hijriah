import {esc,copy} from "../lib/ui.js";
import {key,addDays,HARI,MASEHI,hijriText} from "../lib/hijri.js";
import {agenda,day,calc,streaks,BADGES} from "../lib/ibadah.js";
import {waNumber,waUrl,openUrl} from "../lib/wa.js";
import {toast} from "../store.js";
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let mode="minggu",anchor=new Date(),text="";
  const fmt=d=>`${d.getDate()} ${MASEHI[d.getMonth()].slice(0,3)}`;
  function range(){if(mode==="minggu"){const e=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate());return{s:addDays(e,-6),e,title:`${fmt(addDays(e,-6))} – ${fmt(e)} ${e.getFullYear()}`}}
    const s=new Date(anchor.getFullYear(),anchor.getMonth(),1),e=new Date(anchor.getFullYear(),anchor.getMonth()+1,0);return{s,e,title:`${MASEHI[s.getMonth()]} ${s.getFullYear()}`}}
  function draw(){
    const sk=streaks();$("stk").textContent=`${sk.cur} hari beruntun · rekor ${sk.best}`;$("badges").innerHTML=BADGES.map(([n,t])=>`<div class="badge-i ${sk.best>=n?"on":""}"><svg class="ic"><use href="#i-star"/></svg><b>${n} hari</b><small>${t}</small></div>`).join("");
    root.querySelectorAll("[data-m]").forEach(c=>c.classList.toggle("on",c.dataset.m===mode));
    const {s,e,title}=range(),list=agenda(),days=[];for(let d=s;d<=e;d=addDays(d,1))days.push(d);
    const rows=days.map(d=>({d,k:key(d),r:day(key(d))})).map(x=>({...x,p:calc(x.r,list)})),rec=rows.filter(x=>x.p.filled>0);
    $("title").textContent=title;$("sub").textContent=`${hijriText(s)} – ${hijriText(e)}`;
    const avg=rec.length?Math.round(rec.reduce((a,x)=>a+x.p.pct,0)/rec.length):0,done=rec.reduce((a,x)=>a+x.p.done,0),miss=rec.reduce((a,x)=>a+x.p.miss,0);
    $("metrics").innerHTML=[[rec.length+"/"+days.length,"hari tercatat"],[avg+"%","rata-rata"],[done,"terlaksana"],[miss,"terlewat"]].map(([b,l])=>`<div class="metric"><b>${b}</b><span>${l}</span></div>`).join("");
    $("chart").innerHTML=rows.map(x=>`<div title="${esc(x.k)}: ${x.p.pct}%"><div class="col"><i class="${x.p.pct?"":"z"}" style="height:${Math.max(x.p.pct,4)}%"></i></div><small>${mode==="minggu"?HARI[x.d.getDay()].slice(0,3):x.d.getDate()}</small></div>`).join("");
    const per=list.map(i=>{const v=rec.map(x=>x.r[i.id]).filter(v=>v!=null&&v!==2),ok=v.filter(v=>v===1||v===3).length;return{i,ok,n:v.length,pct:v.length?Math.round(ok/v.length*100):0}});
    $("items").innerHTML=per.length?per.map(x=>`<div class="rrow"><div class="row sp"><span>${esc(x.i.ic||"•")} ${esc(x.i.nama)}</span><b>${x.n?x.pct+"%":"—"} <small class="muted">${x.ok}/${x.n}</small></b></div><div class="bar"><i style="width:${x.pct}%"></i></div></div>`).join(""):'<div class="empty">Belum ada ibadah.</div>';
    const f=per.filter(x=>x.n>0).sort((a,b)=>b.pct-a.pct),ins=$("insight");ins.hidden=f.length<2;
    if(f.length>=2)ins.textContent=`Paling konsisten: ${f[0].i.nama} (${f[0].pct}%). Perlu perhatian: ${f[f.length-1].i.nama} (${f[f.length-1].pct}%).`;
    text=`REKAP IBADAH ${title}\n\nHari tercatat: ${rec.length}/${days.length}\nRata-rata: ${avg}%\n\n`+per.map(x=>`${x.i.nama} —${x.n?x.pct+"% ("+x.ok+"/"+x.n+")":"belum ada data"}`).join("\n");
  }
  root.onclick=e=>{const m=e.target.closest("[data-m]");if(m){mode=m.dataset.m;draw()}};
  const step=n=>{anchor=mode==="minggu"?addDays(anchor,7*n):new Date(anchor.getFullYear(),anchor.getMonth()+n,1);draw()};
  $("prev").onclick=()=>step(-1);$("nextp").onclick=()=>step(1);$("now").onclick=()=>{anchor=new Date();draw()};
  $("wa").onclick=()=>{if(!/Hari tercatat: 0\//.test(text))openUrl(waUrl(waNumber(),text));else toast("Belum ada data pada periode ini")};
  $("copy").onclick=()=>copy(text);
  draw();
}
