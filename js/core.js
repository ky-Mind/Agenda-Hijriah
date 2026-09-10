const DEFAULT_WORSHIP=[
 ["puasa","Puasa Sunnah","🌙",["done","no","period"]],
 ["sahur","Sahur","🍽️",["done","no","period"]],
 ["tahajjud","Tahajjud","🌌",["done","no","period"]],
 ["sedekah","Sedekah","🤲",["done","no","period"]],
 ["dzikir_pagi","Dzikir Pagi","🌅",["done","no","period"]],
 ["ar_rahman","Ar-Rahman","📖",["done","no","period"]],
 ["dhuha","Dhuha","☀️",["done","no","period"]],
 ["al_mulk","Al-Mulk","📖",["done","no","period"]],
 ["al_waqiah","Al-Waqi'ah","📖",["done","no","period"]],
 ["dzikir_petang","Dzikir Petang","🌇",["done","no","period"]],
 ["tadarus","Tadarus","📚",["done","no","period","khatam"]],
 ["witir","Witir","✨",["done","no","period"]]
];
let WORSHIP=DEFAULT_WORSHIP.map(x=>[x[0],x[1],x[2],[...x[3]]]);

const DEFAULT_STATUS_META={
 done:["✅","Terlaksana"],no:["❌","Tidak terlaksana"],khatam:["📖💯","Khatam"],period:["🌚","Datang bulan"]
};
let STATUS_META={...DEFAULT_STATUS_META};
const NAV=[["dashboard","Beranda"],["absensi","Absensi"],["kalender","Kalender"],["koleksi","Koleksi"],["profil","Profil"]];
const NAV_ICONS={
 dashboard:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7"/><path d="M5.5 9.5v10h13v-10M9.5 19.5v-5h5v5"/></svg>',
 absensi:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 3.5v-1h6v1M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/></svg>',
 kalender:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 9h17M7.5 12.5h.01M12 12.5h.01M16.5 12.5h.01M7.5 16h.01M12 16h.01"/></svg>',
 koleksi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z"/><path d="M18 19.5h1a1 1 0 0 0 1-1v-11a3 3 0 0 0-3-3M8.5 9h6M8.5 12.5h6"/></svg>',
 profil:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.1-3.5 3.5-5.5 7-5.5s5.9 2 7 5.5"/></svg>'
};
const AGENDA_STATUS_OPTIONS=["done","no","period"];
function statusInfo(id){return STATUS_META[id]||["✨",String(id||"Status")]}
const AGENDA_ICONS={
 puasa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 4.2a7.5 7.5 0 1 0 4 13.1A7.5 7.5 0 0 1 15.8 4.2Z"/><path d="M18 5.5v.01M20 8v.01"/></svg>',
 sahur:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v7H4zM6 17v2M18 17v2M7 7v3M12 5v5M17 7v3"/><path d="M3 10h18"/></svg>',
 tahajjud:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 4.2a7.5 7.5 0 1 0 4 13.1A7.5 7.5 0 0 1 15.8 4.2Z"/><path d="m6 5 .4 1.1L7.5 6.5 6.4 6 6 5Z"/></svg>',
 sedekah:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S4.5 15.4 4.5 9.7A3.7 3.7 0 0 1 12 8.4a3.7 3.7 0 0 1 7.5 1.3c0 5.7-7.5 10.5-7.5 10.5Z"/><path d="M12 5v6M9 8h6"/></svg>',
 dzikir_pagi:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
 ar_rahman:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c-1.8-1.3-4.2-2-7-2v13c2.8 0 5.2.7 7 2 1.8-1.3 4.2-2 7-2V4c-2.8 0-5.2.7-7 2Z"/><path d="M12 6v13"/></svg>',
 dhuha:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
 al_mulk:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-1.7-1.2-4-1.8-6.5-1.8v14c2.5 0 4.8.6 6.5 1.8 1.7-1.2 4-1.8 6.5-1.8v-14C16 3.2 13.7 3.8 12 5Z"/><path d="M12 5v14"/></svg>',
 al_waqiah:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z"/><path d="M18 19.5h1a1 1 0 0 0 1-1v-11a3 3 0 0 0-3-3M8.5 9h6M8.5 12.5h6"/></svg>',
 dzikir_petang:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 4.2a7.5 7.5 0 1 0 4 13.1A7.5 7.5 0 0 1 15.8 4.2Z"/><path d="M5 18h.01M8 20h.01"/></svg>',
 tadarus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7a3 3 0 0 1 3 3v12H7a3 3 0 0 0-3 3zM20 5h-3a3 3 0 0 0-3 3v12h4a3 3 0 0 1 3 3z"/><path d="M7 9h4M7 12h4"/></svg>',
 witir:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.7 5.3H19l-4.3 3.2 1.7 5.3-4.4-3.2-4.4 3.2 1.7-5.3L5 8.3h5.3L12 3Z"/></svg>'
};
const STATUS_ICONS={
 done:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m8 12 2.6 2.6L16.5 9"/></svg>',
 no:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/></svg>',
 period:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 4.2a7.5 7.5 0 1 0 4 13.1A7.5 7.5 0 0 1 15.8 4.2Z"/><path d="M7 18h.01"/></svg>',
 khatam:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7a3 3 0 0 1 3 3v12H7a3 3 0 0 0-3 3zM20 5h-3a3 3 0 0 0-3 3v12h4a3 3 0 0 1 3 3z"/><path d="M7 9h4M7 12h4M17 9h-1M17 12h-1"/><path d="m12 2 .45 1.35H14l-1.25.8.45 1.35-1.2-.82-1.2.82.45-1.35L10 3.35h1.55L12 2Z"/></svg>'
};
function agendaIcon(id,fallback){return AGENDA_ICONS[id]||fallback}
function statusIcon(id){return STATUS_ICONS[id]||'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v5M12 16h.01"/></svg>'}
function cloneStatusMeta(meta){
 const src=meta&&typeof meta==="object"?meta:{};
 const out={...DEFAULT_STATUS_META};
 Object.entries(src).forEach(([id,v])=>{
   if(!/^[a-z0-9_-]{2,32}$/i.test(id)||!Array.isArray(v))return;
   const emoji=String(v[0]||"✨").slice(0,8),label=String(v[1]||id).trim().slice(0,32);
   if(label)out[id]=[emoji,label];
 });
 return out;
}
async function switchGoogleAccount(){
 await signOutGoogle();
 setTimeout(()=>signInWithGoogle(),150);
}
function loadStatusMetaForAccount(accountId){
 const acc=accounts[accountId];
 STATUS_META=cloneStatusMeta(acc?.statusMeta);
 if(acc)acc.statusMeta=cloneStatusMeta(STATUS_META);
 return STATUS_META;
}
function saveStatusMetaForAccount(meta){
 STATUS_META=cloneStatusMeta(meta);
 if(accounts[activeAccountId])accounts[activeAccountId].statusMeta=cloneStatusMeta(STATUS_META);
 persistAccounts();
}
const HIJRI_MONTHS=["Muharram","Safar","Rabiul Awal","Rabiul Akhir","Jumadil Awal","Jumadil Akhir","Rajab","Sya'ban","Ramadhan","Syawal","Dzulqa'dah","Dzulhijjah"];

let selectedDate=new Date();selectedDate.setHours(12,0,0,0);
let hijriCursor=getHijriParts(selectedDate);
const ACCOUNT_KEY="aih_accounts_v1",ACTIVE_ACCOUNT_KEY="aih_active_account_v1";
const DEFAULT_WHATSAPP="6289506138191";
let accounts=loadAccounts();
let activeAccountId=localStorage.getItem(ACTIVE_ACCOUNT_KEY)||Object.keys(accounts)[0];
if(!activeAccountId||!accounts[activeAccountId]){activeAccountId=Object.keys(accounts)[0];localStorage.setItem(ACTIVE_ACCOUNT_KEY,activeAccountId)}
let data=accounts[activeAccountId].data||{};
let timeData=accounts[activeAccountId].timeData||{};
let profile=accounts[activeAccountId].profile||{name:"Pengguna",email:"",whatsapp:DEFAULT_WHATSAPP,photo:""};
let dirty=false, recapMode="daily", modalAction=null;
let draftRecord={};
let suppressCalendarClickUntil=0;
let recapCursorDate=new Date(selectedDate);
let recapCursorHijri={...hijriCursor};
let activityShared=!!accounts[activeAccountId].activityShared;
let firestoreAbsensiUnsubscribe=null;
let firestoreAbsensiDateKey="";
if(!profile.whatsapp)profile.whatsapp=DEFAULT_WHATSAPP;
loadStatusMetaForAccount(activeAccountId);
WORSHIP=loadAgendaForAccount(activeAccountId);

function cloneAgenda(list){
  return (Array.isArray(list)?list:DEFAULT_WORSHIP).map((x,i)=>[
    String(x?.[0]||("agenda_"+Date.now().toString(36)+"_"+i)),
    String(x?.[1]||"Agenda").trim()||"Agenda",
    String(x?.[2]||"✨"),
    Array.isArray(x?.[3])&&x[3].length?x[3].map(s=>String(s||"").trim()).filter(s=>/^[a-z0-9_-]{2,32}$/i.test(s)):["done","no","period"]
  ]);
}
function loadAgendaForAccount(accountId){
  const acc=accounts[accountId];
  if(!acc)return cloneAgenda(DEFAULT_WORSHIP);
  if(!Array.isArray(acc.agenda)||!acc.agenda.length){
    acc.agenda=cloneAgenda(DEFAULT_WORSHIP);
    persistAccounts();
  }else acc.agenda=cloneAgenda(acc.agenda);
  return acc.agenda;
}
function saveAgendaForAccount(list){
  WORSHIP=cloneAgenda(list);
  if(accounts[activeAccountId])accounts[activeAccountId].agenda=cloneAgenda(WORSHIP);
  persistAccounts();
}
function makeAgendaId(){
  return "agenda_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);
}

function loadAccounts(){
 try{
  const saved=JSON.parse(localStorage.getItem(ACCOUNT_KEY)||"null");
  if(saved&&typeof saved==="object"&&Object.keys(saved).length)return saved;
 }catch(e){}
 const legacyProfile=(()=>{try{return JSON.parse(localStorage.getItem("aih_profile_v2")||"null")}catch(e){return null}})()||{name:"Pengguna",email:"",photo:""};
 let legacyData={};try{legacyData=JSON.parse(localStorage.getItem("aih_records_v2")||"{}")}catch(e){}
 const id="local-"+Date.now().toString(36);
 const migrated={[id]:{id,profile:{name:legacyProfile.name||"Pengguna",email:legacyProfile.email||"",whatsapp:legacyProfile.whatsapp||DEFAULT_WHATSAPP,photo:legacyProfile.photo||""},data:legacyData,timeData:{},agenda:cloneAgenda(DEFAULT_WORSHIP),activityShared:localStorage.getItem("aih_activity_shared")==="1"}};
 localStorage.setItem(ACCOUNT_KEY,JSON.stringify(migrated));localStorage.setItem(ACTIVE_ACCOUNT_KEY,id);return migrated;
}
function persistAccounts(){try{localStorage.setItem(ACCOUNT_KEY,JSON.stringify(accounts));localStorage.setItem(ACTIVE_ACCOUNT_KEY,activeAccountId);return true}catch(e){console.warn("Penyimpanan lokal penuh",e);return false}}

/* Riwayat baca Al-Qur'an disimpan di dalam akun aktif (accounts[activeAccountId]),
   struktur data yang sama yang dipakai untuk absensi ibadah dan yang sudah
   otomatis berpindah saat pengguna masuk/keluar dari akun Google (lihat
   adoptGoogleSession). Dengan begitu riwayat baca ikut tersinkron ke akun
   Google yang sama tanpa perlu backend baru. */
function quranAccountStore(){
  const acc=accounts[activeAccountId];
  if(!acc)return null;
  if(!acc.quran)acc.quran={lastRead:null,history:[]};
  if(!Array.isArray(acc.quran.history))acc.quran.history=[];
  return acc.quran;
}
function recordQuranRead(surahId,surahName,ayahId,totalAyah){
  const store=quranAccountStore();
  if(!store)return;
  const entry={surahId,surahName,ayahId,totalAyah,ts:Date.now()};
  store.lastRead=entry;
  store.history=store.history.filter(h=>h.surahId!==surahId);
  store.history.unshift(entry);
  store.history=store.history.slice(0,20);
  persistAccounts();
}
function getQuranLastRead(){return quranAccountStore()?.lastRead||null}
function getQuranHistory(){return quranAccountStore()?.history||[]}
function clearQuranHistory(){const s=quranAccountStore();if(!s)return;s.lastRead=null;s.history=[];persistAccounts();}

/* Preferensi tampilan (Arab/Latin/Arti) berlaku untuk perangkat ini, dipakai
   oleh js/pages/quran.js. */
const QURAN_DISPLAY_PREF_KEY="kl_quran_display_pref_v1";
function getQuranDisplayPrefs(){
  try{
    const v=JSON.parse(localStorage.getItem(QURAN_DISPLAY_PREF_KEY)||"null");
    if(v&&typeof v==="object")return {arabic:true,latin:true,translation:true,...v};
  }catch(e){}
  return {arabic:true,latin:true,translation:true};
}
function setQuranDisplayPrefs(prefs){
  try{localStorage.setItem(QURAN_DISPLAY_PREF_KEY,JSON.stringify(prefs))}catch(e){}
}

