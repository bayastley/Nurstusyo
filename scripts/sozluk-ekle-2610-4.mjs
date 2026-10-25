// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-4: Kur'an Dinliyorum ekranı (foto 3,
//   kullanıcı listesi) kalan anahtarlar. 5 dil parite.
//   Çalıştırma: node scripts/sozluk-ekle-2610-4.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

const KOMUT = {
  qrMeallerYukleniyor: {
    tr: "mealler güncelleniyor…",
    en: "updating translations…",
    ar: "جارٍ تحديث الترجمات…",
    id: "memperbarui terjemahan…",
    ur: "ترجمے اپ ڈیٹ ہو رہے ہیں…",
  },
};

for (const dil of ["tr", "en", "ar", "id", "ur"]) {
  const dosya = path.join(I18N, `dicts.${dil}.json`);
  const dict = JSON.parse(fs.readFileSync(dosya, "utf8"));
  let ekle = 0, zaten = 0;
  for (const [k, v] of Object.entries(KOMUT)) {
    if (dict[k] !== undefined && dict[k] !== "") { zaten++; continue; }
    dict[k] = v[dil];
    ekle++;
  }
  fs.writeFileSync(dosya, JSON.stringify(dict, null, 2) + "\n", "utf8");
  console.log(`✓ ${dil}: +${ekle} yeni, ${zaten} zaten vardı`);
}
console.log("Bitti.");
