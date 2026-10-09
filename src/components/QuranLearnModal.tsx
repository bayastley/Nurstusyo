import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KABE_SOURCES, QURAN_HD_SOURCES, SUNNAH_SOURCES, RADIO_STATIONS, ulkeToBolge, dilToBolge, type RadioBolge } from "../data/liveStreams";
import { KabeCanliModal } from "./KabeCanliModal"; // ★ SRP 01.10: Kâbe canlı overlay + HLS bağlantısı ayrıldı
import { QuranSayfalar } from "./QuranSayfalar"; // ★ 02.10: Kur'an Sayfaları — mushaf görünümü (zoom/tam ekran/hatim)
import { sevapEkle, arapcaHarfSayisi } from "../data/sevapSayaci"; // ★ madde 4: dürüst harf sayacı
import { getFeatureLock } from "../services/adminSyncService";
import Hls from "hls.js";
import { BookOpen, Headphones, Play, Pause, RotateCcw, Search, X, Loader2, Volume2, Repeat } from "lucide-react";
import { getSurahHadith } from "../data/surahHadith";
import { fetchSurahEditions, fetchAyah, quranUrl } from "../studio/studioHelpers"; // ★ kayma korumalı çekim (28.09) — tr.diyanet → tr.yazir → tr.vakfi zinciri
import { RECITERS, MEALS, SURAHS_DATA, TafsirBox, weightedWordIndex, isEnglishMeal, type Reciter, type SurahInfo } from "./quranLearnVeri";
import { translate, type Lang } from "../i18n"; // ★ TUR 7: UI başlıkları çok dilli
import { sesUrlYedegi } from "../reciters"; // ★ YEDEK SES KAYNAĞI (02.10): everyayah → islamic.network
// ★ SRP adım 11 (30.09): RECITERS/MEALS/SURAHS_DATA verisi + TafsirBox + saf yardımcılar quranLearnVeri.tsx'e taşındı
// İkonlar: Play/Pause ortadaki büyük oynat düğmesi için

// ══════════════════════════════════════════════════════════════
// QuranLearnModal — "Kur'an Öğreniyorum" + "Kur'an Dinliyorum"
// Veri: api.alquran.cloud (114 sure, Arapça + 4 Türkçe meal)
// Kelime: api.quran.com (kelime kelime Arapça + TR meal + kelime sesi)
// Ses: everyayah.com (ayet bazlı, 30 kari) + audio.qurancdn.com (kelime)
// ══════════════════════════════════════════════════════════════

type Mode = "learn" | "listen" | null;

interface Ayah { n: number; ar: string; tr: string; juz: number; page: number; }
// ★ TAM SURE DESTEĞİ: `full` alanındaki kâriler mp3quran.net'ten SURE BAŞINA TEK DOSYA
//    (gapless tam sure) çalabilir — [klasör, sunucuNo]. Hepsi tek tek test edildi (200 OK).

interface Word { i: number; ar: string; tr: string; translit: string; audio: string; }

// ★ KELİME ANLAMLARI: tam sözlük modülü SRP adım 12'de quranLearnSozluk.ts'e taşındı
//   (mantık birebir; import ile kullanılır)
import { WBW_TR, wbwNormIdx, ensureWbwLoaded } from "./quranLearnSozluk";
import { useQuranRadyo } from "../hooks/useQuranRadyo"; // ★ SRP (09.10): radyo motoru hook'a taşındı
// ★ SRP adım 10 (09.10 2. tur): öğren/dinle ekran JSX blokları quranLearnEkranlar.tsx'e taşındı
import { OgrenModu, DinleModu } from "./quranLearnEkranlar";

interface Props { open: boolean; onClose: () => void; initialMode?: Exclude<Mode, null>; lang?: Lang; }

