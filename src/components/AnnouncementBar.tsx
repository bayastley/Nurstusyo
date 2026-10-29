import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Gift, Sparkles, X, Trash2, RefreshCw } from "lucide-react";
import { getActiveAnnouncement } from "../services/adminSyncService";
import { checkRateLimit } from "../rateLimiter";
import type { Announcement } from "../services/adminSyncService";
import { getSystemConfig, saveSystemConfig } from "../services/adminSyncService";
import { claimHolyDayReward, getHolyDayState, type HolyDayBannerState } from "../services/holidayCalendar";
import { AdminBroadcastPanel } from "./AdminBroadcastPanel";
import type { User, ModalName } from "../types";
import { translate } from "../i18n";
// ★ 26.10 7-HAFTA KAMPANYA ÇİPLERİ — lansman dönemi "herkes PRO" sayacı + bitiş bildirimi

interface AnnouncementBarProps {
  notify: (message: string) => void;
  user?: User | null;
  onRewardClaimed?: (newJeton: number) => void;
  onTamperAttempt?: (reason: string) => void;
  /** ★ Sadık Üye çipi tıklayınca giriş modalı (StudioApp setModal'i geçer) */
  setModalSafe?: (m: ModalName) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ notify, user, onRewardClaimed, onTamperAttempt, setModalSafe }) => {
  // ★ i18n (03.10): şerit + kalıcı takvim metinleri seçili dilde (05: prompt-2)
  const t = (key: string) => translate(localStorage.getItem("nur_lang"), key);
  const [holyDay, setHolyDay] = useState<HolyDayBannerState>(() => getHolyDayState());
  // ★ LOCAL ÖNCE (02.10): admin yayını anında saveAnnouncement ile localStorage'a
  //   düşer — /api/config poll'unu (45sn CDN cache) BEKLEMEDEN baloncuk belirir.
  //   Ardından poll gelen sunucu duyurusuyla ezilir (ikisi de aynı kaynağı gösterir).
  const [announcement, setAnnouncement] = useState<Announcement | null>(() => getActiveAnnouncement());
  // ★ 29.10 SADIK ÜYE SAYACI SÖKÜLDÜ (sahibin emri): kampanya çipi tamamen kalktı.
  // ★ KİLİT GÜNCELLEMESİ (19.10): /api/config poll'u v2/v3 kilitlerini veya admin
  //   gizli-reveal'ları (nur_feature_locks) değişik olarak yakalarsa "Güncellemeyi
  //   Al" bildirimi basılır — kullanıcı yenilemeyle yeni modülleri görsün.
  //   İlk poll sessiz baseline kurar; sessionStorage kullanılır (reload sonrası
  //   temiz, bildirim bir daha tekrarlanmaz).
  const [kilitGuncellemesi, setKilitGuncellemesi] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [readId, setReadId] = useState(() => localStorage.getItem("nur_read_announcement") || "");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      // ★ Lansman hazırlığı: config 45sn TTL CDN cache'te — poll DB'yi vurmaz (28.09).
      // ★ 06.10 CANLI BULGU FIX: cache-bust çipi — bare /api/config edge anahtarı bayat
      //   kalabiliyordu (SWR=300): bakım/duyuru değişikliği kullanıcıya ~5+ dk gecikiyordu
      //   (8 dkMeasurements kanıt). 15'lik döner çip = 15 farklı anahtar; aynı çip 90sn
      //   poll'arda tekrar kurulur → cache HIT korunur + maks gecikme ~22 sn'e düşer.
      const cb = Math.floor(Date.now() / 15_000) % 15;
      const response = await fetch(`/api/config?cb=${cb}`, { cache: "default" }).catch(() => null);
      const data = response ? await response.json().catch(() => null) as { announcement?: any; featureLocks?: Array<{ feature_id: string; lock_level: any }>; maintenance?: { enabled?: boolean; startsAt?: string; endsAt?: string; message?: string; updated_at?: string } | null; sadikUye?: { toplamKayitli?: number; kontenjan?: number } | null } | null : null;
      if (alive) {
        setHolyDay(getHolyDayState());
        const item = data?.announcement;
        setAnnouncement(item ? { id: item.id, title: item.title, message: item.message, detail: item.detail, kind: item.kind, active: item.active, blinking: item.blinking, startsAt: item.starts_at, endsAt: item.ends_at, updatedAt: item.updated_at, forceOpen: item.force_open, requireAck: item.require_ack } : null);
        // ★ Bakım planı sunucudan gelirse yerel ayara yaz — bütün site aynı anda bakıma girer
        if (data?.maintenance && typeof data.maintenance === "object") {
          const m = data.maintenance;
          const cfg = getSystemConfig();
          const serverUpdatedAt = m.updated_at ?? "";
          if (serverUpdatedAt !== cfg.maintenance?.updatedAt) {
            cfg.maintenance = {
              enabled: Boolean(m.enabled),
              startsAt: m.startsAt ?? "",
              endsAt: m.endsAt ?? "",
              message: m.message ?? cfg.maintenance?.message ?? "",
              updatedAt: serverUpdatedAt || new Date().toISOString(),
            };
            saveSystemConfig(cfg);
            // ★ Bakım ekranı reload beklemeden güncellensin
            window.dispatchEvent(new Event("nur_config_updated"));
          }
        }
        if (Array.isArray(data?.featureLocks)) {
          const cfg = getSystemConfig();
          for (const lock of data.featureLocks) cfg.featureLocks[lock.feature_id] = lock.lock_level;
          saveSystemConfig(cfg);
          // ★ KİLİT PARMAK İZİ: kilit seti önceki poll'dan farklıysa bildirim.
          const fp = data.featureLocks.map((l: { feature_id: string; lock_level: unknown }) => `${l.feature_id}=${String(l.lock_level)}`).sort().join("|");
          try {
            const oncekiFp = sessionStorage.getItem("nur_locks_fp");
            if (oncekiFp !== null && oncekiFp !== fp) setKilitGuncellemesi(true);
            sessionStorage.setItem("nur_locks_fp", fp);
          } catch { /* yut */ }
        }
        // ★ 29.10: sadikUye sayaç verisi artık istemcide HİÇ kullanılmıyor —
        //   kampanya çipi tamamen kalktı; /api/config alanı ölü veri (sunucuya dokunulmadı).
      }
    };
    void refresh();
    // ★ KİLİT/BAKIM ANINDA YANSIMA + SCALE KORUMASI (tam tarama 28.09):
    //   Eski plan 15 sn'de bir poll idi — 100k kullanıcıda dakikada ~400k istek yaratırdı
    //   (rate limit 120/dk'ya dayar, hiçbir değişiklik olmasa bile).
    //   YENİ: 60 sn poll + sunucudan gelen updated_at'a göre değişiklik YOKSA cache;
    //   ayrıca sekme gizliyken poll tamamen durur, döndüğünde hemen bir kez çeker.
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 90_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { alive = false; window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  // ★ 29.10 DUYURU OTOMATİK ÇEVİRİ (kullanıcı emri: "ben türkçe yazayım, adamın
  //   dili hangisine çevirmişse ona çevrilsin"): seçili dil tr değilse duyuru
  //   /api/ai/duyuru-cevir ile çevrilir; localStorage'da id+updated_at
  //   anahtarına cache'lenir (cihaz başına duyuru sürümü başına 1 istek).
  //   Çeviri yok/başarısız → TR metin aynen gösterilir (fail-safe).
  const [ceviri, setCeviri] = useState<Record<string, { title?: string; message?: string; detail?: string }> | null>(null);
  useEffect(() => {
    if (!announcement) { setCeviri(null); return; }
    const dil = (localStorage.getItem("nur_lang") || "tr").slice(0, 5);
    if (dil === "tr") { setCeviri(null); return; }
    const cacheKey = `nur_duyuru_ceviri:${announcement.id}:${announcement.updatedAt || ""}`;
    const cacheOku = (): Record<string, { title?: string; message?: string; detail?: string }> | null => {
      try { const ham = localStorage.getItem(cacheKey); return ham ? JSON.parse(ham) : null; } catch { return null; }
    };
    const cache = cacheOku();
    if (cache) { setCeviri(cache); return; }
    let canli = true;
    fetch("/api/ai/duyuru-cevir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: announcement.title, message: announcement.message, detail: announcement.detail || "" }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!canli || !d?.ok || !d.ceviri || Object.keys(d.ceviri).length === 0) return;
        try { localStorage.setItem(cacheKey, JSON.stringify(d.ceviri)); } catch { /* standbağa yut */ }
        setCeviri(d.ceviri);
      })
      .catch(() => { /* sessiz — TR metin kalır */ });
    return () => { canli = false; };
  }, [announcement?.id, announcement?.updatedAt, announcement?.title, announcement?.message]);
  const duyuruG = announcement ? {
    ...announcement,
    title: ceviri?.[localStorage.getItem("nur_lang") || "tr"]?.title || announcement.title,
    message: ceviri?.[localStorage.getItem("nur_lang") || "tr"]?.message || announcement.message,
    detail: ceviri?.[localStorage.getItem("nur_lang") || "tr"]?.detail || announcement.detail,
  } : null;
  // ★ YEREL DUYURU DİNLEYİCİ (02.10; 05.10 CANLI TEST DÜZELTMESİ): admin yayını
  //   saveAnnouncement artık ÖZEL "nur_duyuru_guncel" event'i fırlatır. Eskiden
  //   burada genel nur_config_updated dinleniyordu — ama her /api/config poll'u da
  //   kilit/bakım yazımı için saveSystemConfig → nur_config_updated fırlattığından
  //   bu dinleyici HER POLL'DA local duyuruyu sunucu duyurusunun ÜZERİNE yazıyordu:
  //   sıradan kullanıcının cihazında local liste boş olduğu için duyuru baloncuğu
  //   asla görünmüyordu (canlı test kanıtı: /api/config'te duyuru VAR, bar
  //   "Duyuru yok" gösteriyordu). Genel event kilit/bakım için kalır; duyuru
  //   yalnız özel eventle anında ekrana gelir.
  useEffect(() => {
    const onLocal = () => setAnnouncement(getActiveAnnouncement());
    window.addEventListener("nur_duyuru_guncel", onLocal);
    return () => window.removeEventListener("nur_duyuru_guncel", onLocal);
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) {
      setIsAdmin(false);
      setAdminPanelOpen(false);
      return;
    }
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => setIsAdmin(response.ok))
      .catch(() => setIsAdmin(false));
  }, [user?.isAdmin]);

  useEffect(() => {
    if (announcement?.forceOpen && readId !== announcement.id) setDetailOpen(true);
  }, [announcement, readId]);

  const claim = async () => {
    const limit = checkRateLimit("general");
    if (!limit.allowed) return notify(t("rateLimitNotice"));
    if (!holyDay.canClaim) return;
    const result = await claimHolyDayReward(holyDay.eventKey, holyDay.rewardKind, holyDay.rewardAmount);
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

  const unread = Boolean(announcement && readId !== announcement.id);

  // ★ SERT TAZELE (02.10 mantığı tek yerde): ?t= zaman damgasıyla Vercel'den
  //   taze bundle'ı garantiler; sessionStorage temizliği bildirimin reload
  //   sonrası tekrar basılmasını engeller.
  const hardTazele = () => {
    try { sessionStorage.removeItem("nur_locks_fp"); } catch { /* ignore */ }
    const url = new URL(window.location.href);
    url.searchParams.set("t", Date.now().toString(36));
    window.location.replace(url.toString());
  };

  return (
    <>
      <div className={`relative z-50 border-b px-3 py-2 text-[11px] ${announcement ? "border-emerald-400/35 bg-emerald-950/35 text-emerald-100" : "border-white/10 bg-[#111014] text-white/45"}`}>
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-2">
          {duyuruG && (
            <button onClick={openAnnouncement} className={`flex items-center gap-2 rounded-full border border-emerald-300/45 bg-emerald-400/15 px-3 py-1.5 font-black transition-opacity duration-700 ${duyuruG.blinking && unread ? "animate-pulse" : "opacity-90"}`}>
              <Bell size={12} className={`text-emerald-300 transition-opacity duration-700 ${unread ? "" : "opacity-50"}`} />
              {unread && <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-300 transition-opacity duration-700" />}
              <span>{duyuruG.title}</span>
              <span className="max-w-[42vw] truncate font-medium text-white/60">{duyuruG.message}</span>
            </button>
          )}
          {announcement && unread && (
            <button
              onClick={() => {
                // ★ GÜNCELLEMESİ AL (02.10): Ctrl+Shift+R eşdeğeri tazeleme —
                //   location.reload() önbelleği kullanabilir; hard reload
                //   (?t= zaman damgası) Vercel'den TAZE bundle'ı garantiler.
                try { localStorage.setItem("nur_read_announcement", announcement.id); } catch { /* ignore */ }
                hardTazele();
              }}
              className="flex items-center gap-1.5 rounded-full bg-emerald-400 px-3.5 py-1.5 font-black text-emerald-950 shadow-[0_0_16px_rgba(52,211,153,.55)] transition hover:bg-emerald-300 hover:shadow-[0_0_22px_rgba(52,211,153,.75)] active:scale-95"
              title={t("annGetUpdateTitle")}
            >
              <RefreshCw size={12} />
              {t("annGetUpdateBtn")}
            </button>
          )}
          {/* ★ KİLİT GÜNCELLEMESİ (19.10): duyuru yokken de v2/v3 kilidi ya da admin
              gizli-reveal değiştiyse "Güncellemeyi Al" çıkar — tık = hard reload. */}
          {kilitGuncellemesi && !unread && (
            <button
              onClick={hardTazele}
              className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1.5 font-black text-amber-950 shadow-[0_0_16px_rgba(251,191,36,.55)] transition hover:bg-amber-300 hover:shadow-[0_0_22px_rgba(251,191,36,.75)] active:scale-95"
              title={t("annGetUpdateTitle")}
            >
              <RefreshCw size={12} />
              {t("annGetUpdateBtn")}
            </button>
          )}
          {!announcement && (
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-semibold">
              <Bell size={12} className="text-white/35" />
              {t("noAnnouncementYet")}
            </span>
          )}
          {/* ★ 29.10 SADIK ÜYE SAYAÇ ÇİPİ KOMPLE KALDIRILDI (sahibin emri):
              çip canlıda kapatılmıştı ama kod hâlâ istemcide basabiliyordu —
              artık SIFIR çip: state + poll bağlantısı söküldü. */}
          {holyDay.type !== "none" && (
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-amber-300" />
              <b>{holyDay.title}</b>
              {holyDay.type === "claim" && (
                <button disabled={holyDay.isClaimed} onClick={claim} className="flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 font-black text-black disabled:opacity-45">
                  {holyDay.isClaimed ? <CheckCircle size={11} /> : <Gift size={11} />}
                  {holyDay.isClaimed ? t("rewardClaimedMsg") : t("claimRewardBtn")}
                </button>
              )}
            </div>
          )}
          {isAdmin && (
            <button onClick={() => setAdminPanelOpen(true)} className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black text-emerald-300">
              <Bell size={11} /> {t("annKilitlerBtn")}
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
                notify(t("annKalindiMsg"));
              }}
              className="flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-2.5 py-1.5 text-[9px] font-black text-red-300 hover:bg-red-500/20"
              title={t("annKaldirBtn")}
            >
              <Trash2 size={10} /> {t("annKaldirBtn")}
            </button>
          )}
        </div>
      </div>

      {detailOpen && duyuruG && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setDetailOpen(false)}>
          <article className="glass relative w-full max-w-lg rounded-3xl border border-amber-400/30 p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            {!duyuruG.requireAck && <button onClick={() => setDetailOpen(false)} className="absolute right-4 top-4 text-white/50"><X size={17} /></button>}
            <span className="mb-3 inline-flex rounded-full bg-amber-400/15 px-3 py-1 text-[9px] font-black uppercase text-amber-300">{duyuruG.kind}</span>
            <h3 className="font-display text-xl font-black text-white">{duyuruG.title}</h3>
            <p className="mt-2 text-sm font-semibold text-amber-100/80">{duyuruG.message}</p>
            {duyuruG.detail && <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-white/60">{duyuruG.detail}</p>}
            {duyuruG.requireAck && <button onClick={() => { openAnnouncement(); setDetailOpen(false); }} className="mt-5 w-full rounded-xl bg-amber-300 py-3 text-xs font-black text-black">{t("announcementAck")}</button>}
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
