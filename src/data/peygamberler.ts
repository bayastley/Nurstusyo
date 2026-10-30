// ═══════════════════════════════════════════════════════════════════
// PEYGAMBERLER.TS (31.10) — Kur'ân'da adı geçen 25 peygamber
// ★ Talep (31.10): "Peğamberler Hayatı" bölümü; kaynaklı kıssa özeti.
// ★ İçerik yalnızca Kur'ân kıssalarına dayanır; İsrâiliyât ve uydurma yok.
// ★ Dil kuralı: kıssa metni TR; bölüm etiketleri src/i18n dicts ile 5 dilde.
// ═══════════════════════════════════════════════════════════════════

export interface Peygamber {
  ad: string;        // Türkçe ad
  adAr: string;      // Arapça yazım
  ozet: string;      // kim olduğu — kısa giriş
  olaylar: string[]; // hayatının en önemli olayları
  ders: string;      // hayatından çıkan ders
  kaynak: string;    // Kur'ân kaynakları (sure:ayet)
}

export const PEYGAMBERLER: Peygamber[] = [
  {
    ad: "Âdem",
    adAr: "آدم",
    ozet:
      "Âlemin ilk insanı ve ilk peygamberi. Allah, onu yaratmadan önce meleklere: «Ben yeryüzünde bir halife yaratacağım» müjdesini verdi.",
    olaylar: [
      "Allah, Âdem'e tüm varlıkların isimlerini öğretti; bilgisi meleklerinkinden üstün çıktı.",
      "Cennete yerleşti; şeytanın vesvesesiyle yasak ağaca yaklaştığı için dünyaya indirildi.",
      "Rabbinden kelime (tövbe) aldı; tövbesi kabul edildi.",
      "Havva ile yeniden buluştular; âdemoğulları onlardan çoğaldı.",
      "Oğulları Hâbil ile Kâbil kıssası yaşandı; kıskançlık, âdemoğullarındaki ilk cinayete yol açtı.",
    ],
    ders:
      "İnsan hataya açıktır; asıl olan hatadan dönüp tövbe etmektir. Kıskançlık yıkımın ilk kapısıdır.",
    kaynak: "Bakara 2:30-37 · A'râf 7:11-25 · Tâhâ 20:115-124 · Mâide 5:27-31",
  },
  {
    ad: "İdris",
    adAr: "إدريس",
    ozet:
      "Âdemoğullarının ilk peygamberlerinden; Kur'ân onu sabır ve sadakatle anar, mertebesinin yüceltildiğini bildirir.",
    olaylar: [
      "Halkını kitaba ve takvâya çağırdı; adalet üzerine düzen kurdu.",
      "Kur'ân onun sabırlı ve hilimli olduğunu bildirir.",
      "Allah onu yüce bir makama yükseltti.",
    ],
    ders:
      "İlmi ve vicdanı birleştirip halkı hakka davet edenin makamı yüceltilir; sabır ve takvâ yükselişin anahtarıdır.",
    kaynak: "Meryem 19:56-57 · Enbiyâ 21:85-86",
  },
  {
    ad: "Nûh",
    adAr: "نوح",
    ozet:
      "Halkını uzun yıllar tevhîde çağıran peygamber; tufan ve gemi kıssasıyla anılır. Kur'ân onu «çok şükreden bir kul» diye tanıtır.",
    olaylar: [
      "Gece gündüz halkını Allah'a kulluğa çağırdı; davet 950 yıl sürdü.",
      "Halkı onu dinlemedi; ileri gelenler bile iman etmeyi reddetti.",
      "Allah'ın emriyle gemi yaptı; halk onunla alay etti.",
      "Tufan geldi; yalnız iman edenler ve gemidekiler kurtuldu.",
      "İman etmeyen oğlu gemiye binmedi ve boğuldu; babasının yalvarması kabul edilmedi.",
    ],
    ders:
      "Doğru davet sabır ister; kurtuluş soyda değil, imandadır.",
    kaynak: "Hûd 11:25-49 · Nûh 71:1-28 · Şu'arâ 26:105-122 · Enbiyâ 21:76-77",
  },
  {
    ad: "Hûd",
    adAr: "هود",
    ozet:
      "Âd kavmine gönderildi; Âd, güçlü yapılarla ve bollukla övünen bir kavimdi.",
    olaylar: [
      "«Ey kavmim, Allah'a kulluk edin; O'ndan başka ilahınız yoktur» dedi.",
      "İleri gelenler onu delilikle suçladı; iman etmeyi reddettiler.",
      "Üzerlerine yedi gece sekiz gün aralıksız esten bir rüzgâr azabı geldi.",
      "Rüzgâr onları devirdi; iman edenler ve Hûd kurtuldu, onlara selam yollandı.",
    ],
    ders:
      "Kibir helak getirir; rüzgârlar da Allah'ın azap araçlarıdır.",
    kaynak: "A'râf 7:65-72 · Hûd 11:50-60 · Şu'arâ 26:123-140 · Fussilet 41:15-16",
  },
  {
    ad: "Sâlih",
    adAr: "صالح",
    ozet:
      "Semûd kavmine gönderildi; kavmi ondan bir mucize istedi.",
    olaylar: [
      "«Ey kavmim, Allah'a kulluk edin; O'ndan başka ilahınız yoktur» dedi.",
      "Kavmi mucize istedi; kayadan dişi deve çıktı — bu Allah'ın âyetiydi.",
      "Devenin su hakkı korundu; dönüş için belirli bir gün belirlendi.",
      "Kavmin azgınları devenin ayaklarını kesip onu öldürdüler.",
      "Onlara üç gün mühlet verildi; sonra gelen azapla helak oldular.",
      "Sâlih ve iman edenler kurtuldu.",
    ],
    ders:
      "Allah'ın âyetine dokunmak helak getirir; iman, tevazu ile geçilir.",
    kaynak: "A'râf 7:73-79 · Hûd 11:61-68 · Kamer 54:23-31 · Şu'arâ 26:141-159",
  },
  {
    ad: "İbrahim",
    adAr: "إبراهيم",
    ozet:
      "«Halîlü'r-Rahmân» — Rahman'ın dostu; tevhid davasının şahsiyeti, oğlu İsmail ile Kâbe'nin yapıcısı.",
    olaylar: [
      "Gece gündüz yıldız, ay ve güneşe bakarak «ben ortak koşanlardan değilim» hükmüne vardı.",
      "Kavminin putlarını kırdı; tevhidi açıkça ilan etti.",
      "Putperestler onu ateşe atmak istediler; ateş ona soğuk ve selamet oldu.",
      "Allah ona oğlu İsmail'i kurban etmesini emretti; ikisi de boyun eğdi ve kurban hafifletildi.",
      "Oğlu İsmail ile Kâbe'nin temelini yükseltti; orayı insanlar için emin bir yer kıldı.",
    ],
    ders:
      "Tevhid davetinde imtihan büyük olabilir; teslimiyet onun anahtarıdır.",
    kaynak: "Bakara 2:124-132 · En'âm 6:75-84 · Saffât 37:83-111 · İbrâhîm 14:35-41",
  },
  {
    ad: "Lût",
    adAr: "لوط",
    ozet:
      "İbrahim'in yeğeni; Sodom halkına gönderildi.",
    olaylar: [
      "Kavmini tevhid ve hayâya çağırdı; bu günahı işleyen tek kavim olarak tanındılar.",
      "Melekler, İbrahim'e müjde getirdikten sonra Lût'un evine gizli olarak geldiler.",
      "Kavmi, misafirleri kovmak üzere evine toplandı.",
      "Lût kızlarına evlilik teklifinde bulundu; kavmi bunu kabul etmedi.",
      "Melekler «gece buradan çıkın; arkana bakmayanlardan olun» dediler.",
      "Şehir yerden tersine çevrildi ve üzerine taş yağdırıldı; Lût'un karısı helak olanlardan oldu.",
    ],
    ders:
      "Hayâsızlıkta ısrar helak getirir; Lût'un karısı bile helak olanlardan oldu.",
    kaynak: "A'râf 7:80-84 · Hûd 11:69-83 · Şu'arâ 26:160-175 · Neml 27:54-58",
  },
  {
    ad: "İsmail",
    adAr: "إسماعيل",
    ozet:
      "İbrahim'in oğlu; kurban imtihanına giren, babasıyla Kâbe'yi yapan peygamber.",
    olaylar: [
      "İbrahim'e İsmail'i kurban etme emri geldi; İsmail «istediğini yap; inşaAllah sabredenlerdenim» dedi.",
      "Kurban imtihanında teslimiyet gözlendi; kurban Allah tarafından hafifletildi.",
      "Babasıyla birlikte Kâbe'nin temellerini yükselttiler.",
      "«Rabbimiz, bizi sana teslim olan kullardan eyle» diye dua ettiler.",
    ],
    ders:
      "Sabır ve teslimiyet, imanlı kulu yüceltir; imtihanların anahtarı sabırdır.",
    kaynak: "Saffât 37:100-113 · Bakara 2:125-127 · Meryem 19:54-55",
  },
  {
    ad: "İshâk",
    adAr: "إسحاق",
    ozet:
      "İbrahim'in oğlu; yaşlı anne ve babasına verilen müjdeyle dünyaya geldi.",
    olaylar: [
      "Melekler, İbrahim ile karısına İshâk müjdesini getirdi.",
      "Peygamberlik İbrahim'in soyundan İshâk ile sürdü.",
      "İshâk da peygamber oldu; oğlu Yâkub da peygamberdi.",
    ],
    ders:
      "Allah'ın vaadi gerçekleşir; sebat eden kul müjdeye erişir.",
    kaynak: "Hûd 11:69-74 · Saffât 37:112-113 · Enbiyâ 21:71-72",
  },
  {
    ad: "Yâkub",
    adAr: "يعقوب",
    ozet:
      "İshâk'ın oğlu; «İsrâil» diye anılan peygamber. On iki oğlu İsrâiloğullarının atasıdır.",
    olaylar: [
      "Oğlu Yûsuf'un rüyası üzerine ona akıl ve umut tavsiyesinde bulundu.",
      "Oğullarının Yûsuf'u kuyuya atmalarından sonra yıllarca ağladı; gözleri görmez oldu.",
      "Sonunda oğlu Yûsuf ile kavuştu ve gözleri geri açıldı.",
      "Oğulları vefat anında yalnız Allah'a teslim olmalarını istedi.",
    ],
    ders:
      "Hüzün ve kayıp karşısında umutsuzluğa düşmemek gerekir; sabır, kavuşmayı getirir.",
    kaynak: "Yûsuf 12:1-101 · Bakara 2:132-140",
  },
  {
    ad: "Yûsuf",
    adAr: "يوسف",
    ozet:
      "Yâkub'un oğlu; kıssası Kur'ân'da tam bir surede anılan peygamber.",
    olaylar: [
      "Rüyasında on bir yıldıza secde ettiğini gördü; babası bunun geleceğe işaret ettiğini söyledi.",
      "Kardeşleri onu kuyuya attı; bir kervan onu esir aldı.",
      "Fitne yüzünden zindana düştü; orada rüya tabiriyle tanındı.",
      "Hükümdar onu hazine üzerine görevlendirdi; kıtlıkta Mısır'ı yönetime aldı.",
      "Kıtlık yıllarında ailesi Mısır'a geldi; kardeşlerini affetti.",
      "Rüyası gerçek oldu; ailesiyle beraber Mısır'da yerleşti.",
    ],
    ders:
      "Sabır çetin imtihanların anahtarıdır; af, asıl zaferdir.",
    kaynak: "Yûsuf 12:1-101 (tam sure)",
  },
  {
    ad: "Eyyûb",
    adAr: "أيوب",
    ozet:
      "Sabır peygamberi; malı, ailesi ve sağlığıyla imtihan edildi.",
    olaylar: [
      "Sağlığı bozuldu; malı ve ailesi elinden alındı.",
      "Yıllarca hastalık içinde metanetle sabretti.",
      "Rabbine dua etti: «Başıma bu şiddetli dert dokundu»; Rabbi onu iyileştirdi.",
      "Kaybettiği nimetler yeniden ihsan edildi.",
    ],
    ders:
      "Musibette sabır, nimette şükür gereklidir; Allah sabredenle beraberdir.",
    kaynak: "Enbiyâ 21:83-84 · Sâd 38:41-44",
  },
  {
    ad: "Şuayb",
    adAr: "شعيب",
    ozet:
      "Medyen halkına gönderildi; ölçü ve tartıda dürüstlük çağrısı yaptı.",
    olaylar: [
      "«Ey kavmim, ölçüde ve tartıda adaleti tutun» dedi.",
      "Kavmi ona karşı çıktı ve uyarıları dinlemedi.",
      "Sonunda azap geldi; iman edenler ve onun ailesi kurtuldu.",
    ],
    ders:
      "Ölçü ve tartıda adalet; ticarete de dürüstlük şarttır.",
    kaynak: "A'râf 7:85-93 · Hûd 11:84-95 · Şu'arâ 26:176-191",
  },
  {
    ad: "Mûsâ",
    adAr: "موسى",
    ozet:
      "Büyük peygamberlerden; Firavun'un kavmine gönderildi.",
    olaylar: [
      "Firavun, doğan erkek çocukların öldürülmesini emretti; Mûsâ Nil'e bırakıldı.",
      "Firavun'un sarayında büyüdü; sonra Medyen'e gitti.",
      "Dönüş yolunda Allah ile Tûr'da konuştu; kendisine peygamberlik verildi.",
      "Firavun'a tevhidi ve İsrâiloğullarını salıverme talebini iletti.",
      "Mucizelerini gösterdi: asâ ve beyaz el.",
      "Deniz yarıldı; İsrâiloğulları geçti, Firavun boğuldu.",
    ],
    ders:
      "Zalim sonunda helak olur; mazlum ise imanla kurtulur.",
    kaynak: "Kasas 28:1-46 · Tâhâ 20:9-98 · A'râf 7:103-155",
  },
  {
    ad: "Hârun",
    adAr: "هارون",
    ozet:
      "Mûsâ'nın kardeşi; ona yardımcı olarak peygamber yapıldı.",
    olaylar: [
      "Mûsâ, dilinin güçlenmesi için kardeşinden yardım istedi.",
      "Allah Hârun'u peygamber yaptı; kardeşler Firavun'a birlikte davet getirdi.",
      "Mûsâ yokluğunda kavmi altın buzağı yapınca Hârun onları uyardı.",
    ],
    ders:
      "Birleşme, tevhid davetini güçlendirir; müşterek emek hayır getirir.",
    kaynak: "Tâhâ 20:25-36 · Kasas 28:34-35",
  },
  {
    ad: "Dâvûd",
    adAr: "داود",
    ozet:
      "Zebûr'un sahibi peygamber kral; Talût ordusunda Câliût ile savaşmıştır.",
    olaylar: [
      "Talût ordusunda Câliût ile savaştı ve onu devirdi.",
      "Allah onu halife yaptı; kendisine Zebûr'u verdi.",
      "Dağlar ve kuşlar O'nunla birlikte zikretti.",
    ],
    ders:
      "Kudretin değeri, adaletle birleşmesindedir.",
    kaynak: "Bakara 2:251 · Sâd 38:17-44",
  },
  {
    ad: "Süleyman",
    adAr: "سليمان",
    ozet:
      "Dâvûd'un oğlu; cinler, insanlar ve hayvanlar üzerinde emri olan peygamber kral.",
    olaylar: [
      "Karınca ve kuşların dilini anladı.",
      "Rüzgârlar ve cinler emirindendi.",
      "Hüdhüd kuşu Sebe' haberini getirdi; Belkîs iman etti.",
    ],
    ders:
      "Kudret, şükür ile birleşince bereketlenir.",
    kaynak: "Neml 27:15-44 · Sâd 38:30-40 · Sebe' 34:12-14",
  },
  {
    ad: "İlyâs",
    adAr: "إلياس",
    ozet:
      "Benî İsrâil'e gönderilmiş; putperestlikle mücadele eden peygamber.",
    olaylar: [
      "Kavmini Allah'a kulluğa davet etti.",
      "Kavmi putperestliği sürdürdü.",
      "Sonunda azap geldi.",
    ],
    ders:
      "Tevhid daveti sabır ister; doğruya dönmeyenler, helak olur.",
    kaynak: "En'âm 6:85-86 · Sâffât 37:123-126",
  },
  {
    ad: "Elyesa'",
    adAr: "اليسع",
    ozet:
      "İlyâs'ın ardından gönderilen peygamber; Kur'ân'da ismi geçen peygamberlerden.",
    olaylar: [
      "İlyâs'tan sonra Benî İsrâil'e peygamberlik görevi üstlendi.",
      "İsrâiloğullarını tevhide davet etti.",
    ],
    ders:
      "Doğru davet, nesilden nesile taşınır.",
    kaynak: "En'âm 6:86 · Sâd 38:48",
  },
  {
    ad: "Zülkifl",
    adAr: "ذو الكفل",
    ozet:
      "Benî İsrâil peygamberlerinden; sabır ve hilim olarak tanınır.",
    olaylar: [
      "Sabır ve hilim örneği peygamberler arasında anılır.",
      "Kur'ân'da adı geçen peygamberlerden.",
    ],
    ders:
      "Sabır ve hilim, davetin özüdür; sabredenler yüceltilir.",
    kaynak: "Enbiyâ 21:85 · Sâd 38:48",
  },
  {
    ad: "Yûnus",
    adAr: "يونس",
    ozet:
      "Ninova kavmine gönderildi; büyük balık kıssasıyla bilinir.",
    olaylar: [
      "Kavmini bırakıp gitmek niyetiyle bir gemiye bindi.",
      "Gemi yolculuğunda denize atıldı; büyük bir balık onu yuttu.",
      "Balığın karnında dua etti: «Senden başka tapacak yoktur».",
      "Allah onu kurtardı; üzüntüsü giderildi, kavmi iman etti.",
    ],
    ders:
      "Zikir ve dua, dertten kurtarır; hataya düşmekten sakınmak gerekir.",
    kaynak: "Sâffât 37:139-148 · Enbiyâ 21:87-88",
  },
  {
    ad: "Zekeriyâ",
    adAr: "زكريا",
    ozet:
      "Yahyâ'nın babası; Meryem'e bakım vermiş, yaşlılığında evlat müjdesi almış peygamber.",
    olaylar: [
      "Meryem'in bakımını ve eğitimini üstlendi.",
      "Yaşlılığında Allah'a oğul duası etti.",
      "Yahyâ müjdesi verildi; kendisine ayet olarak bir işaret geldi.",
      "Üç gün halk ile konuşamadı; zikir ile geçirdi.",
    ],
    ders:
      "Allah'a içten dua eden, umduğu hayra erişir; dua reddedilmez.",
    kaynak: "Meryem 19:1-15 · Âl-i İmrân 3:37-41 · Enbiyâ 21:89-90",
  },
  {
    ad: "Yahyâ",
    adAr: "يحيى",
    ozet:
      "Zekeriyâ'nın oğlu; babasının duasıyla gelen, hikmet ve takvâ peygamberi.",
    olaylar: [
      "Küçük yaşta hikmet ve kitap verildi.",
      "Benî İsrâil'i tevhid ve takvâya çağırdı.",
      "Kavminin ileri gelenlerine çirkinlikten sakındı.",
      "Sonuçta şehit edildi; davetini tamamladı.",
    ],
    ders:
      "Hikmet ve takvâ ile yaşamak; doğruya çağrıyı sonuna kadar sürdürmek.",
    kaynak: "Meryem 19:12-15 · Âl-i İmrân 3:38-39 · Enbiyâ 21:89-90",
  },
  {
    ad: "Îsâ",
    adAr: "عيسى",
    ozet:
      "Meryem'in oğlu; Allah'ın kelimesi olan babasız doğan ve İncil'i verilen peygamber.",
    olaylar: [
      "Bebekken beşikten konuştu; bu bir mucizeydi.",
      "Allah'ın izniyle körleri iyileştirdi ve ölüleri diriltti.",
      "İncil verildi; Tevrat'ı doğruladı.",
      "Sonunda Allah onu kendine yükseltti; ölümüne çarmıh olayı uydurma kabul edildi.",
    ],
    ders:
      "Allah'ın kudreti her şeye yeter; Îsâ, Allah'ın oğlu değil kulu ve resûlüdür.",
    kaynak: "Âl-i İmrân 3:42-64 · Meryem 19:16-40 · Nisâ 4:171-172",
  },
  {
    ad: "Muhammed",
    adAr: "محمد ﷺ",
    ozet:
      "Son peygamber (s.a.v.); Kur'ân'ın ona nâzil edildiği, insanlığın rahmet peygamberi.",
    olaylar: [
      "Mekke'de doğdu; kırk yaşında Hira mağarasında ilk vahyi aldı.",
      "Yıllarca Mekke'de tevhid daveti yaptı; bu yolculukta zulme uğradı.",
      "Hicret ile Medine'ye yerleşti; müslüman toplumu orada kuruldu.",
      "Vahiy süresince Kur'ân âyet âyet nâzil oldu.",
      "Hayatının sonunda İslam, Arap yarımadasına yayıldı.",
    ],
    ders:
      "Sünnet, O'nun hayatından ibret dolu mirastır; Hadis, yolunun ipuçlarıdır.",
    kaynak: "Alak 96:1-5 · Ahzâb 33:40 (hâtemü'n-nebiyyîn) · Furkân 25:1",
  },
];
