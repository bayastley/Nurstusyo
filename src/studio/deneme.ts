// ════════════════════════════════════════════════════════
// DENEME.TS — LANSMAN DENEMESİ İSTEMCİ MODÜLÜ (25.10, sahibin emri)
//   "herşey 5 üretim hakkı olsun; yaptıkça düşsün; bitince eski
//    PRO/ELİT/V2 kilitleri geri gelsin; kalan hak altında yazsın"
//
//   • Sunucu tek doğruluk kaynağı: /api/customer/deneme → nur_deneme_kalan RPC.
//   • denemeAktifMi() true iken tier.tierAtLeast pro/elit kapılarını KAPAR
//     (tier.ts) ve adminSyncService.getFeatureLock pro/elit/v2/v3 kilitlerini
//     "free" sayar → ilk giren kullanıcı hiçbir PRO/ELİT rozetini görmez.
//   • right düşüşü üretime /api/render/authorize cevabından beslenir
//     (source:"deneme" → packLeft = kalan hak).
//   • Veri YOKSA (misafir / oturum / endpoint yok) → left null → deneme PASİF:
//     eski davranış korunur (fail-closed, hiçbir şey bozulmaz).
// ════════════════════════════════════════════════════════

export const DENEME_TOPLAM = 5;

let _left: number | null = null;

/** Sunucudan bilinen kalan hak (null = bilmiyor/deneme veri yoksayılır) */
export function denemeKalan(): number | null {
  return _left;
}

/** ★ Deneme kapısı: kalan hak > 0 iken PRO/ELİT rozetleri ve kilitler KAPALI */
export function denemeAktifMi(): boolean {
  return _left != null && _left > 0;
}

/** authorize cevabından (source:"deneme") kalan hakkı günceller */
export function denemeAyarla(left: number): void {
  _left = Math.max(0, Math.min(DENEME_TOPLAM, Number(left) || 0));
}

/** Açılışta + her üretimden sonra sunucudan tazele (hata olsa sessizce geç) */
export async function denemeyiTazele(): Promise<void> {
  try {
    const res = await fetch("/api/customer/deneme", { cache: "no-store" });
    if (!res.ok) return; // oturum yok / servis yok → denede görünmez davranış sürer
    const j = (await res.json()) as { ok?: boolean; left?: number };
    if (j?.ok && typeof j.left === "number") denemeAyarla(j.left);
  } catch { /* ağ sessiz — fail-closed */ }
}
