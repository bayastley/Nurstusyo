// ════════════════════════════════════════════════════════
// VERSION.TS — Sürüm takvimi + v2/v3 kilit mantığı
// tier.ts'den ayrıldı (SRP parçalama adım 1a, 30.09)
// ⚠️ Bu dosya yeniden export etmez — tüketenler import yolunu değiştirir.
// ════════════════════════════════════════════════════════

export type AppVersion = "v1.0" | "v1.1" | "v1.2" | "v1.3" | "v1.4" | "v1.5" | "v1.6" | "v1.7";
export const VERSION_SCHEDULE: Record<AppVersion, string> = {
  "v1.0": "2026-08-28", "v1.1": "2026-09-25", "v1.2": "2026-10-23", "v1.3": "2026-11-20",
  "v1.4": "2026-12-18", "v1.5": "2027-01-15", "v1.6": "2027-02-05", "v1.7": "2027-03-12",
};
const VERSION_ORDER: AppVersion[] = ["v1.0", "v1.1", "v1.2", "v1.3", "v1.4", "v1.5", "v1.6", "v1.7"];

export function getCurrentVersion(): AppVersion {
  if (typeof window === "undefined") return "v1.0";
  const override = localStorage.getItem("nur_version_override") as AppVersion | null;
  if (override && VERSION_ORDER.includes(override)) return override;
  const today = new Date().toISOString().slice(0, 10);
  return VERSION_ORDER.reduce<AppVersion>((current, version) => (today >= VERSION_SCHEDULE[version] ? version : current), "v1.0");
}

export function setVersionOverride(version: AppVersion | null): void {
  if (typeof window === "undefined") return;
  if (version) localStorage.setItem("nur_version_override", version);
  else localStorage.removeItem("nur_version_override");
}

export function isVersionUnlocked(target: "v2" | "v3"): boolean {
  const current = getCurrentVersion();
  return VERSION_ORDER.indexOf(current) >= VERSION_ORDER.indexOf(target === "v2" ? "v1.6" : "v1.7");
}
