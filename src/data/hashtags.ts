// ════════════════════════════════════════════════════════
// hashtags.ts — ÇOK DİLLİ HASHTAG HAVUZU (03.10, 5 dil)
// Her dil kendi kategori setiyle: seçili dilin hashtag'leri
// açıklamaya gider — Türkçe etiket Arapça/Urduca videoda kalmaz.
// Kategori anahtarları 5 dilde birebir aynıdır (rastgele çekim adil).
// ════════════════════════════════════════════════════════

type KategoriSeti = Record<string, string[]>;

export const HASHTAG_SETS: Record<string, KategoriSeti> = {
  tr: {
    kuran:     ["#kuran", "#ayet", "#mushaf", "#tilavet", "#tefsir", "#sure", "#meal", "#kuraniKerim"],
    cuma:      ["#cuma", "#cumamübarek", "#cumagünü", "#hayırlıcumalar", "#cumadua"],
    ramazan:   ["#ramazan", "#iftar", "#sahur", "#teravih", "#kadirgecesi", "#oruç", "#bayram"],
    dua:       ["#dua", "#istiğfar", "#tevbe", "#secde", "#zikir", "#niyaz"],
    tefekkur:  ["#tefekkür", "#maneviyat", "#huzur", "#içhuzur", "#sekinet", "#sükunet"],
    huzur:     ["#huzur", "#rahmet", "#gönül", "#kalp", "#şifa"],
    peygamber: ["#peygamber", "#efendimiz", "#hadis", "#sünnet", "#nebevi", "#salavat"],
    aile:      ["#müslümanaile", "#anne", "#baba", "#evlilik", "#helal", "#terbiye"],
    sosyal:    ["#islam", "#iman", "#namaz", "#allah", "#ümmet", "#hayır", "#sadaka"],
    kesfet:    ["#keşfet", "#fyp", "#foryou", "#viral", "#reels", "#shorts"],
    marka:     ["#nurstudyo", "#nurstüdyo"],
  },
  en: {
    kuran:     ["#quran", "#verse", "#recitation", "#tilawah", "#tafsir", "#surah", "#quranrecitation", "#noblequran"],
    cuma:      ["#friday", "#jummah", "#jummahmubarak", "#blessedfriday", "#fridayprayer"],
    ramazan:   ["#ramadan", "#iftar", "#suhoor", "#taraweeh", "#laylatulqadr", "#fasting", "#eid"],
    dua:       ["#dua", "#istighfar", "#repentance", "#sujood", "#dhikr", "#supplication"],
    tefekkur:  ["#reflection", "#spirituality", "#peace", "#innerpeace", "#serenity", "#tranquility"],
    huzur:     ["#peace", "#mercy", "#heart", "#soul", "#healing"],
    peygamber: ["#prophet", "#rasulullah", "#hadith", "#sunnah", "#prophetic", "#salawat"],
    aile:      ["#muslimfamily", "#mother", "#father", "#marriage", "#halal", "#etiquette"],
    sosyal:    ["#islam", "#iman", "#salah", "#allah", "#ummah", "#goodness", "#charity"],
    kesfet:    ["#explore", "#fyp", "#foryou", "#viral", "#reels", "#shorts"],
    marka:     ["#nurstudyo", "#nurstudio"],
  },
  ar: {
    kuran:     ["#قرآن", "#آية", "#مصحف", "#تلاوة", "#تفسير", "#سورة", "#قرآن_كريم", "#القرآن_الكريم"],
    cuma:      ["#الجمعة", "#جمعة_مباركة", "#يوم_الجمعة", "#صلاة_الجمعة", "#دعاء_الجمعة"],
    ramazan:   ["#رمضان", "#إفطار", "#سحور", "#تراويح", "#ليلة_القدر", "#صيام", "#عيد"],
    dua:       ["#دعاء", "#استغفار", "#توبة", "#سجود", "#ذكر", "#رجاء"],
    tefekkur:  ["#تدبر", "#روحانيات", "#سكينة", "#طمأنينة", "#سكون", "#خشوع"],
    huzur:     ["#سكينة", "#رحمة", "#قلب", "#شفاء", "#روح"],
    peygamber: ["#النبي", "#الرسول", "#حديث", "#سنة", "#نبوي", "#صلاة_على_النبي"],
    aile:      ["#الأسرة_المسلمة", "#أم", "#أب", "#زواج", "#حلال", "#أدب"],
    sosyal:    ["#إسلام", "#إيمان", "#صلاة", "#الله", "#أمة", "#خير", "#صدقة"],
    kesfet:    ["#اكسبلور", "#فولو", "#إلى_الجميع", "#ريلز", "#شورتس", "#ترند"],
    marka:     ["#نور_ستوديو", "#نورستوديو"],
  },
  id: {
    kuran:     ["#alquran", "#ayat", "#mushaf", "#tilawah", "#tafsir", "#surah", "#alqurankarim", "#tilawahquran"],
    cuma:      ["#jumat", "#jumatberkah", "#sholatjumat", "#jumutmubarok", "#doajumat"],
    ramazan:   ["#ramadan", "#iftar", "#sahur", "#tarawih", "#lailatulqadar", "#puasa", "#lebaran"],
    dua:       ["#doa", "#istighfar", "#taubat", "#sujud", "#dzikir", "#permohonan"],
    tefekkur:  ["#tadarus", "#spiritual", "#damai", "#ketenangan", "#tenang", "#khusyuk"],
    huzur:     ["#damai", "#rahmat", "#hati", "#penyembuhan", "#jiwa"],
    peygamber: ["#nabi", "#rasulullah", "#hadits", "#sunnah", "#nabawi", "#shalawat"],
    aile:      ["#keluargamuslim", "#ibu", "#ayah", "#pernikahan", "#halal", "#adab"],
    sosyal:    ["#islam", "#iman", "#shalat", "#allah", "#umat", "#kebaikan", "#sedekah"],
    kesfet:    ["#fyp", "#foryou", "#viral", "#reels", "#shorts", "#explore"],
    marka:     ["#nurstudyo", "#nurstudio"],
  },
  ur: {
    kuran:     ["#قرآن", "#آیت", "#تلاوت", "#تفسیر", "#سورہ", "#مصحف", "#قرآن_کریم", "#قرآنی_آیات"],
    cuma:      ["#جمعہ", "#جمعہ_مبارک", "#جمعہ_کا_دن", "#نماز_جمعہ", "#جمعہ_کی_دعا"],
    ramazan:   ["#رمضان", "#افطار", "#سحری", "#تراویح", "#شب_قدر", "#روزہ", "#عید"],
    dua:       ["#دعا", "#استغفار", "#توبہ", "#سجدہ", "#ذکر", "#التجا"],
    tefekkur:  ["#غور_وفکر", "#روحانیت", "#سکون", "#اطمینان", "#خشوع", "#حضور_قلب"],
    huzur:     ["#سکون", "#رحمت", "#دل", "#شفاء", "#روح"],
    peygamber: ["#نبی", "#رسول", "#حدیث", "#سنت", "#نبوی", "#درود"],
    aile:      ["#مسلم_خاندان", "#ماں", "#باپ", "#شادی", "#حلال", "#ادب"],
    sosyal:    ["#اسلام", "#ایمان", "#نماز", "#اللہ", "#امت", "#بھلائی", "#صدقہ"],
    kesfet:    ["#واٹس_نیو", "#فالو", "#وائرل", "#ریلز", "#شارٹس", "#ٹرینڈ"],
    marka:     ["#نوراسٹوڈیو", "#نوراسٹڈیو"],
  },
};

