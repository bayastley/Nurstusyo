import React from "react";
// ★ 04.11 SRP: HeaderTopBar'daki menü çekmecesi (buton + panel + modül listesi + admin bölümü) kendi dosyasına taşındı.
// Bağlamlar satır düzeyinde birebir taşındı; davranış hiç değişmedi.
import { Sparkles, LogIn, X, UserPlus, Menu, HelpCircle, ChevronDown, Shield, ShieldOff, Moon, Heart, Brain, NotebookPen, Type, Wand2, Film, CalendarDays, Gift, Gem, Image as ImageIcon, Package, Palette, Headphones, Lightbulb } from "lucide-react";
import { isAdminEmail, tierAtLeast, getCurrentTier, type Tier } from "../tier";
import { getSystemConfig, fetchRemoteConfig, getFeatureLock, type DynamicModule } from "../services/adminSyncService";
import type { ModalName, User } from "../types";
import type { HeaderTopBarProps } from "./headerTopBarTypes";

// Props alanları HeaderTopBarProps'tan Pick ile alınır (bağlar korunur) — banCount ortak sayaç.
export type HeaderMenuCekmeceProps = Pick<HeaderTopBarProps, "menuOpen" | "setMenuOpen" | "setModal" | "openAdminDashboard" | "openPremium" | "setRoadmapOpen" | "setAdminGodMode" | "setSmartAiEnabled" | "setBatchFormats" | "notify" | "handleLogout" | "user" | "tier" | "isMasterSürüm" | "t"> & { banCount: number };

