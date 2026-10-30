/* Login Google (Firebase Auth) untuk halaman Profil.
   Popup diutamakan; jika diblokir browser, otomatis pindah ke login lewat halaman (redirect). */

const POPUP_BLOCKED = ["auth/popup-blocked", "auth/cancelled-popup-request"];

const MESSAGES = {
  "auth/unauthorized-domain": "Domain ini belum diizinkan. Tambahkan di Firebase Console › Authentication › Settings › Authorized domains.",
  "auth/operation-not-allowed": "Login Google belum diaktifkan di Firebase Console › Authentication › Sign-in method.",
  "auth/popup-closed-by-user": "Jendela login ditutup sebelum selesai.",
  "auth/network-request-failed": "Tidak ada koneksi internet.",
  "auth/internal-error": "Firebase menolak permintaan. Periksa API key dan domain di Firebase Console.",
  "auth/api-key-not-valid": "API key Firebase tidak valid.",
};

/* Pesan yang ramah untuk pengguna dari error Firebase */
export function authErrorMessage(e) {
  return MESSAGES[e.code] || `Gagal masuk (${e.code || e.message || "error"}).`;
}

/* onRedirect dipanggil sebelum halaman dialihkan, agar pengguna tahu apa yang terjadi */
export async function signIn(onRedirect) {
  const auth = window.__klAuth;
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (e) {
    if (!POPUP_BLOCKED.includes(e.code)) throw e;
    onRedirect?.();
    await auth.signInWithRedirect(provider);
  }
}

export function signOut() {
  return window.__klAuth?.signOut();
}
