import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

// ★ 29.10 GERÇEK SÜRE ÖLÇÜMÜ: kayıtlı blob'un oynatılabilir süresini ölçer.
//   MediaRecorder kodlayıcısı ortada ölünce dosya hedef süreden kısa çıkar;
//   çıkış listesi artık GERÇEGİ değil ölçülen süreyi gösterir (0/infinity → hedef)
async function kayitSuresiniOlc(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const eleman = document.createElement("video");
      eleman.preload = "metadata";
      eleman.muted = true;
      const url = URL.createObjectURL(blob);
      const bitir = (sure: number) => { try { URL.revokeObjectURL(url); } catch { /* yoksay */ } try { eleman.removeAttribute("src"); } catch { /* yoksay */ } resolve(sure); };
      const zamanlayici = window.setTimeout(() => bitir(0), 6000);
      eleman.onloadedmetadata = () => {
        window.clearTimeout(zamanlayici);
        const d = eleman.duration;
        bitir(Number.isFinite(d) ? d : 0);
      };
      eleman.onerror = () => { window.clearTimeout(zamanlayici); bitir(0); };
      eleman.src = url;
    } catch { resolve(0); }
  });
}
import { useCallback, type MutableRefObject } from "react";
import fixWebmDuration from "fix-webm-duration";
import { sesKaynakZinciri } from "../reciters";
import { checkRateLimit } from "../rateLimiter";
import { JETON, videoMaliyeti, yerelKullanimIlerle, type Tier } from "../tier";
import { reportRenderError } from "../debugGuide";
import { SURAHS } from "../data";
import { getPosterUrl, getVideoUrl, getVideoUrlSync, isR2Media } from "../videoUrl";
import { klipsErisildiMi, klipsSagliksizIsaretle, klipsSaglikliMi, yedekAtmosfer, toHiRes, type Clip } from "../clips";
import { dimensions, isWholeSurahSelected, pickMime, uid } from "./studioHelpers";
import type { KendiSesAktif } from "./useKendiSes";
import { storeVideo } from "./videoStore";
import { checkGuestGate, bumpGuestUsed } from "./useGuestTrial";
import { telifUyarisiGerekli } from "../telifUyari";
import { devamBeklet, uyariAc } from "./telifUyariAkisi";
import { denemeAktifMi, denemeAyarla, DENEME_TOPLAM } from "./deneme"; // ★ 25.10 lansman denemesi
import { bolumKullanimiYaz } from "./usageIzle"; // ★ 25.10 bölüm kullanım istatistiği
import { uretimIstYaz } from "../components/islamicToolsVucut";
import type { Aspect, LoginTab, Mode, ModalName, Output, SelectedAyah, User } from "../types";

interface UseVideoGeneratorParams {
  generating: boolean;
  setGenerating: (value: boolean) => void;
  setProgress: (value: number | ((value: number) => number)) => void;
  stopGenerationRef: MutableRefObject<() => void>;
  user: User | null;
  isMasterSürüm: boolean;
  setLoginTab: (value: LoginTab) => void;
  setModal: (value: ModalName) => void;
  notify: (message: string) => void;
  selected: SelectedAyah[];
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  reciter: any;
  // ★ KENDİ SESİNLE ÜRETİM (03.10): aktif kendi-sesi kaydı varsa üretim onunla yapılır
  kendiSesAktif: KendiSesAktif | null;
  // ★ 23.10: modal'dan sn sınırı — 0 = mod sınırı (59/600/7200); asla üstüne çıkamaz
  kendiSesMaksSn: number;
  batchFormats: Aspect[];
  aspect: Aspect;
  mode: Mode;
  accessTier: Tier;
  jetonCount: number;
  silenceAllAudio: () => void;
  // ★ Telif uyarısı akışı — modül-düzeyi telifUyariAkisi (SRP tur 4):
  //   telifKabulOnDevamRef artık kullanılmıyor — TelifDisclaimer
  //   "Anladım" akışındaki otomatik-devam, bekleyen-devam bayrağı ile taşınır.
  // ★ Üretim Onay Balonu — free/pro kullanıcılar için maliyet onayı
  showGenerateConfirm: (cost: number, remaining: number, formatCount: number, mode: string, hak?: { kind: string; quotaLeft: number; packLeft: number } | null) => Promise<boolean>;
  // ★ TELİF RİSK ONAYI (09.10): riski %30 üzeri kâriyle üretimde bilgilendirilmiş onay.
  //   Pro/Elit ücretli kullanıcılar için açılır; kabul edilirse kâri cihazda işaretlenir.
  showRiskOnay: (reciterName: string, riskPercent: number) => Promise<boolean>;
  riskOnayEsigi: number;
  videoCache: MutableRefObject<Map<string, HTMLVideoElement>>;
  imageCache: MutableRefObject<Map<string, HTMLImageElement>>;
  ayahBackgroundsRef: MutableRefObject<Record<string, Clip>>;
  backgroundRef: MutableRefObject<Clip>;
  verseIndexRef: MutableRefObject<number>;
  aspectRef: MutableRefObject<Aspect>;
  setVerseIndex: (value: number) => void;
  setOutputs: (updater: (current: Output[]) => Output[]) => void;
  setActiveOutputId: (value: string) => void;
  ensureImage: (url: string) => HTMLImageElement;
  ensureVideo: (url: string, fallbackUrl?: string) => HTMLVideoElement;
  renderQuality: { low: boolean; renderFps: number; bitrateScale: number; audioBitrate: number };
  t: (key: any) => string;
}

/** ★ KENDİ SESİ KESİCİ (03.10): tam kayıt buffer'ından bir ayet segmentini kesip
 *  bağımsız AudioBuffer'a kopyalar (segmentler: ayet sırasına birebir). */
function ayetParcasi(tam: AudioBuffer, seg: { start: number; dur: number }, ctx: BaseAudioContext): AudioBuffer {
  const bas = Math.max(0, Math.floor(seg.start * tam.sampleRate));
  const boy = Math.max(1, Math.min(Math.floor(seg.dur * tam.sampleRate), tam.length - bas));
  const parcasi = ctx.createBuffer(Math.min(tam.numberOfChannels, 2), boy, tam.sampleRate);
  for (let ch = 0; ch < parcasi.numberOfChannels; ch += 1) {
    parcasi.copyToChannel(tam.getChannelData(Math.min(ch, tam.numberOfChannels - 1)).subarray(bas, bas + boy), ch);
  }
  return parcasi;
}

