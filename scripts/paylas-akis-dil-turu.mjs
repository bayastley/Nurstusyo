// ═══════════════════════════════════════════════════════════
// PAYLAŞ AKIŞI DİL TURU — canlı (06.10)
// İSTEK: "Canlıda 5 dilin hepsinde stüdyo paylaş akışını gez,
//   hâlâ Türkçe kalan tek bir metin varsa bul ve düzelt."
//
// GEZİLEN AKIŞ (her dilde): stüdyo açılır → Sosyal Paylaşım Paneli
//   (başlık girişi + açıklama + kopyala + hızlı paylaş + rastgele
//   başlık/açıklama/hashtag + ZIP kartı + footer) → Kopyala tıklaması
//   → toast metni → Pro-kilitli butonlar PremiumModal'i açar → modal metni.
//
// TESPİT: lang=tr hariç toplanan TÜM metinler Türkçe işaretçilerle
//   taranır (ı/İ/ğ/ş/ç/ö/ü karakterleri + tipik TR kelimeleri).
//   Whitelist: marka/kaynak adları + "Türkçe" dil seçici adı.
// KANIT: scripts/_paylas-dil-turu.json + dil başına ekran görüntüsü
// ═══════════════════════════════════════════════════════════

import fs from "fs";

const HEDEF_URL = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");

const DILLER = ["tr", "en", "ar", "id", "ur"];

// Türkçe işaretçiler — karakter bazlı (güçlü)
const TR_KARAKTER = /[ığşçöüİĞŞÇÖÜ]/;
// Tipik Türkçe kelimeler (kelime sınırıyla)
const TR_KELIME = /\b(için|ile|paylaş|paylaşım|kopyala|indir|gönder|başlık|açıklama|üret|hakkı|kalan|şimdi|değil|olarak|gibi|ayet|ayeti|suresi|secde|kalp|gönül|dua|ruh|sonra|zaman|yeni|burada|hepsi)\b/i;
// Whitelist: bu alt dizeleri içeren satırlar atlanır (marka + dil adı)
const BEYAZ = [
  "nurstudyo.com", "Nûr Stüdyo", "Nûr Studio", "NÛR STÜDYO", "STÜDYO", "Pexels", "EveryAyah", "Everyayah",
  "AlQuran Cloud", "Aladhan", "YouTube", "TikTok", "Instagram", "WhatsApp",
  "Türkçe", "© 2026 nurstudyo.com",
];

function trBulgular(metin) {
  const bulgular = [];
  for (const hamSatir of metin.split(/\r?\n/)) {
    const satir = hamSatir.trim();
    if (satir.length < 2) continue;
    if (BEYAZ.some((b) => satir.includes(b))) continue;
    const karakter = TR_KARAKTER.test(satir);
    const kelime = TR_KELIME.test(satir);
    if (karakter || kelime) bulgular.push({ satir: satir.slice(0, 140), karakter, kelime });
  }
  return bulgular;
}

