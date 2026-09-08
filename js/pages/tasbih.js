/* Kisah Lillah — Tasbih Digital (fitur baru, file terpisah, mandiri).
   Tidak memanggil API luar sama sekali: dial melingkar (SVG progress ring),
   tombol tap besar, getar (haptic) tiap ketuk + pola getar berbeda saat
   mencapai kelipatan target, klik suara lembut (dibangkitkan lewat
   WebAudio, tanpa file audio tambahan), tombol reset dengan undo, dan
   pemilih bacaan (chip). Hitungan & pilihan tersimpan di localStorage
   sehingga tidak hilang saat berpindah halaman atau menutup aplikasi. */
(function(){
  const STORAGE_KEY="kl_tasbih_state_v1";
  const BACAAN=[
    {id:"subhanallah",label:"Subhanallah",arab:"سُبْحَانَ اللَّهِ",target:33},
    {id:"alhamdulillah",label:"Alhamdulillah",arab:"الْحَمْدُ لِلَّهِ",target:33},
    {id:"allahuakbar",label:"Allahu Akbar",arab:"اللَّهُ أَكْبَرُ",target:34},
    {id:"istighfar",label:"Istighfar",arab:"أَسْتَغْفِرُ اللَّهَ",target:100},
    {id:"lailahaillallah",label:"Lā ilāha illallāh",arab:"لَا إِلَٰهَ إِلَّا اللَّهُ",target:100}
  ];

  let state={bacaanId:"subhanallah",count:0,target:33,soundOn:true,hapticOn:true};
  let audioCtx=null;

  function loadState(){
    try{
      const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(v&&typeof v==="object")state={...state,...v};
    }catch(e){}
  }
  function saveState(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}
  }
  function activeBacaan(){return BACAAN.find(b=>b.id===state.bacaanId)||BACAAN[0]}

  function beep(strong){
    if(!state.soundOn)return;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      const osc=audioCtx.createOscillator();
      const gain=audioCtx.createGain();
      osc.type="sine";
      osc.frequency.value=strong?880:600;
      gain.gain.setValueAtTime(0.0001,audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(strong?0.14:0.08,audioCtx.currentTime+0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.12);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime+0.13);
    }catch(e){}
  }
  function buzz(pattern){
    if(!state.hapticOn)return;
    try{navigator.vibrate?.(pattern)}catch(e){}
  }

  function ringHtml(progress){
    const r=70,c=2*Math.PI*r;
    const offset=c*(1-Math.min(1,progress));
    return `
      <svg viewBox="0 0 160 160" width="220" height="220" class="tasbih-ring" aria-hidden="true">
        <circle cx="80" cy="80" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/>
        <circle cx="80" cy="80" r="${r}" fill="none" stroke="var(--primary)" stroke-width="10"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .25s ease"/>
      </svg>`;
  }

  function render(){
    const mount=document.getElementById("tasbihMount");
    if(!mount)return;
    const b=activeBacaan();
    const laps=Math.floor(state.count/state.target);
    mount.innerHTML=`
      <div class="tasbih-chip-row" id="tasbihBacaanChips">
        ${BACAAN.map(x=>`<button type="button" class="quran-toggle-chip${x.id===state.bacaanId?" active":""}" data-bacaan="${x.id}">${x.label}</button>`).join("")}
      </div>

      <div class="tasbih-dial-wrap">
        ${ringHtml(state.count/state.target)}
        <div class="tasbih-dial-center">
          <span class="tasbih-count" id="tasbihCount">${state.count}</span>
          <span class="tasbih-target muted">/ ${state.target}</span>
          ${laps>0?`<span class="tasbih-laps muted">${laps} putaran selesai</span>`:""}
        </div>
      </div>

      <div class="card tasbih-reading-card">
        <p class="tasbih-arab" dir="rtl" lang="ar">${b.arab}</p>
        <p class="muted" style="margin:0">${b.label}</p>
      </div>

      <button type="button" class="tasbih-tap-btn" id="tasbihTapBtn" aria-label="Ketuk untuk menghitung">Ketuk</button>

      <div class="tasbih-controls">
        <div class="tasbih-target-row">
          <span class="muted" style="font-size:12px">Target putaran</span>
          <div class="tasbih-target-options">
            ${[33,99,100].map(t=>`<button type="button" class="quran-toggle-chip${state.target===t?" active":""}" data-target="${t}">${t}</button>`).join("")}
          </div>
        </div>
        <div class="tasbih-toggle-row">
          <label class="tasbih-switch-label"><input type="checkbox" id="tasbihSoundToggle" ${state.soundOn?"checked":""}> Suara ketuk</label>
          <label class="tasbih-switch-label"><input type="checkbox" id="tasbihHapticToggle" ${state.hapticOn?"checked":""}> Getar</label>
        </div>
        <button type="button" class="btn outline small" id="tasbihResetBtn">Reset hitungan</button>
      </div>`;

    wireEvents();
  }

  function tap(){
    state.count++;
    const reachedTarget=state.count%state.target===0;
    buzz(reachedTarget?[30,40,30,40,60]:[15]);
    beep(reachedTarget);
    saveState();
    render();
    if(reachedTarget && typeof toast==="function"){
      toast(`${state.target}× ${activeBacaan().label} tercapai ✓`);
    }
  }

  function wireEvents(){
    const mount=document.getElementById("tasbihMount");
    mount.querySelector("#tasbihTapBtn")?.addEventListener("click",tap);
    mount.querySelectorAll("[data-bacaan]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        state.bacaanId=btn.dataset.bacaan;
        const preset=activeBacaan();
        state.target=preset.target;
        state.count=0;
        saveState();render();
      });
    });
    mount.querySelectorAll("[data-target]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        state.target=Number(btn.dataset.target);
        saveState();render();
      });
    });
    mount.querySelector("#tasbihSoundToggle")?.addEventListener("change",e=>{
      state.soundOn=e.target.checked;saveState();
    });
    mount.querySelector("#tasbihHapticToggle")?.addEventListener("change",e=>{
      state.hapticOn=e.target.checked;saveState();
    });
    mount.querySelector("#tasbihResetBtn")?.addEventListener("click",()=>{
      const prevCount=state.count;
      state.count=0;saveState();render();
      if(typeof toast==="function")toast("Hitungan direset");
      // Undo sederhana: klik tombol reset lagi dalam 3 detik memulihkan.
      const btn=document.getElementById("tasbihResetBtn");
      if(btn && prevCount>0){
        const original=btn.textContent;
        btn.textContent="Batalkan reset";
        const undo=()=>{state.count=prevCount;saveState();render();};
        btn.addEventListener("click",undo,{once:true});
        setTimeout(()=>{if(btn.isConnected)btn.textContent=original;},3000);
      }
    });
  }

  function mountTasbih(){
    if(!document.getElementById("tasbihMount"))return;
    loadState();
    render();
  }
  window.initTasbihPage=mountTasbih;
  mountTasbih();
})();

