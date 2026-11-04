// NİHAİ v6 — ana dosyada menü/şerit JSX aralıkları tamamen silinip bileşen çağrısı ile değiştirilir.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const p = "src/components/HeaderTopBar.tsx";
const lines = readFileSync(p, "utf8").split("\n");
const h0 = (a0, b0) => lines.slice(a0, b0 + 1).join("\n");
const findFrom = (s, idx0 = 0) => lines.findIndex((l, i) => i >= idx0 && l.includes(s));
const kaldir = (i0, s) => { if (!lines[i0]?.includes(s)) { console.error(`✗ SAT${i0 + 1}: beklenen "${s}"; var olan: ${(lines[i0] ?? "").slice(0, 90)}`); process.exit(1); } };

const dynI = findFrom("const [dynamicModules");
const updatesI = findFrom("const [updatesOpen");
const toolsI = findFrom("const [toolsOpen");
const kibI = findFrom("const [kibleAcik");
const serumEndI = findFrom("serumClickYakala");
const marqI = findFrom("25.10 MARQUEE ÖLÇÜMÜ");
const marqEndI = findFrom("}, []);", marqI);
const menuI = findFrom("23.10 TAM MODÜL MENÜSÜ");
let menuEndI = -1; for (let i = menuI; i < menuI + 80; i++) { if ((lines[i] ?? "").trim() === "];") { menuEndI = i; break; } }
const fetchI = findFrom("fetchRemoteConfig().then");
const effStartI = fetchI - 1;
const menuCloseI = findFrom("}, [menuOpen])", effStartI);
const outsideEndI = findFrom("}, [menuOpen])", menuCloseI + 1);
const trxI = lines.findIndex((l) => l.trim() === '<div className="relative">');
const hedI = findFrom("menuHediyeKodu");
const menuJSXEndI = hedI + 5;
const serI = findFrom("relative ml-auto flex min-w-0");
const hintI = findFrom("pointer-events-none absolute bottom-0", serI);
const serJSXEndI = hintI + 1;
const tierI = findFrom("const TIER_SOZLUK");
const tierEndI = findFrom("};", tierI);
const escI = findFrom("getSystemConfig, fetchRemoteConfig");
const banLogI = findFrom("import { getBanLogs }");
const banI = findFrom("const [banCount");
const banEndI = findFrom("}, []);", banI);

kaldir(dynI, "dynamicModules");
kaldir(updatesI, "updatesOpen");
kaldir(kibI, "kibleAcik");
kaldir(serumEndI, "serumClickYakala");
kaldir(marqI, "MARQUEE ÖLÇÜMÜ");
kaldir(marqEndI, "}, []);");
kaldir(menuI, "TAM MODÜL MENÜSÜ");
if ((lines[menuEndI] ?? "").trim() !== "];") { console.error(`✗ menuEndI`); process.exit(1); }
kaldir(effStartI, "React.useEffect");
kaldir(menuCloseI, "}, [menuOpen])");
kaldir(outsideEndI, "}, [menuOpen])");
kaldir(trxI, "relative");
kaldir(hedI, "menuHediyeKodu");
if ((lines[hedI + 1] ?? "").trim() !== "</button>") { console.error(`✗ hedI+1: ${(lines[hedI + 1] ?? "").slice(0, 60)}`); process.exit(1); }
if ((lines[hedI + 2] ?? "").trim() !== "</div>") { console.error(`✗ hedI+2`); process.exit(1); }
if ((lines[hedI + 3] ?? "").trim() !== "</>") { console.error(`✗ hedI+3: ${(lines[hedI + 3] ?? "").slice(0, 60)}`); process.exit(1); }
if ((lines[hedI + 4] ?? "").trim() !== ")}" && (lines[hedI + 4] ?? "").trim() !== ") }") { console.error(`✗ hedI+4: "${lines[hedI + 4]}"`); process.exit(1); }
if ((lines[menuJSXEndI] ?? "").trim() !== "</div>") { console.error(`✗ menuJSXEndI`); process.exit(1); }
kaldir(serI, "relative ml-auto");
kaldir(hintI, "pointer-events-none");
if (lines[serJSXEndI].trim() !== "</div>") { console.error(`✗ serJSXEndI`); process.exit(1); }
kaldir(tierI, "TIER_SOZLUK");
if (lines[tierEndI].trim() !== "};") { console.error(`✗ tierEndI`); process.exit(1); }
kaldir(escI, "getSystemConfig");
kaldir(banI, "banCount");
kaldir(banEndI, "}, []);");
if (toolsI !== kibI - 1) { console.error("✗ tools/kible sırası"); process.exit(1); }
if (hintI !== serJSXEndI - 1) { console.error("✗ şerit bit sırası"); process.exit(1); }
if (banEndI !== banI + 4) { console.error("✗ ban blok uzunluğu"); process.exit(1); }
console.log("✓ Kontroller tamam");

