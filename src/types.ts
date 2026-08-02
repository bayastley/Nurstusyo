// ════════════════════════════════════════════════════════
// TYPES.TS — Nûr Stüdyo Ortak Tip Tanımları
// ════════════════════════════════════════════════════════
export type { Tier } from "./tier";

export interface SelectedAyah {
  id: string;
  s: number;
  a: number;
  sName: string;
  ar: string;
  tr: string;
}

export interface SearchHit {
  s: number;
  a: number;
  name: string;
  tr: string;
}

export interface Output {
  id: string;
  url: string;
  mime: string;
  size: number;
  duration: number;
  label: string;
  ext: string;
}

export interface DailyAyah {
  ar: string;
  tr: string;
  ref: string;
  s: number;
  a: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
}

export type Mode = "short" | "long" | "full";
export type Aspect = "9:16" | "1:1" | "16:9" | "4:5";
export type ModalName = "atmos" | "themes" | "prayer" | "history" | "guide" | "stories" | "contact" | "login" | "library" | "zip" | "adminDashboard" | null;
export type LoginTab = "login" | "register" | "forgot" | "verify";
