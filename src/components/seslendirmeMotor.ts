// ═══════════════════════════════════════════════════════════════
// SESLENDİRME MOTORU — SeslendirmeModal.tsx'ten çıkarıldı (14.10 modal bölme işi)
// Atmosfer keyword tabloları + kelime-tabanlı skor/böl algoritması.
// Mockup'tan (ai-mockup/ana-ekran-seslendirme.html) birebir işlenmişti —
// hiçbir davranış değişmedi, sadece dosya ayrıldı.
// ═══════════════════════════════════════════════════════════════

// ── atmosfer keyword tablosu + paleti (mockup'tak birebir) ──
export const KEY: Record<string, string> = {
  "namaz": "namaz", "secde": "namaz", "cami": "namaz", "seccade": "namaz", "ibadet": "namaz",
  "deniz": "deniz", "nehir": "deniz", "su": "deniz", "gemi": "deniz",
  "cennet": "cennet", "bahse": "cennet", "zeytin": "cennet",
  "yıldız": "yildizlar", "gok": "yildizlar", "nur": "yildizlar", "ışık": "yildizlar",
  "ateş": "ates", "alev": "ates", "cehennem": "cehennem", "azap": "cehennem",
  "orman": "orman", "ağaç": "orman", "kar": "kar", "kış": "kar", "dağ": "daglar", "zirve": "daglar",
  "fil": "fil", "filler": "fil", "karınca": "karinca", "arı": "ari", "bal": "ari",
  "gül": "cicekler", "çiçek": "cicekler", "çöl": "col", "deve": "col",
  "peygamber": "namaz", "kıssa": "musaf", "hikaye": "musaf", "kitap": "musaf",
};
// ATM — palet: [ad, ikon, gradient]
export const ATM: Record<string, [string, string, string]> = {
  namaz: ["Namaz", "🕌", "linear-gradient(180deg,#0a1450,#122058 50%,#1a2c6e)"],
  yildizlar: ["Yıldızlar", "✨", "linear-gradient(180deg,#050a20,#0a1540 50%,#0f2058)"],
  deniz: ["Deniz", "🌊", "linear-gradient(180deg,#051933,#0a2a50 50%,#0e3a6e)"],
  cennet: ["Cennet", "🌴", "linear-gradient(180deg,#0a1f0d,#14301a 50%,#1e4a28)"],
  ates: ["Ateş", "🔥", "linear-gradient(180deg,#2a0a05,#4a1408 50%,#6a2010)"],
  cehennem: ["Cehennem", "🔥", "linear-gradient(180deg,#1a0500,#2a0a05 50%,#3a1008)"],
  orman: ["Orman", "🌲", "linear-gradient(180deg,#0d1f0d,#1a3a1a 50%,#2d5a2d)"],
  kar: ["Kar", "❄️", "linear-gradient(180deg,#0a1420,#122030 50%,#1a2c40)"],
  daglar: ["Dağlar", "⛰️", "linear-gradient(180deg,#0a1418,#14242c 50%,#1c3038)"],
  fil: ["Fil", "🐘", "linear-gradient(180deg,#181010,#281818 50%,#382020)"],
  karinca: ["Karınca", "🐜", "linear-gradient(180deg,#141008,#221c10 50%,#302818)"],
  ari: ["Arı", "🐝", "linear-gradient(180deg,#1a1406,#2a2412 50%,#3a3418)"],
  cicekler: ["Çiçekler", "🌸", "linear-gradient(180deg,#1a0f18,#2a1a28 50%,#3a2838)"],
  col: ["Çöl", "🏜️", "linear-gradient(180deg,#2a1a08,#3a2a0c 50%,#4a3a10)"],
  musaf: ["Musaf", "📖", "linear-gradient(180deg,#1a1206,#2a2012 50%,#3a3018)"],
};

/** kelime tabanlı atmosfer skorlama — mockup mSkorla birebir */
export function mSkorla(metin: string): string {
  const w = metin.toLocaleLowerCase("tr").split(/[^a-zçğıöşü]+/).filter(Boolean);
  const skor: Record<string, number> = {};
  for (const x of w) {
    for (const [kw, k] of Object.entries(KEY)) {
      const l = kw.length;
      if ((x === kw || x.startsWith(kw)) && l > 0) skor[k] = (skor[k] || 0) + l;
    }
  }
  let best = "musaf", bs = 0;
  for (const [k, s] of Object.entries(skor)) if (s > bs) { best = k; bs = s; }
  return best;
}

