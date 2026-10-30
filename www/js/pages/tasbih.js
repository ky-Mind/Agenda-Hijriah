import {get,set} from "../store.js";
import {ask,esc} from "../lib/ui.js";
const P=[["sub","Subhanallah","سُبْحَانَ ٱللَّهِ"],["hmd","Alhamdulillah","ٱلْحَمْدُ لِلَّهِ"],["akb","Allahu Akbar","ٱللَّهُ أَكْبَرُ"],["tah","La ilaha illallah","لَا إِلَٰهَ إِلَّا ٱللَّهُ"],["ist","Astaghfirullah","أَسْتَغْفِرُ ٱللَّهَ"],["hql","La haula wa la quwwata","لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ"],["free","Bebas",""]],C=2*Math.PI*46,T=[7,11,33,99,100,300,1000];
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let ctx;
  const s={cur:"sub",target:33,snd:false,by:{},vibBy:{},...get("tasbih",{})};if(!s.by||typeof s.by!=="object")s.by={};if(!s.vibBy||typeof s.vibBy!=="object")s.vibBy={};
  /* Getar diatur per target dzikir, default aktif */
  const vibOf=p=>s.vibBy[p]!==false;
  const rec=()=>s.by[s.cur]??={count:0,laps:0},save=()=>set("tasbih",s);
  $("target").innerHTML=T.map(t=>`<option ${t===s.target?"selected":""}>${t}</option>`).join("");
  const draw=()=>{const r=rec(),pr=P.find(p=>p[0]===s.cur)||P[0];
    root.querySelectorAll("[data-p]").forEach(c=>c.classList.toggle("on",c.dataset.p===s.cur));
    $("arab").textContent=pr[2];$("tap").textContent=r.count;$("fg").style.strokeDasharray=C;$("fg").style.strokeDashoffset=C*(1-Math.min(1,r.count/s.target));
    $("info").textContent=`Putaran selesai: ${r.laps} · Total ${r.laps*s.target+r.count}`;$("vib").setAttribute("aria-pressed",vibOf(s.cur));$("vib").textContent=vibOf(s.cur)?"Getar: aktif":"Getar: mati";$("snd").setAttribute("aria-pressed",s.snd)};
  const beep=f=>{try{ctx??=new AudioContext();const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.06)}catch(e){}};
  $("tap").onclick=()=>{const r=rec();r.count++;let lap=false;if(r.count>=s.target){r.count=0;r.laps++;lap=true}
    if(vibOf(s.cur))navigator.vibrate?.(lap?[60,40,60]:15);if(s.snd)beep(lap?880:520);save();draw()};
  $("undo").onclick=()=>{const r=rec();if(r.count>0)r.count--;else if(r.laps>0){r.laps--;r.count=s.target-1}save();draw()};
  $("reset").onclick=async()=>{if(await ask("Atur ulang hitungan?","Hitungan untuk bacaan ini kembali ke 0.","Atur ulang")){s.by[s.cur]={count:0,laps:0};save();draw()}};
  $("target").onchange=e=>{s.target=+e.target.value;Object.values(s.by).forEach(r=>{if(r.count>=s.target)r.count=0});save();draw()};
  $("vib").onclick=()=>{s.vibBy[s.cur]=!vibOf(s.cur);save();draw()};$("snd").onclick=()=>{s.snd=!s.snd;save();draw()};
  $("presets").onclick=e=>{const b=e.target.closest("[data-p]");if(b){s.cur=b.dataset.p;save();draw()}};
  $("presets").innerHTML=P.map(p=>`<button class="chip" data-p="${p[0]}">${esc(p[1])}</button>`).join("");
  draw();
  const ftu=()=>{const on=!!(window.KLFloatTasbih&&KLFloatTasbih.isOn());$("fttog").querySelector("span").textContent=on?"Sembunyikan tasbih melayang":"Tampilkan tasbih melayang"};
  $("fttog").onclick=()=>{window.KLFloatTasbih?.toggle();ftu()};document.addEventListener("kl-ftasbih",ftu);ftu();
  return()=>document.removeEventListener("kl-ftasbih",ftu);
}
