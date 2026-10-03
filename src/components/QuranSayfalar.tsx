// ══════════════════════════════════════════════════════════════
// QURANSAYFALAR.TSX — Kur'an Sayfaları (mushaf) okuma bölümü
// Kullanıcı emri (02.10): sayfa sayfa Kral Fahd mushafı —
//   • +/− düğmeleri ve ÇİFT TIK ile büyüt/küçült, Ctrl+tekerlek de destekli
//   • tam ekran / yarım ekran (ESC ile tam ekrandan çıkış tarayıcıdan gelir)
//   • sure adı + sayfa no + cüz göstergesi
//   • "kaldığın yerden devam" + hatim takibi (localStorage, dürüst: sayfa
//     kendiliğinden işaretlenmez — kullanıcı "✓ Okudum" ile işaretler)
// Görüntü: KFGQPC Hafs SVG sayfalar (cdn.quran.ws → jsDelivr yedek) — quranSayfaVeri.ts
// SVG = vektör: ne kadar büyütürsen o kadar net kalır, mobilde de hafif.
// ══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Minus, Plus, Maximize2, Minimize2,
  RotateCcw, Loader2, MapPin, Check,
} from "lucide-react";
import {
  SAYFA_SAYISI, sayfaSvgKaynaklari, sayfaRasterMi, cuzBul, sayfadaBaslayanSureler, aktifSureNo,
  hatimYukle, hatimKaydet, sonSayfaYukle, sonSayfaKaydet, type HatimKaydi,
} from "../data/quranSayfaVeri";
import { sevapEkle, kelimeSayisi } from "../data/sevapSayaci"; // ★ madde 4: dürüst harf sayacı
import { SURAHS_DATA } from "./quranLearnVeri";

const Z_MIN = 0.5;
const Z_MAX = 3;
// zoom adımı 0.2 — 0.1'lik adım çift tık geçişinde hissedilmiyor
const adimla = (z: number, yon: number) => Math.min(Z_MAX, Math.max(Z_MIN, Math.round((z + yon * 0.2) * 10) / 10));

interface Props { open: boolean; onClose: () => void; }

