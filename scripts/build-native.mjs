/* Menyiapkan app-www/ untuk Capacitor (Android dan iPhone). Kode server (api/), konfigurasi deploy, dan skrip tidak ikut ke dalam aplikasi. */
import {cpSync,rmSync,mkdirSync,readdirSync} from "node:fs";
const SRC="www",OUT="app-www",SKIP=new Set(["api","scripts","node_modules","package.json","package-lock.json","vercel.json"]);
rmSync(OUT,{recursive:true,force:true});
mkdirSync(OUT);
for(const f of readdirSync(SRC)){if(SKIP.has(f))continue;cpSync(`${SRC}/${f}`,`${OUT}/${f}`,{recursive:true})}
console.log(`${OUT}/ siap untuk Capacitor`);
