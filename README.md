## v5.26 — Firebase Cloud Messaging option

- Menambahkan konfigurasi **Firebase Web** untuk project `kisah-2cc70`.
- Menambahkan opsi **Notifikasi Firebase** di Pengaturan tanpa mengubah struktur room/navigasi.
- Menambahkan Firebase Cloud Messaging (FCM) ke service worker yang sudah dipakai aplikasi, sehingga notifikasi push dapat diterima ketika aplikasi berada di latar belakang.
- Token FCM disimpan lokal pada perangkat sebagai `aih_fcm_token_v1`; tidak ada service-account/private key yang dimasukkan ke frontend.
- Ikon notifikasi tetap memakai **`app-icon-client.png` / logo KL**.
- Fitur FCM baru aktif setelah **VAPID public key** diisi pada `firebase-config.js` / `AIH_FIREBASE_CONFIG.vapidKey`.
- FCM Web membutuhkan HTTPS/secure context. Firebase juga mensyaratkan Web Push credentials/VAPID untuk konfigurasi web yang benar. 
- Fitur notifikasi adzan lokal yang sudah ada tetap dipertahankan; Firebase ditambahkan sebagai jalur push, bukan mengganti struktur notifikasi lama.

### Setup Firebase sekali

1. Firebase Console → **Project settings → Cloud Messaging → Web Push certificates**.
2. Generate **Key pair** dan salin **public key (VAPID)**.
3. Buka `firebase-config.js` dan isi:
   `vapidKey: "PUBLIC_VAPID_KEY_DARI_FIREBASE"`
4. Deploy aplikasi melalui **HTTPS**.
5. Buka **Pengaturan → Notifikasi Firebase → Hubungkan**.
6. Setelah berhasil, token FCM tersimpan di perangkat dan dapat dipakai untuk pengujian push dari Firebase Console.

**Catatan:** mendapatkan token FCM saja belum membuat server otomatis mengirim adzan setiap hari. Untuk pengiriman adzan terjadwal ketika aplikasi benar-benar tidak aktif, diperlukan pengirim/server (misalnya Cloud Functions atau backend lain) yang mengirim pesan FCM berdasarkan jadwal salat pengguna.

## v5.25 — KL system notification implementation

- Sistem notifikasi adzan sekarang memakai **ikon KL yang sama** (`app-icon-client.png`) pada notifikasi perangkat.
- Format notifikasi direvisi menjadi **“Sholat Isya”** dengan isi **“19:05 adalah waktunya sholat Isya”** sesuai desain client.
- Notifikasi menyediakan aksi **Buka Kisah Lillah** dan ketika diketuk mencoba membuka/fokus kembali aplikasi.
- Menambahkan dukungan **Notification Triggers** sebagai best-effort untuk browser yang memang mendukung penjadwalan notifikasi sistem; browser lain memakai timer halaman sebagai fallback.
- MP3 adzan tetap hanya diputar ketika aplikasi/browser aktif karena browser web tidak menyediakan cara standar untuk menjadikan MP3 lokal sebagai suara notifikasi sistem.
- Tidak mengubah struktur room, navigasi, layout, atau fitur lain di luar notifikasi adzan.

## v5.23 — Light mode readability + Adhan notification client revision

- Memperbaiki **mode terang** pada hero Beranda dan hero Kalender Jadwal Salat agar latar menjadi terang dan seluruh teks tetap terbaca.
- Menonjolkan waktu salat yang akan datang pada grid tanpa mengubah susunan grid.
- Menambahkan pengaturan **Notifikasi adzan** dan **Suara adzan** di Pengaturan.
- Menambahkan permintaan izin notifikasi perangkat/browser.
- Menambahkan suara adzan utama dan suara khusus Subuh ke paket aplikasi.
- Menambahkan helper Service Worker untuk menampilkan notifikasi adzan pada browser/PWA yang mendukung.
- Suara MP3 diputar ketika aplikasi masih aktif dan browser mengizinkan playback. Notifikasi sistem browser tidak menyediakan API standar untuk memaksa file MP3 tertentu sebagai suara notifikasi.
- Fitur lama, struktur room, navigasi, dan desain mode gelap tidak diubah.

