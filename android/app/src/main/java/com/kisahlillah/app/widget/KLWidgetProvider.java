package com.kisahlillah.app.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.widget.RemoteViews;
import com.kisahlillah.app.MainActivity;
import com.kisahlillah.app.R;
import org.json.JSONArray;
import org.json.JSONObject;

/* Widget layar utama: shalat berikutnya dengan hitung mundur, dan kalimat pengingat yang berganti tiap waktu shalat.
   Data berasal dari plugin KLWidget (aplikasi web menulis daftar 7 hari ke depan). */
public class KLWidgetProvider extends AppWidgetProvider {
    public static final String PREFS = "kl_widget";
    public static final String KEY_JSON = "json";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(ctx, mgr, id);
    }

    private static void render(Context ctx, AppWidgetManager mgr, int id) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.kl_widget);
        long now = System.currentTimeMillis();
        String text = "";
        try {
            String raw = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_JSON, "");
            if (raw == null || raw.isEmpty()) throw new Exception("kosong");
            JSONObject o = new JSONObject(raw);
            JSONArray slots = o.getJSONArray("slots");
            JSONObject next = null, cur = null;
            long nextAt = Long.MAX_VALUE;
            for (int i = 0; i < slots.length(); i++) {
                JSONObject s = slots.getJSONObject(i);
                long at = s.getLong("at");
                if (at > now && at < nextAt) { nextAt = at; next = s; }
                if (at <= now && (cur == null || at > cur.getLong("at"))) cur = s;
            }
            v.setTextViewText(R.id.kl_location, o.optString("location"));
            if (next != null) {
                v.setTextViewText(R.id.kl_prayer, next.getString("prayer") + " " + next.getString("time"));
                // Chronometer hitung mundur berjalan sendiri di layar, tanpa perlu memperbarui widget tiap detik
                long base = SystemClock.elapsedRealtime() + (nextAt - now);
                v.setChronometer(R.id.kl_countdown, base, null, true);
                v.setChronometerCountDown(R.id.kl_countdown, true);
                scheduleRefresh(ctx, nextAt);
            }
            text = cur != null ? cur.optString("text") : "";
        } catch (Exception e) {
            v.setTextViewText(R.id.kl_prayer, "Buka Kisah Lillah");
            v.setTextViewText(R.id.kl_location, "");
        }
        v.setTextViewText(R.id.kl_message, text);
        Intent open = new Intent(ctx, MainActivity.class);
        v.setOnClickPendingIntent(R.id.kl_root, PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
        mgr.updateAppWidget(id, v);
    }

    /* Saat waktu shalat berikutnya tiba, widget digambar ulang supaya kalimat ikut berganti */
    private static void scheduleRefresh(Context ctx, long at) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        Intent i = new Intent(ctx, KLWidgetProvider.class).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        i.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, AppWidgetManager.getInstance(ctx).getAppWidgetIds(new android.content.ComponentName(ctx, KLWidgetProvider.class)));
        PendingIntent pi = PendingIntent.getBroadcast(ctx, 1, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        am.setAndAllowWhileIdle(AlarmManager.RTC, at + 1000, pi);
    }
}
