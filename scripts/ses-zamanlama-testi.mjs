// scripts/ses-zamanlama-testi.mjs — 23.10
// sesZamanlama.ts taramaYap() — kendi ses parçalama çekirdeğinin davranış testi.
// Node'da AudioBuffer yok → sahte buffer (getChannelData + sampleRate) ile
// SENTETİK PCM üretir. Konuşma modeli GERÇEKÇİ: her ayet-bölüm kelimelerden
// oluşur (kelime ~0.35 sn sesli, kelime-arası durak ~0.08 sn = 2 pencere),
// ayetler arası nefes kullanıcı hızına göre (bu testte SESSIZ_SN=0.22 altı,
// hızlı okuma vakası: 0.18 sn = 4+ pencere). Kelime durağı (2 pencere) ile
// ayet nefesi (4-5 pencere) boşluk genişliğiyle ayrıştırılabilir olmalı.
// Senaryolar:
//   1) açık nefes (0.6 sn) → pass-1 gerçek geçiş ayırır (yontem=sessizlik)
//   2) hızlı okuma (0.18 sn nefes) → pass-2 kelime duraklarına KARŞI gerçek nefesleri seçir
//   3) tamamen sessiz dosya → eşit böl fallback (dürüst: UI "Düzenle" önerir)
//   4) nefes ortasında öksürük paraziti → birleştirme, adet korunur

import { execSync } from "child_process";

execSync(
  "npx esbuild src/studio/sesZamanlama.ts --format=esm --outfile=.tmp-sesZamanlama.mjs --log-level=error",
  { stdio: "inherit" },
);
const { taramaYap } = await import("../.tmp-sesZamanlama.mjs");

const HZ = 48000;
let hataVar = false;

// ★ DETERMİNİSTİK: gürültü her çalışmada aynı üretilir (LCG, sabit tohum) —
//   aksi halde gürültü değişince sınır pencereleri oynar ve test flakî olur.
const lcg = (() => {
  let durum = 0x2f6e2b1;
  return () => {
    durum = (durum * 1103515245 + 12345) & 0x7fffffff;
    return durum / 0x7fffffff;
  };
})();
const rastgele = () => lcg() * 2 - 1;

function sahteBuffer(pcm) {
  return { sampleRate: HZ, duration: pcm.length / HZ, getChannelData: () => pcm };
}

/**
 * Kelime-bazlı konuşma üretimi.
 * bursts: [{ bas: saniye, kelimeler: adet }] — kelime 0.35 sn sesli,
 * kelime-araları 0.08 sn sessiz durak (kelime-içi durak vakası).
 * Burst bitişi = bas + Σ(0.35 + 0.08) − 0.08 (sonu duraksız).
 * Dönen { pcm, sinirlar: [[baş, bitiş], ...] } — gerçek konuşma sınırları.
 */
function pcmUret(bursts, toplamSn) {
  const n = Math.floor(toplamSn * HZ);
  const dizi = new Float32Array(n);
  const sinirlar = [];
  const KELIME_SN = 0.35;
  const DURAK_SN = 0.08;
  for (const b of bursts) {
    let t = b.bas;
    for (let k = 0; k < b.kelimeler; k++) {
      const b0 = Math.floor(t * HZ), b1 = Math.floor((t + KELIME_SN) * HZ);
      for (let i = b0; i < b1 && i < n; i++) {
        // "konuşma" benzeri: hafif zarf modülasyonlu karışım (RMS ~0.037)
        const zarf = 0.6 + 0.4 * Math.sin(2 * Math.PI * 3 * (i / HZ - t));
        dizi[i] += 0.09 * zarf * (Math.sin(2 * Math.PI * 220 * (i / HZ)) * 0.7 + rastgele() * 0.3);
      }
      t += KELIME_SN;
      if (k < b.kelimeler - 1) t += DURAK_SN; // kelime arası durak
    }
    sinirlar.push([b.bas, t]);
  }
  // taban gürültüsü (sessiz bölge RMS ~0.003)
  for (let i = 0; i < n; i++) dizi[i] += rastgele() * 0.003;
  return { pcm: dizi, sinirlar };
}

