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

const okCls = "flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/[.04] text-[10px] font-black text-white/70 transition hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-30";

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
function EvliyaKitap({ tt, ev, onGeri }: { tt: TT; ev: Evliya; onGeri: () => void }) {
  const [sayfaNo, setSayfaNo] = React.useState(0);
  const kitapUst = React.useRef<HTMLDivElement | null>(null);
  const toplam = ev.sayfalar.length;

  // açılışta kitabın başına bak
  React.useEffect(() => {
    kitapUst.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [ev.id]);

  const sayfayaGec = (hedef: number) => {
    const yeni = Math.min(Math.max(0, hedef), toplam - 1);
    if (yeni === sayfaNo) return;
    setSayfaNo(yeni);
    requestAnimationFrame(() => {
      kitapUst.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  return (
    <div ref={kitapUst} className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <button type="button" data-minitur="evliyalat-kitap-geri" onClick={onGeri} className="flex items-center gap-1 rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-black text-white/70 transition hover:bg-white/[.12]">
          <ChevronLeft className="h-3 w-3" />
          {tt("evGeri")}
        </button>
        <button type="button" data-minitur="evliyalat-kitap-x" onClick={onGeri} className="rounded-full bg-white/[.06] p-1.5 text-white/60 transition hover:bg-white/[.12] hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <KitapKumanda tt={tt} sayfa={sayfaNo} toplam={toplam} degistir={sayfayaGec} />

      <div
        className="rounded-2xl p-4 font-serif"
        style={{
          background: "#f3e9d2",
          color: "#3d2f1c",
          border: "1px solid rgba(215,170,82,.45)",
          boxShadow: "inset 0 0 18px rgba(120,85,30,.12)",
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-black">{ev.ad}</span>
          <span className="text-[9px] font-bold opacity-70">{ev.donem}</span>
        </div>
        <span className="block text-[9.5px] font-bold uppercase tracking-widest opacity-60">{ev.unvan}</span>
        <div className="my-2 h-px" style={{ background: "rgba(140,100,40,.35)" }} />
        <p data-minitur="evliyalat-kitap-sayfa" className="whitespace-pre-line text-justify text-[12px] leading-[1.9]">
          {ev.sayfalar[sayfaNo]}
        </p>
        <div className="mt-3 text-center text-[11px] opacity-40">❦</div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <KitapKumanda tt={tt} sayfa={sayfaNo} toplam={toplam} degistir={sayfayaGec} />
      </div>
      <p className="flex items-center justify-center gap-1.5 text-[9px] font-bold" style={{ color: "var(--accent-2)" }}>
        <Library className="h-3 w-3 shrink-0" />
        {ev.kaynak}
      </p>
    </div>
  );
}

/** Evliyalat bölümü — kapak listesi. Menkıbeler bölümünün altından açılır. */
export function EvliyalatBolumu({ tt, onGeri }: { tt: TT; onGeri: () => void }) {
  const [evSecili, setEvSecili] = React.useState<string | null>(null);
  const listeUst = React.useRef<HTMLDivElement | null>(null);
  const secili = evSecili ? EVLIYALAT.find((e) => e.id === evSecili) : undefined;

  if (secili) {
    return <EvliyaKitap tt={tt} ev={secili} onGeri={() => { setEvSecili(null); requestAnimationFrame(() => listeUst.current?.scrollIntoView({ behavior: "auto", block: "start" })); }} />;
  }

  return (
    <div data-minitur="evliyalat-bolumu" className="space-y-2">
      <div ref={listeUst} className="flex items-center justify-between">
        <button type="button" data-minitur="evliyalat-geri" onClick={onGeri} className="flex items-center gap-1 rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-black text-white/70 transition hover:bg-white/[.12]">
          <ChevronLeft className="h-3 w-3" />
          {tt("evGeri")}
        </button>
        <button type="button" data-minitur="evliyalat-x" onClick={onGeri} className="rounded-full bg-white/[.06] p-1.5 text-white/60 transition hover:bg-white/[.12] hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-center text-[9.5px] leading-relaxed text-white/40">{tt("evIntro")}</p>
      <div className="grid grid-cols-2 gap-2">
        {EVLIYALAT.map((e) => (
          <button key={e.id} type="button" data-minitur={`evliyalat-kitap-${e.id}`} onClick={() => setEvSecili(evSecili === e.id ? null : e.id)} className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-left transition hover:bg-white/[.05]">
            <span className="block text-[11.5px] font-black leading-snug text-white/90">{e.ad}</span>
            <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>{e.unvan}</span>
            <span className="mt-1 block text-[9px] font-bold text-white/35">{e.donem}</span>
            <span className="mt-1.5 inline-block rounded-full bg-white/[.06] px-2 py-0.5 text-[8.5px] font-black text-white/50">{e.sayfalar.length} sayfa · kitap</span>
          </button>
        ))}
      </div>
    </div>
  );
}
