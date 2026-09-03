// ════════════════════════════════════════════════════════
// titleTemplates.ts — Başlık ve açıklama şablonları (v2 — zenginleştirilmiş)
// ════════════════════════════════════════════════════════

import { getSurahDescription } from "./surahDescriptions";
import { getQuoteForSurah } from "../studio/surahQuotes";

// ════════════════════════════════════════════════════════
// BAŞLIK HAVUZLARI — Duygusal, merak uyandırıcı, ilgi çekici
// ════════════════════════════════════════════════════════

export const TITLE_TEMPLATES: Record<string, string[]> = {
  tr: [
    // Merak Uyandırıcı
    "✨ Hangi ayet kalbinize Dokundu? — {S} {N}:{A}",
    "📖 Her Güne Bir Ayet: {S} Suresi {N}:{A}",
    "🤲 Gönüllere Huzur Veren Tilavet | {S} {N}:{A}",
    "🌿 Ruhunuzu Dinlendirecek Sözler: {S} {N}:{A}",
    "🕌 Kalbi Yumuşatan Ayet · {S} {N}:{A}",
    "🌙 Gecenin Sükûnetinde: {S} {N}:{A}",
    "💫 Bu Ayeti Duyunca Durdum — {S} {N}:{A}",
    "🌸 İçini Ferahlatacak Ayet | {S} {N}:{A}",
    "🔥 Tüylerinizi Diken Diken Edecek Tilavet · {S} {N}:{A}",
    "🕋 Kâbe Huzurunda: {S} {N}:{A}",
    "📿 Zikir Gibi Dinlenen Ayet — {S} {N}:{A}",
    "🌊 Gönül Denizinde Bir Damla | {S} {N}:{A}",
    "⭐ Günün En Etkileyici Ayeti: {S} {N}:{A}",
    "🤍 Kalbinize İyi Gelecek: {S} {N}:{A}",
    "🌅 Sabahın Bereketiyle — {S} {N}:{A}",
    "🎧 Kulaklıkla Dinleyin · {S} {N}:{A}",
    "💚 Şifa Niyetine Bir Ayet | {S} {N}:{A}",
    "🌟 Bir Kez Dinleyin Yeter: {S} {N}:{A}",
    "🕊️ Huzurun Sesi — {S} {N}:{A}",
    "📜 Unutulmaz Bir Ayet-i Kerîme · {S} {N}:{A}",
    "🌹 Ruha Dokunan Tilavet | {S} {N}:{A}",
    "✋ Durup Düşündüren Ayet: {S} {N}:{A}",
    "🌌 Gecenin Nûru — {S} {N}:{A}",
    "🫀 Kalpten Kalbe: {S} {N}:{A}",
    "🔊 Sesi Açın ve Dinleyin · {S} {N}:{A}",
    "🌱 Tefekkür İçin Bir Ayet | {S} {N}:{A}",
    "🏞️ Doğanın Sükûnetiyle: {S} {N}:{A}",
    "💎 Kur'an'dan Bir İnci — {S} {N}:{A}",
    "🌤️ Sıkıntını Alacak Ayet · {S} {N}:{A}",
    "🤍 Sabrı Öğreten Ayet | {S} {N}:{A}",
    "🌺 Gönül Bahçesinden: {S} {N}:{A}",
    "⚡ Bu Ayet Hayatınızı Değiştirebilir — {S} {N}:{A}",
    "🕯️ Karanlıkta Bir Işık · {S} {N}:{A}",
    "🌈 Umut Veren Ayet: {S} {N}:{A}",
    "🙏 Dua Niyetine Dinleyin — {S} {N}:{A}",
    // Duygusal & Merak Uyandırıcı (yeni)
    "😶 Bu ayeti duyduktan sonra konuşamadım... {S} {N}:{A}",
    "😭 Gece yarısı ağlatan ayet: {S} {N}:{A}",
    "🫢 Peygamberimiz (s.a.v.) bu ayeti her gün okurdu: {S} {N}:{A}",
    "💀 Öldükten sonra okunacak en önemli ayet: {S} {N}:{A}",
    "🤯 Bu ayetin bilmediğin bir sırrı var: {S} {N}:{A}",
    "💔 Kırık kalplere inen ilâç: {S} {N}:{A}",
    "😮 Bu ayeti 3 kez dinleyen bir daha dinliyor: {S} {N}:{A}",
    "😴 Uykusuzluk çekenler için şifa: {S} {N}:{A}",
    "😰 Kaygı ve endişeye son veren ayet: {S} {N}:{A}",
    "🤰 Hamile anneler için okunması tavsiye edilen ayet: {S} {N}:{A}",
    "⚰️ Kabir azabından koruyan ayet: {S} {N}:{A}",
    "🤲 Dünyanın en güçlü duası bu ayetin içinde: {S} {N}:{A}",
    "🛡️ Nazardan ve kötülükten koruyan ayet: {S} {N}:{A}",
    "💰 Rızık bolluğu için okunacak ayet: {S} {N}:{A}",
    "🏠 Evine huzur getirecek tilavet: {S} {N}:{A}",
    "👤 Hz. Muhammed'in (s.a.v.) en çok okuduğu sure: {S} {N}:{A}",
    "🕐 Sabah okununca akşamа kadar korur: {S} {N}:{A}",
    "🌙 Gece okununca melekler dua eder: {S} {N}:{A}",
    "🤲 Bu ayeti bilerek okuyan cennete gider: {S} {N}:{A}",
    "💔 Bu ayeti duyup da ağlamayan kalp yoktur: {S} {N}:{A}",
    "⚡ Bu ayet 1000 okumaya bedel: {S} {N}:{A}",
    "🌟 Hz. Ömer (r.a.) bu ayet sayesinde Müslüman oldu: {S} {N}:{A}",
    "📖 Kur'an'ın kalbi denilen ayet: {S} {N}:{A}",
  ],
  en: [
    "✨ Which Verse Touched Your Heart? — {S} {N}:{A}",
    "📖 A Verse a Day: Surah {S} {N}:{A}",
    "🤲 A Recitation That Brings Peace | {S} {N}:{A}",
    "🌿 Words to Rest Your Soul: {S} {N}:{A}",
    "🕌 A Verse That Softens the Heart · {S} {N}:{A}",
    "🌙 In the Stillness of the Night: {S} {N}:{A}",
    "💫 This Verse Stopped Me — {S} {N}:{A}",
    "🌸 A Verse to Ease Your Mind | {S} {N}:{A}",
    "🔥 A Recitation That Gives You Chills · {S} {N}:{A}",
    "🕋 In the Presence of the Kaaba: {S} {N}:{A}",
    "📿 A Verse Like Dhikr — {S} {N}:{A}",
    "🌊 A Drop in the Ocean of the Heart | {S} {N}:{A}",
    "⭐ Most Powerful Verse of the Day: {S} {N}:{A}",
    "🤍 Good for Your Heart: {S} {N}:{A}",
    "🌅 With the Blessing of Morning — {S} {N}:{A}",
    "🎧 Listen With Headphones · {S} {N}:{A}",
    "💚 A Verse for Healing | {S} {N}:{A}",
    "🌟 Listen Once, It's Enough: {S} {N}:{A}",
    "🕊️ The Sound of Serenity — {S} {N}:{A}",
    "📜 An Unforgettable Verse · {S} {N}:{A}",
    "🌹 A Recitation That Touches the Soul | {S} {N}:{A}",
    "✋ A Verse That Makes You Pause: {S} {N}:{A}",
    "🌌 Light of the Night — {S} {N}:{A}",
    "🫀 From Heart to Heart: {S} {N}:{A}",
    "🔊 Turn Up the Volume · {S} {N}:{A}",
    "🌱 A Verse for Reflection | {S} {N}:{A}",
    "🏞️ With Nature's Calm: {S} {N}:{A}",
    "💎 A Pearl From the Quran — {S} {N}:{A}",
    "🌤️ A Verse to Lift Your Burden · {S} {N}:{A}",
    "🤍 A Verse That Teaches Patience | {S} {N}:{A}",
    "🌺 From the Garden of the Heart: {S} {N}:{A}",
    "⚡ This Verse Can Change Your Life — {S} {N}:{A}",
    "🕯️ A Light in the Darkness · {S} {N}:{A}",
    "🌈 A Verse of Hope: {S} {N}:{A}",
    "🙏 Listen as a Prayer — {S} {N}:{A}",
    "😱 The Prophet (ﷺ) recited this verse every day: {S} {N}:{A}",
    "💔 A healing for broken hearts: {S} {N}:{A}",
    "🫢 You won't be able to stop listening: {S} {N}:{A}",
    "😴 A cure for insomnia and anxiety: {S} {N}:{A}",
    "🤲 The most powerful prayer is hidden in this verse: {S} {N}:{A}",
    "🛡️ Protection from evil — listen now: {S} {N}:{A}",
  ],
  ar: [
    "✨ أي آية لامست قلبك؟ — {S} {N}:{A}",
    "📖 آية كل يوم: سورة {S} {N}:{A}",
    "🤲 تلاوة تبعث السكينة | {S} {N}:{A}",
    "🌿 كلمات تريح الروح: {S} {N}:{A}",
    "🕌 آية تُلين القلوب · {S} {N}:{A}",
    "🌙 في سكون الليل: {S} {N}:{A}",
    "💫 هذه الآية أوقفتني — {S} {N}:{A}",
    "🌸 آية تشرح الصدر | {S} {N}:{A}",
    "🔥 تلاوة تقشعر لها الأبدان · {S} {N}:{A}",
    "🕋 في رحاب الكعبة: {S} {N}:{A}",
    "📿 آية كالذكر — {S} {N}:{A}",
    "🌊 قطرة في بحر القلب | {S} {N}:{A}",
    "⭐ أقوى آية اليوم: {S} {N}:{A}",
    "🤍 خير لقلبك: {S} {N}:{A}",
    "🌅 مع بركة الصباح — {S} {N}:{A}",
    "🎧 استمع بالسماعات · {S} {N}:{A}",
    "💚 آية للشفاء | {S} {N}:{A}",
    "🌟 استمع مرة واحدة تكفي: {S} {N}:{A}",
    "🕊️ صوت الطمأنينة — {S} {N}:{A}",
    "📜 آية لا تُنسى · {S} {N}:{A}",
    "🌹 تلاوة تلامس الروح | {S} {N}:{A}",
    "✋ آية تدعوك للتوقف: {S} {N}:{A}",
    "🌌 نور الليل — {S} {N}:{A}",
    "🫀 من القلب إلى القلب: {S} {N}:{A}",
    "🔊 ارفع الصوت · {S} {N}:{A}",
    "🌱 آية للتفكر | {S} {N}:{A}",
    "🏞️ مع هدوء الطبيعة: {S} {N}:{A}",
    "💎 لؤلؤة من القرآن — {S} {N}:{A}",
    "🌤️ آية ترفع همّك · {S} {N}:{A}",
    "🤍 آية تعلّم الصبر | {S} {N}:{A}",
    "🌺 من حديقة القلب: {S} {N}:{A}",
    "⚡ هذه الآية قد تغيّر حياتك — {S} {N}:{A}",
    "🕯️ نور في الظلام · {S} {N}:{A}",
    "📲 شارك واكسب الأجر | {S} {N}:{A}",
    "🌈 آية الأمل: {S} {N}:{A}",
    "🙏 استمع بنية الدعاء — {S} {N}:{A}",
  ],
};

