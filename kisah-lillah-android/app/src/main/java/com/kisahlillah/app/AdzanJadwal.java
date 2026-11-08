package com.kisahlillah.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;

/**
 * Pengingat adzan yang berjalan walau aplikasi ditutup. Jadwalnya diambil dari data widget (7 hari ke depan),
 * pengaturannya dari aplikasi web (Pengaturan › Adzan: notifikasi, suara adzan, waktu yang dimatikan).
 * Beberapa waktu terdekat dipasang sebagai alarm; tiap kali berbunyi (dan setelah HP menyala ulang) dipasang yang berikutnya.
 * setAlarmClock: prioritas tertinggi, menembus mode tidur (Doze).
 */
final class AdzanJadwal {
    private AdzanJadwal() {}
    private static final int MAKS = 20, AKTIF = 16;

    /** Nama di widget -> kunci pengaturan web (js/lib/adzan.js) */
    static String id(String nama) {
        switch (nama) {
            case "Subuh": return "Fajr";
            case "Dzuhur": return "Dhuhr";
            case "Ashar": return "Asr";
            case "Maghrib": return "Maghrib";
            case "Isya": return "Isha";
            case "Terbit": return "Sunrise";
            default: return nama;
        }
    }

    static void aturan(Context c, String json) {
        Widget.pref(c).edit().putString("adzan", json == null || json.isEmpty() ? "{}" : json).apply();
        pasang(c);
    }

    static void pasang(Context c) {
        SharedPreferences p = Widget.pref(c);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        for (int k = 0; k < MAKS; k++) am.cancel(niat(c, k, null, null, null));
        p.edit().putInt("alarm_n", 0).putString("alarm_berikut", "").apply();
        JSONObject s;
        try { s = new JSONObject(p.getString("adzan", "{}")); } catch (Exception e) { s = new JSONObject(); }
        boolean notif = s.optBoolean("notif"), suara = s.optBoolean("sound");
        if (!notif && !suara) return;
        JSONObject off = s.optJSONObject("off"), mode = s.optJSONObject("mode");
        String lok = "";
        try {
            lok = new JSONObject(p.getString("widget", "{}")).optString("location");
            int i = lok.lastIndexOf(" · ");
            if (i > 0) lok = lok.substring(0, i);
        } catch (Exception ignored) {}
        /* 5 waktu shalat + Imsak/Terbit/Dhuha, urut waktu */
        ArrayList<Object[]> S = new ArrayList<>(Widget.slot(c));
        S.addAll(Widget.slot(c, "extra"));
        Collections.sort(S, (a, b) -> Long.compare((long) a[2], (long) b[2]));
        long kini = System.currentTimeMillis();
        boolean tepat = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        int n = 0;
        for (Object[] x : S) {
            if (n >= AKTIF) break;
            String nama = (String) x[0];
            long t = (long) x[2];
            if (t <= kini) continue;
            String m = modus(id(nama), mode, off, suara);
            if ("off".equals(m)) continue;
            String jenis = "adzan".equals(m) ? ("Subuh".equals(nama) ? "subuh" : "adzan") : "senyap".equals(m) ? "senyap" : "info";
            PendingIntent pi = niat(c, n, "Waktu " + nama, isi(nama, lok), jenis);
            if (tepat) am.setAlarmClock(new AlarmManager.AlarmClockInfo(t, bukaAplikasi(c)), pi);
            else am.setWindow(AlarmManager.RTC_WAKEUP, t, 60_000, pi);
            if (n == 0) p.edit().putString("alarm_berikut", nama + " " + x[1]).putLong("alarm_t", t).apply();
            n++;
        }
        p.edit().putInt("alarm_n", n).apply();
    }

    /** Mode tiap waktu dari Profil › Notifikasi: adzan / notif / senyap / off. Belum diatur: ikut pengaturan lama.
        Imsak, Terbit, Dhuha tidak pernah memutar adzan dan mati bila belum diatur. */
    static String modus(String id, JSONObject mode, JSONObject off, boolean suara) {
        boolean tambahan = "Imsak".equals(id) || "Sunrise".equals(id) || "Dhuha".equals(id);
        String m = mode == null ? "" : mode.optString(id, "");
        if (!m.isEmpty()) return tambahan && "adzan".equals(m) ? "notif" : m;
        if (tambahan) return "off";
        if (off != null && off.optBoolean(id)) return "off";
        return suara ? "adzan" : "notif";
    }

    static String isi(String nama, String lok) {
        switch (nama) {
            case "Imsak": return "Waktu imsak telah tiba. Segera akhiri sahur.";
            case "Terbit": return "Matahari terbit, waktu Subuh telah berakhir.";
            case "Dhuha": return "Waktu shalat Dhuha telah tiba.";
            default: return "Waktu " + nama + " telah tiba untuk wilayah " + (lok.isEmpty() ? "kamu" : lok) + ".";
        }
    }

    /** Uji: adzan berbunyi beberapa detik lagi (untuk dicoba dengan aplikasi ditutup & layar mati) */
    static void uji(Context c, int detik) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        long t = System.currentTimeMillis() + detik * 1000L;
        PendingIntent pi = niat(c, MAKS + 1, "Uji adzan Kisah Lillah", "Bila adzan ini terdengar, pengingat adzan sudah berjalan dengan baik.", "adzan");
        if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) am.setAlarmClock(new AlarmManager.AlarmClockInfo(t, bukaAplikasi(c)), pi);
        else am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
    }

    private static PendingIntent bukaAplikasi(Context c) {
        Intent i = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(c, 99, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private static PendingIntent niat(Context c, int k, String judul, String isi, String jenis) {
        Intent i = new Intent(c, AdzanReceiver.class).setAction("com.kisahlillah.app.ADZAN");
        if (judul != null) i.putExtra("judul", judul).putExtra("isi", isi).putExtra("jenis", jenis);
        return PendingIntent.getBroadcast(c, 100 + k, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }
}
