// ═══════════════════════════════════════════════════════════════
// SESLENDİRME MOTORU — SeslendirmeModal.tsx'ten çıkarıldı (14.10 modal bölme işi)
// Atmosfer keyword tabloları + kelime-tabanlı skor/böl algoritması.
// Mockup'tan (ai-mockup/ana-ekran-seslendirme.html) birebir işlenmişti —
// hiçbir davranış değişmedi, sadece dosya ayrıldı.
// ═══════════════════════════════════════════════════════════════

// ★ 21.10 AKILLI AI ŞINIFLANDIRICI kaynağı — ana stüdyo ile aynı zekice kelime
//   tablosu (clips/index.ts CLIP_AI_KEYWORDS); modal havuzuna daraltılır.
import { CLIP_AI_KEYWORDS } from "../clips/index";
// ★ 21.10 YÜZLERCE ATMOSFER ENTEGRASYONU (kullanıcı: "yüzlerce atmosfer kanka işte
//   bak o atmosfer kategorilere göre entegre et"): kıssa part'ları artık 15 modal
//   kategorisiyle sınırlı DEĞİL — admin AI manifestindeki 80+ özel kategori
//   ("yusuf kuyu", "at savaş", "belkıs taht", "mağara"...) da skorlanır; isabet
//   metindeki kelimelere EN YAKIN kategoriye gider, techadmin R2 kliplerine otomatik
//   arka plan düşer (SES_ARKA_HAVUZ zaten ALL_CLIPS ile admin klipleri barındırır).
import { ADMIN_AI_KEYWORDS } from "../adminAiKeywords";
import { ADMIN_ATMOSPHERE_CATEGORIES } from "../adminAtmosphereCategories";

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

// ★ 21.10 AKILLI AI KELİME İNDEKSİ (kullanıcı: "sürekli deniz koyuyor kanka") —
//   eski KEY tablosu ~30 kelimeydi; sultan-düzeltmesinden sonra bile parça başına
//   BİR rasgele "su/gemi/çöl" kelimesi tümü Deniz/Çöl yapıyordu. Yeni indeks:
//   CLIP_AI_KEYWORDS (ana stüdyo AI'ın tablosu) modal'ın 15 atmosferine daraltılır +
//   baskınlık eşiği gelir (aşağıda mSkorla). Kısa kelime ≤3 harf SADECE tam eşleşir
//   (sultan≠su, suyunu≠su yanılgısı bitti); uzun keyword için startsWith.
const ATM_KELIME: Record<string, string[]> = (() => {
  const h: Record<string, Set<string>> = {};
  const ekle = (kat: string, kelime: string) => { (h[kat] ||= new Set()).add(kelime); };
  // 1) eski mockup tablosu temel — peygamber/kıssa gibi dini bağlam kelimeleri korunur
  for (const [kw, kat] of Object.entries(KEY)) ekle(kat, kw);
  // 2) ana stüdyo tablosu → modal havuzuna alt eşleme (bulut/cami/göl ATM'de yok)
  const ALT_KAT: Record<string, string> = {
    cami: "namaz", gece: "yildizlar", sehir: "yildizlar",
    selale: "deniz", gol: "deniz", bulut: "deniz",
    gunbatimi: "col", hurma: "col",
  };
  for (const [kat, kws] of Object.entries(CLIP_AI_KEYWORDS)) {
    const hedef = ATM[kat] ? kat : ALT_KAT[kat];
    if (!hedef) continue; // (desen vs. — metne yansımayan görsel kategori, skorla asla)
    for (const w of kws.split(/\s+/)) { const x = w.toLocaleLowerCase("tr"); if (x) ekle(hedef, x); }
  }
  const out: Record<string, string[]> = {};
  for (const [k, s] of Object.entries(h)) out[k] = [...s];
  return out;
})();

const TR2 = (t: string) => { if (globalThis.__KISSA_TRACE) console.log(" [trace]" + t); };

// ★ 21.10 ADMIN KATEGORİ SÖZLÜĞ Ü — id → temiz ad ("admin_joseph_deep_well" → "Yusuf Kuyusu")
const ADMIN_KATEGORI_ADLARI: Record<string, string> = (() => {
  const h: Record<string, string> = {};
  for (const k of ADMIN_ATMOSPHERE_CATEGORIES) h[k.id] = k.label.replace(/^🎞\s*/, "");
  return h;
})();

