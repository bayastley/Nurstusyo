// ════════════════════════════════════════════════════════
// CLIPS.TS — Nûr Stüdyo Video Kütüphanesi
// Klip ham verileri (Row dizileri) → clips-data.ts dosyasında
// ════════════════════════════════════════════════════════

import {
  type Row,
  NAMAZ_DATA, MUSAF_DATA, CICEKLER_DATA, YILDIZLAR_DATA, DENIZ_DATA,
  GUNBATIMI_DATA, GECE_DATA, SELALE_DATA, ORMAN_DATA, COL_DATA,
  KAR_DATA, SEHIR_DATA, CAMI_DATA, DESEN_DATA, GOL_DATA, BULUT_DATA,
  CENNET_DATA, DAGLAR_DATA,
} from "./clips-data";

export type CatId =
  | "yuklenenler" | "namaz"  | "musaf"    | "cicekler"
  | "yildizlar"  | "cennet" | "deniz"    | "daglar"
  | "gunbatimi"  | "gece"   | "selale"   | "orman"
  | "col"        | "kar"    | "sehir"    | "cami"
  | "desen"      | "gol"    | "bulut"
  | "ates"       | "cehennem" | "hurma"  | "ari" | "karinca";

export interface Clip {
  id: string;
  label: string;
  cat: CatId;
  kind: "img" | "vid";
  src: string;
  poster?: string;
  pexelsId?: number;
  r2?: string;
  r2Poster?: string;
}

export const R2_BASE = "https://nurstudyo.com";

export const CATEGORIES: Array<{ id: CatId; label: string }> = [
  { id: "yuklenenler", label: "📁 Yüklediklerim" },
  // FREE (12)
  { id: "namaz",       label: "🕌 Namaz & Kâbe" },
  { id: "musaf",       label: "📖 Kur'an & Mushaf" },
  { id: "cicekler",    label: "🌸 Çiçekler & Güller" },
  { id: "yildizlar",   label: "✨ Yıldızlar & Uzay" },
  { id: "deniz",       label: "🌊 Deniz & Dalgalar" },
  { id: "gunbatimi",   label: "🌅 Gün Batımı" },
  { id: "gece",        label: "🌙 Gece & Ay" },
  { id: "orman",       label: "🌲 Orman & Yeşil" },
  { id: "cami",        label: "🕌 İslam Mimarisi" },
  { id: "gol",         label: "🏞️ Sakin Göl" },
  { id: "bulut",       label: "☁️ Bulutlar" },
  { id: "desen",       label: "🔷 Geometrik Desen" },
  // PRO (4)
  { id: "selale",      label: "💧 Şelaleler" },
  { id: "daglar",      label: "🏔️ Dağlar & Zirve" },
  { id: "kar",         label: "❄️ Kar & Buz" },
  { id: "sehir",       label: "🏙️ Medeniyet & Şehir" },
  // ELİT (3 aktif)
  { id: "cennet",      label: "🌿 Cennet Bahçeleri" },
  { id: "col",         label: "🏜️ Çöl & Kum" },
  { id: "ates",        label: "🔥 Ateş & Alev" },
  // HARD LOCKED
  { id: "cehennem",    label: "⚡ Cehennem & Karanlık" },
  { id: "hurma",       label: "🌴 Hurma & Vaha" },
  { id: "ari",         label: "🐝 Arı & Bal" },
  { id: "karinca",     label: "🐜 Karınca & Mikro" },
];

export const ACTIVE_CATEGORIES: CatId[] = [
  "namaz", "musaf", "cicekler", "yildizlar", "deniz",
  "gunbatimi", "gece", "orman",
  "selale", "daglar", "kar", "sehir",
  "cennet", "col", "ates",
  "cami", "gol", "bulut", "desen",
];

export const KATEGORI_TIER: Record<string, "free" | "pro" | "elit"> = {
  namaz: "free", musaf: "free", cicekler: "free", yildizlar: "free", deniz: "free",
  gunbatimi: "free", gece: "free", orman: "free",
  cami: "free", gol: "free", bulut: "free", desen: "free",
  selale: "pro", daglar: "pro", kar: "pro", sehir: "pro",
  cennet: "elit", col: "elit", ates: "elit",
  yuklenenler: "elit", ari: "elit", cehennem: "elit", hurma: "elit", karinca: "elit",
};

