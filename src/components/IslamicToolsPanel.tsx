import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Compass, RotateCcw, ChevronDown, ChevronUp, Clock3, MapPin, Bell, CheckCircle2, Circle, Moon, BellRing } from "lucide-react";
import { pushAboneOl, pushAbonelikIptal, pushAbonelikDurumu, pushDestekliyor, iosUyarisi } from "../utils/pushClient";
import { zikirPencereDizisi, sonGunler, type ZikirGunKova } from "./zikirGrafik";

// ═══════════════════════════════════════════════════════════
// ★ NÛR ARAÇLAR — İslami Araçlar Paneli
//   Pembe atlas / namaz vakti uygulamasındaki araçlar
//   Kullanıcı bilgilendirilir, günaha sokulmaz.
// ═══════════════════════════════════════════════════════════

interface IslamicToolsPanelProps {
  open: boolean;
  onClose: () => void;
  prayerCity: string;
  setPrayerCity: (city: string) => void;
  prayerTimings: Record<string, string> | null;
}

// ─── 114 SURE (hatim takibi) ───
const SURE_LISTESI: Array<{ n: number; ad: string; ayet: number }> = [
  { n: 1, ad: "Fâtiha", ayet: 7 }, { n: 2, ad: "Bakara", ayet: 286 }, { n: 3, ad: "Âl-i İmrân", ayet: 200 }, { n: 4, ad: "Nisâ", ayet: 176 }, { n: 5, ad: "Mâide", ayet: 120 }, { n: 6, ad: "En'âm", ayet: 165 }, { n: 7, ad: "A'râf", ayet: 206 }, { n: 8, ad: "Enfâl", ayet: 75 }, { n: 9, ad: "Tevbe", ayet: 129 }, { n: 10, ad: "Yûnus", ayet: 109 },
  { n: 11, ad: "Hûd", ayet: 123 }, { n: 12, ad: "Yûsuf", ayet: 111 }, { n: 13, ad: "Ra'd", ayet: 43 }, { n: 14, ad: "İbrâhîm", ayet: 52 }, { n: 15, ad: "Hicr", ayet: 99 }, { n: 16, ad: "Nahl", ayet: 128 }, { n: 17, ad: "İsrâ", ayet: 111 }, { n: 18, ad: "Kehf", ayet: 110 }, { n: 19, ad: "Meryem", ayet: 98 }, { n: 20, ad: "Tâhâ", ayet: 135 },
  { n: 21, ad: "Enbiyâ", ayet: 112 }, { n: 22, ad: "Hac", ayet: 78 }, { n: 23, ad: "Mü'minûn", ayet: 118 }, { n: 24, ad: "Nûr", ayet: 64 }, { n: 25, ad: "Furkân", ayet: 77 }, { n: 26, ad: "Şuarâ", ayet: 227 }, { n: 27, ad: "Neml", ayet: 93 }, { n: 28, ad: "Kasas", ayet: 88 }, { n: 29, ad: "Ankebût", ayet: 69 }, { n: 30, ad: "Rûm", ayet: 60 },
  { n: 31, ad: "Lokmân", ayet: 34 }, { n: 32, ad: "Secde", ayet: 30 }, { n: 33, ad: "Ahzâb", ayet: 73 }, { n: 34, ad: "Sebe", ayet: 54 }, { n: 35, ad: "Fâtır", ayet: 45 }, { n: 36, ad: "Yâsîn", ayet: 83 }, { n: 37, ad: "Sâffât", ayet: 182 }, { n: 38, ad: "Sâd", ayet: 88 }, { n: 39, ad: "Zümer", ayet: 75 }, { n: 40, ad: "Mü'min", ayet: 85 },
  { n: 41, ad: "Fussilet", ayet: 54 }, { n: 42, ad: "Şûrâ", ayet: 53 }, { n: 43, ad: "Zuhruf", ayet: 89 }, { n: 44, ad: "Duhân", ayet: 59 }, { n: 45, ad: "Câsiye", ayet: 37 }, { n: 46, ad: "Ahkâf", ayet: 35 }, { n: 47, ad: "Muhammed", ayet: 38 }, { n: 48, ad: "Fetih", ayet: 29 }, { n: 49, ad: "Hucurât", ayet: 18 }, { n: 50, ad: "Kâf", ayet: 45 },
  { n: 51, ad: "Zâriyât", ayet: 60 }, { n: 52, ad: "Tûr", ayet: 49 }, { n: 53, ad: "Necm", ayet: 62 }, { n: 54, ad: "Kamer", ayet: 55 }, { n: 55, ad: "Rahmân", ayet: 78 }, { n: 56, ad: "Vâkıa", ayet: 96 }, { n: 57, ad: "Hadîd", ayet: 29 }, { n: 58, ad: "Mücâdele", ayet: 22 }, { n: 59, ad: "Haşr", ayet: 24 }, { n: 60, ad: "Mümtehine", ayet: 13 },
  { n: 61, ad: "Saff", ayet: 14 }, { n: 62, ad: "Cuma", ayet: 11 }, { n: 63, ad: "Münâfikûn", ayet: 11 }, { n: 64, ad: "Teğâbün", ayet: 18 }, { n: 65, ad: "Talâk", ayet: 12 }, { n: 66, ad: "Tahrîm", ayet: 12 }, { n: 67, ad: "Mülk", ayet: 30 }, { n: 68, ad: "Kalem", ayet: 52 }, { n: 69, ad: "Hâkka", ayet: 52 }, { n: 70, ad: "Meâric", ayet: 44 },
  { n: 71, ad: "Nûh", ayet: 28 }, { n: 72, ad: "Cinn", ayet: 28 }, { n: 73, ad: "Müzzemmil", ayet: 20 }, { n: 74, ad: "Müddessir", ayet: 56 }, { n: 75, ad: "Kıyâmet", ayet: 40 }, { n: 76, ad: "İnsân", ayet: 31 }, { n: 77, ad: "Mürselât", ayet: 50 }, { n: 78, ad: "Nebe", ayet: 40 }, { n: 79, ad: "Nâziât", ayet: 46 }, { n: 80, ad: "Abese", ayet: 42 },
  { n: 81, ad: "Tekvîr", ayet: 29 }, { n: 82, ad: "İnfitâr", ayet: 19 }, { n: 83, ad: "Mutaffifîn", ayet: 36 }, { n: 84, ad: "İnşikâk", ayet: 25 }, { n: 85, ad: "Bürûc", ayet: 22 }, { n: 86, ad: "Târik", ayet: 17 }, { n: 87, ad: "A'lâ", ayet: 19 }, { n: 88, ad: "Ğâşiye", ayet: 26 }, { n: 89, ad: "Fecr", ayet: 30 }, { n: 90, ad: "Beled", ayet: 20 },
  { n: 91, ad: "Şems", ayet: 15 }, { n: 92, ad: "Leyl", ayet: 21 }, { n: 93, ad: "Duhâ", ayet: 11 }, { n: 94, ad: "İnşirâh", ayet: 8 }, { n: 95, ad: "Tîn", ayet: 8 }, { n: 96, ad: "Alak", ayet: 19 }, { n: 97, ad: "Kadr", ayet: 5 }, { n: 98, ad: "Beyyine", ayet: 8 }, { n: 99, ad: "Zilzâl", ayet: 8 }, { n: 100, ad: "Âdiyât", ayet: 11 },
  { n: 101, ad: "Kâria", ayet: 11 }, { n: 102, ad: "Tekâsür", ayet: 8 }, { n: 103, ad: "Asr", ayet: 3 }, { n: 104, ad: "Hümeze", ayet: 9 }, { n: 105, ad: "Fîl", ayet: 5 }, { n: 106, ad: "Kureyş", ayet: 4 }, { n: 107, ad: "Mâûn", ayet: 7 }, { n: 108, ad: "Kevser", ayet: 3 }, { n: 109, ad: "Kâfirûn", ayet: 6 }, { n: 110, ad: "Nasr", ayet: 3 },
  { n: 111, ad: "Tebbet", ayet: 5 }, { n: 112, ad: "İhlâs", ayet: 4 }, { n: 113, ad: "Felak", ayet: 5 }, { n: 114, ad: "Nâs", ayet: 6 },
];

