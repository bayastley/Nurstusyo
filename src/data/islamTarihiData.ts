// ════════════════════════════════════════════════════════
// ISLAMTARIHIDATA.TS — İslam Tarihi Zaman Tüneli (yol haritası madde 9)
// 5 dönem · 41 olay. Kronolojik sıra: doğum → nübüvvet → Mekke → Medine →
// Hulefâ-yi Râşidîn → İslâm medeniyeti.
//
// ★ SAHİHLİK İLKESİ (kullanıcı emri: "her içerik sahih olsun"):
//   • Tarihler klasik siyer/tarih kaynaklarına (İbn Hişâm, Taberî, İbnü'l-Esîr,
//     İbn Kesîr, Belâzürî) ve Buhârî-Müslim'in ilgili kitap/bölümlerine dayanır.
//   • Rivayet ihtilaflı ise "yaklaşık / hicrî şu yıl" ifadesiyle verilir; kesin
//     olmayan tarih kesinmiş gibi yazılmaz.
//   • Menkıbe/uydurma anlatı yoktur; her olayın yanında kaynak gösterilir.
// ════════════════════════════════════════════════════════

export interface TarihOlay {
  /** Görünen tarih etiketi: "571", "624 (2/17 Ramazan)" gibi */
  tarih: string;
  baslik: string;
  ozet: string;
  kaynak: string;
}

export interface TarihDonem {
  id: string;
  ad: string;
  aralik: string;
  emoji: string;
  renk: string;
  olaylar: TarihOlay[];
}

export const TARIH_KAYNAK_NOTU =
  "Kaynaklar: İbn Hişâm, es-Sîre · Taberî, Târîhu'l-ümem · İbnü'l-Esîr, el-Kâmil fi't-târîh · İbn Kesîr, el-Bidâye ve'n-nihâye · Belâzürî, Fütûhu'l-büldân · Buhârî, Megâzî · Müslim, Cihâd. İhtilaflı tarihler \"yaklaşık\" kaydıyla verilmiştir.";

