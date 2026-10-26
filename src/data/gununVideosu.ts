// ════════════════════════════════════════════════════════
// GÜNÜN HAZIR VİDEOSU VERİSİ (01.10, kullanıcı kararı)
// Her güne özel 1 hazır video: günün ruhuna uygun ayet(ler) +
// mübarek günlerde özel seçim (Cuma → Cuma suresi + Kehf,
// Kadir Gecesi → Kadr 97:1, Mevlid → Enbiyâ 21:107...).
// Mübarek günler Hicri takvimle (Intl islamic-umalqura) bulunur —
// her yıl otomatik kayar, elle tarih bakımı gerekmez.
// Atmosfer kategorileri tier katmanlarından seçilir; üyeliğine
// göre havuz daralır (free → free kategoriler, pro → pro, elit → elit).
// ════════════════════════════════════════════════════════

import type { CatId } from "../clips";

// ★ 26.10 i18n: baslik/aciklama artık sözlük anahtarı — 5 dilde ttX2610 ile çözülür
export interface GununVideoKarti {
  /** i18n sözlük anahtarı (gvB* / mub* ) */
  baslik: string;
  /** i18n sözlük anahtarı (gvA*) */
  aciklama: string;
  emoji: string;
  ayetler: Array<{ s: number; a: number; sName: string }>;
  kategoriler: CatId[];
}

// ── Haftanın 7 günü (getDay(): 0=Pazar … 6=Cumartesi) ─────
export const HAFTA_GUNLERI: Record<number, GununVideoKarti> = {
  1: { // Pazartesi
    emoji: "🌱", baslik: "gvB1",
    aciklama: "gvA1",
    ayetler: [{ s: 94, a: 6, sName: "İnşirâh" }, { s: 65, a: 3, sName: "Talâk" }],
    kategoriler: ["gunbatimi", "daglar"],
  },
  2: { // Salı
    emoji: "🌿", baslik: "gvB2",
    aciklama: "gvA2",
    ayetler: [{ s: 2, a: 153, sName: "Bakara" }, { s: 3, a: 139, sName: "Âl-i İmrân" }],
    kategoriler: ["orman", "cicekler"],
  },
  3: { // Çarşamba
    emoji: "💧", baslik: "gvB3",
    aciklama: "gvA3",
    ayetler: [{ s: 39, a: 53, sName: "Zümer" }],
    kategoriler: ["deniz", "selale"],
  },
  4: { // Perşembe
    emoji: "🤍", baslik: "gvB4",
    aciklama: "gvA4",
    ayetler: [{ s: 33, a: 56, sName: "Ahzâb" }],
    kategoriler: ["gece", "yildizlar"],
  },
  5: { // Cuma
    emoji: "🕌", baslik: "gvB5",
    aciklama: "gvA5",
    ayetler: [{ s: 62, a: 9, sName: "Cuma" }, { s: 18, a: 10, sName: "Kehf" }],
    kategoriler: ["cami", "musaf"],
  },
  6: { // Cumartesi
    emoji: "🌊", baslik: "gvB6",
    aciklama: "gvA6",
    ayetler: [{ s: 13, a: 28, sName: "Ra'd" }],
    kategoriler: ["deniz", "gol"],
  },
  0: { // Pazar
    emoji: "✨", baslik: "gvB0",
    aciklama: "gvA0",
    ayetler: [{ s: 112, a: 1, sName: "İhlâs" }, { s: 103, a: 1, sName: "Asr" }],
    kategoriler: ["yildizlar", "gece"],
  },
};

// ── Mübarek günler — Hicri "ay-gün" anahtarlı (Umm al-Qura) ──
export const MUBAREK_GUNLER: Array<GununVideoKarti & { anahtar: string }> = [
  { anahtar: "9-27", emoji: "🌙", baslik: "gvBKadir", aciklama: "gvAKadir", ayetler: [{ s: 97, a: 1, sName: "Kadr" }], kategoriler: ["gece", "yildizlar"] },
  { anahtar: "10-1", emoji: "🎉", baslik: "gvBRamazan", aciklama: "gvARamazan", ayetler: [{ s: 110, a: 1, sName: "Nasr" }], kategoriler: ["cennet", "cicekler"] },
  { anahtar: "12-9", emoji: "🤲", baslik: "gvBArefe", aciklama: "gvAArefe", ayetler: [{ s: 2, a: 201, sName: "Bakara" }], kategoriler: ["daglar", "gunbatimi"] },
  { anahtar: "12-10", emoji: "🕋", baslik: "gvBKurban", aciklama: "gvAKurban", ayetler: [{ s: 108, a: 1, sName: "Kevser" }], kategoriler: ["cennet", "cami"] },
  { anahtar: "3-12", emoji: "🌹", baslik: "gvBMevlid", aciklama: "gvAMevlid", ayetler: [{ s: 21, a: 107, sName: "Enbiyâ" }], kategoriler: ["cami", "gece"] },
  { anahtar: "8-15", emoji: "🤍", baslik: "gvBBerat", aciklama: "gvABerat", ayetler: [{ s: 39, a: 53, sName: "Zümer" }], kategoriler: ["gece", "bulut"] },
  { anahtar: "1-10", emoji: "💧", baslik: "gvBAsure", aciklama: "gvAAsure", ayetler: [{ s: 2, a: 50, sName: "Bakara" }], kategoriler: ["deniz", "col"] },
  { anahtar: "1-1", emoji: "🌅", baslik: "gvBHicri", aciklama: "gvAHicri", ayetler: [{ s: 9, a: 40, sName: "Tövbe" }], kategoriler: ["daglar", "gunbatimi"] },
  { anahtar: "7-27", emoji: "🌠", baslik: "gvBMirac", aciklama: "gvAMirac", ayetler: [{ s: 17, a: 1, sName: "İsrâ" }], kategoriler: ["yildizlar", "gece"] },
];

/** Bugünün kartını bulur: önce mübarek gün (Hicri), yoksa hafta günü. */
export function gununVideosunuBul(now: Date = new Date()): { kart: GununVideoKarti; ozelMi: boolean } {
  let hicriAnahtar = "";
  try {
    const parcalar = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric", day: "numeric" }).formatToParts(now);
    const ay = parcalar.find((p) => p.type === "month")?.value ?? "";
    const gn = parcalar.find((p) => p.type === "day")?.value ?? "";
    if (ay && gn) hicriAnahtar = `${Number(ay)}-${Number(gn)}`;
  } catch { /* Intl hicri desteklenmiyorsa hafta günü ile devam */ }
  const ozel = MUBAREK_GUNLER.find((m) => m.anahtar === hicriAnahtar);
  if (ozel) return { kart: ozel, ozelMi: true };
  return { kart: HAFTA_GUNLERI[now.getDay()] ?? HAFTA_GUNLERI[5], ozelMi: false };
}
