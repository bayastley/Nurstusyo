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

export const EXTRA_THEMES: Theme[] = [
  { id: "gece-yildizi", name: "Gece Yıldızı", bg: "#0a0e1f", bg2: "#1a2347", acc: "#93c5fd", acc2: "#dbeafe", txt: "#f3f4f6" },
  { id: "zumrut-vaha", name: "Zümrüt Vaha", bg: "#04140e", bg2: "#0a3d2a", acc: "#34d399", acc2: "#a7f3d0", txt: "#f3f4f6" },
  { id: "yakut", name: "Yakut", bg: "#1a0608", bg2: "#4a0e16", acc: "#f87171", acc2: "#fecaca", txt: "#f3f4f6" },
  { id: "menekse-moru", name: "Menekşe Moru", bg: "#120820", bg2: "#2e1052", acc: "#c084fc", acc2: "#e9d5ff", txt: "#f3f4f6" },
  { id: "kum-vahasi", name: "Kum Vahası", bg: "#1a1206", bg2: "#3d2a0e", acc: "#fbbf24", acc2: "#fef3c7", txt: "#f3f4f6" },
  { id: "mercan-suyu", name: "Mercan Suyu", bg: "#04181a", bg2: "#0a3d42", acc: "#22d3ee", acc2: "#a5f3fc", txt: "#f3f4f6" },
  { id: "gul-bahcesi", name: "Gül Bahçesi", bg: "#1a0610", bg2: "#4a0e2e", acc: "#f472b6", acc2: "#fbcfe8", txt: "#f3f4f6" },
  { id: "lacivert-derin", name: "Lacivert Derin", bg: "#060a1a", bg2: "#0e1a42", acc: "#60a5fa", acc2: "#bfdbfe", txt: "#f3f4f6" },
  { id: "mucellit-siyah", name: "Mücellit Siyah", bg: "#080808", bg2: "#1a1a1a", acc: "#d4af37", acc2: "#f5e6a8", txt: "#f3f4f6" },
  { id: "turkuaz-isik", name: "Turkuaz Işık", bg: "#041a1a", bg2: "#0a4242", acc: "#2dd4bf", acc2: "#99f6e4", txt: "#f3f4f6" },
  { id: "amber-atesi", name: "Amber Ateşi", bg: "#1a0e04", bg2: "#42240a", acc: "#fb923c", acc2: "#fed7aa", txt: "#f3f4f6" },
  { id: "gokkusagi", name: "Gökkuşağı", bg: "#0f0a1a", bg2: "#1e1240", acc: "#a78bfa", acc2: "#c4b5fd", txt: "#f3f4f6" },
];

export const THEME_TIER: Record<string, "free" | "pro" | "elit"> = {
  nur: "free", emerald: "free", sapphire: "free", amethyst: "pro", ruby: "pro", sand: "pro",
  "gece-yildizi": "pro", "zumrut-vaha": "pro", "yakut": "pro", "menekse-moru": "elit",
  "kum-vahasi": "elit", "mercan-suyu": "elit", "gul-bahcesi": "elit", "lacivert-derin": "elit",
  "mucellit-siyah": "elit", "turkuaz-isik": "elit", "amber-atesi": "elit", "gokkusagi": "elit",
};

export const THEME_EMOJI_EXTRA: Record<string, string> = {
  "gece-yildizi": "⭐", "zumrut-vaha": "🏝️", "yakut": "💎", "menekse-moru": "💜",
  "kum-vahasi": "🏜️", "mercan-suyu": "🐠", "gul-bahcesi": "🌹", "lacivert-derin": "🌊",
  "mucellit-siyah": "📖", "turkuaz-isik": "💡", "amber-atesi": "🔥", "gokkusagi": "🌈",
};
