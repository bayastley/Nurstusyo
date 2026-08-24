import { useState, useEffect, useCallback, useRef } from "react";
import { RECITERS, reciterAudioUrl } from "../reciters";
import type { SelectedAyah } from "../types";

interface UseAudioPreviewOptions {
  selected: SelectedAyah[];
  verseIndex: number;
  setVerseIndex: (n: number | ((i: number) => number)) => void;
  reciterId: string;
  notify: (msg: string) => void;
}

interface UseAudioPreviewReturn {
  previewPlaying: boolean;
  setPreviewPlaying: (v: boolean) => void;
  previewTime: number;
  setPreviewTime: (n: number) => void;
  previewDuration: number;
  setPreviewDuration: (n: number) => void;
  silenceAllAudio: () => void;
  reciter: typeof RECITERS[0];
}

export function useAudioPreview({ selected, verseIndex, setVerseIndex, reciterId, notify }: UseAudioPreviewOptions): UseAudioPreviewReturn {
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  const verseAudioRef = useRef<HTMLAudioElement | null>(null);
  const reciterPreviewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<number>(0);
  const verseIndexRef = useRef(verseIndex);

  const reciter = RECITERS.find((item) => item.id === reciterId) ?? RECITERS[0];

  const silenceAudioOnly = useCallback(() => {
    try {
      const all = document.querySelectorAll("audio");
      all.forEach((a) => {
        try { a.pause(); a.currentTime = 0; a.removeAttribute("src"); a.load(); } catch { /* ignore */ }
      });
    } catch { /* ignore */ }
    const v = verseAudioRef.current;
    if (v) { try { v.pause(); v.src = ""; v.load(); } catch {} verseAudioRef.current = null; }
    const r = reciterPreviewRef.current;
    if (r) { try { r.pause(); r.src = ""; r.load(); } catch {} reciterPreviewRef.current = null; }
    if (previewTimerRef.current) { window.clearTimeout(previewTimerRef.current); previewTimerRef.current = 0; }
  }, []);

  const silenceAllAudio = useCallback(() => {
    silenceAudioOnly();
    setPreviewPlaying(false);
    setPreviewTime(0);
  }, [silenceAudioOnly]);

  // verseIndex ref'i güncelle
  useEffect(() => { verseIndexRef.current = verseIndex; }, [verseIndex]);

  // Ses preview
  useEffect(() => {
    silenceAudioOnly();
    if (!previewPlaying || !selected.length) return;
    const current = selected[verseIndex];
    if (!current) return;
    if (current.s === 0) { setPreviewDuration(0); setPreviewTime(0); return; }

    const isSurahOnly = Boolean(reciter.surahPattern);
    const audioSrc = isSurahOnly
      ? reciter.surahPattern!.replace("{S}", String(current.s).padStart(3, "0"))
      : reciterAudioUrl(reciter.path, current.s, current.a);
    const audio = new Audio(audioSrc);
    try { (audio as HTMLMediaElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer"; } catch { /* ignore */ }
    audio.preload = "auto"; audio.volume = 0.9;
    let destroyed = false;
    let ayetTimer = 0;
    const cleanup = () => { window.clearTimeout(safetyTimer); window.clearInterval(ayetTimer); audio.pause(); audio.src = ""; };

    if (isSurahOnly) {
      audio.onloadedmetadata = () => {
        if (destroyed) return;
        const sureSüresi = Number.isFinite(audio.duration) ? audio.duration : 0;
        setPreviewDuration(sureSüresi);
        if (sureSüresi <= 0) return;
        const herAyet = sureSüresi / Math.max(selected.length, 1);
        let baslangic = performance.now();
        ayetTimer = window.setInterval(() => {
          if (destroyed) return;
          const elapsed = (performance.now() - baslangic) / 1000;
          setPreviewTime(elapsed);
          const yeniIdx = Math.min(Math.floor(elapsed / herAyet), selected.length - 1);
          if (yeniIdx !== verseIndexRef.current) {
            setVerseIndex(yeniIdx);
          }
        }, 200);
      };
      audio.ontimeupdate = () => { if (!destroyed) setPreviewTime(audio.currentTime); };
      audio.onended = () => { if (!destroyed) { cleanup(); setVerseIndex(selected.length - 1); setPreviewPlaying(false); setPreviewTime(0); } };
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
        if (advanced) return; advanced = true;
        window.clearTimeout(safetyTimer);
        window.clearInterval(ayetTimer);
        setPreviewTime(0);
        if (verseIndex < selected.length - 1) setVerseIndex((i) => i + 1);
        else { setVerseIndex(selected.length - 1); setPreviewPlaying(false); }
      };
      audio.ontimeupdate = () => { setPreviewTime(audio.currentTime); setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0); };
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
    const safetyTimer = window.setTimeout(() => { if (!destroyed && audio.readyState < 2) { cleanup(); setPreviewPlaying(false); } }, 9000);
    verseAudioRef.current = audio;
    audio.play().catch(() => { if (!destroyed) { cleanup(); setPreviewPlaying(false); } });
    return () => { destroyed = true; cleanup(); };
  }, [previewPlaying, verseIndex, selected, reciter.path, reciter.surahPattern, notify, silenceAudioOnly]);

  // Sayfa görünürlük değişince sesi sustur
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) silenceAllAudio(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [silenceAllAudio]);

  return {
    previewPlaying,
    setPreviewPlaying,
    previewTime,
    setPreviewTime,
    previewDuration,
    setPreviewDuration,
    silenceAllAudio,
    reciter,
  };
}
