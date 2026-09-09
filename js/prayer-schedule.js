/* v5.15 — Client polish: compact dashboard, fixed absensi clipping, column preview, confirmed detail, interactive swipe peek */
const PRAYER_SCHEDULE_KEY="aih_prayer_schedule_v1";
const PRAYER_SCHEDULE_COLUMNS_KEY="aih_prayer_schedule_columns_v1";
const PRAYER_SCHEDULE_DEFAULT_COLUMNS=["hijri","Imsak","Subuh","Terbit","Dzuhur","Ashar","Maghrib","Isya"];
const PRAYER_SCHEDULE_LABELS={
  hijri:["Hijriah","Tanggal Hijriah"],
  Imsak:["Imsak","Waktu imsak"],Subuh:["Subuh","Waktu subuh"],Terbit:["Terbit","Terbit matahari"],
  Dzuhur:["Dzuhur","Waktu dzuhur"],Ashar:["Ashar","Waktu ashar"],Maghrib:["Maghrib","Waktu maghrib"],Isya:["Isya","Waktu isya"]
};
window.__prayerScheduleOffset=Number(window.__prayerScheduleOffset)||0;
let prayerScheduleRows=[];
let prayerScheduleDraftColumns=null;
let prayerScheduleLoadToken=0;

function prayerScheduleStorageKey(startKey,locationKey){
  return `${PRAYER_SCHEDULE_KEY}_${locationKey}_${startKey}_${PRAYER_METHOD}`;
}
function prayerScheduleLocation(){
  const settings=prayerSettings(),saved=getSavedLocation(),cityKey=String(settings.city||"Jakarta").toLowerCase();
  const coord=saved?{lat:Number(saved.lat),lon:Number(saved.lon)}:(CITY_COORDS[cityKey]||CITY_COORDS.jakarta);
  const tz=saved?.timezone||CITY_TIMEZONES[cityKey]||"Asia/Jakarta";
  const label=saved?.label||`${settings.city||"Jakarta"} • pusat kota`;
  const locationKey=saved?`geo_${Number(saved.lat).toFixed(5)}_${Number(saved.lon).toFixed(5)}`:`city_${cityKey}`;
  return {coord,tz,label,locationKey};
}
function prayerScheduleIso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function prayerScheduleDateFromIso(iso){const [y,m,d]=iso.split("-").map(Number);return new Date(y,m-1,d,12,0,0)}
function prayerScheduleMonthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
function addDaysLocal(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function prayerScheduleStartDate(){
  const loc=prayerScheduleLocation(),base=timezoneDate(loc.tz);
  return addDaysLocal(base,Number(window.__prayerScheduleOffset)||0);
}
function fmtShortDate(d){
  return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(d).replace(/\./g,"");
}
function fmtLongDate(d){
  return new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(d);
}
function prayerScheduleColumns(){
  try{
    const saved=JSON.parse(localStorage.getItem(PRAYER_SCHEDULE_COLUMNS_KEY)||"null");
    if(Array.isArray(saved)&&saved.length)return PRAYER_SCHEDULE_DEFAULT_COLUMNS.filter(x=>saved.includes(x));
  }catch(e){}
  return [...PRAYER_SCHEDULE_DEFAULT_COLUMNS];
}
function savePrayerScheduleColumns(){
  const modal=document.getElementById("prayerColumnsModal");
  const selected=[...document.querySelectorAll("#pcmList .pcm-item[data-col]")].filter(x=>x.dataset.on==="1").map(x=>x.dataset.col);
  const cols=PRAYER_SCHEDULE_DEFAULT_COLUMNS.filter(x=>selected.includes(x));
  if(!cols.length){toast("Pilih minimal satu kolom");return}
  try{localStorage.setItem(PRAYER_SCHEDULE_COLUMNS_KEY,JSON.stringify(cols))}catch(e){}
  closePrayerColumns();renderPrayerSchedule();toast("Tampilan kolom disimpan ✓");
}
// Backward-compatible handler used by the mobile calendar UI.
// The button label is intentionally short, while the storage function keeps
// its explicit name for internal use.
function savePrayerColumns(){savePrayerScheduleColumns()}
function openPrayerColumns(){
  const list=document.getElementById("pcmList");if(!list)return;
  prayerScheduleDraftColumns=prayerScheduleColumns();
  list.innerHTML=PRAYER_SCHEDULE_DEFAULT_COLUMNS.map(col=>{
    const meta=PRAYER_SCHEDULE_LABELS[col]||[col,col],on=prayerScheduleDraftColumns.includes(col);
    return `<button type="button" class="pcm-item" data-col="${col}" data-on="${on?"1":"0"}" onclick="togglePrayerColumn(this)">
      <span><b>${meta[0]}</b><small>${meta[1]}</small></span><span class="pcm-check ${on?"on":""}">${on?"✓":""}</span>
    </button>`;
  }).join("");
  const modal=document.getElementById("prayerColumnsModal");
  modal.classList.add("show");
  lockModalInteraction(modal);
}
function togglePrayerColumn(el){
  const next=el.dataset.on!=="1";el.dataset.on=next?"1":"0";
  const c=el.querySelector(".pcm-check");c.classList.toggle("on",next);c.textContent=next?"✓":"";
}
function closePrayerColumns(){
  const modal=document.getElementById("prayerColumnsModal");
  modal?.classList.remove("show");
  unlockModalInteraction(modal);
}
function resetPrayerSchedule(){window.__prayerScheduleOffset=0;loadPrayerSchedule(true)}
function movePrayerSchedule(days){
  window.__prayerScheduleOffset=(Number(window.__prayerScheduleOffset)||0)+Number(days||0);
  const loc=prayerScheduleLocation(),start=prayerScheduleStartDate(),end=addDaysLocal(start,29);
  // Update immediately from the local calculation, then refresh from the API
  // without making the swipe wait for a network response.
  prayerScheduleRows=buildOfflinePrayerRows(start,end,loc);
  renderPrayerSchedule();
  loadPrayerSchedule(false);
}
function openPrayerSchedule(){
  window.__prayerScheduleOffset=0;
  go("shalat");
  loadPrayerSchedule(false);
}
function prayerScheduleTime(item,key){
  const found=PRAYER_ORDER.find(x=>x[0]===key);
  if(!found)return "--:--";
  return item.timings?.[found[1]]||"--:--";
}
function parseApiDateValue(v){
  const m=String(v||"").match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m?new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),12):null;
}
function normalizePrayerCalendarItem(item){
  const d=parseApiDateValue(item?.date?.gregorian?.date)||null;
  if(!d)return null;
  const hijri=item?.date?.hijri;
  const hlabel=hijri?.day&&hijri?.month?.en&&hijri?.year?`${hijri.day} ${hijri.month.en} ${hijri.year} H`:null;
  return {
    iso:prayerScheduleIso(d),date:d,
    weekday:new Intl.DateTimeFormat("id-ID",{weekday:"long"}).format(d),
    gregorian:fmtShortDate(d),
    hijri:hlabel||(()=>{const h=getHijriParts(d);return `${h.day} ${HIJRI_MONTHS[h.month-1]} ${h.year} H`})(),
    timings:item.timings||{},
    meta:item.date?.hijri||{}
  };
}
async function fetchPrayerCalendarMonth(year,month,loc){
  const url=`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${encodeURIComponent(loc.coord.lat)}&longitude=${encodeURIComponent(loc.coord.lon)}&method=${PRAYER_METHOD}&school=0`;
  const res=await fetch(url,{headers:{Accept:"application/json"},cache:"no-store"});
  if(!res.ok)throw new Error("HTTP "+res.status);
  const json=await res.json();
  if(!Array.isArray(json?.data))throw new Error("Data kalender tidak tersedia");
  return {data:json.data,meta:json?.data?.[0]?.meta||json?.meta||{}};
}
async function fetchPrayerDayFallback(d,loc){
  const date=`${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
  const url=`https://api.aladhan.com/v1/timings/${date}?latitude=${encodeURIComponent(loc.coord.lat)}&longitude=${encodeURIComponent(loc.coord.lon)}&method=${PRAYER_METHOD}&school=0`;
  const res=await fetch(url,{headers:{Accept:"application/json"},cache:"no-store"});
  if(!res.ok)throw new Error("HTTP "+res.status);
  const json=await res.json();if(!json?.data?.timings)throw new Error("Jadwal tidak tersedia");
  return normalizePrayerCalendarItem(json.data);
}
async function fetchPrayerScheduleRows(start,end,loc){
  const months=[];
  let cursor=new Date(start);
  while(cursor<=end){
    const key=prayerScheduleMonthKey(cursor);
    if(!months.some(x=>x===key))months.push(key);
    cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1,12);
  }
  let all=[];
  try{
    const packs=await Promise.all(months.map(k=>{const [y,m]=k.split("-").map(Number);return fetchPrayerCalendarMonth(y,m,loc)}));
    packs.forEach(p=>{all=all.concat(p.data.map(normalizePrayerCalendarItem).filter(Boolean))});
  }catch(calendarErr){
    all=[];
    const dates=[];let d=new Date(start);
    while(d<=end){dates.push(new Date(d));d=addDaysLocal(d,1)}
    const chunks=[];
    for(let i=0;i<dates.length;i+=6)chunks.push(dates.slice(i,i+6));
    for(const chunk of chunks){
      const part=await Promise.all(chunk.map(d=>fetchPrayerDayFallback(d,loc)));
      all=all.concat(part);
    }
  }
  const from=prayerScheduleIso(start),to=prayerScheduleIso(end);
  return all.filter(x=>x&&x.iso>=from&&x.iso<=to).sort((a,b)=>a.iso.localeCompare(b.iso));
}
function renderPrayerSchedule(){
  const status=document.getElementById("psStatus"),wrap=document.getElementById("psTableWrap"),head=document.getElementById("psTableHead"),body=document.getElementById("psTableBody"),mobile=document.getElementById("psMobileList");
  if(!status||!head||!body||!mobile)return;
  const loc=prayerScheduleLocation(),start=prayerScheduleStartDate(),end=addDaysLocal(start,29),cols=prayerScheduleColumns();
  const badge=document.getElementById("psLocationBadge"); if(badge)badge.textContent=`📍 ${loc.label}`;
  const rangeTitle=document.getElementById("psRangeTitle"),rangeSub=document.getElementById("psRangeSub");
  if(rangeTitle)rangeTitle.textContent=(Number(window.__prayerScheduleOffset)||0)===0?"30 Hari Ke Depan":"Jadwal 30 Hari";
  if(rangeSub)rangeSub.textContent=`${fmtShortDate(start)} — ${fmtShortDate(end)} • ${loc.tz}`;
  renderPrayerScheduleCalendar();
  if(!prayerScheduleRows.length){
    status.hidden=false;status.textContent="Mengambil jadwal salat resmi…";wrap.hidden=true;mobile.innerHTML="";return;
  }
  status.hidden=true;wrap.hidden=false;
  const colLabel=key=>(PRAYER_SCHEDULE_LABELS[key]||[key])[0];
  head.innerHTML=`<tr><th>Tanggal</th>${cols.map(c=>`<th>${colLabel(c)}</th>`).join("")}</tr>`;
  body.innerHTML=prayerScheduleRows.map(item=>{
    const today= item.iso===prayerScheduleIso(timezoneDate(loc.tz));
    const hcol=cols.includes("hijri")?`<td class="hijri">${item.hijri}</td>`:"";
    const times=cols.filter(c=>c!=="hijri").map(c=>`<td class="time">${prayerScheduleTime(item,c)}</td>`).join("");
    return `<tr class="${today?"today":""}" tabindex="0" role="button" onclick="selectPrayerScheduleDate('${item.iso}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPrayerScheduleDate('${item.iso}')}"><td><span class="date-main">${item.gregorian}</span><span class="date-sub">${item.weekday}</span></td>${hcol}${times}</tr>`;
  }).join("");
  mobile.innerHTML=prayerScheduleRows.map(item=>{
    const today=item.iso===prayerScheduleIso(timezoneDate(loc.tz));
    const times=cols.filter(c=>c!=="hijri").map(c=>`<div class="ps-time"><span>${colLabel(c)}</span><b>${prayerScheduleTime(item,c)}</b></div>`).join("");
    return `<article class="ps-mobile-row ${today?"today":""}" tabindex="0" role="button" onclick="selectPrayerScheduleDate('${item.iso}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPrayerScheduleDate('${item.iso}')}">
      <div class="ps-mobile-date"><div><b>${item.gregorian}</b><div class="ps-mobile-hijri">${item.hijri}</div></div><span>${item.weekday}</span></div>
      ${times?`<div class="ps-times">${times}</div>`:""}
    </article>`;
  }).join("");
  renderPrayerScheduleCalendar();
}

