/* Tarik ke bawah dari puncak halaman untuk memuat ulang (ala Instagram).
   Jari di layar sentuh, atau seret mouse saat tampilan ponsel. Hanya aktif jika halaman sudah di paling atas
   dan tarikannya tegak, sehingga tidak bentrok dengan geser samping (swipe.js) maupun scroll biasa. */
const TRIG=70,MAX=120,MIN_SPIN=700;
const mobile=()=>matchMedia("(max-width:760px)").matches;

export function initPullRefresh(view,refresh){
  const el=document.createElement("div");
  el.className="ptr";el.setAttribute("aria-hidden","true");
  el.innerHTML=`<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4.5h-4.5"/></svg>`;
  document.body.appendChild(el);
  const html=document.documentElement;
  let y0=null,x0=0,d=0,lock=null,busy=false,eatClick=false;

  const top=()=>document.getElementById("bar")?.getBoundingClientRect().bottom||0;
  const show=p=>{el.classList.remove("go","spin");el.style.opacity=Math.min(1,p/TRIG);el.style.transform=`translateY(${top()-40+Math.min(p,MAX)*.8}px) rotate(${p*3}deg)`};
  const hide=()=>{el.classList.add("go");el.classList.remove("spin");el.style.opacity=0;el.style.transform=`translateY(${top()-48}px)`};
  const blocked=t=>busy||view.scrollTop>0||html.dataset.chat==="1"||t.closest?.("input,textarea,select,[contenteditable],.modal,[data-noptr]");

  const start=(x,y,t)=>{if(blocked(t))return;y0=y;x0=x;d=0;lock=null};
  const move=(x,y,e)=>{
    if(y0===null)return;
    const dy=y-y0,dx=x-x0;
    if(lock===null){
      if(Math.abs(dy)<8&&Math.abs(dx)<8)return;
      lock=dy>0&&dy>Math.abs(dx)*1.2&&view.scrollTop<=0;
      if(!lock){y0=null;return}
      html.classList.add("ptr-drag");
    }
    if(e.cancelable)e.preventDefault();
    d=Math.max(0,dy*.55);show(d);
  };
  const end=async()=>{
    if(y0===null)return;
    y0=null;html.classList.remove("ptr-drag");
    if(!lock)return;
    eatClick=true;setTimeout(()=>eatClick=false,0);
    if(d<TRIG)return hide();
    busy=true;
    el.classList.add("go","spin");el.style.opacity=1;el.style.transform=`translateY(${top()+14}px)`;
    try{await Promise.all([refresh(),new Promise(r=>setTimeout(r,MIN_SPIN))])}catch(e){console.warn("muat ulang",e)}
    busy=false;hide();
  };

  view.addEventListener("touchstart",e=>{if(e.touches.length===1)start(e.touches[0].clientX,e.touches[0].clientY,e.target);else y0=null},{passive:true});
  view.addEventListener("touchmove",e=>move(e.touches[0].clientX,e.touches[0].clientY,e),{passive:false});
  view.addEventListener("touchend",end,{passive:true});
  view.addEventListener("touchcancel",()=>{if(y0!==null){y0=null;html.classList.remove("ptr-drag");hide()}},{passive:true});

  view.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button===0&&mobile())start(e.clientX,e.clientY,e.target)});
  addEventListener("pointermove",e=>{if(e.pointerType==="mouse")move(e.clientX,e.clientY,e)});
  addEventListener("pointerup",e=>{if(e.pointerType==="mouse")end()});
  /* Lepas tarikan mouse di atas tautan tidak boleh ikut membuka tautan itu */
  view.addEventListener("click",e=>{if(eatClick){e.preventDefault();e.stopPropagation()}},true);
  hide();
}
