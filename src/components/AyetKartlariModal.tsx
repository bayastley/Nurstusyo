// ════════════════════════════════════════════════════════
// AYET KARTLARI MODAL — Ayet Kütüphanesi (1. sıra özelliği)
// Kullanıcı bir ayet seçer → kartın içine yazılır → arka plan
// seçer → İNDİR ile FOTOĞRAF (PNG) olarak cihazına kaydeder.
//
// ★ ÖNİZLEME = CANVAS'IN KENDİSİ: Ekranda gördüğün kart, indirdiğin
//   fotoğrafla piksel piksel aynıdır (aynı drawCard fonksiyonu).
// ★ Arka plan havuzu: mevcut R2 CDN şablon kütüphanesi (TEMPLATE_CLIPS
//   + ADMIN_TEMPLATE_CLIPS) — yüzlerce doğrudan bağlantılı görsel.
// ★ Stüdyo akışına DOKUNMAZ: kendi state'i içinde çalışır, video
//   üretimi / seçili ayetler / atmosfer atamaları bozulmaz.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Search, Shuffle, Sparkles, Image as ImageIcon, Sun, Moon, Type, ArrowUpDown, AlignLeft, AlignCenter, AlignRight, Wand2, ChevronsDown, Upload, Palette, PenLine, Sparkles as IsiltiIcon } from "lucide-react";
import { Modal } from "./UIElements";
import { AYET_KARTILARI, AYET_MOODS, SURE_ADLARI, sureNoFromSource, gununAyeti, type AyetKarti } from "../data/ayetKartlariData";
import type { Tier } from "../tier";
import { CATEGORIES, CATEGORY_PALETTE, TEMPLATE_CLIPS } from "../clips";
import { ADMIN_ATMOSPHERE_CATEGORIES } from "../adminAtmosphereCategories";
import { ADMIN_TEMPLATE_CLIPS } from "../adminMediaManifest";
import { BACKGROUNDS, catLabel, BG_CATS, akilliBgSec, MOOD_COLORS, wrapCanvasText, drawCard, type BgItem, type KartAyarlari, VARSAYILAN_AYARLAR } from "./ayetKartMotoru";
import { CubukRenkSecici } from "./renkCubuguSecici";
import { cubukRengi, hexToHue } from "../studio/mesajKatmani";
import { HatFontuSeridi } from "./hatFontuSeridi";
// ★ SRP adım 7 (30.09): bg havuzu + akıllı seçim + mood renkleri + canvas çizici ayetKartMotoru.tsx'e taşındı

interface AyetKartlariModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
  /** ★ Hat paleti PRO+ kilidi (01.10): accessTier pro/elit ise 20 font açık */
  accessTier?: Tier;
  tierAtLeast?: (have: Tier, need: Tier) => boolean;
  openPremium?: (tab?: "uyelik" | "jeton") => void;
}

