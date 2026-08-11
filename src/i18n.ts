// Geriye dönük uyumluluk:
// Eski importlar: import { Lang, T, getPaymentCopy } from "../i18n"
// Yeni yapı: src/i18n/index.ts + src/i18n/paymentCopy.ts
// Bu dosya, "../i18n" yolunun hem dosya hem klasör olarak çözülmesini sağlar.

export type {
  Lang,
  LangOption,
  PaymentCopy,
} from "./i18n/index";

export {
  LANGS,
  MEAL_EDITIONS,
  T,
  getPaymentCopy,
} from "./i18n/index";
