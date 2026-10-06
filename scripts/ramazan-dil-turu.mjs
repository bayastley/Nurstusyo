// ═══════════════════════════════════════════════════════════
// RAMAZAN & KANDİL MERKEZİ DİL TURU (06.10)
// İSTEK: "Ramazan & Kandil Merkezi modalını 5 dile çevir
//   (gün sayacı, oruç takibi, kandil geceleri, bugünün ameli)."
//   Kod i18n'i f3f7dd3'te yapıldı — bu script DOĞRULAMAYA yarıyor:
//
// 1) STATİK DENETİM (Unicode-aware, bash grep'in byte-eşleşme
//    yanlış-pozitiflerine düşmez):
//    • dicts.{en,ar,id,ur}.ts → rmz* değerlerinde TR karakter/kelime
//    • src/data/ramazanCokDil.ts → en/ar/id/ur AMELLER + HICRI blokları
//    • RamazanModal.tsx'te kullanılan tt("…") anahtarları ⊆ sözlük
// 2) UI TURU: 5 dilde stüdyo → menü → "Ramazan & Kandil" → modal
//    metni (en büyük .modal-in) TR taraması + PNG kanıtı.
// KANIT: scripts/_ramazan-dil-turu.json + scripts/_ramazan-dil-*.png
// ═══════════════════════════════════════════════════════════

import fs from "fs";

const HEDEF_URL = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");
const DILLER = ["tr", "en", "ar", "id", "ur"];

const TR_KARAKTER = /[ığşçöüİĞŞÇÖÜ]/;
const TR_KELIME = /\b(için|ile|gün|günler|kaldı|oruç|bugün|sayac|kaza|zaten|olarak)\b/i;
const BEYAZ = [
  "nurstudyo.com", "Pexels", "EveryAyah", "AlQuran", "Aladhan",
];

function trBulgular(metin, kaynak) {
  const bulgular = [];
  for (const hamSatir of metin.split(/\r?\n/)) {
    const satir = hamSatir.trim();
    if (satir.length < 2) continue;
    if (BEYAZ.some((b) => satir.includes(b))) continue;
    const karakter = TR_KARAKTER.test(satir);
    const kelime = TR_KELIME.test(satir);
    if (karakter || kelime) bulgular.push({ kaynak, satir: satir.slice(0, 140), karakter, kelime });
  }
  return bulgular;
}

