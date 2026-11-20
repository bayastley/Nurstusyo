// ════════════════════════════════════════════════════════
// ILMIHALEK2DATA.TS — İlmihal Akademisi ek dersleri (2/2)
// yemin-adak · dua-zikir · cenaze · ruhsat
// ════════════════════════════════════════════════════════

import type { IlmihalDers } from "./ilmihalData";

export const ILMIHAL_EK2_DERSLERI: IlmihalDers[] = [
  // ───────────────────── 1 ─────────────────────
  {
    id: "yemin-adak",
    ad: "Yemin, Adak ve Kefâret",
    emoji: "🤝",
    alt: "Sözün bağlayıcılığı, adak hükümleri ve kefâret ölçüleri",
    maddeler: [
      {
        baslik: "Yemin ne zaman bağlar",
        metin:
          "Yemin, Allah'ın adına veya sıfatına söz vermektir. Bilerek yapılan ve yerine getirilmeyen yemin bağlayıcıdır; yerine getirilmezse kefâret gerekir. Gelecekte yapılacak bir iş için edilen yemin, o işi bağlar.",
        delil: "Mâide 5:89; Buhârî, Eymân; Diyanet İlmihali, Yemin",
      },
      {
        baslik: "Yemin kefâreti",
        metin:
          "Kefâret üç seçenekten biridir: on fakiri doyuracak kadar yemek, on fakiri giydirmek veya bir köle azat etmek. Bunlara gücü yetmeyen üç gün oruç tutar. Yemin kefâreti, sözün ciddiyetini koruyan bir telâfidir.",
        delil: "Mâide 5:89; Diyanet İlmihali, Yemin Kefâreti",
      },
      {
        baslik: "Yeminin lağv ve gamûs hâli",
        metin:
          "Düşünmeden, dil alışkanlığıyla edilen yemin (lağv) kefâret gerektirmez. Geçmişte olmuş bir şey hakkında bilerek yalan yere yemin etmek (gamûs) ise büyük günahtır ve kefâretle temizlenmez; tövbe gerekir.",
        delil: "Bakara 2:225; Mâide 5:89; Diyanet İlmihali",
      },
      {
        baslik: "Adak (nezir) nedir",
        metin:
          "Adak, kişinin kendisine bir ibadeti farz kılmasıdır: \"Şu işim olursa üç gün oruç tutacağım\" gibi. Şarta bağlı adakta şart gerçekleşince yerine getirmek vacip olur. Adakta asıl olan ibadettir; günah veya haram için adak olmaz.",
        delil: "Hac 22:29 (\"Adaklarını yerine getirsinler\"); Buhârî, Eymân; Diyanet İlmihali, Adak",
      },
      {
        baslik: "Adağın şartları",
        metin:
          "Adak, cinsinden bir farz veya nâfile ibadet olmalıdır. Haram bir şeyi adamak geçersizdir; böyle bir adakta yemin kefâreti ödenir. Adakta belirli bir zaman şart koşulmuşsa o zaman gözetilir.",
        delil: "Buhârî, Eymân; Müslim, Nezr; Diyanet İlmihali, Adak",
      },
      {
        baslik: "Zıhâr ve diğer kefâretler",
        metin:
          "İslâm öncesine ait bir boşama biçimi olan zıhâr, Mücâdele sûresinde kefârete bağlanmıştır: imkân varsa bir köle azat etmek, yoksa iki ay peş peşe oruç, buna da gücü yetmeyen altmış fakiri doyurmak. Kefâretler, hukuku ibadetle onaran hükümlerdir.",
        delil: "Mücâdele 58:3-4; Diyanet İlmihali, Zıhâr",
      },
    ],
    sorular: [
      {
        soru: "Yemin kefâreti olarak gücü yetmeyen kişi ne yapar?",
        secenekler: ["Üç gün oruç tutar", "Hiçbir şey yapmaz", "Bir yıl oruç tutar", "Yalnız tövbe eder"],
        cevap: 0,
        aciklama: "Mâide 5:89'da on fakiri doyurma, giydirme veya köle azadı; buna gücü yetmeyen için üç gün oruç bildirilir.",
        kaynak: "Mâide 5:89",
      },
      {
        soru: "Adak hakkında hangisi doğrudur?",
        secenekler: [
          "Haram bir şey de adanabilir",
          "Günah için adak geçersizdir",
          "Adak hiç bağlayıcı değildir",
          "Adak yalnız para ile olur",
        ],
        cevap: 1,
        aciklama: "Adakta asıl olan ibadettir; günah veya haram için adak geçerli olmaz.",
        kaynak: "Buhârî, Eymân; Müslim, Nezr",
      },
      {
        soru: "Düşünmeden, dil alışkanlığıyla edilen yeminin hükmü nedir?",
        secenekler: ["Kefâret gerekir", "Kefâret gerekmez (lağv)", "Oruç gerekir", "Adak olur"],
        cevap: 1,
        aciklama: "Bakara 2:225, kasıtsız yeminleri sorumluluk dışında tutar; buna lağv yemini denir.",
        kaynak: "Bakara 2:225",
      },
      {
        soru: "Zıhâr kefâretinde ilk seçenek nedir?",
        secenekler: ["Altmış fakiri doyurmak", "İki ay peş peşe oruç", "Köle azat etmek", "Üç gün oruç"],
        cevap: 2,
        aciklama: "Mücâdele 58:3-4'te sıra köle azadı, iki ay oruç, altmış fakiri doyurma şeklindedir.",
        kaynak: "Mücâdele 58:3-4",
      },
    ],
  },

  // ───────────────────── 2 ─────────────────────
  {
    id: "dua-zikir",
    ad: "Dua, Zikir ve Kur'an Edebi",
    emoji: "📖",
    alt: "Duânın âdâbı, zikrin ölçüsü ve Kur'an okuma edebi",
    maddeler: [
      {
        baslik: "Duâ ibadetin özü",
        metin:
          "Kur'an, kulların duâsına icabet edileceğini bildirir. Duâ, Allah ile kul arasındaki doğrudan bağdır; aracı, özel yer ve özel saat şart değildir. Hadis, duâyı \"ibadetin özü\" olarak niteler.",
        delil: "Bakara 2:186; Tirmizî, Deavât; Diyanet İlmihali, Duâ",
      },
      {
        baslik: "Duânın âdâbı",
        metin:
          "Duâya hamd ve salavatla başlamak, yalvararak ve gizli bir sesle istemek, acele etmemek âdâbdandır. Kur'an, duâ ederken haddi aşmamayı ve sesi yükseltmemeyi öğütler.",
        delil: "A'râf 7:55; Tirmizî, Deavât; Diyanet İlmihali, Duânın Âdâbı",
      },
      {
        baslik: "Zikir kalbi diri tutar",
        metin:
          "Zikir, Allah'ı anmak ve hatırda tutmaktır. Kur'an, kalplerin ancak Allah'ı anmakla huzur bulacağını bildirir. Sabah-akşam zikirleri, günün iki ucunu Rabbe bağlayan bir çerçeve kurar.",
        delil: "Ra'd 13:28; Ahzâb 33:41-42; Müslim, Zikir",
      },
      {
        baslik: "Kur'an okumaya başlarken",
        metin:
          "Kur'an okumaya başlarken istiâze (\"Eûzü billâhi mine'ş-şeytâni'r-racîm\") ile başlamak emredilir. Tertîl üzere, acele etmeden ve mânâsını düşünerek okumak tavsiye edilir. Abdestli olmak ve temiz bir yerde okumak edeptendir.",
        delil: "Nahl 16:98; Müzzemmil 73:4; Diyanet İlmihali, Kur'an Okuma Edebi",
      },
      {
        baslik: "Hatim ve sûre takibi",
        metin:
          "Kur'an'ı baştan sona okumak (hatim) güzel bir gelenektir; ancak ölçü, okunanı anlamaya çalışmaktır. Bir cüzü veya sûreyi günlük programa bağlamak, sürekliliği sağlar. Az ama devamlı okuma, bir defalık uzun okumadan daha kalıcıdır.",
        delil: "Buhârî, Fedâilü'l-Kur'ân; Müslim, Müsâfirîn",
      },
      {
        baslik: "Kur'an'ı hayata geçirmek",
        metin:
          "Kur'an okumanın amacı yalnız sevap değil, hüküm ve öğütlerini yaşamaktır. Bir âyeti okuyup gereğince davranmak, sayfalarca okumaktan daha etkili olabilir. Hz. Âişe, Peygamber'in ahlâkını \"Kur'an ahlâkı\" diye tanımlamıştır.",
        delil: "Müslim, Müsâfirîn; Diyanet İlmihali, Kur'an Ahlâkı",
      },
    ],
    sorular: [
      {
        soru: "Kur'an okumaya başlarken ne yapmak emredilir?",
        secenekler: ["İstiâze (Eûzü) ile başlamak", "Yüksek sesle konuşmak", "Önce yemek yemek", "Sessizce beklemek"],
        cevap: 0,
        aciklama: "Nahl 16:98, Kur'an okumaya başlarken şeytandan Allah'a sığınmayı emreder.",
        kaynak: "Nahl 16:98",
      },
      {
        soru: "Kalplerin huzur bulması hangi âyette zikre bağlanır?",
        secenekler: ["Ra'd 13:28", "Bakara 2:255", "Nâs 114:1", "Fîl 105:1"],
        cevap: 0,
        aciklama: "\"Kalpler ancak Allah'ı anmakla huzur bulur\" âyeti Ra'd 13:28'dedir.",
        kaynak: "Ra'd 13:28",
      },
      {
        soru: "Duâ ederken Kur'an'ın öğüdü nedir?",
        secenekler: [
          "Sesi çok yükseltmek",
          "Yalvararak ve gizli bir sesle istemek",
          "Yalnız belirli bir yerde duâ etmek",
          "Aracı şart koşmak",
        ],
        cevap: 1,
        aciklama: "A'râf 7:55, duâda haddi aşmamayı ve alçak gönüllü bir sesle istemeyi öğütler.",
        kaynak: "A'râf 7:55",
      },
      {
        soru: "Hz. Âişe, Hz. Peygamber'in ahlâkını nasıl tanımlamıştır?",
        secenekler: ["Kur'an ahlâkı", "Şair ahlâkı", "Tüccar ahlâkı", "Savaşçı ahlâkı"],
        cevap: 0,
        aciklama: "Hz. Âişe'nin rivayetinde Peygamberimizin ahlâkı \"Kur'an ahlâkı\" olarak tanımlanır.",
        kaynak: "Müslim, Müsâfirîn",
      },
    ],
  },

  // ───────────────────── 3 ─────────────────────
  {
    id: "cenaze",
    ad: "Ölüm ve Cenaze Hükümleri",
    emoji: "🤍",
    alt: "Ölüm ânı, cenaze namazı, defin ve taziye edebi",
    maddeler: [
      {
        baslik: "Ölüm ânında telkin",
        metin:
          "Ölüm döşeğindeki kişiye \"Lâ ilâhe illallah\" demesini hatırlatmak (telkin) sünnettir. Hadis, son sözü kelime-i tevhid olan kişinin cennete gireceğini müjdeler. Telkin, baskı değil hatırlatmadır.",
        delil: "Müslim, Cenâiz; Ebû Dâvûd, Cenâiz",
      },
      {
        baslik: "Cenaze namazı farz-ı kifâyedir",
        metin:
          "Cenaze namazı, Müslümanların topluca yapması gereken farz-ı kifâye bir ibadettir; bir kısmı kılarsa diğerlerinden sorumluluk kalkar. Rükû ve secdesi yoktur: kıyam, tekbirler ve duâdan oluşur.",
        delil: "Buhârî, Cenâiz; Müslim, Cenâiz; Diyanet İlmihali, Cenaze Namazı",
      },
      {
        baslik: "Yıkama ve kefenleme",
        metin:
          "Cenaze, mahremiyet gözetilerek yıkanır ve kefenlenir. Yıkama, aynı cinsten ve güvenilir kişilerce yapılır. Bu işler, ölüye karşı yerine getirilen son emanetlerdir.",
        delil: "Buhârî, Cenâiz; Müslim, Cenâiz; Diyanet İlmihali, Cenazenin Yıkanması",
      },
      {
        baslik: "Defin ve kabir",
        metin:
          "Cenaze, geciktirilmeden defnedilir; kabir kıbleye yönelik kazılır. Ölünün ardından yüksek sesle ağıt yakmak ve yas tutmayı abartmak dinen hoş görülmez. Defin, insanın toprağa emanet edilmesidir.",
        delil: "Buhârî, Cenâiz; Müslim, Cenâiz; Diyanet İlmihali, Defin",
      },
      {
        baslik: "Taziye ve sabır",
        metin:
          "Yakınına başsağlığı dilemek (taziye) sünnettir; üç güne kadar teselli ve ikram tavsiye edilir. Taziyede ölçü, aileyi rahatsız etmemek ve ağıt kültürünü yaymamaktır. Sabır, sevabın en büyük kapısıdır.",
        delil: "Buhârî, Cenâiz; Müslim, Cenâiz; Diyanet İlmihali, Taziye",
      },
      {
        baslik: "Kabir ziyareti",
        metin:
          "Kabir ziyareti, ölümü hatırlatıp ahirete hazırlığı canlı tutar. Ziyarette selam vermek, duâ etmek ve Kur'an okumak tavsiye edilir. Ziyaretin amacı ölüden bir şey istemek değil, duâ ve ibrettir.",
        delil: "Müslim, Cenâiz; İbn Mâce, Cenâiz; Diyanet İlmihali, Kabir Ziyareti",
      },
    ],
    sorular: [
      {
        soru: "Cenaze namazının hükmü nedir?",
        secenekler: ["Farz-ı ayn", "Farz-ı kifâye", "Sünnet", "Vâcip"],
        cevap: 1,
        aciklama: "Cenaze namazı farz-ı kifâyedir; Müslümanlardan bir topluluk kılınca diğerlerinden sorumluluk kalkar.",
        kaynak: "Buhârî, Cenâiz; Diyanet İlmihali",
      },
      {
        soru: "Cenaze namazında hangisi yoktur?",
        secenekler: ["Kıyam", "Tekbir", "Duâ", "Rükû ve secde"],
        cevap: 3,
        aciklama: "Cenaze namazı kıyam, tekbir ve duâdan oluşur; rükû ve secdesi yoktur.",
        kaynak: "Buhârî, Cenâiz",
      },
      {
        soru: "Ölüm döşeğindeki kişiye kelime-i tevhidi hatırlatmaya ne denir?",
        secenekler: ["Telkin", "Taziye", "Kefen", "Hatip"],
        cevap: 0,
        aciklama: "Son nefeste kelime-i tevhidi hatırlatmaya telkin denir; sünnettir.",
        kaynak: "Müslim, Cenâiz",
      },
      {
        soru: "Taziye hakkında hangisi doğrudur?",
        secenekler: [
          "Ağıt yakmak tavsiye edilir",
          "Üç güne kadar teselli ve ikram tavsiye edilir",
          "Yas uzun tutulmalıdır",
          "Taziye cuma günü yapılmaz",
        ],
        cevap: 1,
        aciklama: "Taziye sünnettir; ölçüsü aileyi rahatsız etmeden teselli etmek ve üç güne kadar ikramda bulunmaktır.",
        kaynak: "Buhârî, Cenâiz; Diyanet İlmihali",
      },
    ],
  },

  // ───────────────────── 4 ─────────────────────
  {
    id: "ruhsat",
    ad: "İbadetlerde Ruhsat ve Kolaylıklar",
    emoji: "🕊️",
    alt: "Sefer, hastalık ve zaruret hâllerinde verilen kolaylıklar",
    maddeler: [
      {
        baslik: "Din kolaylık üzerine kuruludur",
        metin:
          "Kur'an, Allah'ın kul için zorluk değil kolaylık dilediğini bildirir. Ruhsatlar, ibadetin terk edilmesi değil, özür hâlinde yerine getirilmesinin yoludur. Ölçü, özrün gerçek olması ve sınırının bilinmesidir.",
        delil: "Bakara 2:185; Nisâ 4:28; Buhârî, Îmân",
      },
      {
        baslik: "Seferde namaz",
        metin:
          "Yolculukta dört rekâtlı farzlar iki rekât olarak kılınır. Hanefî'ye göre yaklaşık üç günlük mesafeye (yaklaşık 90 km) giden yolcu, dört rekâtlı farzları iki rekât kılar. Sünnetler ise kılınmayabilir.",
        delil: "Nisâ 4:101; Müslim, Müsâfirîn; Diyanet İlmihali, Seferîlik",
      },
      {
        baslik: "Hastalıkta namaz",
        metin:
          "Hasta, ayakta kılamıyorsa oturarak, oturarak da kılamıyorsa yan yatarak veya ima ile kılar. Namaz hiçbir durumda düşmez; yalnız şekli kolaylaşır. Bu ruhsat, ibadetin hayatla birlikte sürmesini sağlar.",
        delil: "Buhârî, Salât (\"Namazı ayakta kıl; gücün yetmezse oturarak...\"); Diyanet İlmihali",
      },
      {
        baslik: "Oruçta ruhsat",
        metin:
          "Hastalık ve yolculuk hâlinde oruç tutmamak ruhsattır; tutulmayan günler sonra kaza edilir. Ağır hastalık ve yaşlılık gibi kalıcı özürde ise fidye verilir. Ruhsat, kolaylıkla birlikte sorumluluğu da düzenler.",
        delil: "Bakara 2:184-185; Diyanet İlmihali, Orucun Kazası ve Fidye",
      },
      {
        baslik: "Mest üzerine mesh",
        metin:
          "Abdestli iken giyilen mest veya çorap üzerine mesh etmek caizdir. Yolcu için süre üç gün üç gece, evde oturan için bir gün bir gecedir. Süre, mestin giyildiği andan değil abdestin bozulduğu andan sayılır.",
        delil: "Mâide 5:6; Müslim, Tahâret; Diyanet İlmihali, Mesh",
      },
      {
        baslik: "Teyemmüm bir ruhsattır",
        metin:
          "Su bulunmadığında veya kullanılamadığında temiz toprakla teyemmüm edilir. Teyemmüm, abdest ve gusül yerine geçer; su bulununca hüküm sona erer. Ruhsat, ibadeti suya mahkûm etmemek içindir.",
        delil: "Mâide 5:6; Nisâ 4:43; Buhârî, Teyemmüm",
      },
    ],
    sorular: [
      {
        soru: "Seferî olan kişi dört rekâtlı farzları kaç rekât kılar?",
        secenekler: ["1", "2", "3", "4 (değişmez)"],
        cevap: 1,
        aciklama: "Nisâ 4:101'e dayanarak yolcu, dört rekâtlı farzları iki rekât kılar.",
        kaynak: "Nisâ 4:101",
      },
      {
        soru: "Hasta namazı nasıl kılar?",
        secenekler: [
          "Namaz düşer",
          "Ayakta kılamıyorsa oturarak, o da olmuyorsa ima ile",
          "Yalnız cuma kılar",
          "Yalnız kaza eder",
        ],
        cevap: 1,
        aciklama: "Hastalıkta namaz düşmez; ayakta kılamayan oturarak, o da mümkün değilse yan yatarak/ima ile kılar.",
        kaynak: "Buhârî, Salât",
      },
      {
        soru: "Evde oturan kişi mest üzerine ne kadar süre mesh edebilir?",
        secenekler: ["Bir gün bir gece", "Üç gün üç gece", "Bir hafta", "Süre sınırsızdır"],
        cevap: 0,
        aciklama: "Mukim için bir gün bir gece, yolcu için üç gün üç gecedir; süre abdestin bozulmasından itibaren sayılır.",
        kaynak: "Müslim, Tahâret",
      },
      {
        soru: "Oruç tutamayan yaşlı ve ağır hasta ne yapar?",
        secenekler: ["Hiçbir şey gerekmez", "Fidye verir", "Yalnız tövbe eder", "Her gün iki oruç tutar"],
        cevap: 1,
        aciklama: "Bakara 2:184 uyarınca kalıcı özür hâlinde tutulamayan oruçlar için fidye verilir.",
        kaynak: "Bakara 2:184",
      },
    ],
  },
];
