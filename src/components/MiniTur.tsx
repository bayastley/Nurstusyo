// ══════════════════════════════════════════════════════════════
// MINITUR.TSX — İlk girişte 5 duraklı mini tur (madde 3, 02.10.2026)
//   "20 tane güzel odan var ama kapılarına tabela yok" — yeni gelen
//   adamı 5 durakta gezdirir. Balon metinleri i18n (5 dil) — Endonezyalı
//   yeni gelen de kendi dilinde gezdirilir.
//   • localStorage "nur_minitur_gordu" = "1" → ASLA tekrar gösterilmez
//     (yalnız "nur_minitur_reset" değerine "1" yazılırsa sıfırlanır).
//   • Madalyon: hedefe altın çerçeve + ışık halkası; scrollIntoView ile
//     hedefe kayar. Mobil uyumlu (balon alt/üst dinamik).
//   • Durak hedefi görünür değilse (ör. dar ekranda gizli buton) tur o
//     durağı ATLAR — kullanıcının yolu tıkanmaz.
// ══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "../i18n";

export const MINI_TUR_KEY = "nur_minitur_gordu";

// ★ 26.10 YENİ TUR SIRASI — data-minitur etiketleri DOM'da aranır (bileşen bilmeden).
//   Eski duraklardan kuran-sayfalar/araclar/hafizlik-testi üst barradan kalktı (25.10
//   yeniden kurulum) — etiketleri DOM'da olmadığından her turda sessizce ATLANIYORDU;
//   yerlerine canlı üst-bar hedefleri kondu (kullanıcı emri: "araçlar kalktıysa başka
//   önemli şey ekle"). TUR BİTİNCE Kur'an Öğreniyorum paneli açılır ve orada kalır.
const DURAKLAR = [
  "kabe-canli",          // 1) 🕋 Kâbe Canlı — altın maden, en önce
  "kuran-bolumu",        // 2) 📖 Kur'an Öğreniyorum (üst bar)
  "islami-ogreniyorum",  // 3) 🧭 İslami Öğreniyorum — hadis/kıssa/sure/dua havuzu
  "namaz-vakti",         // 4) 🕌 Namaz Vakti sayacı (üst bardaki yeşil buton)
  "bugun-hediye",        // 5) 🎁 Bugünün Hediyesi (sol alt buton)
] as const;

const METINLER: Record<Lang, { baslik: string; atla: string; geri: string; ileri: string; bitir: string; adim: string }> = {
  tr: {
    baslik: "Mini Tur — siteyi 30 saniyede tanı",
    atla: "Atla",
    geri: "Geri",
    ileri: "Sıradaki",
    bitir: "Tur Bitti",
    adim: "Adım",
  },
  en: {
    baslik: "Mini Tour — know the site in 30 seconds",
    atla: "Skip",
    geri: "Back",
    ileri: "Next",
    bitir: "Finish Tour",
    adim: "Step",
  },
  ar: {
    baslik: "جولة مصغّرة — تعرّف على الموقع في ٣٠ ثانية",
    atla: "تخطي",
    geri: "رجوع",
    ileri: "التالي",
    bitir: "إنهاء الجولة",
    adim: "خطوة",
  },
  id: {
    baslik: "Tur Mini — kenal situs dalam 30 detik",
    atla: "Lewati",
    geri: "Kembali",
    ileri: "Lanjut",
    bitir: "Selesai",
    adim: "Langkah",
  },
  ur: {
    baslik: "مینی ٹور — ۳۰ سیکنڈ میں سائٹ جانیں",
    atla: "چھوڑیں",
    geri: "واپس",
    ileri: "اگلا",
    bitir: "ٹور مکمل",
    adim: "قدم",
  },
};

// ★ MOBİL YEDEK: dar ekranda (<768px) pill'ler gizlidir (hidden md:flex) — tur
//   o durakları SOL MENÜ düğmesine çevirir; balon metni zaten "menüdeki ..." der.
//   ★ 26.10: kuran-bolumu/islami-ogreniyorum da md+:sık gizli — yedek menü düğmesine düşer.
const MOBIL_YEDEK: Record<string, string> = {
  "kabe-canli": "menu",
  "kuran-bolumu": "menu",
  "islami-ogreniyorum": "menu",
};

