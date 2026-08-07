// ════════════════════════════════════════════════════════
// CLIPS.TS — Nûr Stüdyo Video Kütüphanesi
// URL'ler runtime'da oluşturulur → dosya küçük kalır
// ════════════════════════════════════════════════════════

export type CatId =
  | "yuklenenler" | "namaz"  | "musaf"    | "cicekler"
  | "yildizlar"  | "cennet" | "deniz"    | "daglar"
  | "gunbatimi"  | "gece"   | "selale"   | "orman"
  | "col"        | "kar"    | "sehir"    | "cami"
  | "desen"      | "gol"    | "bulut"
  | "ates"       | "cehennem" | "hurma"  | "ari" | "karinca";

export interface Clip {
  id: string;
  label: string;
  cat: CatId;
  kind: "img" | "vid";
  src: string;
  poster?: string;
  /** Orijinal Pexels video ID'si (R2 eşlemesi için) */
  pexelsId?: number;
  /** Kendi R2 CDN'indeki kopya — varsa önce bu denenir */
  r2?: string;
  r2Poster?: string;
}

// ════════════════════════════════════════════════════════
// KENDİ CDN'İN — Cloudflare R2 (media-automator ile dolduruldu)
// Dosyalar videos/{kategori}/{pexelsId}.mp4 şeklinde yüklendi.
// ════════════════════════════════════════════════════════
export const R2_BASE = "https://nurstudyo.com";

// ★ SIRALAMA KURALI: Aktif/erişilebilir kategoriler (Free/Pro/Elit ile açılabilenler) HEP ÖNCE gelir.
// V2/V3 sert kilitli (lansmanda pasif) kategoriler listenin EN ALTINA toplu halde eklenir — karışık dizilmez.
export const CATEGORIES: Array<{ id: CatId; label: string }> = [
  // ── ★ EN ÜSTTE: Kullanıcının kendi yüklemeleri (V3 kilitli, admin hariç) ──
  { id: "yuklenenler", label: "📁 Yüklediklerim" },
  // ── AKTİF (Free/Pro derinlik kademeli) — ilk 5 ──
  { id: "namaz",       label: "🕌 Namaz & Kâbe" },
  { id: "musaf",       label: "📖 Kur'an & Mushaf" },
  { id: "cicekler",    label: "🌸 Çiçekler & Güller" },
  { id: "yildizlar",   label: "✨ Yıldızlar & Uzay" },
  { id: "deniz",       label: "🌊 Deniz & Dalgalar" },
  // ── AKTİF (Elit'e özel) — ikinci 5 ──
  { id: "daglar",      label: "🏔️ Dağlar & Zirve" },
  { id: "gunbatimi",   label: "🌅 Gün Batımı" },
  { id: "gece",        label: "🌙 Gece & Ay" },
  { id: "selale",      label: "💧 Şelaleler" },
  { id: "orman",       label: "🌲 Orman & Yeşil" },
  // ── V2/V3 SERT KİLİTLİ (lansmanda pasif) — hepsi en altta, karışık değil ──
  { id: "cennet",      label: "🌿 Cennet Bahçeleri" },
  { id: "col",         label: "🔥 Çöl & Ateş" },
  { id: "kar",         label: "❄️ Kar & Buz" },
  { id: "sehir",       label: "🏙️ Medeniyet & Şehir" },
  { id: "cami",        label: "🕌 İslam Mimarisi" },
  { id: "desen",       label: "🔷 Geometrik Desen" },
  { id: "gol",         label: "🏞️ Sakin Göl" },
  { id: "bulut",       label: "☁️ Bulutlar" },
  { id: "ates",        label: "🔥 Ateş & Alev" },
  { id: "cehennem",    label: "⚡ Cehennem & Karanlık" },
  { id: "hurma",       label: "🌴 Hurma & Vaha" },
  { id: "ari",         label: "🐝 Arı & Bal" },
  { id: "karinca",     label: "🐜 Karınca & Mikro" },
];

// ★ LANSMAN: 10 aktif kategori. İlk 5'i Free/Pro derinlik kademeli, ikinci 5'i tamamen Elit'e özel.
// Bu 10'un dışındaki tüm kategoriler HARD_LOCKED_CATEGORIES ile V2/V3 olarak tamamen tıklanamaz kalır.
export const ACTIVE_CATEGORIES: CatId[] = [
  "namaz", "musaf", "cicekler", "yildizlar", "deniz",
  "daglar", "gunbatimi", "gece", "selale", "orman",
  // ★ Elit'e açılan kategoriler — şablon + hareketli, Elit dışına kilitli
  "cennet", "col", "ates", "kar", "sehir",
];

/**
 * Kategori tier kilidi (lansman modeli):
 * - free  → İlk 5 kategori: her birinde ilk 5 video free (parlak), 6-50 arası videolar Pro gerektirir.
 * - elit  → İkinci 5 kategori (daglar/gunbatimi/gece/selale/orman) TAMAMEN Elit'e özel; Pro bu kategorilere hiç giremez (karartılmış kalır).
 *           Free 5 kategorinin video derinliği Elit'te de otomatik tam açılır (tierAtLeast mantığı).
 * - Not: "pro" kategori seviyesi artık yok — Pro yeni kategori açmaz, sadece ilk 5 kategoride video derinliğini (6-50) açar.
 */
export const KATEGORI_TIER: Record<string, "free" | "pro" | "elit"> = {
  // ★ FREE kategoriler (8) — ilk izlenimde bolluk hissi için genişletildi.
  //   Pro bu kategorilerdeki 11-50 arası videoları açar.
  namaz: "free", musaf: "free", cicekler: "free", yildizlar: "free", deniz: "free",
  gunbatimi: "free", gece: "free", orman: "free",
  // ★ PRO'YA ÖZEL KATEGORİLER (4) — Pro almanın somut karşılığı (önceden hiç yoktu)
  selale: "pro", daglar: "pro", kar: "pro", sehir: "pro",
  // ELİT'E ÖZEL AKTİF KATEGORİLER — sadece Elit girebilir
  cennet: "elit", col: "elit", cami: "elit",
  // ─── AŞAĞIDAKİLER LANSMANDA AKTİF DEĞİL (HARD_LOCKED_CATEGORIES ile tamamen tıklanamaz) ───
  desen: "elit", gol: "elit", bulut: "elit", yuklenenler: "elit",
  ates: "elit", ari: "elit", cehennem: "elit", hurma: "elit", karinca: "elit",
};

/**
 * ★ V2/V3 SERT KİLİT: Bu kategoriler lansmanda ACTIVE_CATEGORIES dışındadır.
 * Arayüzde silik/karartılmış görünürler, üzerlerinde kilit rozeti olur ve
 * tıklama/tuşlama olayları tier'dan bağımsız olarak TAMAMEN engellenir (pointer-events: none).
 */
export const HARD_LOCKED_CATEGORIES: CatId[] = [
  "cami", "desen", "gol", "bulut", "yuklenenler",
  "cehennem", "hurma", "ari", "karinca",
];

/** Her kategoride kaç video free tier'ında aktif (5 → 10 genişletildi) */
export const FREE_VIDEOS_PER_CATEGORY = 10;

/**
 * Her kategori için generative kaleidoscope paleti.
 * [primary, secondary, glow] — AI doğru kategoriyi seçtiğinde görsel de değişsin diye.
 */
