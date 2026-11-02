// ════════════════════════════════════════════════════════
// MENKIBELER.TS (02.11, kullanıcı emri: "İslami menkıbeler olsun; butona
// tıklayınca uzunca bir İslami hikâye açılsın; kaynak varsa ver, önemli
// olan kıssadan hisse alabilmektir") — İslâmî kıssa kasası.
//   · her kıssa: başlık + uzun hikâye + hikmet (kıssadan hisse) + kaynak
//   · kategoriler: Ölüm & Kabir, Nebiler, Ashab, Sâlihler, Hükümdarlar,
//     Hanımlar, İlim, Sabır, Tefekkür, Adalet — 100 kıssa yol haritası
//   · kaynaklar klasik eserler (İbn Kesir, Taberî, İbnül-Cevzî, ez-Zehebî…)
//   · kıssalar edebî anlatımdır; raviler eser adıyla yön gösterilir.
// ════════════════════════════════════════════════════════

export interface Menkibe {
  id: string;
  kategori: string;
  baslik: string;
  hikaye: string;
  hikmet: string;
  kaynak: string;
}

export const MENKIBELER: Menkibe[] = [
  {
    id: "mk-01", kategori: "Ölüm & Kabir", baslik: "Üç Dostun Son Muhasebesi",
    hikaye:
      "Ebu'd-Derdâ (r.a.) bir gün yanındaki gençlere bir soru yöneltti: Uzun bir yolculuğa çıkan adam yanına en öz nesnesini alır; ölen adam da o yola bu dünyadan neyi götürür? Gençler sustu. Kendisi cevabını verebilen bir rivayeti anlattı: Zengin bir adam ölüm döşeğindeyken üç sevdiği kişiyi çağırmış ve benim için bedel öder misiniz diye sormuş. Mali de, ailesi de dönmüş. Yalnız amel dediği dost灾害 durmuş: seninle mezara kadar gelir, hesap gününde lehine tanıklık ederim demiş. Ebu'd-Derdâ sonra şunu söylerdi: aile veda eder, mal arkada bırakılır; yalnızca amel seninle kabre girer.",
    hikmet: "Üç büyük dostun: mal, aile ve amel arasında kabre seninle giden tek kişi amelindir; kıymetli zamana onun için değer vermektir.",
    kaynak: "Ebu'd-Derdâ rivayetleri; Sıfatı's-Safve (İbnül-Cevzî)",
  },
];
