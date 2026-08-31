import { useState, useEffect } from "react";

const CONSENT_KEY = "nur_cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-white/10 bg-[#0d1117]/95 p-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="max-w-2xl text-[11px] leading-relaxed text-white/60">
          🍪 Bu web sitesi deneyiminizi geliştirmek için çerezler kullanır.
          KVKK / GDPR kapsamında, sitemizi kullanarak çerez politikamızı kabul etmiş olursunuz.
          Daha fazla bilgi için{" "}
          <a href="/kvkk" className="text-[var(--accent)] underline">KVKK Politikamızı</a> inceleyebilirsiniz.
        </p>
        <div className="flex shrink-0 gap-2">
          <button onClick={decline} className="rounded-lg px-4 py-2 text-[10px] font-bold text-white/50 transition hover:text-white">
            Reddet
          </button>
          <button onClick={accept} className="rounded-lg px-5 py-2 text-[10px] font-black text-black transition" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}