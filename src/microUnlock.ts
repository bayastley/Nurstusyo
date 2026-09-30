// ════════════════════════════════════════════════════════
// MICROUNLOCK.TS — 24 saatlik mikro kilit açma + davet ödülü sabitleri
// tier.ts'den ayrıldı (SRP parçalama adım 1c, 30.09)
// ════════════════════════════════════════════════════════

import type { VideoKind } from "./tier";

export type MicroUnlockKey = "batch" | "ai_search" | "full_mode";
const MICRO_UNLOCK_PREFIX = "nur_micro_unlock_";
export const MICRO_UNLOCK_HOURS = 24;

export function hasMicroUnlock(key: MicroUnlockKey): boolean {
  return typeof window !== "undefined" && Date.now() < Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0);
}
export function grantMicroUnlock(key: MicroUnlockKey): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MICRO_UNLOCK_PREFIX + key, String(Date.now() + MICRO_UNLOCK_HOURS * 3600000));
  }
}
export function microUnlockRemainingMs(key: MicroUnlockKey): number {
  return typeof window === "undefined" ? 0 : Math.max(0, Number(localStorage.getItem(MICRO_UNLOCK_PREFIX + key) || 0) - Date.now());
}

// ════════════════════════════════════════════════════════
// ★ DAVET PROGRAMI — ödül olarak ek üretim hakkı verir
// ════════════════════════════════════════════════════════

export const DAVET_KADEMELERI = [
  { esik: 3, rozet: "Tohum", kind: "kisa" as VideoKind, amount: 3 },
  { esik: 10, rozet: "Fidan", kind: "kisa" as VideoKind, amount: 8 },
  { esik: 25, rozet: "Ağaç", kind: "uzun" as VideoKind, amount: 5 },
  { esik: 50, rozet: "Orman", kind: "tam" as VideoKind, amount: 2, ozel: "Ömür boyu Pro" },
] as const;
export const DAVET_EDILEN_GIRIS = 3;
export const DAVET_REFERANS_KOD_BONUS = 1;
