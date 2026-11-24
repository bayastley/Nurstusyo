import React from "react";
import { BookmarkCheck, BookmarkPlus, ChevronDown, GitCompare, Trash2 } from "lucide-react";
import type { Lang } from "../i18n";
import { useIcerikCeviri } from "../hooks/useIcerikCeviri";
import { BENZER_KAYNAK_NOTU, BENZER_KUMELER, BENZER_TOPLAM } from "../data/benzerAyetler";

// ════════════════════════════════════════════════════════
// BENZERAYETLERBOLUMU.TSX — Benzer Ayetler (madde 44)
// Ayetleri yan yana gösterir, farkı not eder, çalışma listesine ekler.
// Liste cihazda tutulur: localStorage "nur_benzer_ayet_v1"
// ════════════════════════════════════════════════════════

const KEY = "nur_benzer_ayet_v1";

function listeOku(): string[] {
  try {
    const ham: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(ham) ? ham.filter((x): x is string => typeof x === "string") : [];
  } catch (hata) {
    console.warn("Benzer ayet listesi okunamadı:", hata);
    return [];
  }
}

function listeYaz(liste: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(liste));
  } catch (hata) {
    console.warn("Benzer ayet listesi yazılamadı:", hata);
  }
}

export function BenzerAyetlerBolumu({ tt, lang = "tr" }: { tt?: (k: string) => string; lang?: Lang }) {
  const t = tt ?? ((k: string) => k);
  const [acik, setAcik] = React.useState<string | null>(BENZER_KUMELER[0]?.id ?? null);
  const [liste, setListe] = React.useState<string[]>(() => listeOku());
  const [sadeceListe, setSadeceListe] = React.useState(false);

  const metinler = React.useMemo(() => {
    const l: string[] = [BENZER_KAYNAK_NOTU];
    BENZER_KUMELER.forEach((k) => l.push(k.baslik, k.not, ...k.ayetler.map((a) => a.meal)));
    return l;
  }, []);
  const { aktif, cevir } = useIcerikCeviri(metinler, lang);
  const g = (m: string) => (aktif ? cevir(m) : m);

  const degistir = (id: string) => {
    const yeni = liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id];
    setListe(yeni);
    listeYaz(yeni);
  };

  const gorunen = sadeceListe ? BENZER_KUMELER.filter((k) => liste.includes(k.id)) : BENZER_KUMELER;

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[.03] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] font-black text-white/80">
          <GitCompare size={12} /> {t("htBenzer")} · {BENZER_TOPLAM}
        </p>
        <button
          type="button"
          onClick={() => setSadeceListe((v) => !v)}
          className={`rounded-md px-2 py-1 text-[8px] font-bold transition ${sadeceListe ? "bg-white/15 text-white" : "bg-white/5 text-white/50 hover:text-white/80"}`}
        >
          {t("htBenzerListe")} ({liste.length})
        </button>
      </div>
      <p className="text-[8.5px] leading-relaxed text-white/40">{g(BENZER_KAYNAK_NOTU)}</p>

      {gorunen.length === 0 && <p className="py-3 text-center text-[9px] text-white/40">{t("htBenzerBos")}</p>}

      <div className="space-y-1.5">
        {gorunen.map((k) => {
          const acikMi = acik === k.id;
          const kayitli = liste.includes(k.id);
          return (
            <div key={k.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[.03]">
              <div className="flex items-center">
                <button type="button" onClick={() => setAcik(acikMi ? null : k.id)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-2 text-left">
                  <span className="truncate text-[9.5px] font-bold text-white/80">{g(k.baslik)}</span>
                  <ChevronDown size={12} className={`shrink-0 text-white/35 transition ${acikMi ? "rotate-180" : ""}`} />
                </button>
                <button type="button" onClick={() => degistir(k.id)}
                  aria-label={kayitli ? t("htBenzerKaldir") : t("htBenzerEkle")}
                  className={`mr-1 shrink-0 rounded-md p-1.5 transition ${kayitli ? "text-emerald-300" : "text-white/35 hover:text-white/80"}`}>
                  {kayitli ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
                </button>
              </div>
              {acikMi && (
                <div className="space-y-1.5 border-t border-white/[.07] px-2.5 py-2">
                  {k.ayetler.map((a) => (
                    <div key={a.ref} className="rounded-lg bg-black/20 px-2 py-1.5">
                      <p className="text-[8px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{a.ref}</p>
                      <p className="my-1 text-right text-[15px] leading-relaxed text-white/90" dir="rtl">{a.ar}</p>
                      <p className="text-[9px] leading-relaxed text-white/55">{g(a.meal)}</p>
                    </div>
                  ))}
                  <p className="rounded-md bg-amber-500/[.08] px-2 py-1 text-[8.5px] leading-relaxed text-amber-200/85">
                    {g(k.not)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {liste.length > 0 && (
        <button type="button" onClick={() => { setListe([]); listeYaz([]); setSadeceListe(false); }}
          className="flex w-full items-center justify-center gap-1 rounded-md bg-white/5 py-1 text-[8px] font-bold text-white/45 transition hover:text-red-200">
          <Trash2 size={10} /> {t("htBenzerTemizle")}
        </button>
      )}
    </div>
  );
}
