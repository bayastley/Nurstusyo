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
              <span className="flex min-w-0 items-center gap-1 text-[8.5px] font-semibold text-white/45" title={bg ? `${bg.label} · ${catLabel(bg.cat)}` : tt("akGradyanArkaPlan")}>
                <ImageIcon size={10} style={{ color: "var(--accent)" }} />
                <span className="truncate">{bg ? catLabel(bg.cat) : tt("akGradyan")}</span>
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
                {tt("akFotoHatBaslik")}
              </p>
              <p className="mt-0.5 text-[8.5px] leading-relaxed text-white/45">
                {tt("akFotoHatAciklama")}
              </p>
              {kendiFoto ? (
                <div className="mt-2 flex items-center gap-2">
                  <img src={kendiFoto.src} alt={tt("akYuklenenFotograf")} className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-bold text-white/80">{kendiFotoAd || tt("akFotografYuklendi")}</p>
                    <p className="text-[8px] text-emerald-300">{tt("akFotografSecildi")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setKendiFoto(null); setKendiFotoAd(""); if (bgId === "kendi-foto") setBgId(""); }}
                    className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[8.5px] font-bold text-white/60 hover:bg-white/20"
                  >
                    {tt("akFotoKaldirBtn")}
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                  <Upload size={12} /> {tt("akFotoYukleBtn")}
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
                {tt("akBoyutGonderi")}
              </button>
              <button
                type="button"
                onClick={() => setSize("11")}
                className={`rounded-lg py-1.5 text-[9px] font-bold transition ${size === "11" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={size === "11" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                {tt("akBoyutKare")}
              </button>
              <button
                type="button"
                onClick={() => setSize("916")}
                className={`rounded-lg py-1.5 text-[9px] font-bold transition ${size === "916" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={size === "916" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                {tt("akBoyutDurum")}
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
