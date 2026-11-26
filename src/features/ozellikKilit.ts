// ════════════════════════════════════════════════════════════
// OZELLIKKILIT.TS — tek merkezden özellik görünürlüğü (26.11)
// Admin panel → "Özellik Kontrol Merkezi" nur_feature_locks satırlarını
// yazar; arayüz bu yardımcıyla okur. Satır yoksa varsayılan "free"
// (mevcut canlı davranış korunur — fail-open).
// ════════════════════════════════════════════════════════════
import { getFeatureLock } from "../services/adminSyncService";
import { getCurrentTier, tierAtLeast, type Tier } from "../tier";

export type OzellikDurumu = "hidden" | "free" | "pro" | "elit";

/** Kilit satırını okur: hidden/off/v2/v3 → tamamen gizli; pro/elit → o seviye. */
export function ozellikDurumu(id: string): OzellikDurumu {
  const deger = getFeatureLock(id, "free");
  if (deger === "hidden" || deger === "off" || deger === "v2" || deger === "v3") return "hidden";
  if (deger === "pro" || deger === "elit") return deger;
  return "free";
}

/** Bu özellik şu anki kullanıcıya görünür mü? (admin paneli ayrıca hepsini görür) */
export function ozellikGorunur(id: string): boolean {
  const durum = ozellikDurumu(id);
  if (durum === "hidden") return false;
  if (durum === "free") return true;
  return tierAtLeast(getCurrentTier(), durum as Tier);
}

/** Keşfet sekmesi kimliği → kilit kimliği */
export const kesfetKilitId = (sekme: string): string => `kesfet:${sekme}`;
