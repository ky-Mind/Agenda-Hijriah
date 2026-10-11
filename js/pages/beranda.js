import {get} from "../store.js";
import {hijriText,masehiText,key,events,nextEvent,addDays} from "../lib/hijri.js";
import {loc,upcoming,tzLabel,tzOffset,NAMES,PRAYERS} from "../lib/prayer.js";
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
      $("mini").innerHTML=PRAYERS.map(id=>`<div class="${n.id===id&&!n.tomorrow?"on":""}"><span>${esc(NAMES.find(x=>x[0]===id)[1])}</span><b>${esc(n.t[id])}</b></div>`).join("");tick()}
    catch(e){if(alive){$("next").textContent="—";$("countdown").textContent="Jadwal belum dapat dihitung. Atur lokasi di halaman Shalat."}}
    finally{busy=false}}
  function tick(){if(!dl)return;const s=Math.max(0,Math.round((dl-Date.now())/1e3));
    $("countdown").textContent=`${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")} lagi`;
    if(s===0&&!busy)setTimeout(load,1200)}
  load();iv=setInterval(tick,1000);
  return()=>{alive=false;clearInterval(iv)};
}
