# 🌙 Kisah Lillah — Agenda Hijriah & Jurnal Ibadah

<p align="center">
  <strong>Catat ibadah, jaga istiqamah.</strong>
  <br />
  Teman digital untuk menemani perjalanan ibadah dan keseharian Muslim.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web%20App-3f6b5a?style=for-the-badge" alt="Platform Web App" />
  <img src="https://img.shields.io/badge/PWA-Ready-5b806b?style=for-the-badge" alt="Progressive Web App" />
  <img src="https://img.shields.io/badge/Language-Indonesia-2563eb?style=for-the-badge" alt="Bahasa Indonesia" />
  <img src="https://img.shields.io/badge/Focus-Islamic%20Lifestyle-94754a?style=for-the-badge" alt="Islamic Lifestyle" />
</p>

---

## ✨ Tentang Kisah Lillah

**Kisah Lillah** adalah aplikasi web bernuansa Islami yang dirancang untuk membantu pengguna menjalani keseharian dengan lebih teratur, mencatat ibadah, dan membangun kebiasaan baik secara bertahap.

Dengan menggabungkan agenda Hijriah, jurnal ibadah, akses materi Islami, dan fitur komunikasi privat, Kisah Lillah berupaya menjadi teman digital untuk perjalanan menuju istiqamah.

Aplikasi ini dirancang dengan pendekatan **Progressive Web App (PWA)** dan *offline-first*, serta menggunakan Firebase untuk fitur yang membutuhkan autentikasi dan sinkronisasi data.

> *Satu langkah kecil setiap hari. Satu niat baik dalam setiap perjalanan. Semoga setiap ikhtiar menjadi jalan mendekat kepada Allah.*

## 🌿 Fitur Unggulan

### 🗓️ Agenda dan Kalender Hijriah

Membantu pengguna melihat tanggal dan mengatur kegiatan dalam keseharian dengan nuansa kalender Islami.

### 🤲 Jurnal Ibadah Harian

Mendukung pencatatan aktivitas ibadah untuk membantu membangun kebiasaan yang lebih konsisten dan terarah.

### 🕌 Jadwal Salat

Akses bagian jadwal salat untuk membantu pengguna mengatur waktu dan rutinitas ibadah.

### 📖 Al-Qur'an, Hadis, Doa, dan Dzikir

Menyediakan akses ke berbagai materi Islami sebagai pendamping aktivitas harian.

### 💬 Pesan Privat Realtime

Pengguna dapat mencari pengguna lain melalui email Google, mengirim permintaan percakapan, dan mulai mengobrol setelah permintaan diterima.

### 🔐 Enkripsi Pesan

Pesan menggunakan teknologi kriptografi Web Crypto API dengan:

* ECDH P-256 untuk pertukaran kunci.
* AES-GCM untuk enkripsi pesan.
* PBKDF2 untuk membantu melindungi kunci dengan PIN.
* IndexedDB untuk penyimpanan kunci lokal pada perangkat.

Tersedia pula kode keamanan percakapan untuk membantu pengguna membandingkan kunci secara langsung.

### 🔔 Notifikasi Pesan

Dukungan Web Push dapat dikonfigurasi agar pengguna menerima pemberitahuan pesan baru ketika aplikasi tidak sedang dibuka.

### ⏳ Pengelolaan Masa Simpan Pesan

Mendukung pengaturan masa simpan pesan dan penghapusan otomatis melalui kebijakan TTL Firestore setelah dikonfigurasi.

### 📱 Progressive Web App

Aplikasi memiliki manifest dan dukungan service worker untuk pengalaman penggunaan yang menyerupai aplikasi pada perangkat yang kompatibel.

### 🎨 Tampilan Responsif dan Tema

Dirancang untuk digunakan melalui ponsel maupun desktop, dengan pilihan tema yang dapat mengikuti preferensi sistem.

### 📴 Pendekatan Offline-First

Sebagian pengalaman aplikasi dapat didukung oleh cache lokal. Fitur yang memerlukan Firebase, jaringan, atau layanan eksternal tetap membutuhkan koneksi yang sesuai.

---

## 🧰 Teknologi yang Digunakan

| Teknologi               | Fungsi                                 |
| ----------------------- | -------------------------------------- |
| HTML                    | Struktur halaman aplikasi              |
| CSS                     | Desain dan tampilan responsif          |
| JavaScript              | Logika dan interaksi aplikasi          |
| Firebase Authentication | Autentikasi pengguna                   |
| Cloud Firestore         | Penyimpanan dan sinkronisasi data      |
| Web Crypto API          | Operasi kriptografi dan enkripsi pesan |
| IndexedDB               | Penyimpanan lokal pada perangkat       |
| Service Worker          | Dukungan cache dan fitur PWA           |
| Web Push                | Notifikasi pesan                       |
| Node.js                 | Menjalankan skrip pendukung proyek     |
| Vercel                  | Hosting dan fungsi serverless          |

