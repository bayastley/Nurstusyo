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
  HADITH_POOL,
  DESC_EMOTIONAL_LINES,
  CTA_POOL_TR,
  CTA_POOL_EN,
  PROMO_LINES,
  PROMO_LINES_EN,
} from "./titleData";

// Re-export data for backward compatibility (content.ts re-exports from here)
export { TITLE_TEMPLATES } from "./titleData";

// ════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ════════════════════════════════════════════════════════

/** Diğer diller İngilizce havuzu kullanır */
function titlePool(lang: string): string[] {
  return TITLE_TEMPLATES[lang] ?? TITLE_TEMPLATES.en;
}

/** Sureye göre özel başlık önerileri */
function ayahMoodTitle(surahName: string, s: number, a: number, lang: string): string[] {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  const tr = lang === "tr";
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
function ayahMoodParagraph(surahName: string, s: number, a: number, lang: string): string {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  if (lang !== "tr") {
    return "If this reminder touched your heart, like the video, leave an Ameen in the comments and share it with someone who may need this peace today. www.nurstudyo.com";
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

/** Çok dilli başlık üretici — havuzdan rastgele seçer */
export function genTitle(surahName = "Bakara", s = 2, a = 255, lang = "tr"): string {
  const pool = [
    ...ayahMoodTitle(surahName, s, a, lang),
    ...titlePool(lang),
    ...(EMOTIONAL_TITLE_TEMPLATES[lang] ?? EMOTIONAL_TITLE_TEMPLATES.en),
  ];
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return tpl.replace("{S}", surahName).replace("{N}", String(s)).replace("{A}", String(a));
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
  const intro = introPool[Math.floor(Math.random() * introPool.length)]
    .replace("{S}", surahName)
    .replace("{N}", String(s))
    .replace("{A}", String(a));

  const emotionPool = DESC_EMOTIONAL_LINES[lang] ?? DESC_EMOTIONAL_LINES.en;
  const emotion = emotionPool[Math.floor(Math.random() * emotionPool.length)];
  const ayahMood = ayahMoodParagraph(surahName, s, a, lang);

  const hadith = HADITH_POOL[Math.floor(Math.random() * HADITH_POOL.length)];

  const ctaPool = lang === "tr" ? CTA_POOL_TR : CTA_POOL_EN;
  const cta = ctaPool[Math.floor(Math.random() * ctaPool.length)];

  const promoPool = lang === "tr" ? PROMO_LINES : PROMO_LINES_EN;
  const promo = promoPool[Math.floor(Math.random() * promoPool.length)];

  const quote = lang === "tr"
    ? getQuoteForSurah(surahName, s, a)
    : L.quote;

  return `${L.studio}\n\n${intro}\n\n${L.reciter}: ${reciterName}\n\n${quote}\n\n${emotion}\n\n${ayahMood}\n\n━━━━━━━━━━━━━━━━━━\n\n${hadith}\n\n━━━━━━━━━━━━━━━━━━\n\n${cta}\n\n━━━━━━━━━━━━━━━━━━\n\n${promo}`;
}
