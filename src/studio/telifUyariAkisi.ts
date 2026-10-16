// ══════════════════════════════════════════════════════
// TELİF UYARI AKIŞI (SRP tur 4, 16.10) — modül-düzeyi köprü
//
// Eski akış: StudioApp'te telifTetik/telifDevamRef + "2. artışta üretim
// yeniden çağır" effect'i — kırılgan ve modlo merkezde.
//
// Yeni akış:
//   • AÇILIŞ:   useVideoGenerator uyarı gerektiğini saptar → uyariAc()
//               aboneyi (StudioApp setTelifUyariAcik) çağırır → modal açılır.
//   • DEVAM:    StudioApp handleGenerate'i abone eder (devamiBagla);
//               TelifDisclaimer "Anladım" → bekleyenDevamiYurut() son
//               üretimi otomatik tekrar başlatır (ikinci tıklama gerekmez).
// ══════════════════════════════════════════════════════

type UyariAcar = () => void;
type DevamDinleyici = () => void;

let bekleyenDevam = false;
let devamAbone: DevamDinleyici | null = null;
let uyariAbone: UyariAcar | null = null;

// ─── DEVAM ZİNCİRİ ───────────────────────────────────────

/** useVideoGenerator: uyarı gösterildi — kabul edilince üretimi yeniden başlat */
export function devamBeklet(): void {
  bekleyenDevam = true;
}

/** StudioApp: handleGenerate'i yeniden çağıracak fonksiyonu bağlar; çıkarıcı döner */
export function devamiBagla(fn: DevamDinleyici): () => void {
  devamAbone = fn;
  return () => {
    if (devamAbone === fn) devamAbone = null;
  };
}

/** TelifDisclaimer "Anladım": bayrak varsa aboneyi çağır + temizle */
export function bekleyenDevamiYurut(): void {
  if (!bekleyenDevam) return;
  bekleyenDevam = false;
  const fn = devamAbone;
  if (fn) {
    // React event handler'ı döndükten sonra koşsun — await kuyruğuna güvenli sarkma
    window.setTimeout(() => { fn(); }, 30);
  }
}

// ─── AÇILIŞ SİNYALİ ──────────────────────────────────────

/** StudioApp: uyarıyı açan setState'i bağlar; çıkarıcı döner */
export function uyariAcilisiBagla(fn: UyariAcar): () => void {
  uyariAbone = fn;
  return () => {
    if (uyariAbone === fn) uyariAbone = null;
  };
}

/** useVideoGenerator: uyarı gösterilmeli — abone modalı açar */
export function uyariAc(): void {
  const fn = uyariAbone;
  if (!fn) return;
  // async üretim fonksiyonu içinde de çağrılabilir — setTimeout ile
  // React event kuyruğuna güvenli sarkar
  window.setTimeout(() => fn(), 30);
}
