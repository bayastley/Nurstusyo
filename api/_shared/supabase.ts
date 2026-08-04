interface UserInput { id: string; email: string; name: string; picture?: string; tier?: string; is_admin?: boolean }
interface OrderInput { orderId: string; userId: string; productCode: string; amountMinor: number; currency: string; provider: string }

function config() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

export async function getUser(id: string) {
  const rows = await request<any[]>(`nur_users?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows[0] ?? null;
}

export async function upsertUser(user: UserInput) {
  const rows = await request<any[]>("nur_users?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ ...user, updated_at: new Date().toISOString() }) });
  return rows[0] ?? null;
}

export async function ensureWallet(userId: string) {
  const rows = await request<any[]>("nur_wallets?on_conflict=user_id", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify({ user_id: userId }) });
  return rows[0] ?? await getWallet(userId);
}

export async function getWallet(userId: string) {
  const rows = await request<any[]>(`nur_wallets?user_id=eq.${encodeURIComponent(userId)}&select=*`);
  return rows[0] ?? null;
}

export async function getActiveBan(userId: string, email: string) {
  const rows = await request<any[]>(`nur_ban_logs?or=(user_id.eq.${encodeURIComponent(userId)},user_email.eq.${encodeURIComponent(email)})&unbanned=eq.false&order=created_at.desc&limit=1&select=*`);
  const row = rows[0];
  return row ? { isBanned: true, reason: row.reason } : { isBanned: false, reason: "" };
}

export async function logAdminAction(data: { adminId: string; adminEmail: string; action: string; target?: string }) {
  return request("nur_admin_audit_logs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ admin_id: data.adminId, admin_email: data.adminEmail, action: data.action, target: data.target || "" }) });
}

export async function banUserInSupabase(data: { email: string; userId?: string; reason: string; bannedBy: string }) {
  return request("nur_ban_logs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: data.userId || null, user_email: data.email.toLowerCase(), reason: data.reason, banned_by: data.bannedBy, is_auto: data.bannedBy.includes("Sistem") }) });
}

export async function unbanUserInSupabase(email: string) {
  return request(`nur_ban_logs?user_email=eq.${encodeURIComponent(email.toLowerCase())}&unbanned=eq.false`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ unbanned: true }) });
}

export async function createOrder(data: OrderInput) {
  return request("nur_orders", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: data.orderId, user_id: data.userId, product_code: data.productCode, amount_minor: data.amountMinor, currency: data.currency, provider: data.provider }) });
}

export async function getOrder(orderId: string) {
  const rows = await request<any[]>(`nur_orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
  return rows[0] ?? null;
}

export async function grantProductToUser(data: { orderId: string; userId: string; grantTier?: string; grantDays?: number; grantTokens?: number }) {
  const order = await getOrder(data.orderId);
  if (order?.status === "paid") return order;
  if (data.grantTokens) {
    const wallet = await ensureWallet(data.userId);
    await request(`nur_wallets?user_id=eq.${encodeURIComponent(data.userId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ purchased_jeton: Number(wallet?.purchased_jeton || 0) + data.grantTokens, updated_at: new Date().toISOString() }) });
  }
  if (data.grantTier === "pro" || data.grantTier === "elit") {
    const ends = new Date(Date.now() + Number(data.grantDays || 30) * 86400000).toISOString();
    await request("nur_subscriptions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: data.userId, tier: data.grantTier, provider: order?.provider || "manual", ends_at: ends }) });
    await request(`nur_users?id=eq.${encodeURIComponent(data.userId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ tier: data.grantTier, updated_at: new Date().toISOString() }) });
  }
  return request(`nur_orders?id=eq.${encodeURIComponent(data.orderId)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
}

export async function spendWallet(userId: string, cost: number) {
  const rows = await request<Array<{ ok: boolean; balance: number; error: string | null }>>("rpc/nur_spend_wallet_tokens", { method: "POST", body: JSON.stringify({ p_user_id: userId, p_amount: cost }) });
  return rows[0] ?? { ok: false, error: "WALLET_ERROR", balance: 0 };
}

export async function claimReward(userId: string, rewardKey: string, amount: number) {
  const rows = await request<Array<{ ok: boolean; balance: number; error: string | null }>>("rpc/nur_claim_reward", { method: "POST", body: JSON.stringify({ p_user_id: userId, p_reward_key: rewardKey, p_amount: amount }) });
  return rows[0] ?? { ok: false, error: "REWARD_ERROR", balance: 0 };
}
