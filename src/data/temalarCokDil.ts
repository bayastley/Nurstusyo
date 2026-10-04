// ════════════════════════════════════════════════════════
// TEMA GALERİSİ — tema adları çok dil (04.10)
// 28 görünür tema (6 FREE + 22 ilk PRO) + kalanlar için TR fallback.
// Renk bileşik adları (Kırmızı Altın, Gece Mavi 2...) dilde bileşik renk adı kalıbıyla çevrilir.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

export const TEMA_AD_COKDIL: Record<string, Partial<Record<Lang, string>>> = {
  "nur":             { en: "Divine Light",    ar: "النور الإلهي",      id: "Cahaya Ilahi",      ur: "الٰہی نور" },
  "emerald":         { en: "Emerald Green",   ar: "أخضر زمردي",        id: "Hijau Zamrud",      ur: "زمرد سبز" },
  "sapphire":        { en: "Sapphire Blue",   ar: "أزرق ياقوتي",       id: "Biru Safir",        ur: "نیلم نیلا" },
  "amethyst":        { en: "Amethyst Purple", ar: "بنفسجي جمشت",       id: "Ungu Ametis",       ur: "جامنی ارغوانی" },
  "ruby":            { en: "Ruby Red",        ar: "أحمر ياقوتي",       id: "Merah Ruby",        ur: "یاقوت سرخ" },
  "sand":            { en: "Golden Desert",   ar: "الصحراء الذهبية",   id: "Gurun Emas",        ur: "سنہری صحرا" },
  "gece-yildizi":    { en: "Night Star",      ar: "نجم الليل",         id: "Bintang Malam",     ur: "رات کا ستارہ" },
  "zumrut-vaha":     { en: "Emerald Oasis",   ar: "واحة زمردينة",      id: "Oasis Zamrud",      ur: "زمرد واحہ" },
  "menekse-moru":    { en: "Violet Purple",   ar: "بنفسجي البنفسج",    id: "Ungu Violet",       ur: "بنفسی ارغوانی" },
  "yakut":           { en: "Ruby",            ar: "الياقوت",           id: "Ruby",              ur: "یاقوت" },
  "gokkusagi":       { en: "Rainbow",         ar: "قوس قزح",           id: "Pelangi",           ur: "دھنک" },
  "marsala":         { en: "Marsala Red",     ar: "أحمر مارسالا",      id: "Merah Marsala",     ur: "مرسالا سرخ" },
  "tarçin":          { en: "Cinnamon",        ar: "القرفة",            id: "Kayu Manis",        ur: "دار چینی" },
  "şafak-pembesi":   { en: "Dawn Pink",       ar: "وردي الفجر",        id: "Merah Fajar",       ur: "سحری گلابی" },
  "lavanta":         { en: "Lavender",        ar: "الخزامى",           id: "Lavender",          ur: "لیوینڈر" },
  "macenta":         { en: "Magenta",         ar: "الأرجواني",         id: "Magenta",           ur: "میجنٹا" },
  "samanyolu":       { en: "Milky Way",       ar: "درب التبانة",       id: "Bima Sakti",        ur: "کہکشاں" },
  "kum-vahasi":      { en: "Sand Oasis",      ar: "واحة الرمل",        id: "Oasis Pasir",       ur: "ریت کا واحہ" },
  "mercan-suyu":     { en: "Coral Water",     ar: "ماء المرجان",       id: "Air Karang",        ur: "مرجان پانی" },
  "gul-bahcesi":     { en: "Rose Garden",     ar: "حديقة الورد",       id: "Taman Mawar",       ur: "گلاب کا باغ" },
  "lacivert-derin":  { en: "Deep Navy",       ar: "أزرق داكن عميق",    id: "Biru Laut Dalam",   ur: "گہرا نیلا" },
  "mucellit-siyah":  { en: "Binder Black",    ar: "أسود المجلد",       id: "Hitam Mugilat",     ur: "جلد سیاہ" },
  "turkuaz-isik":    { en: "Turquoise Light", ar: "ضوء فيروزي",        id: "Cahaya Turquoise",  ur: "فیروزی روشنی" },
  "amber-atesi":     { en: "Amber Fire",      ar: "نار العنبر",        id: "Api Amber",         ur: "عنبر آگ" },
  "bahar-cicegi":    { en: "Spring Blossom",  ar: "زهرة الربيع",       id: "Bunga Musim Semi",  ur: "بہار کا پھول" },
  "gece-denizi":     { en: "Night Sea",       ar: "بحر الليل",         id: "Laut Malam",        ur: "رات کا سمندر" },
  "kahve-buketi":    { en: "Coffee Bouquet",  ar: "باقة القهوة",       id: "Buket Kopi",        ur: "کافی گلدستہ" },
  "safir-gecesi":    { en: "Sapphire Night",  ar: "ليلة ياقوتية",      id: "Malam Safir",       ur: "نیلم رات" },
};

/** Tema adının seçili dildeki görünümü — çeviri yoksa TR ad */
export function temaAdGorunum(id: string, trAd: string, lang: Lang): string {
  return TEMA_AD_COKDIL[id]?.[lang] ?? trAd;
}