export const HeaderMenuCekmece: React.FC<HeaderMenuCekmeceProps> = ({
  menuOpen, setMenuOpen, setModal, openAdminDashboard, openPremium, setRoadmapOpen,
  setAdminGodMode, setSmartAiEnabled, setBatchFormats, notify, handleLogout,
  user, tier, isMasterSürüm, banCount, t,
}) => {
  const [dynamicModules, setDynamicModules] = React.useState<DynamicModule[]>(() => getSystemConfig().modules);
  const [updatesOpen, setUpdatesOpen] = React.useState(false);
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
    { icon: Type, label: t("menuKelimeAtolyesi"), target: "kelimeAtolyesi" as ModalName, hedef: "pro" },
    // ★ 25.10 KALICI EMİR: Ayet Notlarım HERKESE ÜCRETSİZ — menüde PRO/ELİT rozet yok,
    //   v2KilitliMi muafiyetiyle modüle de asla v2 kilidi vurulamaz (modalsContainerV2.ts).
    { icon: NotebookPen, label: t("menuAyetNotlari"), target: "ayetNotlari" as ModalName, hedef: "free" },
    { icon: Wand2, label: t("menuArkaPlanUretici"), target: "arkaPlanUretici" as ModalName, hedef: "elit" },
    // ★ 25.10 (kullanıcı emri): "İSLÂMÎ ÖĞRENİYORUM" (eski Keşfet Merkezi) sol menüden
    //   KALDIRILDI — üst barda Kur'an ↔ İçindekiler arasına taşındı (aşağıda, marquee'li).
    { icon: Brain, label: t("menuKelimeQuizi"), target: "kelimeQuizi" as ModalName, hedef: "free" },
    { icon: Brain, label: t("menuHafizlikTesti"), target: "hafizlikTesti" as ModalName, hedef: "free" },
    { icon: Film, label: t("menuHaftaninVideosu"), target: "haftaninVideosu" as ModalName, hedef: "free" },
    { icon: CalendarDays, label: t("menuOzelGunTakvimi"), target: "ozelGunTakvimi" as ModalName, hedef: "free" },
    { icon: Moon, label: t("menuRamazan"), target: "ramazan" as ModalName, hedef: "free" },
    // ★ 23.10 (kullanıcı emri): Kâbe Canlı ve İçindekiler kaldırıldı — ikisi de
    //   zaten üst barda ayrı buton olarak duruyor (yeşil 🕋 + info), menüde
    //   tekrar etmek gereksiz yer kaplıyordu.
    { icon: Heart, label: t("menuDavetOdu"), target: "davet" as ModalName, hedef: "free" },
    { icon: Sparkles, label: t("menuKendiSesinleUret"), target: "kendiSes" as ModalName, hedef: "elit" },
    // ★ 26.10 KALICI EMİR: sesli meal/seslendirme SADECE ADİMENE — üyeler ve normal
    //   kullanıcılar menüde görmesin bile (elit dahil). Menü listesi array içinde
    //   admin kapısıyla koşullu kurulur.
    ...((((user != null && isAdminEmail(user.email || "")) || isMasterSürüm) ? [{ icon: Headphones, label: t("menuSesliMeal"), target: "seslendirme" as ModalName, hedef: "elit" as const }] : [])),
  ];
  React.useEffect(() => {
    fetchRemoteConfig().then((cfg) => {
      if (cfg?.modules) setDynamicModules(cfg.modules);
    });
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) setUpdatesOpen(false);
  }, [menuOpen]);
  return (
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
                          {/* ★ 26.10 SADIK ÜYE İSİM ROZETİ KALDIRILDI (sahibin emri:
                              ömür boyu +1 kampanzası bitmıştır — 7 hafta PRO kampanyası yerini aldı). */}
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
                              {t("hbrYakindaModuller")}
                            </p>
                            <p className="mt-0.5 text-[8.5px] text-white/35">{t("hbrV2V3Takvim")}</p>
                          </div>

                          {/* ★ 25.10 OYLAMA KALDIRILDI (sahibin emri): Yol Haritası artık
                              YALNIZCA admin'e görünür; normal kullanıcı oy/kilitleme
                              vitrinini görmez. Kilidi kapalı modüller (v2/v3/off)
                              menüde 'Yakında' rozetli kalır, tık anında net bildirim verir. */}
                          {(user && (isAdminEmail(user.email || "") || isMasterSürüm)) && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => { setRoadmapOpen?.(true); setUpdatesOpen(false); setMenuOpen(false); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[10.5px] font-bold text-white/85 transition hover:bg-white/5"
                            >
                              <span className="text-base">🚀</span>
                              <span className="min-w-0 flex-1 truncate">{t("hbrYolHaritasi")}</span>
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black bg-amber-500/20 text-amber-300 animate-pulse">ADMIN</span>
                            </button>
                          </div>
                          )}

                          {/* ★ SADELEŞTİRME: V2/V3 rozetli maddeler (Ayet & Dua Kütüphanesi, Kur'an Hikayeleri,
                              Kıssalar, Hadisler, Dualar & Zikirler, Kurumsal) menüden kaldırıldı —
                              hepsi Yol Haritası'nda oylamada. Menüde tek giriş: 🚀 Güncelleme Yol Haritası. */}

                          {/* ★ 26.10 LANSIŞ USHÖTÜ (kullanıcı emri): Kendi Sesinle Üret + Mobil Dönüş
                              ihtişamlı lavta kartları — elily davri. */}
                          <div className="space-y-1 px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpen(false); setUpdatesOpen(false);
                                const adminGecis = (user != null && isAdminEmail(user.email || "")) || isMasterSürüm;
                                const yeterli = adminGecis || tierAtLeast(tier || getCurrentTier(), "elit");
                                if (yeterli) setModal?.("kendiSes" as ModalName);
                                else openPremium?.("uyelik", "elit");
                              }}
                              className="w-full rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-2.5 text-left transition hover:bg-fuchsia-500/15"
                            >
                              <p className="flex items-center gap-1.5 text-[10px] font-black text-fuchsia-300">
                                <span>🎙️</span> {t("hbrKendiSesBaslik")}
                                <span className="ml-auto rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-1.5 py-0.5 text-[7px] font-black">{t("tierElit")}</span>
                              </p>
                              <p className="mt-0.5 text-[8.5px] leading-snug text-white/50">{t("hbrKendiSesMetin")}</p>
                              <p className="mt-1 text-[8px] font-bold text-fuchsia-300/80">{t("hbrKendiSesBtn")}</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => { window.dispatchEvent(new Event("nur_pwa_banner_ac")); setMenuOpen(false); setUpdatesOpen(false); }}
                              className="w-full rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-left transition hover:bg-emerald-500/15"
                            >
                              <p className="flex items-center gap-1.5 text-[10px] font-black text-emerald-300">
                                <span>📱</span> {t("hbrMobilDonBaslik")}
                              </p>
                              <p className="mt-0.5 text-[8.5px] leading-snug text-white/50">{t("hbrMobilDonMetin")}</p>
                              <p className="mt-1 text-[8px] font-bold text-emerald-300/80">{t("hbrMobilDonBtn")}</p>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ★ 26.10 ARAÇLAR MENÜ GİRİŞİ KALDIRILDI (kullanıcı emri):
                        Araçlar Kur'an Öğreniyorum ekranında da var — çift giriş
                        kalabalık oldu, tek giriş Kur'an ekranında kaldı. Panel
                        yine event ile açılır (sevap köşesi köprüsü, 57. satır). */}

                    {/* ★ 10.10 (GERİ EKLEME, kullanıcı emri): Kur'an Öğren + Dinle butonu
                        sol-üst üç-nokta menüde.
                        ★ 18.10 (kullanıcı emri): "GERİ GELDİ" rozeti KALDIRILDI. */}
                    <button onClick={() => { setModal?.("quranLearn"); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <span className="text-base">📖</span>
                      <span>{t("menuKuranOgrenDinle")}</span>
                    </button>

                    {/* ★ 18.10 HAFIZLIK menü girişi buradaydı — QuranLearnModal 3. sekmesine
                        göçürüldü (aynı dosyada alttaki Kur'an girişinin yorumu). */}

                    {/* ★ 18.10 (kullanıcı bildirimi): PWA KURULUM BANNERI bulanamıyordu —
                        menüye kalıcı giriş eklendi; tıklayınca banner İSTİDİĞİ AN acılır */}
                    <button onClick={() => { window.dispatchEvent(new Event("nur_pwa_banner_ac")); setMenuOpen(false); }} className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white">
                      <span className="text-base">📲</span>
                      <span className="flex-1 truncate">{t("menuPwaAnaEkran")}</span>
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
                      const adminGecis = (user != null && isAdminEmail(user.email || "")) || isMasterSürüm;    const mevcutTier: "free" | "pro" | "elit" = adminGecis ? "elit" : (tier || getCurrentTier());
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
                          // ★ 25.10 OYLAMA KAPISI KALDIRILDI: v2 kilitli modüller artık
                          //   oylamaya HİÇ devretmez — kullanıcıya net 'yakında' bildirimi.
                          if (v2Kilitli) { notify?.(`🔒 ${item.label} ${t("v2YakindaBildirim")}`); return; }
                          if (yetersiz) openPremium("uyelik", efektifHedef === "elit" ? "elit" : "pro");
                          else setModal(item.target);
                        }}
                        className="flex min-h-[42px] w-full items-center gap-3 px-4 py-2.5 text-left text-[11px] text-white/65 transition hover:bg-white/5 hover:text-white"
                      >
                        <item.icon size={14} style={{ color: "var(--accent)" }} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {v2Kilitli && (
                          <span className="ml-auto shrink-0 rounded-full border border-slate-400/40 bg-slate-500/15 px-1.5 py-0.5 text-[7px] font-black tracking-wide text-slate-300"                            title={t("v2KilitTitle")}>
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
                            title={efektifHedef === "elit" ? t("kilitElitUyelik") : t("kilitProUyelik")}
                          >
                            {efektifHedef === "elit" ? t("tierElit") : "PRO"}
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
  );
};