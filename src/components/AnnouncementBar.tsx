import React, { useState, useEffect } from "react";
import { Sparkles, Gift, CheckCircle } from "lucide-react";
import {
  getHolyDayState,
  claimHolyDayReward,
  type HolyDayBannerState,
} from "../services/holidayCalendar";
import { checkRateLimit } from "../rateLimiter";

interface AnnouncementBarProps {
  notify: (msg: string) => void;
  onRewardClaimed?: (newJeton: number) => void;
  onTamperAttempt?: (reason: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  notify,
  onRewardClaimed,
  onTamperAttempt,
}) => {
  const [state, setState] = useState<HolyDayBannerState>(() => getHolyDayState());

  useEffect(() => {
    // 30 saniyede bir manevi takvimi canlı güncelle
    const interval = window.setInterval(() => {
      setState(getHolyDayState());
    }, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const handleClaim = () => {
    // 1. Rate limiter spam/bot koruması
    const rl = checkRateLimit("general");
    if (!rl.allowed) {
      notify("⏱️ Lütfen butona bu kadar hızlı basmayınız!");
      return;
    }

    if (!state.canClaim) {
      if (state.isClaimed) {
        notify("🚨 Güvenlik İhlali: Bu ödül bu kutsal gün için zaten alındı!");
      }
      return;
    }

    const result = claimHolyDayReward(state.eventKey, state.rewardAmount);

    if (result.ok) {
      notify(result.message);
      if (onRewardClaimed) onRewardClaimed(result.newJeton);
      setState(getHolyDayState());
    } else {
      notify(result.message);
      if (result.message.includes("Güvenlik İhlali") && onTamperAttempt) {
        onTamperAttempt(result.message);
      }
    }
  };

  if (state.type === "none") return null;

  return (
    <div
      className="relative z-50 overflow-hidden border-b border-amber-400/30 px-3 py-2 text-center text-[11px] font-bold text-black select-none transition-all"
      style={{
        background:
          state.type === "claim"
            ? "linear-gradient(90deg, #f5dda6 0%, #d7aa52 35%, #ffffff 50%, #d7aa52 65%, #f5dda6 100%)"
            : "linear-gradient(90deg, #1c1917 0%, #362810 50%, #1c1917 100%)",
        color: state.type === "claim" ? "#0c0d12" : "#f5dda6",
      }}
    >
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-2">
        <span className="flex items-center gap-1">
          <Sparkles size={13} className="animate-spin text-amber-300" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
            {state.badgeText}
          </span>
        </span>

        <span className="hidden sm:inline">•</span>

        <span className="font-extrabold tracking-wide drop-shadow-sm">
          {state.title}
        </span>

        {state.type === "claim" && (
          <button
            onClick={handleClaim}
            disabled={state.isClaimed}
            className={`ml-2 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
              state.isClaimed
                ? "bg-black/20 text-black/60 cursor-not-allowed"
                : "bg-black text-amber-300 hover:bg-black/90 hover:scale-105"
            }`}
          >
            {state.isClaimed ? (
              <>
                <CheckCircle size={12} className="text-emerald-400" />
                <span>ÖDÜL ALINDI</span>
              </>
            ) : (
              <>
                <Gift size={12} className="animate-bounce text-amber-300" />
                <span>[🎁 HEDİYENİ TIKLA AL]</span>
              </>
            )}
          </button>
        )}

        {state.type === "notice" && (
          <span className="ml-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[9px] font-black text-amber-300">
            YARIN AKTİF OLACAK
          </span>
        )}
      </div>
    </div>
  );
};
