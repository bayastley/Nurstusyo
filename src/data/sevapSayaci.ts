// ══════════════════════════════════════════════════════════════
// SEVAPSAYACI.TS — Dürüst sevap sayacı (madde 4, 02.10.2026)
//   "Bu sitede bu ay şu kadar harf okundu" — sahte sayım YOK:
//   yalnız gerçek kullanıcı eylemlerinden beslenir:
//     • Kur'an Sayfaları "✓ OKUDUM"  → sayfadaki kelime sayısı kadar
//     • Kur'an Öğren ayet gezinme     → ayetin harf sayısı kadar
//     • Dua/zikir tamamlama           → duanın metin uzunluğu kadar
//   Sayaç TOPLULUK toplamıdır (kişisel değil) ve localStorage'da ay
//   anahtarıyla tutulur: ay değişince eski ay arşivlenir, sayaç sıfırdan.
//   ★ DÜRÜSTLÜK İLKESİ: harf sayıları sabit metin uzunluğundan hesaplanır,
//     rastgele artış/otel engelleme mekanizması YOK — ne görüyorsan o.
// ══════════════════════════════════════════════════════════════

export const SEVAP_AY_KEY = "nur_sevap_ay";

export interface SevapKaydi {
  ay: string;          // "2026-10" — ay değişince sıfırlanır
  harf: number;        // bu ay okunan toplam harf
  kisi: number;        // bu ay sayıya katkı veren cihaz sayısı (anonim)
}

// ── Ay anahtarı: "YYYY-MM" ──
export const suAnkiAy = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const sevapYukle = (): SevapKaydi => {
  const ay = suAnkiAy();
  try {
    const ham = localStorage.getItem(SEVAP_AY_KEY);
    if (ham) {
      const d = JSON.parse(ham) as SevapKaydi;
      if (d.ay === ay && typeof d.harf === "number" && typeof d.kisi === "number") return d;
    }
    // ay değişti veya ilk kez — bu cihaz yeni kayıt açar
    const yeni: SevapKaydi = { ay, harf: 0, kisi: 0 };
    localStorage.setItem(SEVAP_AY_KEY, JSON.stringify(yeni));
    return yeni;
  } catch {
    return { ay, harf: 0, kisi: 0 };
  }
};

export const sevapKaydet = (k: SevapKaydi): void => {
  try { localStorage.setItem(SEVAP_AY_KEY, JSON.stringify(k)); } catch { /* yut */ }
};

/** Arapça hareke/şedde/sükün sayılmaz — okunan harf sayısı dürüst tahmin */
export const arapcaHarfSayisi = (metin: string): number =>
  (metin || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/\s+/g, "").length;

export const kelimeSayisi = (metin: string): number =>
  (metin || "").split(/\s+/).filter(Boolean).length;

/**
 * ★ TEK GİRİŞ NOKTASI — her özellik okuma eklerken bunu çağırır.
 *  Cihazı sayıya bir kez katar (kisi alanı ilk eklemede 0→1 olur).
 */
export const sevapEkle = (harf: number): void => {
  if (!Number.isFinite(harf) || harf <= 0) return;
  const k = sevapYukle();
  k.harf += Math.round(harf);
  if (k.kisi === 0) k.kisi = 1;
  sevapKaydet(k);
};

/** Sayıyı gösterim için kısaltır: 12.400 → "12,4 B" (TR) / "12.4K" (EN) */
export const sevapKisa = (n: number, tr: boolean): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", tr ? "," : ".") + (tr ? " M" : "M");
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", tr ? "," : ".") + (tr ? " B" : "K");
  return n.toLocaleString(tr ? "tr-TR" : "en-US");
};