## 🚀 Menjalankan Proyek Secara Lokal

### Persyaratan

Pastikan perangkat sudah memiliki:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) versi 20 atau lebih baru
* Python 3 untuk server lokal sederhana
* Proyek Firebase jika ingin menguji fitur yang terhubung ke Firebase

### 1. Clone repositori

Buka terminal, lalu jalankan:

```bash
git clone https://github.com/ky-Mind/Agenda-Hijriah.git
cd Agenda-Hijriah
```

### 2. Periksa konfigurasi Firebase

Aplikasi menggunakan file `firebase-config.js` untuk konfigurasi Firebase sisi klien.

Jika menggunakan proyek Firebase sendiri, sesuaikan nilainya melalui Firebase Console → Project settings → Your apps.

Alternatifnya, skrip verifikasi mengenali variabel lingkungan berikut ketika konfigurasi belum lengkap:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

Isi dengan nilai dari proyek Firebase milikmu. Aktifkan metode autentikasi yang digunakan aplikasi dan pastikan aturan Firestore telah dikonfigurasi.

### 3. Verifikasi konfigurasi

```bash
npm run verify
```

Perintah tersebut memeriksa apakah konfigurasi Firebase tersedia dan valid untuk pemeriksaan dasar proyek.

### 4. Jalankan aplikasi

Gunakan server lokal Python:

```bash
python3 -m http.server 8080
```

Buka alamat berikut melalui browser:

```text
http://localhost:8080
```

**Catatan:** Gunakan server lokal atau HTTPS untuk menguji autentikasi, service worker, dan notifikasi. Membuka file HTML secara langsung melalui `file://` tidak cocok untuk pengujian semua fitur.

---

## ☁️ Deployment

### Menggunakan Vercel