if (existsSync("src/components/headerMenuCekmece.tsx") || existsSync("src/components/headerSeritPillBar.tsx")) {
  console.error("✗ Hedef dosyalar zaten var — ikinci koşum riski."); process.exit(1);
}

// --- ORTAK TIER SOZLUK (zaten yazılı olabilir; tereddüt yok — yaz) ---
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

// --- MENÜ ÇEKMECESİ (kesim dosyasına taşınır state/JSX verileri) ---
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
  h0(dynI, dynI),
  h0(updatesI, updatesI),
  h0(menuI, menuEndI),
  h0(effStartI, outsideEndI),
  '  return (',
  h0(trxI, menuJSXEndI),
  '  );',
  '};',
];
writeFileSync("src/components/headerMenuCekmece.tsx", menuDosyasi.join("\n"), "utf8");
console.log("✓ yaz: headerMenuCekmece.tsx");

// --- ÜST ŞERİT (kesim dosyasına taşınır state/JSX verileri) ---
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
  h0(kibI, serumEndI),
  h0(marqI, marqEndI),
  '  return (',
  h0(serI, serJSXEndI),
  '  );',
  '};',
];
writeFileSync("src/components/headerSeritPillBar.tsx", seritDosyasi.join("\n"), "utf8");
console.log("✓ yaz: headerSeritPillBar.tsx");

// --- ANA DOSYAYI KÜÇÜLT — menü/şerit JSX aralıkları dahil hepsi silinir, bileşen çağrısı girer ---
const sil = new Set();
const ekle = (a, b) => { for (let i = a; i <= b; i++) sil.add(i); };
ekle(dynI, dynI);
ekle(updatesI, updatesI);
ekle(kibI, serumEndI);
ekle(marqI, marqEndI);
ekle(menuI, menuEndI);
ekle(effStartI, outsideEndI);
ekle(tierI, tierEndI);
ekle(escI, escI);
ekle(trxI, menuJSXEndI);
ekle(serI, serJSXEndI);
if (sil.has(toolsI) || sil.has(banI) || sil.has(banEndI)) { console.error("✗ tools/ban korunmalıydı!"); process.exit(1); }

const menuArama = `<HeaderMenuCekmece menuOpen={menuOpen} setMenuOpen={setMenuOpen} setModal={setModal} openAdminDashboard={openAdminDashboard} openPremium={openPremium} setRoadmapOpen={setRoadmapOpen} setAdminGodMode={setAdminGodMode} setSmartAiEnabled={setSmartAiEnabled} setBatchFormats={setBatchFormats} notify={notify} handleLogout={handleLogout} user={user} tier={tier} isMasterSürüm={isMasterSürüm} banCount={banCount} t={t} />`;
const seritArama = `<HeaderSeritPillBar user={user} isMasterSürüm={isMasterSürüm} jetonCount={jetonCount} tier={tier} toplamHak={toplamHak} banCount={banCount} openPremium={openPremium} setModal={setModal} notify={notify} t={t} lang={lang} setLang={setLang} langOpen={langOpen} setLangOpen={setLangOpen} setAdminGodMode={setAdminGodMode} setSmartAiEnabled={setSmartAiEnabled} setBatchFormats={setBatchFormats} misafirKalanHak={misafirKalanHak} nextPrayer={nextPrayer} prayerCity={prayerCity} formatRemaining={formatRemaining} />`;

const out = [];
for (let i = 0; i < lines.length; i++) {
  if (sil.has(i)) continue;
  if (i === trxI) { out.push(menuArama); continue; }
  if (i === serI) { out.push(seritArama); continue; }
  if (i === banLogI + 1) {
    out.push(lines[i]);
    out.push('import { HeaderMenuCekmece } from "./headerMenuCekmece";');
    out.push('import { HeaderSeritPillBar } from "./headerSeritPillBar";');
    out.push('import { TIER_SOZLUK } from "./headerTierSozluk";');
    continue;
  }
  out.push(lines[i]);
}
writeFileSync(p, out.join("\n"), "utf8");
console.log(`✓ Ana dosya küçültüldü: ${lines.length} → ${out.length} satır`);
