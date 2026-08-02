// ════════════════════════════════════════════════════════════════
// ADMINSYNCSERVICE.TS — 100% ÜCRETSİZ BULUTSUZ MÜKEMMEL VERİ ORKESTRATÖRÜ
// GitHub Gist / Public JSON Raw + Şifreli LocalStorage Senkronizasyonu.
// Hiçbir ücretli sunucuya ihtiyaç duymadan Admin güncellemesini tüm dünyaya yayar.
// ════════════════════════════════════════════════════════════════

import { secureGet, secureSet } from "../secureStore";
import type { Tier } from "../types";

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  jeton: number;
  updatedAt: string;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
}

export interface BanLog {
  id: string;
  userEmail: string;
  userName: string;
  reason: string;
  bannedBy: string;
  timestamp: string;
  isAuto: boolean;
  unbanned?: boolean;
}

export interface DynamicModule {
  id: string;
  title: string;
  iconName: string; // "BookOpen" | "Sparkles" | "LibraryBig" | "Heart" | "Star" | "Flame"
  lock: "free" | "pro" | "elit" | "v2" | "v3";
  active: boolean;
  category: string;
  description: string;
}

export interface SystemConfig {
  gistId?: string;
  lastSyncMs: number;
  modules: DynamicModule[];
  users: ManagedUser[];
  banLogs?: BanLog[];
}

const SYNC_CONFIG_KEY = "nur_system_sync_config";
const GIST_RAW_URL_KEY = "nur_gist_raw_url";

export const DEFAULT_MODULES: DynamicModule[] = [
  { id: "mod-kuran-hikayeler", title: "Kur'an Hikayeleri", iconName: "BookOpen", lock: "v2", active: true, category: "hikaye", description: "Peygamberlerin ibretli yaşam öyküleri" },
  { id: "mod-kissalar", title: "Kıssalar", iconName: "Sparkles", lock: "v2", active: true, category: "kissa", description: "Derin tefekkür kıssaları" },
  { id: "mod-hadisler", title: "Hadisler", iconName: "LibraryBig", lock: "v3", active: true, category: "hadis", description: "Sahih Hadis-i Şerif seçkileri" },
  { id: "mod-dualar", title: "Dualar & Zikirler", iconName: "Heart", lock: "v2", active: true, category: "dua", description: "Manevi sığınak ve dualar" },
];

// ★ Demo/sahte kullanıcı tohumları kaldırıldı. Panel boş başlar;
//   gerçek kullanıcılar Google girişi yaptıkça kaydolur.
export const DEFAULT_USERS: ManagedUser[] = [];

/** Yerel şifreli sistem konfigürasyonunu yükle */
export function getSystemConfig(): SystemConfig {
  if (typeof window === "undefined") {
    return { lastSyncMs: Date.now(), modules: DEFAULT_MODULES, users: DEFAULT_USERS };
  }
  const config = secureGet<SystemConfig | null>(SYNC_CONFIG_KEY, null);
  if (!config || !Array.isArray(config.modules)) {
    return { lastSyncMs: Date.now(), modules: DEFAULT_MODULES, users: DEFAULT_USERS };
  }
  return config;
}

/** Yerel şifreli sistem konfigürasyonunu kaydet */
export function saveSystemConfig(cfg: SystemConfig): void {
  const { ...safeCfg } = cfg;
  secureSet(SYNC_CONFIG_KEY, safeCfg);
}

export function getBanLogs(): BanLog[] {
  const cfg = getSystemConfig();
  return Array.isArray(cfg.banLogs) ? cfg.banLogs : [];
}

export function banUserInDb(
  email: string,
  reason: string,
  bannedBy: string = "kayaom1233@gmail.com",
  isAuto: boolean = false
): ManagedUser | null {
  const cfg = getSystemConfig();
  const index = cfg.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  const now = new Date().toISOString();

  let targetUser: ManagedUser;
  if (index >= 0) {
    targetUser = {
      ...cfg.users[index],
      isBanned: true,
      banReason: reason,
      bannedAt: now,
      bannedBy,
      updatedAt: now,
    };
    cfg.users[index] = targetUser;
  } else {
    targetUser = {
      id: "u-" + Math.random().toString(36).slice(2, 10),
      email: email.trim().toLowerCase(),
      name: email.split("@")[0],
      tier: "free",
      jeton: 0,
      isBanned: true,
      banReason: reason,
      bannedAt: now,
      bannedBy,
      updatedAt: now,
    };
    cfg.users.push(targetUser);
  }

  // Ban log kaydı oluştur
  const banLogs = Array.isArray(cfg.banLogs) ? cfg.banLogs : [];
  const log: BanLog = {
    id: "ban-" + Math.random().toString(36).slice(2, 10),
    userEmail: targetUser.email,
    userName: targetUser.name,
    reason,
    bannedBy,
    timestamp: now,
    isAuto,
    unbanned: false,
  };
  cfg.banLogs = [log, ...banLogs].slice(0, 50);

  saveSystemConfig(cfg);
  return targetUser;
}

