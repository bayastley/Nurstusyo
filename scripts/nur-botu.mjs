// NUR BOTU v2 — nurstudyo.com tam otomatik video üretici
// Kullanım:
//   node scripts/nur-botu.mjs deneme [adet]  → plan.json'dan sıradaki boş klasörlerden N video üretir (default 6)
//   node scripts/nur-botu.mjs topla          → sitede bekleyen çıktıları toplu indirip klasörlere dağıtır
//   node scripts/nur-botu.mjs giris          → (acil) pencere modunda elle giriş bekler
// Varyant: HAREKETLI klasöründeki 0001-FATIHA/bilgi.txt'teki VARYANT satırına göre (sablon|hareketli)
// NOT: Headless (penceresiz) çalışır; NUR_HEADLESS=0 ile pencere moduna geçilir.
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DURUM = path.join(import.meta.dirname, "bot-durum.txt");
const PLAN = path.join(import.meta.dirname, "plan.json");
const PROFIL = path.join(os.homedir(), ".nur-bot-profil");
const SITE = "https://www.nurstudyo.com";
const GOOGLE_EMAIL_HINT = "kayaom1233@gmail.com";
const HEADLESS = process.env.NUR_HEADLESS !== "0";
const IZLENIM = path.join(import.meta.dirname, "cef-izlenim.json");

// pencere modundan yakalanan tarayıcı kimlik izlenimi (UA + ekran) —
// headless bununla açılırsa sitenin parmak izi kontrolü (secureStore) uyuşur, oturum görünür
function izlenimOku() {
  try { return JSON.parse(fs.readFileSync(IZLENIM, "utf8")); } catch { return null; }
}
async function izlenimKaydet(sayfa) {
  try {
    const iz = await sayfa.evaluate(() => ({ ua: navigator.userAgent, w: screen.width, h: screen.height }));
    fs.writeFileSync(IZLENIM, JSON.stringify(iz));
    durum(`  📸 Kimlik izlenimi kaydedildi (${iz.w}x${iz.h})`);
  } catch { /* */ }
}

function durum(mesaj) {
  const satir = `[${new Date().toLocaleTimeString("tr-TR")}] ${mesaj}`;
  console.log(satir);
  fs.appendFileSync(DURUM, satir + "\n");
}

const ANTI_THROTTLE = [
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-features=CalculateNativeWinOcclusion,PreventMultipleAutomaticDownloads,IntensiveWakeUpThrottling",
  "--disable-blink-features=AutomationControlled",
];

// ★ GİZLİLİK YAMASI: pencere küçültülse/örtülse bile site "görünür" sanıp ÇİZMEYE DEVAM ETSİN.
// Kayıt canvas.captureStream ile oluyor — canvas boyanmazsa kayıt DONUK akıyor (3 videoluk kanıt).
// rAF Chrome tarafından arka planda durdurulur; onu zamanlayıcıya çeviriyoruz (kısmama bayraklarla kapalı).
function gizlilikYamasi() {
  try {
    Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
    Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
    const w = window;
    if (!w.__nurRafYamali) {
      w.__nurRafYamali = true;
      const bekleyenler = new Set();
      let sayac = 1;
      w.requestAnimationFrame = (cb) => { bekleyenler.add(cb); return sayac++; };
      w.cancelAnimationFrame = () => { /* no-op */ };
      setInterval(() => {
        const t = performance.now();
        for (const cb of [...bekleyenler]) {
          bekleyenler.delete(cb);
          try { cb(t); } catch { /* */ }
        }
      }, 33);
    }
  } catch { /* */ }
}

