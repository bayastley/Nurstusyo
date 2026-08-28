import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Gift, Sparkles, X, Trash2 } from "lucide-react";
import { checkRateLimit } from "../rateLimiter";
import type { Announcement } from "../services/adminSyncService";
import { getSystemConfig, saveSystemConfig } from "../services/adminSyncService";
import { claimHolyDayReward, getHolyDayState, type HolyDayBannerState } from "../services/holidayCalendar";
import { AdminBroadcastPanel } from "./AdminBroadcastPanel";

interface AnnouncementBarProps {
  notify: (message: string) => void;
  onRewardClaimed?: (newJeton: number) => void;
  onTamperAttempt?: (reason: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ notify, onRewardClaimed, onTamperAttempt }) => {
  const [holyDay, setHolyDay] = useState<HolyDayBannerState>(() => getHolyDayState());
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [readId, setReadId] = useState(() => localStorage.getItem("nur_read_announcement") || "");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const response = await fetch("/api/config", { cache: "no-store" }).catch(() => null);
      const data = response ? await response.json().catch(() => null) as { announcement?: any; featureLocks?: Array<{ feature_id: string; lock_level: any }> } | null : null;
      if (alive) {
        setHolyDay(getHolyDayState());
        const item = data?.announcement;
        setAnnouncement(item ? { id: item.id, title: item.title, message: item.message, detail: item.detail, kind: item.kind, active: item.active, blinking: item.blinking, startsAt: item.starts_at, endsAt: item.ends_at, updatedAt: item.updated_at, forceOpen: item.force_open, requireAck: item.require_ack } : null);
        if (Array.isArray(data?.featureLocks)) {
          const cfg = getSystemConfig();
          for (const lock of data.featureLocks) cfg.featureLocks[lock.feature_id] = lock.lock_level;
          saveSystemConfig(cfg);
        }
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => { alive = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => setIsAdmin(response.ok))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (announcement?.forceOpen && readId !== announcement.id) setDetailOpen(true);
  }, [announcement, readId]);

  const claim = () => {
    const limit = checkRateLimit("general");
    if (!limit.allowed) return notify("Lutfen butona bu kadar hizli basmayin");
    if (!holyDay.canClaim) return;
    const result = claimHolyDayReward(holyDay.eventKey, holyDay.rewardAmount);
    notify(result.message);
    if (result.ok) onRewardClaimed?.(result.newJeton);
    // Guvenlik tamper tetikleme kaldırıldı — ban uygulamıyor
    setHolyDay(getHolyDayState());
  };

  const openAnnouncement = () => {
    if (!announcement) return;
    setDetailOpen(true);
    setReadId(announcement.id);
    localStorage.setItem("nur_read_announcement", announcement.id);
  };

  // Cuma hediyesi alindiktan sonra banner kaybolsun
  if (!announcement && (holyDay.type === "none" || (holyDay.type === "claim" && holyDay.isClaimed)) && !isAdmin) return null;
  const unread = Boolean(announcement && readId !== announcement.id);

  return (
    <>
      <div className="relative z-50 border-b border-amber-400/25 bg-[#111014] px-3 py-2 text-[11px] text-amber-100">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-2">
          {announcement && (
            <button onClick={openAnnouncement} className={`flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-1.5 font-black ${unread && announcement.blinking ? "animate-pulse" : ""}`}>
              <Bell size={12} className={unread ? "text-amber-300" : "text-white/45"} />
              {unread && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
              <span>{announcement.title}</span>
              <span className="max-w-[42vw] truncate font-medium text-white/60">{announcement.message}</span>
            </button>
          )}
          {holyDay.type !== "none" && (
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-amber-300" />
              <b>{holyDay.title}</b>
              {holyDay.type === "claim" && (
                <button disabled={holyDay.isClaimed} onClick={claim} className="flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 font-black text-black disabled:opacity-45">
                  {holyDay.isClaimed ? <CheckCircle size={11} /> : <Gift size={11} />}
                  {holyDay.isClaimed ? "Odul alindi" : "Hediyeni al"}
                </button>
              )}
            </div>
          )}
          {isAdmin && (
            <button onClick={() => setAdminPanelOpen(true)} className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black text-emerald-300">
              <Bell size={11} /> Duyuru ve Kilitlar
            </button>
          )}
          {isAdmin && announcement && (
            <button
              onClick={async () => {
                try {
                  await fetch("/api/admin/action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "delete_announcement", announcementId: announcement.id }),
                  });
                } catch { /* ignore */ }
                setAnnouncement(null);
                notify("Duyuru kaldırıldı · Sayfa yenilenince tüm kullanıcılarda gider");
              }}
              className="flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-1.5 text-[9px] font-black text-red-300 hover:bg-red-500/20"
              title="Duyuruyu kaldır"
            >
              <Trash2 size={10} /> Duyuruyu Kaldır
            </button>
          )}
        </div>
      </div>

      {detailOpen && announcement && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setDetailOpen(false)}>
          <article className="glass relative w-full max-w-lg rounded-3xl border border-amber-400/30 p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            {!announcement.requireAck && <button onClick={() => setDetailOpen(false)} className="absolute right-4 top-4 text-white/50"><X size={17} /></button>}
            <span className="mb-3 inline-flex rounded-full bg-amber-400/15 px-3 py-1 text-[9px] font-black uppercase text-amber-300">{announcement.kind}</span>
            <h3 className="font-display text-xl font-black text-white">{announcement.title}</h3>
            <p className="mt-2 text-sm font-semibold text-amber-100/80">{announcement.message}</p>
            {announcement.detail && <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-white/60">{announcement.detail}</p>}
            {announcement.requireAck && <button onClick={() => { openAnnouncement(); setDetailOpen(false); }} className="mt-5 w-full rounded-xl bg-amber-300 py-3 text-xs font-black text-black">Okudum</button>}
          </article>
        </div>
      )}

      {adminPanelOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" onMouseDown={() => setAdminPanelOpen(false)}>
          <div className="glass relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-amber-400/30 p-5" onMouseDown={(event) => event.stopPropagation()}>
            <button onClick={() => setAdminPanelOpen(false)} className="absolute right-4 top-4 text-white/50"><X size={17} /></button>
            <AdminBroadcastPanel notify={notify} />
          </div>
        </div>
      )}
    </>
  );
};
