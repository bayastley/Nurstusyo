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

export type FeatureLock = "free" | "pro" | "elit" | "v2" | "v3" | "maintenance" | "off";

export interface DynamicModule {
  id: string;
  title: string;
  iconName: string;
  lock: FeatureLock;
  active: boolean;
  category: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  detail: string;
  kind: "info" | "update" | "warning";
  active: boolean;
  blinking: boolean;
  startsAt: string;
  endsAt: string;
  updatedAt: string;
  forceOpen?: boolean;
  requireAck?: boolean;
}

export interface SystemConfig {
  gistId?: string;
  rawUrl?: string;
  lastSyncMs: number;
  modules: DynamicModule[];
  users: ManagedUser[];
  banLogs?: BanLog[];
  announcements: Announcement[];
  featureLocks: Record<string, FeatureLock>;
}

const SYNC_CONFIG_KEY = "nur_system_sync_config";
const GIST_RAW_URL_KEY = "nur_gist_raw_url";

export const DEFAULT_MODULES: DynamicModule[] = [
  { id: "mod-kuran-hikayeler", title: "Kur'an Hikayeleri", iconName: "BookOpen", lock: "v2", active: true, category: "hikaye", description: "Peygamberlerin ibretli yaşam öyküleri" },
  { id: "mod-kissalar", title: "Kıssalar", iconName: "Sparkles", lock: "v2", active: true, category: "kissa", description: "Derin tefekkür kıssaları" },
  { id: "mod-hadisler", title: "Hadisler", iconName: "LibraryBig", lock: "v3", active: true, category: "hadis", description: "Sahih Hadis-i Şerif seçkileri" },
  { id: "mod-dualar", title: "Dualar & Zikirler", iconName: "Heart", lock: "v2", active: true, category: "dua", description: "Manevi sığınak ve dualar" },
];

export const DEFAULT_USERS: ManagedUser[] = [];

function normalizeConfig(config?: Partial<SystemConfig> | null): SystemConfig {
  return {
    gistId: config?.gistId,
    rawUrl: config?.rawUrl,
    lastSyncMs: config?.lastSyncMs ?? Date.now(),
    modules: Array.isArray(config?.modules) ? config.modules : DEFAULT_MODULES,
    users: Array.isArray(config?.users) ? config.users : DEFAULT_USERS,
    banLogs: Array.isArray(config?.banLogs) ? config.banLogs : [],
    announcements: Array.isArray(config?.announcements) ? config.announcements : [],
    featureLocks: config?.featureLocks && typeof config.featureLocks === "object" ? config.featureLocks : {},
  };
}

export function getSystemConfig(): SystemConfig {
  if (typeof window === "undefined") return normalizeConfig();
  return normalizeConfig(secureGet<SystemConfig | null>(SYNC_CONFIG_KEY, null));
}

export function saveSystemConfig(config: SystemConfig): void {
  secureSet(SYNC_CONFIG_KEY, normalizeConfig(config));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("nur_config_updated"));
}

export function getActiveAnnouncement(now = new Date()): Announcement | null {
  const time = now.getTime();
  return getSystemConfig().announcements
    .filter((item) => item.active && new Date(item.startsAt).getTime() <= time && new Date(item.endsAt).getTime() >= time)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null;
}

export function saveAnnouncement(announcement: Announcement): void {
  const config = getSystemConfig();
  const index = config.announcements.findIndex((item) => item.id === announcement.id);
  if (index >= 0) config.announcements[index] = announcement;
  else config.announcements.unshift(announcement);
  config.announcements = config.announcements.slice(0, 20);
  config.lastSyncMs = Date.now();
  saveSystemConfig(config);
}

export function setFeatureLock(featureId: string, lock: FeatureLock): void {
  const config = getSystemConfig();
  config.featureLocks[featureId] = lock;
  config.lastSyncMs = Date.now();
  saveSystemConfig(config);
}

export function getFeatureLock(featureId: string, fallback: FeatureLock = "free"): FeatureLock {
  return getSystemConfig().featureLocks[featureId] ?? fallback;
}

export function getBanLogs(): BanLog[] {
  return getSystemConfig().banLogs ?? [];
}

