interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  tier: "free" | "pro" | "elit";
  is_admin: boolean;
  updated_at?: string;
}

export interface DbWallet {
  user_id: string;
  sub_jeton: number;
  purchased_jeton: number;
}

function config(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(config());
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cfg = config();
  if (!cfg) throw new Error("SUPABASE_NOT_CONFIGURED");

  const response = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`SUPABASE_${response.status}_${text.slice(0, 160)}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function upsertUser(user: DbUser): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<DbUser[]>("/rest/v1/nur_users?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(user),
  });
  return rows[0] ?? null;
}

export async function getUser(userId: string): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<DbUser[]>(`/rest/v1/nur_users?id=eq.${encodeURIComponent(userId)}&select=*`, {
    method: "GET",
  });
  return rows[0] ?? null;
}

export async function ensureWallet(userId: string): Promise<DbWallet | null> {
  if (!isSupabaseConfigured()) return null;

  const existing = await request<DbWallet[]>(`/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
    method: "GET",
  });
  if (existing[0]) return existing[0];

  const rows = await request<DbWallet[]>("/rest/v1/nur_wallets", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, sub_jeton: 0, purchased_jeton: 0 }),
  });
  return rows[0] ?? null;
}

export async function getWallet(userId: string): Promise<DbWallet | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<DbWallet[]>(`/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
    method: "GET",
  });
  return rows[0] ?? null;
}

export async function grantPurchasedTokens(userId: string, amount: number): Promise<DbWallet | null> {
  if (!isSupabaseConfigured()) return null;
  await ensureWallet(userId);
  const wallet = await getWallet(userId);
  if (!wallet) return null;
  const rows = await request<DbWallet[]>(`/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      purchased_jeton: wallet.purchased_jeton + Math.max(0, Math.floor(amount)),
      updated_at: new Date().toISOString(),
    }),
  });
  return rows[0] ?? null;
}

