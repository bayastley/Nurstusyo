// =====================================================
// GUNLUK SERI (STREAK) v2 — 02.11 "OKUMA ŞARTLI SÜRÜM"
// Açmak yetmez: günü sayılması için bugün 1 AYET OKUMAK gerekir
// (addAyah / addWholeSurah başarısı → seriOkundu()). Açılışta
// seriAcilisDengele() yalnız durumu düzeltir, seri artırmaz.
// HAFTADA 1 GÜN AFFI: atlanan tek gün, son af 7 gün eskideyse
// seriyi bozmaz (streak freeze). Kayıt cihazda (localStorage),
// sunucuya gitmez. JETON YOK — motivasyon rozeti.
// Yazılanlar, rozete "nur_seri_degisti" pencere olayıyla canlı sızar.
// =====================================================

const SERI_KEY = "nur_gunluk_seri_v1";

export interface SeriBilgi {
  /** Üst üste okunan gün sayısı (bugün okunduysa dahil) */
  seri: number;
  /** Tüm zamanların en iyi serisi */
  enIyi: number;
  /** Bugün ayet okundu mu (okuma şartı: rozet bugün büyüdü mü?) */
  bugunOkundu: boolean;
  /** Bu hafta affı hâlâ kullanılabilir mi (1/hafta) */
  afMevcut: boolean;
}

/** Cihaz yerel tarih anahtarı: "YYYY-MM-DD" */
export const gunAnahtari = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface Kayit { son: string; seri: number; enIyi: number; afSon: string }

const BOS: Kayit = { son: "", seri: 0, enIyi: 0, afSon: "" };

const kayitOku = (): Kayit => {
  try {
    const ham = localStorage.getItem(SERI_KEY);
    if (!ham) return BOS;
    const d = JSON.parse(ham) as Partial<Kayit>;
    return {
      son: d.son || "",
      seri: Math.max(0, Number(d.seri) || 0),
      enIyi: Math.max(0, Number(d.enIyi) || 0),
      afSon: d.afSon || "",
    };
  } catch { return BOS; }
};

const kayitYaz = (k: Kayit): void => {
  try { localStorage.setItem(SERI_KEY, JSON.stringify(k)); } catch { /* localStorage kapalıysa yut */ }
};

/** İki yerel tarih anahtarı arasındaki KAÇ GÜN ATLANDI (0 = bitişik gün / aynı gün) */
const atlananGun = (son: string, bugun: string): number => {
  if (!son || !bugun) return 999;
  const gun = (g: string): number => {
    const p = g.split("-").map(Number);
    return Date.UTC(p[0], (p[1] || 1) - 1, p[2] || 1);
  };
  return Math.max(0, Math.round((gun(bugun) - gun(son)) / 86_400_000) - 1);
};

/** Affı tekrar kullanılabilir mi? Son af en az 7 gün önce kullanıldıysa evet (1/hafta). */
const afEskiMi = (afSon: string, bugun: string): boolean => !afSon || atlananGun(afSon, bugun) >= 6;

/** Pencere olayı: rozet anında tazelesin */
const seriDegistiHaber = (): void => {
  try { window.dispatchEvent(new Event("nur_seri_degisti")); } catch { /* yut */ }
};

/**
 * ★ OKUMA OLAYI (v2): kullanıcı bugün bir ayet okuyunca çağrılır.
 * dünden geldi +1; atlanan 1 gün & af müsait → af (seri korunur, af işaretlenir);
 * daha uzak boşluk veya af yok → 1'e döner. Hata hâlinde sessiz yut.
 */
export const seriOkundu = (): SeriBilgi => {
  try {
    const kayit = kayitOku();
    const bugun = gunAnahtari();
    if (kayit.son === bugun) {
      const seri = Math.max(1, kayit.seri);
      return { seri, enIyi: Math.max(kayit.enIyi, seri), bugunOkundu: true, afMevcut: afEskiMi(kayit.afSon, bugun) };
    }
    const atlanan = atlananGun(kayit.son, bugun);
    let seri = kayit.seri;
    let afKullandi = false;
    if (atlanan === 0) {
      seri = seri + 1; // dün okundu, bugün de okundu
    } else if (atlanan === 1 && afEskiMi(kayit.afSon, bugun)) {
      afKullandi = true; // bu hafta affı: atlanan gün bozmaz, gün sayılmaz
      seri = Math.max(1, seri);
    } else {
      seri = 1; // boşluk affedilmedi → yeni seri
    }
    const enIyi = Math.max(kayit.enIyi, seri);
    kayitYaz({ son: bugun, seri, enIyi, afSon: afKullandi ? bugun : kayit.afSon });
    seriDegistiHaber();
    return { seri, enIyi, bugunOkundu: true, afMevcut: afEskiMi(kayit.afSon, bugun) };
  } catch {
    return { seri: 0, enIyi: 0, bugunOkundu: false, afMevcut: false };
  }
};

/**
 * ★ AÇILIŞ DENGELEME (v2): uygulamayı açmak seriyi ARTIRMAZ;
 * yalnız süresi geçen seriyi düşürür. son=dün veya bugün → dokunma;
 * atlanan 1 gün & af müsait → rozet şimdilik ayakta (affın hakkı);
 * aksi hâlde seri=0 (rozet gizlenir), okumayla yeniden doğar.
 */
export const seriAcilisDengele = (): SeriBilgi => {
  try {
    const kayit = kayitOku();
    const bugun = gunAnahtari();
    const atlanan = atlananGun(kayit.son, bugun);
    const afVar = afEskiMi(kayit.afSon, bugun);
    const okundu = kayit.son === bugun;
    if (kayit.son === bugun || atlanan === 0 || (atlanan === 1 && afVar)) {
      const seri = Math.max(0, kayit.seri);
      return { seri, enIyi: Math.max(kayit.enIyi, seri), bugunOkundu: okundu, afMevcut: afVar };
    }
    // serinin süresi doldu: sıfırla (enIyi korunur)
    kayitYaz({ son: kayit.son, seri: 0, enIyi: kayit.enIyi, afSon: kayit.afSon });
    return { seri: 0, enIyi: kayit.enIyi, bugunOkundu: false, afMevcut: afVar };
  } catch {
    return { seri: 0, enIyi: 0, bugunOkundu: false, afMevcut: false };
  }
};

/** Sadece okur — hiçbir şey yazmaz (rozetteki yenileme React durumu için) */
export const seriOku = (): { seri: number; enIyi: number; bugunOkundu: boolean; afMevcut: boolean } => {
  const k = kayitOku();
  const bugun = gunAnahtari();
  return { seri: k.seri, enIyi: Math.max(k.enIyi, k.seri), bugunOkundu: k.son === bugun, afMevcut: afEskiMi(k.afSon, bugun) };
};

/** Ince ayar canlı test için: kaydı elle yaz (gün anahtarı "YYYY-MM-DD", afSon opsiyonel) */
export const seriKayitYaz = (k: Partial<Kayit>): void =>
  kayitYaz({ son: k.son ?? "", seri: Number(k.seri) || 0, enIyi: Number(k.enIyi) || 0, afSon: k.afSon ?? "" });

/** v1 uyumluluğu: eski çağrılar okuma olayına yönlendirilir */
export const seriIlerlet = seriOkundu;
