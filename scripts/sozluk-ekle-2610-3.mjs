// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-3: Kur'an Öğreniyorum ekran tarama
//   kalıntıları (foto2/3/4 kullanıcı listesi). 5 dile parite.
//   Çalıştırma: node scripts/sozluk-ekle-2610-3.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

const KOMUT = {
  qoSurelerBaslik: {
    tr: "Sureler", en: "Surahs", ar: "السور", id: "Surah", ur: "سور",
  },
  qrMekki: {
    tr: "Mekkî", en: "Meccan", ar: "مكية", id: "Makkiyah", ur: "مکی",
  },
  qrMedeni: {
    tr: "Medenî", en: "Madinan", ar: "مدنية", id: "Madaniyah", ur: "مدنی",
  },
  qrAyetlerYukleniyor: {
    tr: "Ayetler yükleniyor…",
    en: "Loading verses…",
    ar: "جارٍ تحميل الآيات…",
    id: "memuat ayat…",
    ur: "آیات لوڈ ہو رہی ہیں…",
  },
  qrTekrarDene: {
    tr: "Tekrar Dene",
    en: "Try Again",
    ar: "حاول مرة أخرى",
    id: "Coba Lagi",
    ur: "دوبارہ کوشش کریں",
  },
  qoSuresi: {
    tr: "{ad} suresi",
    en: "Surah {ad}",
    ar: "سورة {ad}",
    id: "Surah {ad}",
    ur: "سورہ {ad}",
  },
  qoDakikaKisa: {
    tr: "dk", en: "min", ar: "د", id: "mnt", ur: "منٹ",
  },
  kilitBakimda: {
    tr: "🔧 Bakımda",
    en: "🔧 Maintenance",
    ar: "🔧 تحت الصيانة",
    id: "🔧 Pemeliharaan",
    ur: "🔧 بحالی میں",
  },
  kilitGuncelleme: {
    tr: "🔒 Güncelleme",
    en: "🔒 Updating",
    ar: "🔒 تحديث",
    id: "🔒 Pembaruan",
    ur: "🔒 اپ ڈیٹ",
  },
  kilitSecili: {
    tr: "Seçili", en: "Selected", ar: "محدد", id: "Dipilih", ur: "منتخب",
  },
  kilitKariUyari: {
    tr: "Bu kâri şu anda bakımda / güncellemede — kısa süre içinde dönecek.",
    en: "This reciter is under maintenance / updating — will be back shortly.",
    ar: "هذا القارئ تحت الصيانة / التحديث حاليًا — سيعود بعد قليل.",
    id: "Qari ini sedang perbaikan / pembaruan — akan kembali segera.",
    ur: "یہ قاری بحالی / اپ ڈیٹ میں ہے — تھوڑی دیر میں واپس آئے گا۔",
  },
  qoKaydirYukari: {
    tr: "Metni yukarı kaydır",
    en: "Scroll text up",
    ar: "تمرير النص لأعلى",
    id: "Gulir teks ke atas",
    ur: "متن اوپر اسکرول کریں",
  },
  qoKaydirAsagi: {
    tr: "Metni aşağı kaydır",
    en: "Scroll text down",
    ar: "تمرير النص لأسفل",
    id: "Gulir teks ke bawah",
    ur: "متن نیچے اسکرول کریں",
  },
};

for (const [dil, beklenen] of Object.entries({ tr: "tr", en: "en", ar: "ar", id: "id", ur: "ur" })) {
  const dosya = path.join(I18N, `dicts.${dil}.json`);
  const raw = fs.readFileSync(dosya, "utf8");
  let dict;
  try {
    dict = JSON.parse(raw);
  } catch (e) {
    console.error(`✗ ${dil}: JSON bozuk — elle bak: ${e.message}`);
    continue;
  }
  let ekle = 0, zaten = 0;
  const yeni = {};
  for (const [k, v] of Object.entries(KOMUT)) {
    if (dict[k] !== undefined && dict[k] !== "") { zaten++; continue; }
    dict[k] = v[beklenen];
    yeni[k] = v[beklenen];
    ekle++;
  }
  fs.writeFileSync(dosya, JSON.stringify(dict, null, 2) + "\n", "utf8");
  console.log(`✓ ${dil}: +${ekle} yeni, ${zaten} zaten vardı${ekle ? ` → ${Object.keys(yeni).join(", ")}` : ""}`);
}
console.log("Bitti — parite kontrolü: tüm dillerde aynı tuş takımı olmalı.");
