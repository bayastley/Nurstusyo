// ════════════════════════════════════════════════════════
// SITEARAMAMODAL.TSX — Site geneli arama (Google'a ihtiyaç yok)
// Kullanıcı emri (24.11): "arama çubuğu koy ki sitemizi kullanan Google'a
// ihtiyaç duymasın". Arama tamamen cihazda: istek yok, internet gerekmez.
// ════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, CornerDownLeft, WifiOff } from "lucide-react";
import { translate, type Lang } from "../i18n";
import { ARAMA_GRUPLARI, grupSayilari, siteAra, type AramaGrup } from "../data/siteAramaIndeksi";

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: Lang;
}

const ONERILER = ["mehir", "teheccüd", "Bedir", "faiz", "hayız", "Âyete'l-Kürsî", "akika", "tövbe"];

/** Sorgu kelimelerini sonuç metninde işaretler (vurgu). */
function Vurgulu({ metin, sorgu, sinir = 320 }: { metin: string; sorgu: string; sinir?: number }) {
  const kelimeler = sorgu.trim().split(/\s+/).filter((k) => k.length > 1);
  let kesik = metin;
  const ilk = kelimeler.length ? metin.toLocaleLowerCase("tr").indexOf(kelimeler[0].toLocaleLowerCase("tr")) : -1;
  if (ilk > sinir - 60) {
    const bas = Math.max(0, ilk - 80);
    kesik = `…${metin.slice(bas, bas + sinir)}`;
  } else if (metin.length > sinir) {
    kesik = `${metin.slice(0, sinir)}…`;
  }
  if (!kelimeler.length) return <>{kesik}</>;
  const desen = new RegExp(`(${kelimeler.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parcalar = kesik.split(desen);
  const kucuk = new Set(kelimeler.map((k) => k.toLocaleLowerCase("tr")));
  return (
    <>
      {parcalar.map((p, i) =>
        kucuk.has(p.toLocaleLowerCase("tr"))
          ? <mark key={i} className="rounded bg-amber-400/25 px-0.5 text-amber-100">{p}</mark>
          : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </>
  );
}

export const SiteAramaModal: React.FC<Props> = ({ open, onClose, lang = "tr" }) => {
  const [sorgu, setSorgu] = useState("");
  const [grup, setGrup] = useState<AramaGrup | "tumu">("tumu");
  const [acikId, setAcikId] = useState<string | null>(null);
  const girisRef = useRef<HTMLInputElement>(null);

  const sayilar = useMemo(() => (open ? grupSayilari() : {}), [open]);
  const sonuclar = useMemo(() => siteAra(sorgu, grup), [sorgu, grup]);

  useEffect(() => {
    if (!open) return;
    setAcikId(null);
    const zaman = window.setTimeout(() => girisRef.current?.focus(), 60);
    const tus = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", tus);
    return () => { window.clearTimeout(zaman); window.removeEventListener("keydown", tus); };
  }, [open, onClose]);

  if (!open) return null;
  const t = (k: string) => translate(lang, k);

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center bg-black/80 p-3 pt-[6vh] backdrop-blur-md" onMouseDown={onClose}>
      <div
        className="glass modal-in flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Arama kutusu */}
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <Search size={16} style={{ color: "var(--accent)" }} />
          <input
            ref={girisRef}
            value={sorgu}
            onChange={(e) => { setSorgu(e.target.value); setAcikId(null); }}
            placeholder={t("araYer")}
            aria-label={t("araBaslik")}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
          />
          {sorgu && (
            <button type="button" onClick={() => setSorgu("")} className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white/80" aria-label="Temizle">
              <X size={14} />
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white/80" aria-label="Kapat">
            <X size={16} />
          </button>
        </div>

        {/* Kapsam notu — dürüstlük: cihazda, internetsiz */}
        <div className="flex items-center gap-1.5 border-b border-white/[.06] px-3 py-1.5 text-[8.5px] text-white/35">
          <WifiOff size={9} /> {t("araCihaz")}
          <span className="ml-auto tabular-nums">{sorgu.trim().length >= 2 ? t("araSonuc").replace("{n}", String(sonuclar.length)) : `${sayilar.tumu ?? 0} kayıt`}</span>
        </div>

        {/* Grup filtreleri */}
        <div className="flex flex-wrap gap-1 border-b border-white/[.06] px-3 py-1.5">
          {[{ id: "tumu" as const, ad: t("araTumu"), emoji: "🔎" }, ...ARAMA_GRUPLARI].map((g) => {
            const adet = sayilar[g.id] ?? 0;
            if (g.id !== "tumu" && adet === 0) return null;
            const secili = grup === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => { setGrup(g.id); setAcikId(null); }}
                className={`rounded-full border px-2 py-0.5 text-[8.5px] font-bold transition ${
                  secili ? "border-white/25 bg-white/[.1] text-white" : "border-white/10 bg-white/[.03] text-white/45 hover:text-white/75"
                }`}
              >
                {g.emoji} {g.ad} <span className="tabular-nums text-white/30">{adet}</span>
              </button>
            );
          })}
        </div>

        {/* Sonuçlar */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {sorgu.trim().length < 2 ? (
            <div className="px-2 py-4">
              <p className="text-[10px] font-bold text-white/55">{t("araIpucu")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ONERILER.map((o) => (
                  <button key={o} type="button" onClick={() => setSorgu(o)}
                    className="rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-[9px] font-bold text-white/60 hover:bg-white/[.09] hover:text-white">
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ) : sonuclar.length === 0 ? (
            <p className="px-2 py-6 text-center text-[10.5px] text-white/45">{t("araYok")}</p>
          ) : (
            sonuclar.map(({ kayit }) => {
              const acik = acikId === kayit.id;
              return (
                <button
                  key={kayit.id}
                  type="button"
                  onClick={() => setAcikId(acik ? null : kayit.id)}
                  className="mb-1 block w-full rounded-xl border border-white/[.07] bg-white/[.02] p-2.5 text-left transition hover:border-white/15 hover:bg-white/[.05]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">{kayit.emoji}</span>
                    <span className="rounded-full bg-white/[.07] px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wide text-white/45">{kayit.kaynak}</span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-white/90"><Vurgulu metin={kayit.baslik} sorgu={sorgu} sinir={999} /></span>
                    {acik && <CornerDownLeft size={10} className="text-white/25" />}
                  </div>
                  <p className={`mt-1 text-[9.5px] leading-relaxed text-white/55 ${acik ? "" : "line-clamp-2"}`}>
                    <Vurgulu metin={kayit.metin} sorgu={sorgu} sinir={acik ? 4000 : 260} />
                  </p>
                  {acik && kayit.ek && <p className="mt-1 text-[8px] font-bold text-emerald-300/70">{kayit.ek}</p>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
