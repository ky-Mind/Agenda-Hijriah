package com.kisahlillah.app;

import android.content.Context;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/** Notifikasi pesan di latar belakang lewat Firebase Cloud Messaging (seperti adzan: muncul walau aplikasi ditutup).
    Token HP ini disimpan aplikasi web di users/{uid}/data/push.fcm; server (api/_core.js) mengirim pesan DATA prioritas
    tinggi {judul, isi, tag, url}. Isi pesan chat tidak pernah ikut (terenkripsi), hanya "Pesan baru". */
public class PesanFcm extends FirebaseMessagingService {
    /** Minta token (async); hasil dikirim ke web lewat window.__klFcm(token, galat) */
    static void minta(MainActivity a) {
        try {
            FirebaseMessaging.getInstance().getToken().addOnCompleteListener(t -> {
                String tok = t.isSuccessful() ? t.getResult() : null;
                String galat = t.isSuccessful() ? null : (t.getException() == null ? "fcm" : t.getException().getMessage());
                a.kirimFcm(tok, galat);
            });
        } catch (Exception e) { a.kirimFcm(null, "Firebase belum diatur di APK ini"); }
    }

    /** Keluar akun: token dihapus agar HP ini tidak lagi menerima pesan akun itu */
    static void hapus() {
        try { FirebaseMessaging.getInstance().deleteToken(); } catch (Exception ignored) {}
    }

    @Override
    public void onMessageReceived(RemoteMessage m) {
        Map<String, String> d = m.getData();
        String judul = d.get("judul"), isi = d.get("isi");
        if (judul == null || judul.isEmpty()) return;
        /* Aplikasi sedang dibuka: chat sudah tampil di layar, tidak perlu notifikasi dobel */
        if (MainActivity.diDepan) return;
        Notifikasi.pesan(getApplicationContext(), judul, isi == null ? "" : isi, d.get("tag"), d.get("url"));
    }

    /** Token baru: web memperbaruinya saat aplikasi dibuka berikutnya (push.refresh) */
    @Override
    public void onNewToken(String t) {
        getSharedPreferences("kl", Context.MODE_PRIVATE).edit().putString("fcm_baru", t).apply();
    }
}
