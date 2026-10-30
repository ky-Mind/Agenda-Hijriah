import {get,set} from "../store.js";
/* Ganti tema dengan animasi lingkaran yang menyebar dari pojok kiri atas logo.
   Mengembalikan false jika tema itu sudah aktif, sehingga tidak ada animasi dan tidak ada perubahan. */
const sysDark=()=>matchMedia("(prefers-color-scheme:dark)").matches;
const resolve=t=>t==="auto"?(sysDark()?"dark":"light"):t;
function origin(){
  const logo=[...document.querySelectorAll(".brand img,.brand-m img")].find(i=>{
    const r=i.getBoundingClientRect();
    return r.width>0&&r.height>0;
  });
  if(logo){const r=logo.getBoundingClientRect();return{x:r.left,y:r.top}}
  const bar=document.getElementById("bar"),r=bar?.getBoundingClientRect();
  return{x:r?.left||0,y:r?.top||0};
}
export function setTheme(t){
  const root=document.documentElement,next=resolve(t);
  if(get("theme","auto")===t&&root.dataset.theme===next)return false;
  set("theme",t);
  const apply=()=>{root.dataset.theme=next};
  if(!document.startViewTransition||matchMedia("(prefers-reduced-motion:reduce)").matches){apply();return true}
  const {x,y}=origin(),r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  root.dataset.vt="theme";
  const vt=document.startViewTransition(apply);
  const clear=()=>delete root.dataset.vt;
  vt.finished.then(clear,clear);
  vt.ready.then(()=>root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${r}px at ${x}px ${y}px)`]},{duration:800,easing:"cubic-bezier(.4,0,.2,1)",pseudoElement:"::view-transition-new(root)"}));
  return true;
}
