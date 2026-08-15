/* Kisah Lillah — adhan notification helper + Firebase Cloud Messaging. */
importScripts("./firebase-config.js");
try{
  importScripts(
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js"
  );
}catch(e){}

const KL_ICON="./app-icon-client.png";

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
