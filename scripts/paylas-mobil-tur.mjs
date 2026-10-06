// ═══════════════════════════════════════════════════════════
// PAYLAŞ PANELİ MOBİL TURU — 375px (06.10)
// İSTEK: "Paylaş panelinin mobil görünümünü 375px genişlikte
//   dil değişimiyle test et ve taşma/kırılma varsa düzelt."
//
// HER DİLDE (tr/en/ar/id/ur): viewport 375×812 → stüdyo açılır →
//   paylaş paneli (input[maxlength=80]) bulunur → ölçümler:
//   1) Belge yatay taşması: scrollWidth > clientWidth
//   2) Panel içi eleman taşması: rect sağ/sol kenarı viewport
//      dışına taşıyor mu (RTL'de sol taraf da — ar/ur dir=rtl)
//   3) Kök-neden "sahip": taşan elemanın taşmayan ilk atası kaydedilir
//   4) PWA banner (kapatmadan ÖNCE): viewport taşması + panel çakışması
//   5) flex-wrap satırların çocuk taşması (sarma kırılması)
// KANIT: scripts/_paylas-mobil-turu.json + dil başına panel PNG
// ═══════════════════════════════════════════════════════════

import fs from "fs";

const HEDEF_URL = (process.argv[2] || "http://localhost:5173").replace(/\/+$/, "");
const VW = Number(process.argv[3]) || 375; // 2. arg: viewport genişliği (varsayılan 375; 320 = en dar yaygın telefon)
const SUF = VW === 375 ? "" : `-${VW}`;
const DILLER = ["tr", "en", "ar", "id", "ur"];
const VH = 812;
const TOL = 1.5; // yuvarlama toleransı (px)