export const CATEGORY_PALETTE: Record<CatId, { primary: string; secondary: string; glow: string; bg: string; bg2: string }> = {
  namaz:     { primary: "#d7aa52", secondary: "#f5dda6", glow: "#ffcf6b", bg: "#1a0e05", bg2: "#3a2410" },
  musaf:     { primary: "#c9a24a", secondary: "#f3e2a8", glow: "#e8c46a", bg: "#140a18", bg2: "#2a1838" },
  cicekler:  { primary: "#ec4899", secondary: "#fbcfe8", glow: "#f472b6", bg: "#1a0612", bg2: "#3a1028" },
  yildizlar: { primary: "#818cf8", secondary: "#c7d2fe", glow: "#a5b4fc", bg: "#060818", bg2: "#141838" },
  cennet:    { primary: "#34d399", secondary: "#a7f3d0", glow: "#6ee7b7", bg: "#04140c", bg2: "#0a3020" },
  deniz:     { primary: "#22d3ee", secondary: "#a5f3fc", glow: "#67e8f9", bg: "#04141a", bg2: "#0a3040" },
  daglar:    { primary: "#94a3b8", secondary: "#e2e8f0", glow: "#cbd5e1", bg: "#0a1018", bg2: "#1a2838" },
  gunbatimi: { primary: "#fb923c", secondary: "#fed7aa", glow: "#fdba74", bg: "#1a0a04", bg2: "#3a1808" },
  gece:      { primary: "#6366f1", secondary: "#c7d2fe", glow: "#818cf8", bg: "#04040f", bg2: "#0e0e28" },
  selale:    { primary: "#06b6d4", secondary: "#a5f3fc", glow: "#22d3ee", bg: "#041418", bg2: "#0a3038" },
  orman:     { primary: "#22c55e", secondary: "#bbf7d0", glow: "#4ade80", bg: "#04140a", bg2: "#0a3018" },
  col:       { primary: "#ef4444", secondary: "#fecaca", glow: "#f87171", bg: "#1a0604", bg2: "#3a1008" },
  kar:       { primary: "#bae6fd", secondary: "#f0f9ff", glow: "#e0f2fe", bg: "#0a1420", bg2: "#1a2838" },
  sehir:     { primary: "#f59e0b", secondary: "#fde68a", glow: "#fbbf24", bg: "#14100a", bg2: "#2a2010" },
  cami:      { primary: "#d7aa52", secondary: "#f5dda6", glow: "#ffcf6b", bg: "#140a18", bg2: "#2a1838" },
  desen:     { primary: "#a855f7", secondary: "#e9d5ff", glow: "#c084fc", bg: "#10061a", bg2: "#241038" },
  gol:       { primary: "#14b8a6", secondary: "#99f6e4", glow: "#2dd4bf", bg: "#041414", bg2: "#0a3030" },
  bulut:     { primary: "#93c5fd", secondary: "#dbeafe", glow: "#bfdbfe", bg: "#0a1018", bg2: "#1a2438" },
  yuklenenler:{ primary: "#d7aa52", secondary: "#f5dda6", glow: "#ffcf6b", bg: "#141414", bg2: "#2a2a2a" },
  // Kur'an konu evreni paletleri
  ates:      { primary: "#f97316", secondary: "#fed7aa", glow: "#fb923c", bg: "#1c0a02", bg2: "#3d1604" },
  cehennem:  { primary: "#dc2626", secondary: "#7c2d12", glow: "#ef4444", bg: "#120202", bg2: "#2a0808" },
  hurma:     { primary: "#84cc16", secondary: "#d9f99d", glow: "#a3e635", bg: "#0c1404", bg2: "#1e2e08" },
  ari:       { primary: "#eab308", secondary: "#fef08a", glow: "#facc15", bg: "#161002", bg2: "#302404" },
  karinca:   { primary: "#a16207", secondary: "#d6c39a", glow: "#ca8a04", bg: "#120c04", bg2: "#281c08" },
};

export const CATEGORY_LOCK_LEVEL: Record<CatId, string> = {
  // ★ KATEGORI_TIER ile birebir senkron rozet etiketleri
  // Ücretsiz (8) — her birinde ilk 10 video free, sonrası Pro
  namaz:"Ücretsiz", musaf:"Ücretsiz", cicekler:"Ücretsiz", yildizlar:"Ücretsiz",
  deniz:"Ücretsiz", gunbatimi:"Ücretsiz", gece:"Ücretsiz", orman:"Ücretsiz",
  // Pro'ya özel (4)
  selale:"Pro", daglar:"Pro", kar:"Pro", sehir:"Pro",
  // Elit'e özel aktif
  cennet:"Elit", col:"Elit", ates:"Elit",
  // HARD_LOCKED_CATEGORIES — lansmanda hiç aktif değil, V2/V3 rozetiyle tamamen tıklanamaz
  cami:"V3", desen:"V3", gol:"V3", bulut:"V3", yuklenenler:"V3",
  ari:"V2", cehennem:"V3", hurma:"V3", karinca:"V3",
};

// Şablon görseller, dosyanın sonunda MOTION_CLIPS posterlarından türetilir (gerçek Pexels fotoğrafları).
export const TEMPLATE_CLIPS_PLACEHOLDER = true;

// ─── URL jeneratörler ─────────────────────────────────
const pv = (id: number, fps = 30) =>
  `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_${fps}fps.mp4`;
const uv = (id: number, fps = 30) =>
  `https://videos.pexels.com/video-files/${id}/${id}-uhd_3840_2160_${fps}fps.mp4`;
const thumb = (id: number) =>
  `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200`;

// ─── Clip builder ─────────────────────────────────────
// [pexelsId, fps, isUhd, label]
type Row = [number, number, boolean, string];

const cat = (catId: CatId, rows: Row[]): Clip[] =>
  rows.map(([id, fps, uhd, label], i) => ({
    id: `${catId}-${i + 1}`,
    label,
    cat: catId,
    kind: "vid" as const,
    src: uhd ? uv(id, fps) : pv(id, fps),
    poster: thumb(id),
    pexelsId: id,
    // ★ R2'de varsa kendi sunucundan gelir; kart/render otomatik dener
    r2: `${R2_BASE}/videos/${catId}/${id}.mp4`,
    r2Poster: `${R2_BASE}/posters/${catId}/${id}.jpg`,
  }));

// ════════════════════════════════════════════════════════
// VİDEO HAVUZLARI
// Format: [pexelsId, fps, isUhd, "Açıklama"]
// ════════════════════════════════════════════════════════

const NAMAZ_DATA: Row[] = [
  [35110882,60,true,"Kâbe Havadan 4K I"],
  [35110822,60,true,"Kâbe Havadan 4K II"],
  [35110842,60,true,"Hac Tavaf 4K"],
  [35110879,60,true,"Kâbe Yakın 4K"],
  [35110833,60,true,"Mescid-i Haram"],
  [35098709,60,true,"Mescid-i Haram İçi"],
  [35098707,60,true,"Haram Havadan"],
  [36129822,30,false,"Haram Geniş"],
  [35743721,30,false,"Haram Gece"],
  [38255868,60,true,"Hac Tavaf II"],
  [13643568,24,true,"Kur'an ve Tesbih"],
  [13643582,24,true,"Kur'an Ahşap Tesbih"],
  [13643567,24,true,"Mushaf Sayfa Makro"],
  [13643571,24,true,"Kur'an Siyah Tesbih"],
  [13643577,24,true,"Kur'an Boncuklar"],
  [8165476,25,true,"Açık Mushaf 4K"],
  [8165780,25,true,"Mushaf Detayı"],
  [4243571,30,false,"Kur'an Tilavet"],
  [9015573,30,false,"Seccadede Kur'an"],
  [34041443,30,true,"Altın Kubbeli Cami"],
  [35619112,30,true,"İslam Mimarisi"],
  [36223422,25,true,"İstanbul Minareleri"],
  [34127022,50,true,"Cami Kubbe Alacakaranlık"],
  [31802391,60,true,"Sultanahmet Drone"],
  [36192726,60,true,"Osmanlı Kubbe Tavanı"],
  [37662251,59,true,"Avizeli Cami İçi"],
  [37646178,30,false,"Hat Yazılı Kubbe"],
  [15816542,30,true,"Putra Camii Malezya"],
  [38530728,30,true,"Ayasofya Işığı"],
  [8165466,25,true,"Tavan Sanatı"],
  [35082008,30,false,"Modern Cami"],
  [35081870,30,false,"Şık Cami İçi"],
  [34799745,30,false,"Cami Minareler"],
  [6576070,30,true,"Cami Drone"],
  [10023682,30,true,"Asılı Fenerler"],
  [35222108,24,true,"Gece Fenerler"],
  [30567547,30,true,"Muhteşem Avize"],
  [30209847,30,false,"Süleymaniye"],
  [12302081,30,false,"Boğaz Cami"],
  [20349623,60,true,"Mavi Cami"],
  [33830905,30,false,"Altın İslami Tünel"],
  [25798722,24,false,"Geometrik Nur"],
  [12546959,60,false,"Işık Hüzmeleri"],
  [35728942,30,false,"Zerre Işıltısı"],
  [29918667,30,false,"Altın Zerreler"],
  [1730397,25,false,"Renkli Bokeh"],
  [34645311,30,true,"İpek Işık"],
  [11354070,60,false,"Nur Tüneli"],
  [38556266,24,false,"Sakin Animasyon"],
  [18442968,60,false,"Işık Çizgileri"],
];

