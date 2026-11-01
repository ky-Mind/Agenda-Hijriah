import {get,set,keys,toast} from "../store.js";
import {paint,cropPhoto} from "../lib/avatar.js";
import {normalize,validNumber,waUrl,openUrl,DEV} from "../lib/wa.js";
import {settings,save,enable,test,stop} from "../lib/adzan.js";
import {setTheme} from "../lib/theme.js";
import {loc} from "../lib/prayer.js";
import {geoState,notifState,useMyLocation,geoMsg,GEO_TXT,NOTIF_TXT} from "../lib/perm.js";
import {ask,copy,dialog,esc} from "../lib/ui.js";
import * as chat from "../lib/chat.js";
import * as push from "../lib/push.js";
import {quranStatus,downloadQuran,prepareTimes,timesStatus} from "../lib/offline.js";
import {signIn,signInEmail,signUpEmail,resetPassword,signOut,authErrorMessage} from "../lib/auth.js";
import {FIRESTORE_RULES} from "../lib/rules.js";

/* Menu bagian pengaturan: kunci, ikon, judul, dan keterangan singkat */
const SECTIONS={
  profil:["user","Profil","Identitas dan akun"],
  notif:["bell","Notifikasi","Adzan, lokasi, dan pesan"],
  tampilan:["sun","Tampilan","Tema, tanggal Hijriah, tasbih melayang"],
  data:["down","Data","Mode offline dan cadangan"],
  bantuan:["heart","Bantuan","Laporan bug dan pembuat aplikasi"],
};

const PUSH_ERR={
  unsupported:"Browser ini tidak mendukung notifikasi latar belakang",
  login:"Masuk ke akun dulu (Profil › Akun)",
  denied:"Izin notifikasi ditolak (ubah di pengaturan situs)",
  server:"Server notifikasi belum diatur (lihat README)",
};

const PROV={"google.com":"Google","facebook.com":"Facebook",password:"email"};
const SYNC_TXT={off:"Data tersimpan di perangkat ini.",busy:"Menyimpan ke cloud…"};