/**
 * ★ VİDEO ÜRETİM MOTORU (01.10 — StudioApp'teki inline handleGenerate buraya taşındı)
 *
 * Akış: misafir kapısı → rate limit → telif uyarısı → sunucu yetkisi (/api/render/authorize)
 * → maliyet onayı → ses indirme/decode → offline miks → canvas kaydı (adaptif FPS/bitrate,
 * frame pump, WebM duration düzeltme) → IndexedDB saklama + üretici istatistiği.
 */
export function useVideoGenerator(params: UseVideoGeneratorParams) {
  const {
    generating,
    setGenerating,
    setProgress,
    stopGenerationRef,    user, isMasterSürüm, setLoginTab, setModal, notify,
    selected, canvasRef, reciter, kendiSesAktif, kendiSesMaksSn, batchFormats, aspect, mode, accessTier, jetonCount,    silenceAllAudio, showGenerateConfirm, showRiskOnay, riskOnayEsigi,
    videoCache,
    imageCache,
    ayahBackgroundsRef,
    backgroundRef,
    verseIndexRef,
    aspectRef,
    setVerseIndex,
    setOutputs,
    setActiveOutputId,
    ensureImage,
    ensureVideo,
    renderQuality,
    t,
  } = params;

  // ★ TELİF UYARISI ZİNCİRİ (16.10 SRP tur 4): uyarı gösterilince modül-düzeyi
  //   devam bayrağı konur (devamBeklet). TelifDisclaimer "Anladım" basılınca
  //   bekleyenDevamiYurut() aboneye (ilgili handleGenerate instance) haber verir.
  //   StudioApp'teki kırılgan telifTetik/effect çifti kaldırıldı.

  return useCallback(async () => {
    if (generating) { stopGenerationRef.current(); return; }
    // ★ MİSAFİR DENEME + KÖTÜYE KULLANIM FRENİ: üye olmayan da kalan hakkı varsa
    //   deneme videosu üretebilir ama: (1) toplam 2 hak, (2) günde en fazla 4 üretim
    //   (sayaç silse bile), (3) iki üretim arası 2 dk cooldown — F5 spam ile seri
    //   üretim imkansız. Hakkı/günü biten misafir kayıt modalına yönlendirilir.
    const misafirGate = user || isMasterSürüm ? { allowed: true, remaining: 0 } : checkGuestGate();
    if (!user && !isMasterSürüm) {
      if (misafirGate.reason === "bekle") {
        notify(ttX2610("vgMola").replace("{x}", String(misafirGate.retryAfterSec)));
        return;
      }
      if (misafirGate.reason === "günlük-sınır") {
        notify(ttX2610("vgBugunDoldu"));
        setLoginTab("register");
        setModal("login");
        return;
      }
      if (!misafirGate.allowed) {
        notify(ttX2610("vgTrialBirlestirme"));
        setLoginTab("register");
        setModal("login");
        return;
      }
    }
    const rl = checkRateLimit("video");
    if (!rl.allowed) {
      notify(`${rl.message}  ${ttX2610("umSnKaldi").replace("{n}", String(Math.ceil(rl.retryAfterMs / 1000)))}`);
      return;
    }
    if (!selected.length) { notify(ttX2610("sbOnceAyetSec")); return; }
    if (!window.MediaRecorder) { notify(ttX2610("vgTarayiciDestekmiyor")); return; }
    // ★ TELİF UYARISI — SADECE İLK üretim basışında BİR KERE:
    //   uyarı kabul edilmemişse bayrak konur, uyarı açılır; "Anladım" deyince
    //   üretim otomatik kaldığı yerden DEVAM eder (ikinci tıklama gerekmez).
    //   Girişte/refresh'te ASLA çıkmaz — sadece üretim akışı tetikler.
    if (telifUyarisiGerekli()) {
      devamBeklet(); // "Anladım" basılınca otomatik-devam bayrağı
      uyariAc();     // abone (StudioApp) uyarıyı AÇAR
      return;
    }
    // ★ Safari / eski tarayıcı: canvas yakalama yoksa net uyarı (iOS Safari 15 altı)
    const canvasEl = canvasRef.current;
    if (!canvasEl || typeof canvasEl.captureStream !== "function") {
      notify(ttX2610("vgCanvasDestekmiyor"));
      return;
    }
    const surahOnlyReciter = Boolean(reciter.surahPattern);
    if (surahOnlyReciter && !isWholeSurahSelected(selected, SURAHS)) {
      notify(ttX2610("vgSesSure").replace("{x}", String(reciter.name)));
      return;
    }
    // ★ TELİF RİSK ONAYI (09.10): telif riski %30 ÜZERİ kâriyle üretim —
    //   ücretli kullanıcı (pro/elit; admin ve god-mode hariç) ayrı bir
    //   bilgilendirilmiş-onay penceresi alır. Kabul ederse bu üretim
    //   oturumunda o kâri için tekrar sorulmaz (oturum-içi işaret).
    //   Vazgeçerse üretim iptal olur ve jeton/hak düşmez (authorize'a hiç gelmedik).
    const riskYuzde = Number(reciter.telifRiski) || 0;
    const riskOnayAdminMi = user?.isAdmin === true;
    // ★ 25.10: lansman denemesi aktifken free kullanıcı da PRO/ELİT kâriyle üretebilir
    //   → bilgilendirilmiş-onay penceresi onlar için de gösterilir (telif dürüstlüğü).
    if (!isMasterSürüm && !riskOnayAdminMi && (accessTier === "pro" || accessTier === "elit" || denemeAktifMi()) && riskYuzde > riskOnayEsigi) {
      const onaylandi = await showRiskOnay(reciter.name, riskYuzde);
      if (!onaylandi) { notify(ttX2610("vgIptal")); return; }
    }
    const formatCount = Math.max(batchFormats.length, 1);
    const costPerVideo = videoMaliyeti(mode, accessTier);
    const isGuest = !user && !isMasterSürüm;
    // God Mode ve misafir deneme videolarında jeton harcanmaz
    const isAdmin = riskOnayAdminMi;
    const totalCost = isMasterSürüm || isGuest || isAdmin ? 0 : costPerVideo * formatCount;
    // ★ 29.10 TÜR BAZLI HAK SUNUCUYDAN (kullanıcı: "KISA üretiyorum HEPSİNİ gösteriyor"):
    //   /api/render/authorize cevabındaki kind/quotaLeft/packLeft burada yakalanır —
    //   onay balonu jeton cüzdanı yerine ÜRETTİĞİ MODE'UN kalan hakkını gösterecek.
    let yetkiHak: { kind: string; quotaLeft: number; packLeft: number } | null = null;
    if (!isMasterSürüm && !isGuest) {
      try {
        const response = await fetch("/api/render/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, formats: batchFormats.length ? batchFormats : [aspect] }),
        });
        const data = await response.json().catch(() => null) as { ok?: boolean; error?: string; cost?: number; source?: string; packLeft?: number; kind?: string; quotaLeft?: number | null } | null;
        if (!response.ok || !data?.ok) {
          notify(data?.error || "Üretim yetkisi doğrulanamadı");
          return;
        }
        // ★ 25.10 LANSMAN DENEMESİ — sahibin emri: "5 hak yaptıkça düşer, kalan
        //   altında yazsın, bitince üyeliğe yöneltsin". Sunucu tek doğruluk kaynağı:
        //   RPC nur_consume_video ÖNCE deneme hakkından (5 ortak), sonra kota/paket.
        //   source==='deneme' → packLeft = kalan hak; deneme bitti (kota/paket).
        if (data.source === "deneme") {
          denemeAyarla(Number(data.packLeft) || 0);
          notify(ttX2610("vgLansman").replace("{n}", String(data.packLeft)).replace("{t}", String(DENEME_TOPLAM)));
        } else {
          yetkiHak = {
            kind: String(data.kind || (mode === "short" ? "kisa" : mode === "long" ? "uzun" : "tam")),
            quotaLeft: Number(data.quotaLeft ?? 0),
            packLeft: Number(data.packLeft ?? 0),
          };
          denemeAyarla(0); // deneme bitti → PRO/ELİT/V2 kilitleri geri gelir
          if (denemeAktifMi()) denemeAyarla(0);
          // ★ 29.10 GÖSTERGE SENKRONU (kullanıcı: "kendi kullanım hakkını da kullanmıyor"):
          //   authorize kota/paket'ten DÜŞTÜ — yerel kalan-hak göstergesini de ilerlet,
          //   üstü gösterge gerçeği izsin (sunucu tek doğruluk kaynağı, bu yalnız GÖRÜNÜM).
          try {
            const yerelKind = mode === "short" ? "kisa" : mode === "long" ? "uzun" : "tam";
            yerelKullanimIlerle(yerelKind, Math.max(1, batchFormats.length ? batchFormats.length : 1));
          } catch { /* göstergesi — üretimi ASLA etkilemesin */ }
        }
        bolumKullanimiYaz("video-uret"); // ★ 25.10 analitik: en çok kullanılan bölüm
      } catch {
        notify(ttX2610("vgYetkiSunucu"));
        return;
      }
    }
    // ★ YANLIŞ KAPI FIX (30.09, kullanıcı bildirimi): jetonCount kontrolü SADECE satın
    //   alınan paket haklarını sayıyordu — günlük kota hakkı (free: 3/gün) hesaba
    //   katılmadığı için hakkı olan kullanıcı satın alma modalına atılıyordu.
    //   Ücretlendirme TEK DOĞRULUK KAYNAĞI olarak sunucuda yapılır: /api/render/authorize
    //   atomik RPC ile kotayı+paketi doğru hesaplar, hakkı yoksa 402 + dürüst mesaj döner
    //   (yukarıdaki authorize bloğu zaten bu cevabı notify ile gösterir). İkinci bir
    //   yanlış kapı burada OLAMAZ — kaldırıldı.
    // ★ Üretim Onay Balonu — free/pro kullanıcılar için maliyet uyarısı
    if (!isMasterSürüm && !isGuest && totalCost > 0 && (accessTier === "free" || accessTier === "pro")) {
      const confirmed = await showGenerateConfirm(totalCost, jetonCount, formatCount, mode, yetkiHak);
      if (!confirmed) {
        // ★ 29.10 İPTAL İADESİ: authorize onay balonundan ÖNCE hakları düşer —
        //   kullanıcı "İptal" deyince hakkı kaybetmesin. Teknik hata iadesiyle
        //   aynı RPC (wallet-refund, 24 saatte 10 iade freni sunucuda).
        if (!isAdmin && yetkiHak && formatCount > 0) {
          try {
            const refundCevap = await fetch("/api/payments/wallet-refund", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kind: yetkiHak.kind, amount: formatCount }),
            });
            const refundVeri = await refundCevap.json().catch(() => null) as { ok?: boolean } | null;
            if (refundCevap.ok && refundVeri?.ok) notify(ttX2610("vgIade"));
          } catch { /* iade servisine ulaşılamadı — sessiz geç */ }
        }
        notify(ttX2610("vgIptal"));
        return;
      }
    }
    let jetonCharged = false;
    let userStopped = false;
    // ★ HAK İADESİ (09.10): /api/render/authorize üretimden ÖNCE hak düşer;
    //   teknik hatada hakkı geri vermek için üretim modu ve format sayısı
    //   burada sabitlenir.Misafir/god-mode tarafında düşüm zaten yok.
    const authorizeKind = mode === "short" ? "kisa" : mode === "long" ? "uzun" : "tam";
    const authorizeFormats = (batchFormats.length ? batchFormats : [aspect]).length;
    silenceAllAudio();

    // ★ BELLEK OPTİMİZASYONU: Eski/Düşük RAM'li cihazlar için preloaded video ve resimleri temizle
    if (renderQuality.low) {
      try {
        videoCache.current.forEach((video) => {
          try {
            video.pause();
            video.removeAttribute("src");
            video.load();
          } catch {}
        });
        videoCache.current.clear();
        imageCache.current.clear();
      } catch (err) {
        console.warn("Bellek temizleme hatası:", err);
      }
    }

    setGenerating(true); setProgress(2);
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext, audioContext = new AudioContextClass();
      // ★ MOBİL SES DÜZELTMESİ (04.10, kullanıcı bildirimi: "galeride ilk ayet sesi çıkıyor,
      //   video donuyor"): Mobil tarayıcılar AudioContext'i suspended başlatır — media
      //   stream'in ses kanalı sessiz kalır ya da yarım akar. Kayıt başlamadan ÖNCE
      //   resume() ile unlock edilir (kullanıcı jesti içinde olduğumuz için serbest).
      if (audioContext.state === "suspended") { try { await audioContext.resume(); } catch { /* ignore */ } }
      const buffers: AudioBuffer[] = [], usedItems: SelectedAyah[] = [], audioOffsets: number[] = [];
      const ayetSüreleri: Array<{ start: number; dur: number }> = [];
      const cap = mode === "short" ? 59 : mode === "long" ? 600 : JETON.TAM_SURUM_CAP_SANIYE; let cursor = 0;
      // ★ KENDİ SESİNLE ÜRETİM (03.10, kullanıcı bildirimi): "Kendi sesin aktif" görünüyor ama
      //   üretim hâlâ reciter URL'lerinden ses indiriyordu. Artık aktif kendi-sesi kaydı varsa
      //   üretim ONUNLA yapılır: blob bir kez decode edilir, segmentler (ayet sırasına birebir)
      //   kesilip zaman çizgisine dizilir — ayet geçişleri kullanıcının okuyuşuna kilitlenir.
      //   Sure uyuşmazlığı / decode hatası → dürüst uyarı + hocanın sesiyle devam.
      let kendiKullandi = false;
      const kendi = kendiSesAktif;
      const kendiUygun = Boolean(kendi && selected.length && selected.every((item) => item.s === kendi.sure) && kendi.segments.length > 0);
      if (kendi && !kendiUygun) {
        notify(ttX2610("vgSesSurahUyusmazlik").replace("{x}", String(kendi.sure)));
      }
      if (kendi && kendiUygun) {
        try {
          setProgress(8);
          const kendiSiniri = kendiSesMaksSn > 0 ? Math.min(kendiSesMaksSn, cap) : cap; // ★ 23.10: kullanıcı sn sınırı (0 = mod sınırı)
          const tamBuffer = await audioContext.decodeAudioData(await kendi.blob.arrayBuffer());
          const enBuyukAyet = Math.max(...selected.map((item) => item.a));
          // Segment→ayet eşlemesi: tüm-sure kaydı (segment sayısı ≥ en büyük ayet no) → indeks = ayet no - 1;
          // seçili alt küme için kaydedilmiş kısa kayıt → sıralama pozisyonu.
          const konumaGore = kendi.segments.length >= enBuyukAyet;
          const sirali = [...selected].sort((a, b) => a.a - b.a);
          const siralamaPozisyonu = new Map(sirali.map((item, i) => [item.id, i] as const));
          let dustu = 0;
          for (let index = 0; index < selected.length; index += 1) {
            const item = selected[index];
            const seg = kendi.segments[konumaGore ? item.a - 1 : (siralamaPozisyonu.get(item.id) ?? index)];
            if (!seg) { dustu += 1; continue; }
            if (cursor > 0 && cursor + seg.dur > kendiSiniri) { dustu += 1; continue; }
            const parcasi = ayetParcasi(tamBuffer, seg, audioContext);
            audioOffsets.push(cursor); buffers.push(parcasi); usedItems.push(item);
            ayetSüreleri.push({ start: cursor, dur: parcasi.duration });
            cursor += parcasi.duration + .03;
          }
          if (buffers.length) {
            kendiKullandi = true;
            notify(ttX2610("vgKendiSesUretim").replace("{n}", String(usedItems.length)));
          }
          if (dustu && buffers.length) notify(ttX2610("vgSesEslesmedi").replace("{x}", String(dustu)));
        } catch {
          notify(ttX2610("vgSesCozumHatasi"));
        }
      }
      if (!kendiKullandi && surahOnlyReciter) {
        setProgress(10);
        const sNum = selected[0].s;
        const url = reciter.surahPattern!.replace("{S}", String(sNum).padStart(3, "0"));
        // ★ Muhammed el-Fakîh hocada atmosferlerin hızlı hızlı geçmesini engelle
        // ★ KULLANICI MEDYASI KUTSAL (30.09): "Yüklediklerim" slotları ana arka planla
        //   EZİLMEZ — kullanıcının kendi dosyası üretimde aynen kalır.
        selected.forEach((item) => {
          const mevcut = ayahBackgroundsRef.current[item.id];
          if (mevcut && mevcut.cat === "yuklenenler") return;
          ayahBackgroundsRef.current[item.id] = backgroundRef.current;
        });
        try {
          const response = await fetch(url);
          if (response.ok) {
            const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
            audioOffsets.push(0); buffers.push(buffer); usedItems.push(...selected);
            cursor = Math.min(buffer.duration, cap) + 0.03;
            const sureSüresi = cursor - 0.03;
            const herAyetSüresi = sureSüresi / Math.max(selected.length, 1);
            selected.forEach((_, i) => { ayetSüreleri.push({ start: herAyetSüresi * i, dur: herAyetSüresi }); });
          }
        } catch { /* ignore */ }
      } else if (!kendiKullandi) {
        // ★ PARALEL SES İNDİRME (16.10, kullanıcı bildirimi: "uzun videolar çok yavaş"):
        //   Ayet sesleri sırayala indiriliyordu — 100+ ayetlik tam sürümde her dosya
        //   ~0.5-1sn bekleyip zincire bağlanınca toplam 1-2 dakika iskelemekti.
        //   Artık TÜM ayetler aynı anda fetch edilir (browser HTTP/2 paralellik ve
        //   önceden yüklü preload'la hızlanır); tarayıcı bağlantı havuzu zaten
        //   6(parallel)/domain sınırână düşürür — bablandırma yok.
        //   Yerleşim SIRASI kWh kıcsaları korunur — ayet sırası forward Order kaydolur.
        setProgress(6);
        const sesAyetiGetir = async (item: SelectedAyah): Promise<{ item: typeof item; buffer: AudioBuffer } | null> => {
          // ★ YEDEK SES ZİNCİRİ (02.10): everyayah → varsa islamic.network —
          //    birincil kaynak kapalıyken üretim ölmesin, ilk sağlıklı kaynak kullanılır.
          for (const sesKaynagi of sesKaynakZinciri(reciter.path, item.s, item.a)) {
            try {
              const response = await fetch(sesKaynagi);
              if (!response.ok) continue;
              const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
              return { item, buffer };
            } catch { /* sıradaki ses kaynağı */ }
          }
          return null;
        };
        const sesSonucları = await Promise.all(selected.map(sesAyetiGetir));
        // ★ 29.10 İKİNCİ ŞANS (kullanıcı: "yine 1 saniyede bitiyor"): ağ dalgalanmasında
        //   birkaç ayet sesi sessizce null'a düşüyordu ve üretim EKSİK sesle devam
        //   ediyordu — "bismil diyor duruyor" tam buydu (yalnız 1. ayet inmiş).
        //   Eksiklere bir kez daha deniyoruz; hâlâ eksik varsa aşağıda dürüst İPTAL.
        const eksikIndex = sesSonucları
          .map((sonuc, i) => (sonuc ? -1 : i))
          .filter((i) => i >= 0);
        if (eksikIndex.length) {
          console.warn("[ses] ilk denemede inemeyen ayetler:", eksikIndex.map((i) => selected[i].a).join(","));
          const ikinciDeneme = await Promise.all(eksikIndex.map((i) => sesAyetiGetir(selected[i])));
          eksikIndex.forEach((i, k) => { sesSonucları[i] = ikinciDeneme[k]; });
        }
        const sesIndelmedi = sesSonucları.filter((sonuc) => !sonuc).length;
        for (const sonuc of sesSonucları) {
          if (!sonuc) continue;
          const { item, buffer } = sonuc;
          if (cursor > 0 && cursor + buffer.duration > cap) break;
          audioOffsets.push(cursor); buffers.push(buffer); usedItems.push(item);
          ayetSüreleri.push({ start: cursor, dur: buffer.duration });
          cursor += buffer.duration + .03;
        }
        // ★ 29.10 DÜRÜST İPTAL: ayet sesin bir kısmı İNEMEDİYSE üretimi ZORLA bitirmeden
        //   durdur — ithal yarım video teslim ETMEK yerine jeton/hak iade akışı çalışır.
        //   (Csv eskiden sessizce "1 ayet sesi + 1sn video" üretiliyordu.)
        if (sesIndelmedi > 0) {
          throw new Error(`Ses dosyaları alınamadı (${sesIndelmedi} ayet 2 denemede inemedi)`);
        }
        setProgress(26);
      }
      if (!kendiKullandi && !surahOnlyReciter && usedItems.length < selected.length) {
        const dropped = selected.length - usedItems.length;
        const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm (24:35)";
        notify(ttX2610("vgSureAsildi").replace("{m}", String(modeLabel)).replace("{d}", String(dropped)).replace("{n}", String(usedItems.length)));
      }
      if (!buffers.length) throw new Error("Ses dosyaları alınamadı");
      // ★ YARIM İNME KÖK ÇÖZÜMÜ (27.10, kullanıcı bildirimi: "ayet başlamadan video iniyor"):
      //   Kayıt 250ms player'dan SONRA başlıyor — timeline'ın ilk 250ms'i kayda GİRMİYOR,
      //   ilk ayetin ilk heceleri kesik duyuluyordu. Artık timeline'ın başına 0.4 sn
      //   SESSİZ bant koyulur: recorder'ın ön-başı sessizliğe denk gelir — ne ilk hece
      //   kaybolur ne son hece kesilir (onended flush payı ayrıca var).
      const SES_BASLAMA_REZERV = 0.4;
      for (let i = 0; i < audioOffsets.length; i += 1) audioOffsets[i] += SES_BASLAMA_REZERV;
      for (const sureSüresi of ayetSüreleri) sureSüresi.start += SES_BASLAMA_REZERV;
      cursor += SES_BASLAMA_REZERV;
      const total = cursor - .03, offline = new OfflineAudioContext(2, Math.ceil((total + .1) * 48000), 48000);
      buffers.forEach((buffer, index) => { const source = offline.createBufferSource(), gain = offline.createGain(); source.buffer = buffer; const start = audioOffsets[index], end = start + buffer.duration; const fadeIn = Math.min(.06, buffer.duration * .1), fadeOut = Math.min(.15, buffer.duration * .1); gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.92, start + fadeIn); gain.gain.setValueAtTime(.92, Math.max(start + fadeIn, end - fadeOut)); gain.gain.linearRampToValueAtTime(0.001, end); source.connect(gain).connect(offline.destination); source.start(start); });
      setProgress(28); const rendered = await offline.startRendering(), canvas = canvasRef.current; if (!canvas) throw new Error("Önizleme bulunamadı");

      // ★ 29.10 KİLİTLİ KLİPS KORUMASI (kullanıcı: "video yine aynı çıktı"): üretim
      //   motoru seçili klipsin üyelik seviyesini SORGULAMADAN kullanıyordu — kilitli
      //   klips imzalanamayınca (403) arka plan yüklenmiyor, video bozuk iniyordu.
      //   Artık erişilemeyen klips yerine ERİŞİLEBİLİR yedek atmosfer konur; üretim
      //   sağlam çıkar ve kullanıcıya dürüst bilgi verilir.
      let yedekKlipsSayisi = 0;
      const yedekEmrini = isMasterSürüm || user?.isAdmin === true;
      const renderClips = usedItems.map((item, ayetIdx) => {
        const org = ayahBackgroundsRef.current[item.id] || backgroundRef.current;
        if (org.cat === "yuklenenler" || !klipsSaglikliMi(org) || klipsErisildiMi(accessTier, org, yedekEmrini)) {
          if (org.cat !== "yuklenenler" && !klipsSaglikliMi(org)) yedekKlipsSayisi += 1; // ölü dosya → yedekle
          else if (org.cat !== "yuklenenler" && !klipsErisildiMi(accessTier, org, yedekEmrini)) yedekKlipsSayisi += 1; // kilitli → yedekle
        }
        if (org.cat === "yuklenenler") return org;
        if (!klipsSaglikliMi(org) || !klipsErisildiMi(accessTier, org, yedekEmrini)) return yedekAtmosfer(accessTier, yedekEmrini, ayetIdx);
        return org;
      });
      if (yedekKlipsSayisi > 0) {
        console.warn("[klips] üyelik seviyesi dışı atmosferler yedekle değiştirildi:", yedekKlipsSayisi);
        notify(ttX2610("vgKlipsYedek").replace("{x}", String(yedekKlipsSayisi)));
      }      // ★★★ 29.10 DOSYA SAĞLIĞI — ÖLÜ KLİPS TÜKETEN PİYONU ★★★
      //   getPosterUrl/getVideoUrl Pexels'a düştüğünde 404 alıyordu; yani klips dosyaları
      //   R2'de yok, Pexels'ta da silinmiş. Bunu yakalayıp "ölüm klips" listesine yazıyoruz,
      //   sonra bu klipsleri yedek atmosferle değiştirip TEKRAR yüküyoruz. Hiçbir klips
      //   sağlıksızsa hiç üretim yapmıyoruz.
      const yukleyici = (clip: Clip): Promise<boolean> =>
        new Promise<boolean>((resolve) => {
          if (clip.kind === "img") {
            // ★ Render için 1080p sürümü önceden yükle (keskin çıktı)
            const image = ensureImage(toHiRes(clip.src));
            ensureImage(clip.src); // yedek thumbnail
            if (image.complete && image.naturalWidth > 0) { resolve(true); return; }
            const done = (ok: boolean) => resolve(ok);
            image.addEventListener("load", () => done(true), { once: true });
            image.addEventListener("error", () => done(false), { once: true });
            window.setTimeout(() => done(image.complete && image.naturalWidth > 0), 6000);
            return;
          }
          getVideoUrl(clip).then((primaryUrl) => {
            const video = ensureVideo(primaryUrl, isR2Media(clip) ? undefined : clip.src);
            if (video.readyState >= 2 && video.videoWidth > 0) {
              try { video.currentTime = 0.05; } catch { /* ignore */ }
              video.play().catch(() => undefined);
              resolve(true);
              return;
            }
            const done = (ok: boolean) => {
              if (ok) {
                try { video.currentTime = 0.05; } catch { /* ignore */ }
                video.play().catch(() => undefined);
              }
              resolve(ok);
            };
            video.addEventListener("loadeddata", () => done(true), { once: true });
            video.addEventListener("canplay", () => done(true), { once: true });
            video.addEventListener("error", () => done(false), { once: true });
            video.load();
            window.setTimeout(() => done(video.readyState >= 2 && video.videoWidth > 0), 7000);
            void getPosterUrl(clip).catch(() => undefined);
          }).catch(() => { resolve(false); });
        });

      let uniqueRenderClips = Array.from(new Map(renderClips.map((c) => [c.id, c])).values());
      // ★ 1. tur: mevcut seçimleri yükle, hataları ölüm listesine yaz
      const birinciSonuclar = await Promise.all(uniqueRenderClips.map(async (clip) => ({
        clip, ok: await yukleyici(clip),
      })));
      const olu1 = birinciSonuclar.filter((r) => !r.ok).map((r) => r.clip.id);
      olu1.forEach((id) => { klipsSagliksizIsaretle(id); console.warn("[klips] dosya yükleme hatası — yedeklenecek:", id); });

      // ★ 2. tur: ölü klipsleri yedek atmosferle değiştir ve yeniden dene (2 deneme hakkı).
      //   Yedek atmosfer klipsSaglikliMi filtresinden geçtiği için SAĞLIKLI klip seçilir.
      let oluSayisi = olu1.length;
      let denemeler = 0;
      while (oluSayisi > 0 && denemeler < 2) {
        denemeler += 1;
        // Ayet sırasına göre DEĞİŞTİR (ayetIdx sırayı koruyor — deterministik yedek)
        for (let idx = 0; idx < renderClips.length; idx += 1) {
          const mau = renderClips[idx];
          if (olu1.includes(mau.id) || !klipsSaglikliMi(mau)) {
            const yeni = yedekAtmosfer(accessTier, yedekEmrini, idx + denemeler);
            if (yeni.id !== mau.id) renderClips[idx] = yeni;
          }
        }
        uniqueRenderClips = Array.from(new Map(renderClips.map((c) => [c.id, c])).values());
        const ikinciSonuclar = await Promise.all(uniqueRenderClips.map(async (clip) => ({
          clip, ok: klipsSaglikliMi(clip) ? await yukleyici(clip) : false,
        })));
        const olu2 = ikinciSonuclar.filter((r) => !r.ok).map((r) => r.clip.id);
        olu2.forEach((id) => { klipsSagliksizIsaretle(id); console.warn("[klips] yedek atmosfer de sağlıksız — tekrar yedeklenacak:", id); });
        oluSayisi = olu2.length;
      }
      // ★ 3. tur: HÂLÂ ölü varsa son kez yedekle (yedekAtmosfer kendi filtresiyle SAĞLIKLI seçer).
      if (oluSayisi > 0) {
        for (let idx = 0; idx < renderClips.length; idx += 1) {
          if (!klipsSaglikliMi(renderClips[idx])) renderClips[idx] = yedekAtmosfer(accessTier, yedekEmrini, idx);
        }
      }
      if (olu1.length > 0) {
        console.warn("[klips] " + olu1.length + " klips dosyası yüklenemedi (Pexels/R2 404) — yedek atmosferle değiştirildi");
        const uyarKey = typeof ttX2610("vgKlipsDosyaYedek") === "string" && ttX2610("vgKlipsDosyaYedek") !== "vgKlipsDosyaYedek"
            ? ttX2610("vgKlipsDosyaYedek")
            : "📤 {x} atmosfer dosyası bulunamadı — sağlıklı yedek atmosferle devam ediliyor";
        notify(uyarKey.replace("{x}", String(olu1.length)));
      } else {
        console.log("[klips] tüm atmosferler sağlıklı — dosya yedekleme gerekmedi");
      }

      // ★ Render öncesi tüm seçili videolara ısınma payı ver.
      // R2/CDN ilk frame'i geç getirirse ilk ayetler donuk kaydoluyordu.
      // ★ 04.10: mobilde ısınma 1200ms → 2500ms — telefon tarayıcıları video
      //   decode'u yavaş ısıtıyor; kısa ısınmada ilk ayet donuk kaydoluyordu.
      await new Promise((resolve) => window.setTimeout(resolve, renderQuality.low ? 2500 : 1200));
      const formats = batchFormats.length ? batchFormats : [aspect];
      for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
        const outputAspect = formats[formatIndex]; aspectRef.current = outputAspect;
        let [width, height] = dimensions(outputAspect);
        if (renderQuality.low) {
          width = Math.round(width * 0.66);
          height = Math.round(height * 0.66);
        }
        canvas.width = width; canvas.height = height;
        verseIndexRef.current = 0;
        setVerseIndex(0);
        await new Promise((resolve) => window.setTimeout(resolve, 240));
        // ★ 29.10 UZUN KAYIT IMZA TAZELEME ("tam sürüm 1 sn'de donuyor / yarım iniyor" kök fix):
        //   signed R2 URL cache 540 sn (9 dk) geçerli — 9 dakikadan uzun kayıtlarda
        //   (ör. "Tam Sürüm" 24 dk + birden fazla format) imzalar expire olup video
        //   elementleri tanımsız URL'e düşer → sonraki formatın kaydı SESLIŞ DONUK
        //   iner. Her format başında tüm klips imzalarını paralel tazele.
        await Promise.all(renderClips.map(async (c) => {
          if (c.kind !== "vid") return;
          try { await getVideoUrl(c); } catch { /* eskisi cache'te kalır */ }
        }));
        // ★ Cihaza göre adaptif FPS/bitrate: kötü cihazlarda donma/kasma azaltılır
        // ★★★ 29.10 KAYIT MOTORU + OTO-RETRY ★★★
        //   Yarı/bozuk çıkan kayıt (MediaRecorder çöktü, dosya hedefin %35 altı) —
        //   kullanıcının "yine indirdim video ama yarım kaldı" geri bildirimi üzerine
        //   motoru KODLUYLA 2. KEZ çalıştır: alternatif mime (mp4↔webm) ile tekrar.
        //   İyi çıktı alınırsa kullanıcıya ayrıca haber verilmez, sadece [kayıt] satırı.
        let kayitDeneme = 0;
        let birinciMime = pickMime();
        let yarimUyarildi = false;
        const yarimUyar = () => { if (!yarimUyarildi) { yarimUyarildi = true; notify(ttX2610("vgYarimVideo")); } };
        let kayitSonuc: { blob: Blob; mime: string | null; recordedMs: number } | null = null;
        while (kayitDeneme < 2) {
          const alternatifMime = kayitDeneme === 0 ? birinciMime : (birinciMime || "").includes("mp4") ? "video/webm;codecs=vp8,opus" : "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
          const stream = canvas.captureStream(renderQuality.renderFps), destination = audioContext.createMediaStreamDestination(), player = audioContext.createBufferSource(); player.buffer = rendered; player.connect(destination);
          // ★ Bazı Chrome/VLC/WebM kombinasyonlarında canvas capture sadece ilk frame'i yazıyor.
          //   requestFrame destekleniyorsa kayıt boyunca manuel frame pompalıyoruz.
          const canvasTrack = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
          const framePump = window.setInterval(() => {
            try { canvasTrack?.requestFrame?.(); } catch { /* ignore */ }
          }, Math.max(33, Math.floor(1000 / Math.max(12, renderQuality.renderFps))));
          const combined = new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]), mime = alternatifMime;
          const pxCount = width * height;
          const baseBitrate = pxCount >= 1920 * 1080 ? 24_000_000 : pxCount >= 1080 * 1350 ? 20_000_000 : 16_000_000;
          const targetBitrate = Math.round(baseBitrate * renderQuality.bitrateScale);
          const recorder = mime ? new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: targetBitrate, audioBitsPerSecond: renderQuality.audioBitrate }) : new MediaRecorder(combined);
          const chunks: Blob[] = []; recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
          // ★ 29.10 SESSİZ ÖLÜM FİX (kullanıcı: "yine indirdim, yarım kaldı"): MediaRecorder
          //   kodlayıcısı kayıt ortasında hata fırlatırsa onstop yine tetiklenir — akış
          //   sıradan devam eder, dosyada ~1sn veri kalır ve kullanıcıya HABER VERİLMEDEN
          //   yarım video teslim edilirdi. Artık onError → dürüst kapanış + uyarı + retry.
          recorder.onerror = (event) => {
            console.error("[kayıt] MediaRecorder hatası:", (event as unknown as { error?: unknown })?.error);
            yarimUyar();
            finishRecording();
          };
          const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); }); const startedAt = performance.now(); let finished = false; let safetyTimer = 0;
          let lastVisualIndex = 0;
          let lastProgress = -1;
          // ★ syncTimer 50ms → 200ms: çok sık setProgress/setVerseIndex çağrısı
          //   canvas draw'u bloke edip video donmasına yol açıyordu.
          const syncTimer = window.setInterval(() => {
            const elapsed = (performance.now() - startedAt) / 1000;
            const currentProgress = (formatIndex + Math.min(elapsed / total, 1)) / formats.length;
            const nextProgress = 30 + Math.round(currentProgress * 67);
            if (nextProgress !== lastProgress) {
              lastProgress = nextProgress;
              setProgress(nextProgress);
            }
            let idx = 0;
            for (let i = 0; i < ayetSüreleri.length; i += 1) {
              if (elapsed >= ayetSüreleri[i].start) idx = i;
            }
            if (idx !== lastVisualIndex) {
              lastVisualIndex = idx;
              // ★ Render sırasında React state güncellemesi canvas'ı dondurabiliyor.
              //   Kayıtta sadece ref yeterli; UI state'i en sona bırakıyoruz.
              verseIndexRef.current = idx;
              const activeClip = renderClips[idx];
              if (activeClip?.kind === "vid") {
                try {
                  const aktivUrl = getVideoUrlSync(activeClip) || activeClip.src || "";
                  const activeVideo = ensureVideo(aktivUrl, isR2Media(activeClip) ? activeClip.src : undefined);
                  const localTime = Math.max(0, elapsed - (ayetSüreleri[idx]?.start ?? 0));
                  if (Number.isFinite(activeVideo.duration) && activeVideo.duration > 0.4) {
                    const nextTime = (localTime % Math.max(0.5, activeVideo.duration - 0.1));
                    if (Math.abs(activeVideo.currentTime - nextTime) > 0.75) activeVideo.currentTime = nextTime;
                  }
                  activeVideo.play().catch(() => undefined);
                } catch { /* ignore */ }
              }
            }
          }, 200);
          const finishRecording = () => {
            if (finished) return; finished = true; window.clearInterval(syncTimer); window.clearInterval(framePump); window.clearTimeout(safetyTimer);
            // ★ 27.10 DÜRÜST UYARI: kayıt hedef sürenin erken kesilirse (tarayıcı motoru
            //   MediaRecorder'ı düşürdüğünde / çöktüğünde) kullanıcıya "yarım inmiş olabilir"
            //   uyarısı ver — sessizce yarım dosya teslim EDİLMEZ.
            const kayitSure = (performance.now() - startedAt) / 1000;
            if (!userStopped && total > 6 && kayitSure < total - Math.min(1.5, total * 0.08)) yarimUyar();
            try { player.stop(); } catch { } if (recorder.state !== "inactive") recorder.stop();
          };
          const userStop = () => { userStopped = true; finishRecording(); };
          stopGenerationRef.current = userStop;
          safetyTimer = window.setTimeout(finishRecording, total * 1000 + 1200);
          // ★ 27.10 SON HECE FIX: onended'dan HEMEN recorder.stop etmek son ses bloğunu
          //   kesiyordu ("son cümle yarım duyuluyor" şikâyeti) — flush payı konur.
          player.onended = () => window.setTimeout(finishRecording, 900); // ★ 29.10: 450→900 flush payı, son hece kayıt altında kaçmasın
          // ★ 1 saniyelik parçalar halinde data al: uzun WebM buffer'ı donuk video üretebiliyor.
          // ★ 04.10 MOBİL: recorder.start'tan ~250ms ÖNCE player başlar + küçük tolerate.
          //   Mobil tarayıcıda MediaRecorder, MediaStream'e sonradan katılan ses kanalını
          //   bazı sürümlerde tam almıyordu → ilk ayet sesi + donuk kare. Önce player,
          //   250ms sonra recorder — ses kanalı kayıt başladığında AKTİF oluyor.
          player.start();
          await new Promise((resolve) => window.setTimeout(resolve, 250));
          // ★ 29.10 1-SANİYE KESİLME FİX (kullanıcı: "seçtiğim ayet 1 saniyede kapanıyor"):
          //   Chrome'un MediaRecorder MP4 muxer'ında start(timeslice) kombinasyonunda
          //   bilinen hata: yalnızca İLK 1s'lik parça düzgünlü yazılıyor — dosya 51sn
          //   görünüyor ama içerik 1sn'de kesiliyor. WebM'de timeslice sorun çıkarmıyor.
          //   MP4 modunda timeslice'sız başlat; WebM'de 1s parçalar korunuyor.
          if (mime && mime.includes("mp4")) {
            recorder.start();
          } else {
            recorder.start(1000);
          }
          await stopped;
          window.clearInterval(framePump);
          stream.getTracks().forEach((track) => track.stop());
          destination.stream.getTracks().forEach((track) => track.stop());
          if (userStopped) { notify(ttX2610("vgIptal")); break; }
          let blob = new Blob(chunks, { type: (mime || "video/webm").split(";")[0] });
          // ★ 29.10 BOŞ/BOYUT DOĞRULAMASI + OTO-RETRY: kodlayıcı öldüyse 0 dosya bile gelebilir.
          const hedefByte = ((targetBitrate + (renderQuality.audioBitrate || 128_000)) / 8) * total;
          const dolulukOrani = hedefByte > 0 ? blob.size / hedefByte : 1;
          const kayitSureFinal = (performance.now() - startedAt) / 1000;
          const erkenDurmus = total > 6 && kayitSureFinal < total * 0.92;
          const bozuk = blob.size < 1024 || erkenDurmus || (!userStopped && total > 6 && dolulukOrani < 0.35);
          if (!bozuk) { kayitSonuc = { blob, mime, recordedMs: Math.max(1000, Math.round(kayitSureFinal * 1000)) }; break; }
          kayitDeneme += 1;
          if (kayitDeneme < 2) {
            console.warn("[kayıt] bozuk çıktı — alternatif mime ile tekrar:", blob.size, "byte · oran", dolulukOrani.toFixed(2), erkenDurmus ? "(erken kesildi)" : "");
            continue;
          }
          yarimUyar();
        }
        if (userStopped) { notify(ttX2610("vgIptal")); continue; }
        if (!kayitSonuc) continue;
        let blob = kayitSonuc.blob;
        const recordedMs = kayitSonuc.recordedMs;


        if (blob.type.includes("webm")) {
          blob = await new Promise<Blob>((resolve) => {
            let settled = false;
            const finish = (fixed: Blob) => { if (!settled) { settled = true; resolve(fixed); } };
            try {
              // TikTok/WhatsApp/Galeri için duration metadata düzelt
              fixWebmDuration(blob, recordedMs, (fixedBlob) => {
                // MP4 olarak da dene (daha iyi uyumluluk)
                if (fixedBlob && fixedBlob.size > 0) {
                  finish(fixedBlob);
                } else {
                  finish(blob);
                }
              });
              // Fallback: 5 saniye içinde düzelmezse orijinali kullan
              window.setTimeout(() => finish(blob), 5000);
            } catch (err) {
              console.error('fixWebmDuration hatası:', err);
              finish(blob);
            }
          });
        }
        // ★ 29.10 DÜRÜST SÜRE: çıkış listesi / galeri HİLE yapmasın — dosyadan ölçülen
        //   gerçek oynatma süresi yazılır (ölçüm başarısızsa hedef süreye düşer).
        const olculenSure = await kayitSuresiniOlc(blob);
        const kayitSureDurst = olculenSure > 0.5 ? olculenSure : total;
        const output: Output = { id: uid(), url: URL.createObjectURL(blob), mime: blob.type, size: blob.size, duration: kayitSureDurst, label: `${usedItems[0].sName} ${usedItems[0].s}:${usedItems[0].a}${usedItems.length > 1 ? ` +${usedItems.length - 1}` : ""} • ${kendiKullandi ? "🎙️ Kendi sesin" : reciter.name} • ${outputAspect}`, ext: blob.type.includes("mp4") ? "mp4" : "webm" };
        setOutputs((current) => [output, ...current].slice(0, 5)); setActiveOutputId(output.id);
        // ★ IndexedDB'ye sakla: sayfa yenilense (ör. misafir üye girişi sonrası) video kaybolmaz,
        //   açılışta otomatik geri yüklenir. İndirme yetkisi buradan yönetilmez (user kontrolü ayrı).
        void storeVideo({ id: output.id, label: output.label, mime: output.mime, ext: output.ext, size: output.size, duration: output.duration, blob });
        // ★ ÜRETİCİ İSTATİSTİĞİ (İş 42) — başarılı üretimde yerel sayaç +1 (cihazda kalır)
        try { uretimIstYaz(mode); window.dispatchEvent(new Event("uretim-istatistik")); } catch { /* yoksay */ }
      }
      if (!isMasterSürüm && !userStopped && !jetonCharged) {
        setProgress(98);
        if (isGuest) {
          // ★ Misafir: jeton düşmez, sadece deneme hakkı azalır
          bumpGuestUsed();
        }
        jetonCharged = true;
        // Authenticated production rights are consumed atomically by /api/render/authorize.
      }
      if (userStopped) { audioContext.close().catch(() => undefined); return; }
      audioContext.close().catch(() => undefined); setProgress(100);
      notify(t("successVideoReady"));
    } catch (error) {
      console.error(error);
      reportRenderError(error);
      // ★ HAK İADESİ (09.10): teknik hatada düşen üretim hakkını GERİ VER.
      //   userStopped (kullanıcı kendi durdurursa) iade kapsamı dışıdır —
      //   o durumda jeton/hak düşümünü sunucu erken yapmadı, kayıp yok.
      if (!userStopped && !isMasterSürüm && !isGuest && !isAdmin && authorizeFormats > 0) {
        try {
          const refundResponse = await fetch("/api/payments/wallet-refund", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: authorizeKind, amount: authorizeFormats }),
          });
          const refundData = await refundResponse.json().catch(() => null) as { ok?: boolean } | null;
          if (refundResponse.ok && refundData?.ok) {
            notify(ttX2610("vgIade"));
          } else {
            notify(ttX2610("vgIadeHatasi"));
          }
        } catch { /* iade servisine ulaşılamadı — kullanıcıya sessiz kal, yukarıda mesaj var */ }
      }
      // ★ TAM TARAMA (29.09): "Ses dosyaları alınamadı" artık anlaşılır Türkçe mesaj veriyor
      if (!userStopped) notify(error instanceof Error && error.message.includes("Ses dosyaları alınamadı")
        ? "⚠️ Hoca sesleri indirilemedi — internet bağlantını kontrol edip tekrar dene"
        : "Video üretimi sırasında teknik bir takılma oluştu");
    }
    finally { aspectRef.current = aspect; setGenerating(false); window.setTimeout(() => setProgress(0), 500); }
  }, [aspect, batchFormats, generating, jetonCount, mode, notify, reciter, kendiSesAktif, selected, silenceAllAudio, t, accessTier, isMasterSürüm, user, ensureImage, ensureVideo, renderQuality.renderFps, renderQuality.bitrateScale, renderQuality.audioBitrate, showGenerateConfirm, setOutputs, setActiveOutputId, setVerseIndex, setGenerating, setProgress, setLoginTab, setModal]);
}
