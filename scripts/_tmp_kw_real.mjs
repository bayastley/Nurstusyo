import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sc = readFileSync("src/studio/studioConstants.ts", "utf8");
const satirlar = sc.split("\n");
const bas = satirlar.findIndex((l) => l.startsWith("export const KEYWORD_CATEGORY_FALLBACK"));
let son = bas;
for (let i = bas; i < satirlar.length; i++) {
  if (satirlar[i] === "};") { son = i; break; }
}
const blok = satirlar.slice(bas, son + 1).join("\n").replace(": Record<string, CatId>", "");
const dir = await mkdtemp(join(tmpdir(), "kw-"));
const dosya = join(dir, "kw.mjs");
writeFileSync(dosya, blok);
const { KEYWORD_CATEGORY_FALLBACK } = await import(pathToFileURL(dosya).href);

const norm = (s) => s.toLocaleLowerCase("tr");
function eslesti(ayet) {
  const words = norm(ayet).split(/[^a-zçğıöşüâîû]+/i).filter(Boolean);
  let best = null, bestLen = 0, hangi = "";
  for (const word of words) {
    for (const [kw, cat] of Object.entries(KEYWORD_CATEGORY_FALLBACK)) {
      const kn = norm(kw);
      const isMatch = kn.length <= 3 ? word === kn : word.startsWith(kn) || word === kn;
      if (isMatch && kn.length > bestLen) { best = cat; bestLen = kn.length; hangi = kw; }
    }
  }
  return { best, hangi };
}
const vakalar = [
  "Gökten su indirdi sizi rızıklandırdı",
  "Arı yapan kovanları balla doludur",
  "Karınca yuvasını toprağa oydu",
  "Denizde gemi yüzer",
];
for (const a of vakalar) {
  const r2 = eslesti(a);
  console.log(a.slice(0, 38).padEnd(40), "→", r2.best ?? "YOK", "(" + r2.hangi + ")");
}
