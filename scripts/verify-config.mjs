/* Penjaga konfigurasi: dijalankan sebelum deploy (Vercel buildCommand / npm run verify).
   1) Jika firebase-config.js sudah lengkap -> TIDAK diubah (kunci Anda dipertahankan).
   2) Jika kosong/rusak tetapi variabel lingkungan FIREBASE_* tersedia -> dibuat ulang otomatis.
   3) Jika keduanya tidak ada -> deploy dihentikan agar tidak merilis aplikasi tanpa Firebase. */
import {readFileSync,writeFileSync,existsSync} from "node:fs";
const F="firebase-config.js",K=["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"],NEED=["apiKey","authDomain","projectId","appId"];
const ENV={apiKey:"FIREBASE_API_KEY",authDomain:"FIREBASE_AUTH_DOMAIN",projectId:"FIREBASE_PROJECT_ID",storageBucket:"FIREBASE_STORAGE_BUCKET",messagingSenderId:"FIREBASE_MESSAGING_SENDER_ID",appId:"FIREBASE_APP_ID"};
const fromFile=()=>{if(!existsSync(F))return{};const s=readFileSync(F,"utf8"),o={};for(const k of K){const m=new RegExp(k+"\\s*:\\s*\"([^\"]+)\"").exec(s);if(m)o[k]=m[1]}return o};
const ok=o=>NEED.every(k=>o[k]&&!/^(YOUR|GANTI|xxx)/i.test(o[k]));
const cur=fromFile();
if(ok(cur)){console.log(`✔ ${F} lengkap (project: ${cur.projectId}). Konfigurasi dipertahankan.`);process.exit(0)}
const env={};for(const k of K)if(process.env[ENV[k]])env[k]=process.env[ENV[k]];
if(!ok(env)){console.error(`✖ ${F} belum lengkap dan variabel FIREBASE_* tidak ditemukan. Lengkapi file atau atur variabel lingkungan di hosting.`);process.exit(1)}
writeFileSync(F,`/* Dibuat otomatis dari variabel lingkungan oleh scripts/verify-config.mjs. Kunci web Firebase bersifat publik; batasi dengan domain & aturan Firestore. */
window.KL_FIREBASE = ${JSON.stringify(env,null,2)};
try {
  if (window.firebase) {
    window.__klApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.KL_FIREBASE);
    window.__klAuth = firebase.auth();
    window.__klDb = firebase.firestore();
  }
} catch (e) { console.warn("Firebase gagal dimulai", e); }
`);console.log(`✔ ${F} dibuat dari variabel lingkungan.`);
