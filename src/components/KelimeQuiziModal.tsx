// ════════════════════════════════════════════════════════
// KELİME QUIZİ — 02.11 (kullanıcı istedi: "kelime quizi sırayla")
// Kur'anda sık geçen kelimelerden 10 soruluk seçmeli tur:
// Arapça kelime → 4 Türkçe anlam şıkkı. Yanlışlar özette döner.
// Veri: data/kelimeData.ts (KELIME_KARTLARI, offline — API yok).
// En iyi skor cihazda (localStorage) tutulur; metinler 5 dilde.
// ════════════════════════════════════════════════════════

import React, { useCallback, useState } from "react";
import { Brain, Check, X, Volume2 } from "lucide-react";
import { Modal } from "./UIElements";
import { translate, type Lang } from "../i18n";
import { KELIME_KARTLARI, type KelimeKart } from "../data/kelimeData";
import { seriOkundu } from "../studio/gunlukSeri"; // ★ 02.11: quiz turu bitince günün serisi dolsun (okuma şartına yeni yol)

export interface KelimeQuiziModalProps {
  open: boolean;
  onClose: () => void;
  lang?: Lang;
  notify?: (msg: string) => void;
}

const TUR_SECENEKLERI = [10, 30, 50] as const;
const QUIZ_IST_KEY = "nur_kelime_quiz_ist_v1";

/** Kelimeyi sesli oku: Arapça ses modeli varsa Arapça kelimeyi, yoksa latin okunuşu söyler (tarayıcı TTS). */
const kelimeyiSeslendir = (kart: KelimeKart): void => {
  try {
    const syn = window.speechSynthesis;
    if (!syn) return;
    syn.cancel();
    const sese = new SpeechSynthesisUtterance(kart.ar);
    const sesler = syn.getVoices();
    const arapca = sesler.filter((v) => (v.lang || "").toLowerCase().startsWith("ar"));
    if (arapca.length > 0) { sese.voice = arapca[0]; sese.lang = "ar-SA"; }
    else { sese.text = kart.okunus || kart.ar; sese.lang = "tr-TR"; }
    sese.rate = 0.8;
    syn.speak(sese);
  } catch { /* sessiz geç */ }
};

interface Soru {
  kart: KelimeKart;
  siklar: string[];
  dogruIdx: number;
}

/** Fisher-Yates: şıklar ve soru sırası her turda yeniden karışır (tsx'te generic <T> ESM tarayıcısını şaşırtır — sadece KelimeKart listesiyle kullanılıır) */
// (tsx'te generic <T> ESM tarayıcısını şaşırtıyor — çekirdek unknown[], sarmalayıcılar tiplu)
const karistirCekirdek = (dizi: unknown[]): unknown[] => {
  const k = [...dizi];
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [k[i], k[j]] = [k[j], k[i]];
  }
  return k;
};
const karistirKartlar = (dizi: KelimeKart[]): KelimeKart[] => karistirCekirdek(dizi) as KelimeKart[];
const karistirMetinler = (dizi: string[]): string[] => karistirCekirdek(dizi) as string[];

/** 10 soruluk tur üret: her soruda doğru anlam + 3 çeldirici (aynı listeden) */
const turUret = (boyu: number): Soru[] => {
  const havuz = karistirKartlar(KELIME_KARTLARI);
  const secilen = havuz.slice(0, Math.min(boyu, havuz.length));
  return secilen.map((kart) => {
    const diger = karistirKartlar(havuz.filter((h) => h.tr !== kart.tr)).slice(0, 3);
    const siklar = karistirMetinler([...diger.map((d) => d.tr), kart.tr]);
    return { kart, siklar, dogruIdx: siklar.indexOf(kart.tr) };
  });
};

const enIyiOku = (): number => {
  try { return Number(JSON.parse(localStorage.getItem(QUIZ_IST_KEY) || "{}").enIyi) || 0; } catch { return 0; }
};

const enIyiYaz = (v: number): void => {
  try { localStorage.setItem(QUIZ_IST_KEY, JSON.stringify({ enIyi: Math.max(enIyiOku(), v) })); } catch { /* yut */ }
};