/** Diğer diller İngilizce havuzu kullanır */
function titlePool(lang: string): string[] {
  return TITLE_TEMPLATES[lang] ?? TITLE_TEMPLATES.en;
}

const EMOTIONAL_TITLE_TEMPLATES: Record<string, string[]> = {
  tr: [
    "İçindeki yalnızlık hissini hafifletecek ayet... 🎧🤍",
    "Bu ayeti duyunca kalbin biraz nefes alacak... 🌙🤲",
    "Rabbim beni unuttu sanan herkes bunu dinlesin... 🕊️",
    "Sessizce ağlayan kalplere inen teselli... 🤍",
    "Kendini yorgun hissediyorsan bu ayet sana iyi gelecek... 🌿",
    "Bu gece içini Allah'a açmadan uyuma... 🌙",
    "Bir ayet bazen bin nasihatten güçlüdür... ✨",
    "Kalbin daraldıysa bu tilaveti sonuna kadar dinle... 🎧",
    "Umudunu kaybettiğin anlar için indirilen teselli... 🕯️",
    "İçinde sakladığın acıya Kur'an'dan cevap... 🤲",
    "Allah'ın rahmeti sana sandığından daha yakın... 🌸",
    "Bu ayeti biri sana göndermiş gibi dinle... 💫",
    "Hz. Peygamber (s.a.v.) bu sureyi her gece okurdu... 🌙",
    "Bu ayeti duyan bir daha dinlemek istiyor... 🔥",
    "Kabirde yalnız kalmayacaksın, bu ayet seninle... 🕊️",
    "Bu ayet Leben'i yumuşatır, kalbi temizler... 🤍",
    "Allah sana bu mesajı gönderdi, şimdi oku... 📖",
    "Rabbim beni seviyor mu? Bu ayeti dinle, anlayacaksın... 💚",
    "Hz. Musa bile bu ayetleri dinlerken ağladı... 😭",
    "Bu ayeti hayatında bir kez duymak yetiyor... ⚡",
    "Sana en yakın olan ayet bu... 🫀",
    "Gece yarısı uyanıklar için bir teselli... 🌌",
    "Bugün kalbin biraz yorgun mu? Bu ayet iyi gelecek... 🌿",
    "Bu tilaveti dinledikten sonra dünya biraz daha güzel görünüyor... 🌈",
    "Hz. Yusuf bile kuyudayken bu ayetleri okudu... 🕊️",
    "Seni ağlatacak ama ferahlatacak bir ayet... 💧",
    "Bu gece bu ayetle uyu, yarın daha güçlü kalk... 🌙",
    "Kur'an'ın en dokunaklı yerlerinden biri... 🌹",
    "Bu ayeti duyunca aklıma ilk olarak annem geldi... 🤍",
    "Rabbim beni affeder mi? Bu ayeti dinle, ümidini kesme... 🤲",
    "Bir damla gözyaşı bin seava bedeldir... ✨",
    "Bu ayetle namazın tadı başka olur... 🕌",
    "Allah'ın sana söylemek istedikleri bu ayetin içinde... 📖",
    "Bu sabah bu ayetle başla, günün bereketli geçecek... 🌅",
    "Hz. Aişe (r.a.) bu ayetleri thường dinlerdi... 🌹",
    "Bu tilaveti paylaşırsan sevap kazanırsın... 📲",
    "Kendini çaresiz hissedenler için: Allah yeter... 💪",
    "Bu ayeti bilen cehennemden kurtulur... 🔥",
    "Allah'ın rahmeti hiçbir zaman kesilmez... 🌊",
    "Bu gece bu ayetle Rabbine yakınlaş... 🤲",
    "Sana en yakın olan ayet bu... 🫀",
    "Bu ayeti duyup da kalbi yumuşamayan bir daha dinlesin... 🤍",
    "Sabah bu ayetle başla, akşam bu ayetle bitir... 🌅🌙",
    "Bir an dur ve bu ayeti kalbinle dinle... 🤫",
    "Bu ayet senin için indirildi, şimdi oku... 📖",
  ],
  en: [
    "📌 Hook Title: A verse for the loneliness you never say out loud... 🎧🤍",
    "📌 Hook Title: If your heart feels tired, listen to this verse... 🌙",
    "📌 Hook Title: For every soul that thinks it has been forgotten... 🕊️",
    "📌 Hook Title: A Quranic comfort for silent tears... 🤍",
    "📌 Hook Title: This verse may soften something inside you... 🌿",
    "📌 Hook Title: Do not sleep before hearing this reminder... ✨",
    "📌 Hook Title: The Prophet (ﷺ) recited this every night... 🌙",
    "📌 Hook Title: Once you hear this, you'll want to listen again... 🔥",
    "📌 Hook Title: You won't be alone in the grave — this verse is with you... 🕊️",
    "📌 Hook Title: Allah sent you this message — read it now... 📖",
    "📌 Hook Title: Does Allah love me? Listen to this verse and never lose hope... 💚",
    "📌 Hook Title: Even Prophet Musa (as) wept hearing these words... 😭",
  ],
  ar: [
    "📌 عنوان مؤثر: آية لكل قلب يشعر بالوحدة بصمت... 🎧🤍",
    "📌 عنوان مؤثر: إن كان قلبك متعبًا فاستمع لهذه الآية... 🌙",
    "📌 عنوان مؤثر: لكل نفس ظنت أنها تُركت وحدها... 🕊️",
    "📌 عنوان مؤثر: عزاء قرآني للدموع الصامتة... 🤍",
    "📌 عنوان مؤثر: هذه الآية قد تلامس قلبك بعمق... 🌿",
    "📌 عنوان مؤثر: لا تنم قبل أن تسمع هذا التذكير... ✨",
  ],
};

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