/** ★ 21.10 YÜZLERCE ATMOSFER: admin AI kategorileri + temel kategoriler BİR PİSTE.
 *  Admin kategoriler listede ÖNDE — eşit puan çakışmasında öz-ele kategori kazanır
 *  (ör. tek "gemi" kelimesi hem deniz hem "Denizde Yük Gemileri"ne oturur → admin kazanır,
 *  çünkü R2 kütüphanesiyle birebir bağlantılı, dikkatli üretildi). */
// ★ 21.10 ANLATI ZENGİNLEŞTİRME (kullanıcı: "kıssada adam diyor balık diyor — mushaf ne alaka"):
//   kıssa metinlerinde geçen yaygın anlatı kelimeleri admin klipleriyle birebir bağlanır —
//   "adam"→Yaşlı Adam, "balık"→Su Altı Akıntıları, "taht/saray"→admin saray/taht...
//   Mushaf artık kıssalarda SON ÇARE değil (mSkorla fallback zinciri sürer).
const OZEL_KELIME: Record<string, string> = {
  admin_aging_elderly_man: "adam adamlar ihtiyar yaşlı",
  admin_belkis_throne_kingdom: "taht şah hükümdar kral krallık saltanat",
  admin_luxury_palace_interior: "saray zindan köşk sarayı",
  admin_market_place_trade: "pazar çarşı kervan takas",
  admin_underwater_currents_dark: "balık balığı sualtı dalgıç",
  admin_karun_treasures_gold: "altın hazine ganimet define",
  admin_praying_hands_islamic: "dua hamdolsun el açma", 
  admin_hudhud_water_suleyman_hoopoe_bird: "hüdhüd kuşlar",
  admin_gushing_spring_river: "pınar kaptan gemiciler",
  admin_pearl_coral_diving: "inci mercan",
  admin_desert_oasis_sources: "vaha bağçenen",
  admin_solar_eclipse_sun: "güneş",
  admin_two_sea_merging: "iki deniz akışı",
  admin_grazing_cattle_sheep: "koyun sığır sürü",
  admin_hadid_iron_metal: "demirci demirciler demir döven dövme çekiç çekici cekic ökse oğu ağır iş atılan kıvılcım",
};
const TAM_HAVUZ: [string, string[]][] = (() => {
  const h: Record<string, Set<string>> = {};
  for (const [kat, soz] of Object.entries(ADMIN_AI_KEYWORDS)) {
    (h[kat] ||= new Set());
    for (const x of soz.split(/\s+/)) if (x) h[kat].add(x.toLocaleLowerCase("tr"));
    if (OZEL_KELIME[kat]) for (const x of OZEL_KELIME[kat].split(/\s+/)) if (x) h[kat].add(x.toLocaleLowerCase("tr"));
  }
  // ★ BUG FIX (21.10 v2): ATM_KELIME = { kategori: kelimeler[] } — ANAHTAR değil
  //   DEĞER kelimeleri havuza eklenmeli (eski kod kategori adını keyword yapmış:
  //   "karınca/deniz/ateş" hiç skorlanamıyor → her şey mushaf'a düşüyordu)
  for (const [kat, kws] of Object.entries(ATM_KELIME)) {
    (h[kat] ||= new Set());
    if (Array.isArray(kws)) for (const w of kws) { const x = String(w).toLocaleLowerCase("tr"); if (x) h[kat].add(x); }
  }
  TR2("toplam havuz kategori=" + Object.keys(h).length + " kelime=" + Object.values(h).reduce((t, s) => t + s.size, 0));
  const out: [string, string[]][] = [];
  for (const [k, s] of Object.entries(h)) out.push([k, [...s]]);
  return out;
})();