async function tarayiciAc() {
  const hl = process.env.NUR_HEADLESS !== "0"; // her açılışta taze oku (geçici pencere modu için)
  const iz = hl ? izlenimOku() : null;
  durum(`Tarayıcı açılıyor (${hl ? "penceresiz/headless" : "pencere"} mod${iz ? ", kimlik izlenimiyle" : ""}, kendi profilinde)...`);
  const ayarlar = {
    channel: "chrome",
    headless: hl,
    args: ANTI_THROTTLE.concat(iz ? [`--window-size=${iz.w},${iz.h}`] : []),
    acceptDownloads: true,
    permissions: ["geolocation", "notifications"],
  };
  if (iz) { ayarlar.userAgent = iz.ua; ayarlar.screen = { width: iz.w, height: iz.h }; }
  let ctx;
  try {
    ctx = await chromium.launchPersistentContext(PROFIL, { ...ayarlar, viewport: hl && !iz ? { width: 1440, height: 900 } : null });
  } catch {
    durum("Chrome kanalı bulunamadı, yüklü yoldan deneniyor...");
    ctx = await chromium.launchPersistentContext(PROFIL, { ...ayarlar, viewport: hl && !iz ? { width: 1440, height: 900 } : null, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  }
  const sayfa = ctx.pages()[0] ?? (await ctx.newPage());
  await ctx.addInitScript(gizlilikYamasi).catch(() => undefined);
  return { ctx, sayfa };
}

// pencereyi öne getir (headless'ta gereksiz — pencere yok)
function pencereOnuneGetir() {
  if (HEADLESS) return;
  try {
    execSync(`powershell -NoProfile -Command "
Add-Type @'
using System; using System.Runtime.InteropServices;
public class W { [DllImport(\\"user32.dll\\")] public static extern bool SetForegroundWindow(IntPtr h); [DllImport(\\"user32.dll\\")] public static extern bool ShowWindow(IntPtr h, int c); }
'@
$p = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' } | Sort-Object StartTime | Select-Object -First 1;
if ($p) { [W]::ShowWindow($p.MainWindowHandle, 9) | Out-Null; [W]::SetForegroundWindow($p.MainWindowHandle) | Out-Null; Write-Output 'ONCE' } else { Write-Output 'YOK' }
"`, { timeout: 15000, stdio: ["ignore", "pipe", "ignore"] });
  } catch { /* başarısız olursa da devam */ }
}

async function girisBekle(sayfa, sureMs = 15 * 60 * 1000) {
  durum("Site açılıyor: " + SITE);
  await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
  durum("=== SENİN İŞİN: Chrome penceresinde admin hesabınla GİRİŞ YAP ===");
  const t0 = Date.now();
  while (Date.now() - t0 < sureMs) {
    if (await oturumMu(sayfa)) { durum("✅ Giriş algılandı."); return true; }
    await popuplariKapat(sayfa);
    await sayfa.waitForTimeout(3000);
  }
  durum("⏰ Giriş beklenirken zaman doldu.");
  return false;
}

async function oturumMu(sayfa) {
  const m = await guvenliEval(sayfa, () => document.body?.innerText ?? "", 8000);
  return !!m && (m.includes("SINIRSIZ") || m.includes("ADMIN"));
}
async function oturumBekleGenel(sayfa, sureMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < sureMs) {
    if (await oturumMu(sayfa)) return true;
    await popuplariKapat(sayfa);
    await sayfa.waitForTimeout(3000);
  }
  return false;
}

async function guvenliEval(sayfa, fn, ms = 10000) {
  try {
    return await Promise.race([
      sayfa.evaluate(fn),
      new Promise((r) => setTimeout(() => r(null), ms)),
    ]);
  } catch { return null; }
}

async function popuplariKapat(sayfa) {
  await guvenliEval(sayfa, () => {
    const esles = (t) => /^(üret|onayla)|anlad[ıi]m|devam et|kabul|accept|tamam|onayl[ıi]/i.test(t || "");
    // ★ KATİL ENGELLENCESİ: "Üretimi İptal Et" de ^üret ile başlar — onu asla tıklama,
    //   yoksa bot kendi üretimini 4. saniyede iptal eder (toast kanıtı: "Üretim iptal edildi · jeton düşmedi").
    [...document.querySelectorAll("button, [role=button]")]
      .filter((b) => { const t = (b.innerText || "").trim(); return esles(t) && !/iptal/i.test(t); })
      .forEach((b) => b.click());
  }, 8000);
  await sayfa.waitForTimeout(500);
}

async function indirmeKlasoruSayisi(sayfa) {
  const t = await guvenliEval(sayfa, () => document.body?.innerText ?? "", 8000);
  const m = (t ?? "").match(/İndirme Klasörü\s*\n?\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function canliDurum(sayfa) {
  const t = await guvenliEval(sayfa, () => document.body?.innerText ?? "", 8000);
  const m = (t ?? "").match(/\b(\d{1,3})\s*%/);
  return { yuzde: m ? m[1] : null, ham: (t ?? "").slice(0, 120) };
}

async function botChromeleriKapat() {
  try { execSync("powershell -NoProfile -Command \"Get-CimInstance Win32_Process -Filter \\\"Name='chrome.exe'\\\" | Where-Object { $_.CommandLine -match 'nur-bot-profil' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }\"", { stdio: "ignore", timeout: 20000 }); } catch { /* yoksa sorun değil */ }
  await new Promise((r) => setTimeout(r, 1500));
}

// ★ OTOMATİK GİRİŞ: ☰ menü → Kayıt Ol/Giriş Yap → Google ile Devam Et → profil seç
async function otomatikGiris(sayfa) {
  durum("  🤖 Otomatik giriş deneniyor (menü → giriş → Google)...");
  const menuAcildi = await guvenliEval(sayfa, () => {
    const hamburger = [...document.querySelectorAll("header button")].find((b) => b.querySelector("svg") && !b.getAttribute("aria-label"));
    if (!hamburger) return false;
    hamburger.click();
    return true;
  }, 8000);
  if (!menuAcildi) { durum("  ⚠️ menü butonu bulunamadı"); return false; }
  await sayfa.waitForTimeout(800);
  const girisButonu = sayfa.getByText("Kayıt Ol / Giriş Yap").first();
  if (!(await girisButonu.isVisible().catch(() => false))) { durum("  ⚠️ 'Kayıt Ol / Giriş Yap' menüde yok"); return false; }
  await girisButonu.click({ timeout: 5000 }).catch(() => undefined);
  await sayfa.waitForTimeout(1200);
  const googleBtn = sayfa.getByText("Google ile Devam Et").first();
  if (!(await googleBtn.isVisible().catch(() => false))) { durum("  ⚠️ Google butonu görünür değil"); return false; }
  await googleBtn.click({ timeout: 5000 }).catch(() => undefined);
  durum("  Google'a yönlendirildi, hesap seçimi bekleniyor...");
  try { await sayfa.waitForURL(/accounts\.google\.com/, { timeout: 20000 }); } catch { durum("  ⚠️ accounts.google.com'a yönlenmedi"); return false; }
  await sayfa.waitForTimeout(3000);
  const profilSecildi = await guvenliEval(sayfa, (eposta) => {
    const adaylar = [...document.querySelectorAll("div[role=link], div[data-identifier], li div")];
    const hedef = adaylar.find((d) => (d.innerText || "").includes(eposta));
    if (hedef) { hedef.click(); return "eposta-ile"; }
    const ilk = document.querySelector("div[role=link]");
    if (ilk) { ilk.click(); return "ilk-profil"; }
    return null;
  }, 10000).then((r) => r ?? null).catch(() => null);
  if (!profilSecildi) {
    // headless'ta Google kullanıcı etkileşimi isterse: sayfa görünürlüğünü simüle et ve tekrar dene
    await sayfa.evaluate(() => { try { Object.defineProperty(document, "visibilityState", { get: () => "visible" }); Object.defineProperty(document, "hidden", { get: () => false }); } catch { /* */ } }).catch(() => undefined);
    await sayfa.waitForTimeout(2500);
    const ikinci = await guvenliEval(sayfa, (eposta) => {
      const adaylar = [...document.querySelectorAll("div[role=link], div[data-identifier], li div")];
      const hedef = adaylar.find((d) => (d.innerText || "").includes(eposta)) ?? document.querySelector("div[role=link]");
      if (hedef) { hedef.click(); return "tekrar"; }
      return null;
    }, 10000).catch(() => null);
    if (!ikinci) { durum("  ⚠️ Google profil seçilemedi (şifre isteyebilir)"); return false; }
    durum("  Google profili seçildi (2. deneme)");
  } else {
    durum(`  Google profili seçildi (${profilSecildi})`);
  }
  await sayfa.waitForURL((u) => !String(u).includes("accounts.google"), { timeout: 30000 }).catch(() => undefined);
  await sayfa.waitForTimeout(5000);
  for (let i = 0; i < 10; i++) {
    if (await oturumMu(sayfa)) { durum("  ✅ Otomatik giriş başarılı — admin aktif"); return true; }
    await popuplariKapat(sayfa);
    await sayfa.waitForTimeout(3000);
  }
  return false;
}

// ---------- klasör/varyant/plan ----------
const HAREKETLI_ROOT = path.join(os.homedir(), "Desktop", "OTOMATIK INDIRICI - HAREKETLI");
const SABLON_ROOT = path.join(os.homedir(), "Desktop", "OTOMATIK INDIRICI - SABLON");
const SABLON_TAMAM = path.join(import.meta.dirname, "sablon-tamam.flag");
// ★ ŞABLON SINIRI (kullanıcı kararı): şablon seti yalnızca 1.063 işe kadar üretilir —
//   Sudays bölgesi (sure 1-40 + Fussilet 1-11) Muaiqly ile ikinci kez üretilir;
//   1064+ (sure 41+) hareketli sette zaten Muaiqly — kopya üretim gereksiz.
const SABLON_SINIR = 1063;
const TASLAK = path.join(os.homedir(), "Desktop", "OTOMATIK INDIRICI - TASLAK");

const normaliz = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[ıİ]/g, "i").toLowerCase().replace(/[^a-z0-9]/g, "");

function varyantBul() {
  // ★ KALICI İŞARET: bot-mod.txt — bilgi.txt yenilemeleri VARYANT satırını sildiği için mod
  //   yanlışlıkla "hareketli"e dönerdi. Artık karar bu dosyadan (sablon|hareketli).
  try {
    const m = fs.readFileSync(path.join(import.meta.dirname, "bot-mod.txt"), "utf8").trim().toLowerCase();
    if (m === "sablon" || m === "hareketli") return m;
  } catch { /* yoksa eski yöntem */ }
  try {
    const txt = fs.readFileSync(path.join(HAREKETLI_ROOT, "0001-FATIHA", "bilgi.txt"), "utf8");
    if (/VARYANT:\s*sablon/i.test(txt)) return "sablon";
  } catch { /* yoksa default */ }
  return "hareketli";
}

function isHedef(job, kok) {
  const klasor = path.join(kok, job.folder);
  return fs.existsSync(path.join(klasor, `${job.videoName}.mp4`)) || fs.existsSync(path.join(klasor, `${job.videoName}.webm`));
}

// site etiketi ("Bakara 2:80 +3 • Abdurrahman es-Sudays • 9:16 ...") → plan işi + kök
// ★ KÂRİ GEÇİŞİ: hareketli varyantta sure 41+ işler (Fussilet ve sonrası) bilerek Muaiqly ile üretilir
//   (kanal verisi: Muaiqly = "Potansiyel sınırlama"sız + daha yüksek izlenme). Toplayıcı bu videoları
//   ŞABLON'a değil HAREKETLI sete koymalı — aktif varyant burada taşınır.
let AKTIF_VARYANT = "hareketli";
// ★ Site etiketi iki şekilde olabilir: "ilk ayet + ilave" YA DA "son ayet + ilave" — ikisi de denenir,
//   hangisi plandaki gerçek bir işe (a,b) denk gelirse o alınır. Bu sayfa 0021'in çökmeleriyle karışan etiketleri de çözer.
function etiketCoz(etiket) {
  const m = etiket.match(/^(.+?)\s+(\d+):(\d+)\s*(?:\+(\d+))?(?:\s*•\s*([^•]+))?/);
  if (!m) return null;
  const [, sureAd, , sayi, ekle, reciter] = m;
  const sayiN = parseInt(sayi, 10);
  const ekleN = ekle ? parseInt(ekle, 10) : 0;
  const plan = JSON.parse(fs.readFileSync(PLAN, "utf8"));
  const adaylar = ekleN > 0
    ? [
        { a: sayiN, b: sayiN + ekleN },              // yorum A: ilk ayet + ekle
        { a: sayiN - ekleN, b: sayiN },              // yorum B: son ayet − ekle (ekranda kanıtlandı)
      ]
    : [{ a: sayiN, b: sayiN }];                    // tek ayet
  let is = null;
  for (const aday of adaylar) {
    is = plan.find((p) => normaliz(p.surah) === normaliz(sureAd.trim()) && p.a === aday.a && p.b === aday.b) ?? null;
    if (is) break;
  }
  // son çare: etiket aralığı bir plan işinin içine oturuyorsa (kısmi grup) o işi ver
  if (!is && ekleN > 0) {
    const lo = Math.min(...adaylar.map((d) => d.a));
    const hi = Math.max(...adaylar.map((d) => d.b));
    is = plan.find((p) => normaliz(p.surah) === normaliz(sureAd.trim()) && p.a <= lo && p.b >= hi) ?? null;
  }
  const sonAday = is ?? adaylar[0];
  const sudaysMi = /sudays/i.test(reciter ?? "");
  const muaiqlyMi = /muaiqly/i.test(reciter ?? "");
  // ★ Kâri geçişi sonrası: hareketli varyantta sure 41+ Muaiqly çıktılar yine HAREKETLI_ROOT'a gider
  //   (şablon varyantı ya da sure 41 altındaki Muaiqly çıktılar eskisi gibi SABLON_ROOT'a)
  const kok = sudaysMi ? HAREKETLI_ROOT
    : muaiqlyMi ? (AKTIF_VARYANT === "hareketli" ? HAREKETLI_ROOT : SABLON_ROOT) // ★ v5: hareketlide TÜM Muaiqly çıktılar HAREKETLI'ye
    : null;
  return { is, kok, reciter: reciter.trim(), bas: sonAday.a, bitis: sonAday.b };
}

// ★ LİSTE KURTARMA: yeni site davranışında üretilen videolar otomatik inmiyor,
//   "N Videoyu İndir" listesinde birikiyor. Bu fonksiyon listedekileri toplu indirip
//   etiketten doğru klasöre yerleştirir, mp4'e çevirip tarar.
// İndirme Klasörü hiç boşalmadığı için indirilen etiketleri diske yazarız —
// bot yeniden doğsa bile aynı çıktıyı ikinci kez indirmesin (zaman hortumunu keser).
const TOPLANAN_DOSYA = path.join(import.meta.dirname, "toplanan.txt");
const TOPLANAN = new Set((() => { try { return fs.readFileSync(TOPLANAN_DOSYA, "utf8").split("\n").filter(Boolean); } catch { return []; } })());
const toplananKaydet = (l) => { TOPLANAN.add(l); try { fs.appendFileSync(TOPLANAN_DOSYA, l + "\n"); } catch { /* */ } };
async function listeyiOku(sayfa) {
  // ★ Başlık "İndirme Klasörü <span>5</span>" biçiminde — childless-element şartı ASLA tutmuyordu (14 saatlik tıkanmanın kökü).
  return await guvenliEval(sayfa, () => {
    const temiz = (s) => (s ?? "").replace(/\s+/g, " ").trim();
    const baslik = [...document.querySelectorAll("p,span,div")].find((e) => /İndirme Klasörü/.test(e.textContent || "") && (e.textContent || "").length < 60);
    if (!baslik) return [];
    const kart = baslik.closest("div.rounded-2xl") ?? baslik.closest("div")?.parentElement;
    if (!kart) return [];
    return [...kart.querySelectorAll("p.truncate")].map((p) => temiz(p.textContent)).filter((t) => t && /\d+\s*:\s*\d+/.test(t) && !/^\d+:\d\d\s*·/.test(t));
  }, 8000).catch(() => []);
}
async function listeyiIndirVeYerlestir(sayfa) {
  const GECICI = path.join(import.meta.dirname, "kurtarma-gecici");
  fs.mkdirSync(GECICI, { recursive: true });
  let satirlar = [];
  for (let i = 0; i < 5; i++) {
    satirlar = (await listeyiOku(sayfa)) ?? [];
    if (satirlar.length) break;
    await sayfa.waitForTimeout(2500);
  }
  // ★ İndirme Klasörü asla otomatik boşalmaz — diskte hedefi olan / daha önce alınanları ele, kalanı indir
  const hedefVar = (is) => [HAREKETLI_ROOT, SABLON_ROOT].some((kok) =>
    fs.existsSync(path.join(kok, is.folder, is.videoName + ".mp4")) || fs.existsSync(path.join(kok, is.folder, is.videoName + ".webm")));
  const gerekli = [];
  for (const l of satirlar) {
    if (TOPLANAN.has(l)) continue;
    const c = etiketCoz(l);
    if (c?.is && hedefVar(c.is)) { toplananKaydet(l); continue; }
    gerekli.push(l);
  }
  if (!gerekli.length) return 0;
  // ★ DOM seçicisi etiketleri görmese bile sayacın kendisi güvenilir sinyal — ona göre topla
  const klasordeki = await indirmeKlasoruSayisi(sayfa);
  const beklenen = Math.max(gerekli.length, klasordeki === 0 ? 0 : gerekli.length || klasordeki);
  if (beklenen < 1) { try { fs.rmSync(GECICI, { recursive: true, force: true }); } catch { /* */ } return 0; }
  durum(`  📥 Listede ${satirlar.length} video, ${gerekli.length} eksik — toplanıyor...`);
  const toplama = (async () => {
    const ds = [];
    for (let i = 0; i < beklenen; i++) {
      try {
        const d = await sayfa.waitForEvent("download", { timeout: 45000 });
        const yol = path.join(GECICI, `kurtar-${Date.now()}-${i}.webm`);
        await d.saveAs(yol).catch((e) => durum(`  ⚠️ kaydetmedi (${i}): ${e.message}`));
        ds.push({ i, yol, ad: d.suggestedFilename() ?? "" });
        durum(`  ⬇ ${i + 1}/${beklenen}: alındı (${d.suggestedFilename() ?? "?"})`);
      } catch (e) { durum(`  ⚠️ indirme beklenemedi (${i}): ${e.message}`); break; }
    }
    return ds;
  })();
  const topluBtn = sayfa.getByRole("button", { name: /Videoyu İndir|Videoyu Indir/i });
  if (await topluBtn.count()) await topluBtn.first().click({ timeout: 10000 });
  else await sayfa.locator("a[download]").first().click({ timeout: 10000 });
  const dosyalar = await toplama;
  let n = 0;
  const plan = JSON.parse(fs.readFileSync(PLAN, "utf8"));
  for (const d of dosyalar) {
    if (gerekli[d.i]) toplananKaydet(gerekli[d.i]);
    if (!d.yol || !fs.existsSync(d.yol)) continue;
    // 1) etiketten çöz, 2) olmazsa önerilen adın sıra numarasından (nur-studyo-N) eşleştir
    let cozum = etiketCoz(gerekli[d.i] ?? "");
    if ((!cozum || !cozum.is) && d.ad) {
      const sira = d.ad.match(/nur-studyo-(\d+)/i);
      if (sira) cozum = etiketCoz(gerekli[parseInt(sira[1], 10) - 1] ?? "");
    }
    if (!cozum || !cozum.is) { durum(`  ⚠️ eşleşmedi: ${d.ad || satirlar[d.i] || "(etiket yok)"}`); continue; }
    // kök belirsizse (etikette kâri yok) — mp4'ü OLMAYAN sete koy
    if (!cozum.kok) {
      const hedefVar = (kok) => fs.existsSync(path.join(kok, cozum.is.folder, cozum.is.videoName + ".mp4")) || fs.existsSync(path.join(kok, cozum.is.folder, cozum.is.videoName + ".webm"));
      cozum.kok = !hedefVar(HAREKETLI_ROOT) ? HAREKETLI_ROOT : !hedefVar(SABLON_ROOT) ? SABLON_ROOT : HAREKETLI_ROOT;
    }
    const hedef = path.join(cozum.kok, cozum.is.folder, `${cozum.is.videoName}.webm`);
    if (fs.existsSync(hedef) || fs.existsSync(hedef.replace(".webm", ".mp4"))) continue;
    fs.mkdirSync(path.dirname(hedef), { recursive: true });
    fs.copyFileSync(d.yol, hedef);
    if (await webmToMp4VeTara(hedef)) { try { fs.unlinkSync(hedef); } catch { /* */ } }
    n++;
    durum(`  ✅ kurtarıldı: ${cozum.is.folder}`);
  }
  try { fs.rmSync(GECICI, { recursive: true, force: true }); } catch { /* */ }
  return n;
}

async function webmToMp4VeTara(webmYol) {
  const mp4Yol = webmYol.replace(/\.webm$/, ".mp4");
  try {
    execSync(`ffmpeg -y -i "${webmYol}" -c:v h264_nvenc -preset p5 -cq 23 -c:a aac -b:a 160k -movflags +faststart "${mp4Yol}"`, { timeout: 300000, stdio: "ignore" });
  } catch (e) {
    durum(`  ⚠️ mp4 dönüşüm hatası (webm duruyor): ${e.message}`);
    return false;
  }
  try {
    const tarama = execSync(`ffmpeg -i "${mp4Yol}" -vf freezedetect=n=-45dB:d=3 -f null - 2>&1`, { encoding: "utf8", timeout: 300000, shell: true });
    const donmalar = [...tarama.matchAll(/freeze_duration: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
    const toplam = donmalar.reduce((a, b) => a + b, 0);
    // Video süresini ffprobe ile al (yoksa 40sn varsay)
    let sure = 40;
    try {
      const p = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${mp4Yol}"`, { encoding: "utf8", timeout: 30000, shell: true }).trim();
      const s = parseFloat(p);
      if (Number.isFinite(s) && s > 0) sure = s;
    } catch { /* varsayılan */ }
    const oran = sure > 0 ? toplam / sure : 0;
    if (oran > 0.6) {
      durum(`  ⚠️ GERÇEKTEN DONUK (videoyun %${Math.round(oran * 100)}'i donma) — siliniyor, tekrar üretilecek`);
      try { fs.unlinkSync(mp4Yol); } catch { /* */ }
      try { fs.unlinkSync(webmYol); } catch { /* */ }
      return "donuk";
    }
    durum(`  ✅ mp4 temiz (donma: ${toplam.toFixed(1)}/${sure.toFixed(0)} sn = %${Math.round(oran * 100)} — sakin sahne normal) — webm siliniyor`);
    try { fs.unlinkSync(webmYol); } catch { /* */ }
    return true;
  } catch (e) {
    durum(`  ⚠️ donukluk taraması çalışmadı (mp4 duruyor): ${e.message}`);
    return false;
  }
}

async function uretVeIndir(sayfa, job, kok, kari, sira, toplam) {
  const hedefKlasor = path.join(kok, job.folder);
  fs.mkdirSync(hedefKlasor, { recursive: true });
  const webmYol = path.join(hedefKlasor, `${job.videoName}.webm`);
  if (isHedef(job, kok)) { durum(`[${sira}/${toplam}] ↷ zaten var, atlanıyor: ${job.folder}`); return; }
  durum(`[${sira}/${toplam}] BAŞLIYOR: ${job.folder} (${job.surah} ${job.a}-${job.b})`);
  await popuplariKapat(sayfa);
  pencereOnuneGetir();

  // 0) ★★★ MOD ÖNCE BASILIR (vid sızıntısı kökten kesilir) ★★★
  //   Kök neden: sitede sayfa açılışında varsayılan mod "hareketli"; ayet eklendiği anda
  //   fallback, o anki sekme türünden klip atıyor. Ayetler önce eklenip mod SONRA basılırsa
  //   ilk ayetler hareketli klipte kalabiliyordu (0002'deki karga kanıtı!).
  //   Çözüm: her işin EN BAŞINDA (0 ayet seçiliyken) mod tuşuna bas → tüm ayetler
  //   DOĞRU türde atanır. İş sonunda tekrar basılmasa da olur ama garantici ikinci basış kalsın.
  durum(`  🎛️ Mod ÖNCE ayarlanıyor: ${AKTIF_VARYANT === "sablon" ? "Şablon V2" : "Hareketli Video"}`);
  await sayfa.getByRole("button", { name: AKTIF_VARYANT === "sablon" ? "Şablon V2" : "Hareketli Video" }).first().click().catch(() => undefined);
  await sayfa.waitForTimeout(400);

  // 1) seçili ayetleri DOĞRULANMIŞ şekilde temizle
  const seciliSay = async () => parseInt((await guvenliEval(sayfa, () => (document.body?.innerText ?? "").match(/SEÇİLİ AYETLER\s*\((\d+)\)/)?.[1] ?? "-1", 8000)) ?? "-1", 10);
  let n = await seciliSay();
  for (let deneme = 0; deneme < 5 && n !== 0; deneme++) {
    if (n < 0) { durum("  ⚠️ SEÇİLİ AYETLER yazısı bulunamadı"); break; }
    durum(`  Temizleniyor (${n} ayet var)... deneme ${deneme + 1}`);
    await popuplariKapat(sayfa);
    await guvenliEval(sayfa, () => {
      const el = [...document.querySelectorAll("button, span, a, div")]
        .find((e) => e.childElementCount === 0 && (e.innerText || "").trim() === "Temizle");
      if (el) el.click();
    }, 8000);
    await sayfa.waitForTimeout(1200);
    n = await seciliSay();
  }
  if (n !== 0) {
    await sayfa.screenshot({ path: path.join(import.meta.dirname, "debug-temizle.png") }).catch(() => undefined);
    throw new Error(`Temizleme başarısız (seçili: ${n})`);
  }
  durum("  ✅ Seçim temiz (0 ayet)");

  // 2) sure seç (etiketi select'ten bul — sayıya göre) + DOĞRULA
  const sureSelect = sayfa.locator("select").nth(0);
  const sureLabel = await sureSelect.evaluate((el, no) => {
    const o = [...el.options].find((o) => o.textContent.trim().startsWith(no + ". "));
    return o ? o.textContent.trim() : null;
  }, String(job.surahNo));
  if (!sureLabel) throw new Error(`Sure ${job.surahNo} seçenekleri arasında yok`);
  for (let deneme = 0; deneme < 3; deneme++) {
    await sureSelect.selectOption({ label: sureLabel }).catch(() => undefined);
    await sayfa.waitForTimeout(900);
    const aktif = await sureSelect.evaluate((el) => el.selectedOptions[0]?.textContent ?? "?");
    if (aktif.trim().startsWith(job.surahNo + ". ")) { durum(`  ✅ Sure seçildi: ${aktif.trim()}`); break; }
    durum(`  ⚠️ Sure seçilemedi (aktif: ${aktif.trim()}), tekrar`);
  }

  // 3) ayetleri a..b tek tıkla ekle + doğrula (çip: "Sure 2:1" formatı)
  const cipAra = async (no, a) => {
    const govde = await guvenliEval(sayfa, () => document.body?.innerText ?? "", 10000);
    if (!govde) return false;
    const bolum = govde.match(/SEÇİLİ AYETLER[\s\S]{0,600}/)?.[0] ?? "";
    return new RegExp(job.surahNo + ":" + a + "\\b").test(bolum);
  };
  for (let a = job.a; a <= job.b; a++) {
    await sayfa.locator("select").nth(1).selectOption({ label: String(a) }).catch(async () => {
      await sayfa.locator("select").nth(1).selectOption({ index: a }).catch(() => undefined);
    });
    await sayfa.waitForTimeout(600);
    let sonuc = await cipAra(job.surahNo, a);
    let deneme = 0;
    while (!sonuc && deneme < 3) {
      deneme++;
      const satir = sayfa.getByText(new RegExp(job.surahNo + ":" + a + "\\b")).first();
      await satir.click({ timeout: 5000 }).catch(() => undefined);
      for (let k = 0; k < 16; k++) {
        await sayfa.waitForTimeout(500);
        sonuc = await cipAra(job.surahNo, a);
        if (sonuc) break;
      }
    }
    if (!sonuc) {
      await sayfa.screenshot({ path: path.join(import.meta.dirname, "debug-ayet.png") }).catch(() => undefined);
      throw new Error(`Ayet ${job.surahNo}:${a} eklenemedi`);
    }
    durum(`  ✅ ${job.surah} ${job.surahNo}:${a} eklendi`);
  }

  // 4) mod (şablon / hareketli) — ★ CANLI DEĞİŞKEN: varyant işareti HAREKETLI set bitince şablona geçebiliyor;
  //   eski işaretten okuma ÜRETİMİ YANLIŞ MODDA yapıyordu (şablon istenirken hareketli üretildi). AKTIF_VARYANT her zaman güncel.
  durum(`  🎛️ Mod butonu: ${AKTIF_VARYANT === "sablon" ? "Şablon V2" : "Hareketli Video"}`);
  await sayfa.getByRole("button", { name: AKTIF_VARYANT === "sablon" ? "Şablon V2" : "Hareketli Video" }).first().click();
  await sayfa.waitForTimeout(400);

  // ★★★ MOD DOĞRULAMA (kanıt istendi): site Segmented bileşeninde aktif buton "text-black" sınıfı taşır
  //   (kaynak: UIElements.tsx active sınıfı). Butona basmak yetmez — hangi modun GERÇEKTEN aktif olduğunu
  //   DOM'dan okuruz; yanlışsa doğru butona tekrar basar, yine yanlışsa üretimi iptal ederiz.
  //   Bu doğrulama olmasaydı: bot "Şablon V2"ye basıp site hareketli seçili halde bırakabilir (geceki kaza).
  const aktifModOku = () => guvenliEval(sayfa, () => {
    const btnler = [...document.querySelectorAll("button")];
    const sablon = btnler.find((b) => b.textContent?.includes("Şablon V2"));
    const hareketli = btnler.find((b) => /Hareketli\s*Video/.test(b.textContent ?? ""));
    const aktifMi = (b) => b ? (b.className.includes("text-black") || /gradient|var\(--accent/.test(b.getAttribute("style") ?? "")) : false;
    return { sablon: aktifMi(sablon), hareketli: aktifMi(hareketli) };
  }, 6000);
  let modDurum = await aktifModOku();
  const istenenSablon = AKTIF_VARYANT === "sablon";
  if (istenenSablon ? !modDurum?.sablon : !modDurum?.hareketli) {
    durum(`  ⚠️ Mod yanlış aktif (DOM: şablon=${modDurum?.sablon}, hareketli=${modDurum?.hareketli}) — tekrar düzeltiliyor`);
    await sayfa.getByRole("button", { name: istenenSablon ? "Şablon V2" : "Hareketli Video" }).first().click();
    await sayfa.waitForTimeout(600);
    modDurum = await aktifModOku();
  }
  const modDogru = istenenSablon ? !!modDurum?.sablon : !!modDurum?.hareketli;
  if (!modDogru) {
    await sayfa.screenshot({ path: path.join(import.meta.dirname, "debug-mod.png") }).catch(() => undefined);
    throw new Error(`Mod doğrulanamadı (istenen: ${AKTIF_VARYANT}, DOM: şablon=${modDurum?.sablon}, hareketli=${modDurum?.hareketli}) — üretim iptal, debug-mod.png bak`);
  }
  durum(`  ✅ Mod DOĞRULANDI: ${istenenSablon ? "Şablon V2 AKTİF (hareketsiz arka plan garantisi)" : "Hareketli Video AKTİF"}`);

  // 5) kâri seç
  await sayfa.getByRole("button", { name: kari.regex }).first().click();
  await sayfa.waitForTimeout(400);

  // 6) süre: uzun video
  await sayfa.getByRole("button", { name: /Uzun Video/ }).first().click().catch(() => undefined);
  await sayfa.waitForTimeout(300);

  // 7) atmosfer: hareketliyse rastgele klip + ısınma (donma panzehiri)
  if (AKTIF_VARYANT === "hareketli") {
    await sayfa.getByRole("button", { name: /Rastgele Ata/ }).first().click().catch(() => undefined);
    durum("  Arka plan klibi ısınıyor (buffer+oynatma kanıtı bekleniyor)...");
    // ★ GÜÇLÜ ISINMA: klip (1) en az 2 sn buffer'lamış VE (2) currentTime fiilen ilerliyor olmalı.
    // Rastgele Ata her seferinde farklı klip seçtiği için ön yükleme soğuk başlar — bekletmeden üretim DONUK çıkar.
    let klipHazir = false;
    const oynatTetikle = () => sayfa.evaluate(() => { document.querySelectorAll("video").forEach((v) => { try { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => undefined); } catch { /* */ } }); }).catch(() => undefined);
    await oynatTetikle();
    let oncekiZaman = -1;
    for (let k = 0; k < 40; k++) {
      await sayfa.waitForTimeout(1000);
      const durum2 = await guvenliEval(sayfa, () => {
        const v = [...document.querySelectorAll("video")].find((x) => x.readyState >= 2 && x.videoWidth > 0);
        if (!v) return { buffer: 0, zaman: -1 };
        let bufEnd = 0;
        try { for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= v.currentTime && v.currentTime < v.buffered.end(i)) bufEnd = v.buffered.end(i) - v.currentTime; } catch { /* */ }
        return { buffer: bufEnd, zaman: v.currentTime };
      }, 6000);
      const zaman = durum2?.zaman ?? -1;
      const buffer = durum2?.buffer ?? 0;
      if (zaman > oncekiZaman + 0.4 && buffer >= 2) { klipHazir = true; break; }
      if (zaman === oncekiZaman) await oynatTetikle(); // takılıysa tekrar oynat
      oncekiZaman = zaman;
    }
    durum(klipHazir ? "  ✅ Klip canlı (buffer + fiili oynatma kanıtlandı) — üretim güvenli" : "  ⚠️ Klip kanıtı tam gelmedi (40 sn) — yine de denenecek, tarama donuksa silecek");
  }

  // 8) format 9:16
  const fmtAdmin = sayfa.getByRole("button", { name: "9:16ADMIN" });
  if (await fmtAdmin.count()) await fmtAdmin.first().click();
  else await sayfa.getByRole("button", { name: "9:16 Reel" }).first().click();
  await sayfa.waitForTimeout(400);

  // 9) üret — konsol + ağ hatalarını da dinle (sitenin gerçek hatası console.error'a düşüyor)
  await sayfa.evaluate(() => { try { Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true }); Object.defineProperty(document, "hidden", { get: () => false, configurable: true }); } catch { /* */ } }).catch(() => undefined);
  const once = await indirmeKlasoruSayisi(sayfa);
  durum(`  İndirme klasörü sayısı öncesi: ${once}`);
  const kayit = [];
  const konsolDinle = (msg) => { if (msg.type() === "error") kayit.push("KONSOL: " + msg.text().slice(0, 280)); };
  const sayfaHata = (err) => kayit.push("SAYFA: " + String(err).slice(0, 280));
  const istekHata = (req) => { const f = req.failure()?.errorText ?? ""; if (!/ERR_ABORTED/.test(f)) kayit.push("ISTEK: " + f + " " + req.url().slice(0, 150)); };
  sayfa.on("console", konsolDinle); sayfa.on("pageerror", sayfaHata); sayfa.on("requestfailed", istekHata);
  // ★ fetch kaydedici: her isteğin statüsünü sayfa içinde tut (403/404 requestfailed tetiklemez!) 
  await sayfa.addInitScript(() => {
    const __nurLog = [];
    (window).__nurLog = __nurLog;
    const eski = window.fetch.bind(window);
    (window).fetch = (...args) => {
      const u = String(args[0] instanceof Request ? args[0].url : args[0]);
      return eski(...args).then((r) => { if (__nurLog.length < 40) __nurLog.push(r.status + " " + u.slice(0, 120)); return r; });
    };
  });
  // ★ BLOB YAKALAYICI: createObjectURL'ü sarmala — büyük blob'ları (videoları) kayıtta tut.
  // Site blob'u revoke etse bile BIZ blob nesnesini tuttuğumuz için veri kaybolmaz — revocation yarışına kapalı.
  const blobYakalayici = () => {
    const w = window;
    if (w.__nurBlobKayit) return;
    const kayit = new Map();
    w.__nurBlobKayit = kayit;
    const eski = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (obj) => {
      const url = eski(obj);
      try {
        if (obj && obj.size > 3 * 1024 * 1024) {
          kayit.set(url, obj);
          while (kayit.size > 4) kayit.delete(kayit.keys().next().value);
        }
      } catch { /* */ }
      return url;
    };
  };
  await sayfa.addInitScript(blobYakalayici).catch(() => undefined);
  await sayfa.evaluate(blobYakalayici).catch(() => undefined);
  // ★ Yakalayıcının gerçekten kurulduğunu doğrula (kurulmadıysa donuk/çıktısız üretimin sebebi budur)
  const yakalayiciAktif = await guvenliEval(sayfa, () => !!(window).__nurBlobKayit, 6000);
  durum(`  🔬 Blob yakalayıcı aktif: ${yakalayiciAktif ? "EVET ✅" : "HAYIR ❌"}`);
  // ★ SES ISITMA: "Üret" öncesi bu işin ayet seslerini tarayıcıdan tek tek çek.
  // Site aynı URL'leri kendi belleğinden çeker → CDN takılması burada açılır,
  // üretim "Ses dosyaları alınamadı" çukuruna düşmez (4 sn'de ölme derdi biter).
  const sesSatirlar = job.tip === "tek" ? [[job.surahNo, job.from]] : Array.from({ length: job.to - job.from + 1 }, (_, k) => [job.surahNo, job.from + k]);
  if (kari.sesYolu && sesSatirlar.length) {
    const isinmaScript = `(async () => {
      const satirlar = ${JSON.stringify(sesSatirlar)};
      const yol = ${JSON.stringify(kari.sesYolu)};
      let ok = 0;
      for (const sira of satirlar) {
        const ss = String(sira[0]).padStart(3, "0"), aa = String(sira[1]).padStart(3, "0");
        const url = "https://everyayah.com/data/" + yol + "/" + ss + aa + ".mp3";
        try {
          const c = new AbortController(); const t = setTimeout(() => c.abort(), 12000);
          const r = await fetch(url + "?nur=" + Date.now(), { signal: c.signal }); clearTimeout(t);
          if (r.ok) { ok++; continue; }
        } catch { /* aşağıda düz deneme */ }
        try { const r = await fetch(url); if (r.ok) ok++; } catch { /* sessiz */ }
      }
      return ok;
    })()`;
    const isinma = await sayfa.evaluate(isinmaScript).catch(() => -1);
    durum(`  🔥 Ses ısınma: ${isinma}/${sesSatirlar.length} ayet sesi tarayıcıdan çekildi${isinma === sesSatirlar.length ? " ✅" : " ⚠️"}`);
  }
  // ★ BELLEK OPTİMİZASYONU (site kodu, renderQuality.low ise) video önbelleğini TEMİZLİYOR:
  // o temizlik 'Rastgele Ata' ile seçilen klibin buffer'ını da uçurur → donuk video. Onarım: temizlik SONRASI klibi yeniden ısıt.
  await sayfa.evaluate(() => { document.querySelectorAll("video").forEach((v) => { try { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => undefined); } catch { /* */ } }); }).catch(() => undefined);
  for (let k = 0; k < 10; k++) {
    const tamamMi = await guvenliEval(sayfa, () => [...document.querySelectorAll("video")].some((v) => v.readyState >= 2 && v.videoWidth > 0), 6000);
    if (tamamMi) break;
    await sayfa.waitForTimeout(1000);
  }
  await sayfa.waitForTimeout(2500);
  // ★ ANLIK TEŞHİS: toast/modal/uyarı her ne varsa yakala (üretim başlamazsa sebebini görürüz)
  const anlik = await guvenliEval(sayfa, () => document.body?.innerText ?? "", 8000);
  const toastSatirlari = (anlik ?? "").split("\n").filter((s) => /jeton|seçin|desteklemiyor|uygulanabilir|yetki|doviz|rate|hız|lütfen|⚠|🎁|hat/i.test(s)).slice(0, 6);
  durum(`  🔎 t+2.5sn uyarı/toast: ${toastSatirlari.length ? JSON.stringify(toastSatirlari) : "(yok)"}`);
  const modalAcik = (anlik ?? "").includes("RENDER MODUNDA");
  durum(`  🔎 Render ekranı açık mı: ${modalAcik ? "EVET ✅" : "HAYIR ❌"}`);
  if (!modalAcik) await sayfa.screenshot({ path: path.join(import.meta.dirname, "debug-uretim-baslangic.png") }).catch(() => undefined);
  await popuplariKapat(sayfa);
  const uretimBaslangic = Date.now();

  // 10) bitmesini bekle — ANA SİNYAL: a[download] href değişimi (yeni çıktı = yeni blob URL).
  // Not: liste 5 elemanla sınırlı (slice(0,5)) — sayaç 5'te DOYGUN, saymak güvenilmez!
  const hrefOku = async () => await guvenliEval(sayfa, () => {
    const a = document.querySelector("a[download]");
    return a ? (a.getAttribute("href") || "") : "";
  }, 6000);
  const ilkHref = await hrefOku();
  durum(`  Başlangıç href: ${ilkHref ? ilkHref.slice(0, 36) + "..." : "(yok)"}`);
  let tamam = false;
  let sonHref = "";
  let uretimAsimYazildi = false;
  let sonIlerleme = Date.now();
  let overlayGordu = modalAcik;
  let overlayKapanisIslandı = false;
  // ★ TOAST GÖZCÜSÜ: bildirimler 3-4 sn'de kayboluyor — başlangıçtan itibaren yakalayıp son 12 mesajı tut.
  //   "Overlay kapandı ama neden?" artık cevaplanır — kapanış sebebi geçmişten okunur.
  await sayfa.evaluate(() => {
    const w = window;
    if (w.__nurToastLog) return;
    const log = [];
    w.__nurToastLog = log;
    setInterval(() => {
      const t = [...document.querySelectorAll("div.fixed.bottom-5")].map((d) => (d.textContent || "").replace(/\s+/g, " ").trim()).find((s) => s && !/Duyuru yok|🎁|Hızlı & Yüksek|Buhatir|Klasik Hat|Rika Hat/.test(s));
      if (t && log[log.length - 1] !== t && log.push(t) > 12) log.shift();
    }, 250);
  }).catch(() => undefined);
  // ★ TIKLAMA KALKANI + KAMERA: iptal yollarını fiziksel olarak öldür (kim neye basarsa bassın)
  //   - "Üretimi İptal Et" ve onay balonu "İptal"i → tıklama yutulur
  //   - "Video Üret"e 5 sn içinde 2. tık (çift tık = generating→stop iptali) → yutulur
  //   - yutulan tüm tıklamalar kanıt için kayda girer
  await sayfa.evaluate(() => {
    const w = window;
    if (w.__nurKalkan) return;
    w.__nurKalkan = true;
    const tikLog = [];
    w.__nurClickLog = tikLog;
    let sonUretTik = 0;
    document.addEventListener("click", (e) => {
      const b = e.target?.closest?.("button, [role=button]");
      if (!b) return;
      const t = (b.innerText || "").replace(/\s+/g, " ").trim();
      const yaz = (sonuc) => { tikLog.push(`${new Date().toLocaleTimeString("tr-TR")} [${sonuc}] ${t.slice(0, 40)}`); if (tikLog.length > 20) tikLog.shift(); };
      if (/^üretimi iptal/i.test(t) || /^iptal$/i.test(t)) { e.stopImmediatePropagation(); e.preventDefault(); yaz("YUTULDU"); return; }
      // üretim sırasındaki büyük kırmızı buton: "%N · Durdur" — ona gelen TÜM tıklar iptal demektir, yut
      if (/durdur/i.test(t) || /^%\d+\s*·/i.test(t)) { e.stopImmediatePropagation(); e.preventDefault(); yaz("DURDUR YUTULDU"); return; }
      if (/^video üret/i.test(t)) {
        const simdi = Date.now();
        if (simdi - sonUretTik < 5000) { e.stopImmediatePropagation(); e.preventDefault(); yaz("ÇİFT TIK YUTULDU"); return; }
        sonUretTik = simdi; yaz("GEÇTİ"); return;
      }
      if (/^üret\s*⚡/i.test(t)) { yaz("ONAY GEÇTİ"); return; }
    }, true);
    document.addEventListener("visibilitychange", () => { tikLog.push(`${new Date().toLocaleTimeString("tr-TR")} [GÖRÜNÜRLÜK] ${document.visibilityState}`); if (tikLog.length > 20) tikLog.shift(); });
  }).catch(() => undefined);
  // ★ ÜRET: kalkan kurulduktan SONRA bas — iptal yolları artık fiziksel olarak kapalı
  await sayfa.getByRole("button", { name: /Video Üret/ }).first().click();
  await sayfa.waitForTimeout(1200);
  // Jeton onay balonu: SADECE balonun "Üret ⚡ N" butonuna bas (balon yoksa dokunulmaz)
  await guvenliEval(sayfa, () => {
    const btn = [...document.querySelectorAll("button")].find((b) => /^üret\s*⚡/i.test((b.innerText || "").trim()));
    if (btn) btn.click();
  }, 8000);
  await sayfa.waitForTimeout(2500);
  const toastGecmis = async () => {
    const log = await guvenliEval(sayfa, () => (window).__nurToastLog ?? [], 5000).catch(() => []);
    return (log ?? []).slice(-6);
  };
  while (Date.now() - uretimBaslangic < 15 * 60 * 1000) {
    if (sayfa.isClosed()) throw new Error("browser closed during production");
    await sayfa.waitForTimeout(4000);
    const gecen = Math.round((Date.now() - uretimBaslangic) / 1000);
    // ★ ANA KONTROL: href değişti mi?
    const href = await hrefOku();
    if (href && href !== ilkHref) { sonHref = href; durum(`  Üretim bitti (~${gecen} sn) — çıktı hazır (href değişti)`); tamam = true; break; }
    // overlay açık mı? ("Üretimi İptal Et" butonu sadece üretim sırasında var)
    const overlayAcik = await guvenliEval(sayfa, () =>
      [...document.querySelectorAll("button")].some((b) => /İptal Et/i.test(b.innerText || "")), 6000);
    if (overlayAcik) {
      // ★ SÜRE AŞIMI YAKALAYICI: 600 sn'yi aşan grupta site son ayetleri atar — bir kez yakala, loga yaz
      if (!uretimAsimYazildi) {
        const asim = await guvenliEval(sayfa, () => (document.body?.innerText ?? "").includes("süresi aşıldı"), 6000);
        if (asim) { uretimAsimYazildi = true; durum("  ⚠️ 600 sn aşıldı — sitede bazı ayetler bu videodan düşürüldü (klasör notu: bilgi.txt'ye bak)"); }
      }
      overlayGordu = true; sonIlerleme = Date.now(); if (gecen % 20 < 5) durum(`  ⏳ üretim sürüyor (${gecen} sn)`); continue;
    }
    // overlay kapandı + href değişmedi → blob hazırlanıyor olabilir (fixWebmDuration ~5sn), 24 sn daha bekle
    if (overlayGordu && !overlayKapanisIslandı) {
      overlayKapanisIslandı = true;
      durum(`  ℹ️ Overlay kapandı (t=${gecen}sn) — blob hazırlanıyor olabilir, kısa ek bekleme`);
      for (let k = 0; k < 6; k++) {
        await sayfa.waitForTimeout(4000);
        const h2 = await hrefOku();
        if (h2 && h2 !== ilkHref) { sonHref = h2; durum(`  Üretim bitti (~${gecen + (k + 1) * 4} sn) — çıktı hazır`); tamam = true; break; }
      }
      if (tamam) break;
      // ★ BLOB KAYDI KONTROLÜ: overlay kapandıysa video büyük ihtimalle HAZIR — __nurBlobKayit'a bak!
      // (href bazen yeni blob'a güncellenmekte gecikebilir; asıl kaynak blob kaydımız)
      const blobBilgi = await guvenliEval(sayfa, () => {
        const k = window.__nurBlobKayit;
        if (!k || !k.size) return { kayit: 0 };
        const son = [...k.keys()].pop();
        return { kayit: k.size, url: son, boyut: k.get(son).size, sonURL: son.slice(0, 40) };
      }, 6000);
      durum(`  🔎 Blob kayıt durumu: ${JSON.stringify(blobBilgi)}`);
      if (blobBilgi && blobBilgi.kayit > 0 && blobBilgi.boyut > 1000000) {
        sonHref = blobBilgi.url;
        durum(`  💾 Blob kaydından video alındı (${(blobBilgi.boyut / 1048576).toFixed(1)} MB) — overlay kapanmış ama video HAZIR`);
        tamam = true;
        break;
      }
      const tamMetin = await guvenliEval(sayfa, () => document.body?.innerText ?? "", 8000);
      const toast = (tamMetin ?? "").split("\n").filter((s) => /takılma|teknik|iptal edildi|hata|yetki|jeton|destekle|uygulanabilir|seçin|alınmadı|aşıldı/i.test(s)).slice(0, 5);
      durum(`  ☠️ Overlay kapandı ama çıktı oluşmadı — toast: ${toast.length ? JSON.stringify(toast) : "(yok)"}`);
      const tGecmis = await toastGecmis();
      if (tGecmis?.length) durum(`  ☠️ Toast geçmişi (kapanış sebebi burada): ${JSON.stringify(tGecmis)}`);
      const tikLog = await guvenliEval(sayfa, () => (window).__nurClickLog ?? [], 5000).catch(() => []);
      if (tikLog?.length) durum(`  ☠️ Tıklama kaydı (kim neye bastı): ${JSON.stringify(tikLog)}`);
      const fLog = await guvenliEval(sayfa, () => (window).__nurLog ?? [], 5000).catch(() => []);
      if (fLog?.length) durum(`  ☠️ İstek günlüğü: ${JSON.stringify(fLog.slice(-8))}`);
      if (kayit.length) durum(`  ☠️ Konsol hataları: ${JSON.stringify(kayit.slice(-6))}`);
      await sayfa.screenshot({ path: path.join(import.meta.dirname, "debug-olum-ani.png") }).catch(() => undefined);
      // ★ SON KURTARMA: üretim aslında başarılı olabilir — çıktı listede bekliyor olabilir
      //   (yeni site davranışı: otomatik indirme yok, "N Videoyu İndir" listesi var)
      const kurtarilan = await listeyiIndirVeYerlestir(sayfa).catch(() => 0);
      if (kurtarilan > 0 && isHedef(job, kok)) {
        durum("  ✅ Video listeden kurtarıldı — bu iş tamam!");
        return;
      }
      throw new Error("overlay kapandı, çıktı oluşmadı");
    }
    if (Date.now() - sonIlerleme > 180000) throw new Error("uretim 3 dk ilerlemedi (donmus sayfa)");
  }
  if (!tamam) {
    await sayfa.screenshot({ path: path.join(import.meta.dirname, "debug-timeout.png") }).catch(() => undefined);
    throw new Error("Üretim zaman aşımı (15 dk)");
  }

  // 11) indir — ★ BLOBDAN DOĞRUDAN OKUMA (2 günlük indirme-ölümünün kökten çözümü):
  // tıklama yok, Chrome indirme hattı yok, Playwright download aracısı yok → çökecek mekanizma kalmadı.
  // Video blob URL'i sayfa belleğinde duruyor; fetch ile buffer alıp Node'tan diske yazıyoruz.
  // ★ sonHref boşsa bile blob kaydında 3MB+ video varsa onu kullan (overlay erken kapandı durumlarında kurtarır)
  if (!sonHref.startsWith("blob:")) {
    const kurtar = await guvenliEval(sayfa, () => {
      const k = window.__nurBlobKayit;
      if (!k || !k.size) return null;
      // en yeni video = kaydın SONUNDAKİ (Map ekleme sırasını korur)
      const son = [...k.keys()].pop();
      return k.get(son)?.size > 1000000 ? son : null;
    }, 6000);
    if (kurtar) { sonHref = kurtar; durum("  🔁 href yakalanamamıştı — blob kaydından kurtarıldı"); }
  }
  await sayfa.evaluate(() => { document.querySelectorAll("video").forEach((v) => { try { v.pause(); v.removeAttribute("src"); v.load(); } catch { /* */ } }); }).catch(() => undefined);
  let indi = false;
  if (sonHref.startsWith("blob:")) {
    try {
      // Kayıttan blob'u bul: önce tam URL, yoksa en yeni (en son üretilen video odur)
      const sec = await sayfa.evaluate((u) => {
        const k = window.__nurBlobKayit;
        if (!k || !k.size) return null;
        if (k.has(u)) return { url: u, boyut: k.get(u).size };
        const son = [...k.keys()].pop();
        return { url: son, boyut: k.get(son).size };
      }, sonHref);
      if (!sec) throw new Error("blob kayıtta yok");
      durum(`  🔬 Blob yakalandı (${(sec.boyut / 1048576).toFixed(1)} MB) — bellekten diske yazılıyor (indirme hattı YOK)...`);
      fs.rmSync(webmYol, { force: true });
      const PARCA = 4 * 1024 * 1024;
      for (let ofs = 0; ofs < sec.boyut; ofs += PARCA) {
        const b64 = await sayfa.evaluate(async ([u, s, n]) => {
          const b = window.__nurBlobKayit.get(u);
          const buf = await b.slice(s, s + n).arrayBuffer();
          const bytes = new Uint8Array(buf);
          let bin = "";
          const adim = 0x8000;
          for (let i = 0; i < bytes.length; i += adim) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + adim));
          return btoa(bin);
        }, [sec.url, ofs, Math.min(PARCA, sec.boyut - ofs)]);
        fs.appendFileSync(webmYol, Buffer.from(b64, "base64"));
      }
      const yazilan = fs.statSync(webmYol).size;
      if (yazilan === sec.boyut) {
        indi = true;
        durum(`  ✅ BLOBDAN İNDİ (${(yazilan / 1048576).toFixed(1)} MB) — tıklama/Chrome indirmesi hiç kullanılmadı`);
      } else {
        fs.rmSync(webmYol, { force: true });
        throw new Error(`boyut uyuşmadı (${yazilan}/${sec.boyut})`);
      }
    } catch (e) {
      durum(`  ⚠️ Blob okuma olmadı (${String(e.message).slice(0, 80)}) — CDP yolu deneniyor`);
    }
  }
  if (!indi) {
    try {
      const cdp = await sayfa.context().newCDPSession(sayfa);
      try { await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: hedefKlasor, eventsEnabled: true }); }
      catch { await cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: hedefKlasor }); }
      await sayfa.evaluate(() => { const a = document.querySelector("a[download]"); if (a) a.click(); });
      const t0 = Date.now();
      while (Date.now() - t0 < 180000) {
        await new Promise((r) => setTimeout(r, 1500));
        if (sayfa.isClosed()) throw new Error("indirme beklerken sayfa kapandı");
        const liste = fs.readdirSync(hedefKlasor);
        const hazir = liste.find((f) => /\.webm$/i.test(f) && f !== `${job.videoName}.webm`);
        const suruyor = liste.some((f) => f.endsWith(".crdownload"));
        if (hazir && !suruyor) {
          fs.renameSync(path.join(hedefKlasor, hazir), webmYol);
          indi = true;
          break;
        }
      }
    } catch (e) {
      durum(`  ⚠️ CDP indirme olmadı (${String(e.message).slice(0, 80)}) — Playwright yolu deneniyor`);
    }
  }
  if (!indi) {
    const [indirme] = await Promise.all([
      sayfa.waitForEvent("download", { timeout: 120000 }),
      sayfa.locator("a[download]").first().click({ timeout: 15000 }),
    ]);
    await indirme.saveAs(webmYol);
  }
  const mb = (fs.statSync(webmYol).size / 1024 / 1024).toFixed(1);
  durum(`  ✅ İNDİ: ${webmYol} (${mb} MB)`);

  // 12) mp4'e çevir + donukluk taraması (temizse webm silinir)
  const sonuc = await webmToMp4VeTara(webmYol);
  if (sonuc === "donuk") throw new Error("donuk video uretildi");
  // 13) ★ bilgi.txt üret (v5: kullanıcı istedi — her videoya yanında hazır txt gelsin)
  try {
    execSync(`node scripts/otomatik-indirici.mjs --sadece-txt=${job.folder}`, { cwd: path.join(import.meta.dirname, ".."), timeout: 120000, stdio: "ignore" });
    durum(`  📝 bilgi.txt yazıldı (${job.folder})`);
  } catch (e) { durum(`  ⚠️ txt üretilemedi: ${String(e).slice(0, 60)}`); }
}

