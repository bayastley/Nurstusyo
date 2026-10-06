// ════════════════════════════════════════════════════════════════
// HOLIDAYCALENDAR.TS — Manevi Takvim ve Hediye Motoru
//
// ★ İYZİCO UYUMU:
//   Hediye olarak bakiye/jeton EKLENMEZ.
//   Özel günlerde kullanıcıya ek VİDEO ÜRETİM HAKKI tanımlanır.
// ════════════════════════════════════════════════════════════════

import { serverDateISO, serverDayOfWeek } from "../serverTime";
import { HEDIYE, VIDEO_KIND_LABEL, type VideoKind } from "../tier";

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
const claimedInSession = new Set<string>();

/** Bu hediye daha önce alındı mı — HMAC imzalı zarftan doğrulanır */
export function isRewardClaimed(eventKey: string): boolean {
  if (typeof window === "undefined") return false;
  return claimedInSession.has(eventKey) || localStorage.getItem(`${CLAIMED_KEYS_PREFIX}${eventKey}`) === "1";
}

/**
 * Hediye üretim hakkını tanımlar.
 * Aynı gün için ikinci kez alınamaz.
 */
export async function claimHolyDayReward(
  eventKey: string,
  kindOrAmount: VideoKind | number,
  amount?: number,
): Promise<{ ok: boolean; message: string; newJeton: number }> {
  const kind: VideoKind = typeof kindOrAmount === "number" ? "kisa" : kindOrAmount;
  const giftAmount = Math.max(0, Math.floor(typeof kindOrAmount === "number" ? kindOrAmount : amount ?? 0));
  if (isRewardClaimed(eventKey)) return { ok: false, message: "🚨 Bu hediye bu gün için zaten alındı.", newJeton: 0 };
  try {
    const response = await fetch("/api/rewards/claim", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey, kind, amount: giftAmount }),
    });
    const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) return { ok: false, message: data?.error === "ALREADY_CLAIMED" ? "🚨 Bu hediye bu gün için zaten alındı." : "Hediye şu anda alınamadı.", newJeton: 0 };
    claimedInSession.add(eventKey);
    localStorage.setItem(`${CLAIMED_KEYS_PREFIX}${eventKey}`, "1");
    return { ok: true, message: `🎉 Tebrikler! ${giftAmount} adet ${VIDEO_KIND_LABEL[kind]} üretim hakkı hesabınıza tanımlandı.`, newJeton: giftAmount };
  } catch {
    return { ok: false, message: "Hediye servisine ulaşılamadı.", newJeton: 0 };
  }
}

// ════════════════════════════════════════════════════════
// ★ HİCRİ OTOMATİK ALGILAMA (06.10 — sahibin emri): kandil/bayram/kadir
//   bayraklarını hiçbir kod set etmiyordu → hediye HİÇ tetiklenemiyordu.
//   Artık Intl islamic-umalqura takviminden bugünün hicri tarihi hesaplanır:
//     • Kadir Gecesi      : Ramazan 27
//     • Ramazan Bayramı   : Şevval 1-3
//     • Kurban Bayramı    : Zilhicce 10-13
//     • Mevlid Kandili    : Rebiülevvel 12
//     • Miraç Kandili     : Recep 27
//     • Berat Kandili     : Şaban 15
//     • Arefe             : Zilhicce 9
//     • Regaib Kandili    : Recep ayının ilk Cuma'sı
//   localStorage bayrağı hâlâ GEÇERSİZ KILAR (admin manuel zorlayabilir).
// ════════════════════════════════════════════════════════

export interface ManeviBayraklar {
  kadir: boolean;
  kandil: boolean;
  bayram: boolean;
  ramazan: boolean;
}

function hicriBugun(): { y: number; m: number; d: number } | null {
  if (typeof Intl === "undefined") return null;
  try {
    const parcalar = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(new Date());
    const oku = (tip: string) => Number(parcalar.find((p) => p.type === tip)?.value || NaN);
    const y = oku("year"), m = oku("month"), d = oku("day");
    return Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d) ? { y, m, d } : null;
  } catch { return null; }
}

/** Bugünün manevi bayrakları: el-yazımı localStorage bayrağı VEYA hicri hesap */
export function maneviBayraklar(): ManeviBayraklar {
  const w = typeof window !== "undefined" ? window : undefined;
  const elYazimi: ManeviBayraklar = {
    kadir: Boolean(w && w.localStorage.getItem("nur_kadir_gecesi_mode") === "1"),
    kandil: Boolean(w && w.localStorage.getItem("nur_kandil_mode") === "1"),
    bayram: Boolean(w && w.localStorage.getItem("nur_bayram_mode") === "1"),
    ramazan: Boolean(w && w.localStorage.getItem("nur_ramadan_mode") === "1"),
  };
  const h = hicriBugun();
  if (!h) return elYazimi;
  const { m, d } = h;
  const hesap: ManeviBayraklar = {
    ramazan: m === 9,
    kadir: m === 9 && d === 27,
    bayram: (m === 10 && d <= 3) || (m === 12 && d >= 10 && d <= 13),
    kandil:
      (m === 3 && d === 12) || // Mevlid
      (m === 7 && d === 27) || // Miraç
      (m === 8 && d === 15) || // Berat
      (m === 12 && d === 9) || // Arefe
      (m === 7 && serverDayOfWeek() === 5 && d <= 7), // Regaib (Recep'in ilk Cuma'sı)
  };
  return {
    kadir: elYazimi.kadir || hesap.kadir,
    kandil: elYazimi.kandil || hesap.kandil,
    bayram: elYazimi.bayram || hesap.bayram,
    ramazan: elYazimi.ramazan || hesap.ramazan,
  };
}

/** Sunucu saatine göre anlık manevi takvim durumu */
export function getHolyDayState(): HolyDayBannerState {
  const day = serverDayOfWeek();
  const todayIso = serverDateISO();

  const ozel = maneviBayraklar();
  const isKadir = ozel.kadir;
  const isKandil = ozel.kandil;
  const isBayram = ozel.bayram;
  const isRamazan = ozel.ramazan;

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
