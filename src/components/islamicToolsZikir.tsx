// ════════════════════════════════════════════════════════
// ISLAMICTOOLSZIKIR.TSX — islamicToolsVucut'tan taşındı (SRP parçalama, 09.10)
// Zikirmatik + topluluk vitrin sayacı + günlük grafik.
// Dışa açık adlar birebir korunur — import edenlerin bağlantısı KOPMAZ.
// ════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useRef } from "react";
import { zikirPencereDizisi, sonGunler, type ZikirGunKova } from "./zikirGrafik";

// ═══════════ ZİKİR — kaynak islamicToolsVucut 23-286 ═══════════
// ★ Zikirmatik — kalıcı sayaç (localStorage) + topluluk toplamı (Supabase)
export const ZIKIR_KEY = "nur_zikirmatik_v1";
export const ZIKIR_TOPLULUK_KEY = "nur_zikir_topluluk";
export const ZIKIR_STREAK_KEY = "nur_zikir_streak_v1"; // ★ günlük serbestreak (yol haritası madde 5)

export function loadZikirCount(): number {
  try { return Number(localStorage.getItem(ZIKIR_KEY)) || 0; } catch { return 0; }
}

export const ZIKIR_METINLERI = ["🔴 Estagfirullah", "🌿 Sübhanallah", "❤️ Elhamdülillah", "🌟 AllahuEkber", "🌹 Salavat (Sallallâhu Aleyhi ve Sellem)"];

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
  void zikir;
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
