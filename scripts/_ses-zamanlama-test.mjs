// UNTRACKED YARDIMCI (_ önekli, repo dışı) — sesZamanlama.taramaYap sentetik testi.
// Senaryo 1: 4 ayet + KISA nefesler (SESSIZ_SN=0.22 altı) → pass-2 devreye girmeli (yontem:"sessizlik")
// Senaryo 2: tam sessiz dosya → eşit böl + yontem="esit-bol" (dürüst)
// Senaryo 3: NET uzun nefesler → klasik tarama, yontem="sessizlik"
// Senaryo 4: az gürültülü + kısa nefesler → ikili-mod eşik, pass-2
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// ts dosyasını stub'layıp çekemeyiz (TS) → çekirdek mantığı buraya kopyalamak yerine
// vite'in derlediği modülü kullanmak yerine minimal inline kopya KULLANMIYORUZ;
// bunun yerine TS'i esbuild ile anlık derleyip import ediyoruz (esbuild devDep'te).
const { buildSync } = await import("esbuild").catch(() => ({ buildSync: null }));
if (!buildSync) { console.error("esbuild yok"); process.exit(1); }
buildSync({
  entryPoints: ["src/studio/sesZamanlama.ts"],
  bundle: false,
  format: "esm",
  outfile: "scripts/_sesZamanlama.derlenmis.mjs",
  logLevel: "silent",
});
const { taramaYap } = await import(pathToFileURL("scripts/_sesZamanlama.derlenmis.mjs").href);

const HZ = 16000;
/** konanlar: [{bas, sure}] sn — amplitüd 0.3 konuşma; aralar tam sessiz */
function sentez(konanlar, toplamSn, gurultu = 0) {
  const n = Math.floor(toplamSn * HZ);
  const d = new Float32Array(n);
  for (const { bas, sure } of konanlar) {
    const b = Math.floor(bas * HZ), u = Math.min(n, Math.floor((bas + sure) * HZ));
    for (let i = b; i < u; i++) d[i] = 0.3 * Math.sin(2 * Math.PI * 180 * (i / HZ));
  }
  if (gurultu > 0) for (let i = 0; i < n; i++) d[i] += gurultu * (Math.random() * 2 - 1);
  return { sampleRate: HZ, duration: toplamSn, getChannelData: () => d, numberOfChannels: 1, length: n };
}

let fail = 0;
const kontrol = (ad, kosul, detay) => { console.log((kosul ? "  ✓ " : "  ✗ ") + ad + (kosul ? "" : " → " + detay)); if (!kosul) fail += 1; };

// ── Senaryo 1: 4 ayet, kısa nefes (0.12 sn) — ESKİ KODUN BAŞARISIZ OLDUĞU SENARYO
{
  const konanlar = [];
  let t = 0.4;
  for (let i = 0; i < 4; i++) { konanlar.push({ bas: t, sure: 2.0 }); t += 2.0 + 0.12; }
  const buf = sentez(konanlar, 10);
  const s = taramaYap(buf, 4);
  console.log("Senaryo 1 (kısa nefes 0.12sn):");
  kontrol("yontem sessizlik", s.yontem === "sessizlik", "geldi: " + s.yontem);
  kontrol("4 segment", s.segments.length === 4, "geldi: " + s.segments.length);
  // 1. segment baştaki sessizliği kapsar (plan: baş sessizliği ayet 1'e aittir) → erken başlamak serbest, geç başlamak yasak
  const hata = s.segments.map((seg, i) => (i === 0 ? Math.max(0, seg.start - konanlar[0].bas) : Math.abs(seg.start - konanlar[i].bas)));
  kontrol("başlangıçlar doğru (seg1 erken serbest, ±0.3sn)", hata.every((h) => h < 0.3), "hatalar: " + hata.map((h) => h.toFixed(2)).join(","));
  console.log("    başlangıçlar: " + s.segments.map((x) => x.start.toFixed(2)).join(" · ") + " (gerçek: " + konanlar.map((k) => k.bas.toFixed(2)).join(" · ") + ")");
}

// ── Senaryo 2: tam sessiz dosya → dürüst eşit böl
{
  const buf = sentez([], 8);
  const s = taramaYap(buf, 4);
  console.log("Senaryo 2 (tam sessiz):");
  kontrol("yontem esit-bol (dürüst)", s.yontem === "esit-bol", "geldi: " + s.yontem);
  kontrol("4 segment", s.segments.length === 4, "geldi: " + s.segments.length);
  kontrol("eşit başlangıçlar", Math.abs(s.segments[2].start - 4) < 0.05, "seg3.start: " + s.segments[2].start.toFixed(2));
}

