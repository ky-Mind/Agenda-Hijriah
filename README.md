# Kisah Lillah v4 · SPA modular, offline-first

Jalankan lokal (wajib lewat HTTP, bukan `file://`):

    npm start            # atau: python3 -m http.server 8080  → http://localhost:8080

## Upload ke Vercel (langkah singkat)
1. Ekstrak zip. **Isi folder ini (index.html, sw.js, vercel.json, dst.) harus berada di root repo GitHub**, bukan di dalam subfolder.
2. Commit & push ke branch `main`. Vercel otomatis deploy (Framework Preset: *Other*, Output Directory sudah diatur `.`).
3. Firebase Console › Authentication › Settings › **Authorized domains** › tambahkan domain Vercel Anda (mis. `agenda-hijriah-ky-mind1.vercel.app`) agar login Google berfungsi. Jika memakai domain khusus, tambahkan juga.
4. **Wajib sekali:** Firebase Console › Firestore Database › **Rules** › tempel isi `firestore.rules` › **Publish**. Tanpa ini sinkron menampilkan "Rules Firestore menolak" (aplikasi tetap menyimpan di perangkat dan otomatis mengirim begitu Rules benar). Di Profil › Akun Google ada tombol *Salin aturan*.
5. Bagikan **domain produksi** (bukan URL berhash tiap deployment).
6. Pengguna lama: sekali buka lalu muat ulang; cache versi lama dibersihkan otomatis.

## Deploy tanpa kehilangan API key
Konfigurasi Firebase ada di `firebase-config.js` (kunci web Firebase memang publik; keamanannya dari **Authorized domains** dan **firestore.rules**).
`scripts/verify-config.mjs` berjalan otomatis sebelum build:
1. File lengkap → **tidak diubah**, kunci Anda dipertahankan.
2. File kosong/rusak + variabel lingkungan `FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_APP_ID` (opsional `FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID`) → dibuat ulang.
3. Keduanya tidak ada → deploy dihentikan.

**Vercel**: import repo, tidak perlu pengaturan lain (`vercel.json` sudah memuat buildCommand + header cache).
**Firebase Hosting**: `firebase deploy` (memakai `firebase.json` dan `firestore.rules`).
Setelah deploy: Firebase Console › Authentication › aktifkan Google › tambahkan domain produksi di *Authorized domains*, lalu publikasikan `firestore.rules`.

## Offline
- Cangkang aplikasi (48 berkas) di-precache; aplikasi dibuka tanpa internet setelah dimuat sekali.
- Profil › Mode offline: unduh 114 surah dan jadwal shalat 3 bulan. Unduhan (`kl-data`) tidak terhapus saat aplikasi diperbarui.
- Hadits/font/Firebase SDK tersimpan otomatis setelah pernah dibuka. Absensi tersimpan lokal dan tersinkron saat online. Jadwal shalat dihitung lokal bila API tidak terjangkau.

## Struktur
`index.html` kerangka · `pages/*.html` + `js/pages/*.js` per halaman · `js/lib/` (hijri, prayer, geo, perm, onboard, adzan, ibadah, wa, avatar, offline, ui) · `js/store.js` + `js/sync.js` (localStorage ⇄ Firestore) · `sw.js` · `data/*.json` · `assets/`.

## Catatan
- Pengingat adzan berbunyi selama aplikasi terbuka; saat tertutup butuh server push (FCM).
- Periksa hak pakai audio adzan sebelum rilis publik.

## Sinkron desktop ⇄ ponsel
Masuk dengan **akun Google yang sama** di tiap perangkat. Data (absensi, catatan, daftar ibadah, tasbih, profil, foto) tersimpan lokal lebih dulu, lalu dikirim ke `users/{uid}/data/store` dan tampil realtime di perangkat lain. Gagal/offline: dicoba ulang otomatis; tombol *Sinkron sekarang* ada di Profil.
Data lama Agenda (`users/{uid}` dan `absensi_harian`) diimpor otomatis sekali per perangkat.
