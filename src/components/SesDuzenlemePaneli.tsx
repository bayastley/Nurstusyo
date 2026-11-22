// ════════════════════════════════════════════════════════
// SES DÜZENLEME PANELİ — yol haritası madde 21
// Stüdyo yuvasının "Ses" sekmesi: seviye, sessizlik temizleme,
// başlangıç kırpma, fade-in/out ve GERÇEK ses önizleme
// (seçili ilk ayetin sesi, kâri zincirinden indirilip offline render edilir).
// ════════════════════════════════════════════════════════

import React from "react";
import { translate } from "../i18n";
import { RECITERS, sesKaynakZinciri } from "../reciters";
import {
  VARSAYILAN_SES_AYAR,
  onizlemeRenderEt,
  sesAyarOku,
  sesAyarYaz,
  type SesAyar,
} from "../studio/sesDuzenleme";

export interface SesDuzenlemePaneliProps {
  /** Önizlemede çalınacak ayet (seçili ilk ayet) */
  ayet: { s: number; a: number } | null;
  reciterId: string;
}

const SATIR = "flex items-center gap-2";
const ETIKET = "w-[96px] shrink-0 text-[9px] font-black uppercase tracking-wide text-white/55";

export const SesDuzenlemePaneli: React.FC<SesDuzenlemePaneliProps> = ({ ayet, reciterId }) => {
  const dil = (typeof localStorage !== "undefined" ? localStorage.getItem("nur_lang") : "tr") || "tr";
  const gt = (k: string): string => translate(dil, k);

  const [ayar, setAyar] = React.useState<SesAyar>(() => sesAyarOku());
  const [durum, setDurum] = React.useState<"bos" | "yukleniyor" | "caliyor" | "hata">("bos");
  const ctxRef = React.useRef<AudioContext | null>(null);
  const kaynakRef = React.useRef<AudioBufferSourceNode | null>(null);

  const guncelle = (yama: Partial<SesAyar>) => {
    setAyar((onceki) => {
      const yeni = { ...onceki, ...yama };
      sesAyarYaz(yeni);
      return yeni;
    });
  };

  const durdur = () => {
    try {
      kaynakRef.current?.stop();
    } catch {
      // zaten durmuş olabilir
    }
    kaynakRef.current = null;
    setDurum("bos");
  };

  React.useEffect(() => () => {
    try {
      kaynakRef.current?.stop();
    } catch {
      // kapanışta zaten durmuş olabilir
    }
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== "closed") void ctx.close().catch((hata) => console.warn("[sesDuzenleme] ctx kapatma", hata));
  }, []);

  const onizle = async () => {
    if (!ayet) return;
    if (durum === "caliyor") {
      durdur();
      return;
    }
    setDurum("yukleniyor");
    const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0];
    try {
      let ham: ArrayBuffer | null = null;
      for (const url of sesKaynakZinciri(reciter.path, ayet.s, ayet.a)) {
        try {
          const cevap = await fetch(url);
          if (!cevap.ok) continue;
          ham = await cevap.arrayBuffer();
          break;
        } catch (hata) {
          console.warn("[sesDuzenleme] ses kaynağı atlandı", hata);
        }
      }
      if (!ham) throw new Error("Ses dosyası indirilemedi");
      const ctx = ctxRef.current && ctxRef.current.state !== "closed" ? ctxRef.current : new AudioContext();
      ctxRef.current = ctx;
      const cozulen = await ctx.decodeAudioData(ham);
      const render = await onizlemeRenderEt(cozulen, ayar);
      const kaynak = ctx.createBufferSource();
      kaynak.buffer = render;
      kaynak.connect(ctx.destination);
      kaynak.onended = () => setDurum("bos");
      kaynakRef.current = kaynak;
      kaynak.start(0);
      setDurum("caliyor");
    } catch (hata) {
      console.warn("[sesDuzenleme] önizleme başarısız", hata);
      setDurum("hata");
    }
  };

  const kaydirici = (
    etiket: string,
    deger: number,
    alt: number,
    ust: number,
    adim: number,
    metin: string,
    uygula: (n: number) => void,
  ) => (
    <div className={SATIR}>
      <span className={ETIKET}>{etiket}</span>
      <input
        type="range"
        min={alt}
        max={ust}
        step={adim}
        value={deger}
        onChange={(e) => uygula(Number(e.target.value))}
        className="h-1 flex-1 accent-amber-400"
        aria-label={etiket}
      />
      <span className="w-[44px] shrink-0 text-right text-[9.5px] font-black text-white/75">{metin}</span>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[.02] p-3.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{gt("sdBaslik")}</p>
          <p className="mt-0.5 text-[11.5px] font-black leading-snug text-white/90">{gt("sdSub")}</p>
        </div>
        <button
          type="button"
          onClick={() => void onizle()}
          disabled={!ayet || durum === "yukleniyor"}
          className="shrink-0 rounded-xl px-3 py-2 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95 disabled:opacity-45"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          {durum === "yukleniyor" ? gt("sdYukleniyor") : durum === "caliyor" ? gt("sdDurdur") : gt("sdOnizle")}
        </button>
      </div>

      <div className="mt-2.5 space-y-2">
        {kaydirici(gt("sdSeviye"), ayar.seviye, 0.1, 1, 0.02, `${Math.round(ayar.seviye * 100)}%`, (n) => guncelle({ seviye: n }))}
        {kaydirici(gt("sdBaslangic"), ayar.baslangic, 0, 2, 0.05, `${ayar.baslangic.toFixed(2)}s`, (n) => guncelle({ baslangic: n }))}
        {kaydirici(gt("sdFadeIn"), ayar.fadeIn, 0, 1.5, 0.01, `${ayar.fadeIn.toFixed(2)}s`, (n) => guncelle({ fadeIn: n }))}
        {kaydirici(gt("sdFadeOut"), ayar.fadeOut, 0, 1.5, 0.01, `${ayar.fadeOut.toFixed(2)}s`, (n) => guncelle({ fadeOut: n }))}

        <div className={SATIR}>
          <span className={ETIKET}>{gt("sdSessizlik")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={ayar.sessizlik}
            onClick={() => guncelle({ sessizlik: !ayar.sessizlik })}
            className={`relative h-5 w-9 rounded-full border transition ${ayar.sessizlik ? "border-amber-400/60" : "border-white/20"}`}
            style={{ background: ayar.sessizlik ? "linear-gradient(135deg,var(--accent-2),var(--accent))" : "rgba(255,255,255,.08)" }}
          >
            <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${ayar.sessizlik ? "left-[18px]" : "left-0.5"}`} />
          </button>
          <button
            type="button"
            onClick={() => { const varsayilan = { ...VARSAYILAN_SES_AYAR }; setAyar(varsayilan); sesAyarYaz(varsayilan); }}
            className="ml-auto rounded-lg border border-white/15 px-2 py-1 text-[8.5px] font-black text-white/60 transition hover:text-white"
          >
            {gt("sdSifirla")}
          </button>
        </div>
      </div>

      <p className="mt-2 text-[9px] font-semibold leading-snug text-white/40">
        {ayet ? gt("sdNot") : gt("sdAyetYok")}
      </p>
      {durum === "hata" && <p className="mt-1 text-[9px] font-black text-red-300">{gt("sdHata")}</p>}
    </div>
  );
};
