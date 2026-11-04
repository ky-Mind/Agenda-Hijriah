/* Jembatan aplikasi Android Kisah Lillah. Disisipkan MainActivity di awal <head> index.html (sebelum skrip lain),
   jadi kode web (www/) tidak perlu diubah: fitur yang tidak ada di WebView diarahkan ke Android asli (window.KLAndroid). */
(function () {
  var A = window.KLAndroid;
  if (!A) return;
  window.KL_ANDROID = true;

  /* Pemasangan pertama: pengingat adzan (notifikasi + suara adzan) langsung aktif */
  try { if (!localStorage.getItem("kl2_adzan")) localStorage.setItem("kl2_adzan", JSON.stringify({ notif: true, sound: true })); } catch (e) {}

  /* Pengaturan adzan & koreksi Hijriah diteruskan ke Android setiap kali berubah (alarm adzan & widget) */
  var tunda = 0;
  function kirimAturan() {
    clearTimeout(tunda);
    tunda = setTimeout(function () {
      try { A.aturan(localStorage.getItem("kl2_adzan") || "{}", localStorage.getItem("kl2_hijri_offset") || "0"); } catch (e) {}
    }, 300);
  }
  try {
    var setAsli = Storage.prototype.setItem, hapusAsli = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k, v) { setAsli.call(this, k, v); if (k === "kl2_adzan" || k === "kl2_hijri_offset") kirimAturan(); };
    Storage.prototype.removeItem = function (k) { hapusAsli.call(this, k); if (k === "kl2_adzan" || k === "kl2_hijri_offset") kirimAturan(); };
  } catch (e) {}

  /* Widget layar utama: js/lib/widgetdata.js memanggil Capacitor.Plugins.KLWidget.setData({json}) */
  window.Capacitor = {
    isNativePlatform: function () { return true; },
    getPlatform: function () { return "android"; },
    Plugins: { KLWidget: { setData: function (o) { try { A.widget((o && o.json) || "{}"); kirimAturan(); } catch (e) {} return Promise.resolve(); } } }
  };

  /* Notifikasi: WebView tidak punya Notification API, jadi diganti notifikasi Android */
  function Notif(judul, o) {
    o = o || {};
    this.title = judul; this.body = o.body || ""; this.onclick = null;
    this.close = function () {};
    try { A.notif(String(judul || ""), String(o.body || "")); } catch (e) {}
  }
  Object.defineProperty(Notif, "permission", { get: function () { try { return A.izinNotif(); } catch (e) { return "default"; } } });
  Notif.requestPermission = function (cb) {
    return new Promise(function (res) {
      window.__klIzinNotif = function (s) { res(s); if (typeof cb === "function") cb(s); };
      A.mintaNotif();
    });
  };
  window.Notification = Notif;
  try { if (window.ServiceWorkerRegistration) ServiceWorkerRegistration.prototype.showNotification = function (t, o) { new Notif(t, o); return Promise.resolve(); }; } catch (e) {}

  /* Semua file sudah ada di dalam APK: service worker (cache offline) tidak diperlukan */
  try {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register = function () { return Promise.reject(new Error("Aplikasi Android: tidak memakai service worker")); };
      navigator.serviceWorker.getRegistrations().then(function (r) { r.forEach(function (x) { x.unregister(); }); }).catch(function () {});
    }
  } catch (e) {}

  /* Adzan sudah diputar oleh Android (alarm): pemutar adzan di dalam halaman tidak ikut berbunyi dobel */
  var AudioAsli = window.Audio;
  window.Audio = function (src) {
    if (src && /audio\/adzan/.test(src)) { try { if (A.adzanBaru()) return { play: function () { return Promise.resolve(); }, pause: function () {}, addEventListener: function () {}, removeEventListener: function () {} }; } catch (e) {} }
    return arguments.length ? new AudioAsli(src) : new AudioAsli();
  };
  window.Audio.prototype = AudioAsli.prototype;

  /* Getar (tasbih) & bagikan */
  try { navigator.vibrate = function (p) { try { A.getar(String(Array.isArray(p) ? p.join(",") : (p || 0))); } catch (e) {} return true; }; } catch (e) {}
  try {
    navigator.share = function (d) { d = d || {}; A.bagikan([d.title, d.text, d.url].filter(Boolean).join("\n")); return Promise.resolve(); };
    navigator.canShare = function () { return true; };
  } catch (e) {}

  /* Masuk dengan Google: Google melarang masuk di WebView, jadi memakai lembar akun Google bawaan Android lalu
     tokennya dipakai Firebase (signInWithCredential). Facebook memakai cara pengalihan halaman (redirect). */
  function masukGoogle() {
    return new Promise(function (res, rej) {
      window.__klGoogle = function (token, galat) {
        window.__klGoogle = null;
        if (!token) return rej({ code: galat === "batal" ? "auth/popup-closed-by-user" : "Google: " + (galat || "gagal"), message: galat || "gagal" });
        window.__klAuth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(token)).then(res, rej);
      };
      A.masukGoogle();
    });
  }
  function pasangAuth() {
    var au = window.__klAuth;
    if (!au || au.__klAndroid) return;
    au.__klAndroid = true;
    var popup = au.signInWithPopup.bind(au), redirect = au.signInWithRedirect.bind(au);
    au.signInWithPopup = function (p) { if (p && p.providerId === "google.com") return masukGoogle(); return redirect(p); };
    au.signInWithRedirect = function (p) { if (p && p.providerId === "google.com") return masukGoogle(); return redirect(p); };
    void popup;
  }

  /* Warna bilah status & navigasi HP mengikuti bilah atas dan navigasi bawah aplikasi (terang/gelap) */
  function hex(c) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(c || "");
    if (!m || (m[4] !== undefined && +m[4] < 0.5)) return null;
    return "#" + [m[1], m[2], m[3]].map(function (x) { return ("0" + (+x).toString(16)).slice(-2); }).join("");
  }
  function latar(sel) { var e = document.querySelector(sel); return e ? hex(getComputedStyle(e).backgroundColor) : null; }
  var warnaLama = "";
  function warna() {
    var body = hex(getComputedStyle(document.body || document.documentElement).backgroundColor) || "#f4f3ee";
    var atas = latar("#bar") || body, bawah = latar("#nav") || body;
    if (getComputedStyle(document.getElementById("nav") || document.body).display === "none") bawah = body;
    if (atas + bawah === warnaLama) return;
    warnaLama = atas + bawah;
    try { A.warnaBar(atas, bawah); } catch (e) {}
  }

  /* Tombol kembali HP: tutup dialog/lembar dulu, lalu naik ke halaman induk; "akar" = sudah di Beranda */
  window.klKembali = function () {
    var jumlah = function () { return document.body.childElementCount + document.querySelectorAll(".modal,[open],.open,.show").length; };
    var a = jumlah(), t = document.activeElement || document.body;
    t.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true, cancelable: true }));
    if (jumlah() !== a) return "ok";
    /* Dialog yang tidak menanggapi Escape: ketuk latarnya (sama seperti mengetuk di luar kotak) */
    var m = document.querySelectorAll(".modal");
    if (m.length) { m[m.length - 1].click(); return "ok"; }
    var b = document.getElementById("back");
    if (b && !b.hidden) { b.click(); return "ok"; }
    var h = location.hash.replace(/^#\/?/, "");
    if (h && h !== "beranda") { location.hash = "#/beranda"; return "ok"; }
    return "akar";
  };

  document.addEventListener("DOMContentLoaded", function () {
    pasangAuth();
    warna();
    kirimAturan();
    new MutationObserver(function () { setTimeout(warna, 60); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-nav", "data-chat"] });
    addEventListener("hashchange", function () { setTimeout(warna, 120); });
    document.addEventListener("kl-rendered", function () { setTimeout(warna, 60); });
    try { matchMedia("(prefers-color-scheme:dark)").addEventListener("change", function () { setTimeout(warna, 60); }); } catch (e) {}
  });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { pasangAuth(); warna(); } });
})();
