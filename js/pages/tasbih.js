import {get,set} from "../store.js";
import {ask,esc} from "../lib/ui.js";
const P=[["sub","Subhanallah","سُبْحَانَ ٱللَّهِ"],["hmd","Alhamdulillah","ٱلْحَمْدُ لِلَّهِ"],["akb","Allahu Akbar","ٱللَّهُ أَكْبَرُ"],["tah","La ilaha illallah","لَا إِلَٰهَ إِلَّا ٱللَّهُ"],["ist","Astaghfirullah","أَسْتَغْفِرُ ٱللَّهَ"],["hql","La haula wa la quwwata","لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ"],["free","Bebas",""]],C=2*Math.PI*46,T=[7,11,33,99,100,300,1000];
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let ctx;
  const s={cur:"sub",target:33,vib:true,snd:false,by:{},...get("tasbih",{})};if(!s.by||typeof s.by!=="object")s.by={};
  const rec=()=>s.by[s.cur]??={count:0,laps:0},save=()=>set("tasbih",s);
  $("target").innerHTML=T.map(t=>`<option ${t===s.target?"selected":""}>${t}</option>`).join("");
  const draw=()=>{const r=rec(),pr=P.find(p=>p[0]===s.cur)||P[0];
    $("presets").innerHTML=P.map(p=>`<button class="chip ${p[0]===s.cur?"on":""}" data-p="${p[0]}">${esc(p[1])}</button>`).join("");
    $("arab").textContent=pr[2];$("tap").textContent=r.count;$("fg").style.strokeDasharray=C;$("fg").style.strokeDashoffset=C*(1-Math.min(1,r.count/s.target));
    $("info").textContent=`Putaran selesai: ${r.laps} · Total ${r.laps*s.target+r.count}`;$("vib").setAttribute("aria-pressed",s.vib);$("snd").setAttribute("aria-pressed",s.snd)};
  const beep=f=>{try{ctx??=new AudioContext();const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.06)}catch(e){}};
  $("tap").onclick=()=>{const r=rec();r.count++;let lap=false;if(r.count>=s.target){r.count=0;r.laps++;lap=true}
    if(s.vib)navigator.vibrate?.(lap?[60,40,60]:15);if(s.snd)beep(lap?880:520);save();draw()};
  $("undo").onclick=()=>{const r=rec();if(r.count>0)r.count--;else if(r.laps>0){r.laps--;r.count=s.target-1}save();draw()};
  $("reset").onclick=async()=>{if(await ask("Atur ulang hitungan?","Hitungan untuk bacaan ini kembali ke 0.","Atur ulang")){s.by[s.cur]={count:0,laps:0};save();draw()}};
  $("target").onchange=e=>{s.target=+e.target.value;Object.values(s.by).forEach(r=>{if(r.count>=s.target)r.count=0});save();draw()};
  $("vib").onclick=()=>{s.vib=!s.vib;save();draw()};$("snd").onclick=()=>{s.snd=!s.snd;save();draw()};
  $("presets").onclick=e=>{const b=e.target.closest("[data-p]");if(b){s.cur=b.dataset.p;save();draw()}};
  draw();
}
