// ════════════════════════════════════════════════════════
// ARKA PLAN ÜRETİCİ — çok dil verisi (04.10)
//  • MOOD_ONERI_GORUNUM: 24 öneri çipi 5 dilde GÖRÜNÜR;
//    tıklamada TR metin kutuya yazılır (moodBul arama motoru TR anahtarlarla çalışır)
//  • MOOD_AD_COKDIL: 11 mood presetinin adı (sahne kartı başlığı)
//    plan cümleleri (derin TR metin) TR kalır — veri katmanı.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

export const MOOD_ONERI_GORUNUM: Record<string, Partial<Record<Lang, string>>> = {
  "huzurlu bir gece":              { en: "a peaceful night",            ar: "ليلة هادئة",               id: "malam yang tenang",            ur: "پرامن رات" },
  "sıcak gün batımı":              { en: "a warm sunset",               ar: "غروب دافئ",                id: "matahari terbenam yang hangat", ur: "گرم غروبِ آفتاب" },
  "Kâbe'ye yolculuk":              { en: "a journey to the Kaaba",      ar: "رحلة إلى الكعبة",          id: "perjalanan ke Ka'bah",         ur: "کعبے کا سفر" },
  "cennet gibi yeşil":             { en: "paradise-like greenery",      ar: "خضرة كالجنة",              id: "hijau bagaikan surga",         ur: "جنت جیسی سبزہ" },
  "fırtınalı deniz":               { en: "a stormy sea",                ar: "بحر هائج",                 id: "laut yang bergejolak",         ur: "طوفانی سمندر" },
  "kar berraklığı":                { en: "snow clarity",                ar: "صفاء الثلج",               id: "kejernihan salju",             ur: "برف کی صفائی" },
  "kandil gecesi nur içinde":      { en: "a holy night full of light",  ar: "ليلة مباركة مضيئة",        id: "malam mustajab yang cahaya",   ur: "نور بھری مبارک رات" },
  "ay ışığında tefekkür":          { en: "reflection under moonlight",  ar: "تأمل تحت ضوء القمر",       id: "perenungan di bawah cahaya bulan", ur: "چاندنی میں غور و فکر" },
  "secdede huzur bulmak":          { en: "finding peace in prostration", ar: "سكينة في السجود",         id: "menemukan ketenangan dalam sujud", ur: "سجدے میں سکون" },
  "Ramazan iftar vakti":           { en: "Ramadan iftar time",          ar: "وقت الإفطار في رمضان",     id: "waktu berbuka Ramadan",        ur: "رمضان کے افطار کا وقت" },
  "yağmur sonrası toprak kokusu":  { en: "earth's scent after rain",    ar: "رائحة الأرض بعد المطر",    id: "aroma tanah setelah hujan",    ur: "بارش کے بعد مٹی کی خوشبو" },
  "sonbahar yaprakları arasında":  { en: "among autumn leaves",         ar: "بين أوراق الخريف",         id: "di antara dedaunan musim gugur", ur: "خزاں کے پتوں کے درمیان" },
  "ilk karın sessizliği":          { en: "the silence of first snow",   ar: "سكوت الثلج الأول",         id: "keheningan salju pertama",     ur: "پہلی برف کی خاموشی" },
  "papatyalı bahar sabahı":        { en: "a daisy spring morning",      ar: "صيع ربيعي بالأقحوان",      id: "pagi musim semi berbunga daisy", ur: "گلِ داؤدی والی بہار کی صبح" },
  "dağların ardında gün doğumu":   { en: "sunrise behind mountains",    ar: "شروق خلف الجبال",          id: "matahari terbit di balik gunung", ur: "پہاڑوں کے پیچھے طلوعِ آفتاب" },
  "bulutların üstünde uçmak":      { en: "flying above the clouds",     ar: "الطيران فوق السحاب",       id: "terbang di atas awan",         ur: "بادلوں کے اوپر اڑنا" },
  "camide akşam ezanı":            { en: "evening adhan at the mosque", ar: "أذان المغرب في المسجد",    id: "adzan maghrib di masjid",      ur: "مسجد میں مغرب کی اذان" },
  "mescidin avlusunda gölge":      { en: "shade in the mosque courtyard", ar: "ظل في فناء المسجد",      id: "bayangan di pelataran masjid", ur: "مسجد کے صحن میں سایہ" },
  "ırmak kenarında zikir":         { en: "dhikr by the river",          ar: "ذكر على ضفة النهر",        id: "zikir di tepi sungai",         ur: "دریا کنارے ذکر" },
  "yıldız kayması dileği":         { en: "a wish on a shooting star",   ar: "أمنية على شهاب مذنّب",     id: "harapan pada bintang jatuh",   ur: "ٹوٹتے ستارے پر خواہش" },
  "anne kucağı sıcaklığı":         { en: "a mother's warm embrace",     ar: "دفء حضن الأم",             id: "kehangatan dekapan ibu",       ur: "ماں کی گود کی گرمی" },
  "çocukluk anıları":              { en: "childhood memories",          ar: "ذكريات الطفولة",           id: "kenangan masa kecil",          ur: "بچپن کی یادیں" },
  "tespih sonrası dinginlik":      { en: "calm after dhikr beads",      ar: "سكينة بعد التسبيح",        id: "ketenangan setelah tasbih",    ur: "تسبیح کے بعد سکون" },
  "vahşi okyanus dalgaları":       { en: "wild ocean waves",            ar: "أمواج المحيط الهائجة",     id: "ombak lautan yang liar",       ur: "وحشی سمندری لہریں" },
};