function syncActiveAccount(){
 const safeProfile={...profile};
 // v2.9: foto punya fallback lokal. Beberapa browser/WebView yang membuka
 // HTML lewat content:// atau file:// dapat menolak IndexedDB.
 if(safeProfile.photoRef){delete safeProfile.photo}
 if(!safeProfile.photoFallback && profile.photo && profile.photo.startsWith("data:")){
  safeProfile.photoFallback=profile.photo;
 }
 accounts[activeAccountId].data=data;accounts[activeAccountId].timeData=timeData;accounts[activeAccountId].profile=safeProfile;accounts[activeAccountId].activityShared=activityShared;accounts[activeAccountId].statusMeta=cloneStatusMeta(STATUS_META);
 return persistAccounts()
}
function restoreLocalAccountAfterLogout(){
 const localId=Object.keys(accounts).find(id=>id.startsWith("local-"))||Object.keys(accounts)[0];
 if(!localId||!accounts[localId])return;
 activeAccountId=localId;
 const account=accounts[localId];
 data=account.data||{};
 timeData=account.timeData||{};
 loadStatusMetaForAccount(localId);
 WORSHIP=loadAgendaForAccount(localId);
 profile=account.profile||{name:"Pengguna",email:"",whatsapp:DEFAULT_WHATSAPP,photo:""};
 if(!profile.whatsapp)profile.whatsapp=DEFAULT_WHATSAPP;
 activityShared=!!account.activityShared;
 selectedDate=today();
 hijriCursor=getHijriParts(selectedDate);
 draftRecord={...record(selectedDate)};
 recapCursorDate=today();
 recapCursorHijri=getHijriParts(recapCursorDate);
 persistAccounts();
 updateProfile();
 hydrateProfilePhoto();
 renderDashboard();
 renderAbsensi();
 renderCalendar();
 renderRecap();
}
function makeAccountId(){return "local-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7)}
function profileAvatarMarkup(p,cls=""){return p&&p.photo?`<img class="${cls}" src="${p.photo}" alt="">`:initials(p&&p.name)}
function key(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function pad(n){return String(n).padStart(2,"0")}
function today(){const d=new Date();d.setHours(12,0,0,0);return d}
function fmtGreg(d){return new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(d)}
function fmtWeekday(d){return new Intl.DateTimeFormat("id-ID",{weekday:"long"}).format(d)}
function gregorianToJd(y,m,d){
 if(m<=2){y--;m+=12}
 const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
 return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
}
function islamicToJd(y,m,d){return d+Math.ceil(29.5*(m-1))+(y-1)*354+Math.floor((3+11*y)/30)+1948439.5}
function jdToGregorian(jd){
 const z=Math.floor(jd+0.5),alpha=Math.floor((z-1867216.25)/36524.25);
 const a=z+1+alpha-Math.floor(alpha/4),b=a+1524,c=Math.floor((b-122.1)/365.25),dd=Math.floor(365.25*c),e=Math.floor((b-dd)/30.6001);
 const day=b-dd-Math.floor(30.6001*e),month=e<14?e-1:e-13,year=month>2?c-4716:c-4715;
 return new Date(year,month-1,day,12,0,0,0);
}
function hijriToGregorian(y,m,d){return jdToGregorian(islamicToJd(y,m,d))}
function gregorianToHijri(d){
 const jd=gregorianToJd(d.getFullYear(),d.getMonth()+1,d.getDate());
 const year=Math.floor((30*(jd-1948439.5)+10646)/10631);
 const month=Math.min(12,Math.ceil((jd-29-islamicToJd(year,1,1))/29.5)+1);
 const day=Math.floor(jd-islamicToJd(year,month,1)+1);
 return {day,month,year};
}
function getHijriParts(d){
 try{
  const f=new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura",{day:"numeric",month:"numeric",year:"numeric"});
  const p=f.formatToParts(d),day=p.find(x=>x.type==="day"),month=p.find(x=>x.type==="month"),year=p.find(x=>x.type==="year");
  if(day&&month&&year){const h={day:+day.value,month:+month.value,year:+year.value};if(h.day>0&&h.month>0&&h.year>0)return h}
 }catch(e){}
 return gregorianToHijri(d);
}

function hijriString(d){
 const h=getHijriParts(d);
 return h.day+" "+(HIJRI_MONTHS[h.month-1]||"") +" "+h.year+" H";
}
function record(d){return data[key(d)]||{}}
function initials(name){return (name||"Pengguna").trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"U"}
function renderNav(){
 const make=cls=>NAV.map(([id,label])=>`<button class="${cls}" data-page="${id}" onclick="go('${id}')" aria-label="${label}"><span class="nav-icon">${NAV_ICONS[id]}</span><span class="nav-label">${label}</span></button>`).join("");
 document.getElementById("sideNav").innerHTML=make("");
 document.getElementById("mobileNav").innerHTML=make("");
}
function go(page,fromHistory=false){
 const current=document.querySelector(".page.active")?.id;
 if(page!==current && dirty && page!=="absensi"){
  if(fromHistory){
   // Browser/Android back sudah memindahkan history ke target. Kembalikan
   // entry halaman aktif dulu, lalu minta konfirmasi sebelum benar-benar keluar.
   try{history.pushState({aihPage:current},"",location.href)}catch(e){}
  }
  openModal("Perubahan belum disimpan","Kamu sudah mengubah absensi. Jika keluar sekarang, perubahan yang belum disimpan akan dibatalkan.","Keluar tanpa menyimpan",()=>{
    discardDraft();
    if(fromHistory){
      window.__allowHistoryPop=true;
      try{history.back()}catch(e){go(page)}
    }else{
      go(page);
    }
  });
  return;
 }
 if(page!==current && !fromHistory){
  try{history.pushState({aihPage:page},"",location.href)}catch(e){}
 }
 if(page==="absensi" && !dirty) draftRecord={...record(selectedDate)};
 const direction=window.__pageSwipeDirection||"";
 document.querySelectorAll(".page").forEach(x=>{x.classList.remove("swipe-in-left","swipe-in-right");x.classList.toggle("active",x.id===page)});
 document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 document.body.classList.toggle("prayer-schedule-open",page==="shalat");
document.body.classList.toggle("collection-reader-open",page.startsWith("koleksi")&&page!=="koleksi"||page==="tasbih");
document.body.classList.toggle("dzikir-open",page==="koleksiDzikir");
document.body.classList.toggle("profile-page-open",page==="profil");
if(page!=="profil") closeProfileHelp();
 const active=document.getElementById(page);
 if(active&&direction){active.classList.add(direction==="left"?"swipe-in-left":"swipe-in-right");setTimeout(()=>active.classList.remove("swipe-in-left","swipe-in-right"),260)}
 window.__pageSwipeDirection="";
 if(page==="absensi")renderAbsensi();if(page==="agendaEditor")renderAgendaEditor();if(page==="kalender")renderCalendar();if(page==="shalat")renderPrayerSchedule();if(page==="rekap")renderRecap();if(page==="profil")updateProfile();
 ensureCollectionPageModule(page);
 window.scrollTo({top:0,behavior:"auto"});
}
/* Each koleksi room (Qur'an, Hadits, Do'a, Dzikir, Mutiara) ships as its own
   js/pages/*.js + (for Dzikir) its own HTML partial. Nothing is downloaded
   until the room is actually opened, so the first paint of the app stays
   light — this function injects the right <script> exactly once per room. */
const COLLECTION_PAGE_MODULES={
  koleksiQuran:"js/pages/quran.js",
  koleksiHadits:"js/pages/hadits.js",
  koleksiDoa:"js/pages/doa.js",
  koleksiDzikir:"js/pages/dzikir.js",
  koleksiMutiara:"js/pages/mutiara.js",
  tasbih:"js/pages/tasbih.js"
};
window.__loadedPageModules=window.__loadedPageModules||{};
function ensureCollectionPageModule(page){
  const src=COLLECTION_PAGE_MODULES[page];
  if(!src||window.__loadedPageModules[src])return;
  window.__loadedPageModules[src]=true;
  const s=document.createElement("script");
  s.src="./"+src;
  s.onerror=()=>{
    window.__loadedPageModules[src]=false;
    const mount=document.querySelector(`#${page} .page-mount`);
    if(mount)mount.innerHTML='<div class="card collection-empty-state"><b>Gagal memuat</b><p>Periksa koneksi internet, lalu buka kembali halaman ini.</p></div>';
  };
  document.body.appendChild(s);
}
function updateProfile(){
 // Bantuan FAB hanya boleh hidup saat room Profil benar-benar aktif.
 const profilePage=document.getElementById("profil");
 document.body.classList.toggle("profile-page-open",!!profilePage?.classList.contains("active"));
 const n=profile.name||"Pengguna";document.getElementById("topName").textContent=n;
 const top=document.getElementById("avatar");top.innerHTML=profile.photo?`<img src="${profile.photo}" alt="">`:initials(n);
 document.getElementById("greeting").textContent=`Assalamu'alaikum, ${n.split(" ")[0]} 👋`;
 const nameInput=document.getElementById("nameInput");if(nameInput)nameInput.value=profile.name||"";const emailInput=document.getElementById("emailInput");if(emailInput)emailInput.value=profile.email||"";
 const waInput=document.getElementById("whatsappInput");if(waInput)waInput.value=profile.whatsapp||DEFAULT_WHATSAPP;
 document.getElementById("profileTitle").textContent=n;
 const big=document.getElementById("profileBig");big.innerHTML=profile.photo?`<img src="${profile.photo}" alt="Foto profil">`:initials(n);
 syncAccountPopover();
 loadPersonalNotes();
 const todayRecord=record(today()),vals=Object.values(todayRecord),done=vals.filter(v=>v==="done"||v==="khatam").length,no=vals.filter(v=>v==="no").length,khatam=vals.filter(v=>v==="khatam").length;
 const rp=document.getElementById("profileRecapProgress"),rd=document.getElementById("profileRecapDone"),rn=document.getElementById("profileRecapNo"),rk=document.getElementById("profileRecapKhatam");
 if(rp)rp.textContent=Math.round((done/Math.max(WORSHIP.length,1))*100)+"%";if(rd)rd.textContent=done;if(rn)rn.textContent=no;if(rk)rk.textContent=khatam;
 applyTheme(getTheme(),false);
}
/* Kata-kata Mutiara now lives in its own file (js/data/quotes.json, loaded by
   js/pages/mutiara.js) so the quotes collection can grow without bloating this
   core file. A tiny fallback keeps the dashboard's "Quotes hari ini" card from
   looking empty for the instant before that file finishes loading. */
let DAILY_QUOTES=[
  {text:"فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",detail:"Karena sesungguhnya bersama kesulitan ada kemudahan.",source:"Al-Qur'an • QS. Al-Insyirah 94:5"},
  {text:"إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",detail:"Sesungguhnya amal-amal itu bergantung pada niat.",source:"Hadits • HR. Bukhari dan Muslim"}
];
function setDailyQuotes(list){
  if(Array.isArray(list)&&list.length){DAILY_QUOTES=list;renderDailyQuote();}
}
let dailyQuoteIndex=-1;
function renderDailyQuote(){
  if(!DAILY_QUOTES.length)return;
  let last=-1;
  try{last=parseInt(localStorage.getItem("aih_daily_quote_index_v1")||"-1",10)}catch(e){}
  let idx=Math.floor(Math.random()*DAILY_QUOTES.length);
  if(DAILY_QUOTES.length>1 && (idx===last || idx===dailyQuoteIndex)) idx=(idx+1+Math.floor(Math.random()*(DAILY_QUOTES.length-1)))%DAILY_QUOTES.length;
  dailyQuoteIndex=idx;
  try{localStorage.setItem("aih_daily_quote_index_v1",String(idx))}catch(e){}
  const q=DAILY_QUOTES[idx];
  const el=document.getElementById("dailyQuoteText"),title=document.getElementById("dailyQuoteTitle");
  if(el)el.textContent=q.detail;
  if(title)title.textContent=`“${q.text}”`;
  const card=document.querySelector(".quote");
  if(card){
    let source=card.querySelector(".daily-quote-source");
    if(!source){source=document.createElement("small");source.className="daily-quote-source";source.style.cssText="display:block;margin-top:7px;font-size:9px;color:var(--muted)";card.appendChild(source)}
    source.textContent=q.source;
  }
}
function renderDashboard(){
 const r=record(today()),vals=Object.values(r),done=vals.filter(v=>v==="done").length,no=vals.filter(v=>v==="no").length,k=vals.filter(v=>v==="khatam").length,p=Math.round(done/WORSHIP.length*100);
 document.getElementById("heroDate").textContent=`${hijriString(today())} • ${fmtGreg(today())}`;
 renderDailyQuote();
 document.getElementById("sDone").textContent=done;document.getElementById("sNo").textContent=no;document.getElementById("sKhatam").textContent=k;document.getElementById("sPercent").textContent=p+"%";
 document.getElementById("dashProgress").style.width=p+"%";document.getElementById("dashCount").textContent=`${done} dari ${WORSHIP.length}`;document.getElementById("dashPercent").textContent=p+"%";
}
function renderAbsensi(){
 document.getElementById("absHijri").textContent=hijriString(selectedDate);
 document.getElementById("absDate").textContent=fmtGreg(selectedDate);
 document.getElementById("absGreg").textContent=`Tanggal Masehi • ${fmtWeekday(selectedDate)}`;
 const r=draftRecord;
 document.getElementById("worshipList").innerHTML=WORSHIP.map(([id,name,ic,statuses])=>{
  const savedTime=timeData[key(selectedDate)]?.[id];
  const timeLabel=savedTime?` • ${savedTime}`:"";
  return `<div class="worship"><div class="w-main"><div class="w-ico">${agendaIcon(id,ic)}</div><div class="w-name"><b>${name}</b><div class="w-sub">${r[id]?statusInfo(r[id])[1]+timeLabel:"Belum diisi"}</div></div></div><div class="status">${statuses.map(s=>`<button class="${r[id]===s?"active":""} ${s==="no"?"danger":""}" onclick="setStatus('${id}','${s}')" aria-label="${statusInfo(s)[1]}"><span class="sicon">${statusIcon(s)}</span><span class="stext">${statusInfo(s)[1]}</span></button>`).join("")}</div></div>`
 }).join("");
}
function getFirestore(){
 try{
  return window.__klFirebaseDb||null;
 }catch(err){
  console.error("Firestore belum siap:",err);
  return null;
 }
}
function getCloudUser(){
 try{return window.__klFirebaseAuth?.currentUser||null}catch(err){return null}
}
function firestoreStatus(status){
 return status==="done"||status==="khatam"?"terlaksana":status==="no"?"tidak_terlaksana":status==="period"?"datang_bulan":null;
}
function localStatus(status){
 return status==="terlaksana"?"done":status==="tidak_terlaksana"?"no":status==="datang_bulan"?"period":null;
}
function firestoreAbsensiRef(dateKey){
 const db=getFirestore(),user=getCloudUser();
 if(!db||!user)return null;
 return db.collection("users").doc(user.uid).collection("absensi_harian").doc(dateKey);
}
function cloudAbsensiPayload(recordValue){
 const payload={updated_at:firebase.firestore.FieldValue.serverTimestamp()};
 WORSHIP.forEach(([id])=>{
  const normalized=firestoreStatus(recordValue?.[id]);
  payload[id]=normalized||firebase.firestore.FieldValue.delete();
 });
 return payload;
}
async function saveAbsensiToFirestore(dateKey,recordValue){
 const ref=firestoreAbsensiRef(dateKey);
 if(!ref)return false;
 try{
  await ref.set(cloudAbsensiPayload(recordValue),{merge:true});
  return true;
 }catch(err){
  console.error("Gagal menyimpan absensi ke Firestore:",err);
  toast("Absensi lokal tersimpan, tetapi gagal disinkronkan ke Firestore.");
  return false;
 }
}
function applyFirestoreAbsensi(snapshot,dateKey){
 const raw=snapshot.exists?snapshot.data()||{}:{};
 const cloudRecord={};
 Object.entries(raw).forEach(([id,status])=>{
  if(id==="updated_at")return;
  const normalized=localStatus(status);
  if(normalized)cloudRecord[id]=normalized;
 });
 data[dateKey]=cloudRecord;
 if(!Object.keys(cloudRecord).length)delete data[dateKey];
 syncActiveAccount();
 if(key(selectedDate)===dateKey&&!dirty){
  draftRecord={...cloudRecord};
  renderAbsensi();
 }
 renderDashboard();
 renderCalendar();
 renderRecap();
}
function subscribeAbsensiDate(date){
 const dateKey=key(date);
 if(firestoreAbsensiDateKey===dateKey&&firestoreAbsensiUnsubscribe)return;
 if(firestoreAbsensiUnsubscribe){firestoreAbsensiUnsubscribe();firestoreAbsensiUnsubscribe=null}
 firestoreAbsensiDateKey="";
 const ref=firestoreAbsensiRef(dateKey);
 if(!ref)return;
 firestoreAbsensiDateKey=dateKey;
 ref.get().then(snapshot=>applyFirestoreAbsensi(snapshot,dateKey)).catch(err=>{
  console.error("Gagal mengambil absensi dari Firestore:",err);
  toast("Data absensi Firestore tidak dapat dimuat.");
 });
 firestoreAbsensiUnsubscribe=ref.onSnapshot(
  snapshot=>applyFirestoreAbsensi(snapshot,dateKey),
  err=>{
   console.error("Gagal memuat realtime absensi dari Firestore:",err);
   toast("Data absensi Firestore tidak dapat dimuat.");
  }
 );
}
function setStatus(id,status){
 if(draftRecord[id]===status)delete draftRecord[id];else draftRecord[id]=status;
 dirty=true;
 renderAbsensi();
 saveAbsensiToFirestore(key(selectedDate),draftRecord).then(ok=>{
  if(ok)toast("Status absensi tersimpan ke Firestore ✓");
 });
}
function agendaEditorRows(){
  return [...document.querySelectorAll("#agendaEditorList .agenda-editor-row")].map(row=>({
    id:row.dataset.id||makeAgendaId(),
    name:row.querySelector(".agenda-name-input")?.value.trim()||"Agenda",
    emoji:row.querySelector(".agenda-emoji-input")?.value.trim()||"✨",
    statuses:[...row.querySelectorAll(".agenda-status-toggle:checked")].map(x=>x.dataset.status)
  }));
}
function renderStatusEditor(){
  const list=document.getElementById("statusEditorList");if(!list)return;
  list.innerHTML=Object.entries(STATUS_META).map(([id,[emoji,label]])=>`<div class="status-editor-row" data-status="${escapeHtml(id)}">
    <input class="status-emoji-input" type="text" maxlength="8" value="${escapeHtml(emoji)}" aria-label="Emoji ${escapeHtml(label)}">
    <input class="status-label-input" type="text" maxlength="32" value="${escapeHtml(label)}" aria-label="Nama ${escapeHtml(label)}">
    ${Object.prototype.hasOwnProperty.call(DEFAULT_STATUS_META,id)?'<span class="status-fixed">Bawaan</span>':`<button class="agenda-delete status-delete" type="button" onclick="deleteStatusCategory('${escapeHtml(id)}')" aria-label="Hapus kategori ${escapeHtml(label)}">✕</button>`}
  </div>`).join("");
}
function renderAgendaEditor(){
  const list=document.getElementById("agendaEditorList");if(!list)return;
  const statusEntries=Object.entries(STATUS_META);
  list.innerHTML=WORSHIP.map((item,index)=>{
    const selected=new Set(item[3]||["done","no","period"]);
    return `<div class="agenda-editor-row" data-id="${escapeHtml(item[0])}">
      <div class="agenda-order">
        <button type="button" onclick="moveAgendaEditorRow(${index},-1)" aria-label="Naikkan ${escapeHtml(item[1])}" ${index===0?"disabled":""}>↑</button>
        <button type="button" onclick="moveAgendaEditorRow(${index},1)" aria-label="Turunkan ${escapeHtml(item[1])}" ${index===WORSHIP.length-1?"disabled":""}>↓</button>
      </div>
      <div class="agenda-editor-fields">
        <input class="agenda-name-input" type="text" maxlength="60" value="${escapeHtml(item[1])}" aria-label="Nama agenda">
        <input class="agenda-emoji-input" type="text" maxlength="8" value="${escapeHtml(item[2])}" aria-label="Emoji agenda">
        <div class="agenda-status-toggles">${statusEntries.map(([sid,[sem,sl]])=>`<label><input class="agenda-status-toggle" type="checkbox" data-status="${escapeHtml(sid)}" ${selected.has(sid)?"checked":""}><span>${escapeHtml(sem)} ${escapeHtml(sl)}</span></label>`).join("")}</div>
      </div>
      <button class="agenda-delete" type="button" onclick="deleteAgendaEditorRow(${index})" aria-label="Hapus ${escapeHtml(item[1])}">✕</button>
    </div>`;
  }).join("");
  renderStatusEditor();
}
function addStatusCategory(){
  const label=prompt("Nama kategori baru:","Sedang belajar");if(label===null)return;
  const clean=label.trim().slice(0,32);if(!clean)return;
  let id=clean.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,24)||"status_baru";
  while(STATUS_META[id])id=id+"_"+Math.floor(Math.random()*90+10);
  STATUS_META[id]=["✨",clean];
  WORSHIP=WORSHIP.map(x=>[x[0],x[1],x[2],[...(x[3]||[]),id]]);
  saveStatusMetaForAccount(STATUS_META);
  renderAgendaEditor();
}
function deleteStatusCategory(id){
  if(Object.prototype.hasOwnProperty.call(DEFAULT_STATUS_META,id))return;
  const label=statusInfo(id)[1];
  if(!confirm(`Hapus kategori "${label}" dari pilihan agenda?`))return;
  delete STATUS_META[id];
  WORSHIP=WORSHIP.map(x=>[x[0],x[1],x[2],(x[3]||[]).filter(s=>s!==id)]);
  saveStatusMetaForAccount(STATUS_META);
  renderAgendaEditor();
}
function saveStatusEditor(){
  const next=cloneStatusMeta(STATUS_META);
  document.querySelectorAll("#statusEditorList .status-editor-row").forEach(row=>{
    const id=row.dataset.status;
    const emoji=row.querySelector(".status-emoji-input")?.value.trim()||"✨";
    const label=row.querySelector(".status-label-input")?.value.trim()||id;
    if(next[id])next[id]=[emoji.slice(0,8),label.slice(0,32)];
  });
  saveStatusMetaForAccount(next);
}
function moveAgendaEditorRow(index,delta){
  const rows=agendaEditorRows(),to=index+delta;
  if(to<0||to>=rows.length)return;
  const item=rows.splice(index,1)[0];rows.splice(to,0,item);
  WORSHIP=rows.map(x=>[x.id,x.name,x.emoji,x.statuses]);
  renderAgendaEditor();
}
function deleteAgendaEditorRow(index){
  const rows=agendaEditorRows();
  if(rows.length<=1){toast("Minimal harus ada satu agenda.");return}
  const removed=rows[index]?.name||"agenda";
  if(!confirm(`Hapus agenda "${removed}"?`))return;
  rows.splice(index,1);
  WORSHIP=rows.map(x=>[x.id,x.name,x.emoji,x.statuses]);
  renderAgendaEditor();
}
function addAgendaEditorRow(){
  const rows=agendaEditorRows();
  rows.push({id:makeAgendaId(),name:"Agenda baru",emoji:"✨",statuses:["done","no","period"]});
  WORSHIP=rows.map(x=>[x.id,x.name,x.emoji,x.statuses]);
  renderAgendaEditor();
  const inputs=document.querySelectorAll("#agendaEditorList .agenda-name-input");
  inputs[inputs.length-1]?.focus();
}
function saveAgendaEditor(){
  saveStatusEditor();
  const rows=agendaEditorRows().filter(x=>x.name);
  if(!rows.length){toast("Tambahkan minimal satu agenda.");return}
  const ids=new Set();
  rows.forEach(x=>{if(ids.has(x.id))x.id=makeAgendaId();ids.add(x.id)});
  saveAgendaForAccount(rows.map(x=>[x.id,x.name,x.emoji,x.statuses]));
  renderDashboard();renderAbsensi();renderCalendar();renderRecap();renderAgendaEditor();
  toast("Agenda berhasil disimpan ✓");
}
function resetAgendaEditor(){
  if(!confirm("Kembalikan semua agenda ke susunan bawaan?"))return;
  saveAgendaForAccount(DEFAULT_WORSHIP);
  renderDashboard();renderAbsensi();renderCalendar();renderRecap();renderAgendaEditor();
  toast("Agenda dikembalikan ke bawaan ✓");
}
function openAgendaEditor(){
  renderAgendaEditor();
  go("agendaEditor");
}
function closeAgendaEditor(){
  WORSHIP=loadAgendaForAccount(activeAccountId);
  go("absensi");
}
function collectionPlaceholder(name){
  const map={
    "Al-Qur'an":"koleksiQuran",
    "Hadits Nabi Muhammad ﷺ":"koleksiHadits",
    "Kumpulan Do'a":"koleksiDoa",
    "Dzikir Pagi & Petang":"koleksiDzikir",
    "Kata-kata Mutiara":"koleksiMutiara"
  };
  if(map[name]) go(map[name]);
}


function setProfileHelpInteraction(open){
  const main=document.querySelector(".main");
  const nav=document.getElementById("mobileNav");
  if(main)main.inert=!!open;
  if(nav)nav.inert=!!open;
  document.body.classList.toggle("profile-help-open",!!open);
}
function toggleProfileHelp(){
  const panel=document.getElementById("profileHelpPanel");if(!panel)return;
  if(!document.getElementById("profil")?.classList.contains("active")){
    closeProfileHelp();
    return;
  }
  const open=!panel.classList.contains("show");
  panel.classList.toggle("show",open);
  setProfileHelpInteraction(open);
  if(open)requestAnimationFrame(()=>panel.querySelector("button:not([hidden])")?.focus({preventScroll:true}));
  else backToHelpBars();
}
function closeProfileHelp(){
  const panel=document.getElementById("profileHelpPanel");if(panel)panel.classList.remove("show");
  setProfileHelpInteraction(false);
  backToHelpBars();
}
function backToHelpBars(){
  document.getElementById("profileHelpBars")?.style.removeProperty("display");
  const form=document.getElementById("bugReportForm"),creator=document.getElementById("creatorProfileCard");
  if(form)form.classList.remove("show");if(creator)creator.classList.remove("show");
}
function openBugReport(){
  const bars=document.getElementById("profileHelpBars"),form=document.getElementById("bugReportForm"),creator=document.getElementById("creatorProfileCard");
  if(bars)bars.style.display="none";if(creator)creator.classList.remove("show");if(form)form.classList.add("show");validateBugReport();
}
function openCreatorProfile(){
  const bars=document.getElementById("profileHelpBars"),form=document.getElementById("bugReportForm"),creator=document.getElementById("creatorProfileCard");
  if(bars)bars.style.display="none";if(form)form.classList.remove("show");if(creator)creator.classList.add("show");
}
function validateBugReport(){
  const name=(document.getElementById("bugName")?.value||"").trim();
  const reason=(document.getElementById("bugReason")?.value||"").trim();
  const ok=!!name&&reason.length>=10;
  const btn=document.getElementById("bugSubmitBtn"),v=document.getElementById("bugValidation");
  if(btn)btn.disabled=!ok;
  if(v){
    v.classList.toggle("ok",ok);
    v.textContent=ok
      ?"Laporan siap dikirim langsung ke WhatsApp pengembang."
      :"Lengkapi nama dan alasan (minimal 10 karakter) agar laporan dapat dikirim langsung ke WhatsApp pengembang.";
  }
  return ok;
}
["bugName","bugReason"].forEach(id=>document.getElementById(id)?.addEventListener("input",validateBugReport));
async function sendBugReportToWhatsApp(){
  if(!validateBugReport())return;
  const name=document.getElementById("bugName").value.trim();
  const reason=document.getElementById("bugReason").value.trim();
  const number="6289506138191";
  const message=`LAPORAN BUG KISAH LILLAH\n\nNama: ${name}\nAlasan/Masalah:\n${reason}\n\nMohon dicek.`;
  const url=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  try{
    window.location.assign(url);
  }catch(_){
    window.open(url,"_blank","noopener,noreferrer");
  }
  toast("WhatsApp dibuka dengan laporan ✓");
}



function getTheme(){
  return localStorage.getItem("aih_theme_v1")||"light";
}
function applyTheme(theme,save=true){
  const dark=String(theme)==="dark";
  const root=document.documentElement;
  root.dataset.theme=dark?"dark":"light";
  root.style.colorScheme=dark?"dark":"light";
  document.body?.classList.toggle("theme-dark",dark);
  if(save)try{localStorage.setItem("aih_theme_v1",dark?"dark":"light")}catch(e){}
  const meta=document.getElementById("themeColorMeta");if(meta)meta.content=dark?"#061b18":"#ffffff";
  const toggle=document.getElementById("themeToggle");
  if(toggle){
    toggle.classList.toggle("on",dark);
    toggle.setAttribute("aria-pressed",dark?"true":"false");
    toggle.dataset.theme=dark?"dark":"light";
  }
  const text=document.getElementById("themeSettingText");if(text)text.textContent=dark?"Mode gelap sedang aktif":"Gunakan tampilan gelap";
  const sum=document.getElementById("profileThemeSummary");if(sum)sum.textContent=dark?"Mode gelap":"Mode terang";
  refreshDevicePermissionText();
  // If no modal is visible, make sure the page is immediately touchable again.
  if(!document.querySelector(".modal-backdrop.show")){
    document.documentElement.classList.remove("modal-open");
    document.body.style.pointerEvents="";
    document.body.style.touchAction="";
  }
}
function openSettings(){
  const modal=document.getElementById("settingsModal");if(!modal)return;
  modal.classList.add("show");lockModalInteraction(modal);applyTheme(getTheme(),false);renderAdhanSettings();
}
function closeSettings(){
  const modal=document.getElementById("settingsModal");
  if(modal)modal.classList.remove("show");
  unlockModalInteraction(modal);
}
function refreshDevicePermissionText(){
  const locText=document.getElementById("deviceLocationText");
  if(!locText) return;
  if(!("geolocation" in navigator)){
    locText.textContent="Browser tidak mendukung lokasi";
    return;
  }
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:"geolocation"}).then(permission=>{
      const state=permission.state||"prompt";
      locText.textContent = state==="granted"?"Izin lokasi aktif":(state==="denied"?"Lokasi ditolak":"Belum diberikan");
    }).catch(()=>locText.textContent="Siap dipakai");
    return;
  }
  locText.textContent="Siap dipakai";
}
function requestDeviceLocationPermission(){
  if(!("geolocation" in navigator)){
    toast("Browser ini tidak mendukung akses lokasi.");
    refreshDevicePermissionText();
    return false;
  }
  const finish=(ok,message)=>{
    if(ok){toast(message);}
    else{toast("Izin lokasi belum diberikan.");}
    refreshDevicePermissionText();
  };
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:"geolocation"}).then(permission=>{
      if(permission.state==="granted"){
        finish(true,"Izin lokasi aktif ✓");
        return;
      }
      navigator.geolocation.getCurrentPosition(()=>finish(true,"Izin lokasi disetujui ✓"),()=>finish(false,"Izin lokasi belum diberikan."),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
    }).catch(()=>{
      navigator.geolocation.getCurrentPosition(()=>finish(true,"Izin lokasi disetujui ✓"),()=>finish(false,"Izin lokasi belum diberikan."),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
    });
    return true;
  }
  navigator.geolocation.getCurrentPosition(()=>finish(true,"Izin lokasi disetujui ✓"),()=>finish(false,"Izin lokasi belum diberikan."),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
  return true;
}
function toggleTheme(){
  applyTheme(getTheme()==="dark"?"light":"dark",true);
  const toggle=document.getElementById("themeToggle");
  if(toggle){
    toggle.blur();
    setTimeout(()=>toggle.focus({preventScroll:true}),0);
  }
}
function initTheme(){applyTheme(getTheme(),false);refreshDevicePermissionText();loadPersonalNotes();}
function discardDraft(){
 draftRecord={...record(selectedDate)};
 dirty=false;
 renderAbsensi();
 renderDashboard();
}
function formatEntryTime(date){
 return new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",hour12:false}).format(date);
}
function saveCurrent(){
 const k=key(selectedDate);
 const previous=record(selectedDate);
 const previousTimes=timeData[k]||{};
 const now=formatEntryTime(new Date());
 const nextTimes={};
 Object.entries(draftRecord).forEach(([id,status])=>{
   // Status baru/perubahan mendapat waktu saat tombol Simpan ditekan.
   nextTimes[id]=(previous[id]===status&&previousTimes[id])?previousTimes[id]:now;
 });
 if(Object.keys(draftRecord).length) data[k]={...draftRecord};
 else delete data[k];
 if(Object.keys(nextTimes).length) timeData[k]=nextTimes;
 else delete timeData[k];
 syncActiveAccount();
 saveAbsensiToFirestore(k,draftRecord);
 dirty=false;
 renderDashboard();
 renderCalendar();
 renderAbsensi();
 toast(`Absensi berhasil disimpan • ${now} ✓`);
}
function normalizeWhatsappNumber(value){
 const raw=String(value||"").trim().replace(/\D/g,"");
 if(!raw)return "";
 if(raw.startsWith("62"))return raw;
 if(raw.startsWith("0"))return "62"+raw.slice(1);
 if(raw.startsWith("8"))return "62"+raw;
 return raw;
}
function getWhatsappNumber(){
 return normalizeWhatsappNumber(profile?.whatsapp||DEFAULT_WHATSAPP);
}
function whatsappStatusMark(status){
 if(status==="done"||status==="khatam")return "—✅️";
 if(status==="period")return "—🌑";
 return "—❌️";
}
function whatsappWorshipName(name){
 return name==="Dhuha"?"Duha":name;
}
function buildAbsensiWhatsAppMessage(){
 const r=record(selectedDate);
 const weekdayMap=["Ahad","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
 const header=`${weekdayMap[selectedDate.getDay()]}, ${fmtGreg(selectedDate)} M/${hijriString(selectedDate)}`;
 const lines=WORSHIP.map(([id,name])=>{
   return `${whatsappWorshipName(name)} ${whatsappStatusMark(r[id])}`;
 });
 return `${header}\n\n${lines.join("\n\n")}`;
}
function sendAbsensiToWhatsApp(){
 const number=getWhatsappNumber();
 if(!number){toast("Nomor WhatsApp pribadi belum diisi.");return}
 const r=record(selectedDate);
 if(!Object.keys(r).length){toast("Simpan absensi terlebih dahulu sebelum mengirim.");return}
 const url=`https://wa.me/${number}?text=${encodeURIComponent(buildAbsensiWhatsAppMessage())}`;
 window.open(url,"_blank","noopener,noreferrer");
}
function requestChangeDate(){
 if(!dirty){go("kalender");return}
 openModal("Perubahan belum disimpan","Kamu sudah mengubah absensi. Jika keluar sekarang, perubahan yang belum disimpan bisa hilang.","Keluar tanpa menyimpan",()=>{discardDraft();go("kalender")});
}
function openModal(title,text,confirm,action){document.getElementById("modalTitle").textContent=title;document.getElementById("modalText").textContent=text;document.getElementById("modalConfirm").textContent=confirm;modalAction=action;document.getElementById("modal").classList.add("show")}
function closeModal(){document.getElementById("modal").classList.remove("show");modalAction=null}
document.getElementById("modalConfirm").onclick=()=>{const a=modalAction;closeModal();if(a)a()}
function selectToday(){
 const t=today();selectedDate=t;hijriCursor=getHijriParts(t);draftRecord={...record(t)};dirty=false;renderCalendar();
 if(!document.getElementById("kalender").classList.contains("active"))go("absensi");
}
function findHijriMonthStart(hYear,hMonth){
 const estimate=hijriToGregorian(hYear,hMonth,1);
 for(let off=-10;off<=10;off++){
  const d=new Date(estimate);d.setDate(estimate.getDate()+off);
  const h=getHijriParts(d);
  if(h.year===hYear&&h.month===hMonth&&h.day===1)return d;
 }
 return estimate;
}
function monthLength(hYear,hMonth){
 const start=findHijriMonthStart(hYear,hMonth);
 const nextM=hMonth===12?1:hMonth+1,nextY=hMonth===12?hYear+1:hYear;
 const next=findHijriMonthStart(nextY,nextM);
 return Math.max(29,Math.min(30,Math.round((next-start)/86400000)));
}
function renderYearPicker(){
 const el=document.getElementById("calYear");if(!el)return;
 const current=hijriCursor.year;
 const min=Math.max(1,current-100),max=current+100;
 el.innerHTML=Array.from({length:max-min+1},(_,i)=>{const y=min+i;return `<option value="${y}" ${y===current?"selected":""}>${y} H</option>`}).join("");
}
function openHijriYearPicker(){
 const select=document.getElementById("calYear");
 if(!select)return;
 select.focus();
 try{if(select.showPicker)select.showPicker();else select.click()}catch(_){select.click()}
}
function jumpHijriYear(value){
 const y=Number(value);if(!Number.isFinite(y)||y<1)return;
 hijriCursor={year:y,month:hijriCursor.month,day:1};renderCalendar();
}
function moveHijriMonth(delta){
 let y=hijriCursor.year,m=hijriCursor.month+delta;if(m<1){m=12;y--}if(m>12){m=1;y++}
 hijriCursor={year:y,month:m,day:1};renderCalendar();
}

let calendarSwipeX=0,calendarSwipeY=0,calendarSwipeActive=false,calendarSwipeAxis=null;
function bindCalendarSwipe(){
 bindCalendarLikeSwipe({
   card:".calendar-card",
   content:"#days",
   // Date cells are buttons, but they must also be valid swipe starting points.
   ignoreTarget:"select,option",
   onCommit:dir=>moveHijriMonth(dir)
 });
}
function bindCalendarLikeSwipe({card:cardSelector,content:contentSelector,ignoreTarget,onCommit}){
 const card=document.querySelector(cardSelector),content=document.querySelector(contentSelector);
 if(!card||!content||card.dataset.swipeBound==="1")return;
 card.dataset.swipeBound="1";
 let x=0,y=0,active=false,axis=null;
 const reset=()=>{
   active=false;axis=null;card.classList.remove("is-dragging");
   content.style.transform="";content.style.opacity="";content.style.transition="";
 };
 card.addEventListener("pointerdown",e=>{
   if(e.pointerType==="mouse"&&e.button!==0)return;
   if((ignoreTarget&&e.target.closest(ignoreTarget))||e.target.closest("select,option"))return;
   x=e.clientX;y=e.clientY;active=true;axis=null;card.classList.add("is-dragging");
   try{card.setPointerCapture(e.pointerId)}catch(_){}
 });
 const move=e=>{
   if(!active)return;
   const dx=e.clientX-x,dy=e.clientY-y;
   if(!axis){
     if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
     axis=Math.abs(dx)>Math.abs(dy)*1.08?"x":"y";
   }
   if(axis!=="x")return;
   e.preventDefault();
   const limited=Math.max(-140,Math.min(140,dx*.82));
   content.style.transform=`translate3d(${limited}px,0,0)`;
   content.style.opacity=String(1-Math.min(.18,Math.abs(limited)/760));
 };
 card.addEventListener("pointermove",move);
 window.addEventListener("pointermove",move,true);
 const end=e=>{
   if(!active)return;
   const dx=e.clientX-x,dy=e.clientY-y,wasHorizontal=axis==="x";
   const threshold=Math.min(72,Math.max(46,card.clientWidth*.13));
   if(!wasHorizontal||Math.abs(dx)<threshold||Math.abs(dx)<=Math.abs(dy)*1.15){reset();return}
   active=false;axis=null;card.classList.remove("is-dragging");
   content.style.transition="transform .18s ease,opacity .14s ease";
   const dir=dx<0?1:-1;
   content.style.transform=`translate3d(${dir>0?-110:110}%,0,0)`;
   content.style.opacity=".18";
   setTimeout(()=>{
     onCommit(dir);
     const next=document.querySelector(contentSelector);
     if(!next)return;
     next.style.transition="none";
     next.style.transform=`translate3d(${dir>0?110:-110}%,0,0)`;
     next.style.opacity=".18";
     requestAnimationFrame(()=>requestAnimationFrame(()=>{
       next.style.transition="transform .24s cubic-bezier(.22,.8,.25,1),opacity .2s ease";
       next.style.transform="translate3d(0,0,0)";
       next.style.opacity="1";
       setTimeout(()=>{next.style.transition="";next.style.opacity="";next.style.transform=""},280);
     }));
   },180);
 };
 card.addEventListener("pointerup",end);
 // Keep the gesture reliable when the browser hands the pointer to scrolling
 // or releases capture before the card receives pointerup.
 window.addEventListener("pointerup",end,true);
 card.addEventListener("pointercancel",reset);
 window.addEventListener("pointercancel",reset,true);
 card.addEventListener("lostpointercapture",()=>{if(active)card.classList.remove("is-dragging")});
}
function animateCalendarMonth(dir){
 const oldDays=document.getElementById("days");
 if(!oldDays)return;
 oldDays.style.transition="transform .18s ease,opacity .14s ease";
 oldDays.style.transform=`translate3d(${dir>0?-110:110}%,0,0)`;
 oldDays.style.opacity=".18";
 setTimeout(()=>{
  moveHijriMonth(dir);
  const days=document.getElementById("days");
  if(!days)return;
  days.style.transition="none";
  days.style.transform=`translate3d(${dir>0?110:-110}%,0,0)`;
  days.style.opacity=".18";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   days.style.transition="transform .24s cubic-bezier(.22,.8,.25,1),opacity .2s ease";
   days.style.transform="translate3d(0,0,0)";
   days.style.opacity="1";
   setTimeout(()=>{days.style.transition="";days.style.opacity="";days.style.transform=""},280);
  }));
 },180);
}
function calendarEventLabel(h){
 const key=`${h.month}-${h.day}`;
 const events={
  "1-1":"🌙 Tahun Baru Hijriah",
  "1-10":"🤲 Asyura",
  "3-12":"🕌 Maulid Nabi",
  "7-27":"✨ Isra Mi'raj",
  "8-15":"🌙 Nisfu Sya'ban",
  "9-1":"🌙 Awal Ramadhan",
  "9-17":"📖 Nuzulul Qur'an",
  "9-27":"🌙 Malam Lailatul Qadar*",
  "10-1":"🎉 Idulfitri",
  "12-9":"🕋 Arafah",
  "12-10":"🐑 Iduladha"
 };
 return events[key]||"";
}
function renderCalendarSelectedInfo(){
 const el=document.getElementById("calendarSelectedInfo");if(!el)return;
 const d=selectedDate||today(),h=getHijriParts(d),event=calendarEventLabel(h),recorded=Object.keys(record(d)).length;
 const title=`${fmtWeekday(d)}, ${d.getDate()} ${new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(d)}`;
 const hijri=`${h.day} ${HIJRI_MONTHS[h.month-1]||""} ${h.year} H`;
 el.innerHTML=`<strong>${title}</strong><small>${hijri} • ${d.getDate()} ${new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(d)}</small>${event?`<span class="tag">${event}</span>`:""}${recorded?`<span class="tag" style="margin-left:5px">✓ Ada catatan ibadah</span>`:""}<button class="btn gold small" style="margin-top:9px;width:100%" type="button" onclick="openAbsensiForSelectedDate()">📋 Tekan untuk mengisi Absensi</button>`;
}
function renderCalendar(){
 const start=findHijriMonthStart(hijriCursor.year,hijriCursor.month);
 const len=monthLength(hijriCursor.year,hijriCursor.month),firstDow=start.getDay();
 const monthEnd=new Date(start);monthEnd.setDate(start.getDate()+len-1);
 const fmtMonthYear=d=>new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(d);
 const fmtDateLong=d=>new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(d);
 const gregRange=fmtMonthYear(start)===fmtMonthYear(monthEnd)?fmtMonthYear(start):`${new Intl.DateTimeFormat("id-ID",{month:"long"}).format(start)}–${fmtMonthYear(monthEnd)}`;
 document.getElementById("calTitle").innerHTML=`${HIJRI_MONTHS[hijriCursor.month-1]} ${hijriCursor.year} H<small id="calSub">${gregRange}</small>`;
 renderYearPicker();

 let out="";
 for(let i=0;i<firstDow;i++)out+='<div class="day empty"></div>';
 for(let i=0;i<len;i++){
   const d=new Date(start);d.setDate(start.getDate()+i);
   const r=record(d),has=Object.keys(r).length,h=getHijriParts(d),sel=key(d)===key(selectedDate),ist=key(d)===key(today());
   const gregMonth=new Intl.DateTimeFormat("id-ID",{month:"short"}).format(d).replace(".","");
   const gregShort=`${d.getDate()} ${gregMonth}`;
   const wd=new Intl.DateTimeFormat("id-ID",{weekday:"short"}).format(d).replace(".","");
   const event=calendarEventLabel(h);
   out+=`<button class="day ${has?"done":""} ${sel?"selected":""} ${ist?"today":""}" onclick="pickDate('${key(d)}')" aria-label="${fmtWeekday(d)}, ${d.getDate()} ${gregMonth} ${d.getFullYear()} — ${h.day} ${HIJRI_MONTHS[h.month-1]||""} ${h.year} H">
    <div class="d">${h.day}${has?'<i class="dot"></i>':""}</div>
    <div class="g" title="${d.getDate()} ${gregMonth} ${d.getFullYear()}">${gregShort}</div>
    <div class="h">${HIJRI_MONTHS[h.month-1]||""}</div>
    <div class="wd">${wd}</div>
    ${event?`<div class="event">• ${event}</div>`:""}
   </button>`;
 }
 document.getElementById("days").innerHTML=out;

 // Mobile: show only a calm 7-day window around the selected date.
 const mobile=document.getElementById("mobileAgenda");
 if(mobile){
   const anchor=new Date(selectedDate||today()); anchor.setHours(12,0,0,0);
   const dayStart=new Date(anchor); dayStart.setDate(anchor.getDate()-anchor.getDay());
   let agenda="";
   for(let i=0;i<7;i++){
     const d=new Date(dayStart);d.setDate(dayStart.getDate()+i);
     const h=getHijriParts(d),r=record(d),has=Object.keys(r).length;
     const sel=key(d)===key(selectedDate),ist=key(d)===key(today()),event=calendarEventLabel(h);
     const wd=fmtWeekday(d).slice(0,3);
     agenda+=`<button class="mobile-agenda-item ${sel?"selected":""} ${ist?"today":""}" onclick="pickDate('${key(d)}')" aria-label="${fmtWeekday(d)}, ${fmtDateLong(d)} — ${h.day} ${HIJRI_MONTHS[h.month-1]||""} ${h.year} H">
       <div><div class="ma-day">${wd}</div><div class="ma-date">${d.getDate()}</div></div>
       <div class="ma-main"><div class="ma-h">${h.day} ${HIJRI_MONTHS[h.month-1]||""} ${h.year} H</div><div class="ma-g">${fmtDateLong(d)}</div>${event?`<div class="ma-event">✨ ${event}</div>`:""}</div>
       <div class="ma-mark">${has?"✓":"›"}</div>
     </button>`;
   }
   mobile.innerHTML=agenda;
 }
 renderCalendarSelectedInfo();
 bindCalendarSwipe();
}

