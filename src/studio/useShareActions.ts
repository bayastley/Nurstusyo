import { useCallback, useState } from "react";
import { T } from "../i18n";

interface ShareActionsInput {
  shareTitle: string;
  shareDescription: string;
  notify: (msg: string) => void;
  /** ★ 04.10: notify + promo metinleri seçili dilde — hardcoded TR kalktı */
  t: (key: keyof (typeof T)["tr"]) => string;
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
export function useShareActions({ shareTitle, shareDescription, notify, t }: ShareActionsInput) {
  const [copied, setCopied] = useState(false);

  const copyShare = useCallback(async () => {
    const content = `${shareTitle}\n\n${shareDescription}`;
    try { await navigator.clipboard.writeText(content); } catch { const textarea = document.createElement("textarea"); textarea.value = content; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); }
    setCopied(true); window.setTimeout(() => setCopied(false), 1600); notify(t("shKopyalandi"));
  }, [notify, shareDescription, shareTitle, t]);

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
    const promoText = t("shPromoVideo");
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
      notify(t("shCihazaIndirildiPano"));
    } catch (e) {
      // Kullanıcı paylaş menüsünü kapattıysa hata değildir
      if ((e as { name?: string })?.name === "AbortError") return;
      // Video paylaşılamadı → en azından indirsin
      await downloadVideo(output);
      notify(t("shCihazaIndirildi"));
    }
  }, [downloadVideo, notify, shareDescription, shareTitle, t]);

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    // ★ 04.10: masaüstünde wa.me yerine WhatsApp Web'e DİREKT git — wa.me masaüstünde
    //   ara "Uygulamayı aç / WhatsApp Web'e git" ekranı gösteriyordu (ve telefon
    //   bağlı değilse kullanıcısı karanlık bir hata ekranında kalıyordu).
    const masaustu = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
    const hedef = masaustu
      ? `https://web.whatsapp.com/send?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(hedef, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  const shareToYouTube = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://studio.youtube.com/channel/upload", "_blank", "noopener,noreferrer");
    // ★ PLATFORM ÖNERİSİ: YouTube başlığı otomatik kopyalar — kullanıcıya haber ver
    notify(t("shYtKopyalandi"));
  }, [notify, shareTitle, shareDescription, t]);

  const shareToTikTok = useCallback(() => {
    const text = `${shareTitle}\n\n${shareDescription}`;
    navigator.clipboard.writeText(text).catch(() => undefined);
    window.open("https://www.tiktok.com/creator-center/upload", "_blank", "noopener,noreferrer");
    notify(t("shTtKopyalandi"));
  }, [notify, shareTitle, shareDescription, t]);

  const shareToInstagram = useCallback(() => {
    // ★ REELS HATIRLATMASI: Instagram dosya paylaşımını kabul etmez — video önce
    //   cihaza inmeli; Reels sadece 9:16 dikey formatı tam ekran kabul eder.
    navigator.clipboard.writeText(`${shareTitle}\n\n${shareDescription}`).catch(() => undefined);
    window.open("https://www.instagram.com/reels/", "_blank", "noopener,noreferrer");
    notify(t("shIgReels"));
  }, [notify, shareTitle, shareDescription, t]);

  const shareToX = useCallback(() => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareDescription}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }, [shareTitle, shareDescription]);

  // ★ CİHAZIN UYGULAMA MENÜSÜ (02.10 — "kolaylık olsun"): Playlaş'a basınca artık
  //   native paylaşımi açılmıyorsa bile kullanıcının önünde CİHAZINA GÖRE hazır
  //   uygulama kısayolları çıkıyor: mobilde WhatsApp/Instagram/X, masaüstünde
  //   YouTube/TikTok/WhatsApp Web + panoya kopyala. Tek satır çağrıyla VideoPreviewSection
  //   çip şeridi bunları render eder.
  const paylasCihazi = useCallback((output?: Output) => {
    const mobil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
    const uygulamar: Array<{ ad: string; emoji: string; islem: () => void }> = [
      { ad: "WhatsApp", emoji: "💬", islem: shareToWhatsApp },
      ...(mobil ? [{ ad: "Instagram", emoji: "📸", islem: shareToInstagram }] : []),
      ...(mobil ? [{ ad: "TikTok", emoji: "🎵", islem: shareToTikTok }] : []),
      ...(mobil ? [] : [{ ad: "YouTube", emoji: "▶️", islem: shareToYouTube }]),
      ...(mobil ? [] : [{ ad: "WhatsApp Web", emoji: "🖥️", islem: shareToWhatsApp }]),
      { ad: "X", emoji: "𝕏", islem: shareToX },
    ];
    return uygulamar.map((u) => ({ ...u, calistir: () => { u.islem(); if (output) void downloadVideo(output).catch(() => undefined); } }));
  }, [downloadVideo, shareToInstagram, shareToTikTok, shareToWhatsApp, shareToX, shareToYouTube]);

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
    paylasCihazi,
  };
}
