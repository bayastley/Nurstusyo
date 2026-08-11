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
            <div className="relative mt-2.5 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (!tierAtLeast(accessTier, "pro")) { openPremium("uyelik"); return; }
                  const cur = selected[verseIndex] || selected[0];
                  if (!cur) { notify("Önce ayet seçin"); return; }
                  const ISLAMI_YORUMLAR = [
                    `Bu ayet kalplere huzur ve sekinet verir. Paylaşarak iyiliğe vesile olabilirsin.`,
                    `${cur.sName} Suresi'nin bu ayeti tefekkür eden gönüller için derin bir rahmet kapısıdır.`,
                    `Kur'an'ın bu nurlu hitabını sevdiklerinle paylaş, belki bir kalbe şifa olur.`,
                    `Bu ayet-i kerimeyi düşündükçe insanın kalbi yumuşar, dili duaya yönelir.`,
                    `Rabbimizin kelamından bir ayet: hem öğüt, hem müjde, hem de huzur.`,
                    `${cur.sName} Suresi hayatımıza rehberlik eder; bu ayeti tefekkür et, paylaş, çoğalt.`,
                    `Bir ayet, bir umut, bir tefekkür kapısı. Kur'an'ın nûrunu yaymaya vesile ol.`,
                    `Kalbe dokunan, ruha işleyen bir ayet. Rabbimizin mesajı daima diri ve tazedir.`,
                    `Belki de bugün ihtiyacınız olan cevap tam olarak bu ayette gizli.`,
                    `${cur.sName} Suresi'nden bu satırlar, yorgun kalplere bir soluk gibi geliyor.`,
                    `Bazı ayetler sadece okunmaz, hissedilir. İşte onlardan biri daha.`,
                    `Bu ayeti okuyup da etkilenmeyen az kişi vardır; sen de dinle, karar ver.`,
                    `${cur.sName} Suresi ${cur.a}. ayet, hayata bakışını değiştirebilecek güçte bir hatırlatma.`,
                    `Gönlünüz daralmışsa, bu ayeti bir kez daha dinlemeyi deneyin.`,
                    `Kur'an'ın her satırı bir hikmet; bu ayet de kalbe dokunan hikmetlerden biri.`,
                    `Sadece birkaç saniye sürer ama etkisi günlerce sürebilir — bu ayeti dinle.`,
                  ];
                  const pickDesc = () => {
                    const rastgele = ISLAMI_YORUMLAR[Math.floor(Math.random() * ISLAMI_YORUMLAR.length)];
                    return `📌 ${cur.sName} ${cur.s}:${cur.a}. Ayet-i Kerîme\n\n🎧 Kâri: ${reciterName}\n🎬 Yapım: Nûr Stüdyo İslamî Medya Lab\n\n${rastgele}\n\n💬 Bu ayet sana ne hissettirdi? Yorumlarda paylaş; bir ayet bir kalbe dokunabilir. Ailenle, arkadaşlarınla paylaşarak hayra vesile ol.`;
                  };
                  let yeniAciklama = pickDesc();
                  let tries = 0;
                  while (yeniAciklama === lastDescRef.current && tries < 6) { yeniAciklama = pickDesc(); tries += 1; }
                  lastDescRef.current = yeniAciklama;
                  setShareDescription(yeniAciklama);
                  notify("✨ Açıklama seçilen ayet ve kâriye göre güncellendi");
                }}
                className="relative flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-[10px] font-bold text-white"
              >
                <RefreshCw size={11} />Açıklama Yenile
                {!tierAtLeast(accessTier, "pro") && <LockBadge kind="pro" onUpgrade={() => openPremium("uyelik")} position="top-right" />}
              </button>

              <button
                onClick={() => {
                  if (!tierAtLeast(accessTier, "pro")) { openPremium("uyelik"); return; }
                  const cur = selected[verseIndex] || selected[0];
                  if (!cur) { notify("Önce ayet seçin"); return; }
                  let yeniBaslik = genTitle(cur.sName, cur.s, cur.a);
                  let tries = 0;
                  while (yeniBaslik === lastTitleRef.current && tries < 6) { yeniBaslik = genTitle(cur.sName, cur.s, cur.a); tries += 1; }
                  lastTitleRef.current = yeniBaslik;
                  setShareTitle(yeniBaslik);
                  notify("Başlık seçilen ayete göre yenilendi");
                }}
                className="glass-soft relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[10px] text-white/65"
              >
                <RefreshCw size={11} />{t("refreshTitle")}
                {!tierAtLeast(accessTier, "pro") && <LockBadge kind="pro" onUpgrade={() => openPremium("uyelik")} position="top-right" />}
              </button>

              <button
                onClick={() => copyShare()}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[10px] font-bold text-black"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? t("copied") : t("copy")}
              </button>

              <button
                onClick={() => {
                  if (!tierAtLeast(accessTier, "elit")) { openPremium("uyelik"); return; }
                  setVisibleTags((current) => pickRandomTags(14, current));
                  notify("🎲 Etiket kutusu yenilendi");
                }}
                className="glass-soft relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[10px] text-white/70"
              >
                <Shuffle size={11} />Rastgele Hashtag
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
