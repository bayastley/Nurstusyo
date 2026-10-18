// ══════════════════════════════════════════════════════════════
// CHUNK KURTARMA (18.10) — "Nur Studyo geçici bir sorun yaşadı" çökmesinin
// ikinci ayağı. Kök senaryo: deploy sonrası kullanıcının tarayıcısında ESKİ
// index.html/chunk'lar durur; eski kod artık olmayan hash'li .js chunk'ı ister →
// Vercel HTML 404 fallback döner → "Failed to fetch dynamically imported module"
// → ErrorBoundary tüm uygulamayı "geçici bir sorun yaşadı" ekranına çöker.
//
// Çözüm katmanı (SW'de zaten network-first düzeltildi; bu da istemci ayağı):
//   1) Vite'ın "vite:preloadError" event'i: dynamic import/preload başarısız
//      olunca window'da tetiklenir.
//   2) catch'siz dynamic import çökmesi: window 'unhandledrejection' — mesaj
//      "Failed to fetch dynamically imported module" içerince yakalanır.
// İkisinde de: sonraki 30 saniyede İLK kurtarma → reload ederek taze index.html +
// yeni chunk'ları al. (Sonsuz döngü koruması: sessionStorage mühürü + 30 sn
// içinde ikinci hata gelirse reload etmez, ErrorBoundary normal çalışır.)
// ══════════════════════════════════════════════════════════════

const KURTARMA_MUHUR = "nur_chunk_kurtarma_at";

function chunkHatasiMi(mesaj: string): boolean {
  return (
    mesaj.includes("Failed to fetch dynamically imported module") ||
    mesaj.includes("error loading dynamically imported module") ||
    mesaj.includes("Importing a module script failed") ||
    mesaj.includes("Loading chunk") ||              // webpack tarzı
    mesaj.includes("dynamically imported module") || // genel varyant
    mesaj.includes("MIME type")                     // HTML fallback MIME hatası
  );
}

/** Tek kurtarma: 30 sn penceresinde en fazla 1 reload. */
function kurtar(): void {
  const simdi = Date.now();
  try {
    const onceki = Number(sessionStorage.getItem(KURTARMA_MUHUR) || 0);
    if (onceki && simdi - onceki < 30_000) return; // döngü koruması — ErrorBoundary'e bırak
    sessionStorage.setItem(KURTARMA_MUHUR, String(simdi));
  } catch { /* sessionStorage yoksa (private mod) yine reload deneriz */ }
  // URL'yi koru; reload taze index.html + yeni chunk'ları getirir.
  window.location.reload();
}

/** main.tsx'ten bir kez çağrılır — uygulama kurulumunun EN BAŞINDA. */
export function chunkKurtarmayiKur(): void {
  if (typeof window === "undefined") return;

  // 1) Vite resmî kanalı: preload zincirinde herhangi bir modül patlarsa
  window.addEventListener("vite:preloadError", (e) => {
    e.preventDefault(); // varsayılan throw'u yut — kendi kurtarımız çalışsın
    kurtar();
  });

  // 2) Genel emniyet ağı: catch'siz dynamic import reddi (Vite kanalı bazı
  //    tarayıcı/formatlarda tetiklenmeyebiliyor; hem lax chunk hem MIME hatası)
  window.addEventListener("unhandledrejection", (e) => {
    const mesaj = String((e as PromiseRejectionEvent).reason?.message || (e as PromiseRejectionEvent).reason || "");
    if (chunkHatasiMi(mesaj)) {
      e.preventDefault();
      kurtar();
    }
  });

  // 3) Statik script/preload hatası (ana chunk'ın kendisi yoksa — nadir)
  window.addEventListener("error", (e) => {
    const hedef = (e as ErrorEvent & { target?: { tagName?: string; src?: string } }).target;
    if (hedef && (hedef.tagName === "SCRIPT" || hedef.tagName === "LINK") && typeof hedef.src === "string" && hedef.src.endsWith(".js")) {
      kurtar();
    }
  }, true); // capture: kaynak hataları yakalar
}