/** ★ 21.10 AKILLI SİNİFLANDİRİCİ — mSkorla yükseltildi:
 *  1) Geniş indeks (yukarıda ATM_KELIME, KEY+CLIP_AI_KEYWORDS): "zaman/ağaç/deniz
 *     gemisi/test/terazi" gibi zengin metinde doğru kategori bulur.
 *  2) BASKINLIK EŞİĞİ: kazanan en az 5 puan kopsun VE ikinciye ≥1.5× fark atsın;
 *     aksi halde "musaf" (Kitap/Mushaf görsel) — en az-yanlış gerçek varsayılan.
 *     Tek geçen "su/gemisi/zirve" kelimesi artık Deniz/Çöl getiremez;
 *     kullanıcı emri: "sürekli deniz koyuyor" BİTTİ — emin olmadığında mushaf sayfa.
 *  Kısa keyword (≤3 harf, "su","gul","ari","bul") tam eşleşme; uzunları startsWith.
 *  ★ 21.10 kıssa-fallback parametresi: kıssa bölücüsü önceki part'ın katını verir —
 *     eşik geçmezse mushaf yerine SAHNE AKISI sürer ("mushaf ne alaka" bitti). */
// ★ 26.10 sira PARAMETRESİ — Akıllı AI tazeleme (sira=1 → 2. aday kategori):
//   sira=0 ile davranış ESKİSİYLE birebir aynı (1.1× baskınlık eşiği aktif; kıssa
//   bölücü + stüdyo üretimi bunu kullanıyor, hiç dokunulmadı). sira=1 yalnız
//   akilliAta'dan gelir: skor aynı kalıyorsa sıralamada İKİNCİ kategori alınır —
//   butonun "tikladım ama hiçbir şey değişmedi" yanılgısı biter.
export function mSkorla(metin: string, fallback = "musaf", sira = 0): string {
  const w = metin.toLocaleLowerCase("tr").split(/[^a-zçğıöşü]+/).filter(Boolean);
  const ___trace = globalThis.__SKOR_TRACE ? (kz: Record<string, number>, wz: string[]) => console.log(" [skor]" + wz.join(" "), JSON.stringify(kz)) : null;
  const puan: Record<string, number> = {};
  const hit: Record<string, number> = {};
  for (const x of w) {
    for (const [k, kws] of TAM_HAVUZ) {
      let enIyi = 0;
      for (const kw of kws) if ((x === kw || (kw.length > 3 && x.startsWith(kw))) && kw.length > enIyi) enIyi = kw.length;
      if (enIyi) { puan[k] = (puan[k] || 0) + enIyi; hit[k] = (hit[k] || 0) + 1; }
    }
  }
  // sıra: puan → hit (stabil sort; admin kategoriler TAM_HAVUZ'da önde = eşitlikte kazanır).
  // ★ 21.10 EŞİTLİK KABULÜ: iki kategori EŞİT puanla yarışıyorsa (ör. "denize...gemiye"
  //   → deniz 9 vs Denizde Yük Gemileri 9) musaf'a düşürme YANLINDI — kelimeler
  //   açıkça temalı; eşitlikte önde-sıradaki (admin özelek) kazanır. Üstünlükte
  //   1.2× hafif eşik korundu (eski 1.5 musaf onlarında kaybı yaratiyordu).
  const sirali = Object.keys(puan).sort((a, b) => puan[b] - puan[a] || hit[b] - hit[a]);
  const birinci = sirali[sira] as string | undefined;
  const ikinciPuani = sirali[1] ? puan[sirali[1]] : 0;
  // ★ 26.10 (sira=0): eski eşik AYNI — (sira=1): 2. aday yalnız gerçek puanla (≥5) gelir,
  //   baskınlık eşiği aranmaz; yoksa mushaf fallback'a düşer.
  const kazandi = !!birinci && puan[birinci] >= 5 && (sira > 0 || !sirali[1] || puan[birinci] === ikinciPuani || puan[birinci] >= ikinciPuani * 1.1);
  if (___trace) ___trace(puan, w);
  return kazandi && birinci ? birinci : fallback;
}

/** ★ 21.10 KIŞSA BÖLÜCÜ — anlatı ritmi: 5-7 part (kullanıcı: "musa kıssası en az 5 part
 *  olmalı"). Cümle sınırından parçalara dengeli dağıt; her part'ın katı O part'ın
 *  kelimeklere göre mSkorla'dan, eşik geçmezse ÖNCEKİ sahnenin katı sürer (akış —
 *  mushaf fallback'ı kıssalarda yürür). */
