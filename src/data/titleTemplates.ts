// ════════════════════════════════════════════════════════
// titleTemplates.ts — Başlık ve açıklama ÜRETİCİ fonksiyonları
// Veriler titleData.ts'ten import ediliyor (parçalama)
// ════════════════════════════════════════════════════════

import { getSurahDescription } from "./surahDescriptions";
import { getQuoteForSurah } from "../studio/surahQuotes";
import {
  TITLE_TEMPLATES,
  EMOTIONAL_TITLE_TEMPLATES,
  DESC_INTRO,
  DESC_LABELS,
  HADITH_POOL_BY_LANG,
  DESC_EMOTIONAL_LINES,
  CTA_POOL_MULTI,
  CTA_POOL_EN,
  PROMO_LINES_MULTI,
  PROMO_LINES_EN,
} from "./titleData";
import { SURE_ARAPCA } from "./sureArapca";

// Re-export data for backward compatibility (content.ts re-exports from here)
export { TITLE_TEMPLATES } from "./titleData";

// ════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ════════════════════════════════════════════════════════

/** Diğer diller İngilizce havuzu kullanır */
function titlePool(lang: string): string[] {
  return TITLE_TEMPLATES[lang] ?? TITLE_TEMPLATES.en;
}

/**
 * ★ SURE ADI ÇEVİRİSİ (03.10, 5 dil) — {S} yer tutucusuna seçili dilin sure adı gider.
 *   ar/ur → standart Arapça ad (SURE_ARAPCA tablosu, harakatsız);
 *   en/id → TR-Latin ad korunur ("Bakara" hem Endonezce hem İngilizce kullanıcıya tanıdık,
 *           Latin transliterasyon hatası riski sıfır);
 *   tr    → gelen ad aynen kullanılır.
 *   Böylece Arapça/Urduca başlıkta "سورة Bakara" gibi Latin sızıntı olmaz.
 */
function sureAdiCevir(surahName: string, s: number, lang: string): string {
  if (lang === "ar" || lang === "ur") return SURE_ARAPCA[s] ?? surahName;
  // ★ 03.10: en/id şablonları "Surah {S}" yazdığından gelen ad "Bakara Suresi" ise
  //   "Surah Bakara Suresi" olur — TR ekini soyup çıplak adı veriyoruz.
  return surahName.replace(/\s+Suresi$/u, "");
}

/**
 * ★ ÇOK DİLLİ ÖZEL SURE BAŞLIKLARI (03.10) — Duhâ/İnşirâh/Yâsîn/Rahmân/Mülk/Kürsî
 *   artık ar/id/ur kullanıcının kendi dilinde geliyor (İngilizce düşmüyor).
 */
