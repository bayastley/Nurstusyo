// ══════════════════════════════════════════════════════════════
// QURANLEARNSOZLUK.TS — Tam Kur'an Türkçe kelime sözlüğü (WbW)
//
// ★ SRP adım 12 (06.10): QuranLearnModal'dan ayrıldı — sözlük yükleme
//   mantığı modal bileşeninden bağımsız tek sorumluluktur.
//   İçerik VE mantık birebir taşındı (davranış değişmedi).
//
// ★ KELİME ANLAMLARI: tam Kur'an sözlüğü (15.321 kök, TÜM 77.429 kelime %100 kapsama)
//   kaynak: quran.com API Türkçe WbW (Diyanet) + eski 571 sözlük — public/wbw-tr-full.json
//   Öncelik: 1) sözlük 2) API Türkçe meal 3) Arapça kök gösterilir ('—' asla görünmez)
// ══════════════════════════════════════════════════════════════

export const WBW_TR: Record<string, string> = {};

// ★ SÖZLÜK YÜKLEME DURUMU: quran.com API'si çökse bile sözlük bir kez yüklensin —
//   eski kodda sözlük SADECE API başarılı olunca çekiliyordu, API takılınca kelimeler '—' oluyordu.
let WBW_LOADED = false;
let WBW_NORM_IDX: Record<string, string> = {};
let WBW_LOADING: Promise<void> | null = null;

export function wbwHazir(): boolean {
  return WBW_LOADED;
}

export function wbwNormIdx(): Record<string, string> {
  return WBW_NORM_IDX;
}

export async function ensureWbwLoaded(): Promise<void> {
  if (WBW_LOADED) return;
  if (!WBW_LOADING) {
    WBW_LOADING = fetch("/wbw-tr-full.json")
      .then(r => r.json())
      .then(j => {
        const t = j.translations ?? j;
        Object.assign(WBW_TR, t);
        WBW_NORM_IDX = j.normIndex ?? {};
        WBW_LOADED = Object.keys(WBW_TR).length > 0;
      })
      .catch(() => { WBW_LOADING = null; /* başarısızsa tekrar denenebilir */ });
  }
  await WBW_LOADING;
}
