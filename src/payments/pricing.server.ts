// ════════════════════════════════════════════════════════
// PRICING.SERVER.TS — DEPRECATED shim.
//
// Bu dosya artık iki parçaya ayrıldı:
//   1) ./pricing.ts         — browser-safe: PRODUCTS, getProduct, startCheckout
//   2) ./webhook.server.ts  — Node-only: verifyPayTRWebhook, verifyIyzicoWebhook, handleWebhook
//
// Yeni kod bu iki dosyayı doğrudan import etmeli. Eski import'ları kırmamak için
// burada re-export yapıyoruz.
// ════════════════════════════════════════════════════════

export * from "./pricing";
export * from "./webhook.server";