function ayahMoodTitleDiger(s: number, a: number, lang: string): string[] {
  const A: Record<string, Record<string, string[]>> = {
    ar: {
      "93": [
        "ما ودعك ربّك... هذه الآية تريح قلبك 🤍",
        "لمن ظن أن الله نسيه: تسمعك سورة الضحى 🌙",
        "أكبر عزاء للقلوب الجريحة: ما قنط ربّك 🕊️",
      ],
      "94": ["فإنّ مع العسر يُسرًا... لا تنسَ 🌿", "آيات تفكّ أغلال صدرك ✨", "لمن يضيق بصدره: سورة الشرح 🤲"],
      "36": ["آيات من يس تُشفى القلوب 💚", "أرسل هذه التلاوة لمن تحب... قربًا من يس 🌹", "إذا تعب قلبك: استمع إلى يس 🎧"],
      "55": ["آية تذكّرك بنعم ربك — فامتنّ 🌿", "فَبِأَيِّ آلاءِ ربِّكما تُكَذِّبَان... تلاوة تدفّعك للتأمل 🌙", "لقلبك المنتشي: تلاوة الرحمن 🤍"],
      "67": ["آيات من المُلك تؤنسك قبل النوم 🌙", "تلاوة تذكّرك بآخرة وأيقظت قلبك 🕯️", "استمع ثم أعد التفكير في يومك 🤲"],
      "255": ["آية الكرسي: أمان وحفظ لقلبك 🛡️", "إذا اشتد الخوف: استمع إلى آية الكرسي 🤍", "الله يحيط بكل شيء... تُطمئن قلبك بها ✨"],
    },
    id: {
      "93": [
        "Tuhanmu tidak meninggalkanmu... ayat ini menenangkan hatimu 🤍",
        "Untuk yang merasa dilupakan: dengarkan Surah Ad-Duha 🌙",
        "Kenyamanan terbesar bagi hati yang luka: Tuhanmu tak kan meninggalkanmu 🕊️",
      ],
      "94": ["Sesudah kesulitan ada kemudahan... jangan lupa 🌿", "Ayat yang melepaskan beban dadamu ✨", "Untuk hatimu yang sempit: Surah Al-Insyirah 🤲"],
      "36": ["Ayat-ayat Yasin yang menyembuhkan hati 💚", "Kirim tilawah ini kepada yang tersayang... dari Yasin 🌹", "Jika hatimu lelah: dengarkan Yasin 🎧"],
      "55": ["Ayat yang mengingatkanmu pada nikmat Tuhan — bersyukurlah 🌿", "Nikmat Tuhan yang mana yang kamu dustakan? 🌙", "Untuk hatimu yang haus: tilawah Ar-Rahman 🤍"],
      "67": ["Ayat Surah Al-Mulk menemanimu sebelum tidur 🌙", "Tilawah yang mengingatkan akhirat dan membangunkan hati 🕯️", "Dengarkan, lalu pikirkan lagi harimu 🤲"],
      "255": ["Ayat Kursi: rasa aman dan perlindungan untuk hatimu 🛡️", "Saat ketakutan datang: dengarkan Ayat Kursi 🤍", "Allah Maha Meliputi segala sesuatu... biarkan hatimu pulih ✨"],
    },
    ur: {
      "93": [
        "آپ کے رب نے چھوڑا نہیں... یہ آیت آپ کے دل کو سکون دے گی 🤍",
        "جسے لگا کہ اللہ نے بھلا دیا: سورہ ضحی سنیے 🌙",
        "ٹوٹے ہوئے دلوں کی سب سے بڑی تسلی: آپ کا رب ناراض نہیں ہوا 🕊️",
      ],
      "94": ["مشکل کے ساتھ آسانی ہے... یہ نہ بھولیں 🌿", "سینے کے بوجھ ہلکی کر دینے والی آیات ✨", "جس کا دل تنگ ہو: سورہ انشراح 🤲"],
      "36": ["یٰسٰ کی آیات دلوں کے لیے شفا ہیں 💚", "یہ تلاوت اپنے پیاروں کو بھی بھیجیں... یٰسٰ سے 🌹", "جب دل تھک جائے: یٰسٰ سنیں 🎧"],
      "55": ["وہ آیت جو آپ کو اپنے رب کی نعمتیں یاد دلائے — شکر کریں 🌿", "اللہ کی کون سی نعمت کو جھٹلاؤ گے؟ 🌙", "آپ کے پیاسے دل کے لیے: سورہ رحمٰن کی تلاوت 🤍"],
      "67": ["سونے سے پہلے سورہ ملک کی آیات 🌙", "وہ تلاوت جو آخرت یاد دلائے اور دل جگائے 🕯️", "سنیں، پھر اپنے دن پر دوبارہ غور کریں 🤲"],
      "255": ["آیت الکرسی: دل کو اطمینان اور حفاظت 🛡️", "جب خوف بڑھے: آیت الکرسی سنیں 🤍", "اللہ ہر چیز کا احاطہ کر لیا ہے... اس آیت سے دل مضبوط کریں ✨"],
    },
  };
  return A[lang]?.[String(s)] ?? [];
}

