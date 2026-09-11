import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
type Tier = "free" | "pro" | "elit";
type CatId = typeof CATEGORY_IDS[number];
const CATEGORY_IDS = [
  "namaz", "musaf", "cicekler", "yildizlar", "deniz", "daglar", "gunbatimi", "gece", "selale", "orman", "col", "kar", "sehir", "cami", "desen", "gol", "bulut", "cennet", "ates", "cehennem", "hurma", "ari", "karinca",
] as const;
const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, elit: 2 };
const FREE_VIDEOS_PER_CATEGORY = 5;
const CATEGORY_TIER: Record<CatId, Tier> = {
  namaz: "free", musaf: "free", cicekler: "free", yildizlar: "free",
  deniz: "free", gunbatimi: "free", gece: "free", orman: "free",
  cami: "free", gol: "free", bulut: "free", desen: "free",
  selale: "pro", daglar: "pro", kar: "pro", sehir: "pro",
  cennet: "elit", col: "elit", ates: "elit",
  cehennem: "elit", hurma: "elit", ari: "elit", karinca: "elit",
};
const ALLOWED_ORIGINS = new Set(["http://localhost:5173", "http://localhost:5174", "https://nurstudyo.com", "https://www.nurstudyo.com"]);
const HITS = new Map<string, number[]>();

