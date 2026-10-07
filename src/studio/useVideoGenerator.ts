import { useCallback, type MutableRefObject } from "react";
import fixWebmDuration from "fix-webm-duration";
import { sesKaynakZinciri } from "../reciters";
import { checkRateLimit } from "../rateLimiter";
import { JETON, videoMaliyeti, type Tier } from "../tier";
import { reportRenderError } from "../debugGuide";
import { SURAHS } from "../data";
import { getPosterUrl, getVideoUrl, getVideoUrlSync, isR2Media } from "../videoUrl";
import { toHiRes, type Clip } from "../clips";
import { dimensions, isWholeSurahSelected, pickMime, uid } from "./studioHelpers";
import type { KendiSesAktif } from "./useKendiSes";
import { storeVideo } from "./videoStore";
import { checkGuestGate, bumpGuestUsed } from "./useGuestTrial";
import { telifUyarisiGerekli } from "../telifUyari";
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
  batchFormats: Aspect[];
  aspect: Aspect;
  mode: Mode;
  accessTier: Tier;
  jetonCount: number;
  silenceAllAudio: () => void;
  // ★ Telif uyarısı akışı: ilk üretim basışında bir kere uyarı → kabulde otomatik devam
  telifDevamRef: MutableRefObject<boolean>;
  setTelifTetik: (updater: (value: number) => number) => void;
  // ★ Üretim Onay Balonu — free/pro kullanıcılar için maliyet onayı
  showGenerateConfirm: (cost: number, remaining: number, formatCount: number, mode: string) => Promise<boolean>;
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
    stopGenerationRef,
    user,
    isMasterSürüm,
    setLoginTab,
    setModal,
    notify,
    selected,
    canvasRef,
    reciter,
    kendiSesAktif,
    batchFormats,
    aspect,
    mode,
    accessTier,
    jetonCount,
    silenceAllAudio,
    telifDevamRef,
    setTelifTetik,
    showGenerateConfirm,
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

  return useCallback(async () => {
    if (generating) { stopGenerationRef.current(); return; }
    // ★ MİSAFİR DENEME + KÖTÜYE KULLANIM FRENİ: üye olmayan da kalan hakkı varsa
    //   deneme videosu üretebilir ama: (1) toplam 2 hak, (2) günde en fazla 4 üretim
    //   (sayaç silse bile), (3) iki üretim arası 2 dk cooldown — F5 spam ile seri
    //   üretim imkansız. Hakkı/günü biten misafir kayıt modalına yönlendirilir.
    const misafirGate = user || isMasterSürüm ? { allowed: true, remaining: 0 } : checkGuestGate();
    if (!user && !isMasterSürüm) {
      if (misafirGate.reason === "bekle") {
        notify(`⏳ Deneme videoları arasında kısa bir mola var · ${misafirGate.retryAfterSec} sn sonra tekrar dene`);
        return;
      }
      if (misafirGate.reason === "günlük-sınır") {
        notify("🌙 Bugünkü deneme hakkın doldu · yarın tekrar gelirsin ya da hemen ücretsiz üye olabilirsin");
        setLoginTab("register");
        setModal("login");
        return;
      }
      if (!misafirGate.allowed) {
        notify("🎁 Ücretsiz deneme hakkın bitti · Google ile 3 saniyede üye ol, +5 üretim hakkı kazan");
        setLoginTab("register");
        setModal("login");
        return;
      }
    }
    const rl = checkRateLimit("video");
    if (!rl.allowed) {
      notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`);
      return;
    }
    if (!selected.length) { notify("Önce en az bir ayet seçin"); return; }
    if (!window.MediaRecorder) { notify("Tarayıcınız video üretimini desteklemiyor"); return; }
    // ★ TELİF UYARISI — SADECE İLK üretim basışında BİR KERE:
    //   uyarı kabul edilmemişse bayrak konur, uyarı açılır; "Anladım" deyince
    //   üretim otomatik kaldığı yerden DEVAM eder (ikinci tıklama gerekmez).
    //   Girişte/refresh'te ASLA çıkmaz — sadece üretim akışı tetikler.
    if (telifUyarisiGerekli()) {
      telifDevamRef.current = true;
      setTelifTetik((v) => v + 1);
      return;
    }
    // ★ Safari / eski tarayıcı: canvas yakalama yoksa net uyarı (iOS Safari 15 altı)
    const canvasEl = canvasRef.current;
    if (!canvasEl || typeof canvasEl.captureStream !== "function") {
      notify("⚠️ Bu tarayıcı canvas kaydını desteklemiyor · Chrome, Edge veya güncel Safari kullanın");
      return;
    }
    const surahOnlyReciter = Boolean(reciter.surahPattern);
    if (surahOnlyReciter && !isWholeSurahSelected(selected, SURAHS)) {
      notify(`⚠️ ${reciter.name} hocanın sesi yalnızca tüm surede uygulanabilir · lütfen "Tüm Sure" butonuyla ekleyin`);
      return;
    }
    const formatCount = Math.max(batchFormats.length, 1);
    const costPerVideo = videoMaliyeti(mode, accessTier);
    const isGuest = !user && !isMasterSürüm;
    // God Mode ve misafir deneme videolarında jeton harcanmaz
    const isAdmin = user?.isAdmin === true;
    const totalCost = isMasterSürüm || isGuest || isAdmin ? 0 : costPerVideo * formatCount;
    if (!isMasterSürüm && !isGuest) {
      try {
        const response = await fetch("/api/render/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, formats: batchFormats.length ? batchFormats : [aspect] }),
        });
        const data = await response.json().catch(() => null) as { ok?: boolean; error?: string; cost?: number } | null;
        if (!response.ok || !data?.ok) {
          notify(data?.error || "Üretim yetkisi doğrulanamadı");
          return;
        }
      } catch {
        notify("Üretim yetkisi için sunucuya ulaşılamadı");
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
      const confirmed = await showGenerateConfirm(totalCost, jetonCount, formatCount, mode);
      if (!confirmed) return;
    }
    let jetonCharged = false;
    let userStopped = false;
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
        notify(`⚠️ Kendi sesin ${kendi.sure}. suresine ait — seçili ayetlerle uyuşmuyor, hocanın sesiyle üretiliyor`);
      }
      if (kendi && kendiUygun) {
        try {
          setProgress(8);
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
            if (cursor > 0 && cursor + seg.dur > cap) { dustu += 1; continue; }
            const parcasi = ayetParcasi(tamBuffer, seg, audioContext);
            audioOffsets.push(cursor); buffers.push(parcasi); usedItems.push(item);
            ayetSüreleri.push({ start: cursor, dur: parcasi.duration });
            cursor += parcasi.duration + .03;
          }
          if (buffers.length) {
            kendiKullandi = true;
            notify(`🎙️ Video kendi sesinle üretiliyor · ${usedItems.length} ayet`);
          }
          if (dustu && buffers.length) notify(`⚠️ ${dustu} ayet kendi sesinle eşleşmedi — o ayetler eklenmedi`);
        } catch {
          notify("⚠️ Kendi sesin çözümlenemedi — hocanın sesiyle devam ediliyor");
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
        for (let index = 0; index < selected.length; index += 1) {
          const item = selected[index]; setProgress(4 + Math.round((index / selected.length) * 22));
          try {
            // ★ YEDEK SES ZİNCİRİ (02.10): everyayah → varsa islamic.network —
            //    birincil kaynak kapalıyken üretim ölmesin, ilk sağlıklı kaynak kullanılır.
            let buffer: AudioBuffer | null = null;
            for (const sesKaynagi of sesKaynakZinciri(reciter.path, item.s, item.a)) {
              try {
                const response = await fetch(sesKaynagi);
                if (!response.ok) continue;
                buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
                break;
              } catch { /* sıradaki ses kaynağı */ }
            }
            if (!buffer) continue;
            if (cursor > 0 && cursor + buffer.duration > cap) break;
            audioOffsets.push(cursor); buffers.push(buffer); usedItems.push(item);
            ayetSüreleri.push({ start: cursor, dur: buffer.duration });
            cursor += buffer.duration + .03;
          } catch { }
        }
      }
      if (!kendiKullandi && !surahOnlyReciter && usedItems.length < selected.length) {
        const dropped = selected.length - usedItems.length;
        const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm (24:35)";
        notify(`⚠️ ${modeLabel} süresi aşıldı · son ${dropped} ayet eklenmedi · ${usedItems.length} ayet ile üretiliyor`);
      }
      if (!buffers.length) throw new Error("Ses dosyaları alınamadı");
      const total = cursor - .03, offline = new OfflineAudioContext(2, Math.ceil((total + .1) * 48000), 48000);
      buffers.forEach((buffer, index) => { const source = offline.createBufferSource(), gain = offline.createGain(); source.buffer = buffer; const start = audioOffsets[index], end = start + buffer.duration; const fadeIn = Math.min(.06, buffer.duration * .1), fadeOut = Math.min(.15, buffer.duration * .1); gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.92, start + fadeIn); gain.gain.setValueAtTime(.92, Math.max(start + fadeIn, end - fadeOut)); gain.gain.linearRampToValueAtTime(0.001, end); source.connect(gain).connect(offline.destination); source.start(start); });
      setProgress(28); const rendered = await offline.startRendering(), canvas = canvasRef.current; if (!canvas) throw new Error("Önizleme bulunamadı");

      const renderClips = usedItems.map((item) => ayahBackgroundsRef.current[item.id] || backgroundRef.current);
      const uniqueRenderClips = Array.from(new Map(renderClips.map((clip) => [clip.id, clip])).values());
      await Promise.all(uniqueRenderClips.map((clip) => new Promise<void>((resolve) => {
        if (clip.kind === "img") {
          // ★ Render için 1080p sürümü önceden yükle (keskin çıktı)
          const image = ensureImage(toHiRes(clip.src));
          ensureImage(clip.src); // yedek thumbnail
          if (image.complete && image.naturalWidth > 0) { resolve(); return; }
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          window.setTimeout(done, 6000);
          return;
        }
        getVideoUrl(clip).then((primaryUrl) => {
          const video = ensureVideo(primaryUrl, isR2Media(clip) ? undefined : clip.src);
          if (video.readyState >= 2 && video.videoWidth > 0) {
            try { video.currentTime = 0.05; } catch { /* ignore */ }
            video.play().catch(() => undefined);
            resolve();
            return;
          }
          const done = () => {
            try { video.currentTime = 0.05; } catch { /* ignore */ }
            video.play().catch(() => undefined);
            resolve();
          };
          video.addEventListener("loadeddata", done, { once: true });
          video.addEventListener("canplay", done, { once: true });
          video.addEventListener("error", done, { once: true });
          video.load();
          window.setTimeout(done, 7000);
          void getPosterUrl(clip).catch(() => undefined);
        }).catch(() => { resolve(); });
      })));
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
        // ★ Cihaza göre adaptif FPS/bitrate: kötü cihazlarda donma/kasma azaltılır
        const stream = canvas.captureStream(renderQuality.renderFps), destination = audioContext.createMediaStreamDestination(), player = audioContext.createBufferSource(); player.buffer = rendered; player.connect(destination);
        // ★ Bazı Chrome/VLC/WebM kombinasyonlarında canvas capture sadece ilk frame'i yazıyor.
        //   requestFrame destekleniyorsa kayıt boyunca manuel frame pompalıyoruz.
        const canvasTrack = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
        const framePump = window.setInterval(() => {
          try { canvasTrack?.requestFrame?.(); } catch { /* ignore */ }
        }, Math.max(33, Math.floor(1000 / Math.max(12, renderQuality.renderFps))));
        const combined = new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]), mime = pickMime();
        const pxCount = width * height;
        const baseBitrate = pxCount >= 1920 * 1080 ? 24_000_000 : pxCount >= 1080 * 1350 ? 20_000_000 : 16_000_000;
        const targetBitrate = Math.round(baseBitrate * renderQuality.bitrateScale);
        const recorder = mime ? new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: targetBitrate, audioBitsPerSecond: renderQuality.audioBitrate }) : new MediaRecorder(combined);
        const chunks: Blob[] = []; recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
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
                const activeVideo = ensureVideo(getVideoUrlSync(activeClip), isR2Media(activeClip) ? undefined : activeClip.src);
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
        const finishRecording = () => { if (finished) return; finished = true; window.clearInterval(syncTimer); window.clearInterval(framePump); window.clearTimeout(safetyTimer); try { player.stop(); } catch { } if (recorder.state !== "inactive") recorder.stop(); };
        const userStop = () => { userStopped = true; finishRecording(); };
        stopGenerationRef.current = userStop;
        safetyTimer = window.setTimeout(finishRecording, total * 1000 + 750);
        player.onended = finishRecording;
        // ★ 1 saniyelik parçalar halinde data al: uzun WebM buffer'ı donuk video üretebiliyor.
        // ★ 04.10 MOBİL: recorder.start'tan ~250ms ÖNCE player başlar + küçük tolerate.
        //   Mobil tarayıcıda MediaRecorder, MediaStream'e sonradan katılan ses kanalını
        //   bazı sürümlerde tam almıyordu → ilk ayet sesi + donuk kare. Önce player,
        //   250ms sonra recorder — ses kanalı kayıt başladığında AKTİF oluyor.
        player.start();
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        recorder.start(1000);
        await stopped;
        window.clearInterval(framePump);
        stream.getTracks().forEach((track) => track.stop());
        destination.stream.getTracks().forEach((track) => track.stop());
        if (userStopped) { chunks.length = 0; notify("Üretim iptal edildi · jeton düşmedi"); continue; }
        let blob = new Blob(chunks, { type: (mime || "video/webm").split(";")[0] });
        // ★ Gerçek kayıt süresi (ms) — hedef süre değil, fiilen kaydedilen süre.
        //   Android galeri / TikTok bu değeri okuduğu için birebir doğru olmalı.
        const recordedMs = Math.max(1000, Math.round(performance.now() - startedAt));
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
        const output: Output = { id: uid(), url: URL.createObjectURL(blob), mime: blob.type, size: blob.size, duration: total, label: `${usedItems[0].sName} ${usedItems[0].s}:${usedItems[0].a}${usedItems.length > 1 ? ` +${usedItems.length - 1}` : ""} • ${kendiKullandi ? "🎙️ Kendi sesin" : reciter.name} • ${outputAspect}`, ext: blob.type.includes("mp4") ? "mp4" : "webm" };
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
      // ★ TAM TARAMA (29.09): "Ses dosyaları alınamadı" artık anlaşılır Türkçe mesaj veriyor
      if (!userStopped) notify(error instanceof Error && error.message.includes("Ses dosyaları alınamadı")
        ? "⚠️ Hoca sesleri indirilemedi — internet bağlantını kontrol edip tekrar dene"
        : "Video üretimi sırasında teknik bir takılma oluştu");
    }
    finally { aspectRef.current = aspect; setGenerating(false); window.setTimeout(() => setProgress(0), 500); }
  }, [aspect, batchFormats, generating, jetonCount, mode, notify, reciter, kendiSesAktif, selected, silenceAllAudio, t, accessTier, isMasterSürüm, user, ensureImage, ensureVideo, renderQuality.renderFps, renderQuality.bitrateScale, renderQuality.audioBitrate, showGenerateConfirm, setOutputs, setActiveOutputId, setVerseIndex, setGenerating, setProgress, setLoginTab, setModal, setTelifTetik]);
}
