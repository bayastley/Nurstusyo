// ════════════════════════════════════════════════════════
// AYET KARTLARI DATA — Ayet Kütüphanesi (kart/fotoğraf modülü)
// Kullanıcı bir ayet seçer, arka plan seçer, kartı PNG olarak indirir.
// Metinler kısaltılmışsa "…" ile işaretlidir; kaynak referansı her kartta durur.
// ════════════════════════════════════════════════════════

import { AYET_KARTILARI_EK } from "./ayetKartlariEk";
import { AYET_KARTILARI_MEGA } from "./ayetKartlariMega";
import { AYET_KARTILARI_MEGA2 } from "./ayetKartlariMega2";

export interface AyetKarti {
  id: string;
  /** Duygu/filtre etiketi */
  mood: "huzur" | "sabir" | "sukur" | "tevekkul" | "rahmet" | "sevgi" | "zafer" | "af" | "imtihan" | "cennet" | "ilim" | "aile";
  /** Kart üstünde görünen kısa başlık */
  title: string;
  /** Arapça metin (çok satırlı olabilir; \n satır bölmesi) */
  ar: string;
  /** Türkçe meal */
  tr: string;
  /** "Bakara Suresi • 255. Ayet" biçiminde kaynak */
  source: string;
}

/** Sure numarası → ad (sure filtresi için; numaradan ad çözümleme) */
export const SURE_ADLARI: string[] = [
  "Fâtiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus",
  "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ",
  "Enbiyâ", "Hac", "Mu'minûn", "Nûr", "Furkan", "Şuarâ", "Neml", "Kasas", "Ankabût", "Rûm",
  "Lokmân", "Secde", "Ahzâb", "Sebe", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min",
  "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf",
  "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine",
  "Saff", "Cuma", "Münafikûn", "Teğâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Maâric",
  "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Murselât", "Nebe", "Neziât", "Abese",
  "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Burûc", "Târik", "A'lâ", "Gâşiye", "Fecr", "Beled",
  "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadr", "Beyyine", "Zilzâl", "Âdiyât",
  "Kâria", "Tekâsür", "Asr", "Humaze", "Fîl", "Kureyş", "Maûn", "Kevser", "Kâfirûn", "Nasr",
  "Tebbet", "İhlâs", "Felek", "Nâs",
];

/** Ayetin source alanından sure numarasını çıkarır ("Bakara Suresi • 255. Ayet" → 2) */
export const sureNoFromSource = (source: string): number => {
  const ad = source.split(" Suresi")[0]?.trim() ?? "";
  const idx = SURE_ADLARI.findIndex((s) => s.toLocaleLowerCase("tr") === ad.toLocaleLowerCase("tr"));
  return idx + 1; // bulunamazsa 0 (filtre dışı)
};

/** Günün Ayeti: gün değişince otomatik değişen günün seçimi (yerel tarih bazlı, stabil) */
export const gununAyeti = (): AyetKarti => {
  const now = new Date();
  const gunAnahtari = now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate();
  return AYET_KARTILARI[gunAnahtari % AYET_KARTILARI.length] ?? AYET_KARTILARI[0];
};

export const AYET_MOODS: Array<{ id: AyetKarti["mood"] | "tumu"; label: string; emoji: string }> = [
  { id: "tumu", label: "Tümü", emoji: "✦" },
  { id: "huzur", label: "Huzur", emoji: "🌙" },
  { id: "sabir", label: "Sabır", emoji: "🌿" },
  { id: "sukur", label: "Şükür", emoji: "🤍" },
  { id: "tevekkul", label: "Tevekkül", emoji: "🕊️" },
  { id: "rahmet", label: "Rahmet", emoji: "💧" },
  { id: "sevgi", label: "Sevgi", emoji: "🌸" },
  { id: "zafer", label: "Zafer & Umut", emoji: "✨" },
  { id: "af", label: "Af & Tövbe", emoji: "🤲" },
  { id: "imtihan", label: "İmtihan", emoji: "⚡" },
  { id: "cennet", label: "Cennet", emoji: "🌴" },
  { id: "ilim", label: "İlim & Hikmet", emoji: "📚" },
  { id: "aile", label: "Aile & Yuva", emoji: "🏡" },
];

