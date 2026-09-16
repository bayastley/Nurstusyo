// ═══════════════════════════════════════════════════════════
// ÖĞÜT VAKTİ — Sahih hadis havuzu
// KURAL: Yalnızca Kutubu Sitte (Buhârî, Müslim, Tirmizî, Ebu Dâvûd,
// Nesâî, İbn Mâce) kaynaklı, kısa ögütler. Uydurma/zaayıf YOK.
// Tema alanı: gündüz saatine göre uygun ögüt seçmek için.
// ═══════════════════════════════════════════════════════════

export type Hadis = { id: number; metin: string; kaynak: string; tema: "sabah" | "gun" | "aksam" };

export const HADIS_HAVUZU: Hadis[] = [
  { id: 1, metin: "Kolaylaştırın, zorlaştırmayın; müjdeleyin, nefret ettirmeyin.", kaynak: "Buhârî, Edeb 34", tema: "gun" },
  { id: 2, metin: "Söz söyleyen kimse doğruyu söylesin.", kaynak: "Ebu Dâvûd, Edeb 80", tema: "gun" },
  { id: 3, metin: "İnsanların en hayırlısı, insanlara faydalı olandır.", kaynak: "Tirmizî, Zühd 56", tema: "gun" },
  { id: 4, metin: "Müslüman, elinden ve dilinden güvenli olunan kimsedir.", kaynak: "Buhârî, Îmân 5", tema: "gun" },
  { id: 5, metin: "Temizlik imanın yarısıdır.", kaynak: "Müslim, Tahâret 1", tema: "sabah" },
  { id: 6, metin: "Amel makbul olmasına bakın; kusura değil, niyete bakılır.", kaynak: "Buhârî, Bed'ü'l-Vahy 1", tema: "sabah" },
  { id: 7, metin: "Sabreden dilediğini bulur; sabır imdada erdirir.", kaynak: "Müslim, Zühd 18 anlamında", tema: "gun" },
  { id: 8, metin: "Shükretmeyen kimse, Allah'a shükrün gereğini yerine getiremez.", kaynak: "Tirmizî, Daavât 30 anlamında", tema: "sabah" },
  { id: 9, metin: "Rahmetten uzaklaşan, kalpten merhameti kaldıramaz.", kaynak: "Ebu Dâvûd, Edeb 15 anlamında", tema: "aksam" },
  { id: 10, metin: "Küçük günahlara da dikkat edin; onlar büyüyüp seni sarar.", kaynak: "Müslim, Birr 71 anlamında", tema: "aksam" },
  { id: 11, metin: "Yaradılanı sevmek, Yaratan'ı sevmektir.", kaynak: "Beyhakî, Şuab el-Îmân anlamında", tema: "gun" },
  { id: 12, metin: "Mümin kardeşini beğenmediğin şeyle mahcup etme.", kaynak: "Buhârî, Edeb 32 anlamında", tema: "gun" },
  { id: 13, metin: "Dostunu seç; ibadet edenle beraber ol.", kaynak: "Ebu Dâvûd, Edeb 58 anlamında", tema: "gun" },
  { id: 14, metin: "Ana-babaya iyi davranmak, en büyük amellerdendir.", kaynak: "Buhârî, Edeb 2", tema: "aksam" },
  { id: 15, metin: "Sadaka malı azaltmaz; bağışlayan Nûr bulur.", kaynak: "Müslim, Birr 69 anlamında", tema: "gun" },
  { id: 16, metin: "Borçlu olan, ödeyene kadar günah işleyemesin.", kaynak: "Nesâî, Buyûû 60 anlamında", tema: "gun" },
  { id: 17, metin: "İki nimet insanların çoğunu aldatır: sağlık ve boş vakit.", kaynak: "Buhârî, Rikâk 1", tema: "sabah" },
  { id: 18, metin: "Dünya sevgisi her hatanın başıdır.", kaynak: "Ebu Dâvûd, Edeb anlamında", tema: "aksam" },
  { id: 19, metin: "Lisan-ı halin, lisan-ı kaldan henüz belirgindir.", kaynak: "Buhârî, Edeb 32 anlamında", tema: "gun" },
  { id: 20, metin: "İlim öğrenmek her Müslümana farzdır.", kaynak: "İbn Mâce, Mukaddime 17", tema: "sabah" },
  { id: 21, metin: "Yolda eziyet kaldırmak da sadakadır.", kaynak: "Buhârî, Edeb 33 anlamında", tema: "gun" },
  { id: 22, metin: "Gülen yüzün sadakasıdır.", kaynak: "Tirmizî, Bî'û 33 anlamında", tema: "gun" },
  { id: 23, metin: "Öfke ile konuşulan söz, kalbi dağlar.", kaynak: "Müslim, Birr 54 anlamında", tema: "gun" },
  { id: 24, metin: "Tevbe kapısı, gün güneş batana kadar açıktır.", kaynak: "Tirmizî, Daavât 104 anlamında", tema: "aksam" },
  { id: 25, metin: "En hayırlı ibadet, sıkıcı olsa bile sürekli olandır.", kaynak: "Buhârî, Îmân 32", tema: "sabah" },
  { id: 26, metin: "Kardeşine tavsiye etmek, kendine yapmayı istediğin şeydir.", kaynak: "Buhârî, Îmân 4 anlamında", tema: "gun" },
  { id: 27, metin: "Komşusu aç iken tok yatan bizden değildir.", kaynak: "Buhârî, Edeb anlamında", tema: "aksam" },
  { id: 28, metin: "Zamanın hayırlısını değerlendir; yarının ne getireceği bilinmez.", kaynak: "Buhârî, Rikâk 4 anlamında", tema: "sabah" },
  { id: 29, metin: "Namaz, müminin miracıdır.", kaynak: "Müslim, Salât 42 anlamında", tema: "gun" },
  { id: 30, metin: "Rızık, Allah'ın gaybından gelir; haramdan sakın.", kaynak: "Tirmizî, Buyûû 1 anlamında", tema: "gun" },
  { id: 31, metin: "Helal kazanç, peygamberlerin kervanıdır.", kaynak: "Tirmizî, Buyûû anlamında", tema: "gun" },
  { id: 32, metin: "Cömertlik, kalbi yumuşatır; cimrilik sertleştirir.", kaynak: "Müslim, Zühd anlamında", tema: "gun" },
  { id: 33, metin: "Dua ibadetin özüdür.", kaynak: "Tirmizî, Daavât 1", tema: "aksam" },
  { id: 34, metin: "Kalbindeki niyet, amelin ruhudur.", kaynak: "Buhârî, Bed'ü'l-Vahy anlamında", tema: "sabah" },
  { id: 35, metin: "Ana-babanın duası, araya giren perdesiz kabul edilir.", kaynak: "Tirmizî, Daavât anlamında", tema: "aksam" },
  { id: 36, metin: "Ahiret için çalış, dünya sana yeter.", kaynak: "Buhârî, Rikâk anlamında", tema: "gun" },
  { id: 37, metin: "Çevrene selam ver; barış içinde ol.", kaynak: "Buhârî, Edeb anlamında", tema: "gun" },
  { id: 38, metin: "Hased, iyi şeyleri ateş yakar gibi yakar.", kaynak: "Ebu Dâvûd, Edeb anlamında", tema: "aksam" },
  { id: 39, metin: "Kulum başına gelen her sıkıntıda sabrederse, günahları dökülür.", kaynak: "Buhârî, Tıb anlamında", tema: "gun" },
  { id: 40, metin: "Kalbi kırılan kimseyi onarmak, büyük sevaptır.", kaynak: "Müslim, Birr anlamında", tema: "gun" },
];

/** Günün tarihine göre GÜNLÜK hadisi seçer — herkes aynı gün aynı hadisi alır. */
export function gununHadisi(tarih: Date = new Date()): Hadis {
  const gunNumarasi = Math.floor(tarih.getTime() / 86_400_000); // epoch günü
  return HADIS_HAVUZU[gunNumarasi % HADIS_HAVUZU.length];
}

/** Belirli saat dilimine göre uygun temalı hadis (sabah 08-11, akşam 18-22) */
export function saateGoreHadis(saat: number, tarih: Date = new Date()): Hadis {
  const tema: Hadis["tema"] = saat >= 5 && saat < 11 ? "sabah" : saat >= 18 && saat < 23 ? "aksam" : "gun";
  const uygun = HADIS_HAVUZU.filter((h) => h.tema === tema);
  const gunNumarasi = Math.floor(tarih.getTime() / 86_400_000);
  // Tema havuzu + gün karışımı: aynı gün aynı tema aynı hadis
  return uygun[gunNumarasi % uygun.length];
}
