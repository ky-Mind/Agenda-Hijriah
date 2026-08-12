/* Kisah Lillah — adhan notification helper.
   Uses the single KL app icon for system notifications. */
const KL_ICON="./app-icon-client.png";

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