function renderPrayerScheduleCalendar(){
  const grid=document.getElementById("psCalendarGrid"); if(!grid)return;
  const title=document.getElementById("psCalendarTitle"),sub=document.getElementById("psCalendarSub");
  if(!prayerScheduleRows.length){
    grid.innerHTML=Array.from({length:30},(_,i)=>`<button type="button" disabled aria-label="Memuat tanggal"><span class="ps-day">—</span><span class="ps-hijri">memuat</span></button>`).join("");
    if(title)title.textContent="Kalender Jadwal Salat";
    if(sub)sub.textContent="Menyiapkan jadwal…";
    return;
  }
  const first=prayerScheduleRows[0]?.date||prayerScheduleDateFromIso(prayerScheduleRows[0].iso);
  const monthName=new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(first);
  if(title)title.textContent=`${monthName}`;
  if(sub)sub.textContent="Pilih tanggal untuk mengubah posisi. Detail dibuka dengan Lihat keterangan.";
  const todayIso=prayerScheduleIso(timezoneDate(prayerScheduleLocation().tz));
  const selected=window.__selectedPrayerScheduleIso||todayIso;
  const mobileWindow=window.matchMedia("(max-width: 767px)").matches;
  const startIndex=mobileWindow?Math.max(0,prayerScheduleRows.findIndex(x=>x.iso===selected)>=0?Math.floor(prayerScheduleRows.findIndex(x=>x.iso===selected)/10)*10:0):0;
  const visibleRows=mobileWindow?prayerScheduleRows.slice(startIndex,startIndex+10):prayerScheduleRows;
  const firstVisible=visibleRows[0]||prayerScheduleRows[0];
  const firstDow=mobileWindow?0:first.getDay();
  const blanks=Array.from({length:firstDow},()=>`<span></span>`).join("");
  if(title&&mobileWindow&&firstVisible)title.textContent=`${new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(firstVisible.date)} – ${new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(visibleRows[visibleRows.length-1]?.date||firstVisible.date)}`;
  grid.innerHTML=blanks+visibleRows.map(item=>{
    const isToday=item.iso===todayIso,isSelected=item.iso===selected;
    return `<button type="button" class="ps-day-card ${isToday?"today ":""}${isSelected?"selected":""}" onclick="selectPrayerScheduleDate('${item.iso}')" aria-label="Pilih ${item.gregorian}">
      <span class="ps-day">${item.date.getDate()}</span>
      <span class="ps-g">${item.date.toLocaleDateString("id-ID",{month:"short"})}</span>
      <span class="ps-hijri">${String(item.hijri||"").replace(/\s+\d+\s*H$/,"")}</span>
      <span class="ps-wd">${item.weekday.slice(0,3)}</span>
    </button>`;
  }).join("");
  const sel=prayerScheduleRows.find(x=>x.iso===selected)||prayerScheduleRows.find(x=>x.iso===todayIso)||prayerScheduleRows[0];
  const info=document.getElementById("psSelectedDay");
  if(info&&sel){
    info.innerHTML=`<div><b>${sel.weekday}, ${sel.gregorian}</b><small>${sel.hijri}</small></div><button type="button" class="btn gold small" onclick="openPrayerDayDetail('${sel.iso}')">Lihat keterangan</button>`;
  }
}

