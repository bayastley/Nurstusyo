// ════════════════════════════════════════════════════════
// USAGEIZLE.TS — BÖLÜM KULLANIM LİSTELERİ (25.10, sahibin emri)
//   Admin panelin "Bölüm Kullanımı" tab'ına veri toplayan istemci katmanı.
//   • bolumKullanimiYaz("kesfet") → sunucu haftalık tabloya 1 ekler (misafir dahil).
//   • Kullanıcı KIMLIGI/eposta/içerik GÖNDERMEZ — GDPR-dostu toplama sayaç.
//   • 30 sn'de bir aynı bölümün tekrar kaydı yutulur (sessiz spam koruması).
//   • Ağ hatası sessizdir: analitik UI'ı asla engellemesin.
// ════════════════════════════════════════════════════════

export function bolumKullanimiYaz(bolum: string): void {
  if (typeof window === "undefined") return;
  const ad = String(bolum || "").toLowerCase().trim();
  if (ad.length < 2 || ad.length > 40 || !/^[a-z0-9_-]+$/.test(ad)) return;
  try {
    const key = `nur_usage_${ad}`;
    const son = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - son < 30_000) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch { /* storage engelli — ne olursa yine yaz */ }
  try {
    fetch("/api/customer/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: ad }),
      keepalive: true,
    }).catch(() => undefined);
  } catch { /* yoksay */ }
}
