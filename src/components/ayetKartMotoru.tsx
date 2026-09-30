// ════════════════════════════════════════════════════════
// AYETKARTMOTORU.TSX — Ayet kartı motor parçaları
// AyetKartlariModal.tsx'den ayrıldı (SRP adım 7, 30.09)
// Bg havuzu · Akıllı seçim · Mood renkleri · Canvas kart çizici
// ════════════════════════════════════════════════════════

import { type AyetKarti } from "../data/ayetKartlariData";
import { CATEGORIES, CATEGORY_PALETTE, TEMPLATE_CLIPS } from "../clips";
import { ADMIN_ATMOSPHERE_CATEGORIES } from "../adminAtmosphereCategories";
import { ADMIN_TEMPLATE_CLIPS } from "../adminMediaManifest";
import { CanvasDoldurucu, cubukRengi, drawMesajYazisi, VARSAYILAN_CUBUK, VARSAYILAN_MESAJ, type CubukAyar, type MesajAyar } from "../studio/mesajKatmani";

export interface BgItem {
  id: string;
  label: string;
  cat: string;
  src: string;
}

// ─── ARKA PLAN HAVUZU — yüzlerce görsel, doğrudan CDN ─────────
// TEMPLATE_CLIPS: kod kategorilerinin R2 posterleri (cdn/posters/...)
// ADMIN_TEMPLATE_CLIPS: admin kategorilerinin R2 şablonları (cdn/templates/...)
export const BACKGROUNDS: BgItem[] = [
  ...TEMPLATE_CLIPS.map((c) => ({ id: c.id, label: c.label, cat: c.cat as string, src: c.src })),
  ...ADMIN_TEMPLATE_CLIPS.map((c) => ({ id: c.id, label: c.label, cat: c.cat as string, src: c.src })),
];

export const catLabel = (cat: string): string =>
  CATEGORIES.find((c) => c.id === cat)?.label ??
  ADMIN_ATMOSPHERE_CATEGORIES.find((c) => c.id === cat)?.label ??
  cat;

export const BG_CATS: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const bg of BACKGROUNDS) {
    if (!seen.has(bg.cat)) { seen.add(bg.cat); out.push(bg.cat); }
  }
  return out;
})();

// ════════════════════════════════════════════════════════
// 🎯 AKILLI SEÇ — ayetin duygu/konuşma kelimelerine göre en uygun
// arka plan kategorisini seçen hafif eşleştirme motoru.
// Kullanıcı tek tuş basar: hem ayet hem arka plan kendiliğinden seçilir.
// ════════════════════════════════════════════════════════
const AKILLI_KURALLAR: Array<{ kelimeler: string[]; bgAnahtar: string[] }> = [
  { kelimeler: ["kâbe", "kabe", "hac", "umre", "beyt", "mescid", "namaz", "secde", "kıble", "kible"], bgAnahtar: ["namaz", "kâbe", "kabe"] },
  { kelimeler: ["kur'an", "kuran", "kitap", "mushaf", "zikr", "okuma", "oku", "yazı", "yazi", "kalem"], bgAnahtar: ["kur'an", "kuran", "kalem"] },
  { kelimeler: ["deniz", "dalga", "su", "nehir", "ırmak", "irmak", "pınar", "pinar", "yağmur", "yagmur"], bgAnahtar: ["deniz", "göl", "gol", "şelale", "selale"] },
  { kelimeler: ["gece", "gündüz", "gunduz", "ay", "yıldız", "yildiz", "gökyüzü", "gokyuzu", "güneş", "gunes", "fener"], bgAnahtar: ["gece", "yıldız", "yildiz", "ay"] },
  { kelimeler: ["tohum", "filiz", "ağaç", "agac", "bahçe", "bahce", "zeytin", "incir", "yemiş", "yemis", "meyve", "tarla", "hasat"], bgAnahtar: ["bahçe", "bahce", "orman", "doğa", "doga", "çiçek", "cicek"] },
  { kelimeler: ["dağ", "dag", "zirve", "kaya", "mağara", "magara", "yol", "yıldırım", "yildirim"], bgAnahtar: ["dağ", "dag", "zorlu"] },
  { kelimeler: ["ateş", "ates", "cehennem", "azap", "savaş", "savas", "kıyamet", "kiyamet", "dünya", "dunya"], bgAnahtar: ["gün batımı", "gun batimi", "dramatik", "gökyüzü", "gokyuzu"] },
  { kelimeler: ["anne", "baba", "eş", "es", "çocuk", "cocuk", "yuva", "ev", "merhamet", "kalp"], bgAnahtar: ["çiçek", "cicek", "bahçe", "bahce", "sakin"] },
];

