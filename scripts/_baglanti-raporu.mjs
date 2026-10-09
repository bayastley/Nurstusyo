// GEÇİCİ — SRP PARÇALAMA BÜTÜNLÜK RAPORU (30.09)
// Her (parça, ana) çifti için: (1) ana dosya parçayı import ediyor mu,
// (2) parçanın export'ları ana'da kullanılıyor mu, (3) yetim parça var mı.
import { readFileSync, existsSync } from "node:fs";

const ciftler = [
  ["src/version.ts", "src/tier.ts"],
  ["src/adminConfig.ts", "src/tier.ts"],
  ["src/microUnlock.ts", "src/tier.ts"],
  ["src/tierCompat.ts", "src/tier.ts"],
  ["src/components/hafizlikVeri.ts", "src/components/HafizlikTestiModal.tsx"],
  ["src/components/hafizlikGrafigi.tsx", "src/components/HafizlikTestiModal.tsx"],
  ["src/components/roadmapVeri.ts", "src/components/RoadmapModal.tsx"],
  ["src/components/premiumBolumler.tsx", "src/components/PremiumModal.tsx"],
  ["src/components/kesfetTemel.tsx", "src/components/KesfetModal.tsx"],
  ["src/components/kesfetDuaBolumu.tsx", "src/components/KesfetModal.tsx"],
  ["src/components/designAyarBolumleri.tsx", "src/components/DesignSettingsPanel.tsx"],
  ["api/admin/actionYardimcilar.ts", "api/admin/action.ts"],
  ["src/components/ayetKartMotoru.tsx", "src/components/AyetKartlariModal.tsx"],
  ["src/components/modalsContainerBolumler.tsx", "src/components/ModalsContainer.tsx"],
  ["src/components/islamicToolsVeri.ts", "src/components/IslamicToolsPanel.tsx"],
  ["src/components/islamicToolsBolumler.tsx", "src/components/IslamicToolsPanel.tsx"],
  ["src/components/adminDashboardBolumler.tsx", "src/components/AdminDashboardModal.tsx"],
  ["src/components/quranLearnVeri.tsx", "src/components/QuranLearnModal.tsx"],
  ["src/components/studioAppBolumler.tsx", "src/StudioApp.tsx"],
  ["src/studio/medyaOnYukleme.ts", "src/StudioApp.tsx"],
];

let sorun = 0, tam = 0;
for (const [parca, ana] of ciftler) {
  if (!existsSync(parca) || !existsSync(ana)) { console.log(`✗ DOSYA YOK: ${parca} veya ${ana}`); sorun++; continue; }
  let parcaKod = readFileSync(parca, "utf8");
  // (09.10) Eski özel durum kalktı: scripts/_tmp-hafizlik-parcali.tsx yedeği artık yok —
  //   HafizlikTestiModal hafizlikVeri'ye GERÇEKTEN bağlı (yetim vurgusu düzeltildi).
  const anaKod = readFileSync(ana, "utf8");

  // Parça export isimleri
  const exportlar = new Set();
  for (const m of parcaKod.matchAll(/export\s+(?:const|function|let|class|async function)\s+([A-Za-z_$][\w$]*)/g)) exportlar.add(m[1]);
  for (const m of parcaKod.matchAll(/export\s+(?:type|interface)\s+([A-Za-z_$][\w$]*)/g)) exportlar.add(m[1]);
  for (const m of parcaKod.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const p of m[1].split(",")) {
      const ad = p.trim().split(/\s+as\s+/).pop().trim();
      if (/^[A-Za-z_$][\w$]*$/.test(ad)) exportlar.add(ad);
    }
  }

  // Ana dosya parçayı import ediyor mu?
  const parcaAdi = parca.split("/").pop().replace(/\.tsx?$/, "");
  // ★ (09.10): Vercel api dosyaları Node ESM için .js uzantılı import kullanır
  //   (./actionYardimcilar.js) — regex uzantıyı toleranslı yaptı.
  const importVar = new RegExp(`from ["'][^"']*${parcaAdi}(\\.js)?["']`).test(anaKod);
  if (!importVar) { console.log(`✗ IMPORT YOK: ${ana} → ${parca} (yetim parça!)`); sorun++; continue; }

  // Import edilen isimler gerçekten kullanılıyor mu (import satırı dışında)?
  const importSatirlari = anaKod.split("\n").filter(l => l.trim().startsWith("import")).join("\n");
  const importEdilen = new Set();
  for (const m of anaKod.matchAll(new RegExp(`import[^;]*from ["'][^"']*${parcaAdi}["']`, "g"))) {
    for (const n of (m[0].match(/\{([^}]*)\}/)?.[1] ?? "").split(",")) {
      const ad = n.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
      if (ad) importEdilen.add(ad);
    }
    const varsayilan = m[0].match(/import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s*,?\s*(?:\{|from)/);
    if (varsayilan && varsayilan[1] !== "import") importEdilen.add(varsayilan[1]);
  }
  const kullanilmayan = [...importEdilen].filter(ad => {
    const disi = anaKod.replace(importSatirlari, "");
    return !new RegExp(`\\b${ad}\\b`).test(disi);
  });

  // Ana, parçada OLMAYAN sembolleri import etmeye çalışıyor mu (yanlış isim)?
  // alias'ı çöz: `import { X as Y }` → Y kullanımda ama export X'te aranmalı
  const gercekAdlar = new Set();
  for (const m of anaKod.matchAll(new RegExp(`import[^;]*from ["'][^"']*${parcaAdi}["']`, "g"))) {
    for (const n of (m[0].match(/\{([^}]*)\}/)?.[1] ?? "").split(",")) {
      const parcalar2 = n.trim().replace(/^type\s+/, "").split(/\s+as\s+/);
      const kaynak = parcalar2[0]?.trim();
      const yerel = parcalar2[parcalar2.length - 1]?.trim();
      if (kaynak && yerel) {
        importEdilen.delete(yerel);
        importEdilen.add(kaynak);
        gercekAdlar.add(kaynak);
      }
    }
  }
  const eksik = [...gercekAdlar.size ? gercekAdlar : importEdilen].filter(ad => !exportlar.has(ad));

  if (kullanilmayan.length) { console.log(`⚠ KULLANILMIYOR: ${ana} → ${parcaAdi}: ${kullanilmayan.join(", ")}`); }
  if (eksik.length) { console.log(`✗ YANLIŞ IMPORT: ${ana} → ${parcaAdi}'da olmayan: ${eksik.join(", ")}`); sorun++; continue; }
  tam++;
  console.log(`✓ ${parca} → ${ana}: import ok, ${importEdilen.size} sembol kullanımda`);
}
console.log(`\n▶ SONUÇ: ${tam}/${ciftler.length} bağlantı sağlam${sorun ? `, ${sorun} SORUN ✗` : " ✅"}`);
process.exit(sorun ? 1 : 0);
