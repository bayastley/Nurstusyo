// ════════════════════════════════════════════════════════
// STUDIO CONSTANTS — StudioApp.tsx'den ayrıldı
// Sabit listeler: CATEGORY_ICONS, MODES, ASPECTS, PRAYERS,
// KEYWORD_CATEGORY_FALLBACK, SURAH_CATEGORY_HINT,
// ARABIC_FONTS, SHIMMER_STYLES, CINE_FILTERS
// ════════════════════════════════════════════════════════

import {
  BookOpen, Building2, Cloud, CloudLightning, Droplets, Flame,
  Flower2, FolderUp, Footprints, Landmark, Mountain, MoonStar,
  Palmtree, Sailboat, Shapes, Snowflake, Sparkles, Sun, Sunset,
  Tablet, TreePalm, Bug, Trees, Waves,
  type LucideIcon,
} from "lucide-react";
import type { CatId } from "../clips";
import type { Mode, Aspect } from "../types";

export const CATEGORY_ICONS: Record<CatId, LucideIcon> = {
  yuklenenler: FolderUp, namaz: Landmark, musaf: BookOpen,
  cicekler: Flower2, yildizlar: Sparkles, cennet: Palmtree,
  deniz: Waves, daglar: Mountain, gunbatimi: Sunset, gece: MoonStar,
  selale: Droplets, orman: Trees, col: Sun, kar: Snowflake,
  sehir: Building2, cami: Landmark, desen: Shapes, gol: Sailboat,
  bulut: Cloud, ates: Flame, cehennem: CloudLightning,
  hurma: TreePalm, ari: Bug, karinca: Footprints,
};

export const DEFAULT_MASTER_SURUM = false;
export const RENDER_AUTH_LIVE =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_PAYMENTS_LIVE ?? "false") === "true";
export const SERVER_BAN_LIVE = RENDER_AUTH_LIVE;

export const MODES: Array<{ id: Mode; label: string; sub: string; icon: React.ElementType }> = [
  { id: "short", label: "Kısa", sub: "59 sn", icon: Sparkles },
  { id: "long", label: "Uzun", sub: "150 sn", icon: Sparkles },
  { id: "full", label: "Tam", sub: "40 dk'ya kadar", icon: Sparkles },
];

export const ASPECTS: Array<{ id: Aspect; label: string; sub?: string; icon: React.ElementType }> = [
  { id: "9:16", label: "9:16", sub: "Reel", icon: Sparkles },
  { id: "16:9", label: "16:9", sub: "YouTube", icon: Sparkles },
  { id: "1:1", label: "1:1", sub: "Kare", icon: Sparkles },
  { id: "4:5", label: "4:5", sub: "Portre", icon: Tablet },
];

export const PRAYERS: Array<[string, string]> = [
  ["İmsak", "Fajr"], ["Güneş", "Sunrise"], ["Öğle", "Dhuhr"],
  ["İkindi", "Asr"], ["Akşam", "Maghrib"], ["Yatsı", "Isha"],
];

export const KEYWORD_CATEGORY_FALLBACK: Record<string, CatId> = {
  seccade: "namaz", tavaf: "namaz", hira: "namaz", umre: "namaz", muezzin: "namaz", ibadet: "namaz",
  namaz: "namaz", secde: "namaz", kıyam: "namaz", rüku: "namaz", maun: "namaz", cami: "namaz", mescit: "namaz", mihrab: "namaz",
  ateş: "ates", alev: "ates", köz: "ates", yanan: "ates", yanıyor: "ates", yangın: "ates", tutuşan: "ates", kıvılcım: "ates", odun: "ates", şömine: "ates",
  cehennem: "cehennem", azap: "cehennem", kaynar: "cehennem", irin: "cehennem", zakkum: "cehennem",
  hurma: "hurma", vaha: "hurma", dal: "hurma", salkım: "hurma",
  arı: "ari", bal: "ari", nahl: "ari", kovan: "ari", petek: "ari",
  karınca: "karinca", sürü: "karinca",
  kurban: "col", çöl: "col", deve: "col", koyun: "col", duman: "col",
  kevser: "deniz", su: "deniz", nehir: "deniz", deniz: "deniz", pınar: "deniz", havuz: "deniz", ırmak: "deniz", balık: "deniz", gemi: "deniz", dalga: "deniz",
  cennet: "cennet", bahçe: "cennet", meyve: "cennet", şurub: "cennet", zeytin: "cennet", üzüm: "cennet", incir: "cennet", nar: "cennet",
  gül: "cicekler", lale: "cicekler", çiçek: "cicekler", sümbül: "cicekler", zambak: "cicekler",
  yıldız: "yildizlar", gök: "yildizlar", sema: "yildizlar", kamer: "yildizlar", ay: "yildizlar", gezegen: "yildizlar",
  yayla: "daglar", dağ: "daglar", zirve: "daglar", kaya: "daglar",
  orman: "orman", ağaç: "orman", yaprak: "orman", yeşillik: "orman",
  şafak: "gunbatimi", güneş: "gunbatimi", aydınlan: "gunbatimi", fecr: "gunbatimi",
  kar: "kar", buz: "kar", kış: "kar",
  kubbe: "cami", fener: "cami",
  medeniyet: "sehir", şehir: "sehir", belde: "sehir", kavim: "sehir", ev: "sehir",
  desen: "desen", geometrik: "desen", tasavvuf: "desen",
  bulut: "bulut", gökkubbe: "bulut",
  göl: "gol", durgun: "gol", sakin: "gol", latif: "gol",
};

