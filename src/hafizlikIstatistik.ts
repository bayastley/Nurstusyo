// ════════════════════════════════════════════════════════
// HAFIZLIK İSTATİSTİK + ROZETLER — yol haritası madde 52 & 16
// Yalnızca cihazda (localStorage) — sunucuya HİÇBİR şey gitmez.
//   • madde 52: hangi sure kaç tekrar, doğru/yanlış dağılımı
//   • madde 16: başarım rozetleri (test serileri, zikir, hatim…)
//   • madde 38: kaldığın yerden devam (son test + seviye)
// ════════════════════════════════════════════════════════

const IST_KEY = "nur_hafizlik_ist_v1";
const ROZET_KEY = "nur_rozetler_v1";
const DEVAM_KEY = "nur_hafizlik_devam_v1";

// ★ ROZET ÖDÜL DÖNGÜSÜ (28.09, kullanıcı kararı): "rozetler bitince üretim hakkı versin,
//   hediye KESİN verilsin; sonraki turda limitler zorlaşsın, ödül artsın (5→15→30…);
//   bitince sıfırlansın; rozetin altında kaç tur bitirdiyse kırmızı yıldız olsun."
//
//   Nasıl çalışıyor:
//   • 13 rozetin HEPSI kazanılınca otomatik HEDİYE düşer (kisa hak — grantPack;
//     kota+paket zincirinde TÜKETİLEBİLİR tek gerçek hak mekanizması bu).
//   • Tur (cycle) N'de ödül: N=1→5, N=2→15, N=3→30, N≥4→50 hak (jeton değil —
//     videoMaliyeti kısa=1 olduğundan 1 hak = 1 kısa video).
//   • Hediye verilince rozetler sıfırlanır (kazanim temizlenir) VE EŞİKLER ZORLAŞIR:
//     ROZET_TANIMLARI'ndaki esik değerleri turNo ile çarpılır (1x → 1.5x → 2.5x → 4x).
//     Böylece "biraz daha uğraşılır ama imkânsız olmaz" — sonsuz döngü.
//   • Rozetin altındaki kırmızı küçük yıldız = o rozet kaç kez kazanıldı (tur sayısı).
//   • Yalnız cihazda (localStorage) — sunucuya hiçbir şey gitmez.
export interface RozetOzelDurum {
  /** her rozet id → kaç kez kazanıldı (tamamlanan tur sayısı; 1. turda 1) */
  kazanimSayisi: Record<string, number>;
  /** tamamlanan döngü sayısı — eşik zorluğu ve ödül büyüklüğü bununla hesaplanır */
  turNo: number;
  /** sıradaki hediye kaç hak olacak (kazanım anında hesaplanır, log amaçlı) */
  sonOdul: number;
  sonOdulTarih: number;
  /** ★ TUR TABANI: bu değerlerin ÜZERİNDEKİ ilerleme yeni turda sayılır —
   *  ömür boyu toplamlar (zikirmatik/hatim/istatistik) ASLA silinmez; rozet
   *  hedefleri tabandan itibaren yeniden tırmanır. Örn. zikirToplam=1200'de
   *  2. tura girilirse hedef 1500 (1000×1.5) olur; geri gitmez. */
  taban: { zikirToplam: number; hatimCuz: number; uretimToplam: number; testToplam: number };
}
const ROZET_OZEL_KEY = "nur_rozet_ozel_v1";
const ROZET_ODUL_ON_ESIK = [5, 15, 30, 50]; // 1. tur → 5 hak, 2. tur → 15, 3. → 30, sonra 50
export function rozetEsikCarpani(turNo: number): number {
  return turNo <= 1 ? 1 : turNo === 2 ? 1.5 : turNo === 3 ? 2.5 : 4;
}
/** Kazanım eşiği: tanımdaki esik × tur çarpanı (hedefe YUKARI yuvarlanır) */
export function rozetOzelOku(): RozetOzelDurum {
  try {
    const raw = localStorage.getItem(ROZET_OZEL_KEY);
    if (raw) {
      const p = JSON.parse(raw) as RozetOzelDurum;
      return {
        kazanimSayisi: p.kazanimSayisi ?? {},
        turNo: p.turNo ?? 1,
        sonOdul: p.sonOdul ?? 0,
        sonOdulTarih: p.sonOdulTarih ?? 0,
        taban: p.taban ?? { zikirToplam: 0, hatimCuz: 0, uretimToplam: 0, testToplam: 0 },
      };
    }
  } catch { /* yoksay */ }
  return { kazanimSayisi: {}, turNo: 1, sonOdul: 0, sonOdulTarih: 0, taban: { zikirToplam: 0, hatimCuz: 0, uretimToplam: 0, testToplam: 0 } };
}
function rozetOzelYaz(d: RozetOzelDurum): void {
  try { localStorage.setItem(ROZET_OZEL_KEY, JSON.stringify(d)); } catch { /* yoksay */ }
}
export function rozetOduluHesapla(turNo: number): number {
  return ROZET_ODUL_ON_ESIK[Math.min(turNo - 1, ROZET_ODUL_ON_ESIK.length - 1)] ?? 50;
}

