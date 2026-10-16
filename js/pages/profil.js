import {get,set,keys,toast} from "../store.js";
import {paint,cropPhoto} from "../lib/avatar.js";
import {normalize,validNumber,waUrl,openUrl,DEV} from "../lib/wa.js";
import {settings,save,enable,test,stop} from "../lib/adzan.js";
import {loc} from "../lib/prayer.js";
import {geoState,notifState,useMyLocation,geoMsg,GEO_TXT,NOTIF_TXT} from "../lib/perm.js";
import {ask,copy} from "../lib/ui.js";
import * as chat from "../lib/chat.js";
import * as push from "../lib/push.js";
import {dialog} from "../lib/ui.js";
import {quranStatus,downloadQuran,prepareTimes,timesStatus} from "../lib/offline.js";
const AERR={"auth/unauthorized-domain":"Domain ini belum diizinkan. Tambahkan di Firebase Console › Authentication › Settings › Authorized domains.","auth/operation-not-allowed":"Login Google belum diaktifkan di Firebase Console › Authentication › Sign-in method.","auth/popup-closed-by-user":"Jendela login ditutup sebelum selesai.","auth/network-request-failed":"Tidak ada koneksi internet.","auth/internal-error":"Firebase menolak permintaan. Periksa API key dan domain di Firebase Console.","auth/api-key-not-valid.-please-pass-a-valid-api-key.":"API key Firebase tidak valid."};
export default function(root){
  /* tab pengaturan */
  {const tabs=[...root.querySelectorAll("[data-tab]")],gs=[...root.querySelectorAll("[data-g]")],show=t=>{gs.forEach(g=>{g.hidden=g.dataset.g!==t});tabs.forEach(b=>{const on=b.dataset.tab===t;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});try{sessionStorage.setItem("kl_ptab",t)}catch(e){}};
   tabs.forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));let t0="profil";try{t0=sessionStorage.getItem("kl_ptab")||"profil"}catch(e){}show(tabs.some(b=>b.dataset.tab===t0)?t0:"profil")}
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
  const who=u=>{$("who").textContent=u?`${u.displayName||"Pengguna"} · ${u.email}`:"Belum masuk. Masuk agar data tersimpan di cloud dan sama di desktop dan ponsel.";$("login").hidden=!!u;$("logout").hidden=!u;$("syncnow").hidden=!u;if(u)$("autherr").hidden=true;
    if(u&&!prof().name&&u.displayName){upd({name:u.displayName});$("name").value=u.displayName}ident()};
  const off=auth?auth.onAuthStateChanged(who):()=>{};if(!auth){$("who").textContent="Firebase tidak termuat (periksa koneksi internet lalu muat ulang). Data tersimpan di perangkat ini saja.";$("login").disabled=true}
  const RULES=`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null && request.auth.token.email_verified == true; }
    function owner(uid) { return request.auth != null && request.auth.uid == uid; }

    match /users/{uid} {
      allow read, write: if owner(uid);                       // profil (data lama Agenda)
      match /absensi_harian/{day} { allow read, write: if owner(uid); }
      match /data/{doc} {                                      // sinkron antar perangkat
        allow read: if owner(uid);
        allow write: if owner(uid) && request.resource.data.keys().size() < 2000;
      }
    }

    // Pesan: pencarian persis berdasarkan email (tidak bisa di-list)
    match /userIndex/{email} {
      allow get: if signedIn();
      allow create, update: if signedIn()
        && request.auth.token.email.lower() == email
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(['uid', 'name', 'email', 'updated', 'pub', 'photo'])
        && (!('photo' in request.resource.data) || (request.resource.data.photo is string && request.resource.data.photo.size() <= 9000))
        && request.resource.data.name is string && request.resource.data.name.size() <= 60
        && request.resource.data.pub is string && request.resource.data.pub.size() <= 300;
      allow delete: if signedIn() && resource.data.uid == request.auth.uid;
    }

    match /chats/{chatId} {
      // hanya boleh mengubah entri kunci publik milik sendiri
      function ownPubOnly() {
        return !request.resource.data.diff(resource.data).affectedKeys().hasAny(['pubs'])
          || request.resource.data.pubs.diff(resource.data.pubs).affectedKeys().hasOnly([request.auth.uid]);
      }
      allow get, list: if signedIn() && request.auth.uid in resource.data.members;
      allow create: if signedIn()
        && request.resource.data.members.size() == 2
        && request.auth.uid in request.resource.data.members
        && (chatId == request.resource.data.members[0] + '_' + request.resource.data.members[1]
            || chatId == request.resource.data.members[1] + '_' + request.resource.data.members[0])
        && request.resource.data.status == 'pending'
        && request.resource.data.requestedBy == request.auth.uid
        && request.resource.data.pubs[request.auth.uid] is string
        && request.resource.data.intro.size() <= 400;
      allow update: if signedIn()
        && request.auth.uid in resource.data.members
        && request.resource.data.members == resource.data.members
        && request.resource.data.requestedBy == resource.data.requestedBy
        && (
          // pesan baru / tanda baca / memperbarui kunci publik sendiri
          (resource.data.status == 'active' && request.resource.data.status == 'active'
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastMessage', 'lastAt', 'lastFrom', 'lastRead', 'pubs'])
            && ownPubOnly()
            && request.resource.data.lastMessage.size() <= 900)
          // penerima menerima permintaan
          || (resource.data.status == 'pending' && resource.data.requestedBy != request.auth.uid
            && request.resource.data.status == 'active'
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'lastAt', 'lastRead', 'pubs'])
            && ownPubOnly())
          // blokir
          || (resource.data.status == 'active' && request.resource.data.status == 'blocked'
            && request.resource.data.blockedBy == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'blockedBy']))
          // buka blokir (hanya pemblokir)
          || (resource.data.status == 'blocked' && resource.data.blockedBy == request.auth.uid
            && request.resource.data.status == 'active'
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'blockedBy']))
        );
      allow delete: if signedIn() && request.auth.uid in resource.data.members;

      match /messages/{mid} {
        function chat() { return get(/databases/$(database)/documents/chats/$(chatId)).data; }
        allow read: if signedIn() && request.auth.uid in chat().members;
        allow create: if signedIn()
          && request.auth.uid in chat().members && chat().status == 'active'
          && request.resource.data.keys().hasOnly(['from', 'text', 'at', 'expireAt'])
          && (!('expireAt' in request.resource.data) || request.resource.data.expireAt is timestamp)
          && request.resource.data.from == request.auth.uid
          && request.resource.data.text is string
          && request.resource.data.text.size() > 0 && request.resource.data.text.size() <= 9000
          && request.resource.data.at == request.time;
        allow delete: if signedIn() && resource.data.from == request.auth.uid;
      }
    }

    match /{document=**} { allow read, write: if false; }
  }
}
`;
  const T={off:"Data tersimpan di perangkat ini.",busy:"Menyimpan ke cloud…"},hm=t=>t?" · "+new Date(t).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):"";
  const msg=x=>x.s==="ok"?"Tersimpan di cloud"+hm(x.t):x.s==="err"?(x.code==="permission-denied"?"Ditolak oleh aturan (Rules) Firestore. Data aman di perangkat ini; ikuti langkah di bawah agar tersinkron.":x.code==="unavailable"?"Tidak ada koneksi. Data aman di perangkat dan dikirim otomatis saat online.":`Gagal sinkron (${x.code}). Mencoba lagi otomatis.`):T[x.s]||"";
  const st=e=>{const x=e&&e.detail?e.detail:{s:KLSync.state,code:KLSync.code,t:KLSync.t};$("status").textContent=msg(x);$("fix").hidden=!(x.s==="err"&&x.code==="permission-denied")};document.addEventListener("kl-sync",st);st();
  $("console").href=`https://console.firebase.google.com/project/${window.KL_FIREBASE?.projectId||""}/firestore/databases/-default-/security/rules`;
  $("copyrules").onclick=()=>copy(RULES);
  $("syncnow").onclick=()=>{KLSync.now();toast("Menyinkronkan…")};
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
    const on=s.notif&&n==="granted";$("perm").textContent=n==="denied"?"Diblokir di pengaturan browser/HP":on?"Aktif untuk 5 waktu shalat":s.notif?"Izin belum diberikan di perangkat ini":"Belum aktif";
    root.querySelectorAll("[data-pr]").forEach(b=>{const off=!!(s.off||{})[b.dataset.pr];b.classList.toggle("on",!off);b.setAttribute("aria-pressed",!off)});$("tnotif").setAttribute("aria-pressed",on);$("tnotif").textContent=on?"Matikan":"Aktifkan";$("tsound").setAttribute("aria-pressed",s.sound);$("tsound").textContent=s.sound?"Aktif":"Mati"};
  $("gps").onclick=async()=>{const b=$("gps");b.disabled=true;b.textContent="Mencari…";try{const l=await useMyLocation();toast("Lokasi diatur: "+l.name)}catch(e){toast(geoMsg(e))}b.disabled=false;b.textContent="Gunakan lokasi saya";perms()};
  $("tnotif").onclick=async()=>{if(settings().notif&&notifState()==="granted")save({notif:false});else{const r=await enable();
      if(r!=="granted"){toast(r==="insecure"?"Butuh HTTPS atau localhost":r==="denied"?"Izin notifikasi ditolak. Ubah lewat pengaturan situs di browser.":"Notifikasi tidak tersedia di perangkat ini");perms();return}save({notif:true})}ping("kl-adzan");perms()};
  $("tsound").onclick=()=>{save({sound:!settings().sound});ping("kl-adzan");perms()};$("atest").onclick=()=>test("biasa");$("atestsubuh").onclick=()=>test("subuh");root.querySelectorAll("[data-pr]").forEach(b=>b.onclick=()=>{const o={...(settings().off||{})};o[b.dataset.pr]=!o[b.dataset.pr];save({off:o});ping("kl-adzan");perms()});$("astop").onclick=()=>stop();perms();
  /* Privasi pesan */
  const cp=()=>{const h=!!get("chat_prefs",{}).hidden;$("chide").setAttribute("aria-pressed",!h);$("chide").textContent=h?"Disembunyikan":"Bisa ditemukan"};
  $("chide").onclick=()=>{const p=get("chat_prefs",{});set("chat_prefs",{...p,hidden:!p.hidden});chat.register(auth?.currentUser,true);cp();toast(get("chat_prefs",{}).hidden?"Email disembunyikan dari pencarian":"Email bisa ditemukan untuk chat")};cp();
  $("cret").value=String(chat.retain());$("cret").onchange=()=>{set("chat_prefs",{...get("chat_prefs",{}),retain:+$("cret").value});toast("Pesan baru akan hilang sesuai pilihan")};
  const PM={unsupported:"Browser ini tidak mendukung notifikasi latar belakang",login:"Masuk dengan Google dulu",denied:"Izin notifikasi ditolak (ubah di pengaturan situs)",server:"Server notifikasi belum diatur (lihat README)"};
  const ps=()=>{const on=push.isOn();$("ptog").textContent=on?"Matikan":"Aktifkan";$("ptest").hidden=!on;$("pstat").textContent=on?"Aktif: notifikasi tiba walau aplikasi ditutup":"Mati: notifikasi hanya saat aplikasi terbuka"};
  $("ptog").onclick=async()=>{const b=$("ptog");b.disabled=true;try{if(push.isOn())await push.disable();else{await push.enable();toast("Notifikasi latar belakang aktif")}}catch(e){toast(PM[e.message]||"Gagal mengaktifkan notifikasi")}b.disabled=false;ps()};
  $("pdiag").onclick=async()=>{const b=$("pdiag");b.disabled=true;b.textContent="Memeriksa…";let L=[];try{L=await push.diagnose()}catch(e){L=[{ok:false,label:"Pemeriksaan",hint:"Terjadi kesalahan: "+(e.message||e)}]}b.disabled=false;b.textContent="Periksa";
    const bad=L.find(x=>!x.ok);await dialog({title:"Periksa notifikasi",html:`<ul class="diag">${L.map(x=>`<li class="${x.ok?"ok":"bad"}"><b>${x.ok?"✅":"❌"} ${x.label.replace(/</g,"&lt;")}</b>${x.hint?`<small>${x.hint.replace(/</g,"&lt;")}</small>`:""}</li>`).join("")}</ul>${bad?"":"<p>Semua langkah beres. Jika tetap tidak ada notifikasi, pastikan penerima juga mengaktifkannya di perangkatnya.</p>"}`,actions:[{label:"Tutup",value:null,cls:"primary"}]})};
  $("ptest").onclick=async()=>{try{const n=await push.test();toast(n?"Notifikasi uji dikirim":"Tidak ada perangkat terdaftar")}catch(e){toast("Server notifikasi belum menjawab")}};ps();
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
