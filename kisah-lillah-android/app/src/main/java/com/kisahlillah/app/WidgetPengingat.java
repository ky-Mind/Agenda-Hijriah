package com.kisahlillah.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;

/** Widget Pengingat Shalat: logo Kisah Lillah, warna latar sesuai waktu shalat berikutnya; kecil 2×1, bisa diperbesar */
public class WidgetPengingat extends AppWidgetProvider {
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { Widget.segarkan(c); }
    @Override public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, Bundle b) { Widget.segarkan(c); }
}
