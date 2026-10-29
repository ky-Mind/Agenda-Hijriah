import {get,set,toast} from "../store.js";
import {esc,skeleton,fail,copy,dialog} from "../lib/ui.js";
/* Jumlah ayat baku tiap surah (total 6.236). Data dari sumber mana pun yang tidak cocok ditolak, lalu dicoba sumber cadangan. */
const COUNT=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const CDN="https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/id/",EQ="https://equran.id/api/v2/surat";
const pad=n=>String(n).padStart(3,"0"),AUDIO=(s,a)=>`https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`;
const BISMILLAH="بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",memo={};
/* Tanzil menaruh basmalah di depan ayat 1 (kecuali Al-Fatihah dan At-Taubah). Basmalah sudah tampil sebagai judul, jadi dilepas dari ayat 1 agar nomor ayat sama dengan mushaf resmi (Kemenag). Anotasi tajwid (tj) ikut digeser. Harakat diabaikan saat mencocokkan karena Tanzil kadang menyusunnya berbeda */
const noHarakat=s=>s.replace(/[ً-ٰٟ]/g,"");
const cutBasmalah=(n,vs)=>{const t=vs[0].text,w=t.split(" ");if(n===1||n===9||noHarakat(w[3]??"")!==noHarakat(BISMILLAH.split(" ")[3]))return vs;const cut=w.slice(0,4).join(" ").length+1,tj=[];for(let i=0;vs[0].tj&&i<vs[0].tj.length;i+=3){const s=vs[0].tj[i]-cut,e=vs[0].tj[i+1]-cut;if(e>0)tj.push(Math.max(s,0),e,vs[0].tj[i+2])}return[{...vs[0],text:t.slice(cut),tj},...vs.slice(1)]};
async function getJ(u,ms=12000){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(u,{signal:ac.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(t)}}
async function firstOk(fns){const errs=[];for(const f of fns){try{return await f()}catch(e){errs.push(e.message)}}throw new Error(errs.join(" | "))}
const listSurah=()=>memo.list??=firstOk([
  async()=>{const j=await getJ(CDN+"index.json");if(j.length!==114)throw new Error("indeks tidak lengkap");return{src:"quran-json",list:j.map(s=>({id:+s.id,name:s.name,transliteration:s.transliteration,translation:s.translation,type:s.type,total_verses:+s.total_verses}))}},
  async()=>{const j=(await getJ(EQ)).data;if(!j||j.length!==114)throw new Error("indeks tidak lengkap");return{src:"equran.id",list:j.map(s=>({id:s.nomor,name:s.nama,transliteration:s.namaLatin,translation:s.arti,type:/mekah/i.test(s.tempatTurun)?"meccan":"medinan",total_verses:s.jumlahAyat}))}}
]).catch(e=>{delete memo.list;throw e});
const check=(n,s)=>{if(!s.verses||s.verses.length!==COUNT[n-1])throw new Error(`jumlah ayat ${s.verses?.length} ≠ ${COUNT[n-1]}`);if(s.verses.some((v,i)=>!v.text||!String(v.text).trim()||+v.id!==i+1))throw new Error("ada ayat kosong/urutan salah");return s};
const getSurah=n=>memo["s"+n]??=firstOk([
  async()=>{const [j,tz]=await Promise.all([getJ(`${CDN}${n}.json`),getJ(new URL(`../../data/tz/${n}.json`,import.meta.url))]);return check(n,{src:"Tanzil.net (teks) · quran-json (terjemahan)",id:n,name:j.name,transliteration:j.transliteration,translation:j.translation,type:j.type,verses:cutBasmalah(n,tz.verses).map((v,i)=>({id:v.id,text:v.text,tj:v.tj,transliteration:j.verses[i]?.transliteration,translation:j.verses[i]?.translation}))})},
  async()=>{const j=(await getJ(`${EQ}/${n}`)).data;return check(n,{src:"equran.id",id:n,name:j.nama,transliteration:j.namaLatin,translation:j.arti,type:/mekah/i.test(j.tempatTurun)?"meccan":"medinan",verses:j.ayat.map(v=>({id:+v.nomorAyat,text:v.teksArab,transliteration:v.teksLatin,translation:v.teksIndonesia}))})}
]).catch(e=>{delete memo["s"+n];throw e});
const tipe=t=>t==="meccan"?"Makkiyah":"Madaniyah";
/* Nomor ayat dalam teks Arab memakai angka Arab-Hindi (٠–٩) */
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
/* Jenis huruf Arab yang bisa dipilih di pengaturan baca (font Google, dimuat di index.html) */
const FONT_LIST=[["amiri","Amiri"],["naskh","Naskh"],["scheherazade","Scheherazade"]];
const FONTS={amiri:"'Amiri','Noto Naskh Arabic',serif",naskh:"'Noto Naskh Arabic','Amiri',serif",scheherazade:"'Scheherazade New','Amiri',serif"};
/* Pewarnaan tajwid dari anotasi tanzil/tajweed (lihat data/tz/ATTRIBUTION.txt). tj = [mulai, akhir (eksklusif), kelas] berpasangan.
   Kelas: 1 dengung, 2 qalqalah, 3 mad, 4 tidak dibaca. Teks tidak diubah, hanya dibungkus span. */
const TJC=["","tj-gh","tj-ql","tj-md","tj-sl"];
const tj=(a,on)=>{const t=a.text;if(!on||!a.tj?.length)return esc(t);const c=new Array(t.length).fill(0);for(let i=0;i<a.tj.length;i+=3)for(let k=a.tj[i];k<a.tj[i+1]&&k<t.length;k++)c[k]=a.tj[i+2];let h="",prev=-1;for(let k=0;k<t.length;k++){if(c[k]!==prev){if(prev>0)h+="</span>";if(c[k]>0)h+=`<span class="${TJC[c[k]]}">`;prev=c[k]}h+=esc(t[k])}return h+(prev>0?"</span>":"")};

/* Penyimpanan: kunci kl2_* ikut tersinkron ke akun Google (lihat sync.js) */
const bmData=()=>{const d=get("qbm",{});return{folders:d.folders||[],items:d.items||[]}};
const bmSave=d=>set("qbm",d);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const when=t=>new Date(t).toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
/* Catat terakhir baca. Riwayat terbaru di atas, maksimal 100, ayat yang sama tidak diulang */
function markRead(surah,nama,ayat){
  const last={surah,nama,ayat,t:Date.now()};
  set("quran_last",last);
  set("quran_hist",[last,...get("quran_hist",[]).filter(x=>!(x.surah===surah&&x.ayat===ayat))].slice(0,100));
}
const askName=(title,val="")=>dialog({title,input:val,actions:[{label:"Simpan",value:true,cls:"primary"},{label:"Batal",value:null,cls:"ghost"}]}).then(v=>v||null);
const confirmDel=(title,text)=>dialog({title,text,actions:[{label:"Hapus",value:true,cls:"danger"},{label:"Batal",value:false}]}).then(v=>v===true);

/* Halaman daftar: tab Surah, Bookmark, dan Terakhir Baca */
const TABS=[["surah","Surah"],["juz","Juz"],["bm","Bookmark"],["hist","Terakhir Baca"]];
/* Awal tiap juz (surah, ayat), pembagian juz standar */
const JUZ=[[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
async function index(box,isAlive){
  let r;try{r=await listSurah()}catch(e){if(isAlive())box.innerHTML=fail("Daftar surah gagal dimuat.",e.message);return}
  if(!isAlive())return;
  const last=get("quran_last");let tab="surah";
  box.innerHTML=`<div class="head"><h1>Al-Qur'an</h1><p>114 surah dengan terjemahan Indonesia, transliterasi, dan audio. Sumber: ${esc(r.src)}.</p></div>${last?`<a class="card" href="#/quran/${last.surah}/${last.ayat}"><h2>Lanjutkan membaca</h2><p>${esc(last.nama)} · ayat ${last.ayat}</p></a>`:""}<div class="seg qtabs" role="group" aria-label="Tampilan daftar">${TABS.map(([k,l])=>`<button type="button" data-tab="${k}" aria-pressed="false">${l}</button>`).join("")}</div><div data-p></div>`;
  const panel=box.querySelector("[data-p]");
  const surahPanel=()=>{
    panel.innerHTML=`<div class="field"><input type="search" placeholder="Cari surah (nama atau nomor)" aria-label="Cari surah" data-q></div><div class="grid" data-l></div>`;
    const l=panel.querySelector("[data-l]"),draw=q=>{q=q.toLowerCase().trim();l.innerHTML=r.list.filter(s=>!q||`${s.id} ${s.transliteration} ${s.translation} ${s.name}`.toLowerCase().includes(q)).map(s=>`<a class="card" href="#/quran/${s.id}"><div class="row sp"><h2>${s.id}. ${esc(s.transliteration)}</h2><span class="arab" style="font-size:22px;line-height:1.4">${esc(s.name)}</span></div><p>${esc(s.translation)} · ${s.total_verses} ayat · ${tipe(s.type)}</p></a>`).join("")||'<div class="empty">Surah tidak ditemukan.</div>'};
    panel.querySelector("[data-q]").oninput=e=>draw(e.target.value);draw("");
  };
  const bmPanel=()=>{
    const d=bmData();
    panel.innerHTML=`<button class="btn primary block" type="button" data-nf>+ Buat folder baru</button>`+
      (d.folders.length?d.folders.map(f=>{const its=d.items.filter(i=>i.fid===f.id);return `<div class="card mt"><div class="row sp"><button class="btn ghost sm" type="button" data-fm="${f.id}"><strong>${esc(f.name)}</strong> ⋯</button><span class="muted">${its.length} ayat</span></div>${its.map(i=>`<div class="row sp item"><a href="#/quran/${i.surah}/${i.ayat}">${esc(i.nama)} · ayat ${i.ayat}</a><button class="btn sm ghost" type="button" data-bd="${i.id}">Hapus</button></div>`).join("")||'<p class="muted">Belum ada bookmark di folder ini.</p>'}</div>`}).join(""):'<div class="empty">Belum ada folder bookmark. Tekan ☆ Bookmark di ayat mana pun saat membaca.</div>');
  };
  const juzPanel=()=>{panel.innerHTML=`<p class="muted" style="margin-bottom:8px">Pembagian juz standar. Ketuk untuk mulai membaca dari awal juz.</p><div class="grid">${JUZ.map(([sn,an],i)=>{const su=r.list.find(x=>x.id===sn);return `<a class="card" href="#/quran/${sn}/${an}"><div class="row sp"><h2>Juz ${i+1}</h2><span class="muted">QS ${esc(su?.transliteration||sn)} : ${an}</span></div></a>`}).join("")}</div>`};
  const histPanel=()=>{
    const h=get("quran_hist",[]);
    panel.innerHTML=h.length?`<div class="row sp"><span class="muted">${h.length} riwayat</span><button class="btn sm ghost danger" type="button" data-hc>Hapus riwayat</button></div>`+h.map(x=>`<a class="card mt" href="#/quran/${x.surah}/${x.ayat}"><div class="row sp"><h2>${esc(x.nama)}</h2><span class="muted" style="font-size:12px">${when(x.t)}</span></div><p>Ayat ${x.ayat}</p></a>`).join(""):'<div class="empty">Belum ada riwayat baca. Tekan "Tandai terakhir dibaca" saat membaca ayat.</div>';
  };
  const show=()=>{
    box.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tab===tab));
    if(tab==="surah")surahPanel();else if(tab==="juz")juzPanel();else if(tab==="bm")bmPanel();else histPanel();
  };
  box.onclick=async e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
    if(d.tab){tab=d.tab;return show()}
    if(b.hasAttribute("data-nf")){const nm=await askName("Buat folder baru");if(!nm)return;const bd=bmData();bd.folders.push({id:uid(),name:nm});bmSave(bd);return show()}
    if(d.fm){const f=bmData().folders.find(x=>x.id===d.fm);if(!f)return;
      const a=await dialog({title:f.name,actions:[{label:"Ganti nama",value:"rename"},{label:"Hapus folder",value:"del",cls:"danger"},{label:"Batal",value:null,cls:"ghost"}]});
      if(a==="rename"){const nm=await askName("Ganti nama folder",f.name);if(!nm)return;const bd=bmData();bd.folders.find(x=>x.id===f.id).name=nm;bmSave(bd);return show()}
      if(a==="del"&&await confirmDel("Hapus folder?",`Folder "${f.name}" dan semua bookmark di dalamnya akan dihapus.`)){const bd=bmData();bd.folders=bd.folders.filter(x=>x.id!==f.id);bd.items=bd.items.filter(x=>x.fid!==f.id);bmSave(bd);return show()}
      return}
    if(d.bd){const bd=bmData();bd.items=bd.items.filter(x=>x.id!==d.bd);bmSave(bd);return show()}
    if(b.hasAttribute("data-hc")){if(await confirmDel("Hapus riwayat?","Semua riwayat terakhir baca akan dihapus. Lanjutkan membaca tetap tersimpan.")){set("quran_hist",[]);show()}}
  };
  show();
}

