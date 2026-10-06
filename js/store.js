const P="kl2_";
export const get=(k,d)=>{try{const v=localStorage.getItem(P+k);return v==null?d:JSON.parse(v)}catch(e){return d}};
export const set=(k,v)=>{try{localStorage.setItem(P+k,JSON.stringify(v))}catch(e){toast("Penyimpanan penuh")}};
export const del=k=>localStorage.removeItem(P+k);
export const keys=pre=>Object.keys(localStorage).filter(k=>k.startsWith(P+pre)).map(k=>k.slice(P.length));
export function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),1800)}
