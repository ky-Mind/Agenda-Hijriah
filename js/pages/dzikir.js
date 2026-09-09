/* Kisah Lillah — halaman Dzikir Pagi & Petang (file terpisah).
   Konten dzikir (bacaan Arab, arti, referensi) disimpan sebagai partial HTML
   di partials/dzikir-content.html dan baru diambil saat halaman ini pertama
   kali dibuka, supaya beban awal aplikasi tetap ringan. */
(function(){
  function switchDzikirPeriod(period){
    const pagi=period==="pagi";
    const pagiPanel=document.getElementById("dzikirPagiPanel");
    const petangPanel=document.getElementById("dzikirPetangPanel");
    const pagiBtn=document.getElementById("dzikirPagiBtn");
    const petangBtn=document.getElementById("dzikirPetangBtn");
    if(!pagiPanel||!petangPanel||!pagiBtn||!petangBtn)return;
    pagiPanel.hidden=!pagi; petangPanel.hidden=pagi;
    pagiPanel.classList.toggle("active",pagi); petangPanel.classList.toggle("active",!pagi);
    pagiBtn.classList.toggle("active",pagi); petangBtn.classList.toggle("active",!pagi);
    pagiBtn.setAttribute("aria-selected",pagi?"true":"false");
    petangBtn.setAttribute("aria-selected",pagi?"false":"true");
    if(!pagiPanel.hidden) pagiPanel.scrollIntoView({block:"start",behavior:"smooth"});
    else petangPanel.scrollIntoView({block:"start",behavior:"smooth"});
  }
  window.switchDzikirPeriod=switchDzikirPeriod;

  async function mountDzikir(){
    const mount=document.querySelector("#koleksiDzikir .page-mount");
    if(!mount)return;
    mount.innerHTML=klSkeletonRows(3)+'<div class="kl-skeleton" style="height:160px;margin-top:8px"></div>';
    try{
      const res=await fetch("./partials/dzikir-content.html?v=2",{cache:"no-store"});
      if(!res.ok)throw new Error("HTTP "+res.status);
      mount.innerHTML=await res.text();
    }catch(e){
      mount.innerHTML=klStateHtml("Gagal memuat dzikir","Periksa koneksi internet, lalu buka kembali halaman ini.","dzikirRetryBtn");
      document.getElementById("dzikirRetryBtn")?.addEventListener("click",mountDzikir);
    }
  }
  mountDzikir();
})();
