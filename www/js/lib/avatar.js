import {esc} from "./ui.js";
export const paint=(el,name,photo)=>{if(el)el.innerHTML=photo?`<img src="${esc(photo)}" alt="">`:esc((name||"?").trim().charAt(0).toUpperCase()||"?")};
/* Resolve: dataURL JPEG 256px | undefined (dibatalkan) | null (gagal diproses) */
export function cropPhoto(file){return new Promise(done=>{
  const fr=new FileReader();fr.onerror=()=>done(null);
  fr.onload=()=>{const img=new Image();img.onerror=()=>done(null);img.onload=()=>open(img,done);img.src=fr.result};fr.readAsDataURL(file)})}
function open(img,done){
  const S=300,m=document.createElement("div");m.className="modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  m.innerHTML=`<div class="box"><h2>Atur foto profil</h2><p class="muted" style="margin:4px 0 10px">Geser foto untuk menempatkan, gunakan slider untuk memperbesar.</p><canvas width="${S}" height="${S}" aria-label="Pratinjau foto"></canvas><input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom" style="width:100%;margin-top:10px"><div class="row sp mt"><button class="btn" data-x>Batal</button><button class="btn primary" data-ok>Simpan foto</button></div></div>`;
  document.body.appendChild(m);
  const c=m.querySelector("canvas"),g=c.getContext("2d"),rg=m.querySelector("input"),base=Math.max(S/img.width,S/img.height);
  let z=1,ox=(S-img.width*base)/2,oy=(S-img.height*base)/2,drag=null;
  const draw=()=>{const w=img.width*base*z,h=img.height*base*z;ox=Math.min(0,Math.max(S-w,ox));oy=Math.min(0,Math.max(S-h,oy));g.fillStyle="#fff";g.fillRect(0,0,S,S);g.drawImage(img,ox,oy,w,h)};
  c.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};c.setPointerCapture(e.pointerId)};
  c.onpointermove=e=>{if(!drag)return;const k=S/c.getBoundingClientRect().width;ox+=(e.clientX-drag.x)*k;oy+=(e.clientY-drag.y)*k;drag={x:e.clientX,y:e.clientY};draw()};
  c.onpointerup=c.onpointercancel=()=>{drag=null};
  rg.oninput=()=>{const n=+rg.value,s0=base*z,s1=base*n,cx=(S/2-ox)/s0,cy=(S/2-oy)/s0;z=n;ox=S/2-cx*s1;oy=S/2-cy*s1;draw()};
  const key=e=>{if(e.key==="Escape")close(undefined)};
  const close=v=>{document.removeEventListener("keydown",key);m.remove();done(v)};
  document.addEventListener("keydown",key);
  m.onclick=e=>{if(e.target===m||e.target.closest("[data-x]"))close(undefined);else if(e.target.closest("[data-ok]")){const o=document.createElement("canvas");o.width=o.height=256;o.getContext("2d").drawImage(c,0,0,256,256);close(o.toDataURL("image/jpeg",.85))}};
  draw();m.querySelector("[data-ok]").focus()}
