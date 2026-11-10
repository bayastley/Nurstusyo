// ════════════════════════════════════════════════════════
// KESFET-MENKIBELER.TS (02.11, kullanıcı emri: "İslami menkıbeler olsun;
// üstte konu butonları olsun, en fazla 5 buton gözüksün ama içinde başka
// butonlar da olsun; hangisine tıklarsak hikâye aşağıda açılsın; geri veya
// X basınca kapansın") — Kâri Köşesi kasasından beslenen menkübe bölümü.
//   · üst şerit: ilk 5 kıssa konusu görünür + "Tümünü göster" expanded
//   · konu tıklandığında hikâye listenin ALTINDA açılır (aşağı doğru)
//   · detay içinde: geri (liste dön) + X (detayı kapat)
//   · her kıssa: hikâye + hikmet kutusu + kaynak satırı
//   · ★ 02.11: /api/kissalar ucuyla admin'in yayınladığı kıssalar da
//     HERKESE gösterilir; seçili dil (en/ar/id/ur) için çeviri alanı
//     varsa o dilin metni gösterilir, yoksa Türkçe gösterilir.
//   · ★ 04.11 (kullanıcı emri): 10'ar sayfalama — ilk sayfada 10 kıssa; ◀▶ ile
//     diğer sayfaya geçilir; KUMANDA üstte + altta; alttan geçişte liste anında
//     başa (ilk sıraya) döner
// ════════════════════════════════════════════════════════
import React from "react";
import { X, ChevronLeft, BookOpen, Lightbulb, Library } from "lucide-react";
import { MENKIBELER, type Menkibe } from "../data/menkibeler";

type TT = (k: string) => string;

/** Admin yayını kıssa — çeviri kolonlar: baslik_en/ar/id/ur, hikaye_…, hikmet_… */
type CozumAlanlar = Partial<{
  baslik_en: string; baslik_ar: string; baslik_id: string; baslik_ur: string;
  hikaye_en: string; hikaye_ar: string; hikaye_id: string; hikaye_ur: string;
  hikmet_en: string; hikmet_ar: string; hikmet_id: string; hikmet_ur: string;
}>;
type UzakKissa = Menkibe & CozumAlanlar;
type CozumAnahtar = "baslik_en" | "baslik_ar" | "baslik_id" | "baslik_ur" | "hikaye_en" | "hikaye_ar" | "hikaye_id" | "hikaye_ur" | "hikmet_en" | "hikmet_ar" | "hikmet_id" | "hikmet_ur";

/** Seçili oturum dili (tr/en/ar/id/ur) — localStorage'da durur */
function degistemDili(): string {
  try {
    const dil = (localStorage.getItem("nur_lang") || "tr").trim().toLowerCase();
    return ["ar", "en", "id", "ur"].includes(dil) ? dil : "tr";
  } catch { return "tr"; }
}

type DilMetinFn = (m: UzakKissa | undefined, alan: "baslik" | "hikaye" | "hikmet") => string;

function bolSayfalar(m: UzakKissa, dilMetin: DilMetinFn): string[] {
  const mevcut = (m as any).sayfalar as string[] | undefined;
  if (Array.isArray(mevcut) && mevcut.filter(Boolean).length > 0) return mevcut.filter(Boolean);
  const metin = [dilMetin(m, "hikaye"), "", dilMetin(m, "hikmet") ? `Hikmet: ${dilMetin(m, "hikmet")}` : "", m.kaynak ? `Kaynak: ${m.kaynak}` : ""].filter(Boolean).join("\n\n");
  const parcalar = metin.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const sayfalar: string[] = [];
  let buf = "";
  for (const p of parcalar.length ? parcalar : [metin]) {
    if (buf && (buf.length + p.length > 900)) { sayfalar.push(buf.trim()); buf = p; }
    else buf = buf ? `${buf}\n\n${p}` : p;
  }
  if (buf.trim()) sayfalar.push(buf.trim());
  return sayfalar.length ? sayfalar : [metin];
}