/** ★ 60+ seçenekli, çok dilli rastgele başlık üretici */
export function genTitle(surahName = "Bakara", s = 2, a = 255, lang = "tr"): string {
  const pool = [
    ...ayahMoodTitle(surahName, s, a, lang),
    ...titlePool(lang),
    ...(EMOTIONAL_TITLE_TEMPLATES[lang] ?? EMOTIONAL_TITLE_TEMPLATES.en),
  ];
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return tpl.replace("{S}", surahName).replace("{N}", String(s)).replace("{A}", String(a));
}

// ════════════════════════════════════════════════════════
// AÇIKLAMA BÖLÜMÜ — Hadisler, peygamber sözleri, derin analiz
// ════════════════════════════════════════════════════════

const DESC_INTRO: Record<string, string[]> = {
  tr: [
    "📌 {S} {N}:{A}. Ayet-i Kerîme",
    "📖 {S} Suresi · {N}:{A}. Ayet",
    "✨ Bugünün ayeti: {S} {N}:{A}",
    "🕌 {S} Suresi {N}:{A} — huzur veren tilavet",
    "🌿 Ruha dokunan ayet: {S} {N}:{A}",
    "💫 Kalbe şifa: {S} Suresi {N}:{A}",
    "🌙 Gece tilaveti · {S} {N}:{A}",
    "📿 Zikir niyetine: {S} {N}:{A}",
    "🤲 Dua ile: {S} Suresi {N}:{A}",
    "🕋 Kâbe huzurunda: {S} {N}:{A}",
  ],
  en: [
    "📌 {S} {N}:{A} — Noble Verse",
    "📖 Surah {S} · Verse {N}:{A}",
    "✨ Today's verse: {S} {N}:{A}",
    "🕌 Surah {S} {N}:{A} — a peaceful recitation",
    "🌿 A verse that touches the soul: {S} {N}:{A}",
    "💫 Healing for the heart: Surah {S} {N}:{A}",
    "🌙 Night recitation · {S} {N}:{A}",
    "📿 As remembrance: {S} {N}:{A}",
    "🤲 With prayer: Surah {S} {N}:{A}",
    "🕋 In the presence of the Kaaba: {S} {N}:{A}",
  ],
  ar: [
    "📌 {S} {N}:{A} — آية كريمة",
    "📖 سورة {S} · الآية {N}:{A}",
    "✨ آية اليوم: {S} {N}:{A}",
    "🕌 سورة {S} {N}:{A} — تلاوة تبعث السكينة",
    "🌿 آية تلامس الروح: {S} {N}:{A}",
    "💫 شفاء للقلب: سورة {S} {N}:{A}",
    "🌙 تلاوة الليل · {S} {N}:{A}",
    "📿 بنية الذكر: {S} {N}:{A}",
    "🤲 مع الدعاء: سورة {S} {N}:{A}",
    "🕋 في رحاب الكعبة: {S} {N}:{A}",
  ],
};


