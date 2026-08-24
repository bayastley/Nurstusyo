import { useCallback, type MutableRefObject } from "react";
import fixWebmDuration from "fix-webm-duration";
import { reciterAudioUrl } from "../reciters";
import { checkRateLimit } from "../rateLimiter";
import { JETON, getJeton, setJeton as persistJetonSecure, videoMaliyeti } from "../tier";
import { reportRenderError } from "../debugGuide";
import { SURAHS } from "../data";
import { getPosterUrl, getVideoUrl, getVideoUrlSync } from "../videoUrl";
import { toHiRes, type Clip } from "../clips";
import { dimensions, isWholeSurahSelected, pickMime, uid } from "./studioHelpers";
import type { Aspect, Mode, Output, SelectedAyah, User } from "../types";
import { GUEST_FREE_VIDEOS } from "./useGuestTrial";

interface UseVideoGeneratorParams {
  generating: boolean;
  setGenerating: (value: boolean) => void;
  setProgress: (value: number | ((value: number) => number)) => void;
  stopGenerationRef: MutableRefObject<() => void>;
  user: User | null;
  isMasterSürüm: boolean;
  getGuestUsed: () => number;
  bumpGuestUsed: () => void;
  setLoginTab: (value: "login" | "register" | "forgot" | "verify") => void;
  setModal: (value: "login" | null) => void;
  notify: (message: string) => void;
  selected: SelectedAyah[];
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  reciter: any;
  batchFormats: Aspect[];
  aspect: Aspect;
  mode: Mode;
  accessTier: any;
  renderAuthLive: boolean;
  jetonCount: number;
  setJetonCount: (value: number) => void;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  silenceAllAudio: () => void;
  ayahBackgroundsRef: MutableRefObject<Record<string, Clip>>;
  backgroundRef: MutableRefObject<Clip>;
  ensureImage: (url: string) => HTMLImageElement;
  ensureVideo: (url: string, fallbackUrl?: string) => HTMLVideoElement;
  renderQuality: { renderFps: number; bitrateScale: number; audioBitrate: number };
  aspectRef: MutableRefObject<Aspect>;
  verseIndexRef: MutableRefObject<number>;
  setVerseIndex: (value: number | ((value: number) => number)) => void;
  setOutputs: (value: (current: Output[]) => Output[]) => void;
  setActiveOutputId: (value: string) => void;
  t: (key: any) => string;
}