// Durak balon metinleri — i18n (★ 26.10 yeni tur sırası: 5 durak + bitişte Kur'an paneli)
export interface MiniTurProps { lang: Lang; /** ★ 26.10: tur bitince Kur'an Öğreniyorum panelini açan köprü */ onKuranAc?: () => void }
const DURAK_METIN: Record<Lang, Array<{ baslik: string; metin: string }>> = {
  tr: [
    { baslik: "🕋 Kâbe Canlı", metin: "Mekke'den 7/24 kesintisiz yayın — üst bardaki yeşil düğme. YouTube'a gitmeye gerek yok." },
    { baslik: "📖 Kur'an Öğreniyorum", metin: "Kur'an ekranı: sure meali, kelime kelime öğrenme, hafızlık testi ve dinle modu — hepsi tek ekranda." },
    { baslik: "🧭 İslami Öğreniyorum", metin: "Hadis bankası, kıssa köşesi, sure bilgileri ve dua rehberi — üst bardaki pusula düğmesinden açılır." },
    { baslik: "🕌 Namaz Vakti", metin: "Üst bardaki yeşil sayaç: sonraki namaza kalan süreyi gösterir — namaz saatleri kaçırmazsın." },
    { baslik: "🎁 Bugünün Hediyesi", metin: "Her gün küçük bir sürpriz: hadis, zikir ya da üretim hakkı. Sol alttaki hediye kutusuna bak!" },
  ],
  en: [
    { baslik: "🕋 Kaaba Live", metin: "24/7 live from Makkah — the green button in the top bar. No need to open YouTube." },
    { baslik: "📖 Learn the Qur'an", metin: "The Qur'an screen: surah translation, word-by-word study, memorization test and listen mode — all in one screen." },
    { baslik: "🧭 Islamic Learning", metin: "Hadith bank, stories corner, surah info and dua guide — open with the compass button in the top bar." },
    { baslik: "🕌 Prayer Times", metin: "The green counter in the top bar shows the time remaining until the next prayer." },
    { baslik: "🎁 Today's Gift", metin: "A small surprise every day: hadith, dhikr or production credits. Check the gift box at the bottom left!" },
  ],
  ar: [
    { baslik: "🕋 الكعبة مباشر", metin: "بث مباشر من مكة ٢٤/٧ — الزر الأخضر في الشريط العلوي. لا حاجة ليوتيوب." },
    { baslik: "📖 تعلّم القرآن", metin: "شاشة القرآن: ترجمة السور، التعلّم كلمةً كلمة، اختبار الحفظ ووضع الاستماع — كلها في شاشة واحدة." },
    { baslik: "🧭 التعلّم الإسلامي", metin: "بنك الأحاديث وركن القصص ومعلومات السور ودليل الأدعية — يُفتح بزر البوصلة في الشريط العلوي." },
    { baslik: "🕌 أوقات الصلاة", metin: "العدّاد الأخضر في الشريط العلوي يبيّن الوقت المتبقي حتى الصلاة القادمة." },
    { baslik: "🎁 هدية اليوم", metin: "مفاجأة صغيرة كل يوم: حديث أو ذكر أو رصيد إنتاج. انظر صندوق الهدية أسفل اليسار!" },
  ],
  id: [
    { baslik: "🕋 Ka'bah Live", metin: "Siaran langsung 24/7 dari Makkah — tombol hijau di bilah atas. Tak perlu buka YouTube." },
    { baslik: "📖 Belajar Al-Qur'an", metin: "Layar Al-Qur'an: terjemah surah, belajar kata per kata, uji hafalan dan mode dengar — semuanya satu layar." },
    { baslik: "🧭 Belajar Islam", metin: "Bank hadis, cerita, info surah dan panduan doa — buka dengan tombol kompas di bilah atas." },
    { baslik: "🕌 Waktu Salat", metin: "Penghitung hijau di bilah atas menunjukkan waktu tersisa hingga salat berikutnya." },
    { baslik: "🎁 Hadiah Hari Ini", metin: "Kejutan kecil setiap hari: hadis, dzikir, atau kuota produksi. Lihat kotak hadiah di kiri bawah!" },
  ],
  ur: [
    { baslik: "🕋 کعبہ لائیو", metin: "مکہ سے 24/7 براہ راست نشر — اوپری بار کا سبز بٹن۔ یوٹیوب کھولنے کی ضرورت نہیں۔" },
    { baslik: "📖 قرآن سیکھیں", metin: "قرآن اسکرین: سوروں کا ترجمہ، لفظ بہ لفظ تعلیم، حفظ ٹیسٹ اور سننے کا موڈ — سب ایک ہی اسکرین پر۔" },
    { baslik: "🧭 اسلامی تعلیم", metin: "احادیث بینک، واقعات، سوروں کی معلومات اور دعاؤں کی گائیڈ — اوپری بار کے قطب نما بٹن سے کھلیں۔" },
    { baslik: "🕌 نماز کا وقت", metin: "اوپری بار کا سبز کاؤنٹر بتاتا ہے کہ اگلی نماز میں کتنا وقت باقی ہے۔" },
    { baslik: "🎁 آج کا تحفہ", metin: "روز ایک چھوٹا سرپرائز: حدیث، ذکر یا پروڈکشن کریڈٹ۔ نیچے بائیں تحفے کا ڈبہ دیکھیں!" },
  ],
};