const MUSAF_DATA: Row[] = [
  [13643568,24,true,"Kur'an Tesbih I"],[13643582,24,true,"Kur'an Tesbih II"],
  [13643567,24,true,"Mushaf Sayfa I"],[13643571,24,true,"Mushaf Sayfa II"],
  [13643577,24,true,"Kur'an Boncuklar"],[8165476,25,true,"Açık Mushaf 4K"],
  [8165780,25,true,"Mushaf Detay"],[4243571,30,false,"Kur'an Tilavet"],
  [9015573,30,false,"Seccade Kur'an"],[33830905,30,false,"Altın Tünel"],
  [25798722,24,false,"Geometrik Nur"],[34645505,30,false,"3D Altın"],
  [29918667,30,false,"Altın Zerreler"],[34549010,30,false,"Altın Bokeh"],
  [38556266,24,false,"Sakin Döngü"],[12546959,60,false,"Hüzmeler"],
  [33997984,60,false,"Mandala"],[34645311,30,true,"İpek Işık"],
  [35728942,30,false,"Parıltı"],[18442968,60,false,"Işık Çizgi"],
  [11354070,60,false,"Nur Tüneli"],[35222108,24,true,"Kandiller"],
  [1730397,25,false,"Bokeh Renkli"],[36192726,60,true,"Osmanlı Kubbe"],
  [37662251,59,true,"Avizeli Cami"],[30567547,30,true,"Avize Cami"],
  [8165466,25,true,"Tavan Motif"],[38530728,30,true,"Ayasofya"],
  [37646178,30,false,"Hat Kubbe"],[15816542,30,true,"Putra Cami"],
  [34041443,30,true,"Altın Kubbe"],[35619112,30,true,"İslam Mim."],
  [36223422,25,true,"Minareler"],[34127022,50,true,"Kubbe Gece"],
  [34799745,30,false,"Minareler II"],[35082008,30,false,"Modern Cami"],
  [35081870,30,false,"Şık İçi"],[6576070,30,true,"Drone Cami"],
  [31802391,60,true,"Sultanahmet"],[20349623,60,true,"Mavi Cami"],
  [30209847,30,false,"Süleymaniye"],[17991656,30,false,"İstanbul Gece"],
  [16224290,30,true,"Boğaz Şehir"],[38031807,50,true,"Galata Köprüsü"],
  [12302081,30,false,"Boğaz Geçiş"],[35110882,60,true,"Kâbe Gece"],
  [35110822,60,true,"Kâbe Genel"],[35098709,60,true,"Haram İçi"],
  [36129822,30,false,"Haram Geniş"],[35743721,30,false,"Haram Gece"],
];

const CICEKLER_DATA: Row[] = [
  [7934058,30,false,"Kırmızı Gül Tarlası"],[16457006,30,true,"Renkli Laleler"],
  [852430,25,false,"Lale Tarlası"],[32005870,25,false,"Kırmızı Sarı Lale"],
  [31601973,30,true,"Bahar Lale 4K"],[31828649,24,true,"Botanik Bahçe"],
  [856152,30,false,"Çiçek Tarlası"],[4321750,25,true,"Çiçek Atmosfer"],
  [38462325,25,false,"Güneşli Laleler"],[31936102,24,true,"İstanbul Laleler"],
  [9196256,25,true,"Gül Yaprak Makro"],[4754481,24,false,"Kırmızı Çiçek"],
  [855976,25,false,"Açan Kırmızı Gül"],[4184106,25,false,"Yağmur Damlalı Gül"],
  [10586800,30,false,"Gül Filizi"],[37100531,50,true,"Papatya 4K"],
  [1494279,24,false,"Gül Bahçesi"],[36834092,25,true,"Kiraz Çiçeği"],
  [15363929,30,true,"Renkli Çiçek Pan."],[8012363,30,true,"Bahar Parkı"],
  [27523243,24,false,"Turuncu Çiçek"],[1689827,24,false,"Gül Serası"],
  [12709029,60,true,"Güle Yakınlaş"],[7174859,30,true,"Arı Kovanı"],
  [10082786,30,false,"Bal Arıları"],[12142327,24,true,"Kovan Makro"],
  [9806340,30,false,"Arı Sürüsü"],[7844265,24,false,"Uçan Arı"],
  [36834095,25,true,"Kiraz Çiçeği II"],[27775202,25,false,"Orman Çiçeği"],
  [18209572,30,true,"Güneş Orman 4K"],[27921683,30,true,"Yaprak Güneş"],
  [6206933,25,false,"Doğa Görüntüsü"],[7645660,30,false,"Orman Zemini"],
  [6249996,25,false,"Yaprak Yakın"],[11265968,25,false,"Orman Işığı"],
  [38518979,50,true,"Yeşil Ağaç 4K"],[5899473,30,false,"Güneş Işını"],
  [27065367,24,true,"Ağaç Güneş 4K"],[3150369,25,true,"Orman Süzme 4K"],
  [6962828,30,true,"Ormanda Şelale"],[7177786,24,false,"Orman Dere"],
  [855143,25,false,"Şelale Kaskad"],[5080650,30,false,"Orman Nehri"],
  [36657220,24,true,"Orman Deresi 4K"],[36352166,30,true,"Yeşil Şelale"],
  [4534186,25,true,"Şelale Doğa"],[5803340,30,false,"Şelale Görüntü"],
  [2680346,30,false,"Sisli Ağaçlar"],[5710740,25,false,"Orman Işık"],
];

const YILDIZLAR_DATA: Row[] = [
  [15289793,60,false,"Renkli Uzay"],[34053971,30,false,"Nebula I"],
  [34053541,30,false,"Nebula II"],[34054569,30,false,"Nebula Timelapse"],
  [3194277,30,false,"Dış Uzay"],[34075476,24,true,"Renkli Nebula 4K"],
  [34054307,30,false,"Yıldız Bulutu"],[36747759,30,false,"Işıldayan Nebula"],
  [30442061,30,false,"Galaktik Nebula"],[3222269,24,false,"Kuzey Işıkları"],
  [14947495,30,false,"Aurora Göl"],[20601649,25,false,"Güney Aurora"],
  [28180439,30,true,"Galaksi Gece"],[17808869,30,true,"Samanyolu Göl"],
  [27394420,24,false,"Ay Yıldız Gece"],[27442169,24,true,"Macellan Bulutu"],
  [6867012,24,false,"Kayan Yıldız"],[16544208,24,false,"Orman Yıldız"],
  [1309051,24,false,"Gece Yıldız"],[29994297,30,true,"Tarantula Nebula"],
  [31084223,25,true,"Derin Uzay 4K"],[36748811,30,false,"Canlı Uzay"],
  [36755080,30,false,"Orion Bulutsusu"],[27775202,25,false,"Samanyolu"],
  [27700964,10,false,"Gece Galaksi"],[34567729,30,false,"Mor Pembe Dalgalar"],
  [30050720,30,false,"Parçacık Dalgaları"],[5561376,25,false,"Dijital Soyut"],
  [34551087,30,false,"Animasyon Dalga"],[10296170,25,false,"Altın Parıltı"],
  [34128867,30,true,"Bokeh 4K"],[4218117,25,false,"Bokeh Işık"],
  [33785528,60,false,"Kaleydoskop Altın"],[33785521,60,false,"Geometrik Zümrüt"],
  [33830905,30,false,"Altın Tünel"],[25798722,24,false,"CG Geometrik"],
  [34645505,30,false,"3D Soyut"],[11354070,60,false,"Futuristik Tünel"],
  [29918667,30,false,"Parçacık"],[34549010,30,false,"Altın Bokeh"],
  [38556266,24,false,"Sakin Animasyon"],[19759482,24,false,"Sıcak CG"],
  [12546959,60,false,"Işık Hüzme"],[33997984,60,false,"Mandala"],
  [856813,30,false,"Kaleydoskop"],[34645311,30,true,"Ambiyans 4K"],
  [35728942,30,false,"Parıltı"],[1730397,25,false,"Bokeh Renkli"],
  [18442968,60,false,"Işık Çizgi"],[29918667,30,false,"Zerreler"],
];