export function mKissaPartla(metin: string, minPart = 5): { m: string; kat: string }[] {
  const TR = (t: string) => { if (globalThis.__KISSA_TRACE) console.log(" [trace]" + t); };
  const kSay = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  // 1) cümleleri böl (nokta/soru/ünlem/…)
  let birimler = (metin.replace(/\s+/g, " ").match(/[^.!?…]+[.!?…]+["»')\]]*\s*|[^.!?…]+$/g) || [metin])
    .map((c) => c.trim()).filter(Boolean);
  // 2) kısa öncülleri birleştir ("Hz." "Ş." gibi) — kendini başlıksız part yapma
  const birlesik: string[] = [];
  for (const b of birimler) {
    birlesik.push(b);
  }
  // "Hz."/"Ş." gibi sonraki cümlenin başına ait kısa öncülleri geri birleştir —
  //    (a) tek başına "Hz." cümlesi (b) "Nemrut, Hz." gibi cümle SONuna takışmış öncül
  for (let i = 0; i < birlesik.length; i++) {
    if (/^[A-ZÇĞİÖŞÜ][a-zçğıöşü]{0,2}\.$/.test(birlesik[i]) && birlesik[i + 1]) {
      birlesik[i + 1] = birlesik[i] + " " + birlesik[i + 1]; birlesik.splice(i, 1); i--;
      continue;
    }
    const oncu = birlesik[i].match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü]{0,2}\.)\s*$/);
    if (oncu && kSay(birlesik[i]) <= 4 && birlesik[i + 1]) {
      birlesik[i] = birlesik[i].slice(0, birlesik[i].length - oncu[1].length - 1).trimEnd();
      birlesik[i + 1] = oncu[1] + " " + birlesik[i + 1];
    }
  }
  birimler = birlesik.filter(Boolean);
  // 3) hedef part adedi: uzun metinde 5-7; kısa metinde de minPart'a esne
  const toplam = birimler.reduce((t, c) => t + kSay(c), 0);
  let hedef = Math.max(minPart, Math.min(7, Math.round(toplam / 42)));
  TR("birlesik=" + birimler.length + " toplam=" + toplam + " hedef=" + hedef);
  // 4) cümle sayısı yetmezse noktalı virgülle, sonra virgülle alt birimlere in —
  //    kıssa anlatımı "deniz açıldı; gemiye vurdu; balık kaptı" mini-olaylı olduğu
  //    için ';' / ',' doğal kesim noktasıdır (kısa metinde de 5 part sağlar).
  if (birimler.length < hedef) birimler = birimler.flatMap((s) => s.split(/;\s*/));
  if (birimler.length < hedef) birimler = birimler.flatMap((s) => s.split(/,\s+/));
  birimler = birimler.map((s) => s.trim()).filter(Boolean);
  TR("alt-birim=" + birimler.length);
  if (birimler.length < 2) { TR("erken-dusmek: birim<2"); return [{ m: metin, kat: mSkorla(metin) }]; }
  hedef = Math.min(birimler.length, Math.max(2, hedef));
  // 5) birimleri hedef part'a DENGELEN dağıt: kesim noktaları önceden hesaplanır —
  //    her part-toplamı toplam kelime/hedef'e en yakın birim sınırına kilitli.
  //    Greedy değil → kuyruk kilidi yok, tam hedef part garantisi.
  const onEkum: number[] = [0];
  for (const b of birimler) onEkum.push(onEkum[onEkum.length - 1] + kSay(b));
  const kesimler: number[] = [];
  for (let p = 1; p < hedef; p++) {
    const hedefKelime = (p / hedef) * toplam;
    let enIyi = (kesimler[kesimler.length - 1] || 0) + 1;
    let enIyiFark = Infinity;
    for (let i = enIyi; i < birimler.length; i++) {
      const fark = Math.abs(onEkum[i] - hedefKelime);
      if (fark < enIyiFark) { enIyiFark = fark; enIyi = i; }
      if (onEkum[i] > hedefKelime + 15) break;
    }
    // son dilim(ler) boş kalmasın: j. kesim en fazla birimler.length - (kalan part) olabilir
    const ustSinir = birimler.length - (hedef - p);
    kesimler.push(Math.min(Math.max(enIyi, (kesimler[kesimler.length - 1] || 0) + 1), ustSinir));
  }
  const partlar: { m: string; kat: string }[] = [];
  for (let p = 0; p < hedef; p++) {
    const bas = p === 0 ? 0 : kesimler[p - 1];
    const son = p === hedef - 1 ? birimler.length : kesimler[p];
    const m = birimler.slice(bas, son).join(" ").trim();
    if (!m) continue;
    const oncelKat = partlar.length ? partlar[partlar.length - 1].kat : "musaf";
    partlar.push({ m, kat: mSkorla(m, oncelKat) });
  }
  TR("partlar=" + partlar.length + " kesimler=" + kesimler.join(","));
  // ★ MUSAF-I TEMİZLE: kıssalarda eşiği geçemeyen part mushaf'ta kalmasın —
  //    önceki sahnenin katından akar (ilk partta sonrakinin katı).
  //    (kullanıcı: "adam diyor balık diyor, mushaf ne alaka")
  for (let i = 1; i < partlar.length; i++) if (partlar[i].kat === "musaf" && partlar[i - 1].kat !== "musaf") partlar[i].kat = partlar[i - 1].kat;
  for (let i = partlar.length - 2; i >= 0; i--) if (partlar[i].kat === "musaf" && partlar[i + 1].kat !== "musaf") partlar[i].kat = partlar[i + 1].kat;
  return partlar.length > 1 ? partlar : [{ m: metin, kat: mSkorla(metin) }];
}

