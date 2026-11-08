import {get} from "../store.js";
import {hijriText,masehiText,key,events,nextEvent,addDays} from "../lib/hijri.js";
import {loc,upcoming,tzLabel,tzOffset,wallNow,dhuhaOf} from "../lib/prayer.js";
import {progress,day,agenda,streaks} from "../lib/ibadah.js";
import {json,hasAr,esc} from "../lib/ui.js";
const C=2*Math.PI*15;
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`),now=new Date(),h=now.getHours(),k=key(now);
  const nama=(get("profil",{}).name||window.__klAuth?.currentUser?.displayName||"").trim().split(" ")[0];
  $("salam").textContent=`${h<11?"Selamat pagi":h<15?"Selamat siang":h<18?"Selamat sore":"Selamat malam"}${nama?", "+nama:""}`;
  $("tanggal").textContent=`${hijriText(now)} · ${masehiText(now)}`;
  const p=progress(k);$("done").textContent=p.done;$("total").textContent=p.total;$("pct").textContent=p.pct+"%";$("ring").style.strokeDasharray=C;$("ring").style.strokeDashoffset=C*(1-p.pct/100);
  const st=streaks();$("streak").textContent=`${st.cur} hari`;$("best").textContent=st.cur?`Rekor ${st.best} hari`:"Mulai hari ini";
  const ev=nextEvent(addDays(now,0));if(ev){$("evd").textContent=ev.days===0?"Hari ini":ev.days===1?"Besok":`${ev.days} hari lagi`;$("evn").textContent=ev.name}
  $("waktu").textContent=h<12?"pagi":"petang";
  const last=get("quran_last");if(last)$("last").textContent=`Lanjut: ${last.nama} · ${last.ayat}`;
  json("data/mutiara.json").then(q=>{const x=q[Math.floor(now/864e5)%q.length],ar=hasAr(x.text);$("q-arab").hidden=!ar;$("q-arab").textContent=ar?x.text:"";$("q-arti").textContent=ar?x.detail:"“"+x.text+"”";$("q-arti").className=ar?"":"quote";$("q-src").textContent=x.source}).catch(()=>{$("q-arti").textContent="Kata mutiara belum dapat dimuat."});
  /* Saran cerdas: satu pengingat paling relevan menurut waktu & data hari ini */
  (function(){const rec=day(k),L=agenda(),dz=get("dz_"+k,{}),todo=id=>L.some(i=>i.id===id)&&rec[id]==null,c=[];
    if(h>=4&&h<11&&!(dz.pagi||[]).length)c.push(["Dzikir pagi belum dibaca","Luangkan beberapa menit sebelum beraktivitas.","#/dzikir"]);
    if(h>=5&&h<11&&todo("dhuha"))c.push(["Waktu Dhuha","Belum dicentang hari ini.","#/absensi"]);
    if(h>=15&&h<20&&!(dz.petang||[]).length)c.push(["Dzikir petang belum dibaca","Waktunya sebelum Maghrib.","#/dzikir"]);
    const tm=events(addDays(now,1)).find(e=>/Puasa|Ayyamul|Arafah|Asyura|Idul/.test(e));if(h>=15&&tm)c.push([`Besok: ${tm}`,"Siapkan niat dan sahur.","#/kalender"]);
    if(h>=20&&!Object.keys(rec).length)c.push(["Absensi hari ini masih kosong","Catat ibadahmu sebelum tidur.","#/absensi"]);
    if(h>=20&&st.cur>0&&p.pct<50)c.push([`Jaga rangkaian ${st.cur} harimu`,"Capai 50% hari ini agar tidak terputus.","#/absensi"]);
    const e=$("hint");if(c[0]){e.hidden=false;e.href=c[0][2];$("ht").textContent=c[0][0];$("hs").textContent=c[0][1]}})();
  const l=loc();let dl=0,iv,busy=false,alive=true;
  const meta=src=>`${l.name} · ${tzLabel(tzOffset(l))}${src==="local"?" · hitung lokal":""}`;$("lokasi").textContent=meta();
  async function load(){busy=true;
    try{const n=await upcoming(l);if(!alive)return;dl=Date.now()+n.ms;$("lokasi").textContent=meta(n.t._src);
      jd=n;mini();tick()}
    catch(e){if(alive){$("next").textContent="—";$("countdown").textContent="Jadwal belum dapat dihitung. Atur lokasi di halaman Shalat."}}
    finally{busy=false}}
  /* Kartu atas = WAKTU SEKARANG: "Sekarang · Waktu Isya", jam yang berjalan, lalu "Menuju Subuh 04:03 · 07:19:23".
     Jadwal sebaris: Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, Isya.
     lewat = redup; kini = waktu yang sedang berjalan (sorotan penuh + titik); berikut = garis tepi. */
  const URUT=[["Fajr","Subuh"],["Sunrise","Terbit"],["Dhuha","Dhuha"],["Dhuhr","Dzuhur"],["Asr","Ashar"],["Maghrib","Maghrib"],["Isha","Isya"]];
  const z=v=>String(v).padStart(2,"0");
  const mnt=v=>{const m=/^(\d+):(\d+)/.exec(v||"");return m?+m[1]*60+ +m[2]:null},jam=x=>`${z(Math.floor(x/60)%24)}:${z(x%60)}`;
  const dhuha=t=>dhuhaOf(t,l);
  let jd=null,sidik="",S={};
  function mini(){if(!jd)return;const t={...jd.t,Dhuha:dhuha(jd.t)},w=wallNow(l),c=w.getHours()*60+w.getMinutes();
    const M=URUT.map(([id])=>mnt(t[id]));
    let kini=-1,berikut=-1;
    if(jd.tomorrow){kini=6;berikut=0}   // setelah Isya: tabel = jadwal besok; Isya masih berjalan, Subuh berikutnya
    else{M.forEach((m,i)=>{if(m!=null&&m<=c)kini=i});berikut=M.findIndex(m=>m!=null&&m>c);if(kini<0)kini=6;if(berikut<0)berikut=0}
    S={kini:URUT[kini][1],berikut:URUT[berikut][1],jamB:t[URUT[berikut][0]]||"",besok:jd.tomorrow||berikut===0&&kini===6&&c>=12*60,
       target:!jd.tomorrow&&M[berikut]!=null&&M[berikut]>c?M[berikut]:null};
    const html=URUT.map(([id,nm],i)=>{const k=[!jd.tomorrow&&M[i]!=null&&M[i]<=c&&i!==kini?"lewat":"",i===kini?"kini on":"",i===berikut?"berikut":"",i===1||i===2?"sunah":""].filter(Boolean).join(" ");
      return `<div class="${k}"${i===kini?' aria-current="time"':""}><span>${esc(nm)}</span><b>${esc(t[id]||"—")}</b></div>`}).join("");
    if(html!==sidik){$("mini").innerHTML=html;sidik=html}
    const sb=S.kini==="Terbit"||S.kini==="Dhuha"?S.kini==="Terbit"?"Matahari terbit":"Waktu Dhuha":"Waktu "+S.kini;
    $("eyebrow").textContent="Sekarang · "+sb}
  function tick(){if(!jd)return;if(Date.now()%30000<1000)mini();
    const w=wallNow(l),now=w.getHours()*3600+w.getMinutes()*60+w.getSeconds();
    $("next").innerHTML=`${z(w.getHours())}:${z(w.getMinutes())}<small class="hero-dt">:${z(w.getSeconds())}</small> <small class="hero-tz">${esc(tzLabel(tzOffset(l)))}</small>`;
    let s=S.target!=null?S.target*60-now:Math.round((dl-Date.now())/1e3);if(s<0)s=0;
    $("countdown").textContent=`Menuju ${S.berikut}${S.besok?" besok":""} ${S.jamB} · ${z(Math.floor(s/3600))}:${z(Math.floor(s%3600/60))}:${z(s%60)} lagi`;
    if(S.target!=null&&s===0)setTimeout(mini,1200);
    if(Date.now()>=dl&&!busy){dl=Infinity;setTimeout(load,1200)}}
  load();iv=setInterval(tick,1000);
  return()=>{alive=false;clearInterval(iv)};
}