export const AyetKartlariModal: React.FC<AyetKartlariModalProps> = ({ open, onClose, notify, accessTier = "free", tierAtLeast, openPremium }) => {
  // ★ HAT PALETİ PRO+ (01.10): temel stil (Aa Türkçe) herkese; 20 hat fontu pro/elit'te.
  const hatPaletiAcik = tierAtLeast ? tierAtLeast(accessTier, "pro") : accessTier === "pro" || accessTier === "elit";
  const hatKilitTiklandi = () => {
    if (openPremium) { openPremium("uyelik"); return; }
    notify?.("👑 Hat font paleti PRO+ üyelik özelliğidir — 20 klasik ve modern hat sizi bekliyor!");
  };
  const [ayetId, setAyetId] = useState<string>(AYET_KARTILARI[0]?.id ?? "");
  const [bgId, setBgId] = useState<string>("");
  const [mood, setMood] = useState<AyetKarti["mood"] | "tumu">("tumu");
  const [sureFiltre, setSureFiltre] = useState<number | "tumu">("tumu");
  const [sadeceGunun, setSadeceGunun] = useState(false);
  const [ayetSearch, setAyetSearch] = useState("");
  const [bgSearch, setBgSearch] = useState("");
  const [bgCat, setBgCat] = useState<string>("all");
  const [size, setSize] = useState<"45" | "11" | "916">("45");
  const [downloading, setDownloading] = useState(false);
  const [fontsReady, setFontsReady] = useState(0);
  const [visibleCount, setVisibleCount] = useState(24);
  const [ayetVisibleCount, setAyetVisibleCount] = useState(40);
  const [imgTick, setImgTick] = useState(0);
  const [ayar, setAyar] = useState<KartAyarlari>(VARSAYILAN_AYARLAR);
  const [ayarlariGoster, setAyarlariGoster] = useState(false);
  // ★ Mesaj rengi çubuğunun mevcut konumu — seçili rengin 0-360° karşılığı (seçici işaretçisi burada durur)
  const mesajRenkDonme = hexToHue(ayar.mesaj.renk || "#ffffff");
  // ★📸 KENDİ FOTOĞRAFIN (foto+hat sanatı kartı): kullanıcı fotoğrafı yükler,
  //   kart arka planına hat sanatı ayeti işlenir. Fotoğraf YALNIZCA tarayıcıda
  //   kalır — hiçbir sunucuya gönderilmez (KVKK dostu).
  const kendiFotoBg = useMemo<BgItem>(() => ({ id: "kendi-foto", label: "Kendi Fotoğrafın", cat: "kendi", src: "" }), []);
  const [kendiFoto, setKendiFoto] = useState<HTMLImageElement | null>(null);
  const [kendiFotoAd, setKendiFotoAd] = useState("");

  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fontlar hazır olunca kartı tazele (Amiri canvas'ta ancak yüklendiyse kullanılır)
  useEffect(() => {
    if (!open) return;
    let alive = true;
    Promise.all([
      document.fonts.load("700 54px Amiri"),
      document.fonts.load("600 30px Inter"),
      document.fonts.load("700 22px Inter"),
    ]).then(() => { if (alive) setFontsReady((v) => v + 1); }).catch(() => undefined);
    return () => { alive = false; };
  }, [open]);

  // ── Filtreler ────────────────────────────────────────────
  const gununAyetiObj = useMemo(() => gununAyeti(), []); // modal açılışında sabitlenir (gün değiştikçe yeni açılışta değişir)

  const filteredAyets = useMemo(() => {
    const q = ayetSearch.trim().toLocaleLowerCase("tr");
    return AYET_KARTILARI.filter((a) => {
      if (sadeceGunun && a.id !== gununAyetiObj.id) return false;
      if (mood !== "tumu" && a.mood !== mood) return false;
      if (sureFiltre !== "tumu" && sureNoFromSource(a.source) !== sureFiltre) return false;
      if (!q) return true;
      return (
        a.title.toLocaleLowerCase("tr").includes(q) ||
        a.tr.toLocaleLowerCase("tr").includes(q) ||
        a.source.toLocaleLowerCase("tr").includes(q)
      );
    });
  }, [ayetSearch, mood, sureFiltre, sadeceGunun, gununAyetiObj.id]);

  const filteredBgs = useMemo(() => {
    const q = bgSearch.trim().toLocaleLowerCase("tr");
    return BACKGROUNDS.filter((bg) => {
      if (bgCat !== "all" && bg.cat !== bgCat) return false;
      if (!q) return true;
      return bg.label.toLocaleLowerCase("tr").includes(q) || catLabel(bg.cat).toLocaleLowerCase("tr").includes(q);
    });
  }, [bgSearch, bgCat]);

  const ayet = useMemo(() => AYET_KARTILARI.find((a) => a.id === ayetId) ?? AYET_KARTILARI[0], [ayetId]);
  const bg = useMemo(() => (bgId === "kendi-foto" ? kendiFotoBg : BACKGROUNDS.find((b) => b.id === bgId) ?? null), [bgId, kendiFotoBg]);

  // 📸 Foto yükleme — FileReader ile dataURL → Image (tamamen yerel)
  const fotoYukle = useCallback((file: File | undefined | null) => {
    if (!file || !file.type.startsWith("image/")) { notify?.("Lütfen bir fotoğraf dosyası seç (JPG/PNG)"); return; }
    if (file.size > 12 * 1024 * 1024) { notify?.("Fotoğraf çok büyük — 12 MB altı seç"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { setKendiFoto(img); setKendiFotoAd(file.name); setBgId("kendi-foto"); setImgTick((v) => v + 1); notify?.("📸 Fotoğrafın hazır — ayetini seç, kartını indir!"); };
      img.onerror = () => notify?.("Fotoğraf okunamadı — başka bir dosya dene");
      img.src = String(reader.result);
    };
    reader.onerror = () => notify?.("Fotoğraf okunamadı");
    reader.readAsDataURL(file);
  }, [notify]);

  // ── Arka plan görselini yükle (CORS-ok, canvas'ta kullanılabilir) ──
  // ★ BUG DÜZELTMESİ (28.09, kullanıcı kararı): "galeriden resim seçtim ama üstüne ayet
  //   yazılmadı" — ensureImage'in deps'i boş [] idi → kendiFoto state'ini MOUNT anındaki
  //   null değeriyle donduruyordu (stale closure). Foto yüklense bile kendi-foto hep
  //   null dönüyor, kart fotoğrafsız gradyanla çiziliyordu. Artık kendiFoto değişince
  //   fonksiyon tazelenir → fotoğraf canvas'a girer, ayet altın hat üstüne yazılır.
  const ensureImage = useCallback(async (item: BgItem | null): Promise<HTMLImageElement | null> => {
    if (!item) return null;
    // 📸 Kendi fotoğrafı: önceden yüklenen Image döner (ağ isteği YOK)
    if (item.id === "kendi-foto") return kendiFoto;
    const cached = imgCache.current.get(item.id);
    if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgCache.current.set(item.id, img);
        setImgTick((v) => v + 1);
        resolve(img);
      };
      img.onerror = () => resolve(null); // görsel gelmezse gradyan palet çizilir
      img.src = item.src;
    });
  }, [kendiFoto]);

  // ── ÖNİZLEME ÇİZİMİ — indirme ile aynı drawCard ─────────
  useEffect(() => {
    if (!open || !ayet) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    const w = 1080;
    const h = size === "45" ? 1350 : size === "916" ? 1920 : 1080;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let alive = true;
    (async () => {
      const img = await ensureImage(bg);
      if (!alive) return;
      try { await drawCard(ctx, w, h, ayet, bg, img, ayar); } catch { /* degrade etme */ }
      // Fontlar sonradan geldiyse bir kez daha net çiz
      if (fontsReady > 0) { try { await drawCard(ctx, w, h, ayet, bg, img, ayar); } catch { /* noop */ } }
    })();
    return () => { alive = false; };
  }, [open, ayet, bg, size, fontsReady, imgTick, ayar, ensureImage, kendiFoto]);

  // ── Sonsuz kaydırma (galeri) ─────────────────────────────
  useEffect(() => { setVisibleCount(24); }, [bgSearch, bgCat]);
  useEffect(() => {
    if (!open) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setVisibleCount((c) => c + 24); },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, bgSearch, bgCat, filteredBgs.length]);

  // ── İNDİR — PNG olarak fotoğraf kaydeder ────────────────
  const download = useCallback(async (kind: "45" | "11" | "916") => {
    if (!ayet) return;
    // ★ EMNİYET (28.09): kendi-foto seçili ama fotoğraf yüklenmemişse kullanıcıya net söyle
    if (bgId === "kendi-foto" && !kendiFoto) {
      notify?.("📸 Önce fotoğrafını yükle — sağ üstteki 'Fotoğraf Yükle' kutusundan seç");
      return;
    }
    setDownloading(true);
    try {
      const w = 1080;
      const h = kind === "45" ? 1350 : kind === "916" ? 1920 : 1080;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      const img = await ensureImage(bg);
      await drawCard(ctx, w, h, ayet, bg, img, ayar);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nurstudyo-ayet-karti-${ayet.id}-${kind === "45" ? "4x5" : kind === "916" ? "9x16" : "1x1"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      notify?.("✅ Ayet kartı indirildi — fotoğraf galerine/indirilenlere kaydedildi 🌙");
    } catch {
      notify?.("❌ Kart oluşturulamadı — lütfen tekrar dener misin?");
    } finally {
      setDownloading(false);
    }
  }, [ayet, bg, bgId, kendiFoto, ayar, ensureImage, notify]);

  const shuffleBg = useCallback(() => {
    if (!filteredBgs.length) return;
    const pick = filteredBgs[Math.floor(Math.random() * filteredBgs.length)];
    setBgId(pick.id);
  }, [filteredBgs]);

  const shuffleAyet = useCallback(() => {
    if (!filteredAyets.length) return;
    const pick = filteredAyets[Math.floor(Math.random() * filteredAyets.length)];
    setAyetId(pick.id);
  }, [filteredAyets]);

  // 🎯 Akıllı Seç: rastgele ayet + o ayete uygun arka plan (duygu + kelime eşleştirmesi)
  const akilliSec = useCallback(() => {
    const ayetPick = filteredAyets.length ? filteredAyets[Math.floor(Math.random() * filteredAyets.length)] : AYET_KARTILARI[0];
    if (ayetPick) setAyetId(ayetPick.id);
    const bgPick = akilliBgSec(ayetPick, BACKGROUNDS);
    if (bgPick) { setBgId(bgPick.id); setBgCat("all"); setBgSearch(""); }
    notify?.("🎯 Akıllı Seç: ayet + uyumlu arka plan hazır!");
  }, [filteredAyets, notify]);

  if (!open) return null;

  const dim = size === "45" ? "1080 × 1350" : size === "916" ? "1080 × 1920" : "1080 × 1080";

  return (
    <Modal
      title="Ayet Kütüphanesi"
      sub={`${AYET_KARTILARI.length} ayet · 114 sure · 2.000+ arka plan — seç, kartına yaz, fotoğraf olarak indir 🌙`}
      onClose={onClose}
      wide
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* ── SOL: AYET SEÇİMİ ─────────────────────────────── */}
        <div className="order-2 lg:order-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>1 · Ayetini Seç</span>
            <button
              type="button"
              onClick={shuffleAyet}
              className="ml-auto flex items-center gap-1.5 rounded-lg glass-soft px-2.5 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:text-white active:scale-95"
              title="Rastgele ayet"
            >
              <Sparkles size={11} style={{ color: "var(--accent)" }} /> Rastgele
            </button>
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
              <span className="block text-[10.5px] font-black" style={{ color: "var(--accent-2)" }}>Günün Ayeti</span>
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
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {/* Sure filtresi + arama satırı */}
          <div className="mb-2 flex gap-2">
            <select
              value={sureFiltre === "tumu" ? "" : String(sureFiltre)}
              onChange={(e) => { setSureFiltre(e.target.value ? Number(e.target.value) : "tumu"); setSadeceGunun(false); }}
              className="glass-soft shrink-0 rounded-xl px-2 py-2.5 text-[10px] font-bold text-white/80 outline-none"
              title="Sureye göre filtrele"
            >
              <option value="">📖 Tüm sureler</option>
              {SURE_ADLARI.map((ad, i) => (
                <option key={ad} value={i + 1}>{i + 1}. {ad}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={ayetSearch}
                onChange={(e) => setAyetSearch(e.target.value)}
                placeholder="Ayet ara — meal, başlık veya sure adı..."
                className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Arama — sure filtresiyle yan yana taşındı */}
          <div className="relative mb-2 hidden">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={ayetSearch}
              onChange={(e) => setAyetSearch(e.target.value)}
              placeholder="Ayet ara — meal, başlık veya sure adı..."
              className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30"
            />
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
                      {AYET_MOODS.find((m) => m.id === a.mood)?.label}
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
              <p className="py-6 text-center text-[11px] text-white/40">Bu filtreye uygun ayet bulunamadı.</p>
            )}
          </div>
        </div>

        {/* ── SAĞ: KART ÖNİZLEME + İNDİR ───────────────────── */}
        <div className="order-1 lg:order-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>Kartın</span>
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
              <Wand2 size={11} style={{ color: "var(--accent)" }} /> Kart Ayarları {ayarlariGoster ? "▲" : "▼"}
            </button>

            {ayarlariGoster && (
              <div className="mt-2 space-y-2.5 rounded-xl border border-white/10 bg-black/30 p-2.5">
                {/* Karartma */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[9px] font-bold text-white/60">
                    <span className="flex items-center gap-1"><Moon size={10} style={{ color: "var(--accent)" }} /> Karartma (ışıklı arka planda artır)</span>
                    <span className="tabular-nums text-white/40">{ayar.karartma}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={ayar.karartma}
                    onChange={(e) => setAyar((a) => ({ ...a, karartma: Number(e.target.value) }))}
                    className="w-full accent-[color:var(--accent)]" style={{ height: 4 }} />
                </div>

                {/* Yazı boyutu */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[9px] font-bold text-white/60">
                    <span className="flex items-center gap-1"><Type size={10} style={{ color: "var(--accent)" }} /> Yazı boyutu</span>
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
                    <p className="flex items-center gap-1 text-[8.5px] font-bold text-white/50"><Palette size={9} style={{ color: "var(--accent)" }} /> Renk Çubuğu</p>
                    <button type="button" onClick={() => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, acik: !a.cubuk.acik } }))}
                      className={`h-5 w-9 rounded-full text-[7px] font-black transition ${ayar.cubuk.acik ? "text-black" : "glass-soft text-white/50"}`}
                      style={ayar.cubuk.acik ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                      {ayar.cubuk.acik ? "AÇIK" : "KAPALI"}
                    </button>
                  </div>
                  {ayar.cubuk.acik && (
                    <div className="flex items-start justify-center gap-4">
                      <CubukRenkSecici boy="kucuk" etiket="Arapça" deger={ayar.cubuk.donme} onSec={(d) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, donme: d } }))} />
                      <CubukRenkSecici boy="kucuk" etiket="Meal" deger={ayar.cubuk.mealDonme} onSec={(d) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, mealDonme: d } }))} />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-white/50">Çerçeve</span>
                        <button type="button" onClick={() => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, kalinlik: a.cubuk.kalinlik > 0 ? 0 : 6 } }))}
                          className={`h-5 w-9 rounded-full text-[7px] font-black transition ${ayar.cubuk.kalinlik > 0 ? "text-black" : "glass-soft text-white/50"}`}
                          style={ayar.cubuk.kalinlik > 0 ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
                          title="Çerçeve boyunca renk şeridi">
                          {ayar.cubuk.kalinlik > 0 ? "AÇIK" : "YOK"}
                        </button>
                        {ayar.cubuk.kalinlik > 0 && (
                          <input type="range" min={2} max={14} value={ayar.cubuk.kalinlik} onChange={(e) => setAyar((a) => ({ ...a, cubuk: { ...a.cubuk, kalinlik: Number(e.target.value) } }))} className="mt-1 h-1 w-10 accent-[color:var(--accent)]" title="Şerit kalınlığı" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ★ ÖZEL YAZI (01.10) — kartın içine çizilen mesaj; ayrı konum */}
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="flex items-center gap-1 text-[8.5px] font-bold text-white/50"><PenLine size={9} style={{ color: "var(--accent)" }} /> Özel Yazı</p>
                    <button type="button" onClick={() => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, acik: !a.mesaj.acik } }))}
                      className={`h-5 w-9 rounded-full text-[7px] font-black transition ${ayar.mesaj.acik ? "text-black" : "glass-soft text-white/50"}`}
                      style={ayar.mesaj.acik ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                      {ayar.mesaj.acik ? "AÇIK" : "KAPALI"}
                    </button>
                  </div>
                  {ayar.mesaj.acik && (
                    <div className="space-y-1.5">
                      <textarea value={ayar.mesaj.metin} onChange={(e) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, metin: e.target.value.slice(0, 90), acik: true } }))} rows={2}
                        placeholder="Karta yazılacak mesajın… (Türkçe veya Arapça hatla)"
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
                            {k === "ust" ? "↑ Üst" : k === "orta" ? "↕ Orta" : "↓ Alt"}
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
                        <span className="flex items-center gap-1 text-[8.5px] font-bold text-white/50"><IsiltiIcon size={9} style={{ color: "var(--accent)" }} /> Işıltı</span>
                        <input type="range" min={0} max={2} step={0.25} value={ayar.mesaj.isilti} onChange={(e) => setAyar((a) => ({ ...a, mesaj: { ...a.mesaj, isilti: Number(e.target.value) } }))} className="h-1 flex-1 accent-[color:var(--accent)]" />
                        <span className="w-8 text-right text-[8px] tabular-nums text-white/40">{ayar.mesaj.isilti}×</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sıra + Konum + Hizalama */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-[8.5px] font-bold text-white/50"><ArrowUpDown size={9} /> Sıra</p>
                    <button type="button"
                      onClick={() => setAyar((a) => ({ ...a, arUstte: !a.arUstte }))}
                      className="w-full rounded-lg glass-soft py-1.5 text-[9px] font-bold text-white/75 transition hover:text-white">
                      {ayar.arUstte ? "قرآن üstte" : "Meal üstte"}
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
                      <button type="button" onClick={() => setAyar((a) => ({ ...a, hizalama: "sag" }))} title="Sağa yasla"
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
                    <p className="truncate text-[9px] font-bold text-white/80">{kendiFotoAd || "Fotoğraf hazır ✓"}</p>
                    <p className="text-[8px] text-emerald-300">✓ Kart arka planı olarak seçildi</p>
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
              {downloading ? "Hazırlanıyor…" : "FOTOĞRAF OLARAK İNDİR"}
            </button>
          </div>
        </div>
      </div>

      {/* ── ALTTA: ARKA PLAN GALERİSİ ────────────────────── */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>2 · Arka Plan Seç</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-white/45">{BACKGROUNDS.length.toLocaleString("tr-TR")} hazır · {BG_CATS.length} kategori</span>
          <div className="ml-auto flex items-center gap-1.5">
            {/* 🎯 Akıllı Seç — ayet + uyumlu arka plan tek tuşla */}
            <button
              type="button"
              onClick={akilliSec}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              title="Ayeti ve ona uygun arka planı kendisi seçer"
            >
              <Wand2 size={11} /> Akıllı Seç
            </button>
            <button
              type="button"
              onClick={shuffleBg}
              className="flex items-center gap-1.5 rounded-lg glass-soft px-2.5 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:text-white active:scale-95"
              title="Sadece arka planı rastgele değiştir"
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
            placeholder="Ne istersen yaz — deniz, kâbe, yıldız, bahçe, bulut... (kategoriden bulur)"
            className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-24 text-[11px] outline-none placeholder:text-white/30"
          />
          {/* Kategori sayısı çok olduğu için dropdown'a taşındı */}
          <select
            value={bgCat}
            onChange={(e) => setBgCat(e.target.value)}
            className="glass-soft absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-[9.5px] font-bold text-white/75 outline-none"
            title="Kategoriye göre süz"
          >
            <option value="all">Tümü</option>
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
          <p className="py-6 text-center text-[11px] text-white/40">Bu filtreyle arka plan bulunamadı.</p>
        )}
      </div>
    </Modal>
  );
};
