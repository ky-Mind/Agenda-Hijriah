/* Tasbih melayang: seret ke mana saja, ketuk untuk menghitung. Tersimpan di perangkat ini (tidak disinkronkan). */
import {toast,get,set} from "../store.js";
const KEY="kl_ft",TARGETS=[33,99,100,1000],M=8;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}};
const S={count:0,laps:0,target:33,mode:"full",fx:1,fy:.62,...read()};
if(!TARGETS.includes(S.target))S.target=33;if(!["full","mini","off"].includes(S.mode))S.mode="full";
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
/* Getar mengikuti pengaturan target dzikir yang sedang dipilih di halaman Tasbih (default aktif) */
const tasbihPref=()=>get("tasbih",{});
const vibOn=()=>{const t=tasbihPref();return !(t.vibBy&&t.vibBy[t.cur||"sub"]===false)};
const vib=p=>{if(vibOn())try{navigator.vibrate?.(p)}catch(e){}};
const el=document.createElement("div");el.className="ft";el.id="ft";el.hidden=true;
el.innerHTML=`<div class="ft-body" role="button" tabindex="0" aria-label="Tasbih melayang. Ketuk untuk menambah hitungan, seret untuk memindahkan"><svg class="ft-ring" viewBox="0 0 120 120" aria-hidden="true"><g data-beads></g></svg><div class="ft-mid"><strong data-c>0</strong><small data-s></small></div><span class="ft-laps" data-l hidden></span><svg class="ft-tassel" viewBox="0 0 24 34" aria-hidden="true"><path d="M12 0v9" /><circle cx="12" cy="11" r="3" fill="currentColor" /><path d="M8.5 15h7l1.6 17H6.9z" fill="currentColor" stroke="none" /></svg></div><button class="ft-more" type="button" aria-label="Pengaturan tasbih" aria-expanded="false"><svg class="ic"><use href="#i-dots" /></svg></button><div class="ft-panel" hidden><button type="button" data-a="minus"><svg class="ic"><use href="#i-minus" /></svg>Kurangi satu</button><button type="button" data-a="reset"><svg class="ic"><use href="#i-reset" /></svg>Atur ulang</button><button type="button" data-a="target"><svg class="ic"><use href="#i-beads" /></svg><span data-t></span></button><button type="button" data-a="vib"><svg class="ic"><use href="#i-bell" /></svg><span data-v></span></button><button type="button" data-a="size"><svg class="ic"><use href="#i-panel" /></svg><span data-z></span></button><button type="button" data-a="hide"><svg class="ic"><use href="#i-x" /></svg>Sembunyikan</button></div>`;
document.body.appendChild(el);
const q=s=>el.querySelector(s),body=q(".ft-body"),panel=q(".ft-panel"),more=q(".ft-more"),g=q("[data-beads]");
function beads(){const n=Math.min(S.target,33);let h="";for(let i=0;i<n;i++){const a=2*Math.PI*i/n-Math.PI/2;h+=`<circle cx="${(60+49*Math.cos(a)).toFixed(1)}" cy="${(60+49*Math.sin(a)).toFixed(1)}" r="${n>40?3:4.6}"/>`}g.innerHTML=h;lit()}
function lit(){const k=Math.floor(S.count/S.target*Math.min(S.target,33)+1e-9);[...g.children].forEach((c,i)=>c.classList.toggle("on",i<k))}
function place(){const w=el.offsetWidth,h=el.offsetHeight;if(!w)return;el.style.left=Math.round(M+S.fx*Math.max(0,innerWidth-w-2*M))+"px";el.style.top=Math.round(M+S.fy*Math.max(0,innerHeight-h-2*M))+"px"}
function render(){el.hidden=S.mode==="off";el.dataset.mode=S.mode;q("[data-c]").textContent=S.count;q("[data-s]").textContent=`${S.count}/${S.target}`;
  const l=q("[data-l]");l.hidden=!S.laps;l.textContent="×"+S.laps;q("[data-t]").textContent="Target "+S.target;q("[data-z]").textContent=S.mode==="mini"?"Perbesar":"Kecilkan";q("[data-v]").textContent=vibOn()?"Getar: aktif":"Getar: mati";lit();if(!el.hidden)place();
  body.setAttribute("aria-label",`Tasbih melayang, hitungan ${S.count} dari ${S.target}. Ketuk untuk menambah, seret untuk memindahkan`)}
