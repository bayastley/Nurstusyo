// ════════════════════════════════════════════════════════
// ATMOSFER SEÇİCİ MODAL (30.09 — SRP parçalama adım 1)
// ModalsContainer'dan (1035 satır) çıkarıldı; JSX ve davranış
// BİREBİR korundu — yalnız kendi iç state'i (heroSpotlight,
// sonsuz kaydırma sayacı) bileşenle birlikte taşındı.
//   • Kategori vitrini + katman sırası (açık→pro→elit→V2)
//   • Tür eşitleme (30.09): klasörde tek tür varsa sekme uyar
//   • Dürüst boş-grid mesajı + teaser yalnız "Tümü" görünümünde
//   • Kullanıcı medyası (yuklenenler) kilidi: kendi dosyası varsa açık
// ════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import { Search, FolderUp, Shuffle, Lock, Film, Sparkles, Image as ImageIcon } from "lucide-react";
import { Modal, Segmented } from "./UIElements";
import { LockBadge } from "./LockBadge";
import { AtmosphereCard } from "./AtmosphereCard";
import {
  ATMOSPHERE_PREVIEW_UNLOCKED, CATEGORIES, CATEGORY_LOCK_LEVEL, HARD_LOCKED_CATEGORIES,
  KATEGORI_TIER, FREE_VIDEOS_PER_CATEGORY, type CatId, type Clip,
} from "../clips";
import { ADMIN_ATMOSPHERE_CATEGORIES } from "../adminAtmosphereCategories";
import { getAdminCatAccess, ADMIN_V2_COUNT, ADMIN_V2_TOTAL } from "../adminCategoryAccess";
import { getFeatureLock } from "../services/adminSyncService";
import { COMING_SOON_ATMOSPHERES } from "./modalHelpers";
import { T } from "../i18n";
import type { Tier } from "../types";

interface AtmosferSeciciModalProps {
  /** modal === "atmos" iken açık */
  open: boolean;
  /** Kapat: setModal(null) + setPickingFor(null) */
  onKapat: () => void;
  pickingFor: string | null;
  setPickingFor: (id: string | null) => void;
  setModal: (modal: any) => void;
  clipKind: "img" | "vid";
  setClipKind: (kind: "img" | "vid") => void;
  onClipKindChange?: (kind: "img" | "vid") => void;
  atmosQuery: string;
  setAtmosQuery: (q: string) => void;
  atmosCategory: CatId | "all";
  setAtmosCategory: (c: CatId | "all") => void;
  combinedAllClips: Clip[];
  filteredClips: Clip[];
  accessTier: Tier;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  isMasterSürüm: boolean;
  randomizeBackgrounds: (scopeCat?: CatId) => void;
  pickClip: (clip: Clip) => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  hoveredClip: string | null;
  setHoveredClip: (id: string | null) => void;
  CATEGORY_ICONS: Record<string, React.ElementType>;
  lockTip: string | null;
  setLockTip: React.Dispatch<React.SetStateAction<string | null>>;
  t: (key: keyof (typeof T)["tr"]) => string;
}