Agenda Hijriah — v5.13 Client Fix

## v5.13 — Profil Help & Quote / Theme / Media Fix

- Mempercantik panel **Bantuan & Informasi** tanpa mengubah struktur fitur Profil.
- Saat panel bantuan dibuka, ditambahkan backdrop yang mengunci interaksi/scroll halaman di belakang agar room tidak terlihat aktif atau dapat ditekan.
- Memperbaiki kontras seluruh teks, input, textarea, tombol kembali, tombol tutup, kartu bantuan, validasi, dan profil pembuat pada **mode terang**.
- Memperbaiki styling khusus mode gelap agar selector tema tidak lagi membuat input/textarea selalu memakai warna gelap ketika mode terang aktif.
- Laporan bug sekarang menerima **foto maupun video**, menampilkan preview sesuai tipe media, dan hanya mengaktifkan tombol kirim setelah nama, alasan minimal 10 karakter, serta media terdeteksi lengkap.
- Pada perangkat/browser yang mendukung Web Share API, laporan dibagikan bersama file foto/video sebagai lampiran. Pengguna dapat memilih WhatsApp dan mengirim ke **0895-0613-8191**. Jika browser tidak mendukung berbagi file, aplikasi tetap membuka WhatsApp dengan teks laporan sebagai fallback dan memberi instruksi untuk melampirkan media secara manual.
- Stok **Quotes hari ini** diselaraskan dengan item yang tersedia di halaman **Kata-kata Mutiara** dan koleksi terkait. Kutipan sebelumnya diingat agar kunjungan berikutnya tidak langsung menampilkan kutipan yang sama.
- Fitur, struktur room, navigasi, dan data aplikasi lain tidak diubah di luar permintaan client.

## v5.11 — Dzikir Pagi & Petang client revision

- Menghapus seluruh materi dzikir sesudah shalat dari halaman **Dzikir Pagi & Petang**.
- Memisahkan tampilan menjadi tab **Dzikir Pagi** dan **Dzikir Petang** di dalam halaman yang sama.
- Menambahkan teks Arab pada seluruh bacaan dzikir yang ditampilkan, beserta arti dan sumber/rujukan yang tersedia dari dokumen.
- Memperbaiki kontras teks Arab dan isi kartu pada mode gelap.
- Menghilangkan bottom navigation pada halaman Dzikir agar halaman fokus pada materi bacaan.
- Mengganti branding topbar yang sebelumnya menonjolkan “Absensi Ibadah Hijriah” menjadi **Kisah Lillah** sesuai identitas aplikasi.
- Struktur dan fitur aplikasi lain tidak diubah.



## v5.9 — Urutan koleksi & halaman internal

- Urutan Koleksi mengikuti penomoran client: **1 Al-Qur'an, 2 Hadits Nabi, 3 Kumpulan Do'a, 4 Dzikir Pagi & Petang, 5 Kata-kata Mutiara**.
- Kelima tombol sekarang benar-benar dapat ditekan dan membuka **halaman internal masing-masing**.
- Setiap halaman memiliki tombol kembali ke Koleksi.
- Tidak ada tombol Koleksi yang mengarahkan pengguna ke situs luar.
- Konten tiap halaman sengaja disiapkan sebagai ruang internal untuk diisi bertahap sesuai arahan client.
- Struktur fitur aplikasi lain tidak diubah.

# Agenda Hijriah — v4.9 Client Fix

Build ini mengubah tombol **Masuk dengan Google** dari tombol informasi menjadi alur Google OAuth sungguhan melalui **Supabase Auth**.

## Yang sudah dipasang