export interface SureIstatistigi { tekrar: number; dogru: number }
export interface HafizlikIstatistik {
  /** sure no → { tekrar, dogru } */
  sureler: Record<number, SureIstatistigi>;
  toplamSoru: number;
  toplamDogru: number;
  /** en son yanlış yapılan sureler (tekrar önerisi) */
  zorlanilan: number[];
  guncelleme: number;
}

export function hafizlikIstOku(): HafizlikIstatistik {
  try {
    const raw = localStorage.getItem(IST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HafizlikIstatistik;
      if (parsed && typeof parsed === "object" && parsed.sureler) return parsed;
    }
  } catch { /* yoksay */ }
  return { sureler: {}, toplamSoru: 0, toplamDogru: 0, zorlanilan: [], guncelleme: 0 };
}

export function hafizlikIstKaydet(sure: number, dogruMu: boolean): void {
  try {
    const ist = hafizlikIstOku();
    const k = ist.sureler[sure] ?? { tekrar: 0, dogru: 0 };
    k.tekrar += 1;
    if (dogruMu) k.dogru += 1;
    ist.sureler[sure] = k;
    ist.toplamSoru += 1;
    if (dogruMu) ist.toplamDogru += 1;
    // zorlanilan: son 10 yanlışın sureleri (yinelenen de olur — ağırlık verir)
    if (!dogruMu) {
      ist.zorlanilan = [sure, ...ist.zorlanilan.filter((s) => s !== sure)].slice(0, 10);
    } else {
      ist.zorlanilan = ist.zorlanilan.filter((s) => s !== sure);
    }
    ist.guncelleme = Date.now();
    localStorage.setItem(IST_KEY, JSON.stringify(ist));
    window.dispatchEvent(new Event("nur-hafizlik-guncelle"));
  } catch { /* yoksay */ }
}

/** Kaldığın yerden devam (madde 38): son tur ayarları */
export interface HafizlikDevam { seviye: string; tarih: number; dogru: number; toplam: number }
export function hafizlikDevamOku(): HafizlikDevam | null {
  try {
    const raw = localStorage.getItem(DEVAM_KEY);
    if (raw) return JSON.parse(raw) as HafizlikDevam;
  } catch { /* yoksay */ }
  return null;
}
export function hafizlikDevamKaydet(seviye: string, dogru: number, toplam: number): void {
  try { localStorage.setItem(DEVAM_KEY, JSON.stringify({ seviye, dogru, toplam, tarih: Date.now() })); } catch { /* yoksay */ }
}

// ─── ROZETLER (madde 16) ────────────────────────────────────
export interface RozetDurumu {
  /** kilit açılmışsa tarih, değilse 0 */
  kazanim: Record<string, number>;
  zikirToplam: number;
  hatimCuz: number;
  uretimToplam: number;
  testToplam: number;
}

