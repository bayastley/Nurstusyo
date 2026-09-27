# ═══════════════════════════════════════════════════════════
# AÇIK 2 (ORTA) — Rate limit'leri paylaşımlı store'a geçir
# Tüm api/*.ts içindeki gömülü in-memory limiter'ları Upstash
# destekli async çekirdekle değiştirir; çağrıları await'ler.
# Çalıştır: python scripts/rl_guncelle.py
# ═══════════════════════════════════════════════════════════
import re, os, io

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "api")

CORE = '''// ★ PAYLAŞIMLI RATE LIMIT (Açık 2) — Upstash Redis varsa instance'lar arası
//   ortak sayaç (UPSTASH_REDIS_REST_URL/TOKEN env), yoksa in-memory fallback.
const __RL_MAP = new Map<string, number[]>();
const __RL_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\\/+$/, "");
const __RL_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const __RL_SHARED = __RL_URL.length > 0 && __RL_TOKEN.length > 0;
function __rlIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }): string {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}
function __rlMem(bucketKey: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const active = (__RL_MAP.get(bucketKey) || []).filter((h) => h >= now - windowMs);
  if (active.length >= max) { __RL_MAP.set(bucketKey, active); return false; }
  active.push(now);
  __RL_MAP.set(bucketKey, active);
  if (__RL_MAP.size > 5000) { for (const k of __RL_MAP.keys()) { __RL_MAP.delete(k); if (__RL_MAP.size <= 2500) break; } }
  return true;
}
async function __rlShared(bucketKey: string, windowMs: number): Promise<number | null> {
  if (!__RL_SHARED) return null;
  try {
    const res = await fetch(`${__RL_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${__RL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `rl:${bucketKey}`], ["EXPIRE", `rl:${bucketKey}`, String(Math.ceil(windowMs / 1000)), "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ result: unknown }>;
    return Number(json[0]?.result ?? 1);
  } catch { return null; }
}
async function rateLimit(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: unknown) => void } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) {
    if (hits > maxRequests) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); return false; }
    return true;
  }
  const ok = __rlMem(bucketKey, maxRequests, windowMs);
  if (!ok) { res.setHeader("Retry-After", "60"); res.setHeader("Cache-Control", "no-store"); res.status(429).json({ ok: false, error: "İstek işlenemedi" }); }
  return ok;
}
async function rateLimitSilent(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string | null } }, key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const bucketKey = `${key}:${__rlIp(req)}`;
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}
async function rateLimitBucket(bucketKey: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const hits = await __rlShared(bucketKey, windowMs);
  if (hits !== null) return hits <= maxRequests;
  return __rlMem(bucketKey, maxRequests, windowMs);
}
'''

changed, missed = [], []

def read(p):
    with io.open(p, "r", encoding="utf-8") as f:
        return f.read()

def write(p, t):
    with io.open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)

def swap_core(text, path, map_lines):
    """Eski map satırını CORE ile değiştir, eski rateLimit/rateLimitSilent fn'lerini sil."""
    found_map = False
    for ml in map_lines:
        if ml in text:
            text = text.replace(ml, CORE, 1)
            found_map = True
            break
    if not found_map:
        missed.append((path, "map-line yok"))
        return text, False
    text = re.sub(r'\nfunction rateLimit\(.*?\n\}\n', '\n', text, count=1, flags=re.S)
    text = re.sub(r'\nfunction rateLimitSilent\(.*?\n\}\n', '\n', text, count=1, flags=re.S)
    return text, True

def fix_calls(text):
    text = re.sub(r'if \(!rateLimit\((.*?)\)\) return', r'if (!(await rateLimit(\1))) return', text)
    text = re.sub(r'if \(!rateLimitSilent\((.*?)\)\) \{', r'if (!(await rateLimitSilent(\1))) {', text)
    text = re.sub(r'if \(!allowRequest\(req, res\)\) return;', 'if (!(await allowRequest(req, res))) return;', text)
    return text

# ── 1) rateLimit/rateLimitSilent ailesi (14 dosya + webhook + render) ──
FAMILY = [
    "config.ts", "roadmap.ts", "rewards/claim.ts", "ban/report.ts",
    "admin/kill-session.ts", "push/subscribe.ts", "push/send.ts",
    "marketing/consent.ts", "marketing/send-campaign.ts", "marketing/feedback.ts",
    "analytics/track.ts", "analytics/error.ts",
    "payments/callback.ts", "payments/wallet.ts",
    "payments/webhook.ts", "render/authorize.ts",
]
MAP_LINES = [
    'const __buckets = new Map<string, { hits: number[] }>();',
    'const buckets = new Map<string, number[]>();',
]
for rel in FAMILY:
    p = os.path.join(ROOT, rel)
    text = read(p)
    before = text
    text, ok = swap_core(text, rel, MAP_LINES)
    if ok:
        text = fix_calls(text)
        if text != before:
            write(p, text)
            changed.append(rel)