- Supabase JS v2 via CDN.
- `signInWithOAuth({ provider: "google" })`.
- Session persisten dan auto-refresh.
- Redirect kembali ke halaman aplikasi.
- Profil Google (nama/email/foto) masuk ke akun aplikasi.
- Profil dasar disinkronkan ke tabel `profiles`.
- RLS: pengguna hanya boleh membaca/menulis profil miliknya sendiri.
- Jika Supabase belum dikonfigurasi, aplikasi tidak berpura-pura login; ia memberi pesan setup.
- Tidak ada `service_role` atau Google Client Secret di frontend.

## Setup sekali sebelum deploy

### 1. Buat project Supabase

Buat satu project di Supabase.

### 2. Jalankan SQL

Buka **SQL Editor**, lalu jalankan seluruh isi `supabase.sql`.

### 3. Aktifkan Google Provider

Di Supabase buka Authentication > Providers > Google.

Buat OAuth Client di Google Cloud/Google Auth Platform dengan tipe **Web application**.

Authorized JavaScript origins:
- `https://genda-hijriah.vercel.app`
- tambahkan origin lain hanya jika memang dipakai.

Authorized redirect URI Google harus berupa callback Supabase:
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Masukkan Google Client ID dan Client Secret ke provider Google di Supabase.

### 4. Atur URL aplikasi di Supabase

Authentication > URL Configuration:

Site URL:
- `https://genda-hijriah.vercel.app/`

Redirect URLs:
- `https://genda-hijriah.vercel.app/`

Jika domain Vercel berubah, ganti URL di atas sesuai domain produksi.

### 5. Konfigurasi Supabase sudah diisi

`config.js` pada paket ini sudah berisi Project URL dan **Publishable Key** untuk project Supabase yang dipakai.

```js
window.AIH_SUPABASE_CONFIG = {
  url: "https://wbocuvvjbqldwffrgmf.supabase.co",
  key: "sb_publishable_40T6U9K509QoIb98WOgluQ_UREGA4ih",
  redirectTo: ""
};
```

`redirectTo: ""` membuat aplikasi otomatis kembali ke origin + path halaman aktif setelah OAuth.

**Catatan keamanan:** Publishable Key memang boleh berada di frontend. Jangan pernah memasukkan Google Client Secret atau `service_role` key ke `index.html`/`config.js`.

**Jangan** masukkan `service_role` key ke `config.js`.

### 6. Deploy ulang ke Vercel

Upload seluruh file:
- `index.html`
- `app-icon-client.png`
- `splash-client-reference.png`
- `config.js`
- `supabase.sql`
- `README.md`

Setelah deploy:
1. Buka halaman Profil.
2. Tekan **Masuk dengan Google**.
3. Pilih akun Google.
4. Google mengembalikan pengguna ke aplikasi.
5. Profil akan berubah menjadi **Google terhubung**.
6. Baris profil pengguna akan masuk ke `public.profiles`.

## Catatan penting

Login Google dan sinkronisasi profil sudah nyata setelah konfigurasi di atas. Data jurnal/absensi utama aplikasi masih memakai penyimpanan lokal pada build ini. Jadi login lintas perangkat **belum berarti seluruh riwayat ibadah otomatis berpindah perangkat**.

Tahap berikutnya, jika client sudah menyetujui login, adalah memindahkan records absensi, lokasi tersimpan, target ibadah, dan preferensi ke tabel Supabase dengan RLS per `auth.uid()`.

Referensi resmi:
- Supabase Google Login: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase OAuth redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase JavaScript signInWithOAuth: https://supabase.com/docs/reference/javascript/auth-signinwithoauth


## v4.4 — Kalender Jadwal Salat
- Menambahkan halaman khusus **Kalender Jadwal Salat 30 Hari** yang terpisah dari Kalender Hijriah.
- Jadwal mengikuti lokasi yang sama dengan modul Jadwal Sholat Hari Ini.
- Desktop memakai tabel 30 hari; mobile memakai kartu yang lebih nyaman disentuh.
- Kolom Hijriah, Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib, dan Isya dapat ditampilkan/disembunyikan melalui **Perlihatkan**.
- Data memakai endpoint kalender AlAdhan dengan metode aplikasi, cache perangkat 12 jam, dan fallback per hari bila endpoint kalender gagal.


