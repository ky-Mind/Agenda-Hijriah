/* Kisah Lillah — halaman Al-Qur'an (file terpisah).
   v7: daftar surah disusun vertikal (bukan grid kiri-kanan), pencarian
   surah mendukung kecocokan persis maupun mendekati (typo-tolerant),
   mode baca layar penuh gaya buku, tombol tampil/sembunyikan Arab/Latin/
   Arti, audio per-ayat maupun satu surah penuh, serta "lanjutkan membaca"
   + riwayat baca yang tersimpan pada akun aktif (ikut akun Google bila
   pengguna masuk lewat fitur yang sudah ada di js/core.js).

   Sumber teks: CDN "quran-json" (Arab Utsmani, transliterasi Latin, dan
   terjemahan Indonesia per surah), diakses lewat jsdelivr sehingga cepat
   dan tidak memerlukan API key. Audio per-ayat memakai qori Alafasy dari
   everyayah.com; jika satu file audio tidak tersedia, tombol putar
   disembunyikan tanpa mengganggu bacaan. */
(function(){
  const INDEX_URL="https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/id/index.json";
  const CHAPTER_URL=n=>`https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/id/${n}.json`;
  const AUDIO_URL=(surah,ayah)=>`https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3,"0")}${String(ayah).padStart(3,"0")}.mp3`;
  const CACHE_KEY="aih_quran_index_v1";
  let INDEX=[];
  let currentChapter=null;
  let playAllQueue=null;
  let quranWakeLock=null;

  async function keepQuranAudioAlive(){
    if(!("wakeLock" in navigator))return;
    try{
      if(!quranWakeLock){
        quranWakeLock=await navigator.wakeLock.request("screen");
      }
    }catch(e){}
  }
  function releaseQuranAudioWakeLock(){
    if(quranWakeLock && typeof quranWakeLock.release === "function"){
      quranWakeLock.release().catch(()=>{});
    }
    quranWakeLock=null;
  }

  function esc(s){
    return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function norm(s){
    return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g,"").trim();
  }
  // Jarak Levenshtein sederhana untuk pencarian "mendekati" (typo-tolerant).
  function levenshtein(a,b){
    if(a===b)return 0;
    const m=a.length,n=b.length;
    if(!m)return n; if(!n)return m;
    let prev=Array(n+1).fill(0).map((_,i)=>i);
    for(let i=1;i<=m;i++){
      const cur=[i];
      for(let j=1;j<=n;j++){
        cur[j]=a[i-1]===b[j-1]?prev[j-1]:1+Math.min(prev[j-1],prev[j],cur[j-1]);
      }
      prev=cur;
    }
    return prev[n];
  }
  function matchesQuery(s,qNorm){
    const sNorm=norm(s);
    if(!qNorm)return true;
    if(String(s)===qNorm)return true;
    if(sNorm.includes(qNorm))return true;
    // kecocokan mendekati: izinkan sedikit typo relatif terhadap panjang kata kunci
    const words=sNorm.split(" ");
    const tolerance=qNorm.length<=4?1:2;
    return words.some(w=>levenshtein(w,qNorm)<=tolerance);
  }

  function renderContinueCard(){
    const wrap=document.getElementById("quranContinueCard");
    if(!wrap)return;
    const last=(typeof getQuranLastRead==="function")?getQuranLastRead():null;
    if(!last){wrap.innerHTML="";wrap.hidden=true;return;}
    wrap.hidden=false;
    wrap.innerHTML=`
      <button type="button" class="card quran-surah-continue" id="quranContinueBtn">
        <span>
          <b>Lanjutkan membaca</b>
          <small>${esc(last.surahName)} • Ayat ${last.ayahId} dari ${last.totalAyah}</small>
        </span>
        <span class="btn small">Lanjut ›</span>
      </button>`;
    wrap.querySelector("#quranContinueBtn")?.addEventListener("click",()=>openSurah(last.surahId,last.ayahId));
  }

  function renderIndex(list){
    const wrap=document.getElementById("quranSurahList");
    if(!wrap)return;
    if(!list.length){
      wrap.innerHTML=klStateHtml("Tidak ditemukan","Coba kata kunci lain — pencarian juga menoleransi salah ketik ringan.");
      return;
    }
    wrap.innerHTML=list.map(s=>`
      <button type="button" class="card quran-surah-row" data-id="${s.id}">
        <span class="quran-surah-number">${s.id}</span>
        <span class="quran-surah-info">
          <b>${esc(s.transliteration)}</b>
          <span class="muted">${esc(s.translation)} • ${s.total_verses} ayat</span>
        </span>
        <span class="quran-surah-arabic" dir="rtl" lang="ar">${esc(s.name)}</span>
      </button>`).join("");
    wrap.querySelectorAll("[data-id]").forEach(btn=>{
      btn.addEventListener("click",()=>openSurah(Number(btn.dataset.id)));
    });
  }

  function onSearch(e){
    const raw=e.target.value.trim();
    const q=norm(raw);
    if(!q){renderIndex(INDEX);return;}
    // Kecocokan persis (nomor atau substring) diprioritaskan; jika kosong,
    // baru tampilkan hasil "mendekati".
    const exact=INDEX.filter(s=>String(s.id)===raw||norm(s.transliteration).includes(q)||norm(s.translation).includes(q));
    if(exact.length){renderIndex(exact);return;}
    const approx=INDEX.filter(s=>matchesQuery(s.transliteration,q)||matchesQuery(s.translation,q));
    renderIndex(approx);
  }

  async function loadIndex(){
    const wrap=document.getElementById("quranSurahList");
    try{
      let cached=null;
      try{cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null")}catch(e){}
      if(cached&&Array.isArray(cached)&&cached.length===114){
        INDEX=cached;renderIndex(INDEX);
      }
      const res=await fetch(INDEX_URL,{cache:"force-cache"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      INDEX=await res.json();
      try{localStorage.setItem(CACHE_KEY,JSON.stringify(INDEX))}catch(e){}
      renderIndex(INDEX);
    }catch(e){
      if(!INDEX.length&&wrap){wrap.innerHTML=klStateHtml("Gagal memuat daftar surah","Periksa koneksi internet.","quranIndexRetry");document.getElementById("quranIndexRetry")?.addEventListener("click",loadIndex);}
    }
    renderContinueCard();
  }

  function displayPrefs(){return (typeof getQuranDisplayPrefs==="function")?getQuranDisplayPrefs():{arabic:true,latin:true,translation:true}}

  function applyDisplayPrefs(container){
    const p=displayPrefs();
    container.querySelectorAll(".quran-ayat-arabic").forEach(el=>el.hidden=!p.arabic);
    container.querySelectorAll(".quran-ayat-latin").forEach(el=>el.hidden=!p.latin);
    container.querySelectorAll(".quran-ayat-translation").forEach(el=>el.hidden=!p.translation);
    ["arabic","latin","translation"].forEach(key=>{
      const chip=document.getElementById("quranChip_"+key);
      if(chip)chip.classList.toggle("active",!!p[key]);
    });
  }

  function toggleDisplayPref(key){
    const p=displayPrefs();
    p[key]=!p[key];
    if(!p.arabic&&!p.latin&&!p.translation)p[key]=true; // minimal satu tetap tampil
    if(typeof setQuranDisplayPrefs==="function")setQuranDisplayPrefs(p);
    const detail=document.getElementById("quranDetailView");
    if(detail)applyDisplayPrefs(detail);
    const full=document.getElementById("quranFullscreenReader");
    if(full)applyDisplayPrefs(full);
  }
  window.toggleQuranDisplayPref=toggleDisplayPref;

  function toolbarHtml(includeReadMode=true,playId="quranPlayAllBtn"){
    const p=displayPrefs();
    const chip=(key,label)=>`<button type="button" class="quran-toggle-chip${p[key]?" active":""}" id="quranChip_${key}" onclick="toggleQuranDisplayPref('${key}')">${label}</button>`;
    return `
      <div class="quran-toolbar">
        ${chip("arabic","Arab")}
        ${chip("latin","Latin")}
        ${chip("translation","Arti")}
        <button type="button" class="btn outline small" id="${playId}">▶ Putar satu surah</button>
        ${includeReadMode?'<button type="button" class="btn outline small" id="quranReadModeBtn">Mode baca layar penuh</button>':""}
      </div>`;
  }

  function ayatCard(surahId,v){
    const audioId=`qAudio_${surahId}_${v.id}`;
    return `
      <div class="card quran-ayat-card" data-ayah="${v.id}">
        <div class="quran-ayat-head">
          <span class="quran-ayat-number">${v.id}</span>
          <button type="button" class="icon-btn quran-play-btn" data-audio="${audioId}" aria-label="Putar ayat ${v.id}">▶</button>
        </div>
        <p class="quran-ayat-arabic" dir="rtl" lang="ar">${esc(v.text)}</p>
        <p class="quran-ayat-latin"><i>${esc(v.transliteration||"")}</i></p>
        <p class="quran-ayat-translation">${esc(v.translation)}</p>
        <audio id="${audioId}" preload="none" src="${AUDIO_URL(surahId,v.id)}"></audio>
      </div>`;
  }

  function wirePlayButtons(container,chapter){
    container.querySelectorAll(".quran-play-btn").forEach(btn=>{
      const audio=document.getElementById(btn.dataset.audio);
      if(!audio)return;
      audio.addEventListener("error",()=>{btn.disabled=true;btn.title="Audio tidak tersedia";btn.textContent="✕";},{once:true});
      audio.addEventListener("play",()=>keepQuranAudioAlive(),{once:true});
      audio.addEventListener("pause",()=>{if(audio.paused){releaseQuranAudioWakeLock();}}, {once:false});
      audio.addEventListener("ended",()=>{btn.textContent="▶";btn.classList.remove("is-playing");releaseQuranAudioWakeLock();});
      btn.addEventListener("click",()=>{
        stopPlayAll();
        container.querySelectorAll("audio").forEach(a=>{if(a!==audio){a.pause();a.currentTime=0;}});
        container.querySelectorAll(".quran-play-btn").forEach(b=>{if(b!==btn){b.classList.remove("is-playing");b.textContent="▶";}});
        if(audio.paused){
          keepQuranAudioAlive();
          audio.play().catch(()=>{btn.disabled=true;btn.textContent="✕";});
          btn.textContent="⏸";btn.classList.add("is-playing");
        }else{
          audio.pause();btn.textContent="▶";btn.classList.remove("is-playing");
        }
      });
    });
  }

  function stopPlayAll(){
    if(playAllQueue){playAllQueue.stopped=true;playAllQueue=null;}
    releaseQuranAudioWakeLock();
  }

  function playAllFromContainer(container,chapter){
    stopPlayAll();
    container.querySelectorAll("audio").forEach(a=>{a.pause();a.currentTime=0;});
    container.querySelectorAll(".quran-play-btn").forEach(b=>{b.textContent="▶";b.classList.remove("is-playing");});
    const cards=[...container.querySelectorAll(".quran-ayat-card,.quran-book-ayah")];
    let i=0;
    const queue={stopped:false};
    playAllQueue=queue;
    const playBtn=document.getElementById("quranPlayAllBtn")||document.getElementById("quranReadPlayAllBtn");
    if(playBtn)playBtn.textContent="⏸ Berhenti";
    function playNext(){
      if(queue.stopped||i>=cards.length){
        if(playBtn)playBtn.textContent="▶ Putar satu surah";
        return;
      }
      const card=cards[i];
      const audio=card.querySelector("audio");
      const btn=card.querySelector(".quran-play-btn");
      card.scrollIntoView({block:"center",behavior:"smooth"});
      if(btn){btn.textContent="⏸";btn.classList.add("is-playing");}
      audio.currentTime=0;
      audio.play().catch(()=>{i++;playNext();});
      audio.onended=()=>{if(btn){btn.textContent="▶";btn.classList.remove("is-playing");}i++;playNext();};
    }
    playNext();
  }

  function trackReadProgress(container,chapter){
    if(!("IntersectionObserver" in window))return;
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting && typeof recordQuranRead==="function"){
          const ayahId=Number(en.target.dataset.ayah);
          recordQuranRead(chapter.id,chapter.transliteration,ayahId,chapter.total_verses);
        }
      });
    },{threshold:0.6});
    container.querySelectorAll(".quran-ayat-card,.quran-book-ayah").forEach(c=>obs.observe(c));
  }

  function ayatWrapHtml(chapter){
    return `<div class="quran-ayat-wrap">${chapter.verses.map(v=>ayatCard(chapter.id,v)).join("")}</div>`;
  }

  function bookHtml(chapter){
    return `<article class="quran-book-page">
      <div class="quran-book-arabic quran-ayat-arabic" dir="rtl" lang="ar">${chapter.verses.map(v=>`
        <span class="quran-book-ayah" data-ayah="${v.id}">
          <span class="quran-book-ayah-text">${esc(v.text)}</span>
          <span class="quran-book-ayah-number">${v.id}</span>
          <button type="button" class="quran-play-btn quran-book-play-btn" data-audio="qAudioBook_${chapter.id}_${v.id}" aria-label="Putar ayat ${v.id}">▶</button>
          <audio id="qAudioBook_${chapter.id}_${v.id}" preload="none" src="${AUDIO_URL(chapter.id,v.id)}"></audio>
        </span>`).join(" ")}</div>
      <div class="quran-book-translation quran-ayat-translation">${chapter.verses.map(v=>`
        <p class="quran-book-translation-item" data-ayah="${v.id}">
          <b>${v.id}.</b> ${esc(v.translation)}
        </p>`).join("")}</div>
      <div class="quran-book-latin quran-ayat-latin">${chapter.verses.map(v=>`
        <p class="quran-book-latin-item" data-ayah="${v.id}">
          <b>${v.id}.</b> <i>${esc(v.transliteration||"")}</i>
        </p>`).join("")}</div>
    </article>`;
  }

  async function openSurah(id,scrollToAyah){
    document.getElementById("quranIndexView").hidden=true;
    const detail=document.getElementById("quranDetailView");
    detail.hidden=false;
    detail.innerHTML='<button class="btn outline small" type="button" id="quranBackBtn">‹ Daftar surah</button>'+klSkeletonRows(1)+'<div class="kl-skeleton" style="height:220px;margin-top:8px"></div>';
    detail.querySelector("#quranBackBtn")?.addEventListener("click",backToIndex);
    try{
      const res=await fetch(CHAPTER_URL(id),{cache:"force-cache"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      const chapter=await res.json();
      currentChapter=chapter;
      detail.innerHTML=`
        <button class="btn outline small" type="button" id="quranBackBtn">‹ Daftar surah</button>
        <div class="quran-detail-head">
          <h2 dir="rtl" lang="ar">${esc(chapter.name)}</h2>
          <p class="muted">${esc(chapter.transliteration)} • ${esc(chapter.translation)} • ${chapter.total_verses} ayat • ${chapter.type==="meccan"?"Makkiyah":"Madaniyyah"}</p>
        </div>
        ${toolbarHtml()}
        ${ayatWrapHtml(chapter)}`;
      document.getElementById("quranBackBtn").addEventListener("click",backToIndex);
      wirePlayButtons(detail,chapter);
      applyDisplayPrefs(detail);
      trackReadProgress(detail,chapter);
      document.getElementById("quranPlayAllBtn")?.addEventListener("click",()=>{
        if(playAllQueue)stopPlayAll();else playAllFromContainer(detail,chapter);
      });
      document.getElementById("quranReadModeBtn")?.addEventListener("click",()=>openReadingMode(chapter));
      if(scrollToAyah){
        const target=detail.querySelector(`.quran-ayat-card[data-ayah="${scrollToAyah}"]`);
        (target||detail).scrollIntoView({block:"start"});
      }else{
        detail.scrollIntoView({block:"start"});
      }
    }catch(e){
      detail.innerHTML='<button class="btn outline small" type="button" id="quranBackBtn">‹ Daftar surah</button>'+klStateHtml("Gagal memuat surah","Periksa koneksi internet, lalu coba lagi.");
      document.getElementById("quranBackBtn").addEventListener("click",backToIndex);
    }
  }

  /* Mode baca layar penuh: tampilan seperti membuka buku, seluruh
     header/nav aplikasi disembunyikan, ayat mengalir dari atas ke bawah. */
  function openReadingMode(chapter){
    let full=document.getElementById("quranFullscreenReader");
    if(!full){
      full=document.createElement("div");
      full.id="quranFullscreenReader";
      full.className="quran-reading-mode";
      document.body.appendChild(full);
    }
    document.body.classList.add("quran-reading-lock");
    full.innerHTML=`
      <div class="quran-reading-topbar">
        <button class="btn outline small" type="button" id="quranReadCloseBtn">‹ Tutup mode baca</button>
      </div>
      <div class="quran-detail-head">
        <h2 dir="rtl" lang="ar">${esc(chapter.name)}</h2>
        <p class="muted">${esc(chapter.transliteration)} • ${chapter.total_verses} ayat</p>
      </div>
      ${toolbarHtml(false,"quranReadPlayAllBtn")}
      ${bookHtml(chapter)}`;
    wirePlayButtons(full,chapter);
    applyDisplayPrefs(full);
    trackReadProgress(full,chapter);
    full.querySelector("#quranReadCloseBtn").addEventListener("click",closeReadingMode);
    full.querySelector("#quranReadPlayAllBtn").addEventListener("click",()=>{
      if(playAllQueue)stopPlayAll();else playAllFromContainer(full,chapter);
    });
    full.scrollTop=0;full.scrollLeft=0;
  }
  function closeReadingMode(){
    stopPlayAll();
    const full=document.getElementById("quranFullscreenReader");
    if(full){full.querySelectorAll("audio").forEach(a=>a.pause());full.remove();}
    document.body.classList.remove("quran-reading-lock");
  }

  function backToIndex(){
    stopPlayAll();
    document.getElementById("quranDetailView").hidden=true;
    document.querySelectorAll("#koleksiQuran audio").forEach(a=>a.pause());
    document.getElementById("quranIndexView").hidden=false;
    renderContinueCard();
  }

  function mountQuran(){
    const mount=document.querySelector("#koleksiQuran .page-mount");
    if(!mount)return;
    mount.innerHTML=`
      <div id="quranIndexView">
        <div class="card quran-surah-continue" id="quranContinueCard" hidden></div>
        <div class="collection-search-bar">
          <input type="search" id="quranSearch" placeholder="Cari surah (nama atau nomor)…" aria-label="Cari surah">
        </div>
        <div class="quran-surah-list" id="quranSurahList">${klSkeletonRows(8)}</div>
      </div>
      <div id="quranDetailView" hidden></div>`;
    document.getElementById("quranSearch")?.addEventListener("input",onSearch);
    loadIndex();
  }
  window.initQuranPage=mountQuran;
  mountQuran();
})();
