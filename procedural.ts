// ════════════════════════════════════════════════════════
// PROCEDURAL.TS — Ağsız, anında 4K kategori sahneleri.
// Her seed: farklı arketip + farklı ışık modu → 50 kartın 50'si farklı.
// İnsan figürü YOK, başka din sembolü YOK. Vektör → 4K keskin.
// ════════════════════════════════════════════════════════
import type { CatId } from "./clips";

function mulberry32(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// ─── Renk araçları: mod dönüşümü için HSL ────────────────
function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}
function hsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)); l = Math.max(0, Math.min(100, l));
  return `hsl(${h.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%)`;
}
const shift = (hex: string, dh: number, ds: number, dl: number) => {
  const [h, s, l] = hexToHsl(hex);
  return hsl(h + dh, s + ds, l + dl);
};

interface Palette { skyTop: string; skyBot: string; glow: string; layer1: string; layer2: string; layer3: string; accent: string; }

const BASE: Record<string, Palette> = {
  namaz:     { skyTop: "#2a1a08", skyBot: "#0a0604", glow: "#e8b860", layer1: "#1a1008", layer2: "#0d0805", layer3: "#050302", accent: "#f0c878" },
  musaf:     { skyTop: "#241634", skyBot: "#0a0612", glow: "#d4a85a", layer1: "#160c22", layer2: "#0c0716", layer3: "#060309", accent: "#e8c070" },
  cicekler:  { skyTop: "#3a1028", skyBot: "#120410", glow: "#f48ab0", layer1: "#240818", layer2: "#160510", layer3: "#0a0208", accent: "#ffa8c8" },
  yildizlar: { skyTop: "#0a0e28", skyBot: "#02030c", glow: "#8a9cf0", layer1: "#060818", layer2: "#04050e", layer3: "#020208", accent: "#b0c0ff" },
  cennet:    { skyTop: "#0a2818", skyBot: "#030c06", glow: "#7ae0a0", layer1: "#06180e", layer2: "#040e08", layer3: "#020604", accent: "#a0f0c0" },
  deniz:     { skyTop: "#082838", skyBot: "#020c14", glow: "#5ad0e0", layer1: "#041820", layer2: "#030e14", layer3: "#02060a", accent: "#90e8f0" },
  daglar:    { skyTop: "#1a2438", skyBot: "#060a14", glow: "#a0b8d8", layer1: "#101828", layer2: "#0a101c", layer3: "#05080e", accent: "#c8d8f0" },
  gunbatimi: { skyTop: "#4a1808", skyBot: "#140404", glow: "#ff9048", layer1: "#2a0e06", layer2: "#180804", layer3: "#0a0402", accent: "#ffb878" },
  gece:      { skyTop: "#0a0e24", skyBot: "#02030a", glow: "#c8d0f0", layer1: "#06081a", layer2: "#04050e", layer3: "#020206", accent: "#e0e8ff" },
  selale:    { skyTop: "#0a2830", skyBot: "#030c10", glow: "#a8e0e8", layer1: "#06181c", layer2: "#040e12", layer3: "#020608", accent: "#d0f0f4" },
  orman:     { skyTop: "#0c2410", skyBot: "#030a04", glow: "#88d870", layer1: "#081808", layer2: "#050e05", layer3: "#020602", accent: "#b0e898" },
  col:       { skyTop: "#4a2008", skyBot: "#160804", glow: "#ff8848", layer1: "#2e1406", layer2: "#1c0c04", layer3: "#0e0602", accent: "#ffb070" },
  kar:       { skyTop: "#1a2838", skyBot: "#080e18", glow: "#d8e8f8", layer1: "#142030", layer2: "#0e1824", layer3: "#080e14", accent: "#f0f8ff" },
  sehir:     { skyTop: "#1a1428", skyBot: "#06040e", glow: "#f0a858", layer1: "#100c1c", layer2: "#0a0714", layer3: "#05030a", accent: "#ffc878" },
  cami:      { skyTop: "#241838", skyBot: "#0a0614", glow: "#e0b868", layer1: "#160e24", layer2: "#0c0818", layer3: "#06040c", accent: "#f8d888" },
  desen:     { skyTop: "#281038", skyBot: "#0c0414", glow: "#c890f0", layer1: "#1a0824", layer2: "#100518", layer3: "#08030c", accent: "#e0b8ff" },
  gol:       { skyTop: "#0a2428", skyBot: "#030c0e", glow: "#70d8d0", layer1: "#06181a", layer2: "#040e10", layer3: "#020608", accent: "#a0ece4" },
  bulut:     { skyTop: "#1a2840", skyBot: "#080e1c", glow: "#c0d8f0", layer1: "#142030", layer2: "#0e1824", layer3: "#080e14", accent: "#e8f0ff" },
  yuklenenler: { skyTop: "#1a1a1e", skyBot: "#08080a", glow: "#888890", layer1: "#121216", layer2: "#0c0c10", layer3: "#060608", accent: "#c0c0c8" },
  // ★ EKSİK PALETLER — bu 5 kategori tanımsız olduğu için ekran kararıyordu
  ates:      { skyTop: "#3a1206", skyBot: "#140502", glow: "#ff8a3c", layer1: "#241004", layer2: "#160903", layer3: "#0a0401", accent: "#ffc178" },
  cehennem:  { skyTop: "#2e0808", skyBot: "#0e0202", glow: "#ef4444", layer1: "#1c0505", layer2: "#120303", layer3: "#080101", accent: "#ff8a8a" },
  hurma:     { skyTop: "#2a2408", skyBot: "#0c0a02", glow: "#e8c860", layer1: "#1a1606", layer2: "#100e04", layer3: "#070602", accent: "#f0e090" },
  ari:       { skyTop: "#33260a", skyBot: "#120d02", glow: "#facc15", layer1: "#231a06", layer2: "#151004", layer3: "#0a0702", accent: "#fde68a" },
  karinca:   { skyTop: "#241a08", skyBot: "#0c0803", glow: "#ca8a04", layer1: "#171004", layer2: "#0e0a03", layer3: "#060401", accent: "#e0c48a" },
};

