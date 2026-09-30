// ════════════════════════════════════════════════════════
// ADMINCONFIG.TS — İstemci tarafı admin yapılandırması
// tier.ts'den ayrıldı (SRP parçalama adım 1b, 30.09)
// ⚠️ YETKİ SUNUCUDA (api/admin/session.ts): HMAC → env whitelist → DB is_admin.
//    Buradaki liste yalnızca UI görünürlük katmanıdır ("ADMIN OLARAK GERİ DÖN"
//    butonu, admin pill gizleme gibi). Bu liste kimse admin yapmaz.
// ════════════════════════════════════════════════════════

export const ADMIN_SECRET_PATH = "/admin";
export const ALLOWED_ADMIN_EMAILS = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_NUR_ADMIN_EMAIL ?? "")
  .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);

export function isAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

const ADMIN_SESSION_KEY = "nur_admin_session";
export function getAdminSession(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}
export function setAdminSession(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(ADMIN_SESSION_KEY, "1");
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}
