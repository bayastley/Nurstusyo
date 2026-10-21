// ════════════════════════════════════════════════════════
// PWA KURULUM SİHİRBAZI — yol haritası madde 23
// "Ana Ekrana Ekle" öğretici banner'ı. Chrome'da beforeinstallprompt
// ile tek tık kurulum; iOS'ta adım adım talimat. Kurulunca veya
// kapatılırsa 30 gün boyunca bir daha çıkmaz.
//
// ★ GÜNCELLEME BİLDİRİMİ — YENİDEN YAZILDI (29.09, kullanıcı kararı:
//   "bu neden sürekli geliyor — güncelleme yapıldıktan sonra gelsin,
//   gerçekten de sürekli gelmesin")
//   ESKİ HATA: her installing worker "installed" durumuna geçtiği AN bandı
//   basıyordu — oysa sw.js install'da skipWaiting() çağırdığı için yeni SW
//   zaten kendiliğinden aktive oluyordu; "installed" anı geçici bir köprüydü
//   ve deploy başına gereksiz yere bant basılıyordu (sürekli gelme şikâyeti).
//   YENİ MANTIK (iki katman, ikisi de sürüm-farkındalıklı):
//   1) GERÇEKTEN bekleyen (waiting) worker varsa → "Yeni sürüm hazır" bandı.
//      X ile kapatılırsa O SÜRÜM için bir daha ASLA çıkmaz (localStorage'a
//      sürüm yazılır); yeni/different sürüm geldiğinde yalnız 1 kez gelir.
//   2) Yeni sürüm aktive olduktan SONRA (bir sonraki açılışta fark edilir)
//      → 6 saniyede kendiliğinden kaybolan nazik "✓ Güncellendi" biliği,
//      sürüm başına yalnız 1 kez. İlk ziyarette hiç gösterilmez.
// ════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import { Smartphone, X, Download, Share } from "lucide-react";
// ★ 06.10 i18n: banner metinleri seçili dilde — paylaş akışı dil turunda TR kalmıştı (pwa* anahtarları)
import { translate } from "../i18n";
const tt = (key: string): string => translate(localStorage.getItem("nur_lang"), key);