export const TARIH_DONEMLERI: TarihDonem[] = [
  // ───────────────── 1 ─────────────────
  {
    id: "nubuvvet-oncesi",
    ad: "Doğum ve Nübüvvet Öncesi",
    aralik: "571 – 610",
    emoji: "🌄",
    renk: "amber",
    olaylar: [
      {
        tarih: "571",
        baslik: "Doğumu (Fil Yılı)",
        ozet:
          "Hz. Muhammed (s.a.v.) Mekke'de, Kureyş'in Hâşimoğulları kolundan Abdullah ile Âmine'nin oğlu olarak dünyaya geldi. Babası o doğmadan önce vefat etmişti. Tarih, Fil Vakası yılı olarak bilinir.",
        kaynak: "İbn Hişâm, es-Sîre, I; Buhârî, Mevlid/Embiyâ",
      },
      {
        tarih: "571 – 576",
        baslik: "Sütannelik ve çocukluk",
        ozet:
          "Sütannesi Halîme'nin yanında büyüdü; dört-beş yaşlarında annesinin yanına döndü. Annesi Âmine 576-577 civarında, Medine dönüşünde vefat etti.",
        kaynak: "İbn Hişâm, es-Sîre, I",
      },
      {
        tarih: "579",
        baslik: "Dedesinin vefatı, amcanın himayesi",
        ozet:
          "Sekiz yaşlarında dedesi Abdülmuttalib vefat etti; himayesini amcası Ebû Tâlib üstlendi. Gençliği çobanlık ve ticaretle geçti.",
        kaynak: "İbn Hişâm, es-Sîre, I; Buhârî, Mevlid",
      },
      {
        tarih: "595",
        baslik: "Hz. Hatice ile evliliği",
        ozet:
          "Yirmi beş yaşlarında, ticaret ortağı ve ilk inanan Hz. Hatice ile evlendi. Bu evlilik yirmi beş yıl sürdü; altı çocuğu oldu.",
        kaynak: "İbn Hişâm, es-Sîre, I; Buhârî, Nikâh",
      },
      {
        tarih: "605",
        baslik: "Hacerü'l-Esved'in yerine konması",
        ozet:
          "Kâbe'nin onarımında Hacerü'l-Esved'i yerine koyma şerefi Kureyş kabileleri arasında tartışma çıkardı. Otuz beş yaşındaki Hz. Muhammed'in hakemliği ile çözüldü.",
        kaynak: "İbn Hişâm, es-Sîre, I",
      },
    ],
  },

  // ───────────────── 2 ─────────────────
  {
    id: "mekke",
    ad: "Mekke Dönemi",
    aralik: "610 – 622",
    emoji: "🕋",
    renk: "emerald",
    olaylar: [
      {
        tarih: "610",
        baslik: "İlk vahiy: Nur Dağı, Hira",
        ozet:
          "Kırk yaşında Hira mağarasında Cebrâil (a.s.) \"Oku!\" emriyle ilk vahyi getirdi: Alak sûresinin ilk âyetleri. Bu, nübüvvetin başlangıcıdır.",
        kaynak: "Alak 96:1-5; Buhârî, Bed'ü'l-vahy",
      },
      {
        tarih: "610 – 613",
        baslik: "Gizli davet dönemi",
        ozet:
          "Üç yıl süren gizli davette Hz. Hatice, Hz. Ebû Bekir, Hz. Ali ve Zeyd b. Hârise ilk Müslümanlar arasında yer aldı. İlk müslümanların sayısı kısa sürede arttı.",
        kaynak: "İbn Hişâm, es-Sîre, I; Buhârî, Bed'ü'l-vahy",
      },
      {
        tarih: "613",
        baslik: "Safâ'da açık davet",
        ozet:
          "\"Emrolunduğun şeyi açıkça bildir\" âyetiyle davet alenîleşti. Mekkeli müşriklerin baskısı ve alayı başladı.",
        kaynak: "Hicr 15:94; İbn Hişâm, es-Sîre, I",
      },
      {
        tarih: "615",
        baslik: "Habeşistan'a ilk hicret",
        ozet:
          "Baskı artınca bir grup Müslüman, adil hükümdar Necâşî'nin ülkesi Habeşistan'a hicret etti. Bu, İslâm'ın ilk hicretidir.",
        kaynak: "İbn Hişâm, es-Sîre, I; Buhârî, Menâkıbü'l-ensâr",
      },
      {
        tarih: "616",
        baslik: "Hz. Hamza ve Hz. Ömer'in İslâm'a girişi",
        ozet:
          "Hz. Hamza ve ardından Hz. Ömer Müslüman oldu. Müslümanlar Kâbe'de açıkça namaz kılmaya başladı.",
        kaynak: "İbn Hişâm, es-Sîre, I; İbnü'l-Esîr, el-Kâmil, II",
      },
      {
        tarih: "617 – 619",
        baslik: "Boykot yılları",
        ozet:
          "Hâşimoğullarına karşı üç yıl süren alışveriş ve evlilik boykotu uygulandı; Müslümanlar Şi'b-i Ebû Tâlib'de açlıkla imtihan edildi.",
        kaynak: "İbn Hişâm, es-Sîre, I",
      },
      {
        tarih: "619",
        baslik: "Hüzün yılı",
        ozet:
          "Amcası Ebû Tâlib ve eşi Hz. Hatice kısa aralıkla vefat etti. Himaye zayıfladı; Tâif yolculuğu ve taşlanma olayı bu dönemdedir.",
        kaynak: "İbn Hişâm, es-Sîre, II; Buhârî, Menâkıb",
      },
      {
        tarih: "620",
        baslik: "İsrâ ve Mi'râc",
        ozet:
          "Hz. Peygamber, Mescid-i Harâm'dan Mescid-i Aksâ'ya götürüldü ve mi'râcla yükseltildi; beş vakit namaz farz kılındı.",
        kaynak: "İsrâ 17:1; Necm 53:1-18; Buhârî, Salât",
      },
      {
        tarih: "621",
        baslik: "Birinci Akabe Biatı",
        ozet:
          "Medine'den gelen on iki kişi Akabe'de Hz. Peygamber'e biat etti; İslâm Medine'de yayılmaya başladı.",
        kaynak: "İbn Hişâm, es-Sîre, II; Buhârî, Menâkıbü'l-ensâr",
      },
      {
        tarih: "622",
        baslik: "İkinci Akabe Biatı ve Hicret",
        ozet:
          "Yetmiş üç kişi Akabe'de biat etti. Ardından Hz. Peygamber, Hz. Ebû Bekir ile Medine'ye hicret etti; Sevr mağarasında üç gün kaldılar.",
        kaynak: "Tevbe 9:40; İbn Hişâm, es-Sîre, II; Buhârî, Menâkıbü'l-ensâr",
      },
    ],
  },

  // ───────────────── 3 ─────────────────
  {
    id: "medine",
    ad: "Medine Dönemi",
    aralik: "622 – 632",
    emoji: "🕌",
    renk: "sky",
    olaylar: [
      {
        tarih: "622 – 623",
        baslik: "Mescid-i Nebevî ve Medine Sözleşmesi",
        ozet:
          "Hicretin ilk yılında Mescid-i Nebevî inşa edildi; muhacirlerle ensar kardeşleştirildi. Yahudi kabileleriyle Medine Vesikası imzalandı.",
        kaynak: "İbn Hişâm, es-Sîre, II; Buhârî, Menâkıbü'l-ensâr",
      },
      {
        tarih: "623",
        baslik: "Kıblenin değişmesi",
        ozet:
          "Hicretin ikinci yılında kıble, Kudüs'teki Mescid-i Aksâ'dan Mekke'deki Kâbe'ye çevrildi.",
        kaynak: "Bakara 2:144; Buhârî, Tefsîr",
      },
      {
        tarih: "624 (2/17 Ramazan)",
        baslik: "Bedir Gazvesi",
        ozet:
          "Müslümanlarla Mekke müşrikleri arasındaki ilk büyük savaş. Sayıca çok az olan Müslümanlar kesin bir zafer kazandı; Kur'ân buna \"Furkan günü\" der.",
        kaynak: "Âl-i İmrân 3:123-126; İbn Hişâm, es-Sîre, II; Buhârî, Megâzî",
      },
      {
        tarih: "624",
        baslik: "Ramazan orucu ve zekâtın farz kılınması",
        ozet:
          "Bedir yılında Ramazan orucu farz kılındı; fıtır sadakası ve zekât hükümleri bu dönemde uygulanmaya başladı.",
        kaynak: "Bakara 2:183-185, 2:110; Buhârî, Savm",
      },
      {
        tarih: "625 (3/Şevval)",
        baslik: "Uhud Gazvesi",
        ozet:
          "Okçuların mevziden ayrılmasıyla savaşın seyri değişti; Hz. Hamza şehit oldu. Kur'ân bu olaydan ders çıkarılmasını ister.",
        kaynak: "Âl-i İmrân 3:152-155; İbn Hişâm, es-Sîre, III; Buhârî, Megâzî",
      },
      {
        tarih: "626 – 627",
        baslik: "Hendek (Ahzâb) Gazvesi",
        ozet:
          "Mekke müşrikleri ve müttefikleri Medine'yi kuşattı; Selmân-ı Fârisî'nin teklifiyle kazılan hendek savunmayı sağladı. Kuşatma yaklaşık bir ay sürdü ve bozuldu.",
        kaynak: "Ahzâb 33:9-25; Buhârî, Megâzî",
      },
      {
        tarih: "628 (6/Zilkade)",
        baslik: "Hudeybiye Antlaşması",
        ozet:
          "Umre için yola çıkan Müslümanlarla Mekkeliler arasında on yıllık barış antlaşması yapıldı. Kur'ân bunu \"apaçık bir fetih\" olarak nitelendirdi.",
        kaynak: "Fetih 48:1-3; Buhârî, Şurût",
      },
      {
        tarih: "628",
        baslik: "Hayber'in fethi ve komşu devletlere mektuplar",
        ozet:
          "Hudeybiye sonrası Hayber fethedildi. Hz. Peygamber Bizans, Sâsânî, Habeş ve Mısır yöneticilerine İslâm'a davet mektupları gönderdi.",
        kaynak: "İbn Hişâm, es-Sîre, III; Buhârî, Megâzî",
      },
      {
        tarih: "629",
        baslik: "Mûte Seferi ve Umretü'l-kazâ",
        ozet:
          "Mûte'de Zeyd b. Hârise, Cafer b. Ebû Tâlib ve Abdullah b. Revâha şehit oldu. Aynı yıl antlaşma gereği kaza umresi yapıldı.",
        kaynak: "Buhârî, Megâzî; İbn Hişâm, es-Sîre, IV",
      },
      {
        tarih: "630 (8/20 Ramazan)",
        baslik: "Mekke'nin fethi",
        ozet:
          "Antlaşmanın bozulması üzerine Hz. Peygamber on bin kişilik orduyla Mekke'ye girdi. Genel af ilan edildi, Kâbe putlardan temizlendi.",
        kaynak: "Fetih 48:27; İbn Hişâm, es-Sîre, IV; Buhârî, Megâzî",
      },
      {
        tarih: "630",
        baslik: "Huneyn ve Tâif",
        ozet:
          "Fetih sonrası Hevâzin ve Sakîf kabileleriyle Huneyn'de savaşıldı; kuşatılan Tâif daha sonra kendiliğinden İslâm'a girdi.",
        kaynak: "Tevbe 9:25-26; Buhârî, Megâzî",
      },
      {
        tarih: "631 (9)",
        baslik: "Tebük Seferi ve \"Senetler Yılı\"",
        ozet:
          "Bizans'a karşı son sefer olan Tebük düzenlendi. Aynı yıl Arap kabileleri heyetler hâlinde İslâm'a girdi; zekât memurları gönderildi.",
        kaynak: "Tevbe 9:117-118; Taberî, Târîh, III",
      },
      {
        tarih: "632 (10)",
        baslik: "Vedâ Haccı ve Veda Hutbesi",
        ozet:
          "Hz. Peygamber yaklaşık yüz bin Müslümanla hacca gitti; Arafat'ta can, mal ve namusun dokunulmazlığını ilan eden hutbeyi okudu.",
        kaynak: "Buhârî, Hac; Müslim, Hac",
      },
      {
        tarih: "632 (11/12 Rebiülevvel)",
        baslik: "Vefatı",
        ozet:
          "Hz. Peygamber Medine'de vefat etti ve Mescid-i Nebevî'deki odasına defnedildi. \"Bugün size dininizi tamamladım\" âyeti bu döneme işaret eder.",
        kaynak: "Mâide 5:3; Buhârî, Megâzî; İbn Hişâm, es-Sîre, IV",
      },
    ],
  },

  // ───────────────── 4 ─────────────────
  {
    id: "hulefa",
    ad: "Hulefâ-yi Râşidîn",
    aralik: "632 – 661",
    emoji: "⚖️",
    renk: "violet",
    olaylar: [
      {
        tarih: "632 – 634",
        baslik: "Hz. Ebû Bekir'in hilafeti",
        ozet:
          "İlk halife Hz. Ebû Bekir oldu. Ridde olayları bastırıldı; Kur'ân âyetleri Zeyd b. Sâbit başkanlığındaki heyetle toplandı.",
        kaynak: "Buhârî, Fedâilü's-sahâbe; İbn Kesîr, el-Bidâye, VI",
      },
      {
        tarih: "634 – 644",
        baslik: "Hz. Ömer'in hilafeti",
        ozet:
          "Adaletiyle tanınan Hz. Ömer döneminde Yermük (636), Kudüs (638) ve Nihâvend (642) fetihleri gerçekleşti; divan teşkilatı ve hicrî takvim kuruldu.",
        kaynak: "Taberî, Târîh, IV; Belâzürî, Fütûh",
      },
      {
        tarih: "638",
        baslik: "Kudüs'ün fethi",
        ozet:
          "Hz. Ömer, Kudüs'ü sulh yoluyla teslim aldı; patrik Sophronius'a güvence verdi ve Mescid-i Aksâ'nın bulunduğu alanı temizletti.",
        kaynak: "Taberî, Târîh, IV; Belâzürî, Fütûh",
      },
      {
        tarih: "644 – 656",
        baslik: "Hz. Osman'ın hilafeti",
        ozet:
          "Kur'ân'ın çoğaltılıp merkezlere gönderilmesi onun döneminde tamamlandı. Deniz seferleri başladı; 656'da şehit edildi.",
        kaynak: "Buhârî, Fedâilü'l-Kur'ân; Taberî, Târîh, V",
      },
      {
        tarih: "656 – 661",
        baslik: "Hz. Ali'nin hilafeti",
        ozet:
          "Cemel (656), Sıffîn (657) ve Nehrevan (658) olayları yaşandı. Hz. Ali 661'de Kûfe'de şehit edildi.",
        kaynak: "Taberî, Târîh, V-VI; İbnü'l-Esîr, el-Kâmil, III",
      },
      {
        tarih: "661",
        baslik: "Hasan b. Ali'nin feragati ve Emevîler",
        ozet:
          "Hz. Hasan hilafeti Muâviye'ye devretti; böylece \"senetü'l-cemâa\" (birlik yılı) yaşandı. Emevî hilafeti başladı.",
        kaynak: "Buhârî, Fedâilü's-sahâbe; Taberî, Târîh, VI",
      },
    ],
  },

  // ───────────────── 5 ─────────────────
  {
    id: "medeniyet",
    ad: "İslâm Medeniyeti",
    aralik: "661 – 1924",
    emoji: "🏛️",
    renk: "rose",
    olaylar: [
      {
        tarih: "680",
        baslik: "Kerbelâ olayı",
        ozet:
          "Hz. Hüseyin ve ailesinden çok sayıda kişi Kerbelâ'da şehit edildi. Bu olay İslâm dünyasında derin iz bıraktı.",
        kaynak: "Taberî, Târîh, VI; İbnü'l-Esîr, el-Kâmil, IV",
      },
      {
        tarih: "711",
        baslik: "Endülüs'ün fethi",
        ozet:
          "Târık b. Ziyâd komutasındaki kuvvetler İber Yarımadası'na geçti; Endülüs'te sekiz asır sürecek İslâm medeniyeti başladı.",
        kaynak: "İbn Abdülhakem, Fütûhu Mısr; İbn Haldûn, Mukaddime",
      },
      {
        tarih: "750",
        baslik: "Abbâsî hilafetinin kuruluşu",
        ozet:
          "Emevîler devrildi, Abbâsîler hilafeti devraldı. 762'de Bağdat kuruldu ve ilim merkezi hâline geldi.",
        kaynak: "Taberî, Târîh, VII; Hatîb el-Bağdâdî, Târîhu Bağdâd",
      },
      {
        tarih: "751",
        baslik: "Talas Savaşı ve kâğıt",
        ozet:
          "Talas'ta Abbâsîlerle Tang ordusu karşılaştı. Bu dönemde kâğıt üretimi İslâm dünyasına yayıldı; kitap kültürü hızla büyüdü.",
        kaynak: "İbnü'l-Esîr, el-Kâmil, V; İbn Haldûn, Mukaddime",
      },
      {
        tarih: "IX–XII. yüzyıl",
        baslik: "İlim altın çağı",
        ozet:
          "Buhârî, Müslim, Tirmizî gibi muhaddisler; Fârâbî, İbn Sînâ, Bîrûnî, Hârizmî gibi âlimler yetişti. Tıp, matematik, astronomi ve fıkıh eserleri asırlarca ders kitabı oldu.",
        kaynak: "İbn Hallikân, Vefeyâtü'l-a'yân; İbnü'n-Nedîm, el-Fihrist",
      },
      {
        tarih: "1071",
        baslik: "Malazgirt Zaferi",
        ozet:
          "Sultan Alparslan, Bizans ordusunu Malazgirt'te yendi; Anadolu'nun kapıları Türklere açıldı.",
        kaynak: "İbnü'l-Esîr, el-Kâmil, X; İbn Kesîr, el-Bidâye, XII",
      },
      {
        tarih: "1099",
        baslik: "Kudüs'ün Haçlılar tarafından işgali",
        ozet:
          "Birinci Haçlı Seferi'nde Kudüs işgal edildi ve büyük katliam yapıldı. Şehir 1187'de Selâhaddîn-i Eyyûbî tarafından geri alındı.",
        kaynak: "İbnü'l-Esîr, el-Kâmil, X; İbn Kesîr, el-Bidâye, XII",
      },
      {
        tarih: "1187",
        baslik: "Hıttîn Zaferi ve Kudüs'ün kurtuluşu",
        ozet:
          "Selâhaddîn-i Eyyûbî Hıttîn'de Haçlı ordusunu yendi; Kudüs'ü fethetti ve halka güvenlik garantisi verdi.",
        kaynak: "İbnü'l-Esîr, el-Kâmil, XI; İbn Kesîr, el-Bidâye, XII",
      },
      {
        tarih: "1258",
        baslik: "Bağdat'ın düşüşü",
        ozet:
          "Moğol ordusu Bağdat'ı yakıp yıktı; Abbâsî hilafeti fiilen sona erdi. Bu yıkım İslâm ilim geleneğinde büyük kayıp oldu.",
        kaynak: "İbn Kesîr, el-Bidâye, XIII; İbnü'l-Esîr, el-Kâmil, XII",
      },
      {
        tarih: "1453",
        baslik: "İstanbul'un fethi",
        ozet:
          "Sultan II. Mehmed, İstanbul'u fethetti. Hz. Peygamber'in \"İstanbul mutlaka fethedilecektir\" müjdesi gerçekleşti; şehir Osmanlı başkenti oldu.",
        kaynak: "Ahmed b. Hanbel, Müsned; Tâcü't-terâcim; Osmanlı kronikleri",
      },
      {
        tarih: "1517",
        baslik: "Hilafetin Osmanlı'ya geçişi",
        ozet:
          "Yavuz Sultan Selim'in Mısır seferi sonrası hilafet Osmanlı'ya geçti; Mekke-Medine'nin hizmeti Osmanlı'ya intikal etti.",
        kaynak: "Osmanlı kronikleri; İbn İyâs, Bedâyiü'z-zühûr",
      },
      {
        tarih: "1924",
        baslik: "Hilafetin kaldırılması",
        ozet:
          "3 Mart 1924'te TBMM kararıyla hilafet kaldırıldı; son halife Abdülmecid Efendi yurt dışına çıkarıldı. Bu, İslâm tarihinde yeni bir dönemin başlangıcı sayılır.",
        kaynak: "TBMM zabıtları, 3 Mart 1924; dönem gazeteleri",
      },
    ],
  },

  // ───────────────── 6: SAHABİLER ─────────────────
  {
    id: "sahabeler",
    ad: "Sahabeler (İlk Nesil)",
    aralik: "632 ve sonrası",
    emoji: "⭐",
    renk: "teal",
    olaylar: [
      {
        tarih: "vefatı 634",
        baslik: "Hz. Ebû Bekir (r.a.)",
        ozet:
          "İlk Müslümanlardan, hicrette Hz. Peygamber'in yol arkadaşı ve ilk halife. Kur'ân âyetlerinin toplanması onun emriyle başladı; iki yıllık hilafetinde ridde olaylarını bastırdı.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Fedâilü's-sahâbe",
      },
      {
        tarih: "vefatı 644",
        baslik: "Hz. Ömer (r.a.)",
        ozet:
          "Adaletiyle tanınan ikinci halife. Kudüs ve pek çok bölge onun döneminde fethedildi; divan teşkilatını kurdu, hicrî takvimi başlattı.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Taberî, Târîh, IV",
      },
      {
        tarih: "vefatı 656",
        baslik: "Hz. Osman (r.a.)",
        ozet:
          "Üçüncü halife, Zinnûreyn (iki nur sahibi) olarak anılır. Kur'ân'ın çoğaltılıp merkezlere gönderilmesi ve deniz seferlerinin başlaması onun dönemindedir.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Fedâilü'l-Kur'ân",
      },
      {
        tarih: "vefatı 661",
        baslik: "Hz. Ali (r.a.)",
        ozet:
          "Dördüncü halife, Hz. Peygamber'in amcasının oğlu ve damadı. İlmi, cesareti ve adaletiyle bilinir; Kûfe'de şehit edildi.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Fedâilü's-sahâbe",
      },
      {
        tarih: "vefatı 619",
        baslik: "Hz. Hatice (r.anhâ)",
        ozet:
          "Hz. Peygamber'in ilk eşi ve ilk inanan kişi. Vahyin ilk günlerinde onu destekledi, malıyla davaya hizmet etti.",
        kaynak: "İbn Sa'd, et-Tabakât, VIII; Buhârî, Bed'ü'l-vahy",
      },
      {
        tarih: "vefatı 678",
        baslik: "Hz. Âişe (r.anhâ)",
        ozet:
          "Hz. Ebû Bekir'in kızı, Hz. Peygamber'in eşi. Hadis ve fıkıh ilminde öne çıktı; yüzlerce rivayet nakletti, sahâbeye fetva verdi.",
        kaynak: "İbn Sa'd, et-Tabakât, VIII; Buhârî, Fedâilü's-sahâbe",
      },
      {
        tarih: "vefatı 625",
        baslik: "Hz. Hamza (r.a.)",
        ozet:
          "Hz. Peygamber'in amcası ve sütkardeşi. Uhud'da şehit oldu; cesaretiyle tanınan sahabilerdendir.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Megâzî",
      },
      {
        tarih: "vefatı ~640",
        baslik: "Bilâl-i Habeşî (r.a.)",
        ozet:
          "İslâm'ın ilk müezzini. Mekke'de işkenceye göğüs gerdi, hicretten sonra Medine'de ezanı okudu; Hz. Peygamber'in müezzinliğini yaptı.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Ezan",
      },
      {
        tarih: "vefatı ~656",
        baslik: "Selmân-ı Fârisî (r.a.)",
        ozet:
          "İran kökenli sahabi. Hendek kazılması fikrini verdi; ilmi ve basiretiyle tanındı, Hz. Peygamber onu ehl-i beytten saydı.",
        kaynak: "İbn Sa'd, et-Tabakât, IV; Taberî, Târîh, III",
      },
      {
        tarih: "vefatı 625",
        baslik: "Mus'ab b. Umeyr (r.a.)",
        ozet:
          "İslâm'ın ilk öğretmenlerinden. Medine'ye gönderilen muallim oldu; Uhud'da sancaktar olarak şehit düştü.",
        kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Megâzî",
      },
      {
        tarih: "vefatı ~665",
        baslik: "Zeyd b. Sâbit (r.a.)",
        ozet:
          "Vahiy kâtibi. Hz. Ebû Bekir ve Hz. Osman dönemlerinde Kur'ân'ın toplanması ve çoğaltılması işlerinde görev aldı.",
        kaynak: "İbn Sa'd, et-Tabakât, II; Buhârî, Fedâilü'l-Kur'ân",
      },
      {
        tarih: "vefatı 678",
        baslik: "Ebû Hüreyre (r.a.)",
        ozet:
          "En çok hadis rivayet eden sahabi. Peygamber'in sohbetine devam etti, rivayetleri hadis külliyatının temelini oluşturdu.",
        kaynak: "İbn Sa'd, et-Tabakât, IV; Buhârî, Fedâilü's-sahâbe",
      },
    ],
  },
];

