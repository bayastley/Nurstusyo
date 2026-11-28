// ═══════════════════════════════════════════════════════════════
// HADISKULLIYATHIKAYE.TS — külliyat kartlarının "Hikâyesi" eşlemesi
//
// ★ 28.11 (kullanıcı emri): "Külliyat kartlarına da bankadaki gibi
//   'Hikâyesi' butonu ekle ... uydurma hikâye yazma."
//
// KURAL (değişmez): BURADA YENİ HİKÂYE YAZILMAZ. Tablo yalnızca hangi
// külliyat rivayetinin hangi MEVCUT hikâye kaydına (hadisHikaye.ts /
// hadisHikayeHavuz.ts) denk geldiğini söyler. Hikâye metni tek yerde kalır.
//
// NEDEN ELLE EŞLEME: Bankadaki künye numaraları (ör. "Buhari, Edeb, 30")
// ile CDN'in `reference.hadith` numarası aynı sistem değil — otomatik sayı
// eşleşmesi yanlış rivayete doğru hikâyeyi bağlıyordu. Bu yüzden her satır
// TR çeviri metni okunarak doğrulandı: anahtar `slug:globalHadisNo`, değer
// o rivayetin bankadaki künyesi. Yeni satır eklerken de metni doğrula.
// ═══════════════════════════════════════════════════════════════

import { hadisHikayesi, type HadisHikayesi } from "./hadisHikaye";

/** Külliyat hadis no (jsDelivr `hadithnumber`) → bankadaki hikâye künyesi */
const ESLESME: Record<string, string> = {
  // ── BUHÂRÎ ───────────────────────────────────────────────────
  // Hakîm b. Hizâm: "Veren el, alan elden hayırlıdır" (Zekât bâbı)
  "buhari:1472": "Buhari, Zekât, 18",
  // Susayan köpeğe kuyudan su veren adam
  "buhari:173": "Buhari, Bed'ü'l-Halk, 15",
  // Kediyi açlıktan öldüren kadın
  "buhari:3318": "Buhari, Enbiyâ, 54",
  // Akra' b. Hâbis: "Merhamet etmeyene merhamet edilmez"
  "buhari:6013": "Buhârî, Edeb 76 · Müslim, Birr 107",
  // Cibril'in komşu tavsiyesi
  "buhari:6014": "Buhari, Edeb, 29",
  // Komşuya ikram / misafire ikram
  "buhari:6018": "Buhari, Edeb, 31",
  // "Ya hayır söylesin ya sussun"
  "buhari:6138": "Buhari, Edeb, 31; Müslim, Zühd, 15",
  // Koğucu (laf taşıyıcı) cennete girmez
  "buhari:6056": "Buhari, Edeb, 55",
  // Yetimle iki parmak gibi yan yana
  "buhari:6005": "Buhari, Edeb, 80",
  // "Müslüman, dilinden ve elinden Müslümanların güvende olduğu kimsedir"
  "buhari:10": "Buhari, İman, 5",
  // Cemaatle namaz yirmi yedi derece
  "buhari:645": "Buhari, Ezan, 30",
  // Hac: annesinden doğduğu gibi günahsız dönmek (iki rivayet yolu)
  "buhari:1521": "Buhari, Hac, 4",
  "buhari:1819": "Buhari, Hac, 4",
  // "Ey gençler! Evlenmeye gücü yeten evlensin"
  "buhari:5065": "Buhari, Nikâh, 3",

  // ── MÜSLİM ───────────────────────────────────────────────────
  // "İyilik yapmaya en lâyık kim? — Annendir"
  "muslim:6500": "Müslim, Birr, 1 (meâl)",
  // "Müflis kimdir bilir misiniz?"
  "muslim:6579": "Müslim, Birr, 55",
  // "Gıybet nedir bilir misiniz?"
  "muslim:6593": "Müslim, Birr, 70",

  // ── TİRMİZÎ ──────────────────────────────────────────────────
  // "Değerli bilgi mü'minin yitik malıdır"
  "tirmizi:2687": "Tirmizi, İlim, 19 (meâl)",
  // "Sizin en hayırlınız ailesine en hayırlı olanınızdır"
  "tirmizi:3895": "Tirmizi, Menâkıb, 63",

  // ── İBN MÂCE ─────────────────────────────────────────────────
  // Günah işleyince kalpte beliren siyah iz (Zühd 29)
  "ibnmace:4244": "İbn Mâce, Zühd, 29 (meâl)",
};

/** Külliyat kartı için kaynaklı hikâye; doğrulanmış eşleme yoksa null */
export function kulliyatHikayesi(slug: string, no: number): HadisHikayesi | null {
  const kunye = ESLESME[`${slug}:${no}`];
  return kunye ? hadisHikayesi(kunye) : null;
}
