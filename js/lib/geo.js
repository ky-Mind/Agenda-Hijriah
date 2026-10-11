import {setLoc,tzOffset} from "./prayer.js";
/* Geocoding gratis dari OpenStreetMap Nominatim (tanpa API key / Google Maps). Gunakan hemat: 1 permintaan per aksi pengguna. */
const NOM="https://nominatim.openstreetmap.org";
async function get(u){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),10000);try{const r=await fetch(u,{signal:ac.signal,headers:{"Accept-Language":"id"}});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json()}finally{clearTimeout(t)}}
export async function searchPlace(q){
  const j=await get(`${NOM}/search?format=jsonv2&limit=6&addressdetails=1&accept-language=id&q=${encodeURIComponent(q)}`);
  return j.map(x=>{const a=x.address||{},p=[x.name||a.city||a.town||a.village||a.county,a.state].filter(Boolean);return{name:p.join(", ")||x.display_name.split(",").slice(0,2).join(","),full:x.display_name,lat:+x.lat,lng:+x.lon}})}
export async function reverseName(lat,lng){
  try{const j=await get(`${NOM}/reverse?format=jsonv2&zoom=10&accept-language=id&lat=${lat}&lon=${lng}`),a=j.address||{};
    return[a.city||a.town||a.village||a.county||a.suburb,a.state].filter(Boolean).join(", ")||j.name||"Lokasi saya"}catch(e){return"Lokasi saya"}}
export const apply=(name,lat,lng)=>{const l={name,lat:+(+lat).toFixed(5),lng:+(+lng).toFixed(5)};l.tz=tzOffset(l);setLoc(l);return l};
