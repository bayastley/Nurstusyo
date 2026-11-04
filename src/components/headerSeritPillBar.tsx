import React from "react";
// ★ 04.11 SRP: HeaderTopBar'daki üst pill şeridi + Kıble modal + marquee ölçüm + şerit sürükleme kendi dosyasına taşındı.
import { Coins, Gem, Shield, ShieldOff, X, Check, ChevronDown, Moon } from "lucide-react";
import { LANGS, vakitAdi, sureceCevir } from "../i18n";
import { isAdminEmail, getJetonVault, getPackRights, type Tier } from "../tier";
import { QiblaCompass } from "./islamicToolsBolumler";
import { TIER_SOZLUK } from "./headerTierSozluk";
import type { ModalName, User } from "../types";
import type { HeaderTopBarProps } from "./headerTopBarTypes";

export type HeaderSeritPillBarProps = Pick<HeaderTopBarProps, "user" | "isMasterSürüm" | "jetonCount" | "openAdminDashboard" | "tier" | "openPremium" | "setModal" | "notify" | "t" | "lang" | "setLang" | "langOpen" | "setLangOpen" | "setAdminGodMode" | "setSmartAiEnabled" | "setBatchFormats" | "misafirKalanHak" | "nextPrayer" | "prayerCity" | "formatRemaining"> & { toplamHak: number; banCount: number };

