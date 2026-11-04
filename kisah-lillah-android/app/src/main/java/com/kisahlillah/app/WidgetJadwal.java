package com.kisahlillah.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;

/** Widget Jadwal Shalat (kartu hijau + lima waktu shalat). Juga penerima alarm penyegaran kedua widget. */
public class WidgetJadwal extends AppWidgetProvider {
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { Widget.segarkan(c); }
    @Override public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        String a = i.getAction();
        if (Widget.SEGAR.equals(a) || Intent.ACTION_TIME_CHANGED.equals(a) || Intent.ACTION_TIMEZONE_CHANGED.equals(a)) Widget.segarkan(c);
    }
}
