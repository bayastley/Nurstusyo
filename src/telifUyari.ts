// ════════════════════════════════════════════════════════════════
// TELİF UYARISI KAYDI — uyarı ömür boyu BİR KERE gösterilir.
//   • Yalnızca "Video Üret" akışı tetikler (StudioApp handleGenerate)
//   • Site girişinde / sayfa açılışında ASLA çıkmaz
//   • localStorage kalıcı: sekme kapansa bile bir daha sorulmaz
// ════════════════════════════════════════════════════════════════

const TELIF_KEY = "nur_telif_onay_v1";

/** Uyarı daha önce gösterilmediyse true döner (gösterilmesi gerekir) */
export function telifUyarisiGerekli(): boolean {
  try {
    return localStorage.getItem(TELIF_KEY) !== "1";
  } catch {
    return false; // depolama kapalıysa uyarıyı zorlamayız — site çalışsın
  }
}

/** Kullanıcı "Anladım, Devam Et" dedi — bir daha gösterme */
export function telifUyarisiKabulEt(): void {
  try {
    localStorage.setItem(TELIF_KEY, "1");
  } catch { /* yoksay */ }
}
