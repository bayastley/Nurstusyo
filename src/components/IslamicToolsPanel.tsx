import React, { useState, useEffect, useMemo } from "react";
import { X, Compass, RotateCcw, ChevronDown, ChevronUp, Clock3, MapPin } from "lucide-react";

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

// ─── NAMAZ VAKİTLERİ ────────────────────────────────────
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
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide snap-x">
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
                <p className="text-center text-[8px] text-white/25">Vakitler Aladhan üzerinden Diyanet metodu ile hesaplanır.</p>
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