/** Seçili dilin hashtag havuzu — bilinmeyen dilde EN'e düşer (CJK/yanlış dil sızmaz). */
export function hashtagPool(lang = "tr"): string[] {
  const set = HASHTAG_SETS[lang] ?? HASHTAG_SETS.en;
  return [...new Set(Object.values(set).flat())];
}

// ★ GERİYE UYUM: eski tek-havuz adı hâlâ import ediliyor olabilir → TR havuz
export const HASHTAG_POOL: string[] = hashtagPool("tr");
export const HASHTAG_CATEGORIES = HASHTAG_SETS.tr;

/** Rastgele hashtag kombinasyonu — her kategoriden çekerek çeşitlilik sağlar (dil bazlı) */
export function randomHashtagCombo(count = 7, lang = "tr"): string[] {
  const set = HASHTAG_SETS[lang] ?? HASHTAG_SETS.en;
  const cats = Object.values(set);
  const picked: string[] = [];
  const shuffledCats = [...cats].sort(() => Math.random() - 0.5);
  for (const cat of shuffledCats) {
    if (picked.length >= count) break;
    const item = cat[Math.floor(Math.random() * cat.length)];
    if (!picked.includes(item)) picked.push(item);
  }
  const pool = hashtagPool(lang);
  while (picked.length < count) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (!picked.includes(item)) picked.push(item);
  }
  return picked.sort(() => Math.random() - 0.5);
}
