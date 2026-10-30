/* Notifikasi latar belakang (Web Push/VAPID). Server: /api/notify (Vercel) mengirim push generik "Pesan baru" (isi pesan tidak pernah dikirim). */
const ON="kl_push_on";
export const supported=()=>"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;
export const isOn=()=>localStorage.getItem(ON)==="1";
const u8=s=>{const b=(s+"=".repeat((4-s.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(b),c=>c.charCodeAt(0))};
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))).slice(0,8),n=>n.toString(16).padStart(2,"0")).join("");
const sref=uid=>window.__klDb.collection("users").doc(uid).collection("data").doc("push");
const ready=()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,no)=>setTimeout(()=>no(new Error("sw")),5000))]);
async function vapid(){let r;try{r=await fetch("/api/vapid",{cache:"no-store"})}catch(e){throw new Error("server")}if(!r.ok)throw new Error("server");const j=await r.json();if(!j.key)throw new Error("server");return j.key}
export async function enable(){
  const u=window.__klAuth&&__klAuth.currentUser;if(!supported())throw new Error("unsupported");if(!u)throw new Error("login");
  const key=await vapid();if(await Notification.requestPermission()!=="granted")throw new Error("denied");
  const reg=await ready();let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(key)});
  const j=sub.toJSON(),id=await hash(j.endpoint);
  await sref(u.uid).set({subs:{[id]:{endpoint:j.endpoint,keys:j.keys,ua:navigator.userAgent.slice(0,80),at:Date.now()}}},{merge:true});
  localStorage.setItem(ON,"1");localStorage.setItem("kl_push_id",id+"|"+u.uid)}
export async function disable(){
  const u=window.__klAuth&&__klAuth.currentUser;
  try{const reg=await ready(),sub=await reg.pushManager.getSubscription();if(sub){const id=await hash(sub.endpoint);await sub.unsubscribe();if(u)await sref(u.uid).update({["subs."+id]:firebase.firestore.FieldValue.delete()}).catch(()=>{})}}catch(e){}
  localStorage.removeItem(ON);localStorage.removeItem("kl_push_id")}
/* dipanggil saat login: pastikan langganan perangkat ini tercatat untuk akun ini */
export async function refresh(u){
  if(!u||!isOn()||!supported()||Notification.permission!=="granted")return;
  try{const reg=await ready(),sub=await reg.pushManager.getSubscription();if(!sub){localStorage.removeItem(ON);return}
    const id=await hash(sub.endpoint)+"|"+u.uid;if(localStorage.getItem("kl_push_id")===id)return;const j=sub.toJSON();
    await sref(u.uid).set({subs:{[id.split("|")[0]]:{endpoint:j.endpoint,keys:j.keys,ua:navigator.userAgent.slice(0,80),at:Date.now()}}},{merge:true});localStorage.setItem("kl_push_id",id)}catch(e){}}
/* beri tahu server ada pesan/permintaan baru (server memeriksa keanggotaan chat; tanpa isi pesan) */
export async function ping(chatId,kind){
  try{const u=window.__klAuth&&__klAuth.currentUser;if(!u)return;const t=await u.getIdToken();
    fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify({chatId,kind}),keepalive:true}).catch(()=>{})}catch(e){}}
export async function test(){const u=__klAuth.currentUser,t=await u.getIdToken(),r=await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify({kind:"test"})});if(!r.ok)throw new Error("server");return (await r.json()).sent||0}

/* Diagnosa langkah demi langkah: apa yang belum beres agar notifikasi latar belakang jalan */
export async function diagnose(){
  const L=[],add=(ok,label,hint)=>L.push({ok:!!ok,label,hint:ok?"":hint}),u=window.__klAuth&&__klAuth.currentUser;
  add(supported()&&window.isSecureContext,"Browser mendukung notifikasi latar belakang","Pakai Chrome/Edge/Firefox terbaru lewat HTTPS. iPhone: pasang aplikasi ke layar utama (iOS 16.4+).");
  add(!!u,"Sudah masuk dengan Google","Masuk di Profil › Profil › Akun Google.");
  const perm="Notification"in window?Notification.permission:"denied";
  add(perm==="granted","Izin notifikasi diberikan",perm==="denied"?"Izin diblokir. Buka pengaturan situs/aplikasi di ponsel › Notifikasi › Izinkan, lalu coba lagi.":"Tekan Aktifkan agar browser meminta izin.");
  let reg=null;try{reg=await navigator.serviceWorker.getRegistration()}catch(e){}
  add(reg&&reg.active,"Service worker aktif","Muat ulang aplikasi dua kali. Pastikan situs memakai HTTPS.");
  let v=null,st=0;try{const r=await fetch("/api/vapid",{cache:"no-store"});st=r.status;if(r.ok)v=await r.json()}catch(e){}
  if(!v)add(false,"Fungsi server /api terdeteksi",st===404?"Folder api/ tidak ikut ter-deploy. Pastikan folder api/ ada di root repo GitHub (sejajar index.html), lalu Redeploy.":`Server tidak menjawab (status ${st||"jaringan"}).`);
  else{
    add(v.key,"VAPID_PUBLIC_KEY terisi di Vercel","Jalankan npm run vapid, isi VAPID_PUBLIC_KEY di Vercel › Settings › Environment Variables, lalu Redeploy.");
    add(v.hasPrivate,"VAPID_PRIVATE_KEY terisi di Vercel","Isi VAPID_PRIVATE_KEY (pasangan dari kunci publik yang sama), lalu Redeploy.");
    const a=v.account||{};add(a.ok,"FIREBASE_SERVICE_ACCOUNT terisi dan valid",a.present?"Isinya bukan JSON service account yang utuh (harus memuat client_email dan private_key). Buat ulang kuncinya dan tempel seluruh isi file JSON.":"Belum diisi. Firebase Console › Project settings › Service accounts › Generate new private key, tempel isi JSON ke Vercel, lalu Redeploy.");
    if(a.ok&&a.projectId&&window.KL_FIREBASE&&a.projectId!==KL_FIREBASE.projectId)add(false,"Service account satu proyek dengan aplikasi",`Service account berasal dari proyek “${a.projectId}”, aplikasi memakai “${KL_FIREBASE.projectId}”. Buat kuncinya dari proyek yang benar.`);
  }
  let sub=null;try{const r=await ready();sub=await r.pushManager.getSubscription()}catch(e){}
  add(sub&&isOn(),"Perangkat ini terdaftar menerima push","Tekan Aktifkan di Profil › Notifikasi › Pesan. Setiap perangkat yang ingin menerima notifikasi harus mengaktifkannya sendiri.");
  if(L.every(x=>x.ok)){
    try{const t=await u.getIdToken(),r=await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify({kind:"test"})}),j=await r.json().catch(()=>({}));
      const H={401:"Token ditolak: service account kemungkinan dari proyek Firebase lain.",503:"Variabel lingkungan Vercel belum lengkap. Isi lalu Redeploy.",500:"Error di server. Buka Vercel › Deployments › Logs untuk detailnya.",404:"Fungsi /api/notify tidak ditemukan. Redeploy dengan folder api/."};
      add(r.ok&&j.sent>0,r.ok?`Push uji dikirim ke ${j.sent||0} perangkat`:"Server mengirim push uji",r.ok?"Tidak ada langganan aktif. Matikan lalu aktifkan lagi notifikasi di perangkat ini.":(H[r.status]||`Status ${r.status}.`))}
    catch(e){add(false,"Server mengirim push uji","Tidak bisa menghubungi server.")}
  }
  return L}
