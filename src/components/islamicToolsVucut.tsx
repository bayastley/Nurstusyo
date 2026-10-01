// ════════════════════════════════════════════════════════
// ISLAMICTOOLSVUCUT.TSX — IslamicToolsPanel'den ayrıldı (SRP, 01.10)
// Araç bileşenleri: zikirmatik+topluluk, dua/salah/hatim takipleri,
// gece modu/öğüt/namaz bildirimi/çevrimdışı, rozetler+üretim istatistiği.
// IslamicToolsPanel.tsx bu bileşenleri import edip sekme düzeninde render eder.
// ════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Compass, RotateCcw, ChevronDown, ChevronUp, Clock3, MapPin, Bell, CheckCircle2, Circle, Moon, BellRing } from "lucide-react";
import { pushAboneOl, pushAbonelikIptal, pushAbonelikDurumu, pushDestekliyor, iosUyarisi } from "../utils/pushClient";
import { zikirPencereDizisi, sonGunler, type ZikirGunKova } from "./zikirGrafik";
import { SURE_LISTESI, CUZ_SURELER, DAILY_DUAS, ZIKIRLER, CITY_OPTIONS, parsePrayerTimes, minutesFromTime } from "./islamicToolsVeri";

// ═══════════ ISLAMICTOOLSBOLUMLERI.TSX BLOK: zikir (kaynak 23-286) ═══════════
// ★ Zikirmatik — kalıcı sayaç (localStorage) + topluluk toplamı (Supabase)
export const ZIKIR_KEY = "nur_zikirmatik_v1";
export const ZIKIR_TOPLULUK_KEY = "nur_zikir_topluluk";
export const ZIKIR_STREAK_KEY = "nur_zikir_streak_v1"; // ★ günlük serbestreak (yol haritası madde 5)

export function loadZikirCount(): number {
  try { return Number(localStorage.getItem(ZIKIR_KEY)) || 0; } catch { return 0; }
}

export const ZIKIR_METINLERI = ["🔴 Estagfirullah", "🌿 Sübhanallah", "❤️ Elhamdülillah", "🌟 Allahuekber", "🌹 Salavat (Sallallâhu Aleyhi ve Sellem)"];

/** ★ TOPLULUK VİTRİN SAYACI — YALNIZCA GERÇEK SAYI (28.09 dürüstlük düzeltmesi).
 *  /api/zikir/topluluk'tan canlı toplam çekip gösterir; 45 sn'de tazelenir.
 *  Toplam 0 ise uydurma sayı yerine davet metni gösterilir. Sahte taban YASAK.
 *
 *  ★ GÜNLÜK/HAFTALIK GRAFİK (29.09): API'nin nur_zikir_gunluk kovalarından gelen
 *    GERÇEK günlük seri çubuk grafiği olarak çizilir. Dürüstlük kuralları:
 *    • Seri, tablonun İLK kayıtlı gününden başlar — kuruluş öncesi günler
 *      uydurulmaz ("sahte 0" yok); veri biriktikçe grafik uzar.
 *    • gunluk:null (tablo yok / API eski) → grafik tamamen gizlenir.
 *    • Zikirmatik her zikirde "nur-zikir-eklendi" event'i atar → anında tazeleme. */
