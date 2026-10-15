// ★ 16.10 gece — "90 dk" → "120 dk" toplu metin güncellemesi
// Kullanıcı emri: uzun video limiti 90 → 120 dk; "90 dakika yazan HER YER" değişsin.
// Kapsam: src/**/*.{ts,tsx,json} içinde kullanıcıya görünen metinler.
// Aritmetik limit (tier.ts VIDEO_KIND_SECONDS) elle değiştirildi — bu script realm dışı.
import fs from "fs";
import path from "path";

const FILES = [
  "src/components/AdminUsersTab.tsx",
  "src/components/VideoPreviewSection.tsx",
  "src/hooks/useAdminYonetim.ts",
  "src/i18n/dicts.en.json",
  "src/i18n/dicts.en.ts",
  "src/i18n/dicts.tr.json",
  "src/i18n/dicts.tr.ts",
  "src/payments/pricingData.ts",
  "src/studio/studioConstants.ts",
  "src/StudioApp.tsx",
];

const DEGISTIRENLER = [
  // [regex, yerine]
  [/90 dakikaya kadar/g, "120 dakikaya kadar"],
  [/90 dakika/g, "120 dakika"],
  [/90 dk/g, "120 dk"],
  [/90dk/g, "120dk"],
  [/up to 90 minutes/gi, "up to 120 minutes"],
  [/up to 90 min/gi, "up to 120 min"],
  [/90 minutes/gi, "120 minutes"],
  [/90 min\b/g, "120 min"],
];

let toplam = 0;
for (const f of FILES) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) { console.log("yok:", f); continue; }
  const once = fs.readFileSync(p, "utf8");
  let sonra = once;
  for (const [re, to] of DEGISTIRENLER) sonra = sonra.replace(re, to);
  if (sonra !== once) {
    fs.writeFileSync(p, sonra, "utf8");
    const n = (once.match(/90 d[ka]|90 minutes|90 min\b/gi) || []).length;
    toplam += n;
    console.log(`✓ ${f} (${n} değişim)`);
  } else console.log(`- ${f} (değişiklik yok)`);
}
console.log(`\nToplam değişim: ${toplam}`);