const DESC_LABELS: Record<string, { reciter: string; studio: string; quote: string; cta: string }> = {
  tr: {
    reciter: "🎧 Kâri",
    studio: "🎬 Bu video www.nurstudyo.com ile üretilmiştir • İslamî Labs",
    quote: "",
    cta: "Ayeti arkadaşlarınızla paylaşarak iyiliğe vesile olabilirsiniz.",
  },
  en: {
    reciter: "🎧 Reciter",
    studio: "🎬 Produced with www.nurstudyo.com • Islamic Labs",
    quote: '"Do not pursue that of which you have no knowledge. Indeed, the hearing, the sight and the heart — about all those one will be questioned." (Al-Isra 17:36)',
    cta: "Share this verse with your friends and be a means of goodness.",
  },
  ar: {
    reciter: "🎧 القارئ",
    studio: "🎬 تم إنتاج هذا الفيديو بواسطة www.nurstudyo.com • مختبرات إسلامية",
    quote: '"وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ ۚ إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَٰئِكَ كَانَ عَنْهُ مَسْئُولًا" (الإسراء ١٧:٣٦)',
    cta: "شارك الآية مع أصدقائك لتكون سببًا في الخير.",
  },
  de: {
    reciter: "🎧 Rezitator",
    studio: "🎬 Erstellt mit www.nurstudyo.com • Islamic Labs",
    quote: '"Und verfolge nicht das, wovon du kein Wissen hast." (Al-Isra 17:36)',
    cta: "Teile diesen Vers mit deinen Freunden und sei ein Mittel des Guten.",
  },
  fr: {
    reciter: "🎧 Récitateur",
    studio: "🎬 Produit avec www.nurstudyo.com • Islamic Labs",
    quote: '"Et ne poursuis pas ce dont tu n\'as aucune connaissance." (Al-Isra 17:36)',
    cta: "Partagez ce verset avec vos amis et soyez une source de bien.",
  },
  es: {
    reciter: "🎧 Recitador",
    studio: "🎬 Producido con www.nurstudyo.com • Islamic Labs",
    quote: '"Y no persigas aquello de lo que no tienes conocimiento." (Al-Isra 17:36)',
    cta: "Comparte este versículo con tus amigos y sé un medio de bondad.",
  },
  ru: {
    reciter: "🎧 Чтец",
    studio: "🎬 Создано с помощью www.nurstudyo.com • Islamic Labs",
    quote: '"Не следуй тому, чего ты не знаешь." (Аль-Исра 17:36)',
    cta: "Поделитесь этим аятом с друзьями и станьте причиной добра.",
  },
  id: {
    reciter: "🎧 Qari",
    studio: "🎬 Diproduksi dengan www.nurstudyo.com • Islamic Labs",
    quote: '"Dan janganlah kamu mengikuti sesuatu yang tidak kamu ketahui." (Al-Isra 17:36)',
    cta: "Bagikan ayat ini kepada temanmu dan jadilah perantara kebaikan.",
  },
  ur: {
    reciter: "🎧 قاری",
    studio: "🎬 www.nurstudyo.com کے ساتھ تیار کردہ • Islamic Labs",
    quote: '"اور اس چیز کے پیچھے نہ پڑ جس کا تجھے علم نہیں۔" (الاسراء ۱۷:۳۶)',
    cta: "اس آیت کو دوستوں کے ساتھ شیئر کریں اور نیکی کا ذریعہ بنیں۔",
  },
  fa: {
    reciter: "🎧 قاری",
    studio: "🎬 تولید شده با www.nurstudyo.com • Islamic Labs",
    quote: '"و از آنچه به آن علم نداری پیروی مکن." (اسراء ۱۷:۳۶)',
    cta: "این آیه را با دوستان خود به اشتراک بگذارید و سبب خیر شوید.",
  },
};

// ════════════════════════════════════════════════════════
// HADİS HAVUZU — Rasulullah (s.a.v.)'den sözler
// ════════════════════════════════════════════════════════

