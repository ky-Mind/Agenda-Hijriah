package com.kisahlillah.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;

/**
 * Data & penggambaran dua widget layar utama (WidgetJadwal, WidgetPengingat).
 * Jadwal dihitung aplikasi web (js/lib/widgetdata.js > buildPayload) lalu dikirim lewat jembatan KLAndroid:
 * {"updated":ms,"location":"Bandung, Jawa Barat · WIB","slots":[{"at":ms,"prayer":"Subuh","time":"04:01","text":"…"},…7 hari]}
 * Widget digambar ulang saat data datang, tiap pergantian waktu (dan +10 menit), dan paling lama tiap 15 menit.
 */
final class Widget {
    private Widget() {}
    static final String SEGAR = "com.kisahlillah.app.WIDGET_SEGAR";
    private static final int[] SEL = {R.id.w0, R.id.w1, R.id.w2, R.id.w3, R.id.w4};
    private static final int[] NAMA = {R.id.wn0, R.id.wn1, R.id.wn2, R.id.wn3, R.id.wn4};
    private static final int[] JAM = {R.id.wj0, R.id.wj1, R.id.wj2, R.id.wj3, R.id.wj4};
    static final String[] HARI = {"Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"};
    static final String[] MASEHI = {"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"};
    static final String[] HIJRI = {"Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Syaban", "Ramadhan", "Syawal", "Dzulqaidah", "Dzulhijjah"};

    static SharedPreferences pref(Context c) { return c.getSharedPreferences("kl", Context.MODE_PRIVATE); }

    static void simpan(Context c, String json) {
        pref(c).edit().putString("widget", json).apply();
        segarkan(c);
        AdzanJadwal.pasang(c);
    }

    /** Waktu shalat dari data tersimpan: [nama, jam, epoch ms, kalimat] */
    static ArrayList<Object[]> slot(Context c) { return slot(c, "slots"); }

    /** kunci "slots" (5 waktu shalat, juga untuk widget) atau "extra" (Imsak, Terbit, Dhuha: hanya untuk pengingat) */
    static ArrayList<Object[]> slot(Context c, String kunci) {
        ArrayList<Object[]> L = new ArrayList<>();
        try {
            JSONArray A = new JSONObject(pref(c).getString("widget", "{}")).optJSONArray(kunci);
            if (A == null) return L;
            for (int i = 0; i < A.length(); i++) {
                JSONObject o = A.getJSONObject(i);
                L.add(new Object[]{o.optString("prayer"), o.optString("time"), o.getLong("at"), o.optString("text")});
            }
        } catch (Exception ignored) {}
        return L;
    }

    /** Keadaan saat ini dari data tersimpan */
    private static final class Kini {
        String lok = "", zona = "", cur = "", next = "", nextJam = "", kata = "";
        long nextT = 0, curT = 0, ubah = 0;
        ArrayList<Object[]> hari = new ArrayList<>();  // waktu shalat hari berjalan
        int sorot = -1;  // waktu yang disorot (tetap 10 menit setelah masuk, lalu pindah ke berikutnya)
    }

    private static Kini hitung(Context c) {
        Kini k = new Kini();
        try {
            String lokasi = new JSONObject(pref(c).getString("widget", "{}")).optString("location");
            int p = lokasi.lastIndexOf(" · ");
            k.lok = p > 0 ? lokasi.substring(0, p) : lokasi;
            k.zona = p > 0 ? lokasi.substring(p + 3) : "";
        } catch (Exception ignored) {}
        ArrayList<Object[]> S = slot(c);
        if (S.isEmpty()) return k;
        long now = System.currentTimeMillis(), sepuluh = 10 * 60_000L;
        /* Kelompokkan per tanggal; hari berjalan = hari pertama yang Isya-nya (+10 menit) belum lewat */
        ArrayList<ArrayList<Object[]>> H = new ArrayList<>();
        String kunci = null;
        Calendar cal = Calendar.getInstance();
        for (Object[] s : S) {
            cal.setTimeInMillis((long) s[2]);
            String kk = cal.get(Calendar.YEAR) + "-" + cal.get(Calendar.DAY_OF_YEAR);
            if (!kk.equals(kunci)) { H.add(new ArrayList<>()); kunci = kk; }
            H.get(H.size() - 1).add(s);
        }
        ArrayList<Object[]> hh = H.get(H.size() - 1);
        for (ArrayList<Object[]> h : H) if (now < (long) h.get(h.size() - 1)[2] + sepuluh) { hh = h; break; }
        k.hari = hh;
        for (int i = 0; i < hh.size(); i++) {
            long t = (long) hh.get(i)[2];
            if (k.sorot < 0 && now < t + sepuluh) { k.sorot = i; k.ubah = t + sepuluh; }
        }
        if (k.sorot < 0) k.sorot = 0;
        for (Object[] s : S) {
            long t = (long) s[2];
            if (t <= now) { k.cur = (String) s[0]; k.curT = t; k.kata = (String) s[3]; }
            if (t > now && k.nextT == 0) { k.next = (String) s[0]; k.nextJam = (String) s[1]; k.nextT = t; }
        }
        if (k.kata.isEmpty()) k.kata = (String) S.get(0)[3];
        long batas = now + 15 * 60_000L;
        if (k.nextT > 0) batas = Math.min(batas, k.nextT);
        if (k.ubah > now) batas = Math.min(batas, k.ubah);
        k.ubah = batas;
        return k;
    }

