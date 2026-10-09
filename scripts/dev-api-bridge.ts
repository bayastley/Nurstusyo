// ════════════════════════════════════════════════════════
// DEV-API-BRIDGE.TS — Vite dev sunucusu için /api köprüsü
//
// ★ AMAÇ: `vite` (npm run dev) ile local geliştirmede tarayıcının /api/*
//   istekleri GERÇEK Vercel serverless handler'larına gitsin — video/sign ve
//   auth dahil TÜM uçlar 200 dönsün, butonlar tarayıcıde komple test edilebilsin.
//
// ★ NASIL: Vite `configureServer` hook'unda Connect middleware kurulur;
//   Node http.req → VercelRequest/VercelResponse adaptasyonu yapılıp
//   api/**/handler dinamik import edilir; JSON yanıt handler'dan alınır.
//
// ★ GÜVENLİK: yalnız DEV'de aktif (canlı build'e paketlenmez), env Vercel'den
//   farklıysa process.env yerine .env.local okunur; gizli değerler LOGDA ÇIKMAZ.
//
// ★ Zihin-eşleme (mental map):
//   • tarayıcı POST /api/video/sign → API_IMPORTED["api/video/sign"]
//     → handler(req, res) → JSON { ok, url, posterUrl }
//   • tarayıcı GET /api/auth/me → API_IMPORTED["api/auth/me"]
//     → handler(req, res) → JSON { ok, user, wallet, banned, banReason }
// ════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";

// ─── Tip haritalama ─────────────────────────────────────
type VercelStyleReq = IncomingMessage & { cookies?: Record<string, string>; query?: Record<string, string>; body?: unknown };
// Değerler sadece yüksek seviye — herhangi bir handler kabul edilebilir
type AnyHandler = (req: VercelStyleReq, res: ServerResponse) => Promise<unknown> | unknown;

// ─── .env.local okuyucu (Vercel'e bağımlı olmayan, local env) ───
function loadDotEnvIfAny(): void {
  const envFile = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envFile)) return;
  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["'](.*)["']$/s, "$1");
    // NaN ve boş değer yazılmaz — eğer required env zaten tamamsa override edilmez
    // ★ IMPORTANT: sunucu process.env'i Vite/plugin runtime'ında paylaşır; dev Secret
    //   doğrudan NUR_SESSION_SECRET'e de yazılır (aynı imza algoritması handler'larda).
    if (key === "NUR_DEV_SESSION_SECRET" && value && !process.env["NUR_SESSION_SECRET"]) {
      process.env["NUR_SESSION_SECRET"] = value;
    }
    if (key && value && process.env[key] === undefined) process.env[key] = value;
  }
}

// ─── Cookie parser (VercelRequest davranışı simülasyonu) ───
function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of String(header).split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

// ─── Query parser (URL search params → Record) ───
function parseQuery(urlString: string): Record<string, string> {
  const idx = urlString.indexOf("?");
  if (idx === -1) return {};
  const search = urlString.slice(idx + 1);
  const out: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(search).entries()) out[k] = v;
  return out;
}

// ─── Handler cache (her istekte import etmemek için) ───
const API_CACHE = new Map<string, AnyHandler | null>();

function loadHandler(apiFile: string): AnyHandler | null {
  const cached = API_CACHE.get(apiFile);
  if (cached !== undefined) return cached;
  // api/ altında dosya adı → handler yolu (api/video/sign.ts → Nurstusyo/api/video/sign.ts)
  const absTs = path.resolve(process.cwd(), "api", `${apiFile}.ts`);
  const absTsx = path.resolve(process.cwd(), "api", `${apiFile}.tsx`);
  const abs = fs.existsSync(absTs) ? absTs : fs.existsSync(absTsx) ? absTsx : null;
  if (!abs) { API_CACHE.set(apiFile, null); return null; }
  // Vite dev'de TS dosyaları tsconfig rootDir ile build edilebilir, ama
  // dev-api-bridge TEK tek ts-node şartı yok — Vite handler'ları mı destekler?
  // Hayır — ama Node ESM ile TS import destekleniyor (Vite 7 Node 18+ ESM).
  // Biz de Vite'ın SSR modül yükleyicisinden (createServer内部的 ssrLoadModule)
  // kesin bağımsız kirli import kullanıyoruz; TS dosya Node ESM'de çalışmaz.
  //
  // ▼ ÇÖZÜM: handler'ları YENİDEN YAZMADAN çalıştırmak için Vite'ın ssrLoadModule
  //   API'sine bağlı kalacağız (hook'la sağlanır — createServer'ı geçeceğiz).
  API_CACHE.set(apiFile, null); // placeholder — gerçek yükleme aşağıda, hook tarafından
  return null;
}

