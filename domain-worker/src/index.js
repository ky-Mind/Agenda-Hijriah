// Menyajikan situs Kisah Lillah di kisahlillah.web.id dengan meneruskan
// setiap permintaan ke deployment Vercel. www.* dialihkan ke domain utama.
const ASAL = "agenda-hijriah.vercel.app";
const UTAMA = "kisahlillah.web.id";

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.hostname !== UTAMA && url.hostname.endsWith(UTAMA)) {
      url.hostname = UTAMA;
      return Response.redirect(url.toString(), 301);
    }
    const ke = new URL(url.pathname + url.search, "https://" + ASAL);
    const h = new Headers(req.headers);
    h.delete("host");
    h.set("x-forwarded-host", url.hostname);
    const res = await fetch(ke, {
      method: req.method,
      headers: h,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      redirect: "manual",
    });
    const out = new Response(res.body, res);
    const loc = out.headers.get("location");
    if (loc && loc.includes(ASAL)) out.headers.set("location", loc.split(ASAL).join(UTAMA));
    out.headers.delete("x-robots-tag");
    return out;
  },
};
