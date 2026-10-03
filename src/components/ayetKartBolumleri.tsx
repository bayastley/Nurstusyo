// ════════════════════════════════════════════════════════
// AYETKARTBOLUMLERI.TSX — AyetKartlariModal'dan ayrıldı (SRP, 01.10)
// Üç self-contained bölüm: SOL ayet seçimi · SAĞ kart önizleme+ayarlar ·
// altta arka plan galerisi. JSX birebir korunur; state modal'da kalır,
// bölümler saf görünüm + callback alır.
// ════════════════════════════════════════════════════════

import React, { useState } from "react";
import { Brain, Check, Download, Search, Sparkles, Image as ImageIcon, Moon, Type, Wand2, ArrowUpDown, AlignLeft, AlignCenter, AlignRight, ChevronsDown, Upload, Shuffle, Palette, PenLine, Sparkles as IsiltiIcon } from "lucide-react";
import { AYET_MOODS, SURE_ADLARI, type AyetKarti } from "../data/ayetKartlariData";
import { RUH_HALLERI, ruhSayacOku, ruhSayacArttir, cipSirasi, ruhHaliAd, type RuhSayac } from "../data/ruhHalleri";
import { translate, type Lang } from "../i18n";
import { BACKGROUNDS, catLabel, BG_CATS, MOOD_COLORS, type BgItem, type KartAyarlari, VARSAYILAN_AYARLAR } from "./ayetKartMotoru";
import { CubukRenkSecici, CerceveDuzRenkleri } from "./renkCubuguSecici";
import { HatFontuSeridi } from "./hatFontuSeridi";
import { cubukRengi, hexToHue } from "../studio/mesajKatmani";

// ─── SOL: AYET SEÇİMİ ──────────────────────────────────────

