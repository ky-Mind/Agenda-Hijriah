/* Pesan antar pengguna (Firestore). Terhubung lewat email; kedua pihak harus saling setuju (permintaan chat).
   userIndex/{email}  -> {uid,name,email}  (dicari persis berdasarkan email, tidak bisa di-list)
   chats/{uidA_uidB}  -> {members,names,emails,status:pending|active|blocked,requestedBy,intro,lastMessage,lastAt,lastFrom,lastRead{uid:ts}}
   chats/{id}/messages/{mid} -> {from,text,at} */
import {get,toast} from "../store.js";
import {swReady} from "./adzan.js";
import * as E from "./e2e.js";
import {ping,isOn} from "./push.js";
const db=()=>window.__klDb,FV=()=>firebase.firestore.FieldValue,abs=p=>new URL(p,location.href).href;
export const norm=e=>String(e||"").trim().toLowerCase(),EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,cid=(a,b)=>[a,b].sort().join("_");
export const readAt=(c,u)=>{const t=c.lastRead&&c.lastRead[u];return t?ms(t):0};
export const ms=t=>t&&t.toMillis?t.toMillis():typeof t==="number"?t:t?0:Date.now();
export const state={uid:null,chats:[],unread:0,incoming:0,ready:false,err:"",open:null};
export const otherOf=c=>(c.members||[]).find(m=>m!==state.uid)||"";
const AV_OK=/^(data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+|https:\/\/[\w.-]*googleusercontent\.com\/[^\s"'<>]+)$/;
export const safeImg=v=>typeof v==="string"&&v.length<12000&&AV_OK.test(v)?v:"";
const thumb=src=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas");c.width=c.height=96;const m=Math.min(i.width,i.height);c.getContext("2d").drawImage(i,(i.width-m)/2,(i.height-m)/2,m,m,0,0,96,96);r(c.toDataURL("image/jpeg",.7))};i.onerror=()=>r("");i.src=src});
async function myPhoto(u){const p=get("profil",{}).photo;if(p&&/^data:image\//.test(p))return await thumb(p);return safeImg(u.photoURL||"")}
const avCache=new Map();
export async function avatar(email){email=norm(email);if(!email||!db())return"";if(avCache.has(email))return avCache.get(email);let v="";try{const d=await db().collection("userIndex").doc(email).get();v=d.exists?safeImg(d.data().photo):""}catch(e){}avCache.set(email,v);return v}
export const otherPub=c=>(c.pubs&&c.pubs[otherOf(c)])||"";
export const retain=()=>{const v=get("chat_prefs",{}).retain;return v===0?0:Number(v)>0?Number(v):30};
export const nameOf=c=>(c.names&&c.names[otherOf(c)])||(c.emails&&c.emails[otherOf(c)])||"Pengguna";
export const emailOf=c=>(c.emails&&c.emails[otherOf(c)])||"";
const myName=u=>(get("profil",{}).name||u.displayName||String(u.email||"").split("@")[0]||"Pengguna").slice(0,60);
const emit=()=>{const u=state.uid;state.unread=state.chats.filter(c=>c.status==="active"&&c.lastFrom&&c.lastFrom!==u&&ms(c.lastAt)>readAt(c,u)).length;
  state.incoming=state.chats.filter(c=>c.status==="pending"&&c.requestedBy!==u).length;
  document.dispatchEvent(new CustomEvent("kl-chat",{detail:{unread:state.unread,incoming:state.incoming}}))};
let unsub=null,first=true,tok=0;const seen=new Map();
async function decorate(list){await Promise.all(list.map(async c=>{c.preview="";c.introText="";const op=otherPub(c);if(!E.state.ready||!op)return;
  if(c.status==="pending"&&c.intro)c.introText=(await E.decrypt(op,c.intro))||"";
  if(c.status==="active"&&c.lastMessage)c.preview=(await E.decrypt(op,c.lastMessage))||"🔒 Pesan terenkripsi"}));return list}
document.addEventListener("kl-e2e",()=>{if(state.uid){decorate(state.chats).then(emit);register(window.__klAuth&&__klAuth.currentUser)}});
async function notify(c,req){const n=nameOf(c),title=req?"Permintaan chat baru":n,body=req?`${n} ingin terhubung denganmu`:String(c.preview||"Pesan baru").slice(0,90);
  if(!document.hidden){if(state.open!==c.id)toast(`${title}: ${body}`);return}
  if(isOn())return;
  if("Notification"in window&&Notification.permission==="granted"){const o={body,icon:abs("assets/icon-192.png"),badge:abs("assets/badge-96.png"),tag:"chat-"+c.id,renotify:true,lang:"id",data:{url:abs("./#/pesan/"+c.id)}};
    try{const r=await swReady();if(r?.showNotification)return r.showNotification(title,o);new Notification(title,o)}catch(e){}}}
export async function register(u,force){
  if(!u||!u.email||!db())return;const p=get("chat_prefs",{}),k="kl_chat_idx_"+u.uid,photo=p.hidden?"":await myPhoto(u),sig=myName(u)+"|"+!!p.hidden+"|"+E.state.pub+"|"+photo.length;
  if(!force&&localStorage.getItem(k)===sig)return;
  const ref=db().collection("userIndex").doc(norm(u.email));
  try{if(p.hidden)await ref.delete();else await ref.set({uid:u.uid,name:myName(u),email:norm(u.email),pub:E.state.pub||"",photo,updated:Date.now()});localStorage.setItem(k,sig)}catch(e){console.warn("indeks chat",e&&e.code||e);state.err=e&&e.code||"err"}}
/* Diagnosa: apakah kunci publik akun ini benar-benar sudah terdaftar di userIndex? */
export async function checkIndex(u){if(!u||!u.email||!db()||!E.state.ready)return"na";if(get("chat_prefs",{}).hidden)return"hidden";
  try{const d=await db().collection("userIndex").doc(norm(u.email)).get();if(!d.exists)return"missing";const x=d.data();return x.pub&&x.pub===E.state.pub?"ok":"stale"}catch(e){return"error"}}
export async function repairIndex(u){await register(u,true);return checkIndex(u)}
export function init(u){
  if(unsub){try{unsub()}catch(e){}unsub=null}
  Object.assign(state,{uid:u?u.uid:null,chats:[],ready:false,err:""});first=true;seen.clear();tok++;emit();
  E.init(u?u.uid:null);if(!u||!db())return;register(u);
  try{unsub=db().collection("chats").where("members","array-contains",u.uid).onSnapshot(async snap=>{
    const ds=o=>({id:o.id,...o.data({serverTimestamps:"estimate"})}),list=snap.docs.map(ds),my=++tok;await decorate(list);if(my!==tok)return;
    if(first)list.forEach(c=>seen.set(c.id,ms(c.lastAt)));
    else snap.docChanges().forEach(ch=>{if(ch.type==="removed")return;const c=ds(ch.doc);
      if(c.status==="pending"&&c.requestedBy!==u.uid){if(ch.type==="added")notify(c,true)}
      else if(c.status==="active"&&c.lastFrom&&c.lastFrom!==u.uid&&ms(c.lastAt)>(seen.get(c.id)||0)){seen.set(c.id,ms(c.lastAt));notify(c)}});
    state.chats=list.sort((a,b)=>ms(b.lastAt)-ms(a.lastAt));state.ready=true;state.err="";first=false;emit()},
    e=>{state.err=e&&e.code||"err";state.ready=true;emit()})}catch(e){console.warn("chat",e);state.err="unavailable";state.ready=true;emit()}
}
export async function find(email){const e=norm(email);if(!EMAIL.test(e))throw new Error("format");const d=await db().collection("userIndex").doc(e).get();return d.exists?d.data():null}
export async function request(u,target,intro){
  if(!E.state.ready)throw new Error("locked");if(!target.pub)throw new Error("nopub");
  const id=cid(u.uid,target.uid);if(state.chats.some(c=>c.id===id))return id;const t=String(intro||"").trim().slice(0,140);
  await db().collection("chats").doc(id).set({members:[u.uid,target.uid],names:{[u.uid]:myName(u),[target.uid]:String(target.name||"").slice(0,60)},emails:{[u.uid]:norm(u.email),[target.uid]:target.email},pubs:{[u.uid]:E.state.pub,[target.uid]:target.pub},
    status:"pending",requestedBy:u.uid,intro:t?await E.encrypt(target.pub,t):"",lastMessage:"",lastAt:FV().serverTimestamp(),lastFrom:"",lastRead:{}});ping(id,"req");return id}
const cref=id=>db().collection("chats").doc(id);
export const accept=id=>{if(!E.state.ready)return Promise.reject(new Error("locked"));return cref(id).update({status:"active",lastAt:FV().serverTimestamp(),["lastRead."+state.uid]:FV().serverTimestamp(),["pubs."+state.uid]:E.state.pub})};
export function syncPub(id){const c=state.chats.find(x=>x.id===id);if(!c||c.status!=="active"||!E.state.ready)return;if(!c.pubs||c.pubs[state.uid]!==E.state.pub)cref(id).update({["pubs."+state.uid]:E.state.pub}).catch(()=>{})}
export const remove=id=>cref(id).delete();
export const block=id=>cref(id).update({status:"blocked",blockedBy:state.uid});
export const unblock=id=>cref(id).update({status:"active",blockedBy:FV().delete()});
export const markRead=id=>cref(id).update({["lastRead."+state.uid]:FV().serverTimestamp()}).catch(()=>{});
export async function send(id,text){
  const t=String(text||"").trim().slice(0,1500);if(!t)return;const c=state.chats.find(x=>x.id===id),op=c?otherPub(c):"";
  if(!E.state.ready)throw new Error("locked");if(!op)throw new Error("nopub");
  const[ct,pv]=await Promise.all([E.encrypt(op,t),E.encrypt(op,t.slice(0,120))]),b=db().batch(),r=cref(id),m={from:state.uid,text:ct,at:FV().serverTimestamp()},d=retain();
  if(d>0)m.expireAt=new Date(Date.now()+d*864e5);
  const up={lastMessage:pv,lastAt:FV().serverTimestamp(),lastFrom:state.uid,["lastRead."+state.uid]:FV().serverTimestamp()};if(!c.pubs||c.pubs[state.uid]!==E.state.pub)up["pubs."+state.uid]=E.state.pub;
  b.set(r.collection("messages").doc(),m);b.update(r,up);await b.commit();ping(id,"msg")}
export const delMessage=(id,mid)=>cref(id).collection("messages").doc(mid).delete();
export function watch(id,limit,cb,err){let tk=0;
  return cref(id).collection("messages").orderBy("at","desc").limit(limit).onSnapshot({includeMetadataChanges:true},async sn=>{
    const my=++tk,rows=sn.docs.map(d=>({id:d.id,pending:d.metadata.hasPendingWrites,...d.data({serverTimestamps:"estimate"})})).reverse(),c=state.chats.find(x=>x.id===id),op=c?otherPub(c):"";
    const out=await Promise.all(rows.map(async m=>({...m,text:E.state.ready&&op?await E.decrypt(op,m.text):null})));if(my!==tk)return;cb(out,sn.size>=limit)},err)}
