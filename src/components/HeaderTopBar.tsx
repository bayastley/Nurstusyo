import React from "react";
import type { HeaderTopBarProps } from "./headerTopBarTypes";
import {
  Sparkles, Menu, X, LogIn, UserPlus, BookOpen, HelpCircle, Palette, Headphones,
  LibraryBig, Shield, ShieldOff, Coins, Gem, ChevronDown, Check, Moon, Heart, Lightbulb,
  Image as ImageIcon, Info, Package, CalendarDays, Compass, Brain, NotebookPen, Type, Wand2, Gift, Film, Radio,
} from "lucide-react";
import { getBanLogs } from "../services/adminSyncService";
import { IslamicToolsPanel } from "./IslamicToolsPanel";
import { LANGS, T, translate, vakitAdi, sureceCevir, type Lang } from "../i18n";
import { LockBadge } from "./LockBadge";
import { isAdminEmail, getJetonVault, getPackRights, isTrialActive, getTrialDaysLeft, isSadikUye, tierAtLeast, getCurrentTier } from "../tier";
import { TIER_LABEL } from "./premiumModalHelpers";
import { getSystemConfig, fetchRemoteConfig, getFeatureLock, type DynamicModule } from "../services/adminSyncService";
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
  // ★ 18.10 SEVAP KÖŞESİ KÖPRÜSÜ (kullanıcı emri): Kur'an ekranındaki ✨ butonu
  //   bu event'i basar → Araçlar paneli buradan açılır (zikirmatik + hatim + sevap tek yer)
  React.useEffect(() => {
    const ac = () => setToolsOpen(true);
    window.addEventListener("nur_araclar_ac", ac);
    return () => window.removeEventListener("nur_araclar_ac", ac);
  }, []);

  // ★ 25.10 MARQUEE ÖLÇÜMÜ — İSLÂMÎ ÖĞRENİYORUM etiketi haber pill'ine sığmazsa
  //   sola doğru kayar (kelime tamamen görünür). scrollWidth − clientWidth > 2px
  //   ise .nur-marquee-kayar sınıfı + --nur-marquee-fazla CSS değişkeni yazılır.
  const kesfetMarqueeRef = React.useRef<HTMLSpanElement | null>(null);
  React.useEffect(() => {
    const el = kesfetMarqueeRef.current;
    if (!el) return;
    const olc = () => {
      const fazla = el.scrollWidth - el.clientWidth;
      if (fazla > 2) {
        el.style.setProperty("--nur-marquee-fazla", `${fazla}px`);
        el.classList.add("nur-marquee-kayar");
      } else {
        el.classList.remove("nur-marquee-kayar");
      }
    };
    olc();
    window.addEventListener("resize", olc);
    return () => window.removeEventListener("resize", olc);
  }, []);

  // ★ 23.10 TAM MODÜL MENÜSÜ + ÜYELİK DAĞITIMI (kullanıcı emri):
  //   "bütün özellikler sol üç çizgide gözüksün, aç; üyeliklere dağıt".
  //   • Her özellik menüde GÖRÜNÜR ve SATIR AÇIK — artık tıklanamaz 🔒 V2 satırı yok.
  //   • Üyelik dağıtımı (hedef alanı): free satır herkese açılır; pro/elit satırı
  //     kullanıcının tier'ı yetersizse PremiumModal'ı hedef kartla açar (satır kilitli değil).
  //   • Admin/master'da her satır serbest (KALICI EMİR: adminte her kilit açık).
  //   • Görsel dağılım artık demokratik: Roads RoadmapModal'dan bağımsız.
  type MenuPozisyon = { icon: React.ElementType; label: string; target: ModalName; hedef: "free" | "pro" | "elit"; kabe?: boolean };
  const MENU_OZELLIKLER: MenuPozisyon[] = [
    { icon: ImageIcon, label: t("menuAyetKartlari"), target: "ayetKartlari" as ModalName, hedef: "pro" },
    { icon: Package, label: t("menuAyetPaketleri"), target: "ayetPaketleri" as ModalName, hedef: "pro" },
    { icon: Palette, label: t("menuThemes"), target: "themes" as ModalName, hedef: "free" },
    { icon: Type, label: "Kelime Atölyesi", target: "kelimeAtolyesi" as ModalName, hedef: "pro" },
    // ★ 25.10 KALICI EMİR: Ayet Notlarım HERKESE ÜCRETSİZ — menüde PRO/ELİT rozet yok,
    //   v2KilitliMi muafiyetiyle modüle de asla v2 kilidi vurulamaz (modalsContainerV2.ts).
    { icon: NotebookPen, label: "Ayet Notlarım", target: "ayetNotlari" as ModalName, hedef: "free" },
    { icon: Wand2, label: "AI Arka Plan Üretici", target: "arkaPlanUretici" as ModalName, hedef: "elit" },
    // ★ 25.10 (kullanıcı emri): "İSLÂMÎ ÖĞRENİYORUM" (eski Keşfet Merkezi) sol menüden
    //   KALDIRILDI — üst barda Kur'an ↔ İçindekiler arasına taşındı (aşağıda, marquee'li).
    { icon: Brain, label: "Hafızlık Testi", target: "hafizlikTesti" as ModalName, hedef: "free" },
    { icon: Film, label: "Haftanın Videosu", target: "haftaninVideosu" as ModalName, hedef: "free" },
    { icon: CalendarDays, label: "Özel Gün Takvimi", target: "ozelGunTakvimi" as ModalName, hedef: "free" },
    { icon: Moon, label: "Ramazan & Kandil", target: "ramazan" as ModalName, hedef: "free" },
    // ★ 23.10 (kullanıcı emri): Kâbe Canlı ve İçindekiler kaldırıldı — ikisi de
    //   zaten üst barda ayrı buton olarak duruyor (yeşil 🕋 + info), menüde
    //   tekrar etmek gereksiz yer kaplıyordu.
    { icon: Heart, label: "Arkadaşını Davet Et · Ödül", target: "davet" as ModalName, hedef: "free" },
    { icon: Sparkles, label: "Kendi Sesinle Üret", target: "kendiSes" as ModalName, hedef: "elit" },
    { icon: Headphones, label: "Sesli Meal · Seslendirme", target: "seslendirme" as ModalName, hedef: "elit" },
  ];

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

  // ★ 17.10 KAPANIŞ TAMAMLAMA (kullanıcı isteği): panel açıkken başka yere
  //   tıklayınca kapansın — sırf backdrop değil, sayfanın HER yerinde.
  //   Kural: mousedown hedefi panel DEĞİLSE panel kapanır; panel içindeki
  //   tıklamalar (alt menüler, admin, davet) etkilenmez.
  React.useEffect(() => {
    if (!menuOpen) return;
    const kapatac = (e: MouseEvent) => {
      const hedef = e.target as HTMLElement | null;
      if (!hedef) return;
      // Panelin kendisi ve data-sidebar-panel işaretli türevi
      if (hedef.closest('[data-sidebar-panel="true"]')) return;
      // Panel açma menü düğmesi (data-minitur="menu") — kapatıp hemen açmasın
      if (hedef.closest('[data-minitur="menu"]')) return;
      // Duman testi kancası — test modunu ENGELLEME
      if (hedef.hasAttribute?.("data-minitur")) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", kapatac);
    return () => document.removeEventListener("mousedown", kapatac);
  }, [menuOpen]);


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
            <span>🎉 {translate(lang, "trialAktif").replace("{n}", String(getTrialDaysLeft()))}</span>
            <button className="ml-2 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold hover:bg-white/30 transition" onClick={() => openPremium("uyelik")}>{translate(lang, "trialHemenUye")}</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="glass sticky top-0 z-[80] border-x-0 border-t-0">
        <div className="relative mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3" data-sidebar-trigger="true">
            <div className="relative">
              <button data-minitur="menu" className="glass-soft rounded-lg p-2 text-white/70 hover:text-white" onClick={() => setMenuOpen((value) => !value)}>
                {menuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
              {menuOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" aria-label={t("hbrMenuKapat")} onClick={() => setMenuOpen(false)} />
                  <div
                    data-sidebar-panel="true"
                    className="modal-in absolute left-0 top-12 z-50 w-60 max-h-[calc(100dvh-72px)] overflow-y-auto rounded-xl py-1.5 shadow-2xl"
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
                          <span className="flex-1 truncate" title={t("hbrHesapDegistir")}>{user.name}</span>
                          {/* ★ SADIK ÜYE İSİM ETİKETİ (06.10, sahibin emri): ismin yanında
                              parantezli gösterişli rozet — ilk 100 kayıt kampanyası.
                              Glow + degrade; notranslate (Google Translate bozmasın). */}
                          {isSadikUye() && (
                            <span
                              title={t("sadikUyeEtiketTitle")}
                              className="notranslate ml-0.5 shrink-0 animate-pulse rounded bg-gradient-to-r from-emerald-500/30 to-teal-400/30 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-emerald-300"
                              style={{ boxShadow: "0 0 10px rgba(52,211,153,.45), inset 0 0 0 1px rgba(52,211,153,.5)" }}
                            >
                              (★sadık)
                            </span>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleLogout({ sunucuOturumuKapat: true }); }} className="text-[9px] text-red-400 hover:text-red-300" title={t("hbrCikisTitle")}>{t("hbrCikis")}</button>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} style={{ color: "var(--accent)" }} />
                          <span>{t("hbrKayitGiris")}</span>
                        </>
                      )}
                    </button>
                    {/* ★ GÜNCELLEMELER EN ÜSTTE (kullanıcı kararı 27.09) — yenilikler ilk bakışta görünsün */}
                    <div
                      // ★ 25.10 (kullanıcı emri): güncellemeler paneli artık HOVER ile DEĞİL,
                      //   SADECE TIKLAMA ile açılır/kapanır (buton onClick toggle);
                      //   kapanış: yeniden tık / menü kapanışı / dışarı tık.
                      >
                      <button
                        type="button"
                        onClick={() => setUpdatesOpen((v) => !v)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] transition hover:bg-white/5 ${updatesOpen ? "bg-white/5 text-white" : "text-white/65 hover:text-white"}`}
                      >
                        <Sparkles size={14} style={{ color: "var(--accent)" }} />
                        <span className="flex-1">{t("hbrGuncellemeler")}</span>
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
                            <p className="mt-0.5 text-[8.5px] text-white/35">{t("hbrV2V3Takvim")}</p>
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
                              <span className="min-w-0 flex-1 truncate">{t("hbrYolHaritasi")}</span>
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black bg-amber-500/20 text-amber-300 animate-pulse">{t("hbrOyla")}</span>
                            </button>
                          </div>

                          {/* ★ SADELEŞTİRME: V2/V3 rozetli maddeler (Ayet & Dua Kütüphanesi, Kur'an Hikayeleri,
                              Kıssalar, Hadisler, Dualar & Zikirler, Kurumsal) menüden kaldırıldı —
                              hepsi Yol Haritası'nda oylamada. Menüde tek giriş: 🚀 Güncelleme Yol Haritası. */}
                        </div>
                      )}
                    </div>

                    {/* ★ ARAÇLAR — İslami yardımcı araçlar (Güncellemeler'in altında, en üst bölgede) */}
                    <button data-minitur="araclar" onClick={() => { setToolsOpen(true); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <span className="text-base">🤲</span>
                      <span>{t("menuAraclar")}</span>
                      <span className="ml-auto rounded-full bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 text-[7px] font-bold text-emerald-300">{t("menuYeni")}</span>
                    </button>

                    {/* ★ 10.10 (GERİ EKLEME, kullanıcı emri): Kur'an Öğren + Dinle butonu
                        sol-üst üç-nokta menüde.
                        ★ 18.10 (kullanıcı emri): "GERİ GELDİ" rozeti KALDIRILDI. */}
                    <button onClick={() => { setModal?.("quranLearn"); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <span className="text-base">📖</span>
                      <span>{`Kur'an Öğreniyorum · Dinliyorum`}</span>
                    </button>

                    {/* ★ 18.10 HAFIZLIK menü girişi buradaydı — QuranLearnModal 3. sekmesine
                        göçürüldü (aynı dosyada alttaki Kur'an girişinin yorumu). */}

                    {/* ★ 18.10 (kullanıcı bildirimi): PWA KURULUM BANNERI bulanamıyordu —
                        menüye kalıcı giriş eklendi; tıklayınca banner İSTİDİĞİ AN acılır */}
                    <button onClick={() => { window.dispatchEvent(new Event("nur_pwa_banner_ac")); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <span className="text-base">📲</span>
                      <span className="flex-1 truncate">Ana Ekrana Ekle · Uygulama Olarak</span>
                      <span className="ml-auto shrink-0 rounded-full bg-sky-500/20 border border-sky-400/30 px-1.5 py-0.5 text-[7px] font-black text-sky-300">PWA</span>
                    </button>

                    {/* ★ MODÜL LİSTESİ — Güncellemeler+Araçlar'ın ALTINA taşındı (kullanıcı kararı 27.09)
                        ★ 08.10 TRIM (kullanıcı emri): Hafızlık Testi, Kur'an, Kâbe Canlı, Haftanın
                        Videosu, Ramazan/Kandil, Keşfet (Hadis&Kıssa&Rehber) kaldırıldı. Kalanlar:
                        Ayet Kütüphanesi, Ayet Notları, Kelime Atölyesi, Arka Plan Üretici, Davet,
                        Ayet Paketleri, Tema Galerisi, Site Hakkında. */}
                    {/* ★ 16.10 GERİ EKLEME (kullanıcı emri): TRIM'de kaldırılan 4 modül menüye geri geldi
                        — Hafızlık Testi, Keşfet Merkezi, Haftanın Videosu, Özel Gün Takvimi.
                        Modal bileşenleri hep duruyordu; yalnız menü girişleri çıkarılmıştı. */}
                    <div className="my-1 border-t border-white/5" />
                    {/* ★ 17.10 V2 KİLİT ÇİPLERİ (kullanıcı emri): oylamaya konan modüller
                        menüde görünsün ama yanında 🔒 V2 rozeti taşı — kullanıcı neden
                        kilitli olduğunu anlar; tıklayınca ModalsContainer v2Gate yol
                        haritasına atar. Admin/master rozet görmez (开关 açık). */}
                    {
                      /* ★ 18.10 (kullanıcı emri): Ayet & Dua Kütüphanesi menüye GERİ EKLENDİ —
                          kodda ADMIN_HARD_KILITLI (modalsContainerV2.ts) onu
                          admin-godmode/Master haricinde HERKESE (misafir dahil) kapalı tutar;
                          ModalsContainer'daki merkezî v2 geçidi kilitliyken modalı bir an
                          bile açmaz, yol haritasına atar. */
                    }
                    {MENU_OZELLIKLER.map((item) => {
                      // ★ 23.10 ÜYELİK DAĞITIMI: satır herkes için GÖRÜNÜR ve TIKLANABİLİR.
                      //   Kullanıcı tier'ı satırın hedefi yerine düşükse PremiumModal hedef
                      //   kartla açılır ("üyelik" sekmesi, pro/elit odak); yeterliyse modal
                      //   doğrudan açılır. Admin/master her satırda serbest (KALICI EMİR).
                      const adminGecis = (user != null && isAdminEmail(user.email || "")) || isMasterSürüm;
                      const mevcutTier: "free" | "pro" | "elit" = adminGecis ? "elit" : (tier || getCurrentTier());
                      // ★ 25.10 TİET KİLİDİ (kullanıcı emri: "elit seçince sadece elit mi alabiliyor"): admin
                      //   panelde modülün kilit seviyesi "Pro üyelere"/"Elit üyelere" seçilirse satırın
                      //   gerçek hedefi O seviye olur — menüde PRO/ELİT rozet, tıklayında o seviyenin
                      //   üyelik kapısı (müşterinin dışı hiçbir yerden örtülmez).
                      const kilitDegeri = getFeatureLock(item.target as string, "free");
                      const efektifHedef: "free" | "pro" | "elit" = (kilitDegeri === "pro" || kilitDegeri === "elit") ? kilitDegeri : item.hedef;
                      const yetersiz = !adminGecis && efektifHedef !== "free" && !tierAtLeast(mevcutTier, efektifHedef);
                      // ★ 25.10 V2 GRİ KİLİT: admin panelde modül "v2"/"v3"'e alındığında menüde GRİ rozet.
                      const v2Kilitli = !adminGecis && (kilitDegeri === "v2" || kilitDegeri === "v3" || kilitDegeri === "off");
                      return (
                      <button
                        key={item.target}
                        onClick={() => {
                          setMenuOpen(false);
                          if (item.kabe) window.dispatchEvent(new Event("nur_kabe_ac"));
                          if (v2Kilitli) { setRoadmapOpen?.(true); return; }
                          if (yetersiz) openPremium("uyelik", efektifHedef === "elit" ? "elit" : "pro");
                          else setModal(item.target);
                        }}
                        className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white"
                      >
                        <item.icon size={14} style={{ color: "var(--accent)" }} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {v2Kilitli && (
                          <span className="ml-auto shrink-0 rounded-full border border-slate-400/40 bg-slate-500/15 px-1.5 py-0.5 text-[7px] font-black tracking-wide text-slate-300" title="Yakında — admin panelden açılır">
                            🔒 V2
                          </span>
                        )}
                        {efektifHedef !== "free" && !adminGecis && !v2Kilitli && (
                          <span
                            className={`ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[7px] font-black tracking-wide ${
                              efektifHedef === "elit"
                                ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300"
                                : "border-amber-400/40 bg-amber-500/15 text-amber-300"
                            }`}
                            title={efektifHedef === "elit" ? "ELİT üyelikle açılır" : "PRO üyelikle açılır"}
                          >
                            {efektifHedef === "elit" ? "ELİT" : "PRO"}
                          </span>
                        )}
                      </button>
                      );
                    })}

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
                          <span className="flex-1">{t("hbrAdminPanel")}</span>
                          {banCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-full bg-red-500/20 border border-red-500/40 px-1 text-[8.5px] font-black text-red-300">
                              <Lightbulb size={9} className="animate-pulse text-amber-300" fill="currentColor" />
                              {banCount}
                            </span>
                          )}
                        </button>
                        {isMasterSürüm && (
                          <button
                            onClick={() => { setAdminGodMode(false); setSmartAiEnabled(false); setBatchFormats(["9:16"]); notify(t("hbrAdminCikisNot")); setMenuOpen(false); }}
                            className="flex min-h-[42px] w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[10.5px] font-bold text-emerald-300/90 transition hover:bg-emerald-500/10"
                            title={t("hbrAdminKapatTitle")}
                          >
                            <ShieldOff size={14} className="text-emerald-400" />
                            <span className="flex-1">{t("hbrAdminKapat")}</span>
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
                    {/* ★ HEDİYE KODU — en altta (02.10, kullanıcı emri: üst bardan buraya taşındı).
                        Şimdilik bildirim verir; kod sistemi geldiğinde buraya input bağlanır. */}
                    <button
                      onClick={() => { notify(t("hbrHediyeKodNot")); setMenuOpen(false); }}
                      className="flex min-h-[42px] w-full items-center gap-3 border-t border-white/5 px-4 py-2.5 text-left text-[11px] text-white/45 transition hover:bg-white/5 hover:text-white"
                    >
                      <Gift size={14} className="opacity-60" style={{ color: "var(--accent)" }} />
                      <span>{t("menuHediyeKodu")}</span>
                    </button>
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
                title={t("hbrUretimHaklarin")}
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
                title={t("hbrUyelikTitle")}
              >
                <Gem size={10} style={{ color: "var(--accent)" }} />{TIER_LABEL[tier || "free"] || "Free"}
                {isSadikUye() && <span className="ml-0.5 rounded bg-emerald-400/20 px-1 py-px text-[8px] font-black text-emerald-300">★</span>}
              </button>
            </div>
          ) : (
            /* ★ MİSAFİR HAK ROZETİ — dar ekranda kalan deneme hakkını gösterir,
               büyüyünce gizlenir (masaüstünde giriş modalı zaten hakkı anlatır) */
            <button
              onClick={() => setModal("login")}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold sm:hidden"
              style={{ background: "rgba(215,170,82,.10)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)", color: "var(--accent-2)" }}
              title={misafirKalanHak !== undefined && misafirKalanHak <= 0 ? t("hbrDenemeBittiTitle") : t("hbrDenemeTitle")}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <Coins size={8} className="text-black" strokeWidth={3} />
              </span>
              {misafirKalanHak !== undefined && misafirKalanHak <= 0 ? t("hbrUyeOl") : t("hbrDenemeKalan").replace("{n}", String(misafirKalanHak ?? 2))}
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
                  title={`${t("hbrAdminPillTitle")} — ${user.email || ""}`}
                >
                  <Shield size={11} className="text-amber-400" />
                  ADMIN
                  {banCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/25 border border-red-500/40 px-1 text-[8px] font-black text-red-300">{banCount}</span>
                  )}
                </button>
                {isMasterSürüm && (
                  <button
                    onClick={() => { setAdminGodMode(false); setSmartAiEnabled(false); setBatchFormats(["9:16"]); notify(t("hbrAdminCikisNot")); }}
                    className="glass-soft rounded-full p-1.5 text-emerald-300/80 transition hover:scale-105 hover:text-emerald-300"
                    title={t("hbrAdminKapatTitle")}
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
                  title={(isMasterSürüm || isAdminEmail(user?.email || "")) ? `${t("hbrSinirsizAdmin")} (${user?.email || ""})` : t("hbrHakOzet").replace("{k}", String(getPackRights().kisa)).replace("{u}", String(getPackRights().uzun)).replace("{t}", String(getPackRights().tam))}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                    <Coins size={9} className="text-black" strokeWidth={3} />
                  </span>
                  <span className="transition-all group-hover:text-white">
                    {(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) ? t("hbrSinirsiz") : jetonCount}
                  </span>
                  {!(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) && (
                    <span className="hidden text-[9px] font-bold tracking-wide text-white/50 sm:inline">{t("hbrUretimHakki")}</span>
                  )}
                </button>
              );
            })()}
            {/* ★ ÜYELİK DURUMU — Mevcut tier adını göster */}
            <button className="glass-soft relative hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold sm:flex transition hover:scale-105" style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)" }} onClick={() => openPremium("uyelik")}>
              <Gem size={11} style={{ color: "var(--accent)" }} />{user ? (TIER_LABEL[tier || "free"] || t("free")) : t("premium")}
              {user && isSadikUye() && <span title={t("sadikUyeEtiketTitle")} className="rounded bg-emerald-400/20 px-1 py-px text-[8px] font-black text-emerald-300">★ SADIK ÜYE</span>}
            </button>
            <div className="relative notranslate" translate="no">
              {/* ★ 04.10: dil seçici — sade kodlar (TR/EN/AR/ID/UR) + notranslate.
                  dilAdi() isimlerini Google Translate bozuyordu ("di!TR", "şeyretme"…);
                  kullanıcı emri: sadece kodlar, hiçbir dilde çevrilmesin. */}
              <button className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold text-white/70" onClick={() => setLangOpen((value) => !value)}>
                <span className="font-black tracking-wide">{(lang || "tr").toUpperCase()}</span><ChevronDown size={10} />
              </button>
              {langOpen ? (
                <div className="glass modal-in absolute right-0 top-10 z-50 w-24 rounded-xl p-1.5 shadow-2xl">
                  {LANGS.map((item) => (
                    <button key={item.code} onClick={() => { setLang(item.code); setLangOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] text-white/65 hover:bg-white/5">
                      <span className="flex-1 font-black tracking-wide">{item.code.toUpperCase()}</span>
                      {item.code === lang ? <Check size={11} style={{ color: "var(--accent)" }} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {/* ★ HEDİYE KODU ÜST BARDAN KALDIRILDI (02.10, kullanıcı emri) —
                sol menünün en altındaki "Hediye Kodu" öğesine taşındı */}
            {/* ★ AYET KÜTÜPHANESİ + KUR'AN üst bardan KALDIRILDI (08.10, kullanıcı emri):
                ikisi de sol üç nokta menüsünde zaten var — üst bar kalabalık olmasın. */}
            {/* ★ 18.10 SIRA DEĞİŞİMİ (kullanıcı emri): KÂBE CANLI ile İÇİNDEKİLER artık YAN YANA —
                Kâbe Canlı → İçindekiler → Seslendirme. (Önceki: İçindekiler Kâbe'yle arada
                değil ayrıydı; şimdi Kâbe + İçindekiler komşu.) */}
            {/* ★ KÂBE CANLI (08.10, kullanıcı emri): üst barda tek tık,
                kırmızı CANLI noktasıyla. Kur'an ekranını açar + window event ile Kâbe yayınını tetikler. */}
            <button data-minitur="kabe-canli" onClick={() => { setModal("quranLearn"); window.dispatchEvent(new Event("nur_kabe_ac")); }} className="glass-soft hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black text-emerald-300 transition hover:scale-105 md:flex" style={{ boxShadow: "0 0 0 1px rgba(16,185,129,.35)" }} title={t("menuKabeCanli") + t("hbrKabeCanliTitle")}>
              🕋 {t("menuKabeCanli")}
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-red-500" />
              </span>
            </button>
            {/* ★ 18.10 (kullanıcı emri): "Kur'an" bölümü ana ekran üst barda — Hafızlık Testi'nin
                yerine. Tek tık Kur'an ekranını açar (İçindeki öğrenme/test modülleri orada).
                Hafızlık Testi silinmedi — Kur'an ekranına gömülü, oradan da erişilir. */}
            <button data-minitur="kuran-bolumu" onClick={() => setModal("quranLearn")}
              className="glass-soft hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105 md:flex"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
              title="Kur'an Sayfaları · Dinle · Hafızlık Testi · Ögünme — hepsi tek yerde">
              📖 Kur'an
            </button>
            {/* ★ 25.10 İSLÂMÎ ÖĞRENİYORUM (kullanıcı emri) — eski "Keşfet" üst barda,
                Kur'an ↔ İçindekiler ARASINA kondu; sol menüden kaldırıldı. Etiket panele
                sığmazsa sola doğru kayar (marquee) — kelime tamamlanır. */}
            <button data-minitur="islami-ogreniyorum" onClick={() => setModal("kesfet")}
              className="glass-soft hidden max-w-[190px] items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105 md:flex"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
              title="İSLÂMÎ ÖĞRENİYORUM — Hadis · Kıssa · Soru-Cevap · Namaz · Dua · Tecvid Rehberleri">
              🧭 <span ref={kesfetMarqueeRef} className="nur-marquee whitespace-nowrap">İSLÂMÎ ÖĞRENİYORUM</span>
            </button>
            {/* ★ 16.10 İÇİNDEKİLER — sol menüdeki aynı "siteHakkinda" modalını açan üst-bar butonu.
                ★ 18.10 (kullanıcı emri): Hafızlık Testi butonu Kâbe-İçindekiler arasına kondu.
                Modal içeriğine TANITIM bölümü eklendi (R2'den video, SiteHakkindaModal'da). */}
            <button data-minitur="icindekiler" onClick={() => setModal("siteHakkinda")}
              className="glass-soft hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105 md:flex"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
              title={t("v2SiteHakkindaTitle")}>
              📑 İÇİNDEKİLER
            </button>
            {/* ★ SESLENDİRME (14.10) — mockup ai-mockup/ana-ekran-seslendirme.html'den işlenmiş modül:
                üst barda tek tık → Sesli Meal ekranı. Kırmızı X + dış-tık + Esc ile kapanır.
                ★ 20.10 GİZLE (YARIN-planı Ö1 deseni, kullanıcı emri): ADMIN hariç herkesten
                BUTON TAMAMEN KALDIRILDI — kilitli görünmez, "yok". Canlı TTS API (nur-tts)
                500 fix'i (lazy-load bb328a3) deploy olup doğrulanana kadar halka açık
                bozuk buton göstermek istemiyoruz; admin kendi hesabında test etmeye devam eder.
                ★ 20.10 MOBİL DÜZELTME (kullanıcı canlı raporu: "admin mobilde de görmüyor"):
                eski sınıf "hidden md:flex" butonu <768px'te TAMAMEN gizliyordu — admin
                mobilde de bakıp boş görüyordu. Artık her boyutta görünür.
                ★ 20.10 ELİT KAPISI (kullanıcı emri: "seslendirme elit üyelere açılacak,
                herkese kilitli olsun, olurda açarsam gizlilik elitlere uygun"):
                admin/master KALICI muaf (KALICI EMİR: adminde her kilit açık); elit üye
                da görür/tıklar; diğer herkes buton YOK. Render kapısı + ModalsContainer
                mount kapısı ikisi birden devrede. */}
            {(isAdminEmail(user?.email || "") || isMasterSürüm || tier === "elit") && (
              <button data-minitur="seslendirme" onClick={() => setModal("seslendirme")}
                className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
                style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
                title="Sesli Meal / Kıssa Seslendirme (admin test)">
                🔊 Seslendirme
              </button>
            )}
            <button onClick={() => setModal("prayer")} className="glass-soft flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Moon size={11} />
              <span className="hidden sm:inline">{nextPrayer ? `${vakitAdi(lang, nextPrayer.name)} ${sureceCevir(lang, formatRemaining(nextPrayer.diff))}` : prayerCity}</span>
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
