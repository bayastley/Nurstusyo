import React from "react";
import { ChevronDown, Clock3, MapPin, Languages } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import { TARIH_DONEMLERI, TARIH_KAYNAK_NOTU, TARIH_TOPLAM } from "../../data/islamTarihiData";

// ════════════════════════════════════════════════════════
// TARIHBOLUMU.TSX — İslam Tarihi Zaman Tüneli (yol haritası madde 9)
// 6 dönem (doğum → Mekke → Medine → Hulefâ → medeniyet → sahabiler), 59 olay.
// Her olay: tarih + özet + kaynak. Dönem filtresi + arama.
//
// ★ 5 DİL: dönem adları, olay başlıkları ve açılan olayın özeti seçili dile
//   çevrilir (önbellekli). Çeviri gelmezse TR gösterilir; "Türkçe" düğmesiyle
//   asıl metne dönülür. Kaynak künyeleri özel isim olduğu için çevrilmez.
// ════════════════════════════════════════════════════════

const DONEM_RENK: Record<string, { nokta: string; cip: string }> = {
  amber: { nokta: "bg-amber-400", cip: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
  emerald: { nokta: "bg-emerald-400", cip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" },
  sky: { nokta: "bg-sky-400", cip: "border-sky-400/30 bg-sky-400/10 text-sky-200" },
  violet: { nokta: "bg-violet-400", cip: "border-violet-400/30 bg-violet-400/10 text-violet-200" },
  rose: { nokta: "bg-rose-400", cip: "border-rose-400/30 bg-rose-400/10 text-rose-200" },
  teal: { nokta: "bg-teal-400", cip: "border-teal-400/30 bg-teal-400/10 text-teal-200" },
};

export function TarihBolumu({
  tt, q = "", lang = "tr",
}: { tt?: (k: string) => string; q?: string; lang?: Lang }) {
  const t = tt ?? ((k: string) => k);
  const [donemId, setDonemId] = React.useState<string>("tumu");
  const [acik, setAcik] = React.useState<string | null>(null);
  const [trGoster, setTrGoster] = React.useState(false);

  const ara = q.trim().toLocaleLowerCase("tr");
  const donemler = React.useMemo(() => {
    return TARIH_DONEMLERI
      .filter((d) => donemId === "tumu" || d.id === donemId)
      .map((d) => ({
        ...d,
        olaylar: !ara ? d.olaylar : d.olaylar.filter((o) =>
          o.baslik.toLocaleLowerCase("tr").includes(ara) ||
          o.ozet.toLocaleLowerCase("tr").includes(ara) ||
          o.tarih.toLocaleLowerCase("tr").includes(ara)
        ),
      }))
      .filter((d) => d.olaylar.length > 0);
  }, [donemId, ara]);

  const gorunen = donemler.reduce((t2, d) => t2 + d.olaylar.length, 0);

  // Açık olayın özeti de çeviri listesine girer (yalnız açıkken)
  const acikOzet = React.useMemo(() => {
    if (!acik) return "";
    const [did, oi] = acik.split("::");
    const d = TARIH_DONEMLERI.find((x) => x.id === did);
    return d?.olaylar[Number(oi)]?.ozet ?? "";
  }, [acik]);

  const ceviriMetinleri = React.useMemo(() => {
    const liste: string[] = [TARIH_KAYNAK_NOTU, ...TARIH_DONEMLERI.map((d) => d.ad)];
    donemler.forEach((d) => {
      d.olaylar.forEach((o) => { liste.push(o.baslik, o.tarih); });
    });
    if (acikOzet) liste.push(acikOzet);
    return liste;
  }, [donemler, acikOzet]);

  const { aktif, yukleniyor, cevir } = useIcerikCeviri(ceviriMetinleri, lang);
  const g = React.useCallback((m: string) => (aktif && !trGoster ? cevir(m) : m), [aktif, trGoster, cevir]);

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-white/85">
          <Clock3 size={12} style={{ color: "var(--accent)" }} />
          {t("trZaman")} · {TARIH_TOPLAM} {t("trOlay")} · {TARIH_DONEMLERI.length} {t("trDonem")}
        </p>
        <p className="mt-1 text-[8.5px] leading-relaxed text-white/40">{g(TARIH_KAYNAK_NOTU)}</p>
        {aktif && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5 text-[8px] font-bold text-white/50">
              <Languages size={9} />
              {t("otoCeviri")}{yukleniyor ? " …" : ""}
            </span>
            <button
              type="button"
              onClick={() => setTrGoster((v) => !v)}
              className="rounded-full bg-white/[.06] px-2 py-0.5 text-[8px] font-bold text-white/50 transition hover:bg-white/[.12] hover:text-white/80"
            >
              {trGoster ? t("ceviriGoster") : t("trGoster")}
            </button>
          </div>
        )}
      </div>

      {/* Dönem filtresi */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setDonemId("tumu")}
          className={`rounded-xl border px-2.5 py-1.5 text-[9.5px] font-bold transition ${
            donemId === "tumu"
              ? "border-white/25 bg-white/[.09] text-white"
              : "border-white/10 bg-white/[.03] text-white/55 hover:bg-white/[.06] hover:text-white/80"
          }`}
        >
          {t("trTumu")}
        </button>
        {TARIH_DONEMLERI.map((d) => {
          const secili = donemId === d.id;
          return (
            <button
              key={d.id}
              type="button"
              data-minitur={`tarih-${d.id}`}
              onClick={() => setDonemId(secili ? "tumu" : d.id)}
              className={`rounded-xl border px-2.5 py-1.5 text-[9.5px] font-bold transition ${
                secili
                  ? "border-white/25 bg-white/[.09] text-white"
                  : "border-white/10 bg-white/[.03] text-white/55 hover:bg-white/[.06] hover:text-white/80"
              }`}
            >
              <span className="mr-1">{d.emoji}</span>{g(d.ad)}
            </button>
          );
        })}
      </div>

      {gorunen === 0 && (
        <p className="rounded-xl bg-white/[.03] px-3 py-4 text-center text-[10px] text-white/40">{t("trBos")}</p>
      )}

      {/* Zaman tüneli */}
      <div className="space-y-4">
        {donemler.map((d) => {
          const renk = DONEM_RENK[d.renk] ?? DONEM_RENK.amber;
          return (
            <div key={d.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  {d.emoji} {g(d.ad)}
                </p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black ${renk.cip}`}>
                  {d.aralik}
                </span>
              </div>
              <div className="relative ml-2 space-y-1.5 border-l border-white/10 pl-3">
                {d.olaylar.map((o, oi) => {
                  const anahtar = `${d.id}::${TARIH_DONEMLERI.find((x) => x.id === d.id)?.olaylar.indexOf(o) ?? oi}`;
                  const acikMi = acik === anahtar;
                  return (
                    <div key={anahtar} className="relative">
                      <span className={`absolute -left-[17px] top-2.5 h-2 w-2 rounded-full ${renk.nokta}`} />
                      <button
                        type="button"
                        data-minitur={`tarih-olay-${anahtar}`}
                        onClick={() => setAcik(acikMi ? null : anahtar)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                          acikMi
                            ? "border-white/25 bg-white/[.07]"
                            : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[8.5px] font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
                              {g(o.tarih)}
                            </p>
                            <p className="mt-0.5 text-[10.5px] font-black text-white/90" dir={lang === "ar" ? "rtl" : undefined}>{g(o.baslik)}</p>
                          </div>
                          <ChevronDown
                            size={12}
                            className={`mt-1 shrink-0 text-white/40 transition-transform ${acikMi ? "" : "-rotate-90"}`}
                          />
                        </div>
                        {acikMi && (
                          <div className="mt-2 border-t border-white/5 pt-2">
                            <p className="text-[10px] leading-relaxed text-white/70" dir={lang === "ar" ? "rtl" : undefined}>{g(o.ozet)}</p>
                            <p className="mt-1.5 flex items-start gap-1 text-[8px] font-bold" style={{ color: "var(--accent)" }}>
                              <MapPin size={9} className="mt-0.5 shrink-0" />
                              {o.kaynak}
                            </p>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="pt-1 text-center text-[8px] leading-relaxed text-white/25">{t("trDipnot")}</p>
    </div>
  );
}
