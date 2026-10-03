// ════════════════════════════════════════════════════════
// SORUDATA.TS — Keşfet > Soru-Cevap (madde 20) — genel arşiv + İslam'ın 5 şartı mezhepli fıkhî sorular
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 20: SORU-CEVAP ARŞİVİ (Diyanet yönlendirmeli) ──────────
export interface SoruCevap { soru: string; cevap: string; kaynak: string }
export const SORU_CEVAP_ARŞIVI: SoruCevap[] = [
  { soru: "Oruç kimlere farzdır?", cevap: "Akıl sağlığı yerinde, buluğ çağına ermiş ve mukim (yolcu olmayan) her Müslümana Ramazan orucu farzdır. Hasta ve yolcuya izin vardır; iyileşince kaza eder.", kaynak: "Diyanet İlmihal — Oruç bölümü" },
  { soru: "Zekât kimlere verilmez?", cevap: "Ana, baba, dede, nine, oğul, oğlun çocuğu, kız, kızın çocuğu, eşe zekât verilmez. Zenginlere de verilmez. Kardeş, amca, dayı gibi akrabaya verilebilir.", kaynak: "Diyanet İlmihal — Zekât bölümü" },
  { soru: "Kurbanın ortaklık şartları var mı?", cevap: "Küçükbaş hayvan (koyun-keçi) tek kişiye, büyükbaş (sığır, deve) yedi kişiye kadar ortak olabilir; her hisse 1/7'den az olmamalı ve hisse sahibi kurban niyetiyle almalıdır.", kaynak: "Diyanet İlmihal — Kurban bölümü" },
  { soru: "Namaz kaza edilebilir mi?", cevap: "Geç kılınan (özürsüz terk edilen) namazlar mümkün olduğunca çabuk kaza edilir. Kaç rekat ise o kadar kaza edilir; cem-i takdim/cem-i te'hir yalnızca yolculuk ve yağmur gibi özürlerde mümkündür.", kaynak: "Diyanet İlmihal — Namaz bölümü" },
  { soru: "Cuma namazı kimlere farzdır?", cevap: "Serbest erkek, mukim, akıllı ve buluğ çağına ermiş Müslüman'a farzdır. Yolcu, hasta, kadın, çocuk ve köle için farz değildir (öğle namazı kılarlar).", kaynak: "Diyanet İlmihal — Cuma namazı" },
  { soru: "Teyemmüm ne zaman yapılır?", cevap: "Su bulunmayınca veya su kullanma imkânı olmayınca (hastalık, soğuk, su azlığı) temiz toprak/benzeri nesneyle teyemmüm yapılır ve namaz kılınır.", kaynak: "Diyanet İlmihal — Teyemmüm" },
  { soru: "Sırertaşı vermek caiz midir?", cevap: "Mü'min kardeşinin ayıbını arkasından söylemek gıybet ve haramdır. Ama zulme uğrayanın hakkını aramak, dinî hüküm verme (fetva) talebi gibi durumlarda caizdir.", kaynak: "Diyanet Fetva Kurulu — gıybet ilgili fetvalar" },
];