export async function setUserTier(userId: string, tier: "free" | "pro" | "elit"): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request(`/rest/v1/nur_users?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ tier, updated_at: new Date().toISOString() }),
  });
}

export async function spendWallet(userId: string, amount: number): Promise<{ ok: boolean; balance?: number; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "SUPABASE_NOT_CONFIGURED" };
  const rows = await request<Array<{ ok: boolean; balance: number; error: string | null }>>("/rest/v1/rpc/nur_spend_wallet_tokens", {
    method: "POST",
    body: JSON.stringify({ p_user_id: userId, p_amount: amount }),
  });
  const result = rows[0];
  return { ok: Boolean(result?.ok), balance: result?.balance, error: result?.error || undefined };
}

export async function createOrder(input: {
  orderId: string;
  userId: string;
  productCode: string;
  amountMinor: number;
  currency: string;
  provider: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request("/rest/v1/nur_orders", {
    method: "POST",
    body: JSON.stringify({
      id: input.orderId,
      user_id: input.userId,
      product_code: input.productCode,
      amount_minor: input.amountMinor,
      currency: input.currency,
      provider: input.provider,
      status: "pending",
    }),
  });
}

export interface DbOrder {
  id: string;
  user_id: string;
  product_code: string;
  amount_minor: number;
  currency: string;
  provider: string;
  status: string;
}

export async function getOrder(orderId: string): Promise<DbOrder | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<DbOrder[]>(`/rest/v1/nur_orders?id=eq.${encodeURIComponent(orderId)}&select=*`, {
    method: "GET",
  });
  return rows[0] ?? null;
}

export async function markOrderPaid(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request(`/rest/v1/nur_orders?id=eq.${encodeURIComponent(orderId)}&status=eq.pending`, {
    method: "PATCH",
    body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
}

export async function grantProductToUser(input: {
  orderId: string;
  userId: string;
  grantTier?: "pro" | "elit";
  grantDays?: number;
  grantTokens?: number;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (input.grantTokens) await grantPurchasedTokens(input.userId, input.grantTokens);
  if (input.grantTier) {
    await setUserTier(input.userId, input.grantTier);
    await request("/rest/v1/nur_subscriptions", {
      method: "POST",
      body: JSON.stringify({
        user_id: input.userId,
        tier: input.grantTier,
        provider: "payment",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + (input.grantDays ?? 30) * 86400000).toISOString(),
        status: "active",
      }),
    });
  }
  await markOrderPaid(input.orderId);
}

export async function getActiveBan(userId: string, email: string): Promise<{ isBanned: boolean; reason: string }> {
  if (!isSupabaseConfigured()) return { isBanned: false, reason: "" };
  const q = `/rest/v1/nur_ban_logs?or=(user_id.eq.${encodeURIComponent(userId)},user_email.eq.${encodeURIComponent(email)})&unbanned.eq.false&select=reason&limit=1`;
  const rows = await request<Array<{ reason: string }>>(q, { method: "GET" });
  return { isBanned: Boolean(rows[0]), reason: rows[0]?.reason || "" };
}

export async function banUserInSupabase(input: { email: string; reason: string; bannedBy: string; userId?: string }): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request("/rest/v1/nur_ban_logs", {
    method: "POST",
    body: JSON.stringify({
      user_id: input.userId || null,
      user_email: input.email.toLowerCase(),
      reason: input.reason,
      banned_by: input.bannedBy,
      is_auto: false,
      unbanned: false,
    }),
  });
}

export async function unbanUserInSupabase(email: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request(`/rest/v1/nur_ban_logs?user_email=eq.${encodeURIComponent(email.toLowerCase())}&unbanned=eq.false`, {
    method: "PATCH",
    body: JSON.stringify({ unbanned: true }),
  });
}

export async function logAdminAction(input: { adminId: string; adminEmail: string; action: string; target?: string }): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request("/rest/v1/nur_admin_audit_logs", {
    method: "POST",
    body: JSON.stringify({
      admin_id: input.adminId,
      admin_email: input.adminEmail,
      action: input.action,
      target: input.target || "",
    }),
  });
}

// ═══ ADMIN YÖNETİM FONKSİYONLARI (server-side, service role ile) ═══

export async function listUsers(): Promise<DbUser[]> {
  if (!isSupabaseConfigured()) return [];
  return request<DbUser[]>("/rest/v1/nur_users?select=*&order=updated_at.desc&limit=200", { method: "GET" });
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<DbUser[]>(`/rest/v1/nur_users?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`, {
    method: "GET",
  });
  return rows[0] ?? null;
}

export async function banUserInDb(input: {
  userId: string | null;
  email: string;
  reason: string;
  bannedBy: string;
  isAuto?: boolean;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request("/rest/v1/nur_ban_logs", {
    method: "POST",
    body: JSON.stringify({
      user_id: input.userId,
      user_email: input.email.toLowerCase(),
      reason: input.reason,
      banned_by: input.bannedBy,
      is_auto: Boolean(input.isAuto),
      unbanned: false,
    }),
  });
}

export async function unbanUserInDb(email: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request(`/rest/v1/nur_ban_logs?user_email=eq.${encodeURIComponent(email.toLowerCase())}&unbanned=eq.false`, {
    method: "PATCH",
    body: JSON.stringify({ unbanned: true }),
  });
}

export async function setWalletTotal(userId: string, total: number): Promise<DbWallet | null> {
  if (!isSupabaseConfigured()) return null;
  await ensureWallet(userId);
  const wallet = await getWallet(userId);
  if (!wallet) return null;
  const safeTotal = Math.max(0, Math.floor(total));
  const purchased = Math.max(0, safeTotal - wallet.sub_jeton);
  const rows = await request<DbWallet[]>(`/rest/v1/nur_wallets?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ purchased_jeton: purchased, updated_at: new Date().toISOString() }),
  });
  return rows[0] ?? null;
}