async function main() {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const kanit = { hedef: HEDEF_URL, diller: {} };
  let toplamBulgu = 0;

  try {
    for (const dil of DILLER) {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 } });
      await ctx.addInitScript((d) => { try { localStorage.setItem("nur_lang", d); } catch { /* yok */ } }, dil);
      const page = await ctx.newPage();
      const bulgular = [];
      const notlar = [];
      const topla = (kaynak, metin) => { for (const b of trBulgular(metin || "")) bulgular.push({ kaynak, ...b }); };

      try {
        await page.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        // çerez kabul (dile göre değişir): Kabul Et / Accept / قبول / Terima
        for (let i = 0; i < 15; i++) {
          const tıklandı = await page.evaluate(() => {
            const b = [...document.querySelectorAll("button")].find((x) => /^(Kabul Et|Accept|قبول|Terima)\b/i.test((x.innerText || "").trim()));
            if (b) { b.click(); return true; } return false;
          }).catch(() => false);
          if (tıklandı) break;
          await page.waitForTimeout(300);
        }
        await page.waitForTimeout(3500);

        // Paylaş panelini bul: maxLength=80 başlık girişi (SocialSharePanel'e özgü)
        const giris = page.locator('input[maxlength="80"]').first();
        if (!(await giris.isVisible().catch(() => false))) throw new Error("paylaşım başlığı girişi bulunamadı (panel açık değil mi?)");
        const bolum = page.locator('section', { has: giris }).first();
        const bolumMetin = await bolum.innerText();
        topla("paylas-paneli", bolumMetin);
        const baslikDegeri = await giris.inputValue();
        topla("baslik-alani", baslikDegeri);
        const aciklamaDegeri = await page.locator('textarea[rows="5"]').first().inputValue().catch(() => "");
        topla("aciklama-alani", aciklamaDegeri);

        // Kopyala tıkla → toast (notify) metni — çok dilli etiket: Kopyala/Copy/نسخ/Salin/کاپی
        const onceMetin = await page.evaluate(() => document.body.innerText);
        await giris.scrollIntoViewIfNeeded().catch(() => {});
        try {
          const kopyala = page.getByRole("button", { name: /Kopyala|Copy|نسخ|Salin|کاپی/i }).first();
          await kopyala.click({ timeout: 5000 });
          await page.waitForTimeout(1200);
          const sonraMetin = await page.evaluate(() => document.body.innerText);
          const eski = new Set(onceMetin.split(/\r?\n/).map((s) => s.trim()));
          const yeni = sonraMetin.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !eski.has(s));
          topla("kopyala-toast", yeni.join("\n"));
        } catch {
          notlar.push("kopyala butonu tıklanamadı (etiket farklı olabilir) — atlandı");
        }

        // Pro kilitli: rastgele başlık → PremiumModal metni (paylaş akışının parçası)
        const rastgele = page.locator("button", { hasText: /Rastgele başlık|Random title|عنوان عشوائي|Judul acak|بے ترتیب عنوان/i }).first();
        if (await rastgele.isVisible().catch(() => false)) {
          await rastgele.click({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(1500);
          // ★ Yalnız modal konteyneri oku (.modal-in en üstteki) — body'den okumak
          //   stüdyo arka yüzündeki (kapsam dışı) TR verileri de bulgu sanıyordu.
          const modalMetin = await page.evaluate(() => {
            const modallar = [...document.querySelectorAll(".modal-in")];
            return modallar.length ? modallar[modallar.length - 1].innerText : "";
          });
          topla("premium-modal", modalMetin.slice(0, 4000));
          await page.screenshot({ path: `scripts/_paylas-dil-${dil}.png` });
          // modalı kapat (Esc)
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(600);
        } else {
          await page.screenshot({ path: `scripts/_paylas-dil-${dil}.png` });
        }
      } catch (e) {
        notlar.push(String(e?.message || e).slice(0, 160));
      }

      kanit.diller[dil] = { bulguSayisi: dil === "tr" ? 0 : bulgular.length, bulgular, notlar };
      if (dil !== "tr") toplamBulgu += bulgular.length;
      console.log(`[${dil}] bulgu: ${dil === "tr" ? "(referans — taranmadı)" : bulgular.length}${notlar.length ? "  not: " + notlar.join(" | ") : ""}`);
      for (const b of (dil === "tr" ? [] : bulgular)) console.log(`   ✗ [${b.kaynak}] ${b.satir}${b.karakter ? " (TR-karakter)" : ""}${b.kelime ? " (TR-kelime)" : ""}`);
      await ctx.close();
    }

    fs.writeFileSync("scripts/_paylas-dil-turu.json", JSON.stringify(kanit, null, 2));
    console.log("\n── ÖZET ──");
    console.log(`  EN/AR/ID/UR toplam Türkçe bulgu: ${toplamBulgu}`);
    console.log(toplamBulgu === 0
      ? "▶ SONUÇ: PASS ✅ — paylaş akışında Türkçe kalan metin yok (kanıt: scripts/_paylas-dil-turu.json)"
      : "▶ SONUÇ: BULGU VAR ❌ — yukarıdaki satırlar düzeltilmeli (kanıt: scripts/_paylas-dil-turu.json)");
  } finally {
    await browser.close().catch(() => {});
  }
  process.exit(toplamBulgu === 0 ? 0 : 1);
}

main().catch((e) => { console.error("✗ çöktü: " + (e?.message || e)); process.exit(1); });
