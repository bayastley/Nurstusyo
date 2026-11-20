// ════════════════════════════════════════════════════════
// AHLAKEKDATA.TS — Ahlâk Mektebi ek dersleri (4 ders)
// emanet · kanaat · komsu · ilim
// Her maddede ayet (sure:ayet) veya hadis (kitap/bölüm) kaynağı var.
// Hadis numarası yazılmaz; zayıf/uydurma rivayet kullanılmaz.
// ════════════════════════════════════════════════════════

import type { IlmihalDers } from "./ilmihalData";

export const AHLAK_EK_DERSLERI: IlmihalDers[] = [
  {
    id: "emanet",
    ad: "Emanet ve Doğruluk",
    alt: "Sözün, malın ve görevin korunması",
    emoji: "🔐",
    maddeler: [
      {
        baslik: "Emaneti ehline vermek",
        metin:
          "Kur'an, emanetleri ehline teslim etmeyi ve aranızda adaletle hükmetmeyi emreder. Emanet yalnız eşya değildir; sır, görev, çocuk ve toplumun güveni de emanettir.",
        delil: "Nisâ 4:58",
      },
      {
        baslik: "Münafığın üç alâmeti",
        metin:
          "Hadis, konuştuğunda yalan söylemeyi, söz verdiğinde sözünde durmamayı ve emanete hıyanet etmeyi münafıklığın alâmetleri olarak sayar. Bu üç davranış, güveni yıkan ortak paydadır.",
        delil: "Buhârî, Îmân; Müslim, Îmân",
      },
      {
        baslik: "Doğruluk iyiliğe götürür",
        metin:
          "Hadis, doğruluğun iyiliğe, iyiliğin cennete götürdüğünü; yalanın ise günaha ve cehenneme sürüklediğini bildirir. Doğruluk, büyük işlerde değil küçük sözlerde başlar.",
        delil: "Müslim, Birr",
      },
      {
        baslik: "Yalan küçük görülmemeli",
        metin:
          "Şaka bile olsa yalan söylemek, kişiyi doğruluk alışkanlığından uzaklaştırır. Hadis, insanları güldürmek için yalan söyleyenleri uyarır. Güven, bir kez sarsıldığında geri kazanılması zordur.",
        delil: "Tirmizî, Birr; Ebû Dâvûd, Edeb",
      },
      {
        baslik: "İşi ehline vermek",
        metin:
          "Bir görevi hak edene değil tanıdığa vermek, emanete ihanetin kurumsal hâlidir. Hadis, iş ehline verilmediğinde çöküşün geleceğini bildirir. Liyakat, hem ahlâk hem toplum düzenidir.",
        delil: "Buhârî, İlim; Nisâ 4:58",
      },
    ],
    sorular: [
      {
        soru: "Hadise göre münafığın alâmetlerinden biri hangisidir?",
        secenekler: ["Az konuşmak", "Emanete hıyanet etmek", "Çok sadaka vermek", "Gece namazı kılmak"],
        cevap: 1,
        aciklama: "Buhârî ve Müslim'deki rivayet, emanete hıyaneti münafıklığın alâmetleri arasında sayar.",
        kaynak: "Buhârî, Îmân",
      },
      {
        soru: "Nisâ 4:58 neyi emreder?",
        secenekler: [
          "Emanetleri ehline vermeyi ve adaletle hükmetmeyi",
          "Yalnız oruç tutmayı",
          "Ticaret yapmayı",
          "Uzun yolculuğa çıkmayı",
        ],
        cevap: 0,
        aciklama: "Âyet, emanetleri ehline teslim etmeyi ve insanlar arasında adaletle hükmetmeyi emreder.",
        kaynak: "Nisâ 4:58",
      },
      {
        soru: "Doğruluk hakkında hadis ne bildirir?",
        secenekler: [
          "Doğruluk iyiliğe, iyilik cennete götürür",
          "Doğruluk yalnız büyük işlerde gerekir",
          "Şakada yalan caizdir",
          "Doğruluk kişiyi yorar",
        ],
        cevap: 0,
        aciklama: "Müslim'deki rivayet doğruluğun iyiliğe, iyiliğin cennete götürdüğünü bildirir.",
        kaynak: "Müslim, Birr",
      },
    ],
  },
  {
    id: "kanaat",
    ad: "Kanaat ve İsraf",
    alt: "Ölçülü harcamak, elindekinin kıymetini bilmek",
    emoji: "⚖️",
    maddeler: [
      {
        baslik: "İsraf haramdır",
        metin:
          "Kur'an, yiyip içerken israf etmemeyi emreder; Allah israf edenleri sevmez. İsraf, ihtiyaçtan fazlasını harcamak ve nimeti ziyan etmektir. Su, ekmek, zaman ve sağlık da bu ölçüye dahildir.",
        delil: "A'râf 7:31",
      },
      {
        baslik: "Cimrilik ve savurganlık arası denge",
        metin:
          "Kur'an, harcamada ne eli sıkı ne de savurgan olmayı; ikisi arasında ölçülü bir yol tutmayı öğütler. Denge, hem aileyi hem toplumu korur.",
        delil: "Furkan 25:67; İsrâ 17:29",
      },
      {
        baslik: "Zenginlik gönül tokluğudur",
        metin:
          "Hadis, zenginliğin mal çokluğu değil gönül tokluğu olduğunu bildirir. Kanaat, kişiyi başkasının elindekine bakmaktan kurtarır ve şükrü kolaylaştırır.",
        delil: "Buhârî, Rikâk; Müslim, Zekât",
      },
      {
        baslik: "Tasarruf bir ibadettir",
        metin:
          "İhtiyacı ölçüp artanı ihtiyaç sahibine ayırmak, hem aileyi hem ümmeti güçlendirir. Kur'an, infakta önce yakın akrabayı ve ihtiyaç sahiplerini sayar. Tasarruf, cimrilik değil planlı yaşamaktır.",
        delil: "Bakara 2:215; Müslim, Birr",
      },
      {
        baslik: "Borç ve ödeme niyeti",
        metin:
          "Borç almak caizdir; ancak ödemeye niyet etmek ve zamanında ödemek esastır. Hadis, borcunu ödeme niyetiyle alan kimseye Allah'ın yardım edeceğini bildirir; ödememeyi alışkanlık edinen ise uyarılmıştır.",
        delil: "Buhârî, İstikrâz; Müslim, Müsâkât",
      },
    ],
    sorular: [
      {
        soru: "A'râf 7:31 hangi konuda uyarır?",
        secenekler: ["İsraf etmemek", "Uzun konuşmamak", "Gece yolculuğu", "Ticaret yapmamak"],
        cevap: 0,
        aciklama: "Âyet, yiyip içmede israf etmemeyi emreder; Allah israf edenleri sevmez.",
        kaynak: "A'râf 7:31",
      },
      {
        soru: "Hadise göre gerçek zenginlik nedir?",
        secenekler: ["Mal çokluğu", "Gönül tokluğu", "Çok ev sahibi olmak", "Yüksek mevki"],
        cevap: 1,
        aciklama: "Buhârî'deki rivayet, zenginliğin mal çokluğu değil gönül tokluğu olduğunu bildirir.",
        kaynak: "Buhârî, Rikâk",
      },
      {
        soru: "Kur'an'da harcama ölçüsü nasıl anlatılır?",
        secenekler: [
          "Eli sıkı olmak",
          "Savurgan olmak",
          "İkisi arasında ölçülü olmak",
          "Hiç harcamamak",
        ],
        cevap: 2,
        aciklama: "Furkan 25:67, harcamada cimrilik ile savurganlık arasında orta bir yol tutmayı öğütler.",
        kaynak: "Furkan 25:67",
      },
    ],
  },
  {
    id: "komsu",
    ad: "Komşuluk ve Çevre Hakkı",
    alt: "Yakın çevreye karşı sorumluluk",
    emoji: "🏘️",
    maddeler: [
      {
        baslik: "Komşu hakkı Kur'an'da sayılır",
        metin:
          "Kur'an, anne-babadan sonra akrabayı, yetimleri, yoksulları, yakın ve uzak komşuyu sayar. Komşuluk, kan bağı olmayan ama yakınlık doğuran bir haktır.",
        delil: "Nisâ 4:36",
      },
      {
        baslik: "Cebrâil komşuyu tavsiye etti",
        metin:
          "Hadis, Cebrâil'in komşu hakkını o kadar tavsiye ettiğini, Peygamberimizin komşuyu mirasçı kılacağını düşündüğünü bildirir. Bu, komşuluğun dinî ağırlığını gösterir.",
        delil: "Buhârî, Edeb; Müslim, Birr",
      },
      {
        baslik: "Komşuya ikram",
        metin:
          "Hadis, Allah'a ve ahirete iman edenin komşusuna ikram etmesini ister. İkram büyük bir ziyafet değil; selam, hâl hatır ve paylaşılan bir tabaktır.",
        delil: "Buhârî, Edeb; Müslim, Îmân",
      },
      {
        baslik: "Rahatsız etmemek",
        metin:
          "Komşuyu gürültü, koku ve zararla rahatsız etmemek, hakkın en temel parçasıdır. Hadis, komşusunun şerrinden emin olmadığı kişinin olgun mümin olamayacağını bildirir.",
        delil: "Buhârî, Edeb; Müslim, Îmân",
      },
      {
        baslik: "Ortak alan ve çevre",
        metin:
          "Yoldan eziyet veren bir şeyi kaldırmak sadaka sayılır. Ortak alanı temiz tutmak, ağacı ve suyu korumak da bu ölçünün parçasıdır. Çevre, komşuluğun genişlemiş hâlidir.",
        delil: "Buhârî, Mezâlim; Müslim, Îmân",
      },
    ],
    sorular: [
      {
        soru: "Nisâ 4:36'da kimler sayılır?",
        secenekler: [
          "Anne-baba, akraba, yetimler, yoksullar ve komşular",
          "Yalnız tüccarlar",
          "Yalnız yolcular",
          "Yalnız öğretmenler",
        ],
        cevap: 0,
        aciklama: "Âyet, anne-babaya ihsandan sonra akraba, yetim, yoksul, yakın ve uzak komşuyu sayar.",
        kaynak: "Nisâ 4:36",
      },
      {
        soru: "Hadiste komşu hakkı hangi meleğin tavsiyesiyle anılır?",
        secenekler: ["Cebrâil", "Mîkâil", "İsrâfil", "Azrâil"],
        cevap: 0,
        aciklama: "Hadis, Cebrâil'in komşu hakkını ısrarla tavsiye ettiğini bildirir.",
        kaynak: "Buhârî, Edeb",
      },
      {
        soru: "Yoldan eziyet veren bir şeyi kaldırmanın hükmü nedir?",
        secenekler: ["Sadakadır", "Farzdır", "Mekruhtur", "Boş iştir"],
        cevap: 0,
        aciklama: "Hadis, yoldan eziyet veren şeyi kaldırmayı imanın şubelerinden ve sadaka olarak niteler.",
        kaynak: "Buhârî, Mezâlim; Müslim, Îmân",
      },
    ],
  },
  {
    id: "ilim",
    ad: "İlim ve Öğrenme Edebi",
    alt: "Sormak, öğrenmek ve öğretmek",
    emoji: "📚",
    maddeler: [
      {
        baslik: "İlim öğrenmek yol açar",
        metin:
          "Kur'an, \"Rabbim ilmimi artır\" diye duâ etmeyi öğretir. Hadis, ilim yoluna girenin cennete giden yolu kolaylaştırdığını bildirir. İlim, ibadetin bilinçli yapılmasını sağlar.",
        delil: "Tâhâ 20:114; Müslim, Zikir",
      },
      {
        baslik: "Bilenle bilmeyen eşit değildir",
        metin:
          "Kur'an, bilenlerle bilmeyenlerin bir olmayacağını bildirir. Bu ölçü, ilmi üstünlük aracı değil sorumluluk kaynağı yapar: bilen, bildiğiyle amel etmekle yükümlüdür.",
        delil: "Zümer 39:9; Mücâdele 58:11",
      },
      {
        baslik: "Hayır, dinde derinleşmektir",
        metin:
          "Hadis, Allah'ın bir kul için hayır dilediğinde onu dinde fakih kıldığını bildirir. Bu, ezber değil; hükmün kaynağını ve hikmetini anlamaktır.",
        delil: "Buhârî, İlim; Müslim, İmâre",
      },
      {
        baslik: "Öğretmek sadakadır",
        metin:
          "Bildiğini öğretmek, kalıcı sadaka olarak nitelenir. Öğretirken sabırlı olmak, soruyu küçümsememek ve anlaşılır konuşmak, ilmin hakkıdır.",
        delil: "Buhârî, İlim; Müslim, Zühd",
      },
      {
        baslik: "Sormaktan çekinmemek",
        metin:
          "Bilmeyenin sorması ayıp değil, öğrenmemesi eksikliktir. Ancak soru, öğrenmek için sorulur; tartışmayı kazanmak için değil. İlim edebi, hem soranı hem cevaplayanı korur.",
        delil: "Nahl 16:43; Buhârî, İlim",
      },
    ],
    sorular: [
      {
        soru: "Kur'an'da ilim artışı için hangi duâ öğretilir?",
        secenekler: ["Rabbim ilmimi artır", "Rabbim malımı artır", "Rabbim ömrümü uzat", "Rabbim rızkımı çoğalt"],
        cevap: 0,
        aciklama: "Tâhâ 20:114'te \"Rabbim! İlmimi artır\" duâsı öğretilir.",
        kaynak: "Tâhâ 20:114",
      },
      {
        soru: "Hadise göre ilim yoluna girenin neyi kolaylaşır?",
        secenekler: ["Cennete giden yol", "Ticaret kapısı", "Yolculuk izni", "Ev kirası"],
        cevap: 0,
        aciklama: "Müslim'deki rivayet, ilim yoluna girenin cennete giden yolunun kolaylaştırılacağını bildirir.",
        kaynak: "Müslim, Zikir",
      },
      {
        soru: "Bildiğini öğretmek hadiste nasıl nitelenir?",
        secenekler: ["Kalıcı sadaka", "Boş iş", "Sadece görev", "Ticari kazanç"],
        cevap: 0,
        aciklama: "İlim öğretmek, ardından fayda devam eden kalıcı sadaka olarak nitelenir.",
        kaynak: "Buhârî, İlim",
      },
    ],
  },
];
