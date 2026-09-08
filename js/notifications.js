const ADHAN_SETTINGS_KEY="aih_adhan_settings_v1";
const ADHAN_AUDIO_MAIN="assets/audio/adzan.mp3";
const ADHAN_AUDIO_SUBUH="assets/audio/adzan-subuh.mp3";
const ADHAN_PRAYERS=["Subuh","Dzuhur","Ashar","Maghrib","Isya"];

function getAdhanSettings(){
  try{
    const v=JSON.parse(localStorage.getItem(ADHAN_SETTINGS_KEY)||"null");
    return {
      notifications:v?.notifications===true,
      sound:v?.sound!==false,
      firebase:v?.firebase===true
    };
  }catch(e){return {notifications:false,sound:true}}
}
function saveAdhanSettings(v){
  const next={notifications:!!v.notifications,sound:v.sound!==false,firebase:!!v.firebase};
  try{localStorage.setItem(ADHAN_SETTINGS_KEY,JSON.stringify(next))}catch(e){}
  return next;
}
function updateAdhanToggle(id,on){
  const el=document.getElementById(id);if(!el)return;
  el.classList.toggle("on",!!on);
  el.setAttribute("aria-pressed",on?"true":"false");
}
function renderAdhanSettings(){
  const s=getAdhanSettings();
  updateAdhanToggle("adhanNotificationToggle",s.notifications);
  updateAdhanToggle("adhanSoundToggle",s.sound);
  const nt=document.getElementById("adhanNotificationText");
  if(nt)nt.textContent=s.notifications?"Notifikasi adzan aktif":"Pengingat waktu adzan";
  const st=document.getElementById("adhanSoundText");
  if(st)st.textContent=s.sound?"Suara adzan aktif":"Suara adzan dimatikan";
  const pt=document.getElementById("adhanPermissionText");
  if(pt){
    if(!("Notification" in window))pt.textContent="Browser ini tidak mendukung notifikasi";
    else pt.textContent=`Status: ${Notification.permission}`;
  }
  const ft=document.getElementById("firebaseNotificationText");
  if(ft){
    const token=localStorage.getItem("aih_fcm_token_v1");
    const configured=!!window.AIH_FIREBASE_CONFIG?.vapidKey;
    const ready=!!window.__klFirebaseMessaging && !!token;
    ft.classList.toggle("ready",ready);
    ft.textContent=ready?"Firebase terhubung":(configured?"Siap dihubungkan":"VAPID key belum diatur");
  }
}
async function requestAdhanNotificationPermission(){
  if(!("Notification" in window)){
    toast("Browser ini belum mendukung notifikasi perangkat.");
    renderAdhanSettings();return false;
  }
  if(!window.isSecureContext && !/^localhost(:|$)/.test(location.hostname)){
    toast("Gunakan HTTPS/localhost agar notifikasi adzan bisa aktif.");
    renderAdhanSettings();
    return false;
  }
  try{
    const p=await Notification.requestPermission();
    if(p==="granted"){
      const s=getAdhanSettings();saveAdhanSettings({...s,notifications:true});
      toast("Notifikasi perangkat diizinkan ✓");
      registerAdhanServiceWorker();
      scheduleAdhanNotifications(window.__prayerTimes||[]);
      renderAdhanSettings();
      return true;
    }else if(p==="denied"){
      toast("Izin notifikasi ditolak. Ubah dari setelan browser/HP jika ingin mengaktifkannya.");
    }else{
      toast("Izin notifikasi belum diberikan.");
    }
  }catch(e){toast("Izin notifikasi belum bisa diminta dari browser ini.")}
  renderAdhanSettings();
  return false;
}
function toggleAdhanNotifications(){
  const s=getAdhanSettings();
  if(s.notifications){
    saveAdhanSettings({...s,notifications:false});
    clearAdhanSchedule();
    toast("Notifikasi adzan dimatikan.");
    renderAdhanSettings();
    return;
  }
  if(!("Notification" in window)){toast("Browser ini tidak mendukung notifikasi perangkat.");return}
  if(Notification.permission==="granted"){
    saveAdhanSettings({...s,notifications:true});
    registerAdhanServiceWorker();
    scheduleAdhanNotifications(window.__prayerTimes||[]);
    toast("Notifikasi adzan aktif ✓");
    renderAdhanSettings();
    return;
  }
  requestAdhanNotificationPermission();
}
function toggleAdhanSound(){
  const s=getAdhanSettings();
  saveAdhanSettings({...s,sound:!s.sound});
  renderAdhanSettings();
  if(s.sound)toast("Suara adzan dimatikan.");
  else toast("Suara adzan diaktifkan ✓");
  scheduleAdhanNotifications(window.__prayerTimes||[]);
}
function adhanAudioForPrayer(name){
  return name==="Subuh"?ADHAN_AUDIO_SUBUH:ADHAN_AUDIO_MAIN;
}
function stopActiveAdhanAudio(){
  const audio=window.__activeAdhanAudio;
  if(!audio)return;
  try{
    audio.pause();
    audio.currentTime=0;
  }catch(e){}
  window.__activeAdhanAudio=null;
}
function playAdhanSound(name){
  const s=getAdhanSettings();
  if(!s.sound)return;
  try{
    stopActiveAdhanAudio();
    const audio=new Audio(adhanAudioForPrayer(name));
    audio.preload="auto";
    audio.playsInline=true;
    audio.volume=1;
    window.__activeAdhanAudio=audio;
    const p=audio.play();
    if(p&&typeof p.catch==="function"){
      p.catch(()=>toast("Suara adzan diblokir browser. Pastikan suara adzan aktif dan izinkan pemutaran audio."));
    }
  }catch(e){toast("Suara adzan belum bisa diputar di browser ini.")}
}
function testAdhanSound(){
  playAdhanSound("Dzuhur");
}
async function ensureAdhanNotificationPermission(){
  if(!("Notification" in window)){
    toast("Browser ini tidak mendukung notifikasi perangkat.");
    renderAdhanSettings();
    return false;
  }
  if(!window.isSecureContext && !/^localhost(:|$)/.test(location.hostname)){
    toast("Gunakan HTTPS/localhost agar notifikasi adzan bisa aktif.");
    renderAdhanSettings();
    return false;
  }
  if(Notification.permission !== "granted"){
    const granted=await requestAdhanNotificationPermission().catch(()=>false);
    if(!granted) return false;
  }
  return true;
}
async function sendAdhanTestNotification(name,timeLabel){
  const ok=await ensureAdhanNotificationPermission();
  if(!ok) return;

  const target=nextAdhanTarget(window.__prayerTimes||[])||{name,time:timeLabel||"12:00"};
  const prayerName=name||target.name||"Dzuhur";
  const prayerTime=timeLabel||target.time||"12:00";
  await registerAdhanServiceWorker();
  showAdhanNotification(prayerName,prayerTime);
  setAppBadgeSafe(1);
  playAdhanSound(prayerName);
  toast(`Tes notifikasi ${prayerName} dikirim ✓`);
}
async function testSubuhNotification(){
  await sendAdhanTestNotification("Subuh","04:30");
}
async function testAdhanNotification(){
  /* Manual "send test notification" action for Pengaturan, so users can see
     exactly how the WhatsApp-style tray notification will look and sound. */
  await sendAdhanTestNotification("Dzuhur","12:00");
}
function registerAdhanServiceWorker(){
  if(!("serviceWorker" in navigator)||!window.isSecureContext)return Promise.resolve(null);
  try{
    if(!window.__adhanSwPromise){
      window.__adhanSwPromise=navigator.serviceWorker.register("./sw.js").catch(()=>null);
    }
    return window.__adhanSwPromise;
  }catch(e){return Promise.resolve(null)}
}

