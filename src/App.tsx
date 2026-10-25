import { lazy, Suspense } from "react";
import OfflineBar from "./components/OfflineBar";
import ErrorBoundary from "./components/ErrorBoundary";

import { translate } from "./i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

const StudioApp = lazy(() => import("./StudioApp"));

// God Mode yalnızca /admin girişinden, oturum belleğinde açılır.
// false = normal kullanıcılar kilitli modda başlar, admin giriş yapınca açılır
const isMasterSürüm = false;

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1a]">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent)]" />
      <p className="text-sm text-white/50">TX("appYukle")</p>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary label="Nur Studyo">
      <OfflineBar />
      <Suspense fallback={<LoadingScreen />}>
        <StudioApp isMasterSürüm={isMasterSürüm} />
      </Suspense>
    </ErrorBoundary>
  );
}
