// ════════════════════════════════════════════════════════
// MODALSCONTAINERV2.TS — ModalsContainer'dan taşındı (SRP parçalama, 09.10)
// V2 topluluk-oyu kilidi + LAZY KAPISI yardımcıları. Buradaki mantık elemanları
// ModalsContainer ile birebir aynıdır; durum ModalsContainer'da kalır.
// ════════════════════════════════════════════════════════

export type V2ModalId = "ayetKartlari" | "kesfet" | "ayetNotlari" | "ayetPaketleri" | "ozelGunTakvimi" | "haftaninVideosu" | "kelimeAtolyesi" | "arkaPlanUretici";

export const V2_KILITLI: Record<V2ModalId, string> = {
  ayetKartlari: "Ayet & Dua Kütüphanesi", // ★ 18.10 HARD KİLİT (aşağıda) — admin-godmode hariç herkes kapalı
  kesfet: "Keşfet Merkezi",
  // ★ 17.10 (kullanıcı emri): hafizlikTesti OYLAMA KİLİDİNDEN ÇIKARIldı —
  //   Kur'an Öğreniyorum ekranına taşındı, herkese ÜCRETSİZ.
  ayetNotlari: "Ayet Notlarım",
  ayetPaketleri: "Hazır Ayet Paketleri",
  ozelGunTakvimi: "Özel Gün Takvimi",
  // ★ 17.10 GİZLE PLANI genişledi: kullanıcı "bunların hepsini gizle" dedi —
  //   menüde görünen 3 modül daha oylama kilidine alındı (admin hariç kapalı):
  haftaninVideosu: "Haftanın Videosu",
  kelimeAtolyesi: "Kelime Atölyesi",
  arkaPlanUretici: "Arka Plan Üretici",
};

// ★ 18.10 KUR'AN ÖĞRENME İÇERİKLERİ HEPSİ ÜCRETSİZ (kullanıcı emri):
//   "kuran okuma dinleme gibi ögrenme içerikleri hep ücretsiz olacak —
//    güncellemelerden sil ve bütün kullanıcılara aktif et".
//   Kur'an modalındaki ekran kilitleri (adm-kabe-canlı, adm-kuran-sayfalar,
//   adm-ekransiz-dinleme, adm-karşılaştırmalı-okuma, adm-latin-okunus,
//   adm-uyku-tilavet) QuranLearnModal qkAcik() ile çözülür — V2_KILITLI bu
//   kapsamda DEĞİL ve hafizlikTesti bu listede ZATEN YOK. Learn mealli içerik
//   öğrudan free; admin tek tıkla revealFeature ile açabilir (getFeatureLock
//   "v2") — kod tarafı "v2 Kapalı" iken bunlara asla engel olmaz.

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
// ★ 18.10 HARD KİLİT (kullanıcı emri): bu listedeki modüller admin-godmode/
//   Master HARİÇ HİÇKİMSENE açılmaz — misafir dahil tüm üyeler ve girişsizler
//   kilitli kalır. v2_test_acik anahtarı, oylama-lideri otomatik-free'i,
//   getFeatureLock değeri ve (admin haricinde) inceleme modu bu kapıyı AÇAMAZ.
//   İnceleme modu istisnası yalnız sahibin yerel ortamına eşittir.
export const ADMIN_HARD_KILITLI: V2ModalId[] = ["ayetKartlari"];

export function v2KilitliMi(m: V2ModalId, ctx: {
  v2TestAcik: boolean;
  incelemeModu: boolean;
  isMasterSurum: boolean;
  lockDegeri: string; // getFeatureLock(m, "v2")
}): boolean {
  if (ADMIN_HARD_KILITLI.includes(m)) return !(ctx.isMasterSurum || ctx.incelemeModu);
  return !ctx.v2TestAcik && !ctx.incelemeModu && !ctx.isMasterSurum && ctx.lockDegeri !== "free";
}

/** Kilitli modallar hiç mount edilmez (içerik sızmasın) */
export function v2AcikMi(m: V2ModalId, modal: string | null, kilitli: boolean): boolean {
  return kilitli ? false : modal === m;
}
