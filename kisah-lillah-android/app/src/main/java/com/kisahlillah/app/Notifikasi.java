package com.kisahlillah.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

/** Saluran & tampilan notifikasi: adzan (suara adzan), adzan Subuh, waktu shalat (tanpa adzan), dan umum. */
final class Notifikasi {
    private Notifikasi() {}
    static final int WARNA = 0xFF3F6B5A;

    static void siapkanKanal(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        AudioAttributes aa = new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
        NotificationChannel adzan = new NotificationChannel("adzan", "Adzan", NotificationManager.IMPORTANCE_HIGH);
        adzan.setDescription("Suara adzan saat masuk waktu shalat");
        adzan.setSound(suara(c, R.raw.adzan), aa);
        NotificationChannel subuh = new NotificationChannel("adzan_subuh", "Adzan Subuh", NotificationManager.IMPORTANCE_HIGH);
        subuh.setDescription("Suara adzan Subuh");
        subuh.setSound(suara(c, R.raw.adzan_subuh), aa);
        NotificationChannel waktu = new NotificationChannel("waktu", "Waktu shalat (tanpa adzan)", NotificationManager.IMPORTANCE_HIGH);
        NotificationChannel umum = new NotificationChannel("umum", "Pemberitahuan aplikasi", NotificationManager.IMPORTANCE_HIGH);
        for (NotificationChannel k : new NotificationChannel[]{adzan, subuh, waktu, umum}) { k.enableVibration(true); k.setVibrationPattern(new long[]{0, 200, 100, 200, 100, 300}); k.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC); }
        NotificationChannel bunyi = new NotificationChannel("adzan_bunyi", "Adzan berbunyi", NotificationManager.IMPORTANCE_HIGH);
        bunyi.setDescription("Notifikasi saat adzan sedang diputar (ada tombol Hentikan)");
        bunyi.setSound(null, null);
        bunyi.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        NotificationChannel info = new NotificationChannel("adzan_info", "Riwayat waktu shalat", NotificationManager.IMPORTANCE_LOW);
        info.setSound(null, null);
        NotificationChannel senyap = new NotificationChannel("waktu_senyap", "Waktu shalat (senyap)", NotificationManager.IMPORTANCE_DEFAULT);
        senyap.setDescription("Pengingat waktu yang diatur Senyap: muncul tanpa bunyi dan getar");
        senyap.setSound(null, null);
        senyap.enableVibration(false);
        senyap.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        NotificationChannel pesan = new NotificationChannel("pesan", "Pesan", NotificationManager.IMPORTANCE_HIGH);
        pesan.setDescription("Pesan dan permintaan chat baru (muncul walau aplikasi ditutup)");
        pesan.enableVibration(true);
        pesan.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        for (NotificationChannel k : new NotificationChannel[]{adzan, subuh, waktu, umum, bunyi, info, senyap, pesan}) nm.createNotificationChannel(k);
    }

    private static Uri suara(Context c, int raw) { return Uri.parse("android.resource://" + c.getPackageName() + "/" + raw); }

    private static PendingIntent buka(Context c) {
        Intent i = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP).setData(Uri.parse(MainActivity.AWAL + "#/shalat"));
        return PendingIntent.getActivity(c, 0, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private static Notification.Builder dasar(Context c, String kanal, String judul, String isi) {
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, kanal) : new Notification.Builder(c);
        return b.setSmallIcon(R.drawable.ic_notif).setColor(WARNA).setContentTitle(judul).setContentText(isi)
                .setStyle(new Notification.BigTextStyle().bigText(isi)).setContentIntent(buka(c)).setVisibility(Notification.VISIBILITY_PUBLIC);
    }

    /** Notifikasi layanan pemutar adzan: ada tombol Hentikan; digeser = berhenti juga */
    @SuppressWarnings("deprecation")
    static Notification adzanBerbunyi(Context c, String judul, String isi) {
        siapkanKanal(c);
        PendingIntent stop = PendingIntent.getService(c, 1, new Intent(c, AdzanLayanan.class).setAction(AdzanLayanan.STOP), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = dasar(c, "adzan_bunyi", judul, isi).setDeleteIntent(stop).setCategory(Notification.CATEGORY_ALARM)
                .addAction(new Notification.Action.Builder(null, "Hentikan adzan", stop).build());
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_HIGH);
        return b.build();
    }

    static void info(Context c, String judul, String isi) {
        siapkanKanal(c);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        try { nm.notify(8, dasar(c, "adzan_info", judul, isi).setAutoCancel(true).build()); } catch (Exception ignored) {}
    }

    /** Pesan baru dari FCM. url = "./#/pesan/<id>" dibuka di aplikasi saat notifikasi diketuk; satu notifikasi per chat (tag) */
    static void pesan(Context c, String judul, String isi, String tag, String url) {
        siapkanKanal(c);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        String hash = url == null ? "#/pesan" : url.replaceFirst("^\\./", "");
        if (!hash.startsWith("#")) hash = "#/pesan";
        Intent i = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(MainActivity.AWAL + hash), c, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int id = 3000 + Math.abs((tag == null ? "pesan" : tag).hashCode() % 5000);
        PendingIntent pi = PendingIntent.getActivity(c, id, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = dasar(c, "pesan", judul, isi).setContentIntent(pi).setAutoCancel(true).setCategory(Notification.CATEGORY_MESSAGE)
                .setWhen(System.currentTimeMillis()).setShowWhen(true);
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_HIGH).setDefaults(Notification.DEFAULT_ALL);
        try { nm.notify(id, b.build()); } catch (Exception ignored) {}
    }

    /** ok | izin (izin notifikasi belum diberikan) | mati (notifikasi aplikasi dimatikan) */
    static String cek(Context c) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return "mati";
        if (Build.VERSION.SDK_INT >= 33 && c.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) return "izin";
        return nm.areNotificationsEnabled() ? "ok" : "mati";
    }

    @SuppressWarnings("deprecation")
    static void tampil(Context c, String judul, String isi, String kanal) {
        siapkanKanal(c);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        Notification.Builder b = dasar(c, kanal, judul, isi).setAutoCancel(true)
                .setCategory(kanal.startsWith("adzan") || "waktu".equals(kanal) ? Notification.CATEGORY_ALARM : Notification.CATEGORY_MESSAGE);
        if (Build.VERSION.SDK_INT < 26) {
            b.setPriority(Notification.PRIORITY_HIGH).setVibrate(new long[]{0, 200, 100, 200, 100, 300});
            if ("waktu_senyap".equals(kanal)) b.setPriority(Notification.PRIORITY_DEFAULT).setVibrate(null).setSound(null);
            else if ("adzan".equals(kanal)) b.setSound(suara(c, R.raw.adzan));
            else if ("adzan_subuh".equals(kanal)) b.setSound(suara(c, R.raw.adzan_subuh));
            else b.setDefaults(Notification.DEFAULT_SOUND);
        }
        try { nm.notify(kanal.startsWith("adzan") || kanal.startsWith("waktu") ? 7 : (int) (System.currentTimeMillis() % 100000), b.build()); } catch (Exception ignored) {}
    }
}
