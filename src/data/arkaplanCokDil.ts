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

/** 11 mood plan cümlesi (TR verideki plan alanının çevirisi) */
export const MOOD_PLAN_COKDIL: Record<string, Partial<Record<Lang, string>>> = {
  "huzur":     { en: "Calm lake + night sky + geometric pattern trio, with a soft cinematic filter.", ar: "ثلاثية البحيرة الهادئة + سماء الليل + الزخرفة الهندسية، بفلتر سينمائي ناعم.", id: "Trio danau tenang + langit malam + pola geometris, dengan filter sinematik lembut.", ur: "پرسکون جھیل + رات کا آسمان + ہندسی نقش کی triplet، نرم سینمائی فلٹر کے ساتھ۔" },
  "nur":       { en: "Starry sky + mosque silhouette, glowing with the warm golden 'Light' filter.", ar: "سماء مرصعة بالنجوم + ظل المسجد، تتوهج بفلتر «النور» الذهبي الدافئ.", id: "Langit berbintang + siluet masjid, bersinar dengan filter 'Cahaya' emas hangat.", ur: "ستاروں بھرا آسمان + مسجد کا سایہ، گرم سنہری «نور» فلٹر سے چمکتا ہے۔" },
  "gece":      { en: "Deep-blue night palette: moon + stars + clouds, with the deep 'Night' filter.", ar: "لوحة ليل زرقاء عميقة: قمر + نجوم + سحاب، بفلتر «الليل» العميق.", id: "Palet malam biru tua: bulan + bintang + awan, dengan filter 'Malam' yang dalam.", ur: "گہرا نیلی رات کا پیلیٹ: چاند + ستارے + بادل، گہرے «رات» فلٹر کے ساتھ۔" },
  "gunbatimi": { en: "Sunset + sea reflection, cinematic feel with the 'Golden Hour' filter.", ar: "غروب + انعكاس البحر، إحساس سينمائي بفلتر «الساعة الذهبية».", id: "Matahari terbenam + pantulan laut, nuansa sinematik dengan filter 'Jam Keemasan'.", ur: "غروبِ آفتاب + سمندر کا عکس، «سنہری لمحہ» فلٹر کے ساتھ سینمائی احساس۔" },
  "kabe":      { en: "Kaaba + Islamic architecture, with the golden contrast of 'Kaaba Accent'.", ar: "الكعبة + العمارة الإسلامية، بالتباين الذهبي «الليلات الكعبة».", id: "Ka'bah + arsitektur Islam, dengan kontras emas 'Aksen Ka'bah'.", ur: "کعبہ + اسلامی فن تعمیر، «کعبہ نمایاں» کے سنہری تضاد کے ساتھ۔" },
  "yesil":     { en: "Gardens of paradise + forest, vivid green with the 'Emerald' filter.", ar: "حدائق الجنة + الغابة، أخضر حيوي بفلتر «الزمرد».", id: "Taman surga + hutan, hijau cerah dengan filter 'Zamrud'.", ur: "جنت کے باغ + جنگل، «زمرد» فلٹر کے ساتھ شاداب سبز۔" },
  "deniz":     { en: "Sea + waterfall flow, soft contrast; the peace of water.", ar: "البحر + جريان الشلال، تباين ناعم؛ سكينة الماء.", id: "Laut + aliran air terjun, kontras lembut; kedamaian air.", ur: "سمندر + آبشار کا بہاؤ، نرم تضاد؛ پانی کا سکون۔" },
  "vahset":    { en: "Mountains + snowy peaks, black-and-white cinema: grandeur and resolve.", ar: "الجبال + قمم مثلثة، سينما أبيض وأسود: هيبة وعزيمة.", id: "Gunung + puncak bersalju, sinema hitam-putih: keagungan dan tekad.", ur: "پہاڑ + برفانی چوٹیاں، سیاہ و سفید سینما: عظمت اور عزم۔" },
  "imtihan":   { en: "Stormy clouds + turbulent sea, with a dramatic dark filter.", ar: "سحاب عاصف + بحر مضطرب، بفلتر داكن درامي.", id: "Awan badai + laut bergolak, dengan filter gelap dramatis.", ur: "طوفانی بادل + متلاطم سمندر، ڈرامائی گہرے فلٹر کے ساتھ۔" },
  "saf":       { en: "Snow + cloud whiteness, neutral cinema tone: simplicity.", ar: "بياض الثلج + السحاب، نغمة سينمائية محايدة: البساطة.", id: "Keputihan salju + awan, nada sinema netral: kesederhanaan.", ur: "برف کی سفیدی + بادل، غیر جانبدار سینمائی لہجہ: سادگی۔" },
  "sanat":     { en: "Geometric pattern + architectural detail, golden accent: a handcrafted feel.", ar: "زخرفة هندسية + تفصيل معماري، لمسة ذهبية: إحساس الصناعة اليدوية.", id: "Pola geometris + detail arsitektur, aksen emas: nuansa kerajinan tangan.", ur: "ہندسی نقش + تعمیری تفصیل، سنہری نمایاں: دستکاری کا احساس۔" },
  "kuranyolu": { en: "Mushaf + pattern, warm reading light: a scene close to the Word.", ar: "المصحف + الزخرفة، ضوء قراءة دافئ: مشهد قريب من الكلمة.", id: "Mushaf + pola, cahaya baca hangat: adegan dekat dengan Sabda.", ur: "مصحف + نقش، گرم مطالعاتی روشنی: کلام کے قریب منظر۔" },
};

