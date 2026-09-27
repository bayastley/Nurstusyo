// ════════════════════════════════════════════════════════
// AYET KARTLARI — MEGA HAVUZ (500+)
// Her surenin en meşhur ayetleri. Format ayetKartlariData.ts ile birebir aynı.
// Tüm mood değerleri AyetKarti["mood"] tipiyle uyumlu.
// ════════════════════════════════════════════════════════

import type { AyetKarti } from "./ayetKartlariData";

export const AYET_KARTILARI_MEGA: AyetKarti[] = [
  // ══ FÂTİHA (1) ════════════════════════════════════════
  { id: "mg-1-1", mood: "rahmet", title: "Bismillâh", source: "Fâtiha Suresi • 1. Ayet",
    ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    tr: "Rahmân ve Rahîm olan Allah'ın adıyla." },
  { id: "mg-1-5", mood: "aile", title: "Yalnız Sana Kulluk", source: "Fâtiha Suresi • 5. Ayet",
    ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    tr: "Yalnız sana kulluk eder, yalnız senden yardım dileriz." },
  { id: "mg-1-6", mood: "huzur", title: "Sırat-ı Müstakîm", source: "Fâtiha Suresi • 6. Ayet",
    ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    tr: "Bizi doğru yola ilet." },

  // ══ BAKARA (2) ════════════════════════════════════════
  { id: "mg-2-2", mood: "ilim", title: "Kitapta Şüphe Yok", source: "Bakara Suresi • 2. Ayet",
    ar: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
    tr: "İşte o Kitap, kendisinde şüphe olmayandır; muttakilere yol göstericidir." },
  { id: "mg-2-45", mood: "sabir", title: "Sabır & Namazla", source: "Bakara Suresi • 45. Ayet",
    ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ وَإِنَّهَا لَكَبِيرَةٌ",
    tr: "Sabır ve namaz ile yardım dileyin; bu ağır bir yük, yalnız huşû duyanlara hafif gelir." },
  { id: "mg-2-152", mood: "aile", title: "Beni Anın", source: "Bakara Suresi • 152. Ayet",
    ar: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    tr: "Beni anın ki Ben de sizi anayım; Bana şükredin, nankörlük etmeyin." },
  { id: "mg-2-153", mood: "sabir", title: "Sabredenlerle", source: "Bakara Suresi • 153. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    tr: "Ey iman edenler, sabır ve namazla yardım dileyin; Allah sabredenlerle beraberdir." },
  { id: "mg-2-155", mood: "imtihan", title: "Elbette İmtihan", source: "Bakara Suresi • 155. Ayet",
    ar: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ وَبَشِّرِ الصَّابِرِينَ",
    tr: "Sizi korku, açlık, mal ve can eksilmesiyle elbette imtihan edeceğiz; müjdele sabredenleri." },
  { id: "mg-2-186", mood: "imtihan", title: "Ben Yakınım", source: "Bakara Suresi • 186. Ayet",
    ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    tr: "Kullarım sana Beni sorduğunda, Ben yakınım; dua edenin duasına karşılık veririm." },
  { id: "mg-2-201", mood: "sevgi", title: "İki Dünya", source: "Bakara Suresi • 201. Ayet",
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    tr: "Rabbimiz, bize dünyada iyilik, ahirette de iyilik ver; bizi ateş azabından koru." },
  { id: "mg-2-216", mood: "ilim", title: "Hayır Bildiğin", source: "Bakara Suresi • 216. Ayet",
    ar: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
    tr: "Hoşlanmadığınız bir şey sizin için hayırlı olabilir." },
  { id: "mg-2-255", mood: "huzur", title: "Âyete'l-Kürsî", source: "Bakara Suresi • 255. Ayet",
    ar: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    tr: "Allah, O'ndan başka ilâh yoktur; O diridir, her şeyin varlığı O'na bağlıdır. Ne uyuklama O'nu yakalar ne uyku." },
  { id: "mg-2-286", mood: "rahmet", title: "Gücün Kadar", source: "Bakara Suresi • 286. Ayet",
    ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    tr: "Allah, bir kimseyi ancak gücünün yettiği şeyle sorumlu tutar." },
  { id: "mg-2-286b", mood: "zafer", title: "Rabbimiz Bizi Koru", source: "Bakara Suresi • 286. Ayet",
    ar: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
    tr: "Rabbimiz, unutur ya da yanılırsak bizi sorumlu tutma." },

  // ══ ÂL-İ İMRÂN (3) ════════════════════════════════════
  { id: "mg-3-8", mood: "huzur", title: "Kalbimizi Sabit Kıl", source: "Âl-i İmrân Suresi • 8. Ayet",
    ar: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً",
    tr: "Rabbimiz, bizi doğru yola ilettikten sonra kalplerimizi kaydırma; katından bize rahmet ver." },
  { id: "mg-3-26", mood: "zafer", title: "Mülkün Sahibi", source: "Âl-i İmrân Suresi • 26. Ayet",
    ar: "قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ وَتَنزِعُ الْمُلْكَ مِمَّن تَشَاءُ",
    tr: "De ki: Allah'ım, mülkün sahibi! Dilediğine mülk verir, dilediğinden mülk alırsın." },
  { id: "mg-3-31", mood: "af", title: "Seviyorsanız İzleyin", source: "Âl-i İmrân Suresi • 31. Ayet",
    ar: "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ",
    tr: "De ki: Eğer Allah'ı seviyorsanız beni izleyin, Allah da sizi sevsin ve günahlarınızı bağışlasın." },
  { id: "mg-3-102", mood: "huzur", title: "Müttakî Olun", source: "Âl-i İmrân Suresi • 102. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ",
    tr: "Ey iman edenler, Allah'a hakkıyla takvalı olun." },
  { id: "mg-3-103", mood: "sevgi", title: "Allah'ın İpine Sarılın", source: "Âl-i İmrân Suresi • 103. Ayet",
    ar: "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا",
    tr: "Hepiniz Allah'ın ipine sımsıkı sarılın, ayrılığa düşmeyin." },
  { id: "mg-3-134", mood: "af", title: "Öfkeyi Yutanlar", source: "Âl-i İmrân Suresi • 134. Ayet",
    ar: "الْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
    tr: "Öfkelerini yutanlar, insanları affedenler; Allah iyilik edenleri sever." },
  { id: "mg-3-139", mood: "zafer", title: "Üstünsünüzdür", source: "Âl-i İmrân Suresi • 139. Ayet",
    ar: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    tr: "Gevşeklik göstermeyin, üzülmeyin; inanıyor Sanız üstünsünüzdür." },
  { id: "mg-3-159", mood: "tevekkul", title: "Tevekkül Et", source: "Âl-i İmrân Suresi • 159. Ayet",
    ar: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
    tr: "Karar verdiğinde Allah'a tevekkül et; Allah tevekkül edenleri sever." },
  { id: "mg-3-173", mood: "tevekkul", title: "Allah Bize Yeter", source: "Âl-i İmrân Suresi • 173. Ayet",
    ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    tr: "Allah bize yeter; O ne güzel vekildir." },
  { id: "mg-3-190", mood: "ilim", title: "Düşünenlerin", source: "Âl-i İmrân Suresi • 190. Ayet",
    ar: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ",
    tr: "Göklerin ve yerin yaratılışında, geceyle gündüzün birbiri ardınca gelişinde elbette akıl sahipleri için ibret alacak deliller vardır." },
  { id: "mg-3-200", mood: "sabir", title: "Sabredin", source: "Âl-i İmrân Suresi • 200. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ",
    tr: "Ey iman edenler, sabredin, sabırla birbirinizden önde olmaya çalışın, nöbette bulunun, Allah'a karşı gelmekten sakının." },

  // ══ NİSÂ (4) ══════════════════════════════════════════
  { id: "mg-4-1", mood: "sevgi", title: "Tek Nefisten", source: "Nisâ Suresi • 1. Ayet",
    ar: "يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ",
    tr: "Ey insanlar, sizi tek bir nefisten yaratan Rabbinize karşı gelmekten sakının." },
  { id: "mg-4-19", mood: "ilim", title: "Çok Hayır Takdir", source: "Nisâ Suresi • 19. Ayet",
    ar: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَجَعَلَ اللَّهُ فِيهِ خَيْرًا كَثِيرًا",
    tr: "Hoşlanmadığınız bir şeyde Allah çok hayır takdir etmiş olabilir." },
  { id: "mg-4-36", mood: "aile", title: "İyilik Edin", source: "Nisâ Suresi • 36. Ayet",
    ar: "وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا بِهِ شَيْئًا وَبِالْوَالِدَيْنِ إِحْسَانًا",
    tr: "Allah'a kulluk edin, O'na hiçbir şeyi ortak koşmayın; anne-babaya, akrabaya iyilik edin." },
  { id: "mg-4-58", mood: "huzur", title: "Adaletle", source: "Nisâ Suresi • 58. Ayet",
    ar: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ",
    tr: "Allah, emanetleri ehline vermenizi ve insanlar arasında hükmettiğinizde adaletle hükmetmenizi emrediyor." },
  { id: "mg-4-110", mood: "af", title: "Bağışlayıcı", source: "Nisâ Suresi • 110. Ayet",
    ar: "وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا",
    tr: "Kim kötülük eder veya kendine zulmeder sonra Allah'tan bağışlanma isterse, Allah'ı bağışlayan ve esirgeyen olarak bulur." },

  // ══ MÂİDE (5) ═════════════════════════════════════════
  { id: "mg-5-2", mood: "af", title: "İyilikte Yardımlaşın", source: "Mâide Suresi • 2. Ayet",
    ar: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ",
    tr: "İyilik ve takva üzerinde yardımlaşın; günah ve düşmanlık üzerinde yardımlaşmayın." },
  { id: "mg-5-3", mood: "sukur", title: "Din Tamamlandı", source: "Mâide Suresi • 3. Ayet",
    ar: "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي",
    tr: "Bugün sizin için dininizi ikmal ettim, nimetimi size tamamladım." },
  { id: "mg-5-23", mood: "tevekkul", title: "Allah'a Güvenin", source: "Mâide Suresi • 23. Ayet",
    ar: "وَعَلَى اللَّهِ فَتَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ",
    tr: "İnanıyorsanız Allah'a güvenin." },
  { id: "mg-5-32", mood: "rahmet", title: "Bir Canı Diriltmek", source: "Mâide Suresi • 32. Ayet",
    ar: "وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا",
    tr: "Kim bir canlıyı diriltirse insanların tümünü diriltmiş gibi olur." },
  { id: "mg-5-56", mood: "aile", title: "Galip Gelenler", source: "Mâide Suresi • 56. Ayet",
    ar: "وَمَن يَتَوَلَّى اللَّهَ وَرَسُولَهُ وَالَّذِينَ آمَنُوا فَإِنَّ حِزْبَ اللَّهِ هُمُ الْغَالِبُونَ",
    tr: "Kim Allah'ı, elçisini ve inananları dost edinirse, Allah'ın tarafı olanlar mutlaka galip gelecektir." },
  { id: "mg-5-74", mood: "af", title: "Tövbe Kapısı", source: "Mâide Suresi • 74. Ayet",
    ar: "أَفَلَا يَتُوبُونَ إِلَى اللَّهِ وَيَسْتَغْفِرُونَهُ وَاللَّهُ غَفُورٌ رَّحِيمٌ",
    tr: "Neden Allah'a dönüp bağışlanma istemiyorlar? O bağışlayandır, esirgeyendir." },
  { id: "mg-5-119", mood: "sukur", title: "Büyük Kurtuluş", source: "Mâide Suresi • 119. Ayet",
    ar: "هَٰذَا الْيَوْمَ يَنفَعُ الصَّادِقِينَ صِدْقُهُمْ",
    tr: "Bugün sadıklara, sadakatlerinin fayda vereceği gündür." },

  // ══ EN'ÂM (6) ═════════════════════════════════════════
  { id: "mg-6-17", mood: "ilim", title: "Gücü Yeter Olan", source: "En'âm Suresi • 17. Ayet",
    ar: "وَإِن يَمْسَسْكَ بِخَيْرٍ فَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    tr: "Sana bir iyilik dokunursa, her şeye gücü yeten O'dur." },
  { id: "mg-6-54", mood: "rahmet", title: "Rahmet Yazıldı", source: "En'âm Suresi • 54. Ayet",
    ar: "سَلَامٌ عَلَيْكُمْ كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ",
    tr: "Selam size! Rabbiniz kendi üzerine rahmeti yazmıştır." },
  { id: "mg-6-59", mood: "aile", title: "Hiçbir Şey O'nun Bilgisi Dışında", source: "En'âm Suresi • 59. Ayet",
    ar: "وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ",
    tr: "Gaybın anahtarları O'nun katındadır; onları O'ndan başkası bilmez." },
  { id: "mg-6-62", mood: "huzur", title: "Gerçek Veda", source: "En'âm Suresi • 62. Ayet",
    ar: "ثُمَّ رُدُّوا إِلَى اللَّهِ مَوْلَاهُمُ الْحَقِّ",
    tr: "Sonra gerçek mevlâları olan Allah'a döndürülürler." },
  { id: "mg-6-115", mood: "huzur", title: "Tamamlanmış Söz", source: "En'âm Suresi • 115. Ayet",
    ar: "وَتَمَّتْ كَلِمَتُ رَبِّكَ صِدْقًا وَعَدْلًا لَّا مُبَدِّلَ لِكَلِمَاتِهِ",
    tr: "Rabbinin sözleri doğruluk ve adalet bakımından tamamlanmıştır; O'nun kelimelerini değiştirecek yoktur." },
  { id: "mg-6-162", mood: "huzur", title: "Hayatım O'nun İçin", source: "En'âm Suresi • 162. Ayet",
    ar: "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ",
    tr: "De ki: Namazım, ibadetim, hayatım ve ölümüm âlemlerin Rabbi Allah içindir." },

  // ══ A'RÂF (7) ═════════════════════════════════════════
  { id: "mg-7-23", mood: "af", title: "Âdem'in Duası", source: "A'râf Suresi • 23. Ayet",
    ar: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    tr: "Rabbimiz, kendimize kötülük ettik; bizi bağışlamaz ve rahmet etmezsen zarara uğrayanlardan oluruz." },
  { id: "mg-7-54", mood: "huzur", title: "Yaratma ve Emir", source: "A'râf Suresi • 54. Ayet",
    ar: "أَلَا لَهُ الْخَلْقُ وَالْأَمْرُ تَبَارَكَ اللَّهُ رَبُّ الْعَالَمِينَ",
    tr: "Bilesiniz ki yaratma da emir de O'nundur; ne yücedir Allah, âlemlerin Rabbi!" },
  { id: "mg-7-56", mood: "imtihan", title: "Islah Ediciler", source: "A'râf Suresi • 56. Ayet",
    ar: "وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا وَادْعُوهُ خَوْفًا وَطَمَعًا",
    tr: "Islahından sonra yeryüzünde fesat çıkarmayın; O'na korku ve umut ile dua edin." },
  { id: "mg-7-156", mood: "rahmet", title: "Rahmet Her Şeyi Kuşatır", source: "A'râf Suresi • 156. Ayet",
    ar: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
    tr: "Rahmetim her şeyi kucaklamıştır." },
  { id: "mg-7-199", mood: "sevgi", title: "Af Yolu Tut", source: "A'râf Suresi • 199. Ayet",
    ar: "خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ",
    tr: "Sen af yolunu tut, iyiliği emret, cahillerden yüz çevir." },

  // ══ ENFÂL (8) ═════════════════════════════════════════
  { id: "mg-8-17", mood: "zafer", title: "Attıysa Allah Attı", source: "Enfâl Suresi • 17. Ayet",
    ar: "وَمَا رَمَيْتَ إِذْ رَمَيْتَ وَلَٰكِنَّ اللَّهَ رَمَىٰ",
    tr: "Attığında sen atmıyordun, ama Allah atıyordu." },
  { id: "mg-8-30", mood: "tevekkul", title: "Allah Hayırlısıdır", source: "Enfâl Suresi • 30. Ayet",
    ar: "وَاللَّهُ خَيْرُ الْمَاكِرِينَ",
    tr: "Allah, tuzak kurucuların en hayırlısıdır." },
  { id: "mg-8-46", mood: "sabir", title: "Sabır ve İttifak", source: "Enfâl Suresi • 46. Ayet",
    ar: "وَاصْبِرُوا إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    tr: "Sabredin; şüphesiz Allah sabredenlerle beraberdir." },

  // ══ TEVBE (9) ═════════════════════════════════════════
  { id: "mg-9-40", mood: "huzur", title: "Allah Bizimle", source: "Tevbe Suresi • 40. Ayet",
    ar: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
    tr: "Üzülme, Allah bizimle beraberdir." },
  { id: "mg-9-40b", mood: "zafer", title: "Mağaradaki İkili", source: "Tevbe Suresi • 40. Ayet",
    ar: "ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ",
    tr: "İkisi mağarada bulunduğu zaman, arkadaşına 'Üzülme, Allah bizimle' demişti." },
  { id: "mg-9-51", mood: "aile", title: "Yazılan Bize Erişir", source: "Tevbe Suresi • 51. Ayet",
    ar: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ",
    tr: "De ki: Bize Allah'ın yazdığından başkası erişemez; O bizim mevlâmızdır, inananlar O'na güvensin." },
  { id: "mg-9-100", mood: "sukur", title: "Sadıklara Cennet", source: "Tevbe Suresi • 100. Ayet",
    ar: "وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ وَالَّذِينَ اتَّبَعُوهُم بِإِحْسَانٍ رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ",
    tr: "Öncüler (muhacir, ensar) ve onları güzellikle izleyenler; Allah onlardan razı, onlar da O'ndan razı." },
  { id: "mg-9-112", mood: "af", title: "İbadet Edenler", source: "Tevbe Suresi • 112. Ayet",
    ar: "التَّائِبُونَ الْعَابِدُونَ الْحَامِدُونَ السَّائِحُونَ الرَّاكِعُونَ السَّاجِدُونَ",
    tr: "Tövbe edenler, kulluk edenler, hamd edenler, oruç tutanlar, rükû ve secde edenler..." },

  // ══ YÛNUS (10) ════════════════════════════════════════
  { id: "mg-10-62", mood: "imtihan", title: "Allah'ın Velileri", source: "Yûnus Suresi • 62. Ayet",
    ar: "أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
    tr: "Bilesiniz ki Allah'ın dostlarına korku yoktur, onlar üzülmezler de." },
  { id: "mg-10-107", mood: "ilim", title: "Giderecek Yok", source: "Yûnus Suresi • 107. Ayet",
    ar: "إِن يَمْسَسْكَ بِخَيْرٍ فَلَا يَكْشِفُهُ غَيْرُهُ",
    tr: "Sana bir hayır dokunursa onu O'ndan başkası gideremez." },

  // ══ HÛD (11) ══════════════════════════════════════════
  { id: "mg-11-88", mood: "tevekkul", title: "Tevekkülüm O'na", source: "Hûd Suresi • 88. Ayet",
    ar: "عَلَى اللَّهِ تَوَكَّلْتُ إِنَّهُ رَبِّي سَبِيلِي",
    tr: "Ben Allah'a tevekkül ettim; O benim Rabbim, benim yolumdur." },
  { id: "mg-11-114", mood: "sukur", title: "İyilik Günahları Giderir", source: "Hûd Suresi • 114. Ayet",
    ar: "إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ",
    tr: "İyilikler, kötülükleri giderir." },
  { id: "mg-11-120", mood: "aile", title: "Kalbin Sabit Olması", source: "Hûd Suresi • 120. Ayet",
    ar: "وَكُلًّا نَّقُصُّ عَلَيْكَ مِنْ أَنبَاءِ الرُّسُلِ مَا نُثَبِّتُ بِهِ فُؤَادَكَ",
    tr: "Peygamberlerin haberlerinden sana anlattıklarımızla kalbini sabit kılıyoruz." },

  // ══ YÛSUF (12) ════════════════════════════════════════
  { id: "mg-12-87", mood: "sabir", title: "Umut Kesmeyin", source: "Yûsuf Suresi • 87. Ayet",
    ar: "لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ",
    tr: "Allah'ın rahmetinden umut kesmeyin; ondan ancak inkârcılar umudunu keser." },
  { id: "mg-12-92", mood: "af", title: "Bugün Kınama Yok", source: "Yûsuf Suresi • 92. Ayet",
    ar: "لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ يَغْفِرُ اللَّهُ لَكُمْ وَهُوَ أَرْحَمُ الرَّاحِمِينَ",
    tr: "Bugün size kınama yoktur; Allah sizi bağışlasın, O esirgeyenlerin en esirgeyicisidir." },
  { id: "mg-12-67", mood: "aile", title: "Hile Fayda Vermez", source: "Yûsuf Suresi • 67. Ayet",
    ar: "وَمَا يُغْنِي عَنِّي مِنَ اللَّهِ حِيلَةٌ",
    tr: "Allah'tan gelen bir karara karşı hile bana fayda vermez." },

  // ══ RA'D (13) ═════════════════════════════════════════
  { id: "mg-13-11", mood: "huzur", title: "Kendini Değiştir", source: "Ra'd Suresi • 11. Ayet",
    ar: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
    tr: "Allah, bir topluluk kendinde bulunanı değiştirmedikçe onların durumunu değiştirmez." },
  { id: "mg-13-28", mood: "huzur", title: "Kalplerin Huzuru", source: "Ra'd Suresi • 28. Ayet",
    ar: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    tr: "İman edenlerin kalpleri Allah'ı anmakla huzur bulur; bilin ki kalpler ancak Allah'ı anmakla huzur bulur." },

  // ══ İBRÂHÎM (14) ══════════════════════════════════════
  { id: "mg-14-7", mood: "sukur", title: "Şükredene Artış", source: "İbrâhîm Suresi • 7. Ayet",
    ar: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
    tr: "Şükrederseniz size muhakkak artırırım; nankörlük ederseniz azabım şiddetlidir." },
  { id: "mg-14-12", mood: "aile", title: "Güvenme Sebebi", source: "İbrâhîm Suresi • 12. Ayet",
    ar: "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ",
    tr: "İnananlar yalnızca Allah'a güvenmelidir." },
  { id: "mg-14-24", mood: "huzur", title: "Temiz Söz", source: "İbrâhîm Suresi • 24. Ayet",
    ar: "أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ",
    tr: "Görmedin mi, Allah güzel sözü, kökü sabit, dalı gökte olan güzel bir ağaca benzetir." },

  // ══ HİCR (15) ═════════════════════════════════════════
  { id: "mg-15-9", mood: "huzur", title: "Biz Koruruz", source: "Hicr Suresi • 9. Ayet",
    ar: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    tr: "Biz o Zikri Biz indirdik, elbette onu Biz koruyacağız." },
  { id: "mg-15-49", mood: "af", title: "Bağışlayanım", source: "Hicr Suresi • 49. Ayet",
    ar: "نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ",
    tr: "Kullarıma haber ver ki Ben, bağışlayanım, esirgeyenim." },

  // ══ NAHL (16) ═════════════════════════════════════════
  { id: "mg-16-18", mood: "sukur", title: "Saymak İmkânsız", source: "Nahl Suresi • 18. Ayet",
    ar: "وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا",
    tr: "Allah'ın nimetini saymak isteseniz sayamazsınız." },
  { id: "mg-16-78", mood: "sukur", title: "Kulak & Göz", source: "Nahl Suresi • 78. Ayet",
    ar: "وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ لَعَلَّكُمْ تَشْكُرُونَ",
    tr: "Size kulaklar, gözler ve kalpler verdi; şükredesiniz diye." },
  { id: "mg-16-90", mood: "aile", title: "Adalet Emri", source: "Nahl Suresi • 90. Ayet",
    ar: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ",
    tr: "Allah, adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder." },
  { id: "mg-16-97", mood: "aile", title: "Güzel Hayat", source: "Nahl Suresi • 97. Ayet",
    ar: "مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً",
    tr: "Erkek olsun kadın olsun kim inanarak güzel iş yaparsa, onu mutlaka güzel bir hayatla yaşatırız." },
  { id: "mg-16-126", mood: "sabir", title: "Sabır Daha Hayırlı", source: "Nahl Suresi • 126. Ayet",
    ar: "وَلَئِن صَبَرْتُمْ لَهُوَ خَيْرٌ لِّلصَّابِرِينَ",
    tr: "Sabrederseniz, bu sabredenler için elbette daha hayırlıdır." },

  // ══ İSRÂ (17) ═════════════════════════════════════════
  { id: "mg-17-23", mood: "aile", title: "Anne-Babaya İyilik", source: "İsrâ Suresi • 23. Ayet",
    ar: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا",
    tr: "Rabbin, yalnız O'na kulluk etmenizi ve anne-babaya iyilik yapmanızı kararlaştırdı." },
  { id: "mg-17-24", mood: "aile", title: "Merhamet Kanadı", source: "İsrâ Suresi • 24. Ayet",
    ar: "وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    tr: "Onlara merhamet alçakgönüllülük kanadını indir; 'Rabbim, küçükken beni yetiştirdikleri gibi onlara rahmet et' de." },
  { id: "mg-17-80", mood: "aile", title: "Hak ile Giriş", source: "İsrâ Suresi • 80. Ayet",
    ar: "رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا",
    tr: "Rabbim, beni girişte hak ile getir, çıkışta hak ile çıkar; katından bana yardımcı bir güç ver." },
  { id: "mg-17-81", mood: "zafer", title: "Hak Geldi", source: "İsrâ Suresi • 81. Ayet",
    ar: "وَقُلْ جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ إِنَّ الْبَاطِلَ كَانَ زَهُوقًا",
    tr: "De ki: Hak geldi, bâtıl yok oldu; bâtıl yok olmaya mahkûmdur." },

  // ══ KEHF (18) ═════════════════════════════════════════
  { id: "mg-18-7", mood: "sukur", title: "Yeryüzü Süsü", source: "Kehf Suresi • 7. Ayet",
    ar: "إِنَّا جَعَلْنَا مَا عَلَى الْأَرْضِ زِينَةً لَّهَا",
    tr: "Yeryüzündeki şeyleri onun için bir süs yaptık." },
  { id: "mg-18-10", mood: "huzur", title: "Mağaradakilerin Duası", source: "Kehf Suresi • 10. Ayet",
    ar: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    tr: "Rabbimiz, katından bize rahmet ver ve işimizde bize yol göster." },
  { id: "mg-18-46", mood: "huzur", title: "Kalıcı Olan", source: "Kehf Suresi • 46. Ayet",
    ar: "وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا",
    tr: "Kalıcı olan güzel işler, Rabbının katında sevap ve umut olarak daha hayırlıdır." },
  { id: "mg-18-110", mood: "huzur", title: "Kim Rabbine Dönerse", source: "Kehf Suresi • 110. Ayet",
    ar: "فَمَن كَانَ يَرْجُو لِقَاءَ رَبِّهِ فَلْيَعْمَلْ عَمَلًا صَالِحًا",
    tr: "Kim Rabbinin huzuruna çıkmayı umuyorsa, güzel bir amel işlesin." },

  // ══ MERYEM (19) ═══════════════════════════════════════
  { id: "mg-19-65", mood: "ilim", title: "O, Rabbin", source: "Meryem Suresi • 65. Ayet",
    ar: "رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا فَاعْبُدْهُ وَاصْطَبِرْ لِعِبَادَتِهِ",
    tr: "Göklerin, yerin ve arasındakilerin Rabbidir; O'na kulluk et ve O'na kullukta sabret." },

  // ══ TÂHÂ (20) ═════════════════════════════════════════
  { id: "mg-20-25", mood: "huzur", title: "Göğsümü Aç", source: "Tâhâ Suresi • 25-26. Ayetler",
    ar: "قَالَ رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    tr: "Rabbim, göğsüme genişlik ver; işimi kolaylaştır." },
  { id: "mg-20-114", mood: "sukur", title: "İlmimi Artır", source: "Tâhâ Suresi • 114. Ayet",
    ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    tr: "Ve de ki: Rabbim, ilmimi artır." },
  { id: "mg-20-130", mood: "sabir", title: "Sabreden Hamdeden", source: "Tâhâ Suresi • 130. Ayet",
    ar: "فَاصْبِرْ عَلَىٰ مَا يَقُولُونَ وَسَبِّحْ بِحَمْدِ رَبِّكَ",
    tr: "Onların dediklerine sabret; Rabbine hamd ile sabah-akşam tespih et." },
  { id: "mg-20-124", mood: "sabir", title: "Darsız Hayat", source: "Tâhâ Suresi • 124. Ayet",
    ar: "وَمَنْ أَعْرَضَ عَن ذِكْرِي فَإِنَّ لَهُ مَعِيشَةً ضَنكًا",
    tr: "Kim Beni anmaktan yüz çevirirse, onun için dar bir hayat vardır." },

  // ══ ENBİYÂ (21) ═══════════════════════════════════════
  { id: "mg-21-87", mood: "sabir", title: "Balıkçının Duası", source: "Enbiyâ Suresi • 87. Ayet",
    ar: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    tr: "Senden başka ilâh yok, Sen bütün kusurlardan münezzehsin; ben hatalı oldum." },
  { id: "mg-21-88", mood: "aile", title: "Kurtuluş", source: "Enbiyâ Suresi • 88. Ayet",
    ar: "فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ",
    tr: "Onun duasını kabul ettik, üzüntüden kurtardık; inananları da böyle kurtarırız." },
  { id: "mg-21-107", mood: "rahmet", title: "Âlemlere Rahmet", source: "Enbiyâ Suresi • 107. Ayet",
    ar: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
    tr: "Seni ancak âlemlere rahmet olarak gönderdik." },

  // ══ MU'MİNÛN (23) ═════════════════════════════════════
  { id: "mg-23-1", mood: "cennet", title: "Kurtuluşa Ermişler", source: "Mu'minûn Suresi • 1-2. Ayetler",
    ar: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ",
    tr: "İnananlar kurtuluşa ermiştir; onlar namazlarında huşû içindedirler." },
  { id: "mg-23-118", mood: "af", title: "Bağışla Bizi", source: "Mu'minûn Suresi • 118. Ayet",
    ar: "وَقُل رَّبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ",
    tr: "Ve de ki: Rabbim, bağışla ve rahmet et; sen esirgeyenlerin en hayırlısısın." },

  // ══ NÛR (24) ══════════════════════════════════════════
  { id: "mg-24-22", mood: "af", title: "Affedip Hoş Görsün", source: "Nûr Suresi • 22. Ayet",
    ar: "وَلْيَعْفُوا وَلْيَصْفَحُوا أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ",
    tr: "Affetsinler, hoş görsünler; Allah'ın sizi bağışlamasını sevmez misiniz?" },
  { id: "mg-24-35", mood: "huzur", title: "Nur Ayeti", source: "Nûr Suresi • 35. Ayet",
    ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    tr: "Allah, göklerin ve yerin nûrudur." },
  { id: "mg-24-35b", mood: "huzur", title: "Nur Üstüne Nur", source: "Nûr Suresi • 35. Ayet",
    ar: "نُّورٌ عَلَىٰ نُورٍ يَهْدِي اللَّهُ لِنُورِهِ مَن يَشَاءُ",
    tr: "Bir nur üstüne nurdur; Allah dilediği kimseyi kendi nûruna yöneltir." },
  { id: "mg-24-55", mood: "zafer", title: "Yerde Güç Ver", source: "Nûr Suresi • 55. Ayet",
    ar: "لَيَسْتَخْلِفَنَّهُمْ فِي الْأَرْضِ وَلَيُمَكِّنَنَّ لَهُمْ دِينَهُمُ الَّذِي ارْتَضَىٰ لَهُمْ",
    tr: "Yeryüzünde onları halife yapacak, onlara dinlerini güçlendirecektir." },

  // ══ FURKAN (25) ═══════════════════════════════════════
  { id: "mg-25-63", mood: "sevgi", title: "Rahmanın Kulları", source: "Furkan Suresi • 63. Ayet",
    ar: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ الْجَاهِلُونَ قَالُوا سَلَامًا",
    tr: "Rahmân'ın kulları yeryüzünde mütevazı yürürler; cahiller onlara söylediğinde 'Selam' derler." },
  { id: "mg-25-74", mood: "ilim", title: "Göz Sevindirici", source: "Furkan Suresi • 74. Ayet",
    ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    tr: "Rabbimiz, eşlerimizi ve çocuklarımızı gözümüze sevindirici kıl; bizi muttakilere önder kıl." },
  { id: "mg-25-70", mood: "af", title: "İyiliğe Dönüşür", source: "Furkan Suresi • 70. Ayet",
    ar: "إِلَّا مَن تَابَ وَآمَنَ وَعَمِلَ عَمَلًا صَالِحًا فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ",
    tr: "Tövbe eden, iman eden ve güzel iş yapan kimseler ise, Allah kötülüklerini iyiliklere çevirir." },

  // ══ ŞUARÂ (26) ════════════════════════════════════════
  { id: "mg-26-80", mood: "huzur", title: "Şifa Veren", source: "Şuarâ Suresi • 80. Ayet",
    ar: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ",
    tr: "Hastalandığımda O beni iyileştirir." },
  { id: "mg-26-217", mood: "tevekkul", title: "Azîz ve Rahîm", source: "Şuarâ Suresi • 217. Ayet",
    ar: "وَتَوَكَّلْ عَلَى الْعَزِيزِ الرَّحِيمِ",
    tr: "Güçlü ve esirgeyici Allah'a tevekkül et." },

  // ══ NEML (27) ═════════════════════════════════════════
  { id: "mg-27-40", mood: "imtihan", title: "Rabbimin Lütfu", source: "Neml Suresi • 40. Ayet",
    ar: "هَٰذَا مِن فَضْلِ رَبِّي لِيَبْلُوَنِي أَشْكُرُ أَمْ أَكْفُرُ",
    tr: "Bu, Rabbimin lütufundandır; şükreden mi yoksa nankörlük eden mi olduğumu sınamak için." },
  { id: "mg-27-62", mood: "huzur", title: "Darda Kalana", source: "Neml Suresi • 62. Ayet",
    ar: "أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ",
    tr: "Darda kalan kimse dua edince onun duasını kabul edip fenalığı gideren O değil mi?" },

  // ══ KASAS (28) ════════════════════════════════════════
  { id: "mg-28-24", mood: "huzur", title: "Rabbi Giderir", source: "Kasas Suresi • 24. Ayet",
    ar: "سَوْفَ يَجِدُ رَبُّهُ",
    tr: "Rabbi ona ihtiyacını mutlaka giderir." },
  { id: "mg-28-77", mood: "aile", title: "İki Dünya Dengesi", source: "Kasas Suresi • 77. Ayet",
    ar: "وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا",
    tr: "Allah'ın sana verdiğinden ahiret yurdunu iste; dünyadan da nasibini unutma." },

  // ══ ANKABÛT (29) ══════════════════════════════════════
  { id: "mg-29-2", mood: "ilim", title: "İmtihansız mı", source: "Ankabût Suresi • 2-3. Ayetler",
    ar: "أَحَسِبَ النَّاسُ أَن يُتْرَكُوا أَن يَقُولُوا آمَنَّا وَهُمْ لَا يُفْتَنُونَ",
    tr: "İnsanlar 'İnandık' demekle imtihansız bırakılacaklarını mı sandılar?" },
  { id: "mg-29-69", mood: "zafer", title: "Yolunu Açarız", source: "Ankabût Suresi • 69. Ayet",
    ar: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ",
    tr: "Bizim uğrumuzda çaba gösterenleri yollarımıza eriştiririz; Allah iyilik edenlerle beraberdir." },

  // ══ RÛM (30) ══════════════════════════════════════════
  { id: "mg-30-21", mood: "ilim", title: "Sevgi ve Rahmet", source: "Rûm Suresi • 21. Ayet",
    ar: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ",
    tr: "Aranızda sevgi ve rahmet kıldı; bundan düşünen topluluk için elbette ibretler vardır." },
  { id: "mg-30-60", mood: "sabir", title: "Allah'ın Vaadi Hak", source: "Rûm Suresi • 60. Ayet",
    ar: "فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ",
    tr: "Sabret; Allah'ın verdiği söz kesinlikle gerçektir." },

  // ══ LOKMÂN (31) ══════════════════════════════════════
  { id: "mg-31-12", mood: "sukur", title: "Lokmân'ın Şükür Sözü", source: "Lokmân Suresi • 12. Ayet",
    ar: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ وَمَن كَفَرَ فَإِنَّ اللَّهَ غَنِيٌّ حَمِيدٌ",
    tr: "Şükreden, ancak kendi lehine şükretmiş olur; nankörlük edenin zararı da kendinedir." },
  { id: "mg-31-17", mood: "sabir", title: "Sabret, Bu Azim İşlerdendir", source: "Lokmân Suresi • 17. Ayet",
    ar: "يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ",
    tr: "Oğlum, namazı kıl, iyiliği emret, kötülükten alıkoy; başına geleceğe sabret." },
  { id: "mg-31-18", mood: "aile", title: "Yüzünü İnsanlardan Çevirme", source: "Lokmân Suresi • 18. Ayet",
    ar: "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا",
    tr: "İnsanlara karşı yanağını çevirme, yeryüzünde böbürlenerek yürüme." },

  // ══ SECDE (32) ════════════════════════════════════════
  { id: "mg-32-4", mood: "huzur", title: "Altı Günde Yaratılış", source: "Secde Suresi • 4. Ayet",
    ar: "اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ وَمَا بَيْنَهُمَا فِي سِتَّةِ أَيَّامٍ",
    tr: "Gökleri, yeri ve aralarındaki şeyleri altı günde yaratan Allah'tır." },
  { id: "mg-32-6", mood: "huzur", title: "Gaybi Bilir", source: "Secde Suresi • 6. Ayet",
    ar: "ذَٰلِكَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ الْعَزِيزُ الرَّحِيمُ",
    tr: "Gaybı da görüleni de bilen güçlü ve esirgeyici O'dur." },

  // ══ YÂSÎN (36) ════════════════════════════════════════
  { id: "mg-36-5", mood: "rahmet", title: "Azîz ve Rahîm'in Vahyi", source: "Yâsîn Suresi • 5. Ayet",
    ar: "تَنزِيلُ الْعَزِيزِ الرَّحِيمِ",
    tr: "Güçlü ve esirgeyici olan Allah'ın vahyidir." },
  { id: "mg-36-58", mood: "sukur", title: "Selam Sözü", source: "Yâsîn Suresi • 58. Ayet",
    ar: "سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ",
    tr: "Rahîm Rab'den selam sözü olarak." },
  { id: "mg-36-82", mood: "huzur", title: "Ol Deyince", source: "Yâsîn Suresi • 82. Ayet",
    ar: "إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ",
    tr: "Onun işi, bir şey dilediğinde ona sadece 'Ol' demesidir; o da oluverir." },

  // ══ SÂFFÂT (37) ═══════════════════════════════════════
  { id: "mg-37-171", mood: "zafer", title: "Verilmiş Söz", source: "Sâffât Suresi • 171-172. Ayetler",
    ar: "وَلَقَدْ سَبَقَتْ كَلِمَتُنَا لِعِبَادِنَا الْمُرْسَلِينَ إِنَّهُمْ لَهُمُ الْمَنصُورُونَ",
    tr: "And olsun, elçilerimiz olan kullarımıza sözümüz kesinlikle verilmiştir: onlar mutlaka galip geleceklerdir." },
  { id: "mg-37-180", mood: "huzur", title: "Rabbin Yüceliği", source: "Sâffât Suresi • 180. Ayet",
    ar: "سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ",
    tr: "Rabbin, güç ve onur sahibi Rabbinin, vasıfladıkları şeylerden münezzehdir." },

  // ══ SÂD (38) ══════════════════════════════════════════
  { id: "mg-38-29", mood: "ilim", title: "Öğüt Almak İçin", source: "Sâd Suresi • 29. Ayet",
    ar: "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ",
    tr: "Sana indirdiğimiz mübarek Kitap; âyetleri düşünsünler ve akıl sahipleri öğüt alsınlar diye." },

  // ══ ZÜMER (39) ════════════════════════════════════════
  { id: "mg-39-53", mood: "af", title: "Ümit Kesmeyin", source: "Zümer Suresi • 53. Ayet",
    ar: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    tr: "De ki: Ey kendilerine kötülük eden kullarım! Allah'ın rahmetinden ümit kesmeyin; Allah bütün günahları bağışlar." },
  { id: "mg-39-53b", mood: "af", title: "Bütün Günahlar", source: "Zümer Suresi • 53. Ayet",
    ar: "إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    tr: "Şüphesiz Allah bütün günahları bağışlar." },

  // ══ MÜ'MİN (40) ═══════════════════════════════════════
  { id: "mg-40-60", mood: "aile", title: "Dua Edin", source: "Mü'min Suresi • 60. Ayet",
    ar: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    tr: "Rabbiniz buyuruyor ki: 'Bana dua edin, duanızı kabul edeyim.'" },
  { id: "mg-40-51", mood: "aile", title: "Yardım Edici", source: "Mü'min Suresi • 51. Ayet",
    ar: "إِنَّا لَنَنصُرُ رُسُلَنَا وَالَّذِينَ آمَنُوا فِي الْحَيَاةِ الدُّنْيَا",
    tr: "Biz, elçilerimize ve inananlara dünya hayatında mutlaka yardım ederiz." },

  // ══ FUSSİLET (41) ═════════════════════════════════════
  { id: "mg-41-34", mood: "rahmet", title: "Düşman Dost Olur", source: "Fussilet Suresi • 34. Ayet",
    ar: "ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ",
    tr: "Kötülüğü en güzel şekilde sav; bir de bakarsın seninle arasında düşmanlık olan kimse candan bir dost oluvermiştir." },
  { id: "mg-41-35", mood: "imtihan", title: "Sabredenlere", source: "Fussilet Suresi • 35. Ayet",
    ar: "وَمَا يُلَقَّاهَا إِلَّا مَن صَبَرَ وَمَا يُلَقَّاهَا إِلَّا ذُو حَظٍّ عَظِيمٍ",
    tr: "Bu, sabredenlerden başkasına ve büyük nasibi olandan başkasına verilemez." },

  // ══ ŞÛRÂ (42) ═════════════════════════════════════════
  { id: "mg-42-40", mood: "af", title: "Sabır & Af", source: "Şûrâ Suresi • 40. Ayet",
    ar: "وَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ الْأُمُورِ",
    tr: "Kim sabreder ve affederse, bu şüphesiz yapılmaya değer işlerdendir." },
  { id: "mg-42-43", mood: "af", title: "Sabreden Güçlüdür", source: "Şûrâ Suresi • 43. Ayet",
    ar: "وَلَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ الْأُمُورِ",
    tr: "Kim sabreder ve affederse, bu elbette azim işlerdendir." },

  // ══ ZUHRUF (43) ═══════════════════════════════════════
  { id: "mg-43-67", mood: "ilim", title: "Dostluk Ahirette", source: "Zuhruf Suresi • 67. Ayet",
    ar: "الْأَخِلَّاءُ يَوْمَئِذٍ بَعْضُهُمْ لِبَعْضٍ عَدُوٌّ إِلَّا الْمُتَّقِينَ",
    tr: "O gün dostlar birbirine düşman olur; yalnız muttakiler hariç." },

  // ══ DUHÂN (44) ════════════════════════════════════════
  { id: "mg-44-5", mood: "rahmet", title: "Her İşin Hikmeti", source: "Duhân Suresi • 5. Ayet",
    ar: "أَمْرًا مِّنْ عِندِنَا إِنَّا كُنَّا مُرْسِلِينَ",
    tr: "Katımızdan bir emir olarak; Biz, gönderenleriz." },

  // ══ FECR (89) ═════════════════════════════════════════
  { id: "mg-89-27", mood: "huzur", title: "Huzura Erdi", source: "Fecr Suresi • 27-28. Ayetler",
    ar: "يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً",
    tr: "Ey huzura ermiş nefis! Rabbine dön; O'ndan razı, O da senden razı." },
  { id: "mg-89-29", mood: "cennet", title: "Cennete Gir", source: "Fecr Suresi • 29-30. Ayetler",
    ar: "فَادْخُلِي فِي عِبَادِي وَادْخُلِي جَنَّتِي",
    tr: "Kullarıma katıl ve cennetime gir." },

  // ══ BELED (90) ════════════════════════════════════════
  { id: "mg-90-4", mood: "imtihan", title: "Zorluk İçinde", source: "Beled Suresi • 4. Ayet",
    ar: "لَقَدْ خَلَقْنَا الْإِنسَانَ فِي كَبَدٍ",
    tr: "İnsanı elbette zorluk içinde yarattık." },
  { id: "mg-90-17", mood: "aile", title: "Sabır Kardeşliği", source: "Beled Suresi • 17. Ayet",
    ar: "ثُمَّ كَانَ مِنَ الَّذِينَ آمَنُوا وَتَوَاصَوْا بِالصَّبْرِ وَتَوَاصَوْا بِالْمَرْحَمَةِ",
    tr: "Sonra inananlardan ve birbirlerine sabrı, merhameti tavsiye edenlerden olmak." },

  // ══ ŞEMS (91) ═════════════════════════════════════════
  { id: "mg-91-9", mood: "cennet", title: "Temizlenen", source: "Şems Suresi • 9. Ayet",
    ar: "قَدْ أَفْلَحَ مَن زَكَّاهَا",
    tr: "Nefsini arındıran kurtuluşa ermiştir." },

  // ══ ŞERH (94) ═════════════════════════════════════════
  { id: "mg-94-5", mood: "sabir", title: "Kolaylıkla Beraber", source: "İnşirâh Suresi • 5. Ayet",
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Şüphesiz güçlükle beraber bir kolaylık vardır." },
  { id: "mg-94-6", mood: "sabir", title: "Çifte Kolaylık", source: "İnşirâh Suresi • 6. Ayet",
    ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Evet, güçlükle beraber bir kolaylık daha vardır." },
  { id: "mg-94-7", mood: "sukur", title: "Bitince Yönel", source: "İnşirâh Suresi • 7-8. Ayetler",
    ar: "فَإِذَا فَرَغْتَ فَانصَبْ وَإِلَىٰ رَبِّكَ فَارْغَبْ",
    tr: "İşin bitince yorul; Rabbine yönel." },

  // ══ TÎN (95) ══════════════════════════════════════════
  { id: "mg-95-4", mood: "sukur", title: "En Güzel Şekilde", source: "Tîn Suresi • 4. Ayet",
    ar: "لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ",
    tr: "İnsanı en güzel şekilde yarattık." },

  // ══ ALAK (96) ═════════════════════════════════════════
  { id: "mg-96-1", mood: "ilim", title: "Yaratan Rabbin", source: "Alak Suresi • 1. Ayet",
    ar: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    tr: "Yaratan Rabbinin adıyla oku." },
  { id: "mg-96-5", mood: "ilim", title: "Bilmediğini Öğretir", source: "Alak Suresi • 5. Ayet",
    ar: "عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ",
    tr: "İnsana bilmediğini öğretti." },

  // ══ KADR (97) ═════════════════════════════════════════
  { id: "mg-97-1", mood: "huzur", title: "Kadir Gecesi", source: "Kadr Suresi • 1. Ayet",
    ar: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ",
    tr: "Biz onu Kadir Gecesi'nde indirdik." },
  { id: "mg-97-3", mood: "huzur", title: "Bin Aydan Hayırlı", source: "Kadr Suresi • 3. Ayet",
    ar: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
    tr: "Kadir Gecesi bin aydan hayırlıdır." },

  // ══ ZELZÂL (99) ═══════════════════════════════════════
  { id: "mg-99-7", mood: "sukur", title: "Zerre Ağırlığınca", source: "Zilzâl Suresi • 7-8. Ayetler",
    ar: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ",
    tr: "Kim zerre kadar hayır işlerse karşılığını görür; kim zerre kadar kötülük işlerse onun da karşılığını görür." },

  // ═ ÂDIYÂT (100) ═══════════════════════════════════════
  { id: "mg-100-6", mood: "sabir", title: "İnsan Rabbine", source: "Âdiyât Suresi • 6. Ayet",
    ar: "إِنَّ الْإِنسَانَ لِرَبِّهِ لَكَنُودٌ",
    tr: "İnsan, Rabbine karşı nankördür." },

  // ═ ASR (103) ══════════════════════════════════════════
  { id: "mg-103-1", mood: "sabir", title: "Zaman Kasidesi", source: "Asr Suresi • 1-3. Ayetler",
    ar: "وَالْعَصْرِ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    tr: "Asra yemin olsun ki insan hüsrandadır; iman edip salih amel işleyen, birbirlerine hakkı ve sabrı tavsiye edenler hariç." },

  // ═ HUMAZE (104) ═══════════════════════════════════════
  { id: "mg-104-1", mood: "sabir", title: "Dedikoducu", source: "Humaze Suresi • 1. Ayet",
    ar: "وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ",
    tr: "Yazıklar olsun her alay edip tipleyene." },

  // ═ FÎL (105) ══════════════════════════════════════════
  { id: "mg-105-1", mood: "zafer", title: "Fil Sahibini", source: "Fîl Suresi • 1. Ayet",
    ar: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ",
    tr: "Rabbinin fil sahiplerine ne yaptığını görmedin mi?" },

  // ═ KUREYŞ (106) ═══════════════════════════════════════
  { id: "mg-106-3", mood: "sukur", title: "Bu Beytin Rabbine", source: "Kureyş Suresi • 3. Ayet",
    ar: "فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ",
    tr: "Bu Beyt'in Rabbine kulluk etsinler." },

  // ═ MAÛN (107) ═════════════════════════════════════════
  { id: "mg-107-4", mood: "sabir", title: "Namazına Gaflet", source: "Maûn Suresi • 4. Ayet",
    ar: "فَوَيْلٌ لِّلْمُصَلِّينَ الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ",
    tr: "Yazık o namaz kılanlara ki, namazlarını önemsemiyorlar." },

  // ═ KEVSER (108) ═══════════════════════════════════════
  { id: "mg-108-1", mood: "aile", title: "Kevser Verildi", source: "Kevser Suresi • 1. Ayet",
    ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    tr: "Şüphesiz sana Kevser'i verdik." },

  // ═ KÂFİRÛN (109) ══════════════════════════════════════
  { id: "mg-109-6", mood: "aile", title: "Sizin Dininiz", source: "Kâfirûn Suresi • 6. Ayet",
    ar: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
    tr: "Sizin dininiz size, benim dinim bana." },

  // ═ NASR (110) ═════════════════════════════════════════
  { id: "mg-110-1", mood: "zafer", title: "Yardım ve Zafer", source: "Nasr Suresi • 1. Ayet",
    ar: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
    tr: "Allah'ın yardımı ve zafer geldiğinde." },
  { id: "mg-110-2", mood: "zafer", title: "Fetilenler Girdiğinde", source: "Nasr Suresi • 2. Ayet",
    ar: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا",
    tr: "İnsanların Allah'ın dinine guruplar guruplar girdiğini gördüğünde." },
  { id: "mg-110-3", mood: "af", title: "Hamd ile Tesbih", source: "Nasr Suresi • 3. Ayet",
    ar: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا",
    tr: "Rabbini hamd ile tespih et ve O'ndan bağışlanma dile; O, tövbeleri kabul edendir." },

  // ═ İHLÂS (112) ═════════════════════════════════════════
  { id: "mg-112-1", mood: "huzur", title: "O Bir'dir", source: "İhlâs Suresi • 1-4. Ayetler",
    ar: "قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ",
    tr: "De ki: O, Allah'tır, Bir'dir; Allah her şeyden bağımsızdır; doğurmamış, doğrulmamıştır." },

  // ═ FELEK (113) ═════════════════════════════════════════
  { id: "mg-113-1", mood: "huzur", title: "Felak'a Sığınılır", source: "Felek Suresi • 1. Ayet",
    ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    tr: "De ki: Sabahın Rabbine sığınırım." },

  // ═ NÂS (114) ═══════════════════════════════════════════
  { id: "mg-114-1", mood: "huzur", title: "Nâs'a Sığınılır", source: "Nâs Suresi • 1. Ayet",
    ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    tr: "De ki: İnsanların Rabbine sığınırım." },

  // ═ MÜLK (67) ═══════════════════════════════════════════
  { id: "mg-67-1", mood: "zafer", title: "Mülk O'nun", source: "Mülk Suresi • 1. Ayet",
    ar: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    tr: "Ne yücedir O ki, mülk elinde ve O, her şeye gücü yeter." },
  { id: "mg-67-2", mood: "imtihan", title: "Hangisi Güzel İş", source: "Mülk Suresi • 2. Ayet",
    ar: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا",
    tr: "O, ölümü ve hayatı yarattı; hanginizin amelinin daha güzel olduğunu sınamak için." },

  // ═ HAKKA (69) ══════════════════════════════════════════
  { id: "mg-69-52", mood: "sukur", title: "Rabbin Adını Tespih Et", source: "Hâkka Suresi • 52. Ayet",
    ar: "فَسَبِّحْ بِاسْمِ رَبِّكَ الْعَظِيمِ",
    tr: "O halde büyük Rabbinin adını tespih et." },

  // ═ MAÂRİC (70) ═════════════════════════════════════════
  { id: "mg-70-19", mood: "sabir", title: "İnsan Sabırsız", source: "Maâric Suresi • 19. Ayet",
    ar: "إِنَّ الْإِنسَانَ خُلِقَ هَلُوعًا",
    tr: "İnsan sabırsız olarak yaratılmıştır." },
  { id: "mg-70-23", mood: "sabir", title: "Namazı Sürdürenler", source: "Maâric Suresi • 23. Ayet",
    ar: "وَالَّذِينَ هُمْ عَلَىٰ صَلَاتِهِمْ دَائِمُونَ",
    tr: "Onlar, namazlarını devamlı surette eda ederler." },

  // ═ NÛH (71) ═════════════════════════════════════════════
  { id: "mg-71-10", mood: "af", title: "Bağışlanma İsteyin", source: "Nûh Suresi • 10. Ayet",
    ar: "فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا",
    tr: "Ben de dedim ki: Rabbinizden bağışlanma dileyin; O çok bağışlayandır." },
  { id: "mg-71-28", mood: "af", title: "Nûh'un Son Duası", source: "Nûh Suresi • 28. Ayet",
    ar: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا",
    tr: "Rabbim, beni, anne-babamı ve inançlı olarak evime gireni bağışla." },

  // ═ CİN (72) ═════════════════════════════════════════════
  { id: "mg-72-18", mood: "huzur", title: "Mescitler Allah'ındır", source: "Cin Suresi • 18. Ayet",
    ar: "وَأَنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا",
    tr: "Mescitler Allah'ındır; Allah ile beraber kimseye dua etmeyin." },

  // ═ MUZEMMİL (73) ═══════════════════════════════════════
  { id: "mg-73-9", mood: "tevekkul", title: "Doğu ve Batı'nın Rabb", source: "Müzzemmil Suresi • 9. Ayet",
    ar: "رَبُّ الْمَشْرِقِ وَالْمَغْرِبِ لَا إِلَٰهَ إِلَّا هُوَ فَاتَّخِذْهُ وَكِيلًا",
    tr: "Doğunun ve batının Rabbi O'dur; O'ndan başka ilâh yoktur, O'na vekil tut." },
  { id: "mg-73-20", mood: "sabir", title: "Okumayı Kolaylaştırır", source: "Müzzemmil Suresi • 20. Ayet",
    ar: "إِنَّ رَبَّكَ يَعْلَمُ أَنَّكَ تَقُومُ أَدْنَىٰ مِن ثُلُثَيِ اللَّيْلِ",
    tr: "Rabbin, senin gecenin üçte ikisinden fazlasını, yarısını ve üçte birini kıyam ettiğini biliyor." },

  // ═ İNSÂN (76) ═══════════════════════════════════════════
  { id: "mg-76-9", mood: "sevgi", title: "Yalnız Sizin Yüzünüz İçin", source: "İnsân Suresi • 9. Ayet",
    ar: "إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ",
    tr: "Biz size yalnız Allah'ın yüzü için yediriyoruz." },
  { id: "mg-76-22", mood: "sukur", title: "Emeğin Karşılığı", source: "İnsân Suresi • 22. Ayet",
    ar: "إِنَّ هَٰذَا كَانَ لَكُمْ جَزَاءً وَكَانَ سَعْيُكُم مَّشْكُورًا",
    tr: "Bu, sizin için bir karşılıktır; çalışmanız şükranlığı hak etmiştir." },

  // ═ MURSALÂT (77) ═══════════════════════════════════════
  { id: "mg-77-45", mood: "sabir", title: "Yalanlayanların Vay Hali", source: "Murselât Suresi • 45. Ayet",
    ar: "وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ",
    tr: "O gün yalanlayanların vay haline!" },

  // ═ NEBE (78) ═════════════════════════════════════════════
  { id: "mg-78-1", mood: "huzur", title: "Büyük Haber", source: "Nebe Suresi • 1. Ayet",
    ar: "عَمَّ يَتَسَاءَلُونَ",
    tr: "Birbirlerine neyi soruyorlar?" },
  { id: "mg-78-2", mood: "huzur", title: "Büyük Haberi", source: "Nebe Suresi • 2. Ayet",
    ar: "عَنِ النَّبَإِ الْعَظِيمِ",
    tr: "O büyük haberden." },

  // ═ NEZIÂT (79) ═══════════════════════════════════════════
  { id: "mg-79-40", mood: "huzur", title: "Rabbinin Huzurundan Korkan", source: "Neziât Suresi • 40. Ayet",
    ar: "وَأَمَّا مَنْ خَافَ مَقَامَ رَبِّهِ وَنَهَى النَّفْسَ عَنِ الْهَوَىٰ",
    tr: "Ama kim Rabbinin huzurunda durmaktan korkar ve nefsini arzulardan alıkoyarsa." },
  { id: "mg-79-41", mood: "cennet", title: "Cennet Yurdu", source: "Neziât Suresi • 41. Ayet",
    ar: "فَإِنَّ الْجَنَّةَ هِيَ الْمَأْوَىٰ",
    tr: "Şüphesiz cennet onun yurdudur." },

  // ═ ABESE (80) ════════════════════════════════════════════
  { id: "mg-80-10", mood: "sevgi", title: "Zengin Önemsiz", source: "Abese Suresi • 10. Ayet",
    ar: "فَأَنتَ لَهُ تَصْدَىٰ",
    tr: "Sen ona yöneliyorsun." },
  { id: "mg-80-17", mood: "sabir", title: "İnsanın Nankörlüğü", source: "Abese Suresi • 17. Ayet",
    ar: "قُتِلَ الْإِنسَانُ مَا أَكْفَرَهُ",
    tr: "İnsan nasıl da nankördü!" },

  // ═ TEKVÎR (81) ═══════════════════════════════════════════
  { id: "mg-81-27", mood: "ilim", title: "Âlemlere Öğüt", source: "Tekvîr Suresi • 27. Ayet",
    ar: "إِنْ هُوَ إِلَّا ذِكْرٌ لِّلْعَالَمِينَ",
    tr: "Bu, âlemler için yalnızca bir öğüttür." },

  // ═ İNŞİKÂK (84) ══════════════════════════════════════════
  { id: "mg-84-6", mood: "sabir", title: "Emek ve Karşılık", source: "İnşikâk Suresi • 6. Ayet",
    ar: "يَا أَيُّهَا الْإِنسَانُ إِنَّكَ كَادِحٌ إِلَىٰ رَبِّكَ كَدْحًا فَمُلَاقِيهِ",
    tr: "Ey insan, sen Rabbine doğru yorulup duruyorsun; onunla karşılaşacaksın." },

  // ═ BURÛC (85) ════════════════════════════════════════════
  { id: "mg-85-11", mood: "cennet", title: "İman Edip Salih Amel", source: "Burûc Suresi • 11. Ayet",
    ar: "إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ لَهُمْ جَنَّاتٌ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ",
    tr: "İnanıp salih amel işleyenler için altından ırmaklar akan cennetler vardır." },

  // ═ TÂRIK (86) ════════════════════════════════════════════
  { id: "mg-86-17", mood: "zafer", title: "İnkârcılara Vakit Ver", source: "Târik Suresi • 17. Ayet",
    ar: "فَأَعْطِ الْكَافِرَ يَوْمًا فَيَا مِهَادًا",
    tr: "İnkârcılara gönlünce bir süre tanı; onlara fırsat ver." },

  // ═ A'lâ (87) ═════════════════════════════════════════════
  { id: "mg-87-1", mood: "sukur", title: "Yüce Rabbin", source: "A'lâ Suresi • 1. Ayet",
    ar: "سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى",
    tr: "Yüce Rabbinin adını tespih et." },
  { id: "mg-87-8", mood: "huzur", title: "Kolaylaştırırız", source: "A'lâ Suresi • 8. Ayet",
    ar: "وَنُيَسِّرُكَ لِلْيُسْرَىٰ",
    tr: "Seni en kolaya muvaffak kılacağız." },

  // ═ GÂŞİYE (88) ═══════════════════════════════════════════
  { id: "mg-88-21", mood: "ilim", title: "Sen Yalnız Öğütçüsün", source: "Gâşiye Suresi • 21. Ayet",
    ar: "فَذَكِّرْ إِنَّمَا أَنتَ مُذَكِّرٌ",
    tr: "Öğüt ver; sen yalnızca bir öğütçüsün." },

  // ═ FECR ve LÂYL ══════════════════════════════════════════
  { id: "mg-92-4", mood: "huzur", title: "Emekleriniz Farklıdır", source: "Leyl Suresi • 4. Ayet",
    ar: "إِنَّ سَعْيَكُمْ لَشَتَّىٰ",
    tr: "Emekleriniz elbette farklıdır." },
  { id: "mg-93-4", mood: "huzur", title: "Sonra Hayırlısı", source: "Duhâ Suresi • 4. Ayet",
    ar: "وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ",
    tr: "Şüphesiz ahiret sizin için dünyadan hayırlıdır." },
  { id: "mg-93-5", mood: "aile", title: "Rabbin Verir", source: "Duhâ Suresi • 5. Ayet",
    ar: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    tr: "Rabbin sana verecek ve sen de razı olacaksın." },

  // ═ Rahmân (55) ═══════════════════════════════════════════
  { id: "mg-55-1", mood: "rahmet", title: "Rahmân", source: "Rahmân Suresi • 1. Ayet",
    ar: "الرَّحْمَٰنُ",
    tr: "Rahmân (Allah)." },
  { id: "mg-55-13", mood: "sukur", title: "Hangi Nimeti İnkar", source: "Rahmân Suresi • 13. Ayet",
    ar: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    tr: "Rabbinizin hangi nimetlerini inkâr ediyorsunuz?" },

  // ═ VAÂRIA (56) ═══════════════════════════════════════════
  { id: "mg-56-10", mood: "zafer", title: "Öncüler", source: "Vâkıa Suresi • 10. Ayet",
    ar: "وَالسَّابِقُونَ السَّابِقُونَ",
    tr: "Öncüler, öncüler." },
  { id: "mg-56-11", mood: "zafer", title: "Yaklaştırılanlar", source: "Vâkıa Suresi • 11. Ayet",
    ar: "أُولَٰئِكَ الْمُقَرَّبُونَ",
    tr: "İşte onlar, Allah'a yaklaştırılmışlardır." },

  // ═ HADÎD (57) ═════════════════════════════════════════════
  { id: "mg-57-4", mood: "huzur", title: "Neredeysen O Yanında", source: "Hadîd Suresi • 4. Ayet",
    ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
    tr: "Nerede olursanız O sizinle beraberdir; Allah, yaptıklarınızı görendir." },
  { id: "mg-57-20", mood: "huzur", title: "Dünya Süsü", source: "Hadîd Suresi • 20. Ayet",
    ar: "اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ",
    tr: "Bilin ki dünya hayatı ancak bir oyun ve eğlencedir." },

  // ═ MUCÂDELE (58) ═════════════════════════════════════════
  { id: "mg-58-21", mood: "zafer", title: "Galip Gelmeye Yazıldı", source: "Mucâdele Suresi • 21. Ayet",
    ar: "كَتَبَ اللَّهُ لَأَغْلِبَنَّ أَنَا وَرُسُلِي إِنَّ اللَّهَ قَوِيٌّ عَزِيزٌ",
    tr: "Allah yazmıştır: Ben ve elçilerim mutlaka galip geleceğiz; Allah güçlüdür, üstündür." },

  // ═ HAŞR (59) ═════════════════════════════════════════════
  { id: "mg-59-9", mood: "sevgi", title: "Kardeşine Tercih", source: "Haşr Suresi • 9. Ayet",
    ar: "وَيُؤْثِرُونَ عَلَىٰ أَنفُسِهِمْ وَلَوْ كَانَ بِهِمْ خَصَاصَةٌ",
    tr: "Kendileri sıkıntıda olsalar bile onları kendilerine tercih ederler." },
  { id: "mg-59-21", mood: "imtihan", title: "Kur'an Dağ Etseler", source: "Haşr Suresi • 21. Ayet",
    ar: "لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُ خَاشِعًا مُّتَصَدِّعًا مِّنْ خَشْيَةِ اللَّهِ",
    tr: "Bu Kur'an'ı bir dağa indirmiş olsaydık, onu Allah korkusundan titreyip parçalanmış görürdün." },
  { id: "mg-59-23", mood: "huzur", title: "Es-Selâm", source: "Haşr Suresi • 23. Ayet",
    ar: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ",
    tr: "O Allah'tır; O'ndan başka ilâh yoktur, meliktir, kutsaldır, selâmdır." },

  // ═ MÜMTEHİNE (60) ════════════════════════════════════════
  { id: "mg-60-8", mood: "sevgi", title: "Adaletli Davranın", source: "Mümtehine Suresi • 8. Ayet",
    ar: "لَا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ فِي الدِّينِ وَلَمْ يُخْرِجُوكُم مِّن دِيَارِكُمْ أَن تَبَرُّوهُمْ وَتُقْسِطُوا إِلَيْهِمْ",
    tr: "Allah, sizinle savaşmayan ve sizi yurtlarından çıkarmayanlara iyilik etmenizi ve onlara adaletli davranmanızı yasaklamıyor." },

  // ═ SAFF (61) ═══════════════════════════════════════════════
  { id: "mg-61-13", mood: "aile", title: "Yakın Zafer", source: "Saff Suresi • 13. Ayet",
    ar: "نَصْرٌ مِّنَ اللَّهِ وَفَتْحٌ قَرِيبٌ وَبَشِّرِ الْمُؤْمِنِينَ",
    tr: "Allah'tan bir yardım ve yakın bir zafer; müjdele inananları." },
  { id: "mg-61-14", mood: "zafer", title: "Allah'a Yardımcılar", source: "Saff Suresi • 14. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا أَنصَارَ اللَّهِ",
    tr: "Ey iman edenler, Allah'ın yardımcıları olun." },

  // ═ CUMA (62) ═══════════════════════════════════════════════
  { id: "mg-62-9", mood: "huzur", title: "Cuma Ezanı", source: "Cuma Suresi • 9. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ",
    tr: "Ey iman edenler, Cuma günü namaz için çağrı yapıldığında Allah'ı anmaya koşun." },
  { id: "mg-62-10", mood: "sukur", title: "Namaz Bitince", source: "Cuma Suresi • 10. Ayet",
    ar: "فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ",
    tr: "Namaz bitince yeryüzüne dağılın ve Allah'ın lütfunu arayın." },

  // ═ MÜNAFİKÛN (63) ═════════════════════════════════════════
  { id: "mg-63-9", mood: "aile", title: "Mal & Çocuk Aldatır", source: "Münafikûn Suresi • 9. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُلْهِكُمْ أَمْوَالُكُمْ وَلَا أَوْلَادُكُمْ عَن ذِكْرِ اللَّهِ",
    tr: "Ey iman edenler, mallarınız ve çocuklarınız sizi Allah'ı anmaktan alıkoymasın." },
  { id: "mg-63-10", mood: "sukur", title: "Vermeden Önce", source: "Münafikûn Suresi • 10. Ayet",
    ar: "وَأَنفِقُوا مِن مَّا رَزَقْنَاكُم مِّن قَبْلِ أَن يَأْتِيَ أَحَدَكُمُ الْمَوْتُ",
    tr: "Sizden birine ölüm gelmeden önce, size verdiğimiz şeylerden harcayın." },

  // ═ TAHÂRİM (66) ═══════════════════════════════════════════
  { id: "mg-66-8", mood: "af", title: "Samimi Tövbe", source: "Tahrîm Suresi • 8. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا",
    tr: "Ey iman edenler, samimi bir tövbe ile Allah'a dönün." },

  // ═ MÛZZEMMİL - HUCURÂT ════════════════════════════════════
  { id: "mg-49-10", mood: "aile", title: "Kardeşler", source: "Hucurât Suresi • 10. Ayet",
    ar: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ",
    tr: "İnananlar birbirlerinin kardeşleridir; kardeşlerinizi sulhunuzu tesis edin." },
  { id: "mg-49-13", mood: "sevgi", title: "En Değerli", source: "Hucurât Suresi • 13. Ayet",
    ar: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ",
    tr: "Allah katında en değerliniz, O'na karşı en takvalı olanınızdır." },
  { id: "mg-49-12", mood: "af", title: "Söylenti Yerine", source: "Hucurât Suresi • 12. Ayet",
    ar: "وَاجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ",
    tr: "Zannın çoğundan kaçının; çünkü zannın bir kısmı günahtır." },
  { id: "mg-49-9", mood: "aile", title: "Aralarını Düzelt", source: "Hucurât Suresi • 9. Ayet",
    ar: "وَإِن طَائِفَتَانِ مِنَ الْمُؤْمِنِينَ اقْتَتَلُوا فَأَصْلِحُوا بَيْنَهُمَا",
    tr: "İnananlardan iki grup savaşırsa aralarını düzeltin." },
  { id: "mg-49-6", mood: "huzur", title: "Fâsık Haberi", source: "Hucurât Suresi • 6. Ayet",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُم فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا",
    tr: "Ey iman edenler, fâsık bir kimse size bir haber getirirse doğruluğunu araştırın." },

  // ═ KAFT (50) ═══════════════════════════════════════════════
  { id: "mg-50-16", mood: "huzur", title: "Şahdamarından Yakın", source: "Kâf Suresi • 16. Ayet",
    ar: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
    tr: "Biz ona şah damarından daha yakınız." },

  // ═ ZÂRİYÂT (51) ═══════════════════════════════════════════
  { id: "mg-51-56", mood: "aile", title: "İnsan ve Cinlerin Yaratılış Amacı", source: "Zâriyât Suresi • 56. Ayet",
    ar: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
    tr: "Ben cinleri ve insanları yalnızca Bana kulluk etsinler diye yarattım." },

  // ═ TÛR (52) ════════════════════════════════════════════════
  { id: "mg-52-48", mood: "sabir", title: "Sabret, Rabbini Bekle", source: "Tûr Suresi • 48. Ayet",
    ar: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا",
    tr: "Rabbinin hükmüne sabret; elbette sen Bizim gözümüzün önündesin." },

  // ═ KUMAR (75) ═════════════════════════════════════════════
  { id: "mg-75-4", mood: "huzur", title: "Parmakları Toplar", source: "Kıyâme Suresi • 4. Ayet",
    ar: "بَلْ قَادِرُونَ عَلَىٰ أَن يُسَوِّيَ بَنَانَهُ",
    tr: "Hayır, parmak uçlarını bile yeniden düzenlemeye gücü yeter." },

  // ═ MUTAFFİFÎN (83) ════════════════════════════════════════
  { id: "mg-83-26", mood: "sukur", title: "Mühürlenmiş Keyif", source: "Mutaffifîn Suresi • 26. Ayet",
    ar: "خِتَامُهُ مِسْكٌ وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ",
    tr: "Onun mühürü misktir; bunun için yarışanlar yarışsın." },

  // ═ TEVBE (9) → Fatih'ten kısa destekler ═══════════════════
  { id: "mg-9-129", mood: "aile", title: "Vekil Olarak O Yeter", source: "Tevbe Suresi • 129. Ayet",
    ar: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    tr: "Bana Allah yeter; O'ndan başka ilâh yoktur. O'na tevekkül ettim; O, yüce Arş'ın sahibidir." },
];