// ─── 1) STATİK DENETİM ─────────────────────────────────────
function statikDenetim() {
  const bulgular = [];

  // a) sözlüklerdeki rmz* DEĞERLERİ (tr dışı 4 dil)
  for (const dil of ["en", "ar", "id", "ur"]) {
    const yol = `src/i18n/dicts.${dil}.ts`;
    const satirlar = fs.readFileSync(yol, "utf8").split(/\r?\n/);
    for (const ham of satirlar) {
      const m = ham.match(/^  (rmz[A-Za-z0-9]+): "(.*)"?,?$/);
      if (!m) continue;
      const deger = m[2];
      if (TR_KARAKTER.test(deger) || TR_KELIME.test(deger)) {
        bulgular.push({ tur: "sozluk-deger", dil, anahtar: m[1], satir: deger.slice(0, 120) });
      }
    }
  }

  // b) ramazanCokDil.ts — dil bloklarını satır takibiyle ayır
  const kaynak = fs.readFileSync("src/data/ramazanCokDil.ts", "utf8").split(/\r?\n/);
  let bolum = "hicri"; // HICRI_AY_ADLARI_COKDIL önce gelir
  let dil = "tr";
  for (const ham of kaynak) {
    const satir = ham;
    const k = satir.trim();
    if (k.startsWith("//") || k.startsWith("/**") || k.startsWith("*") || k.startsWith("*/")) continue; // yorumlar kapsam dışı
    if (k === "};") { dil = "tr"; continue; } // HICRI objesi kapanışı — blok takibi sıfırla
    const bolumBasi = satir.match(/export const (HICRI_AY_ADLARI_COKDIL|AMELLER_COKDIL)/);
    if (bolumBasi) { bolum = bolumBasi[1] === "HICRI_AY_ADLARI_COKDIL" ? "hicri" : "amel"; dil = "tr"; continue; }
    const dilBasi = satir.match(/^  (tr|en|ar|id|ur): \[/);
    if (dilBasi) { dil = dilBasi[1]; }
    if (k === "],") { dil = "tr"; continue; }
    if (dil === "tr") continue; // referans dil
    const metin = satir.replace(/^[^\p{L}"]*"/u, "").replace(/"[,;]?\s*$/u, "");
    if (metin && (TR_KARAKTER.test(metin) || TR_KELIME.test(metin))) {
      bulgular.push({ tur: `cokdil-${bolum}`, dil, satir: satir.trim().slice(0, 120) });
    }
  }

  // c) RamazanModal'da kullanılan anahtarlar ⊆ TR sözlüğü
  const modal = fs.readFileSync("src/components/RamazanModal.tsx", "utf8");
  const kullanilan = new Set();
  for (const m of modal.matchAll(/tt\("([A-Za-z0-9]+)"\)/g)) kullanilan.add(m[1]);
  for (const m of modal.matchAll(/ad: "(rmzKandil[A-Za-z]+)"/g)) kullanilan.add(m[1]);
  const trSozluk = fs.readFileSync("src/i18n/dicts.tr.ts", "utf8");
  const tanimli = new Set([...trSozluk.matchAll(/^  (rmz[A-Za-z0-9]+):/gm)].map((m) => m[1]));
  for (const k of kullanilan) {
    if (!tanimli.has(k)) bulgular.push({ tur: "eksik-anahtar", anahtar: k, satir: "TR sözlüğünde tanımlı değil → canlıda fallback TR görünür (yalnız tr'de fark edilmez)" });
  }
  return { bulgular, kullanilan: [...kullanilan].sort(), tanimliAdet: tanimli.size };
}

// ─── 2) UI TURU ────────────────────────────────────────────
async function main() {
  const statik = statikDenetim();
  console.log("── STATİK DENETİM ──");
  console.log(`  sözlük rmz* kullanılan: ${statik.kullanilan.length} anahtar (TR sözlüğünde ${statik.tanimliAdet} tanımlı)`);
  for (const b of statik.bulgular) console.log(`   ✗ [${b.tur}] ${b.dil || ""} ${b.anahtar || ""}: ${b.satir}`);
  if (statik.bulgular.length === 0) console.log("  ✓ sözlük değerleri + çok-dil veri katmanı + anahtar bütünlüğü temiz");

  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const kanit = { hedef: HEDEF_URL, statik: { bulguSayisi: statik.bulgular.length, bulgular: statik.bulgular, kullanilanAnahtar: statik.kullanilan.length }, diller: {} };
  let toplamBulgu = statik.bulgular.length;

  try {
    for (const dil of DILLER) {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 } });
      await ctx.addInitScript((d) => { try { localStorage.setItem("nur_lang", d); } catch { /* yok */ } }, dil);
      const page = await ctx.newPage();
      const bulgular = [];
      const notlar = [];

      try {
        await page.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        // çerez kabul (5 dilin gerçek buton metni)
        for (let i = 0; i < 15; i++) {
          const tiklandi = await page.evaluate(() => {
            const b = [...document.querySelectorAll("button")].find((x) => /^(tümünü kabul et|kabul et|accept|قبول|سب قبول|terima)/i.test((x.innerText || "").trim()));
            if (b) { b.click(); return true; } return false;
          }).catch(() => false);
          if (tiklandi) break;
          await page.waitForTimeout(300);
        }
        await page.waitForTimeout(3500);
        // PWA bannerını kapat
        await page.evaluate(() => {
          const banner = document.querySelector("div.fixed.bottom-4.right-4");
          const btn = banner?.querySelector("button[aria-label]");
          if (btn) btn.click();
        }).catch(() => {});
        await page.waitForTimeout(400);

        // menü → Ramazan & Kandil öğesi
        const menuBtn = page.locator('button[data-minitur="menu"]').first();
        await menuBtn.click({ timeout: 5000 });
        await page.waitForTimeout(500);
        const panel = page.locator('[data-sidebar-panel="true"]').first();
        if (!(await panel.isVisible().catch(() => false))) throw new Error("menü paneli açılmadı");
        const ogeler = [/Ramazan & Kandil/i, /Ramadan & Holy/i, /رمضان/u, /Ramadhan & Hari/i];
        let tiklandi = false;
        for (const re of ogeler) {
          const oge = panel.locator("button", { hasText: re }).first();
          if (await oge.isVisible().catch(() => false)) {
            await oge.click({ timeout: 3000 });
            tiklandi = true;
            break;
          }
        }
        if (!tiklandi) throw new Error("menüde Ramazan öğesi bulunamadı");
        await page.waitForTimeout(1200);

        // en büyük .modal-in = Ramazan modalı (sidebar/PWA banner küçük)
        const modalBilgi = await page.evaluate(() => {
          const modallar = [...document.querySelectorAll(".modal-in")];
          if (!modallar.length) return null;
          const enBuyuk = modallar.reduce((a, b) => (b.innerText.length > a.innerText.length ? b : a));
          return { metin: enBuyuk.innerText, acik: enBuyuk.offsetParent !== null || enBuyuk.getClientRects().length > 0 };
        });
        if (!modalBilgi || !modalBilgi.acik) throw new Error("Ramazan modalı açılmadı (.modal-in yok)");
        if (dil !== "tr") for (const b of trBulgular(modalBilgi.metin, "ramazan-modal")) bulgular.push(b);
        const baslikIlkSatir = modalBilgi.metin.split(/\r?\n/)[0] || "";
        // bölüm varlık işaretleri — bilgi amaçlı. NOT: upper-case CSS innerText'i
        //   "BUGÜNÜN AMELİ" döndürür; Türkçe İ toLowerCase'te "i̇" olur →
        //   düz regex kaçırır. Norm: İ→i sonra toLowerCase.
        const norm = (s) => s.replace(/İ/g, "i").toLowerCase();
        const normMetin = norm(modalBilgi.metin);
        const varMi = (liste) => liste.some((x) => normMetin.includes(norm(x)));
        const orucBolumu = varMi(["Oruç Takibi", "Fasting Tracker", "متابعة الصيام", "Pelacak Puasa", "روزہ ٹریکر"]);
        const amelBolumu = varMi(["Bugünün Ameli", "Today's Deed", "عمل اليوم", "Amal Hari Ini", "آج کا عمل"]);
        const takvimBolumu = varMi(["Mühim Geceler", "Holy Nights", "الأيام المهمة", "Hari Penting", "اہم دن"]);
        const sayacBolumu = varMi(["Cuma", "Friday", "الجمعة", "Jumat", "جمعہ"]);
        console.log(`[${dil}] başlık: "${baslikIlkSatir}" | bulgu: ${bulgular.length} | oruç:${orucBolumu ? "✓" : "✗"} amel:${amelBolumu ? "✓" : "✗"} takvim:${takvimBolumu ? "✓" : "✗"} gün-sayacı:${sayacBolumu ? "✓" : "✗"}`);
        for (const b of bulgular) console.log(`   ✗ ${b.satir}${b.karakter ? " (TR-karakter)" : ""}${b.kelime ? " (TR-kelime)" : ""}`);

        await page.screenshot({ path: `scripts/_ramazan-dil-${dil}.png` });
        kanit.diller[dil] = { bulguSayisi: bulgular.length, bulgular, baslik: baslikIlkSatir, bolumler: { oruc: orucBolumu, amel: amelBolumu, takvim: takvimBolumu, gunSayaci: sayacBolumu }, notlar };
        toplamBulgu += bulgular.length;
        await ctx.close();
        continue;
      } catch (e) {
        notlar.push(String(e?.message || e).slice(0, 200));
      }
      kanit.diller[dil] = { bulguSayisi: bulgular.length + 1, bulgular, hata: notlar[0] };
      toplamBulgu += 1; // hata = bulgu sayılır (tur tamamlanamadı)
      console.log(`[${dil}] HATA: ${notlar[0]}`);
      await ctx.close();
    }

    fs.writeFileSync("scripts/_ramazan-dil-turu.json", JSON.stringify(kanit, null, 2));
    console.log("\n── ÖZET ──");
    console.log(`  statik bulgu: ${statik.bulgular.length} | UI turu bulgu: ${toplamBulgu - statik.bulgular.length} | toplam: ${toplamBulgu}`);
    console.log(toplamBulgu === 0
      ? "▶ SONUÇ: PASS ✅ — Ramazan & Kandil Merkezi 5 dilde TR'siz (kanıt: scripts/_ramazan-dil-turu.json)"
      : "▶ SONUÇ: BULGU VAR ❌ — yukarıdaki satırlar düzeltilmeli (kanıt: scripts/_ramazan-dil-turu.json)");
  } finally {
    await browser.close().catch(() => {});
  }
  process.exit(toplamBulgu === 0 ? 0 : 1);
}

main().catch((e) => { console.error("✗ çöktü: " + (e?.message || e)); process.exit(1); });
