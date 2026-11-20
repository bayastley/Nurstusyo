// ════════════════════════════════════════════════════════
// ILMIHALDATA.TS — İlmihal Akademisi (yol haritası madde 11)
// Hanefî mezhebi esaslı temel ilmihal: 10 ders · 60 madde · 30 sınav sorusu.
//
// ★ SAHİHLİK İLKESİ (kullanıcı emri: "her içerik sahih olsun"):
//   • Her maddede Kur'ân ayeti (sure:ayet) veya hadis kitabı/bölümü kaynağı var.
//   • Hadis numarası UYDURULMADI; kaynak "Buhârî, Vudû" gibi kitap/bölüm olarak verilir.
//   • Fıkhî hükümler Hanefî mezhebinin yaygın (Diyanet İlmihali ile uyumlu) görüşleridir.
//   • Şüpheli/zayıf rivayet kullanılmadı.
// ════════════════════════════════════════════════════════

export interface IlmihalMadde {
  baslik: string;
  metin: string;
  /** Kur'ân ayeti (sure:ayet) veya hadis kitap/bölüm kaynağı */
  delil: string;
}

export interface IlmihalSoru {
  soru: string;
  secenekler: string[];
  /** Doğru seçeneğin index'i (0 tabanlı) */
  cevap: number;
  aciklama: string;
  kaynak: string;
}

export interface IlmihalDers {
  id: string;
  ad: string;
  emoji: string;
  alt: string;
  maddeler: IlmihalMadde[];
  sorular: IlmihalSoru[];
}

export const ILMIHAL_KAYNAK_NOTU =
  "Kaynaklar: Kur'ân-ı Kerîm, Buhârî, Müslim, Ebû Dâvûd, Tirmizî ve Diyanet İşleri Başkanlığı İlmihali (Hanefî esaslı). Hadisler kitap/bölüm adıyla verilmiştir; numara uydurulmamıştır.";

