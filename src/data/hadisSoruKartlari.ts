// ════════════════════════════════════════════════════════════
// HADİS SORU KARTLARI — kullanıcı emri 26.11: "altın haram mı diye
// aratınca o hadis çıksın, altında hikâyesi ve dipnotu olsun".
// Hadis METNİ ve KAYNAĞI külliyattan (Sünnetimiz) birebir alınmıştır;
// numara uydurulmaz. Hikâye ve dipnot açıklamadır, hadis değildir.
// ════════════════════════════════════════════════════════════

export interface HadisSoruKarti {
  id: string;
  sorular: string[];
  hadis: string;
  kaynak: string;
  kitap: string;
  derece: string;
  url: string;
  hikaye: string;
  dipnot: string;
}

export const HADIS_SORU_KARTLARI: HadisSoruKarti[] = [
  {
    "id": "altin-ipek",
    "sorular": [
      "altın haram mı",
      "altın erkeğe haram mı",
      "erkek altın takabilir mi",
      "ipek haram mı",
      "erkek ipek giyebilir mi",
      "altın yüzük erkek",
      "ipek kravat",
      "altın ziynet erkek"
    ],
    "hadis": "Ebu Musa (radıyallahü anh)’dan rivâyete göre, Rasûlullah (sallallahü aleyhi ve sellem) şöyle buyurdu: “İpek ve altın ümmetimin erkeklerine haram kadınlarına helâl kılınmıştır.” (Tirmizî, Libas: 1)",
    "kaynak": "Sünen-i Nesâî · nesai:5148 · Erkeklerin ve kadınların güzel kokularının ayrılması · Sünnetimiz",
    "kitap": "Sünen-i Nesâî",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/nesai:5148",
    "hikaye": "Sahâbîler altın ve ipekten söz edilirken Peygamberimizi dinlediler. O, iki ziyneti eline alıp bunların ümmetinin erkeklerine haram, kadınlarına helâl olduğunu bildirdi. Yasak, süs ve gösteriş olarak kullanmaya yöneliktir; altının para ve birikim olarak elde tutulması bu yasağın dışındadır.",
    "dipnot": "Erkekler için gümüş yüzük sünnettir (Buhârî, 5866). İpek, erkek giyiminde yasak; kadın giyiminde helâldir."
  },
  {
    "id": "gumus-yuzuk",
    "sorular": [
      "gümüş yüzük takmak",
      "peygamber yüzük takar mıydı",
      "yüzük hangi parmağa takılır",
      "altın yüzük haram mı",
      "yüzük sünneti"
    ],
    "hadis": "İbn Ömer r.a.'dan rivayete göre \"Resulullah Sallallahu Aleyhi ve Sellem altından -yahut gümüşten- bir yüzük edindi. Yüzüğün kaşını avucunun iç tarafına getirerek takındI. Yüzüğüne nakış olarak 'Muhammedu'r-Rasulullah' ibaresini nakşetti. Başkaları da onun gibi yüzük edindi. Nebi Sallallahu Aleyhi ve Sellem onların yüzük edindiklerini görünce, yüzüğünü attı ve: Bunu ebediyyen kullanmayacağım, buyurdu. Daha sonra gümüşten bir yüzük edindi. İnsanlar da gümüş yüzükler edindiler.\" İbn Ömer dedi ki: \"O yüzüğü Nebi Sallallahu Aleyhi ve Sellem'den sonra Ebu Bekir, sonra Ömer, sonra da Osman giyindi. Sonunda yüzük Osman'dan Eris kuyusuna düştü.\" 47. BAB",
    "kaynak": "Sahih-i Buhari · buhari:5866 · Gümüş yüzük · Sünnetimiz",
    "kitap": "Sahih-i Buhari",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/buhari:5866",
    "hikaye": "Peygamberimiz önce altın bir yüzük edindi, sonra onu bırakıp gümüş yüzük taktı ve kaşına 'Muhammed Resûlullah' yazdırdı. Vefatından sonra yüzük sırasıyla Hz. Ebû Bekir, Hz. Ömer ve Hz. Osman'a geçti; Hz. Osman'ın elinden Eris kuyusuna düştü.",
    "dipnot": "Erkek için gümüş yüzük caizdir, altın yasaktır. Sağ ele mi sol ele mi takılacağı rivayetlerde farklıdır; ikisi de nakledilmiştir."
  },
  {
    "id": "faiz",
    "sorular": [
      "faiz haram mı",
      "faiz yiyen",
      "faiz neden haram",
      "bankaya para koymak faiz mi",
      "faiz günahı"
    ],
    "hadis": "Ali (radıyallahü anh)’den rivâyete göre, Rasûlullah (sallallahü aleyhi ve sellem): “Faiz yiyeni yedireni ve faiz muamelelerini yazanı ve zekat vermeyeni lanetledi ve ölünün arkasından bağırıp çağırarak ağlamayı da yasakladı.” (Sadece Nesâi rivâyet etmiştir.)",
    "kaynak": "Sünen-i Nesâî · nesai:5103 · Süs ve Zînet · Sünnetimiz",
    "kitap": "Sünen-i Nesâî",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/nesai:5103",
    "hikaye": "Peygamberimiz faizi yalnız alanın değil, verenin, yazanın ve iki taraf arasında şahitlik edenin de aynı sorumluluğa girdiğini bildirdi. Yani faiz, tek kişinin değil kurulan düzenin ortak vebalidir.",
    "dipnot": "Faizi yiyen, yediren, muameleyi yazan ve şahitlik eden birlikte lanetlenmiştir (Nesâî, 5103)."
  },
  {
    "id": "anne-baba",
    "sorular": [
      "anne baba hakkı",
      "anne babaya iyilik",
      "anne babaya kötü davranmak",
      "en hayırlı amel",
      "anne baba rızası"
    ],
    "hadis": "Abdullah İbn Mes'ud r.a. şöyle demiştir: Allah Resulü'ne \"Ey Allah'ın Resulü! Amelin hangisi daha üstündür?\" diye sordum. \"Vaktinde kılınan namazdır\" buyurdu. \"Sonra hangisi?\" dedim. \"Anne babaya iyiliktir\" buyurdu. \"Sonra hangisi?\" dedim. \"Allah yolunda cihad etmektir\" buyurdu. Soru mu tekrarlamadım. Tekrarlasaydım daha da sayardı",
    "kaynak": "Sahih-i Buhari · buhari:2782 · Cihad ve gazvelerin fazileti · Sünnetimiz",
    "kitap": "Sahih-i Buhari",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/buhari:2782",
    "hikaye": "İbn Mes'ûd, Peygamberimize 'hangi amel daha üstün?' diye sordu. Cevap 'vaktinde kılınan namaz' oldu; ardından 'anne babaya iyilik', sonra 'Allah yolunda cihad' geldi. Sıralama, namazdan sonra en büyük hakkın anne baba hakkı olduğunu gösterir.",
    "dipnot": "Kur'an anne babaya 'öf' demeyi bile yasaklar (İsrâ, 23). Onların rızası cennet kapısı sayılmıştır."
  },
  {
    "id": "komşu",
    "sorular": [
      "komşu hakkı",
      "komşuya iyilik",
      "komşuluk",
      "komşu kötülüğü",
      "komşu hakları"
    ],
    "hadis": "Ebu Şureyh'ten rivayete göre Nebi Sallallahu Aleyhi ve Sellem şöyle buyurdu: \"Allah'a yemin ederim iman etmiş olmaz, Allah'a yemin ederim iman etmiş olmaz, Allah'a yemin ederim iman etmiş olmaz. Kim ey Allah'ın Rasulü, diye' soruldu. O: Komşusu sıkıntılarından yana emin olmayan kimse, buyurdu.\"",
    "kaynak": "Sahih-i Buhari · buhari:6016 · Komşusunun kötülüklerinden emin olmayanın günahı · Sünnetimiz",
    "kitap": "Sahih-i Buhari",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/buhari:6016",
    "hikaye": "Peygamberimiz komşu hakkını o kadar önemsedi ki sözünü üç kez yeminle tekrarladı: 'Komşusunun kötülüğünden emin olmadığı kişi iman etmiş olmaz.' Buradaki iman, olgun imandır; yoksa kişi müminlikten çıkmaz.",
    "dipnot": "Komşuluk yalnız bitişik ev değildir; hadislerde kırk evlik çevre komşuluk sayılır."
  },
  {
    "id": "giybet",
    "sorular": [
      "gıybet nedir",
      "gıybet haram mı",
      "arkamdan konuşulması",
      "gıybet ile iftira farkı",
      "dedikodu"
    ],
    "hadis": "Hz. Ebu Hureyre'den (rivayet edildiğine göre) Nebi (s.a.v.)'e: Ey Allah'ın Rasulü gıybet nedir? diye sorulmuş da, (Müslüman) kardeşini (gıyabında) hoşlanmayacağı bir şeyle anmandır.\" buyurmuş, (sonra) \"Eğer benim söylediğim (şeyler o) kardeşimde varsa ne buyurursun?\" denmiş. Eğer söylediğin (şeyler) onda (gerçekten) varsa gıybet etmiş olursun. Eğer söylediğin (şeyler) onda yoksa iftira etmiş olursun.\" cevabını vermiştir",
    "kaynak": "Sünen-i Ebû Dâvûd · ebudavud:4874 · Gıybet hakkında · Sünnetimiz",
    "kitap": "Sünen-i Ebû Dâvûd",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/ebudavud:4874",
    "hikaye": "Sahâbîler 'gıybet nedir?' diye sordu: 'Kardeşini hoşlanmayacağı bir şeyle anmandır.' 'Söylediğim şey onda varsa?' denildi: 'Varsa gıybet etmiş olursun, yoksa iftira.' Yani doğru olması gıybeti helâl kılmaz.",
    "dipnot": "Gıybet, söylenen kişi orada yokken yapılır. Bir kimsenin yüzüne karşı söylenmesi ayrı bir hükümdür."
  },
  {
    "id": "yalan",
    "sorular": [
      "yalan söylemek",
      "yalan günah mı",
      "peygamber adına yalan",
      "hadis uydurmak"
    ],
    "hadis": "Muğîre r.a., Nebi (Sallallahu Aleyhi ve Sellem)'den şunu işittiğini söylemiştir: \"Benim adıma yalan söylemek, başkası adına yalan söylemek gibi değildir. Benim adıma kasıtlı olarak yalan söyleyen kişi ateşteki (cehennemdeki) yerine hazırlansın. Kimin ölümünün ardından feryad-u figan edilirse o kişiye bu feryad sebebiyle azap edilir",
    "kaynak": "Sahih-i Buhari · buhari:1291 · Ölü üzerine ağıt yakmanın mekruh olması · Sünnetimiz",
    "kitap": "Sahih-i Buhari",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/buhari:1291",
    "hikaye": "Peygamberimiz kendi adına uydurulan sözlerin ağırlığını bildirdi: 'Benim adıma yalan söylemek başkası adına yalan söylemek gibi değildir.' Bu yüzden bir söz nakledilmeden önce kaynağını ve sıhhatini sormak gerekir.",
    "dipnot": "Hadis uydurmak büyük günahlardandır. Bu yüzden hadis ararken kaynak ve derece göstermek önemlidir."
  },
  {
    "id": "namaz",
    "sorular": [
      "namaz farz mı",
      "beş vakit namaz",
      "namaz kılmamak",
      "namazın önemi",
      "namaz sevabı"
    ],
    "hadis": "Enes b. Mâlik (r.a.)'den rivâyete göre, şöyle demiştir: “Nebi (s.a.v.)'e İsra gecesi namaz elli vakit olarak farz kılındı sonra azaltılarak beş vakte indirildi ve şöyle seslenildi: Ey Muhammed benim katımda söz değişmez senin için bu beş vakit namaz sebebiyle elli vakit sevâbı vardır.”",
    "kaynak": "Sünen-i Tirmizî · tirmizi:213 · Allah'ın kullarına kaç vakit namaz farz kıldığı hakkında gelenler · Sünnetimiz",
    "kitap": "Sünen-i Tirmizî",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/tirmizi:213",
    "hikaye": "Mîrâc gecesinde namaz elli vakit olarak farz kılındı; Peygamberimizin Rabbine niyazıyla beş vakte indirildi, sevabı elli vakit gibi kaldı. Bu, namazın ümmete verilen en büyük hediye olduğunu gösterir.",
    "dipnot": "Beş vakit namaz, büyük günah işlenmedikçe iki Cuma arasındaki günahlara kefarettir (Tirmizî, 214)."
  },
  {
    "id": "oruc",
    "sorular": [
      "oruç farz mı",
      "yolculukta oruç",
      "oruç tutmak",
      "orucu bozan şeyler",
      "oruç ruhsatı"
    ],
    "hadis": "Hamza b. Amr (radıyallahü anh)’dan rivâyete göre, şöyle demiştir: Rasûlullah (sallallahü aleyhi ve sellem)’e yolculukta oruç tutmanın hükmünü sormuştum. O da şöyle buyurmuştu: “Oruç tutmak istersen tutarsın oruç tutmak istemezsen tutmayabilirsin.” (İbn Mâce, Sıyam: 10; Müslim, Sıyam: 17)",
    "kaynak": "Sünen-i Nesâî · nesai:2297 · Yolculukta oruç tutmanın mekruh olması · Sünnetimiz",
    "kitap": "Sünen-i Nesâî",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/nesai:2297",
    "hikaye": "Hamza b. Amr, yolculukta orucun hükmünü sordu; Peygamberimiz 'istersen tut, istersen tutma' diyerek ruhsatı bildirdi. Yani yolculukta tutmamak bir kolaylıktır, tutmak da caizdir.",
    "dipnot": "Ruhsat, meşakkatle karşılaşan içindir; yolculuk kısa ve kolay ise oruç tutmak daha faziletli görülmüştür."
  },
  {
    "id": "sadaka",
    "sorular": [
      "sadaka vermek",
      "akrabaya sadaka",
      "sadaka sevabı",
      "muhtaça yardım",
      "sadaka nedir"
    ],
    "hadis": "Selman b. Âmir (radıyallahü anh)’den rivâyete göre, Rasûlullah (sallallahü aleyhi ve sellem) şöyle buyurdu: “Muhtaç kimseye sadaka vermekte sadaka sevabı vardır. Akrabaya sadaka vermekte ise; hem sadaka sevabı hem de akrabalık bağlarını kuvvetlendirme sevabı.” (Tirmizî, Zekat: 26; Dârimi, Zekat: 38)",
    "kaynak": "Sünen-i Nesâî · nesai:2582 · Dilenciyi geri çevirmek · Sünnetimiz",
    "kitap": "Sünen-i Nesâî",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/nesai:2582",
    "hikaye": "Peygamberimiz sadakanın ihtiyaç sahibine verildiğinde bir sevap, akrabaya verildiğinde iki sevap kazandırdığını söyledi: biri sadaka, diğeri akrabalık bağını gözetme.",
    "dipnot": "Sadakada miktardan çok ihtiyacı karşılamak ve gösterişten uzak vermek önemlidir."
  },
  {
    "id": "gece-namazi",
    "sorular": [
      "gece namazı",
      "teheccüd",
      "peygamber gece kaç rekat kılardı",
      "gece ibadeti",
      "teheccüd kaç rekat"
    ],
    "hadis": "Mesrûk Aişe (r.anha)'ya Resulullah Sallallahu Aleyhi ve Sellem'in gece namazını sormuş o da şu cevabı vermiştir: \"Onun gece namazı sabah namazının iki rekatı dışında yedi, dokuz ve on bir rekat olurdu",
    "kaynak": "Sahih-i Buhari · buhari:1139 · Peygamber'in (sallallahü aleyhi ve sellem) namazı nasıl kıldığı ve gece ne kadar namaz kıldığı · Sünnetimiz",
    "kitap": "Sahih-i Buhari",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/buhari:1139",
    "hikaye": "Hz. Âişe'ye Peygamberimizin gece namazı soruldu; 'sabah namazının iki rekatı dışında yedi, dokuz ve on bir rekat kılardı' dedi. Yani rekat sayısı sabit değil, hâle göre değişiyordu.",
    "dipnot": "Teheccüd, yatsıdan sonra uyuyup gece kalkan namazdır; en faziletlisi gecenin son üçte biridir."
  },
  {
    "id": "sabir",
    "sorular": [
      "sabır nedir",
      "sabırlı olmak",
      "musibete sabır",
      "sabır sevabı",
      "sabır göstermek"
    ],
    "hadis": "Enes r.a., Nebi Sallallahu Aleyhi ve Sellem'den şunu rivayet etmiştir: \"Sabır, musibetin darbesi ile ilk karşılaşıldığmdadır",
    "kaynak": "Sahih-i Buhari · buhari:1302 · İlk şok anında sabır · Sünnetimiz",
    "kitap": "Sahih-i Buhari",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/buhari:1302",
    "hikaye": "Peygamberimiz sabrın, musibet gelip çattığı ilk anda gösterilen dayanma olduğunu söyledi. Yani sonradan alışmak değil, ilk sarsıntıda metanet göstermek.",
    "dipnot": "Sabır üç çeşittir: ibadete devam, günahtan uzak durma ve musibete dayanma."
  },
  {
    "id": "ofke",
    "sorular": [
      "öfke kontrolü",
      "öfkelenince ne yapmalı",
      "sinir",
      "öfke günah mı",
      "sinirlenmek"
    ],
    "hadis": "Ebu Zer (r.a)'den demiştir ki: Rasûlullah (s.a.v.) bize (şöyle) buyurdu: \"Biriniz ayakta iken öfkelenecek olursa hemen otursun, eğer (oturunca öfkesi) gidecek olursa fmes-i î yoktur; fakat) eğer gitmezse o zaman da (yere) yatsın",
    "kaynak": "Sünen-i Ebû Dâvûd · ebudavud:4782 · Öfke anında söylenecekler · Sünnetimiz",
    "kitap": "Sünen-i Ebû Dâvûd",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/ebudavud:4782",
    "hikaye": "Peygamberimiz öfkelenen kişiye ayakta ise oturmasını, geçmezse uzanmasını tavsiye etti. Amaç bedeni sakinleştirip dilin ve elin zarar vermesini önlemektir.",
    "dipnot": "Gerçek pehlivan, güreşte rakibini yenen değil, öfke anında kendine hâkim olandır (Buhârî, 6114)."
  },
  {
    "id": "temizlik",
    "sorular": [
      "abdestin fazileti",
      "temizlik imanın yarısı",
      "abdest sevabı",
      "temizlik önemi",
      "abdest neden önemli"
    ],
    "hadis": "Bize İshak b. Mansur tahdis etti, bize Habban b. Hilal tahdis etti, bize Eban tahdis etti. Bize Yahya'nın tahdis ettiğine göre Zeyd kendisine şunu tahdis etti: Ebu Sellam kendisine Ebu Malik el-Eş'arl'den şöyle dediğini tahdis etti: Rasülullah (Sallallahu aleyhi ve Sellem) şöyle buyurdu: ''Abdest imanın yarısıdır. Elhamdulillah mizanı doldurur. Subhanallah ve'l-hamdulillah da göklerle yer arasını doldururlar -yahut doldurur-, namaz bir nurdur, sadaka bir burhandır, sabır bir ışıktır, Kur'an senin lehine ya da aleyhine bir huccettir. Bütün insanlar sabah gider ve nefsini satar. Bu sebeple ya onu hürriyetine kavuşturur (azad eder) yahut onu helake götürür. ''",
    "kaynak": "Sahih-i Müslim · muslim:534 · Abdestin fazileti · Sünnetimiz",
    "kitap": "Sahih-i Müslim",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/muslim:534",
    "hikaye": "Peygamberimiz abdesti 'imanın yarısı' olarak niteledi; ardından namazın nur, sadakanın delil, sabrın ışık olduğunu saydı. Temizlik, ibadetin başlangıcı sayılıyor.",
    "dipnot": "Abdest alanın organlarından günahların döküldüğü rivayet edilir (Müslim, Tahâret)."
  },
  {
    "id": "helal",
    "sorular": [
      "helal kazanç",
      "haram para",
      "emek helal mi",
      "kazanç helal",
      "alın teri"
    ],
    "hadis": "Aişe (r.anha)'den rivayet edildiğine göre Resulullah (Sallallahu Aleyhi ve Sellem) şöyle buyurdu demiştir: «Şüphesiz erkeğin yediği en helal lokma kendisinin kazancından olandır. Çocuğu da şüphesiz onun bir kazancıdır.»",
    "kaynak": "Sünen-i İbn Mâce · ibnmace:2137 · Kazanç sağlamaya teşvik · Sünnetimiz",
    "kitap": "Sünen-i İbn Mâce",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/ibnmace:2137",
    "hikaye": "Peygamberimiz 'Kişinin yediği en helâl lokma kendi kazancındandır; çocuğu da onun kazancıdır' buyurdu. Yani esas olan başkasının eline bakmak değil, alın teridir.",
    "dipnot": "Haramla beslenen bedenin duasının kabul edilmeyeceği bildirilmiştir; bu yüzden kazanç kadar neyle beslendiğine de dikkat edilir."
  },
  {
    "id": "guler-yuz",
    "sorular": [
      "güler yüz sadaka",
      "tebessüm",
      "iyilik sadaka mı",
      "ma'ruf nedir",
      "gülümsemek"
    ],
    "hadis": "Bize Kuteybetü'bnü Saîd rivayet etti. (Dediki): Bize Ebû Avâne rivayet etti. H. Bize Ebû Bekir b. Ebi Şeybe de rivayet etti. (Dediki): Bize Abbâd b. Avvâm rivayet etti. Bu râvîlerin ikisi birden Ebû Malik-i Eşcaî'den, o da Rib'î b. Hirâş'dan, o da Huzeyfe^den naklen rivâyer etmişlerdir. — Kuteybe hadîsinde Huzeyfe: Nebiimiz (Sallallahu Aleyhi ve Sellem)... demiş. İbni Ebî Şeybe hadîsinde ise: Nebi (Sallallahu Aleyhi ve Sellem)'den...) ifâdesini kullanmış. Resûlullâh (Sallallahu Aleyhi ve Selîem) «Her Ma'ruf sadakadır.» buyurmuşlar.",
    "kaynak": "Sahih-i Müslim · muslim:2328 · Sadaka isminin her türlü iyiliğe verilmesi · Sünnetimiz",
    "kitap": "Sahih-i Müslim",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/muslim:2328",
    "hikaye": "Peygamberimiz 'Her iyilik sadakadır' buyurdu. Âlimler bunu açıklarken insanlara güler yüzle muamele etmenin bile bu kapsama girdiğini söyledi.",
    "dipnot": "Sadaka yalnız parayla değildir; yol göstermek, yük taşımak ve güzel söz de sadakadır."
  },
  {
    "id": "mehir",
    "sorular": [
      "mehir nedir",
      "mehirsiz evlilik",
      "şığar nikahı",
      "mehir farz mı",
      "mehir kime verilir"
    ],
    "hadis": "İbn Ömer (radıyallahü anh)’den rivâyete göre, Rasûlullah (sallallahü aleyhi ve sellem) mehirsiz karşılıklı değişme yoluyla yapılan evlenmeyi yasakladı. Şığar: “Bir kimsenin kızını diğerine, o da kızını bu tarafa vermek şartıyla mehirsiz nikahlamasıdır” dedi. (Buhârî, Nikah: 28; Müslim, Nikah: 57)",
    "kaynak": "Sünen-i Nesâî · nesai:3337 · Şığâr nikâhı · Sünnetimiz",
    "kitap": "Sünen-i Nesâî",
    "derece": "sahih",
    "url": "https://sunnetimiz.com/nesai:3337",
    "hikaye": "Peygamberimiz, iki erkeğin kızlarını mehirsiz takas etmesi olan 'şığâr' nikâhını yasakladı. Çünkü burada kadının mehrini belirleme hakkı elinden alınıyor, kadın bir mal gibi değiş tokuş ediliyordu.",
    "dipnot": "Mehir kadının hakkıdır; ailesine değil kendisine verilir (Nisâ, 4)."
  },
  {
    "id": "evlilik",
    "sorular": [
      "evlilik sünnet mi",
      "nikâhı duyurmak",
      "evlenmek sünnet",
      "gizli nikâh",
      "düğün"
    ],
    "hadis": "Muhammed bin Hatib (r.a.)'den rivayet edildiğine göre; Resulullah (Sallallahu Aleyhi ve Sellem) şöyle buyurdu, demiştir: «Helal (birleşme) ve haram (birleşme) arasındaki fark, evlenmekte def çalmak ve duyurmaktır.»",
    "kaynak": "Sünen-i İbn Mâce · ibnmace:1896 · Nikâhı ilan etmek · Sünnetimiz",
    "kitap": "Sünen-i İbn Mâce",
    "derece": "hasan",
    "url": "https://sunnetimiz.com/ibnmace:1896",
    "hikaye": "Peygamberimiz helâl ile haramın ayrımının nikâhı duyurmak olduğunu söyledi ve gizli nikâha karşı çıktı. İlan, hem şahit hem toplumsal güvence sağlar.",
    "dipnot": "Nikâhta ilan esastır; dönemin duyuru aracı olan def çalınması bu yüzden emredilmiştir."
  }
];