const DENIZ_DATA: Row[] = [
  [6981297,25,false,"Bali Dalgalar"],[7618009,25,true,"Plaj Havadan"],
  [4380614,30,true,"Deniz Doğa"],[5718339,30,false,"Mavi Su"],
  [5968292,24,false,"Sahil Havadan"],[6624689,25,true,"Dalgalar Kıyı"],
  [5982833,24,false,"Berrak Dalgalar"],[4183071,30,true,"Kumsal Havadan"],
  [7478080,30,true,"Avustralya Deniz"],[5396111,30,true,"Turkuaz Okyanus"],
  [5288655,25,false,"Mavi Okyanus"],[26310139,30,false,"Günbatımı Dalga"],
  [3179024,25,false,"Su Hareketi"],[6047732,30,false,"Akşam Dalgaları"],
  [11029302,30,false,"Yavaş Dalga"],[856421,30,false,"Dalgalar"],
  [854632,25,false,"Sakin Deniz"],[15546398,25,true,"Kayıp Ada"],
  [15776594,30,true,"Resif Sular"],[15546563,25,true,"Balina Ana Yavru"],
  [10377082,30,false,"Su Altı Balina"],[17740953,60,true,"Mercan Balıklar"],
  [10311923,30,false,"Kaplumbağa"],[36379838,60,true,"Mercan Havadan"],
  [27998641,25,true,"Tropik Kumsal"],[10377084,30,false,"Büyük Balık"],
  [28097890,30,true,"Balina Ailesi"],[26245637,60,true,"Balina Geçiş"],
  [6510690,30,false,"Balina Köpekbalığı"],[5607993,30,false,"Katil Balinalar"],
  [10377449,30,false,"Dev Balık"],[31454287,25,false,"Mercan Drone"],
  [26310141,30,false,"Kayalık Günbatımı"],[32792492,24,false,"Kaya Kıyı Dalga"],
  [4093395,29,false,"Güneşli Plaj"],[7559677,24,true,"Sörf Plaj"],
  [5396111,30,true,"Turkuaz II"],[7478080,30,true,"Avustralya II"],
  [6624689,25,true,"Dalgalar II"],[5718339,30,false,"Mavi Su II"],
  [5288655,25,false,"Okyanus II"],[4183071,30,true,"Havadan II"],
  [11029302,30,false,"Yavaş II"],[856421,30,false,"Dalga II"],
  [854632,25,false,"Sakin II"],[6047732,30,false,"Akşam II"],
  [3179024,25,false,"Su II"],[26310139,30,false,"Günbatımı II"],
  [5968292,24,false,"Sahil II"],[5982833,24,false,"Berrak II"],
];

const GUNBATIMI_DATA: Row[] = [
  [11806938,25,false,"Bulut Günbatımı"],[10221670,30,true,"Bulutlu 4K"],
  [13667758,30,true,"Timelapse 4K"],[4364527,24,false,"Güzel Günbatımı"],
  [4110700,30,true,"Timelapse 4K II"],[6052121,30,false,"Manzara"],
  [4364528,24,false,"Dramatik"],[29521019,60,true,"Okyanus 4K"],
  [33916737,24,true,"Altın 4K"],[30233251,60,false,"Dramatik Bulut"],
  [6279022,24,true,"Kızıl Timelapse"],[855946,30,true,"Batan Güneş"],
  [4607304,25,true,"Bulut 4K"],[5683621,30,false,"Ufuk"],
  [36347310,50,false,"Ağaç Günbatımı"],[36298494,50,false,"Silüet"],
  [3973660,24,false,"Huzurlu"],[4422123,25,false,"Zaman Akış"],
  [26310139,30,false,"Okyanus Dalga"],[6052121,30,false,"Gökyüzü II"],
  [11806938,25,false,"Bulut II"],[10221670,30,true,"Bulutlu II"],
  [13667758,30,true,"Timelapse II"],[4364527,24,false,"Altın Saat"],
  [4110700,30,true,"Timelapse III"],[29521019,60,true,"Plaj Dramatik"],
  [33916737,24,true,"Altın II"],[30233251,60,false,"Karanlık Bulut"],
  [6279022,24,true,"Kızıl II"],[855946,30,true,"Güneş II"],
  [4607304,25,true,"Bulut III"],[5683621,30,false,"Ufuk II"],
  [36347310,50,false,"Ağaç II"],[36298494,50,false,"Silüet II"],
  [3973660,24,false,"Huzur II"],[4422123,25,false,"Akış II"],
  [4364528,24,false,"Dramatik II"],[6052121,30,false,"Gökyüzü III"],
  [11806938,25,false,"Bulut IV"],[10221670,30,true,"Bulutlu IV"],
  [13667758,30,true,"Timelapse IV"],[4364527,24,false,"Saat III"],
  [4110700,30,true,"Timelapse V"],[29521019,60,true,"Plaj III"],
  [33916737,24,true,"Altın III"],[30233251,60,false,"Bulut III"],
  [6279022,24,true,"Kızıl III"],[855946,30,true,"Güneş III"],
  [4607304,25,true,"Bulut V"],[5683621,30,false,"Ufuk III"],
];

const GECE_DATA: Row[] = [
  [3222269,24,false,"Kuzey Işıkları"],[14947495,30,false,"Aurora Göl"],
  [20601649,25,false,"Güney Aurora"],[28180439,30,true,"Galaksi Gece"],
  [17808869,30,true,"Samanyolu Göl"],[6867012,24,false,"Kayan Yıldız"],
  [16544208,24,false,"Orman Yıldız"],[27394420,24,false,"Ay Yıldız"],
  [1309051,24,false,"Gece Manzara"],[27700964,10,false,"Samanyolu"],
  [31084223,25,true,"Nebula 4K"],[34075476,24,true,"Kozmik Renk"],
  [1730397,25,false,"Bokeh Gece"],[29992735,24,true,"Yağmur Bokeh"],
  [35728942,30,false,"Altın Parçacık"],[34645311,30,true,"Ambiyans"],
  [29918667,30,false,"Parçacık Anim."],[35222108,24,true,"Kırmızı Fener"],
  [30209847,30,false,"Cami Günbatımı"],[17991656,30,false,"İstanbul Gece"],
  [3222269,24,false,"Aurora II"],[14947495,30,false,"Aurora Göl II"],
  [20601649,25,false,"Güney II"],[28180439,30,true,"Galaksi II"],
  [17808869,30,true,"Samanyolu II"],[6867012,24,false,"Yıldız II"],
  [16544208,24,false,"Orman II"],[27394420,24,false,"Ay II"],
  [27442169,24,true,"Macellan"],[36748811,30,false,"Derin Uzay"],
  [36755080,30,false,"Orion"],[29994297,30,true,"Tarantula"],
  [34053971,30,false,"Nebula I"],[34053541,30,false,"Nebula II"],
  [34054569,30,false,"Nebula III"],[34054307,30,false,"Nebula IV"],
  [36747759,30,false,"Nebula V"],[30442061,30,false,"Galaktik"],
  [15289793,60,false,"Renkli Uzay"],[31084223,25,true,"Nebula 4K"],
  [34075476,24,true,"Renkli 4K"],[3194277,30,false,"Kozmik"],
  [3222269,24,false,"Aurora III"],[14947495,30,false,"Aurora III"],
  [20601649,25,false,"Aurora IV"],[28180439,30,true,"Galaksi III"],
  [17808869,30,true,"Samanyolu III"],[6867012,24,false,"Yıldız III"],
  [16544208,24,false,"Orman III"],[27394420,24,false,"Ay III"],
  [29918667,30,false,"Zerreler Gece"],[34645311,30,true,"Ambiyans II"],
];