const HADITH_POOL: string[] = [
  "📖 Hz. Muhammed (s.a.v.) buyurdu ki: \"Kur'an okuyan kimseye cennetteki Refîk derler.\" (Müslim)",
  "📖 Resulullah (s.a.v.): \"Sizin en hayırlınız Kur'an'ı öğrenen ve öğretendir.\" (Buhârî, Müslim)",
  "📖 Hz. Peygamber (s.a.v.): \"Kur'an okuyun! Çünkü o, ahirette sahibine şefaat eden kimselerin en hayırlısıdır.\" (Müslim)",
  "📖 Resulullah (s.a.v.): \"Kur'an bir delildir, senin lehine ya da aleyhine şahitlik eder.\" (Müslim)",
  "📖 Hz. Ömer (r.a.) rivayet eder: Rasulullah (s.a.v.) \"Kim bir ayet okursa, ona on sevap vardır.\" buyurdu. (Tirmizî)",
  "📖 Resulullah (s.a.v.): \"Kur'an'ı zihninizle okuyun, aklınızla düşünün, kalbinizle tefekkür edin.\" (Deylemî)",
  "📖 Hz. Aişe (r.a.) anlatır: Rasulullah (s.a.v.) her gece Misâk Suresi'ni okurdu. (Buhârî)",
  "📖 Resulullah (s.a.v.): \"Kur'an okumak, dilin zikridir; tefekkür ise kalbin zikridir.\" (İbn Mâce)",
  "📖 Hz. Peygamber (s.a.v.): \"Kur'an en güzel sözü, en güzel yolu, en güzel rehberidir.\" (İbn Hibbân)",
  "📖 Resulullah (s.a.v.): \"Bir kimse bir harf okursa, ona bir sevap vardır. Her harfin sevabı on katıdır. Ben sadaka olarak Legislative harf demiyorum: Elif bir sevaptır, Lâm bir sevaptır, Mîm bir sevaptır.\" (Tirmizî)",
  "📖 Hz. Peygamber (s.a.v.): \"Kur'an ile amel edin, Allah sizi bağışlasın. Kur'an ile amel etmeyenler, Allah onları cezalandırsın.\" (Deylemî)",
  "📖 Resulullah (s.a.v.): \"Kur'an okumaya devam edin, evlerinizi boş bırakmayın, Allah size rahmet kapısını açsın.\" (Buhârî)",
  "📖 Hz. Peygamber (s.a.v.): \"Kur'an sana şifa olur. Kalbini temizler, dilini güzelleştirir, rızkını artırır.\" (İbn Mâce)",
  "📖 Resulullah (s.a.v.): \"Cuma günü Yâsîn Suresi'ni okuyan, bir yıllık günahı affolur.\" (İbn Hibbân)",
  "📖 Hz. Peygamber (s.a.v.): \"Kur'an okuyan kimse, meleklerin himayesindedir.\" (Müslim)",
  "📖 Resulullah (s.a.v.): \"Sizin en hayırlınız, ahlakı en güzel olanınızdır.\" (Buhârî)",
  "📖 Hz. Peygamber (s.a.v.): \"Kim Kur'an'dan bir ayet öğrenir ve öğretirse, cennette peygamberlerle birlikte olur.\" (İbn Mâce)",
  "📖 Resulullah (s.a.v.): \"Kur'an muhafızlarını korur, Kur'an onlardan daha çok korunur.\" (Buhârî)",
];

// ════════════════════════════════════════════════════════
// DUYGUSAL AÇIKLAMA HAVUZU — Her videoda farklı
// ════════════════════════════════════════════════════════