function pickDate(k){
 if(Date.now()<suppressCalendarClickUntil)return;
 const [y,m,d]=k.split("-").map(Number);const next=new Date(y,m-1,d,12);
 if(dirty){openModal("Ganti tanggal?","Perubahan absensi pada tanggal ini belum disimpan. Ganti tanggal tanpa menyimpan?","Ganti tanggal",()=>{discardDraft();selectedDate=next;hijriCursor=getHijriParts(next);draftRecord={...record(next)};subscribeAbsensiDate(next);renderCalendar();renderCalendarSelectedInfo()});return}
 selectedDate=next;hijriCursor=getHijriParts(next);draftRecord={...record(next)};subscribeAbsensiDate(next);renderCalendar();renderCalendarSelectedInfo()
}
function openAbsensiForSelectedDate(){
 const d=selectedDate||today();
 draftRecord={...record(d)};dirty=false;subscribeAbsensiDate(d);
 go("absensi");
}
function setRecapMode(mode){recapMode=mode;["daily","weekly","monthly"].forEach(x=>document.getElementById("tab"+x[0].toUpperCase()+x.slice(1)).classList.toggle("active",x===mode));renderRecap()}
function startOfWeek(d){const x=new Date(d);x.setHours(12,0,0,0);const day=x.getDay();x.setDate(x.getDate()-(day===0?6:day-1));return x}
function recapPeriodDates(){
 const arr=[];
 if(recapMode==="daily"){arr.push(new Date(recapCursorDate));return arr}
 if(recapMode==="weekly"){const start=startOfWeek(recapCursorDate);for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+i);if(d<=today())arr.push(d)}return arr}
 const h=recapCursorHijri,start=findHijriMonthStart(h.year,h.month),len=monthLength(h.year,h.month);
 for(let i=0;i<len;i++){const d=new Date(start);d.setDate(start.getDate()+i);if(d<=today()||h.year<getHijriParts(today()).year||h.month<getHijriParts(today()).month&&h.year===getHijriParts(today()).year)arr.push(d)}
 return arr
}
function moveRecapPeriod(delta){
 if(recapMode==="daily"){recapCursorDate=new Date(recapCursorDate);recapCursorDate.setDate(recapCursorDate.getDate()+delta)}
 else if(recapMode==="weekly"){recapCursorDate=new Date(recapCursorDate);recapCursorDate.setDate(recapCursorDate.getDate()+delta*7)}
 else{let y=recapCursorHijri.year,m=recapCursorHijri.month+delta;if(m<1){m=12;y--}if(m>12){m=1;y++}recapCursorHijri={year:y,month:m,day:1};recapCursorDate=findHijriMonthStart(y,m)}
 renderRecap();
}
function selectRecapToday(){recapCursorDate=today();recapCursorHijri=getHijriParts(recapCursorDate);renderRecap()}
function renderRecap(){
 const dates=recapPeriodDates(),allValues=dates.flatMap(d=>Object.values(record(d)));
 const done=allValues.filter(x=>x==="done"||x==="khatam").length,khatam=allValues.filter(x=>x==="khatam").length,no=allValues.filter(x=>x==="no").length;
 const possible=dates.length*WORSHIP.length,progress=possible?Math.round(done/possible*100):0,days=dates.filter(d=>Object.keys(record(d)).length).length;
 document.getElementById("rmProgress").textContent=progress+"%";document.getElementById("rmDone").textContent=done;document.getElementById("rmDays").textContent=days;document.getElementById("rmKhatam").textContent=khatam;document.getElementById("rmNo").textContent=no;
 let title,desc;
 if(recapMode==="daily"){const d=recapCursorDate;title=hijriString(d);desc=`${fmtGreg(d)} • ${fmtWeekday(d)}`}
 else if(recapMode==="weekly"){const start=startOfWeek(recapCursorDate),end=new Date(start);end.setDate(start.getDate()+6);const hs=getHijriParts(start),he=getHijriParts(end);title=`${hs.day}–${he.day} ${HIJRI_MONTHS[he.month-1]} ${he.year} H`;desc=`${fmtGreg(start)} – ${fmtGreg(end)}`}
 else{const h=recapCursorHijri;title=`${HIJRI_MONTHS[h.month-1]} ${h.year} H`;desc=`Periode ${monthLength(h.year,h.month)} hari • ${fmtGreg(findHijriMonthStart(h.year,h.month))}`}
 document.getElementById("recapMonth").textContent=title;document.getElementById("recapDesc").textContent=desc;
 document.getElementById("recapList").innerHTML=WORSHIP.map(([id,name])=>{
  let d=0,n=0,k=0;dates.forEach(date=>{const v=record(date)[id];if(v){n++;if(v==="done")d++;if(v==="khatam"){d++;k++}}});
  const pct=dates.length?Math.round(d/dates.length*100):0;
  return `<div class="recap-row"><div class="recap-top"><div><b>${name}</b><div class="recap-meta">${d} terlaksana • ${k} khatam • ${n} hari tercatat</div></div><b>${pct}%</b></div><div class="bar"><i style="width:${Math.min(100,pct)}%"></i></div></div>`
 }).join("");
 const scores=WORSHIP.map(([id,name])=>{let d=0;dates.forEach(date=>{const v=record(date)[id];if(v==="done"||v==="khatam")d++});return {name,pct:dates.length?Math.round(d/dates.length*100):0}}).sort((a,b)=>b.pct-a.pct);
 const active=dates.filter(d=>Object.keys(record(d)).length).length;
 let insight="Belum ada cukup data untuk membuat insight.";
 if(active){const best=scores[0],weak=scores[scores.length-1];insight=`Kamu mencatat ${active} hari pada periode ini. Paling konsisten: ${best.name} (${best.pct}%). Yang masih bisa dikuatkan: ${weak.name} (${weak.pct}%). Pelan-pelan, yang penting konsisten. 🌱`}
 document.getElementById("recapInsight").textContent=insight;
}
function saveProfile(){
 const name=document.getElementById("nameInput").value.trim()||"Pengguna",email=document.getElementById("emailInput").value.trim();
 const whatsapp=normalizeWhatsappNumber(document.getElementById("whatsappInput")?.value||profile.whatsapp||DEFAULT_WHATSAPP);
 profile={...profile,name,email,whatsapp};syncActiveAccount();updateProfile();toast("Profil berhasil disimpan ✓")
}
let cropState={
 img:null,zoom:1,x:0,y:0,base:1,drag:false,lastX:0,lastY:0,
 mode:"crop",pointers:new Map(),pinchStartDist:0,pinchStartZoom:1
};
function setPhotoError(msg=""){const el=document.getElementById("photoError");if(!el)return;el.textContent=msg;el.style.display=msg?"block":"none"}
const PHOTO_DB="aih_profile_photos_v1";
const PHOTO_FALLBACK_PREFIX="aih_profile_photo_fallback_v29_";
let photoDbPromise=null;
function photoFallbackKey(accountId){return PHOTO_FALLBACK_PREFIX+accountId}
function savePhotoFallback(accountId,dataUrl){
 try{
  localStorage.setItem(photoFallbackKey(accountId),dataUrl);
  return true;
 }catch(e){
  console.warn("Fallback foto tidak bisa disimpan di localStorage",e);
  return false;
 }
}
function loadPhotoFallback(accountId){
 try{return localStorage.getItem(photoFallbackKey(accountId))||""}catch(e){return ""}
}
function deletePhotoFallback(accountId){
 try{localStorage.removeItem(photoFallbackKey(accountId))}catch(e){}
}
function openPhotoDb(){
 if(photoDbPromise)return photoDbPromise;
 photoDbPromise=new Promise((resolve,reject)=>{
  try{
   if(!window.indexedDB)return reject(new Error("IndexedDB tidak tersedia"));
   const req=indexedDB.open(PHOTO_DB,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("photos"))req.result.createObjectStore("photos")};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error("Gagal membuka penyimpanan foto"));
  }catch(e){reject(e)}
 });
 return photoDbPromise;
}
function savePhotoBlob(accountId,blob){
 return openPhotoDb().then(db=>new Promise((resolve,reject)=>{
  try{
   const tx=db.transaction("photos","readwrite");
   tx.objectStore("photos").put(blob,accountId);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>reject(tx.error||new Error("Gagal menyimpan foto"));
   tx.onabort=()=>reject(tx.error||new Error("Penyimpanan foto dibatalkan"));
  }catch(e){reject(e)}
 }));
}
function loadPhotoBlob(accountId){
 return openPhotoDb().then(db=>new Promise((resolve,reject)=>{
  try{
   const tx=db.transaction("photos","readonly"),req=tx.objectStore("photos").get(accountId);
   req.onsuccess=()=>resolve(req.result||null);
   req.onerror=()=>reject(req.error||new Error("Gagal membaca foto"));
  }catch(e){reject(e)}
 }));
}
function deletePhotoBlob(accountId){
 return openPhotoDb().then(db=>new Promise((resolve,reject)=>{
  try{
   const tx=db.transaction("photos","readwrite");
   tx.objectStore("photos").delete(accountId);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>reject(tx.error||new Error("Gagal menghapus foto"));
  }catch(e){reject(e)}
 }));
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{
 const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error("Gagal membaca foto"));r.readAsDataURL(blob)
})}
function dataUrlToBlob(dataUrl){
 const parts=String(dataUrl).split(","),m=parts[0].match(/data:([^;]+);base64/);
 if(!m)throw new Error("Format foto lama tidak valid");
 const bin=atob(parts[1]),arr=new Uint8Array(bin.length);
 for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
 return new Blob([arr],{type:m[1]})
}
async function hydrateProfilePhoto(){
 const ref=profile.photoRef||activeAccountId;
 try{
  let blob=null;
  let dataUrl=profile.photoFallback||"";

  // Migrasi foto lama yang masih berupa data URL.
  if(profile.photo&&profile.photo.startsWith("data:")){
   dataUrl=profile.photo;
   savePhotoFallback(activeAccountId,dataUrl);
   try{await savePhotoBlob(activeAccountId,dataUrlToBlob(dataUrl))}catch(e){}
  }

  // IndexedDB adalah penyimpanan utama jika tersedia.
  try{blob=await loadPhotoBlob(ref)}catch(e){blob=null}

  if(blob){
   dataUrl=await blobToDataUrl(blob);
   savePhotoFallback(activeAccountId,dataUrl);
  }else if(!dataUrl){
   dataUrl=loadPhotoFallback(activeAccountId);
  }

  if(dataUrl){
   profile={...profile,photo:dataUrl,photoRef:activeAccountId,photoFallback:dataUrl};
   syncActiveAccount();
   updateProfile();
  }
 }catch(e){
  console.warn("Foto profil belum dapat dipulihkan",e);
  const fallback=loadPhotoFallback(activeAccountId);
  if(fallback){profile={...profile,photo:fallback,photoRef:activeAccountId,photoFallback:fallback};updateProfile()}
 }
}
async function handleProfilePhoto(file){
 setPhotoError("");
 if(!file)return;
 if(!file.type.startsWith("image/")){setPhotoError("File harus berupa gambar JPG, PNG, WebP, atau format gambar yang didukung HP.");return}
 if(file.size>20*1024*1024){setPhotoError("Foto terlalu besar. Pilih foto di bawah 20 MB.");return}
 const input=document.getElementById("photoInput");if(input)input.value="";
 const saving=document.getElementById("photoSaving");if(saving)saving.classList.remove("show");
 const reader=new FileReader();
 reader.onerror=()=>setPhotoError("Foto tidak dapat dibaca. Coba pilih foto lain atau izinkan akses foto pada browser.");
 reader.onload=()=>{
  const img=new Image();
  img.onload=()=>{
   const size=640,base=Math.max(size/img.width,size/img.height);
   cropState={img,zoom:1,x:size/2,y:size/2,base,drag:false,lastX:0,lastY:0,mode:"crop",pointers:new Map(),pinchStartDist:0,pinchStartZoom:1};
   const range=document.getElementById("cropZoom");if(range)range.value="1";
   setCropMode("crop",true);document.getElementById("cropModal").classList.add("show");bindCropCanvas();drawCropPreview()
  };
  img.onerror=()=>setPhotoError("Foto dapat dipilih, tetapi browser gagal memproses gambar ini. Coba JPG/PNG/WebP lain.");
  img.src=reader.result
 };
 reader.readAsDataURL(file);
}
function setCropMode(mode,silent=false){
 cropState.mode=mode==="full"?"full":"crop";
 const cropBtn=document.getElementById("cropModeCrop"),fullBtn=document.getElementById("cropModeFull");
 if(cropBtn)cropBtn.classList.toggle("active",cropState.mode==="crop");
 if(fullBtn)fullBtn.classList.toggle("active",cropState.mode==="full");
 const range=document.getElementById("cropZoom");
 if(range){
  range.min=cropState.mode==="full"?"0.65":"1";range.max="4";
  if(cropState.mode==="full"&&cropState.zoom<0.65)cropState.zoom=.65;
  if(cropState.mode==="crop"&&cropState.zoom<1)cropState.zoom=1;
  range.value=String(cropState.zoom)
 }
 clampCrop();drawCropPreview();
 if(!silent)toast(cropState.mode==="full"?"Foto penuh dipilih":"Mode potong dipilih")
}
function bindCropCanvas(){
 const c=document.getElementById("cropCanvas");if(!c||c.dataset.bound==="1")return;
 c.dataset.bound="1";
 c.style.touchAction="none";
 const point=e=>({x:e.clientX,y:e.clientY});
 c.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"&&e.button!==0)return;
  cropState.pointers.set(e.pointerId,point(e));
  if(cropState.pointers.size===2){
   const pts=[...cropState.pointers.values()],dx=pts[0].x-pts[1].x,dy=pts[0].y-pts[1].y;
   cropState.pinchStartDist=Math.hypot(dx,dy)||1;cropState.pinchStartZoom=cropState.zoom;cropState.drag=false
  }else{cropState.drag=true;cropState.lastX=e.clientX;cropState.lastY=e.clientY}
  try{c.setPointerCapture(e.pointerId)}catch(_){}
 });
 c.addEventListener("pointermove",e=>{
  if(!cropState.pointers.has(e.pointerId))return;
  cropState.pointers.set(e.pointerId,point(e));
  if(cropState.pointers.size>=2){
   const pts=[...cropState.pointers.values()],dx=pts[0].x-pts[1].x,dy=pts[0].y-pts[1].y,dist=Math.hypot(dx,dy)||1;
   const factor=dist/cropState.pinchStartDist;
   const next=Math.min(4,Math.max(cropState.mode==="full"?.65:1,cropState.pinchStartZoom*factor));
   cropState.zoom=next;const range=document.getElementById("cropZoom");if(range)range.value=String(next);
   clampCrop();drawCropPreview();e.preventDefault();return
  }
  if(!cropState.drag)return;
  const rect=c.getBoundingClientRect(),sx=c.width/rect.width,sy=c.height/rect.height;
  cropState.x+=(e.clientX-cropState.lastX)*sx;cropState.y+=(e.clientY-cropState.lastY)*sy;
  cropState.lastX=e.clientX;cropState.lastY=e.clientY;clampCrop();drawCropPreview();e.preventDefault()
 });
 const stop=e=>{
  cropState.pointers.delete(e.pointerId);
  if(cropState.pointers.size===0)cropState.drag=false;
  else if(cropState.pointers.size===1){const p=[...cropState.pointers.values()][0];cropState.drag=true;cropState.lastX=p.x;cropState.lastY=p.y}
 };
 c.addEventListener("pointerup",stop);c.addEventListener("pointercancel",stop);c.addEventListener("lostpointercapture",e=>cropState.pointers.delete(e.pointerId));
}
function cropScale(){return cropState.base*cropState.zoom}
function clampCrop(){
 const c=640,s=cropScale(),iw=cropState.img?cropState.img.width*s:0,ih=cropState.img?cropState.img.height*s:0;
 if(cropState.mode==="full"){cropState.x=c/2;cropState.y=c/2;return}
 const minX=c-iw/2,maxX=iw/2,minY=c-ih/2,maxY=ih/2;
 cropState.x=Math.min(maxX,Math.max(minX,cropState.x));cropState.y=Math.min(maxY,Math.max(minY,cropState.y))
}
function drawCoverImage(ctx,img,x,y,w,h){ctx.drawImage(img,x-w/2,y-h/2,w,h)}
function drawCropPreview(){
 const c=document.getElementById("cropCanvas"),ctx=c&&c.getContext("2d");if(!ctx||!cropState.img)return;
 ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="#e9f2ef";ctx.fillRect(0,0,c.width,c.height);
 const s=cropScale(),w=cropState.img.width*s,h=cropState.img.height*s;
 ctx.save();ctx.beginPath();ctx.arc(c.width/2,c.height/2,c.width/2,0,Math.PI*2);ctx.clip();
 if(cropState.mode==="full"){
  ctx.save();ctx.filter="blur(18px)";ctx.globalAlpha=.48;
  const coverS=Math.max(c/cropState.img.width,c/cropState.img.height),cw=cropState.img.width*coverS,ch=cropState.img.height*coverS;
  drawCoverImage(ctx,cropState.img,c/2,c/2,cw,ch);ctx.restore();
  const containS=Math.min(c/cropState.img.width,c/cropState.img.height)*cropState.zoom,fw=cropState.img.width*containS,fh=cropState.img.height*containS;
  ctx.drawImage(cropState.img,c/2-fw/2,c/2-fh/2,fw,fh)
 }else drawCoverImage(ctx,cropState.img,cropState.x,cropState.y,w,h);
 ctx.restore();ctx.strokeStyle="rgba(11,107,99,.35)";ctx.lineWidth=5;ctx.beginPath();ctx.arc(c.width/2,c.height/2,c.width/2-3,0,Math.PI*2);ctx.stroke()
}
function setCropZoom(value){
 cropState.zoom=Number(value)||1;const min=cropState.mode==="full"?.65:1;
 cropState.zoom=Math.min(4,Math.max(min,cropState.zoom));clampCrop();drawCropPreview()
}
function adjustCropZoom(delta){
 const range=document.getElementById("cropZoom");if(!range)return;
 const min=cropState.mode==="full"?.65:1,next=Math.min(4,Math.max(min,Number(range.value)+delta));
 range.value=next;setCropZoom(next)
}
function closeCropModal(){
 document.getElementById("cropModal").classList.remove("show");
 cropState={img:null,zoom:1,x:0,y:0,base:1,drag:false,lastX:0,lastY:0,mode:"crop",pointers:new Map(),pinchStartDist:0,pinchStartZoom:1}
}
function canvasToBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Gagal membuat file foto")),"image/jpeg",.78))}
function compressProfileCanvas(canvas){const out=document.createElement("canvas");out.width=360;out.height=360;const ctx=out.getContext("2d");if(!ctx)throw new Error("Canvas output tidak tersedia");ctx.drawImage(canvas,0,0,360,360);return out}
async function applyCropPhoto(){
 if(!cropState.img){setPhotoError("Belum ada foto yang siap digunakan.");return}
 const saving=document.getElementById("photoSaving");if(saving)saving.classList.add("show");setPhotoError("");
 try{
  const size=640,canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas tidak tersedia");
  ctx.save();ctx.beginPath();ctx.arc(size/2,size/2,size/2,0,Math.PI*2);ctx.clip();
  if(cropState.mode==="full"){
   ctx.save();ctx.filter="blur(18px)";ctx.globalAlpha=.48;
   const coverS=Math.max(size/cropState.img.width,size/cropState.img.height),cw=cropState.img.width*coverS,ch=cropState.img.height*coverS;
   ctx.drawImage(cropState.img,size/2-cw/2,size/2-ch/2,cw,ch);ctx.restore();
   const containS=Math.min(size/cropState.img.width,size/cropState.img.height)*cropState.zoom,fw=cropState.img.width*containS,fh=cropState.img.height*containS;
   ctx.drawImage(cropState.img,size/2-fw/2,size/2-fh/2,fw,fh)
  }else{
   const sc=cropScale(),w=cropState.img.width*sc,h=cropState.img.height*sc;
   ctx.drawImage(cropState.img,cropState.x-w/2,cropState.y-h/2,w,h)
  }
  ctx.restore();
  const out=compressProfileCanvas(canvas),blob=await canvasToBlob(out),dataUrl=await blobToDataUrl(blob);
  // IMPORTANT: persist a portable fallback before touching IndexedDB.
  const fallbackSaved=savePhotoFallback(activeAccountId,dataUrl);
  let indexedSaved=false;
  try{await savePhotoBlob(activeAccountId,blob);indexedSaved=true}catch(e){console.warn("IndexedDB foto tidak tersedia, pakai fallback lokal",e)}
  if(!fallbackSaved&&!indexedSaved)throw new Error("Tidak ada media penyimpanan foto yang tersedia");
  profile={...profile,photoRef:activeAccountId,photo:dataUrl,photoFallback:dataUrl};
  const saved=syncActiveAccount();
  if(!saved)throw new Error("Profil gagal disimpan");
  updateProfile();closeCropModal();if(saving)saving.classList.remove("show");
  toast(indexedSaved?"Foto profil berhasil dipasang ✓":"Foto profil berhasil dipasang di perangkat ✓");
 }catch(err){
  console.error(err);if(saving)saving.classList.remove("show");
  setPhotoError("Foto sudah berhasil diproses, tetapi gagal disimpan. Coba tekan Gunakan Foto sekali lagi.");
  toast("Foto belum berhasil dipasang")
 }
}
async function removeProfilePhoto(){
 if(!profile.photo&&!profile.photoRef&&!profile.photoFallback){toast("Belum ada foto profil");return}
 try{await deletePhotoBlob(activeAccountId)}catch(e){}
 deletePhotoFallback(activeAccountId);
 profile={...profile,photo:"",photoRef:"",photoFallback:""};
 syncActiveAccount();updateProfile();toast("Foto profil dihapus ✓")
}

