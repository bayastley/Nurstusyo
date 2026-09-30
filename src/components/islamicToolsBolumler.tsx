// ════════════════════════════════════════════════════════
// ISLAMICTOOLSBOLUMLER.TSX — İslami Araçlar sekme bileşenleri
// IslamicToolsPanel.tsx'den ayrıldı (SRP adım 9, 30.09)
// Kıble Pusulası · Kaza Takibi · Dini Günler Takvimi
// ════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { Compass } from "lucide-react";
import { getQiblaForCity } from "./islamicToolsVeri";

const cities = [
  { name: "İstanbul", lat: 41.0082, lon: 28.9784, qibla: getQiblaForCity(41.0082, 28.9784) },
  { name: "Ankara", lat: 39.9334, lon: 32.8597, qibla: getQiblaForCity(39.9334, 32.8597) },
  { name: "İzmir", lat: 38.4238, lon: 27.1428, qibla: getQiblaForCity(38.4238, 27.1428) },
  { name: "Konya", lat: 37.8653, lon: 32.4895, qibla: getQiblaForCity(37.8653, 32.4895) },
  { name: "Adana", lat: 37.0000, lon: 35.3213, qibla: getQiblaForCity(37.0000, 35.3213) },
  { name: "Mecca", lat: 21.4225, lon: 39.8262, qibla: 0 },
  { name: "Medina", lat: 24.4672, lon: 39.6112, qibla: getQiblaForCity(24.4672, 39.6112) },
];

// ─── KIBLE PUSULASI ──────────────────────────────────────
export function QiblaCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState(cities[0].name);
  const handlerRef = React.useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator && "DeviceOrientationEvent" in window) {
      const handler = (e: DeviceOrientationEvent) => {
        if ((e as any).webkitCompassHeading !== undefined) {
          setHeading((e as any).webkitCompassHeading);
        } else if (e.alpha !== null) {
          setHeading(360 - e.alpha);
        }
      };
      handlerRef.current = handler;

      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        (DeviceOrientationEvent as any).requestPermission().then((state: string) => {
          if (state === "granted") {
            window.addEventListener("deviceorientation", handler);
          }
        }).catch(() => setError("Pusula izni verilmedi"));
      } else {
        window.addEventListener("deviceorientation", handler);
      }
    } else {
      setError("Cihazınız pusula desteklemiyor");
    }
    return () => {
      if (handlerRef.current) {
        window.removeEventListener("deviceorientation", handlerRef.current);
      }
    };
  }, []);

  const current = cities.find(c => c.name === city) ?? cities[0];
  const angle = current.qibla - (heading || 0);

  return (
    <div className="text-center space-y-3">
      {error ? (
        <p className="text-[10px] text-red-400/80">{error}</p>
      ) : (
        <>
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full border-2 border-white/20" />
            {/* Kâbe yönü oku */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1"
              style={{ transform: `translateX(-50%) rotate(${angle}deg)`, transformOrigin: "center 64px" }}
            >
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[14px] border-l-transparent border-r-transparent border-b-amber-400" />
            </div>
            {/* Pusula göstergesi */}
            <div className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center">
              <div className="text-center">
                <Compass size={24} className="text-amber-400 mx-auto mb-1" />
                <p className="text-[9px] text-white/50">KÂBE</p>
                <p className="text-[11px] font-black text-amber-300">{Math.round(current.qibla)}°</p>
              </div>
            </div>
            {/* N */}
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 text-[9px] font-bold text-white/60">K</div>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 text-[9px] font-bold text-white/60">G</div>
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 text-[9px] font-bold text-white/60">B</div>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 text-[9px] font-bold text-white/60">D</div>
          </div>
          <p className="text-[9px] text-white/40">Cihazınızı düz tutun · Kıble yönü altın ok ile gösterilir</p>
          <select value={city} onChange={e => setCity(e.target.value)} className="mt-2 text-left text-[9px] text-white/60 bg-white/5 rounded-lg px-2 py-1">
            {cities.map((c, i) => <option key={i} value={c.name}>{c.name} — {Math.round(c.qibla)}°</option>)}
          </select>
          {current && <p className="text-[9px] text-amber-300/60">{current.name} kıblası: {Math.round(current.qibla)}°</p>}
        </>
      )}
    </div>
  );
}

// ─── KAZA NAMAZI TAKİP ──────────────────────────────────
export function KazaTracker() {
  const KEY = "nur_kaza_tracker";
  const [data, setData] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  });

  const save = (d: Record<string, number>) => { setData(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  return (
    <div className="space-y-2">
      <p className="text-[9px] text-white/40">Kıldığınız her kaza namazını işaretleyin · Allah kabul etsin</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {months.map((m, i) => (
          <div key={i} className="rounded-lg bg-white/5 p-2 text-center">
            <p className="text-[8px] text-white/50 mb-1">{m}</p>
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => { const d = { ...data }; d[m] = Math.max(0, (d[m] || 0) - 1); save(d); }} className="text-white/30 hover:text-white/60 text-[10px]">−</button>
              <span className="text-[11px] font-bold text-white min-w-[16px] text-center">{data[m] || 0}</span>
              <button onClick={() => { const d = { ...data }; d[m] = (d[m] || 0) + 1; save(d); }} className="text-white/30 hover:text-white/60 text-[10px]">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center pt-1">
        <p className="text-[10px] text-white/50">Toplam kaza: <span className="font-black text-amber-300">{Object.values(data).reduce((a, b) => a + b, 0)}</span> rekât</p>
      </div>
    </div>
  );
}

// ─── DİNİ GÜNLER TAKVİMİ ────────────────────────────────
export function IslamicCalendar() {
  // ★ Diyanet 2026-2027 takvimi — tarihler geçtikçe liste otomatik güncellenir
  const events = [
    { name: "Ramazan Bayramı", date: "2027-03-10", emoji: "🎉" },
    { name: "Arefe", date: "2027-05-16", emoji: "🕋" },
    { name: "Kurban Bayramı", date: "2027-05-17", emoji: "🎊" },
    { name: "Hicri Yılbaşı", date: "2027-06-26", emoji: "📅" },
    { name: "Aşure Günü", date: "2027-07-05", emoji: "🍯" },
    { name: "Mevlid Kandili", date: "2027-08-15", emoji: "🕌" },
  ];

  const today = new Date();
  const upcoming = events
    .map((e) => ({ ...e, d: new Date(e.date) }))
    .filter((e) => e.d >= today)
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .slice(0, 6);

  return (
    <div className="space-y-2">
      <p className="text-[9px] text-white/40">Yaklaşan dini günler ve geceler</p>
      {upcoming.map((e, i) => {
        const diff = Math.ceil((e.d.getTime() - today.getTime()) / 86400000);
        return (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <span className="text-lg">{e.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white truncate">{e.name}</p>
              <p className="text-[8px] text-white/40">{e.d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <span className="text-[9px] font-bold text-amber-300 whitespace-nowrap">{diff} gün</span>
          </div>
        );
      })}
      {upcoming.length === 0 && <p className="text-[10px] text-white/30 text-center py-2">Yaklaşan dini gün yok — takvim güncellenecek</p>}
    </div>
  );
}