const SELALE_DATA: Row[] = [
  [7220614,30,true,"Akan Nehir 4K"],[14890656,60,true,"Kayalık Şelale"],
  [10706309,30,false,"Yosunlu Akarsu"],[6173562,24,false,"Kaya Su"],
  [9980505,30,true,"Şelale II 4K"],[5499806,30,false,"Akan Şelale"],
  [10377355,30,true,"Yakın Şelale"],[8468523,30,true,"Çağlayan 4K"],
  [6049869,30,true,"Alp Akarsuyu"],[17578858,30,true,"Orman Şelale"],
  [7177786,24,false,"Dere Yeşil"],[6962828,30,true,"Ormanda Şelale"],
  [855143,25,false,"Kaskad"],[12481758,30,true,"Duden Şelale"],
  [4534186,25,true,"Şelale Doğa"],[5803340,30,false,"Şelale Görüntü"],
  [36352166,30,true,"Yeşil Şelale"],[36657220,24,true,"Orman Deresi"],
  [5080650,30,false,"Orman Nehri"],[3784399,24,false,"Üstten Orman"],
  [7220614,30,true,"Nehir II"],[14890656,60,true,"Kayalık II"],
  [9980505,30,true,"Şelale III"],[8468523,30,true,"Çağlayan II"],
  [10377355,30,true,"Yakın II"],[5499806,30,false,"Şelale II"],
  [6173562,24,false,"Kaya II"],[6049869,30,true,"Alp II"],
  [17578858,30,true,"Orman II"],[855143,25,false,"Kaskad II"],
  [12481758,30,true,"Duden II"],[4534186,25,true,"Doğa II"],
  [7177786,24,false,"Dere II"],[6962828,30,true,"Şelale II"],
  [5080650,30,false,"Nehri II"],[36352166,30,true,"Yeşil II"],
  [36657220,24,true,"Dere II"],[3784399,24,false,"Üstten II"],
  [7220614,30,true,"Nehir III"],[14890656,60,true,"Kayalık III"],
  [9980505,30,true,"Şelale IV"],[8468523,30,true,"Çağlayan III"],
  [10377355,30,true,"Yakın III"],[5499806,30,false,"Akan III"],
  [6173562,24,false,"Kaya III"],[6049869,30,true,"Alp III"],
  [17578858,30,true,"Orman III"],[855143,25,false,"Kaskad III"],
  [12481758,30,true,"Duden III"],[4534186,25,true,"Doğa III"],
];

const ORMAN_DATA: Row[] = [
  [18209572,30,true,"Güneş Orman 4K"],[27921683,30,true,"Yaprak Güneş"],
  [6206933,25,false,"Doğa Görüntü"],[7645660,30,false,"Orman Zemin"],
  [6249996,25,false,"Yaprak Yakın"],[11265968,25,false,"Orman Işık"],
  [38518979,50,true,"Yeşil Ağaç 4K"],[5899473,30,false,"Güneş Işın"],
  [27065367,24,true,"Ağaç Güneş"],[3150369,25,true,"Güneş Süz 4K"],
  [16457006,30,true,"Orman Panorama"],[5710740,25,false,"Orman Işık II"],
  [6049869,30,true,"Orman Deresi"],[17578858,30,true,"Gizli Şelale"],
  [7220614,30,true,"Pınar 4K"],[2959161,30,false,"Tavşan Doğa"],
  [18034825,30,false,"Vahşi Tavşan"],[7375562,30,true,"Yavru Hayvan"],
  [13832799,30,true,"Orman Hayvan"],[31830300,24,false,"Sevimli Hayvan"],
  [8012363,30,true,"Park Orman"],[4321750,25,true,"Doğa Atmosfer"],
  [856152,30,false,"Çiçekli Tarlası"],[18209572,30,true,"Güneş II"],
  [27921683,30,true,"Yaprak II"],[6206933,25,false,"Doğa II"],
  [7645660,30,false,"Zemin II"],[6249996,25,false,"Yaprak II"],
  [11265968,25,false,"Orman II"],[38518979,50,true,"Yeşil II"],
  [5899473,30,false,"Işın II"],[27065367,24,true,"Ağaç II"],
  [3150369,25,true,"Süz II"],[16457006,30,true,"Panorama II"],
  [5710740,25,false,"Işık II"],[6049869,30,true,"Dere II"],
  [17578858,30,true,"Şelale II"],[7220614,30,true,"Pınar II"],
  [2959161,30,false,"Tavşan II"],[18034825,30,false,"Vahşi II"],
  [7375562,30,true,"Yavru II"],[13832799,30,true,"Hayvan II"],
  [31830300,24,false,"Sevimli II"],[8012363,30,true,"Park II"],
  [4321750,25,true,"Atmosfer II"],[856152,30,false,"Çiçek II"],
  [18209572,30,true,"Güneş III"],[27921683,30,true,"Yaprak III"],
  [6206933,25,false,"Doğa III"],[7645660,30,false,"Zemin III"],
];

const COL_DATA: Row[] = [
  [4797157,24,true,"Çöl Deve 4K"],[2055060,25,false,"Deve Kervanı"],
  [33273198,30,true,"Kum Tepeleri"],[19069013,30,false,"Çöl Akşamı"],
  [7518067,25,false,"Develer Saha"],[27322340,50,true,"Çöl Günbatımı"],
  [15405842,50,false,"Deve Sahil I"],[15405840,50,false,"Deve Sahil II"],
  [12119036,50,false,"Deve Yürüyüş"],[10229375,30,false,"Ateş Kıvılcım"],
  [6900893,30,false,"Kamp Ateşi"],[4777136,24,false,"Yanan Odun"],
  [8371512,24,true,"Kor 4K"],[5596915,24,true,"Karanlık Ateş"],
  [34210241,24,true,"Gece Ateş 4K"],[28802354,30,true,"Alev Dans 4K"],
  [5155376,25,true,"Kıvılcım 4K"],[30669823,30,true,"Doğal Ateş"],
  [4797157,24,true,"Deve II"],[2055060,25,false,"Kervan II"],
  [33273198,30,true,"Kum II"],[19069013,30,false,"Akşam II"],
  [7518067,25,false,"Deve III"],[27322340,50,true,"Günbatımı II"],
  [15405842,50,false,"Sahil III"],[15405840,50,false,"Sahil IV"],
  [12119036,50,false,"Yürüyüş II"],[10229375,30,false,"Kıvılcım II"],
  [6900893,30,false,"Ateş II"],[4777136,24,false,"Odun II"],
  [8371512,24,true,"Köz II"],[5596915,24,true,"Ateş III"],
  [34210241,24,true,"Gece II"],[28802354,30,true,"Alev II"],
  [5155376,25,true,"Kıvılcım III"],[30669823,30,true,"Ateş IV"],
  [4797157,24,true,"Deve IV"],[2055060,25,false,"Kervan III"],
  [33273198,30,true,"Kum III"],[19069013,30,false,"Çöl III"],
  [7518067,25,false,"Deve V"],[27322340,50,true,"Gün III"],
  [10229375,30,false,"Kıvılcım IV"],[6900893,30,false,"Ateş V"],
  [4777136,24,false,"Odun III"],[8371512,24,true,"Köz III"],
  [5596915,24,true,"Ateş VI"],[34210241,24,true,"Gece III"],
  [28802354,30,true,"Alev III"],[30669823,30,true,"Ateş VII"],
];

