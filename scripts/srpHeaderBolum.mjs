// SRP bölme v4 — tamamen 0-based findIndex; katı kontrol atışları
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const p = "src/components/HeaderTopBar.tsx";
const lines = readFileSync(p, "utf8").split("\n");
// 0-based dilimi (a0..b0 dahil) birebir döndürür
const h0 = (a0, b0) => lines.slice(a0, b0 + 1).join("\n");
const findFrom = (s, idx0 = 0) => lines.findIndex((l, i) => i >= idx0 && l.includes(s));
const kaldir = (i0, s) => { if (!lines[i0]?.includes(s)) { console.error(`✗ SAT${i0 + 1}: beklenen "${s}"; var olan: ${lines[i0]?.slice(0, 90)}`); process.exit(1); } };

const dynI = findFrom("const [dynamicModules");
const updatesI = findFrom("const [updatesOpen");
const kibI = findFrom("const [kibleAcik");
const serumEndI = findFrom("serumClickYakala");
const marqI = findFrom("25.10 MARQUEE ÖLÇÜMÜ");
const marqEndI = findFrom("}, []);", marqI);
const menuI = findFrom("23.10 TAM MODÜL MENÜSÜ");
let menuEndI = -1; for (let i = menuI; i < menuI + 80; i++) { if ((lines[i] ?? "").trim() === "];") { menuEndI = i; break; } }
const fetchI = findFrom("fetchRemoteConfig().then");
const effStartI = fetchI - 1; // "React.useEffect(() => {" satırı
const menuCloseI = findFrom("}, [menuOpen])", effStartI);
const outsideEndI = findFrom("}, [menuOpen])", menuCloseI + 1);
const trxI = lines.findIndex((l) => l.trim() === '<div className="relative">');
const closeI = findFrom("</>", trxI);
const menuJSXEndI = closeI + 2; // "</>", ") }", "</div>"
const serI = findFrom("relative ml-auto flex min-w-0");
const hintI = findFrom("pointer-events-none absolute bottom-0", serI);
const serJSXEndI = hintI + 1;
const tierI = findFrom("const TIER_SOZLUK");
const tierEndI = findFrom("};", tierI);
const escI = findFrom("getSystemConfig, fetchRemoteConfig");
const banLogI = findFrom("import { getBanLogs }");
const toolsI = findFrom("const [toolsOpen");
const banI = findFrom("const [banCount");
const banEndI = findFrom("}, []);", banI);

// --- KONTROLLER ---
kaldir(dynI, "dynamicModules");
kaldir(updatesI, "updatesOpen");
kaldir(kibI, "kibleAcik");
kaldir(serumEndI, "serumClickYakala");
kaldir(marqI, "MARQUEE ÖLÇÜMÜ");
kaldir(marqEndI, "}, []);");
kaldir(menuI, "TAM MODÜL MENÜSÜ");
if ((lines[menuEndI] ?? "").trim() !== "];") { console.error(`✗ menuEndI ${menuEndI}`); process.exit(1); }
kaldir(effStartI, "React.useEffect");
kaldir(menuCloseI, "}, [menuOpen])");
kaldir(outsideEndI, "}, [menuOpen])");
kaldir(trxI, "relative");
if (lines[closeI].trim() !== "</>") { console.error(`✗ closeI ${closeI}`); process.exit(1); }
if ((lines[menuJSXEndI] ?? "").trim() !== "</div>") { console.error(`✗ menuJSXEndI ${menuJSXEndI}: ${lines[menuJSXEndI]}`); process.exit(1); }
kaldir(serI, "relative ml-auto");
kaldir(hintI, "pointer-events-none");
if (lines[serJSXEndI].trim() !== "</div>") { console.error(`✗ serJSXEndI ${serJSXEndI}: ${lines[serJSXEndI]}`); process.exit(1); }
kaldir(tierI, "TIER_SOZLUK");
if (lines[tierEndI].trim() !== "};") { console.error(`✗ tierEndI ${tierEndI}`); process.exit(1); }
kaldir(escI, "getSystemConfig");
kaldir(toolsI, "toolsOpen");
kaldir(banI, "banCount");
kaldir(banEndI, "}, []);");
if (toolsI !== kibI - 1) { console.error("✗ tools/kible sırası"); process.exit(1); }
if (hintI !== serJSXEndI - 1) { console.error("✗ şerit bit sırası"); process.exit(1); }
if (banEndI !== banI + 4) { console.error("✗ ban blok uzunluğu", banI, banEndI); process.exit(1); }
if (dynI < 0 || menuI < 0 || fetchI < 0 || trxI < 0 || serI < 0 || tierI < 0) { console.error("✗ bir sınır bulunamadı"); process.exit(1); }
console.log("✓ Kontroller tamam");

if (existsSync("src/components/headerMenuCekmece.tsx") || existsSync("src/components/headerSeritPillBar.tsx")) {
  console.error("✗ Hedef dosyalar zaten var — bakım modunda çıkış."); process.exit(1);
}

// --- ORTAK TIER SOZLUK ---
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

// --- MENÜ ÇEKMECESİ ---
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
  "// Props alanları HeaderTopBarProps'tan Pick ile alınır (bağlarda kopma yok) — banCount ortak sayaç.",
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

// --- ÜST ŞERİT ---
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

// --- ANA DOSYAYI KÜÇÜLT ---
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