const KAPAT_KEY = "nur_pwa_banner_kapat";       // kurulum bannerı: kapatınca 30 gün
const KURULUM_KEY = "nur_pwa_kuruldu";          // kurduysa bir daha yok
const BILDIRIM_KEY = "nur_sw_bildirim_kapatilan"; // kapatılan beklemedeki SW sürümü — o sürüm bir daha nag etmez
const GORULEN_KEY = "nur_sw_son_surum";         // bildirilmiş aktif sürüm — değişirse 1 kez "✓ Güncellendi"

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PwaKurulumBanneri: React.FC = () => {
  const [gorunur, setGorunur] = useState(false);
  // ★ 18.10 (kullanıcı: "çerezler gibi köşede buton olsun"): X'e basınca banner
  //   YOK OLMAYIP küçülür — köşede yalnız yuvarlak bir 📲 kabarcık/kısayol kalır;
  //   tıklayınca tam banner geri açılır. Kurulum tamamlanmadan kaybolmaz.
  const [kucuk, setKucuk] = useState(false);
  const [bipEvent, setBipEvent] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [manuelTalimat, setManuelTalimat] = useState(false);
  // ★ 21.10 TIK-ANI BEKLEME (kullanıcı: "şimdi kura tıklayınca kursun"): erken tıklamada
  //   BIP henüz gelmemiş olabilir — 5 sn dinler, gelir gelmez kurulum penceresi
  //   kendiliğinden açılır; gelmezse manuel talimata düşer.
  const [kurBeklers, setKurBeklers] = useState(false);
  // Katman 1: gerçekten bekleyen (waiting) SW varsa "Yenile" bandı
  const [guncellemeVar, setGuncellemeVar] = useState(false);
  // Katman 2: yeni sürüm aktive olduktan sonra 1 kez gösterilen bilgi (6 sn'de kaybolur)
  const [guncellendi, setGuncellendi] = useState(false);
  const bekleyenSwRef = useRef<ServiceWorkerRegistration | null>(null);
  const bekleyenSurumRef = useRef<string>("");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let live = true;

    // Sürüm bildirimini işle: beklemedeki worker'ın sürümü kapatılmışsa sessiz geç
    const bekleyenSurumuIste = (reg: ServiceWorkerRegistration) => {
      if (!reg.waiting || !navigator.serviceWorker.controller) return;
      bekleyenSwRef.current = reg;
      try { reg.waiting.postMessage({ type: "GET_VERSION" }); } catch { /* yoksay */ }
    };

    const swMesaj = (e: MessageEvent) => {
      const data = e.data as { type?: string; v?: string } | null;
      if (!data || typeof data.v !== "string") return;
      const surum = data.v;
      if (data.type === "BEKLEYEN_SURUM") {
        // ★ 07.10 FIX (kullanıcı: "bu niye çıkıyor — kilit değişiminde gelecekti"):
        //   iki SAHTE pozitif kaynağı vardı:
        //   a) skipWaiting+claim geçişi: yeni worker sayfayı kendine çeker, eski
        //      worker'a giden GET_VERSION "0 kontrollü istemci" yanıtlar → sahte
        //      BEKLEYEN_SURUM (banner kilit değişimi olmadan da basılıyordu).
        //   b) installing→activating milisaniyelik penceresi: reg.waiting o an dolu
        //      görünür ama worker birkaç ms sonra zaten kendiliğinden aktifleşir.
        //   Çözüm: kayıtta GERÇEKTEN bekleyen worker VAR mı + 700 ms sonra hâlâ
        //   "installed" durumda mı — ikisi de doğruysa bandı bas. (Kilit/duyuru
        //   değişimleri bu banner'ı HİÇ ilgilendirmez — onlar config poll ile
        //   sessiz uygulanır; istenirse admin duyurusu ayrı mekanizma.)
        const reg = bekleyenSwRef.current;
        if (!reg || !reg.waiting) return; // (a) kayıtta beklemedeki yok → sahte
        window.setTimeout(() => {
          if (!live) return;
          const bekleyen = reg.waiting;
          if (!bekleyen || bekleyen.state !== "installed") return; // (b) geçiş anı → sahte
          try { if (localStorage.getItem(BILDIRIM_KEY) === surum) return; } catch { /* yut */ }
          bekleyenSurumRef.current = surum;
          if (live) setGuncellemeVar(true);
        }, 700);
      } else if (data.type === "AKTIF_SURUM") {
        // Katman 2: aktif sürüm son görülenden farklıysa 1 kez "✓ Güncellendi" (6 sn)
        let onceki: string | null = null;
        try { onceki = localStorage.getItem(GORULEN_KEY); } catch { /* yut */ }
        try { localStorage.setItem(GORULEN_KEY, surum); } catch { /* yut */ }
        if (!onceki || onceki === surum) return; // ilk ziyaret ya da aynı sürüm → sessiz
        if (live) {
          setGuncellendi(true);
          window.setTimeout(() => { if (live) setGuncellendi(false); }, 6000);
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", swMesaj);

    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg || !live) return;
        bekleyenSurumuIste(reg); // açılışta bekleyen var mı
        if (navigator.serviceWorker.controller) {
          try { navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" }); } catch { /* yoksay */ }
        }
        reg.addEventListener("updatefound", () => {
          const yeni = reg.installing;
          if (!yeni) return;
          yeni.addEventListener("statechange", () => {
            // ★ ESKİ HATALI KOŞUL KALDIRILDI: "installed && controller" geçici an
            //   bandı basıyordu. Artık yalnız GERÇEK waiting varsa sorulur.
            if (yeni.state === "installed" && live) bekleyenSurumuIste(reg);
          });
        });
      } catch { /* yoksay */ }
    })();
    return () => { live = false; navigator.serviceWorker.removeEventListener("message", swMesaj); };
  }, []);

  const guncelle = () => {
    try { if (bekleyenSurumRef.current) localStorage.setItem(BILDIRIM_KEY, bekleyenSurumRef.current); } catch { /* yut */ }
    bekleyenSwRef.current?.waiting?.postMessage({ type: "SKIP_WAITING" });
    setGuncellemeVar(false);
    window.setTimeout(() => window.location.reload(), 400);
  };

  // ★ X ile kapatma (29.09): bu sürüm için bildirim kalıcı susturulur
  const guncellemeBildiriminiKapat = () => {
    try { if (bekleyenSurumRef.current) localStorage.setItem(BILDIRIM_KEY, bekleyenSurumRef.current); } catch { /* yut */ }
    setGuncellemeVar(false);
  };

  // ★ 18.10 MENÜ KÖPRÜSÜ: kullanıcı "ana ekran ekleme olayını bulamıyorum" dedi — üç-nokta
  //   menüdeki "📲 Ana Ekrana Ekle" öğesi bu olayı basar, banner İSTİDİĞİ AN bir daha
  //   gösterilir (manuelTalimat sıfırlanır, kurulum anlatımı taze açılır). Kuruluysa
  //   sessiz geçilir — kurulu cihazda anlatım gereksiz.
  useEffect(() => {
    const ac = () => {
      try { if (localStorage.getItem(KURULUM_KEY) === "1") return; } catch { /* yut */ }
      setManuelTalimat(false);
      setKucuk(false);
      setGorunur(true);
    };
    window.addEventListener("nur_pwa_banner_ac", ac);
    return () => window.removeEventListener("nur_pwa_banner_ac", ac);
  }, []);

  useEffect(() => {
    // ★ 18.10 KALICI BANT (kullanıcı isteği): banner HER ZAMAN dursun — kurulum
    //   tamamlanmadıysa kapatılsa bile 2.5 sn sonra geri gelir; 30 gün susturma
    //   (KAPAT_KEY) akıştan çıkarıldı. KURULUM_KEY = 1 (kurulu/standalone)
    //   olunca yalnız kurulum WATCHER'ları dinlenir, banner çıkmaz.
    try {
      if (localStorage.getItem(KURULUM_KEY) === "1") return;
    } catch { /* yut */ }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    if (standalone) { try { localStorage.setItem(KURULUM_KEY, "1"); } catch {} return; }
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIos(isIos);
    const timer = window.setTimeout(() => setGorunur(true), 2500);
    const onBip = (e: Event) => { e.preventDefault(); setBipEvent(e as BIPEvent); setManuelTalimat(false); setGorunur(true); };
    const onInstalled = () => { try { localStorage.setItem(KURULUM_KEY, "1"); } catch {} setGorunur(false); setKucuk(false); };
    // ★ 21.10 GLOBAL DEVRALMA: main.tsx pwaBipCapture, banner mount'tan ÖNCE gelen
    //   BIP'i window.__nur_bip'e koyar (lazy StudioApp artık açılışta atılayabilir);
    //   burada tek kullanımlık olarak devralınır. Varlık yoksa banner kendi
    //   onBip dinleyicisiyle normal yol sürer — iki yol birbirini dışlamaz.
    const erken = (window as any).__nur_bip as BIPEvent | undefined;
    if (erken) { (window as any).__nur_bip = undefined; setBipEvent(erken); setGorunur(true); }
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.clearTimeout(timer); window.removeEventListener("beforeinstallprompt", onBip); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const kapat = () => {
    // ★ 18.10: X banner'ı tamamen gizlemez — KÜÇÜLTÜR: köşede yalnız yuvarlak
    //   📲 kısayol kabarcığı kalır (çerez bandı gibi). Tıklayınca tam banner geri
    //   gelir. Yalnız kurulum tamamlandıysa (KURULUM_KEY/standalone) tamamen yok olur.
    try { if (localStorage.getItem(KURULUM_KEY) === "1") return; } catch { /* yut */ }
    setGorunur(false);
    setKucuk(true);
  };

  /** ★ 21.10 TEK KULLANIMLI BIP KABI (kur() ile paylaşımlı): pencereyi aç, kararı işle,
   *  beklemeyi söndür. Chat tık-anı akışı: kullanıcı erken tıkladıysa bu yardımcı
   *  gelen BIP'i sadece o an devralıp kurulum penceresini kendi kendine açar. */
  const promptIle = async (e: BIPEvent) => {
    try {
      await e.prompt();
      const secim = await e.userChoice;
      if (secim.outcome === "accepted") {
        try { localStorage.setItem(KURULUM_KEY, "1"); } catch { /* yut */ }
        setGorunur(false); setKucuk(false);
      } else {
        // kullanıcı reddettse banner'ı kapat ama tekrar çıkabilir
        setGorunur(false); setKucuk(true);
      }
    } catch { /* pencere açılamadı (event tükenmiş) */ }
    setKurBeklers(false);
  };

  const kur = async () => {
    // ★ 21.10: mount-öncesi yakalanan olay (main.tsx global) devral — state'a
    //   daha önce gelmemiş olsa bile CLICK ANINDA kullanılabilir olması şart.
    const gelen = ((bipEvent || (window as any).__nur_bip) as BIPEvent | undefined);
    if (gelen) {
      try { (window as any).__nur_bip = undefined; } catch { /* yut */ }
      await promptIle(gelen);
      return;
    }
    // ★ BIP gelmedi — ÇOĞUNLUKLA erken tık: 5 sn dinle, gelir gelmez otomatik aç.
    //   (Chrome BIP'i açılıştan saniyeler içinde basar; bannerın kendi onBip'i
    //   de aynı event'i yakalayarak kurBeklers durumunu manuel'e indirir.)
    setKurBeklers(true);
    setManuelTalimat(false);
    const sunucuAc = (e: Event) => { e.preventDefault(); void promptIle(e as BIPEvent); };
    const temiz = () => { window.removeEventListener("beforeinstallprompt", sunucuAc); window.clearTimeout(nobet); };
    const nobet = window.setTimeout(() => { temiz(); setKurBeklers(false); setManuelTalimat(true); }, 5000);
    window.addEventListener("beforeinstallprompt", sunucuAc, { once: true });
  };

  if (!gorunur && !kucuk && !guncellemeVar && !guncellendi) return null;

  // ★ 18.10 KABARCIK: banner küçültülmüşse köşede yalnız bu yuvarlak kısayol kalır
  if (!gorunur && kucuk && !guncellemeVar && !guncellendi) {
    return (
      <div className="fixed bottom-4 right-4 z-[88]">
        <button
          type="button"
          onClick={() => { setKucuk(false); setGorunur(true); }}
          title={tt("pwaKurBaslik")}
          aria-label={tt("pwaKurBaslik")}
          className="modal-in flex h-11 w-11 items-center justify-center rounded-full shadow-2xl transition hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))", border: "1px solid rgba(215,170,82,.5)" }}
        >
          <Smartphone size={18} className="text-black" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[88] mx-2 max-w-[300px]">
      {/* ★ GÜNCELLENDİ biliği — yeni sürüm aktive olduktan sonra 1 kez, 6 sn'de kaybolur */}
      {guncellendi && (
        <div className="glass modal-in mb-2 flex items-center gap-2.5 rounded-2xl p-3 shadow-2xl" style={{ border: "1px solid rgba(52,211,153,.4)" }}>
          <span className="text-base" aria-hidden>✅</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-black text-white">{tt("pwaGuncellendi")}</p>
            <p className="text-[8.5px] text-white/50">{tt("pwaGuncellendiAlt")}</p>
          </div>
        </div>
      )}
      {/* Katman 1: gerçekten bekleyen SW varsa (nadir) — Yenile + kalıcı kapatma */}
      {guncellemeVar && (
        <div className="glass modal-in mb-2 flex items-center gap-2.5 rounded-2xl p-3 shadow-2xl" style={{ border: "1px solid rgba(52,211,153,.4)" }}>
          <span className="text-base" aria-hidden>🆕</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-black text-white">{tt("pwaYeniSurum")}</p>
            <p className="text-[8.5px] text-white/50">{tt("pwaYeniSurumAlt")}</p>
          </div>
          <button type="button" onClick={guncellemeBildiriminiKapat} className="shrink-0 rounded-full p-1 text-white/35 transition hover:text-white" aria-label={tt("pwaBildirimKapat")}><X size={11} /></button>
          <button type="button" onClick={guncelle} className="shrink-0 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[9.5px] font-black text-black transition hover:brightness-110">
            {tt("pwaYenile")}
          </button>
        </div>
      )}
      <div className="glass modal-in relative rounded-2xl p-3.5 shadow-2xl" style={{ border: "1px solid rgba(215,170,82,.35)" }}>
        <button type="button" onClick={kapat} className="absolute right-2 top-2 rounded-full bg-white/5 p-1 text-white/40 transition hover:text-white" aria-label="Kapat"><X size={12} /></button>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Smartphone size={14} className="text-black" /></span>
          <div>
            <p className="text-[11px] font-black text-white">{tt("pwaKurBaslik")}</p>
            <p className="text-[8.5px] text-white/45">{tt("pwaKurAlt")}</p>
          </div>
        </div>

        {ios ? (
          <div className="space-y-1 rounded-xl bg-white/[.04] px-3 py-2 text-[9px] leading-relaxed text-white/60">
            <p><b className="text-white/85">1.</b> {tt("pwaIos1a")} <Share size={9} className="inline" /> {tt("pwaIos1b")}</p>
            <p><b className="text-white/85">2.</b> {tt("pwaIos2")}</p>
            <p><b className="text-white/85">3.</b> {tt("pwaIos3")}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-white/[.04] px-3 py-2 text-[9px] leading-relaxed text-white/60">
            {tt("pwaTekTik")}
          </p>
        )}

        {!ios && (
          manuelTalimat ? (
            <div className="mt-2 space-y-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-[9px] leading-relaxed text-white/60">
              <p><b className="text-white/85">{tt("pwaElBaslik")}</b></p>
              <p>{tt("pwaElChrome")}</p>
              <p>{tt("pwaElSamsung")}</p>
              <p className="text-white/40">{tt("pwaElNot")}</p>
            </div>
          ) : (
            <div>
              <button type="button" onClick={kur} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[10px] font-black text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <Download size={12} /> {tt("pwaKurBtn")}
              </button>
              {/* ★ 21.10 TIK-ANI BEKLEME — erken tıklandığında BIP gelene kadarki pencere */}
              {kurBeklers && (
                <p className="mt-1.5 rounded-xl bg-emerald-400/10 px-3 py-1.5 text-center text-[9px] font-bold text-white/70">
                  ⏳ Kurulum penceresi hazırlanıyor — tarayıcı izin verir vermez kendiliğinden açılır…
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
