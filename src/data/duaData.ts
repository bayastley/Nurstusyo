// ════════════════════════════════════════════════════════
// DUADATA.TS — Keşfet > Bebek Duası Köşesi (madde 35) + Dua Vakit Rehberi (madde 61)
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 35: BEBEK DUASI & DOĞUM KÖŞESİ ─────────────────────────
export interface BebekDua { baslik: string; ar: string; tr: string; kaynak: string }
export const BEBEK_DUALARI: BebekDua[] = [
  { baslik: "Çocuk Duası (nihai)", ar: "رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ", tr: "Rabbim! Bana katından tertemiz bir nesil bağışla; şüphesiz sen duaları işitirsin.", kaynak: "Âl-i İmrân 3:38" },
  { baslik: "Yeni Doğan Duası", ar: "أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ", tr: "Seni her şeytandan ve her zehirli hayvandan, Allah'ın kamil kelimeleriyle koruyorum.", kaynak: "Buhari, 'Amel, 54" },
  { baslik: "Adâk ve İhlas Duası", ar: "اللَّهُمَّ اجْعَلْهُ لَكَ نَذْرًا وَصَالِحًا", tr: "Allah'ım! Onu (çocuğumu) sana makbul ve salih eyle.", kaynak: "Tirmizi, Birr, 26 (meâl)" },
  { baslik: "Ezan ile Doğum Sünneti", ar: "(Sağ kulagina ezan, sol kulagina kamet okunur)", tr: "Peygamber (s.a.v.) Hz. Hasan'a ezan okuyarak dua etmiştir — doğan çocuğun sağ kulağına ezan, sol kulağına kamet okunur.", kaynak: "Ebu Dâvûd, Adab, 107" },
  { baslik: "Çocuk Koruma Duası", ar: "أُعِيذُهُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", tr: "İkisini de her şeytandan, her zehirli hayvandan ve her nazar (kötü göz) sonucundan Allah'ın kamil kelimeleriyle koruyorum.", kaynak: "Buhari, 'Amel, 54" },
  { baslik: "Adak Kurbanı Sünneti", ar: "(Doğum nedeniyle adanan kurban kesilir; et dağıtılır, aile yemez)", tr: "Doğum nedeniyle adılanan kurban kesilir; aile yemez, ihtiyaç sahiplerine dağıtılır — adak kurbanı sünneti böyledir.", kaynak: "Diyanet İlmihal — Adak bölümü" },
  { baslik: "İlk Kelime / Eğitim Duası", ar: "رَبِّ زِدْنِي عِلْمًا", tr: "Rabbim! Benim bilgimi artır.", kaynak: "Tâhâ 20:114 — çocuğa konuşma ve öğrenme döneminde okunur" },
  { baslik: "Çocuğa Kur'an Tevdi Duası", ar: "(Çocuk 3-4 yaşına gelince besmele ve kısa sureler öğretilir)", tr: "Küçük yaşta Kur'an ile temas: kulaklarına besmele fısıldanır, kısa sureler ezberletilir — ilk adım Fâtiha ve İhlâs'tır.", kaynak: "Diyanet İlmihal — Çocuğun Dinî Eğitimi" },
  { baslik: "Yaş Duası (Evlat için)", ar: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", tr: "Rabbim! Beni küçükken yetiştirdikleri gibi onlara da merhamet eyle (anne babaya dua).", kaynak: "İsrâ 17:24 — çocuk yetiştirirken okunur" },
  { baslik: "Yedi Yaş Namaz Alışkanlığı", ar: "(7 yaşında namaza alıştırılır, 10 yaşında eğitim ile güdümlenir)", tr: "Çocuk 7 yaşında namaza alıştırılır, 10 yaşında terk etmemesi için nazikçe eğitilir — bu yaş döneminde sabırla öğretme şarttır.", kaynak: "Ebu Dâvûd, Salât, 26" },
];

// ── 61: DUA VAKTİ REHBERİ (duruma göre dua arşivi) ─────────
export interface DuaRehber { durum: string; dua: string; kaynak: string }
export const DUA_REHBERİ: DuaRehber[] = [
  { durum: "Yolculuğa çıkarken", dua: "Sübhâne'l-lezî sahhara lenâ hâzâ ve mâ kunnâ lehu mukrinîn…", kaynak: "Müslim, Hac, 425" },
  { durum: "Hasta ziyaretinde", dua: "Lâ ba's, tahûrün inşâ'allâh — 'zarar yok, temizlenmek içindir' + 7 kez istihzar duası.", kaynak: "Buhari, Merdâ, 16" },
  { durum: "Alışverişte (haramdan korunma)", dua: "Besmele ile gir, sağ ayağıyla gir, sol ayağıyla çık; alış-verişte 'Lâ havle velâ kuvvete illâ billâh' okuyan cenneti müjdelenir.", kaynak: "Tirmizi, Daavât, 105 (meâl)" },
  { durum: "Yemekten önce", dua: "Bismillâhi ve'alâ berekâtillâh", kaynak: "Ebu Dâvûd, Et'ime, 14" },
  { durum: "Yemekten sonra", dua: "Elhamdü lillâhi'llezî et'amena ve sekâna ve ce'alena müslimîn", kaynak: "Tirmizi, Et'ime, 46" },
  { durum: "Uyurken", dua: "Bi-ismike allâhümme emûtu ve ahyâ", kaynak: "Buhari, Daavât, 50" },
  { durum: "Uyanınca", dua: "Elhamdü lillâhi'llezî ahyânâ ba'de mâ emâtenâ ve ileyhi'n-nüşûr", kaynak: "Buhari, Daavât, 50" },
  { durum: "Kabir ziyaretinde", dua: "Es-selâmu aleyküm ehle'd-diyâri mine'l-mü'minîne ve'l-müslimîn…", kaynak: "Müslim, Cenâiz, 103" },
  { durum: "İstihâre (karar verememe)", dua: "Allâhümme innî estehîrüke bi'ilmike… — hayırlıysa kolaylaştır, değilse uzaklaştır.", kaynak: "Buhari, Tevhid, 49" },
  { durum: "Sıkıntı anında", dua: "Lâ ilâhe illâllâhü'l-Azîmu'l-Halîm… Lâ ilâhe illâllâhu Rabbi'l-'arşi'l-azîm", kaynak: "Müslim, Zikir, 49" },
  { durum: "Borçtan kurtulma", dua: "Allâhümme'kfînî bi-halâlike 'an harâmike ve ağninî bi-fadlike ammen sivâke", kaynak: "Tirmizi, Daavât, 36" },
  { durum: "Yağmur duası", dua: "Allâhümme'skı'nâ ğaysen mücîben rebin merî'en", kaynak: "Ebu Dâvûd, Salât, 332" },
];