/** Sureye göre özel başlık önerileri */
function ayahMoodTitle(surahName: string, s: number, a: number, lang: string): string[] {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  const tr = lang === "tr";
  // ★ 03.10: diğer diller de sure-özel başlıklardan faydalanır (İngilizce düşmüyor)
  if (!tr) {
    const diger = ayahMoodTitleDiger(s, a, lang);
    if (diger.length) return diger;
    return [];
  }
  if (tr && (s === 93 || name.includes("duh"))) {
    return [
      "Rabbin seni terk etmedi... Bu ayet kalbine iyi gelecek 🤍",
      "Yalnız kaldığını sandığın anda Duhâ Suresi sana sesleniyor 🌙",
      "Kırgın kalpler için en büyük teselli: Rabbin seni bırakmadı 🕊️",
      "İçin daraldıysa Duhâ Suresi'ni sonuna kadar dinle 🎧",
    ];
  }
  if (tr && (s === 94 || name.includes("inşirah") || name.includes("insirah"))) {
    return [
      "Her zorluktan sonra bir kolaylık var... Bunu unutma 🌿",
      "Kalbindeki ağırlığı hafifletecek ayetler 🤲",
      "Sıkışmış gibi hissedenlere İnşirâh Suresi'nden teselli ✨",
    ];
  }
  if (tr && (s === 36 || name.includes("yasin"))) {
    return [
      "Yâsîn Suresi'nden kalbe şifa olan ayetler 💚",
      "Bu tilaveti sevdiklerine de gönder... Yâsîn'den huzur 🌹",
      "Kalbin yorulduysa Yâsîn Suresi'ni dinle 🎧",
    ];
  }
  if (tr && (s === 55 || name.includes("rahman"))) {
    return [
      "Rabbinin nimetlerini hatırlatan ayet... Şükretmek için dur 🌿",
      "Rahmân Suresi kalbine nimetleri hatırlatsın 🤍",
      "Hangi nimeti inkâr edebiliriz? Bu ayet düşündürüyor 🌙",
    ];
  }
  if (tr && (s === 67 || name.includes("mülk") || name.includes("mulk"))) {
    return [
      "Gece uyumadan önce Mülk Suresi'nden huzur veren ayetler 🌙",
      "Kabir karanlığını hatırlatan ve kalbi uyandıran tilavet 🕯️",
      "Bu ayeti dinle, sonra bugününü bir daha düşün 🤲",
    ];
  }
  if (tr && s === 2 && a === 255) {
    return [
      "Ayete'l-Kürsî: kalbine güven ve koruma hissi verecek ayet 🛡️",
      "Korkuların arttığında Ayete'l-Kürsî'yi dinle 🤍",
      "Allah her şeyi kuşatmıştır... Bu ayet kalbini toparlasın ✨",
    ];
  }
  return [];
}

/** Sureye göre özel açıklama paragrafı */
// ★ ÇOK DİLLİ GENEL PARAGRAF HAVUZU (03.10) — TR'deki 114 sure-özel analiz
//   yalnız Türkçe kullanıcıya kalır; diğer diller kendi dilinde zengin
//   genel havuzdan alır (İngilizce/yanlış dil sızması sıfırlanır).
const GENEL_PARAGRAF: Record<string, string[]> = {
  en: [
    "If this reminder touched your heart today, take a moment: leave an 'Ameen' in the comments and share it with someone who may need this peace. www.nurstudyo.com",
    "Perhaps this verse found you at exactly the right moment. Listen with your heart, not only your ears — and let it be a companion for your night.",
    "Some verses heal, some verses warn, and some verses simply hold your hand through the dark. May this one be whatever your heart needs today.",
  ],
  ar: [
    "إن لامست هذه الآية قلبك اليوم فخذ لحظة: اكتب 'آمين' في التعليقات وشاركها مع من قد يحتاج هذا السكين. www.nurstudyo.com",
    "لعل هذه الآية وجدتك في اللحظة تمامًا. استمعها بقلبك لا بسمعك فقط — ولِكن رفيق ليلك.",
    "من الآيات ما تشفي، ومنها ما تحذر، ومنها ما تمسك بيدك في الظلام. جعلها الله لقلبك ما يحتاجه اليوم.",
  ],
  id: [
    "Jika ayat ini menyentuh hatimu hari ini, berhenti sejenak: tulis 'Amin' di komentar dan bagikan kepada yang mungkin membutuhkan ketenangan ini. www.nurstudyo.com",
    "Mungkin ayat ini menemukanmu tepat di saat yang tepat. Dengarkan dengan hatimu, bukan hanya telingamu — biarkan ia menemani malammu.",
    "Ada ayat yang menyembuhkan, ada yang mengingatkan, ada yang sekadar memegang tanganmu dalam gelap. Semoga ini menjadi apa yang hatimu butuhkan hari ini.",
  ],
  ur: [
    "اگر یہ آیت آج آپ کے دل کو چھو گئی تو ایک لمحہ رکیں: کمنٹس میں 'آمین' لکھیں اور اسے اس شخص کے ساتھ شیئر کریں جسے یہ سکون درکار ہو۔ www.nurstudyo.com",
    "شاید یہ آیت آپ ٹھیک اسی وقت ملی جب آپ کو درکار تھی۔ اپنے کانوں سے نہیں، دل سے سنیں — اور اسے اپنی رات کا ہم سفر بنائیں۔",
    "کچھ آیتیں شفا دیتی ہیں، کچھ ڈراتی ہیں، اور کچھ اندھیرے میں ہاتھ تھام لیتی ہیں۔ اللہ کریں یہ آج آپ کے دل کی ضرورت پوری کر دے۔",
  ],
};

