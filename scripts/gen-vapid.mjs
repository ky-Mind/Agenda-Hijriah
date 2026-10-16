/* Buat sepasang kunci VAPID (tanpa dependensi):  node scripts/gen-vapid.mjs
   Salin ke Vercel › Settings › Environment Variables. VAPID_PRIVATE_KEY bersifat rahasia, jangan di-commit. */
import {generateKeyPairSync} from "node:crypto";
const {publicKey,privateKey}=generateKeyPairSync("ec",{namedCurve:"P-256"}),pu=publicKey.export({format:"jwk"}),pr=privateKey.export({format:"jwk"});
const pub=Buffer.concat([Buffer.from([4]),Buffer.from(pu.x,"base64url"),Buffer.from(pu.y,"base64url")]).toString("base64url");
console.log(`VAPID_PUBLIC_KEY=${pub}\nVAPID_PRIVATE_KEY=${pr.d}\nVAPID_SUBJECT=mailto:emailanda@gmail.com`);
