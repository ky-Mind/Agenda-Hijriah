import {toast} from "../store.js";
import {esc} from "./ui.js";
import {geoState,notifState,useMyLocation,geoMsg,GEO_TXT,NOTIF_TXT} from "./perm.js";
import {enable,save} from "./adzan.js";
/* Dialog izin pertama kali: lokasi untuk jadwal shalat & kiblat, notifikasi untuk pengingat adzan. */
export async function onboard(){
  const m=document.createElement("div");m.className="modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Izin aplikasi");
  m.innerHTML=`<div class="box"><h2>Selamat datang di Kisah Lillah</h2><p class="muted" style="margin:6px 0 12px">Izinkan dua hal ini agar jadwal shalat dan pengingat adzan akurat. Boleh dilewati, bisa diatur kapan saja di Profil.</p>
  <div class="perm"><div><b>Lokasi</b><small class="muted" data-s="geo"></small></div><button class="btn sm primary" data-a="geo">Izinkan lokasi</button></div>
  <div class="perm"><div><b>Notifikasi adzan</b><small class="muted" data-s="ntf"></small></div><button class="btn sm primary" data-a="ntf">Aktifkan</button></div>
  <div class="dlg-actions"><button class="btn" data-a="done">Nanti saja</button></div></div>`;
  document.body.appendChild(m);
  const $=n=>m.querySelector(`[data-s="${n}"]`),B=n=>m.querySelector(`[data-a="${n}"]`);
  const paint=async()=>{const g=await geoState(),n=notifState();$("geo").textContent=GEO_TXT[g]||"";$("ntf").textContent=NOTIF_TXT[n]||"";B("geo").hidden=g==="granted"||g==="unsupported";B("ntf").hidden=n==="granted"||n==="unsupported"};
  const close=()=>{localStorage.setItem("kl_onboard","1");m.remove()};
  m.onclick=async e=>{const b=e.target.closest("[data-a]");if(e.target===m)return close();if(!b)return;
    if(b.dataset.a==="done")return close();
    b.disabled=true;
    if(b.dataset.a==="geo"){try{const l=await useMyLocation();toast("Lokasi diatur: "+l.name)}catch(x){toast(geoMsg(x))}}
    else{const r=await enable();if(r==="granted"){save({notif:true});document.dispatchEvent(new CustomEvent("kl-adzan"));toast("Pengingat adzan aktif")}else toast(r==="insecure"?"Notifikasi butuh HTTPS atau localhost":"Izin notifikasi tidak diberikan")}
    b.disabled=false;paint()};
  paint();
}