export const SURAH_CATEGORY_HINT: Record<string, CatId> = {
  "nahl": "ari", "yasin": "yildizlar", "rahman": "cennet", "mulk": "yildizlar",
  "maun": "namaz", "tevbe": "cehennem", "bakara": "musaf", "fil": "sehir",
  "kevser": "deniz", "nur": "musaf", "duha": "gunbatimi", "asr": "gunbatimi",
  "tin": "hurma", "mutaffifin": "cehennem", "meryem": "hurma",
};

export const ARABIC_FONTS: Array<{ id: string; label: string; css: string }> = [
  { id: "amiri", label: "Amiri (Klasik Hat)", css: "Amiri, serif" },
  { id: "scheherazade", label: "Scheherazade (Kur'an)", css: "'Scheherazade New', serif" },
  { id: "lateef", label: "Lateef (İnce Zarif)", css: "Lateef, serif" },
  { id: "reemkufi", label: "Reem Kufi (Modern)", css: "'Reem Kufi', sans-serif" },
  { id: "arefruqaa", label: "Aref Ruqaa (Rika Hat)", css: "'Aref Ruqaa', serif" },
];

export const SHIMMER_STYLES: Array<{ id: string; label: string; c1: string; c2: string; glow: string; still?: boolean }> = [
  { id: "altin", label: "Altın Işıltı", c1: "#f5dda6", c2: "#d7aa52", glow: "rgba(215,170,82,.55)" },
  { id: "gumus", label: "Gümüş Işıltı", c1: "#f1f5f9", c2: "#94a3b8", glow: "rgba(203,213,225,.5)" },
  { id: "zumrut", label: "Zümrüt Işıltı", c1: "#a7f3d0", c2: "#10b981", glow: "rgba(16,185,129,.55)" },
  { id: "safir", label: "Safir Işıltı", c1: "#bfdbfe", c2: "#3b82f6", glow: "rgba(59,130,246,.55)" },
  { id: "yakut", label: "Yakut Işıltı", c1: "#fecaca", c2: "#ef4444", glow: "rgba(239,68,68,.55)" },
  { id: "ametist", label: "Ametist Işıltı", c1: "#e9d5ff", c2: "#a855f7", glow: "rgba(168,85,247,.55)" },
  { id: "gulkurusu", label: "Gül Kurusu Işıltı", c1: "#fecdd3", c2: "#e11d48", glow: "rgba(225,29,72,.5)" },
  { id: "duz", label: "Düz Beyaz (Işıltısız)", c1: "#ffffff", c2: "#ffffff", glow: "rgba(255,255,255,.35)", still: true },
];

export const CINE_FILTERS: Array<{ id: string; label: string; css: string; tint?: string; tintAlpha?: number }> = [
  { id: "orijinal", label: "Orijinal", css: "none" },
  { id: "nur", label: "Nur (Sıcak Altın)", css: "sepia(.28) saturate(1.35) brightness(1.06) contrast(1.05)", tint: "#d7aa52", tintAlpha: 0.10 },
  { id: "huzur", label: "Huzur (Sinematik)", css: "saturate(.88) brightness(.96) contrast(1.12)", tint: "#1a4a52", tintAlpha: 0.14 },
  { id: "gece", label: "Gece (Koyu Mavi)", css: "brightness(.82) saturate(.85)", tint: "#0a1430", tintAlpha: 0.22 },
  { id: "zumrut", label: "Zümrüt", css: "saturate(1.25) contrast(1.05)", tint: "#0a3d2a", tintAlpha: 0.16 },
  { id: "altinsaat", label: "Altın Saat", css: "sepia(.42) saturate(1.45) brightness(1.08)", tint: "#ff9048", tintAlpha: 0.10 },
  { id: "kabe", label: "Kâbe Vurgulu", css: "contrast(1.18) saturate(1.1) sepia(.12)", tint: "#d7aa52", tintAlpha: 0.06 },
  { id: "siyahbeyaz", label: "Siyah Beyaz", css: "grayscale(1) contrast(1.12) brightness(.98)" },
];
