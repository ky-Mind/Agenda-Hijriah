# Agenda Hijriah — v4.3 Google OAuth Ready (Supabase Configured)

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
