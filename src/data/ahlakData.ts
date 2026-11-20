// ════════════════════════════════════════════════════════
// AHLAKDATA.TS — Ahlâk ve Tasavvuf Mektebi (yol haritası madde 12)
//
// 8 ders · 40 madde · 24 soru. Her maddede ayet (sure:ayet) veya hadis
// (kitap/bölüm adı) kaynağı var. Hadis numarası yazılmaz (baskıya göre
// değişir); uydurma/zayıf rivayet kullanılmaz. Alim sözleri sahibine
// nispet edilerek verilir, hadis gibi sunulmaz.
// Metinler TR asıl; diğer 4 dil cihazda çeviri katmanıyla üretilir.
// ════════════════════════════════════════════════════════

import type { IlmihalDers } from "./ilmihalData";
import { AHLAK_EK_DERSLERI } from "./ahlakEkData";

export const AHLAK_DERSLERI: IlmihalDers[] = [
  {
    id: "ihlas",
    ad: "İhlâs ve Niyet",
    alt: "Amelin değeri niyetle başlar",
    emoji: "💎",
    maddeler: [
      {
        baslik: "Niyet ameli belirler",
        metin:
          "İslâm'da bir işin değeri, önce niyetine bağlıdır. Aynı davranış niyetle ibadet olur ya da gösteriş olur. Bu yüzden âlimler \"ilim, niyetle başlar\" der: kişi önce kime ve niçin yaptığını netleştirmelidir.",
        delil: "Hadis: \"Ameller niyetlere göredir; herkese ancak niyet ettiği vardır.\" (Buhârî, Bed'ü'l-vahy; Müslim, İmâre)",
      },
      {
        baslik: "İhlâs: ameli Allah için yapmak",
        metin:
          "İhlâs, amele başka bir amaç karıştırmadan yalnız Allah'ın rızasını gözetmektir. İhlâs Suresi, tevhidin özünü üç kısa âyette toplar ve kulun Allah ile ilişkisini sadeleştirir.",
        delil: "İhlâs 112:1-4",
      },
      {
        baslik: "Riyâ (gösteriş) ameli bozar",
        metin:
          "Yapılan iyiliği insanlara duyurmak, beğeni toplamak için yapmak riyâdır. Kur'an, sadakasını gösteriş için verenleri uyarır; böyle bir amelde sevap kalmaz. İyiliği gizli yapmak riyânın en etkili ilacıdır.",
        delil: "Bakara 2:264",
      },
      {
        baslik: "Az amel, devamlı olduğunda değerlidir",
        metin:
          "Sürekli yapılan küçük bir amel, bir defalık büyük amelden daha kıymetlidir. Bu ölçü, kişiyi ara sıra coşup sonra bırakmaktan korur; alışkanlık hâline gelen iyilik kalıcı olur.",
        delil: "Hadis: \"Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.\" (Buhârî, Rikâk; Müslim, Müsâfirîn)",
      },
      {
        baslik: "Niyeti tazelemek",
        metin:
          "Niyet bir defa söylenen söz değil, işin içinde korunan bir hâldir. İşe başlarken \"bunu Allah için yapıyorum\" diye hatırlamak, gün içinde niyeti tazelemenin en sade yoludur.",
        delil: "Hadis: \"Şüphesiz Allah sizin suretlerinize ve mallarınıza bakmaz, kalplerinize ve amellerinize bakar.\" (Müslim, Birr)",
      },
    ],
    sorular: [
      {
        soru: "Bir amelin ibadet sayılması öncelikle neye bağlıdır?",
        secenekler: ["Amelin çokluğuna", "Niyetin doğruluğuna", "Başkalarının görmesine", "Zamanın uzunluğuna"],
        cevap: 1,
        aciklama: "Hadis, amellerin niyetlere göre değerlendirileceğini bildirir; çokluk değil niyet esastır.",
        kaynak: "Buhârî, Bed'ü'l-vahy",
      },
      {
        soru: "İhlâs ne demektir?",
        secenekler: [
          "Ameli yalnız Allah rızası için yapmak",
          "Ameli herkese duyurmak",
          "İbadeti yalnız ramazanda yapmak",
          "Ameli karşılık bekleyerek yapmak",
        ],
        cevap: 0,
        aciklama: "İhlâs, amele Allah rızası dışında bir amaç karıştırmamaktır; İhlâs Suresi bu tevhidi özetler.",
        kaynak: "İhlâs 112:1-4",
      },
      {
        soru: "Hangisi riyâ (gösteriş) sayılır?",
        secenekler: [
          "Sadakayı kimse görmeden vermek",
          "Namazı vaktinde kılmak",
          "İyiliği beğeni toplamak için yapmak",
          "Kur'an okumayı öğrenmek",
        ],
        cevap: 2,
        aciklama: "Bakara 2:264, sadakasını gösteriş için verenleri uyarır; böyle amelde sevap kalmaz.",
        kaynak: "Bakara 2:264",
      },
    ],
  },
  {
    id: "sabir",
    ad: "Sabır ve Şükür",
    alt: "Zorlukta direnç, nimette farkındalık",
    emoji: "🌱",
    maddeler: [
      {
        baslik: "Sabır üçe ayrılır",
        metin:
          "Sabır; ibadette devamlılık, günahtan uzak durma ve musibet karşısında sarsılmama olarak üç yönde yaşanır. Hepsinin ortak noktası, duygunun değil kararın yönetmesidir.",
        delil: "Bakara 2:45; Âsım 103:3",
      },
      {
        baslik: "Musibet karşısında ilk söz",
        metin:
          "Bir kayıp geldiğinde aceleyle isyan etmek yerine \"İnnâ lillâhi ve innâ ileyhi râciûn\" demek, kulun kendini Allah'a bağlamasıdır. Kur'an bu tavrı sabredenlerin alameti olarak anar.",
        delil: "Bakara 2:155-157",
      },
      {
        baslik: "Şükür nimeti artırır",
        metin:
          "Şükür, nimeti saymak ve onu verene bağlamaktır. Kur'an, şükrün nimette artış vesilesi olduğunu bildirir; şükür aynı zamanda kişiyi başkasının elindekine bakmaktan kurtarır.",
        delil: "İbrahim 14:7",
      },
      {
        baslik: "Şükür sadece söz değildir",
        metin:
          "Şükrün üç ayağı vardır: kalpte farkındalık, dilde ifade, organlarla doğru kullanım. Bir nimeti yerinde ve ölçüsünde kullanmak, o nimetin şükrünü yaşamaktır.",
        delil: "Hadis: \"Şükreden azdır.\" (Müslim, Zühd)",
      },
      {
        baslik: "Sabır ve şükür birlikte yürür",
        metin:
          "Mümin, bollukta şükreder, darlıkta sabreder; iki hâlde de kazançtadır. Bu denge, kişiyi olayların değil Rabbine bağlılığın yönettiği bir hayata taşır.",
        delil: "Hadis: \"Müminin işi hayırdır; sevinirse şükreder, üzülürse sabreder.\" (Müslim, Zühd)",
      },
    ],
    sorular: [
      {
        soru: "Sabrın üç yönü hangisidir?",
        secenekler: [
          "İbadette devam, günahtan kaçınma, musibette sarsılmama",
          "Oruç, hac, zekât",
          "İlim, ticaret, seyahat",
          "Sükût, uyku, yalnızlık",
        ],
        cevap: 0,
        aciklama: "Klasik tasnifte sabır üç yönde açıklanır: ibadete devam, günahtan uzak durma, musibete dayanma.",
        kaynak: "Bakara 2:45; Âsım 103:3",
      },
      {
        soru: "İbrahim 14:7 hangi konuyu bildirir?",
        secenekler: ["Şükrün nimeti artıracağını", "Namazın vaktini", "Zekâtın oranını", "Haccın şartlarını"],
        cevap: 0,
        aciklama: "\"Andolsun, eğer şükrederseniz elbette size nimetimi artırırım\" âyeti şükrün sonucunu bildirir.",
        kaynak: "İbrahim 14:7",
      },
      {
        soru: "Şükrün ayağı sayılmayan hangisidir?",
        secenekler: ["Kalpte farkındalık", "Dilde ifade", "Nimeti yerinde kullanmak", "Nimeti başkasına göstermek"],
        cevap: 3,
        aciklama: "Şükür kalp, dil ve davranışla olur; gösteriş şükür değil riyâdır.",
        kaynak: "Müslim, Zühd",
      },
    ],
  },
  {
    id: "tevekkul",
    ad: "Tevekkül ve Rızık",
    alt: "Sebebe sarılmak, sonucu Allah'a bırakmak",
    emoji: "🕊️",
    maddeler: [
      {
        baslik: "Tevekkül tembellik değildir",
        metin:
          "Tevekkül, elinden geleni yaptıktan sonra sonucu Allah'a bırakmaktır. Sebebe sarılmadan \"nasılsa olur\" demek tevekkül değil, sorumluluğu bırakmaktır.",
        delil: "Talâk 65:2-3",
      },
      {
        baslik: "Rızık Allah'ın elindedir",
        metin:
          "Rızkı verenin Allah olduğu inancı, kişiyi hırs ve haksız kazançtan korur. Çalışmak kuldan, rızkı takdir etmek Rabdendir; bu ayrım kalbe güven verir.",
        delil: "Hûd 11:6",
      },
      {
        baslik: "Kalp huzuru zikirdedir",
        metin:
          "Kaygı çoğaldığında Kur'an'ın reçetesi Allah'ı anmaktır. Zikir, zihnin gürültüsünü azaltır ve kişiyi gerçek gündeme, yani Rabbine döndürür.",
        delil: "Ra'd 13:28",
      },
      {
        baslik: "Tedbir ve duâ birlikte",
        metin:
          "Hz. Peygamber, deveyi bağladıktan sonra tevekkülü tavsiye etmiştir. Yani tedbir ile duâ rakip değil, aynı işin iki ayağıdır.",
        delil: "Tirmizî, Kıyâme",
      },
      {
        baslik: "Kanaat zenginliktir",
        metin:
          "Kanaat, elindekiyle yetinmeyi değil, elindekinin kıymetini bilmeyi öğretir. Azla yetinmeyi bilen kalp, çokla da huzur bulamayacağı yarıştan kurtulur.",
        delil: "Hadis: \"Zenginlik mal çokluğu değil, gönül tokluğudur.\" (Buhârî, Rikâk)",
      },
    ],
    sorular: [
      {
        soru: "Tevekkül nasıl tanımlanır?",
        secenekler: [
          "Hiç çalışmadan beklemek",
          "Sebebe sarılıp sonucu Allah'a bırakmak",
          "Sadece duâ edip işi bırakmak",
          "Sonucu kendinden bilmek",
        ],
        cevap: 1,
        aciklama: "Tevekkül, tedbirle duânın birleşmesidir; sebebi terk etmek tevekkül değildir.",
        kaynak: "Talâk 65:2-3",
      },
      {
        soru: "Rızık konusunda Kur'an'ın bildirdiği temel ölçü nedir?",
        secenekler: [
          "Rızkı yalnız kendi emeğinden bilmek",
          "Rızkı verenin Allah olduğunu bilmek",
          "Rızık için her yolu mübah saymak",
          "Rızık kaygısını hiç konuşmamak",
        ],
        cevap: 1,
        aciklama: "Hûd 11:6, yeryüzünde hiçbir canlının rızkının Allah'a ait olmadığını bildirir.",
        kaynak: "Hûd 11:6",
      },
      {
        soru: "Kalp huzuru için Ra'd 13:28 neyi gösterir?",
        secenekler: ["Zikir ve Allah'ı anmak", "Uzun uyku", "Çok konuşmak", "Yalnız kalmak"],
        cevap: 0,
        aciklama: "\"Kalpler ancak Allah'ı anmakla huzur bulur\" âyeti zikri işaret eder.",
        kaynak: "Ra'd 13:28",
      },
    ],
  },
  {
    id: "tevazu",
    ad: "Tevazu ve Kibir",
    alt: "Kendini bilmek, haddini korumak",
    emoji: "🌾",
    maddeler: [
      {
        baslik: "Kibir kalbin hastalığıdır",
        metin:
          "Kibir, kişinin kendini üstün görmesi ve hakkı kabul etmemesidir. Hadis, kibri \"hakkı inkâr etmek ve insanları küçümsemek\" diye tanımlar; bu yüzden tedavisi bilgiyle değil kalple ilgilidir.",
        delil: "Müslim, Îmân",
      },
      {
        baslik: "Tevazu yükseltir",
        metin:
          "Alçakgönüllülük, kişiyi insanların gözünde de Allah katında da yükseltir. Tevazu, başarıyı inkâr etmek değil, başarıyı verene bağlı görmektir.",
        delil: "Hadis: \"Kim Allah için alçakgönüllü olursa Allah onu yükseltir.\" (Müslim, Birr)",
      },
      {
        baslik: "Ölçülü yürüyüş ve konuşma",
        metin:
          "Kur'an, böbürlenerek yürümeyi ve sesi yükseltmeyi yerer. Bu ölçü, kişinin çevresine verdiği rahatsızlığı da azaltır; tevazu sosyal bir nezakettir.",
        delil: "Lokman 31:18-19",
      },
      {
        baslik: "İlim kibir sebebi olmamalı",
        metin:
          "Bilgi arttıkça \"bilmiyorum\" demeyi öğrenmek de gerekir. Âlimin tevazuu, öğrendiğini paylaşması ve hatasını kabul edebilmesidir.",
        delil: "Hadis: \"Allah, ilmini gizleyene ateşten bir gem vurur.\" (Tirmizî, İlim)",
      },
      {
        baslik: "Eleştiriyi dinlemek",
        metin:
          "Doğru söyleyene teşekkür etmek, kibrin en pratik testidir. Haklı eleştiri karşısında savunmaya geçmek yerine düşünmek, kalbin olgunluğunu gösterir.",
        delil: "Hadis: \"Mümin, aynaya bakar gibidir; kusurunu gösterene teşekkür eder.\" (Ebû Dâvûd, Edeb)",
      },
    ],
    sorular: [
      {
        soru: "Hadiste kibir nasıl tanımlanır?",
        secenekler: [
          "Çok konuşmak",
          "Hakkı inkâr etmek ve insanları küçümsemek",
          "Zengin olmak",
          "Yalnız kalmak",
        ],
        cevap: 1,
        aciklama: "Müslim'deki rivayette kibir, hakkı reddetmek ve insanları hor görmek olarak açıklanır.",
        kaynak: "Müslim, Îmân",
      },
      {
        soru: "Tevazu hakkında hangisi doğrudur?",
        secenekler: [
          "Başarıyı yok saymaktır",
          "Kişiyi insanlar ve Allah katında yükseltir",
          "Yalnız fakirlerin özelliğidir",
          "Konuşmayı tamamen bırakmaktır",
        ],
        cevap: 1,
        aciklama: "Hadis, Allah için alçakgönüllü olanı Allah'ın yükselteceğini bildirir.",
        kaynak: "Müslim, Birr",
      },
      {
        soru: "Lokman 31:18-19 hangi davranışı yerer?",
        secenekler: ["Böbürlenerek yürümeyi", "Selam vermeyi", "Sadaka vermeyi", "İlim öğrenmeyi"],
        cevap: 0,
        aciklama: "Âyet, kibirlenerek yürümeyi ve sesi gereksiz yükseltmeyi yerer.",
        kaynak: "Lokman 31:18-19",
      },
    ],
  },
  {
    id: "dil",
    ad: "Dil Edebi ve Gıybet",
    alt: "Sözün gücü, dilin sorumluluğu",
    emoji: "🗣️",
    maddeler: [
      {
        baslik: "Gıybet büyük günahtır",
        metin:
          "Gıybet, kişinin arkasından hoşlanmayacağı şeyi söylemektir; doğru olsa bile gıybettir. Kur'an onu \"kardeşinin ölü etini yemek\" gibi çarpıcı bir benzetmeyle yasaklar.",
        delil: "Hucurât 49:12",
      },
      {
        baslik: "Dilini koruyan kazanır",
        metin:
          "Müslümanın alameti, dilinden ve elinden Müslümanların güvende olmasıdır. Konuşmadan önce \"söylemesem ne kaybederim?\" sorusu, dilin en pratik frenidir.",
        delil: "Buhârî, Îmân; Müslim, Îmân",
      },
      {
        baslik: "İftira ve yalan",
        metin:
          "Yalan, bilerek gerçeğe aykırı konuşmaktır; iftira ise birine yapmadığı şeyi isnat etmektir. İkisi de güveni yıkar, kul hakkı doğurur.",
        delil: "Hucurât 49:6; Hadis: \"Yalan sözü ve yalanla iş yapmayı bırakmayanın orucuna Allah ihtiyaç duymaz.\" (Buhârî, Savm)",
      },
      {
        baslik: "Sır saklamak",
        metin:
          "Sır, emanettir; sırrı yaymak güveni bitirir. Hadis, sırrı ifşa edenin emanete ihanet ettiğini bildirir.",
        delil: "Hadis: \"Bir kimse bir söz söyler de etrafına bakınırsa, o söz emanettir.\" (Tirmizî, Edeb)",
      },
      {
        baslik: "Susmak da ibadettir",
        metin:
          "Her doğru her yerde söylenmez; yeri, zamanı ve muhatabı gözetmek gerekir. Faydasız sözü bırakmak, kalbi de sözü de korur.",
        delil: "Hadis: \"Kim Allah'a ve ahirete inanıyorsa ya hayır söylesin ya sussun.\" (Buhârî, Edeb)",
      },
    ],
    sorular: [
      {
        soru: "Gıybet nedir?",
        secenekler: [
          "Kişinin arkasından hoşlanmayacağı şeyi söylemek",
          "Kişiye yüzüne doğruyu söylemek",
          "Birinin iyiliğini anlatmak",
          "Susmayı tercih etmek",
        ],
        cevap: 0,
        aciklama: "Gıybet, doğru bile olsa kişinin arkasından hoşlanmayacağı şeyi konuşmaktır (Hucurât 49:12).",
        kaynak: "Hucurât 49:12",
      },
      {
        soru: "Müslümanın alameti hangisidir?",
        secenekler: [
          "Çok konuşması",
          "Dilinden ve elinden Müslümanların güvende olması",
          "Her konuda fikir beyan etmesi",
          "Az gülmesi",
        ],
        cevap: 1,
        aciklama: "Buhârî ve Müslim'deki rivayet, Müslümanı dilinden ve elinden emin olunan kişi olarak tanımlar.",
        kaynak: "Buhârî, Îmân",
      },
      {
        soru: "Sır hakkında hadis ne bildirir?",
        secenekler: [
          "Sır paylaşılabilir",
          "Etrafına bakınarak söylenen söz emanettir",
          "Sır yalnız aileye söylenir",
          "Sır saklamak gereksizdir",
        ],
        cevap: 1,
        aciklama: "Tirmizî'deki rivayet, gizli söylenen sözü emanet sayar; yaymak ihanettir.",
        kaynak: "Tirmizî, Edeb",
      },
    ],
  },
  {
    id: "aile",
    ad: "Anne-Baba ve Sıla-i Rahim",
    alt: "En yakın halka: aile",
    emoji: "🏡",
    maddeler: [
      {
        baslik: "Anne-babaya ihsan",
        metin:
          "Kur'an, tevhidden hemen sonra anne-babaya iyi davranmayı emreder. Yaşlandıklarında \"öf\" bile dememek, onların emeğine karşı en temel edeptir.",
        delil: "İsrâ 17:23-24",
      },
      {
        baslik: "Sıla-i rahim rızkı artırır",
        metin:
          "Akrabayı ziyaret ve hâlini sormak, İslâm'ın ısrarla tavsiye ettiği bir bağdır. Hadis, sıla-i rahmin rızkı bollaştırdığını ve ömrü bereketlendirdiğini bildirir.",
        delil: "Buhârî, Büyû",
      },
      {
        baslik: "Aile içinde merhamet",
        metin:
          "Ailenin temeli merhamet ve adalettir. Hz. Peygamber'in evinde yumuşak davrandığı, işlerde yardım ettiği bilinir; bu, aile içi ilişkinin ölçüsüdür.",
        delil: "Rûm 30:21; Buhârî, Nikâh",
      },
      {
        baslik: "Akrabayı kesmek uyarılmıştır",
        metin:
          "Akrabalık bağını koparmak, Kur'an'ın açıkça yerdiği bir davranıştır. Küskünlük olsa bile selamı ve hâl hatır sormayı sürdürmek tavsiye edilir.",
        delil: "Muhammed 47:22-23",
      },
      {
        baslik: "Küçüklere şefkat, büyüklere saygı",
        metin:
          "Ailede huzur, kuşaklar arası edeple kurulur. Küçüğe şefkat, büyüğe hürmet; her ikisi de dinin \"merhamet\" ölçüsünün parçasıdır.",
        delil: "Tirmizî, Birr",
      },
    ],
    sorular: [
      {
        soru: "İsrâ 17:23-24 neyi emreder?",
        secenekler: [
          "Anne-babaya iyi davranmayı",
          "Yolculuğa çıkmayı",
          "Ticaret yapmayı",
          "Komşuya borç vermeyi",
        ],
        cevap: 0,
        aciklama: "Âyet, tevhidden sonra anne-babaya ihsanı emreder; yaşlılıklarında incitmemeyi öğütler.",
        kaynak: "İsrâ 17:23-24",
      },
      {
        soru: "Sıla-i rahim hakkında hadis ne bildirir?",
        secenekler: [
          "Rızkı daraltır",
          "Rızkı bollaştırır ve ömrü bereketlendirir",
          "Sadece bayramda yapılır",
          "Yalnız zenginlere yapılır",
        ],
        cevap: 1,
        aciklama: "Buhârî'deki rivayet, sıla-i rahmin rızık ve ömür bereketine vesile olduğunu bildirir.",
        kaynak: "Buhârî, Büyû",
      },
      {
        soru: "Akrabalık bağını koparmak hakkında hangisi doğrudur?",
        secenekler: [
          "Teşvik edilmiştir",
          "Kur'an'da yerilmiştir",
          "Mubah sayılmıştır",
          "Sadece akrabaya bağlıdır",
        ],
        cevap: 1,
        aciklama: "Muhammed 47:22-23, akrabalık bağını koparanları ve yeryüzünde bozgunculuk çıkaranları yerer.",
        kaynak: "Muhammed 47:22-23",
      },
    ],
  },
  {
    id: "comertlik",
    ad: "Cömertlik ve İnfak",
    alt: "Vermenin bereketi",
    emoji: "🤲",
    maddeler: [
      {
        baslik: "İnfak misali",
        metin:
          "Kur'an, Allah yolunda harcayanı yedi başak veren tohuma benzetir; her başakta yüz tane. Bu misal, verilenin eksilmediğini, çoğaldığını anlatır.",
        delil: "Bakara 2:261",
      },
      {
        baslik: "Sadaka malı eksiltmez",
        metin:
          "Hadis, sadakanın malı eksiltmediğini bildirir. Hesap yalnız maddi değil; bereket, huzur ve güven de kazanca dahildir.",
        delil: "Müslim, Birr",
      },
      {
        baslik: "Gizli sadaka",
        metin:
          "Sağ elin verdiğini sol elin bilmemesi, riyâdan korunmanın en güzel ölçüsüdür. Gizli verilen sadaka, verenin kalbini de temizler.",
        delil: "Bakara 2:271",
      },
      {
        baslik: "En yakından başla",
        metin:
          "İnfak önce aileden başlar; sonra akraba, komşu ve ihtiyaç sahibi gelir. Sıralamayı bilmek, yardımın dağılmadan yerine ulaşmasını sağlar.",
        delil: "Bakara 2:215",
      },
      {
        baslik: "Veren el üstündür",
        metin:
          "Hadis, veren elin alan elden üstün olduğunu bildirir. Bu ölçü, yardımı bir lütuf değil, hakkın teslimi olarak görmeyi öğretir.",
        delil: "Buhârî, Zekât",
      },
    ],
    sorular: [
      {
        soru: "Bakara 2:261'de infak neye benzetilir?",
        secenekler: [
          "Yedi başak veren tohuma",
          "Denize atılan taşa",
          "Kuruyan bir dala",
          "Yolculuğa",
        ],
        cevap: 0,
        aciklama: "Âyet, infakı yedi başak veren, her başağında yüz tane bulunan tohuma benzetir.",
        kaynak: "Bakara 2:261",
      },
      {
        soru: "Hadise göre sadakanın mala etkisi nedir?",
        secenekler: ["Eksiltir", "Eksiltmez", "Hiç etkilemez", "Artırmaz"],
        cevap: 1,
        aciklama: "Müslim'deki rivayet \"Sadaka malı eksiltmez\" buyurur; bereket de kazanca dahildir.",
        kaynak: "Müslim, Birr",
      },
      {
        soru: "İnfakta öncelik sırası nasıldır?",
        secenekler: [
          "Önce uzak akraba",
          "Önce aile, sonra akraba ve ihtiyaç sahipleri",
          "Yalnız camiye vermek",
          "Yalnız bayramda vermek",
        ],
        cevap: 1,
        aciklama: "Bakara 2:215, infakın anne-baba, akraba, yetimler ve ihtiyaç sahiplerinden başladığını bildirir.",
        kaynak: "Bakara 2:215",
      },
    ],
  },
  {
    id: "tovbe",
    ad: "Tövbe ve İstiğfâr",
    alt: "Dönüş kapısı her zaman açık",
    emoji: "🌅",
    maddeler: [
      {
        baslik: "Tövbe kapısı açıktır",
        metin:
          "Kur'an, günahları çoğalmış olsa bile Allah'ın rahmetinden ümit kesmemeyi emreder. Tövbe, geçmişi silmenin değil, yönü değiştirmenin adıdır.",
        delil: "Zümer 39:53",
      },
      {
        baslik: "Tövbenin şartları",
        metin:
          "Âlimler tövbeyi üç şarta bağlar: günahı bırakmak, pişman olmak, bir daha yapmamaya karar vermek. Kul hakkı varsa helâlleşmek dördüncü şarttır.",
        delil: "Tahrîm 66:8; Hadis: \"Pişmanlık tövbedir.\" (İbn Mâce, Zühd)",
      },
      {
        baslik: "Allah tövbeye sevinir",
        metin:
          "Hadis, kulun tövbesine Allah'ın sevinmesini, çölde devesini kaybedip bulanın sevincine benzetir. Bu, tövbenin kabulüne dair güçlü bir müjdedir.",
        delil: "Müslim, Tevbe",
      },
      {
        baslik: "İstiğfâr alışkanlık olmalı",
        metin:
          "Hz. Peygamber, günde yetmişten fazla istiğfâr ettiğini bildirmiştir. Masum olduğu hâlde bunu yapması, istiğfârın bir ihtiyaç değil, kulun Rabbiyle bağını tazelemesi olduğunu gösterir.",
        delil: "Buhârî, Daavât",
      },
      {
        baslik: "Tövbeyi geciktirmemek",
        metin:
          "Tövbeyi \"yarın\"a bırakmak, kararı zayıflatır. Ölüm gelmeden ve güneş batıdan doğmadan önce dönüş yapılması tavsiye edilir.",
        delil: "Hadis: \"Allah kulun tövbesini, can boğaza gelmeden kabul eder.\" (Tirmizî, Deavât)",
      },
    ],
    sorular: [
      {
        soru: "Zümer 39:53 neyi bildirir?",
        secenekler: [
          "Günahlar affedilmez",
          "Allah'ın rahmetinden ümit kesilmemesini",
          "Tövbenin yalnız ramazanda olduğunu",
          "İstiğfârın farz olduğunu",
        ],
        cevap: 1,
        aciklama: "Âyet, günahları çok olsa da Allah'ın rahmetinden ümit kesmemeyi emreder.",
        kaynak: "Zümer 39:53",
      },
      {
        soru: "Tövbenin şartları arasında hangisi yoktur?",
        secenekler: ["Pişmanlık", "Günahı bırakmak", "Bir daha yapmamaya karar vermek", "Günahı başkasına anlatmak"],
        cevap: 3,
        aciklama: "Tövbe pişmanlık, terk ve kararla olur; günahı yaymak tövbenin şartı değildir.",
        kaynak: "Tahrîm 66:8",
      },
      {
        soru: "Hadiste tövbe neye benzetilir?",
        secenekler: [
          "Devesini kaybedip bulanın sevincine",
          "Yolculuğa çıkmaya",
          "Ticaret yapmaya",
          "Oruç tutmaya",
        ],
        cevap: 0,
        aciklama: "Müslim'deki rivayet, Allah'ın kulun tövbesine duyduğu sevinci bu benzetmeyle anlatır.",
        kaynak: "Müslim, Tevbe",
      },
    ],
  },
  // ★ 21.11 İÇERİK GENİŞLETME: 4 yeni ders (toplam 12 ders)
  ...AHLAK_EK_DERSLERI,
];

export const AHLAK_TOPLAM = {
  ders: AHLAK_DERSLERI.length,
  madde: AHLAK_DERSLERI.reduce((t, d) => t + d.maddeler.length, 0),
  soru: AHLAK_DERSLERI.reduce((t, d) => t + d.sorular.length, 0),
};

export const AHLAK_KAYNAK_NOTU =
  "Kaynaklar: Kur'an (sure:ayet), Buhârî-Müslim-Tirmizî-Ebû Dâvûd-İbn Mâce (kitap/bölüm adı). Hadis numarası verilmez; zayıf/uydurma rivayet kullanılmaz. Alim sözleri sahibine nispet edilir. Ahlâk, fıkıh gibi hüküm değil; niyet, ölçü ve davranış eğitimidir.";
