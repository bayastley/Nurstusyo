import React from "react";
import type { HeaderTopBarProps } from "./headerTopBarTypes";
import {
  Sparkles, Menu, X, LogIn, UserPlus, BookOpen, HelpCircle, Palette, Headphones,
  LibraryBig, Shield, ShieldOff, Coins, Gem, ChevronDown, Check, Moon, Heart, Lightbulb,
  Image as ImageIcon, Info, Package, CalendarDays, Compass, Brain, NotebookPen, Type, Wand2, Gift, Film,
} from "lucide-react";
import { getBanLogs } from "../services/adminSyncService";
import { IslamicToolsPanel } from "./IslamicToolsPanel";
import { LANGS, T, type Lang } from "../i18n";
import { LockBadge } from "./LockBadge";
import { isAdminEmail, getJetonVault, getPackRights, isTrialActive, getTrialDaysLeft } from "../tier";
import { TIER_LABEL } from "./premiumModalHelpers";
import { getSystemConfig, fetchRemoteConfig, type DynamicModule } from "../services/adminSyncService";
import type { DailyAyah, User, ModalName } from "../types";

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  daily,
  dailyPoolLength,
  dailyIndex,
  toggleAyah,
  menuOpen,
  setMenuOpen,
  user,
  handleLogout,
  setModal,
  openAdminDashboard,
  setLibType,
  isMasterSürüm,
  setAdminGodMode,
  setSmartAiEnabled,
  setBatchFormats,
  notify,
  jetonCount,
  openPremium,
  lang,
  setLang,
  langOpen,
  setLangOpen,
  nextPrayer,
  prayerCity,
  setPrayerCity,
  prayerTimings,
  formatRemaining,
  t,
  tier,
  subscriptionEndsAt,
  setRoadmapOpen,
  misafirKalanHak,
}) => {
  const [dynamicModules, setDynamicModules] = React.useState<DynamicModule[]>(() => getSystemConfig().modules);
  const [updatesOpen, setUpdatesOpen] = React.useState(false);
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const updatesTimer = React.useRef<number>(0);

  // ★ CANLI BAN SAYACI — yeni ban geldiğinde rozet anında güncellenir
  const [banCount, setBanCount] = React.useState<number>(() => getBanLogs().length);
  React.useEffect(() => {
    const iv = window.setInterval(() => setBanCount(getBanLogs().length), 2500);
    return () => window.clearInterval(iv);
  }, []);

  React.useEffect(() => {
    fetchRemoteConfig().then((cfg) => {
      if (cfg?.modules) setDynamicModules(cfg.modules);
    });
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) setUpdatesOpen(false);
  }, [menuOpen]);

  const openUpdates = () => {
    window.clearTimeout(updatesTimer.current);
    setUpdatesOpen(true);
  };
  const closeUpdatesDelayed = () => {
    window.clearTimeout(updatesTimer.current);
    updatesTimer.current = window.setTimeout(() => setUpdatesOpen(false), 220);
  };

  return (
    <>
      {/* DAILY STRIP */}
      <div className="daily-strip border-b border-white/5">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-4 py-1.5 text-[10px] text-white/55">
          <Sparkles size={11} className="animate-glow" style={{ color: "var(--accent)" }} />
          <span className="shrink-0 font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>{t("dailyAyah")}</span>

          {daily ? (
            <button className="min-w-0 flex-1 truncate text-left transition hover:text-white/80" onClick={() => toggleAyah(daily.s, daily.a, daily.tr)}>
              <span className="font-arabic hidden text-[13px] text-white/75 sm:inline">{daily.ar.slice(0, 56)}</span>
              <span className="mx-2 hidden text-white/20 sm:inline">|</span>
              {daily.tr.slice(0, 120)} <b className="text-white/75">{daily.ref}</b>
            </button>
          ) : (
            <span className="text-white/30">{t("loading")}</span>
          )}
          <span className="hidden tabular-nums text-white/25 md:inline">{dailyPoolLength ? dailyIndex + 1 : 0}/{dailyPoolLength || "-"}</span>
        </div>
      </div>

      {/* TRIAL BANNER */}
      {user && tier === "free" && isTrialActive() && (
        <div className="bg-gradient-to-r from-emerald-600/90 to-green-600/90 border-b border-emerald-400/30">
          <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-2 px-4 py-1.5 text-[11px] text-white font-semibold">
            <Sparkles size={13} className="animate-pulse text-yellow-300" />
            <span>🎉 ÜCRETSİZ PRO DENEMEN AKTİF — <b className="text-yellow-200">{getTrialDaysLeft()} gün</b> kaldı</span>
            <button className="ml-2 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold hover:bg-white/30 transition" onClick={() => openPremium("uyelik")}>Hemen Üye Ol →</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="glass sticky top-0 z-[80] border-x-0 border-t-0">
        <div className="relative mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3" data-sidebar-trigger="true">
            <div className="relative">
              <button className="glass-soft rounded-lg p-2 text-white/70 hover:text-white" onClick={() => setMenuOpen((value) => !value)}>
                {menuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
              {menuOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" aria-label="Menüyü kapat" onClick={() => setMenuOpen(false)} />
                  <div
                    data-sidebar-panel="true"
                    className="modal-in absolute left-0 top-12 z-50 w-60 rounded-xl py-1.5 shadow-2xl"
                    style={{
                      background: "#101219",
                      border: "1px solid rgba(255,255,255,.10)",
                      boxShadow: "0 24px 60px rgba(0,0,0,.75)",
                    }}
                  >
                    <button onClick={() => { setModal("login"); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] font-bold text-white transition hover:bg-white/5 border-b border-white/5">
                      {user ? (
                        <>
                          <LogIn size={14} style={{ color: "var(--accent)" }} />
                          <span className="flex-1 truncate" title="Hesap değiştir / yeniden giriş yap — giriş ekranını açar">{user.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleLogout({ sunucuOturumuKapat: true }); }} className="text-[9px] text-red-400 hover:text-red-300" title="Hesabından çık — sunucu oturumun da kapatılır">Çıkış</button>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} style={{ color: "var(--accent)" }} />
                          <span>Kayıt Ol / Giriş Yap</span>
                        </>
                      )}
                    </button>
                    {/* ★ GÜNCELLEMELER EN ÜSTTE (kullanıcı kararı 27.09) — yenilikler ilk bakışta görünsün */}
                    <div
                      className="relative"
                      onMouseEnter={openUpdates}
                      onMouseLeave={closeUpdatesDelayed}
                    >
                      <button
                        type="button"
                        onClick={() => setUpdatesOpen((v) => !v)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] transition hover:bg-white/5 ${updatesOpen ? "bg-white/5 text-white" : "text-white/65 hover:text-white"}`}
                      >
                        <Sparkles size={14} style={{ color: "var(--accent)" }} />
                        <span className="flex-1">Güncellemeler</span>
                        <span className="flex items-center gap-1">
                          <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 text-[7.5px] font-black text-amber-300">
                            {dynamicModules.filter((m) => m.active && m.lock !== "free").length + 1 + 6}
                          </span>
                          <ChevronDown size={11} className="-rotate-90 opacity-60" />
                        </span>
                      </button>

                      {updatesOpen && (
                        <div
                          data-sidebar-flyout="true"
                          onMouseEnter={openUpdates}
                          onMouseLeave={closeUpdatesDelayed}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="modal-in absolute left-[calc(100%+8px)] top-0 z-[70] w-60 overflow-hidden rounded-xl py-1.5 shadow-2xl"
                          style={{
                            background: "#101219",
                            border: "1px solid rgba(215,170,82,.35)",
                            boxShadow: "0 24px 60px rgba(0,0,0,.8)",
                          }}
                        >
                          {/* ★ SADELEŞTİRME — rozet sayacı artık sadece Yol Haritası'na işaret eder */}
                          <div className="border-b border-white/5 px-3 pb-2 pt-1">
                            <p className="text-[9.5px] font-black uppercase tracking-widest" style={{ color: "var(--accent-2)" }}>
                              Yakında Gelecek Modüller
                            </p>
                            <p className="mt-0.5 text-[8.5px] text-white/35">V2 & V3 güncelleme takvimi — oylama yol haritasında</p>
                          </div>

                          {/* ★ YOL HARİTASI — V2 kilidi KALDIRILDI (topluluk oylaması):
                              herkes açıp yenilikleri görebilir ve oy verebilir.
                              Oy vermek için giriş gerekir (API tarafında zorunlu). */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => { setRoadmapOpen?.(true); setUpdatesOpen(false); setMenuOpen(false); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[10.5px] font-bold text-white/85 transition hover:bg-white/5"
                            >
                              <span className="text-base">🚀</span>
                              <span className="min-w-0 flex-1 truncate">Güncelleme Yol Haritası</span>
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black bg-amber-500/20 text-amber-300 animate-pulse">🗳️ OYLA</span>
                            </button>
                          </div>

                          {/* ★ SADELEŞTİRME: V2/V3 rozetli maddeler (Ayet & Dua Kütüphanesi, Kur'an Hikayeleri,
                              Kıssalar, Hadisler, Dualar & Zikirler, Kurumsal) menüden kaldırıldı —
                              hepsi Yol Haritası'nda oylamada. Menüde tek giriş: 🚀 Güncelleme Yol Haritası. */}
                        </div>
                      )}
                    </div>

                    {/* ★ ARAÇLAR — İslami yardımcı araçlar (Güncellemeler'in altında, en üst bölgede) */}
                    <button onClick={() => { setToolsOpen(true); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <span className="text-base">🤲</span>
                      <span>{t("menuAraclar")}</span>
                      <span className="ml-auto rounded-full bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 text-[7px] font-bold text-emerald-300">{t("menuYeni")}</span>
                    </button>

                    {/* ★ MODÜL LİSTESİ — Güncellemeler+Araçlar'ın ALTINA taşındı (kullanıcı kararı 27.09) */}
                    <div className="my-1 border-t border-white/5" />
                    {[
                      { icon: ImageIcon, label: t("menuAyetKartlari"), target: "ayetKartlari" as ModalName },
                      { icon: Compass, label: t("menuKesfet"), target: "kesfet" as ModalName },
                      { icon: Brain, label: t("menuHafizlikTesti"), target: "hafizlikTesti" as ModalName },
                      { icon: NotebookPen, label: t("menuAyetNotlari"), target: "ayetNotlari" as ModalName },
                      { icon: Type, label: t("menuKelimeAtolyesi"), target: "kelimeAtolyesi" as ModalName },
                      { icon: Wand2, label: t("menuArkaPlanUretici"), target: "arkaPlanUretici" as ModalName },
                      { icon: Gift, label: t("menuDavet"), target: "davet" as ModalName },
                      { icon: Film, label: t("menuHaftaninVideosu"), target: "haftaninVideosu" as ModalName },
                      { icon: Package, label: t("menuAyetPaketleri"), target: "ayetPaketleri" as ModalName },
                      { icon: Palette, label: t("menuThemes"), target: "themes" as ModalName },
                      { icon: BookOpen, label: t("menuKuran"), target: "quranLearn" as ModalName },
                      { icon: Info, label: t("menuSiteHakkinda"), target: "siteHakkinda" as ModalName },
                      { icon: Moon, label: t("menuRamazan"), target: "ramazan" as ModalName },
                      { icon: CalendarDays, label: t("menuOzelGunTakvimi"), target: "ozelGunTakvimi" as ModalName },
                    ].map((item) => (
                      <button key={item.target} onClick={() => { setModal(item.target); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                        <item.icon size={14} style={{ color: "var(--accent)" }} />
                        {item.label}
                      </button>
                    ))}

                    <button onClick={() => { setModal("contact"); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <HelpCircle size={14} style={{ color: "var(--accent)" }} />
                      {t("menuSuggest")} / {t("menuComplaint")}
                    </button>
                    {/* ★ ADMIN BÖLÜMÜ (kullanıcı emri 28.09): üst bar temizlendi,
                        admin kontrolleri buraya taşındı — yalnız admin görünür.
                        ★ KALICI EMİR: ADMINE HER KİLİT AÇIK — isMasterSürüm tüm
                        tier/v2/pro/elit/atmosfer kilitlerini geçer. BU DAVRANIŞ
                        ASLA DEĞİŞTİRİLMEZ; yeni kilit eklenirken isMasterSürüm
                        (adminGodMode) kontrolünden geçirilmek ZORUNDADIR. */}
                    {user && (isAdminEmail(user.email) || isMasterSürüm) && (
                      <div className="mt-1 border-t border-amber-400/20 px-2 py-1.5">
                        <button
                          data-admin-ana-btn="true"
                          onClick={() => { openAdminDashboard().then(() => setModal("adminDashboard")); setMenuOpen(false); }}
                          className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[11px] font-black text-amber-300 transition hover:bg-amber-500/10"
                        >
                          <Shield size={14} className="text-amber-400" />
                          <span className="flex-1">ADMIN PANEL</span>
                          {banCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-full bg-red-500/20 border border-red-500/40 px-1 text-[8.5px] font-black text-red-300">
                              <Lightbulb size={9} className="animate-pulse text-amber-300" fill="currentColor" />
                              {banCount}
                            </span>
                          )}
                        </button>
                        {isMasterSürüm && (
                          <button
                            onClick={() => { setAdminGodMode(false); setSmartAiEnabled(false); setBatchFormats(["9:16"]); notify("👋 Admin modundan çıkıldı — site normal kullanıcı modunda"); setMenuOpen(false); }}
                            className="flex min-h-[42px] w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[10.5px] font-bold text-emerald-300/90 transition hover:bg-emerald-500/10"
                            title="Admin yetkilerini kapatır — sayfayı normal ziyaretçi gibi gösterir; giriş/üyelik oturumun DOKUNMAZ"
                          >
                            <ShieldOff size={14} className="text-emerald-400" />
                            <span className="flex-1">ADMIN · MODU KAPAT</span>
                          </button>
                        )}
                      </div>
                    )}
                    <div className="mt-1 border-t border-white/5 px-4 py-2.5">
                      <button
                        onClick={() => { openPremium("uyelik"); setMenuOpen(false); }}
                        className="flex min-h-[42px] w-full items-center gap-2 rounded-xl py-2 px-1 text-left text-[11px] font-bold text-[color:var(--accent-2)] transition hover:bg-white/5 hover:text-white"
                      >
                        <Gem size={14} style={{ color: "var(--accent)" }} />
                        <span>{t("premium")}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ★ HEADER ÇAKIŞMA FIX (30.09, kullanıcı bildirimi): logo eski haliyle
              `absolute left-[68px]` ile akıştan kopmuştu — 640-1000px arası (yatay telefon,
              küçük pencere) jeton/üyelik rozetleri logonun ÜZERİNE biniyordu. Artık logo
              akış içinde (flex) — çakışma matematiksel olarak imkânsız. Dar ekranda
              "STÜDYO" kelimesi gizlenir, marka logosu+NÛR olarak kalır. */}
          <div className="flex shrink-0 items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/logo.png" alt="Nûr Stüdyo Logo" className="h-7 w-7 rounded-lg object-contain shadow-md border border-[color:var(--accent)]/30" />
            <span className="font-display text-base font-black tracking-[.2em]" style={{ color: "var(--accent-2)" }}>NÛR</span>
            <span className="hidden font-display text-base font-black tracking-[.2em] sm:inline" style={{ color: "var(--accent)" }}>STÜDYO</span>
          </div>
          {/* ★ MOBİL HAK GÖSTERGESİ: masaüstündeki jeton/üyelik rozetleri sm:flex ile gizliydi —
              telefonda hakları hiç göremiyordu. Logo yanında kompakt sürüm: jeton + tier, tıklayınca panel açılır.
              ★ RESPONSIVE TASARIM (30.09, kullanıcı emri): bu gösterge DAR ekranda (sm altı)
              GÖRÜNÜR, ekran büyüyünce gizlenir — yerini masaüstündeki sağ rozetlere bırakır.
              Girişli kullanıcı: jeton + tier · Misafir: kalan deneme hakkı rozeti. */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                onClick={() => openPremium("jeton")}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black tabular-nums"
                style={{ background: "rgba(215,170,82,.12)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)", color: "var(--accent-2)" }}
                title="Üretim hakların"
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                  <Coins size={8} className="text-black" strokeWidth={3} />
                </span>
                {(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) ? "∞" : jetonCount}
              </button>
              <button
                onClick={() => openPremium("uyelik")}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold"
                style={{ background: "rgba(215,170,82,.10)", boxShadow: "0 0 0 1px rgba(215,170,82,.30)", color: "var(--accent-2)" }}
                title="Üyelik durumu"
              >
                <Gem size={10} style={{ color: "var(--accent)" }} />{TIER_LABEL[tier || "free"] || "Free"}
              </button>
            </div>
          ) : (
            /* ★ MİSAFİR HAK ROZETİ — dar ekranda kalan deneme hakkını gösterir,
               büyüyünce gizlenir (masaüstünde giriş modalı zaten hakkı anlatır) */
            <button
              onClick={() => setModal("login")}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold sm:hidden"
              style={{ background: "rgba(215,170,82,.10)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)", color: "var(--accent-2)" }}
              title={misafirKalanHak !== undefined && misafirKalanHak <= 0 ? "Deneme hakkın bitti — ücretsiz üye ol" : "Misafir deneme hakların — üye ol, +20 jeton kazan"}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <Coins size={8} className="text-black" strokeWidth={3} />
              </span>
              {misafirKalanHak !== undefined && misafirKalanHak <= 0 ? "🎁 Üye Ol" : `${misafirKalanHak ?? 2} deneme`}
            </button>
          )}

          {/* ★ LANSMAN TEMİZLİĞİ (kullanıcı emri 28.09): ADMIN PANEL / ADMIN·ÇIKIŞ
              pill'leri ÜST BAR'DAN KALDIRILDI — yer kaplamasın, arayüz tertemiz.
              Admin kontrolleri artık sol menünün altındaki ADMIN bölümünde (aşağıda). */}
          {/* ★ overflow-hidden YOK (02.10 fix): dil dropdown'u bu konteynerin ALTINA
              taşar; overflow-hidden onu klipleyip "buton açıyor ama menü görünmüyor"
              yapışıyordu. Taşma riski yok — pill'ler zaten sm:flex/hidden ile kısalıyor. */}
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {/* ★ ADMIN PILL (30.09, kullanıcı emri): admin kontrolleri yalnız mobil menüde
                kalmıştı — masaüstünde admin panele UI'dan ulaşamıyordu. Üst bara gizli
                admin pill'i eklendi: yalnız admin e-postası (env) veya master sürüm görür.
                Normal kullanıcıya ASLA görünmez — sunucu zaten 3 katman koruyor. */}
            {user && (isAdminEmail(user.email) || isMasterSürüm) && (
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  onClick={() => { void openAdminDashboard().then(() => setModal("adminDashboard")); }}
                  className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
                  style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
                  title={`Admin Paneli Aç — ${user.email || ""}`}
                >
                  <Shield size={11} className="text-amber-400" />
                  ADMIN
                  {banCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/25 border border-red-500/40 px-1 text-[8px] font-black text-red-300">{banCount}</span>
                  )}
                </button>
                {isMasterSürüm && (
                  <button
                    onClick={() => { setAdminGodMode(false); setSmartAiEnabled(false); setBatchFormats(["9:16"]); notify("👋 Admin modundan çıkıldı — site normal kullanıcı modunda"); }}
                    className="glass-soft rounded-full p-1.5 text-emerald-300/80 transition hover:scale-105 hover:text-emerald-300"
                    title="Admin modundan çık — admin yetkilerini kapatır, giriş/üyelik oturumun DOKUNMAZ"
                  >
                    <ShieldOff size={11} />
                  </button>
                )}
              </div>
            )}
            {/* ★ JETON SAYACI — Dual Vault (Süresiz Satın Alınan + Günlük) — SADECE GİRİŞ YAPMIŞ */}
            {user && (() => {
              const vault = getJetonVault();
              return (
                <button
                  onClick={() => openPremium("jeton")}
                  className="glass-soft group relative hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tabular-nums transition hover:scale-105 sm:flex cursor-pointer"
                  style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.3)" }}
                  title={(isMasterSürüm || isAdminEmail(user?.email || "")) ? `♾️ SINIRSIZ — Admin (${user?.email || ""})` : `Kısa: ${getPackRights().kisa} | Uzun: ${getPackRights().uzun} | Tam: ${getPackRights().tam}`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                    <Coins size={9} className="text-black" strokeWidth={3} />
                  </span>
                  <span className="transition-all group-hover:text-white">
                    {(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) ? "♾️ SINIRSIZ" : jetonCount}
                  </span>
                  {!(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) && (
                    <span className="hidden text-[9px] font-bold tracking-wide text-white/50 sm:inline">Üretim Hakkı</span>
                  )}
                </button>
              );
            })()}
            {/* ★ ÜYELİK DURUMU — Mevcut tier adını göster */}
            <button className="glass-soft relative hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold sm:flex transition hover:scale-105" style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)" }} onClick={() => openPremium("uyelik")}>
              <Gem size={11} style={{ color: "var(--accent)" }} />{user ? (TIER_LABEL[tier || "free"] || t("free")) : t("premium")}
            </button>
            <div className="relative">
              <button className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold text-white/70" onClick={() => setLangOpen((value) => !value)}>
                {LANGS.find((item) => item.code === lang)?.flag}<ChevronDown size={10} />
              </button>
              {langOpen ? (
                <div className="glass modal-in absolute right-0 top-10 z-50 w-40 rounded-xl p-1.5 shadow-2xl">
                  {LANGS.map((item) => (
                    <button key={item.code} onClick={() => { setLang(item.code); setLangOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] text-white/65 hover:bg-white/5">
                      <span>{item.flag}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.code === lang ? <Check size={11} style={{ color: "var(--accent)" }} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {/* ★ HEDİYE KODU */}
            <span className="glass-soft hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold text-white/55">
              <span>🎁</span>Hediye Kodu
            </span>
            {/* ★ AYET KÜTÜPHANESİ — ayet seç, kartı fotoğraf olarak indir (i18n: menuAyetKartlari) */}
            <button onClick={() => setModal("ayetKartlari")} className="glass-soft hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition hover:scale-105 md:flex" style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.2)" }}>
              <ImageIcon size={11} style={{ color: "var(--accent)" }} />{t("menuAyetKartlari")}
            </button>
            {/* ★ KUR'AN — tek pill, learn/listen sekmeleri modal içinde */}
            <button onClick={() => setModal("quranLearn")} className="glass-soft hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition hover:scale-105 md:flex" style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.2)" }}>
              <BookOpen size={11} style={{ color: "var(--accent)" }} />Kur'an
            </button>
            <button onClick={() => setModal("prayer")} className="glass-soft flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Moon size={11} />
              <span className="hidden sm:inline">{nextPrayer ? `${nextPrayer.name} ${formatRemaining(nextPrayer.diff)}` : prayerCity}</span>
            </button>
          </div>
        </div>
      </header>
      {/* ★ ARAÇLAR PANELİ */}
      <IslamicToolsPanel
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        prayerCity={prayerCity}
        setPrayerCity={setPrayerCity}
        prayerTimings={prayerTimings}
      />
    </>
  );
};
