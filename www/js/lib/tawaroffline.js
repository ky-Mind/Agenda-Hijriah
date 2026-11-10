/* Pertama kali masuk: tawarkan unduh semua data untuk mode offline (Al-Qur'an 114 surah + jadwal shalat 3 bulan)
   langsung dari jendela, tanpa harus ke Profil › Data. Ditawarkan sekali; bisa diulang kapan saja di Profil › Data. */
import {toast} from "../store.js";
import {quranStatus,downloadQuran,prepareTimes} from "./offline.js";
import {giliran,goyang} from "./rilis.js";
export async function tawarOffline(){
  try{
    if(localStorage.getItem("kl_offline_tawar")||!navigator.onLine)return;
    const q=await quranStatus();if(!q.ok)return;if(q.n>=114){localStorage.setItem("kl_offline_tawar","1");return}
    await new Promise(r=>setTimeout(r,3500));for(let i=0;i<3;i++){await giliran();await new Promise(r=>setTimeout(r,1500))}if(document.querySelector(".modal"))return;
    const m=document.createElement("div");m.className="modal off-m";m.dataset.wajib="1";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Mode offline");
    m.innerHTML=`<div class="box"><h2>Siapkan mode offline</h2><p style="margin:8px 0 6px">Unduh sekali agar Kisah Lillah tetap bisa dipakai tanpa internet:</p>
      <ul class="rilis-p"><li>Al-Qur'an 114 surah lengkap dengan terjemahan</li><li>Jadwal shalat 3 bulan ke depan</li></ul>
      <div class="bar" data-bw hidden style="margin:10px 0 4px"><i data-b style="width:0"></i></div><small class="muted" data-st>Sekitar 5 MB. Sebaiknya memakai Wi-Fi.</small>
      <div class="dlg-actions"><button class="btn" data-a="nanti">Nanti saja</button><button class="btn primary" data-a="unduh">Unduh semua</button></div></div>`;
    document.body.appendChild(m);
    const $=s=>m.querySelector(s),tutup=()=>{localStorage.setItem("kl_offline_tawar","1");m.remove()};
    let jalan=false;
    m.onclick=async e=>{const b=e.target.closest("[data-a]");
      if(e.target===m)return goyang(m);
      if(b?.dataset.a==="nanti"&&!jalan){tutup();toast("Bisa diunduh kapan saja di Profil › Data");return}
      if(b?.dataset.a!=="unduh"||jalan)return;
      jalan=true;b.disabled=true;$('[data-a="nanti"]').textContent="Lanjutkan di latar";$('[data-a="nanti"]').onclick=ev=>{ev.stopPropagation();m.remove()};
      $("[data-bw]").hidden=false;$("[data-st]").textContent="Menyiapkan jadwal shalat…";
      const t=await prepareTimes();
      const r=await downloadQuran((d,n)=>{$("[data-b]").style.width=Math.round(d/n*100)+"%";$("[data-st]").textContent=`Mengunduh Al-Qur'an ${d}/${n} surah…`});
      localStorage.setItem("kl_offline_tawar","1");
      const ok=!r.failed.length;
      if(m.isConnected){$("[data-st]").textContent=ok?`Selesai. Al-Qur'an${t?" dan jadwal shalat":""} siap dipakai tanpa internet.`:`${r.failed.length} surah gagal diunduh. Ulangi di Profil › Data.`;
        b.hidden=true;const n=$('[data-a="nanti"]');n.textContent="Selesai";n.className="btn primary";n.onclick=()=>m.remove()}
      else toast(ok?"Mode offline siap: Al-Qur'an dan jadwal shalat":"Sebagian surah gagal diunduh, ulangi di Profil › Data")};
  }catch(e){}
}
