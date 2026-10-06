import {get,set,keys,toast} from "../store.js";
import {paint,cropPhoto} from "../lib/avatar.js";
import {normalize,validNumber,waUrl,openUrl,DEV} from "../lib/wa.js";
import {settings,save,enable,test,stop} from "../lib/adzan.js";
import {loc} from "../lib/prayer.js";
import {geoState,notifState,useMyLocation,geoMsg,GEO_TXT,NOTIF_TXT} from "../lib/perm.js";
import {ask} from "../lib/ui.js";
import {quranStatus,downloadQuran,prepareTimes,timesStatus} from "../lib/offline.js";
const AERR={"auth/unauthorized-domain":"Domain ini belum diizinkan. Tambahkan di Firebase Console › Authentication › Settings › Authorized domains.","auth/operation-not-allowed":"Login Google belum diaktifkan di Firebase Console › Authentication › Sign-in method.","auth/popup-closed-by-user":"Jendela login ditutup sebelum selesai.","auth/network-request-failed":"Tidak ada koneksi internet.","auth/internal-error":"Firebase menolak permintaan. Periksa API key dan domain di Firebase Console.","auth/api-key-not-valid.-please-pass-a-valid-api-key.":"API key Firebase tidak valid."};
export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`),auth=window.__klAuth,prof=()=>get("profil",{}),ping=n=>document.dispatchEvent(new CustomEvent(n));
  const upd=p=>{set("profil",{...prof(),...p});ping("kl-profile")};
  const ident=()=>{const p=prof(),u=auth?.currentUser;paint($("avatar"),p.name||u?.displayName,p.photo||u?.photoURL);$("rmphoto").hidden=!p.photo};
  $("name").value=prof().name||"";$("wa").value=prof().whatsapp||"";ident();
  $("save").onclick=()=>{const w=$("wa").value.trim();if(w&&!validNumber(w))return toast("Nomor WhatsApp tidak valid");upd({name:$("name").value.trim(),whatsapp:w});ident();toast("Tersimpan")};
  $("watest").onclick=()=>{const w=$("wa").value.trim();if(!validNumber(w))return toast("Isi nomor WhatsApp yang valid dulu");openUrl(waUrl(normalize(w),"Tes Kisah Lillah: WhatsApp terhubung ✓"))};
  $("pick").onclick=()=>$("photo").click();
  $("photo").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
    if(!f.type.startsWith("image/"))return toast("File harus berupa gambar");if(f.size>20*1024*1024)return toast("Foto terlalu besar (maks 20 MB)");
    const url=await cropPhoto(f);if(url===null)toast("Foto tidak dapat diproses, coba foto lain");else if(url){upd({photo:url});ident();toast("Foto profil disimpan")}};
  $("rmphoto").onclick=()=>{upd({photo:""});ident()};
  /* Akun Google */
  const who=u=>{$("who").textContent=u?`${u.displayName||"Pengguna"} · ${u.email}`:"Belum masuk. Masuk agar data tersimpan di cloud dan sama di desktop dan ponsel.";$("login").hidden=!!u;$("logout").hidden=!u;if(u)$("autherr").hidden=true;
    if(u&&!prof().name&&u.displayName){upd({name:u.displayName});$("name").value=u.displayName}ident()};
  const off=auth?auth.onAuthStateChanged(who):()=>{};if(!auth){$("who").textContent="Firebase tidak termuat (periksa koneksi internet lalu muat ulang). Data tersimpan di perangkat ini saja.";$("login").disabled=true}
  const L={off:"Data tersimpan di perangkat ini.",busy:"Menyimpan ke cloud…",ok:"Data tersimpan di cloud.",err:"Gagal sinkron. Periksa koneksi dan aturan Firestore."};
  const st=e=>$("status").textContent=L[(e?.detail?.s)||KLSync.state];document.addEventListener("kl-sync",st);st();
  const fail=e=>{console.warn(e);const m=AERR[e.code]||`Gagal masuk (${e.code||e.message||"error"}).`;$("autherr").hidden=false;$("autherr").textContent=m;toast(m.length>60?"Gagal masuk. Lihat keterangan di kartu akun.":m)};
  $("login").onclick=async()=>{const pr=new firebase.auth.GoogleAuthProvider();try{await auth.signInWithPopup(pr)}catch(e){
    if(e.code==="auth/popup-blocked"||e.code==="auth/cancelled-popup-request"){try{toast("Popup diblokir, mengalihkan ke halaman login…");await auth.signInWithRedirect(pr);return}catch(x){e=x}}fail(e)}};
  $("logout").onclick=()=>auth?.signOut();
  /* Tema & Hijriah */
  const mk=()=>{root.querySelectorAll("[data-t]").forEach(c=>c.classList.toggle("on",c.dataset.t===get("theme","auto")));root.querySelectorAll("[data-h]").forEach(c=>c.classList.toggle("on",+c.dataset.h===get("hijri_offset",0)))};
  root.onclick=e=>{const t=e.target.closest("[data-t]"),h=e.target.closest("[data-h]");
    if(t){set("theme",t.dataset.t);document.documentElement.dataset.theme=t.dataset.t==="auto"?(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"):t.dataset.t;mk()}
    if(h){set("hijri_offset",+h.dataset.h);mk();toast("Koreksi Hijriah disimpan")}};mk();
  /* Lokasi & notifikasi */
  const perms=async()=>{const s=settings(),g=await geoState(),n=notifState();
    $("locname").textContent=loc().name;$("gbadge").textContent=GEO_TXT[g]||"—";$("gbadge").classList.toggle("warn",g==="denied");
    $("nbadge").textContent=NOTIF_TXT[n]||"—";$("nbadge").classList.toggle("warn",n==="denied");
    $("perm").textContent=n==="denied"?"Diblokir di pengaturan browser/HP":s.notif?"Aktif untuk 5 waktu shalat":"Belum aktif";
    $("tnotif").setAttribute("aria-pressed",s.notif);$("tnotif").textContent=s.notif?"Matikan":"Aktifkan";$("tsound").setAttribute("aria-pressed",s.sound);$("tsound").textContent=s.sound?"Aktif":"Mati"};
  $("gps").onclick=async()=>{const b=$("gps");b.disabled=true;b.textContent="Mencari…";try{const l=await useMyLocation();toast("Lokasi diatur: "+l.name)}catch(e){toast(geoMsg(e))}b.disabled=false;b.textContent="Gunakan lokasi saya";perms()};
  $("tnotif").onclick=async()=>{if(settings().notif)save({notif:false});else{const r=await enable();
      if(r!=="granted"){toast(r==="insecure"?"Butuh HTTPS atau localhost":r==="denied"?"Izin notifikasi ditolak. Ubah lewat pengaturan situs di browser.":"Notifikasi tidak tersedia di perangkat ini");perms();return}save({notif:true})}ping("kl-adzan");perms()};
  $("tsound").onclick=()=>{save({sound:!settings().sound});ping("kl-adzan");perms()};$("atest").onclick=()=>test();$("astop").onclick=()=>stop();perms();
  /* Offline */
  const off2=async()=>{const q=await quranStatus(),t=timesStatus();$("qstat").textContent=!q.ok?"Penyimpanan offline tidak tersedia di browser ini":q.n>=114?"Lengkap, siap dibaca tanpa internet":q.n?`${q.n} dari 114 surah tersimpan`:"Belum diunduh (± 5 MB)";$("qdl").disabled=!q.ok||q.n>=114;$("qdl").textContent=q.n>=114?"Tersimpan":"Unduh";
    $("tstat").textContent=t?"Tersimpan untuk lokasi saat ini":"Belum disiapkan";};
  $("qdl").onclick=async()=>{if(!navigator.onLine)return toast("Perlu internet untuk mengunduh");const b=$("qdl"),w=$("qbarw"),bar=$("qbar");b.disabled=true;w.hidden=false;
    const r=await downloadQuran((d,t)=>{bar.style.width=Math.round(d/t*100)+"%";b.textContent=`${d}/${t}`});w.hidden=true;toast(r.failed.length?`${r.failed.length} surah gagal, coba lagi`:"Al-Qur'an siap offline");off2()};
  $("tdl").onclick=async()=>{if(!navigator.onLine)return toast("Perlu internet untuk menyiapkan");$("tdl").disabled=true;const n=await prepareTimes();$("tdl").disabled=false;toast(n?"Jadwal shalat siap offline":"Gagal. Jadwal tetap dihitung lokal saat offline");off2()};off2();
  /* Cadangan */
  $("export").onclick=()=>{const o={};keys("").filter(k=>!/^(cache|sync_meta)/.test(k)).forEach(k=>o[k]=localStorage.getItem("kl2_"+k));
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));a.download=`kisah-lillah-${new Date().toISOString().slice(0,10)}.json`;a.click()};
  $("import").onclick=()=>$("file").click();
  $("file").onchange=async e=>{try{const o=JSON.parse(await e.target.files[0].text());Object.entries(o).forEach(([k,v])=>{if(typeof v==="string"&&!/^(cache|sync_meta)/.test(k))localStorage.setItem("kl2_"+k,v)});toast("Data dipulihkan");setTimeout(()=>location.reload(),600)}catch(x){toast("File cadangan tidak valid")}};
  $("wipe").onclick=async()=>{if(await ask("Hapus semua data?","Semua data di perangkat ini dihapus. Jika sedang masuk dengan Google, data di cloud juga ikut terhapus.","Hapus semua")){keys("").forEach(k=>localStorage.removeItem("kl2_"+k));location.reload()}};
  /* Laporan bug */
  const bn=$("bname"),br=$("breason"),bs=$("bsend"),bv=$("bval");bn.value=prof().name||"";
  const chk=()=>{const ok=bn.value.trim().length>=2&&br.value.trim().length>=10;bs.disabled=!ok;bv.textContent=ok?"Siap dikirim ke WhatsApp pengembang.":"Lengkapi nama dan alasan (minimal 10 karakter) agar laporan dapat dikirim."};
  bn.oninput=br.oninput=chk;chk();
  bs.onclick=()=>{if(bs.disabled)return;openUrl(waUrl(DEV,`LAPORAN BUG KISAH LILLAH\n\nNama: ${bn.value.trim()}\nAlasan/Masalah:\n${br.value.trim()}\n\nPerangkat: ${navigator.userAgent.slice(0,120)}\n\nMohon dicek.`));toast("WhatsApp dibuka dengan laporan")};
  return()=>{off();document.removeEventListener("kl-sync",st)};
}