export const AYET_KARTILARI: AyetKarti[] = [
  ...AYET_KARTILARI_MEGA,
  ...AYET_KARTILARI_MEGA2,
  ...AYET_KARTILARI_EK,
  // ── HUZUR ──────────────────────────────────────────────
  { id: "ak-13-28", mood: "huzur", title: "Kalpler Huzur Bulur", source: "Ra'd Suresi • 28. Ayet",
    ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    tr: "Bilesiniz ki kalpler ancak Allah'ı anmakla huzur bulur." },
  { id: "ak-2-255", mood: "huzur", title: "Ayete'l-Kürsî", source: "Bakara Suresi • 255. Ayet",
    ar: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ …",
    tr: "Allah, O'ndan başka ilâh yoktur; O diridir, her şeyin varlığı O'na bağlıdır…" },
  { id: "ak-24-35", mood: "huzur", title: "Göklerin ve Yerin Nuru", source: "Nûr Suresi • 35. Ayet",
    ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    tr: "Allah, göklerin ve yerin nurudur." },
  { id: "ak-57-4", mood: "huzur", title: "O Beraberinizdedir", source: "Hadîd Suresi • 4. Ayet",
    ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    tr: "O, nerede olursanız beraberinizdedir." },
  { id: "ak-50-16", mood: "huzur", title: "Şah Damarından Yakın", source: "Kâf Suresi • 16. Ayet",
    ar: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
    tr: "Biz ona şah damarından daha yakınız." },
  { id: "ak-2-186", mood: "imtihan", title: "Ben Çok Yakınım", source: "Bakara Suresi • 186. Ayet",
    ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    tr: "Kullarım beni sana sorduğunda, ben yakınım; dua edenin duasına karşılık veririm…" },
  { id: "ak-10-62", mood: "imtihan", title: "Allah'ın Dostlarına", source: "Yûnus Suresi • 62. Ayet",
    ar: "أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
    tr: "Bilin ki Allah'ın dostlarına korku yoktur, onlar üzülecek de değildirler." },
  { id: "ak-36-58", mood: "huzur", title: "Selam Sözü", source: "Yâsîn Suresi • 58. Ayet",
    ar: "سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ",
    tr: "Selam! Rahim Rab'den bir söz (olarak)." },
  { id: "ak-97-1", mood: "huzur", title: "Kadir Gecesi", source: "Kadir Suresi • 1. Ayet",
    ar: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ",
    tr: "Şüphesiz biz onu Kadir Gecesi'nde indirdik." },

  // ── SABIR ──────────────────────────────────────────────
  { id: "ak-94-5", mood: "sabir", title: "Güçlükle Beraber", source: "İnşirâh Suresi • 5-6. Ayetler",
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا\nإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Şüphesiz güçlükle beraber bir kolaylık vardır. Evet, şüphesiz güçlükle beraber iki kolaylık vardır." },
  { id: "ak-2-45", mood: "sabir", title: "Sabır ve Namazla", source: "Bakara Suresi • 45. Ayet",
    ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    tr: "Sabır ve namaz ile (Allah'tan) yardım isteyin." },
  { id: "ak-8-46", mood: "sabir", title: "Allah Sabredenlerle", source: "Enfâl Suresi • 46. Ayet",
    ar: "وَاصْبِرُوا ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    tr: "Sabredin; şüphesiz Allah sabredenlerle beraberdir." },
  { id: "ak-31-17", mood: "sabir", title: "Başına Gelenlere Sabret", source: "Lokmân Suresi • 17. Ayet",
    ar: "وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ",
    tr: "Başına gelenlere sabret." },
  { id: "ak-42-43", mood: "af", title: "Sabredip Affeden", source: "Şûrâ Suresi • 43. Ayet",
    ar: "وَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ الْأُمُورِ",
    tr: "Kim sabreder ve affederse elbette bu, yapılmaya değer işlerdendir." },
  { id: "ak-2-286", mood: "sabir", title: "Gücünün Yettiği Kadar", source: "Bakara Suresi • 286. Ayet",
    ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    tr: "Allah bir kimseyi ancak gücünün yettiği şeyle sorumlu tutar." },
  { id: "ak-7-23", mood: "af", title: "Adem'in Duası", source: "A'râf Suresi • 23. Ayet",
    ar: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    tr: "Rabbimiz! Kendimize yazık ettik; bağışlamaz ve merhamet etmezsen ziyana uğrayanlardan oluruz." },

  // ── ŞÜKÜR ──────────────────────────────────────────────
  { id: "ak-14-7", mood: "sukur", title: "Şükrederseniz Artırırım", source: "İbrâhîm Suresi • 7. Ayet",
    ar: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    tr: "Şükrederseniz size elbette (nimetimi) artırırım." },
  { id: "ak-2-152", mood: "aile", title: "Beni Anın", source: "Bakara Suresi • 152. Ayet",
    ar: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    tr: "Beni anın ki ben de sizi anayım; bana şükredin, nankörlük etmeyin." },
  { id: "ak-55-13", mood: "sukur", title: "Hangi Nimeti Yalanlarsınız", source: "Rahmân Suresi • 13. Ayet",
    ar: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    tr: "Rabbinizin hangi nimetlerini yalan sayarsınız?" },
  { id: "ak-108-1", mood: "aile", title: "Kevser", source: "Kevser Suresi • 1. Ayet",
    ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    tr: "Şüphesiz biz sana Kevser'i verdik." },
  { id: "ak-1-1", mood: "sukur", title: "Basmala", source: "Fâtiha Suresi • 1. Ayet",
    ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    tr: "Rahmân ve Rahîm olan Allah'ın adıyla." },
  { id: "ak-1-2", mood: "sukur", title: "Hamd Âlemlerin Rabbine", source: "Fâtiha Suresi • 2. Ayet",
    ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    tr: "Hamd, âlemlerin Rabbi Allah'a mahsustur." },

  // ── TEVEKKÜL ───────────────────────────────────────────
  { id: "ak-65-3", mood: "tevekkul", title: "Allah Yeter", source: "Talâk Suresi • 3. Ayet",
    ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    tr: "Kim Allah'a tevekkül ederse, O kendisine yeter." },
  { id: "ak-3-173", mood: "tevekkul", title: "Hasbünallâh", source: "Âl-i İmrân Suresi • 173. Ayet",
    ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    tr: "Allah bize yeter, O ne güzel vekildir." },
  { id: "ak-9-51", mood: "tevekkul", title: "Yazılan Bizedir", source: "Tevbe Suresi • 51. Ayet",
    ar: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا",
    tr: "De ki: Bize Allah'ın bizim için yazdığından başkası asla ulaşmaz." },
  { id: "ak-3-159", mood: "tevekkul", title: "Karar Verince", source: "Âl-i İmrân Suresi • 159. Ayet",
    ar: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
    tr: "Bir işe karar verince Allah'a tevekkül et; şüphesiz Allah tevekkül edenleri sever." },
  { id: "ak-11-88", mood: "tevekkul", title: "Başarı Allah'tandır", source: "Hûd Suresi • 88. Ayet",
    ar: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
    tr: "Benim başaracağımdan umudum ancak Allah'ın yardımı iledir." },
  { id: "ak-9-40", mood: "tevekkul", title: "Üzülme, Allah Bizimle", source: "Tevbe Suresi • 40. Ayet",
    ar: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
    tr: "Üzülme, şüphesiz Allah bizimle beraberdir." },

  // ── RAHMET & DUA ───────────────────────────────────────
  { id: "ak-2-201", mood: "rahmet", title: "Rabbenâ Duası", source: "Bakara Suresi • 201. Ayet",
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    tr: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver; bizi ateş azabından koru." },
  { id: "ak-39-53", mood: "rahmet", title: "Ümit Kesilmez", source: "Zümer Suresi • 53. Ayet",
    ar: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    tr: "Allah'ın rahmetinden ümit kesmeyin." },
  { id: "ak-40-60", mood: "aile", title: "Dua Edin", source: "Gâfir Suresi • 60. Ayet",
    ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    tr: "Bana dua edin, karşılığını vereyim." },
  { id: "ak-21-87", mood: "rahmet", title: "Yûnus'un Nidası", source: "Enbiyâ Suresi • 87. Ayet",
    ar: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    tr: "Senden başka ilâh yok, sen eksiksizsin; gerçekten ben haksızlık edenlerden oldum." },
  { id: "ak-7-56", mood: "rahmet", title: "Rahmet Yakındır", source: "A'râf Suresi • 56. Ayet",
    ar: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ",
    tr: "Şüphesiz Allah'ın rahmeti, iyilik edenlere yakındır." },
  { id: "ak-27-62", mood: "rahmet", title: "Darda Kalanın Duası", source: "Neml Suresi • 62. Ayet",
    ar: "أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ",
    tr: "Darda kalan kimse dua ettiğinde karşılık veren O değil mi?" },
  { id: "ak-66-8", mood: "af", title: "Nûrumuzu Tamamla", source: "Tahrîm Suresi • 8. Ayet",
    ar: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا",
    tr: "Rabbimiz! Nûrumuzu bizim için tamamla ve bizi bağışla." },
  { id: "ak-3-8", mood: "rahmet", title: "Kalbimizi Sabit Kıl", source: "Âl-i İmrân Suresi • 8. Ayet",
    ar: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا",
    tr: "Rabbimiz! Bizi doğru yola ilettikten sonra kalplerimizi kaydırma." },
  { id: "ak-18-10", mood: "rahmet", title: "Mağara Ashabının Duası", source: "Kehf Suresi • 10. Ayet",
    ar: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    tr: "Rabbimiz! Katından bize bir rahmet ver ve işimizi doğru yola koy." },
  { id: "ak-25-74", mood: "aile", title: "Göz Aydınlığı", source: "Furkân Suresi • 74. Ayet",
    ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
    tr: "Rabbimiz! Bize eşlerimizden ve çocuklarımızdan göz aydınlığı ver." },
  { id: "ak-20-114", mood: "rahmet", title: "Rabbim, İlmimi Artır", source: "Tâhâ Suresi • 114. Ayet",
    ar: "رَبِّ زِدْنِي عِلْمًا",
    tr: "Rabbim! İlmimi artır." },
  { id: "ak-71-10", mood: "af", title: "Bağışlanma Dileyin", source: "Nûh Suresi • 10. Ayet",
    ar: "اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا",
    tr: "Rabbinizden bağışlanma dileyin; şüphesiz O, çok bağışlayandır." },
  { id: "ak-15-9", mood: "rahmet", title: "Zikri Biz Kullandık", source: "Hicr Suresi • 9. Ayet",
    ar: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    tr: "Zikri (Kur'an'ı) biz indirdik, onu koruyacak olan da biziz." },

  // ── SEVGİ & MERHAMET ───────────────────────────────────
  { id: "ak-30-21", mood: "sevgi", title: "Sevgi ve Rahmet", source: "Rûm Suresi • 21. Ayet",
    ar: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    tr: "(Allah) sizin aranıza sevgi ve rahmet koydu." },
  { id: "ak-17-24", mood: "sevgi", title: "Anne Babaya Merhamet", source: "İsrâ Suresi • 24. Ayet",
    ar: "وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    tr: "Ve de ki: Rabbim! Beni küçükken yetiştirdikleri gibi onlara da merhamet et." },
  { id: "ak-26-80", mood: "sevgi", title: "Şifa Veren O'dur", source: "Şuarâ Suresi • 80. Ayet",
    ar: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ",
    tr: "Hastalandığımda ise O beni iyileştirir." },
  { id: "ak-33-56", mood: "sevgi", title: "Salât-u Selâm", source: "Ahzâb Suresi • 56. Ayet",
    ar: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ",
    tr: "Şüphesiz Allah ve melekleri Peygamber'e salat ediyorlar." },
  { id: "ak-49-13", mood: "sevgi", title: "En Değerli Kim", source: "Hucurât Suresi • 13. Ayet",
    ar: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ",
    tr: "Allah katında en değerli olanınız, O'na karşı gelmekten en çok sakınanızdır." },
  { id: "ak-24-22", mood: "af", title: "Affedin, Hoş Görün", source: "Nûr Suresi • 22. Ayet",
    ar: "وَلْيَعْفُوا وَلْيَصْفَحُوا",
    tr: "Affetsinler, hoş görsünler." },
  { id: "ak-17-70", mood: "sevgi", title: "Şereflendirdik", source: "İsrâ Suresi • 70. Ayet",
    ar: "وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ",
    tr: "Andolsun, insan oğlunu şereflendirdik." },
  { id: "ak-33-70", mood: "aile", title: "Sağlam Söz", source: "Ahzâb Suresi • 70. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا",
    tr: "Ey inananlar! Allah'a karşı gelmekten sakının ve sağlam söz söyleyin." },
  { id: "ak-76-9", mood: "sevgi", title: "Allah Rızası İçin", source: "İnsân Suresi • 9. Ayet",
    ar: "إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ",
    tr: "Sizi yalnızca Allah rızası için doyuruyoruz." },

  // ── ZAFER & UMUT ───────────────────────────────────────
  { id: "ak-3-139", mood: "zafer", title: "Üstün Gelen Sizsiniz", source: "Âl-i İmrân Suresi • 139. Ayet",
    ar: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    tr: "Üzülmeyin, kederlenmeyin; inanıyorsanız üstün gelecek olan sizsiniz." },
  { id: "ak-61-13", mood: "zafer", title: "Yakın Zafer", source: "Saff Suresi • 13. Ayet",
    ar: "نَصْرٌ مِّنَ اللَّهِ وَفَتْحٌ قَرِيبٌ",
    tr: "Allah'tan bir yardım ve yakın bir zafer (var)!" },
  { id: "ak-110-1", mood: "zafer", title: "Yardım ve Fetih", source: "Nasr Suresi • 1. Ayet",
    ar: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
    tr: "Allah'ın yardımı ve fetih geldiğinde…" },
  { id: "ak-29-69", mood: "zafer", title: "Yolümüzü Açarız", source: "Ankebût Suresi • 69. Ayet",
    ar: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    tr: "Bizim uğrumuzda çaba gösterenleri, elbette yollarımıza eriştiririz." },
  { id: "ak-53-39", mood: "zafer", title: "Emeğin Karşılığı", source: "Necm Suresi • 39. Ayet",
    ar: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
    tr: "İnsan için ancak çalıştığının karşılığı vardır." },
  { id: "ak-5-2", mood: "zafer", title: "Hayırda Yardımlaşın", source: "Mâide Suresi • 2. Ayet",
    ar: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ",
    tr: "İyilik ve takva üzerinde yardımlaşın." },
  { id: "ak-21-107", mood: "zafer", title: "Âlemlere Rahmet", source: "Enbiyâ Suresi • 107. Ayet",
    ar: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
    tr: "Seni ancak âlemlere rahmet olarak gönderdik." },
  { id: "ak-16-90", mood: "aile", title: "Adalet Emri", source: "Nahl Suresi • 90. Ayet",
    ar: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ",
    tr: "Şüphesiz Allah, adaleti, iyiliği ve yakınlara vermeyi emreder." },
  { id: "ak-51-56", mood: "aile", title: "Yaratılış Gayesi", source: "Zâriyât Suresi • 56. Ayet",
    ar: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
    tr: "Cinleri ve insanları ancak bana kulluk etsinler diye yarattım." },
  { id: "ak-96-1", mood: "ilim", title: "Oku!", source: "Alak Suresi • 1. Ayet",
    ar: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    tr: "Yaratan Rabbinin adıyla oku!" },
  { id: "ak-112-1", mood: "huzur", title: "İhlâs Suresi", source: "İhlâs Suresi • 1-4. Ayetler",
    ar: "قُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ\nوَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    tr: "De ki: O Allah bir tektir. Allah sameddir (her şey O'na muhtaç, O hiç kimseye muhtaç değildir). Doğurmadı ve doğurulmadı. Hiçbir şey O'nun dengi olmamıştır." },
  { id: "ak-109-6", mood: "aile", title: "Sizin Dininiz, Benim Dinim", source: "Kâfirûn Suresi • 6. Ayet",
    ar: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
    tr: "Sizin dininiz size, benim dinim bana." },
  { id: "ak-2-216", mood: "ilim", title: "Hayırlı Olabilir", source: "Bakara Suresi • 216. Ayet",
    ar: "وَلَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
    tr: "Hoşlanmadığınız bir şey, sizin için hayırlı olabilir." },
  { id: "ak-5-3", mood: "huzur", title: "Din Tamamlandı", source: "Mâide Suresi • 3. Ayet",
    ar: "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ",
    tr: "Bugün sizin için dininizi tamamladım." },
  { id: "ak-17-80", mood: "tevekkul", title: "Hakla Gir, Hakla Çık", source: "İsrâ Suresi • 80. Ayet",
    ar: "رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ",
    tr: "Rabbim! Beni hak ile sava sok, hak ile çıkar." },
  { id: "ak-103-2", mood: "sabir", title: "İnsan Hüsrandadır", source: "Asr Suresi • 2. Ayet",
    ar: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
    tr: "Şüphesiz insan, hüsran içindedir." },
  { id: "ak-114-1", mood: "huzur", title: "Nâs Suresi", source: "Nâs Suresi • 1-2. Ayetler",
    ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ\nمَلِكِ النَّاسِ",
    tr: "De ki: İnsanların Rabbine sığırım. İnsanların melikine (hükümdarına) sığırım." },
  { id: "ak-113-1", mood: "huzur", title: "Felak Suresi", source: "Felak Suresi • 1-2. Ayetler",
    ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ\nمِن شَرِّ مَا خَلَقَ",
    tr: "De ki: Sığınarım ben, o felak (sabah aydınlığı) Rabbine. Yarattığı şeylerin şerrinden." },
  { id: "ak-72-18", mood: "huzur", title: "Mescitler Allah'ındır", source: "Cin Suresi • 18. Ayet",
    ar: "وَأَنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا",
    tr: "Mescitler Allah'a aittir; o hâlde Allah ile beraber hiç kimseye dua etmeyin." },
  { id: "ak-3-26", mood: "zafer", title: "Mülkün Sahibi", source: "Âl-i İmrân Suresi • 26. Ayet",
    ar: "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ …",
    tr: "De ki: Allah'ım! Mülkün sahibi olan Rabbim! Dilediğine mülkü verirsin…" },
];
