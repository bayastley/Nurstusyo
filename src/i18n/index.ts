// ════════════════════════════════════════════════════════
// i18n — Ana dosya: tüm dilleri birleştirip export eder
// ════════════════════════════════════════════════════════

export type { Lang, LangOption, Dict } from "./base";
export { LANGS, MEAL_EDITIONS } from "./base";

import type { Lang, Dict } from "./base";
import {
  trDict, enDict, arDict, idDict, urDict,
} from "./dicts";

/**
 * ★ ESKİ SORUN: de/ru/fr/es/id/ur/fa = {} boştu
 * t(key) çağrılınca undefined → ekranda Türkçe hardcoded kalıyordu
 * Şimdi her dil DOLU.
 */
export const T: Record<Lang, Dict> = {
  tr: trDict,
  en: enDict,
  ar: arDict,
  id: idDict,
  ur: urDict,
};

/**
 * Güvenli çeviri yardımcısı — StudioApp'te kullan:
 *   const t = (key) => translate(lang, key)
 * Boş dil / eksik anahtar → TR, sonra EN
 */
export function translate(lang: Lang | string | null | undefined, key: string): string {
  const code = String(lang || "tr").trim().toLowerCase() as Lang;
  const dict = T[code] || T.tr;
  return dict[key] || T.tr[key] || T.en[key] || key;
}

// ─── 04.10 TUR 2: yerelleştirme yardımcıları (üst bar, vakitler, sure eki) ───

/** Dil adı — LANGS etiketinin yerine, seçili dilin sözlüğünden */
export function dilAdi(lang: Lang | string | null | undefined, kod: string): string {
  return translate(lang, `dil${kod.toUpperCase()}`);
}

/** Namaz vakti adı — PRAYERS'taki Türkçe adı seçili dile çevirir */
export function vakitAdi(lang: Lang | string | null | undefined, trAd: string): string {
  return translate(lang, `vakit${trAd}`);
}

/** "3 sa 15 dk" → seçili dilin birimleriyle aynı süre */
export function sureceCevir(lang: Lang | string | null | undefined, metin: string): string {
  return metin
    .replace(/\bsa\b/g, translate(lang, "birimSaat"))
    .replace(/\bdk\b/g, translate(lang, "birimDakika"))
    .replace(/\bsn\b/g, translate(lang, "birimSaniye"))
    .replace(/\bdk'ya\b/g, translate(lang, "birimDakika"));
}

/** Sure adı + ek: tr → "Bakara Suresi", diğerleri → "Bakara" / "Surah Bakara" gerekmiyorsa çıplak ad */
export function sureBirlestir(lang: Lang | string | null | undefined, ad: string): string {
  if (lang === "tr") return `${ad} Suresi`;
  return ad;
}

// ─── Yasal metinler (04.10: legalBody Dict anahtarlarına taşındı — 5 dil sözlükte) ───
// bakiye/jeton/kredi kavramı YOKTUR. İmza sabit: LegalModal değişmeden çalışır.
type LegalBundle = {
  legalTitle: string;
  legalSubtitle: string;
  legalTabs: { tos: string; kvkk: string; privacy: string; refund: string };
  legalBody: { tos: string; kvkk: string; privacy: string; refund: string };
};

export const getPaymentCopy = (lang?: Lang | string | null): LegalBundle => ({
  legalTitle: translate(lang, "legalTitle"),
  legalSubtitle: translate(lang, "legalSubtitle"),
  legalTabs: {
    tos: translate(lang, "legalTabTos"),
    kvkk: translate(lang, "legalTabKvkk"),
    privacy: translate(lang, "legalTabPrivacy"),
    refund: translate(lang, "legalTabRefund"),
  },
  legalBody: {
    tos: translate(lang, "legalBodyTos"),
    kvkk: translate(lang, "legalBodyKvkk"),
    privacy: translate(lang, "legalBodyPrivacy"),
    refund: translate(lang, "legalBodyRefund"),
  },
});
