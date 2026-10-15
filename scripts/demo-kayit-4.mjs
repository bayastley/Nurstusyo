// DEMO KAYIT v3 — 1080x1920 TAM EKRAN + overlay kayıt SIRASINDA gizli + perde v2.
// HAREKETLİ Video modu + önizleme oynama kanıtı + yavaş tempo + blob indirme. 4 sure: Kevser, Asr, Nâs, İhlâs.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const SITE = "https://www.nurstudyo.com";
const PROFIL = path.join(os.homedir(), ".nur-bot-profil");
const KAYIT = path.join(process.cwd(), "scripts", "demo-kayit");
const LOG = path.join(KAYIT, "log.txt");
fs.mkdirSync(KAYIT, { recursive: true });
const L = (m) => { const s = `[${new Date().toISOString().slice(11, 19)}] ${m}`; console.log(s); try { fs.appendFileSync(LOG, s + "\n", "utf8"); } catch {} };
const uyut = (ms) => new Promise((r) => setTimeout(r, ms));

const SURELER = [
  { no: 108, ad: "Kevser", ayet: 3, dosya: "1-kevser" },
  { no: 103, ad: "Asr", ayet: 3, dosya: "2-asr" },
  { no: 114, ad: "Nâs", ayet: 6, dosya: "3-nas" },
  { no: 112, ad: "İhlâs", ayet: 4, dosya: "4-ihlas" },
];
const KARI = { regex: /el-Muaiqly Telif/ };

const ANTI = [
  "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding", "--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling",
  "--disable-blink-features=AutomationControlled", "--lang=tr", "--window-position=0,0",
];

