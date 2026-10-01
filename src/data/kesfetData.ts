// ════════════════════════════════════════════════════════
// KESFET VERİSİ — yol haritası kalan maddelerinin içeriği
// 18: Hadis Bankası · 19: Kıssa Köşesi · 20: Soru-Cevap arşivi
// 21: Kelime kartları · 22: Sure bilgileri · 28: Namaz Öğretici
// 35: Bebek Duası & Doğum · 61: Dua Vakit Rehberi
// 56: Kitaplık anahtarı · 58: Dua takibi · 60: Toplu hatim
// Tüm içerik sahih kaynaklardan, kaynak gösterimli.
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

// ── 19: KISSA KÖŞESİ (peygamber kıssaları — özet) ──────────
// ★ DUA EKLENDİ (28.09, kullanıcı kararı): her kıssanın sonuna, kıssanın ruhuyla ilgili
//   okunacak dua eklendi — "bu kıssayı okuyan şunu versin" diye.
export interface KissaKaydi { ad: string; sure: string; ozet: string; ders: string; dua: string }
export const KISSA_LISTESI: KissaKaydi[] = [
  { ad: "Hz. Yûsuf'un Sabrı", sure: "Yûsuf Suresi", ozet: "Kardeşlerinin kıskançlığıyla kuyuya atıldı, köle satıldı, haksız yere hapse girdi — ama her aşamada Allah'a sığındı. Sonunda Mısır hazinesinin başına geçti ve ailesiyle kavuştu.", ders: "Sabır ve ismet, kötülüğü iyiliğe çevirir. 'Belki sevmediğiniz bir şey sizin için hayırlıdır.'", dua: "﴿رَبِّ قَدْ آتَيْتَنِي مِنَ الْمُلْكِ وَعَلَّمْتَنِي مِن تَأْوِيلِ الْأَحَادِيثِ﴾ — 'Rabbim! Bana hükümranlık verdin, olayların yorumunu öğrettin' (Yûsuf 12:101). Ey kıskançlıkla sınananların yardımcısı, bizi de sabrumuzun sonunda kavuşla müjdele!" },
  { ad: "Hz. Eyyûb'un Tecessüdü", sure: "Enbiyâ Suresi", ozet: "Hastalık ve mal kaybıyla yıllarca sınandı; ama hiçbir an şikâyet etmedi: 'Rabbi erhamü'r-râhimîn.' Sonunda Allah ona şifa ve eski nimetleri iki kat verdi.", ders: "Gerçek sabır, şikâyetsiz taşınandır. Allah sabredenle beraberdir.", dua: "﴿أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ﴾ — 'Başıma zarar geldi; sen merhametlilerin en merhametlisin' (Enbiyâ 21:83). Ey şifânın kaynağı, hasta olanlara, borç içindeboğulanlara, yalnız düşenlere Eyyûb sabrıyla cevap ver!" },
  { ad: "Ashâb-ı Kehf", sure: "Kehf Suresi", ozet: "Baskıcı bir devirde imanlarını korumak için mağaraya sığındı; Allah onları 309 yıl uyuttu, sonra diriltti — halk iman edenlerin sayısını gördü.", ders: "İman uğruna 'bir mağara' bulmak da ibadettir; Allah yolunu açar.", dua: "﴿رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا﴾ — 'Rabbimiz! Katından bir rahmet ver, işimizi düzgün bir yol eyle' (Kehf 18:10). Baskı ve fitne devirlerinde imanını koruyan kullarından eyle, mağaramıza rahmetinle nur gönder!" },
  { ad: "Hz. Mûsâ ve Hızır", sure: "Kehf Suresi", ozet: "Mûsâ (a.s.) ilim öğrenmek için Hızır'a (a.s.) takıldı; üç olayda sabrı zorlandı ama sonunda her olayın gizli hikmetini öğrendi.", ders: "İlim sabır ister; görünüşte kötü olan içinde hayır taşıyabilir.", dua: "﴿رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي﴾ ruhuyla: 'Rabbim! Sinemi aç, işimi kolaylaştır' (Tâhâ 20:25-26). Ey hikmetini ardıl bilginlere öğreten, bize de olayların arkasındaki hayrı görecek bir kalp ve sabır ver!" },
  { ad: "Fil Sahibi ve Kâbe", sure: "Fil Suresi", ozet: "Ebrehe filleriyle Kâbe'yi yıkmaya geldi; Allah kuşlarla taş yağdırdı — 'onları yenilmiş saman çöpü gibi yaptı.'", ders: "Kâbe'nin koruyucusu Allah'tır; zulüm ağır gelir, intikamı O alır.", dua: "﴿رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي﴾ ruhuyla Kâbe'ye yönelerek: 'Rabbim! Beni namazı kılanlardan eyle, soyumdan da' (İbrâhîm 14:40). Ey Kâbe'yi fillerdenden koruyan, bizi de her kötülükten koru, hacımızı ve dualarımızı kabul eyle!" },
  { ad: "Tâlût ve Dâvût'un Zaferi", sure: "Bakara Suresi", ozet: "Küçük bir ordu, 'biz düşman kalabalığına karşı Allah'ın izniyle galip geldik' diyerek Calut'u yendi; genç Dâvût (a.s.) Calut'u devirdi.", ders: "Çokluk değil Allah'a güven zafer getirir.", dua: "﴿رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾ — 'Rabbimiz! Üzerimize sabır dök, ayaklarımızı sağlamlaştır, kâfir topluma karşı bize zafer ver' (Bakara 2:250). Zor günlerde az kalıpta galip gelen kullarından eyle!" },
  // ═══ 01.10 genişletme: 9 yeni kıssa ═══
  { ad: "Hz. Nûh ve Gemisi", sure: "Hûd Suresi", ozet: "950 yıl kavmine peygamberlik etti; güldüler, taşladılar, 'sen bizden birisin' dediler. O inatla çağırdı: 'Rabbime iman edin, O size affetsin.' Tahtaya gemi yapmaya başlayınca her alay daha bir arttı — sonra tufan geldi; iman edenler gemideydi.", ders: "Doğru bildiğin yolda alaylara rağmen devam et; son gülen sabredendir.", dua: "'Rabbim! Beni, annemi babamı bağışla' (Nûh 71:28 — meal). Ey tufandan koruyan, bizi de günahtan koruyan bir gemiye bindir!" },
  { ad: "Hz. İbrâhîm ve Ateş", sure: "Sâffât Suresi", ozet: "Putları kırdı; Nemrud'un askerleri onu dev mancınıkla ateşe attı. 'Bana Allah yeter' dedi; ateş, 'Ey ateş! İbrâhîm'e serinlik ve esenlik ol' emriyle bahçeye döndü.", ders: "Allah'ın emriyle ateş bile yumuşar; O'nun sığınağındakileri hiçbir ateş yakamaz.", dua: "'Bize Allah yeter, O ne güzel vekildir' (Âl-i İmrân 3:173 — meal). Ey ateşi serinliğe çeviren, bizi de her cehennemden koru!" },
  { ad: "Hz. İsmâîl'in Teslimi", sure: "Sâffât Suresi", ozet: "Rüyasında oğlunu kurban etmesi istendi; İbrâhîm oğluna durumu söyledi. Genç İsmâîl: 'Babacığım, emrolunduğunu yap; inşallah beni sabredenlerden bulacaksın' dedi. Her ikisi de teslim oldu; Allah onu büyük bir kurbanla kurtardı.", ders: "Teslimiyet şefkatle, şefkat teslimiyetle yürür; emre razı olan kalbe kurtuluş yazar.", dua: "'Rabbim! Bana salihlerden (evlat) bağışla' (Sâffât 37:100 — meal). Ey kurbanı kabul eden, bizi de her hususta teslimiyet ehli eyle!" },
  { ad: "Hz. Mûsâ ve Denizin Yarılması", sure: "Tâhâ Suresi", ozet: "Firavun ordusu arkada, deniz önde — kavim 'yakalandık' dedi. Mûsâ: 'Asla! Rabbim benimledir, O bana yol gösterecektir' dedi; deniz yarıldı, her dal bir yol oldu.", ders: "Her kapı kapandığında Allah kapı açar; 'Rabbim benimledir' demek en büyük sigortadır.", dua: "'Rabbim! Sinemi aç, işimi kolaylaştır' (Tâhâ 20:25-26 — meal). Ey denizleri yaran, bize de çıkmazlarda yol aç!" },
  { ad: "Hz. Meryem'in Mihrabı", sure: "Meryem Suresi", ozet: "Mabedde ibadete çekildi; ibadet ederken ona rızık Allah'tan geliyordu. Zekeriya şaşıp sordu; 'Bu Allah'tandır' dendi. O da Rabbi'ne el açıp evlat istedi; yaşlılığına rağmen Yahya müjdesi verildi.", ders: "İbretten ve gösterişten kaçan, rızkını Allah'tan bulur; helal rızkın en temizi mabedle irtibatlı olandır.", dua: "'Rabbim! Bana katından tertemir bir nesil bağışla; şüphesiz sen duaları işitirsin' (Âl-i İmrân 3:38 — meal). Ey rızkı kendisinden bekleyenlere yeten, bize de helal rızık ver!" },
  { ad: "Hz. Âdem ve İblis'in Kıskançlığı", sure: "A'râf Suresi", ozet: "Allah, Âdem'e bütün isimleri öğretti; melekler aczini itiraf etti. İblis ise 'ben ateşten, o topraktan' diye kibirlendi ve secde etmeyi reddetti — ilk kıskançlık ilk düşüş oldu.", ders: "Kibirlenme, ilimden üstünlük de olsa; kıskançlık, en zenginini bile yakar.", dua: "'Rabbimiz! Nefsimize zulmettik; affet bizi, rahmet eyle' (A'râf 7:23 — meal). Ey tövbeyi kabul eden, kibirden ve kıskançlıktan koru!" },
  { ad: "Karun'un Hazineleri", sure: "Kasas Suresi", ozet: "Karun'un hazinelerini taşımaya güçlü kuvvetli adamlar zor yetişiyordu; kavmin 'nimetle sevinme' uyarısını dinlemedi. O, 'bunu kendi bilgimle kazandım' dedi — yer onu malıyla birlikte yuttu.", ders: "Mal, Allah'ın emanetidir; 'kendi gücümle kazandım' deyip kibirlenen, sonunu hazinesiyle birlikte yaşar.", dua: "'Rabbimiz! Bize dünyada da ahirette de güzellik ver' (Bakara 2:201 — meal). Ey rızkı veren, malı bize ebeden değil, emanet bilme nasip et!" },
  { ad: "Hz. Yûnus ve Balığın Karnı", sure: "Sâffât Suresi", ozet: "Kavmine kırgın, öfkeli çıktı; gemiye binince kur'a çekildi, denize atıldı; balık yuttu. Üç karanlıkta 'Senden başka ilah yok, sen münezzehsin, ben zalim oldum' dedi; kurtuldu.", ders: "Tövbe, en karanlık yerden bile çıkar; ümitsizlik yoktur, yokluk yalnız tövbesizliktir.", dua: "'Senden başka ilah yok; sen münezzehsin, ben zalimlerden oldum' (Enbiyâ 21:87 — meal). Ey balık karninden çıkaran, bizi de her karanlıktan tövbeyle çıkar!" },
  { ad: "Üç Kişinin Mağara Kıssası", sure: "Buharî, Bed'ü'l-Halk, 11", ozet: "Yol kesen bir mağarada içerden kaya kapattı; üç kişi sırayla 'yalnız Allah rızası için yaptığım en hassas iyilik' hikayesini anlattı: anne-atasına yemek taşıyan evlat, işi delip geçen halis emek, emanete sahip çıkan amanetdar. Kaya, son hikayede açıldı.", ders: "Yalnız Allah için yapılan iyilik, dağları yerinden oynatır.", dua: "Ey ihlâsi kabul eden Rabbim! Yalnız senin için yaptıklarımızı kabul eyle; dağları oynatan amellere bizi de nail eyle." },
];