function getFirebaseAuth(){
  try{
    if(!window.__klFirebaseApp || !window.firebase?.auth) return null;
    if(!window.__klFirebaseAuth) window.__klFirebaseAuth=firebase.auth(window.__klFirebaseApp);
    return window.__klFirebaseAuth;
  }catch(err){
    console.error("Firebase Auth init gagal",err);
    return null;
  }
}
function updateCloudAuthUI(user){
  /* v9: fungsi ini sebelumnya menyasar id "googleLoginBtn"/"cloudAuthNotice"
     yang tidak pernah ada di markup manapun (peninggalan desain lama sebelum
     popover akun saat ini dibuat) — sehingga status setelah login Google
     tidak pernah terlihat. Disambungkan ke elemen popover akun yang benar-
     benar dipakai saat ini. */
  const status=document.getElementById("profileAccountStatus");
  const popStatus=document.getElementById("popoverProfileStatus");
  const btn=document.getElementById("popoverGoogleLoginBtn");
  if(user){
    const label=`Jurnal ibadah pribadi • Google terhubung • ${user.email||"akun Google"}`;
    if(status)status.textContent=label;
    if(popStatus)popStatus.textContent="Google terhubung";
    if(btn){btn.querySelector("span:last-child")&&(btn.querySelector("span:last-child").textContent="Google terhubung");btn.disabled=true;btn.classList.add("connected");}
  }else{
    if(status)status.textContent="Jurnal ibadah pribadi • Akun lokal";
    if(popStatus)popStatus.textContent="Jurnal ibadah pribadi";
    if(btn){btn.querySelector("span:last-child")&&(btn.querySelector("span:last-child").textContent="Masuk dengan Google");btn.disabled=false;btn.classList.remove("connected");}
  }
  const switchButton=document.querySelector('[onclick^="switchGoogleAccount"]');
  if(switchButton)switchButton.disabled=!user;
  const signOutButton=document.getElementById("signOutGoogleBtn");
  if(signOutButton)signOutButton.disabled=false;
}
async function syncCloudProfile(user){
  // Profil aplikasi tetap mengikuti akun lokal yang sudah ada.
  // Firebase Authentication menjadi sumber identitas Google; tidak ada
  // service-account/private key yang disimpan di browser.
  return user||null;
}
async function adoptGoogleSession(user){
  if(!user)return;
  const googleId=`google-${user.uid}`;
  const currentLocal=accounts[activeAccountId];
  if(!accounts[googleId]){
    accounts[googleId]={
      id:googleId,
      profile:{
        name:user.displayName||currentLocal?.profile?.name||"Pengguna",
        email:user.email||currentLocal?.profile?.email||"",
        photo:user.photoURL||currentLocal?.profile?.photo||"",
        whatsapp:currentLocal?.profile?.whatsapp||DEFAULT_WHATSAPP
      },
      data:currentLocal?.data||{},
      timeData:currentLocal?.timeData||{},
      activityShared:!!currentLocal?.activityShared,
      agenda:currentLocal?.agenda,
      statusMeta:currentLocal?.statusMeta
    };
  }else{
    accounts[googleId].profile={
      ...(accounts[googleId].profile||{}),
      name:user.displayName||accounts[googleId].profile?.name||"Pengguna",
      email:user.email||accounts[googleId].profile?.email||"",
      photo:user.photoURL||accounts[googleId].profile?.photo||"",
      whatsapp:accounts[googleId].profile?.whatsapp||DEFAULT_WHATSAPP
    };
  }
  activeAccountId=googleId;
  data=accounts[activeAccountId].data||{};
  timeData=accounts[activeAccountId].timeData||{};
  profile=accounts[activeAccountId].profile||{name:"Pengguna",email:"",whatsapp:DEFAULT_WHATSAPP,photo:""};
  if(!profile.whatsapp)profile.whatsapp=DEFAULT_WHATSAPP;
  activityShared=!!accounts[activeAccountId].activityShared;
  persistAccounts();
  updateProfile();
  renderDashboard();renderAbsensi();renderCalendar();renderRecap();renderLocationUI();
  updateCloudAuthUI(user);
}
async function signInWithGoogle(){
  const auth=getFirebaseAuth();
  if(!auth){
    toast("Firebase Authentication belum siap. Periksa konfigurasi Firebase.");
    return;
  }
  try{
    try{
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }catch(err){
      console.warn("Firebase persistence tidak tersedia:",err);
    }
    const provider=new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    // Popup lebih stabil untuk aplikasi web/PWA karena tidak kehilangan
    // konteks halaman. Jika popup diblokir, fallback ke redirect.
    await auth.signInWithPopup(provider);
  }catch(err){
    console.error("Firebase Google Login:",err);
    const code=String(err?.code||"");
    if(code==="auth/popup-blocked" || code==="auth/cancelled-popup-request"){
      try{
        const provider=new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({prompt:"select_account"});
        await auth.signInWithRedirect(provider);
        return;
      }catch(redirectErr){
        console.error("Firebase Google Redirect:",redirectErr);
        toast("Login Google gagal: "+(redirectErr?.message||"redirect tidak tersedia"));
        return;
      }
    }
    if(code==="auth/unauthorized-domain"){
      toast("Domain Vercel belum diizinkan di Firebase Authentication.");
      return;
    }
    if(code==="auth/operation-not-allowed"){
      toast("Google Sign-In belum diaktifkan di Firebase Authentication.");
      return;
    }
    toast("Login Google gagal: "+(err?.message||"coba lagi"));
  }
}
async function signOutGoogle(){
  const auth=getFirebaseAuth();
  if(!auth){toast("Firebase Authentication belum siap.");return}
  if(!auth.currentUser){
    closeAccountPopover();
    restoreLocalAccountAfterLogout();
    updateCloudAuthUI(null);
    toast("Tidak ada akun Google yang sedang masuk.");
    return;
  }
  try{
    await auth.signOut();
    closeAccountPopover();
    toast("Berhasil keluar dari akun Google");
  }catch(error){
    console.error("Firebase Logout:",error);
    toast("Gagal keluar dari akun Google");
  }
}
async function initGoogleAuth(){
  const auth=getFirebaseAuth();
  if(!auth){
    updateCloudAuthUI(null);
    return;
  }
  try{
    // Simpan sesi Google di perangkat agar pengguna tidak langsung
    // dianggap keluar ketika halaman/PWA dimuat ulang.
    try{
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }catch(err){
      console.warn("Firebase persistence tidak tersedia:",err);
    }

    try{ auth.useDeviceLanguage(); }catch(err){}

    // Menangani hasil login redirect jika fallback redirect dipakai.
    try{ await auth.getRedirectResult(); }catch(err){
      console.warn("Firebase redirect result:",err);
      const code=String(err?.code||"");
      if(code==="auth/unauthorized-domain"){
        toast("Domain Vercel belum diizinkan di Firebase Authentication.");
      }else if(code==="auth/operation-not-allowed"){
        toast("Google Sign-In belum diaktifkan di Firebase Authentication.");
      }
    }

    auth.onAuthStateChanged((user)=>{
      if(user){
        setTimeout(()=>adoptGoogleSession(user).then(()=>loadCloudProfile(user)).then(()=>subscribeAbsensiDate(selectedDate)).then(()=>window.autoConnectFirebaseNotifications?.(user)).catch(err=>console.warn("Sinkronisasi akun:",err)),0);
      }else{
        if(firestoreAbsensiUnsubscribe){firestoreAbsensiUnsubscribe();firestoreAbsensiUnsubscribe=null}
        firestoreAbsensiDateKey="";
        restoreLocalAccountAfterLogout();
        updateCloudAuthUI(null);
      }
    });
  }catch(err){
    console.warn("Firebase Auth init gagal",err);
    updateCloudAuthUI(null);
  }
}
function showGoogleInfo(){
  return signInWithGoogle();
}

