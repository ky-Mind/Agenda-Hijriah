import {esc} from "./ui.js";
import {hijri,hijriMonth,key,addDays,BULAN,MASEHI} from "./hijri.js";
/* Pemilih tanggal / bulan yang dibuka dari ikon kalender di bilah atas (bottom sheet di ponsel).
   mode "day": pilih tanggal, judul bisa diketuk untuk loncat bulan/tahun. mode "month": langsung pilih bulan dalam setahun.
   cal "masehi" | "hijri". dot(key) → 0 kosong, 1 sebagian, 2 lengkap (titik di bawah tanggal).
   Hasil: Date terpilih (untuk mode "month": tanggal pertama bulan itu), atau null jika dibatalkan. */
const WD=["Ahd","Sen","Sel","Rab","Kam","Jum","Sab"];

/* Tanggal pertama bulan Hijriah (y, m): mulai dari perkiraan 29,53 hari per bulan lalu dikoreksi per bulan */
function hijriStart(y,m){
  const now=new Date(),h=hijri(now);
  let d=addDays(now,Math.round(((y-h.y)*12+(m-h.m))*29.53));
  for(let i=0;i<30;i++){const x=hijri(d),diff=(x.y-y)*12+(x.m-m);if(!diff)return hijriMonth(d).start;d=diff>0?addDays(d,-x.d):addDays(d,31-x.d)}
  return d;
}

export function calPick({mode="day",value=new Date(),cal="masehi",dot=()=>0}={}){
  return new Promise(done=>{
    const today=key(new Date()),picked=key(value);
    let view=mode==="month"?"months":"days",anchor=value;
    const m=document.createElement("div");m.className="modal calp";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label",mode==="month"?"Pilih bulan":"Pilih tanggal");
    m.innerHTML=`<div class="box"><div class="calp-head"><button type="button" class="calp-nav" data-nav="-1" aria-label="Sebelumnya">‹</button><button type="button" class="calp-title" data-title></button><button type="button" class="calp-nav" data-nav="1" aria-label="Berikutnya">›</button></div><div class="calp-body" data-body></div><div class="calp-foot"><button type="button" class="btn ghost" data-x>Batal</button><button type="button" class="btn primary" data-today>Hari ini</button></div></div>`;
    const body=m.querySelector("[data-body]"),title=m.querySelector("[data-title]");
    const ym=d=>cal==="hijri"?(({m,y})=>({m,y}))(hijri(d)):{m:d.getMonth()+1,y:d.getFullYear()};
    const finish=v=>{removeEventListener("keydown",onKey);m.classList.add("out");setTimeout(()=>m.remove(),160);done(v)};
    const onKey=e=>{if(e.key==="Escape")finish(null)};

    function days(){
      let ds;
      if(cal==="hijri"){const hm=hijriMonth(anchor);ds=hm.days;title.textContent=`${BULAN[hm.m-1]} ${hm.y} H`}
      else{const y=anchor.getFullYear(),mo=anchor.getMonth(),n=new Date(y,mo+1,0).getDate();ds=Array.from({length:n},(_,i)=>new Date(y,mo,i+1));title.textContent=`${MASEHI[mo]} ${y}`}
      let h=WD.map(w=>`<span class="calp-wd">${w}</span>`).join("")+"<span></span>".repeat(ds[0].getDay());
      for(const d of ds){const k=key(d),main=cal==="hijri"?hijri(d).d:d.getDate(),sub=cal==="hijri"?d.getDate():hijri(d).d,t=dot(k);
        h+=`<button type="button" class="calp-d${k===today?" today":""}${k===picked?" on":""}" data-k="${k}"><b>${main}</b><small>${sub}</small>${t?`<i class="${t===1?"p":""}"></i>`:""}</button>`}
      body.className="calp-body calp-days";body.innerHTML=h;
    }
    function months(){
      const {y}=ym(anchor),cur=ym(new Date()),sel=ym(value),names=cal==="hijri"?BULAN:MASEHI;
      title.textContent=cal==="hijri"?`${y} H`:`${y}`;
      body.className="calp-body calp-months";
      body.innerHTML=names.map((nm,i)=>`<button type="button" class="calp-m${cur.y===y&&cur.m===i+1?" today":""}${sel.y===y&&sel.m===i+1?" on":""}" data-m="${i+1}">${esc(nm)}</button>`).join("");
    }
    const draw=()=>(view==="days"?days:months)();
    const shift=n=>{const {m:mo,y}=ym(anchor);
      if(view==="months")anchor=cal==="hijri"?hijriStart(y+n,mo):new Date(y+n,mo-1,1);
      else anchor=cal==="hijri"?(n>0?addDays(hijriMonth(anchor).days.at(-1),1):addDays(hijriMonth(anchor).start,-1)):new Date(anchor.getFullYear(),anchor.getMonth()+n,1);
      body.classList.remove("sl-l","sl-r");void body.offsetWidth;draw();body.classList.add(n>0?"sl-l":"sl-r")};

    m.onclick=e=>{
      if(e.target===m||e.target.closest("[data-x]"))return finish(null);
      const b=e.target.closest("button");if(!b)return;
      if(b.dataset.nav)return shift(+b.dataset.nav);
      if(b.hasAttribute("data-title")){view=view==="days"?"months":"days";body.classList.remove("sl-l","sl-r");return draw()}
      if(b.hasAttribute("data-today")){const now=new Date(),c=ym(now);return finish(mode!=="month"?now:cal==="hijri"?hijriStart(c.y,c.m):new Date(c.y,c.m-1,1))}
      if(b.dataset.m){const {y}=ym(anchor),mo=+b.dataset.m,start=cal==="hijri"?hijriStart(y,mo):new Date(y,mo-1,1);
        if(mode==="month")return finish(start);
        anchor=start;view="days";return draw()}
      if(b.dataset.k){const [a,c,d]=b.dataset.k.split("-").map(Number);return finish(new Date(a,c-1,d))}
    };
    addEventListener("keydown",onKey);
    draw();document.body.appendChild(m);m.querySelector("[data-today]").focus();
  });
}