/** kelime yürüyüşü — atmosfer geçişinde kes (mockup mKelimeBol birebir) */
function mKelimeBol(metin: string): { m: string; kat: string }[] | null {
  const MAX = 60, MIN = 20;
  const kelimeler = metin.trim().split(/\s+/);
  const out: { m: string; kat: string }[] = [];
  let buf: string[] = [], bufKat: string | null = null;
  const bufSkor: Record<string, number> = {};
  const bufKatSec = () => {
    let b = "musaf", bs = 0;
    for (const [k, s] of Object.entries(bufSkor)) if (s > bs) { b = k; bs = s; }
    return b;
  };
  for (const kelime of kelimeler) {
    const norm = kelime.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]/g, "");
    let enIyi: string | null = null, enIyiLen = 0;
    for (const [kw, k] of Object.entries(KEY)) {
      const l = kw.length;
      if (norm && (norm === kw || norm.startsWith(kw)) && l > enIyiLen) { enIyi = k; enIyiLen = l; }
    }
    buf.push(kelime);
    if (enIyi) bufSkor[enIyi] = (bufSkor[enIyi] || 0) + enIyiLen;
    const say = buf.length;
    const simdikiKat = bufKatSec();
    if (bufKat === null) bufKat = simdikiKat;
    const degisikKat = simdikiKat !== bufKat && say >= MIN && (bufSkor[simdikiKat] || 0) > (bufSkor[bufKat] || 0);
    if (say >= MAX || degisikKat) {
      out.push({ m: buf.join(" "), kat: simdikiKat });
      buf = []; bufKat = null; bufSkorGarbageClear(bufSkor);
    }
  }
  if (buf.length) {
    if (buf.length < Math.floor(MIN / 2) && out.length) out[out.length - 1].m += " " + buf.join(" ");
    else out.push({ m: buf.join(" "), kat: bufKatSec() });
  }
  return out.length > 1 ? out : null;
}
function bufSkorGarbageClear(s: Record<string, number>) { for (const k of Object.keys(s)) delete s[k]; }

// ★ 18.10 KANCA BÖLÜMLEME (merak uyandırıcı parçalar) — kullanıcı emri:
//   "en dikkat çekici merak uyandırıcı kısmında bölsün partlara".
//   Mantık: part sınırını rastgele kelime sayısına değil, METNİN MERAK NOKTASINA
//   koy. Kanca kelimeler (dönüş/soru başlangıcı) ve kancalı cümle sonları
//   (soru işareti, üç nokta, çarpıcı kısa cümle) part kesim noktası seçilir.
//   Böylece bir part 'zALİMSİN SEN...' gibi gerginlikle biter, dinleyici devamı bekler.
const KANCA_KELIMELER = new Set([
  "ama", "ancak", "oysa", "oysaki", "halbuki", "öyleyse", "böylece",
  "ne", "kim", "neden", "niçin", "peki", "hangi", "kaç", "nasıl",
  "birden", "ansızın", "işte", "o an", "sonunda", "derken",
]);
// Kanca cümle sonu işaretleri: soru + üç nokta en güçlü, normal nokta en zayıf.
function kancaPuani(cumle: string): number {
  let p = 0;
  const s = cumle.trim();
  if (/[?¿]$/.test(s)) p += 5;                    // soru işareti — en güçlü merak
  if (/\u2026|\.\.\./.test(s)) p += 4;              // üç nokta — "ne olacak?"
  if (/!$/.test(s)) p += 2;                        // ünlem — vurgu
  const ilkKelime = (s.toLocaleLowerCase("tr").match(/[a-zçğıöşü]+/) || [""])[0];
  if (KANCA_KELIMELER.has(ilkKelime)) p += 3;      // AMA/ANCAK/OYSA başlangıcı — devam şart
  if (KANCA_KELIMELER.has(s.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü ]/g, "").trim().split(/\s+/).pop() || "")) p += 3; // cümle sonu kanca kelimesi
  const kelimeSay = (s.match(/\S+/g) || []).length;
  if (kelimeSay > 0 && kelimeSay <= 5) p += 2;     // çarpıcı kısa cümle — öne çekilmiş vurgu
  return p;
}

/** ★ 18.10 KANCA MOTORU: kancalı cümle planına göre part bölümü —
 *  partlar mümkünse soru/üç-nokta/AMA-ancaK sonlarında kesilir,
 *  dinleyicinin merakı ortada kopmaz. Balans: part MIN 12, HEDEF 25, MAX 45 kelime. */