export const HARD_LOCKED_CATEGORIES: CatId[] = [
  "yuklenenler",
  "cehennem", "hurma", "ari", "karinca",
];

export const FREE_VIDEOS_PER_CATEGORY = 10;

export const CATEGORY_PALETTE: Record<CatId, { primary: string; secondary: string; glow: string; bg: string; bg2: string }> = {
  namaz:     { primary: "#d7aa52", secondary: "#f5dda6", glow: "#ffcf6b", bg: "#1a0e05", bg2: "#3a2410" },
  musaf:     { primary: "#c9a24a", secondary: "#f3e2a8", glow: "#e8c46a", bg: "#140a18", bg2: "#2a1838" },
  cicekler:  { primary: "#ec4899", secondary: "#fbcfe8", glow: "#f472b6", bg: "#1a0612", bg2: "#3a1028" },
  yildizlar: { primary: "#818cf8", secondary: "#c7d2fe", glow: "#a5b4fc", bg: "#060818", bg2: "#141838" },
  cennet:    { primary: "#34d399", secondary: "#a7f3d0", glow: "#6ee7b7", bg: "#04140c", bg2: "#0a3020" },
  deniz:     { primary: "#22d3ee", secondary: "#a5f3fc", glow: "#67e8f9", bg: "#04141a", bg2: "#0a3040" },
  daglar:    { primary: "#94a3b8", secondary: "#e2e8f0", glow: "#cbd5e1", bg: "#0a1018", bg2: "#1a2838" },
  gunbatimi: { primary: "#fb923c", secondary: "#fed7aa", glow: "#fdba74", bg: "#1a0a04", bg2: "#3a1808" },
  gece:      { primary: "#6366f1", secondary: "#c7d2fe", glow: "#818cf8", bg: "#04040f", bg2: "#0e0e28" },
  selale:    { primary: "#06b6d4", secondary: "#a5f3fc", glow: "#22d3ee", bg: "#041418", bg2: "#0a3038" },
  orman:     { primary: "#22c55e", secondary: "#bbf7d0", glow: "#4ade80", bg: "#04140a", bg2: "#0a3018" },
  col:       { primary: "#ef4444", secondary: "#fecaca", glow: "#f87171", bg: "#1a0604", bg2: "#3a1008" },
  kar:       { primary: "#bae6fd", secondary: "#f0f9ff", glow: "#e0f2fe", bg: "#0a1420", bg2: "#1a2838" },
  sehir:     { primary: "#f59e0b", secondary: "#fde68a", glow: "#fbbf24", bg: "#14100a", bg2: "#2a2010" },
  cami:      { primary: "#d7aa52", secondary: "#f5dda6", glow: "#ffcf6b", bg: "#140a18", bg2: "#2a1838" },
  desen:     { primary: "#a855f7", secondary: "#e9d5ff", glow: "#c084fc", bg: "#10061a", bg2: "#241038" },
  gol:       { primary: "#14b8a6", secondary: "#99f6e4", glow: "#2dd4bf", bg: "#041414", bg2: "#0a3030" },
  bulut:     { primary: "#93c5fd", secondary: "#dbeafe", glow: "#bfdbfe", bg: "#0a1018", bg2: "#1a2438" },
  yuklenenler:{ primary: "#d7aa52", secondary: "#f5dda6", glow: "#ffcf6b", bg: "#141414", bg2: "#2a2a2a" },
  ates:      { primary: "#f97316", secondary: "#fed7aa", glow: "#fb923c", bg: "#1c0a02", bg2: "#3d1604" },
  cehennem:  { primary: "#dc2626", secondary: "#7c2d12", glow: "#ef4444", bg: "#120202", bg2: "#2a0808" },
  hurma:     { primary: "#84cc16", secondary: "#d9f99d", glow: "#a3e635", bg: "#0c1404", bg2: "#1e2e08" },
  ari:       { primary: "#eab308", secondary: "#fef08a", glow: "#facc15", bg: "#161002", bg2: "#302404" },
  karinca:   { primary: "#a16207", secondary: "#d6c39a", glow: "#ca8a04", bg: "#120c04", bg2: "#281c08" },
};