const QuranLearnModal: React.FC<Props> = ({ open, onClose, initialMode, lang }) => {
  // ★ 04.10 TUR 7: UI başlıkları seçili dilde (kullanıcı ekran görüntüsü);
  //   lang verilmezse localStorage'dan okunur (AnnouncementBar deseni)
  const ttQL = (k: string): string => translate(lang ?? localStorage.getItem("nur_lang"), k);
  const [mode, setMode] = useState<Mode>("learn");

  // Header'dan hangi sekmeyle açıldıysa o modda başla
  useEffect(() => { if (open && initialMode) setMode(initialMode); }, [open, initialMode]);

  // ★ KALDIĞIN YERDEN DEVAM — AYET SEVİYESİ: effect gövdesi besmeleCalindiRef
  //   tanımından SONRAYA taşındı (TDZ: eski konumda ref'ten önceydi, build patlardı).
  //   Bakınca: "besmeleCalindiRefUygula" etkisi satır ~1015 civarında.

  // ── Öğren state ──
  const [surahNo, setSurahNo] = useState(1);
  const [ayahNo, setAyahNo] = useState(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ★ VARSAYILAN tr.yazir (05.10): alquran.cloud tr.diyanet verisi bazı surelerde bozuk
  //   (ardışık ayetlere aynı birleşik metin — kanıt: sure 19); Diyanet seçeneği kalmak
  //   şartıyla varsayılan, bugün doğrulanmış temiz edition tr.yazir oldu.
  const [mealId, setMealId] = useState<string>("tr.yazir");
  // ★ MEAL GÜNCELLENİYOR GÖSTERGESİ (02.10, kullanıcı isteği): yalnız meal (dil) değişince
  //   true olur — eski meal ekranda KALIR (bayat ama görülür) + select yanında küçük çip:
  //   "mealler güncelleniyor…". Uzun surelerde (Bakara ~1 MB) boş ekran sessizliği olmaz.
  //   Sure değişiminde eski davranış sürer: tam yenileme + "Ayetler yükleniyor…".
  const [mealYenileniyor, setMealYenileniyor] = useState(false);
  const oncekiMealRef = useRef<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  // ★ OTOMATİK OKU: açıkken ayet biter bitmez sıradaki ayeti okur; kelimeye tıklayınca
  //    o kelime (yoksa o ayet) okunur ve okuma kaldığı yerden devam eder.
  const [autoRead, setAutoRead] = useState(false);
  // ★ SURE AKIŞI: oynatınca ayetler arkasına arkasına okunur, ekran okunan ayeti izler
  const [flowPlaying, setFlowPlaying] = useState(false);
  // ★ UYKU TİLAVETİ: zamanlayıcı dolunca ses durur — yatarken dinleme için
  const [uykuTimer, setUykuTimer] = useState<number | null>(null); // dakika; null = kapalı
  const [uykuKalan, setUykuKalan] = useState<number | null>(null); // saniye
  const [uykuMenu, setUykuMenu] = useState(false);
  const uykuTimerRef = useRef<number | null>(null);

  // Uyku zamanlayıcısı kur / kaldır
  const kurUykuZamanlayici = (dakika: number | null) => {
    if (uykuTimerRef.current) { window.clearInterval(uykuTimerRef.current); uykuTimerRef.current = null; }
    setUykuTimer(dakika);
    setUykuKalan(dakika !== null ? dakika * 60 : null);
    setUykuMenu(false);
    if (dakika === null) return;
    uykuTimerRef.current = window.setInterval(() => {
      setUykuKalan((kalan) => {
        if (kalan === null) return null;
        if (kalan <= 1) {
          // süre doldu → sesi durdur
          try { audioRef.current?.pause(); } catch {}
          try { kabeVideoRef.current?.pause(); } catch {}
          setIsPlaying(false);
          setFlowPlaying(false);
          if (uykuTimerRef.current) { window.clearInterval(uykuTimerRef.current); uykuTimerRef.current = null; }
          setUykuTimer(null);
          return null;
        }
        return kalan - 1;
      });
    }, 1000);
  };

  // Modal kapanınca zamanlayıcıyı temizle
  useEffect(() => {
    if (!open && uykuTimerRef.current) { window.clearInterval(uykuTimerRef.current); uykuTimerRef.current = null; }
  }, [open]);
  const [kabeLive, setKabeLive] = useState(false); // ★ Kâbe canlı yayın modalı (gövde KabeCanliModal'da — SRP 01.10)
  const [sayfalarAcik, setSayfalarAcik] = useState(false); // ★ Kur'an Sayfaları (mushaf) — gövde QuranSayfalar.tsx
  // ★ HEADER KÖPRÜSÜ (02.10): üst bardaki 🕋 Kâbe pill'i ve menü öğesi bu modalın state'ine
  //   doğrudan dokunamaz — window event ile açar. Bileşen kapalıyken de mount'ta kalır
  //   (ModalsContainer hep render eder) → dinleyici uygulama açılışından beri yaşar;
  //   HeaderTopBar'ın setModal("quranLearn") çağrısıyla AYNI tikte React 18 batch'ler.
  useEffect(() => {
    const kabeAc = () => setKabeLive(true);
    const sayfaAc = () => setSayfalarAcik(true);
    window.addEventListener("nur_kabe_ac", kabeAc);
    window.addEventListener("nur_kuran_sayfalar_ac", sayfaAc);
    return () => {
      window.removeEventListener("nur_kabe_ac", kabeAc);
      window.removeEventListener("nur_kuran_sayfalar_ac", sayfaAc);
    };
  }, []);
  // ★ KÂBE CANLI kaynakları ve 📻 RADYO kanalları → src/data/liveStreams.ts'e taşındı (saf veri)
  const [mushafModu, setMushafModu] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reciter, setReciter] = useState("Alafasy_128kbps");
  const [wordLoading, setWordLoading] = useState(false);

  // ── AYET İÇİ KELİME ARAMA: "rahmet" yazınca rahmet geçen ayetler listelenir ──
  const [ayahResults, setAyahResults] = useState<{ s: number; sn: string; a: number; text: string }[]>([]);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const q = query.trim();
    // ★ AYET ARAMA HER İKİ MODDA DA (madde 33): learn + listen — "ortak süper güç"
    if (!open || !mode || q.length < 2) { setAyahResults([]); setSearching(false); return; }
    let live = true;
    setSearching(true);
    const t = setTimeout(() => {
      // Arapça harf varsa Osmanlı metninde, yoksa seçili mealette ara
      const isArabic = /[\u0600-\u06FF]/.test(q);
      const edition = isArabic ? "quran-uthmani" : mealId;
      fetch(quranUrl(`v1/search/${encodeURIComponent(q)}/all/${edition}`))
        .then(r => r.json())
        .then((d: any) => {
          if (!live) return;
          setSearching(false);
          const ms = d.code === 200 && Array.isArray(d.data?.matches) ? d.data.matches : [];
          setAyahResults(ms.slice(0, 12).map((m: any) => ({
            s: m.surah.number,
            sn: m.surah.name,
            a: m.numberInSurah,
            text: String(m.text || "").slice(0, 90),
          })));
        })
        .catch(() => { if (live) { setSearching(false); setAyahResults([]); } });
    }, 400);
    return () => { live = false; clearTimeout(t); };
  }, [query, mealId, mode, open]);

  // ── Dinle state ──
  // ★ FIX (29.09, kullanıcı kararı): başlangıç sureği Yâsîn (36) değil FÂTİHA (1) —
  //   "Kur'an fatihadan başlar, ne alaka" — dinleme akışı Kur'an sırasına uyar.
  //   ★ KALDIĞIN YERDEN DEVAM (29.09): kayıtlı konum varsa onunla başlar (aşağıdaki
  //   effect modal açılınca uygular); kayıt yoksa Kur'an'ın başı Fâtiha'dan.
  const [listenSurah, setListenSurah] = useState(() => {
    try {
      const k = JSON.parse(localStorage.getItem("nur_son_konum") || "") as { s?: number };
      const s = Number(k?.s);
      return s >= 1 && s <= 114 ? s : 1;
    } catch { return 1; }
  });
  const [listenReciter, setListenReciter] = useState("Alafasy_128kbps");
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenAyahIdx, setListenAyahIdx] = useState(0);
  const [nextSurahAuto, setNextSurahAuto] = useState(true);
  const [wholeQuran, setWholeQuran] = useState(false);
  // ★ ÇOKLU HOCA KARIŞIK DİNLEME (madde 65): komple Kur'an modunda sure başına
  //    farklı hoca seçeneği — "hatim karışık hocalarla". Kapalıysa tek hoca (normal akış).
  const [karisikHoca, setKarisikHoca] = useState(false);
  // Ayet-bazlı (everyayah) kâri havuzu — karışık modda her sure bunlardan birine atanır
  const KARISIK_HOCA_POOL = ["Alafasy_128kbps", "MaherAlMuaiqly128kbps", "Abdul_Basit_Murattal_192kbps", "Husary_128kbps", "Minshawy_Murattal_128kbps", "Yasser_Ad-Dussary_128kbps"];
  // Deterministik atama: sure no → havuzdaki kâri (her dinlemede aynı hocalar aynı sureyi okur)
  const karisikReciterFor = useCallback((sN: number) => {
    if (!karisikHoca) return listenReciter;
    return KARISIK_HOCA_POOL[(sN * 7) % KARISIK_HOCA_POOL.length];
  }, [karisikHoca, listenReciter]);
  // ★ TAM SURE MODU: seçilen kârinin mp3quran.net'teki TEK DOSYALIK gapless tam sure kaydı
  //    (ayet ayet indirmeden sureyi baştan sona kesintisiz dinleme — mp3quran.net telifsiz paylaşım)
  const [fullSurahMode, setFullSurahMode] = useState(false);
  const [wholeIdx, setWholeIdx] = useState({ s: 1, a: 1 });
  const [loopAyah, setLoopAyah] = useState(false);
  const [loopAyahListen, setLoopAyahListen] = useState(false);
  const [repeatWord, setRepeatWord] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // ★ 02.10 latent fix: SRP ayırmasında (01.10) kaybolan ref — uyku zamanlayıcısı
  //   Kâbe canlı yayın videosunu duraklatamıyordu. KabeCanliModal onVideoEl ile
  //   video elemanını buraya bağlar.
  const kabeVideoRef = useRef<HTMLVideoElement | null>(null);
  // ★ Mobil metin kaydırma alanı — hayalet ok butonları bunu kaydırır (sayfa sabit)
  const listenScrollRef = useRef<HTMLDivElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") {
    const a = new Audio();
    // ★ YEDEK SES DİNLEYİCİSİ (02.10): bu paylaşımlı elementin src atama noktaları
    //   çok (kelime/öğren/dinle) — her noktayı zincire bağlamak yerine TEK kalıcı
    //   dinleyici patlayan everyayah URL'sini islamic.network yedeğiyle değiştirir.
    //   mp3quran tam-sure URL'lerinin eşleşmesi yoktur → dokunulmaz.
    a.addEventListener("error", () => {
      const mevcut = a.currentSrc || a.src || "";
      if (!mevcut) return;
      const yedek = sesUrlYedegi(mevcut);
      if (!yedek || a.dataset.sesYedek === yedek) return;
      const caliyordu = !a.paused;
      a.dataset.sesYedek = yedek;
      a.src = yedek;
      a.load();
      if (!caliyordu) return; // preload hatası — sessizce yedeği ısıtıyor
      const devam = () => { a.play().catch(() => undefined); };
      if (a.readyState >= 2) devam(); else a.addEventListener("canplay", devam, { once: true });
    });
    audioRef.current = a;
  }
  // ★ Uyku modu ZATEN VARDI (uykuTimer/kurUykuZamanlayici, satır ~211) — yeni ekleme YAPMADIK.
  // ★ KALDIĞIN YERDEN DEVAM (madde 38) — dinlemede sure/ayet değişince otomatik kaydet
  useEffect(() => {
    if (mode !== "listen" || !listenSurah) return;
    try { localStorage.setItem("nur_son_konum", JSON.stringify({ s: listenSurah, a: listenAyahIdx + 1 })); } catch {}
  }, [mode, listenSurah, listenAyahIdx]);
  // ★ EKRANSIZ MEAL DİNLEME (yol haritası V2) — ekran karartılır, sadece ses + kilit ekranı
  //   kontrolleri çalışır (MediaSession API: telefon kilit ekranında oynat/duraklat düğmeleri).
  //   Not: normal tarayıcı sekmesinde ekran kapanınca tarayıcı sesi durdurabilir; PWA olarak
  //   kurulmuşsa (ana ekrana ekle) arka planda çalma çok daha sağlamdır.
  const [ekransizMod, setEkransizMod] = useState(false);
  useEffect(() => {
    if (!open) setEkransizMod(false);
  }, [open]);
  // MediaSession — kilit ekranı kontrolleri + meta bilgisi
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = (navigator as any).mediaSession;
    if (!ekransizMod || mode !== "listen") { try { ms.metadata = null; } catch {} return; }
    try {
      ms.metadata = new (window as any).MediaMetadata({
        title: `${listenSurah}. Sure — Nûr Stüdyo`,
        artist: "Kur'an Tilaveti",
        album: "Nûr Stüdyo · Ekransız Dinleme",
        artwork: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }],
      });
      ms.setActionHandler("play", () => resumeAyah());
      ms.setActionHandler("pause", () => pauseAyah());
      try { ms.setActionHandler("nexttrack", () => setListenAyahIdx((i: number) => Math.min(i + 1, 285))); } catch {}
      try { ms.setActionHandler("previoustrack", () => setListenAyahIdx((i: number) => Math.max(0, i - 1))); } catch {}
    } catch {}
    return () => { try { ms.setActionHandler("play", null); ms.setActionHandler("pause", null); } catch {} };
  }, [ekransizMod, mode, listenSurah]);
  // ★ KÂBE AÇILINCA ARKADAKİ KURAN SUSSUN: iki ses üst üste binmesin.
  //   Kapanınca sessize döner (kullanıcı çal düğmesiyle kaldığı yerden sürdürür).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (kabeLive) { a.muted = true; }
    else if (!isPlaying) { a.muted = false; }
    return () => { if (audioRef.current) audioRef.current.muted = false; };
  }, [kabeLive, isPlaying]);
  const surah = SURAHS_DATA.find(s => s.n === surahNo) ?? SURAHS_DATA[0];
  const ayah = ayahs.find(a => a.n === ayahNo);

  // ★ SEVAP SAYACI — AYET GEZİNME (madde 4): "Öğren" modunda görüntülenen ayet
  //   değiştiğinde O AYETİN Arapça harf sayısı eklenir. Dürüstlük kuralları:
  //     • Sayaç ayetin GÖRÜNTÜLENDİĞİ anda artar (oyunlaştırma yok, rastgelelik yok)
  //     • Aynı oturumda aynı ayet tekrar tekrar sayılmaz (gördüm-ref'te oturum seti)
  //     • Sadece "learn" modunda ve modal açıkken
  const gordumRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!open || mode !== "learn" || !ayahNo) return;
    const anahtar = `${surahNo}:${ayahNo}`;
    if (gordumRef.current.has(anahtar)) return;
    const ayet = ayahs.find((a) => a.n === ayahNo);
    if (!ayet?.ar) return;
    gordumRef.current.add(anahtar);
    sevapEkle(arapcaHarfSayisi(ayet.ar));
  }, [open, mode, surahNo, ayahNo, ayahs]);

  // ★ KARŞILAŞTIRMALI OKUMA (madde 55): ikinci meal yan yana
  const [karsilastirmaAcik, setKarsilastirmaAcik] = useState(false);
  const [karsiMealId, setKarsiMealId] = useState<string>("tr.yazir");
  const [karsiMetin, setKarsiMetin] = useState("");
  useEffect(() => {
    if (!open || mode !== "learn" || !karsilastirmaAcik || !surahNo || !ayahNo) return;
    let live = true;
    setKarsiMetin("");
    // ★ FALLBACK ZİNCİRİ (29.09): ham fetch yerine merkezî fetchAyah — karşılaştırma
    //   mealinde de kayma koruması (diyanet şüpheliyse yazir → vakfi). Arapça + meal tek istekte.
    fetchAyah(surahNo, ayahNo, karsiMealId)
      .then(d => { if (live && d.tr) setKarsiMetin(d.tr); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [open, mode, karsilastirmaAcik, karsiMealId, surahNo, ayahNo]);

  // Ayetleri çek
  // ★ LATİN OKUNUŞ (madde 43): en.transliteration edition'ı ayrıca çekilir;
  //   kullanıcı "Aa Latin" düğmesiyle ayet altında latin okunuşu görebilir.
  const [translit, setTranslit] = useState<Record<number, string>>({});
  const [latinAcik, setLatinAcik] = useState(false);
  useEffect(() => {
    if (!open || mode !== "learn") return;
    let live = true;
    fetch(quranUrl(`v1/surah/${surahNo}/en.transliteration`))
      .then(r => r.json())
      .then((d: any) => {
        if (!live || d.code !== 200) return;
        const map: Record<number, string> = {};
        for (const a of d.data?.ayahs ?? []) map[a.numberInSurah] = String(a.text || "");
        setTranslit(map);
      })
      .catch(() => undefined); // latin okunuş opsiyoneldir — hata sessizce yutulur
    return () => { live = false; };
  }, [open, mode, surahNo]);
  useEffect(() => {
    if (!open || mode !== "learn") return;
    let live = true;
    // ★ MEAL değişimi: bayat metin EKRANDA KALSIN + çip göster (sessizlik yok).
    //   Sure değişimi / ilk açılış: tam temizle + tam ekran yükleniyor (eski davranış).
    const mealDegisti = oncekiMealRef.current !== null && oncekiMealRef.current !== mealId;
    oncekiMealRef.current = mealId;
    if (mealDegisti) {
      setMealYenileniyor(true);
      setError(null);
    } else {
      setMealYenileniyor(false);
      setLoading(true); setError(null); setAyahs([]); setWords([]); setActiveWord(null);
    }
    // ★ KAYMA KORUMASI (28.09): merkezî fetchSurahEditions — tr.diyanet şüpheliyse
    //   tr.yazir → tr.vakfi fallback'i çeker, ayet sayısı/çeviri sağlığı doğrulanır.
    fetchSurahEditions(surahNo, mealId)
      .then((d) => {
        if (!live) return;
        setAyahs(d.arabic.map((a, i) => ({
          n: a.n,
          ar: a.text.trim(),
          tr: d.tr[i] ?? "",
          juz: a.juz,
          page: a.page,
        })));
        // ★ SEVAP SAYACI (madde 4): sure yüklendiğinde toplam Arapça harf sayılır ve
        //   kullanıcının bu ay gerçekten OKUDUĞU ayetler kadarı eklenir (aşağıda, gezinme efekti).
        setMealYenileniyor(false);
        setLoading(false);
      })
      .catch(() => { if (live) { setError(ttQL("qrYuklenemedi")); setMealYenileniyor(false); setLoading(false); } });
    return () => { live = false; };
  }, [open, mode, surahNo, mealId]);

  // Kelime verisini çek (quran.com — kelime + TR meal + kelime sesi)
  // ★ 6 sn zaman aşımı: quran.com takılırsa yedek kelime bölme devreye girsin
  // ★ SÖZLÜK API'DEN BAĞIMSIZ: /wbw-tr-full.json önce paralel yüklenir — API çökse bile
  //   Türkçe anlamlar sözlükten dolar ('—' sorunu kökten çözüldü)
  useEffect(() => {
    if (!open || mode !== "learn") return;
    let live = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    setWordLoading(true); setWords([]); setActiveWord(null);
    const sozlukHazir = ensureWbwLoaded(); // yerel dosya — hızlı ve bağımsız
    fetch(`https://api.quran.com/api/v4/verses/by_key/${surahNo}:${ayahNo}?words=true&word_fields=text_uthmani%2Ctranslation&translations=77&language=tr`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(async (d: any) => {
        if (!live) return;
        await sozlukHazir; // sözlük API'den bağımsız hazır olsun
        const ws = (d.verse?.words ?? []).filter((w: any) => w.char_type_name === "word");
        // Türkçe sözlüğü (bir kez) yükle — API kelime meali (id 77) + yerel sözlük birleşir
        let wbw: Record<string, string> = WBW_TR;
        let normIdx: Record<string, string> = wbwNormIdx();
        const norm = (s: string) => s
          .replace(/[\u0670\u06E1\u064B-\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, "")
          .replace(/\u0671/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647")
          .replace(/[\u06CC]/g, "\u064A").replace(/\s+/g, "").trim();
        const stripAl = (s: string) => norm(s).replace(/^ال/, "");
        const wbwKeys = Object.keys(wbw).map(k => ({ k, n: norm(k), na: stripAl(k) }));
        setWords(ws.map((w: any, i: number) => {
          const bare = w.text_uthmani ?? w.text ?? "";
          const n = norm(bare), na = stripAl(bare);
          const exact = normIdx[n] ?? wbwKeys.find(x => x.n === n || x.na === na);
          let tr = typeof exact === "string" ? exact : (exact as any)?.k ? wbw[(exact as any).k] : undefined;
          if (!tr) {
            // yaklaşık: kelimenin başındaki kökü ara (en az 3 harf)
            const part = wbwKeys.find(x => x.na.length > 2 && (na.startsWith(x.na) || x.na === na.slice(0, x.na.length)));
            tr = part ? wbw[part.k] : undefined;
          }
          // ★ Sıra: tam sözlük (15k kök) → API Türkçe meal → kök araması → en son çare İngilizce.
          //   Sözlük %100 kapsadığı için '—' pratikte hiç görünmez.
          const apiTr = typeof w.translation?.text === "string" ? w.translation.text : "";
          const finalTr = tr ?? (apiTr && !isEnglishMeal(apiTr) ? apiTr : undefined);
          return {
            i,
            ar: bare,
            tr: finalTr ?? (isEnglishMeal(apiTr) ? apiTr : bare),
            translit: w.transliteration?.text ?? "",
            audio: `https://audio.qurancdn.com/${w.audio_url}`,
          };
        }));
        setWordLoading(false);
      })
      .catch(() => { if (live) setWordLoading(false); })
      .finally(() => clearTimeout(timer));
    return () => { live = false; clearTimeout(timer); ctrl.abort(); };
  }, [open, mode, surahNo, ayahNo]);

  // Global ayet sırası (audio için)
  const globalAyahNo = useMemo(() => {
    let g = 0;
    for (const s of SURAHS_DATA) { if (s.n < surahNo) g += s.ayahs; }
    return g + ayahNo;
  }, [surahNo, ayahNo]);

  const stopAudio = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    a.pause(); a.onended = null; a.ontimeupdate = null;
    // ★ KARŞILIKLI DURDURMA (28.09, kullanıcı kararı): "radyo ile kuran dinliyorum aynı anda
    //   çalışıyor, biri çalışınca diğeri dursun" — ayet/kelime sesi dururken radyo da dursun.
    //   (Ters yol zaten vardı: toggleRadio açılırken stopAudio çağırıyordu.)
    //   NOT: radioTimerTemizle/radioHlsTemizle bu noktada TANIMLI DEĞİL (daha aşağıda) —
    //   TDZ hatası olmasın diye doğrudan ref/state üzerinden temizlik yapıyoruz.
    const r = radioRef.current;
    if (r) { r.pause(); }
    radioTimerTemizleRef.current?.();
    radioHlsTemizleRef.current?.();
    setRadioOn(false); setRadioNote("");
  }, []);

  // ★ RADYO MOTORU BAĞLANTISI — stopAudio tanımından SONRA çağrılır (TDZ-fix 09.10):
  //   hook argümanlarında stopAudio/setIsPlaying güncel closure ile sarmalanır.
  const radyo = useQuranRadyo({ open, kabeLive, stopAudio, setIsPlaying });
  const { radioOn, setRadioOn, radioIdx, setRadioIdx, radioVol, setRadioVol, radioMuted, setRadioMuted, radioErr, setRadioErr, radioNote, setRadioNote, radioPaused, setRadioPaused, radioRetryCount, setRadioRetryCount, siraliKanallar, akilliBolge, setAkilliBolge, akilliAcik, setAkilliAcik, radioRef, radioHlsRef, radioTimerTemizleRef, radioHlsTemizleRef, radioTimerTemizle, radioHlsTemizle, toggleRadio, pauseRadio, resumeRadio, radyoKapat } = radyo;

  // ★ GÜNCEL AYET REFİ: ses her zaman EKRANDAKİ ayeti okur (eski closure taşımaz)
  const ayahPosRef = useRef({ s: surahNo, a: ayahNo });
  useEffect(() => { ayahPosRef.current = { s: surahNo, a: ayahNo }; }, [surahNo, ayahNo]);
  // ★ GÜNCEL KELİME REFİ: ses konumu → kelime eşlemesi her zaman taze listeyle
  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);
  // ★ TAKİP METNİ REFİ: tartılı dağıtım ayetin Arapça metnine bakar (taze)
  const ayahPosRefText = useRef(ayah?.ar ?? "");
  useEffect(() => { ayahPosRefText.current = ayah?.ar ?? ""; }, [ayah?.ar]);

  // ★ YEDEK: quran.com engellenirse ayet metnini kelimelere böl — kelime tıklama
  //    ve altın vurgu her koşulda çalışır; anlamlar yerel sözlükten dolar (API gerekmez).
  useEffect(() => {
    if (!open || mode !== "learn" || wordLoading || words.length > 0) return;
    const text = ayah?.ar?.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, "").trim();
    if (!text) return;
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;
    // Yerel sözlük hazır değilse yükle — sonra kelimeleri sözlükten doldur
    let live = true;
    ensureWbwLoaded().then(() => {
      if (!live) return;
      const norm = (s: string) => s
        .replace(/[\u0670\u06E1\u064B-\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, "")
        .replace(/\u0671/g, "\u0627").replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647")
        .replace(/[\u06CC]/g, "\u064A").replace(/\s+/g, "").trim();
      const stripAl = (s: string) => norm(s).replace(/^ال/, "");
      const wbwKeys = Object.keys(WBW_TR).map(k => ({ k, n: norm(k), na: stripAl(k) }));
      setWords(parts.map((ar, i) => {
        const n = norm(ar), na = stripAl(ar);
        const exact = wbwNormIdx()[n] ?? wbwKeys.find(x => x.n === n || x.na === na);
        let tr = typeof exact === "string" ? exact : (exact as any)?.k ? WBW_TR[(exact as any).k] : undefined;
        if (!tr) {
          const part = wbwKeys.find(x => x.na.length > 2 && (na.startsWith(x.na) || x.na === na.slice(0, x.na.length)));
          tr = part ? WBW_TR[part.k] : undefined;
        }
        return { i, ar, tr: tr ?? "—", translit: "", audio: "" };
      }));
    });
    return () => { live = false; };
  }, [open, mode, wordLoading, words.length, ayah?.ar]);

  // ★ KELİMEYE TIKLA: kelimeyi parlat + seçilen hocanın sesiyle O KELİMEYİ oku
  //   (qurancdn kelime sesleri tek okuyuculu; ayet sesi hoca seçiminden gelir.
  //    "Kelimeyi seçilen hoca okusun" için: hoca ayet mp3'ünü kelime konumundan başlatamayız
  //    ama her ayetin ilk kelime sesi mevcut; bu yüzden kelime sesi qurancdn'den (tek okuyucu),
  //    ayet sesi seçilen hocadan çalar — ikisi birlikte doğru davranış)
  const clickWord = (i: number) => {
    if (activeWord === i) { // tekrar tıkla → tekrar oku
      playWordAudio(i);
      return;
    }
    setActiveWord(i);
    playWordAudio(i);
  };

  // ★ SES MODU BAYRAĞI: element üzerinde hangi tür içerik çalıyor (ayah = kelime takibi var,
  //   word = birebir kelime sesi — takip ASLA karışmaz)
  const audioModeRef = useRef<"ayah" | "word">("ayah");

  const playWordAudio = (i: number) => {
    const a = audioRef.current; if (!a || !words[i]) return;
    stopAudio();
    audioModeRef.current = "word";
    // ★ KELİME TIKLAMASINDA takip tamamen KAPANIR — kelime sesi kısa olduğu için
    //   ontimeupdate oranı yanlış kelimeye atlardı (4 kelime geriden ses gelmesi Buydu)
    a.ontimeupdate = null;
    if (words[i].audio) {
      a.src = words[i].audio;
    } else {
      // Kelime sesi yoksa (yedek mod) ayet sesini çal
      a.src = `https://everyayah.com/data/${reciter}/${String(surahNo).padStart(3, "0")}${String(ayahNo).padStart(3, "0")}.mp3`;
    }
    a.playbackRate = speed;
    // ★ SÜREKLİ: kelime sonsuz döngüde çalar (loop=true en güvenilir yöntem)
    a.loop = repeatWord;
    a.onended = null;
    // ★ HATA DÜZELTME: src değişince load() şart — yoksa tarayıcı eski buffer'ı
    //   çalabiliyor (ekranda 'annekum' yazarken önceki 'Allah' sesi duyuluyordu)
    a.load();
    a.play().catch(() => undefined);
  };

  // SÜREKLİ düğmesi: açınca mevcut kelimeyi hemen döngüye al, kapatınca durdur
  const toggleRepeatWord = () => {
    const nv = !repeatWord;
    setRepeatWord(nv);
    const a = audioRef.current;
    if (a) a.loop = nv && activeWord !== null;
    if (nv && activeWord !== null) playWordAudio(activeWord);
  };

  // Ayeti sesli dinle (hoca seçimiyle, tekrar çal opsiyonu) — everyayah ayet dosyası
  // ★ src ve devam mantığı REF'ten okunur: hangi ayet ekrandaysa O çalar,
  //   ayet değişince eski ses zaten stopAudio ile kesiliyor (alttaki efekt).
  // ★ ÖĞREN MODU ÖN YÜKLEME: sıradaki ayeti arka planda ısıtır (geç açılma yok)
  const learnPreloadRef = useRef("");
  const preloadLearnNext = useCallback((sNow: number, aNow: number) => {
    const total = SURAHS_DATA.find(x => x.n === sNow)?.ayahs ?? 0;
    if (aNow + 1 > total) return;
    const url = `https://everyayah.com/data/${reciter}/${String(sNow).padStart(3, "0")}${String(aNow + 1).padStart(3, "0")}.mp3`;
    if (learnPreloadRef.current === url) return;
    learnPreloadRef.current = url;
    const p = new Audio();
    p.preload = "auto";
    p.src = url;
  }, [reciter]);

  const playAyahAudio = (onEnded?: () => void) => {
    const a = audioRef.current; if (!a) return;
    stopAudio();
    const { s: sNow, a: aNow } = ayahPosRef.current;
    a.src = `https://everyayah.com/data/${reciter}/${String(sNow).padStart(3, "0")}${String(aNow).padStart(3, "0")}.mp3`;
    a.playbackRate = speed;
    a.preload = "auto";
    a.load(); // ★ src değişince eski buffer temizlenir — yanlış ses düzeltmesi
    preloadLearnNext(sNow, aNow);
    if (loopAyah) {
      a.loop = true;
    } else {
      a.loop = false;
      if (onEnded) {
        a.onended = onEnded;
      } else if (autoRead || flowPlaying) {
        // Sure akışı: ayet bitince sıradaki ayete geç (sure sonunda durur)
        a.onended = () => {
          const { s: sRef, a: aRef } = ayahPosRef.current;
          const total = SURAHS_DATA.find(x => x.n === sRef)?.ayahs ?? aRef;
          if (aRef < total) {
            setAyahNo(aRef + 1);
            setActiveWord(null);
          } else {
            setFlowPlaying(false); setAutoRead(false); setIsPlaying(false);
          }
        };
      } else {
        a.onended = null;
      }
    }
    a.play().then(() => setIsPlaying(true)).catch(() => undefined);
    audioModeRef.current = "ayah";
    // ★ CANLI KELİME TAKİBİ: ses kendisi konum bildirir, kelime sırayla sarı yanar
    a.ontimeupdate = () => {
      if (audioModeRef.current !== "ayah") return; // kelime sesi çalarken takip kapalı
      if (!a.duration || Number.isNaN(a.duration)) return;
      const ws = wordsRef.current;
      if (ws.length === 0) return;
      const idx = weightedWordIndex(a.currentTime / a.duration, ayahPosRefText.current, ws.length);
      setActiveWord(idx);
    };
  };
  // En güncel playAyahAudio'ya ref — ayet listesinden tıklayınca kullanılır
  const playAyahRef = useRef(playAyahAudio);
  useEffect(() => { playAyahRef.current = playAyahAudio; });

  const replayAyah = () => playAyahAudio();

  // ★ AYET/SURE DEĞİŞİNCE: eski sesi HEMEN kes, ekranla ses aynı ayete gelsin
  //   (otomatik oku modundaysa aşağıdaki efekt yeni ayeti zaten başlatacak)
  useEffect(() => {
    if (!open || mode !== "learn") return;
    stopAudio();
    setActiveWord(null);
  }, [surahNo, ayahNo]);

  // Ayet değişince akış/otomatik oku açıksa yeni ayeti başlat
  useEffect(() => {
    if (open && mode === "learn" && (autoRead || flowPlaying) && ayahNo > 0) {
      const t = setTimeout(() => playAyahAudio(), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahNo, autoRead, flowPlaying, open, mode]);

  // ── Dinle modu ──
  // ★ DİNLE EKRANI AYETİ: o an okunan ayetin Arapça metni + Türkçe meali
  //   (her ayet değişiminde ekranda da değişir, kelimeler okundukça altın yanar)
  const [listenAyahData, setListenAyahData] = useState<{ ar: string; tr: string; n: number } | null>(null);
  // ★ TAM SURE senkronunda güncel ayet indeksi (closure taşımaması için ref)
  const listenAyahIdxRef = useRef(0);
  useEffect(() => { listenAyahIdxRef.current = listenAyahIdx; }, [listenAyahIdx]);
  const [listenWordProgress, setListenWordProgress] = useState<number>(-1);
  // ★ BESMELE GÖSTERGESİ: besmele mp3'ü çalarken ekranda "Yasin 1. Ayet" değil,
  //   BİSMILLÂH metni + "Besmele" etiketi görünür (ses-ekran uyumsuzluğu bitti)
  const [besmelePlaying, setBesmelePlaying] = useState(false);
  // ★ BESMELE REFİ: 'ended' olayı İKİ dinleyiciyi birden tetikliyor (a.onended +
  //   addEventListener). Besmele bitince ikisi AYNI ANDA devreye girip farklı ayetler
  //   kuruyordu → '1-2 okumuyor', '3. ayetten başladı', 'çifte besmele'. Genel dinleyici
  //   besmele çalarken KENDİNİ SUSTURUR (ref senkron okunur — state gecikmesi yaşanmaz).
  const besmeleRef = useRef(false);
  useEffect(() => { besmeleRef.current = besmelePlaying; }, [besmelePlaying]);
  // ★ TEK BESMELE KURALI (28.09, kullanıcı raporu): "besmele → 1. ayet → TEKRAR besmele
  //   → sure tekrar başlıyor" (her surede). Sebep: Pause düğmesi stopListening atıyor,
  //   Play'e tekrar basınca startListening(0) besmele adımını YENIDEN oynatıyordu;
  //   aynı şekilde 1. ayette ⏮ de besmeleyi tekrar çalıyordu. Artık besmele bir sure
  //   için dinleme oturumunda EN FAZLA BİR KEZ çalar; sure/hoca değişince sıfırlanır
  //   (yeni surede bir kez okunur — doğru adab), modal kapanınca da temizlenir.
  const besmeleCalindiRef = useRef(0);
  // ★ KALDIĞIN YERDEN DEVAM — AYET SEVİYESİ (29.09, kullanıcı isteği):
  //   sure konumu zaten listenSurah başlangıcında okunuyor; AYET konumu ise modal
  //   dinleme modunda AÇILDIĞI İLK ANDA nur_son_konum'dan uygulanır. besmeleCalindiRef
  //   o sure için İŞARETLİ kurulur → kullanıcı Play'e basınca kaldığı ayetten
  //   BESMELESİZ devam eder (besmele yalnız sure başında olur — adabın gereği).
  //   "⟲ Başından" düğmesi bu hakkı bilinçli sıfırlar, besmeleyle başlar.
  const sonKonumUygulandiRef = useRef(false);
  useEffect(() => {
    if (!open || mode !== "listen" || sonKonumUygulandiRef.current) return;
    sonKonumUygulandiRef.current = true;
    try {
      const k = JSON.parse(localStorage.getItem("nur_son_konum") || "") as { s?: number; a?: number };
      const s = Number(k?.s), a = Number(k?.a);
      if (s >= 1 && s <= 114 && a >= 2) {
        setListenSurah(s);
        const toplam = SURAHS_DATA.find(x => x.n === s)?.ayahs ?? 7;
        setListenAyahIdx(Math.min(a - 1, toplam - 1));
        if (s !== 1 && s !== 9) besmeleCalindiRef.current = s; // kaldığı ayetten besmelesiz devam
      }
    } catch { /* kayıt yok/bozuk — Fâtiha 1:1 varsayılan */ }
  }, [open, mode]);
  // Modal kapanınca bir sonraki açılış için sıfırla (konum zaten canlı yazılıyor)
  useEffect(() => { if (!open) sonKonumUygulandiRef.current = false; }, [open]);
  const BESMELE_AR = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  const BESMELE_TR = "Rahmân ve Rahîm olan Allah'ın adıyla.";
  const listenAyahDataRef = useRef(listenAyahData);
  useEffect(() => { listenAyahDataRef.current = listenAyahData; }, [listenAyahData]);
  // ★ SURE ÖNBELLEĞİ: surenin ayetleri BİR KEZ çekilir, her ayet geçişinde cache'den
  //   anında okunur. Eski kod HER ayet geçişinde surenin tamamını yeniden indiriyordu —
  //   API yavaşlayınca/hata dönünce meal 1. ayette takılıyordu, ses ilerliyordu.
  const listenSurahCacheRef = useRef<{ s: number; ar: string[]; tr: string[] } | null>(null);
  // ★ EN GÜNCEL KONUM REFİ: gecikmeli yanıt eski ayete yazmasın (stale yazma koruması)
  const listenPosRef = useRef({ s: 0, a: 1 });
  useEffect(() => {
    listenPosRef.current = { s: wholeQuran ? wholeIdx.s : listenSurah, a: wholeQuran ? wholeIdx.a : listenAyahIdx + 1 };
  }, [wholeQuran, wholeIdx.s, wholeIdx.a, listenSurah, listenAyahIdx]);
  useEffect(() => {
    if (mode !== "listen") { setListenAyahData(null); return; }
    // ★ BESMELE KORUMASI: besmele çalarken fetch efekti ekrandaki besmele metnini
    //   1. ayetle DEĞİŞTİRMESİN — ses besmele derken ekranda besmele kalsın.
    //   Besmele bitince state false olur → efekt yeniden koşar → 1. ayet gelir.
    if (besmelePlaying) return;
    const sNow = wholeQuran ? wholeIdx.s : listenSurah;
    const aNow = wholeQuran ? wholeIdx.a : listenAyahIdx + 1;
    // Önbellek isabeti → istek YOK, meal anında güncellenir
    const c = listenSurahCacheRef.current;
    if (c && c.s === sNow && c.ar[aNow - 1]) {
      setListenAyahData({ ar: c.ar[aNow - 1], tr: c.tr[aNow - 1], n: aNow });
      setListenWordProgress(-1);
      return;
    }
    let live = true;
    // ★ KAYMA KORUMASI (28.09): tr.diyanet şüpheliyse tr.yazir → tr.vakfi fallback
    fetchSurahEditions(sNow, "tr.diyanet")
      .then((d) => {
        if (!live) return;
        const ars: string[] = d.arabic.map((x) => x.text);
        const trs: string[] = d.tr;
        listenSurahCacheRef.current = { s: sNow, ar: ars, tr: trs };
        // Yanıt gecikirse ayet değişmiş olabilir → ref'ten GÜNCEL konumu yaz
        const pos = listenPosRef.current;
        if (pos.s !== sNow || !ars[pos.a - 1]) return;
        setListenAyahData({ ar: ars[pos.a - 1], tr: trs[pos.a - 1], n: pos.a });
        setListenWordProgress(-1);
      })
      .catch(() => { /* önbellek sonraki denemede devreye girer */ });
    return () => { live = false; };
  }, [mode, wholeQuran, wholeIdx.s, wholeIdx.a, listenSurah, listenAyahIdx, besmelePlaying]);
  const listenSurahInfo = SURAHS_DATA.find(s => s.n === listenSurah) ?? SURAHS_DATA[35];
  // Hoca arama kutusu — "mahir", "husari" yaz, liste anında filtrelenir
  const [reciterSearch, setReciterSearch] = useState("");
  const filteredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLocaleLowerCase("tr");
    let liste = RECITERS;
    if (q) liste = RECITERS.filter(r => r.name.toLocaleLowerCase("tr").includes(q));
    // ★ SEÇİLİ KARİ EN ÜSTTE — kullanıcı kendi seçimini kaybetmesin
    return [...liste].sort((a, b) => (a.id === listenReciter ? -1 : b.id === listenReciter ? 1 : 0));
  }, [reciterSearch, listenReciter]);
  // ★ Ayet mp3 yolu — everyayah (30 kari, hepsi ayet bazlı, tek tek test edildi)
  //   ★ Karışık hoca modunda sure numarasına göre atanmış kâri kullanılır (madde 65)
  const ayahUrl = useCallback((sN: number, aN: number) =>
    `https://everyayah.com/data/${karisikReciterFor(sN)}/${String(sN).padStart(3, "0")}${String(aN).padStart(3, "0")}.mp3`, [karisikReciterFor]);
  // ★ TAM SURE dosya yolu — kâri destekliyorsa mp3quran.net'ten tek dosya (gapless)
  const fullSurahUrl = useCallback((sN: number) => {
    const rc = RECITERS.find(r => r.id === listenReciter);
    if (!rc?.full) return null;
    const [folder, srv] = rc.full;
    return `https://server${srv}.mp3quran.net/${folder}/${String(sN).padStart(3, "0")}.mp3`;
  }, [listenReciter]);

  // ★ SIRADAKİ AYETİ ÖNCE İNDİR: çalarken arka planda ısıtıyoruz —
  //    ayet değişince sessiz bekleme olmaz, anında devam eder
  const preloadedRef = useRef<string>("");
  const preloadNextAyah = useCallback((sN: number, ayahIdx: number) => {
    const total = SURAHS_DATA.find(s => s.n === sN)?.ayahs ?? 0;
    if (ayahIdx + 2 > total) return;
    const url = ayahUrl(sN, ayahIdx + 2);
    if (preloadedRef.current === url) return;
    preloadedRef.current = url;
    const p = new Audio();
    p.preload = "auto";
    p.src = url;
  }, [ayahUrl]);

  // ★ TAM SURE SES-EKRAN SENKRONU (30.09): tek dosyada okunan ayeti süre oranından
  //   hesaplar — startListening ve playAt AYNI handler'ı kullanır. (Yalnızca ref/setState
  //   dokunduğu için stale closure riski yok.)
  const tamSureSenkronBagla = (a: HTMLAudioElement, sN: number) => {
    a.ontimeupdate = () => {
      if (!a.duration || Number.isNaN(a.duration) || a.duration <= 0) return;
      const ratio = a.currentTime / a.duration;
      const totalAyah = SURAHS_DATA.find(s => s.n === sN)?.ayahs ?? 0;
      if (totalAyah <= 0) return;
      const cache = listenSurahCacheRef.current;
      let yeniIdx: number;
      if (cache && cache.s === sN && cache.ar.length === totalAyah) {
        yeniIdx = Math.min(totalAyah - 1, weightedWordIndex(ratio, cache.ar.join(" "), totalAyah));
      } else {
        yeniIdx = Math.min(totalAyah - 1, Math.floor(ratio * totalAyah));
      }
      if (yeniIdx !== listenAyahIdxRef.current) {
        setListenAyahIdx(yeniIdx);
        setListenWordProgress(-1);
      } else if (cache && cache.s === sN && cache.ar[yeniIdx]) {
        const ayRatio = (ratio * totalAyah) - yeniIdx;
        setListenWordProgress(weightedWordIndex(ayRatio, cache.ar[yeniIdx], 999));
      }
    };
  };

  const playAt = useCallback((sN: number, ayahIdx: number) => {
    const a = audioRef.current; if (!a) return;
    setListenAyahIdx(ayahIdx);
    // ★ TAM SURE MODU: tek dosya çalıyor — ayet verisini fetch etmeye gerek yok,
    //   ekran 'kesintisiz tam sure' göstergesinde kalır
    // ★ KRİTİK DÜZELTME (30.09, canlı testte yakalandı): fsUrl burada MODSIZ tercih
    //   ediliyordu — "Tek Sure"/"Sıradaki Sure" modlarında bile 2 saatlik Bakara
    //   dosyası çalıyordu, karaoke ontimeupdate hiç kurulmuyor, ekran 1. ayette
    //   kilitliydi. Artık tam-sure dosyası YALNIZ fullSurahMode açıksa çalar.
    const fsUrl = fullSurahMode ? fullSurahUrl(sN) : null;
    if (fsUrl) {
      a.src = fsUrl;
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      tamSureSenkronBagla(a, sN);
      a.onended = null;
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }
    a.src = ayahUrl(sN, ayahIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.preload = "auto";
    a.load(); // ★ eski buffer temizle
    // ★ DİNLEDE KELİME TAKİBİ: ses konumu → kelime sayısı, okundukça yanar
    a.ontimeupdate = () => {
      const ay = listenAyahDataRef.current;
      if (!a.duration || Number.isNaN(a.duration) || !ay) return;
      const parts = ay.ar.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return;
      setListenWordProgress(weightedWordIndex(a.currentTime / a.duration, ay.ar, parts.length));
    };
    a.onended = null; // ★ ESKİ onended TEMİZLE — besmele handler'ı yeni ayeti ezmesin
    a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, ayahIdx); }).catch(() => setIsPlaying(false));
  }, [ayahUrl, fullSurahUrl, fullSurahMode, speed, preloadNextAyah]);

  const startListening = useCallback((fromIdx = 0) => {
    stopAudio();
    const sN = wholeQuran ? listenSurah : listenSurah;
    // ★ TAM SURE MODU: kâri tam-sure destekliyorsa sureyi TEK DOSYADAN (gapless) çal
    const rc = RECITERS.find(r => r.id === listenReciter);
    if (fullSurahMode && rc?.full) {
      const [folder, srv] = rc.full;
      const a = audioRef.current; if (!a) return;
      setListenAyahIdx(0);
      a.src = `https://server${srv}.mp3quran.net/${folder}/${String(sN).padStart(3, "0")}.mp3`;
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      // ★ TAM SURE SES-EKRAN SENKRONU (30.09): ortak handler'a taşındı —
      //   süre oranı → tartılı ayet indeksi + ayet içi kelime vurgusu.
      tamSureSenkronBagla(a, sN);
      a.onended = () => {
        // Tam sure bitince: sıradaki sure / komple kuran ayarına göre devam
        if (!wholeQuran && !nextSurahAuto) { setIsPlaying(false); return; }
        const next = SURAHS_DATA.find(s => s.n === sN + 1);
        if (next) {
          setListenSurah(next.n);
          setListenAyahIdx(0);
          a.src = `https://server${srv}.mp3quran.net/${folder}/${String(next.n).padStart(3, "0")}.mp3`;
          a.load();
          a.play().catch(() => setIsPlaying(false));
        } else setIsPlaying(false);
      };
      a.play().then(() => setIsPlaying(true)).catch(() => {
        setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
      });
      return;
    }
    // ★ KOMPLE KUR'AN seçiliyse SEÇİLİ SUREDEN başlar (Fatiha'ya dönmez);
    //   sureler arası geçiş 'ended' dinleyicisinde zaten var
    if (wholeQuran) { setWholeIdx({ s: sN, a: fromIdx + 1 }); }
    const a = audioRef.current; if (!a) return;
    // ★ SURE DEĞİŞİMİ DÜZELTMESİ: setListenAyahIdx(fromIdx) TEK BAŞINA YETERSİZ —
    //   React state güncellemesi ESRİK (asenkron). a.src = ayahUrl(sN, fromIdx+1)
    //   yeni sureyi KURAR ama eski closure'daki onended/ontimeupdate hâlâ eski sureye
    //   bakabiliyordu → "Fatiha seçtim, Enfâl seçtim, hâlâ Fatiha okuyor".
    //   ÇÖZÜM: src'yi YENİ sureyle kur + onended'i TEMİZ kur (aşağıdaki ended dinleyici
   //   effect'i zaten listenSurah'a bağlı yeniden bağlanıyor).
    setListenAyahIdx(fromIdx);
    setListenWordProgress(-1);
    // ★ BESMELE: Fatiha ve Tevbe hariç her sure besmeleyle başlar (sünnet);
    //   sadece ilk ayet başlarken çalar, sonraki ayetlerde çalmaz.
    //   ★ BESMELE DOSYASI: 001001.mp3 = Fâtiha 1. ayet = Bismillâhirrahmânirrahîm.
    //   ⚠️ HATA DÜZELTİLDİ: eskiden 100001.mp3 kullanılıyordu — everyayah adlandırması
    //   3 haneli sure + 3 haneli ayet olduğundan 100001 = Âdiyât 100:1 'Vel âdiyâti dabhâ'
    //   çalıyordu (ekran Yasin gösterirken 'vel âdiyat' sesi gelmesinin sebebi buydu)
    //   ★ ÇİFTE BESMELE DÜZELTİLDİ: Fâtiha'nın 1. ayeti ZATEN besmeledir (001001.mp3 =
    //   Bismillâh). Ayrı besmele dosyası çalmak → Fatiha'da besmele iki kez duyulur.
    //   Bu yüzden Fatiha'da ayrı besmele adımı ATLANIR (isBesmeleSurah kapsıyor).
    const isBesmeleSurah = sN === 1 || sN === 9; // Fâtiha'nın kendisi besmele, Tevbe'de besmele yok
    const besmeleUrl = `https://everyayah.com/data/${listenReciter}/001001.mp3`;
    // ★ TEK BESMELE: bu sure için besmele çalındıysa bir daha ASLA (pause→play, ⏮
    //   veya tekrar çal düğmeleri besmelenin tekrarını tetikleyemez)
    if (fromIdx === 0 && !isBesmeleSurah && besmeleCalindiRef.current !== sN) {
      besmeleCalindiRef.current = sN;
      // Önce besmele, bittikten sonra 1. ayet — EKRANDA DA BESMELE gösterilir
      setListenAyahData({ ar: BESMELE_AR, tr: BESMELE_TR, n: 0 });
      setListenWordProgress(-1);
      setBesmelePlaying(true);
      a.src = besmeleUrl;
      a.onended = () => {
        a.onended = null;
        setBesmelePlaying(false);
        a.src = ayahUrl(sN, 1);
        a.load();
        a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, 0); }).catch(() => setIsPlaying(false));
      };
      a.playbackRate = speed;
      a.loop = false;
      a.preload = "auto";
      a.load();
      a.play().then(() => setIsPlaying(true)).catch(() => {
        setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
      });
      return;
    }
    a.src = ayahUrl(sN, fromIdx + 1);
    a.playbackRate = speed;
    a.loop = false;
    a.preload = "auto";
    a.load(); // ★ eski buffer temizle
    a.onended = null; // ★ ESKİ onended TEMİZLE — sure değişince eski handler yeni sureyi ezmesin
    a.play().then(() => { setIsPlaying(true); preloadNextAyah(sN, fromIdx); }).catch(() => {
      setTimeout(() => { a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false)); }, 250);
    });
  }, [wholeQuran, nextSurahAuto, fullSurahMode, listenSurah, listenReciter, ayahUrl, speed, stopAudio, preloadNextAyah]);

  useEffect(() => {
    // ★ SADECE DİNLE MODUNDA: bu dinleyici ÖĞREN modunda da çalışıp sesi
    //   Dinle sekmesinin suresine kaçırıyordu (Fatiha ekranda, Yasin çalıyordu)
    if (mode !== "listen") return;
    const a = audioRef.current; if (!a) return;
    const onEnded = () => {
      // ★ BESMELE KORUMASI: besmele'nin kendi handler'ı (a.onended) sıradaki ayeti kurar —
      //   bu genel dinleyici o anda ÇALIŞMAZ. (Çift tetikleme → ayet atlama/çifte besmele bug'ı)
      if (besmeleRef.current) return;
      if (loopAyahListen) { a.currentTime = 0; a.play().catch(() => undefined); return; }
      const sNow = wholeQuran ? wholeIdx.s : listenSurah;
      const total = SURAHS_DATA.find(s => s.n === sNow)?.ayahs ?? listenSurahInfo.ayahs;
      if (listenAyahIdx + 1 < total) { playAt(sNow, listenAyahIdx + 1); return; }
      // Sure bitti → KOMPLE KUR'AN ya da SIRADAKİ SURE açıksa bir sonraki sureye geç
      // ★ ÇİFTE BESMELE DÜZELTİLDİ (28.09): eskiden burada besmele ELLE çalınıp onended'de
      //   playAt(next.n, 0) çağrılıyordu — playAt da fromIdx===0'da besmele çaldığı için
      //   sure geçişinde besmele İKİ KEZ duyuluyordu. Artık doğrudan playAt çağrılır;
      //   besmele (Fâtiha/Tevbe hariç) playAt'ın içinde BİR KEZ çalar, ekran da besmele gösterir.
      const next = SURAHS_DATA.find(s => s.n === sNow + 1);
      if ((wholeQuran || nextSurahAuto) && next) {
        if (wholeQuran) setWholeIdx({ s: next.n, a: 1 });
        setListenSurah(next.n);
        playAt(next.n, 0);
        return;
      }
      setIsPlaying(false);
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [mode, loopAyahListen, wholeQuran, nextSurahAuto, wholeIdx, listenSurah, listenAyahIdx, playAt, listenSurahInfo.ayahs, listenReciter]);

  const stopListening = () => { stopAudio(); setIsPlaying(false); setPaused(false); setBesmelePlaying(false); };

  // Öğren modundaki oynatmayı durdurur (ortadaki büyük durdur düğmesi)
  const stopAyahPlayback = () => { stopAudio(); setIsPlaying(false); setFlowPlaying(false); setPaused(false); };

  // ★ DONDUR / DEVAM + İLERİ-GERİ SARMA + ÖNCEKİ/SONRAKİ AYET
  const [paused, setPaused] = useState(false);
  const pauseAyah = () => { const a = audioRef.current; if (!a) return; a.pause(); setPaused(true); };
  const resumeAyah = () => { const a = audioRef.current; if (!a) return; a.play().then(() => setPaused(false)).catch(() => undefined); };
  const seekAyah = (delta: number) => {
    const a = audioRef.current; if (!a || !a.duration || Number.isNaN(a.duration)) return;
    a.currentTime = Math.max(0, Math.min(a.duration - 0.15, a.currentTime + delta));
  };
  const prevAyahLearn = () => {
    if (ayahNo <= 1) return;
    stopAudio(); setPaused(false); setFlowPlaying(true); setAyahNo(ayahNo - 1); setActiveWord(null);
  };
  const nextAyahLearn = () => {
    if (ayahNo >= surah.ayahs) { stopAyahPlayback(); return; }
    stopAudio(); setPaused(false); setFlowPlaying(true); setAyahNo(ayahNo + 1); setActiveWord(null);
  };

  // ★ ORTADAKİ SURE LİSTESİ: okunan ayet görünür pencerede kendiliğinden kayar
  const centerListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    centerListRef.current?.querySelector("[data-current]")?.scrollIntoView({ block: "nearest" });
  }, [ayahNo, ayahs.length, open, mode]);

  // (kelime takibi artık playAyahAudio içinde doğrudan ses'e bağlı — state beklemez,
  //   akış modunda bile kopmaz)

  useEffect(() => { if (!open) { stopAudio(); setIsPlaying(false); besmeleCalindiRef.current = 0; } }, [open, stopAudio]);

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return [];
    return SURAHS_DATA.filter(s =>
      s.name.toLocaleLowerCase("tr").includes(q) ||
      s.en.toLocaleLowerCase().includes(q) ||
      String(s.n) === q
    ).slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col animate-fadeIn bg-[#161622]">
      {/* ★ EKRANSIZ MEAL DİNLEME — tam ekran karartma; ses aynen sürer, gözler dinlenir */}
      {ekransizMod && mode === "listen" && (
        <div className="fixed inset-0 z-[250] bg-black" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none">
            <span className="animate-pulse text-4xl">🌙</span>
            <p className="text-[13px] font-bold text-white/60">Ekransız Dinleme — {listenSurah}. Sure</p>
            <p className="text-[10px] text-white/30">Gözlerini dinlendir… ses sürüyor · kilit ekranından kontrol edebilirsin</p>
          </div>
          <div className="absolute bottom-5 right-5 flex items-center gap-2">
            <button onClick={() => (paused ? resumeAyah() : pauseAyah())} className="rounded-full bg-white/10 px-4 py-2 text-[11px] font-black text-white/70 backdrop-blur transition hover:bg-white/20">
              {paused ? "▶ Devam" : "⏸ Duraklat"}
            </button>
            <button onClick={() => setEkransizMod(false)} className="rounded-full bg-amber-500/20 px-4 py-2 text-[11px] font-black text-amber-200 backdrop-blur transition hover:bg-amber-500/30">
              ✕ Ekrana Dön
            </button>
          </div>
        </div>
      )}
      {/* ÜST BAR */}        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#D7AA41]/20 bg-[#0d1a2c] px-4">
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-white/10">
            <button onClick={() => { setMode("learn"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "learn" ? "bg-gold text-slate-950" : "text-[#a8a184] hover:text-[#f5dda6]"}`}>
              <BookOpen size={13} /> {ttQL("qoOgren")}
            </button>
            <button onClick={() => { setMode("listen"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "listen" ? "bg-gold text-slate-950" : "text-[#a8a184] hover:text-[#f5dda6]"}`}>
              <Headphones size={13} /> {ttQL("qoDinle")}
            </button>
          </div>
          {/* ★ KÂBE CANLI: üst barda — her iki modda da görünür, canlı yayın noktasıyla */}
          <button onClick={() => setKabeLive(true)} className="group relative flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-800/60 to-emerald-950/60 px-3 py-1.5 text-[11px] font-black text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,.25)] transition hover:border-emerald-400/70 hover:brightness-125 active:scale-95" title="Mescid-i Haram'dan 7/24 kesintisiz canlı yayın">
            <span className="text-base leading-none">🕋</span> KÂBE CANLI
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-[#161622] bg-red-500" />
            </span>
          </button>
          {/* ★ KUR'AN SAYFALARI (02.10, kullanıcı emri): mushaf görünümü — zoom, tam ekran, hatim takibi */}
          <button onClick={() => setSayfalarAcik(true)} className="flex items-center gap-1.5 rounded-xl border border-[#D7AA41]/40 bg-gradient-to-b from-[#3a2f14] to-[#241c0b] px-3 py-1.5 text-[11px] font-black text-[#f5dda6] transition hover:border-[#D7AA41]/70 hover:brightness-125 active:scale-95" title="Mushaf sayfaları — büyüt/küçült, tam ekran, kaldığın yerden devam + hatim takibi">
            📖 SAYFALAR
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-1.5 py-0.5 text-[7.5px] font-black text-emerald-300">YENİ</span>
          </button>
          {/* ★ 📻 KUR'AN RADYOSU: üst barda — 7/24 kesintisiz tilavet radyosu */}
          <button onClick={toggleRadio} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition active:scale-95 ${radioOn ? "border-sky-400/60 bg-gradient-to-b from-sky-700/60 to-sky-950/60 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,.3)]" : "border-sky-800/40 bg-sky-950/40 text-sky-300 hover:brightness-125"}`} title="7/24 kesintisiz Kur'an radyosu — hoca seçenekli canlı tilavet">
            📻 {radioOn ? (radioPaused ? ttQL("qrRadyoDurdu") : ttQL("qrRadyoAcik")) : ttQL("qrRadyo")}
          </button>
          {/* ★ KAPAT: en sağda — modalı kapatır (radyo açıkken bile) */}
          <button onClick={onClose} aria-label={ttQL("qrKapat")} className="ml-1 flex items-center gap-1.5 rounded-xl border border-red-900/30 bg-red-950/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-900/60 active:scale-95" title={ttQL("qrEkranKapatTitle")}>
          KAPAT <X size={13} />
        </button>
        </div>
      </div>

      {/* ★ RADYO MİNİ OYNATICI: açılınca üst barın altında ince şerit */}
      {radioOn && (
        <div className="flex shrink-0 items-center gap-2 border-b border-sky-400/20 bg-sky-950/30 px-4 py-1.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
          </span>
          {/* ★ AKILLI RADYO düğmesi: bölge önerisini aç/kapa (isteğe bağlı — kullanıcı serbest) */}
          <button onClick={() => { const yeni = !akilliAcik; setAkilliAcik(yeni); try { localStorage.setItem("nur_akilli_radyo_bolge", yeni ? (akilliBolge || "genel") : "kapat"); } catch { /* yut */ } if (yeni) setRadioNote(`🌍 Akıllı Radyo açık — ${akilliBolge === "tr" ? "Türkiye" : akilliBolge === "ar" ? "Arap bölgesi" : akilliBolge === "yabanci" ? "uluslararası" : "evrensel"} kanalları öne alındı`); }} className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black transition active:scale-95 ${akilliAcik ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`} title={akilliAcik ? "Akıllı Radyo açık — bölgenize göre kanallar öne alınıyor. Kapatırsanız tüm kanallar eşit sıralanır." : "Akıllı Radyo kapalı — tüm kanallar eşit. Açarsanız bölgenize göre önerilir."}>
            🌍 {akilliAcik ? ttQL("qrAkilli") : ttQL("qrTumu")}
          </button>
          <select
            value={radioIdx}
            onChange={(e) => { setRadioIdx(Number(e.target.value)); setRadioNote(""); setRadioErr(false); }} // manuel seçimde eski yedek uyarısını temizle
            className="max-w-52 shrink-0 rounded-lg border border-white/10 bg-[#0d1a2c] px-2 py-1 text-[11px] font-bold text-sky-100 outline-none"
            title="Radyo kanalı seç"
          >
            {siraliKanallar.map(i => <option key={RADIO_STATIONS[i].url} value={i}>{RADIO_STATIONS[i].ad}{akilliAcik && akilliBolge && RADIO_STATIONS[i].bolge === akilliBolge ? " ★" : ""}</option>)}
          </select>
          <span className={`hidden min-w-0 flex-1 truncate text-[10px] font-bold sm:block ${radioNote ? "text-amber-300" : radioPaused ? "text-white/50" : "text-sky-200/60"}`} title={radioNote || (radioPaused ? ttQL("qrDurdurulduTitle") : ttQL("qrCanliTilavet"))}>{radioNote || (radioPaused ? `⏸ ${ttQL("qrDurduruldu")}` : ttQL("qrCanliTilavet"))}</span>
          {radioErr ? (
            <button onClick={() => { // ★ BAŞTAN BAŞLAT: liste 1. kanaldan itibaren yeniden denenir
              setRadioRetryCount((v) => v + 1); // ★ ref hook içinde — retry sayacı ile yeniden bağlan
              setRadioErr(false);
              setRadioNote(`🔄 ${ttQL("qrKanalTekrar")}`);
              setRadioIdx(0);
              setRadioRetryCount(c => c + 1); // aynı kanalsa da efekti zorla tetikle
            }} className="rounded-lg bg-sky-500/20 px-2 py-1 text-[10px] font-black text-sky-200 hover:bg-sky-500/30" title={ttQL("qrKanalTitle")}>↻ {ttQL("qrTekrarDene")}</button>
          ) : (
            <button onClick={() => (radioPaused ? resumeRadio() : pauseRadio())} className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition active:scale-95 ${radioPaused ? "bg-emerald-500/25 text-emerald-200 hover:bg-emerald-500/40" : "bg-amber-500/20 text-amber-200 hover:bg-amber-500/35"}`} title={radioPaused ? ttQL("qrRadyoBaslatTitle") : ttQL("qrRadyoDurdurTitle")}>
              {radioPaused ? `▶ ${ttQL("qrBaslat")}` : `⏸ ${ttQL("qrDurdur")}`}
            </button>
          )}
          <button onClick={() => setRadioMuted(m => !m)} className="text-[13px] leading-none text-sky-100/90 transition hover:text-sky-300" title={radioMuted ? "Sesi aç" : "Sessize al"}>
            {radioMuted || radioVol === 0 ? "🔇" : radioVol < 0.5 ? "🔉" : "🔊"}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={radioMuted ? 0 : radioVol} onChange={(e) => { const v = Number(e.target.value); setRadioVol(v); setRadioMuted(v === 0); }} className="h-1 w-16 cursor-pointer accent-sky-400" title="Radyo ses seviyesi" />
          <button onClick={() => { radioTimerTemizle(); radioHlsTemizle(); radioRef.current?.pause(); setRadioOn(false); setRadioNote(""); }} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white" title="Radyoyu kapat">✕</button>
        </div>
      )}

      {/* ══════════ ÖĞREN MODU — SRP adım 10 (09.10 2. tur): quranLearnEkranlar.tsx ══════════ */}
      {mode === "learn" && (
        <OgrenModu
          ttQL={ttQL}
          query={query} setQuery={setQuery}
          searchOpen={searchOpen} setSearchOpen={setSearchOpen}
          filteredSurahs={filteredSurahs}
          ayahResults={ayahResults} searching={searching} setAyahResults={setAyahResults}
          surahNo={surahNo} setSurahNo={setSurahNo}
          surah={surah}
          ayahNo={ayahNo} setAyahNo={setAyahNo}
          setActiveWord={setActiveWord}
          mealId={mealId} setMealId={setMealId}
          mealYenileniyor={mealYenileniyor}
          reciter={reciter} setReciter={setReciter}
          loading={loading} error={error}
          ayah={ayah} ayahs={ayahs} words={words} wordLoading={wordLoading}
          activeWord={activeWord} clickWord={clickWord}
          karsilastirmaAcik={karsilastirmaAcik} setKarsilastirmaAcik={setKarsilastirmaAcik}
          karsiMealId={karsiMealId} setKarsiMealId={setKarsiMealId} karsiMetin={karsiMetin}
          prevAyahLearn={prevAyahLearn} nextAyahLearn={nextAyahLearn}
          isPlaying={isPlaying} paused={paused} setPaused={setPaused}
          setFlowPlaying={setFlowPlaying}
          playAyahAudio={playAyahAudio} audioRef={audioRef}
          pauseAyah={pauseAyah} resumeAyah={resumeAyah} seekAyah={seekAyah}
          replayAyah={replayAyah} stopAyahPlayback={stopAyahPlayback}
          playWordAudio={playWordAudio} playAyahRef={playAyahRef}
          speed={speed} setSpeed={setSpeed}
          latinAcik={latinAcik} setLatinAcik={setLatinAcik}
          mushafModu={mushafModu} setMushafModu={setMushafModu}
          translit={translit} centerListRef={centerListRef}
        />
      )}
      {/* ══════════ KÂBE CANLI YAYIN — SRP 01.10: KabeCanliModal.tsx */}
      <KabeCanliModal open={kabeLive} onClose={() => setKabeLive(false)} onVideoEl={(el) => { kabeVideoRef.current = el; }} />
      {/* ══════════ KUR'AN SAYFALARI — 02.10: mushaf okuma + hatim takibi */}
      <QuranSayfalar open={sayfalarAcik} onClose={() => setSayfalarAcik(false)} />
    </div>
  );
};

export default QuranLearnModal;
