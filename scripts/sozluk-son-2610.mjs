// ★ 26.10 — son ham metin anahtarları (itZikirHalka, itHatimTebrik, vpIndirmeHatasi)
import fs from "node:fs";

const EKLE = {
  "src/i18n/dicts.tr.json": {
    itZikirHalka: "🎉 {n}. halka tamamlandı!",
    itHatimTebrik: "🎉 Tebrikler! Hatim tamamladın. Allah kabul etsin! 🤲",
    vpIndirmeHatasi: "İndirme başarısız ({n})",
  },
  "src/i18n/dicts.en.json": {
    itZikirHalka: "🎉 Ring {n} of 33 completed!",
    itHatimTebrik: "🎉 Congratulations! You completed a full Quran recitation. May Allah accept it! 🤲",
    vpIndirmeHatasi: "Download failed ({n})",
  },
  "src/i18n/dicts.ar.json": {
    itZikirHalka: "🎉 اكتملت الحلقة {n}!",
    itHatimTebrik: "🎉 مبروك! أكملت قراءة القرآن كاملًا. تقبّل الله منك! 🤲",
    vpIndirmeHatasi: "فشل التنزيل ({n})",
  },
  "src/i18n/dicts.id.json": {
    itZikirHalka: "🎉 Lingkaran {n} dari 33 selesai!",
    itHatimTebrik: "🎉 Selamat! Kamu menyelesaikan khatam Al-Qur'an. Semoga Allah menerima! 🤲",
    vpIndirmeHatasi: "Unduhan gagal ({n})",
  },
  "src/i18n/dicts.ur.json": {
    itZikirHalka: "🎉 حلوہ {n} مکمل!",
    itHatimTebrik: "🎉 مبارک ہو! آپ نے پورا قرآن ختم کیا۔ اللہ قبول فرمائے! 🤲",
    vpIndirmeHatasi: "ڈاؤن لوڈ ناکام ({n})",
  },
};

for (const [file, keys] of Object.entries(EKLE)) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  let ekle = 0, miss = 0;
  for (const [k, v] of Object.entries(keys)) {
    if (j[k] === undefined) { j[k] = v; ekle++; }
    else if (j[k] !== v) { j[k] = v; miss++; }
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  console.log(`${file}: +${ekle} yeni, ${miss} güncellendi → toplam ${Object.keys(j).length}`);
}