function openAccountManager(){renderAccountList();document.getElementById("accountModal").classList.add("show")}
function closeAccountManager(){document.getElementById("accountModal").classList.remove("show")}
function renderAccountList(){
 const el=document.getElementById("accountList");el.innerHTML=Object.values(accounts).map(a=>`<button class="account-item ${a.id===activeAccountId?"active":""}" onclick="switchAccount('${a.id}')"><span class="mini-photo">${a.profile?.photo?`<img src="${a.profile.photo}" alt="">`:initials(a.profile?.name)}</span><span><b>${a.profile?.name||"Pengguna"}</b><small>${a.profile?.email||"Akun lokal"}</small></span>${a.id===activeAccountId?'<span class="account-check">✓</span>':''}</button>`).join("");
}
function switchAccount(id){
 if(!accounts[id]||id===activeAccountId){closeAccountManager();return}
 if(dirty){closeAccountManager();openModal("Ganti akun?","Perubahan absensi yang belum disimpan akan dibatalkan jika kamu berpindah akun.","Ganti akun",()=>switchAccount(id));return}
 syncActiveAccount();activeAccountId=id;data=accounts[id].data||{};timeData=accounts[id].timeData||{};loadStatusMetaForAccount(id);WORSHIP=loadAgendaForAccount(id);profile=accounts[id].profile||{name:"Pengguna",email:"",whatsapp:DEFAULT_WHATSAPP,photo:""};if(!profile.whatsapp)profile.whatsapp=DEFAULT_WHATSAPP;activityShared=!!accounts[id].activityShared;localStorage.setItem(ACTIVE_ACCOUNT_KEY,id);selectedDate=today();hijriCursor=getHijriParts(selectedDate);draftRecord={...record(selectedDate)};recapCursorDate=today();recapCursorHijri=getHijriParts(recapCursorDate);updateProfile();hydrateProfilePhoto();renderDashboard();renderAbsensi();renderCalendar();renderRecap();renderAccountList();closeAccountManager();toast(`Beralih ke ${profile.name||"akun"} ✓`);
}
function createAccount(){
 const name=prompt("Nama akun baru:","Pengguna baru");if(name===null)return;const clean=name.trim()||"Pengguna baru";const email=prompt("Email (opsional):","")??"";const id=makeAccountId();accounts[id]={id,profile:{name:clean,email:email.trim(),whatsapp:DEFAULT_WHATSAPP,photo:""},data:{},timeData:{},agenda:cloneAgenda(DEFAULT_WORSHIP),activityShared:false,statusMeta:cloneStatusMeta(DEFAULT_STATUS_META)};persistAccounts();switchAccount(id);
}
function toggleActivity(){activityShared=!activityShared;syncActiveAccount();updateProfile();toast(activityShared?"Aktivitas berbagi diaktifkan":"Aktivitas disembunyikan")}

