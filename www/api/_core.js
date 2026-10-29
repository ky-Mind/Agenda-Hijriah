/* Logika /api/notify (dipisah agar bisa diuji). Mengirim Web Push GENERIK ("Pesan baru"); isi pesan terenkripsi tidak pernah dibaca server.
   Anti-spam: hanya untuk pesan yang BARU saja dikirim pemanggil (<90 dtk) dan maksimal 1 push per pesan (lastPushAt). */
exports.makeNotify=d=>async function notify(req,res){
  const{admin,webpush,env}=d,now=(d.now||Date.now)(),out=(c,o)=>res.status(c).json(o);
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return out(405,{error:"method"});
  try{
    if(!env.FIREBASE_SERVICE_ACCOUNT||!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)return out(503,{error:"not-configured"});
    const tok=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");if(!tok)return out(401,{error:"auth"});
    if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT))});
    const user=await admin.auth().verifyIdToken(tok),body=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{}),db=admin.firestore();
    let to,payload;
    if(body.kind==="test"){to=user.uid;payload={title:"Kisah Lillah",body:"Notifikasi latar belakang aktif ✓",tag:"kl-test",url:"./#/pesan"}}
    else{
      const id=String(body.chatId||"");if(!/^[\w-]{3,200}$/.test(id))return out(400,{error:"chat"});
      const ref=db.collection("chats").doc(id),snap=await ref.get();if(!snap.exists)return out(404,{error:"nochat"});
      const c=snap.data();if(!(c.members||[]).includes(user.uid))return out(403,{error:"forbidden"});
      const lastAt=c.lastAt&&c.lastAt.toMillis?c.lastAt.toMillis():0;
      if(body.kind==="req"){if(c.status!=="pending"||c.requestedBy!==user.uid)return out(409,{error:"state"})}
      else if(c.status!=="active"||c.lastFrom!==user.uid)return out(409,{error:"state"});
      if(now-lastAt>90000)return out(409,{error:"stale"});
      if((c.lastPushAt||0)>=lastAt)return out(200,{ok:true,dup:true});
      to=c.members.find(m=>m!==user.uid);const name=(c.names&&c.names[user.uid])||"Seseorang";
      payload=body.kind==="req"?{title:"Permintaan chat baru",body:`${name} ingin terhubung denganmu`,tag:"chat-"+id,url:"./#/pesan"}:{title:name,body:"Pesan baru (terenkripsi)",tag:"chat-"+id,url:"./#/pesan/"+id};
      await ref.update({lastPushAt:lastAt||now});
    }
    const sref=db.doc(`users/${to}/data/push`),ss=await sref.get(),subs=(ss.exists&&ss.data().subs)||{};
    webpush.setVapidDetails(env.VAPID_SUBJECT||"mailto:admin@kisah-lillah.app",env.VAPID_PUBLIC_KEY,env.VAPID_PRIVATE_KEY);
    let sent=0;const dead={};
    await Promise.all(Object.entries(subs).map(async([id,s])=>{try{await webpush.sendNotification({endpoint:s.endpoint,keys:s.keys},JSON.stringify(payload),{TTL:3600,urgency:"high"});sent++}
      catch(e){if(e&&(e.statusCode===404||e.statusCode===410))dead["subs."+id]=admin.firestore.FieldValue.delete()}}));
    if(Object.keys(dead).length)await sref.update(dead).catch(()=>{});
    return out(200,{ok:true,sent});
  }catch(e){console.error("notify:",e&&(e.code||e.message));const a=/auth\/|ID token|Decoding Firebase|argument-error/i.test(String(e&&(e.code||e.message)));return out(a?401:500,{error:a?"auth":"server"})}
};
