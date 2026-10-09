// ════════════════════════════════════════════════════════
// ISLAMICTOOLSBILDIRIM.TSX — islamicToolsVucut'tan taşındı (SRP parçalama, 09.10)
// Gece/Okuyucu modu + Öğüt Vakti (PWA push) + Namaz vakti bildirimi.
// Dışa açık adlar birebir korunur — import edenlerin bağlantısı KOPMAZ.
// ════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { Bell, BellRing } from "lucide-react";
import { pushAboneOl, pushAbonelikIptal, pushAbonelikDurumu, pushDestekliyor, iosUyarisi } from "../utils/pushClient";

// ★ OKUYUCU MODU / GECE MUŞAFI (madde 34) — kehribar renkli uyku dostu ekran tonu
//   Sayfanın kök div'ine amber filtre uygular; tekrar tıklayınca kapanır.
export const GECE_MOD_KEY = "nur_gece_mod";
export function GeceModuDugmesi() {
  const [acik, setAcik] = useState(() => { try { return localStorage.getItem(GECE_MOD_KEY) === "1"; } catch { return false; } });
  useEffect(() => {
    try { localStorage.setItem(GECE_MOD_KEY, acik ? "1" : "0"); } catch {}
    const eskiKatman = document.getElementById("nur-gece-mod-katmani");
    if (eskiKatman) eskiKatman.remove();
    if (!acik) return;
    const katman = document.createElement("div");
    katman.id = "nur-gece-mod-katmani";
    katman.style.cssText =
      "position:fixed;inset:0;z-index:2147483000;pointer-events:none;" +
      "backdrop-filter:sepia(.28) saturate(.9) hue-rotate(-12deg) brightness(.94);" +
      "-webkit-backdrop-filter:sepia(.28) saturate(.9) hue-rotate(-12deg) brightness(.94);" +
      "transition:opacity .4s ease;";
    document.documentElement.appendChild(katman);
    return () => { katman.remove(); };
  }, [acik]);
  return (
    <button type="button" onClick={() => setAcik(v => !v)}
      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition ${acik ? "bg-amber-500/15 ring-1 ring-amber-400/30" : "bg-white/5 hover:bg-white/10"}`}>
      <div className="flex items-center gap-2 text-left">
        <span className="text-base">🌙</span>
        <div>
          <p className="text-[10px] font-bold text-white/85">Okuyucu Modu</p>
          <p className="text-[8px] text-white/40">{acik ? "Açık — kehribar ton, göz yormaz" : "Uykudan önce okuma için sıcak ton"}</p>
        </div>
      </div>
      <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black transition ${acik ? "bg-amber-500/25 text-amber-200" : "bg-white/10 text-white/50"}`}>{acik ? "Açık" : "Kapalı"}</span>
    </button>
  );
}