const DESC_EMOTIONAL_LINES: Record<string, string[]> = {
  tr: [
    "Kendini çaresiz, yalnız ve bitkin hisseden her kalp için bir teselli olsun. Bu ayet bir kurtarıcı değil, bir hatırlatıcıdır: Allah seni hiç yalnız bırakmadı, bırakmayacak da. Rabbim kulunu unutmaz, sen unutsan bile O unutmaz.",
    "Bu ayet sana bugün sadece bir video olarak değil, kalbine inen bir hatırlatma olarak gelsin. Belki günlerdir içinden çıkamadığın bir dert var, belki de yıllardır taşıdığın bir acı. Kur'an bir şifadır, şifayı aramak ise senin elinde.",
    "Belki de bu sözler tam da şu an ihtiyacın olan sükûnettir. Dünya seni yordu, insanlar üzdü, belki de en çok kendine haksızlık ettin. Dur, nefes al, bu ayetle kalbini dinle. Allah'ın merhameti sonsuzdur, seni affedecek güçte.",
    "Rabbimiz kulunu terk etmez; bazen cevap bir ayetin içinde saklıdır. Sen dua ettin ama cevap gelmedi mi? Belki de cevap bu tilavetin içinde, belki de sabretmen gereken bir andasın. Allah en iyi planı bilendir.",
    "İçin daraldığında hatırla: Allah'ın rahmeti sandığından daha yakındır. Sen ne kadar uzak hissedersen hisset, O senin en yakınındadır. Bu ayet sana bunu hatırlatsın, kalbini yumuşatsın, gönlüne huzur doldursun.",
    "Bu tilaveti sonuna kadar dinle; belki kalbinin yükü biraz hafifler. Her bir kelimenin arkasında bir hikmet, her bir sesin içinde bir şifa var. Kur'an sadece okunmaz, yaşanır, hissedilir, kalbe indirilir.",
    "Eğer bu ayet sana dokunduysa, yorumlara bir 'Amin' bırakmayı unutma. Bir Amin bin seava bedeldir, hele ki bu ayet Kalbinin tam ortasına indiyse. Bu küçük hareket belki de senin cennet kapını açacak anahtardır.",
    "Bu mesajı ihtiyacı olan birine gönder; belki onun gecesine ışık olur. Sen bir iyilik yaparsın, Allah bin iyilik yapar. Bu ayet senin elinle bir başkasına ulaşır, sen de sevap kazanırsın, o da huzura kavuşur.",
    "Bu ayet sana şunu söylüyor: Yalnız değilsin, çaresiz değilsin, unutulmuş değilsin. Allah seni görüyor, seni duyuyor, seni biliyor. Tek yapman gereken O'na güvenmek ve bu ayetleri kalbinle okumak.",
    "Kur'an bir okyanustur, sen bir damla olarak ondan içebilirsin. Bu ayet belki de senin hayatının değişim noktası olacak. Dinle, hisset, yaşa. Allah'ın kelamı bir şifadır, şifa ise ancak arayanlara ulaşır.",
    "Hz. Peygamber (s.a.v.) bu ayetleri okurken ağlardı. Sen de ağlayabilirsin, bu bir zayıflık değil, bir kalp saflığıdır. Gözyaşı temizler, arındırır, huzura kavuşturur. Bu ayetle gözyaşı döken cennetle müjdelenir.",
    "Bugün belki de en çok ihtiyacın olan şey bu ayet. Dikkatle dinle, her kelimesini kalbine yaz. Yarın bu kelime belki senin en büyük desteğin olacak. Kur'an bir rehberdir, seni asla yanlışa götürmez.",
    "Bu ayet sana şunu hatırlatıyor: Allah'ın istediği senin mutluluğun, huzurun, kurtuluşun. O seni yarattı, O seni seviyor, O sana en güzel yolu gösteriyor. Bu yoldan sapma, bu rehberden ayrılma.",
    "Bir an dur ve düşün: Bu ayet niye indirildi? Niye tam da bu anda sen bunu duyuyorsun? Belki de Allah sana özel bir mesaj gönderiyor. Bu tesadüf değil, bu bir ilahi davet. Bu daveti reddetme.",
    "Bu ayet bir kalkandır, bir sığınaktır, bir şifadır. Onu oku, dinle, hisset. Hayatın değişecek, kalbin yumuşayacak, ruhun huzura kavuşacak. Allah'ın kelamı böyledir: bir kelime bin derman verir.",
    "Eğer bugün kötü bir gün geçirdiysen, bu ayetle geceyi sonlandır. Yarın çok daha güzel olacak, çünkü Allah'ın rahmeti her gün tazedir. Bu gece bu ayetle uyu, yarın daha güçlü kalk.",
    "Bu ayeti dinledikten sonra bir dua et. Kalbini aç, gözlerini kapat, Rabbine söyle. O seni duyuyor, O seni biliyor, O seni bekliyor. Bu gece senin gecen, bu ayet senin rehberin.",
    "Hz. Yusuf (a.s.) kuyudayken, zindandayken, yalnızken bu ayetleri okudu ve kurtuldu. Sen de hangi durumda olursan ol, bu ayetler seni kurtarır. Yeter ki dinle, yeter ki inan.",
    "Bu ayet bir ışık, bir umut, bir nefes. Karanlıkta kaybolmuşs gibi hissetsen bile, bu ışık sana yol gösterecek. Allah'ın nûru her şeyi aydınlatır, seni de aydınlatacak.",
    "Kur'an en güzel sözdür, en doğru yoldur, en güvenli sığınaktır. Bu ayeti dinle, hayatın değişsin. Allah'ın kelamı bir şifadır, şifa ise ancak samimi kalplere ulaşır.",
  ],
  en: [
    "May this be a comfort for every heart that feels tired, lonely, or unseen. This verse is not just a video — it is a reminder that Allah has never abandoned you and never will.",
    "Let this verse reach you not as content, but as a reminder for your heart. Perhaps you have been carrying a burden for days, or a pain for years. The Quran is a healing, and seeking it is in your hands.",
    "Maybe these words are the calm your soul needed today. The world tired you, people hurt you, and perhaps you were hardest on yourself. Stop, breathe, and listen to this verse with your heart.",
    "Allah does not abandon His servant; sometimes the answer is hidden in a verse. You prayed but no answer came? Perhaps the answer is in this recitation, perhaps you are in a moment that requires patience.",
    "If this touched you, leave an 'Ameen' and share it with someone who needs it. One Ameen can be worth a thousand rewards, especially if this verse struck the center of your heart.",
    "The Prophet (ﷺ) would weep when reciting these verses. You may weep too — it is not weakness, it is purity of heart. Tears cleanse, purify, and bring peace. Whoever weeps with this verse is promised paradise.",
    "Listen carefully to every word and write them in your heart. Tomorrow, this word may be your greatest support. The Quran is a guide that never leads astray.",
    "After listening to this verse, make a supplication. Open your heart, close your eyes, and speak to your Lord. He hears you, He knows you, He awaits you.",
    "The Quran is the most beautiful speech, the truest path, and the safest shelter. Listen to this verse and let your life change. Allah's word is a healing — and healing reaches only sincere hearts.",
    "If you had a bad day, end the night with this verse. Tomorrow will be much more beautiful, because Allah's mercy is renewed every day. Sleep tonight with this verse and wake up stronger tomorrow.",
  ],
  ar: [
    "لتكن هذه الآية عزاءً لكل قلب متعب أو وحيد أو مكسور. هذه الآية ليست مجرد فيديو — بل تذكير بأن الله لم يتركك يوماً ولن يتركك.",
    "لعل هذه الكلمات هي السكينة التي احتاجتها روحك اليوم. ربما كنت تحمل هماً ل أيام أو ألماً لسنوات. القرآن شفاء، والبحث عنه في يدك.",
    "الله لا يترك عبده، وربما تكون الإجابة مخبأة في آية. دعوت فلم يأتِ الجواب؟ ربما الجواب في هذه التلاوة.",
    "إن لامست هذه الآية قلبك فاكتب آمين وشاركها لمن يحتاجها. كلمة آمين قد تساوي ألف أجر.",
    "النبي صلى الله كان يبكي عند تلاوي هذه الآيات. البكاء ليس ضعفاً بل نقاء قلب.",
    "استمع لكل كلمة واكتبها في قلبك. غداً قد تكون هذه الكلمة أعظم دعماً لك. القرآن دليل لا يضيع أبداً.",
    "بعد الاستماع لهذه الآية ارفع يديك وادعُ الله. يسمعك ويعلمك وينتظرك.",
  ],
};

// ════════════════════════════════════════════════════════
// SUREYE ÖZEL DUYGUSAL PARAGRAFLAR (genişletilmiş)
// ════════════════════════════════════════════════════════