## v4.8 — Client Fix

Perbaikan yang dikunci pada build ini:
- Tombol **Simpan** pada dialog **Kolom yang diperlihatkan** kini terhubung ke fungsi penyimpanan yang benar.
- Preferensi kolom kalender salat tetap tersimpan di perangkat.
- Kalender salat tetap interaktif: ketuk tanggal untuk membuka rincian waktu salat.
- Tombol **Lihat detail**, **Hari ini**, navigasi 30 hari, dan **Perbarui jadwal** tetap menggunakan alur data yang sama.
- Swipe horizontal hanya berlaku antar room utama: **Beranda ↔ Absensi ↔ Kalender ↔ Rekap ↔ Profil**.
- Swipe tidak mengambil alih tombol, input, modal, kalender salat, atau area tabel yang memang membutuhkan interaksi/scroll.
- Jika API jadwal salat tidak dapat diakses dari mode `content://`/offline, kalender menggunakan fallback perhitungan lokal sehingga tanggal tetap dapat ditekan dan rincian tetap muncul.


## v4.6 — Client Revision
- Kalender Jadwal Salat mobile dapat **di-swipe kiri/kanan** untuk berpindah 30 hari.
- Swipe kalender tidak lagi dianggap sebagai swipe antar-room; gesture kalender diprioritaskan di area kalender.
- Modal **Kolom yang diperlihatkan** dan detail tanggal mengunci scroll/tap halaman di belakang.
- Kartu daftar jadwal panjang di bawah kalender disembunyikan agar tampilan fokus pada kalender + **Lihat detail**.
- Tombol **Perbarui jadwal** yang redundan dihilangkan dari tampilan.
- Tombol lokasi di Kalender Salat berubah menjadi **Titik lokasi saya** dan meminta koordinat GPS perangkat, lalu memuat ulang jadwal berdasarkan latitude/longitude tersebut.
- Profil dibuat ringkas. Tombol akun di kanan atas membuka panel akun dengan kontrol edit, ganti foto, login Google, ganti/tambah akun, serta tombol tutup.
- Swipe antar-room tetap berlaku untuk **Beranda → Absensi → Kalender → Rekap → Profil**.


## v4.8 — Client Polish

Perubahan pada revisi client:
- Tombol akun kanan atas di luar halaman Profil hanya membuka halaman Profil; tidak langsung membuka editor akun.
- Di halaman Profil, tombol akun kanan atas menjadi satu-satunya akses ke pengeditan akun.
- Panel akun hanya memakai tombol `×` untuk keluar; tombol keluar tambahan dihapus.
- Halaman Profil dipadatkan dengan menghapus tombol pengelolaan yang redundant.
- Informasi metadata jadwal sholat dibuat lebih ringkas.
- Tombol pengaturan lokasi dipindahkan ke bawah kompas kiblat.
- Swipe kalender jadwal sholat diperhalus dan diberi transisi yang lebih lembut.
- Modal kolom kalender mengunci scroll/gesture halaman belakang dan tetap mengizinkan scroll di dalam modal.
- Ketuk tanggal kalender sekarang hanya memilih tanggal. Detail waktu baru dibuka setelah menekan `Lihat detail`.
- Tombol `Titik lokasi saya` memakai geolocation perangkat dengan retry lokasi jaringan dan pesan kegagalan yang lebih jelas. Geolocation browser tetap membutuhkan HTTPS/secure context pada perangkat yang mendukungnya.


## v4.9 — Client Requested Fixes

