// ★ 26.10 — son ham metin anahtarları round 2: format maliyeti (DesignSettingsPanel)
import fs from "node:fs";

const EKLE = {
  "src/i18n/dicts.tr.json": {
    dspFormatMaliyet: "Her ek format bir üretim hakkı: 2 format = 2 hak · 4 format = 4 hak",
  },
  "src/i18n/dicts.en.json": {
    dspFormatMaliyet: "Each extra format = one render credit: 2 formats = 2 credits · 4 formats = 4 credits",
  },
  "src/i18n/dicts.ar.json": {
    dspFormatMaliyet: "كل صيغة إضافية تحتاج رصيد إنتاج: 2 صيغتين = رصيدان · 4 صيغ = 4 أرصدة",
  },
  "src/i18n/dicts.id.json": {
    dspFormatMaliyet: "Tiap format tambahan = satu kuota render: 2 format = 2 kuota · 4 format = 4 kuota",
  },
  "src/i18n/dicts.ur.json": {
    dspFormatMaliyet: "ہر اضافی فارمیٹ ایک رینڈر کریڈٹ: 2 فارمیٹس = 2 کریڈٹس · 4 فارمیٹس = 4 کریڈٹس",
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
