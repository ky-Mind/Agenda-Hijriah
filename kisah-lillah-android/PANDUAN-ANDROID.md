# Aplikasi Android Kisah Lillah (native)

Sejak versi 5.1.0 Kisah Lillah adalah **aplikasi Android sungguhan**, bukan lagi Chrome yang dibungkus (TWA).
Seluruh tampilan (folder `../www`) **dikemas di dalam APK** dan ditampilkan oleh WebView milik aplikasi sendiri.
Berkas dilayani dengan alamat `https://agenda-hijriah.vercel.app/` sehingga data lokal, Firebase, dan fungsi `/api/`
(asisten AI, notifikasi pesan; lewat internet) tetap bekerja seperti di situs.

- Pembaruan tampilan web **perlu build APK baru** (`./build-apk.sh <versi>`). Data (absensi, pesan, profil) tetap dari cloud.
- Izin adalah izin aplikasi dan tampil di **Pengaturan HP › Aplikasi › Kisah Lillah › Izin**. Saat pertama dibuka,
  aplikasi meminta berurutan: notifikasi, lokasi, kamera, mikrofon, lalu **Alarm & pengingat** dan **abaikan pengoptimalan baterai**
  agar adzan tetap berbunyi walau aplikasi ditutup dan layar mati.
- Fitur Android asli lewat jembatan `KLAndroid` (`MainActivity.java`) dan `app/src/main/assets/kl-android.js`
  (disisipkan otomatis ke `index.html`, jadi kode web tidak perlu diubah):
  - **Widget layar utama**: *Jadwal Shalat Kisah Lillah* (4×3, kartu hijau, jam, hitung mundur, tanggal Masehi & Hijriah,
    kalimat pengingat, lima waktu shalat) dan *Pengingat Shalat* (2×1, bisa diperbesar; warna sesuai waktu shalat berikutnya,
    logo menyembul). Data dari `js/lib/widgetdata.js` (jadwal 7 hari), diperbarui sendiri tiap pergantian waktu.
  - **Adzan** (`res/raw/adzan.mp3`, `adzan_subuh.mp3`) sebagai alarm tepat waktu, mengikuti pengaturan Adzan di aplikasi
    (notifikasi / suara / waktu yang dimatikan). Bawaan pemasangan pertama: aktif. Dipasang ulang setelah HP menyala.
  - Notifikasi web (`Notification`) diarahkan ke notifikasi Android; getar tasbih, bagikan, warna bilah status mengikuti tema.
  - **Masuk dengan Google** memakai lembar akun Google bawaan Android (Google melarang masuk di WebView), lalu token dipakai Firebase. Bila gagal (mis. sidik jari belum didaftarkan), otomatis lewat tab Chrome (`www/masuk-app.html`) dan kembali ke aplikasi lewat `kisahlillah://masuk`. Facebook selalu lewat tab Chrome.
    Facebook memakai cara pengalihan halaman.
  - Tombol kembali: menutup dialog, naik ke halaman induk; di Beranda tekan dua kali untuk keluar.
  - Pintasan tekan-lama ikon: Isi absensi, Jadwal shalat, Al-Qur'an.

## Satu langkah di Firebase (agar Masuk dengan Google jalan)
Firebase Console › Project settings › Your apps › **Add app › Android**: paket `com.kisahlillah.app`, lalu tambahkan sidik jari:
- SHA-1: `29:06:96:9E:F9:EA:EE:B8:97:1C:ED:31:A1:56:46:EE:F1:22:9B:C8`
- SHA-256: `EA:89:02:99:94:01:89:73:A1:65:43:D5:C9:7C:7F:39:7F:E6:5E:02:16:0A:5F:81:D2:E5:96:44:B9:A7:95:FB`

## Belum ada di versi ini
- Notifikasi pesan baru saat aplikasi tertutup (Web Push tidak tersedia di WebView; perlu Firebase Cloud Messaging).

## Kunci penandatangan
Memakai kunci yang sama dengan APK TWA lama (`../twa/kisah-lillah.keystore`), jadi versi ini bisa dipasang menimpa 5.0.0.
`keystore.properties` dan keystore **tidak** ikut ke Git; simpan cadangannya.

## Membangun
    ./build-apk.sh 5.1.1        # JDK 21, Android SDK di ~/Android/Sdk

Kode: `MainActivity.java` (WebView, berkas dari APK, izin, foto, unduhan, masuk Google, jembatan), `Widget*.java` (widget),
`AdzanJadwal.java`, `AdzanReceiver.java`, `AdzanLayanan.java` (adzan), `Notifikasi.java` (saluran notifikasi).
