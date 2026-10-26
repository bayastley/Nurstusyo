// ★ 26.10.3 — hint: hedef dosyalardaki ham Türkçe literalleri listele
// (comment ve zaten çeviri çağrısı sarmalanmış anahtarları dışlar)
import fs from "node:fs";

const HEDEFLER = [
  "src/components/modalsContainerBolumler.tsx",
  "src/components/SeslendirmeModal.tsx",
  "src/components/KendiSesModal.tsx",
  "src/components/IslamicToolsPanel.tsx",
  "src/components/islamicToolsBolumler.tsx",
  "src/components/islamicToolsVeri.ts",
  "src/components/islamicToolsZikir.tsx",
  "src/components/islamicToolsIstatistik.tsx",
  "src/components/islamicToolsTakip.tsx",
  "src/components/islamicToolsBildirim.tsx",
  "src/components/islamicToolsVucut.tsx",
  "src/components/AyahLibraryPanel.tsx",
  "src/adminAtmosphereCategories.ts",
  "src/reciters.ts",
  "src/components/VideoPreviewSection.tsx",
  "src/components/studioAppBolumler.tsx",
  "src/components/AtmosphereCard.tsx",
  "src/components/ModalsContainer.tsx",
  "src/components/HeaderTopBar.tsx",
  "src/data/gununVideosu.ts",
  "src/components/OnerilenVideolar.tsx",
];

const TR = /[çğıöşüÇĞİÖŞÜ]/;
for (const f of HEDEFLER) {
  if (!fs.existsSync(f)) { console.log("!! yok:", f); continue; }
  const satirlar = fs.readFileSync(f, "utf8").split("\n");
  const bul = [];
  satirlar.forEach((l, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(l)) return;
    // zaten çevirideki anahtarlar: ttX2610("anahtar") — TR char içermeyen anahtarlar
    const temiz = l.replace(/\b(?:t|tt|ttX2610|gt|dX2610|secx)\(\s*(?:["'`][^"'`]*["'`]\s*,?\s*)+/g, " T() ").replace(/[{}]/g, " ");
    if (!TR.test(temiz)) return;
    // yalnızca TR bir string literali içindeyse say: ham string kontrolü
    const ham = temiz.match(/(['"`])([^'"`]*[çğıöşüÇĞİÖŞÜ][^'"`]*)\1/g);
    if (ham) {
      const ve = ham.filter(h => !/^\s*T\(\s*(["'`])[^'"`]*["'`]\s*\)/.test(h) && !/^\s*(?:t|tt|ttX2610|gt|dX2610)\(/.test(h));
      if (ve.length) bul.push(`L${i + 1}: ${ham.join(" | ").slice(0, 200)}`);
    }
  });
  console.log(`\n== ${f} (${bul.length})`);
  bul.slice(0, 60).forEach(x => console.log("   " + x));
}