function selectPrayerScheduleDate(iso){
  const item=prayerScheduleRows.find(x=>x.iso===iso);
  if(!item)return;
  window.__selectedPrayerScheduleIso=iso;
  renderPrayerScheduleCalendar();
  // Selecting a date only changes the highlighted date. Details require confirmation.
}
function openPrayerDayDetail(iso){
  const item=prayerScheduleRows.find(x=>x.iso===iso); if(!item){toast("Jadwal tanggal belum tersedia");return}
  window.__selectedPrayerScheduleIso=iso;
  renderPrayerScheduleCalendar();
  const loc=prayerScheduleLocation(),modal=document.getElementById("prayerDayModal");
  const title=document.getElementById("pdmTitle"),sub=document.getElementById("pdmSub"),where=document.getElementById("pdmLocation"),times=document.getElementById("pdmTimes");
  if(!modal||!title||!sub||!where||!times)return;
  title.textContent=item.gregorian;
  sub.textContent=`${item.weekday} • ${item.hijri}`;
  where.textContent=`📍 ${loc.label} • ${loc.tz}`;
  const vals=PRAYER_ORDER.map(([name,key])=>({name,time:String(item.timings?.[key]||"--:--").replace(/\s*\(.+?\)/g,"").trim()}));
  const nextName=prayerCountdownData(vals)?.prayer?.name;
  times.innerHTML=vals.map(x=>`<div class="pdm-time ${x.name===nextName?"next":""}"><span>${x.name}${x.name===nextName?" • berikutnya":""}</span><b>${x.time}</b></div>`).join("");
  modal.classList.add("show");lockModalInteraction(modal);
}
function closePrayerDayDetail(){
  const modal=document.getElementById("prayerDayModal");
  modal?.classList.remove("show");
  unlockModalInteraction(modal);
}
function usePrayerDayForAbsensi(){
  const item=prayerScheduleRows.find(x=>x.iso===window.__selectedPrayerScheduleIso);if(!item)return;
  selectedDate=item.date;hijriCursor=getHijriParts(selectedDate);draftRecord={...record(selectedDate)};
  closePrayerDayDetail();go("absensi");
}
function selectPrayerToday(){
  window.__prayerScheduleOffset=0;window.__selectedPrayerScheduleIso=prayerScheduleIso(timezoneDate(prayerScheduleLocation().tz));
  loadPrayerSchedule(false);
}
function solarOfflinePrayerTimes(d,lat,lon,tz){
  // Offline fallback: solar-position calculation, using the same Kemenag-style
  // angle family (Fajr 20°, Isha 18°) when the online calendar is unavailable.
  const dayOfYear=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  const g=2*Math.PI/365*(dayOfYear-1);
  const eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const rad=Math.PI/180, phi=lat*rad;
  const offset=timezoneOffsetMinutesAt(d,tz);
  const solarMinutes=(zenith)=>{
    const z=zenith*rad;
    const cosH=(Math.cos(z)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec));
    if(cosH>1||cosH<-1)return null;
    const H=Math.acos(cosH)/rad;
    return {rise:720-4*(lon+H)-eq+offset,set:720-4*(lon-H)-eq+offset};
  };
  const sun=solarMinutes(90.833), fajr=solarMinutes(110), isha=solarMinutes(108);
  const asrAngle=Math.atan(1/(1+Math.tan(Math.abs(phi-dec))));
  const asr=solarMinutes(90+asrAngle/rad);
  const noon=720-4*lon-eq+offset;
  const minsToTime=(m)=>{
    if(m==null||!Number.isFinite(m))return "--:--";
    m=((m%1440)+1440)%1440; const h=Math.floor(m/60),mm=Math.round(m%60);
    return `${String(h).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
  };
  const sunrise=sun?.rise, sunset=sun?.set;
  return {
    Imsak:minsToTime(fajr?.rise!=null?fajr.rise-10:null),
    Fajr:minsToTime(fajr?.rise),
    Sunrise:minsToTime(sunrise),
    Dhuhr:minsToTime(noon),
    Asr:minsToTime(asr?.set),
    Maghrib:minsToTime(sunset),
    Isha:minsToTime(isha?.set)
  };
}
function timezoneOffsetMinutesAt(date,tz){
  try{
    const parts=new Intl.DateTimeFormat("en-US",{timeZone:tz,timeZoneName:"longOffset",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(date);
    const zone=parts.find(x=>x.type==="timeZoneName")?.value||"GMT";
    const m=zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
    if(!m)return 0;
    return (m[1]==="-"?-1:1)*(Number(m[2])*60+Number(m[3]||0));
  }catch(e){return 0}
}
function buildOfflinePrayerRows(start,end,loc){
  const rows=[];let d=new Date(start);
  while(d<=end){
    const timings=solarOfflinePrayerTimes(d,Number(loc.coord.lat),Number(loc.coord.lon),loc.tz);
    const h=getHijriParts(d);
    rows.push({
      iso:prayerScheduleIso(d),date:new Date(d),
      weekday:new Intl.DateTimeFormat("id-ID",{weekday:"long"}).format(d),
      gregorian:fmtShortDate(d),
      hijri:`${h.day} ${HIJRI_MONTHS[h.month-1]||""} ${h.year} H`,
      timings,
      meta:{offline:true}
    });
    d=addDaysLocal(d,1);
  }
  return rows;
}

async function loadPrayerSchedule(force=false){
  const status=document.getElementById("psStatus");if(!status)return;
  const loadToken=++prayerScheduleLoadToken;
  const loc=prayerScheduleLocation(),start=prayerScheduleStartDate(),end=addDaysLocal(start,29),startKey=prayerScheduleIso(start),cacheKey=prayerScheduleStorageKey(startKey,loc.locationKey);
  renderPrayerSchedule();
  if(!force){
    try{
      const cached=JSON.parse(localStorage.getItem(cacheKey)||"null");
      if(cached?.rows?.length&&Date.now()-Number(cached.fetchedAt||0)<12*60*60*1000){
        if(loadToken!==prayerScheduleLoadToken)return;
        prayerScheduleRows=cached.rows.map(x=>({...x,date:prayerScheduleDateFromIso(x.iso)}));
        renderPrayerSchedule();return;
      }
    }catch(e){}
  }
  status.hidden=false;status.textContent="Mengambil jadwal salat resmi…";
  try{
    const rows=await fetchPrayerScheduleRows(start,end,loc);
    if(!rows.length)throw new Error("Tidak ada jadwal");
    if(loadToken!==prayerScheduleLoadToken)return;
    prayerScheduleRows=rows;
    try{localStorage.setItem(cacheKey,JSON.stringify({rows:rows.map(x=>({...x,date:undefined})),fetchedAt:Date.now(),location:loc.label,timezone:loc.tz}))}catch(e){}
    renderPrayerSchedule();
  }catch(err){
    if(loadToken!==prayerScheduleLoadToken)return;
    // Offline/local-file fallback so the calendar still responds even when the
    // AlAdhan API cannot be reached from content:// or an offline device.
    prayerScheduleRows=buildOfflinePrayerRows(start,end,loc);
    try{localStorage.setItem(cacheKey,JSON.stringify({rows:prayerScheduleRows.map(x=>({...x,date:undefined})),fetchedAt:Date.now(),offline:true,location:loc.label,timezone:loc.tz}))}catch(e){}
    status.hidden=false;
    status.innerHTML=`<b>Mode offline aktif — kalender tetap bisa digunakan.</b><br><span class="muted">Waktu dihitung dari koordinat lokasi. Saat internet tersedia, tekan “Perbarui jadwal” untuk sinkronisasi resmi.</span>`;
    renderPrayerSchedule();
  }
}
