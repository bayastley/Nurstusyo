import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Compass, RotateCcw, ChevronDown, ChevronUp, Clock3, MapPin, Bell, CheckCircle2, Circle, Moon, BellRing } from "lucide-react";
import { pushAboneOl, pushAbonelikIptal, pushAbonelikDurumu, pushDestekliyor, iosUyarisi } from "../utils/pushClient";
import { zikirPencereDizisi, sonGunler, type ZikirGunKova } from "./zikirGrafik";
import { SURE_LISTESI, CUZ_SURELER, DAILY_DUAS, ZIKIRLER, CITY_OPTIONS, sehirEtiketindenAd, parsePrayerTimes, minutesFromTime } from "./islamicToolsVeri";
import { QiblaCompass, KazaTracker, IslamicCalendar } from "./islamicToolsBolumler";
// ★ SRP adım 9 (30.09): veri blokları islamicToolsVeri.ts'e, kıble/kaza/takvim bileşenleri islamicToolsBolumler.tsx'e taşındı

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

type ToolTab = "prayer" | "qibla" | "zikir" | "kaza" | "calendar" | "dua" | "hatim" | "salah";

// ★ SRP (01.10): araç bileşenleri islamicToolsVucut.tsx’e taşındı —
//   Zikirmatik, ToplulukVitrinSayaci, DuaTakip, SalahTracker, TopluHatim,
//   HatimTakibi, GeceModuDugmesi, OgutVakti, NamazBildirim, CevrimdisiKart,
//   RozetlerKarti, UreticiIstatistikKarti. Bu dosya sekme düzeni + kabuk.
import { Zikirmatik, ToplulukVitrinSayaci, DuaTakip, SalahTracker, TopluHatim, HatimTakibi, GeceModuDugmesi, OgutVakti, NamazBildirim, CevrimdisiKart, RozetlerKarti, UreticiIstatistikKarti, uretimIstYaz, uretimIstOku, type UretimIst, URETIM_IST_KEY } from "./islamicToolsVucut";

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
                    <p className="text-[9px] text-white/35 mt-1 flex items-center gap-1"><MapPin size={10} />Şehre göre hesaplanır · TR: Diyanet · Yurtdışı: MWL</p>
                  </div>
                  <select value={prayerCity} onChange={(event) => setPrayerCity(sehirEtiketindenAd(event.target.value))} className="max-w-[150px] rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[9px] text-white/70 outline-none" title="Şehir seç — yurtdışı dahil">
                    {/* Seçili şehir listede yoksa (eski kayıt / konum) başa ekleyerek seçili kalır */}
                    {!CITY_OPTIONS.includes(prayerCity) && <option value={prayerCity}>{prayerCity}</option>}
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
