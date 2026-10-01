import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KABE_SOURCES, QURAN_HD_SOURCES, SUNNAH_SOURCES, RADIO_STATIONS, ulkeToBolge, dilToBolge, type RadioBolge } from "../data/liveStreams";
import { KabeCanliModal } from "./KabeCanliModal"; // ★ SRP 01.10: Kâbe canlı overlay + HLS bağlantısı ayrıldı
import { getFeatureLock } from "../services/adminSyncService";
import Hls from "hls.js";
import { BookOpen, Headphones, Play, Pause, RotateCcw, Search, X, Loader2, Volume2, Repeat } from "lucide-react";
import { getSurahHadith } from "../data/surahHadith";
import { fetchSurahEditions, fetchAyah, quranUrl } from "../studio/studioHelpers"; // ★ kayma korumalı çekim (28.09) — tr.diyanet → tr.yazir → tr.vakfi zinciri
import { RECITERS, MEALS, SURAHS_DATA, TafsirBox, weightedWordIndex, type Reciter, type SurahInfo } from "./quranLearnVeri";
// ★ SRP adım 11 (30.09): RECITERS/MEALS/SURAHS_DATA verisi + TafsirBox + saf yardımcılar quranLearnVeri.tsx'e taşındı
// İkonlar: Play/Pause ortadaki büyük oynat düğmesi için

// ══════════════════════════════════════════════════════════════
// QuranLearnModal — "Kur'an Öğreniyorum" + "Kur'an Dinliyorum"
// Veri: api.alquran.cloud (114 sure, Arapça + 4 Türkçe meal)
// Kelime: api.quran.com (kelime kelime Arapça + TR meal + kelime sesi)
// Ses: everyayah.com (ayet bazlı, 30 kari) + audio.qurancdn.com (kelime)
// ══════════════════════════════════════════════════════════════

type Mode = "learn" | "listen" | null;

interface Reciter { id: string; name: string; everyayah?: string; full?: [string, number]; }
interface Ayah { n: number; ar: string; tr: string; juz: number; page: number; }
// ★ TAM SURE DESTEĞİ: `full` alanındaki kâriler mp3quran.net'ten SURE BAŞINA TEK DOSYA
//    (gapless tam sure) çalabilir — [klasör, sunucuNo]. Hepsi tek tek test edildi (200 OK).

interface Word { i: number; ar: string; tr: string; translit: string; audio: string; }

// ★ KELİME ANLAMLARI: tam Kur'an sözlüğü (15.321 kök, TÜM 77.429 kelime %100 kapsama)
//   kaynak: quran.com API Türkçe WbW (Diyanet) + eski 571 sözlük — public/wbw-tr-full.json
//   2) yoksa API Türkçe meal 3) o da yoksa Arapça kök gösterilir ('—' asla görünmez)
const WBW_TR: Record<string, string> = {};
// ★ SÖZLÜK YÜKLEME DURUMU: quran.com API'si çökse bile sözlük bir kez yüklensin —
//   eski kodda sözlük SADECE API başarılı olunca çekiliyordu, API takılınca kelimeler '—' oluyordu.
let WBW_LOADED = false;
let WBW_NORM_IDX: Record<string, string> = {};
let WBW_LOADING: Promise<void> | null = null;
async function ensureWbwLoaded(): Promise<void> {
  if (WBW_LOADED) return;
  if (!WBW_LOADING) {
    WBW_LOADING = fetch("/wbw-tr-full.json")
      .then(r => r.json())
      .then(j => {
        const t = j.translations ?? j;
        Object.assign(WBW_TR, t);
        WBW_NORM_IDX = j.normIndex ?? {};
        WBW_LOADED = Object.keys(WBW_TR).length > 0;
      })
      .catch(() => { WBW_LOADING = null; /* başarısızsa tekrar denenebilir */ });
  }
  await WBW_LOADING;
}

interface Props { open: boolean; onClose: () => void; initialMode?: Exclude<Mode, null>; }

