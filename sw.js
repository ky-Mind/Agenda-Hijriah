/* Kisah Lillah — offline-first. V = cangkang aplikasi (diganti tiap rilis); DATA = unduhan pengguna (TIDAK dihapus saat update). */
const V="kl-v6",DATA="kl-data",SHELL=["./", "index.html", "manifest.webmanifest", "firebase-config.js", "css/app.css", "js/app.js", "js/store.js", "js/sync.js", "assets/logo.png","assets/icon-192.png","assets/icon-512.png","assets/apple-touch-icon.png","assets/favicon-32.png", "data/doa.json", "data/dzikir.json", "data/mutiara.json", "js/lib/adzan.js", "js/lib/avatar.js", "js/lib/geo.js", "js/lib/hijri.js", "js/lib/ibadah.js", "js/lib/offline.js", "js/lib/onboard.js", "js/lib/perm.js", "js/lib/prayer.js", "js/lib/ui.js", "js/lib/wa.js", "js/pages/absensi.js", "js/pages/beranda.js", "js/pages/doa.js", "js/pages/dzikir.js", "js/pages/hadits.js", "js/pages/kalender.js", "js/pages/mutiara.js", "js/pages/profil.js", "js/pages/quran.js", "js/pages/rekap.js", "js/pages/shalat.js", "js/pages/tasbih.js", "pages/absensi.html", "pages/beranda.html", "pages/doa.html", "pages/dzikir.html", "pages/hadits.html", "pages/kalender.html", "pages/koleksi.html", "pages/mutiara.html", "pages/profil.html", "pages/quran.html", "pages/rekap.html", "pages/shalat.html", "pages/tasbih.html"];
const SWR=new Set(["fonts.googleapis.com","fonts.gstatic.com","www.gstatic.com","cdn.jsdelivr.net"]);
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:"reload"}))))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==DATA).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function net(r){try{const res=await fetch(r,{cache:"no-cache"});if(res.ok){const c=await caches.open(V);c.put(r,res.clone())}return res}catch(err){
  const hit=await caches.match(r,{ignoreSearch:true});if(hit)return hit;if(r.mode==="navigate")return(await caches.match("index.html"))||Response.error();return new Response("Offline",{status:503})}}
async function ext(r,fixed){const c=await caches.open(DATA),hit=await c.match(r);
  if(hit&&fixed)return hit;
  const up=fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r,res.clone());return res}).catch(()=>null);
  return hit||(await up)||new Response("Offline",{status:503})}
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||r.headers.has("range"))return;const u=new URL(r.url);
  if(u.origin===location.origin){if(/\.mp3$/.test(u.pathname))return;e.respondWith(net(r))}
  else if(SWR.has(u.hostname))e.respondWith(ext(r,/quran-json@|hadith-api@/.test(u.href)))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>l[0]?l[0].focus():clients.openWindow("./")))});
