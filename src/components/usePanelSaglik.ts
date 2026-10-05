// ════════════════════════════════════════════════════════
// USEPANELSAGLIK.TS — Admin panel sağlık rozeti (06.10)
// İSTEK: "Admin paneline küçük bir 'sağlık' rozeti ekle: açılışta tüm
//   action'ları sessizce ping'leyip hangi sekme çalışmıyorsa panelde görünsün."
//
// MANTIK: panel açılışında YALNIZ salt-okunur action'lar ping'lenir.
//   YAZMA action'ları (gift_rights, set_maintenance, ban_user, feedback_reply…)
//   ASLA çağrılmaz — rozet hiçbir veriye dokunamaz.
//   Her GERÇEK sekme ↔ bir salt-okunur action eşleşir; hangisi başarısızsa
//   o sekmenin adı rozet tooltip'inde + sekme üzerindeki kırmızı noktada görünür.
//   Sessizlik ilkesi: hiçbir hata UI'yı bozmaz, notify çağrılmaz, retry yok.
// ════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import type { AdminTab } from "./adminDashboardKabuk";

/** Rozetin izlediği sekmeler: kabuktaki GERÇEK 7 butonlu sekme (modules/sync butonsuz — kapsam dışı). */
export type SaglikTab = Exclude<AdminTab, "modules" | "sync">;

export type PanelSaglik = {
  /** "test": ping'ler sürüyor · "ok": hepsi sağlıklı · "hata": en az bir sekme çalışmıyor */
  durum: "test" | "ok" | "hata";
  okSayisi: number;
  toplam: number;
  /** Hata dönen sekmeler — rozet tooltip'inde + sekme noktalarında görünür */
  hataliTablar: SaglikTab[];
};

// ★ Salt-okunur action → sekme haritası (api/admin/action.ts envanterinden, 06.10).
//   Her satır YALNIZ veri OKUYAN action'dır; adminRateLimit 100/dk — 7 ping sorunsuz.
const PANEL_SAGLIK_HARITA: ReadonlyArray<{ tab: SaglikTab; action: string }> = [
  { tab: "users", action: "list_users" },
  { tab: "broadcast", action: "check_rpc_health" },
  { tab: "banLogs", action: "list_banned_users" },
  { tab: "errors", action: "list_errors" },
  { tab: "haftaVideo", action: "hafta_video_list" },
  { tab: "rapor", action: "haftalik_rapor" },
  { tab: "feedback", action: "list_feedback" },
];

const PING_TIMEOUT_MS = 12_000;

/**
 * Tek salt-okunur action ping'i: HTTP 200 + body.ok === true → sekme sağlıklı.
 * Dikkat: dış `ok` YETERLİDİR — alt detay (ör. check_rpc_health'in rpc.ok alanı)
 * sekmenin ÇALIŞIP çalışmadığını etkilemez, yalnız panelde gösterilen uyarıdır.
 * Sessiz: ağ hatası / JSON bozuk / timeout → false (asla throw etmez).
 */
async function pingAction(action: string): Promise<boolean> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), PING_TIMEOUT_MS);
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
      signal: ctl.signal,
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return data?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Panel açılışında 7 salt-okunur action'ı sessizce ping'ler; sonucu rozet state'i tutar. */
export function usePanelSaglik(): PanelSaglik {
  const [saglik, setSaglik] = useState<PanelSaglik>({
    durum: "test",
    okSayisi: 0,
    toplam: PANEL_SAGLIK_HARITA.length,
    hataliTablar: [],
  });

  useEffect(() => {
    let canli = true;
    (async () => {
      // allSettled + kendi try/catch'li ping: hiçbir kombinasyon patlamaz
      const sonuclar = await Promise.allSettled(
        PANEL_SAGLIK_HARITA.map(async (girdi) => ({ tab: girdi.tab, ok: await pingAction(girdi.action) }))
      );
      if (!canli) return;
      const hataliTablar: SaglikTab[] = [];
      sonuclar.forEach((s, i) => {
        const ok = s.status === "fulfilled" ? s.value.ok : false;
        if (!ok) hataliTablar.push(PANEL_SAGLIK_HARITA[i].tab);
      });
      setSaglik({
        durum: hataliTablar.length === 0 ? "ok" : "hata",
        okSayisi: PANEL_SAGLIK_HARITA.length - hataliTablar.length,
        toplam: PANEL_SAGLIK_HARITA.length,
        hataliTablar,
      });
    })();
    return () => { canli = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return saglik;
}
