import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { reciterAudioUrl, type Reciter } from "../reciters";

// BURASI DÜZELTİLDİ: ../types yerine doğrudan lokal şablon kullanılarak sistemin kilitlenmesi önlendi.
interface SelectedAyah {
  s: number;
  a: number;
}

interface UseVerseAudioPlaybackParams {
  previewPlaying: boolean;
  selected: SelectedAyah[];
  verseIndex: number;
  reciter: Reciter;
  verseAudioRef: MutableRefObject<HTMLAudioElement | null>;
  previewTimerRef: MutableRefObject<number>;
  verseIndexRef: MutableRefObject<number>;
  setPreviewPlaying: (value: boolean) => void;
  setPreviewDuration: (value: number) => void;
  setPreviewTime: (value: number) => void;
  setVerseIndex: Dispatch<SetStateAction<number>>;
  notify: (message: string) => void;
  silenceAudioOnly: () => void;
}

export function useVerseAudioPlayback({
  previewPlaying,
  selected,
  verseIndex,
  reciter,
  verseAudioRef,
  previewTimerRef,
  verseIndexRef,
  setPreviewPlaying,
  setPreviewDuration,
  setPreviewTime,
  setVerseIndex,
  notify,
  silenceAudioOnly,
}: UseVerseAudioPlaybackParams) {
  useEffect(() => {
    silenceAudioOnly();
    if (!previewPlaying || !selected.length) return;
    const current = selected[verseIndex];
    if (!current) return;
    if (current.s === 0) {
      setPreviewDuration(0);
      setPreviewTime(0);
      return;
    }

    const isSurahOnly = Boolean(reciter.surahPattern);
    const audioSrc = isSurahOnly
      ? reciter.surahPattern!.replace("{S}", String(current.s).padStart(3, "0"))
      : reciterAudioUrl(reciter.path, current.s, current.a);
    const audio = new Audio(audioSrc);

    try { (audio as HTMLMediaElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer"; } catch { /* ignore */ }
    audio.preload = "auto";
    audio.volume = 0.9;

    let destroyed = false;
    let ayetTimer = 0;
    const cleanup = () => {
      window.clearTimeout(previewTimerRef.current);
      window.clearInterval(ayetTimer);
      audio.pause();
      audio.src = "";
    };

    if (isSurahOnly) {
      audio.onloadedmetadata = () => {
        if (destroyed) return;
        const surahDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
        setPreviewDuration(surahDuration);
        if (surahDuration <= 0) return;
        const perAyah = surahDuration / Math.max(selected.length, 1);
        const startAt = performance.now();
        ayetTimer = window.setInterval(() => {
          if (destroyed) return;
          const elapsed = (performance.now() - startAt) / 1000;
          setPreviewTime(elapsed);
          const nextIndex = Math.min(Math.floor(elapsed / perAyah), selected.length - 1);
          if (nextIndex !== verseIndexRef.current) setVerseIndex(nextIndex);
        }, 200);
      };
      audio.ontimeupdate = () => { if (!destroyed) setPreviewTime(audio.currentTime); };
      audio.onended = () => {
        if (!destroyed) {
          cleanup();
          setVerseIndex(selected.length - 1);
          setPreviewPlaying(false);
          setPreviewTime(0);
        }
      };
      audio.onerror = () => {
        if (!destroyed) {
          cleanup();
          setPreviewPlaying(false);
          notify("⚠️ Bu kârinin tam sure kaydı yüklenemedi · ayet konumu korundu");
        }
      };
    } else {
      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        window.clearTimeout(previewTimerRef.current);
        window.clearInterval(ayetTimer);
        setPreviewTime(0);
        if (verseIndex < selected.length - 1) setVerseIndex((index) => index + 1);
        else {
          setVerseIndex(selected.length - 1);
          setPreviewPlaying(false);
        }
      };
      audio.ontimeupdate = () => {
        setPreviewTime(audio.currentTime);
        setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      };
      audio.onloadedmetadata = () => setPreviewDuration(audio.duration || 0);
      audio.onended = advance;
      audio.onerror = () => {
        if (destroyed) return;
        cleanup();
        setPreviewPlaying(false);
        notify("⚠️ Bu kârinin ses kaydı yüklenemedi · ayet konumu korundu");
      };
      audio.onstalled = () => { if (!destroyed) audio.play().catch(() => undefined); };
      audio.onabort = () => { if (!destroyed) setPreviewPlaying(false); };
    }

    previewTimerRef.current = window.setTimeout(() => {
      if (!destroyed && audio.readyState < 2) {
        cleanup();
        setPreviewPlaying(false);
      }
    }, 9000);
    verseAudioRef.current = audio;
    audio.play().catch(() => {
      if (!destroyed) {
        cleanup();
        setPreviewPlaying(false);
      }
    });

    return () => {
      destroyed = true;
      cleanup();
    };
  }, [notify, previewPlaying, previewTimerRef, reciter, selected, setPreviewDuration, setPreviewPlaying, setPreviewTime, setVerseIndex, silenceAudioOnly, verseAudioRef, verseIndex, verseIndexRef]);
}