export default function(root){
  const $=n=>root.querySelector(`[data-r="${n}"]`);
  const auth=window.__klAuth;
  const prof=()=>get("profil",{});
  const ping=n=>document.dispatchEvent(new CustomEvent(n));
  const upd=p=>{set("profil",{...prof(),...p});ping("kl-profile")};

  /* Tab pengaturan (Profil, Notifikasi, Tampilan, Data, Bantuan) */
  const tabs=[...root.querySelectorAll("[data-tab]")];
  const groups=[...root.querySelectorAll("[data-g]")];
  const readTab=()=>{try{return sessionStorage.getItem("kl_ptab")||"profil"}catch(e){return"profil"}};
  const writeTab=t=>{try{sessionStorage.setItem("kl_ptab",t)}catch(e){}};
  function show(t){
    groups.forEach(g=>{g.hidden=g.dataset.g!==t});
    tabs.forEach(b=>{
      const on=b.dataset.tab===t;
      b.classList.toggle("on",on);
      b.setAttribute("aria-selected",on);
    });
    writeTab(t);
    const sec=root.querySelector('[data-r="sect"]'),tab=tabs.find(b=>b.dataset.tab===t);
    if(sec)sec.textContent=tab?tab.textContent:"";
  }
  tabs.forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));
  const first=readTab();
  show(tabs.some(b=>b.dataset.tab===first)?first:"profil");

  /* Menu pengaturan (ikon hamburger di bilah atas ponsel, hanya di halaman Profil) */
  function menu(){
    const cur=readTab();
    const m=document.createElement("div");
    m.className="modal";
    m.setAttribute("role","dialog");
    m.setAttribute("aria-modal","true");
    const items=Object.entries(SECTIONS).map(([k,[icon,title,desc]])=>
      `<button type="button" class="gm ${k===cur?"on":""}" data-go="${k}"><span class="qi"><svg class="ic"><use href="#i-${icon}" /></svg></span><span><b>${title}</b><small>${desc}</small></span></button>`
    ).join("");
    m.innerHTML=`<div class="box"><h2>Pengaturan</h2><div class="gmenu">${items}</div></div>`;
    document.body.appendChild(m);
    m.onclick=e=>{
      const b=e.target.closest("[data-go]");
      if(b){
        show(b.dataset.go);
        document.getElementById("view").scrollTo({top:0,behavior:"smooth"});
        m.remove();
      }else if(e.target===m){
        m.remove();
      }
    };
  }
  const onAct=e=>{if(e.detail&&e.detail.name==="menu")menu()};
  document.addEventListener("kl-action",onAct);

  /* Tasbih melayang dan Kili AI */
  const floatTasbihUi=()=>{
    const on=!!(window.KLFloatTasbih&&KLFloatTasbih.isOn());
    $("ftog").setAttribute("aria-pressed",on);
    $("ftog").textContent=on?"Sembunyikan":"Tampilkan";
  };
  $("ftog").onclick=()=>{window.KLFloatTasbih?.toggle();floatTasbihUi()};
  document.addEventListener("kl-ftasbih",floatTasbihUi);
  floatTasbihUi();

  const aiUi=()=>{
    const on=!!window.KLAi?.isOn();
    $("aitog").setAttribute("aria-pressed",on);
    $("aitog").textContent=on?"Sembunyikan":"Tampilkan";
  };
  $("aitog").onclick=()=>window.KLAi?.toggle();
  document.addEventListener("kl-ai",aiUi);
  aiUi();

  /* Identitas: nama, WhatsApp, dan foto */
  const ident=()=>{
    const p=prof(),u=auth?.currentUser,n=p.name||u?.displayName,ph=p.photo||u?.photoURL;
    if(n||ph)paint($("avatar"),n,ph);else $("avatar").innerHTML='<svg class="ic"><use href="#i-user" /></svg>';
  };
  /* Isian diisi ulang dari penyimpanan, kecuali yang sedang diketik. Dipanggil juga saat data cloud masuk */
  const fill=()=>{
    const p=prof();
    if(document.activeElement!==$("name"))$("name").value=p.name||"";
    if(document.activeElement!==$("wa"))$("wa").value=p.whatsapp||"";
    ident();
  };
  fill();

  /* Nama dan nomor tersimpan otomatis sesaat setelah berhenti mengetik, lalu ikut tersinkron ke akun (sync.js).
     Nomor yang belum valid tidak disimpan agar nomor lama tidak tertimpa */
  let autoT=0;
  const commit=quiet=>{
    clearTimeout(autoT);
    const name=$("name").value.trim(),w=$("wa").value.trim(),p=prof(),okW=!w||validNumber(w);
    if(!okW&&!quiet)toast("Nomor WhatsApp tidak valid");
    /* Nama tetap tersimpan walau nomor yang sedang diketik belum valid */
    const patch={};
    if(name!==(p.name||""))patch.name=name;
    if(okW&&w!==(p.whatsapp||""))patch.whatsapp=w;
    if(!Object.keys(patch).length)return okW;
    upd(patch);
    ident();
    if(quiet)toast("Tersimpan otomatis");
    return okW;
  };
  $("name").oninput=$("wa").oninput=()=>{clearTimeout(autoT);autoT=setTimeout(()=>commit(true),900)};
  $("name").onchange=$("wa").onchange=()=>commit(true);
  $("save").onclick=()=>{if(commit(false))toast("Tersimpan")};
  document.addEventListener("kl-data-changed",fill);
  $("watest").onclick=()=>{
    const w=$("wa").value.trim();
    if(!validNumber(w))return toast("Isi nomor WhatsApp yang valid dulu");
    openUrl(waUrl(normalize(w),"Tes Kisah Lillah: WhatsApp terhubung ✓"));
  };

  /* Foto profil: ketuk avatar untuk memilih ganti, hapus, atau batal */
  $("pick").onclick=async()=>{
    const p=prof(),ph=p.photo||auth?.currentUser?.photoURL;
    const a=await dialog({title:"Foto profil",html:`<div class="avatar dlg-av">${ph?`<img src="${esc(ph)}" alt="">`:p.name?.trim()?esc(p.name.trim().charAt(0).toUpperCase()):'<svg class="ic"><use href="#i-user" /></svg>'}</div>`,
      actions:[{label:"Ganti foto",value:"pick",cls:"primary"},...(p.photo?[{label:"Hapus foto",value:"rm",cls:"danger"}]:[]),{label:"Batal",value:null}]});
    if(a==="pick")$("photo").click();
    else if(a==="rm"){upd({photo:""});ident();toast("Foto profil dihapus")}
  };
  $("photo").onchange=async e=>{
    const f=e.target.files[0];
    e.target.value="";
    if(!f)return;
    if(!f.type.startsWith("image/"))return toast("File harus berupa gambar");
    if(f.size>20*1024*1024)return toast("Foto terlalu besar (maks 20 MB)");
    const url=await cropPhoto(f);
    if(url===null)toast("Foto tidak dapat diproses, coba foto lain");
    else if(url){upd({photo:url});ident();toast("Foto profil disimpan")}
  };

  /* Akun: Google, Facebook, atau email */
  const showAuthErr=m=>{
    $("autherr").hidden=false;
    $("autherr").textContent=m;
    toast(m.length>60?"Gagal masuk. Lihat keterangan di kartu akun.":m);
  };
  const who=u=>{
    const via=[...new Set(u?.providerData?.map(x=>PROV[x.providerId]).filter(Boolean))];
    $("acct").classList.toggle("in",!!u);
    $("who").textContent=u
      ?u.email||"Masuk tanpa email"
      :"Belum masuk. Masuk agar data tersimpan di cloud dan sama di desktop dan ponsel.";
    $("via").innerHTML=via.map(v=>`<span class="via">${v}</span>`).join("");
    $("logins").hidden=!!u||!$("mailform").hidden;
    if(u)$("mailform").hidden=true;
    $("acctacts").hidden=!u;
    if(u)$("autherr").hidden=true;
    /* Nama Google hanya jadi contoh di isian, tidak disimpan. Kalau disimpan, nama itu bisa lebih baru dari nama
       yang sudah diganti di cloud dan menimpanya saat masuk di perangkat baru */
    $("name").placeholder=u?.displayName||"Nama lengkap";
    ident();
  };
  const offAuth=auth?auth.onAuthStateChanged(who):()=>{};
  if(!auth){
    $("who").textContent="Firebase tidak termuat (periksa koneksi internet lalu muat ulang). Data tersimpan di perangkat ini saja.";
    $("logins").querySelectorAll("button").forEach(b=>b.disabled=true);
  }
  const social=kind=>async()=>{
    try{
      await signIn(()=>toast("Popup diblokir, mengalihkan ke halaman login…"),kind);
    }catch(e){
      console.warn(e);
      showAuthErr(authErrorMessage(e));
    }
  };
  $("login").onclick=social("google");
  $("loginfb").onclick=social("facebook");

  /* Email + kata sandi: satu formulir untuk masuk, daftar, dan atur ulang kata sandi */
  const mailBusy=on=>$("mailform").querySelectorAll("button").forEach(b=>b.disabled=on);
  const mailCreds=()=>{
    const email=$("mail").value.trim(),pass=$("pass").value;
    if(!/^\S+@\S+\.\S+$/.test(email)){showAuthErr("Format email tidak valid.");$("mail").focus();return null}
    if(pass.length<6){showAuthErr("Kata sandi minimal 6 karakter.");$("pass").focus();return null}
    return[email,pass];
  };
  const mailDo=async fn=>{
    const c=mailCreds();if(!c)return;
    mailBusy(true);
    try{await fn(...c);$("pass").value=""}catch(e){console.warn(e);showAuthErr(authErrorMessage(e))}
    finally{mailBusy(false)}
  };
  /* Formulir menggantikan tombol pilihan masuk; tab Masuk/Daftar baru hanya mengganti tujuan tombol kirim */
  let mailMode="in";
  const setMode=m=>{
    mailMode=m;
    $("mailform").querySelectorAll("[data-m]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));
    $("mailin").textContent=m==="up"?"Buat akun":"Masuk";
    $("pass").autocomplete=m==="up"?"new-password":"current-password";
    $("mailreset").hidden=m==="up";
  };
  $("mailform").querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  $("peek").onclick=()=>{const show=$("pass").type==="password";$("pass").type=show?"text":"password";$("peek").textContent=show?"Sembunyikan":"Lihat";$("peek").setAttribute("aria-label",show?"Sembunyikan kata sandi":"Tampilkan kata sandi")};
  $("loginmail").onclick=()=>{$("logins").hidden=true;$("mailform").hidden=false;$("autherr").hidden=true;$("mail").focus()};
  $("mailclose").onclick=()=>{$("mailform").hidden=true;$("logins").hidden=false;$("autherr").hidden=true;$("pass").value=""};
  $("mailform").onsubmit=e=>{
    e.preventDefault();
    if(mailMode==="in")return mailDo(signInEmail);
    mailDo(signUpEmail).then(()=>{if(auth?.currentUser)toast("Akun dibuat. Cek email untuk verifikasi (dibutuhkan fitur Pesan)")});
  };
  $("mailreset").onclick=async()=>{
    const email=$("mail").value.trim();
    if(!/^\S+@\S+\.\S+$/.test(email)){showAuthErr("Isi email dulu, lalu tekan Lupa kata sandi.");return $("mail").focus()}
    try{await resetPassword(email);$("autherr").hidden=true;toast("Jika email terdaftar, tautan atur ulang sudah dikirim")}
    catch(e){showAuthErr(authErrorMessage(e))}
  };
  $("logout").onclick=async()=>{
    const ok=await dialog({title:"Keluar dari akun?",text:"Data tetap aman di perangkat ini dan di cloud. Masuk lagi kapan saja untuk melanjutkan sinkron.",actions:[{label:"Keluar",value:true,cls:"danger"},{label:"Batal",value:false}]});
    if(ok===true){await signOut();toast("Kamu sudah keluar")}
  };

  /* Sinkron cloud */
  const syncMsg=x=>{
    const time=x.t?" · "+new Date(x.t).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):"";
    if(x.s==="ok")return "Tersimpan di cloud"+time;
    if(x.s==="err"){
      if(x.code==="permission-denied")return "Ditolak oleh aturan (Rules) Firestore. Data aman di perangkat ini; ikuti langkah di bawah agar tersinkron.";
      if(x.code==="unavailable")return "Tidak ada koneksi. Data aman di perangkat dan dikirim otomatis saat online.";
      return `Gagal sinkron (${x.code}). Mencoba lagi otomatis.`;
    }
    return SYNC_TXT[x.s]||"";
  };
  const syncUi=e=>{
    const x=e&&e.detail?e.detail:{s:KLSync.state,code:KLSync.code,t:KLSync.t};
    $("status").textContent=syncMsg(x);
    $("syncdot").dataset.s=x.s;
    $("fix").hidden=!(x.s==="err"&&x.code==="permission-denied");
  };
  document.addEventListener("kl-sync",syncUi);
  syncUi();
  $("console").href=`https://console.firebase.google.com/project/${window.KL_FIREBASE?.projectId||""}/firestore/databases/-default-/security/rules`;
  $("copyrules").onclick=()=>copy(FIRESTORE_RULES);
  $("syncnow").onclick=()=>{KLSync.now();toast("Menyinkronkan…")};

  /* Tema dan koreksi Hijriah */
  const markChoices=()=>{
    root.querySelectorAll("[data-t]").forEach(c=>c.classList.toggle("on",c.dataset.t===get("theme","auto")));
    root.querySelectorAll("[data-h]").forEach(c=>c.classList.toggle("on",+c.dataset.h===get("hijri_offset",0)));
  };
  root.onclick=e=>{
    const t=e.target.closest("[data-t]"),h=e.target.closest("[data-h]");
    if(t){setTheme(t.dataset.t);markChoices()}
    if(h){set("hijri_offset",+h.dataset.h);markChoices();toast("Koreksi Hijriah disimpan")}
  };
  markChoices();

  /* Lokasi dan notifikasi adzan */
  const permsUi=async()=>{
    const s=settings(),g=await geoState(),n=notifState();
    $("locname").textContent=loc().name;
    $("gbadge").textContent=GEO_TXT[g]||"—";
    $("gbadge").classList.toggle("warn",g==="denied");
    $("nbadge").textContent=NOTIF_TXT[n]||"—";
    $("nbadge").classList.toggle("warn",n==="denied");
    const on=s.notif&&n==="granted";
    $("perm").textContent=n==="denied"?"Diblokir di pengaturan browser/HP":on?"Aktif untuk 5 waktu shalat":s.notif?"Izin belum diberikan di perangkat ini":"Belum aktif";
    root.querySelectorAll("[data-pr]").forEach(b=>{
      const off=!!(s.off||{})[b.dataset.pr];
      b.classList.toggle("on",!off);
      b.setAttribute("aria-pressed",!off);
    });
    $("tnotif").setAttribute("aria-pressed",on);
    $("tnotif").textContent=on?"Matikan":"Aktifkan";
    $("tsound").setAttribute("aria-pressed",s.sound);
    $("tsound").textContent=s.sound?"Aktif":"Mati";
  };
  $("gps").onclick=async()=>{
    const b=$("gps");
    b.disabled=true;
    b.textContent="Mencari…";
    try{
      const l=await useMyLocation();
      toast("Lokasi diatur: "+l.name);
    }catch(e){
      toast(geoMsg(e));
    }
    b.disabled=false;
    b.textContent="Gunakan lokasi saya";
    permsUi();
  };
  $("tnotif").onclick=async()=>{
    if(settings().notif&&notifState()==="granted"){
      save({notif:false});
    }else{
      const r=await enable();
      if(r!=="granted"){
        toast(r==="insecure"?"Butuh HTTPS atau localhost":r==="denied"?"Izin notifikasi ditolak. Ubah lewat pengaturan situs di browser.":"Notifikasi tidak tersedia di perangkat ini");
        permsUi();
        return;
      }
      save({notif:true});
    }
    ping("kl-adzan");
    permsUi();
  };
  $("tsound").onclick=()=>{save({sound:!settings().sound});ping("kl-adzan");permsUi()};
  $("atest").onclick=()=>test("biasa");
  $("atestsubuh").onclick=()=>test("subuh");
  root.querySelectorAll("[data-pr]").forEach(b=>b.onclick=()=>{
    const o={...(settings().off||{})};
    o[b.dataset.pr]=!o[b.dataset.pr];
    save({off:o});
    ping("kl-adzan");
    permsUi();
  });
  $("astop").onclick=()=>stop();
  permsUi();

  /* Privasi pesan */
  const chatPrefUi=()=>{
    const hidden=!!get("chat_prefs",{}).hidden;
    $("chide").setAttribute("aria-pressed",!hidden);
    $("chide").textContent=hidden?"Disembunyikan":"Bisa ditemukan";
  };
  $("chide").onclick=()=>{
    const p=get("chat_prefs",{});
    set("chat_prefs",{...p,hidden:!p.hidden});
    chat.register(auth?.currentUser,true);
    chatPrefUi();
    toast(get("chat_prefs",{}).hidden?"Email disembunyikan dari pencarian":"Email bisa ditemukan untuk chat");
  };
  chatPrefUi();
  $("cret").value=String(chat.retain());
  $("cret").onchange=()=>{
    set("chat_prefs",{...get("chat_prefs",{}),retain:+$("cret").value});
    toast("Pesan baru akan hilang sesuai pilihan");
  };

  /* Notifikasi latar belakang (Web Push) */
  const pushUi=()=>{
    const on=push.isOn();
    $("ptog").textContent=on?"Matikan":"Aktifkan";
    $("ptest").hidden=!on;
    $("pstat").textContent=on?"Aktif: notifikasi tiba walau aplikasi ditutup":"Mati: notifikasi hanya saat aplikasi terbuka";
  };
  $("ptog").onclick=async()=>{
    const b=$("ptog");
    b.disabled=true;
    try{
      if(push.isOn()){
        await push.disable();
      }else{
        await push.enable();
        toast("Notifikasi latar belakang aktif");
      }
    }catch(e){
      toast(PUSH_ERR[e.message]||"Gagal mengaktifkan notifikasi");
    }
    b.disabled=false;
    pushUi();
  };
  $("pdiag").onclick=async()=>{
    const b=$("pdiag");
    b.disabled=true;
    b.textContent="Memeriksa…";
    let list=[];
    try{
      list=await push.diagnose();
    }catch(e){
      list=[{ok:false,label:"Pemeriksaan",hint:"Terjadi kesalahan: "+(e.message||e)}];
    }
    b.disabled=false;
    b.textContent="Periksa";
    const bad=list.find(x=>!x.ok);
    const items=list.map(x=>`<li class="${x.ok?"ok":"bad"}"><b>${x.ok?"✅":"❌"} ${x.label.replace(/</g,"&lt;")}</b>${x.hint?`<small>${x.hint.replace(/</g,"&lt;")}</small>`:""}</li>`).join("");
    const done=bad?"":"<p>Semua langkah beres. Jika tetap tidak ada notifikasi, pastikan penerima juga mengaktifkannya di perangkatnya.</p>";
    await dialog({
      title:"Periksa notifikasi",
      html:`<ul class="diag">${items}</ul>${done}`,
      actions:[{label:"Tutup",value:null,cls:"primary"}],
    });
  };
  $("ptest").onclick=async()=>{
    try{
      const n=await push.test();
      toast(n?"Notifikasi uji dikirim":"Tidak ada perangkat terdaftar");
    }catch(e){
      toast("Server notifikasi belum menjawab");
    }
  };
  pushUi();

  /* Offline: Al-Qur'an dan jadwal shalat */
  const offlineUi=async()=>{
    const q=await quranStatus(),t=timesStatus();
    $("qstat").textContent=!q.ok?"Penyimpanan offline tidak tersedia di browser ini":q.n>=114?"Lengkap, siap dibaca tanpa internet":q.n?`${q.n} dari 114 surah tersimpan`:"Belum diunduh (± 5 MB)";
    $("qdl").disabled=!q.ok||q.n>=114;
    $("qdl").textContent=q.n>=114?"Tersimpan":"Unduh";
    $("tstat").textContent=t?"Tersimpan untuk lokasi saat ini":"Belum disiapkan";
  };
  $("qdl").onclick=async()=>{
    if(!navigator.onLine)return toast("Perlu internet untuk mengunduh");
    const b=$("qdl"),w=$("qbarw"),bar=$("qbar");
    b.disabled=true;
    w.hidden=false;
    const r=await downloadQuran((d,t)=>{bar.style.width=Math.round(d/t*100)+"%";b.textContent=`${d}/${t}`});
    w.hidden=true;
    toast(r.failed.length?`${r.failed.length} surah gagal, coba lagi`:"Al-Qur'an siap offline");
    offlineUi();
  };
  $("tdl").onclick=async()=>{
    if(!navigator.onLine)return toast("Perlu internet untuk menyiapkan");
    $("tdl").disabled=true;
    const n=await prepareTimes();
    $("tdl").disabled=false;
    toast(n?"Jadwal shalat siap offline":"Gagal. Jadwal tetap dihitung lokal saat offline");
    offlineUi();
  };
  offlineUi();

  /* Cadangan data (ekspor dan impor berkas JSON) */
  $("export").onclick=()=>{
    const o={};
    keys("").filter(k=>!/^(cache|sync_meta)/.test(k)).forEach(k=>o[k]=localStorage.getItem("kl2_"+k));
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));
    a.download=`kisah-lillah-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };
  $("import").onclick=()=>$("file").click();
  $("file").onchange=async e=>{
    try{
      const o=JSON.parse(await e.target.files[0].text());
      Object.entries(o).forEach(([k,v])=>{
        if(typeof v==="string"&&!/^(cache|sync_meta)/.test(k))localStorage.setItem("kl2_"+k,v);
      });
      toast("Data dipulihkan");
      setTimeout(()=>location.reload(),600);
    }catch(x){
      toast("File cadangan tidak valid");
    }
  };
  $("wipe").onclick=async()=>{
    if(await ask("Hapus semua data?","Semua data di perangkat ini dihapus. Jika sedang masuk dengan Google, data di cloud juga ikut terhapus.","Hapus semua")){
      keys("").forEach(k=>localStorage.removeItem("kl2_"+k));
      location.reload();
    }
  };

  /* Laporan bug (dikirim lewat WhatsApp pengembang) */
  const bn=$("bname"),br=$("breason"),bs=$("bsend"),bv=$("bval");
  bn.value=prof().name||"";
  const bugUi=()=>{
    const ok=bn.value.trim().length>=2&&br.value.trim().length>=10;
    bs.disabled=!ok;
    bv.textContent=ok?"Siap dikirim ke WhatsApp pengembang.":"Lengkapi nama dan alasan (minimal 10 karakter) agar laporan dapat dikirim.";
  };
  bn.oninput=br.oninput=bugUi;
  bugUi();
  bs.onclick=()=>{
    if(bs.disabled)return;
    openUrl(waUrl(DEV,`LAPORAN BUG KISAH LILLAH\n\nNama: ${bn.value.trim()}\nAlasan/Masalah:\n${br.value.trim()}\n\nPerangkat: ${navigator.userAgent.slice(0,120)}\n\nMohon dicek.`));
    toast("WhatsApp dibuka dengan laporan");
  };

  return()=>{
    offAuth();
    commit(true);
    document.removeEventListener("kl-data-changed",fill);
    document.removeEventListener("kl-sync",syncUi);
    document.removeEventListener("kl-action",onAct);
    document.removeEventListener("kl-ftasbih",floatTasbihUi);
    document.removeEventListener("kl-ai",aiUi);
  };
}
