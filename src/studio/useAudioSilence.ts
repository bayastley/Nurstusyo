import { useCallback, type MutableRefObject } from "react";

interface UseAudioSilenceParams {
  verseAudioRef: MutableRefObject<HTMLAudioElement | null>;
  reciterPreviewRef: MutableRefObject<HTMLAudioElement | null>;
  previewTimerRef: MutableRefObject<number>;
  setPreviewPlaying: (value: boolean) => void;
  setPreviewReciterId: (value: string | null) => void;
  setPreviewTime: (value: number) => void;
}

export function useAudioSilence({
  verseAudioRef,
  reciterPreviewRef,
  previewTimerRef,
  setPreviewPlaying,
  setPreviewReciterId,
  setPreviewTime,
}: UseAudioSilenceParams) {
  const silenceAudioOnly = useCallback(() => {
    try {
      const all = document.querySelectorAll("audio");
      all.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.removeAttribute("src");
          audio.load();
        } catch {
          // ignore audio cleanup errors
        }
      });
    } catch {
      // ignore query errors
    }

    const verse = verseAudioRef.current;
    if (verse) {
      try {
        verse.pause();
        verse.src = "";
        verse.load();
      } catch {
        // ignore cleanup errors
      }
      verseAudioRef.current = null;
    }

    const reciter = reciterPreviewRef.current;
    if (reciter) {
      try {
        reciter.pause();
        reciter.src = "";
        reciter.load();
      } catch {
        // ignore cleanup errors
      }
      reciterPreviewRef.current = null;
    }

    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = 0;
    }
  }, [previewTimerRef, reciterPreviewRef, verseAudioRef]);

  const silenceAllAudio = useCallback(() => {
    silenceAudioOnly();
    setPreviewPlaying(false);
    setPreviewReciterId(null);
    setPreviewTime(0);
  }, [silenceAudioOnly, setPreviewPlaying, setPreviewReciterId, setPreviewTime]);

  return { silenceAudioOnly, silenceAllAudio };
}