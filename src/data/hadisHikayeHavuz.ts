// ═══════════════════════════════════════════════════════════════
// HADISHIKAYEHAVUZ.TS — "Hikâyesi — nasıl söylendi" havuzu (1. parti)
//
// ★ 27.11 (kullanıcı emri: "full hikaye kanka hepsini"): Bankadaki HER hadis
//   kartının hikâye paneli dolsun diye havuz ayrı dosyaya alındı.
//
// KURAL (değişmez): UYDURMA YOK. Her kayıt ya kaynakta AYNEN nakledilen olayı
//   anlatır, ya da rivayetin kendi metninden/bâbından çıkan söyleniş zeminini
//   dürüstçe tarif eder. Olay uydurulmaz, kişi adı uydurulmaz, sahne
//   kurulmaz. `kaynak` alanı veritabanındaki künye metninin BİREBİR aynısıdır;
//   eşleşme bu metinden üretilir.
// ═══════════════════════════════════════════════════════════════

export const HAVUZ: { kaynak: string; kaynakKunye: string; olay: string }[] = [
  // ═══ SABIR ═══════════════════════════════════════════════════
  {
    kaynak: "Müslim, Zikir, 64",
    kaynakKunye: "Müslim, Zikir 64; Suheyb b. Sinân er-Rûmî",
    olay:
      "Bu sözü Suheyb b. Sinân er-Rûmî nakletti. Mekke'de her şeyini bırakıp Medine'ye hicret eden bu sahabi, Peygamber'in şu cümlesini ömrü boyunca tekrarladı:\n\n" +
      "«Müminin işi hayrettir; her hâli hayırdır ve bu yalnız mümine mahsustur: ona sevindirici bir şey gelirse şükreder, hayır olur; başına bir dert gelirse sabreder, yine hayır olur.»\n\n" +
      "Sözün ağırlığı, malını mülkünü geride bırakmış bir adamın ağzından çıkmasındadır: kaybı en büyük olandan duyulmuş bir tesellidir.",
  },
  {
    kaynak: "Buhari, Merda, 1",
    kaynakKunye: "Buhârî, Merdâ 1; Müslim, Birr 45–46",
    olay:
      "Hastalık bâbının ilk hadisi, musibetin Allah'tan gelen bir ceza değil bir temizlik olduğunu söyler: kul dert aldıkça günahından eksilir.\n\n" +
      "Peygamber'in bu sözü, Medine'de ateşler içinde yatan sahabilerin başında söylenmiş tesellilerden biridir — hasta ziyaretine gelen herkes, yanına götürdüğü tek şeyin bu cümle olması gerektiğini bilirdi.",
  },
  {
    kaynak: "Beyhaki, Şuab, 12/213",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 12/213",
    olay:
      "Beyhakî'nin iman şubelerini topladığı eserde sabır, yalnız diş sıkmak olarak değil, sıkışma ânında tutunulan bir yardım olarak geçer.\n\n" +
      "Rivayet, sabrı insanın kendi gücüne değil Allah'ın desteğine bağlar: dayanma, kulun kendi iradesinden çok aldığı yardımla ayakta kalır.",
  },
  {
    kaynak: "Ahmed b. Hanbel, Müsned, 2803 (meâl)",
    kaynakKunye: "Ahmed b. Hanbel, Müsned 2803",
    olay:
      "Ahmed b. Hanbel'in Müsned'inde sabır bahsinde nakledilen bu rivayet, sabrın musibetin ilk anına ait olduğunu söyleyen hadis ailesindendir.\n\n" +
      "Yani sabır, gözyaşı döküldükten ve ah çekildikten sonra takınılan sükûnet değil; haber ilk geldiğinde gösterilen dayanmadır. Müsned bu ölçüyü başka bir sözle de destekler: sabır, sonunda zafer getiren ordudur.",
  },
  {
    kaynak: "Buhari, Cenâiz, 36 (meâl)",
    kaynakKunye: "Buhârî, Cenâiz 36; Müslim, Cenâiz 14",
    olay:
      "Peygamber, bir kabrin başında ağlayan bir kadına rastladı ve «Allah'tan kork, sabret» dedi. Kadın, onu tanımadan «Benim başıma geleni sen mi çektin?» diye çıkıştı. Peygamber bir şey söylemeden geçip gitti.\n\n" +
      "Sonra ona, «Bu, Allah'ın Resûlü'ydü» dediler. Kadın kapıya koştu ve özür diledi. Peygamber cevap verdi: «Gerçek sabır, musibetin ilk vuruşundaki sabırdır.»\n\n" +
      "Yani sabır, acı geçtikten sonra takınılan sükûnet değil; haber ilk geldiği anda gösterilen dayanmadır.",
  },

  // ═══ ŞÜKÜR ═══════════════════════════════════════════════════
  {
    kaynak: "Tirmizi, Et'ime, 63",
    kaynakKunye: "Tirmizî, Et'ime 63; Ebû Hüreyre",
    olay:
      "Ebû Hüreyre'nin naklettiğine göre Peygamber, yemek bâbında bir denklik kurdu: «Yemek yiyip şükreden, oruç tutup sabreden gibidir.»\n\n" +
      "Medine sofralarında bu cümle bir ölçü oldu: arpa ekmeğiyle karnını doyuran da en zengin sofra kadar sevap kazanabilirdi; ölçü, tabağın doluluğu değil, kalkan elin ardından söylenen hamd idi.",
  },
  {
    kaynak: "Müslim, Zikir, 69 (meâl)",
    kaynakKunye: "Müslim, Zikir 69; Tirmizî, Et'ime 63",
    olay:
      "Aynı denkliğin Müslim'deki rivayeti iki yolu yan yana koyar: yiyip şükreden ile aç kalıp sabreden.\n\n" +
      "Biri nimetin içinde Allah'ı anar, öbürü nimetin yokluğunda. İkisi de aynı terazide tartılır; çünkü ikisi de kendi hâlinin ötesine bakıp vereni tanımıştır.",
  },
  {
    kaynak: "Beyhaki, Şuab, 4/135 (meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 4/135",
    olay:
      "Beyhakî'nin şükür bâbında topladığı bu rivayet, genişliği (güzel yaşamayı) güzel ahlâka ve kimseye muhtaç olmamaya bağlar.\n\n" +
      "Yani bolluk, elde biriken mal değil; insanın başkasının kapısına bakmadan, ahlâkını koruyarak yaşayabilmesidir. Rivayet şükrü de buraya oturtur: şükür, sahip olunanı saymak değil, muhtaç olmamayı bilmektir.",
  },

  // ═══ ANA-BABA ════════════════════════════════════════════════
  {
    kaynak: "Beyhaki, Şuab, 7/130 (meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 7/130",
    olay:
      "Bu rivayet, anne-babası öfkeyle seslendiğinde bile onlara «Allah size rahmet etsin» diyen evladı tarif eder.\n\n" +
      "Sesin yükseldiği anda karşılık vermemek, haklı çıkmaya çalışmamak; öfkenin üstüne bir dua koymak. Rivayet, iyiliğin sınırını tam buraya çizer: karşı taraf ölçüyü kaçırsa da evlat ölçüyü korur.",
  },
  {
    kaynak: "Buhari, Edeb, 9 (meâl)",
    kaynakKunye: "Buhârî, Edeb 1; Müslim, Îmân 137–139; Abdullah b. Mesud",
    olay:
      "Abdullah b. Mesud anlatıyor: Peygamber'e «Hangi amel daha faziletlidir?» diye sordum.\n\n" +
      "«Vaktinde kılınan namaz» dedi. «Sonra hangisi?» dedim. «Anne-babaya iyilik» dedi. «Sonra hangisi?» dedim. «Allah yolunda cihad» dedi.\n\n" +
      "Üç soru, üç cevap. Sıralama, o gün Medine'de bir ölçü oldu: en büyük farzların hemen ardına oturan şey, evde bekleyen anne-babaydı.",
  },
  {
    kaynak: "Nesai, Birr, 5 (meâl)",
    kaynakKunye: "Nesâî, Birr 5; Muâviye b. Câhime",
    olay:
      "Muâviye b. Câhime, cihada katılmak isteyip Peygamber'e geldi. Peygamber ona, «Annen sağ mı?» diye sordu; «Evet» dedi. Bunun üzerine buyurdu: «Onun ayağının yanına dön; cennet oradadır.»\n\n" +
      "Bir başka rivayette aynı söz «Cennet ana-babanın ayakları altındadır» diye nakledilir. Yani cennet, uzak diyarlarda aranan bir ödül değil, evin içindeki hizmetin altına serilmiş bir yoldur.",
  },
  {
    kaynak: "Tirmizi, Birr, 3 (meâl)",
    kaynakKunye: "Tirmizî, Birr ve's-Sıla 3 (1899–1900); Abdullah b. Amr",
    olay:
      "Abdullah b. Amr'ın naklettiği bu hadis, iki kapıyı birbirine bağlar: kulun Allah'ın rızasını araması ile babasının rızasını araması.\n\n" +
      "«Rabbin rızası babanın rızasındadır; Rabbin öfkesi de babanın öfkesindedir.» Yani görünmeyen rıza, görünen bir kapıdan geçer: evdeki ihtiyarın gönlü.\n\n" +
      "Aynı bâbda geçen diğer rivayet, hadisin doğduğu olayı da anlatır: cihada izin isteyen bir gence Peygamber, «Anne baban sağ mı?» diye sorar; «Evet» cevabını alınca, «Öyleyse onların yanına dön; onlara hizmet etmen senin cihadındır» buyurur.",
  },
  {
    kaynak: "Buhari, Edeb, 29",
    kaynakKunye: "Buhârî, Edeb 28–29; Müslim, Birr 140; Âişe",
    olay:
      "Bu, tek bir olayın cevabı değil. Hz. Âişe'nin naklettiğine göre Peygamber komşu hakkındaki tavsiyeyi o kadar sık tekrarladı ki, sonunda şöyle dedi: «Cibril bana komşuyu o kadar tavsiye etti ki, onu mirasçı kılacağını sandım.»\n\n" +
      "Komşuluk, bir nezaket cümlesi olmaktan çıkıp miras hukukuna yaklaşan bir hakka dönüştü.",
  },
  {
    kaynak: "Buhari, Edeb, 31",
    kaynakKunye: "Buhârî, Edeb 31; Müslim, Îmân 74–75; Ebû Hüreyre",
    olay:
      "Ebû Hüreyre'nin naklettiği bu hadis tek bir cümle değil, üç kapıyı aynı anahtarla açan bir söz zinciridir:\n\n" +
      "«Kim Allah'a ve ahiret gününe inanıyorsa komşusuna ikram etsin. Kim Allah'a ve ahiret gününe inanıyorsa misafirine ikram etsin. Kim Allah'a ve ahiret gününe inanıyorsa ya hayır konuşsun ya da sussun.»\n\n" +
      "Üçü de imana bağlandı: komşunun hakkı, kapına gelenin hakkı ve dilin hakkı; üçü de aynı imanın borcu sayıldı.",
  },
  {
    kaynak: "Buhari, Edeb, 30 (meâl)",
    kaynakKunye: "Buhârî, Edeb 30; Müslim, Îmân 73; İbn Abbas",
    olay:
      "İbn Abbas'ın naklettiği rivayet, komşuluğu tarifin ötesine taşır: «Komşusu açken tok yatan bizden değildir.»\n\n" +
      "Cümle bir aidiyet ölçüsü koyar. Yani Müslüman topluluğu, aynı mahallede tok ve açın yan yana yatabildiği bir topluluk değildir; birinin karnı doymadan öbürünün uykusu tamam sayılmaz.",
  },
  {
    kaynak: "Buhari, Edeb, 5; Müslim, İman, 74",
    kaynakKunye: "Buhârî, Edeb 31; Müslim, Îmân 74",
    olay:
      "Komşu hakkındaki hadisin iki büyük kitaptaki ortak lafzı aynı yere çıkar: iman, komşuya iyiliği bir tercih değil borç yapar.\n\n" +
      "Peygamber bu cümleyi sık sık tekrarladı; öyle ki ashâb, komşunun mirasçı sayılacağını düşündü. Yani söz, bir gönül tavsiyesi olarak söylendi ama hukuk ağırlığında duyuldu.",
  },

  // ═══ AHLÂK & DİL ═════════════════════════════════════════════
  {
    kaynak: "Ahmed b. Hanbel, Müsned, 8952",
    kaynakKunye: "Ahmed b. Hanbel, Müsned 8952; Buhârî, Edeb; Mâlik, Muvatta",
    olay:
      "Peygamber, «Ben ancak güzel ahlâkı tamamlamak için gönderildim» buyurdu.\n\n" +
      "Bu cümle, risaletin işini tarif eder: yeni bir ahlâk icat etmek değil, insanların arasında zaten kırılmış olanı onarmak, eksik kalanı tamamlamak. Yani peygamberlik, ahlâkın düşmanı değil, tamamlayıcısı olarak konuştu.",
  },
  {
    kaynak: "Buhari, İman, 4",
    kaynakKunye: "Buhârî, Îmân 4–5; Müslim, Îmân 64–65",
    olay:
      "Peygamber'e «Müslümanların hangisi daha faziletlidir?» diye soruldu. Cevabı kısa oldu: «Dilinden ve elinden Müslümanların güvende olduğu kimse.»\n\n" +
      "İman iddiası böylece ölçülebilir bir şeye bağlandı: komşusunu incitmeyen bir dile ve ele. Söz, o gün Medine'de yeni kurulan topluluğun en pratik sınavıydı.",
  },
  {
    kaynak: "Buhari, Edeb, 69 (meâl)",
    kaynakKunye: "Buhârî, Edeb 69; duâ rivayeti",
    olay:
      "Bu, Peygamber'in dil ve kalp için yaptığı dualardan biridir: «Allah'ım! Dilimi iyileştir, kalbimi doğruya yönlendir.»\n\n" +
      "Duânın sırası dikkat çeker: önce dil, sonra kalp. Çünkü dilin bozulması kalbi bozar; insan önce söyleyerek kendini inandırır. Peygamber, en çok konuşanın değil, en doğru konuşanın duasını istedi.",
  },
  {
    kaynak: "Buhari, Edeb, 69",
    kaynakKunye: "Buhârî, Edeb 69; Müslim, Birr 105; Abdullah b. Mesud",
    olay:
      "Abdullah b. Mesud'un naklettiği hadiste Peygamber, doğruluğu bir yol olarak çizer: «Doğruluk iyiliğe götürür, iyilik cennete götürür. Kişi doğru söyleye söyleye Allah katında sıddîk diye yazılır.»\n\n" +
      "Ardından tersini de aynı netlikle söyler: «Yalan kötülüğe, kötülük cehenneme götürür.» Yani yalan, tek seferlik bir hata değil; insanı yavaş yavaş kendi alışkanlığına çeken bir yol.",
  },
  {
    kaynak: "Buhari, Edeb, 35",
    kaynakKunye: "Buhârî, Edeb 35; Müslim, Îmân 59; İbn Ömer",
    olay:
      "İbn Ömer anlatıyor: Peygamber, kardeşine «Utanmayı bırak» diye öğüt veren bir adamın yanından geçti ve ona döndü: «Bırak onu; hayâ imandandır.»\n\n" +
      "Yani utangaçlık, düzeltilmesi gereken bir eksiklik değil; imanın kendisinden gelen bir ölçüydü. Adam iyi niyetle öğüt veriyordu, ama öğüdü yanlış yere düşmüştü.",
  },
  {
    kaynak: "Müslim, İman, 59",
    kaynakKunye: "Müslim, Îmân 59; Tirmizî, Birr 47; Ebû Hüreyre",
    olay:
      "Peygamber hayâyı bir bütün olarak tarif etti: «Hayâ hayrın hepsini getirir.» Bir başka rivayette, «Hayâ imandan bir şubedir; hayâsızlık da kötülükten bir şubedir.»\n\n" +
      "Söz, utangaçlığı zayıflık sayan bir topluluğa söylendi. Peygamber tersini söyledi: insanı kötülükten alıkoyan o iç çekingenlik, ahlâkın bekçisidir.",
  },
  {
    kaynak: "Buhari, Edeb, 55",
    kaynakKunye: "Buhârî, Edeb 55; Müslim, Îmân 169; Huzeyfe",
    olay:
      "Huzeyfe'nin naklettiği rivayet sert bir cümleyle gelir: «Söz taşıyan (nemmâm) cennete girmez.»\n\n" +
      "Yani iki kişinin arasını bozmak için laf taşımak, sıradan bir dedikodu değil; cennetin kapısında hesabı sorulacak bir suç. Söz, Medine'de yeni kurulan topluluğun en kırılgan yerini korumak için söylendi: güven.",
  },
  {
    kaynak: "Buhari, Ferâiz, 14",
    kaynakKunye: "Buhârî, Ferâiz 14; Müslim, Îmân 100; Ebû Hüreyre",
    olay:
      "Ebû Hüreyre'nin naklettiği hadis, zina edenin o anda imandan çıktığını söyler: «Zina eden, mümin olarak zina etmez; o an iman ondan ayrılır ve başının üstünde bir gölge gibi durur.»\n\n" +
      "Gölge benzetmesi dikkat çeker: iman gitmez, ama insanın üstünden çekilir; yani amel işlendiği anda kişi kendi korumasının dışına çıkar. Tevbe kapısı ise açık bırakılır.",
  },
  {
    kaynak: "Müslim, Kader, 21",
    kaynakKunye: "Müslim, Kader 21; İbn Abbas; Ebû Hüreyre",
    olay:
      "Peygamber, zinanın yalnız bedenle işlenmediğini anlattı: «Her insana zinasından bir nasip yazılmıştır: gözün zinası bakmaktır, dilin zinası söylemektir; nefis ister ve arzular, cinsel organ bunu ya tasdik eder ya yalanlar.»\n\n" +
      "Yani yasak, son anda başlamaz. Gözün bir bakışı, dilin bir cümlesi, kalbin bir hevesi — hepsi aynı yolun basamaklarıdır.",
  },

  // ═══ KOMŞULUK (geniş havuz) ══════════════════════════════════
  {
    kaynak: "Buhârî, Edeb · Müslim, İmân (sahih)",
    kaynakKunye: "Buhârî, Edeb; Müslim, Îmân",
    olay:
      "Bu rivayet, komşuya eziyetin imanla bağını keser: «Komşusuna eziyet eden cennete girmez.»\n\n" +
      "Eziyet büyük bir saldırı olmak zorunda değil; gürültü, kırıcı bir söz, kapı önüne konan çöp. Cümle, gündelik hayatın en küçük kabalığını cennetin kapısına bağlar.",
  },
  {
    kaynak: "Buhârî, Edeb 6016 · Müslim, İmân 46 (sahih)",
    kaynakKunye: "Buhârî, Edeb; Müslim, Îmân 46; Ebû Hüreyre",
    olay:
      "Peygamber, imanı bir güven ilişkisi olarak tarif etti: «Komşusu, onun kötülüğünden emin olmayan kimse (gerçek) mümin değildir.»\n\n" +
      "Yani iman, yalnız kişinin kendi içinde yaşadığı bir hâl değil; yanındakinin gece rahat uyuyabilmesidir. Komşu, senin elinden ve dilinden emin değilse, senin iman iddian eksik kalmıştır.",
  },
  {
    kaynak: "Müslim, İmân 45 (sahih)",
    kaynakKunye: "Müslim, Îmân 45; Enes b. Mâlik",
    olay:
      "Enes'in naklettiği bu hadis, imanı bir ölçüye bağlar: «Sizden biriniz kendisi için sevdiğini kardeşi için de sevmedikçe (gerçekten) iman etmiş olmaz.»\n\n" +
      "Ölçü, kişinin kendi arzusunu başkasının aynasına tutmasıdır. Yani ahlâk, başkasına yapılmasını istemediğini yapmamakla başlar; Peygamber bunu bir üst basamağa taşıdı: istediğini onun için de iste.",
  },
  {
    kaynak: "Müslim, Zekât 2625 (sahih — meâl)",
    kaynakKunye: "Müslim, Zekât 2050; Ebû Zerr",
    olay:
      "Peygamber, Ebû Zerr'e seslendi: «Ey Ebû Zerr! Yemek pişirdiğin zaman suyunu çoğalt, komşularını da gözet.»\n\n" +
      "Ebû Zerr'in evi Medine'nin dış mahallelerindeydi; etrafında yoksul komşular vardı. Peygamber ona yemeği az yapmasını değil, tenceresini büyütmesini söyledi. Yani cömertlik, artandan vermek değil; baştan hesaba katmaktır.",
  },
  {
    kaynak: "Buhârî, Edeb 6017 · Müslim, Zekât 1030 (sahih)",
    kaynakKunye: "Buhârî, Edeb 6017; Müslim, Zekât 1030; Âişe",
    olay:
      "Hz. Âişe'ye hitaben buyuruldu: «Ey mümin kadınlar! Sizden biri komşusuna bir koyun paçası kadar hediye getirse bile onu küçümsemesin.»\n\n" +
      "Söz, hediyenin değerini değil, verenin gönlünü korumayı emreder. Bir paça, yoksul bir komşunun elinden gelenin en iyisidir; onu küçümsemek, komşuluğu baştan bitirmektir.",
  },
  {
    kaynak: "Buhârî, Mezâlim 20 · Müslim, Musâkât 1609 (sahih)",
    kaynakKunye: "Buhârî, Mezâlim 20; Müslim, Müsâkât 1609; Ebû Hüreyre",
    olay:
      "Peygamber, komşunun hakkını hukuk diliyle korudu: «Sizden biriniz komşusunun duvarına kirişini koymasına engel olmasın.»\n\n" +
      "Yani komşunun evine bitişik duvara bir kiriş dayamak, ondan izin istemeyi gerektirmeyecek kadar küçük bir şey değil; engel olmak da haksızlıktır. Söz, mahalle hayatının paylaşılan duvarlarını hukuken de paylaşılan saydı.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb 5153 (sahih — meâl)",
    kaynakKunye: "Ebû Dâvûd, Edeb 5153; Ebû Hüreyre",
    olay:
      "Bir adam Peygamber'e komşusundan şikâyet etti. Peygamber, «Git, sabret» buyurdu. Adam döndü, bir daha şikâyet etti; cevap yine aynıydı. Üçüncü ya da dördüncü seferde buyurdu: «Git, eşyanı yola çıkar.»\n\n" +
      "Adam eşyasını sokağa taşıdı. İnsanlar toplanıp ne olduğunu sordular, o da komşusundan çektiklerini anlattı. Komşusu bunu duyunca utandı ve gelip barıştı.\n\n" +
      "Hadis, sabrın bir sınırı olduğunu da gösterir: hak aramak ayıp değil, ama önce sabır kapısı denenir.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb 5155 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Edeb 5155; Âişe",
    olay:
      "Hz. Âişe sordu: «Ey Allah'ın Resûlü, iki komşum var; hangisine vereyim?»\n\n" +
      "Cevap: «Kapısı sana daha yakın olana.»\n\n" +
      "Hediye, sadaka ya da ikram paylaştırılırken ölçü, komşunun zenginliği ya da hatırı değil; yakınlığı. Yani hukukun gözü, kapıyı çaldığında ilk duyulacak olandadır.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb 5152 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Edeb 5152; Abdullah b. Amr",
    olay:
      "Abdullah b. Amr'a, kestiği kurbanın etinden Yahudi komşusuna da verip vermediği soruldu. Cevabı, Peygamber'den duyduğu söze dayandırdı: «Cebrâil bana komşu hakkını o kadar tavsiye etti ki, onu mirasçı kılacağını sandım.»\n\n" +
      "Yani komşulukta din ayrılığı bir engel değil. Mahallenin kapı komşusu, hakkı en yakın olandır — kurban payı bile ondan başlar.",
  },
  {
    kaynak: "Buhârî, el-Adabu'l-Müfred 116 (hasan)",
    kaynakKunye: "Buhârî, el-Edebü'l-müfred 116; Sa'd b. Ebî Vakkâs",
    olay:
      "Peygamber, insanın saadetini üç şeye bağladı: «Geniş bir mesken, sâlih bir komşu ve rahat bir binek.»\n\n" +
      "Üçü de gündelik hayatın sessiz konforudur: dar evde sıkışmamak, komşusundan çekinmemek, yola çıkarken sırtı ağrımamak. Hadis, mutluluğu büyük olaylarda değil, bu üç sıradan rahatlıkta arar.",
  },
  {
    kaynak: "Buhârî, el-Adabu'l-Müfred 119 (hasan — meâl)",
    kaynakKunye: "Buhârî, el-Edebü'l-müfred 119; Ebû Hüreyre",
    olay:
      "Peygamber'e bir kadından söz edildi: gece namaz kılıyor, gündüz oruç tutuyor, sadaka veriyor — ama diliyle komşusuna eziyet ediyor.\n\n" +
      "Cevap sertti: «Onda hayır yok; o cehennemliktir.»\n\n" +
      "Yani ibadetler, komşusunu inciten bir dili temize çıkarmaz. Terazi, seccadedeki gayreti görür ama mahalledeki kırgınlığı da görür.",
  },
  {
    kaynak: "Müslim, Birr 42 (sahih — meâl)",
    kaynakKunye: "Müslim, Birr 42; Âişe; Abdullah b. Ömer",
    olay:
      "Peygamber, üç hakkı tek cümlede toplardı: «Kim Allah'a ve ahiret gününe iman ediyorsa komşusuna ikram etsin.» Sonra eklerdi: «Cibril bana komşuyu o kadar tavsiye etti ki, onu mirasçı yapacağımı sandım.»\n\n" +
      "Hz. Âişe bu sözü çok duydu; çünkü Peygamber onu her fırsatta tekrarlıyordu. Tekrar, sözün ağırlığını gösterir: ashâb, komşunun mirastan pay alacağını düşünecek kadar ileri gitti.",
  },
  {
    kaynak: "Müslim, Âdâb 23 (sahih)",
    kaynakKunye: "Müslim, Birr 73; Ebû Hüreyre",
    olay:
      "Peygamber, «Komşusu açken tok yatan (gerçek) mümin değildir» buyurdu.\n\n" +
      "Söz, bir mahallenin gece manzarasını hesaba katar: bir evde lamba yanıp tencere kaynamıyorsa, yanı başındaki evde kimse bir şey yememişse, o mahallenin imanı eksiktir. Yardım, uzaklara gönderilen bir para değil, duvarın öbür yüzüdür.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb 5151 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Edeb 5151; Ebû Hüreyre",
    olay:
      "Aynı ölçü Ebû Dâvûd'da bir başka kapıdan gelir: «Komşusu onun kötülüklerinden emin olmayan, (gerçek) mümin değildir.»\n\n" +
      "Burada ölçü, kişinin kendi niyeti değil; komşusunun hissettiği güven. Yani iyi niyet yetmiyor; karşı tarafın rahat uyuması gerekiyor.",
  },

  // ═══ AİLE ════════════════════════════════════════════════════
  {
    kaynak: "Buhari, Nikâh, 3",
    kaynakKunye: "Buhârî, Nikâh 3; Müslim, Nikâh 1; Abdullah b. Mesud",
    olay:
      "Abdullah b. Mesud anlatıyor: Biz gençken Peygamber bize seslendi: «Ey gençler topluluğu! İçinizden evlenmeye gücü yeten evlensin; gözü ve iffeti en iyi koruyan budur. Gücü yetmeyen oruç tutsun; oruç onun için bir kalkandır.»\n\n" +
      "Söz, evliliği bir yük gibi değil, iffeti koruyan bir kalkan gibi tarif ediyordu; orucu da ikinci kalkan olarak yanına koydu.",
  },
  {
    kaynak: "Buhari, Nikâh, 3 (meâl)",
    kaynakKunye: "Buhârî, Nikâh 3; Müslim, Nikâh 1",
    olay:
      "Aynı hadisin bir başka lafzı, evliliği doğrudan sünnet olarak adlandırır: «Evlilik benim sünnetimdir; benim sünnetimi seven onu yerine getirsin.»\n\n" +
      "Yani evlilik, kişisel bir tercih olmaktan çok, Peygamber'in kurduğu bir yolu sürdürmektir. Gücü yetmeyene ise oruç tavsiye edildi: acele etme, kendini koru.",
  },
  {
    kaynak: "Tirmizi, Menâkıb, 63",
    kaynakKunye: "Tirmizî, Menâkıb 63; Menâkıbü'l-ensâr; Âişe",
    olay:
      "Hz. Âişe'ye soruldu: «Peygamber evde ne yapardı?» Cevabı, en hayırlı insanın evde nasıl davrandığını gösterdi: «İnsanların en hayırlısı, ailesine karşı en hayırlı olanıdır.»\n\n" +
      "Peygamber evinde hizmetçisinden fazla iş görür, ayakkabısını tamir eder, koyununu sağardı. Yani ahlâk, camide başlayıp evin kapısında biten bir gösteri değil; en mahrem yerde sınanan bir ölçüdür.",
  },
  {
    kaynak: "Tirmizi, Menâkıb, 63",
    kaynakKunye: "Tirmizî, Menâkıb 63; aile hukuku",
    olay:
      "Aynı hadisin devamı, ölçüyü kendisiyle başlatır: «Sizin en hayırlınız, hanımına karşı en hayırlı olanınızdır; ben de aileme karşı sizin en hayırlınızım.»\n\n" +
      "Peygamber kendini ölçünün ortasına koydu: evde şefkat göstermeyen bir erkek, dışarıda ne kadar namaz kılarsa kılsın bu sınavı geçmiş sayılmaz.",
  },
  {
    kaynak: "Buhari, Mevâkît, 11",
    kaynakKunye: "Buhârî, Mevâkît 11; Müslim, Zekât 56; Ebû Mesud el-Ensârî",
    olay:
      "Ebû Mesud el-Ensârî anlatıyor: Peygamber, «Bir Müslüman, ailesine harcadığı şeyden dolayı sevap alır» buyurdu.\n\n" +
      "Ashâb şaşırdı: «Ya Resûlallah, birimizin yemeğini yemesi de mi?» Peygamber cevap verdi: «Helâl yoldan kazandığından yedirdiği her lokma, ona sadaka sayılır.»\n\n" +
      "Yani infak, camiye uzatılan ele mahsus değil; eve taşınan ekmeğe de yazılıyor.",
  },
  {
    kaynak: "Buhari, Edeb, 71",
    kaynakKunye: "Buhârî, Edeb 71; Müslim, Birr 160; Ebû Hüreyre",
    olay:
      "Peygamber, «İnsanlar madenler gibidir» buyurdu: altın ve gümüş madeni gibi, kimi toprağın altında değerli, kimi taş.\n\n" +
      "Söz, Câhiliye'nin soy üstünlüğü iddiasına karşı söylendi. Yani insanın değeri kabilesinden, renginden ya da malından gelmiyor; mayasındaki ahlâk ve takvâdan geliyor. Aynı maden, işlenince değerini bulur.",
  },
  {
    kaynak: "Buhari, Megâzî, 30 (meâl)",
    kaynakKunye: "Buhârî, Cum'a 11; Müslim, İmâre 20; İbn Ömer",
    olay:
      "Peygamber hutbede sordu: «Hepiniz çobansınız ve hepiniz sürünüzden sorumlusunuz.»\n\n" +
      "Sonra sıraladı: «Yönetici bir çobandır; erkek ailesinin çobanıdır; kadın kocasının evinin ve çocuklarının çobanıdır; hizmetçi efendisinin malının çobanıdır.»\n\n" +
      "Yani sorumluluk, mevkiyle değil, elinin altındakilerle ölçülür. Kimin himayesinde biri varsa, o kişi ondan hesap verecek.",
  },
  {
    kaynak: "Buhari, Nikâh, 5 (meâl)",
    kaynakKunye: "Buhârî, Nikâh 5; Müslim, Radâ 62; Abdullah b. Amr",
    olay:
      "Peygamber, eşler arasındaki ilişkiyi bir ahlâk ölçüsüne bağladı: «Sizden biriniz kendisi için sevdiğini eşi için de sevsin; kendine reva görmediğini ona da reva görmesin.»\n\n" +
      "Yani ev, kişinin kendi rahatını tek başına kurduğu bir yer değil; iki kişinin aynı ölçüyü paylaştığı bir yer. Ahlâk, dışarıda nazik olup evde sertleşmeyi reddeder.",
  },
  {
    kaynak: "Müslim, Zikir, 26",
    kaynakKunye: "Müslim, Zikir 38; Ebû Hüreyre",
    olay:
      "Ebû Hüreyre'nin naklettiği bu hadis, dünyada yapılan küçük bir iyiliği kıyametin hesabına bağlar: «Kim bir müminin dünya sıkıntısından birini giderirse, Allah da onun kıyamet günündeki sıkıntılarından birini giderir.»\n\n" +
      "Aynı bâbda sıralama devam eder: kim bir işi kolaylaştırırsa, kim bir ayıbı örterse… Yani kıyamette örtülmek isteyen, dünyada başkasının ayıbını örtsün.",
  },
  {
    kaynak: "Müslim, Zikir, 26 (meâl)",
    kaynakKunye: "Müslim, Zikir 38; aile boyutu",
    olay:
      "Aynı hadisin bir başka rivayeti, giderilen sıkıntının karşılığını aileye kadar genişletir: Allah, o kulun ailesini de korur, sıkıntısını giderir.\n\n" +
      "Yani bir Müslümanın başkasına uzattığı yardım, yalnız karşı tarafa kalmaz; kendi evine de döner. İyilik, verenin arkasında bir koruma bırakır.",
  },
  {
    kaynak: "İbn Mâce, Edeb, 5 (meâl)",
    kaynakKunye: "İbn Mâce, Edeb 5; Ahmed b. Hanbel, Müsned; Amr b. Şuayb",
    olay:
      "Hadis, çocuğa karşı üç borcu sıralar: güzel bir isim, edep ve eğitim.\n\n" +
      "İsim, çocuğun ilk kimliğidir; edep, toplum içinde nasıl duracağıdır; eğitim ise neyi bilip neye inanacağı. Üçü de çocuğun kendi seçimi değil, babasının ona bıraktığı mirastır.",
  },
  {
    kaynak: "Ebu Davud, Salât, 26",
    kaynakKunye: "Ebû Dâvûd, Salât 26; Tirmizî, Salât; Amr b. Şuayb",
    olay:
      "Peygamber, çocuğun namazla tanışmasını bir yaş sırasına bağladı: yedi yaşında öğretin, on yaşında kılmasını gözetin, yataklarını ayırın.\n\n" +
      "Sıra tesadüfi değil: önce öğretilir, sonra birlikte kılınır, sonra sorumluluk devredilir. Yani çocuk, bir anda emir alan değil, yıllar içinde alışan biridir.",
  },
  {
    kaynak: "Tirmizi, Birr, 2 (meâl)",
    kaynakKunye: "Tirmizî, Birr 2; Hz. Ali rivayeti",
    olay:
      "Bu rivayet, babadan çocuğa kalan en değerli mirası tarif eder: mal değil, edep ve ilim.\n\n" +
      "Miras paylaşılınca biter; edep ise çocuğun ömrü boyunca onunla yürür ve torunlarına geçer. Hadis, babanın hesabını malın çokluğundan değil, çocuğun ahlâkından sorar.",
  },
  {
    kaynak: "Buhari, Edeb, 6 (meâl)",
    kaynakKunye: "Buhârî, Edeb 6; Müslim, Birr 147; Enes b. Mâlik",
    olay:
      "Peygamber, iki kızını büyütüp yetiştiren babayı cennetle müjdeledi: «Kimin iki kızı olur da onları güzelce yetiştirirse, o ikisi kıyamette ona siper olur.»\n\n" +
      "Câhiliye'nin kız çocuğu utanç saydığı bir toplumda söylenmiş bir sözdür. Peygamber, kızı olan babayı cezalandırmak şöyle dursun, ona cennette siper vaat etti.",
  },
  {
    kaynak: "Buhari, Edeb, 98",
    kaynakKunye: "Buhârî, Edeb 98; Müslim, Birr 23; Enes b. Mâlik",
    olay:
      "Peygamber, iki Müslümanın arasının üç günden fazla bozuk kalmasını yasakladı: «Bir Müslümanın, kardeşini üç günden fazla terk etmesi helâl değildir.»\n\n" +
      "Çözüm de gösterildi: «Hayırlısı, selam verip başlayandır.» Yani barışmak, haklı olanın değil, gönlü büyük olanın işi. Üç gün, öfkenin soğumasına tanınan süredir; dördüncü gün artık inat sayılır.",
  },
  {
    kaynak: "Buhari, İman, 7",
    kaynakKunye: "Buhârî, Îmân 7; Müslim, Îmân 71; Enes b. Mâlik",
    olay:
      "Enes'in naklettiği bu hadis, imanı bir aynaya çevirir: «Sizden biriniz kendisi için sevdiğini kardeşi için de sevmedikçe iman etmiş olmaz.»\n\n" +
      "Yani ölçü, kişinin kendi arzusudur: kendine istediğin iyiliği komşuna da iste, kendine reva görmediğini ona da görme. Ahlâk burada soyut bir ilke değil, her günkü bir hesap olur.",
  },
  {
    kaynak: "Buhari, İstitâbe, 4",
    kaynakKunye: "Buhârî, Merdâ; Müslim, Birr 45–47",
    olay:
      "Hadis, imtihanı sevginin işareti yapar: Allah bir kulunu severse onu sınar; kul sabrederse mükâfatını bulur.\n\n" +
      "Yani dert, Allah'ın unutması değil; hatırlamasıdır. Söz, hastalık ve kayıp haberleriyle sarsılan Medine'de söylendi; ashâb, başına geleni bir ceza değil bir yakınlık olarak okumayı öğrendi.",
  },
  {
    kaynak: "Müslim, Zikir, 10 (meâl)",
    kaynakKunye: "Müslim, Zühd 3; Ebû Hüreyre",
    olay:
      "Peygamber, dünyanın mümin için bir zindan, kâfir için bir cennet olduğunu söyledi.\n\n" +
      "Zindan benzetmesi, dünyanın kötü olduğunu değil, müminin burada rahat etmek için değil hazırlanmak için bulunduğunu anlatır. Mahpus, duvarın ardındaki özgürlüğü bekler; mümin de ölümle açılacak kapıyı bekler.",
  },
  {
    kaynak: "Tirmizi, Zühd, 33 (meâl)",
    kaynakKunye: "Tirmizî, Zühd 33; Ömer b. Hattâb; Abdullah b. Ömer",
    olay:
      "Peygamber, rızık endişesine karşı kuşları örnek gösterdi: «Sabah karnı aç çıkar, akşam karnı tok döner.»\n\n" +
      "Kuş, yarını için ambar doldurmaz; ama bu boş boş oturmak değildir — sabahleyin çıkar, arar, bulur. Hadis, tevekkülü tembellik olarak değil, çalışmanın üstündeki güven olarak tarif eder.",
  },
  {
    kaynak: "Müslim, Müsâfirîn, 139 (meâl)",
    kaynakKunye: "Müslim, Müsâfirîn 139; Ebû Hüreyre",
    olay:
      "Peygamber, gece kalkan için bir müjde verdi: gece namazı günahları temizler, sabah vakti ise duânın kabul saatidir.\n\n" +
      "Yani gecenin ortasında kalkan, sadece bir ibadet yapmış olmaz; günün geri kalanını da temizlenmiş olarak karşılar. Söz, geceleri mescitte nöbet tutan ashâbın alışkanlığına denk düşer.",
  },
  {
    kaynak: "Buhari, Rikâk, 1",
    kaynakKunye: "Buhârî, Rikâk 1; İbn Abbas",
    olay:
      "İbn Abbas naklediyor: Peygamber, «İki nimet vardır ki insanların çoğu onlarda aldanır: sıhhat ve boş vakit» buyurdu.\n\n" +
      "İkisi de eldeyken değersiz görünür; elden çıkınca yerine konmaz. Hadis, rikâk (kalbi yumuşatan) bâbının ilk sözü olarak seçildi: muhasebe, kaybedilene değil, hâlâ elde olana bakarak başlar.",
  },
  {
    kaynak: "Buhari, Fedâilü'l-Kur'ân, 21",
    kaynakKunye: "Buhârî, Fedâilü'l-Kur'ân 21; Osman b. Affân",
    olay:
      "Peygamber, «Sizin en hayırlınız Kur'an'ı öğrenen ve öğretendir» buyurdu.\n\n" +
      "Söz, öğrenmeyi tek başına bir üstünlük saymaz; öğretmeyi de şart koşar. Yani ilim, kendisinde kaldığı sürece değerli değil; aktarıldıkça çoğalan bir emanettir.",
  },
  {
    kaynak: "Müslim, Salât, 202 (meâl)",
    kaynakKunye: "Müslim, Müsâfirîn 252; Ebû Ümâme",
    olay:
      "Peygamber, Kur'an okuyanın kıyamette yalnız kalmayacağını söyledi: «Kur'an'ı okuyun; o, kıyamet günü sahibine şefaatçi olarak gelir.»\n\n" +
      "Şefaatçi benzetmesi dikkat çeker: kitap, sahibini tanıyacak; tanıdığı için de onun adına konuşacak. Yani okumak, ahirette seni tanıyan bir ses bırakmaktır.",
  },
  {
    kaynak: "Buhari, Tevhid, 58",
    kaynakKunye: "Buhârî, Tevhid 58; Müslim, Zikir 31; Ebû Hüreyre",
    olay:
      "Peygamber iki cümleyi tarif etti: «Sübhânallâhi ve bihamdihî, Sübhânallâhi'l-azîm.» Sonra ekledi: «Söylemesi dile hafif, terazide ağır, Rahmân'a sevimli iki kelime.»\n\n" +
      "Yani zikir, çok konuşmak değil; az sözle çok ağırlık taşımak. Dilin en kolay işi, terazinin en ağır yükünü oluşturdu.",
  },
  {
    kaynak: "Müslim, Zikir, 37",
    kaynakKunye: "Müslim, Zikir 38; Ebû Hüreyre; Ebû Saîd el-Hudrî",
    olay:
      "Peygamber, bir evde ya da mescitte Allah'ı anmak için toplananları anlattı: melekler onları kuşatır, rahmet üzerlerini kaplar, huzur iner ve Allah onları kendi katında anar.\n\n" +
      "Ashâb sordu: «Bunlar dünyada birbirini görmeyenler mi?» Peygamber, asıl müjdenin kıyamette olduğunu söyledi. Yani zikir halkası, dünyada kurulan bir yakınlık; ahirette karşılaşacak bir topluluk.",
  },
  {
    kaynak: "Tirmizi, Daavât, 7 (meâl)",
    kaynakKunye: "Tirmizî, Daavât 7; Abdullah b. Amr",
    olay:
      "Hadis, tevhid kelimesini bir koruma olarak tarif eder: «Lâ ilâhe illallah'ı çok söyleyin.»\n\n" +
      "Çünkü bu cümle, insanın hayatındaki bütün bağlılıkların üstüne çekilen bir çizgidir. Onu dilde tutan, kalbini de o çizginin içinde tutar. Hadis, sözün tekrarıyla kalbin hizasına gelmesini ister.",
  },
  {
    kaynak: "Müslim, Zikir, 72",
    kaynakKunye: "Müslim, Zikir 72–73; Amr b. Abese; İbn Mesud",
    olay:
      "Peygamber'in dualarından biri şuydu: «Allah'ım! Senden hidayeti, takvâyı, iffeti ve gönül zenginliğini isterim.»\n\n" +
      "Dört istek, dört yönü kapsar: yol, koruma, namus ve gönül tokluğu. Sonuncusu en dikkat çekici olanı: malın çokluğu değil, azla yetinen bir kalp. Yani zenginlik, isteyen bir gönülde değil, susan bir gönüldedir.",
  },
  {
    kaynak: "Tirmizi, Birr, 40 (meâl)",
    kaynakKunye: "Tirmizî, Birr 40; Câbir b. Abdullah",
    olay:
      "Peygamber cömertliği bir mesafe olarak tarif etti: «Cömertlik, Allah'a yakınlıktır; cimrilik ise O'ndan uzaklıktır.»\n\n" +
      "Yani vermek, yalnız bir mal hareketi değil; kişinin kendi konumunu belirleyen bir yön seçimidir. Cimri, malı elinde tutarken kendini uzaklaştırır; cömert, eksiltirken yakınlaşır.",
  },
  {
    kaynak: "Tirmizi, Zekât, 28",
    kaynakKunye: "Tirmizî, Zekât 28; Ebû Zerr",
    olay:
      "Peygamber, sadakanın tanımını genişletti: «Kardeşine gülümsemen sadakadır.» Sonra sıraladı: «İyiliği emredip kötülükten alıkoyman sadakadır; yoldan insanlara zarar veren bir şeyi kaldırman sadakadır.»\n\n" +
      "Yani sadaka, parayla başlamaz. Yüz, söz, el — hepsi birer infak aracıdır. Vermek için zengin olmak gerekmez.",
  },
  {
    kaynak: "Tirmizi, Edeb, 15",
    kaynakKunye: "Tirmizî, Birr 16; Abdullah b. Amr",
    olay:
      "Peygamber, «Merhametlilere Rahmân merhamet eder» buyurdu; sonra sınırı gösterdi: «Yerdekilere merhamet edin ki göktekiler de size merhamet etsin.»\n\n" +
      "Yani merhamet, sadece insana değil, yeryüzündeki canlıya yönelir. Gökteki rahmetin kapısı, yerde bir karıncaya gösterilen yumuşaklıktan geçer.",
  },
  {
    kaynak: "Beyhaki, Şuab, 8/386 (meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 8/386; Ebû Hüreyre",
    olay:
      "Peygamber, «Yerdeki canlılar Allah'ın âilesidir» buyurdu; yani yeryüzünde ne varsa Allah'ın himayesinde sayılır.\n\n" +
      "Söz, insanın canlılar üzerinde keyfî tasarrufunu sınırlar: bir hayvana iyi davranan, Allah'ın âilesine iyi davranmış olur. Merhamet, büyük davalara değil, gündelik muameleye bağlanmıştır.",
  },
  {
    kaynak: "İbn Mâce, Zühd, 30 (meâl)",
    kaynakKunye: "İbn Mâce, Zühd 30; Abdullah b. Mesud",
    olay:
      "Peygamber, «Tevbe eden, günah işlememiş gibidir» buyurdu.\n\n" +
      "Cümle bir silme işleminden söz eder: tevbe, günahın izini değil, kendisini yok sayar. Bu yüzden ashâb, günaha düştükten sonra kendini toparlamanın yolunu bu sözde buldu — umutsuzluk, tevbenin tam karşısında duran yanlış cevaptı.",
  },
  {
    kaynak: "Müslim, Zühd, 39 (meâl)",
    kaynakKunye: "Müslim, Tevbe 1; Ebû Hüreyre",
    olay:
      "Peygamber, tevbenin bir yemekten daha titiz bir iş olduğunu söyledi: insan yemeğinden bir lokma çıkarıp temizler, çıkan lokmaya özenle bakar.\n\n" +
      "Allah da kulunun tevbesine bu özenden daha çok itina eder; tevbeyi geri çevirmez. Benzetme dikkat çeker: insan kendi canını bu kadar önemsiyorsa, Allah'ın onun tevbesine gösterdiği özen bundan büyüktür.",
  },
  {
    kaynak: "İbn Mâce, Zühd, 29 (meâl)",
    kaynakKunye: "İbn Mâce, Zühd 29; Ebû Hüreyre",
    olay:
      "Peygamber, kalbin nasıl karardığını bir leke benzetmesiyle anlattı: kul bir günah işlediğinde kalbinde siyah bir nokta belirir. Tevbe edip istiğfar ederse nokta silinir, parlar; günaha dönmeye devam ederse noktalar çoğalır ve kalp baştan sona kararır.\n\n" +
      "Hadis, günahı tek bir olay değil, kalpte birikimi olan bir süreç olarak tarif eder; tevbe de bu yüzden geciktirilmez.",
  },
  {
    kaynak: "Tirmizi, Daavât, 1 (meâl)",
    kaynakKunye: "Tirmizî, Daavât 1; Nu'mân b. Beşîr",
    olay:
      "Peygamber, «Dua ibadetin özüdür» buyurdu; bir başka rivayette «Dua ibadetin ta kendisidir.»\n\n" +
      "Yani dua, ibadetin kenarına iliştirilmiş bir süs değil; ibadetin içindeki çekirdek. İbadet, kulun kendi gücüne güvenmeyi bırakıp Allah'a yönelmesidir — duâ da tam olarak bu yönelmektir.",
  },
  {
    kaynak: "Tirmizi, Daavât, 77; İbn Mâce, Duâ, 8",
    kaynakKunye: "Tirmizî, Daavât 77; Ebû Hüreyre",
    olay:
      "Peygamber, reddedilmeyecek üç duâyı saydı: oruçlunun iftar anındaki duası, adil yöneticinin duası ve mazlumun duası.\n\n" +
      "Üçünde de ortak nokta, kulun kendini savunacak bir gücü kalmadığı zamandır: aç olan, âmir karşısında haksızlığa uğrayan, gücü elinden alınmış olan. Hadis, duânın kabulünü tam bu çaresizlikle eşleştirir.",
  },
  {
    kaynak: "Beyhaki, Şuab, 7/151 (meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 7/151",
    olay:
      "Beyhakî'nin topladığı bu rivayet duâyı «müminin silahı» olarak adlandırır.\n\n" +
      "Silah benzetmesi, duânın pasif bir bekleme değil, aktif bir savunma olduğunu söyler. Mümin, karşısındaki güç ne olursa olsun, elinde kalan son imkânı da yere bırakmaz.",
  },
  {
    kaynak: "Buhari, Edeb, 24 (meâl)",
    kaynakKunye: "Buhârî, Edeb 24; Müslim, Zühd 42; Sehl b. Sa'd",
    olay:
      "Peygamber, işaret ve orta parmağını yan yana getirip buyurdu: «Ben ve yetimin bakıcısı cennette şöyle beraberiz.»\n\n" +
      "İki parmak arasındaki boşluk kadar bir mesafe. Yani yetim büyütmek, cennette peygambere yakın durmak demek. Söz, yetimi kendi çocuklarıyla aynı sofraya oturtan evi tarif eder.",
  },
  {
    kaynak: "Beyhaki, Şuab (meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân; yetim bâbı",
    olay:
      "Rivayet, yetimin başını okşayan eli ödüllendirir: değdiği her saç teli için sevap yazılır.\n\n" +
      "Yani şefkat, büyük bir yardım olmak zorunda değil; bir elin başa konması yeter. Yetimin babası yoktur; onun yerine konan el, hem sevap hem güven bırakır.",
  },
  {
    kaynak: "Müslim, İlim, 16",
    kaynakKunye: "Müslim, İlim 16; Ebû Hüreyre",
    olay:
      "Peygamber, bir hayra vesile olanın o hayrı işleyen kadar sevap alacağını söyledi.\n\n" +
      "Söz, yapamayanın kapısını kapatmaz: elinden gelmiyorsa yol gösterir, gücü yetmiyorsa teşvik eder. Yani iyilik, yalnız yapanın defterine yazılmaz; ona vesile olanın defterine de aynı satır düşer.",
  },
  {
    kaynak: "İbn Mâce, Adâb, 6; Nesâî, Cenâiz, 1 (meâl)",
    kaynakKunye: "İbn Mâce, Edeb 6; Nesâî, Cenâiz; Muâviye b. Câhime",
    olay:
      "Muâviye b. Câhime Peygamber'e geldi ve «Yâ Resûlallah, kime iyilik edeyim?» diye sordu. Cevap «Annene» oldu. «Sonra kime?» — «Annene.» — «Sonra kime?» — «Annene.» — «Sonra kime?» — «Babana.»\n\n" +
      "Aynı bâbda gelen bir başka rivayet bu sırayı tek cümleye sığdırır: «Cennet annelerin ayakları altındadır.» Yani cennet, dört kez tekrarlanan bir ismin altına serilmiştir.",
  },
  {
    kaynak: "Müslim, Zikir, 28",
    kaynakKunye: "Müslim, Zikir 28; Ebû Hüreyre",
    olay:
      "Peygamber, günde yüz defa «Sübhânallâhi ve bihamdihî» diyenin günahlarının deniz köpüğü kadar olsa bile bağışlanacağını söyledi.\n\n" +
      "Deniz köpüğü benzetmesi ölçüsüzlüğü anlatır: sayısız, hafif, her dalgada yeniden oluşan. Yani zikir, günahın çokluğuna karşı konulan bir denge; az bir söz, çok bir yükü kaldırır.",
  },
  {
    kaynak: "Buhari, İman, 5",
    kaynakKunye: "Buhârî, Îmân 4–5; Müslim, Îmân 64",
    olay:
      "Peygamber'e «Müslüman kimdir?» diye soruldu. Cevap, imanı bir güvenlik tanımına çevirdi: «Dilinden ve elinden Müslümanların güvende olduğu kimse.»\n\n" +
      "Yani Müslümanlık, kişinin kendi iç dünyasında kalan bir iddia değil; çevresine bıraktığı emniyet. Kimse onun dilinden ve elinden korkmuyorsa, o kişi tanımı doldurmuş sayılır.",
  },
  {
    kaynak: "İbn Mâce, Ahkâm, 17 (meâl)",
    kaynakKunye: "İbn Mâce, Ahkâm 17; İbn Abbas; Ubâde b. Sâmit",
    olay:
      "Peygamber, «Zarar vermek yoktur, zarara zararla karşılık vermek de yoktur» buyurdu.\n\n" +
      "Birinci cümle saldırganı durdurur, ikincisi savunma adı altında aynı kötülüğü tekrarlayanı. Yani haksızlığa uğrayan, haksızlık yapma hakkını kazanmaz; hakkını arar ama ölçüyü kaçırmaz. İslâm hukukunun en temel kaidelerinden biri bu cümleden çıkarıldı.",
  },
  {
    kaynak: "Buhari, Edeb, 31; Müslim, Zühd, 15",
    kaynakKunye: "Buhârî, Edeb 31; Müslim, Zühd 15; Ebû Hüreyre",
    olay:
      "Peygamber, dili üç hâlden birine bağladı: hayır söylemek, susmak ya da — bunları yapmıyorsa — iman iddiasını gözden geçirmek.\n\n" +
      "«Kim Allah'a ve ahiret gününe inanıyorsa ya hayır konuşsun ya da sussun.» Yani boş söz, yasak sözün küçük kardeşidir; ikisinin arasındaki tek güvenli yer susmaktır.",
  },
  {
    kaynak: "Nesai, Zekât, 67 (meâl)",
    kaynakKunye: "Nesâî, Zekât 67; Ebû Hüreyre",
    olay:
      "Hadis, kardeşinin üstüne çıkmaya çalışmayı yasaklar: malıyla, mevkiiyle ya da ilmiyle üstün görünmeye uğraşmak; ona hased etmek.\n\n" +
      "Gerekçe de verilir: «Allah kimine daha çok verir.» Yani paylaşım farklı, sahibi aynıdır. Kardeşinin elindekine göz dikmek, verenin taksimine itiraz etmek olur.",
  },
  {
    kaynak: "Tirmizi, Kıyâmet, 46 (meâl)",
    kaynakKunye: "Tirmizî, Kıyâmet 46; Ebû Hüreyre",
    olay:
      "Hadis, mümini tarif ederken sıra dışı bir ödül verir: kimseye zararı dokunmayan mümin, cennetin en güzel köşelerine yerleştirilir.\n\n" +
      "Yani cennetin yüksek makamı, büyük kahramanlıklara değil, kimseye kötülük etmemiş bir ömre bağlanır. Söz, sıradan iyi insanın önünü açar.",
  },
  {
    kaynak: "Buhari, Tahâre, 116 (meâl)",
    kaynakKunye: "Buhârî, Tahâre; istihâre bâbı",
    olay:
      "Hadis, hayırdan mahrum kalmayı istihâreyi terk etmeye bağlar: bir işe girişmeden önce Allah'tan hayır dilemeyen, kendi aklına güvenip yola çıkan kişi, hayrın kapısını kendi eliyle kapatır.\n\n" +
      "Söz, karar vermeyi bir danışma ve duâ işi olarak tarif eder: insan istişare eder, sonra hükmü Allah'a bırakır.",
  },
  {
    kaynak: "Müslim, Zikir, 3 (meâl)",
    kaynakKunye: "Müslim, Zikir 3; Ebû Hüreyre",
    olay:
      "Peygamber, kalbin paslandığını söyledi ve ilacını gösterdi: zikir ve Kur'an okumak.\n\n" +
      "Pas benzetmesi, kalbin bozulmasını ani bir düşüş değil, yavaş bir örtülme olarak anlatır. Demir havayla temas ettikçe nasıl paslanırsa, kalp de gafletle temas ettikçe örtülür; cilası zikirdir.",
  },
  {
    kaynak: "Ahmed b. Hanbel, Müsned, 22973 (meâl)",
    kaynakKunye: "Ahmed b. Hanbel, Müsned; Nu'mân b. Beşîr",
    olay:
      "Peygamber, müminleri bir bedene benzetti: bedenin bir yeri ağrıdığında geri kalanı uykusuz kalır, ateşlenir.\n\n" +
      "Müminler de böyledir: birinin derdi hepsinin derdidir. Söz, kardeşliği bir duygu değil, ortak bir sinir sistemi olarak tarif eder.",
  },
  {
    kaynak: "Taberani, el-Mu'cemü'l-Evsat, 5777",
    kaynakKunye: "Taberânî, el-Mu'cemü'l-evsat 5777; Câbir",
    olay:
      "Hadis, insanların en hayırlısını fayda ölçüsüne bağlar: «İnsanların en hayırlısı, insanlara en çok faydalı olandır.»\n\n" +
      "Yani üstünlük, kimsenin görmediği bir ibadette değil, başkasının işine yarayan elde. Fayda küçük olabilir; ölçü, faydanın kime dokunduğudur.",
  },
  {
    kaynak: "Müslim, Zekât, 25 (meâl)",
    kaynakKunye: "Müslim, Zekât 25; Ebû Hüreyre",
    olay:
      "Peygamber, iyiliğe ön ayak olanın sevabını o iyiliği işleyenin sevabına eşitledi.\n\n" +
      "Yani bir hayrı başlatmak, onu yapmak kadar değerli. Söz, imkânı olmayanı teselli eder: sen yapamıyorsan, yapanın elinden tut; deftere aynı satır yazılır.",
  },
  {
    kaynak: "Beyhaki, Şuab, 2/358 (meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 2/358",
    olay:
      "Bu rivayet namazı iki benzetmeyle anlatır: müminin miracı ve dinin direği.\n\n" +
      "Miraç, yükseliş demektir: kulun yerinden yukarı çıkması. Direk ise ayakta tutan şeydir: direk giderse çadır çöker. Yani namaz hem yükselten hem ayakta tutan bir ibadettir.",
  },
  {
    kaynak: "Tirmizi, Salât, 41 (meâl)",
    kaynakKunye: "Tirmizî, Salât 413; Ebû Hüreyre",
    olay:
      "Peygamber, kıyamette ilk sorulacak amelin namaz olduğunu söyledi: «Namazı düzgünse kurtulur, bozuksa kaybeder.»\n\n" +
      "Sıralamanın anlamı şudur: namaz, diğer amellerin aynasıdır. Vaktini gözetmeyen bir insanın diğer sorumluluklarını da gözetmesi beklenmez; ilk hesap, en temel alışkanlıktan başlar.",
  },
  {
    kaynak: "Buhari, Ezan, 30",
    kaynakKunye: "Buhârî, Ezan 30; Müslim, Mesâcid 249; Abdullah b. Ömer",
    olay:
      "Peygamber, cemaatle kılınan namazın tek başına kılmandan yirmi yedi derece faziletli olduğunu söyledi.\n\n" +
      "Yirmi yedi, ölçülemeyecek kadar büyük bir fark değil; tam tersine, hesabı yapılabilir bir fark. Yani cemaat, kişisel ibadetin önüne geçen bir topluluk işidir — mahalle, aynı safta durdukça bir arada kalır.",
  },
  {
    kaynak: "Buhari, Savm, 6",
    kaynakKunye: "Buhârî, Savm 6; Müslim, Müsâfirîn 175; Ebû Hüreyre",
    olay:
      "Peygamber, Ramazan'ı bir fırsat olarak ilan etti: «Kim inanarak ve sevabını Allah'tan umarak Ramazan orucunu tutarsa, geçmiş günahları bağışlanır.»\n\n" +
      "Şart iki tanedir: inanmak ve karşılığı Allah'tan beklemek. Yani tutulan oruç, bir alışkanlık ya da toplum baskısı değil; bilinçli bir yöneliş olmalı.",
  },
  {
    kaynak: "Buhari, Savm, 2 (meâl)",
    kaynakKunye: "Buhârî, Savm 2; Müslim, Sıyâm 160; Ebû Hüreyre",
    olay:
      "Peygamber orucu bir kalkan olarak tarif etti: «Biriniz oruçluysa kötü söz söylemesin, kavga etmesin; biri kendisine sataşırsa 'Ben oruçluyum' desin.»\n\n" +
      "Kalkan, saldırıyı durdurmaz; saldırganı kendi öfkesiyle baş başa bırakır. Yani oruç, ağzı tutmanın yanında dili ve eli de tutan bir kalkandır.",
  },
  {
    kaynak: "Müslim, Zikir, 38",
    kaynakKunye: "Müslim, Zikir 38; Ebû Hüreyre",
    olay:
      "Peygamber, ilim için yola çıkanı müjdeledi: «Kim ilim aramak için bir yol tutarsa, Allah ona cennete giden yolu kolaylaştırır.»\n\n" +
      "İki yol birbirine bağlanır: ayağın yürüdüğü sokak ve kalbin yürüdüğü yol. Yani ilim talebesi, daha yolda iken varış yerini kazanmış sayılır.",
  },
  {
    kaynak: "Tirmizi, İlim, 19 (meâl)",
    kaynakKunye: "Tirmizî, İlim 19",
    olay:
      "Hadis, ilmi «müminin kaybolan malı» olarak adlandırır: nerede bulursa alır.\n\n" +
      "Benzetme, ilmin kaynağına değil, sahibine bakar: hikmet kimin ağzından çıkarsa çıksın, mümin onu kendi malı bilir. Yani öğrenmek, bir aidiyet meselesi değil, bir arayış meselesidir.",
  },
  {
    kaynak: "Gafir 60 (meâl) — Kâinat'tan naklen",
    kaynakKunye: "Gâfir sûresi 60. âyet",
    olay:
      "«Rabbiniz buyurdu: Bana duâ edin, size cevap vereyim.»\n\n" +
      "Âyetin devamı, duâyı terk edenin hâlini de söyler: büyüklük taslayanlar, ibadetten kaçınanlar. Yani duâ, bir ihtiyaç listesi değil; kulun kendi yerini bilmesidir. İstemeyen, aslında ihtiyacı olmadığını sanandır.",
  },
  {
    kaynak: "Ahmed b. Hanbel, Müsned, 11140 (meâl)",
    kaynakKunye: "Ahmed b. Hanbel, Müsned 11140; Ebû Saîd",
    olay:
      "Hadis, duânın boşa gitmediğini üç ihtimalle açıklar: Allah ya istenileni verir, ya yerine daha hayırlısını verir, ya da o duâ kadar bir belâyı kuldan def eder.\n\n" +
      "Yani cevap gelmediği sanılan duâ, aslında başka bir kapıdan karşılık bulmuştur. Kul, hesabı yalnız istediği şeyin gerçekleşmesine bağlarsa yanılır.",
  },
  {
    kaynak: "Tirmizi, Daavât, 106 (meâl)",
    kaynakKunye: "Tirmizî, Daavât 106; Abdullah b. Mesud",
    olay:
      "Peygamber, «Günahını tanıyıp tevbe eden, günahı yokmuş gibidir» buyurdu.\n\n" +
      "Şart, günahı tanımaktır: inkâr eden tevbe edemez. Yani tevbenin ilk adımı savunmayı bırakmaktır. Kul, kendini aklamaya çalıştıkça kapı kapalı kalır; suçunu kabul ettiği anda açılır.",
  },
  {
    kaynak: "Müslim, Tövbe, 4 (meâl)",
    kaynakKunye: "Müslim, Tevbe 3; Abdullah b. Mesud",
    olay:
      "Peygamber, tevbenin büyüklüğünü bir çöl benzetmesiyle anlattı: bir adam çölde devesini kaybeder; azığı ve suyu da ondadır, ölümü bekler. Sonra deveyi bulur ve sevincinden «Allah'ım, sen benim kulumsun, ben senin Rabbinim» diyecek kadar şaşırır — dil sürçer.\n\n" +
      "Peygamber buyurdu: «Allah, kulunun tevbesine bu adamın sevincinden daha çok sevinir.» Karşılaştırma çarpıcıdır: kaybedeni bulmanın sevinci, affetmenin sevincinden küçüktür.",
  },
  {
    kaynak: "Buhari, Edeb, 80",
    kaynakKunye: "Buhârî, Edeb 24; Sehl b. Sa'd",
    olay:
      "Peygamber, işaret ve orta parmağını bitiştirip «Ben ve yetimin bakıcısı cennette böyleyiz» buyurdu.\n\n" +
      "Parmakların arasındaki mesafe, aradan bir başkasının geçemeyeceği kadar azdır. Söz, yetimin elinden tutanın cennette peygambere komşu olacağını söyler; ödül, yapılan işin büyüklüğüne değil, alınan sorumluluğa bağlanmıştır.",
  },
  {
    kaynak: "Ebu Davud, Edeb, 6 (meâl)",
    kaynakKunye: "Ebû Dâvûd, Edeb 121; Sehl b. Sa'd",
    olay:
      "Aynı müjde Ebû Dâvûd'da bir başka lafızla gelir: «Ben ve yetime iyilik eden, sömürmeyen kimse cennette böyleyiz.»\n\n" +
      "Şartın ikinci yarısı önemlidir: iyilik etmek yetmez, sömürmemek de gerekir. Yani yetimin malına, emeğine ya da duygusuna el uzatmayan bir bakıcı aranıyor.",
  },
  {
    kaynak: "Tirmizi, Fedâil, 6 (meâl)",
    kaynakKunye: "Tirmizî, Menâkıb; Âişe",
    olay:
      "Hz. Âişe'ye Peygamber'in ahlâkı sorulduğunda, cevabı bir ölçü verdi: «Onun ahlâkı Kur'an'dı.»\n\n" +
      "Yani Peygamber'in evde ve dışarıda nasıl davrandığını anlamak isteyen, Kur'an'a bakmalıydı. Aynı bâbda geçen söz de bunu tamamlar: en hayırlınız, ailesine karşı en hayırlı olanınızdır.",
  },
  {
    kaynak: "Nesai, Nikâh, 9 (meâl)",
    kaynakKunye: "Nesâî, Nikâh; Ebû Hüreyre",
    olay:
      "Hadis, evlilikte seçimin ölçüsünü tarif eder: kişi, eşini dört şeyden biri için seçer — mal, soy, güzellik ve din. Peygamber sonuncusunu işaret etti.\n\n" +
      "Yani ev, geçici üstünlüklerin üzerine kurulmaz. Mal tükenir, güzellik geçer, soy bir şey kazandırmaz; kalan, iki kişinin ahlâkıdır.",
  },
  // ═══ GENİŞ HAVUZ — SABIR ════════════════════════════════════
  {
    kaynak: "Tirmizî, Fedâ'ilü'l-Cihâd 9 (sahih)",
    kaynakKunye: "Tirmizî, Fedâilü'l-cihâd 9; Sa'd b. Ebî Vakkâs",
    olay:
      "Peygamber'e «İnsanların en şiddetli belâya uğrayanı kimdir?» diye soruldu. Cevap, ashâbın beklemediği bir sıraydı: «Peygamberler, sonra onlara en çok benzeyenler.»\n\n" +
      "Yani imtihan, imanın zayıflığına değil, derecenin yüksekliğine bağlıdır. Kul, dinindeki kadri kadar sınanır; sınavın ağırlığı, taşıdığı emanetin değerini gösterir.",
  },
  {
    kaynak: "Beyhakî, Şuab 7/7 (hasan — meâl)",
    kaynakKunye: "Beyhakî, Şuabü'l-îmân 7/7",
    olay:
      "Rivayet, sabrın istenebileceğini söyler: kim Allah'tan sabır dilerse ona sabır verilir.\n\n" +
      "Yani sabır, doğuştan gelen bir mizaç değil, verilen bir güçtür. Dua edenin eline tutunacak bir şey geçer; dayanma, kendi dişini sıkmakla değil, istemekle başlar.",
  },
  {
    kaynak: "Buhârî, Cenâiz 36 (sahih)",
    kaynakKunye: "Buhârî, Cenâiz 36; Müslim, Cenâiz 14; Enes b. Mâlik",
    olay:
      "Peygamber, kabri başında ağlayan bir kadına «Allah'tan kork, sabret» dedi. Kadın onu tanımadan çıkıştı; sonra özür diledi. Peygamber cevap verdi: «Gerçek sabır, musibetin ilk vuruşundaki sabırdır.»\n\n" +
      "Yani sabrın ölçüsü, acının ne zaman geçtiği değil, haberin ilk geldiği andaki hâldir.",
  },
  {
    kaynak: "Buhârî, Zekât 4 · Müslim, Zikr 52 (sahih)",
    kaynakKunye: "Buhârî, Zekât; Müslim, Zikir 52; Ümmü Seleme",
    olay:
      "Peygamber, musibet anında söylenecek cümleyi öğretti: «İnnâ lillâhi ve innâ ileyhi râci'ûn.» Sonra duâ: «Allah'ım, bunun karşılığını bana ver ve bana ondan daha hayırlısını nasip et.»\n\n" +
      "Ümmü Seleme bu duâyı kocası Ebû Seleme öldüğünde okudu; ardından Peygamber'in kendisiyle evlendi ve «Allah bana ondan daha hayırlısını verdi» dedi. Yani duâ, acının üzerine kurulan bir kapıdır.",
  },
  {
    kaynak: "Müslim, Zikr 33 · Ebû Dâvûd, Âdâb (sahih)",
    kaynakKunye: "Müslim, Zühd 64; Suheyb er-Rûmî",
    olay:
      "Suheyb'in naklettiği bu hadiste Peygamber, müminin hâline şaşar: ona iyi bir şey gelirse şükreder, hayır olur; bir dert gelirse sabreder, yine hayır olur.\n\n" +
      "Yani müminin kazancı olaylarda değil, olaylara verdiği cevaptadır. Aynı haber iki kişiye gelir; biri isyan eder, öbürü şükreder — fark, gelen şeyde değil, karşılayan kalptedir.",
  },
  {
    kaynak: "Müslim, İmân 164 (sahih)",
    kaynakKunye: "Müslim, Îmân 164; Sa'd b. Ebî Vakkâs",
    olay:
      "Hadis, imtihanın ölçüsünü kişinin dindeki derecesine bağlar: kul, dininde bastırdığı (sağlam durduğu) ölçüde sınanır.\n\n" +
      "Yani sınav, gücün üstünde değil, tam sınırındadır. Bu ölçü, ağır bir imtihan geçiren kişiye tersini söyler: belânın büyüklüğü, taşıyabildiğinin işaretidir.",
  },
  {
    kaynak: "Tirmizî, Zühd 30 (hasan)",
    kaynakKunye: "Tirmizî, Zühd 30; Ebû Hüreyre",
    olay:
      "Peygamber, dünyayı mümin için zindan, kâfir için cennet olarak tarif etti.\n\n" +
      "Zindan, duvarın ardında bir hayat olduğunu hatırlatır: mahpus, dışarıda kendisini bekleyen bir özgürlük olduğunu bilir. Mümin de dünyanın sınırlılığına bu gözle bakar; kâfir ise burayı son durak sandığı için elinden kaçırmamaya çalışır.",
  },
  {
    kaynak: "Buhârî, Zekât 114 · İbn Mâce, Zühd (sahih)",
    kaynakKunye: "Buhârî, Zekât; İbn Mâce, Zühd; Suheyb",
    olay:
      "Aynı hakikatin bir başka lafzı: müminin hâli şaşırtıcıdır, her işinde bir hayır vardır.\n\n" +
      "Cümle, hayatı ikiye bölmez — iyi günler ve kötü günler diye. Hepsini tek bir hesabın içine alır: sevinç şükrü, dert sabrı çağırır; ikisi de kazanç defterine yazılır.",
  },
  {
    kaynak: "Riyâdu's-Sâlihîn derlemesi (Buhârî, Müslim rivâyetleri — meâl)",
    kaynakKunye: "Riyâzü's-sâlihîn; Buhârî–Müslim rivayetleri",
    olay:
      "Nesî'nin derlemesinde sabır üçe ayrılır: musibete sabır, taate sabır ve günahtan sabır.\n\n" +
      "Üçüncüsü en zoru sayılır: nefsin ve şeytanın çağrısına karşı koymak. Yani sabır yalnız ağlarken gösterilen dayanma değil; isteyip de yapmamaktır.",
  },
  {
    kaynak: "Ebû Dâvûd, Zühd 3 · Tirmizî, Kıyâmet 9 (hasan — meâl)",
    kaynakKunye: "Ebû Dâvûd, Zühd 3; Tirmizî, Kıyâmet 9; Ebû Hüreyre",
    olay:
      "Peygamber, dünyaya bakışın yönünü belirledi: «Senden aşağıda olana bak, yukarıdakine bakma.»\n\n" +
      "Gerekçesi de verilir: bu, Allah'ın sana verdiği nimeti küçümsememenin yoludur. Yukarı bakan göz elindekini az görür; aşağı bakan göz, sahip olduğunun ne kadar büyük olduğunu fark eder.",
  },
  // ═══ GENİŞ HAVUZ — ANA-BABA & AİLE ════════════════════
  {
    kaynak: "Tirmizî, Birr 3 (sahih)",
    kaynakKunye: "Tirmizî, Birr 3; Abdullah b. Amr",
    olay:
      "Peygamber, «Rabbin rızası anne-babanın rızasındadır, Rabbin öfkesi de onların öfkesindedir» buyurdu.\n\n" +
      "Yani görünmeyen bir rıza, görünen bir kapıdan geçer. Evdeki ihtiyarın gönlünü kıran, farkında olmadan gökteki kapıyı da kapatmış olur.",
  },
  {
    kaynak: "Tirmizî, Menâkıb 27 (sahih)",
    kaynakKunye: "Tirmizî, Menâkıb 27; Âişe",
    olay:
      "Peygamber, «Sizin en hayırlınız, ailesine (ehline) en hayırlı olanınızdır» buyurdu; sonra kendisini de ölçünün içine koydu.\n\n" +
      "Hz. Âişe onu evde hizmet ederken, ayakkabısını tamir ederken ve koyun sağarken gördü. Yani ahlâk, dışarıda nazik olup evde sertleşmek değil; en mahrem yerde de aynı kalmaktır.",
  },
  // ═══ GENİŞ HAVUZ — KOMŞULUK ════════════════════════════════
  {
    kaynak: "Buhârî, Edeb · Müslim, İmân (sahih)",
    kaynakKunye: "Buhârî, Edeb; Müslim, Îmân; Ebû Hüreyre",
    olay:
      "Peygamber, komşusuna eziyet edeni cennetle müjdelemedi: «Komşusuna eziyet eden cennete girmez.»\n\n" +
      "Eziyet, büyük bir saldırı olmak zorunda değil. Gürültü, kırıcı bir söz, kapı önüne konan çöp — hadis, gündelik hayatın en küçük kabalığını cennetin kapısına bağlar.",
  },
  {
    kaynak: "Müslim, İmân 74 (sahih)",
    kaynakKunye: "Müslim, Îmân 74; Abdullah b. Ömer",
    olay:
      "İbn Ömer, komşusunun sıkıntısını görmezden geleni imanın dışına koyan hadisi nakletti: «Kendisi doyarken komşusu açsa, o kişi (gerçek) iman etmiş olmaz.»\n\n" +
      "Ölçü, mahalle içindedir: uzaklara gönderilen yardım değerli, ama duvarın öbür yüzünde bekleyen komşu, önce gelen borçtur.",
  },
  {
    kaynak: "Müslim, İmân 73 (sahih)",
    kaynakKunye: "Müslim, Îmân 73; Ebû Hüreyre",
    olay:
      "Peygamber, komşu hakkını imanla başlatır: «Kim Allah'a ve ahiret gününe inanıyorsa komşusuna ikram etsin.»\n\n" +
      "Aynı cümlenin devamı misafiri ve dili de kapsar. Üç hakkın ortak noktası, hepsinin kişinin kapısının hemen dışında başlamasıdır.",
  },
  {
    kaynak: "Buhârî, İmân 4 · Müslim, İmân 48 (sahih)",
    kaynakKunye: "Buhârî, Îmân 4; Müslim, Îmân 48; Abdullah b. Amr",
    olay:
      "Peygamber'e «Müslümanların hangisi daha faziletlidir?» diye soruldu. Cevap: «Dilinden ve elinden Müslümanların güvende olduğu kimse.»\n\n" +
      "Yani iman, iç dünyada kalan bir iddia değil; çevreye bırakılan emniyet. Söz, Medine'de yeni kurulan topluluğun ilk sınavını gösterdi.",
  },
  {
    kaynak: "Ahmed b. Hanbel, Müsned 2/381 (sahih)",
    kaynakKunye: "Ahmed b. Hanbel, Müsned 2/381; Ebû Hüreyre",
    olay:
      "Peygamber, «Ben ancak güzel ahlâkı tamamlamak için gönderildim» buyurdu.\n\n" +
      "Yani risaletin işi yeni bir ahlâk icat etmek değil; insanların arasında kırılmış olanı onarmak, eksik kalanı tamamlamak. Ahlâk, peygamberliğin hedefi olarak gösterildi.",
  },
  // ═══ GENİŞ HAVUZ — AHLÂK & DİL ════════════════════════════
  {
    kaynak: "İbn Mâce, Ahkâm 17 (hasan — meâl)",
    kaynakKunye: "İbn Mâce, Ahkâm 17; Ubâde b. Sâmit",
    olay:
      "Peygamber, «Zarar yoktur, zarara zararla karşılık vermek de yoktur» buyurdu.\n\n" +
      "Birinci cümle saldırganı, ikincisi savunma adı altında aynı kötülüğü tekrarlayanı durdurur. İslâm hukukunun temel kaidelerinden biri bu sözden çıkarıldı: hak aranır, ama ölçü kaçırılmaz.",
  },
  {
    kaynak: "İbn Mâce, Ahkâm, 17 (meâl)",
    kaynakKunye: "İbn Mâce, Ahkâm 17; İbn Abbas",
    olay:
      "Aynı hadisin İbn Abbas tarikiyle gelen lafzı, zararı hem vermeyi hem de karşılık olarak yöneltmeyi yasaklar.\n\n" +
      "Yani kötülüğe kötülükle cevap vermek, hakkı ararken aynı yolu tutmak demektir. Hadis, haksızlığa uğrayanın eline de bir sınır koyar.",
  },
  {
    kaynak: "Buhârî, Zekât 30 · Müslim, Zekât 69 (sahih)",
    kaynakKunye: "Buhârî, Zekât; Müslim, Birr 69; Ebû Hüreyre",
    olay:
      "Peygamber, «Sadaka malı eksiltmez» buyurdu.\n\n" +
      "Cümle dünya hesabına terstir: veren eksilir sanılır. Hadis, asıl eksilmenin vermemekle olduğunu söyler. Aynı hadisin devamında affedenin şerefinin arttığı ve tevazuun yücelttiği de eklenir — üçü de görünen hesabın tersini gösterir.",
  },
  {
    kaynak: "Buhârî, Zekât 27 · Müslim, Zekât 16 (sahih)",
    kaynakKunye: "Buhârî, Zekât 27; Müslim, Zekât 16; Hakîm b. Hizâm",
    olay:
      "Hakîm b. Hizâm Peygamber'den bir şey istedi; verildi. Yine istedi; yine verildi. Sonunda Peygamber buyurdu: «Veren el, alan elden hayırlıdır.» Hakîm o günden sonra kimseden bir şey istemedi.\n\n" +
      "Yani söz, isteyeni ayıplamıyor; vereni yüceltiyor. Ama tekrar eden istek, alanın da kendi yerini görmesini sağlıyor.",
  },
  {
    kaynak: "Müslim, Zekât 124 (sahih)",
    kaynakKunye: "Müslim, Zekât 124; Ebû Saîd el-Hudrî",
    olay:
      "Peygamber, «Kim sabrederse Allah ona sabır verir; kimseye sabırdan daha hayırlı ve daha geniş bir ikram verilmemiştir» buyurdu.\n\n" +
      "Söz, ashâbın isteklerini düzeltir: onlar mal istiyordu, Peygamber daha büyük bir şeyi gösterdi. Sabır, verilenlerin en genişidir; çünkü hiç tükenmez ve her yere yeter.",
  },
  {
    kaynak: "Buhârî, Edeb 61 (sahih)",
    kaynakKunye: "Buhârî, Edeb 61; Ebû Saîd el-Hudrî",
    olay:
      "Peygamber, sabrı bir ikram olarak adlandırdı: «Hiç kimseye sabrından daha geniş ve daha hayırlı bir ikram verilmemiştir.»\n\n" +
      "Yani sabır, kişinin kendi çabasıyla kurduğu bir zırh değil; Allah'ın verdiği bir bağış. Bu yüzden istenebilir, istenmesi de gerekir.",
  },
  {
    kaynak: "Buhârî, Edeb 56; İbn Mâce, Zühd 1 (sahih)",
    kaynakKunye: "Buhârî, Edeb 56; İbn Mâce, Zühd 1; Ebû Hüreyre; İbn Mesud",
    olay:
      "Peygamber, müminin çektiği hiçbir yorgunluğun, sıkıntının, hüznün, hattâ ayağına batan dikenin boşa gitmeyeceğini söyledi; Allah bunlarla günahlarından bir kısmını örter.\n\n" +
      "Söz, gündelik hayatın en küçük acısına bile bir karşılık yazar. Yani hiçbir sıkıntı, hesabın dışında kalmaz.",
  },
  {
    kaynak: "Ebû Dâvûd, Adâb 5213; Tirmizî, Daavât 6 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Edeb; Tirmizî, Daavât 6; Câbir",
    olay:
      "Peygamber, «İnsanların en sevilisi, insanlara en çok faydası devam eden kimsedir» buyurdu.\n\n" +
      "«Devam eden» kelimesi ölçüyü belirler: bir kere yapılan iyilik değil, arkasında iz bırakan iyilik. Su kanalı, dikilen ağaç, öğretilen bir söz — hepsi kişi öldükten sonra da işlemeye devam eder.",
  },
  {
    kaynak: "Müslim, Birr 88 (sahih)",
    kaynakKunye: "Müslim, Birr 88; Abdullah b. Mesud",
    olay:
      "Peygamber, «Allah güzeldir ve güzelliği sever» buyurdu.\n\n" +
      "Söz, bir bedeviye söylenmişti: adamın üstü başı dağınıktı. Peygamber ona temizliği ve düzeni tavsiye etti. Yani güzellik, süs değil; Allah'ın sevdiği bir nizamdır — hem kalpte hem kılıkta.",
  },
  {
    kaynak: "Müslim, Zühd 2 (sahih — meâl)",
    kaynakKunye: "Müslim, Zühd 2; Enes b. Mâlik",
    olay:
      "Hadis, sevginin bir imtihan getirdiğini söyler: Allah bir kavmi sevdiğinde onları iman yönünden dener.\n\n" +
      "Yani sınav, uzaklaşmanın değil yakınlaşmanın işareti olabilir. Annesinin çocuğunu denediği gibi: sınav, sevginin karşısındaki emeğidir.",
  },
  // ═══ GENİŞ HAVUZ — ZİKİR ════════════════════════════════════
  {
    kaynak: "Müslim, Zikr 3 (sahih)",
    kaynakKunye: "Müslim, Zikir 3; Ebû Hüreyre",
    olay:
      "Peygamber, «Kalpler paslanır» buyurdu; sebebi sorulunca «Zikir ve Kur'an okumak» dedi.\n\n" +
      "Pas, demirin havayla teması sonucu oluşur — yani kalp, gafletle temas ettikçe örtülür. İlaç da aynı yerden gelir: dili ve kulağı Allah'a çevirmek.",
  },
  {
    kaynak: "Müslim, Zikr 28 (sahih)",
    kaynakKunye: "Müslim, Zikir 28; Ebû Hüreyre",
    olay:
      "Peygamber, günde yüz kez «Sübhânallâhi ve bihamdihî» diyeni müjdeledi: günahları deniz köpüğü kadar olsa bile bağışlanır.\n\n" +
      "Deniz köpüğü, sayılamayacak kadar çok ama bir o kadar hafif olanı anlatır. Yani zikir, günahın çokluğuna karşı konulan bir denge: az bir söz, büyük bir yükü kaldırıyor.",
  },
  {
    kaynak: "Müslim, Zikr 26 (sahih)",
    kaynakKunye: "Müslim, Zikir 38; Ebû Hüreyre",
    olay:
      "Ebû Hüreyre'nin naklettiği hadiste Peygamber, dünyada giderilen bir sıkıntının kıyamette karşılığı olacağını söyledi.\n\n" +
      "Aynı bâbda sıralama uzar: kim bir işi kolaylaştırırsa, kim bir ayıbı örterse — hepsi kıyamette karşılığını bulur. Yani örtülmek isteyen, dünyada başkasının ayıbını örtsün.",
  },
  {
    kaynak: "Buhârî, Tevhid 61 (sahih)",
    kaynakKunye: "Buhârî, Tevhid 61; Ebû Hüreyre",
    olay:
      "Peygamber, «Güzel söz sadakadır» buyurdu.\n\n" +
      "Sadaka denince akla para gelir; hadis, dilin de bir kese olduğunu söyler. Bir teselli, bir teşekkür, bir yol sormaya verilen cevap — hepsi deftere sadaka olarak yazılır.",
  },
  {
    kaynak: "Buhârî, Edeb 31 · Müslim, Zühd 15 (sahih)",
    kaynakKunye: "Buhârî, Edeb 31; Müslim, Zühd 15; Ebû Hüreyre",
    olay:
      "Peygamber, dili iki seçeneğe bağladı: hayır söylemek ya da susmak.\n\n" +
      "Yani konuşmanın üçüncü bir hâli yok sayıldı: boş söz. Hadis, susmayı bir eksiklik değil, dilin en güvenli konumu olarak gösterir.",
  },
  {
    kaynak: "Buhârî, Daavât 51 (sahih)",
    kaynakKunye: "Buhârî, Daavât 51; Ebû Mûsâ el-Eş'arî",
    olay:
      "Peygamber, «Lâ havle ve lâ kuvvete illâ billâh» cümlesini cennetin hazinelerinden bir hazine olarak adlandırdı.\n\n" +
      "Cümle, insanın kendi gücünü teslim etmesidir: güç de kuvvet de Allah'tandır. Hazine denmesi, söyleyeni zengin eden bir sır gibidir — az söz, büyük bir birikim.",
  },
  {
    kaynak: "Buhârî, Ezan 155 (sahih)",
    kaynakKunye: "Buhârî, Ezan 155; Ebû Hüreyre",
    olay:
      "Peygamber, günde yüz kez «Lâ ilâhe illallâhü vahdehû lâ şerîke leh...» diyenin on köle azat etme sevabı kazanacağını söyledi.\n\n" +
      "Köle azadı, o günün en pahalı iyiliklerinden biriydi. Hadis, bir cümleyi o bedele eşitledi: yani söz, yalnız söylenmiş bir şey değil; bir insanı hürriyete kavuşturmak kadar ağır bir iyilik.",
  },
  {
    kaynak: "Müslim, Zikr 68 (sahih)",
    kaynakKunye: "Müslim, Zikir 68; Abdullah b. Büsr",
    olay:
      "Peygamber, Abdullah b. Büsr'e hitaben «Dilin, Allah'ın zikriyle ıslak kalsın» buyurdu.\n\n" +
      "Islaklık, kesintisiz bir hâli anlatır: kuruyan dil, zikrin arasına giren sessizliği gösterir. Yani zikir, günde birkaç dakika değil; dilin nemini koruyan sürekli bir alışkanlık.",
  },
  {
    kaynak: "Tirmizî, Daavât / Buhârî, Müslim (sahih — meâl)",
    kaynakKunye: "Tirmizî, Daavât; Buhârî–Müslim rivayetleri; Abdullah b. Mesud",
    olay:
      "Peygamber, tevbenin büyüklüğünü çölde devesini kaybeden adamla anlattı: adam azığı ve suyuyla birlikte devesini yitirir, ölümü beklerken onu bulur ve sevincinden ne söylediğini bilemez.\n\n" +
      "«Allah, kulunun tevbesine bundan daha çok sevinir.» Yani kaybedeni bulmanın sevinci ne kadar büyükse, affetmenin sevinci ondan büyüktür.",
  },
  // ═══ GENİŞ HAVUZ — NAMAZ ════════════════════════════════
  {
    kaynak: "Buhârî, Mevâkît · Müsned (sahih)",
    kaynakKunye: "Buhârî, Mevâkît; Müsned; Abdullah b. Mesud",
    olay:
      "Abdullah b. Mesud anlatıyor: Peygamber'e «Hangi amel daha faziletlidir?» diye sordum. «Vaktinde kılınan namaz» dedi. «Sonra hangisi?» dedim. «Anne-babaya iyilik.» «Sonra?» «Allah yolunda cihad.»\n\n" +
      "Üç soru, üç cevap. Sıralamanın ilk basamağı, vaktine yetiştirilen namazdır: günün neresinde durursan dur, önce o vakit gelir.",
  },
  {
    kaynak: "Tirmizî, Salât 413 (hasan)",
    kaynakKunye: "Tirmizî, Salât 413; Ebû Hüreyre",
    olay:
      "Peygamber, kıyamette ilk hesaba çekilecek amelin namaz olduğunu söyledi: «Namazı düzgünse kurtulur, bozuksa kaybeder.»\n\n" +
      "Namaz, diğer amellerin aynası sayıldı: vaktini gözetmeyen bir insanın diğer sorumluluklarını da gözetmesi beklenmez. İlk hesap, en temel alışkanlıktan başlar.",
  },
  {
    kaynak: "Buhârî, İlim 10 (sahih)",
    kaynakKunye: "Buhârî, İlim 10; Ebû Hüreyre",
    olay:
      "Peygamber, ilim için yola çıkanı müjdeledi: Allah ona cennete giden yolu kolaylaştırır.\n\n" +
      "İki yol birbirine bağlandı: ayağın yürüdüğü sokak ve kalbin yürüdüğü yol. Yani talebe, daha yolda iken varış yerini kazanmış sayılır.",
  },
  {
    kaynak: "Müslim, Birr 159 (sahih)",
    kaynakKunye: "Müslim, Birr 159; Âişe",
    olay:
      "Peygamber, «Ruhlar toplanmış ordulardır; birbirini tanıyanlar kaynaşır, tanımayanlar ayrılır» buyurdu.\n\n" +
      "Yani insanlar arasındaki yakınlık yalnız tanışmayla kurulmaz; mayaları uyuşan ruhlar, daha konuşmadan birbirini bulur. Söz, ilk bakışta kurulan dostlukların da bir açıklamasıdır.",
  },
  {
    kaynak: "Tirmizî, Birr 28 · Riyâdu's-Sâlihîn 311 (hasan)",
    kaynakKunye: "Tirmizî, Birr 28; Riyâzü's-sâlihîn 311",
    olay:
      "Hadis, üstünlüğü iki komşuluk alanına böler: «Allah katında insanların en hayırlısı arkadaşına en iyi davranandır; komşuların en hayırlısı da komşusuna en iyi davranandır.»\n\n" +
      "Yani ahlâk, uzakta değil; yanındakiyle kurduğun ilişkide ölçülür. Aynı sözün bir başka rivayeti bunu bir dua hâline getirir: kalıcı yurttaki kötü komşudan Allah'a sığınmak.",
  },
  {
    kaynak: "Buhârî, Daavât 289 (sahih)",
    kaynakKunye: "Buhârî, Daavât 289; Ebû Hüreyre",
    olay:
      "Peygamber'in dualarından biri şuydu: «Allah'ım! Kalıcı yurttaki kötü komşudan Sana sığınırım.» Sonra eklerdi: «Dünya komşusu ise geçicidir.»\n\n" +
      "Dünyada komşu değişir; gidersin ya da o gider. Ama ahiretteki komşuluk kalıcıdır — bu yüzden asıl korkulan, oradaki kötü komşudur.",
  },
  {
    kaynak: "Müslim, Eşribe 2040 (sahih)",
    kaynakKunye: "Müslim, Eşribe 2040; Ebû Hüreyre",
    olay:
      "Peygamber ve ehli yemek yediler; artan yemeği komşularına gönderdiler.\n\n" +
      "Hadis, bir evin sofrasını mahalleye açan alışkanlığı gösterir: artan yemek, ertesi güne kalan değil; hemen bölüşülen şeydir. Yani komşuluk, pişen tencerenin kokusunun ulaştığı yere kadar uzanır.",
  },
  {
    kaynak: "Ebû Dâvûd, Büyû' 3517 (sahih — meâl)",
    kaynakKunye: "Ebû Dâvûd, Büyû 3517; Ebû Râfi'",
    olay:
      "Peygamber, «Komşu, komşusunun satılık mülküne en layık olandır» buyurdu; şuf'a hakkı böyle doğdu.\n\n" +
      "Yani evinin bitişiğindeki yer satılacaksa, önce ona sorulur. Komşuluk, yalnız selamlaşma değil; kapının öbür yüzündeki hakkı önce tanımaktır.",
  },
  {
    kaynak: "Buhârî, el-Adabu'l-Müfred 110 (hasan — meâl)",
    kaynakKunye: "Buhârî, el-Edebü'l-müfred 110; Âişe",
    olay:
      "Hz. Âişe'ye «İki komşum var, hangisine vereyim?» diye soruldu; Peygamber'in cevabını aktardı: «Kapısı sana daha yakın olana.»\n\n" +
      "Paylaştırırken ölçü, komşunun hatırı değil; yakınlığıdır. Hukuk, kapıyı çaldığında ilk duyulacak olandan başlar.",
  },
  {
    kaynak: "Buhârî, el-Adabu'l-Müfred 109 (hasan — Hâreşi)",
    kaynakKunye: "Buhârî, el-Edebü'l-müfred 109; Hâreşî",
    olay:
      "Peygamber, komşunun sınırını genişletti: «Komşu, önündeki kırk ev, arkasındaki kırk ev, sağındaki kırk ev ve solundaki kırk evdir.»\n\n" +
      "Yani komşuluk, yalnız duvar komşusu değil; mahallenin dört yönünde kırk kapı. Hadis, sorumluluğu bir binadan bir mahalleye çıkarır.",
  },
  {
    kaynak: "Müslim, Birr 2625 c (sahih)",
    kaynakKunye: "Müslim, Birr 2625; Ebû Zerr",
    olay:
      "Peygamber, Ebû Zerr'e iki kez seslendi: «Ey Ebû Zerr! Yemek pişirdiğin zaman suyunu çoğalt; sonra komşularından bir ev halkına bak ve ona da ver.»\n\n" +
      "Ebû Zerr, Medine'nin dışında yoksul komşularıyla yaşardı. Peygamber ona yemeği azaltmasını değil, tenceresini büyütmesini söyledi: cömertlik, artandan vermek değil, baştan hesaba katmaktır.",
  },
  // ═══ GENİŞ HAVUZ — ÖFKE ════════════════════════════════════
  {
    kaynak: "Buhârî, Edeb 76 · Müslim, Birr 107",
    kaynakKunye: "Buhârî, Edeb 76; Müslim, Birr 107; Ebû Hüreyre",
    olay:
      "Peygamber'e «Güçlü kimdir?» diye soruldu. Ashâb güreşte yenilmeyeni söyledi. Peygamber düzeltti: «Güçlü, öfke anında kendisine hâkim olandır.»\n\n" +
      "Yani güç, karşındakini yere sermek değil; kendi nefsini yere sermek. Ölçü, kimsenin görmediği o birkaç saniyede belli olur.",
  },
  {
    kaynak: "Buhârî, Bedü'l-halk 11 · Müslim, Birr 109",
    kaynakKunye: "Buhârî, Bed'ü'l-halk 11; Müslim, Birr 109; Süleyman b. Surad",
    olay:
      "Bir adam Peygamber'in yanında öfkelendi; yüzü kızardı, damarları şişti. Peygamber buyurdu: «Ben bir kelime biliyorum; onu söylese öfkesi geçer: Eûzü billâhi mineşşeytânirracîm.»\n\n" +
      "Yani öfke, dışarıdan gelen bir kışkırtmadır; çaresi de ona sığınmaktır. Söz, öfkeyi kişiliğin parçası değil, üzerine çöken bir hâl olarak tarif eder.",
  },
  // ═══ GENİŞ HAVUZ — HASTALIK ═══════════════════════════════
  {
    kaynak: "Buhârî, Merdâ 1 · Müslim, Birr 50",
    kaynakKunye: "Buhârî, Merdâ 1; Müslim, Birr 50; Ebû Hüreyre",
    olay:
      "Peygamber, hastalığın bile hesaba katıldığını söyledi: müminin çektiği yorgunluk, hastalık, keder, hattâ ayağına batan bir diken bile günahlarından bir kısmını örter.\n\n" +
      "Yani acı, boşa gitmez. Hadis, dermanı olmayan küçük sıkıntılara bile bir anlam verir: her biri, defterdeki bir borcu kapatır.",
  },
  {
    kaynak: "Tirmizî, Zühd 56",
    kaynakKunye: "Tirmizî, Zühd 56; Sa'd b. Ebî Vakkâs",
    olay:
      "Peygamber, «Sevabın büyüklüğü sıkıntının büyüklüğü ölçüsündedir» buyurdu.\n\n" +
      "Yani mükâfat, çekilenin ağırlığıyla tartılır. Söz, ağır imtihan geçirenin şikâyetini tersine çevirir: belânın büyüklüğü, verilecek karşılığın da büyük olduğunun işaretidir.",
  },
  {
    kaynak: "Buhârî, Merdâ 1",
    kaynakKunye: "Buhârî, Merdâ 1; Ebû Hüreyre",
    olay:
      "Hadis, Allah'ın kuluna hayır dilediğinde dünyada belâsını acele verdiğini söyler: ceza ahirette toplanmadan, burada hafifletilir.\n\n" +
      "Yani dert, unutulmak değil; hesabın burada görülmesidir. Söz, hastalık ve kayıp haberleriyle sarsılan Medine'ye söylenmiş bir tesellidir.",
  },
  {
    kaynak: "Buhârî, Rikâk 6",
    kaynakKunye: "Buhârî, Rikâk 6; Ebû Hüreyre",
    olay:
      "Peygamber, dünyada sevdiği bir dostunu kaybedip sabreden ve karşılığını Allah'tan bekleyen kuluna cenneti vaat etti.\n\n" +
      "Yani kaybın karşılığı, kaybedileni geri vermek değil; yerine daha büyük bir şey koymak. Hadis, ölümün ardından susmayı değil, sabırla beklemeyi öğütler.",
  },
  {
    kaynak: "Buhârî, Tıb 31",
    kaynakKunye: "Buhârî, Tıb 31; Âişe",
    olay:
      "Peygamber, veba salgınında yerinde kalan ve sabreden mümini müjdeledi: ona şehit sevabı vardır. Bir başka rivayette salgın, müminler için rahmet sayıldı.\n\n" +
      "Yani kaçmakla kalmak arasındaki seçim, yalnız sağlık meselesi değil; bir teslimiyet meselesi. Hadis, panik yerine tedbir ve sabrı yerleştirir.",
  },
  {
    kaynak: "Buhârî, Merdâ 7",
    kaynakKunye: "Buhârî, Merdâ 7; Enes b. Mâlik",
    olay:
      "Peygamber, gözlerini kaybedip sabreden kula cenneti vaat etti.\n\n" +
      "Göz, insanın dünyaya açılan en büyük kapısıdır; onun kapanması, dünyanın yarısının çekilmesi demektir. Hadis, bu kaybın karşılığını cennet olarak koyar — yani görülen şey, kaybedilenden büyük olacaktır.",
  },
  {
    kaynak: "Buhârî, Merdâ 6 · Müslim, Birr 54",
    kaynakKunye: "Buhârî, Merdâ 6; Müslim, Birr 54; Atâ b. Ebî Rebâh",
    olay:
      "Peygamber, sarası tutan bir kadına iki yol gösterdi: «İstersen sabret, cennetlik ol; istersen sıhhatin için Allah'a dua edeyim.»\n\n" +
      "Kadın cevap verdi: «Sabredeyim; ama bedenim açılıyor, kimse görmesin diye dua et.» Peygamber dua etti.\n\n" +
      "Hadis, imtihanın kaldırılmasını istemeyi ayıplamaz; ama sabrı seçenin önüne cenneti koyar. Kadının asıl derdi ise örtünmekti — edep, acıdan önce geliyordu.",
  },
  {
    kaynak: "Buhârî, Megâzî 84",
    kaynakKunye: "Buhârî, Megâzî 84; Âişe; Fâtıma",
    olay:
      "Peygamber'in hastalığı ağırlaştığında kızı Fâtıma yanına geldi. Peygamber ona bir şey söyledi; Fâtıma ağladı. Sonra bir şey daha söyledi; bu kez güldü.\n\n" +
      "Sonradan anlattı: ilkinde «Her yıl Cibril ile Kur'an'ı bir kez mukabele ederdik, bu yıl iki kez etti; ecelim yakın» demişti. İkincisinde ise «Ağlama; ehlimden bana ilk kavuşacak sen olacaksın» buyurmuştu.\n\n" +
      "Fâtıma, babasının vefatından altı ay sonra vefat etti.",
  },
  {
    kaynak: "Buhârî, Menâkıbü'l-ensâr 8 · Müslim, İmâre 48",
    kaynakKunye: "Buhârî, Menâkıbü'l-ensâr 8; Müslim, İmâre 48; Üseyd b. Hudayr",
    olay:
      "Peygamber, ensâra hitaben bir uyarıda bulundu: yöneticilikte kendilerine başkaları tercih edilecek, kayırma görecekler.\n\n" +
      "O zaman ne yapmalıydılar? Cevap: «Benimle havuz başında kavuşuncaya kadar sabredin.»\n\n" +
      "Yani haksızlık karşısında dağılmak yerine, hesabı ahirette görmek. Söz, ashâbın en kırılgan ânında söylenmiş bir bağlılık yemini gibidir.",
  },
  {
    kaynak: "İbn Mâce, Fiten 23 (hasen)",
    kaynakKunye: "İbn Mâce, Fiten 23; Ebû Mûsâ",
    olay:
      "Peygamber, insanlarla birlikte yaşayıp onların eziyetine sabreden mümini, onlardan uzak durup eziyete katlanmayandan üstün tuttu.\n\n" +
      "Yani köşeye çekilmek kolay yoldur; zor olan, mahallenin içinde kalıp kırılmadan yaşamaktır. Hadis, toplumdan kaçmayı değil, onun içinde sabrı öne çıkarır.",
  },
  // ═══ GENİŞ HAVUZ — ŞÜKÜR & HAMD ══════════════════════════
  {
    kaynak: "Ebû Dâvûd, Et'ime (meâl)",
    kaynakKunye: "Ebû Dâvûd, Et'ime; Ebû Hüreyre",
    olay:
      "Peygamber, önemli bir işe hamd ile başlanmadığında onun bereketsiz ve eksik kalacağını söyledi.\n\n" +
      "Yani hamd, işin sonuna eklenen bir teşekkür değil; başına konan bir anahtar. Sofrada da, hutbede de, yola çıkarken de önce Allah'ın adı anılır.",
  },
  {
    kaynak: "Müslim, Îmân (meâl)",
    kaynakKunye: "Müslim, Îmân; Mi'raç rivayeti",
    olay:
      "Mi'raç gecesi Peygamber'e süt ve şarap sunuldu. Peygamber sütü seçti. Cibril dedi: «Hamd, Rabbini fıtrata ve ümmetine hidayete muvaffak kılan Allah'a mahsustur.»\n\n" +
      "Seçim, bir tercih anında yapıldı: iki kadeh, iki yol. Süt, fıtratın; şarap, aklı örtenin sembolüydü. Hadis, bu seçimi bir hidayet olarak kayda geçirir.",
  },
  {
    kaynak: "Tirmizî, Cenâiz (meâl)",
    kaynakKunye: "Tirmizî, Cenâiz; Evsâf rivayeti",
    olay:
      "Bir kulun evlâdı ölünce, sabredip «İnnâ lillâhi ve innâ ileyhi râci'ûn» der ve hamd ederse, Allah meleklere şöyle buyurur: «Kuluma cennette bir ev yapın; adı Beytü'l-hamd olsun.»\n\n" +
      "Yani kaybın ardından söylenen hamd, yeni bir eve ad olur. Hadis, yasın içine bile bir şükür kapısı bırakır.",
  },
  {
    kaynak: "Müslim, Zühd (meâl)",
    kaynakKunye: "Müslim, Zühd; Enes b. Mâlik",
    olay:
      "Peygamber, kulun yediği bir lokmada ve içtiği bir yudumda hamd etmesinden Allah'ın razı olduğunu söyledi.\n\n" +
      "Yani şükür, büyük nimetlere saklanmaz. Bir yudum suya söylenen hamd, gündelik hayatın en küçük birimini bile bir teşekkür vesilesine çevirir.",
  },
  {
    kaynak: "Buhârî, Teheccüd 6",
    kaynakKunye: "Buhârî, Teheccüd 6; Mugîre b. Şu'be",
    olay:
      "Peygamber gece namazına kalkıp ayakları şişinceye kadar dururdu. Hz. Âişe «Allah senin geçmiş ve gelecek günahlarını bağışladı; niçin bu kadar yoruluyorsun?» diye sordu.\n\n" +
      "Cevap: «Şükreden bir kul olmayayım mı?»\n\n" +
      "Yani ibadet, korkudan çok teşekkürdür. Hadis, kulun Allah'a borcunu ödeyemeyeceğini bilse de şükürle yaklaşmasını öğretir.",
  },
  {
    kaynak: "Ebû Dâvûd, Cihâd (meâl)",
    kaynakKunye: "Ebû Dâvûd, Cihâd; Mi'raç rivayeti",
    olay:
      "Mi'raç gecesi Peygamber'e ümmetinin üçte birinin affı müjdelendi; her seferinde Rabbinin huzurunda şükür secdesine kapandı.\n\n" +
      "Hadis, sevincin bile bir secdeyle karşılandığını gösterir: iyi haber, sarhoşluk değil, şükür üretir.",
  },
  {
    kaynak: "Tirmizî, Daavât 86 (meâl)",
    kaynakKunye: "Tirmizî, Daavât 86; Ebû Hüreyre",
    olay:
      "Peygamber, bir adama dört cümlelik bir öğüt verdi: «Haramdan sakın, insanların en çok ibadet edeni olursun; Allah'ın sana ayırdığına razı ol, insanların en zengini olursun; komşuna iyilik et, mümin olursun; kendin için sevdiğini insanlar için de sev, Müslüman olursun.»\n\n" +
      "Dört cümle, dört büyük iddiayı gündelik davranışa çeviriyor.",
  },
  // ═══ GENİŞ HAVUZ — KOMŞULUK (devam) ═════════════════════
  {
    kaynak: "Buhârî, Ölfet 6016 (sahih — meâl)",
    kaynakKunye: "Buhârî, Edeb; Müslim, Birr 140; Âişe",
    olay:
      "Hz. Âişe'nin naklettiği söz, komşuluğun Peygamber'in dilinde ne kadar yer tuttuğunu gösterir: «Cibril bana komşuyu o kadar çok vasiyet etti ki, onu mirasçı yapacağımı sandım.»\n\n" +
      "Yani vahiy, yalnız büyük emirler getirmedi; gündelik hayatın en küçük komşusuna kadar indi.",
  },
  {
    kaynak: "Buhârî, Zekât 30 (sahih — meâl)",
    kaynakKunye: "Buhârî, Edeb 31; Ebû Hüreyre",
    olay:
      "Peygamber, «Kim Allah'a ve ahiret gününe iman ederse komşusuna iyilik etsin» buyurdu.\n\n" +
      "Aynı cümle, misafire ikram ve dilin korunmasıyla devam eder. Üçü de aynı imanın borcudur; iman, evin dışına adım atıldığı anda sınanır.",
  },
  {
    kaynak: "Müslim, Âdâb 23 (sahih)",
    kaynakKunye: "Müslim, Birr 73; Ebû Hüreyre",
    olay:
      "Hadis, komşusu açken tok yatanı mümin saymaz.\n\n" +
      "Bir mahallenin gece manzarasını hesaba katar: bir evde tencere kaynamıyorsa ve yanı başındaki evde kimse bir şey yememişse, o mahallenin imanı eksiktir. Yardım, uzağa gönderilen bir para değil; duvarın öbür yüzüdür.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb 5151 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Edeb 5151; Ebû Hüreyre",
    olay:
      "Hadis, imanı komşunun hissettiği güvene bağlar: komşusu onun kötülüğünden emin değilse, o kişi gerçek mümin değildir.\n\n" +
      "Yani iyi niyet tek başına yetmez; karşı tarafın rahat uyuması gerekir. Ölçü, kişinin kendi vicdanı değil, komşusunun hissiyatıdır.",
  },
  {
    kaynak: "Buhârî, Hıyel 14 (sahih — meâl)",
    kaynakKunye: "Buhârî, Şüf'a; Ebû Râfi'",
    olay:
      "Peygamber, «Komşu, komşusunun malını satın almada öncelik hakkına sahiptir» buyurdu.\n\n" +
      "Yani bitişikteki yer satılacaksa, önce ona haber verilir. Komşuluk, hukuken tanınmış bir yakınlıktır: ev, yalnız kendi duvarlarından ibaret değildir.",
  },
  {
    kaynak: "İbn Mâce, Şuf'a 1 (sahih — meâl)",
    kaynakKunye: "İbn Mâce, Şüf'a 1; Câbir",
    olay:
      "Hadis, satıştan önce komşuya teklif etmeyi emreder: «Satılık arazisi olan, onu önce komşusuna teklif etsin.»\n\n" +
      "Böylece mahallede yabancı bir elin kapı komşusu olması engellenir. Hukuk, komşuluğun sürekliliğini korumak için satış hürriyetine küçük bir sınır koyar.",
  },
  {
    kaynak: "İbn Mâce, Zühd 25 (hasan — meâl)",
    kaynakKunye: "İbn Mâce, Zühd 25; Abdullah b. Amr",
    olay:
      "Peygamber, komşuların şahitliğini bir ölçü yaptı: «Komşuların 'iyi yaptın' derse iyi yapmışsındır; 'kötü yaptın' derse kötü yapmışsındır.»\n\n" +
      "Yani ahlâkın doğrulaması içeride değil, dışarıda. İnsan kendini kolay affeder; komşusu ise her gün aynı duvarın öbür yüzünde seni görür.",
  },
  {
    kaynak: "İbn Hibbân, es-Sâhatih (meâl; hasen)",
    kaynakKunye: "İbn Hibbân, es-Sahîh; Ebû Hüreyre",
    olay:
      "Peygamber'in dualarından biri: «Allah'ım! İkamet ettiğim yerdeki kötü komşudan Sana sığınırım.»\n\n" +
      "Dua, «ikamet ettiğim yerdeki» diye sınırlar: çölde komşu değişir, yerleşilen yerde ise kader olur. Bu yüzden sığınma, kalıcı olan kötü komşu içindir.",
  },
  {
    kaynak: "Buhârî, Rikâk 23 (sahih — meâl)",
    kaynakKunye: "Buhârî, Rikâk 23; Ebû Hüreyre",
    olay:
      "Peygamber, imanı üç şarta bağladı: «Kim Allah'a ve ahiret gününe inanıyorsa komşusunu rahatsız etmesin, misafirine ikram etsin, ya hayır konuşsun ya da sussun.»\n\n" +
      "Üçü de bir evin içinden sokağa açılan kapılardır: duvar, kapı ve dil.",
  },
  {
    kaynak: "Buhârî, Edeb 85 (sahih — meâl)",
    kaynakKunye: "Buhârî, Edeb 85; Ebû Hüreyre",
    olay:
      "Aynı üçlü bu kez misafir ve akrabalık üzerinden kurulur: iman eden, misafirine ikram etsin ve akrabalık bağını sürdürsün.\n\n" +
      "Yani iman, kapını çalanı ve soyunu hatırlamayı gerektirir. Misafir üç gün ağırlanır; akrabalık ise bir ömür sürer.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb (meâl; hasen)",
    kaynakKunye: "Ebû Dâvûd, Edeb; Abdullah b. Ömer",
    olay:
      "Hadis, komşuluk hakkını hukuk diliyle hatırlatır: komşunun hakkını vermeyip üstüne yatan, kıyamette hesap verir.\n\n" +
      "Yani komşunun hakkı, bir gönül borcu değil; ödenmesi gereken bir alacaktır. Sınırı paylaşan iki ev arasında bile hukuk işler.",
  },
  {
    kaynak: "Taberâni, el-Mu'cemü'l-kebîr (meâl; hasen)",
    kaynakKunye: "Taberânî, el-Mu'cemü'l-kebîr",
    olay:
      "Hadis, iki seçimi öne alır: «Ev almadan önce komşu, yola çıkmadan önce de arkadaş seçin.»\n\n" +
      "Yani iyi bir ev bile kötü komşuyla cehenneme döner; uzun bir yol bile iyi arkadaşla kısalır. Söz, satın almadan önce bakılacak şeyi gösterir: duvarı değil, duvarın ardındakini.",
  },
  // ═══ GENİŞ HAVUZ — AKRABALIK ══════════════════════════════
  {
    kaynak: "Nesâî, Zekât (meâl; hasen)",
    kaynakKunye: "Nesâî, Zekât; Selmân b. Âmir",
    olay:
      "Peygamber, yoksul akrabaya verilen sadakanın iki sevap kazandırdığını söyledi: biri sadaka, öbürü sıla-i rahim.\n\n" +
      "Yani aynı para iki deftere yazılır. Sadaka, ihtiyacı karşılar; akrabalık ise bağı korur — ve bağ, ihtiyaçtan önce gelir.",
  },
  {
    kaynak: "İbn Mâce, Zühd 23 (hasen — meâl)",
    kaynakKunye: "İbn Mâce, Zühd 23; Ebû Hüreyre",
    olay:
      "Peygamber, sevabı en hızlı verilen iki hayrı saydı: iyilik yapmak ve akrabalık bağını sürdürmek.\n\n" +
      "Yani bazı amellerin karşılığı ahirete kalmaz; dünyada da karşılığını görürsün. Bir akrabayı arayan, beklediğinden çabuk bir cevap alır.",
  },
  {
    kaynak: "Tirmizî, Birr 49 (hasen — meâl)",
    kaynakKunye: "Tirmizî, Birr 49; Ebû Eyyûb el-Ensârî",
    olay:
      "Hadis, akrabalık bağının üç karşılığını sayar: aile içinde sevgi, malda bolluk ve ömürde bereket.\n\n" +
      "Yani bağı sürdürmek, yalnız bir görev değil; evin bereketini artıran bir yatırımdır. Akrabasını arayan, kendi sofrasını da büyütür.",
  },
  {
    kaynak: "Ebû Dâvûd, Zekât 45 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Zekât 45; Abdurrahman b. Avf",
    olay:
      "Peygamber, Allah'ın şöyle buyurduğunu nakletti: «Ben Rahmân'ım, rahim de benden bir bağdır; ona kendi ismimden türeyen bir ad verdim. Onunla bağ kuranla ben de bağ kurarım, onu koparanla ben de koparırım.»\n\n" +
      "Yani akrabalık, sosyal bir âdet değil; Allah'ın isminden pay almış bir bağdır. Onu koparan, yalnız bir insanı değil, bir ilâhî ismi de kırmış olur.",
  },
  {
    kaynak: "Müslim, Birr 19 (sahih)",
    kaynakKunye: "Müslim, Birr 18–19; Cübeyr b. Mut'im",
    olay:
      "Peygamber, «Akrabalık bağını kesen cennete girmez» buyurdu.\n\n" +
      "Söz, cezanın ağırlığını gösterir: mesele bir aile kavgası değil, cennetin kapısıdır. Yani evin içindeki kırgınlık, mahşerdeki hesabın konusudur.",
  },
  {
    kaynak: "Buhârî, Edeb 15 (sahih)",
    kaynakKunye: "Buhârî, Edeb 15; Abdullah b. Ömer",
    olay:
      "Peygamber, akrabalık bağını gerçekten koruyanı tanımladı: «O, kendisine iyilik yapana karşılık veren değil; kendisinden iyilik kesildiğinde bile bağı sürdürendir.»\n\n" +
      "Yani asıl sıla, karşı taraf aradığında değil, aramadığında başlar. Ölçü, karşılıklı değil; tek taraflı iyi niyettir.",
  },
  {
    kaynak: "Buhârî, Edeb 12 (sahih)",
    kaynakKunye: "Buhârî, Edeb 12; Enes b. Mâlik",
    olay:
      "Peygamber, «Kim rızkının bollaşmasını ya da ecelinin gecikmesini istiyorsa akrabalık bağını sürdürsün» buyurdu.\n\n" +
      "İki vaat, iki dünya ihtiyacına denk gelir: geçim ve ömür. Yani akrabasını arayan, yalnız gönül değil, kendi rızkını da genişletir.",
  },
  {
    kaynak: "Muvatta, Sıfatü'n-nebî 10 (sahih)",
    kaynakKunye: "Muvatta, Sıfatü'n-nebî; Ebû Hüreyre",
    olay:
      "Peygamber, Müslüman kadınlara seslendi: «Sizden biri, komşusunun ikram ettiği şeyi — bir koyun paçası bile olsa — küçümsemesin.»\n\n" +
      "Yani hediyenin değeri, maddesinde değil; verenin niyetindedir. Küçük bir ikramı beğenmemek, komşuluğu baştan bitiren sessiz bir kapı kapatmasıdır.",
  },
  // ═══ GENİŞ HAVUZ — SADAKA'NIN YOLU ══════════════════════
  {
    kaynak: "Müslim, Tahâret 1328 (sahih)",
    kaynakKunye: "Müslim, Tahâret 1; Ebû Mâlik el-Eş'arî",
    olay:
      "Peygamber, üç şeyi üç şeye benzetti: «Namaz bir nurdur, sadaka bir burhandır, sabır bir ışıktır.»\n\n" +
      "Üçü de karanlıkta yol gösteren şeylerdir; ama farklı işler görürler. Nur yolu aydınlatır, burhan iddiayı kanıtlar, ışık ise uzun yolda yanında taşınır. Yani sadaka, imanın en somut delilidir.",
  },
  {
    kaynak: "Ebû Dâvûd, Et'ime 9 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Et'ime 9; Ebû Hüreyre",
    olay:
      "Peygamber, iki kişi birden davet ettiğinde nereye gidileceğini söyledi: «Kapısı en yakın olana git; kapısı en yakın olan, en yakın komşudur.»\n\n" +
      "Yani tercih, davetin büyüklüğüne değil, yakınlığa göre yapılır. Hukuk, kapıyı çaldığında ilk duyulacak olandan başlar.",
  },
  {
    kaynak: "Buhârî, Zekât 65 (sahih)",
    kaynakKunye: "Buhârî, Zekât 65; Ebû Hüreyre",
    olay:
      "Peygamber, «Malın hayrından harca; sadaka malı eksiltmez» buyurdu.\n\n" +
      "Cümle dünya hesabına terstir: veren eksilir sanılır. Hadis, asıl eksilmenin vermemekle olduğunu söyler. Aynı bâbda affedenin şerefinin arttığı da eklenir.",
  },
  {
    kaynak: "Ebû Dâvûd, Et'ime 3767 (sahih — meâl)",
    kaynakKunye: "Ebû Dâvûd, Et'ime 3767; Âişe; Ümmü Eymen",
    olay:
      "Peygamber, yemeğe besmele ile başlanmasını öğretti; unutulursa sonunda şöyle denmesini söyledi: «Bismillâhi evvelehû ve âhirahû.»\n\n" +
      "Yani unutmak, kapıyı tamamen kapatmaz; hatırlandığı anda söylenen söz, baştaki eksikliği tamamlar. Dinin kolaylığı buradadır: geç kalan niyet de kabul edilir.",
  },
  {
    kaynak: "Buhârî, Libâs 28 (sahih)",
    kaynakKunye: "Buhârî, Libâs 28; Ebû Hüreyre",
    olay:
      "Peygamber, imanı üç davranışa bağladı: «Kim Allah'a ve ahiret gününe inanıyorsa komşusuna eziyet etmesin; misafirine ikram etsin; ya hayır konuşsun ya da sussun.»\n\n" +
      "Üçü de bir evin kapısından dışarı çıkan davranışlardır: gürültü, sofra ve dil. İman, bu üç eşikte sınanır.",
  },
  {
    kaynak: "Müslim, Birr · Ebû Dâvûd, Edeb 5156 (sahih — meâl)",
    kaynakKunye: "Müslim, Birr; Ebû Dâvûd, Edeb 5156; Ebû Hüreyre; Huzeyfe",
    olay:
      "Peygamber'in dualarından biri: «Dâimî meskende kötü komşudan Allah'a sığınırım.» Sonra eklerdi: «Çölde komşu değişebilir.»\n\n" +
      "Ayrım ince: geçici komşuya sabır, kalıcı komşuya sığınma. Yani dua, yerleşilen evin kaderini Allah'a bırakmaktır.",
  },
  {
    kaynak: "Buhârî, Zekât 1429 · Müslim, Zekât 1033 (sahih)",
    kaynakKunye: "Buhârî, Zekât 1429; Müslim, Zekât 1033; Hakîm b. Hizâm",
    olay:
      "Hakîm b. Hizâm Peygamber'den bir şey istedi, verildi; yine istedi, yine verildi; bir daha istedi. Sonunda buyurdu: «Ey Hakîm! Bu mal yeşil ve tatlıdır; kim onu gönül tokluğuyla alırsa bereketlenir; kim hırsla alırsa bereketlenmez.»\n\n" +
      "Hakîm, «Seni hakla gönderene yemin olsun, senden sonra kimseden bir şey istemeyeceğim» dedi ve ömrü boyunca öyle yaptı.",
  },
  {
    kaynak: "Buhârî, Zekât 1417 (sahih)",
    kaynakKunye: "Buhârî, Zekât 1417; Hakîm b. Hizâm",
    olay:
      "Peygamber, «En hayırlı sadaka, zenginken verilendir» buyurdu ve ekledi: «Vermeye bakmakla yükümlü olduklarından başla.»\n\n" +
      "Yani infakın sırası vardır: önce evin, sonra yakının, sonra mahalle. Başkasına uzanan el, kendi evinin ihtiyacını atlayarak başlamaz. Zengin iken verilen ise en zor olanıdır — çünkü mal henüz elden çıkmamıştır.",
  },
  {
    kaynak: "Müslim, Birr 2588 (sahih)",
    kaynakKunye: "Müslim, Birr 69; Ebû Hüreyre",
    olay:
      "Peygamber, üç şeyi yan yana söyledi: «Sadaka vermek maldan bir şey eksiltmez; bir kul affettiğinde Allah onun şerefini artırır; bir kul tevazu ile alçaldıkça Allah onu yüceltir.»\n\n" +
      "Üçü de dünya ölçüsünün tersidir: veren azalır, affeden kaybeder, alçalan değersizleşir sanılır. Hadis, üçünde de tersini söyler.",
  },
  {
    kaynak: "Buhârî, Hibe 2576 (sahih)",
    kaynakKunye: "Buhârî, Hibe 2576; Müslim, Zekât 1030; Âişe",
    olay:
      "Peygamber'e yemek getirildiğinde her zaman aynı soruyu sorardı: «Bu armağan mı, sadaka mı?» Armağan ise ondan yer, ashâbına da yedirirdi; sadaka ise yemez, onlara bırakırdı.\n\n" +
      "Yani hesap, tabağın içinde değil, geliş yolunda. Aynı et, sadaka olarak geldiğinde başka bir hükme, hediye olarak geldiğinde başka bir hükme tabidir.",
  },
  {
    kaynak: "Buhârî, Vesâyâ 2756 · Muveattâ 1456 (sahih)",
    kaynakKunye: "Buhârî, Vesâyâ 2756; Muvatta 1456; Sa'd b. Ebî Vakkâs",
    olay:
      "Sa'd'ın annesi vefat etti. Sa'd Peygamber'e sordu: «Annem adına sadaka versem ona faydası olur mu?» Cevap: «Evet.»\n\n" +
      "Bunun üzerine «Mihrem» denilen bahçesini onun adına sadaka etti. Hadis, ölünün ardından yapılan iyiliğin ona ulaştığını gösterir: vefat, ilişkiyi bitirmez.",
  },
  {
    kaynak: "Buhârî, Ferâiz 5354 (sahih)",
    kaynakKunye: "Buhârî, Ferâiz 5354; Sa'd b. Ebî Vakkâs",
    olay:
      "Sa'd hastalığında Peygamber'e sordu: «Malımın hepsini vasiyet edeyim mi?» — «Hayır.» — «Üçte ikisini?» — «Hayır.» — «Yarısını?» — «Hayır.»\n\n" +
      "Sonunda buyurdu: «Üçte bir; üçte bir bile çok. Mallarını mirasçılarını zengin bırakman, onları insanlara el açan muhtaçlar olarak bırakmandan hayırlıdır.»\n\n" +
      "Yani cömertlik, aileyi de kapsamak zorundadır; vasiyet, kalanları unutarak yazılmaz.",
  },
  {
    kaynak: "Nesâî, Zekât 2459 (sahih)",
    kaynakKunye: "Nesâî, Zekât 2459; Abdullah b. Ebî Evfâ",
    olay:
      "Peygamber'e sadaka getirenler olduğunda şöyle duâ ederdi: «Allah'ım! Bunlar (şu) âilesine salât (rahmet) et.»\n\n" +
      "Yani veren, verdiğiyle baş başa bırakılmıyor; Peygamber onun için dua ediyordu. Hadis, sadakayı alan elin de bir sorumluluğu olduğunu gösterir: almak, teşekkürü de taşımaktır.",
  },
  {
    kaynak: "Mishkâtü'l-Mesâbîh 1900-1901 (Buhârî-Müslim — sahih — meâl)",
    kaynakKunye: "Mishkât 1900–1901; Buhârî–Müslim; Enes b. Mâlik",
    olay:
      "Peygamber, «Her Müslüman bir ekin eker ya da bir ağaç dikerse; ondan insan, kuş veya hayvan yerse bu onun için sadaka olur» buyurdu.\n\n" +
      "Yani sadaka, yalnız elde taşınan bir şey değil; dikilen ağacın altında yürüyen kuşun payı da verenin defterine yazılır. İyilik, verenden sonra da işleyen bir şeydir.",
  },
  {
    kaynak: "Ebû Dâvûd, Zekât 1585 (hasen)",
    kaynakKunye: "Ebû Dâvûd, Zekât 1585; Ebû Hüreyre",
    olay:
      "Hadis iki suçu yan yana koyar: sadakayı fazla isteyip vereni bıktıran ve verilmesine engel olan. İkisi de aynı kapıyı kapatır.\n\n" +
      "Yani sadaka işinde ölçü, ne isteyenin iştahı ne mal sahibinin cimriliği; hakkın kendisidir. Hadis, memuru ve mükellefi aynı teraziye koyar.",
  },
  {
    kaynak: "Nesâî, Ziynet 5103 (hasen)",
    kaynakKunye: "Nesâî, Zînet; Ebû Hüreyre",
    olay:
      "Hadis, iki kapıyı birlikte kapatır: faizi alanı da veren de, haksızlık üzerinden sadaka toplayanı da kabul etmez.\n\n" +
      "Yani haramla kazanılıp sonra bir kısmı verilen mal, temizlik üretmez. Sadaka, kazancın kendisi temiz olduğunda anlam kazanır.",
  },
  {
    kaynak: "Ebû Dâvûd, Zekât 1675 (hasan)",
    kaynakKunye: "Ebû Dâvûd, Zekât 1675; İbn Abbas",
    olay:
      "Bir adam mescide ihtiyaç içinde girdi; Peygamber ashâbı sadaka vermeye teşvik etti. Cemaat hem elbiselik hem de verdiğini ona giydirdi.\n\n" +
      "Hadis, camiyi bir toplama yeri olarak gösterir: ihtiyaç, orada görülür ve orada kapatılır. Mescit, yalnız namaz kılınan bir yer değil; mahallenin nabzının atıldığı yerdir.",
  },
  {
    kaynak: "Ebû Dâvûd, Eymân ve Nüzûr 3321 (hasan)",
    kaynakKunye: "Ebû Dâvûd, Eymân 3321; Ka'b b. Mâlik",
    olay:
      "Tevbesi kabul edilen Ka'b b. Mâlik söyledi: «Tövbemin karşılığı olarak malımın üçte birini sadaka vermek istiyorum.» Peygamber buyurdu: «Üçte birini alıkoy; bu da çoktur.»\n\n" +
      "Yani şükür, kendini bitirmek değil; ölçülü vermektir. Ka'b'a sorulmadan cömertliği onaylanmadı — aile ve gelecek de hesaba katıldı.",
  },
  {
    kaynak: "Riyâdu's-Sâlihîn 326 (Buhârî-Müslim rivâyeti — meâl)",
    kaynakKunye: "Riyâzü's-sâlihîn 326; Buhârî–Müslim; Zeyneb es-Sekafiyye",
    olay:
      "Peygamber kadınlara sordu: «Hanginiz kocasının malından sadaka verir?» Kadınlar tereddüt etti. Zeyneb, kocası İbn Mesud'un yanına gidip sordu; İbn Mesud «Sana iki kişi cevap verir: Peygamber ve ben» dedi.\n\n" +
      "Sonra Peygamber'e gidip sorunca buyurdu: «Sizden birinin kocasına ve himayesindeki yetimlere verdiği sadaka, iki sevap kazandırır.» Yani ev içinde harcanan, ev dışında da sevap olarak yazılır.",
  },
  {
    kaynak: "Ebû Dâvûd, Zekât 1652 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Zekât 1652; Enes b. Mâlik",
    olay:
      "Peygamber yolda bir hurma bulup almak istedi, sonra durdu: «Sadaka (mahsulü) olabilir.»\n\n" +
      "Yani bir hurma bile hesap meselesi oldu. Sözün kaynağı hassasiyet: başkan, eline geçenin temiz olduğundan emin olmak zorundadır. Hadis, küçük bir meyve üzerinden devlet malına dokunan bir kural kurdu.",
  },
  {
    kaynak: "Ebû Dâvûd, Zekât 1593 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Zekât 1593; Ömer b. Hattâb",
    olay:
      "Hz. Ömer, Allah yolunda bağışladığı bir atı bir başkasının elinde görüp geri almak istedi. Peygamber buyurdu: «Onu geri alma; sadakasını geri alan, kusmuğunu yiyen gibidir.»\n\n" +
      "Benzetme sert ama sınır net: verilen sadaka, ellerden çıkmıştır. Geri dönüşü, onun kirlenmesi demektir. Hadis, infakın bir dönüş noktası olmadığını söyler.",
  },
  {
    kaynak: "Mishkâtü'l-Mesâbîh 1910 (Ahmed-Tirmizî rivâyeti — meâl)",
    kaynakKunye: "Mishkât 1910; Ahmed–Tirmizî; Ebû Zerr",
    olay:
      "Peygamber, «Her iyilik sadakadır» buyurdu; sonra sıraladı: kardeşini tebessümle karşılaman, kovandan kovana su dökmen, yoldan insanlara zarar veren bir şeyi kaldırman.\n\n" +
      "Yani sadaka, para biriminde değil; davranış biriminde hesaplanır. En küçük nezaket bile bir sadaka kalemi olarak defterde yer alır.",
  },
  {
    kaynak: "Nesâî, Zekât 2604 (sahih)",
    kaynakKunye: "Nesâî, Zekât 2604; Hakîm b. Hizâm",
    olay:
      "Peygamber, Hakîm'e buyurdu: «Sana istemeden bir şey verilirse onu tut; istemeye kalkmağı aç kalırsın.»\n\n" +
      "Yani mal, istenildiği için değil; karşılıksız geldiği için değerli. Hadis, istek kapısını kapalı, gönül kapısını açık tutmayı öğretir.",
  },
  {
    kaynak: "Nesâî, Zekât 2522 (sahih)",
    kaynakKunye: "Nesâî, Zekât 2522; Muâz b. Cebel",
    olay:
      "Peygamber, Muâz b. Cebel'i Yemen'e vali gönderdi; ona şu emri verdi: «Onlara bildir ki zekât (sadaka) mallarından alınır ve onların fakirlerine geri verilir.»\n\n" +
      "Yani zekât bir vergi değil, dolaşım: zenginin malından alınıp aynı yerdeki yoksula konur. Hadis, toplananın dağıtılmasını da emreder — para, yolda durmaz.",
  },
  {
    kaynak: "Müslim, Hac 1317a (sahih)",
    kaynakKunye: "Müslim, Hac 1317; Ali b. Ebî Tâlib",
    olay:
      "Peygamber, kurban işini Hz. Ali'ye verdiğinde ona şunu da tembihledi: «Kurbanın derilerini ve eyer örtülerini sadaka et; kasaba bunlardan bir şey verme.»\n\n" +
      "Yani kurban kesiminin emeği ayrı, kurbanın kendisi ayrıdır. Kasabın ücreti bir yerden ödenir; kurbanın etinden veya derisinden pay olarak değil. Hadis, ibadetin içine karışan küçük bir alışverişi bile ayıklar.",
  },
  {
    kaynak: "Ebû Dâvûd, Zekât 1620 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Zekât 1620; İbn Abbas",
    olay:
      "Peygamber, bayram namazından önce fıtır sadakasının verilmesini emretti.\n\n" +
      "Sıralama önemlidir: borç, bayram sabahına kalsın diye değil; yoksul bayram sabahına eli boş girmesin diye öne alınmıştır. Hadis, ibadeti bir komşusunun sofrasıyla birbirine bağlar.",
  },
  {
    kaynak: "Buhârî, Zekât 1511 (sahih)",
    kaynakKunye: "Buhârî, Zekât 1511; Abdullah b. Ömer",
    olay:
      "Hz. Ömer'in oğlu İbn Ömer, sadaka-i fıtri {küçük ve büyük, erkek ve kadın, hür ve köle herkese} bir sâ' hurma ya da arpa olarak verirdi.\n\n" +
      "Hesap, kişinin zenginliğine değil; evdeki her cana eşit pay düşmesine dayanır. Hadis, bayramı mahallenin tamamına yayar.",
  },
  {
    kaynak: "Mishkâtü'l-Mesâbîh 1871 (Ahmed-Ebû Dâvûd-Tirmizî — hasan)",
    kaynakKunye: "Mishkât 1871; Ahmed–Ebû Dâvûd–Tirmizî; Ebû Hüreyre",
    olay:
      "Peygamber, ölüm döşeğinde sadaka veren ya da köle azat eden kişiyi, yemekten doyduktan sonra tabak uzatıp ikram edene benzetti.\n\n" +
      "Benzetmenin anlamı şu: iş bitmiştir, verilen şey artık bir özür değildir. İyilik, imkân varken yapılır; elden hiçbir şey çıkmayacağı anı beklemek onu değersizleştirir.",
  },
  {
    kaynak: "Müslim, Zikr 103 (sahih — meâl)",
    kaynakKunye: "Müslim, Zikir 103; Ebû Hüreyre",
    olay:
      "Peygamber, kusur örtmenin karşılıklı olduğunu söyledi: kim bir müminin ayıbını örterse, Allah da onun kusurunu örter.\n\n" +
      "Aynı bâbda kederin giderilmesi ve işin kolaylaştırılması da sıralanır. Yani mahşerde örtülmek isteyen, dünyada başkasının ayıbını örtmelidir.",
  },
  {
    kaynak: "Buhârî, Edeb 60 (sahih — meâl)",
    kaynakKunye: "Buhârî, Edeb 60; Müslim, Zühd 14; Ebû Hüreyre",
    olay:
      "Peygamber, ölümden sonra kesilmeyen üç ameli saydı: sadaka-i câriye, faydalı ilim ve arkasından dua eden sâlih evlat.\n\n" +
      "Üçünde de ortak nokta şu: kişi artık çalışamazken ameli çalışmaya devam eder. Yani iyiliğin en değerlisi, senden sonra da nefes alanıdır.",
  },
  {
    kaynak: "Buhârî, Adâb 30 (sahih)",
    kaynakKunye: "Buhârî, Edeb; Müslim, Müsâkât 12; Enes b. Mâlik",
    olay:
      "Peygamber, «Kim bir fidan dikerse, ondan insan, hayvan ya da kuş yerse bu onun için sadaka olur» buyurdu.\n\n" +
      "Yani sadaka, verme anında bitmez; ağacın altında yürüyen her canlı, dikenin defterine bir satır yazar. Hadis, iyiliğin kalıcı olanına değer verir.",
  },
  {
    kaynak: "Ebû Dâvûd, Vitr 26 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Vitr 26; Muâz b. Cebel",
    olay:
      "Peygamber, Muâz'ın elinden tuttu ve «Allah'ım! Zikrine, şükrüne ve güzel ibâdetime bana yardım et» duasını öğretti.\n\n" +
      "Üçlü bir sıra: önce anmak, sonra teşekkür etmek, sonra ibadeti güzel yapmak. Yani ibadet, kendi çabasıyla değil, istenen bir yardımla başlar.",
  },
  {
    kaynak: "Ahmed b. Hanbel, Müsned 1/172 (meâl)",
    kaynakKunye: "Ahmed b. Hanbel, Müsned 1/172; Enes b. Mâlik",
    olay:
      "Hadis, imanı komşunun güveniyle ölçer: komşusu ondan emin olmadıkça kişi gerçek mümin sayılmaz.\n\n" +
      "Yani ölçü, kişinin kendi niyeti değil; karşısındakinin hissettiği emniyet. İyi niyet yetmez, komşunun rahat uyuması gerekir.",
  },
  {
    kaynak: "Müslim, İmân 64; Buhârî, Ate'ime 257 (sahih)",
    kaynakKunye: "Müslim, Birr 75; Buhârî, Et'ime 257; Âişe",
    olay:
      "Peygamber, «Allah râfîktir (yumuşaktır) ve yumuşaklığı sever» buyurdu.\n\n" +
      "Söz, sertliğin bir üstünlük olmadığını söyler: yumuşaklık, zayıflık değil; Allah'ın kendi sıfatından bir pay. Yumuşak davranan, sert davrandığında kaybettiği kapıyı açık tutar.",
  },
  {
    kaynak: "Ebû Dâvûd, Vitr 29; Tirmizî, Daavât 23 (sahih)",
    kaynakKunye: "Ebû Dâvûd, Vitr 29; Tirmizî, Daavât 23; Âişe",
    olay:
      "Hz. Âişe sordu: «Ey Allah'ın Resûlü, Kadir gecesine yetişirsem ne diyeyim?» Cevap: «Allah'ım! Sen Afüvv'sün, affı seversin; beni affet.»\n\n" +
      "Dua bir istek değil, bir sığınma: affı seven bir Allah'a, affedilmeyi bekleyen bir kulun seslenişi. Kadir gecesinin en kısa ve en derin duası bu oldu.",
  },
  {
    kaynak: "Müslim, Zikr 33 · Ebû Dâvûd, Âdâb (sahih)",
    kaynakKunye: "Müslim, Zühd 64; Ebû Dâvûd, Edeb; Suheyb",
    olay:
      "Suheyb'in naklettiği söz, müminin hayatını tek bir hesaba indirir: iyi gün şükür, kötü gün sabır; ikisi de hayır.\n\n" +
      "Yani müminin kazancı olaylarda değil, olaylara verdiği cevaptadır. Aynı haber iki kişiye gelir; fark, gelen şeyde değil, karşılayan kalptedir.",
  },
  // ═══ SON TAMAMLAMA ════════════════════════════════════════
  {
    kaynak: "Ahmed b. Hanbel, Müsned, 22977 (meâl)",
    kaynakKunye: "Ahmed b. Hanbel, Müsned; Nu'mân b. Beşîr",
    olay:
      "Peygamber, cennetle müjdelenen adamı üç sıfatla tarif etti: kalbi yumuşak, yakınına faydası dokunan, kimseye zararı olmayan.\n\n" +
      "Üçü de sessiz erdemlerdir: kimse görmeden yapılan iyilik, kimse duymadan taşınan yumuşak kalp. Hadis, cennetin kapısını gürültüsüz amellere açar.",
  },
  {
    kaynak: "Buhari, Hac, 4",
    kaynakKunye: "Buhârî, Hac 4; Müslim, Hac 438; Ebû Hüreyre",
    olay:
      "Peygamber'e «Haccın karşılığı nedir?» diye soruldu; cevabı kısa oldu: «Annesinden doğduğu gün gibi (günahsız) dönmektir.»\n\n" +
      "Şart da eklendi: hac sırasında fuhuştan ve günahtan kaçınmak. Yani yolculuğun kendisi değil, yolculukta korunan ahlâk temizler. Hac, bir yer değiştirme değil; bir başlangıca dönüştür.",
  },
  {
    kaynak: "Ebu Davud, İlim, 1 (meâl)",
    kaynakKunye: "Ebû Dâvûd, İlim 1; Enes b. Mâlik",
    olay:
      "Hadis, ilim yolcusunu iki büyük amele benzetir: Allah yolunda cihad edene ve şehide.\n\n" +
      "Benzetme abartı değil, bir ölçü: ilim, insanı cehaletin karanlığından çıkarır; bu da canla yapılan bir mücadele kadar ağır bir iştir. Yolculuk, kitabın kapağı açıldığı anda başlar.",
  },
  {
    kaynak: "Tirmizi, Sevâb, 16",
    kaynakKunye: "Tirmizî, Sevâbü'l-Kur'ân; Abdullah b. Mesud",
    olay:
      "Peygamber, Kur'an okuyanın her harfine on sevap yazılacağını söyledi.\n\n" +
      "Hesap şaşırtıcıdır: bir sayfa değil, bir harf. Yani Kur'an okumak, büyük bir iş yapmayı beklemeden, en küçük birimden başlayan bir kazançtır.",
  },
  {
    kaynak: "Ebû Dâvûd, Edeb · Tirmizî, Birr (hasan)",
    kaynakKunye: "Ebû Dâvûd, Edeb; Tirmizî, Birr; Abdullah b. Amr",
    olay:
      "Peygamber, «Rahmet edenlere Rahmân rahmet eder» buyurdu; sonra sınırı gösterdi: «Yeryüzünde olanlara merhamet edin ki gökte olan da size merhamet etsin.»\n\n" +
      "Yani merhamet, yalnız insana değil; yerdeki bütün canlıya yönelir. Gökteki rahmetin kapısı, yerde bir karıncaya gösterilen yumuşaklıktan geçer.",
  },
  {
    kaynak: "Buhârî, Yûnus 2 (sahih)",
    kaynakKunye: "Buhârî, Edeb 18; Müslim, Fedâil 66; Cerîr b. Abdullah",
    olay:
      "Peygamber, «Kim insanlara merhamet etmezse, ona da merhamet edilmez» buyurdu.\n\n" +
      "Yani merhamet, tek yönlü bir iyilik değil; karşılıklı bir kapıdır. Kapalı tutan, kendi kapısını da kapalı bulur. Hadis, şefkati bir duygu değil, bir alışveriş olarak tarif eder.",
  },
  {
    kaynak: "Müslim, İmân 189 (sahih)",
    kaynakKunye: "Müslim, Îmân 189; Ebû Hüreyre",
    olay:
      "Peygamber, zinanın yalnız bedenle işlenmediğini anlattı: «Gözün zinası harama bakmaktır, dilin zinası haram söylemektir; nefis ister, cinsel organ bunu ya tasdik eder ya yalanlar.»\n\n" +
      "Yani yasak, son anda başlamaz. Bir bakış, bir cümle, bir heves — hepsi aynı yolun basamaklarıdır.",
  },
  {
    kaynak: "Buhârî, Edeb rivâyeti · Tirmizî, Birr 2518 (sahih)",
    kaynakKunye: "Buhârî, Edeb; Tirmizî, Birr 2518; Hasan b. Ali",
    olay:
      "Hasan b. Ali, Peygamber'in şu sözünü ezberledi: «Şüpheli olanı, şüphesiz olana bırak.»\n\n" +
      "Kural iki adımdır: önce şüpheliyi bırak, sonra sağlama yapış. Yani huzur, emin olduğun şeyde durmaktır; kalbin titrediği yerde ısrar etmek değil.",
  },
];
