/* Kisah Lillah — service worker: notifikasi adzan + Firebase Cloud Messaging.
   v6: menambahkan siklus install/activate yang benar (skipWaiting +
   clients.claim) supaya pembaruan notifikasi langsung berlaku, dan sebuah
   listener "push" mentah sebagai jalur cadangan di luar Firebase SDK —
   sehingga notifikasi tetap bisa muncul di tray perangkat (ikon, judul,
   isi pesan, getar, tombol aksi) seperti notifikasi WhatsApp walau
   aplikasi sedang tertutup/di latar belakang. */
importScripts("./firebase-config.js");
try{
  importScripts(
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js"
  );
}catch(e){}

const KL_ICON="./assets/kisah-lillah-logo.png";
const KL_CACHE="kl-shell-v34";
const KL_SHELL_FILES=[
  "./",
  "./index.html",
  "./css/base.css",
  "./css/theme-polish.css",
  "./css/collection-pages.css",
  "./css/premium-ui.css",
  "./css/precision-polish.css",
  "./assets/kisah-lillah-logo.png"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(KL_CACHE).then(cache=>cache.addAll(KL_SHELL_FILES)).catch(()=>{})
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n!==KL_CACHE).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});

/* Best-effort offline fallback for the app shell only — collection pages
   (Qur'an/Hadits/Do'a/Mutiara) fetch their own data live and are left to
   the network so their content never goes stale. */
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(!KL_SHELL_FILES.some(f=>url.pathname.endsWith(f.replace("./","/")) || (f==="./"&&url.pathname==="/")))return;
  event.respondWith(
    caches.match(req).then(cached=>cached||fetch(req).catch(()=>cached))
  );
});

let __klFirebaseMessaging=null;
try{
  const cfg=self.AIH_FIREBASE_CONFIG;
  if(self.firebase?.initializeApp && cfg?.apiKey){
    const app=self.firebase.apps?.find(a=>a.name==="KL")||self.firebase.initializeApp(cfg,"KL");
    __klFirebaseMessaging=self.firebase.messaging(app);
    __klFirebaseMessaging.onBackgroundMessage(payload=>{
      const n=payload?.notification||payload?.data||{};
      const title=n.title||"Kisah Lillah";
      const body=n.body||"Ada pengingat dari Kisah Lillah.";
      self.registration.showNotification(title,{
        body,
        tag:n.tag||`firebase-${n.name||"kisah-lillah"}`,
        renotify:true,
        icon:KL_ICON,
        badge:KL_ICON,
        vibrate:[200,100,200],
        data:{
          url:n.url||"./",
          name:n.name||"",
          time:n.time||""
        }
      });
    });
  }
}catch(e){}

function notificationOptions(data={}){
  return {
    body:data.body||"Sudah masuk waktu sholat.",
    tag:data.tag||`adhan-${data.name||"prayer"}`,
    renotify:true,
    requireInteraction:false,
    icon:KL_ICON,
    badge:KL_ICON,
    vibrate:[200,100,200],
    timestamp:data.timestamp||Date.now(),
    actions:[{action:"open",title:"Buka Kisah Lillah"}],
    data:{url:"./",name:data.name||"",time:data.time||""}
  };
}

/* Raw Web Push fallback. This fires for a plain (non-Firebase-SDK) push
   message sent to the browser's push endpoint — useful if a future backend
   sends web-push directly instead of through Firebase. Safe no-op if the
   payload can't be parsed. */
self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?.json()||{}}catch(e){
    try{data={body:event.data?.text()||""}}catch(_){}
  }
  const title=data.title||"Kisah Lillah";
  event.waitUntil(
    self.registration.showNotification(title,notificationOptions(data)).catch(()=>{})
  );
});

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type==="SHOW_ADHAN_NOTIFICATION"){
    event.waitUntil(
      self.registration.showNotification(
        data.title||`Sholat ${data.name||""}`,
        notificationOptions(data)
      ).catch(()=>{})
    );
    return;
  }

  /* Best-effort scheduling for browsers implementing Notification Triggers.
     Normal browsers fall back to the page timer in index.html. */
  if(data.type==="SCHEDULE_ADHAN_NOTIFICATION"){
    const triggerTime=Number(data.timestamp||0);
    if(!triggerTime || typeof TimestampTrigger==="undefined")return;
    event.waitUntil(
      self.registration.showNotification(
        data.title||`Sholat ${data.name||""}`,
        {...notificationOptions(data),showTrigger:new TimestampTrigger(triggerTime)}
      ).catch(()=>{})
    );
  }
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  if(event.action && event.action!=="open")return;
  event.waitUntil((async()=>{
    try{await self.registration.clearAppBadge?.()}catch(e){}
    const url=new URL(event.notification.data?.url||"./",self.location.origin).href;
    const list=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const c of list){
      if("focus" in c){
        try{await c.focus();}catch(e){}
        return;
      }
    }
    if(clients.openWindow)await clients.openWindow(url);
  })());
});
