// ════════════════════════════════════════════════════════
// PREMIUMMODAL HELPER — Üyelik & Video Üretim Paketleri
// ════════════════════════════════════════════════════════

import { getPackRights } from "../tier";
import type { Tier } from "../tier";

export const PRO_FEATURES = [
  "Günde 8 kısa + 3 uzun video (600 sn)",
  "37 kâri sesi (2 ücretsiz + 35 PRO)",
  "250 atmosfer içeriği",
  "20 tema",
  "1080p filigransız üretim",
  "Sinematik filtreler",
  "AI başlık ve açıklama",
];

export const ELIT_FEATURES = [
  "Günde 15 kısa + 5 uzun video (600 sn) + 1 tam sürüm",
  "Tüm 52 kâri sesi (nadir Verş rivayeti + Harem imamları dahil)",
  "500 atmosfer içeriği",
  "Sınırsız AI arama",
  "Sosyal paylaşım paneli",
  "Tasarım stüdyosu",
  "Kendi imzanı ekleme",
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

export const emptyRights = { kisa: 0, uzun: 0, tam: 0 };

export function quotaText(kind: string, tier: Tier): string {
  // Kalan hak gösterimi: kullanılmadıysa "15/15", kullandıkça azalır.
  const total = DAILY_QUOTA[tier]?.[kind] ?? 0;
  return `${total}/${total}`;
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
}