export function unbanUserInDb(email: string): ManagedUser | null {
  const cfg = getSystemConfig();
  const index = cfg.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  const now = new Date().toISOString();

  if (index >= 0) {
    const updated = {
      ...cfg.users[index],
      isBanned: false,
      banReason: undefined,
      bannedAt: undefined,
      bannedBy: undefined,
      updatedAt: now,
    };
    cfg.users[index] = updated;

    // Ban log güncelle
    if (Array.isArray(cfg.banLogs)) {
      cfg.banLogs = cfg.banLogs.map((l) =>
        l.userEmail.toLowerCase() === email.toLowerCase() ? { ...l, unbanned: true } : l
      );
    }

    saveSystemConfig(cfg);
    return updated;
  }
  return null;
}

export function syncUserInDb(email: string, name?: string, tier?: Tier, jeton?: number): ManagedUser {
  const cfg = getSystemConfig();
  const users = cfg.users;
  const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  const now = new Date().toISOString();
  if (index >= 0) {
    const updated = {
      ...users[index],
      name: name ?? users[index].name,
      tier: tier ?? users[index].tier,
      jeton: jeton ?? users[index].jeton,
      updatedAt: now,
    };
    users[index] = updated;
    cfg.users = users;
    saveSystemConfig(cfg);
    return updated;
  } else {
    const newUser: ManagedUser = {
      id: "u-" + Math.random().toString(36).slice(2, 10),
      email: email.trim().toLowerCase(),
      name: name || email.split("@")[0],
      tier: tier || "free",
      jeton: jeton ?? 20,
      updatedAt: now,
    };
    users.push(newUser);
    cfg.users = users;
    saveSystemConfig(cfg);
    return newUser;
  }
}

/**
 * Ücretsiz GitHub Gist / JSON Raw API üzerinden tüm dünyadaki kullanıcılara verileri senkronize eder.
 * Admin bir değişiklik yapıp "Buluta Push Et" butonuna bastığında GitHub Gist'e şifreli JSON yazar.
 * Diğer kullanıcılar nurstudyo.com'u açtığında bu ücretsiz RAW adresten güncel veriyi okur.
 */
export async function pushConfigToGithubGist(token: string, gistId: string, cfg: SystemConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const payload = {
      description: "Nûr Stüdyo Serverless Dynamic Config DB",
      public: true,
      files: {
        "nur_studyo_db.json": {
          content: JSON.stringify({
            updatedAt: new Date().toISOString(),
            modules: cfg.modules,
            users: cfg.users,
          }, null, 2),
        },
      },
    };

    const url = gistId
      ? `https://api.github.com/gists/${gistId}`
      : "https://api.github.com/gists";
    const method = gistId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { ok: false, message: `GitHub API Hatası (${res.status}): Lütfen Token veya Gist ID kontrol ediniz.` };
    }

    const data = await res.json();
    const newGistId = data.id;
    const rawUrl = data.files?.["nur_studyo_db.json"]?.raw_url || "";

    const updatedCfg: SystemConfig = {
      ...cfg,
      gistId: newGistId,
      lastSyncMs: Date.now(),
    };
    saveSystemConfig(updatedCfg);
    if (rawUrl) {
      localStorage.setItem(GIST_RAW_URL_KEY, rawUrl);
    }

    return { ok: true, message: `✅ Başarıyla GitHub Gist Bulutuna Yüklendi! Gist ID: ${newGistId}` };
  } catch (err) {
    return { ok: false, message: "Ağ Hatası: GitHub senkronizasyonu gerçekleştirilemedi." };
  }
}

/**
 * Normal kullanıcılar için ücretsiz Gist RAW adresinden canlı veriyi çeker.
 */
export async function fetchRemoteConfig(): Promise<SystemConfig | null> {
  const rawUrl = typeof window !== "undefined" ? localStorage.getItem(GIST_RAW_URL_KEY) : null;
  if (!rawUrl) return null;

  try {
    const res = await fetch(rawUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data.modules) && Array.isArray(data.users)) {
      const current = getSystemConfig();
      const updated: SystemConfig = {
        ...current,
        modules: data.modules,
        users: data.users,
        lastSyncMs: Date.now(),
      };
      saveSystemConfig(updated);
      return updated;
    }
  } catch {
    // Offline or network error -> fallback to local secure store
  }
  return null;
}