export const HeaderSeritPillBar: React.FC<HeaderSeritPillBarProps> = ({
  user, isMasterSürüm, jetonCount, tier, toplamHak, banCount, openPremium, openAdminDashboard, setModal,
  notify, t, lang, setLang, langOpen, setLangOpen, setAdminGodMode, setSmartAiEnabled,
  setBatchFormats, misafirKalanHak, nextPrayer, prayerCity, formatRemaining,
}) => {
  const [kibleAcik, setKibleAcik] = React.useState(false);
  // ★ 01.11 ŞERİT SÜRÜKLEME (kullanıcı emri: "sürüklensin, logo hariç"): pill şeridi
  //   fareyle sürüklenince yatay kayar (dokunmatikte kaydırma zaten native). Sürükleme
  //   sonrası yanlış buton tıklanmasın diye 5px eşiği aşılınca tık yakalanıp yutulur.
  const serumRef = React.useRef<HTMLDivElement>(null);
  const serumDurum = React.useRef({ basili: false, basX: 0, baslangic: 0, suruklendi: false });
  const serumPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const d = serumDurum.current;
    d.basili = true; d.basX = e.clientX; d.baslangic = serumRef.current?.scrollLeft ?? 0; d.suruklendi = false;
  };
  const serumPointerMove = (e: React.PointerEvent) => {
    const d = serumDurum.current;
    if (!d.basili) return;
    const dx = e.clientX - d.basX;
    if (Math.abs(dx) > 5) d.suruklendi = true;
    if (serumRef.current) serumRef.current.scrollLeft = d.baslangic - dx;
  };
  const serumPointerUp = () => { serumDurum.current.basili = false; };
  const serumClickYakala = (e: React.MouseEvent) => {
    if (serumDurum.current.suruklendi) { e.stopPropagation(); e.preventDefault(); serumDurum.current.suruklendi = false; }
  };
  // ★ 25.10 MARQUEE ÖLÇÜMÜ — İSLÂMÎ ÖĞRENİYORUM etiketi haber pill'ine sığmazsa
  //   sola doğru kayar (kelime tamamen görünür). scrollWidth − clientWidth > 2px
  //   ise .nur-marquee-kayar sınıfı + --nur-marquee-fazla CSS değişkeni yazılır.
  const kesfetMarqueeRef = React.useRef<HTMLSpanElement | null>(null);
  const kuranMarqueeRef = React.useRef<HTMLSpanElement | null>(null);
  React.useEffect(() => {
    const olc = (el: HTMLSpanElement | null) => {
      if (!el) return;
      const fazla = el.scrollWidth - el.clientWidth;
      if (fazla > 2) {
        el.style.setProperty("--nur-marquee-fazla", `${fazla}px`);
        el.classList.add("nur-marquee-kayar");
      } else {
        el.classList.remove("nur-marquee-kayar");
      }
    };
    const tumu = () => { olc(kesfetMarqueeRef.current); olc(kuranMarqueeRef.current); };
    tumu();
    window.addEventListener("resize", tumu);
    return () => window.removeEventListener("resize", tumu);
  }, []);
  return (
          <div className="relative ml-auto flex min-w-0 flex-1 flex-col max-md:pb-1">
            <div ref={serumRef} onPointerDown={serumPointerDown} onPointerMove={serumPointerMove} onPointerUp={serumPointerUp} onPointerLeave={serumPointerUp} onClickCapture={serumClickYakala} className="flex w-full min-w-0 cursor-grab items-center gap-2 active:cursor-grabbing max-md:overflow-x-auto max-md:overflow-y-clip max-md:no-scrollbar max-md:[&>*]:shrink-0">
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
                    {(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) ? t("hbrSinirsiz") : toplamHak}
                  </span>
                  {!(isMasterSürüm || isAdminEmail(user?.email || "") || jetonCount >= 999999) && (
                    <span className="hidden text-[9px] font-bold tracking-wide text-white/50 sm:inline">{t("hbrUretimHakki")}</span>
                  )}
                </button>
              );
            })()}
            {/* ★ ÜYELİK DURUMU — Mevcut tier adını göster */}
            <button className="glass-soft relative hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold sm:flex transition hover:scale-105" style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.25)" }} onClick={() => openPremium("uyelik")}>
              <Gem size={11} style={{ color: "var(--accent)" }} />{user ? t(TIER_SOZLUK[tier || "free"] || "tierUcretsiz") : t("premium")}
              {/* ★ 26.10: kullanıcı-yanı '★ SADIK ÜYE' uzun rozeti kaldırıldı (sahibin emri) */}
            </button>
            <div className="relative notranslate" translate="no">
              {/* ★ 04.10: dil seçici — sade kodlar (TR/EN/AR/ID/UR) + notranslate.
                  dilAdi() isimlerini Google Translate bozuyordu ("di!TR", "şeyretme"…);
                  kullanıcı emri: sadece kodlar, hiçbir dilde çevrilmesin. */}
              <button className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold text-white/70" onClick={() => setLangOpen((value) => !value)}>                  <span className="font-black tracking-wide">{(lang || "tr").toUpperCase()}</span><ChevronDown size={10} />
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
            <button data-minitur="kabe-canli" onClick={() => { setModal("quranLearn"); window.dispatchEvent(new Event("nur_kabe_ac")); }} className="glass-soft flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black text-emerald-300 transition hover:scale-105" style={{ boxShadow: "0 0 0 1px rgba(16,185,129,.35)" }} title={t("menuKabeCanli") + t("hbrKabeCanliTitle")}>
              🕋 {t("menuKabeCanli")}
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-red-500" />
              </span>
            </button>
            {/* ★ 18.10 (kullanıcı emri): "Kur'an" bölümü ana ekran üst barda — Hafızlık Testi'nin
                yerine. Tek tık Kur'an ekranını açar (İçindeki öğrenme/test modülleri orada).
                Hafızlık Testi silinmedi — Kur'an ekranına gömülü, oradan da erişilir. */}
            {/* ★ 25.10 İHTİŞAMLI BAŞLIK (kullanıcı emri): kısa "Kur'an" etiketi
                "KUR'AN ÖĞRENİYORUM" oldu — display font + altın degrade + yumuşak parıltı.
                Panele sığmazsa İSLÂMÎ ÖĞRENİYORUM gibi sola doğrı kayar (nur-marquee). */}
            <button data-minitur="kuran-bolumu" onClick={() => setModal("quranLearn")}
              className="glass-soft flex max-w-[215px] shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}                              title={t("v2KuranOgrenTitle")}>
              📖 <span ref={kuranMarqueeRef} className="nur-marquee notranslate whitespace-nowrap font-display tracking-[.08em] bg-gradient-to-r from-amber-200 via-[color:var(--accent-2)] to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_7px_rgba(215,170,82,.45)]">{t("v2KuranOgrenEtiket")}</span>
            </button>
            {/* ★ 30.10 KIBLE (kullanıcı emri): Nur Araçlar'dan çıkarıldı, üst barda
                KUR'AN ÖĞRENİYORUM ↔ İSLÂMÎ ÖĞRENİYORUM ARASINA kendi butonuyla kondu. */}
            <button data-minitur="kible" onClick={() => setKibleAcik(true)}
              className="glass-soft flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
              title={t("itTabQibla")}>
              🧭 {t("itTabQibla")}
            </button>
            {kibleAcik && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={() => setKibleAcik(false)}>
                <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black p-4 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white">🧭 {t("itTabQibla")}</h3>
                    <button onClick={() => setKibleAcik(false)} className="p-1.5 rounded-full hover:bg-white/10 transition">
                      <X size={16} className="text-white/50" />
                    </button>
                  </div>
                  <QiblaCompass />
                </div>
              </div>
            )}
            {/* ★ 25.10 İSLÂMÎ ÖĞRENİYORUM (kullanıcı emri) — eski "Keşfet" üst barda,
                Kur'an ↔ İçindekiler ARASINA kondu; sol menüden kaldırıldı. Etiket panele
                sığmazsa sola doğru kayar (marquee) — kelime tamamlanır. */}
            <button data-minitur="islami-ogreniyorum" onClick={() => setModal("kesfet")}
              className="glass-soft flex max-w-[190px] shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
              title={t("v2KesfetTitle")}>
              🧭 <span ref={kesfetMarqueeRef} className="nur-marquee whitespace-nowrap">{t("menuKesfet")}</span>
            </button>
            {/* ★ 16.10 İÇİNDEKİLER — sol menüdeki aynı "siteHakkinda" modalını açan üst-bar butonu.
                ★ 18.10 (kullanıcı emri): Hafızlık Testi butonu Kâbe-İçindekiler arasına kondu.
                Modal içeriğine TANITIM bölümü eklendi (R2'den video, SiteHakkindaModal'da). */}
            <button data-minitur="icindekiler" onClick={() => setModal("siteHakkinda")}
              className="glass-soft flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
              style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
              title={t("v2SiteHakkindaTitle")}>
              📑 {t("icindekilerEtiket")}
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
                mount kapısı ikisi birden devrede.
                ★ 26.10 GÜNCEL EMİR (kullanıcı): "sesli meal seslendirme admine açık —
                bütün üyeler ve kullanıcılara kapalı" → ELİT erişimi KALDIRILDI; artık
                yalnız admin/master butonu görür (menü öğesi + bu buton + mount kapısı). */}
            {((isAdminEmail(user?.email || "") || isMasterSürüm)) && (
              <button data-minitur="seslendirme" onClick={() => setModal("seslendirme")}
                className="glass-soft flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black transition hover:scale-105"
                style={{ color: "var(--accent-2)", boxShadow: "0 0 0 1px rgba(215,170,82,.35)" }}
                title={t("menuSesliMeal")}>
                🔊 {t("menuSesliMeal")}
              </button>
            )}
            <button data-minitur="namaz-vakti" onClick={() => setModal("prayer")} className="glass-soft flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <Moon size={11} />
              <span className="hidden sm:inline">{nextPrayer ? `${vakitAdi(lang, nextPrayer.name)} ${sureceCevir(lang, formatRemaining(nextPrayer.diff))}` : prayerCity}</span>
            </button>
          </div>
            <div className="pointer-events-none absolute bottom-0 right-1 h-0.5 w-10 rounded-full bg-white/25 md:hidden" />
          </div>
  );
};