// ★ Zikirmatik — kalıcı sayaç (localStorage) + topluluk toplamı (Supabase)
const ZIKIR_KEY = "nur_zikirmatik_v1";
const ZIKIR_TOPLULUK_KEY = "nur_zikir_topluluk";
const ZIKIR_STREAK_KEY = "nur_zikir_streak_v1"; // ★ günlük serbestreak (yol haritası madde 5)

function loadZikirCount(): number {
  try { return Number(localStorage.getItem(ZIKIR_KEY)) || 0; } catch { return 0; }
}

const ZIKIR_METINLERI = ["🔴 Estagfirullah", "🌿 Sübhanallah", "❤️ Elhamdülillah", "🌟 Allahuekber", "🌹 Salavat (Sallallâhu Aleyhi ve Sellem)"];

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
function ToplulukVitrinSayaci() {
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

function Zikirmatik() {
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

// ★ CÜZ HARİTASI — 30 cüz; her hücre, o cüzden geçen surelerin işaretlenme oranıyla dolar (madde 5)
const CUZ_SURELER: number[][] = [
  [1], [2], [2, 3], [3, 4], [4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  [9, 10, 11], [10, 11, 12], [12, 13, 14], [14, 15, 16], [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 24], [24, 25, 26], [26, 27, 28],
  [28, 29, 30, 31, 32, 33], [33, 34, 35, 36], [36, 37, 38, 39], [39, 40, 41], [41, 42, 43, 44, 45], [45, 46, 47, 48, 49, 50, 51],
  [51, 52, 53, 54, 55, 56, 57], [57, 58, 59, 60, 61, 62, 63, 64, 65, 66],
  [66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
  [77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
];

// ★ DUA TAKİBİ (madde 58) — sabah/akşam ezkârını dinle-okuma modu + okundu işaretleme
function DuaTakip() {
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
const SALAH_KEY = "nur_salah_tracker_v1";
const SALAH_5 = ["İmsak", "Öğle", "İkindi", "Akşam", "Yatsı"];
function SalahTracker() {
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
const TOPLU_HATIM_KEY = "nur_toplu_hatim_v1";
function TopluHatim() {
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
function HatimTakibi() {
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
const GECE_MOD_KEY = "nur_gece_mod";
function GeceModuDugmesi() {
  const [acik, setAcik] = useState(() => { try { return localStorage.getItem(GECE_MOD_KEY) === "1"; } catch { return false; } });
  useEffect(() => {
    try { localStorage.setItem(GECE_MOD_KEY, acik ? "1" : "0"); } catch {}
    const kok = document.getElementById("root");
    if (kok) {
      kok.style.filter = acik ? "sepia(.28) saturate(.9) hue-rotate(-12deg) brightness(.94)" : "";
      kok.style.transition = "filter .4s ease";
    }
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

function OgutVakti() {
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
function NamazBildirim({ prayerTimings }: { prayerTimings: Record<string, string> | null }) {  const [izin, setIzin] = useState<NotificationPermission | "unsupported">(
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
const AUDIO_CACHE_ADI = "nurstudyo-audio"; // sw.js AUDIO_CACHE ile birebir
function CevrimdisiKart() {
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
function RozetlerKarti() {
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

function UreticiIstatistikKarti() {
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

const PRAYER_NAMES = [
  { label: "İmsak", key: "Fajr" },
  { label: "Güneş", key: "Sunrise" },
  { label: "Öğle", key: "Dhuhr" },
  { label: "İkindi", key: "Asr" },
  { label: "Akşam", key: "Maghrib" },
  { label: "Yatsı", key: "Isha" },
];

function parsePrayerTimes(data: Record<string, string>): Array<{ name: string; time: string }> {
  return PRAYER_NAMES.map(({ label, key }) => ({
    name: label,
    time: data[key] || "--:--",
  }));
}

const CITY_OPTIONS = ["İstanbul", "Ankara", "İzmir", "Bursa", "Konya", "Adana", "Gaziantep", "Trabzon"];

function minutesFromTime(time: string): number | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

// ─── KIBLE HESAPLAMA (modül seviyesi — her yerden kullanılabilir) ───
const MEKKE_LAT = 21.4225;
const MEKKE_LON = 39.8262;

const getQiblaForCity = (cityLat: number, cityLon: number) => {
  const φ1 = cityLat * Math.PI / 180;
  const λ1 = cityLon * Math.PI / 180;
  const φ2 = MEKKE_LAT * Math.PI / 180;
  const λ2 = MEKKE_LON * Math.PI / 180;
  const Δλ = λ2 - λ1;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let angle = Math.atan2(y, x) * 180 / Math.PI;
  return (angle + 360) % 360;
};

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
function QiblaCompass() {
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
function KazaTracker() {
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
function IslamicCalendar() {
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

// ─── ANA PANEL ───────────────────────────────────────────
type ToolTab = "prayer" | "qibla" | "zikir" | "kaza" | "calendar" | "dua" | "hatim" | "salah";

const DAILY_DUAS = [
  { title: "Sabah Ezkarı", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", text: "Sabaha erdik; mülk Allah'ındır, hamd Allah'adır. Allah'tan başka ilah yoktur; O tektir, ortağı yoktur.", source: "Müslim, Zikr 24 (IV/2088)" },
  { title: "Akşam Ezkarı", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", text: "Akşama erdik; mülk Allah'ındır, hamd Allah'adır. Allah'tan başka ilah yoktur; O tektir, ortağı yoktur.", source: "Müslim, Zikr 24 (IV/2088)" },
  { title: "Yemek Öncesi Duası", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", text: "Allah'ın adıyla ve Allah'ın bereketiyle.", source: "Ebû Dâvûd, Et'ime 4; Tirmizî, Et'ime 38" },
  { title: "Yemek Sonrası Duası", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", text: "Bizi yediren, içiren ve Müslüman kılan Allah'a hamd olsun.", source: "Tirmizî, Daavât 55; Ebû Dâvûd, Et'ime 51" },
  { title: "Uykudan Uyanınca", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", text: "Bizi öldürdükten sonra dirilten Allah'a hamd olsun; dönüş O'nadır.", source: "Buhârî, Daavât 7; Müslim, Zikr 21" },
  { title: "Uyumadan Önce", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", text: "Allah'ım! Senin adınla ölür ve dirilirim.", source: "Buhârî, Daavât 7; Müslim, Zikr 22" },
  { title: "Yola Çıkınca (Seyahat Duası)", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", text: "Bunu bizim emrimize veren (Allah) ne yücedir; biz bunu kendimize bağlayamayacaktık.", source: "Müslim, Hac 425; Ebû Dâvûd, Cihâd 78" },
  { title: "Tuvalete Girerken", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ", text: "Allah'ım! Erkek ve dişi şeytanların şerrinden Sana sığınırım.", source: "Buhârî, Vudû 3; Müslim, Hayz 332" },
  { title: "Tuvalete Çıkınca", arabic: "غُفْرَانَكَ", text: "Senin mağfiretini (bağışlanmanı) dilerim.", source: "Ebû Dâvûd, Tahâret 16; Tirmizî, Vudû 6" },
  { title: "Evden Çıkarken", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", text: "Allah'ın adıyla (çıkarım), Allah'a tevekkül ettim; güç ve kuvvet ancak Allah'ladır.", source: "Ebû Dâvûd, Vitr 26; Tirmizî, Daavât 32" },
  { title: "Eve Girerken", arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا", text: "Allah'ın adıyla girdik, Allah'ın adıyla çıktık; Rabbimize tevekkül ettik.", source: "Ebû Dâvûd, Vitr 26; Hâkim, Müstedrek" },
  { title: "Korku Duası", arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ", text: "Aziz ve Halim olan Allah'tan başka ilah yoktur; büyük Arş'ın Rabbi Allah'tan başka ilah yoktur.", source: "Buhârî, Enbiyâ 10; Müslim, Zikr 47" },
  { title: "Hıçkırık / Üzüntü Duası", arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْكَرِيمُ الْحَلِيمُ، سُبْحَانَ اللَّهِ رَبِّ الْعَرْشِ الْعَظِيمِ", text: "Kerim ve Halim olan Allah'tan başka ilah yoktur; büyük Arş'ın Rabbi olan Allah ne yücedir.", source: "Tirmizî, Daavât 84; Ebû Dâvûd, Vitr" },
  { title: "Keder ve Kaygı Duası", arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ... أَسْأَلُكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي", text: "Allah'ım! Ben Senin kulun... Kur'an'ı gönlümün baharı, göğsümün nûru eyle. Hüznümü gider, derdimi çöz.", source: "Ahmed b. Hanbel, I/391 (sahih: Ahmed, Müsned)" },
  { title: "Hayırlı İşe Başlarken", arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ، اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا", text: "Rahman ve Rahîm Allah'ın adıyla. Allah'ım! Kolaylaştırmadığın hiçbir şey kolay değildir.", source: "İbn Hibbân, Tevhit 973; Hâkim" },
  { title: "Zorluk Anında", arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", text: "Senden başka ilah yoktur, Sen yücesin; gerçekten ben zalimlerden oldum. (Yunus Duası)", source: "Tirmizî, Daavât 86 (Kur'an: Enbiyâ 87)" },
  { title: "Borçlu İken", arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ", text: "Allah'ım! Helâlınla haramından beni kâğı kıl; fazlınla Sen'den başkasından beni müstağni kıl.", source: "Tirmizî, Daavât 36; Ebû Dâvûd, Vitr 26" },
  { title: "Yağmur Duası", arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا", text: "Allah'ım! Faydalı yağmur yağdır.", source: "Buhârî, İstisâ 20; Ebû Dâvûd, Salât 315" },
  { title: "Rüya Görünce / Sevinince", arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ", text: "Nimetleriyle hayırların tamamlandığı Allah'a hamd olsun.", source: "İbn Mâce, Dua 10; Müsned kaynakları" },
  { title: "Aksirince", arabic: "يَرْحَمُكَ اللَّهُ → يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ", text: "Aksıran 'Allah size merhamet etsin' der, duyan 'Allah size hidayet versin, hâlinizi ıslah etsin' karşılığını verir.", source: "Buhârî, Edeb 124; Müslim, Zikr 44" },
  { title: "Camiye Girerken", arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", text: "Allah'ım! Benim için rahmet kapılarını aç.", source: "Müslim, Salât 14 (IV/2092)" },
  { title: "Camiden Çıkarken", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", text: "Allah'ım! Senden fazlını diliyorum.", source: "Müslim, Salât 14 (IV/2092)" },
];

const ZIKIRLER = [
  { name: "Sübhanallah", count: 33, text: "Allah'ı tüm noksanlıklardan tenzih ederim", source: "Müslim, Salât 49" },
  { name: "Elhamdülillah", count: 33, text: "Hamd Allah'a mahsustur", source: "Müslim, Salât 49" },
  { name: "Allahu Ekber", count: 34, text: "Allah en yücedir", source: "Buhârî, Teheccüd 8; Müslim, Salât 49" },
  { name: "La ilahe illallah", count: 100, text: "Allah'tan başka ilah yoktur", source: "Buhârî, Zikr 12 (en sevimli kelime)" },
  { name: "Estağfirullah", count: 100, text: "Allah'tan bağışlanma dilerim", source: "Buhârî, Daavât 12 (günde 70-100 istiğfar)" },
  { name: "Salavat-ı Şerife", count: 100, text: "Allah'ım! Muhammed'e salat et", source: "Müslim, Salât 70 (kim 10 salat getirirse...)" },
  { name: "Hasbünallah", count: 100, text: "Bize Allah yeter, O ne güzel vekildir", source: "Buhârî, Tefsîr 9 (İbrâhim'in sözü)" },
  { name: "Sübhanallahi ve bihamdihî", count: 100, text: "Günde 100 kez okuyanın günahları deniz köpüğü kadar da affedilir", source: "Buhârî, Edeb 81; Müslim, Zikr 31" },
  { name: "La havle ve la kuvvete illa billah", count: 100, text: "Güç ve kuvvet ancak Allah'ladır — cennet hazinelerinden biridir", source: "Buhârî, Rekâk; Müslim, Zikr 34" },
  { name: "Sübhanallahi ve bihamdihî sübhanallahil-azim", count: 100, text: "Bu iki kelime hafiftir, terâzuda ağırdır", source: "Buhârî, Tevhid 15; Müslim, Musâfirîn 269" },
  { name: "Tövbe istiğfar (Sayyidü'l-İstiğfar)", count: 33, text: "Allah'ım! Sen benim Rabbimsin... Senin afvına layık değilsin ki — Nûh a.s.'ın duası", source: "Buhârî, Daavât 2; Müslim, Zikr 27" },
  { name: "Dâbbetü'l-erz: Ezkar-ı Sebah", count: 10, text: "Sabah-akşam üçer kez okunması müstehab: Ayetel Kürsi + İhlas, Felak, Nas", source: "Ebû Dâvûd, Fezâil 26 (Erza-ı Sebah)" },
];

export const IslamicToolsPanel: React.FC<IslamicToolsPanelProps> = ({ open, onClose, prayerCity, setPrayerCity, prayerTimings }) => {
  const [activeTab, setActiveTab] = useState<ToolTab>("prayer");
  const [expandedDua, setExpandedDua] = useState<number | null>(null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const prayerTimes = useMemo(() => parsePrayerTimes(prayerTimings ?? {}), [prayerTimings]);
  const nextPrayer = useMemo(() => {
    const now = clock.getHours() * 60 + clock.getMinutes();
    const upcoming = prayerTimes
      .map((prayer) => ({ ...prayer, minutes: minutesFromTime(prayer.time) }))
      .filter((prayer): prayer is typeof prayer & { minutes: number } => prayer.minutes !== null && prayer.minutes > now)
      .sort((a, b) => a.minutes - b.minutes)[0];
    const first = prayerTimes.find((prayer) => minutesFromTime(prayer.time) !== null);
    if (upcoming) return { ...upcoming, remaining: upcoming.minutes - now, tomorrow: false };
    if (first) return { ...first, remaining: (24 * 60 - now) + (minutesFromTime(first.time) ?? 0), tomorrow: true };
    return null;
  }, [clock, prayerTimes]);

  if (!open) return null;

  const tabs: Array<{ id: ToolTab; icon: string; label: string }> = [
    { id: "prayer", icon: "🕌", label: "Namaz Vakti" },
    { id: "salah", icon: "✅", label: "Namaz Takibi" },
    { id: "hatim", icon: "📖", label: "Hatim Takibi" },
    { id: "qibla", icon: "🧭", label: "Kıble" },
    { id: "zikir", icon: "📿", label: "Zikirmatik" },
    { id: "kaza", icon: "📋", label: "Kaza Takibi" },
    { id: "calendar", icon: "📅", label: "Dini Günler" },
    { id: "dua", icon: "🤲", label: "Günün Duaları" },
  ];

  return (
    // ★ 28.09 FIX: "modal en aşağıda açılıyor" — kutu max-h ve overflow'suz büyüyordu:
    //   uzun içerikte items-center kutuyu ekran ALTINA itiyor, kullanıcı en üste
    //   dönmek için ucuza kaydırıyordu. Doğru desen (paylaşılan Modal ile aynı):
    //   max-h + flex flex-col KÖK KUTUDA, overflow-y-auto YALNIZ içerikte.
    //   Kutu asla viewport'u aşmaz; üst boşlukta merkezde kalır.
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={onClose}>
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black shadow-2xl mx-2 sm:mx-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-950/90 backdrop-blur px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-xl">🤲</span> Nûr Araçları
            </h2>
            <p className="text-[11px] text-white/40 mt-0.5">İslami yardımcı araçlar · Namaz, zikir, kıble</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        {/* ★ İÇERİK: yalnız burası kayar — kutu max-h'yi asla aşmaz (28.09 fix) */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {/* Tab Bar */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            {activeTab === "prayer" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Bugünkü Namaz Vakitleri</p>
                    <p className="text-[9px] text-white/35 mt-1 flex items-center gap-1"><MapPin size={10} />Konumuna göre hesaplanır</p>
                  </div>
                  <select value={prayerCity} onChange={(event) => setPrayerCity(event.target.value)} className="max-w-[125px] rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[9px] text-white/70 outline-none">
                    {CITY_OPTIONS.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                {nextPrayer && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
                    <div className="flex items-center gap-2"><Clock3 size={16} className="text-amber-300" /><div><p className="text-[9px] text-white/45">Sıradaki vakit{nextPrayer.tomorrow ? " · yarın" : ""}</p><p className="text-xs font-black text-amber-200">{nextPrayer.name} · {nextPrayer.time}</p></div></div>
                    <span className="text-[10px] font-bold text-white/65">{Math.floor(nextPrayer.remaining / 60)} sa {nextPrayer.remaining % 60} dk</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {prayerTimes.map(({ name, time }) => {
                    const isNext = nextPrayer?.name === name;
                    return <div key={name} className={`rounded-xl border p-2.5 text-center transition ${isNext ? "border-amber-400/30 bg-amber-400/10" : "border-white/5 bg-white/5"}`}><p className="text-[8px] text-white/45">{name}</p><p className={`mt-1 text-sm font-black ${isNext ? "text-amber-200" : "text-white/85"}`}>{time}</p></div>;
                  })}
                </div>
                {!prayerTimings && <p className="text-center text-[9px] text-white/35">Vakitler yükleniyor veya konum izni bekleniyor...</p>}
                <NamazBildirim prayerTimings={prayerTimings} />
                <OgutVakti />
                <CevrimdisiKart />
                <UreticiIstatistikKarti />
                <RozetlerKarti />
                <GeceModuDugmesi />
                <p className="text-center text-[8px] text-white/25">Vakitler Aladhan üzerinden Diyanet metodu ile hesaplanır.</p>
              </div>
            )}

            {activeTab === "hatim" && (
              <div className="space-y-3">
                <HatimTakibi />
                <TopluHatim />
              </div>
            )}

            {activeTab === "qibla" && <QiblaCompass />}

            {activeTab === "salah" && <SalahTracker />}

            {activeTab === "zikir" && (
              <div className="space-y-3">
                <Zikirmatik />
                {/* ★ TOPLULUK VİTRİN SAYACI (madde 31) — tek kullanıcıya değil TOPLAMA bakılır.
                    ★ DÜRÜSTLÜK DÜZELTMESİ (28.09): burada sabit +14.283.947 "sahte taban"
                    toplanıyordu — DB'de gerçek toplam 1 iken ekranda 14 milyonun üstünde
                    yalan sayı görünüyordu. Artık SAYI YOK: sunucudan (nur_zikir_topluluk)
                    gelen gerçek toplam yazılır; henüz kimse çekmediyse "İlk zikiri sen çek"
                    daveti gösterilir. Sitede asla uydurma sayı görünmez. */}
                <ToplulukVitrinSayaci />
                <p className="pt-1 text-[10px] font-bold text-white/60 uppercase tracking-wider">Sahih Zikir Listesi</p>
                <div className="space-y-1.5">
                  {ZIKIRLER.map((z, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-[10px] font-bold text-amber-300 min-w-[28px]">{z.count}x</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white">{z.name}</p>
                        <p className="text-[8px] text-white/40">{z.text}</p>
                        <p className="text-[7px] font-bold uppercase tracking-wider text-amber-300/60">Kaynak: {z.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-white/30 text-center">Zikirler ve dualar Buhârî · Müslim · Tirmizî · Ebû Dâvûd sahih kaynaklıdır.</p>
              </div>
            )}

            {activeTab === "kaza" && <KazaTracker />}

            {activeTab === "calendar" && <IslamicCalendar />}

            {activeTab === "dua" && (
              <div className="space-y-2">
                <DuaTakip />
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Günün Duaları & Ezkarı</p>
                {DAILY_DUAS.map((dua, i) => (
                  <div key={i} className="rounded-lg bg-white/5 overflow-hidden">
                    <button
                      onClick={() => setExpandedDua(expandedDua === i ? null : i)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-left"
                    >
                      <span className="text-amber-400 text-[10px] font-bold min-w-[18px]">{i + 1}.</span>
                      <span className="flex-1 text-[10px] font-bold text-white">{dua.title}</span>
                      {expandedDua === i ? <ChevronUp size={12} className="text-white/40" /> : <ChevronDown size={12} className="text-white/40" />}
                    </button>
                    {expandedDua === i && (
                      <div className="px-3 pb-3 border-t border-white/5 pt-2">
                        {dua.arabic && <p className="mb-2 text-right text-[11px] leading-relaxed text-[#e8dfc0]" dir="rtl">{dua.arabic}</p>}
                        <p className="text-[10px] leading-relaxed text-white/60">{dua.text}</p>
                        {dua.source && <p className="mt-1.5 text-[7px] font-bold uppercase tracking-wider text-amber-300/60">Kaynak: {dua.source}</p>}
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-[8px] text-white/30 text-center">Dualar sahih kaynaklardan derlenmiştir.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4 space-y-1">
            <p className="text-[10px] text-white/30">🤲 Nûr Araçları — İslamî yaşamınız için yardımcı araçlar</p>
            <p className="text-[9px] text-white/20">Bilgiler Diyanet İşleri Başkanlığı verilerine dayanır</p>
          </div>
        </div>
      </div>
    </div>
  );
};