export const ILMIHAL_DERSLERI: IlmihalDers[] = [
  // ─────────────────────────── 1 ───────────────────────────
  {
    id: "temizlik",
    ad: "Temizlik ve Abdest",
    emoji: "💧",
    alt: "Tahâretin esasları, abdestin farzları ve bozan haller",
    maddeler: [
      {
        baslik: "Temizlik imanın yarısıdır",
        metin:
          "Beden, elbise ve namaz kılınacak yerin necâsetten temiz olması namazın şartıdır. Abdestsizlik ise hades hükmüdür; su bulunmadığında teyemmümle giderilir.",
        delil: "Müslim, Tahâret — \"Temizlik imanın yarısıdır.\"",
      },
      {
        baslik: "Abdestin farzları (Hanefî: 4)",
        metin:
          "1) Yüzü yıkamak, 2) dirseklerle birlikte kolları yıkamak, 3) başın dörtte birini mesh etmek, 4) topuklarla birlikte ayakları yıkamak.",
        delil: "Mâide 5:6",
      },
      {
        baslik: "Abdestin sünnetleri",
        metin:
          "Niyet, besmele, elleri bileklere kadar yıkamak, ağza ve burna su vermek, başın tamamını mesh etmek, kulakları mesh etmek, sıraya ve üçer defaya riayet etmek.",
        delil: "Buhârî, Vudû — Hz. Osman'ın abdest tarifi",
      },
      {
        baslik: "Abdesti bozan haller",
        metin:
          "Ön veya arka yoldan çıkış, vücuttan kan/irin/su akması (Hanefî), ağız dolusu kusma, yatarak veya dayanarak uyumak, namazda sesli gülmek, bayılmak ve akıl kaybı.",
        delil: "Buhârî, Vudû; Müslim, Tahâret",
      },
      {
        baslik: "Mest üzerine mesh",
        metin:
          "Abdestli iken giyilen mest/çorap üzerine mesh caizdir. Süre: mukîm için bir gün bir gece, yolcu için üç gün üç gece. Süre, mestin giyilmesinden değil ilk mesh bozulmasından başlar.",
        delil: "Müslim, Tahâret — Hz. Ali'nin rivayeti",
      },
      {
        baslik: "Su bulunamazsa: teyemmüm",
        metin:
          "Temiz toprak cinsi (toprak, kum, taş) ile yüz ve kollar mesh edilir. Teyemmüm, abdest veya gusül yerine geçer; su bulununca hüküm sona erer.",
        delil: "Mâide 5:6; Nisâ 4:43",
      },
    ],
    sorular: [
      {
        soru: "Hanefî mezhebine göre abdestin farzı kaçtır?",
        secenekler: ["2", "3", "4", "6"],
        cevap: 2,
        aciklama:
          "Yüz, kollar, başın dörtte biri ve ayaklar: Mâide 5:6'da sayılan dört uzuv farzdır.",
        kaynak: "Mâide 5:6",
      },
      {
        soru: "Yolcu için mest üzerine mesh süresi ne kadardır?",
        secenekler: ["Bir gün bir gece", "Üç gün üç gece", "Bir hafta", "Süre yoktur"],
        cevap: 1,
        aciklama: "Mukîm bir gün bir gece, yolcu üç gün üç gecedir.",
        kaynak: "Müslim, Tahâret",
      },
      {
        soru: "Aşağıdakilerden hangisi abdesti bozmaz?",
        secenekler: ["Yatarak uyumak", "Ağız dolusu kusmak", "Namazda sesli gülmek", "El sıkışmak"],
        cevap: 3,
        aciklama:
          "El sıkışmak abdesti bozmaz. Diğer üçü Hanefî'ye göre abdesti bozan hallerdendir.",
        kaynak: "Buhârî, Vudû",
      },
    ],
  },

  // ─────────────────────────── 2 ───────────────────────────
  {
    id: "gusul",
    ad: "Gusül ve Teyemmüm",
    emoji: "🚿",
    alt: "Guslün farzları, gerektiren haller ve teyemmümün hükmü",
    maddeler: [
      {
        baslik: "Guslün farzları (Hanefî: 3)",
        metin:
          "1) Ağza su vermek, 2) burna su vermek, 3) bütün bedeni hiç kuru yer kalmayacak şekilde yıkamak.",
        delil: "Mâide 5:6 — \"Cünüplükten temizlenin.\"",
      },
      {
        baslik: "Guslü gerektiren haller",
        metin:
          "Cünüplük (cinsel ilişki veya meni çıkışı), hayız ve nifâsın sona ermesi. Ölü yıkamak guslü gerektirmez; ancak ölüye dokunanın abdesti bozulur (Hanefî).",
        delil: "Mâide 5:6; Bakara 2:222",
      },
      {
        baslik: "Gusülde sünnetler",
        metin:
          "Niyet ve besmele, elleri yıkamak, bedendeki necâseti temizlemek, abdest almak, başa ve bedene su dökmek, sırayla sağ tarafı yıkamak.",
        delil: "Buhârî, Gusül — Hz. Âişe'nin tarifi",
      },
      {
        baslik: "Cünüp kişi ne yapabilir?",
        metin:
          "Cünüp kişi Kur'ân okuyamaz, Kâbe'yi tavaf edemez, camiye giremez; ancak zikir, dua, selam ve ihtiyaç kadar camiye giriş caizdir. Yemek ve uyku öncesi abdest alması sünnettir.",
        delil: "Buhârî, Gusül; Müslim, Hayız",
      },
      {
        baslik: "Teyemmümün farzları (Hanefî: 2)",
        metin:
          "Niyet ve temiz toprakla yüzü ve kolları (dirseklerle birlikte) mesh etmek. İki vuruş: biri yüz, biri kollar içindir.",
        delil: "Mâide 5:6; Nisâ 4:43",
      },
      {
        baslik: "Su bulunmadığında namaz kılınır mı?",
        metin:
          "Su bulunmazsa veya kullanmak zarar verirse teyemmümle namaz kılınır; namaz geçirilmez. Su bulunduktan sonra kılınan namaz iade edilmez.",
        delil: "Mâide 5:6; Buhârî, Teyemmüm",
      },
    ],
    sorular: [
      {
        soru: "Hanefî mezhebine göre guslün farzı kaçtır?",
        secenekler: ["2", "3", "4", "5"],
        cevap: 1,
        aciklama: "Ağız, burun ve bütün bedenin yıkanması: üç farzdır.",
        kaynak: "Mâide 5:6",
      },
      {
        soru: "Aşağıdakilerden hangisi guslü gerektirmez?",
        secenekler: ["Cünüplük", "Hayızın sona ermesi", "Nifâsın sona ermesi", "Ölü yıkamak"],
        cevap: 3,
        aciklama: "Ölü yıkamak guslü gerektirmez; ancak Hanefî'ye göre abdesti bozar.",
        kaynak: "Buhârî, Gusül",
      },
      {
        soru: "Teyemmüm hangi durumda caiz olur?",
        secenekler: [
          "Su bulunmadığında veya kullanmak zarar verdiğinde",
          "Sadece yolculukta",
          "Sadece hastalıkta",
          "Her zaman",
        ],
        cevap: 0,
        aciklama:
          "Su bulunmaması veya suyun zarar vermesi teyemmümün esas sebebidir; yolculuk şart değildir.",
        kaynak: "Mâide 5:6",
      },
    ],
  },

  // ─────────────────────────── 3 ───────────────────────────
  {
    id: "namaz",
    ad: "Namaz",
    emoji: "🕌",
    alt: "Beş vakit farz, rekâtlar, namazın farzları ve sehiv secdesi",
    maddeler: [
      {
        baslik: "Beş vakit namaz farzdır",
        metin:
          "Beş vakit namaz her mükellef Müslümana farzdır. Vakit girmeden kılınmaz; kılınmadıysa kaza edilir.",
        delil: "Nisâ 4:103; İsrâ 17:78",
      },
      {
        baslik: "Günlük rekâtlar",
        metin:
          "Sabah 2, öğle 4, ikindi 4, akşam 3, yatsı 4 rekât farz. Vitir 3 rekât vaciptir. Sabah ve yatsının sünnetleri kuvvetli sünnetlerdir.",
        delil: "Buhârî, Mevâkît; Müslim, Salât",
      },
      {
        baslik: "Namazın farzları (Hanefî: 6)",
        metin:
          "1) İftitah tekbiri, 2) kıyam, 3) kıraat, 4) rükû, 5) secde, 6) ka'de-i âhirede teşehhüd kadar oturmak.",
        delil: "Buhârî, Ezan — \"Namaz kılmayı... benden öğrenin\"",
      },
      {
        baslik: "Namazı bozan haller",
        metin:
          "Konuşmak, gülmek, abdestin bozulması, avretin açılması, kıbleden dönmek, yemek-içmek, gereksiz çok hareket.",
        delil: "Buhârî, Salât; Müslim, Mesâcid",
      },
      {
        baslik: "Seferîlik (yolculuk)",
        metin:
          "Hanefî'ye göre yaklaşık 90 km ve üzeri yolculuğa çıkan kişi, 15 günden az kalacağı yerde dört rekâtlı farzları iki rekât kılar (sefer kısaltması).",
        delil: "Nisâ 4:101",
      },
      {
        baslik: "Sehiv secdesi",
        metin:
          "Farzın geciktirilmesi, vacibin terk edilmesi gibi hatalarda ka'de-i âhirmeden sonra iki secde yapılır ve teşehhüdle selam verilir.",
        delil: "Buhârî, Sehv; Müslim, Mesâcid",
      },
    ],
    sorular: [
      {
        soru: "Akşam namazının farzı kaç rekâttır?",
        secenekler: ["2", "3", "4", "5"],
        cevap: 1,
        aciklama: "Akşam 3, sabah 2, öğle/ikindi/yatsı 4 rekât farzdır.",
        kaynak: "Buhârî, Mevâkît",
      },
      {
        soru: "Hanefî mezhebine göre namazın farzı kaçtır?",
        secenekler: ["3", "4", "6", "12"],
        cevap: 2,
        aciklama:
          "İftitah tekbiri, kıyam, kıraat, rükû, secde ve ka'de-i âhire: altı farz.",
        kaynak: "Buhârî, Ezan",
      },
      {
        soru: "Seferî kişi dört rekâtlı farzları kaç rekât kılar?",
        secenekler: ["1", "2", "3", "4"],
        cevap: 1,
        aciklama: "Hanefî'ye göre seferde dört rekâtlı farzlar iki rekât kılınır.",
        kaynak: "Nisâ 4:101",
      },
    ],
  },

  // ─────────────────────────── 4 ───────────────────────────
  {
    id: "oruc",
    ad: "Oruç",
    emoji: "🌙",
    alt: "Ramazan orucu, bozan haller, kaza-kefaret-fidye",
    maddeler: [
      {
        baslik: "Ramazan orucu farzdır",
        metin:
          "Ergenlik çağına gelmiş, akıl sağlığı yerinde ve mukîm her Müslümana Ramazan orucu farzdır. Hastalık ve yolculukta erteleme ruhsatı vardır.",
        delil: "Bakara 2:183-185",
      },
      {
        baslik: "Orucun farzları",
        metin:
          "Niyet (geceden veya imsaktan önce) ve imsaktan akşam ezanına kadar yemek, içmek ve cinsel ilişkiden uzak durmak.",
        delil: "Bakara 2:187",
      },
      {
        baslik: "Orucu bozan haller",
        metin:
          "Kasten yemek-içmek, ilaç almak, cinsel ilişki, hayız-nifâsın başlaması, ağız dolusu kasten kusmak, sigara içmek.",
        delil: "Buhârî, Savm; Müslim, Sıyâm",
      },
      {
        baslik: "Kaza, kefaret, fidye",
        metin:
          "Mazeretsiz bozulan oruç için kaza + kefaret (60 gün oruç veya 60 fakiri doyurmak). Hastalık gibi mazeretle bozulan oruçta yalnız kaza gerekir. Oruç tutamayacak derecede hasta/yaşlı olan fidye verir.",
        delil: "Bakara 2:184-185",
      },
      {
        baslik: "Sahur ve iftar sünnetleri",
        metin:
          "Sahuru geciktirmek, iftarı hurma veya su ile acele etmek, iftar duasını yapmak sünnettir.",
        delil: "Buhârî, Savm — \"Sahurda bereket vardır.\"",
      },
      {
        baslik: "Oruçluya yakışmayan haller",
        metin:
          "Gıybet, yalan, kavga ve haram bakış orucun sevabını giderir; oruç yalnız aç kalmak değildir.",
        delil: "Buhârî, Savm — \"Kim yalanı ve onunla amel etmeyi bırakmazsa...\"",
      },
    ],
    sorular: [
      {
        soru: "Ramazan orucunun farz olduğu ayet hangisidir?",
        secenekler: ["Bakara 2:183", "Âl-i İmrân 3:97", "Nisâ 4:103", "Mâide 5:6"],
        cevap: 0,
        aciklama: "\"Ey iman edenler! Oruç sizden öncekilere farz kılındığı gibi...\"",
        kaynak: "Bakara 2:183",
      },
      {
        soru: "Mazeretsiz orucu bozan kişiye ne gerekir?",
        secenekler: ["Yalnız kaza", "Yalnız fidye", "Kaza ve kefaret", "Hiçbir şey"],
        cevap: 2,
        aciklama:
          "Hanefî'ye göre kasten bozulan Ramazan orucu için kaza ile birlikte kefaret gerekir.",
        kaynak: "Bakara 2:184-185; Buhârî, Savm",
      },
      {
        soru: "Oruç tutamayacak kadar hasta olan kişi ne yapar?",
        secenekler: ["Oruç tutmak zorundadır", "Fidye verir", "Kefaret öder", "Hiçbir şey gerekmez"],
        cevap: 1,
        aciklama: "İyileşme ümidi olmayan hasta veya yaşlı, her gün için fidye verir.",
        kaynak: "Bakara 2:184",
      },
    ],
  },

  // ─────────────────────────── 5 ───────────────────────────
  {
    id: "zekat",
    ad: "Zekât ve Fitre",
    emoji: "🤲",
    alt: "Nisap, oran, verilecek sekiz sınıf ve fıtır sadakası",
    maddeler: [
      {
        baslik: "Zekât farzdır",
        metin:
          "Nisap miktarı mala sahip olan ve üzerinden bir kamerî yıl geçen Müslümana zekât farzdır.",
        delil: "Bakara 2:110; Tevbe 9:103",
      },
      {
        baslik: "Nisap ve oran",
        metin:
          "Altında nisap 80,18 gram (20 miskal); para ve ticaret malında bu değer esas alınır. Oran 1/40, yani %2,5'tir.",
        delil: "Ebû Dâvûd, Zekât; Diyanet İlmihali",
      },
      {
        baslik: "Zekât verilecek sekiz sınıf",
        metin:
          "Fakirler, miskinler, zekât toplama memurları, kalpleri ısındırılacaklar, köleler, borçlular, Allah yolundakiler ve yolda kalanlar.",
        delil: "Tevbe 9:60",
      },
      {
        baslik: "Fitre (fıtır sadakası)",
        metin:
          "Ramazan bayramı namazından önce verilen, bir kişinin bir günlük temel gıdasına denk sadakadır. Sadaka-i fıtır vaciptir; aile reisi tüm fertler için verir.",
        delil: "Buhârî, Zekât; Ebû Dâvûd, Zekât",
      },
      {
        baslik: "Zekât kimlere verilmez?",
        metin:
          "Anne-baba, dede-nine, çocuk-torun gibi usûl ve fürûa; zengin sayılana; kâfire; zekât verenin eşine zekât verilmez.",
        delil: "Tevbe 9:60; Buhârî, Zekât",
      },
      {
        baslik: "Zekâtın edebi",
        metin:
          "Zekât başa kakmadan, gösterişsiz ve helâl kazançtan verilir; verilen malın en kötüsü seçilmez.",
        delil: "Bakara 2:264; Bakara 2:267",
      },
    ],
    sorular: [
      {
        soru: "Zekât oranı ne kadardır?",
        secenekler: ["1/10", "1/20", "1/40 (%2,5)", "1/5"],
        cevap: 2,
        aciklama: "Nisaba ulaşan malda zekât oranı kırkta birdir.",
        kaynak: "Ebû Dâvûd, Zekât",
      },
      {
        soru: "Zekât verilecek sınıflar hangi ayette sayılmıştır?",
        secenekler: ["Bakara 2:183", "Tevbe 9:60", "Nisâ 4:36", "Mâide 5:6"],
        cevap: 1,
        aciklama: "Tevbe 9:60 sekiz sınıfı tek tek sayar.",
        kaynak: "Tevbe 9:60",
      },
      {
        soru: "Fitre ne zaman verilir?",
        secenekler: [
          "Ramazan bayramı namazından önce",
          "Kurban bayramında",
          "Yılın sonunda",
          "Muharrem ayında",
        ],
        cevap: 0,
        aciklama:
          "Fıtır sadakası bayram namazından önce verilir; bayram günü içinde verilmesi de caizdir.",
        kaynak: "Buhârî, Zekât",
      },
    ],
  },

  // ─────────────────────────── 6 ───────────────────────────
  {
    id: "hac",
    ad: "Hac ve Umre",
    emoji: "🕋",
    alt: "Haccın farzları, vacipleri ve umrenin hükmü",
    maddeler: [
      {
        baslik: "Hac ömürde bir kez farzdır",
        metin:
          "İmkânı olan her Müslümana ömründe bir kez hac farzdır; şartlar oluşunca geciktirmek günah olur.",
        delil: "Âl-i İmrân 3:97",
      },
      {
        baslik: "Haccın farzları (Hanefî: 3)",
        metin:
          "1) İhrama girmek, 2) Arafat'ta vakfe yapmak, 3) Kâbe'yi ziyaret tavafı ile tavaf etmek.",
        delil: "Bakara 2:196; Bakara 2:197",
      },
      {
        baslik: "Haccın vacipleri",
        metin:
          "Sa'y, Mina'da gecelemek, Müzdelife'de vakfe, şeytan taşlama, kurban, saç kesme/tıraş, veda tavafı. Terk edilirse ceza (dem/fidye) gerekir.",
        delil: "Bakara 2:158; Bakara 2:196",
      },
      {
        baslik: "İhram yasakları",
        metin:
          "Koku sürünmek, tırnak-saç kesmek, avlanmak, nikâh kıymak, dikişli elbise (erkek) ve örtünme sınırını aşmak ihramda yasaktır.",
        delil: "Bakara 2:197; Mâide 5:95",
      },
      {
        baslik: "Umre",
        metin:
          "Umre sünnet-i müekkededir; ihram, tavaf ve sa'y ile yapılır. Belirli bir vakti yoktur.",
        delil: "Bakara 2:196",
      },
      {
        baslik: "Hac kimlere farzdır?",
        metin:
          "Müslüman, akıl sağlığı yerinde, ergenlik çağına gelmiş, hür, bedenen ve maddî olarak gücü yeten, yol güvenliği bulunan kişiye farzdır.",
        delil: "Âl-i İmrân 3:97",
      },
    ],
    sorular: [
      {
        soru: "Haccın farzlarından biri değildir?",
        secenekler: ["İhram", "Arafat vakfesi", "Ziyaret tavafı", "Şeytan taşlama"],
        cevap: 3,
        aciklama:
          "Şeytan taşlama Hanefî'ye göre vaciptir; hac yine de geçerlidir ancak ceza gerekir.",
        kaynak: "Bakara 2:196",
      },
      {
        soru: "Hac hangi ayette farz kılınmıştır?",
        secenekler: ["Âl-i İmrân 3:97", "Bakara 2:183", "Tevbe 9:60", "Nisâ 4:103"],
        cevap: 0,
        aciklama: "\"...Yoluna gücü yetenlerin haccetmesi Allah'ın insanlar üzerinde bir hakkıdır.\"",
        kaynak: "Âl-i İmrân 3:97",
      },
      {
        soru: "Umrenin hükmü nedir?",
        secenekler: ["Farz", "Vacip", "Sünnet-i müekkede", "Mekruh"],
        cevap: 2,
        aciklama: "Hanefî'ye göre umre sünnet-i müekkededir.",
        kaynak: "Bakara 2:196",
      },
    ],
  },

  // ─────────────────────────── 7 ───────────────────────────
  {
    id: "helal-haram",
    ad: "Helâl-Haram ve Kul Hakkı",
    emoji: "⚖️",
    alt: "Kazanç, faiz, gıybet, iftira ve kul hakkının ağırlığı",
    maddeler: [
      {
        baslik: "Faiz haramdır",
        metin:
          "Faiz, karşılıksız kazanç olduğu için haramdır. Faizli işlemde bulunan kişi tövbe edip anaparayla yetinmelidir.",
        delil: "Bakara 2:275; Bakara 2:278-279",
      },
      {
        baslik: "Haram kazanç",
        metin:
          "Hırsızlık, rüşvet, hile, kumar, ölçüde hile ve başkasının malını gasp haramdır; haramla beslenen beden duaya layık değildir.",
        delil: "Mâide 5:38; Müslim, Müsâkât",
      },
      {
        baslik: "Gıybet ve iftira",
        metin:
          "Bir Müslümanın arkasından hoşlanmayacağı şeyi söylemek gıybet; olmayanı isnat etmek iftiradır. İkisi de büyük günahtır.",
        delil: "Hucurât 49:12; Nûr 24:4-5",
      },
      {
        baslik: "Kul hakkı affedilmez",
        metin:
          "Allah'ın hakkı tövbeyle affedilebilir; kul hakkı ise hak sahibi helâl etmedikçe affedilmez. Bu yüzden ölmeden önce helâlleşmek gerekir.",
        delil: "Buhârî, Mezâlim — \"Kimin üzerinde bir kul hakkı varsa...\"",
      },
      {
        baslik: "Anne-baba hakkı",
        metin:
          "Anne-babaya \"öf\" bile demek yasaktır; onlara iyi davranmak, ihtiyaçlarını karşılamak ve dua etmek farz derecesinde bir vazifedir.",
        delil: "İsrâ 17:23-24; Ahkâf 46:15",
      },
      {
        baslik: "Komşu ve akraba hakkı",
        metin:
          "Akrabalık bağını gözetmek, komşuya iyi davranmak, emanete riayet etmek İslâm'ın temel ahlâk emirleridir.",
        delil: "Nisâ 4:36; Buhârî, Edeb",
      },
    ],
    sorular: [
      {
        soru: "Faizin haramlığı hangi ayetlerde açıkça bildirilmiştir?",
        secenekler: ["Bakara 2:275-279", "Nisâ 4:36", "Mâide 5:6", "Tevbe 9:60"],
        cevap: 0,
        aciklama: "Bakara 2:275 faizi helâl sayanlara, 278-279 ise faizi bırakmayanlara hitap eder.",
        kaynak: "Bakara 2:275-279",
      },
      {
        soru: "Gıybet hangi ayette yasaklanmıştır?",
        secenekler: ["Hucurât 49:12", "İsrâ 17:23", "Bakara 2:110", "Nûr 24:35"],
        cevap: 0,
        aciklama: "\"...Birbirinizin gıybetini yapmayın.\"",
        kaynak: "Hucurât 49:12",
      },
      {
        soru: "Kul hakkı için ne gerekir?",
        secenekler: [
          "Sadece tövbe",
          "Hak sahibinin helâl etmesi veya hakkın ödenmesi",
          "Sadaka vermek",
          "Oruç tutmak",
        ],
        cevap: 1,
        aciklama: "Kul hakkı, hak sahibi helâl etmedikçe affedilmez.",
        kaynak: "Buhârî, Mezâlim",
      },
    ],
  },

  // ─────────────────────────── 8 ───────────────────────────
  {
    id: "aile",
    ad: "Aile ve Günlük Hayat",
    emoji: "🏠",
    alt: "Nikâh, mehr, nafaka ve günlük helâl-haram sınırları",
    maddeler: [
      {
        baslik: "Nikâhın şartları",
        metin:
          "İcap-kabul, iki Müslüman şahit ve mehrin belirlenmesi nikâhın rükünleridir. Nikâh, devletin resmî kaydıyla da tescil edilmelidir.",
        delil: "Nisâ 4:4; Nisâ 4:24-25",
      },
      {
        baslik: "Mehr ve nafaka",
        metin:
          "Mehr, kadının hakkıdır; verilmeden nikâh tamam olmaz. Nafaka (barınma, gıda, giyim) kocanın vazifesidir.",
        delil: "Nisâ 4:4; Bakara 2:228; Talâk 65:7",
      },
      {
        baslik: "Aile içi muâmele",
        metin:
          "Eşler arasında şiddet, hakaret ve kaba muâmele caiz değildir. İslâm, aileyi \"rahat ve huzur\" olarak tanımlar.",
        delil: "Rûm 30:21; Nisâ 4:19",
      },
      {
        baslik: "Yeme-içme sınırı",
        metin:
          "Domuz eti, kan, leş ve Allah'tan başkası adına kesilen hayvan haramdır. Zaruret hâlinde (ölüm tehlikesi) sınır aşmadan helâl olur.",
        delil: "Bakara 2:173; Mâide 5:3",
      },
      {
        baslik: "İçki ve kumar",
        metin:
          "Sarhoşluk veren içki, kumar ve benzeri oyunlar haramdır; kazanç da haram olur.",
        delil: "Mâide 5:90-91",
      },
      {
        baslik: "Günlük hayatta gizli şirk ve şüphe",
        metin:
          "Şüpheli (helâl-haramı karışık) şeylerden uzak durmak, güzel isim ve davranışla rızık aramak, rüşvet ve torpil almamak İslâm'ın günlük hayat ölçüleridir.",
        delil: "Bakara 2:168; Buhârî, Büyû'",
      },
    ],
    sorular: [
      {
        soru: "Nikâhın geçerli olması için aşağıdakilerden hangisi şarttır?",
        secenekler: ["Şahitler", "Düğün salonu", "Yüzük", "Takı töreni"],
        cevap: 0,
        aciklama: "İcap-kabul, iki şahit ve mehrin belirtilmesi nikâhın rükünleridir.",
        kaynak: "Nisâ 4:4; Buhârî, Nikâh",
      },
      {
        soru: "Nafaka kimin hakkıdır?",
        secenekler: ["Kocanın", "Kadının", "Çocukların babasının", "Kayınvalidenin"],
        cevap: 1,
        aciklama: "Barınma, gıda ve giyim kadının kocası üzerindeki hakkıdır.",
        kaynak: "Bakara 2:228; Talâk 65:7",
      },
      {
        soru: "Domuz eti hakkında hangi hüküm doğrudur?",
        secenekler: [
          "Haram; zaruret dışında yenmez",
          "Helâldir",
          "Sadece viskiyle haram olur",
          "İşlenmişse helâldir",
        ],
        cevap: 0,
        aciklama: "Bakara 2:173 ve Mâide 5:3 domuz etini haram sayar; zaruret hâlinde sınır aşmadan ruhsat vardır.",
        kaynak: "Bakara 2:173; Mâide 5:3",
      },
    ],
  },
  // ─────────────────────────── 9 ───────────────────────────
  {
    id: "iman",
    ad: "İman Esasları",
    emoji: "☝️",
    alt: "Altı iman esası ve tevhidin delilleri",
    maddeler: [
      {
        baslik: "Allah'ın varlığı ve birliği (tevhid)",
        metin:
          "Allah birdir; eşi, benzeri ve ortağı yoktur. Hiçbir şey O'na denk değildir. Tevhid, İslâm'ın temelidir.",
        delil: "İhlâs 112:1-4; Bakara 2:255",
      },
      {
        baslik: "Meleklere iman",
        metin:
          "Melekler nurdan yaratılmış, emredileni eksiksiz yapan varlıklardır. Cebrâil vahyi, Mikâil rızkı, İsrafil suru üstlenmiştir.",
        delil: "Bakara 2:285; Fâtır 35:1",
      },
      {
        baslik: "Kitaplara iman",
        metin:
          "Allah'ın peygamberlerine indirdiği kitaplara iman edilir. Son ve korunmuş kitap Kur'ân-ı Kerîm'dir.",
        delil: "Nisâ 4:136; Hicr 15:9",
      },
      {
        baslik: "Peygamberlere iman",
        metin:
          "Hz. Âdem'den Hz. Muhammed'e (s.a.v.) kadar gönderilen bütün peygamberlere iman edilir; son peygamber Hz. Muhammed'dir.",
        delil: "Nisâ 4:136; Ahzâb 33:40",
      },
      {
        baslik: "Ahirete iman",
        metin:
          "Ölümden sonra diriliş, hesap, cennet ve cehennem vardır. Ahiret inancı, insanın sorumluluk duygusunun kaynağıdır.",
        delil: "Bakara 2:177; Kıyâme 75:1-15",
      },
      {
        baslik: "Kader ve tevekkül",
        metin:
          "Her şey Allah'ın ilmi ve takdiriyle bir ölçü içindedir. Kader, insanın iradesini ortadan kaldırmaz; kişi seçiminden sorumludur.",
        delil: "Kamer 54:49; Ra'd 13:11",
      },
    ],
    sorular: [
      {
        soru: "İmanın altı esası hangi hadiste sayılmıştır?",
        secenekler: ["Cibrîl hadisi", "Niyet hadisi", "Sahur hadisi", "Hicret hadisi"],
        cevap: 0,
        aciklama:
          "Cibrîl hadisinde iman; Allah'a, meleklere, kitaplara, peygamberlere, ahirete ve kadere iman olarak altı maddede sayılmıştır.",
        kaynak: "Müslim, Îmân; Buhârî, Îmân",
      },
      {
        soru: "Tevhidi en öz biçimde anlatan sûre hangisidir?",
        secenekler: ["İhlâs", "Fâtiha", "Kevser", "Felak"],
        cevap: 0,
        aciklama: "İhlâs sûresi Allah'ın birliğini dört âyette özetler.",
        kaynak: "İhlâs 112:1-4",
      },
      {
        soru: "Kader hakkında hangi ifade doğrudur?",
        secenekler: [
          "Kader insanın iradesini yok sayar",
          "Her şey bir ölçüyle yaratılmıştır, insan seçiminden sorumludur",
          "Kader sadece rızıkla ilgilidir",
          "Kader inanmayı gerektirmez",
        ],
        cevap: 1,
        aciklama: "Kamer 54:49 her şeyin bir ölçüyle yaratıldığını; Ra'd 13:11 ise insanın çabasının karşılığını bildirir.",
        kaynak: "Kamer 54:49; Ra'd 13:11",
      },
    ],
  },

  // ─────────────────────────── 10 ───────────────────────────
  {
    id: "cuma",
    ad: "Cuma, Bayram ve Cemaat",
    emoji: "🕌",
    alt: "Cuma namazı, hutbe, bayram, teravih ve cemaat edebi",
    maddeler: [
      {
        baslik: "Cuma namazı farzdır",
        metin:
          "Cuma günü öğle vakti, şartları taşıyan Müslüman erkeklere cuma namazı farzdır: hür, mukîm, sağlıklı ve mükellef olmak.",
        delil: "Cuma 62:9",
      },
      {
        baslik: "Hutbe cumanın şartıdır",
        metin:
          "Hanefî'ye göre hutbe, cuma namazının sıhhat şartıdır; namazdan önce okunur. Hutbe sırasında konuşmamak gerekir.",
        delil: "Buhârî, Cuma; Müslim, Cuma",
      },
      {
        baslik: "Cemaatle namazın fazileti",
        metin:
          "Cemaatle kılınan namaz, tek başına kılınandan yirmi yedi derece üstündür. Cemaat, İslâm'ın birlik bilincini güçlendirir.",
        delil: "Buhârî, Ezan; Müslim, Mesâcid",
      },
      {
        baslik: "Bayram namazı",
        metin:
          "Ramazan ve Kurban bayramında iki rekât bayram namazı Hanefî'ye göre vaciptir; hutbe namazdan sonra sünnettir.",
        delil: "Ebû Dâvûd, Salât; Tirmizî, Cum'a",
      },
      {
        baslik: "Teravih namazı",
        metin:
          "Ramazan gecelerinde kılınan teravih, Hanefî'ye göre yirmi rekât sünnet-i müekkededir; cemaatle kılınması daha faziletlidir.",
        delil: "Buhârî, Salâtü't-terâvîh; Müslim, Salâtü'l-müsâfirîn",
      },
      {
        baslik: "Cemaat edebi",
        metin:
          "Safların düzgün tutulması, ilk safa özen, omuzların bir hizada olması ve namazda başkasını rahatsız etmemek cemaatin edebindendir.",
        delil: "Buhârî, Ezan; Müslim, Salât",
      },
    ],
    sorular: [
      {
        soru: "Cuma namazının farzı kaç rekâttır?",
        secenekler: ["2", "3", "4", "6"],
        cevap: 0,
        aciklama: "Cuma namazı iki rekât farzdır; hutbeyle birlikte kılınır.",
        kaynak: "Cuma 62:9; Buhârî, Cuma",
      },
      {
        soru: "Cemaatle kılınan namaz tek başına kılınandan kaç derece üstündür?",
        secenekler: ["3", "7", "27", "70"],
        cevap: 2,
        aciklama: "Hadiste yirmi yedi derece fazilet bildirilmiştir.",
        kaynak: "Buhârî, Ezan; Müslim, Mesâcid",
      },
      {
        soru: "Hanefî mezhebine göre bayram namazının hükmü nedir?",
        secenekler: ["Sünnet", "Vacip", "Farz-ı ayn", "Müstehap"],
        cevap: 1,
        aciklama: "Bayram namazı Hanefî'ye göre iki rekât vaciptir.",
        kaynak: "Ebû Dâvûd, Salât",
      },
    ],
  },

  // ─────────────────────────── 11 ───────────────────────────
  {
    id: "kurban",
    ad: "Kurban ve Adak",
    emoji: "🐑",
    alt: "Kurbanın hükmü, kesim şartları ve adak borcu",
    maddeler: [
      {
        baslik: "Kurbanın hükmü",
        metin:
          "Hanefî'ye göre kurban bayramında mukîm, hür ve nisap miktarı mala sahip Müslümana kurban kesmek vaciptir.",
        delil: "Kevser 108:2; Buhârî, Edâhî",
      },
      {
        baslik: "Kurbanlık hayvanın yaşı",
        metin:
          "Koyun ve keçi en az bir yaşında, sığır ve manda iki, deve beş yaşında olmalıdır. Yaşını doldurmuş olması şarttır.",
        delil: "Müslim, Edâhî; Ebû Dâvûd, Dâhâyâ",
      },
      {
        baslik: "Kurbanlıkta kusur",
        metin:
          "Bir gözü kör, aşırı topal, hastalığı belli ve aşırı zayıf hayvan kurban edilemez; kulağı veya kuyruğu kesik hayvan da kurban olmaz.",
        delil: "Buhârî, Edâhî; Ebû Dâvûd, Dâhâyâ",
      },
      {
        baslik: "Ortak kurban",
        metin:
          "Sığır ve devede en fazla yedi kişi ortak olabilir. Koyun ve keçi yalnız bir kişi adına kesilir.",
        delil: "Müslim, Edâhî; Tirmizî, Edâhî",
      },
      {
        baslik: "Kesim vakti ve etin dağıtımı",
        metin:
          "Kesim, bayram namazından sonra başlar ve dördüncü günün akşamına kadar sürer. Etin üçte biri fakirlere, üçte biri akraba-komşuya, üçte biri eve ayrılır.",
        delil: "Buhârî, Edâhî; Diyanet İlmihali",
      },
      {
        baslik: "Adak (nezir)",
        metin:
          "Kişi bir iyiliğe bağlayarak adak adarsa, şart gerçekleşince adağı yerine getirmesi vacip olur. Haram bir şeyi adak etmek geçersizdir.",
        delil: "İnsân 76:7; Buhârî, Eymân",
      },
    ],
    sorular: [
      {
        soru: "Hanefî mezhebine göre kurban kesmenin hükmü nedir?",
        secenekler: ["Sünnet", "Vacip", "Farz-ı ayn", "Müstehap"],
        cevap: 1,
        aciklama: "Şartları taşıyan kişiye kurban kesmek Hanefî'ye göre vaciptir.",
        kaynak: "Kevser 108:2; Buhârî, Edâhî",
      },
      {
        soru: "Sığır ve devede en fazla kaç kişi ortak olabilir?",
        secenekler: ["3", "5", "7", "10"],
        cevap: 2,
        aciklama: "Sığır ve devede ortaklık en fazla yedi hissedir.",
        kaynak: "Müslim, Edâhî",
      },
      {
        soru: "Kurban kesimi ne zaman başlar?",
        secenekler: [
          "Arefe günü sabahı",
          "Bayram namazından sonra",
          "Bayramdan bir gün önce",
          "Hicrî yılın sonunda",
        ],
        cevap: 1,
        aciklama: "Hanefî'ye göre kesim bayram namazından sonra başlar ve dördüncü gün akşamına kadar sürer.",
        kaynak: "Buhârî, Edâhî",
      },
    ],
  },

  // ─────────────────────────── 12 ───────────────────────────
  {
    id: "ticaret",
    ad: "Ticaret ve Borç",
    emoji: "⚖️",
    alt: "Helal kazanç, ölçü, sözleşme, emanet ve karz-ı hasen",
    maddeler: [
      {
        baslik: "Helal kazanç",
        metin:
          "Ticaret helâldir; kazanç, aldatma ve haram yolla değil, karşılıklı rızaya dayanan akitle elde edilir.",
        delil: "Bakara 2:275; Nisâ 4:29",
      },
      {
        baslik: "Ölçü ve tartıda dürüstlük",
        metin:
          "Eksik ölçenler, insanların hakkını eksiltenler olarak yerilmiştir. Ölçü ve tartı tam yapılmalıdır.",
        delil: "Mutaffifîn 83:1-3; İsrâ 17:35",
      },
      {
        baslik: "Borç ve sened",
        metin:
          "Borç verildiğinde yazılması ve şahit tutulması tavsiye edilmiştir. Borç, vadesinde ödenir; ödeyemeyene kolaylık gösterilir.",
        delil: "Bakara 2:282; Bakara 2:280",
      },
      {
        baslik: "Emanet",
        metin:
          "Emanet, sahibine iade edilir. Emanete hıyanet, en ağır kul hakkı ihlallerindendir.",
        delil: "Nisâ 4:58; Bakara 2:283",
      },
      {
        baslik: "Aşırı belirsizlik ve aldatma",
        metin:
          "Malın niteliğini belirsiz bırakan (garar) satış ve karşı tarafı kandırma haramdır; ticarette dürüstlük emirdir.",
        delil: "Müslim, Büyû'; Buhârî, Büyû'",
      },
      {
        baslik: "Karz-ı hasen (faizsiz borç)",
        metin:
          "Allah için faizsiz verilen borç, kat kat karşılığı olan bir sadaka sayılır. Borç verirken sıkıştırmak ve faiz istemek caiz değildir.",
        delil: "Bakara 2:245; Bakara 2:278-279",
      },
    ],
    sorular: [
      {
        soru: "Eksik ölçüp tartanlar hangi sûrede yerilmiştir?",
        secenekler: ["Mutaffifîn", "Asr", "Hümeze", "Tekâsür"],
        cevap: 0,
        aciklama: "Mutaffifîn 83:1-3 eksik ölçenleri açıkça yerer.",
        kaynak: "Mutaffifîn 83:1-3",
      },
      {
        soru: "Borç alırken hangisi tavsiye edilmiştir?",
        secenekler: ["Sözlü sözleşme yeterlidir", "Yazmak ve şahit tutmak", "Faiz eklemek", "Senet yırtmak"],
        cevap: 1,
        aciklama: "Bakara 2:282 borcun yazılmasını ve şahit tutulmasını ister.",
        kaynak: "Bakara 2:282",
      },
      {
        soru: "Karz-ı hasen ne demektir?",
        secenekler: [
          "Faizli borç",
          "Allah için faizsiz verilen borç",
          "Ticari kredi",
          "Rehinli satış",
        ],
        cevap: 1,
        aciklama: "Karz-ı hasen, faizsiz ve Allah rızası için verilen güzel borçtur.",
        kaynak: "Bakara 2:245",
      },
    ],
  },
];

export const ILMIHAL_TOPLAM = {
  ders: ILMIHAL_DERSLERI.length,
  madde: ILMIHAL_DERSLERI.reduce((t, d) => t + d.maddeler.length, 0),
  soru: ILMIHAL_DERSLERI.reduce((t, d) => t + d.sorular.length, 0),
};