// ─── API haritası dinamik builder: api/**/* dizinini fs.scan eder ───
function discoverApiRoutes(): Array<{ route: string; file: string }> {
  const root = path.resolve(process.cwd(), "api");
  const out: Array<{ route: string; file: string }> = [];
  const walk = (dir: string, prefix: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name === "_shared" || entry.name === "_probe" || entry.name.startsWith("_log")) continue;
        walk(path.join(dir, entry.name), `${prefix}/${entry.name}`);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const base = entry.name.replace(/\.tsx?$/, "");
        if (base === "index") out.push({ route: prefix, file: `${prefix}` });
        else if (base !== "middleware") out.push({ route: `${prefix}/${base}`, file: `${prefix}/${base}` });
      } else if (entry.name.startsWith("_") || entry.name === "middleware.ts") continue;
    }
  };
  if (fs.existsSync(root)) walk(root, "");
  return out;
}

// ─── Vite'a açık arayüz: configureServer hook'unda kurulur ───
export interface DevApiBridgeOptions {
  /** hangi portlarda dinliyor — log güzelliği */
  port?: number;
  /** geliştirme kolaylığı: response'a X-Dev-Api-Bridge header'ı ekle */
  header?: string;
}

export function devApiBridge(options: DevApiBridgeOptions = {}) {
  const label = options.header || "x-dev-api-bridge";
  const headerValue = `1 (dev; port options.port || unknown)`;

  return {
    name: "nur-dev-api-bridge",
    // Vite plugin olmayan "inline hook" — configureServer'a eklenecek
    hooks: {
      "vite:serverCreated": undefined,
    },
    /** ★ Vite'ın configureServer hook'una takılacak gerçek fonksiyon */
    configureServer(server: {
      middlewares: {
        use: (route: string | undefined, fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
      };
      /** Vite SSR modültürü — TS dosyaları import edilebilir (handler'lar % TS'dir) */
      ssrLoadModule: (url: string) => Promise<Record<string, unknown>>;
      config: { logger: { info: (msg: string) => void; warnOnce: (msg: string) => void } };
    }) {
      const routes = discoverApiRoutes();
      server.config.logger.info(`[dev-api-bridge] ${routes.length} API ucu dev-bridge'e bağlanıyor…`);

      // ★ ssrLoadModule cache — handler'ları TEK SEFER DERLE, sonra yeniden çalıştır
      const loaded = new Map<string, Promise<AnyHandler | null>>();
      const getHandler = (apiFile: string): Promise<AnyHandler | null> => {
        const cached = loaded.get(apiFile);
        if (cached) return cached;
        // ssrLoadModule Vite'ın TS-to-JS transpiler'ını kullanır (esbuild)
        const entry = server.ssrLoadModule(`/api/${apiFile}.ts`).then((mod) => {
          const h = (mod.default ?? mod.handler) as AnyHandler | undefined;
          return typeof h === "function" ? h : null;
        }).catch((err) => {
          server.config.logger.warnOnce(`[dev-api-bridge] ${apiFile} import hatası: ${String(err && err.message || err).slice(0, 160)}`);
          loaded.delete(apiFile); // sonraki istek yeniden dene (hot reload)
          return null;
        });
        loaded.set(apiFile, entry);
        return entry;
      };

      // ─── Dev oturum (SSEKIZ) ─────────────────────────────
      // ★ NUR_DEV_SESSION_SECRET + NUR_DEV_USER_EMAIL setse: köprü her /api
      //   isteğine SAHTE nur_session cookie'si ekler (imza GEÇERLİ — gerçek
      //   createSessionToken + NUR_SESSION_SECRET mantığını birebir uygular).
      //   Prod'da bu env'ler yok → cookie enjeksiyonu 0 — canlı akıntır.
      loadDotEnvIfAny(); // ★ .env.local'dan NUR_DEV_* değerlerini oku
      const devSecret = process.env.NUR_DEV_SESSION_SECRET || "";
      const devEmail = process.env.NUR_DEV_USER_EMAIL || "";
      const devHasMock = devSecret.length >= 20 && Boolean(devEmail);
      const base64Url = (v: Buffer | string): string => {
        const buf = Buffer.isBuffer(v) ? v : Buffer.from(v, "utf8");
        return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      };
      const buildMockCookie = (): string => {
        const now = Math.floor(Date.now() / 1000);
        const payload = base64Url(JSON.stringify({
          id: `dev-${devEmail.split("@")[0]}`,
          sub: `dev-sub-${Buffer.from(devEmail).toString("hex").slice(0, 12)}`,
          email: devEmail,
          name: "Dev Test Kullanıcısı",
          picture: "",
          verified: true,
          isAdmin: !!process.env.NUR_DEV_USER_ADMIN,
          tier: (process.env.NUR_DEV_USER_TIER as "free" | "pro" | "elit") || "free",
          iat: now,
          exp: now + 7 * 24 * 3600,
        }));
        const sig = base64Url(crypto.createHmac("sha256", devSecret).update(payload).digest());
        const token = encodeURIComponent(`${payload}.${sig}`);
        return `nur_session=${token}`;
      };
      const injectMockCookie = (nodeReq: IncomingMessage): void => {
        if (!devHasMock) return;
        // Request başına TEK cookie build — cache yok, her istekte yeniden (exp taze)
        const mock = buildMockCookie();
        const old = String(nodeReq.headers.cookie || "");
        // Var olan nur_session'ı EZMEZ — tarayıcı oturumu varsa o geçerli.
        const merged = old.includes("nur_session=") ? old : (old ? `${old}; ${mock}` : mock);
        nodeReq.headers.cookie = merged;
      };

      // ─── Middleware: /api/* yakalayıp handler'ı çağırır ───
      server.middlewares.use("/api", (nodeReq, nodeRes, next) => {
        (async () => {
          const [apiFile] = [((nodeReq.url || "/").split("?")[0]).replace(/^\/+/, "").replace(/\/+$/, "")];
          const handler = await getHandler(apiFile);

          // ★ SPA fallback değil bu route — /api/index.ts [...catchall] yok
          if (!handler) {
            // Kesin eşleşme yok → path segment fallback ("api/admin/action.ts" gibi)
            // zaten dpsearch'te geldi; bulamadıysak gerçekten Unknown:
            nodeRes.statusCode = 404;
            nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
            nodeRes.setHeader(label, headerValue);
            nodeRes.end(JSON.stringify({ ok: false, error: `Dev'de ${apiFile} handler'ı bulunamadı` }));
            return;
          }

          // ─── Node IncomingMessage → Vercel-benzeri adaptasyon ───
          const req = nodeReq as VercelStyleReq;
          const methodEarly = String(nodeReq.method || "GET").toUpperCase();
          injectMockCookie(nodeReq); // ★ DEV SAHTE OTURUM (env zorunu)
          if (process.env.NUR_DEV_API_DEBUG === "1") {
            server.config.logger.info(`[dbg] ${methodEarly} ${apiFile} cookie-inject=${devHasMock} len=${String(nodeReq.headers.cookie || "").length} devSecret=${devSecret ? "SET" : "MISSING"} devMail=${devEmail}`);
          }
          req.cookies = parseCookies(nodeReq.headers.cookie);
          req.query = parseQuery(nodeReq.url || "");

          // POST/PUT/PATCH gövde okuma (JSON/URL-encoded/text)
          const method = String(nodeReq.method || "GET").toUpperCase();
          if (method !== "GET" && method !== "HEAD") {
            const chunks: Buffer[] = [];
            let size = 0;
            await new Promise<void>((resolve, reject) => {
              nodeReq.on("data", (chunk: Buffer) => {
                size += chunk.length;
                if (size > 5 * 1024 * 1024) { nodeReq.destroy(); reject(new Error("Body çok büyük")); return; }
                chunks.push(chunk);
              });
              nodeReq.on("end", resolve);
              nodeReq.on("error", reject);
            }).catch(() => undefined);
            const raw = Buffer.concat(chunks).toString("utf8");
            const ct = String(nodeReq.headers["content-type"] || "");
            if (ct.includes("application/json")) {
              try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
            } else if (ct.includes("application/x-www-form-urlencoded")) {
              req.body = Object.fromEntries(new URLSearchParams(raw).entries());
            } else {
              req.body = raw;
            }
          } else {
            req.body = {};
          }

          // ─── ServerResponse → VercelResponse benzeri küçük köprü ───
          // res.status(200).json({...}) zincirini desteklemek için status/json/getHeader'dır.
          const res = nodeRes as ServerResponse & {
            status: (code: number) => { json: (obj: unknown) => void; end: (s?: string) => void };
            json: (obj: unknown) => void;
            setHeader: ServerResponse["setHeader"];
          };
          // VercelResponse zincirleme: res.status(...).json(...)
          (res as unknown as Record<string, unknown>).status = (code: number) => {
            nodeRes.statusCode = code;
            const statusObj = {
              json: (obj: unknown) => {
                nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
                nodeRes.setHeader(label, headerValue);
                nodeRes.end(JSON.stringify(obj));
              },
              end: (s?: string) => { nodeRes.end(s); },
            };
            return statusObj;
          };
          // Direkt res.json da olsun
          (res as unknown as Record<string, unknown>).json = (obj: unknown) => {
            nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
            nodeRes.setHeader(label, headerValue);
            nodeRes.end(JSON.stringify(obj));
          };

          // ─── Handler çalıştır; curl/test kolaylığı için log ───
          const t0 = Date.now();
          try {
            await handler(req, res);
            const ms = Date.now() - t0;
            if (process.env.NUR_DEV_API_LOG !== "0") {
              server.config.logger.info(`[api] ${method} /api/${apiFile} → ${nodeRes.statusCode} (${ms}ms)`);
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e || "bilinmeyen");
            server.config.logger.warnOnce(`[api] ${method} /api/${apiFile} PATLADI: ${msg.slice(0, 200)}`);
            if (!nodeRes.headersSent) {
              nodeRes.statusCode = 500;
              nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
            }
            if (!nodeRes.writableEnded) {
              nodeRes.end(JSON.stringify({ ok: false, error: `Dev handler hatası: ${msg.slice(0, 200)}` }));
            }
          }
        })().catch((err) => {
          // Son emniyet ağı — asla broken-pipe olmasın
          if (!nodeRes.headersSent) {
            nodeRes.statusCode = 500;
            nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
            nodeRes.end(JSON.stringify({ ok: false, error: String(err && err.message || err).slice(0, 200) }));
          } else if (!nodeRes.writableEnded) {
            try { nodeRes.end(); } catch { /* yut */ }
          }
        });
      });
      server.config.logger.info(`[dev-api-bridge] /api/* yakalanıyor — ${routes.length} uç hazır`);
    },
  };
}

// ─── Kolaylık (opsiyonel): direct çalıştırma — `npx tsx scripts/dev-api-bridge.ts` ───
// Not: bir standalone Node sunucusu da açılmaz; bridge yalnızca Vite plugin içerir.
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Bu dosya bir Vite plugin'dir — vite.config.ts içinde devApiBridge() olarak kullanın.");
}
