import {esc,ask,skeleton,fail,dialog} from "../lib/ui.js";
import {toast} from "../store.js";
import {waUrl,openUrl} from "../lib/wa.js";
import * as C from "../lib/chat.js";
import * as E from "../lib/e2e.js";
const hm=t=>new Date(t).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const when=t=>{const d=new Date(t);return d.toDateString()===new Date().toDateString()?hm(t):d.toLocaleDateString("id-ID",{day:"numeric",month:"short"})};
const day=t=>{const d=new Date(t),n=new Date(),y=new Date(n-864e5);return d.toDateString()===n.toDateString()?"Hari ini":d.toDateString()===y.toDateString()?"Kemarin":d.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})};
const init=n=>esc((n||"?").trim().charAt(0).toUpperCase()||"?");
const errMsg=e=>{const c=e&&(e.code||e.message);return c==="permission-denied"?"Aturan Firestore belum diperbarui. Publikasikan firestore.rules terbaru (Profil › Akun Google › Salin aturan).":c==="unavailable"?"Tidak ada koneksi internet.":c==="locked"?"Buka kunci pesan terlebih dahulu.":c==="nopub"?"Lawan bicara belum mengaktifkan pesan terenkripsi.":"Terjadi kesalahan. Coba lagi."};
let resetting=false;
const avInner=(n,p)=>{const v=C.safeImg(p);return v?`<img src="${esc(v)}" alt="">`:init(n)};
const hydrate=el=>{el.querySelectorAll("[data-av]").forEach(async n=>{const p=await C.avatar(n.dataset.av);if(p&&n.isConnected)n.innerHTML=`<img src="${esc(p)}" alt="">`})};
/* Gerbang kunci enkripsi: buat PIN (pertama kali) / buka dengan PIN (perangkat baru). true = gerbang tampil. */
function gate(box){
  const s=E.state,u=window.__klAuth?.currentUser;if(!u||s.ready){box.innerHTML="";return false}
  if(s.exists===undefined){box.innerHTML=skeleton(1);return true}
  if(s.exists===null){box.innerHTML=`<div class="card"><h2>Tidak bisa memeriksa kunci</h2><p class="muted">${esc(errMsg({code:s.err}))}</p></div>`;return true}
  const mk=s.exists&&!resetting;
  box.innerHTML=`<div class="card gate"><h2>🔒 ${mk?"Buka kunci pesan":"Aktifkan pesan terenkripsi"}</h2>
    <p class="muted">${mk?"Masukkan PIN pesan untuk membuka kunci di perangkat ini. Sekali saja per perangkat.":"Pesan dienkripsi ujung-ke-ujung. Buat PIN pesan (minimal 6 karakter) untuk melindungi kuncimu; PIN dibutuhkan saat membuka Kisah Lillah di perangkat baru. Jika PIN lupa, kunci harus dibuat ulang dan pesan lama tidak bisa dibuka."}</p>
    <div class="field"><input type="password" data-pin placeholder="PIN pesan" autocomplete="${mk?"current-password":"new-password"}"></div>
    ${mk?"":'<div class="field"><input type="password" data-pin2 placeholder="Ulangi PIN" autocomplete="new-password"></div>'}
    <p class="dirty" data-gerr hidden></p>
    <div class="row"><button class="btn primary" data-act>${mk?"Buka kunci":"Aktifkan"}</button>${mk?'<button class="btn ghost" data-forgot>Lupa PIN?</button>':""}</div></div>`;
  const err=m=>{const e=box.querySelector("[data-gerr]");e.hidden=false;e.textContent=m},pin=box.querySelector("[data-pin]");
  const go=async()=>{const v=pin.value,b=box.querySelector("[data-act]");if(v.length<6)return err("PIN minimal 6 karakter.");
    if(!mk&&v!==box.querySelector("[data-pin2]").value)return err("Kedua PIN tidak sama.");
    b.disabled=true;b.textContent="Memproses…";
    try{if(mk)await E.unlock(u.uid,v);else{await E.setup(u.uid,v);resetting=false}toast("Pesan terenkripsi aktif")}
    catch(e){b.disabled=false;b.textContent=mk?"Buka kunci":"Aktifkan";err(e.message==="pin"?"PIN salah.":errMsg(e))}};
  box.querySelector("[data-act]").onclick=go;pin.onkeydown=e=>{if(e.key==="Enter")go()};
  const f=box.querySelector("[data-forgot]");if(f)f.onclick=async()=>{if(await ask("Buat ulang kunci?","Pesan lama tidak akan bisa dibuka lagi. Percakapan tetap ada.","Buat ulang")){resetting=true;gate(box)}};
  return true}
