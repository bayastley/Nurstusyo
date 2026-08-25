import React from "react";
import type { HeaderTopBarProps } from "./headerTopBarTypes";
import {
  Sparkles, Menu, X, LogIn, UserPlus, BookOpen, HelpCircle, Palette,
  LibraryBig, Shield, Coins, Gem, ChevronDown, Check, Moon, Heart, Lightbulb, Film,
} from "lucide-react";
import { getBanLogs } from "../services/adminSyncService";
import { LANGS, T, type Lang } from "../i18n";
import { LockBadge } from "./LockBadge";
import { isAdminEmail, getJetonVault } from "../tier";
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
  formatRemaining,
  t,
}) => {
  const [dynamicModules, setDynamicModules] = React.useState<DynamicModule[]>(() => getSystemConfig().modules);
  const [updatesOpen, setUpdatesOpen] = React.useState(false);
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
                          <span className="flex-1 truncate">{user.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="text-[9px] text-red-400 hover:text-red-300">Çıkış</button>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} style={{ color: "var(--accent)" }} />
                          <span>Kayıt Ol / Giriş Yap</span>
                        </>
                      )}
                    </button>
                    {[
                      { icon: Palette, label: t("menuThemes"), target: "themes" as ModalName },
                    ].map((item) => (
                      <button key={item.label} onClick={() => { setModal(item.target); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                        <item.icon size={14} style={{ color: "var(--accent)" }} />
                        {item.label}
                      </button>
                    ))}

                    {/* ★ GÜNCELLEMELER — hover/tıkla ile sağa açılan kilitli modül paneli */}
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
                            {dynamicModules.filter((m) => m.active && m.lock !== "free").length + 1}
                          </span>
                          <ChevronDown size={11} className="-rotate-90 opacity-60" />
                        </span>
                      </button>

                      {updatesOpen && (
                        <div
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
                          <div className="border-b border-white/5 px-3 pb-2 pt-1">
                            <p className="text-[9.5px] font-black uppercase tracking-widest" style={{ color: "var(--accent-2)" }}>
                              Yakında Gelecek Modüller
                            </p>
                            <p className="mt-0.5 text-[8.5px] text-white/35">V2 & V3 güncelleme takvimi</p>
                          </div>

                          {/* ★ Ayet & Dua Kütüphanesi — V2 kilidiyle Güncellemeler panelinde */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isMasterSürüm) return;
                                setModal("library");
                                setUpdatesOpen(false);
                                setMenuOpen(false);
                              }}
                              className={`relative flex w-full items-center gap-2.5 px-3 py-2.5 pr-12 text-left text-[10.5px] transition hover:bg-white/5 ${
                                isMasterSürüm ? "text-white/85 font-medium" : "text-white/50"
                              }`}
                            >
                              <BookOpen size={13} style={{ color: "var(--accent)" }} className="shrink-0" />
                              <span className="min-w-0 flex-1 truncate">Ayet & Dua Kütüphanesi</span>
                            </button>
                            {!isMasterSürüm && (
                              <LockBadge kind="v2" position="top-right" tooltipText="V2 Güncellemesi Yakında" />
                            )}
                          </div>

                          {dynamicModules.filter((m) => m.active).map((item) => {
                            const IconComponent = item.iconName === "Sparkles" ? Sparkles : item.iconName === "LibraryBig" ? LibraryBig : item.iconName === "Heart" ? Heart : BookOpen;
                            const isUnlocked = item.lock === "free" || isMasterSürüm;
                            return (
                              <div key={item.id} className="relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isUnlocked) return;
                                    if (item.category === "hadis") { setLibType("hadis"); setModal("library"); }
                                    else if (item.category === "dua") { setLibType("dua"); setModal("library"); }
                                    else setModal("stories");
                                    setUpdatesOpen(false);
                                    setMenuOpen(false);
                                  }}
                                  className={`relative flex w-full items-center gap-2.5 px-3 py-2.5 pr-12 text-left text-[10.5px] transition hover:bg-white/5 ${
                                    isUnlocked ? "text-white/85 font-medium" : "text-white/50"
                                  }`}
                                >
                                  <IconComponent size={13} style={{ color: "var(--accent)" }} className="shrink-0" />
                                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                                </button>
                                {!isUnlocked && (
                                  <LockBadge
                                    kind={item.lock === "v2" || item.lock === "v3" ? item.lock : item.lock === "pro" ? "pro" : "elit"}
                                    position="top-right"
                                    tooltipText={`${item.lock.toUpperCase()} Güncellemesi Yakında`}
                                  />
                                )}
                              </div>
                            );
                          })}

                          <div className="relative border-t border-white/5">
                            <button
                              type="button"
                              className="relative flex w-full items-center gap-2.5 px-3 py-2.5 pr-12 text-left text-[10.5px] text-white/40 cursor-not-allowed"
                            >
                              <Shield size={13} style={{ color: "var(--accent)" }} className="shrink-0" />
                              <span className="min-w-0 flex-1 truncate">Kurumsal Üyelik & Ajans</span>
                            </button>
                            <LockBadge kind="v3" position="top-right" tooltipText="V3 · Kurumsal Paketler Yakında" />
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={() => { setModal("contact"); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <HelpCircle size={14} style={{ color: "var(--accent)" }} />
                      {t("menuSuggest")} / {t("menuComplaint")}
                    </button>
                    {(isAdminEmail(user?.email || "") || isMasterSürüm) && (
                      <button onClick={() => { openAdminDashboard().then(() => setModal("adminDashboard")); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold text-amber-300 transition hover:bg-white/5">
                        <Shield size={14} className="text-amber-400" />
                        <span>Admin Yönetim Paneli</span>
                      </button>
                    )}
                    <div className="mt-1 border-t border-white/5 px-4 py-2.5">
                      <button
                        onClick={() => { openPremium("uyelik"); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-xl py-2 px-1 text-left text-[11px] font-bold text-[color:var(--accent-2)] transition hover:bg-white/5 hover:text-white"
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

          <div className="absolute left-[68px] flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/logo.png" alt="Nûr Stüdyo Logo" className="h-7 w-7 rounded-lg object-contain shadow-md border border-[color:var(--accent)]/30" />
            <span className="font-display text-base font-black tracking-[.2em]" style={{ color: "var(--accent-2)" }}>NÛR</span>
            <span className="font-display text-base font-black tracking-[.2em]" style={{ color: "var(--accent)" }}>STÜDYO</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModal("guide")}
              className="hidden items-center gap-1.5 rounded-full border border-[color:var(--accent)]/40 bg-white/[0.05] px-3 py-1.5 text-[9.5px] font-bold text-[color:var(--accent-2)] transition hover:scale-105 hover:bg-white/10 active:scale-95 md:flex cursor-pointer"
              title="Eğitim ve kullanım rehberi videosunu izleyin"
            >
              <Film size={11} style={{ color: "var(--accent)" }} /> Nasıl Kullanılır? (İzle/Öğren)
            </button>
            {(isAdminEmail(user?.email || "") || isMasterSürüm) && (
              <>
                <button
                  type="button"
                  onClick={() => openAdminDashboard().then(() => setModal("adminDashboard"))}
                  className="hidden items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-[9.5px] font-black text-amber-300 shadow-lg transition hover:scale-105 active:scale-95 sm:flex"
                  title="Admin Yönetim Paneli"
                >
                  <Shield size={11} className="text-amber-400" /> ADMIN PANEL
                </button>
                {banCount > 0 && (
                  <button
                    type="button"
                    onClick={() => openAdminDashboard().then(() => setModal("adminDashboard"))}
                    className="relative flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40 text-red-300 shadow-lg transition hover:scale-110 active:scale-95"
                    title={`${banCount} Siber Denetim / Ban Kaydı — Tıkla, incele ve gerekirse banı kaldır`}
                  >
                    <Lightbulb size={13} className="animate-pulse text-amber-300" fill="currentColor" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[7.5px] font-black text-white ring-1 ring-black">
                      {banCount}
                    </span>
                  </button>
                )}
              </>
            )}
            {isMasterSürüm && (
              <button
                type="button"
                onClick={() => { setAdminGodMode(false); setSmartAiEnabled(false); setBatchFormats(["9:16"]); notify("Admin modu kapatıldı"); }}
                className="hidden items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black text-emerald-300 transition hover:bg-emerald-500/20 sm:flex"
                title="Admin modunu kapat"
              >
                <Shield size={10} /> ADMIN · ÇIKIŞ
              </button>
            )}
            {/* ★ JETON SAYACI — Dual Vault (Süresiz Satın Alınan + Günlük) */}
            {(() => {
              const vault = getJetonVault();
              return (
                <button
                  onClick={() => openPremium("jeton")}
                  className="glass-soft group relative hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tabular-nums transition hover:scale-105 sm:flex cursor-pointer"
                  style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.3)" }}
                  title={`Toplam Bakiyeniz: ${jetonCount} ⚡ Üretim hakkı (${vault.purchasedJeton} Satın Alınan + ${vault.subJeton} Günlük Hak)`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                    <Coins size={9} className="text-black" strokeWidth={3} />
                  </span>
                  <span className="transition-all group-hover:text-white">
                    {isMasterSürüm || jetonCount >= 999999 ? "♾️ SINIRSIZ" : jetonCount}
                  </span>
                  {!(isMasterSürüm || jetonCount >= 999999) && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">⚡ Üretim hakkı</span>
                  )}
                </button>
              );
            })()}
            {/* ★ PREMIUM */}
            <button className="glass-soft relative hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold sm:flex transition hover:scale-105" style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)" }} onClick={() => openPremium("uyelik")}>
              <Gem size={11} style={{ color: "var(--accent)" }} />Premium
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
    </>
  );
};
