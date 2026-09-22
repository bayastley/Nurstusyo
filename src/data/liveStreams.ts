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
export const RADIO_STATIONS: Array<{ ad: string; url: string }> = [
  { ad: "🌿 Trawîh & Tilavet Karışık", url: "https://qurango.net/radio/tarateel" },
  { ad: "🎙️ Maher Al-Muaiqly", url: "https://backup.qurango.net/radio/maher_almuaiqly" },
  { ad: "🎙️ Mishary Alafasy", url: "https://backup.qurango.net/radio/mishary_alafasi" },
  { ad: "🎙️ Yasser Al-Dosari", url: "https://backup.qurango.net/radio/yasser_aldosari" },
  { ad: "🎙️ Fares Abbad", url: "https://backup.qurango.net/radio/fares_abbad" },
  { ad: "🎙️ Abdulrahman As-Sudais", url: "https://backup.qurango.net/radio/abdulrahman_alsudaes" },
  { ad: "🎙️ Al-Minshawi", url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi" },
];
