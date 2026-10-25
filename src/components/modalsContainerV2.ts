// ════════════════════════════════════════════════════════
// MODALSCONTAINERV2.TS — ModalsContainer'dan taşındı (SRP parçalama, 09.10)
// V2 topluluk-oyu kilidi + LAZY KAPISI yardımcıları. Buradaki mantık elemanları
// ModalsContainer ile birebir aynıdır; durum ModalsContainer'da kalır.
// ════════════════════════════════════════════════════════

export type V2ModalId = "ayetKartlari" | "kesfet" | "ayetNotlari" | "ayetPaketleri" | "ozelGunTakvimi" | "haftaninVideosu" | "kelimeAtolyesi" | "arkaPlanUretici" | "kendiSes";

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
  // ★ 25.10 (kullanıcı emri): "Kendi Sesinle Üret" şimdilik GRİ V2 görünümünde —
  //   admin panel → Özellik Kilitleri'nden "elit" verildiği anda ELİT kapısına
  //   döner (v2KilitliMi v2/v3/off ⇄ pro/elit/free akışı birebir çalışır).
  kendiSes: "Kendi Sesinle Üret",
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

/** ★ 25.10 V2 GRİ KİLİT — ADMİN PANELDEN AÇILIR (kullanıcı emri):
 *  nur_feature_locks tablosunda modül satırı admin tarafından "v2" (Yakında)
 *  olarak işaretlendiyse modül Gİ V2 kilidine düşer ve oylamaya devreder;
 *  admin panel → Özellik Kilitleri'nden "free" yapıldığı anda herkese açılır
 *  (deploy'suz — /api/config poll'u ~60 sn'de yayır).
 *  Satır YOK ya da free/pro/elit → AÇIK (varsayılan şu andaki davranış korunur). */
export function v2KilitliMi(_m: V2ModalId, _ctx: {
  v2TestAcik: boolean;
  incelemeModu: boolean;
  isMasterSurum: boolean;
  lockDegeri: string; // getFeatureLock(m, "free")
}): boolean {
  // ★ 25.10 KALICI EMİR: "ayet notlarım herkese ücretsiz olsun" — admin dahi
  //   v2 kilidine çekemez; Notlar herkese (misafir dahil) hep açıktır.
  if (_m === "ayetNotlari") return false;
  if (ADMIN_HARD_KILITLI.includes(_m)) return !(_ctx.isMasterSurum || _ctx.incelemeModu);
  // KALICI EMİR: adminte her kilit açık — isMasterSürüm/inceleme kilidi asla aşmaz
  if (_ctx.isMasterSurum || _ctx.incelemeModu) return false;
  return _ctx.lockDegeri === "v2" || _ctx.lockDegeri === "v3" || _ctx.lockDegeri === "off";
}

/** Kilitli modallar hiç mount edilmez (içerik sızmasın) */
export function v2AcikMi(m: V2ModalId, modal: string | null, kilitli: boolean): boolean {
  return kilitli ? false : modal === m;
}
