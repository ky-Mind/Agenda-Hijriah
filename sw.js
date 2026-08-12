/* Kisah Lillah — notification helper.
   No page caching is performed here, so the existing application/network
   behavior remains unchanged. */
self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type!=="SHOW_ADHAN_NOTIFICATION")return;
  const title=data.title||"Waktu Adzan";
  const body=data.body||"Sudah masuk waktu sholat.";
  event.waitUntil(
    self.registration.showNotification(title,{
      body,
      tag:`adhan-${data.name||"prayer"}`,
      renotify:false,
      vibrate:[200,100,200],
      icon:"app-icon-client.png",
      badge:"app-icon-client.png",
      data:{url:"./",name:data.name||""}
    }).catch(()=>{})
  );
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const c of list){
      if("focus" in c){await c.focus();return}
    }
    if(clients.openWindow)await clients.openWindow("./");
  })());
});
