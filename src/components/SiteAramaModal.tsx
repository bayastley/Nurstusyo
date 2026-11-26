// ════════════════════════════════════════════════════════
// SITEARAMAMODAL.TSX — Site geneli arama (Google'a ihtiyaç yok)
// Kullanıcı emri (24.11): "arama çubuğu koy ki sitemizi kullanan Google'a
// ihtiyaç duymasın". Arama tamamen cihazda: istek yok, internet gerekmez.
// ════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, CornerDownLeft, WifiOff } from "lucide-react";
import { translate, type Lang } from "../i18n";
import { ARAMA_GRUPLARI, grupSayilari, siteAra, type AramaGrup } from "../data/siteAramaIndeksi";
import { soruKartiBul } from "../data/hadisSoruKartlari";

interface Props {
  open: boolean;
  onClose: () => void;
  lang?: Lang;
}

const ONERILER = ["mehir", "teheccüd", "Bedir", "faiz", "hayız", "Âyete'l-Kürsî", "akika", "tövbe"];

/** Çevrimiçi hadis külliyatı sonucu — /api/hadis/ara (Sünnetimiz · dorar.net · sunnah.com) */
interface CevrimiciHadis {
  metin: string;
  kaynak: string;
  derece: string;
  kitap: string;
  dil: string;
  url?: string;
  ref?: string;
  bab?: string;
  kitab?: string;
  dereceEtiket?: string;
}

/** Külliyat sayfası — tek istekte 1000 rivayet, "daha fazla" ile sonraki 1000'e inilir. */
const HADIS_SAYFA_ADEDI = 1000;

