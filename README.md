# Kisah Lillah

**Kisah Lillah** adalah Progressive Web App (PWA) statis berbahasa Indonesia untuk mencatat ibadah harian, membaca koleksi islami, melihat jadwal sholat, dan menggunakan kalender Hijriah.

> Catat ibadah, jaga istiqamah.

## Menjalankan secara lokal

Karena Google Login, service worker, dan beberapa API browser membutuhkan origin HTTP/HTTPS, jangan membuka `index.html` langsung melalui `file://`. Jalankan server statis, misalnya:

```bash
python3 -m http.server 8080
```

Kemudian buka `http://localhost:8080` dari direktori proyek.

## Struktur utama

| Lokasi | Fungsi |
| --- | --- |
| `index.html` | Shell aplikasi dan markup seluruh room utama |
| `css/` | Gaya dasar, tema, koleksi, UI premium, dan precision polish |
| `js/core.js` | State, navigasi room, agenda, profil lokal, dan lazy-load koleksi |
| `js/prayer-schedule.js` | Jadwal sholat, kalender Hijriah, kalender salat, dan kiblat |
| `js/pages/` | Modul Qur'an, Hadits, Do'a, Dzikir, Mutiara, dan Tasbih |
| `js/data/` | Data statis do'a dan quotes |
| `partials/` | Materi dzikir pagi dan petang |
| `sw.js` | Cache shell PWA dan notifikasi web |
| `firebase-config.js` | Konfigurasi Firebase client-side dan VAPID public key |
| `config.js` | Konfigurasi Supabase publishable key lama/opsional |

## Konfigurasi sebelum produksi

1. Pastikan Google Sign-In aktif di Firebase Authentication untuk project yang digunakan.
2. Tambahkan domain produksi ke Firebase Authorized domains.
3. Deploy menggunakan HTTPS. Google Login dan sebagian kemampuan notifikasi tidak dapat berjalan penuh dari `file://`.
4. Isi atau tinjau `firebase-config.js` dan `config.js`. Hanya konfigurasi client-side/public yang boleh berada di repository; jangan menambahkan service account, service role key, atau secret privat.
5. Jika memakai Supabase, jalankan `supabase.sql` pada SQL Editor Supabase.
6. Untuk notifikasi adzan otomatis ketika aplikasi tertutup, tetap diperlukan backend pengirim FCM/Cloud Functions. Timer lokal di browser bukan pengganti backend tersebut.

## Aset yang tidak tertanam dalam master prompt

Prompt sumber tidak membawa file biner asli. Agar proyek tetap dapat dimuat, paket ini berisi:

- `app-icon-client.png` dan `splash-client-reference.png`: placeholder visual valid yang dapat diganti dengan aset branding asli.
- `assets/audio/adzan.mp3` dan `assets/audio/adzan-subuh.mp3`: file audio placeholder berdurasi singkat. Ganti dengan rekaman adzan yang sesuai sebelum produksi.

File `kl-placeholder-assets.svg` adalah sumber desain placeholder dan boleh dihapus setelah aset branding asli tersedia.

## Pemeriksaan cepat

Validasi sintaks JavaScript dan JSON dapat dijalankan dengan:

```bash
for f in $(find js -name '*.js' -type f); do node --check "$f"; done
node -e "JSON.parse(require('fs').readFileSync('manifest.webmanifest')); JSON.parse(require('fs').readFileSync('js/data/doa.json')); JSON.parse(require('fs').readFileSync('js/data/quotes.json'))"
```

## Catatan data dan privasi

Data agenda, catatan pribadi, preferensi, serta riwayat baca pada source ini disimpan lokal di browser sesuai arsitektur offline-first. Login Firebase belum otomatis membuat seluruh data ibadah tersinkron lintas perangkat. Jangan menganggap data lokal sebagai cadangan cloud.

## Lisensi dan materi

Periksa hak penggunaan untuk aset ikon, audio adzan, teks Qur'an, hadits, dan materi pihak ketiga sebelum deployment publik. API eksternal dapat berubah atau menerapkan batas penggunaan.
