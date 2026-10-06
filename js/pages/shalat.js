import {key,masehiText,addDays} from "../lib/hijri.js";
import {CITIES,NAMES,loc,timings,nextOf,bearing,distance,tzLabel,tzOffset,wallNow} from "../lib/prayer.js";
import {searchPlace,reverseName,apply} from "../lib/geo.js";
import {useMyLocation,geoState,geoMsg,GEO_TXT} from "../lib/perm.js";
import {toast} from "../store.js";
import {esc} from "../lib/ui.js";
const LF="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/";let lf;
const leaflet=()=>lf??=new Promise((ok,no)=>{const c=document.createElement("link");c.rel="stylesheet";c.href=LF+"leaflet.css";document.head.appendChild(c);const s=document.createElement("script");s.src=LF+"leaflet.js";s.onload=()=>ok(window.L);s.onerror=()=>{lf=null;no(new Error("peta"))};document.head.appendChild(s)});
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);let off=0,tm=null,iv,heading=null,offOri,map=null,alive=true,seq=0;
  const sel=$("city");
  const days=()=>{const b=wallNow(loc());return new Date(b.getFullYear(),b.getMonth(),b.getDate()+off)};
  async function draw(){
    const l=loc(),my=++seq;
    $("lname").textContent=l.name;$("lmeta").textContent=`${l.lat.toFixed(3)}, ${l.lng.toFixed(3)} · ${tzLabel(tzOffset(l))}`;
    sel.innerHTML=Object.keys(CITIES).map(c=>`<option ${c===l.name?"selected":""}>${c}</option>`).join("")+(CITIES[l.name]?"":`<option selected value="_cur">${esc(l.name)}</option>`);
    $("judul").textContent=off===0?"Hari ini":masehiText(days());
    $("times").innerHTML=NAMES.map(([id,nm])=>`<div class="t"><span class="muted">${nm}</span><b>—</b></div>`).join("");
    try{tm=await timings(days(),l)}catch(e){if(my!==seq)return;tm=null;$("countdown").textContent="Jadwal tidak dapat dihitung untuk lokasi ini.";return}
    if(my!==seq)return;
    $("src").textContent=tm._src==="local"?"Hitung lokal":"Kemenag · Aladhan";$("src").classList.toggle("warn",tm._src==="local");
    paint();needle();$("deg").textContent=`${Math.round(bearing(l))}° dari utara`;$("jarak").textContent=`Jarak ke Ka'bah sekitar ${distance(l).toLocaleString("id-ID")} km`;
    geoState().then(g=>{const b=$("geobadge");b.hidden=false;b.textContent="Izin lokasi: "+(GEO_TXT[g]||"—");b.classList.toggle("warn",g==="denied")})}
  function paint(){if(!tm)return;const w=wallNow(loc()),n=off===0?nextOf(tm,w):null;
    $("times").innerHTML=NAMES.map(([id,nm])=>`<div class="t ${n?.id===id?"next":""}"><span class="muted">${nm}</span><b>${esc(tm[id])}</b></div>`).join("");
    if(off!==0)$("countdown").textContent="";
    else if(n){const s=Math.round(n.ms/1e3);$("countdown").textContent=`${n.nm} dalam ${Math.floor(s/3600)} jam ${Math.floor(s%3600/60)} menit ${s%60} detik`}
    else $("countdown").textContent="Semua waktu hari ini telah lewat."}
  function needle(){const b=bearing(loc());$("needle").style.transform=`rotate(${(b-(heading||0)+360)%360}deg)`;$("hint").textContent=heading==null?"Utara di atas":`Kompas aktif · ${Math.round(heading)}°`}
  const setHere=async(name,lat,lng)=>{apply(name,lat,lng);$("res").hidden=true;$("q").value="";off=0;await draw()};
  sel.onchange=()=>{const c=sel.value;if(c==="_cur")return;const d=CITIES[c];setHere(c,d[0],d[1])};
  $("gps").onclick=async()=>{const b=$("gps"),h=$("gpshint");b.disabled=true;b.textContent="Mencari lokasi…";h.hidden=true;
    try{const l=await useMyLocation();off=0;toast("Lokasi diatur: "+l.name);await draw()}catch(e){h.hidden=false;h.textContent=geoMsg(e);toast(geoMsg(e))}
    b.disabled=false;b.textContent="Gunakan lokasi saya"};
  $("sform").onsubmit=async e=>{e.preventDefault();const q=$("q").value.trim(),r=$("res");if(q.length<2)return;r.hidden=false;r.innerHTML='<button disabled>Mencari…</button>';
    try{const l=await searchPlace(q);r.innerHTML=l.length?l.map((x,i)=>`<button data-i="${i}">${esc(x.name)}<br><small class="muted">${esc(x.full)}</small></button>`).join(""):'<button disabled>Tidak ditemukan. Coba nama lain.</button>';
      r.onclick=ev=>{const b=ev.target.closest("[data-i]");if(b){const x=l[+b.dataset.i];setHere(x.name,x.lat,x.lng)}}}
    catch(x){r.innerHTML='<button disabled>Pencarian tidak tersedia sekarang. Pakai daftar kota, GPS, atau peta.</button>'}};
  $("mapbtn").onclick=async()=>{const w=$("mapwrap");if(!w.hidden){w.hidden=true;return}w.hidden=false;
    try{const L=await leaflet(),l=loc();if(!alive)return;
      if(!map){map=L.map($("map"),{attributionControl:true}).setView([l.lat,l.lng],12);L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map)}
      else map.setView([l.lat,l.lng],12);setTimeout(()=>map.invalidateSize(),50)}
    catch(e){w.hidden=true;toast("Peta tidak dapat dimuat. Gunakan pencarian atau GPS.")}};
  $("mapuse").onclick=async()=>{if(!map)return;const c=map.getCenter();$("mapinfo").textContent="Mencari nama tempat…";const n=await reverseName(c.lat,c.lng);$("mapwrap").hidden=true;setHere(n,c.lat,c.lng)};
  $("prev").onclick=()=>{off--;draw()};$("nextd").onclick=()=>{off++;draw()};
  $("kompas").onclick=async()=>{try{if(window.DeviceOrientationEvent?.requestPermission&&await DeviceOrientationEvent.requestPermission()!=="granted")return toast("Izin sensor ditolak");
    if(offOri)offOri();const h=e=>{const v=e.webkitCompassHeading??(e.absolute&&e.alpha!=null?(360-e.alpha)%360:null);if(v!=null){heading=v;needle()}};
    addEventListener("deviceorientationabsolute",h);addEventListener("deviceorientation",h);offOri=()=>{removeEventListener("deviceorientationabsolute",h);removeEventListener("deviceorientation",h)};
    toast(window.DeviceOrientationEvent?"Arahkan ponsel mendatar dan putar perlahan":"Perangkat tidak punya sensor kompas")}catch(e){toast("Sensor kompas tidak tersedia")}};
  iv=setInterval(paint,1000);draw();
  return()=>{alive=false;clearInterval(iv);offOri&&offOri();if(map){map.remove();map=null}};
}
