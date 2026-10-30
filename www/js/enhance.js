/* Sidebar desktop yang bisa diciutkan (ala Claude) + tasbih melayang. Fitur lama tidak diubah. */
import "./lib/ftasbih.js";
const html=document.documentElement,btn=document.getElementById("sideToggle"),mobile=()=>matchMedia("(max-width:760px)").matches;
let pref=null;try{pref=localStorage.getItem("kl_sidebar_collapsed")}catch(e){}
const isCollapsed=()=>!mobile()&&(pref===null?innerWidth<1100:pref==="1");
function apply(){const c=isCollapsed();html.classList.toggle("sidebar-collapsed",c);if(!btn)return;btn.setAttribute("aria-expanded",String(!c));btn.setAttribute("aria-label",c?"Perluas sidebar":"Ciutkan sidebar");btn.dataset.tip=c?"Perluas sidebar (Ctrl+B)":"Ciutkan sidebar (Ctrl+B)"}
function toggle(){pref=isCollapsed()?"0":"1";try{localStorage.setItem("kl_sidebar_collapsed",pref)}catch(e){}apply()}
btn?.addEventListener("click",toggle);
addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==="b"&&!e.target.closest?.("input,textarea,[contenteditable]")&&!mobile()){e.preventDefault();toggle()}});
addEventListener("resize",apply);apply();