export function useVideoGenerator(params: UseVideoGeneratorParams) {
  return useCallback(async () => {
    const {
      generating,
      setGenerating,
      setProgress,
      stopGenerationRef,
      user,
      isMasterSürüm,
      getGuestUsed,
      bumpGuestUsed,
      setLoginTab,
      setModal,
      notify,
      selected,
      canvasRef,
      reciter,
      batchFormats,
      aspect,
      mode,
      accessTier,
      renderAuthLive,
      jetonCount,
      setJetonCount,
      openPremium,
      silenceAllAudio,
      ayahBackgroundsRef,
      backgroundRef,
      ensureImage,
      ensureVideo,
      renderQuality,
      aspectRef,
      verseIndexRef,
      setVerseIndex,
      setOutputs,
      setActiveOutputId,
      t,
    } = params;

    if (generating) {
      stopGenerationRef.current();
      return;
    }

    if (!user && !isMasterSürüm) {
      const used = getGuestUsed();
      if (used >= GUEST_FREE_VIDEOS) {
        notify("🎁 Misafir deneme hakkın doldu · Google ile 3 saniyede ücretsiz üye ol");
        setLoginTab("register");
        setModal("login");
        return;
      }
      notify(`👋 Misafir denemesi ${used + 1}/${GUEST_FREE_VIDEOS} · indirmek için üyelik gerekir`);
    }

    const rl = checkRateLimit("video");
    if (!rl.allowed) {
      notify(`${rl.message} (${Math.ceil(rl.retryAfterMs / 1000)} sn kaldı)`);
      return;
    }
    if (!selected.length) { notify("Önce en az bir ayet seçin"); return; }
    if (!window.MediaRecorder) { notify("Tarayıcınız video üretimini desteklemiyor"); return; }

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
    const totalCost = isMasterSürüm || isGuest ? 0 : costPerVideo * formatCount;

    if (renderAuthLive && !isMasterSürüm && !isGuest) {
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
        if (typeof data.cost === "number" && data.cost !== totalCost) {
          notify("Üretim maliyeti sunucu doğrulamasıyla uyuşmadı");
          return;
        }
      } catch {
        notify("Üretim yetkisi için sunucuya ulaşılamadı");
        return;
      }
    }

    if (jetonCount < totalCost) {
      notify(`Bu üretim için ${totalCost} hak gerekiyor · mevcut: ${jetonCount}`);
      openPremium("jeton");
      return;
    }

    let charged = false;
    let userStopped = false;
    silenceAllAudio();
    setGenerating(true);
    setProgress(2);

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const buffers: AudioBuffer[] = [];
      const usedItems: SelectedAyah[] = [];
      const audioOffsets: number[] = [];
      const ayahDurations: Array<{ start: number; dur: number }> = [];
      const cap = mode === "short" ? 59 : mode === "long" ? 600 : JETON.TAM_SURUM_CAP_SANIYE;
      let cursor = 0;

      if (surahOnlyReciter) {
        setProgress(10);
        const sNum = selected[0].s;
        const url = reciter.surahPattern!.replace("{S}", String(sNum).padStart(3, "0"));
        selected.forEach((item) => { ayahBackgroundsRef.current[item.id] = backgroundRef.current; });
        try {
          const response = await fetch(url);
          if (response.ok) {
            const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
            audioOffsets.push(0);
            buffers.push(buffer);
            usedItems.push(...selected);
            cursor = Math.min(buffer.duration, cap) + 0.03;
            const sureSuresi = cursor - 0.03;
            const eachAyah = sureSuresi / Math.max(selected.length, 1);
            selected.forEach((_, i) => { ayahDurations.push({ start: eachAyah * i, dur: eachAyah }); });
          }
        } catch { /* ignore */ }
      } else {
        for (let index = 0; index < selected.length; index += 1) {
          const item = selected[index];
          setProgress(4 + Math.round((index / selected.length) * 22));
          try {
            const response = await fetch(reciterAudioUrl(reciter.path, item.s, item.a));
            if (!response.ok) continue;
            const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
            if (cursor > 0 && cursor + buffer.duration > cap) break;
            audioOffsets.push(cursor);
            buffers.push(buffer);
            usedItems.push(item);
            ayahDurations.push({ start: cursor, dur: buffer.duration });
            cursor += buffer.duration + 0.03;
          } catch { /* ignore */ }
        }
      }

      if (!surahOnlyReciter && usedItems.length < selected.length) {
        const dropped = selected.length - usedItems.length;
        const modeLabel = mode === "short" ? "Kısa (59 sn)" : mode === "long" ? "Uzun (600 sn)" : "Tam Sürüm";
        notify(`⚠️ ${modeLabel} süresi aşıldı · son ${dropped} ayet eklenmedi · ${usedItems.length} ayet ile üretiliyor`);
      }
      if (!buffers.length) throw new Error("Ses dosyaları alınamadı");

      const total = cursor - 0.03;
      const offline = new OfflineAudioContext(2, Math.ceil((total + 0.1) * 48000), 48000);
      buffers.forEach((buffer, index) => {
        const source = offline.createBufferSource();
        const gain = offline.createGain();
        source.buffer = buffer;
        const start = audioOffsets[index];
        const end = start + buffer.duration;
        const fadeIn = Math.min(0.06, buffer.duration * 0.1);
        const fadeOut = Math.min(0.15, buffer.duration * 0.1);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.92, start + fadeIn);
        gain.gain.setValueAtTime(0.92, Math.max(start + fadeIn, end - fadeOut));
        gain.gain.linearRampToValueAtTime(0.001, end);
        source.connect(gain).connect(offline.destination);
        source.start(start);
      });

      setProgress(28);
      const rendered = await offline.startRendering();
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Önizleme bulunamadı");

      const renderClips = usedItems.map((item) => ayahBackgroundsRef.current[item.id] || backgroundRef.current);
      const uniqueRenderClips = Array.from(new Map(renderClips.map((clip) => [clip.id, clip])).values());
      await Promise.all(uniqueRenderClips.map((clip) => new Promise<void>((resolve) => {
        if (clip.kind === "img") {
          const image = ensureImage(toHiRes(clip.src));
          ensureImage(clip.src);
          if (image.complete && image.naturalWidth > 0) { resolve(); return; }
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          window.setTimeout(done, 6000);
          return;
        }
        getVideoUrl(clip).then((primaryUrl) => {
          const video = ensureVideo(primaryUrl, clip.src);
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

      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      const formats = batchFormats.length ? batchFormats : [aspect];
      for (let formatIndex = 0; formatIndex < formats.length; formatIndex += 1) {
        const outputAspect = formats[formatIndex];
        aspectRef.current = outputAspect;
        const [width, height] = dimensions(outputAspect);
        canvas.width = width;
        canvas.height = height;
        verseIndexRef.current = 0;
        setVerseIndex(0);
        await new Promise((resolve) => window.setTimeout(resolve, 240));

        const stream = canvas.captureStream(renderQuality.renderFps);
        const destination = audioContext.createMediaStreamDestination();
        const player = audioContext.createBufferSource();
        player.buffer = rendered;
        player.connect(destination);
        const canvasTrack = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
        const framePump = window.setInterval(() => { try { canvasTrack?.requestFrame?.(); } catch { /* ignore */ } }, Math.max(33, Math.floor(1000 / Math.max(12, renderQuality.renderFps))));
        const combined = new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
        const mime = pickMime();
        const pxCount = width * height;
        const baseBitrate = pxCount >= 1920 * 1080 ? 24_000_000 : pxCount >= 1080 * 1350 ? 20_000_000 : 16_000_000;
        const targetBitrate = Math.round(baseBitrate * renderQuality.bitrateScale);
        const recorder = mime ? new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: targetBitrate, audioBitsPerSecond: renderQuality.audioBitrate }) : new MediaRecorder(combined);
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
        const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
        const startedAt = performance.now();
        let finished = false;
        let safetyTimer = 0;
        let lastVisualIndex = 0;
        let lastProgress = -1;
        const syncTimer = window.setInterval(() => {
          const elapsed = (performance.now() - startedAt) / 1000;
          const currentProgress = (formatIndex + Math.min(elapsed / total, 1)) / formats.length;
          const nextProgress = 30 + Math.round(currentProgress * 67);
          if (nextProgress !== lastProgress) { lastProgress = nextProgress; setProgress(nextProgress); }
          let idx = 0;
          for (let i = 0; i < ayahDurations.length; i += 1) if (elapsed >= ayahDurations[i].start) idx = i;
          if (idx !== lastVisualIndex) {
            lastVisualIndex = idx;
            verseIndexRef.current = idx;
            const activeClip = renderClips[idx];
            if (activeClip?.kind === "vid") {
              try {
                const activeVideo = ensureVideo(getVideoUrlSync(activeClip), activeClip.src);
                const localTime = Math.max(0, elapsed - (ayahDurations[idx]?.start ?? 0));
                if (Number.isFinite(activeVideo.duration) && activeVideo.duration > 0.4) {
                  const nextTime = localTime % Math.max(0.5, activeVideo.duration - 0.1);
                  if (Math.abs(activeVideo.currentTime - nextTime) > 0.75) activeVideo.currentTime = nextTime;
                }
                activeVideo.play().catch(() => undefined);
              } catch { /* ignore */ }
            }
          }
        }, 200);

        const finishRecording = () => {
          if (finished) return;
          finished = true;
          window.clearInterval(syncTimer);
          window.clearInterval(framePump);
          window.clearTimeout(safetyTimer);
          try { player.stop(); } catch { /* ignore */ }
          if (recorder.state !== "inactive") recorder.stop();
        };
        const userStop = () => { userStopped = true; finishRecording(); };
        stopGenerationRef.current = userStop;
        safetyTimer = window.setTimeout(finishRecording, total * 1000 + 750);
        player.onended = finishRecording;
        recorder.start(1000);
        player.start();
        await stopped;
        window.clearInterval(framePump);
        stream.getTracks().forEach((track) => track.stop());
        destination.stream.getTracks().forEach((track) => track.stop());
        if (userStopped) { chunks.length = 0; notify("Üretim iptal edildi · hak düşmedi"); continue; }

        let blob = new Blob(chunks, { type: (mime || "video/webm").split(";")[0] });
        const recordedMs = Math.max(1000, Math.round(performance.now() - startedAt));
        if (blob.type.includes("webm")) {
          blob = await new Promise<Blob>((resolve) => {
            let settled = false;
            const finish = (fixed: Blob) => { if (!settled) { settled = true; resolve(fixed); } };
            try {
              fixWebmDuration(blob, recordedMs, (fixedBlob) => finish(fixedBlob && fixedBlob.size > 0 ? fixedBlob : blob));
              window.setTimeout(() => finish(blob), 5000);
            } catch {
              finish(blob);
            }
          });
        }
        const output: Output = {
          id: uid(),
          url: URL.createObjectURL(blob),
          mime: blob.type,
          size: blob.size,
          duration: total,
          label: `${usedItems[0].sName} ${usedItems[0].s}:${usedItems[0].a}${usedItems.length > 1 ? ` +${usedItems.length - 1}` : ""} • ${reciter.name} • ${outputAspect}`,
          ext: blob.type.includes("mp4") ? "mp4" : "webm",
        };
        setOutputs((current) => [output, ...current].slice(0, 8));
        setActiveOutputId(output.id);
      }

      if (!isMasterSürüm && !userStopped && !charged) {
        setProgress(98);
        if (isGuest) bumpGuestUsed();
        else {
          const remainingJeton = Math.max(0, getJeton() - totalCost);
          persistJetonSecure(remainingJeton);
          setJetonCount(remainingJeton);
        }
        charged = true;
      }
      if (userStopped) { audioContext.close().catch(() => undefined); return; }
      audioContext.close().catch(() => undefined);
      setProgress(100);
      notify(t("successVideoReady"));
    } catch (error) {
      reportRenderError(error);
      if (!userStopped) notify("Video üretimi sırasında teknik bir takılma oluştu");
    } finally {
      aspectRef.current = aspect;
      setGenerating(false);
      window.setTimeout(() => setProgress(0), 500);
    }
  }, [params]);
}