function MenkibeDetay({
  tt,
  secili,
  setSeciliId,
  dilMetin,
  onceki,
  sonraki,
}: {
  tt: TT;
  secili: UzakKissa;
  setSeciliId: (v: string | null) => void;
  dilMetin: DilMetinFn;
  onceki: (() => void) | null;
  sonraki: (() => void) | null;
}) {
  const [acik, setAcik] = React.useState(false);
  const [sayfaNo, setSayfaNo] = React.useState(0);
  const [yon, setYon] = React.useState<"ileri" | "geri">("ileri");
  const sayfalar = React.useMemo(() => bolSayfalar(secili, dilMetin), [secili, dilMetin]);
  const toplam = sayfalar.length;
  React.useEffect(() => {
    setAcik(false);
    setSayfaNo(0);
    setYon("ileri");
  }, [secili.id]);

  const baslik = dilMetin(secili, "baslik");
  const sayfayaGit = (hedef: number) => {
    const y = Math.max(0, Math.min(hedef, toplam - 1));
    if (y === sayfaNo) return;
    setYon(y > sayfaNo ? "ileri" : "geri");
    setSayfaNo(y);
  };

  return (
    <div data-minitur="menkibeler-detay" className="mt-1 nur-book-perspective">
      {!acik ? (
        <div className="nur-book-shell">
          <button
            type="button"
            onClick={() => setAcik(true)}
            className="nur-book-cover relative w-full overflow-hidden px-6 py-10 text-center"
            style={{ minHeight: 260 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/70">{secili.kategori}</p>
            <div className="mx-auto mt-4 mb-3 h-px w-20 bg-amber-200/30" />
            <h3 className="text-[20px] font-black leading-snug text-amber-50">{baslik}</h3>
            <p className="mt-3 text-[10px] font-semibold text-amber-100/55">{toplam} sayfa</p>
            <p className="mt-6 text-[10px] font-bold text-amber-100/60">Açmak için kapağa dokun</p>
          </button>
        </div>
      ) : (
        <div className="nur-book-shell">
          <div
            key={`${secili.id}-${sayfaNo}`}
            className={`nur-book-page p-4 sm:p-5 min-h-[360px] ${sayfaNo === 0 && yon === "ileri" ? "nur-book-open" : (yon === "ileri" ? "nur-page-turn-next" : "nur-page-turn-prev")}`}
            style={{ color: "#352512" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <button type="button" data-minitur="menkibeler-geri" onClick={() => setSeciliId(null)} className="flex items-center gap-1 rounded-lg border border-[#8c6428]/35 bg-[#f7efd8]/70 px-3 py-1 text-[10px] font-black text-[#5a3f1a] transition hover:bg-[#f1e4c5]">
                <ChevronLeft className="h-3 w-3" />
                {tt("mkGeri")}
              </button>
              <span className="text-[10px] font-black text-[#6b4a1e]/80">{sayfaNo + 1} / {toplam}</span>
              <button type="button" data-minitur="menkibeler-x" onClick={() => setSeciliId(null)} className="rounded-lg border border-[#8c6428]/35 bg-[#f7efd8]/70 p-1.5 text-[#5a3f1a] transition hover:bg-[#f1e4c5]">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {sayfaNo === 0 && (
              <>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#7a5520]">{secili.kategori}</span>
                <h3 className="mt-1 text-[18px] font-black text-[#2b1d0d]">{baslik}</h3>
                <div className="my-3 h-px bg-[#8c6428]/30" />
              </>
            )}
            <p className="whitespace-pre-line text-justify text-[13px] leading-[1.95]">{sayfalar[sayfaNo]}</p>
            {sayfaNo === toplam - 1 && (
              <>
                <div className="mt-4 rounded-xl border border-[#5f7a4a]/25 bg-[#eef5e6] p-3">
                  <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-[#355022]">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span><span className="font-black">{tt("mkHikmet")}</span> {dilMetin(secili, "hikmet")}</span>
                  </p>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[9.5px] font-bold text-[#6b4a1e]">
                  <Library className="h-3 w-3 shrink-0" />
                  <span>{tt("mkKaynak")}: {secili.kaynak}</span>
                </p>
              </>
            )}
            <div className="mt-4 flex items-center justify-between text-[10px] text-[#6b4a1e]/70">
              <span>{sayfaNo > 0 ? "◀ önceki sayfa" : (onceki ? "◀ önceki menkıbe" : "")}</span>
              <span>❦ {sayfaNo + 1}/{toplam}</span>
              <span>{sayfaNo < toplam - 1 ? "sonraki sayfa ▶" : (sonraki ? "sonraki menkıbe ▶" : "")}</span>
            </div>
            {(sayfaNo > 0 || onceki) && <button type="button" aria-label="Önceki" className="nur-page-click-zone left" onClick={() => sayfaNo > 0 ? sayfayaGit(sayfaNo - 1) : onceki?.()} />}
            {(sayfaNo < toplam - 1 || sonraki) && <button type="button" aria-label="Sonraki" className="nur-page-click-zone right" onClick={() => sayfaNo < toplam - 1 ? sayfayaGit(sayfaNo + 1) : sonraki?.()} />}
          </div>
        </div>
      )}
    </div>
  );
}

/** ★ 10'ar sayfalama boyutu (04.11, kullanıcı emri: "ilk 10 göster, sonra diğer sayfaya geç;
 *   kumanda hem altta hem üstte; alttaki butonla geçişte hemen yukarı, ilk sıraya dön") */
const SAYFA_BOYUTU = 10;

/** Sayfa kumandası — üstte ve altta aynı görünüm; ◀▶ ile sayfalar arası gez.*
 *  Etiket: mkSayfa ("Sayfa {p} / {t} · {n} kıssa"). */
function MenkibeKumanda({ tt, sayfa, toplam, nToplam, degistir }: { tt: TT; sayfa: number; toplam: number; nToplam: number; degistir: (yeni: number) => void }) {
  const okCls = "flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/[.04] text-[10px] font-black text-white/70 transition hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="flex items-center justify-center gap-2">
      <button type="button" data-minitur="menkibeler-sayfa-geri" className={okCls} onClick={() => degistir(sayfa - 1)} disabled={sayfa <= 0}>◀</button>
      <span className="min-w-24 text-center text-[9.5px] font-black tracking-wide text-white/55" data-minitur="menkibeler-sayfa-bilgi">
        {tt("mkSayfa").replace("{p}", String(sayfa + 1)).replace("{t}", String(toplam)).replace("{n}", String(nToplam))}
      </span>
      <button type="button" data-minitur="menkibeler-sayfa-ileri" className={okCls} onClick={() => degistir(sayfa + 1)} disabled={sayfa >= toplam - 1}>▶</button>
    </div>
  );
}

export function MenkibelerBolumu({ tt }: { tt: TT }) {
  const [seciliId, setSeciliId] = React.useState<string | null>(null);
  // ★ 04.11: sayfa durumu + başa dönme çapası (üst kumandanın kendisi)
  const [sayfaNo, setSayfaNo] = React.useState(0);
  const [yon, setYon] = React.useState("ileri");
  const listeUst = React.useRef<HTMLDivElement | null>(null);
  const [uzakKissalar, setUzakKissalar] = React.useState<UzakKissa[]>([]);
  /** ★ dil seçimi sabit tutulur — bileşen boyunca yeniden örnekleme gerekmez */
  const dilRef = React.useRef<string>(degistemDili());

  React.useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const r = await fetch("/api/kissalar");
        if (!r.ok) return;
        const data = await r.json() as { ok?: boolean; kissalar?: UzakKissa[] };
        if (!iptal && Array.isArray(data.kissalar) && data.kissalar.length > 0) {
          setUzakKissalar(data.kissalar);
        }
      } catch { /* kasa boş — statik kıssalar yeter */ }
    })();
    return () => { iptal = true; };
  }, []);

  /** Admin kıssaları önce, yerleşik kasadan sonra — herkes aynı listeyi görür */
  const tamKasa = React.useMemo(() => [...uzakKissalar, ...MENKIBELER], [uzakKissalar]);
  const secili: UzakKissa | undefined = tamKasa.find((m) => m.id === seciliId);

  /** seçili dilde çeviri varsa onu, yoksa Türkçeyi ver */
  const dilMetin = (m: UzakKissa | undefined, alan: "baslik" | "hikaye" | "hikmet"): string => {
    const dil = dilRef.current;
    if (!m) return "";
    if (dil !== "tr") {
      const anahtar = `${alan}_${dil}` as CozumAnahtar;
      const cozum = m[anahtar];
      if (cozum) return cozum;
    }
    return (m[alan] as string) || "";
  };

  const tamSayfa = Math.max(1, Math.ceil(tamKasa.length / SAYFA_BOYUTU));
  const guvenliSayfa = Math.min(sayfaNo, tamSayfa - 1);
  const gorunen = tamKasa.slice(guvenliSayfa * SAYFA_BOYUTU, guvenliSayfa * SAYFA_BOYUTU + SAYFA_BOYUTU);

  /** Sayfa değişimi (04.11): açık detayı kapat + listeyi hemen ilk sıraya döndür.
   *  scrollIntoView rAF içinde — yeni sayfanın kartları boyanmadan ölçmesin. */
  const sayfayaGec = (hedef: number) => {
    const yeni = Math.min(Math.max(0, hedef), tamSayfa - 1);
    if (yeni === guvenliSayfa) return;
    setYon(yeni > guvenliSayfa ? "ileri" : "geri");
    setSayfaNo(yeni);
    setSeciliId(null);
    requestAnimationFrame(() => {
      listeUst.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  return (
    <div className="space-y-3" data-minitur="menkibeler-bolumu">
      {/* üst bilgi */}
      <p className="text-center text-[9.5px] leading-relaxed text-white/40">{tt("mkIntro")}</p>
      <p className="text-center text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>
        {tt("mkSayaci").replace("{n}", String(tamKasa.length))}
      </p>

      {/* ★ 10'ar sayfalama — kumanda ÜSTTE + başa dönme çapası */}
      <div ref={listeUst} className="pt-1">
        <MenkibeKumanda tt={tt} sayfa={guvenliSayfa} toplam={tamSayfa} nToplam={tamKasa.length} degistir={sayfayaGec} />
      </div>

      {/* KONU BUTONLARI — sayfadaki 10 kıssa; detay konunun ALTINDA açılır */}
      <div className="nur-book-perspective">
      <div key={guvenliSayfa} className={"grid grid-cols-2 gap-2 " + (yon === "ileri" ? "nur-page-turn-next" : "nur-page-turn-prev")}>
        {gorunen.map((m) => (
          <React.Fragment key={m.id}>
          <button
            type="button"
            data-minitur={`menkibeler-konu-${m.id}`}
            onClick={() => setSeciliId(seciliId === m.id ? null : m.id)}
            className={`rounded-xl border p-2.5 text-left transition ${
              seciliId === m.id
                ? "border-white/25 bg-white/[.07]"
                : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"
            }`}
          >
            <span className="block text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              {m.kategori}
            </span>
            <span className="mt-0.5 flex items-start gap-1.5 text-[11px] font-black leading-snug text-white/90">
              <BookOpen className="mt-0.5 h-3 w-3 shrink-0 text-white/35" />
              {dilMetin(m, "baslik")}
            </span>
          </button>
          {seciliId === m.id && (() => {
            const idx = tamKasa.findIndex((x) => x.id === m.id);
            const oncekiId = idx > 0 ? tamKasa[idx - 1]?.id ?? null : null;
            const sonrakiId = idx >= 0 && idx < tamKasa.length - 1 ? tamKasa[idx + 1]?.id ?? null : null;
            return (
              <div className="col-span-2">
                <MenkibeDetay
                  tt={tt}
                  secili={m}
                  setSeciliId={setSeciliId}
                  dilMetin={dilMetin}
                  onceki={oncekiId ? () => setSeciliId(oncekiId) : null}
                  sonraki={sonrakiId ? () => setSeciliId(sonrakiId) : null}
                />
              </div>
            );
          })()}
          </React.Fragment>
        ))}
      </div>
      </div>

      {/* kumanda ALTTA — alttan geçişte liste anında başa (ilk sıraya) döner */}
      <MenkibeKumanda tt={tt} sayfa={guvenliSayfa} toplam={tamSayfa} nToplam={tamKasa.length} degistir={sayfayaGec} />

    </div>
  );
}