// ★ 26.11: derece rozetleri — sahih / hasan / zayıf / bilinmiyor
const DERECE_SINIF: Record<string, string> = {
  sahih: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  hasan: "border-teal-400/40 bg-teal-500/15 text-teal-200",
  zayif: "border-red-400/40 bg-red-500/15 text-red-200",
  bilinmiyor: "border-white/20 bg-white/[.07] text-white/55",
};

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
  // ★ 26.11 SORU KARTI: "altın haram mı" gibi sorularda hadis + hikâye + dipnot
  const kart = useMemo(() => soruKartiBul(sorgu), [sorgu]);

  // ★ 26.11 ÇEVRİMİÇİ HADİS: sorgu 3+ harfse külliyattan da ara (Buhârî, Müslim, Tirmizî…)
  const [hadisler, setHadisler] = useState<CevrimiciHadis[]>([]);
  const [hadisDurum, setHadisDurum] = useState<"bos" | "yuk" | "ok" | "hata">("bos");
  const [hadisSayfa, setHadisSayfa] = useState(1);
  const [hadisHasMore, setHadisHasMore] = useState(false);
  const [hadisDahaYuk, setHadisDahaYuk] = useState(false);
  // ★ 26.11: karta tıklayınca altında rivayetin hikâyesi/nasıl söylendiği açılır.
  const [acikHadis, setAcikHadis] = useState<string | null>(null);
  const hadisOnbellek = useRef(new Map<string, { liste: CevrimiciHadis[]; hasMore: boolean }>());

  useEffect(() => {
    const q = sorgu.trim();
    setHadisSayfa(1);
    setHadisHasMore(false);
    setAcikHadis(null);
    if (!open || q.length < 3) { setHadisler([]); setHadisDurum("bos"); return; }
    const anahtar = q.toLocaleLowerCase("tr");
    const hazir = hadisOnbellek.current.get(anahtar);
    if (hazir) { setHadisler(hazir.liste); setHadisHasMore(hazir.hasMore); setHadisDurum(hazir.liste.length ? "ok" : "bos"); return; }
    const kontrol = new AbortController();
    setHadisDurum("yuk");
    const zaman = window.setTimeout(async () => {
      try {
        const r = await fetch(`/api/hadis/ara?q=${encodeURIComponent(q)}&sayfa=1&adet=${HADIS_SAYFA_ADEDI}`, { signal: kontrol.signal });
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as { sonuclar?: CevrimiciHadis[]; hasMore?: boolean };
        const liste = d.sonuclar ?? [];
        const hasMore = Boolean(d.hasMore);
        hadisOnbellek.current.set(anahtar, { liste, hasMore });
        setHadisler(liste);
        setHadisHasMore(hasMore);
        setHadisDurum(liste.length ? "ok" : "bos");
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setHadisler([]);
        setHadisDurum("hata");
      }
    }, 450);
    return () => { window.clearTimeout(zaman); kontrol.abort(); };
  }, [sorgu, open]);

  // "Daha fazla" — aynı sorgunun sonraki külliyat sayfasını ekler (binlerce rivayet).
  const hadisDahaFazla = async () => {
    const q = sorgu.trim();
    if (!q || hadisDahaYuk) return;
    const sonraki = hadisSayfa + 1;
    setHadisDahaYuk(true);
    try {
      const r = await fetch(`/api/hadis/ara?q=${encodeURIComponent(q)}&sayfa=${sonraki}&adet=${HADIS_SAYFA_ADEDI}`);
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { sonuclar?: CevrimiciHadis[]; hasMore?: boolean };
      const gelen = d.sonuclar ?? [];
      setHadisler((eski) => {
        const anahtar = (h: CevrimiciHadis) => h.url || h.ref || h.metin.slice(0, 80);
        const gorulen = new Set(eski.map(anahtar));
        return [...eski, ...gelen.filter((h) => !gorulen.has(anahtar(h)))];
      });
      setHadisSayfa(sonraki);
      setHadisHasMore(Boolean(d.hasMore));
      setHadisDurum("ok");
    } catch {
      setHadisHasMore(false);
    } finally {
      setHadisDahaYuk(false);
    }
  };

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
          <WifiOff size={9} /> {t("araCihaz")} · {t("araCokDil")} · {t("araHadisCevrimici")}
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
          {/* ★ 26.11 SORU KARTI — hadis + hikâyesi + dipnot */}
          {kart && (
            <div className="mb-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/[.06] p-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-300/80">{t("araKartBaslik")}</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wide ${DERECE_SINIF[kart.derece in DERECE_SINIF ? kart.derece : "bilinmiyor"]}`}>
                  {t(`araDerece_${kart.derece in DERECE_SINIF ? kart.derece : "bilinmiyor"}`)}
                </span>
                <span className="ml-auto rounded-full bg-white/[.07] px-1.5 py-0.5 text-[7.5px] font-bold text-white/50">{kart.kitap}</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/90">{kart.hadis}</p>
              <p className="mt-1 text-[8.5px] font-bold text-emerald-300/60">{kart.kaynak}</p>
              <div className="mt-2 rounded-lg border border-white/10 bg-black/25 p-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{t("araKartHikaye")}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-white/70">{kart.hikaye}</p>
              </div>
              <div className="mt-1.5 rounded-lg border border-amber-400/20 bg-amber-500/[.07] p-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-200/70">{t("araKartDipnot")}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-amber-100/80">{kart.dipnot}</p>
              </div>
              <a href={kart.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block text-[8.5px] font-bold text-emerald-300/70 underline">{t("araKartAc")}</a>
            </div>
          )}
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

          {/* ★ 26.11 ÇEVRİMİÇİ HADİS KÜLLİYATI — Buhârî, Müslim, Tirmizî… dereceli */}
          {sorgu.trim().length >= 3 && (
            <div className="mt-2 border-t border-white/[.07] px-1 pt-2">
              <div className="flex flex-wrap items-baseline gap-1.5 px-1">
                <p className="text-[8.5px] font-black uppercase tracking-widest text-emerald-300/70">
                  {t("araHadisBaslik")}
                </p>
                <span className="ml-auto rounded-full bg-white/[.06] px-1.5 py-0.5 text-[7.5px] font-bold tabular-nums text-white/40">
                  {hadisler.length > 0 ? t("araHadisSayi").replace("{n}", String(hadisler.length)) : t("araHadisToplam")}
                </span>
              </div>
              {hadisDurum === "yuk" && <p className="px-1 py-2 text-[9.5px] text-white/40">{t("araHadisAraniyor")}</p>}
              {hadisDurum === "hata" && <p className="px-1 py-2 text-[9.5px] text-amber-200/70">{t("araHadisKapali")}</p>}
              {hadisDurum === "bos" && <p className="px-1 py-2 text-[9.5px] text-white/40">{t("araHadisYok")}</p>}
              {hadisler.map((h, i) => {
                const derece = h.derece in DERECE_SINIF ? h.derece : "bilinmiyor";
                const anahtar = h.url || h.ref || h.metin.slice(0, 60);
                const acik = acikHadis === anahtar;
                return (
                  // [content-visibility:auto] — 1000 kartta da kaydırma akıcı kalsın (görünmeyen kart çizilmez).
                  <div
                    key={`${h.kitap}-${i}-${anahtar}`}
                    className={`mb-1 w-full overflow-hidden rounded-xl border text-left transition [content-visibility:auto] [contain-intrinsic-size:auto_110px] ${
                      acik ? "border-emerald-400/25 bg-emerald-500/[.05]" : "border-white/[.07] bg-white/[.02] hover:border-white/15 hover:bg-white/[.05]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setAcikHadis(acik ? null : anahtar)}
                      aria-expanded={acik}
                      className="block w-full p-2.5 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`rounded-full border px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wide ${DERECE_SINIF[derece]}`}>
                          {t(`araDerece_${derece}`)}
                        </span>
                        <span className="rounded-full bg-white/[.07] px-1.5 py-0.5 text-[7.5px] font-bold text-white/45">{h.kitap}</span>
                        <span className="ml-auto text-[7.5px] font-bold text-white/25">{acik ? t("araHadisKapat") : t("araHadisHikaye")}</span>
                      </div>
                      <p className="mt-1 text-[9.5px] leading-relaxed text-white/70" dir={h.dil === "ar" ? "rtl" : undefined}>
                        <Vurgulu metin={h.metin} sorgu={sorgu} sinir={acik ? 4000 : 280} />
                      </p>
                      <p className="mt-0.5 text-[8px] font-bold text-emerald-300/50">{h.kaynak}</p>
                    </button>
                    {/* ★ 26.11 HİKÂYESİ: hadis nasıl söylendi — kaynağın kendi kitâb/bâb başlığı,
                        dereceyi veren merci ve rivayetin senediyle tam metni. Uydurma yok. */}
                    {acik && (
                      <div className="border-t border-emerald-400/15 bg-black/20 p-2.5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-300/70">{t("araHadisHikaye")}</p>
                        <p className="mt-0.5 text-[9px] leading-relaxed text-white/55">{t("araHadisHikayeNot")}</p>
                        <dl className="mt-1.5 space-y-0.5">
                          {h.kitab && (
                            <div className="flex gap-1 text-[8.5px] leading-relaxed">
                              <dt className="shrink-0 font-black uppercase tracking-wide text-white/35">{t("araHadisKitab")}:</dt>
                              <dd className="text-white/65">{h.kitab}</dd>
                            </div>
                          )}
                          {h.bab && (
                            <div className="flex gap-1 text-[8.5px] leading-relaxed">
                              <dt className="shrink-0 font-black uppercase tracking-wide text-white/35">{t("araHadisBaglam")}:</dt>
                              <dd className="text-white/65">{h.bab}</dd>
                            </div>
                          )}
                          {h.dereceEtiket && (
                            <div className="flex gap-1 text-[8.5px] leading-relaxed">
                              <dt className="shrink-0 font-black uppercase tracking-wide text-white/35">{t("araHadisDereceNot")}:</dt>
                              <dd className="text-white/65">{h.dereceEtiket}</dd>
                            </div>
                          )}
                        </dl>
                        <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-white/35">{t("araHadisTamMetin")}</p>
                        <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/80" dir={h.dil === "ar" ? "rtl" : undefined}>
                          {h.metin}
                        </p>
                        {h.url && (
                          <a
                            href={h.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-block text-[8.5px] font-bold text-emerald-300/70 underline"
                          >
                            {t("araKartAc")}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {hadisHasMore && (
                <button
                  type="button"
                  onClick={hadisDahaFazla}
                  disabled={hadisDahaYuk}
                  className="mt-1 w-full rounded-xl border border-emerald-400/25 bg-emerald-500/[.08] py-1.5 text-[9px] font-black text-emerald-200/80 transition hover:bg-emerald-500/[.15] disabled:opacity-50"
                >
                  {hadisDahaYuk ? t("araHadisAraniyor") : t("araHadisDaha")}
                </button>
              )}
              <p className="px-1 pb-1 pt-0.5 text-[7.5px] text-white/25">{t("araHadisKaynakNot")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