const LOCATION_KEY="aih_location_v1";
const KAABA={lat:21.422487,lon:39.826206};
function getSavedLocation(){try{return JSON.parse(localStorage.getItem(LOCATION_KEY)||"null")}catch(e){return null}}
function saveLocation(v){try{localStorage.setItem(LOCATION_KEY,JSON.stringify(v))}catch(e){}}
function clearSavedLocation(){try{localStorage.removeItem(LOCATION_KEY)}catch(e){};renderLocationUI();loadPrayerTimes(true);toast("Lokasi direset ✓")}
function degToRad(v){return v*Math.PI/180}
function radToDeg(v){return v*180/Math.PI}
function bearingToKaaba(lat,lon){const p1=degToRad(lat),p2=degToRad(KAABA.lat),dl=degToRad(KAABA.lon-lon);return (radToDeg(Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl)))+360)%360}
function distanceKm(lat1,lon1,lat2,lon2){const R=6371,dLat=degToRad(lat2-lat1),dLon=degToRad(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(degToRad(lat1))*Math.cos(degToRad(lat2))*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
function compassDirection(deg){return ["Utara","Timur Laut","Timur","Tenggara","Selatan","Barat Daya","Barat","Barat Laut"][Math.round(deg/45)%8]}
function validLatLon(lat,lon){return Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=-90&&lat<=90&&lon>=-180&&lon<=180}
function pairFromText(text){
 const raw=decodeURIComponent(String(text||"").replace(/\+/g," "));
 const patterns=[
   /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/i,
   /@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
   /(?:[?&](?:q|query|ll|center|destination|origin)=)(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/i,
   /(?:^|[\s,(])(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)(?:$|[\s,)])/,
 ];
 for(const re of patterns){const m=raw.match(re);if(m){const lat=Number(m[1]),lon=Number(m[2]);if(validLatLon(lat,lon))return {lat,lon}}}
 return null;
}
function parseGoogleMapsLocation(input){
 const raw=String(input||"").trim();
 if(!raw)return null;
 const direct=pairFromText(raw);if(direct)return direct;
 try{const u=new URL(raw);const joined=[u.pathname,u.search,u.hash,u.href].join(" ");const found=pairFromText(joined);if(found)return found}catch(e){}
 return null;
}
function escapeHtml(value){
 return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function isShortGoogleMapsLink(input){
 try{const u=new URL(String(input||"").trim());return /(^|\.)maps\.app\.goo\.gl$/i.test(u.hostname)}catch(e){return /maps\.app\.goo\.gl/i.test(String(input||""))}
}

/* Modal focus/gesture lock: saat sebuah room/modal terbuka, seluruh gesture
   diarahkan ke room tersebut. Background, bottom-nav, dan halaman di belakang
   tidak ikut menerima tap/scroll. */
let activeModalLock=null;
let modalPreviousOverflow="";
let modalPreviousPaddingRight="";
let modalPreviousPosition="";
let modalPreviousTop="";
let modalPreviousWidth="";
let modalPreviousScrollY=0;

function lockModalInteraction(modal){
  if(!modal)return;
  activeModalLock=modal;
  modal.setAttribute("aria-modal","true");
  modal.dataset.modalLocked="1";
  modalPreviousOverflow=document.body.style.overflow||"";
  modalPreviousPaddingRight=document.body.style.paddingRight||"";
  modalPreviousPosition=document.body.style.position||"";
  modalPreviousTop=document.body.style.top||"";
  modalPreviousWidth=document.body.style.width||"";
  modalPreviousScrollY=window.scrollY||0;
  document.body.style.overflow="hidden";
  document.body.style.paddingRight="";
  document.body.style.position="fixed";
  document.body.style.top=`-${modalPreviousScrollY}px`;
  document.body.style.width="100%";
  document.documentElement.classList.add("modal-open");
  // Pastikan focus benar-benar berada di dalam room.
  const focusable=modal.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
  setTimeout(()=>focusable?.focus({preventScroll:true}),60);
}

function unlockModalInteraction(modal){
  if(modal)delete modal.dataset.modalLocked;
  if(activeModalLock===modal){
    activeModalLock=null;
    document.body.style.overflow=modalPreviousOverflow;
    document.body.style.paddingRight=modalPreviousPaddingRight;
    document.body.style.position=modalPreviousPosition||"";
    document.body.style.top=modalPreviousTop||"";
    document.body.style.width=modalPreviousWidth||"";
    document.documentElement.classList.remove("modal-open");
    document.body.style.pointerEvents="";
    document.body.style.touchAction="";
    window.scrollTo({top:modalPreviousScrollY||0,behavior:"auto"});
  }
  // Defensive recovery for any stale lock after a modal is closed.
  if(!document.querySelector(".modal-backdrop.show")){
    activeModalLock=null;
    document.documentElement.classList.remove("modal-open");
    document.body.style.overflow="";
    document.body.style.paddingRight="";
    document.body.style.position="";
    document.body.style.top="";
    document.body.style.width="";
    document.body.style.pointerEvents="";
    document.body.style.touchAction="";
  }
}

function handleModalFocusAndGesture(e){
  const modal=activeModalLock;
  if(!modal || !modal.classList.contains("show"))return;
  // Jangan biarkan gesture/tap menembus backdrop ke halaman di belakang.
  if(!modal.contains(e.target)){
    e.preventDefault();
    e.stopPropagation();
  }
  if(e.type==="keydown" && e.key==="Tab"){
    const items=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el=>el.offsetParent!==null);
    if(!items.length)return;
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  }
}
document.addEventListener("touchstart",handleModalFocusAndGesture,{passive:false,capture:true});
document.addEventListener("touchmove",handleModalFocusAndGesture,{passive:false,capture:true});
document.addEventListener("wheel",handleModalFocusAndGesture,{passive:false,capture:true});
document.addEventListener("pointerdown",handleModalFocusAndGesture,{capture:true});
document.addEventListener("keydown",handleModalFocusAndGesture,{capture:true});
function openLocationPicker(){
 const modal=document.getElementById("locationModal");if(!modal)return;
 const loc=getSavedLocation();
 const url=document.getElementById("mapsUrlInput"),lat=document.getElementById("latInput"),lon=document.getElementById("lonInput"),label=document.getElementById("locationLabelInput");
 const chooser=document.getElementById("cityChooser"),more=document.querySelector("#locationModal .location-more"),advanced=document.querySelector("#locationModal .location-advanced");
 if(url)url.value="";if(lat)lat.value=loc?.lat??"";if(lon)lon.value=loc?.lon??"";if(label)label.value=loc?.label||"";
 if(chooser)chooser.hidden=true;
 if(more)more.open=false;
 if(advanced)advanced.open=false;
 setGpsModalStatus("");
 const preview=document.getElementById("locationPreview");if(preview){preview.classList.remove("show");preview.innerHTML=""}
 modal.classList.add("show");lockModalInteraction(modal);
}
function closeLocationPicker(){
 const modal=document.getElementById("locationModal");
 if(!modal)return;
 modal.classList.remove("show");
 unlockModalInteraction(modal);
}

document.getElementById("locationModal")?.addEventListener("click",function(e){
  if(e.target===this){
    e.preventDefault();
    e.stopPropagation();
  }
});
function previewMapsLocation(){
 const input=document.getElementById("mapsUrlInput"),preview=document.getElementById("locationPreview");if(!input||!preview)return;
 const value=input.value.trim(),c=parseGoogleMapsLocation(value);
 if(c){preview.classList.add("show");preview.innerHTML=`<b>✓ Titik ditemukan otomatis</b><br>${c.lat.toFixed(6)}, ${c.lon.toFixed(6)}<br><span style="color:var(--muted)">Titik ini akan dipakai untuk jadwal sholat & arah kiblat.</span>`;return}
 if(isShortGoogleMapsLink(value)){preview.classList.add("show");preview.innerHTML=`<b>🔗 Link Maps valid</b><br><span style="color:var(--muted)">Link pendek tidak membawa koordinat di URL. Demi akurasi, aplikasi tidak menebak titik.</span><br><a class="map-link" href="${escapeHtml(value)}" target="_blank" rel="noopener">🗺️ Buka di Google Maps</a><br><small style="color:var(--muted)">Paling cepat: pilih <b>🏙️ Kota</b> atau masukkan koordinat di Opsi lanjutan.</small>`;return}
 preview.classList.remove("show");preview.innerHTML="";
}
function setGpsModalStatus(message,type=""){
  const el=document.getElementById("locationGpsStatus");
  if(!el)return;
  el.hidden=!message;
  el.className="location-gps-status"+(type?" "+type:"");
  el.textContent=message;
}
function useCurrentLocationFromPicker(){
  // Tetap di dalam room lokasi saat permission GPS muncul.
  // Modal baru ditutup setelah koordinat benar-benar berhasil disimpan.
  useCurrentLocation();
}
function applySelectedLocation(){
 const city=String(document.getElementById("citySelect")?.value||"").trim();
 if(city&&CITY_COORDS[city.toLowerCase()]){
   const old=prayerSettings();
   savePrayerSettings({city,country:old.country||"Indonesia"});
   const c=CITY_COORDS[city.toLowerCase()];
   saveLocation({lat:c.lat,lon:c.lon,accuracy:5000,label:`${city} • pusat kota`,source:"city",timezone:CITY_TIMEZONES[city.toLowerCase()]||"Asia/Jakarta",at:Date.now()});
   renderLocationUI();closeLocationPicker();loadPrayerTimes(true);toast(`Lokasi ${city} dipakai ✓`);return;
 }
 const url=document.getElementById("mapsUrlInput")?.value.trim()||"";
 const latRaw=document.getElementById("latInput")?.value.trim()||"";
 const lonRaw=document.getElementById("lonInput")?.value.trim()||"";
 const label=(document.getElementById("locationLabelInput")?.value.trim()||"Lokasi terpilih").slice(0,60);
 let c=parseGoogleMapsLocation(url);
 if(!c&&latRaw&&lonRaw){const lat=Number(latRaw.replace(",",".")),lon=Number(lonRaw.replace(",","."));if(validLatLon(lat,lon))c={lat,lon}}
 if(!c){
   if(isShortGoogleMapsLink(url)){
     toast("Link singkat belum memuat koordinat. Pilih Lokasi HP atau masukkan koordinat.");
     const preview=document.getElementById("locationPreview");if(preview){preview.classList.add("show");preview.innerHTML=`<b>💡 Hampir selesai</b><br><span style="color:var(--muted)">Link-nya valid, tetapi titiknya tersembunyi di balik redirect Google. Aplikasi tidak menebak titik.</span>`}
   }else toast("Titik lokasi belum terbaca. Tempel link Maps yang memuat koordinat atau gunakan lokasi HP.");
   return;
 }
 const v={lat:c.lat,lon:c.lon,accuracy:url?10:10,label,source:url?"google-maps-link":"manual-coordinate",at:Date.now()};
 saveLocation(v);renderLocationUI();closeLocationPicker();loadPrayerTimes(true);toast("Lokasi terkunci ✓");
}
function renderLocationSecurity(){
  const el=document.getElementById("locationSecurity");if(!el)return;
  const secure=window.isSecureContext===true||["localhost","127.0.0.1"].includes(location.hostname);
  el.hidden=false;
  if(secure)el.innerHTML="<b>🔐 Mode lokasi siap.</b><br>Browser dapat meminta GPS dari halaman aman.";
  else el.innerHTML="<b>⚠️ Mode file/local.</b><br>Untuk GPS & sensor kompas, buka proyek melalui <b>Preview/Local Server</b> atau HTTPS. Lokasi manual dan jadwal berbasis kota tetap bisa dipakai.";
}
function renderLocationUI(){
 const loc=getSavedLocation(),status=document.getElementById("locationStatus"),badge=document.getElementById("qiblaLocationBadge"),degEl=document.getElementById("qiblaDegree"),dirEl=document.getElementById("qiblaDirection"),distEl=document.getElementById("qiblaDistance"),link=document.getElementById("qiblaMapLink");
 if(!loc){if(status)status.textContent="📍 Lokasi belum ditentukan. Pilih Lokasi HP, Kota, atau tempel link Google Maps.";if(badge)badge.textContent="Belum ada lokasi";if(degEl)degEl.textContent="—°";if(dirEl)dirEl.textContent="Tentukan lokasi untuk menghitung arah kiblat.";if(distEl)distEl.textContent="Jarak ke Ka'bah: —";if(link)link.hidden=true;return}
 const bearing=bearingToKaaba(loc.lat,loc.lon),dist=distanceKm(loc.lat,loc.lon,KAABA.lat,KAABA.lon);
 if(status)status.textContent=`📍 ${loc.label||"Lokasi terpilih"} • ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`;
 if(badge)badge.textContent=loc.label||"Lokasi terpilih";if(degEl)degEl.textContent=`${Math.round(bearing)}°`;if(dirEl)dirEl.textContent=`Arah kiblat ${compassDirection(bearing)}`;if(distEl)distEl.textContent=`Jarak ke Ka'bah: ${dist.toLocaleString("id-ID",{maximumFractionDigits:0})} km`;
 const needle=document.getElementById("qiblaNeedle");if(needle&&!qiblaCompassListening)needle.style.transform=`translate(-50%,-100%) rotate(${bearing}deg)`;
 if(link){link.hidden=false;link.href=buildQiblaMapsUrl(loc)}
}
function buildMapsSearchUrl(loc){
 return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.lat+","+loc.lon)}`;
}
function buildQiblaMapsUrl(loc){
 return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(loc.lat+","+loc.lon)}&destination=${KAABA.lat},${KAABA.lon}&travelmode=walking`;
}
function navigateToExternalUrl(url){
  if(!url)return false;
  // Same-tab navigation is intentional: Android Chrome/Google Maps can hand the URL
  // to the Maps app and this avoids SPA/router interception or popup blocking.
  try{ window.location.assign(url); return true; }catch(e){
    try{ window.location.href=url; return true; }catch(_){ return false; }
  }
}
function useCurrentLocation(){
  const status=document.getElementById("locationStatus"),security=document.getElementById("locationSecurity"),modal=document.getElementById("locationModal"),chooser=document.getElementById("cityChooser");
  const finishError=(msg,code)=>{
    if(status)status.textContent=msg;
    setGpsModalStatus(msg,"error");
    if(chooser)chooser.hidden=false;
    if(modal){modal.classList.add("show");lockModalInteraction(modal);}
    if(code===1)toast("Izin lokasi belum diberikan");
    else toast("Lokasi HP belum tersedia — pilih Kota sebagai cadangan");
  };
  if(!navigator.geolocation){
    finishError("📍 Browser ini tidak menyediakan GPS. Pilih Kota atau masukkan koordinat.",0);return;
  }
  const secure=window.isSecureContext===true||["localhost","127.0.0.1"].includes(location.hostname);
  if(security){
    security.hidden=false;
    security.innerHTML=secure?"<b>🔐 Koneksi aman terdeteksi.</b><br>Browser sedang meminta lokasi perangkat.":"<b>⚠️ Halaman belum berjalan aman.</b><br>Untuk GPS, buka situs melalui HTTPS/Preview. Pilih Kota jika browser memblokir lokasi.";
  }
  if(!secure){
    finishError("📍 GPS diblokir karena halaman tidak berjalan dalam koneksi aman. Pilih Kota atau buka situs melalui HTTPS.",0);return;
  }
  setGpsModalStatus("📍 Meminta izin lokasi perangkat…","ok");
  if(status)status.textContent="📍 Meminta izin lokasi perangkat…";
  try{
    if(navigator.permissions?.query){
      navigator.permissions.query({name:"geolocation"}).then(p=>{
        if(p.state==="denied"){
          finishError("Izin lokasi untuk situs ini sedang ditolak. Buka izin lokasi situs lalu tekan Gunakan lokasi HP lagi.",1);
        }
      }).catch(()=>{});
    }
  }catch(e){}
  let finished=false;
  const success=pos=>{
    if(finished)return;finished=true;
    const lat=Number(pos.coords.latitude),lon=Number(pos.coords.longitude);
    if(!validLatLon(lat,lon)){finishError("Koordinat GPS tidak valid. Coba lagi atau pilih Kota.",2);return}
    const accuracy=Math.round(pos.coords.accuracy||0);
    const v={lat,lon,accuracy,label:"Lokasi HP saat ini",source:"gps",timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Jakarta",at:Date.now()};
    saveLocation(v);
    renderLocationUI();
    loadPrayerTimes(true);
    setGpsModalStatus(`✓ Lokasi ditemukan${accuracy?` • akurasi ±${accuracy} m`:""}.`,"ok");
    if(modal)closeLocationPicker();
    toast("Lokasi HP berhasil digunakan ✓");
  };
  const fail=(err)=>{
    if(finished)return;
    if(err?.code===1){finished=true;finishError("Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini lalu coba lagi.",1);return}
    // Retry once with lower accuracy: some Android devices/browser builds fail
    // high-accuracy GPS while a coarse network position is already available.
    if(!window.__gpsFallbackTried){
      window.__gpsFallbackTried=true;
      setGpsModalStatus("📍 GPS presisi belum merespons. Mencoba lokasi jaringan…","ok");
      try{
        navigator.geolocation.getCurrentPosition(success,err2=>{
          if(finished)return;
          finished=true;
          const msg=err2?.code===2
            ?"Posisi belum ditemukan. Pastikan Layanan Lokasi/GPS HP aktif."
            :"GPS belum merespons. Coba lagi atau pilih Kota.";
          finishError("📍 "+msg,err2?.code||2);
        },{enableHighAccuracy:false,timeout:20000,maximumAge:300000});
        return;
      }catch(e){}
    }
    finished=true;
    const msg=err?.code===2?"Posisi belum ditemukan. Pastikan Layanan Lokasi/GPS HP aktif."
      :err?.code===3?"Permintaan lokasi terlalu lama. Pastikan GPS aktif dan coba lagi."
      :"Lokasi belum berhasil diperoleh. Coba lagi atau gunakan Kota.";
    finishError("📍 "+msg,err?.code||3);
  };
  window.__gpsFallbackTried=false;
  try{
    navigator.geolocation.getCurrentPosition(success,fail,{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
  }catch(e){finished=true;finishError("GPS tidak dapat dijalankan di browser ini. Pilih Kota sebagai cadangan.",0)}
}
function openCurrentLocationInMaps(){const loc=getSavedLocation();if(!loc){toast("Tentukan lokasi terlebih dahulu");return}navigateToExternalUrl(buildMapsSearchUrl(loc))}
function openQiblaInMaps(e){if(e){e.preventDefault();e.stopPropagation()}const loc=getSavedLocation();if(!loc){toast("Tentukan lokasi terlebih dahulu");return}navigateToExternalUrl(buildQiblaMapsUrl(loc))}

let qiblaCompassListening=false,qiblaCompassLastHeading=null,qiblaCompassTimer=null,qiblaCompassEvents=0;
function screenAngle(){return Number(window.screen?.orientation?.angle||window.orientation||0)||0}
function normalizeHeading(v){return (v%360+360)%360}
function shortestAngleDelta(target,current){return ((target-current+540)%360)-180}
function setCompassNeedle(rotation){
 const needle=document.getElementById("qiblaNeedle");if(!needle)return;
 const r=normalizeHeading(rotation);
 if(qiblaCompassLastHeading==null)qiblaCompassLastHeading=r;
 const delta=shortestAngleDelta(r,qiblaCompassLastHeading),next=normalizeHeading(qiblaCompassLastHeading+delta*.28);
 qiblaCompassLastHeading=next;needle.style.transform=`translate(-50%,-100%) rotate(${next}deg)`;
}
function compassHeadingFromEvent(e){
  if(typeof e.webkitCompassHeading==="number"&&isFinite(e.webkitCompassHeading))return normalizeHeading(e.webkitCompassHeading);
  if(e.type!=="deviceorientationabsolute" && e.absolute!==true)return null;
  if(typeof e.alpha!=="number"||!isFinite(e.alpha))return null;
  return normalizeHeading(360-e.alpha+screenAngle());
}
async function startQiblaCompass(){
  const loc=getSavedLocation();
  if(!loc){toast("Tentukan lokasi dulu — pilih Lokasi HP, Kota, atau Maps");return}
  const h=document.getElementById("qiblaCompassHelp");
  const secure=window.isSecureContext===true||["localhost","127.0.0.1"].includes(location.hostname);
  if(!secure){
    if(h)h.innerHTML="🧭 <b>Mode kompas live belum tersedia di mode file.</b> Derajat kiblat di atas tetap akurat dari lokasi. Untuk jarum yang mengikuti arah HP, buka aplikasi melalui Preview/Local Server atau HTTPS.";
    toast("Arah kiblat tetap tersedia; kompas live perlu halaman aman");return
  }
  if(!window.DeviceOrientationEvent){if(h)h.textContent="Sensor orientasi tidak tersedia di browser ini. Derajat kiblat tetap bisa dipakai.";toast("Sensor kompas tidak tersedia");return}
  try{
    if(typeof DeviceOrientationEvent.requestPermission==="function"){
      const p=await DeviceOrientationEvent.requestPermission();
      if(p!=="granted"){if(h)h.textContent="Izin sensor belum diberikan. Izinkan sensor lalu tekan Aktifkan kompas lagi.";toast("Izin sensor kompas belum diberikan");return}
    }
  }catch(e){if(h)h.textContent="Izin sensor gagal. Pastikan halaman dibuka lewat HTTPS dan izin sensor diberikan.";toast("Izin kompas tidak tersedia");return}
  if(qiblaCompassListening)return;
  qiblaCompassListening=true;qiblaCompassEvents=0;qiblaCompassLastHeading=null;
  const handler=e=>{const heading=compassHeadingFromEvent(e);if(heading==null)return;qiblaCompassEvents++;const bearing=bearingToKaaba(loc.lat,loc.lon);setCompassNeedle(bearing-heading)};
  window.__qiblaHandler=handler;
  window.addEventListener("deviceorientationabsolute",handler,true);
  window.addEventListener("deviceorientation",handler,true);
  if(h)h.textContent="🧭 Kompas aktif. Putar HP perlahan sampai penunjuk mengarah ke kiblat.";
  toast("Kompas aktif ✓");
  clearTimeout(qiblaCompassTimer);
  qiblaCompassTimer=setTimeout(()=>{
    if(qiblaCompassEvents===0){
      if(h)h.textContent="Sensor belum mengirim arah. Pastikan sensor/orientasi diizinkan dan HP mendukung kompas. Derajat kiblat tetap aktif.";
      toast("Sensor kompas belum mengirim data");
    }
  },2200);
}
function stopQiblaCompass(){
 if(!qiblaCompassListening)return;
 const h=window.__qiblaHandler;if(h){window.removeEventListener("deviceorientationabsolute",h,true);window.removeEventListener("deviceorientation",h,true)}
 qiblaCompassListening=false;window.__qiblaHandler=null;clearTimeout(qiblaCompassTimer);qiblaCompassLastHeading=null;renderLocationUI();
}
const PRAYER_KEY="aih_prayer_settings_v1";
const PRAYER_CACHE_KEY="aih_prayer_cache_v3";
const PRAYER_METHOD=20; // Kementerian Agama Republik Indonesia
const PRAYER_ORDER=[["Imsak","Imsak"],["Subuh","Fajr"],["Terbit","Sunrise"],["Dzuhur","Dhuhr"],["Ashar","Asr"],["Maghrib","Maghrib"],["Isya","Isha"]];
const CITY_TIMEZONES={"jakarta":"Asia/Jakarta","bandung":"Asia/Jakarta","sukabumi":"Asia/Jakarta","bogor":"Asia/Jakarta","depok":"Asia/Jakarta","bekasi":"Asia/Jakarta","tangerang":"Asia/Jakarta","cianjur":"Asia/Jakarta","cimahi":"Asia/Jakarta","tasikmalaya":"Asia/Jakarta","garut":"Asia/Jakarta","semarang":"Asia/Jakarta","yogyakarta":"Asia/Jakarta","surabaya":"Asia/Jakarta","malang":"Asia/Jakarta","medan":"Asia/Jakarta","palembang":"Asia/Jakarta","makassar":"Asia/Makassar"};
function timezoneParts(date,tz){
 try{
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date);
  const o={};for(const p of parts)if(p.type!=="literal")o[p.type]=p.value;
  return {year:Number(o.year),month:Number(o.month),day:Number(o.day),hour:Number(o.hour),minute:Number(o.minute),second:Number(o.second)};
 }catch(e){const d=new Date(date);return {year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),hour:d.getHours(),minute:d.getMinutes(),second:d.getSeconds()}}
}
function timezoneNow(tz){const p=timezoneParts(new Date(),tz);return new Date(p.year,p.month-1,p.day,p.hour,p.minute,p.second,0)}
function timezoneDate(tz){const p=timezoneParts(new Date(),tz);return new Date(p.year,p.month-1,p.day,12,0,0,0)}
function timezoneLabel(tz){return tz||Intl.DateTimeFormat().resolvedOptions().timeZone||"Perangkat"}
function prayerSettings(){try{const v=JSON.parse(localStorage.getItem(PRAYER_KEY)||'null');return v&&v.city?{city:String(v.city),country:String(v.country||"Indonesia")}:{city:"Jakarta",country:"Indonesia"}}catch(e){return {city:"Jakarta",country:"Indonesia"}}}
function savePrayerSettings(v){try{localStorage.setItem(PRAYER_KEY,JSON.stringify(v))}catch(e){}}
const CITY_COORDS={"jakarta":{"lat":-6.2088,"lon":106.8456},"bandung":{"lat":-6.9175,"lon":107.6191},"surabaya":{"lat":-7.2575,"lon":112.7521},"yogyakarta":{"lat":-7.7956,"lon":110.3695},"semarang":{"lat":-6.9667,"lon":110.4167},"medan":{"lat":3.5952,"lon":98.6722},"makassar":{"lat":-5.1477,"lon":119.4327},"palembang":{"lat":-2.9761,"lon":104.7754},"malang":{"lat":-7.9666,"lon":112.6326},"depok":{"lat":-6.4025,"lon":106.7942},"tangerang":{"lat":-6.1783,"lon":106.6319},"bekasi":{"lat":-6.2383,"lon":106.9756},"bogor":{"lat":-6.5971,"lon":106.8060},"sukabumi":{"lat":-6.9277,"lon":106.9292},"cianjur":{"lat":-6.8208,"lon":107.1391},"tasikmalaya":{"lat":-7.3274,"lon":108.2207},"garut":{"lat":-7.2167,"lon":107.9000},"cimahi":{"lat":-6.8722,"lon":107.5425}};
function showCityChooser(){
 const modal=document.getElementById("locationModal");
 const chooser=document.getElementById("cityChooser");
 if(modal)modal.classList.add("show");
 if(chooser)chooser.hidden=false;
 const sel=document.getElementById("citySelect"),old=prayerSettings();
 if(sel){sel.value=old.city&&CITY_COORDS[String(old.city).toLowerCase()]?old.city:"";setTimeout(()=>sel.focus(),30)}
}
function applyCityFromPicker(){
 const sel=document.getElementById("citySelect"),clean=String(sel?.value||"").trim();
 if(!clean){toast("Pilih kota terlebih dahulu");return}
 const old=prayerSettings();
 savePrayerSettings({city:clean,country:old.country||"Indonesia"});
 const c=CITY_COORDS[clean.toLowerCase()];
 if(c){saveLocation({lat:c.lat,lon:c.lon,accuracy:5000,label:`${clean} • pusat kota`,source:"city",timezone:CITY_TIMEZONES[clean.toLowerCase()]||"Asia/Jakarta",at:Date.now()});renderLocationUI()}
 closeLocationPicker();loadPrayerTimes(true);toast(`Lokasi ${clean} dipakai ✓`);
}

function syncAccountPopover(){
  const n=profile?.name||"Pengguna", email=profile?.email||"Akun lokal";
  const photo=profile?.photo||"";
  const big=document.getElementById("popoverProfileBig");
  if(big)big.innerHTML=photo?`<img src="${photo}" alt="">`:initials(n);
  const name=document.getElementById("popoverProfileName");if(name)name.textContent=n;
  const em=document.getElementById("popoverProfileEmail");if(em)em.textContent=email;
  const st=document.getElementById("popoverProfileStatus");if(st)st.textContent=profile?.email?"Akun tersambung":"Jurnal ibadah pribadi • Akun lokal";
  const ni=document.getElementById("popoverNameInput");if(ni)ni.value=profile?.name||"";
  const ei=document.getElementById("popoverEmailInput");if(ei)ei.value=profile?.email||"";
  const wi=document.getElementById("popoverWhatsappInput");if(wi)wi.value=profile?.whatsapp||DEFAULT_WHATSAPP;
}
function firestoreProfileRef(user=getCloudUser()){
 const db=getFirestore();
 return db&&user?db.collection("users").doc(user.uid):null;
}
async function saveCloudProfile(){
 const user=getCloudUser(),ref=firestoreProfileRef(user);
 if(!user||!ref)return false;
 try{
  await ref.set({
   display_name:profile.name||"Pengguna",
   email:user.email||profile.email||"",
   photo_url:profile.photo||user.photoURL||"",
   whatsapp:profile.whatsapp||"",
   updated_at:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true});
  return true;
 }catch(err){
  console.error("Gagal menyimpan profil ke Firestore:",err);
  toast("Profil tersimpan lokal, tetapi gagal disinkronkan.");
  return false;
 }
}
async function loadCloudProfile(user){
 const ref=firestoreProfileRef(user);
 if(!ref)return;
 try{
  const snapshot=await ref.get(),cloud=snapshot.exists?(snapshot.data()||{}):{};
  profile={
   ...profile,
   name:cloud.display_name||user.displayName||profile.name||"Pengguna",
   email:user.email||cloud.email||profile.email||"",
   photo:cloud.photo_url||user.photoURL||profile.photo||"",
   whatsapp:cloud.whatsapp||profile.whatsapp||DEFAULT_WHATSAPP
  };
  if(!snapshot.exists)await saveCloudProfile();
  syncActiveAccount();updateProfile();hydrateProfilePhoto();
 }catch(err){
  console.error("Gagal memuat profil dari Firestore:",err);
  toast("Profil lokal digunakan karena data cloud belum dapat dimuat.");
 }
}
function handleProfileChipClick(){
  const current=document.querySelector(".page.active")?.id;
  if(current==="profil"){openAccountPopover();return}
  go("profil");
}
function openAccountPopover(){
  if(document.querySelector(".page.active")?.id!=="profil"){go("profil");return}
  // The help room uses inert on .main while open. Release that lock before
  // opening the account editor so mobile inputs remain fully interactive.
  if(document.body.classList.contains("profile-help-open")) closeProfileHelp();
  const main=document.querySelector(".main");
  if(main)main.inert=false;
  const pop=document.getElementById("accountPopover");if(!pop)return;
  syncAccountPopover();
  pop.hidden=false;
  pop.style.pointerEvents="auto";
  document.querySelector(".profile-chip")?.setAttribute("aria-expanded","true");
  requestAnimationFrame(()=>setTimeout(()=>document.getElementById("popoverNameInput")?.focus({preventScroll:true}),40));
}
function closeAccountPopover(){
  const pop=document.getElementById("accountPopover");if(pop)pop.hidden=true;
  document.querySelector(".profile-chip")?.setAttribute("aria-expanded","false");
}
function savePopoverProfile(){
  const name=document.getElementById("popoverNameInput")?.value.trim()||"Pengguna";
  const whatsapp=normalizeWhatsappNumber(document.getElementById("popoverWhatsappInput")?.value||DEFAULT_WHATSAPP);
  const hiddenName=document.getElementById("nameInput"),hiddenWhatsapp=document.getElementById("whatsappInput");
  if(hiddenName)hiddenName.value=name;if(hiddenWhatsapp)hiddenWhatsapp.value=whatsapp;
  // Email berasal dari Firebase Google Authentication dan ditampilkan di ringkasan akun.
  // Jangan mengubahnya dari form profil.
  profile={...profile,name,whatsapp};syncActiveAccount();updateProfile();syncAccountPopover();
  saveCloudProfile().then(ok=>toast(ok?"Profil tersimpan ke Firebase ✓":"Profil berhasil disimpan lokal ✓"));
}
function useCurrentLocationForPrayerSchedule(){
  if(window.__gpsDirectBusy)return;
  if(!navigator.geolocation){toast("Browser tidak menyediakan lokasi perangkat.");return}
  const secure=window.isSecureContext===true||["localhost","127.0.0.1"].includes(location.hostname);
  if(!secure){
    toast("Titik lokasi memerlukan HTTPS/Preview. Buka aplikasi dari alamat HTTPS lalu coba lagi.");
    openLocationPicker();
    return;
  }
  window.__gpsDirectBusy=true;
  toast("Meminta titik lokasi perangkat…");
  let finished=false;
  const success=pos=>{
    if(finished)return;finished=true;window.__gpsDirectBusy=false;
    const lat=Number(pos.coords.latitude),lon=Number(pos.coords.longitude);
    if(!validLatLon(lat,lon)){toast("Koordinat lokasi tidak valid. Coba lagi.");return}
    const accuracy=Math.round(pos.coords.accuracy||0);
    const v={lat,lon,accuracy,label:"Lokasi HP saat ini",source:"gps",timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Jakarta",at:Date.now()};
    saveLocation(v);renderLocationUI();
    window.__prayerScheduleOffset=0;
    window.__selectedPrayerScheduleIso=prayerScheduleIso(timezoneDate(prayerScheduleLocation().tz));
    loadPrayerSchedule(true);
    toast(`Titik lokasi ditemukan${accuracy?` • akurasi ±${accuracy} m`:""} ✓`);
  };
  const retry=()=>{
    if(finished)return;
    try{
      navigator.geolocation.getCurrentPosition(success,err=>{
        if(finished)return;finished=true;window.__gpsDirectBusy=false;
        const msg=err?.code===1?"Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini."
          :err?.code===2?"Posisi belum ditemukan. Pastikan GPS/Layanan Lokasi aktif."
          :"Lokasi belum diperoleh. Coba lagi.";
        toast(msg);
      },{enableHighAccuracy:false,timeout:20000,maximumAge:300000});
    }catch(e){finished=true;window.__gpsDirectBusy=false;toast("GPS tidak dapat dijalankan di browser ini.")}
  };
  try{navigator.geolocation.getCurrentPosition(success,retry,{enableHighAccuracy:true,timeout:15000,maximumAge:30000})}
  catch(e){finished=true;window.__gpsDirectBusy=false;toast("GPS tidak dapat dijalankan di browser ini.")}
}

let personalNoteEditingId=null;

function personalNotesStorageKey(){
  const accountKey=(window.__activeAccountId||"local").toString();
  return `aih_personal_notes_v2_${accountKey}`;
}
function personalNotesLegacyStorageKey(){
  const accountKey=(window.__activeAccountId||"local").toString();
  return `aih_personal_notes_v1_${accountKey}`;
}
function getPersonalNotes(){
  try{
    const raw=localStorage.getItem(personalNotesStorageKey());
    const parsed=raw?JSON.parse(raw):[];
    if(Array.isArray(parsed))return parsed.filter(x=>x&&typeof x==="object"&&String(x.body||"").trim());
  }catch(e){}
  return [];
}
function persistPersonalNotes(notes){
  localStorage.setItem(personalNotesStorageKey(),JSON.stringify(notes.slice(0,80)));
}
function formatPersonalNoteDate(ts){
  try{
    return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(ts));
  }catch(e){return "Tersimpan"}
}
function resetPersonalNoteForm(){
  personalNoteEditingId=null;
  const title=document.getElementById("personalNoteTitle"),body=document.getElementById("personalNotes");
  const heading=document.getElementById("personalNotesFormTitle"),cancel=document.getElementById("personalNotesCancel"),save=document.getElementById("personalNotesSaveBtn");
  if(title)title.value="";
  if(body)body.value="";
  if(heading)heading.textContent="Catatan baru";
  if(cancel)cancel.hidden=true;
  if(save)save.textContent="Simpan catatan";
  const status=document.getElementById("personalNotesStatus");if(status)status.textContent="Tersimpan di perangkat ini";
}
function loadPersonalNotes(){
  const body=document.getElementById("personalNotes");if(!body)return;
  let notes=getPersonalNotes();
  // Migrate the previous single-textarea note into the new note list once.
  if(!notes.length){
    try{
      const legacy=localStorage.getItem(personalNotesLegacyStorageKey())||"";
      if(legacy.trim()){
        const now=Date.now();
        notes=[{id:`note_${now}`,title:"Catatan pribadi",body:legacy.trim(),createdAt:now,updatedAt:now}];
        persistPersonalNotes(notes);
        try{localStorage.removeItem(personalNotesLegacyStorageKey())}catch(e){}
      }
    }catch(e){}
  }
  resetPersonalNoteForm();
  renderPersonalNotes(notes);
}
function renderPersonalNotes(notes=getPersonalNotes()){
  const list=document.getElementById("savedPersonalNotes");
  const count=document.getElementById("personalNotesCount");
  if(count)count.textContent=`${notes.length} ${notes.length===1?"catatan":"catatan"}`;
  if(!list)return;
  if(!notes.length){
    list.innerHTML=`<div class="notes-empty"><span>📝</span><b>Belum ada catatan tersimpan</b><small>Catatan yang kamu simpan akan tampil di sini dan bisa diedit atau dihapus kapan saja.</small></div>`;
    return;
  }
  const sorted=[...notes].sort((a,b)=>Number(b.updatedAt||b.createdAt||0)-Number(a.updatedAt||a.createdAt||0));
  list.innerHTML=sorted.map(note=>{
    const title=escapeHtml(String(note.title||"Catatan pribadi").trim()||"Catatan pribadi");
    const body=escapeHtml(String(note.body||"")).replace(/\n/g,"<br>");
    const date=formatPersonalNoteDate(Number(note.updatedAt||note.createdAt||Date.now()));
    return `<article class="saved-note-card">
      <div class="saved-note-head">
        <div><b>${title}</b><small>${date}</small></div>
        <div class="saved-note-actions">
          <button class="note-action" type="button" onclick="editPersonalNote('${escapeHtml(String(note.id))}')" aria-label="Edit catatan">✏️</button>
          <button class="note-action danger" type="button" onclick="deletePersonalNote('${escapeHtml(String(note.id))}')" aria-label="Hapus catatan">🗑️</button>
        </div>
      </div>
      <p>${body}</p>
    </article>`;
  }).join("");
}
function savePersonalNotes(){
  const titleEl=document.getElementById("personalNoteTitle"),bodyEl=document.getElementById("personalNotes");
  if(!bodyEl)return;
  const body=String(bodyEl.value||"").trim();
  const title=String(titleEl?.value||"").trim().slice(0,80)||"Catatan pribadi";
  if(!body){toast("Tulis isi catatan terlebih dahulu.");bodyEl.focus();return}
  const now=Date.now(),notes=getPersonalNotes(),wasEditing=!!personalNoteEditingId;
  try{
    if(personalNoteEditingId){
      const i=notes.findIndex(x=>String(x.id)===String(personalNoteEditingId));
      if(i>=0)notes[i]={...notes[i],title,body,updatedAt:now};
      else notes.unshift({id:`note_${now}_${Math.random().toString(36).slice(2,7)}`,title,body,createdAt:now,updatedAt:now});
    }else{
      notes.unshift({id:`note_${now}_${Math.random().toString(36).slice(2,7)}`,title,body,createdAt:now,updatedAt:now});
    }
    persistPersonalNotes(notes);
  }catch(e){toast("Catatan belum bisa disimpan di perangkat ini");return}
  const status=document.getElementById("personalNotesStatus");if(status)status.textContent=personalNoteEditingId?"Perubahan tersimpan ✓":"Tersimpan ✓";
  renderPersonalNotes(notes);
  resetPersonalNoteForm();
  toast(wasEditing?"Catatan diperbarui ✓":"Catatan pribadi tersimpan ✓");
}
function editPersonalNote(id){
  const note=getPersonalNotes().find(x=>String(x.id)===String(id));if(!note)return;
  personalNoteEditingId=note.id;
  const title=document.getElementById("personalNoteTitle"),body=document.getElementById("personalNotes");
  const heading=document.getElementById("personalNotesFormTitle"),cancel=document.getElementById("personalNotesCancel"),save=document.getElementById("personalNotesSaveBtn");
  if(title)title.value=note.title||"";
  if(body)body.value=note.body||"";
  if(heading)heading.textContent="Edit catatan";
  if(cancel)cancel.hidden=false;
  if(save)save.textContent="Simpan perubahan";
  document.getElementById("personalNotesStatus").textContent="Sedang mengedit catatan";
  document.getElementById("personalNoteTitle")?.focus();
  document.getElementById("personalNotes")?.scrollIntoView({behavior:"smooth",block:"center"});
}
function cancelPersonalNoteEdit(){
  resetPersonalNoteForm();
}
function deletePersonalNote(id){
  const note=getPersonalNotes().find(x=>String(x.id)===String(id));if(!note)return;
  if(!confirm(`Hapus catatan "${String(note.title||"Catatan pribadi").slice(0,60)}"?`))return;
  const notes=getPersonalNotes().filter(x=>String(x.id)!==String(id));
  try{persistPersonalNotes(notes)}catch(e){toast("Catatan belum bisa dihapus");return}
  if(String(personalNoteEditingId)===String(id))resetPersonalNoteForm();
  renderPersonalNotes(notes);
  toast("Catatan dihapus ✓");
}


function setPrayerCity(){showCityChooser()}
function prayerTimeToMinutes(v){const m=String(v||"").match(/(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):9999}
function timeParts(v){const m=String(v||"").match(/(\d{1,2}):(\d{2})/);return m?{h:Number(m[1]),m:Number(m[2])}:null}
function countdownText(ms){ms=Math.max(0,ms);const sec=Math.floor(ms/1000),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function elapsedText(ms){const min=Math.max(0,Math.floor(ms/60000)),h=Math.floor(min/60),m=min%60;return h?`${h} jam ${m} menit yang lalu`:`${m} menit yang lalu`}
function upcomingPrayer(times){
 const tz=window.__prayerMeta?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Jakarta";
 const p=timezoneParts(new Date(),tz),nowSec=p.hour*3600+p.minute*60+p.second;
 const tracked=times.filter(x=>["Imsak","Subuh","Dzuhur","Ashar","Maghrib","Isya"].includes(x.name)).map(x=>{const t=timeParts(x.time);return t?{...x,sec:t.h*3600+t.m*60}:null}).filter(Boolean);
 for(const x of tracked){if(x.sec>nowSec)return x}
 return tracked.length?{...tracked[0],sec:tracked[0].sec+86400}:null;
}
function prayerCountdownData(times){
 const tz=window.__prayerMeta?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Jakarta";
 const p=timezoneParts(new Date(),tz),nowSec=p.hour*3600+p.minute*60+p.second;
 const tracked=times.filter(x=>["Imsak","Subuh","Dzuhur","Ashar","Maghrib","Isya"].includes(x.name)).map(x=>{const t=timeParts(x.time);return t?{...x,sec:t.h*3600+t.m*60}:null}).filter(Boolean);
 let previous=null,next=null;
 for(const x of tracked){if(x.sec<=nowSec)previous=x;else{next=x;break}}
 const upcoming=next|| (tracked.length?{...tracked[0],sec:tracked[0].sec+86400}:null);
 if(previous){const elapsed=(nowSec-previous.sec)*1000;if(elapsed<=45*60000)return {mode:"elapsed",prayer:previous,elapsed,upcoming}}
 if(next)return {mode:"countdown",prayer:next,remaining:(next.sec-nowSec)*1000,upcoming:next}
 if(upcoming)return {mode:"countdown",prayer:upcoming,remaining:(86400-nowSec+tracked[0].sec)*1000,upcoming}
 return null;
}
function updatePrayerCountdown(){
 const box=document.getElementById("prayerCountdown"),main=document.getElementById("prayerCountdownMain"),sub=document.getElementById("prayerCountdownSub"),label=document.getElementById("prayerCountdownLabel");
 if(!box||!main||!sub||!window.__prayerTimes||!window.__prayerTimes.length){if(box)box.hidden=true;return}
 const d=prayerCountdownData(window.__prayerTimes);if(!d){box.hidden=true;return}
 box.hidden=false;
 const grid=document.getElementById("prayerGrid");
 if(grid){
   grid.querySelectorAll(".prayer-item.next").forEach(el=>el.classList.remove("next"));
   const upcoming=d.upcoming||upcomingPrayer(window.__prayerTimes);
   if(upcoming){
     const items=grid.querySelectorAll(".prayer-item");
     items.forEach(el=>{
       const name=el.querySelector("b")?.textContent?.trim();
       if(name===upcoming.name)el.classList.add("next");
     });
   }
 }
 if(d.mode==="elapsed"){
   box.classList.add("elapsed");if(label)label.textContent="Waktu yang baru lewat";main.textContent=elapsedText(d.elapsed);sub.textContent=`${d.prayer.name} • ${d.prayer.time} • baru saja masuk`;
 }else{
   box.classList.remove("elapsed");if(label)label.textContent="Menuju waktu berikutnya";main.textContent=countdownText(d.remaining);sub.textContent=`${d.prayer.name} • ${d.prayer.time}`;
 }
}
function currentNextPrayer(times){return upcomingPrayer(times)}
function renderPrayerTimes(times,location){
 const grid=document.getElementById("prayerGrid"),status=document.getElementById("prayerStatus"),loc=document.getElementById("prayerLocation"),metaEl=document.getElementById("prayerMeta");if(!grid||!status)return;
 window.__prayerTimes=times;
 const next=currentNextPrayer(times);
 grid.innerHTML=times.map(x=>`<div class="prayer-item ${next&&next.name===x.name?"next":""}"><b>${x.name}</b><span>${x.time||"--:--"}</span></div>`).join("");grid.hidden=false;
 status.textContent=next?`Berikutnya: ${next.name} • ${next.time}`:"Jadwal hari ini tersedia.";
 const meta=window.__prayerMeta||{};
 if(metaEl){
   const method=meta.methodName||"Kementerian Agama Republik Indonesia";
   const tz=timezoneLabel(meta.timezone);
   const source=meta.source||"AlAdhan API";
   const updated=meta.fetchedAt?new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(meta.fetchedAt)):"baru saja";
   metaEl.hidden=false;
   const coord=meta.coordinates?`${Number(meta.coordinates.lat).toFixed(4)}, ${Number(meta.coordinates.lon).toFixed(4)}`:"—";
   const acc=meta.accuracy?`±${Math.round(meta.accuracy)} m`:(meta.locationSource==="city-default"?"pusat kota":"—");
   metaEl.innerHTML=`<span>🌐 <b>${source}</b></span><span>• ${escapeHtml(method)}</span><span>• ${escapeHtml(tz)}</span><span>• 📍 ${coord}</span><span>• ${escapeHtml(acc)}</span><span>• ↻ ${updated}</span>`;
 }
 if(loc){
   const tz=meta.timezone||"";
   const dateForLabel=tz?timezoneDate(tz):today();
   loc.textContent=`${location} • ${fmtGreg(dateForLabel)}`;
 }
 updatePrayerCountdown();clearInterval(window.__prayerTicker);window.__prayerTicker=setInterval(updatePrayerCountdown,1000);scheduleAdhanNotifications(times);
}
async function loadPrayerTimes(force=false){
 const settings=prayerSettings(),locSaved=getSavedLocation(),status=document.getElementById("prayerStatus"),grid=document.getElementById("prayerGrid"),locEl=document.getElementById("prayerLocation"),metaEl=document.getElementById("prayerMeta");
 if(status)status.textContent="Mengambil jadwal sholat resmi…";
 if(metaEl){metaEl.hidden=true;metaEl.innerHTML=""}

 // Sumber lokasi selalu diprioritaskan:
 // GPS/manual -> koordinat titik; kota -> koordinat pusat kota.
 // Default nasional untuk aplikasi ini adalah DKI Jakarta.
 const cityKey=String(settings.city||"Jakarta").toLowerCase();
 const cityCoord=CITY_COORDS[cityKey]||CITY_COORDS.jakarta;
 const estimatedTz=locSaved?.timezone||CITY_TIMEZONES[cityKey]||"Asia/Jakarta";
 const d=timezoneDate(estimatedTz),date=`${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
 const locationKey=locSaved?`geo_${locSaved.lat.toFixed(5)}_${locSaved.lon.toFixed(5)}`:`city_${cityKey}`;
 const cacheKey=`${PRAYER_CACHE_KEY}_${locationKey}_${date}_${PRAYER_METHOD}`;

 if(!force){
   try{
     const c=JSON.parse(localStorage.getItem(cacheKey)||"null");
     if(c&&Array.isArray(c.times)&&c.meta&&Date.now()-Number(c.fetchedAt||0)<12*60*60*1000){
       window.__prayerMeta={...c.meta,fetchedAt:c.fetchedAt,source:"Cache terverifikasi"};
       renderPrayerTimes(c.times,c.location||settings.city);
       return;
     }
   }catch(e){}
 }

 let url,locationLabel;
 if(locSaved){
   url=`https://api.aladhan.com/v1/timings/${date}?latitude=${encodeURIComponent(locSaved.lat)}&longitude=${encodeURIComponent(locSaved.lon)}&method=${PRAYER_METHOD}&school=0`;
   locationLabel=locSaved.label||"Lokasi terpilih";
 }else{
   url=`https://api.aladhan.com/v1/timings/${date}?latitude=${encodeURIComponent(cityCoord.lat)}&longitude=${encodeURIComponent(cityCoord.lon)}&method=${PRAYER_METHOD}&school=0`;
   locationLabel=`${settings.city||"Jakarta"} • pusat kota`;
 }

 try{
   const res=await fetch(url,{headers:{Accept:"application/json"},cache:"no-store"});
   if(!res.ok)throw new Error("HTTP "+res.status);
   const json=await res.json(),t=json?.data?.timings;
   if(!t)throw new Error("Jadwal tidak tersedia");

   const times=PRAYER_ORDER.map(([name,k])=>({name,time:String(t[k]||"").replace(/\s*\(.+?\)/g,"").trim()}));
   const meta={
     timezone:json?.data?.meta?.timezone||estimatedTz,
     methodName:json?.data?.meta?.method?.name||"Kementerian Agama Republik Indonesia",
     source:"AlAdhan API",
     fetchedAt:Date.now(),
     requestedDate:date,
     coordinates:{lat:locSaved?.lat??cityCoord.lat,lon:locSaved?.lon??cityCoord.lon},
     accuracy:locSaved?.accuracy||null,
     locationSource:locSaved?.source||"city-default"
   };
   window.__prayerMeta=meta;
   try{localStorage.setItem(cacheKey,JSON.stringify({times,location:locationLabel,meta,fetchedAt:meta.fetchedAt}))}catch(e){}
   renderPrayerTimes(times,locationLabel);renderLocationUI();if(document.getElementById("shalat")?.classList.contains("active"))loadPrayerSchedule(true);
 }catch(err){
   if(grid)grid.hidden=true;
   if(status)status.innerHTML=`Jadwal belum bisa disinkronkan. Periksa internet lalu tekan ↻.`;
   if(metaEl){metaEl.hidden=false;metaEl.innerHTML=`<span>⚠️ <b>Sinkronisasi API gagal</b></span><span>Jadwal lama tidak digunakan agar waktu tidak menyesatkan.</span>`}
   if(locEl)locEl.textContent=locSaved?`${locSaved.label||"Lokasi terpilih"}`:`${settings.city||"Jakarta"} • pusat kota`;
 }
}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2300)}