export function ToplulukVitrinSayaci() {
  const [toplam, setToplam] = useState<number | null>(null);
  const [aktif, setAktif] = useState(false);
  const [gunluk, setGunluk] = useState<ZikirGunKova[] | null>(null);
  // Görünüm: "hafta" = son 7 gün, "tum" = ilk kayıttan bugüne (en çok 60 gün)
  const [pencere, setPencere] = useState<"hafta" | "tum">("hafta");
  const yukleRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    let live = true;
    const yukle = () => fetch("/api/zikir/topluluk")
      .then((r) => r.json())
      .then((d: any) => {
        if (!live || !d?.ok) return;
        setToplam(Number(d.toplam) || 0);
        setAktif(!!d.aktif);
        setGunluk(Array.isArray(d.gunluk) ? d.gunluk : null);
      })
      .catch(() => undefined);
    yukleRef.current = yukle;
    yukle();
    const iv = window.setInterval(yukle, 45_000);
    // Zikirmatik zikir çektinde grafiği hemen tazele (gerçek sunucu teyidiyle)
    const zikirEklendi = () => yukle();
    window.addEventListener("nur-zikir-eklendi", zikirEklendi);
    return () => { live = false; window.clearInterval(iv); window.removeEventListener("nur-zikir-eklendi", zikirEklendi); };
  }, []);
  // Grafik penceresi — saf yardımcılar (zikirGrafik.ts) hesaplar
  const bugun = new Date().toISOString().slice(0, 10);
  const tumDizi = useMemo(() => zikirPencereDizisi(gunluk, bugun), [gunluk]);
  const gosterilen = pencere === "hafta" ? sonGunler(tumDizi, 7) : tumDizi;
  const maxAdet = useMemo(() => Math.max(1, ...gosterilen.map((k) => k.adet)), [gosterilen]);
  const pencereToplam = useMemo(() => gosterilen.reduce((s, k) => s + k.adet, 0), [gosterilen]);
  const grafikGoster = aktif && gosterilen.length >= 1; // ilk gerçek gün tek çubukla görünür
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[.07] py-2.5">
        <span className="text-base">🌍</span>
        <p className="text-[10px] font-bold text-white/70">
          {aktif && toplam !== null && toplam > 0
            ? <>Topluluk toplamı: <b className="text-amber-200">{toplam.toLocaleString("tr-TR")}</b> zikir çekildi</>
            : <>Topluluk sayacı canlı — <b className="text-amber-200">ilk zikiri sen çek</b> 📿</>}
        </p>
      </div>
      {grafikGoster && (
        <div className="rounded-xl border border-white/10 bg-white/[.03] px-2.5 pb-2 pt-1.5">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[8px] font-bold uppercase tracking-wider text-white/40">
              Günlük topluluk zikirleri
            </p>
            <div className="flex gap-1">
              {(["hafta", "tum"] as const).map((p) => (
                <button key={p} onClick={() => setPencere(p)}
                  className={`rounded px-1.5 py-0.5 text-[7.5px] font-black transition ${pencere === p ? "bg-amber-500/25 text-amber-200" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
                  {p === "hafta" ? "7 GÜN" : `TÜMÜ (${tumDizi.length})`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-14 items-end gap-1">
            {gosterilen.map((k) => {
              const yukseklik = k.adet > 0 ? Math.max(6, Math.round((k.adet / maxAdet) * 100)) : 0;
              const gunTarih = new Date(k.gun + "T00:00:00Z");
              const gunAdi = gunTarih.toLocaleDateString("tr-TR", { weekday: "short", timeZone: "UTC" });
              const gunNo = k.gun.slice(8, 10);
              const bugunMu = k.gun === bugun;
              return (
                <div key={k.gun} className="flex min-w-0 flex-1 flex-col items-center gap-0.5"
                  title={`${gunNo} ${gunTarih.toLocaleDateString("tr-TR", { month: "long", timeZone: "UTC" })} · ${k.adet.toLocaleString("tr-TR")} zikir`}>
                  <div className="flex h-11 w-full items-end">
                    <div
                      className={`w-full rounded-t-sm transition-all ${bugunMu ? "bg-gradient-to-t from-amber-600/70 to-amber-300" : "bg-gradient-to-t from-amber-500/40 to-amber-300/70"}`}
                      style={{ height: yukseklik > 0 ? `${yukseklik}%` : "2px", opacity: k.adet > 0 ? 1 : 0.25 }}
                    />
                  </div>
                  <span className={`text-[6.5px] font-bold leading-none ${bugunMu ? "text-amber-200" : "text-white/35"}`}>{gunNo}</span>
                  <span className="text-[5.5px] leading-none text-white/25">{gunAdi}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-0.5 text-center text-[7.5px] text-white/35">
            {pencere === "hafta" ? (gosterilen.length < 7 ? `İlk ${gosterilen.length} gün` : "Bu hafta") : `Son ${gosterilen.length} gün`}: <b className="text-amber-200/90">{pencereToplam.toLocaleString("tr-TR")}</b> zikir
          </p>
        </div>
      )}
    </div>
  );
}

export function Zikirmatik() {
  const [count, setCount] = useState(() => loadZikirCount());
  const [zikir, setZikir] = useState(0);
  const [topluluk, setTopluluk] = useState<number | null>(null);
  const [seciliZikir, setSeciliZikir] = useState(0);
  const [pulsing, setPulsing] = useState(false);
  // ★ Günlük serbestreak: üst üste kaç gündür en az 1 zikir çekilmiş
  const [streak, setStreak] = useState<{ last: string; sayi: number }>(() => {
    try { return JSON.parse(localStorage.getItem(ZIKIR_STREAK_KEY) || "{}") ?? { last: "", sayi: 0 }; } catch { return { last: "", sayi: 0 }; }
  });
  // ★ 33'lük halka kutlama mesajı
  const [halkaMesaj, setHalkaMesaj] = useState("");

  // ★ TOPLULUK TOPLAMI — gerçek sunucu sayacı (/api/zikir/topluluk).
  //   Açılışta çekilir; her 45 sn'de tazelenir; çektiğin her zikir sunucuya eklenir.
  //   API kapalıysa (aktif:false) sessizce yerel sayaç gösterilir — site ASLA bozulmaz.
  const [sunucuToplam, setSunucuToplam] = useState<number | null>(null);
  const [sunucuAktif, setSunucuAktif] = useState(false);
  const sunucuToplamRef = React.useRef(0);
  useEffect(() => {
    let live = true;
    const yukle = () => fetch("/api/zikir/topluluk")
      .then((r) => r.json())
      .then((d: any) => {
        if (!live || !d?.ok) return;
        setSunucuToplam(Number(d.toplam) || 0);
        setSunucuAktif(!!d.aktif);
        sunucuToplamRef.current = Number(d.toplam) || 0;
      })
      .catch(() => undefined);
    yukle();
    const iv = window.setInterval(yukle, 45_000);
    return () => { live = false; window.clearInterval(iv); };
  }, []);

  const zikirCek = () => {
    const yeni = count + 1;
    setCount(yeni);
    setPulsing(true);
    setTimeout(() => setPulsing(false), 160);
    try { localStorage.setItem(ZIKIR_KEY, String(yeni)); } catch {}
    // ★ Günlük serbestreak — bugün ilk zikir ise dünle birleşir ya da 1'den başlar
    try {
      const bugunStr = new Date().toISOString().slice(0, 10);
      if (streak.last !== bugunStr) {
        const dunStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const yeniStreak = { last: bugunStr, sayi: streak.last === dunStr ? streak.sayi + 1 : 1 };
        setStreak(yeniStreak);
        localStorage.setItem(ZIKIR_STREAK_KEY, JSON.stringify(yeniStreak));
      }
    } catch {}
    // ★ 33'LÜK HALKA kutlaması — her 33 zikirde halka dolar
    if (yeni % 33 === 0) {
      setHalkaMesaj(`🎉 ${yeni / 33}. halka tamamlandı!`);
      window.setTimeout(() => setHalkaMesaj(""), 2600);
      if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    }
    // ★ Topluluk toplamına katkı — yerel anlık gösterim + sunucuya gönder
    try {
      const toplam = (Number(localStorage.getItem(ZIKIR_TOPLULUK_KEY)) || 0) + 1;
      localStorage.setItem(ZIKIR_TOPLULUK_KEY, String(toplam));
      setTopluluk(toplam);
    } catch {}
    if (sunucuAktif) {
      const bekleyen = sunucuToplamRef.current + 1;
      sunucuToplamRef.current = bekleyen;
      setSunucuToplam(bekleyen); // anında hissiyat — sunucu teyidi sonra gelir
      fetch("/api/zikir/topluluk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adet: 1 }),
      })
        .then((r) => r.json())
        .then((d: any) => {
          if (d?.ok && d.aktif) {
            sunucuToplamRef.current = Number(d.toplam) || bekleyen;
            setSunucuToplam(sunucuToplamRef.current);
            // ★ Vitrin grafiğini anında tazele — günlük kova sunucu teyidiyle güncellenir
            window.dispatchEvent(new Event("nur-zikir-eklendi"));
          }
        })
        .catch(() => undefined);
    }
    if (navigator.vibrate) navigator.vibrate(12);
  };

  const sifirla = () => {
    setCount(0);
    try { localStorage.setItem(ZIKIR_KEY, "0"); } catch {}
  };

  const hedefler = [33, 99, 100, 500, 1000];
  const sonrakiHedef = hedefler.find((h) => h > count) ?? 1000;
  const ilerleme = Math.min(100, (count / sonrakiHedef) * 100);

  return (
    <div className="space-y-3">
      {/* Zikir seçimi */}
      <div className="flex flex-wrap gap-1.5">
        {ZIKIR_METINLERI.map((m, i) => (
          <button key={i} onClick={() => setSeciliZikir(i)}
            className={`rounded-lg px-2 py-1 text-[9px] font-bold transition ${seciliZikir === i ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-500/40" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Sayaç ekranı — ★ 33'lük halka animasyonu eklendi (mevcut ilerleme çubuğu aynen korundu) */}
      <button onClick={zikirCek}
        className={`relative w-full rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/15 to-transparent py-8 text-center transition active:scale-[0.98] ${pulsing ? "scale-[0.98]" : ""}`}>
        {/* ★ 33'LÜK HALKA — her 33 zikirde dolar, halka sayısı birikir */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="5" />
            <circle cx="48" cy="48" r="42" fill="none" stroke="url(#zikirRingGrad)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - (count % 33) / 33)}
              className="transition-all duration-300" />
            <defs>
              <linearGradient id="zikirRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fcd34d" />
              </linearGradient>
            </defs>
          </svg>
          <p className="text-3xl font-black tabular-nums text-amber-200" style={{ textShadow: "0 0 20px rgba(245,158,11,.3)" }}>{count}</p>
        </div>
        <p className="mt-1.5 text-[8.5px] font-bold text-amber-300/80">
          {Math.floor(count / 33)} halka tamam · {count % 33 === 0 && count > 0 ? "halka doldu 🎉" : `halkaya ${33 - (count % 33)} kaldı`}
          {streak.sayi > 0 && <span className="ml-2 rounded bg-orange-500/20 px-1.5 py-0.5 text-orange-300">🔥 {streak.sayi} gün seri</span>}
        </p>
        {halkaMesaj && <p className="mt-1 text-[9px] font-black text-amber-300 animate-pulse">{halkaMesaj}</p>}
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{ZIKIR_METINLERI[seciliZikir].replace(/^[^ ]+ /, "")} · dokun ve çek</p>
        {/* Hedef ilerlemesi */}
        <div className="mx-auto mt-3 h-1.5 w-3/4 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${ilerleme}%` }} />
        </div>
        <p className="mt-1 text-[8px] text-white/35">Sonraki hedef: {sonrakiHedef} · {Math.max(0, sonrakiHedef - count)} kaldı</p>
      </button>

      <div className="flex items-center justify-between gap-2">
        <button onClick={sifirla} className="rounded-lg bg-white/5 px-3 py-1.5 text-[9px] font-bold text-white/50 hover:bg-white/10 hover:text-white/70 transition">
          ↺ Sıfırla (bu oturum)
        </button>
        {sunucuToplam !== null && sunucuToplam > 0 ? (
          <p className="text-[9px] text-white/50">🌍 Toplulukla birlikte: <b className="text-amber-300">{sunucuToplam.toLocaleString("tr-TR")}</b> zikir</p>
        ) : topluluk !== null && topluluk > 0 ? (
          <p className="text-[9px] text-white/50">🌟 Bu cihazdan toplam: <b className="text-amber-300">{topluluk.toLocaleString("tr-TR")}</b></p>
        ) : null}
      </div>
      <p className="text-center text-[8px] text-white/25">Sayacın cihazında kalıcı saklanır{sunucuAktif ? " · topluluk sayacı canlı ☝" : ""}</p>
    </div>
  );
}


// ═══════════ ISLAMICTOOLSBOLUMLERI.TSX BLOK: takip (kaynak 287-523) ═══════════
export function DuaTakip() {
  const KEY = "nur_dua_takip_v1";
  const [okunan, setOkunan] = useState<Record<string, number[]>>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  });
  const bugun = new Date().toISOString().slice(0, 10);
  const bugunku = okunan[bugun] || [];

  const toggle = (idx: number) => {
    const mevcut = okunan[bugun] || [];
    const yeni = mevcut.includes(idx) ? mevcut.filter((x) => x !== idx) : [...mevcut, idx];
    const yeniKayit = { ...okunan, [bugun]: yeni };
    setOkunan(yeniKayit);
    try { localStorage.setItem(KEY, JSON.stringify(yeniKayit)); } catch {}
  };

  // Sabah/akşam ezkârı indeksleri (DAILY_DUAS dizisindeki sıraları)
  const EZKAR_IDX = [0, 1]; // 0: Sabah Ezkârı, 1: Akşam Ezkârı
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[.06] p-3">
      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">🗣️ Ezkâr Takibi — bugün</p>
      <div className="flex gap-1.5">
        {EZKAR_IDX.map((idx) => {
          const isaretli = bugunku.includes(idx);
          return (
            <button key={idx} type="button" onClick={() => toggle(idx)}
              className={`flex-1 rounded-lg px-2 py-2 text-[9.5px] font-bold transition active:scale-95 ${isaretli ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-white/5 text-white/45 hover:bg-white/10"}`}>
              {isaretli ? "✓ " : "○ "}{idx === 0 ? "Sabah Ezkârı" : "Akşam Ezkârı"}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[8px] text-white/35">Okuduktan sonra işaretle — kayıtlar cihazında kalır, seri alışkanlık kazan.</p>
    </div>
  );
}

// ★ SALAH TRACKER (madde 45) — 5 vakiti işaretle, seri (streak) sayacı
export const SALAH_KEY = "nur_salah_tracker_v1";
export const SALAH_5 = ["İmsak", "Öğle", "İkindi", "Akşam", "Yatsı"];
export function SalahTracker() {
  const [kayit, setKayit] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem(SALAH_KEY) || "{}"); } catch { return {}; }
  });
  const bugun = new Date().toISOString().slice(0, 10);
  const bugunVakitler = kayit[bugun] || [];

  const toggle = (vakit: string) => {
    const mevcut = kayit[bugun] || [];
    const yeni = mevcut.includes(vakit) ? mevcut.filter((v) => v !== vakit) : [...mevcut, vakit];
    const yeniKayit = { ...kayit, [bugun]: yeni };
    setKayit(yeniKayit);
    try { localStorage.setItem(SALAH_KEY, JSON.stringify(yeniKayit)); } catch {}
  };

  // Seri (streak): dünden geriye doğru tam günleri say (5 vakit birden)
  const streak = (() => {
    let s = 0;
    const d = new Date();
    for (;;) {
      const key = d.toISOString().slice(0, 10);
      const liste = kayit[key];
      if (liste && liste.length === 5) s++;
      else if (key !== bugun) break; // bugün henüz eksik olabilir, devam et
      else if (s === 0 && liste && liste.length < 5) { /* bugün yarım — streak dünden devam edebilir */ }
      d.setDate(d.getDate() - 1);
      if (key < "2020-01-01") break;
    }
    return s;
  })();

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[.07] p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/80">✅ Bugünün Vakitleri</p>
          {streak > 0 && <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-black text-orange-300">🔥 {streak} gün seri</span>}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SALAH_5.map((v) => {
            const isaretli = bugunVakitler.includes(v);
            return (
              <button key={v} type="button" onClick={() => toggle(v)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[9px] font-bold transition active:scale-95 ${isaretli ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-white/5 text-white/45 hover:bg-white/10"}`}>
                <span className="text-sm">{isaretli ? "✅" : "⭕"}</span>
                {v}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[8.5px] text-white/40">Bugün {bugunVakitler.length}/5 vakit işaretli · kayıtlar cihazında kalır</p>
      </div>
    </div>
  );
}

// ★ TOPLU HATİM (madde 60) — cüz al, toplam sayaca katkı (cihaz simülasyonu + R2-ready)
export const TOPLU_HATIM_KEY = "nur_toplu_hatim_v1";
export function TopluHatim() {
  const [durum, setDurum] = useState<{ cüzler: number[]; toplamKatki: number }>(() => {
    try { return JSON.parse(localStorage.getItem(TOPLU_HATIM_KEY) || "") ?? { cüzler: [], toplamKatki: 0 }; } catch { return { cüzler: [], toplamKatki: 0 }; }
  });
  const benim = durum.cüzler.length;
  const kalanCüz = 30 - benim;

  const cüzAl = () => {
    if (kalanCüz === 0) return;
    // En küçük boş cüzü al — eşit dağılım simülasyonu
    const bos = Array.from({ length: 30 }, (_, i) => i + 1).find((c) => !durum.cüzler.includes(c)) ?? 0;
    const yeni = { cüzler: [...durum.cüzler, bos], toplamKatki: durum.toplamKatki + 1 };
    setDurum(yeni);
    try { localStorage.setItem(TOPLU_HATIM_KEY, JSON.stringify(yeni)); } catch {}
  };

  const yuzde = Math.round((benim / 30) * 100);
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[.07] p-3.5">
      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-amber-300/80">🤲 Bu Ay Toplu Hatim</p>
      <p className="text-[10px] leading-relaxed text-white/65">Bu ayın toplu hatim kampanyasına katıl — bir cüz al, toplam hatim hedefine sen de katkı ver.</p>
      <div className="mt-2.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-white/80">Senin cüzlerin: <b className="text-amber-200">{benim}/30</b></p>
          <p className="text-[8.5px] text-white/40">Toplam katkı: {durum.toplamKatki} cüz · %{yuzde} tamam</p>
        </div>
        {kalanCüz > 0 && (
          <button type="button" onClick={cüzAl}
            className="rounded-lg px-3 py-2 text-[10px] font-black text-black transition hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            Cüz Al
          </button>
        )}
      </div>
      {benim > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {durum.cüzler.map((c) => (
            <span key={c} className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-200">{c}. cüz ✓</span>
          ))}
        </div>
      )}
      {benim === 30 && <p className="mt-2 text-center text-[9.5px] font-black text-emerald-300">🎉 Sen de bu ayın hatim halkasındasın — Allah kabul etsin!</p>}
    </div>
  );
}

// ★ Hatim takibi — 114 sureyi işaretle, yüzde ilerleme gör + cüz-cüz görsel dolum
export function HatimTakibi() {
  const STORAGE = "nur_hatim_v1";
  const [okunan, setOkunan] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE) || "[]") as number[]); } catch { return new Set(); }
  });
  const [arama, setArama] = useState("");

  const kaydet = (yeni: Set<number>) => {
    setOkunan(yeni);
    try { localStorage.setItem(STORAGE, JSON.stringify([...yeni])); } catch {}
  };

  const toggle = (n: number) => {
    const yeni = new Set(okunan);
    if (yeni.has(n)) yeni.delete(n); else yeni.add(n);
    kaydet(yeni);
    if (yeni.size === 114 && !okunan.has(n)) {
      // Hatim tamamlandı
      setTimeout(() => alert("🎉 Tebrikler! Hatim tamamladın. Allah kabul etsin! 🤲"), 100);
    }
  };

  const yuzde = Math.round((okunan.size / 114) * 100);
  const filtreli = SURE_LISTESI.filter((s) => s.ad.toLocaleLowerCase("tr").includes(arama.toLocaleLowerCase("tr")));
  // ★ Cüz dolum durumu — her cüz kendi surelerinin işaretlenme oranıyla dolar
  const cuzDurum = CUZ_SURELER.map((sureler) => {
    const okunanSayi = sureler.filter((n) => okunan.has(n)).length;
    return { oran: sureler.length ? okunanSayi / sureler.length : 0, tam: sureler.length > 0 && okunanSayi === sureler.length };
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Kur'an İlerlemen</p>
        <p className="mt-1 text-2xl font-black text-amber-200">%{yuzde}</p>
        <div className="mx-auto mt-2 h-2 w-full max-w-[240px] overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-500" style={{ width: `${yuzde}%` }} />
        </div>
        <p className="mt-1.5 text-[9px] text-white/50">{okunan.size} / 114 sure okundu {okunan.size === 114 && "· 🎉 Hatim tamam!"}</p>
      </div>
      {/* ★ CÜZ-CÜZ GÖRSEL DOLUM — 30 hücre, işaretledikçe altın renkle dolar (madde 5) */}
      <div className="grid grid-cols-10 gap-1">
        {cuzDurum.map((c, i) => (
          <div key={i}
            title={`${i + 1}. Cüz — %${Math.round(c.oran * 100)} işaretli${c.tam ? " · tamamlandı ✅" : ""}`}
            className={`flex h-7 items-center justify-center rounded-md text-[8px] font-black tabular-nums transition-all ${c.tam ? "bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,.45)]" : c.oran > 0 ? "text-amber-200" : "text-white/30"}`}
            style={!c.tam ? { background: `rgba(245,158,11,${0.06 + c.oran * 0.28})` } : undefined}>
            {i + 1}
          </div>
        ))}
      </div>
      <p className="text-center text-[8px] text-white/30">30 cüz · {cuzDurum.filter((c) => c.tam).length} cüz tamamlandı</p>
      {/* ★ HAFIZLIK İSTATİSTİĞİ (madde 52) — en çok işaretlenenler ve zor gelinenler */}
      {okunan.size > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
          <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">📊 Hafızlık İstatistiği</p>
          {(() => {
            // En uzun sureler = en zor iş (az işaretlenme beklentisi) — işaretlenmişler arasında en uzun 3
            const enUzun = [...okunan].sort((a, b) => (SURE_LISTESI.find(s => s.n === b)?.ayet ?? 0) - (SURE_LISTESI.find(s => s.n === a)?.ayet ?? 0)).slice(0, 3);
            // Kısa sureler = hızlı kazanımlar — işaretlenmemiş en kısa 3
            const hizli = SURE_LISTESI.filter(s => !okunan.has(s.n)).sort((a, b) => a.ayet - b.ayet).slice(0, 3);
            return (
              <div className="space-y-1.5 text-[9.5px]">
                <p className="text-white/60">💪 En büyük işler (işaretlediklerin): {enUzun.map(n => SURE_LISTESI.find(s => s.n === n)?.ad).filter(Boolean).join(", ")}</p>
                {hizli.length > 0 && <p className="text-white/60">⚡ Hızlı kazanım (kısa sureler): {hizli.map(s => s.ad).join(", ")}</p>}
                <p className="text-white/50">Toplam <b className="text-amber-200">{okunan.size}</b> sure · kalan <b className="text-white/80">{114 - okunan.size}</b> sure</p>
              </div>
            );
          })()}
        </div>
      )}
      <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Sure ara..."
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white outline-none placeholder:text-white/30" />
      <div className="max-h-[240px] space-y-1 overflow-y-auto pr-1">
        {filtreli.map((s) => (
          <button key={s.n} onClick={() => toggle(s.n)}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition ${okunan.has(s.n) ? "bg-amber-500/15" : "bg-white/5 hover:bg-white/10"}`}>
            {okunan.has(s.n) ? <CheckCircle2 size={13} className="shrink-0 text-amber-400" /> : <Circle size={13} className="shrink-0 text-white/25" />}
            <span className="w-6 text-[9px] font-bold text-white/40 tabular-nums">{s.n}.</span>
            <span className={`flex-1 text-[10px] font-bold ${okunan.has(s.n) ? "text-amber-200" : "text-white/80"}`}>{s.ad}</span>
            <span className="text-[8px] text-white/30">{s.ayet} ayet</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[8px] text-white/25">İşaretler cihazında saklanır · V2'de hesabıyla senkronize olacak</p>
    </div>
  );
}

// ★ ÖĞÜT VAKTİ — PWA push ile günde 4 sahih hadis bildirimi (sekme kapalıyken bile)
// ★ OKUYUCU MODU / GECE MUŞAFI (madde 34) — kehribar renkli uyku dostu ekran tonu
//   Sayfanın kök div'ine amber filtre uygular; tekrar tıklayınca kapanır.

// ═══════════ ISLAMICTOOLSBOLUMLERI.TSX BLOK: araclar (kaynak 524-739) ═══════════
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
export function NamazBildirim({ prayerTimings }: { prayerTimings: Record<string, string> | null }) {  const [izin, setIzin] = useState<NotificationPermission | "unsupported">(
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

// ─── NAMAZ VAKİTLERİ ────────────────────────────────────
// ★ ÇEVRİMDIŞI TİLAVET (İş 24+59) — Service Worker dinlenen ayet seslerini
//   cache'e yazar. Bu kart yalnızca DURUMU gösterir:
//   kaç ayet sesi cihazda + çevrimdışı mı. Bilgi amaçlı, tek kart.
// ★ AD DÜRÜSTLÜĞÜ (29.09): kart eskiden nurstudyo-audio-v3'e bakıyordu, SW ise
//   v4'e yazıyordu → sayaç hep boş görünüyordu. Ses cache'i artık SÜRÜMSÜZ adla
//   yaşar (sw.js AUDIO_CACHE); kabuk sürümü artsay da kullanıcı sesleri korunur.
export const AUDIO_CACHE_ADI = "nurstudyo-audio"; // sw.js AUDIO_CACHE ile birebir
export function CevrimdisiKart() {
  const [adet, setAdet] = useState<number | null>(null);
  const [cevrimdisi, setCevrimdisi] = useState(!navigator.onLine);
  const [destek, setDestek] = useState(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;
    setDestek(true);
    let live = true;
    (async () => {
      try {
        const cache = await caches.open(AUDIO_CACHE_ADI);
        const keys = await cache.keys();
        if (live) setAdet(keys.length);
      } catch { /* yoksay */ }
    })();
    const online = () => setCevrimdisi(false);
    const offline = () => setCevrimdisi(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => { live = false; window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);

  if (!destek) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden>📥</span>
        <div>
          <p className="text-[10px] font-bold text-white">Çevrimdışı Tilavet</p>
          <p className="text-[8px] text-white/40">
            {cevrimdisi
              ? "📡 Şu an çevrimdışısın — dinlediğin ayetler çalışır"
              : adet === null
                ? "Cihazda saklanan ayet sesi sayılıyor…"
                : adet === 0
                  ? "Dinlediğin ayetler otomatik cihaza kaydedilir"
                  : `${adet} ayet sesi cihazda — internetsiz çalar`}
          </p>
        </div>
      </div>
      <span className={`shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black ${cevrimdisi ? "bg-amber-500/25 text-amber-200" : "bg-emerald-500/15 text-emerald-300"}`}>
        {cevrimdisi ? "Çevrimdışı" : "Hazır"}
      </span>
    </div>
  );
}

import { rozetlerOku, rozetleriTazele, ROZET_LISTESI, rozetOzelOku, rozetGuncelEsik, rozetEsikCarpani, rozetOduluHesapla } from "../hafizlikIstatistik";

// ★ ÜRETİCİ İSTATİSTİKLERİ (İş 42) — yerel üretim sayacı (yalnız cihazda,
//   sunucuya GİTMEZ). useVideoGenerator başarılı üretimde +1 yazar.

// ═══════════ ISLAMICTOOLSBOLUMLERI.TSX BLOK: rozet (kaynak 740-926) ═══════════
export const URETIM_IST_KEY = "nur_uretim_istatistik_v1";
export interface UretimIst {
  toplam: number;
  kisa: number;
  uzun: number;
  tam: number;
  ilkTarih: number;
  sonTarih: number;
}
export function uretimIstOku(): UretimIst {
  try {
    const raw = localStorage.getItem(URETIM_IST_KEY);
    if (raw) return JSON.parse(raw) as UretimIst;
  } catch { /* yoksay */ }
  return { toplam: 0, kisa: 0, uzun: 0, tam: 0, ilkTarih: 0, sonTarih: 0 };
}
export function uretimIstYaz(mode: "short" | "long" | "full"): void {
  try {
    const ist = uretimIstOku();
    ist.toplam += 1;
    if (mode === "short") ist.kisa += 1;
    else if (mode === "long") ist.uzun += 1;
    else ist.tam += 1;
    if (!ist.ilkTarih) ist.ilkTarih = Date.now();
    ist.sonTarih = Date.now();
    localStorage.setItem(URETIM_IST_KEY, JSON.stringify(ist));
  } catch { /* yoksay */ }
}

// ★ ROZETLER (madde 16) — başarımlar: test, zikir, hatim, üretim
//   Veri: hafizlikIstatistik.ts rozetleriTazele() — yalnız cihazda
export function RozetlerKarti() {
  const [rozetler, setRozetler] = useState(() => rozetlerOku());
  const [yeniRozet, setYeniRozet] = useState<string | null>(null);
  // ★ ÖDÜL DÖNGÜSÜ (28.09): tur sayısı + rozet başına kazanım (kırmızı yıldız) + ödül bildirimi
  const [ozel, setOzel] = useState(() => rozetOzelOku());
  const [odulMsg, setOdulMsg] = useState<string | null>(null);
  React.useEffect(() => {
    rozetleriTazele();
    setRozetler(rozetlerOku());
    setOzel(rozetOzelOku());
    const kazanildi = (e: Event) => {
      const liste = (e as CustomEvent<string[]>).detail || [];
      if (liste.length) {
        setYeniRozet(liste[0]);
        window.setTimeout(() => setYeniRozet(null), 4000);
        if (String(liste[0]).includes("🎁")) setOdulMsg(String(liste[0]));
      }
      setRozetler(rozetlerOku());
      setOzel(rozetOzelOku());
    };
    window.addEventListener("nur-rozet-kazanildi", kazanildi);
    return () => window.removeEventListener("nur-rozet-kazanildi", kazanildi);
  }, []);
  const kazanimSayisi = Object.keys(rozetler.kazanim).length;
  const odulHak = rozetOduluHesapla(ozel.turNo);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>🏅</span>
          <p className="text-[10px] font-bold text-white">Başarım Rozetlerin</p>
        </div>
        <div className="flex items-center gap-1">
          {ozel.turNo > 1 && (
            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[8px] font-black text-red-300" title={`Rozet serisi ${ozel.turNo - 1} kez tamamlandı — her turda hediyeler büyüdü, eşikler zorlaştı`}>★ {ozel.turNo - 1}</span>
          )}
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[8.5px] font-black text-amber-200">{kazanimSayisi}/{ROZET_LISTESI.length}</span>
        </div>
      </div>
      {odulMsg && (
        <p className="mb-1.5 animate-pulse rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-center text-[9px] font-black text-emerald-200">
          {odulMsg}
        </p>
      )}
      {yeniRozet && (
        <p className="mb-1.5 animate-pulse rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-center text-[9px] font-black text-emerald-200">
          🎉 Yeni rozet: {yeniRozet}!
        </p>
      )}
      <div className="grid grid-cols-7 gap-1">
        {ROZET_LISTESI.map((r) => {
          const acik = !!rozetler.kazanim[r.id];
          // ★ KIRMIZI KÜÇÜK YILDIZ: rozet kaç turda kazanıldıysa sol üstünde o sayı yazar
          const tur = ozel.kazanimSayisi[r.id] || 0;
          const esik = rozetGuncelEsik(r.id, ozel.turNo);
          const esikMetni = esik !== null ? ` · bu turda: ${esik}` : "";
          // ★ MİNİ İLERLEME ÇUBUĞU (29.09, kullanıcı isteği): kilitli rozette bu turdaki
          //   hedefe ne kadar kaldı tek bakışta görünür. Değer = mevcut sayaç (taban
          //   üstünden), hedef = taban + eşik×çarpan (rozetGuncelEsik). Açık rozet ve
          //   meta'sız rozet (streak) çubuksuz — görsel gürültü olmasın.
          const metaAlan = r.kosulMeta?.alan;
          const mevcut = metaAlan ? (rozetler[metaAlan] as number) ?? 0 : 0;
          const hedef = esik ?? 0;
          const tabanDeger = metaAlan ? (ozel.taban[metaAlan] as number) ?? 0 : 0;
          const turIlerleme = Math.max(0, mevcut - tabanDeger);
          const turHedef = Math.max(1, hedef - tabanDeger);
          const oran = acik ? 1 : esik !== null ? Math.min(1, turIlerleme / turHedef) : 0;
          const kalan = Math.max(0, hedef - mevcut);
          return (
            <div key={r.id} className="relative" title={`${r.ad} — ${r.aciklama}${esikMetni}${tur > 0 ? ` · ${tur}× kazanıldı` : ""}${!acik && esik !== null ? ` · kalan: ${kalan}` : ""}`}>
              <div className={`flex aspect-square items-center justify-center rounded-lg text-base transition ${
                acik ? "bg-amber-500/20 ring-1 ring-amber-400/40" : "bg-white/5 opacity-30 grayscale"
              }`}>
                {r.emoji}
              </div>
              {/* mini ilerleme çubuğu — hücrenin altına yapışık, 3px */}
              {!acik && esik !== null && (
                <div className="absolute inset-x-1 bottom-0.5 h-[3px] overflow-hidden rounded-full bg-black/50" aria-hidden>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(oran * 100)}%`,
                      background: oran >= 1 ? "var(--accent-2)" : "linear-gradient(90deg, rgba(215,170,82,.55), rgba(215,170,82,.95))",
                    }}
                  />
                </div>
              )}
              {tur > 0 && (
                <span className="absolute -left-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[6.5px] font-black text-white shadow" title={`${r.ad}: ${tur} kez kazanıldı`}>★{tur > 1 ? tur : ""}</span>
              )}
            </div>
          );
        })}
      </div>
      {/* ★ DÖNGÜ BİLGİSİ: sıradaki ödül + zorluk çarpanı */}
      <p className="mt-1.5 text-center text-[7.5px] text-white/35">
        {ozel.turNo > 1
          ? <>🔄 {ozel.turNo}. tur — eşikler <b className="text-red-300">{rozetEsikCarpani(ozel.turNo)}×</b> zor · hepsi bitince <b className="text-amber-300">+{odulHak} hak</b></>
          : <>Hepsini kazan → <b className="text-amber-300">+{odulHak} üretim hakkı</b> kazan, sonra eşikler zorlaşır, ödül büyür</>}
      </p>
      {ozel.sonOdul > 0 && (
        <p className="mt-0.5 text-center text-[7px] text-white/25">Son ödül: +{ozel.sonOdul} hak ({new Date(ozel.sonOdulTarih).toLocaleDateString("tr-TR")}) · rozet altındaki ★ = kaç kez kazanıldı</p>
      )}
      <p className="mt-1 text-center text-[7.5px] text-white/30">Rozetler cihazında saklanır — zikir, hatim, üretim ve testlerle açılır</p>
    </div>
  );
}

