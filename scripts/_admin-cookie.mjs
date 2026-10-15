// Geçici test aracı: canlı admin oturumu simülasyonu için HMAC'li nur_session üretir.
// id GERÇEK admin id olmalı (auth/me DB teyidi yapıyor). exp kısa ömürlü (15 dk).
import fs from "fs";
import crypto from "crypto";

const ADAYLAR = ["C:/Users/msı/Desktop/env klasörü/env2.txt", "C:/Users/msı/Documents/env klasörü/env2.txt"];
const env = ADAYLAR.map(p => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } }).find(s => s) || "";
function get(k) {
  const m = env.match(new RegExp("^\\s*" + k + "\\s*=\\s*(.+)$", "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}
const secret = get("NUR_SESSION_SECRET");
const payloadObj = {
  id: "google-115706083939557971196",
  sub: "google-115706083939557971196",
  email: "bayastley@gmail.com",
  name: "Nurstudyo Admin",
  verified: true,
  isAdmin: true,
  tier: "elit",
  exp: Math.floor(Date.now() / 1000) + 15 * 60,
};
const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
console.log(`nur_session=${payload}.${sig}`);
