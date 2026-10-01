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

export interface GununVideoKarti {
  baslik: string;
  aciklama: string;
  emoji: string;
  ayetler: Array<{ s: number; a: number; sName: string }>;
  kategoriler: CatId[];
}

// ── Haftanın 7 günü (getDay(): 0=Pazar … 6=Cumartesi) ─────
export const HAFTA_GUNLERI: Record<number, GununVideoKarti> = {
  1: { // Pazartesi
    emoji: "🌱", baslik: "Yeni hafta, taze niyet",
    aciklama: "Haftanın ilk günü: niyet, hidayet ve kolaylık müjdesi.",
    ayetler: [{ s: 94, a: 6, sName: "İnşirâh" }, { s: 65, a: 3, sName: "Talâk" }],
    kategoriler: ["gunbatimi", "daglar"],
  },
  2: { // Salı
    emoji: "🌿", baslik: "Sabır ve güzellik",
    aciklama: "Sabır ve namazla yardım dileyenlerin günü.",
    ayetler: [{ s: 2, a: 153, sName: "Bakara" }, { s: 3, a: 139, sName: "Âl-i İmrân" }],
    kategoriler: ["orman", "cicekler"],
  },
  3: { // Çarşamba
    emoji: "💧", baslik: "Arınma ve rahmet",
    aciklama: "Haftanın ortası: kalbi arındırma ve rahmete açılma.",
    ayetler: [{ s: 39, a: 53, sName: "Zümer" }],
    kategoriler: ["deniz", "selale"],
  },
  4: { // Perşembe
    emoji: "🤍", baslik: "Salavat gecesi",
    aciklama: "Cuma'ya açılan kapı: salavat, istiğfar ve hazırlık.",
    ayetler: [{ s: 33, a: 56, sName: "Ahzâb" }],
    kategoriler: ["gece", "yildizlar"],
  },
  5: { // Cuma
    emoji: "🕌", baslik: "Cuma — haftanın bayramı",
    aciklama: "Cuma suresi + Kehf: mü'minin haftalık sünnet ikilisi.",
    ayetler: [{ s: 62, a: 9, sName: "Cuma" }, { s: 18, a: 10, sName: "Kehf" }],
    kategoriler: ["cami", "musaf"],
  },
  6: { // Cumartesi
    emoji: "🌊", baslik: "Huzur ve tefekkür",
    aciklama: "Tatil günü: kalbin dinlendiği zikir ve tefekkür.",
    ayetler: [{ s: 13, a: 28, sName: "Ra'd" }],
    kategoriler: ["deniz", "gol"],
  },
  0: { // Pazar
    emoji: "✨", baslik: "Haftanın özeti",
    aciklama: "Yeni haftaya hazırlık: ihlâs ve zaman bilinci.",
    ayetler: [{ s: 112, a: 1, sName: "İhlâs" }, { s: 103, a: 1, sName: "Asr" }],
    kategoriler: ["yildizlar", "gece"],
  },
};

// ── Mübarek günler — Hicri "ay-gün" anahtarlı (Umm al-Qura) ──
export const MUBAREK_GUNLER: Array<GununVideoKarti & { anahtar: string }> = [
  { anahtar: "9-27", emoji: "🌙", baslik: "Kadir Gecesi", aciklama: "Bin aydan hayırlı gece — Kur'an'ın indiği gece.", ayetler: [{ s: 97, a: 1, sName: "Kadr" }], kategoriler: ["gece", "yildizlar"] },
  { anahtar: "10-1", emoji: "🎉", baslik: "Ramazan Bayramı", aciklama: "Oruç sonrası zafer: hamd ve Allah'ın rahmeti.", ayetler: [{ s: 110, a: 1, sName: "Nasr" }], kategoriler: ["cennet", "cicekler"] },
  { anahtar: "12-9", emoji: "🤲", baslik: "Arefe", aciklama: "Hacâmın durduğu dağ; duaların kabul günü.", ayetler: [{ s: 2, a: 201, sName: "Bakara" }], kategoriler: ["daglar", "gunbatimi"] },
  { anahtar: "12-10", emoji: "🕋", baslik: "Kurban Bayramı", aciklama: "Teslimiyet ve paylaşım bayramı.", ayetler: [{ s: 108, a: 1, sName: "Kevser" }], kategoriler: ["cennet", "cami"] },
  { anahtar: "3-12", emoji: "🌹", baslik: "Mevlid Kandili", aciklama: "Âlemlere rahmet olan Peygamber'in (s.a.v.) doğum gecesi.", ayetler: [{ s: 21, a: 107, sName: "Enbiyâ" }], kategoriler: ["cami", "gece"] },
  { anahtar: "8-15", emoji: "🤍", baslik: "Berat Kandili", aciklama: "Affa erme ve rahmetten ümit kesmeme gecesi.", ayetler: [{ s: 39, a: 53, sName: "Zümer" }], kategoriler: ["gece", "bulut"] },
  { anahtar: "1-10", emoji: "💧", baslik: "Aşure", aciklama: "Denizin yarılıp kurtuluşa erildiği gün.", ayetler: [{ s: 2, a: 50, sName: "Bakara" }], kategoriler: ["deniz", "col"] },
  { anahtar: "1-1", emoji: "🌅", baslik: "Hicri Yılbaşı", aciklama: "Hicretin başlangıcı: 'Üzülme, Allah bizimle'.", ayetler: [{ s: 9, a: 40, sName: "Tövbe" }], kategoriler: ["daglar", "gunbatimi"] },
  { anahtar: "7-27", emoji: "🌠", baslik: "Miraç Kandili", aciklama: "Gece yolculuğu ve namazın hediyesi.", ayetler: [{ s: 17, a: 1, sName: "İsrâ" }], kategoriler: ["yildizlar", "gece"] },
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
