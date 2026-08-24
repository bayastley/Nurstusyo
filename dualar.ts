// ════════════════════════════════════════════════════════
// DUALAR.TS — Ayet & Dua Kütüphanesi içeriği
// Türler: ayet · hadis · dua · zikir  |  Duygu etiketleriyle filtrelenir
// ════════════════════════════════════════════════════════

export type LibraryType = "ayet" | "hadis" | "dua" | "zikir";
export type Emotion =
  | "huzur" | "sukur" | "sabir" | "tevekkul"
  | "rahmet" | "ilim" | "namaz";

export interface LibraryItem {
  id: string;
  type: LibraryType;
  title: string;
  ar: string;
  tr: string;
  source: string;      // "Bakara Suresi, 255. Ayet" / "Buhari & Müslim" / "Kadim Dua"
  emotions: Emotion[];
  /** Ayet ise stüdyoda tilavet eşlemesi için */
  s?: number;
  a?: number;
}

export const EMOTIONS: Array<{ id: Emotion | "tum"; label: string }> = [
  { id: "tum", label: "Tüm Duygular" },
  { id: "huzur", label: "Huzur & Sükunet" },
  { id: "sukur", label: "Şükür & Nimet" },
  { id: "sabir", label: "Sabır & Ferahlık" },
  { id: "tevekkul", label: "Tevekkül & Güven" },
  { id: "rahmet", label: "Rahmet & Tövbe" },
  { id: "ilim", label: "İlim & Hikmet" },
  { id: "namaz", label: "Namaz & İbadet" },
];

export const TYPE_TABS: Array<{ id: LibraryType | "tumu"; label: string }> = [
  { id: "tumu", label: "Tümü" },
  { id: "ayet", label: "Ayet-i Kerime" },
  { id: "hadis", label: "Hadis-i Şerif" },
  { id: "dua", label: "Kadim Dua" },
  { id: "zikir", label: "Zikir / Tesbih" },
];

export const TYPE_BADGE: Record<LibraryType, { label: string; color: string }> = {
  ayet: { label: "AYET", color: "#d7aa52" },
  hadis: { label: "HADİS", color: "#34d399" },
  dua: { label: "DUA", color: "#38bdf8" },
  zikir: { label: "ZİKİR", color: "#c084fc" },
};

