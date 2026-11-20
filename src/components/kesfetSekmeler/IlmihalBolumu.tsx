import React from "react";
import { BookOpenCheck, Check, X, ChevronDown, Languages } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import {
  ILMIHAL_DERSLERI, ILMIHAL_KAYNAK_NOTU, ILMIHAL_TOPLAM,
  type IlmihalDers,
} from "../../data/ilmihalData";

// ════════════════════════════════════════════════════════
// ILMIHALBOLUMU.TSX — İlmihal Akademisi (yol haritası madde 11)
// Hanefî esaslı 12 ders: her madde kaynaklı, her dersin sonunda 3 soruluk
// mini sınav. Cevap verilince doğru/yanlış + açıklama + kaynak gösterilir.
//
// ★ 5 DİL: metinler TR asıl; en/ar/id/ur seçiliyse cihaz önbellekli çeviri
//   katmanı devreye girer (useIcerikCeviri). Çeviri gelmezse TR gösterilir,
//   kullanıcı isterse "Türkçe" düğmesiyle asıl metne döner.
// ★ Puan/sevaп hesaplanmaz (dini hassasiyet) — yalnız öğrenme geri bildirimi.
// ════════════════════════════════════════════════════════

export function IlmihalBolumu({
  tt, q = "", lang = "tr", baslangicDers, onSekme,
  derslerVeri = ILMIHAL_DERSLERI, kaynakNotu = ILMIHAL_KAYNAK_NOTU,
  toplam = ILMIHAL_TOPLAM, miniturOnek = "ilmihal",
}: {
  tt?: (k: string) => string;
  q?: string;
  lang?: Lang;
  /** Başka sekmeden "şu dersi aç" ile gelindiğinde açılacak ders id'si */
  baslangicDers?: string;
  /** Alt köprü: ilgili sekmeye geçiş (Namaz Öğretici, Soru-Cevap...) */
  onSekme?: (sekme: string) => void;
  /** ★ 20.11 GENELLEŞTİRME: aynı ders+sınav düzenini Ahlâk bölümü de kullanır */
  derslerVeri?: IlmihalDers[];
  kaynakNotu?: string;
  toplam?: { ders: number; madde: number; soru: number };
  miniturOnek?: string;
}) {
  const t = tt ?? ((k: string) => k);
  const [dersId, setDersId] = React.useState<string>(baslangicDers || derslerVeri[0]?.id || "");
  const [cevaplar, setCevaplar] = React.useState<Record<string, number>>({});
  const [acikMadde, setAcikMadde] = React.useState<string | null>(null);
  const [trGoster, setTrGoster] = React.useState(false);

  // ★ 20.11 DAĞITIM: Namaz/Abdest/Soru-Cevap gibi sekmelerden "ilmihal dersine git"
  React.useEffect(() => {
    if (baslangicDers && derslerVeri.some((d) => d.id === baslangicDers)) {
      setDersId(baslangicDers);
      setAcikMadde(null);
    }
  }, [baslangicDers, derslerVeri]);

  const ara = q.trim().toLocaleLowerCase("tr");
  const dersler = React.useMemo(() => {
    if (!ara) return derslerVeri;
    return derslerVeri.filter((d) =>
      d.ad.toLocaleLowerCase("tr").includes(ara) ||
      d.alt.toLocaleLowerCase("tr").includes(ara) ||
      d.maddeler.some((m) =>
        m.baslik.toLocaleLowerCase("tr").includes(ara) ||
        m.metin.toLocaleLowerCase("tr").includes(ara) ||
        m.delil.toLocaleLowerCase("tr").includes(ara)
      ) ||
      d.sorular.some((s) => s.soru.toLocaleLowerCase("tr").includes(ara))
    );
  }, [ara, derslerVeri]);

  const ders: IlmihalDers | undefined = dersler.find((d) => d.id === dersId) ?? dersler[0];

  // Çevrilecek metinler: ders çipleri + açık dersin tüm alanları
  const ceviriMetinleri = React.useMemo(() => {
    const liste: string[] = [kaynakNotu, ...derslerVeri.map((d) => d.ad)];
    if (ders) {
      liste.push(ders.ad, ders.alt);
      ders.maddeler.forEach((m) => { liste.push(m.baslik, m.metin); });
      ders.sorular.forEach((s) => {
        liste.push(s.soru, s.aciklama, ...s.secenekler);
      });
    }
    return liste;
  }, [ders, kaynakNotu, derslerVeri]);

  const { aktif, yukleniyor, cevir } = useIcerikCeviri(ceviriMetinleri, lang);
  // trGoster: kullanıcı çeviriyi kapatıp asıl metni görmek isterse
  const g = React.useCallback((m: string) => (aktif && !trGoster ? cevir(m) : m), [aktif, trGoster, cevir]);

  return (
    <div className="space-y-2.5">
      {/* Kaynak ve kapsam notu — "her içerik sahih" ilkesi görünür olsun */}
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-white/85">
          <BookOpenCheck size={12} style={{ color: "var(--accent)" }} />
          {t("ilKapsam")} · {toplam.ders} {t("ilDers")} · {toplam.madde} {t("ilMadde")} · {toplam.soru} {t("ilSoru")}
        </p>
        <p className="mt-1 text-[8.5px] leading-relaxed text-white/40">{g(kaynakNotu)}</p>
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

      {/* Ders seçici */}
      <div className="flex flex-wrap gap-1.5">
        {dersler.map((d) => {
          const secili = ders?.id === d.id;
          return (
            <button
              key={d.id}
              type="button"
              data-minitur={`${miniturOnek}-${d.id}`}
              onClick={() => { setDersId(d.id); setAcikMadde(null); }}
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

      {!ders && (
        <p className="rounded-xl bg-white/[.03] px-3 py-4 text-center text-[10px] text-white/40">{t("ilBos")}</p>
      )}

      {ders && (
        <div className="space-y-2">
          {/* Ders başlığı */}
          <div className="rounded-2xl border border-white/15 bg-white/[.05] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                  {t("ilDers")}
                </span>
                <h3 className="mt-0.5 text-[15px] font-black text-white">{ders.emoji} {g(ders.ad)}</h3>
                <p className="mt-1 text-[9.5px] leading-relaxed text-white/50">{g(ders.alt)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[8px] font-black text-white/60">
                {ders.maddeler.length} {t("ilMadde")}
              </span>
            </div>
          </div>

          {/* Maddeler — akordeon (uzun metin ekranı doldurmasın) */}
          <div className="space-y-1.5">
            {ders.maddeler.map((m, i) => {
              const anahtar = `${ders.id}-m${i}`;
              const acik = acikMadde === anahtar;
              return (
                <div key={anahtar} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
                  <button
                    type="button"
                    onClick={() => setAcikMadde(acik ? null : anahtar)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                  >
                    <span className="text-[10.5px] font-black text-white/90">{i + 1}. {g(m.baslik)}</span>
                    <ChevronDown size={12} className={`shrink-0 text-white/40 transition-transform ${acik ? "" : "-rotate-90"}`} />
                  </button>
                  {acik && (
                    <div className="border-t border-white/5 px-3 pb-3 pt-2">
                      <p className="text-[10px] leading-relaxed text-white/70" dir={g(m.metin) !== m.metin && lang === "ar" ? "rtl" : undefined}>{g(m.metin)}</p>
                      <p className="mt-1.5 text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>📖 {m.delil}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ders sonu mini sınav */}
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/45">
              {t("ilSinav")} · {ders.sorular.length} {t("ilSoru")}
            </p>
            <div className="mt-2 space-y-2.5">
              {ders.sorular.map((s, si) => {
                const anahtar = `${ders.id}-s${si}`;
                const secim = cevaplar[anahtar];
                const cevaplandi = secim !== undefined;
                return (
                  <div key={anahtar} className="rounded-xl border border-white/10 bg-white/[.02] p-2.5">
                    <p className="text-[10px] font-black text-white/85" dir={lang === "ar" ? "rtl" : undefined}>{si + 1}. {g(s.soru)}</p>
                    <div className="mt-1.5 grid gap-1">
                      {s.secenekler.map((sec, oi) => {
                        const dogru = oi === s.cevap;
                        const secildi = secim === oi;
                        const sinif = !cevaplandi
                          ? "border-white/10 bg-white/[.04] text-white/70 hover:bg-white/[.08] hover:text-white"
                          : dogru
                            ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                            : secildi
                              ? "border-red-400/40 bg-red-400/15 text-red-100"
                              : "border-white/5 bg-white/[.02] text-white/35";
                        return (
                          <button
                            key={oi}
                            type="button"
                            disabled={cevaplandi}
                            onClick={() => setCevaplar((c) => ({ ...c, [anahtar]: oi }))}
                            className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[9.5px] font-bold transition ${sinif}`}
                          >
                            <span>{String.fromCharCode(65 + oi)}) {g(sec)}</span>
                            {cevaplandi && dogru && <Check size={11} className="shrink-0" />}
                            {cevaplandi && secildi && !dogru && <X size={11} className="shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {cevaplandi && (
                      <div className="mt-1.5 rounded-lg bg-white/[.04] px-2 py-1.5">
                        <p className="text-[9px] leading-relaxed text-white/65">{g(s.aciklama)}</p>
                        <p className="mt-1 text-[8px] font-bold" style={{ color: "var(--accent-2)" }}>📖 {s.kaynak}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setCevaplar((c) => {
                const n = { ...c };
                ders.sorular.forEach((_, si) => delete n[`${ders.id}-s${si}`]);
                return n;
              })}
              className="mt-2 w-full rounded-lg bg-white/5 py-1.5 text-[8.5px] font-bold text-white/45 transition hover:bg-white/10 hover:text-white/70"
            >
              {t("ilSifirla")}
            </button>
          </div>
        </div>
      )}

      {/* ★ 20.11 KÖPRÜ: ilmihalden ilgili sekmelere dağıtım */}
      {onSekme && (
        <div>
          <p className="mb-1 text-center text-[8px] font-black uppercase tracking-widest text-white/35">{t("ilKopruBaslik")}</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { id: "namaz", anahtar: "ksNamazOgretici" },
              { id: "soru", anahtar: "ksSoruCevap" },
              { id: "adab", anahtar: "ksAdabiMuaseret" },
              { id: "mezhepler", anahtar: "ksMezhepler" },
              { id: "tarih", anahtar: "ksTarih" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSekme(s.id)}
                className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[8.5px] font-bold text-white/60 transition hover:bg-white/[.09] hover:text-white"
              >
                {t(s.anahtar)}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="pt-1 text-center text-[8px] leading-relaxed text-white/25">{t("ilDipnot")}</p>
    </div>
  );
}