export default async function(root,args){
  const box=root.querySelector('[data-r="root"]');let audio=null,alive=true;
  const stop=()=>{if(audio){audio.onended=audio.onerror=null;audio.pause();audio=null}root.querySelectorAll(".playing").forEach(x=>x.classList.remove("playing"));pl.hidden=true};
  box.innerHTML=skeleton(6);
  if(!args[0]){await index(box,()=>alive);return()=>{alive=false}}
  const n=+args[0];if(!(n>=1&&n<=114)){box.innerHTML='<div class="empty">Nomor surah tidak valid.</div>';return}
  let s;try{s=await getSurah(n)}catch(e){if(alive)box.innerHTML=fail("Surah gagal dimuat. Teks tidak ditampilkan jika datanya tidak lengkap.",e.message);return}
  if(!alive)return;
  document.dispatchEvent(new CustomEvent("kl-title",{detail:`${s.id}. ${s.transliteration}`}));
  const pref={latin:true,arti:true,size:28,theme:"terang",mode:"ayat",font:"amiri",tajwid:false,...get("quran_pref",{})},jump=+args[1]||0;
  const THEMES=[["terang","Terang","#f4f3ee"],["sepia","Sepia","#f4ecd8"],["gelap","Gelap","#0f1412"]],MODES=[["ayat","Per ayat"],["alir","Mengalir"]];
  /* Pengaturan baca dibuka dari ikon ⚙ di bilah atas: aksi putar, lompat ayat, dan semua pilihan tampilan */
  const sheet=document.createElement("div");sheet.className="modal qsheet";sheet.setAttribute("role","dialog");sheet.setAttribute("aria-label","Pengaturan baca");
  sheet.innerHTML=`<div class="box"><div class="row sp qsheet-head"><h2>Pengaturan baca</h2><button class="btn ghost sm" type="button" data-close aria-label="Tutup">✕</button></div>
    <div class="row qsheet-act"><button class="btn primary sm" type="button" data-all>▶ Putar semua</button><button class="btn sm" type="button" data-stop>Berhenti</button><input type="number" min="1" max="${s.verses.length}" placeholder="Ayat ke…" aria-label="Lompat ke ayat" data-j></div>
    <div class="qsheet-sec"><span class="qlabel">Tema baca</span><div class="qthemes">${THEMES.map(([k,l,c])=>`<button type="button" data-th="${k}" style="--c:${c}" aria-pressed="false"><i></i>${l}</button>`).join("")}</div></div>
    <div class="qsheet-sec"><span class="qlabel">Tampilan</span><div class="qpills">${MODES.map(([k,l])=>`<button type="button" data-mode="${k}" aria-pressed="false">${l}</button>`).join("")}</div></div>
    <div class="qsheet-sec"><span class="qlabel">Tampilkan</span><div class="qtoggles"><button type="button" data-t="latin" aria-pressed="${pref.latin}">Transliterasi</button><button type="button" data-t="arti" aria-pressed="${pref.arti}">Terjemahan</button><button type="button" data-t="tajwid" aria-pressed="${pref.tajwid}">Tajwid berwarna</button></div>
      <div class="tjlegend"><span class="tj-gh">Dengung</span><span class="tj-ql">Qalqalah</span><span class="tj-md">Mad</span><span class="tj-sl">Tidak dibaca</span></div></div>
    <div class="qsheet-sec"><span class="qlabel">Ukuran huruf Arab</span><div class="qstep"><button type="button" data-z="-2" aria-label="Perkecil huruf">A−</button><output data-sz>${pref.size}px</output><button type="button" data-z="2" aria-label="Perbesar huruf">A+</button></div></div>
    <div class="qsheet-sec"><span class="qlabel">Jenis huruf</span><div class="qfonts">${FONT_LIST.map(([k,l])=>`<button type="button" data-font="${k}" style="font-family:${FONTS[k]}" aria-pressed="false"><span class="qfp">ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ</span><small>${l}</small></button>`).join("")}</div></div>
    <p class="src qsrc">Teks: Tanzil.net · Tajwid: tarekeldeeb/quran-tajweed-embedded (CC BY 4.0)</p>
    </div></div>`;
  box.innerHTML=`<div class="head"><h1>${s.id}. ${esc(s.transliteration)} <span class="arab" style="font-size:26px;display:inline">${esc(s.name)}</span></h1><p>${esc(s.translation)} · ${s.verses.length} ayat · ${tipe(s.type)}</p></div>
  <div class="card" data-v></div><div class="row sp">${n>1?`<a class="btn" href="#/quran/${n-1}">‹ Sebelumnya</a>`:"<span></span>"}<a class="btn" href="#/quran">Daftar surah</a>${n<114?`<a class="btn" href="#/quran/${n+1}">Berikutnya ›</a>`:"<span></span>"}</div><p class="src" style="text-align:center;margin-top:10px">Sumber teks: ${esc(s.src)}</p>`;
  const v=box.querySelector("[data-v]"),last=()=>get("quran_last");
  /* Pemutar audio melayang: tampil saat audio berjalan, berisi ayat aktif dan kontrol sebelumnya/jeda/berikutnya */
  const pl=document.createElement("div");pl.className="qplay";pl.hidden=true;
  pl.innerHTML=`<span class="qplay-t" data-pl-t></span><div class="row"><button class="btn sm" type="button" data-pl-act="prev" aria-label="Ayat sebelumnya">⏮</button><button class="btn sm" type="button" data-pl-act="pp" aria-label="Jeda atau lanjut">❚❚</button><button class="btn sm" type="button" data-pl-act="next" aria-label="Ayat berikutnya">⏭</button><button class="btn sm ghost" type="button" data-pl-act="x" aria-label="Tutup pemutar">✕</button></div>`;
  document.body.appendChild(pl);pl.onclick=e=>{const b=e.target.closest("[data-pl-act]");if(b)plAct(b.dataset.plAct)};
  let cur=0,chainOn=false,sel=0;
  /* Alat aksi untuk ayat yang dipilih: muncul saat ayat diketuk, ketuk lagi untuk menutup */
  const actBar=(id,saved)=>`<div class="qact" aria-label="Aksi ayat ${id}"><button class="btn sm" type="button" data-p="${id}">▶ Putar</button><button class="btn sm" type="button" data-m="${id}">Tandai terakhir dibaca</button><button class="btn sm${saved?" primary":""}" type="button" data-bm="${id}" aria-pressed="${saved}">${saved?"★ Tersimpan":"☆ Bookmark"}</button><button class="btn sm" type="button" data-cp="${id}">Salin</button></div>`;
  /* Isi ayat hanya dibangun ulang saat mode baca berganti. Ketukan, tema, ukuran, dan bookmark cukup mengubah kelas dan bagian kecil, sehingga tidak ada render ulang yang bikin tersendat. Transliterasi, terjemahan, dan tajwid selalu ada di DOM dan disembunyikan lewat kelas */
  const html=()=>{const head=n!==1&&n!==9?`<div class="arab" style="text-align:center">${BISMILLAH}</div>`:"";
    return pref.mode==="alir"
      ?head+`<div class="arab flowtext">${s.verses.map(a=>`<span class="fl" id="a${a.id}">${tj(a,true)} <span class="fln">${ar(a.id)}</span></span>`).join(" ")}</div>`
      :head+s.verses.map(a=>`<div class="item ayah" id="a${a.id}"><div class="num"><span class="anum">${ar(a.id)}</span></div><div><div class="arab">${tj(a,true)}</div>${a.transliteration?`<p class="latin">${esc(a.transliteration)}</p>`:""}${a.translation?`<p class="tr">${esc(a.translation)}</p>`:""}</div></div>`).join("")};
  /* Kelas ayah yang ditandai dan bookmark diperbarui di tempat */
  const marks=()=>{const lt=last(),bm=bmData().items;v.querySelectorAll("[id^=a]").forEach(el=>{const id=+el.id.slice(1);el.classList.toggle("mark",lt?.surah===n&&lt?.ayat===id);el.classList.toggle("saved",bm.some(i=>i.surah===n&&i.ayat===id))})};
  /* Bilah aksi hanya dipasang ulang untuk ayat yang dipilih */
  const actsFor=()=>{v.querySelector(".qact")?.remove();const el=sel&&v.querySelector("#a"+sel);if(!el)return;const host=v;host.insertAdjacentHTML("beforeend",actBar(sel,bmData().items.some(i=>i.surah===n&&i.ayat===sel)))};
  const paint=()=>{
    root.style.setProperty("--af",pref.size+"px");
    v.className=`card qr qr-${pref.theme}${pref.mode==="alir"?" flow":""}${pref.latin?"":" no-latin"}${pref.arti?"":" no-arti"}${pref.tajwid?"":" no-tj"}`;
    v.style.setProperty("--arab",FONTS[pref.font]||FONTS.amiri);
    sheet.querySelectorAll("[data-th]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.th===pref.theme));
    sheet.querySelectorAll("[data-mode]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.mode===pref.mode));
    sheet.querySelectorAll("[data-font]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.font===pref.font));
    sheet.querySelectorAll("[data-t]").forEach(x=>x.setAttribute("aria-pressed",pref[x.dataset.t]));
    sheet.querySelectorAll("[data-sz]").forEach(x=>x.textContent=pref.size+"px");
  };
  const draw=rebuild=>{if(rebuild)v.innerHTML=html();paint();marks();actsFor()};
  const plShow=i=>{pl.hidden=false;pl.querySelector("[data-pl-t]").textContent=`${s.transliteration} · ayat ${i}`;pl.querySelector("[data-pl-act=pp]").textContent=audio?.paused?"▶":"❚❚"};
  const plAct=k=>{if(k==="x")return stop();if(k==="pp"){if(!audio)return play(cur||1,chainOn);audio.paused?audio.play():audio.pause();return plShow(cur)}if(k==="prev")return play(Math.max(1,cur-1),chainOn);if(k==="next")return play(Math.min(s.verses.length,cur+1),chainOn)};
  const play=(i,chain)=>{stop();const a=s.verses[i-1];if(!a)return;cur=i;chainOn=chain;plShow(i);const el=v.querySelector("#a"+i);el?.classList.add("playing");el?.scrollIntoView({block:"center",behavior:"smooth"});
    audio=new Audio(AUDIO(n,i));audio.onended=()=>{el?.classList.remove("playing");if(chain&&i<s.verses.length)play(i+1,true);else stop()};audio.onerror=()=>{el?.classList.remove("playing");toast("Audio tidak dapat dimuat (periksa koneksi)")};audio.play().catch(()=>{})};
  /* Tambah atau hapus ayat dari bookmark. Tambah meminta pilihan folder, atau membuat folder baru */
  const toggleBm=async a=>{
    const bd=bmData(),cur=bd.items.find(i=>i.surah===n&&i.ayat===a);
    if(cur){bd.items=bd.items.filter(i=>i!==cur);bmSave(bd);draw();return toast("Bookmark dihapus")}
    const c=await dialog({title:"Pilih folder bookmark",actions:[...bd.folders.map(f=>({label:f.name,value:f.id})),{label:"+ Buat folder baru",value:"new"},{label:"Batal",value:null,cls:"ghost"}]});
    if(!c)return;
    let fid=c;
    if(c==="new"){const nm=await askName("Buat folder baru");if(!nm)return;fid=uid();bd.folders.push({id:fid,name:nm})}
    bd.items.push({id:uid(),fid,surah:n,ayat:a,nama:s.transliteration,t:Date.now()});bmSave(bd);draw();toast("Disimpan ke bookmark");
  };
  /* Lompat ke ayat terakhir dibaca langsung di frame yang sama, tanpa jeda 50 ms, supaya layar tidak sempat tampil dari atas lalu meloncat. Setelah font Arab selesai dimuat, posisi diperbaiki lagi karena tinggi baris bisa berubah */
  const toJump=()=>v.querySelector("#a"+jump)?.scrollIntoView({block:"center",behavior:"instant"});
  draw(true);if(jump>0){toJump();document.fonts?.ready.then(()=>alive&&toJump())}
  /* Surah sebelum dan sesudahnya diambil diam-diam setelah halaman tampil, supaya tombol ‹ dan › langsung muncul tanpa jeda memuat */
  const pre=setTimeout(()=>[n-1,n+1].forEach(k=>k>=1&&k<=114&&getSurah(k).catch(()=>{})),700);
  sheet.querySelector("[data-j]").onchange=e=>{const i=+e.target.value;if(i>=1&&i<=s.verses.length)v.querySelector("#a"+i)?.scrollIntoView({block:"center",behavior:"smooth"});else toast(`Ayat 1–${s.verses.length}`)};
  const save=rebuild=>{set("quran_pref",pref);draw(rebuild)};
  const onAct=e=>{const f=e.target.closest(".fl");if(f){const id=+f.id.slice(1);sel=sel===id?0:id;return draw()}const item=e.target.closest(".item.ayah");if(item&&!e.target.closest("button")){const id=+item.id.slice(1);sel=sel===id?0:id;return draw()}const b=e.target.closest("button");if(!b)return;const d=b.dataset;
    if(d.t){pref[d.t]=!pref[d.t];return save()}
    if(d.th){pref.theme=d.th;return save()}
    if(d.mode){pref.mode=d.mode;return save(true)}
    if(d.z){pref.size=Math.min(48,Math.max(20,pref.size+ +d.z));return save()}
    if(d.font){pref.font=d.font;return save()}
    if(d.p)return play(+d.p,false);
    if(d.all!==undefined){closeSheet();return play(1,true)}
    if(d.stop!==undefined)return stop();
    if(d.cp){const a=s.verses[+d.cp-1];if(a)copy(`${a.text}\n${a.translation||""}\n(QS ${s.transliteration} : ${a.id})`.trim())}
    if(d.m){markRead(n,s.transliteration,+d.m);draw();toast("Ditandai: "+s.transliteration+" ayat "+d.m)}
    if(d.bm)return toggleBm(+d.bm)};
  /* Sheet dibuka dari bilah atas, ditutup lewat ✕, klik latar, atau Esc */
  const bar=document.getElementById("barActs");
  const openSheet=()=>{if(!sheet.isConnected)document.body.appendChild(sheet)},closeSheet=()=>sheet.remove();
  const barClick=e=>{if(e.target.closest("[data-qset]"))openSheet()};
  const onKey=e=>{if(e.key==="Escape")closeSheet()};
  bar.innerHTML=`<button class="icb" type="button" data-qset aria-label="Pengaturan baca"><svg class="ic"><use href="#i-gear" /></svg></button>`;
  bar.addEventListener("click",barClick);document.addEventListener("keydown",onKey);
  box.onclick=onAct;
  sheet.onclick=e=>{if(e.target===sheet||e.target.closest("[data-close]"))return closeSheet();onAct(e)};
  return()=>{alive=false;clearTimeout(pre);stop();pl.remove();sheet.remove();bar.removeEventListener("click",barClick);document.removeEventListener("keydown",onKey);bar.innerHTML="";root.style.removeProperty("--af")};
}
