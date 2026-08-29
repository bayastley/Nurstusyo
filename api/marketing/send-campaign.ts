import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

declare const process: { env: Record<string, string | undefined> };

// ════════════════════════════════════════════════════════
// EMAIL KAMPANYA GÖNDERİMİ — sadece admin tetikler.
//
// ★ MALİYET: 0 TL. Resend.com ücretsiz planı (ayda 3.000 e-posta,
//   günde 100) kullanılır — şu anki kullanıcı sayınız (9 kişi) için
//   fazlasıyla yeterlidir. RESEND_API_KEY ortam değişkeni tanımlı
//   değilse bu endpoint devre dışı kalır, siteyi BOZMAZ.
//
// SADECE consented=true olan (nur_marketing_consent tablosunda
// açıkça izin vermiş) kullanıcılara gönderim yapılır — KVKK'ya
// uygun, izin vermeyenlere ASLA e-posta gitmez.
// ════════════════════════════════════════════════════════

function base64Url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function adminFromCookie(req: VercelRequest): { email: string; isAdmin: boolean } | null {
  const cookie = String(req.headers.cookie || "").split(";").map((p) => p.trim()).find((p) => p.startsWith("nur_session="));
  if (!cookie) return null;
  const [payload, signature] = decodeURIComponent(cookie.slice("nur_session=".length)).split(".");
  const secret = process.env.NUR_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET || "";
  if (!payload || !signature || secret.length < 20) return null;
  const expected = base64Url(crypto.createHmac("sha256", secret).update(payload).digest());
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
    const admin = JSON.parse(Buffer.from(normalized + pad, "base64").toString("utf8"));
    return admin.isAdmin && admin.verified ? admin : null;
  } catch {
    return null;
  }
}

function supabaseConfig() {
  // ★ URL NORMALİZASYONU (fetch failed çözümü)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/^["']+|["']+$/g, "").replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase sunucu ayarları eksik");
  return { url, key };
}

async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return (text ? JSON.parse(text) : null) as T;
}

function sanitize(input: unknown, max: number): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const admin = adminFromCookie(req);
  if (!admin) return res.status(403).json({ ok: false, error: "Admin yetkisi gerekli" });

  const resendKey = process.env.RESEND_API_KEY || "";
  if (!resendKey) {
    return res.status(503).json({
      ok: false,
      error: "Email gönderimi henüz aktif değil. Vercel > Environment Variables kısmına ücretsiz Resend.com hesabından alacağınız RESEND_API_KEY değerini ekleyin.",
    });
  }

  const subject = sanitize((req.body || {}).subject, 150);
  const html = sanitize((req.body || {}).html, 20000);
  const fromEmail = process.env.MARKETING_FROM_EMAIL || "Nûr Stüdyo <bildirim@nurstudyo.com>";

  if (!subject || !html) {
    return res.status(400).json({ ok: false, error: "Konu ve içerik gerekli" });
  }

  try {
    // Sadece açıkça izin vermiş (consented=true) kullanıcıları çek.
    const consented = await db<any[]>("nur_marketing_consent?consented=eq.true&select=email");
    const emails = Array.from(new Set(consented.map((row) => String(row.email).toLowerCase()).filter(Boolean)));

    if (emails.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: "İzin veren kullanıcı yok, gönderim yapılmadı" });
    }

    // Resend toplu gönderim: BCC yerine her alıcıya ayrı "to" ile tek tek istek
    // (gizlilik için alıcılar birbirini görmemeli). Küçük listelerde (<100) sorun değil.
    let sentCount = 0;
    for (const email of emails.slice(0, 500)) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: fromEmail, to: [email], subject, html }),
        });
        if (response.ok) sentCount += 1;
      } catch {
        // tek bir alıcıda hata olursa diğerlerini engellemez
      }
    }

    await db("nur_email_campaigns", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ subject, sent_count: sentCount, sent_by: admin.email }),
    }).catch(() => undefined);

    return res.status(200).json({ ok: true, sent: sentCount, total: emails.length });
  } catch (error) {
    console.error("[Marketing Campaign Error]", error);
    return res.status(500).json({ ok: false, error: "Kampanya gönderilemedi" });
  }
}
