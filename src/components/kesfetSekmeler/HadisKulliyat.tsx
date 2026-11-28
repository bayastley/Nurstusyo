import React from "react";
import { ChevronDown, Download, Search } from "lucide-react";
import type { Lang } from "../../i18n";
import {
  KULLIYATLAR,
  KULLIYAT_TOPLAM,
  kulliyatGetir,
  kulliyatOnbellekte,
  kitapAdi,
  hadisBaglantisi,
  type KulliyatVeri,
  type KulliyatTanimi,
} from "../../data/hadisKulliyat";
import { harfSadelestir, kategoriEslesiyor } from "../../data/hadisArama";

// ═══════════════════════════════════════════════════════════════
// HADİS KÜLLİYATI — gerçek metinler (Sünnetimiz + açık CDN)
// ★ 27.11 (kullanıcı emri): "arapça kalsın, altta da dil seçimine göre
//   çevirisi olsun" → kartta ÜSTTE Arapça metin (sabit, RTL), ALTINDA
//   seçili dilin çevirisi. Çeviri yoksa yalnız Arapça görünür; uydurma yok.
//   Panel açılır açılmaz Buhârî kendiliğinden iner.
// ═══════════════════════════════════════════════════════════════

const SAYFA_ADIM = 30;

export function HadisKulliyat({ tt, dil }: { tt: (k: string) => string; dil: Lang }) {
  // ★ Kullanıcı "hepsini bağla" dedi: panel kapalı başlamaz, açık gelir.
  const [acik, setAcik] = React.useState(true);
  // ★ "buhari içini doldur": ilk külliyat varsayılan seçili → içi kendiliğinden dolar.
  const [secili, setSecili] = React.useState<KulliyatTanimi | null>(KULLIYATLAR[0] ?? null);
  const [veri, setVeri] = React.useState<KulliyatVeri | null>(null);
  const [yukleniyor, setYukleniyor] = React.useState(false);
  const [yuzde, setYuzde] = React.useState<number | null>(null);
  const [hata, setHata] = React.useState("");
  const [arama, setArama] = React.useState("");
  const [kitap, setKitap] = React.useState(0);
  // ★ 28.11 (kullanıcı emri: "yüzlerce konu var") — külliyatın kendi konu
  //   başlıkları (kitap/bâb adları) aranabilir pil olarak listelenir.
  const [konuAra, setKonuAra] = React.useState("");
  const [konuLimit, setKonuLimit] = React.useState(24);
  const [adet, setAdet] = React.useState(SAYFA_ADIM);
  /** Cihazda (IndexedDB) hazır külliyatlar — düğmede ✓ rozeti */
  const [cihazda, setCihazda] = React.useState<Record<string, boolean>>({});
  /** Seçili külliyat — dil değişince aynı külliyatı yeni dilde yüklemek için */
  const seciliRef = React.useRef<KulliyatTanimi | null>(KULLIYATLAR[0] ?? null);

  const getir = React.useCallback(
    async (tanim: KulliyatTanimi) => {
      seciliRef.current = tanim;
      setSecili(tanim);
      setHata("");
      setVeri(null);
      setArama("");
      setKitap(0);
      setKonuAra("");
      setKonuLimit(24);
      setAdet(SAYFA_ADIM);
      setYukleniyor(true);
      setYuzde(null);
      try {
        const v = await kulliyatGetir(tanim.slug, dil, setYuzde);
        setVeri(v);
        setCihazda((o) => ({ ...o, [tanim.slug]: true }));
      } catch {
        setHata(tt("ksKulliyatHata"));
      } finally {
        setYukleniyor(false);
        setYuzde(null);
      }
    },
    [tt, dil],
  );

  // Cihaz durumlarını oku (rozetler için) — dil değişince çeviri de aranır
  React.useEffect(() => {
    let iptal = false;
    void Promise.all(KULLIYATLAR.map(async (k) => [k.slug, await kulliyatOnbellekte(k.slug, dil)] as const)).then(
      (satirlar) => {
        if (iptal) return;
        const harita: Record<string, boolean> = {};
        for (const [slug, varMi] of satirlar) harita[slug] = varMi;
        setCihazda(harita);
      },
    );
    return () => {
      iptal = true;
    };
  }, [dil]);

  // ★ Panel açılınca (ve dil değişince) seçili külliyat kendiliğinden gelir.
  React.useEffect(() => {
    const hedef = seciliRef.current ?? KULLIYATLAR[0];
    if (!hedef) return;
    let iptal = false;
    setYukleniyor(true);
    setYuzde(null);
    setHata("");
    void (async () => {
      try {
        const v = await kulliyatGetir(hedef.slug, dil, (y) => {
          if (!iptal) setYuzde(y);
        });
        if (iptal) return;
        setVeri(v);
        setCihazda((o) => ({ ...o, [hedef.slug]: true }));
      } catch {
        if (!iptal) setHata(tt("ksKulliyatHata"));
      } finally {
        if (!iptal) {
          setYukleniyor(false);
          setYuzde(null);
        }
      }
    })();
    return () => {
      iptal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dil]);

  const suzulmus = React.useMemo(() => {
    if (!veri) return [];
    const q = arama.trim().toLocaleLowerCase("tr");
    return veri.hadisler.filter((h) => {
      if (kitap && h.kitap !== kitap) return false;
      if (q.length < 2) return true;
      // ★ Arapça asıl metin + seçili dildeki çeviri birlikte aranır
      return `${h.ar} ${h.ceviri}`.toLocaleLowerCase("tr").includes(q);
    });
  }, [veri, arama, kitap]);

  // ★ Konu pilleri: yüklenen kitabın gerçek bölüm adları + her birindeki rivayet sayısı
  const konuSorgu = harfSadelestir(konuAra);
  const kitapSayilari = React.useMemo(() => {
    const harita: Record<number, number> = {};
    for (const h of veri?.hadisler ?? []) harita[h.kitap] = (harita[h.kitap] ?? 0) + 1;
    return harita;
  }, [veri]);
  const gorunenKitaplar = React.useMemo(
    () => (veri?.kitaplar ?? []).filter((k) => kategoriEslesiyor(k.ad, konuSorgu)),
    [veri, konuSorgu],
  );
  const gorunenKitapDilimi = gorunenKitaplar.slice(0, konuLimit);

  const gosterilen = suzulmus.slice(0, adet);
  const toplamYazi = KULLIYAT_TOPLAM.toLocaleString("tr-TR");

  return (
    <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-500/[.04] p-3">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        className="flex w-full items-center gap-1.5 text-left"
      >
        <span className="text-[11px] font-black text-sky-200/90">📚 {tt("ksKulliyatBaslik")}</span>
        <span className="ml-auto flex items-center gap-1 text-[8.5px] font-bold text-sky-200/60">
          {acik ? tt("ksHadisKapat") : tt("ksKulliyatAc")}
          <ChevronDown size={10} className={acik ? "rotate-180 transition" : "transition"} />
        </span>
      </button>

      {acik && (
        <>
          <p className="mt-1.5 text-[8.5px] leading-snug text-white/45">{tt("ksKulliyatAlt")}</p>
          {/* ★ "sitede hepsi var desinler": toplam sayaç her zaman görünür */}
          <p className="mt-1.5 rounded-lg bg-sky-400/10 px-2 py-1 text-[8.5px] font-bold text-sky-100/80">
            ✅ {tt("ksKulliyatOzet")}: {KULLIYATLAR.length} {tt("ksKulliyatKitapSayisi")} · {toplamYazi}{" "}
            {tt("ksKulliyatRivayet")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KULLIYATLAR.map((k) => (
              <button
                key={k.slug}
                type="button"
                onClick={() => void getir(k)}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${
                  secili?.slug === k.slug ? "text-black" : "glass-soft text-white/55 hover:text-white"
                }`}
                style={secili?.slug === k.slug ? { background: "linear-gradient(135deg,#7dd3fc,#0ea5e9)" } : undefined}
              >
                {k.emoji} {k.ad}
                <span className="ml-1 text-[7.5px] opacity-70">{k.adet}</span>
                {cihazda[k.slug] && (
                  <span className="ml-1 text-[7.5px] font-black" title={tt("ksKulliyatCihazda")}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          {yukleniyor && (
            <p className="mt-2 text-[9.5px] text-sky-200/80">
              {tt("ksKulliyatYukleniyor")} {secili ? `· ${secili.ad} (~${secili.mb} MB)` : ""}
              {yuzde !== null ? ` · %${yuzde}` : ""}
            </p>
          )}

          {hata && !yukleniyor && (
            <div className="mt-2 rounded-lg border border-rose-400/25 bg-rose-500/10 px-2 py-1.5">
              <p className="text-[9.5px] text-rose-100/90">{hata}</p>
              {secili && (
                <button
                  type="button"
                  onClick={() => void getir(secili)}
                  className="mt-1 text-[8.5px] font-bold text-rose-200/80 underline"
                >
                  {tt("ksKulliyatTekrar")}
                </button>
              )}
            </div>
          )}

          {veri && !yukleniyor && (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-white/[.06] px-2 py-0.5 text-[8.5px] font-bold text-white/60">
                  {veri.ad} · {veri.hadisler.length} {tt("ksSonuc")}
                </span>
                <label className="flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5">
                  <Search size={9} className="text-white/40" />
                  <input
                    value={arama}
                    onChange={(e) => { setArama(e.target.value); setAdet(SAYFA_ADIM); }}
                    placeholder={tt("ksKulliyatAra")}
                    className="w-[110px] bg-transparent text-[9px] text-white/80 outline-none placeholder:text-white/30"
                  />
                </label>
              </div>

              {/* ★ 28.11 (kullanıcı emri): "yüzlerce konu var" — külliyatın gerçek
                  konu başlıkları pil olarak; yazım hatası tolere edilir. */}
              <div className="mt-2 rounded-lg border border-white/[.08] bg-black/20 p-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[8.5px] font-black uppercase tracking-wide text-sky-200/60">
                    🗂️ {veri.kitaplar.length} {tt("ksKonuSayisi")}
                  </span>
                  <label className="ml-auto flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5">
                    <Search size={9} className="text-white/40" />
                    <input
                      value={konuAra}
                      onChange={(e) => { setKonuAra(e.target.value); setKonuLimit(24); }}
                      placeholder={tt("ksKonuAra")}
                      aria-label={tt("ksKonuAra")}
                      className="w-[120px] bg-transparent text-[9px] text-white/80 outline-none placeholder:text-white/30"
                    />
                  </label>
                </div>
                <div className="mt-1.5 flex max-h-[128px] flex-wrap gap-1 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => { setKitap(0); setAdet(SAYFA_ADIM); }}
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${kitap === 0 ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                    style={kitap === 0 ? { background: "linear-gradient(135deg,#7dd3fc,#0ea5e9)" } : undefined}
                  >
                    ✦ {tt("ksKulliyatTumu")}
                  </button>
                  {gorunenKitapDilimi.map((k) => (
                    <button
                      key={k.no}
                      type="button"
                      onClick={() => { setKitap(k.no); setAdet(SAYFA_ADIM); }}
                      title={`${k.ad} · ${kitapSayilari[k.no] ?? 0}`}
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${kitap === k.no ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                      style={kitap === k.no ? { background: "linear-gradient(135deg,#7dd3fc,#0ea5e9)" } : undefined}
                    >
                      {k.ad}
                      <span className="ml-1 text-[7.5px] opacity-70">{kitapSayilari[k.no] ?? 0}</span>
                    </button>
                  ))}
                </div>
                {gorunenKitaplar.length > gorunenKitapDilimi.length && (
                  <button
                    type="button"
                    onClick={() => setKonuLimit((l) => l + 60)}
                    className="mt-1.5 text-[8.5px] font-bold text-sky-200/70 underline"
                  >
                    +{gorunenKitaplar.length - gorunenKitapDilimi.length} {tt("ksKonuSayisi")}
                  </button>
                )}
                {gorunenKitaplar.length === 0 && (
                  <p className="mt-1.5 text-[9px] text-white/40">{tt("ksKonuYok")}</p>
                )}
              </div>

              <div className="mt-2 space-y-1.5">
                {gosterilen.map((h) => {
                  const kAd = kitapAdi(veri, h.kitap);
                  return (
                    <div key={`${h.kitap}-${h.no}`} className="rounded-lg border border-white/10 bg-black/25 p-2.5">
                      {/* ★ ARAPÇA METİN — her zaman sabit, asıl rivayet */}
                      <p
                        dir="rtl"
                        lang="ar"
                        className="text-right font-arabic text-[12.5px] leading-loose text-white/90"
                      >
                        {h.ar}
                      </p>
                      {/* ★ ALTINDA: seçili dilin çevirisi (yoksa gösterilmez) */}
                      {dil !== "ar" && h.ceviri && (
                        <p className="mt-1.5 border-t border-white/10 pt-1.5 text-[10.5px] leading-relaxed text-white/65">
                          <span className="mr-1 text-[7.5px] font-black uppercase tracking-widest text-sky-200/50">
                            {tt("ksKulliyatCeviri")}
                          </span>
                          {h.ceviri}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[8.5px] font-bold text-sky-200/75">
                          {veri.ad} · {h.no}
                          {kAd ? ` · ${kAd}` : ""}
                        </span>
                        <a
                          href={hadisBaglantisi(veri.slug, h.no)}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-[8px] font-bold text-sky-300/70 underline"
                        >
                          {tt("ksKulliyatKaynak")} →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {suzulmus.length > gosterilen.length && (
                <button
                  type="button"
                  onClick={() => setAdet((a) => a + SAYFA_ADIM)}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-sky-400/25 bg-sky-500/10 py-1.5 text-[9.5px] font-bold text-sky-100/80"
                >
                  <Download size={10} /> {tt("ksKulliyatDahaFazla")} ({suzulmus.length - gosterilen.length})
                </button>
              )}
              {suzulmus.length === 0 && (
                <p className="mt-2 text-[9.5px] text-white/40">{tt("ksKulliyatBos")}</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
