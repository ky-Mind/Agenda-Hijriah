/* Peningkatan navigasi + tasbih melayang, tanpa mengubah fitur lama. */
const doc=document, html=doc.documentElement, side=doc.querySelector('.side');
const desktopBtn=doc.getElementById('sideToggle'), mobileBtn=doc.getElementById('mobileNavToggle');
const mobile=()=>matchMedia('(max-width:760px)').matches;
doc.querySelectorAll('[data-nav]').forEach(a=>{const label=a.textContent.trim();if(label){a.title=label;a.setAttribute('aria-label',label)}});
let collapsed=localStorage.getItem('kl_sidebar_collapsed')==='1';
function applySidebar(){html.classList.toggle('sidebar-collapsed',collapsed&&!mobile());if(desktopBtn){desktopBtn.setAttribute('aria-expanded',String(!collapsed));desktopBtn.setAttribute('aria-label',collapsed?'Perluas navigasi':'Ciutkan navigasi');desktopBtn.title=collapsed?'Perluas navigasi':'Ciutkan navigasi';desktopBtn.innerHTML=collapsed?'<svg class="ic" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>':'<svg class="ic" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'}}
desktopBtn?.addEventListener('click',()=>{collapsed=!collapsed;localStorage.setItem('kl_sidebar_collapsed',collapsed?'1':'0');applySidebar()});
function closeMobile(){html.classList.remove('mobile-nav-open');mobileBtn?.setAttribute('aria-expanded','false');mobileBtn?.setAttribute('aria-label','Buka menu Profil')}
// Di ponsel navigasi utama berada di bawah. Tombol hamburger hanya aktif di Profil
// dan membuka menu pengaturan yang memakai tab asli pada halaman Profil.
const profileMenu=doc.createElement('div');profileMenu.className='profile-menu-pop';profileMenu.id='profileMenuPop';profileMenu.hidden=true;
profileMenu.innerHTML='<div class="profile-menu-head">Menu Profil <button type="button" data-profile-close aria-label="Tutup menu">×</button></div><button type="button" data-profile-tab="profil">Profil & akun</button><button type="button" data-profile-tab="notif">Notifikasi</button><button type="button" data-profile-tab="tampilan">Tampilan</button><button type="button" data-profile-tab="data">Data & cadangan</button><button type="button" data-profile-tab="bantuan">Bantuan</button>';
doc.body.append(profileMenu);
function toggleProfileMenu(force){const open=typeof force==='boolean'?force:profileMenu.hidden;profileMenu.hidden=!open;mobileBtn?.setAttribute('aria-expanded',String(open));mobileBtn?.setAttribute('aria-label',open?'Tutup menu Profil':'Buka menu Profil');}
mobileBtn?.addEventListener('click',()=>{if(html.dataset.page!=='profil')return;toggleProfileMenu()});
profileMenu.addEventListener('click',e=>{if(e.target.closest('[data-profile-close]')){toggleProfileMenu(false);return}const b=e.target.closest('[data-profile-tab]');if(!b)return;const tab=doc.querySelector(`[data-tab="${b.dataset.profileTab}"]`);if(tab){tab.click();tab.scrollIntoView({behavior:'smooth',block:'nearest'})}toggleProfileMenu(false)});
doc.addEventListener('click',e=>{if(!profileMenu.hidden&&!profileMenu.contains(e.target)&&!mobileBtn?.contains(e.target))toggleProfileMenu(false)});
function syncPage(){const page=html.dataset.page||location.hash.replace(/^#\/?/,'').split('/')[0]||'beranda';html.dataset.page=page;closeMobile();toggleProfileMenu(false);applySidebar()}
addEventListener('hashchange',syncPage);
doc.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobile();toggleProfileMenu(false)}});addEventListener('resize',()=>{applySidebar();if(!mobile())closeMobile()});applySidebar();syncPage();
// Tasbih melayang: dapat diseret ke mana saja, posisi tersimpan, tap menambah hitungan.
const widget=doc.createElement('section');widget.className='floating-tasbih';widget.id='floatingTasbih';widget.setAttribute('aria-label','Tasbih melayang');
widget.innerHTML=`<button class="float-grip" type="button" aria-label="Geser tasbih" title="Tekan dan geser untuk memindahkan"><span>⠿</span></button><button class="float-main" type="button" aria-label="Tambah hitungan tasbih"><span class="float-beads" aria-hidden="true">◉ ◉ ◉</span><strong data-fcount>0</strong><small>Subhanallah</small></button><div class="float-actions"><button type="button" data-fminus aria-label="Kurangi satu hitungan" title="Kurangi">−</button><button type="button" data-freset aria-label="Reset tasbih" title="Reset">↺</button><button type="button" data-fhide aria-label="Sembunyikan tasbih" title="Sembunyikan">×</button></div>`;
doc.body.append(widget);
let fs={count:0,target:33,hidden:false,...safeRead('kl_floating_tasbih')};let pos=safeRead('kl_floating_pos')||{};
function safeRead(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}}
function persist(){try{localStorage.setItem('kl_floating_tasbih',JSON.stringify(fs))}catch{}}
function renderFloat(){widget.querySelector('[data-fcount]').textContent=fs.count;widget.querySelector('.float-main').setAttribute('aria-label',`Tambah hitungan tasbih, saat ini ${fs.count}`);widget.hidden=!!fs.hidden;if(pos.x!=null&&pos.y!=null){widget.style.left=`${Math.max(0,Math.min(innerWidth-widget.offsetWidth,pos.x))}px`;widget.style.top=`${Math.max(0,Math.min(innerHeight-widget.offsetHeight,pos.y))}px`;widget.style.right='auto';widget.style.bottom='auto'}}
widget.querySelector('.float-main').addEventListener('click',()=>{fs.count++;if(fs.count>=fs.target)fs.count=0;persist();renderFloat();widget.classList.remove('bump');void widget.offsetWidth;widget.classList.add('bump')});
widget.querySelector('[data-fminus]').addEventListener('click',()=>{fs.count=Math.max(0,fs.count-1);persist();renderFloat()});
widget.querySelector('[data-freset]').addEventListener('click',()=>{fs.count=0;persist();renderFloat()});
widget.querySelector('[data-fhide]').addEventListener('click',()=>{fs.hidden=true;persist();renderFloat();showLauncher()});
const launcher=doc.createElement('button');launcher.className='floating-tasbih-launcher';launcher.type='button';launcher.textContent='☾ Tasbih';launcher.setAttribute('aria-label','Tampilkan tasbih melayang');doc.body.append(launcher);function showLauncher(){launcher.hidden=!fs.hidden}launcher.addEventListener('click',()=>{fs.hidden=false;persist();renderFloat();showLauncher()});
let drag=null,moved=false;const grip=widget.querySelector('.float-grip');
function start(e){if(e.button!==undefined&&e.button!==0)return;const target=e.target; if(target.closest('.float-main,.float-actions'))return;const r=widget.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top,id:e.pointerId};moved=false;widget.setPointerCapture?.(e.pointerId);e.preventDefault()}
function move(e){if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;if(!moved)return;const x=Math.max(0,Math.min(innerWidth-widget.offsetWidth,drag.left+dx)),y=Math.max(0,Math.min(innerHeight-widget.offsetHeight,drag.top+dy));widget.style.left=x+'px';widget.style.top=y+'px';widget.style.right='auto';widget.style.bottom='auto';pos={x,y}}
function stop(){if(!drag)return;const wasMoved=moved;drag=null;if(wasMoved){try{localStorage.setItem('kl_floating_pos',JSON.stringify(pos))}catch{};widget.dataset.justDragged='1';setTimeout(()=>delete widget.dataset.justDragged,0)}}
widget.addEventListener('pointerdown',start);widget.addEventListener('pointermove',move);widget.addEventListener('pointerup',stop);widget.addEventListener('pointercancel',stop);widget.addEventListener('click',e=>{if(widget.dataset.justDragged==='1'){e.preventDefault();e.stopPropagation();delete widget.dataset.justDragged}},true);
addEventListener('resize',()=>{const r=widget.getBoundingClientRect();pos={x:Math.max(0,Math.min(innerWidth-r.width,r.left)),y:Math.max(0,Math.min(innerHeight-r.height,r.top))};if(!fs.hidden){widget.style.left=pos.x+'px';widget.style.top=pos.y+'px';widget.style.right='auto';widget.style.bottom='auto'}});
if(pos.x==null){widget.style.right='20px';widget.style.bottom='94px';widget.style.left='auto';widget.style.top='auto'}renderFloat();showLauncher();