    /** "Kamis, 5 November 2026 · 14 Jumadil Awal 1448 H" (Hijriah Umm al-Qura + koreksi dari pengaturan aplikasi) */
    static String tanggal(Context c) {
        Calendar m = Calendar.getInstance();
        String s = HARI[m.get(Calendar.DAY_OF_WEEK) - 1] + ", " + m.get(Calendar.DAY_OF_MONTH) + " " + MASEHI[m.get(Calendar.MONTH)] + " " + m.get(Calendar.YEAR);
        try {
            android.icu.util.IslamicCalendar h = new android.icu.util.IslamicCalendar();
            h.setCalculationType(android.icu.util.IslamicCalendar.CalculationType.ISLAMIC_UMALQURA);
            h.setTimeInMillis(System.currentTimeMillis() + pref(c).getInt("hijri_offset", 0) * 86_400_000L);
            s += " · " + h.get(android.icu.util.Calendar.DAY_OF_MONTH) + " " + HIJRI[h.get(android.icu.util.Calendar.MONTH)] + " " + h.get(android.icu.util.Calendar.YEAR) + " H";
        } catch (Exception ignored) {}
        return s;
    }

    private static String sisa(long ms) {
        long m = Math.max(0, (ms + 59_999) / 60_000), j = m / 60;
        return j > 0 ? j + " j " + (m % 60) + " m lagi" : m + " menit lagi";
    }

    /** Pesan pengingat: berganti sesuai keadaan waktu shalat */
    private static String pesan(Kini k) {
        long now = System.currentTimeMillis();
        if (k.nextT == 0) return "Assalamu'alaikum! Buka Kisah Lillah sekali agar jadwal shalatmu tersimpan.";
        long mnt = (k.nextT - now) / 60_000L, sejak = k.curT > 0 ? (now - k.curT) / 60_000L : 9999;
        int jam = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (mnt <= 15) return "Sebentar lagi " + k.next + ". Yuk ambil wudhu dulu, biar tenang.";
        if (sejak <= 30 && !k.cur.isEmpty()) return "Waktu " + k.cur + " sudah masuk. Sudah shalat? Jangan ditunda ya.";
        if ("Subuh".equals(k.cur) && jam >= 6 && jam < 11) return "Pagi yang berkah. Sempatkan shalat Dhuha, walau dua rakaat.";
        if (jam >= 21 || jam < 3) return "Sebelum tidur, muhasabah dan dzikir ya. Pasang niat bangun Subuh.";
        if (!k.kata.isEmpty()) return k.kata;
        return "Jaga istiqomah, catat ibadahmu hari ini.";
    }

    private static String pesanPendek(Kini k) {
        long now = System.currentTimeMillis();
        if (k.nextT == 0) return "Buka aplikasi dulu";
        long mnt = (k.nextT - now) / 60_000L, sejak = k.curT > 0 ? (now - k.curT) / 60_000L : 9999;
        int jam = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (mnt <= 15) return "Yuk ambil wudhu";
        if (sejak <= 30 && !k.cur.isEmpty()) return "Sudah shalat?";
        if ("Subuh".equals(k.cur) && jam >= 6 && jam < 11) return "Sempatkan Dhuha";
        if (jam >= 21 || jam < 3) return "Muhasabah & dzikir";
        return "Jaga istiqomah";
    }

    private static int latarWaktu(String w) {
        switch (w == null ? "" : w) {
            case "Subuh": return R.drawable.widget_duo_subuh;
            case "Dzuhur": return R.drawable.widget_duo_dzuhur;
            case "Ashar": return R.drawable.widget_duo_ashar;
            case "Maghrib": return R.drawable.widget_duo_maghrib;
            case "Isya": return R.drawable.widget_duo_isya;
            default: return R.drawable.widget_duo_umum;
        }
    }

