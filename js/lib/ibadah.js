import {get,set,del,keys} from "../store.js";
import {key,addDays,fromKey} from "./hijri.js";
/* Status: 1 terlaksana, 0 terlewat, 2 datang bulan (tidak dihitung), 3 khatam (tadarus, dihitung terlaksana) */
export const STATUS={1:["✅","Terlaksana"],0:["❌","Tidak terlaksana"],2:["🌑","Datang bulan"],3:["📖💯","Khatam"]};
export const DEFAULT=[["puasa","Puasa Sunnah","🌙"],["sahur","Sahur","🍽️"],["tahajjud","Tahajjud","🌌"],["sedekah","Sedekah","🤲"],["dzikir_pagi","Dzikir Pagi","🌅"],["ar_rahman","Ar-Rahman","📖"],["dhuha","Dhuha","☀️"],["al_mulk","Al-Mulk","📖"],["al_waqiah","Al-Waqi'ah","📖"],["dzikir_petang","Dzikir Petang","🌇"],["tadarus","Tadarus","📚"],["witir","Witir","✨"]].map(([id,nama,ic])=>({id,nama,ic}));
export const agenda=()=>get("agenda",DEFAULT);
export const saveAgenda=a=>set("agenda",a);
export const resetAgenda=()=>set("agenda",DEFAULT);
export const day=k=>get("abs_"+k,{});
export const savedAt=k=>get("absm_"+k,null)?.t||0;
export function saveDay(k,rec){const c={};for(const id in rec)if(rec[id]!=null)c[id]=rec[id];if(Object.keys(c).length){set("abs_"+k,c);set("absm_"+k,{t:Date.now()})}else{del("abs_"+k);del("absm_"+k)}}
export function calc(rec,l=agenda()){
  const done=l.filter(i=>rec[i.id]===1||rec[i.id]===3).length,miss=l.filter(i=>rec[i.id]===0).length,rest=l.filter(i=>rec[i.id]===2).length,khatam=l.filter(i=>rec[i.id]===3).length,total=l.length-rest;
  return{done,miss,rest,khatam,total,filled:done+miss+rest,pct:total?Math.round(done/total*100):0}}
export const progress=k=>calc(day(k));

/* Hari "aktif" = minimal 50% ibadah terlaksana. Hari ini yang belum cukup tidak memutus rangkaian. */
export function streaks(){
  const ks=keys("abs_").map(k=>k.slice(4)).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort(),ok=new Set(ks.filter(k=>progress(k).pct>=50));
  let best=0,run=0,pv=null;for(const k of ks){if(!ok.has(k)){run=0;pv=null;continue}run=pv&&key(addDays(fromKey(pv),1))===k?run+1:1;pv=k;best=Math.max(best,run)}
  let cur=0,d=new Date();if(!ok.has(key(d)))d=addDays(d,-1);while(ok.has(key(d))){cur++;d=addDays(d,-1)}
  return{cur,best,days:ks.length}}
export const BADGES=[[3,"Mulai istiqamah"],[7,"Sepekan penuh"],[14,"Dua pekan"],[30,"Sebulan istiqamah"],[100,"Seratus hari"]];
