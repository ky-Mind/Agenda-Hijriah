/* Kisah Lillah — halaman Kata-kata Mutiara (file terpisah).
   Data ada di js/data/quotes.json (juga dipakai kartu "Quotes hari ini" di
   Beranda lewat setDailyQuotes() pada js/core.js). Halaman ini menampilkan
   semua kutipan dengan pencarian ringan, tanpa framework tambahan. */
(function(){
  let ALL_QUOTES=[];

  function esc(s){
    return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function render(list){
    const grid=document.getElementById("mutiaraGrid");
    if(!grid)return;
    if(!list.length){
      grid.innerHTML=klStateHtml("Tidak ditemukan","Coba kata kunci lain.");
      return;
    }
    grid.innerHTML=list.map(q=>`
      <div class="card mutiara-card">
        <p class="mutiara-arab" dir="rtl" lang="ar">${esc(q.text)}</p>
        <p class="mutiara-arti">${esc(q.detail)}</p>
        <small class="muted">${esc(q.source)}</small>
      </div>`).join("");
  }

  function onSearch(e){
    const q=e.target.value.trim().toLowerCase();
    if(!q){render(ALL_QUOTES);return;}
    render(ALL_QUOTES.filter(x=>
      (x.detail||"").toLowerCase().includes(q) ||
      (x.source||"").toLowerCase().includes(q) ||
      (x.text||"").includes(e.target.value.trim())
    ));
  }

  async function mountMutiara(){
    const mount=document.querySelector("#koleksiMutiara .page-mount");
    if(!mount)return;
    mount.innerHTML=`
      <div class="collection-search-bar">
        <input type="search" id="mutiaraSearch" placeholder="Cari kata-kata mutiara…" aria-label="Cari kata-kata mutiara">
      </div>
      <div class="mutiara-grid" id="mutiaraGrid">${klSkeletonRows(6)}</div>`;
    document.getElementById("mutiaraSearch")?.addEventListener("input",onSearch);
    try{
      const res=await fetch("./js/data/quotes.json",{cache:"force-cache"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      ALL_QUOTES=await res.json();
      render(ALL_QUOTES);
    }catch(e){
      document.getElementById("mutiaraGrid").innerHTML=klStateHtml("Gagal memuat","Periksa koneksi internet, lalu buka kembali halaman ini.","mutiaraRetryBtn");document.getElementById("mutiaraRetryBtn")?.addEventListener("click",mountMutiara);
    }
  }
  mountMutiara();
})();

