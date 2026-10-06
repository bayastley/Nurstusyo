// ═══════════════════════════════════════════════════════════
// KÜTÜPHANE + KISSA KÖŞESİ DİL TURU (06.10)
// İSTEK: "Kütüphane sekmesindeki hadis ve kıssa kartlarının TR
//   anlamlarını 5 dile çevir." Kapsam: (1) Ayet & Dua Kütüphanesi
//   (LIBRARY_ITEMS 28 kart) + (2) Keşfet · Kıssa Köşesi (19 kıssa).
//   Kod i18n'i bu oturumda yapıldı — bu script DOĞRULAMAYA yarıyor:
//
// 1) STATİK DENETİM (Unicode-aware, bash grep'in byte-eşleşme
//    yanlış-pozitiflerine düşmez):
//    • kutuphaneCokDil.ts → en/ar/id/ur bloklarının id-set'i = dualar.ts
//      LIBRARY_ITEMS id'leri (28×4); değerlerde TR karakter yok
//    • kissaCokDil.ts → en/ar/id/ur dizileri 19'ar kayıt (indeks-hizalı);
//      değerlerde TR karakter yok
//    • dicts.{en,ar,id,ur}.ts → 6 yeni anahtar dolu ve doğru alfabeyle
//    • tüketici wiring: LibraryBolum / ModalsContainer / StudioApp /
//      KesfetModal çeviri çağrılarını içeriyor mu
// 2) UI TURU: 5 dilde → setNurModal("library") kütüphane modalı
//    (yer tutucu + sekme + duygu + rozet + kart metinleri TR taraması)
//    → setNurModal("kesfet") → Kıssa Köşesi sekmesi → 19 kart sayacı
//    → ilk kart açılır (ders+dua) → TR taraması + PNG kanıtı.
//    NOT: Kütüphane modalı hiçbir menü öğesiyle AÇILMADIĞI için tur,
//    duman testiyle aynı dev kancasını (window.setNurModal) kullanır.
// KANIT: scripts/_kutuphane-kissa-turu.json + scripts/_kut-*.png/_kissa-*.png
// ═══════════════════════════════════════════════════════════

import fs from "fs";

const HEDEF_URL = (process.argv[2] || "http://localhost:5173").replace(/\/+$/, "");
const DILLER = ["tr", "en", "ar", "id", "ur"];

const TR_KARAKTER = /[ığşçöüİĞŞÇÖÜ]/;
const norm = (s) => String(s || "").replace(/İ/g, "i").toLowerCase();

// ─── yardımcılar ───────────────────────────────────────────
function oku(yol) { return fs.readFileSync(yol, "utf8"); }

/** dil bloğu dilimi: `baslangic` işaretinden sonraki `  ${dil}: {` ... ilk `  },` */
function objeBlogu(metin, dil, baslangic) {
  const bolum = metin.slice(metin.indexOf(baslangic));
  const son = bolum.indexOf("\n};");
  const govde = bolum.slice(0, son > 0 ? son : undefined);
  const m = govde.match(new RegExp(`\\n  ${dil}: \\{([\\s\\S]*?)\\n  \\},`));
  return m ? m[1] : null;
}
/** dil dizisi dilimi: `  ${dil}: [` ... ilk `  ],` */
function diziBlogu(metin, dil, baslangic) {
  const bolum = metin.slice(metin.indexOf(baslangic));
  const son = bolum.indexOf("\n};");
  const govde = bolum.slice(0, son > 0 ? son : undefined);
  const m = govde.match(new RegExp(`\\n  ${dil}: \\[([\\s\\S]*?)\\n  \\],`));
  return m ? m[1] : null;
}