// ---------- ana akış ----------
const mod = process.argv[2] ?? "deneme";
fs.writeFileSync(DURUM, "");

if (mod === "giris") {
  const { ctx, sayfa } = await tarayiciAc();
  const ok = await girisBekle(sayfa);
  durum(ok ? "GİRİŞ_TAMAM" : "GIRIS_BASARISIZ");
  await ctx.close();
  process.exit(ok ? 0 : 1);
}

if (mod === "deneme") {
  const KILIT = path.join(import.meta.dirname, "bot-kilit.txt");
  if (fs.existsSync(KILIT)) {
    const eskiPid = parseInt(fs.readFileSync(KILIT, "utf8").trim(), 10);
    let yasiyor = false;
    try { process.kill(eskiPid, 0); yasiyor = true; } catch { yasiyor = false; }
    if (yasiyor) { durum("⚠️ Bot zaten çalışıyor (kilit var)"); process.exit(1); }
    durum("🧹 Bayat kilit temizlendi");
    fs.unlinkSync(KILIT);
  }
  fs.writeFileSync(KILIT, String(process.pid));
  const adet = parseInt(process.argv[3] ?? "6", 10) || 6;
  let ctx, sayfa;
  try {
    ({ ctx, sayfa } = await tarayiciAc());
    durum("Site açılıyor (kayıtlı oturum)...");
    await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sayfa.waitForTimeout(4000);
    if (!(await oturumBekleGenel(sayfa, 45000))) {
      durum("↻ Oturum görülmedi, sayfa yenileniyor...");
      await sayfa.reload({ waitUntil: "domcontentloaded" }).catch(() => undefined);
      await popuplariKapat(sayfa);
      if (!(await oturumBekleGenel(sayfa, 45000))) {
        const autoOk = await otomatikGiris(sayfa).catch(() => false);
        if (!autoOk) {
          // headless'ta Google reddederse: pencere moduna geçip oturumu tazele, sonra headless'a dön
          durum("  ↻ Headless'ta giriş reddedildi — pencere modunda oturum tazeleniyor...");
          await ctx.close().catch(() => undefined);
          await botChromeleriKapat();
          process.env.NUR_HEADLESS = "0";
          ({ ctx, sayfa } = await tarayiciAc());
          await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
          await sayfa.waitForTimeout(5000);
          await popuplariKapat(sayfa);
          const pencereOk = (await oturumBekleGenel(sayfa, 45000)) || (await otomatikGiris(sayfa).catch(() => false));
          if (!pencereOk) throw new Error("Oturum tazelenemedi (pencere modunda da başarısız)");
          durum("  ✅ Oturum tazelandı — headless moda dönülüyor");
          await izlenimKaydet(sayfa); // headless bu kimlikle açılacak (parmak izi uyuşsun)
          await ctx.close().catch(() => undefined);
          await botChromeleriKapat();
          process.env.NUR_HEADLESS = "1";
          ({ ctx, sayfa } = await tarayiciAc());
          await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
          await sayfa.waitForTimeout(5000);
          await popuplariKapat(sayfa);
          if (!(await oturumBekleGenel(sayfa, 45000))) throw new Error("Headless'a döndükten sonra oturum görülmedi");
        }
      }
    }
    durum("Admin oturumu aktif ✅");

    const varyant = varyantBul();
    AKTIF_VARYANT = varyant;
    let kok = varyant === "sablon" ? SABLON_ROOT : HAREKETLI_ROOT;
    // ★ v5 KARAR: BÜTÜN Kuran Muaiqly ile üretilir (şablon/hareketli farkı gözetmeksizin)
    let kari = { regex: /el-Muaiqly Telif/, ad: "Maher el-Muaiqly", sesYolu: "MaherAlMuaiqly128kbps" };
    const plan = JSON.parse(fs.readFileSync(PLAN, "utf8"));
    // ★ Fatiha yeniden dahil edildi — hatimin 114/114 olması için Fatiha da üretilmeli
    let baslangic = plan.findIndex((is) => !isHedef(is, kok));
    // ★ v5: hareketli set bitse bile şablona GEÇME — tamamlandı say ve çık (şablon iptal edildi)
    if (baslangic < 0 && varyant === "hareketli") {
      durum("🎉 HAREKETLI seti bitti (v5: BÜTÜN Kuran Muaiqly) — üretim tamamlandı!");
      await ctx.close().catch(() => undefined);
      fs.unlinkSync(KILIT);
      process.exit(0);
    }
    if (baslangic < 0) {
      // ★ Şablon seti sınırda bittiyse flag yaz — bekçi/nöbetçi yeniden başlatmasın
      if (kok === SABLON_ROOT) {
        durum(`🏁 ŞABLON SETİ TAMAMLANDI (${SABLON_SINIR} iş) — üretim bitirildi.`);
        try { fs.writeFileSync(SABLON_TAMAM, new Date().toISOString()); } catch { /* */ }
      } else {
        durum("🎉 PLAN BİTTİ — tüm klasörler dolu!");
      }
      await ctx.close().catch(() => undefined);
      fs.unlinkSync(KILIT);
      process.exit(0);
    }
    // ★ SURE 41+ KÂRİ GEÇİŞİ: Fussilet'ten itibaren hareketli işler Muaiqly ile üretilir (şablon zaten Muaiqly)
    const MUAIQLY_KARI = { regex: /el-Muaiqly Telif/, ad: "Maher el-Muaiqly", sesYolu: "MaherAlMuaiqly128kbps" };
    const isinKarisi = (is) => kari; // ★ v5: her iş Muaiqly
    let isler = plan.slice(baslangic, baslangic + adet);
    // ★ ŞABLON SINIRI UYGULAMA: 1064+ işler şablonda ÜRETİLMEZ (sure 41+ hareketlide hazır) — filtrele, hepsi elenirse bitiş
    if (kok === SABLON_ROOT) {
      const sinirli = isler.filter((is) => parseInt(is.folder, 10) <= SABLON_SINIR);
      if (sinirli.length < isler.length) durum(`🏁 ŞABLON SINIRI (${SABLON_SINIR}): ${isler.length - sinirli.length} iş atlandı (sure 41+ hareketli sette hazır)`);
      isler = sinirli;
      if (!isler.length) {
        durum(`🏁 ŞABLON SINIRI (${SABLON_SINIR}) DOLDU — üretim tamamlandı, bot duruyor.`);
        try { fs.writeFileSync(SABLON_TAMAM, new Date().toISOString()); } catch { /* */ }
        await ctx.close().catch(() => undefined);
        fs.unlinkSync(KILIT);
        process.exit(0);
      }
    }
    durum(`Varyant: ${kok === SABLON_ROOT ? "sablon" : "hareketli"} · Kâri: ${isinKarisi(plan[baslangic]).ad} · Sıradaki boş: ${kok === SABLON_ROOT ? "SABLON/" : ""}${plan[baslangic].folder} → ${isler.length} iş`);

    let basari = 0;
    const atlanan = [];
    let tazeSayac = 0;
    const tarayiciYenile = async () => {
      await ctx.close().catch(() => undefined);
      await botChromeleriKapat();
      ({ ctx, sayfa } = await tarayiciAc());
      await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sayfa.waitForTimeout(5000);
      await popuplariKapat(sayfa);
      if (!(await oturumBekleGenel(sayfa, 45000))) {
        const autoOk = await otomatikGiris(sayfa).catch(() => false);
        if (!autoOk) throw new Error("Yeniden açıldı ama oturum gelmedi");
      }
      durum("  ✅ Oturum geri geldi, devam");
    };
    // ★ ZEHIRLI IS YARASI: 3 denemede yatan isler burada toplanir, 30 dk soumaya alinir (ayni sette tekrar denenir)
    const souyan = new Map();
    const SOUTMA_MS = 30 * 60 * 1000;
    for (let i = 0; i < isler.length; ) {
      const soumaKalan = souyan.get(isler[i].folder);
      if (soumaKalan && Date.now() < soumaKalan) {
        durum(`  🧊 ${isler[i].folder} soumaya alindi (${Math.ceil((soumaKalan - Date.now()) / 60000)} dk kaldi) — siradaki ise geciliyor`);
        i++;
        continue;
      }
      let basarili = false;
      for (let deneme = 0; deneme < 3; deneme++) {
        try {
          await uretVeIndir(sayfa, isler[i], kok, isinKarisi(isler[i]), i + 1, isler.length);
          basari++;
          basarili = true;
          souyan.delete(isler[i].folder);
          // ★ Tazeleme 3 işte bir (önceki: her işteydi — %60 zaman kaybıydı). Yine de başarısız işten hemen sonra tazele.
          tazeSayac++;
          if ((i < isler.length - 1) && (tazeSayac % 3 === 0)) {
            durum("  🧹 Taze tarayıcı açılıyor (3 iş doldu — bellek sıfırlama)...");
            try { await tarayiciYenile(); } catch (e2) { durum(`  ⚠️ Tazeleme hatası: ${e2.message}`); }
          }
          break;
        } catch (e) {
          const kapandi = /closed|destroyed|Target page/i.test(e.message);
          if (kapandi && deneme === 0) {
            durum(`  ↻ Tarayıcı kapanmış — yeniden açılıyor, ${isler[i].folder} tekrar`);
            await tarayiciYenile();
            continue;
          }
          // ★ Üretim hatası: ceza 15 sn'ye indirildi (45 sn x 3 deneme = ~2,5 dk bosa gidiyordu).
          //   3 deneme de yatarsa is 30 dk soumaya gider — set diger islerle akmaya DEVAM eder.
          const uretimHatasi = !kapandi && deneme < 2;
          if (uretimHatasi) {
            durum(`  ↻ Üretim hatası — 15 sn bekleniyor, ${isler[i].folder} tekrar denenecek (${deneme + 2}/3): ${e.message}`);
            await new Promise((r) => setTimeout(r, 15000));
            try { await tarayiciYenile(); } catch (e2) { durum(`  ⚠️ Tazeleme hatası: ${e2.message}`); }
            continue;
          }
          durum(`  ❌ HATA (${isler[i].folder}): ${e.message}`);
          atlanan.push(isler[i].folder);
          const hayatta = await sayfa.evaluate(() => true).catch(() => false);
          if (!hayatta) {
            durum("  ↻ Tarayıcı ölmüş — yeniden açılıyor");
            try { await tarayiciYenile(); } catch (e2) { durum(`  ❌ Yeniden açma başarısız: ${e2.message}`); i = isler.length; }
          }
          break;
        }
      }
      // 3 deneme de yattıysa → 30 dk soumaya al ve siradaki isle DEVAM ET (set beklemesin)
      if (!basarili && !souyan.has(isler[i].folder)) {
        souyan.set(isler[i].folder, Date.now() + SOUTMA_MS);
        durum(`  🧊 ${isler[i].folder} 30 dk soumaya alindi — diger islerle devam`);
      }
      // ★ HER YENI IS ONCESI: sitede bekleyen hazır videoları topla (üretim-indirme kopukluğunu kapatır)
      //   Tetik: indirme klasörü sayısı (>0) — DOM etiket okuyucusu kör olsa bile sayacın kendisi güvenilirdir.
      try {
        const bekleyenSayi = await indirmeKlasoruSayisi(sayfa);
        if (bekleyenSayi > 0) {
          durum(`  📥 İndirme klasöründe ${bekleyenSayi} hazır video — işten önce toplanıyor...`);
          await listeyiIndirVeYerlestir(sayfa);
        }
      } catch (e2) { durum(`  ⚠️ Liste toplama hatası (zararsız): ${e2.message}`); }
      i++;
    }
    durum(`DENEME BİTTİ: ${basari}/${isler.length} başarılı${atlanan.length ? " · atlanan: " + atlanan.join(", ") : ""}`);
    await ctx.close().catch(() => undefined);
    fs.unlinkSync(KILIT);
    process.exit(basari === isler.length ? 0 : 1);
  } catch (e) {
    durum(`❌ ÖLÜMCÜL HATA: ${e.message}`);
    await ctx?.close().catch(() => undefined);
    try { fs.unlinkSync(KILIT); } catch { /* */ }
    process.exit(1);
  }
}

