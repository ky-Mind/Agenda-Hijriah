/* Kisah Lillah — halaman Kumpulan Do'a (file terpisah).
   v7: sesuai arahan, halaman ini TIDAK langsung menampilkan seluruh do'a.
   Pengguna memilih kategori dulu (mis. Harian, Perjalanan, Ilmu), baru
   daftar do'a pada kategori itu ditampilkan — Kategori > List > Detail.
   Data ada di js/data/doa.json (kurasi doa harian umum), disimpan sebagai
   data statis lokal — bukan memanggil API pihak ketiga — supaya halaman
   ini selalu bisa dibuka walau tanpa koneksi setelah dimuat sekali. */
(function(){
  let ALL_DOA=[];
  let activeCategory=null;

  function esc(s){
    return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function categories(){
    const map={};
    ALL_DOA.forEach(d=>{map[d.kategori]=(map[d.kategori]||0)+1;});
    return Object.keys(map).map(k=>({name:k,count:map[k]}));
  }

  function renderCategoryGrid(){
    const wrap=document.getElementById("doaCategoryView");
    if(!wrap)return;
    wrap.innerHTML=`
      <p class="muted" style="margin:0 0 12px">Pilih kategori do'a untuk mulai membaca.</p>
      <div class="doa-category-grid" id="doaCategoryGrid"></div>`;
    const grid=wrap.querySelector("#doaCategoryGrid");
    grid.innerHTML=categories().map(c=>`
      <button type="button" class="card doa-cat-card" data-cat="${esc(c.name)}">
        <b>${esc(c.name)}</b>
        <small>${c.count} do'a</small>
      </button>`).join("");
    grid.querySelectorAll("[data-cat]").forEach(btn=>{
      btn.addEventListener("click",()=>openCategory(btn.dataset.cat));
    });
  }

  function renderDoaList(list){
    const wrap=document.getElementById("doaList");
    if(!wrap)return;
    if(!list.length){
      wrap.innerHTML=klStateHtml("Tidak ditemukan","Coba kata kunci lain.");
      return;
    }
    wrap.innerHTML=list.map(d=>`
      <div class="card doa-card">
        <div class="doa-card-head"><b>${esc(d.judul)}</b></div>
        <p class="doa-arab" dir="rtl" lang="ar">${esc(d.arab)}</p>
        <p class="doa-latin"><i>${esc(d.latin)}</i></p>
        <p class="doa-arti">${esc(d.arti)}</p>
      </div>`).join("");
  }

  function applyCategoryFilter(){
    const q=(document.getElementById("doaSearch")?.value||"").trim().toLowerCase();
    let list=ALL_DOA.filter(x=>x.kategori===activeCategory);
    if(q)list=list.filter(x=>x.judul.toLowerCase().includes(q)||x.arti.toLowerCase().includes(q));
    renderDoaList(list);
  }

  function openCategory(name){
    activeCategory=name;
    document.getElementById("doaCategoryView").hidden=true;
    const detail=document.getElementById("doaListView");
    detail.hidden=false;
    document.getElementById("doaListTitle").textContent=name;
    applyCategoryFilter();
    detail.scrollIntoView({block:"start"});
  }

  function backToCategories(){
    activeCategory=null;
    document.getElementById("doaListView").hidden=true;
    document.getElementById("doaCategoryView").hidden=false;
  }

  async function mountDoa(){
    const mount=document.querySelector("#koleksiDoa .page-mount");
    if(!mount)return;
    mount.innerHTML=`
      <div id="doaCategoryView"><div class="doa-category-grid">${klSkeletonRows(6)}</div></div>
      <div id="doaListView" hidden>
        <div class="doa-list-head">
          <button class="btn outline small" type="button" id="doaBackBtn">‹ Kategori</button>
          <h3 id="doaListTitle" style="margin:0"></h3>
        </div>
        <div class="collection-search-bar">
          <input type="search" id="doaSearch" placeholder="Cari do'a dalam kategori ini…" aria-label="Cari do'a">
        </div>
        <div class="doa-list" id="doaList"></div>
      </div>`;
    document.getElementById("doaBackBtn").addEventListener("click",backToCategories);
    document.getElementById("doaSearch")?.addEventListener("input",applyCategoryFilter);
    try{
      const res=await fetch("./js/data/doa.json",{cache:"force-cache"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      ALL_DOA=await res.json();
      renderCategoryGrid();
    }catch(e){
      document.getElementById("doaCategoryView").innerHTML=klStateHtml("Gagal memuat","Periksa koneksi internet, lalu buka kembali halaman ini.","doaRetryBtn");document.getElementById("doaRetryBtn")?.addEventListener("click",mountDoa);
    }
  }
  window.initDoaPage=mountDoa;
  mountDoa();
})();

