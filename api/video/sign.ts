import type { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ALL_CLIPS, CATEGORIES, KATEGORI_TIER, FREE_VIDEOS_PER_CATEGORY, type CatId } from "../../src/clips";
import { QURAN_CLIPS } from "../../src/clips-r2";
import { requireAuth } from "../_shared/auth.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireAllowedOrigin } from "../_shared/security.ts";
import { getUser } from "../_shared/supabase.ts";

type Tier = "free" | "pro" | "elit";
const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, elit: 2 };

function canAccessClip(userTier: Tier, cat: CatId, clipIndex: number): boolean {
  const catTier = (KATEGORI_TIER[cat] ?? "free") as Tier;
  if (catTier === "elit" && TIER_RANK[userTier] < TIER_RANK.elit) return false;
  if (TIER_RANK[userTier] < TIER_RANK[catTier]) return false;
  if (clipIndex >= FREE_VIDEOS_PER_CATEGORY) {
    const nextTier: Tier = catTier === "free" ? "pro" : "elit";
    if (TIER_RANK[userTier] < TIER_RANK[nextTier]) return false;
  }
  return true;
}

const ALLOWED_CATEGORIES = new Set<CatId>(CATEGORIES.map((category) => category.id));
const KNOWN_MEDIA = [...ALL_CLIPS, ...QURAN_CLIPS] as Array<{ id?: string; cat?: string; pexelsId?: number }>;

function isSafeCategory(value: unknown): value is CatId {
  return typeof value === "string" && ALLOWED_CATEGORIES.has(value as CatId);
}

function normalizePexelsId(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value < 100_000_000) return value;
  if (typeof value === "string" && /^\d{3,9}$/.test(value)) return Number(value);
  return null;
}

function isSafeClipId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{2,80}$/.test(value);
}

function isKnownClip(cat: string, clipId: string | null, pexelsId: number | null): boolean {
  return KNOWN_MEDIA.some((clip) => {
    if (clip.cat !== cat) return false;
    if (pexelsId !== null && clip.pexelsId === pexelsId) return true;
    return Boolean(clipId && clip.id === clipId);
  });
}

function cleanPublicUrl(value: string): string {
  try {
    const url = new URL(value || "https://nurstudyo.com");
    return url.protocol === "https:" ? url.origin : "https://nurstudyo.com";
  } catch {
    return "https://nurstudyo.com";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!requireAllowedOrigin(req, res)) return;
  if (!rateLimit(req, res, "video:sign", 120, 60_000)) return;

  try {
    const sessionUser = requireAuth(req, res);
    if (!sessionUser) return;
    const { clipId, pexelsId, cat } = req.body || {};
    if (!isSafeCategory(cat)) return res.status(400).json({ ok: false, error: "Geçersiz veya izinli olmayan kategori" });

    const normalizedPexelsId = normalizePexelsId(pexelsId);
    const normalizedClipId = isSafeClipId(clipId) ? clipId : null;
    if (normalizedPexelsId === null && !normalizedClipId) return res.status(400).json({ ok: false, error: "Geçersiz video kimliği" });
    if (!isKnownClip(cat, normalizedClipId, normalizedPexelsId)) return res.status(403).json({ ok: false, error: "Bu video kütüphanede kayıtlı değil" });

    const dbUser = await getUser(sessionUser.id).catch(() => null);
    const userTier: Tier = sessionUser.isAdmin || dbUser?.is_admin ? "elit" : dbUser?.tier === "pro" || dbUser?.tier === "elit" ? dbUser.tier : "free";
    const clipIndex = KNOWN_MEDIA.findIndex((clip) => clip.cat === cat && ((normalizedPexelsId !== null && clip.pexelsId === normalizedPexelsId) || (normalizedClipId !== null && clip.id === normalizedClipId)));
    if (clipIndex < 0 || !canAccessClip(userTier, cat, clipIndex)) return res.status(403).json({ ok: false, error: "Bu içerik için üyelik seviyeniz yetersiz" });

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    const bucketName = process.env.R2_BUCKET_NAME || "nurstudyo";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
    const publicUrl = cleanPublicUrl(process.env.R2_PUBLIC_URL || "https://nurstudyo.com");
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

    return res.status(200).json({ ok: true, url: `${publicUrl}/${videoKey}`, posterUrl: `${publicUrl}/${posterKey}`, expiresAt: Date.now() + 600 * 1000 });
  } catch (error) {
    console.error("[R2 Presigned URL Error]", error);
    return res.status(500).json({ ok: false, error: "İmzalı video bağlantısı üretilemedi" });
  }
}