/** 4 ışık modu — seed'e göre tamamen farklı atmosfer */
function moodFor(base: Palette, m: number): Palette {
  switch (m % 4) {
    case 0: return { ...base, skyTop: shift(base.skyTop, -18, 10, 14), glow: shift(base.glow, -22, 12, 10), accent: shift(base.accent, -18, 8, 8) }; // şafak/sıcak
    case 1: return base; // doğal
    case 2: return { ...base, skyTop: shift(base.skyTop, 30, 8, -4), glow: shift(base.glow, 35, 10, 4) }; // serin/alacakaranlık
    default: return { ...base, skyTop: shift(base.skyTop, 8, 6, -16), skyBot: shift(base.skyBot, 0, 0, -6), glow: shift(base.glow, 0, -8, -6), layer1: shift(base.layer1, 0, 0, -8), layer2: shift(base.layer2, 0, 0, -6), layer3: shift(base.layer3, 0, 0, -4) }; // gece
  }
}

const W = 1600, H = 900;

function stars(rand: () => number, color: string, count: number, maxY = H): string {
  let s = "";
  for (let i = 0; i < count; i++) {
    const r = rand() * 1.7 + 0.3;
    s += `<circle cx="${(rand() * W).toFixed(1)}" cy="${(rand() * maxY).toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${(rand() * 0.7 + 0.25).toFixed(2)}"/>`;
  }
  return s;
}

function ridge(rand: () => number, baseY: number, amp: number, segs = 6): string {
  let d = `M0 ${H} L0 ${baseY.toFixed(0)}`;
  for (let i = 1; i <= segs; i++) {
    const x = (W / segs) * i;
    d += ` Q${(x - W / segs / 2).toFixed(0)} ${(baseY + (rand() - 0.5) * amp * 1.5).toFixed(0)} ${x.toFixed(0)} ${(baseY + (rand() - 0.5) * amp).toFixed(0)}`;
  }
  return d + ` L${W} ${H} Z`;
}

/** Sert üçgen zirveler — count/amp değişken */
function jagged(rand: () => number, baseY: number, minH: number, maxH: number): string {
  const n = 3 + Math.floor(rand() * 5);
  let d = `M0 ${H} L0 ${baseY}`;
  for (let i = 0; i <= n; i++) {
    const x = (W / n) * i;
    d += ` L${(x - W / n / 2).toFixed(0)} ${(baseY - minH - rand() * (maxH - minH)).toFixed(0)} L${x.toFixed(0)} ${(baseY - rand() * 24).toFixed(0)}`;
  }
  return d + ` L${W} ${baseY} L${W} ${H} Z`;
}

function sun(rand: () => number, color: string, yMin = 0.25, yMax = 0.5): string {
  const sx = W * (0.2 + rand() * 0.6), sy = H * (yMin + rand() * (yMax - yMin)), sr = 45 + rand() * 55;
  return `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${sr.toFixed(0)}" fill="${color}" opacity="0.88"/>`;
}

function moonDisc(rand: () => number, color: string, sky: string): string {
  const mx = W * (0.62 + rand() * 0.25), my = H * (0.15 + rand() * 0.2), mr = 36 + rand() * 26;
  const phase = rand();
  return `<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="${mr.toFixed(0)}" fill="${color}" opacity="0.92"/><circle cx="${(mx + mr * (0.3 + phase * 0.4)).toFixed(0)}" cy="${(my - mr * 0.15).toFixed(0)}" r="${mr.toFixed(0)}" fill="${sky}"/>`;
}

function fogBands(rand: () => number, color: string, n: number, y0: number, y1: number): string {
  let s = "";
  for (let i = 0; i < n; i++) {
    const y = H * (y0 + rand() * (y1 - y0));
    s += `<rect x="${(rand() * W * 0.4).toFixed(0)}" y="${y.toFixed(0)}" width="${(W * (0.6 + rand() * 0.6)).toFixed(0)}" height="${(10 + rand() * 22).toFixed(0)}" rx="12" fill="${color}" opacity="${(0.08 + rand() * 0.14).toFixed(2)}"/>`;
  }
  return s;
}

