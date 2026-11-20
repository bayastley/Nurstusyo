// ════════════════════════════════════════════════════════
// SAHABEEK DATA — Sahabeler dönemi ek biyografiler (16 kişi)
// Ana liste islamTarihiData.ts içindedir; bu dosya oraya spread edilir.
//
// ★ SAHİHLİK İLKESİ:
//   • Vefat yılları TDV İslâm Ansiklopedisi maddeleri ve İbn Sa'd,
//     et-Tabakâtü'l-kübrâ esas alınarak verildi.
//   • Rivayetlerin farklılaştığı yerde "~" veya "yaklaşık" kullanıldı,
//     alternatif yıllar özet içinde belirtildi.
//   • Menkıbe/uydurma anlatı yok; her kayıtta künye verildi.
// ════════════════════════════════════════════════════════

import type { TarihOlay } from "./islamTarihiData";

export const SAHABE_EK_OLAYLARI: TarihOlay[] = [
  // ── Ehl-i beyt ──
  {
    tarih: "vefatı 669 (49)",
    baslik: "Hz. Hasan b. Ali (r.a.)",
    ozet:
      "Hz. Peygamber'in torunu, Hz. Fâtıma ile Hz. Ali'nin büyük oğlu. 661'de hilafeti Muâviye'ye devrederek \"senetü'l-cemâa\"yı (birlik yılı) sağladı. 49 (669) yılında Medine'de vefat etti; 50 (670) yılını veren rivayetler de vardır. Cennetü'l-Bakî'ye defnedildi.",
    kaynak: "İbn Sa'd, et-Tabakât, VI; Buhârî, Fedâilü's-sahâbe; TDV İslâm Ansiklopedisi, “Hasan”",
  },
  {
    tarih: "vefatı 680 (61/10 Muharrem)",
    baslik: "Hz. Hüseyin b. Ali (r.a.)",
    ozet:
      "Hz. Peygamber'in torunu, Hz. Ali ile Hz. Fâtıma'nın küçük oğlu. Kerbelâ'da ailesinden ve yakınlarından çok sayıda kişiyle birlikte şehit edildi. Bu olay İslâm dünyasında derin iz bıraktı ve tarih boyunca yâs ile anıldı.",
    kaynak: "Taberî, Târîh, VI; İbnü'l-Esîr, el-Kâmil, IV; TDV İslâm Ansiklopedisi, “Hüseyin”",
  },

  // ── Kumandanlar ──
  {
    tarih: "vefatı 642 (21)",
    baslik: "Hâlid b. Velîd (r.a.)",
    ozet:
      "Hz. Peygamber'in \"Seyfullah\" (Allah'ın kılıcı) dediği kumandan. Uhud'da müşriklerin safında savaştıktan sonra hicretin 8. yılında Müslüman oldu. Yermük'te Bizans ordusuna karşı kazandığı zaferle tanınır; 21 (642) yılında Humus'ta vefat etti.",
    kaynak: "İbn Sa'd, et-Tabakât, VII; Taberî, Târîh, IV; TDV İslâm Ansiklopedisi, “Hâlid b. Velîd”",
  },
  {
    tarih: "vefatı 664 (43)",
    baslik: "Amr b. Âs (r.a.)",
    ozet:
      "Mısır fâtihi ve devlet adamı. Kudüs'ün Hz. Ömer'e tesliminde aracı oldu; Amvâs vebasında aldığı tedbirlerle ordunun toptan kaybını önledi. Mısır valiliği yaptı; 43 (664) yılında Mısır'da vefat etti.",
    kaynak: "İbn Sa'd, et-Tabakât, VII; Belâzürî, Fütûhu'l-büldân; TDV İslâm Ansiklopedisi, “Amr b. Âs”",
  },

  // ── Zâhid ve muallimler ──
  {
    tarih: "vefatı 653 (32)",
    baslik: "Ebû Zer el-Gıfârî (r.a.)",
    ozet:
      "İslâm'ı ilk kabul edenlerden, zühdüyle tanınan sahabi. Servetin tek elde toplanmasına karşı çıkan sözleriyle bilinir. 32 (653) yılında Rebeze'de vefat etti; 31 ve 33 yıllarını veren rivayetler de vardır.",
    kaynak: "İbn Sa'd, et-Tabakât, IV; Müslim, Fedâilü's-sahâbe; TDV İslâm Ansiklopedisi, “Ebû Zer el-Gıfârî”",
  },
  {
    tarih: "vefatı 657 (37)",
    baslik: "Ammâr b. Yâsir (r.a.)",
    ozet:
      "İslâm'ı ilk kabul edenlerden; annesi Sümeyye ve babası Yâsir ilk şehitler arasındadır. Mekke'de ağır işkence gördü, hicretten sonra Medine'de mescidin inşasında çalıştı. Sıffîn'de 37 (657) yılında şehit oldu.",
    kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Fedâilü's-sahâbe; TDV İslâm Ansiklopedisi, “Ammâr b. Yâsir”",
  },
  {
    tarih: "vefatı 639 (18)",
    baslik: "Muâz b. Cebel (r.a.)",
    ozet:
      "Ensarın ileri gelenlerinden, Kur'an ve fıkıh ilminde öne çıkan sahabi. Hz. Peygamber onu Yemen'e muallim olarak gönderdi. Amvâs vebasında 18 (639) yılında vefat etti; 17 yılını veren rivayet de vardır.",
    kaynak: "İbn Sa'd, et-Tabakât, III; Tirmizî, Menâkıb; TDV İslâm Ansiklopedisi, “Muâz b. Cebel”",
  },
  {
    tarih: "vefatı 687 (68)",
    baslik: "Abdullah b. Abbâs (r.a.)",
    ozet:
      "\"Tercümânü'l-Kur'ân\" diye anılan sahabi; tefsir ilminde öncü kabul edilir. Hz. Peygamber'in amcasının oğlu, Hz. Ali döneminde Basra valisi. 68 (687) yılında Tâif'te vefat etti.",
    kaynak: "İbn Sa'd, et-Tabakât, V; Buhârî, Fedâilü's-sahâbe; TDV İslâm Ansiklopedisi, “Abdullah b. Abbâs”",
  },
  {
    tarih: "vefatı ~693 (73)",
    baslik: "Abdullah b. Ömer (r.a.)",
    ozet:
      "Hz. Ömer'in oğlu; sünnete bağlılığı ve çok hadis rivayetiyle tanınır. Fetvaları ve vera'ı ile sahâbe arasında öne çıktı. 73 (692-93) yılında Mekke'de vefat etti.",
    kaynak: "İbn Sa'd, et-Tabakât, IV; Buhârî, Fedâilü's-sahâbe; TDV İslâm Ansiklopedisi, “Abdullah b. Ömer”",
  },

  // ── Mûte şehitleri ──
  {
    tarih: "vefatı 629 (8/Cemâziyelevvel)",
    baslik: "Zeyd b. Hârise (r.a.)",
    ozet:
      "Hz. Hatice'nin azatlısı, Hz. Peygamber'in evinde büyüyen ve evlâtlık olarak anılan sahabi. Mûte seferinde ordunun ilk komutanı olarak şehit düştü; oğlu Üsâme de sahâbenin ileri gelenlerindendir.",
    kaynak: "İbn Hişâm, es-Sîre, IV; Buhârî, Megâzî; TDV İslâm Ansiklopedisi, “Zeyd b. Hârise”",
  },
  {
    tarih: "vefatı 629 (8/Cemâziyelevvel)",
    baslik: "Cafer b. Ebû Tâlib (r.a.)",
    ozet:
      "Hz. Ali'nin kardeşi, \"Tayyâr\" (uçan) diye anılan sahabi. Habeşistan'a hicret eden kafilenin sözcüsü olarak Necâşî'nin huzurunda konuştu. Mûte'de iki kolu kesildiği hâlde sancağı taşıdı ve şehit oldu.",
    kaynak: "Buhârî, Megâzî; İbn Hişâm, es-Sîre, IV; TDV İslâm Ansiklopedisi, “Cafer b. Ebû Tâlib”",
  },
  {
    tarih: "vefatı 629 (8/Cemâziyelevvel)",
    baslik: "Abdullah b. Revâha (r.a.)",
    ozet:
      "Ensarın şairlerinden, Akabe biatlarına katılan sahabi. Mûte seferinde üçüncü komutan olarak şehit düştü. Hz. Peygamber'in savaş öncesi ona verdiği öğütler siyer kaynaklarında nakledilir.",
    kaynak: "İbn Hişâm, es-Sîre, IV; Buhârî, Megâzî; TDV İslâm Ansiklopedisi, “Abdullah b. Revâha”",
  },

  // ── İlim ve hadis ──
  {
    tarih: "vefatı 657 (37)",
    baslik: "Habbâb b. Eret (r.a.)",
    ozet:
      "İslâm'ı ilk kabul edenlerden, Mekke'de köle iken işkence gören sahabi. Kur'an öğretmeni olarak görevlendirildi; bütün gazvelere katıldı. 37 (657) yılında Kûfe'de vefat etti ve vasiyeti üzerine şehir dışına defnedildi.",
    kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Menâkıbü'l-ensâr; TDV İslâm Ansiklopedisi, “Habbâb b. Eret”",
  },
  {
    tarih: "vefatı 672 (52)",
    baslik: "İmrân b. Husayn (r.a.)",
    ozet:
      "Hayber'in fethinde Müslüman olan, fıkıh ve hadiste öne çıkan sahabi. Basra'ya muallim olarak gönderildi, bir süre kadılık yaptı. 52 (672) yılında Basra'da vefat etti; 673 yılını veren kaynaklar da vardır.",
    kaynak: "İbn Sa'd, et-Tabakât, VII; TDV İslâm Ansiklopedisi, “İmrân b. Husayn”",
  },
  {
    tarih: "vefatı ~693 (74)",
    baslik: "Ebû Saîd el-Hudrî (r.a.)",
    ozet:
      "Çok hadis rivayet eden yedi sahabiden biri. Hendek'ten sonra on iki gazveye katıldı, Bey'atü'r-rıdvân'da bulundu. 74 (693-94) yılında Medine'de vefat etti; 64 ve 65 yıllarına dair rivayetler tercih edilmemiştir.",
    kaynak: "İbn Sa'd, et-Tabakât, V; TDV İslâm Ansiklopedisi, “Ebû Saîd el-Hudrî”",
  },

  // ── İlk muhacirler ──
  {
    tarih: "vefatı 624 (2)",
    baslik: "Osman b. Maz'ûn (r.a.)",
    ozet:
      "İlk Müslümanlardan ve Habeşistan'a hicret eden kafilenin başkanı. Medine'de Bakî' mezarlığına defnedilen ilk muhacirdir. Zühdü ve gece namazına düşkünlüğüyle tanınır; Hz. Peygamber cenazesine bizzat katıldı.",
    kaynak: "İbn Sa'd, et-Tabakât, III; Buhârî, Cenâiz; TDV İslâm Ansiklopedisi, “Osman b. Maz'ûn”",
  },
];