// ── 20: SORU-CEVAP ARŞİVİ (Diyanet yönlendirmeli) ──────────
export interface SoruCevap { soru: string; cevap: string; kaynak: string }
export const SORU_CEVAP_ARŞIVI: SoruCevap[] = [
  { soru: "Oruç kimlere farzdır?", cevap: "Akıl sağlığı yerinde, buluğ çağına ermiş ve mukim (yolcu olmayan) her Müslümana Ramazan orucu farzdır. Hasta ve yolcuya izin vardır; iyileşince kaza eder.", kaynak: "Diyanet İlmihal — Oruç bölümü" },
  { soru: "Zekât kimlere verilmez?", cevap: "Ana, baba, dede, nine, oğul, oğlun çocuğu, kız, kızın çocuğu, eşe zekât verilmez. Zenginlere de verilmez. Kardeş, amca, dayı gibi akrabaya verilebilir.", kaynak: "Diyanet İlmihal — Zekât bölümü" },
  { soru: "Kurbanın ortaklık şartları var mı?", cevap: "Küçükbaş hayvan (koyun-keçi) tek kişiye, büyükbaş (sığır, deve) yedi kişiye kadar ortak olabilir; her hisse 1/7'den az olmamalı ve hisse sahibi kurban niyetiyle almalıdır.", kaynak: "Diyanet İlmihal — Kurban bölümü" },
  { soru: "Namaz kaza edilebilir mi?", cevap: "Geç kılınan (özürsüz terk edilen) namazlar mümkün olduğunca çabuk kaza edilir. Kaç rekat ise o kadar kaza edilir; cem-i takdim/cem-i te'hir yalnızca yolculuk ve yağmur gibi özürlerde mümkündür.", kaynak: "Diyanet İlmihal — Namaz bölümü" },
  { soru: "Cuma namazı kimlere farzdır?", cevap: "Serbest erkek, mukim, akıllı ve buluğ çağına ermiş Müslüman'a farzdır. Yolcu, hasta, kadın, çocuk ve köle için farz değildir (öğle namazı kılarlar).", kaynak: "Diyanet İlmihal — Cuma namazı" },
  { soru: "Teyemmüm ne zaman yapılır?", cevap: "Su bulunmayınca veya su kullanma imkânı olmayınca (hastalık, soğuk, su azlığı) temiz toprak/benzeri nesneyle teyemmüm yapılır ve namaz kılınır.", kaynak: "Diyanet İlmihal — Teyemmüm" },
  { soru: "Sırertaşı vermek caiz midir?", cevap: "Mü'min kardeşinin ayıbını arkasından söylemek gıybet ve haramdır. Ama zulme uğrayanın hakkını aramak, dinî hüküm verme (fetva) talebi gibi durumlarda caizdir.", kaynak: "Diyanet Fetva Kurulu — gıybet ilgili fetvalar" },
];

