/* Kota perkiraan dari alamat IP (header geolokasi Vercel). Dipakai catatan pengunjung di dasbor admin. */
module.exports=(req,res)=>{const h=k=>{try{return decodeURIComponent(req.headers[k]||"")}catch(e){return""}};
  res.setHeader("Cache-Control","no-store");res.status(200).json({city:h("x-vercel-ip-city"),region:h("x-vercel-ip-country-region"),country:h("x-vercel-ip-country")})};
