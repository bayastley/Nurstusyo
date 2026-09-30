// ════════════════════════════════════════════════════════
// MESAJ KATMANI (01.10) — stüdyo + ayet kartlığı ORTAK çekirdeği
//
// 1) RENK ÇUBUĞU — aşağıdan yukarı bütün renkleri taşıyan dikey çubuk.
//    Arapça metin rengi ile meal rengi AYRI AYRI seçilir; ikisi de aynı
//    6 duraklı gökkuşağı paletinden örneklenir (stüdyo canvas'ı ile kart
//    drawCard'ı birebir aynı rengi alır — tek kaynak bu dosya).
//    CSS değişkenleri (var(--x)) çizimden ÖNCE çözülür: canvas 2D
//    context'i var() kabul etmez, o yüzden getComputedStyle ile hex'e
//    indirilir (CanvasDoldurucu sayesinde).
//    Kullanıcı "renk döngüsü" (hueRotate) ile çubuğu döndürür: örn.
//    60° = altın→yeşil→mavi→mor→kırmızı→altın.
//
// 2) ÖZEL YAZI KATMANI — kullanıcının yazdığı serbest metin, videonun
//    İÇİNE çizilir (önizleme = video çıktısı; mesaj üretimde de görünür).
//    Ayrı konumlandırma: mesaj konumu (üst/orta/alt × sol/orta/sağ) +
//    ince ofset (mesajOfset) — ayet konumundan (textOffset) bağımsız.
//    Stüdyo: draw() sonunda çizilir → captureStream otomatik videoya alır.
//    Kartlık: drawCard sonunda aynı drawMesajYazisi ile çizilir.
// ════════════════════════════════════════════════════════

// ─── 1. RENK ÇUBUĞU ─────────────────────────────────────

/** Çubuğun alt→üst sabit durakları (altın → beyaz-altın → turkuaz → mor → kırmızı → altın) */
export const RENK_CUBUGU_DURAKLARI: readonly string[] = [
  "#d7aa52",
  "#f5e0b5",
  "#67e8f9",
  "#a78bfa",
  "#fb7185",
  "#d7aa52",
] as const;

export interface CubukAyar {
  /** Arapça metin rengi — çubuk konumu 0-360° (acik=true iken uygulanır) */
  donme: number;
  /** Meal (çeviri) metin rengi — çubuk konumu 0-360° (Arapça'dan bağımsız) */
  mealDonme: number;
  /** Çerçeve şeridi kalınlığı (0 = şerit yok) */
  kalinlik: number;
  acik: boolean;
}

export const VARSAYILAN_CUBUK: CubukAyar = { donme: 0, mealDonme: 150, kalinlik: 6, acik: false };

/** Donme açısını uygula: durakları döndürüp dikişsiz kapalı döngü kur */
export function cubukDuraklari(donme: number): string[] {
  const d = ((donme % 360) + 360) % 360;
  const adim = d / 60; // 6 durak → tam tur 360°
  const alt = Math.floor(adim), ust = Math.ceil(adim) % 6;
  const oran = adim - alt;
  const dondurulmus = RENK_CUBUGU_DURAKLARI.map((_, i) => {
    const a = RENK_CUBUGU_DURAKLARI[(i + alt) % 6], b = RENK_CUBUGU_DURAKLARI[(i + ust) % 6];
    return araRenk(a, b, oran);
  });
  // Kapalı döngü: son durak = ilk durak (dikişsiz geçiş)
  dondurulmus[5] = dondurulmus[0];
  return dondurulmus;
}

