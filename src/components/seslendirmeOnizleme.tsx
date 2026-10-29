// ═══════════════════════════════════════════════════════════════
// SESLENDİRME ÖNİZLEME — SeslendirmeModal.tsx'ten çıkarıldı (14.10)
// SOL kolon: 9/16 kart + atmosfer rgba katmanı + kuyruk/devam önizleme
// + ATMOSFER SEÇ paneli (kuyruk doluysa seçili parçaya ata) + galeri satırı.
// Davranış birebir; sadece bileşen olarak ayrıldı.
// ═══════════════════════════════════════════════════════════════
import React from "react";
import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
import { Lock } from "lucide-react";
import { ATM } from "./seslendirmeMotor";
import { SES_ATMOSFERLER, type KuyrukOgesi, type LockLevel } from "./seslendirmeSabitler";
import { ALL_CLIPS, MOTION_CLIPS, KATEGORI_TIER, HARD_LOCKED_CATEGORIES, type CatId, type Clip } from "../clips";
import { QURAN_CLIPS } from "../clips-r2";
import { getFeatureLock } from "../services/adminSyncService";

export interface SeslendirmeOnizlemeProps {
  onizOg: KuyrukOgesi | null;
  atmos: readonly [string, string, string];
  kuyrukSayi: number;
  kuyrukSec: number;
  planSayi: number;
  bg: { url?: string; poster?: string; ad?: string; kat?: string; custom?: string } | null;
  setBg: (v: { url?: string; poster?: string; ad?: string; kat?: string; custom?: string } | null) => void;
  atmosAta: (kat: string) => void;
  yaz: (t: string) => void;
}