export const CATEGORY_LOCK_LEVEL: Record<CatId, string> = {
  namaz:"Ücretsiz", musaf:"Ücretsiz", cicekler:"Ücretsiz", yildizlar:"Ücretsiz",
  deniz:"Ücretsiz", gunbatimi:"Ücretsiz", gece:"Ücretsiz", orman:"Ücretsiz",
  cami:"Ücretsiz", gol:"Ücretsiz", bulut:"Ücretsiz", desen:"Ücretsiz",
  selale:"Pro", daglar:"Pro", kar:"Pro", sehir:"Pro",
  cennet:"Elit", col:"Elit", ates:"Elit",
  yuklenenler:"V3", ari:"V2", cehennem:"V3", hurma:"V3", karinca:"V3",
};

export const TEMPLATE_CLIPS_PLACEHOLDER = true;

// ─── URL jeneratörler ─────────────────────────────────
const pv = (id: number, fps = 30) =>
  `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_${fps}fps.mp4`;
const uv = (id: number, fps = 30) =>
  `https://videos.pexels.com/video-files/${id}/${id}-uhd_3840_2160_${fps}fps.mp4`;
const thumb = (id: number) =>
  `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200`;

// ─── Clip builder ─────────────────────────────────────
const cat = (catId: CatId, rows: Row[]): Clip[] =>
  rows.map(([id, fps, uhd, label], i) => ({
    id: `${catId}-${i + 1}`,
    label,
    cat: catId,
    kind: "vid" as const,
    src: uhd ? uv(id, fps) : pv(id, fps),
    poster: thumb(id),
    pexelsId: id,
    r2: `${R2_BASE}/videos/${catId}/${id}.mp4`,
    r2Poster: `${R2_BASE}/posters/${catId}/${id}.jpg`,
  }));

// ─── Tüm klipleri derle ───────────────────────────────
export const MOTION_CLIPS: Clip[] = [
  ...cat("namaz",    NAMAZ_DATA),
  ...cat("musaf",    MUSAF_DATA),
  ...cat("cicekler", CICEKLER_DATA),
  ...cat("yildizlar",YILDIZLAR_DATA),
  ...cat("deniz",    DENIZ_DATA),
  ...cat("gunbatimi",GUNBATIMI_DATA),
  ...cat("gece",     GECE_DATA),
  ...cat("selale",   SELALE_DATA),
  ...cat("orman",    ORMAN_DATA),
  ...cat("col",      COL_DATA),
  ...cat("kar",      KAR_DATA),
  ...cat("sehir",    SEHIR_DATA),
  ...cat("cami",     CAMI_DATA),
  ...cat("desen",    DESEN_DATA),
  ...cat("gol",      GOL_DATA),
  ...cat("bulut",    BULUT_DATA),
  ...cat("cennet",   CENNET_DATA),
  ...cat("daglar",   DAGLAR_DATA),
];

// ─── ŞABLON (HAREKETSİZ) GERÇEK FOTOĞRAFLAR ─────────────
const TEMPLATES_PER_CATEGORY = 50;
const hiResPoster = (poster: string) => poster;
export const toHiRes = (src: string) =>
  src.replace(/fit=crop&h=630&w=1200/, "fit=crop&h=1080&w=1920");

export const TEMPLATE_CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  for (const category of CATEGORIES) {
    if (category.id === "yuklenenler") continue;
    const seen = new Set<number>();
    let n = 0;
    for (const motion of MOTION_CLIPS) {
      if (n >= TEMPLATES_PER_CATEGORY) break;
      if (motion.cat !== category.id || !motion.poster) continue;
      const m = motion.poster.match(/\/videos\/(\d+)\//);
      if (!m) continue;
      const pid = Number(m[1]);
      if (seen.has(pid)) continue;
      seen.add(pid);
      n += 1;
      out.push({
        id: `${category.id}-tpl-${n}`,
        label: motion.label,
        cat: category.id,
        kind: "img",
        src: hiResPoster(motion.poster),
      });
    }
  }
  return out;
})();

export const ALL_CLIPS: Clip[] = [...MOTION_CLIPS, ...TEMPLATE_CLIPS];

export function randomClip(kind: "img" | "vid"): Clip {
  const sameKind = ALL_CLIPS.filter((c) => c.kind === kind);
  const active = sameKind.filter((c) => ACTIVE_CATEGORIES.includes(c.cat));
  const pool = active.length ? active : sameKind;
  return pool[Math.floor(Math.random() * pool.length)] ?? sameKind[0];
}