async function enableFirebaseNotifications(){
  const cfg=window.AIH_FIREBASE_CONFIG||{};
  if(!window.isSecureContext){
    toast("Firebase notifikasi membutuhkan HTTPS.");
    renderAdhanSettings();return;
  }
  if(!cfg.vapidKey){
    toast("VAPID key Firebase belum diatur.");
    renderAdhanSettings();return;
  }
  if(!window.__klFirebaseMessaging){
    toast("Firebase Messaging belum tersedia di browser ini.");
    renderAdhanSettings();return;
  }
  try{
    if(!("Notification" in window)){
      toast("Browser ini tidak mendukung notifikasi perangkat.");
      return;
    }
    let permission=Notification.permission;
    if(permission!=="granted"){
      permission=await Notification.requestPermission();
    }
    if(permission!=="granted"){
      toast("Izin notifikasi belum diberikan.");
      renderAdhanSettings();return;
    }
    const registration=await registerAdhanServiceWorker();
    if(!registration){
      toast("Service Worker belum siap. Coba lagi setelah aplikasi dimuat.");
      return;
    }
    const token=await window.__klFirebaseMessaging.getToken({
      vapidKey:cfg.vapidKey,
      serviceWorkerRegistration:registration
    });
    if(!token)throw new Error("FCM token kosong");
    localStorage.setItem("aih_fcm_token_v1",token);
    const s=getAdhanSettings();
    saveAdhanSettings({...s,firebase:true,notifications:true});
    toast("Notifikasi Firebase terhubung ✓");
  }catch(e){
    console.error("Firebase Messaging:",e);
    toast("Firebase belum bisa dihubungkan. Periksa VAPID key dan HTTPS.");
  }
  renderAdhanSettings();
}
function adhanNotificationContent(name,time){
  const prayerName=name||"Sholat";
  const prayerTime=time||"--:--";
  return {
    title:`Sholat ${prayerName}`,
    body:`${prayerTime} adalah waktunya sholat ${prayerName}`,
    tag:`adhan-${prayerName}`
  };
}
function showAdhanNotification(name,time){
  if(!("Notification" in window)||Notification.permission!=="granted")return;
  const content=adhanNotificationContent(name,time);
  try{
    if(navigator.serviceWorker?.controller){
      navigator.serviceWorker.controller.postMessage({
        type:"SHOW_ADHAN_NOTIFICATION",
        title:content.title,
        body:content.body,
        name,
        time,
        tag:content.tag
      });
    }else{
      new Notification(content.title,{
        body:content.body,
        tag:content.tag,
        renotify:true,
        icon:"app-icon-client.png",
        badge:"app-icon-client.png"
      });
    }
  }catch(e){
    try{
      new Notification(content.title,{
        body:content.body,
        tag:content.tag,
        icon:"app-icon-client.png",
        badge:"app-icon-client.png"
      });
    }catch(_){}
  }
}
async function scheduleAdhanNotificationTrigger(target){
  if(!target||!("serviceWorker" in navigator)||!window.isSecureContext)return false;
  if(!("TimestampTrigger" in window))return false;
  try{
    const reg=await navigator.serviceWorker.ready;
    if(!reg)return false;
    const key=`${target.name}-${target.epoch}`;
    const stored=localStorage.getItem("aih_adhan_trigger_v1");
    if(stored===key)return true;
    const content=adhanNotificationContent(target.name,target.time);
    const controller=reg.active||navigator.serviceWorker.controller;
    if(!controller)return false;
    controller.postMessage({
      type:"SCHEDULE_ADHAN_NOTIFICATION",
      title:content.title,
      body:content.body,
      name:target.name,
      time:target.time,
      tag:content.tag,
      timestamp:target.epoch
    });
    localStorage.setItem("aih_adhan_trigger_v1",key);
    return true;
  }catch(e){return false}
}
function timezoneEpochForParts(p,tz){
  // Convert local clock parts in a named timezone to an epoch.
  // The small offset calculation keeps scheduling correct when the device
  // timezone differs from the prayer-location timezone.
  const utcGuess=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second||0,0);
  try{
    const asUtc=timezoneParts(new Date(utcGuess),tz);
    const represented=Date.UTC(asUtc.year,asUtc.month-1,asUtc.day,asUtc.hour,asUtc.minute,asUtc.second);
    return utcGuess-(represented-utcGuess);
  }catch(e){return utcGuess}
}
function nextAdhanTarget(times){
  const tz=window.__prayerMeta?.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Jakarta";
  const now=Date.now();
  const todayParts=timezoneParts(new Date(),tz);
  const tracked=(times||[]).filter(x=>ADHAN_PRAYERS.includes(x.name));
  let candidates=[];
  for(const x of tracked){
    const t=timeParts(x.time);if(!t)continue;
    candidates.push({name:x.name,time:x.time,epoch:timezoneEpochForParts({...todayParts,hour:t.h,minute:t.m,second:0},tz)});
  }
  const future=candidates.filter(x=>x.epoch>now+500);
  if(future.length)return future.sort((a,b)=>a.epoch-b.epoch)[0];
  if(candidates.length){
    const first=candidates.sort((a,b)=>a.epoch-b.epoch)[0];
    const tomorrow=new Date(first.epoch+86400000);
    return {...first,epoch:tomorrow.getTime()};
  }
  return null;
}
function clearAdhanSchedule(){
  if(window.__adhanTimer){clearTimeout(window.__adhanTimer);window.__adhanTimer=null}
  window.__adhanScheduledKey="";
}
function scheduleAdhanNotifications(times){
  clearAdhanSchedule();
  const s=getAdhanSettings();
  if(!s.notifications&&!s.sound)return;
  const target=nextAdhanTarget(times);
  if(!target)return;
  const delay=Math.max(500,target.epoch-Date.now());
  const key=`${target.name}-${target.epoch}`;
  window.__adhanScheduledKey=key;

  if(s.notifications){
    registerAdhanServiceWorker();
    scheduleAdhanNotificationTrigger(target);
  }

  window.__adhanTimer=setTimeout(()=>{
    if(window.__adhanScheduledKey!==key)return;
    const current=getAdhanSettings();
    if(current.notifications)showAdhanNotification(target.name,target.time);
    if(current.sound)playAdhanSound(target.name);
    window.__adhanTimer=null;
    setTimeout(()=>scheduleAdhanNotifications(window.__prayerTimes||[]),1500);
  },Math.min(delay,2147483647));
}
function initFirebaseMessaging(){
  try{
    const messaging=window.__klFirebaseMessaging;
    if(!messaging||messaging.__aihBound)return;
    messaging.__aihBound=true;
    messaging.onMessage(payload=>{
      const n=payload?.notification||payload?.data||{};
      const title=n.title||"Kisah Lillah";
      const body=n.body||"Ada pengingat dari Kisah Lillah.";
      try{
        if(Notification?.permission==="granted"){
          if(navigator.serviceWorker?.controller){
            navigator.serviceWorker.controller.postMessage({
              type:"SHOW_ADHAN_NOTIFICATION",
              title,body,
              name:payload?.data?.name||"",
              time:payload?.data?.time||"",
              tag:payload?.data?.tag||"firebase-kisah-lillah"
            });
          }else new Notification(title,{body,icon:"app-icon-client.png",badge:"app-icon-client.png"});
        }
      }catch(e){}
    });
  }catch(e){}
}

