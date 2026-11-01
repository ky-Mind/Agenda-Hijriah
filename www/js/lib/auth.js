/* Login (Firebase Auth) untuk halaman Profil: Google, Facebook, atau email + kata sandi.
   Popup diutamakan; jika diblokir browser, otomatis pindah ke login lewat halaman (redirect).
   Satu email = satu akun. Jika email Facebook sudah terdaftar lewat Google/email, kredensial Facebook disimpan
   sementara lalu disambungkan otomatis setelah pengguna masuk dengan cara lamanya, sehingga datanya tetap satu. */

const POPUP_BLOCKED = ["auth/popup-blocked", "auth/cancelled-popup-request"];

const MESSAGES = {
  "auth/unauthorized-domain": "Domain ini belum diizinkan. Tambahkan di Firebase Console › Authentication › Settings › Authorized domains.",
  "auth/operation-not-allowed": "Cara masuk ini belum diaktifkan di Firebase Console › Authentication › Sign-in method.",
  "auth/popup-closed-by-user": "Jendela login ditutup sebelum selesai.",
  "auth/network-request-failed": "Tidak ada koneksi internet.",
  "auth/internal-error": "Firebase menolak permintaan. Periksa API key dan domain di Firebase Console.",
  "auth/api-key-not-valid": "API key Firebase tidak valid.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/missing-password": "Isi kata sandi.",
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/wrong-password": "Email atau kata sandi salah.",
  "auth/user-not-found": "Email atau kata sandi salah.",
  "auth/user-disabled": "Akun ini dinonaktifkan.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.",
  "auth/email-already-in-use": "Email ini sudah terdaftar. Pilih Masuk, atau masuk dengan Google/Facebook jika dulu mendaftar lewat sana.",
  "auth/weak-password": "Kata sandi minimal 6 karakter.",
  "auth/account-exists-with-different-credential": "Email akun Facebook ini sudah terdaftar dengan cara lain. Masuk dulu dengan Google atau email, Facebook akan otomatis tersambung ke akun yang sama.",
  "auth/credential-already-in-use": "Akun Facebook ini sudah tersambung ke akun lain.",
};

/* Pesan yang ramah untuk pengguna dari error Firebase */
export function authErrorMessage(e) {
  return MESSAGES[e.code] || `Gagal masuk (${e.code || e.message || "error"}).`;
}

const PROVIDERS = {
  google: () => new firebase.auth.GoogleAuthProvider(),
  facebook: () => {
    const p = new firebase.auth.FacebookAuthProvider();
    p.addScope("email");
    return p;
  },
};

/* Kredensial Facebook yang menunggu disambungkan (lihat keterangan di atas) */
let pending = null;

async function linkPending(user) {
  if (!pending || !user) return;
  const cred = pending;
  pending = null;
  try {
    await user.linkWithCredential(cred);
  } catch (e) {
    console.warn("sambung akun", e.code || e);
  }
}

async function run(fn) {
  try {
    const r = await fn();
    await linkPending(r?.user);
    return r;
  } catch (e) {
    if (e.code === "auth/account-exists-with-different-credential") pending = e.credential || null;
    throw e;
  }
}

/* kind: "google" atau "facebook". onRedirect dipanggil sebelum halaman dialihkan, agar pengguna tahu apa yang terjadi */
export async function signIn(onRedirect, kind = "google") {
  const auth = window.__klAuth;
  const provider = PROVIDERS[kind]();
  try {
    await run(() => auth.signInWithPopup(provider));
  } catch (e) {
    if (!POPUP_BLOCKED.includes(e.code)) throw e;
    onRedirect?.();
    await auth.signInWithRedirect(provider);
  }
}

export function signInEmail(email, password) {
  return run(() => window.__klAuth.signInWithEmailAndPassword(email, password));
}

/* Akun email baru langsung dikirimi email verifikasi: fitur Pesan hanya untuk email terverifikasi (firestore.rules) */
export async function signUpEmail(email, password) {
  const r = await run(() => window.__klAuth.createUserWithEmailAndPassword(email, password));
  r.user.sendEmailVerification().catch(e => console.warn("verifikasi email", e.code || e));
  return r;
}

export function resetPassword(email) {
  return window.__klAuth.sendPasswordResetEmail(email);
}

export function signOut() {
  pending = null;
  return window.__klAuth?.signOut();
}
