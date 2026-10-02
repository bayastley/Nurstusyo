import { useCallback, type MutableRefObject } from "react";
import { RECITERS, sesKaynakZinciri, sesZinciriBagla, sesZinciriSoKup } from "../reciters";

// BURASI DÜZELTİLDİ: ../types yerine doğrudan StudioApp'teki tipleri veya boş şablonu kullandık, hata vermemesi sağlandı.
interface SelectedAyah {
  s: number;
  a: number;
}

interface UseReciterPreviewParams {
  previewReciterId: string | null;
  selectedRef: MutableRefObject<SelectedAyah[]>;
  reciterPreviewRef: MutableRefObject<HTMLAudioElement | null>;
  previewTimerRef: MutableRefObject<number>;
  setPreviewReciterId: (value: string | null) => void;
  notify: (message: string) => void;
  silenceAllAudio: () => void;
}

export function useReciterPreview({
  previewReciterId,
  selectedRef,
  reciterPreviewRef,
  previewTimerRef,
  setPreviewReciterId,
  notify,
  silenceAllAudio,
}: UseReciterPreviewParams) {
  const playReciterPreview = useCallback((id: string) => {
    silenceAllAudio();
    const prev = reciterPreviewRef.current;
    if (prev) {
      sesZinciriSoKup(prev); // ★ yedek zincirini de sök (02.10)
      prev.pause();
      prev.oncanplaythrough = null;
      prev.onloadeddata = null;
      prev.onended = null;
      prev.onerror = null;
      try { prev.src = ""; } catch { /* ignore */ }
      reciterPreviewRef.current = null;
    }
    if (previewReciterId === id) {
      setPreviewReciterId(null);
      return;
    }

    const target = RECITERS.find((item) => item.id === id);
    const sample = selectedRef.current[0] ?? { s: 1, a: 1 };
    if (!target) return;

    const startPreview = (kaynaklar: string[]) => {
      const prevInStart = reciterPreviewRef.current;
      if (prevInStart) {
        sesZinciriSoKup(prevInStart);
        prevInStart.pause();
        prevInStart.onended = null;
        prevInStart.onerror = null;
        try { prevInStart.src = ""; } catch { /* ignore */ }
      }

      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 0.88;
      try { (audio as HTMLMediaElement & { referrerPolicy?: string }).referrerPolicy = "no-referrer"; } catch { /* ignore */ }

      reciterPreviewRef.current = audio;
      setPreviewReciterId(id);
      const cleanup = () => {
        if (reciterPreviewRef.current !== audio) return;
        setPreviewReciterId(null);
        reciterPreviewRef.current = null;
      };

      audio.onended = cleanup;
      // ★ YEDEK SES ZİNCİRİ (02.10): everyayah → varsa islamic.network; hepsi patlarsa uyar
      sesZinciriBagla(audio, kaynaklar, () => {
        if (reciterPreviewRef.current !== audio) return;
        cleanup();
        notify(`⚠️ ${target?.name ?? "Kâri"} · ses kaydı şu an yüklenemedi. Lütfen başka bir kâri deneyin.`);
      });

      audio.play().catch(() => {
        const onReady = () => {
          audio.removeEventListener("loadeddata", onReady);
          if (reciterPreviewRef.current === audio) audio.play().catch(cleanup);
        };
        audio.addEventListener("loadeddata", onReady);
      });

      previewTimerRef.current = window.setTimeout(() => {
        if (reciterPreviewRef.current === audio) {
          audio.pause();
          cleanup();
        }
      }, 10_000);
    };

    startPreview(
      target.surahPattern
        ? [target.surahPattern.replace("{S}", String(sample.s).padStart(3, "0"))]
        : sesKaynakZinciri(target.path, sample.s, sample.a),
    );
  }, [notify, previewReciterId, previewTimerRef, reciterPreviewRef, selectedRef, setPreviewReciterId, silenceAllAudio]);

  return { playReciterPreview };
}
