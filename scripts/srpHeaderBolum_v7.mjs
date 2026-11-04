// SRP v7 — NİHAİ (0-based; serumClickYakala body kapanışı dahil; replacement'lar önce)
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const p = "src/components/HeaderTopBar.tsx";
const lines = readFileSync(p, "utf8").split("\n");
const h0 = (a, b) => lines.slice(a, b + 1).join("\n");
const F = (s, from0 = 0) => { const i = lines.findIndex((l, j) => j >= from0 && l.includes(s)); return i; };
const kaldir = (i, s) => { if (i < 0 || !lines[i]?.includes(s)) { console.error(`✗ SAT${i + 1}: beklenen "${s}"; var olan: ${(lines[i] ?? "").slice(0, 90)}`); process.exit(1); } };

const dI = F("const [dynamicModules");
const uI = F("const [updatesOpen");
const toolsI = F("const [toolsOpen");
const kS = F("const [kibleAcik");
const sB = F("serumClickYakala");
const bodyCloseI = F("};", sB + 1);
const mR = F("25.10 MARQUEE ÖLÇÜMÜ");
const mE = F("}, []);", mR);
const menuI = F("23.10 TAM MODÜL MENÜSÜ");
let menuEndI = -1; for (let i = menuI; i < menuI + 80; i++) { if ((lines[i] ?? "").trim() === "];") { menuEndI = i; break; } }
const fI = F("fetchRemoteConfig().then");
const effStartI = fI - 1;
const menuCloseI = F("}, [menuOpen])", effStartI);
const outsideEndI = F("}, [menuOpen])", menuCloseI + 1);
const trxI = lines.findIndex((l) => l.trim() === '<div className="relative">');
const hedI = F("menuHediyeKodu");
const menuJSXEndI = hedI + 5;
const sI = F("relative ml-auto flex min-w-0");
const hintI = F("pointer-events-none absolute bottom-0", sI);
const serJSXEndI = hintI + 1;
const tI = F("const TIER_SOZLUK");
const tE = F("};", tI);
const eI = F("getSystemConfig, fetchRemoteConfig");
const bLogI = F("import { getBanLogs }");
const bI = F("const [banCount");
const bE = F("}, []);", bI);

kaldir(dI, "dynamicModules"); kaldir(uI, "updatesOpen"); kaldir(toolsI, "toolsOpen");
kaldir(kS, "kibleAcik"); kaldir(sB, "serumClickYakala");
if ((lines[bodyCloseI] ?? "").trim() !== "};") { console.error(`✗ bodyCloseI SAT${bodyCloseI + 1}: ${lines[bodyCloseI]}`); process.exit(1); }
kaldir(mR, "MARQUEE ÖLÇÜMÜ"); if ((lines[mE] ?? "").includes("}, []);") === false) { console.error("✗ marquee bit"); process.exit(1); }
kaldir(menuI, "TAM MODÜL MENÜSÜ"); if ((lines[menuEndI] ?? "").trim() !== "];") { console.error("✗ menu bit"); process.exit(1); }
kaldir(effStartI, "React.useEffect"); kaldir(menuCloseI, "}, [menuOpen])"); kaldir(outsideEndI, "}, [menuOpen])");
kaldir(trxI, "relative"); kaldir(hedI, "menuHediyeKodu");
if ((lines[hedI + 1] ?? "").trim() !== "</button>") { console.error(`✗ hedI+1: ${(lines[hedI + 1] ?? "").slice(0, 60)}`); process.exit(1); }
if ((lines[hedI + 2] ?? "").trim() !== "</div>") { console.error("✗ hedI+2"); process.exit(1); }
if ((lines[hedI + 3] ?? "").trim() !== "</>") { console.error(`✗ hedI+3: ${(lines[hedI + 3] ?? "").slice(0, 60)}`); process.exit(1); }
if ((lines[hedI + 4] ?? "").trim() !== ")}" && (lines[hedI + 4] ?? "").trim() !== ") }") { console.error(`✗ hedI+4`); process.exit(1); }
if ((lines[menuJSXEndI] ?? "").trim() !== "</div>") { console.error(`✗ menuJSXEndI SAT${menuJSXEndI + 1}: ${(lines[menuJSXEndI] ?? "").slice(0, 60)}`); process.exit(1); }
kaldir(sI, "relative ml-auto"); kaldir(hintI, "pointer-events-none");
if ((lines[serJSXEndI] ?? "").trim() !== "</div>") { console.error("✗ serit bit"); process.exit(1); }
kaldir(tI, "TIER_SOZLUK"); if ((lines[tE] ?? "").trim() !== "};") { console.error("✗ tier bit"); process.exit(1); }
kaldir(eI, "getSystemConfig"); kaldir(bI, "banCount"); kaldir(bE, "}, []);");
if (toolsI !== kS - 1) { console.error("✗ tools/kible sırası", toolsI, kS); process.exit(1); }
if (hintI !== serJSXEndI - 1) { console.error("✗ şerit bit sırası"); process.exit(1); }
if (bE !== bI + 4) { console.error("✗ ban blok uzunluğu"); process.exit(1); }
console.log("✓ Kontroller tamam");

