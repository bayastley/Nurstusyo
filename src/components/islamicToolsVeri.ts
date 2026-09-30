// ════════════════════════════════════════════════════════
// ISLAMICTOOLSVERI.TS — İslami Araçlar veri blokları
// IslamicToolsPanel.tsx'den ayrıldı (SRP adım 9, 30.09)
// 114 sure · cüz haritası · dualar · zikirler · namaz vakti yardımcıları
// ════════════════════════════════════════════════════════

// ─── 114 SURE (hatim takibi) ───
export const SURE_LISTESI: Array<{ n: number; ad: string; ayet: number }> = [
  { n: 1, ad: "Fâtiha", ayet: 7 }, { n: 2, ad: "Bakara", ayet: 286 }, { n: 3, ad: "Âl-i İmrân", ayet: 200 }, { n: 4, ad: "Nisâ", ayet: 176 }, { n: 5, ad: "Mâide", ayet: 120 }, { n: 6, ad: "En'âm", ayet: 165 }, { n: 7, ad: "A'râf", ayet: 206 }, { n: 8, ad: "Enfâl", ayet: 75 }, { n: 9, ad: "Tevbe", ayet: 129 }, { n: 10, ad: "Yûnus", ayet: 109 },
  { n: 11, ad: "Hûd", ayet: 123 }, { n: 12, ad: "Yûsuf", ayet: 111 }, { n: 13, ad: "Ra'd", ayet: 43 }, { n: 14, ad: "İbrâhîm", ayet: 52 }, { n: 15, ad: "Hicr", ayet: 99 }, { n: 16, ad: "Nahl", ayet: 128 }, { n: 17, ad: "İsrâ", ayet: 111 }, { n: 18, ad: "Kehf", ayet: 110 }, { n: 19, ad: "Meryem", ayet: 98 }, { n: 20, ad: "Tâhâ", ayet: 135 },
  { n: 21, ad: "Enbiyâ", ayet: 112 }, { n: 22, ad: "Hac", ayet: 78 }, { n: 23, ad: "Mü'minûn", ayet: 118 }, { n: 24, ad: "Nûr", ayet: 64 }, { n: 25, ad: "Furkân", ayet: 77 }, { n: 26, ad: "Şuarâ", ayet: 227 }, { n: 27, ad: "Neml", ayet: 93 }, { n: 28, ad: "Kasas", ayet: 88 }, { n: 29, ad: "Ankebût", ayet: 69 }, { n: 30, ad: "Rûm", ayet: 60 },
  { n: 31, ad: "Lokmân", ayet: 34 }, { n: 32, ad: "Secde", ayet: 30 }, { n: 33, ad: "Ahzâb", ayet: 73 }, { n: 34, ad: "Sebe", ayet: 54 }, { n: 35, ad: "Fâtır", ayet: 45 }, { n: 36, ad: "Yâsîn", ayet: 83 }, { n: 37, ad: "Sâffât", ayet: 182 }, { n: 38, ad: "Sâd", ayet: 88 }, { n: 39, ad: "Zümer", ayet: 75 }, { n: 40, ad: "Mü'min", ayet: 85 },
  { n: 41, ad: "Fussilet", ayet: 54 }, { n: 42, ad: "Şûrâ", ayet: 53 }, { n: 43, ad: "Zuhruf", ayet: 89 }, { n: 44, ad: "Duhân", ayet: 59 }, { n: 45, ad: "Câsiye", ayet: 37 }, { n: 46, ad: "Ahkâf", ayet: 35 }, { n: 47, ad: "Muhammed", ayet: 38 }, { n: 48, ad: "Fetih", ayet: 29 }, { n: 49, ad: "Hucurât", ayet: 18 }, { n: 50, ad: "Kâf", ayet: 45 },
  { n: 51, ad: "Zâriyât", ayet: 60 }, { n: 52, ad: "Tûr", ayet: 49 }, { n: 53, ad: "Necm", ayet: 62 }, { n: 54, ad: "Kamer", ayet: 55 }, { n: 55, ad: "Rahmân", ayet: 78 }, { n: 56, ad: "Vâkıa", ayet: 96 }, { n: 57, ad: "Hadîd", ayet: 29 }, { n: 58, ad: "Mücâdele", ayet: 22 }, { n: 59, ad: "Haşr", ayet: 24 }, { n: 60, ad: "Mümtehine", ayet: 13 },
  { n: 61, ad: "Saff", ayet: 14 }, { n: 62, ad: "Cuma", ayet: 11 }, { n: 63, ad: "Münâfikûn", ayet: 11 }, { n: 64, ad: "Teğâbün", ayet: 18 }, { n: 65, ad: "Talâk", ayet: 12 }, { n: 66, ad: "Tahrîm", ayet: 12 }, { n: 67, ad: "Mülk", ayet: 30 }, { n: 68, ad: "Kalem", ayet: 52 }, { n: 69, ad: "Hâkka", ayet: 52 }, { n: 70, ad: "Meâric", ayet: 44 },
  { n: 71, ad: "Nûh", ayet: 28 }, { n: 72, ad: "Cinn", ayet: 28 }, { n: 73, ad: "Müzzemmil", ayet: 20 }, { n: 74, ad: "Müddessir", ayet: 56 }, { n: 75, ad: "Kıyâmet", ayet: 40 }, { n: 76, ad: "İnsân", ayet: 31 }, { n: 77, ad: "Mürselât", ayet: 50 }, { n: 78, ad: "Nebe", ayet: 40 }, { n: 79, ad: "Nâziât", ayet: 46 }, { n: 80, ad: "Abese", ayet: 42 },
  { n: 81, ad: "Tekvîr", ayet: 29 }, { n: 82, ad: "İnfitâr", ayet: 19 }, { n: 83, ad: "Mutaffifîn", ayet: 36 }, { n: 84, ad: "İnşikâk", ayet: 25 }, { n: 85, ad: "Bürûc", ayet: 22 }, { n: 86, ad: "Târik", ayet: 17 }, { n: 87, ad: "A'lâ", ayet: 19 }, { n: 88, ad: "Ğâşiye", ayet: 26 }, { n: 89, ad: "Fecr", ayet: 30 }, { n: 90, ad: "Beled", ayet: 20 },
  { n: 91, ad: "Şems", ayet: 15 }, { n: 92, ad: "Leyl", ayet: 21 }, { n: 93, ad: "Duhâ", ayet: 11 }, { n: 94, ad: "İnşirâh", ayet: 8 }, { n: 95, ad: "Tîn", ayet: 8 }, { n: 96, ad: "Alak", ayet: 19 }, { n: 97, ad: "Kadr", ayet: 5 }, { n: 98, ad: "Beyyine", ayet: 8 }, { n: 99, ad: "Zilzâl", ayet: 8 }, { n: 100, ad: "Âdiyât", ayet: 11 },
  { n: 101, ad: "Kâria", ayet: 11 }, { n: 102, ad: "Tekâsür", ayet: 8 }, { n: 103, ad: "Asr", ayet: 3 }, { n: 104, ad: "Hümeze", ayet: 9 }, { n: 105, ad: "Fîl", ayet: 5 }, { n: 106, ad: "Kureyş", ayet: 4 }, { n: 107, ad: "Mâûn", ayet: 7 }, { n: 108, ad: "Kevser", ayet: 3 }, { n: 109, ad: "Kâfirûn", ayet: 6 }, { n: 110, ad: "Nasr", ayet: 3 },
  { n: 111, ad: "Tebbet", ayet: 5 }, { n: 112, ad: "İhlâs", ayet: 4 }, { n: 113, ad: "Felak", ayet: 5 }, { n: 114, ad: "Nâs", ayet: 6 },
];