export const akilliBgSec = (ayet: AyetKarti | undefined, havuz: BgItem[]): BgItem | null => {
  if (!havuz.length) return null;
  const metin = `${ayet?.title ?? ""} ${ayet?.tr ?? ""} ${ayet?.source ?? ""}`.toLocaleLowerCase("tr");
  const catTurkce = (cat: string) => catLabel(cat).toLocaleLowerCase("tr");
  for (const kural of AKILLI_KURALLAR) {
    if (kural.kelimeler.some((kel) => metin.includes(kel))) {
      const uygun = havuz.filter((b) => kural.bgAnahtar.some((anahtar) => catTurkce(b.cat).includes(anahtar) || b.label.toLocaleLowerCase("tr").includes(anahtar)));
      if (uygun.length) return uygun[Math.floor(Math.random() * uygun.length)];
    }
  }
  // Duygu fallback'i: huzur/rahmet → sakin görseller, zafer → dramatik gökyüzü, imtihan → dağ
  const moodBg: Record<string, string[]> = {
    huzur: ["göl", "gol", "sakin", "orman"], sabir: ["dağ", "dag", "ağaç", "agac"], sukur: ["çiçek", "cicek", "bahçe", "bahce"],
    tevekkul: ["yıldız", "yildiz", "gece"], rahmet: ["yağmur", "yagmur", "şelale", "selale", "deniz"], sevgi: ["çiçek", "cicek", "gül"],
    zafer: ["gün batımı", "gun batimi", "gökyüzü", "gokyuzu"], af: ["gökyüzü", "gokyuzu", "yıldız", "yildiz"], imtihan: ["dağ", "dag", "fırtına", "firtina"],
    cennet: ["bahçe", "bahce", "cennet", "pınar", "pinar"], ilim: ["kalem", "mushaf", "kur'an", "kuran"], aile: ["çiçek", "cicek", "bahçe", "bahce"],
  };
  const anahtarlar = ayet ? (moodBg[ayet.mood] ?? []) : [];
  const uygun = havuz.filter((b) => anahtarlar.some((anahtar) => catTurkce(b.cat).includes(anahtar) || b.label.toLocaleLowerCase("tr").includes(anahtar)));
  if (uygun.length) return uygun[Math.floor(Math.random() * uygun.length)];
  return havuz[Math.floor(Math.random() * havuz.length)];
};

export const MOOD_COLORS: Record<AyetKarti["mood"], string> = {
  huzur: "#a5b4fc",
  sabir: "#4ade80",
  sukur: "#f5dda6",
  tevekkul: "#67e8f9",
  rahmet: "#7dd3fc",
  sevgi: "#f9a8d4",
  zafer: "#fbbf24",
  af: "#c4b5fd",
  imtihan: "#fca5a5",
  cennet: "#86efac",
  ilim: "#93c5fd",
  aile: "#fda4af",
};

// ════════════════════════════════════════════════════════
// KART ÇİZİCİ — önizleme ve indirme aynı fonksiyonu kullanır
// ════════════════════════════════════════════════════════

export function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

// ── Kart görsel ayarları — kullanıcı kontrollü ────────────────
export interface KartAyarlari {
  karartma: number;      // 0–100 (varsayılan 38)
  yaziOlcek: number;     // 70–140 (100 = standart)
  arUstte: boolean;      // true: Arapça üstte, false: meal üstte
  konum: "ust" | "orta" | "alt";   // metin bloğu dikey konumu
  hizalama: "sol" | "orta" | "sag"; // metin hizalaması
  /** ★ RENK ÇUBUĞU (01.10) — stüdyo ile aynı çekirdek (mesajKatmani.ts) */
  cubuk: CubukAyar;
  /** ★ ÖZEL YAZI (01.10) — kartın içine çizilen kullanıcı mesajı */
  mesaj: MesajAyar;
}

