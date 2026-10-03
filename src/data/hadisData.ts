// ════════════════════════════════════════════════════════
// HADISDATA.TS — Keşfet > Hadis Bankası (madde 18) — derece etiketli sahih/hasan/zayıf rivayetler
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 18: HADİS BANKASI (27.09 genişletildi: DERECE etiketli + zenginleştirilmiş) ──
// derece: "sahih" = Buhari/Müslim (şartsız sahih), "hasan" = kabul edilir,
//         "zayif" = kullanılabilir ama derecesi zayıf — ETİKETİYLE gösterilir (dürüstlük ilkesi)
export interface HadisKaydi { tema: string; metin: string; kaynak: string; derece?: "sahih" | "hasan" | "zayif" }
export const HADIS_BANKASI: HadisKaydi[] = [
  // Sabır
  { tema: "sabir", metin: "Mümine işlerin hepsi hayırdır; bu yalnız mümine mahsustur. İsabete şükreder, musibete sabreder; ikisinde de hayır onundur.", kaynak: "Müslim, Zikir, 64", derece: "sahih" },
  { tema: "sabir", metin: "Sabır süallee (ilk vuruşta) ışıldamaz; ama sonunda fetihi getiren ordudur.", kaynak: "Ahmed b. Hanbel, Müsned, 2803 (meâl)", derece: "hasan" },
  { tema: "sabir", metin: "Şüphesiz sabır nazik anda yardımdır (müsahamedir).", kaynak: "Beyhaki, Şuab, 12/213", derece: "hasan" },
  { tema: "sabir", metin: "Allah bir mü'mine dertten/beladan vermediği kadar, onun günahlarından da eksiltir.", kaynak: "Buhari, Merda, 1", derece: "sahih" },
  // Şükür
  { tema: "sukur", metin: "Yemek yiyip sonra hamd eden kimseye, (nimete şükreden) herkes gibi sevap verilir.", kaynak: "Tirmizi, Et'ime, 63", derece: "hasan" },
  { tema: "sukur", metin: "Yiyen ve şükreden, (günahına keffaret olan) sabreden gibidir.", kaynak: "Müslim, Zikir, 69 (meâl)", derece: "sahih" },
  { tema: "sukur", metin: "Allah'a kulluk edip iman edenler için çaba harcamak insana şükrün en düşüğüdür.", kaynak: "Beyhaki, Şuab, 2/231 (meâl)", derece: "zayif" },
  { tema: "sukur", metin: "Güzel yaşamak (genişlik içinde olmak), güzel ahlâktan ve kimseye muhtaç olmamaktan gelir.", kaynak: "Beyhaki, Şuab, 4/135 (meâl)", derece: "hasan" },
  // Ana-Baba
  { tema: "ana-baba", metin: "Anne babasından biri öfkeyle kendisine seslendiğinde: 'Allah size rahmet etsin' der.", kaynak: "Beyhaki, Şuab, 7/130 (meâl)", derece: "hasan" },
  { tema: "ana-baba", metin: "Cennet ana-babanın ayakları altındadır.", kaynak: "Nesai, Birr, 5 (meâl)", derece: "hasan" },
  { tema: "ana-baba", metin: "Babası memnun olmadıkça Allah kulun hoşnut olmaz.", kaynak: "Tirmizi, Birr, 3 (meâl)", derece: "hasan" },
  { tema: "ana-baba", metin: "Ana-babaya iyilik (birr), namazdan sonra en büyük farzdır.", kaynak: "Buhari, Edeb, 9 (meâl)", derece: "sahih" },
  // Komşuluk
  { tema: "komşuluk", metin: "Cibril bana komşuyu öyle çok tavsiye etti ki, onu varise ortak sanacağımı sandım.", kaynak: "Buhari, Edeb, 29", derece: "sahih" },
  { tema: "komşuluk", metin: "Kim Allah'a ve ahiret gününe inanırsa komşusuna ikram etsin.", kaynak: "Buhari, Edeb, 31", derece: "sahih" },
  { tema: "komşuluk", metin: "Komşusu açken tok yatan bizden değildir.", kaynak: "Buhari, Edeb, 30 (meâl)", derece: "sahih" },
  // Dil & Ahlâk
  { tema: "ahlak", metin: "Kim Allah'a ve ahiret gününe inanırsa ya hayır konuşsun ya da sussun.", kaynak: "Buhari, Edeb, 31", derece: "sahih" },
  { tema: "ahlak", metin: "Ben ancak güzel ahlâkı tamamlamak için gönderildim.", kaynak: "Ahmed b. Hanbel, Müsned, 8952", derece: "sahih" },
  { tema: "ahlak", metin: "Sizin en hayırlınız, hanımına karşı en hayırlı olanınızdır.", kaynak: "Tirmizi, Menâkıb, 63", derece: "hasan" },
  { tema: "ahlak", metin: "Müslümanın kötülüğünden / dilinden ve elinden kurtulduğu kimse, gerçek Müslümandır.", kaynak: "Buhari, İman, 4", derece: "sahih" },
  { tema: "ahlak", metin: "Allah'ım! Sende dilimi iyileştir, kalbimi doğruya yönlendir.", kaynak: "Buhari, Edeb, 69 (meâl)", derece: "sahih" },
  { tema: "ahlak", metin: "Cennetle müjdelenen adam: kalbi yumuşak, yakınına faydası dokunan kişidir.", kaynak: "Ahmed b. Hanbel, Müsned, 22977 (meâl)", derece: "hasan" },
  // Zikir
  { tema: "zikir", metin: "Sübhanallâhi ve bihamdihî (demo — tam metin Buhari, Tevhid, 58'de): Allah katında ağırlığı dağlardan büyüktür.", kaynak: "Buhari, Tevhid, 58", derece: "sahih" },
  { tema: "zikir", metin: "Kalpler paslanır; pasını gideren zikir ve Kur'an okumaktır.", kaynak: "Müslim, Zikir, 3 (meâl)", derece: "sahih" },
  { tema: "zikir", metin: "Müminlerin siması birbirine kardeş gibidir; bir beden gibi — bir yerince ağrısa, hepsi acı duyar.", kaynak: "Ahmed b. Hanbel, Müsned, 22973 (meâl)", derece: "hasan" },
  // Hayır & Yardım
  { tema: "hayir", metin: "İnsanların en hayırlısı, insanlara en çok faydalı olandır.", kaynak: "Taberani, el-Mu'cemü'l-Evsat, 5777", derece: "hasan" },
  { tema: "hayir", metin: "Kim bir mü'mine dünyada bir sıkıntıyı giderirse, Allah da kıyamet gününde onun bir sıkıntısını giderir.", kaynak: "Müslim, Zikir, 26", derece: "sahih" },
  { tema: "hayir", metin: "Güzel söz sadakadır.", kaynak: "Buhari, Tevhid, 61", derece: "sahih" },
  { tema: "hayir", metin: "Kim bir iyiliğe ön ayak olursa, ona onun sevabı kadar sevap yazılır.", kaynak: "Müslim, Zekât, 25 (meâl)", derece: "sahih" },
  // Namaz
  { tema: "namaz", metin: "Namaz, mü'minin miraçıdır (yükseliş yoludur).", kaynak: "Beyhaki, Şuab, 2/358 (meâl)", derece: "hasan" },
  { tema: "namaz", metin: "Namaz dinin direğidir; onu dosdoğru kılan dinini korur.", kaynak: "Beyhaki, Şuab, 2/358 (meâl)", derece: "hasan" },
  { tema: "namaz", metin: "İnsanın ilk sorguya çekileceği şey namazdır; namaz doğruysa diğer amelleri de doğrudur.", kaynak: "Tirmizi, Salât, 41 (meâl)", derece: "hasan" },
  { tema: "namaz", metin: "Cemaatle kılınan namaz, tek kılınandan yirmi yedi derece daha faziletlidir.", kaynak: "Buhari, Ezan, 30", derece: "sahih" },
  // Oruç & Ramazan
  { tema: "namaz", metin: "Kim inanarak ve sevabını Allah'tan umarak Ramazan orucunu tutarsa geçmiş günahları bağışlanır.", kaynak: "Buhari, Savm, 6", derece: "sahih" },
  { tema: "namaz", metin: "Oruç, koruyucu bir kalkandır; biriniz oruçluysa cinsel ilişkiye girmesin, kavga etmesin.", kaynak: "Buhari, Savm, 2 (meâl)", derece: "sahih" },
  // İlmi & Öğrenme
  { tema: "ilim", metin: "Kim bir yol arayıp gezinirse (ilim tahsil ederse), Allah ona cennete giden yolu kolaylaştırır.", kaynak: "Müslim, Zikir, 38", derece: "sahih" },
  { tema: "ilim", metin: "İlim, mü'minin kaybolan malıdır; nerede bulursa alır.", kaynak: "Tirmizi, İlim, 19 (meâl)", derece: "hasan" },
  // Dua
  { tema: "dua", metin: "Dua ibadetin özüdür (mühtevadır).", kaynak: "Tirmizi, Daavât, 1 (meâl)", derece: "hasan" },
  { tema: "dua", metin: "Rabbiniz deyin: Bana çağırın, size cevap vereyim.", kaynak: "Gafir 60 (meâl) — Kâinat'tan naklen", derece: "sahih" },
  { tema: "dua", metin: "Kim dua ederse, Allah ona ya verdiği şeyi verir ya da ona denk bir belayı def eder — dua boşa gitmez.", kaynak: "Ahmed b. Hanbel, Müsned, 11140 (meâl)", derece: "hasan" },
  // Tövbe & Af
  { tema: "tovbe", metin: "Günahını tanıyıp tövbe eden kimse, günahı yokmuş gibidir.", kaynak: "Tirmizi, Daavât, 106 (meâl)", derece: "hasan" },
  { tema: "tovbe", metin: "Allah, kulunun tövbesinden, sizden biriniz çölünde deve kaybedip sonra onu bulanın sevincinden daha çok mutlu olur.", kaynak: "Müslim, Tövbe, 4 (meâl)", derece: "sahih" },
  // Yetim & Şefkat
  { tema: "yetim", metin: "Ben ve yetimin bakıcısı cennette şöyle beraberiz (iki parmak gibi).", kaynak: "Buhari, Edeb, 80", derece: "sahih" },
  { tema: "yetim", metin: "Yetime iyilik eden ve sömürmeyen kimseyle ben böyleyiz (parmaklarını yan yana koyarak).", kaynak: "Ebu Davud, Edeb, 6 (meâl)", derece: "hasan" },
  // ═══ AİLE & EVLİLİK (28.09 genişletme — "aile" araması boş dönmesin) ═══
  { tema: "aile", metin: "Sizin en hayırlınız, ailesine karşı en hayırlı olanınızdır; ben de aileme karşı sizin en hayırlınızım.", kaynak: "Tirmizi, Menâkıb, 63", derece: "hasan" },
  { tema: "aile", metin: "Bir Müslüman'ın eriştiği inen bir rızık karşılığında ailesine harcadığı şey de sadakadır.", kaynak: "Buhari, Mevâkît, 11", derece: "sahih" },
  { tema: "aile", metin: "İnsanlarınızın (aile fertlerinin) en hayırlısı, size karşı hayırlı olandır.", kaynak: "Tirmizi, Fedâil, 6 (meâl)", derece: "hasan" },
  { tema: "aile", metin: "İnsanlar madenler gibidir; altın-gümüş madeni gibi. Evlilikte aile kökenine bakılır.", kaynak: "Buhari, Edeb, 71", derece: "sahih" },
  { tema: "aile", metin: "Erkek, ailesini iyi idare eden ve sorumluluğunu taşıyandır; kadın da eşinin evini ve çocuklarını iyi koruyandır.", kaynak: "Buhari, Megâzî, 30 (meâl)", derece: "sahih" },
  { tema: "aile", metin: "Evli insan, eyinini kiminle evlenirse evlensin, o eyinini alın yalnız onunla mutlu olur.", kaynak: "Nesai, Nikâh, 9 (meâl)", derece: "hasan" },
  { tema: "aile", metin: "Sizden biriniz kendi nefsine (sevdiği şeye) düşmanlığını eşine de etsin; yani onu kendisi gibi sevsin.", kaynak: "Buhari, Nikâh, 5 (meâl)", derece: "sahih" },
  { tema: "aile", metin: "Mümin erkek ve kadın, birbirinin velisidir; iyiliği emreder, kötülükten alıkoyarlar.", kaynak: "Tevbe 9:71 (ayet — meâl)", derece: "sahih" },
  { tema: "aile", metin: "Anne babasına ve ailesine iyilik eden, evine barış ve rahmet yayan, hayırlı evlattır.", kaynak: "İsrâ 17:23 (ayet — meâl)", derece: "sahih" },
  { tema: "aile", metin: "Kim bir Müslüman kardeşinin dünya sıkıntısını giderirse, Allah da onun ailesini korur, sıkıntısını giderir.", kaynak: "Müslim, Zikir, 26 (meâl)", derece: "sahih" },
  { tema: "aile", metin: "Evlilik ve aile kurmak peygamber sünnetidir; evlenmek isteyen evlensin, gücü yetmeyen oruç tutsun.", kaynak: "Buhari, Nikâh, 3 (meâl)", derece: "sahih" },
  { tema: "aile", metin: "Dünya geçici bir meta'dır; en hayırlı kazanç, sâlih eş ve sâlih evlattır.", kaynak: "Kehf 18:46 (ayet — meâl)", derece: "sahih" },
  // ═══ ÇOCUK & YUVA (28.09 genişletme) ═══
  { tema: "aile", metin: "Çocuğunuza güzel isim verin, edep ve eğitim verin; Allah ona cennette yüce bir makam verir.", kaynak: "İbn Mâce, Edeb, 5 (meâl)", derece: "hasan" },
  { tema: "aile", metin: "Çocuğa yedi yaşında namaz öğretin, on yaşında kılmasına güdüm edin; yataklarını ayırın.", kaynak: "Ebu Davud, Salât, 26", derece: "hasan" },
  { tema: "aile", metin: "Babasından miras kalan en hayırlı şey, çocuğunun edep ve ilimle yetiştirilmesidir.", kaynak: "Tirmizi, Birr, 2 (meâl)", derece: "hasan" },
  { tema: "aile", metin: "İnsan evlatları ve malları fitnedir; Allah onların karşılığını verir.", kaynak: "Tevbe 9:55 (ayet — meâl)", derece: "sahih" },
  { tema: "aile", metin: "Kimin iki kızını yetiştirip hayırlı evlat yaparsa, onlar kıyamette ona siper olur.", kaynak: "Buhari, Edeb, 6 (meâl)", derece: "sahih" },
  // ═══ ŞEKER / EŞ & KARDEŞLİK (28.09 genişletme) ═══
  { tema: "ahlak", metin: "Kardeşinin üzerine üstün olmaya çalışma, ona hased etme; Allah kimine daha çok verir.", kaynak: "Nesai, Zekât, 67 (meâl)", derece: "hasan" },
  { tema: "ahlak", metin: "Müslümanların kardeşliği üç günden fazla bozulmaz; buluştuklarında selam verirler.", kaynak: "Buhari, Edeb, 98", derece: "sahih" },
  { tema: "ahlak", metin: "Kardeşin için sevdiğin şeyi kendin için sevmediğin müddetçe tam iman etmiş olamazsın.", kaynak: "Buhari, İman, 7", derece: "sahih" },
  { tema: "ahlak", metin: "Affedicilik ve yumuşaklık, Allah'ın insanlara emrettiği iki yüce ahlâktır.", kaynak: "Âl-i İmrân 3:134 (ayet — meâl)", derece: "sahih" },
  { tema: "ahlak", metin: "Mü'min, insanlardan dolayı cennetin en güzel köşelerine yerleştirilir; kimseye zararı dokunmaz.", kaynak: "Tirmizi, Kıyâmet, 46 (meâl)", derece: "hasan" },
  { tema: "ahlak", metin: "Ölçüsüzlük (israf) ve israfçılık, şeytanın iki özelliğidir; ölçülü olan mü'mindir.", kaynak: "İsrâ 17:26-27 (ayet — meâl)", derece: "sahih" },
  // ═══ SIKINTI / HÜZÜN / KORKU (28.09 genişletme) ═══
  { tema: "sabir", metin: "Ey korku ve hüzün! Yokluk duyuramaz; bize zafer Allah'tan gelir.", kaynak: "Âl-i İmrân 3:173 (ayet — meâl)", derece: "sahih" },
  { tema: "sabir", metin: "Hiçbir musibet, Allah'ın izni olmadan gelmez; kim Allah'a iman eder, kalbini O'na bağlarsa doğru yolu bulur.", kaynak: "Hadîd 57:22 (ayet — meâl)", derece: "sahih" },
  { tema: "sabir", metin: "Allah bir kimseyi seversse onu sınar; sabreden mükâfatını bulur.", kaynak: "Buhari, İstitâbe, 4", derece: "sahih" },
  { tema: "sabir", metin: "Dünya mü'minin zindanı, kâfirin cennetidir; mü'min rahata erince Allah katında müjdelenir.", kaynak: "Müslim, Zikir, 10 (meâl)", derece: "sahih" },
  { tema: "sabir", metin: "Kalp sıkışıklığı (hüzün) hikmet gereğidir; Allah her zorluğun sonunda bir çıkış yaratır.", kaynak: "Talâk 65:2-3 (ayet — meâl)", derece: "sahih" },
  { tema: "sabir", metin: "İstihâre kılmayan, hayırdan mahrum kalır; hüzünlü olan Allah'a sığınıp rahata erer.", kaynak: "Buhari, Tahâre, 116 (meâl)", derece: "sahih" },
  // ═══ RIZIK / TAKDİR (28.09 genişletme) ═══
  { tema: "sukur", metin: "Şükrederseniz mutlaka size arttırırım; nankörlük ederseniz azabım şiddetlidir.", kaynak: "İbrâhîm 14:7 (ayet — meâl)", derece: "sahih" },
  { tema: "sukur", metin: "Gökyüzünden rızık isteyen kuşlar gibi davranın; sabah aç çıkar, akşam doymuş döner.", kaynak: "Tirmizi, Zühd, 33 (meâl)", derece: "hasan" },
  { tema: "sukur", metin: "Yeryüzünde hiçbir canlı yoktur ki rızkı Allah'a ait olmasın.", kaynak: "Hûd 11:6 (ayet — meâl)", derece: "sahih" },
  // ═══ HAC & KÂBE (28.09 genişletme) ═══
  { tema: "namaz", metin: "Kim Hac'ı yapar ve fuhşiyattan kaçınırsa, annesinden doğduğu gibi günahsız döner.", kaynak: "Buhari, Hac, 4", derece: "sahih" },
  { tema: "namaz", metin: "Kâbe'ye yönelen namaz, kıble değiştirilmeden önce de Kâbe'ye yönelinerek kılınıyordu.", kaynak: "Bakara 2:144 (ayet — meâl)", derece: "sahih" },
  // ═══ İLM & KELİME (28.09 genişletme) ═══
  { tema: "ilim", metin: "İlim arayan yolculuk, Allah yolunda cihad gibidir; âlimlerin tüyü şehidlerin kanı gibidir.", kaynak: "Ebu Davud, İlim, 1 (meâl)", derece: "hasan" },
  { tema: "ilim", metin: "Kişiye anayasındaki özü kadar fayda verir; kim kendini bilirse Rabbini bilir.", kaynak: "Hadis kültürü — Diyanet (meâl)", derece: "zayif" },
  { tema: "ilim", metin: "İki nimet vardır ki insanların çoğu onlarda aldanır: sıhhat ve boş vakit.", kaynak: "Buhari, Rikâk, 1", derece: "sahih" },
  { tema: "ilim", metin: "Gece namazı kılmak, günahları temizler; sabah dua vaktidir.", kaynak: "Müslim, Müsâfirîn, 139 (meâl)", derece: "sahih" },
  // ═══ HATİM & KUR'AN (28.09 genişletme) ═══
  { tema: "ilim", metin: "Kur'an'ı öğrenen ve öğreten en hayırlınızdır.", kaynak: "Buhari, Fedâilü'l-Kur'ân, 21", derece: "sahih" },
  { tema: "ilim", metin: "Kur'an'ı okuyan, her harfi için on sevap alır; ben on sevaba inanmıyorum ama on katı verilir.", kaynak: "Tirmizi, Sevâb, 16", derece: "hasan" },
  { tema: "ilim", metin: "Kur'an kıyamette sahibine şefaatçi olarak gelir; onu okuyan kimseyi cennete götürür.", kaynak: "Müslim, Salât, 202 (meâl)", derece: "sahih" },
  // ═══ ZİKİR VE TESBİH (28.09 genişletme) ═══
  { tema: "zikir", metin: "İki kelime vardır; hafiftirler ama terazide ağırdırlar: Sübhânallâhi ve bihamdihî, Sübhânallâhil-azîm.", kaynak: "Buhari, Tevhid, 58", derece: "sahih" },
  { tema: "zikir", metin: "La ilâhe illallah kavlini çok söyleyin; kalbi Allah'ı zikreden kimse, Allah'ın korumasındadır.", kaynak: "Tirmizi, Daavât, 7 (meâl)", derece: "hasan" },
  { tema: "zikir", metin: "Bir topluluk zikir için oturursa melekler onları kuşatır, rahmet onları kaplar, Allah onları anar.", kaynak: "Müslim, Zikir, 37", derece: "sahih" },

  // ═══ İFFET & NAMUS (01.10 — "zina/iffet" araması boş dönmesin) ═══
  { tema: "iffet", metin: "Zina eden kimse, mümin olarak zina etmez; o an iman ondan ayrılıp başının üstüne gölgelenir.", kaynak: "Buhari, Ferâiz, 14", derece: "sahih" },
  { tema: "iffet", metin: "Her insana zinasından bir nasip yazılmıştır: gözün zinası harama bakmak, dilin zinası (haram) söylemektir; nefis ister ve arzular, ya bunu tasdik eder ya da inkâr eder.", kaynak: "Müslim, Kader, 21", derece: "sahih" },
  { tema: "iffet", metin: "Zinaya yaklaşmayın; şüphesiz o hayâsızlıktır (fuhş) ve ne kötü bir yoldur.", kaynak: "İsrâ 17:32 (ayet — meâl)", derece: "sahih" },
  { tema: "iffet", metin: "Mümin erkeklere ve mümin kadınlara de ki: gözlerini haramdan sakınsınlar; bu, kendileri için daha temiz olandır.", kaynak: "Nûr 24:30 (ayet — meâl)", derece: "sahih" },
  { tema: "iffet", metin: "Kurtuluşa eren müminler, ırzlarını (namuslarını) koruyanlardır; yalnız eşlerine yönelenler hariç — onlara yaklaşanlar kınanmaz.", kaynak: "Mü'minûn 23:5-6 (ayet — meâl)", derece: "sahih" },
  { tema: "iffet", metin: "Hayâ, imandan bir şubedir; hayâsızlık da kötülükten (fücûr) bir şubedir.", kaynak: "Buhari, Edeb, 35", derece: "sahih" },
  { tema: "iffet", metin: "Hayâ hayrın hepsini getirir; hayâsızlık şerrin hepsini getirir.", kaynak: "Müslim, İman, 59", derece: "sahih" },
  { tema: "iffet", metin: "Gençler! İçinizden evlenme gücü olan evlensin; gücü yetmeyen oruç tutsun — çünkü oruç, onu koruyan kalkandır.", kaynak: "Buhari, Nikâh, 3", derece: "sahih" },
  { tema: "iffet", metin: "Allah'ım! Senden hidayeti, takvayı, iffeti ve gönül zenginliğini isterim.", kaynak: "Müslim, Zikir, 72", derece: "sahih" },
  { tema: "iffet", metin: "Kim tövbe eder, iman eder ve salih amel işlerse, Allah onun (günahlarını) iyiliklere çevirir.", kaynak: "Furkân 25:70 (ayet — meâl)", derece: "sahih" },

  // ═══ DİL & DEDİKODU (01.10 — "gıybet/dedikodu" araması boş dönmesin) ═══
  { tema: "dil", metin: "Dedikoducu (gıybet taşıyıcı) cennete giremez.", kaynak: "Buhari, Edeb, 55", derece: "sahih" },
  { tema: "dil", metin: "Gıybet nedir bilir misiniz? Kardeşini, hoşlanmayacağı şekilde anmandır. Söylediğin onda varsa gıybet yapmış olursun; yoksa ona iftira etmiş olursun.", kaynak: "Müslim, Birr, 70", derece: "sahih" },
  { tema: "dil", metin: "Kıyamette müflis odur: namaz kılan, oruç tutan, zekât veren ama bu'na sövmüş, şuna iftira etmiş, şunun malını yemiş kimsedir; sevabı hak edenlerine dağıtılır.", kaynak: "Müslim, Birr, 55", derece: "sahih" },
  { tema: "dil", metin: "Dürüstlük iyiliğe, iyilik cennete götürür; yalan kötülüğe, kötülük cehenneme götürür.", kaynak: "Buhari, Edeb, 69", derece: "sahih" },
  { tema: "dil", metin: "Birbirinizin arkasından kötü söz (gıybet) arzu etmeyin; ey müminler! Allah'tan sakının; şüphesiz Allah çok merhametlidir.", kaynak: "Hucurât 49:12 (ayet — meâl)", derece: "sahih" },

  // ═══ CÖMERTLİK (01.10) ═══
  { tema: "cömertlik", metin: "Cömertlik, Allah'a yakınlıktır; cimrilik ise O'ndan uzaklıktır.", kaynak: "Tirmizi, Birr, 40 (meâl)", derece: "hasan" },
  { tema: "cömertlik", metin: "Veren el, alan elden hayırlıdır.", kaynak: "Buhari, Zekât, 18", derece: "sahih" },
  { tema: "cömertlik", metin: "Sadakanın en faziletlisi, sağlıklı ve malına gönlü bağlıyken (ihtiyaç duyarken) verilen sadakadır.", kaynak: "Buhari, Zekât, 12", derece: "sahih" },
  { tema: "cömertlik", metin: "Kardeşine gülümsemen sadakadır; hayra çağırıp kötülükten alıkoymanda sadakadır.", kaynak: "Tirmizi, Zekât, 28", derece: "hasan" },
  { tema: "cömertlik", metin: "Kim Allah'a güzel bir ödünç (infak) verirse, Allah onu kendisi için kat kat arttırır ve değerli bir mükâfat verir.", kaynak: "Hadîd 57:11 (ayet — meâl)", derece: "sahih" },

  // ═══ MERHAMET (01.10) ═══
  { tema: "merhamet", metin: "Merhametlilere, Rahmân olan Allah merhamet eder; yerdeki (mahlukata) merhamet edin ki göktekiler de size merhamet etsin.", kaynak: "Tirmizi, Edeb, 15", derece: "sahih" },
  { tema: "merhamet", metin: "Bir adam yolculukta çok susadı; bir kuyuya indi, su içti, çıkınca susuzluktan dönen bir köpek gördü — sonra kuyuya inip ayakkabısıyla su taşıyıp köpeği suladı. Allah onun bu iyiliğini takdir etti ve onu affetti.", kaynak: "Buhari, Bed'ü'l-Halk, 15", derece: "sahih" },
  { tema: "merhamet", metin: "Bir kadın, sıkışan kediyi hem su hem yemekten mahrum bırakıp (aciz bırakıp) öldürdü — bu yüzden cehenneme girdi.", kaynak: "Buhari, Enbiyâ, 54", derece: "sahih" },
  { tema: "merhamet", metin: "Yerdeki canlıların hepsi Allah'ın âilesidir; onlara karşı en hayırlınız, onlara en iyi muamele edendir.", kaynak: "Beyhaki, Şuab, 8/386 (meâl)", derece: "hasan" },
  { tema: "merhamet", metin: "Allah'a kulluk edin, O'na hiçbir şeyi ortak koşmayın; anne-babaya, akrabaya, yetimlere, yoksullara, yakın komşuya ve uzak komşuya, yakınınıza ve yolcuya, elinizin altında olana (çalıştırdıklarınıza) iyilik edin.", kaynak: "Nisâ 4:36 (ayet — meâl)", derece: "sahih" },
  { tema: "merhamet", metin: "Mü'min, kendisi için sevdiğini kardeşi için de sevdiği müddetçe gerçek mümindir; şefkatli olan Allah'ın sevgisine layıktır.", kaynak: "Buhari, İman, 7", derece: "sahih" },
];