// ★ 21.10 katBilgi — 15 ATM VE admin kategorileri için tek gösterim kaynağı:
//   chip'ler + önizleme rozeti admin kategorilerini de düzgün gösterir (label + konservatif koyu gradyan).
const ADMIN_VEKIL_GRADYAN = "linear-gradient(180deg,#14101a,#201822 50%,#2d232e)";
export function katBilgi(katId: string): { ad: string; ikon: string; gradyan: string } {
  const t = ATM[katId];
  if (t) return { ad: t[0], ikon: t[1], gradyan: t[2] };
  const adminAd = ADMIN_KATEGORI_ADLARI[katId];
  if (adminAd) return { ad: adminAd, ikon: "🎬", gradyan: ADMIN_VEKIL_GRADYAN };
  if (katId && katId.startsWith("admin_")) return { ad: katId.slice("admin_".length).replace(/_/g, " "), ikon: "🎬", gradyan: ADMIN_VEKIL_GRADYAN };
  return { ad: ATM.musaf[0], ikon: ATM.musaf[1], gradyan: ATM.musaf[2] };
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
      // ★ 21.10 SULTAN-DENİZ FİX (ary mSkorla ile aynı kural): kısa kw (≤2 harf) tam eşleşme
      if (norm && (norm === kw || (l > 2 && norm.startsWith(kw))) && l > enIyiLen) { enIyi = k; enIyiLen = l; }
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
  // ★ 20.10: kısa-cümle (5-6-7 kelime) kanca PUANI KALDIRILDI — kullanıcı emri:
  //   "part kısadır, 5-6-7 kelimeden sonra ilk nokta bölümü olmasın".
  //   Kısa cümle artık kesim tetikleyicisi değil; kesim yalnız part uzadıktan sonra olur.
  return p;
}

/** ★ 20.10 UZUN-PART MOTORU (kullanıcı emri: "part uzun olsun, kısa değil;
 *  2-3 cümle sonrası bölünme olsun, kelimeler tam çıksın, anlamsız olmasın"):
 *  Bir part ancak 1) en az AZ_CUMLE cümle biriktikten VE 2) en az HEDEF kelime
 *  ulaştıktan sonra bir kanca (soru/üç-nokta/AMA-ancak) cümle sonunda kesilir.
 *  Kesim noktaları her zaman cümle sonlarıdır — kelime asla ortadan bölünmez.
 *  Balans: part en az 2 cümle + 55 kelime; MAX 95 kelimede zorunlu kesim. */
