// ════════════════════════════════════════════════════════════════
// YASAL SEKME KÖPRÜSÜ — CookieConsent gibi StudioApp dışındaki
// bileşenler, yasal modal'ı state'e dokunmadan açabilir.
// StudioApp mount anında setAçıcı'yı kaydeder (cookie-banner → KVKK
// sekmesi akışı, KVKK m.10 aydınlatma erişilebilirlik şartı).
// ════════════════════════════════════════════════════════════════

export type LegalTab = "tos" | "kvkk" | "gizlilik" | "iade";

let açıcı: ((t: LegalTab) => void) | null = null;

export function setLegalTabAçıcı(fn: (t: LegalTab) => void): void {
  açıcı = fn;
}

export function openLegalTab(t: LegalTab): void {
  if (açıcı) {
    açıcı(t);
    return;
  }
  // Köprü kurulmadıysa (ilk render sırası) hash ile güvenli düş
  try {
    window.location.hash = `#yasal-${t}`;
    window.dispatchEvent(new CustomEvent("yasal-sekme-ac", { detail: t }));
  } catch { /* yoksay */ }
}
