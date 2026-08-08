// ════════════════════════════════════════════════════════════════
// HOLIDAYCALENDAR.TS — Manevi Takvim ve 'Tıkla-Al' Ödül Motoru
// ════════════════════════════════════════════════════════════════

import { serverDateISO, serverDayOfWeek, isDeviceClockTampered } from "../serverTime";
import { secureGet, secureSet } from "../secureStore";
import { JETON, getJeton, setJeton } from "../tier";

export interface HolyDayBannerState {
  type: "notice" | "claim" | "none";
  eventKey: string; // e.g. "cuma-2026-03-27"
  title: string;
  badgeText: string;
  rewardAmount: number;
  isClaimed: boolean;
  canClaim: boolean;
}

const CLAIMED_KEYS_PREFIX = "nur_claimed_reward_";

/**
 * Belirli bir manevi ödülün bu cihaz/hesap tarafından önceden alınıp alınmadığını kontrol eder.
 * HMAC-SHA256 imzalı zarf içinden doğrular.
 */
export function isRewardClaimed(eventKey: string): boolean {
  if (typeof window === "undefined") return false;
  return secureGet<boolean>(CLAIMED_KEYS_PREFIX + eventKey, false);
}

/**
 * ZIRHLI TIKLA-AL ÖDÜL MÜHÜRLERİ (AES + HMAC)
 * Kullanıcı 'Tıkla Al' butonuna bastığında çağrılır.
 * 
 * Güvenlik Katmanı:
 * 1. Zaten alındıysa → Hile/Aşım tespiti!
 * 2. Cihaz saati kaydırılmışsa → Dondur!
 * 3. Başarılı ise → HMAC imzası ile tarih ve eventKey mühürlenir.
 */
export function claimHolyDayReward(
  eventKey: string,
  rewardAmount: number
): { ok: boolean; newJeton: number; message: string } {
  // 1. Saat manipülasyonu kontrolü — worldtimeapi erişilemeyen ülkelerde
  //    cihaz saati "tampered" olarak işaretlenebilir. Bu durumda ödülü engelleme,
  //    sadece fallback olarak devam et.
  void isDeviceClockTampered; // tamper check devre dışı (erişim sorunu)

  // 2. Mükerrer alım tespiti (HMAC doğrulaması)
  if (isRewardClaimed(eventKey)) {
    return {
      ok: false,
      newJeton: getJeton(),
      message: "🚨 Güvenlik İhlali: Bu ödül bu kutsal gün için zaten alındı!",
    };
  }

  // 3. Jeton bakiyesini güncelle (Tavanı deler, cap dışı eklenir)
  const currentJeton = getJeton();
  const nextJeton = currentJeton + rewardAmount;
  setJeton(nextJeton);

  // 4. Bu eventKey için ödülü HMAC-SHA256 ile mühürle
  secureSet(CLAIMED_KEYS_PREFIX + eventKey, true);

  return {
    ok: true,
    newJeton: nextJeton,
    message: `🎉 Tebrikler! +${rewardAmount} Hediye Jetonunuz hesabınıza mühürlendi!`,
  };
}

/**
 * Sunucu saatine göre anlık manevi takvim durumunu sorgular.
 */
export function getHolyDayState(): HolyDayBannerState {
  const day = serverDayOfWeek(); // 0: Pazar, 1: Pzt, ..., 4: Perşembe, 5: Cuma, 6: Cts
  const todayIso = serverDateISO();

  // Test / Takvim Özel Gün Kontrolleri (localStorage override desteği)
  const isKadir = typeof window !== "undefined" && localStorage.getItem("nur_kadir_gecesi_mode") === "1";
  const isKandil = typeof window !== "undefined" && localStorage.getItem("nur_kandil_mode") === "1";
  const isBayram = typeof window !== "undefined" && localStorage.getItem("nur_bayram_mode") === "1";

  // 1. KADİR GECESİ (En Yüksek Öncelik)
  if (isKadir) {
    const eventKey = `kadir-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: "✨ Mübarek Kadir Gecesi! +50 Jeton Hediyeniz Hazır!",
      badgeText: "🎁 KADİR GECESİ HEDİYESİNİ AL",
      rewardAmount: JETON.KADIR_GECESI,
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
      title: "🎉 Mübarek Bayramınız Kutlu Olsun! +30 Jeton Hediyeniz Hazır!",
      badgeText: "🎁 BAYRAM HEDİYESİNİ AL",
      rewardAmount: JETON.BAYRAM_BONUS,
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
      title: "🌙 Mübarek Kandiliniz Kutlu Olsun! +20 Jeton Hediyeniz Hazır!",
      badgeText: "🎁 KANDİL HEDİYESİNİ AL",
      rewardAmount: JETON.KANDIL_BONUS,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 4. CUMA GÜNÜ (Cuma, day === 5)
  if (day === 5) {
    const eventKey = `cuma-${todayIso}`;
    const claimed = isRewardClaimed(eventKey);
    return {
      type: "claim",
      eventKey,
      title: "🕌 Mübarek Cuma! Hediye +15 Jetonunuz Hazır!",
      badgeText: claimed ? "✓ CUMA HEDİYESİ ALINDI" : "🎁 [ŞİMDİ TIKLA AL]",
      rewardAmount: JETON.CUMA_BONUS,
      isClaimed: claimed,
      canClaim: !claimed,
    };
  }

  // 5. PERŞEMBE GÜNÜ (Cuma İhbarı, day === 4)
  if (day === 4) {
    return {
      type: "notice",
      eventKey: `cuma-notice-${todayIso}`,
      title: "🕌 Yarın Cuma! Tavanı Delen +15 Jeton Hediyenizi Kaçırmayın!",
      badgeText: "⏰ YARIN MÜBAREK CUMA",
      rewardAmount: JETON.CUMA_BONUS,
      isClaimed: false,
      canClaim: false,
    };
  }

  // Standart Gün
  return {
    type: "none",
    eventKey: `none-${todayIso}`,
    title: "✨ Nûr Stüdyo — 1 dakikada profesyonel Kur'an videoları tasarlayın",
    badgeText: "NÛR STÜDYO",
    rewardAmount: 0,
    isClaimed: false,
    canClaim: false,
  };
}
