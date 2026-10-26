import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
import { useState, useEffect, useRef } from "react";
import { SERVER_BAN_LIVE } from "./studioConstants";
import { consumeTamperFlag, onTamperDetected, secureGet, secureSet } from "../secureStore";
import { getSystemConfig, getBanLogs } from "../services/adminSyncService";
import type { User } from "../types";

interface UseBanOptions {
  user: User | null;
  isMasterSürüm: boolean;
  notify: (msg: string) => void;
}

interface UseBanReturn {
  localBanned: boolean;
  setLocalBanned: (v: boolean) => void;
  localBanReason: string;
  setLocalBanReason: (v: string) => void;
}

export function useBan({ user, isMasterSürüm, notify }: UseBanOptions): UseBanReturn {
  const [localBanned, setLocalBanned] = useState<boolean>(() => {
    return secureGet<boolean>("nur_local_user_banned", false);
  });
  const [localBanReason, setLocalBanReason] = useState<string>(() => {
    return secureGet<string>("nur_local_user_ban_reason", "Sistem Güvenlik & Yasal Hak İhlali");
  });

  // ★ AÇILIŞTA ESKİ BAN VERİLERİNİ TEMİZLE — otomatik ban devre dışı
  useEffect(() => {
    if (localBanned) {
      setLocalBanned(false);
      secureSet("nur_local_user_banned", false);
      secureSet("nur_local_user_ban_reason", "");
    }
  }, []);

  // ★ GOD MODE — ban durumunu otomatik temizler
  useEffect(() => {
    if (!isMasterSürüm) return;
    if (consumeTamperFlag()) {
      notify(ttX2610("secAdminTemiz"));
    }
    setLocalBanned(false);
    secureSet("nur_local_user_banned", false);
    secureSet("nur_local_user_ban_reason", "");
    onTamperDetected((key) => {
      notify(ttX2610("secSinyal").replace("{x}", String(key)));
    });
  }, [isMasterSürüm, notify]);

  // ★ CANLI BAN BİLDİRİM İZLEYİCİSİ
  const seenBanIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!isMasterSürüm) return;
    const scan = (announce: boolean) => {
      const logs = getBanLogs();
      const fresh = logs.filter((l) => !seenBanIds.current.has(l.id));
      fresh.forEach((l) => seenBanIds.current.add(l.id));
      if (!announce || !fresh.length) return;
      fresh.slice(0, 3).forEach((l, i) => {
        window.setTimeout(() => {
          notify(
            `⛔ BAN: ${l.userEmail} · ${l.isAuto ? "SİSTEM OTOMATİK" : "ADMİN"} · Sebep: ${l.reason} — Yanlışsa Admin Panel > Ban & Siber Denetim'den kaldır`
          );
        }, i * 2600);
      });
    };
    scan(false);
    const iv = window.setInterval(() => scan(true), 2500);
    return () => window.clearInterval(iv);
  }, [isMasterSürüm, notify]);

  // ★ GÜVENLİK BİLDİRİMİ — otomatik ban DEVRE DIŞI
  useEffect(() => {
    if (isMasterSürüm) return;
    if (consumeTamperFlag()) {
      notify(ttX2610("secEskiFormat"));
    }
    onTamperDetected((key) => {
      notify(ttX2610("secGenelUyari").replace("{x}", String(key)));
    });
  }, [notify, isMasterSürüm]);

  // ★ BAN DURUMU CANLI DENETLEYİCİ
  useEffect(() => {
    if (isMasterSürüm) return;

    if (SERVER_BAN_LIVE && user) {
      fetch("/api/ban/status", { cache: "no-store" })
        .then(async (response) => ({ response, data: await response.json().catch(() => null) as { ok?: boolean; error?: string; isBanned?: boolean; reason?: string } | null }))
        .then(({ response, data }) => {
          if (!response.ok || !data?.ok) {
            console.warn("[ban] API hatası, atlanıyor:", data?.error);
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
          console.warn("[ban] Ban servisine ulaşılamadı, atlanıyor");
        });
      return;
    }

    const savedUser = secureGet<string | null>("nur_user_v1", null);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        const cfg = getSystemConfig();
        const dbUser = cfg.users.find((x) => x.email.toLowerCase() === u.email.toLowerCase());
        if (dbUser && dbUser.isBanned) {
          setLocalBanned(true);
          setLocalBanReason(dbUser.banReason || "Yasal İhlal / Siber Güvenlik Uyarısı");
          secureSet("nur_local_user_banned", true);
          secureSet("nur_local_user_ban_reason", dbUser.banReason || "Yasal İhlal / Siber Güvenlik Uyarısı");
        } else if (dbUser && !dbUser.isBanned) {
          setLocalBanned(false);
          secureSet("nur_local_user_banned", false);
        }
      } catch { /* ignore */ }
    }
  }, [user, isMasterSürüm]);

  return {
    localBanned,
    setLocalBanned,
    localBanReason,
    setLocalBanReason,
  };
}
