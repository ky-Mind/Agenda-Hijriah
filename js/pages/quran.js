import {get,set,toast} from "../store.js";
import {esc,skeleton,fail} from "../lib/ui.js";
/* Jumlah ayat baku tiap surah (total 6.236). Data dari sumber mana pun yang tidak cocok ditolak, lalu dicoba sumber cadangan. */
const COUNT=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const CDN="https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/id/",EQ="https://equran.id/api/v2/surat";
const pad=n=>String(n).padStart(3,"0"),AUDIO=(s,a)=>`https://everyayah.com/data/Alafasy_128kbps/${pad(s)}${pad(a)}.mp3`;
const BISMILLAH="بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",memo={};
async function getJ(u,ms=12000){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms);try{const r=await fetch(u,{signal:ac.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(t)}}
async function firstOk(fns){const errs=[];for(const f of fns){try{return await f()}catch(e){errs.push(e.message)}}throw new Error(errs.join(" | "))}
const listSurah=()=>memo.list??=firstOk([
  async()=>{const j=await getJ(CDN+"index.json");if(j.length!==114)throw new Error("indeks tidak lengkap");return{src:"quran-json",list:j.map(s=>({id:+s.id,name:s.name,transliteration:s.transliteration,translation:s.translation,type:s.type,total_verses:+s.total_verses}))}},
  async()=>{const j=(await getJ(EQ)).data;if(!j||j.length!==114)throw new Error("indeks tidak lengkap");return{src:"equran.id",list:j.map(s=>({id:s.nomor,name:s.nama,transliteration:s.namaLatin,translation:s.arti,type:/mekah/i.test(s.tempatTurun)?"meccan":"medinan",total_verses:s.jumlahAyat}))}}
]).catch(e=>{delete memo.list;throw e});
const check=(n,s)=>{if(!s.verses||s.verses.length!==COUNT[n-1])throw new Error(`jumlah ayat ${s.verses?.length} ≠ ${COUNT[n-1]}`);if(s.verses.some((v,i)=>!v.text||!String(v.text).trim()||+v.id!==i+1))throw new Error("ada ayat kosong/urutan salah");return s};
const getSurah=n=>memo["s"+n]??=firstOk([
  async()=>{const j=await getJ(`${CDN}${n}.json`);return check(n,{src:"quran-json",id:n,name:j.name,transliteration:j.transliteration,translation:j.translation,type:j.type,verses:j.verses.map(v=>({id:+v.id,text:v.text,transliteration:v.transliteration,translation:v.translation}))})},
  async()=>{const j=(await getJ(`${EQ}/${n}`)).data;return check(n,{src:"equran.id",id:n,name:j.nama,transliteration:j.namaLatin,translation:j.arti,type:/mekah/i.test(j.tempatTurun)?"meccan":"medinan",verses:j.ayat.map(v=>({id:+v.nomorAyat,text:v.teksArab,transliteration:v.teksLatin,translation:v.teksIndonesia}))})}
]).catch(e=>{delete memo["s"+n];throw e});
const tipe=t=>t==="meccan"?"Makkiyah":"Madaniyah";
export default async function(root,args){
  const box=root.querySelector('[data-r="root"]');let audio=null,alive=true;
  const stop=()=>{if(audio){audio.onended=audio.onerror=null;audio.pause();audio=null}root.querySelectorAll(".playing").forEach(x=>x.classList.remove("playing"))};
  box.innerHTML=skeleton(6);
  if(!args[0]){
    let r;try{r=await listSurah()}catch(e){if(alive)box.innerHTML=fail("Daftar surah gagal dimuat.",e.message);return}
    if(!alive)return;const last=get("quran_last");
    box.innerHTML=`<div class="head"><h1>Al-Qur'an</h1><p>114 surah dengan terjemahan Indonesia, transliterasi, dan audio. Sumber: ${esc(r.src)}.</p></div>${last?`<a class="card" href="#/quran/${last.surah}/${last.ayat}"><h2>Lanjutkan membaca</h2><p>${esc(last.nama)} · ayat ${last.ayat}</p></a>`:""}<div class="field"><input type="search" placeholder="Cari surah (nama atau nomor)" aria-label="Cari surah" data-q></div><div class="grid" data-l></div>`;
    const l=box.querySelector("[data-l]"),draw=q=>{q=q.toLowerCase().trim();l.innerHTML=r.list.filter(s=>!q||`${s.id} ${s.transliteration} ${s.translation} ${s.name}`.toLowerCase().includes(q)).map(s=>`<a class="card" href="#/quran/${s.id}"><div class="row sp"><h2>${s.id}. ${esc(s.transliteration)}</h2><span class="arab" style="font-size:22px;line-height:1.4">${esc(s.name)}</span></div><p>${esc(s.translation)} · ${s.total_verses} ayat · ${tipe(s.type)}</p></a>`).join("")||'<div class="empty">Surah tidak ditemukan.</div>'};
    box.querySelector("[data-q]").oninput=e=>draw(e.target.value);draw("");return()=>{alive=false};
  }
  const n=+args[0];if(!(n>=1&&n<=114)){box.innerHTML='<div class="empty">Nomor surah tidak valid.</div>';return}
  let s;try{s=await getSurah(n)}catch(e){if(alive)box.innerHTML=fail("Surah gagal dimuat. Teks tidak ditampilkan jika datanya tidak lengkap.",e.message);return}
  if(!alive)return;
  document.dispatchEvent(new CustomEvent("kl-title",{detail:`${s.id}. ${s.transliteration}`}));
  const pref={latin:true,arti:true,size:28,...get("quran_pref",{})},jump=+args[1]||0;
  box.innerHTML=`<div class="head"><h1>${s.id}. ${esc(s.transliteration)} <span class="arab" style="font-size:26px;display:inline">${esc(s.name)}</span></h1><p>${esc(s.translation)} · ${s.verses.length} ayat · ${tipe(s.type)}</p></div>
  <div class="card sticky-tools"><div class="row"><button class="btn sm" data-t="latin" aria-pressed="${pref.latin}">Transliterasi</button><button class="btn sm" data-t="arti" aria-pressed="${pref.arti}">Terjemahan</button><button class="btn sm" data-z="-2" aria-label="Perkecil huruf">A−</button><button class="btn sm" data-z="2" aria-label="Perbesar huruf">A+</button><button class="btn primary sm" data-all>▶ Putar semua</button><button class="btn sm" data-stop>Berhenti</button><input type="number" min="1" max="${s.verses.length}" placeholder="Ayat ke…" aria-label="Lompat ke ayat" data-j style="width:96px"></div></div>
  <div class="card" data-v></div><div class="row sp">${n>1?`<a class="btn" href="#/quran/${n-1}">‹ Sebelumnya</a>`:"<span></span>"}<a class="btn" href="#/quran">Daftar surah</a>${n<114?`<a class="btn" href="#/quran/${n+1}">Berikutnya ›</a>`:"<span></span>"}</div><p class="src" style="text-align:center;margin-top:10px">Sumber teks: ${esc(s.src)}</p>`;
  const v=box.querySelector("[data-v]"),last=()=>get("quran_last");
  const draw=()=>{root.style.setProperty("--af",pref.size+"px");v.innerHTML=(n!==1&&n!==9?`<div class="arab" style="text-align:center">${BISMILLAH}</div>`:"")+s.verses.map(a=>`<div class="item ayah ${last()?.surah===n&&last()?.ayat===a.id?"mark":""}" id="a${a.id}"><div class="num">${a.id}</div><div><div class="arab">${esc(a.text)}</div>${pref.latin&&a.transliteration?`<p class="latin">${esc(a.transliteration)}</p>`:""}${pref.arti&&a.translation?`<p>${esc(a.translation)}</p>`:""}<div class="row mt"><button class="btn sm" data-p="${a.id}">▶ Putar</button><button class="btn sm" data-m="${a.id}">Tandai terakhir dibaca</button></div></div></div>`).join("")};
  draw();if(jump>0)setTimeout(()=>v.querySelector("#a"+jump)?.scrollIntoView({block:"center"}),50);
  const play=(i,chain)=>{stop();const a=s.verses[i-1];if(!a)return;const el=v.querySelector("#a"+i);el?.classList.add("playing");el?.scrollIntoView({block:"center",behavior:"smooth"});
    audio=new Audio(AUDIO(n,i));audio.onended=()=>{el?.classList.remove("playing");if(chain&&i<s.verses.length)play(i+1,true)};audio.onerror=()=>{el?.classList.remove("playing");toast("Audio tidak dapat dimuat (periksa koneksi)")};audio.play().catch(()=>{})};
  box.querySelector("[data-j]").onchange=e=>{const i=+e.target.value;if(i>=1&&i<=s.verses.length)v.querySelector("#a"+i)?.scrollIntoView({block:"center",behavior:"smooth"});else toast(`Ayat 1–${s.verses.length}`)};
  box.onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.t){pref[b.dataset.t]=!pref[b.dataset.t];b.setAttribute("aria-pressed",pref[b.dataset.t]);set("quran_pref",pref);draw()}
    else if(b.dataset.z){pref.size=Math.min(48,Math.max(20,pref.size+ +b.dataset.z));set("quran_pref",pref);draw()}
    else if(b.dataset.p)play(+b.dataset.p,false);else if(b.dataset.all!==undefined)play(1,true);else if(b.dataset.stop!==undefined)stop();
    else if(b.dataset.m){set("quran_last",{surah:n,nama:s.transliteration,ayat:+b.dataset.m});draw();toast("Ditandai: "+s.transliteration+" ayat "+b.dataset.m)}};
  return()=>{alive=false;stop();root.style.removeProperty("--af")};
}
