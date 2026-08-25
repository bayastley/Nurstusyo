export type Lang =
  | "tr"
  | "en"
  | "ar"
  | "de"
  | "ru"
  | "fr"
  | "es"
  | "id"
  | "ur"
  | "fa"
  | "bn"
  | "ms"
  | "hi"
  | "sw";

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
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
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
  bn: "bn.bengali",
  ms: "ms.basmeih",
  hi: "hi.hindi",
  sw: "sw.barwani",
};

export type Dict = Record<string, string>;
