package com.kisahlillah.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Menerima alarm adzan (memutar adzan / menampilkan notifikasi) dan memasang ulang alarm setelah HP dinyalakan ulang. */
public class AdzanReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction() == null ? "" : i.getAction();
        if ("com.kisahlillah.app.ADZAN".equals(a)) {
            try {
                android.os.PowerManager pm = (android.os.PowerManager) c.getSystemService(Context.POWER_SERVICE);
                if (pm != null) pm.newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "kl:adzan").acquire(60_000);
            } catch (Exception ignored) {}
            /* Dicatat agar pemutar adzan di dalam aplikasi web tidak ikut berbunyi dobel */
            Widget.pref(c).edit().putLong("adzan_terakhir", System.currentTimeMillis()).apply();
            String jenis = i.getStringExtra("jenis"), judul = i.getStringExtra("judul"), isi = i.getStringExtra("isi");
            if ("info".equals(jenis)) Notifikasi.tampil(c, judul, isi, "waktu");
            else if ("senyap".equals(jenis)) Notifikasi.tampil(c, judul, isi, "waktu_senyap");
            else {
                try { AdzanLayanan.mulai(c, judul, isi, "subuh".equals(jenis) ? "subuh" : "adzan"); }
                catch (Exception e) { Notifikasi.tampil(c, judul, isi, "subuh".equals(jenis) ? "adzan_subuh" : "adzan"); }
            }
            Widget.segarkan(c);
        }
        AdzanJadwal.pasang(c);
    }
}