export const MiniTur: React.FC<MiniTurProps> = ({ lang, onKuranAc }) => {
  const [adim, setAdim] = useState(0); // 0 = kapalı, 1..5 = durak, 6 = bitti
  const [kutu, setKutu] = useState<{ x: number; y: number; ust: boolean } | null>(null);
  const zamanRef = useRef<number>(0);

  // İlk girişte başlat — ★ DİKKAT: "gordu" işaretini TIMEOUT'UN İÇİNE yazıyoruz.
  //   Eski hata: işareti effect başında yazınca React StrictMode'un çift koşumu
  //   (kur → iptal → "zaten görüldü" de ve çık) turu HİÇ başlatmıyordu.
  useEffect(() => {
    try {
      if (localStorage.getItem(MINI_TUR_KEY) === "1") return;
      zamanRef.current = window.setTimeout(() => {
        try { localStorage.setItem(MINI_TUR_KEY, "1"); } catch { /* yut */ }
        setAdim(1);
      }, 1500);
      return () => window.clearTimeout(zamanRef.current);
    } catch { /* yut */ }
  }, []);

  const hedefBul = (durak: string): HTMLElement | null => {
    const dene = (tag: string): HTMLElement | null => {
      const el = document.querySelector<HTMLElement>(`[data-minitur="${tag}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.width === 0 && r.height === 0 ? null : el; // display:none → yok say
    };
    // önce asıl hedef, görünmezse (kapalı menü içi buton vb.) menü düğmesine düş
    return dene(durak) ?? (MOBIL_YEDEK[durak] ? dene(MOBIL_YEDEK[durak]) : null);
  };

  // Adım değişince hedefe kay + balonu konumla
  useEffect(() => {
    if (adim <= 0 || adim > DURAKLAR.length) { setKutu(null); return; }
    const durakTag = DURAKLAR[adim - 1];
    const hedef = hedefBul(durakTag);
    if (!hedef) { setAdim((a) => a + 1); return; } // durak yoksa atla
    hedef.scrollIntoView({ behavior: "smooth", block: "center" });
    const konumla = () => {
      const r = hedef.getBoundingClientRect();
      const ust = r.top > 220;
      setKutu({ x: Math.min(Math.max(r.left + r.width / 2, 140), window.innerWidth - 140), y: ust ? r.top - 12 : r.bottom + 12, ust });
    };
    const t1 = window.setTimeout(konumla, 350);
    window.addEventListener("resize", konumla);
    return () => { window.clearTimeout(t1); window.removeEventListener("resize", konumla); };
  }, [adim]);

  const m = METINLER[lang] ?? METINLER.tr;
  const durak = DURAK_METIN[lang]?.[adim - 1] ?? DURAK_METIN.tr[adim - 1];
  const hedefTag = useMemo(() => (adim >= 1 && adim <= DURAKLAR.length ? DURAKLAR[adim - 1] : null), [adim]);

  if (adim <= 0 || adim > DURAKLAR.length || !durak || !kutu) return null;

  return (
    <>
      {/* ★ MADALYON — hedefe altın çerçeve + karartma */}
      {hedefTag && (() => {
        const el = hedefBul(hedefTag) ?? hedefBul("menu");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return (
          <div className="pointer-events-none fixed inset-0 z-[290]" style={{ transition: "all .35s ease" }}>
            <div className="absolute inset-0 bg-black/50" style={{ clipPath: `polygon(0 0,100% 0,100% 100%,0 100%, 0 0, ${r.left - 6}px ${r.top - 6}px, ${r.left - 6}px ${r.bottom + 6}px, ${r.right + 6}px ${r.bottom + 6}px, ${r.right + 6}px ${r.top - 6}px, ${r.left - 6}px ${r.top - 6}px)`, transition: "all .35s ease" }} />
            <div className="absolute rounded-2xl border-2 border-gold shadow-[0_0_24px_rgba(215,170,82,.5)]" style={{ left: r.left - 6, top: r.top - 6, width: r.width + 12, height: r.height + 12, transition: "all .35s ease" }} />
          </div>
        );
      })()}

      {/* ★ KONUŞMA BALONU */}
      <div
        className="fixed z-[291] w-72 rounded-2xl border border-gold/40 bg-[#101219] p-3 shadow-2xl"
        style={{
          left: kutu.x,
          top: kutu.y,
          transform: `translate(-50%, ${kutu.ust ? "-100%" : "0"})`,
          transition: "all .35s ease",
        }}
      >
        <p className="text-[9px] font-black uppercase tracking-widest text-gold">{m.adim} {adim}/{DURAKLAR.length}</p>
        <p className="mt-0.5 text-[12px] font-black text-white">{durak.baslik}</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-white/70">{durak.metin}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <button onClick={() => setAdim(DURAKLAR.length + 1)} className="text-[9.5px] font-bold text-white/35 transition hover:text-white/70">{m.atla}</button>{/* ★ Atla = erken çıkış, panel açılmaz */}
          <div className="flex items-center gap-1.5">
            {adim > 1 && (
              <button onClick={() => setAdim((a) => Math.max(1, a - 1))} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9.5px] font-bold text-white/60 transition hover:bg-white/10">{m.geri}</button>
            )}
            <button
              onClick={() => {
                // ★ 26.10 (kullanıcı emri): tur SON adımdan çıkınca Kur'an Öğreniyorum
                //   panelini aç ve orada bırak — son durağı görsünler. Atla'ya yansımaz.
                if (adim === DURAKLAR.length) onKuranAc?.();
                setAdim((a) => a + 1);
              }}
              className="rounded-lg bg-gold px-3 py-1 text-[9.5px] font-black text-slate-950 transition hover:brightness-110 active:scale-95"
            >
              {adim === DURAKLAR.length ? m.bitir : m.ileri + " →"}
            </button>
          </div>
        </div>
        {/* balon kuyruğu */}
        <div
          className="absolute h-2.5 w-2.5 rotate-45 border border-gold/40 bg-[#101219]"
          style={{
            left: "50%",
            [kutu.ust ? "bottom" : "top"]: "-6px",
            marginLeft: "-5px",
            borderBottomWidth: kutu.ust ? "1px" : "0",
            borderTopWidth: kutu.ust ? "0" : "1px",
            borderLeftWidth: "0",
            borderRightWidth: "0",
          }}
        />
      </div>
    </>
  );
};