export default function(root,args){const $=n=>root.querySelector(`[data-r="${n}"]`);return args[0]?conv($,root,args[0]):inbox($,root)}
function inbox($,root){
  $("inbox").hidden=false;$("conv").hidden=true;let idxFor="";
  const checkIdx=async()=>{const u=window.__klAuth?.currentUser;if(!u||!E.state.ready){$("idx").innerHTML="";return}
    const r=await C.checkIndex(u);$("idx").innerHTML=["missing","stale","error"].includes(r)?`<div class="banner">⚠️ Kunci pesanmu <b>belum terdaftar di server</b>, jadi orang lain belum bisa memulai chat denganmu. Penyebab umum: <code>firestore.rules</code> terbaru belum dipublikasikan (Profil › Akun Google › Salin aturan).<div class="row mt"><button class="btn sm primary" data-fix>Coba daftarkan ulang</button></div></div>`:""};
  const item=c=>{const me=C.state.uid,un=c.status==="active"&&c.lastFrom&&c.lastFrom!==me&&C.ms(c.lastAt)>C.readAt(c,me);
    const pv=c.status==="pending"?"Menunggu persetujuan…":c.status==="blocked"?"Percakapan dibatasi":c.lastMessage?(c.lastFrom===me?"Anda: ":"")+(c.preview||"🔒 Pesan terenkripsi"):"Belum ada pesan";
    return `<a class="ci ${un?"un":""}" href="#/pesan/${esc(c.id)}"><span class="avatar" data-av="${esc(C.emailOf(c))}">${init(C.nameOf(c))}</span><div><b>${esc(C.nameOf(c))}</b><small>${esc(pv)}</small></div><div class="meta"><time>${c.lastMessage?when(C.ms(c.lastAt)):""}</time>${un?'<span class="nbadge">•</span>':""}</div></a>`};
  const draw=()=>{const u=window.__klAuth?.currentUser;$("gate").hidden=!!u;
    $("notifbar").hidden=!(u&&"Notification"in window&&Notification.permission==="default");
    if(!u){$("e2e").innerHTML="";$("new").hidden=true;$("list").innerHTML="";$("req").innerHTML="";return}
    const g=gate($("e2e"));$("new").hidden=g;if(!g&&idxFor!==u.uid){idxFor=u.uid;checkIdx()}
    if(g){$("list").innerHTML="";$("req").innerHTML="";return}
    if(!C.state.ready){$("list").innerHTML=skeleton(4);return}
    if(C.state.err){$("list").innerHTML=fail(errMsg({code:C.state.err}),C.state.err);$("req").innerHTML="";return}
    const inc=C.state.chats.filter(c=>c.status==="pending"&&c.requestedBy!==C.state.uid),rest=C.state.chats.filter(c=>!inc.includes(c));
    $("req").innerHTML=inc.length?`<h2 class="sec">Permintaan chat (${inc.length})</h2>`+inc.map(c=>`<div class="card req"><div class="row sp"><div><b>${esc(C.nameOf(c))}</b> <small class="muted">${esc(C.emailOf(c))}</small>${c.introText?`<p>${esc(c.introText)}</p>`:""}</div><div class="row"><button class="btn sm primary" data-acc="${esc(c.id)}">Terima</button><button class="btn sm" data-dec="${esc(c.id)}">Tolak</button></div></div></div>`).join(""):"";
    $("list").innerHTML=rest.length?rest.map(item).join(""):'<div class="empty"><p>Belum ada percakapan.</p><p class="muted">Tekan "Pesan baru" lalu masukkan email temanmu yang juga memakai Kisah Lillah.</p></div>';hydrate($("list"))};
  const gateKeep=e=>{ // jangan hapus kolom PIN saat sedang mengetik
    if(document.activeElement&&document.activeElement.matches("[data-pin],[data-pin2]")&&!E.state.ready)return;draw()};
  document.addEventListener("kl-chat",draw);document.addEventListener("kl-e2e",gateKeep);draw();
  $("notifbar").onclick=async()=>{await Notification.requestPermission();draw()};
  root.onclick=async e=>{const a=e.target.closest("[data-acc]"),d=e.target.closest("[data-dec]"),f=e.target.closest("[data-fix]");
    try{if(f){f.disabled=true;const r=await C.repairIndex(window.__klAuth.currentUser);toast(r==="ok"?"Kunci pesan terdaftar":"Masih gagal. Publikasikan firestore.rules terbaru lalu coba lagi");await checkIdx()}else if(a){await C.accept(a.dataset.acc);toast("Permintaan diterima")}else if(d&&await ask("Tolak permintaan?","Permintaan chat ini dihapus.","Tolak")){await C.remove(d.dataset.dec)}}catch(x){toast(errMsg(x))}};
  $("new").onclick=newChat;
  return()=>{document.removeEventListener("kl-chat",draw);document.removeEventListener("kl-e2e",gateKeep)};
}
function newChat(){
  const u=window.__klAuth?.currentUser,m=document.createElement("div");m.className="modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  m.innerHTML=`<div class="box"><h2>Pesan baru</h2><p class="muted" style="margin:4px 0 10px">Masukkan email yang dipakai temanmu untuk masuk ke Kisah Lillah.</p><div class="field"><input type="email" data-e placeholder="nama@gmail.com" autocomplete="off" inputmode="email"></div><div data-res class="mt"></div><div class="row sp mt"><button class="btn" data-x>Tutup</button><button class="btn primary" data-s>Cari</button></div></div>`;
  document.body.appendChild(m);const q=s=>m.querySelector(s),res=q("[data-res]"),inp=q("[data-e]");inp.focus();
  const close=()=>m.remove();let found=null;
  const search=async()=>{const e=C.norm(inp.value);found=null;
    if(!C.EMAIL.test(e)){res.innerHTML='<p class="dirty">Format email belum benar.</p>';return}
    if(e===C.norm(u.email)){res.innerHTML='<p class="dirty">Itu emailmu sendiri.</p>';return}
    res.innerHTML='<p class="muted">Mencari…</p>';
    try{found=await C.find(e)}catch(x){res.innerHTML=`<p class="dirty">${esc(errMsg(x))}</p>`;return}
    if(!found){const t=`Assalamu'alaikum, ayo pakai Kisah Lillah: catat ibadah, jadwal shalat, Al-Qur'an, dan bisa chat terenkripsi. Buka ${location.origin}`;res.innerHTML=`<p>Email ini belum memakai Kisah Lillah atau tidak bisa ditemukan.</p><button class="btn sm mt" data-inv>Undang lewat WhatsApp</button>`;res.querySelector("[data-inv]").onclick=()=>openUrl(waUrl("",t));return}
    if(!found.pub){res.innerHTML=`<div class="ci" style="pointer-events:none"><span class="avatar">${avInner(found.name,found.photo)}</span><div><b>${esc(found.name)}</b><small>${esc(found.email)}</small></div></div><p class="dirty mt">${esc(found.name)} belum mengaktifkan pesan terenkripsi. Mereka perlu membuka menu Pesan sekali lalu membuat PIN pesan.</p><button class="btn sm mt" data-rem>Ingatkan lewat WhatsApp</button>`;res.querySelector("[data-rem]").onclick=()=>openUrl(waUrl("",`Assalamu'alaikum ${found.name}, aku mau chat denganmu di Kisah Lillah. Buka menu Pesan lalu buat PIN pesan ya (sekali saja). ${location.origin}`));return}
    const id=C.cid(u.uid,found.uid),ex=C.state.chats.some(c=>c.id===id);
    res.innerHTML=`<div class="ci" style="pointer-events:none"><span class="avatar">${avInner(found.name,found.photo)}</span><div><b>${esc(found.name)}</b><small>${esc(found.email)}</small></div></div>`+(ex?'<button class="btn primary block mt" data-open>Buka percakapan</button>':'<div class="field mt"><input type="text" data-intro maxlength="140" placeholder="Pesan perkenalan (opsional, terenkripsi)"></div><button class="btn primary block" data-go>Kirim permintaan chat</button>');
    const o=res.querySelector("[data-open]"),g=res.querySelector("[data-go]");
    if(o)o.onclick=()=>{close();location.hash="#/pesan/"+id};
    if(g)g.onclick=async()=>{g.disabled=true;try{const cid=await C.request(u,found,res.querySelector("[data-intro]").value);close();toast("Permintaan terkirim");location.hash="#/pesan/"+cid}catch(x){g.disabled=false;res.insertAdjacentHTML("beforeend",`<p class="dirty mt">${esc(errMsg(x))}</p>`)}}};
  q("[data-s]").onclick=search;inp.onkeydown=e=>{if(e.key==="Enter")search();if(e.key==="Escape")close()};
  m.onclick=e=>{if(e.target===m||e.target.closest("[data-x]"))close()};
}
function conv($,root,id){
  $("inbox").hidden=true;$("conv").hidden=false;C.state.open=id;
  let limit=60,unsubM=null,msgs=[],more=false,subbed=false,subKey="";const sc=$("msgs");
  const chat=()=>C.state.chats.find(c=>c.id===id),me=()=>C.state.uid;
  const bottom=()=>sc.scrollHeight-sc.scrollTop-sc.clientHeight<140;
  function head(){const c=chat(),b=$("banner");
    if(!C.state.ready)return false;
    if(C.state.err||!c){b.hidden=false;b.innerHTML=C.state.err?esc(errMsg({code:C.state.err})):'Percakapan tidak ditemukan. <a href="#/pesan">Kembali ke Pesan</a>';$("form").hidden=true;$("cblock").hidden=true;$("cdel").hidden=true;$("ccode").hidden=true;return false}
    $("cdel").hidden=false;const n=C.nameOf(c);const cav=$("cav");if(cav.dataset.av!==C.emailOf(c)){cav.dataset.av=C.emailOf(c);cav.textContent=n.trim().charAt(0).toUpperCase();hydrate($("conv"))}$("cname").textContent=n;$("cmail").textContent=C.emailOf(c);
    document.dispatchEvent(new CustomEvent("kl-title",{detail:n}));
    if(!E.state.ready){b.hidden=false;b.innerHTML='🔒 Buka kunci pesan dulu. <a href="#/pesan">Buka di halaman Pesan</a>';$("form").hidden=true;$("ccode").hidden=true;return false}
    $("ccode").hidden=!C.otherPub(c);
    const mine=c.requestedBy===me(),act=c.status==="active",it=c.introText?`<br><small class="muted">"${esc(c.introText)}"</small>`:"";
    b.hidden=act;$("form").hidden=!act;
    if(c.status==="pending")b.innerHTML=mine?`Menunggu <b>${esc(n)}</b> menerima permintaan chat.${it}`:`<b>${esc(n)}</b> ingin terhubung denganmu.${it}<div class="row mt"><button class="btn sm primary" data-acc>Terima</button><button class="btn sm" data-dec>Tolak</button></div>`;
    if(c.status==="blocked")b.innerHTML=c.blockedBy===me()?'Kamu memblokir percakapan ini. <button class="btn sm" data-unb>Buka blokir</button>':"Percakapan ini dibatasi oleh pengguna lain.";
    $("cblock").hidden=c.status!=="active";return true}
  function draw(){const c=chat();if(!c)return;const ob=C.otherOf(c),rd=C.readAt(c,ob);let last="",h=more?'<button class="btn sm" data-more style="align-self:center">Muat pesan sebelumnya</button>':"";
    h+=msgs.map(m=>{const t=C.ms(m.at),dk=new Date(t).toDateString(),sep=dk!==last?`<div class="day"><span>${esc(day(t))}</span></div>`:"";last=dk;const own=m.from===me();
      const tick=own?(m.pending?"🕓":rd>=t?'<span class="rd">✓✓</span>':"✓"):"",tx=m.text===null?'<span class="lockmsg">🔒 Pesan tidak bisa dibuka (kunci berubah)</span>':esc(m.text);
      return sep+`<div class="b ${own?"me":"ot"}" ${own?`data-m="${esc(m.id)}"`:""}><span class="tx">${tx}</span><span class="tm">${hm(t)} ${tick}</span></div>`}).join("");
    const stick=bottom()||!subbed;$("msgs").innerHTML=h||'<div class="empty muted">Belum ada pesan. Mulai dengan salam.</div>';if(stick)sc.scrollTop=sc.scrollHeight}
  function sub(){if(unsubM)unsubM();unsubM=C.watch(id,limit,(l,mo)=>{msgs=l;more=mo;draw();subbed=true;const c=chat();if(c&&c.lastFrom&&c.lastFrom!==me()&&C.ms(c.lastAt)>C.readAt(c,me())&&!document.hidden)C.markRead(id)},e=>{$("msgs").innerHTML=fail(errMsg(e))})}
  const refresh=()=>{const ok=head(),c=chat();
    if(ok&&c.status==="active"){C.syncPub(id);const k=E.state.pub+"|"+C.otherPub(c);if(!unsubM||k!==subKey){subKey=k;sub()}else draw()}
    else if(unsubM){unsubM();unsubM=null;subKey=""}}
  document.addEventListener("kl-chat",refresh);document.addEventListener("kl-e2e",refresh);refresh();
  const net=()=>{$("net").hidden=navigator.onLine};addEventListener("online",net);addEventListener("offline",net);net();
  const closeMenu=()=>{$("cact").classList.remove("open");$("cmenu").setAttribute("aria-expanded","false")};
  const ta=$("inp"),grow=()=>{ta.style.height="auto";ta.style.height=Math.min(ta.scrollHeight,130)+"px"};
  async function go(){const t=ta.value;if(!t.trim())return;ta.value="";grow();try{await C.send(id,t)}catch(x){ta.value=t;toast(errMsg(x))}}
  $("form").onsubmit=e=>{e.preventDefault();go()};ta.oninput=grow;
  ta.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey&&matchMedia("(pointer:fine)").matches){e.preventDefault();go()}};
  root.onclick=async e=>{const t=e.target;
    if(t.closest('[data-r="cmenu"]')){const o=$("cact").classList.toggle("open");$("cmenu").setAttribute("aria-expanded",o);return}
    if(!t.closest(".chat-actions"))closeMenu();else if(t.closest("button"))closeMenu();
    if(t.closest("[data-more]")){limit+=60;sub();return}
    try{if(t.closest("[data-acc]"))await C.accept(id);else if(t.closest("[data-dec]")){if(await ask("Tolak permintaan?","Permintaan chat ini dihapus.","Tolak")){await C.remove(id);location.hash="#/pesan"}}
      else if(t.closest("[data-unb]"))await C.unblock(id);
      else if(t.closest('[data-r="ccode"]')){const c=chat(),code=await E.fingerprint(E.state.pub,C.otherPub(c));await dialog({title:"Kode keamanan",html:`<p>Bandingkan kode ini dengan <b>${esc(C.nameOf(c))}</b> (telepon atau bertemu langsung). Jika sama di kedua perangkat, percakapan ini aman dari penyadapan.</p><p class="mono" style="font-size:18px;margin:10px 0">${esc(code)}</p>`,actions:[{label:"Tutup",value:null,cls:"primary"}]})}
      else if(t.closest('[data-r="cblock"]')){if(await ask("Blokir percakapan?","Kedua pihak tidak bisa saling mengirim pesan sampai kamu membuka blokir.","Blokir"))await C.block(id)}
      else if(t.closest('[data-r="cdel"]')){if(await ask("Hapus percakapan?","Percakapan hilang untuk kedua pihak dan tidak bisa dikembalikan.","Hapus")){await C.remove(id);location.hash="#/pesan"}}
      else{const b=t.closest("[data-m]");if(b&&await ask("Hapus pesan ini?","Pesan dihapus untuk kedua pihak.","Hapus"))await C.delMessage(id,b.dataset.m)}}catch(x){toast(errMsg(x))}};
  return()=>{document.removeEventListener("kl-chat",refresh);document.removeEventListener("kl-e2e",refresh);removeEventListener("online",net);removeEventListener("offline",net);if(unsubM)unsubM();C.state.open=null;document.dispatchEvent(new CustomEvent("kl-chat"))};
}