export const AtmosferSeciciModal: React.FC<AtmosferSeciciModalProps> = ({
  open,
  onKapat,
  pickingFor,
  setPickingFor,
  setModal,
  clipKind,
  setClipKind,
  onClipKindChange,
  atmosQuery,
  setAtmosQuery,
  atmosCategory,
  setAtmosCategory,
  combinedAllClips,
  filteredClips,
  accessTier,
  tierAtLeast,
  isMasterSürüm,
  randomizeBackgrounds,
  pickClip,
  openPremium,
  hoveredClip,
  setHoveredClip,
  CATEGORY_ICONS,
  lockTip,
  setLockTip,
  t,
}) => {
  // ★ Kategori vitrinindeki rastgele "spotlight" klip — kategoriye girince hero olarak gösterilir
  const [heroSpotlight, setHeroSpotlight] = useState<Clip | null>(null);
  // ★ Performans + sonsuz kaydırma: kategori başına 10 kartla başlar; kullanıcı
  //    aşağı indikçe kendiliğinden +10 yüklenir (eski cihazlar donmaz, buton yok).
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { setVisibleCount(10); }, [atmosCategory, clipKind, atmosQuery]);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || atmosCategory === "all") return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setVisibleCount((c) => c + 10); },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [atmosCategory, clipKind, atmosQuery]);

  if (!open) return null;

  return (
    <Modal title={t("atmoLibrary")} sub={pickingFor ? `${t("pickForAyah")}: ${pickingFor}` : t("hoverPreview")} onClose={onKapat} wide>
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="w-44">
              <Segmented value={clipKind} onChange={(kind) => { setClipKind(kind); onClipKindChange?.(kind); }} items={[{ id: "img", label: "Şablon V2", icon: ImageIcon }, { id: "vid", label: t("motion"), icon: Film }]} />
            </div>
            <div className="relative min-w-48 flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={atmosQuery} onChange={(event) => setAtmosQuery(event.target.value)} placeholder="Atmosfer ara..." className="glass-soft h-full w-full rounded-xl pl-8 pr-3 text-[11px] outline-none placeholder:text-white/25" />
            </div>
            {isMasterSürüm ? (
              <button type="button" onClick={() => setModal("zip")} className="glass-soft flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold text-white/70"><FolderUp size={12} /> Video / Resim / Ses</button>
            ) : (
              <span className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold glass-soft text-white/30 cursor-not-allowed"><FolderUp size={12} /> ZIP / Image<LockBadge kind="v3" position="top-right" tooltipText="V3 Güncellemesi Yakında" /></span>
            )}
            <button onClick={() => randomizeBackgrounds(atmosCategory !== "all" ? atmosCategory : undefined)} className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              <Shuffle size={11} />{atmosCategory !== "all" ? `${CATEGORIES.find(c => c.id === atmosCategory)?.label ?? ""} Rastgele` : t("randomAll")}
            </button>
          </div>

          {/* ★ R2 KLASÖR ŞABLONLARI: id'si "-tpl-" olan klipler kod listesinden gelir (ADMIN_TEMPLATE_CLIPS)
              ve R2'deki templates/<klasör>/ gerçek dosyalarla birebir eşleşir.
              Eski (id'siz) klipler için ise Pexels video posterleri üzerinden türetilir. */}
          {atmosCategory !== "all" ? (
            <div id="atmos-active-banner" data-hero-banner className="mb-3 flex items-center gap-2 animate-fadeIn">
              <button
                onClick={() => { setHeroSpotlight(null); setAtmosCategory("all"); }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full glass-soft text-white/60 transition hover:text-white active:scale-90"
                title="Kategorilere dön"
              >
                ◀
              </button>
              <div className="flex min-w-0 flex-1 items-baseline gap-2">
                <h4 className="truncate text-[12px] font-black tracking-wide text-white">
                  {CATEGORIES.find(c => c.id === atmosCategory)?.label ?? ADMIN_ATMOSPHERE_CATEGORIES.find(c => c.id === atmosCategory)?.label ?? atmosCategory}{clipKind === "img" ? " · Şablonlar" : ""}
                </h4>
                <span className="shrink-0 text-[9px] font-bold text-white/35">
                  {/* ★ İçerik sayısı yalnızca admin'de */}
                  {isMasterSürüm ? `${combinedAllClips.filter((clip) => clip.cat === atmosCategory && clip.kind === clipKind).length} içerik` : ""}
                </span>
              </div>
              <button
                onClick={() => { setHeroSpotlight(null); setAtmosCategory("all"); }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[9.5px] font-black text-white/80 hover:bg-white/10 hover:text-white transition active:scale-95"
              >
                ✕ Seçimi Kaldır
              </button>
            </div>
          ) : (
            <div className="mb-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5 animate-fadeIn">
              {/* ★ SIRALAMA: önce AÇIK kategoriler, sonra PRO, sonra ELİT, en sonda V2 vitrini
                  (gizliler yalnızca adminde en sonda görünür) — ömer'in istediği katman sırası.
                  KOD kategorileri de kilid seviyesine göre katmanlanır (CATEGORY_LOCK_LEVEL). */}
              {[...CATEGORIES, ...ADMIN_ATMOSPHERE_CATEGORIES]
                .filter((category) => isMasterSürüm || !ADMIN_ATMOSPHERE_CATEGORIES.some((item) => item.id === category.id) || getAdminCatAccess(category.id) !== "hidden")
                .sort((a, b) => {
                  const w = (c: (typeof CATEGORIES)[number]) => {
                    if (!ADMIN_ATMOSPHERE_CATEGORIES.some((item) => item.id === c.id)) {
                      const lvl = CATEGORY_LOCK_LEVEL[c.id];
                      if (lvl === "V2") return 3;
                      if (lvl === "Elit") return 2;
                      if (lvl === "Pro") return 1;
                      return 0;
                    }
                    const acc = getAdminCatAccess(c.id);
                    if (acc === "hidden") return 4;
                    if (acc === "v2") return 3;
                    if (acc === "elit") return 2;
                    if (acc === "pro") return 1;
                    return 0;
                  };
                  return w(a) - w(b);
                })
                .map((category) => {
                const CatIcon = CATEGORY_ICONS[category.id] ?? Sparkles;
                const active = (atmosCategory as string) === category.id;
                const count = combinedAllClips.filter((clip) => clip.cat === category.id && clip.kind === clipKind).length;
                const isAdminAtmosphere = ADMIN_ATMOSPHERE_CATEGORIES.some((item) => item.id === category.id);
                // ★ TIER PLANI: admin kategorileri onaylı dağıtıma göre kilidlenir
                //   (pro/elit = tier kilidi, v2 = "Yakında" rozeti, hidden = SADECE admin görür)
                const adminAcc = isAdminAtmosphere ? getAdminCatAccess(category.id) : null;
                const adminHidden = adminAcc === "hidden";
                if (adminHidden && !isMasterSürüm) return null; // gizli klasör: admin dışına görünmez
                // ★ BOŞ KATEGORİ KORUMASI: R2'de hiç içeriği olmayan klasör (0 video + 0 şablon)
                //   adminde bile "0 içerik" ile vitrini kirletmesin — tamamen gizle.
                //   İçerik R2'ye yüklenip manifeste eklenince otomatik geri gelir.
                const totalCount = combinedAllClips.filter((clip) => clip.cat === category.id).length;
                if (isAdminAtmosphere && totalCount === 0) return null;
                const adminLocked = adminAcc === "v2" || adminAcc === "pro" || adminAcc === "elit";
                // ★ PANEL KİLİDİ: admin panelinden konan dinamik kilit (getFeatureLock) klasör kartına da uygulanır
                //   Öncelik: panel kilidi > adminCategoryAccess statik tablosu
                const panelLock = getFeatureLock(category.id, "free");
                const panelKilitli = panelLock === "v2" || panelLock === "v3" || panelLock === "pro" || panelLock === "elit";
                const panelBakimda = panelLock === "maintenance" || panelLock === "off";
                const adminUsable = !isAdminAtmosphere || adminAcc === null ? true : (adminAcc === "v2" ? false : (adminAcc === "pro" ? (accessTier === "pro" || accessTier === "elit") : adminAcc === "elit" ? accessTier === "elit" : true));
                // ★ KOD KATEGORİSİ KİLİDİ: statik tier tablosu (selale=pro, cennet=elit, ari=V2…)
                //   Önceki hata: kod kategorilerinde sadece HARD_LOCKED (V2 listesi) kontrol
                //   ediliyordu → Cennet/Çöl/Ateş gibi ELİT kategoriler misafire KİLİTSİZ
                //   görünüp PRO kartların arasında bozuk bir düzende karışıyordu.
                // ★ KULLANICI MEDYASI (28.09): "📁 Yüklediklerim" kategorisinde kendi dosyası olan
                //   kullanıcı için kilit açılır (kendi cihazındaki dosya — sunucu maliyeti sıfır).
                const kullaniciYuklemisi = category.id === "yuklenenler" && combinedAllClips.some((clip) => clip.cat === "yuklenenler");
                const kodV2 = HARD_LOCKED_CATEGORIES.includes(category.id) && !kullaniciYuklemisi;
                const kodTier = kullaniciYuklemisi ? "free" : (KATEGORI_TIER[category.id as CatId] ?? "free");
                const kodKilitli = kodV2 || !tierAtLeast(accessTier, kodTier);
                const lockLevel = panelKilitli ? (panelLock === "v2" ? "V2" : panelLock === "v3" ? "V3" : panelLock === "pro" ? "PRO" : "ELİT") : adminAcc === "v2" ? "V2" : adminAcc === "pro" ? "PRO" : adminAcc === "elit" ? "ELİT" : kodV2 ? "V2" : kodTier === "pro" ? "PRO" : kodTier === "elit" ? "ELİT" : "V2";
                // ★ ADMIN: isMasterSürüm=true → v2/pro/elit dahil TÜM kilitler açık (görsel + tıklama)
                const hardLocked = !isMasterSürüm && !ATMOSPHERE_PREVIEW_UNLOCKED && (panelBakimda ? true : panelKilitli ? (panelLock === "v2" || panelLock === "v3" ? true : !tierAtLeast(accessTier, panelLock)) : (adminLocked ? !adminUsable : (isAdminAtmosphere || kodKilitli)));
                // ★ Arama kutusuna yazınca eşleşen KLASÖR sarı yanar — yerini gösterir
                const q = atmosQuery.trim().toLocaleLowerCase("tr");
                const searchHit = q.length >= 2 && !active && category.label.toLocaleLowerCase("tr").includes(q);
                return (
                  <div key={category.id} className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => { if (hardLocked) setLockTip(`cat-${category.id}`); }}
                      onMouseLeave={() => { if (hardLocked) setLockTip((cur) => (cur === `cat-${category.id}` ? null : cur)); }}
                      onClick={() => {
                        if (hardLocked && !isMasterSürüm) return;
                        // ★ TÜR EŞİTLEME (30.09): klasörde yalnızca bir tür içerik varsa
                        //   sekme ona uyar — resim yükleyen kullanıcı Hareketli sekmesinde
                        //   boş grid + yanlış "V2 Yakında" teaser'ı görmesin.
                        const mevcutTurlar = new Set(combinedAllClips.filter((c) => c.cat === category.id).map((c) => c.kind));
                        const gosterilecekTur = mevcutTurlar.has(clipKind) ? clipKind : (mevcutTurlar.has("img") ? "img" : (mevcutTurlar.has("vid") ? "vid" : clipKind));
                        if (gosterilecekTur !== clipKind) { setClipKind(gosterilecekTur); onClipKindChange?.(gosterilecekTur); }
                        const candidates = combinedAllClips.filter((clip) => clip.cat === category.id && clip.kind === gosterilecekTur);
                        const spotlight = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
                        setHeroSpotlight(spotlight);
                        setAtmosCategory(category.id);
                      }}
                      className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border transition ${hardLocked ? "opacity-45 saturate-[.35] glass-soft text-white/40 border-dashed" : active ? "text-black" : searchHit ? "text-[#151020]" : "glass-soft text-white/70 hover:text-white"}`}
                      style={!hardLocked && active ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))", borderColor: "var(--accent)" } : searchHit ? { background: "#D7AA41", borderColor: "#f5dda6", boxShadow: "0 0 14px rgba(215,170,82,.5)" } : undefined}
                    >
                      {hardLocked && <span className="absolute right-1 top-1 rounded px-1 py-0.5 text-[6.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{lockLevel}</span>}
                      {CatIcon ? <CatIcon size={15} style={active && !hardLocked ? undefined : { color: hardLocked ? undefined : searchHit ? "#151020" : "var(--accent)" }} /> : null}
                      <span className="px-1 text-center text-[8px] font-bold leading-tight">{category.label}</span>
                      <span className={`text-[7px] ${active && !hardLocked ? "text-black/60" : searchHit ? "text-[#151020]/70" : "text-white/25"}`}>{isMasterSürüm ? `${count} içerik` : ""}</span>
                    </button>
                    {hardLocked && lockTip === `cat-${category.id}` && (
                      <span className="pointer-events-none absolute -top-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-black text-black shadow-lg" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                        <Lock size={9} className="mr-1 inline" />{lockLevel} Güncellemesi Yakında
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ★ DÜRÜST BOŞ DURUM (30.09): grid gerçekten boşsa sahte "YAKINDA" gösterme —
              neden boş olduğunu söyle (yanlış sekme / boş klasör). Hata dürüst olsun. */}
          {filteredClips.length === 0 && (
            <div className="mb-3 rounded-xl glass-soft px-4 py-3 text-center text-[11px] font-bold text-white/60">
              {atmosCategory !== "all"
                ? `📁 "${CATEGORIES.find(c => c.id === atmosCategory)?.label ?? atmosCategory}" klasöründe ${clipKind === "img" ? "şablon" : "hareketli video"} yok — üstteki sekmeyi değiştir ya da başka klasör dene`
                : "Bu sekmede gösterilecek atmosfer yok — sekmeyi değiştir"}
            </div>
          )}

          <div className={`grid gap-3 ${clipKind === "img" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
            {((heroSpotlight
                  ? [heroSpotlight, ...filteredClips.filter((clip) => clip.id !== heroSpotlight.id)]
                  : filteredClips
                ).slice(0, visibleCount)
            ).map((clip) => {
              const dynamicLock = getFeatureLock(clip.cat as string, "free");
              const catTier = dynamicLock === "pro" || dynamicLock === "elit" ? dynamicLock : (KATEGORI_TIER[clip.cat as CatId] ?? "free");
              const sameCat = combinedAllClips.filter(c => c.cat === clip.cat && c.kind === clipKind);
              const idx = sameCat.findIndex(c => c.id === clip.id);
              const maintenanceLocked = dynamicLock === "maintenance" || dynamicLock === "off";
              const vKilitli = dynamicLock === "v2" || dynamicLock === "v3"; // ★ V2/V3 'yakında' kilidi
              const catLocked = !ATMOSPHERE_PREVIEW_UNLOCKED && (maintenanceLocked || vKilitli || !tierAtLeast(accessTier, catTier));
              const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
              const videoLocked = !ATMOSPHERE_PREVIEW_UNLOCKED && !catLocked && idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier);
              // ★ ADMIN: kilitlı GÖRÜR ama kullanabilir — ne yaptığını görsün, kilit onu engellemesin
              const locked = !isMasterSürüm && (catLocked || videoLocked);
              const lockKind = maintenanceLocked ? "maintenance" : vKilitli ? (dynamicLock === "v2" ? "v2" : "v3") : catLocked ? (catTier === "pro" ? "pro" : "elit") : (nextTier === "elit" ? "elit" : "pro");
              return (
                <div key={clip.id} className="relative">
                  <AtmosphereCard clip={clip} active={hoveredClip === clip.id} onHover={setHoveredClip} onPick={() => locked ? openPremium("uyelik") : pickClip(clip)} />
                  {locked && <LockBadge kind={lockKind} onUpgrade={() => openPremium("uyelik")} />}
                </div>
              );
            })}
          </div>

          {visibleCount < filteredClips.length && (
            <div ref={loadMoreRef} className="flex h-10 items-center justify-center gap-2 text-[10px] font-bold text-white/35">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
              Daha fazla yükleniyor…
            </div>
          )}

          {/* ★ MERAK UYANDIRAN TEASER — onaylı V2 vitrini (10 gerçek R2 kategorisi)
              + kalan V3 takvimi. V2 kilitli kategoriler R2'de HAZIR ve test edildi
              (1438/1438 dosya OK) — V2 günü adminCategoryAccess'te "v2"→"elit"
              yapıldığında gerçek klasörler açılır; teaser kartlarıyla birlikte
              "devasa güncelleme" görüntüsü verir.
              ★ DÜRÜSTLÜK (30.09): teaser yalnız "Tümü" görünümünde — bir kategoriye
              girilmişken boş grid'le birlikte göstermek yanıltıcıydı. */}
          {!isMasterSürüm && !ATMOSPHERE_PREVIEW_UNLOCKED && atmosCategory === "all" && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/40">
                <Lock size={11} /> Yakında: V2 ile 10 Yeni Kategori Açılıyor ({ADMIN_V2_COUNT} kategori · {ADMIN_V2_TOTAL}+ içerik hazır)
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {COMING_SOON_ATMOSPHERES.map((item) => (
                  <div
                    key={item.id}
                    className="glass-soft relative flex h-16 cursor-not-allowed flex-col items-center justify-center gap-1 overflow-hidden rounded-xl"
                    style={item.img ? { backgroundImage: `linear-gradient(rgba(13,11,22,.55),rgba(13,11,22,.75)), url('${item.img}')`, backgroundSize: "cover", backgroundPosition: "center" } : { opacity: 0.5, filter: "saturate(0.5)" }}
                  >
                    <span className="absolute right-1 top-1 rounded px-1 py-0.5 text-[6.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                      {item.lock}
                    </span>
                    <span className={`text-[15px] ${item.img ? "drop-shadow" : ""}`}>{item.emoji}</span>
                    <span className={`px-1 text-center text-[7.5px] font-bold leading-tight ${item.img ? "text-white/90" : "text-white/60"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
  );
};
