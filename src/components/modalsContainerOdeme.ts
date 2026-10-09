// ════════════════════════════════════════════════════════
// MODALSCONTAINERODEME.TS — ModalsContainer'dan taşındı (SRP parçalama, 09.10)
// PremiumModal onCheckout akışındaki DEMObonus uygulama köprüsü.
// Sadece demo yanıtında tetiklenir; gerçek iyzico akışına dokunulmaz.
// ════════════════════════════════════════════════════════

import { secureGet, secureSet } from "../secureStore";

export interface DemoCheckoutContext {
  setTier: (t: "pro" | "elit") => void;
  setCurrentTier: (t: "pro" | "elit") => void;
  setJetonCount: (n: number) => void;
  setPremiumOpen: (open: boolean) => void;
  notify: (msg: string) => void;
}

/** ★ DEMO ÖDEME KÖPRÜSÜ — result.demo true iken ürünü doğrudan tanımlar:
 *    pro  → +250 ⚡, elit → +500 ⚡, videoCount → +N video hakkı.
 *    Gerçek ödeme akışında (demo:false) çağrılmaz; bekleyen yanıt undefined. */
export function demoOdemeUygula(result: any, ctx: DemoCheckoutContext): boolean {
  if (!result?.demo) return false;
  const product = result as any;
  if (product.product?.grantTier === "pro") {
    ctx.setTier("pro"); ctx.setCurrentTier("pro");
    const bonus = 250;
    const next = Number(secureGet<number>("nur_jeton", 0)) + bonus;
    secureSet("nur_jeton", next);
    ctx.setJetonCount(next);
    ctx.notify(`✅ [DEMO] NÛR PRO üyeliğin aktif edildi +${bonus} ⚡`);
  } else if (product.product?.grantTier === "elit") {
    ctx.setTier("elit"); ctx.setCurrentTier("elit");
    const bonus = 500;
    const next = Number(secureGet<number>("nur_jeton", 0)) + bonus;
    secureSet("nur_jeton", next);
    ctx.setJetonCount(next);
    ctx.notify(`👑 [DEMO] NÛR ELİT üyeliğin aktif edildi +${bonus} ⚡`);
  } else if (product.product?.videoCount) {
    const amount = product.product.videoCount;
    const next = Number(secureGet<number>("nur_jeton", 0)) + amount;
    secureSet("nur_jeton", next);
    ctx.setJetonCount(next);
    ctx.notify(`🎬 [DEMO] ${amount} video hakkı eklendi`);
  }
  ctx.setPremiumOpen(false);
  return true;
}