export const QuranSayfalar: React.FC<Props> = ({ open, onClose }) => {
  // ★ LAZY BAŞLANGIÇ (02.10): LS mount anında SENKRON okunur — StrictMode çift-effect
  //   veya "open=true ile mount" durumunda boş başlangıç değeri kaydı EZEMEZ (idempotent).
  const [sayfa, setSayfa] = useState(() => sonSayfaYukle());
  const [kayitliSayfa, setKayitliSayfa] = useState(() => sonSayfaYukle()); // açılıştaki kayıt — "devam" çipi için
  const [zoom, setZoom] = useState(1);
  const [tamEkran, setTamEkran] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);
  const [kaynakIdx, setKaynakIdx] = useState(0); // hangi CDN kaynağı deneniyor
  const [imgKey, setImgKey] = useState(0);       // "tekrar dene" için görüntüyü zorla yenile
  const [hatim, setHatim] = useState<HatimKaydi>(() => hatimYukle());
  const [hatimMesaji, setHatimMesaji] = useState("");
  const [sayfaGiris, setSayfaGiris] = useState("1"); // sayfa kutusunun ham metni (yazarken atlamasın)
  // ★ 03.10 (kullanıcı emri): hover'da beliren oklar + kenar tıklama navigasyonu
  const [okGorunur, setOkGorunur] = useState(false);
  const [okDonme, setOkDonme] = useState(false); // mobil/dokunmatikte oklar hep görünür
  const kokRef = useRef<HTMLDivElement>(null);
  const sahneRef = useRef<HTMLDivElement>(null);

  // ★ KALDIĞIN YERDEN DEVAM — açılınca kayıtlı sayfadan başla
  useEffect(() => {
    if (!open) return;
    const s = sonSayfaYukle();
    setSayfa(s);
    setKayitliSayfa(s);
    setSayfaGiris(String(s));
    setZoom(1);
    setHatim(hatimYukle());
    setHatimMesaji("");
    // ★ 03.10: dokunmatik cihazda hover olmaz → oklar kalıcı görünür
    try { setOkDonme(window.matchMedia("(hover: none)").matches); } catch { setOkDonme(false); }
  }, [open]);

  // Sayfa değişince: kaydı güncelle + kaynağı sıfırla + sonraki ve önceki sayfayı önden yükle
  useEffect(() => {
    if (!open) return;
    sonSayfaKaydet(sayfa);
    setSayfaGiris(String(sayfa));
    setKaynakIdx(0);
    setYukleniyor(true);
    setHata(false);
    // ★ 03.10: her iki komşu da önden yüklenir — kenar tıklaması anında açılır
    const onumuz = new Image();
    onumuz.src = sayfaSvgKaynaklari(Math.min(SAYFA_SAYISI, sayfa + 1))[0];
    const arkamiz = new Image();
    arkamiz.src = sayfaSvgKaynaklari(Math.max(1, sayfa - 1))[0];
    return () => { onumuz.src = ""; arkamiz.src = ""; };
  }, [open, sayfa]);

  // Hatim kaydı her değişimde diske yazılır
  useEffect(() => { if (open) hatimKaydet(hatim); }, [hatim, open]);

  // Tam ekran durumu senkronu (ESC ile çıkış dâhil)
  useEffect(() => {
    const f = () => setTamEkran(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);

  // ★ Ctrl+tekerlek zoom — React onWheel passive olduğu için gerçek dinleyici
  useEffect(() => {
    const el = sahneRef.current;
    if (!el || !open) return;
    const tekerlek = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => Math.min(Z_MAX, Math.max(Z_MIN, Math.round((z + (e.deltaY < 0 ? 0.1 : -0.1)) * 10) / 10)));
    };
    el.addEventListener("wheel", tekerlek, { passive: false });
    return () => el.removeEventListener("wheel", tekerlek);
  }, [open]);

  const kaynaklar = useMemo(() => sayfaSvgKaynaklari(sayfa), [sayfa]);
  const rasterMi = sayfaRasterMi(kaynaklar[kaynakIdx] || "");
  const okunanMu = hatim.okunan.includes(sayfa);
  const yuzde = Math.round((hatim.okunan.length / SAYFA_SAYISI) * 100);
  const cuz = cuzBul(sayfa);
  const aktifSure = SURAHS_DATA[aktifSureNo(sayfa) - 1];
  const sureAdi = aktifSure?.name ?? "";
  const sureTur = aktifSure?.type ?? ""; // Mekkî / Medenî — üst perdede
  const baslayanlar = sayfadaBaslayanSureler(sayfa);

  // ★ HATİM İŞARETİ — dürüst sayım: sayfa ancak kullanıcı "✓ Okudum" derse işaretlenir.
  //   604 sayfanın hepsi işaretlenince hatim sayısı artar, liste yeni hatim için sıfırlanır.
  const okudumIsaretle = () => {
    setHatimMesaji("");
    const varMi = hatim.okunan.includes(sayfa);
    const okunan = varMi ? hatim.okunan.filter((n) => n !== sayfa) : [...hatim.okunan, sayfa].sort((a, b) => a - b);
    // ★ SEVAP SAYACI (madde 4): yeni işaretlemede bu sayfanın kelime sayısı kadar harf ekle.
    //   İşaret KALDIRILIRSA harf geri ALINMAZ — okunan, okunmuştur (dürüstlük).
    if (!varMi) {
      import("../data/quranSayfaKelime").then(({ SAYFA_HARF_ORT }) => {
        sevapEkle(SAYFA_HARF_ORT);
      }).catch(() => sevapEkle(1250)); // veri yoksa mushaf sayfa ortalaması
    }
    if (!varMi && okunan.length >= SAYFA_SAYISI) {
      const yeni: HatimKaydi = { okunan: [], tamamlanan: hatim.tamamlanan + 1 };
      setHatim(yeni);
      setHatimMesaji(`🎉 HATİM TAMAMLANDI! ${yeni.tamamlanan}. hatimin mübarek olsun — kayıt tutuldu, yeni hatime hayırlı olsun.`);
      return;
    }
    setHatim({ okunan, tamamlanan: hatim.tamamlanan });
  };

  const tamEkranDegistir = () => {
    const el = kokRef.current;
    if (!el) return;
    if (document.fullscreenElement) { void document.exitFullscreen().catch(() => undefined); }
    else { void el.requestFullscreen?.().catch(() => undefined); }
  };

  // Sayfa kutusu: yazarken atlamasın — Enter/blur ile uygula
  const sayfayaGit = (ham: string) => {
    const n = parseInt(ham, 10);
    if (n >= 1 && n <= SAYFA_SAYISI) setSayfa(n);
    else setSayfaGiris(String(sayfa));
  };

  // ★ KENAR TIKLAMA NAVİGASYONU (03.10): ekranın en sağına tıkla → sonraki, en soluna → önceki.
  //   Kitap okur gibi: elini sayfanın kenarına götürürsün. Orta bölge = sayfa etkileşimi (zoom vb).
  //   Düzeltme (03.10, dev testinde yakalandı): koordinat hesabı yerine iki AYRI şerit +
  //   ayrı handler — 90px'lik şeridin kendi rect'inden x hesaplamak hep sol düşüyordu.
  const solKenarTikla = () => setSayfa((s) => Math.max(1, s - 1));
  const sagKenarTikla = () => setSayfa((s) => Math.min(SAYFA_SAYISI, s + 1));

  if (!open) return null;

  return (
    <div
      ref={kokRef}
      className={`fixed inset-0 z-[95] flex flex-col animate-fadeIn bg-[#0d0b16] ${tamEkran ? "" : "p-0 md:p-3"}`}
    >
      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${tamEkran ? "" : "rounded-none md:rounded-2xl border border-[#D7AA41]/20"} bg-[#0d1a2c]`}>
        {/* ── ÜST BAR ── */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#D7AA41]/20 px-3 py-2">
          <button onClick={onClose} aria-label="Kapat" className="flex items-center gap-1 rounded-xl border border-red-900/30 bg-red-950/40 px-2.5 py-1.5 text-[10px] font-bold text-red-400 transition hover:bg-red-900/60 active:scale-95" title="Sayfaları kapat (Kur'an ekranı açık kalır)">
            <X size={13} /> KAPAT
          </button>
          <span className="text-[11px] font-black tracking-wider text-gold">📖 KUR'AN SAYFALARI</span>

          {/* ★ KALDIĞIN YERDEN DEVAM çipi — kayıttan başka sayfaya geçtiyse göster */}
          {kayitliSayfa > 1 && sayfa !== kayitliSayfa && (
            <button
              onClick={() => setSayfa(kayitliSayfa)}
              className="flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/15 px-2.5 py-1 text-[10px] font-black text-sky-200 transition hover:bg-sky-500/25 active:scale-95"
              title={`Son okuduğun sayfa: ${kayitliSayfa} — oradan devam et`}
            >
              <MapPin size={11} /> Devam: s.{kayitliSayfa}
            </button>
          )}

          {/* ★ HATİM İLERLEMESİ — dürüst sayaç: sadece "✓ Okudum" ile işaretlenen sayfalar */}
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-black tabular-nums text-emerald-300" title={`${hatim.okunan.length} sayfa işaretlendi · ${hatim.tamamlanan} hatim tamamlandı`}>
            🕋 Hatim: {hatim.okunan.length}/{SAYFA_SAYISI} · %{yuzde}{hatim.tamamlanan > 0 ? ` · ✓${hatim.tamamlanan}` : ""}
          </span>
        </div>

        {/* ── SURE / CÜZ / SAYFA GÖSTERGESİ — üst perde (03.10 güçlendirildi) ── */}
        <div className="relative z-20 flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 border-b border-white/5 bg-[#0a1420] px-3 py-1.5 text-[10px] font-bold text-[#b8b093]">
          <span className="text-gold">✨ {sureAdi || "—"}</span>
          <span className="text-white/25">|</span>
          <span className="text-[#d8cfae]">{sureTur}</span>
          <span className="text-white/25">|</span>
          <span>Cüz {cuz}</span>
          <span className="text-white/25">|</span>
          <span className="tabular-nums">Sayfa {sayfa}/{SAYFA_SAYISI}</span>
          {baslayanlar.length > 0 && (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[9px] text-[#f5dda6]" title="Bu sayfada sure başlar">
              🌱 {baslayanlar.map((n) => SURAHS_DATA[n - 1]?.name).filter(Boolean).join(", ")} başlar
            </span>
          )}
        </div>

        {/* ── HATİM KUTLAMA MESAJI ── */}
        {hatimMesaji && (
          <div className="shrink-0 bg-emerald-900/50 px-4 py-2 text-center text-[11px] font-bold text-emerald-200">
            {hatimMesaji}
            <button onClick={() => setHatimMesaji("")} className="ml-2 text-emerald-400/70 hover:text-emerald-200">✕</button>
          </div>
        )}

        {/* ── SAYFA SAHNESİ — çift tık zoom · hover oklar · kenar tıklama ──
            ★ 03.10: oklar + kenar şeritleri wrapper'da (scroll dışı) — zoom'da
            kaybolmazlar, her zaman görünür alanda sabit dururlar. */}
        <div className="relative min-h-0 flex-1">
        <div
          ref={sahneRef}
          onDoubleClick={() => setZoom((z) => (z >= 1.9 ? 1 : 2))}
          onMouseEnter={() => setOkGorunur(true)}
          onMouseLeave={() => setOkGorunur(false)}
          className="absolute inset-0 overflow-auto bg-[#0a0912] p-3 scrollbar-thin"
          title="Çift tıkla büyüt/küçült · Ctrl+tekerlek zoom · kenarlara tıkla: sayfa çevir"
        >
          <div className="flex min-h-full min-w-full items-center justify-center">
            {!hata ? (
              <img
                key={`${sayfa}-${kaynakIdx}-${imgKey}`}
                src={kaynaklar[kaynakIdx]}
                onLoad={() => { setYukleniyor(false); setHata(false); }}
                onError={() => {
                  // ★ CDN YEDEK ZİNCİRİ: cdn.quran.ws patlarsa jsDelivr devreye girer
                  if (kaynakIdx < kaynaklar.length - 1) setKaynakIdx((i) => i + 1);
                  else setHata(true);
                }}
                alt={`Kur'an sayfa ${sayfa} — Kral Fahd Mushafı (Hafs)`}
                draggable={false}
                className="mx-auto block select-none rounded-[3px] shadow-[0_10px_40px_rgba(0,0,0,.55)]"
                style={{ height: `${Math.round((rasterMi ? 700 : 560) * zoom)}px`, width: "auto" }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-3xl">📡</span>
                <p className="max-w-xs text-[11px] text-[#b8b093]">Sayfa yüklenemedi — internet bağlantını kontrol et. Tüm görüntü kaynakları denendi.</p>
                <button
                  onClick={() => { setKaynakIdx(0); setYukleniyor(true); setHata(false); setImgKey((k) => k + 1); }}
                  className="flex items-center gap-1.5 rounded-xl bg-gold px-3 py-1.5 text-[11px] font-black text-slate-950 transition hover:brightness-110 active:scale-95"
                >
                  <RotateCcw size={12} /> Tekrar dene
                </button>
              </div>
            )}
          </div>
          {yukleniyor && !hata && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[11px] font-bold text-gold">
                <Loader2 size={14} className="animate-spin" /> sayfa yükleniyor…
              </div>
            </div>
          )}
          {/* ★ KENAR TIKLAMA ŞERİTLERİ (03.10): en sağa tıkla → sonraki, en sola → önceki.
              Kitap çevirir gibi — ok beklemeden kenara dokun.
              pointer-events-none OLMAYAN katman: sahne overflow-auto olduğu için bu şeritler
              position:fixed ile pencereye sabitlenir (modal içinde, modal yüksekliğinde). */}
          {!hata && (
            <div className="pointer-events-none absolute inset-0 z-10">
              <div
                onClick={solKenarTikla}
                className="pointer-events-auto absolute bottom-0 left-0 top-0 w-[90px] cursor-w-resize"
                title="← Önceki sayfa"
                aria-label="Önceki sayfa"
                role="button"
              />
              <div
                onClick={sagKenarTikla}
                className="pointer-events-auto absolute bottom-0 right-0 top-0 w-[90px] cursor-e-resize"
                title="Sonraki sayfa →"
                aria-label="Sonraki sayfa"
                role="button"
              />
            </div>
          )}
          {/* ★ HOVER OKLARI (03.10): mouse sahnede → ortada yumuşakça belirir;
              gitti → kaybolur. Dokunmatik cihazda (okDonme) kalıcı görünür. */}
          {!hata && (
            <>
              <button
                onClick={() => setSayfa((s) => Math.max(1, s - 1))}
                disabled={sayfa <= 1}
                aria-label="Önceki sayfa"
                className={`absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-[#e8dfc0] shadow-[0_4px_18px_rgba(0,0,0,.5)] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-gold/50 hover:bg-black/75 hover:text-gold active:scale-95 disabled:pointer-events-none disabled:opacity-0 ${okGorunur || okDonme ? "opacity-100" : "pointer-events-none opacity-0"}`}
                title="Önceki sayfa (←)"
              >
                <ChevronLeft size={22} strokeWidth={2.6} />
              </button>
              <button
                onClick={() => setSayfa((s) => Math.min(SAYFA_SAYISI, s + 1))}
                disabled={sayfa >= SAYFA_SAYISI}
                aria-label="Sonraki sayfa"
                className={`absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-[#e8dfc0] shadow-[0_4px_18px_rgba(0,0,0,.5)] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-gold/50 hover:bg-black/75 hover:text-gold active:scale-95 disabled:pointer-events-none disabled:opacity-0 ${okGorunur || okDonme ? "opacity-100" : "pointer-events-none opacity-0"}`}
                title="Sonraki sayfa (→)"
              >
                <ChevronRight size={22} strokeWidth={2.6} />
              </button>
            </>
          )}
        </div>
        </div>

        {/* ── ALT KONTROL BARI: sayfa gezinme + zoom + tam ekran + okudum ── */}
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-[#D7AA41]/20 bg-[#0d1a2c] px-3 py-2">
          {/* Sayfa gezinme */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSayfa((s) => Math.max(1, s - 1))}
              disabled={sayfa <= 1}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-bold text-[#d8cfae] transition hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-white/[.04]"
              title="Önceki sayfa"
            >
              <ChevronLeft size={13} /> Önceki
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={sayfaGiris}
              onChange={(e) => setSayfaGiris(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onBlur={(e) => sayfayaGit(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sayfayaGit((e.target as HTMLInputElement).value); }}
              className="h-8 w-14 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-center text-[11px] font-black tabular-nums text-gold outline-none focus:border-gold/50"
              title="Sayfa numarası yaz + Enter"
            />
            <span className="text-[10px] font-bold text-[#6e6853]">/ {SAYFA_SAYISI}</span>
            <button
              onClick={() => setSayfa((s) => Math.min(SAYFA_SAYISI, s + 1))}
              disabled={sayfa >= SAYFA_SAYISI}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-bold text-[#d8cfae] transition hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:hover:bg-white/[.04]"
              title="Sonraki sayfa"
            >
              Sonraki <ChevronRight size={13} />
            </button>
            {/* Cüz atlaması */}
            <select
              value={cuz}
              onChange={(e) => {
                const hedef = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582][Number(e.target.value) - 1] ?? 1;
                setSayfa(hedef);
              }}
              className="h-8 rounded-xl border border-white/10 bg-[#1E293B] px-1.5 text-[10px] font-bold text-[#d8cfae] outline-none"
              title="Cüze atla"
            >
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Cüz {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Zoom: − / yüzde / + (çift tık ve Ctrl+tekerlek de sahnede çalışır) */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#1E293B] p-0.5">
            <button
              onClick={() => setZoom((z) => adimla(z, -1))}
              disabled={zoom <= Z_MIN}
              className="rounded-lg px-2 py-1 text-[12px] font-black text-[#d8cfae] transition hover:bg-white/10 active:scale-95 disabled:opacity-30"
              title="Küçült (−) · çift tık da çalışır"
            >
              <Minus size={13} />
            </button>
            <span className="min-w-10 text-center text-[10px] font-black tabular-nums text-gold" title="Yakınlaşma oranı">%{Math.round(zoom * 100)}</span>
            <button
              onClick={() => setZoom((z) => adimla(z, 1))}
              disabled={zoom >= Z_MAX}
              className="rounded-lg px-2 py-1 text-[12px] font-black text-[#d8cfae] transition hover:bg-white/10 active:scale-95 disabled:opacity-30"
              title="Büyüt (+) · çift tık da çalışır"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Tam ekran / yarım ekran */}
          <button
            onClick={tamEkranDegistir}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-bold text-[#d8cfae] transition hover:bg-white/10 active:scale-95"
            title={tamEkran ? "Tam ekrandan çık (yarım ekran) — ESC de çalışır" : "Tam ekran (geniş okuma)"}
          >
            {tamEkran ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {tamEkran ? "Yarım Ekran" : "Tam Ekran"}
          </button>

          {/* ✓ OKUDUM — hatim kaydı */}
          <button
            onClick={okudumIsaretle}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-black transition active:scale-95 ${okunanMu ? "border border-emerald-400/50 bg-emerald-500/25 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,.25)]" : "border border-white/10 bg-white/[.04] text-[#b8b093] hover:bg-white/10"}`}
            title={okunanMu ? "Bu sayfa hatim kaydında — tekrar tıklarsan işareti kaldırırsın" : "Bu sayfayı okudum — hatim kaydıma işle"}
          >
            <Check size={13} /> {okunanMu ? "OKUNDU ✓" : "OKUDUM"}
          </button>
        </div>
      </div>
    </div>
  );
};
