// ════════════════════════════════════════════════════════
// MODALSCONTAINERV2.TS — ModalsContainer'dan taşındı (SRP parçalama, 09.10)
// V2 topluluk-oyu kilidi + LAZY KAPISI yardımcıları. Buradaki mantık elemanları
// ModalsContainer ile birebir aynıdır; durum ModalsContainer'da kalır.
// ════════════════════════════════════════════════════════

export type V2ModalId = "ayetKartlari" | "kesfet" | "hafizlikTesti" | "ayetNotlari" | "ayetPaketleri" | "ozelGunTakvimi";

export const V2_KILITLI: Record<V2ModalId, string> = {
  ayetKartlari: "Ayet & Dua Kütüphanesi",
  kesfet: "Keşfet Merkezi",
  hafizlikTesti: "Hafızlık Testi",
  ayetNotlari: "Ayet Notlarım",
  ayetPaketleri: "Hazır Ayet Paketleri",
  ozelGunTakvimi: "Özel Gün Takvimi",
};

export const V2_MODAL_IDLERI = Object.keys(V2_KILITLI) as V2ModalId[];

/** ★ LAZY KAPISI (07.10): açılan modal adlarını kaydet — bir kez açılan modalın
 *   chunk'ı yüklensin ve mount KALSIN (open=false'la devam; state kaybolmaz). */
export function acilanModalEkle(onceki: string[], modal: string): string[] {
  return onceki.includes(modal) ? onceki : [...onceki, modal];
}

export function acildiMiFn(acilanlar: string[], ...adlar: string[]): boolean {
  return adlar.some((a) => acilanlar.includes(a));
}

/** ★ V2 KİLİT İNCELEMESİ — v2TestAcikMi()/inceleme modu/master/admin-free:
 *   hangi durumda modal kilitlidir? ModalsContainer'daki v2Kapali obstası. */
export function v2KilitliMi(m: V2ModalId, ctx: {
  v2TestAcik: boolean;
  incelemeModu: boolean;
  isMasterSurum: boolean;
  lockDegeri: string; // getFeatureLock(m, "v2")
}): boolean {
  return !ctx.v2TestAcik && !ctx.incelemeModu && !ctx.isMasterSurum && ctx.lockDegeri !== "free";
}

/** Kilitli modallar hiç mount edilmez (içerik sızmasın) */
export function v2AcikMi(m: V2ModalId, modal: string | null, kilitli: boolean): boolean {
  return kilitli ? false : modal === m;
}
