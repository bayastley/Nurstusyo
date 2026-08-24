import React from "react";
import { Share2, RefreshCw, Copy, Check, Shuffle, FolderUp } from "lucide-react";
import { SectionTitle } from "./UIElements";
import { LockBadge } from "./LockBadge";
import { T } from "../i18n";
import type { SelectedAyah, ModalName, Tier } from "../types";

interface SocialSharePanelProps {
  shareTitle: string;
  setShareTitle: (t: string) => void;
  shareDescription: string;
  setShareDescription: React.Dispatch<React.SetStateAction<string>>;
  accessTier: Tier;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  tierAtLeast: (have: Tier, need: Tier) => boolean;
  selected: SelectedAyah[];
  verseIndex: number;
  reciterName: string;
  genTitle: (sName?: string, s?: number, a?: number) => string;
  lastDescRef: React.MutableRefObject<string>;
  lastTitleRef: React.MutableRefObject<string>;
  notify: (msg: string) => void;
  copyShare: () => void;
  copied: boolean;
  visibleTags: string[];
  setVisibleTags: React.Dispatch<React.SetStateAction<string[]>>;
  pickRandomTags: (count?: number, avoid?: string[]) => string[];
  isMasterSürüm: boolean;
  setModal: (m: ModalName) => void;
  setTosOpen: (v: boolean) => void;
  openLegalTab: (tab: "tos" | "kvkk" | "gizlilik" | "iade") => void;
  t: (key: keyof (typeof T)["tr"]) => string;
  shareToWhatsApp?: () => void;
  shareToX?: () => void;
  shareToYouTube?: () => void;
  shareToTikTok?: () => void;
  shareToInstagram?: () => void;
}