# ── 2) allowRequest ailesi (tüm gövdeyi değiştir) ──
ALLOW_FULL = {
    "auth/me.ts":        ("auth:me", 120, 'A'),
    "admin/session.ts":  ("admin:session", 60, 'A'),
    "ban/status.ts":     ("ban:status", 30, 'A'),
    "live/kabe.ts":      ("live:kabe", 240, 'A'),
    "payments/create.ts":("payments:create", 10, 'B'),
    "payments/verify.ts":("payments:verify", 15, 'B'),
}
for rel, (key, mx, variant) in ALLOW_FULL.items():
    p = os.path.join(ROOT, rel)
    text = read(p)
    before = text
    sig = ('function allowRequest(req: VercelRequest, res: VercelResponse): boolean {'
           if variant == 'A' else 'function allowRequest(req: any, res: any): boolean {')
    newfn = ('\n' + CORE +
             f'\nasync function allowRequest(req: VercelRequest, res: VercelResponse): Promise<boolean> {{\n  return rateLimit(req, res, "{key}", {mx}, 60_000);\n}}\n')
    if variant == 'B':
        newfn = ('\n' + CORE +
                 f'\nasync function allowRequest(req: any, res: any): Promise<boolean> {{\n  return rateLimit(req, res, "{key}", {mx}, 60_000);\n}}\n')
    m = re.search(re.escape(sig) + r'.*?\n\}\n', text, re.S)
    if not m:
        missed.append((rel, "allowRequest imzası yok"))
        continue
    text = text[:m.start()] + newfn + text[m.end():]
    # eski hit map'lerini sil
    text = re.sub(r'^const (HITS|AUTH_HITS|RATE_HITS|RATE_WINDOW_MS|RATE_MAX_REQ)[^\n]*\n', '', text, flags=re.M)
    text = fix_calls(text)
    if text != before:
        write(p, text)
        changed.append(rel)

# ── 3) google + logout: origin kontrolü KALIR, sadece limiter kuyruğu değişir ──
for rel, key, mx, hitmap in [("auth/google.ts", "auth:google", 10, "AUTH_HITS"), ("auth/logout.ts", "auth:logout", 20, "HITS")]:
    p = os.path.join(ROOT, rel)
    text = read(p)
    before = text
    tail = re.compile(
        r'\n  const ip = String\(req\.headers\["x-forwarded-for"\][^\n]*\n'
        r'  const now = Date\.now\(\);\n'
        r'  const hits = \(' + hitmap + r'\.get\(ip\) \|\| \[\]\)\.filter\(\(hit\) => hit >= now - 60_000\);\n'
        r'  if \(hits\.length >= \d+\) \{\n[^}]*\}\n'
        r'  hits\.push\(now\);\n'
        r'  ' + hitmap + r'\.set\(ip, hits\);\n'
        r'  return true;\n\}\n', re.S)
    newtail = f'\n  return rateLimit(req, res, "{key}", {mx}, 60_000);\n}}\n'
    text, n = tail.subn(newtail, text, count=1)
    if n == 0:
        missed.append((rel, "limiter kuyruğu yok"))
        continue
    text = text.replace('function allowRequest(req: VercelRequest, res: VercelResponse): boolean {',
                        CORE + '\nasync function allowRequest(req: VercelRequest, res: VercelResponse): Promise<boolean> {', 1)
    text = re.sub(r'^const (HITS|AUTH_HITS) = new Map<string, number\[\]>\(\);\n', '', text, flags=re.M)
    text = fix_calls(text)
    if rel == "auth/logout.ts":
        text = text.replace('export default function handler(req: VercelRequest, res: VercelResponse) {',
                            'export default async function handler(req: VercelRequest, res: VercelResponse) {', 1)
    if text != before:
        write(p, text)
        changed.append(rel)

