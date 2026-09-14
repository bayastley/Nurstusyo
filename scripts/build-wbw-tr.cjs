// quran.com API'den TUM Kur'an (6236 ayet, ~77430 kelime) kelimelerini
// Turkce kelime meali (translations=77) ile ceker -> public/wbw-tr-full.json uretir.
//
// Yontem:
// 1) Her surenin kelimeleri by_chapter ile cekilir; Turkce donenler sozluge yazilir.
// 2) by_chapter'da İngilizce dönen kelimeler için her AYET ayri bir by_key istegiyle
//    tekrar denenir (API bazen by_key'te Türkçe döndürüyor) ve yine sozlüğe eklenir.
// 3) Sozluk: norm(osmanlica) -> turkce. Ayrica İngilizce WbW karşılıkları
//    "enWbw" alanında ayrı tutulur (istemci yedeği olarak kullanabilir).
const fs = require("fs");
const path = require("path");
const BASE = "https://api.quran.com/api/v4";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isEn = (t, lang) => lang === "english" || /^[A-Za-z][A-Za-z .,'’\-\(\)]*$/.test(t || "");

const norm = (s) => (s || "")
  .replace(/[\u0670\u06E1\u064B-\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, "")
  .replace(/\u0671/g, "\u0627")
  .replace(/\u0649/g, "\u064A")
  .replace(/\u0629/g, "\u0647")
  .replace(/[\u06CC]/g, "\u064A")
  .replace(/\s+/g, "")
  .trim();

async function fetchJson(url, tries = 5) {
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const r = await fetch(url);
      if (r.status === 429) { await sleep(6000); continue; }
      if (!r.ok) { await sleep(2500); continue; }
      return await r.json();
    } catch { await sleep(3000); }
  }
  return null;
}

async function main() {
  const raw = {};   // norm -> turkce
  const enWbw = {}; // norm -> ingilizce (yedek)
  let total = 0;

  for (let s = 1; s <= 114; s++) {
    const data = await fetchJson(
      `${BASE}/verses/by_chapter/${s}?words=true&word_fields=text_uthmani%2Ctranslation&translations=77&language=tr&per_page=300&page=1`
    );
    if (!data) { console.error("SURE HATA:", s); continue; }

    for (const v of data.verses || []) {
      for (const w of v.words || []) {
        if (w.char_type_name !== "word") continue;
        total++;
        const n = norm(w.text_uthmani);
        const tr = w.translation?.text || "";
        if (!n) continue;
        if (isEn(tr, w.translation?.language_name)) {
          if (tr && !enWbw[n]) enWbw[n] = tr;
        } else if (tr && !raw[n]) {
          raw[n] = tr;
        }
      }
    }
    if (s % 10 === 0) console.log(`[gecis1] sure ${s}/114 | sozluk: ${Object.keys(raw).length} | EN-yedek: ${Object.keys(enWbw).length}`);
    await sleep(400);
  }

  // Gecis 2: hala Turkcesi olmayan norm kelimeler icin ornek ayetleri by_key ile dene.
  // (API bazen istek basina farkli cevap donuyor — ikinci sans)
  const stillMissing = Object.keys(enWbw).filter((k) => !raw[k]);
  console.log(`[gecis2] Turkcesi hala olmayan benzersiz kelime: ${stillMissing.length}`);

  // Bu kelimeleri iceren ayetleri bulmak pahali; yerine rastgele 200 ayetten sozluk zenginlestirmesi:
  // zaten gecis1'de butun Kur'an tarandi; gecis2 yalnizca API'nin tutarsiz cevaplarini yakalamak icin
  // ayni sureleri ikinci kez, daha yavas hizla tarar.
  for (let s = 1; s <= 114; s++) {
    const data = await fetchJson(
      `${BASE}/verses/by_chapter/${s}?words=true&word_fields=text_uthmani%2Ctranslation&translations=77&language=tr&per_page=300&page=1`
    );
    if (!data) continue;
    for (const v of data.verses || []) {
      for (const w of v.words || []) {
        if (w.char_type_name !== "word") continue;
        const n = norm(w.text_uthmani);
        const tr = w.translation?.text || "";
        if (n && tr && !isEn(tr, w.translation?.language_name) && !raw[n]) raw[n] = tr;
      }
    }
    if (s % 20 === 0) console.log(`[gecis2] sure ${s}/114 | sozluk: ${Object.keys(raw).length}`);
    await sleep(700);
  }

  const out = {
    translations: raw,
    enWbw,
    generatedAt: new Date().toISOString(),
    source: "quran.com api v4 translations=77 (Diyanet) + WbW en yedek",
  };
  const dest = path.join(__dirname, "..", "public", "wbw-tr-full.json");
  fs.writeFileSync(dest, JSON.stringify(out));
  console.log(`BITTI. toplam kelime: ${total} | sozluk: ${Object.keys(raw).length} | EN yedek: ${Object.keys(enWbw).length}`);
  console.log("yazildi:", dest);
}

main();
