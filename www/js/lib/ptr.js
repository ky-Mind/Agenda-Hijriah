/* Tarik ke bawah dari puncak halaman untuk memuat ulang (ala fadzkuruuni), hanya di Beranda dan Profil.
   Isi halaman ikut turun dan memperlihatkan logo Kisah Lillah yang terbelah dua (pita hijau & emas):
   makin jauh ditarik, kedua bagian berputar mendekat lalu menyatu menjadi logo utuh. Dilepas setelah menyatu =
   logo berputar selama memuat, lalu halaman dimuat ulang (data cloud terbaru + versi aplikasi terbaru).
   Jari di layar sentuh, atau seret mouse saat tampilan ponsel. Tarikan harus tegak dan halaman di paling atas,
   sehingga tidak bentrok dengan geser samping (swipe.js) maupun scroll biasa. */
const TRIG=64,MAX=120,TINGGI=70,MIN_SPIN=900;
const mobile=()=>matchMedia("(max-width:760px)").matches;
const boleh=()=>/^#?\/?(beranda|profil)?$/.test(location.hash);

export function initPullRefresh(view,refresh){
  const el=document.createElement("div");
  el.className="ptr";el.setAttribute("aria-hidden","true");
  el.innerHTML=`<span class="ptr-logo"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" pathLength="100"/><circle class="ptr-jejak" cx="24" cy="24" r="22" pathLength="100"/></svg><i class="ptr-a"></i><i class="ptr-b"></i></span><small>Tarik untuk memuat ulang</small>`;
  document.body.appendChild(el);
  const html=document.documentElement,teks=el.querySelector("small"),jejak=el.querySelector(".ptr-jejak");
  let y0=null,x0=0,d=0,lock=null,busy=false,eatClick=false;

  /* Header tetap di tempat; hanya isi halaman yang turun, logo muncul di ruang kosong di bawah header */
  const top=()=>document.getElementById("bar")?.getBoundingClientRect().bottom||0;
  const tulis=t=>{if(teks.textContent!==t)teks.textContent=t};
  /* y = jarak tarikan; anim = meluncur halus (lepas/selesai) */
  const set=(y,anim)=>{
    const tr=anim?"transform .34s cubic-bezier(.22,.8,.3,1),opacity .3s":"none";
    view.style.transition=el.style.transition=tr;
    view.style.transform=y?`translateY(${y}px)`:"";
    el.style.top=top()+"px";
    el.style.transform=`translate(-50%,${Math.min(y-TINGGI,0)+8}px)`;
    el.style.opacity=Math.min(1,Math.max(0,(y-16)/40));
    if(!el.classList.contains("spin")){const k=Math.min(1,y/TRIG);el.style.setProperty("--k",k.toFixed(3));jejak.style.strokeDashoffset=100-k*100}
  };
  const blocked=t=>busy||!boleh()||view.scrollTop>0||html.dataset.chat==="1"||t.closest?.("input,textarea,select,[contenteditable],.modal,[data-noptr]");

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
    d=Math.min(MAX,Math.max(0,dy*.5));set(d);
    const siap=d>=TRIG;el.classList.toggle("siap",siap);tulis(siap?"Lepaskan untuk memuat ulang":"Tarik untuk memuat ulang");
  };
  const end=async()=>{
    if(y0===null)return;
    y0=null;html.classList.remove("ptr-drag");
    if(!lock)return;
    eatClick=true;setTimeout(()=>eatClick=false,0);
    if(d<TRIG){el.classList.remove("siap");return set(0,true)}
    busy=true;
    el.classList.add("spin");el.style.setProperty("--k",1);jejak.style.strokeDashoffset=0;tulis("Memuat…");set(TINGGI+10,true);
    /* Ambil data cloud terbaru, lalu muat ulang agar pembaruan aplikasi ikut terpasang */
    try{await Promise.all([refresh(),new Promise(r=>setTimeout(r,MIN_SPIN))])}catch(e){console.warn("muat ulang",e)}
    location.reload();
  };

  view.addEventListener("touchstart",e=>{if(e.touches.length===1)start(e.touches[0].clientX,e.touches[0].clientY,e.target);else y0=null},{passive:true});
  view.addEventListener("touchmove",e=>move(e.touches[0].clientX,e.touches[0].clientY,e),{passive:false});
  view.addEventListener("touchend",end,{passive:true});
  view.addEventListener("touchcancel",()=>{if(y0!==null){y0=null;html.classList.remove("ptr-drag");set(0,true)}},{passive:true});

  view.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button===0&&mobile())start(e.clientX,e.clientY,e.target)});
  addEventListener("pointermove",e=>{if(e.pointerType==="mouse")move(e.clientX,e.clientY,e)});
  addEventListener("pointerup",e=>{if(e.pointerType==="mouse")end()});
  /* Lepas tarikan mouse di atas tautan tidak boleh ikut membuka tautan itu */
  view.addEventListener("click",e=>{if(eatClick){e.preventDefault();e.stopPropagation()}},true);
  set(0);
}
