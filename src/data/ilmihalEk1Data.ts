// ════════════════════════════════════════════════════════
// ILMIHALEK1DATA.TS — İlmihal Akademisi ek dersleri (1/2)
// namaz-sunnet · ezan-cemaat · vitir-nafile · namazi-bozan
//
// ★ SAHİHLİK: Hanefî mezhebinin yaygın görüşleri (Diyanet İlmihali ile uyumlu).
//   Hadis numarası yazılmaz; kitap/bölüm adı verilir. Zayıf rivayet kullanılmaz.
// ════════════════════════════════════════════════════════

import type { IlmihalDers } from "./ilmihalData";

export const ILMIHAL_EK1_DERSLERI: IlmihalDers[] = [
  // ───────────────────── 1 ─────────────────────
  {
    id: "namaz-sunnet",
    ad: "Namazın Sünnetleri ve Vâcipleri",
    emoji: "📐",
    alt: "Farzın dışında kalan hükümler ve terk edildiğinde ne olur",
    maddeler: [
      {
        baslik: "Üçlü tasnif: farz, vâcip, sünnet",
        metin:
          "Namazın içindeki işler üç gruptur. Farzı terk eden namazı bozulur ve kaza gerekir. Vâcibi terk eden namazı bozulmaz ama sehiv secdesi gerekir. Sünneti terk eden ise sevap kaybeder; kaza veya sehiv gerekmez.",
        delil: "Mâide 5:6; Buhârî, Salât; Diyanet İlmihali, Namaz",
      },
      {
        baslik: "Hanefî'ye göre namazın vâcipleri",
        metin:
          "Başlıcaları: Fâtiha okumak, Fâtiha'dan sonra zamm-ı sûre okumak, sûreyi Fâtiha'nın ardından okumak, secdede alınla birlikte burnu yere koymak, rükûdan doğrulup kavme yapmak, iki secde arasında doğrulup oturmak (celse), ilk oturuşta Tahiyyât okumak, vitir namazını kılmak, bayram namazlarında zâit tekbirleri almak, tilâvet secdesi yapmak.",
        delil: "Buhârî, Ezân (Fâtiha'nın namazda okunması); Diyanet İlmihali, Namazın Vâcipleri",
      },
      {
        baslik: "Namazın sünnetleri",
        metin:
          "Sübhâneke ile başlamak, istiâze ve besmele çekmek, Fâtiha'dan sonra âmin demek, rükûda ve secdede üçer defa tesbih etmek, rükûdan doğrulurken \"Semiallahu limen hamideh\" ve ardından \"Rabbenâ leke'l-hamd\" demek, oturuşlarda elleri dizlere koymak, selamla bitirmek gibi işler sünnettir.",
        delil: "Buhârî, Ezân; Müslim, Mesâcid; Diyanet İlmihali, Namazın Sünnetleri",
      },
      {
        baslik: "Sünnet-i müekkede ve gayr-i müekkede",
        metin:
          "Peygamberimizin devamlı kıldığı sünnetler müekkededir: sabah 2, öğle 4 (önce) + 2 (sonra), akşam 2, yatsı 2 rekât. Ara sıra kıldığı sünnetler gayr-i müekkededir: ikindi 4, akşam 2 (kılmadığı da olurdu). Müekkede sünneti özürsüz terk etmek kınanır.",
        delil: "Buhârî, Mevâkît; Müslim, Müsâfirîn; Diyanet İlmihali, Sünnet Namazlar",
      },
      {
        baslik: "Zamm-ı sûre ne zaman okunur",
        metin:
          "Zamm-ı sûre, farz namazların ilk iki rekâtında ve sünnetlerin her rekâtında Fâtiha'dan sonra okunur. Üç ve dört rekâtlı farzların son rekâtlarında yalnız Fâtiha okunur. Bu, namazın vâcip hükümlerinden biridir.",
        delil: "Buhârî, Ezân; Diyanet İlmihali, Namazın Vâcipleri",
      },
      {
        baslik: "Hata yapınca: sehiv secdesi",
        metin:
          "Vâcip bir iş unutulur veya geciktirilirse son oturuşta Tahiyyât'tan sonra iki secde yapılıp yeniden Tahiyyât, salavat ve selamla namaz tamamlanır. Sehiv secdesi, namazın eksik kalan tarafını örten bir telâfi kapısıdır.",
        delil: "Buhârî, Sehv; Müslim, Mesâcid; Diyanet İlmihali, Sehiv Secdesi",
      },
    ],
    sorular: [
      {
        soru: "Hanefî mezhebinde namazın vâciplerinden biri terk edilirse ne gerekir?",
        secenekler: ["Namaz bozulur, kaza gerekir", "Sehiv secdesi gerekir", "Hiçbir şey gerekmez", "Namaz baştan kılınır"],
        cevap: 1,
        aciklama: "Vâcip terk edilirse namaz bozulmaz; son oturuşta sehiv secdesi yapılır. Farz terk edilirse namaz bozulur.",
        kaynak: "Buhârî, Sehv; Diyanet İlmihali",
      },
      {
        soru: "Aşağıdakilerden hangisi namazın vâciplerindendir?",
        secenekler: ["Sübhâneke okumak", "Âmin demek", "Fâtiha okumak", "Rükûda üç tesbih"],
        cevap: 2,
        aciklama: "Fâtiha okumak Hanefî'de vâciptir; sübhâneke, âmin ve tesbihler sünnettir.",
        kaynak: "Buhârî, Ezân",
      },
      {
        soru: "Sabah namazının sünneti kaç rekâttır ve hükmü nedir?",
        secenekler: ["2 rekât, sünnet-i müekkede", "4 rekât, sünnet-i gayr-i müekkede", "3 rekât, vâcip", "2 rekât, farz"],
        cevap: 0,
        aciklama: "Sabah namazının 2 rekât sünneti sünnet-i müekkededir; Peygamberimiz bu sünneti hiç terk etmemiştir.",
        kaynak: "Buhârî, Mevâkît; Müslim, Müsâfirîn",
      },
      {
        soru: "Zamm-ı sûre hangi rekâtlarda okunur?",
        secenekler: [
          "Farzların bütün rekâtlarında",
          "Farzların ilk iki rekâtında ve sünnetlerin her rekâtında",
          "Yalnız son oturuşta",
          "Yalnız vitirde",
        ],
        cevap: 1,
        aciklama: "Farzların ilk iki rekâtında, sünnetlerin ise her rekâtında Fâtiha'dan sonra zamm-ı sûre okunur.",
        kaynak: "Diyanet İlmihali, Namazın Vâcipleri",
      },
    ],
  },

  // ───────────────────── 2 ─────────────────────
  {
    id: "ezan-cemaat",
    ad: "Ezan, Kâmet ve Cemaat",
    emoji: "🕌",
    alt: "Namaza çağrının hükmü, cemaatin fazileti ve imama uyma",
    maddeler: [
      {
        baslik: "Ezanın hükmü ve sözleri",
        metin:
          "Ezan, vakit girdiğinde namaza çağrıdır; Hanefî'de sünnet-i müekkede kabul edilir. \"Allahu ekber\" ile başlar, \"Lâ ilâhe illallah\" ile biter. Ezanı işitenin, duyduğu sözleri tekrar etmesi ve ardından salavat ile duâ okuması tavsiye edilir.",
        delil: "Buhârî, Ezân; Müslim, Salât; Diyanet İlmihali, Ezan",
      },
      {
        baslik: "Kâmet",
        metin:
          "Kâmet, farz namazın başlamasından hemen önce okunan iç ezandır; sözleri ezanla aynıdır, ancak \"Hayye ale'l-felâh\"tan sonra \"Kad kâmeti's-salâh\" eklenir. Sünnet namazlarda ve vitirde kâmet okunmaz.",
        delil: "Buhârî, Ezân; Diyanet İlmihali, Kâmet",
      },
      {
        baslik: "Cemaatin fazileti",
        metin:
          "Hadis, cemaatle kılınan namazın tek başına kılınandan yirmi yedi derece üstün olduğunu bildirir. Cemaat, ibadeti sosyal bir bağa dönüştürür; komşuluk ve kardeşlik bilincini güçlendirir.",
        delil: "Buhârî, Ezân; Müslim, Mesâcid",
      },
      {
        baslik: "İmama uyma (iktidâ)",
        metin:
          "İmama uyan kişi, imamdan önce rükû ve secdeye gitmez, ondan sonra da kalkmaz. İmam tekbir alınca tekbir alınır; imam selam verince namaz tamamlanır. İmama uymak, cemaatin düzenini koruyan temel kuraldır.",
        delil: "Buhârî, Salât (\"İmam kendisine uyulsun diye imamdır\"); Müslim, Salât",
      },
      {
        baslik: "Safların düzeni",
        metin:
          "Saflar omuz omuza ve düz tutulur; boşluk bırakmak cemaatin bütünlüğünü bozar. İlk safın fazileti hadiste bildirilmiştir. Mescide erken gelmek, ilk safı elde etmenin yoludur.",
        delil: "Buhârî, Ezân; Müslim, Salât",
      },
      {
        baslik: "Mescid edebi",
        metin:
          "Mescide girince oturmadan önce iki rekât tahiyyetü'l-mescid kılmak sünnettir. Mescitte yüksek sesle konuşmamak, alışveriş yapmamak ve cemaati rahatsız etmemek edeptendir.",
        delil: "Buhârî, Salât; Müslim, Mesâcid; Diyanet İlmihali, Mescid Edebi",
      },
    ],
    sorular: [
      {
        soru: "Cemaatle kılınan namaz, tek başına kılınandan kaç derece üstündür?",
        secenekler: ["7", "17", "27", "40"],
        cevap: 2,
        aciklama: "Hadis, cemaat namazının tek başına kılınan namazdan yirmi yedi derece üstün olduğunu bildirir.",
        kaynak: "Buhârî, Ezân; Müslim, Mesâcid",
      },
      {
        soru: "Kâmet hakkında hangisi doğrudur?",
        secenekler: [
          "Bütün namazlarda okunur",
          "Farz namazlardan önce okunur, sünnet ve vitirde okunmaz",
          "Yalnız cuma günü okunur",
          "Ezanın yerine geçer",
        ],
        cevap: 1,
        aciklama: "Kâmet farz namazların başlamasından önce okunur; sünnet ve vitir namazlarında okunmaz.",
        kaynak: "Buhârî, Ezân",
      },
      {
        soru: "İmama uyan kişi nasıl hareket eder?",
        secenekler: [
          "İmamdan önce rükûya gider",
          "İmamla aynı anda her hareketi yapar",
          "İmamdan sonra hareket eder, ondan önce geçmez",
          "Yalnız secdede imama uyar",
        ],
        cevap: 2,
        aciklama: "İmama uyan, imamdan önce geçmez; imamın hareketini takip eder. Bu, cemaatin düzenini korur.",
        kaynak: "Buhârî, Salât",
      },
      {
        soru: "Mescide girince oturmadan önce kılınan namaz hangisidir?",
        secenekler: ["Duha", "Tahiyyetü'l-mescid", "Evvâbîn", "Teheccüd"],
        cevap: 1,
        aciklama: "Mescide giren kişinin oturmadan önce iki rekât tahiyyetü'l-mescid kılması sünnettir.",
        kaynak: "Buhârî, Salât; Müslim, Mesâcid",
      },
    ],
  },

  // ───────────────────── 3 ─────────────────────
  {
    id: "vitir-nafile",
    ad: "Vitir, Sünnet ve Nâfile Namazlar",
    emoji: "🌙",
    alt: "Vacip vitir, müekkede sünnetler ve gönüllü ibadetler",
    maddeler: [
      {
        baslik: "Vitir namazı vaciptir",
        metin:
          "Vitir, yatsı namazından sonra kılınan üç rekâtlık namazdır; Hanefî'ye göre vâciptir, terk edilmesi uygun değildir. Üçüncü rekâtta kunut tekbiri alınıp kunut duâsı okunur, sonra rükûya gidilir.",
        delil: "Buhârî, Vitir; Ebû Dâvûd, Vitir; Diyanet İlmihali, Vitir Namazı",
      },
      {
        baslik: "Kunut duâsı",
        metin:
          "Kunut duâsı, Hz. Peygamber'in torunu Hz. Hasan'dan öğretilen \"Allahümme innâ neste'înüke...\" duâsıdır. Vitirde kunut tekbiri almak ve duâyı okumak Hanefî'de vâciptir; unutulursa sehiv secdesi gerekir.",
        delil: "Ebû Dâvûd, Vitir; Tirmizî, Vitir; Diyanet İlmihali, Kunut",
      },
      {
        baslik: "Teravih sünnet-i müekkede",
        metin:
          "Ramazan gecelerinde yatsıdan sonra kılınan teravih, sünnet-i müekkededir. Cemaatle kılınması güçlü sünnettir; Hanefî geleneğinde yirmi rekât olarak kılınır. Teravih, ramazanın gece ibadetini cemaatle buluşturur.",
        delil: "Buhârî, Terâvîh; Diyanet İlmihali, Teravih",
      },
      {
        baslik: "Duha (kuşluk) namazı",
        metin:
          "Güneş bir mızrak boyu yükseldikten sonra, öğle vakti girmeden önce kılınan nâfile namazdır; en az iki rekâttır. Hadis, her gün iki rekât duha kılanın günahlarının bağışlanacağı müjdesini nakleder.",
        delil: "Müslim, Müsâfirîn; Diyanet İlmihali, Nâfile Namazlar",
      },
      {
        baslik: "Teheccüd ve evvâbîn",
        metin:
          "Teheccüd, yatsıdan sonra uyuyup gece kalkarak kılınan namazdır; farzların ardından en faziletli nâfiledir. Evvâbîn ise akşam namazından sonra kılınan nâfile namazdır. İkisi de gönüllü ibadettir, terk edilene bir şey gerekmez.",
        delil: "İsrâ 17:79; Müslim, Müsâfirîn; Diyanet İlmihali, Gece Namazı",
      },
      {
        baslik: "Nâfileyi evde kılmak",
        metin:
          "Hadis, farzlar dışındaki namazların bir kısmını evde kılmaya teşvik eder; böylece ev bereketlenir ve gösterişten uzak kalınır. Ancak teravih ve cemaatle kılınan sünnetler mescidde kılınır.",
        delil: "Buhârî, Salât; Müslim, Müsâfirîn",
      },
    ],
    sorular: [
      {
        soru: "Hanefî mezhebine göre vitir namazının hükmü nedir?",
        secenekler: ["Sünnet", "Vâcip", "Farz", "Müstehap"],
        cevap: 1,
        aciklama: "Vitir, Hanefî'ye göre vâciptir; üç rekât kılınır ve üçüncü rekâtta kunut okunur.",
        kaynak: "Buhârî, Vitir; Diyanet İlmihali",
      },
      {
        soru: "Teravih namazı hangi hükümle kılınır?",
        secenekler: ["Farz", "Vâcip", "Sünnet-i müekkede", "Mekruh"],
        cevap: 2,
        aciklama: "Teravih ramazan gecelerinde kılınan sünnet-i müekkede bir namazdır; cemaatle kılınması güçlü sünnettir.",
        kaynak: "Buhârî, Terâvîh",
      },
      {
        soru: "Kunut duâsı hangi namazda okunur?",
        secenekler: ["Sabah sünnetinde", "Vitirde", "Teravihte", "Cumada"],
        cevap: 1,
        aciklama: "Kunut duâsı vitir namazının üçüncü rekâtında, kunut tekbirinden sonra okunur.",
        kaynak: "Ebû Dâvûd, Vitir",
      },
      {
        soru: "Kuşluk vakti kılınan nâfile namaz hangisidir?",
        secenekler: ["Duha", "Teheccüd", "Evvâbîn", "Tahiyyetü'l-mescid"],
        cevap: 0,
        aciklama: "Duha (kuşluk) namazı, güneş yükseldikten sonra öğleden önce kılınan nâfile namazdır.",
        kaynak: "Müslim, Müsâfirîn",
      },
    ],
  },

  // ───────────────────── 4 ─────────────────────
  {
    id: "namazi-bozan",
    ad: "Namazı Bozan ve Mekruh Şeyler",
    emoji: "🚫",
    alt: "Namazı geçersiz kılan hâller ve edebe aykırı davranışlar",
    maddeler: [
      {
        baslik: "Konuşmak ve gülmek",
        metin:
          "Namazda bilerek konuşmak namazı bozar. Sesli gülmek (kahkaha) de namazı bozar; ancak abdesti bozmaz. Hafif tebessüm ise namazı bozmaz, edebe aykırı olduğu için terk edilir.",
        delil: "Buhârî, Salât; Müslim, Mesâcid; Diyanet İlmihali, Namazı Bozan Şeyler",
      },
      {
        baslik: "Yemek ve içmek",
        metin:
          "Namazda bilerek yemek veya içmek namazı bozar. Ağızda kalan küçük bir yemek kırıntısını yutmak ise namazı bozmaz. Oruçlu için de aynı ölçü geçerlidir: unutarak yiyen orucunu sürdürür.",
        delil: "Buhârî, Salât; Müslim, Sıyâm",
      },
      {
        baslik: "Kıbleden dönmek",
        metin:
          "Göğüs kıbleden çevrilecek şekilde dönmek namazı bozar. Küçük bir baş hareketi veya bakış kayması namazı bozmaz; ancak kalbi dağıttığı için hoş görülmez. Kıble, namazın şartıdır.",
        delil: "Bakara 2:144; Buhârî, Salât",
      },
      {
        baslik: "Çok hareket (amel-i kesîr)",
        metin:
          "Namaz dışı bir işi tek hareketle yapmak genellikle bozmaz; arka arkaya üç hareket (amel-i kesîr) namazı bozar. Bu ölçü, namazın içindeki hareketin ibadete ait olduğunu korumak içindir.",
        delil: "Buhârî, Salât; Diyanet İlmihali, Namazı Bozan Şeyler",
      },
      {
        baslik: "Abdestin bozulması ve avretin açılması",
        metin:
          "Namaz içinde abdest bozulursa namaz da bozulur; kişi abdest alıp namazı yeniden kılar. Namazda avret mahalli bir rükün süresi kadar açık kalırsa namaz bozulur; hemen örtülürse bozulmaz.",
        delil: "Mâide 5:6; A'râf 7:31; Diyanet İlmihali, Namazın Şartları",
      },
      {
        baslik: "Mekruh davranışlar",
        metin:
          "Namazda gözleri yummak, parmakları çıtlatmak, elbise veya saatle oynamak, gereksiz yere öksürmek, secdede kolları yere yaymak mekruhtur. Bunlar namazı bozmaz ama sevabını azaltır ve edebi zedeler.",
        delil: "Buhârî, Salât; Müslim, Mesâcid; Diyanet İlmihali, Namazda Mekruhlar",
      },
    ],
    sorular: [
      {
        soru: "Namazda sesli gülmek (kahkaha) namazı ve abdesti nasıl etkiler?",
        secenekler: [
          "Namazı bozar, abdesti bozmaz",
          "İkisini de bozar",
          "Namazı bozmaz",
          "Yalnız abdesti bozar",
        ],
        cevap: 0,
        aciklama: "Kahkaha namazı bozar; abdesti bozmaz. Bu yüzden namaz yeniden kılınır, abdest yenilenmez.",
        kaynak: "Diyanet İlmihali, Namazı Bozan Şeyler",
      },
      {
        soru: "Hangisi namazı bozar?",
        secenekler: ["Gözleri yummak", "Parmak çıtlatmak", "Bilerek konuşmak", "Hafif tebessüm"],
        cevap: 2,
        aciklama: "Namazda bilerek konuşmak namazı bozar; diğerleri mekruh sayılır ama namazı bozmaz.",
        kaynak: "Buhârî, Salât",
      },
      {
        soru: "Amel-i kesîr (çok hareket) namazı bozar mı?",
        secenekler: ["Hayır, hiç etkilemez", "Evet, namaz dışı üç hareket bozar", "Yalnız secdede bozar", "Yalnız imamı bozar"],
        cevap: 1,
        aciklama: "Namaz dışı bir işi arka arkaya üç hareketle yapmak amel-i kesîr sayılır ve namazı bozar.",
        kaynak: "Diyanet İlmihali, Namazı Bozan Şeyler",
      },
      {
        soru: "Namazda avret mahalli ne kadar süre açık kalırsa namaz bozulur?",
        secenekler: ["Bir rükün süresi", "Üç saat", "Namaz bitene kadar", "Hiç bozulmaz"],
        cevap: 0,
        aciklama: "Avret mahalli bir rükün süresi kadar açık kalırsa namaz bozulur; hemen örtülürse bozulmaz.",
        kaynak: "Diyanet İlmihali, Namazın Şartları",
      },
    ],
  },
];