- Swipe antar halaman dibuat lebih halus dan berbatas: di ujung pertama/terakhir tidak lagi membuka area kosong atau membuat halaman terlempar terlalu jauh.
- Saat swipe, halaman sebelumnya/berikutnya ikut terlihat sebagai preview, lalu masuk penuh setelah gesture melewati ambang.
- Kalender Hijriah: memilih tanggal hanya mengubah tanggal yang terseleksi; tidak lagi langsung masuk ke Absensi.
- Akses ke Absensi dari kalender sekarang melalui tombol konfirmasi **Lihat keterangan**.
- Kalender Jadwal Salat dibuat date-first: keterangan waktu salat di dalam kotak tanggal dihilangkan.
- Tombol **Perlihatkan** pada bagian atas kalender salat dihilangkan sesuai revisi client.
- Detail waktu tetap tersedia melalui tombol **Lihat keterangan** setelah tanggal dipilih.
- Bagian **Aktivitas Kebaikan** dan **Akun & Sinkronisasi** yang diminta client dihilangkan dari halaman Profil.
- Tidak ada perubahan struktur fitur lain di luar poin revisi client.


## Kisah Lillah — App Launch Splash
- Menambahkan tampilan pembuka aplikasi mengikuti referensi client: logo KL, nama **Kisah Lillah**, tagline **Catat ibadah, jaga istiqamah.**, dan kredit **from Wishxiauw**.
- Splash hanya berada di layar pembuka dan otomatis menghilang sebelum aplikasi utama digunakan.
- Struktur dan fitur aplikasi utama tidak diubah.


## v5.1 — Client requested fixes
- Countdown jadwal salat now changes label/state when the latest prayer has just passed.
- Dashboard quote section renamed to “Quotes hari ini” with date-based daily quote.
- Mobile prayer calendar shows a comfortable 10-date window and swipes by 10 dates with smoother motion.
- Absensi title is now “Agenda”; added Edit Agenda flow with reorder/add/remove.
- Agenda status buttons can be edited (emoji + text) and custom categories can be created.
- “Kalender Hijriah” heading simplified to “Kalender”.
- Bottom navigation “Rekap” replaced by “Koleksi” for doa, hadits, and mahfudzot.
- Recap moved into the Profile room with a compact summary and full recap access.
- App icon added to desktop sidebar branding plus favicon/apple-touch icon.
- Added aesthetic Settings room with light/dark mode; dark mode uses the splash-screen dark palette.


## v5.2 — Client Fix lanjutan
- Kalender Jadwal Salat di mobile tetap memakai jendela 10 hari, tetapi bentuk kartu tanggal diselaraskan dengan kalender utama.
- Swipe kalender salat dibuat mengikuti pola swipe kalender utama: drag horizontal langsung mengikuti jari, lalu berpindah 10 hari dengan animasi halus.
- Tombol pengaturan di topbar dihilangkan; pengaturan tetap tersedia dari halaman Profil.
- Chip profil di topbar kini hanya menampilkan foto dan nama, tanpa panah/akses popover akun.
- Judul Profil tidak lagi memakai kata "Komunitas".
- Bagian "Pengaturan cepat" diganti menjadi "Catatan pribadi" dengan penyimpanan lokal di perangkat.
- Mode gelap diperkuat dengan latar dan surface hijau gelap yang mengikuti nuansa ikon aplikasi, termasuk kontras teks, kartu, input, kalender, dan modal.
- Countdown waktu salat mempertahankan perilaku sebelumnya, dengan label yang lebih jelas saat waktu baru saja lewat vs sedang menuju waktu berikutnya.

## v5.3 — client fixes

- Memperbaiki kontras teks/kartu pada mode gelap di dashboard, absensi, lokasi, dan kalender.
- Memperbaiki bug setelah menutup pengaturan mode gelap yang sebelumnya dapat membuat layar tidak bisa disentuh.
- Menjadikan catatan pribadi sebagai daftar catatan yang dapat dibuat, diedit, dihapus, dan tersimpan per akun di perangkat.
- Mempercantik area tombol simpan absensi dan simpan lokasi tanpa mengubah struktur fitur.


