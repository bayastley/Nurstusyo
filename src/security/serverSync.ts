// ════════════════════════════════════════════════════════
// SERVER SYNC - Client-side veri bütünlüğü doğrulama
// Tier, jeton, ban durumu gibi kritik verileri 
// sunucudan doğrular ve manipülasyonu önler.
// ════════════════════════════════════════════════════════
import { secureGet, secureSet } from "../secureStore";
import type { Tier } from "../types";

const LAST_SYNC_KEY = "nur_last_server_sync_ms";
const SERVER_TIER_KEY = "nur_server_tier";
const SERVER_JETON_KEY = "nur_server_jeton";
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 dakika

interface ServerStatus {
  ok: boolean;
  tier?: Tier;
  jeton?: number;
  banned?: boolean;
  banReason?: string;
}

// Server'dan kullanıcı durumu sorgulama
export async function fetchServerStatus(): Promise<ServerStatus> {
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) {
      return { ok: false };
    }
    const data = await response.json() as any;
    if (!data?.ok || !data.user) {
      return { ok: false };
    }
    return {
      ok: true,
      tier: data.user.tier === "pro" || data.user.tier === "elit" ? data.user.tier : "free",
      jeton: data.wallet?.total ?? 0,
      banned: Boolean(data.banned),
      banReason: data.banReason,
    };
  } catch {
    return { ok: false };
  }
}

// Son sync zamanını kontrol et (5 dakikadan eskiyse yeni sync yap)
function needsSync(): boolean {
  if (typeof window === "undefined") return true;
  const lastSync = secureGet<number>(LAST_SYNC_KEY, 0);
  return Date.now() - lastSync > SYNC_INTERVAL_MS;
}

function markSynced() {
  secureSet(LAST_SYNC_KEY, Date.now());
}

// Client tier'ını server ile karşılaştır, manipülasyon varsa server'a uy
export function validateTier(serverTier: Tier, clientTier: string): Tier {
  // Admin her zaman elit olabilir
  if (serverTier === "elit") return "elit";
  // Server "free"/"pro" ama client "elit" → manipülasyon, server'a uy
  if (clientTier === "elit") {
    console.warn("[Security] Tier manipülasyonu tespit edildi:", clientTier, "→", serverTier);
    return serverTier;
  }
  return serverTier;
}

// Jeton doğrulama (client > server ise manipülasyon)
export function validateJeton(serverJeton: number, clientJeton: number): number {
  if (clientJeton > serverJeton + 5) { // küçük tolerans (race condition)
    console.warn("[Security] Jeton manipülasyonu tespit edildi:", clientJeton, "→", serverJeton);
    return serverJeton;
  }
  return clientJeton;
}

// Periyodik server sync (her 5 dakikada bir)
export function startPeriodicSync(
  onMismatch: (serverTier: Tier, serverJeton: number, banned: boolean) => void,
) {
  if (typeof window === "undefined") return () => {};
  
  const sync = async () => {
    const status = await fetchServerStatus();
    if (!status.ok) return;
    markSynced();
    
    const clientTier = secureGet<Tier>("nur_tier", "free");
    const clientJeton = secureGet<number>("nur_jeton", 0);
    
    const validTier = validateTier(status.tier ?? "free", clientTier);
    const validJeton = validateJeton(status.jeton ?? 0, clientJeton);
    
    if (validTier !== clientTier || validJeton !== clientJeton || status.banned) {
      onMismatch(validTier, validJeton, Boolean(status.banned));
    }
  };
  
  // İlk sync
  sync();
  
  // Her 5 dakikada bir sync
  const interval = window.setInterval(sync, SYNC_INTERVAL_MS);
  
  return () => window.clearInterval(interval);
}

// Ban durumunu server'dan anlık doğrulama
export async function verifyBanStatus(userEmail: string): Promise<boolean> {
  try {
    const response = await fetch("/api/ban/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = await response.json() as any;
    return Boolean(data.banned);
  } catch {
    return false;
  }
}
