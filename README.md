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