// ---- sayfa içi enjeksiyonlar ----
function cssTamEkran() {
  try {
    const st = document.createElement("style");
    st.textContent = "html{scrollbar-width:none!important;background:#000!important}::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}";
    (document.head || document.documentElement).appendChild(st);
  } catch {}
}
// Site panelini ekranın TAMAMINA yay: dar kolon sebebibi max-width'li atalar; hepsini aç.
function tamEkranScript() {
  const duzelt = () => {
    try {
      if (!location.hostname.includes("nurstudyo")) return;
      const W = document.documentElement.clientWidth;
      if (W < 700) return;
      const refs = [document.querySelector("select"), document.querySelector("header"), document.querySelector("main")].filter(Boolean);
      if (!refs.length) return;
      for (const ref of refs) {
        const zincir = [];
        let el = ref;
        while (el && el !== document.body) { zincir.push(el); el = el.parentElement; }
        zincir.reverse(); // [shell, ..., ref]
        zincir.forEach((n, i) => {
          const r = n.getBoundingClientRect();
          if (r.width <= 0 || r.width >= W * 0.95) return;
          const derin = zincir.length - 1 - i; // ref'e uzaklık
          if (derin > 3) { n.style.setProperty("max-width", "100%", "important"); return; }
          const pd = n.parentElement ? getComputedStyle(n.parentElement).display : "";
          if (pd === "grid") return; // grid hücresini bozma
          n.style.setProperty("width", "100%", "important");
          n.style.setProperty("max-width", "100%", "important");
        });
      }
      if (document.documentElement.scrollWidth > W + 4) document.documentElement.style.setProperty("overflow-x", "hidden", "important");
    } catch {}
  };
  duzelt();
  if (!window.__nurTamEkranTimer) window.__nurTamEkranTimer = setInterval(duzelt, 800);
}
// PERDE v2 — yaprak şartı YOK: tüm metin düğümleri taranır. İsim->admin, e-posta->blur, Google satırı->blur.
function perdeScript() {
  const isle = () => {
    try {
      document.querySelectorAll("[data-identifier]").forEach((c) => {
        if (c.style.filter !== "blur(16px)") c.style.setProperty("filter", "blur(16px)", "important");
      });
      const yuruyus = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const dokun = [];
      let n;
      while ((n = yuruyus.nextNode())) {
        const t = n.data || "";
        if (!t.trim()) continue;
        const tag = n.parentElement?.tagName || "";
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "TITLE" || tag === "TEXTAREA" || tag === "INPUT") continue;
        if (t.includes("@")) dokun.push([n, "blur"]);
        else if (t.includes("Ömer") || t.includes("Kaya")) dokun.push([n, "ad"]);
      }
      for (const [n, islem] of dokun) {
        try {
          if (islem === "ad") n.data = "admin";
          else n.parentElement?.style.setProperty("filter", "blur(14px)", "important");
        } catch {}
      }
    } catch {}
  };
  isle();
  if (!window.__perdeTimer) window.__perdeTimer = setInterval(isle, 300);
}
// RENDER perdesini kayıt SIRASINDA gizle + header ADMİN-Paketi rozetini kaldır + PWA kur popup'ını gizle.
function overlayGizleScript() {
  const rx = /LÜTFEN BU SEKMEYİ|Lütfen bu sekmeyi|lütfen bu sekmeyi|RENDER MODUNDA|Render modunda|render modunda/i;
  const gizle = () => {
    try {
      if (!location.hostname.includes("nurstudyo")) return;
      document.querySelectorAll("div, section, aside").forEach((el) => {
        const t = el.textContent || "";
        if (t.length > 500 || !rx.test(t)) return;
        let hedef = el, p = el.parentElement;
        while (p && p !== document.body) {
          if (getComputedStyle(p).position === "fixed") hedef = p;
          p = p.parentElement;
        }
        const hr = hedef.getBoundingClientRect();
        if (getComputedStyle(hedef).position === "fixed" || hr.height > 250 || hr.width > 500) {
          hedef.style.setProperty("display", "none", "important");
        }
      });
      // ADMİN Paketi rozeti logoya biniyor → kaldır (admin kimliği "Video Üret · ADMİN" ve 9:16 ADMIN'de görünüyor)
      document.querySelectorAll("div, span, a, button").forEach((el) => {
        const t = (el.innerText || "").trim();
        if (t !== "ADMİN Paketi" && t !== "Admin Paketi") return;
        let h = el;
        const p = el.parentElement;
        if (p && p !== document.body && (p.innerText || '').trim() === t) h = p;
        h.style.setProperty("display", "none", "important");
      });
      // PWA kur kartı ("fixed bottom-4 right-4 z-[88]"): butondan yukarı yürü → kök kartı gizle (React geri getirmiyor, probe'da kanıtlandı)
      document.querySelectorAll("div.fixed.bottom-4, div[class*=z-\\[88\\]]").forEach((el) => {
        if ((el.textContent || "").includes("Şimdi Kur")) el.style.setProperty("display", "none", "important");
      });
    } catch {}
  };
  gizle();
  if (!window.__nurPerdeTimer) {
    window.__nurPerdeTimer = setInterval(gizle, 250);
    try { new MutationObserver(() => gizle()).observe(document.body, { childList: true, subtree: true }); } catch {}
  }
}
function gizlilikYamasi() {
  try {
    Object.defineProperty(document, "hidden", { get: () => false, configurable: true });
    Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
    const w = window;
    if (!w.__nurRafYamali) {
      w.__nurRafYamali = true;
      const bekleyenler = new Set(); let sayac = 1;
      w.requestAnimationFrame = (cb) => { bekleyenler.add(cb); return sayac++; };
      w.cancelAnimationFrame = () => {};
      setInterval(() => { const t = performance.now(); for (const cb of [...bekleyenler]) { bekleyenler.delete(cb); try { cb(t); } catch {} } }, 33);
    }
  } catch {}
}
function blobYakalayici() {
  const w = window;
  if (w.__nurBlobKayit) return;
  const kayit = new Map(); w.__nurBlobKayit = kayit;
  const eski = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (obj) => {
    const url = eski(obj);
    try { if (obj && obj.size > 3 * 1024 * 1024) { kayit.set(url, obj); while (kayit.size > 4) kayit.delete(kayit.keys().next().value); } } catch {}
    return url;
  };
}
async function popupKapat(sayfa) {
  await sayfa.evaluate(() => {
    [...document.querySelectorAll("button, [role=button]")].filter((b) => {
      const t = (b.innerText || "").trim();
      return /^(anlad[ıi]m|kabul|accept|tamam|devam et|onayl[ıi])/i.test(t) && !/iptal/i.test(t);
    }).forEach((b) => b.click());
    // PWA kartının "Kapat" (aria-label) butonuna bas — "Şimdi Kur"a asla
    [...document.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").toLowerCase() === "kapat")?.click();
  }).catch(() => {});
}

async function main() {
  L("=== DEMO KAYIT v3 — 1080x1920 TAM EKRAN + overlay-gizli + perde v2 + Hareketli (4 sure) ===");
  // eski (reddedilen) kayıtları arşivle
  const eskiKlasor = path.join(KAYIT, "eski-v2");
  fs.mkdirSync(eskiKlasor, { recursive: true });
  for (const f of fs.readdirSync(KAYIT)) {
    if (/^([1-4]-(kevser|asr|nas|ihlas)\.webm|zaman-[1-4]|cikti-[1-4])/.test(f)) {
      try { fs.renameSync(path.join(KAYIT, f), path.join(eskiKlasor, f)); } catch {}
    }
  }
  const ctx = await chromium.launchPersistentContext(PROFIL, {
    channel: "chrome", headless: false,
    viewport: { width: 1080, height: 1920 },
    args: ANTI.concat(["--window-size=1080,1960"]),
    recordVideo: { dir: KAYIT, size: { width: 1080, height: 1920 } },
    acceptDownloads: true,
  });
  await ctx.addInitScript(cssTamEkran).catch(() => {});
  await ctx.addInitScript(tamEkranScript).catch(() => {});
  await ctx.addInitScript(perdeScript).catch(() => {});
  await ctx.addInitScript(overlayGizleScript).catch(() => {});
  await ctx.addInitScript(gizlilikYamasi).catch(() => {});
  await ctx.addInitScript(blobYakalayici).catch(() => {});

  for (const s of SURELER) {
    L(`\n=== VIDEO: ${s.ad} (${s.no}) ===`);
    let basarili = false;
    for (let deneme = 1; deneme <= 2 && !basarili; deneme++) {
      let sayfa = null;
      const t0 = Date.now();
      const caps = [];
      const adim = async (ms, text) => { const t = (Date.now() - t0) / 1000; caps.push({ t, text }); L(`  +${t.toFixed(1)}sn ${text}`); await uyut(ms); };
      try {
        sayfa = await ctx.newPage();
        caps.push({ t: 0, text: `Bugun: ${s.ad} Suresi — bastan sona birlikte` });
        await sayfa.goto(SITE, { waitUntil: "domcontentloaded", timeout: 60000 });
        await uyut(6000); await popupKapat(sayfa); await uyut(2000);
        // TAM EKRAN kontrolü
        const gen = await sayfa.evaluate(() => {
          const hd = document.querySelector("header");
          return { vw: document.documentElement.clientWidth, header: hd ? Math.round(hd.getBoundingClientRect().width) : -1, tasma: document.documentElement.scrollWidth };
        }).catch(() => null);
        if (gen) L(`  ekran ${gen.vw}px | header ${gen.header}px | tasma ${gen.tasma}px ${gen.header >= gen.vw - 8 && gen.tasma <= gen.vw + 4 ? "✓ TAM EKRAN" : "⚠ TAM DOLMADI"}`);
        await adim(2500, "Panel acildi — admin modunda girdik");
        // temizle
        const seciliOku = () => sayfa.evaluate(() => parseInt((document.body?.innerText ?? "").match(/SEÇİLİ AYETLER\s*\((\d+)\)/)?.[1] ?? "-1", 10));
        let n = await seciliOku();
        for (let d = 0; d < 5 && n > 0; d++) {
          await sayfa.evaluate(() => { const el = [...document.querySelectorAll("button, span, a, div")].find((e) => e.childElementCount === 0 && (e.innerText || "").trim() === "Temizle"); if (el) el.click(); }).catch(() => {});
          await uyut(1200); n = await seciliOku();
        }
        if (n === 0) await adim(2000, "Temiz baslangic — secim kutusu bos");
        // HAREKETLİ mod ÖNCE (bot kuralı: mod, ayet eklenmeden basılır)
        await sayfa.getByRole("button", { name: /Hareketli\s*Video/ }).first().click({ timeout: 8000 }).catch(() => {});
        await uyut(700);
        await adim(3000, "Hareketli Video modu — aynen boyle: canli arka plan");
        // sure seç
        const sureSelect = sayfa.locator("select").nth(0);
        const label = await sureSelect.evaluate((el, no) => { const o = [...el.options].find((o) => o.textContent.trim().startsWith(no + ". ")); return o ? o.textContent.trim() : null; }, String(s.no));
        if (!label) throw new Error(`sure ${s.no} opsiyonu yok`);
        await sureSelect.selectOption({ label }).catch(() => {});
        await uyut(900);
        await adim(3000, `Sure seçildi: ${label} — tek dokunus`);
        // tüm sureyi ekle
        await sayfa.getByText("Tüm Sureyi Ekle").first().click({ timeout: 8000 }).catch(() => {});
        for (let d = 0; d < 25; d++) { await uyut(1000); n = await seciliOku(); if (n === s.ayet) break; }
        if (n !== s.ayet) throw new Error(`secili ${n}, beklenen ${s.ayet}`);
        await adim(3000, `Tek tik: ${s.ayet} ayet birden eklendi ✔`);
        // kâri
        await sayfa.getByRole("button", { name: KARI.regex }).first().click().catch(() => {});
        await uyut(600);
        await adim(2800, "Kari: Maher el-Muaiqly — Kabe imami");
        // süre
        await sayfa.getByRole("button", { name: /Kısa Video/ }).first().click().catch(() => {});
        await uyut(500);
        await adim(2500, "Shorts formati: TikTok & Reels hazir");
        // 9:16
        const fmtAdmin = sayfa.getByRole("button", { name: "9:16ADMIN" });
        if (await fmtAdmin.count()) await fmtAdmin.first().click(); else await sayfa.getByRole("button", { name: "9:16 Reel" }).first().click().catch(() => {});
        await uyut(500);
        await adim(2200, "Dikey video: telefon icin ideal");
        // ★ RASTGELE ATA → önizleme ekranı GELİP OYNAYANA KADAR BEKLE (kullanıcı kuralı)
        await sayfa.getByRole("button", { name: /Rastgele Ata/ }).first().click({ timeout: 8000 }).catch(() => {});
        await adim(2200, "Rastgele Ata — canli önizleme geliyor…");
        let klipHazir = false;
        const oynatTetikle = () => sayfa.evaluate(() => { document.querySelectorAll("video").forEach((v) => { try { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch {} }); }).catch(() => {});
        await oynatTetikle();
        let oncekiZaman = -1;
        for (let k = 0; k < 40; k++) {
          await uyut(1000);
          const d = await sayfa.evaluate(() => {
            const v = [...document.querySelectorAll("video")].find((x) => x.readyState >= 2 && x.videoWidth > 0 && x.getBoundingClientRect().height > 50);
            if (!v) return { buffer: 0, zaman: -1, var: false };
            let bufEnd = 0;
            try { for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= v.currentTime && v.currentTime < v.buffered.end(i)) bufEnd = v.buffered.end(i) - v.currentTime; } catch {}
            return { buffer: bufEnd, zaman: v.currentTime, var: true };
          }, 6000).catch(() => ({ buffer: 0, zaman: -1, var: false }));
          if (d.zaman > oncekiZaman + 0.4 && d.buffer >= 2) { klipHazir = true; break; }
          if (d.zaman === oncekiZaman) await oynatTetikle();
          oncekiZaman = d.zaman;
          if (k === 8) caps.push({ t: (Date.now() - t0) / 1000, text: "Kabe/canli klip yukleniyor… (onizleme)" });
        }
        if (!klipHazir) throw new Error("onizleme klibi kanıtlanamadı (40 sn) — ÜRET'e basılmadı, güvenli durdu");
        await adim(4000, "Onizleme yayinda — goruldugu gibi, uflemeye gerek yok ✔");
        // ses ısınma (sessiz)
        await sayfa.evaluate(async (no) => {
          const yol = "MaherAlMuaiqly128kbps";
          const sn = String(no).padStart(3, "0");
          for (let a = 1; a <= 6; a++) {
            const url = `https://everyayah.com/data/${yol}/${sn}${String(a).padStart(3, "0")}.mp3`;
            try { const c = new AbortController(); const t = setTimeout(() => c.abort(), 10000); const r = await fetch(url + "?nur=" + Date.now(), { signal: c.signal }); clearTimeout(t); if (r.ok) continue; } catch {}
            try { await fetch(url); } catch {}
          }
        }, s.no).catch(() => {});
        await sayfa.evaluate(() => { document.querySelectorAll("video").forEach((v) => { try { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch {} }); }).catch(() => {});
        await uyut(2500);
        // ÜRET
        await sayfa.getByRole("button", { name: /Video Üret/ }).first().click({ timeout: 10000 }).catch(() => {});
        await adim(3000, "URET'e basiyoruz — gerisini site yapiyor");
        // render perdesi gizli mi? (kayıt sırasında CSS ile gizlendi)
        await uyut(2500);
        const perdeGizli = await sayfa.evaluate(() => !/LÜTFEN BU SEKMEYİ|Lütfen bu sekmeyi|RENDER MODUNDA|Render modunda/i.test(document.body?.innerText || "")).catch(() => true);
        L(`  render perdesi: ${perdeGizli ? "GİZLİ ✓ (videoda görünmeyecek)" : "⚠ HÂLÂ GÖRÜNÜYOR"}`);
        const hrefOku = () => sayfa.evaluate(() => document.querySelector("a[download]")?.getAttribute("href") || "");
        const ilkHref = await hrefOku();
        let bitti = false;
        for (let k = 0; k < 90; k++) {
          await uyut(4000);
          const h = await hrefOku();
          if (h && h !== ilkHref) { bitti = true; break; }
          if (k === 20) caps.push({ t: (Date.now() - t0) / 1000, text: "Ses + ayet + canli arka plan birlesiyor…" });
          if (k === 45) caps.push({ t: (Date.now() - t0) / 1000, text: "Neredeyse hazir… son dokunuslar" });
          await popupKapat(sayfa);
        }
        if (!bitti) throw new Error("uretim zamanaşımı");
        L(`  üretim bitti (~${((Date.now() - t0) / 1000).toFixed(0)} sn)`);
        await adim(9000, "ISTE VIDEO — hazir! Birlikte izleyelim");
        // indirme: blob → CDP
        const hedef = path.join(KAYIT, `cikti-${s.dosya}.webm`);
        let indi = false;
        try {
          const bilgiler = await sayfa.evaluate(() => [...(window.__nurBlobKayit || new Map()).entries()].map(([u, b]) => ({ u, s: b.size })));
          bilgiler.sort((a, b) => b.s - a.s);
          if (bilgiler.length) {
            const { u, s: boyut } = bilgiler[0];
            const ws = fs.createWriteStream(hedef);
            const PARCA = 4 * 1024 * 1024;
            for (let ofset = 0; ofset < boyut; ofset += PARCA) {
              const b64 = await sayfa.evaluate(async ({ url, start, len }) => {
                const b = window.__nurBlobKayit.get(url);
                const buf = await b.slice(start, start + len).arrayBuffer();
                const bytes = new Uint8Array(buf); let bin = "";
                for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
                return btoa(bin);
              }, { url: u, start: ofset, len: Math.min(PARCA, boyut - ofset) });
              ws.write(Buffer.from(b64, "base64"));
            }
            await new Promise((r) => ws.end(r));
            if (fs.statSync(hedef).size === boyut) indi = true;
          }
        } catch (e) { L(`  blob yolu olmadı: ${String(e).slice(0, 80)}`); }
        if (!indi) {
          try {
            const cdp = await sayfa.context().newCDPSession(sayfa);
            try { await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: KAYIT, eventsEnabled: true }); }
            catch { await cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: KAYIT }); }
            await sayfa.evaluate(() => document.querySelector("a[download]")?.click());
            const t0d = Date.now();
            while (Date.now() - t0d < 180000) {
              await uyut(1500);
              const liste = fs.readdirSync(KAYIT);
              const hazir = liste.find((f) => /\.webm$/i.test(f) && !/^(cikti-|[1-4]-|giris)/.test(f) && !f.startsWith("page@"));
              const suruyor = liste.some((f) => f.endsWith(".crdownload"));
              if (hazir && !suruyor) { fs.renameSync(path.join(KAYIT, hazir), hedef); indi = true; break; }
            }
          } catch (e) { L(`  CDP yolu olmadı: ${String(e).slice(0, 80)}`); }
        }
        await adim(indi ? 3500 : 3000, indi ? "Indirildi ✔" : "Video hazir");
        await adim(7000, "Siz de icerik ureticisi olun -> nurstudyo.com");
        const videoPath = await sayfa.video()?.path();
        await sayfa.close().catch(() => {});
        await uyut(4000);
        if (videoPath && fs.existsSync(videoPath)) {
          const hedefWebm = path.join(KAYIT, `${s.dosya}.webm`);
          fs.renameSync(videoPath, hedefWebm);
          fs.writeFileSync(path.join(KAYIT, `zaman-${s.dosya}.json`), JSON.stringify(caps, null, 1), "utf8");
          L(`✅ ${s.dosya}.webm (${(fs.statSync(hedefWebm).size / 1048576).toFixed(1)} MB) + ${caps.length} damga`);
          basarili = true;
        } else L(`⚠️ ${s.dosya}: kayıt dosyası bulunamadı`);
      } catch (e) {
        L(`❌ ${s.dosya} deneme ${deneme}: ${String(e).slice(0, 160)}`);
        try { await sayfa?.screenshot({ path: path.join(KAYIT, `hata-${s.dosya}-${deneme}.png`) }); } catch {}
        try { await sayfa?.close(); } catch {}
        await uyut(3000);
      }
    }
  }
  await ctx.close().catch(() => {});
  L("=== v3 KAYITLAR BİTTİ ===");
}
process.on("unhandledRejection", (e) => L(`unhandled: ${String(e).slice(0, 120)}`));
main().catch((e) => { L(`FATAL: ${String(e).slice(0, 300)}`); process.exit(1); });