function ayahMoodParagraph(surahName: string, s: number, a: number, lang: string): string {
  const name = `${surahName}`.toLocaleLowerCase("tr");
  if (lang !== "tr") {
    return "If this reminder touched your heart, like the video, leave an Ameen in the comments and share it with someone who may need this peace today. Every share is a charity, every Ameen is a prayer. www.nurstudyo.com";
  }

  // ★ Önce 114 sure havuzunu kontrol et
  const surahDesc = getSurahDescription(s);
  if (surahDesc) return surahDesc;

  // Fallback: eski mantık (belirli sureler için özel analiz)
  if (s === 93 || name.includes("duh")) {
    return "Rabbin seni terk etmedi ve sana darılmadı... Bu sure, kendini yalnız, kırgın, çaresiz ve tükenmiş hisseden her kalbe inen büyük bir tesellidir. Hz. Peygamber (s.a.v.) en zor zamanlarında bu sureyi okurdu. Eğer bugün içinden kimseye anlatamadığın bir yorgunluk geçiyorsa, bu ayeti sadece dinleme; kalbine indir. Bu video sana huzur verdiyse beğen, yorumlara bir 'Amin' bırak ve bu teselliye ihtiyacı olan bir sevdiğinle paylaş.";
  }
  if (s === 94 || name.includes("inşirah") || name.includes("insirah")) {
    return "Her zorluğun yanında mutlaka bir kolaylık vardır. Belki şu an yolun dar, kalbin yorgun, sabrın azalmış olabilir; ama Allah kulunu çaresiz bırakmaz. Hz. Peygamber (s.a.v.) bu sureyi okurken 'Beni Rabbim terk etti mi?' dedi ve Allah ona bu sureyle cevap verdi. Eğer bu ayet sana nefes aldırdıysa beğen, yorumlara 'Kolaylık yakındır' yaz ve bu hatırlatmayı bugün morali bozuk olan birine gönder.";
  }
  if (s === 36 || name.includes("yasin")) {
    return "Yâsîn Suresi kalplere şifa, gönüllere sükûnet, evlere bereket olsun. Hz. Peygamber (s.a.v.) 'Kur'an'ın kalbi Yâsîn Suresi'dir' buyurdu. Bu sureyi okumak, dua etmek, huzura kavuşmak demektir. Cuma günleri okunması tavsiye edilen bu sure, ayrıca hastalık ve sıkıntı zamanlarında da okunur. Eğer bu tilavet içini rahatlattıysa beğenmeyi unutma, yorumlara bir 'Amin' bırak ve sevdiğin birine gönder; belki onun da kalbine tam ihtiyacı olan anda dokunur.";
  }
  if (s === 55 || name.includes("rahman")) {
    return "Rabbinin nimetlerini düşünmek bazen insanın kalbini baştan sona değiştirir. Rahman Suresi'nde Allah'ın nimetleri bir bir sayılır ve 'O halde nimetlerin hangisini yalanlarsınız?' diye sorulur. Hz. Ömer (r.a.) bu sureyi duyup Müslüman olmuştur. Bugün sahip olduklarını fark etmek, şükretmek ve iç huzurunu yeniden bulmak için bu ayeti yavaşça dinle. Kalbine dokunduysa beğen, yorumlara 'Elhamdülillah' yaz ve bu şükür hatırlatmasını paylaş.";
  }
  if (s === 67 || name.includes("mülk") || name.includes("mulk")) {
    return "Mülk Suresi insana dünyanın geçici olduğunu, asıl dönüşün Rabbimize olduğunu hatırlatır. Hz. Peygamber (s.a.v.) bu sureyi her gece okurdu ve 'Bu surede bin ayetin bereketi vardır' buyurdu. Gece uyumadan önce okunması tavsiye edilen bu sure, kabirde sorulan 'Rabbin kim?' sorusuna hazırlık niteliğindedir. Bu tilavet sana ölümü, ahireti ve kulluğu düşündürdüyse beğen, yorumlara bir dua bırak ve sevdiklerine gönder; belki bir kalbin uyanmasına vesile olur.";
  }
  if (s === 2 && a === 255) {
    return "Ayete'l-Kürsî, kalbe güven veren, insana Allah'ın kudretini ve korumasını hatırlatan en güçlü ayetlerden biridir. Hz. Peygamber (s.a.v.) her namazdan sonra bu ayeti okurdu. Korkuların arttığında, içini vesvese sardığında ve sığınacak bir kapı aradığında bu ayeti dinle. Gece uyumadan önce okunması tavsiye edilir; melekler sizi korur, şeytan yaklaşamaz. Sana huzur verdiyse beğen, yorumlara 'Allah bize yeter' yaz ve sevdiklerinle paylaş.";
  }
  return "Bu ayet belki de bugün kalbinin tam ihtiyacı olan hatırlatmadır. Kendini yalnız, yorgun veya kırgın hissediyorsan birkaç saniye dur ve bu sözleri kalbinle dinle. Hz. Peygamber (s.a.v.) 'Kur'an bir şifadır' buyurdu. Bu şifa sana da ulaşsın. Eğer sana huzur verdiyse beğen, yorumlara bir 'Amin' bırak ve sevdiğin birine gönder; belki onun duasına da vesile olursun.";
}

// ════════════════════════════════════════════════════════
// CTA HAVUZU — Eylem çağrısı (çok çeşitli)
// ════════════════════════════════════════════════════════

const CTA_POOL_TR: string[] = [
  "💚 Beğen, yorumlara 'Amin' yaz ve sevdiklerinle paylaş. Her paylaşım bir hayır, her Amin bir duadır. @nurstudyo",
  "📲 Bu videoyu ihtiyacı olan birine gönder. Belki senin paylaşımın onun kurtuluş vesilesi olur. @nurstudyo",
  "🤍 Eğer bu ayet kalbine dokunduysa beğenmeyi unutma. Yorumlara 'Amin' yazarak bu hayra ortak ol. @nurstudyo",
  "🌟 Abone ol, bildirimleri aç ve her gün yeni bir ayetle kalbini besle. @nurstudyo",
  "🙏 Bu videoyu izleyen herkes için dua ediyorum. Siz de dua edin, birbirimizin duası olalım. @nurstudyo",
  "💬 Yorumlara nereden yazdığınızı yazın. Bu aile büyüyor, siz de bir parçası olun. @nurstudyo",
  "🔔 Bildirimleri açın ki yeni ayetlerden ilk sizin haberiniz olsun. @nurstudyo",
  "✅ Bu videoyu beğenenler cennetle müjdelenir. Beğen, paylaş, abone ol. @nurstudyo",
  "❤️ Bu ayeti bir arkadaşınıza gönderin. Onun duasını almak paha biçilmezdir. @nurstudyo",
  "🌍 Bu ayeti dünyanın her yerine ulaştırın. Her dilde, her kalpte bir leaves fingerprints bırakın. @nurstudyo",
  "📹 Bu video www.nurstudyo.com ile üretilmiştir. Siz de 3 dakikada kendi İslami videolarınızı oluşturabilirsiniz! Hemen deneyin → www.nurstudyo.com",
  "✨ www.nurstudyo.com ile siz de bu tür muhteşem videoları kolayca üretebilirsiniz. Yapay zeka destekli İslami video üreticisi. Hemen başlayın → www.nurstudyo.com",
];