const KAR_DATA: Row[] = [
  [19493781,30,true,"Karlı Orman 4K"],[6415282,25,false,"Kar Yağışı"],
  [6620469,25,true,"Düşen Kar 4K"],[1856985,25,false,"Kar"],
  [19493974,30,true,"Kış Kar 4K"],[19642514,30,true,"Karlı Orman"],
  [6620812,25,true,"Fırtına 4K"],[6527134,25,false,"Yağan Kar"],
  [6608551,25,false,"Zerre Kar"],[4763085,24,true,"Karlı Zirve"],
  [2474616,24,true,"Buz Dağı"],[35655933,60,true,"Alp Gün Doğumu"],
  [7592624,30,true,"Yüksek Dağ"],[19946229,30,false,"Kar Vadisi"],
  [34956048,60,true,"Bolivya Zirve"],[11287025,24,true,"Karlı Orman Drone"],
  [20395853,30,true,"Kar Fırtına Tepe"],[19872710,60,true,"Fitz Roy"],
  [35400881,30,true,"Karlı Dağ Yol"],[30855215,25,false,"Çam Kar"],
  [19493013,30,true,"Yoğun Kar 4K"],[20663724,24,true,"Karlı Çam"],
  [30181650,24,false,"Sakin Orman"],[36276474,50,true,"Karlı Kayak"],
  [8761038,30,true,"Altay Kış"],[35325909,60,false,"Karlı Havadan"],
  [36633320,30,true,"Karlı Dağ 4K"],[19493781,30,true,"Karlı II"],
  [6415282,25,false,"Kar II"],[6620469,25,true,"Düşen II"],
  [1856985,25,false,"Kar II"],[19493974,30,true,"Kış II"],
  [19642514,30,true,"Orman II"],[6620812,25,true,"Fırtına II"],
  [6527134,25,false,"Yağan II"],[6608551,25,false,"Zerre II"],
  [4763085,24,true,"Zirve II"],[2474616,24,true,"Buz II"],
  [35655933,60,true,"Alp II"],[7592624,30,true,"Dağ II"],
  [19946229,30,false,"Vadi II"],[34956048,60,true,"Bolivya II"],
  [11287025,24,true,"Drone II"],[20395853,30,true,"Tepe II"],
  [19872710,60,true,"Fitz Roy II"],[35400881,30,true,"Yol II"],
  [30855215,25,false,"Çam II"],[19493013,30,true,"Kar III"],
  [20663724,24,true,"Çam III"],[30181650,24,false,"Orman III"],
];

const SEHIR_DATA: Row[] = [
  [34432938,24,true,"İstanbul Cami"],[36330770,30,true,"İstanbul Silüet"],
  [16224290,30,true,"Boğaz Şehir"],[38031807,50,true,"Galata Köprüsü"],
  [30209847,30,false,"Süleymaniye"],[31802391,60,true,"Sultanahmet"],
  [12302081,30,false,"Boğaz"],[20349623,60,true,"Mavi Cami"],
  [17991656,30,false,"İstanbul Gece"],[10023682,30,true,"Asılı Fener"],
  [35222108,24,true,"Gece Fener"],[34432938,24,true,"İstanbul II"],
  [36330770,30,true,"Silüet II"],[16224290,30,true,"Boğaz II"],
  [38031807,50,true,"Galata II"],[30209847,30,false,"Süleymaniye II"],
  [31802391,60,true,"Sultanahmet II"],[12302081,30,false,"Boğaz III"],
  [20349623,60,true,"Mavi II"],[17991656,30,false,"Gece II"],
  [10023682,30,true,"Fener II"],[35222108,24,true,"Gece II"],
  [34432938,24,true,"İstanbul III"],[36330770,30,true,"Silüet III"],
  [16224290,30,true,"Boğaz IV"],[38031807,50,true,"Galata III"],
  [30209847,30,false,"Süleymaniye III"],[31802391,60,true,"Sultanahmet III"],
  [12302081,30,false,"Boğaz V"],[20349623,60,true,"Mavi III"],
  [17991656,30,false,"Gece III"],[10023682,30,true,"Fener III"],
  [35222108,24,true,"Fener IV"],[34432938,24,true,"İstanbul IV"],
  [36330770,30,true,"Silüet IV"],[16224290,30,true,"Boğaz VI"],
  [38031807,50,true,"Galata IV"],[30209847,30,false,"Süleymaniye IV"],
  [31802391,60,true,"Sultanahmet IV"],[12302081,30,false,"Boğaz VII"],
  [20349623,60,true,"Mavi IV"],[17991656,30,false,"Gece IV"],
  [10023682,30,true,"Fener V"],[35222108,24,true,"Fener V"],
  [34432938,24,true,"İstanbul V"],[36330770,30,true,"Silüet V"],
  [16224290,30,true,"Boğaz VIII"],[38031807,50,true,"Galata V"],
  [30209847,30,false,"Süleymaniye V"],[31802391,60,true,"Sultanahmet V"],
  [12302081,30,false,"Boğaz IX"],[20349623,60,true,"Mavi V"],
];

const CAMI_DATA: Row[] = [
  [35110882,60,true,"Kâbe I"],[35110822,60,true,"Kâbe II"],
  [35098709,60,true,"Haram İçi"],[35098707,60,true,"Haram Havadan"],
  [36129822,30,false,"Haram Geniş"],[35743721,30,false,"Haram Gece"],
  [34041443,30,true,"Altın Kubbe"],[35619112,30,true,"İslam Mim."],
  [36223422,25,true,"Minareler"],[34127022,50,true,"Kubbe Alac."],
  [31802391,60,true,"Sultanahmet"],[36192726,60,true,"Osmanlı Kubbe"],
  [37662251,59,true,"Avizeli Cami"],[37646178,30,false,"Hat Kubbe"],
  [15816542,30,true,"Putra Malezya"],[38530728,30,true,"Ayasofya"],
  [8165466,25,true,"Tavan Sanat"],[35082008,30,false,"Modern Cami"],
  [35081870,30,false,"Şık İçi"],[34799745,30,false,"Minareler II"],
  [35110882,60,true,"Kâbe III"],[35110822,60,true,"Kâbe IV"],
  [35098709,60,true,"Haram II"],[35098707,60,true,"Haram II"],
  [36129822,30,false,"Haram II"],[35743721,30,false,"Haram II"],
  [34041443,30,true,"Kubbe II"],[35619112,30,true,"Mim. II"],
  [36223422,25,true,"Minare II"],[34127022,50,true,"Alac. II"],
  [36192726,60,true,"Osmanlı II"],[37662251,59,true,"Avize II"],
  [37646178,30,false,"Hat II"],[15816542,30,true,"Malezya II"],
  [38530728,30,true,"Ayasofya II"],[8165466,25,true,"Tavan II"],
  [35082008,30,false,"Modern II"],[35081870,30,false,"İçi II"],
  [34799745,30,false,"Minare III"],[31802391,60,true,"Sultan. II"],
  [35110882,60,true,"Kâbe V"],[35110822,60,true,"Kâbe VI"],
  [35098709,60,true,"Haram III"],[35098707,60,true,"Haram III"],
  [36129822,30,false,"Haram III"],[34041443,30,true,"Kubbe III"],
  [35619112,30,true,"Mim. III"],[36223422,25,true,"Minare III"],
  [34127022,50,true,"Alac. III"],[36192726,60,true,"Osmanlı III"],
];

