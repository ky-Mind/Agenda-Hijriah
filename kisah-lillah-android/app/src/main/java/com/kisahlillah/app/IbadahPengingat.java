package com.kisahlillah.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Pengingat ibadah harian ("Waktunya dzikir pagi", Dhuha, Al-Kahfi, …): 3 kali tiap 5 menit lalu berhenti.
 * Daftarnya dihitung aplikasi web (js/lib/widgetdata.js, kunci "ibadah") dan ikut tersimpan bersama data widget,
 * jadi ibadah yang sudah dicatat di Absensi langsung hilang dari daftar. Beberapa yang terdekat dipasang sebagai alarm;
 * tiap kali berbunyi (dan saat aplikasi dibuka / HP menyala ulang) dipasang lagi yang berikutnya.
 */
final class IbadahPengingat {
    private IbadahPengingat() {}
    static final String AKSI = "com.kisahlillah.app.IBADAH";
    private static final int MAKS = 12, KODE = 300;

    static void pasang(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        for (int k = 0; k < MAKS; k++) am.cancel(niat(c, k, null, null, null));
        JSONArray A;
        try { A = new JSONObject(Widget.pref(c).getString("widget", "{}")).optJSONArray("ibadah"); } catch (Exception e) { A = null; }
        if (A == null) return;
        long kini = System.currentTimeMillis();
        boolean tepat = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        int n = 0;
        for (int i = 0; i < A.length() && n < MAKS; i++) {
            JSONObject o = A.optJSONObject(i);
            if (o == null) continue;
            long t = o.optLong("at");
            if (t <= kini) continue;
            PendingIntent pi = niat(c, n, o.optString("judul"), o.optString("isi"), o.optString("tag"));
            try {
                if (tepat) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
                else am.setWindow(AlarmManager.RTC_WAKEUP, t, 60_000L, pi);
            } catch (SecurityException e) { am.setWindow(AlarmManager.RTC_WAKEUP, t, 60_000L, pi); }
            n++;
        }
    }

    private static PendingIntent niat(Context c, int k, String judul, String isi, String tag) {
        Intent i = new Intent(c, AdzanReceiver.class).setAction(AKSI);
        if (judul != null) i.putExtra("judul", judul).putExtra("isi", isi).putExtra("tag", tag);
        return PendingIntent.getBroadcast(c, KODE + k, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }
}
