// SRP bölme (04.11): HeaderTopBar'daki TIER_SOZLUK ortak sözlüğe çıkarıldı —
// mobil gösterge (HeaderTopBar) ve üst şerit (headerSeritPillBar) paylaşır.
import type { Tier } from "../tier";

export const TIER_SOZLUK: Record<string, "tierUcretsiz" | "tierPro" | "tierElit"> = {
  free: "tierUcretsiz",
  pro: "tierPro",
  elit: "tierElit",
};