const ROZET_TANIMLARI: Array<{
  id: string; ad: string; emoji: string; aciklama: string;
  kosul: (d: RozetDurumu) => boolean;
  /** ★ ödül döngüsü: hangi sayaç kaçta açılır — eşikler turNo ile zorlaştırılır */
  kosulMeta?: { alan: keyof RozetDurumu; esik: number };
}> = [
  { id: "ilk-test", ad: "İlk Adım", emoji: "🌱", aciklama: "İlk hafızlık testini tamamla", kosul: (d) => d.testToplam >= 5, kosulMeta: { alan: "testToplam", esik: 5 } },
  { id: "test-25", ad: "Çalışkan Öğrenci", emoji: "📚", aciklama: "25 soru çöz", kosul: (d) => d.testToplam >= 25, kosulMeta: { alan: "testToplam", esik: 25 } },
  { id: "test-100", ad: "Hafız Adayı", emoji: "🧠", aciklama: "100 soru çöz", kosul: (d) => d.testToplam >= 100, kosulMeta: { alan: "testToplam", esik: 100 } },
  { id: "zikir-100", ad: "Zikir Dostu", emoji: "📿", aciklama: "Toplam 100 zikir çek", kosul: (d) => d.zikirToplam >= 100, kosulMeta: { alan: "zikirToplam", esik: 100 } },
  { id: "zikir-1000", ad: "Zikir Hamlesi", emoji: "💯", aciklama: "Toplam 1000 zikir çek", kosul: (d) => d.zikirToplam >= 1000, kosulMeta: { alan: "zikirToplam", esik: 1000 } },
  { id: "zikir-10000", ad: "Denizin Dibi", emoji: "🌊", aciklama: "Toplam 10.000 zikir çek", kosul: (d) => d.zikirToplam >= 10000, kosulMeta: { alan: "zikirToplam", esik: 10000 } },
  { id: "cuz-1", ad: "İlk Cüz", emoji: "📖", aciklama: "İlk cüzünü tamamla", kosul: (d) => d.hatimCuz >= 1, kosulMeta: { alan: "hatimCuz", esik: 1 } },
  { id: "cuz-10", ad: "Cüz Toplayıcı", emoji: "🔖", aciklama: "10 cüz tamamla", kosul: (d) => d.hatimCuz >= 10, kosulMeta: { alan: "hatimCuz", esik: 10 } },
  { id: "hatim-1", ad: "Hatim Sahibi", emoji: "🏆", aciklama: "Bir hatim tamamla (30 cüz)", kosul: (d) => d.hatimCuz >= 30, kosulMeta: { alan: "hatimCuz", esik: 30 } },
  { id: "uret-1", ad: "İlk Video", emoji: "🎬", aciklama: "İlk videonu üret", kosul: (d) => d.uretimToplam >= 1, kosulMeta: { alan: "uretimToplam", esik: 1 } },
  { id: "uret-10", ad: "Üretici", emoji: "🎥", aciklama: "10 video üret", kosul: (d) => d.uretimToplam >= 10, kosulMeta: { alan: "uretimToplam", esik: 10 } },
  { id: "uret-50", ad: "İçerik Fabrikası", emoji: "🏭", aciklama: "50 video üret", kosul: (d) => d.uretimToplam >= 50, kosulMeta: { alan: "uretimToplam", esik: 50 } },
  { id: "streak-7", ad: "7 Gün Serisi", emoji: "🔥", aciklama: "7 gün üst üste üret", kosul: () => false }, // streak modülünden beslenir
];

/** Rozetin BU turdaki hedefi (taban + eşik×çarpan) — kosul ve UI için tek kaynak.
 *  meta'sız rozet (streak) → null: eski kosul() geçerli, zorlanamaz. */
export function rozetGuncelEsik(id: string, turNo: number): number | null {
  const r = ROZET_TANIMLARI.find((x) => x.id === id);
  if (!r?.kosulMeta) return null;
  const taban = rozetOzelOku().taban[r.kosulMeta.alan] ?? 0;
  return taban + Math.ceil(r.kosulMeta.esik * rozetEsikCarpani(turNo));
}
export function rozetAdi(id: string): string { return ROZET_TANIMLARI.find((x) => x.id === id)?.ad ?? id; }

export function rozetlerOku(): RozetDurumu {
  try {
    const raw = localStorage.getItem(ROZET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RozetDurumu;
      if (parsed && typeof parsed.kazanim === "object") return { kazanim: parsed.kazanim ?? {}, zikirToplam: parsed.zikirToplam ?? 0, hatimCuz: parsed.hatimCuz ?? 0, uretimToplam: parsed.uretimToplam ?? 0, testToplam: parsed.testToplam ?? 0 };
    }
  } catch { /* yoksay */ }
  return { kazanim: {}, zikirToplam: 0, hatimCuz: 0, uretimToplam: 0, testToplam: 0 };
}

export const ROZET_LISTESI = ROZET_TANIMLARI;