export function UreticiIstatistikKarti() {
  const [ist, setIst] = useState<UretimIst>(() => uretimIstOku());
  React.useEffect(() => {
    const tazele = () => setIst(uretimIstOku());
    window.addEventListener("uretim-istatistik", tazele);
    return () => window.removeEventListener("uretim-istatistik", tazele);
  }, []);
  const gun = ist.toplam && ist.ilkTarih ? Math.max(1, Math.ceil((ist.sonTarih - ist.ilkTarih) / 86_400_000)) : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-base" aria-hidden>📊</span>
        <p className="text-[10px] font-bold text-white">Üretici İstatistiklerin</p>
      </div>
      {ist.toplam === 0 ? (
        <p className="text-[8px] leading-relaxed text-white/40">Henüz video üretmedin — ilk üretiminle grafik başlar! Yalnızca bu cihazda sayılır, sunucuya gönderilmez.</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-emerald-300">{ist.toplam}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Toplam</p>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-sky-300">{ist.kisa}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Kısa</p>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-amber-300">{ist.uzun}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Uzun</p>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-fuchsia-300">{ist.tam}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Tam</p>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[8px] text-white/35">
            {gun > 0 ? `${gun} gündür üretiyorsun · ortalama ${(ist.toplam / gun).toFixed(1)} video/gün` : ""} · yalnızca bu cihazda sayılır
          </p>
        </>
      )}
    </div>
  );
}

// ─── ANA PANEL ───────────────────────────────────────────
type ToolTab = "prayer" | "qibla" | "zikir" | "kaza" | "calendar" | "dua" | "hatim" | "salah";