export const AyetSecimBolumu: React.FC<{
  filteredAyets: AyetKarti[];
  ayetId: string;
  setAyetId: (id: string) => void;
  ayetVisibleCount: number;
  setAyetVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  mood: AyetKarti["mood"] | "tumu";
  setMood: (m: AyetKarti["mood"] | "tumu") => void;
  sadeceGunun: boolean;
  setSadeceGunun: (v: boolean) => void;
  sureFiltre: number | "tumu";
  setSureFiltre: (v: number | "tumu") => void;
  ayetSearch: string;
  setAyetSearch: (v: string) => void;
  gununAyetiObj: AyetKarti;
  shuffleAyet: () => void;
  /** 🎯 Akıllı AI: ayetin ruh haline/kelimelerine göre ayet + uyumlu arka plan kendisi seçilir */
  akilliAyetSec: () => void;
  /** ★ AI RUH HALİ (01.10): serbest metin / çip → ayet + arka plan + kart ayarları */
  ruhHaliMetin: string;
  setRuhHaliMetin: (v: string) => void;
  ruhHaliUygula: (ruhId?: string) => void;
  /** ★ i18n (02.10): bölüm metinleri + çip adları seçili dilde */
  lang?: Lang;
}> = ({ filteredAyets, ayetId, setAyetId, ayetVisibleCount, setAyetVisibleCount, mood, setMood, sadeceGunun, setSadeceGunun, sureFiltre, setSureFiltre, ayetSearch, setAyetSearch, gununAyetiObj, shuffleAyet, akilliAyetSec, ruhHaliMetin, setRuhHaliMetin, ruhHaliUygula, lang = "tr" }) => {
  const tt = (k: string): string => translate(lang, k);
  // ★ 04.10 TUR 2: mood etiketleri 5 dile (AYET_MOODS TR verisinden anahtar türetme)
  const moodEtiketi = (id: string): string => {
    const m = AYET_MOODS.find((x) => x.id === id);
    if (!m) return id;
    const trLabel = m.label;
    const harita: Record<string, string> = {
      "Tümü": "akTumu", "Huzur": "akMoodHuzur", "Sabır": "akMoodSabir", "Şükür": "akMoodSukur",
      "Tevekkül": "akMoodTevekkul", "Rahmet": "akMoodRahmet", "Sevgi": "akMoodSevgi",
      "Zafer & Umut": "akMoodZafer", "Af & Tövbe": "akMoodAf", "İmtihan": "akMoodImtihan",
      "Cennet": "akMoodCennet", "İlim & Hikmet": "akMoodIlim", "Aile & Yuva": "akMoodAile",
    };
    return harita[trLabel] ? tt(harita[trLabel]) : trLabel;
  };
  // ★ ÇİP SAYACI (02.10): her basış localStorage'a yazılır; popüler 5 çip ÖNE
  //   sabitlenir (🏅 rozet + seçim sayısı). State tick'i sıralamayı anında günceller.
  const [ruhSayac, setRuhSayac] = useState<RuhSayac>(() => ruhSayacOku());
  const cipTikla = (ruhId: string) => {
    setRuhSayac(ruhSayacArttir(ruhId));
    ruhHaliUygula(ruhId);
  };
  return (
    <div className="order-2 lg:order-1">
          {/* ★ AI RUH HALİ (01.10) — yaz ya da çip seç: ayet + arka plan + kart ayarı tek tuşla */}
          <div className="mb-2.5 rounded-xl border border-[color:var(--accent)]/25 bg-white/[.03] p-2.5">
            <div className="flex items-center gap-1.5">
              <div className="relative min-w-0 flex-1">
                <Sparkles size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  value={ruhHaliMetin}
                  onChange={(e) => setRuhHaliMetin(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") ruhHaliUygula(); }}
                  placeholder={tt("akRuhHaliPlaceholder")}
                  className="glass-soft w-full rounded-lg py-2 pl-9 pr-2.5 text-[10.5px] outline-none placeholder:text-white/30"
                />
              </div>
              <button
                type="button"
                onClick={() => ruhHaliUygula()}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                title={lang === "tr" ? tt("akAkilliSecim") : undefined}
              >
                <Brain size={11} /> {tt("akAiRuhHali")}
              </button>
            </div>
            <div className="scrollbar-thin mt-1.5 flex max-h-[58px] flex-wrap gap-1 overflow-y-auto">
              {cipSirasi(ruhSayac).map(({ id, sayi, populer }) => {
                const r = RUH_HALLERI.find((x) => x.id === id)!;
                const cipAd = ruhHaliAd(r, lang);
                return (
                  <button key={r.id} type="button" onClick={() => cipTikla(r.id)} title={populer ? `${cipAd} — ${sayi}×` : cipAd}
                    className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold transition ${populer ? "border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20" : "glass-soft text-white/55 hover:text-white"}`}>
                    {populer && <span className="mr-0.5" aria-hidden>🏅</span>}
                    {r.emoji} {cipAd}{populer && <span className="ml-1 opacity-70">{sayi}×</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{tt("akAyetiniSec")}</span>
            <div className="ml-auto flex items-center gap-1.5">
              {/* 🎯 Akıllı AI — ayetin duygu/kelime ipuçlarından ayet + uyumlu arka plan tek tuşla */}
              <button
                type="button"
                onClick={akilliAyetSec}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                title={tt("akAkilliSecim")}
              >
                <Wand2 size={11} /> {tt("akAkilliAI")}
              </button>
              <button
                type="button"
                onClick={shuffleAyet}
                className="flex items-center gap-1.5 rounded-lg glass-soft px-2.5 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:text-white active:scale-95"
                title={tt("akRastgeleTitle")}
              >
                <Sparkles size={11} style={{ color: "var(--accent)" }} /> {tt("akRastgele")}
              </button>
            </div>
          </div>

          {/* Günün Ayeti — tek tıkla kartı doldur */}
          <button
            type="button"
            onClick={() => { setSadeceGunun(false); setAyetId(gununAyetiObj.id); }}
            className="mb-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition hover:brightness-110"
            style={{ borderColor: "rgba(215,170,82,.45)", background: "linear-gradient(135deg,rgba(215,170,82,.12),rgba(215,170,82,.04))" }}
          >
            <span className="text-lg">⭐</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-black" style={{ color: "var(--accent-2)" }}>{tt("akGununAyeti")}</span>
              <span className="block truncate text-[9px] text-white/50">{gununAyetiObj.title} · {gununAyetiObj.source}</span>
            </span>
            <span className="shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>Karta Al</span>
          </button>

          {/* Duygu filtreleri */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {AYET_MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMood(m.id); setSadeceGunun(false); }}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${mood === m.id && !sadeceGunun ? "text-black shadow-md" : "glass-soft text-white/55 hover:text-white"}`}
                style={mood === m.id && !sadeceGunun ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                {m.emoji} {m.id === "tumu" ? tt("akTumu") : moodEtiketi(m.id)}
              </button>
            ))}
          </div>

          {/* Sure filtresi + arama satırı */}
          <div className="mb-2 flex gap-2">
            <select
              value={sureFiltre === "tumu" ? "" : String(sureFiltre)}
              onChange={(e) => { setSureFiltre(e.target.value ? Number(e.target.value) : "tumu"); setSadeceGunun(false); }}
              className="glass-soft shrink-0 rounded-xl px-2 py-2.5 text-[10px] font-bold text-white/80 outline-none"
              title={tt("akSureFiltreTitle")}
            >
              <option value="">📖 {tt("akTumSureler")}</option>
              {SURE_ADLARI.map((ad, i) => (
                <option key={ad} value={i + 1}>{i + 1}. {ad}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={ayetSearch}
                onChange={(e) => setAyetSearch(e.target.value)}
                placeholder={tt("akAyetAra")}
                className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Ayet listesi */}
          <div className="scrollbar-thin max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
            {filteredAyets.slice(0, ayetVisibleCount).map((a) => {
              const active = a.id === ayetId;
              const mc = MOOD_COLORS[a.mood];
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAyetId(a.id)}
                  className={`block w-full rounded-xl border p-3 text-left transition ${active ? "border-[color:var(--accent)] bg-white/[.06] ring-1 ring-[color:var(--accent)]" : "border-white/10 bg-white/[.02] hover:border-white/25 hover:bg-white/[.04]"}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full px-1.5 py-0.5 text-[7.5px] font-black tracking-wide" style={{ background: `${mc}22`, color: mc, border: `1px solid ${mc}44` }}>
                      {AYET_MOODS.find((m) => m.id === a.mood) ? moodEtiketi(a.mood) : ""}
                    </span>
                    <span className="text-[10px] font-bold text-white/85">{a.title}</span>
                    <span className="ml-auto text-[8.5px] font-semibold text-white/40">{a.source}</span>
                    {active && <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-black"><Check size={10} strokeWidth={3} /></span>}
                  </div>
                  <p className="text-right font-arabic text-[15px] leading-relaxed" style={{ color: "var(--accent-2)" }}>{a.ar.split("\n")[0]}{a.ar.includes("\n") ? " …" : ""}</p>
                  <p className="mt-1 text-[9.5px] leading-relaxed text-white/55">"{a.tr.length > 90 ? `${a.tr.slice(0, 90)}…` : a.tr}"</p>
                </button>
              );
            })}
            {ayetVisibleCount < filteredAyets.length && (
              <button type="button" onClick={() => setAyetVisibleCount((v) => v + 40)} className="block w-full rounded-xl border border-white/10 bg-white/[.03] py-2 text-[10px] font-bold text-white/55 transition hover:border-white/25 hover:text-white">
                Daha fazla göster ({filteredAyets.length - ayetVisibleCount} ayet daha)
              </button>
            )}
            {filteredAyets.length === 0 && (
              <p className="py-6 text-center text-[11px] text-white/40">{tt("akBulunamadi")}</p>
            )}
          </div>
        </div>
  );
};

// ─── SAĞ: KART ÖNİZLEME + AYARLAR + İNDİR ──────────────────

export const KartOnizlemeBolumu: React.FC<{
  previewRef: React.RefObject<HTMLCanvasElement | null>;
  size: "45" | "11" | "916";
  setSize: (s: "45" | "11" | "916") => void;
  bg: BgItem | null;
  downloading: boolean;
  download: (kind: "45" | "11" | "916") => void;
  ayar: KartAyarlari;
  setAyar: React.Dispatch<React.SetStateAction<KartAyarlari>>;
  ayarlariGoster: boolean;
  setAyarlariGoster: React.Dispatch<React.SetStateAction<boolean>>;
  kendiFoto: HTMLImageElement | null;
  kendiFotoAd: string;
  setKendiFoto: (img: HTMLImageElement | null) => void;
  setKendiFotoAd: (ad: string) => void;
  bgId: string;
  setBgId: (id: string) => void;
  fotoYukle: (file: File | undefined | null) => void;
  hatPaletiAcik: boolean;
  hatKilitTiklandi: () => void;
  /** ★ i18n (02.10): indirme butonu + başlıklar seçili dilde */
  lang?: Lang;
}> = ({ previewRef, size, setSize, bg, downloading, download, ayar, setAyar, ayarlariGoster, setAyarlariGoster, kendiFoto, kendiFotoAd, setKendiFoto, setKendiFotoAd, bgId, setBgId, fotoYukle, hatPaletiAcik, hatKilitTiklandi, lang = "tr" }) => {
  const tt = (k: string): string => translate(lang, k);
  const dim = size === "45" ? "1080 × 1350" : size === "916" ? "1080 × 1920" : "1080 × 1080";
  const mesajRenkDonme = hexToHue(ayar.mesaj.renk || "#ffffff");
  return (
    <div className="order-1 lg:order-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{tt("akKartin")}</span>
          </div>
          <div className="glass-soft rounded-2xl p-2.5">
            <canvas
              ref={previewRef}
              className="block w-full rounded-xl"
              style={{ aspectRatio: size === "45" ? "4 / 5" : size === "916" ? "9 / 16" : "1 / 1" }}
            />
            <div className="mt-2 flex items-center justify-between px-0.5">
              <span className="flex min-w-0 items-center gap-1 text-[8.5px] font-semibold text-white/45" title={bg ? `${bg.label} · ${catLabel(bg.cat)}` : "Gradyan arka plan"}>
                <ImageIcon size={10} style={{ color: "var(--accent)" }} />
                <span className="truncate">{bg ? catLabel(bg.cat) : "Gradyan"}</span>
              </span>
              <span className="shrink-0 text-[8.5px] font-bold tabular-nums text-white/40">{dim}</span>
            </div>

            {/* ★ KART AYARLARI — karartma, yazı boyutu, sıra, konum, hizalama */}
            <button
              type="button"
              onClick={() => setAyarlariGoster((v) => !v)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg glass-soft py-1.5 text-[9px] font-bold text-white/60 transition hover:text-white"
            >
              <Wand2 size={11} style={{ color: "var(--accent)" }} /> {tt("akKartAyarlari")} {ayarlariGoster ? "▲" : "▼"}
            </button>

            {ayarlariGoster && (
              <div className="mt-2 space-y-2.5 rounded-xl border border-white/10 bg-black/30 p-2.5">
                {/* Karartma */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[9px] font-bold text-white/60">
                    <span className="flex items-center gap-1"><Moon size={10} style={{ color: "var(--accent)" }} /> {tt("akKarartma")}</span>
                    <span className="tabular-nums text-white/40">{ayar.karartma}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={ayar.karartma}
                    onChange={(e) => setAyar((a) => ({ ...a, karartma: Number(e.target.value) }))}
                    className="w-full accent-[color:var(--accent)]" style={{ height: 4 }} />
                </div>

                {/* Yazı boyutu */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[9px] font-bold text-white/60">
                    <span className="flex items-center gap-1"><Type size={10} style={{ color: "var(--accent)" }} /> {tt("akYaziBoyutu")}</span>
                    <span className="tabular-nums text-white/40">{ayar.yaziOlcek}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAyar((a) => ({ ...a, yaziOlcek: Math.max(70, a.yaziOlcek - 5) }))}
                      className="glass-soft h-6 w-8 rounded-md text-[11px] font-black text-white/70 transition hover:text-white">−</button>
                    <input type="range" min={70} max={140} step={5} value={ayar.yaziOlcek}
                      onChange={(e) => setAyar((a) => ({ ...a, yaziOlcek: Number(e.target.value) }))}
                      className="flex-1 accent-[color:var(--accent)]" style={{ height: 4 }} />
                    <button type="button" onClick={() => setAyar((a) => ({ ...a, yaziOlcek: Math.min(140, a.yaziOlcek + 5) }))}
                      className="glass-soft h-6 w-8 rounded-md text-[11px] font-black text-white/70 transition hover:text-white">+</button>
                  </div>
                </div>

                {/* ★ RENK ÇUBUĞU (01.10) — Arapça + meal ayrı renk; stüdyo ile aynı çekirdek */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="flex items-center gap-1 text-[8.5px] font-bold text-white/50"><Palette size={9} style={{ color: "var(--accent)" }} /> {tt("akRenkCubugu")}</p>
                    <button type="button" onClick={() => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, acik: !a.cubuk.acik } }))}
                      className={`h-5 w-9 rounded-full text-[7px] font-black transition ${ayar.cubuk.acik ? "text-black" : "glass-soft text-white/50"}`}
                      style={ayar.cubuk.acik ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                      {ayar.cubuk.acik ? tt("akAcik") : tt("akKapali")}
                    </button>
                  </div>
                  {ayar.cubuk.acik && (
                    <>
                    <div className="flex items-start justify-center gap-4">
                      <CubukRenkSecici boy="kucuk" etiket={tt("akArapca")} deger={ayar.cubuk.donme} onSec={(d) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, donme: d } }))} />
                      <CubukRenkSecici boy="kucuk" etiket={tt("hafizlikMealEtiket")} deger={ayar.cubuk.mealDonme} onSec={(d) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, mealDonme: d } }))} />
                      {/* ★ ÇERÇEVE RENGİ (03.10): gökkuşağı kaydırıcısı — Arapça/Meal'den bağımsız; düz renkler altta */}
                      <CubukRenkSecici boy="kucuk" etiket={tt("akCerceve")} deger={ayar.cubuk.cerceveDonme ?? 0} onSec={(d) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, cerceveModu: "gokkusagi", cerceveDonme: d } }))} />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-white/50">{tt("akSerit")}</span>
                        <button type="button" onClick={() => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, kalinlik: a.cubuk.kalinlik > 0 ? 0 : 6 } }))}
                          className={`h-5 w-9 rounded-full text-[7px] font-black transition ${ayar.cubuk.kalinlik > 0 ? "text-black" : "glass-soft text-white/50"}`}
                          style={ayar.cubuk.kalinlik > 0 ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
                          title={tt("akSeritTitle")}>
                          {ayar.cubuk.kalinlik > 0 ? tt("akAcik") : tt("akYok")}
                        </button>
                        {ayar.cubuk.kalinlik > 0 && (
                          <input type="range" min={2} max={14} value={ayar.cubuk.kalinlik} onChange={(e) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, kalinlik: Number(e.target.value) } }))} className="mt-1 h-1 w-10 accent-[color:var(--accent)]" title={tt("akSeritKalinlik")} />
                        )}
                      </div>
                    </div>
                    {/* ★ DÜZ RENK ŞERİDİ (03.10): tek renk çerçeve — Siyah varsayılan ("çerçeve siyahda olsun") */}
                    {ayar.cubuk.kalinlik > 0 && (
                      <div className="pt-0.5">
                        <CerceveDuzRenkleri aktifDuz={(ayar.cubuk.cerceveModu ?? "gokkusagi") === "duz" ? (ayar.cubuk.cerceveDuz || "#000000") : undefined}
                          onSec={(renk) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, cerceveModu: "duz", cerceveDuz: renk } }))} />
                      </div>
                    )}
                    </>
                  )}
                </div>

                {/* ★ ÖZEL YAZI (01.10) — kartın içine çizilen mesaj; ayrı konum */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="flex items-center gap-1 text-[8.5px] font-bold text-white/50"><PenLine size={9} style={{ color: "var(--accent)" }} /> {tt("akOzelYazi")}</p>
                    <button type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, acik: !a.mesaj.acik } }))}
                      className={`h-5 w-9 rounded-full text-[7px] font-black transition ${ayar.mesaj.acik ? "text-black" : "glass-soft text-white/50"}`}
                      style={ayar.mesaj.acik ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                      {ayar.mesaj.acik ? tt("akAcik") : tt("akKapali")}
                    </button>
                  </div>
                  {ayar.mesaj.acik && (
                    <div className="space-y-1.5">
                      <textarea value={ayar.mesaj.metin} onChange={(e) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, metin: e.target.value.slice(0, 90), acik: true } }))} rows={2}
                        placeholder={tt("akMesajPlaceholder")}
                        className="glass-soft w-full resize-none rounded-md px-2 py-1.5 text-[9.5px] text-white/90 outline-none placeholder:text-white/25" />

                      {/* ★ HAT FONTU — temel stil herkese, palet PRO+ (HatFontuSeridi ortak bileşen) */}
                      <HatFontuSeridi
                        boy="kucuk"
                        seciliHatCss={ayar.mesaj.hatCss}
                        onSec={(hatCss, hatAgirlik) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, hatCss, hatAgirlik } }))}
                        proAcik={hatPaletiAcik}
                        kilitTiklandi={hatKilitTiklandi}
                      />

                      {/* ★ RENK — çubuktan (stüdyo ile aynı 6 duraklı palet) */}
                      <div className="flex items-center gap-2">
                        <CubukRenkSecici boy="kucuk" etiket="Renk" deger={mesajRenkDonme} onSec={(d) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, renk: cubukRengi(d) } }))} />
                        <div className="flex flex-1 flex-wrap gap-1">
                          {["#ffffff", "#f5dda6", cubukRengi(0), cubukRengi(120), cubukRengi(180), cubukRengi(240), cubukRengi(300)].map((r) => (
                            <button key={r} type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, renk: r } }))}
                              className={`h-5 w-5 rounded-full border transition ${ayar.mesaj.renk === r ? "ring-2 ring-white/80" : "border-white/30 hover:border-white/60"}`}
                              style={{ background: r }} title={r} />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-0.5">
                        {(["ust", "orta", "alt"] as const).map((k) => (
                          <button key={k} type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, konum: k } }))}
                            className={`rounded-md py-1 text-[8px] font-black transition ${ayar.mesaj.konum === k ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                            style={ayar.mesaj.konum === k ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                            {k === "ust" ? tt("akUst") : k === "orta" ? tt("akOrta") : tt("akAlt")}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        <button type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, ofset: { ...a.mesaj.ofset, x: Math.max(-40, a.mesaj.ofset.x - 5) } } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">◀</button>
                        <button type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, ofset: { ...a.mesaj.ofset, x: Math.min(40, a.mesaj.ofset.x + 5) } } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">▶</button>
                        <button type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, ofset: { ...a.mesaj.ofset, y: Math.max(-40, a.mesaj.ofset.y - 5) } } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">▲</button>
                        <button type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, ofset: { ...a.mesaj.ofset, y: Math.min(40, a.mesaj.ofset.y + 5) } } }))} className="glass-soft rounded-md py-1 text-[9px] text-white/70 hover:text-white">▼</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-bold text-white/50">Boyut</span>
                        <input type="range" min={70} max={160} step={5} value={ayar.mesaj.olcek} onChange={(e) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, olcek: Number(e.target.value) } }))} className="h-1 flex-1 accent-[color:var(--accent)]" />
                        <span className="w-8 text-right text-[8px] tabular-nums text-white/40">{ayar.mesaj.olcek}%</span>
                      </div>
                      {/* ★ IŞILTI — yazının arkasına kendi rengiyle hale */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[8.5px] font-bold text-white/50"><IsiltiIcon size={9} style={{ color: "var(--accent)" }} /> {tt("akIsilti")}</span>
                        <input type="range" min={0} max={2} step={0.25} value={ayar.mesaj.isilti} onChange={(e) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, isilti: Number(e.target.value) } }))} className="h-1 flex-1 accent-[color:var(--accent)]" />
                        <span className="w-8 text-right text-[8px] tabular-nums text-white/40">{ayar.mesaj.isilti}×</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sıra + Konum + Hizalama */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-[8.5px] font-bold text-white/50"><ArrowUpDown size={9} /> {tt("akSira")}</p>
                    <button type="button"
                      onClick={() => setAyar((a) => ({ ...a, arUstte: !a.arUstte }))}
                      className="w-full rounded-lg glass-soft py-1.5 text-[9px] font-bold text-white/75 transition hover:text-white">
                      {ayar.arUstte ? tt("akKuranUstte") : tt("akMealUstte")}
                    </button>
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-[8.5px] font-bold text-white/50"><ChevronsDown size={9} /> Konum</p>
                    <div className="grid grid-cols-3 gap-0.5">
                      {(["ust", "orta", "alt"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => setAyar((a) => ({ ...a, konum: k }))}
                          className={`rounded-md py-1.5 text-[8px] font-black transition ${ayar.konum === k ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                          style={ayar.konum === k ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                          {k === "ust" ? "↑" : k === "orta" ? "↕" : "↓"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-[8.5px] font-bold text-white/50"><AlignCenter size={9} /> Hizalama</p>
                    <div className="grid grid-cols-3 gap-0.5">
                      <button type="button" onClick={() => setAyar((a) => ({ ...a, hizalama: "sol" }))} title="Sola yasla"
                        className={`rounded-md py-1.5 transition ${ayar.hizalama === "sol" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                        style={ayar.hizalama === "sol" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                        <AlignLeft size={10} className="mx-auto" />
                      </button>
                      <button type="button" onClick={() => setAyar((a) => ({ ...a, hizalama: "orta" }))} title="Ortala"
                        className={`rounded-md py-1.5 transition ${ayar.hizalama === "orta" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                        style={ayar.hizalama === "orta" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                        <AlignCenter size={10} className="mx-auto" />
                      </button>
                      <button type="button" onClick={() => setAyar((a) => ({ ...a, hizalama: "sag" }))} title={tt("akSagaYasla")}
                        className={`rounded-md py-1.5 transition ${ayar.hizalama === "sag" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                        style={ayar.hizalama === "sag" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                        <AlignRight size={10} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>

                <button type="button"
                  onClick={() => setAyar(VARSAYILAN_AYARLAR)}
                  className="w-full rounded-lg glass-soft py-1.5 text-[9px] font-bold text-white/50 transition hover:text-white">
                  ↺ Ayarları sıfırla
                </button>
              </div>
            )}

            {/* 📸 KENDİ FOTOĞRAFIN — foto+hat sanatı kartı (sunucuya gönderilmez) */}
            <div className="mt-3 rounded-xl border border-dashed border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[.05] p-3">
              <p className="flex items-center gap-1.5 text-[9.5px] font-black" style={{ color: "var(--accent-2)" }}>
                📸 Kendi Fotoğrafınla Hat Kartı
              </p>
              <p className="mt-0.5 text-[8.5px] leading-relaxed text-white/45">
                Fotoğrafını yükle — seçtiğin ayet altın hat yazısıyla üzerine işlenir. Fotoğraf cihazından çıkmaz.
              </p>
              {kendiFoto ? (
                <div className="mt-2 flex items-center gap-2">
                  <img src={kendiFoto.src} alt="Yüklenen fotoğraf" className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-bold text-white/80">{kendiFotoAd || tt("akFotografYuklendi")}</p>
                    <p className="text-[8px] text-emerald-300">{tt("akFotografSecildi")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setKendiFoto(null); setKendiFotoAd(""); if (bgId === "kendi-foto") setBgId(""); }}
                    className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[8.5px] font-bold text-white/60 hover:bg-white/20"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                  <Upload size={12} /> Fotoğraf Yükle
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { fotoYukle(e.target.files?.[0]); e.currentTarget.value = ""; }} />
                </label>
              )}
            </div>

            {/* Boyut seçici — ★ 9:16 WhatsApp Durum / Reels boyutu eklendi (madde 32) */}
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSize("45")}
                className={`rounded-lg py-1.5 text-[9px] font-bold transition ${size === "45" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={size === "45" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                4:5 · Gönderi
              </button>
              <button
                type="button"
                onClick={() => setSize("11")}
                className={`rounded-lg py-1.5 text-[9px] font-bold transition ${size === "11" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={size === "11" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                1:1 · Kare
              </button>
              <button
                type="button"
                onClick={() => setSize("916")}
                className={`rounded-lg py-1.5 text-[9px] font-bold transition ${size === "916" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={size === "916" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                9:16 · Durum 📱
              </button>
            </div>

            {/* İNDİR */}
            <button
              type="button"
              onClick={() => download(size)}
              disabled={downloading}
              className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.97] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {downloading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              ) : (
                <Download size={13} strokeWidth={2.5} />
              )}
              {downloading ? tt("akIndirBtnHazirlaniyor") : tt("akIndirBtn")}
            </button>
          </div>
        </div>
  );
};

// ─── ALTTA: ARKA PLAN GALERİSİ ─────────────────────────────

export const ArkaPlanGalerisi: React.FC<{
  bgSearch: string;
  setBgSearch: (v: string) => void;
  bgCat: string;
  setBgCat: (v: string) => void;
  filteredBgs: BgItem[];
  visibleCount: number;
  bgId: string;
  setBgId: (id: string) => void;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  akilliSec: () => void;
  shuffleBg: () => void;
  lang?: Lang;
}> = ({ bgSearch, setBgSearch, bgCat, setBgCat, filteredBgs, visibleCount, bgId, setBgId, loadMoreRef, akilliSec, shuffleBg, lang = "tr" }) => {
  const tt = (k: string): string => translate(lang, k);
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{tt("akAdim2")}</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-white/45">{BACKGROUNDS.length.toLocaleString("tr-TR")} hazır · {BG_CATS.length} kategori</span>
          <div className="ml-auto flex items-center gap-1.5">
            {/* 🎯 Akıllı Seç — ayet + uyumlu arka plan tek tuşla */}
            <button
              type="button"
              onClick={akilliSec}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              title={tt("akAkilliSecim")}
            >
              <Wand2 size={11} /> Akıllı Seç
            </button>
            <button
              type="button"
              onClick={shuffleBg}
              className="flex items-center gap-1.5 rounded-lg glass-soft px-2.5 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:text-white active:scale-95"
              title={tt("akRastgeleBg")}
            >
              <Shuffle size={11} style={{ color: "var(--accent)" }} /> Karıştır
            </button>
          </div>
        </div>

        {/* Arama — pill kalabalığı yerine: yazınca kategoriden süzer */}
        <div className="relative mb-2.5">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={bgSearch}
            onChange={(e) => setBgSearch(e.target.value)}
            placeholder={tt("akBgAra")}
            className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-24 text-[11px] outline-none placeholder:text-white/30"
          />
          {/* Kategori sayısı çok olduğu için dropdown'a taşındı */}
          <select
            value={bgCat}
            onChange={(e) => setBgCat(e.target.value)}
            className="glass-soft absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-[9.5px] font-bold text-white/75 outline-none"
            title="Kategoriye göre süz"
          >
            <option value="all">{tt("akTumu")}</option>
            {BG_CATS.map((cat) => (
              <option key={cat} value={cat}>{catLabel(cat)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {filteredBgs.slice(0, visibleCount).map((item) => {
            const active = item.id === bgId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setBgId(item.id)}
                className={`group relative aspect-square overflow-hidden rounded-xl border transition ${active ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]" : "border-white/10 hover:border-white/35"}`}
                title={`${item.label} · ${catLabel(item.cat)}`}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-3 text-left text-[7.5px] font-bold text-white/90">
                  {catLabel(item.cat)}
                </span>
                {active && (
                  <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--accent)] text-black">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {visibleCount < filteredBgs.length && (
          <div ref={loadMoreRef} className="flex h-10 items-center justify-center gap-2 text-[10px] font-bold text-white/35">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            Daha fazla arka plan yükleniyor…
          </div>
        )}
        {filteredBgs.length === 0 && (
          <p className="py-6 text-center text-[11px] text-white/40">{tt("akBgBulunamadi")}</p>
        )}
      </div>
  );
};
