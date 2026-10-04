// ════════════════════════════════════════════════════════
// ATMOSFER KATEGORİLERİ — çok dil (04.10)
// clips.ts CATEGORIES label'larının çevirisi; catLabel yerine kullanılır.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

export const KATEGORI_AD_COKDIL: Record<string, Partial<Record<Lang, string>>> = {
  "yuklenenler": { en: "📁 My Uploads",      ar: "📁 رفعاتي",          id: "📁 Unggahan Saya",       ur: "📁 میری اپ لوڈز" },
  "namaz":       { en: "🕌 Prayer & Kaaba",  ar: "🕌 الصلاة والكعبة",   id: "🕌 Shalat & Ka'bah",     ur: "🕌 نماز اور کعبہ" },
  "musaf":       { en: "📖 Qur'an & Mushaf", ar: "📖 القرآن والمصحف",   id: "📖 Al-Qur'an & Mushaf",  ur: "📖 قرآن اور مصحف" },
  "cicekler":    { en: "🌸 Flowers & Roses", ar: "🌸 الزهور والورد",    id: "🌸 Bunga & Mawar",       ur: "🌸 پھول اور گلاب" },
  "yildizlar":   { en: "✨ Stars & Space",   ar: "✨ النجوم والفضاء",   id: "✨ Bintang & Antariksa", ur: "✨ ستارے اور کائنات" },
  "deniz":       { en: "🌊 Sea & Waves",     ar: "🌊 البحر والأمواج",   id: "🌊 Laut & Ombak",        ur: "🌊 سمندر اور لہریں" },
  "gunbatimi":   { en: "🌅 Sunset",          ar: "🌅 الغروب",           id: "🌅 Matahari Terbenam",   ur: "🌅 غروبِ آفتاب" },
  "gece":        { en: "🌙 Night & Moon",    ar: "🌙 الليل والقمر",     id: "🌙 Malam & Bulan",       ur: "🌙 رات اور چاند" },
  "orman":       { en: "🌲 Forest & Green",  ar: "🌲 الغابة والخضرة",   id: "🌲 Hutan & Hijau",       ur: "🌲 جنگل اور سبزہ" },
  "cami":        { en: "🕌 Islamic Architecture", ar: "🕌 العمارة الإسلامية", id: "🕌 Arsitektur Islam", ur: "🕌 اسلامی فن تعمیر" },
  "gol":         { en: "🏞️ Calm Lake",       ar: "🏞️ البحيرة الهادئة",  id: "🏞️ Danau Tenang",        ur: "🏞️ پرسکون جھیل" },
  "bulut":       { en: "☁️ Clouds",          ar: "☁️ السحاب",           id: "☁️ Awan",                ur: "☁️ بادل" },
  "desen":       { en: "🔷 Geometric Pattern", ar: "🔷 الزخرفة الهندسية", id: "🔷 Pola Geometris",     ur: "🔷 ہندسی نقش" },
  "selale":      { en: "💧 Waterfalls",      ar: "💧 الشلالات",         id: "💧 Air Terjun",          ur: "💧 آبشاريں" },
  "daglar":      { en: "🏔️ Mountains & Summit", ar: "🏔️ الجبال والقمم",  id: "🏔️ Gunung & Puncak",    ur: "🏔️ پہاڑ اور چوٹیاں" },
  "kar":         { en: "❄️ Snow & Ice",      ar: "❄️ الثلج والجليد",    id: "❄️ Salju & Es",          ur: "❄️ برف اور یخ" },
  "sehir":       { en: "🏙️ Civilization & City", ar: "🏙️ الحضارة والمدينة", id: "🏙️ Peradaban & Kota", ur: "🏙️ تہذیب اور شہر" },
  "cennet":      { en: "🌿 Paradise Garden", ar: "🌿 حدائق الجنة",      id: "🌿 Taman Surga",         ur: "🌿 جنت کے باغ" },
  "col":         { en: "🏜️ Desert",          ar: "🏜️ الصحراء",          id: "🏜️ Gurun",               ur: "🏜️ صحرا" },
  "ates":        { en: "🔥 Fire",            ar: "🔥 النار",            id: "🔥 Api",                 ur: "🔥 آگ" },
};

/** Kategori adının seçili dildeki görünümü — çeviri yoksa TR label */
export function kategoriAdGorunum(catId: string, trLabel: string, lang: Lang): string {
  return KATEGORI_AD_COKDIL[catId]?.[lang] ?? trLabel;
}
