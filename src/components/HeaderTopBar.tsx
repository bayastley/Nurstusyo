import React from "react";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
import type { HeaderTopBarProps } from "./headerTopBarTypes";
import {
  Sparkles, Menu, X, LogIn, UserPlus, BookOpen, HelpCircle, Palette, Headphones,
  LibraryBig, Shield, ShieldOff, Coins, Gem, ChevronDown, Check, Moon, Heart, Lightbulb,
  Image as ImageIcon, Info, Package, CalendarDays, Compass, Brain, NotebookPen, Type, Wand2, Gift, Film, Radio,
} from "lucide-react";
import { getBanLogs } from "../services/adminSyncService";
import { HeaderMenuCekmece } from "./headerMenuCekmece";
import { HeaderSeritPillBar } from "./headerSeritPillBar";
import { TIER_SOZLUK } from "./headerTierSozluk";
import { IslamicToolsPanel } from "./IslamicToolsPanel";
// ★ 30.10 KIBLE ÜST BARA TAŞINDI (kullanıcı emri): Nur Araçlar'daki QiblaCompass
//   artık üst barda KUR'AN ÖĞRENİYORUM ↔ İSLÂMÎ ÖĞRENİYORUM arasındaki butondan
//   açılır; Nur Araçlar sekmesi kaldırıldı (kaynağın var yeri burası).
import { QiblaCompass } from "./islamicToolsBolumler";
import { LANGS, T, translate, vakitAdi, sureceCevir, type Lang } from "../i18n";
import { LockBadge } from "./LockBadge";
import { isAdminEmail, getJetonVault, getPackRights, isTrialActive, getTrialDaysLeft, tierAtLeast, getCurrentTier, getQuotaLeft, type Tier } from "../tier";
// ★ 26.10 TIER ÇİPİ DİL BAĞI (kullanıcı raporu: "EN seçtim hala Ücretsiz"): eski
//   TIER_LABEL['Ücretsiz'] hardcoded Türkçe'ydi; 5 dile çevrilmiş tierUcretsiz/
//   tierPro/tierElit anahtarları sözlükte zaten vardı — artık oturum dilinden okunur.
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
  // ★ 29.10 ÜST BAR HAK GÖSTERGESİ (kullanıcı: "168 hakkım var 150 yazıyor"):
  //   jetonCount YALNIZ satın alınan paket haklarını içeriyordu (50×3=150);
  //   üyelik haftalık kotası (Tür bazlı getQuotaLeft) hiç katılmıyordu.
  //   Artık rozet = paket hakları + üyelik kotası (PremiumModal'ın 68/50/50
  //   gösterisiyle AYNI matematiği) → 150 + 18 = 168 gibi gerçek totol görünür.
  const aktifTier = ((tier || "free") as Tier) || ("free" as Tier);
  const uyelikKotaToplami = getQuotaLeft("kisa", aktifTier) + getQuotaLeft("uzun", aktifTier) + getQuotaLeft("tam", aktifTier);
  const toplamHak = jetonCount + uyelikKotaToplami;
  const [toolsOpen, setToolsOpen] = React.useState(false);
  // ★ 18.10 SEVAP KÖŞESİ KÖPRÜSÜ (kullanıcı emri): Kur'an ekranındaki ✨ butonu
  //   bu event'i basar → Araçlar paneli buradan açılır (zikirmatik + hatim + sevap tek yer)
  React.useEffect(() => {
    const ac = () => setToolsOpen(true);
    window.addEventListener("nur_araclar_ac", ac);
    return () => window.removeEventListener("nur_araclar_ac", ac);
  }, []);



  // ★ CANLI BAN SAYACI — yeni ban geldiğinde rozet anında güncellenir
  const [banCount, setBanCount] = React.useState<number>(() => getBanLogs().length);
  React.useEffect(() => {
    const iv = window.setInterval(() => setBanCount(getBanLogs().length), 2500);
    return () => window.clearInterval(iv);
  }, []);


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
<HeaderMenuCekmece menuOpen={menuOpen} setMenuOpen={setMenuOpen} setModal={setModal} openAdminDashboard={openAdminDashboard} openPremium={openPremium} setRoadmapOpen={setRoadmapOpen} setAdminGodMode={setAdminGodMode} setSmartAiEnabled={setSmartAiEnabled} setBatchFormats={setBatchFormats} notify={notify} handleLogout={handleLogout} user={user} tier={tier} isMasterSürüm={isMasterSürüm} banCount={banCount} t={t} />
          </div>

          {/* ★ HEADER ÇAKIŞMA FIX (30.09, kullanıcı bildirimi): logo eski haliyle
              `absolute left-[68px]` ile akıştan kopmuştu — 640-1000px arası (yatay telefon,
              küçük pencere) jeton/üyelik rozetleri logonun ÜZERİNE biniyordu. Artık logo
              akış içinde (flex) — çakışma matematiksel olarak imkânsız. Dar ekranda
              "STÜDYO" kelimesi gizlenir, marka logosu+NÛR olarak kalır. */}
          <div className="flex shrink-0 items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/logo.png" alt={t("htLogoAlt")} className="h-7 w-7 rounded-lg object-contain shadow-md border border-[color:var(--accent)]/30" />
            <span className="font-display text-base font-black tracking-[.2em]" style={{ color: "var(--accent-2)" }}>NÛR</span>
            <span className="hidden font-display text-base font-black tracking-[.2em] sm:inline" style={{ color: "var(--accent)" }}>{t("htStudio")}</span>
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
                {(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) ? "∞" : toplamHak}
              </button>
              <button
                onClick={() => openPremium("uyelik")}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold"
                style={{ background: "rgba(215,170,82,.10)", boxShadow: "0 0 0 1px rgba(215,170,82,.30)", color: "var(--accent-2)" }}
                title={t("hbrUyelikTitle")}
              >
                <Gem size={10} style={{ color: "var(--accent)" }} />{t(TIER_SOZLUK[tier || "free"] || "tierUcretsiz")}
                {/* ★ 26.10: yanındaki ★ sadık-üye yıldızı kaldırıldı (sahibin emri) */}
              </button>
            </div>
          ) : (
            /* ★ MİSAFİR HAK ROZETİ — dar ekranda kalan deneme hakkını gösterir,
               büyüyünce gizlenir (masaüstünde giriş modalı zaten hakkı anlatır) */
            <button
              onClick={() => setModal("login")}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:hidden"
              style={{ background: "rgba(215,170,82,.10)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)", color: "var(--accent-2)" }}
              title={misafirKalanHak !== undefined && misafirKalanHak <= 0 ? t("hbrDenemeBittiTitle") : t("hbrDenemeTitle")}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <Coins size={8} className="text-black" strokeWidth={3} />
              </span>
              {/* ★ 01.11 KOMPAKT ROZET (kullanıcı: "şu aşırı büyüyor, ölçünleri görmüyorum"):
                  tam metin yerine sadece ikon + sayı — "2 trials left" uzun yazısı
                  mobilde iki satıra bölüp şeridi ezıyordu. Açıklama tooltip'te duruyor. */}
              {misafirKalanHak !== undefined && misafirKalanHak <= 0 ? t("hbrUyeOl") : String(misafirKalanHak ?? 2)}
            </button>
          )}

          {/* ★ LANSMAN TEMİZLİĞİ (kullanıcı emri 28.09): ADMIN PANEL / ADMIN·ÇIKIŞ
              pill'leri ÜST BAR'DAN KALDIRILDI — yer kaplamasın, arayüz tertemiz.
              Admin kontrolleri artık sol menünün altındaki ADMIN bölümünde (aşağıda). */}
          {/* ★ overflow-hidden YOK (02.10 fix): dil dropdown'u bu konteynerin ALTINA
              taşar; overflow-hidden onu klipleyip "buton açıyor ama menü görünmüyor"
              yapışıyordu. Taşma riski yok — pill'ler zaten sm:flex/hidden ile kısalıyor. */}
          {/* ★ 02.11 İPUCU SARMALAYICI (kullanıcı emri: "hafif görünür yap ki mobilden
              farketsin"): şerit olayınca altına 2px'lik uçuk çizgi — butonsuz, kaplamasız
              hafif kaydırılabilirlik sinyali; masaüstünde gizli. */}
<HeaderSeritPillBar user={user} isMasterSürüm={isMasterSürüm} jetonCount={jetonCount} tier={tier} toplamHak={toplamHak} banCount={banCount} openPremium={openPremium} openAdminDashboard={openAdminDashboard} setModal={setModal} notify={notify} t={t} lang={lang} setLang={setLang} langOpen={langOpen} setLangOpen={setLangOpen} setAdminGodMode={setAdminGodMode} setSmartAiEnabled={setSmartAiEnabled} setBatchFormats={setBatchFormats} misafirKalanHak={misafirKalanHak} nextPrayer={nextPrayer} prayerCity={prayerCity} formatRemaining={formatRemaining} />
        </div>
      </header>
      {/* ★ ARAÇLAR PANELİ */}
      <IslamicToolsPanel
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        lang={lang}
        prayerCity={prayerCity}
        setPrayerCity={setPrayerCity}
        prayerTimings={prayerTimings}
      />
    </>
  );
};
