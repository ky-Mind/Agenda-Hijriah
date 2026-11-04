package com.kisahlillah.app;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/**
 * Memutar suara adzan sebagai layanan latar depan dengan volume alarm, jadi tetap berbunyi walau suara
 * notifikasi HP dibisukan. Notifikasinya punya tombol "Hentikan adzan".
 */
public class AdzanLayanan extends Service {
    static final String STOP = "com.kisahlillah.app.ADZAN_STOP";
    static final int ID = 7;
    private MediaPlayer mp;
    private String judul = "", isi = "";

    static void mulai(Context c, String judul, String isi, String jenis) {
        Intent i = new Intent(c, AdzanLayanan.class).putExtra("judul", judul).putExtra("isi", isi).putExtra("jenis", jenis);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
    }

    static void henti(Context c) { c.stopService(new Intent(c, AdzanLayanan.class)); }

    @Override
    public int onStartCommand(Intent i, int flags, int startId) {
        if (i != null && STOP.equals(i.getAction())) { selesai(false); return START_NOT_STICKY; }
        judul = i != null && i.getStringExtra("judul") != null ? i.getStringExtra("judul") : "Waktu shalat telah tiba";
        isi = i != null && i.getStringExtra("isi") != null ? i.getStringExtra("isi") : "";
        String jenis = i != null ? i.getStringExtra("jenis") : "adzan";
        Notification n = Notifikasi.adzanBerbunyi(this, judul, isi);
        if (Build.VERSION.SDK_INT >= 29) startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(ID, n);
        putar(jenis);
        return START_NOT_STICKY;
    }

    private void putar(String jenis) {
        lepas();
        try {
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            mp.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            int raw = "subuh".equals(jenis) ? R.raw.adzan_subuh : R.raw.adzan;
            mp.setDataSource(this, Uri.parse("android.resource://" + getPackageName() + "/" + raw));
            mp.setOnCompletionListener(m -> selesai(true));
            mp.setOnErrorListener((m, a, b) -> { selesai(true); return true; });
            mp.prepare();
            mp.start();
        } catch (Exception e) { selesai(true); }
    }

    /** Selesai/dihentikan: suara berhenti; bila selesai sendiri, tinggalkan notifikasi biasa tanpa suara */
    private void selesai(boolean tinggalkanInfo) {
        lepas();
        if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE); else stopForeground(true);
        if (tinggalkanInfo) Notifikasi.info(this, judul, isi);
        stopSelf();
    }

    private void lepas() {
        if (mp != null) { try { mp.stop(); } catch (Exception ignored) {} mp.release(); mp = null; }
    }

    @Override public void onDestroy() { lepas(); super.onDestroy(); }

    @Override public IBinder onBind(Intent i) { return null; }
}
