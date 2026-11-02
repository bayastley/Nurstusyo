// ════════════════════════════════════════════════════════
// KESFET-MENKIBELER.TS (02.11, kullanıcı emri: "İslami menkıbeler olsun;
// üstte konu butonları olsun, en fazla 5 buton gözüksün ama içinde başka
// butonlar da olsun; hangisine tıklarsak hikâye aşağıda açılsın; geri veya
// X basınca kapansın") — Kâri Köşesi kasasından beslenen menkübe bölümü.
//   · üst şerit: ilk 5 kıssa konusu görünür + "Tümünü göster" expanded
//   · konu tıklandığında hikâye listenin ALTINDA açılır (aşağı doğru)
//   · detay içinde: geri (liste dön) + X (detayı kapat)
//   · her kıssa: hikâye + hikmet kutusu + kaynak satırı
// ════════════════════════════════════════════════════════
import React from "react";
import { X, ChevronLeft, BookOpen, Lightbulb, Library } from "lucide-react";
import { MENKIBELER, type Menkibe } from "../data/menkibeler";

type TT = (k: string) => string;

export function MenkibelerBolumu({ tt }: { tt: TT }) {
  const [tumGoster, setTumGoster] = React.useState(false);
  const [seciliId, setSeciliId] = React.useState<string | null>(null);
  const secili: Menkibe | undefined = MENKIBELER.find((m) => m.id === seciliId);

  const gorunen = tumGoster ? MENKIBELER : MENKIBELER.slice(0, 5);
  const kalanSayisi = Math.max(0, MENKIBELER.length - 5);

  return (
    <div className="space-y-3" data-minitur="menkibeler-bolumu">
      {/* üst bilgi */}
      <p className="text-center text-[9.5px] leading-relaxed text-white/40">{tt("mkIntro")}</p>
      <p className="text-center text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>
        {tt("mkSayaci").replace("{n}", String(MENKIBELER.length))}
      </p>

      {/* KONU BUTONLARI — en fazla 5 görünür; "tümünü göster" içerde açar */}
      <div className="grid grid-cols-2 gap-2">
        {gorunen.map((m) => (
          <button
            key={m.id}
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
              {m.baslik}
            </span>
          </button>
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

      {/* HİKÂYE SAYFASI — listenin altında, aşağı doğru açılır */}
      {secili && (
        <div
          data-minitur="menkibeler-detay"
          className="rounded-2xl border border-white/15 bg-white/[.05] p-4"
        >
          {/* üst çubuk: geri + kapat */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              data-minitur="menkibeler-geri"
              onClick={() => setSeciliId(null)}
              className="flex items-center gap-1 rounded-full bg-white/[.06] px-3 py-1 text-[10px] font-black text-white/70 transition hover:bg-white/[.12]"
            >
              <ChevronLeft className="h-3 w-3" />
              {tt("mkGeri")}
            </button>
            <button
              type="button"
              data-minitur="menkibeler-x"
              onClick={() => setSeciliId(null)}
              className="rounded-full bg-white/[.06] p-1.5 text-white/60 transition hover:bg-white/[.12] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            {secili.kategori}
          </span>
          <h3 className="mt-1 text-[15px] font-black text-white">{secili.baslik}</h3>

          <p className="mt-3 text-[11.5px] leading-[1.7] text-white/80 whitespace-pre-line">{secili.hikaye}</p>

          {/* kıssadan hisse */}
          <div className="mt-4 rounded-xl bg-emerald-500/10 p-3">
            <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-emerald-200">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-black">{tt("mkHikmet")}</span> {secili.hikmet}
              </span>
            </p>
          </div>

          {/* kaynak */}
          <p className="mt-3 flex items-center gap-1.5 text-[9px] font-bold" style={{ color: "var(--accent-2)" }}>
            <Library className="h-3 w-3 shrink-0" />
            <span>{tt("mkKaynak")}: {secili.kaynak}</span>
          </p>
        </div>
      )}
    </div>
  );
}
