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

  // ★ Videoyu cihaza indirir (paylaşım desteklenmeyen cihazlarda yedek yol)
  const downloadVideo = useCallback(async (output: Output) => {
    try {
      const blob = await (await fetch(output.url)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nur-studyo-${Date.now()}.${output.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch { /* ignore */ }
  }, []);

  const shareOutput = useCallback(async (output: Output) => {
    const promoText = "Bu video nurstudyo.com yapay zeka otomasyonu ile 1 dakikada üretilmiştir. Siz de telifsiz ve sinematik Kur'an videoları üretmek için ziyaret edin!";
    const shareText = `${promoText}\n\n${shareDescription}`;
    try {
      const blob = await (await fetch(output.url)).blob();
      const file = new File([blob], `nur-studyo-${Date.now()}.${output.ext}`, { type: output.mime || blob.type || "video/mp4" });
      // ★ 1. YOL: cihazın paylaş menüsü — VIDEO DOSYASIYLA birlikte açılır
      //    (WhatsApp, Instagram, Telegram… cihazdaki tüm uygulamalar listelenir)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle, text: shareText });
        return;
      }
      // ★ 2. YOL: dosya paylaşımı desteklenmiyorsa (eski tarayıcı/masaüstü)
      //    videoyu cihaza İNDİR + metni panoya kopyala — kullanıcı indirilen
      //    dosyayı elle paylaşabilir
      await downloadVideo(output);
      try { await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}`); } catch { /* ignore */ }
      notify(" video cihazına indirildi — indirme klasöründen WhatsApp/Instagram'a atabilirsin (başlık+açıklama panoda)");
    } catch (e) {
      // Kullanıcı paylaş menüsünü kapattıysa hata değildir
      if ((e as { name?: string })?.name === "AbortError") return;
      // Video paylaşılamadı → en azından indirsin
      await downloadVideo(output);
      notify(" video cihazına indirildi — uygulamalarından paylaşabilirsin");
    }
  }, [downloadVideo, notify, shareDescription, shareTitle]);

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToYouTube = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://studio.youtube.com/channel/upload", "_blank", "noopener,noreferrer");
    // ★ PLATFORM ÖNERİSİ: YouTube başlığı otomatik kopyalar — kullanıcıya haber ver
    notify("📋 Başlık + açıklama kopyalandı — YouTube yüklerken başlık kutusuna yapıştır");
  }, [notify, shareTitle, shareDescription]);

  const shareToTikTok = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://www.tiktok.com/creator-center/upload", "_blank", "noopener,noreferrer");
    notify("📋 Başlık + açıklama kopyalandı — TikTok açıklamasına yapıştır");
  }, [notify, shareTitle, shareDescription]);

  const shareToInstagram = useCallback(() => {
    // ★ REELS HATIRLATMASI: Instagram dosya paylaşımını kabul etmez — video önce
    //   cihaza inmeli; Reels sadece 9:16 dikey formatı tam ekran kabul eder.
    navigator.clipboard.writeText(`${shareTitle}\n\n${shareDescription}`).catch(() => undefined);
    window.open("https://www.instagram.com/reels/", "_blank", "noopener,noreferrer");
    notify("📱 Videoyu cihazından Reels'e yükle · Reels 9:16 dikey format ister — videon hazır (metin panoda)");
  }, [notify, shareTitle, shareDescription]);

  const shareToX = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  return {
    copied,
    copyShare,
    shareOutput,
    downloadVideo,
    shareToWhatsApp,
    shareToYouTube,
    shareToTikTok,
    shareToInstagram,
    shareToX,
  };
}
