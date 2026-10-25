// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-6: Üst-bar Kur'an/İçindekiler etiketleri +
//   sadık üye rozet metinleri (5 dil).
//   Çalıştırma: node scripts/sozluk-ekle-2610-6.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

const KOMUT = {
  v2KuranOgrenTitle: {
    tr: "Kur'an Öğreniyorum — Oku · Dinle · Hafızlık Testi · Sayfalar",
    en: "Learn the Qur'an — Read · Listen · Memory Test · Pages",
    ar: "تعلم القرآن — اقرأ · استمع · اختبار الحفظ · الصفحات",
    id: "Belajar Al-Qur'an — Baca · Dengar · Uji Hafalan · Halaman",
    ur: "قرآن سیکھیں — پڑھیں · سنیں · حفظ ٹیسٹ · صفحات",
  },
  v2KuranOgrenEtiket: {
    tr: "KUR'AN ÖĞRENİYORUM",
    en: "LEARNING THE QUR'AN",
    ar: "أتعلم القرآن",
    id: "BELAJAR AL-QUR'AN",
    ur: "قرآن سیکھ رہا ہوں",
  },
  icindekilerEtiket: {
    tr: "İÇİNDEKİLER",
    en: "CONTENTS",
    ar: "المحتويات",
    id: "DAFTAR ISI",
    ur: "فہرست",
  },
  sadikEtiketKisa: {
    tr: "(★sadık)",
    en: "(★loyal)",
    ar: "(★وفاء)",
    id: "(★setia)",
    ur: "(★وفادر)",
  },
  sadikEtiketUzun: {
    tr: "★ SADIK ÜYE",
    en: "★ LOYAL MEMBER",
    ar: "★ عضو الوفاء",
    id: "★ ANGGOTA SETIA",
    ur: "★ وفادر رکن",
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