function sozlukDeger(dil, anahtar) {
  const m = oku(`src/i18n/dicts.${dil}.ts`).match(new RegExp(`^  ${anahtar}: "((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1].replace(/\\"/g, '"') : null;
}

function trBulgular(metin, kaynak) {
  const bulgular = [];
  for (const hamSatir of metin.split(/\r?\n/)) {
    const satir = hamSatir.trim();
    if (satir.length < 2) continue;
    if (TR_KARAKTER.test(satir)) bulgular.push({ kaynak, satir: satir.slice(0, 140) });
  }
  return bulgular;
}

// ─── 1) STATİK DENETİM ─────────────────────────────────────
function statikDenetim() {
  const bulgular = [];

  // a) kutuphaneCokDil: id-seti bütünlüğü + TR sızıntısı
  const dualar = oku("src/dualar.ts");
  const gercekIdler = [...dualar.matchAll(/\bid: "(ay-[^"]+|hd-[^"]+|du-[^"]+|zk-[^"]+)"/g)].map((m) => m[1]);
  const kut = oku("src/data/kutuphaneCokDil.ts");
  for (const dil of ["en", "ar", "id", "ur"]) {
    const blok = objeBlogu(kut, dil, "const LIBRARY_COKDIL");
    if (!blok) { bulgular.push({ tur: "kutuphane-blok", dil, satir: "çeviri bloğu bulunamadı" }); continue; }
    const idler = [...blok.matchAll(/\n    "([a-z]+-[a-z0-9]+)": \{/g)].map((m) => m[1]);
    const eksik = gercekIdler.filter((id) => !idler.includes(id));
    const fazla = idler.filter((id) => !gercekIdler.includes(id));
    for (const id of eksik) bulgular.push({ tur: "kutuphane-eksik-id", dil, satir: id });
    for (const id of fazla) bulgular.push({ tur: "kutuphane-fazla-id", dil, satir: id });
    for (const satir of blok.split(/\r?\n/)) {
      if (TR_KARAKTER.test(satir)) bulgular.push({ tur: "kutuphane-tr-sizinti", dil, satir: satir.trim().slice(0, 120) });
    }
  }

  // b) kissaCokDil: indeks-hizalama (19×4) + TR sızıntısı
  const kissaData = oku("src/data/kissaData.ts");
  const trAdet = [...kissaData.matchAll(/\{ ad: "((?:[^"\\]|\\.)*)"/g)].length;
  const trAdlar = [...kissaData.matchAll(/\{ ad: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  const kc = oku("src/data/kissaCokDil.ts");
  for (const dil of ["en", "ar", "id", "ur"]) {
    const blok = diziBlogu(kc, dil, "const KISSA_COKDIL");
    if (!blok) { bulgular.push({ tur: "kissa-blok", dil, satir: "çeviri bloğu bulunamadı" }); continue; }
    const adet = [...blok.matchAll(/\{ ad: /g)].length;
    if (adet !== trAdet) bulgular.push({ tur: "kissa-hizalama", dil, satir: `${adet} kayıt — TR referansı ${trAdet}` });
    for (const satir of blok.split(/\r?\n/)) {
      if (TR_KARAKTER.test(satir)) bulgular.push({ tur: "kissa-tr-sizinti", dil, satir: satir.trim().slice(0, 120) });
    }
  }

  // c) sözlük: 6 yeni anahtar × 5 dil — dolu ve doğru alfabe
  const YENI_ANAHTARLAR = ["libAraYerTutucu", "libBosSonuc", "libStudKullan", "ksKissaSayaci", "libStudEklendi"];
  for (const dil of DILLER) {
    const harf = dil === "ar" || dil === "ur" ? "[\\u0600-\\u06FF\\u0750-\\u077F]" : "[A-Za-z\\u00C0-\\u024F]";
    for (const k of YENI_ANAHTARLAR) {
      const v = sozlukDeger(dil, k);
      if (!v) bulgular.push({ tur: "sozluk-eksik", dil, satir: k });
      else if (!new RegExp(harf).test(v)) bulgular.push({ tur: "sozluk-harfsiz", dil, satir: `${k} = "${v}"` });
    }
  }

  // d) tüketici wiring
  const bolumler = oku("src/components/modalsContainerBolumler.tsx");
  const konteyner = oku("src/components/ModalsContainer.tsx");
  const studio = oku("src/StudioApp.tsx");
  const kesfet = oku("src/components/KesfetModal.tsx");
  const wiring = [
    ["LibraryBolum lang prop", /lang\?: string/.test(bolumler) && /kutuphaneItem\(lang/.test(bolumler)],
    ["LibraryBolum sekme/duygu/rozet", /kutuphaneSekme\(lang/.test(bolumler) && /kutuphaneDuygu\(lang/.test(bolumler) && /kutuphaneRozet\(lang/.test(bolumler)],
    ["ModalsContainer → LibraryBolum lang", /<LibraryBolum[\s\S]{0,220}lang=\{lang\}/.test(konteyner)],
    ["StudioApp useFromLibrary çeviri", /kutuphaneItem\(lang, ham\)/.test(studio)],
    ["StudioApp libraryFiltered çeviri", /kutuphaneItem\(lang, i\)/.test(studio)],
    ["KesfetModal kissaCevir", /kissaCevir\(lang, KISSA_LISTESI\)/.test(kesfet)],
    ["KesfetModal sayaç anahtarı", /ksKissaSayaci/.test(kesfet)],
  ];
  for (const [ad, ok] of wiring) if (!ok) bulgular.push({ tur: "wiring", dil: "-", satir: ad });

  // e) ayetBaslikCokDil (06.10): 575 benzersiz başlık × 4 dil küme bütünlüğü + TR sızıntısı
  const kartDosyalari = [
    "src/data/ayetKartlariData.ts", "src/data/ayetKartlariEk.ts",
    "src/data/ayetKartlariMega/parca1.ts", "src/data/ayetKartlariMega/parca2.ts", "src/data/ayetKartlariMega/parca3.ts",
    "src/data/ayetKartlariMega2/parca1.ts", "src/data/ayetKartlariMega2/parca2.ts", "src/data/ayetKartlariMega2/parca3.ts",
  ];
  const havuzBasliklari = new Set();
  for (const d of kartDosyalari) for (const m of oku(d).matchAll(/title: "((?:[^"\\]|\\.)*)"/g)) havuzBasliklari.add(m[1]);
  const ab = oku("src/data/ayetBaslikCokDil.ts");
  const trListeM = ab.match(/AYET_BASLIKLARI_TR: string\[\] = \[([\s\S]*?)\n\];/);
  const trListe = trListeM ? [...trListeM[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]) : [];
  const trKume = new Set(trListe);
  if (trListe.length !== trKume.size) bulgular.push({ tur: "ayet-baslik-tekrar", dil: "-", satir: `TR listede tekrar: ${trListe.length - trKume.size}` });
  if (trListe.length !== havuzBasliklari.size) bulgular.push({ tur: "ayet-baslik-adet", dil: "-", satir: `TR liste ${trListe.length} — havuz benzersiz ${havuzBasliklari.size}` });
  for (const t of trListe) if (!havuzBasliklari.has(t)) bulgular.push({ tur: "ayet-baslik-fazla", dil: "-", satir: t });
  for (const t of havuzBasliklari) if (!trKume.has(t)) bulgular.push({ tur: "ayet-baslik-eksik", dil: "-", satir: t });
  for (const dil of ["en", "ar", "id", "ur"]) {
    const blok = objeBlogu(ab, dil, "const HARITA");
    if (!blok) { bulgular.push({ tur: "ayet-baslik-blok", dil, satir: "HARITA bloğu yok" }); continue; }
    const anahtarlar = [...blok.matchAll(/"((?:[^"\\]|\\.)*)": "/g)].map((m) => m[1]);
    const eksik = [...trKume].filter((k) => !anahtarlar.includes(k));
    const fazla = anahtarlar.filter((k) => !trKume.has(k));
    for (const k of eksik.slice(0, 4)) bulgular.push({ tur: "ayet-baslik-eksik-ceviri", dil, satir: k + (eksik.length > 4 ? ` (+${eksik.length - 4} daha)` : "") });
    for (const k of fazla.slice(0, 4)) bulgular.push({ tur: "ayet-baslik-yabanci", dil, satir: k });
    for (const satir of blok.split(/\r?\n/)) {
      const deger = satir.replace(/^\s*"[^"]*":\s*/, ""); // anahtar TR → yalnız değere bak
      if (TR_KARAKTER.test(deger)) bulgular.push({ tur: "ayet-baslik-tr-sizinti", dil, satir: satir.trim().slice(0, 120) });
    }
  }

  return { bulgular, gercekIdler, trAdet, trAdlar, havuzAdet: havuzBasliklari.size, trKumeAdet: trKume.size, ayetOrnek: trListe[1] || "" };
}

// ─── 2) UI TURU ────────────────────────────────────────────
async function main() {
  const statik = statikDenetim();
  const kut = oku("src/data/kutuphaneCokDil.ts");
  console.log("── STATİK DENETİM ──");
  console.log(`  dualar.ts kart id: ${statik.gercekIdler.length} | kissaData TR kayıt: ${statik.trAdet} | ayet başlığı: ${statik.trKumeAdet} (havuz ${statik.havuzAdet})`);
  for (const b of statik.bulgular) console.log(`   ✗ [${b.tur}] ${b.dil}: ${b.satir}`);
  if (statik.bulgular.length === 0) console.log("  ✓ 28 kart × 4 dil id-seti + 19 kıssa × 4 dil hizalama + sözlük + wiring temiz");

  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const kanit = { hedef: HEDEF_URL, statik: { bulguSayisi: statik.bulgular.length, bulgular: statik.bulgular }, diller: {} };
  let toplamBulgu = statik.bulgular.length;

  try {
    for (const dil of DILLER) {
      const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 } });
      await ctx.addInitScript((d) => {
        try {
          localStorage.setItem("nur_lang", d);
          localStorage.setItem("nur_minitur_gordu", "1");
          localStorage.setItem("nur_pwa_banner_kapat", String(Date.now()));
          localStorage.setItem("nur_pwa_kuruldu", "1");
        } catch { /* yok */ }
      }, dil);
      const page = await ctx.newPage();
      const bulgular = [];
      const notlar = [];
      const dilSonuc = {};

      try {
        await page.goto(HEDEF_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
        // çerez banner'ı (5 dilin gerçek buton metni)
        for (let i = 0; i < 15; i++) {
          const tiklandi = await page.evaluate(() => {
            const b = [...document.querySelectorAll("button")].find((x) => /^(tümünü kabul et|kabul et|accept|قبول|سب قبول|terima)/i.test((x.innerText || "").trim()));
            if (b) { b.click(); return true; } return false;
          }).catch(() => false);
          if (tiklandi) break;
          await page.waitForTimeout(300);
        }
        await page.waitForTimeout(3000);
        // dev kancası: setNurModal (duman testiyle aynı yol)
        const kanca = await (async () => {
          const t0 = Date.now();
          while (Date.now() - t0 < 20000) {
            const ok = await page.evaluate(() => typeof window.setNurModal === "function").catch(() => false);
            if (ok) return true;
            await page.waitForTimeout(400);
          }
          return false;
        })();
        if (!kanca) throw new Error("window.setNurModal kancası gelmedi — uygulama hata veriyor mu?");

        // ══ A) KÜTÜPHANE MODALI ══
        await page.evaluate(() => window.setNurModal("library"));
        await page.waitForSelector(".modal-in", { timeout: 6000 });
        await page.waitForTimeout(700);
        const libBilgi = await page.evaluate(() => {
          const modallar = [...document.querySelectorAll(".modal-in")];
          if (!modallar.length) return null;
          const m = modallar.reduce((a, b) => (b.innerText.length > a.innerText.length ? b : a));
          const yerTutucu = m.querySelector("input[placeholder]")?.getAttribute("placeholder") || "";
          return { metin: m.innerText, yerTutucu, kartAdet: m.querySelectorAll("h4").length };
        });
        if (!libBilgi) throw new Error("kütüphane modalı açılmadı (.modal-in yok)");
        const libAra = sozlukDeger(dil, "libAraYerTutucu");
        const tumuEtiket = (objeBlogu(kut, dil, "const TIP_COKDIL") || "").match(new RegExp(`tumu: "((?:[^"\\\\]|\\\\.)*)"`))?.[1] || "";
        const duyguEtiket = (objeBlogu(kut, dil, "const DUYGU_COKDIL") || "").match(new RegExp(`tum: "((?:[^"\\\\]|\\\\.)*)"`))?.[1] || "";
        const libMetin = norm(libBilgi.metin);
        dilSonuc.kutuphane = {
          yerTutucuOk: libBilgi.yerTutucu === libAra,
          sekmeOk: libMetin.includes(norm(tumuEtiket)),
          duyguOk: libMetin.includes(norm(duyguEtiket)),
          kartAdet: libBilgi.kartAdet,
        };
        if (!dilSonuc.kutuphane.yerTutucuOk) bulgular.push({ kaynak: "kutuphane-yerTutucu", satir: `"${libBilgi.yerTutucu}" ≠ "${libAra}"` });
        if (!dilSonuc.kutuphane.sekmeOk) bulgular.push({ kaynak: "kutuphane-sekme", satir: `"${tumuEtiket}" modal metninde yok` });
        if (!dilSonuc.kutuphane.duyguOk) bulgular.push({ kaynak: "kutuphane-duygu", satir: `"${duyguEtiket}" modal metninde yok` });
        // ★ AYET KÜTÜPHANESİ (06.10): başlık çevirisi — kart listesinde TR başlık sızıntısı yok mu?
        //   Bu modal Ayet Kütüphanesi'dir (AYET_KARTILARI). tr dışı dilde ilk TR başlığın
        //   görünMEMESİ + örnek çevirinin görünmesi beklenir.
        if (dil !== "tr" && statik.ayetOrnek) {
          const libNorm = norm(libBilgi.metin);
          const trSizinti = [...libBilgi.metin.split(/\r?\n/)].filter((s) => TR_KARAKTER.test(s.trim()) && s.trim().length > 3);
          dilSonuc.kutuphane.ayetTrSizinti = trSizinti.length;
          if (trSizinti.length) bulgular.push({ kaynak: "ayet-baslik-tr-sizinti", satir: trSizinti.slice(0, 3).join(" | ") });
          const abKaynak = oku("src/data/ayetBaslikCokDil.ts");
          const abBlok = objeBlogu(abKaynak, dil, "const HARITA") || "";
          // (regex yok — indexOf: başlıkta kesme işareti vb. olsa da bozulmaz)
          const abKey = `"${statik.ayetOrnek}": "`;
          const kIdx = abBlok.indexOf(abKey);
          const abOrnek = kIdx >= 0 ? abBlok.slice(kIdx + abKey.length, abBlok.indexOf(`"`, kIdx + abKey.length)) : "";
          dilSonuc.kutuphane.ayetOrnekCeviri = abOrnek;
          if (abOrnek && !libNorm.includes(norm(abOrnek))) bulgular.push({ kaynak: "ayet-baslik-ceviri-yok", satir: `"${abOrnek}" modal metninde yok` });
        }
        if (dil !== "tr") bulgular.push(...trBulgular(libBilgi.metin, "kutuphane-modal"));
        await page.screenshot({ path: `scripts/_kut-dil-${dil}.png` });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);

        // ══ B) KEŞFET → KISSA KÖŞESİ ══
        await page.evaluate(() => window.setNurModal("kesfet"));
        await page.waitForSelector(".modal-in", { timeout: 6000 });
        await page.waitForTimeout(500);
        const ksEtiket = sozlukDeger(dil, "ksKissaKosesi");
        const sekmeTiklandi = await page.evaluate((etiket) => {
          const hedef = etiket.replace(/İ/g, "i").toLowerCase();
          const b = [...document.querySelectorAll(".modal-in button")].find((x) => (x.innerText || "").replace(/İ/g, "i").toLowerCase().includes(hedef));
          if (b) { b.click(); return true; } return false;
        }, ksEtiket);
        if (!sekmeTiklandi) throw new Error(`Kıssa sekmesi bulunamadı: "${ksEtiket}"`);
        await page.waitForTimeout(600);
        const enBuyukMetin = () => page.evaluate(() => {
          const modallar = [...document.querySelectorAll(".modal-in")];
          return modallar.length ? modallar.reduce((a, b) => (b.innerText.length > a.innerText.length ? b : a)).innerText : "";
        });
        const kapaliMetin = await enBuyukMetin();
        const kartAdet = await page.evaluate(() => document.querySelectorAll('button[data-kissa="1"]').length);
        const sayaci = (sozlukDeger(dil, "ksKissaSayaci") || "").replace("{n}", String(statik.trAdet));
        dilSonuc.kissa = { kartAdet, kartAdetOk: kartAdet === statik.trAdet, sayacOk: norm(kapaliMetin).includes(norm(sayaci)) };
        if (!dilSonuc.kissa.kartAdetOk) bulgular.push({ kaynak: "kissa-kart-adet", satir: `${kartAdet} kart — beklenen ${statik.trAdet}` });
        if (!dilSonuc.kissa.sayacOk) bulgular.push({ kaynak: "kissa-sayac", satir: `"${sayaci}" modal metninde yok` });
        if (dil !== "tr") {
          for (const ad of statik.trAdlar) {
            if (norm(kapaliMetin).includes(norm(ad))) bulgular.push({ kaynak: "kissa-tr-ad", satir: ad });
          }
        }
        // ilk kartı aç — ders + dua görünür olmalı
        await page.evaluate(() => document.querySelector('button[data-kissa="1"]')?.click());
        await page.waitForTimeout(500);
        const acikMetin = await enBuyukMetin();
        const duaEtiket = sozlukDeger(dil, "ksKissaDuasi");
        dilSonuc.kissa.acildi = norm(acikMetin).includes(norm(duaEtiket));
        if (!dilSonuc.kissa.acildi) bulgular.push({ kaynak: "kissa-akordeon", satir: `"${duaEtiket}" açık kartta yok` });
        if (dil !== "tr") bulgular.push(...trBulgular(acikMetin, "kissa-modal-acik"));
        await page.screenshot({ path: `scripts/_kissa-dil-${dil}.png` });

        console.log(`[${dil}] kütüphane: kart ${dilSonuc.kutuphane.kartAdet} · sekme:${dilSonuc.kutuphane.sekmeOk ? "✓" : "✗"} duygu:${dilSonuc.kutuphane.duyguOk ? "✓" : "✗"} yerTutucu:${dilSonuc.kutuphane.yerTutucuOk ? "✓" : "✗"} | kıssa: ${kartAdet}/19 sayac:${dilSonuc.kissa.sayacOk ? "✓" : "✗"} akordeon:${dilSonuc.kissa.acildi ? "✓" : "✗"} | bulgu: ${bulgular.length}`);
        for (const b of bulgular.slice(0, 8)) console.log(`   ✗ [${b.kaynak}] ${b.satir}`);
        kanit.diller[dil] = { bulguSayisi: bulgular.length, bulgular, ...dilSonuc };
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

    fs.writeFileSync("scripts/_kutuphane-kissa-turu.json", JSON.stringify(kanit, null, 2));
    console.log("\n── ÖZET ──");
    console.log(`  statik bulgu: ${statik.bulgular.length} | UI turu bulgu: ${toplamBulgu - statik.bulgular.length} | toplam: ${toplamBulgu}`);
    console.log(toplamBulgu === 0
      ? "▶ SONUÇ: PASS ✅ — Kütüphane (28 kart) + Kıssa Köşesi (19 kıssa) 5 dilde TR'siz (kanıt: scripts/_kutuphane-kissa-turu.json)"
      : "▶ SONUÇ: BULGU VAR ❌ — yukarıdaki satırlar düzeltilmeli (kanıt: scripts/_kutuphane-kissa-turu.json)");
  } finally {
    await browser.close().catch(() => {});
  }
  process.exit(toplamBulgu === 0 ? 0 : 1);
}

main().catch((e) => { console.error("✗ çöktü: " + (e?.message || e)); process.exit(1); });
