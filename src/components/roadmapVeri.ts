// ════════════════════════════════════════════════════════
// ROADMAPVERI.TS — Yol haritası ikon tablosu + V2/V3 özellik tanımları
// RoadmapModal.tsx'den ayrıldı (SRP adım 3, 30.09)
// ════════════════════════════════════════════════════════

export interface Feature {
  iconId: string;
  title: string;
  desc: string;
  tag: string;
  votes: number;
  id: string;
  active: boolean;
}

// ★ Icon'lar string olarak tutulur — JSON.parse'ta kaybolmaz
export const ICON_EMOJI: Record<string, string> = {
  ai_meal: "🧠", kendi_ses: "🎤", kelime_video: "✍️", ai_arkaplan: "✨",
  push: "🔔", ucretsiz_deneme: "🎁", referans: "👥", arsiv: "🌐",
  e_fatura: "💳", meal_dinle: "🎧", mobil: "📱", koleksiyon: "🔖",
  notlar: "📝", seriler: "🎬", reklam: "🛡️", coklu_kullanici: "👥", api: "⚡", kurumsal: "👑",
  namaz_bildirim: "🕌", zikirmatik: "📿", hatim: "📖", seri_uretim: "⚡", uyku_tilaveti: "🌙", kandil: "🌟",
  akilli_radyo: "📻",
  hafizlik_testi: "🧠", paket: "📦", takvim: "📅", tefsir: "📚", latin: "🔤", kanal: "🚀",
  cami: "🕌", kible: "🧭", hediye: "🎁", whatsapp: "💬",  kelime_kartlari: "🔤", wbw_video: "📖", soru: "❓",
  hoca: "🎧", seri: "🔥", gece: "🌙", oruc: "🌙", toplu: "⬇️", mushaf: "📖", tajvid: "🎓",
  hafta_video: "🎬", offline: "📥", uretici_ist: "📊", cocuk: "🎈", telaffuz: "🗣️", widget: "🖥️",
  cok_dilli: "🌐", foto_hat: "🖼️",
};
export function getIcon(id: string): string {
  return ICON_EMOJI[id] || "✨";
}

// ★ 23.10 LİSTE TAMAMEN BOŞ (sahibin emri): "oylama listesini boşalt — uzun vadeliler
//   dahil — hiçbişey yazma, biz dolduralım". V2 şablon maddeleri de silindi;
//   oylamanın tek kaynağı artık admin 'Ekle' formu (roadmap panelinde V2/V3 seçilir).
const DEFAULT_V2: Omit<Feature, "votes">[] = [];

const DEFAULT_V3: Omit<Feature, "votes">[] = [];

export { DEFAULT_V2, DEFAULT_V3 };

// ★ Depolama yardımcıları (RoadmapModal'dan, SRP adım 3) — localStorage + DEFAULT birleştirme
// ★ v10→v11: V2 maddeleri de boşaltılınca eski istemci önbellekleri geçersiz.
const STORAGE_KEY = "nur_roadmap_data_v11";
export const VOTE_KEY = "nur_roadmap_votes";
export const DEADLINE_KEY = "nur_roadmap_deadline";

export function loadFeatures(): { v2: Feature[]; v3: Feature[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    v2: DEFAULT_V2.map((feature) => ({ ...feature, votes: 0 })),
    v3: DEFAULT_V3.map((feature) => ({ ...feature, votes: 0 })),
  };
}

export function saveFeatures(data: { v2: Feature[]; v3: Feature[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function getStoredVotes(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(VOTE_KEY) || "{}"); } catch { return {}; }
}

export function getDeadline(): string {
  try { return localStorage.getItem(DEADLINE_KEY) || ""; } catch { return ""; }
}
