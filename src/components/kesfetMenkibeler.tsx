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

// ★ 02.11 (kullanıcı emri "tıkladığımda hemen açılsın, en alta gitmesin"):
//   detay artık konu butonunun hemen altında (col-span-2), ayrı bileşen olarak
type DilMetinFn = (m: UzakKissa | undefined, alan: "baslik" | "hikaye" | "hikmet") => string;
function MenkibeDetay({ tt, secili, setSeciliId, dilMetin }: { tt: TT; secili: UzakKissa; setSeciliId: (v: string | null) => void; dilMetin: DilMetinFn }) {
  return (
    <div data-minitur="menkibeler-detay" className="mt-1 rounded-2xl border border-white/15 bg-white/[.05] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" data-minitur="menkibeler-geri" onClick={() => setSeciliId(null)} className="flex items-center gap-1 rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-black text-white/70 transition hover:bg-white/[.12]">
          <ChevronLeft className="h-3 w-3" />
          {tt("mkGeri")}
        </button>
        <button type="button" data-minitur="menkibeler-x" onClick={() => setSeciliId(null)} className="rounded-full bg-white/[.06] p-1.5 text-white/60 transition hover:bg-white/[.12] hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>{secili.kategori}</span>
      <h3 className="mt-1 text-[15px] font-black text-white">{dilMetin(secili, "baslik")}</h3>
      <p className="mt-3 text-[11.5px] leading-[1.7] text-white/80 whitespace-pre-line">{dilMetin(secili, "hikaye")}</p>
      <div className="mt-4 rounded-xl bg-emerald-500/10 p-3">
        <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-emerald-200">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span><span className="font-black">{tt("mkHikmet")}</span> {dilMetin(secili, "hikmet")}</span>
        </p>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold" style={{ color: "var(--accent-2)" }}>
        <Library className="h-3 w-3 shrink-0" />
        <span>{tt("mkKaynak")}: {secili.kaynak}</span>
      </p>
    </div>
  );
}

export function MenkibelerBolumu({ tt }: { tt: TT }) {
  const [tumGoster, setTumGoster] = React.useState(false);
  const [seciliId, setSeciliId] = React.useState<string | null>(null);
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

  const gorunen = tumGoster ? tamKasa : tamKasa.slice(0, 5);
  const kalanSayisi = Math.max(0, tamKasa.length - 5);

  return (
    <div className="space-y-3" data-minitur="menkibeler-bolumu">
      {/* üst bilgi */}
      <p className="text-center text-[9.5px] leading-relaxed text-white/40">{tt("mkIntro")}</p>
      <p className="text-center text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>
        {tt("mkSayaci").replace("{n}", String(tamKasa.length))}
      </p>

      {/* KONU BUTONLARI — en fazla 5 görünür; "tümünü göster" içerde açar */}
      <div className="grid grid-cols-2 gap-2">
        {gorunen.map((m) => (
          <React.Fragment key={m.id}>
          <button
            type="button"
            data-minitur={`menkibeler-konu-${m.id}`}
            onClick={() => setSeciliId(m.id)}
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
          {seciliId === m.id && (
            <div className="col-span-2">
              <MenkibeDetay tt={tt} secili={m} setSeciliId={setSeciliId} dilMetin={dilMetin} />
            </div>
          )}
          </React.Fragment>
        ))}
      </div>

      {/* "kalanı içinde göster" düğmesi — kasa büyüdükçe otomatik görünür */}
      {!tumGoster && kalanSayisi > 0 && (
        <button
          type="button"
          data-minitur="menkibeler-tum"
          onClick={() => setTumGoster(true)}
          className="mx-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[.04] px-4 py-1.5 text-[10px] font-black text-white/70 transition hover:bg-white/[.08]"
        >
          <Library className="h-3 w-3" />
          {tt("mkTumu").replace("{n}", String(kalanSayisi))}
        </button>
      )}

    </div>
  );
}
