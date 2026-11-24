import React from "react";
import { BookMarked, ChevronDown } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import { ESER_KATEGORILERI, ESER_KAYNAK_NOTU, ESER_TOPLAM, KLASIK_ESERLER, type EserKategori } from "../../data/klasikEserler";

// ════════════════════════════════════════════════════════
// KİTAPBOLUMU.TSX — İslâmî Kitap ve Eser Kütüphanesi (madde 15)
// 34 klasik eser · 7 kategori · arama · künye + kısa tanıtım.
// Metinler TR asıl; diğer dillerde önbellekli çeviri katmanı devreye girer.
// ════════════════════════════════════════════════════════

export function KitapBolumu({
  tt, q = "", lang = "tr",
}: { tt?: (k: string) => string; q?: string; lang?: Lang }) {
  const t = tt ?? ((k: string) => k);
  const [kategori, setKategori] = React.useState<EserKategori | "tumu">("tumu");
  const [acik, setAcik] = React.useState<string | null>(null);

  const ara = q.trim().toLocaleLowerCase("tr");
  const eserler = React.useMemo(
    () =>
      KLASIK_ESERLER.filter((e) => kategori === "tumu" || e.kategori === kategori).filter(
        (e) =>
          !ara ||
          `${e.ad} ${e.muellif} ${e.ozet} ${e.onem}`.toLocaleLowerCase("tr").includes(ara)
      ),
    [kategori, ara]
  );

  const ceviriMetinleri = React.useMemo(() => {
    const liste: string[] = [ESER_KAYNAK_NOTU];
    ESER_KATEGORILERI.forEach((k) => liste.push(k.ad));
    eserler.forEach((e) => {
      liste.push(e.ozet, e.onem);
      if (acik === e.id) liste.push(e.ad);
    });
    return liste;
  }, [eserler, acik]);

  const { aktif, cevir } = useIcerikCeviri(ceviriMetinleri, lang);
  const g = (m: string) => (aktif ? cevir(m) : m);

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-wide text-white/85">
          <BookMarked size={12} /> {t("ksKlasikEserler")} · {ESER_TOPLAM} {t("keEser")}
        </p>
        <p className="text-[9px] leading-relaxed text-white/45">{g(ESER_KAYNAK_NOTU)}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setKategori("tumu")}
          className={`rounded-full border px-2.5 py-1 text-[9px] font-bold transition ${kategori === "tumu" ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50 hover:text-white/80"}`}
        >
          {t("ksTemaTumu")}
        </button>
        {ESER_KATEGORILERI.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKategori(k.id)}
            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold transition ${kategori === k.id ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50 hover:text-white/80"}`}
          >
            {g(k.ad)}
          </button>
        ))}
      </div>

      <p className="text-[9px] text-white/35">
        {t("keBulunan")}: {eserler.length}
      </p>

      <div className="space-y-1.5">
        {eserler.map((e) => {
          const acikMi = acik === e.id;
          return (
            <div key={e.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
              <button
                type="button"
                onClick={() => setAcik(acikMi ? null : e.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition hover:bg-white/[.05]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[10.5px] font-bold text-white/90">{e.ad}</span>
                  <span className="block truncate text-[8.5px] text-white/45">
                    {e.muellif} · {e.vefat}
                  </span>
                </span>
                <ChevronDown size={13} className={`shrink-0 text-white/40 transition ${acikMi ? "rotate-180" : ""}`} />
              </button>
              {acikMi && (
                <div className="border-t border-white/[.07] px-3 py-2.5">
                  <p className="mb-1.5 text-[9.5px] leading-relaxed text-white/70">{g(e.ozet)}</p>
                  <p className="mb-1.5 text-[9.5px] leading-relaxed text-white/55">
                    <span className="font-bold text-white/75">{t("keOnem")}: </span>
                    {g(e.onem)}
                  </p>
                  <p className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                    {g(ESER_KATEGORILERI.find((k) => k.id === e.kategori)?.ad ?? "")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {eserler.length === 0 && <p className="py-4 text-center text-[9.5px] text-white/40">{t("keBulunamadi")}</p>}
      </div>
    </div>
  );
}
