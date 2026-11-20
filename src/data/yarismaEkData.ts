// ════════════════════════════════════════════════════════
// YARISMAEKDATA.TS — Bilgi Yarışması ek soruları (24 soru)
// Her seviyeye 8 soru: başlangıç (b13-b20), orta (o13-o20), ileri (i13-i20).
// Kaynaklar: Kur'an (sure:ayet), hadis kitapları (kitap/bölüm), siyer-tarih.
// ════════════════════════════════════════════════════════

import type { YarismaSoru } from "./yarismaData";

export const YARISMA_EK_SORULARI: YarismaSoru[] = [
  // ───────────── BAŞLANGIÇ ─────────────
  {
    id: "b13", seviye: "baslangic", kategori: "ilmihal",
    soru: "Abdestte başın mesh edilmesi Hanefî mezhebine göre hangi hükümdür?",
    secenekler: ["Sünnet", "Farz", "Vâcip", "Mekruh"], cevap: 1,
    aciklama: "Mâide 5:6'da abdestin dört farzı sayılır; başın dörtte birini mesh etmek bunlardan biridir.",
    kaynak: "Mâide 5:6",
  },
  {
    id: "b14", seviye: "baslangic", kategori: "ilmihal",
    soru: "Hanefî mezhebine göre namazda Fâtiha okumak hangi hükümdür?",
    secenekler: ["Sünnet", "Vâcip", "Farz", "Müstehap"], cevap: 1,
    aciklama: "Fâtiha okumak Hanefî'de vâciptir; terk edilirse sehiv secdesi gerekir.",
    kaynak: "Buhârî, Ezân",
  },
  {
    id: "b15", seviye: "baslangic", kategori: "ilmihal",
    soru: "Aşağıdaki namazlardan hangisi Hanefî'ye göre vâciptir?",
    secenekler: ["Teravih", "Vitir", "Duha", "Tahiyyetü'l-mescid"], cevap: 1,
    aciklama: "Vitir üç rekâtlık vâcip bir namazdır; teravih sünnet, duha ve tahiyye nâfiledir.",
    kaynak: "Buhârî, Vitir",
  },
  {
    id: "b16", seviye: "baslangic", kategori: "kuran",
    soru: "Kur'an-ı Kerîm kaç cüzden oluşur?",
    secenekler: ["20", "30", "40", "60"], cevap: 1,
    aciklama: "Mushaf, okumayı kolaylaştırmak için 30 cüze ayrılmıştır; her cüz yirmi sayfadır.",
    kaynak: "Mushaf tertibi",
  },
  {
    id: "b17", seviye: "baslangic", kategori: "tarih",
    soru: "İslâm tarihinin ilk halifesi kimdir?",
    secenekler: ["Hz. Ömer", "Hz. Ebû Bekir", "Hz. Osman", "Hz. Ali"], cevap: 1,
    aciklama: "Hz. Peygamber'in vefatından sonra Hz. Ebû Bekir halife seçildi; hilafeti 632-634 yıllarını kapsar.",
    kaynak: "Buhârî, Fedâilü's-sahâbe; Taberî, Târîh, III",
  },
  {
    id: "b18", seviye: "baslangic", kategori: "ilmihal",
    soru: "Cemaatle kılınan namaz tek başına kılınandan kaç derece üstündür?",
    secenekler: ["7", "17", "27", "37"], cevap: 2,
    aciklama: "Hadis, cemaat namazının yirmi yedi derece üstün olduğunu bildirir.",
    kaynak: "Buhârî, Ezân; Müslim, Mesâcid",
  },
  {
    id: "b19", seviye: "baslangic", kategori: "ilmihal",
    soru: "Zekâtın verileceği sınıflar hangi âyette sayılır?",
    secenekler: ["Bakara 2:183", "Tevbe 9:60", "Nisâ 4:36", "Mâide 5:6"], cevap: 1,
    aciklama: "Tevbe 9:60, zekâtın sekiz sınıfa verileceğini bildirir: fakir, miskin, zekât memuru, kalbi kazanılacaklar, köleler, borçlular, Allah yolundakiler ve yolcular.",
    kaynak: "Tevbe 9:60",
  },
  {
    id: "b20", seviye: "baslangic", kategori: "tarih",
    soru: "Hicrî takvim hangi olayla başlar?",
    secenekler: ["İlk vahiy", "Hicret", "Bedir", "Mekke'nin fethi"], cevap: 1,
    aciklama: "Hicrî takvim, 622'de Mekke'den Medine'ye hicretin yılını başlangıç kabul eder.",
    kaynak: "İbn Hişâm, es-Sîre, II",
  },

  // ───────────── ORTA ─────────────
  {
    id: "o13", seviye: "orta", kategori: "siyer",
    soru: "Hz. Osman'ın \"Zinnûreyn\" lakabı ne anlama gelir?",
    secenekler: ["İki nur sahibi", "İki kılıç sahibi", "İki dil bilen", "İki kez hac yapan"], cevap: 0,
    aciklama: "Hz. Osman, Hz. Peygamber'in iki kızıyla evlendiği için \"iki nur sahibi\" anlamında Zinnûreyn diye anılır.",
    kaynak: "Buhârî, Fedâilü's-sahâbe",
  },
  {
    id: "o14", seviye: "orta", kategori: "siyer",
    soru: "Mûte Seferi'nde şehit olan üç komutan hangi sırayla görevlendirilmiştir?",
    secenekler: [
      "Zeyd b. Hârise, Cafer b. Ebû Tâlib, Abdullah b. Revâha",
      "Hâlid b. Velîd, Zeyd b. Hârise, Cafer",
      "Cafer, Zeyd b. Hârise, Üsâme b. Zeyd",
      "Abdullah b. Revâha, Hâlid, Zeyd",
    ], cevap: 0,
    aciklama: "Hz. Peygamber sırasıyla Zeyd'i, Cafer'i ve Abdullah b. Revâha'yı komutan tayin etti; üçü de şehit oldu.",
    kaynak: "Buhârî, Megâzî; İbn Hişâm, es-Sîre, IV",
  },
  {
    id: "o15", seviye: "orta", kategori: "siyer",
    soru: "Hendek kazılmasını teklif eden sahabi kimdir?",
    secenekler: ["Hz. Bilâl", "Selmân-ı Fârisî", "Hz. Mus'ab", "Huzeyfe b. Yemân"], cevap: 1,
    aciklama: "İran kökenli sahabi Selmân-ı Fârisî'nin teklifiyle Medine'nin etrafına hendek kazıldı.",
    kaynak: "İbn Hişâm, es-Sîre, III; Buhârî, Megâzî",
  },
  {
    id: "o16", seviye: "orta", kategori: "kuran",
    soru: "Kıblenin Mescid-i Aksâ'dan Kâbe'ye çevrildiği âyet hangisidir?",
    secenekler: ["Bakara 2:144", "Âl-i İmrân 3:96", "İsrâ 17:1", "Fetih 48:27"], cevap: 0,
    aciklama: "Bakara 2:144, yüzünü Mescid-i Harâm'a çevirmeyi emreder; kıble değişikliği bu âyetle bildirilmiştir.",
    kaynak: "Bakara 2:144",
  },
  {
    id: "o17", seviye: "orta", kategori: "ilmihal",
    soru: "Teyemmüm hangi maddeyle yapılır?",
    secenekler: ["Temiz toprak (sâid)", "Su", "Kumlu deniz suyu", "Yağ"], cevap: 0,
    aciklama: "Teyemmüm, temiz toprak veya toprak cinsinden bir yüzeyle yapılır; su bulununca hükmü sona erer.",
    kaynak: "Mâide 5:6; Nisâ 4:43",
  },
  {
    id: "o18", seviye: "orta", kategori: "ilmihal",
    soru: "Sehiv secdesi hangi durumda gerekir?",
    secenekler: [
      "Farz terk edildiğinde",
      "Vâcip terk edildiğinde veya geciktirildiğinde",
      "Namaz bozulduğunda",
      "Sünnet terk edildiğinde",
    ], cevap: 1,
    aciklama: "Vâcip bir işin terk edilmesi veya geciktirilmesi sehiv secdesini gerektirir; farz terk edilirse namaz bozulur.",
    kaynak: "Buhârî, Sehv; Müslim, Mesâcid",
  },
  {
    id: "o19", seviye: "orta", kategori: "siyer",
    soru: "İslâm tarihinin ilk şehidi olarak bilinen hanım sahabi kimdir?",
    secenekler: ["Sümeyye (r.anhâ)", "Hz. Hatice", "Hz. Fâtıma", "Ümmü Seleme"], cevap: 0,
    aciklama: "Ammâr b. Yâsir'in annesi Sümeyye, Mekke'de işkence altında şehit edilen ilk Müslümandır.",
    kaynak: "İbn Sa'd, et-Tabakât, VIII",
  },
  {
    id: "o20", seviye: "orta", kategori: "siyer",
    soru: "Hudeybiye'de ağaç altında yapılan biatın adı nedir?",
    secenekler: ["Bey'atü'l-Akabe", "Bey'atü'r-rıdvân", "Bey'atü'l-cemel", "Bey'atü'l-hilf"], cevap: 1,
    aciklama: "Hudeybiye'de sahâbenin ağaç altında Hz. Peygamber'e biatı, Fetih 48:18'de anılan Bey'atü'r-rıdvân'dır.",
    kaynak: "Fetih 48:18; Buhârî, Megâzî",
  },

  // ───────────── İLERİ ─────────────
  {
    id: "i13", seviye: "ileri", kategori: "hadis",
    soru: "Hadis ilminde \"müttefekun aleyh\" ne demektir?",
    secenekler: [
      "Buhârî ve Müslim'in ittifakla naklettiği hadis",
      "Yalnız bir ravinin naklettiği hadis",
      "Zayıf kabul edilen hadis",
      "Senedi kesik hadis",
    ], cevap: 0,
    aciklama: "Müttefekun aleyh, Buhârî ve Müslim'in aynı hadisi rivayet etmesidir; hadis ilminde en güçlü kabul edilir.",
    kaynak: "Hadis usûlü (İbn Hacer, Nüzhetü'n-nazar)",
  },
  {
    id: "i14", seviye: "ileri", kategori: "akaid",
    soru: "Hanefî fıkıh usûlünde \"istihsân\" ne demektir?",
    secenekler: [
      "Kıyasın gerektirdiği hükmü bırakıp daha uygun bir çözüme gitmek",
      "Bütün kıyasları reddetmek",
      "Hadisi tamamen terk etmek",
      "İcmâyı geçersiz saymak",
    ], cevap: 0,
    aciklama: "İstihsân, kıyasın sonucunu bırakıp nas veya zaruret gibi daha güçlü bir delile dayanarak hüküm vermektir.",
    kaynak: "Fıkıh usûlü (Serahsî, Usûl)",
  },
  {
    id: "i15", seviye: "ileri", kategori: "tarih",
    soru: "Hz. Ömer döneminde kurulan divan teşkilatı neyi düzenler?",
    secenekler: [
      "Maaş ve atâ kayıtlarını",
      "Kur'an nüshalarını",
      "Namaz vakitlerini",
      "Hac kafilelerini",
    ], cevap: 0,
    aciklama: "Divan, devlet gelirlerinin ve sahâbeye bağlanan atânın kayıtlarını tutan teşkilattır; Hz. Ömer kurmuştur.",
    kaynak: "Taberî, Târîh, IV; Belâzürî, Fütûh",
  },
  {
    id: "i16", seviye: "ileri", kategori: "tarih",
    soru: "Talas Savaşı hangi yılda olmuştur?",
    secenekler: ["751", "711", "732", "800"], cevap: 0,
    aciklama: "751'deki Talas Savaşı, Abbâsîlerle Tang ordusu arasında olmuş; kâğıt üretiminin İslâm dünyasına yayılması bu döneme denk gelir.",
    kaynak: "İbnü'l-Esîr, el-Kâmil, V",
  },
  {
    id: "i17", seviye: "ileri", kategori: "tarih",
    soru: "Endülüs Emevî Devleti'nin merkezi hangi şehirdi?",
    secenekler: ["Kurtuba", "Bağdat", "Şam", "Kahire"], cevap: 0,
    aciklama: "Endülüs Emevîleri 756'da Kurtuba'yı başkent edindi; şehir ilim ve kütüphaneleriyle ünlendi.",
    kaynak: "İbn Haldûn, Mukaddime; İbn Abdülhakem, Fütûhu Mısr",
  },
  {
    id: "i18", seviye: "ileri", kategori: "hadis",
    soru: "İmam Mâlik'in hadis ve fıkıh alanındaki temel eseri hangisidir?",
    secenekler: ["el-Muvatta", "Sahîh", "Sünen", "el-Müsned"], cevap: 0,
    aciklama: "Mâlik b. Enes'in el-Muvatta'sı, Medine amelini esas alan erken dönem hadis-fıkıh eseridir.",
    kaynak: "İbn Hallikân, Vefeyâtü'l-a'yân",
  },
  {
    id: "i19", seviye: "ileri", kategori: "kuran",
    soru: "Kur'an'ın tek mushaf hâlinde toplanması hangi halife döneminde başladı?",
    secenekler: ["Hz. Ebû Bekir", "Hz. Ömer", "Hz. Osman", "Hz. Ali"], cevap: 0,
    aciklama: "Hz. Ebû Bekir döneminde Zeyd b. Sâbit başkanlığındaki heyet âyetleri topladı; çoğaltma işi Hz. Osman'da tamamlandı.",
    kaynak: "Buhârî, Fedâilü'l-Kur'ân",
  },
  {
    id: "i20", seviye: "ileri", kategori: "ilmihal",
    soru: "Secde âyeti okunduğunda yapılan secdenin adı ve hükmü nedir?",
    secenekler: [
      "Tilâvet secdesi — vâcip",
      "Sehiv secdesi — sünnet",
      "Şükür secdesi — farz",
      "Tahiyye secdesi — nâfile",
    ], cevap: 0,
    aciklama: "Secde âyeti okuyan veya işiten kişiye tilâvet secdesi vâciptir; Hanefî'de bir secdedir.",
    kaynak: "Diyanet İlmihali, Tilâvet Secdesi",
  },
];
