// ★ 26.10 — son tarama sonrası iki kalan gerçek metin (rsKisa/rsUzun/rsTam/mcbBilinmeyenHata)
import fs from "node:fs";

const EKLE = {
  "src/i18n/dicts.tr.json": {
    rsKisa: "Kısa (59sn)",
    rsUzun: "Uzun (600sn)",
    rsTam: "Tam Sürüm",
    mcbBilinmeyenHata: "Bilinmeyen hata — lütfen tekrar deneyin",
  },
  "src/i18n/dicts.en.json": {
    rsKisa: "Short (59s)",
    rsUzun: "Long (600s)",
    rsTam: "Full Version",
    mcbBilinmeyenHata: "Unknown error — please try again",
  },
  "src/i18n/dicts.ar.json": {
    rsKisa: "قصير (59 ث)",
    rsUzun: "طويل (600 ث)",
    rsTam: "النسخة الكاملة",
    mcbBilinmeyenHata: "خطأ غير معروف — يرجى المحاولة مرة أخرى",
  },
  "src/i18n/dicts.id.json": {
    rsKisa: "Pendek (59dtk)",
    rsUzun: "Panjang (600dtk)",
    rsTam: "Versi Penuh",
    mcbBilinmeyenHata: "Kesalahan tak dikenal — silakan coba lagi",
  },
  "src/i18n/dicts.ur.json": {
    rsKisa: "مختصر (59 سی)",
    rsUzun: "طویل (600 سی)",
    rsTam: "مکمل ورژن",
    mcbBilinmeyenHata: "نامعلوم خامی — دوبارہ کوشش کریں",
  },
};

for (const [file, keys] of Object.entries(EKLE)) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  let ekle = 0;
  for (const [k, v] of Object.entries(keys)) {
    if (j[k] === undefined) { j[k] = v; ekle++; }
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  console.log(`${file}: +${ekle} → toplam ${Object.keys(j).length}`);
}
