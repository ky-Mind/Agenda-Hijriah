/* Kisah Lillah — halaman Hadits Nabi Muhammad ﷺ (file terpisah).
   Mengambil daftar kitab & isi hadits dari api.hadith.gading.dev (API publik
   gratis, terjemahan Indonesia, tanpa API key). Dibuat tangguh terhadap API
   yang lambat/mati: setiap kegagalan jaringan menampilkan pesan yang jelas
   alih-alih membuat halaman rusak.
   v8: kartu hadits memakai lencana nomor yang sama gayanya dengan lencana
   ayat di halaman Al-Qur'an (konsistensi lintas-halaman), dan tersedia
   filter untuk mencari nomor/kata kunci di antara hadits yang sudah dimuat. */
(function(){
  const API="https://api.hadith.gading.dev";
  const PAGE_SIZE=20;
  let books=[];
  let activeBook=null;
  let rangeStart=1;
  let loadedHadits=[];

  function esc(s){
    return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function renderBookList(){
    const wrap=document.getElementById("haditsBooks");
    if(!wrap)return;
    if(!books.length){
      wrap.innerHTML=klStateHtml("Gagal memuat daftar kitab","Periksa koneksi internet, lalu buka kembali halaman ini.","haditsBooksRetry");wrap.querySelector("#haditsBooksRetry")?.addEventListener("click",loadBooks);
      return;
    }
    wrap.innerHTML=books.map(b=>`
      <button type="button" class="collection-card hadits-book-btn" data-name="${esc(b.name)}">
        <b>${esc(b.name)}</b>
        <span class="muted">${b.available} hadits</span>
      </button>`).join("");
    wrap.querySelectorAll("[data-name]").forEach(btn=>{
      btn.addEventListener("click",()=>openBook(btn.dataset.name));
    });
  }

  function haditsCardHtml(h){
    return `
      <div class="card hadits-card">
        <div class="hadits-card-head">
          <span class="kl-index-badge">${esc(h.number)}</span>
          <b>Hadits No. ${esc(h.number)}</b>
        </div>
        <p class="hadits-arab" dir="rtl" lang="ar">${esc(h.arab)}</p>
        <p class="hadits-arti">${esc(h.id)}</p>
      </div>`;
  }

  function renderHaditsList(list){
    const wrap=document.getElementById("haditsList");
    if(!wrap)return;
    wrap.innerHTML=list.length?list.map(haditsCardHtml).join(""):klStateHtml("Tidak ditemukan","Coba kata kunci atau nomor lain, atau muat lebih banyak dulu.");
  }

  function filterLoadedHadits(){
    const q=(document.getElementById("haditsFilter")?.value||"").trim().toLowerCase();
    if(!q){renderHaditsList(loadedHadits);return;}
    renderHaditsList(loadedHadits.filter(h=>
      String(h.number)===q || (h.id||"").toLowerCase().includes(q)
    ));
  }

  async function loadRange(name,start,end){
    const res=await fetch(`${API}/books/${encodeURIComponent(name)}?range=${start}-${end}`,{cache:"force-cache"});
    if(!res.ok)throw new Error("HTTP "+res.status);
    const json=await res.json();
    return json?.data?.hadiths||[];
  }

  async function openBook(name){
    activeBook=name;
    rangeStart=1;
    loadedHadits=[];
    document.getElementById("haditsBookListView").hidden=true;
    const detail=document.getElementById("haditsDetailView");
    detail.hidden=false;
    document.getElementById("haditsDetailTitle").textContent=name;
    document.getElementById("haditsFilter").value="";
    document.getElementById("haditsList").innerHTML=klSkeletonRows(5);
    document.getElementById("haditsLoadMore").hidden=true;
    try{
      const end=Math.min(rangeStart+PAGE_SIZE-1,rangeStart+299);
      const list=await loadRange(name,rangeStart,end);
      loadedHadits=list;
      renderHaditsList(loadedHadits);
      rangeStart=end+1;
      document.getElementById("haditsLoadMore").hidden=false;
    }catch(e){
      document.getElementById("haditsList").innerHTML=klStateHtml("Gagal memuat hadits","Periksa koneksi internet, lalu coba lagi.");
    }
    detail.scrollIntoView({block:"start"});
  }

  function backToBooks(){
    document.getElementById("haditsDetailView").hidden=true;
    document.getElementById("haditsBookListView").hidden=false;
  }

  async function loadMore(){
    if(!activeBook)return;
    const btn=document.getElementById("haditsLoadMore");
    btn.disabled=true;btn.textContent="Memuat…";
    try{
      const end=rangeStart+PAGE_SIZE-1;
      const list=await loadRange(activeBook,rangeStart,end);
      loadedHadits=loadedHadits.concat(list);
      rangeStart=end+1;
      filterLoadedHadits();
      if(list.length<1)btn.hidden=true;
    }catch(e){
      toastSafe("Gagal memuat hadits berikutnya, coba lagi.");
    }
    btn.disabled=false;btn.textContent="Muat lebih banyak";
  }
  function toastSafe(msg){
    if(typeof window.toast==="function")window.toast(msg);
  }

  async function loadBooks(){
    const wrap=document.getElementById("haditsBooks");
    if(wrap)wrap.innerHTML=klSkeletonRows(6);
    try{
      const res=await fetch(`${API}/books`,{cache:"force-cache"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      const json=await res.json();
      books=json?.data||[];
    }catch(e){books=[];}
    renderBookList();
  }

  async function mountHadits(){
    const mount=document.querySelector("#koleksiHadits .page-mount");
    if(!mount)return;
    mount.innerHTML=`
      <div id="haditsBookListView">
        <p class="muted" style="margin:0 0 10px">Pilih kitab hadits untuk mulai membaca.</p>
        <div class="collection-grid" id="haditsBooks">${klSkeletonRows(6)}</div>
      </div>
      <div id="haditsDetailView" hidden>
        <button class="btn outline small" type="button" id="haditsBackBtn">‹ Daftar kitab</button>
        <h3 id="haditsDetailTitle" style="margin:10px 0"></h3>
        <div class="collection-search-bar">
          <input type="search" id="haditsFilter" placeholder="Cari nomor atau kata kunci pada hadits yang sudah dimuat…" aria-label="Cari hadits">
        </div>
        <div class="hadits-list" id="haditsList"></div>
        <button class="btn outline" type="button" id="haditsLoadMore" hidden>Muat lebih banyak</button>
      </div>`;
    document.getElementById("haditsBackBtn").addEventListener("click",backToBooks);
    document.getElementById("haditsLoadMore").addEventListener("click",loadMore);
    document.getElementById("haditsFilter").addEventListener("input",filterLoadedHadits);
    loadBooks();
  }
  window.initHaditsPage=mountHadits;
  mountHadits();
})();