const CTA_POOL_EN: string[] = [
  "💚 Like, comment 'Ameen', and share with loved ones. Every share is charity. @nurstudyo",
  "📲 Send this video to someone who needs it. Your share may be their salvation. @nurstudyo",
  "🤍 If this verse touched your heart, don't forget to like. Comment 'Ameen' to join this goodness. @nurstudyo",
  "🌟 Subscribe, turn on notifications, and feed your heart with a new verse every day. @nurstudyo",
  "🙏 I pray for everyone watching this video. You pray too — let us be each other's du'as. @nurstudyo",
  "🔔 Turn on notifications so you never miss a new verse. @nurstudyo",
  "📹 This video was produced with www.nurstudyo.com. Create your own Islamic videos in 3 minutes! Try it now → www.nurstudyo.com",
  "✨ www.nurstudyo.com lets you produce beautiful Islamic videos with AI. Start now → www.nurstudyo.com",
];

// ════════════════════════════════════════════════════════
// RASTGELE TANITIM SATIRLARI — Her videoda farklı
// ════════════════════════════════════════════════════════

const PROMO_LINES: string[] = [
  "📹 Bu video www.nurstudyo.com ile üretilmiştir. Yapay zeka destekli İslami video üreticisi. Siz de 3 dakikada kendi videolarınızı oluşturabilirsiniz!",
  "🎬 Üretim: www.nurstudyo.com — İslami içerik üretimi artık çok kolay. Ücretsiz deneyin, 3 dakikada video üretin!",
  "🌟 www.nurstudyo.com ile siz de bu tür muhteşem İslami videoları kolayca üretebilirsiniz. Hemen başlayın!",
  "📽️ Bu videoyu www.nurstudyo.com adresinden ürettik. Siz de hemen deneyin, tamamen ücretsiz!",
  "🎥 www.nurstudyo.com — Yapay zeka destekli tek İslami video üreticisi. Kendi videolarınızı oluşturmak için tıklayın!",
  "📹 Üretim: www.nurstudyo.com — 3 dakikada kendi Kur'an videolarınızı oluşturun. Ücretsiz başlayın!",
  "🌟 Bu video www.nurstudyo.com yapay zeka stüdyosu ile hazırlanmıştır. Siz de deneyin!",
  "🎬 www.nurstudyo.com ile kendi İslami videolarınızı oluşturun. Ücretsiz, kolay, hızlı!",
  "📹 Bu video www.nurstudyo.com tarafından üretilmiştir. Siz de hemen üretim yapabilirsiniz!",
  "🎥 www.nurstudyo.com — İslami video üretimi için tek adres. Hemen başlayın!",
  "📹 Bu videoyu www.nurstudyo.com ile ürettik. Siz de aynı kalitede videolar üretebilirsiniz!",
  "🌟 www.nurstudyo.com — Yapay zeka ile İslami içerik üretimi. Ücretsiz deneyin!",
  "🎬 www.nurstudyo.com ile video üretmek artık çocuk oyuncağı. Hemen deneyin!",
  "📹 Bu video www.nurstudyo.com stüdyosunda üretilmiştir. Siz de kendi stüdyonuzu kurun!",
  "🎥 www.nurstudyo.com — Her gün yeni İslami videolar. Abone olun, kaçırmayın!",
  "🌟 www.nurstudyo.com ile 3 dakikada profesyonel İslami video. Ücretsiz başlayın!",
  "📹 Üretim: www.nurstudyo.com — Yapay zeka, otomatik arka plan, profesyonel ses. Hemen deneyin!",
  "🎬 www.nurstudyo.com ile kendi Kur'an videolarınızı oluşturun. 3 dakikada hazır!",
];

const PROMO_LINES_EN: string[] = [
  "📹 This video was produced with www.nurstudyo.com — AI-powered Islamic video studio. Create yours in 3 minutes!",
  "🎬 Made with www.nurstudyo.com — Islamic content creation made easy. Free to start!",
  "🌟 www.nurstudyo.com lets you produce beautiful Islamic videos with AI. Try it now!",
  "📽️ Generated by www.nurstudyo.com — Create stunning Islamic content in minutes. Free!",
  "🎥 www.nurstudyo.com — The only AI-powered Islamic video producer. Start now!",
  "📹 www.nurstudyo.com — Create Quran videos in 3 minutes. Free to start!",
  "🌟 This video was made with www.nurstudyo.com. You can create yours too — it's free!",
  "🎬 www.nurstudyo.com — AI-powered Islamic video creation. Try it now!",
];

// ════════════════════════════════════════════════════════
// ANA ÜRETİCİ FONKSİYONU
// ════════════════════════════════════════════════════════

/** ★ Çok dilli, zenginleştirilmiş açıklama üretici — hadis, peygamber sözü, derin analiz, CTA */
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

  // ★ Rastgele hadis seç (her videoda farklı)
  const hadith = HADITH_POOL[Math.floor(Math.random() * HADITH_POOL.length)];

  // ★ Rastgele CTA seç
  const ctaPool = lang === "tr" ? CTA_POOL_TR : CTA_POOL_EN;
  const cta = ctaPool[Math.floor(Math.random() * ctaPool.length)];

  // ★ Rastgele tanıtım satırı seç
  const promoPool = lang === "tr" ? PROMO_LINES : PROMO_LINES_EN;
  const promo = promoPool[Math.floor(Math.random() * promoPool.length)];

  // ★ Seçili sureye göre dinamik quote
  const quote = lang === "tr"
    ? getQuoteForSurah(surahName, s, a)
    : L.quote;

  return `${L.studio}

${intro}

${L.reciter}: ${reciterName}

${quote}

${emotion}

${ayahMood}

━━━━━━━━━━━━━━━━━━

${hadith}

━━━━━━━━━━━━━━━━━━

${cta}

━━━━━━━━━━━━━━━━━━

${promo}`;
}
