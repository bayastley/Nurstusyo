// TIP.TS — Evliyalat künyesi (04.11, kullanıcı emri: "10 büyük hikâye, kitap gibi 5 sayfa").
export interface Evliya {
  id: string;         // "ev-01" … "ev-10"
  ad: string;
  unvan: string;      // kitap kapağındaki alt başlık
  donem: string;      // yıl + şehir çizgisi
  sayfalar: string[]; // 5 kitap sayfası; \n\n paragrafı kırar
  kaynak: string;     // kitap altındaki kaynak satırı
}