if (existsSync("src/components/headerMenuCekmece.tsx") || existsSync("src/components/headerSeritPillBar.tsx")) {
  console.error("✗ Hedef dosyalar zaten var."); process.exit(1);
}

writeFileSync("src/components/headerTierSozluk.ts", `// SRP bölme (04.11): HeaderTopBar'daki TIER_SOZLUK ortak sözlüğe çıkarıldı —
// mobil gösterge (HeaderTopBar) ve üst şerit (headerSeritPillBar) paylaşır.
import type { Tier } from "../tier";

export const TIER_SOZLUK: Record<string, "tierUcretsiz" | "tierPro" | "tierElit"> = {
  free: "tierUcretsiz",
  pro: "tierPro",
  elit: "tierElit",
};
`, "utf8");
console.log("✓ yaz: headerTierSozluk.ts");

const menuDosyasi = [
  'import React from "react";',
  "// ★ 04.11 SRP: HeaderTopBar'daki menü çekmecesi (buton + panel + modül listesi + admin bölümü) kendi dosyasına taşındı.",
  "// Bağlamlar satır düzeyinde birebir taşındı; davranış hiç değişmedi.",
  'import { Sparkles, LogIn, X, UserPlus, HelpCircle, ChevronDown, Shield, ShieldOff, Moon, Heart, Brain, NotebookPen, Type, Wand2, Film, CalendarDays, Gift, Image as ImageIcon, Package, Palette, Headphones, Lightbulb } from "lucide-react";',
  'import { isAdminEmail, tierAtLeast, getCurrentTier, type Tier } from "../tier";',
  'import { getSystemConfig, fetchRemoteConfig, getFeatureLock, type DynamicModule } from "../services/adminSyncService";',
  'import type { ModalName, User } from "../types";',
  'import type { HeaderTopBarProps } from "./headerTopBarTypes";',
  '',
  "// Props alanları HeaderTopBarProps'tan Pick ile alınır (bağlar korunur) — banCount ortak sayaç.",
  'export type HeaderMenuCekmeceProps = Pick<HeaderTopBarProps, "menuOpen" | "setMenuOpen" | "setModal" | "openAdminDashboard" | "openPremium" | "setRoadmapOpen" | "setAdminGodMode" | "setSmartAiEnabled" | "setBatchFormats" | "notify" | "handleLogout" | "user" | "tier" | "isMasterSürüm" | "t"> & { banCount: number };',
  '',
  'export const HeaderMenuCekmece: React.FC<HeaderMenuCekmeceProps> = ({',
  '  menuOpen, setMenuOpen, setModal, openAdminDashboard, openPremium, setRoadmapOpen,',
  '  setAdminGodMode, setSmartAiEnabled, setBatchFormats, notify, handleLogout,',
  '  user, tier, isMasterSürüm, banCount, t,',
  '}) => {',
  h0(dI, dI),
  h0(uI, uI),
  h0(menuI, menuEndI),
  h0(effStartI, outsideEndI),
  '  return (',
  h0(trxI, menuJSXEndI),
  '  );',
  '};',
];
writeFileSync("src/components/headerMenuCekmece.tsx", menuDosyasi.join("\n"), "utf8");
console.log("✓ yaz: headerMenuCekmece.tsx");

