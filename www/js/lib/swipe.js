/* Geser horizontal di ponsel untuk pindah antar halaman utama (urutan sama dengan navigasi bawah).
   Halaman mengikuti jari, lalu meluncur ke halaman tujuan atau kembali jika geserannya belum cukup. */
const SEQ=["beranda","absensi","kalender","shalat","koleksi","profil"];
const LIMIT=.22,FLICK=.5,DUR=360;
const mobile=()=>matchMedia("(max-width:760px)").matches;

function current(){
  const [name="beranda",...args]=location.hash.replace(/^#\/?/,"").split("/");
  return{name:name||"beranda",args};
}
function neighbor(d){
  const{name,args}=current();
  if(args.length||document.documentElement.dataset.chat==="1")return null;
  const i=SEQ.indexOf(name);
  return i<0?null:SEQ[i+d]||null;
}
/* Jangan bajak geseran di input, daftar yang bisa digeser samping, atau dialog */
function blocked(el,view){
  for(let e=el;e&&e!==view;e=e.parentElement){
    if(e.matches?.("input,textarea,select,[contenteditable],[data-noswipe],.modal,input[type=range]"))return true;
    if(e.scrollWidth>e.clientWidth+2){
      const ox=getComputedStyle(e).overflowX;
      if(ox==="auto"||ox==="scroll")return true;
    }
  }
  return false;
}

export function initSwipe(view){
  let sx=null,sy=0,t0=0,dx=0,lock=null,target=null,dir=0,busy=false,timer=0,enterDir=0;

  const reset=()=>{view.style.transition="";view.style.transform="";};
  const move=px=>{view.style.transition="none";view.style.transform=`translate3d(${px}px,0,0)`;};
  const settle=(px,then)=>{
    view.style.transition=`transform ${DUR}ms var(--ease)`;
    view.style.transform=`translate3d(${px}px,0,0)`;
    const done=()=>{view.removeEventListener("transitionend",done);clearTimeout(timer);then?.()};
    view.addEventListener("transitionend",done);
    timer=setTimeout(done,DUR+80);
  };

  /* Dipanggil dari app.js setelah halaman baru dipasang: masuk dari sisi asal geseran */
  document.addEventListener("kl-rendered",()=>{
    if(!enterDir)return;
    const d=enterDir;enterDir=0;busy=false;
    move(d*view.clientWidth);
    void view.offsetWidth;
    settle(0,reset);
  });

  view.addEventListener("touchstart",e=>{
    if(busy||!mobile()||e.touches.length!==1||blocked(e.target,view)){sx=null;return}
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;t0=Date.now();dx=0;lock=null;target=null;dir=0;
  },{passive:true});

  view.addEventListener("touchmove",e=>{
    if(sx===null)return;
    if(e.touches.length!==1){const wasH=lock==="h";sx=null;if(wasH)settle(0,reset);return}
    const x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;
    if(lock===null){
      if(Math.abs(x)<8&&Math.abs(y)<8)return;
      lock=Math.abs(x)>Math.abs(y)*1.2?"h":"v";
      if(lock==="h"){dir=x<0?1:-1;target=neighbor(dir)}
    }
    if(lock!=="h")return;
    if(e.cancelable)e.preventDefault();
    dx=x;
    const resist=target?1:.25;
    move(dx*resist);
  },{passive:false});

  const end=()=>{
    if(sx===null)return;
    const wasH=lock==="h";
    sx=null;
    if(!wasH)return;
    const w=view.clientWidth,v=dx/Math.max(1,Date.now()-t0);
    const flick=Math.abs(v)>FLICK&&Math.sign(v)===-dir;
    if(target&&(Math.abs(dx)>w*LIMIT||flick)){
      busy=true;
      settle(-dir*w,()=>{
        view.dataset.swipeNext="1";
        enterDir=dir;
        location.hash="#/"+target;
        /* Jika halaman tidak berpindah (misal ditahan penjaga perubahan), kembalikan posisi */
        setTimeout(()=>{if(enterDir){enterDir=0;delete view.dataset.swipeNext;busy=false;settle(0,reset)}},1500);
      });
    }else{
      settle(0,reset);
    }
  };
  view.addEventListener("touchend",end,{passive:true});
  view.addEventListener("touchcancel",()=>{if(sx!==null){sx=null;if(lock==="h")settle(0,reset)}},{passive:true});
}
