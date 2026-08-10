# Absensi Ibadah Hijriah v3.7 — Client Preferred UX

Revisi fokus pada masukan client:
1. Kalender mobile dikembalikan ke tampilan kalender bulanan/grid seperti versi sebelumnya.
2. Tanggal Hijriah dan Masehi tetap ditampilkan jelas di setiap kotak.
3. Lokasi memiliki tombol **Simpan lokasi** yang terlihat jelas.
4. Tombol "Ganti" yang membingungkan diganti menjadi **Reset lokasi**.
5. Alur GPS tetap memiliki fallback Kota/manual agar aplikasi tidak buntu saat dibuka dari content:// atau file lokal.
6. Tombol simpan lokasi manual/link memakai alur validasi yang sama dengan versi sebelumnya.

Catatan:
- GPS dan sensor kompas pada browser/file lokal dapat dibatasi oleh keamanan browser.
- Untuk GPS/sensor live, gunakan Preview/Local Server atau HTTPS.
- Jika GPS tidak tersedia, Kota atau koordinat manual tetap dapat digunakan.


## v3.9 — Modal Focus Lock
- Room/modal lokasi sekarang mengunci interaksi halaman di belakangnya.
- Tap, swipe, wheel, dan gesture pada backdrop tidak menembus ke halaman utama.
- Scroll tetap bisa dilakukan di dalam room lokasi.
- Fokus keyboard diarahkan ke kontrol di dalam room dan Tab tetap berada di dalam modal.
- Body scroll dikunci selama room lokasi terbuka.
- Tombol **💾 Simpan & gunakan lokasi** tetap menjadi aksi utama.