// ── 1) Açık nefes: pass-1 bölme ──
{
  const { pcm, sinirlar } = pcmUret([
    { bas: 0.05, kelimeler: 3 },
    { bas: 2.0, kelimeler: 2 },
    { bas: 3.9, kelimeler: 2 },
  ], 6.0);
  const sonuc = taramaYap(sahteBuffer(pcm), 3);
  const sl = sonuc.segments;
  const ok = sonuc.yontem === "sessizlik" && sl.length === 3 &&
    sl.every((s, i) => Math.abs(s.start - sinirlar[i][0]) < 0.25);
  console.log(`  1) açık nefes: yontem=${sonuc.yontem} adet=${sl.length} sınırlar=[${sl.map(s => s.start.toFixed(2)).join(", ")}] ${ok ? "OK ✅" : "HATA ❌"}`);
  if (!ok) hataVar = true;
}

// ── 2) Hızlı okuma: 0.18 sn nefes (SESSIZ_SN altı) → pass-2 doğru nefesleri seçir ──
//   Kelime durakları 0.08 sn = 2 pencere; ayet nefesi 0.18 sn = 4+ pencere.
//   Beklenti: her segment sınırları GERÇEK nefes bölgesinde (1.26–1.44 / 2.70–2.88).
{
  const b1Bit = 0.05 + 3 * 0.35 + 2 * 0.08; // 1.26
  const b2Bas = 1.44, b2Bit = 2.70; // b2Bas + 3*0.35 + 2*0.08
  const b3Bas = 2.88;
  const { pcm } = pcmUret([
    { bas: 0.05, kelimeler: 3 },
    { bas: b2Bas, kelimeler: 3 },
    { bas: b3Bas, kelimeler: 3 },
  ], 4.6);
  const sonuc = taramaYap(sahteBuffer(pcm), 3);
  const sl = sonuc.segments;
  const gap1 = [b1Bit + 0.02, b2Bas - 0.02]; // 1.28–1.42
  const gap2 = [b2Bit + 0.02, b3Bas - 0.02]; // 2.72–2.86
  const sinirOk = sl.length === 3 &&
    sl[1].start >= gap1[0] && sl[1].start <= gap1[1] &&
    sl[2].start >= gap2[0] && sl[2].start <= gap2[1];
  const ok = sonuc.yontem === "sessizlik" && sinirOk;
  console.log(`  2) hızlı okuma (0.18s nefes): yontem=${sonuc.yontem} adet=${sl.length} sinirlar=[${sl.map(s => s.start.toFixed(2)).join(", ")}] (beklenen: ${gap1[0].toFixed(2)}-${gap1[1].toFixed(2)} ve ${gap2[0].toFixed(2)}-${gap2[1].toFixed(2)}) ${ok ? "OK ✅" : "HATA ❌"}`);
  if (!ok) hataVar = true;
}

// ── 3) Tamamen sessiz dosya → eşit böl fallback ──
{
  const sonuc = taramaYap(sahteBuffer(pcmUret([], 4.0).pcm), 4);
  const ok = sonuc.yontem === "esit-bol" && sonuc.segments.length === 4;
  console.log(`  3) sessiz dosya: yontem=${sonuc.yontem} adet=${sonuc.segments.length} ${ok ? "OK ✅ (UI \"Düzenle\" önerir — dürüst davranış)" : "HATA ❌"}`);
  if (!ok) hataVar = true;
}

// ── 4) Öksürük paraziti: ayet nefesinin ortasında kısa ses → birleştirme ──
{
  const { pcm } = pcmUret([
    { bas: 0.05, kelimeler: 3 },
    { bas: 2.0, kelimeler: 2 },
    { bas: 3.9, kelimeler: 2 },
  ], 6.0);
  // 1.30–1.40 arasına öksürük (0.1 sn kısa parazit, ilk nefes boşluğunda)
  const c0 = Math.floor(1.30 * HZ), c1 = Math.floor(1.40 * HZ);
  for (let i = c0; i < c1; i++) pcm[i] += 0.2;
  const sonuc = taramaYap(sahteBuffer(pcm), 3);
  const ok = sonuc.segments.length === 3;
  console.log(`  4) öksürüklü: adet=${sonuc.segments.length} ${ok ? "OK ✅" : "HATA ❌ (birleştirme/parazit filtrelemesi çalışmadı)"}`);
  if (!ok) hataVar = true;
}

console.log(hataVar ? "▶ SONUÇ: FAIL ❌" : "▶ SONUÇ: PASS ✅");
process.exit(hataVar ? 1 : 0);