/** Rozet sayaçlarını güncelle ve yeni kilitlenenleri döndür.
 *  ★ ÖDÜL DÖNGÜSÜ: tüm rozetler (meta'lılar) açıkken otomatik hediye düşer,
 *    rozetler sıfırlanır, eşikler zorlaşır, tur sayısı artar. */
export function rozetSayacGuncelle(degisiklik: Partial<Pick<RozetDurumu, "zikirToplam" | "hatimCuz" | "uretimToplam" | "testToplam">>): string[] {
  try {
    const mevcut = rozetlerOku();
    const ozel = rozetOzelOku();
    const yeni: RozetDurumu = {
      kazanim: mevcut.kazanim,
      zikirToplam: degisiklik.zikirToplam ?? mevcut.zikirToplam,
      hatimCuz: degisiklik.hatimCuz ?? mevcut.hatimCuz,
      uretimToplam: degisiklik.uretimToplam ?? mevcut.uretimToplam,
      testToplam: degisiklik.testToplam ?? mevcut.testToplam,
    };
    const yeniKazanilanlar: string[] = [];
    // ★ EŞİK + TABAN: hedef = taban + tanım_eşiği × tur çarpanı. Sayaç tabandan
    //    itibaren ilerler; ömür boyu toplamlar korunur, hedefler turla zorlaşır.
    const taban = ozel.taban;
    const hedefOf = (r: NonNullable<typeof ROZET_TANIMLARI[number]["kosulMeta"]>): number =>
      taban[r.alan] + Math.ceil(r.esik * rozetEsikCarpani(ozel.turNo));
    for (const r of ROZET_TANIMLARI) {
      if (!r.kosulMeta) continue; // meta'sız (streak) eski kosul ile aşağıda
      const hedef = hedefOf(r.kosulMeta);
      if (!yeni.kazanim[r.id] && (yeni[r.kosulMeta.alan] as number) >= hedef) {
        yeni.kazanim[r.id] = Date.now();
        yeniKazanilanlar.push(`${r.emoji} ${r.ad}`);
      }
    }
    // meta'sız rozetler (streak) eski koşulla
    for (const r of ROZET_TANIMLARI) {
      if (r.kosulMeta) continue;
      if (!yeni.kazanim[r.id] && r.kosul(yeni)) {
        yeni.kazanim[r.id] = Date.now();
        yeniKazanilanlar.push(`${r.emoji} ${r.ad}`);
      }
    }
    localStorage.setItem(ROZET_KEY, JSON.stringify(yeni));

    // ★ HEDİYE ZAMANI: meta'lı tüm rozetler açık + hediye bu güncellemede verilmemişse
    const metaLiler = ROZET_TANIMLARI.filter((r) => r.kosulMeta);
    const hepsiAcik = metaLiler.every((r) => yeni.kazanim[r.id]);
    const odulVerildiRef = { verildi: false };
    if (hepsiAcik && !odulVerildiRef.verildi) {
      odulVerildiRef.verildi = true;
      const odulHak = rozetOduluHesapla(ozel.turNo);
      try {
        // ★ SUNUCU CÜZDANINA YAZIM (29.09, kullanıcı kararı: "cihazdan bağımsız,
        //   tekrar alınamaz"): girişli kullanıcıda ödül /api/rewards/claim →
        //   nur_reward_claims (unique user+key → tekrar alınamaz) → nur_video_rights
        //   (sunucu cüzdanı → her cihazda geçerli). Girişsiz kullanıcıda oturum
        //   olmadığından yerel grantPack yolu korunur (eskiden tek yol buydu).
        //   Sunucu 409 ALREADY_CLAIMED dönerse sessizce kabul edilir — ödül zaten
        //   güvende, kullanıcıya yanlış uyarı gösterilmez.
        void (async () => {
          try {
            const r = await fetch("/api/rewards/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ eventKey: `rozet-${ozel.turNo}` }),
            });
            if (r.ok) {
              const d = await r.json().catch(() => null) as { amount?: number } | null;
              const sunucuHak = Number(d?.amount ?? odulHak);
              window.dispatchEvent(new CustomEvent("nur-rozet-odul", { detail: { hak: sunucuHak, tur: ozel.turNo, sunucu: true } }));
              window.dispatchEvent(new CustomEvent("nur-rozet-kazanildi", { detail: [`🎁 +${sunucuHak} üretim hakkı hesabına yazıldı — her cihazdan geçerli!`] }));
              return;
            }
            if (r.status === 409) {
              // Zaten alınmış — ödül güvende, sessizce onayla
              window.dispatchEvent(new CustomEvent("nur-rozet-odul", { detail: { hak: odulHak, tur: ozel.turNo, sunucu: true } }));
              return;
            }
            // 401 (girişsiz) / 503: yerel yola düş — ödül kaybolmasın
            import("./tier").then(({ grantPack }) => grantPack("kisa", odulHak));
            window.dispatchEvent(new CustomEvent("nur-rozet-odul", { detail: { hak: odulHak, tur: ozel.turNo } }));
          } catch {
            // Ağ hatası — yerel yola düş
            import("./tier").then(({ grantPack }) => grantPack("kisa", odulHak));
            window.dispatchEvent(new CustomEvent("nur-rozet-odul", { detail: { hak: odulHak, tur: ozel.turNo } }));
          }
        })();
      } catch { /* ödül yazımı siteyi ASLA bozmaz */ }
      const yeniOzel: RozetOzelDurum = {
        kazanimSayisi: (() => {
          const k = { ...ozel.kazanimSayisi };
          for (const r of ROZET_TANIMLARI) if (yeni.kazanim[r.id]) k[r.id] = (k[r.id] || 0) + 1;
          return k;
        })(),
        turNo: ozel.turNo + 1,
        sonOdul: odulHak,
        sonOdulTarih: Date.now(),
        // ★ TABAN GÜNCELLENİR: yeni turdaki hedefler mevcut ilerlemenin üstünden başlar
        taban: { zikirToplam: yeni.zikirToplam, hatimCuz: yeni.hatimCuz, uretimToplam: yeni.uretimToplam, testToplam: yeni.testToplam },
      };
      rozetOzelYaz(yeniOzel);
      // ★ SIFIRLAMA: rozetler kapanır (sayaçlar/tabanlar korunur), eşikler zorlaşır
      const sifirlanan: RozetDurumu = { kazanim: {}, zikirToplam: yeni.zikirToplam, hatimCuz: yeni.hatimCuz, uretimToplam: yeni.uretimToplam, testToplam: yeni.testToplam };
      localStorage.setItem(ROZET_KEY, JSON.stringify(sifirlanan));
      window.dispatchEvent(new CustomEvent("nur-rozet-kazanildi", { detail: [`🎁 Rozet serisi tamam! +${odulHak} üretim hakkı — ${ozel.turNo}. tur bitti, eşikler zorlaştı (${rozetEsikCarpani(yeniOzel.turNo)}×)`] }));
      return [`🎁 +${odulHak} üretim hakkı kazandın!`];
    }

    if (yeniKazanilanlar.length) window.dispatchEvent(new CustomEvent("nur-rozet-kazanildi", { detail: yeniKazanilanlar }));
    return yeniKazanilanlar;
  } catch { return []; }
}

