/* Konfigurasi Firebase (sisi klien, publik). Jangan taruh kunci rahasia di sini. */
window.KL_FIREBASE = {
  apiKey: "AIzaSyClWUfI6U_IiT9yUxKZrPq39z1X_GDhD4k",
  authDomain: "kisah-2cc70.firebaseapp.com",
  projectId: "kisah-2cc70",
  storageBucket: "kisah-2cc70.firebasestorage.app",
  messagingSenderId: "417572719269",
  appId: "1:417572719269:web:ae6d40418e51b167441b4c"
};
try {
  if (window.firebase) {
    window.__klApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.KL_FIREBASE);
    window.__klAuth = firebase.auth();
    window.__klDb = firebase.firestore();
  }
} catch (e) { console.warn("Firebase gagal dimulai", e); }