# ── 4) admin/action.ts — adminRateLimit paylaşımlı ──
p = os.path.join(ROOT, "admin/action.ts")
text = read(p); before = text
old_block = re.compile(r'// In-memory rate limit \(per admin session\)\nconst rateLimitMap = new Map<string, \{ hits: number\[\] \}>\(\);\n\nfunction adminRateLimit\(adminId: string, max = 100, windowMs = 60000\): boolean \{.*?\n\}\n', re.S)
new_block = CORE + '\nasync function adminRateLimit(adminId: string, max = 100, windowMs = 60000): Promise<boolean> {\n  return rateLimitBucket(`admin:action:${adminId}`, max, windowMs);\n}\n'
text, n = old_block.subn(new_block, text, count=1)
if n:
    text = text.replace('if (!adminRateLimit(admin.id, 100, 60000)) {', 'if (!(await adminRateLimit(admin.id, 100, 60000))) {', 1)
    write(p, text); changed.append("admin/action.ts")
else:
    missed.append(("admin/action.ts", "adminRateLimit bloğu yok"))

# ── 5) video/sign.ts — IP+userId limitleri paylaşımlı ──
p = os.path.join(ROOT, "video/sign.ts")
text = read(p); before = text
text = text.replace('const HITS = new Map<string, number[]>();\n', '', 1)
old_block = re.compile(r'const USER_HITS = new Map<string, number\[\]>\(\);\n\nfunction checkRateLimits\(ip: string, userId: string\): boolean \{.*?\n\}\n', re.S)
new_block = CORE + '\nasync function checkRateLimits(req: VercelRequest, ip: string, userId: string): Promise<boolean> {\n  if (!(await rateLimitBucket(`video:sign:ip:${ip}`, 60, 60_000))) return false;\n  if (userId && !(await rateLimitBucket(`video:sign:user:${userId}`, 45, 60_000))) return false;\n  return true;\n}\n'
text, n = old_block.subn(new_block, text, count=1)
if n:
    text = text.replace('if (!checkRateLimits(ip, sessionUser.id)) {', 'if (!(await checkRateLimits(req, ip, sessionUser.id))) {', 1)
    write(p, text); changed.append("video/sign.ts")
else:
    missed.append(("video/sign.ts", "checkRateLimits bloğu yok"))

# ── 6) ai/title-generate.ts — globalThis havuzu paylaşımlı ──
p = os.path.join(ROOT, "ai/title-generate.ts")
text = read(p); before = text
old_block = re.compile(r'  // ★ Basit rate limit[^\n]*\n  const rlBuckets[^\n]*\n[^\n]*__titleRl[^\n]*\n  const rlKey[^\n]*\n  const now[^\n]*\n  const recent[^\n]*\n  if \(recent\.length >= 10\) \{\n[^}]*\}\n  recent\.push\(now\);\n  rlBuckets\.set\(rlKey, recent\);\n', re.S)
new_block = '  if (!(await rateLimitBucket(`ai:title:${user.id}`, 10, 60_000))) {\n    res.status(429).json({ error: "Çok fazla istek. Lütfen biraz bekleyin." });\n    return;\n  }\n'
text, n = old_block.subn(new_block, text, count=1)
if n:
    text = text.replace('export default async function handler(req: VercelRequest, res: VercelResponse) {',
                        CORE + '\nexport default async function handler(req: VercelRequest, res: VercelResponse) {', 1)
    write(p, text); changed.append("ai/title-generate.ts")
else:
    missed.append(("ai/title-generate.ts", "globalThis RL bloğu yok"))

# ── 7) ai/kissa-generate.ts — isRateLimited paylaşımlı ──
p = os.path.join(ROOT, "ai/kissa-generate.ts")
text = read(p); before = text
old_block = re.compile(r'// ─── RATE LIMIT ─+[^\n]*\nconst RATE_LIMIT_KEY[^\n]*\nconst RATE_LIMIT_MAX[^\n]*\nconst RATE_LIMIT_WINDOW[^\n]*\nconst rateLimitMap = new Map<string, number\[\]>\(\);\n\nfunction isRateLimited\(ip: string\): boolean \{.*?\n\}\n', re.S)
new_block = CORE + '\nasync function isRateLimited(ip: string): Promise<boolean> {\n  return !(await rateLimitBucket(`ai:kissa:${ip}`, 10, 3_600_000));\n}\n'
text, n = old_block.subn(new_block, text, count=1)
if n:
    text = text.replace('if (isRateLimited(`${user.id}:${clientIp}`)) {', 'if (await isRateLimited(`${user.id}:${clientIp}`)) {', 1)
    write(p, text); changed.append("ai/kissa-generate.ts")
else:
    missed.append(("ai/kissa-generate.ts", "isRateLimited bloğu yok"))

print("DEGISTI (%d):" % len(changed))
for c in changed: print("  +", c)
print("ATLANDI (%d):" % len(missed))
for m_, why in missed: print("  !", m_, "->", why)
