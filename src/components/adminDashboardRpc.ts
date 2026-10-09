// ════════════════════════════════════════════════════════
// ADMIN DASHBOARD RPC YARDIMCILARI — AdminDashboardModal'dan taşındı
// (SRP parçalama, 09.10)
// Tek amacı: /api/admin/action REST katmanını THEK TEK yeri üzerinden çağırmak.
// AdminDashboardModal'daki bileşenler sadece state + UI işleriyle uğraşır.
// ════════════════════════════════════════════════════════

export type NotifyFn = (msg: string) => void;

/** Admin aksiyonunun sunucu tarafında doğru yetkiye sahip olduğunu onaylar.
 *  Yetki hatalarında notify eder; site her durumda çalışsın diye sessiz hata yok. */
export async function assertAdminAction(
  action: string,
  notify: NotifyFn,
  target?: string,
  reason?: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/action", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, target, reason }),
    });
    const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) {
      notify(data?.error || "Admin yetkisi doğrulanamadı");
      return false;
    }
    return true;
  } catch {
    notify("Admin yetkisi için sunucuya ulaşılamadı");
    return false;
  }
}

/** ★ Gerçek işlemi server üzerinden Supabase'e yazar.
 *  /api/admin/action tüm yönetimsel işlemleri (tier, jeton, ban, lock) işler.
 *  503 = Supabase henüz bağlı değil → local fallback devam eder. */
export async function serverManage(
  action: string,
  payload: Record<string, unknown>,
  notify: NotifyFn
): Promise<"done" | "fallback" | "error"> {
  try {
    const response = await fetch("/api/admin/action", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, target: payload.email || payload.featureId || "", ...payload }),
    });
    if (response.status === 503) return "fallback";
    const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) {
      notify(data?.error || "Yönetim işlemi tamamlanamadı");
      return "error";
    }
    return "done";
  } catch {
    return "fallback";
  }
}

/** ★ HATA ALARMI ANKETİ — son 24 saatteki hata istatistiğini yükler. */
export async function hataAlarmiOku(): Promise<{ total24h: number; unique24h: number; turDagilimi?: Record<string, number> } | null> {
  try {
    const response = await fetch("/api/admin/action", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list_errors" }),
    });
    const data = await response.json().catch(() => null) as any;
    if (data?.ok && data.stats) return data.stats;
    return null;
  } catch { return null; }
}

/** ★ TÜR BAZLI ÜRETİM HAKKI (04.10) — seçili kullanıcının kalan haklarını çek */
export async function videoHaklariniOku(email: string): Promise<{ kisa: number; uzun: number; tam: number }> {
  try {
    const response = await fetch("/api/admin/action", {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_video_rights", target: email.trim().toLowerCase() }),
    });
    const data = await response.json().catch(() => null) as { ok?: boolean; rights?: { kisa: number; uzun: number; tam: number } } | null;
    return data?.ok && data.rights ? data.rights : { kisa: 0, uzun: 0, tam: 0 };
  } catch { return { kisa: 0, uzun: 0, tam: 0 }; }
}