export const SocialSharePanel: React.FC<SocialSharePanelProps> = ({
  shareTitle,
  setShareTitle,
  shareDescription,
  setShareDescription,
  accessTier,
  openPremium,
  tierAtLeast,
  selected,
  verseIndex,
  reciterName,
  genTitle,
  lastDescRef,
  lastTitleRef,
  notify,
  copyShare,
  copied,
  visibleTags,
  setVisibleTags,
  pickRandomTags,
  isMasterSürüm,
  setModal,
  setTosOpen,
  openLegalTab,
  t,
  shareToWhatsApp,
  shareToX,
  shareToYouTube,
  shareToTikTok,
  shareToInstagram,
}) => {
  void setTosOpen;
  return (
    <>
      <section className="mx-auto max-w-[1500px] px-4 pb-5">
        <div className="glass grid gap-5 rounded-2xl p-5 lg:grid-cols-[1fr_340px_320px]">
          <div>
            <SectionTitle icon={Share2} title={t("shareTitle")} />
            
            {/* Title Input */}
            <div className="relative mb-2">
              <div className={accessTier === "free" ? "pointer-events-none select-none blur-md" : ""}>
                <input
                  value={shareTitle}
                  maxLength={80}
                  onChange={(event) => setShareTitle(event.target.value)}
                  className="glass-soft w-full rounded-xl px-3 py-2.5 pr-14 text-[12px] font-semibold text-white outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-white/25">{shareTitle.length}/80</span>
              </div>
              {accessTier === "free" && (
                <button type="button" onClick={() => openPremium("uyelik")} className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/25 text-[9px] font-black text-[color:var(--accent-2)]">
                  PRO'DA PAYLAŞIM BAŞLIĞI AÇIK
                </button>
              )}
            </div>

            {/* Description Textarea */}
            <div className="relative">
              <textarea
                value={shareDescription}
                rows={5}
                onChange={(event) => setShareDescription(event.target.value)}
                className={`glass-soft w-full resize-none rounded-xl px-3 py-2.5 text-[11px] leading-relaxed text-white/75 outline-none scrollbar-thin ${accessTier === "free" ? "pointer-events-none select-none blur-md" : ""}`}
              />
              {accessTier === "free" && (
                <button type="button" onClick={() => openPremium("uyelik")} className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/25 text-[9px] font-black text-[color:var(--accent-2)]">
                  PRO'DA AÇIKLAMA METNİ AÇIK
                </button>
              )}
            </div>

            {/* Action buttons */}
            {/* SATIR 1: Kopyala + Hızlı paylaşım */}
            <div className="relative mt-2.5 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => copyShare()}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold text-black"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? t("copied") : t("copy")}
              </button>

              {shareToWhatsApp && (
                <button onClick={shareToWhatsApp} className="glass-soft flex items-center gap-1 rounded-xl px-2.5 py-2 text-[10px] font-bold text-white/70 hover:text-white">
                  <Share2 size={10} />WhatsApp
                </button>
              )}
              {shareToX && (
                <button onClick={shareToX} className="glass-soft flex items-center gap-1 rounded-xl px-2.5 py-2 text-[10px] font-bold text-white/70 hover:text-white">
                  <Share2 size={10} />X
                </button>
              )}
              {shareToYouTube && (
                <button onClick={shareToYouTube} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-[10px] font-bold text-white hover:opacity-90" style={{ background: "linear-gradient(135deg,#ff0000,#cc0000)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </button>
              )}
            </div>

            {/* SATIR 2: TikTok + Instagram + Yenile + Hashtag (küçük) */}
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {shareToTikTok && (
                <button onClick={shareToTikTok} className="glass-soft flex items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] font-bold text-white/60 hover:text-white" style={{ background: "linear-gradient(135deg,#010101,#69C9D0)" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.22a8.16 8.16 0 0 0 4.77 1.52V7.31a4.85 4.85 0 0 1-1-.62z"/></svg>
                  TikTok
                </button>
              )}
              {shareToInstagram && (
                <button onClick={shareToInstagram} className="glass-soft flex items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] font-bold text-white/60 hover:text-white" style={{ background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </button>
              )}
              <button onClick={() => { if (!tierAtLeast(accessTier, "pro")) { openPremium("uyelik"); return; } const cur = selected[verseIndex] || selected[0]; if (!cur) { notify("Önce ayet seçin"); return; } let yeniAciklama = pickDesc(); let tries = 0; while (yeniAciklama === lastDescRef.current && tries < 6) { yeniAciklama = pickDesc(); tries += 1; } lastDescRef.current = yeniAciklama; setShareDescription(yeniAciklama); }} className="glass-soft relative flex items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] text-white/50">
                <RefreshCw size={9} />Açıklama
                {!tierAtLeast(accessTier, "pro") && <LockBadge kind="pro" onUpgrade={() => openPremium("uyelik")} position="top-right" />}
              </button>
              <button onClick={() => { if (!tierAtLeast(accessTier, "pro")) { openPremium("uyelik"); return; } const cur = selected[verseIndex] || selected[0]; if (!cur) { notify("Önce ayet seçin"); return; } let yeniBaslik = genTitle(cur.sName, cur.s, cur.a); let tries = 0; while (yeniBaslik === lastTitleRef.current && tries < 6) { yeniBaslik = genTitle(cur.sName, cur.s, cur.a); tries += 1; } lastTitleRef.current = yeniBaslik; setShareTitle(yeniBaslik); }} className="glass-soft relative flex items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] text-white/50">
                <RefreshCw size={9} />Başlık
                {!tierAtLeast(accessTier, "pro") && <LockBadge kind="pro" onUpgrade={() => openPremium("uyelik")} position="top-right" />}
              </button>
              <button onClick={() => { if (!tierAtLeast(accessTier, "elit")) { openPremium("uyelik"); return; } setVisibleTags((current) => pickRandomTags(14, current)); }} className="glass-soft relative flex items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] text-white/50">
                <Shuffle size={9} />Hashtag
                {!tierAtLeast(accessTier, "elit") && <LockBadge kind="elit" onUpgrade={() => openPremium("uyelik")} position="top-right" />}
              </button>
            </div>

            {/* Random Hashtags Pills */}
            <div className="mt-3">
              <p className="mb-1.5 text-[9px] font-bold text-white/40">Rastgele Etiketler — tıkla → açıklamaya ekle, yenile → liste değişsin</p>
              <div className="relative rounded-xl border border-white/5 bg-black/20 p-2">
                <div className="flex flex-wrap gap-1.5">
                  {visibleTags.map((tag) => {
                    const inDesc = shareDescription.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!tierAtLeast(accessTier, "elit")) { openPremium("uyelik"); return; }
                          if (!inDesc) setShareDescription((current) => `${current.trim()} ${tag}`);
                          notify(`${tag} açıklamaya eklendi`);
                        }}
                        className={`rounded-full px-2 py-0.5 text-[8.5px] font-semibold transition ${
                          inDesc ? "text-black" : "glass-soft text-white/45 hover:text-white/70"
                        }`}
                        style={inDesc ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {!tierAtLeast(accessTier, "elit") && <LockBadge kind="elit" onUpgrade={() => openPremium("uyelik")} position="top-right" />}
              </div>
            </div>
          </div>

          {/* ZIP Explorer card */}
          <div className="flex flex-col">
            <div className={`relative flex h-[270px] flex-none flex-col rounded-2xl border border-white/5 bg-black/30 p-3 ${isMasterSürüm ? "" : "opacity-70"}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                    <FolderUp size={13} />
                  </span>
                  <div>
                    <p className="font-bold text-white/60 text-[12px]">ZIP Dosya / Ses Ekle</p>
                    <p className="text-[9px] text-white/30">{isMasterSürüm ? "Admin erişiminde aktif" : "V3'te aktif olacak"}</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { if (isMasterSürüm) setModal("zip"); }}
                disabled={!isMasterSürüm}
                className={`relative flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 p-3 text-center ${
                  isMasterSürüm ? "cursor-pointer transition hover:border-[color:var(--accent)]/60 hover:bg-white/[.02]" : "cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400/50">
                    <FolderUp size={18} />
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white/40 text-[11px]">{isMasterSürüm ? "ZIP Gezgini Aç" : "V3 Güncellemesi"}</p>
                  <p className="mt-1 text-[9px] text-white/25">ZIP, video, görsel ve ses ekleme</p>
                </div>
              </button>
              {!isMasterSürüm && <LockBadge kind="v3" position="top-right" size="md" tooltipText="V3 Güncellemesi Yakında" />}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-[1500px] px-4 pb-8 pt-4 text-center">
        <div className="border-t border-white/5 pt-5">
          {/* Yasal Bağlantılar — 4 Kurumsal Link Yan Yana */}
          <div className="mb-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-white/50">
            <button
              onClick={() => openLegalTab("tos")}
              className="flex items-center gap-1 transition hover:text-[color:var(--accent-2)] cursor-pointer"
            >
              <span>🔗</span> Kullanım Şartları
            </button>
            <span className="hidden text-white/10 sm:inline">•</span>
            <button
              onClick={() => openLegalTab("kvkk")}
              className="flex items-center gap-1 transition hover:text-[color:var(--accent-2)] cursor-pointer"
            >
              <span>🔗</span> KVKK Aydınlatma Metni
            </button>
            <span className="hidden text-white/10 sm:inline">•</span>
            <button
              onClick={() => openLegalTab("gizlilik")}
              className="flex items-center gap-1 transition hover:text-[color:var(--accent-2)] cursor-pointer"
            >
              <span>🔗</span> Gizlilik ve Çerez Politikası
            </button>
            <span className="hidden text-white/10 sm:inline">•</span>
            <button
              onClick={() => openLegalTab("iade")}
              className="flex items-center gap-1 transition hover:text-[color:var(--accent-2)] cursor-pointer"
            >
              <span>🔗</span> Satın Alma & İade Koşulları
            </button>
          </div>

          <p className="font-display text-[10.5px] font-medium tracking-[.06em] text-white/40">
            © 2026 nurstudyo.com. Tüm hakları saklıdır. İyiliğe ve hayra vesile olmak dileğiyle...
          </p>
          <p className="mt-2 text-[8px] text-white/20">Pexels • EveryAyah • AlQuran Cloud • Aladhan</p>
        </div>
      </footer>
    </>
  );
};
