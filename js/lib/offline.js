import {keys} from "../store.js";
import {monthTimings,loc} from "./prayer.js";
const Q="https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/id/",DATA="kl-data";
export async function quranStatus(){if(!window.caches)return{n:0,ok:false};const c=await caches.open(DATA),ks=await c.keys();return{ok:true,n:ks.filter(r=>r.url.startsWith(Q)&&/\/\d+\.json$/.test(r.url)).length}}
export async function downloadQuran(on){const c=await caches.open(DATA),q=Array.from({length:114},(_,i)=>i+1),failed=[];let done=0;
  const w=async()=>{while(q.length){const n=q.shift(),u=`${Q}${n}.json`;try{if(!(await c.match(u))){const r=await fetch(u);if(!r.ok)throw new Error(r.status);const j=await r.clone().json();if(!j.verses?.length)throw new Error("kosong");await c.put(u,r)}}catch(e){failed.push(n)}on?.(++done,114)}};
  try{if(!(await c.match(Q+"index.json"))){const r=await fetch(Q+"index.json");if(r.ok)await c.put(Q+"index.json",r)}}catch(e){}
  await Promise.all([w(),w(),w(),w()]);return{failed}}
export async function prepareTimes(){const d=new Date(),l=loc();let ok=0;for(let i=0;i<3;i++){const m=new Date(d.getFullYear(),d.getMonth()+i,1);try{const r=await monthTimings(m.getFullYear(),m.getMonth()+1,l);if(r.src==="api")ok++}catch(e){}}return ok}
export const timesStatus=()=>keys("cache_pm_").length;
