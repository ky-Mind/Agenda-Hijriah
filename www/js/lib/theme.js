import {get,set} from "../store.js";
/* Ganti tema dengan animasi lingkaran yang menyebar dari sudut kiri atas logo (ala Telegram).
   Mengembalikan false jika tema itu sudah aktif, sehingga tidak ada animasi dan tidak ada perubahan. */
const sysDark=()=>matchMedia("(prefers-color-scheme:dark)").matches;
const resolve=t=>t==="auto"?(sysDark()?"dark":"light"):t;
function origin(){const im=[...document.querySelectorAll(".brand img,.brand-m img")].find(i=>i.getBoundingClientRect().width>0);const r=im?im.getBoundingClientRect():{left:0,top:0};return{x:r.left,y:r.top}}
export function setTheme(t){
  const root=document.documentElement,next=resolve(t);
  if(get("theme","auto")===t&&root.dataset.theme===next)return false;
  set("theme",t);
  const apply=()=>{root.dataset.theme=next};
  if(!document.startViewTransition||matchMedia("(prefers-reduced-motion:reduce)").matches){apply();return true}
  const {x,y}=origin(),r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  root.dataset.vt="theme";
  const vt=document.startViewTransition(apply);
  vt.finished.then(()=>delete root.dataset.vt);
  vt.ready.then(()=>root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${r}px at ${x}px ${y}px)`]},{duration:800,easing:"cubic-bezier(.22,.8,.24,1)",pseudoElement:"::view-transition-new(root)"}));
  return true;
}
