// ════════════════════════════════════════════════════════
// ILMIHALEK4DATA.TS — İlmihal Akademisi ek dersleri (4/4)
// sular-necaset · tilavet-secdesi · akika · faiz-banka · yeme-giyim
// buyuk-gunahlar · komsuluk · mezhepler · fikih-terimleri · ibadet-hikmet
//
// ★ SAHİHLİK: Hanefî mezhebinin yaygın (Diyanet İlmihali ile uyumlu) görüşleri.
//   Hadis numarası YAZILMAZ; kitap/bölüm adı verilir. Zayıf rivayet kullanılmaz.
//   İhtilaflı konularda "Hanefî'ye göre" kaydı düşülür.
// ════════════════════════════════════════════════════════

import type { IlmihalDers } from "./ilmihalData";

export const ILMIHAL_EK4_DERSLERI: IlmihalDers[] = [
  // ───────────────────── 1 ─────────────────────
  {
    id: "sular-necaset",
    ad: "Sular ve Necâset",
    emoji: "💧",
    alt: "Temiz su ölçüleri, necâset çeşitleri, istinca ve tuvalet edebi",
    maddeler: [
      {
        baslik: "Suların hükmü",
        metin:
          "Mutlak su (yağmur, kuyu, kaynak, deniz) temizleyicidir. Rengi, kokusu veya tadı necâsetle değişmiş su abdeste ve gusle kullanılamaz. Kullanılmış su ile abdest alınmaz.",
        delil: "Mâide 5:6; Buhârî, Vudû; Müslim, Tahâret",
      },
      {
        baslik: "Necâset çeşitleri",
        metin:
          "Hanefî'ye göre necâset ağır ve hafif olarak ikiye ayrılır. Kan, idrar, dışkı, domuz eti gibi necâsetler ağırdır; elbisenin avuç içi kadar az kısmı namaza engel olmaz. Hafif necâsette ölçü elbisenin dörtte biridir.",
        delil: "Buhârî, Vudû; Diyanet İlmihali, Necâset",
      },
      {
        baslik: "Elbise ve yerin temizliği",
        metin:
          "Namazın geçerli olması için beden, elbise ve namaz kılınan yerin necâsetten temiz olması gerekir. Necâset, su ile yıkanarak giderilir; su bulunmazsa temizlik imkânına göre hareket edilir.",
        delil: "Mâide 5:6; Buhârî, Salât",
      },
      {
        baslik: "İstinca ve istibra",
        metin:
          "Tuvalet sonrası temizlik su ile yapılır; taş/kâğıt ile temizlik de caizdir. İdrar damlasının kesilmesi (istibra) beklenir; acele etmek abdestin sıhhatini bozar.",
        delil: "Buhârî, Vudû; Müslim, Tahâret",
      },
      {
        baslik: "Tuvalet edebi",
        metin:
          "Kıbleye ön/arka dönmemek, sağ elle temizlenmemek, su ve temizlik malzemesini önceden hazırlamak sünnettir. Kapalı yerde konuşmamak ve acele etmemek edeptendir.",
        delil: "Buhârî, Vudû; Müslim, Tahâret; Tirmizî, Tahâret",
      },
      {
        baslik: "Su bulunmadığında",
        metin:
          "Su yoksa veya kullanılamıyorsa temiz toprakla teyemmüm edilir. Teyemmüm abdest ve gusül yerine geçer; su bulununca hüküm sona erer.",
        delil: "Mâide 5:6; Nisâ 4:43; Buhârî, Teyemmüm",
      },
    ],
    sorular: [
      {
        soru: "Rengi, kokusu veya tadı necâsetle değişmiş su ile abdest alınır mı?",
        secenekler: ["Alınır", "Alınmaz", "Sadece gusülde alınır", "İki katıyla alınır"],
        cevap: 1,
        aciklama: "Vasıfları necâsetle değişen su temizleyici değildir; abdest ve gusle kullanılamaz.",
        kaynak: "Mâide 5:6; Buhârî, Vudû",
      },
      {
        soru: "Hanefî'ye göre ağır necâsette namaza engel olmayan ölçü nedir?",
        secenekler: ["Avuç içi kadar", "Elbisenin tamamı", "Dörtte bir", "Yarım"],
        cevap: 0,
        aciklama: "Ağır necâsette avuç içi kadar az miktar namaza engel olmaz; hafifte ölçü dörtte birdir.",
        kaynak: "Diyanet İlmihali, Necâset",
      },
      {
        soru: "Su bulunmadığında hangi çözüm uygulanır?",
        secenekler: ["Teyemmüm", "Namaz terk edilir", "Yalnız dua edilir", "Abdest alınmadan kılınır"],
        cevap: 0,
        aciklama: "Su yoksa temiz toprakla teyemmüm edilir; bu abdest ve gusül yerine geçer.",
        kaynak: "Mâide 5:6; Buhârî, Teyemmüm",
      },
    ],
  },

  // ───────────────────── 2 ─────────────────────
  {
    id: "tilavet-secdesi",
    ad: "Tilavet Secdesi",
    emoji: "🕌",
    alt: "Secde ayetleri, vacip hükmü ve namaz içinde-dışında yapılışı",
    maddeler: [
      {
        baslik: "Secde ayetleri",
        metin:
          "Hanefî'ye göre Kur'an'da on dört secde ayeti vardır. Bu ayetlerden biri okunduğunda veya işitildiğinde tilavet secdesi gerekir.",
        delil: "A'râf 7:206; İsrâ 17:109; Buhârî, Sücûd",
      },
      {
        baslik: "Hükmü",
        metin:
          "Tilavet secdesi Hanefî'ye göre vaciptir. Yapılmadığında günah olur; kaza edilmesi gerekir. Şükür secdesi ise nafiledir.",
        delil: "Diyanet İlmihali, Tilavet Secdesi; Buhârî, Sücûd",
      },
      {
        baslik: "Namaz dışında yapılışı",
        metin:
          "Ayet okunduktan sonra niyet edilir, tekbir alınır, secdeye gidilir ve tekbirle kalkılır. Secdede üç defa \"Sübhâne rabbiye'l-a'lâ\" denir.",
        delil: "Buhârî, Sücûd; Diyanet İlmihali",
      },
      {
        baslik: "Namaz içinde okunursa",
        metin:
          "Namazda secde ayeti okunursa, rükû veya secdeye gidilerek tilavet secdesi yerine getirilir. Ayrıca secde gerekmez; namazın kendi secdesi yeterlidir.",
        delil: "Buhârî, Sücûd; Diyanet İlmihali",
      },
      {
        baslik: "Kimler yapar",
        metin:
          "Ayeti okuyan ve işiten Müslüman tilavet secdesi yapar. Abdestsiz kişi secdeyi yapmaz; abdest aldıktan sonra kaza eder.",
        delil: "Diyanet İlmihali, Tilavet Secdesi",
      },
      {
        baslik: "Geciktirme",
        metin:
          "Tilavet secdesi, imkân varsa hemen yapılır. Mazeret hâlinde sonraya bırakılabilir; ancak unutulması uygun değildir.",
        delil: "Diyanet İlmihali; Buhârî, Sücûd",
      },
    ],
    sorular: [
      {
        soru: "Hanefî'ye göre tilavet secdesinin hükmü nedir?",
        secenekler: ["Farz", "Vacip", "Sünnet", "Müstehap"],
        cevap: 1,
        aciklama: "Tilavet secdesi Hanefî'ye göre vaciptir.",
        kaynak: "Diyanet İlmihali, Tilavet Secdesi",
      },
      {
        soru: "Namaz içinde secde ayeti okunursa ne olur?",
        secenekler: [
          "Namazın secdesi yeterlidir",
          "Namaz bozulur",
          "Ayrı secde gerekir",
          "Namaz yeniden kılınır",
        ],
        cevap: 0,
        aciklama: "Namazdaki rükû veya secde, tilavet secdesi yerine geçer.",
        kaynak: "Buhârî, Sücûd",
      },
      {
        soru: "Hanefî'ye göre secde ayetlerinin sayısı kaçtır?",
        secenekler: ["11", "14", "15", "20"],
        cevap: 1,
        aciklama: "Hanefî mezhebinde secde ayetleri on dörttür.",
        kaynak: "Diyanet İlmihali, Tilavet Secdesi",
      },
    ],
  },

  // ───────────────────── 3 ─────────────────────
  {
    id: "akika",
    ad: "Akika ve Çocuk Hakları",
    emoji: "👶",
    alt: "Doğum şükür kurbanı, isim, sünnet, nafaka ve yetim hakkı",
    maddeler: [
      {
        baslik: "Akika nedir?",
        metin:
          "Akika, çocuk doğduğunda Allah'a şükür için kesilen kurbandır. Hanefî'ye göre bir hayvan yeterlidir; erkek için iki, kız için bir kesmek müstehaptır.",
        delil: "Tirmizî, Edâhî; Ebû Dâvûd, Edâhî; Diyanet İlmihali",
      },
      {
        baslik: "Zamanı ve eti",
        metin:
          "Akika genellikle doğumun yedinci günü kesilir; isim de o gün verilir. Etin pişirilip dağıtılması ve yakınların davet edilmesi sünnettir.",
        delil: "Tirmizî, Edâhî; Buhârî, Akîka",
      },
      {
        baslik: "İsim ve ezan",
        metin:
          "Çocuğa güzel isim vermek sünnettir. Doğduktan sonra sağ kulağına ezan, sol kulağına kamet okunması yaygın uygulamadır.",
        delil: "Buhârî, Edeb; Ebû Dâvûd, Edeb",
      },
      {
        baslik: "Sünnet (hitan)",
        metin:
          "Erkek çocuğun sünnet edilmesi İslâm'ın alâmetlerinden ve fıtrat sünnetlerindendir. Sağlık açısından uygun zamanda yapılması esastır.",
        delil: "Buhârî, Libâs (fıtrat sünnetleri); Müslim, Tahâret",
      },
      {
        baslik: "Nafaka ve eğitim",
        metin:
          "Çocuğun barınma, gıda, giyim ve eğitim masrafı babaya aittir. Çocuğu ihmal etmek kul hakkıdır; eğitimde dinî ve dünyevî denge gözetilir.",
        delil: "Bakara 2:233; Talâk 65:6; Nisâ 4:6",
      },
      {
        baslik: "Yetim hakkı",
        metin:
          "Yetimin malı korunur, velisi onu en güzel şekilde yönetir. Yetim malını haksız yere yemek büyük günahlardandır; yetimi sevindirmek teşvik edilmiştir.",
        delil: "Nisâ 4:2, 4:6, 4:10; Buhârî, Vesâyâ",
      },
    ],
    sorular: [
      {
        soru: "Akika hangi amaçla kesilir?",
        secenekler: ["Doğum şükrü", "Hac tamamlamak", "Oruç kefâreti", "Ticaret bereketi"],
        cevap: 0,
        aciklama: "Akika, çocuk doğduğunda şükür için kesilen kurbandır.",
        kaynak: "Tirmizî, Edâhî",
      },
      {
        soru: "Hanefî'ye göre akika için kaç hayvan yeterlidir?",
        secenekler: ["Bir", "İki", "Üç", "Yedi"],
        cevap: 0,
        aciklama: "Bir hayvan yeterlidir; iki (erkek) veya bir (kız) müstehaptır.",
        kaynak: "Diyanet İlmihali, Akika",
      },
      {
        soru: "Çocuğun nafakası kimin borcudur?",
        secenekler: ["Annenin", "Babanın", "Dedenin", "Devletin"],
        cevap: 1,
        aciklama: "Barınma, gıda, giyim ve eğitim masrafı babaya aittir.",
        kaynak: "Bakara 2:233; Talâk 65:6",
      },
    ],
  },

  // ───────────────────── 4 ─────────────────────
  {
    id: "faiz-banka",
    ad: "Faiz, Banka ve Sigorta",
    emoji: "🏦",
    alt: "Ribâ çeşitleri, kredi, katılım bankacılığı ve sigorta hükmü",
    maddeler: [
      {
        baslik: "Faiz haramdır",
        metin:
          "Kur'an faizi açıkça haram kılar ve faizle borç verenin ahirette büyük sorumluluk altında olduğunu bildirir. Faiz, emeksiz kazanç ve borçlunun sömürülmesidir.",
        delil: "Bakara 2:275-279; Müslim, Müsâkât",
      },
      {
        baslik: "Ribâ çeşitleri",
        metin:
          "Fıkıhta faiz iki başlıkta ele alınır: aynı cins malın fazlasıyla değiştirilmesi (ribâ el-fadl) ve vadenin karşılık olarak eklenmesi (ribâ en-nesîe). İkisi de haramdır.",
        delil: "Buhârî, Büyû'; Müslim, Müsâkât",
      },
      {
        baslik: "Banka faizi ve kredi",
        metin:
          "Faizli kredi ve mevduat faizi Hanefî fıkhında haram kabul edilir. Zaruret hâli ancak gerçek ve ölçülü bir ihtiyaçla sınırlıdır; kolaylık olsun diye faize yönelmek caiz değildir.",
        delil: "Bakara 2:279; Diyanet İlmihali, Faiz",
      },
      {
        baslik: "Katılım bankacılığı",
        metin:
          "Katılım bankaları faiz yerine kâr-zarar ortaklığı, murabaha ve leasing gibi akitlerle çalışır. İşlem incelenirken akdin gerçekten helâl şartlara uyup uymadığına bakılır.",
        delil: "Bakara 2:275; Diyanet İlmihali, Katılım Bankacılığı",
      },
      {
        baslik: "Sigorta hükmü",
        metin:
          "Geleneksel sigorta, Hanefî fıkhında garar (belirsizlik) ve faiz unsurları sebebiyle caiz görülmez. Kooperatif/tekâfül modeli, dayanışma esasına dayandığı için alternatif olarak sunulur.",
        delil: "Diyanet İlmihali, Sigorta; Müslim, Büyû'",
      },
      {
        baslik: "Borsa ve hisse",
        metin:
          "Helâl iş kollarında faaliyet gösteren şirketlerin hisseleri alınabilir. Faiz, kumar, alkol gibi haram unsurların baskın olduğu şirketlerde ihtiyat gerekir.",
        delil: "Bakara 2:275; Diyanet İlmihali, Hisse Senedi",
      },
    ],
    sorular: [
      {
        soru: "Faiz hangi ayetlerde açıkça haram kılınmıştır?",
        secenekler: ["Bakara 2:275-279", "Nisâ 4:11", "Mâide 5:6", "Talâk 65:7"],
        cevap: 0,
        aciklama: "Bakara 2:275-279 faizi açıkça haram kılar.",
        kaynak: "Bakara 2:275-279",
      },
      {
        soru: "Hanefî fıkhında faizli kredi için hangisi doğrudur?",
        secenekler: ["Haramdır", "Mubahtır", "Sadece günah değildir", "Farzdır"],
        cevap: 0,
        aciklama: "Faizli kredi ve mevduat faizi haram kabul edilir.",
        kaynak: "Bakara 2:279; Diyanet İlmihali",
      },
      {
        soru: "Geleneksel sigorta yerine önerilen dayanışma modeli nedir?",
        secenekler: ["Tekâfül/kooperatif", "Banka kredisi", "Borsa", "Kumar"],
        cevap: 0,
        aciklama: "Tekâfül/kooperatif sigorta, dayanışma esasına dayanan alternatiftir.",
        kaynak: "Diyanet İlmihali, Sigorta",
      },
    ],
  },

  // ───────────────────── 5 ─────────────────────
  {
    id: "yeme-giyim",
    ad: "Yeme-İçme ve Giyim Adabı",
    emoji: "🍽️",
    alt: "Sofra edebi, israf, avret ölçüsü ve tesettür",
    maddeler: [
      {
        baslik: "Sofra edebi",
        metin:
          "Yemeğe besmele ile başlanır, sağ elle ve oturarak yenir. Yemek seçmemek, tabağı temizlemek ve şükretmek sünnettir.",
        delil: "Buhârî, Et'ime; Müslim, Eşribe",
      },
      {
        baslik: "İsraf haramdır",
        metin:
          "Yemekte ve içmede ölçüyü aşmak, israf etmek ve nimeti çöpe atmak haramdır. Kur'an, yiyip içerken israf etmemeyi emreder.",
        delil: "A'râf 7:31; Buhârî, Et'ime",
      },
      {
        baslik: "Haram gıdalar",
        metin:
          "Domuz, leş, kan, sarhoşluk veren içkiler ve Allah'tan başkası adına kesilen hayvanlar haramdır. Şüpheli katkı maddelerinde ihtiyatlı davranılır.",
        delil: "Bakara 2:168, 2:173; Mâide 5:3, 5:90",
      },
      {
        baslik: "Avret ve örtünme",
        metin:
          "Erkekte avret göbek ile diz kapağı arasıdır. Kadında avret, el ve yüz dışında bütün bedendir; tesettür ölçüsü Nûr 24:31 ve Ahzâb 33:59'da bildirilir.",
        delil: "Nûr 24:30-31; Ahzâb 33:59",
      },
      {
        baslik: "Giyimde ölçü",
        metin:
          "Giyim temiz, ölçülü ve topluma uygun olmalıdır; israf ve gösteriş (şöhret libası) sakınılır. Erkeklere saf ipek ve altın yüzük haramdır.",
        delil: "A'râf 7:31; Buhârî, Libâs; Müslim, Libâs",
      },
      {
        baslik: "Temizlik ve koku",
        metin:
          "Beden, ağız ve elbise temizliği; güzel koku kullanmak sünnettir. Cemaate giderken temizlik ve kokuya özen gösterilir.",
        delil: "Buhârî, Cuma; Müslim, Tahâret",
      },
    ],
    sorular: [
      {
        soru: "Yemeğe nasıl başlanır?",
        secenekler: ["Besmele ile", "Sessizce", "Ayakta", "Sol elle"],
        cevap: 0,
        aciklama: "Yemeğe besmele ile başlanır; sağ elle ve oturarak yenir.",
        kaynak: "Buhârî, Et'ime",
      },
      {
        soru: "İsraf hakkında hangisi doğrudur?",
        secenekler: ["Haramdır", "Mubahtır", "Sünnettir", "Vaciptir"],
        cevap: 0,
        aciklama: "A'râf 7:31 israfı yasaklar; nimeti çöpe atmak haramdır.",
        kaynak: "A'râf 7:31",
      },
      {
        soru: "Erkekte avret sınırı nedir?",
        secenekler: ["Göbek ile diz kapağı arası", "Yalnız göğüs", "Yalnız diz", "Sınır yok"],
        cevap: 0,
        aciklama: "Erkekte avret göbek ile diz kapağı arasıdır.",
        kaynak: "Buhârî, Salât; Diyanet İlmihali",
      },
    ],
  },

  // ───────────────────── 6 ─────────────────────
  {
    id: "buyuk-gunahlar",
    ad: "Büyük Günahlar ve Tövbe",
    emoji: "⚠️",
    alt: "Kebâir, tövbenin şartları ve kul hakkıyla helalleşme",
    maddeler: [
      {
        baslik: "Büyük günahlar",
        metin:
          "Şirk, ana-babaya isyan, haksız yere adam öldürme, yetim malı yemek, faiz, zina, iftira, içki ve sihir büyük günahlardandır. Namazı kasten terk etmek de bu kapsamda değerlendirilir.",
        delil: "Nisâ 4:31; İsrâ 17:23-37; Buhârî, Vesâyâ; Müslim, Îmân",
      },
      {
        baslik: "Tövbenin şartları",
        metin:
          "Tövbe; günahı bırakmak, yaptığına pişman olmak ve bir daha yapmamaya karar vermekle olur. Kul hakkı varsa hak sahibiyle helalleşmek veya tazmin etmek de gerekir.",
        delil: "Tahrîm 66:8; Nûr 24:31; Buhârî, Edeb",
      },
      {
        baslik: "İstiğfar ve dua",
        metin:
          "İstiğfar, bağışlanma dilemektir; sadece dille söylemek yetmez, kalbin pişmanlığı gerekir. Peygamberimiz günde yetmişten fazla istiğfar etmiştir.",
        delil: "Buhârî, Deavât; Müslim, Zikir",
      },
      {
        baslik: "Ümit ve korku dengesi",
        metin:
          "Mümin, Allah'ın rahmetinden ümit kesmez; fakat günahı da küçümsemez. Korku ile ümit arasında yaşamak, tövbede kararlılığı korur.",
        delil: "Zümer 39:53; Nisâ 4:110",
      },
      {
        baslik: "Günahı küçümsememek",
        metin:
          "Günahı küçük görmek, onu işlemekten daha tehlikelidir. Küçük günahlar birikerek kalbi karartır; sürekli istiğfar ve iyi amel bu birikimi temizler.",
        delil: "Buhârî, Edeb; Müslim, Birr",
      },
      {
        baslik: "Kul hakkı",
        metin:
          "Kul hakkı, sahibi helal etmedikçe veya tazmin edilmedikçe düşmez. İbadetler kul hakkının yerini tutmaz; bu yüzden borç, gasp ve iftira gibi konularda önce helalleşmek gerekir.",
        delil: "Buhârî, Mezâlim; Müslim, Birr",
      },
    ],
    sorular: [
      {
        soru: "Tövbenin geçerli olması için hangisi gerekir?",
        secenekler: ["Pişmanlık ve günahı bırakmak", "Yalnız söz söylemek", "Para vermek", "Oruç tutmak"],
        cevap: 0,
        aciklama: "Tövbe; bırakmak, pişman olmak ve tekrarlamamaya karar vermektir.",
        kaynak: "Tahrîm 66:8; Nûr 24:31",
      },
      {
        soru: "Kul hakkı nasıl düşer?",
        secenekler: ["Helalleşme veya tazminle", "İstiğfarla", "Sadakayla", "Hacla"],
        cevap: 0,
        aciklama: "Kul hakkı, hak sahibi helal etmeden veya tazmin edilmeden düşmez.",
        kaynak: "Buhârî, Mezâlim",
      },
      {
        soru: "Aşağıdakilerden hangisi büyük günahlardandır?",
        secenekler: ["Yetim malı yemek", "Erken uyumak", "Az konuşmak", "Yürüyüşe çıkmak"],
        cevap: 0,
        aciklama: "Yetim malı yemek Nisâ 4:10'da büyük bir günah olarak bildirilir.",
        kaynak: "Nisâ 4:10; Buhârî, Vesâyâ",
      },
    ],
  },

  // ───────────────────── 7 ─────────────────────
  {
    id: "komsuluk",
    ad: "Aile, Komşu ve Akraba Hakları",
    emoji: "🏘️",
    alt: "Anne-baba hakkı, sıla-i rahim, komşuluk ve misafir hakkı",
    maddeler: [
      {
        baslik: "Anne-baba hakkı",
        metin:
          "Anne-babaya iyi davranmak, yaşlandıklarında öf bile dememek Kur'an'ın açık emridir. Onların bakımı, duası ve gönlünü hoş tutmak evladın borcudur.",
        delil: "İsrâ 17:23-24; Lokmân 31:14; Buhârî, Edeb",
      },
      {
        baslik: "Sıla-i rahim",
        metin:
          "Akrabayı ziyaret etmek, hâlini sormak ve ihtiyaç anında yanında olmak sıla-i rahimdir. Akrabalık bağını koparmak büyük günahlardandır.",
        delil: "Nisâ 4:1; Ra'd 13:21; Buhârî, Edeb",
      },
      {
        baslik: "Komşu hakkı",
        metin:
          "Komşu, yakınlık derecesine göre hak sahibidir; selam, hal-hatır ve ihtiyaç anında yardım komşuluğun gereğidir. Komşuyu rahatsız etmek ve hakkına tecavüz etmek caiz değildir.",
        delil: "Nisâ 4:36; Buhârî, Edeb; Müslim, Birr",
      },
      {
        baslik: "Misafir hakkı",
        metin:
          "Misafiri ağırlamak sünnettir; en az bir gün ikram, üç güne kadar ağırlama ölçüsü bildirilmiştir. Misafir de ev sahibinin hâline göre davranır.",
        delil: "Buhârî, Edeb; Müslim, Birr",
      },
      {
        baslik: "Yetim ve komşu çocuğu",
        metin:
          "Yetimi ve komşu çocuğunu gözetmek, sevindirmek ve eğitimine destek olmak teşvik edilmiştir. Çocuklar arasında ayrım yapmak gönül kırar.",
        delil: "Buhârî, Edeb; Müslim, Zühd",
      },
      {
        baslik: "Selam, hediye ve af",
        metin:
          "Selamı yaymak, hediyeyle gönül almak ve özür dileyeni affetmek Müslümanın ahlâkıdır. Küskünlüğü üç günden fazla sürdürmek doğru değildir.",
        delil: "Buhârî, Edeb; Müslim, Birr",
      },
    ],
    sorular: [
      {
        soru: "Anne-babaya karşı temel ölçü hangisidir?",
        secenekler: ["İyi davranmak, öf bile dememek", "Yılda bir ziyaret", "Sadece maddi yardım", "Sadece bayramda aramak"],
        cevap: 0,
        aciklama: "İsrâ 17:23-24 anne-babaya iyi davranmayı ve öf dememeyi emreder.",
        kaynak: "İsrâ 17:23-24",
      },
      {
        soru: "Akrabalık bağını koparmak nasıl değerlendirilir?",
        secenekler: ["Büyük günah", "Mübah", "Sünnet", "Vacip"],
        cevap: 0,
        aciklama: "Sıla-i rahmi koparmak büyük günahlardandır.",
        kaynak: "Buhârî, Edeb; Müslim, Birr",
      },
      {
        soru: "Komşuluk hakkı hangi ayette bildirilir?",
        secenekler: ["Nisâ 4:36", "Bakara 2:275", "Mâide 5:6", "Talâk 65:7"],
        cevap: 0,
        aciklama: "Nisâ 4:36 komşu, akraba ve yetim haklarını birlikte bildirir.",
        kaynak: "Nisâ 4:36",
      },
    ],
  },

  // ───────────────────── 8 ─────────────────────
  {
    id: "mezhepler",
    ad: "Mezhepler ve İçtihat",
    emoji: "🏛️",
    alt: "Mezhebin gereği, dört imam, taklit ve ihtilaf edebi",
    maddeler: [
      {
        baslik: "Mezhep nedir?",
        metin:
          "Mezhep, Kur'an ve sünnetten hüküm çıkarma yolunun sistemleşmiş hâlidir. Fıkhî mezhepler, müctehid imamların ictihad yöntemlerini ve hükümlerini ifade eder.",
        delil: "Nahl 16:43; Nisâ 4:59; Diyanet İlmihali, Mezhepler",
      },
      {
        baslik: "Dört mezhep imamı",
        metin:
          "Hanefî (Ebû Hanîfe), Mâlikî (İmam Mâlik), Şâfiî (İmam Şâfiî) ve Hanbelî (Ahmed b. Hanbel) mezhepleri yaygın Sünnî fıkıh ekolleridir.",
        delil: "Diyanet İlmihali, Mezhepler Tarihi",
      },
      {
        baslik: "Mezhebe uymanın anlamı",
        metin:
          "Bir mezhebe uymak, onun yöntemini benimseyip hükümlerini tutarlı biçimde uygulamaktır. İşine gelen hükmü seçip diğerini bırakmak (telfik) ihtiyatla karşılanır.",
        delil: "Diyanet İlmihali, Taklit ve Telfik",
      },
      {
        baslik: "Mezhep değiştirme",
        metin:
          "Mezhep değiştirmek, yeni mezhebin şartlarını bilmek ve tutarlı uygulamak kaydıyla mümkündür. Amacı kolayına kaçmak olan seçicilik dinî sorumluluğu kaldırmaz.",
        delil: "Diyanet İlmihali, Mezhep Değiştirme",
      },
      {
        baslik: "İhtilaf edebi",
        metin:
          "Mezhepler arası farklar rahmet ve genişlik olarak görülür; birbirini tekfir etmek yanlıştır. Hüküm ayrılıklarında delil ve edep gözetilir.",
        delil: "Âl-i İmrân 3:103; Diyanet İlmihali",
      },
      {
        baslik: "İçtihat ve fetva",
        metin:
          "İçtihat, hüküm çıkarma çabasıdır; fetva ise sorulan meseleye verilen cevaptır. Fetva, ehil kişi ve kurumlardan alınır; kişisel görüş fetva yerine geçmez.",
        delil: "Nisâ 4:59; Nahl 16:43",
      },
    ],
    sorular: [
      {
        soru: "Fıkhî mezhep neyi ifade eder?",
        secenekler: [
          "Hüküm çıkarma yönteminin sistemleşmiş hâlini",
          "Yeni bir dinî kitap",
          "Siyasi bir parti",
          "Tasavvuf tarikatı",
        ],
        cevap: 0,
        aciklama: "Mezhep, ictihad yöntemi ve hükümlerin sistemleşmiş hâlidir.",
        kaynak: "Diyanet İlmihali, Mezhepler",
      },
      {
        soru: "Aşağıdakilerden hangisi dört yaygın Sünnî mezhepten biri değildir?",
        secenekler: ["Hanefî", "Mâlikî", "Şâfiî", "Cehmiyye"],
        cevap: 3,
        aciklama: "Yaygın dört mezhep Hanefî, Mâlikî, Şâfiî ve Hanbelî'dir.",
        kaynak: "Diyanet İlmihali, Mezhepler",
      },
      {
        soru: "İhtilaf konusunda doğru tutum nedir?",
        secenekler: ["Edep ve delil gözetmek", "Tekfir etmek", "Tartışmayı büyütmek", "Hükmü gizlemek"],
        cevap: 0,
        aciklama: "Mezhep farkları edeple ele alınır; tekfir yanlıştır.",
        kaynak: "Âl-i İmrân 3:103",
      },
    ],
  },

  // ───────────────────── 9 ─────────────────────
  {
    id: "fikih-terimleri",
    ad: "Fıkıh Terimleri",
    emoji: "📖",
    alt: "Farz, vacip, sünnet, mekruh, sahih-fasit ve ruhsat kavramları",
    maddeler: [
      {
        baslik: "Farz",
        metin:
          "Farz, kesin delille sabit ve yapılması zorunlu hükümdür. Terk edilmesi günah, inkârı küfürdür; farzların yerine getirilmesi dinin temelidir.",
        delil: "Diyanet İlmihali, Fıkhî Hükümler",
      },
      {
        baslik: "Vacip ve sünnet",
        metin:
          "Vacip, farz kadar kesin olmayan ama bağlayıcı hükümdür; terk edilmesi günah, inkârı küfür değildir. Sünnet ise Peygamberimizin yaptığı ve yapılması teşvik edilen ameldir.",
        delil: "Diyanet İlmihali, Fıkhî Hükümler",
      },
      {
        baslik: "Müstehap, mübah, mekruh",
        metin:
          "Müstehap yapılması sevilen, mübah serbest olan, mekruh ise yapılması hoş görülmeyen fiillerdir. Mekruh, haram gibi kesin yasak değildir; ancak tekrarından sakınılır.",
        delil: "Diyanet İlmihali, Fıkhî Hükümler",
      },
      {
        baslik: "Haram ve helâl",
        metin:
          "Haram, kesin delille yasaklanan fiildir; helâl ise serbest bırakılandır. Haramı helâl saymak veya helâlı haram saymak dinî açıdan sakıncalıdır.",
        delil: "Bakara 2:168, 2:173; Diyanet İlmihali",
      },
      {
        baslik: "Sahih, bâtıl ve fâsit",
        metin:
          "Sahih, şartları tam yerine getirilmiş ameldir; bâtıl, temel şartı olmayan geçersiz ameldir. Fâsit ise aslı doğru olmakla birlikte bir şartı eksik olan işlemdir.",
        delil: "Diyanet İlmihali, Fıkhî Hükümler",
      },
      {
        baslik: "Azimet ve ruhsat",
        metin:
          "Azimet, hükmün aslını uygulamaktır; ruhsat ise özür hâlinde verilen kolaylıktır. Ruhsat, gerçek mazerete dayanır ve ölçüsünü aşmaz.",
        delil: "Bakara 2:185; Diyanet İlmihali, Ruhsat",
      },
    ],
    sorular: [
      {
        soru: "Terk edilmesi günah olan, inkârı küfür sayılan hüküm hangisidir?",
        secenekler: ["Farz", "Sünnet", "Müstehap", "Mübah"],
        cevap: 0,
        aciklama: "Farz, kesin delille sabittir; terk edilmesi günah, inkârı küfürdür.",
        kaynak: "Diyanet İlmihali, Fıkhî Hükümler",
      },
      {
        soru: "Mekruh ile haram arasındaki fark nedir?",
        secenekler: [
          "Mekruh kesin yasak değildir",
          "Mekruh daha ağırdır",
          "İkisi aynıdır",
          "Mekruh farzdır",
        ],
        cevap: 0,
        aciklama: "Mekruh, haram gibi kesin yasak değildir; yapılması hoş görülmez.",
        kaynak: "Diyanet İlmihali, Fıkhî Hükümler",
      },
      {
        soru: "Özür hâlinde verilen kolaylığa ne denir?",
        secenekler: ["Ruhsat", "Azimet", "Farz", "Bâtıl"],
        cevap: 0,
        aciklama: "Ruhsat, özür hâlinde verilen kolaylıktır; asıl hüküm azimettir.",
        kaynak: "Bakara 2:185; Diyanet İlmihali",
      },
    ],
  },

  // ───────────────────── 10 ─────────────────────
  {
    id: "ibadet-hikmet",
    ad: "İbadetin Hikmeti ve Niyet",
    emoji: "🎯",
    alt: "Niyet, ihlâs, devamlılık, bid'at ve ibadetin kabul şartları",
    maddeler: [
      {
        baslik: "Niyet",
        metin:
          "Ameller niyete göredir; niyet, ibadeti âdetten ayırır. Niyetin yeri kalptir; dille söylemek kolaylık içindir, asıl olan kalbin yönelmesidir.",
        delil: "Buhârî, Îmân — \"Ameller niyetlere göredir\"; Müslim, İmâre",
      },
      {
        baslik: "İhlâs",
        metin:
          "İbadet, gösteriş için değil yalnız Allah için yapılır. İhlâs, amelin değerini belirleyen ölçüdür; riya amelin sevabını götürür.",
        delil: "Beyyine 98:5; Buhârî, Îmân",
      },
      {
        baslik: "Kabul şartları",
        metin:
          "Bir ibadetin kabulü için doğru niyet, usulüne uygun yapılış ve helâl yolla desteklenmesi gerekir. Şeklen doğru ama niyetsiz amel, ibadet sayılmaz.",
        delil: "Mâide 5:27; Buhârî, Îmân",
      },
      {
        baslik: "Devamlılık",
        metin:
          "Az da olsa sürekli yapılan amel, çok ama kesintili amelden hayırlıdır. İbadette istikrar, kalbi diri tutar ve alışkanlığı güçlendirir.",
        delil: "Buhârî, Îmân; Müslim, Müsâfirîn",
      },
      {
        baslik: "Bid'at",
        metin:
          "Dinde sonradan uydurulan ve aslı olmayan uygulamalar bid'attir. Bid'at, ibadetin şeklini bozar; ölçü, Kur'an ve sünnete uygunluktur.",
        delil: "Buhârî, İ'tisâm; Müslim, Cuma",
      },
      {
        baslik: "İbadetin hayata etkisi",
        metin:
          "Namaz, oruç ve zekât yalnız bireysel değil toplumsal bir etki taşır: sabır, dürüstlük ve paylaşma kazandırır. İbadet, ahlâkı güzelleştirdiği ölçüde amacına ulaşır.",
        delil: "Ankebût 29:45; Bakara 2:183",
      },
    ],
    sorular: [
      {
        soru: "Amellerin değeri neye göre belirlenir?",
        secenekler: ["Niyete göre", "Süreye göre", "Mekâna göre", "Kişiye göre"],
        cevap: 0,
        aciklama: "Hadiste amellerin niyetlere göre değerlendirileceği bildirilir.",
        kaynak: "Buhârî, Îmân",
      },
      {
        soru: "Riya ne yapar?",
        secenekler: ["İbadetin sevabını götürür", "İbadeti farz yapar", "Namazı uzatır", "Zekâtı artırır"],
        cevap: 0,
        aciklama: "Gösteriş için yapılan ibadet sevabını yitirir; ihlâs esastır.",
        kaynak: "Beyyine 98:5; Buhârî, Îmân",
      },
      {
        soru: "Dinde sonradan uydurulan uygulamaya ne denir?",
        secenekler: ["Bid'at", "Sünnet", "Vacip", "Ruhsat"],
        cevap: 0,
        aciklama: "Aslı olmayan sonradan uydurulmuş uygulamalar bid'attır.",
        kaynak: "Buhârî, İ'tisâm",
      },
    ],
  },
];

export const ILMIHAL_EK4_TOPLAM = {
  ders: ILMIHAL_EK4_DERSLERI.length,
  madde: ILMIHAL_EK4_DERSLERI.reduce((t, d) => t + d.maddeler.length, 0),
  soru: ILMIHAL_EK4_DERSLERI.reduce((t, d) => t + d.sorular.length, 0),
};
