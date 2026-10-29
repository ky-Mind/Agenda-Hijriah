# Widget layar utama Kisah Lillah (Android & iPhone)

Aplikasi web dibungkus dengan Capacitor. Widget ditulis native dan membaca data yang ditulis aplikasi web.

Folder `www/` berisi seluruh aplikasi web dan menjadi root deploy (Vercel/Firebase Hosting). Saat build native, `scripts/build-native.mjs` menyalin `www/` ke `app-www/` tanpa `api/` dan konfigurasi deploy.

## Alur data
1. `js/lib/widgetdata.js` menghitung jadwal shalat 7 hari ke depan dan memilih kalimat dari `data/widget-messages.json`.
2. Hasilnya dikirim ke plugin native `KLWidget` (`pushWidget()`), dipanggil saat aplikasi dibuka dan saat lokasi atau data berubah.
3. Android menyimpan JSON di SharedPreferences, iPhone menyimpannya di App Group UserDefaults.
4. Widget memilih shalat berikutnya dan kalimat yang berlaku, lalu menggambar ulang tepat saat waktu shalat tiba.

Kalimat pengingat (misalnya "Jaga istiqomah") ada di `data/widget-messages.json`. Ubah teksnya di sana, lalu jalankan build ulang.

## Membangun
```
npm run native
npx cap open android   # atau: npx cap open ios
```

## Android (sudah ditambahkan)
- `android/app/src/main/java/com/kisahlillah/app/KLWidgetPlugin.java`
- `android/app/src/main/java/com/kisahlillah/app/widget/KLWidgetProvider.java`
- `res/layout/kl_widget.xml`, `res/xml/kl_widget_info.xml`, `res/drawable/kl_widget_bg.xml`
- Receiver sudah didaftarkan di `AndroidManifest.xml`. Build di Android Studio, lalu tambahkan widget "Kisah Lillah" dari layar utama.

## iPhone (perlu langkah di Xcode, di Mac)
1. Buka `ios/App/App.xcodeproj`.
2. Tambahkan file `ios/App/App/KLWidgetPlugin.swift` ke target **App**.
3. File > New > Target > **Widget Extension**, beri nama `KLWidget`. Tambahkan file di folder `ios/App/KLWidget/` ke target itu (ganti file template yang dibuat Xcode). Target minimal iOS 17.
4. Di kedua target (App dan KLWidget), buka Signing & Capabilities, tambahkan **App Groups**, lalu centang `group.com.kisahlillah.app`. Nama grup harus sama dengan `KLWidgetShared.group`.
5. Build dan jalankan di perangkat. Tambahkan widget dari layar utama.

## Catatan
- Bundle ID `com.kisahlillah.app` adalah nilai awal di `capacitor.config.json`. Ganti dengan ID milikmu sebelum publikasi.
- Kode native ini ditulis tanpa dikompilasi di sini (Android SDK dan Xcode belum terpasang di mesin pengembangan). Jika ada error saat build, kirim pesannya.
- Notifikasi push dan login Google di dalam WebView belum diuji. Service worker tidak dipakai di aplikasi native.
