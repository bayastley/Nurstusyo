// ════════════════════════════════════════════════════════
// _i18n-eksik-tarama.mjs — ID/UR sözlük eksik anahtar tarayıcı
// Çalıştır: node scripts/_i18n-eksik-tarama.mjs
// TR dict referanstır: ID (EN tabanlı) ve UR (TR tabanlı) eksikleri listeler.
// ════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";

function entries(f) {
  const src = readFileSync(new URL(`../src/i18n/${f}`, import.meta.url), "utf8");
  const map = new Map();
  const re = /^\s{2}([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"((?:[^"\\]|\\.)*)"\s*,/gm;
  let x;
  while ((x = re.exec(src))) map.set(x[1], x[2]);
  return map;
}

const tr = entries("dicts.tr.ts");
const en = entries("dicts.en.ts");
const id = entries("dicts.id.ts");
const ur = entries("dicts.ur.ts");
const ar = entries("dicts.ar.ts");

const fmt = (v) => v.replace(/\\'/g, "'").slice(0, 90);

console.log(`TR: ${tr.size} · EN: ${en.size} · ID: ${id.size} · UR: ${ur.size} · AR: ${ar.size}`);

const missingId = [...en].filter(([k]) => !id.has(k) && !tr.has(k));
const missingUr = [...tr].filter(([k]) => !ur.has(k));
const missingIdTr = [...tr].filter(([k]) => !id.has(k));

console.log(`\n== ID eksik (EN tabanına göre): ${missingId.length} ==`);
for (const [k, v] of missingId) console.log(`  ${k} = ${fmt(v)}`);
console.log(`\n== ID'de olmayan TR anahtarları: ${missingIdTr.length} ==`);
for (const [k, v] of missingIdTr) console.log(`  ${k} = ${fmt(v)}`);
console.log(`\n== UR eksik (TR tabanına göre): ${missingUr.length} ==`);
for (const [k, v] of missingUr) console.log(`  ${k} = ${fmt(v)}`);
