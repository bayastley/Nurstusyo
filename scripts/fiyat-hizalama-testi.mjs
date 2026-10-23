// scripts/fiyat-hizalama-testi.mjs — 23.10
// create.ts'teki bolgePlanlari ile pricingData.ts REGIONAL_PLANS'ın
// birebir aynı sayıları taşıdığını doğrular (Sunucu↔Arayüz uyuşmazlığı
// — "$6 görün$10 çarpan" vakası — bir daha olmasın diye).
import { readFileSync } from "fs";

const create = readFileSync("api/payments/create.ts", "utf8");
const pricing = readFileSync("src/payments/pricingData.ts", "utf8");

const tab = create.match(/const bolgePlanlari[\s\S]*?\n\s*\};/)?.[0] || "";
if (!tab.includes("USD")) { console.error("bolgePlanlari bulunamadı"); process.exit(1); }

const ayetlerTablosu = (bolge) => {
  const satirSay = pricing.split("\n");
  const sicak = satirSay.findIndex((s) => s.trim().startsWith(bolge + ":"));
  if (sicak < 0) return null;
  for (let i = sicak; i < Math.min(sicak + 6, satirSay.length); i++) {
    const m = satirSay[i].match(/prices:\s*\{([^}]*)\}/);
    if (m) return m[1];
  }
  return null;
};

const sunucuTablosu = (bolge) => {
  const m = tab.match(new RegExp(`${bolge}:\\s*\\{([^}]*)\\}`));
  if (!m) return null;
  return m[1].match(/([A-Z_0-9]+):\s*(\d+)/g).reduce((o, x) => {
    const [k, v] = x.split(":");
    o[k.trim()] = Number(v);
    return o;
  }, {});
};

let hata = false;
for (const bolge of ["TR", "USD", "EUR", "GBP"]) {
  const sunucu = sunucuTablosu(bolge) || {};
  const arayuzSi = ayetlerTablosu(bolge) || "";
  const arayuz = arayuzSi.match(/([A-Z_0-9]+):\s*(\d+)/g).reduce((o, x) => {
    const [k, v] = x.split(":");
    o[k.trim()] = Number(v);
    return o;
  }, {});
  const farklar = Object.keys(arayuz).filter((k) => sunucu[k] !== arayuz[k]);
  const dur = farklar.length === 0 ? "OK ✅" : `FARK ❌ ${farklar.map((k) => `${k} sunucu=${sunucu[k]} arayüz=${arayuz[k]}`).join(", ")}`;
  console.log(`  ${bolge}: ${dur}`);
  if (farklar.length) hata = true;
}
console.log(hata ? "▶ SONUÇ: FAIL ❌" : "▶ SONUÇ: PASS ✅");
process.exit(hata ? 1 : 0);