function drawScene(cat: CatId, seed: number): string {
  // ★ Güvenlik: tanımsız kategori gelirse siyah ekran yerine varsayılan palet kullan
  const p = moodFor(BASE[cat] ?? BASE.musaf, seed % 4);
  const rand = mulberry32(seed * 2654435761 ^ hashStr(cat));
  const arch = seed % 5;
  const gid = `g${seed.toString(36)}${cat.slice(0, 2)}`;
  let body = "";

  const defs = `<linearGradient id="${gid}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.skyTop}"/><stop offset="1" stop-color="${p.skyBot}"/></linearGradient>
  <radialGradient id="${gid}h" cx="${(0.2 + rand() * 0.6).toFixed(2)}" cy="${(0.15 + rand() * 0.3).toFixed(2)}" r="0.65"><stop offset="0" stop-color="${p.glow}" stop-opacity="0.5"/><stop offset="0.55" stop-color="${p.glow}" stop-opacity="0.1"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${gid}v" cx="0.5" cy="0.5" r="0.8"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient>`;

  body += `<rect width="${W}" height="${H}" fill="url(#${gid}s)"/><rect width="${W}" height="${H}" fill="url(#${gid}h)"/>`;

  switch (cat) {
    case "daglar":
    case "kar": {
      const night = seed % 4 === 3;
      if (night || cat === "kar") body += stars(rand, p.accent, night ? 140 : 60, H * 0.45);
      if (!night) body += sun(rand, p.glow, 0.18, 0.38); else body += moonDisc(rand, p.accent, p.skyTop);
      if (arch === 0) { // keskin zirveler
        body += `<path d="${jagged(rand, H * 0.62, 160, 320)}" fill="${p.layer1}"/>`;
        body += `<path d="${jagged(rand, H * 0.8, 90, 180)}" fill="${p.layer2}"/>`;
      } else if (arch === 1) { // yumuşak yuvarlak tepeler
        body += `<path d="${ridge(rand, H * 0.55, 120, 5)}" fill="${p.layer1}"/>`;
        body += `<path d="${ridge(rand, H * 0.75, 70, 5)}" fill="${p.layer2}"/>`;
        body += `<path d="${ridge(rand, H * 0.9, 36, 4)}" fill="${p.layer3}"/>`;
      } else if (arch === 2) { // tek masif
        const cx = W * (0.3 + rand() * 0.4), pw = 500 + rand() * 400, ph = 420 + rand() * 200;
        body += `<path d="M${(cx - pw).toFixed(0)} ${H} L${cx.toFixed(0)} ${(H - ph).toFixed(0)} L${(cx + pw).toFixed(0)} ${H} Z" fill="${p.layer1}"/>`;
        body += `<path d="M${(cx - pw * 0.35).toFixed(0)} ${H} L${cx.toFixed(0)} ${(H - ph).toFixed(0)} L${(cx + pw * 0.12).toFixed(0)} ${H} Z" fill="${p.layer2}" opacity="0.7"/>`;
        body += `<path d="${ridge(rand, H * 0.86, 40, 4)}" fill="${p.layer3}"/>`;
      } else if (arch === 3) { // vadi — iki yamaç, ortada ışık
        body += `<path d="M0 ${H} L0 ${(H * 0.3).toFixed(0)} L${(W * 0.42).toFixed(0)} ${H} Z" fill="${p.layer1}"/>`;
        body += `<path d="M${W} ${H} L${W} ${(H * 0.36).toFixed(0)} L${(W * 0.58).toFixed(0)} ${H} Z" fill="${p.layer2}"/>`;
        body += `<circle cx="${W * 0.5}" cy="${H * 0.62}" r="${(60 + rand() * 40).toFixed(0)}" fill="${p.glow}" opacity="0.5"/>`;
      } else { // katmanlı sırtlar
        for (let i = 0; i < 5; i++) {
          const y = H * (0.42 + i * 0.12);
          body += `<path d="${ridge(rand, y, 60 - i * 6, 7)}" fill="${[p.layer1, p.layer2, p.layer1, p.layer2, p.layer3][i]}" opacity="${(0.55 + i * 0.09).toFixed(2)}"/>`;
        }
      }
      if (cat === "kar" && rand() > 0.35) body += `<path d="${jagged(rand, H * 0.6, 150, 300)}" fill="${p.accent}" opacity="0.28"/>`;
      if (cat === "kar") body += stars(rand, p.accent, 90);
      body += fogBands(rand, p.accent, Math.floor(rand() * 3), 0.55, 0.85);
      break;
    }
    case "deniz":
    case "gol": {
      const calm = cat === "gol" || arch < 2;
      body += arch % 2 === 0 ? sun(rand, p.glow, 0.3, 0.46) : moonDisc(rand, p.accent, p.skyTop);
      const hy = H * (0.45 + rand() * 0.12);
      const waves = calm ? 3 : 6;
      for (let i = 0; i < waves; i++) {
        const y = hy + (H - hy) * (i / waves);
        body += `<path d="${ridge(rand, y, calm ? 14 + i * 5 : 34 + i * 10)}" fill="${i % 2 ? p.layer2 : p.layer1}" opacity="${(0.5 + i * 0.1).toFixed(2)}"/>`;
      }
      const refl = calm ? 12 : 6;
      for (let i = 0; i < refl; i++) {
        const y = hy + rand() * (H - hy) * 0.9;
        body += `<rect x="${(W * 0.5 - 120 + rand() * 120).toFixed(0)}" y="${y.toFixed(0)}" width="${(40 + rand() * 120).toFixed(0)}" height="2" fill="${p.accent}" opacity="${(0.12 + rand() * 0.3).toFixed(2)}"/>`;
      }
      if (!calm) body += fogBands(rand, p.accent, 2, 0.4, 0.5);
      break;
    }
    case "col": {
      body += sun(rand, p.glow, 0.16, 0.4);
      const dunes = 3 + (seed % 4);
      for (let i = 0; i < dunes; i++) {
        const y = H * (0.4 + i * (0.55 / dunes));
        body += `<path d="${ridge(rand, y, 70 + i * 16, 4)}" fill="${i % 2 ? p.layer2 : p.layer1}" opacity="${(0.65 + i * 0.07).toFixed(2)}"/>`;
        body += `<path d="${ridge(rand, y, 70 + i * 16, 4)}" fill="none" stroke="${p.accent}" stroke-width="2" opacity="${(0.25 - i * 0.03).toFixed(2)}"/>`;
      }
      if (arch >= 3) body += stars(rand, p.accent, 40, H * 0.3);
      break;
    }
    case "gunbatimi": {
      const sx = W * 0.5, sy = H * (0.42 + rand() * 0.14), sr = 70 + rand() * 60;
      body += `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${sr.toFixed(0)}" fill="${p.glow}"/>`;
      const bands = 4 + Math.floor(rand() * 5);
      for (let i = 0; i < bands; i++) {
        const y = H * (0.12 + rand() * 0.6);
        body += `<rect x="${(rand() * W * 0.5).toFixed(0)}" y="${y.toFixed(0)}" width="${(260 + rand() * 700).toFixed(0)}" height="${(6 + rand() * 18).toFixed(0)}" rx="9" fill="${p.layer1}" opacity="${(0.25 + rand() * 0.4).toFixed(2)}"/>`;
      }
      body += `<path d="${ridge(rand, H * (0.74 + rand() * 0.08), 50)}" fill="${p.layer3}"/>`;
      break;
    }
    case "yildizlar": {
      body += stars(rand, p.accent, 160 + (seed % 3) * 50);
      const bands = 1 + (arch % 3);
      for (let i = 0; i < bands; i++) {
        const cx = rand() * W, cy = rand() * H * 0.8, r = 160 + rand() * 260;
        body += `<radialGradient id="${gid}n${i}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${i % 2 ? p.accent : p.glow}" stop-opacity="0.3"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient><circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#${gid}n${i})"/>`;
      }
      if (arch >= 3) { // samanyolu şeridi
        body += `<g transform="rotate(${(-30 + rand() * 60).toFixed(0)} ${W / 2} ${H / 2})">${stars(rand, p.accent, 180, H)}</g><rect x="0" y="${H * 0.42}" width="${W}" height="${H * 0.16}" fill="${p.glow}" opacity="0.07" transform="rotate(${(-30 + rand() * 60).toFixed(0)} ${W / 2} ${H / 2})"/>`;
      }
      break;
    }
    case "gece": {
      body += stars(rand, p.accent, 120, H * 0.7);
      body += moonDisc(rand, p.accent, p.skyTop);
      body += `<path d="${arch % 2 ? jagged(rand, H * 0.8, 60, 140) : ridge(rand, H * 0.8, 50)}" fill="${p.layer3}"/>`;
      break;
    }
    case "selale": {
      body += `<path d="${jagged(rand, H * 0.34, 80, 200)}" fill="${p.layer1}"/>`;
      const tiers = 1 + (arch % 3);
      for (let tI = 0; tI < tiers; tI++) {
        const ty = H * (0.3 + tI * 0.24);
        body += `<path d="${ridge(rand, ty + 60, 40)}" fill="${p.layer2}"/>`;
        const fx = W * (0.3 + rand() * 0.4);
        for (let i = 0; i < 16; i++) {
          const x = fx + (rand() - 0.5) * 200;
          body += `<rect x="${x.toFixed(0)}" y="${(ty - 40).toFixed(0)}" width="${(2 + rand() * 4).toFixed(1)}" height="${(120 + rand() * 160).toFixed(0)}" fill="${p.accent}" opacity="${(0.14 + rand() * 0.3).toFixed(2)}"/>`;
        }
      }
      body += fogBands(rand, p.accent, 3, 0.7, 0.95);
      break;
    }
    case "orman":
    case "cennet": {
      for (let i = 0; i < 4 + (seed % 3); i++) {
        const x = rand() * W;
        body += `<polygon points="${x.toFixed(0)},0 ${(x - 70).toFixed(0)},${H} ${(x + 70).toFixed(0)},${H}" fill="${p.glow}" opacity="${(0.05 + rand() * 0.07).toFixed(3)}"/>`;
      }
      const layers = 2 + (arch % 3);
      for (let layer = 0; layer < layers; layer++) {
        const baseY = H * (0.5 + layer * (0.45 / layers));
        const fill = [p.layer1, p.layer2, p.layer3][layer % 3];
        const trees = 6 + Math.floor(rand() * 10);
        for (let i = 0; i < trees; i++) {
          const x = rand() * W, h = (70 + rand() * 150) * (1 - layer * 0.18), w = h * (0.28 + rand() * 0.15);
          body += `<polygon points="${x.toFixed(0)},${(baseY - h).toFixed(0)} ${(x - w).toFixed(0)},${baseY.toFixed(0)} ${(x + w).toFixed(0)},${baseY.toFixed(0)}" fill="${fill}"/>`;
        }
        body += `<rect x="0" y="${baseY.toFixed(0)}" width="${W}" height="${H - baseY}" fill="${fill}"/>`;
      }
      if (cat === "cennet") for (let i = 0; i < 30; i++) body += `<circle cx="${(rand() * W).toFixed(0)}" cy="${(rand() * H).toFixed(0)}" r="${(1.5 + rand() * 3).toFixed(1)}" fill="${p.accent}" opacity="${(0.2 + rand() * 0.4).toFixed(2)}"/>`;
      break;
    }
    case "cicekler": {
      body += `<path d="${ridge(rand, H * 0.55, 70)}" fill="${p.layer1}"/>`;
      body += `<path d="${ridge(rand, H * 0.75, 40)}" fill="${p.layer2}"/>`;
      const closeUp = arch < 2;
      const n = closeUp ? 5 + (seed % 4) : 26;
      for (let i = 0; i < n; i++) {
        const cx = rand() * W, cy = closeUp ? H * (0.3 + rand() * 0.6) : H * (0.5 + rand() * 0.48);
        const r = closeUp ? 60 + rand() * 90 : 10 + rand() * 26;
        const col = rand() > 0.5 ? p.accent : p.glow;
        const petals = 5 + Math.floor(rand() * 3);
        for (let k = 0; k < petals; k++) {
          const a = (k / petals) * Math.PI * 2 + rand();
          body += `<ellipse cx="${(cx + Math.cos(a) * r * 0.6).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.6).toFixed(1)}" rx="${(r * 0.5).toFixed(1)}" ry="${(r * 0.26).toFixed(1)}" fill="${col}" opacity="0.55" transform="rotate(${(a * 57.3).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
        }
        body += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.24).toFixed(1)}" fill="${p.glow}" opacity="0.85"/>`;
      }
      break;
    }
    case "bulut": {
      const n = 8 + (arch % 3) * 4;
      for (let i = 0; i < n; i++) {
        const cx = rand() * W, cy = H * (0.1 + rand() * 0.7), r = 70 + rand() * 200;
        body += `<radialGradient id="${gid}c${i}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.accent}" stop-opacity="0"/></radialGradient><ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * (0.4 + rand() * 0.25)).toFixed(0)}" fill="url(#${gid}c${i})"/>`;
      }
      if (arch >= 3) for (let i = 0; i < 5; i++) body += `<polygon points="${(rand() * W).toFixed(0)},0 ${((rand() * W) - 90).toFixed(0)},${H} ${((rand() * W) + 90).toFixed(0)},${H}" fill="${p.glow}" opacity="0.05"/>`;
      break;
    }
    case "namaz":
    case "cami": {
      const night = seed % 4 === 3;
      if (night) body += stars(rand, p.accent, 90, H * 0.5); else body += sun(rand, p.glow, 0.15, 0.35);
      const cx = W * 0.5, baseY = H * 0.8;
      const domes = 1 + (arch % 3);
      const minarets = domes === 1 ? 4 : 2;
      body += `<path d="${ridge(rand, H * 0.88, 16)}" fill="${p.layer3}"/>`;
      for (let mI = 0; mI < minarets; mI++) {
        const mx = cx + (mI - (minarets - 1) / 2) * (300 + rand() * 80);
        const mh = 240 + rand() * 100;
        body += `<rect x="${(mx - 11).toFixed(0)}" y="${(baseY - mh).toFixed(0)}" width="22" height="${mh.toFixed(0)}" fill="${p.layer2}"/><polygon points="${(mx - 15).toFixed(0)},${(baseY - mh).toFixed(0)} ${mx.toFixed(0)},${(baseY - mh - 46).toFixed(0)} ${(mx + 15).toFixed(0)},${(baseY - mh).toFixed(0)}" fill="${p.layer1}"/>`;
      }
      for (let dI = 0; dI < domes; dI++) {
        const dx = cx + (dI - (domes - 1) / 2) * 240;
        const dr = dI === Math.floor(domes / 2) ? 170 + rand() * 40 : 90 + rand() * 30;
        const dbY = baseY - (dI === Math.floor(domes / 2) ? 0 : 40);
        body += `<rect x="${(dx - dr).toFixed(0)}" y="${(dbY - dr * 0.9).toFixed(0)}" width="${(dr * 2).toFixed(0)}" height="${(dr * 0.9).toFixed(0)}" fill="${p.layer2}"/><path d="M${(dx - dr).toFixed(0)} ${(dbY - dr * 0.9).toFixed(0)} Q${dx.toFixed(0)} ${(dbY - dr * 2.1).toFixed(0)} ${(dx + dr).toFixed(0)} ${(dbY - dr * 0.9).toFixed(0)} Z" fill="${p.layer1}"/><rect x="${(dx - 2).toFixed(0)}" y="${(dbY - dr * 2.1 - 34).toFixed(0)}" width="4" height="36" fill="${p.accent}" opacity="0.85"/>`;
      }
      const wins = 3 + (seed % 3);
      for (let i = 0; i < wins; i++) body += `<rect x="${(cx + (i - (wins - 1) / 2) * 64 - 8).toFixed(0)}" y="${(baseY - 120).toFixed(0)}" width="16" height="62" rx="8" fill="${p.glow}" opacity="${night ? 0.65 : 0.35}"/>`;
      break;
    }
    case "musaf": {
      const cx = W * 0.5, cy = H * 0.52;
      body += sun(rand, p.glow, 0.1, 0.25);
      if (arch % 2 === 0) { // açık kitap
        body += `<polygon points="${cx},${cy - 230} ${cx - 440},${cy - 150} ${cx - 440},${cy + 210} ${cx},${cy + 150}" fill="${p.layer1}"/><polygon points="${cx},${cy - 230} ${cx + 440},${cy - 150} ${cx + 440},${cy + 210} ${cx},${cy + 150}" fill="${p.layer2}"/>`;
        for (let sI = 0; sI < 2; sI++) {
          const dir = sI === 0 ? -1 : 1;
          for (let l = 0; l < 10; l++) {
            const y = cy - 120 + l * 30;
            body += `<line x1="${(cx + dir * 44).toFixed(0)}" y1="${y.toFixed(0)}" x2="${(cx + dir * (380 - rand() * 70)).toFixed(0)}" y2="${(y + dir * 9).toFixed(0)}" stroke="${p.accent}" stroke-width="2" opacity="${(0.16 + rand() * 0.22).toFixed(2)}"/>`;
          }
        }
        body += `<line x1="${cx}" y1="${(cy - 230).toFixed(0)}" x2="${cx}" y2="${(cy + 150).toFixed(0)}" stroke="${p.glow}" stroke-width="2" opacity="0.5"/>`;
      } else { // tek sayfa + ışık
        body += `<rect x="${(cx - 260).toFixed(0)}" y="${(cy - 300).toFixed(0)}" width="520" height="620" rx="8" fill="${p.layer1}"/><rect x="${(cx - 240).toFixed(0)}" y="${(cy - 280).toFixed(0)}" width="480" height="580" rx="6" fill="${p.layer2}"/>`;
        for (let l = 0; l < 14; l++) body += `<line x1="${(cx - 200).toFixed(0)}" y1="${(cy - 230 + l * 38).toFixed(0)}" x2="${(cx + 200 - rand() * 60).toFixed(0)}" y2="${(cy - 230 + l * 38).toFixed(0)}" stroke="${p.accent}" stroke-width="2" opacity="${(0.15 + rand() * 0.2).toFixed(2)}"/>`;
      }
      break;
    }
    case "desen": {
      const kind = arch % 3;
      if (kind === 0) {
        const step = 130 + (seed % 3) * 40;
        for (let y = 0; y < H + step; y += step) for (let x = 0; x < W + step; x += step) {
          const r = step * 0.32;
          body += `<g transform="translate(${x} ${y})" opacity="${(0.3 + rand() * 0.3).toFixed(2)}"><polygon points="0,${-r} ${r * 0.35},${-r * 0.35} ${r},0 ${r * 0.35},${r * 0.35} 0,${r} ${-r * 0.35},${r * 0.35} ${-r},0 ${-r * 0.35},${-r * 0.35}" fill="none" stroke="${p.accent}" stroke-width="1.6"/><polygon points="0,${-r * 0.55} ${r * 0.55},0 0,${r * 0.55} ${-r * 0.55},0" fill="none" stroke="${p.glow}" stroke-width="1"/></g>`;
        }
      } else if (kind === 1) {
        const cx = W * 0.5, cy = H * 0.5;
        for (let i = 1; i <= 9; i++) body += `<circle cx="${cx}" cy="${cy}" r="${i * 52}" fill="none" stroke="${i % 2 ? p.accent : p.glow}" stroke-width="${i % 3 === 0 ? 2 : 1}" opacity="${(0.4 - i * 0.03).toFixed(2)}"/>`;
        for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; body += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * 470).toFixed(0)}" y2="${(cy + Math.sin(a) * 470).toFixed(0)}" stroke="${p.accent}" stroke-width="1" opacity="0.25"/>`; }
      } else {
        for (let row = 0; row < 6; row++) for (let colI = 0; colI < 9; colI++) {
          const x = colI * 200 + (row % 2) * 100, y = row * 170;
          body += `<path d="M${x} ${y + 120} L${x} ${y + 50} Q${x + 70} ${y - 30} ${x + 140} ${y + 50} L${x + 140} ${y + 120}" fill="none" stroke="${p.accent}" stroke-width="1.6" opacity="${(0.3 + rand() * 0.25).toFixed(2)}"/>`;
        }
      }
      break;
    }
    case "sehir": {
      const night = seed % 4 === 3;
      if (!night) body += sun(rand, p.glow, 0.18, 0.4); else body += stars(rand, p.accent, 70, H * 0.5);
      let x = 0;
      while (x < W) {
        const bw = 36 + rand() * 100, bh = (arch < 2 ? 160 : 100) + rand() * (arch < 2 ? 420 : 260);
        body += `<rect x="${x.toFixed(0)}" y="${(H - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${rand() > 0.5 ? p.layer1 : p.layer2}"/>`;
        for (let wy = H - bh + 18; wy < H - 16; wy += 22) for (let wx = x + 7; wx < x + bw - 7; wx += 16) if (rand() > (night ? 0.4 : 0.62)) body += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="5" height="9" fill="${p.glow}" opacity="${(0.3 + rand() * 0.5).toFixed(2)}"/>`;
        x += bw + 3;
      }
      body += fogBands(rand, p.accent, 2, 0.55, 0.75);
      break;
    }
    case "ates":
    case "cehennem": {
      // Alev dilleri + yükselen kıvılcımlar
      const flames = 7 + (arch % 4);
      for (let i = 0; i < flames; i++) {
        const fx = (W / flames) * i + W / flames / 2 + (rand() - 0.5) * 60;
        const fh = H * (0.30 + rand() * 0.34);
        const fw = 55 + rand() * 90;
        body += `<linearGradient id="${gid}f${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${p.accent}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${p.glow}" stop-opacity="0.75"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></linearGradient>`;
        body += `<path d="M${fx.toFixed(0)} ${H} C${(fx - fw).toFixed(0)} ${(H - fh * 0.45).toFixed(0)}, ${(fx - fw * 0.35).toFixed(0)} ${(H - fh * 0.8).toFixed(0)}, ${fx.toFixed(0)} ${(H - fh).toFixed(0)} C${(fx + fw * 0.35).toFixed(0)} ${(H - fh * 0.8).toFixed(0)}, ${(fx + fw).toFixed(0)} ${(H - fh * 0.45).toFixed(0)}, ${fx.toFixed(0)} ${H} Z" fill="url(#${gid}f${i})" opacity="${(0.5 + rand() * 0.4).toFixed(2)}"/>`;
      }
      for (let i = 0; i < 70; i++) {
        const sx2 = rand() * W;
        const sy2 = H - rand() * H * 0.85;
        body += `<circle cx="${sx2.toFixed(0)}" cy="${sy2.toFixed(0)}" r="${(0.8 + rand() * 2.4).toFixed(1)}" fill="${p.accent}" opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`;
      }
      if (cat === "cehennem") {
        body += `<path d="${jagged(rand, H * 0.86, 40, 130)}" fill="${p.layer3}"/>`;
        for (let i = 0; i < 4; i++) {
          const bx = rand() * W;
          body += `<path d="M${bx.toFixed(0)} 0 L${(bx + 14).toFixed(0)} ${(H * 0.3).toFixed(0)} L${(bx - 6).toFixed(0)} ${(H * 0.3).toFixed(0)} L${(bx + 8).toFixed(0)} ${(H * 0.6).toFixed(0)}" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.35"/>`;
        }
      }
      break;
    }
    case "hurma": {
      body += sun(rand, p.glow, 0.14, 0.34);
      body += `<path d="${ridge(rand, H * 0.80, 34, 5)}" fill="${p.layer2}"/>`;
      const palms = 3 + (arch % 4);
      for (let i = 0; i < palms; i++) {
        const px2 = (W / palms) * i + W / palms / 2 + (rand() - 0.5) * 90;
        const baseY2 = H * (0.80 + rand() * 0.06);
        const th = H * (0.30 + rand() * 0.22);
        const lean = (rand() - 0.5) * 26;
        body += `<path d="M${px2.toFixed(0)} ${baseY2.toFixed(0)} Q${(px2 + lean).toFixed(0)} ${(baseY2 - th * 0.55).toFixed(0)} ${(px2 + lean * 1.7).toFixed(0)} ${(baseY2 - th).toFixed(0)}" fill="none" stroke="${p.layer1}" stroke-width="${(9 + rand() * 6).toFixed(0)}" stroke-linecap="round"/>`;
        const topX = px2 + lean * 1.7;
        const topY = baseY2 - th;
        for (let l = 0; l < 9; l++) {
          const a2 = (l / 9) * Math.PI * 2;
          const lr = 62 + rand() * 52;
          body += `<path d="M${topX.toFixed(0)} ${topY.toFixed(0)} Q${(topX + Math.cos(a2) * lr * 0.55).toFixed(0)} ${(topY + Math.sin(a2) * lr * 0.5 - 26).toFixed(0)} ${(topX + Math.cos(a2) * lr).toFixed(0)} ${(topY + Math.sin(a2) * lr * 0.72 + 14).toFixed(0)}" fill="none" stroke="${p.layer1}" stroke-width="4" opacity="0.9"/>`;
        }
        for (let d2 = 0; d2 < 8; d2++) {
          body += `<circle cx="${(topX + (rand() - 0.5) * 44).toFixed(0)}" cy="${(topY + 16 + rand() * 26).toFixed(0)}" r="${(2.5 + rand() * 2.5).toFixed(1)}" fill="${p.accent}" opacity="0.75"/>`;
        }
      }
      body += fogBands(rand, p.accent, 2, 0.62, 0.8);
      break;
    }
    case "ari": {
      // Bal peteği (altıgen) dokusu + uçuşan zerreler
      const hexR = 42 + (seed % 3) * 12;
      const hexH = hexR * Math.sqrt(3);
      for (let row = 0; row * hexH * 0.5 < H + hexH; row++) {
        for (let colI = 0; colI * hexR * 1.5 < W + hexR * 2; colI++) {
          const cx2 = colI * hexR * 1.5;
          const cy2 = row * hexH + (colI % 2 ? hexH / 2 : 0);
          let pts = "";
          for (let k = 0; k < 6; k++) {
            const a2 = (Math.PI / 3) * k;
            pts += `${(cx2 + Math.cos(a2) * hexR).toFixed(1)},${(cy2 + Math.sin(a2) * hexR).toFixed(1)} `;
          }
          body += `<polygon points="${pts.trim()}" fill="none" stroke="${p.accent}" stroke-width="1.4" opacity="${(0.16 + rand() * 0.2).toFixed(2)}"/>`;
        }
      }
      body += `<radialGradient id="${gid}hb" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="${p.glow}" stop-opacity="0.4"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient><rect width="${W}" height="${H}" fill="url(#${gid}hb)"/>`;
      for (let i = 0; i < 26; i++) {
        const bx = rand() * W, by = rand() * H;
        body += `<ellipse cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" rx="${(3 + rand() * 3).toFixed(1)}" ry="${(2 + rand() * 2).toFixed(1)}" fill="${p.accent}" opacity="${(0.35 + rand() * 0.45).toFixed(2)}"/>`;
      }
      break;
    }
    case "karinca": {
      // Mikro dünya: toprak katmanları + tüneller + minik siluetler
      for (let i = 0; i < 4; i++) {
        const y2 = H * (0.42 + i * 0.15);
        body += `<path d="${ridge(rand, y2, 26 + i * 8, 6)}" fill="${i % 2 ? p.layer2 : p.layer1}" opacity="${(0.6 + i * 0.1).toFixed(2)}"/>`;
      }
      for (let i = 0; i < 5; i++) {
        const tx = rand() * W;
        body += `<path d="M${tx.toFixed(0)} ${H} Q${(tx + (rand() - 0.5) * 180).toFixed(0)} ${(H * 0.66).toFixed(0)} ${(tx + (rand() - 0.5) * 260).toFixed(0)} ${(H * 0.44).toFixed(0)}" fill="none" stroke="${p.accent}" stroke-width="${(7 + rand() * 8).toFixed(0)}" opacity="0.14" stroke-linecap="round"/>`;
      }
      for (let i = 0; i < 16; i++) {
        const ax = rand() * W, ay = H * (0.45 + rand() * 0.5), s2 = 3 + rand() * 3;
        body += `<g opacity="${(0.4 + rand() * 0.45).toFixed(2)}" fill="${p.accent}"><ellipse cx="${ax.toFixed(0)}" cy="${ay.toFixed(0)}" rx="${(s2 * 0.55).toFixed(1)}" ry="${(s2 * 0.42).toFixed(1)}"/><ellipse cx="${(ax + s2 * 1.1).toFixed(0)}" cy="${ay.toFixed(0)}" rx="${(s2 * 0.42).toFixed(1)}" ry="${(s2 * 0.34).toFixed(1)}"/><ellipse cx="${(ax + s2 * 2).toFixed(0)}" cy="${ay.toFixed(0)}" rx="${(s2 * 0.62).toFixed(1)}" ry="${(s2 * 0.48).toFixed(1)}"/></g>`;
      }
      body += fogBands(rand, p.accent, 2, 0.2, 0.4);
      break;
    }
    default: {
      body += `<path d="${ridge(rand, H * 0.68, 60)}" fill="${p.layer2}"/><path d="${ridge(rand, H * 0.85, 30)}" fill="${p.layer3}"/>`;
    }
  }

  body += `<rect width="${W}" height="${H}" fill="url(#${gid}v)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;
}

export function proceduralDataUrl(cat: CatId, seed: number): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(drawScene(cat, seed))}`;
}

export function parseProc(src: string): { cat: CatId; seed: number } | null {
  const m = src.match(/^proc:\/\/([a-z]+)\/(\d+)$/);
  return m ? { cat: m[1] as CatId, seed: Number(m[2]) } : null;
}
