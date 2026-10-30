// ══════════════════════════════════════════════════════════════════
// SIYER.TS (31.10) — Hz. Muhammed (s.a.v.) Hayatı: kronolojik kategoriler
// ★ Talep (31.10): sekmede sağda kategoriler açılır; her olay kısa metin
//   + sahih kaynak. İsrâiliyât yok; olaylar Buhârî, Müslim, Muvatta ve
//   klâsik sîre kaynaklarından (İbn Hişâm, Vâkıdî, İbn Sa'd) seçilir.
//   Metinler TR; kategori adları siyerCokDil.ts ile 5 dilde.
// ══════════════════════════════════════════════════════════════════

export type SiyerDonem = "Mekke" | "Medine";

export interface SiyerOlay {
  metin: string;  // olay özeti (TR)
  kaynak: string; // sahih kaynak
}

export interface SiyerKategori {
  id: string; // çokdil anahtarı — siyerCokDil'de aynı id geçer
  ad: string; // TR kategori adı
  donem: SiyerDonem;
  olaylar: SiyerOlay[];
}

export const SIYER_KATEGORILER: SiyerKategori[] = [
  // ── 1. DOĞUM VE ÇOCUKLUK ───────────────────────────────
  {
    id: "dogum",
    ad: "Doğum ve Çocukluk",
    donem: "Mekke",
    olaylar: [
      {
        metin: "Rasûlullah ﷺ, Fil yılında (Hicret'ten yaklaşık 571 yıl önce) Rebîü'l-Evvel ayında Mekke'de doğdu; aynı yıl Kâbe'yi yıkmaya gelen Ebrehâ ordusu Allah'ın azâbıyla helâk olmuştu.",
        kaynak: "İbn Hişâm, Sîre 1 · Fil Sûresi 105:1-5",
      },
      {
        metin: "Babası Abdullah, onun doğumundan kısa süre önce vefât etti; dedesi Abdülmuttalib torununa «Muhammed» adını verdi.",
        kaynak: "İbn Hişâm, Sîre 1 · İbn Sa'd, Tabakât 1:102",
      },
      {
        metin: "Süt anne Halîme es-Sa'diyye'nin yanında Benî Sa'd'da bir müddet büyüdü; altı yaşında annesi Âmine bint Vehb, Medine yolundaki Abvâ'da vefât etti.",
        kaynak: "İbn Hişâm, Sîre 1 · İbn Sa'd, Tabakât 1:194",
      },
      {
        metin: "Sekiz yaşında Ebî Tâlib'in evinde büyütülmesi başlayan Rasûlullah ﷺ, bütün çocukluğunu amcasının şefkatinde geçirdi.",
        kaynak: "İbn Hişâm, Sîre 1",
      },
    ],
  },
  // ── 2. GENÇLİK YILLARI VE HATİCE ───────────────────────
  {
    id: "genclik",
    ad: "Gençlik Yılları ve Hatice",
    donem: "Mekke",
    olaylar: [
      {
        metin: "Gençliğinde ticâret yapan Rasûlullah ﷺ, dürüstlük ve emânetiyle tanındı; Mekke halkı ona «el-Emin» (güvenilir) lakabını verdi.",
        kaynak: "İbn Hişâm, Sîre 1 · İbn Sa'd, Tabakât 1:151",
      },
      {
        metin: "Hilfü'l-Fuzûl ahidine katıldı; zulme uğrayanın hakkını geri almak için yemin etmişlerdi. İslâm'dan sonra bile «Bugün beni böyle bir ahde çağırsam imzâmı koymaktan çekinmem» buyurdu.",
        kaynak: "Buhârî, Cin 1 (h. 3967)",
      },
      {
        metin: "Hâtice bint Hüveylid, ticâret bilgisine güvenip kervanını Şâm yoluna gönderdi; Rasûlullah ﷺ kârıyla döndü, Hâtice onun emeline hayran oldu.",
        kaynak: "İbn Sa'd, Tabakât 1:285 · İbn Hişâm, Sîre 1:278",
      },
      {
        metin: "Yirmi beş yaşında Hâtice (r.a.) ile evlendi; oğulları Kâsım ve Abdullah, kızları Zeyneb, Rukiyye, Ümmü Gülsüm ve Fâtıma ondan dünyaya geldi.",
        kaynak: "İbn Hişâm, Sîre 1 · İbn Sa'd, Tabakât 1:464",
      },
    ],
  },
  // ── 3. HÎRÂ VE İLK VAHYİ ───────────────────────────────
  {
    id: "hira",
    ad: "Hîrâ ve İlk Vahiy",
    donem: "Mekke",
    olaylar: [
      {
        metin: "Peygamberlikten önce Rasûlullah ﷺ, Hîrâ mağarasına çekilir, günlerce Rabbinin azâmetini tefekkür ederdi.",
        kaynak: "Buhârî, Menâkıb (h. 4953) · İbn Hişâm, Sîre 1",
      },
      {
        metin: "Kırk yaşında Hîrâ'da vahiy başladı: Cebrâil (a.s.) «Oku!» âyetini getirdi; Alâk sûresinin ilk âyetleri indi.",
        kaynak: "Buhârî, Menâkıb (h. 4953) · Alâk Sûresi 96:1-5",
      },
      {
        metin: "İlk vahiyden sonra Rasûlullah ﷺ titreyerek eve döndü; Hâtice (r.a.) onu teselli etti, Vâraka ibn-i Nevfel peygamberlik müjdesini verdi.",
        kaynak: "Buhârî, Menâkıb (h. 4953) · İbn Hişâm, Sîre 1",
      },
    ],
  },
  // ── 4. İLK MÜSLÜMANLAR VE AÇIK DAVET ───────────────────
  {
    id: "davet",
    ad: "İlk Müslümanlar ve Açık Davet",
    donem: "Mekke",
    olaylar: [
      {
        metin: "İslâma ilk girenler Hâtice, Ebû Bekir, Ali ve Zeyd ibn-i Hârise; ardından iman edenler gün geçtikçe arttı.",
        kaynak: "İbn Sa'd, Tabakât 3 · İbn Hişâm, Sîre 1",
      },
      {
        metin: "İlk yıllarda davet gizli yürütüldü; Hicr sûresi 15:94 âyetiyle «Emrolunduğun şeyi apaçık beyân et» emriyle davet âşikâre hâline geldi.",
        kaynak: "Hicr Sûresi 15:94 · İbn Hişâm, Sîre 1",
      },
      {
        metin: "Safâ tepesinde Mekkelileri tevhîde davet etti; Ebû Leheb onu tehdit etti ve Tebbet sûresi «Ebû Leheb'in iki eli kurusun» diye indi.",
        kaynak: "İbn Hişâm, Sîre 1 · Tebbet Sûresi 111:1",
      },
      {
        metin: "Kureyş önderleri ona mal ve saltanat teklif etti; o, «Allah korkusu buna engel oldu» dedi.",
        kaynak: "İbn Hişâm, Sîre 1",
      },
    ],
  },
  // ── 5. EZİYET YILLARI VE HABEŞİSTAN HİCRETİ ────────────
  {
    id: "eziyet",
    ad: "Eziyet Yılları ve Habeşistan Hicreti",
    donem: "Mekke",
    olaylar: [
      {
        metin: "Bilâl (r.a.), «Ahad, Ahad» diye zikrederken eziyet gördü; Ebû Bekir onu satın alıp azâd etti.",
        kaynak: "Buhârî, Fazâ'ilü's-Sahâbe",
      },
      {
        metin: "Kureyş, Hâşim ve Muttalib oğullarını boykot etti; Şi'b-i Ebî Tâlib'de üç yıl açlıkta kaldılar.",
        kaynak: "İbn Hişâm, Sîre 1",
      },
      {
        metin: "Baskı derinleşince müminlerin bir bölümü Habeşistan'a hicret etti; adil hükümdar Necâşî onları kabûl etti.",
        kaynak: "İbn Hişâm, Sîre 1 · İbn Sa'd, Tabakât 1",
      },
    ],
  },
  // ── 6. HÜZÜN YILI, TÂİF VE İSRÂ-MİRÂC ──────────────────
  {
    id: "huzun",
    ad: "Hüzün Yılı, Tâif ve İsrâ-Mirâc",
    donem: "Mekke",
    olaylar: [
      {
        metin: "Peygamberliğin onuncu yılında Ebû Tâlib ve Hâtice (r.a.) vefât etti; bu yıl «âmü'l-hüzün» (hüzün yılı) diye anıldı.",
        kaynak: "İbn Sa'd, Tabakât 1 · İbn Hişâm, Sîre 2",
      },
      {
        metin: "Tâif'e davet için gitti; halk onu taşladı, Efendimiz onlara azâb yerine af diledi.",
        kaynak: "İbn Hişâm, Sîre 2 · Buhârî, Megâzî",
      },
      {
        metin: "İsrâ-Mirâc gecesi Mescid-i Aksâ'ya götürüldü, göklere yükseltildi; ümmete beş vakit namaz farz kılındı.",
        kaynak: "Buhârî, Salât · Müslim, Îman",
      },
    ],
  },
  // ── 7. AKÂBE BİATLARI ──────────────────────────────────
  {
    id: "akabe",
    ad: "Akâbe Biatları",
    donem: "Mekke",
    olaylar: [
      {
        metin: "Birinci Akâbe'de 12 kişilik Medineli grup, şirkten uzak durma yeminiyle biât etti.",
        kaynak: "İbn Hişâm, Sîre 2",
      },
      {
        metin: "Mus'ab ibn-i Umeyr, öğretici olarak Medine'ye gönderildi; davet orada hızla yayıldı.",
        kaynak: "İbn Hişâm, Sîre 2",
      },
      {
        metin: "İkinci Akâbe'de 73 erkek ve 2 kadın, Rasûlullah'ı Medine'ye davet edip koruma yeminiyle biât etti.",
        kaynak: "İbn Hişâm, Sîre 2 · İbn Sa'd, Tabakât 3",
      },
    ],
  },
  // ── 8. HİCRET ──────────────────────────────────────────
  {
    id: "hicret",
    ad: "Hicret",
    donem: "Medine",
    olaylar: [
      {
        metin: "Mekke'de öldürme tertibi kuruldu; Ali yatağında kaldı, Rasûlullah ﷺ Ebû Bekir'le gece yola çıktı.",
        kaynak: "Buhârî, Fazâ'ilü'l-Medîne · İbn Hişâm, Sîre 2",
      },
      {
        metin: "Üç gün Sevr mağarasında gizlendi; peşlerindekiler mağaraya ulaşamadı.",
        kaynak: "Buhârî, Megâzî · Tevbe Sûresi 9:40",
      },
      {
        metin: "Yol boyunca «Lâ tehzen, innallâhe ma'ana» âyetiyle Ebû Bekir teselli edildi.",
        kaynak: "Tevbe Sûresi 9:40",
      },
      {
        metin: "Kubâ'da bir süre konakladı, Kubâ Mescidini inşâ etti.",
        kaynak: "İbn Hişâm, Sîre 2 · Buhârî, Fazâ'ilü'l-Medîne",
      },
      {
        metin: "Medine'ye ulaştı; deve çöküştüğü yerde mescidin yeri seçildi, Ebû Eyyûb'ün evine misâfîr oldu.",
        kaynak: "İbn Hişâm, Sîre 2",
      },
    ],
  },
  // ── 9. MEDİNE İNŞÂSI ───────────────────────────────────
  {
    id: "medine",
    ad: "Medine'nin İnsâsı",
    donem: "Medine",
    olaylar: [
      {
        metin: "Mescid-i Nebî inşâ edildi; ibadet, öğretim ve toplumun merkezi hâline geldi.",
        kaynak: "Buhârî, Salât · İbn Hişâm, Sîre 2",
      },
      {
        metin: "Muhâcirler ile Ensâr arasında kardeşlik (muâhât) kuruldu; Ensâr, kardeşlerini evlerine aldı.",
        kaynak: "İbn Hişâm, Sîre 2 · Buhârî, Fazâ'ilü'l-Medîne",
      },
      {
        metin: "Yahudi kabileleriyle Medine Antlaşması yapıldı; bir ortak bayrak altında toplumsal düzen kuruldu.",
        kaynak: "İbn Hişâm, Sîre 2",
      },
      {
        metin: "Medine'de münâfık bir grup gizlice karşı çıkma örgütledi; başları Abdullah ibn-i Übey idi.",
        kaynak: "Münâfıkûn Sûresi 63:1-8",
      },
      {
        metin: "Benî Kaynukâ'ya kardeşliğin ilk sınavı yaşandı; Benî Kaynukâ ihanet ettikleri için Medine'den sürüldü.",
        kaynak: "İbn Hişâm, Sîre 2 · İbn Sa'd, Tabakât 2",
      },
    ],
  },
  // ── 10. BEDİR ──────────────────────────────────────────
  {
    id: "bedir",
    ad: "Bedir Savaşı (2. Hicret Yılı)",
    donem: "Medine",
    olaylar: [
      {
        metin: "Ebû Süfyân'ın ticaret kâfillesine vapurla gelmesi sebebiyle ordunun karşısına çıkıldı; Ebû Süfyân kâfillesi kurtuldu, Kureyş ordusu yürüdü.",
        kaynak: "İbn Hişâm, Sîre 3 · Buhârî, Megâzî",
      },
      {
        metin: "313 mümin, sayıca az olmasına rağmen iman ve kararlılıkla Bedir'de zafer kazandı.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 3",
      },
      {
        metin: "Rasûlullah ﷺ, Bedir esirlerinden arkada yazı bilenlerin her on kişiye bir kişi öğrettiklerini serbest bıraktı; Kur'ân Bedir'i «Furkân günü» diye anar.",
        kaynak: "Buhârî, Megâzî · Enfâl Sûresi 8:41",
      },
    ],
  },
  // ── 11. UHUD ───────────────────────────────────────────
  {
    id: "uhud",
    ad: "Uhud Savaşı (3. Hicret Yılı)",
    donem: "Medine",
    olaylar: [
      {
        metin: "Mekkeliler intikam için Uhud'a yürüdü; istişâre sonunda savaşa hükmetti, Abdullah ibn-i Übey ordudan ayrılıp geri döndü.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 3",
      },
      {
        metin: "Okçular Rasûlullah'ın emrini unutup tepeyi terkedince savaş İslâm ordusunun aleyhine döndü.",
        kaynak: "Buhârî, Megâzî · Âl-i İmrân 3:121-175",
      },
      {
        metin: "Amca oğlu Hamza (r.a.) şehîd düştü, Rasûlullah ﷺ yaralandı; yetmiş şehîd Uhud'da medfun kaldı.",
        kaynak: "Buhârî, Megâzî · İbn Sa'd, Tabakât 3",
      },
      {
        metin: "Rasûlullah ﷺ, Uhud şehîdleri hakkında «Onlar kıyâmet günü benim şâhidlerimdir» müjdesini verdi.",
        kaynak: "Tirmizî, Fazâ'ilü'l-Cihâd",
      },
    ],
  },
  // ── 12. HANDAK VE KURAYZÂ ──────────────────────────────
  {
    id: "handak",
    ad: "Handak (Hendek) Savaşı ve Kurayzâ",
    donem: "Medine",
    olaylar: [
      {
        metin: "Hicretin 5. yılında Mekke ve müttefikleri ahde uymayarak Medine'ye yürüdü; Selman-i Fârisî'nin önerisiyle çevreye hendek kazıldı.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 3",
      },
      {
        metin: "Kurayzâ Yahudileri ahdi bozup düşman tarafına geçmek istedi; mânevî baskı ve rüzgâr, müttefik orduları dağıttı.",
        kaynak: "Ahzâb Sûresi 33:9-27 · İbn Hişâm, Sîre 3",
      },
      {
        metin: "Müttefikler çekildikten sonra Kurayzâ kalesi kuşatıldı; teslim olmayı müteakip Sa'd ibn-i Muâz'ın hükmü icrâ edildi.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 3",
      },
    ],
  },
  // ── 13. HUDAYBiYE VE FETH ──────────────────────────────
  {
    id: "hudaybiye",
    ad: "Hudaybiye Antlaşması ve Feth-i Mekke",
    donem: "Medine",
    olaylar: [
      {
        metin: "Hicretin 6. yılında umre için Mekke'ye gidildi; Kureyş engelledi, Hudaybiye'de on yıllık barış antlaşması yapıldı.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 3",
      },
      {
        metin: "Bu barış, Kur'ân'da müjde hâlinde «açık bir fetih» diye bildirildi; müslümanlar güç kazandı.",
        kaynak: "Fetih Sûresi 48:1-4",
      },
      {
        metin: "Rasûlullah ﷺ devrin hükümdarlarına (Heraklios, Kisrâ, Mukavkıs, Necâşî) İslâm'a davet mektupları gönderdi.",
        kaynak: "Buhârî, Megâzî · İbn Sa'd, Tabakât 1",
      },
      {
        metin: "Hicretin 8. yılı Ramazan'ında Mekke fethedildi; Kâbe'deki putlar kırıldı, zulümden öç almaksızın af cömertliği gösterildi.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 3",
      },
    ],
  },
  // ── 14. VEDA HACC VE HUTBE ─────────────────────────────
  {
    id: "veda",
    ad: "Vedâ Haccı ve Vedâ Hutbesi",
    donem: "Medine",
    olaylar: [
      {
        metin: "Hicretin 10. yılında vedâ haccı yapıldı; yüz bini aşkın mümin hacca katıldı.",
        kaynak: "Buhârî, Hacc · Müslim, Hacc",
      },
      {
        metin: "Vedâ hutbesinde insanların can, mal ve namus dokunulmazlığı asıl esas gösterildi, cins ve kabile üstünlüğünün kalktığı bildirildi; kadınlarla iyi davranmak vasiyet edildi.",
        kaynak: "Müslim, Hacc · İbn Hişâm, Sîre 4",
      },
      {
        metin: "Vedâ haccından kısa süre sonra Rasûlullah ﷺ vefât etti; Medine'de Âişe'nin odasına defnedildi.",
        kaynak: "Buhârî, Megâzî · İbn Hişâm, Sîre 4",
      },
    ],
  },
];