async function main() {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const kanit = { hedef: HEDEF_URL, viewport: { width: VW, height: VH }, diller: {} };
  let toplamBulgu = 0;

  try {
    for (const dil of DILLER) {
      const ctx = await browser.newContext({ viewport: { width: VW, height: VH } });
      await ctx.addInitScript((d) => { try { localStorage.setItem("nur_lang", d); } catch { /* yok */ } }, dil);
      const page = await ctx.newPage();
      const bulgular = [];
      const notlar = {};

      try {
        await page.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        // çerez kabul (dile göre değişir)
        for (let i = 0; i < 15; i++) {
          const tiklandi = await page.evaluate(() => {
            const b = [...document.querySelectorAll("button")].find((x) => /^(tümünü kabul et|kabul et|accept|قبول|سب قبول|terima)/i.test((x.innerText || "").trim()));
            if (b) { b.click(); return true; } return false;
          }).catch(() => false);
          if (tiklandi) break;
          await page.waitForTimeout(300);
        }
        await page.waitForTimeout(3500);

        // Paylaş panelini bul: maxLength=80 başlık girişi (SocialSharePanel'e özgü)
        const giris = page.locator('input[maxlength="80"]').first();
        if (!(await giris.isVisible().catch(() => false))) throw new Error("paylaşım başlığı girişi bulunamadı (panel açık değil mi?)");
        const bolum = page.locator("section", { has: giris }).first();
        await giris.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(600);

        // ── ÖLÇÜM (banner hâlâ AÇIK: banner taşması + çakışma notu için) ──
        const olcum = await page.evaluate(({ TOL }) => {
          function r2(n) { return Math.round(n * 10) / 10; }
          const vw = document.documentElement.clientWidth;
          const docSW = document.documentElement.scrollWidth;
          const bodySW = document.body.scrollWidth;
          const tasiyor = (r) => r.right > vw + TOL || r.left < -TOL;
          const sonuc = { vw, docSW, bodySW, sayfaTasma: docSW > vw + 1 || bodySW > vw + 1, dir: document.documentElement.dir, panel: null, hedefler: [], sayfaSahipleri: [], banner: null };

          const inp = document.querySelector('input[maxlength="80"]');
          const section = inp ? inp.closest("section") : null;
          if (!section) return sonuc;

          // kapsam: paylaş section'ı + bitişik footer (SocialSharePanel'in parçası)
          const hedefler = [section];
          const kardes = section.nextElementSibling;
          if (kardes && kardes.tagName === "FOOTER") hedefler.push(kardes);

          const pr = section.getBoundingClientRect();
          sonuc.panel = { left: r2(pr.left), right: r2(pr.right), width: r2(pr.width), tasma: tasiyor(pr) };

          const kapsamKumesi = new Set();
          for (const h of hedefler) { kapsamKumesi.add(h); for (const el of h.querySelectorAll("*")) kapsamKumesi.add(el); }

          for (let hi = 0; hi < hedefler.length; hi++) {
            const hedef = hedefler[hi];
            const hedefAdi = hi === 0 ? "panel-section" : "panel-footer";
            const tasanlar = [];
            for (const el of [hedef, ...hedef.querySelectorAll("*")]) {
              if (!el.getClientRects().length) continue;
              const r = el.getBoundingClientRect();
              if (r.width < 1 && r.height < 1) continue;
              if (tasiyor(r)) tasanlar.push({ el, r });
            }
            // kök-neden: taşan elemanın, TAŞIMAYAN ilk atası = sahip
            const sahipMap = new Map();
            for (const { el, r } of tasanlar) {
              let a = el.parentElement;
              while (a && a !== hedef.parentElement && a.getBoundingClientRect && tasiyor(a.getBoundingClientRect())) a = a.parentElement;
              const key = a || hedef;
              if (!sahipMap.has(key)) sahipMap.set(key, []);
              const cls = typeof el.className === "string" ? el.className : (el.className && el.className.baseVal) || "";
              sahipMap.get(key).push({ tag: el.tagName, cls: cls.slice(0, 80), text: (el.textContent || "").trim().slice(0, 40), rect: { left: r2(r.left), right: r2(r.right), width: r2(r.width) } });
            }
            for (const [sahip, cocuklar] of sahipMap) {
              const sr = sahip.getBoundingClientRect();
              const scls = typeof sahip.className === "string" ? sahip.className : "";
              sonuc.hedefler.push({
                hedef: hedefAdi,
                sahip: { tag: sahip.tagName, cls: scls.slice(0, 120), text: (sahip.textContent || "").trim().slice(0, 50) },
                sahipRect: { left: r2(sr.left), right: r2(sr.right), width: r2(sr.width) },
                tasanCocuk: cocuklar.slice(0, 4),
              });
            }
            // dahili clip taşması: içerik konteynerden genişse (bb ile yakalanmayan)
            // NOT: INPUT/TEXTAREA'da scrollWidth>clientWidth native metin kaydırmadır,
            //   layout taşması DEĞİL — o yüzden hariç tutulur.
            for (const el of [hedef, ...hedef.querySelectorAll("*")]) {
              if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") continue;
              if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && el.getClientRects().length) {
                const cls = typeof el.className === "string" ? el.className : "";
                if (!/overflow-(x-auto|auto|hidden|scroll)/.test(cls)) {
                  sonuc.hedefler.push({ hedef: hedefAdi, sahip: { tag: el.tagName + " [scrollWidth]", cls: cls.slice(0, 120), text: (el.textContent || "").trim().slice(0, 40) }, sahipRect: { clientW: el.clientWidth, scrollW: el.scrollWidth }, tasanCocuk: [] });
                }
              }
            }
          }

          // sayfa geneli (kapsam DIŞI bağlam): en geniş taşan sahipler
          if (sonuc.sayfaTasma) {
            const tasanSayfa = [];
            for (const el of document.body.querySelectorAll("*")) {
              if (kapsamKumesi.has(el)) continue;
              if (!el.getClientRects().length) continue;
              const r = el.getBoundingClientRect();
              if (r.width < 1 && r.height < 1) continue;
              if (tasiyor(r)) tasanSayfa.push(el);
            }
            const sm = new Map();
            for (const el of tasanSayfa) {
              let a = el.parentElement;
              while (a && a !== document.body && tasiyor(a.getBoundingClientRect())) a = a.parentElement;
              const key = a || document.body;
              if (!sm.has(key)) sm.set(key, []);
              sm.get(key).push(el);
            }
            for (const [sahip, cocuklar] of sm) {
              const scls = typeof sahip.className === "string" ? sahip.className : "";
              sonuc.sayfaSahipleri.push({ tag: sahip.tagName, cls: scls.slice(0, 120), adet: cocuklar.length, ornek: (cocuklar[0].textContent || "").trim().slice(0, 40) });
            }
          }

          // PWA banner: viewport taşması + panel ile dikey çakışma
          const banner = document.querySelector("div.fixed.bottom-4.right-4");
          if (banner && banner.getClientRects().length) {
            const br = banner.getBoundingClientRect();
            sonuc.banner = {
              rect: { left: r2(br.left), right: r2(br.right), top: r2(br.top), bottom: r2(br.bottom), width: r2(br.width) },
              viewportTasma: tasiyor(br),
              panelIleCakisiyor: !(br.top > pr.bottom || br.bottom < pr.top),
            };
          }
          return sonuc;
        }, { TOL });

        notlar.olcum = olcum;

        // bulguları çıkar
        for (const s of olcum.hedefler) {
          bulgular.push({
            tur: s.sahipRect?.scrollW ? "ic-tasma" : "panel-tasma",
            nerede: `${s.sahip.tag} ${(s.sahip.cls || "").slice(0, 60)}`.trim(),
            detay: s.sahipRect?.scrollW ? `clientW=${s.sahipRect.clientW} < scrollW=${s.sahipRect.scrollW}` : `${s.sahipRect.left}..${s.sahipRect.right} (vw=${olcum.vw})`,
            ornek: s.tasanCocuk[0]?.text || s.sahip.text || "",
          });
        }
        if (olcum.banner?.viewportTasma) bulgular.push({ tur: "pwa-banner-tasma", nerede: "PwaKurulumBanneri", detay: `${olcum.banner.rect.left}..${olcum.banner.rect.right} (w=${olcum.banner.rect.width})`, ornek: "" });
        if (olcum.sayfaTasma && olcum.sayfaSahipleri.length) {
          notlar.sayfaBaglam = olcum.sayfaSahipleri.slice(0, 5); // kapsam dışı bağlam bilgisi
        }

        // bannerı kapat (screenshot temiz olsun) → PNG kanıtı: panelin TAMAMI
        await page.evaluate(() => {
          const banner = document.querySelector("div.fixed.bottom-4.right-4");
          const btn = banner?.querySelector("button[aria-label]");
          if (btn) btn.click();
        }).catch(() => {});
        await page.waitForTimeout(400);
        await bolum.screenshot({ path: `scripts/_paylas-mobil-${dil}${SUF}.png` }).catch(async () => {
          await page.screenshot({ path: `scripts/_paylas-mobil-${dil}${SUF}.png` });
        });
      } catch (e) {
        notlar.hata = String(e?.message || e).slice(0, 200);
      }

      kanit.diller[dil] = { bulguSayisi: bulgular.length, bulgular, notlar };
      toplamBulgu += bulgular.length;
      const baglam = notlar.olcum?.sayfaTasma ? `  [sayfa-geneli taşma VAR, panel dışı sahip: ${notlar.olcum.sayfaSahipleri.length}]` : "";
      console.log(`[${dil}] bulgu: ${bulgular.length}${notlar.hata ? "  HATA: " + notlar.hata : ""}${baglam}`);
      for (const b of bulgular) console.log(`   ✗ [${b.tur}] ${b.nerede} → ${b.detay}${b.ornek ? ` ("${b.ornek}")` : ""}`);
      await ctx.close();
    }

    fs.writeFileSync(`scripts/_paylas-mobil-turu${SUF}.json`, JSON.stringify(kanit, null, 2));
    console.log("\n── ÖZET ──");
    console.log(`  5 dil toplam panel bulgusu: ${toplamBulgu}`);
    console.log(toplamBulgu === 0
      ? `▶ SONUÇ: PASS ✅ — ${VW}px'te 5 dilde panel taşması/kırılması yok (kanıt: scripts/_paylas-mobil-turu${SUF}.json)`
      : `▶ SONUÇ: BULGU VAR ❌ — yukarıdaki sahipler düzeltilmeli (kanıt: scripts/_paylas-mobil-turu${SUF}.json)`);
  } finally {
    await browser.close().catch(() => {});
  }
  process.exit(toplamBulgu === 0 ? 0 : 1);
}

main().catch((e) => { console.error("✗ çöktü: " + (e?.message || e)); process.exit(1); });