    private static PendingIntent buka(Context c, String hash, int kode) {
        Intent i = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP)
                .setData(android.net.Uri.parse(MainActivity.AWAL + "#/" + hash));
        return PendingIntent.getActivity(c, kode, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static void segarkan(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        Kini k = hitung(c);
        int[] A = m.getAppWidgetIds(new ComponentName(c, WidgetJadwal.class));
        int[] B = m.getAppWidgetIds(new ComponentName(c, WidgetPengingat.class));
        if (A.length > 0) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_jadwal);
            v.setOnClickPendingIntent(R.id.wakar, buka(c, "shalat", 3));
            v.setTextViewText(R.id.wlok, k.cur.isEmpty() ? (k.lok.isEmpty() ? "Jadwal shalat" : k.lok) : k.lok.isEmpty() ? "Sekarang · " + k.cur : k.lok.split(",")[0] + " · " + k.cur);
            v.setTextViewText(R.id.wzona, k.zona);
            /* Hitung mundur berjalan sendiri (Chronometer), tanpa memperbarui widget tiap detik */
            if (k.nextT > 0) {
                v.setChronometer(R.id.wnext, android.os.SystemClock.elapsedRealtime() + (k.nextT - System.currentTimeMillis()), "Menuju " + k.next + " · -%s", true);
                v.setChronometerCountDown(R.id.wnext, true);
            } else v.setChronometer(R.id.wnext, android.os.SystemClock.elapsedRealtime(), "Buka aplikasi untuk memuat jadwal", false);
            v.setTextViewText(R.id.wtgl, tanggal(c));
            v.setTextViewText(R.id.wkata, k.kata.isEmpty() ? "" : "“" + k.kata + "”");
            for (int i = 0; i < SEL.length; i++) {
                boolean ada = i < k.hari.size(), on = ada && i == k.sorot;
                if (ada) { v.setTextViewText(NAMA[i], (String) k.hari.get(i)[0]); v.setTextViewText(JAM[i], (String) k.hari.get(i)[1]); }
                v.setInt(SEL[i], "setBackgroundResource", on ? R.drawable.widget_ubin_aktif : R.drawable.widget_ubin);
                v.setTextColor(NAMA[i], on ? 0xFF2D5547 : 0xE6FFFFFF);
                v.setTextColor(JAM[i], on ? 0xFF2D5547 : 0xFFFFFFFF);
            }
            m.updateAppWidget(A, v);
        }
        if (B.length > 0) {
            /* Ukuran bawaan kecil (2×1); bila diperbesar (Android 12+) tampil layout besar */
            RemoteViews kecil = pengingat(c, k, R.layout.widget_pengingat_kecil, true);
            RemoteViews v = kecil;
            if (android.os.Build.VERSION.SDK_INT >= 31) {
                java.util.Map<android.util.SizeF, RemoteViews> U = new java.util.HashMap<>();
                U.put(new android.util.SizeF(100f, 40f), kecil);
                U.put(new android.util.SizeF(230f, 140f), pengingat(c, k, R.layout.widget_pengingat, false));
                v = new RemoteViews(U);
            }
            m.updateAppWidget(B, v);
        }
        if (A.length + B.length > 0) jadwalkan(c, k.ubah > 0 ? k.ubah : System.currentTimeMillis() + 15 * 60_000L);
    }

    /** Isi widget Pengingat: jam shalat berikutnya, warna latar mengikuti waktu shalat yang dituju */
    private static RemoteViews pengingat(Context c, Kini k, int layout, boolean pendek) {
        RemoteViews v = new RemoteViews(c.getPackageName(), layout);
        v.setOnClickPendingIntent(R.id.pakar, buka(c, "absensi", 5));
        v.setInt(R.id.pakar, "setBackgroundResource", latarWaktu(k.next));
        v.setTextViewText(R.id.pwaktu, k.nextT > 0 ? k.nextJam : "--:--");
        String s = sisa(k.nextT - System.currentTimeMillis());
        if (pendek) s = s.replace(" lagi", "").replace("menit", "mnt");
        v.setTextViewText(R.id.psisa, k.nextT > 0 ? k.next + " · " + s : "Jadwal shalat");
        v.setTextViewText(R.id.ppesan, pendek ? pesanPendek(k) : pesan(k));
        return v;
    }

    /** Gambar ulang pada pergantian waktu berikutnya (tidak membangunkan HP; diperbarui saat layar menyala) */
    private static void jadwalkan(Context c, long t) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = PendingIntent.getBroadcast(c, 4, new Intent(c, WidgetJadwal.class).setAction(SEGAR), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        am.set(AlarmManager.RTC, Math.max(t, System.currentTimeMillis() + 30_000L), pi);
    }
}