## v5.5 — Client privacy, collection, typography & responsive fixes
- Panel **Kelola akun** dipindahkan ke tengah layar pada mobile dan desktop, dengan overlay privat agar konten di belakang tidak mengganggu saat mengedit data akun.
- Area **Koleksi** tidak lagi menampilkan kartu detail kosong di bagian paling bawah; diganti kumpulan tombol sumber Islami yang berguna: Al-Qur'an Indonesia, Do'a Harian, Hadits, Puasa Sunnah, Qur'an + Tafsir, dan daftar API Islam.
- Sumber referensi koleksi mengikuti bagian **Agama Islam** dari Daftar API Lokal Indonesia.
- Kontras teks pada kartu **Quotes hari ini** diperbaiki agar lebih mudah dibaca pada mode terang dan gelap.
- Splash **Kisah Lillah** memakai mode contain agar proporsinya tetap sesuai pada layar desktop dan perangkat dengan rasio layar berbeda.
- Mode gelap diperketat pada komponen yang sebelumnya masih dapat tampil putih, tanpa mengubah struktur fitur lain.

\n\n## v5.7 — Client follow-up
- Splash client reference now fills the viewport responsively using aspect-ratio-aware cover behavior, removing side gutters on desktop and mobile.
- Collection buttons remain in the existing Koleksi structure but open internal reading views instead of leaving the app.
- Added internal Quran reader with 114 surahs, 30-juz navigation, Arabic text, Latin transliteration when supplied by the API, Indonesian translation, ayah audio playback, and audio download.
- Added in-page search for Quran content and preserved the existing search/navigation behavior for the other collection readers.
- Desktop collection content uses the available page width to reduce unused empty space without changing the app navigation or feature structure.


### v5.10 client follow-up
- Brand text changed from “Absensi Ibadah Hijriah” to “Kisah Lillah”.
- Dzikir Pagi & Petang page populated from the supplied `zikir-selepas-solat-dan-pagi-petang.pdf` text content; cover/images omitted.
- Mobile bottom navigation is hidden while the dedicated dzikir reader is open.


## Firebase Google Login — v5.26 KL backend fix

Google Login pada aplikasi sekarang menggunakan **Firebase Authentication** project `kisah-2cc70`, bukan Supabase Auth.

Frontend/UI aplikasi tidak dirombak. Perubahan backend/integrasi:
- Firebase Auth compat ditambahkan.
- Google Sign-In memakai `GoogleAuthProvider`.
- Login mencoba popup terlebih dahulu dan fallback ke redirect bila popup diblokir.
- Session dipantau dengan `onAuthStateChanged`.
- Logout menggunakan Firebase Authentication.
- FCM VAPID public key sudah ditempatkan di `firebase-config.js`.

### Firebase Console yang wajib diselesaikan

1. Firebase Console → Authentication → Sign-in method → aktifkan **Google**.
2. Authentication → Settings → Authorized domains → tambahkan domain produksi Vercel, misalnya `nama-project.vercel.app`, serta domain custom jika ada.
3. Pastikan project yang dipakai adalah **kisah-2cc70**.
4. Deploy ZIP ini ke GitHub lalu hubungkan repository ke Vercel.
5. Tes login Google dari domain HTTPS Vercel, bukan dari `file://`.

Tidak perlu menghapus project Vercel lama sebelum deployment baru terbukti bekerja.


### Catatan deployment v5.26 — konfigurasi Firebase web

Paket ini adalah aplikasi web statis. Konfigurasi browser Firebase yang dipakai runtime berasal dari `firebase-config.js` melalui `AIH_FIREBASE_CONFIG`; Firebase Web memang menggunakan konfigurasi client-side ini. Environment Variables Vercel yang bernama `VITE_FIREBASE_*` tidak otomatis menggantikan nilai tersebut karena paket ini tidak memakai proses build Vite. Jangan menghapus `firebase-config.js`.

Untuk Google Login, pastikan di Firebase Console project `kisah-2cc70`:
- Authentication → Sign-in method → Google aktif.
- Authentication → Settings → Authorized domains berisi domain Vercel produksi yang digunakan.
- Aplikasi diakses melalui HTTPS.

Untuk FCM Web, `vapidKey` pada `firebase-config.js` adalah public VAPID key dan dapat berada di client. Service worker `sw.js` memakai konfigurasi yang sama.
