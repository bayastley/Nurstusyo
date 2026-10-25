// ════════════════════════════════════════════════════════
// SESLENDIRMEBOLUM.TS — SeslendirmeModal parçalama (25.10):
// metin bölüm planlayıcı çekirdeği (planKes + metinPartArttir + kancaBirlestir).
// Birebir taşınma (davranış aynı); metin bunlarla açıklanan parametreyle geçiyor.
// ════════════════════════════════════════════════════════
import { mBol, mSkorla } from "./seslendirmeMotor";


  /** mBol sonucunu hedefN parçaya indir/büyüt — oransal köprüleme. */
  export const planKes = (metin: string, hedefN: number): { m: string; kat: string }[] => {
    const tamPlan = mBol(metin.trim());
    if (tamPlan.length <= hedefN) {
      // büyükten bölünerek alt parçaya genişlet — metin motoru uluslar arası bir bölme yoksa
      // kelime yarı bölme (saf + güvenli) devreye girer
      const ek = hedefN - tamPlan.length;
      const out = [...tamPlan];
      while (out.length < hedefN) {
        // en uzun parçayı yarı kes
        let maxI = 0, maxLen = 0;
        out.forEach((p, j) => { const l = p.m.split(/\s+/).length; if (l > maxLen) { maxLen = l; maxI = j; } });
        if (maxLen < 4) break;          // çok kısa — daha bölünmez
        const buyuk = out[maxI];
        const kel = buyuk.m.split(/\s+/);
        const yari = Math.ceil(maxLen / 2);
        const ilk = kel.slice(0, yari).join(" "), ikinci = kel.slice(yari).join(" ");
        out.splice(maxI, 1, { ...buyuk, m: ilk }, { ...buyuk, m: ikinci });
      }
      // hala eksikse minimum metinli parçalara boş kart (boş değil, birleştirilmiş)
      while (out.length < hedefN && out.length) {
        const last = out[out.length - 1];
        const kel = last.m.split(/\s+/);
        if (kel.length < 4) break;
        const yari = Math.ceil(kel.length / 2);
        out.splice(out.length - 1, 1,
          { ...last, m: kel.slice(0, yari).join(" ") },
          { ...last, m: kel.slice(yari).join(" ") });
      }
      return out;
    }
    // çok parça → komşuları birleştirerek hedefe indir
    const out = [...tamPlan];
    while (out.length > hedefN) {
      // en kısa ardışık çifti birleştir (metin yetisi korunur)
      let minI = 0, minTop = Infinity;
      for (let i = 0; i < out.length - 1; i++) {
        const t = out[i].m.split(/\s+/).length + out[i + 1].m.split(/\s+/).length;
        if (t < minTop) { minTop = t; minI = i; }
      }
      const a = out[minI], b = out[minI + 1];
      out.splice(minI, 2, { m: `${a.m} ${b.m}`.trim(), kat: mSkorla(`${a.m} ${b.m}`) });
    }
    return out;
  };


  /** ★ 20.10: mBol az part (2-3) ürettiyse ve kullanıcı daha fazla bölüm istedi →
   *  mevcut partları EN UZUN cümle-sonundan yararak çoğalt (kelime yarı bölme YOK,
   *  cümle bütünlüğü korunur). planKes'ten farkı: daha uzun DAĞTIK — part ARAMIŞZ. */
  export const metinPartArttir = (planParcalar: { m: string; kat: string }[], hedefN: number): { m: string; kat: string }[] => {
    const out = planParcalar.map((p) => ({ ...p }));
    let turSayisi = 0;
    while (out.length < hedefN && turSayisi < 20) {
      turSayisi++;
      // en uzun partı bul ve cümle sınırında ikiye böl
      let maxI = 0, maxLen = 0;
      out.forEach((p, j) => { const l = p.m.split(/[^.!?…]+[.!?…]+/).length; if (l > maxLen) { maxLen = l; maxI = j; } });
      const buyuk = out[maxI];
      const cumleler = buyuk.m.trim().match(/[^.!?…]+[.!?…]+["»')\]]*\s*|[^.!?…]+$/g) || [buyuk.m];
      if (cumleler.length < 2) break; // daha bölünmez
      const yari = Math.ceil(cumleler.length / 2);
      const ilk = cumleler.slice(0, yari).join("").trim(), ikinci = cumleler.slice(yari).join("").trim();
      if (!ikinci) break;
      out.splice(maxI, 1, { m: ilk, kat: mSkorla(ilk) }, { m: ikinci, kat: mSkorla(ikinci) });
    }
    return out;
  };


  /** ★ 18.10 kanca planı hedef sayıya inince: en kısa komşu çiftlerini birleştir
   *  (düz planKes'inin aynısı ama kanca-kesim metinlerine dokunmadan). */
  export const kancaBirlestir = (planParcalar: { m: string; kat: string }[], hedefN: number) => {
    const out = [...planParcalar];
    while (out.length > hedefN) {
      let minI = 0, minTop = Infinity;
      for (let i = 0; i < out.length - 1; i++) {
        const t = out[i].m.split(/\s+/).length + out[i + 1].m.split(/\s+/).length;
        if (t < minTop) { minTop = t; minI = i; }
      }
      const a = out[minI], b = out[minI + 1];
      out.splice(minI, 2, { m: `${a.m} ${b.m}`.trim(), kat: mSkorla(`${a.m} ${b.m}`) });
    }
    return out;
  };
