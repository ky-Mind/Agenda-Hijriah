/* Geser samping di dalam halaman, seperti tab WhatsApp: panel yang sedang tampil mengikuti jari, dan panel sebelahnya
   (salinan yang dibuat oleh `tetangga`) ikut bergeser masuk dari sisinya. Dilepas cukup jauh: keduanya meluncur penuh,
   lalu `pindah` memasang isi asli tanpa animasi; belum cukup: kembali ke tempatnya.
   Dipakai Al-Qur'an (halaman ayat) dan Profil (tab pengaturan).
   opsi: aktif() → panel saat ini (Element) | null; tetangga(arah) → Element pratinjau | null (arah 1 = berikutnya/ke kiri);
         pindah(arah) → pasang isi asli; boleh(target) → false untuk menolak geser dari elemen tertentu */
const LIMIT=.22,FLICK=.5,DUR=240,JARAK=16;
const lewati=(el,root)=>{
  for(let e=el;e&&e!==root;e=e.parentElement){
    if(e.matches?.("input,textarea,select,[contenteditable],[data-noswipe],.modal,input[type=range]"))return true;
    if(e.scrollWidth>e.clientWidth+2){const ox=getComputedStyle(e).overflowX;if(ox==="auto"||ox==="scroll")return true}
  }
  return false;
};

export function geser(area,{aktif,tetangga,pindah,boleh=()=>true}){
  let sx=null,sy=0,t0=0,dx=0,lock=null,dir=0,cur=null,pv=null,ada=false,sibuk=false,dragged=false;
  const lebar=()=>(cur?.offsetWidth||area.clientWidth)+JARAK;
  const buang=()=>{if(pv){pv.remove();pv=null}};
  const buat=()=>{
    buang();ada=false;
    const el=tetangga(dir);if(!el||!cur)return;
    const par=cur.parentElement;if(getComputedStyle(par).position==="static")par.style.position="relative";
    pv=el;pv.setAttribute("aria-hidden","true");pv.classList.add("geser-pv");
    pv.style.top=cur.offsetTop+"px";pv.style.left=cur.offsetLeft+"px";pv.style.width=cur.offsetWidth+"px";
    par.appendChild(pv);ada=true;
  };
  const taruh=(px,tr)=>{
    if(cur){cur.style.transition=tr;cur.style.transform=px?`translate3d(${px}px,0,0)`:""}
    if(pv){pv.style.transition=tr;pv.style.transform=`translate3d(${px+dir*lebar()}px,0,0)`}
  };
  const pulih=()=>{if(cur){cur.style.transition="";cur.style.transform=""}buang();area.classList.remove("geser-on")};
  const luncur=(px,lalu,ms=DUR)=>{
    taruh(px,`transform ${ms}ms var(--ease)`);
    let t=0;const sel=()=>{clearTimeout(t);cur?.removeEventListener("transitionend",sel);lalu?.()};
    cur?.addEventListener("transitionend",sel);t=setTimeout(sel,ms+80);
  };

  area.addEventListener("touchstart",e=>{
    if(sibuk||e.touches.length!==1||lewati(e.target,area)||!boleh(e.target)){sx=null;return}
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;t0=Date.now();dx=0;lock=null;dir=0;
    /* Tepi kiri layar dipakai untuk geser kembali (swipe.js) */
    if(sx<28&&!document.getElementById("back")?.hidden)sx=null;
  },{passive:true});
  area.addEventListener("touchmove",e=>{
    if(sx===null)return;
    const x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;
    if(lock===null){
      if(Math.abs(x)<16&&Math.abs(y)<16)return;
      lock=Math.abs(x)>Math.abs(y)*1.8?"h":"v";
      if(lock==="h"){cur=aktif();if(!cur){lock="v";return}dir=x<0?1:-1;buat();
        /* Tidak ada panel sebelah di arah ini: biarkan geseran pindah halaman utama (swipe.js) yang menangani */
        if(!ada){sx=null;return}
        area.classList.add("geser-on")}
    }
    if(lock!=="h")return;
    if(e.cancelable)e.preventDefault();
    e.stopPropagation();
    const nd=x<0?1:-1;if(nd!==dir&&x!==0){dir=nd;buat()}
    dx=x;taruh(ada?dx:dx*.25,"none");
  },{passive:false});
  const akhir=()=>{
    if(sx===null)return;
    const wasH=lock==="h";sx=null;if(!wasH)return;
    dragged=true;setTimeout(()=>dragged=false,60);
    const w=lebar(),v=dx/Math.max(1,Date.now()-t0),flick=Math.abs(v)>FLICK&&Math.sign(v)===-dir;
    if(ada&&(Math.abs(dx)>w*LIMIT||flick)){
      sibuk=true;
      const ms=Math.max(140,Math.min(DUR,(w-Math.abs(dx))/Math.max(.6,Math.abs(v))));
      luncur(-dir*w,()=>{
        const d=dir;
        if(cur){cur.style.transition="none";cur.style.transform=""}
        buang();area.classList.remove("geser-on");
        pindah(d);sibuk=false;
      },ms);
    }else luncur(0,pulih);
  };
  area.addEventListener("touchend",akhir,{passive:true});
  area.addEventListener("touchcancel",()=>{if(sx!==null){sx=null;if(lock==="h")luncur(0,pulih)}},{passive:true});
  /* Ketukan tepat setelah menggeser tidak dihitung sebagai klik */
  area.addEventListener("click",e=>{if(dragged){e.preventDefault();e.stopPropagation()}},true);
}
