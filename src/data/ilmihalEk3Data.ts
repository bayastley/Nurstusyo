// ════════════════════════════════════════════════════════
// ILMIHALEK3DATA.TS — İlmihal Akademisi ek dersleri (3/3)
// hayiz · nikah · miras · av-kesim · akitler · ceza · sadaka
//
// ★ SAHİHLİK: Hanefî mezhebinin yaygın (Diyanet İlmihali ile uyumlu) görüşleri.
//   Hadis numarası YAZILMAZ; kitap/bölüm adı verilir. Zayıf rivayet kullanılmaz.
//   Miras payları Nisâ 4:11-12 ve 4:176'ya dayanır.
// ════════════════════════════════════════════════════════

import type { IlmihalDers } from "./ilmihalData";

export const ILMIHAL_EK3_DERSLERI: IlmihalDers[] = [
  // ───────────────────── 1 ─────────────────────
  {
    id: "hayiz",
    ad: "Kadınlara Özel Haller",
    emoji: "🌸",
    alt: "Hayız, nifas ve istihaza: süreler, ibadet hükümleri, temizlik",
    maddeler: [
      {
        baslik: "Hayızın süresi",
        metin:
          "Hanefî'ye göre hayız en az üç gün üç gecedir, en çok on gündür. İki hayız arasındaki temizlik en az on beş gündür. Bu sürelerin dışındaki kan hayız sayılmaz; özür kanı olarak değerlendirilir.",
        delil: "Bakara 2:222; Diyanet İlmihali, Hayız",
      },
      {
        baslik: "Hayızlı kadının namazı ve orucu",
        metin:
          "Hayızlı kadın namaz kılmaz ve kılamadığı namazları kaza etmez. Oruç tutmaz; tutamadığı oruçları temizlendikten sonra kaza eder. Bu hüküm, ibadetin hafifletilmesi değil, tahâret şartının bulunmamasındandır.",
        delil: "Buhârî, Hayız — \"Hayızlı kadın namazı kaza etmez mi?\"; Müslim, Hayız",
      },
      {
        baslik: "Kur'an, mescit ve zikir",
        metin:
          "Hanefî'ye göre hayızlı kadın Kur'an âyeti okumaz ve mescide girmez. Zikir, dua, salavat ve hadis okumak serbesttir. Bu sınırlar ibadet saygısını korumak içindir.",
        delil: "Tirmizî, Tahâret; Diyanet İlmihali, Hayız Hâlinde Yapılamayanlar",
      },
      {
        baslik: "Nifas (loğusalık)",
        metin:
          "Doğumdan sonra gelen kan nifastır. Hanefî'ye göre en çok kırk gündür; kırk gün dolunca kan devam etse bile gusül yapılır ve ibadete dönülür. Nifas hâlinde de namaz kılınmaz, oruç tutulmaz.",
        delil: "Müslim, Hayız; Diyanet İlmihali, Nifas",
      },
      {
        baslik: "İstihaza (özür kanı)",
        metin:
          "Hayız ve nifas süresi dışında sürekli gelen kan istihazadır; hastalık hükmündedir. Bu hâlde kadın her namaz vakti için abdest alır, namazını kılar ve orucunu tutar. Kanın akması tek başına abdesti bozmaz.",
        delil: "Buhârî, Vudû — \"Her namaz için abdest al\"; Diyanet İlmihali, İstihaza",
      },
      {
        baslik: "Temizlenme ve gusül",
        metin:
          "Hayız ve nifas sona erince gusül farzdır. Gusül, hem hadesi hem hayız hükmünü kaldırır; ardından namaz ve oruç yeniden başlar. Temizlenmeden önce ilişki haramdır.",
        delil: "Mâide 5:6; Bakara 2:222; Buhârî, Gusül",
      },
    ],
    sorular: [
      {
        soru: "Hanefî'ye göre hayızın en çok süresi kaç gündür?",
        secenekler: ["7 gün", "10 gün", "15 gün", "40 gün"],
        cevap: 1,
        aciklama: "Hayız en az 3 gün 3 gece, en çok 10 gündür.",
        kaynak: "Diyanet İlmihali, Hayız",
      },
      {
        soru: "Hayızlı kadın hangi ibadeti sonradan kaza eder?",
        secenekler: ["Namazı", "Orucu", "İkisini de", "Hiçbirini"],
        cevap: 1,
        aciklama: "Namaz kaza edilmez; tutulamayan oruçlar temizlendikten sonra kaza edilir.",
        kaynak: "Buhârî, Hayız; Müslim, Hayız",
      },
      {
        soru: "İstihaza kanı bulunan kadın nasıl ibadet eder?",
        secenekler: [
          "Her namaz vakti abdest alıp kılar",
          "Namazı tamamen bırakır",
          "Yalnız cuma kılar",
          "Sadece oruç tutar",
        ],
        cevap: 0,
        aciklama: "İstihaza özür hâlidir; her vakit için abdest alınır, namaz ve oruç sürer.",
        kaynak: "Buhârî, Vudû; Diyanet İlmihali, İstihaza",
      },
    ],
  },

  // ───────────────────── 2 ─────────────────────
  {
    id: "nikah-hukuku",
    ad: "Nikâh, Talâk ve İddet",
    emoji: "💍",
    alt: "Evlenme engelleri, mehir, boşama çeşitleri ve bekleme süresi",
    maddeler: [
      {
        baslik: "Nikâhın rükün ve şartları",
        metin:
          "Nikâh icap ve kabul ile kurulur; iki Müslüman şahidin bulunması şarttır. Mehir kadının hakkıdır; nikâhta belirtilmezse mehr-i misil takdir edilir. Resmî nikâh kaydı da ihmal edilmemelidir.",
        delil: "Nisâ 4:4; Buhârî, Nikâh",
      },
      {
        baslik: "Evlenme engelleri",
        metin:
          "Nesep (usul ve fürû), sıhriyet (kayınvalide, gelin, üvey anne), süt akrabalığı, din farkı, kadının başkasının nikâhında veya iddette olması ve iki kız kardeşi birlikte nikâhlamak evlenmeye engeldir.",
        delil: "Nisâ 4:22-24",
      },
      {
        baslik: "Velî ve denklik (kefâet)",
        metin:
          "Hanefî'ye göre bâliğa ve âkile kadın kendi nikâhını akdedebilir. Velînin denklik (kefâet) sebebiyle itiraz hakkı saklıdır; zorla evlendirme caiz değildir.",
        delil: "Nisâ 4:3; Diyanet İlmihali, Nikâh",
      },
      {
        baslik: "Mehir ve nafaka",
        metin:
          "Mehir peşin (muaccel) veya vadeli (müeccel) olabilir; kadının malıdır, ailesine devredilmez. Nafaka — barınma, gıda, giyim — kocanın borcudur; ihmal edilmesi kul hakkıdır.",
        delil: "Nisâ 4:4, 4:34; Talâk 65:7",
      },
      {
        baslik: "Talâk (boşama)",
        metin:
          "Sünnî talâk, kadının temizlik döneminde bir defa boşamaktır. Üç talâk tamamlanınca taraflar ayrılır; hul' ise kadının bedel karşılığı ayrılmasıdır. Boşama keyfîlik değil, hukukî sonuçları olan bir işlemdir.",
        delil: "Bakara 2:228-229; Talâk 65:1",
      },
      {
        baslik: "İddet",
        metin:
          "Boşanan kadın üç hayız (veya üç ay) iddet bekler; hamile ise iddet doğumla biter. Kocası vefat eden kadının iddeti dört ay on gündür. İddet, nesebin karışmaması ve hakların korunması içindir.",
        delil: "Bakara 2:228, 2:234; Talâk 65:4",
      },
    ],
    sorular: [
      {
        soru: "Hanefî'ye göre nikâhta şahitlik için hangisi yeterlidir?",
        secenekler: [
          "İki erkek veya bir erkek iki kadın",
          "Bir kişi",
          "Şahit gerekmez",
          "Yalnız iki kadın",
        ],
        cevap: 0,
        aciklama: "Nikâhta iki erkek veya bir erkek iki kadın şahit bulunur.",
        kaynak: "Buhârî, Nikâh; Diyanet İlmihali",
      },
      {
        soru: "Kocası vefat eden kadının iddeti ne kadardır?",
        secenekler: ["Üç ay", "Dört ay on gün", "Kırk gün", "Bir yıl"],
        cevap: 1,
        aciklama: "Vefat iddeti dört ay on gündür; hamilelik varsa doğumla sona erer.",
        kaynak: "Bakara 2:234",
      },
      {
        soru: "Nikâhta mehir belirtilmezse ne olur?",
        secenekler: ["Nikâh geçersizdir", "Mehr-i misil takdir edilir", "Kadın hak talep edemez", "Mehir düşer"],
        cevap: 1,
        aciklama: "Mehir belirtilmezse benzerlerine göre mehr-i misil takdir edilir.",
        kaynak: "Nisâ 4:4; Diyanet İlmihali",
      },
    ],
  },

  // ───────────────────── 3 ─────────────────────
  {
    id: "miras",
    ad: "Miras ve Ferâiz",
    emoji: "📜",
    alt: "Terekenin sırası, zevc-zevce, anne-baba, çocuk ve kardeş payları",
    maddeler: [
      {
        baslik: "Terekenin taksim sırası",
        metin:
          "Önce cenaze masrafları, sonra ölünün borçları ödenir; ardından vasiyet yerine getirilir (en çok üçte bir). Kalan mal, Kur'an'da belirlenen paylarla mirasçılara dağıtılır.",
        delil: "Nisâ 4:11-12; Buhârî, Vesâyâ",
      },
      {
        baslik: "Zevc ve zevcenin payı",
        metin:
          "Koca, çocuk yoksa karısının terekesinden 1/2, çocuk varsa 1/4 alır. Kadın, kocasının terekesinden çocuk yoksa 1/4, çocuk varsa 1/8 alır.",
        delil: "Nisâ 4:12",
      },
      {
        baslik: "Anne ve babanın payı",
        metin:
          "Anne, çocuk yoksa 1/3, çocuk varsa 1/6 alır. Baba, çocuk varsa 1/6 alır; çocuk yoksa kalan mal üzerinden asabe olarak alır.",
        delil: "Nisâ 4:11",
      },
      {
        baslik: "Çocukların payı",
        metin:
          "Tek kız çocuk 1/2, iki veya daha fazla kız çocuk toplam 2/3 alır. Erkek çocuk, kız kardeşinin iki katı pay alır. Çocuklar varsa kardeşler mirasçı olmaz.",
        delil: "Nisâ 4:11, 4:176",
      },
      {
        baslik: "Kardeşlerin payı",
        metin:
          "Anne bir kardeş tek ise 1/6, birden fazla ise toplam 1/3 alır. Öz veya baba bir kardeşler, kalan mal üzerinden asabe olarak pay alır. Miras payları kişisel görüşle değiştirilemez.",
        delil: "Nisâ 4:12, 4:176",
      },
      {
        baslik: "Mirasçı olamayanlar",
        metin:
          "Öldüren kişi öldürdüğü yakınına mirasçı olamaz. Müslüman gayrimüslimden, gayrimüslim de Müslümandan miras alamaz. Vasiyet, mirasçıların hakkını azaltmamak için üçte biri aşamaz.",
        delil: "Buhârî, Ferâiz; Müslim, Vasiyet; Tirmizî, Ferâiz",
      },
    ],
    sorular: [
      {
        soru: "Çocuğu olmayan kadın, kocasının terekesinden ne kadar alır?",
        secenekler: ["1/8", "1/4", "1/3", "1/2"],
        cevap: 1,
        aciklama: "Çocuk yoksa zevce 1/4, çocuk varsa 1/8 alır.",
        kaynak: "Nisâ 4:12",
      },
      {
        soru: "Vasiyet en fazla terekenin ne kadarına kadar geçerlidir?",
        secenekler: ["Tamamı", "Yarısı", "Üçte biri", "Sınır yok"],
        cevap: 2,
        aciklama: "Vasiyet, mirasçıların hakkını korumak için en çok üçte birde geçerlidir.",
        kaynak: "Buhârî, Vesâyâ; Müslim, Vasiyet",
      },
      {
        soru: "Aşağıdakilerden hangisi mirasçı olamaz?",
        secenekler: ["Öldüren kişi", "Torun", "Kardeş", "Eş"],
        cevap: 0,
        aciklama: "Katil, öldürdüğü yakınına mirasçı olamaz.",
        kaynak: "Tirmizî, Ferâiz; Buhârî, Ferâiz",
      },
    ],
  },

  // ───────────────────── 4 ─────────────────────
  {
    id: "av-kesim",
    ad: "Avlanma ve Hayvan Kesimi",
    emoji: "🏹",
    alt: "Kesim şartları, besmele, avlanma, deniz ürünleri ve haram etler",
    maddeler: [
      {
        baslik: "Kesimin şartları",
        metin:
          "Hayvanın boğazı ve iki şah damarı keskin aletle kesilir; kesim sırasında besmele okunur. Hayvanın canlı iken kesilmesi ve kesimin ard arda yapılması gerekir.",
        delil: "En'âm 6:121; Müslim, Edâhî",
      },
      {
        baslik: "Besmeleyi terk etmenin hükmü",
        metin:
          "Hanefî'ye göre besmele kasten terk edilirse kesilen hayvanın eti yenmez; unutma mazeret sayılır. Bu hüküm, kesimin Allah adına yapıldığını görünür kılar.",
        delil: "En'âm 6:121; Diyanet İlmihali, Kesim",
      },
      {
        baslik: "Avlanma",
        metin:
          "Eğitimli köpek, av kuşu veya ok ile besmele çekilerek avlanır. Av hayvanı yaralanıp ölmüşse yenir; avcı yetişmeden ölmesi hâlinde de eğitimli hayvanın avı helâldir.",
        delil: "Mâide 5:4; Buhârî, Sayd",
      },
      {
        baslik: "Deniz ürünleri",
        metin:
          "Balık helâldir; domuz balığı haramdır. Diğer deniz ürünleri (karides, midye gibi) mezhepler arasında tartışmalıdır; Hanefî'de balık dışındakilerde ihtiyat öne çıkar.",
        delil: "Mâide 5:96; Diyanet İlmihali, Deniz Ürünleri",
      },
      {
        baslik: "Haram etler",
        metin:
          "Domuz eti, leş, kan, Allah'tan başkası adına kesilen hayvan, yırtıcı dişli hayvanlar ve yırtıcı kuşlar haramdır. Zaruret hâlinde sınır aşmadan haram yenilebilir.",
        delil: "Mâide 5:3; Bakara 2:173",
      },
      {
        baslik: "Kurbanlık hayvanın yaşı ve kusuru",
        metin:
          "Kurbanlık koyun bir yaşını, sığır iki, deve beş yaşını doldurmalıdır. Kör, topal, aşırı zayıf ve kulağı kesik gibi kusurlu hayvan kurban edilemez.",
        delil: "Müslim, Edâhî; Tirmizî, Edâhî",
      },
    ],
    sorular: [
      {
        soru: "Kesim sırasında okunması gereken nedir?",
        secenekler: ["Besmele", "Tekbir", "Salavat", "Fatiha"],
        cevap: 0,
        aciklama: "Kesimde besmele okunur; kasten terk edilirse Hanefî'ye göre et yenmez.",
        kaynak: "En'âm 6:121",
      },
      {
        soru: "Deniz ürünlerinden hangisi kesin helâldir?",
        secenekler: ["Balık", "Domuz balığı", "Midye", "Karides"],
        cevap: 0,
        aciklama: "Balık helâldir; domuz balığı haram, diğerleri tartışmalıdır.",
        kaynak: "Mâide 5:96",
      },
      {
        soru: "Kurbanlık koyunun yaşı en az kaç olmalıdır?",
        secenekler: ["6 ay", "1 yaş", "2 yaş", "3 yaş"],
        cevap: 1,
        aciklama: "Koyun bir yaşını doldurmalıdır; sığır iki, deve beştir.",
        kaynak: "Müslim, Edâhî",
      },
    ],
  },

  // ───────────────────── 5 ─────────────────────
  {
    id: "akitler",
    ad: "Vakıf, Hibe, Rehin ve Kefalet",
    emoji: "📝",
    alt: "Hayır akitleri, teminat ve borç ilişkilerinin fıkhî çerçevesi",
    maddeler: [
      {
        baslik: "Vakıf",
        metin:
          "Vakıf, bir malı Allah rızası için hayır hizmetine tahsis etmektir. Vakfedilen mal artık satılmaz, hibe edilmez ve miras olmaz; geliri amacına harcanır.",
        delil: "Âl-i İmrân 3:92; Buhârî, Vesâyâ — Hz. Ömer'in sadakası",
      },
      {
        baslik: "Hibe",
        metin:
          "Hibe karşılıksız bağıştır; teslimle tamamlanır. Bağış, tarafların rızasıyla ve hibe hükümlerinin izin verdiği hâllerde geri alınabilir; zorla geri alma kul hakkıdır.",
        delil: "Buhârî, Hibe; Diyanet İlmihali, Hibe",
      },
      {
        baslik: "Rehin",
        metin:
          "Rehin, borca karşılık malı teminat olarak bırakmaktır. Rehin edilen mal, sahibinin izni olmadan kullanılamaz ve satılamaz; borç ödenince geri verilir.",
        delil: "Bakara 2:283; Buhârî, Rehn",
      },
      {
        baslik: "Kefalet",
        metin:
          "Kefalet, başkasının borcunu ödemeyi üstlenmektir. Kefil, borç ödenmezse alacaklıya öder; sonra asıl borçluya rücu eder. Kefalet yazılı ve belirli olmalıdır.",
        delil: "Yûsuf 12:72; Buhârî, Kefâlet",
      },
      {
        baslik: "Sulh ve ibra",
        metin:
          "Sulh, anlaşmazlığı karşılıklı rızayla sona erdirmektir. İbra ise alacaklının hakkından vazgeçmesidir; ibra ile borç düşer. Her ikisi de tarafların özgür iradesine dayanır.",
        delil: "Nisâ 4:128; Buhârî, Sulh",
      },
      {
        baslik: "Emanet ve gasp",
        metin:
          "Emanet, korunmak üzere bırakılan maldır; kusur olmadan zayi olursa tazmin gerekmez. Gasp ise zorla almaktır; gasp edilen mal aynen veya bedeliyle tazmin edilir.",
        delil: "Nisâ 4:58; Buhârî, Mezâlim",
      },
    ],
    sorular: [
      {
        soru: "Rehin ne için yapılır?",
        secenekler: ["Borca teminat", "Miras paylaşımı", "Zekât hesabı", "Kira sözleşmesi"],
        cevap: 0,
        aciklama: "Rehin, borcun ödenmesini güvence altına alır.",
        kaynak: "Bakara 2:283",
      },
      {
        soru: "Kefil, borç ödenmediğinde ne yapar?",
        secenekler: ["Borcu öder", "Sorumlu olmaz", "Mahkemeye başvurur", "Malı satar"],
        cevap: 0,
        aciklama: "Kefil borcu öder, sonra asıl borçluya rücu eder.",
        kaynak: "Buhârî, Kefâlet",
      },
      {
        soru: "Vakfedilen mal için hangisi doğrudur?",
        secenekler: ["Satılabilir", "Geri alınabilir", "Amacına tahsis edilir", "Miras olur"],
        cevap: 2,
        aciklama: "Vakıf malı hayır amacına tahsis edilir; satılmaz ve miras olmaz.",
        kaynak: "Âl-i İmrân 3:92; Buhârî, Vesâyâ",
      },
    ],
  },

  // ───────────────────── 6 ─────────────────────
  {
    id: "ceza",
    ad: "Hadler, Kısas ve Diyet",
    emoji: "⚖️",
    alt: "Suç ve ceza dengesi, af, diyet ve cezaların uygulanma yetkisi",
    maddeler: [
      {
        baslik: "Kısas",
        metin:
          "Kısas, cana veya organa karşı işlenen suçta denk karşılıktır. Ancak af, sulh veya diyetle sona erebilir; ölçüyü aşmak yasaktır.",
        delil: "Bakara 2:178-179; Mâide 5:45",
      },
      {
        baslik: "Diyet",
        metin:
          "Diyet, haksız öldürme veya yaralamada ödenen tazminattır. Hata ile öldürmede diyet ve kefâret gerekir; kasıtta hak sahibinin affı belirleyicidir.",
        delil: "Nisâ 4:92",
      },
      {
        baslik: "Hadler: hırsızlık, zina, kazf",
        metin:
          "Hırsızlık (Mâide 5:38), zina (Nûr 24:2) ve iffetli kişiye zina isnadı (kazf, Nûr 24:4) için Kur'an'da belirlenmiş cezalar vardır. Bu cezalar keyfî değil, şartları ağır hukukî süreçlere bağlıdır.",
        delil: "Mâide 5:38; Nûr 24:2, 24:4",
      },
      {
        baslik: "Sarhoşluk ve içki",
        metin:
          "İçki ve sarhoşluk veren maddeler haramdır; ticareti de haram kazanca girer. Cezası, kamu düzenini korumak için devlet tarafından uygulanır.",
        delil: "Mâide 5:90-91",
      },
      {
        baslik: "Cezaları uygulama yetkisi",
        metin:
          "Had ve kısas cezaları İslâm devletinin yetkili organlarınca uygulanır; bireyler kendi cezalarını veremez. Suç isnadında delil, şahitlik ve şüpheden yararlanma esastır.",
        delil: "Tirmizî, Hudûd; Buhârî, Hudûd",
      },
      {
        baslik: "Tövbe ve kul hakkı",
        metin:
          "Allah hakkına ait günahlarda samimi tövbe bağışlanma yoludur. Kul hakkı ise helalleşmeden veya tazmin edilmeden düşmez; ibadetler bunun yerini tutmaz.",
        delil: "Nisâ 4:110; Buhârî, Mezâlim",
      },
    ],
    sorular: [
      {
        soru: "Kısas hangi hâlde düşer veya hafifler?",
        secenekler: ["Af veya diyetle", "Zamanla", "Şahit yoksa", "Fail itiraf ederse"],
        cevap: 0,
        aciklama: "Kısas; af, sulh veya diyetle sona erebilir.",
        kaynak: "Bakara 2:178; Mâide 5:45",
      },
      {
        soru: "Had cezalarını kim uygular?",
        secenekler: ["Mağdur", "Aile", "Yetkili devlet organı", "Cemaat"],
        cevap: 2,
        aciklama: "Hadler ve kısas, devletin yetkili organlarınca uygulanır; bireysel infaz yoktur.",
        kaynak: "Tirmizî, Hudûd; Diyanet İlmihali",
      },
      {
        soru: "Kul hakkı nasıl düşer?",
        secenekler: ["Tövbe ile", "Helalleşme veya tazminle", "Oruçla", "Hac ile"],
        cevap: 1,
        aciklama: "Kul hakkı, hak sahibiyle helalleşmeden veya tazmin edilmeden düşmez.",
        kaynak: "Buhârî, Mezâlim",
      },
    ],
  },

  // ───────────────────── 7 ─────────────────────
  {
    id: "sadaka",
    ad: "Sadaka ve İnfak",
    emoji: "🤲",
    alt: "Farz, vacip ve nafile sadaka; sadaka-i cariye ve infakın edebi",
    maddeler: [
      {
        baslik: "Sadaka ve infak nedir?",
        metin:
          "Sadaka, karşılık beklemeden vermektir; infak ise malı Allah yolunda harcamaktır. Kur'an, infakı takvâ sahiplerinin özelliği olarak sayar ve verilenin kat kat karşılık bulacağını bildirir.",
        delil: "Bakara 2:3, 2:261",
      },
      {
        baslik: "Sadakanın çeşitleri",
        metin:
          "Zekât farz, fitre vacip, nafile sadaka ise gönüllüdür. Nafile sadaka zekâtın yerini tutmaz; ancak zekâtla birlikte toplumsal dengeyi güçlendirir.",
        delil: "Bakara 2:110; Buhârî, Zekât",
      },
      {
        baslik: "Sadaka-i cariye",
        metin:
          "Ölümden sonra da sevabı süren sadakaya sadaka-i cariye denir: ilim, su, vakıf, cami gibi kalıcı hayırlar. Bu yüzden kalıcı eser bırakmak teşvik edilmiştir.",
        delil: "Müslim, Vasiyet — \"İnsan ölünce ameli kesilir; üçü hariç...\"",
      },
      {
        baslik: "Gizli ve açık sadaka",
        metin:
          "Sadakanın gizli verilmesi, riyadan korunma açısından daha faziletlidir. Açıktan verip başkalarını teşvik etmek de caizdir; ölçü, gösterişten uzak kalmaktır.",
        delil: "Bakara 2:271",
      },
      {
        baslik: "Kimlere ve nasıl verilir?",
        metin:
          "Sadaka ihtiyaç sahibine verilir; akraba ve komşu önceliklidir. Helâl kazançtan, sağ el ile ve az da olsa sürekli vermek esastır; verilen azımsanmaz.",
        delil: "Bakara 2:177; Buhârî, Zekât",
      },
      {
        baslik: "Sadakanın edebi",
        metin:
          "Sadaka verirken başa kakmak ve gönül kırmak, sevabı götürür. İhtiyaç sahibinin onurunu korumak, gizliliğe riayet etmek ve niyeti Allah için tutmak gerekir.",
        delil: "Bakara 2:264; Müslim, Zühd",
      },
    ],
    sorular: [
      {
        soru: "Sadaka-i cariye nedir?",
        secenekler: [
          "Ölümden sonra sevabı süren hayır",
          "Yalnız ramazanda verilen sadaka",
          "Farz olan zekât",
          "Bayram hediyesi",
        ],
        cevap: 0,
        aciklama: "İlim, su, vakıf gibi kalıcı hayırlar sadaka-i cariyedir.",
        kaynak: "Müslim, Vasiyet",
      },
      {
        soru: "Sadakanın gizli verilmesi neden daha faziletlidir?",
        secenekler: ["Riyadan korur", "Daha çok para getirir", "Farz olur", "Zekât yerine geçer"],
        cevap: 0,
        aciklama: "Gizli sadaka gösterişten korur; niyeti berraklaştırır.",
        kaynak: "Bakara 2:271",
      },
      {
        soru: "Fitre hangi hükümdedir?",
        secenekler: ["Farz", "Vacip", "Sünnet", "Müstehap"],
        cevap: 1,
        aciklama: "Fitre, Hanefî'ye göre vacip bir sadakadır.",
        kaynak: "Buhârî, Zekât; Diyanet İlmihali",
      },
    ],
  },
];

export const ILMIHAL_EK3_TOPLAM = {
  ders: ILMIHAL_EK3_DERSLERI.length,
  madde: ILMIHAL_EK3_DERSLERI.reduce((t, d) => t + d.maddeler.length, 0),
  soru: ILMIHAL_EK3_DERSLERI.reduce((t, d) => t + d.sorular.length, 0),
};
