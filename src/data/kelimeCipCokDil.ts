// ════════════════════════════════════════════════════════
// KELİME ATÖLYESİ — öneri çipleri çok dil (04.10)
// Çip GÖRÜNÜMÜ seçili dilde gösterilir; tıklanınca kutuya TR anahtar
// kelime yazılır — böylece receteBul/ayetOner arama motoru (TR anahtarlar,
// TR meal havuzu) bozulmadan aynı receteye gider.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

/** TR çip kelimesi → dil bazlı görünen etiket (eksikse TR) */
export const CIP_GORUNUM: Record<string, Partial<Record<Lang, string>>> = {
  "huzur":     { en: "peace",       ar: "سكينة",   id: "ketenangan", ur: "سکون" },
  "sabır":     { en: "patience",    ar: "صبر",     id: "kesabaran",  ur: "صبر" },
  "şükür":     { en: "gratitude",   ar: "شكر",     id: "syukur",     ur: "شکر" },
  "tevekkül":  { en: "trust in God",ar: "توكل",    id: "tawakal",    ur: "توکل" },
  "rahmet":    { en: "mercy",       ar: "رحمة",    id: "rahmat",     ur: "رحمت" },
  "umut":      { en: "hope",        ar: "أمل",     id: "harapan",    ur: "امید" },
  "rızık":     { en: "provision",   ar: "رزق",     id: "rezeki",     ur: "رزق" },
  "dua":       { en: "supplication",ar: "دعاء",    id: "doa",        ur: "دعا" },
  "deniz":     { en: "sea",         ar: "بحر",     id: "laut",       ur: "سمندر" },
  "gece":      { en: "night",       ar: "ليل",     id: "malam",      ur: "رات" },
  "ilim":      { en: "knowledge",   ar: "علم",     id: "ilmu",       ur: "علم" },
  "cennet":    { en: "paradise",    ar: "جنة",     id: "surga",      ur: "جنت" },
  "tövbe":     { en: "repentance",  ar: "توبة",    id: "tobat",      ur: "توبہ" },
  "sadaka":    { en: "charity",     ar: "صدقة",    id: "sedekah",    ur: "صدقہ" },
  "şifa":      { en: "healing",     ar: "شفاء",    id: "kesembuhan", ur: "شفا" },
  "nur":       { en: "light",       ar: "نور",     id: "cahaya",     ur: "نور" },
  "yağmur":    { en: "rain",        ar: "مطر",     id: "hujan",      ur: "بارش" },
  "ölüm":      { en: "death",       ar: "موت",     id: "kematian",   ur: "موت" },
  "namaz":     { en: "prayer",      ar: "صلاة",    id: "shalat",     ur: "نماز" },
  "kıble":     { en: "qibla",       ar: "قبلة",    id: "kiblat",     ur: "قبلہ" },
  "hac":       { en: "pilgrimage",  ar: "حج",      id: "haji",       ur: "حج" },
  "sevgi":     { en: "love",        ar: "محبة",    id: "cinta",      ur: "محبت" },
  "aile":      { en: "family",      ar: "عائلة",   id: "keluarga",   ur: "خاندان" },
  "anne":      { en: "mother",      ar: "أم",      id: "ibu",        ur: "ماں" },
  "korku":     { en: "fear",        ar: "خوف",     id: "ketakutan",  ur: "خوف" },
  "kalp":      { en: "heart",       ar: "قلب",     id: "hati",       ur: "دل" },
  "zikir":     { en: "remembrance", ar: "ذكر",     id: "zikir",      ur: "ذکر" },
  "cami":      { en: "mosque",      ar: "مسجد",    id: "masjid",     ur: "مسجد" },
  "oruç":      { en: "fasting",     ar: "صيام",    id: "puasa",      ur: "روزہ" },
  "yetim":     { en: "orphan",      ar: "يتيم",    id: "yatim",      ur: "یتیم" },
  "vakit":     { en: "time",        ar: "وقت",     id: "waktu",      ur: "وقت" },
  "yolculuk":  { en: "journey",     ar: "رحلة",    id: "perjalanan", ur: "سفر" },
  "kar":       { en: "snow",        ar: "ثلج",     id: "salju",      ur: "برف" },
  "yıldız":    { en: "stars",       ar: "نجوم",    id: "bintang",    ur: "ستارے" },
  "orman":     { en: "forest",      ar: "غابة",    id: "hutan",      ur: "جنگل" },
  "vahiy":     { en: "revelation",  ar: "وحي",     id: "wahyu",      ur: "وحی" },
};

