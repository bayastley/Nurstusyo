import { useCallback } from "react";

export const GUEST_FREE_VIDEOS = 2;
/** Misafir üretimleri arası minimum bekleme (sn) — F5 spamine karşı hız freni. */
export const GUEST_COOLDOWN_SEC = 120;
/** Günlük mutlak üst sınır — localStorage silinse bile aynı günde daha fazlası imkansız değil
 *  ama sayacı sıfırlamak günde en fazla bu kadar video üretebilir (tımarbi maliyet üst sınırı). */
export const GUEST_DAILY_CAP = 4;

function readGuestUsed(): number {
  try {
    return Number(localStorage.getItem("nur_guest_videos") || 0);
  } catch {
    return 0;
  }
}

function writeGuestUsed(value: number): void {
  try {
    localStorage.setItem("nur_guest_videos", String(value));
  } catch {
    // ignore storage errors
  }
}

function readGuestDay(): string {
  try { return localStorage.getItem("nur_guest_day") || ""; } catch { return ""; }
}

function readGuestLastTs(): number {
  try { return Number(localStorage.getItem("nur_guest_last_ts") || 0); } catch { return 0; }
}

/** Bugünün tarih etiketi (yerel gün) — gün değişince sayaç çıpası tazelenir. */
function todayTag(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface GuestGateResult {
  allowed: boolean;
  reason?: "hak-bitti" | "günlük-sınır" | "bekle";
  remaining: number;
  retryAfterSec?: number;
}

/**
 * Misafir üretim kapısı: kalan hak + günlük katı üst sınır + cooldown'u tek yerden denetler.
 * NOT: Günlük üst sınır, sayaç silinse bile şöyle çalışır — bugün produced>=GUEST_DAILY_CAP
 * olduysa ve sayaç silinmişse dayAnchor kaydı da silinmiş olur; bu yüzden anchor'u AYRI anahtarlarla
 * (nur_guest_day) tutarız: iki anahtardan biri ayaktaysa sınır uygulanır. Silerse de aynı gün
 * içinde en fazla bir anchor yeniden yazılabilir: ilk üretimde day yeniden yazılır ve produced
 * yeniden sayılmaya başlar — yani kötü niyetli silme günde GUEST_DAILY_CAP kadar ekstra deneme
 * açar, sınırsız DEĞİL (sunucu tarafı oturumsuz R2 imza vermez; gerçek medya hırsızlığı engelli).
 */
export function checkGuestGate(): GuestGateResult {
  const used = readGuestUsed();
  const remaining = Math.max(0, GUEST_FREE_VIDEOS - used);
  if (remaining <= 0) return { allowed: false, reason: "hak-bitti", remaining: 0 };

  // Günlük üst sınır: bugün üretilen toplam >= cap ise kapan
  const day = readGuestDay();
  const today = todayTag();
  const dayCount = day === today ? Math.max(0, Number(localStorage.getItem("nur_guest_day_count") || 0)) : 0;
  if (dayCount >= GUEST_DAILY_CAP) return { allowed: false, reason: "günlük-sınır", remaining };

  // Cooldown: son üretimden bu yana en az GUEST_COOLDOWN_SEC geçmeli
  const elapsed = (Date.now() - readGuestLastTs()) / 1000;
  if (readGuestLastTs() > 0 && elapsed < GUEST_COOLDOWN_SEC) {
    return { allowed: false, reason: "bekle", remaining, retryAfterSec: Math.ceil(GUEST_COOLDOWN_SEC - elapsed) };
  }
  return { allowed: true, remaining };
}

/** Üretim kaydı: sayacı + gün çıpasını + zaman damgasını ilerletir. */
export function bumpGuestUsed(): void {
  const today = todayTag();
  const day = readGuestDay();
  const dayCount = day === today ? Math.max(0, Number(localStorage.getItem("nur_guest_day_count") || 0)) : 0;
  try {
    localStorage.setItem("nur_guest_videos", String(readGuestUsed() + 1));
    localStorage.setItem("nur_guest_day", today);
    localStorage.setItem("nur_guest_day_count", String(dayCount + 1));
    localStorage.setItem("nur_guest_last_ts", String(Date.now()));
  } catch {
    // ignore storage errors
  }
}