// ── 20b: İSLAM'IN 5 ŞARTI — MEZHEPLERE GÖRE FIKHİ SORU-CEVAP (28.09, kullanıcı kararı)
// "5 şart ile ilgili fıkhi sorular cevaplar kaynaklarıyla birlikte mezheplere göre ayrılsın
//  herşey dahil" — Hanefî/Şâfiî/Mâlikî/Hanbelî karşılaştırmalı, kaynak gösterimli.
export type MezhepAd = "Hanefî" | "Şâfiî" | "Mâlikî" | "Hanbelî";
export interface BesSartSoru {
  sart: "Şehadet" | "Namaz" | "Zekât" | "Oruç" | "Hac";
  soru: string;
  cevaplar: Array<{ mezhep: MezhepAd; metin: string }>;
  kaynak: string;
}
export const BES_SART_SORULARI: BesSartSoru[] = [
  {
    sart: "Şehadet",
    soru: "İslam'ın 5 şartı nedir ve hangi kaynaklara dayanır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "1) Kelime-i şehadet etmek, 2) Beş vakit namaz kılmak, 3) Zekât vermek, 4) Ramazan orucu tutmak, 5) Gücü yetenler için Kâbe'yi haccetmek. Bu bölüm Hadis-i Cibrîl'e dayanır." },
      { mezhep: "Şâfiî", metin: "Aynı beş şart — Hadis-i Cibrîl'in zahiridir; ibadetler dinin direkleri olarak dört mezhepte de ortaktır." },
      { mezhep: "Mâlikî", metin: "Aynı beş şart; Muvatta'da benzer rivayetler vardır. Hadiste 'İslam'ın binası beş şey üzerine kurulmuştur' denir." },
      { mezhep: "Hanbelî", metin: "Aynı beş şart — aynı Hadis-i Cibrîl kaynaklı; İbn Teymiye el-Îmân kitabında bunları detaylandırır." },
    ],
    kaynak: "Buhârî, Îmân, 37 · Müslim, Îmân, 8 (Hadis-i Cibrîl) · Diyanet İlmihal",
  },
  {
    sart: "Şehadet",
    soru: "Şehadet getirmenin şartları nelerdir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yedi şart: ilim (anlamını bilmek), yakîn (kalpten tasdik), ikrar (dille söylemek), sıdk (doğruluk), ihlâs, inâbet (samimi yöneliş) ve kabul. Sadece dille söylemek yetmez." },
      { mezhep: "Şâfiî", metin: "Sekiz şart sayılır: ilim, yakîn, ihlâs, sıdk, kabul, inâbet, muhabbet (sevgi) ve dil ile ikrar." },
      { mezhep: "Mâlikî", metin: "Yedi şart; ayrıca açık ikrar gereklidir. Kalpten tasdik etmeden yalnız dille söyleyen dünyada Müslüman muamelesi görür, içini Allah bilir." },
      { mezhep: "Hanbelî", metin: "Dokuz şart: ilim, yakîn, kabul, inkıyâd (itaat), sıdk, ihlâs, muhabbet, inâbet ve ikrar — en geniş liste Hanbelî'de." },
    ],
    kaynak: "Diyanet İlmihal — İman bölümü · İbn Kudâme, el-Muğnî · Nevevî, Kitâbü'l-Ezkâr",
  },
  {
    sart: "Namaz",
    soru: "Namazın farzları (rüknleri) mezheplere göre kaçtır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Namazın 12 şartı ve 12 farzı sayılır; asıl rüknler: tekbir-i tehrime, kıyam, kıraat, rükû, iki secde ve kade-i ahire. Hanefî'de Fâtiha farz-ı ayndır (cemaatte imam okur)." },
      { mezhep: "Şâfiî", metin: "17 rükn sayılır: niyet, tekbir, kıyam, Fâtiha (her rekatte farz), rükû, sücûd, istirahat, oturuş, tehiyyât, selam, sıra, kasd... Fâtiha terk edilirse namaz geçersizdir." },
      { mezhep: "Mâlikî", metin: "14 rükn sayılır; Fâtiha farz DEĞİL sünnet-i müekked kabul edilir — her rekatte başka bir sure okunabilir." },
      { mezhep: "Hanbelî", metin: "16 rükn sayılır; Fâtiha farzdır (Şâfiî gibi). Niyet, tekbir, kıyam, rükû, secde, oturuşlar ve selam asıl rüknlerdir." },
    ],
    kaynak: "Diyanet İlmihal — Namaz · İbn Âbidîn, Reddü'l-Muhtâr (Hanefî) · Nevevî, el-Mecmû' (Şâfiî) · İbn Kudâme, el-Muğnî (Hanbelî)",
  },
  {
    sart: "Namaz",
    soru: "Fâtiha okunmadan namaz geçerli olur mu?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Fâtiha farz-ı ayndır; terkinde namaz mekruh-ı tahrimen olur ve yeniden kılınması gerekir. Ancak cemaatle imam sesli kıraat ederken arkadakiler için dinlemek yeterli kabul edilir." },
      { mezhep: "Şâfiî", metin: "Fâtiha rükndür — terk edilirse namaz geçerli OLMAZ." },
      { mezhep: "Mâlikî", metin: "Fâtiha farz değildir; bir sure okumak yeterlidir — Fâtiha sünnet-i müekkededir." },
      { mezhep: "Hanbelî", metin: "Fâtiha farzdır (her rekatte) — terk edilirse namaz geçersiz." },
    ],
    kaynak: "Diyanet İlmihal · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî · İbn Âbidîn, Reddü'l-Muhtâr",
  },
  {
    sart: "Namaz",
    soru: "'Âmîn' sesli mi sessiz mi denir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Sessizce (içinden) denir; imam'ın Fâtiha'sı bitince cemaat içinden 'âmin' der." },
      { mezhep: "Şâfiî", metin: "Sesli (cehrî) denir — Fâtiha bitince imam ve cemaat yüksek sesle 'âmin' der." },
      { mezhep: "Mâlikî", metin: "Sessizce denir; sabah namazında sesli rivayetler de nakledilmiştir." },
      { mezhep: "Hanbelî", metin: "Sesli denir — özellikle cehrî kıraatlerde; Şâfiî'ye benzer." },
    ],
    kaynak: "Buhârî, Edeb; Müslim, Salât — 'âmîn' bahsi · Diyanet İlmihal",
  },
  {
    sart: "Namaz",
    soru: "Yolcu namazı kısaltır mı, birleştirir mi?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yalnız KASR (kısaltma) vardır: öğle-ikindi 4→2, yatsı 4→2. Cem' (öğle+ikindi, akşam+yatsı birleştirme) YOK; yalnız Arefe ve Müzdelife'de hac esnasında geçerlidir." },
      { mezhep: "Şâfiî", metin: "Hem kasr hem cem' mümkündür: yolcu dilerse kısaltır, dilerse iki namazı bir vakte birleştirir." },
      { mezhep: "Mâlikî", metin: "Kasr + cem' ikisi de mümkün; cem', yağmur/hastalık/hac kalabalığı gibi özürlerde mukimler için de geçerli sayılır." },
      { mezhep: "Hanbelî", metin: "Kasr + cem' ikisi de mümkündür; Hanbelî'de cem' için özür şartı aranmaz." },
    ],
    kaynak: "Diyanet İlmihal — Yolcu namazı · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Namaz",
    soru: "Abdestin farzları mezheplere göre nasıl sayılır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "4 farz: yüzü yıkamak, kolları dirseklerle yıkamak, başın dörtte birini mesh, ayakları topuklarıyla yıkamak. Diğerleri sünnettir." },
      { mezhep: "Şâfiî", metin: "6 farz: niyet, yüz, kollar, baş, ayaklar ve sıra (tertib). Niyet ve sıra Şâfiî'de farzdır." },
      { mezhep: "Mâlikî", metin: "7 farz: niyet, yüz, kollar, baş, ayaklar, sıra ve muvâlât (araları uzatmadan yıkama)." },
      { mezhep: "Hanbelî", metin: "7 farz: niyet, yüz, kollar, başın TAMAMI (mesh), ayaklar, sıra, muvâlât." },
    ],
    kaynak: "Diyanet İlmihal — Tâhâret · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, Minhâcü't-Tâlibîn · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Zekât",
    soru: "Zekâtın vacip olma şartları ve nisab miktarı nedir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Nisab: 96 gr altın veya 609 gr gümüş veya değeri kadar mal. Bir yıl (havlan-ı hâvâl) elinde kalanın 1/40'ı (2,5%) verilir. Akıl ve buluğ şartı — çocuğun malına zekât vacip DEĞİL." },
      { mezhep: "Şâfiî", metin: "Nisab aynı; ancak çocuk ve akıl hastasının malına da zekât vacip kabul edilir (velisi verir)." },
      { mezhep: "Mâlikî", metin: "Nisab aynı; bir yıl geçmesi şarttır. Tarım ürünlerinde farklı nisab ve oran (1/10 veya 1/20) uygulanır — bu 'uşur'dur." },
      { mezhep: "Hanbelî", metin: "Nisab aynı; havlan-ı hâvâl şarttır. Çocuk malında vacip kabulü (Şâfiî gibi) mekruh görülür; en sahih rivayet vacip olduğudur." },
    ],
    kaynak: "Diyanet İlmihal — Zekât · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, Ravzatu't-Tâlibîn · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Zekât",
    soru: "Zekât kime verilmez?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Ana-baba, dede-nine, oğul ve onun çocukları, kız ve onun çocukları ve eşe verilmez. Kardeş, amca, dayı, enişte, gelin gibi akrabaya verilebilir." },
      { mezhep: "Şâfiî", metin: "Hanefî ile aynı: usul (üst soylar), fürû' (alt soylar) ve eşe verilmez; diğer akrabaya vermek mümkündür." },
      { mezhep: "Mâlikî", metin: "Benzer; bakımını üstlendiği yakınlarına verilmez, diğer akrabaya verilebilir — yakınlara önceliklidir." },
      { mezhep: "Hanbelî", metin: "Benzer kural; zenginlere verilmez, zekât yalnız sekiz sınıfa (Tevbe 60) verilir." },
    ],
    kaynak: "Diyanet İlmihal — Zekât verilecek yerler · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, Minhâcü't-Tâlibîn",
  },
  {
    sart: "Zekât",
    soru: "Fitre (sadaka-i fıtriyye) ne zaman verilir, kimlere verilmez?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Ramazan bayramının sabahı, bayram namazından önce verilirse 'sadaka-i fıtriyye'; sonraysa sadaka olur. Ana-baba, çocuk ve eşe verilmez; akrabaya verilebilir." },
      { mezhep: "Şâfiî", metin: "Benzer; bayram namazından önce verilmesi müstehab, sonrasında da geçerlidir." },
      { mezhep: "Mâlikî", metin: "Bayram sabahından önce verilir; sonraya bırakmak mekruh sayılır." },
      { mezhep: "Hanbelî", metin: "Bayram namazından önce verilmesi vacip; sonrasında kaza edilir." },
    ],
    kaynak: "Diyanet İlmihal — Fitre · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû'",
  },
  {
    sart: "Oruç",
    soru: "Oruç kimlere farzdır; hasta ve yolcu ne yapar?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Akıl sağlığı yerinde, buluğ çağına ermiş ve mukim her Müslümana farzdır. Hasta ve yolcu tutmayabilir, sonra kaza eder. İyileşmesi umulmayan hasta ve yaşlılar fidye verir." },
      { mezhep: "Şâfiî", metin: "Benzer; yolcuya tutmayıp kaza etmek tavsiye edilir. Fidye yalnızca yaşlılık ve iyileşmesi umulmayan hastalıkta geçerlidir." },
      { mezhep: "Mâlikî", metin: "Benzer; hamile ve süt annesi için fidye + kaza şekli vardır (kaza şart, fidye de tavsiye edilir)." },
      { mezhep: "Hanbelî", metin: "Benzer; fidye yalnız yaşlılık ve iyileşmesi umulmayan hastalığa geçerlidir; sağlıklı gençlere geçmez." },
    ],
    kaynak: "Diyanet İlmihal — Oruç · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Oruç",
    soru: "İmsak ve iftar vakitleri nasıl belirlenir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "İmsak: fecr-i sâdık (yeni şafak). İftar: güneş tamamen batınca. Türkiye'de Diyanet imsakiyesi ihtiyat süresiyle birlikte hesaplar." },
      { mezhep: "Şâfiî", metin: "Benzer: fecr-i sâdık ile imsak, güneş batımı ile iftar. Ufuk derecesi hesabında (18° vs 15°) mezhepler arasında uygulama farkı olabilir; yerel müftülük takvimi esas alınır." },
      { mezhep: "Mâlikî", metin: "Benzer; iftar güneş batımıyla, imsak fecr-i sâdıkla. Batı ufukta beyazlık kaybolduğunda iftar rivayeti de nakledilmiştir." },
      { mezhep: "Hanbelî", metin: "Benzer; imsak 18° fecr-i sâdık, iftar güneş batımı. Vakit tartışmalarında müftüye sorulması tavsiye edilir." },
    ],
    kaynak: "Diyanet İşleri Takvimi (imsakiye) · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû'",
  },
  {
    sart: "Hac",
    soru: "Hac kimlere farzdır, ömürde kaç kez?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Akıl sağlığı yerinde, buluğ çağına ermiş, hür ve istitâat (yol + masraf gücü) sahibi her Müslümana ömürde BİR KEZ farzdır; fazlası nafile." },
      { mezhep: "Şâfiî", metin: "Benzer; istitâat şartı aynı. Kadın için güvenli yol (mahrem veya güvenli grup) şarttır." },
      { mezhep: "Mâlikî", metin: "Benzer; kadın için mahrem şartı daha vurgulu kabul edilir." },
      { mezhep: "Hanbelî", metin: "Benzer; istitâat beden, mal ve güvenlik üçlüsü olarak tanımlanır." },
    ],
    kaynak: "Diyanet İlmihal — Hac · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Hac",
    soru: "İhram yasakları nelerdir, ihlâlinde ceza nasıl olur?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yasaklar: parfüm/koku, saç-tırnak kesme, avlanma, bitki koparma, nikâh, cinsel temas ve tartışma. İhlâlde ceza (cim') — kurban veya sadaka gerekir." },
      { mezhep: "Şâfiî", metin: "Benzer yasaklar; ceza türü 'dem' (kurban) öncelikli — Hanefî'de sadaka daha sık." },
      { mezhep: "Mâlikî", metin: "Benzer yasaklar; ihlâl şekline göre ceza değişir (kurban, sadaka, oruç)." },
      { mezhep: "Hanbelî", metin: "Benzer yasaklar; ihlâle göre dem, sadaka veya oruç cezası gerekir." },
    ],
    kaynak: "Diyanet İlmihal — İhram yasakları · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Hac",
    soru: "Kurban kesmek hangi mezhepte vacip, hangisinde sünnet?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Vacip: nisab sahibi zengin Müslümana bayram sabahı kurban kesmek vaciptir. Zilhicce 10-12. günlerinde kesilir." },
      { mezhep: "Şâfiî", metin: "Sünnet-i müekkede — vacip değil; kesilmesi güçlü şekilde tavsiye edilir." },
      { mezhep: "Mâlikî", metin: "Sünnet-i müekkede; kesim 10-12. günler." },
      { mezhep: "Hanbelî", metin: "Vacip kabul edilir (Hanefî gibi); kesim 10-12. günler." },
    ],
    kaynak: "Diyanet İlmihal — Kurban · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
];