function mBolKanca(metin: string): { m: string; kat: string }[] | null {
  // ★ 20.10 YENİ KURAL (kullanıcı: "her 3 cümlede part ayrılsın, noktalama işaretleri
  //  olursa da her 3. noktadan sonra diger parta"): HEDEF kelime araması YERINE
  //  cümle-SAYACI kuralı — her part TAM 3 CÜMLE (nokta/soru/ünlem/…) sonunda kesilir.
  //  HEDEF/MAX yine kelime sağlığı (aşırı uzun cümlede MAX koruma) çalışır.
  const AZ_CUMLE = 3, HEDEF = 55, MAX = 95;
  const cumleler = metin.replace(/\s+/g, " ").match(/[^.!?…]+[.!?…]+["»')\]]*\s*|[^.!?…]+$/g) || [];
  if (cumleler.length < AZ_CUMLE + 1) return null;
  const kSay = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  const toplam = cumleler.reduce((t, c) => t + kSay(c), 0);
  if (toplam < HEDEF + 20) return null; // çok kısa — zaten tek part
  // part sınırı adayları: her cümle sonu, kanca puanıyla
  interface Aday { idx: number; sonKelimeIdx: number; puan: number }
  const adaylar: Aday[] = [];
  let acc = 0;
  cumleler.forEach((c, i) => {
    acc += kSay(c);
    if (i < cumleler.length - 1) adaylar.push({ idx: i, sonKelimeIdx: acc, puan: kancaPuani(c) });
  });
  const out: { m: string; kat: string }[] = [];
  let partBasIdx = 0, partKelime = 0, partCumle = 0;
  for (let i = 0; i < cumleler.length; i++) {
    partKelime += kSay(cumleler[i]);
    partCumle++;
    const sonPart = i === cumleler.length - 1;
    if (sonPart) {
      out.push({ m: cumleler.slice(partBasIdx, i + 1).join(" ").trim(), kat: mSkorla(cumleler.slice(partBasIdx, i + 1).join(" ")) });
      break;
    }
    // ★ kesim koşulu 20.10 v2 — HER 3. CÜMLE sonunda kes:
    //   partCumle >= AZ_CUMLE (3) → kes (kanca puanına bakmayı beklemeden;
    //   kanca varsa zaten baskın, yoksa da 3 cümle hazır demektir). Kelime
    //   MAX/HEDEF koruma devam eder.
    const kesOlgun = partCumle >= AZ_CUMLE;
    const aday = adaylar.find((a) => a.idx === i);
    const kancali = aday ? aday.puan >= 4 : false;
    const tasmaZorla = kesOlgun && partKelime >= HEDEF + 15;
    if (kesOlgun && (kancali || partKelime >= MAX || tasmaZorla)) {
      out.push({ m: cumleler.slice(partBasIdx, i + 1).join(" ").trim(), kat: mSkorla(cumleler.slice(partBasIdx, i + 1).join(" ")) });
      partBasIdx = i + 1; partKelime = 0; partCumle = 0;
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
    // ★ 20.10 (kullanıcı emri "kısa part olmasın"): atmosfer kat değişiminde
    //   MIN(20) kelimeyle kesme KALDIRILDI — part en az HEDEF(35) kelime dolmadan
    //   kesilmez; sadece MAX aşımında zorunlu kesim var.
    if (bufSay + sy > MAX && buf.length) {
      out.push({ m: buf.join(" "), kat: bufKat! });
      buf = [c.m]; bufSay = sy; bufKat = c.kat; continue;
    }
    buf.push(c.m); bufSay += sy;
    if (!bufKat) bufKat = c.kat;
    if (bufSay >= HEDEF) { out.push({ m: buf.join(" "), kat: bufKat }); buf = []; bufSay = 0; bufKat = null; }
  }
  if (buf.length) {
    // ★ artık-parça temizliği: son kalıntı çok kısaysa (< 10 kelime) önceki parta
    //   birleştir — "Ne mutlu onlara!" gibi tek başına minik part oluşmasın.
    const kalinti = buf.join(" ");
    if (out.length && bufSay < 10) out[out.length - 1].m += " " + kalinti;
    else out.push({ m: kalinti, kat: bufKat || mSkorla(kalinti) });
  }
  return out.length ? out : [{ m: metin, kat: mSkorla(metin) }];
}
