// ════════════════════════════════════════════════════════
// PWA KURULUM SİHİRBAZI — yol haritası madde 23
// "Ana Ekrana Ekle" öğretici banner'ı. Chrome'da beforeinstallprompt
// ile tek tık kurulum; iOS'ta adım adım talimat. Kurulunca veya
// kapatılırsa 30 gün boyunca bir daha çıkmaz.
// ════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import { Smartphone, X, Download, Share } from "lucide-react";

const KAPAT_KEY = "nur_pwa_banner_kapat"; // kapatınca 30 gün
const KURULUM_KEY = "nur_pwa_kuruldu";    // kurduysa bir daha yok

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PwaKurulumBanneri: React.FC = () => {
  const [gorunur, setGorunur] = useState(false);
  const [bipEvent, setBipEvent] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [manuelTalimat, setManuelTalimat] = useState(false);
  // ★ İş 23 güçlendirme: yeni SW (yani yeni sürüm) algılanınca nazik "Yenile" bandı
  const [guncellemeVar, setGuncellemeVar] = useState(false);
  const bekleyenSwRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let live = true;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        reg.addEventListener("updatefound", () => {
          const yeni = reg.installing;
          if (!yeni) return;
          yeni.addEventListener("statechange", () => {
            if (yeni.state === "installed" && navigator.serviceWorker.controller && live) {
              setGuncellemeVar(true);
              bekleyenSwRef.current = reg;
            }
          });
        });
      } catch { /* yoksay */ }
    })();
    return () => { live = false; };
  }, []);

  const guncelle = () => {
    bekleyenSwRef.current?.waiting?.postMessage({ type: "SKIP_WAITING" });
    setGuncellemeVar(false);
    window.setTimeout(() => window.location.reload(), 400);
  };

  useEffect(() => {
    try {
      if (localStorage.getItem(KURULUM_KEY) === "1") return;
      const kapanis = localStorage.getItem(KAPAT_KEY);
      if (kapanis && Date.now() - Number(kapanis) < 30 * 86_400_000) return;
    } catch { /* yut */ }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    if (standalone) { try { localStorage.setItem(KURULUM_KEY, "1"); } catch {} return; }
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIos(isIos);
    const timer = window.setTimeout(() => setGorunur(true), 2500); // açılıştan 2.5 sn sonra
    const onBip = (e: Event) => { e.preventDefault(); setBipEvent(e as BIPEvent); setGorunur(true); };
    // Kullanıcı kurduysa (her tarayıcıda) banner'ı kalıcı kapat
    const onInstalled = () => { try { localStorage.setItem(KURULUM_KEY, "1"); } catch {} setGorunur(false); };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.clearTimeout(timer); window.removeEventListener("beforeinstallprompt", onBip); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const kapat = () => {
    setGorunur(false);
    try { localStorage.setItem(KAPAT_KEY, String(Date.now())); } catch {}
  };

  const kur = async () => {
    if (bipEvent) {
      try {
        await bipEvent.prompt();
        const choice = await bipEvent.userChoice;
        if (choice.outcome === "accepted") {
          try { localStorage.setItem(KURULUM_KEY, "1"); } catch {}
          setGorunur(false);
          return;
        }
        // kullanıcı reddettse banner'ı kapat ama tekrar çıkabilir
        setGorunur(false);
        return;
      } catch { /* event tükenmiş olabilir → manuel talimata düş */ }
    }
    // beforeinstallprompt gelmediyse (Moz/Edge kısıtlı, zaten tükenmiş vb.) → menü talimatı
    setManuelTalimat(true);
  };

  if (!gorunur && !guncellemeVar) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[88] mx-2 max-w-[300px]">
      {/* ★ YENİ SÜRÜM bandı — SW güncellemesi beklemedeyken */}
      {guncellemeVar && (
        <div className="glass modal-in mb-2 flex items-center gap-2.5 rounded-2xl p-3 shadow-2xl" style={{ border: "1px solid rgba(52,211,153,.4)" }}>
          <span className="text-base" aria-hidden>🆕</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-black text-white">Yeni sürüm hazır</p>
            <p className="text-[8.5px] text-white/50">Tek tıkla güncelle — yenileme saniyeler sürer</p>
          </div>
          <button type="button" onClick={guncelle} className="shrink-0 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110">
            Yenile
          </button>
        </div>
      )}
      <div className="glass modal-in relative rounded-2xl p-3.5 shadow-2xl" style={{ border: "1px solid rgba(215,170,82,.35)" }}>
        <button type="button" onClick={kapat} className="absolute right-2 top-2 rounded-full bg-white/5 p-1 text-white/40 transition hover:text-white" aria-label="Kapat"><X size={12} /></button>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Smartphone size={14} className="text-black" /></span>
          <div>
            <p className="text-[11px] font-black text-white">Nûr Stüdyo'yu kur 📱</p>
            <p className="text-[8.5px] text-white/45">Ana ekrandan tek tıkla aç — uygulama gibi çalışır</p>
          </div>
        </div>

        {ios ? (
          <div className="space-y-1 rounded-xl bg-white/[.04] px-3 py-2 text-[9px] leading-relaxed text-white/60">
            <p><b className="text-white/85">1.</b> Safari'de alttaki <Share size={9} className="inline" /> paylaş simgesine dokun</p>
            <p><b className="text-white/85">2.</b> <b className="text-white/85">"Ana Ekrana Ekle"</b> seçeneğini seç</p>
            <p><b className="text-white/85">3.</b> Sağ üstten <b className="text-white/85">Ekle</b>'ye dokun — bitti!</p>
          </div>
        ) : (
          <p className="rounded-xl bg-white/[.04] px-3 py-2 text-[9px] leading-relaxed text-white/60">
            Tek tıkla kur, tarayıcı sekmesi olmadan doğrudan aç. Bildirimler ve çevrimdışı kullanım da aktifleşir.
          </p>
        )}

        {!ios && (
          manuelTalimat ? (
            <div className="mt-2 space-y-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-[9px] leading-relaxed text-white/60">
              <p><b className="text-white/85">Tarayıcın tek tık kurulumu şu an vermiyor.</b> Elle kurmak için:</p>
              <p><b className="text-white/85">Chrome:</b> sağ üst <b className="text-white/85">⋮</b> menü → <b className="text-white/85">"Uygulamayı yükle"</b> / "Ana ekrana ekle"</p>
              <p><b className="text-white/85">Samsung Internet:</b> ⋮ menü → <b className="text-white/85">"Sayfa ekle"</b> → Ana ekrana</p>
              <p className="text-white/40">Not: Kurulum HTTPS yayında çalışır — localhost denemesinde bu talimat normaldir.</p>
            </div>
          ) : (
            <button type="button" onClick={kur} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              <Download size={12} /> Şimdi Kur
            </button>
          )
        )}
      </div>
    </div>
  );
};