/* Komponen UI bersama untuk halaman Koleksi (Al-Qur'an/Hadits/Do'a/Mutiara/
   Dzikir) supaya status memuat & status kosong/gagal terlihat SATU bahasa
   desain yang sama di semua halaman, bukan masing-masing bikin sendiri. */
function klSkeletonRows(n){
  n=n||4;
  let out="";
  for(let i=0;i<n;i++){
    out+=`<div class="kl-skeleton-row">
      <div class="kl-skeleton kl-skeleton-circle"></div>
      <div class="kl-skeleton-lines">
        <div class="kl-skeleton kl-skeleton-line w60"></div>
        <div class="kl-skeleton kl-skeleton-line w40"></div>
      </div>
    </div>`;
  }
  return out;
}
function klStateHtml(title,desc,retryId){
  return `<div class="kl-state"><b>${title}</b>${desc?`<p>${desc}</p>`:""}${retryId?`<button class="btn outline small" type="button" id="${retryId}">Coba lagi</button>`:""}</div>`;
}
document.getElementById("mapsUrlInput")?.addEventListener("input",previewMapsLocation);

/* v5.21: room navigation stays inside the app.
   Each in-app room gets a browser-history entry so Android/Chrome Back
   returns to the previous room/page instead of leaving the site. */
(function initRoomHistory(){
  const initial=document.querySelector(".page.active")?.id||"dashboard";
  try{
    history.scrollRestoration="manual";
    history.replaceState({aihPage:initial,aihRoot:true},"",location.href);
  }catch(e){}
  window.addEventListener("popstate",e=>{
    const openModal=document.querySelector(".modal-backdrop.show,.prayer-day-backdrop.show,.prayer-columns-backdrop.show");
    if(openModal){
      openModal.querySelector("[aria-label='Tutup'],[data-close]")?.click();
      try{history.pushState({aihPage:document.querySelector(".page.active")?.id||"dashboard"},"",location.href)}catch(_){}
      return;
    }
    const accountPopover=document.getElementById("accountPopover");
    if(accountPopover&&!accountPopover.hidden){
      closeAccountPopover();
      try{history.pushState({aihPage:document.querySelector(".page.active")?.id||"dashboard"},"",location.href)}catch(_){}
      return;
    }
    const current=document.querySelector(".page.active")?.id||"dashboard";
    const target=e.state?.aihPage;
    if(!target||!document.getElementById(target)){
      if(current!=="dashboard"){
        window.__pageSwipeDirection="right";
        go("dashboard",true);
      }else{
        try{history.pushState({aihPage:current,aihRoot:true},"",location.href)}catch(_){}
      }
      return;
    }
    const allow=window.__allowHistoryPop===true;
    window.__allowHistoryPop=false;
    window.__pageSwipeDirection="right";
    go(target,true);
    if(allow){
      window.__pageSwipeDirection="";
    }
  });
})();

