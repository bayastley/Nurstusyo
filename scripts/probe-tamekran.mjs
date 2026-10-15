// PROBE v2 — kayıt koşullarını birebir taklit (CSS enjeksiyonlu), panel dolumunu ölç + ekran görüntüsü
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const PROFIL = path.join(os.homedir(), ".nur-bot-profil");
const PIC = path.join(os.homedir(), "Desktop", "probe-ekran.png");

function cssTamEkran() {
  const st = document.createElement("style");
  st.textContent = "html{scrollbar-width:none!important;background:#000!important}::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}";
  (document.head || document.documentElement).appendChild(st);
}
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
        zincir.reverse();
        zincir.forEach((n, i) => {
          const r = n.getBoundingClientRect();
          if (r.width <= 0 || r.width >= W * 0.95) return;
          const derin = zincir.length - 1 - i;
          if (derin > 3) { n.style.setProperty("max-width", "100%", "important"); return; }
          const pd = n.parentElement ? getComputedStyle(n.parentElement).display : "";
          if (pd === "grid") return;
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

const ctx = await chromium.launchPersistentContext(PROFIL, {
  channel: "chrome", headless: true, viewport: { width: 1080, height: 1920 },
  args: ["--disable-blink-features=AutomationControlled", "--lang=tr"],
});
await ctx.addInitScript(cssTamEkran);
await ctx.addInitScript(tamEkranScript);
const s = await ctx.newPage();
await s.goto("https://www.nurstudyo.com", { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
await s.waitForTimeout(7000);
await s.evaluate(() => {
  [...document.querySelectorAll("button, [role=button]")].filter((b) => /^(anlad[ıi]m|kabul|tamam|devam et)/i.test((b.innerText || "").trim())).forEach((b) => b.click());
}).catch(() => {});
await s.waitForTimeout(2500);
const bilgi = await s.evaluate(() => {
  const W = document.documentElement.clientWidth;
  const sel = document.querySelector("select");
  const r = sel ? sel.getBoundingClientRect() : null;
  // select'in en dar atası (panel kartı)
  let kart = null, kartW = -1;
  if (sel) {
    let el = sel.parentElement;
    while (el && el !== document.body) {
      const w = el.getBoundingClientRect().width;
      if (w > kartW && w < W * 0.99) { kart = el; kartW = Math.round(w); }
      el = el.parentElement;
    }
  }
  const merkezEl = document.elementFromPoint(W / 2, 1100);
  const hd = document.querySelector("header");
  return {
    vw: W,
    scroll: document.documentElement.scrollWidth,
    selectW: r ? Math.round(r.width) : -1,
    selectX: r ? Math.round(r.x) : -1,
    kartW,
    merkez: merkezEl ? (merkezEl.tagName + "." + (merkezEl.className || "").toString().slice(0, 40)) : "yok",
    headerW: hd ? Math.round(hd.getBoundingClientRect().width) : -1,
  };
}).catch((e) => ({ hata: String(e).slice(0, 140) }));
await s.screenshot({ path: PIC }).catch(() => {});
console.log("PROBE:", JSON.stringify(bilgi));
console.log("SS:", PIC);
await ctx.close().catch(() => {});
process.exit(0);
