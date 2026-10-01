// ════════════════════════════════════════════════════════
// ÖZELLİK BAYRAKLARI (01.10) — tek dosyada merkezi bayraklar
//
// ★ V2_TEST_ACIK (01.10 — SAHİBİN EMRİ): oylamadaki 6 V2 modalı
//   (ayetKartlari · kesfet · hafizlikTesti · ayetNotlari ·
//   ayetPaketleri · ozelGunTakvimi) TEST SÜRESİNCE HERKESE AÇIK.
//   - Oylama listesi ve v2Gate yönlendirmesi KORUNUR — havuz
//     bozulmaz; admin ileride oy mekanizmasını devreye aldığında
//     bu bayrağı false yapmak yeterli, kilitler birebir geri gelir.
//   - Atmosfer/açıklama (fallback "free") ve üyelik (tier) kilitleri
//     BU BAYRAKTAN BAĞIMSIZDIR — onlara dokunulmadı.
//   - Okuyucu: ModalsContainer.tsx (v2Kapali) + dev/modalDumanTesti.ts
//     (v2KilitliMi → V2 modalları gerçek açılış turuna girer).
// ════════════════════════════════════════════════════════

/** Oylamadaki V2 modalları test için herkese açık (false = kilitler geri gelir) */
export const V2_TEST_ACIK = true;
