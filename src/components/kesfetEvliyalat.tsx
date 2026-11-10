// // KESFET-EVLIYALAT.TSX — 04.11, kullanıcı emri: "menkıbelerin altına Evliyalat
//   diye bir buton; 10 büyük hikâye, her biri 5 sayfa, gerçek kitap sayfası gibi;
//   alttaki okla diğer sayfaya geçilince hemen yukarı, ilk sıraya dön."
//   · kapak listesi: 10 evliya kartı (data-minitur="evliyalat-kitap-<id>")
//   · kitap görünümü: sayfa sayfa ◀▶ (üst + alt kumanda), sayfa değişince listeyi başa döndürür
//   · geri butonu menkıbe listesine döner
import React from "react";
import { ChevronLeft, X, Library } from "lucide-react";
import { EVLIYALAT, type Evliya } from "../data/evliyalat";

type TT = (k: string) => string;
type Dil = "tr" | "en" | "ar" | "id" | "ur";

const okCls = "flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/[.04] text-[10px] font-black text-white/70 transition hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-30";

function loc(ev: Evliya, dil: Dil) {
  const r = ev as unknown as Record<string, unknown>;
  const pick = (k: string) => (dil === "tr" ? r[k] : r[`${k}_${dil}`]) || r[k];
  const pickArr = (k: string) => {
    const v = dil === "tr" ? r[k] : r[`${k}_${dil}`];
    return Array.isArray(v) && v.length ? (v as string[]) : ((r[k] as string[]) || []);
  };
  return {
    ad: String(pick("ad") || ev.ad),
    unvan: String(pick("unvan") || ev.unvan),
    donem: String(pick("donem") || ev.donem),
    kaynak: String(pick("kaynak") || ev.kaynak),
    sayfalar: pickArr("sayfalar"),
    onemliAnlar: pickArr("onemliAnlar"),
  };
}