window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}})
draftRecord={...record(selectedDate)};persistAccounts();renderNav();updateProfile();renderLocationUI();renderDashboard();renderAbsensi();renderCalendar();renderRecap();hydrateProfilePhoto();loadPrayerTimes();initAdhanNotifications();initGoogleAuth();
fetch("./js/data/quotes.json").then(r=>r.ok?r.json():null).then(list=>setDailyQuotes(list)).catch(()=>{});

/* v4.6: swipe antar room/tab utama — kiri/kanan seperti aplikasi mobile */
function bindPageSwipe(){
  const main=document.querySelector(".main"); if(!main||main.dataset.pageSwipeBound==="1")return;
  main.dataset.pageSwipeBound="1";
  let sx=0,sy=0,tracking=false,horizontal=false,current=null,adjacent=null,pointerId=null;

  const navPages=()=>NAV.map(x=>x[0]).filter(id=>document.getElementById(id));

  const cleanup=()=>{
    if(current){
      current.classList.remove("page-swipe-dragging");
      current.style.transform="";
      current.style.transition="";
    }
    if(adjacent){
      adjacent.classList.remove("page-swipe-peek","from-left","from-right");
      adjacent.style.transform="";
      adjacent.style.position="";
      adjacent.style.top="";
      adjacent.style.left="";
      adjacent.style.right="";
      adjacent.style.width="";
      adjacent.style.transition="";
    }
    main.classList.remove("page-swipe-active");
    current=null;adjacent=null;pointerId=null;
  };

  const prepareAdjacent=(dx)=>{
    const pages=navPages(),idx=pages.indexOf(current?.id);
    if(idx<0)return null;
    const nextIndex=dx<0?idx+1:idx-1;
    if(nextIndex<0||nextIndex>=pages.length)return null;
    const p=document.getElementById(pages[nextIndex]);
    if(!p)return null;

    adjacent=p;
    adjacent.classList.add("page-swipe-peek",dx<0?"from-right":"from-left");
    adjacent.style.position="absolute";
    adjacent.style.top=(main.querySelector(".topbar")?.offsetHeight||52)+"px";
    adjacent.style.width="100%";
    adjacent.style.left=dx<0?"100%":"-100%";
    adjacent.style.right="auto";
    adjacent.style.transform="translate3d(0,0,0)";
    main.classList.add("page-swipe-active");

    if(adjacent.id==="absensi")renderAbsensi();
    if(adjacent.id==="kalender")renderCalendar();
    if(adjacent.id==="shalat")renderPrayerSchedule();
    if(adjacent.id==="rekap")renderRecap();
    if(adjacent.id==="profil")updateProfile();
    return adjacent;
  };

  main.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse" && e.button!==0)return;
    if(document.documentElement.classList.contains("modal-open"))return;
    const t=e.target;
    const interactiveSelector="button,a,input,select,textarea,summary,[role='button'],[role='dialog'],.btn,.icon-btn,.seg,.day,.status button,.collection-card,.nav button,.mobile-nav button,.quran-surah-btn,.hadits-book-btn,.doa-cat-btn,.quran-play-btn";
    const ignore=!!t.closest(interactiveSelector) || !!t.closest(".prayer-table-wrap,.ps-mobile-list,.ps-calendar-card,.calendar-card");
    if(ignore)return;

    sx=e.clientX;sy=e.clientY;pointerId=e.pointerId;
    tracking=true;horizontal=false;
    current=document.querySelector(".page.active");
    try{main.setPointerCapture(e.pointerId)}catch(_){}
  });

  main.addEventListener("pointermove",e=>{
    if(!tracking||!current)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;

    if(!horizontal){
      if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
      if(Math.abs(dx)>Math.abs(dy)*1.08){
        horizontal=true;
        prepareAdjacent(dx);
        e.preventDefault();
      }else{
        tracking=false;cleanup();return;
      }
    }
    if(!horizontal)return;

    if(!adjacent)prepareAdjacent(dx);

    const width=Math.max(main.clientWidth,1);
    let move=dx;

    /* At the first/last page, use a short rubber-band instead of exposing
       a blank canvas or letting the page fly completely off-screen. */
    if(!adjacent){
      const resistance=Math.min(0.28,72/Math.max(width,1));
      move=dx*resistance;
    }else{
      move=Math.max(-width,Math.min(width,dx));
    }

    current.classList.add("page-swipe-dragging");
    current.style.transform=`translate3d(${move}px,0,0)`;

    if(adjacent){
      const sign=dx<0?1:-1;
      adjacent.style.transform=`translate3d(${sign*width+move}px,0,0)`;
    }
    e.preventDefault();
  });

  const end=e=>{
    if(!tracking)return;
    tracking=false;

    const dx=e.clientX-sx,dy=e.clientY-sy;
    const pages=navPages(),idx=pages.indexOf(current?.id);
    const nextIndex=dx<0?idx+1:idx-1;
    const validDirection=Math.abs(dx)>Math.abs(dy)*1.05;
    const valid=!!adjacent && Math.abs(dx)>=48 && validDirection &&
      nextIndex>=0 && nextIndex<pages.length;

    if(!valid){cleanup();return;}

    const target=pages[nextIndex],width=Math.max(main.clientWidth,1),sign=dx<0?1:-1;
    current.style.transition="transform .34s cubic-bezier(.22,.8,.25,1)";
    adjacent.style.transition="transform .34s cubic-bezier(.22,.8,.25,1)";
    current.style.transform=`translate3d(${sign*-width}px,0,0)`;
    adjacent.style.transform="translate3d(0,0,0)";

    setTimeout(()=>{
      cleanup();
      window.__pageSwipeDirection=dx<0?"left":"right";
      go(target);
    },340);
  };

  main.addEventListener("pointerup",end);
  main.addEventListener("pointercancel",()=>{tracking=false;cleanup()});
  main.addEventListener("lostpointercapture",()=>{if(tracking){tracking=false;cleanup()}});
}
/* Detail rooms behave like native mobile screens: a right swipe returns to
   their parent, while vertical movement remains ordinary page scrolling. */
function bindReaderSwipe(){
  const main=document.querySelector(".main"); if(!main||main.dataset.readerSwipeBound==="1")return;
  main.dataset.readerSwipeBound="1";
  const parents={
    koleksiQuran:"koleksi",koleksiHadits:"koleksi",koleksiDoa:"koleksi",
    koleksiDzikir:"koleksi",koleksiMutiara:"koleksi",tasbih:"koleksi",
    shalat:"dashboard",rekap:"dashboard"
  };
  let sx=0,sy=0,activePage="",tracking=false,axis="";
  main.addEventListener("pointerdown",e=>{
    const page=document.querySelector(".page.active"), parent=parents[page?.id];
    if(!parent||document.documentElement.classList.contains("modal-open"))return;
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(e.target.closest("button,a,input,select,textarea,summary,[role='button'],[role='dialog']"))return;
    sx=e.clientX;sy=e.clientY;activePage=page.id;tracking=true;axis="";
    try{main.setPointerCapture(e.pointerId)}catch(_){}
  });
  main.addEventListener("pointermove",e=>{
    if(!tracking)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!axis){
      if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
      axis=Math.abs(dx)>Math.abs(dy)*1.15?"x":"y";
      if(axis==="y"){tracking=false;return}
    }
    if(axis==="x"&&dx>0)e.preventDefault();
  });
  const end=e=>{
    if(!tracking)return;
    tracking=false;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    const parent=parents[activePage];
    if(axis==="x"&&parent&&dx>=64&&Math.abs(dx)>Math.abs(dy)*1.12){
      window.__pageSwipeDirection="right";
      go(parent);
    }
    activePage="";axis="";
  };
  main.addEventListener("pointerup",end);
  main.addEventListener("pointercancel",()=>{tracking=false;activePage="";axis=""});
  main.addEventListener("lostpointercapture",()=>{tracking=false;activePage="";axis=""});
}
/* Bottom-sheet style dialogs can be dismissed with a short downward swipe. */
function bindModalSwipeDismiss(){
  document.querySelectorAll(".modal-backdrop,.prayer-day-backdrop,.prayer-columns-backdrop").forEach(backdrop=>{
    if(backdrop.dataset.swipeDismissBound==="1")return;
    backdrop.dataset.swipeDismissBound="1";
    let sy=0,sx=0,tracking=false;
    backdrop.addEventListener("pointerdown",e=>{
      if(e.target!==backdrop)return;
      sy=e.clientY;sx=e.clientX;tracking=true;
    });
    backdrop.addEventListener("pointerup",e=>{
      if(!tracking)return;
      tracking=false;
      if(e.clientY-sy>70&&Math.abs(e.clientY-sy)>Math.abs(e.clientX-sx)*1.2){
        backdrop.querySelector("[data-close],.modal-close,.pdm-close,.pcm-close")?.click();
        if(backdrop.classList.contains("show")){
          backdrop.classList.remove("show");
          document.documentElement.classList.remove("modal-open");
        }
      }
    });
    backdrop.addEventListener("pointercancel",()=>{tracking=false});
  });
}
function bindPrayerScheduleSwipe(){
  bindCalendarLikeSwipe({
    card:".ps-calendar-card",
    content:"#psCalendarGrid",
    ignoreTarget:".ps-calendar-head button,.ps-selected-day button",
    onCommit:dir=>{
      window.__selectedPrayerScheduleIso="";
      movePrayerSchedule(dir<0?10:-10);
    }
  });
}

function bindAccountPopoverDismiss(){
  document.addEventListener("pointerdown",e=>{
    const pop=document.getElementById("accountPopover"),chip=document.querySelector(".profile-chip");
    if(!pop||pop.hidden)return;
    if(!pop.contains(e.target)&&!chip?.contains(e.target))closeAccountPopover();
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAccountPopover()});
}
bindPrayerScheduleSwipe();
bindAccountPopoverDismiss();
bindPageSwipe();
bindReaderSwipe();
bindModalSwipeDismiss();

/* Kisah Lillah launch splash */
(function(){
  const splash=document.getElementById("klSplash");
  if(!splash)return;
  const hide=()=>{
    splash.classList.add("is-hidden");
    window.setTimeout(()=>splash.remove(),420);
  };
  // Keep the opening screen visible long enough to read, then reveal the app.
  window.setTimeout(hide,1450);
  window.addEventListener("pageshow",()=>window.setTimeout(hide,1450),{once:true});
})();
