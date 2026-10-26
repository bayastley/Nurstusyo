// ════════════════════════════════════════════════════════
// 26.10 UI I18N TURU — yayınlara giden kalıntı Türkçe metinleri sözlük anahtarına bağlar.
// Girdi: [dosya, bul, yeni]. ttX2610 köprüsü dosyada yoksa ilk import'tan sonra eklenir.
// ════════════════════════════════════════════════════════
import fs from "node:fs";

const KO = `// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur\nconst ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);`;

function kospruEkle(p, metin) {
  if (metin.includes("const ttX2610 =")) return metin;
  if (!metin.includes('from "../i18n"') && !metin.includes('from "./i18n"')) {
    const derinlik = p.includes("components") || p.includes("studio") ? "../i18n" : "./i18n";
    metin = `import { translate } from "${derinlik}";\n` + metin;
  }
  const ilkImport = metin.match(/^import[\s\S]*?;\n/m);
  if (ilkImport) metin = metin.replace(ilkImport[0], ilkImport[0] + KO + "\n");
  else metin = KO + "\n" + metin;
  return metin;
}

const islemler = [
  // ── ZipExplorer ──
  ["src/components/ZipExplorer.tsx", 'className="text-[13px] font-bold text-white/90">Medya Yükleme</p>', 'className="text-[13px] font-bold text-white/90">{ttX2610("zxBaslik")}</p>'],
  ["src/components/ZipExplorer.tsx", '>Video · Resim · Ses — diğer dosyalar reddedilir</p>', '>{ttX2610("zxTurListe")}</p>'],
  ["src/components/ZipExplorer.tsx", 'aria-label="Kapat"', 'aria-label={ttX2610("kapatBtn")}'],
  ["src/components/ZipExplorer.tsx", '>Dosyaları sürükle ya da tıkla — video, resim, ses</p>', '>{ttX2610("zxSurukle")}</p>'],
  ["src/components/ZipExplorer.tsx", '>ZIP, PDF, kod vb. reddedilir · en fazla 200 MB</p>', '>{ttX2610("zxRedKurallar")}</p>'],
  ["src/components/ZipExplorer.tsx", 'neden: ext ? `.{ext} desteklenmiyor — yalnızca video/resim/ses kabul edilir` : "desteklenmeyen dosya"', 'neden: ext ? ttX2610("zxRedDesteklenmiyor").replace("{x}", `.${ext}`) : ttX2610("zxRedDesteklenmeyen")'],
  ["src/components/ZipExplorer.tsx", '`çok büyük (${formatBytes(f.size)}) — en fazla 200 MB`', 'ttX2610("zxRedBuyuk").replace("{x}", String(formatBytes(f.size)))'],
  ["src/components/ZipExplorer.tsx", '>Henüz dosya yok — yukarıdan ekle</div>', '>{ttX2610("zxBos")}</div>'],
  ["src/components/ZipExplorer.tsx", 'title="Cihazında kalıcı saklandı — sayfayı yenilesen de kaybolmaz"', 'title={ttX2610("zxKaliciTitle")}'],
  ["src/components/ZipExplorer.tsx", '>Tümünü temizle</button>', '>{ttX2610("zxTemizle")}</button>'],
  ["src/components/ZipExplorer.tsx", '<Check size={8} strokeWidth={4} /> Eklendi', '<Check size={8} strokeWidth={4} /> {ttX2610("zxEklendi")}'],
  ["src/components/ZipExplorer.tsx", '💾 Kalıcı', '💾 {ttX2610("zxKalici")}'],
  // ── ModalsContainer ──
  ["src/components/ModalsContainer.tsx", "title=\"Medya Yükleme\" sub=\"V3 · Admin · video, resim ve ses dosyaları — IndexedDB'de kalıcı saklanır\"", 'title={ttX2610("zxBaslik")} sub={ttX2610("zxSub")}'],
];

for (const [p, bul, yeni] of islemler) {
  let metin = fs.readFileSync(p, "utf8");
  if (!metin.includes(bul)) { console.log("!! BULUNAMADI", p, "→", bul.slice(0, 60)); continue; }
  metin = metin.replace(bul, yeni);
  metin = kospruEkle(p, metin);
  fs.writeFileSync(p, metin);
  console.log("ok", p, "→", (yeni || "").slice(0, 60));
}
