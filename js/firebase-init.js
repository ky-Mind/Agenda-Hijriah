(function(){
  try{
    const cfg=window.AIH_FIREBASE_CONFIG;
    if(!cfg?.apiKey || !window.firebase?.initializeApp)return;
    window.__klFirebaseApp=firebase.apps.find(a=>a.name==="KL")||firebase.initializeApp(cfg,"KL");
    if(window.firebase.firestore) window.__klFirebaseDb=firebase.firestore(window.__klFirebaseApp);
    window.__klFirebaseMessaging=firebase.messaging(window.__klFirebaseApp);
  }catch(e){
    window.__klFirebaseError=e;
  }
})();