interface SessionUser {
  id: string;
  email: string;
  verified: boolean;
  isAdmin: boolean;
  tier?: Tier;
  exp: number;
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getSessionUser(req: VercelRequest): SessionUser | null {
  const cookie = String(req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const user = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionUser;
    if (!user.id || !user.email || !user.verified || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch {
    return null;
  }
}

async function loadServerAccess(userId: string): Promise<{ tier: Tier; isAdmin: boolean; banned: boolean } | null> {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^['"]+|['"]+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const userResponse = await fetch(`${url}/rest/v1/nur_users?id=eq.${encodeURIComponent(userId)}&select=tier,is_admin`, { headers, cache: "no-store" });
    if (!userResponse.ok) return null;
    const users = await userResponse.json() as Array<{ tier?: Tier; is_admin?: boolean }>;
    if (!users[0]) return null;
    const banResponse = await fetch(`${url}/rest/v1/nur_ban_logs?user_id=eq.${encodeURIComponent(userId)}&unbanned=eq.false&select=id&limit=1`, { headers, cache: "no-store" });
    if (!banResponse.ok) return null;
    const bans = await banResponse.json() as Array<{ id: string }>;
    return {
      tier: users[0].tier === "pro" || users[0].tier === "elit" ? users[0].tier : "free",
      isAdmin: users[0].is_admin === true,
      banned: bans.length > 0,
    };
  } catch {
    return null;
  }
}

const USER_HITS = new Map<string, number[]>();

function checkRateLimits(ip: string, userId: string): boolean {
  const now = Date.now();
  
  // 1. IP Limit (dakikada en fazla 15 imzalama isteği)
  const ipHits = (HITS.get(ip) || []).filter((hit) => now - hit < 60000);
  if (ipHits.length >= 15) return false;
  ipHits.push(now);
  HITS.set(ip, ipHits);
  
  // 2. Kullanıcı ID Limit (dakikada en fazla 15 imzalama isteği)
  if (userId) {
    const userHits = (USER_HITS.get(userId) || []).filter((hit) => now - hit < 60000);
    if (userHits.length >= 15) return false;
    userHits.push(now);
    USER_HITS.set(userId, userHits);
  }
  
  return true;
}

function canAccessClip(userTier: Tier, cat: CatId, clipIndex: number): boolean {
  const catTier = CATEGORY_TIER[cat];
  if (catTier === "elit" && TIER_RANK[userTier] < TIER_RANK.elit) return false;
  if (TIER_RANK[userTier] < TIER_RANK[catTier]) return false;
  if (clipIndex >= FREE_VIDEOS_PER_CATEGORY) {
    const nextTier: Tier = catTier === "free" ? "pro" : "elit";
    if (TIER_RANK[userTier] < TIER_RANK[nextTier]) return false;
  }
  return true;
}

const ALLOWED_CATEGORIES = new Set<string>(CATEGORY_IDS);

function isSafeCategory(value: unknown): value is CatId {
  return typeof value === "string" && (ALLOWED_CATEGORIES.has(value as CatId) || /^admin_[a-zA-Z0-9_]{2,100}$/.test(value));
}

function normalizePexelsId(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value < 100_000_000) return value;
  if (typeof value === "string" && /^\d{3,9}$/.test(value)) return Number(value);
  return null;
}

function isSafeClipId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{2,80}$/.test(value);
}

function clipIndexFromId(cat: string, clipId: string | null): number {
  const match = clipId?.match(new RegExp(`^${cat}-r(\\d+)$`));
  return match ? Math.max(0, Number(match[1]) - 1) : 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ ok: false, error: "İzin verilmeyen istek kaynağı" });
  }

  const sessionUser = getSessionUser(req);
  if (!sessionUser) return res.status(401).json({ ok: false, error: "Oturum gerekli" });

  // Çok sıkı IP/Kullanıcı Rate Limit (Scraping Engelleme)
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  if (!checkRateLimits(ip, sessionUser.id)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ ok: false, error: "İstek limitini aştınız. Lütfen dakikada en fazla 15 video imzalayın." });
  }

  try {
    const access = await loadServerAccess(sessionUser.id);
    if (!access) return res.status(503).json({ ok: false, error: "Yetki servisi kullanılamıyor" });
    if (access.banned) return res.status(403).json({ ok: false, error: "Bu hesap kullanıma kapatılmış" });
    const { clipId, pexelsId, cat } = req.body || {};
    if (!isSafeCategory(cat)) return res.status(400).json({ ok: false, error: "Geçersiz veya izinli olmayan kategori" });

    const normalizedPexelsId = normalizePexelsId(pexelsId);
    const normalizedClipId = isSafeClipId(clipId) ? clipId : null;
    if (normalizedPexelsId === null && !normalizedClipId) return res.status(400).json({ ok: false, error: "Geçersiz video kimliği" });
    const userTier: Tier = access.isAdmin ? "elit" : access.tier;
    if (!access.isAdmin && typeof cat === "string" && cat.startsWith("admin_") && userTier !== "elit") {
      return res.status(403).json({ ok: false, error: "Bu içerik yalnızca Elit üyeler içindir" });
    }
    const clipIndex = clipIndexFromId(cat, normalizedClipId);
    if (!canAccessClip(userTier, cat, clipIndex)) return res.status(403).json({ ok: false, error: "Bu içerik için üyelik seviyeniz yetersiz" });

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    const bucketName = process.env.R2_BUCKET_NAME || "nurstudyo";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
    const mediaId = normalizedPexelsId !== null ? String(normalizedPexelsId) : normalizedClipId!;
    const videoKey = `videos/${cat}/${mediaId}.mp4`;
    const posterKey = `posters/${cat}/${mediaId}.jpg`;

    if (accountId && accessKeyId && secretAccessKey) {
      if (!/^[a-zA-Z0-9]{16,64}$/.test(accountId)) return res.status(500).json({ ok: false, error: "R2 hesap yapılandırması geçersiz" });
      const s3Client = new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });
      const signedVideoUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucketName, Key: videoKey }), { expiresIn: 600 });
      const signedPosterUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucketName, Key: posterKey }), { expiresIn: 600 });
      return res.status(200).json({ ok: true, url: signedVideoUrl, posterUrl: signedPosterUrl, expiresAt: Date.now() + 600 * 1000 });
    }

    return res.status(503).json({ ok: false, error: "R2 medya servisi yapılandırılmamış" });
  } catch (error) {
    console.error("[R2 Presigned URL Error]", error);
    return res.status(500).json({ ok: false, error: "İmzalı video bağlantısı üretilemedi" });
  }
}