const QuranLearnModal: React.FC<Props> = ({ open, onClose, initialMode }) => {
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
  const [mealId, setMealId] = useState<string>("tr.diyanet");
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
  // ★ KÂBE CANLI kaynakları ve 📻 RADYO kanalları → src/data/liveStreams.ts'e taşındı (saf veri)
  const [radioOn, setRadioOn] = useState(false);
  const [radioIdx, setRadioIdx] = useState(0);
  const [radioVol, setRadioVol] = useState(0.8);
  const [radioMuted, setRadioMuted] = useState(false);
  const [radioErr, setRadioErr] = useState(false);
  const [radioNote, setRadioNote] = useState("");
  // ★ AKILLI RADYO: konuma göre bölge önerisi ("genel" | "tr" | "ar") + kullanıcı tercihi.
  //   "null" = henüz bilinmiyor; tespit edilince localStorage'a yazılır (bir daha sormaz).
  //   Kullanıcı "Tüm Kanallar"ı seçerse akıllı filtre devre dışı kalır (manuelle öncelik).
  const [akilliBolge, setAkilliBolge] = useState<RadioBolge | null>(null);
  // ★ MUSHAF GÖRÜNÜMÜ (madde 29) — ayetler tek blok halinde mushaf sayfası gibi
  const [mushafModu, setMushafModu] = useState(false);
  const [akilliAcik, setAkilliAcik] = useState(true); // kullanıcı "Tüm Kanallar" derse false
  useEffect(() => {
    try {
      const kayit = localStorage.getItem("nur_akilli_radyo_bolge");
      if (kayit === "tr" || kayit === "ar" || kayit === "genel") setAkilliBolge(kayit);
      else if (kayit === "kapat") setAkilliAcik(false);
    } catch { /* localStorage kapalıysa sessizce atla */ }
    // Konum tespiti: ipapi.co → tarayıcı dili fallback. Her ikisi de fail olursa
    //   tarayıcı diliyle "yabanci" (Batı kitlesi) / "genel" bölgesi seçilir. Yol haritası madde 1.
    // ★ CORS DÜZELTMESİ (tam tarama 28.09): cloudflare.com/cdn-cgi/trace CORS header
    //   döndürmüyor — her sayfada "blocked by CORS" hatası basıyordu. ipapi.co
    //   CORS'lu ve tek başına yeterli → zincirin başı artık doğrudan ipapi.co.
    if (!localStorage.getItem("nur_akilli_radyo_bolge")) {
      fetch("https://ipapi.co/json/")
        .then(r => r.text())
        .then(t => {
          const m = t.match(/^loc=(\w{2})$/m);
          if (m) { const b = ulkeToBolge(m[1]); setAkilliBolge(b); try { localStorage.setItem("nur_akilli_radyo_bolge", b); } catch { /* yut */ } }
          return t;
        })
        .then(txt => {
          // ipapi.co text/json karışık dönebilir — JSON parse edilebiliyorsa ülke kodunu oku
          try {
            const d = JSON.parse(txt);
            if (d?.country_code) { const b = ulkeToBolge(d.country_code); setAkilliBolge(b); try { localStorage.setItem("nur_akilli_radyo_bolge", b); } catch { /* yut */ } }
          } catch { /* text yanıtı — dil fallback'i alttaki catch'te */ }
        })
        .catch(() => { const b = dilToBolge(navigator.language); setAkilliBolge(b); try { localStorage.setItem("nur_akilli_radyo_bolge", b); } catch { /* yut */ } });
    }
  }, []);
  // ★ Akıllı mod açıksa: bölge kanalları öne, sonra diğerleri. Kapalıysa orijinal sıra.
  const siraliKanallar = useMemo(() => {
    if (!akilliAcik || !akilliBolge) return RADIO_STATIONS.map((_, i) => i);
    const oneri = RADIO_STATIONS.map((st, i) => (st.bolge === akilliBolge ? i : -1)).filter(i => i >= 0);
    const digerleri = RADIO_STATIONS.map((_, i) => i).filter(i => !oneri.includes(i));
    return [...oneri, ...digerleri];
  }, [akilliAcik, akilliBolge]);
  // ★ DURDUR/BAŞLAT: radyo kanalı seçili kalır, sadece ses askıya alınır
  const [radioPaused, setRadioPaused] = useState(false);
  const radioRef = useRef<HTMLAudioElement | null>(null);
  const radioHlsRef = useRef<Hls | null>(null); // ★ HLS kanallar (Diyanet m3u8) için hls.js örneği
  // ★ KARŞILIKLI DURDURMA KÖPRÜSÜ (28.09): stopAudio (bileşende daha aşağıda tanımlı)
  //   radyoyu da durduracak — ama radioTimerTemizle/radioHlsTemizle fonksiyonları o
  //   noktada henüz tanımsız (TDZ). Çözüm: temizlik fonksiyonlarını ref üzerinden
  //   kaydet; stopAudio çağrı anında ref'ten erişir (TDZ hatasız, taze closure).
  const radioTimerTemizleRef = useRef<(() => void) | null>(null);
  const radioHlsTemizleRef = useRef<(() => void) | null>(null);
  if (!radioRef.current && typeof Audio !== "undefined") {
    radioRef.current = new Audio();
    radioRef.current.preload = "none";
  }
  // ★ Radyo çalarken ayet/kelime sesi de durur — iki ses üst üste binmez
  //   NOT: stopAudio bileşende daha AŞAĞIDA tanımlı; dependency dizisine koyarsak
  //   TDZ hatası ("Cannot access before initialization") bütün siteyi çökertir.
  //   Closure lazy yakaladığı için çağrı anında tanımlı olur — deps'e koymuyoruz.
  // ★ Radyo aç/kapa: ayet sesiyle çakışmasın — radyo açılırken ayet/kelime sesi durur
  //   NOT: stopAudio bileşende daha AŞAĞIDA tanımlı; closure lazy çözümler, çağrı anında tanımlıdır.
  const toggleRadio = useCallback(() => {
    const r = radioRef.current;
    if (!r) return;
    if (radioOn) {
      radioTimerTemizle();
      radioHlsTemizle();
      r.pause();
      setRadioOn(false);
      setRadioNote("");
      setRadioPaused(false);
    } else {
      stopAudio();
      setIsPlaying(false);
      setRadioErr(false);
      setRadioNote("");
      radioFallbackRef.current = 0;
      r.volume = radioVol;
      r.muted = radioMuted;
      // kanal değiştirme efekti (radioIdx/radioOn) çalmayı üstlenir
      setRadioOn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioOn, radioVol, radioMuted]);
  // ★ DURDUR: akışı askıya al — kanal seçimi ve "RADYO AÇIK" durumu korunur
  //   HLS kanallarında (Diyanet) pause yeterli değil: hls.js segment indirmeye devam
  //   edebilir, bu yüzden akışı askıya almak için detach etmiyoruz — sadece pause.
  const pauseRadio = useCallback(() => {
    const r = radioRef.current;
    if (!r || !radioOn) return;
    radioTimerTemizle(); // 30 sn zaman aşımı dururken yanlışlıkla kanal değiştirmesin
    r.pause(); // HLS askıda kalabilir — hls.js durdurulmaz, resume devam eder
    setRadioPaused(true);
  }, [radioOn]);
  // ★ BAŞLAT: askıdaki kanal kaldığı yerden/kaynaktan devam eder
  //   HLS kanalı yeniden bağlanır (aynı kanal, aynı idx — hls.loadSource idempotent)
  const resumeRadio = useCallback(() => {
    const r = radioRef.current;
    if (!r || !radioOn) return;
    setRadioPaused(false);
    radioTimeoutRef.current = window.setTimeout(() => {
      if (r.paused || r.readyState < 2) radioFail("30 sn yanıt yok");
    }, 30_000);
    // HLS kanalında askı sonrası akış kopmuş olabilir — kanal useEffect'i yeniden tetikle
    const st = RADIO_STATIONS[radioIdx];
    if (st?.hls && Hls.isSupported() && radioHlsRef.current) {
      radioHlsRef.current.startLoad(); // hls.js: durdurulan akışı yeniden başlat
    }
    r.play().then(() => { radioFallbackRef.current = 0; }).catch(() => radioFail("play reddi"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioOn, radioIdx]);
  const radioFallbackRef = useRef(0); // otomatik kanal yedeği sayacı (sonsuz döngü koruması)
  const radioTimeoutRef = useRef<number | null>(null); // 30 sn yanıt zaman aşımı
  // ★ BAŞTAN DENEME sayacı: "↻ Tekrar dene" bunu artırır — kanal efekti yeniden koşar.
  //   radioIdx aynı kalsa bile (0. kanalda hata vb.) bağlantıyı sıfırdan kurmayı sağlar.
  const [radioRetryCount, setRadioRetryCount] = useState(0);
  const radioTimerTemizle = () => {
    if (radioTimeoutRef.current) { window.clearTimeout(radioTimeoutRef.current); radioTimeoutRef.current = null; }
  };
  // ★ OTOMATİK KANAL YEDEĞİ: bağlantı koparsa (play reddi, ağ hatası, 30 sn sessizlik)
  //   sıradaki kanalı dener — hepsi tükenirse kullanıcıya Tekrar dene butonu düşer.
  const radioFail = useCallback((neden: string) => {
    radioTimerTemizle();
    const r = radioRef.current;
    if (!r || !radioOn) return;
    if (radioFallbackRef.current < RADIO_STATIONS.length - 1) {
      radioFallbackRef.current += 1;
      const nextIdx = (radioIdx + radioFallbackRef.current) % RADIO_STATIONS.length;
      setRadioNote(`⚠️ Kanal yanıt vermedi — ${RADIO_STATIONS[nextIdx].ad} kanalına geçildi`);
      setRadioIdx(nextIdx);
    } else {
      // Tüm kanallar denendi — pes et, kullanıcıya bırak
      radioFallbackRef.current = 0;
      setRadioErr(true);
      setRadioNote("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioOn, radioIdx]);
  // ★ RADYO KAPANINCA HLS örneğini de temizle (arkada segment indirmesin)
  const radioHlsTemizle = () => {
    if (radioHlsRef.current) { radioHlsRef.current.destroy(); radioHlsRef.current = null; }
  };
  // ★ KÖPRÜ KAYDI: stopAudio (yukarıda) bu temizlikleri ref üzerinden çağırır —
  //   her render'da taze fonksiyonlar ref'e yazılır (stale closure yok).
  radioTimerTemizleRef.current = radioTimerTemizle;
  radioHlsTemizleRef.current = radioHlsTemizle;
  // Kanal değişince çal (hem kullanıcı hem otomatik yedek buradan geçer)
  useEffect(() => {
    const r = radioRef.current;
    if (!r || !radioOn) return;
    radioTimerTemizle();
    setRadioPaused(false); // kanal değişince askı iptal — yeni kanal direkt çalar
    // ★ HLS KANAL DESTEĞİ (Diyanet m3u8): hls.js varsa onunla bağla, yoksa Safari'ye bırak
    const st = RADIO_STATIONS[radioIdx];
    if (st.hls && Hls.isSupported()) {
      if (radioHlsRef.current) { radioHlsRef.current.destroy(); radioHlsRef.current = null; }
      const hls = new Hls({ lowLatencyMode: false, backBufferLength: 10 });
      radioHlsRef.current = hls;
      hls.attachMedia(r);
      hls.loadSource(st.url);
    } else {
      if (radioHlsRef.current) { radioHlsRef.current.destroy(); radioHlsRef.current = null; }
      r.src = st.url;
    }
    r.volume = radioVol;
    r.muted = radioMuted;
    // ★ 30 SN ZAMAN AŞIMI: sunucu bağlantıyı kabul edip ses basmazsa (zombi akış)
    //   sessiz kanalda donmak yerine sıradakine geç
    radioTimeoutRef.current = window.setTimeout(() => {
      if (r.paused || r.readyState < 2) radioFail("30 sn yanıt yok");
    }, 30_000);
    r.play().then(() => { radioFallbackRef.current = 0; setRadioErr(false); setRadioNote(""); }).catch(() => radioFail("play reddi"));
    return radioTimerTemizle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioIdx, radioOn, radioRetryCount]);
  // Ağ hatası olayı: akış ortasında koparsa otomatik yedeğe devret
  useEffect(() => {
    const r = radioRef.current;
    if (!r) return;
    const onErr = () => { if (radioOn) radioFail("ağ hatası"); };
    r.addEventListener("error", onErr);
    return () => r.removeEventListener("error", onErr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioOn, radioFail]);
  // Ses seviyesi / sessiz anında uygulanır
  useEffect(() => {
    const r = radioRef.current;
    if (!r) return;
    r.volume = radioVol;
    r.muted = radioMuted;
  }, [radioVol, radioMuted]);
  // ★ KÂBE CANLI AÇILINCA RADYO SUSSUN, kapanınca devam etsin
  //   HLS kanallarında (Diyanet) resume hls.startLoad() ister — resumeRadio ile aynı mantık.
  useEffect(() => {
    const r = radioRef.current;
    if (!r) return;
    if (kabeLive) {
      r.pause();
    } else if (radioOn && !radioPaused) {
      const st = RADIO_STATIONS[radioIdx];
      if (st?.hls && Hls.isSupported() && radioHlsRef.current) {
        radioHlsRef.current.startLoad(); // durdurulan HLS akışını yeniden bağla
      }
      r.play().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kabeLive]);
  // Modal kapanınca radyo da kapanır (arkada gizli ses kalmasın)
  useEffect(() => {
    if (!open) {
      radioTimerTemizle();
      radioHlsTemizle();
      radioRef.current?.pause();
      setRadioOn(false);
      setRadioNote("");
      setRadioPaused(false);
    }
  }, [open]);
  useEffect(() => () => { radioTimerTemizle(); radioHlsTemizle(); radioRef.current?.pause(); }, []);
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
  // ★ Mobil metin kaydırma alanı — hayalet ok butonları bunu kaydırır (sayfa sabit)
  const listenScrollRef = useRef<HTMLDivElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") audioRef.current = new Audio();
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
    setLoading(true); setError(null); setAyahs([]); setWords([]); setActiveWord(null);
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
        setLoading(false);
      })
      .catch(() => { if (live) { setError("Ayetler yüklenemedi. İnternet bağlantını kontrol et."); setLoading(false); } });
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
        let normIdx: Record<string, string> = WBW_NORM_IDX;
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
    setRadioOn(false); setRadioNote(""); setRadioPaused(false);
  }, []);

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
        const exact = WBW_NORM_IDX[n] ?? wbwKeys.find(x => x.n === n || x.na === na);
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
              <BookOpen size={13} /> Kur'an Öğreniyorum
            </button>
            <button onClick={() => { setMode("listen"); stopAudio(); }} className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold transition ${mode === "listen" ? "bg-gold text-slate-950" : "text-[#a8a184] hover:text-[#f5dda6]"}`}>
              <Headphones size={13} /> Kur'an Dinliyorum
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
          {/* ★ 📻 KUR'AN RADYOSU: üst barda — 7/24 kesintisiz tilavet radyosu */}
          <button onClick={toggleRadio} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition active:scale-95 ${radioOn ? "border-sky-400/60 bg-gradient-to-b from-sky-700/60 to-sky-950/60 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,.3)]" : "border-sky-800/40 bg-sky-950/40 text-sky-300 hover:brightness-125"}`} title="7/24 kesintisiz Kur'an radyosu — hoca seçenekli canlı tilavet">
            📻 {radioOn ? (radioPaused ? "RADYO DURDU" : "RADYO AÇIK") : "RADYO"}
          </button>
          {/* ★ KAPAT: en sağda — modalı kapatır (radyo açıkken bile) */}
          <button onClick={onClose} aria-label="Kapat" className="ml-1 flex items-center gap-1.5 rounded-xl border border-red-900/30 bg-red-950/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-900/60 active:scale-95" title="Kur'an ekranını kapat">
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
            🌍 {akilliAcik ? "AKILLI" : "TÜMÜ"}
          </button>
          <select
            value={radioIdx}
            onChange={(e) => { setRadioIdx(Number(e.target.value)); setRadioNote(""); setRadioErr(false); }} // manuel seçimde eski yedek uyarısını temizle
            className="max-w-52 shrink-0 rounded-lg border border-white/10 bg-[#0d1a2c] px-2 py-1 text-[11px] font-bold text-sky-100 outline-none"
            title="Radyo kanalı seç"
          >
            {siraliKanallar.map(i => <option key={RADIO_STATIONS[i].url} value={i}>{RADIO_STATIONS[i].ad}{akilliAcik && akilliBolge && RADIO_STATIONS[i].bolge === akilliBolge ? " ★" : ""}</option>)}
          </select>
          <span className={`hidden min-w-0 flex-1 truncate text-[10px] font-bold sm:block ${radioNote ? "text-amber-300" : radioPaused ? "text-white/50" : "text-sky-200/60"}`} title={radioNote || (radioPaused ? "DURDURULDU — başlatmak için ▶" : "CANLI TİLAVET — 7/24 kesintisiz")}>{radioNote || (radioPaused ? "⏸ DURDURULDU" : "CANLI TİLAVET — 7/24 kesintisiz")}</span>
          {radioErr ? (
            <button onClick={() => { // ★ BAŞTAN BAŞLAT: liste 1. kanaldan itibaren yeniden denenir
              radioFallbackRef.current = 0;
              setRadioErr(false);
              setRadioNote("🔄 Kanal listesi baştan deneniyor…");
              setRadioIdx(0);
              setRadioRetryCount(c => c + 1); // aynı kanalsa da efekti zorla tetikle
            }} className="rounded-lg bg-sky-500/20 px-2 py-1 text-[10px] font-black text-sky-200 hover:bg-sky-500/30" title="Tüm kanallar denendi — 1. kanaldan baştan dene">↻ Tekrar dene</button>
          ) : (
            <button onClick={() => (radioPaused ? resumeRadio() : pauseRadio())} className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition active:scale-95 ${radioPaused ? "bg-emerald-500/25 text-emerald-200 hover:bg-emerald-500/40" : "bg-amber-500/20 text-amber-200 hover:bg-amber-500/35"}`} title={radioPaused ? "Radyoyu başlat" : "Radyoyu durdur (kanal seçili kalır)"}>
              {radioPaused ? "▶ BAŞLAT" : "⏸ DURDUR"}
            </button>
          )}
          <button onClick={() => setRadioMuted(m => !m)} className="text-[13px] leading-none text-sky-100/90 transition hover:text-sky-300" title={radioMuted ? "Sesi aç" : "Sessize al"}>
            {radioMuted || radioVol === 0 ? "🔇" : radioVol < 0.5 ? "🔉" : "🔊"}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={radioMuted ? 0 : radioVol} onChange={(e) => { const v = Number(e.target.value); setRadioVol(v); setRadioMuted(v === 0); }} className="h-1 w-16 cursor-pointer accent-sky-400" title="Radyo ses seviyesi" />
          <button onClick={() => { radioTimerTemizle(); radioHlsTemizle(); radioRef.current?.pause(); setRadioOn(false); setRadioNote(""); }} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white" title="Radyoyu kapat">✕</button>
        </div>
      )}

      {/* ══════════ ÖĞREN MODU ══════════ */}
      {mode === "learn" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Arama + seçim barı */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#D7AA41]/20 bg-[#0d1a2c] px-4 py-2">
            <div className="relative min-w-48 flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#655f4c]" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Sure ara veya ayette kelime ara (rahmet, sabır, نور...)"
                className="h-8 w-full rounded-xl border border-white/10 bg-[#1E293B] pl-8 pr-3 text-[11px] outline-none placeholder:text-[#5a5443] focus:border-gold/50"
              />
              {searchOpen && (filteredSurahs.length > 0 || ayahResults.length > 0 || searching) && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-gold/30 bg-slate-900 p-1 shadow-2xl scrollbar-thin">
                  {filteredSurahs.length > 0 && (
                    <p className="px-2.5 pt-1.5 pb-1 text-[8px] font-black uppercase tracking-widest text-[#655f4c]">Sureler</p>
                  )}
                  {filteredSurahs.map(s => (
                    <button key={s.n} onClick={() => { setSurahNo(s.n); setQuery(""); setSearchOpen(false); setAyahResults([]); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition hover:bg-gold/10">
                      <span className="font-bold text-[#d8cfae]">{s.n}. {s.name} <span className="font-normal text-[#6e6853]">· {s.ayahs} ayet · {s.type}</span></span>
                      <span className="font-arabic text-sm text-gold-light">سورة {s.name}</span>
                    </button>
                  ))}
                  {(ayahResults.length > 0 || searching) && (
                    <p className="px-2.5 pt-2 pb-1 text-[8px] font-black uppercase tracking-widest text-[#655f4c]">{searching ? "Ayetler aranıyor…" : "Ayetlerde geçen kelimeler"}</p>
                  )}
                  {ayahResults.map((r, idx) => (
                    <button key={`${r.s}:${r.a}:${idx}`} onClick={() => { setSurahNo(r.s); setAyahNo(r.a); setActiveWord(null); setQuery(""); setSearchOpen(false); setAyahResults([]); }} className="flex w-full flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-gold/10">
                      <span className="text-[10px] font-bold text-gold">{r.s}. {r.sn} — {r.a}. ayet</span>
                      <span className="line-clamp-2 text-[10px] text-white/55" dir="auto">{r.text}…</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select value={surahNo} onChange={(e) => setSurahNo(Number(e.target.value))} className="h-8 max-w-44 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
            </select>
            <select value={ayahNo} onChange={(e) => { setAyahNo(Number(e.target.value)); setActiveWord(null); }} className="h-8 max-w-36 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {Array.from({ length: surah.ayahs }, (_, i) => <option key={i + 1} value={i + 1}>Ayet {i + 1}</option>)}
            </select>
            <select value={mealId} onChange={(e) => setMealId(e.target.value)} className="h-8 max-w-48 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold outline-none focus:border-gold/50">
              {MEALS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={reciter} onChange={(e) => setReciter(e.target.value)} className="h-8 max-w-56 rounded-xl border border-white/10 bg-[#1E293B] px-2 text-[11px] font-semibold text-gold-light outline-none focus:border-gold/50">
              {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* 3 kolon */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[12px] text-[#8f8870]"><Loader2 size={16} className="animate-spin" /> Ayetler yükleniyor…</div>
            ) : error ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="text-[12px] text-red-400">{error}</p>
                <button onClick={() => setSurahNo(surahNo)} className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-bold text-gold">Tekrar Dene</button>
              </div>
            ) : (
              <>
                {/* SOL: Ayetin Bütünü + Kelime Kartı + Meal — prototip düzeni */}
                <div className="flex w-full flex-col gap-4 overflow-y-auto border-white/10 p-4 lg:w-[28%] lg:border-r scrollbar-thin">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gold">Mahrec & Arapça Okuyuş</h3>
                  <div className="rounded-2xl border border-white/10 bg-[#161622] p-4 text-center">
                    <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-[#6e6853]">Ayetin Bütünü (Sol)</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="rtl">
                      {(words.length > 0 ? words.map(w => w.ar) : (ayah?.ar ?? "").split(/\s+/)).map((ar, i) => (
                        <button key={i} onClick={() => { if (words.length > 0) clickWord(Math.min(i, words.length - 1)); }} className={`rounded-md px-1 font-arabic text-base leading-loose transition-all active:scale-95 ${activeWord === i ? "scale-110 bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_16px_rgba(245,221,166,.7)]" : "text-[#d8cfae] hover:bg-gold/15 hover:text-[#f5dda6]"}`}>{ar}</button>
                      ))}
                    </div>
                    <p className="mt-2 text-[8px] italic text-[#655f4c]">"Soldaki veya ortadaki kelimelerden dilediğinize tıklayabilirsiniz; ikisi de eşzamanlı olarak parlayıp çalacaktır!"</p>
                  </div>

                  {/* Kelime Kartı — ★ KALDIRILDI: kelime anlamları 3 ayrı yerde gösteriliyordu,
                      artık SADECE sağdaki "Kelime Kelime Çözüm" listesinde (bire düşürüldü).
                      Tekrar oku → sağ listedeki 🔊 butonuyla aynı işi görüyor. */}

                  {/* Meal — ★ Karşılaştırmalı okuma (madde 55): iki meal yan yana */}
                  <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">Ayet Meali</span>
                      <button onClick={() => setKarsilastirmaAcik(!karsilastirmaAcik)} className={`rounded-lg px-2 py-1 text-[8.5px] font-black transition ${karsilastirmaAcik ? "bg-[#D7AA41] text-[#151020]" : "bg-white/5 text-[#8f8870] hover:text-[#f5dda6]"}`} title="İki meali yan yana karşılaştır (Diyanet + Elmalılı)">
                        ⇔ Karşılaştır
                      </button>
                    </div>
                    {karsilastirmaAcik ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-white/[.04] p-2.5">
                          <p className="mb-1 text-[8px] font-black uppercase tracking-wider text-gold/70">{MEALS.find(m => m.id === mealId)?.name}</p>
                          <p className="text-[11px] leading-relaxed text-[#c5bc9a]">{ayah?.tr}</p>
                        </div>
                        <div className="rounded-xl bg-white/[.04] p-2.5">
                          <select value={karsiMealId} onChange={(e) => setKarsiMealId(e.target.value)} className="mb-1 w-full rounded-lg bg-[#0d1626] px-1.5 py-1 text-[8.5px] font-bold text-[#d8cfae] outline-none">
                            {MEALS.filter(m => m.id !== mealId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <p className="text-[11px] leading-relaxed text-[#c5bc9a]" dir={karsiMealId.startsWith("tr") ? "ltr" : "auto"}>{karsiMetin || "…"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-[12px] leading-relaxed text-[#c5bc9a]">{ayah?.tr}</p>
                    )}
                    <span className="mt-2 block text-right text-[8px] font-bold text-[#5a5443]">Kaynak: {MEALS.find(m => m.id === mealId)?.name}</span>
                  </div>

                  {/* ★ TEFSİR: İbn Kesîr (Türkçe çeviri; yüklenince görünür) */}
                  <TafsirBox surahNo={surahNo} ayahNo={ayahNo} />

                  {/* ★ SURE AYETLERİ LİSTESİ (soldaki) — ★ KALDIRILDI: ortadaki
                      "Suredeki Ayetler" listesiyle mükerrerdi. Ortadaki kalsın. */}
                </div>

                {/* ORTA: prototip düzeni — ayet kartı (içinde kontroller) + kelime analizi */}
                <div data-ayah-scroll className="flex w-full flex-col items-center gap-4 overflow-y-auto border-white/10 p-4 lg:w-[47%] lg:border-r scrollbar-thin">
                  <p className="self-start text-[8px] font-black uppercase tracking-widest text-[#655f4c]">Kelime Seçim Alanı</p>
                  <div className="w-full rounded-3xl border border-white/10 bg-[#131322] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-20 shrink-0" />
                      <div className="text-center">
                        <h4 className="font-arabic text-sm text-[#f5dda6]">سُورَةُ {surah.name}</h4>
                        <p className="mt-0.5 font-mono text-[10px] text-[#7a745f]">{surah.n}. {surah.name} Suresi — {ayahNo}. Ayet · {surah.type} · Cüz {ayah?.juz} · Sayfa {ayah?.page}</p>
                      </div>
                      <div className="w-20 shrink-0 text-right">
                        <p className="text-[9px] font-black tracking-widest text-gold">NURSTUDYO</p>
                        <p className="text-[8px] text-[#7a745f]">{surah.name} suresi</p>
                      </div>
                    </div>
                    {/* Kelimeler */}
                    <div className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 p-3">
                      {wordLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4"><Loader2 size={18} className="animate-spin text-[#D7AA41]" /> <span className="text-[11px] text-[#7a745f]">kelimeler yükleniyor…</span></div>
                      ) : words.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2" dir="rtl">
                          {words.map((w) => (
                            <button
                              key={w.i}
                              onClick={() => clickWord(w.i)}
                              className={`rounded-lg px-2 py-1 font-arabic text-xl leading-relaxed transition-all active:scale-95 ${activeWord === w.i ? "scale-110 rounded-lg bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_34px_rgba(245,221,166,.8)] ring-2 ring-[#f5dda6]" : "text-[#e8dfc0] hover:bg-gold/20 hover:text-[#f5dda6] hover:shadow-[0_0_14px_rgba(215,170,82,.35)]"}`}
                            >
                              {w.ar}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center font-arabic text-xl leading-relaxed text-[#e8dfc0]" dir="rtl">{ayah?.ar}</p>
                      )}
                    </div>

                    {/* ★ KONTROLLER — sol ok · DONDUR/BAŞLAT · sağ ok (prototip düzeni) */}
                    <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2">
                      {/* ★ SOL OK — önceki ayete gider, tıklayınca hemen okur */}
                      <button onClick={prevAyahLearn} disabled={ayahNo <= 1} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[15px] font-black text-[#f5dda6] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-90 disabled:opacity-30" title="Önceki ayet">
                        ◀
                      </button>
                      {/* ★ ORTADA BÜYÜK DONDUR/BAŞLAT düğmesi */}
                      {(() => {
                        const audio = audioRef.current;
                        const showPause = isPlaying && !paused;
                        return (
                          <button
                            onClick={() => { if (showPause) pauseAyah(); else if (paused) resumeAyah(); else { setPaused(false); setFlowPlaying(true); playAyahAudio(); } }}
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-black transition active:scale-90 ${showPause ? "bg-[#D7AA41] text-[#151020] shadow-[0_0_18px_rgba(215,170,82,.45)] hover:brightness-110" : "bg-[#D7AA41] text-[#151020] shadow-[0_0_18px_rgba(215,170,82,.45)] ring-2 ring-[#f5dda6]/70 hover:brightness-110"}`}
                            title={showPause ? "Dondur" : paused ? "Devam et" : "Başlat"}
                          >
                            {showPause ? "⏸" : "▶"}
                          </button>
                        );
                      })()}
                      {/* ★ SAĞ OK — sonraki ayete gider, tıklayınca hemen okur */}
                      <button onClick={nextAyahLearn} disabled={ayahNo >= surah.ayahs} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-[15px] font-black text-[#f5dda6] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-90 disabled:opacity-30" title="Sonraki ayet">
                        ▶
                      </button>
                      {/* ★ 5 SN SARMA */}
                      <button onClick={() => seekAyah(-5)} disabled={!isPlaying} className="rounded-lg bg-[#1E293B] px-2 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95 disabled:opacity-40" title="5 saniye geri sar">
                        ⏪5sn
                      </button>
                      <button onClick={() => seekAyah(5)} disabled={!isPlaying} className="rounded-lg bg-[#1E293B] px-2 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95 disabled:opacity-40" title="5 saniye ileri sar">
                        5sn⏩
                      </button>
                      <button onClick={replayAyah} className="flex items-center gap-1.5 rounded-lg bg-[#1E293B] px-2.5 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95">
                        <RotateCcw size={10} /> Tekrar
                      </button>
                      <button onClick={stopAyahPlayback} className="rounded-lg bg-[#1E293B] px-2.5 py-1.5 text-[9px] font-bold text-[#cfc6a4] ring-1 ring-white/10 transition hover:bg-[#243449] active:scale-95">
                        Sıfırla
                      </button>
                      <div className="ml-1 flex items-center gap-0.5 rounded-lg bg-black/30 p-0.5 text-[9px] font-bold">
                        {[0.8, 1, 1.2].map(v => (
                          <button key={v} onClick={() => setSpeed(v)} className={`rounded px-2 py-0.5 transition ${speed === v ? "bg-[#D7AA41] text-[#151020]" : "text-[#8f8870] hover:text-[#f5dda6]"}`}>{v}x</button>
                        ))}
                      </div>
                      {/* ★ LATİN OKUNUŞ düğmesi (madde 43) — Arapça bilmeyenler için */}
                      <button onClick={() => setLatinAcik(!latinAcik)} className={`ml-1 rounded-lg px-2 py-1.5 text-[9px] font-black transition ${latinAcik ? "bg-[#D7AA41] text-[#151020]" : "bg-[#1E293B] text-[#cfc6a4] ring-1 ring-white/10 hover:bg-[#243449]"}`} title="Ayet altında latin okunuşunu göster/gizle (Bismillahirrahmanirrahim şeklinde)">
                        Aa Latin
                      </button>
                      {/* ★ MUSHAF GÖRÜNÜMÜ (madde 29) — satırlı liste ↔ gerçek mushaf sayfası akışı */}
                      <button onClick={() => setMushafModu(!mushafModu)} className={`ml-1 rounded-lg px-2 py-1.5 text-[9px] font-black transition ${mushafModu ? "bg-[#D7AA41] text-[#151020]" : "bg-[#1E293B] text-[#cfc6a4] ring-1 ring-white/10 hover:bg-[#243449]"}`} title="Mushaf görünümü: ayetler gerçek mushaf sayfası gibi tek blok, ayet numaraları altın daire içinde">
                        📖 Mushaf
                      </button>
                    </div>
                    {/* Hoca seçici — kontrollerin altında, prototipteki gibi */}
                    <div className="mt-3 flex w-full justify-center">
                      <select value={reciter} onChange={(e) => setReciter(e.target.value)} className="h-7 max-w-44 rounded-lg border border-white/10 bg-[#1E293B] px-2 text-[10px] font-bold text-[#d8cfae] outline-none focus:border-[#D7AA41]/60">
                        {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* ★ KELİME ANALİZ PANELİ — ★ KALDIRILDI: kelime anlamı artık SADECE
                      sağdaki "Kelime Kelime Çözüm" listesinde (3 panel → 1 panel) */}

                  {/* ★ SURENİN TAMAMI — ~7 ayet görünür, okunan yanar, akışla kayar, tıklayınca o ayet okunur */}
                  <div className={`w-full rounded-2xl border border-white/10 p-3 ${mushafModu ? "bg-[#F5EDD8]" : "bg-[#161622]"}`}>
                    <p className={`mb-2 text-center text-[9px] font-bold uppercase tracking-widest ${mushafModu ? "text-[#8a7440]" : "text-[#6e6853]"}`}>
                      {mushafModu ? "📖 Mushaf Görünümü — gerçek sayfa düzeni, ayet numarası altın dairede" : "Suredeki Ayetler — okunan yanar, birine tıklarsan o okunur"}
                    </p>
                    {mushafModu ? (
                      /* ★ MUSHAF SAYFASI — ayetler tek blok, sonraki ayete doğal akış; tıklanan ayet yanar */
                      <div ref={centerListRef} className="max-h-[340px] overflow-y-auto rounded-xl bg-[#F5EDD8] px-4 py-3 scrollbar-thin shadow-inner" style={{ backgroundImage: "linear-gradient(rgba(138,116,64,.06) 1px, transparent 1px)", backgroundSize: "100% 2.4rem" }}>
                        <p className="mb-2 text-center font-arabic text-base font-bold text-[#8a7440]" dir="rtl">﴿﷽﴾</p>
                        <p className="text-right font-arabic text-[17px] leading-[2.4] text-[#2c2416]" dir="rtl">
                          {ayahs.map(a => (
                            <span
                              key={a.n}
                              data-current={a.n === ayahNo || undefined}
                              onClick={() => { setFlowPlaying(false); setAyahNo(a.n); setActiveWord(null); setTimeout(() => playAyahRef.current(), 350); }}
                              className={`cursor-pointer transition ${a.n === ayahNo ? "rounded bg-[#D7AA41]/25 text-[#8a5a10] shadow-[0_0_10px_rgba(215,170,65,.4)]" : "hover:bg-[#D7AA41]/10"}`}
                            >
                              {a.ar}
                              <span className="mx-1.5 inline-flex h-5 w-5 translate-y-0.5 items-center justify-center rounded-full border border-[#b08d3e] align-middle text-[9px] font-black text-[#8a5a10]" dir="ltr">{a.n}</span>
                              {" "}
                            </span>
                          ))}
                        </p>
                        {latinAcik && (
                          <p className="mt-2 border-t border-[#d8c69a] pt-2 text-center text-[9px] italic text-[#8a7440]" dir="ltr">
                            Latin okunuşu mushaf görünümünde gizlidir — satır görünümüne geç
                          </p>
                        )}
                      </div>
                    ) : (
                      <div ref={centerListRef} className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto scrollbar-thin">
                        {ayahs.map(a => (
                          <React.Fragment key={a.n}>
                          <button data-current={a.n === ayahNo || undefined} onClick={() => { setFlowPlaying(false); setAyahNo(a.n); setActiveWord(null); setTimeout(() => playAyahRef.current(), 350); }} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-right transition ${a.n === ayahNo ? "bg-[#3D342B] ring-1 ring-[#D7AA41]/60 shadow-[0_0_14px_rgba(215,170,82,.25)]" : "hover:bg-white/[.04]"}`}>
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${a.n === ayahNo ? "bg-[#D7AA41] text-[#151020]" : "bg-white/10 text-[#8f8870]"}`} dir="ltr">{a.n}</span>
                            <span className={`flex-1 truncate font-arabic text-sm leading-relaxed ${a.n === ayahNo ? "text-[#f5dda6]" : "text-[#b8b093]"}`} dir="rtl">{a.ar}</span>
                          </button>
                          {latinAcik && translit[a.n] && (
                            <p className="-mt-1 px-3 pb-1.5 pl-12 text-left text-[9px] italic leading-relaxed text-[#9a927a]" dir="ltr">{translit[a.n]}</p>
                          )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SAĞ: kelime tablosu */}
                <div className="flex w-full flex-col overflow-y-auto p-4 lg:w-[25%] scrollbar-thin">
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-gold">Kelime Kelime Çözüm</h3>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#161622]">
                    {wordLoading ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-[11px] text-[#7a745f]"><Loader2 size={13} className="animate-spin" /> kelimeler…</div>
                    ) : words.map((w, i) => (
                      <div key={w.i} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 transition last:border-0 ${activeWord === i ? "bg-[#3D342B] ring-1 ring-inset ring-[#D7AA41]/60" : "hover:bg-white/[.04]"}`}>
                        <button onClick={() => clickWord(i)} className="flex flex-1 items-center gap-2 text-left min-w-0">
                          <span className={`w-5 text-[9px] font-black ${activeWord === i ? "text-[#f5dda6]" : "text-[#655f4c]"}`}>{i + 1}</span>
                          <span className={`flex-1 truncate text-[10px] font-bold ${activeWord === i ? "text-[#f5dda6]" : "text-[#c5bc9a]"}`}>{w.tr}</span>
                          <span className="font-arabic text-lg text-[#f5dda6]">{w.ar}</span>
                        </button>
                        {/* ★ TEKRAR OKU (🔊): kelimeyi TEKRAR TEKRAR okumak için ayrı buton —
                            tıklayınca sadece o kelime çalar (kelime anlamlarının yanına küçük buton) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveWord(i); playWordAudio(i); }}
                          className="shrink-0 rounded-md bg-gold/15 px-1.5 py-1 text-[10px] text-[#f5dda6] transition hover:bg-gold/30 active:scale-90"
                          title="Bu kelimeyi tekrar oku"
                        >🔊</button>
                      </div>
                    ))}
                  </div>
                  {/* Kaynak referansı */}
                  <div className="mt-3 rounded-2xl border border-white/10 bg-[#161622] p-3 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gold">Resmî Sahih Kaynak Referansı</p>
                    <p className="mt-1 text-[9px] font-bold text-[#b8b093]">T.C. Diyanet İşleri Başkanlığı</p>
                    <p className="mt-0.5 text-[8px] text-[#6e6853]">Mealler: Diyanet · Elmalılı (2 versiyon) · Gölpınarlı · Yıldırım · Bulaç · Ateş — Kelime kökleri: Kur'an'ın tamamı (15.321 kök, Diyanet WbW) — Ses: everyayah.com</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════ DİNLE MODU ══════════ */}
      {mode === "listen" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4 scrollbar-thin">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#161622] p-4 sm:p-7 shadow-2xl mx-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold">Kesintisiz Ayet Ayet Oynatıcı</span>
            {/* ★ SAHİH HADİS: seçili sureyle ilgili Buhârî/Müslim kaynaklı hadis */}
            {(() => {
              const h = getSurahHadith(listenSurah);
              if (!h) return null;
              return (
                <div className="mt-3 rounded-xl border border-gold/25 bg-[#14110a] p-3">
                  <p className="text-[10px] font-black text-[#f5dda6]">📖 {h.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#b8b093]" dir="auto">{h.desc}</p>
                  <p className="mt-1.5 text-[8px] font-bold uppercase tracking-widest text-gold/60">Kaynak: {h.source}</p>
                </div>
              );
            })()}
            {/* ★ DİNLEME KAPSAMI */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={() => { setWholeQuran(false); setNextSurahAuto(false); stopListening(); setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!wholeQuran && !nextSurahAuto ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`}>Tek Sure</button>
              <button onClick={() => { setWholeQuran(false); setNextSurahAuto(true); stopListening(); setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${!wholeQuran && nextSurahAuto ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Seçtiğin sure bitince sıradaki sureye otomatik geçer">Sıradaki Sureye Geç</button>
              <button onClick={() => { setWholeQuran(true); stopListening(); setFullSurahMode(false); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${wholeQuran ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Seçtiğin sureden Nâs'a, sureler arası kesintisiz">📖 KOMPLE KUR'AN</button>
              {/* ★ ÇOKLU HOCA KARIŞIK (madde 65) — komple Kur'an modunda her sure farklı hoca */}
              <button onClick={() => { setKarisikHoca(v => !v); stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${karisikHoca ? "border-sky-500/40 bg-sky-950/40 text-sky-300" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Hatim karışık hocalarla: komple Kur'an modunda her sureyi farklı bir hoca okur">🎤 KARIŞIK HOCA</button>
              {/* ★ TAM SURE: tek dosya gapless sure kaydı (mp3quran.net) — kesintisiz sure dinleme */}
              <button onClick={() => { setFullSurahMode(v => !v); setWholeQuran(false); stopListening(); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${fullSurahMode ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Sureyi tek dosyadan kesintisiz (gapless) dinle — ayet aralarında bekleme yok">🎵 TAM SURE (kesintisiz)</button>
              {/* ★ KÂBE CANLI: Mescid-i Haram 7/24 canlı yayın (YouTube embed) */}
              <button onClick={() => setKabeLive(true)} className="rounded-xl border border-emerald-900/30 bg-emerald-950/40 px-3 py-1.5 text-[10px] font-black text-emerald-300 transition hover:brightness-125" title="Mescid-i Haram'dan 7/24 canlı yayın">🕋 KÂBE CANLI</button>
              {/* ★ EKRANSIZ MEAL DİNLEME: ekran kararır, sadece ses; kilit ekranı kontrolleri aktif */}
              <button onClick={() => { setEkransizMod(v => !v); }} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${ekransizMod ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Gözlerini kapat, sadece dinle — ekran kararır, kilit ekranından kontrol edersin">🎧 EKRANSIZ DİNLEME</button>
              {/* ★ UYKU TİLAVETİ: seçilen süre sonunda ses kendiliğinden durur */}
              <button onClick={() => setUykuMenu(v => !v)} className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${uykuTimer ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300" : "border-white/10 bg-white/[.04] text-[#8f8870]"}`} title="Yatarken dinle: süre dolunca ses kendiliğinden durur">🌙 UYKU TİLAVETİ{uykuKalan !== null ? ` · ${Math.floor(uykuKalan / 60)}:${String(uykuKalan % 60).padStart(2, "0")}` : ""}</button>
              {uykuMenu && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-2">
                  <span className="text-[9px] font-bold text-white/50">Süre dolunca ses durur:</span>
                  {[15, 30, 45, 60, 90, 120].map((dk) => (
                    <button key={dk} onClick={() => kurUykuZamanlayici(dk)} className="rounded-lg bg-white/10 px-2.5 py-1 text-[9px] font-black text-indigo-200 transition hover:bg-indigo-500/30">{dk} dk</button>
                  ))}
                  {uykuTimer !== null && (
                    <button onClick={() => kurUykuZamanlayici(null)} className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[9px] font-black text-red-300 transition hover:bg-red-500/30">İptal</button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a745f]">Sure</span>
                {/* ★ Sure değişimi: ayet konumu ve besmele hakkı SIFIRLANIR — eskiden
                    listenAyahIdx eski sureden kalıyordu, play'e basınca besmelesiz
                    2-3. ayetten başlıyordu (canlı testte kanıtlandı) */}
                <span className="flex gap-1.5">
                  <select value={listenSurah} onChange={(e) => { setListenSurah(Number(e.target.value)); setListenAyahIdx(0); besmeleCalindiRef.current = 0; stopListening(); }} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1E293B] px-3 py-2.5 text-[12px] font-semibold outline-none focus:border-gold/50">
                    {SURAHS_DATA.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name} ({s.ayahs} ayet)</option>)}
                  </select>
                  {/* ★ BAŞINDAN BAŞLA (29.09, kullanıcı isteği): besmele hakkını sıfırla →
                      kullanıcı isterse TEKRAR besmeleyle başlasın. Tek besmele kuralı
                      (pause→play'de besmele tekrarı) bozulmaz — bu düğme bilinçli
                      sıfırlama olduğundan ertesi çalmada besmele HAKKINI yeniden verir. */}
                  <button
                    type="button"
                    onClick={() => { setListenAyahIdx(0); besmeleCalindiRef.current = 0; stopListening(); }}
                    className="shrink-0 rounded-xl border border-gold/40 bg-gold/10 px-2.5 py-2.5 text-[10px] font-black text-gold transition hover:bg-gold/20 active:scale-95"
                    title={`${SURAHS_DATA.find(s => s.n === listenSurah)?.name ?? "Sure"} başından, besmeleyle başla`}
                  >
                    ⟲ Başından
                  </button>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase text-[#7a745f]">Okuyan Hoca (Kari) — {reciterSearch.trim() ? `${filteredReciters.length} bulundu` : `${RECITERS.length} kari`}</span>
                <input
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  placeholder="Hoca ara (mahir, husari, minşavi...)"
                  className="h-8 w-full rounded-xl border border-white/10 bg-[#1E293B] px-3 text-[11px] outline-none placeholder:text-[#5a5443] focus:border-gold/50"
                />
                <div className="h-44 overflow-y-auto rounded-xl border border-white/10 bg-[#1E293B] scrollbar-thin">
                  {filteredReciters.length === 0 ? (
                    <p className="p-3 text-center text-[10px] text-[#6e6853]">Bu isimle kari bulunamadı.</p>
                  ) : filteredReciters.map(r => {
                    // ★ KİLİT: admin panelinden konan hoca kilidi (maher→maintenance gibi).
                    //   Panel kısa id (maher) kullanır; buradaki kari id'si uzun
                    //   (MaherAlMuaiqly128kbps) — full[0] alanı kısa id'yi taşır.
                    const kisaId = r.full?.[0] ?? r.id;
                    const lock = getFeatureLock(kisaId, "free") || getFeatureLock(r.id, "free");
                    const locked = lock === "maintenance" || lock === "off" || lock === "v2" || lock === "v3";
                    const lockLabel = lock === "maintenance" || lock === "off" ? "🔧 BAKIMDA" : locked ? "🔒 GÜNCELLEME" : "";
                    return (
                    <button key={r.id} disabled={locked} onClick={() => { if (locked) return; setListenReciter(r.id); besmeleCalindiRef.current = 0; stopListening(); }} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left text-[11px] transition last:border-0 ${locked ? "cursor-not-allowed opacity-45" : listenReciter === r.id ? "bg-gold/15 text-gold hover:bg-white/[.05]" : "text-[#b8b093] hover:bg-white/[.05]"}`} title={locked ? "Bu kâri şu anda bakımda / güncellemede — kısa süre içinde dönecek" : undefined}>
                      <span className="truncate font-semibold">{r.name}{locked && <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-black text-white/70">{lockLabel}</span>}</span>
                      {listenReciter === r.id && !locked && <span className="text-[9px] font-black">✓ SEÇİLİ</span>}
                    </button>
                    );
                  })}
                </div>
              </label>
            </div>

            {/* ★ OKUNAN AYET EKRANI — arkasında yıldız takımyıldızı şablonu (R2),
                üstünde karartma perdesi + Arapça büyük + meal; kelimeler okundukça altın yanar */}
            <div
              className="relative mt-4 flex min-h-[190px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-gold/20 p-5 text-center shadow-[0_0_24px_rgba(215,170,82,.08)]"
              style={{
                backgroundImage: "url('https://cdn.nurstudyo.com/templates/takimyildiz/81310.jpg'), linear-gradient(180deg,#161622,#12101c)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Karartma perdesi — yazılar her zaman okunaklı kalsın */}
              <div className="pointer-events-none absolute inset-0 bg-[#0d0b16]/72" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0b16]/85 via-transparent to-[#0d0b16]/40" />
              <div className="relative z-10 flex w-full flex-col items-center gap-3">
                {isPlaying && listenAyahData ? (
                  <>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold/70">♪ Çalıyor — {besmelePlaying ? "BESMELE" : fullSurahMode ? "TAM SURE (kesintisiz)" : wholeQuran ? "KOMPLE KUR'AN" : nextSurahAuto ? "SIRADAKİ SURE" : "TEK SURE"} · {besmelePlaying ? "Sure Başlangıcı" : `${listenAyahData.n}. Ayet`}</span>
                    {/* ★ MOBİL KAYDIRMA: uzun ayet ekrana sığmayınca parmakla sayfayı oynatmak yerine
                        buradaki hayalet oklarla ARAPÇA + MEAL birlikte kaydırılır (sayfa sabit kalır).
                        Masaüstünde fare kartın üstüne gelince oklar belirir, çekince kaybolur. */}
                    <div className="group relative w-full">
                      <div ref={listenScrollRef} className="listen-ayah-scroll max-h-[46vh] overflow-y-auto scroll-smooth px-1 scrollbar-thin">
                        <div className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1" dir="rtl">
                          {listenAyahData.ar.split(/\s+/).filter(Boolean).map((wd, i) => (
                            <span key={i} className={`rounded px-1 font-arabic text-xl leading-loose transition-all duration-200 ${i === listenWordProgress ? "scale-110 bg-[#D7AA41] font-black text-[#151020] shadow-[0_0_16px_rgba(245,221,166,.8)] ring-2 ring-[#f5dda6]" : i < listenWordProgress ? "text-[#f5dda6]/60" : "text-[#e8dfc0]"}`}>{wd}</span>
                          ))}
                        </div>
                        <p className="mt-1 max-w-xl text-[11px] italic leading-relaxed text-[#c9c0a0]" dir="auto">“{listenAyahData.tr}”</p>
                      </div>
                      {/* Hayalet oklar: yukarı — besmelede gerek yok ama zararsız */}
                      {!besmelePlaying && (
                      <button
                        type="button"
                        onClick={() => listenScrollRef.current?.scrollBy({ top: -120, behavior: "smooth" })}
                        className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-[#0d0b16]/60 p-1.5 text-gold/80 opacity-0 shadow transition group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-70"
                        title="Metni yukarı kaydır"
                      >▲</button>
                      )}
                      {/* Hayalet oklar: aşağı */}
                      {!besmelePlaying && (
                      <button
                        type="button"
                        onClick={() => listenScrollRef.current?.scrollBy({ top: 120, behavior: "smooth" })}
                        className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-[#0d0b16]/60 p-1.5 text-gold/80 opacity-0 shadow transition group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 max-md:opacity-70"
                        title="Metni aşağı kaydır"
                      >▼</button>
                      )}
                    </div>
                  </>
                ) : isPlaying ? (
                  <div className="flex items-center gap-2 py-4"><Loader2 size={14} className="animate-spin text-gold" /> <span className="text-[11px] text-[#b8b093]">ayet yükleniyor…</span></div>
                ) : (
                  <p className="text-[11px] text-[#8f8870]">Başlat'a bas — sure, seçtiğin hoca sesiyle okunur.</p>
                )}
              </div>
            </div>

            {/* Kontroller */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#1E293B] p-0.5 text-[9px] font-bold">
                {[0.75, 1, 1.25, 1.5].map(v => (
                  <button key={v} onClick={() => { setSpeed(v); if (audioRef.current) audioRef.current.playbackRate = v; }} className={`rounded px-2 py-0.5 transition ${speed === v ? "bg-gold text-slate-950" : "text-[#8f8870] hover:text-[#f5dda6]"}`}>{v}x</button>
                ))}
              </div>
              {/* Uyku modu mevcut kurUykuZamanlayici ile çalışıyor (UI zaten var) */}
              <div className="flex items-center gap-3">
                <button onClick={() => startListening(Math.max(0, listenAyahIdx - 1))} className="rounded-full bg-white/[.06] p-2.5 text-[#b8b093] transition hover:bg-white/10 active:scale-95" title="Önceki ayet">⏮</button>
                {isPlaying ? (
                  <button onClick={stopListening} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Pause size={22} /></button>
                ) : (
                  <button onClick={() => startListening(listenAyahIdx)} className="rounded-full bg-gold p-4 text-slate-950 shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-90"><Play size={22} /></button>
                )}
                <button onClick={() => startListening(Math.min(listenSurahInfo.ayahs - 1, listenAyahIdx + 1))} className="rounded-full bg-white/[.06] p-2.5 text-[#b8b093] transition hover:bg-white/10 active:scale-95" title="Sonraki ayet">⏭</button>
              </div>
              <button onClick={() => setLoopAyahListen(v => !v)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black transition ${loopAyahListen ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400" : "border-white/10 bg-white/[.04] text-[#7a745f]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${loopAyahListen ? "animate-pulse bg-emerald-400" : "bg-white/30"}`} />
                AYET DÖNGÜSÜ {loopAyahListen ? "AÇIK" : "KAPALI"}
              </button>
            </div>
            <p className="mt-3 text-center text-[8px] font-bold uppercase tracking-widest text-[#5a5443]">{RECITERS.length} kari · ayet ayet akış · Komple Kur'an: 6236 ayet · kaynak: everyayah.com (telifsiz paylaşım izinli)</p>
          </div>
        </div>
      )}

      {/* ══════════ KÂBE CANLI YAYIN — SRP 01.10: KabeCanliModal.tsx */}
      <KabeCanliModal open={kabeLive} onClose={() => setKabeLive(false)} />
    </div>
  );
};

export default QuranLearnModal;
