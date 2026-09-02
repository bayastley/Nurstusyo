import { lazy, Suspense } from "react";

const StudioApp = lazy(() => import("./StudioApp"));

// God Mode yalnızca /admin girişinden, oturum belleğinde açılır.
// false = normal kullanıcılar kilitli modda başlar, admin giriş yapınca açılır
const isMasterSürüm = false;

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f1a]">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent)]" />
      <p className="text-sm text-white/50">NUR STUDYO yükleniyor...</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StudioApp isMasterSürüm={isMasterSürüm} />
    </Suspense>
  );
}
