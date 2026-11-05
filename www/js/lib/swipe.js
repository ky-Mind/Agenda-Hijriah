/* Geser horizontal di ponsel untuk pindah antar halaman utama (urutan sama dengan navigasi bawah), seperti WhatsApp:
   halaman sebelah ikut bergeser masuk bersama jari. Isinya diambil dari potret halaman itu (window.KLSnap, diisi
   app.js setiap kali halaman ditinggalkan; kerangka HTML bila belum pernah dibuka). Bila dilepas cukup jauh, kedua
   halaman meluncur sampai penuh lalu halaman asli dipasang menggantikan potretnya tanpa animasi; bila belum, kembali. */
const SEQ=["beranda","absensi","kalender","shalat","koleksi","profil"];
const LIMIT=.22,FLICK=.5,DUR=260;
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
  let sx=null,sy=0,t0=0,dx=0,lock=null,target=null,dir=0,busy=false,timer=0,pending=false,peek=null;

  /* Halaman sebelah (potret) ditempatkan di sel grid yang sama dengan #view, digeser selebar layar ke sisinya */
  const makePeek=()=>{
    dropPeek();
    if(!target)return;
    const s=(window.KLSnap||{})[target],cs=getComputedStyle(view);
    peek=document.createElement("div");peek.className="peek";peek.setAttribute("aria-hidden","true");
    peek.style.padding=cs.padding;
    peek.innerHTML=s?s.html:"";
    if(s?.mt)peek.dataset.mobileTitle=s.mt;
    view.after(peek);
  };
  const dropPeek=()=>{if(peek){peek.remove();peek=null}};
  const put=(px,tr)=>{
    const w=view.clientWidth;
    view.style.transition=tr;view.style.transform=px?`translate3d(${px}px,0,0)`:"";
    if(peek){peek.style.transition=tr;peek.style.transform=`translate3d(${px+dir*w}px,0,0)`}
  };
  const reset=()=>{view.style.transition="";view.style.transform="";view.style.opacity="";dropPeek()};
  const settle=(px,then,ms=DUR)=>{
    put(px,`transform ${ms}ms var(--ease)`);
    const done=()=>{view.removeEventListener("transitionend",done);clearTimeout(timer);then?.()};
    view.addEventListener("transitionend",done);
    timer=setTimeout(done,ms+80);
  };

  /* Halaman baru sudah dipasang (app.js, tanpa animasi): potret dilepas, halaman asli tepat di tempatnya */
  document.addEventListener("kl-rendered",()=>{
    if(!pending)return;
    pending=false;busy=false;
    view.style.transition="none";view.style.transform="";dropPeek();
  });

  view.addEventListener("touchstart",e=>{
    if(busy||!mobile()||e.touches.length!==1||blocked(e.target,view)){sx=null;return}
    /* Tepi kiri di halaman anak = geser kembali (initBackSwipe) */
    if(e.touches[0].clientX<28&&!document.getElementById("back")?.hidden){sx=null;return}
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;t0=Date.now();dx=0;lock=null;target=null;dir=0;
  },{passive:true});

  view.addEventListener("touchmove",e=>{
    if(sx===null)return;
    if(e.touches.length!==1){const wasH=lock==="h";sx=null;if(wasH)settle(0,reset);return}
    const x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;
    if(lock===null){
      if(Math.abs(x)<16&&Math.abs(y)<16)return;
      /* Ketukan yang sedikit bergeser (mis. mencentang absensi) tidak dianggap geser halaman */
      lock=Math.abs(x)>Math.abs(y)*1.8?"h":"v";
      if(lock==="h"){dir=x<0?1:-1;target=neighbor(dir);makePeek()}
    }
    if(lock!=="h")return;
    if(e.cancelable)e.preventDefault();
    /* Arah berbalik melewati titik awal: ganti halaman sebelah yang ditampilkan */
    const nd=x<0?1:-1;
    if(nd!==dir&&x!==0){dir=nd;target=neighbor(dir);makePeek()}
    dx=x;
    put(target?dx:dx*.25,"none");
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
      const ms=Math.max(140,Math.min(DUR,(w-Math.abs(dx))/Math.max(.6,Math.abs(v))));
      settle(-dir*w,()=>{
        view.dataset.swipeNext="1";
        pending=true;
        location.hash="#/"+target;
        /* Jika halaman tidak berpindah (misal ditahan penjaga perubahan), kembalikan posisi */
        setTimeout(()=>{if(pending){pending=false;delete view.dataset.swipeNext;busy=false;settle(0,reset)}},1500);
      },ms);
    }else{
      settle(0,reset);
    }
  };
  view.addEventListener("touchend",end,{passive:true});
  view.addEventListener("touchcancel",()=>{if(sx!==null){sx=null;if(lock==="h")settle(0,reset)}},{passive:true});
}