/** Çipin seçili dildeki görünen etiketi — çeviri yoksa TR metin */
export function moodOneriGorunum(trMetin: string, lang: Lang): string {
  return MOOD_ONERI_GORUNUM[trMetin]?.[lang] ?? trMetin;
}

/** 11 mood presetinin görünen adı — sahne kartı başlığı */
export const MOOD_AD_COKDIL: Record<string, Partial<Record<Lang, string>>> = {
  "huzur":      { en: "Peace",           ar: "السكينة",      id: "Ketenangan",     ur: "سکون" },
  "nur":        { en: "Light",           ar: "النور",        id: "Cahaya",         ur: "نور" },
  "gece":       { en: "Night & Depth",   ar: "الليل والعمق", id: "Malam & Kedalaman", ur: "رات اور گہرائی" },
  "gunbatimi":  { en: "Golden Hour",     ar: "الساعة الذهبية", id: "Jam Keemasan", ur: "سنہری لمحہ" },
  "kabe":       { en: "Kaaba & Hajj",    ar: "الكعبة والحج", id: "Ka'bah & Haji",  ur: "کعبہ اور حج" },
  "yesil":      { en: "Paradise Green",  ar: "الخضرة الجنة", id: "Hijau Surga",    ur: "جنت کی سبزہ" },
  "deniz":      { en: "Water & Flow",    ar: "الماء والجريان", id: "Air & Mengalir", ur: "پانی اور بہاؤ" },
  "vahset":     { en: "Grand Nature",    ar: "الطبيعة العظيمة", id: "Alam Agung",  ur: "عظیم فطرت" },
  "imtihan":    { en: "Trial & Storm",   ar: "الابتلاء والعاصفة", id: "Ujian & Badai", ur: "آزمائش اور طوفان" },
  "saf":        { en: "Pure & Clear",    ar: "الصفاء والنقاء", id: "Murni & Jernih", ur: "پاکی اور صفائی" },
  "sanat":      { en: "Pattern & Art",   ar: "الزخرفة والفن", id: "Corak & Seni",  ur: "نقش و نگار" },
  "kuranyolu":  { en: "Mushaf & Reading", ar: "المصحف والقراءة", id: "Mushaf & Membaca", ur: "مصحف اور تلاوت" },
};

/** Mood adının seçili dildeki görünümü — çeviri yoksa TR ad */
export function moodAdGorunum(moodId: string, trAd: string, lang: Lang): string {
  return MOOD_AD_COKDIL[moodId]?.[lang] ?? trAd;
}
