import React from "react";
import { ChevronLeft, Languages, BookOpen } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import {
  SAHABELER,
  SAHABELER_KAYNAK_NOTU,
  SAHABELER_KELIME_TOPLAM,
  SAHABELER_TOPLAM,
} from "../../data/sahabelerDetayData";

// ════════════════════════════════════════════════════════
// SAHABELERBOLUMU.TSX — Sahabeler (21.11)
// 20 önemli sahabenin hayatı; her biyografi en az 500 kelime.
//
// ★ 5 DİL: Liste başlıkları seçili dile çevrilir; biyografi metni
//   yalnız kullanıcı "Çevir" düğmesine bastığında çevrilir — 20 uzun
//   metni otomatik çevirmek sağlayıcı kotasını boşa harcar.
//   Çeviri gelmezse TR gösterilir.
// ════════════════════════════════════════════════════════

export function SahabelerBolumu({
  tt, lang = "tr", q = "",
}: { tt?: (k: string) => string; lang?: Lang; q?: string }) {
  const t = tt ?? ((k: string) => k);
  const [secili, setSecili] = React.useState<string | null>(null);
  const [ceviriIste, setCeviriIste] = React.useState(false);
  const [trGoster, setTrGoster] = React.useState(false);

  const ara = q.trim().toLocaleLowerCase("tr");
  const liste = React.useMemo(() => {
    if (!ara) return SAHABELER;
    return SAHABELER.filter((s) =>
      [s.ad, s.unvan, s.tarih, ...s.hayat]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(ara),
    );
  }, [ara]);

  const acik = secili ? SAHABELER.find((s) => s.id === secili) : undefined;

  // Yalnız açık biyografi ve kullanıcı istediyse çeviri listesi dolar
  const ceviriMetinleri = React.useMemo(
    () => (acik && ceviriIste && lang !== "tr" ? acik.hayat : []),
    [acik, ceviriIste, lang],
  );
  const { aktif, yukleniyor, cevir } = useIcerikCeviri(ceviriMetinleri, lang);
  const g = React.useCallback(
    (m: string) => (aktif && !trGoster ? cevir(m) : m),
    [aktif, trGoster, cevir],
  );

  const geriDon = () => {
    setSecili(null);
    setCeviriIste(false);
    setTrGoster(false);
  };

  // ── Okuma ekranı ──
  if (acik) {
    return (
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={geriDon}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:bg-white/[.08] hover:text-white"
        >
          <ChevronLeft size={12} /> {t("shGeri")}
        </button>

        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--accent-2)" }}>
            {acik.tarih}
          </p>
          <h3 className="mt-0.5 text-[13px] font-black text-white/95" dir={lang === "ar" ? "rtl" : undefined}>
            {acik.emoji} {acik.ad}
          </h3>
          <p className="mt-0.5 text-[9.5px] font-bold text-white/50">{acik.unvan}</p>
          <p className="mt-1 text-[8px] font-bold text-white/35">
            {acik.kelime} {t("shKelime")}
          </p>

          {lang !== "tr" && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {!ceviriIste ? (
                <button
                  type="button"
                  data-minitur={`sahabe-cevir-${acik.id}`}
                  onClick={() => setCeviriIste(true)}
                  className="flex items-center gap-1 rounded-full bg-white/[.07] px-2.5 py-1 text-[8.5px] font-bold text-white/70 transition hover:bg-white/[.13] hover:text-white"
                >
                  <Languages size={10} /> {t("shCevir")}
                </button>
              ) : (
                <>
                  <span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5 text-[8px] font-bold text-white/50">
                    <Languages size={9} /> {t("otoCeviri")}{yukleniyor ? " …" : ""}
                  </span>
                  {aktif && (
                    <button
                      type="button"
                      onClick={() => setTrGoster((v) => !v)}
                      className="rounded-full bg-white/[.06] px-2 py-0.5 text-[8px] font-bold text-white/50 transition hover:bg-white/[.12] hover:text-white/80"
                    >
                      {trGoster ? t("ceviriGoster") : t("trGoster")}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/[.02] p-3">
          {acik.hayat.map((p, i) => (
            <p
              key={i}
              className="text-[10.5px] leading-relaxed text-white/75"
              dir={lang === "ar" ? "rtl" : undefined}
            >
              {g(p)}
            </p>
          ))}
        </div>

        <div className="rounded-xl border border-white/[.08] bg-white/[.02] p-3">
          <p className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            <BookOpen size={10} /> {t("shKaynak")}
          </p>
          <ul className="mt-1.5 space-y-1">
            {acik.kaynak.map((k) => (
              <li key={k} className="text-[8.5px] leading-relaxed text-white/45">· {k}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── Liste ekranı ──
  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-white/85">
          <BookOpen size={12} style={{ color: "var(--accent)" }} />
          {SAHABELER_TOPLAM} {t("shSahabi")} · {SAHABELER_KELIME_TOPLAM.toLocaleString("tr-TR")} {t("shKelime")}
        </p>
        <p className="mt-1 text-[8.5px] leading-relaxed text-white/40">{SAHABELER_KAYNAK_NOTU}</p>
      </div>

      {liste.length === 0 && (
        <p className="rounded-xl bg-white/[.03] px-3 py-4 text-center text-[10px] text-white/40">{t("shBos")}</p>
      )}

      <div className="space-y-1.5">
        {liste.map((s) => (
          <button
            key={s.id}
            type="button"
            data-minitur={`sahabe-${s.id}`}
            onClick={() => setSecili(s.id)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-left transition hover:bg-white/[.06]"
          >
            <span className="text-[16px] leading-none">{s.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-black text-white/90">{s.ad}</span>
              <span className="block truncate text-[8.5px] font-bold text-white/45">{s.unvan}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-[8px] font-black" style={{ color: "var(--accent-2)" }}>{s.tarih}</span>
              <span className="block text-[7.5px] font-bold text-white/30">{s.kelime} {t("shKelime")}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
