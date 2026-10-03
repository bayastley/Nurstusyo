// ════════════════════════════════════════════════════════
// AYET KARTLARI MODAL — Ayet Kütüphanesi (1. sıra özelliği)
// Kullanıcı bir ayet seçer → kartın içine yazılır → arka plan
// seçer → İNDİR ile FOTOĞRAF (PNG) olarak cihazına kaydeder.
//
// ★ ÖNİZLEME = CANVAS'IN KENDİSİ: Ekranda gördüğün kart, indirdiğin
//   fotoğrafla piksel piksel aynıdır (aynı drawCard fonksiyonu).
// ★ SRP (01.10): görünüm üç bölüme ayrıldı → ayetKartBolumleri.tsx
//   (AyetSecimBolumu · KartOnizlemeBolumu · ArkaPlanGalerisi).
//   Bu dosya yalnız STATE + EFFECT + İŞ MANTIĞI sahibi.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./UIElements";
import { AYET_KARTILARI, sureNoFromSource, gununAyeti, type AyetKarti } from "../data/ayetKartlariData";
import type { Tier } from "../tier";
import { BACKGROUNDS, catLabel, akilliBgSec, drawCard, type BgItem, type KartAyarlari, VARSAYILAN_AYARLAR } from "./ayetKartMotoru";
import { RUH_HALLERI, ruhHaliEsle, ruhHaliAd, MOOD_KART_AYARLARI, type RuhHali } from "../data/ruhHalleri";
import { translate, type Lang } from "../i18n";
import { AyetSecimBolumu, KartOnizlemeBolumu, ArkaPlanGalerisi } from "./ayetKartBolumleri";

interface AyetKartlariModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  /** ★ Hat paleti PRO+ kilidi (01.10): accessTier pro/elit ise 20 font açık */
  accessTier?: Tier;
  tierAtLeast?: (have: Tier, need: Tier) => boolean;
  openPremium?: (tab?: "uyelik" | "jeton") => void;
}

