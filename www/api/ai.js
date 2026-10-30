/* Proxy Kili AI (Groq). Kunci disimpan di environment server (GROQ_API_KEY), tidak pernah dikirim ke browser. */
const GUIDE=`PANDUAN APLIKASI KISAH LILLAH (agenda Hijriah dan jurnal ibadah):
- Beranda: jadwal salat hari ini, tanggal Hijriah, progres ibadah, dan akses cepat ke menu.
- Absensi: catat ibadah harian dari agenda. Status: Terlaksana, Tidak terlaksana, Datang bulan, Khatam. Progres tercatat per hari.
- Rekap: statistik ibadah dan rentetan hari istiqamah (streak).
- Kalender: kalender Hijriah dan Masehi, serta hari-hari penting Islam.
- Shalat: jadwal salat sesuai lokasi (bisa memakai GPS), dengan pengingat adzan.
- Koleksi: Al-Qur'an (teks Arab dari Tanzil, terjemahan, transliterasi, audio, tema baca, mode per ayat atau mengalir, tajwid berwarna, bookmark per folder, dan riwayat terakhir baca), Hadits, Do'a, Dzikir, Kata Mutiara, dan Tasbih (bisa dijadikan melayang).
- Pesan: chat privat antar pengguna yang terenkripsi. Pengguna dicari lewat email Google.
- Profil: nama, foto, tema (ikuti perangkat, terang, gelap), koreksi tanggal Hijriah, tampilkan atau sembunyikan Tasbih melayang dan Kili AI, lokasi, notifikasi, dan login Google untuk sinkronisasi.
- Data disinkronkan ke akun Google saat sudah login. Aplikasi tetap bisa dipakai offline.
- Kamu tidak punya akses ke data pengguna selain yang diberikan di KONTEKS.`;
const SYSTEM=`Nama kamu Kili AI, asisten di aplikasi Kisah Lillah, ciptaan Kia (Muhammad Hilmi Azkia Rahman). Jawab dalam bahasa Indonesia yang santun, ramah, Islami, dan menenangkan. Jawaban ringkas dan rapi: pakai **tebal** untuk penekanan dan daftar "- " untuk poin. Untuk hukum agama yang rumit, sarankan bertanya kepada ustaz atau ulama. Jangan mengarang jadwal salat atau data pengguna; pakai KONTEKS jika tersedia. Jika ditanya cara memakai fitur, jelaskan berdasarkan panduan aplikasi.

${GUIDE}`;
const admin=require("firebase-admin");

/* Hanya pengguna yang sudah masuk (token Firebase valid) yang boleh memakai Kili AI.
   Mencegah layanan berbayar ini dipakai orang lain dan membatasi pengiriman konteks data pengguna. */
async function signedInUid(req){
  const tok=String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if(!tok)return null;
  try{
    if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});
    return (await admin.auth().verifyIdToken(tok)).uid;
  }catch(e){return null}
}

module.exports=async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return res.status(405).json({error:"Metode tidak diizinkan"});
  const key=process.env.GROQ_API_KEY;
  if(!key||!process.env.FIREBASE_SERVICE_ACCOUNT)return res.status(503).json({error:"Asisten AI belum dikonfigurasi di server"});
  if(!await signedInUid(req))return res.status(401).json({error:"Masuk dengan Google dulu untuk memakai Kili AI"});
  const msgs=(Array.isArray(req.body?.messages)?req.body.messages:[])
    .filter(m=>m&&(m.role==="user"||m.role==="assistant")&&typeof m.content==="string")
    .slice(-10).map(m=>({role:m.role,content:m.content.slice(0,2000)}));
  if(!msgs.length||msgs[msgs.length-1].role!=="user")return res.status(400).json({error:"Pertanyaan kosong"});
  const ctx=String(req.body?.context||"").slice(0,1500);
  try{
    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"openai/gpt-oss-120b",messages:[{role:"system",content:ctx?`${SYSTEM}\n\nKONTEKS SAAT INI:\n${ctx}`:SYSTEM},...msgs],temperature:0.6})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return res.status(502).json({error:"Layanan AI sedang tidak tersedia"});
    return res.status(200).json({reply:j.choices?.[0]?.message?.content||"Maaf, Kili AI belum bisa memberikan jawaban saat ini."});
  }catch(e){return res.status(502).json({error:"Tidak dapat terhubung ke layanan AI"})}
};
