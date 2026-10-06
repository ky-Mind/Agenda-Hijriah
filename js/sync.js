/* Sinkron localStorage (kunci kl2_*) <-> Firestore users/{uid}/data/store. Terbaru menang per kunci. */
(function(){
const OK=/^kl2_/,SKIP=/^kl2_(cache|sync_meta|theme)/,META="kl2_sync_meta";
const rawSet=Storage.prototype.setItem,rawDel=Storage.prototype.removeItem;
let ref=null,unsub=null,timer=null,applying=false;const dirty=new Set();
const meta=()=>{try{return JSON.parse(localStorage.getItem(META)||"{}")}catch(e){return{}}};
const saveMeta=m=>rawSet.call(localStorage,META,JSON.stringify(m));
const status=(s,t)=>{KLSync.state=s;document.dispatchEvent(new CustomEvent("kl-sync",{detail:{s,t}}))};
const track=k=>OK.test(k)&&!SKIP.test(k);
const fid=k=>k.replace(/[.\/]/g,"_");
function touch(k){if(applying||!track(k))return;const m=meta();m[k]=Date.now();saveMeta(m);dirty.add(k);schedule()}
Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(this===localStorage)touch(k)};
Storage.prototype.removeItem=function(k){rawDel.call(this,k);if(this===localStorage)touch(k)};
function schedule(){if(!ref)return;status("busy");clearTimeout(timer);timer=setTimeout(push,700)}
async function push(){
  if(!ref||!dirty.size)return status(ref?"ok":"off");
  const m=meta(),patch={};
  dirty.forEach(k=>{const v=localStorage.getItem(k);patch[fid(k)]={k,v,t:m[k]||Date.now(),del:v===null}});
  try{await ref.set(patch,{merge:true});dirty.clear();status("ok",Date.now())}catch(e){console.warn("sync",e);status("err")}
}
function pull(snap){
  const d=snap.data()||{},m=meta();let changed=false;
  applying=true;
  try{for(const id in d){const e=d[id];if(!e||!e.k||!track(e.k)||(m[e.k]||0)>=e.t)continue;
    if(e.del)rawDel.call(localStorage,e.k);else rawSet.call(localStorage,e.k,e.v);m[e.k]=e.t;changed=true}}
  finally{applying=false}
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
    if(track(k)){const e=d[fid(k)];if(!e||e.t<(m[k]||0))dirty.add(k);if(!m[k])m[k]=Date.now()}}
  saveMeta(m);
  if(dirty.size)schedule();else status("ok",Date.now());
  if(changed)document.dispatchEvent(new CustomEvent("kl-data-changed"));
}
function start(user){
  if(unsub){unsub();unsub=null}
  if(!user||!window.__klDb){ref=null;return status("off")}
  ref=__klDb.collection("users").doc(user.uid).collection("data").doc("store");
  status("busy");unsub=ref.onSnapshot(pull,e=>{console.warn(e);status("err")});
}
window.KLSync={state:"off",flush:push};
document.addEventListener("visibilitychange",()=>{if(document.hidden)push()});
window.addEventListener("online",()=>{if(dirty.size)schedule()});
if(window.__klAuth)__klAuth.onAuthStateChanged(start);
})();