// ★ CÜZ HARİTASI — 30 cüz; her hücre, o cüzden geçen surelerin işaretlenme oranıyla dolar (madde 5)
export const CUZ_SURELER: number[][] = [
  [1], [2], [2, 3], [3, 4], [4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  [9, 10, 11], [10, 11, 12], [12, 13, 14], [14, 15, 16], [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 24], [24, 25, 26], [26, 27, 28],
  [28, 29, 30, 31, 32, 33], [33, 34, 35, 36], [36, 37, 38, 39], [39, 40, 41], [41, 42, 43, 44, 45], [45, 46, 47, 48, 49, 50, 51],
  [51, 52, 53, 54, 55, 56, 57], [57, 58, 59, 60, 61, 62, 63, 64, 65, 66],
  [66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
  [77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
];

// ★ DUA TAKİBİ (madde 58) — sabah/akşam ezkârını dinle-okuma modu + okundu işaretleme
export const DAILY_DUAS = [
  { title: "Sabah Ezkarı", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", text: "Sabaha erdik; mülk Allah'ındır, hamd Allah'adır. Allah'tan başka ilah yoktur; O tektir, ortağı yoktur.", source: "Müslim, Zikr 24 (IV/2088)" },
  { title: "Akşam Ezkarı", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", text: "Akşama erdik; mülk Allah'ındır, hamd Allah'adır. Allah'tan başka ilah yoktur; O tektir, ortağı yoktur.", source: "Müslim, Zikr 24 (IV/2088)" },
  { title: "Yemek Öncesi Duası", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", text: "Allah'ın adıyla ve Allah'ın bereketiyle.", source: "Ebû Dâvûd, Et'ime 4; Tirmizî, Et'ime 38" },
  { title: "Yemek Sonrası Duası", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", text: "Bizi yediren, içiren ve Müslüman kılan Allah'a hamd olsun.", source: "Tirmizî, Daavât 55; Ebû Dâvûd, Et'ime 51" },
  { title: "Uykudan Uyanınca", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", text: "Bizi öldürdükten sonra dirilten Allah'a hamd olsun; dönüş O'nadır.", source: "Buhârî, Daavât 7; Müslim, Zikr 21" },
  { title: "Uyumadan Önce", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", text: "Allah'ım! Senin adınla ölür ve dirilirim.", source: "Buhârî, Daavât 7; Müslim, Zikr 22" },
  { title: "Yola Çıkınca (Seyahat Duası)", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", text: "Bunu bizim emrimize veren (Allah) ne yücedir; biz bunu kendimize bağlayamayacaktık.", source: "Müslim, Hac 425; Ebû Dâvûd, Cihâd 78" },
  { title: "Tuvalete Girerken", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ", text: "Allah'ım! Erkek ve dişi şeytanların şerrinden Sana sığınırım.", source: "Buhârî, Vudû 3; Müslim, Hayz 332" },
  { title: "Tuvalete Çıkınca", arabic: "غُفْرَانَكَ", text: "Senin mağfiretini (bağışlanmanı) dilerim.", source: "Ebû Dâvûd, Tahâret 16; Tirmizî, Vudû 6" },
  { title: "Evden Çıkarken", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", text: "Allah'ın adıyla (çıkarım), Allah'a tevekkül ettim; güç ve kuvvet ancak Allah'ladır.", source: "Ebû Dâvûd, Vitr 26; Tirmizî, Daavât 32" },
  { title: "Eve Girerken", arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا", text: "Allah'ın adıyla girdik, Allah'ın adıyla çıktık; Rabbimize tevekkül ettik.", source: "Ebû Dâvûd, Vitr 26; Hâkim, Müstedrek" },
  { title: "Korku Duası", arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ", text: "Aziz ve Halim olan Allah'tan başka ilah yoktur; büyük Arş'ın Rabbi Allah'tan başka ilah yoktur.", source: "Buhârî, Enbiyâ 10; Müslim, Zikr 47" },
  { title: "Hıçkırık / Üzüntü Duası", arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْكَرِيمُ الْحَلِيمُ، سُبْحَانَ اللَّهِ رَبِّ الْعَرْشِ الْعَظِيمِ", text: "Kerim ve Halim olan Allah'tan başka ilah yoktur; büyük Arş'ın Rabbi olan Allah ne yücedir.", source: "Tirmizî, Daavât 84; Ebû Dâvûd, Vitr" },
  { title: "Keder ve Kaygı Duası", arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ... أَسْأَلُكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي", text: "Allah'ım! Ben Senin kulun... Kur'an'ı gönlümün baharı, göğsümün nûru eyle. Hüznümü gider, derdimi çöz.", source: "Ahmed b. Hanbel, I/391 (sahih: Ahmed, Müsned)" },
  { title: "Hayırlı İşe Başlarken", arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ، اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا", text: "Rahman ve Rahîm Allah'ın adıyla. Allah'ım! Kolaylaştırmadığın hiçbir şey kolay değildir.", source: "İbn Hibbân, Tevhit 973; Hâkim" },
  { title: "Zorluk Anında", arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", text: "Senden başka ilah yoktur, Sen yücesin; gerçekten ben zalimlerden oldum. (Yunus Duası)", source: "Tirmizî, Daavât 86 (Kur'an: Enbiyâ 87)" },
  { title: "Borçlu İken", arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ", text: "Allah'ım! Helâlınla haramından beni kâğı kıl; fazlınla Sen'den başkasından beni müstağni kıl.", source: "Tirmizî, Daavât 36; Ebû Dâvûd, Vitr 26" },
  { title: "Yağmur Duası", arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا", text: "Allah'ım! Faydalı yağmur yağdır.", source: "Buhârî, İstisâ 20; Ebû Dâvûd, Salât 315" },
  { title: "Rüya Görünce / Sevinince", arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ", text: "Nimetleriyle hayırların tamamlandığı Allah'a hamd olsun.", source: "İbn Mâce, Dua 10; Müsned kaynakları" },
  { title: "Aksirince", arabic: "يَرْحَمُكَ اللَّهُ → يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ", text: "Aksıran 'Allah size merhamet etsin' der, duyan 'Allah size hidayet versin, hâlinizi ıslah etsin' karşılığını verir.", source: "Buhârî, Edeb 124; Müslim, Zikr 44" },
  { title: "Camiye Girerken", arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", text: "Allah'ım! Benim için rahmet kapılarını aç.", source: "Müslim, Salât 14 (IV/2092)" },
  { title: "Camiden Çıkarken", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", text: "Allah'ım! Senden fazlını diliyorum.", source: "Müslim, Salât 14 (IV/2092)" },
];

export const ZIKIRLER = [
  { name: "Sübhanallah", count: 33, text: "Allah'ı tüm noksanlıklardan tenzih ederim", source: "Müslim, Salât 49" },
  { name: "Elhamdülillah", count: 33, text: "Hamd Allah'a mahsustur", source: "Müslim, Salât 49" },
  { name: "Allahu Ekber", count: 34, text: "Allah en yücedir", source: "Buhârî, Teheccüd 8; Müslim, Salât 49" },
  { name: "La ilahe illallah", count: 100, text: "Allah'tan başka ilah yoktur", source: "Buhârî, Zikr 12 (en sevimli kelime)" },
  { name: "Estağfirullah", count: 100, text: "Allah'tan bağışlanma dilerim", source: "Buhârî, Daavât 12 (günde 70-100 istiğfar)" },
  { name: "Salavat-ı Şerife", count: 100, text: "Allah'ım! Muhammed'e salat et", source: "Müslim, Salât 70 (kim 10 salat getirirse...)" },
  { name: "Hasbünallah", count: 100, text: "Bize Allah yeter, O ne güzel vekildir", source: "Buhârî, Tefsîr 9 (İbrâhim'in sözü)" },
  { name: "Sübhanallahi ve bihamdihî", count: 100, text: "Günde 100 kez okuyanın günahları deniz köpüğü kadar da affedilir", source: "Buhârî, Edeb 81; Müslim, Zikr 31" },
  { name: "La havle ve la kuvvete illa billah", count: 100, text: "Güç ve kuvvet ancak Allah'ladır — cennet hazinelerinden biridir", source: "Buhârî, Rekâk; Müslim, Zikr 34" },
  { name: "Sübhanallahi ve bihamdihî sübhanallahil-azim", count: 100, text: "Bu iki kelime hafiftir, terâzuda ağırdır", source: "Buhârî, Tevhid 15; Müslim, Musâfirîn 269" },
  { name: "Tövbe istiğfar (Sayyidü'l-İstiğfar)", count: 33, text: "Allah'ım! Sen benim Rabbimsin... Senin afvına layık değilsin ki — Nûh a.s.'ın duası", source: "Buhârî, Daavât 2; Müslim, Zikr 27" },
  { name: "Dâbbetü'l-erz: Ezkar-ı Sebah", count: 10, text: "Sabah-akşam üçer kez okunması müstehab: Ayetel Kürsi + İhlas, Felak, Nas", source: "Ebû Dâvûd, Fezâil 26 (Erza-ı Sebah)" },
];

const PRAYER_NAMES = [
  { label: "İmsak", key: "Fajr" },
  { label: "Güneş", key: "Sunrise" },
  { label: "Öğle", key: "Dhuhr" },
  { label: "İkindi", key: "Asr" },
  { label: "Akşam", key: "Maghrib" },
  { label: "Yatsı", key: "Isha" },
];

export function parsePrayerTimes(data: Record<string, string>): Array<{ name: string; time: string }> {
  return PRAYER_NAMES.map(({ label, key }) => ({
    name: label,
    time: data[key] || "--:--",
  }));
}

export const CITY_OPTIONS = ["İstanbul", "Ankara", "İzmir", "Bursa", "Konya", "Adana", "Gaziantep", "Trabzon"];

export function minutesFromTime(time: string): number | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

// ─── KIBLE HESAPLAMA (modül seviyesi — her yerden kullanılabilir) ───
const MEKKE_LAT = 21.4225;
const MEKKE_LON = 39.8262;

export const getQiblaForCity = (cityLat: number, cityLon: number): number => {
  const φ1 = cityLat * Math.PI / 180;
  const λ1 = cityLon * Math.PI / 180;
  const φ2 = MEKKE_LAT * Math.PI / 180;
  const λ2 = MEKKE_LON * Math.PI / 180;
  const Δλ = λ2 - λ1;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  return (angle + 360) % 360;
};