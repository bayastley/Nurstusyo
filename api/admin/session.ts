import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

interface SessionAdmin {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  isAdmin: boolean;
  exp: number;
}

const HITS = new Map<string, number[]>();

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64");
}

function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getAdmin(req: VercelRequest): SessionAdmin | null {
  const rawCookie = String(req.headers.cookie || "");
  const cookie = rawCookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("nur_session="));
  if (!cookie) return null;

  const token = decodeURIComponent(cookie.slice("nur_session=".length));
  const [payload, signature] = token.split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;

  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const admin = JSON.parse(fromBase64Url(payload).toString("utf8")) as SessionAdmin;
    if (!admin.id || !admin.email || !admin.verified || !admin.isAdmin || admin.exp < Math.floor(Date.now() / 1000)) return null;
    return admin;
  } catch {
    return null;
  }
}

function allowRequest(req: VercelRequest, res: VercelResponse): boolean {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (HITS.get(ip) || []).filter((hit) => hit >= now - 60_000);
  if (hits.length >= 60) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ ok: false, error: "İstek işlenemedi" });
    return false;
  }
  hits.push(now);
  HITS.set(ip, hits);
  return true;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  if (!allowRequest(req, res)) return;

  const admin = getAdmin(req);
  if (!admin) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });

  return res.status(200).json({
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, verified: admin.verified },
  });
}