/* Geser dari tepi kiri untuk kembali ke halaman induk (halaman anak: Tasbih, Dzikir, isi surah, dll.), seperti
   iPhone/WhatsApp: halaman ini mengikuti jari ke kanan, dan halaman induk (potretnya) tampil di belakang, ikut bergeser
   sedikit. Dilepas cukup jauh: halaman ini meluncur keluar lalu halaman induk dipasang tanpa animasi. */
export function initBackSwipe(view,backBtn){
  let sx=null,sy=0,t0=0,dx=0,lock=null,peek=null,pending=false,timer=0;
  const W=()=>view.clientWidth;
  const dropPeek=()=>{if(peek){peek.remove();peek=null}};
  const put=(px,tr)=>{
    view.style.transition=tr;view.style.transform=px?`translate3d(${px}px,0,0)`:"";
    view.style.boxShadow=px?"-10px 0 24px rgba(0,0,0,.25)":"";
    if(peek){peek.style.transition=tr;peek.style.transform=`translate3d(${(px-W())*.3}px,0,0)`;peek.style.filter=`brightness(${.75+.25*Math.min(1,px/W())})`}
  };
  const reset=()=>{view.style.transition="";view.style.transform="";view.style.boxShadow="";dropPeek()};
  const settle=(px,then,ms=240)=>{
    put(px,`transform ${ms}ms var(--ease),filter ${ms}ms`);
    const done=()=>{view.removeEventListener("transitionend",done);clearTimeout(timer);then?.()};
    view.addEventListener("transitionend",done);timer=setTimeout(done,ms+80);
  };
  document.addEventListener("kl-rendered",()=>{if(!pending)return;pending=false;view.style.transition="none";view.style.transform="";view.style.boxShadow="";dropPeek()});
  view.addEventListener("touchstart",e=>{
    const t=e.touches[0];
    if(backBtn.hidden||!mobile()||e.touches.length!==1||t.clientX>=28){sx=null;return}
    sx=t.clientX;sy=t.clientY;t0=Date.now();dx=0;lock=null;
  },{passive:true});
  view.addEventListener("touchmove",e=>{
    if(sx===null)return;
    const x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;
    if(lock===null){
      if(Math.abs(x)<10&&Math.abs(y)<10)return;
      lock=x>0&&x>Math.abs(y)?"h":"v";
      if(lock==="h"){
        const key=(backBtn.dataset.to||"#/beranda").replace(/^#\/?/,""),s=(window.KLSnap||{})[key]||(window.KLSnap||{})[key.split("/")[0]];
        peek=document.createElement("div");peek.className="peek";peek.setAttribute("aria-hidden","true");
        peek.style.padding=getComputedStyle(view).padding;peek.style.zIndex="0";peek.innerHTML=s?s.html:"";if(s?.mt)peek.dataset.mobileTitle=s.mt;
        view.before(peek);
      }
    }
    if(lock!=="h")return;
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    dx=Math.max(0,x);put(dx,"none");
  },{passive:false});
  const end=()=>{
    if(sx===null)return;const wasH=lock==="h";sx=null;if(!wasH)return;
    const v=dx/Math.max(1,Date.now()-t0);
    if(dx>W()*.33||v>.5){
      settle(W(),()=>{view.dataset.swipeNext="1";pending=true;backBtn.click();
        setTimeout(()=>{if(pending){pending=false;delete view.dataset.swipeNext;settle(0,reset)}},1500)},Math.max(140,Math.min(240,(W()-dx)/Math.max(.6,v))));
    }else settle(0,reset);
  };
  view.addEventListener("touchend",end,{passive:true});
  view.addEventListener("touchcancel",()=>{if(sx!==null){sx=null;if(lock==="h")settle(0,reset)}},{passive:true});
}