export const AyetKartlariModal: React.FC<AyetKartlariModalProps> = ({ open, onClose, notify, lang = "tr", accessTier = "free", tierAtLeast, openPremium }) => {
  // ★ FULL I18N (01.10): modal başlık/sub dict'ten — 5 dil (tr/en/ar/id/ur)
  const tt = (k: string): string => translate(lang, k);
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
  // ★ AI RUH HALİ (01.10): çubuk input'unun değeri — ruhHaliUygula ile işlenir
  const [ruhHaliMetin, setRuhHaliMetin] = useState("");
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
  const gununAyetiObj = useMemo(() => gununAyeti(), []); // modal açılışında sabitlenir (gün değişikliğinde yeni açılışta değişir)

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

  // ★ KARIŞTIR (03.10, kullanıcı kararı): hem ayet hem arka plan rastgele değişir —
  //   bilinçli eşleştirme YOK (uyumlu seçim Akıllı Seç'in işi).
  const shuffleBg = useCallback(() => {
    const ayetHavuz = filteredAyets.length ? filteredAyets : AYET_KARTILARI;
    const ayetPick = ayetHavuz[Math.floor(Math.random() * ayetHavuz.length)];
    if (ayetPick) setAyetId(ayetPick.id);
    const bgHavuz = filteredBgs.length ? filteredBgs : BACKGROUNDS;
    const bgPick = bgHavuz[Math.floor(Math.random() * bgHavuz.length)];
    if (bgPick) setBgId(bgPick.id);
    notify?.("🔀 Karıştır: yeni ayet + yeni arka plan!");
  }, [filteredAyets, filteredBgs, notify]);

  const shuffleAyet = useCallback(() => {
    if (!filteredAyets.length) return;
    const pick = filteredAyets[Math.floor(Math.random() * filteredAyets.length)];
    setAyetId(pick.id);
  }, [filteredAyets]);

  // 🎯 Akıllı Seç (03.10, kullanıcı kararı): AYET AYNI KALIR — sadece ayetin ruhuna
  //   uygun arka plan (duygu + kelime eşleştirmesi) seçilir.
  const akilliSec = useCallback(() => {
    const bgPick = akilliBgSec(ayet, BACKGROUNDS);
    if (bgPick) { setBgId(bgPick.id); setBgCat("all"); setBgSearch(""); }
    notify?.("🎯 Akıllı Seç: ayetin ruhuna uygun atmosfer hazır!");
  }, [ayet, notify]);

  // 🎯 Akıllı AI (1·Ayetini Seç başlığındaki): aynı motor — ayet + uyumlu arka plan tek tuşla.
  //   Aktif filtrelerdeki (mood/sure/arama) havuzdan seçer; filtre sonucu boşsa tüm ayetlerden.
  const akilliAyetSec = useCallback(() => {
    const havuz = filteredAyets.length ? filteredAyets : AYET_KARTILARI;
    const ayetPick = havuz[Math.floor(Math.random() * havuz.length)];
    if (ayetPick) setAyetId(ayetPick.id);
    const bgPick = akilliBgSec(ayetPick, BACKGROUNDS);
    if (bgPick) { setBgId(bgPick.id); setBgCat("all"); setBgSearch(""); }
    notify?.("🎯 Akıllı AI: ayetin ruhuna uygun kart hazır!");
  }, [filteredAyets, notify]);

  // ★ AI RUH HALİ (01.10): serbest metin / 30 çip → ruh eşleş → mood'a uygun
  //   ayet + arka plan (akilliBgSec) + kart ayarları (karartma/konum/hizalama/ölçek
  //   + mood renkli RENK ÇUBUĞU) tek tuşla. Ayet listesi de o mood'a filtrelenir.
  const ruhHaliUygula = useCallback((ruhId?: string) => {
    let ruh: RuhHali | undefined = ruhId ? RUH_HALLERI.find((r) => r.id === ruhId) : undefined;
    let tam = true;
    if (!ruh) {
      const metin = ruhHaliMetin.trim();
      // ★ i18n (02.10): boş-input uyarısı seçili dilde (EN/AR'da İngilizce/Argo yerine kendi dili)
      if (!metin) { notify?.(tt("akRuhHaliPlaceholder")); return; }
      const es = ruhHaliEsle(metin);
      ruh = es.ruh; tam = es.skor > 0;
    }
    const havuz = AYET_KARTILARI.filter((a) => a.mood === ruh.mood);
    const secenek = havuz.length ? havuz : AYET_KARTILARI;
    const ayetPick = secenek[Math.floor(Math.random() * secenek.length)];
    if (!ayetPick) return;
    const bgPick = akilliBgSec(ayetPick, BACKGROUNDS);
    const { cubukDonme, ...ayarOneri } = MOOD_KART_AYARLARI[ruh.mood];
    setAyetId(ayetPick.id);
    if (bgPick) { setBgId(bgPick.id); setBgCat("all"); setBgSearch(""); }
    setMood(ruh.mood); setSadeceGunun(false);
    setAyar((a) => ({ ...a, ...ayarOneri, cubuk: { ...a.cubuk, acik: true, donme: cubukDonme, mealDonme: (cubukDonme + 150) % 360, kalinlik: a.cubuk.kalinlik || 6 } }));
    // ★ i18n (02.10): onay bildirimi çip adını SEÇİLİ DİLDE verir (ruhHaliAd);
    //   ayet başlığı/arka plan etiketi içerik-özgü TR kalır (veri katmanı).
    const ruhAd = ruhHaliAd(ruh, lang);
    notify?.(tam
      ? `🧠 ${ruh.emoji} ${ruhAd} — ${ayetPick.title} · ${bgPick?.label ?? "gradyan arka plan"} hazır!`
      : `🧠 Tam eşleşme yok, en yakın: ${ruh.emoji} ${ruhAd} — ${ayetPick.title} hazır!`);
  }, [ruhHaliMetin, notify, lang]);

  if (!open) return null;

  return (
    <Modal
      title={tt("v2AyetKartlariTitle")}
      sub={tt("v2AyetKartlariSub").replace("{n}", String(AYET_KARTILARI.length))}
      onClose={onClose}
      wide
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* ── SOL: AYET SEÇİMİ ─────────────────────────────── */}
        <AyetSecimBolumu
          filteredAyets={filteredAyets}
          ayetId={ayetId}
          setAyetId={setAyetId}
          ayetVisibleCount={ayetVisibleCount}
          setAyetVisibleCount={setAyetVisibleCount}
          mood={mood}
          setMood={setMood}
          sadeceGunun={sadeceGunun}
          setSadeceGunun={setSadeceGunun}
          sureFiltre={sureFiltre}
          setSureFiltre={setSureFiltre}
          ayetSearch={ayetSearch}
          setAyetSearch={setAyetSearch}
          gununAyetiObj={gununAyetiObj}
          shuffleAyet={shuffleAyet}
          akilliAyetSec={akilliAyetSec}
          ruhHaliMetin={ruhHaliMetin}
          setRuhHaliMetin={setRuhHaliMetin}
          ruhHaliUygula={ruhHaliUygula}
          lang={lang}
        />

        {/* ── SAĞ: KART ÖNİZLEME + İNDİR ───────────────────── */}
        <KartOnizlemeBolumu
          previewRef={previewRef}
          size={size}
          setSize={setSize}
          bg={bg}
          downloading={downloading}
          download={download}
          ayar={ayar}
          setAyar={setAyar}
          ayarlariGoster={ayarlariGoster}
          setAyarlariGoster={setAyarlariGoster}
          kendiFoto={kendiFoto}
          kendiFotoAd={kendiFotoAd}
          setKendiFoto={setKendiFoto}
          setKendiFotoAd={setKendiFotoAd}
          bgId={bgId}
          setBgId={setBgId}
          fotoYukle={fotoYukle}
          hatPaletiAcik={hatPaletiAcik}
          hatKilitTiklandi={hatKilitTiklandi}
          lang={lang}
        />
      </div>

      {/* ── ALTTA: ARKA PLAN GALERİSİ ────────────────────── */}
      <ArkaPlanGalerisi bgSearch={bgSearch} setBgSearch={setBgSearch} bgCat={bgCat} setBgCat={setBgCat} filteredBgs={filteredBgs} visibleCount={visibleCount} bgId={bgId} setBgId={setBgId} loadMoreRef={loadMoreRef} akilliSec={akilliSec} shuffleBg={shuffleBg} lang={lang} />
    </Modal>
  );
};
