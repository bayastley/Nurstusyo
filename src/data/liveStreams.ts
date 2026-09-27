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
//   ★ bolge: "tr" = Türkçe/sohbet ağırlıklı, "ar" = Arapça tilavet, "yabanci" = DE/EN/FR
//     uluslararası kanallar, "genel" = evrensel.
//     Akıllı Radyo, kullanıcının ülkesine/diline göre bu etiketlerle öneri sıralar.
export type RadioBolge = "tr" | "ar" | "yabanci" | "genel";
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
  // ★ YABANCI BÖLGE — uluslararası hoca radyoları (Kuveyt resmî mp3islam.com, Shoutcast).
  //   24 Eyl 2026 testi: HTTP 200 · content-type audio/aacp · CORS-safe https.
  //   Ahmediyye kaynakları (Voice of Islam vb.) sahih çizgi şartıyla LİSTEYE ALINMADI.
  { ad: "🌍 Maher Al-Muaiqly (Int'l)", url: "https://radio.mp3islam.com/listen/maher/radio.mp3", bolge: "yabanci" },
  { ad: "🌍 Mishary Alafasy (Int'l)", url: "https://radio.mp3islam.com/listen/mishary/radio.mp3", bolge: "yabanci" },
  { ad: "🌍 Abdulrahman As-Sudais (Int'l)", url: "https://radio.mp3islam.com/listen/sudais/radio.mp3", bolge: "yabanci" },
  { ad: "🌍 Muhammad Al-Minshawi (Int'l)", url: "https://radio.mp3islam.com/listen/minshawi/radio.mp3", bolge: "yabanci" },
  { ad: "🌍 Yasser Al-Dosari (Int'l)", url: "https://radio.mp3islam.com/listen/yaser/radio.mp3", bolge: "yabanci" },
  { ad: "🌍 Saud Al-Shuraim (Int'l)", url: "https://radio.mp3islam.com/listen/alshuraim/radio.mp3", bolge: "yabanci" },
];

// ★ ÜLKE → BÖLGE eşlemesi (Cloudflare geo / ipapi.co ülke kodu):
//   TR + Azerbaycan → "tr" (Türkçe sohbet/tilavet), Arap ülkeleri → "ar",
//   diğer ülkelerde tarayıcı dili de/il/fr/es/pt/ru → "yabanci" (uluslararası hoca radyoları),
//   geri kalan herkes → "genel" (evrensel kâriler).
const TR_ULKEKAARI = new Set(["TR", "AZ"]);
const ARAP_ULKEKAARI = new Set(["SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "SY", "IQ", "YE", "PS", "EG", "LY", "TN", "DZ", "MA", "MR", "SD", "SO", "DJ", "KM"]);
// ★ DİL → YABANCI bölge: tarayıcı dili Almanca/İngilizce/Fransızca/İspanyolca/Portekizce/Rusça ise
//   (Arap/TR dışı Batı kitlesi) uluslararası kanallar öne alınır. Yol haritası madde 1.
const YABANCI_DILLER = new Set(["de", "en", "fr", "es", "pt", "ru", "it", "nl", "sv", "da", "no", "fi"]);
export const dilToBolge = (dil: string | null | undefined): RadioBolge =>
  YABANCI_DILLER.has((dil || "").slice(0, 2).toLowerCase()) ? "yabanci" : "genel";
export const ulkeToBolge = (ulke: string | null | undefined): RadioBolge => {
  const u = (ulke || "").toUpperCase();
  if (TR_ULKEKAARI.has(u)) return "tr";
  if (ARAP_ULKEKAARI.has(u)) return "ar";
  return "genel";
};
