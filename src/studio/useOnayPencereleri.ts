// ════════════════════════════════════════════════════════
// USEONAYPENCERELERI — StudioApp'ten taşındı (SRP parçalama tur 3, 16.10)
// İki bilgilendirilmiş-onay penceresi TEK hook'ta:
//   1) Üretim maliyeti onayı: free/pro kullanıcının "Video Üret" basışında
//      çıkan maliyet/ucret balonu (UretimOnayBalonu bileşeni çizer).
//   2) Telif risk onayı (09.10): Pro/Elit üye, telif riski %30 ÜZERİ bir
//      kâriyle üretim basınca ayrı bir bilgilendirilmiş-onay penceresi alır.
//      Kabul ederse o kâri cihazda kalıcı işaretlenir — bir daha sorulmaz.
//      Free tier'da high-risk kâri zaten kilitli olduğundan bu kapı yalnız
//      ücretli kullanıcıya açılır.
// İkisi de Promise döndürür — useVideoGenerator await edip hesabı görür.
// JSX fenerleri (genConfirmOpen/riskOnayData) hook these state'leri çizer.
// ════════════════════════════════════════════════════════

import { useCallback, useRef, useState } from "react";

type GenConfirmData = { cost: number; remaining: number; formatCount: number; mode: string; hak: { kind: string; quotaLeft: number; packLeft: number } | null };
type RiskOnayData = { reciterName: string; riskPercent: number };
// ★ 29.10 TÜR BAZLI HAK GÖSTERİMİ (kullanıcı: "KISA üretiyorum HEPSİNİ gösteriyor — ayarla"):
//   balon eskiden yalnız jeton cüzdanını (tüm modlara ortak ⚡) gösteriyordu.
//   Artık sunucunun /api/render/authorize cevabındaki TÜR BAZLI kalan hak da taşınır:
//   authorize kota/paketten düşüm YAPMIŞ halde döner — "kalan" o muhteviyattır.
type HakData = { kind: string; quotaLeft: number; packLeft: number }

export function useOnayPencereleri() {
  // ★ Üretim Onay Balonu — free/pro kullanıcılar için maliyet uyarısı
  const [genConfirmOpen, setGenConfirmOpen] = useState(false);
  const [genConfirmData, setGenConfirmData] = useState<GenConfirmData | null>(null);
  const genConfirmResolveRef = useRef<((ok: boolean) => void) | null>(null);

  const showGenerateConfirm = useCallback((cost: number, remaining: number, formatCount: number, mode: string, hak: HakData | null = null): Promise<boolean> => {
    return new Promise((resolve) => {
      setGenConfirmData({ cost, remaining, formatCount, mode, hak });
      setGenConfirmOpen(true);
      genConfirmResolveRef.current = resolve;
    });
  }, []);

  const handleGenConfirm = useCallback((ok: boolean) => {
    setGenConfirmOpen(false);
    genConfirmResolveRef.current?.(ok);
    genConfirmResolveRef.current = null;
  }, []);

  // ★ TELİF RİSK ONAYI (09.10)
  const [riskOnayData, setRiskOnayData] = useState<RiskOnayData | null>(null);
  const riskOnayResolveRef = useRef<((ok: boolean) => void) | null>(null);
  const showRiskOnay = useCallback((reciterName: string, riskPercent: number): Promise<boolean> => {
    // ★ Kalıcı-onay kontrolü: bu kâri için kullanıcı daha ÖNCE "Riski Kabul
    //   Ediyorum" dedi ise pencere hiç açılmaz (cihaz bazlı localStorage; KVKK
    //   silme hakkına uyumlu — kullanıcı cihaz verisini temizlerse yeniden sorulur).
    try {
      if (localStorage.getItem(`nur_telif_risk_onay_${reciterName}`) === "1") return Promise.resolve(true);
    } catch { /* depolama kapalıysa her seferinde sor */ }
    return new Promise((resolve) => {
      setRiskOnayData({ reciterName, riskPercent });
      riskOnayResolveRef.current = resolve;
    });
  }, []);
  const handleRiskOnay = useCallback((ok: boolean) => {
    setRiskOnayData(null);
    riskOnayResolveRef.current?.(ok);
    riskOnayResolveRef.current = null;
  }, []);

  return {
    // üretim maliyeti onayı
    genConfirmOpen, genConfirmData, showGenerateConfirm, handleGenConfirm,
    // telif risk onayı
    riskOnayData, showRiskOnay, handleRiskOnay,
  };
}
