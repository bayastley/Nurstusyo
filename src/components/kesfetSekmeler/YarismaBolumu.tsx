import React from "react";
import { Trophy, Check, X, ChevronRight, RotateCcw } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import {
  YARISMA_SORULARI, YARISMA_SEVIYELERI, YARISMA_TOPLAM, YARISMA_KAYNAK_NOTU,
  type YarismaSeviye,
} from "../../data/yarismaData";

// ════════════════════════════════════════════════════════
// YARISMABOLUMU.TSX — İslami Bilgi Yarışması (madde 13)
// 3 seviye · 36 kaynaklı soru. Her turda 10 soru; cevap verilince
// doğru/yanlış + açıklama + kaynak. Puan dinî üstünlük ölçüsü değildir.
// 5 dil: metinler TR asıl, çeviri katmanı devreye girer.
// ════════════════════════════════════════════════════════

const TUR_BOYU = 10;

function karistir<T>(dizi: T[]): T[] {
  const k = [...dizi];
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [k[i], k[j]] = [k[j], k[i]];
  }
  return k;
}

export function YarismaBolumu({
  tt, lang = "tr",
}: {
  tt?: (k: string) => string;
  lang?: Lang;
}) {
  const t = tt ?? ((k: string) => k);
  const [seviye, setSeviye] = React.useState<YarismaSeviye>("baslangic");
  const [tur, setTur] = React.useState(() => karistir(YARISMA_SORULARI.filter((s) => s.seviye === "baslangic")).slice(0, TUR_BOYU));
  const [idx, setIdx] = React.useState(0);
  const [secim, setSecim] = React.useState<number | null>(null);
  const [skor, setSkor] = React.useState(0);
  const [bitti, setBitti] = React.useState(false);

  const soru = tur[idx];

  const ceviriMetinleri = React.useMemo(() => {
    if (!soru) return [YARISMA_KAYNAK_NOTU];
    return [soru.soru, ...soru.secenekler, soru.aciklama, YARISMA_KAYNAK_NOTU];
  }, [soru]);

  const { aktif, yukleniyor, cevir } = useIcerikCeviri(ceviriMetinleri, lang);
  const [trGoster, setTrGoster] = React.useState(false);
  const g = React.useCallback((m: string) => (aktif && !trGoster ? cevir(m) : m), [aktif, trGoster, cevir]);

  const yeniTur = (yeniSeviye: YarismaSeviye) => {
    const havuz = YARISMA_SORULARI.filter((s) => s.seviye === yeniSeviye);
    setSeviye(yeniSeviye);
    setTur(karistir(havuz).slice(0, Math.min(TUR_BOYU, havuz.length)));
    setIdx(0);
    setSecim(null);
    setSkor(0);
    setBitti(false);
    setTrGoster(false);
  };

  const cevapla = (oi: number) => {
    if (secim !== null) return;
    setSecim(oi);
    if (oi === soru.cevap) setSkor((s) => s + 1);
  };

  const ileri = () => {
    if (idx + 1 >= tur.length) { setBitti(true); return; }
    setIdx((i) => i + 1);
    setSecim(null);
  };

  return (
    <div className="space-y-2.5">
      {/* Kapsam */}
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-white/85">
          <Trophy size={12} style={{ color: "var(--accent)" }} />
          {t("ksYarisma")} · {YARISMA_TOPLAM} {t("yrSoru")} · 3 {t("yrSeviye")}
        </p>
        <p className="mt-1 text-[8.5px] leading-relaxed text-white/40">{g(YARISMA_KAYNAK_NOTU)}</p>
        {aktif && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-white/[.06] px-2 py-0.5 text-[8px] font-bold text-white/50">
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

      {/* Seviye seçici */}
      <div className="flex flex-wrap items-center gap-1.5">
        {YARISMA_SEVIYELERI.map((s) => (
          <button
            key={s.id}
            type="button"
            data-minitur={`yarisma-seviye-${s.id}`}
            onClick={() => yeniTur(s.id)}
            className={`rounded-xl border px-2.5 py-1.5 text-[9.5px] font-bold transition ${
              seviye === s.id
                ? "border-white/25 bg-white/[.09] text-white"
                : "border-white/10 bg-white/[.03] text-white/55 hover:bg-white/[.06] hover:text-white/80"
            }`}
          >
            <span className="mr-1">{s.emoji}</span>{t(`yr${s.id === "baslangic" ? "Baslangic" : s.id === "orta" ? "Orta" : "Ileri"}`)}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5 text-[8.5px] font-black text-white/60">
          {skor} / {Math.min(idx + (secim !== null ? 1 : 0), tur.length)}
        </span>
      </div>

      {!bitti && soru && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-white/15 bg-white/[.05] p-3.5">
            <p className="text-[8.5px] font-black uppercase tracking-widest text-white/40">
              {idx + 1} / {tur.length} · {t("yrSoru")}
            </p>
            <p className="mt-1 text-[11.5px] font-black leading-relaxed text-white/90" dir={lang === "ar" ? "rtl" : undefined}>
              {g(soru.soru)}
            </p>
          </div>

          <div className="grid gap-1.5">
            {soru.secenekler.map((sec, oi) => {
              const cevaplandi = secim !== null;
              const dogru = oi === soru.cevap;
              const secildi = secim === oi;
              const sinif = !cevaplandi
                ? "border-white/10 bg-white/[.04] text-white/75 hover:bg-white/[.09] hover:text-white"
                : dogru
                  ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                  : secildi
                    ? "border-red-400/40 bg-red-400/15 text-red-100"
                    : "border-white/5 bg-white/[.02] text-white/35";
              return (
                <button
                  key={oi}
                  type="button"
                  data-minitur={`yarisma-secim-${oi}`}
                  disabled={cevaplandi}
                  onClick={() => cevapla(oi)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[10px] font-bold transition ${sinif}`}
                >
                  <span>{String.fromCharCode(65 + oi)}) {g(sec)}</span>
                  {cevaplandi && dogru && <Check size={12} className="shrink-0" />}
                  {cevaplandi && secildi && !dogru && <X size={12} className="shrink-0" />}
                </button>
              );
            })}
          </div>

          {secim !== null && (
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-[9.5px] leading-relaxed text-white/70">{g(soru.aciklama)}</p>
              <p className="mt-1 text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>📖 {soru.kaynak}</p>
              <button
                type="button"
                data-minitur="yarisma-ileri"
                onClick={ileri}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[9.5px] font-black text-black"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                {idx + 1 >= tur.length ? t("yrBitis") : t("yrSonraki")} <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {bitti && (
        <div className="rounded-2xl border border-white/15 bg-white/[.05] p-4 text-center">
          <p className="text-2xl">🏆</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/45">{t("yrSkor")}</p>
          <p className="text-[26px] font-black text-white">{skor} <span className="text-[13px] text-white/40">/ {tur.length}</span></p>
          <p className="mt-1 text-[9px] leading-relaxed text-white/50">
            {skor >= 8 ? "Mâşâallah, güçlü bir tur!" : skor >= 5 ? "İyi; bir tur daha açıklamaları pekiştirir." : "Açıklamaları okuyup yeni tur denemek en iyi yol."}
          </p>
          <button
            type="button"
            data-minitur="yarisma-yeniden"
            onClick={() => yeniTur(seviye)}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black text-black"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            <RotateCcw size={11} /> {t("yrYeniden")}
          </button>
        </div>
      )}

      <p className="pt-1 text-center text-[8px] leading-relaxed text-white/25">{t("yrDipnot")}</p>
    </div>
  );
}