// ★ ÖĞÜT VAKTİ — PWA push ile günde 4 sahih hadis bildirimi (sekme kapalıyken bile)
export function OgutVakti() {
  const [aktif, setAktif] = useState(() => pushAbonelikDurumu());
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const destek = pushDestekliyor();
  const iosUyari = iosUyarisi();

  const toggle = async () => {
    if (yukleniyor) return;
    setYukleniyor(true);
    setMesaj("");
    if (aktif) {
      await pushAbonelikIptal();
      setAktif(false);
      setMesaj("Bildirimler kapatıldı");
    } else {
      const sonuc = await pushAboneOl();
      if (sonuc.ok) {
        setAktif(true);
        setMesaj("Açık — günde 4 kısa hadis gelecek 🌙");
        try {
          new Notification("🌱 Hoş geldin — Öğüt Vakti açıldı", { body: "Günde 4 kısa sahih hadis hatırlatması alacaksın.", icon: "/logo.png", tag: "ogut-hosgeldin" });
        } catch { /* some platforms need SW showNotification */ }
      } else {
        setMesaj(sonuc.error || "Abonelik kurulamadı");
      }
    }
    setYukleniyor(false);
  };

  if (!destek) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <BellRing size={14} className={aktif ? "text-amber-300" : "text-white/35"} />
        <div>
          <p className="text-[10px] font-bold text-white">Öğüt Vakti 🌙</p>
          <p className="text-[8px] text-white/40">
            {iosUyari && !aktif ? "iPhone: önce \"Ana Ekrana Ekle\" gerekli" : aktif ? "Günde 4 sahih hadis · sekme kapalıyken de gelir" : "Günde 4 kısa sahih hadis bildirimi"}
          </p>
          {mesaj && <p className="text-[8px] text-amber-300/80">{mesaj}</p>}
        </div>
      </div>
      <button onClick={toggle} disabled={yukleniyor}
        className={`rounded-lg px-3 py-1.5 text-[9px] font-black transition disabled:opacity-50 ${aktif ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-500/40" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
        {yukleniyor ? "…" : aktif ? "✓ Açık" : "Aç"}
      </button>
    </div>
  );
}

// ★ Namaz vakti bildirimi — tarayıcı Notification API
export function NamazBildirim({ prayerTimings }: { prayerTimings: Record<string, string> | null }) {
  const [izin, setIzin] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [aktif, setAktif] = useState(() => {
    try { return localStorage.getItem("nur_namaz_bildirim") === "1"; } catch { return false; }
  });
  const timerRef = useRef<number | null>(null);
  const bildirilenRef = useRef<Set<string>>(new Set());

  const toggle = async () => {
    if (izin === "unsupported") return;
    if (!aktif && izin !== "granted") {
      const sonuc = await Notification.requestPermission();
      setIzin(sonuc);
      if (sonuc !== "granted") return;
    }
    const yeni = !aktif;
    setAktif(yeni);
    try { localStorage.setItem("nur_namaz_bildirim", yeni ? "1" : "0"); } catch {}
    if (yeni && typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("🕌 Namaz vakti hatırlatıcısı açıldı", { body: "Vakit girdiğinde nazik bir hatırlatma alacaksın.", icon: "/favicon.ico" });
    }
  };

  // Her dakika kontrol: vakit girdi mi?
  useEffect(() => {
    if (!aktif || !prayerTimings) return;
    const kontrol = () => {
      const simdi = new Date();
      const dakika = simdi.getHours() * 60 + simdi.getMinutes();
      const gun = simdi.toISOString().slice(0, 10);
      for (const [key, label] of [["Fajr", "İmsak"], ["Dhuhr", "Öğle"], ["Asr", "İkindi"], ["Maghrib", "Akşam"], ["Isha", "Yatsı"]] as const) {
        const t = prayerTimings[key];
        if (!t) continue;
        const [h, m] = t.split(":").map(Number);
        const vakitDk = h * 60 + m;
        const anahtar = `${gun}-${key}`;
        if (dakika === vakitDk && !bildirilenRef.current.has(anahtar)) {
          bildirilenRef.current.add(anahtar);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`🕌 ${label} vakti girdi`, { body: "Namaz vakti — huzur seni bekliyor.", icon: "/favicon.ico", tag: anahtar });
          }
        }
      }
    };
    kontrol();
    timerRef.current = window.setInterval(kontrol, 30_000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [aktif, prayerTimings]);

  if (izin === "unsupported") return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Bell size={14} className={aktif ? "text-amber-300" : "text-white/35"} />
        <div>
          <p className="text-[10px] font-bold text-white">Namaz Vakti Hatırlatıcısı</p>
          <p className="text-[8px] text-white/40">{izin === "granted" ? "Vakit girince tarayıcı bildirimi gelir" : "Bildirim izni gerekiyor"}</p>
        </div>
      </div>
      <button onClick={toggle}
        className={`rounded-lg px-3 py-1.5 text-[9px] font-black transition ${aktif ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-500/40" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
        {aktif ? "✓ Açık" : "Aç"}
      </button>
    </div>
  );
}
