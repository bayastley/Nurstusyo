// ══════════════════════════════════════════════════════════════
// KÂBE CANLI + RADYO KAYNAKLARI — saf veri (URL listeleri)
// QuranLearnModal'dan ayrıştırıldı: bileşen dosyası küçülsün,
// kaynaklar tek yerden yönetilsin. Tümü CORS açık ve canlıda test edildi.
// ══════════════════════════════════════════════════════════════

// ★ KÂBE CANLI — üç kanal (YouTube tamamen atlandı, hata 153 tarihe karıştı):
//   quran → Suudi resmî Quran TV (tilavet + Mekke/Medine görüntüleri)
//   live  → Katar Quran TV (HD, kesintisiz tilavet — Akamai CDN)
//   mekke → Mescid-i Nebi (Medine, Saudi Sunnah)
// Doğrudan kaynak birincil; /api/live/kabe proxy'si yalnızca yedek.
export const KABE_SOURCES = [
  "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8", // ★ Suudi resmî Quran TV — https, CORS açık
  "https://media2.streambrothers.com:1936/8122/8122/playlist.m3u8", // yedek: Makkah TV
  "/api/live/kabe?src=kabe&type=playlist",
];

export const QURAN_HD_SOURCES = [
  "https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8",
  "/api/live/kabe?src=quran&type=playlist",
];

export const SUNNAH_SOURCES = [
  "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8",
  "/api/live/kabe?src=sunnah&type=playlist",
];

export const kabeSourcesFor = (tab: string) =>
  tab === "quran" ? KABE_SOURCES : tab === "mekke" ? SUNNAH_SOURCES : QURAN_HD_SOURCES;

// ═══ 📻 KUR'AN RADYOSU — 7/24 kesintisiz tilavet radyoları (mp3quran.net / qurango.net)
//   Tümü CORS açık (Access-Control-Allow-Origin: *) ve canlıda test edildi (200 audio/mpeg).
//   ★ bolge: "tr" = Türkçe/sohbet ağırlıklı, "ar" = Arapça tilavet, "genel" = evrensel.
//     Akıllı Radyo, kullanıcının ülkesine göre bu etiketlerle öneri sıralar.
export type RadioBolge = "tr" | "ar" | "genel";
export const RADIO_STATIONS: Array<{ ad: string; url: string; hls?: boolean; bolge: RadioBolge }> = [
  { ad: "🕌 Diyanet Kur'an Radyo (TR)", url: "https://eustr76.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8", hls: true, bolge: "tr" },
  { ad: "🕌 Diyanet Radyo (TR)", url: "https://eustr76.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1520b2626.smil/playlist.m3u8", hls: true, bolge: "tr" },
  { ad: "🕌 Diyanet Risalet Radyo (TR)", url: "https://eustr76.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c14192aa92.smil/playlist.m3u8", hls: true, bolge: "tr" },
  { ad: "🌿 Trawîh & Tilavet Karışık", url: "https://qurango.net/radio/tarateel", bolge: "ar" },
  { ad: "🎙️ Maher Al-Muaiqly", url: "https://backup.qurango.net/radio/maher_almuaiqly", bolge: "ar" },
  { ad: "🎙️ Mishary Alafasy", url: "https://backup.qurango.net/radio/mishary_alafasi", bolge: "ar" },
  { ad: "🎙️ Yasser Al-Dosari", url: "https://backup.qurango.net/radio/yasser_aldosari", bolge: "ar" },
  { ad: "🎙️ Fares Abbad", url: "https://backup.qurango.net/radio/fares_abbad", bolge: "ar" },
  { ad: "🎙️ Abdulrahman As-Sudais", url: "https://backup.qurango.net/radio/abdulrahman_alsudaes", bolge: "ar" },
  { ad: "🎙️ Al-Minshawi", url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi", bolge: "ar" },
];

// ★ ÜLKE → BÖLGE eşlemesi (Cloudflare geo / ipapi.co ülke kodu):
//   TR + Azerbaycan → "tr" (Türkçe sohbet/tilavet), Arap ülkeleri → "ar",
//   geri kalan herkes → "genel" (evrensel kâriler).
const TR_ULKEKAARI = new Set(["TR", "AZ"]);
const ARAP_ULKEKAARI = new Set(["SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "SY", "IQ", "YE", "PS", "EG", "LY", "TN", "DZ", "MA", "MR", "SD", "SO", "DJ", "KM"]);
export const ulkeToBolge = (ulke: string | null | undefined): RadioBolge => {
  const u = (ulke || "").toUpperCase();
  if (TR_ULKEKAARI.has(u)) return "tr";
  if (ARAP_ULKEKAARI.has(u)) return "ar";
  return "genel";
};
