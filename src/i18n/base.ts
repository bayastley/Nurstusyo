export type Lang =
  | "tr"
  | "en"
  | "ar"
  | "id"
  | "ur";

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
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ur", label: "اردو", flag: "🇵🇰", dir: "rtl" },
];

export const MEAL_EDITIONS: Record<Lang, string> = {
  tr: "tr.yazir",
  en: "en.sahih",
  ar: "ar.alafasy",
  id: "id.indonesian",
  ur: "ur.jalandhry",
};

export type Dict = Record<string, string>;
