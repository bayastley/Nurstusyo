// ════════════════════════════════════════════════════════
// PREMIUMMODAL HELPER — Üyelik & Video Üretim Paketleri
// ════════════════════════════════════════════════════════

import { getPackRights, getQuotaLeft, getUsedToday } from "../tier";
import type { Tier, VideoKind } from "../tier";

// ★ SAYI DÜRÜSTLÜĞÜ (29.09 denetimi): buradaki her sayı koddaki gerçek veriyle
//   eşleşir — 45 kâri (src/reciters.ts; 37 free + 8 PRO), 1300+ benzersiz atmosfer
//   klibi (src/clips/*), 106 tema (9 free + 51 pro + 46 elit, data/themesData.ts
//   THEME_TIER). Filigran yalnız ELİT'te kaldırılır (studio/useCanvasDraw.ts) —
//   PRO'ya "filigransız" VAAT EDİLEMEZ. Değişirse KAYNAĞI da güncelle.
export const PRO_FEATURES = [
  "Günde 8 kısa + 3 uzun video (600 sn)",
  "45 kâri sesi (37 ücretsiz + 8 PRO)",
  "60 tema erişimi (51 PRO + 9 ücretsiz)",
  "Sinematik filtreler",
  "AI başlık ve açıklama varyasyonları",
];

export const ELIT_FEATURES = [
  "Günde 15 kısa + 5 uzun video (600 sn) + 1 tam sürüm",
  "Tüm 45 kâri sesi",
  "Tüm 106 tema",
  "Filigransız 1080p üretim",
  "AI hashtag paketleri",
  "Gelişmiş sosyal paylaşım araçları",
  "Tasarım stüdyosu + kendi imzan",
  "Öncelikli destek",
];

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
