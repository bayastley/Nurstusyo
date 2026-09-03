import type { DailyAyah, User, ModalName } from "../types";
import type { Lang } from "../i18n";
import { T } from "../i18n";
import type { Tier } from "../tier";

export interface HeaderTopBarProps {
  daily: DailyAyah | null;
  dailyPoolLength: number;
  dailyIndex: number;
  toggleAyah: (s: number, a: number, tr?: string) => void;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  handleLogout: () => void;
  setModal: (modal: ModalName) => void;
  openAdminDashboard: () => Promise<void>;
  setLibType: (type: any) => void;
  isMasterSürüm: boolean;
  setAdminGodMode: (val: boolean) => void;
  setSmartAiEnabled: (val: boolean) => void;
  setBatchFormats: (val: any) => void;
  notify: (msg: string) => void;
  jetonCount: number;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  langOpen: boolean;
  setLangOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nextPrayer: { name: string; key: string; diff: number } | null;
  prayerCity: string;
  formatRemaining: (ms: number) => string;
  t: (key: keyof (typeof T)["tr"]) => string;
  tier?: Tier;
  subscriptionEndsAt?: string | null;
  setRoadmapOpen?: (v: boolean) => void;
}
