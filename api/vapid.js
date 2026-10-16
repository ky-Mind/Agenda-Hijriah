/* Kunci publik VAPID + status konfigurasi server (hanya boolean/ID proyek, tidak ada rahasia). */
module.exports=(req,res)=>{const e=process.env,acc={present:!!e.FIREBASE_SERVICE_ACCOUNT,ok:false,projectId:""};
  try{const j=JSON.parse(e.FIREBASE_SERVICE_ACCOUNT||"");acc.ok=!!(j.client_email&&j.private_key);acc.projectId=j.project_id||""}catch(x){}
  res.setHeader("Cache-Control","no-store");res.status(200).json({key:e.VAPID_PUBLIC_KEY||"",hasPrivate:!!e.VAPID_PRIVATE_KEY,account:acc})};
