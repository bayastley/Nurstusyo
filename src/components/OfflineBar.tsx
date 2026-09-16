import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════
// OfflineBar — internet gidince ekranın üstünde ince sarı şerit.
// Kullanıcı "site çöktü" değil "internetim gitti" bilincine sahip olur.
// ═══════════════════════════════════════════════════════════

export default function OfflineBar() {
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine === false
  );

  useEffect(() => {
    const online = () => setOffline(false);
    const offlineOl = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineOl);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineOl);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 bg-amber-500/90 px-4 py-1.5 text-[11px] font-bold text-black shadow-lg"
    >
      📶 Bağlantı yok — işlemler bekletiliyor, bağlantı gelince devam eder
    </div>
  );
}
