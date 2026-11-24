import React from "react";
import { BookOpen, Check, GraduationCap, RotateCcw, Sparkles, X } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import {
  KURAN_HARFLERI, MAHREC_GRUPLARI, MAHREC_KAYNAK_NOTU, MAHREC_SORULARI, type MahrecGrup,
} from "../../data/kuranOkulu";

// ════════════════════════════════════════════════════════
// KURANOKULUBOLUMU.TSX — Mahreç Akademisi (madde 1) + Çocuk Elifbâsı (madde 8)
// · Mahreç: 4 çıkış bölgesi + 29 harf + 10 soruluk mini sınav
// · Çocuk: büyük harf kartları, ad + örnek kelime (dokununca açılır)
// Metinler TR asıl; en/ar/id/ur seçiliyse çeviri katmanı devreye girer.
// ════════════════════════════════════════════════════════

export function KuranOkuluBolumu({
  tt, lang = "tr",
}: { tt?: (k: string) => string; lang?: Lang }) {
  const t = tt ?? ((k: string) => k);
  const [mod, setMod] = React.useState<"mahrec" | "elifba">("mahrec");
  const [grup, setGrup] = React.useState<MahrecGrup | "tumu">("tumu");
  const [secili, setSecili] = React.useState<string | null>(null);
  const [cevap, setCevap] = React.useState<Record<number, number>>({});

  const harfler = React.useMemo(
    () => KURAN_HARFLERI.filter((h) => grup === "tumu" || h.grup === grup),
    [grup]
  );
  const seciliHarf = KURAN_HARFLERI.find((h) => h.harf === secili) ?? null;

  const ceviriMetinleri = React.useMemo(() => {
    const liste: string[] = [MAHREC_KAYNAK_NOTU];
    MAHREC_GRUPLARI.forEach((g) => liste.push(g.ad, g.aciklama));
    harfler.forEach((h) => liste.push(h.ad, h.nokta, h.ornekAnlam));
    MAHREC_SORULARI.forEach((s) => liste.push(s.soru, s.aciklama, ...s.secenekler));
    return liste;
  }, [harfler]);

  const { aktif, cevir } = useIcerikCeviri(ceviriMetinleri, lang);
  const g = (m: string) => (aktif ? cevir(m) : m);

  const dogruSayisi = MAHREC_SORULARI.reduce((n, s, i) => (cevap[i] === s.dogru ? n + 1 : n), 0);
  const cevaplanan = Object.keys(cevap).length;

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black tracking-wide text-white/85">
          <GraduationCap size={12} /> {t("ksKuranOkulu")}
        </p>
        <p className="text-[9px] leading-relaxed text-white/45">{g(MAHREC_KAYNAK_NOTU)}</p>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMod("mahrec")}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-[9.5px] font-bold transition ${mod === "mahrec" ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50"}`}
        >
          {t("koMahrec")}
        </button>
        <button
          type="button"
          onClick={() => setMod("elifba")}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-[9.5px] font-bold transition ${mod === "elifba" ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50"}`}
        >
          {t("koCocuk")}
        </button>
      </div>

      {mod === "mahrec" ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setGrup("tumu")}
              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold transition ${grup === "tumu" ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50"}`}
            >
              {t("ksTemaTumu")}
            </button>
            {MAHREC_GRUPLARI.map((mg) => (
              <button
                key={mg.id}
                type="button"
                onClick={() => setGrup(mg.id)}
                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold transition ${grup === mg.id ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50"}`}
              >
                {g(mg.ad)}
              </button>
            ))}
          </div>

          {grup !== "tumu" && (
            <p className="rounded-lg bg-white/[.04] px-2.5 py-1.5 text-[9px] leading-relaxed text-white/55">
              {g(MAHREC_GRUPLARI.find((mg) => mg.id === grup)?.aciklama ?? "")}
            </p>
          )}

          <div className="grid grid-cols-5 gap-1.5">
            {harfler.map((h) => (
              <button
                key={h.harf}
                type="button"
                onClick={() => setSecili(secili === h.harf ? null : h.harf)}
                className={`flex flex-col items-center rounded-lg border px-1 py-1.5 transition ${secili === h.harf ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}
              >
                <span className="text-[17px] leading-tight text-white/90" dir="rtl">{h.harf}</span>
                <span className="text-[7.5px] text-white/45">{h.ad}</span>
              </button>
            ))}
          </div>

          {seciliHarf && (
            <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5">
              <p className="text-[9.5px] font-bold text-white/85">
                {seciliHarf.ad} <span className="text-[15px]" dir="rtl">{seciliHarf.harf}</span>
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-white/60">
                <span className="font-bold text-white/75">{t("koGrup")}: </span>
                {g(MAHREC_GRUPLARI.find((mg) => mg.id === seciliHarf.grup)?.ad ?? "")}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-white/60">{g(seciliHarf.nokta)}</p>
              <p className="mt-1.5 flex items-center justify-between rounded-lg bg-white/[.04] px-2 py-1">
                <span className="text-[8.5px] text-white/45">{t("koOrnek")}</span>
                <span className="text-[13px] text-white/85" dir="rtl">{seciliHarf.ornek}</span>
                <span className="text-[8.5px] font-semibold" style={{ color: "var(--accent)" }}>{g(seciliHarf.ornekAnlam)}</span>
              </p>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
            <p className="mb-2 flex items-center justify-between text-[9.5px] font-black text-white/80">
              <span className="flex items-center gap-1.5"><Sparkles size={11} /> {t("koSinav")}</span>
              <span className="text-[8.5px] font-bold text-white/45">
                {dogruSayisi} / {cevaplanan || MAHREC_SORULARI.length}
              </span>
            </p>
            <div className="space-y-2">
              {MAHREC_SORULARI.map((s, i) => {
                const verilen = cevap[i];
                return (
                  <div key={i} className="rounded-lg bg-white/[.035] px-2.5 py-2">
                    <p className="mb-1.5 text-[9px] font-semibold text-white/75">{i + 1}. {g(s.soru)}</p>
                    <div className="grid gap-1">
                      {s.secenekler.map((sec, si) => {
                        const secildi = verilen === si;
                        const dogruMu = si === s.dogru;
                        const goster = verilen !== undefined;
                        return (
                          <button
                            key={si}
                            type="button"
                            disabled={goster}
                            onClick={() => setCevap((c) => ({ ...c, [i]: si }))}
                            className={`flex items-center justify-between rounded-md px-2 py-1 text-left text-[8.5px] transition ${
                              goster && dogruMu
                                ? "bg-emerald-500/15 text-emerald-200"
                                : goster && secildi
                                  ? "bg-red-500/15 text-red-200"
                                  : "bg-white/[.04] text-white/60 hover:bg-white/[.08]"
                            }`}
                          >
                            <span>{g(sec)}</span>
                            {goster && dogruMu && <Check size={10} />}
                            {goster && secildi && !dogruMu && <X size={10} />}
                          </button>
                        );
                      })}
                    </div>
                    {verilen !== undefined && (
                      <p className={`mt-1 text-[8px] leading-relaxed ${verilen === s.dogru ? "text-emerald-300/80" : "text-white/45"}`}>
                        {verilen === s.dogru ? `${t("koDogru")}. ` : `${t("koYanlis")}: `}
                        {g(s.aciklama)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {cevaplanan > 0 && (
              <button
                type="button"
                onClick={() => setCevap({})}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-[9px] font-bold text-white/60 transition hover:bg-white/10"
              >
                <RotateCcw size={11} /> {t("koTekrar")}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="rounded-lg bg-white/[.04] px-2.5 py-1.5 text-[9px] leading-relaxed text-white/55">
            {t("koCocukNot")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {KURAN_HARFLERI.map((h) => (
              <button
                key={h.harf}
                type="button"
                onClick={() => setSecili(secili === h.harf ? null : h.harf)}
                className={`rounded-xl border px-2 py-3 text-center transition ${secili === h.harf ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}
              >
                <span className="block text-[40px] leading-none text-white/90" dir="rtl">{h.harf}</span>
                <span className="mt-1 block text-[10px] font-bold text-white/70">{h.ad}</span>
                {secili === h.harf && (
                  <>
                    <span className="mt-1 block text-[17px] text-white/85" dir="rtl">{h.ornek}</span>
                    <span className="mt-0.5 block text-[8.5px]" style={{ color: "var(--accent)" }}>
                      {g(h.ornekAnlam)}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[8.5px] text-white/35">
            <BookOpen size={10} /> {KURAN_HARFLERI.length} {t("keHarf")}
          </p>
        </>
      )}
    </div>
  );
}
