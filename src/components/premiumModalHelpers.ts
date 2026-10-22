// ════════════════════════════════════════════════════════
// PREMIUMMODAL HELPER — Üyelik & Video Üretim Paketleri
// ════════════════════════════════════════════════════════

import { getPackRights, getQuotaLeft, getUsedToday } from "../tier";
import type { Tier, VideoKind } from "../tier";

// ★ SAYI DÜRÜSTLÜĞÜ (29.09 denetimi): buradaki her sayı koddaki gerçek veriyle
//   eşleşir — 45 kâri (src/reciters.ts; 10 free + 15 pro + 20 elit, src/tier.ts), 1300+ benzersiz atmosfer
//   klibi (src/clips/*), 106 tema (9 free + 51 pro + 46 elit, data/themesData.ts
//   THEME_TIER).
//   ★ ETİKET KURALI (22.10 KULLANICI EMRİ): FREE = nurstudyo.com etiketi
//   ZORUNLU · PRO = etiketsiz üretim · ELİT = etiketsiz + kendi marka
//   etiketini koyma (Marka İmza). Motor tarafı: studio/useCanvasDraw.ts —
//   etiket artık yalnız FREE'ye çizilir. Değişirse KAYNAĞI da güncelle.
export const PRO_FEATURES = [
  "Günde 8 kısa + 3 uzun video (600 sn)",
  "25 kâri sesi (10 ücretsiz + 15 PRO)",
  "60 tema erişimi (51 PRO + 9 ücretsiz)",
  "Sinematik filtreler",
  "Renk çubuğu + özel yazı",
  "Foto üzerine ayet — Ayet & Dua Kütüphanesi",
  "Etiketsiz üretim — videonda nurstudyo.com yazmaz",
];

export const ELIT_FEATURES = [
  "Günde 15 kısa + 5 uzun video (600 sn) + 1 tam sürüm",
  "Tüm 45 kâri sesi",
  "Tüm 106 tema",
  "Filigransız 1080p üretim + kendi marka etiketin",
  "Açıklama üretimi (AI varyasyonları)",
  "AI hashtag paketleri",
  "Gelişmiş sosyal paylaşım araçları",
  "Tasarım stüdyosu + kendi imzan",
  "Seslendirme (NÛR SES içerikleri)",
  "Kendi sesinle üretim",
  "Haftanın Videosu vitrine ekleme",
  "Akıllı AI arka plan seçimi",
  // ★ 06.10 (kullanıcı kararı): "Öncelikli destek" kaldırıldı — destek herkese açıkken
  //   öncelik vaadi adil değil; ELIT_FEATURES ile planElitOzellik* anahtarları birlikte azaltıldı.
];
// ★ 22.10 PLANA GÖRE HARİTA (kullanıcı emri) — KAYNAK LİSTESİ BURASI:
//   seslendirme ELİT · kendi ses ELİT · açıklama üretimi ELİT · başlık FREE ·
//   hashtag ELİT · haftanın videosu ELİT · renk çubuğu+özel yazı PRO ·
//   sinematik filtre PRO · yazı tasarımı (typografi+marka) ELİT ·
//   foto üzerine ayet (Ayet Kütüphanesi) PRO · Kur'an araçları (Kâbe canlı,
//   sayfalar, hatim, hafızlık testi, radyo) HERKESE ÜCRETSİZ.
//   planXxxOzellikN sözlük anahtarları (5 dil) bu sırayla birebir karşılıklıdır.

export const DAILY_QUOTA: Record<Tier, Record<string, number>> = {
  free: { kisa: 3, uzun: 0, tam: 0 },
  pro: { kisa: 8, uzun: 3, tam: 0 },
  elit: { kisa: 15, uzun: 5, tam: 1 },
};

export const TIER_LABEL: Record<Tier, string> = {
  free: "Ücretsiz",
  pro: "NÛR PRO",
  elit: "NÛR ELİT",
};

// ★ 04.10 TUR 2: dil bazlı tier etiketi (PremiumKotaGostergesi rozetinde kullanılır)
export const TIER_LABEL_TR: Record<string, Record<Tier, string>> = {
  tr: { free: "Ücretsiz", pro: "NÛR PRO", elit: "NÛR ELİT" },
  en: { free: "Free", pro: "NÛR PRO", elit: "NÛR ELITE" },
  ar: { free: "مجاني", pro: "NÛR PRO", elit: "NÛR ELITE" },
  id: { free: "Gratis", pro: "NÛR PRO", elit: "NÛR ELITE" },
  ur: { free: "مفت", pro: "NÛR PRO", elit: "NÛR ELITE" },
};

export const emptyRights = { kisa: 0, uzun: 0, tam: 0 };

export function quotaText(kind: string, tier: Tier): string {
  // ★ 05.10 Sadık Üye: ücretsiz kısa kotası +1 gösterebilmek için gerçek motor okunur
  //   (getQuotaLeft bonus dahil KALAN'ı verir; toplam = kalan + bugün kullanılan).
  try {
    const kalan = getQuotaLeft(kind as VideoKind, tier);
    const bugunKullanilan = getUsedToday(kind as VideoKind);
    return `${kalan}/${kalan + bugunKullanilan}`;
  } catch {
    return `0/${DAILY_QUOTA[tier][kind]}`;
  }
}

export function readPackRights(): Record<string, number> {
  try {
    const rights = getPackRights();
    return {
      kisa: Math.max(0, rights.kisa || 0),
      uzun: Math.max(0, rights.uzun || 0),
      tam: Math.max(0, rights.tam || 0),
    };
  } catch {
    return { ...emptyRights };
  }
}

export type PremiumTab = "uyelik" | "paket" | "jeton";

export interface PremiumModalProps {
  open?: boolean;
  setOpen?: (v: boolean) => void;
  tier?: Tier;
  onCheckout?: (productCode: string) => void;
  notify?: (msg: string) => void;
  user?: { email?: string; googleId?: string } | null;
  initialTab?: PremiumTab;
  premiumTab?: PremiumTab;
  /** ★ 22.10 hedef seviye: pro kullanıcı elite özellik tıkladığında ELİT (ya da
   *  hedef) kartına otomatik kaydırır + geçici vurgu ring'i basar. */
  hedefTier?: "pro" | "elit";
  currentTier?: Tier;
  onClose?: () => void;
  onPurchase?: (newTier: Tier) => void;
  onTokenPurchase?: (amount: number) => void;
  setTier?: (t: Tier) => void;
  setCurrentTier?: (t: Tier) => void;
  lang?: unknown;
  packRights?: { kisa: number; uzun: number; tam: number };
  subscriptionEndsAt?: string | null;
}