function tap(){S.count++;vib(10);if(S.count>=S.target){S.laps++;S.count=0;vib([40,30,40,30,90]);el.classList.add("done");setTimeout(()=>el.classList.remove("done"),900)}save();render();el.classList.remove("bump");void el.offsetWidth;el.classList.add("bump")}
function openPanel(o){panel.hidden=!o;more.setAttribute("aria-expanded",String(o));if(!o)return;const r=el.getBoundingClientRect();panel.className="ft-panel "+(r.top+r.height/2>innerHeight/2?"up":"down")+" "+(r.left+r.width/2>innerWidth/2?"r":"l")}
let d=null;
body.addEventListener("pointerdown",e=>{if(e.button>0)return;try{body.setPointerCapture(e.pointerId)}catch(x){}d={id:e.pointerId,x:e.clientX,y:e.clientY,l:el.offsetLeft,t:el.offsetTop,moved:false,long:false,lp:setTimeout(()=>{if(d&&!d.moved){d.long=true;openPanel(true);vib(12)}},550)}});
body.addEventListener("pointermove",e=>{if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!d.moved&&Math.hypot(dx,dy)>6){d.moved=true;clearTimeout(d.lp);openPanel(false);el.classList.add("drag")}
  if(d.moved){el.style.left=Math.min(Math.max(M,d.l+dx),innerWidth-el.offsetWidth-M)+"px";el.style.top=Math.min(Math.max(M,d.t+dy),innerHeight-el.offsetHeight-M)+"px"}});
const end=e=>{if(!d||d.id!==e.pointerId)return;clearTimeout(d.lp);const w=d;d=null;el.classList.remove("drag");
  if(w.moved){const mx=innerWidth-el.offsetWidth-2*M,my=innerHeight-el.offsetHeight-2*M;S.fx=mx>0?(el.offsetLeft-M)/mx:1;S.fy=my>0?(el.offsetTop-M)/my:.5;S.fx=Math.min(1,Math.max(0,S.fx));S.fy=Math.min(1,Math.max(0,S.fy));save()}
  else if(!w.long&&e.type==="pointerup")tap()};
body.addEventListener("pointerup",end);body.addEventListener("pointercancel",end);
body.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tap()}});
more.addEventListener("click",e=>{e.stopPropagation();openPanel(panel.hidden)});
document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!el.contains(e.target))openPanel(false)});
const announce=()=>document.dispatchEvent(new CustomEvent("kl-ftasbih",{detail:{on:S.mode!=="off"}}));
panel.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
  if(a==="minus"){if(S.count>0)S.count--;else if(S.laps>0){S.laps--;S.count=S.target-1}}
  else if(a==="reset"){S.count=0;S.laps=0}
  else if(a==="target"){S.target=TARGETS[(TARGETS.indexOf(S.target)+1)%TARGETS.length];if(S.count>=S.target)S.count=0;beads()}
  else if(a==="vib"){const t=tasbihPref(),c=t.cur||"sub";set("tasbih",{...t,vibBy:{...(t.vibBy||{}),[c]:!vibOn()}})}
  else if(a==="size"){S.mode=S.mode==="mini"?"full":"mini";openPanel(false);save();render();requestAnimationFrame(place);return}
  else if(a==="hide"){S.mode="off";openPanel(false);save();render();announce();toast("Tasbih melayang disembunyikan. Aktifkan lagi dari ikon tasbih di Beranda atau Profil › Tampilan.");return}
  save();render();openPanel(false)});
function toggle(){S.mode=S.mode==="off"?"full":"off";save();render();requestAnimationFrame(place);announce()}
document.addEventListener("kl-ftasbih-toggle",toggle);
addEventListener("resize",()=>{if(!el.hidden)place()});
window.KLFloatTasbih={isOn:()=>S.mode!=="off",toggle};
beads();render();requestAnimationFrame(place);
