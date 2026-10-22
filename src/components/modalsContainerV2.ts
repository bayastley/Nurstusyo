// ════════════════════════════════════════════════════════
// MODALSCONTAINERV2.TS — ModalsContainer'dan taşındı (SRP parçalama, 09.10)
// V2 topluluk-oyu kilidi + LAZY KAPISI yardımcıları. Buradaki mantık elemanları
// ModalsContainer ile birebir aynıdır; durum ModalsContainer'da kalır.
// ════════════════════════════════════════════════════════

export type V2ModalId = "ayetKartlari" | "kesfet" | "ayetNotlari" | "ayetPaketleri" | "ozelGunTakvimi" | "haftaninVideosu" | "kelimeAtolyesi" | "arkaPlanUretici";

// ★ 22.10 HER ŞEY HERKESE AÇIK (kullanıcı emri: "admine neden gizledin bazı şeyleri,
//   herşey admine açık olsun herşey" + "önerilen videolar vardı göremedim"): eski
//   HARD KİLİT ve oylama kilitleri KALDIRILDI — Ayet & Dua Kütüphanesi (ruh hali çubuğu
//   + öneriler), Keşfet, Kelime Atölyesi, Haftanın Videosu ve diğer V2 modülleri
//   artık misafir dahil HERKESE açık.
// ★ İçerikler ücretsiz kuralı zaten güvenli: ayet/atmosfer önerileri tier duyarlı
//   (free kullanıcıya PRO/ELİT öneri düşmez), kendisi de sunucuda doğrulanır.
export const V2_KILITLI: Record<V2ModalId, string> = {
  ayetKartlari: "Ayet & Dua Kütüphanesi",
  kesfet: "Keşfet Merkezi",
  ayetNotlari: "Ayet Notlarım",
  ayetPaketleri: "Hazır Ayet Paketleri",
  ozelGunTakvimi: "Özel Gün Takvimi",
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
// ★ 22.10 HARD KİLİT KALDIRILDI (kullanıcı emri: "her şey herkese açık"):
//   eski liste ["ayetKartlari"] durur — artık boş; misafir dahil tüm V2 modüller
//   oylamaya lımısla AÇIK. v2KilitliMi her durumda false döner.
export const ADMIN_HARD_KILITLI: V2ModalId[] = [];

/** ARTIK HEP false — (özkaynak: eski oylama kilidi kaldırıldı); imza korunur ki
 *  ModalsContainer'daki çağrılar olduğu gibi çalışmaya devam etsin. */
export function v2KilitliMi(_m: V2ModalId, _ctx: {
  v2TestAcik: boolean;
  incelemeModu: boolean;
  isMasterSurum: boolean;
  lockDegeri: string; // getFeatureLock(m, "v2")
}): boolean {
  if (ADMIN_HARD_KILITLI.includes(_m)) return !(_ctx.isMasterSurum || _ctx.incelemeModu);
  return false; // ★ her şey herkese açık (22.10)
}

/** Kilitli modallar hiç mount edilmez (içerik sızmasın) */
export function v2AcikMi(m: V2ModalId, modal: string | null, kilitli: boolean): boolean {
  return kilitli ? false : modal === m;
}
