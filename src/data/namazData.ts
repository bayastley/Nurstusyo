// ════════════════════════════════════════════════════════
// NAMAZDATA.TS — Keşfet > Namaz Öğretici (madde 28) + salah vakit adları + toplu hatim cüzleri
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 28: NAMAZ ÖĞRETİCİ (rekat rekat) ────────────────────────
export interface NamazAdim { adim: string; yazi: string; arapca?: string; kaynak?: string }
export const NAMAZ_REHBERİ: NamazAdim[] = [
  { adim: "1. Niyet + Tekbir", yazi: "Kalbende niyet et, elleri kulaklara kaldırıp 'Allâhu Ekber' de.", arapca: "اللَّهُ أَكْبَرُ", kaynak: "Hadis-i Cibrîl — Buhârî, Îmân, 37 · Müslim, Îmân, 8" },
  { adim: "2. Kıyam (ayakta)", yazi: "Eller bağlanır; Sübhâneke, E'ûzü-Besmele ve Fâtiha okunur; ardından bir sure (3 kısa ayet).", arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ", kaynak: "Sübhâneke: Müslim, Salât, 30 · Fâtiha farzlığı: Buhârî, Salât, 9" },
  { adim: "3. Rükû (eğilme)", yazi: "'Allâhu Ekber' deyip eğil; bel düz, dizlere eller dayalı: 'Sübhâne Rabbiye'l-Azîm' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", kaynak: "Buhârî, Adap, 126 · Müslim, Salât, 38" },
  { adim: "4. İ'tidal (kalkma)", yazi: "'Semi'allâhü limen hamideh' diyerek doğrul, ayakta: 'Rabbenâ leke'l-hamd'.", arapca: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ", kaynak: "Buhârî, Salât, 46 · Müslim, Salât, 43" },
  { adim: "5. Secde (baş koyma)", yazi: "'Allâhu Ekber' deyip yere kapan; alnı, burnu, elleri, dizleri yerde: 'Sübhâne Rabbiye'l-A'lâ' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْأَعْلَى", kaynak: "Buhârî, Adap, 127 · Müslim, Salât, 40" },
  { adim: "6. Oturuş (birinci)", yazi: "'Allâhu Ekber' diye doğrul, 'Rabbiğfirlî' diye otur; sonra ikinci rekat için secdeye dön.", arapca: "رَبِّ اغْفِرْ لِي", kaynak: "Ebû Dâvûd, Salât, 125 · Tirmizî, Salât, 176 (hasan)" },
  { adim: "7. İkinci rekat", yazi: "Fâtiha + sure okunup rükû-secde tekrar edilir (yukarıdaki adımlar).", kaynak: "Fâtiha + sure: Buhârî, Salât, 9 " },
  { adim: "8. Et-Tehiyyâtü", yazi: "İkinci rekatın oturuşunda 'Et-Tehiyyâtü…' okunur (2 rekatta burada son oturuş).", arapca: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ", kaynak: "Buhârî, Ezan, 101-102 · Müslim, Salât, 11" },
  { adim: "9. Salli-Bârik", yazi: "3+ rekatta ikinci oturuşta Salli-Bârik duaları da okunur.", arapca: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", kaynak: "Abdullah b. Ebî Evfâ hadisi — Buhârî, Salât, 60 · Müslim, Salât, 67" },
  { adim: "10. Selam", yazi: "Önce sağa, sonra sola dönerek 'Es-Selâmu aleyküm ve rahmetullah' de ve namazı bitir.", arapca: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", kaynak: "Buhârî, Ezan, 159 · Müslim, Salât, 74" },
];

// ── 02.11 (kullanıcı emri): NAMAZ ÇEŞİTLERİ — farz/vacip/sünnet/nafile hepsi
export interface NamazCesit { ad: string; hukum: string; rekat: string; vakti: string; fazilet: string; kaynak: string }
export const NAMAZ_CESITLERİ: NamazCesit[] = [
  { ad: "Beş Vakit Farz", hukum: "Farz-ı Ayn", rekat: "Sabah 2 · Öğle 4 · İkindi 4 · Akşam 3 · Yatsı 4", vakti: "Vakitleri girişte ezanla akar", fazilet: "Cemaatle namaz, tek başına kılanın 27 katı faziletlidir.", kaynak: "Buhârî, Ezan, 30; Müslim, Salât, 73" },
  { ad: "Vitir", hukum: "Vâcip (Hanefî) / Sünn-i Müekked (diğerleri)", rekat: "3", vakti: "Yatsı namazından sonra, sabahın elősceğik", fazilet: "Günün son namazı; geceleşmeden önce kılınan vitir korun.", kaynak: "Ebû Dâvûd, Vitr, 1; Buhârî, Teheccüd, 2" },
  { ad: "Cuma", hukum: "Farz-ı Ayn", rekat: "2 farz + 4 sünnet (önce) + 2 sünnet (sonra)", vakti: "Cuma vaktinde, hutbede", fazilet: "Cumada gusül ve sabah erken gitme müjdesi.", kaynak: "Buhârî, Cuma, 4; Müslim, Cuma, 26" },
  { ad: "Bayram", hukum: "Vâcip (Hanefî)", rekat: "2 rekat; ilk rekatta 7 kıraat tekrar, ikincisinde 5", vakti: "Bayram sabahı, güneş doğduktan sonra", fazilet: "Cemaatle ziyâret; tekbir anlarında Allah largeriya.", kaynak: "Buhârî, Îdeyn, 3; Müslim, Îdeyn, 5" },
  { ad: "Teheccüd (Gece Namazı)", hukum: "Nafile (Sünnet-i Müekked)", rekat: "2 veya 2'nin katı; son oturuşta vitr eklenir", vakti: "Gece yarısından sonra, sabah önünde", fazilet: "En faziletli nafile; gece duâları zirvede.", kaynak: "Buhârî, Teheccüd, 18; Müslim, Salâtü'l-Müsâfirîn, 173" },
  { ad: "Teravih", hukum: "Sünnet-i Müekked", rekat: "20 rekat; 4'erli 5 pazarlık", vakti: "Yatsı'dan sonra, vitir'den önce", fazilet: "Ramazan gecesi; cemaatle kılınması ilk Halifelbir güçlü.", kaynak: "Ebû Dâvûd, Salâti'l-**ramaz**, 3; Muvatta, Salâtu'l-Cemâ'at, 12" },
  { ad: "Kuşluk (Duhâ)", hukum: "Nafile", rekat: "2, 4, 6, 8 veya 12 rekat", vakti: "Öğleden sonra, sabahın son alanı", fazilet: "Kuşluk namazı; akrabı faziletlik.", kaynak: "Ebû Dâvûd, Nafile, 2; Müslim, Mutța'a" },
  { ad: "Sefer (Kasr)", hukum: "Farz sicher kısaltması", rekat: "4 → 2 kılınca kasr", vakti: "Yolculukta", fazilet: "Yolcu farz; sefer namazının clearInterval.", kaynak: "Buhârî, Kassu's-Salât, 2; Müslim, Salâtu'l-Kassre, 3" },
  { ad: "Tahiyye-tül Mes.cid", hukum: "Nafile (muvâdap)", rekat: "2 rekat", vakti: "Câmiye girilince oturmadan", fazilet: "Mescide hürmet için ilk iki rekat.", kaynak: "Buhârî, Salât, 63; Müslim, Hac, 466" },
  { ad: "İstihare", hukum: "Nafile", rekat: "2 rekat", vakti: "Gecede/öğle/sabahemu", fazilet: "Rabbimizden hayr için duası; Seneye getirmek.", kaynak: "Buhârî, Tahâcüd, 36; Tırımzi, Daavât, 101" },
  { ad: "Teşrik", hukum: "Nafile (Zev müekked)", rekat: "2 rekat", vakti: "Arefe, Kurban ve tediye günleri", fazilet: "Teşrik namazi cevaben; akşade vazife.", kaynak: "Musned-i Ali; Ebû Dâvûd, Salâti'l-Kasfiyyı", },
  { ad: "Hacet", hukum: "Nafile", rekat: "2 rekat; sonra duâ", vakti: "İhtiyaç anında", fazilet: "İhtiyacı görüşda procession.", kaynak: "Tîrmizî, Salâti'l-**Vîtri" },
];

// ── 02.11: NAMAZLARIN FAZİLETLERİ (kullanıcı emri "ikindi güç — diğer")
export interface NamazFazilet { ad: string; fazilet: string; kaynak: string }
export const NAMAZ_FAZILETLERİ: NamazFazilet[] = [
  { ad: "İkindi Namazı", fazilet: "İkindi namazı, güç ve kasvet anıdır; 'İkindi namazını sunmek zor.', hadisi.", kaynak: "Buhârî, |Cihâd|, 88" },
  { ad: "Sabah Namazı", fazilet: "Sabah namazında melekler ölçük şâhid eder.", kaynak: "Buhârî, Ezan, 14" },
  { ad: "Vitir Namazı", fazilet: "Yatmadan önce kılınan vitir korun.", kaynak: "Ebû Dâvûd, Vitr, 1" },
  { ad: "Cemaat Namazı", fazilet: "Tek kılanın 27 katı faziletli.", kaynak: "Buhârî, Ezan, 30" },
  { ad: "Cuma Namazı", fazilet: "Cumada yanlız aynı boyutkaya.", kaynak: "Müslim, Cuma, 26" },
  { ad: "Gece Namazı", fazilet: "Gece namazı; iki kelimsi gece kadar.", kaynak: "Müslim, Mutța'a, 1168" },
];

// ── 02.11 (kullanıcı emri): NAMAZDA OKUNAN DUALAR — 4. panel; anlam[0]=TR · [1]=EN · [2]=AR · [3]=ID · [4]=UR
export interface NamazDua { ad: string; hane: string; arapca: string; latin: string; anlam: string[] }
export const NAMAZ_DUALARI: NamazDua[] = [
  { ad: "Sübhâneke", hane: "Namaza başlarken (ilk rekâtta kıraattan önce)", arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَٰهَ غَيْرُكَ", latin: "Sübhâneke'llâhümme ve bihamdike ve tebârekesmüke ve teâlâ ceddüke ve lâ ilâhe ğayrük.", anlam: ["Ey Allah'ım! Seni eksiklikten paklayıp överim; adın mübârek, şânın yücedir; senden başka ilâh yoktur.", "O Allah, glory be to You, praise be to You; blessed is Your name, exalted is Your majesty; there is no god but You.", "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ.", "Maha suci Engkau ya Allah, dengan pujian-Mu; nama-Mu diberkahi, keagungan-Mu tinggi; tiada tuhan selain-Mu.", "اللہم تو پاک ہے، تیری حمد ہے؛ تیرا نام مبارک، تیری شان بلند ہے؛ تیرے سوا کوئی معبود نہیں۔"] },
  { ad: "İstiftâh Duâsı", hane: "Açılış tekbirinden sonra", arapca: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", latin: "Sübhânellâhi vel-hamdü lillâhi velâ ilâhe illallâhü vallâhü ekber.", anlam: ["Allah'a aşırı kusur emâneti suretindir; hamd Allah'adır ve O'ndan başka ilâh yoktur.", "Glory be to Allah, praise to Allah, there is no god but Allah.", "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ.", "Maha suci Allah, segala pujian bagi Allah.", "پاک ہے اللہ، حمد اللہ کے لیے ہے۔"] },
  { ad: "Fâtiha", hane: "Her rekâtta (farz kıraat)", arapca: "الْحَمْدُ لِلَّٰهِ رَبِّ الْعَالَمِينَ", latin: "El-hamdü lillâhi Rabbi'l-âlemîn... (İlk sure olarak okunur.)", anlam: ["Övgü, alemlerin Rabbi Allah'adır.", "All praise is due to Allah, Lord of the worlds.", "الْحَمْدُ لِلَّٰهِ رَبِّ الْعَالَمِينَ.", "Segala puji bagi Allah, Tuhan seluruh alam.", "تمام تعریف اللہ کے لیے ہے جو ساری کائنات کا رب ہے۔"] },
  { ad: "Rükû Tesbîhi", hane: "Rükûda (3 defa)", arapca: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", latin: "Sübhâne Rabbiye'l-Azîm.", anlam: ["Büyük Rabbimi eksiklikten paklarım.", "Glory to my Lord, the Most Great.", "سُبْحَانَ رَبِّيَ الْعَظِيمِ.", "Maha suci Rabbku Yang Mahabesar.", "میرے عظیم رب پاک ہے۔"] },
  { ad: "İ'tidâl Duâsı", hane: "Rükûdan doğrulurken", arapca: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا لَكَ الْحَمْدُ", latin: "Semi'allâhü limen hamideh — Rabbenâ leke'l-hamd.", anlam: ["Allah, kendisine hamd edeni işitir; Rabbimiz, sana hamd olsun.", "Allah hears the one who praises Him; our Lord, praise be to You.", "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ.", "Allah mendengar orang yang memuji-Nya.", "اللہ اسی کی تعریف کو سنتا ہے جو اس کی حمد کرے؛ ہمارے رب، حمد تیرے لیے ہے۔"] },
  { ad: "Secde Tesbîhi", hane: "Secdelerde (3 defa)", arapca: "سُبْحَانَ رَبِّيَ الْأَعْلَى", latin: "Sübhâne Rabbiye'l-A'lâ.", anlam: ["Yüce Rabbimi eksiklikten paklarım.", "Glory to my Lord, the Most High.", "سُبْحَانَ رَبِّيَ الْأَعْلَى.", "Maha suci Rabbku Yang Mahatinggi.", "میرے بلند رب پاک ہے۔"] },
  { ad: "Oturuş İstiğfarı", hane: "İkinci rekâta otururken (bir sefer)", arapca: "رَبِّ اغْفِرْ لِي", latin: "Rabbiğfirlî.", anlam: ["Rabbim! Beni bağışla.", "My Lord, forgive me.", "رَبِّ اغْفِرْ لِي.", "Ya Rabbku, ampunilah aku.", "اے میرے رب! مجھے معاف فرما۔"] },
  { ad: "Et-Tehiyyâtü", hane: "Son oturuşta (farz ile birlikte)", arapca: "التَّحِيَّاتُ لِلَّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ", latin: "Et-tehiyyâtü lillâhi ves-selavâtü vet-tayyibât. Es-selâmü aleyke eyyuhen-nebiyyü...", anlam: ["Dilî, bedenî ve malî bütün tazimler Allah'adır; ey Peygamber, sana selâm olsun.", "All greetings, prayers and goodness are for Allah; peace be upon you, O Prophet.", "التَّحِيَّاتُ لِلَّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ.", "Segala tazim bagi Allah; salam atas Nabi.", "تمام تعظیمیں اللہ کے لیے ہیں؛ اے نبی تم پر سلام ہو۔"] },
  { ad: "Salli-Bârik Duâları", hane: "Salli'den sonra Bârik lenâ", arapca: "اللَّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ", latin: "Allâhümme salli alâ Muhammedin ve alâ âli Muhammed...", anlam: ["Allah'ım! Muhammed'e ve Muhammed'in âline rahmet eyle.", "O Allah, bestow mercy upon Muhammad and the family of Muhammad.", "اللَّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ.", "Ya Allah, rahmatilah Muhammad dan keluarganya.", "اللہم محمد اور محمد کی ذات پر رحمت فرما۔"] },
  { ad: "Kunut Duâsı (Vitir)", hane: "Vitirin 3. rekâtında, kıraat sonrası", arapca: "اللَّٰهُمَّ إِنَّا نَسْتَعِينُكَ وَنَهْتَدِيكَ", latin: "Allâhümme innâ nestaînüke ve nehtedîke... Rabbenâ âtinâ fi'd-dünyâ haseneten...", anlam: ["Allah'ım! Senden yardım diler ve sana yöneliriz; Rabbimiz! Dünyâda ve âhirette güzeli ver.", "O Allah, we seek Your help and guidance; our Lord, give us good in this world and the Hereafter.", "اللَّٰهُمَّ إِنَّا نَسْتَعِينُكَ.", "Ya Allah, kami memohon pertolongan-Mu.", "اللہم ہم تیری مدد مانگتے ہیں؛ اے ہمارے رب! دنیا میں اور آخرت میں بھلائی عطا فرما۔"] },
  { ad: "Selâm", hane: "Namazın sonunda (önce sağa, sonra sola)", arapca: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", latin: "Es-selâmü aleyküm ve rahmetüllâh.", anlam: ["Size selâm ve Allah'ın rahmeti olsun.", "Peace and the mercy of Allah be upon you.", "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ.", "Keselamatan dan rahmat Allah atasmu.", "تم پر سلام اور اللہ کی رحمت ہو۔"] },
];

// ── 45/58: SALAH TRACKER + DUA TAKİBİ gün anahtarları ───────
export const SALAH_VAKITLERI = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"] as const;

// ── 60: TOPLU HATİM — cüz eşitleme yardımcıları ────────────
export interface TopluHatimDurum { cüzler: number[]; katilimciSayisi: number }
export const TOPLU_HATIM_CÜZ = Array.from({ length: 30 }, (_, i) => i + 1);