const DESEN_DATA: Row[] = [
  [33785528,60,false,"Kaleydoskop"],[33785521,60,false,"Zümrüt"],
  [33830905,30,false,"Altın Tünel"],[25798722,24,false,"CG Geometrik"],
  [34645505,30,false,"3D Soyut"],[11354070,60,false,"Futuristik"],
  [29918667,30,false,"Parçacık"],[34549010,30,false,"Altın Bokeh"],
  [38556266,24,false,"Sakin Anim."],[19759482,24,false,"Sıcak CG"],
  [12546959,60,false,"Hüzme"],[33997984,60,false,"Mandala"],
  [856813,30,false,"Kaleydoskop II"],[34645311,30,true,"Ambiyans"],
  [35728942,30,false,"Parıltı"],[34567729,30,false,"Mor Pembe"],
  [30050720,30,false,"Parçacık II"],[5561376,25,false,"Dijital Soyut"],
  [34551087,30,false,"Anim. III"],[10296170,25,false,"Altın Su"],
  [34128867,30,true,"Bokeh 4K"],[4218117,25,false,"Bokeh II"],
  [33785528,60,false,"Kaleydoskop III"],[33785521,60,false,"Zümrüt II"],
  [33830905,30,false,"Tünel II"],[25798722,24,false,"CG II"],
  [34645505,30,false,"3D II"],[11354070,60,false,"Futurist II"],
  [34549010,30,false,"Bokeh III"],[38556266,24,false,"Anim. II"],
  [12546959,60,false,"Hüzme II"],[33997984,60,false,"Mandala II"],
  [856813,30,false,"Kaleydoskop IV"],[34645311,30,true,"Ambiyans II"],
  [35728942,30,false,"Parıltı II"],[34567729,30,false,"Mor II"],
  [30050720,30,false,"Parçacık III"],[5561376,25,false,"Dijital II"],
  [34551087,30,false,"Anim. IV"],[10296170,25,false,"Su II"],
  [34128867,30,true,"Bokeh II"],[4218117,25,false,"Bokeh IV"],
  [33785528,60,false,"Kaleydoskop V"],[33785521,60,false,"Zümrüt III"],
  [33830905,30,false,"Tünel III"],[25798722,24,false,"CG III"],
  [34645505,30,false,"3D III"],[11354070,60,false,"Futurist III"],
  [34549010,30,false,"Bokeh V"],[38556266,24,false,"Anim. V"],
];

const GOL_DATA: Row[] = [
  [854632,25,false,"Sakin Deniz"],[3179024,25,false,"Su Hareketi"],
  [5288655,25,false,"Mavi Okyanus"],[6047732,30,false,"Akşam Deniz"],
  [15776594,30,true,"Resif 4K"],[17808869,30,true,"Samanyolu Göl"],
  [6279022,24,true,"Timelapse"],[7220614,30,true,"Nehir 4K"],
  [10377355,30,true,"Şelale 4K"],[8468523,30,true,"Çağlayan 4K"],
  [7478080,30,true,"Deniz 4K"],[5396111,30,true,"Turkuaz"],
  [854632,25,false,"Sakin II"],[3179024,25,false,"Su II"],
  [5288655,25,false,"Mavi II"],[6047732,30,false,"Akşam II"],
  [15776594,30,true,"Resif II"],[17808869,30,true,"Göl II"],
  [6279022,24,true,"Timelapse II"],[7220614,30,true,"Nehir II"],
  [10377355,30,true,"Şelale II"],[8468523,30,true,"Çağlayan II"],
  [7478080,30,true,"Deniz II"],[5396111,30,true,"Turkuaz II"],
  [854632,25,false,"Sakin III"],[3179024,25,false,"Su III"],
  [5288655,25,false,"Mavi III"],[6047732,30,false,"Akşam III"],
  [15776594,30,true,"Resif III"],[17808869,30,true,"Göl III"],
  [6279022,24,true,"Timelapse III"],[7220614,30,true,"Nehir III"],
  [10377355,30,true,"Şelale III"],[8468523,30,true,"Çağlayan III"],
  [7478080,30,true,"Deniz III"],[5396111,30,true,"Turkuaz III"],
  [854632,25,false,"Sakin IV"],[3179024,25,false,"Su IV"],
  [5288655,25,false,"Mavi IV"],[6047732,30,false,"Akşam IV"],
  [15776594,30,true,"Resif IV"],[17808869,30,true,"Göl IV"],
  [6279022,24,true,"Timelapse IV"],[7220614,30,true,"Nehir IV"],
  [10377355,30,true,"Şelale IV"],[8468523,30,true,"Çağlayan IV"],
  [7478080,30,true,"Deniz IV"],[5396111,30,true,"Turkuaz IV"],
  [854632,25,false,"Sakin V"],[3179024,25,false,"Su V"],
];

const BULUT_DATA: Row[] = [
  [11806938,25,false,"Bulut Günbatımı"],[10221670,30,true,"Bulutlu 4K"],
  [13667758,30,true,"Timelapse 4K"],[4110700,30,true,"Sunset 4K"],
  [11519743,50,false,"Gökyüzü"],[14309781,30,false,"Bulutlar"],
  [33227529,30,true,"Sakin 4K"],[5326623,30,false,"Timelapse"],
  [12854830,30,true,"Beyaz 4K"],[11115722,30,true,"Akan 4K"],
  [12634422,30,true,"Dağ 4K"],[13141635,30,true,"Rüzgar 4K"],
  [33916737,24,true,"Altın 4K"],[30233251,60,false,"Dramatik"],
  [11806938,25,false,"Bulut II"],[10221670,30,true,"Bulutlu II"],
  [13667758,30,true,"Timelapse II"],[4110700,30,true,"Sunset II"],
  [11519743,50,false,"Gökyüzü II"],[14309781,30,false,"Bulut II"],
  [33227529,30,true,"Sakin II"],[5326623,30,false,"Timelapse II"],
  [12854830,30,true,"Beyaz II"],[11115722,30,true,"Akan II"],
  [12634422,30,true,"Dağ II"],[13141635,30,true,"Rüzgar II"],
  [33916737,24,true,"Altın II"],[30233251,60,false,"Dramatik II"],
  [11806938,25,false,"Bulut III"],[10221670,30,true,"Bulutlu III"],
  [13667758,30,true,"Timelapse III"],[4110700,30,true,"Sunset III"],
  [11519743,50,false,"Gökyüzü III"],[14309781,30,false,"Bulut III"],
  [33227529,30,true,"Sakin III"],[5326623,30,false,"Timelapse III"],
  [12854830,30,true,"Beyaz III"],[11115722,30,true,"Akan III"],
  [12634422,30,true,"Dağ III"],[13141635,30,true,"Rüzgar III"],
  [33916737,24,true,"Altın III"],[30233251,60,false,"Dramatik III"],
  [11806938,25,false,"Bulut IV"],[10221670,30,true,"Bulutlu IV"],
  [13667758,30,true,"Timelapse IV"],[4110700,30,true,"Sunset IV"],
  [11519743,50,false,"Gökyüzü IV"],[14309781,30,false,"Bulut IV"],
  [33227529,30,true,"Sakin IV"],[5326623,30,false,"Timelapse IV"],
  [12854830,30,true,"Beyaz IV"],[11115722,30,true,"Akan IV"],
];

