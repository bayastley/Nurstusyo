import type { KelimeKart } from "../../data/kelimeData";

export function atolyeKelimeOner(d: KelimeKart): string {
  return d.tr.split(/[,(]/)[0].trim() || d.tr;
}

// ★ RENK KODU YARDIMCISI (01.11, kullanıcı emri): derece rozetleri her yerde
//   aynı renktedir — sahih=yeşil, hasan=mavi, zayıf=amber.
