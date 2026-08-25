import { useEffect, useRef } from "react";
import { setCurrentTier, setJeton as persistJetonSecure, type Tier } from "../tier";
import { consumeTamperFlag, onTamperDetected, secureGet, secureSet } from "../secureStore";
import { banUserInDb, getBanLogs, getSystemConfig } from "../services/adminSyncService";
import type { ModalName, User } from "../types";

interface UseSecurityGuardsParams {
  isMasterSürüm: boolean;
  serverBanLive: boolean;
  user: User | null;
  modal: ModalName;
  notify: (message: string) => void;
  setTier: (tier: Tier) => void;
  setJetonCount: (value: number) => void;
  setLocalBanned: (value: boolean) => void;
  setLocalBanReason: (value: string) => void;
}

export function useSecurityGuards({
  isMasterSürüm,
  serverBanLive,
  user,
  modal,
  notify,
  setTier,
  setJetonCount,
  setLocalBanned,
  setLocalBanReason,
}: UseSecurityGuardsParams) {
  // God Mode: ban durumunu temizler ve tamper sinyalini sadece bildirir.
  useEffect(() => {
    if (!isMasterSürüm) return;
    if (consumeTamperFlag()) {
      notify("🛡️ ADMIN: Önceki güvenlik kaydı temizlendi · ban uygulanmadı");
    }
    setLocalBanned(false);
    secureSet("nur_local_user_banned", false);
    secureSet("nur_local_user_ban_reason", "");
    onTamperDetected((key) => {
      notify(`🛡️ ADMIN UYARI: Güvenlik sinyali yakalandı (${key}) — ban uygulanmadı, sadece bildirildi.`);
    });
  }, [isMasterSürüm, notify, setLocalBanned]);

  // Admin ekranda canlı ban log bildirimi.
  const seenBanIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!isMasterSürüm) return;
    const scan = (announce: boolean) => {
      const logs = getBanLogs();
      const fresh = logs.filter((log) => !seenBanIds.current.has(log.id));
      fresh.forEach((log) => seenBanIds.current.add(log.id));
      if (!announce || !fresh.length) return;
      fresh.slice(0, 3).forEach((log, index) => {
        window.setTimeout(() => {
          notify(
            `⛔ BAN: ${log.userEmail} · ${log.isAuto ? "SİSTEM OTOMATİK" : "ADMİN"} · Sebep: ${log.reason} — Yanlışsa Admin Panel > Ban & Siber Denetim'den kaldır`,
          );
        }, index * 2600);
      });
    };
    scan(false);
    const interval = window.setInterval(() => scan(true), 2500);
    return () => window.clearInterval(interval);
  }, [isMasterSürüm, notify]);

  // Client tamper tespiti — otomatik ban DEVRE DIŞI, sadece bildirim verilir.
  useEffect(() => {
    if (isMasterSürüm) return;
    if (consumeTamperFlag()) {
      notify("🛡️ Güvenlik: Eski veri formatı tespit edildi · veriler otomatik güncellendi");
    }
    onTamperDetected((key) => {
      notify(`🛡️ Güvenlik uyarısı: ${key} — otomatik ban uygulanmadı`);
    });
  }, [isMasterSürüm, notify]);

  // Ban durumu canlı denetleyici.
  useEffect(() => {
    if (isMasterSürüm) return;

    if (serverBanLive && user) {
      fetch("/api/ban/status", { cache: "no-store" })
        .then(async (response) => ({
          response,
          data: await response.json().catch(() => null) as { ok?: boolean; error?: string; isBanned?: boolean; reason?: string } | null,
        }))
        .then(({ response, data }) => {
          if (!response.ok || !data?.ok) {
            console.warn('[ban] API hatası, atlanıyor:', data?.error);
            return;
          }
          if (data.isBanned) {
            setLocalBanned(true);
            setLocalBanReason(data.reason || "Yasal İhlal / Siber Güvenlik Uyarısı");
          } else {
            setLocalBanned(false);
          }
        })
        .catch(() => {
          console.warn('[ban] Ban servisine ulaşılamadı, atlanıyor');
        });
      return;
    }

    const savedUser = secureGet<string | null>("nur_user_v1", null);
    if (!savedUser) return;
    try {
      const parsed = JSON.parse(savedUser) as User;
      const cfg = getSystemConfig();
      const dbUser = cfg.users.find((entry) => entry.email.toLowerCase() === parsed.email.toLowerCase());
      if (dbUser?.isBanned) {
        const reason = dbUser.banReason || "Yasal İhlal / Siber Güvenlik Uyarısı";
        setLocalBanned(true);
        setLocalBanReason(reason);
        secureSet("nur_local_user_banned", true);
        secureSet("nur_local_user_ban_reason", reason);
      } else if (dbUser && !dbUser.isBanned) {
        setLocalBanned(false);
        secureSet("nur_local_user_banned", false);
      }
    } catch {
      // ignore local config errors
    }
  }, [isMasterSürüm, modal, serverBanLive, setLocalBanned, setLocalBanReason, user]);
}