// ── 20b: İSLAM'IN 5 ŞARTI — MEZHEPLERE GÖRE FIKHİ SORU-CEVAP (28.09, kullanıcı kararı)
// "5 şart ile ilgili fıkhi sorular cevaplar kaynaklarıyla birlikte mezheplere göre ayrılsın
//  herşey dahil" — Hanefî/Şâfiî/Mâlikî/Hanbelî karşılaştırmalı, kaynak gösterimli.
export type MezhepAd = "Hanefî" | "Şâfiî" | "Mâlikî" | "Hanbelî";
export interface BesSartSoru {
  sart: "Şehadet" | "Namaz" | "Zekât" | "Oruç" | "Hac";
  soru: string;
  cevaplar: Array<{ mezhep: MezhepAd; metin: string }>;
  kaynak: string;
}
export const BES_SART_SORULARI: BesSartSoru[] = [
  {
    sart: "Şehadet",
    soru: "İslam'ın 5 şartı nedir ve hangi kaynaklara dayanır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "1) Kelime-i şehadet etmek, 2) Beş vakit namaz kılmak, 3) Zekât vermek, 4) Ramazan orucu tutmak, 5) Gücü yetenler için Kâbe'yi haccetmek. Bu bölüm Hadis-i Cibrîl'e dayanır." },
      { mezhep: "Şâfiî", metin: "Aynı beş şart — Hadis-i Cibrîl'in zahiridir; ibadetler dinin direkleri olarak dört mezhepte de ortaktır." },
      { mezhep: "Mâlikî", metin: "Aynı beş şart; Muvatta'da benzer rivayetler vardır. Hadiste 'İslam'ın binası beş şey üzerine kurulmuştur' denir." },
      { mezhep: "Hanbelî", metin: "Aynı beş şart — aynı Hadis-i Cibrîl kaynaklı; İbn Teymiye el-Îmân kitabında bunları detaylandırır." },
    ],
    kaynak: "Buhârî, Îmân, 37 · Müslim, Îmân, 8 (Hadis-i Cibrîl) · Diyanet İlmihal",
  },
  {
    sart: "Şehadet",
    soru: "Şehadet getirmenin şartları nelerdir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yedi şart: ilim (anlamını bilmek), yakîn (kalpten tasdik), ikrar (dille söylemek), sıdk (doğruluk), ihlâs, inâbet (samimi yöneliş) ve kabul. Sadece dille söylemek yetmez." },
      { mezhep: "Şâfiî", metin: "Sekiz şart sayılır: ilim, yakîn, ihlâs, sıdk, kabul, inâbet, muhabbet (sevgi) ve dil ile ikrar." },
      { mezhep: "Mâlikî", metin: "Yedi şart; ayrıca açık ikrar gereklidir. Kalpten tasdik etmeden yalnız dille söyleyen dünyada Müslüman muamelesi görür, içini Allah bilir." },
      { mezhep: "Hanbelî", metin: "Dokuz şart: ilim, yakîn, kabul, inkıyâd (itaat), sıdk, ihlâs, muhabbet, inâbet ve ikrar — en geniş liste Hanbelî'de." },
    ],
    kaynak: "Diyanet İlmihal — İman bölümü · İbn Kudâme, el-Muğnî · Nevevî, Kitâbü'l-Ezkâr",
  },
  {
    sart: "Namaz",
    soru: "Namazın farzları (rüknleri) mezheplere göre kaçtır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Namazın 12 şartı ve 12 farzı sayılır; asıl rüknler: tekbir-i tehrime, kıyam, kıraat, rükû, iki secde ve kade-i ahire. Hanefî'de Fâtiha farz-ı ayndır (cemaatte imam okur)." },
      { mezhep: "Şâfiî", metin: "17 rükn sayılır: niyet, tekbir, kıyam, Fâtiha (her rekatte farz), rükû, sücûd, istirahat, oturuş, tehiyyât, selam, sıra, kasd... Fâtiha terk edilirse namaz geçersizdir." },
      { mezhep: "Mâlikî", metin: "14 rükn sayılır; Fâtiha farz DEĞİL sünnet-i müekked kabul edilir — her rekatte başka bir sure okunabilir." },
      { mezhep: "Hanbelî", metin: "16 rükn sayılır; Fâtiha farzdır (Şâfiî gibi). Niyet, tekbir, kıyam, rükû, secde, oturuşlar ve selam asıl rüknlerdir." },
    ],
    kaynak: "Diyanet İlmihal — Namaz · İbn Âbidîn, Reddü'l-Muhtâr (Hanefî) · Nevevî, el-Mecmû' (Şâfiî) · İbn Kudâme, el-Muğnî (Hanbelî)",
  },
  {
    sart: "Namaz",
    soru: "Fâtiha okunmadan namaz geçerli olur mu?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Fâtiha farz-ı ayndır; terkinde namaz mekruh-ı tahrimen olur ve yeniden kılınması gerekir. Ancak cemaatle imam sesli kıraat ederken arkadakiler için dinlemek yeterli kabul edilir." },
      { mezhep: "Şâfiî", metin: "Fâtiha rükndür — terk edilirse namaz geçerli OLMAZ." },
      { mezhep: "Mâlikî", metin: "Fâtiha farz değildir; bir sure okumak yeterlidir — Fâtiha sünnet-i müekkededir." },
      { mezhep: "Hanbelî", metin: "Fâtiha farzdır (her rekatte) — terk edilirse namaz geçersiz." },
    ],
    kaynak: "Diyanet İlmihal · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî · İbn Âbidîn, Reddü'l-Muhtâr",
  },
  {
    sart: "Namaz",
    soru: "'Âmîn' sesli mi sessiz mi denir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Sessizce (içinden) denir; imam'ın Fâtiha'sı bitince cemaat içinden 'âmin' der." },
      { mezhep: "Şâfiî", metin: "Sesli (cehrî) denir — Fâtiha bitince imam ve cemaat yüksek sesle 'âmin' der." },
      { mezhep: "Mâlikî", metin: "Sessizce denir; sabah namazında sesli rivayetler de nakledilmiştir." },
      { mezhep: "Hanbelî", metin: "Sesli denir — özellikle cehrî kıraatlerde; Şâfiî'ye benzer." },
    ],
    kaynak: "Buhârî, Edeb; Müslim, Salât — 'âmîn' bahsi · Diyanet İlmihal",
  },
  {
    sart: "Namaz",
    soru: "Yolcu namazı kısaltır mı, birleştirir mi?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yalnız KASR (kısaltma) vardır: öğle-ikindi 4→2, yatsı 4→2. Cem' (öğle+ikindi, akşam+yatsı birleştirme) YOK; yalnız Arefe ve Müzdelife'de hac esnasında geçerlidir." },
      { mezhep: "Şâfiî", metin: "Hem kasr hem cem' mümkündür: yolcu dilerse kısaltır, dilerse iki namazı bir vakte birleştirir." },
      { mezhep: "Mâlikî", metin: "Kasr + cem' ikisi de mümkün; cem', yağmur/hastalık/hac kalabalığı gibi özürlerde mukimler için de geçerli sayılır." },
      { mezhep: "Hanbelî", metin: "Kasr + cem' ikisi de mümkündür; Hanbelî'de cem' için özür şartı aranmaz." },
    ],
    kaynak: "Diyanet İlmihal — Yolcu namazı · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Namaz",
    soru: "Abdestin farzları mezheplere göre nasıl sayılır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "4 farz: yüzü yıkamak, kolları dirseklerle yıkamak, başın dörtte birini mesh, ayakları topuklarıyla yıkamak. Diğerleri sünnettir." },
      { mezhep: "Şâfiî", metin: "6 farz: niyet, yüz, kollar, baş, ayaklar ve sıra (tertib). Niyet ve sıra Şâfiî'de farzdır." },
      { mezhep: "Mâlikî", metin: "7 farz: niyet, yüz, kollar, baş, ayaklar, sıra ve muvâlât (araları uzatmadan yıkama)." },
      { mezhep: "Hanbelî", metin: "7 farz: niyet, yüz, kollar, başın TAMAMI (mesh), ayaklar, sıra, muvâlât." },
    ],
    kaynak: "Diyanet İlmihal — Tâhâret · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, Minhâcü't-Tâlibîn · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Zekât",
    soru: "Zekâtın vacip olma şartları ve nisab miktarı nedir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Nisab: 96 gr altın veya 609 gr gümüş veya değeri kadar mal. Bir yıl (havlan-ı hâvâl) elinde kalanın 1/40'ı (2,5%) verilir. Akıl ve buluğ şartı — çocuğun malına zekât vacip DEĞİL." },
      { mezhep: "Şâfiî", metin: "Nisab aynı; ancak çocuk ve akıl hastasının malına da zekât vacip kabul edilir (velisi verir)." },
      { mezhep: "Mâlikî", metin: "Nisab aynı; bir yıl geçmesi şarttır. Tarım ürünlerinde farklı nisab ve oran (1/10 veya 1/20) uygulanır — bu 'uşur'dur." },
      { mezhep: "Hanbelî", metin: "Nisab aynı; havlan-ı hâvâl şarttır. Çocuk malında vacip kabulü (Şâfiî gibi) mekruh görülür; en sahih rivayet vacip olduğudur." },
    ],
    kaynak: "Diyanet İlmihal — Zekât · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, Ravzatu't-Tâlibîn · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Zekât",
    soru: "Zekât kime verilmez?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Ana-baba, dede-nine, oğul ve onun çocukları, kız ve onun çocukları ve eşe verilmez. Kardeş, amca, dayı, enişte, gelin gibi akrabaya verilebilir." },
      { mezhep: "Şâfiî", metin: "Hanefî ile aynı: usul (üst soylar), fürû' (alt soylar) ve eşe verilmez; diğer akrabaya vermek mümkündür." },
      { mezhep: "Mâlikî", metin: "Benzer; bakımını üstlendiği yakınlarına verilmez, diğer akrabaya verilebilir — yakınlara önceliklidir." },
      { mezhep: "Hanbelî", metin: "Benzer kural; zenginlere verilmez, zekât yalnız sekiz sınıfa (Tevbe 60) verilir." },
    ],
    kaynak: "Diyanet İlmihal — Zekât verilecek yerler · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, Minhâcü't-Tâlibîn",
  },
  {
    sart: "Zekât",
    soru: "Fitre (sadaka-i fıtriyye) ne zaman verilir, kimlere verilmez?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Ramazan bayramının sabahı, bayram namazından önce verilirse 'sadaka-i fıtriyye'; sonraysa sadaka olur. Ana-baba, çocuk ve eşe verilmez; akrabaya verilebilir." },
      { mezhep: "Şâfiî", metin: "Benzer; bayram namazından önce verilmesi müstehab, sonrasında da geçerlidir." },
      { mezhep: "Mâlikî", metin: "Bayram sabahından önce verilir; sonraya bırakmak mekruh sayılır." },
      { mezhep: "Hanbelî", metin: "Bayram namazından önce verilmesi vacip; sonrasında kaza edilir." },
    ],
    kaynak: "Diyanet İlmihal — Fitre · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû'",
  },
  {
    sart: "Oruç",
    soru: "Oruç kimlere farzdır; hasta ve yolcu ne yapar?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Akıl sağlığı yerinde, buluğ çağına ermiş ve mukim her Müslümana farzdır. Hasta ve yolcu tutmayabilir, sonra kaza eder. İyileşmesi umulmayan hasta ve yaşlılar fidye verir." },
      { mezhep: "Şâfiî", metin: "Benzer; yolcuya tutmayıp kaza etmek tavsiye edilir. Fidye yalnızca yaşlılık ve iyileşmesi umulmayan hastalıkta geçerlidir." },
      { mezhep: "Mâlikî", metin: "Benzer; hamile ve süt annesi için fidye + kaza şekli vardır (kaza şart, fidye de tavsiye edilir)." },
      { mezhep: "Hanbelî", metin: "Benzer; fidye yalnız yaşlılık ve iyileşmesi umulmayan hastalığa geçerlidir; sağlıklı gençlere geçmez." },
    ],
    kaynak: "Diyanet İlmihal — Oruç · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Oruç",
    soru: "İmsak ve iftar vakitleri nasıl belirlenir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "İmsak: fecr-i sâdık (yeni şafak). İftar: güneş tamamen batınca. Türkiye'de Diyanet imsakiyesi ihtiyat süresiyle birlikte hesaplar." },
      { mezhep: "Şâfiî", metin: "Benzer: fecr-i sâdık ile imsak, güneş batımı ile iftar. Ufuk derecesi hesabında (18° vs 15°) mezhepler arasında uygulama farkı olabilir; yerel müftülük takvimi esas alınır." },
      { mezhep: "Mâlikî", metin: "Benzer; iftar güneş batımıyla, imsak fecr-i sâdıkla. Batı ufukta beyazlık kaybolduğunda iftar rivayeti de nakledilmiştir." },
      { mezhep: "Hanbelî", metin: "Benzer; imsak 18° fecr-i sâdık, iftar güneş batımı. Vakit tartışmalarında müftüye sorulması tavsiye edilir." },
    ],
    kaynak: "Diyanet İşleri Takvimi (imsakiye) · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû'",
  },
  {
    sart: "Hac",
    soru: "Hac kimlere farzdır, ömürde kaç kez?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Akıl sağlığı yerinde, buluğ çağına ermiş, hür ve istitâat (yol + masraf gücü) sahibi her Müslümana ömürde BİR KEZ farzdır; fazlası nafile." },
      { mezhep: "Şâfiî", metin: "Benzer; istitâat şartı aynı. Kadın için güvenli yol (mahrem veya güvenli grup) şarttır." },
      { mezhep: "Mâlikî", metin: "Benzer; kadın için mahrem şartı daha vurgulu kabul edilir." },
      { mezhep: "Hanbelî", metin: "Benzer; istitâat beden, mal ve güvenlik üçlüsü olarak tanımlanır." },
    ],
    kaynak: "Diyanet İlmihal — Hac · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Hac",
    soru: "İhram yasakları nelerdir, ihlâlinde ceza nasıl olur?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yasaklar: parfüm/koku, saç-tırnak kesme, avlanma, bitki koparma, nikâh, cinsel temas ve tartışma. İhlâlde ceza (cim') — kurban veya sadaka gerekir." },
      { mezhep: "Şâfiî", metin: "Benzer yasaklar; ceza türü 'dem' (kurban) öncelikli — Hanefî'de sadaka daha sık." },
      { mezhep: "Mâlikî", metin: "Benzer yasaklar; ihlâl şekline göre ceza değişir (kurban, sadaka, oruç)." },
      { mezhep: "Hanbelî", metin: "Benzer yasaklar; ihlâle göre dem, sadaka veya oruç cezası gerekir." },
    ],
    kaynak: "Diyanet İlmihal — İhram yasakları · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Hac",
    soru: "Kurban kesmek hangi mezhepte vacip, hangisinde sünnet?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Vacip: nisab sahibi zengin Müslümana bayram sabahı kurban kesmek vaciptir. Zilhicce 10-12. günlerinde kesilir." },
      { mezhep: "Şâfiî", metin: "Sünnet-i müekkede — vacip değil; kesilmesi güçlü şekilde tavsiye edilir." },
      { mezhep: "Mâlikî", metin: "Sünnet-i müekkede; kesim 10-12. günler." },
      { mezhep: "Hanbelî", metin: "Vacip kabul edilir (Hanefî gibi); kesim 10-12. günler." },
    ],
    kaynak: "Diyanet İlmihal — Kurban · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Namaz",
    soru: "Namazda eller nasıl bağlanır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Erkek göbeğinin altında, sağ el sol elin üstünde; kadın göğsü üzerinde bağlar." },
      { mezhep: "Şâfiî", metin: "Göğüs üstünde — sağ el sol bileğin üstünde sarılır." },
      { mezhep: "Mâlikî", metin: "Sırtın yanlarında serbest bırakılır (sadl) — el ele bağlanmaz." },
      { mezhep: "Hanbelî", metin: "Göğüs üstünde; bir rivayette göbek altı da nakledilmiştir." },
    ],
    kaynak: "Diyanet İlmihal — Namaz · İbn Âbidîn, Reddü'l-Muhtâr · Muvatta · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Namaz",
    soru: "Vitir namazının hükmü nedir, kaç rekattır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Vâciptir — sürekli terk eden günâha girer. 3 rekat tek selamla kılınır; kunut son rekatta okunur." },
      { mezhep: "Şâfiî", metin: "Sünnet-i müekked; 1-11 rekat arası seçilebilir, kunut ikinci rekatta kıraat sonrası gelir." },
      { mezhep: "Mâlikî", metin: "Sünnet; 3 rekat tek selamla, kunut ikinci rekatta rükûdan sonra okunur." },
      { mezhep: "Hanbelî", metin: "Sünnet-i müekked; 3'ten 13 rekata kadar sayılar caiz, kunutun yeri esnektir." },
    ],
    kaynak: "Diyanet İlmihal — Vitir · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Namaz",
    soru: "Cemaatle namazın hükmü nedir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Erkek mükelleflere vâciptir — mazeretsiz terk eden azarlanır; kadınlara nafiledir." },
      { mezhep: "Şâfiî", metin: "Erkek ve kadına sünnet-i müekkededir; terki hoş görülmez." },
      { mezhep: "Mâlikî", metin: "Azimet derecesinde (vâcip-e yakın) — mazeretsiz terk eden cezalandırılabilir." },
      { mezhep: "Hanbelî", metin: "Erkeklere vâciptir; terk eden azarlanır." },
    ],
    kaynak: "Diyanet İlmihal — Cemaat · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Namaz",
    soru: "Namazda (başkaları duyacak şekilde) gülmek neyi bozar?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Hem namazı hem abdesti bozar — yeniden abdest alınıp namaz tekrarlanır." },
      { mezhep: "Şâfiî", metin: "Namazı bozar, abdesti bozmaz." },
      { mezhep: "Mâlikî", metin: "Namazı bozar, abdesti bozmaz." },
      { mezhep: "Hanbelî", metin: "Namazı bozar, abdesti bozmaz." },
    ],
    kaynak: "Diyanet İlmihal — Sehv secdeleri · İbn Âbidîn, Reddü'l-Muhtâr",
  },
  {
    sart: "Namaz",
    soru: "Vücuttan akan kan abdesti bozar mı?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Yerinden akıp etrafa yayılan kan abdesti bozar (çoğunluk rivayeti)." },
      { mezhep: "Şâfiî", metin: "Bozmaz — azı çoğu fark etmez, kan abdeste etki etmez." },
      { mezhep: "Mâlikî", metin: "Bozmaz." },
      { mezhep: "Hanbelî", metin: "Bozmaz — çıkan kan miktarıyla ilgili olmadan abdesti etkilemez." },
    ],
    kaynak: "Diyanet İlmihal — Tâhâret · İbn Âbidîn, Reddü'l-Muhtâr · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Zekât",
    soru: "Altın ve gümüş zekât nisabı birlikte mi hesaplanır?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Ayırı ayrı nisaptır: ticari mal değeri gümüş nisabıyla hesaplanır; kullanılan takılar zekâtsızdır." },
      { mezhep: "Şâfiî", metin: "Birleşik nisap: altın+gümüş toplam değeri nisaba ulaşırsa zekât düşer." },
      { mezhep: "Mâlikî", metin: "Birlikte hesap edilir; takıların kullanılıp kullanılmaması bakılmaksızın zekât vaciptir." },
      { mezhep: "Hanbelî", metin: "Birlikte hesap edilir; kadın takılarına da zekât vacip kabul edilir." },
    ],
    kaynak: "Diyanet İlmihal — Zekât nisabı · İbn Âbidîn, Reddü'l-Muhtâr · İbn Kudâme, el-Muğnî",
  },
  {
    sart: "Hac",
    soru: "Haccın rüknleri mezheplere göre hangileridir?",
    cevaplar: [
      { mezhep: "Hanefî", metin: "Rüknler: ihram, Arafat vakfesi ve tavaf-ı ziyaret. Sa'y ve diğer menasik vaciptir — terklerinde dem gerekir, hac bozulmaz." },
      { mezhep: "Şâfiî", metin: "Rüknler: ihram, tavaf, sa'y ve vakfe — rüknden biri terk edilirse hac geçersizdir." },
      { mezhep: "Mâlikî", metin: "Rüknler: ihram, tavaf, sa'y, vakfe (Şâfiî gibi)." },
      { mezhep: "Hanbelî", metin: "Rüknler: ihram, tavaf, sa'y, vakfe; terk edilemez, telâfisi yoktur." },
    ],
    kaynak: "Diyanet İlmihal — Hac · İbn Âbidîn, Reddü'l-Muhtâr · Nevevî, el-Mecmû' · İbn Kudâme, el-Muğnî",
  },
];
