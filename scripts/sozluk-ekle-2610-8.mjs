// ════════════════════════════════════════════════════════
// 26.10 — SÖZLÜK EKLE-8: Studio ana ekranı (StudioApp +
//   VideoPreviewSection + OnerilenVideolar) gömülü TR metinleri — 5 dil.
//   Çalıştırma: node scripts/sozluk-ekle-2610-8.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KO = path.dirname(fileURLToPath(import.meta.url));
const I18N = path.join(KO, "..", "src", "i18n");

const KOMUT = {
  // ── OnerilenVideolar (stüdyo altı öneri şeridi) ──
  ovOnecikar: { tr: "Öne Çıkanlar", en: "Featured", ar: "مختارات", id: "Unggulan", ur: "خاص" },
  ovOnecikarAlt: {
    tr: "Nûr Stüdyo'nun seçtiği hazır atmosferler — tek tıkla kart gönderimi",
    en: "Curated ready atmospheres by Nûr Stüdyo — send a card in one tap",
    ar: "أجواء جاهزة مختارة من نور ستوديو — أرسل بطاقة بنقرة واحدة",
    id: "Atmosfer siap pilihan Nûr Stüdyo — kirim kart sekali ketuk",
    ur: "نور اسٹوڈیو کی منتخب تیار فضا — ایک کلک سے کارڈ بھیجیں",
  },
  ovNasil: { tr: "Nasıl Çalışır?", en: "How It Works?", ar: "كيف يعمل؟", id: "Cara Kerja?", ur: "کیسے کام کرتا ہے؟" },
  ovYeni: { tr: "YENİ", en: "NEW", ar: "جديد", id: "BARU", ur: "نیا" },
  ovVideoizle: { tr: "Videoyi İzle", en: "Watch Video", ar: "شاهد الفيديو", id: "Tonton Video", ur: "ویڈیو دیکھیں" },
  ovSonraki: { tr: "Sıradaki", en: "Next", ar: "التالي", id: "Berikutnya", ur: "اگلا" },
  ovKartgonder: { tr: "Karta Çevir", en: "Turn Into Card", ar: "حوّل إلى بطاقة", id: "Jadikan Kart", ur: "کارڈ بنائیں" },
  ovAciklamaYok: { tr: " Atmosfer adı, sure ve ayet aralığı içeride yazılı."), // placeholder replaced below
  ovFiltreHepsi: { tr: "Hepsi", en: "All", ar: "الكل", id: "Semua", ur: "سب" },
};

// ★ ovAciklamaYok yanlış doldu — düzeltme
KOMUT.ovAciklamaYok = {
  tr: "Video açıklaması bu atmosferde yok — quranda paylaşan kendi yazıyı ekler.",
  en: "No video caption for this atmosphere — whoever shares it adds their own.",
  ar: "لا وصف للفيديو في هذه الأجواء — من يشاركه يضيف نصه.",
  id: "Tidak ada keterangan video untuk atmosfer ini — yang membagikan menulis sendiri.",
  ur: "اس فضا کی ویڈیو کا کوئی تعارف نہیں — شیئر کرنے والا اپنا لکھتا ہے۔",
};

for (const dil of ["tr", "en", "ar", "id", "ur"]) {
  const dosya = path.join(I18N, `dicts.${dil}.json`);
  const dict = JSON.parse(fs.readFileSync(dosya, "utf8"));
  let ekle = 0, zaten = 0;
  for (const [k, v] of Object.entries(KOMUT)) {
    if (typeof v !== "object") continue;
    if (dict[k] !== undefined && dict[k] !== "") { zaten++; continue; }
    dict[k] = v[dil];
    ekle++;
  }
  fs.writeFileSync(dosya, JSON.stringify(dict, null, 2) + "\n", "utf8");
  console.log(`✓ ${dil}: +${ekle} yeni, ${zaten} zaten vardı`);
}
console.log("Bitti.");
