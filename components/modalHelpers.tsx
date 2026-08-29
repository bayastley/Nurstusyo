// ════════════════════════════════════════════════════════
// GOOGLE OAUTH PKCE HELPER + ATMOSPHERE TEASER SABİTLERİ
// ModalsContainer.tsx'ten çıkarıldı
// ════════════════════════════════════════════════════════

import React from "react";

/** Resmi Google "G" logosu */
export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export function base64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function randomPkceVerifier(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64Url(bytes.buffer);
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64Url(digest);
}

// ★ "Yakında" teaser listesi — R2 depolamasına yüklenmekte olan 78 yeni
//   atmosfer kategorisinin bir kısmı. Henüz gerçek görsel bağlanmadığı için
//   sadece isim + kilit rozeti gösterilir, tıklanamaz (merak uyandırma amaçlı).
export const COMING_SOON_ATMOSPHERES: Array<{ id: string; label: string; emoji: string; lock: "V2" | "V3" }> = [
  { id: "cs-kabe-siyah-ortu", label: "Kâbe Örtüsü", emoji: "🕋", lock: "V2" },
  { id: "cs-medine-kubbe", label: "Yeşil Kubbe", emoji: "🕌", lock: "V2" },
  { id: "cs-nur-dagi", label: "Nur Dağı", emoji: "⛰️", lock: "V2" },
  { id: "cs-zemzem", label: "Zemzem Kuyusu", emoji: "💧", lock: "V2" },
  { id: "cs-hira-magarasi", label: "Hira Mağarası", emoji: "🏔️", lock: "V3" },
  { id: "cs-yildizli-cami", label: "Yıldızlı Gökyüzü", emoji: "🌌", lock: "V2" },
  { id: "cs-kizil-deniz", label: "Kızıldeniz", emoji: "🌊", lock: "V2" },
  { id: "cs-hurma-bahcesi", label: "Hurma Bahçesi", emoji: "🌴", lock: "V2" },
  { id: "cs-cennet-bahce", label: "Cennet Bahçesi", emoji: "🌿", lock: "V3" },
  { id: "cs-ates-alevi", label: "Ateş Alevi", emoji: "🔥", lock: "V3" },
  { id: "cs-gece-yildiz", label: "Gece Yıldızları", emoji: "✨", lock: "V2" },
  { id: "cs-col-kum", label: "Çöl Kumulları", emoji: "🏜️", lock: "V2" },
  { id: "cs-buluttepe", label: "Bulut Tepeleri", emoji: "☁️", lock: "V2" },
  { id: "cs-yagmur-damla", label: "Yağmur Damlası", emoji: "🌧️", lock: "V2" },
  { id: "cs-gunes-dogus", label: "Güneşin Doğuşu", emoji: "🌅", lock: "V2" },
  { id: "cs-karinca-yuvasi", label: "Karınca Yuvası", emoji: "🐜", lock: "V3" },
  { id: "cs-ari-kovani", label: "Arı Kovanı", emoji: "🐝", lock: "V3" },
  { id: "cs-balik-derinlik", label: "Deniz Derinliği", emoji: "🐋", lock: "V3" },
  { id: "cs-kuslar-goc", label: "Kuşların Göçü", emoji: "🕊️", lock: "V2" },
  { id: "cs-dag-zirve", label: "Dağ Zirvesi", emoji: "🏔️", lock: "V2" },
  { id: "cs-selale-guc", label: "Güçlü Şelale", emoji: "💦", lock: "V2" },
  { id: "cs-cennet-nehir", label: "Cennet Nehirleri", emoji: "🏞️", lock: "V3" },
  { id: "cs-ay-tutulma", label: "Ay Tutulması", emoji: "🌘", lock: "V2" },
  { id: "cs-gunes-tutulma", label: "Güneş Tutulması", emoji: "🌑", lock: "V3" },
  { id: "cs-deprem-yer", label: "Yerin Sarsılışı", emoji: "🌍", lock: "V3" },
  { id: "cs-kar-manzara", label: "Kar Manzarası", emoji: "❄️", lock: "V2" },
  { id: "cs-zeytin-agac", label: "Zeytin Ağacı", emoji: "🫒", lock: "V2" },
  { id: "cs-incir-agac", label: "İncir Ağacı", emoji: "🌳", lock: "V2" },
  { id: "cs-uzum-bag", label: "Üzüm Bağı", emoji: "🍇", lock: "V2" },
  { id: "cs-gemi-tufan", label: "Nûh'un Gemisi", emoji: "🚢", lock: "V3" },
  { id: "cs-kuyu-yusuf", label: "Kuyu", emoji: "🕳️", lock: "V3" },
  { id: "cs-balina-yunus", label: "Balina", emoji: "🐳", lock: "V3" },
];
