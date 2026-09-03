export interface Theme {
  id: string;
  name: string;
  bg: string;
  bg2: string;
  acc: string;
  acc2: string;
  txt: string;
}

export const FREE_THEME_COUNT = 3;

export const THEMES: Theme[] = [
  { id: "nur", name: "Nûr-ı İlâhî", bg: "#0c0d12", bg2: "#191c29", acc: "#d7aa52", acc2: "#f5dda6", txt: "#f3f4f6" },
  { id: "emerald", name: "Zümrüt Yeşili", bg: "#06130e", bg2: "#0f2e23", acc: "#10b981", acc2: "#6ee7b7", txt: "#f3f4f6" },
  { id: "sapphire", name: "Safir Mavi", bg: "#0a1128", bg2: "#1c2d5a", acc: "#3b82f6", acc2: "#93c5fd", txt: "#f3f4f6" },
  { id: "amethyst", name: "Ametist Mor", bg: "#13091e", bg2: "#2d1348", acc: "#a855f7", acc2: "#e9d5ff", txt: "#f3f4f6" },
  { id: "ruby", name: "Yakut Kırmızı", bg: "#1a080c", bg2: "#3b121b", acc: "#f43f5e", acc2: "#fecdd3", txt: "#f3f4f6" },
  { id: "sand", name: "Altın Çöl", bg: "#17120a", bg2: "#342816", acc: "#f59e0b", acc2: "#fde68a", txt: "#f3f4f6" },
];

export const THEME_EMOJI: Record<string, string> = {
  nur: "✨", emerald: "🌿", sapphire: "🌊", amethyst: "🔮", ruby: "🌺", sand: "🕌",
};

export const DAILY_AYAHS: Array<[number, number]> = [
  [1, 1], [2, 255], [3, 102], [55, 13], [67, 1], [112, 1], [113, 1], [114, 1], [36, 58], [93, 1], [94, 5], [20, 114], [24, 35], [59, 21],
];


// Re-export data (parçalama)
export { EXTRA_THEMES, THEME_TIER, THEME_EMOJI_EXTRA } from "./themesData";
