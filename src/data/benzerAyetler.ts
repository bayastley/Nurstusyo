// ════════════════════════════════════════════════════════
// BENZERAYETLER.TS — Benzer Ayetler Karşılaştırması (yol haritası madde 44)
// Aynı kalıbı paylaşan, karıştırılmaya müsait ayet çiftleri.
// Arapça metinler mushaf metnidir; mealler kısa ve sade karşılıktır (resmî meal
// iddiası taşımaz). Fark notları yalnız gözle görülür yapı farkını anlatır.
// ════════════════════════════════════════════════════════

export type BenzerAyet = { ref: string; ar: string; meal: string };
export type BenzerKume = { id: string; baslik: string; not: string; ayetler: BenzerAyet[] };

export const BENZER_KUMELER: BenzerKume[] = [
  {
    id: "insirah-5-6",
    baslik: "İnşirâh 94:5–6 — tek harflik tekrar",
    not: "İki ayet neredeyse aynıdır; 6. ayette baştaki فَ (fe) edatı yoktur. İkinci cümle birincisini pekiştirir.",
    ayetler: [
      { ref: "İnşirâh 94:5", ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", meal: "Şüphesiz güçlükle beraber bir kolaylık vardır." },
      { ref: "İnşirâh 94:6", ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", meal: "Gerçekten güçlükle beraber bir kolaylık vardır." },
    ],
  },
  {
    id: "zilzal-7-8",
    baslik: "Zilzâl 99:7–8 — hayır ve şer",
    not: "Kalıp birebir aynıdır; yalnız فَ/وَ bağlacı ile خَيْرًا (hayır) / شَرًّا (şer) kelimeleri değişir.",
    ayetler: [
      { ref: "Zilzâl 99:7", ar: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", meal: "Kim zerre miktarı hayır işlerse onu görür." },
      { ref: "Zilzâl 99:8", ar: "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ", meal: "Kim de zerre miktarı şer işlerse onu görür." },
    ],
  },
  {
    id: "fatiha-6-7",
    baslik: "Fâtiha 1:6–7 — istenen yolun tarifi",
    not: "İkinci ayet, birincide istenen 'sırât'ı açıklar; kelime tekrar edilir ama anlam daralır: nimet verilenlerin yolu.",
    ayetler: [
      { ref: "Fâtiha 1:6", ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", meal: "Bizi dosdoğru yola ilet." },
      { ref: "Fâtiha 1:7", ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", meal: "Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıtanların yoluna değil." },
    ],
  },
  {
    id: "bakara-secde",
    baslik: "Bakara 2:2 / Secde 32:2 — ortak cümle",
    not: "Ortak parça 'الْكِتَابُ لَا رَيْبَ فِيهِ' (kitapta şüphe yoktur). Başlangıç ve devamı farklı olduğu için karıştırılır.",
    ayetler: [
      { ref: "Bakara 2:2", ar: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ", meal: "Bu, kendisinde şüphe olmayan kitaptır; takvâ sahipleri için yol göstericidir." },
      { ref: "Secde 32:2", ar: "تَنزِيلُ الْكِتَابِ لَا رَيْبَ فِيهِ مِن رَّبِّ الْعَالَمِينَ", meal: "Kitabın indirilişi, âlemlerin Rabbindendir; onda şüphe yoktur." },
    ],
  },
  {
    id: "ala-muminun",
    baslik: "A'lâ 87:14 / Mü'minûn 23:1 — 'kad efleha' kalıbı",
    not: "'قَدْ أَفْلَحَ' (kurtuluşa erdi) kalıbı ortaktır; birinde tezkiye, diğerinde müminler öne çıkarılır.",
    ayetler: [
      { ref: "A'lâ 87:14", ar: "قَدْ أَفْلَحَ مَن تَزَكَّىٰ", meal: "Arınan kurtuluşa ermiştir." },
      { ref: "Mü'minûn 23:1", ar: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ", meal: "Müminler gerçekten kurtuluşa ermiştir." },
    ],
  },
  {
    id: "huruf-mukattaa",
    baslik: "Dört surenin başında aynı harfler: الم",
    not: "Aynı harf grubu dört farklı surenin ilk ayetidir. Harflerin anlamı hakkında kesin bir yorum yoktur; bu yüzden yalnız metin karşılaştırılır.",
    ayetler: [
      { ref: "Bakara 2:1", ar: "الم", meal: "Elif Lâm Mîm." },
      { ref: "Âl-i İmrân 3:1", ar: "الم", meal: "Elif Lâm Mîm." },
      { ref: "Ankebût 29:1", ar: "الم", meal: "Elif Lâm Mîm." },
      { ref: "Lokmân 31:1", ar: "الم", meal: "Elif Lâm Mîm." },
    ],
  },
];

export const BENZER_TOPLAM = BENZER_KUMELER.length;
export const BENZER_KAYNAK_NOTU =
  "Karşılaştırmalar mushaf metnine dayanır; fark notları yalnız görünen yapıyı açıklar, tefsir hükmü vermez. Mealler kısa karşılıktır.";