export const TARIH_TOPLAM = TARIH_DONEMLERI.reduce((t, d) => t + d.olaylar.length, 0);

// ════════════════════════════════════════════════════════
// İSLAM TARİHİ HARİTASI (yol haritası madde 10)
// 14 tarihî mekân: koordinat + ilgili olaylar + kaynak. Harita kütüphanesi
// kullanılmaz; koordinatlı kart + Google Maps bağlantısı ile çalışır
// (site ağırlığı artmaz, mobilde de akıcı).
// ════════════════════════════════════════════════════════

export interface TarihYeri {
  id: string;
  ad: string;
  ulke: string;
  /** enlem, boylam */
  koord: [number, number];
  donemId: string;
  ozet: string;
  olaylar: string[];
  kaynak: string;
}

export const TARIH_YERLERI: TarihYeri[] = [
  {
    id: "mekke",
    ad: "Mekke-i Mükerreme",
    ulke: "Suudi Arabistan",
    koord: [21.4225, 39.8262],
    donemId: "mekke",
    ozet:
      "Kâbe'nin bulunduğu şehir. Hz. Peygamber burada doğdu, ilk vahyi aldı ve 630'da şehir fethedildi.",
    olaylar: ["571 doğum", "610 ilk vahiy", "613 açık davet", "622 hicret", "630 Mekke'nin fethi"],
    kaynak: "İbn Hişâm, es-Sîre, I-IV; Buhârî, Megâzî",
  },
  {
    id: "medine",
    ad: "Medine-i Münevvere",
    ulke: "Suudi Arabistan",
    koord: [24.4672, 39.6111],
    donemId: "medine",
    ozet:
      "Hicret yurdu. Mescid-i Nebevî burada inşa edildi, Medine Vesikası imzalandı ve Hz. Peygamber burada vefat etti.",
    olaylar: ["622 hicret", "623 Mescid-i Nebevî", "624 Bedir (yakını)", "625 Uhud", "627 Hendek", "632 vefat"],
    kaynak: "İbn Hişâm, es-Sîre, II-IV; Buhârî, Menâkıbü'l-ensâr",
  },
  {
    id: "kudus",
    ad: "Kudüs",
    ulke: "Filistin",
    koord: [31.7767, 35.2345],
    donemId: "hulefa",
    ozet:
      "Mescid-i Aksâ'nın bulunduğu şehir. İsrâ ve Mi'râc'ın durağı; 638'de sulhla fethedildi, 1099'da işgal, 1187'de kurtuldu.",
    olaylar: ["620 İsrâ ve Mi'râc", "623 kıble değişikliği (Mescid-i Aksâ)", "638 Hz. Ömer'in fethi", "1099 işgal", "1187 Hıttîn ve kurtuluş"],
    kaynak: "İsrâ 17:1; Taberî, Târîh, IV; İbnü'l-Esîr, el-Kâmil, X-XI",
  },
  {
    id: "bedir",
    ad: "Bedir",
    ulke: "Suudi Arabistan",
    koord: [23.78, 38.79],
    donemId: "medine",
    ozet: "Hicretin 2. yılında Müslümanlarla Mekke müşrikleri arasındaki ilk büyük savaşın yapıldığı yer.",
    olaylar: ["624 Bedir Gazvesi"],
    kaynak: "Âl-i İmrân 3:123; İbn Hişâm, es-Sîre, II",
  },
  {
    id: "uhud",
    ad: "Uhud Dağı",
    ulke: "Suudi Arabistan",
    koord: [24.51, 39.61],
    donemId: "medine",
    ozet: "Uhud Gazvesi'nde Hz. Hamza ve birçok sahabinin şehit olduğu dağ; Medine'nin kuzeyindedir.",
    olaylar: ["625 Uhud Gazvesi", "625 Hz. Hamza'nın şehadeti"],
    kaynak: "Âl-i İmrân 3:152; Buhârî, Megâzî",
  },
  {
    id: "hayber",
    ad: "Hayber",
    ulke: "Suudi Arabistan",
    koord: [25.03, 39.02],
    donemId: "medine",
    ozet: "Hudeybiye sonrası fethedilen Yahudi yerleşimi; hicretin 7. yılındaki seferle bilinir.",
    olaylar: ["628 Hayber'in fethi"],
    kaynak: "Buhârî, Megâzî; İbn Hişâm, es-Sîre, III",
  },
  {
    id: "taif",
    ad: "Tâif",
    ulke: "Suudi Arabistan",
    koord: [21.2703, 40.4158],
    donemId: "mekke",
    ozet: "Hüzün yılında Hz. Peygamber'in gittiği, daha sonra İslâm'a giren şehir; Sakîf kabilesinin yurdu.",
    olaylar: ["619 Tâif yolculuğu", "630 Huneyn sonrası İslâm'a giriş"],
    kaynak: "İbn Hişâm, es-Sîre, II-IV",
  },
  {
    id: "sam",
    ad: "Şam",
    ulke: "Suriye",
    koord: [33.5138, 36.2765],
    donemId: "hulefa",
    ozet: "Yermük zaferinden sonra fethedilen bölgenin merkezi; Emevî hilafetinin başkenti oldu.",
    olaylar: ["636 Yermük", "661 Emevî hilafeti"],
    kaynak: "Taberî, Târîh, IV-VI; Belâzürî, Fütûh",
  },
  {
    id: "bagdat",
    ad: "Bağdat",
    ulke: "Irak",
    koord: [33.3152, 44.3661],
    donemId: "medeniyet",
    ozet: "762'de Abbâsî başkenti olarak kurulan ilim merkezi; 1258'de Moğol istilasında yıkıldı.",
    olaylar: ["762 kuruluş", "IX-XII. yüzyıl ilim altın çağı", "1258 Moğol istilası"],
    kaynak: "Hatîb el-Bağdâdî, Târîhu Bağdâd; İbn Kesîr, el-Bidâye, XIII",
  },
  {
    id: "buhara",
    ad: "Buhara",
    ulke: "Özbekistan",
    koord: [39.7747, 64.4286],
    donemId: "medeniyet",
    ozet: "Hadis ilminin merkezlerinden; İmam Buhârî'nin memleketi. İslâm ilim geleneğinde özel yeri vardır.",
    olaylar: ["IX. yüzyıl hadis ilmi", "Sahîh-i Buhârî'nin telifi"],
    kaynak: "İbn Hallikân, Vefeyâtü'l-a'yân; Zehebî, Siyeru a'lâmi'n-nübelâ",
  },
  {
    id: "kahire",
    ad: "Kahire",
    ulke: "Mısır",
    koord: [30.0444, 31.2357],
    donemId: "medeniyet",
    ozet: "Fâtımîlerle kurulan, Eyyûbî ve Memlük dönemlerinde ilim merkezi olan şehir; 1517'de Osmanlı'ya geçti.",
    olaylar: ["969 Fâtımî kuruluşu", "1187 Selâhaddîn dönemi", "1517 Osmanlı fethi"],
    kaynak: "İbn İyâs, Bedâyiü'z-zühûr; İbn Kesîr, el-Bidâye",
  },
  {
    id: "kurtuba",
    ad: "Kurtuba (Córdoba)",
    ulke: "İspanya",
    koord: [37.8882, -4.7794],
    donemId: "medeniyet",
    ozet: "Endülüs İslâm medeniyetinin başkenti; kütüphaneleri ve âlimleriyle tanınır.",
    olaylar: ["711 Endülüs'ün fethi", "VIII-XIII. yüzyıl Endülüs ilmi"],
    kaynak: "İbn Abdülhakem, Fütûhu Mısr; İbn Haldûn, Mukaddime",
  },
  {
    id: "istanbul",
    ad: "İstanbul (Kostantiniyye)",
    ulke: "Türkiye",
    koord: [41.0082, 28.9784],
    donemId: "medeniyet",
    ozet: "1453'te Sultan II. Mehmed'in fethiyle Osmanlı başkenti oldu; asırlarca hilafet merkeziydi.",
    olaylar: ["1453 İstanbul'un fethi", "1517 hilafetin Osmanlı'ya geçişi", "1924 hilafetin kaldırılması"],
    kaynak: "Osmanlı kronikleri; Ahmed b. Hanbel, Müsned (fetih müjdesi)",
  },
  {
    id: "konya",
    ad: "Konya",
    ulke: "Türkiye",
    koord: [37.8746, 32.4932],
    donemId: "medeniyet",
    ozet: "Anadolu Selçuklu Devleti'nin başkenti; tasavvuf ve ilim geleneğinin önemli merkezi.",
    olaylar: ["1071 Malazgirt sonrası Anadolu", "XIII. yüzyıl tasavvuf ve ilim"],
    kaynak: "İbnü'l-Esîr, el-Kâmil, X; Selçuklu kronikleri",
  },
];

export const TARIH_YER_TOPLAM = TARIH_YERLERI.length;
