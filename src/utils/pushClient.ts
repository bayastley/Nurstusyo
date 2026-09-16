// ═══════════════════════════════════════════════════════════
// pushClient — Öğüt Vakti push aboneliği (istemci tarafı)
// Akış: izin → service worker ile subscribe → sunucuya kayıt.
// iOS: push yalnızca "Ana Ekrana Ekle" sonrası çalışır (16.4+).
// ═══════════════════════════════════════════════════════════

const ABONELIK_KEY = "nur_push_abonelik";

export function pushDestekliyor(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export function pushAbonelikDurumu(): boolean {
  try { return localStorage.getItem(ABONELIK_KEY) === "1"; } catch { return false; }
}

export function iosUyarisi(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const kurulu = (navigator as any).standalone === true; // ana ekrandan açıldı mı
  return ios && !kurulu;
}

/** Aboneliği kur: izin ister, subscribe eder, sunucuya yazar. Hata mesajıyla döner. */
export async function pushAboneOl(): Promise<{ ok: boolean; error?: string }> {
  if (!pushDestekliyor()) return { ok: false, error: "Tarayıcın push bildirimleri desteklemiyor" };

  // 1) İzin
  const izin = await Notification.requestPermission();
  if (izin !== "granted") return { ok: false, error: "Bildirim izni verilmedi — tarayıcı ayarlarından açabilirsin" };

  // 2) VAPID public key
  let publicKey = "";
  try {
    const res = await fetch("/api/push/subscribe");
    const data = await res.json();
    if (!data?.ok || !data.publicKey) return { ok: false, error: "Sunucu push yapılandırması eksik" };
    publicKey = data.publicKey;
  } catch { return { ok: false, error: "Sunucuya ulaşılamadı" }; }

  // 3) Subscribe
  try {
    const reg = await navigator.serviceWorker.ready;
    const urlBase64ToUint8 = (base64: string) => {
      const padding = "=".repeat((4 - (base64.length % 4)) % 4);
      const base64Url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
      const raw = atob(base64Url);
      return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
    };
    const mevcut = await reg.pushManager.getSubscription();
    const abonelik = mevcut ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8(publicKey),
    });

    // 4) Sunucuya kaydet
    const json = abonelik.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    const kayit = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    });
    if (!kayit.ok) return { ok: false, error: "Abonelik kaydedilemedi" };

    try { localStorage.setItem(ABONELIK_KEY, "1"); } catch { /* ignore */ }
    return { ok: true };
  } catch {
    return { ok: false, error: "Abonelik kurulamadı — tarayıcı push'a izin vermiyor olabilir" };
  }
}

/** Aboneliği kaldır: hem tarayıcıdan hem sunucudan siler. */
export async function pushAbonelikIptal(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const abonelik = await reg.pushManager.getSubscription();
    if (abonelik) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: abonelik.endpoint }),
      }).catch(() => undefined);
      await abonelik.unsubscribe().catch(() => undefined);
    }
  } catch { /* ignore */ }
  try { localStorage.removeItem(ABONELIK_KEY); } catch { /* ignore */ }
}
