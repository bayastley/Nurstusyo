// ════════════════════════════════════════════════════════
// AYETKARTBOLUMLERI.TSX — AyetKartlariModal'dan ayrıldı (SRP, 01.10)
// Üç self-contained bölüm: SOL ayet seçimi · SAĞ kart önizleme+ayarlar ·
// altta arka plan galerisi. JSX birebir korunur; state modal'da kalır,
// bölümler saf görünüm + callback alır.
// ════════════════════════════════════════════════════════

import React, { useState } from "react";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
import { Brain, Check, Download, Heart, Search, Sparkles, Image as ImageIcon, Moon, Type, Wand2, ArrowUpDown, AlignLeft, AlignCenter, AlignRight, ChevronsDown, Upload, Shuffle, Palette, PenLine, Sparkles as IsiltiIcon } from "lucide-react";
import { AYET_MOODS, SURE_ADLARI, type AyetKarti } from "../../data/ayetKartlariData";
import { ayetBasligi } from "../../data/ayetBaslikCokDil"; // ★ 06.10: 575 başlık × 4 dil — liste + günün ayeti başlığı dilli
import { RUH_HALLERI, ruhSayacOku, ruhSayacArttir, cipSirasi, ruhHaliAd, type RuhSayac } from "../../data/ruhHalleri";
import { translate, type Lang } from "../../i18n";
import { BACKGROUNDS, catLabel, BG_CATS, MOOD_COLORS, type BgItem, type KartAyarlari, VARSAYILAN_AYARLAR } from "../ayetKartMotoru";
import { CubukRenkSecici, CerceveDuzRenkleri } from "../renkCubuguSecici";
import { HatFontuSeridi } from "../hatFontuSeridi";
import { cubukRengi, hexToHue } from "../../studio/mesajKatmani";
// ★ 04.10 TUR 6: title/tooltip kalıntıları LS bazlı tt (translate yukarıda importlu)
const ttLS = (k: string): string => translate(localStorage.getItem("nur_lang"), k);

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
  /** ★ 20.10 ELİT KİLİDİ (kullanıcı emri): Akıllı AI sadece elit — elite değilse
   *  Premium/uyelik sayfası açılır; admin/master muaf (elitIzin=true gelir). */
  akilliElitIzin?: boolean;
  akilliPremiumAc?: () => void;
  /** ★ AI RUH HALİ (01.10): serbest metin / çip → ayet + arka plan + kart ayarları */
  ruhHaliMetin: string;
  setRuhHaliMetin: (v: string) => void;
  ruhHaliUygula: (ruhId?: string) => void;
  /** ★ i18n (02.10): bölüm metinleri + çip adları seçili dilde */
  lang?: Lang;
  /** ★ 04.10 TUR 4: kart mealı/kaynağı seçili dilde (yoksa kartın TR verisi) */
  mealCevir?: (k: AyetKarti) => string;
  kaynakCevir?: (k: AyetKarti) => string;
  /** ★ 25.10 TÜM KUR'AN (sahibin emri: 6236 ayetin TAMAMI) — sure+ayet seç → karta aktar */
  tkSure?: number;
  setTkSure?: (v: number) => void;
  tkAyet?: number;
  setTkAyet?: (v: number) => void;
  tkSureAyetSayisi?: number;
  tkYukleniyor?: boolean;
  /** ★ 02.11 TAM KUR'AN: sure tam listesi / tüm-Kur'an arama yükleme göstergesi */
  tamKuranYuk?: boolean;
  tkAktar?: () => void;
  /** ★ 02.11 KARTLARIM ALBÜMÜ: favori filtre çipi + satır kalp düğmesi */
  sadeceFavori?: boolean;
  setSadeceFavori?: (v: boolean) => void;
  favoriIds?: Set<string>;
  onFavoriTak?: (id: string) => void;
}> = ({ sadeceFavori, setSadeceFavori, favoriIds, onFavoriTak, filteredAyets, ayetId, setAyetId, ayetVisibleCount, setAyetVisibleCount, mood, setMood, sadeceGunun, setSadeceGunun, sureFiltre, setSureFiltre, ayetSearch, setAyetSearch, gununAyetiObj, shuffleAyet, akilliAyetSec, akilliElitIzin = true, akilliPremiumAc, ruhHaliMetin, setRuhHaliMetin, ruhHaliUygula, lang = "tr", mealCevir, kaynakCevir, tkSure, setTkSure, tkAyet, setTkAyet, tkSureAyetSayisi, tkYukleniyor, tkAktar, tamKuranYuk = false }) => {
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
  // ★ 04.10 TUR 4: meal/kaynak görünümleri — çevirici verilmediyse kartın TR verisi
  const mealGorunum = mealCevir ?? ((k: AyetKarti) => k.tr);
  const kaynakGorunum = kaynakCevir ?? ((k: AyetKarti) => k.source);
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

          {/* ★ 25.10 TÜM KUR'AN — sure + ayet seç, meal API'den gelir, anında kart kurulur */}
          {tkSure !== undefined && tkAktar && (
            <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.03] p-2">
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/45">🌐 {tt("akTumKuran")}</span>
              <select
                value={tkSure}
                onChange={(e) => { setTkSure?.(Number(e.target.value)); setTkAyet?.(1); }}
                className="glass-soft min-w-0 flex-1 rounded-lg px-2 py-1.5 text-[9.5px] outline-none"
              >
                {SURE_ADLARI.map((ad, i) => (
                  <option key={i + 1} value={i + 1} className="bg-neutral-900">{i + 1}. {ad}</option>
                ))}
              </select>
              <select
                value={tkAyet}
                onChange={(e) => setTkAyet?.(Number(e.target.value))}
                className="glass-soft w-[64px] shrink-0 rounded-lg px-2 py-1.5 text-[9.5px] outline-none"
              >
                {Array.from({ length: tkSureAyetSayisi ?? 286 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} className="bg-neutral-900">{n}. ayet</option>
                ))}
              </select>
              <button
                type="button"
                onClick={tkAktar}
                disabled={tkYukleniyor}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-black text-black transition hover:brightness-110 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                {tkYukleniyor ? tt("akTumKuranYukleniyor") : `+ ${tt("akTumKuranGet")}`}
              </button>
            </div>
          )}

          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{tt("akAyetiniSec")}</span>
            <div className="ml-auto flex items-center gap-1.5">
              {/* 🎯 Akıllı AI — ayetin duygu/kelime ipuçlarından ayet + uyumlu arka plan tek tuşla
                  ★ 20.10: ELİT kilidi — elite değilse Premium üyelik sayfası açılır */}
              <button
                type="button"
                onClick={() => {
                  if (!akilliElitIzin) { if (akilliPremiumAc) akilliPremiumAc(); return; }
                  akilliAyetSec();
                }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                title={akilliElitIzin ? tt("akAkilliSecim") : "Akıllı AI · ELİT üyelik özelliği — tıkla, Elite yüksel"}
              >
                <Wand2 size={11} /> {tt("akAkilliAI")}{!akilliElitIzin && <span className="rounded bg-black/25 px-1 py-px text-[7px] font-black">{tt("tierElit")}</span>}
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
              <span className="block truncate text-[9px] text-white/50">{ayetBasligi(lang, gununAyetiObj.title)} · {kaynakGorunum(gununAyetiObj)}</span>
            </span>
            <span className="shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{tt("akKartaAl")}</span>
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

                      {setSadeceFavori && (
              <button
                type="button"
                data-minitur="kart-favori-filtre"
                onClick={() => { setSadeceFavori(!sadeceFavori); setSadeceGunun(false); }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold transition ${sadeceFavori ? "text-rose-200 border border-rose-400/50 bg-rose-400/15" : "glass-soft text-white/55 hover:text-white"}`}
              >
                <Heart size={10} fill={sadeceFavori ? "currentColor" : "none"} /> {tt("akKartlarim").replace("{n}", String(favoriIds?.size ?? 0))}
              </button>
            )}

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
            {tamKuranYuk && (
              <p className="border border-[color:var(--accent)]/25 rounded-xl bg-white/[.03] py-2 text-center text-[10px] font-bold" style={{ color: "var(--accent-2)" }}>🌐 {tt("akTumKuranYuk")}</p>
            )}
            {filteredAyets.slice(0, ayetVisibleCount).map((a) => {
              const active = a.id === ayetId;
              const mc = MOOD_COLORS[a.mood];
              const dyn = /^kuran-(\d+)-(\d+)$/.exec(a.id); // ★ 02.11 dinamik tamamı-Kur'an satırı
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAyetId(a.id)}
                  className={`block w-full rounded-xl border p-3 text-left transition ${active ? "border-[color:var(--accent)] bg-white/[.06] ring-1 ring-[color:var(--accent)]" : "border-white/10 bg-white/[.02] hover:border-white/25 hover:bg-white/[.04]"}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    {dyn ? (
                      <span className="rounded-full px-1.5 py-0.5 text-[7.5px] font-black tabular-nums" style={{ background: "rgba(215,170,82,.12)", color: "var(--accent-2)", border: "1px solid rgba(215,170,82,.4)" }}>🌐 {dyn[1]}:{dyn[2]}</span>
                    ) : (
                      <span className="rounded-full px-1.5 py-0.5 text-[7.5px] font-black tracking-wide" style={{ background: `${mc}22`, color: mc, border: `1px solid ${mc}44` }}>
                        {AYET_MOODS.find((m) => m.id === a.mood) ? moodEtiketi(a.mood) : ""}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-white/85">{ayetBasligi(lang, a.title)}</span>
                    <span className="ml-auto text-[8.5px] font-semibold text-white/40">{kaynakGorunum(a)}</span>
                    {onFavoriTak && (
                      <span
                        role="button"
                        data-minitur="kart-favori"
                        title={favoriIds?.has(a.id) ? tt("akKartFavoriCikar") : tt("akKartFavoriEkle")}
                        onClick={(e) => { e.stopPropagation(); onFavoriTak(a.id); }}
                        className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full transition ${favoriIds?.has(a.id) ? "text-rose-400" : "text-white/30 hover:text-rose-300"}`}
                      >
                        <Heart size={11} fill={favoriIds?.has(a.id) ? "currentColor" : "none"} />
                      </span>
                    )}
                    {active && <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-black"><Check size={10} strokeWidth={3} /></span>}
                  </div>
                  <p className="text-right font-arabic text-[15px] leading-relaxed" style={{ color: "var(--accent-2)" }}>{a.ar.split("\n")[0]}{a.ar.includes("\n") ? " …" : ""}</p>
                  <p className="mt-1 text-[9.5px] leading-relaxed text-white/55">{(() => { const m = mealGorunum(a); return `"${m.length > 90 ? `${m.slice(0, 90)}…` : m}"`; })()}</p>
                </button>
              );
            })}
            {ayetVisibleCount < filteredAyets.length && (
              <button type="button" onClick={() => setAyetVisibleCount((v) => v + 40)} className="block w-full rounded-xl border border-white/10 bg-white/[.03] py-2 text-[10px] font-bold text-white/55 transition hover:border-white/25 hover:text-white">
                {tt("akDahaFazla").replace("{n}", String(filteredAyets.length - ayetVisibleCount))}
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