export const VARSAYILAN_AYARLAR: KartAyarlari = {
  karartma: 38,
  yaziOlcek: 100,
  arUstte: true,
  konum: "orta",
  hizalama: "orta",
  cubuk: VARSAYILAN_CUBUK,
  mesaj: VARSAYILAN_MESAJ,
};

export async function drawCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ayet: AyetKarti,
  bg: BgItem | null,
  img: HTMLImageElement | null,
  ayar: KartAyarlari = VARSAYILAN_AYARLAR,
): Promise<void> {
  // 1) Kategori renk paleti + fotoğraf (cover)
  const pal = bg ? (CATEGORY_PALETTE as Record<string, { primary: string; secondary: string; glow: string; bg: string; bg2: string }>)[bg.cat] : null;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, pal?.bg2 ?? "#1a1d2e");
  g.addColorStop(1, pal?.bg ?? "#0c0d12");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  // 2) Sinematik karartma — kullanıcı ayarlı (0 = hiç karartma, 100 = tam siyah)
  const k = Math.max(0, Math.min(100, ayar.karartma)) / 100;
  const base = 0.10 + k * 0.55;   // üst: 0.10–0.65
  const mid = 0.14 + k * 0.60;    // orta: 0.14–0.74
  const bot = 0.30 + k * 0.60;    // alt: 0.30–0.90
  const ov = ctx.createLinearGradient(0, 0, 0, h);
  ov.addColorStop(0, `rgba(5,4,10,${base.toFixed(2)})`);
  ov.addColorStop(0.45, `rgba(5,4,10,${mid.toFixed(2)})`);
  ov.addColorStop(1, `rgba(5,4,10,${Math.min(0.95, bot).toFixed(2)})`);
  ctx.fillStyle = ov;
  ctx.fillRect(0, 0, w, h);

  // 3) İnce altın çerçeve
  ctx.strokeStyle = "rgba(215,170,82,.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, w - 44, h - 44);
  ctx.strokeStyle = "rgba(215,170,82,.20)";
  ctx.lineWidth = 1;
  ctx.strokeRect(31, 31, w - 62, h - 62);

  // 4) Üst süs
  ctx.textAlign = "center";
  ctx.direction = "ltr";
  ctx.fillStyle = "rgba(245,221,166,.9)";
  ctx.font = `400 ${Math.round(w * 0.024)}px Inter, sans-serif`;
  ctx.shadowColor = "rgba(0,0,0,.6)";
  ctx.shadowBlur = 8;
  ctx.fillText("✦   ✦   ✦", w / 2, Math.round(h * 0.082));
  ctx.shadowBlur = 0;

  // 5) Metin bloğu — sığana kadar font küçülür; kullanıcı ayarları uygulanır
  const innerW = w - Math.round(w * 0.15);
  const top = Math.round(h * 0.125);
  const bottom = Math.round(h * 0.80);
  const avail = bottom - top;
  const olcek = Math.max(70, Math.min(140, ayar.yaziOlcek)) / 100;

  const arSegments = ayet.ar.split("\n").filter((s) => s.trim().length > 0);
  const GAP = Math.round(h * 0.035);
  let arSize = Math.round(w * 0.05 * olcek);   // 1080'de 54px @ %100
  let mSize = Math.round(w * 0.028 * olcek);   // 1080'de ~30px @ %100
  let arLines: string[] = [];
  let mLines: string[] = [];
  let arLH = 0;
  let mLH = 0;
  let totalH = 0;

  for (let guard = 0; guard < 60; guard++) {
    ctx.font = `700 ${arSize}px Amiri, 'Traditional Arabic', serif`;
    arLines = [];
    for (const seg of arSegments) arLines.push(...wrapCanvasText(ctx, seg, innerW));
    arLH = Math.round(arSize * 1.85);
    ctx.font = `600 ${mSize}px Inter, sans-serif`;
    mLines = wrapCanvasText(ctx, ayet.tr, innerW);
    mLH = Math.round(mSize * 1.6);
    totalH = arLines.length * arLH + (mLines.length ? GAP + mLines.length * mLH : 0);
    if (totalH <= avail) break;
    if (arSize > Math.round(w * 0.024)) arSize -= 2;
    else if (mSize > Math.round(w * 0.018)) mSize -= 1;
    else break;
  }

  // Dikey konum: üst / orta / alt
  const bosluk = Math.max(0, avail - totalH);
  let baslangic = top;
  if (ayar.konum === "orta") baslangic = top + bosluk / 2;
  else if (ayar.konum === "alt") baslangic = top + bosluk;

  // Yatay hizalama
  const txX = ayar.hizalama === "sol" ? w * 0.14 : ayar.hizalama === "sag" ? w * 0.86 : w / 2;
  ctx.textAlign = ayar.hizalama === "sol" ? "left" : ayar.hizalama === "sag" ? "right" : "center";

  // ── Sıra: ayara göre Arapça üstte mi meal üstte mi ──
  // ★ RENK ÇUBUĞU (01.10): acik → Arapça #f5dda6 yerine çubuk rengi;
  //   meal rgba(255,255,255,.92) yerine BAĞIMSIZ çubuk rengi (stüdyo ile aynı çekirdek).
  const cubukOn = ayar.cubuk?.acik === true;
  const arRenk = cubukOn ? cubukRengi(ayar.cubuk.donme) : "#f5dda6";
  const mealRenk = cubukOn ? cubukRengi(ayar.cubuk.mealDonme) : "rgba(255,255,255,.92)";
  const drawArabic = () => {
    let yy = baslangic + Math.round(arLH * 0.72);
    ctx.direction = "rtl";
    ctx.font = `700 ${arSize}px Amiri, 'Traditional Arabic', serif`;
    ctx.fillStyle = arRenk;
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
    for (const line of arLines) { ctx.fillText(line, txX, yy); yy += arLH; }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    return yy;
  };
  const drawMeal = (startY: number) => {
    let yy = startY + GAP;
    ctx.direction = "ltr";
    ctx.font = `600 ${mSize}px Inter, sans-serif`;
    ctx.fillStyle = mealRenk;
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
    for (const line of mLines) { ctx.fillText(line, txX, yy); yy += mLH; }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    return yy;
  };

  if (ayar.arUstte) {
    const yy = drawArabic();
    if (mLines.length) drawMeal(yy);
  } else {
    let yy = baslangic + Math.round(mLH * 0.8);
    ctx.direction = "ltr";
    ctx.font = `600 ${mSize}px Inter, sans-serif`;
    ctx.fillStyle = mealRenk;
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
    for (const line of mLines) { ctx.fillText(line, txX, yy); yy += mLH; }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    yy += GAP;
    ctx.direction = "rtl";
    ctx.font = `700 ${arSize}px Amiri, 'Traditional Arabic', serif`;
    ctx.fillStyle = arRenk;
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
    for (const line of arLines) { ctx.fillText(line, txX, yy); yy += arLH; }
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  }

  ctx.textAlign = "center"; // kaynak & imza hep ortalı

  // 6) Kaynak + imza
  ctx.direction = "ltr";
  ctx.font = `700 ${Math.round(w * 0.024)}px Inter, sans-serif`;
  ctx.fillStyle = "#d7aa52";
  ctx.shadowColor = "rgba(0,0,0,.7)";
  ctx.shadowBlur = 10;
  ctx.fillText(`— ${ayet.source} —`, w / 2, Math.round(h * 0.872));

  // ★ RENK ÇUBUĞU ŞERİDİ (01.10) — çerçevenin iç kenarı; imzadan önce, metinlerin altında
  new CanvasDoldurucu().cubukCiz(ctx, w, h, ayar.cubuk ?? VARSAYILAN_CUBUK);

  // ★ ÖZEL YAZI (01.10) — kartın içine çizilen mesaj (üst katman)
  drawMesajYazisi(ctx, w, h, ayar.mesaj ?? VARSAYILAN_MESAJ, (text, maxW) => wrapCanvasText(ctx, text, maxW));

  ctx.font = `500 ${Math.round(w * 0.018)}px Inter, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,.38)";
  ctx.fillText("nurstudyo.com", w / 2, Math.round(h * 0.928));
  ctx.shadowBlur = 0;
}