1. Buka [Vercel](https://vercel.com/).
2. Impor repositori `ky-Mind/Agenda-Hijriah`.
3. Pastikan konfigurasi Firebase tersedia.
4. Atur perintah build menjadi `npm run build` jika konfigurasi proyek memerlukannya.
5. Jalankan deployment.
6. Uji aplikasi melalui alamat HTTPS hasil deployment.

### Menggunakan Firebase Hosting

Proyek menyediakan file `firebase.json` untuk konfigurasi Firebase Hosting.

Setelah Firebase CLI terpasang dan proyek yang benar dipilih, jalankan:

```bash
firebase deploy
```

Sebelum aplikasi dipublikasikan, pastikan aturan Firestore, domain autentikasi, dan konfigurasi layanan sudah sesuai.

---

## 🔔 Konfigurasi Notifikasi Pesan

Fitur notifikasi di latar belakang memerlukan konfigurasi tambahan pada Firebase dan Vercel.

### Langkah konfigurasi

1. Publikasikan aturan dari `firestore.rules` melalui Firebase Console → Firestore → Rules.

2. Buat private key service account melalui Firebase Console → Project settings → Service accounts.

3. Simpan kredensial tersebut dengan aman. Jangan pernah memasukkannya ke dalam commit.

4. Buat pasangan kunci VAPID:

   ```bash
   npm run vapid
   ```

5. Tambahkan variabel lingkungan berikut pada Vercel:

   * `FIREBASE_SERVICE_ACCOUNT`
   * `VAPID_PUBLIC_KEY`
   * `VAPID_PRIVATE_KEY`
   * `VAPID_SUBJECT`

   Contoh format subject: `mailto:emailanda@gmail.com`.

6. Redeploy aplikasi.

7. Buka Profil → Pesan → Notifikasi pesan di latar belakang.

8. Aktifkan fitur dan jalankan pengujian.

Notifikasi dirancang untuk mengirim pemberitahuan umum, bukan isi pesan percakapan.

Pada perangkat iOS, Web Push memerlukan versi sistem yang mendukungnya dan aplikasi ditambahkan ke layar utama.

### Penghapusan pesan otomatis

Untuk mengaktifkan penghapusan berdasarkan masa simpan, buat kebijakan Time-to-live (TTL) di Firestore:

* Collection group: `messages`
* Field TTL: `expireAt`

Pastikan kebijakan dan struktur data sudah sesuai sebelum mengandalkan penghapusan otomatis.

---

## 🔐 Privasi dan Keamanan

Keamanan dan privasi merupakan bagian penting dari Kisah Lillah.

* **Enkripsi pesan:** isi pesan dienkripsi pada sisi pengguna menggunakan mekanisme kriptografi aplikasi.
* **Metadata komunikasi:** informasi seperti pihak yang berkomunikasi dan waktu aktivitas masih dapat terlihat oleh layanan penyimpanan.
* **Perlindungan kunci:** PIN digunakan untuk membantu melindungi kunci pesan.
* **Pemulihan pesan:** jika PIN terlupa dan kunci dibuat ulang, pesan lama yang bergantung pada kunci sebelumnya mungkin tidak dapat dibuka kembali.
* **Kredensial server:** file service account dan `VAPID_PRIVATE_KEY` harus dirahasiakan.
* **Keamanan database:** konfigurasi Firebase publik bukan pengganti aturan keamanan Firestore yang benar.
* **Keamanan domain:** batasi domain autentikasi dan akses layanan sesuai kebutuhan aplikasi.

Jangan pernah membagikan PIN, kredensial server, token autentikasi, atau data pribadi melalui laporan masalah publik.

## 🗺️ Arah Pengembangan

Kisah Lillah dapat terus dikembangkan melalui beberapa arah berikut:

* [ ] Penyempurnaan pengalaman pengguna pada ponsel dan desktop.
* [ ] Peningkatan aksesibilitas dan konsistensi tampilan.
* [ ] Pengujian fitur offline pada berbagai browser.
* [ ] Dokumentasi teknis untuk setiap modul.
* [ ] Peningkatan pengujian keamanan dan aturan akses data.
* [ ] Penyempurnaan panduan instalasi dan kontribusi komunitas.

Daftar ini merupakan rencana pengembangan dan bukan pernyataan bahwa seluruh fitur tersebut sudah tersedia.

## 🤝 Kontribusi

Punya ide, menemukan bug, atau ingin membantu pengembangan Kisah Lillah? Kontribusi sangat terbuka.

1. Fork repositori ini.

2. Buat branch baru:

   ```bash
   git checkout -b fitur/nama-fitur
   ```

3. Lakukan perubahan dan uji secara lokal.

4. Commit perubahan:

   ```bash
   git add .
   git commit -m "feat: deskripsi perubahan"
   ```

5. Push branch dan ajukan Pull Request.

Untuk laporan masalah, sertakan langkah reproduksi, browser atau perangkat yang digunakan, dan tangkapan layar jika relevan. Pastikan tidak ada informasi rahasia dalam laporan.

## 📄 Lisensi

Lisensi penggunaan dan distribusi perlu mengikuti file lisensi resmi yang ditetapkan oleh pemilik repositori. Jika belum ada file `LICENSE`, silakan hubungi pemilik proyek sebelum menggunakan atau mendistribusikan ulang kode.

---

<p align="center">
  <strong>Kisah Lillah</strong>
  <br />
  <em>Menata hari, mencatat ikhtiar, menjaga istiqamah.</em>
  <br /><br />
  Dibangun dengan niat baik untuk menemani perjalanan menuju kebaikan. 🌙
  <br /><br />
  <a href="https://github.com/ky-Mind/Agenda-Hijriah">GitHub Repository</a>
</p>

## Jika notifikasi latar belakang belum muncul
Buka **Profil › Notifikasi › Pesan › Periksa**. Aplikasi memeriksa tiap langkah dan menunjukkan yang gagal beserta cara memperbaikinya:
browser mendukung, sudah login, izin notifikasi, service worker, fungsi `/api` ter-deploy, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `FIREBASE_SERVICE_ACCOUNT` (valid dan satu proyek dengan aplikasi), perangkat terdaftar, lalu push uji ke server.
Catatan: **setiap perangkat penerima** harus menekan *Aktifkan* sendiri. Setelah mengisi variabel di Vercel wajib **Redeploy**. iPhone: pasang ke layar utama dulu (iOS 16.4+).

## Pesan tanpa internet: apa yang mungkin
- **Bisa**: membuka aplikasi, membaca riwayat chat yang sudah termuat, dan menulis pesan saat offline. Pesan antre (ikon 🕓) lalu terkirim otomatis begitu internet kembali (Firestore persistence aktif di `firebase-config.js`).
- **Tidak bisa** (batas web/PWA): mengirim pesan antar dua ponsel tanpa internet sama sekali. Browser tidak punya akses radio Bluetooth/Wi-Fi Direct/SMS untuk itu. Untuk itu dibutuhkan aplikasi Android native.
