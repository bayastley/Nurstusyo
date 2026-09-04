// ════════════════════════════════════════════════════════════════
// HOLIDAYCALENDAR.TS — Manevi Takvim ve Hediye Motoru
//
// ★ İYZİCO UYUMU:
//   Hediye olarak bakiye/jeton EKLENMEZ.
//   Özel günlerde kullanıcıya ek VİDEO ÜRETİM HAKKI tanımlanır.
// ════════════════════════════════════════════════════════════════

import { serverDateISO, serverDayOfWeek } from "../serverTime";
import { secureGet, secureSet } from "../secureStore";
import { HEDIYE, grantPack, VIDEO_KIND_LABEL, type VideoKind } from "../tier";

export interface HolyDayBannerState {
  type: "notice" | "claim" | "none";
  eventKey: string;
  title: string;
  badgeText: string;
  /** Hediye edilecek video türü */
  rewardKind: VideoKind;
  /** Kaç adet ek üretim hakkı */
  rewardAmount: number;
  isClaimed: boolean;
  canClaim: boolean;
}

const CLAIMED_KEYS_PREFIX = "nur_claimed_gift_";

/** Bu hediye daha önce alındı mı — HMAC imzalı zarftan doğrulanır */
export function isRewardClaimed(eventKey: string): boolean {
  if (typeof window === "undefined") return false;
  // Hem secure hem plain kontrol — her ikisi de çalışsın
  if (secureGet<boolean>(CLAIMED_KEYS_PREFIX + eventKey, false)) return true;
  try { if (localStorage.getItem(CLAIMED_KEYS_PREFIX + eventKey + "_plain") === "1") return true; } catch {}
  return false;
}

/**
 * Hediye üretim hakkını tanımlar.
 * Aynı gün için ikinci kez alınamaz.
 */
export function claimHolyDayReward(
  eventKey: string,
  kindOrAmount: VideoKind | number,
  amount?: number,
): { ok: boolean; message: string; newJeton: number } {
  const kind: VideoKind = typeof kindOrAmount === "number" ? "kisa" : kindOrAmount;
  const giftAmount = Math.max(0, Math.floor(typeof kindOrAmount === "number" ? kindOrAmount : amount ?? 0));
  if (isRewardClaimed(eventKey)) {
    return {
      ok: false,
      message: "🚨 Bu hediye bu gün için zaten alındı.",
      newJeton: 0,
    };
  }

  grantPack(kind, giftAmount);
  secureSet(CLAIMED_KEYS_PREFIX + eventKey, true);
  // Ekstra koruma — secureStore bozulsa bile banner kaybolsun
  try { localStorage.setItem(CLAIMED_KEYS_PREFIX + eventKey + "_plain", "1"); } catch {}

  return {
    ok: true,
    message: `🎉 Tebrikler! ${giftAmount} adet ${VIDEO_KIND_LABEL[kind]} üretim hakkı hesabınıza tanımlandı.`,
    newJeton: giftAmount,
  };
}

/** Sunucu saatine göre anlık manevi takvim durumu */
export function getHolyDayState(): HolyDayBannerState {
  const day = serverDayOfWeek();
  const todayIso = serverDateISO();

  const isKadir = typeof window !== "undefined" && localStorage.getItem("nur_kadir_gecesi_mode") === "1";
  const isKandil = typeof window !== "undefined" && localStorage.getItem("nur_kandil_mode") === "1";
  const isBayram = typeof window !== "undefined" && localStorage.getItem("nur_bayram_mode") === "1";
  const isRamazan = typeof window !== "undefined" && localStorage.getItem("nur_ramadan_mode") === "1";

  // 1. KADİR GECESİ
  if (isKadir) {
    const eventKey = `kadir-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: `✨ Mübarek Kadir Gecesi! ${HEDIYE.KADIR.amount} uzun video hediyeniz hazır`,
      badgeText: claimed ? "✓ HEDİYE ALINDI" : "🎁 HEDİYENİ AL",
      rewardKind: HEDIYE.KADIR.kind,
      rewardAmount: HEDIYE.KADIR.amount,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 2. BAYRAM
  if (isBayram) {
    const eventKey = `bayram-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: `🎉 Bayramınız kutlu olsun! ${HEDIYE.BAYRAM.amount} uzun video hediyeniz hazır`,
      badgeText: claimed ? "✓ HEDİYE ALINDI" : "🎁 HEDİYENİ AL",
      rewardKind: HEDIYE.BAYRAM.kind,
      rewardAmount: HEDIYE.BAYRAM.amount,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 3. KANDİL
  if (isKandil) {
    const eventKey = `kandil-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: `🌙 Kandiliniz mübarek olsun! ${HEDIYE.KANDIL.amount} kısa video hediyeniz hazır`,
      badgeText: claimed ? "✓ HEDİYE ALINDI" : "🎁 HEDİYENİ AL",
      rewardKind: HEDIYE.KANDIL.kind,
      rewardAmount: HEDIYE.KANDIL.amount,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 4. RAMAZAN
  if (isRamazan) {
    const eventKey = `ramazan-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: `🌙 Ramazan bereketi! ${HEDIYE.RAMAZAN.amount} kısa video hediyeniz hazır`,
      badgeText: claimed ? "✓ HEDİYE ALINDI" : "🎁 RAMAZAN HEDİYESİ",
      rewardKind: HEDIYE.RAMAZAN.kind,
      rewardAmount: HEDIYE.RAMAZAN.amount,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 5. CUMA GÜNÜ
  if (day === 5) {
    const eventKey = `cuma-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: `🕌 Mübarek Cuma! ${HEDIYE.CUMA.amount} kısa video hediyeniz hazır`,
      badgeText: claimed ? "✓ HEDİYE ALINDI" : "🎁 ŞİMDİ AL",
      rewardKind: HEDIYE.CUMA.kind,
      rewardAmount: HEDIYE.CUMA.amount,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 6. PERŞEMBE — Cuma hatırlatması
  if (day === 4) {
    return {
      type: "notice",
      eventKey: `cuma-notice-${todayIso}`,
      title: `🕌 Yarın Cuma! ${HEDIYE.CUMA.amount} kısa video hediyenizi kaçırmayın`,
      badgeText: "⏰ YARIN MÜBAREK CUMA",
      rewardKind: HEDIYE.CUMA.kind,
      rewardAmount: HEDIYE.CUMA.amount,
      isClaimed: false,
      canClaim: false,
    };
  }

  // Standart gün
  return {
    type: "none",
    eventKey: `none-${todayIso}`,
    title: "✨ Nûr Stüdyo — 1 dakikada profesyonel Kur'an videoları tasarlayın",
    badgeText: "NÛR STÜDYO",
    rewardKind: "kisa",
    rewardAmount: 0,
    isClaimed: false,
    canClaim: false,
  };
}