function ayahMoodParagraph(surahName: string, s: number, a: number, lang: string): string {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  if (lang !== "tr") {
    const havuz = GENEL_PARAGRAF[lang] ?? GENEL_PARAGRAF.en;
    return havuz[Math.floor(Math.random() * havuz.length)];
  }

  // Önce 114 sure havuzunu kontrol et
  const surahDesc = getSurahDescription(s);
  if (surahDesc) return surahDesc;

  // Fallback: belirli sureler için özel analiz
  if (s === 93 || name.includes("duh")) {
    return "Rabbin seni terk etmedi ve sana darılmadı... Bu sure, kendini yalnız, kırgın, çaresiz ve tükenmiş hisseden her kalbe inen büyük bir tesellidir. Hz. Peygamber (s.a.v.) en zor zamanlarında bu sureyi okurdu. Eğer bugün içinden kimseye anlatamadığın bir yorgunluk geçiyorsa, bu ayeti sadece dinleme; kalbine indir.";
  }
  if (s === 94 || name.includes("inşirah") || name.includes("insirah")) {
    return "Her zorluğun yanında mutlaka bir kolaylık vardır. Belki şu an yolun dar, kalbin yorgun, sabrın azalmış olabilir; ama Allah kulunu çaresiz bırakmaz.";
  }
  if (s === 36 || name.includes("yasin")) {
    return "Yâsîn Suresi kalplere şifa, gönüllere sükûnet, evlere bereket olsun. Hz. Peygamber (s.a.v.) 'Kur'an'ın kalbi Yâsîn Suresi'dir' buyurdu.";
  }
  if (s === 55 || name.includes("rahman")) {
    return "Rabbinin nimetlerini düşünmek bazen insanın kalbini baştan sona değiştirir. Rahman Suresi'nde Allah'ın nimetleri bir bir sayılır.";
  }
  if (s === 67 || name.includes("mülk") || name.includes("mulk")) {
    return "Mülk Suresi insana dünyanın geçici olduğunu, asıl dönüşün Rabbimize olduğunu hatırlatır. Hz. Peygamber (s.a.v.) bu sureyi her gece okurdu.";
  }
  if (s === 2 && a === 255) {
    return "Ayete'l-Kürsî, kalbe güven veren, insana Allah'ın kudretini ve korumasını hatırlatan en güçlü ayetlerden biridir.";
  }
  return "Bu ayet belki de bugün kalbinin tam ihtiyacı olan hatırlatmadır. Kendini yalnız, yorgun veya kırgın hissediyorsan birkaç saniye dur ve bu sözleri kalbinle dinle.";
}

// ════════════════════════════════════════════════════════
// ANA ÜRETİCİ FONKSİYONLAR
// ════════════════════════════════════════════════════════

/** Özel filtreleme: Kategori bazlı kısıtlama yaparak alakasız clickbaitleri önler */
function filterTemplatesByMeal(tpl: string, meal: string): boolean {
  if (!meal) return true;
  const m = meal.toLowerCase();
  
  if (tpl.includes("Kaygı") || tpl.includes("endişe") || tpl.includes("😰")) {
    return ["kaygı", "endişe", "korku", "üzüntü", "hüzün", "keder", "sıkıntı", "darlık", "göğüs", "ferah", "kalp", "gönül", "ruh", "akıl", "nefis", "huzur", "ferahlık"].some(w => m.includes(w));
  }
  if (tpl.includes("Hamile") || tpl.includes("🤰")) {
    return ["gebe", "hamile", "çocuk", "evlat", "doğum", "bebek", "anne", "kadın", "rahim", "doğur", "nesil", "zürriyet"].some(w => m.includes(w));
  }
  if (tpl.includes("Kabir") || tpl.includes("⚰️") || tpl.includes("azap")) {
    return ["kabir", "ölüm", "ölü", "kıyamet", "azap", "cehennem", "toprak", "hesap", "kabre", "ölünce", "ahiret"].some(w => m.includes(w));
  }
  if (tpl.includes("Rızık") || tpl.includes("💰") || tpl.includes("bolluk")) {
    return ["rızık", "bolluk", "nimet", "para", "zengin", "mülk", "verdi", "besle", "harca", "rızıklandır", "infak"].some(w => m.includes(w));
  }
  if (tpl.includes("Nazar") || tpl.includes("🛡️") || tpl.includes("koruyan")) {
    return ["nazar", "koru", "sığın", "şer", "kötü", "şeytan", "vesvese", "hased", "haset", "koruyucu", "felak", "nas"].some(w => m.includes(w));
  }
  if (tpl.includes("Sabr") || tpl.includes("sabır") || tpl.includes("sabreyle")) {
    return ["sabır", "sabret", "sabreyle", "sıkıntı", "imtihan", "sabr", "sabreden"].some(w => m.includes(w));
  }
  if (tpl.includes("Kırık kalp") || tpl.includes("💔")) {
    return ["kalp", "gönül", "şifa", "üzüntü", "kırık", "hüzün", "ruh", "dert", "sıkıntı"].some(w => m.includes(w));
  }
  return true; 
}

