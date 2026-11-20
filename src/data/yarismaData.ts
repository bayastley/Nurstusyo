// ════════════════════════════════════════════════════════
// YARISMADATA.TS — İslami Bilgi Yarışması (yol haritası madde 13)
//
// 3 seviye · 36 soru (12 + 12 + 12). Her sorunun açıklaması ve kaynağı var.
// Kaynaklar: Kur'an (sure:ayet), temel hadis kitapları (kitap/bölüm),
// siyer/tarih kaynakları (İbn Hişâm, Taberî, İbnü'l-Esîr, Buhârî).
// Uydurma/zayıf rivayet kullanılmaz; ihtilaflı sayılar "yaklaşık" verilir.
// Metinler TR asıl; en/ar/id/ur çeviri katmanıyla üretilir.
// ════════════════════════════════════════════════════════

import { YARISMA_EK_SORULARI } from "./yarismaEkData";

export type YarismaSeviye = "baslangic" | "orta" | "ileri";

export interface YarismaSoru {
  id: string;
  seviye: YarismaSeviye;
  kategori: "kuran" | "siyer" | "ilmihal" | "hadis" | "tarih" | "akaid";
  soru: string;
  secenekler: string[];
  cevap: number;
  aciklama: string;
  kaynak: string;
}

export const YARISMA_SORULARI: YarismaSoru[] = [
  // ───────────── BAŞLANGIÇ ─────────────
  {
    id: "b1", seviye: "baslangic", kategori: "kuran",
    soru: "Kur'an-ı Kerîm kaç sûreden oluşur?",
    secenekler: ["100", "114", "120", "99"], cevap: 1,
    aciklama: "Mushaf tertibinde 114 sûre vardır; ilki Fâtiha, sonuncusu Nâs sûresidir.",
    kaynak: "Mushaf tertibi",
  },
  {
    id: "b2", seviye: "baslangic", kategori: "kuran",
    soru: "Kur'an'ın ilk inen âyetleri hangi sûredendir?",
    secenekler: ["Fâtiha", "Alak", "Bakara", "İhlâs"], cevap: 1,
    aciklama: "İlk vahiy, Alak sûresinin ilk beş âyetidir; Hira mağarasında gelmiştir.",
    kaynak: "Buhârî, Bed'ü'l-vahy",
  },
  {
    id: "b3", seviye: "baslangic", kategori: "ilmihal",
    soru: "Günde kaç vakit namaz farzdır?",
    secenekler: ["3", "4", "5", "6"], cevap: 2,
    aciklama: "Beş vakit namaz farzdır: sabah, öğle, ikindi, akşam, yatsı.",
    kaynak: "İsrâ 17:78; Buhârî, Mevâkît",
  },
  {
    id: "b4", seviye: "baslangic", kategori: "ilmihal",
    soru: "Zekâtın nisabı (oranı) kaçtır?",
    secenekler: ["1/10", "1/20", "1/40", "1/100"], cevap: 2,
    aciklama: "Zekât, nisaba ulaşan malın kırkta biridir (1/40 = %2,5).",
    kaynak: "Buhârî, Zekât",
  },
  {
    id: "b5", seviye: "baslangic", kategori: "kuran",
    soru: "Ramazan orucu hangi âyette emredilir?",
    secenekler: ["Bakara 2:183", "Nisâ 4:43", "Mâide 5:6", "Cuma 62:9"], cevap: 0,
    aciklama: "\"Ey iman edenler! Oruç sizden öncekilere farz kılındığı gibi size de farz kılındı\" âyeti Bakara 2:183'tedir.",
    kaynak: "Bakara 2:183",
  },
  {
    id: "b6", seviye: "baslangic", kategori: "tarih",
    soru: "Kâbe hangi şehirdedir?",
    secenekler: ["Medine", "Mekke", "Kudüs", "Tâif"], cevap: 1,
    aciklama: "Kur'an, Kâbe'yi Mekke'deki ilk mâbed olarak bildirir.",
    kaynak: "Âl-i İmrân 3:96",
  },
  {
    id: "b7", seviye: "baslangic", kategori: "siyer",
    soru: "Hz. Peygamber'in doğum yılı olarak kabul edilen tarih hangisidir?",
    secenekler: ["571", "610", "622", "632"], cevap: 0,
    aciklama: "Fil Vakası yılı olarak bilinen 571, Hz. Peygamber'in doğum yılı kabul edilir.",
    kaynak: "İbn Hişâm, es-Sîre, I",
  },
  {
    id: "b8", seviye: "baslangic", kategori: "siyer",
    soru: "Hicret hangi şehre yapılmıştır?",
    secenekler: ["Tâif", "Medine", "Şam", "Kudüs"], cevap: 1,
    aciklama: "622'de Mekke'den Yesrib'e (Medine) hicret edildi; İslâm takviminin başlangıcıdır.",
    kaynak: "İbn Hişâm, es-Sîre, II",
  },
  {
    id: "b9", seviye: "baslangic", kategori: "kuran",
    soru: "Kur'an'ın ilk sûresi hangisidir?",
    secenekler: ["Nâs", "Fâtiha", "Bakara", "İhlâs"], cevap: 1,
    aciklama: "Mushaf tertibinde ilk sûre Fâtiha'dır; namazın her rekâtında okunur.",
    kaynak: "Mushaf tertibi",
  },
  {
    id: "b10", seviye: "baslangic", kategori: "ilmihal",
    soru: "Abdestin farzları hangi âyette açıklanır?",
    secenekler: ["Bakara 2:183", "Mâide 5:6", "Nûr 24:31", "Tahrîm 66:8"], cevap: 1,
    aciklama: "Mâide 5:6, abdestin organlarını ve sırasını bildirir.",
    kaynak: "Mâide 5:6",
  },
  {
    id: "b11", seviye: "baslangic", kategori: "tarih",
    soru: "Hulefâ-yi Râşidîn kaç halifeden oluşur?",
    secenekler: ["2", "3", "4", "5"], cevap: 2,
    aciklama: "Hz. Ebû Bekir, Ömer, Osman ve Ali; dört halife dönemi Hulefâ-yi Râşidîn olarak anılır.",
    kaynak: "Taberî, Târîh, III-V",
  },
  {
    id: "b12", seviye: "baslangic", kategori: "ilmihal",
    soru: "Cuma namazı hangi âyette emredilir?",
    secenekler: ["Cuma 62:9", "Bakara 2:238", "Nisâ 4:103", "Mü'minûn 23:1"], cevap: 0,
    aciklama: "Cuma 62:9, cuma günü namaza çağrıldığında alışverişi bırakıp namaza koşmayı emreder.",
    kaynak: "Cuma 62:9",
  },

  // ───────────── ORTA ─────────────
  {
    id: "o1", seviye: "orta", kategori: "siyer",
    soru: "Bedir Savaşı hangi hicrî yılda olmuştur?",
    secenekler: ["1. yıl", "2. yıl", "3. yıl", "5. yıl"], cevap: 1,
    aciklama: "Bedir, hicretin 2. yılında (624) Müslümanlarla Mekke müşrikleri arasında olmuştur.",
    kaynak: "İbn Hişâm, es-Sîre, II; Âl-i İmrân 3:123",
  },
  {
    id: "o2", seviye: "orta", kategori: "siyer",
    soru: "Hudeybiye Antlaşması hangi yıl yapılmıştır?",
    secenekler: ["4. yıl", "6. yıl", "8. yıl", "10. yıl"], cevap: 1,
    aciklama: "Hicretin 6. yılında (628) yapılan antlaşma, fetih sûresinin inişine vesile olmuştur.",
    kaynak: "İbn Hişâm, es-Sîre, III; Fetih 48:1",
  },
  {
    id: "o3", seviye: "orta", kategori: "akaid",
    soru: "Mescid-i Aksâ hangi olayla doğrudan ilişkilidir?",
    secenekler: ["Hicret", "İsrâ ve Mi'râc", "Bedir", "Veda Haccı"], cevap: 1,
    aciklama: "İsrâ 17:1, Hz. Peygamber'in Mescid-i Aksâ'ya götürüldüğünü bildirir; mi'râc bunun devamıdır.",
    kaynak: "İsrâ 17:1",
  },
  {
    id: "o4", seviye: "orta", kategori: "kuran",
    soru: "Kur'an'ın en uzun sûresi hangisidir?",
    secenekler: ["Âl-i İmrân", "Nisâ", "Bakara", "Mâide"], cevap: 2,
    aciklama: "286 âyetiyle Bakara sûresi en uzun sûredir.",
    kaynak: "Mushaf tertibi",
  },
  {
    id: "o5", seviye: "orta", kategori: "siyer",
    soru: "İlk ezanı okuyan sahâbî kimdir?",
    secenekler: ["Hz. Bilâl", "Hz. Selmân", "Hz. Mus'ab", "Hz. Zeyd"], cevap: 0,
    aciklama: "Bilâl-i Habeşî, Hz. Peygamber'in müezziniydi ve ilk ezanı okudu.",
    kaynak: "Buhârî, Ezân",
  },
  {
    id: "o6", seviye: "orta", kategori: "hadis",
    soru: "Sahîh-i Buhârî'nin müellifi kimdir?",
    secenekler: ["İmam Müslim", "İmam Buhârî", "İmam Tirmizî", "İmam Nesâî"], cevap: 1,
    aciklama: "Muhammed b. İsmâil el-Buhârî (ö. 256/870), Sahîh'i telif etmiştir.",
    kaynak: "Zehebî, Siyeru a'lâmi'n-nübelâ",
  },
  {
    id: "o7", seviye: "orta", kategori: "siyer",
    soru: "Mekke'nin fethi hangi hicrî yılda gerçekleşti?",
    secenekler: ["6. yıl", "7. yıl", "8. yıl", "9. yıl"], cevap: 2,
    aciklama: "Hicretin 8. yılında (630) Mekke sulhle fethedildi; Kâbe putlardan temizlendi.",
    kaynak: "İbn Hişâm, es-Sîre, IV; Buhârî, Megâzî",
  },
  {
    id: "o8", seviye: "orta", kategori: "tarih",
    soru: "Kudüs hangi halife döneminde fethedildi?",
    secenekler: ["Hz. Ebû Bekir", "Hz. Ömer", "Hz. Osman", "Hz. Ali"], cevap: 1,
    aciklama: "Kudüs, 638'de Hz. Ömer döneminde sulhla fethedildi; anahtar bizzat kendisine verildi.",
    kaynak: "Taberî, Târîh, IV",
  },
  {
    id: "o9", seviye: "orta", kategori: "siyer",
    soru: "Veda Haccı hangi yıl yapılmıştır?",
    secenekler: ["8. yıl", "9. yıl", "10. yıl", "11. yıl"], cevap: 2,
    aciklama: "Hicretin 10. yılında yapılan Veda Haccı, Hz. Peygamber'in son haccıdır.",
    kaynak: "Buhârî, Hac; Müslim, Hac",
  },
  {
    id: "o10", seviye: "orta", kategori: "kuran",
    soru: "Kur'an'ın resmî nüshasının çoğaltılması hangi halife döneminde yapıldı?",
    secenekler: ["Hz. Ebû Bekir", "Hz. Ömer", "Hz. Osman", "Hz. Ali"], cevap: 2,
    aciklama: "Hz. Osman döneminde mushaf çoğaltılıp merkezlere gönderildi; bu nüshaya \"Mushaf-ı Osmânî\" denir.",
    kaynak: "Buhârî, Fedâilü'l-Kur'ân",
  },
  {
    id: "o11", seviye: "orta", kategori: "ilmihal",
    soru: "Teyemmüm hangi durumda yapılır?",
    secenekler: ["Su bulunduğunda", "Su bulunmadığında veya kullanılamadığında", "Her namazda", "Yalnız bayramda"], cevap: 1,
    aciklama: "Su bulunmazsa veya hastalık gibi bir sebeple kullanılamazsa temiz toprakla teyemmüm edilir.",
    kaynak: "Mâide 5:6; Nisâ 4:43",
  },
  {
    id: "o12", seviye: "orta", kategori: "siyer",
    soru: "İlk vahiy hangi mağarada gelmiştir?",
    secenekler: ["Sevr", "Hira", "Kehf", "Uhud"], cevap: 1,
    aciklama: "İlk vahiy, Mekke yakınlarındaki Hira mağarasında, Alak sûresinin ilk âyetleriyle gelmiştir.",
    kaynak: "Buhârî, Bed'ü'l-vahy",
  },

  // ───────────── İLERİ ─────────────
  {
    id: "i1", seviye: "ileri", kategori: "siyer",
    soru: "Hz. Peygamber vefat ettiğinde kaç yaşındaydı?",
    secenekler: ["60", "63", "65", "70"], cevap: 1,
    aciklama: "63 yaşında vefat ettiği, temel hadis kaynaklarında bildirilir.",
    kaynak: "Buhârî, Menâkıb; Müslim, Fedâil",
  },
  {
    id: "i2", seviye: "ileri", kategori: "tarih",
    soru: "Yermük Savaşı hangi halife döneminde yapılmıştır?",
    secenekler: ["Hz. Ebû Bekir", "Hz. Ömer", "Hz. Osman", "Hz. Ali"], cevap: 1,
    aciklama: "636'daki Yermük Savaşı, Hz. Ömer döneminde Bizans'a karşı kazanılmıştır.",
    kaynak: "Taberî, Târîh, IV; Belâzürî, Fütûh",
  },
  {
    id: "i3", seviye: "ileri", kategori: "ilmihal",
    soru: "Hanefî mezhebinin kurucusu kimdir?",
    secenekler: ["İmam Mâlik", "İmam Şâfiî", "İmâm-ı Âzam Ebû Hanîfe", "İmam Ahmed b. Hanbel"], cevap: 2,
    aciklama: "Nu'mân b. Sâbit (ö. 150/767), Ebû Hanîfe künyesiyle bilinir; Hanefî mezhebinin imamıdır.",
    kaynak: "İbn Hallikân, Vefeyâtü'l-a'yân",
  },
  {
    id: "i4", seviye: "ileri", kategori: "hadis",
    soru: "Hadis ilminde \"cerh ve ta'dîl\" neyi inceler?",
    secenekler: [
      "Ravilerin güvenilirliğini",
      "Âyetlerin iniş sırasını",
      "Namaz vakitlerini",
      "Fıkıh hükümlerini",
    ], cevap: 0,
    aciklama: "Cerh ve ta'dîl, ravilerin güvenilir olup olmadığını inceleyen hadis ilmi dalıdır.",
    kaynak: "Hadis usûlü (İbn Hacer, Nüzhetü'n-nazar)",
  },
  {
    id: "i5", seviye: "ileri", kategori: "tarih",
    soru: "Endülüs'ün fethi hangi yıl başlamıştır?",
    secenekler: ["650", "711", "732", "800"], cevap: 1,
    aciklama: "711'de Târık b. Ziyâd ile başlayan fetih, Endülüs'te sekiz asırlık İslâm varlığını başlattı.",
    kaynak: "İbn Abdülhakem, Fütûhu Mısr",
  },
  {
    id: "i6", seviye: "ileri", kategori: "tarih",
    soru: "Bağdat hangi dönemde kurulmuştur?",
    secenekler: ["Emevîler", "Abbâsîler", "Selçuklular", "Osmanlılar"], cevap: 1,
    aciklama: "Bağdat, 762'de Abbâsî halifesi Mansûr tarafından başkent olarak kuruldu.",
    kaynak: "Hatîb el-Bağdâdî, Târîhu Bağdâd",
  },
  {
    id: "i7", seviye: "ileri", kategori: "tarih",
    soru: "İstanbul'un fethi hangi yılda gerçekleşti?",
    secenekler: ["1402", "1453", "1517", "1071"], cevap: 1,
    aciklama: "1453'te Sultan II. Mehmed İstanbul'u fethetti; şehir Osmanlı başkenti oldu.",
    kaynak: "Osmanlı kronikleri",
  },
  {
    id: "i8", seviye: "ileri", kategori: "kuran",
    soru: "Kur'an'ın \"yedi harf\" üzerine indirildiğini bildiren rivayet hangi kaynakta yer alır?",
    secenekler: ["Buhârî, Fedâilü'l-Kur'ân", "Müslim, Îmân", "Tirmizî, Deavât", "Ebû Dâvûd, Edeb"], cevap: 0,
    aciklama: "Yedi harf rivayeti, Buhârî'nin Fedâilü'l-Kur'ân bölümünde nakledilir; kıraat farklılıklarının temelidir.",
    kaynak: "Buhârî, Fedâilü'l-Kur'ân",
  },
  {
    id: "i9", seviye: "ileri", kategori: "akaid",
    soru: "Fıkıh usûlünde \"nesih\" ne demektir?",
    secenekler: [
      "Bir hükmün sonraki bir delille kaldırılması",
      "Bir hükmün genelleştirilmesi",
      "İki hükmün birleştirilmesi",
      "Hükmün süresiz olması",
    ], cevap: 0,
    aciklama: "Nesih, önceki bir hükmün, sonra gelen bir delille yürürlükten kaldırılmasıdır.",
    kaynak: "Fıkıh usûlü (Serahsî, Usûl)",
  },
  {
    id: "i10", seviye: "ileri", kategori: "akaid",
    soru: "İcmâ nedir?",
    secenekler: [
      "Müctehidlerin bir konuda ittifakı",
      "Tek bir âlimin görüşü",
      "Bir hadisin zayıf sayılması",
      "Bir âyetin tefsiri",
    ], cevap: 0,
    aciklama: "İcmâ, bir dönemin müctehid âlimlerinin bir hüküm üzerinde ittifak etmesidir.",
    kaynak: "Fıkıh usûlü (Gazâlî, el-Müstaşfâ)",
  },
  {
    id: "i11", seviye: "ileri", kategori: "akaid",
    soru: "Kıyas nedir?",
    secenekler: [
      "Hükmü nasla belirlenmemiş meseleyi benzerine bağlamak",
      "Bütün hükümleri reddetmek",
      "Yalnız akla dayanmak",
      "Hadisleri tercih etmek",
    ], cevap: 0,
    aciklama: "Kıyas, hakkında açık nas bulunmayan bir meseleyi, ortak illet sebebiyle nasla sabit bir meseleye bağlamaktır.",
    kaynak: "Fıkıh usûlü (Şâfiî, er-Risâle)",
  },
  {
    id: "i12", seviye: "ileri", kategori: "kuran",
    soru: "Sahâbe neslinin fazileti hangi âyette açıkça bildirilir?",
    secenekler: ["Tevbe 9:100", "Bakara 2:255", "İhlâs 112:1", "Nâs 114:1"], cevap: 0,
    aciklama: "Tevbe 9:100, muhacir ve ensardan ilk önce iman edenlerden Allah'ın razı olduğunu bildirir.",
    kaynak: "Tevbe 9:100",
  },
  // ★ 21.11 İÇERİK GENİŞLETME: 24 yeni soru (toplam 60 soru, her seviyede 20)
  ...YARISMA_EK_SORULARI,
];

export const YARISMA_TOPLAM = YARISMA_SORULARI.length;

export const YARISMA_SEVIYELERI: Array<{ id: YarismaSeviye; ad: string; emoji: string }> = [
  { id: "baslangic", ad: "Başlangıç", emoji: "🌱" },
  { id: "orta", ad: "Orta", emoji: "🌿" },
  { id: "ileri", ad: "İleri", emoji: "🌳" },
];

export const YARISMA_KAYNAK_NOTU =
  "Sorular Kur'an (sure:ayet), temel hadis kitapları (kitap/bölüm) ve siyer-tarih kaynaklarına dayanır. Hadis numarası verilmez; zayıf/uydurma rivayet kullanılmaz. Puan bir yarışma ölçüsüdür, dinî üstünlük ölçüsü değildir.";
