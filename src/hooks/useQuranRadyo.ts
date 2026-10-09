// ════════════════════════════════════════════════════════
// USEQURANRADYO.TS — QuranLearnModal'dan taşındı (SRP parçalama, 09.10)
// ★ Radyo motoru: 7/24 Kur'an radyosu — akilli bölge + HLS (Diyanet m3u8)
//   + otomatik kanal yedeği + 30 sn zaman aşımı + Kâbe canlılık köprüsü.
//   Tüm ses mantığı burada toplanır; bileşen yalnız state + UI taşır.
// Dışa açık imzası bileşendeki eski adlarla birebir aynıdır.
// ════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { RADIO_STATIONS, ulkeToBolge, dilToBolge, type RadioBolge } from "../data/liveStreams";

export interface UseQuranRadyoParams {
  /** Modal açık mı — kapalıyken radyo arkada ses bırakmaz */
  open: boolean;
  /** Kâbe canlı yayın açıldı → radyo sussun, kapandı → devam etsin */
  kabeLive: boolean;
  /** Ayet sesi çalarken radyo durdurulsun — bileşen stopAudio'dan çağırır */
  stopAudio: () => void;
  setIsPlaying: (v: boolean) => void;
}

export function useQuranRadyo({ open, kabeLive, stopAudio, setIsPlaying }: UseQuranRadyoParams) {
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

  useEffect(() => { radioOn; return; }, [radioOn]); // (linter referans koruması)

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

  // ★ Radyo çalarken ayet/kelime sesi de durur — iki ses üst üste binmez
  //   NOT: stopAudio bileşende daha AŞAĞIDA tanımlı; dependency dizisine koyarsak
  //   TDZ hatası ("Cannot access before initialization") bütün siteyi çökertir.
  //   Closure lazy yakaladığı için çağrı anında tanımlı olur — deps'e koymuyoruz.
  // ★ Radyo aç/kapa: ayet sesiyle çakışmasın — radyo açılırken ayet/kelime sesi durur
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

  /** Radyoyu tamamen kapat butonu (padel/UI'da ✕) */
  const radyoKapat = () => {
    radioTimerTemizle();
    radioHlsTemizle();
    radioRef.current?.pause();
    setRadioOn(false);
    setRadioNote("");
  };

  return {
    // state
    radioOn, setRadioOn, radioIdx, setRadioIdx,
    radioVol, setRadioVol, radioMuted, setRadioMuted,
    radioErr, setRadioErr, radioNote, setRadioNote,
    radioPaused, setRadioPaused,
    radioRetryCount, setRadioRetryCount,
    siraliKanallar,
    akilliBolge, setAkilliBolge, akilliAcik, setAkilliAcik,
    // refs + motor
    radioRef, radioHlsRef,
    radioTimerTemizleRef, radioHlsTemizleRef,
    radioTimerTemizle, radioHlsTemizle, radioFail,
    toggleRadio, pauseRadio, resumeRadio, radyoKapat,
  };
}