/** Mood plan cümlesinin seçili dildeki görünümü — çeviri yoksa TR plan */
export function moodPlanGorunum(moodId: string, trPlan: string, lang: Lang): string {
  return MOOD_PLAN_COKDIL[moodId]?.[lang] ?? trPlan;
}

/** 3 senaryo modunun ad + açıklaması */
export const SENARYO_COKDIL: Record<string, Partial<Record<Lang, { ad: string; aciklama: string }>>> = {
  "tek":      { en: { ad: "Single Scene", aciklama: "The whole video in one atmosphere: the strongest sense of unity." }, ar: { ad: "مشهد واحد", aciklama: "الفيديو كله في جو واحد: أقوى إحساس بالوحدة." }, id: { ad: "Adegan Tunggal", aciklama: "Seluruh video dalam satu suasana: rasa kesatuan paling kuat." }, ur: { ad: "ایک منظر", aciklama: "پوری ویڈیو ایک ماحول میں: اتحاد کا سب سے مضبوط احساس۔" } },
  "cift":     { en: { ad: "Dual Cut", aciklama: "Main + support category alternating: a sense of rhythm." }, ar: { ad: "مونتاج ثنائي", aciklama: "فئة رئيسية + داعمة بالتناوب: إحساس بالإيقاع." }, id: { ad: "Potongan Ganda", aciklama: "Kategori utama + pendukung bergantian: rasa ritme." }, ur: { ad: "دوہری ترتیب", aciklama: "بنیادی + معاون زمرے باری باری: رفتار کا احساس۔" } },
  "yolculuk": { en: { ad: "Journey", aciklama: "Calm opening → dramatic middle → hopeful finale: a story arc." }, ar: { ad: "رحلة", aciklama: "افتتاح هادئ → وسط درامي → خاتمة مشرقة: قوس حكاية." }, id: { ad: "Perjalanan", aciklama: "Pembuka tenang → tengah dramatis → final penuh harapan: lengkung cerita." }, ur: { ad: "سفر", aciklama: "پرسکون آغاز → ڈرامائی درمیان → امید بھرا اختتام: کہانی کا قوس۔" } },
};

/** Senaryo modunun seçili dildeki görünümü — çeviri yoksa TR veri */
export function senaryoGorunum(id: string, trAd: string, trAciklama: string, lang: Lang): { ad: string; aciklama: string } {
  const c = SENARYO_COKDIL[id]?.[lang];
  return c ? { ad: c.ad, aciklama: c.aciklama } : { ad: trAd, aciklama: trAciklama };
}
