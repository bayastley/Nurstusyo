import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
// ════════════════════════════════════════════════════════
// USEVIDEO TASARIM AYARLARI — StudioApp'ten taşındı (SRP parçalama tur 3, 16.10)
// Video çizimine giden TÜM görsel ayarlar BİR TEK hook'ta toplanır:
//   • Arapça fontu (tembel Google Fonts yükleme + hata bildirimi + FOUT önleme)
//   • Yazı/meal boyutu ince ayarı (0.5x–2.0x, kalıcı)
//   • Işıltı stili + yoğunluğu, kart arka planı
//   • Marka imzası + konumu + aç/kapa (admin watermark)
//   • Renk çubuğu + özel yazı (mesajKatmani ayarları)
//   • Cinematik filtre
//   • Arapça/meal göster/gizle
// Dışa açık imza StudioApp'teki eski adlarla birebir aynıdır — bileşende
// yalnız hook çağrısı kalır, diğer hiçbir dosya değişmez.
// ════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import {
  ARABIC_FONTS as _ARABIC_FONTS, SHIMMER_STYLES as _SHIMMER_STYLES,
  CINE_FILTERS as _CINE_FILTERS, arabicFontWeight, arabicIdealScale,
} from "./studioConstants";
import { VARSAYILAN_CUBUK, VARSAYILAN_MESAJ, type CubukAyar, type MesajAyar } from "./mesajKatmani";

// ★ Sahte-void zinciri: eski dosyadaki void satırları korunur (linter sessizliği)
const ARABIC_FONTS = _ARABIC_FONTS;
const SHIMMER_STYLES = _SHIMMER_STYLES;
const CINE_FILTERS = _CINE_FILTERS;
void _ARABIC_FONTS; void _SHIMMER_STYLES; void _CINE_FILTERS;

type TextSize = "kucuk" | "normal" | "buyuk";