export const KelimeQuiziModal: React.FC<KelimeQuiziModalProps> = ({ open, onClose, lang = "tr" }) => {
  const tt = useCallback((k: string): string => translate(lang, k), [lang]);

  const [soruPaket, setSoruPaket] = useState<Soru[]>([]);
  const [soruI, setSoruI] = useState(0);
  const [secim, setSecim] = useState<number | null>(null);
  const [skor, setSkor] = useState({ dogru: 0, toplam: 0 });
  const [yanlislar, setYanlislar] = useState<KelimeKart[]>([]);
  const [asama, setAsama] = useState<"baslangic" | "soru" | "sonuc">("baslangic");
  const [enIyi, setEnIyi] = useState(() => enIyiOku());
  const [turBoyu, setTurBoyu] = useState<number>(10); // ★ 02.11: kişi kendi tur boyunu seçer (10/30/50)

  const turBaslat = useCallback(() => {
    setSoruPaket(turUret(turBoyu));
    setSoruI(0);
    setSecim(null);
    setSkor({ dogru: 0, toplam: 0 });
    setYanlislar([]);
    setAsama("soru");
  }, [turBoyu]); // ★ turBoyu'yı taze oku (kullanıcı tur boyunu değiştirirse geçerli olsun)

  /** Şık tıklanır: doğru/yanlış işaretlenir, 850ms sonra sonraki soru (son ise özet). */
  const cevapla = useCallback((idx: number) => {
    if (secim !== null) return;
    setSecim(idx);
    const soru = soruPaket[soruI];
    const dogru = idx === soru.dogruIdx;
    setSkor((s) => ({ dogru: s.dogru + (dogru ? 1 : 0), toplam: s.toplam + 1 }));
    if (!dogru) setYanlislar((y) => [...y, soru.kart]);
    window.setTimeout(() => {
      if (soruI + 1 >= soruPaket.length) {
        const bitis = skor.dogru + (dogru ? 1 : 0);
        enIyiYaz(bitis);
        setEnIyi(enIyiOku());
        setSecim(null);
        setAsama("sonuc");
        seriOkundu(); // ★ tur bitti = bugün okuma yapıldı kabul
      } else {
        setSoruI((i) => i + 1);
        setSecim(null);
      }
    }, 850);
  }, [secim, soruI, soruPaket, skor.dogru]);

  if (!open) return null;
  const soru = soruPaket[soruI];

  return (
    <Modal title={tt("menuKelimeQuizi")} sub={tt("qzSub")} onClose={onClose}>
      {asama === "baslangic" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Brain size={44} style={{ color: "var(--accent-2)" }} />
          <p className="text-center text-[12px] text-white/70 max-w-[42ch]">{tt("qzSub")}</p>
          {enIyi > 0 && (
            <p className="text-[11px] font-semibold" style={{ color: "var(--accent-2)" }}>{tt("qzEnIyi").replace("{n}", String(enIyi))}</p>
          )}
          {/* ★ 02.11: TUR BOYU SEÇİMİ — kişi kendisi belirler (10/30/50 soru) */}
          <div className="flex items-center gap-2" data-minitur="kelime-quizi-boy">
            <span className="text-[11px] font-bold text-white/60">{tt("qzTurBoy")}</span>
            {TUR_SECENEKLERI.map((b) => (
              <button
                key={b}
                type="button"
                data-minitur={`kelime-quizi-boy-${b}`}
                onClick={() => setTurBoyu(b)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition ${turBoyu === b ? "text-black shadow" : "text-white/70 border border-white/15 bg-white/5 hover:bg-white/10"}`}
                style={turBoyu === b ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                {b}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-minitur="kelime-quizi-basla"
            onClick={turBaslat}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-black shadow-lg transition hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            {tt("qzBasla")}
          </button>
        </div>
      )}

      {asama === "soru" && soru && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10.5px] text-white/50">
            <span>{tt("qzSoruN").replace("{n}", String(soruI + 1)).replace("{t}", String(soruPaket.length))}</span>
            <span className="font-bold text-white/80">{tt("qzSkor").replace("{d}", String(skor.dogru)).replace("{t}", String(skor.toplam))}</span>
          </div>
          <div className="relative rounded-xl bg-white/5 p-4 text-center" dir="rtl">
            <p className="text-2xl leading-relaxed text-white" style={{ fontFamily: "'Amiri Quran','Traditional Arabic',serif" }}>{soru.kart.ar}</p>
            {/* ★ 02.11 (kullanıcı istedi): her sorunun yanında DİNLE düğmesi — kelimeyi sesli okur */}
            <button
              type="button"
              data-minitur="kelime-quizi-dinle"
              aria-label={tt("qzDinle")}
              title={tt("qzDinle")}
              onClick={() => kelimeyiSeslendir(soru.kart)}
              className="absolute left-2 top-2 rounded-full border border-white/10 bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white active:scale-90"
            >
              <Volume2 size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {soru.siklar.map((sik, i) => {
              const dogru = secim !== null && i === soru.dogruIdx;
              const yanlis = secim === i && i !== soru.dogruIdx;
              return (
                <button
                  key={sik}
                  type="button"
                  disabled={secim !== null}
                  onClick={() => cevapla(i)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[12.5px] font-medium transition ${
                    dogru ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                    : yanlis ? "border-rose-400/60 bg-rose-400/15 text-rose-200"
                    : "border-white/10 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
                  } ${secim !== null && !dogru && !yanlis ? "opacity-40" : ""}`}
                >
                  <span className="truncate">{sik}</span>
                  {dogru && <Check size={15} className="shrink-0 text-emerald-300" />}
                  {yanlis && <X size={15} className="shrink-0 text-rose-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {asama === "sonuc" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-center font-display text-lg font-bold" style={{ color: "var(--accent-2)" }}>{tt("qzSonuc")}</p>
          <p className="text-center text-[12px] text-white/70">{tt("qzSkor").replace("{d}", String(skor.dogru)).replace("{t}", String(skor.toplam))}</p>
          {skor.dogru >= enIyi && skor.dogru > 0 && (
            <p className="text-[11px] font-semibold" style={{ color: "var(--accent-2)" }}>{tt("qzEnIyi").replace("{n}", String(enIyi))}</p>
          )}
          {yanlislar.length > 0 && (
            <div className="mt-1 max-h-40 w-full overflow-y-auto rounded-xl bg-white/5 p-2">
              {yanlislar.map((y) => (
                <div key={y.ar} className="flex items-center gap-2 border-b border-white/5 px-1 py-1.5 text-[11.5px] last:border-b-0">
                  <span dir="rtl" className="shrink-0 text-white/80">{y.ar}</span>
                  {y.okunus && <span className="shrink-0 text-white/35" dir="ltr">{y.okunus}</span>}
                  <span className="text-white/40">→</span>
                  <span className="truncate text-white/70">{y.tr}</span>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={turBaslat}
            className="mt-2 rounded-xl px-6 py-2.5 text-sm font-bold text-black shadow-lg transition hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            {tt("qzTekrar")}
          </button>
        </div>
      )}
    </Modal>
  );
};