const CENNET_DATA: Row[] = [
  [16457006,30,true,"Cennet Laleler"],[4321750,25,true,"Atmosfer 4K"],
  [8012363,30,true,"Bahar Parkı"],[27998641,25,true,"Tropik 4K"],
  [36379838,60,true,"Mercan 4K"],[15546398,25,true,"Kayıp Ada"],
  [7618009,25,true,"Plaj 4K"],[5396111,30,true,"Turkuaz"],
  [31601973,30,true,"Lale 4K"],[31828649,24,true,"Botanik"],
  [5710740,25,false,"Orman Işık"],[17740953,60,true,"Su Altı"],
  [10311923,30,false,"Kaplumbağa"],[4380614,30,true,"Sahil 4K"],
  [6279022,24,true,"Günbatımı"],[16457006,30,true,"Laleler II"],
  [4321750,25,true,"Atmosfer II"],[8012363,30,true,"Bahar II"],
  [27998641,25,true,"Tropik II"],[36379838,60,true,"Mercan II"],
  [15546398,25,true,"Ada II"],[7618009,25,true,"Plaj II"],
  [5396111,30,true,"Turkuaz II"],[31601973,30,true,"Lale II"],
  [31828649,24,true,"Botanik II"],[5710740,25,false,"Orman II"],
  [17740953,60,true,"Su Altı II"],[10311923,30,false,"Kaplumbağa II"],
  [4380614,30,true,"Sahil II"],[6279022,24,true,"Gün II"],
  [16457006,30,true,"Laleler III"],[4321750,25,true,"Atmosfer III"],
  [8012363,30,true,"Bahar III"],[27998641,25,true,"Tropik III"],
  [36379838,60,true,"Mercan III"],[15546398,25,true,"Ada III"],
  [7618009,25,true,"Plaj III"],[5396111,30,true,"Turkuaz III"],
  [31601973,30,true,"Lale III"],[31828649,24,true,"Botanik III"],
  [5710740,25,false,"Orman III"],[17740953,60,true,"Su Altı III"],
  [10311923,30,false,"Kaplumbağa III"],[4380614,30,true,"Sahil III"],
  [6279022,24,true,"Gün III"],[16457006,30,true,"Laleler IV"],
  [4321750,25,true,"Atmosfer IV"],[8012363,30,true,"Bahar IV"],
  [27998641,25,true,"Tropik IV"],[36379838,60,true,"Mercan IV"],
];

const DAGLAR_DATA: Row[] = [
  [13883796,24,true,"Tepe Kuş Bakış"],[18757923,60,true,"Utah 4K"],
  [35325909,60,false,"Karlı Havadan"],[13875350,24,true,"Orman Dağ"],
  [35741880,25,true,"Silsile 4K"],[35632406,30,true,"Sis Dağ"],
  [8761038,30,true,"Kış Drone"],[29136298,60,true,"Arnavutluk"],
  [36633320,30,true,"Karlı 4K"],[8303161,30,true,"Drone Bulut"],
  [4763085,24,true,"Karlı Zirve"],[2474616,24,true,"Buz Dağı"],
  [35655933,60,true,"Alp Gün Doğ."],[7592624,30,true,"Yüksek Dağ"],
  [19946229,30,false,"Kar Vadisi"],[34956048,60,true,"Bolivya"],
  [28492303,24,true,"Dolomit"],[7593620,30,true,"Sisli Dağ"],
  [9980505,30,true,"Şelale"],[8468523,30,true,"Çağlayan"],
  [37590733,30,true,"Drone Zirve"],[13883796,24,true,"Tepe II"],
  [18757923,60,true,"Utah II"],[13875350,24,true,"Orman II"],
  [35741880,25,true,"Silsile II"],[35632406,30,true,"Sis II"],
  [8761038,30,true,"Kış II"],[29136298,60,true,"Alps II"],
  [36633320,30,true,"Karlı II"],[8303161,30,true,"Drone II"],
  [4763085,24,true,"Zirve II"],[2474616,24,true,"Buz II"],
  [35655933,60,true,"Alp II"],[7592624,30,true,"Dağ II"],
  [19946229,30,false,"Vadi II"],[34956048,60,true,"Bolivya II"],
  [28492303,24,true,"Dolomit II"],[7593620,30,true,"Sisli II"],
  [9980505,30,true,"Şelale II"],[8468523,30,true,"Çağlayan II"],
  [37590733,30,true,"Zirve III"],[13883796,24,true,"Tepe III"],
  [18757923,60,true,"Utah III"],[13875350,24,true,"Orman III"],
  [35741880,25,true,"Silsile III"],[35632406,30,true,"Sis III"],
  [8761038,30,true,"Kış III"],[29136298,60,true,"Alps III"],
  [36633320,30,true,"Karlı III"],[8303161,30,true,"Drone III"],
  [4763085,24,true,"Zirve IV"],[2474616,24,true,"Buz III"],
];

// ─── Tüm klipleri derle ───────────────────────────────
export const MOTION_CLIPS: Clip[] = [
  ...cat("namaz",    NAMAZ_DATA),
  ...cat("musaf",    MUSAF_DATA),
  ...cat("cicekler", CICEKLER_DATA),
  ...cat("yildizlar",YILDIZLAR_DATA),
  ...cat("deniz",    DENIZ_DATA),
  ...cat("gunbatimi",GUNBATIMI_DATA),
  ...cat("gece",     GECE_DATA),
  ...cat("selale",   SELALE_DATA),
  ...cat("orman",    ORMAN_DATA),
  ...cat("col",      COL_DATA),
  ...cat("kar",      KAR_DATA),
  ...cat("sehir",    SEHIR_DATA),
  ...cat("cami",     CAMI_DATA),
  ...cat("desen",    DESEN_DATA),
  ...cat("gol",      GOL_DATA),
  ...cat("bulut",    BULUT_DATA),
  ...cat("cennet",   CENNET_DATA),
  ...cat("daglar",   DAGLAR_DATA),
];

// ─── ŞABLON (HAREKETSİZ) GERÇEK FOTOĞRAFLAR ───────────────────────
// Her kategorinin hareketli videolarının gerçek Pexels poster kareleri,
// 2K çözünürlükte şablon görsel olarak sunulur. Aynı fotoğraf bir kategoride
// bir kez görünür (ID tekilleştirildi). Açılmazsa kart procedural sahneye düşer.
const TEMPLATES_PER_CATEGORY = 50;
// ★ HIZ OPTİMİZASYONU: Galeri kartları küçük thumbnail ile ANINDA açılır (h=630&w=1200).
//   Render/seçim anında ise yüksek çözünürlüklü sürüm (1080p) kullanılır.
//   Önceden her kart 1920×1080 indirdiği için şablon sekmesi geç açılıyordu.
const hiResPoster = (poster: string) => poster;
/** Seçilen şablonun 1080p sürümü — sadece render sırasında çağrılır */
export const toHiRes = (src: string) =>
  src.replace(/fit=crop&h=630&w=1200/, "fit=crop&h=1080&w=1920");

export const TEMPLATE_CLIPS: Clip[] = (() => {
  const out: Clip[] = [];
  for (const category of CATEGORIES) {
    if (category.id === "yuklenenler") continue;
    const seen = new Set<number>();
    let n = 0;
    for (const motion of MOTION_CLIPS) {
      if (n >= TEMPLATES_PER_CATEGORY) break;
      if (motion.cat !== category.id || !motion.poster) continue;
      const m = motion.poster.match(/\/videos\/(\d+)\//);
      if (!m) continue;
      const pid = Number(m[1]);
      if (seen.has(pid)) continue;
      seen.add(pid);
      n += 1;
      out.push({
        id: `${category.id}-tpl-${n}`,
        label: motion.label,
        cat: category.id,
        kind: "img",
        src: hiResPoster(motion.poster),
      });
    }
  }
  return out;
})();

export const ALL_CLIPS: Clip[] = [...MOTION_CLIPS, ...TEMPLATE_CLIPS];

export function randomClip(kind: "img" | "vid"): Clip {
  const sameKind = ALL_CLIPS.filter((c) => c.kind === kind);
  const active = sameKind.filter((c) => ACTIVE_CATEGORIES.includes(c.cat));
  const pool = active.length ? active : sameKind;
  return pool[Math.floor(Math.random() * pool.length)] ?? sameKind[0];
}
