package com.kisahlillah.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.Settings;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.Toast;
import android.window.OnBackInvokedDispatcher;

import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;

import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Aplikasi Kisah Lillah (native). Seluruh tampilan (folder www/) dikemas di dalam APK (assets/www) dan ditampilkan
 * WebView milik aplikasi sendiri, bukan Chrome. Berkas dilayani dengan alamat https://agenda-hijriah.vercel.app/
 * agar data lokal, Firebase, dan API /api/ (Vercel, lewat internet) tetap bekerja seperti di situs.
 * Fitur Android asli lewat jembatan JavaScript "KLAndroid" (kelas Jembatan) dan assets/kl-android.js.
 */
public class MainActivity extends Activity {
    static final String HOST = "agenda-hijriah.vercel.app";
    static final String AWAL = "https://" + HOST + "/";
    /** ID klien Web Google proyek Firebase kisah-2cc70 (untuk token yang dikenali Firebase) */
    private static final String KLIEN_WEB = "417572719269-k12o1h8upjbmbk7ub754nv32och3c1j7.apps.googleusercontent.com";

    private static final int RQ_IZIN_AWAL = 14, RQ_IZIN_WEB = 11, RQ_IZIN_LOKASI = 12, RQ_IZIN_NOTIF = 13, RQ_FILE = 21;

    private WebView web;
    private View stripAtas, stripBawah;
    private int warnaAtas = 0xFFF4F3EE, warnaBawah = 0xFFF4F3EE;