export const LIBRARY_ITEMS: LibraryItem[] = [
  // ── AYET-İ KERİME ────────────────────────────────────────
  { id: "ay-255", type: "ayet", title: "Ayete'l-Kürsî", s: 2, a: 255,
    ar: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    tr: "Allah, O'ndan başka ilâh yoktur; O diridir, kâimdir, her an yaratıkları gözetip durur.",
    source: "Bakara Suresi, 255. Ayet", emotions: ["tevekkul", "huzur"] },
  { id: "ay-35", type: "ayet", title: "Göklerin ve Yerin Nuru", s: 24, a: 35,
    ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    tr: "Allah, göklerin ve yerin nurudur.",
    source: "Nur Suresi, 35. Ayet", emotions: ["huzur", "ilim"] },
  { id: "ay-6", type: "ayet", title: "Şüphesiz Kolaylıkla Beraber", s: 94, a: 6,
    ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Şüphesiz güçlükle beraber bir kolaylık vardır.",
    source: "İnşirâh Suresi, 6. Ayet", emotions: ["sabir", "huzur"] },
  { id: "ay-286", type: "ayet", title: "Gücümüzün Yetmediğini Yükleme", s: 2, a: 286,
    ar: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
    tr: "Rabbimiz! Unutur ya da yanılırsak bizi sorumlu tutma.",
    source: "Bakara Suresi, 286. Ayet", emotions: ["rahmet", "tevekkul"] },
  { id: "ay-186", type: "ayet", title: "Ben Çok Yakınım", s: 2, a: 186,
    ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    tr: "Kullarım beni senden sorarsa, bilsinler ki ben çok yakınım; bana dua edince duacının duasına karşılık veririm.",
    source: "Bakara Suresi, 186. Ayet", emotions: ["huzur", "rahmet"] },
  { id: "ay-233", type: "ayet", title: "Kalpler Ancak Zikrle", s: 13, a: 28,
    ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    tr: "Bilesiniz ki kalpler ancak Allah'ı zikretmekle huzur bulur.",
    source: "Ra'd Suresi, 28. Ayet", emotions: ["huzur", "namaz"] },
  { id: "ay-13", type: "ayet", title: "Şükrederseniz Artırırım", s: 14, a: 7,
    ar: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    tr: "Şükrederseniz elbette size nimetimi artırırım.",
    source: "İbrâhîm Suresi, 7. Ayet", emotions: ["sukur"] },
  { id: "ay-3", type: "ayet", title: "Kim Allah'a Tevekkül Ederse", s: 65, a: 3,
    ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    tr: "Kim Allah'a tevekkül ederse, O kendisine yeter.",
    source: "Talâk Suresi, 3. Ayet", emotions: ["tevekkul"] },
  { id: "ay-11", type: "ayet", title: "Allah Zulmetmez", s: 4, a: 40,
    ar: "إِنَّ اللَّهَ لَا يَظْلِمُ مِثْقَالَ ذَرَّةٍ",
    tr: "Şüphesiz Allah zerre kadar zulmetmez.",
    source: "Nisâ Suresi, 40. Ayet", emotions: ["ilim", "rahmet"] },
  { id: "ay-90", type: "ayet", title: "Allah Adaleti Emreder", s: 16, a: 90,
    ar: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ",
    tr: "Şüphesiz Allah adaleti, iyiliği ve yakınlara vermeyi emreder.",
    source: "Nahl Suresi, 90. Ayet", emotions: ["ilim", "namaz"] },
  { id: "ay-45", type: "ayet", title: "Namaz Kötülükten Alıkoyar", s: 29, a: 45,
    ar: "وَأَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ",
    tr: "Namazı kıl; şüphesiz namaz hayâsızlıktan ve kötülükten alıkoyar.",
    source: "Ankebût Suresi, 45. Ayet", emotions: ["namaz"] },
  { id: "ay-87", type: "ayet", title: "Yûnus'un Nidası", s: 21, a: 87,
    ar: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    tr: "Senden başka ilâh yoktur; seni tenzih ederim, ben gerçekten haksızlık edenlerden oldum.",
    source: "Enbiyâ Suresi, 87. Ayet", emotions: ["rahmet", "sabir"] },
  // ── HADİS-İ ŞERİF ────────────────────────────────────────
  { id: "hd-niyet", type: "hadis", title: "Ameller Niyete Göredir",
    ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    tr: "Ameller ancak niyetlere göredir; herkese niyet ettiği şey vardır.",
    source: "Buhari & Müslim", emotions: ["ilim", "namaz"] },
  { id: "hd-tebessum", type: "hadis", title: "Tebessüm Sadakadır",
    ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    tr: "Kardeşinin yüzüne tebessüm etmen senin için bir sadakadır.",
    source: "Tirmizi, Birr, 36", emotions: ["sukur", "huzur"] },
  { id: "hd-ahlak", type: "hadis", title: "Güzel Ahlâk",
    ar: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    tr: "Müminlerin imanca en kâmili, ahlâkça en güzel olanıdır.",
    source: "Tirmizi, Radâ, 11", emotions: ["ilim"] },
  { id: "hd-kolay", type: "hadis", title: "Kolaylaştırınız",
    ar: "يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا",
    tr: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.",
    source: "Buhari, İlim, 11", emotions: ["rahmet", "huzur"] },
  { id: "hd-merhamet", type: "hadis", title: "Merhamet Edenlere",
    ar: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ",
    tr: "Merhamet edenlere Rahman merhamet eder; yeryüzündekilere merhamet edin ki göktekiler de size merhamet etsin.",
    source: "Tirmizi, Birr, 16", emotions: ["rahmet"] },
  { id: "hd-zikir", type: "hadis", title: "En Hayırlınız Kur'an Öğrenendir",
    ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    tr: "Sizin en hayırlınız Kur'an'ı öğrenen ve öğreteninizdir.",
    source: "Buhari, Fezâilü'l-Kur'an, 21", emotions: ["ilim", "namaz"] },
  // ── KADİM DUA ────────────────────────────────────────────
  { id: "du-rabbi", type: "dua", title: "Rabbi Yessir Duası",
    ar: "رَبِّ يَسِّرْ وَلَا تُعَسِّرْ رَبِّ تَمِّمْ بِالْخَيْرِ",
    tr: "Rabbim! Kolaylaştır, zorlaştırma. Rabbim! Hayırla tamamla.",
    source: "Hadis-i Şerif / Kadim Dua", emotions: ["tevekkul", "huzur"] },
  { id: "du-dunya", type: "dua", title: "Dünya ve Ahiret İyiliği",
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    tr: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.",
    source: "Bakara Suresi, 201. Ayet", emotions: ["rahmet", "sukur"] },
  { id: "du-istihare", type: "dua", title: "Hayra Yöneliş Duası",
    ar: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ",
    tr: "Allah'ım! Senin ilminle hayır diler, kudretinle güç isterim.",
    source: "İstihâre Duası", emotions: ["tevekkul"] },
  { id: "du-sabah", type: "dua", title: "Sabah-Akşam Zikri",
    ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
    tr: "Allah'ım! Senin sayende sabaha eriştik, senin sayende akşama erdik.",
    source: "Tirmizi, Deavât, 13", emotions: ["sukur", "huzur"] },
  { id: "du-tovbe", type: "dua", title: "Seyyidü'l-İstiğfar",
    ar: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    tr: "Allah'ım! Sen benim Rabbimsin, senden başka ilâh yok; beni sen yarattın, ben senin kulunum.",
    source: "Buhari, Deavât, 2", emotions: ["rahmet", "sabir"] },
  // ── ZİKİR / TESBİH ───────────────────────────────────────
  { id: "zk-subhan", type: "zikir", title: "Sübhanallahi ve Bihamdihi",
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
    tr: "Allah'ı hamd ile tesbih ederim; yüce Allah'ı noksan sıfatlardan tenzih ederim.",
    source: "Buhari, Tevhid, 58", emotions: ["sukur", "huzur"] },
  { id: "zk-hasbuna", type: "zikir", title: "Hasbunallah",
    ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    tr: "Allah bize yeter, O ne güzel vekildir.",
    source: "Âl-i İmrân Suresi, 173. Ayet", emotions: ["tevekkul"] },
  { id: "zk-lailahe", type: "zikir", title: "Kelime-i Tevhid",
    ar: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    tr: "Allah'tan başka ilâh yoktur; O tektir, ortağı yoktur.",
    source: "Buhari, Bed'ü'l-Halk, 11", emotions: ["huzur", "namaz"] },
  { id: "zk-esta", type: "zikir", title: "İstiğfar",
    ar: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
    tr: "Yüce Allah'tan bağışlanma diler, O'na tövbe ederim.",
    source: "Müslim, Zikir, 41", emotions: ["rahmet"] },
  { id: "zk-lahavle", type: "zikir", title: "Lâ Havle ve Lâ Kuvvete",
    ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    tr: "Güç ve kuvvet ancak Allah'tandır.",
    source: "Buhari, Ezan, 7", emotions: ["tevekkul", "sabir"] },
];
