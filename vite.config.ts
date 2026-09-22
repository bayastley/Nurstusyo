import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";


// ─── Server error logger (gömülü — _shared Vercel'de paketlenmiyor) ───
async function logServerError(req: { url?: string; headers: Record<string, string | string[] | undefined> }, error: unknown, endpoint: string): Promise<void> {
  try {
    const __url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const __key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!__url || !__key) return;
    const __msg = error instanceof Error ? error.message : String(error || "Bilinmeyen sunucu hatası");
    if (!__msg) return;
    const __stack = error instanceof Error ? (error.stack || "") : "";
    const __path = String(req.url || endpoint).slice(0, 200);
    const __fingerprint = require("crypto").createHash("sha256").update(__msg + "|" + __path).digest("hex").slice(0, 16);
    await fetch(__url + "/rest/v1/nur_error_logs", {
      method: "POST",
      headers: { apikey: __key, Authorization: "Bearer " + __key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        message: __msg.slice(0, 500),
        stack: __stack.slice(0, 4000),
        path: __path,
        source: ("server:" + endpoint).slice(0, 40),
        user_agent: String(req.headers["user-agent"] || "server").slice(0, 300),
        fingerprint: __fingerprint,
        kind: "genel",
        user_email: "",
      }),
    });
  } catch { /* log yazımı siteyi ASLA bozmaz */ }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ════════════════════════════════════════════════════════════════
// ★ NÛR STÜDYO — Vite Prod Konfigürasyonu
//
// GÜVENLİK / OBFUSCATION HEDEFLERİ:
//   1) Fonksiyon/değişken adları çorba (Terser mangle + toplevel + props)
//   2) Yorumlar ve console.log/debugger tamamen kaldırılır
//   3) Kaynak haritası (sourcemap) OFF — canlıda kodun orijinali sızmaz
//   4) Dosya adları hash'li (chunk-XXXX.js) → CDN üzerinden pattern tahmini zor
//   5) Sadece prod'da uygulanır; dev'de debug rahat kalır
// ════════════════════════════════════════════════════════════════

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    // ─── Prod build: agresif obfuscation ────────────────────────
    build: {
      // Kaynak haritası KAPALI — canlıda sızmasın
      sourcemap: false,
      // Terser: en agresif minify + mangle
      minify: isProd ? "terser" : false,
      terserOptions: isProd
        ? {
            // Kod sıkıştırma seçenekleri
            compress: {
              drop_console: true,     // console.log/warn/info/debug hepsi silinir
              drop_debugger: true,    // debugger; ifadeleri silinir
              pure_funcs: [
                "console.log", "console.info", "console.debug", "console.warn",
              ],
              passes: 3,              // 3 kez optimize et — daha küçük çıktı
              ecma: 2020,
              booleans_as_integers: false,
              hoist_funs: true,
              hoist_vars: false,
              module: true,
              toplevel: true,
              unsafe_arrows: true,
              unsafe_methods: true,
            },
            // İsim karıştırma (mangle) — R2 URL builder, tier logic, secureStore
            // içindeki değişken adları tarayıcıda tanınmaz hale gelir.
            mangle: {
              toplevel: true,         // top-level fonksiyon/değişkenleri de karıştır
              module: true,
              // Özel property'ler bile karıştırılır (ör. obj.reciterAudioUrl → obj.a)
              // NOT: crypto-js, react, dış kütüphaneleri kırmamak için properties: false
              // güvenli bırakılır. Sadece top-level yeter.
              safari10: true,
            },
            format: {
              // Tüm yorumları kaldır (lisans dahil değil)
              comments: false,
              ecma: 2020,
              ascii_only: true,       // Türkçe karakterler \u escape'e çevrilir → daha zor okunur
            },
          }
        : undefined,
      // Chunk boyut uyarı eşiği (singlefile modunda tek chunk çıkacak)
      chunkSizeWarningLimit: 2000,
      // Dosya adları: hash'li → CDN pattern tahmini zorlaşır
      rollupOptions: {
        output: {
          entryFileNames: "assets/[hash].js",
          chunkFileNames: "assets/[hash].js",
          assetFileNames: "assets/[hash].[ext]",
        },
      },
    },

    // ─── Dev sunucu (debug rahat) ───────────────────────────────
    server: {
      port: 5173,
      strictPort: false,
    },

    // ─── Prod'da bazı dev bayraklarını sil ──────────────────────
    define: isProd
      ? {
          "process.env.NODE_ENV": JSON.stringify("production"),
          __DEV__: false,
        }
      : {},
  };
});