/** Sayfa kumandası — üstte ve altta aynı görünüm. */
function KitapKumanda({ tt, sayfa, toplam, degistir }: { tt: TT; sayfa: number; toplam: number; degistir: (yeni: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button type="button" data-minitur="evliyalat-sayfa-geri" className={okCls} onClick={() => degistir(sayfa - 1)} disabled={sayfa <= 0}>◀</button>
      <span className="min-w-20 text-center text-[9.5px] font-black tracking-wide text-white/55" data-minitur="evliyalat-sayfa-bilgi">
        {tt("evSayfa").replace("{p}", String(sayfa + 1)).replace("{t}", String(toplam))}
      </span>
      <button type="button" data-minitur="evliyalat-sayfa-ileri" className={okCls} onClick={() => degistir(sayfa + 1)} disabled={sayfa >= toplam - 1}>▶</button>
    </div>
  );
}

/** Kitap sayfası — gerçek kitap gibi: parchment arka plan, serif, sayfa kumandası. */
function EvliyaKitap({ tt, ev, onGeri, dil }: { tt: TT; ev: Evliya; onGeri: () => void; dil: Dil }) {
  const L = loc(ev, dil || "tr");
  const [sayfaNo, setSayfaNo] = React.useState(0);
  const [yon, setYon] = React.useState("ileri");
  const [acik, setAcik] = React.useState(false);
  const kitapUst = React.useRef<HTMLDivElement | null>(null);
  const toplam = L.sayfalar.length;

  React.useEffect(() => {
    setAcik(false);
    setSayfaNo(0);
    setYon("ileri");
    const t = window.setTimeout(() => setAcik(true), 650);
    return () => window.clearTimeout(t);
  }, [ev.id]);

  React.useEffect(() => {
    kitapUst.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [ev.id, acik]);

  const sayfayaGec = (hedef: number) => {
    const yeni = Math.min(Math.max(0, hedef), toplam - 1);
    if (yeni === sayfaNo) return;
    setYon(yeni > sayfaNo ? "ileri" : "geri");
    setSayfaNo(yeni);
    requestAnimationFrame(() => {
      kitapUst.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  const geriEtiket = ({"tr":"Geri","en":"Back","ar":"رجوع","id":"Kembali","ur":"واپس"} as Record<string,string>)[dil] || "Geri";

  return (
    <div ref={kitapUst} className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <button type="button" data-minitur="evliyalat-kitap-geri" onClick={onGeri} className="flex items-center gap-1 rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-black text-white/70 transition hover:bg-white/[.12]">
          <ChevronLeft className="h-3 w-3" />
          {geriEtiket}
        </button>
        <button type="button" data-minitur="evliyalat-kitap-x" onClick={onGeri} className="rounded-full bg-white/[.06] p-1.5 text-white/60 transition hover:bg-white/[.12] hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {!acik ? (
        <div className="nur-book-perspective">
          <button
            type="button"
            onClick={() => setAcik(true)}
            className="nur-book-cover nur-page-turn-next relative w-full overflow-hidden rounded-2xl px-5 py-10 text-center"
            style={{ minHeight: 320 }}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-black/20" />
            <div className="pointer-events-none absolute inset-y-3 left-3 w-px bg-amber-200/30" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200/70">{tt("ksEvliyalar") || "Evliyalar"}</p>
            <h3 className="mt-4 text-[22px] font-black leading-tight text-amber-50">{L.ad}</h3>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-amber-100/70">{L.unvan}</p>
            <p className="mt-3 text-[10px] font-semibold text-amber-100/55">{L.donem}</p>
            <p className="mt-8 text-[10px] font-bold text-amber-100/60">{toplam} {tt("evSayfaKisa") || "sayfa"}</p>
            <p className="mt-2 text-[9px] text-amber-100/45">Kitap açılıyor…</p>
          </button>
        </div>
      ) : (
        <>
          <KitapKumanda tt={tt} sayfa={sayfaNo} toplam={toplam} degistir={sayfayaGec} />

          <div className="nur-book-perspective">
            <div
              key={sayfaNo}
              className={"rounded-2xl p-4 font-serif " + (sayfaNo === 0 && yon === "ileri" ? "nur-book-open" : (yon === "ileri" ? "nur-page-turn-next" : "nur-page-turn-prev"))}
              style={{
                background: "#f3e9d2",
                color: "#3d2f1c",
                border: "1px solid rgba(215,170,82,.45)",
                boxShadow: "inset 0 0 18px rgba(120,85,30,.12), 0 10px 24px rgba(0,0,0,.18)",
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-black">{L.ad}</span>
                <span className="text-[9px] font-bold opacity-70">{L.donem}</span>
              </div>
              <span className="block text-[9.5px] font-bold uppercase tracking-widest opacity-60">{L.unvan}</span>
              <div className="my-2 h-px" style={{ background: "rgba(140,100,40,.35)" }} />
              <p data-minitur="evliyalat-kitap-sayfa" className="whitespace-pre-line text-justify text-[12px] leading-[1.9]">
                {L.sayfalar[sayfaNo] || ""}
              </p>
              <div className="mt-3 text-center text-[11px] opacity-40">❦</div>
            </div>
          </div>

          {L.onemliAnlar && L.onemliAnlar.length > 0 && (
            <div data-minitur="evliyalat-onemli" className="rounded-2xl border border-white/12 bg-white/[.04] p-3">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>{tt("evOnemli")}</p>
              <ul className="space-y-1">
                {L.onemliAnlar.map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-white/75">
                    <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--accent-2)" }} />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <KitapKumanda tt={tt} sayfa={sayfaNo} toplam={toplam} degistir={sayfayaGec} />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[9px] font-bold" style={{ color: "var(--accent-2)" }}>
            <Library className="h-3 w-3 shrink-0" />
            {L.kaynak}
          </p>
        </>
      )}
    </div>
  );
}

/** Evliyalat bölümü — kapak listesi. Menkıbeler bölümünün altından açılır. */
export function EvliyalatBolumu({ tt, onGeri, lang = "tr" }: { tt: TT; onGeri: () => void; lang?: Dil | string }) {
  const [evSecili, setEvSecili] = React.useState<string | null>(null);
  const listeUst = React.useRef<HTMLDivElement | null>(null);
  const dil = (lang || "tr") as Dil;
  const secili = evSecili ? EVLIYALAT.find((e) => e.id === evSecili) : undefined;

  if (secili) {
    return <EvliyaKitap tt={tt} ev={secili} dil={dil} onGeri={() => { setEvSecili(null); requestAnimationFrame(() => listeUst.current?.scrollIntoView({ behavior: "auto", block: "start" })); }} />;
  }

  return (
    <div data-minitur="evliyalat-bolumu" className="space-y-2">
      <div ref={listeUst} className="flex items-center justify-between">
        <button type="button" data-minitur="evliyalat-geri" onClick={onGeri} className="flex items-center gap-1 rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-black text-white/70 transition hover:bg-white/[.12]">
          <ChevronLeft className="h-3 w-3" />
          {({"tr":"Geri","en":"Back","ar":"رجوع","id":"Kembali","ur":"واپس"} as Record<string,string>)[dil] || "Geri"}
        </button>
        <button type="button" data-minitur="evliyalat-x" onClick={onGeri} className="rounded-full bg-white/[.06] p-1.5 text-white/60 transition hover:bg-white/[.12] hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-center text-[9.5px] leading-relaxed text-white/40">{tt("evIntro")}</p>
      <div className="grid grid-cols-2 gap-2">
        {EVLIYALAT.map((e) => { const Lc = loc(e, dil || "tr"); return (
          <button key={e.id} type="button" data-minitur={`evliyalat-kitap-${e.id}`} onClick={() => setEvSecili(evSecili === e.id ? null : e.id)} className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-left transition hover:bg-white/[.05]">
            <span className="block text-[11.5px] font-black leading-snug text-white/90">{Lc.ad}</span>
            <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>{Lc.unvan}</span>
            <span className="mt-1 block text-[9px] font-bold text-white/35">{Lc.donem}</span>
            <span className="mt-1.5 inline-block rounded-full bg-white/[.06] px-2 py-0.5 text-[8.5px] font-black text-white/50">{Lc.sayfalar.length} {tt("evSayfaKisa") || "sayfa"}</span>
          </button>
        ); })}
      </div>
    </div>
  );
}