if (mod === "topla") {
  // KURTARMA: sitede üretilmiş ama indirilmemiş tüm videoları toplu indirip klasörlere dağıtır
  const KILIT = path.join(import.meta.dirname, "bot-kilit.txt");
  if (fs.existsSync(KILIT)) {
    const eskiPid = parseInt(fs.readFileSync(KILIT, "utf8").trim(), 10);
    let yasiyor = false;
    try { process.kill(eskiPid, 0); yasiyor = true; } catch { yasiyor = false; }
    if (yasiyor) { durum("⚠️ Bot kilitli"); process.exit(1); }
    fs.unlinkSync(KILIT);
  }
  fs.writeFileSync(KILIT, String(process.pid));
  const GECICI = path.join(import.meta.dirname, "topla-gecici");
  fs.mkdirSync(GECICI, { recursive: true });
  let ctx, sayfa;
  try {
    ({ ctx, sayfa } = await tarayiciAc());
    await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sayfa.waitForTimeout(5000);
    await popuplariKapat(sayfa);
    if (!(await oturumBekleGenel(sayfa, 60000))) {
      const autoOk = await otomatikGiris(sayfa).catch(() => false);
      if (!autoOk && !HEADLESS) { if (!(await girisBekle(sayfa, 10 * 60 * 1000))) throw new Error("GIRIS_BASARISIZ"); }
      else if (!autoOk) throw new Error("Headless'ta oturum açılamadı");
    }
    durum("Oturum aktif — listedeki çıktılar okunuyor (45 sn bekleniyor)...");
    const satirlariOku = () => sayfa.evaluate(() => {
      const temiz = (s) => (s ?? "").replace(/\s+/g, " ").trim();
      const baslik = [...document.querySelectorAll("*")].find((e) => e.childElementCount === 0 && /İndirme Klasörü/.test(e.textContent || ""));
      const kapsayici = baslik?.closest("div")?.parentElement;
      if (!kapsayici) return [];
      return [...kapsayici.querySelectorAll("p")].map((p) => temiz(p.textContent)).filter((t) => t.includes("•") && /\d+:\d+/.test(t));
    }).catch(() => []);
    let satirlar = [];
    for (let i = 0; i < 15; i++) {
      satirlar = (await satirlariOku()) ?? [];
      if (satirlar.length) break;
      await sayfa.waitForTimeout(3000);
    }
    durum(`Listede ${satirlar.length} video var: ${JSON.stringify(satirlar)}`);
    if (!satirlar.length) { durum("İndirilecek video yok ✅"); await ctx.close().catch(() => undefined); fs.unlinkSync(KILIT); process.exit(0); }
    const toplama = (async () => {
      const dosyalar = [];
      for (let i = 0; i < satirlar.length; i++) {
        const d = await sayfa.waitForEvent("download", { timeout: 120000 });
        const yol = path.join(GECICI, `sirali-${i}.webm`);
        await d.saveAs(yol).catch((e) => durum(`  ⚠️ kaydetmedi (${i}): ${e.message}`));
        dosyalar.push({ i, yol });
        durum(`  ⬇ ${i + 1}/${satirlar.length}: alındı`);
      }
      return dosyalar;
    })();
    await sayfa.getByRole("button", { name: /Videoyu İndir|Videoyu Indir/i }).first().click({ timeout: 10000 });
    const dosyalar = await toplama;
    let yerlesen = 0;
    for (const d of dosyalar) {
      if (!fs.existsSync(d.yol)) continue;
      const cozum = etiketCoz(satirlar[d.i] ?? "");
      if (!cozum || !cozum.is) { durum(`  ⚠️ etiket çözülemedi: ${satirlar[d.i]}`); continue; }
      if (!cozum.kok) {
        fs.mkdirSync(TASLAK, { recursive: true });
        fs.copyFileSync(d.yol, path.join(TASLAK, `${cozum.is.slug}-${cozum.bas}-${cozum.bitis}.webm`));
        durum(`  ⚠️ kâri tanınmadı (${cozum.reciter}) — TASLAK'a koydum`);
        continue;
      }
      const hedef = path.join(cozum.kok, cozum.is.folder, `${cozum.is.videoName}.webm`);
      if (fs.existsSync(hedef) || fs.existsSync(hedef.replace(".webm", ".mp4"))) { durum(`  ↷ zaten var, atlandı: ${cozum.is.folder}`); continue; }
      fs.mkdirSync(path.dirname(hedef), { recursive: true });
      fs.copyFileSync(d.yol, hedef);
      if (await webmToMp4VeTara(hedef)) { try { fs.unlinkSync(hedef); } catch { /* */ } }
      yerlesen++;
      durum(`  ✅ yerleşti: ${cozum.is.folder}/${cozum.is.videoName}.webm`);
    }
    durum(`TOPLA BİTTİ: ${yerlesen}/${dosyalar.length} video klasörlere yerleşti`);
    await ctx.close().catch(() => undefined);
    fs.rmSync(GECICI, { recursive: true, force: true });
    fs.unlinkSync(KILIT);
    process.exit(0);
  } catch (e) {
    durum(`❌ topla hatası: ${e.message}`);
    await sayfa?.screenshot({ path: path.join(import.meta.dirname, "debug-topla.png") }).catch(() => undefined);
    await ctx?.close().catch(() => undefined);
    try { fs.unlinkSync(KILIT); } catch { /* */ }
    process.exit(1);
  }
}

durum(`Bilinmeyen mod: ${mod} (deneme | topla | giris)`);
process.exit(2);