function mBolKanca(metin: string): { m: string; kat: string }[] | null {
  const MIN = 12, HEDEF = 25, MAX = 45;
  const cumleler = metin.replace(/\s+/g, " ").match(/[^.!?…]+[.!?…]+["»')\]]*\s*|[^.!?…]+$/g) || [];
  if (cumleler.length < 2) return null;
  const kSay = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  const toplam = cumleler.reduce((t, c) => t + kSay(c), 0);
  if (toplam < MIN * 2) return null; // çok kısa — zaten tek part
  // part sınırı adayları: her cümle sonu, kanca puanıyla
  interface Aday { idx: number; sonKelimeIdx: number; puan: number }
  const adaylar: Aday[] = [];
  let acc = 0;
  cumleler.forEach((c, i) => {
    acc += kSay(c);
    if (i < cumleler.length - 1) adaylar.push({ idx: i, sonKelimeIdx: acc, puan: kancaPuani(c) });
  });
  // ardışık illerle: her part ~HEDEF kadar uzar; pencerideki en yüksek kanca puanlı
  // nokerin partı kestirilir (pencere: [HEDEF-10, HEDEF+20] kelimeler arası)
  const out: { m: string; kat: string }[] = [];
  let partBasIdx = 0, partKelime = 0;
  for (let i = 0; i < cumleler.length; i++) {
    partKelime += kSay(cumleler[i]);
    const sonPart = i === cumleler.length - 1;
    const pencereyeGirdi = partKelime >= HEDEF - 8;
    const tasma = partKelime >= MAX + 1;
    if (sonPart) {
      out.push({ m: cumleler.slice(partBasIdx, i + 1).join(" ").trim(), kat: mSkorla(cumleler.slice(partBasIdx, i + 1).join(" ")) });
      break;
    }
    // pencerede en iyi kanca adayı olup part uzunluğu uygunsa kes
    const aday = adaylar.find((a) => a.idx === i);
    if (aday && pencereyeGirdi && (aday.puan >= 4 || tasma)) {
      out.push({ m: cumleler.slice(partBasIdx, i + 1).join(" ").trim(), kat: mSkorla(cumleler.slice(partBasIdx, i + 1).join(" ")) });
      partBasIdx = i + 1; partKelime = 0;
      continue;
    }
    if (tasma && partKelime >= HEDEF - 8) {
      // kanca bulunamadan MAX taşındı → bu cümle sonunda kes (en azwhere kötü seçenek)
      out.push({ m: cumleler.slice(partBasIdx, i + 1).join(" ").trim(), kat: mSkorla(cumleler.slice(partBasIdx, i + 1).join(" ")) });
      partBasIdx = i + 1; partKelime = 0;
    }
  }
  if (out.length <= 1) return null;
  return out;
}

/** ana bölücü — mockup mBol birebir (kısa-öncü ileri birleştirme dahil) */
export function mBol(metin: string): { m: string; kat: string }[] {
  const MAX = 60, MIN = 20, HEDEF = 35;
  const cumleler = metin.replace(/\s+/g, " ").match(/[^.!?…]+[.!?…]+["»')\]]*\s*|[^.!?…]+$/g) || [metin];
  const tekBlok = cumleler.length === 1;
  const tekKelimeSay = (metin.trim().match(/\S+/g) || []).length;
  if (tekBlok && tekKelimeSay > HEDEF) {
    const wp = mKelimeBol(metin);
    if (wp) return wp;
  }
  // ★ 18.10 KANCA ÖNCELİĞİ: çok-cümleli metinde kancalı partlar öncelikli —
  //   kullanıcının istediği "merak uyandırıcı yerde böl" davranışı buradan gelir.
  if (cumleler.length >= 2) {
    const kanca = mBolKanca(metin);
    if (kanca) return kanca;
  }
  const kats = cumleler.map((c) => ({ m: c.trim(), kat: mSkorla(c) })).filter((x) => x.m);
  // kısa öncül (≤2 kelime, "Hz.") bir sonraki cümleye İLERİ birleştirilir
  const birlesik: { m: string; kat: string }[] = [];
  for (let i = 0; i < kats.length; i++) {
    const c = { ...kats[i] };
    const sy = (c.m.trim().match(/\S+/g) || []).length;
    if (sy <= 2 && i + 1 < kats.length) { kats[i + 1].m = c.m + " " + kats[i + 1].m; continue; }
    birlesik.push(c);
  }
  birlesik.forEach((c) => { c.kat = mSkorla(c.m); });
  const out: { m: string; kat: string }[] = [];
  let buf: string[] = [], bufSay = 0, bufKat: string | null = null;
  const kSay = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  for (const c of birlesik) {
    const sy = kSay(c.m);
    if (sy > HEDEF) {
      const wp = mKelimeBol(c.m);
      if (wp) {
        if (buf.length) { wp[0].m = buf.join(" ") + " " + wp[0].m; buf = []; }
        out.push(...wp); continue;
      }
      const gruplar2 = c.m.split(/(?<=[,;:])\s+/);
      let grup: string[] = [], gs = 0;
      for (const g of gruplar2) {
        const gy = kSay(g);
        if (gs + gy > HEDEF && grup.length) {
          out.push({ m: grup.join(", "), kat: mSkorla(grup.join(" ")) });
          grup = []; gs = 0;
        }
        grup.push(g); gs += gy;
      }
      if (grup.length) out.push({ m: grup.join(", "), kat: mSkorla(grup.join(" ")) });
      continue;
    }
    if ((bufSay + sy > MAX && buf.length) || (bufKat && c.kat !== bufKat && bufSay >= MIN)) {
      out.push({ m: buf.join(" "), kat: bufKat! });
      buf = [c.m]; bufSay = sy; bufKat = c.kat; continue;
    }
    buf.push(c.m); bufSay += sy;
    if (!bufKat) bufKat = c.kat;
    if (bufSay >= HEDEF) { out.push({ m: buf.join(" "), kat: bufKat }); buf = []; bufSay = 0; bufKat = null; }
  }
  if (buf.length) out.push({ m: buf.join(" "), kat: bufKat || mSkorla(buf.join(" ")) });
  return out.length ? out : [{ m: metin, kat: mSkorla(metin) }];
}