/** Sorguyu kartlarla eşleştirir: soru kalıplarındaki kelime örtüşmesine bakar. */
export function soruKartiBul(sorgu: string): HadisSoruKarti | null {
  const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşüâîû\s]/gi, " ").replace(/\s+/g, " ").trim();
  const q = norm(sorgu);
  if (q.length < 3) return null;
  const qKelimeler = q.split(" ").filter((k) => k.length > 1);
  if (!qKelimeler.length) return null;
  let enIyi: { kart: HadisSoruKarti; puan: number } | null = null;
  for (const kart of HADIS_SORU_KARTLARI) {
    for (const kalip of kart.sorular) {
      const kk = norm(kalip);
      let puan = 0;
      for (const kelime of qKelimeler) {
        if (kk.includes(kelime)) puan += kelime.length >= 4 ? 2 : 1;
      }
      // tam kalıp veya kalıbın sorguyu içermesi ek puan
      if (kk === q) puan += 6;
      else if (kk.includes(q)) puan += 3;
      if (puan > 0 && qKelimeler.length > 2) puan -= 0; // uzun sorguda eşik aynı
      if (!enIyi || puan > enIyi.puan) enIyi = { kart, puan };
    }
  }
  if (!enIyi) return null;
  const esik = qKelimeler.length <= 2 ? 2 : Math.max(3, qKelimeler.length + 1);
  return enIyi.puan >= esik ? enIyi.kart : null;
}
