import {get} from "../store.js";
import {hijriText,masehiText,key,events,nextEvent,addDays} from "../lib/hijri.js";
import {loc,upcoming,tzLabel,tzOffset,wallNow} from "../lib/prayer.js";
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
    try{const n=await upcoming(l);if(!alive)return;dl=Date.now()+n.ms;$("next").textContent=`${n.nm} ${n.time}${n.tomorrow?" (besok)":""}`;$("lokasi").textContent=meta(n.t._src);
      jd=n;mini();tick()}
    catch(e){if(alive){$("next").textContent="—";$("countdown").textContent="Jadwal belum dapat dihitung. Atur lokasi di halaman Shalat."}}
    finally{busy=false}}
  /* Jadwal sebaris: Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, Isya.
     lewat = redup; kini = waktu yang sedang berjalan (garis tepi + titik); on = sorotan penuh.
     Seperti fadzkuruuni: sorotan penuh tetap di waktu yang baru masuk selama 10 menit, lalu pindah ke waktu berikutnya. */
  const URUT=[["Fajr","Subuh"],["Sunrise","Terbit"],["Dhuha","Dhuha"],["Dhuhr","Dzuhur"],["Asr","Ashar"],["Maghrib","Maghrib"],["Isha","Isya"]];
  const mnt=v=>{const m=/^(\d+):(\d+)/.exec(v||"");return m?+m[1]*60+ +m[2]:null},jam=x=>`${String(Math.floor(x/60)%24).padStart(2,"0")}:${String(x%60).padStart(2,"0")}`;
  /* Dhuha: matahari setinggi ±4,5° (sekitar 20 menit setelah terbit di Indonesia) */
  const dhuha=t=>{const s=mnt(t.Sunrise);return s==null?null:jam(s+Math.round(5.33/(15*Math.cos(l.lat*Math.PI/180))*60))};
  let jd=null,sidik="";
  function mini(){if(!jd)return;const t={...jd.t,Dhuha:dhuha(jd.t)},w=wallNow(l),c=w.getHours()*60+w.getMinutes();
    const M=URUT.map(([id])=>mnt(t[id]));
    let kini=-1,berikut=-1;
    if(jd.tomorrow){kini=6;berikut=0}   // setelah Isya: jadwal besok, Isya masih berjalan, Subuh berikutnya
    else{M.forEach((m,i)=>{if(m!=null&&m<=c)kini=i});berikut=M.findIndex(m=>m!=null&&m>c);if(kini<0)kini=6}
    const baru=!jd.tomorrow&&M[kini]!=null&&c>=M[kini]&&c-M[kini]<10;
    const on=baru?kini:berikut;
    const html=URUT.map(([id,nm],i)=>{const k=[!jd.tomorrow&&M[i]!=null&&M[i]<=c&&i!==kini?"lewat":"",i===kini?"kini":"",i===on?"on":"",i===1||i===2?"sunah":""].filter(Boolean).join(" ");
      return `<div class="${k}"${i===kini?' aria-current="time"':""}><span>${esc(nm)}</span><b>${esc(t[id]||"—")}</b></div>`}).join("");
    if(html!==sidik){$("mini").innerHTML=html;sidik=html}}
  function tick(){if(!dl)return;if(Date.now()%30000<1000)mini();const s=Math.max(0,Math.round((dl-Date.now())/1e3));
    $("countdown").textContent=`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")} lagi`;
    if(s===0&&!busy)setTimeout(load,1200)}
  load();iv=setInterval(tick,1000);
  return()=>{alive=false;clearInterval(iv)};
}