export const SeslendirmeOnizleme: React.FC<SeslendirmeOnizlemeProps> = ({
  onizOg, atmos, kuyrukSayi, kuyrukSec, planSayi, bg, setBg, atmosAta, yaz,
}) => {
  const onizKat = onizOg?.kat || "musaf";

  // ★ 16.10 GERÇEK R2 ARKA PLAN — mockup kalıntısı loremflickr.com placeholder'ı söküldü:
  //   önizleme arka planı artık stüdyo galerisiyle AYNI R2 kütüphanesinden gelir
  //   (cdn.nurstudyo.com/videos/{kat}/{pid}.mp4 + posters/{kat}/{pid}.jpg).
  //   Kullanıcı elle görsel seçmemişse (bg=null): parçanın atmosfer kategorisinin
  //   R2 havuzundan PARÇA BAŞINA rastgele klip — parça değişince yenisi gelir,
  //   aynı parçada stabil kalır (useMemo). Hareketli klip <video>, şablon <img>.
  const SES_ARKA_HAVUZ: Clip[] = [
    ...ALL_CLIPS.filter((c) => c.cat !== "yuklenenler"),
    ...QURAN_CLIPS,
  ] as Clip[]; // QURAN_CLIPS any[] — yapısal olarak Clip ile aynı şema
  const otoKlip = React.useMemo<Clip | null>(() => {
    const havuz = SES_ARKA_HAVUZ.filter((c) => c.cat === onizKat);
    if (!havuz.length) return null;
    return havuz[Math.floor(Math.random() * havuz.length)] ?? null;
  }, [onizKat, onizOg?.metin, onizOg?.ar]); // eslint-disable-line react-hooks/exhaustive-deps
  type Gorsel = { src: string; vid: boolean; poster?: string };
  const gorsel: Gorsel | null = bg?.custom
    ? { src: bg.custom, vid: false }
    : bg?.url
      ? (bg.url.includes(".mp4") ? { src: bg.url, vid: true, poster: bg.poster } : { src: bg.url, vid: false, poster: bg.poster })
      : otoKlip
        ? (otoKlip.kind === "vid"
            ? { src: otoKlip.r2 || otoKlip.src, vid: true, poster: otoKlip.r2Poster ?? otoKlip.poster }
            : { src: otoKlip.src || otoKlip.r2Poster || "", vid: false, poster: otoKlip.r2Poster })
        : null;
  const [gorselHata, setGorselHata] = React.useState(false);
  const medyaAnahtar = gorsel?.src || "";
  React.useEffect(() => setGorselHata(false), [medyaAnahtar]);

  return (
    <div>
      <div className="relative mx-auto overflow-hidden rounded-2xl" style={{ aspectRatio: "9/16", maxWidth: 270, background: atmos[2], transition: "background .5s" }}>
        {gorsel && !gorselHata ? (
          gorsel.vid ? (
            <video key={gorsel.src} src={gorsel.src} poster={gorsel.poster} autoPlay muted loop playsInline
              onError={() => setGorselHata(true)}
              className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <img key={gorsel.src} src={gorsel.src} alt="" loading="lazy"
              onError={() => setGorselHata(true)}
              className="absolute inset-0 h-full w-full object-cover" />
          )
        ) : null}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(215,170,82,.13), transparent 62%)" }} />
        {onizOg ? (
          onizOg.tip === "ayet" ? (
            <div className="relative z-10 flex h-full w-full flex-col justify-center px-4 text-center">
              <div style={{ fontSize: 21, lineHeight: 2, direction: "rtl", fontFamily: "'Amiri','Traditional Arabic',serif", textShadow: "0 2px 12px rgba(0,0,0,.85)" }}>{onizOg.ar}</div>
              <div className="mt-1 text-[11px] font-black" style={{ color: "var(--accent)", textShadow: "0 2px 8px rgba(0,0,0,.9)" }}>{onizOg.baslik}</div>
              <div className="mt-1.5 text-[12px] leading-relaxed" style={{ textShadow: "0 2px 10px rgba(0,0,0,.95)" }}>{onizOg.meal}</div>
              <div className="mt-2 text-[8px] tracking-widest text-white/60">{onizOg.kaynak}</div>
            </div>
          ) : (
            <div className="relative z-10 flex h-full w-full flex-col justify-center px-4 text-center text-[12px] leading-relaxed" style={{ whiteSpace: "pre-wrap", textShadow: "0 2px 10px rgba(0,0,0,.95)" }}>
              {onizOg.metin}
            </div>
          )
        ) : null}
        <div className="absolute left-3 top-2 z-20 rounded-full px-2.5 py-1 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}>
          {kuyrukSayi
            ? (onizOg?.tip === "metin" ? `✍ Metin ${kuyrukSec + 1}/${kuyrukSayi}` : onizOg?.etiket || "")
            : onizOg?.tip === "metin" ? `✍ Metin 1/${planSayi || 1}` : onizOg?.etiket || ""}
        </div>
        <div className="absolute bottom-2 left-3 z-20 rounded-full bg-black/55 px-2 py-1 backdrop-blur-sm" style={{ fontSize: 7.5, fontWeight: 800 }}>{atmos[1]} {atmos[0]}</div>
      </div>

      {/* ★ ATMOSFER İSEÇİM PANELİ — 14.10 ANA GALERİYE BAĞLANDI: kart vitrini gerçek
          MOTION_CLIPS posterleriyle; kilitler KATEGORI_TIER + panel kilidi AYNEN.
          Kullanıcı karta tıklayınca atmosfer katı olarak atanır (aynı davranış). */}
      {kuyrukSayi > 0 ? (
        <div className="mt-3 rounded-2xl border p-3" style={{ background: "rgba(215,170,82,.06)", borderColor: "rgba(215,170,82,.22)" }}>
          <div className="mb-2 text-[10px] font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
            🎨 {ttX2610("ozAtmosSec")} — <span style={{ color: "var(--accent)" }}>{ttX2610("ozParca").replace("{i}", String(kuyrukSec + 1)).replace("{t}", String(kuyrukSayi))}</span>
          </div>
          <div className="grid max-h-64 grid-cols-3 gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {SES_ATMOSFERLER.map((kat) => {
              // ana galerinin GERÇEK kilidini oku (panel kilidi > statik tier)
              const panelLock = getFeatureLock(kat.id, "free");
              const statikTier = KATEGORI_TIER[kat.id as CatId] ?? "free";
              const tier: LockLevel = (panelLock === "pro" || panelLock === "elit" || panelLock === "v2") ? (panelLock as LockLevel)
                : HARD_LOCKED_CATEGORIES.includes(kat.id as CatId) ? "v2"
                : (statikTier === "free" || statikTier === "pro" || statikTier === "elit") ? statikTier : "free";
              // vitrin görseli: ana MOTION_CLIPS'ten bu kategorinin ilk posteri
              const ilkClip = MOTION_CLIPS.find((c) => c.cat === kat.id);
              const gorsel = ilkClip?.r2Poster || ilkClip?.poster || null;
              const aktif = onizKat === kat.id;
              const rozet = tier === "pro" ? ttX2610("badgePro") : tier === "elit" ? ttX2610("badgeElit") : tier === "v2" ? ttX2610("badgeV2") : null;
              return (
                <button key={kat.id} onClick={() => atmosAta(kat.id)} title={kat.ad}
                  className="group relative overflow-hidden rounded-lg border transition"
                  style={aktif
                    ? { borderColor: "#d7aa52", boxShadow: "0 0 0 2px rgba(215,170,82,.4)" }
                    : { borderColor: "rgba(255,255,255,.1)" }}>
                  {gorsel ? (
                    <img src={gorsel} alt={kat.ad} loading="lazy"
                      className={`h-14 w-full object-cover transition group-hover:scale-105 ${tier !== "free" ? "opacity-70 saturate-[.5]" : ""}`} />
                  ) : (
                    <div className="flex h-14 w-full items-center justify-center bg-white/5 text-[14px] opacity-55">🌌</div>
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1 pb-0.5 pt-3 text-left text-[7px] font-black text-white/90">
                    {kat.ad}
                  </span>
                  {rozet && (
                    <span className="absolute right-0.5 top-0.5 flex items-center gap-0.5 rounded px-1 py-px text-[6px] font-black text-black"
                      style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}>
                      <Lock size={5} />{rozet}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 text-[7.5px] text-white/30">
            🔒 {ttX2610("ozProNot")}
          </div>
        </div>
      ) : null}

      {/* ★ 26.10 (kullanıcı emri): "Rastgele Ata" dev, "Oto" minik kalmıştı — ikisi de
          esitlendi (iki butona da flex:1, aynı padding/hizı). Kopya dikkat çekici
          “Akıllı AI” lisanslı yazıya çevrildi; rastgele buton altın-degrade parıltı aldı. */}
      <div className="mt-3 flex gap-2">
        {/* ★ 16.10: Rastgele Ata artık loremflickr değil — gerçek R2 klip havuzundan */}
        <button
          onClick={() => { const k = SES_ARKA_HAVUZ[Math.floor(Math.random() * SES_ARKA_HAVUZ.length)]; const url = k.kind === "vid" ? (k.r2 || k.src) : (k.src || k.r2Poster || ""); setBg({ url, poster: k.r2Poster ?? k.poster, ad: k.label, kat: k.cat }); yaz(`Rastgele: ${k.label} ✓`); }}
          title={ttX2610("ozSurprizTitle")}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-[11px] font-extrabold text-black transition hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)", boxShadow: "0 0 0 1px rgba(215,170,82,.45), 0 0 14px rgba(215,170,82,.30)", flex: 1 }}
        >
          {ttX2610("ozSurpriz")}
        </button>
        <button
          onClick={() => setBg(null)}
          title={ttX2610("ozOtoTitle")}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-[11px] font-extrabold text-white/80 transition hover:bg-white/10 active:scale-95"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", flex: 1 }}
        >
          {ttX2610("ozOtoVarsayilan")}
        </button>
      </div>
    </div>
  );
};
