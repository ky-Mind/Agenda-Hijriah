import {apply,reverseName} from "./geo.js";
export async function geoState(){if(!navigator.geolocation)return"unsupported";try{return(await navigator.permissions.query({name:"geolocation"})).state}catch(e){return"unknown"}}
export const notifState=()=>"Notification"in window?Notification.permission:"unsupported";
export const geoMsg=e=>e?.code===1?"Izin lokasi ditolak. Aktifkan lewat pengaturan browser/aplikasi, atau cari tempat secara manual.":e?.code===2?"Lokasi tidak tersedia. Pastikan GPS aktif.":e?.code===3?"Pencarian lokasi terlalu lama. Coba lagi.":"Perangkat ini tidak mendukung GPS.";
export const getPosition=()=>new Promise((res,rej)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>res(p.coords),rej,{timeout:12000,maximumAge:60000}):rej({code:0}));
/* Minta izin lokasi (harus dari klik pengguna), lalu jadikan lokasi shalat. */
export async function useMyLocation(){const c=await getPosition(),name=await reverseName(c.latitude,c.longitude);return apply(name,c.latitude,c.longitude)}
export const GEO_TXT={granted:"Diizinkan",denied:"Diblokir",prompt:"Belum diminta",unknown:"Belum diminta",unsupported:"Tidak didukung"};
export const NOTIF_TXT={granted:"Diizinkan",denied:"Diblokir",default:"Belum diminta",unsupported:"Tidak didukung"};
