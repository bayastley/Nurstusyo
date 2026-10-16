// ══════════════════════════════════════════════════════
// TELİF UYARI AKIŞI (SRP tur 4, 16.10) — modül-düzeyi köprü
//
// Eski akış: StudioApp'te telifTetik state + useEffect ile
// "tetik=2 olduğunda handleGenerate() çağır" — render sırasında
// setState kuyruğuna sarkan kırılgan taşınabilir bir circuit.
//
// Yeni akış: useVideoGenerator, telif uyarısı gerekli olduğunda
// bekleyen-devam bayrağını bu modüle yazar. TelifDisclaimer
// "Anladım" basılınca hangi bileşende olursa olsun telifUyarisiKabulEt()
// çağrılır → kabul işlevi bu modüldeki bekleyen-devam bayrağını
// okuyup handleGenerate'i tekrar tetikleyen aboneyi bildirir.
// ══════════════════════════════════════════════════════

type DevamDinleyici = () => void;

let bekleyenDevam = false;
let dinleyici: DevamDinleyici | null = null;

/** useVideoGenerator: uyarı gösterildi, kabul edilirse üretimi yeniden başlat */
export function devamBeklet(): void {
  bekleyenDevam = true;
}

/** StudioApp: handleGenerate'i yeniden başlatan fonksiyonu buraya bağlar */
export function devamiBagla(fn: DevamDinleyici): () => void {
  dinleyici = fn;
  return () => {
    if (dinleyici === fn) dinleyici = null;
  };
}

/** TelifDisclaimer kabul anında: bayrak varsa aboneyi çağır + temizle */
export function bekleyenDevamiYurut(): void {
  if (!bekleyenDevam) return;
  bekleyenDevam = false;
  const fn = dinleyici;
  if (fn) {
    // Uyarı onayı overlooked microtask — React event handler'ı zaten döndü
    window.setTimeout(() => { fn(); }, 30);
  }
}