/** Çok dilli başlık üretici — havuzdan rastgele seçer */
export function genTitle(surahName = "Bakara", s = 2, a = 255, lang = "tr", meal = ""): string {
  // ★ 03.10: {S} yer tutucusu seçili dilin sure adıyla doldurulur (ar/ur → Arapça ad)
  const gorunenAd = sureAdiCevir(surahName, s, lang);
  const basePool = [
    ...ayahMoodTitle(gorunenAd, s, a, lang),
    ...titlePool(lang),
    ...(EMOTIONAL_TITLE_TEMPLATES[lang] ?? EMOTIONAL_TITLE_TEMPLATES.en),
  ];
  
  // Meale sadık kalmak için filtre uyguluyoruz (TR meal metniyle anlam matching)
  let pool = basePool.filter(tpl => filterTemplatesByMeal(tpl, meal));
  if (pool.length === 0) pool = basePool; // Fallback
  
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return tpl.replace("{S}", gorunenAd).replace("{N}", String(s)).replace("{A}", String(a));
}

/** Çok dilli, zenginleştirilmiş açıklama üretici */
export function genDesc(
  surahName = "Bakara Suresi",
  s = 2,
  a = 255,
  reciterName = "Abdurrahman es-Sudays",
  lang = "tr",
): string {
  const introPool = DESC_INTRO[lang] ?? DESC_INTRO.en;
  const L = DESC_LABELS[lang] ?? DESC_LABELS.en;
  // ★ 03.10: intro'daki {S} da dilin sure adıyla doldurulur (ar/ur → Arapça ad)
  const gorunenAd = sureAdiCevir(surahName, s, lang);
  const intro = introPool[Math.floor(Math.random() * introPool.length)]
    .replace("{S}", gorunenAd)
    .replace("{N}", String(s))
    .replace("{A}", String(a));

  const emotionPool = DESC_EMOTIONAL_LINES[lang] ?? DESC_EMOTIONAL_LINES.en;
  const emotion = emotionPool[Math.floor(Math.random() * emotionPool.length)];
  const ayahMood = ayahMoodParagraph(surahName, s, a, lang);

  // ★ 03.10 (5 dil): hadis/CTA/promo artık seçili dilin havuzundan gelir —
  //   Arapça/Urduca açıklamada Türkçe hadis ve İngilizce CTA kalmaz.
  const hadisler = HADITH_POOL_BY_LANG[lang] ?? HADITH_POOL_BY_LANG.tr;
  const hadith = hadisler[Math.floor(Math.random() * hadisler.length)];

  const ctaHavuz = CTA_POOL_MULTI[lang] ?? CTA_POOL_EN;
  const cta = ctaHavuz[Math.floor(Math.random() * ctaHavuz.length)];

  const promoHavuz = PROMO_LINES_MULTI[lang] ?? PROMO_LINES_EN;
  const promo = promoHavuz[Math.floor(Math.random() * promoHavuz.length)];

  // ★ 03.10: sure-özel alıntı yalnız TR'de; diğer diller Al-İsra âyeti (dilin metni)
  const quote = lang === "tr"
    ? getQuoteForSurah(surahName, s, a)
    : L.quote;

  return `${L.studio}\n\n${intro}\n\n${L.reciter}: ${reciterName}\n\n${quote}\n\n${emotion}\n\n${ayahMood}\n\n━━━━━━━━━━━━━━━━━━\n\n${hadith}\n\n━━━━━━━━━━━━━━━━━━\n\n${cta}\n\n━━━━━━━━━━━━━━━━━━\n\n${promo}`;
}
