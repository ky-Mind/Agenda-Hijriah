import {esc,confirmLeave,ask,dialog} from "../lib/ui.js";
import {hijriText,masehiText,key,fromKey,HARI,addDays} from "../lib/hijri.js";
import {agenda,saveAgenda,resetAgenda,day,saveDay,calc,savedAt,progress} from "../lib/ibadah.js";
import {rekap,waNumber,waUrl,openUrl} from "../lib/wa.js";
import {get,set,del,toast} from "../store.js";
const OK=/^\d{4}-\d\d-\d\d$/;
export default function(root,args){
  const $=n=>root.querySelector(`[data-r="${n}"]`),today=()=>key(new Date());
  let k=OK.test(args[0]||"")?args[0]:today(),rec,note,base,edit=false;
  const clean=r=>Object.keys(r).filter(i=>r[i]!=null).sort().map(i=>[i,r[i]]);
  const snap=()=>JSON.stringify([clean(rec),note.trim()]);
  const dirty=()=>snap()!==base;
  function load(nk){k=nk;rec={...day(k)};note=get("note_"+k,"");base=snap();draw()}
  function save(){saveDay(k,rec);note.trim()?set("note_"+k,note.trim()):del("note_"+k);base=snap();toast("Absensi tersimpan");draw();return true}
  window.KLGuard={dirty,save,discard:()=>{rec={...day(k)};note=get("note_"+k,"");base=snap()}};
  async function go(nk){if(nk===k)return;if(dirty()){const a=await confirmLeave();if(a==="save")save();else if(a!=="discard")return}load(nk)}
  function draw(){
    const d=fromKey(k),p=calc(rec),list=agenda();
    $("hijri").textContent=hijriText(d);$("masehi").textContent=masehiText(d)+(k===today()?" · hari ini":"");$("pick").value=k;
    $("ringkas").textContent=`${p.done} terlaksana · ${p.miss} terlewat · ${p.total-p.done-p.miss} belum diisi${p.rest?` · ${p.rest} 🌑`:""}`;$("pct").textContent=p.pct+"%";$("bar").style.width=p.pct+"%";
    const B=(i,v,c,t,l)=>`<button class="${c} ${rec[i.id]===v?"on":""}" data-v="${v}" aria-label="${l}: ${esc(i.nama)}" aria-pressed="${rec[i.id]===v}">${t}</button>`;
    $("list").innerHTML=list.length?list.map(i=>`<div class="ibadah" data-id="${esc(i.id)}"><span><span class="ico" aria-hidden="true">${esc(i.ic||"•")}</span>${esc(i.nama)}</span>${edit?'<button class="btn sm danger" data-del>Hapus</button>':`<div class="seg">${B(i,1,"ok","✓","Terlaksana")}${B(i,0,"no","✕","Terlewat")}${B(i,2,"pr","🌑","Datang bulan")}${/tadarus/i.test(i.id+i.nama)?B(i,3,"kh","📖💯","Khatam"):""}</div>`}</div>`).join(""):'<div class="empty">Belum ada ibadah. Pilih "Ubah daftar" untuk menambah.</div>';
    $("edit").setAttribute("aria-pressed",edit);$("edit").textContent=edit?"Selesai":"Ubah daftar";$("addform").hidden=!edit;$("all").hidden=edit;
    if($("note")!==document.activeElement)$("note").value=note;
    const w=[];for(let i=6;i>=0;i--){const x=addDays(new Date(),-i),q=progress(key(x));w.push(`<div title="${q.pct}%"><div class="col"><i class="${q.pct?"":"z"}" style="height:${Math.max(q.pct,4)}%"></i></div><small>${HARI[x.getDay()].slice(0,3)}</small></div>`)}
    $("week").innerHTML=w.join("");
    const t=savedAt(k);$("state").innerHTML=dirty()?'<span class="dirty">● Ada perubahan belum disimpan</span>':t?`Tersimpan ${new Date(t).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}`:"Belum ada data tersimpan";
  }
  $("prev").onclick=()=>go(key(addDays(fromKey(k),-1)));$("nextd").onclick=()=>go(key(addDays(fromKey(k),1)));$("today").onclick=()=>go(today());
  $("pick").onchange=e=>OK.test(e.target.value)&&go(e.target.value);
  $("edit").onclick=()=>{edit=!edit;draw()};
  $("all").onclick=()=>{agenda().forEach(i=>{rec[i.id]=1});draw()};
  $("note").oninput=e=>{note=e.target.value;$("state").innerHTML=dirty()?'<span class="dirty">● Ada perubahan belum disimpan</span>':"Tersimpan"};
  $("list").onclick=async e=>{const row=e.target.closest("[data-id]");if(!row)return;const id=row.dataset.id;
    if(e.target.closest("[data-del]")){if(await ask("Hapus ibadah?","Ibadah ini dihapus dari daftar. Catatan lama tidak ikut terhapus.","Hapus")){saveAgenda(agenda().filter(i=>i.id!==id));delete rec[id];draw()}return}
    const b=e.target.closest("[data-v]");if(!b)return;const v=+b.dataset.v;rec[id]=rec[id]===v?null:v;draw()};
  $("addform").onsubmit=e=>{e.preventDefault();const n=$("newname").value.trim();if(!n)return;saveAgenda([...agenda(),{id:"c"+Date.now().toString(36),nama:n,ic:$("newic").value.trim()||"✨"}]);$("newname").value="";$("newic").value="";draw()};
  $("reset").onclick=async()=>{if(await ask("Kembalikan daftar bawaan?","Daftar ibadah kembali seperti semula. Data absensi yang sudah tercatat tetap aman.","Kembalikan")){resetAgenda();draw()}};
  $("save").onclick=save;
  $("wa").onclick=async()=>{
    if(!clean(rec).length)return toast("Isi absensi dulu sebelum mengirim");
    if(dirty())save();
    const n=waNumber();
    if(!n){const a=await dialog({title:"Nomor WhatsApp belum diisi",text:"Isi nomor di Profil agar rekap langsung terkirim ke nomor itu, atau pilih kontak langsung di WhatsApp.",actions:[{label:"Isi di Profil",value:"profil",cls:"primary"},{label:"Pilih kontak di WhatsApp",value:"pick"},{label:"Batal",value:null,cls:"ghost"}]});
      if(a==="profil"){location.hash="#/profil";return}if(a!=="pick")return}
    openUrl(waUrl(n,rekap(k,rec)))};
  load(k);
  return()=>{window.KLGuard=null};
}