    private ValueCallback<Uri[]> pilihFile;
    private Uri fotoUri;
    private PermissionRequest mintaWeb;
    private GeolocationPermissions.Callback geoCb;
    private String geoAsal;
    private SharedPreferences pref;
    private String jembatanJs = "";

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        pref = Widget.pref(this);
        Notifikasi.siapkanKanal(this);
        try { jembatanJs = baca(getAssets().open("kl-android.js")); } catch (Exception ignored) {}
        if ((getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES)
            warnaAtas = warnaBawah = 0xFF1C1E1C;

        /* Tata letak: strip warna di bawah status bar + WebView + strip di atas bilah navigasi (layar tepi-ke-tepi) */
        LinearLayout akar = new LinearLayout(this);
        akar.setOrientation(LinearLayout.VERTICAL);
        stripAtas = new View(this);
        stripBawah = new View(this);
        web = new WebView(this);
        web.setBackgroundColor(warnaAtas);
        akar.addView(stripAtas, new LinearLayout.LayoutParams(-1, 0));
        akar.addView(web, new LinearLayout.LayoutParams(-1, 0, 1f));
        akar.addView(stripBawah, new LinearLayout.LayoutParams(-1, 0));
        setContentView(akar);
        Window w = getWindow();
        if (Build.VERSION.SDK_INT >= 30) w.setDecorFitsSystemWindows(false);
        else akar.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        if (Build.VERSION.SDK_INT < 35) { w.setStatusBarColor(Color.TRANSPARENT); w.setNavigationBarColor(Color.TRANSPARENT); }
        akar.setOnApplyWindowInsetsListener((v, in) -> {
            int atas, bawah;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets s = in.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                atas = s.top; bawah = s.bottom;
                v.setPadding(s.left, 0, s.right, 0);
            } else { atas = in.getSystemWindowInsetTop(); bawah = in.getSystemWindowInsetBottom(); }
            setTinggi(stripAtas, atas); setTinggi(stripBawah, bawah);
            /* Jarak status bar & navigasi sudah diberi strip di atas/bawah: jangan diteruskan ke WebView,
               kalau tidak CSS env(safe-area-inset-*) ikut menambah jarak dan header turun terlalu jauh */
            return Build.VERSION.SDK_INT >= 30 ? WindowInsets.CONSUMED : in.consumeSystemWindowInsets();
        });
        web.setOnApplyWindowInsetsListener((v, in) -> Build.VERSION.SDK_INT >= 30 ? WindowInsets.CONSUMED : in.consumeSystemWindowInsets());
        terapkanWarna();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setGeolocationEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportMultipleWindows(false);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " KisahLillahApp/" + versi());
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) WebView.setWebContentsDebuggingEnabled(true);
        web.addJavascriptInterface(new Jembatan(), "KLAndroid");
        web.setWebViewClient(new Klien());
        web.setWebChromeClient(new Krom());
        web.setDownloadListener((url, ua, cd, mime, len) -> unduh(url, URLUtil.guessFileName(url, cd, mime)));
        /* Permintaan dari service worker lama (bila ada) juga dilayani dari APK */
        if (Build.VERSION.SDK_INT >= 24) {
            ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                @Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest r) { return layani(r.getUrl()); }
            });
        }

        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::kembali);

        if (b != null) web.restoreState(b);
        else bukaIntent(getIntent(), true);

        /* Pertama kali dibuka: minta izin notifikasi & lokasi (jadwal shalat, adzan, widget) */
        /* Izin tidak diminta otomatis: dialog "Selamat datang" di aplikasi yang memintanya (lokasi, notifikasi adzan) */
    }

    /* ===== Berkas aplikasi dari dalam APK (assets/www) ===== */
    private static final Map<String, String> MIME = new HashMap<>();
    static {
        String[][] m = {{"html", "text/html"}, {"js", "text/javascript"}, {"mjs", "text/javascript"}, {"css", "text/css"}, {"json", "application/json"},
                {"webmanifest", "application/manifest+json"}, {"svg", "image/svg+xml"}, {"png", "image/png"}, {"jpg", "image/jpeg"}, {"jpeg", "image/jpeg"},
                {"webp", "image/webp"}, {"gif", "image/gif"}, {"ico", "image/x-icon"}, {"mp3", "audio/mpeg"}, {"woff2", "font/woff2"}, {"woff", "font/woff"},
                {"ttf", "font/ttf"}, {"txt", "text/plain"}, {"wasm", "application/wasm"}};
        for (String[] x : m) MIME.put(x[0], x[1]);
    }

    private WebResourceResponse layani(Uri u) {
        if (u == null || !"https".equals(u.getScheme()) || !HOST.equals(u.getHost())) return null;
        String p = u.getPath() == null ? "" : u.getPath();
        if (p.startsWith("/")) p = p.substring(1);
        if (p.startsWith("api/")) return null;  // fungsi server Vercel: lewat internet
        if (p.isEmpty() || p.endsWith("/")) p += "index.html";
        try {
            InputStream is = getAssets().open("www/" + p);
            String ext = p.contains(".") ? p.substring(p.lastIndexOf('.') + 1).toLowerCase() : "";
            String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
            if (p.equals("index.html")) is = new ByteArrayInputStream(sisipkan(baca(is)).getBytes(StandardCharsets.UTF_8));
            boolean teks = mime.startsWith("text/") || mime.contains("json") || mime.contains("javascript") || mime.contains("svg");
            WebResourceResponse r = new WebResourceResponse(mime, teks ? "utf-8" : null, is);
            Map<String, String> h = new HashMap<>();
            h.put("Cache-Control", "no-cache");
            h.put("Access-Control-Allow-Origin", "*");
            r.setResponseHeaders(h);
            return r;
        } catch (Exception e) {
            return null;  // tidak ada di APK: ambil dari situs
        }
    }

    /** Skrip jembatan dipasang paling awal di <head>, sebelum skrip aplikasi */
    private String sisipkan(String html) {
        int i = html.indexOf("<head>");
        String tag = "<script>" + jembatanJs + "</script>";
        return i < 0 ? tag + html : html.substring(0, i + 6) + tag + html.substring(i + 6);
    }

    private static String baca(InputStream is) throws java.io.IOException {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        while ((n = is.read(buf)) > 0) o.write(buf, 0, n);
        is.close();
        return o.toString("UTF-8");
    }

    /* Pertama kali dibuka: semua izin diminta berurutan agar adzan & widget jalan walau aplikasi ditutup/layar mati:
       1) notifikasi, lokasi, kamera, mikrofon  2) alarm tepat waktu (Android 12+)  3) abaikan pengoptimalan baterai */
    private void mintaIzinAwal() {
        pref.edit().putBoolean("izin_awal", true).putBoolean("izin_berantai", true).apply();
        ArrayList<String> L = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= 33 && !punya(Manifest.permission.POST_NOTIFICATIONS)) { L.add(Manifest.permission.POST_NOTIFICATIONS); pref.edit().putBoolean("diminta_notif", true).apply(); }
        if (!punya(Manifest.permission.ACCESS_FINE_LOCATION)) { L.add(Manifest.permission.ACCESS_FINE_LOCATION); L.add(Manifest.permission.ACCESS_COARSE_LOCATION); }
        if (!punya(Manifest.permission.CAMERA)) L.add(Manifest.permission.CAMERA);
        if (!punya(Manifest.permission.RECORD_AUDIO)) L.add(Manifest.permission.RECORD_AUDIO);
        if (!L.isEmpty()) requestPermissions(L.toArray(new String[0]), RQ_IZIN_AWAL);
        else lanjutIzin();
    }

    /** Langkah izin berikutnya (dipanggil setelah dialog izin & tiap kali kembali dari halaman Pengaturan) */
    private long izinTerakhir = 0;
    private void lanjutIzin() {
        if (!pref.getBoolean("izin_berantai", false)) return;
        long kini = System.currentTimeMillis();
        if (kini - izinTerakhir < 2000) return;  // onResume & hasil dialog datang hampir bersamaan
        izinTerakhir = kini;
        try {
            if (Build.VERSION.SDK_INT >= 31 && !pref.getBoolean("izin_alarm_diminta", false)) {
                pref.edit().putBoolean("izin_alarm_diminta", true).apply();
                android.app.AlarmManager am = (android.app.AlarmManager) getSystemService(Context.ALARM_SERVICE);
                if (am != null && !am.canScheduleExactAlarms()) {
                    toast("Izinkan \"Alarm & pengingat\" agar adzan berbunyi tepat waktu");
                    startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName())));
                    return;
                }
            }
            if (!pref.getBoolean("izin_baterai_diminta", false)) {
                pref.edit().putBoolean("izin_baterai_diminta", true).apply();
                android.os.PowerManager pm = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                    startActivity(new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName())));
                    return;
                }
            }
        } catch (Exception ignored) {}
        pref.edit().putBoolean("izin_berantai", false).apply();
        kirimIzinNotif();
        AdzanJadwal.pasang(this);
    }

    private void setTinggi(View v, int t) {
        LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) v.getLayoutParams();
        if (lp.height != t) { lp.height = t; v.setLayoutParams(lp); }
    }

    /* ===== Tombol kembali: tutup dialog, naik ke halaman induk; di Beranda tekan dua kali untuk keluar ===== */
    private long terakhirKembali = 0;

    private void kembali() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("(function(){try{return window.klKembali?klKembali():'x'}catch(e){return 'x'}})()", v -> {
            if ("\"ok\"".equals(v)) return;
            if ("\"akar\"".equals(v) || !web.canGoBack()) { keluarDuaKali(); return; }
            web.goBack();
        });
    }

    private void keluarDuaKali() {
        long kini = System.currentTimeMillis();
        if (kini - terakhirKembali < 2000) { finish(); return; }
        terakhirKembali = kini;
        Toast.makeText(this, "Tekan sekali lagi untuk keluar", Toast.LENGTH_SHORT).show();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() { kembali(); }

    @Override
    protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }

    @Override
    protected void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); bukaIntent(i, false); }

    @Override
    protected void onResume() {
        super.onResume();
        /* Pasang ulang alarm adzan tiap aplikasi dibuka (bila sempat dibatalkan sistem/hemat baterai) */
        try { AdzanJadwal.pasang(this); } catch (Exception ignored) {}
        js("window.dispatchEvent(new Event('kl-android-kembali'))");
        if (web != null) js("window.dispatchEvent(new Event('focus'))");
        /* Kembali dari halaman Pengaturan (alarm/baterai): lanjutkan langkah izin berikutnya */
        if (pref != null && pref.getBoolean("izin_berantai", false) && pref.getBoolean("izin_awal", false)) web.postDelayed(this::lanjutIzin, 400);
    }

    /* Tautan https://agenda-hijriah.vercel.app/#/... dari widget, pintasan, notifikasi, atau aplikasi lain */
    private void bukaIntent(Intent i, boolean awal) {
        Uri d = i != null ? i.getData() : null;
        if (d != null && "kisahlillah".equals(d.getScheme()) && "masuk".equals(d.getHost())) {
            selesaiMasuk(d);
            if (awal) web.loadUrl(AWAL + "#/profil");
            return;
        }
        if (d != null && HOST.equals(d.getHost())) {
            String hash = d.getFragment();
            String kini = web.getUrl();
            if (!awal && hash != null && kini != null && kini.startsWith(AWAL)) { js("location.hash=" + JSONObject.quote("#" + hash)); return; }
            web.loadUrl(d.toString());
        } else if (awal) web.loadUrl(AWAL);
    }

    /* ===== Warna bilah status & navigasi mengikuti tema aplikasi web ===== */
    private void terapkanWarna() {
        stripAtas.setBackgroundColor(warnaAtas);
        stripBawah.setBackgroundColor(warnaBawah);
        boolean terangAtas = terang(warnaAtas), terangBawah = terang(warnaBawah);
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) c.setSystemBarsAppearance((terangAtas ? WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS : 0) | (terangBawah ? WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS : 0),
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
        } else if (Build.VERSION.SDK_INT >= 23) {
            View d = getWindow().getDecorView();
            int f = d.getSystemUiVisibility();
            f = terangAtas ? (f | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR) : (f & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            if (Build.VERSION.SDK_INT >= 26) f = terangBawah ? (f | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR) : (f & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            d.setSystemUiVisibility(f);
        }
    }

    private static boolean terang(int c) { return (0.299 * Color.red(c) + 0.587 * Color.green(c) + 0.114 * Color.blue(c)) > 150; }

    /* ===== Izin ===== */
    private boolean punya(String p) { return checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED; }

    private String izinNotif() {
        String s = Notifikasi.cek(this);
        if ("ok".equals(s)) return "granted";
        if ("mati".equals(s)) return "denied";
        return pref.getBoolean("tolak_notif", false) && !shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS) ? "denied" : "default";
    }

    /** Izin lokasi untuk halaman: granted | denied (ditolak permanen) | prompt */
    private String izinLokasi() {
        if (punya(Manifest.permission.ACCESS_FINE_LOCATION) || punya(Manifest.permission.ACCESS_COARSE_LOCATION)) return "granted";
        return pref.getBoolean("tolak_lokasi", false) && !shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_FINE_LOCATION) ? "denied" : "prompt";
    }

    private static final int RQ_LOKASI_JS = 15;
    private void mintaLokasi() {
        String st = izinLokasi();
        if ("granted".equals(st)) { js("window.__klIzinLokasi&&__klIzinLokasi('granted')"); return; }
        if ("denied".equals(st)) {
            toast("Izin lokasi diblokir. Buka Izin › Lokasi › Izinkan, lalu kembali ke aplikasi.");
            startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName())));
            js("window.__klIzinLokasi&&__klIzinLokasi('denied')");
            return;
        }
        requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, RQ_LOKASI_JS);
    }

    private void mintaNotif() {
        String s = izinNotif();
        if (!"default".equals(s) || Build.VERSION.SDK_INT < 33) {
            if ("granted".equals(s)) { pref.edit().putBoolean("izin_berantai", true).putBoolean("izin_awal", true).apply(); web.postDelayed(this::lanjutIzin, 500); }
            if ("denied".equals(s)) { bukaPengaturanNotif(); toast("Izinkan notifikasi Kisah Lillah di Pengaturan"); }
            kirimIzinNotif();
            return;
        }
        pref.edit().putBoolean("diminta_notif", true).apply();
        requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, RQ_IZIN_NOTIF);
    }

    private void kirimIzinNotif() { js("window.__klIzinNotif&&__klIzinNotif(" + JSONObject.quote(izinNotif()) + ")"); }

    /** Agar adzan tepat waktu: izin alarm (Android 12+) dan pengecualian hemat baterai */
    private void mintaIzinAdzan() {
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                android.app.AlarmManager am = (android.app.AlarmManager) getSystemService(Context.ALARM_SERVICE);
                if (am != null && !am.canScheduleExactAlarms()) {
                    startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName())));
                    return;
                }
            }
            android.os.PowerManager pm = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName()))
                startActivity(new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName())));
        } catch (Exception ignored) {}
    }

    private void bukaPengaturanNotif() {
        try {
            if (Build.VERSION.SDK_INT >= 26) startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName()));
            else startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName())));
        } catch (Exception ignored) {}
    }

    @Override
    public void onRequestPermissionsResult(int kode, String[] izin, int[] hasil) {
        super.onRequestPermissionsResult(kode, izin, hasil);
        boolean ok = hasil.length > 0 && hasil[0] == PackageManager.PERMISSION_GRANTED;
        if (kode == RQ_IZIN_WEB && mintaWeb != null) {
            ArrayList<String> beri = new ArrayList<>();
            for (String r : mintaWeb.getResources()) {
                if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r) && punya(Manifest.permission.RECORD_AUDIO)) beri.add(r);
                if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r) && punya(Manifest.permission.CAMERA)) beri.add(r);
            }
            if (beri.isEmpty()) mintaWeb.deny(); else mintaWeb.grant(beri.toArray(new String[0]));
            mintaWeb = null;
        } else if (kode == RQ_LOKASI_JS) {
            if (!punya(Manifest.permission.ACCESS_FINE_LOCATION) && !punya(Manifest.permission.ACCESS_COARSE_LOCATION)) pref.edit().putBoolean("tolak_lokasi", true).apply();
            js("window.__klIzinLokasi&&__klIzinLokasi(" + JSONObject.quote(izinLokasi()) + ")");
        } else if (kode == RQ_IZIN_LOKASI && geoCb != null) {
            if (!ok && !punya(Manifest.permission.ACCESS_COARSE_LOCATION)) pref.edit().putBoolean("tolak_lokasi", true).apply();
            geoCb.invoke(geoAsal, punya(Manifest.permission.ACCESS_FINE_LOCATION) || punya(Manifest.permission.ACCESS_COARSE_LOCATION), false);
            geoCb = null;
        } else if (kode == RQ_IZIN_AWAL) {
            kirimIzinNotif();
            web.postDelayed(this::lanjutIzin, 500);
        } else if (kode == RQ_IZIN_NOTIF) {
            if (!ok) pref.edit().putBoolean("tolak_notif", true).apply();
            else { pref.edit().putBoolean("izin_berantai", true).putBoolean("izin_awal", true).apply(); web.postDelayed(this::lanjutIzin, 500); }
            kirimIzinNotif();
        }
    }

    /* ===== Pilih / potret foto (foto profil, laporan masalah) ===== */
    @Override
    protected void onActivityResult(int kode, int hasil, Intent data) {
        super.onActivityResult(kode, hasil, data);
        if (kode != RQ_FILE || pilihFile == null) return;
        Uri[] r = null;
        if (hasil == RESULT_OK) {
            if (data != null && data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                r = new Uri[n];
                for (int k = 0; k < n; k++) r[k] = data.getClipData().getItemAt(k).getUri();
            } else if (data != null && data.getData() != null) r = new Uri[]{data.getData()};
            else if (fotoUri != null) r = new Uri[]{fotoUri};
        }
        pilihFile.onReceiveValue(r);
        pilihFile = null;
        fotoUri = null;
    }

    /* ===== Unduhan ke folder Download HP ===== */
    private void unduh(String url, String nama) {
        if (url == null || !url.startsWith("http")) { toast("Berkas ini tidak bisa diunduh"); return; }
        try {
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            r.setTitle(nama);
            r.setDescription("Kisah Lillah");
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, nama);
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm != null) { dm.enqueue(r); toast("Mengunduh " + nama + " ke folder Download"); }
        } catch (Exception e) { toast("Gagal mengunduh: " + e.getMessage()); }
    }

    /* ===== Masuk dengan Google: lembar pilih akun Google bawaan Android (Credential Manager) ===== */
    private void mulaiMasukGoogle() {
        try {
            GetCredentialRequest req = new GetCredentialRequest.Builder()
                    .addCredentialOption(new GetSignInWithGoogleOption.Builder(KLIEN_WEB).build()).build();
            CredentialManager.create(this).getCredentialAsync(this, req, new CancellationSignal(), ContextCompat.getMainExecutor(this),
                    new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                        @Override public void onResult(GetCredentialResponse r) {
                            Credential c = r.getCredential();
                            if (c instanceof CustomCredential && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType()))
                                hasilGoogle(GoogleIdTokenCredential.createFrom(c.getData()).getIdToken(), null);
                            else hasilGoogle(null, "jenis akun tidak dikenal");
                        }
                        @Override public void onError(GetCredentialException e) {
                            /* Batal = tetap di aplikasi. Galat lain (mis. tidak ada akun Google di HP, sidik jari belum
                               didaftarkan di Firebase): pakai cara cadangan lewat tab Chrome */
                            if (e instanceof GetCredentialCancellationException) hasilGoogle(null, "batal");
                            else mulaiMasuk("g");
                        }
                    });
        } catch (Exception e) { mulaiMasuk("g"); }
    }

    private void hasilGoogle(String token, String galat) { kirimMasuk("g", token, null, galat); }

    private void kirimMasuk(String p, String id, String at, String galat) {
        String kode = "(function m(n){if(window.__klMasuk)__klMasuk(" + JSONObject.quote(p) + "," + (id == null ? "null" : JSONObject.quote(id)) + ","
                + (at == null ? "null" : JSONObject.quote(at)) + "," + (galat == null ? "null" : JSONObject.quote(galat)) + ");else if(n<40)setTimeout(function(){m(n+1)},250)})(0)";
        js(kode);
    }

    /** Cara cadangan: halaman masuk-app.html di tab Chrome yang aman; hasilnya kembali lewat kisahlillah://masuk */
    private void mulaiMasuk(String p) {
        byte[] acak = new byte[16];
        new java.security.SecureRandom().nextBytes(acak);
        StringBuilder sb = new StringBuilder();
        for (byte x : acak) sb.append(String.format(java.util.Locale.ROOT, "%02x", x));
        pref.edit().putString("state_masuk", sb.toString()).apply();
        Uri u = Uri.parse(AWAL + "masuk-app.html?state=" + sb + "&p=" + p);
        try { new androidx.browser.customtabs.CustomTabsIntent.Builder().setShowTitle(true).build().launchUrl(this, u); }
        catch (Exception e) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e2) { kirimMasuk(p, null, null, "Tidak ada browser untuk masuk"); }
        }
    }

    private void selesaiMasuk(Uri d) {
        String st = d.getQueryParameter("state"), harap = pref.getString("state_masuk", null);
        pref.edit().remove("state_masuk").apply();
        String p = "fb".equals(d.getQueryParameter("p")) ? "fb" : "g";
        if (harap == null || !harap.equals(st)) { toast("Masuk dibatalkan (kode tidak cocok). Coba lagi."); kirimMasuk(p, null, null, "kode tidak cocok"); return; }
        String galat = d.getQueryParameter("galat");
        if (galat != null) { kirimMasuk(p, null, null, galat); return; }
        String id = d.getQueryParameter("id"), at = d.getQueryParameter("at");
        web.postDelayed(() -> kirimMasuk(p, id == null || id.isEmpty() ? null : id, at == null || at.isEmpty() ? null : at, null), 300);
    }

    /* ===== Pembantu ===== */
    private String versi() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "?"; }
    }

    private void js(String kode) { runOnUiThread(() -> { if (web != null) web.evaluateJavascript(kode, null); }); }

    private void toast(String m) { runOnUiThread(() -> Toast.makeText(this, m, Toast.LENGTH_LONG).show()); }

    /* Tautan: halaman aplikasi & login Firebase/Facebook tetap di aplikasi; situs lain, WhatsApp, email, telepon dibuka di aplikasinya */
    private class Klien extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) { return layani(r.getUrl()); }

        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            String sk = u.getScheme() == null ? "" : u.getScheme(), h = u.getHost() == null ? "" : u.getHost();
            if (("https".equals(sk) || "http".equals(sk)) && (HOST.equals(h) || h.endsWith(".firebaseapp.com"))) return false;
            if ("intent".equals(sk)) {
                try {
                    Intent i = Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME);
                    startActivity(i);
                } catch (Exception e) {
                    try {
                        String fb = Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME).getStringExtra("browser_fallback_url");
                        if (fb != null) startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(fb)));
                    } catch (Exception ignored) { toast("Tidak ada aplikasi untuk membuka tautan ini"); }
                }
                return true;
            }
            try { startActivity(new Intent(Intent.ACTION_VIEW, u).addCategory(Intent.CATEGORY_BROWSABLE)); }
            catch (Exception e) { toast("Tidak ada aplikasi untuk membuka tautan ini"); }
            return true;
        }
    }

    private class Krom extends WebChromeClient {
        @Override
        public void onPermissionRequest(PermissionRequest r) {
            runOnUiThread(() -> {
                ArrayList<String> perlu = new ArrayList<>();
                for (String x : r.getResources()) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(x) && !punya(Manifest.permission.RECORD_AUDIO)) perlu.add(Manifest.permission.RECORD_AUDIO);
                    if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(x) && !punya(Manifest.permission.CAMERA)) perlu.add(Manifest.permission.CAMERA);
                }
                if (perlu.isEmpty()) { r.grant(r.getResources()); return; }
                mintaWeb = r;
                requestPermissions(perlu.toArray(new String[0]), RQ_IZIN_WEB);
            });
        }

        /* Lokasi (jadwal shalat, kiblat) */
        @Override
        public void onGeolocationPermissionsShowPrompt(String asal, GeolocationPermissions.Callback cb) {
            if (punya(Manifest.permission.ACCESS_FINE_LOCATION) || punya(Manifest.permission.ACCESS_COARSE_LOCATION)) { cb.invoke(asal, true, false); return; }
            geoAsal = asal; geoCb = cb;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, RQ_IZIN_LOKASI);
        }

        /* Pilih foto dari galeri atau potret langsung dengan kamera */
        @Override
        public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
            if (pilihFile != null) pilihFile.onReceiveValue(null);
            pilihFile = cb;
            String[] jt = p.getAcceptTypes();
            String jenis = jt != null && jt.length > 0 && jt[0] != null && !jt[0].isEmpty() ? jt[0] : "*/*";
            boolean gambar = jenis.startsWith("image");
            Intent pilih = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType(jenis.contains(",") ? "*/*" : jenis);
            if (p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) pilih.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            ArrayList<Intent> ekstra = new ArrayList<>();
            if (gambar && punya(Manifest.permission.CAMERA)) {
                try {
                    File f = new File(getCacheDir(), "foto");
                    if (!f.exists()) f.mkdirs();
                    fotoUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", new File(f, "foto-" + System.currentTimeMillis() + ".jpg"));
                    ekstra.add(new Intent(MediaStore.ACTION_IMAGE_CAPTURE).putExtra(MediaStore.EXTRA_OUTPUT, fotoUri).addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION));
                } catch (Exception e) { fotoUri = null; }
            }
            Intent c = Intent.createChooser(pilih, gambar ? "Pilih foto" : "Pilih berkas");
            if (!ekstra.isEmpty()) c.putExtra(Intent.EXTRA_INITIAL_INTENTS, ekstra.toArray(new Intent[0]));
            try { startActivityForResult(c, RQ_FILE); } catch (ActivityNotFoundException e) { pilihFile = null; return false; }
            return true;
        }
    }

    /** Jembatan JavaScript: window.KLAndroid, dipakai oleh assets/kl-android.js */
    private class Jembatan {
        @JavascriptInterface public String versi() { return MainActivity.this.versi(); }

        /** Data widget (js/lib/widgetdata.js): jadwal 7 hari, lokasi, kalimat pengingat */
        @JavascriptInterface public void widget(String json) { Widget.simpan(MainActivity.this, json); }

        /** Pengaturan adzan (kl2_adzan) & koreksi Hijriah (kl2_hijri_offset) dari aplikasi web */
        @JavascriptInterface public void aturan(String adzan, String hijri) {
            int off = 0;
            try { off = Integer.parseInt(hijri.replaceAll("[^-0-9]", "")); } catch (Exception ignored) {}
            boolean adaLama = pref.getString("adzan", "").contains("true");
            pref.edit().putInt("hijri_offset", off).apply();
            AdzanJadwal.aturan(MainActivity.this, adzan);
            Widget.segarkan(MainActivity.this);
            /* Baru menyalakan pengingat adzan: minta izin alarm tepat waktu & pengecualian hemat baterai */
            if (!adaLama && adzan != null && adzan.contains("true") && !pref.getBoolean("izin_adzan", false)) {
                pref.edit().putBoolean("izin_adzan", true).apply();
                runOnUiThread(MainActivity.this::mintaIzinAdzan);
            }
        }

        @JavascriptInterface public String izinNotif() { return MainActivity.this.izinNotif(); }

        @JavascriptInterface public String izinLokasi() { return MainActivity.this.izinLokasi(); }

        @JavascriptInterface public void mintaLokasi() { runOnUiThread(MainActivity.this::mintaLokasi); }

        @JavascriptInterface public void mintaNotif() { runOnUiThread(MainActivity.this::mintaNotif); }

        @JavascriptInterface public void notif(String judul, String isi) {
            /* "Waktu Dzuhur" dari pengingat di dalam halaman: lewati bila alarm Android baru saja menampilkannya */
            if (judul.startsWith("Waktu ") && adzanBaru()) return;
            Notifikasi.tampil(MainActivity.this, judul, isi, "umum");
        }

        @JavascriptInterface public boolean adzanBaru() { return System.currentTimeMillis() - pref.getLong("adzan_terakhir", 0) < 3 * 60_000L; }

        @JavascriptInterface public void hentikanAdzan() { AdzanLayanan.henti(MainActivity.this); }

        @JavascriptInterface public void ujiAdzan(int detik) { AdzanJadwal.uji(MainActivity.this, detik); }

        /** Putar adzan sekarang lewat pemutar Android (jalur yang sama dengan saat aplikasi tertutup) */
        @JavascriptInterface public void putarAdzan(String jenis) {
            boolean subuh = "subuh".equals(jenis);
            try { AdzanLayanan.mulai(MainActivity.this, subuh ? "Tes adzan Subuh" : "Tes adzan", "Beginilah adzan berbunyi saat waktu shalat tiba.", subuh ? "subuh" : "adzan"); }
            catch (Exception e) { Notifikasi.tampil(MainActivity.this, "Tes adzan", "Beginilah adzan berbunyi saat waktu shalat tiba.", subuh ? "adzan_subuh" : "adzan"); }
        }

        /** Keadaan pengingat adzan untuk Profil: izin & alarm yang terpasang */
        @JavascriptInterface public String statusAdzan() {
            JSONObject o = new JSONObject();
            try {
                o.put("notif", Notifikasi.cek(MainActivity.this));
                android.app.AlarmManager am = (android.app.AlarmManager) getSystemService(Context.ALARM_SERVICE);
                o.put("alarm", Build.VERSION.SDK_INT < 31 || (am != null && am.canScheduleExactAlarms()));
                android.os.PowerManager pm = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
                o.put("baterai", pm == null || pm.isIgnoringBatteryOptimizations(getPackageName()));
                o.put("n", pref.getInt("alarm_n", 0));
                o.put("berikut", pref.getString("alarm_berikut", ""));
                o.put("merek", Build.MANUFACTURER);
            } catch (Exception ignored) {}
            return o.toString();
        }

        /** Perbaiki satu izin: notif | alarm | baterai | aplikasi (pengaturan aplikasi: mulai otomatis/tanpa batasan) */
        @JavascriptInterface public void perbaikiAdzan(String apa) {
            runOnUiThread(() -> {
                try {
                    if ("notif".equals(apa)) { if (Build.VERSION.SDK_INT >= 33 && !punya(Manifest.permission.POST_NOTIFICATIONS) && !"denied".equals(izinNotif())) requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, RQ_IZIN_NOTIF); else bukaPengaturanNotif(); }
                    else if ("alarm".equals(apa) && Build.VERSION.SDK_INT >= 31) startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName())));
                    else if ("baterai".equals(apa)) {
                        try { startActivity(new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName()))); }
                        catch (Exception e) { startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)); }
                    } else startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName())));
                } catch (Exception e) { toast("Buka Pengaturan HP › Aplikasi › Kisah Lillah"); }
            });
        }

        @JavascriptInterface public void warnaBar(String atas, String bawah) {
            runOnUiThread(() -> {
                try { warnaAtas = Color.parseColor(atas.trim()); warnaBawah = Color.parseColor(bawah.trim()); terapkanWarna(); } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface public void getar(String pola) {
            try {
                String[] b = pola.split(",");
                long[] w = new long[b.length + 1];
                for (int k = 0; k < b.length; k++) w[k + 1] = Math.max(0, Math.min(3000, Long.parseLong(b[k].trim())));
                android.os.Vibrator v = Build.VERSION.SDK_INT >= 31
                        ? ((android.os.VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE)).getDefaultVibrator()
                        : (android.os.Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null || !v.hasVibrator() || (w.length == 2 && w[1] == 0)) { if (v != null) v.cancel(); return; }
                /* Getar ketukan pendek (tasbih): efek "klik" bawaan HP, terasa jelas di semua HP; getar biasa minimal 35 ms */
                if (w.length == 2 && w[1] <= 40 && Build.VERSION.SDK_INT >= 29) v.vibrate(android.os.VibrationEffect.createPredefined(android.os.VibrationEffect.EFFECT_HEAVY_CLICK));
                else if (Build.VERSION.SDK_INT >= 26) v.vibrate(w.length == 2 ? android.os.VibrationEffect.createOneShot(Math.max(35, w[1]), android.os.VibrationEffect.DEFAULT_AMPLITUDE) : android.os.VibrationEffect.createWaveform(w, -1));
                else v.vibrate(w, -1);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface public void bagikan(String teks) {
            runOnUiThread(() -> startActivity(Intent.createChooser(new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, teks), "Bagikan")));
        }

        @JavascriptInterface public void masukGoogle() { runOnUiThread(MainActivity.this::mulaiMasukGoogle); }

        @JavascriptInterface public void masukChrome(String p) { runOnUiThread(() -> mulaiMasuk("fb".equals(p) ? "fb" : "g")); }
    }
}
