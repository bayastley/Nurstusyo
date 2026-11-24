import React from "react";
import { BookOpen, Check, GraduationCap, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import type { Lang } from "../../i18n";
import { useIcerikCeviri } from "../../hooks/useIcerikCeviri";
import { kelimeOku } from "../kesfetTemel";
import {
  KURAN_HARFLERI, MAHREC_GRUPLARI, MAHREC_KAYNAK_NOTU, MAHREC_SORULARI, type KuranHarfi, type MahrecGrup,
} from "../../data/kuranOkulu";

const ILERLEME_KEY = "nur_elifba_ilerleme_v1";
const SKOR_KEY = "nur_elifba_skor_v1";
type SinavSorusu = { harf: KuranHarfi; secenekler: string[] };

function ilerlemeOku(): string[] {
  try {
    const ham: unknown = JSON.parse(localStorage.getItem(ILERLEME_KEY) || "[]");
    return Array.isArray(ham) ? ham.filter((x): x is string => typeof x === "string") : [];
  } catch (hata) {
    console.warn("Elifbâ ilerlemesi okunamadı:", hata);
    return [];
  }
}

function skorOku(): number {
  const n = Number(localStorage.getItem(SKOR_KEY) || "0");
  return Number.isFinite(n) ? n : 0;
}

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
  const [gorulen, setGorulen] = React.useState<string[]>(() => ilerlemeOku());
  const [enIyi, setEnIyi] = React.useState<number>(() => skorOku());
  const [sinav, setSinav] = React.useState<SinavSorusu[] | null>(null);
  const [soruIx, setSoruIx] = React.useState(0);
  const [skor, setSkor] = React.useState(0);
  const [secim, setSecim] = React.useState<string | null>(null);
  const [bitis, setBitis] = React.useState(false);

  const gorulenYaz = (liste: string[]) => {
    setGorulen(liste);
    try {
      localStorage.setItem(ILERLEME_KEY, JSON.stringify(liste));
    } catch (hata) {
      console.warn("Elifbâ ilerlemesi yazılamadı:", hata);
    }
  };

  const harfSec = (h: KuranHarfi) => {
    const yeniSecili = secili === h.harf ? null : h.harf;
    setSecili(yeniSecili);
    if (yeniSecili && !gorulen.includes(h.harf)) gorulenYaz([...gorulen, h.harf]);
  };

  const sinavBaslat = () => {
    const seciliHarfler = [...KURAN_HARFLERI].sort(() => Math.random() - 0.5).slice(0, 10);
    setSinav(seciliHarfler.map((h) => {
      const yanlis = KURAN_HARFLERI.filter((x) => x.harf !== h.harf)
        .sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.ad);
      return { harf: h, secenekler: [...yanlis, h.ad].sort(() => Math.random() - 0.5) };
    }));
    setSoruIx(0); setSkor(0); setSecim(null); setBitis(false);
  };

  const cevapla = (ad: string) => {
    if (secim || !sinav) return;
    setSecim(ad);
    if (ad === sinav[soruIx].harf.ad) setSkor((s) => s + 1);
  };

  const sonrakiSoru = () => {
    if (!sinav) return;
    if (soruIx + 1 >= sinav.length) {
      const yeniEnIyi = Math.max(enIyi, skor);
      setEnIyi(yeniEnIyi);
      try { localStorage.setItem(SKOR_KEY, String(yeniEnIyi)); } catch (hata) { console.warn("Elifbâ skoru yazılamadı:", hata); }
      setBitis(true);
      return;
    }
    setSoruIx((i) => i + 1);
    setSecim(null);
  };

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

          {/* VELİ TAKİBİ: görülen harf sayısı cihazda saklanır */}
          <div className="rounded-xl border border-white/10 bg-white/[.03] px-2.5 py-2">
            <div className="mb-1 flex items-center justify-between text-[8.5px] font-bold text-white/60">
              <span>{gorulen.length} / {KURAN_HARFLERI.length} {t("koHarfTanindi")}</span>
              <button type="button" onClick={() => gorulenYaz([])} className="text-[8px] text-white/35 hover:text-white/70">{t("koSifirla")}</button>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${Math.round((gorulen.length / KURAN_HARFLERI.length) * 100)}%`, background: "linear-gradient(90deg,var(--accent-2),var(--accent))" }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {KURAN_HARFLERI.map((h) => (
              <button
                key={h.harf}
                type="button"
                onClick={() => harfSec(h)}
                className={`rounded-xl border px-2 py-3 text-center transition ${secili === h.harf ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}
              >
                <span className="block text-[40px] leading-none text-white/90" dir="rtl">{h.harf}</span>
                <span className="mt-1 block text-[10px] font-bold text-white/70">{h.ad}</span>
                {gorulen.includes(h.harf) && <span className="mt-0.5 block text-[7.5px] text-emerald-300/70">✓</span>}
              </button>
            ))}
          </div>

          {seciliHarf && (
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/[.06] px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] font-black text-white/85">{seciliHarf.ad}</p>
                <button type="button" onClick={() => void kelimeOku({ ar: seciliHarf.harf, okunus: seciliHarf.ad })}
                  className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[8px] font-bold text-white/70">
                  <Volume2 size={10} /> {t("koSes")}
                </button>
              </div>
              <div className="mb-1.5 grid grid-cols-3 gap-1">
                {([["koBas", seciliHarf.bas], ["koOrta", seciliHarf.orta], ["koSon", seciliHarf.son]] as const).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-black/25 py-1 text-center">
                    <p className="text-[7px] font-bold text-white/35">{t(k)}</p>
                    <p className="text-[18px] text-white/90" dir="rtl">{v}</p>
                  </div>
                ))}
              </div>
              {!seciliHarf.baglanir && <p className="mb-1 text-[8px] text-white/40">{t("koBaglanmaz")}</p>}
              <div className="flex items-center justify-between rounded-lg bg-white/[.05] px-2 py-1">
                <span className="text-[8px] text-white/45">{t("koOrnek")}</span>
                <span className="text-[16px] text-white/85" dir="rtl">{seciliHarf.ornek}</span>
                <span className="text-[8.5px] font-semibold" style={{ color: "var(--accent)" }}>{g(seciliHarf.ornekAnlam)}</span>
              </div>
            </div>
          )}

          {/* ÇOCUK SINAVI: harf tanıma, 10 soru */}
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
            <p className="mb-2 flex items-center justify-between text-[9.5px] font-black text-white/80">
              <span className="flex items-center gap-1.5"><Sparkles size={11} /> {t("koCocukSinav")}</span>
              <span className="text-[8px] font-bold text-white/40">{t("koEnIyi")}: {enIyi}/10</span>
            </p>
            {!sinav ? (
              <button type="button" onClick={sinavBaslat}
                className="w-full rounded-lg bg-white/10 py-1.5 text-[9px] font-bold text-white/75 transition hover:bg-white/20">
                {t("koSinav")}
              </button>
            ) : bitis ? (
              <div className="space-y-1.5 text-center">
                <p className="text-[11px] font-black text-emerald-300">{t("koSonuc")}: {skor}/{sinav.length}</p>
                <button type="button" onClick={sinavBaslat}
                  className="flex w-full items-center justify-center gap-1 rounded-lg bg-white/10 py-1.5 text-[9px] font-bold text-white/70">
                  <RotateCcw size={11} /> {t("koYeniTur")}
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-center text-[8.5px] text-white/40">{soruIx + 1} / {sinav.length}</p>
                <p className="text-center text-[46px] leading-none text-white/90" dir="rtl">{sinav[soruIx].harf.harf}</p>
                <p className="text-center text-[9px] text-white/55">{t("koSoru")}</p>
                <div className="grid gap-1">
                  {sinav[soruIx].secenekler.map((sec) => {
                    const dogru = sec === sinav[soruIx].harf.ad;
                    const goster = secim !== null;
                    return (
                      <button key={sec} type="button" disabled={goster} onClick={() => cevapla(sec)}
                        className={`flex items-center justify-between rounded-md px-2 py-1 text-left text-[9px] transition ${goster && dogru ? "bg-emerald-500/15 text-emerald-200" : goster && secim === sec ? "bg-red-500/15 text-red-200" : "bg-white/[.04] text-white/60 hover:bg-white/[.08]"}`}>
                        <span>{sec}</span>
                        {goster && dogru && <Check size={11} />}
                        {goster && secim === sec && !dogru && <X size={11} />}
                      </button>
                    );
                  })}
                </div>
                {secim && (
                  <button type="button" onClick={sonrakiSoru}
                    className="w-full rounded-lg bg-white/10 py-1.5 text-[9px] font-bold text-white/75">
                    {soruIx + 1 >= sinav.length ? t("koSonuc") : t("koSonraki")}
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[8.5px] text-white/35">
            <BookOpen size={10} /> {KURAN_HARFLERI.length} {t("keHarf")}
          </p>
        </>
      )}
    </div>
  );
}