/** #rrggbb ikisini oranla karıştır → #rrggbb */
function araRenk(hex1: string, hex2: string, oran: number): string {
  const p = (h: string): [number, number, number] => [
    parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(hex1), [r2, g2, b2] = p(hex2);
  const karis = (a: number, b: number) => Math.round(a + (b - a) * oran).toString(16).padStart(2, "0");
  return `#${karis(r1, r2)}${karis(g1, g2)}${karis(b1, b2)}`;
}

/**
 * Çubuktan renk örnekle: 0–360° sürekli konum → hex. Çubuğu AŞAĞI-YUKARI
 * sürükleyince renk değişir (hue kaydırıcı gibi). Metin renk seçicileri
 * (Arapça / Meal) ve 12 preset düğmesi bunun üzerinden çalışır.
 */
export function cubukRengi(derece: number): string {
  const d = ((derece % 360) + 360) % 360;
  const adim = d / 60;
  const alt = Math.floor(adim) % 6, ust = (alt + 1) % 6;
  return araRenk(RENK_CUBUGU_DURAKLARI[alt], RENK_CUBUGU_DURAKLARI[ust], adim - Math.floor(adim));
}

/** rrggbb → HSL dönme derecesine çevir (döngü düğmelerinin "mevcut renk" göstergesi için) */
export function hexToHue(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(((h * 60) + 360) % 360);
}

/**
 * Canvas doldurucu: CSS değişkenlerini (var(--x)) getComputedStyle ile çözer —
 * canvas 2D context var() kabul etmez. Hem stüdyo hem kartlık bunu kullanır.
 */
export class CanvasDoldurucu {
  private cozumler = new Map<string, string>();

  private coz(renk: string): string {
    if (renk.startsWith("var(")) {
      const ad = renk.slice(4, -1).trim();
      let cozum = this.cozumler.get(ad);
      if (!cozum) {
        cozum = getComputedStyle(document.documentElement).getPropertyValue(ad).trim() || "#d7aa52";
        this.cozumler.set(ad, cozum);
      }
      return cozum;
    }
    return renk;
  }

  temizle(): void { this.cozumler.clear(); }

  /**
   * Çubuğu çerçevenin İÇ kenarına dikey şerit olarak çizer (aşağıdan yukarı
   * durak sırasıyla). w/h piksel cinsinden — hem stüdyo (9:16 vb.) hem kart
   * (4:5/1:1/9:16) kendi boyutuyla çağırır.
   */
  cubukCiz(ctx: CanvasRenderingContext2D, w: number, h: number, ayar: CubukAyar): void {
    if (!ayar.acik || ayar.kalinlik <= 0) return;
    const kal = Math.max(1, Math.min(40, Math.round(ayar.kalinlik)));
    const duraklar = cubukDuraklari(ayar.donme);
    const grad = ctx.createLinearGradient(0, h, 0, 0); // alt→üst
    duraklar.forEach((renk, i) => grad.addColorStop(i / (duraklar.length - 1), this.coz(renk)));
    ctx.save();
    ctx.fillStyle = grad;
    // 4 kenar (iç kenar çerçevesi) — tek path
    ctx.fillRect(0, 0, w, kal);                    // üst
    ctx.fillRect(0, h - kal, w, kal);              // alt
    ctx.fillRect(0, 0, kal, h);                    // sol
    ctx.fillRect(w - kal, 0, kal, h);              // sağ
    // Hafif iç parlama: çubuğun iç kenarına 1px açık çizgi
    ctx.fillStyle = "rgba(255,255,255,.35)";
    if (kal >= 4) {
      ctx.fillRect(0, kal, w, 1); ctx.fillRect(0, h - kal - 1, w, 1);
      ctx.fillRect(kal, 0, 1, h); ctx.fillRect(w - kal - 1, 0, 1, h);
    }
    ctx.restore();
  }
}

// ─── 2. ÖZEL YAZI KATMANI ───────────────────────────────

export interface MesajAyar {
  metin: string;
  konum: "ust" | "orta" | "alt";
  hizalama: "sol" | "orta" | "sag";
  /** İnce ofset: -40..40 her iki eksende (ayet textOffset'ten bağımsız) */
  ofset: { x: number; y: number };
  /** Font ölçeği %70–160 (100 = standart) */
  olcek: number;
  acik: boolean;
  /** ★ HAT FONTU (01.10): yazının CSS font ailesi — kartlıkta ARABIC_FONTS'tan seçilir */
  hatCss: string;
  /** Hat fontunun ağırlığı — tek ağırlıklı fontlarda 400 (arabicFontWeight) */
  hatAgirlik: number;
  /** ★ RENK: hex — kartlıkta çubuktan (cubukRengi) seçilir; "#ffffff" = klasik beyaz */
  renk: string;
  /** ★ IŞILTI: 0–2 — yazının arkasına kendi rengiyle hale çizer (0 = sade) */
  isilti: number;
}

export const VARSAYILAN_MESAJ: MesajAyar = {
  metin: "",
  konum: "alt",
  hizalama: "orta",
  ofset: { x: 0, y: 0 },
  olcek: 100,
  acik: false,
  hatCss: "Inter, sans-serif",
  hatAgirlik: 600,
  renk: "#ffffff",
  isilti: 1,
};

/**
 * Özel yazıyı çizer. wrapText: çağıran motorun kendi satır-bölücüsü
 * (farklı canvas boyutlarında maxWidth ölçümü aynı font state'ini gerektirir).
 * Bu fonksiyon shadow/fill state'ini kurar, konum ve hizalamayı hesaplar.
 * Dönen değer: yazının bittiği y (alt kenar) — motor gerekirse kullanır.
 */
export function drawMesajYazisi(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ayar: MesajAyar,
  wrapText: (text: string, maxWidth: number) => string[],
): number {
  if (!ayar.acik) return 0;
  const metin = ayar.metin.trim();
  if (!metin) return 0;

  const boy = Math.round(h * 0.026 * (Math.max(70, Math.min(160, ayar.olcek)) / 100));
  const maxW = w * 0.78;
  const hatCss = ayar.hatCss || "Inter, sans-serif";
  const agirlik = ayar.hatAgirlik || 600;
  ctx.font = `${agirlik} ${boy}px ${hatCss}`;
  const satirlar = wrapText(metin, maxW);
  if (!satirlar.length) return 0;

  const satirH = boy * 1.45;
  const blokH = satirlar.length * satirH;
  const guvenliUst = h * 0.06, guvenliAlt = h * 0.94;

  // Dikey konum (üst/orta/alt) + ince ofset (px = h*0.004/adım, textOffset ile aynı ölçek)
  let ust;
  if (ayar.konum === "ust") ust = guvenliUst;
  else if (ayar.konum === "orta") ust = (h - blokH) / 2;
  else ust = guvenliAlt - blokH;
  ust = Math.max(guvenliUst, Math.min(guvenliAlt - blokH, ust + ayar.ofset.y * h * 0.004));

  const ox = ayar.ofset.x * w * 0.004;
  const tx = ayar.hizalama === "sol" ? w * 0.11 + ox : ayar.hizalama === "sag" ? w * 0.89 + ox : w / 2 + ox;
  ctx.textAlign = ayar.hizalama === "sol" ? "left" : ayar.hizalama === "sag" ? "right" : "center";
  // ★ YÖN OTOMATİĞİ: metinde Arapça karakter varsa RTL — hat fontuyla doğru bağlanma
  const rtl = /[\u0600-\u06FF\u0750-\u077F]/.test(metin);
  ctx.direction = rtl ? "rtl" : "ltr";

  // Okunabilirlik: hafif kontur + koyu gölge; ışıltı > 0 iken arkaya KENDİ RENGİYLE hale
  const renk = ayar.renk || "#ffffff";
  const isilti = Math.max(0, Math.min(2, ayar.isilti ?? 1));
  ctx.font = `${agirlik} ${boy}px ${hatCss}`;
  ctx.fillStyle = renk;
  ctx.strokeStyle = "rgba(0,0,0,.55)";
  ctx.lineWidth = Math.max(2, Math.round(boy * 0.16));
  ctx.shadowColor = "rgba(0,0,0,.85)";
  ctx.shadowBlur = Math.round(boy * 0.45);
  ctx.shadowOffsetY = 1;

  let yy = ust + boy;
  for (const satir of satirlar) {
    if (isilti > 0) {
      // Işıltı geçişi: yazıyı kendi rengiyle geniş blur ile bir kez çiz → renkli hale
      ctx.shadowColor = renk;
      ctx.shadowBlur = Math.round(boy * 0.7 * isilti);
      ctx.fillText(satir, tx, yy);
      ctx.shadowColor = "rgba(0,0,0,.85)";
      ctx.shadowBlur = Math.round(boy * 0.45);
    }
    ctx.strokeText(satir, tx, yy);
    ctx.fillText(satir, tx, yy);
    yy += satirH;
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  return ust + blokH;
}
