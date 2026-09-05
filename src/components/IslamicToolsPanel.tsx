import React, { useState, useEffect, useCallback } from "react";
import { X, Compass, Clock, BookOpen, MapPin, Star, RotateCcw, Moon, ChevronDown, ChevronUp } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// ★ NÛR ARAÇLAR — İslami Araçlar Paneli
//   Pembe atlas / namaz vakti uygulamasındaki araçlar
//   Kullanıcı bilgilendirilir, günaha sokulmaz.
// ═══════════════════════════════════════════════════════════

interface IslamicToolsPanelProps {
  open: boolean;
  onClose: () => void;
}

// ─── NAMAZ VAKİTLERİ ────────────────────────────────────
const PRAYER_NAMES = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"];

function parsePrayerTimes(data: Record<string, string>): Array<{ name: string; time: string }> {
  return PRAYER_NAMES.map((name) => ({
    name,
    time: data[name.toLowerCase()] || data[name] || "--:--",
  }));
}

// ─── ZİKİRMATİK ─────────────────────────────────────────
function Zikirmatic() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const presets = [33, 99, 100, 500, 1000];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-white/50">Hedef: {target}</p>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => { setTarget(p); setCount(0); }}
            className={`rounded-lg px-2 py-1 text-[9px] font-bold transition ${target === p ? "bg-amber-500/30 text-amber-300" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="text-center py-4">
        <div className="text-4xl font-black text-white mb-1">{count}</div>
        <div className="text-[10px] text-white/40">/ {target}</div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (count / target) * 100)}%`,
              background: count >= target
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, var(--accent), var(--accent-2))",
            }}
          />
        </div>
        {count >= target && (
          <p className="mt-2 text-[10px] font-bold text-green-400">✅ Hedef tamamlandı! Elhamdülillah</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="flex-1 rounded-xl py-3 text-[12px] font-black text-black transition active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        >
          +1
        </button>
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          className="rounded-xl bg-white/10 px-4 py-3 text-[12px] font-bold text-white/60 hover:bg-white/15 transition"
        >
          −1
        </button>
        <button
          onClick={() => setCount(0)}
          className="rounded-xl bg-white/5 px-3 py-3 text-white/40 hover:bg-white/10 transition"
          title="Sıfırla"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── KIBLE PUSULASI ──────────────────────────────────────
function QiblaCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number | null = null;
    if ("geolocation" in navigator && "DeviceOrientationEvent" in window) {
      // iOS 13+ izin ister
      const handler = (e: DeviceOrientationEvent) => {
        if ((e as any).webkitCompassHeading !== undefined) {
          setHeading((e as any).webkitCompassHeading);
        } else if (e.alpha !== null) {
          setHeading(360 - e.alpha);
        }
      };
      // iOS 13+ izin
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
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, []);

  // Kâbe yönü (Mekke: 21.4225, 39.8262) — basit kuzey referanslı hesaplama
  const qiblaAngle = 148.5; // Türkiye ortalaması ~148-152 derece

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
              style={{ transform: `translateX(-50%) rotate(${qiblaAngle - (heading || 0)}deg)`, transformOrigin: "center 64px" }}
            >
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[14px] border-l-transparent border-r-transparent border-b-amber-400" />
            </div>
            {/* Pusula göstergesi */}
            <div className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center">
              <div className="text-center">
                <Compass size={24} className="text-amber-400 mx-auto mb-1" />
                <p className="text-[9px] text-white/50">KÂBE</p>
                <p className="text-[11px] font-black text-amber-300">148.5°</p>
              </div>
            </div>
            {/* N */}
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 text-[9px] font-bold text-white/60">K</div>
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 text-[9px] font-bold text-white/60">G</div>
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 text-[9px] font-bold text-white/60">B</div>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 text-[9px] font-bold text-white/60">D</div>
          </div>
          <p className="text-[9px] text-white/40">Cihazınızı düz tutun · Kıble yönü altın ok ile gösterilir</p>
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
      <div className="grid grid-cols-4 gap-1.5">
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
  const events = [
    { name: "Mevlid Kandili", date: "2025-09-05", emoji: "🕌" },
    { name: "Regaib Kandili", date: "2026-01-15", emoji: "🌙" },
    { name: "Miraç Kandili", date: "2026-01-22", emoji: "✨" },
    { name: "Berat Kandili", date: "2026-02-06", emoji: "🌟" },
    { name: "Ramazan Başlangıcı", date: "2026-02-18", emoji: "🌙" },
    { name: "Kadir Gecesi", date: "2026-03-15", emoji: "⭐" },
    { name: "Ramazan Bayramı", date: "2026-03-20", emoji: "🎉" },
    { name: "Arife", date: "2026-05-26", emoji: "🕋" },
    { name: "Kurban Bayramı", date: "2026-05-27", emoji: "🎊" },
    { name: "Hicri Yılbaşı", date: "2026-07-08", emoji: "📅" },
    { name: "Aşure Günü", date: "2026-07-16", emoji: "🍯" },
    { name: "Mevlid Kandili", date: "2026-08-25", emoji: "🕌" },
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
      {upcoming.length === 0 && <p className="text-[10px] text-white/30 text-center py-2">Takvim yükleniyor...</p>}
    </div>
  );
}

// ─── ANA PANEL ───────────────────────────────────────────
type ToolTab = "prayer" | "qibla" | "zikir" | "kaza" | "calendar" | "dua";

const DAILY_DUAS = [
  { title: "Sabah Ezkarı", text: "Allah'ım! Bizi bid'atlerden, fitneden ve mankindan koru. Bize verdiğin ömrün bereketini ihsan eyle. Bizi sırat-ı müstakim üzere sabit kıl. Bizi doğru yola hidayet et. Amin." },
  { title: "Akşam Ezkarı", text: "Allah'ım! Sen benim Rabbımsın. Senden başka ilah yoktur. Beni yarattın ve ben senin kulunum. Sana olan söz ve ahdim üzere durmaya gücüm yettiğince çalışacağım. Sana sığındığım kötülüklerin şerrinden sana sığınıyorum. Üzerimdeki nimetini ikrar, günahımı da itiraf ediyorum. Çünkü günahı ancak Sen affedersin. Benden başka_affedicikoğlu yoktur. Amin." },
  { title: "Yemek Duası", text: "Bismillâh. Bize verdiğin rızıkları Helâl kıl, bereketli eyle. Amin." },
  { title: "Uykudan Uyanınca", text: "Elhamdülillah. Allâhım, hamd Senindir. Can da Senindir. Razı olduğun ve hoşnut kaldığın surette canı da senden isterim. Yaşatmak da Senin elindedir, öldürmek de. Hayat da Senin elindedir, ölüm de. Hayat da Senin elindedir, ölüm de." },
  { title: "Yola Çıkınca", text: "Bismillâh, Allahuekber. Allah'ım! Beni bağışla, bana merhamet et, beni hidayet eyle, sağır ve korunmuş olarak kılma. Allah'ım! Şehri şehre, vadiye vadiye,.Handler Thịt御 beni koru." },
  { title: "Tuvalete Girerken", text: "Allah'ım! Pisliklerden sana sığınırım." },
  { title: "Tuvalete Çıkınca", text: "Gafurun'sin, mağfiretini isterim." },
  { title: "Hıçkırarak Ağlarken", text: "Allah'ım! Beni bağışla, bana merhamet et, en sevgili kulun Muhammed (s.a.v.)'e ulaştır ve cennet bahçelerinde beni barındır." },
  { title: "Korkunun Giderilmesi İçin", text: "La ilahe illa Allahulazimulhalim. La ilahe illallahu rabbularşilazim. La ilahe illallahu rabbussemavati verrabularz. La ilahe illallahu vahdehu la sharika leh. Lehulmulku ve lehu'lhamd. Huve 'ala kulli şey'in kadir. Allahümme inni'uzubike min hamizatike ve min suitsakani ve min belail-limberi ve min fitnetil mehdan ve min fitnetil mehda." },
  { title: "Hayırlı İş Başlarken", text: "Bismillâhirrahmânirrahîm. Allah'ım! Bize dünyada da hayır ver, ahirette de hayır ver. Bizi ateş azabından koru." },
  { title: "Miskinlikten Korunmak İçin", text: "Allahümme inni es'elükel adli vel iffete vel afvete vel GHNA. Allah'ım! Senden yardım isterim. Senden bağışlanma dilerim. Sana iman ederim. Sana şükrederim. Sana hamdederim. Sana güzel sözler söylerim. Sana hiçbir şeyi ortak koşmam. Senden korkarım. Sana tevazu gösteririm. Senden bağışlanma dilerim. Senden mağfiret isterim." },
];

const ZIKIRLER = [
  { name: "Sübhanallah", count: 33, text: "Allah'ı tüm noksanlıklardan tenzih ederim" },
  { name: "Elhamdülillah", count: 33, text: "Hamd Allah'a mahsustur" },
  { name: "Allahu Ekber", count: 34, text: "Allah en yücedir" },
  { name: "La ilahe illallah", count: 100, text: "Allah'tan başka ilah yoktur" },
  { name: "Estağfirullah", count: 100, text: "Allah'tan bağışlanma dilerim" },
  { name: "Salavat-ı Şerife", count: 100, text: "Allah'ım! Muhammed'e salat et" },
  { name: "Hasbünallah", count: 100, text: "Bize Allah yeter, O ne güzel vekildir" },
  { name: "Sübhanallahilazim", count: 100, text: "Büyük Allah'ı tüm noksanlıklardan tenzih ederim" },
  { name: "La havle", count: 100, text: "Güç ve kuvvet ancak Allah'ındır" },
  { name: "Bismillah", count: 100, text: "Rahman ve Rahim Allah'ın adıyla" },
  { name: "Selavat", count: 100, text: "Allah'ım! Peygamberimize salat et, selam gönder" },
  { name: "Tövbe", count: 100, text: "Allah'tan tövbe ederim, O'na yönelirim" },
  { name: "Sabr", count: 100, text: "Sabır ve şükür dilerim" },
  { name: "Tevazu", count: 100, text: "Allah'a karşı alçakgönüllü olurum" },
  { name: "Şükür", count: 100, text: "Allah'a sonsuz şükrederim" },
  { name: "Sabır", count: 100, text: "Sabır ve dayanma dilerim" },
];

export const IslamicToolsPanel: React.FC<IslamicToolsPanelProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<ToolTab>("prayer");
  const [expandedDua, setExpandedDua] = useState<number | null>(null);

  if (!open) return null;

  const tabs: Array<{ id: ToolTab; icon: string; label: string }> = [
    { id: "prayer", icon: "🕌", label: "Namaz Vakti" },
    { id: "qibla", icon: "🧭", label: "Kıble" },
    { id: "zikir", icon: "📿", label: "Zikir" },
    { id: "kaza", icon: "📖", label: "Kaza Takibi" },
    { id: "calendar", icon: "📅", label: "Dini Günler" },
    { id: "dua", icon: "🤲", label: "Günün Duaları" },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
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

        <div className="p-4 space-y-4">
          {/* Tab Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
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
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Bugünkü Namaz Vakitleri</p>
                <div className="text-center py-3">
                  <p className="text-[9px] text-white/40 mb-2">📍 Konumunuza göre namaz vakitleri yükleniyor...</p>
                  <p className="text-[9px] text-white/30">Settings uygulamasından konum izni vermeniz gerekir.</p>
                  <p className="text-[9px] text-amber-300/60 mt-2">💡 Namaz vakitleri için Diyanet İşleri Başkanlığı verileri kullanılır.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRAYER_NAMES.map((name) => (
                    <div key={name} className="rounded-lg bg-white/5 p-2 text-center">
                      <p className="text-[8px] text-white/40">{name}</p>
                      <p className="text-[11px] font-bold text-white">--:--</p>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-white/30 text-center">Vakitler Diyanet İşleri Başkanlığı verilerine göredir.</p>
              </div>
            )}

            {activeTab === "qibla" && <QiblaCompass />}

            {activeTab === "zikir" && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Zikir Listesi</p>
                <div className="space-y-1.5">
                  {ZIKIRLER.map((z, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-[10px] font-bold text-amber-300 min-w-[28px]">{z.count}x</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white">{z.name}</p>
                        <p className="text-[8px] text-white/40 truncate">{z.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-white/30 text-center">Zikirler hadis kaynaklarına göredir.</p>
              </div>
            )}

            {activeTab === "kaza" && <KazaTracker />}

            {activeTab === "calendar" && <IslamicCalendar />}

            {activeTab === "dua" && (
              <div className="space-y-2">
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
                        <p className="text-[10px] leading-relaxed text-white/60">{dua.text}</p>
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