/** Çipin seçili dildeki görünen etiketi — çeviri yoksa TR kelime */
export function cipGorunum(trKelime: string, lang: Lang): string {
  return CIP_GORUNUM[trKelime]?.[lang] ?? trKelime;
}

// ── Reçete tema adları (56) — reçete kartı başlığındaki etiket için ──
//   satır/açıklama metinleri (derin cümleler) TR kalır — veri katmanı.
export const RECETE_ETIKET: Record<string, Partial<Record<Lang, string>>> = {
  "sabir":       { en: "Patience", ar: "الصبر", id: "Kesabaran", ur: "صبر" },
  "huzur":       { en: "Peace", ar: "السكينة", id: "Ketenangan", ur: "سکون" },
  "sukur":       { en: "Gratitude", ar: "الشكر", id: "Syukur", ur: "شکر" },
  "tevekkul":    { en: "Trust in God", ar: "التوكل", id: "Tawakal", ur: "توکل" },
  "rahmet":      { en: "Mercy", ar: "الرحمة", id: "Rahmat", ur: "رحمت" },
  "sevgi":       { en: "Love", ar: "المحبة", id: "Cinta", ur: "محبت" },
  "umut":        { en: "Hope", ar: "الأمل", id: "Harapan", ur: "امید" },
  "tovbe":       { en: "Repentance & Forgiveness", ar: "التوبة والمغفرة", id: "Tobat & Ampunan", ur: "توبہ و مغفرت" },
  "imtihan":     { en: "Trial", ar: "الابتلاء", id: "Ujian", ur: "آزمائش" },
  "cennet":      { en: "Paradise", ar: "الجنة", id: "Surga", ur: "جنت" },
  "ilim":        { en: "Knowledge", ar: "العلم", id: "Ilmu", ur: "علم" },
  "aile":        { en: "Family & Home", ar: "الأسرة والبيت", id: "Keluarga & Rumah", ur: "خاندان اور گھر" },
  "deniz":       { en: "Sea", ar: "البحر", id: "Laut", ur: "سمندر" },
  "gece":        { en: "Night & Moon", ar: "الليل والقمر", id: "Malam & Bulan", ur: "رات اور چاند" },
  "yildiz":      { en: "Stars", ar: "النجوم", id: "Bintang", ur: "ستارے" },
  "dag":         { en: "Mountain & Summit", ar: "الجبل والقمة", id: "Gunung & Puncak", ur: "پہاڑ اور چوٹی" },
  "orman":       { en: "Forest", ar: "الغابة", id: "Hutan", ur: "جنگل" },
  "cicek":       { en: "Flowers", ar: "الزهور", id: "Bunga", ur: "پھول" },
  "gunbatimi":   { en: "Sunset", ar: "الغروب", id: "Matahari Terbenam", ur: "غروبِ آفتاب" },
  "kabe":        { en: "Kaaba", ar: "الكعبة", id: "Ka'bah", ur: "کعبہ" },
  "cami":        { en: "Mosque", ar: "المسجد", id: "Masjid", ur: "مسجد" },
  "kuran":       { en: "Qur'an", ar: "القرآن", id: "Al-Qur'an", ur: "قرآن" },
  "zikir":       { en: "Remembrance", ar: "الذكر", id: "Zikir", ur: "ذکر" },
  "firtina":     { en: "Storm", ar: "العاصفة", id: "Badai", ur: "طوفان" },
  "kar":         { en: "Snow", ar: "الثلج", id: "Salju", ur: "برف" },
  "col":         { en: "Desert", ar: "الصحراء", id: "Gurun", ur: "صحرا" },
  "selale":      { en: "Waterfall", ar: "الشلال", id: "Air Terjun", ur: "آبشار" },
  "baslangic":   { en: "New Beginning", ar: "البداية الجديدة", id: "Awal Baru", ur: "نیا آغاز" },
  "korku":       { en: "Fear & Refuge", ar: "الخوف والاحتماء", id: "Ketakutan & Perlindungan", ur: "خوف اور پناہ" },
  "rizik":       { en: "Provision & Sustenance", ar: "الرزق والمعاش", id: "Rezeki & Penghidupan", ur: "رزق اور روزی" },
  "olum":        { en: "Death & Eternity", ar: "الموت والخلود", id: "Kematian & Kekekalan", ur: "موت اور ابدیت" },
  "kabir":       { en: "Grave", ar: "القبر", id: "Kuburan", ur: "قبر" },
  "kiyamet":     { en: "Day of Judgment", ar: "يوم القيامة", id: "Hari Kiamat", ur: "قیامت" },
  "cehennem":    { en: "Hell", ar: "النار", id: "Neraka", ur: "دوزخ" },
  "seytan":      { en: "Satan & Deception", ar: "الشيطان والمكر", id: "Setan & Tipu Daya", ur: "شیطان اور فریب" },
  "kalp":        { en: "Purifying the Heart", ar: "تطهير القلب", id: "Menyucikan Hati", ur: "دل کی پاکی" },
  "ibadet":      { en: "Worship & Fasting", ar: "العبادة والصيام", id: "Ibadah & Puasa", ur: "عبادت اور روزہ" },
  "sadaka":      { en: "Zakat & Charity", ar: "الزكاة والصدقة", id: "Zakat & Sedekah", ur: "زکوٰۃ و صدقہ" },
  "dua":         { en: "Supplication", ar: "الدعاء", id: "Doa", ur: "دعا" },
  "yetim":       { en: "Orphan & Compassion", ar: "اليتيم والرحمة", id: "Yatim & Kasih Sayang", ur: "یتیم اور شفقت" },
  "selam":       { en: "Greeting of Peace", ar: "السلام", id: "Salam", ur: "سلام" },
  "hidayet":     { en: "Guidance", ar: "الهداية", id: "Petunjuk", ur: "ہدایت" },
  "sifa":        { en: "Healing", ar: "الشفاء", id: "Kesembuhan", ur: "شفا" },
  "nefes":       { en: "Breath & Life", ar: "النفس والحياة", id: "Napas & Kehidupan", ur: "سانس اور زندگی" },
  "yagmur":      { en: "Sky & Rain", ar: "السماء والمطر", id: "Langit & Hujan", ur: "آسمان اور بارش" },
  "nur":         { en: "Light", ar: "النور", id: "Cahaya", ur: "نور" },
  "vakit":       { en: "Time", ar: "الوقت", id: "Waktu", ur: "وقت" },
  "namaz":       { en: "Prayer", ar: "الصلاة", id: "Shalat", ur: "نماز" },
  "hac":         { en: "Hajj & Umrah", ar: "الحج والعمرة", id: "Haji & Umrah", ur: "حج و عمرہ" },
  "hatirlat":    { en: "Reminder", ar: "التذكير", id: "Peringatan", ur: "نصیحت" },
  "sabirla-guc": { en: "Strength & Height", ar: "القوة والعلو", id: "Kekuatan & Ketinggian", ur: "طاقت اور بلندی" },
  "selamet":     { en: "Safety", ar: "السلامة", id: "Keselamatan", ur: "سلامتی" },
  "kardeslik":   { en: "Brotherhood", ar: "الأخوة", id: "Persaudaraan", ur: "بھائی چارہ" },
  "hastalik":    { en: "Illness & Healing Prayer", ar: "المرض ودعاء الشفاء", id: "Sakit & Doa Kesembuhan", ur: "بیماری اور شفا کی دعا" },
  "yolculuk":    { en: "Journey", ar: "الرحلة", id: "Perjalanan", ur: "سفر" },
  "risale":      { en: "Revelation & Scripture", ar: "الوحي والرسالة", id: "Wahyu & Kitab", ur: "وحی اور رسالہ" },
};

/** Reçete etiketinin seçili dildeki görünümü — çeviri yoksa kartın TR etiketi */
export function receteEtiketGorunum(receteId: string, trEtiket: string, lang: Lang): string {
  return RECETE_ETIKET[receteId]?.[lang] ?? trEtiket;
}
