// ════════════════════════════════════════════════════════
// i18n DİL AYARLARI, ÇEVİRİLER
// ════════════════════════════════════════════════════════

export type Lang = "tr" | "en" | "ar" | "de" | "ru" | "fr" | "es" | "id" | "ur" | "fa";

export interface LangOption {
  code: Lang;
  label: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

export const LANGS: LangOption[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ur", label: "اردو", flag: "🇵🇰", dir: "rtl" },
  { code: "fa", label: "فارسی", flag: "🇮🇷", dir: "rtl" },
];

export const MEAL_EDITIONS: Record<Lang, string> = {
  tr: "tr.diyanet",
  en: "en.sahih",
  ar: "ar.alafasy",
  de: "de.bubenheim",
  ru: "ru.kuliev",
  fr: "fr.hamidullah",
  es: "es.cortes",
  id: "id.indonesian",
  ur: "ur.jalandhry",
  fa: "fa.fooladvand",
};

export const T: Record<Lang, Record<string, string>> = {
  tr: {
    premium: "Premium Pro",
    loading: "Yükleniyor...",
    loginTitle: "Giriş Yap / Kayıt Ol",
    googleAuth: "Google ile devam et",
  },
  en: {
    premium: "Premium Pro",
    loading: "Loading...",
    loginTitle: "Login / Register",
    googleAuth: "Continue with Google",
  },
  ar: {
    premium: "بريميوم برو",
    loading: "جاري التحميل...",
    loginTitle: "تسجيل الدخول / التسجيل",
    googleAuth: "المتابعة باستخدام Google",
  },
  de: {},
  ru: {},
  fr: {},
  es: {},
  id: {},
  ur: {},
  fa: {},
};

// Geriye dönük: eski import yolları için
export { getPaymentCopy } from "./paymentCopy";
export type { PaymentCopy } from "./paymentCopy";
// Not: Lang tipi bu dosyada tanımlı; paymentCopy kendi Lang union'ını kullanır (döngü yok)