export function banUserInDb(email: string, reason: string, bannedBy = "Admin", isAuto = false): ManagedUser {
  const config = getSystemConfig();
  const now = new Date().toISOString();
  const index = config.users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase());
  const current = index >= 0 ? config.users[index] : {
    id: `u-${Math.random().toString(36).slice(2, 10)}`,
    email: email.trim().toLowerCase(),
    name: email.split("@")[0],
    tier: "free" as Tier,
    jeton: 0,
    updatedAt: now,
  };
  const user = { ...current, isBanned: true, banReason: reason, bannedAt: now, bannedBy, updatedAt: now };
  if (index >= 0) config.users[index] = user;
  else config.users.push(user);
  config.banLogs = [{ id: `ban-${Math.random().toString(36).slice(2, 10)}`, userEmail: user.email, userName: user.name, reason, bannedBy, timestamp: now, isAuto, unbanned: false }, ...(config.banLogs ?? [])].slice(0, 50);
  saveSystemConfig(config);
  return user;
}

export function unbanUserInDb(email: string): ManagedUser | null {
  const config = getSystemConfig();
  const index = config.users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase());
  if (index < 0) return null;
  const user = { ...config.users[index], isBanned: false, banReason: undefined, bannedAt: undefined, bannedBy: undefined, updatedAt: new Date().toISOString() };
  config.users[index] = user;
  config.banLogs = (config.banLogs ?? []).map((log) => log.userEmail.toLowerCase() === email.toLowerCase() ? { ...log, unbanned: true } : log);
  saveSystemConfig(config);
  return user;
}

export function syncUserInDb(email: string, name?: string, tier?: Tier, jeton?: number): ManagedUser {
  const config = getSystemConfig();
  const index = config.users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase());
  const now = new Date().toISOString();
  const user = index >= 0
    ? { ...config.users[index], name: name ?? config.users[index].name, tier: tier ?? config.users[index].tier, jeton: jeton ?? config.users[index].jeton, updatedAt: now }
    : { id: `u-${Math.random().toString(36).slice(2, 10)}`, email: email.trim().toLowerCase(), name: name || email.split("@")[0], tier: tier || "free", jeton: jeton ?? 20, updatedAt: now };
  if (index >= 0) config.users[index] = user;
  else config.users.push(user);
  saveSystemConfig(config);
  return user;
}

export async function pushConfigToGithubGist(token: string, gistId: string, config: SystemConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const payload = {
      description: "Nur Studyo Dynamic Config",
      public: true,
      files: {
        "nur_studyo_db.json": {
          content: JSON.stringify({
            updatedAt: new Date().toISOString(),
            modules: config.modules,
            users: config.users,
            announcements: config.announcements,
            featureLocks: config.featureLocks,
          }, null, 2),
        },
      },
    };
    const response = await fetch(gistId ? `https://api.github.com/gists/${gistId}` : "https://api.github.com/gists", {
      method: gistId ? "PATCH" : "POST",
      headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false, message: `GitHub API Hatası (${response.status})` };
    const data = await response.json();
    const rawUrl = String(data.files?.["nur_studyo_db.json"]?.raw_url || "");
    const next = { ...config, gistId: String(data.id), rawUrl, lastSyncMs: Date.now() };
    saveSystemConfig(next);
    if (rawUrl) localStorage.setItem(GIST_RAW_URL_KEY, rawUrl);
    return { ok: true, message: "Bulut ayarları yayınlandı" };
  } catch {
    return { ok: false, message: "GitHub senkronizasyonu gerçekleştirilemedi" };
  }
}

export async function fetchRemoteConfig(): Promise<SystemConfig | null> {
  const local = getSystemConfig();
  const rawUrl = local.rawUrl || (typeof window !== "undefined" ? localStorage.getItem(GIST_RAW_URL_KEY) : null);
  if (!rawUrl) return null;
  try {
    const response = await fetch(`${rawUrl}${rawUrl.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const remote = await response.json() as Partial<SystemConfig>;
    const next = normalizeConfig({ ...local, ...remote, rawUrl, lastSyncMs: Date.now() });
    saveSystemConfig(next);
    return next;
  } catch {
    return null;
  }
}