export function useVideoTasarimAyarlar(notify: (msg: string) => void) {
  const [arabicFont, setArabicFontState] = useState<string>(() => {
    try { return localStorage.getItem("nur_arabic_font") || "amiri"; } catch { return "amiri"; }
  });
  // ★ TEMBEL FONT YÜKLEME: Google Fonts linki açılışta yalnızca temel fontları
  //   yükler (Amiri, Inter, Cinzel). Seçilen diğer font, seçildiği anda tek
  //   istekle yüklenir — açılış hızı korunur. Seçim localStorage'da kalıcı.
  const yukluFontlar = useRef(new Set<string>(["amiri"]));
  // ★ Font yükleme hatası takibi: internet yoksa / Google Fonts erişilemezse
  //   kullanıcıyı bilgilendir — sessizce fallback fontta kalmaz.
  const fontHataBildirildi = useRef(new Set<string>());
  const fontYukluFontlar = yukluFontlar.current;
  useEffect(() => {
    const font = ARABIC_FONTS.find((f) => f.id === arabicFont);
    if (!font || fontYukluFontlar.has(arabicFont)) return;
    const aile = font.css.split(",")[0].replace(/'/g, "").trim();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(aile).replace(/%20/g, "+") + ":wght@400;700&display=swap";
    let yuklendi = false;
    // ★ ÇEVRİMDIŞI KONTROL: navigator.onLine=false ise istek hiç atılmaz —
    //   hemen bilgilendir, gereksiz ağ beklemesi olmasın
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      if (!fontHataBildirildi.current.has(arabicFont)) {
        fontHataBildirildi.current.add(arabicFont);
        notify(ttX2610("vtInternetYok").replace("{x}", String(font.label)));
      }
      return;
    }
    // ★ ZAMAN AŞIMLI YÜKLEME: 8 saniyede font gelmezse (ofline proxy, DNS hatası,
    //   Google engeli) kullanıcıyı bilgilendir — Amiri zaten fallback CSS'te var
    const zamanAsimi = window.setTimeout(() => {
      if (yuklendi) return;
      if (!fontHataBildirildi.current.has(arabicFont)) {
        fontHataBildirildi.current.add(arabicFont);
        notify(ttX2610("vtFontKontrol").replace("{x}", String(font.label)));
      }
    }, 8000);
    document.head.appendChild(link);
    fontYukluFontlar.add(arabicFont);
    // ★ FOUT ÖNLEME: font gerçekten yüklendiğinde önizlemeyi tazele —
    //   canvas fallback fontla çizilip öylece kalmaz (yanıp sönme/yanlış font olmaz)
    Promise.all([
      document.fonts.load("400 20px " + aile),
      document.fonts.load("700 20px " + aile),
    ]).then(() => {
      yuklendi = true;
      window.clearTimeout(zamanAsimi);
      window.dispatchEvent(new Event("nur_font_loaded"));
    }).catch(() => {
      yuklendi = true; // catch'te de zaman aşımını durdur — çift bildirim olmasın
      window.clearTimeout(zamanAsimi);
      if (!fontHataBildirildi.current.has(arabicFont)) {
        fontHataBildirildi.current.add(arabicFont);
        notify(ttX2610("vtFontHata").replace("{x}", String(font.label)));
      }
    });
    return () => window.clearTimeout(zamanAsimi);
  }, [arabicFont, notify, fontYukluFontlar]);
  const setArabicFont = (f: string) => {
    setArabicFontState(f);
    try { localStorage.setItem("nur_arabic_font", f); } catch { /* ignore */ }
  };

  const [textSize, setTextSize] = useState<TextSize>("buyuk");

  const [shimmerStyle, setShimmerStyle] = useState("altin");
  const shimmerCfg = SHIMMER_STYLES.find((s) => s.id === shimmerStyle) ?? SHIMMER_STYLES[0];
  const [cardBg, setCardBg] = useState<"seffaf" | "koyu">("seffaf");
  // ★ ADMİNE ÖZEL: Videoda sol altta görünecek marka / kanal imzası
  const [brandSignature, setBrandSignature] = useState<string>(() => {
    try { return localStorage.getItem("nur_brand_signature") ?? "@nurstudyo"; } catch { return "@nurstudyo"; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_brand_signature", brandSignature); } catch { /* ignore */ }
  }, [brandSignature]);
  // ★ İmza konumu — varsayılan SOL ÜST (altta meal yazısıyla çakışmasın)
  const [brandPos, setBrandPos] = useState<"sol-ust" | "sag-ust" | "sol-alt" | "sag-alt">(() => {
    try { return (localStorage.getItem("nur_brand_pos") as any) ?? "sol-ust"; } catch { return "sol-ust"; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_brand_pos", brandPos); } catch { /* ignore */ }
  }, [brandPos]);
  // ★ WATERMARK AÇ/KAPA — imza metninden bağımsız ayrı anahtar; kalıcı.
  //   Kullanıcı imzayı yazıp istediğinde kapatabilir (kanal logosu yokken vs.)
  const [brandOn, setBrandOn] = useState<boolean>(() => {
    try { return localStorage.getItem("nur_brand_on") !== "0"; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_brand_on", brandOn ? "1" : "0"); } catch { /* ignore */ }
  }, [brandOn]);

  const arabicFontCss = ARABIC_FONTS.find((f) => f.id === arabicFont)?.css ?? "Amiri, serif";
  const arabicFontW = arabicFontWeight(arabicFont);

  // ★ Yazı boyutu: hazır ayar × ince ayar (kullanıcı +/- ile 0.5x–2.0x arası)
  const [textSizeFine, setTextSizeFine] = useState<number>(() => {
    const raw = localStorage.getItem("nur_text_size_fine");
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) ? Math.min(2, Math.max(0.5, n)) : 1;
  });
  const setTextSizeMul = (m: number) => {
    const clamped = Math.round(Math.min(2, Math.max(0.5, m)) * 100) / 100;
    setTextSizeFine(clamped);
    try { localStorage.setItem("nur_text_size_fine", String(clamped)); } catch { /* ignore */ }
  };
  // ★ MEAL İÇİN BAĞIMSIZ ince ayar — Arapça boyutundan ayrı tutulur
  const [mealSizeFine, setMealSizeFine] = useState<number>(() => {
    const raw = localStorage.getItem("nur_meal_size_fine");
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) ? Math.min(2, Math.max(0.5, n)) : 1;
  });
  const setMealSizeMul = (m: number) => {
    const clamped = Math.round(Math.min(2, Math.max(0.5, m)) * 100) / 100;
    setMealSizeFine(clamped);
    try { localStorage.setItem("nur_meal_size_fine", String(clamped)); } catch { /* ignore */ }
  };
  // ★ IŞILTI YOĞUNLUĞU — parıltı gücü ince ayarı (0.5x–2.0x), kalıcı
  const [shimmerIntensity, setShimmerIntensityState] = useState<number>(() => {
    const raw = localStorage.getItem("nur_shimmer_intensity");
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) ? Math.min(2, Math.max(0.5, n)) : 1;
  });
  const setShimmerIntensity = (v: number) => {
    const clamped = Math.round(Math.min(2, Math.max(0.5, v)) * 100) / 100;
    setShimmerIntensityState(clamped);
    try { localStorage.setItem("nur_shimmer_intensity", String(clamped)); } catch { /* ignore */ }
  };

  // ★ RENK ÇUBUĞU (01.10) — çerçeve iç kenarında dikey gökkuşağı şeridi; Arapça/meal
  //   çizim renginden bağımsız süsleme katmanı. ayetKartMotoru ile aynı çekirdek.
  const [cubukAyar, setCubukAyar] = useState<CubukAyar>(() => {
    try { return { ...VARSAYILAN_CUBUK, ...(JSON.parse(localStorage.getItem("nur_renk_cubugu") || "null") || {}) }; } catch { return VARSAYILAN_CUBUK; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_renk_cubugu", JSON.stringify(cubukAyar)); } catch { /* ignore */ }
  }, [cubukAyar]);

  // ★ ÖZEL YAZI (01.10) — kullanıcının kendi mesajı, videonun İÇİNE çizilir
  //   (önizleme = çıktı). Ayrı konum: mesajOfset, ayet konumundan bağımsız.
  const [mesajAyar, setMesajAyar] = useState<MesajAyar>(() => {
    try { return { ...VARSAYILAN_MESAJ, ...(JSON.parse(localStorage.getItem("nur_mesaj_ayar") || "null") || {}) }; } catch { return VARSAYILAN_MESAJ; }
  });
  useEffect(() => {
    try { localStorage.setItem("nur_mesaj_ayar", JSON.stringify(mesajAyar)); } catch { /* ignore */ }
  }, [mesajAyar]);

  // ★ FONTA GÖRE OTOMATİK BOYUT: her fontun ideal çarpanı görsel dengeyi
  //   korur (naskh irice, kufi küçüktür). Kullanıcının ince ayarı ekstra çarpılır —
  //   yani elle ayar yaptığı zaman o değer her fontta GEÇERLİ kalır.
  const textSizeMul = (textSize === "buyuk" ? 1.15 : textSize === "kucuk" ? 0.85 : 1) * textSizeFine * arabicIdealScale(arabicFont);

  const [cinematic, setCinematic] = useState("orijinal");
  const cineFilter = CINE_FILTERS.find((f) => f.id === cinematic) ?? CINE_FILTERS[0];

  const [showArapca, setShowArapca] = useState(true);
  const [showSubMeal, setShowSubMeal] = useState(true);

  return {
    // font
    ARABIC_FONTS, arabicFont, setArabicFont, arabicFontCss, arabicFontW,
    // boyut
    textSize, setTextSize, textSizeMul, textSizeFine, setTextSizeMul,
    mealSizeFine, setMealSizeMul,
    // ışıltı / kart
    SHIMMER_STYLES, shimmerStyle, setShimmerStyle, shimmerCfg,
    shimmerIntensity, setShimmerIntensity,
    cardBg, setCardBg,
    // marka
    brandSignature, setBrandSignature,
    brandPos, setBrandPos,
    brandOn, setBrandOn,
    // süsleme
    cubukAyar, setCubukAyar,
    mesajAyar, setMesajAyar,
    // sinematik
    CINE_FILTERS, cinematic, setCinematic, cineFilter,
    // göster/gizle
    showArapca, setShowArapca,
    showSubMeal, setShowSubMeal,
  };
}

// React import kullanılmıyor ama tip uyumu için kalsın (eski dosyayla aynı desen)
void React;