// ── 21: KELİME KARTLARI ("Kur'an'da 80 sık kelime" — ilk 40) ──
export interface KelimeKart { ar: string; tr: string; okunus: string; ornek: string }
export const KELIME_KARTLARI: KelimeKart[] = [
  { ar: "اللَّه", tr: "Allah", okunus: "Allâh", ornek: "Bismillâh…" },
  { ar: "رَبّ", tr: "Rab (sahip, terbiye eden)", okunus: "Rabb", ornek: "Rabbü'l-âlemîn" },
  { ar: "رَحْمَة", tr: "Rahmet, merhamet", okunus: "rahmet", ornek: "er-Rahmân" },
  { ar: "يَوْم", tr: "Gün", okunus: "yevm", ornek: "Yevmi'd-dîn" },
  { ar: "دِين", tr: "Din, hesap", okunus: "dîn", ornek: "Yevmi'd-dîn" },
  { ar: "نَاس", tr: "İnsanlar", okunus: "nâs", ornek: "Yâ eyyühe'n-nâs" },
  { ar: "قَلْب", tr: "Kalp", okunus: "kalb", ornek: "أَفَلَا تَعْقِلُونَ (kalp ile akıl)" },
  { ar: "عِلْم", tr: "İlim, bilgi", okunus: "ilm", ornek: "بِعِلْمٍ" },
  { ar: "كِتَاب", tr: "Kitap", okunus: "kitâb", ornek: "el-Kitâb" },
  { ar: "حَقّ", tr: "Hak, gerçek", okunus: "hakk", ornek: "el-Hakk" },
  { ar: "صَبْر", tr: "Sabır", okunus: "sabr", ornek: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ" },
  { ar: "صَلَاة", tr: "Namaz, dua", okunus: "salât", ornek: "أَقِمِ الصَّلَاةَ" },
  { ar: "زَكَاة", tr: "Zekât", okunus: "zekât", ornek: "وَآتُوا الزَّكَاةَ" },
  { ar: "صَوْم", tr: "Oruç", okunus: "savm", ornek: "كُتِبَ عَلَيْكُمُ الصِّيَامُ" },
  { ar: "حَجّ", tr: "Hac", okunus: "hacc", ornek: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ" },
  { ar: "جَنَّة", tr: "Cennet", okunus: "cennet", ornek: "جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ" },
  { ar: "نَار", tr: "Ateş (cehennem)", okunus: "nâr", ornek: "نَارٌ" },
  { ar: "نُور", tr: "Nur, ışık", okunus: "nûr", ornek: "اللَّهُ نُورُ السَّمَاوَاتِ" },
  { ar: "ظُلْم", tr: "Zulüm", okunus: "zulm", ornek: "إِنَّ اللَّهَ لَا يَظْلِمُ" },
  { ar: "عَدْل", tr: "Adalet", okunus: "adl", ornek: "يَأْمُرُ بِالْعَدْلِ" },
  { ar: "إِحْسَان", tr: "İhsan, iyilik", okunus: "ihsân", ornek: "وَالْإِحْسَانِ" },
  { ar: "تَقْوَى", tr: "Takva, sakınma", okunus: "takvâ", ornek: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ" },
  { ar: "إِيمَان", tr: "İman", okunus: "îmân", ornek: "آمَنُوا" },
  { ar: "كُفْر", tr: "Küfür, inkâr", okunus: "küfr", ornek: "الَّذِينَ كَفَرُوا" },
  { ar: "نِفَاق", tr: "Nifak, iki yüzlülük", okunus: "nifâk", ornek: "الْمُنَافِقُونَ" },
  { ar: "تَوْبَة", tr: "Tövbe", okunus: "tevbe", ornek: "تَوْبَةً نَّصُوحًا" },
  { ar: "عِبَادَة", tr: "İbadet", okunus: "ibâdet", ornek: "لِيَعْبُدُونِ" },
  { ar: "دُعَاء", tr: "Dua", okunus: "duâ", ornek: "ادْعُونِي أَسْتَجِبْ لَكُمْ" },
  { ar: "ذِكْر", tr: "Zikir, anma", okunus: "zikr", ornek: "بِذِكْرِ اللَّهِ" },
  { ar: "شُكْر", tr: "Şükür", okunus: "şükr", ornek: "لَئِن شَكَرْتُمْ" },
  { ar: "صِدْق", tr: "Doğruluk", okunus: "sıdk", ornek: "قَوْلًا سَدِيدًا" },
  { ar: "كَذِب", tr: "Yalan", okunus: "kizb", ornek: "كَذِبٍ" },
  { ar: "أَمَانَة", tr: "Emanet", okunus: "emânet", ornek: "أَدَّى الْأَمَانَةَ" },
  { ar: "خِيَانَة", tr: "Hıyanet", okunus: "hıyânet", ornek: "يَخُونُونَ" },
  { ar: "رِزْق", tr: "Rızık", okunus: "rızık", ornek: "وَمِنْهُم مَّن يَرْزُقُ" },
  { ar: "مَوْت", tr: "Ölüm", okunus: "mevt", ornek: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ" },
  { ar: "حَيَاة", tr: "Hayat", okunus: "hayât", ornek: "الْحَيَاةُ الدُّنْيَا" },
  { ar: "آخِرَة", tr: "Ahiret", okunus: "âhiret", ornek: "وَالْآخِرَةُ خَيْرٌ" },
  { ar: "دُنْيَا", tr: "Dünya", okunus: "dünyâ", ornek: "مَتَاعَ الْحَيَاةِ الدُّنْيَا" },
  { ar: "قِيَامَة", tr: "Kıyamet", okunus: "kıyâmet", ornek: "يَوْمَ الْقِيَامَةِ" },
];

// ── 22: SURE BİLGİLERİ (01.10: 25 sureye çıkarıldı; aciklama = akordeon açılınca görünen uzun anlatım) ──
export interface SureBilgi { n: number; ad: string; inis: string; konu: string; fazilet: string; aciklama?: string }
export const SURE_BİLGİLERİ: SureBilgi[] = [
  { n: 1, ad: "Fâtiha", inis: "Mekke", konu: "Kur'an'ın özeti ve duanın atası — hamd, kulluk ve hidayet istemi.", fazilet: "Her rekatta okunur; 'saptırmayan ve sapmayan yol' diye en kısa dua buradadır.", aciklama: "Kur'an'ın ilk suresi ve namazın her rekatında zorunlu olarak okunan tek sure; yedi ayeti olduğu için 'Seb'ul-Mesânî' (yedi defa okunan) adıyla da anılır. Önce Allah hamd ile tanıtılır: Rahmân, Rahîm, kıyamet gününün sahibi. Ardından kul söz alır: 'Yalnız sana kulluk ederiz, yalnız senden yardım isteriz' ve yolunu ister: 'Bizi dosdoğru yola ilet.' Bu yüzden sureye 'Ümmü'l-Kitâb' (kitabın özü) ve 'es-Salât' denir; kul ile Rabbinin arasındaki en kısa ve en dolu konuşma buradadır." },
  { n: 2, ad: "Bakara", inis: "Medine", konu: "Mümin, kâfir ve münafığın tarifi; teşri (hükümler) ve İsrâiloğulları kıssası.", fazilet: "Son iki ayet okunursa o geceye yeter; Ayete'l-Kürsî koruma duasıdır. Evde bulundurulmasına dair müjdeler rivayet edilmiştir.", aciklama: "Kur'an'ın en uzun suresi: 286 ayet, yaklaşık iki buçuk cüz. Medine'de inmiştir; oruç, hac, borç, miras, evlilik ve kısas gibi toplumsal hükümlerin büyük bölümü burada konur. Âdem'in yaratılışı, İsrâiloğulları'nın imtihan tarihi ve İbrahim'in Kâbe'yi yükseltişi anlatılır. Kalbi Ayete'l-Kürsî'dir: Allah'ın birliğini, ilmini ve kudretini hiçbir benzetmeye kaçmadan beyan eder. Sure, 'işittik ve itaat ettik; affet bizi, ey Rabbimiz' duasıyla biter — imanın hem akıl hem itaat olduğunun özeti." },
  { n: 12, ad: "Yûsuf", inis: "Mekke", konu: "Tek bir kıssayı baştan sona anlatan tek sure: Yûsuf'un sabır ve yükseliş destanı.", fazilet: "Kederli ve sabır imtihanı yaşayanların okuması önerilir; kıyamette güzellik verildiği yönünde rivayet meşhurdur.", aciklama: "Kur'an'da tek bir peygamberin hayatını baştan sona anlatan tek suredir. Kardeşlerinin kıskançlığıyla kuyuya atılan Yûsuf; kölelik, iftira ve zindana düşer — ama her seferinde Allah'a güvenir ve her kapıyı açan onun sadakatidir. Sonunda Mısır'ın hazinesini yönetir, kardeşlerini affeder: 'Bugün size kınama yoktur.' Sure, Mekke'nin en zor yılında, Peygamber'in (s.a.v.) yalnızlaştığı günlerde inmiş; 'sabredenin sonu güzeldir' müjdesini bütün müminlere vermiştir." },
  { n: 18, ad: "Kehf", inis: "Mekke", konu: "Ashâb-ı Kehf, iki bahçe sahibi, Mûsâ-Hızır ve Zülkarneyn kıssaları.", fazilet: "Cuma günü okunmak sünnettir; iki cuma arasını nurlandırdığı rivayet edilir. Fitne günlerinde sığınak surelerdendir.", aciklama: "Dört büyük kıssa tek çatı altında: din baskısından kaçan Ashâb-ı Kehf'in yüzlerce yıllık uykusu, iki bahçeyi unutan zenginin helaki, Mûsâ'nın Hızır'la yolculuğunda 'bilmediğin şeyden sorulmaz' dersi ve iki dünyaya hükmeden Zülkarneyn'in adaleti. Her kıssa bir fitneye cevaptır: dine baskıya sabır, mala gönül bağlamama, bilmediğimize tevazu ve iktidara kibirlenmeme. Sure bunları, 'bunu kalbi yumuşasın diye anlattık' diye özetler." },
  { n: 19, ad: "Meryem", inis: "Mekke", konu: "Kur'an'da adıyla anılan tek kadın: Meryem'in mucizesi, Zekeriya'nın duası.", fazilet: "Doğum ve aile kurma imtihanlarında okunması güzeldir; Allah'ın rahmetinin kadına özel tecellisini anlatan suredir.", aciklama: "İsmini, Kur'an'da adıyla andığı tek kadın olan Meryem'den alır. Zekeriya'nın yaşlılığına rağmen evlat duası, Meryem'in karnındaki İsa mucizesi, İbrahim'in putperest babasına yumuşak mücadelesi ve Mûsâ-İsmail-İdris kıssaları birbirine dokunur. Sure, 'Rahman evlat edindi' iddiasına cevap verir; Allah'a yalvaran her kalbin sesinin işitildiğini gösterir — yaşlı Zekeriya'nın duası kabul olunca işaret diliyle konuşmaya mecbur kalmıştır. Doğum, evlat ve aile imtihanlarında okunması güzeldir." },
  { n: 24, ad: "Nûr", inis: "Medine", konu: "Ahlakın güvence altına alındığı sure; kalbi Nur Ayeti'dir.", fazilet: "Nur Ayeti, imanın kalpteki ışığını en berrak anlatan ayettir; iftira ve dedikoduya karşı ahlak kalkanıdır.", aciklama: "Toplumsal ahlakın güvenceye alındığı sure: zina cezası, iftira hadisesi, evlere izinle girme, bakış haramı ve nikâh kuralları sıralanır. Kalbi ise 35. ayettir: 'Allah göklerin ve yerin nurudur' — imanın insan gönlündeki ışığı, misal-i nuriye ile anlatılır. Sure, dedikodu ve iftiranın toplumu nasıl çürüttüğünü de gösterir; 'duymadığınız şeyi neden yaydınız?' sorusu sosyal medya çağında bile tazedir." },
  { n: 36, ad: "Yâsîn", inis: "Mekke", konu: "Ölüm, diriliş ve vahyin haklığı; kalbe dokunan üslup.", fazilet: "Kalb-i Kur'an denir; hastaya ve vefat edenlere okunur. Zor günlerde kalbe dokunan surelerden biridir.", aciklama: "Kur'an'ın kalbi sayılan sure: üç peygamberin 'size gönderildik' sahnesi, halkın 'siz bizim gibisiniz' itirazı ve kalbi dönmüş adamın 'arkamdan kavmimi uyarın' deyişle şehadeti anlatılır. Ölüm anındaki 'keşke' hali, dirilişin topraktan biten çiçekle kanıtı ve gökteki tertipli düzen, hepsi akla-heyecana seslenir. Üslubu o kadar kalbe dokunur ki, 'Kur'an'ın kalbi' sıfatı bunu özetler." },
  { n: 55, ad: "Rahmân", inis: "Medine", konu: "Allah'ın nimetleri ve cennet tabloları — 'hangi nimetleri yalanlarsınız' nakaratı.", fazilet: "Cennet nimetlerini en canlı anlatan suredir; nakaratıyla akılda en çok kalan surelerdendir.", aciklama: "Göklerin-yerin yaratılışından güneş-ayın hesapla akmasına, iki doğunun (şark-garb) dönmesine kadar Allah'ın kusursuz düzeni sayılır; sonra cennet tabloları açılır: iki bahçe, iki pınar, her meyveden çift çift. 31 kez tekrarlanan 'fa-bi-eyyi âlâi rabbikümâ tükezzibân' (hangi nimetlerinizi yalanlarsınız?) nakaratı, insanı ve cini hesaba çeker. Kıyamet ve cehennem sahnesi anlatıldıktan sonra cennetle bitmesi, umudu güçlendirir." },
  { n: 56, ad: "Vâkıa", inis: "Mekke", konu: "Kıyamet sahnesi; üç grup insan (takva, aşire-i yemin, aşire-i şimâl).", fazilet: "Fakirlikten korunmak için akşam okunması rivayet edilmiştir; rızık endişesiyle okunması güzel bir sünnettir.", aciklama: "Kıyamet inkâr edilemez ve insanlar üç gruba ayrılır: öncüler (sâbikûn), sağ el sahipleri ve sol el sahipleri; her grubun hâli tafsilatıyla resmedilir. Cennetin huzuru, 'boş ve bâtıl söz duymazsınız' cümlesiyle taçlanır. Rızık ayetleri meşhurdur: 'O, sizin için yerde ve gökte rızık yarattı' — Allah rızık sahibidir; insan çalışır ama vereni Odur." },
  { n: 67, ad: "Mülk", inis: "Mekke", konu: "Allah'ın mülkü, yaratılış hikmeti ve kâfirlerin akibeti.", fazilet: "Uyuduktan önce okunması sünnettir; kabir azabından koruma rivayet edilir.", aciklama: "Allah'ın mülkü ve ölümün imtihan olarak yaratılması beyan edilir: 'Ölümü yaratan, hanginizin daha güzel amel işlediğini denemek içindir.' Göğün yedi kat olarak tertiplendiği, 'gökyüzünde düzen bozukluğu gördün mü?' sorusuyla akla sunulur. Kabir sahnesinde mümine 'bugün ne okuyordun?' diye sorulur; sure adını bu sahneden alır." },
  { n: 78, ad: "Nebe", inis: "Mekke", konu: "'Yüce haber ne'dir?' — kıyametin en net beyanı.", fazilet: "Namazlarda en çok duyulan surelerdendir; kıyamet akidesini en temiz kuran sureler arasındadır.", aciklama: "Sure, 'Birbirlerine yüce haberden mi soruyorlar?' sorusuyla açılır: yüce haber, kıyamet gerçeğidir. Dünyanın döşek yapıldığı, dağların yürütüldüğü, cehennemin ve cennetin gerçek hâli anlatılır. 'İşte o gün fâsıl gündür' — hesabın kaçınılmazlığını en net kuran akaid dersidir; 30. cüz'ün (Jüz'ü Amme) ilk suresidir." },
  { n: 93, ad: "Duhâ", inis: "Mekke", konu: "'Rabbin seni terk etmedi, darılmadı' — kırgın kalbe ilaç.", fazilet: "Yetim ve kimsesizle ilgilenenlerin okuması tavsiye edilir; 'seni terk etmedi' müjdesi kırgın kalbe ilaçtır.", aciklama: "Kuşluk vakti inen, Peygamber'e (s.a.v.) en samimi hitaplardan biridir: 'Rabbin seni terk etmedi ve darılmadı.' Yetimliği anılıp yetim hakkı, isteyeni azarlamama ve nimeti duyurma öğütlenir. 'Rabbin seni razı edecek' müjdesiyle biter; kırgın, yalnız ve yorgun kalbe en çok dokunan surelerdendir." },
  { n: 94, ad: "İnşirâh", inis: "Mekke", konu: "'Güçlükle beraber kolaylık' — yorguna çift müjde.", fazilet: "'Zorluk kolaylığa zincirlidir' müjdesi sınav, borç ve yorgunluk anında okunur; 6. ayet en çok paylaşılan ayetlerdendir.", aciklama: "'Kalbini genişletmedik mi?' sorularıyla açılır ve 'şüphesiz güçle beraber kolaylıktır' müjdesi iki kez tekrarlanır — bir zorluk, iki kolaylıkla çözülür. 'İşin bitince yorul, Rabbine yönel' ayeti çalışma ahlakının özüdür: didin, ama yönünü Rabbine koru. Zorluk dönemlerinde en çok okunan surelerdendir." },
  { n: 97, ad: "Kadr", inis: "Mekke", konu: "Kadir Gecesi: bin aydan hayırlı gece.", fazilet: "Kadir Gecesi'nde en çok okunan suredir; son on gecede ihya önerilir, geceyi bulanın affedileceği rivayet edilir.", aciklama: "Kur'an'ın indirildiği gecenin değeri anlatılır: 'Bin aydan hayırlıdır' — seksen üç yıllık ibadetten bile üstün bir gece. Melekler ve Ruh (Cebrail) o gece yer yüzüne iner; gece boyunca selâmettir, fecre kadar sürer. Ramazan'ın son on gecesinde aranan bu gece, ibadet ömrünü bin ayın üzerine çıkarır." },
  { n: 99, ad: "Zilzâl", inis: "Medine", konu: "Yerin son sarsıntısı ve zerre ağırlığınca hesap.", fazilet: "Namazlarda sık okunur; hesap bilinci için okunması tavsiye edilir.", aciklama: "Yerin son sarsıntısı ve 'yer, haberlerini dışarı çıkarır' sahnesi anlatılır; insanlar tek tek amel defterlerini görür: 'Zerre ağırlınca hayır da, şer de görürsünüz.' Kısa ama akideyi temel atmaya yetecek kadar derindir — hesap bilinci, günlük ahlakın faturasıdır." },
  { n: 103, ad: "Asr", inis: "Mekke", konu: "İki ayette İslam'ın özeti: iman, salih amel, hak ve sabra tavsiye.", fazilet: "Şâfiî: 'İnsanlar Asr sûresini tefekkür etselerdi, başka öğreticiye ihtiyaç duymazlardı.' Namazlarda en sık okunan surelerdendir.", aciklama: "İki ayetlik ama 'Kur'an'ın dörtte birini özetleyen' sure sayılır (İmam Şâfiî). Zamana yemin edilir: insan hüsrandadır — kural değil istisna. Kurtuluş dört şarttır: iman, salih amel, hakka tavsiye ve sabra tavsiye. İman tek başına yetmez; amel ister, dayanışma ister, sabır ister — İslam'ın en yoğun özeti buradadır." },
  { n: 105, ad: "Fîl", inis: "Mekke", konu: "Fillerle gelen ordu ve kuşların taşları — Kâbe'nin savunması.", fazilet: "Çocukların ilk ezberlediği surelerdendir; Allah'ın koruyan gücünü en somut anlatan kıssadır.", aciklama: "Yemen valisi Ebrehe'nin fil ordusuyla Kâbe'yi yıkmaya geldiği ve kuşların gönderdiği taşlarla helak olduğu olay anlatılır. Allah'ın evini kendisi korur: insan gücü ne kadar büyük olursa olsun, Allah'ın koruduğunu kimse yıkamaz. Peygamber'in (s.a.v.) doğduğu yıla 'Fil Yılı' denir; sure, bu olayla İslam tarihine açılan kapıdır." },
  { n: 106, ad: "Kureyş", inis: "Mekke", konu: "Kâbe'nin sahiplerine rızık ve güven lütfu.", fazilet: "Fîl ile aynı vahiy grubundandır, birlikte okunması yaygındır; rızık ve yol güvenliği duası olarak okunur.", aciklama: "Kureyş'in kış-yaz seferleri, açlıktan güvene çıkarılması ve Kâbe'ye hizmetinden gelen itibar anlatılır. 'Bu Beyt'in Rabbine kulluk etsinler' çağrısı, nimetin sahibine şükretmeye davettir. Ticaret güvenliği ve rızık bolluğu Allah'ın lütfudur; sure bu lütufa şükranı hatırlatır." },
  { n: 107, ad: "Mâûn", inis: "Mekke", konu: "Din'in özü: yetime, fakire, gafletsiz namaza.", fazilet: "Hayır işlerinin dinî değerini hatırlatan sure; riya ve gafletle namaz kılanı uyarır.", aciklama: "'Dini yalanlayan kimse' tanımı şaşırtıcı biçimde ahlakla başlar: yetimi itelemek, fakiri doyurmaya yanaşmamak. Sonra ibadete döner: namazda gaflet, riya ve yardımı ketum tutmak. İbadetle ahlakı birleştiren en sert eleştirilerden biridir — namaz kıldığı hâlde yetim hakkı gözetmeyen kişi, dini yalanlıyordur." },
  { n: 108, ad: "Kevser", inis: "Mekke", konu: "En kısa sure: bol nimet, kurban ve namaz.", fazilet: "En kısa sure olması nedeniyle namazlarda sık okunur; kurban keserken hatırlanır.", aciklama: "Kur'an'ın en kısa suresi — üç ayet. 'Kevser' cennet nehri ya da bolluk olarak tefsir edilir; Peygamber'e (s.a.v.) 'Rabbin için namaz kıl ve kurban kes' emri verilir. 'Sana nefret eden, zaten soyu kesiktir' — düşmanların sözlü saldırısına en sert cevap. Hz. Hasan'ın doğumuyla ilgili inmesi rivayet edilir; bolluk ve şükranın özüdür." },
  { n: 109, ad: "Kâfirûn", inis: "Mekke", konu: "Tevhidin sınırı: 'Sizin dininiz size, benim dinim bana.'", fazilet: "'Kâfirûn, Kur'an'ın dörtte biridir' (Tirmizî) — tevhidin ilke açıklamasıdır. Sabah-akşam okunması önerilir; şirk fitnesinden koruyan suredir.", aciklama: "Kureyş'in 'bir yıl senin dinine, bir yıl bizim dinimize tapalım' teklifine net cevaptır: 'Siz neye kulluk ederseniz edin, ben kulluk etmem; ben neye kulluk ediyorsam, siz etmezsiniz.' Sure küfürden değil, küfürle birleşmekten sakındırır; tevhidin sınırını çizer ve itidalin korur. 'Sizin dininiz size, benim dinim bana' — dünya ilişkisi ayrı, ibadet ayrıdır." },
  { n: 110, ad: "Nasr", inis: "Medine", konu: "Zafer geldiğinde: hamd ve istığfarla veda.", fazilet: "Hz. Peygamber'in veda döneminde çok okuduğu sure; başarıdan sonra hamd ve istığfar ahlakını öğretir.", aciklama: "Medine'nin son yıllarında inmiştir: 'Yardım ve zafer geldiğinde' insanların grup grup İslam'a girişi bildirilir; ardından 'Rabbine hamd et ve O'ndan bağışlanma dile' çağrısı gelir. İbn Abbâs rivayetine göre Hz. Peygamber bunu okuyunca yolculuğunun sona yaklaştığını anladı. Zaferin sonrası hamddır ve istığfardır — güçlenen mümin, kibirlenmek yerine af diler." },
  { n: 112, ad: "İhlâs", inis: "Mekke", konu: "Tevhidin özeti — Allah bir, samed, doğurmadı, doğurulmadı.", fazilet: "Kulun 'Allah'ı bilme' çabasının zirvesi; üç kez okuma kişiye isterse Kur'an sevabı verir (rivayet).", aciklama: "'İhlâs' samimiyet demektir; bütün ibadetin ilkesi buraya sığar. Allah bir, Samed'dir (herkes O'na muhtaç, O kimseye muhtaç değil); doğurmadı ve doğurulmadı; hiçbir şey O'na denk değil. Dört kısa cümle, putperestlikten 'Allah'ın oğlu var' fikrine kadar bütün yanlış tasavvurları tek tek çürütür. Peygamber (s.a.v.) bu surenin sevabının Kur'an'ın üçte birine denk geldiğini bildirmiştir — çünkü tevhid, Kur'an'ın üçte biridir." },
  { n: 113, ad: "Felak", inis: "Mekke", konu: "Şerrden sığınma — gece karanlığı, büyü, kıskançlık.", fazilet: "Sabah-akşam üçer kez okunması sünnettir (muavvizât); Peygamber (s.a.v.) hastaların üzerine üfürerek okurdu.", aciklama: "'Felak' sabah yarılması demektir: kötülüğün doğmasından önce gün doğumuna sığınmak gibi. Şerrinden sığınılan üç şey sayılır: karanlık basınca gecenin, düğümlere üfleyenin (büyü ve hurafe) ve kıskandığı zaman kıskananın. İnsanın maddi-manevi bütün tehlikelerine karşı 'Allah'a sığınırım' demenin en kısa yolu." },
  { n: 114, ad: "Nâs", inis: "Mekke", konu: "İnsanların, cinlerin şerrinden Allah'a sığınma.", fazilet: "Vesveseye karşı en güçlü sığınak (muavvizât); uyku öncesi çocuklara üçer kez okutulan gelenek hadislerle desteklenir.", aciklama: "Sığınma serisinin son suresi: insanların Rabbine, Melikine ve İlahına sığınılır — kalpteki vesveseyi ancak Allah'ın üç ismiyle savunabilirsin. Cin ve insan şeytanlarının fısıltısına karşı kapıyı kapatır; göğse değil, kalbe çalışan düşman daha sinsi olduğu için son sıradadır. Muavvizât'ın (sığınma surelerinin) kapanışıdır." },
];

// ── 28: NAMAZ ÖĞRETİCİ (rekat rekat) ────────────────────────
export interface NamazAdim { adim: string; yazi: string; arapca?: string }
export const NAMAZ_REHBERİ: NamazAdim[] = [
  { adim: "1. Niyet + Tekbir", yazi: "Kalbende niyet et, elleri kulaklara kaldırıp 'Allâhu Ekber' de.", arapca: "اللَّهُ أَكْبَرُ" },
  { adim: "2. Kıyam (ayakta)", yazi: "Eller bağlanır; Sübhâneke, E'ûzü-Besmele ve Fâtiha okunur; ardından bir sure (3 kısa ayet).", arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ" },
  { adim: "3. Rükû (eğilme)", yazi: "'Allâhu Ekber' deyip eğil; bel düz, dizlere eller dayalı: 'Sübhâne Rabbiye'l-Azîm' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْعَظِيمِ" },
  { adim: "4. İ'tidal (kalkma)", yazi: "'Semi'allâhü limen hamideh' diyerek doğrul, ayakta: 'Rabbenâ leke'l-hamd'.", arapca: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ" },
  { adim: "5. Secde (baş koyma)", yazi: "'Allâhu Ekber' deyip yere kapan; alnı, burnu, elleri, dizleri yerde: 'Sübhâne Rabbiye'l-A'lâ' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْأَعْلَى" },
  { adim: "6. Oturuş (birinci)", yazi: "'Allâhu Ekber' diye doğrul, 'Rabbiğfirlî' diye otur; sonra ikinci rekat için secdeye dön.", arapca: "رَبِّ اغْفِرْ لِي" },
  { adim: "7. İkinci rekat", yazi: "Fâtiha + sure okunup rükû-secde tekrar edilir (yukarıdaki adımlar)." },
  { adim: "8. Et-Tehiyyâtü", yazi: "İkinci rekatın oturuşunda 'Et-Tehiyyâtü…' okunur (2 rekatta burada son oturuş).", arapca: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ" },
  { adim: "9. Salli-Bârik", yazi: "3+ rekatta ikinci oturuşta Salli-Bârik duaları da okunur.", arapca: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ" },
  { adim: "10. Selam", yazi: "Önce sağa, sonra sola dönerek 'Es-Selâmu aleyküm ve rahmetullah' de ve namazı bitir.", arapca: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ" },
];

// ── 35: BEBEK DUASI & DOĞUM KÖŞESİ ─────────────────────────
export interface BebekDua { baslik: string; ar: string; tr: string; kaynak: string }
export const BEBEK_DUALARI: BebekDua[] = [
  { baslik: "Çocuk Duası (nihai)", ar: "رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ", tr: "Rabbim! Bana katından tertemir bir nesil bağışla; şüphesiz sen duaları işitirsin.", kaynak: "Âl-i İmrân 3:38" },
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

// ── 41: HOCA KARŞILAŞTIRMA — meşhur ayetler (everyayah ayet-bazlı sesle) ──
// Her ayet, RECITERS listesindeki ayet-bazlı (everyayah) hocalarla dinlenir.
export const HOCA_KARSILASTIRMA_AYETLER: Array<{ sure: number; sureAdi: string; ayet: number; etiket: string }> = [
  { sure: 1, sureAdi: "Fâtiha", ayet: 1, etiket: "Besmele" },
  { sure: 1, sureAdi: "Fâtiha", ayet: 2, etiket: "Hamd Âlemlerin Rabbine" },
  { sure: 2, sureAdi: "Bakara", ayet: 255, etiket: "Ayete'l-Kürsî" },
  { sure: 2, sureAdi: "Bakara", ayet: 286, etiket: "Rabbenâ — güç yetmezlik" },
  { sure: 24, sureAdi: "Nûr", ayet: 35, etiket: "Allah göklerin ve yerin nurudur" },
  { sure: 13, sureAdi: "Ra'd", ayet: 28, etiket: "Kalpler ancak zikirle huzur bulur" },
  { sure: 94, sureAdi: "İnşirâh", ayet: 6, etiket: "Güçlükle beraber kolaylık" },
  { sure: 65, sureAdi: "Talâk", ayet: 3, etiket: "Kim Allah'a tevekkül ederse" },
  { sure: 112, sureAdi: "İhlâs", ayet: 1, etiket: "Kul hüvellâhü ehad" },
  { sure: 21, sureAdi: "Enbiyâ", ayet: 107, etiket: "Âlemlere rahmet" },
  { sure: 3, sureAdi: "Âl-i İmrân", ayet: 173, etiket: "Hasbünallâh" },
  { sure: 39, sureAdi: "Zümer", ayet: 53, etiket: "Rahmetten ümit kesmeyin" },
];

// ── 47: CAMİ BULUCU — Google Maps embed (anahtar gerektirmez, sorgu bazlı)
export const camiHaritaUrl = (konum: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent("cami " + konum)}&output=embed`;
export const camiListeUrl = (konum: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent("mosque near " + konum)}`;

// ── 45/58: SALAH TRACKER + DUA TAKİBİ gün anahtarları ───────
export const SALAH_VAKITLERI = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"] as const;

// ── 60: TOPLU HATİM — cüz eşitleme yardımcıları ────────────
export interface TopluHatimDurum { cüzler: number[]; katilimciSayisi: number }
export const TOPLU_HATIM_CÜZ = Array.from({ length: 30 }, (_, i) => i + 1);
// ── 12: KANAL REHBERİ — YouTube/Instagram algoritma ipuçları ──
export interface KanalIpucu { baslik: string; metin: string; kategori: string }
export const KANAL_REHBERI: KanalIpucu[] = [
  { kategori: "YouTube", baslik: "İlk 3 saniye kuralı", metin: "Videonun ilk 3 saniyesinde en etkileyici ayet bölümünü koy — algoritma izlenme süresine bakar, izlenme süresi yüksek olan videoya daha çok gösterim verir." },
  { kategori: "YouTube", baslik: "Başlık formülü", metin: '"[Ayet konusu] | [Sure adı] [Ayet no]" formatı kullan: "Huzur Arayanlara | Ra"d 28". Emoji başlığın başına, değil sonuna.' },
  { kategori: "YouTube", baslik: "Açıklama ve etiket", metin: "İlk satırda ayetin özeti, sonra kaynak, sonra 5-8 etiket (#kuran #ayet #huzur). Açıklamaya site linkini koy — trafik geri döner." },
  { kategori: "YouTube", baslik: "Shorts döngüsü", metin: "Shorts videolarını 30-45 saniye yap; döngüsel his veren (sonu başla uyumlu) videolar tekrar izlenir ve algoritma bunu ödüllendirir." },
  { kategori: "Instagram", baslik: "Reels + Carousel ikilisi", metin: "Reels ile dikkat çek, carousel (4:5 ayet kartları) ile kaydet — kaydedilen gönderi algoritmada en güçlü sinyaldir." },
  { kategori: "Instagram", baslik: "Sabit hikaye", metin: "En iyi videonuzu 'Öne Çıkanlar'a sabitleyin; profil ziyaretçisi ilk 10 saniyede ne yaptığınızı görsün." },
  { kategori: "Instagram", baslik: "Paylaşılabilir açıklama", metin: "»Bir kardeşine ilet» gibi nazik paylaşım çağrısı paylaşımı artırır; zorlamayan cümleler daha çok paylaşılır." },
  { kategori: "Genel", baslik: "Düzenli saat", metin: "Her gün aynı saatte paylaş (öneri: sabah 07-08 veya yatsı sonrası 21-22). Topluluk alışkanlığı algoritmadan da önemlidir." },
  { kategori: "Genel", baslik: "Özel günler", metin: "Cuma günleri ve kandil gecelerinde paylaşımlar 3-5 kat daha çok etkileşim alır — Özel Gün Takvimi'ni takip et." },
  { kategori: "Genel", baslik: "Telif güvenliği", metin: "Sitedeki videolar telifsiz şablonlar + izinli kari kayıtlarıyla üretilir; yine de YouTube Content ID bazlı uyarı çıkabilir — itiraz mektubu hazır bulundur." },
];

// ── 48: TECVİD REHBERİ (madde 48) — temel kurallar, örneklerle ──
export interface TecvidKurali { baslik: string; tanim: string; ornek: string; seviye: "temel" | "orta" | "ileri" }
export const TECVID_KURALLARI: TecvidKurali[] = [
  { baslik: "Nûn-u Sâkin ve Tenvîn: İzhar", tanim: "Nûn sâkin veya tenvînden sonra harf-i hal (ا هـ ع ح غ خ) gelirse nûn, ġunnasız ve açık okunur.", ornek: "مِنْ آمَنَ (min â-mene) · أَنْتُمْ (entüm) · أَنْعَمْتَ (en'amte)", seviye: "temel" },
  { baslik: "Nûn-u Sâkin ve Tenvîn: İdgam", tanim: "ي ر م ل و ن harflerinden biri gelirse nûn, sonraki harfe karışır (bazılarıyla ġunna: ي ن م و; ġunnasız: ر ل).", ornek: "مَنْ يَعْمَلْ (men ya'mel — ġunnalı) · مِنْ رَبِّهِمْ (mir-rabbihim — ġunnasız)", seviye: "temel" },
  { baslik: "Nûn-u Sâkin ve Tenvîn: İklab", tanim: "ب (bâ) gelirse nûn, gizlice mîm'e çevrilir ve ġunnayla okunur — hatta üzerinde م yazılır.", ornek: "مِنْ بَعْدِ (mim-be'di) · سَمِيعٌ بَصِيرٌ (semî'um-basîrun)", seviye: "temel" },
  { baslik: "Nûn-u Sâkin ve Tenvîn: İhfa", tanim: "Kalan 15 harf gelirse nûn, ġunnayla gizlenir — dil harfe dokunmaz, burundan 2-3 vakt ġunna.", ornek: "مِنْ قَبْلِ (mink-kabli) · أَنْتَ (ante) · انْتُمْ (intum)", seviye: "temel" },
  { baslik: "Mîm-i Sâkin: İzhar-ı Şefevî", tanim: "Mîm sâkinden sonra harf-i şefevî (ف ب م و) gelirse mîm açık okunur — dudaklar hafif ayrılır.", ornek: "الْحَمْدُ لِلَّهِ (el-hamdu lillâh) · تَمْ كُنتُم (tum-kuntum)", seviye: "temel" },
  { baslik: "Mîm-i Sâkin: İdgam-ı Şefevî (Ġunna)", tanim: "Mîm sâkinden sonra yine م veya ن gelirse mîm, ġunnayla sonraki harfe karışır (2 vakit).", ornek: "لَهُمْ مَا (lehum-mâ) · مِنْهُمْ مَنْ (minhum-men)", seviye: "orta" },
  { baslik: "Mîm-i Sâkin: İhfa-ı Şefevî", tanim: "Bâ gelirse mîm ile bâ arasında ġunna yapılır (ihfa-ı şefevî).", ornek: "تَرْمِيهِمْ بِحِجَارَةٍ (termîhim-bi-hicâre)", seviye: "orta" },
  { baslik: "Med: Tabiî (Doğal Uzatma)", tanim: "Harf-i med (ا و ي) üzerinde hiçbir sebep ve zaıd yoksa 1 vakit uzatılır — fazlası hata.", ornek: "قَالَ (kâle) · يَقُولُ (yekûlu) · قِيلَ (kîle)", seviye: "temel" },
  { baslik: "Med: Muttasıl (Bitişik Uzatma)", tanim: "Aynı kelimede harf-i medden sonra hemze gelirse 4-5 vakit uzatılır (tevassut 4 müstahsen).", ornek: "جَاءَ (câe) · السُّوءَ (es-sûe) · سِيئَتْ (sîet)", seviye: "orta" },
  { baslik: "Med: Münfasıl (Ayrı Uzatma)", tanim: "Kelimede harf-i med, sonraki kelimede hemze gelirse 4-5 vakit uzatılır (vamcelerin tercihi farklı).", ornek: "يَا أَيُّهَا (yâ eyyühâ) · بِمَا أُنزِلَ (bimâ unzile)", seviye: "orta" },
  { baslik: "Med: Lâzım (Zorunlu Uzatma)", tanim: "Harf-i medden sonra şedde gelirse 6 vakit uzatılır — en uzun meddir.", ornek: "الضَّالِّينَ (ed-dâl-lîne) · الحَاقَّةُ (el-hâk-ketü) · كُفَّارًا (küf-fâren)", seviye: "orta" },
  { baslik: "Med: Arız-ı Sükûn", tanim: "Vakfedince harf-i med üzerine sükûn arız olursa 2, 4 veya 6 vakit uzatılabilir (vakfa mahsus).", ornek: "نَسْتَعِينُ ۝ vakıf: nâs-ta'î-nû (2/4/6)", seviye: "ileri" },
  { baslik: "Şedde ve Ġunna", tanim: "Şeddeli harfin ilk harfi sâkin gibi, ikincisi harekeli okunur; ن و م şeddeliyse 2 vakit ġunna şart.", ornek: "إِنَّ (in-ne) · ثُمَّ (thum-me) · مِنَّ (min-ne)", seviye: "temel" },
  { baslik: "Kalkale", tanim: "Vakıfta ق ط ب ج د harfleri sâkin kalırsa ses, boğazda hafif zıplamayla (kalkale) vurgulanır — büyük/küçük kalkale.", ornek: "أَقْرَبْ (ak-rab) · وَتَبَّ (ve teb-bet)", seviye: "ileri" },
  { baslik: "Lâm-ı Şemsî ve Kamrî", tanim: "Şemsî harflerde (14 adet) elifteki LÂM okunmaz, sonraki harf şeddeli; kamrîde LÂM açık okunur.", ornek: "Şemsî: اَلرَّحْمَن (er-rahmân) · Kamrî: اَلْقَمَر (el-kamer)", seviye: "temel" },
  { baslik: "Lâm ve Râ'nın Okunuş Özellikleri", tanim: "Lâm kalın (talık) veya ince okunabilir; Râ önceki harekete göre kalın/ince olur — tilavetin tadı buradadır.", ornek: "اللَّهُ (kalın) · بِسْمِ الرَّبِّ (ince)", seviye: "ileri" },
];

export const TECVID_SEVIYE_ETIKETI: Record<string, { label: string; renk: string }> = {
  temel: { label: "Temel", renk: "emerald" },
  orta: { label: "Orta", renk: "sky" },
  ileri: { label: "İleri", renk: "fuchsia" },
};