const seritDosyasi = [
  'import React from "react";',
  "// ★ 04.11 SRP: HeaderTopBar'daki üst pill şeridi + Kıble modal + marquee ölçüm + şerit sürükleme kendi dosyasına taşındı.",
  'import { Coins, Gem, Shield, ShieldOff, X, Check, ChevronDown, Moon } from "lucide-react";',
  'import { LANGS, vakitAdi, sureceCevir } from "../i18n";',
  'import { isAdminEmail, getJetonVault, getPackRights, type Tier } from "../tier";',
  'import { QiblaCompass } from "./islamicToolsBolumler";',
  'import { TIER_SOZLUK } from "./headerTierSozluk";',
  'import type { ModalName, User } from "../types";',
  'import type { HeaderTopBarProps } from "./headerTopBarTypes";',
  '',
  'export type HeaderSeritPillBarProps = Pick<HeaderTopBarProps, "user" | "isMasterSürüm" | "jetonCount" | "tier" | "openPremium" | "setModal" | "notify" | "t" | "lang" | "setLang" | "langOpen" | "setLangOpen" | "setAdminGodMode" | "setSmartAiEnabled" | "setBatchFormats" | "misafirKalanHak" | "nextPrayer" | "prayerCity" | "formatRemaining"> & { toplamHak: number; banCount: number };',
  '',
  'export const HeaderSeritPillBar: React.FC<HeaderSeritPillBarProps> = ({',
  '  user, isMasterSürüm, jetonCount, tier, toplamHak, banCount, openPremium, setModal,',
  '  notify, t, lang, setLang, langOpen, setLangOpen, setAdminGodMode, setSmartAiEnabled,',
  '  setBatchFormats, misafirKalanHak, nextPrayer, prayerCity, formatRemaining,',
  '}) => {',
  h0(kS, bodyCloseI),
  h0(mR, mE),
  '  return (',
  h0(sI, serJSXEndI),
  '  );',
  '};',
];
writeFileSync("src/components/headerSeritPillBar.tsx", seritDosyasi.join("\n"), "utf8");
console.log("✓ yaz: headerSeritPillBar.tsx");

const sil = new Set();
const ekle = (a, b) => { for (let i = a; i <= b; i++) sil.add(i); };
ekle(dI, dI); ekle(uI, uI); ekle(kS, bodyCloseI); ekle(mR, mE);
ekle(menuI, menuEndI); ekle(effStartI, outsideEndI); ekle(tI, tE); ekle(eI, eI);
ekle(trxI, menuJSXEndI); ekle(sI, serJSXEndI);
if (sil.has(toolsI) || sil.has(bI) || sil.has(bE)) { console.error("✗ tools/ban korunmalıydı!"); process.exit(1); }

const menuArama = `<HeaderMenuCekmece menuOpen={menuOpen} setMenuOpen={setMenuOpen} setModal={setModal} openAdminDashboard={openAdminDashboard} openPremium={openPremium} setRoadmapOpen={setRoadmapOpen} setAdminGodMode={setAdminGodMode} setSmartAiEnabled={setSmartAiEnabled} setBatchFormats={setBatchFormats} notify={notify} handleLogout={handleLogout} user={user} tier={tier} isMasterSürüm={isMasterSürüm} banCount={banCount} t={t} />`;
const seritArama = `<HeaderSeritPillBar user={user} isMasterSürüm={isMasterSürüm} jetonCount={jetonCount} tier={tier} toplamHak={toplamHak} banCount={banCount} openPremium={openPremium} setModal={setModal} notify={notify} t={t} lang={lang} setLang={setLang} langOpen={langOpen} setLangOpen={setLangOpen} setAdminGodMode={setAdminGodMode} setSmartAiEnabled={setSmartAiEnabled} setBatchFormats={setBatchFormats} misafirKalanHak={misafirKalanHak} nextPrayer={nextPrayer} prayerCity={prayerCity} formatRemaining={formatRemaining} />`;

const out = [];
for (let i = 0; i < lines.length; i++) {
  if (i === trxI) { out.push(menuArama); continue; }
  if (i === sI) { out.push(seritArama); continue; }
  if (i === bLogI) {
    out.push(lines[i]);
    out.push('import { HeaderMenuCekmece } from "./headerMenuCekmece";');
    out.push('import { HeaderSeritPillBar } from "./headerSeritPillBar";');
    out.push('import { TIER_SOZLUK } from "./headerTierSozluk";');
    continue;
  }
  if (sil.has(i)) continue;
  out.push(lines[i]);
}
writeFileSync(p, out.join("\n"), "utf8");
console.log(`✓ Ana dosya küçültüldü: ${lines.length} → ${out.length} satır`);
