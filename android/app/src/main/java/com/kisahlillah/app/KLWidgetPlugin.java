package com.kisahlillah.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.kisahlillah.app.widget.KLWidgetProvider;

/* Dipanggil dari web (js/lib/widgetdata.js): menyimpan jadwal dan kalimat, lalu memberi tahu widget untuk menggambar ulang */
@CapacitorPlugin(name = "KLWidget")
public class KLWidgetPlugin extends Plugin {
    @PluginMethod
    public void setData(PluginCall call) {
        String json = call.getString("json", "");
        Context ctx = getContext();
        SharedPreferences.Editor ed = ctx.getSharedPreferences(KLWidgetProvider.PREFS, Context.MODE_PRIVATE).edit();
        ed.putString(KLWidgetProvider.KEY_JSON, json).apply();
        Intent i = new Intent(ctx, KLWidgetProvider.class).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(ctx).getAppWidgetIds(new ComponentName(ctx, KLWidgetProvider.class));
        i.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        ctx.sendBroadcast(i);
        call.resolve(new JSObject());
    }
}