/** Zikirmatik/Hatim/Üretim sayaçlarından rozetleri besle (çağrı yerleri: ilgili modüller) */
export function rozetleriTazele(): string[] {
  try {
    // üretim istatistiği (IslamicToolsPanel URETIM_IST_KEY ile aynı)
    let uretim = 0;
    try {
      const raw = localStorage.getItem("nur_uretim_istatistik_v1");
      if (raw) uretim = (JSON.parse(raw) as { toplam?: number }).toplam ?? 0;
    } catch { /* yoksay */ }
    // hatim cüz sayısı (TopluHatim TOPLU_HATIM_KEY ile aynı)
    let cuz = 0;
    try {
      const raw = localStorage.getItem("nur_toplu_hatim_v1");
      if (raw) cuz = ((JSON.parse(raw) as { cüzler?: number[] }).cüzler ?? []).length;
    } catch { /* yoksay */ }
    // toplam zikir (Zikirmatik ZIKIR_KEY ile aynı)
    let zikir = 0;
    try { zikir = Number(localStorage.getItem("nur_zikirmatik_v1")) || 0; } catch { /* yoksay */ }
    // test sayısı
    const test = hafizlikIstOku().toplamSoru;
    return rozetSayacGuncelle({ uretimToplam: uretim, hatimCuz: cuz, zikirToplam: zikir, testToplam: test });
  } catch { return []; }
}
