// ════════════════════════════════════════════════════════
// GÜNLÜK SERİ (STREAK) — 02.11
// Kullanıcı her gün uygulamayı açarsa seri büyür; bir gün kaçırırsa sıfırlanır.
// Cihazda saklanır (localStorage), sunucuya hiç gitmez — Zikirmatik/Today's Gift
// ile aynı ruh. JETON VERMEZ (şimdilik): sayısal takip motivasyonu.
// Tarih cihazın YEREL saatiyle hesaplanır (UTC değil) — akşam/gece kullanımı adaletli.
// ════════════════════════════════════════════════════════

const SERI_KEY = "nur_gunluk_seri_v1";

export interface SeriBilgi {
  /** Bugün dahil üst üste gelinen gün sayısı (bugün ilk gelişse 1) */
  seri: number;
  /** Tüm zamanların en iyi serisi */
  enIyi: number;
  /** Bu ziyaret bugün seriyi ARTIRDI mı (aynı gün tekrar açış: false) */
  bugunArttirdi: boolean;
}

/** Cihaz yerel tarih anahtarı: "YYYY-MM-DD" */
export const gunAnahtari = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface Kayit { son: string; seri: number; enIyi: number }

const kayitOku = (): Kayit => {
  try {
    const ham = localStorage.getItem(SERI_KEY);
    if (!ham) return { son: "", seri: 0, enIyi: 0 };
    const d = JSON.parse(ham) as Partial<Kayit>;
    return {
      son: d.son || "",
      seri: Math.max(0, Number(d.seri) || 0),
      enIyi: Math.max(0, Number(d.enIyi) || 0),
    };
  } catch { return { son: "", seri: 0, enIyi: 0 }; }
};

const kayitYaz = (k: Kayit): void => {
  try { localStorage.setItem(SERI_KEY, JSON.stringify(k)); } catch { /* localStorage kapalıysa yut */ }
};

/** Seriyi ilerlet: bugün zaten geldiyse dokunmaz; dünden geldiyse +1; gün atlandıysa 1'e döner. */
export const seriIlerlet = (): SeriBilgi => {
  const kayit = kayitOku();
  const bugun = gunAnahtari();
  if (kayit.son === bugun) {
    return { seri: Math.max(1, kayit.seri), enIyi: Math.max(kayit.enIyi, kayit.seri), bugunArttirdi: false };
  }
  const dun = gunAnahtari(new Date(Date.now() - 86_400_000));
  const seri = kayit.son === dun ? kayit.seri + 1 : 1;
  const enIyi = Math.max(kayit.enIyi, seri);
  kayitYaz({ son: bugun, seri, enIyi });
  return { seri, enIyi, bugunArttirdi: true };
};

/** Sadece okur — seri ilerlemez (rozetteki "en iyi" göstergesi vb. için) */
export const seriOku = (): { seri: number; enIyi: number } => {
  const k = kayitOku();
  return { seri: k.seri, enIyi: Math.max(k.enIyi, k.seri) };
};

/** Ince ayarda canlı test için: kaydı elle zerzetin (gün anahtarı "YYYY-MM-DD") */
export const seriKayitYaz = (k: Partial<Kayit>): void =>
  kayitYaz({ son: k.son ?? "", seri: Number(k.seri) || 0, enIyi: Number(k.enIyi) || 0 });