// ── Senaryo 3: net uzun nefesler (0.5 sn) → klasik tarama
{
  const konanlar = [];
  let t = 0.4;
  for (let i = 0; i < 4; i++) { konanlar.push({ bas: t, sure: 2.0 }); t += 2.0 + 0.5; }
  const buf = sentez(konanlar, 11);
  const s = taramaYap(buf, 4);
  console.log("Senaryo 3 (uzun nefes 0.5sn):");
  kontrol("yontem sessizlik", s.yontem === "sessizlik", "geldi: " + s.yontem);
  kontrol("4 segment", s.segments.length === 4, "geldi: " + s.segments.length);
  const hata = s.segments.map((seg, i) => Math.abs(seg.start - konanlar[i].bas));
  kontrol("başlangıçlar ±0.3sn", hata.every((h) => h < 0.3), "hatalar: " + hata.map((h) => h.toFixed(2)).join(","));
}

// ── Senaryo 4: az gürültülü (0.005) + kısa nefesler
{
  const konanlar = [];
  let t = 0.4;
  for (let i = 0; i < 4; i++) { konanlar.push({ bas: t, sure: 2.0 }); t += 2.0 + 0.12; }
  const buf = sentez(konanlar, 10, 0.005);
  const s = taramaYap(buf, 4);
  console.log("Senaryo 4 (gürültü 0.005 + kısa nefes):");
  kontrol("4 segment (parazit bölünme yok)", s.segments.length === 4, "geldi: " + s.segments.length + " — eşik: " + s.esik.toFixed(4));
  const hata = s.segments.map((seg, i) => (i === 0 ? Math.max(0, seg.start - konanlar[0].bas) : Math.abs(seg.start - konanlar[i].bas)));
  kontrol("başlangıçlar doğru (seg1 erken serbest, ±0.3sn)", hata.every((h) => h < 0.3), "hatalar: " + hata.map((h) => h.toFixed(2)).join(","));
}

// ── Senaryo 5: YALAN SÖYLEYEN KAPSAYICI (WhatsApp mp4 vakası) — 33 sn'lik metadata,
//    300 sn PCM. sureSiniri=33 → tüm segmentler 33 sn İÇİNDE kalmalı (seek edilebilir).
{
  const konanlar = [];
  let t = 0.4;
  for (let i = 0; i < 7; i++) { konanlar.push({ bas: t, sure: 1.2 }); t += 1.2 + 0.15; }
  const buf = sentez(konanlar, 300); // PCM 300 sn diyor, metadata 33 sn diyecek
  const s = taramaYap(buf, 7, 33);
  console.log("Senaryo 5 (yalan söyleyen kapsayıcı: PCM 300sn, oynatılabilir 33sn):");
  kontrol("tüm segmentler 33 sn içinde", s.segments.every((x) => x.start + x.dur <= 33 + 0.2), "max bitiş: " + Math.max(...s.segments.map((x) => x.start + x.dur)).toFixed(2));
  kontrol("7 segment", s.segments.length === 7, "geldi: " + s.segments.length);
  kontrol("total oynatılabilir süre (33)", Math.abs(s.total - 33) < 0.01, "total: " + s.total.toFixed(2));
  const hata = s.segments.map((seg, i) => (i === 0 ? Math.max(0, seg.start - konanlar[0].bas) : Math.abs(seg.start - konanlar[i].bas)));
  kontrol("başlangıçlar ±0.3sn", hata.every((h) => h < 0.3), "hatalar: " + hata.map((h) => h.toFixed(2)).join(","));
}

// ── Senaryo 6: sınır YOK (eski davranış korunur) — normal dosyada aynı sonuç
{
  const konanlar = [];
  let t = 0.4;
  for (let i = 0; i < 4; i++) { konanlar.push({ bas: t, sure: 2.0 }); t += 2.0 + 0.5; }
  const buf = sentez(konanlar, 11);
  const sinirli = taramaYap(buf, 4, 11);
  const sinirsiz = taramaYap(buf, 4);
  console.log("Senaryo 6 (sınır=null = eski davranış):");
  kontrol("sınırlı/sınırsız aynı segment sayısı", sinirli.segments.length === sinirsiz.segments.length, sinirli.segments.length + " vs " + sinirsiz.segments.length);
  kontrol("yontem sessizlik (ikisi de)", sinirli.yontem === "sessizlik" && sinirsiz.yontem === "sessizlik", sinirli.yontem + "/" + sinirsiz.yontem);
}

console.log(fail === 0 ? "\n▶ TÜM SENARYOLAR PASS ✅" : `\n▶ ${fail} KONTROL FAIL ❌`);
process.exit(fail === 0 ? 0 : 1);
