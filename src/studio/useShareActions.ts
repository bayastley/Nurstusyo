import { useCallback, useState } from "react";

interface ShareActionsInput {
  shareTitle: string;
  shareDescription: string;
  notify: (msg: string) => void;
}

interface Output {
  url: string;
  ext: string;
  mime: string;
}

/**
 * ★ PAYLAŞIM FONKSİYONLARI — StudioApp.tsx'ten çıkarıldı (parçalama)
 * WhatsApp, YouTube, TikTok, Instagram, X paylaşım linkleri
 */
export function useShareActions({ shareTitle, shareDescription, notify }: ShareActionsInput) {
  const [copied, setCopied] = useState(false);

  const copyShare = useCallback(async () => {
    const content = `${shareTitle}\n\n${shareDescription}`;
    try { await navigator.clipboard.writeText(content); } catch { const textarea = document.createElement("textarea"); textarea.value = content; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); }
    setCopied(true); window.setTimeout(() => setCopied(false), 1600); notify("Paylaşım metni kopyalandı");
  }, [notify, shareDescription, shareTitle]);

  const shareOutput = useCallback(async (output: Output) => {
    const promoText = "Bu video nurstudyo.com yapay zeka otomasyonu ile 1 dakikada üretilmiştir. Siz de telifsiz ve sinematik Kur'an videoları üretmek için ziyaret edin!";
    try {
      await navigator.clipboard.writeText(promoText);
      notify("📢 Paylaşım metni panoya kopyalandı!");
    } catch { /* ignore */ }
    try {
      const file = new File([await (await fetch(output.url)).blob()], `nur-studyo.${output.ext}`, { type: output.mime });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: `${promoText}\n\n${shareDescription}`, files: [file] });
        return;
      }
    } catch { /* ignore */ }
  }, [notify, shareTitle, shareDescription]);

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToYouTube = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://studio.youtube.com/channel/upload", "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToTikTok = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://www.tiktok.com/creator-center/upload", "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToInstagram = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://www.instagram.com/reels/", "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToX = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  return {
    copied,
    copyShare,
    shareOutput,
    shareToWhatsApp,
    shareToYouTube,
    shareToTikTok,
    shareToInstagram,
    shareToX,
  };
}