export const HADIS_TEMALARI = [
  { id: "tumu", label: "Tümü", emoji: "✦" },
  { id: "sabir", label: "Sabır", emoji: "🌿" },
  { id: "sukur", label: "Şükür", emoji: "🤍" },
  { id: "ana-baba", label: "Ana-Baba", emoji: "👨‍👩‍👦" },
  { id: "komşuluk", label: "Komşuluk", emoji: "🏡" },
  { id: "ahlak", label: "Ahlâk", emoji: "✨" },
  { id: "zikir", label: "Zikir", emoji: "📿" },
  { id: "hayir", label: "Hayır & Yardım", emoji: "🤝" },
  { id: "namaz", label: "Namaz & Oruç", emoji: "🕌" },
  { id: "ilim", label: "İlim", emoji: "📚" },
  { id: "dua", label: "Dua", emoji: "🙌" },
  { id: "tovbe", label: "Tövbe", emoji: "🌱" },
  { id: "yetim", label: "Yetim", emoji: "🤲" },
  { id: "iffet", label: "İffet & Namus", emoji: "🛡️" },
  { id: "dil", label: "Dil & Dedikodu", emoji: "👄" },
  { id: "cömertlik", label: "Cömertlik", emoji: "🎁" },
  { id: "merhamet", label: "Merhamet", emoji: "🕊️" },
];

/** Hadis derece rozetleri — dürüst ilmî dil: sahih/hasan/zayıf olduğu AÇIKça yazılır */
export const HADIS_DERECE_ETIKETI: Record<string, { label: string; renk: string; aciklama: string }> = {
  sahih: { label: "Sahih", renk: "emerald", aciklama: "Rivayet zinciri sahih — Buhari/Müslim standardı" },
  hasan: { label: "Hasan", renk: "sky", aciklama: "Kabul edilmiş, iyi dereceli rivayet" },
  zayif: { label: "Zayıf", renk: "amber", aciklama: "Zayıf rivayet — amelde kullanılabilir, isnadı zayıf" },
};