function initAdhanNotifications(){
  /* v6: fixed a duplicate-definition bug from the previous build where a
     second initAdhanNotifications() silently overwrote this one and skipped
     initFirebaseMessaging(), so Firebase background push never got wired up. */
  initFirebaseMessaging();
  renderAdhanSettings();
  registerAdhanServiceWorker();
  scheduleAdhanNotifications(window.__prayerTimes||[]);
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)scheduleAdhanNotifications(window.__prayerTimes||[]);
  });
}
/* Realistic "chat app style" notification touches: a small unread-style
   badge on the app icon/tab (where the browser/OS supports the Badging
   API) so a pending adzan feels like an unread WhatsApp message. */
function setAppBadgeSafe(n){
  try{
    if(!("setAppBadge" in navigator))return;
    if(n>0)navigator.setAppBadge(n).catch(()=>{});
    else navigator.clearAppBadge?.().catch(()=>{});
  }catch(e){}
}

/* Sakelar utama: matikan SEMUA jenis notifikasi sekaligus (adzan, suara,
   Firebase push, jadwal yang tertunda) — berbeda dari toggle "Notifikasi
   adzan" yang hanya mematikan satu jenis. Dipakai oleh tombol "Matikan
   semua notifikasi" di Pengaturan. */
async function stopAdhanTestNotification(){
  stopActiveAdhanAudio();
  clearAdhanSchedule();
  setAppBadgeSafe(0);
  try{
    const reg=await navigator.serviceWorker?.getRegistration?.();
    const list=await reg?.getNotifications?.();
    list?.forEach(n=>n.close());
  }catch(e){}
  toast("Tes notifikasi dimatikan.");
}
async function disableAllAdhanNotifications(){
  stopActiveAdhanAudio();
  const s=saveAdhanSettings({notifications:false,sound:false,firebase:false});
  updateAdhanToggle("adhanNotificationToggle",false);
  updateAdhanToggle("adhanSoundToggle",false);
  const permissionText=document.getElementById("adhanPermissionText");
  if(permissionText && "Notification" in window){permissionText.textContent=`Status: ${Notification.permission}`;}
  const nt=document.getElementById("adhanNotificationText");
  if(nt)nt.textContent=s.notifications?"Notifikasi adzan aktif":"Pengingat waktu adzan";
  const st=document.getElementById("adhanSoundText");
  if(st)st.textContent=s.sound?"Suara adzan aktif":"Suara adzan dimatikan";
  clearAdhanSchedule();
  setAppBadgeSafe(0);
  renderAdhanSettings();
  try{
    const reg=await navigator.serviceWorker?.getRegistration?.();
    const list=await reg?.getNotifications?.();
    list?.forEach(n=>n.close());
  }catch(e){}
  try{
    const messaging=window.__klFirebaseMessaging;
    if(messaging?.deleteToken)await messaging.deleteToken().catch(()=>{});
  }catch(e){}
  toast("Semua notifikasi dimatikan.");
}

