// ══════════════════════════════════════════════════════════════════
// GİRİŞ ARKA PLANI (22.10 — kullanıcı: "kabe namaz ve kuran mushaf
// kategorisindeki atmosfer videoları ana sayfada arka planda hafif
// görünsün, 5 saniyede bir değişsin, sürekli")
//
// ▸ Havuz: MOTION_CLIPS içindeki `namaz` (Namaz & Kâbe) + `musaf`
//   (Kur'an & Mushaf) VİDEOLARI — sadece var olan kütüphane.
// ▸ Katman: fixed -z-20 → tüm içeriğin altında, sayfa renginin
//   (-z-30) üstünde. Mevcut ışıma/gradyan (-z-10) üstünde kalır.
// ▸ 5 sn'de bir İKİ katmanlı çapraz geçiş (1.2 s fade) — video
//   kaynağını aktif olmayan katman canlıdayken önceden imzalar
//   (videoUrl kuyruğu), dolayısıyla geçişte boşluk olmaz.
// ▸ Hafif görünüm: video opaklığı ~0.38 + koyuluk perdesi →
//   cam kartların ve yazıların okunuruluğu hiç düşmez.
// ▸ KESTİRME (kesin çalışır kılan güvenceler):
//   • sayfa gizliyse (document.hidden) sayaç ilerlemez
//   • prefers-reduced-motion / veri tasarrufu → sadece POSTER döngüsü
//   • video açılmazsa poster kalır, arkaplan hiç boş/kara kalmaz
//   • URL imza limitine takılırsa r2 public adresine düşer
// ══════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MOTION_CLIPS, ACTIVE_CATEGORIES, type Clip } from "../clips";
import { getVideoUrl, getPosterUrlSync } from "../videoUrl";

/** Ana sayfa arka planı için katmanlar — Namaz & Kâbe + Kur'an & Mushaf
 *  (ADMIN: tamHavuz=true → TÜM aktif kategoriler — kullanıcı: "her şey admine açık olsun") */
const KATEGORILER: readonly string[] = ["namaz", "musaf"];
/** Döngü hızı (★ 22.10 kullanıcı emri: "arka plandakiler hep aynı gibi kanka
 *  30 saniyeye çıkar") — atmosfer videosu artık 30 saniyede bir değişir. */
const DEGISME_MS = 30000;
/** Çapraz geçiş süresi (CSS transition) */
const GECIS_MS = 1200;
/** Video katmanının opaklığı — "hafif görünecek" */
const VIDEO_OPASITE = 0.38;

/** Havuz kurucu: ücretsiz kullanıcı → namaz+musaf (12 klip); ADMIN → TÜM aktif
 *  kategoriler (30 klip). Oturum başına karıştırılır — imza API limiti dostu. */
function havuzKur(tamHavuz: boolean): Clip[] {
  const kesisim = MOTION_CLIPS.filter((k) => k.kind === "vid" && (tamHavuz ? ACTIVE_CATEGORIES.includes(k.cat) : KATEGORILER.includes(k.cat)));
  for (let i = kesisim.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kesisim[i], kesisim[j]] = [kesisim[j], kesisim[i]];
  }
  return kesisim.slice(0, tamHavuz ? 30 : 12);
}

/** döngüye ihtiyacı var mı? (sessiz ortam testi) */
const HAREKETSIZ_OLMAMALI = (): boolean => {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  } catch { /* media query yoksa hareketli devam */ }
  interface NetBilgisi { saveData?: boolean }
  const baglanti = (navigator as Navigator & { connection?: NetBilgisi }).connection;
  if (baglanti?.saveData) return false; // kullanıcının verisi kutsaldır — poster döngüsü
  return true;
};

// ─── KATMAN: bir klip'i (video+poster) çapraz geçişle gösterir ─────
const Kat: React.FC<{ clip: Clip; aktif: boolean; hareketsiz: boolean }> = ({ clip, aktif, hareketsiz }) => {
  const [url, setUrl] = useState("");
  const [hazir, setHazir] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video adresi: imzalı R2 → istek limitine takılınca public r2 → (yoktuysa) pexels src
  useEffect(() => {
    let yasiyor = true;
    setHazir(false);
    setUrl("");
    void getVideoUrl(clip)
      .then((u) => { if (yasiyor && u) setUrl(u); })
      .catch(() => { if (yasiyor) setUrl(clip.r2 || clip.src || ""); });
    return () => { yasiyor = false; };
  }, [clip]);

  // Aktif olunca oynat; canplay geldiğinde de dene (autoplay politikalarına dayanıklı)
  useEffect(() => {
    if (!aktif) {
      const t = window.setTimeout(() => { videoRef.current?.pause(); }, GECIS_MS + 300);
      return () => window.clearTimeout(t);
    }
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => undefined);
  }, [aktif, url]);

  const poster = getPosterUrlSync(clip) || clip.r2Poster || clip.poster;
  return (
    <div
      className="absolute inset-0 transition-opacity ease-linear"
      style={{ opacity: aktif ? 1 : 0, transitionDuration: `${GECIS_MS}ms` }}
    >
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: hazir ? 0.5 : 0.62 }}
      />
      {!hareketsiz && (
        <video
          ref={videoRef}
          src={url || undefined}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onCanPlay={() => {
            setHazir(true);
            const v = videoRef.current;
            if (v && aktif) v.play().catch(() => undefined);
          }}
          onError={(e) => { e.currentTarget.style.display = "none"; }} // video patlarsa poster parlar
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: hazir ? VIDEO_OPASITE : 0, transition: `opacity ${GECIS_MS}ms ease` }}
        />
      )}
    </div>
  );
};

// ─── ANA BİLEŞEN ───────────────────────────────────────────────────
export const AtmosferGirisArkaPlani: React.FC<{ tamHavuz?: boolean }> = ({ tamHavuz = false }) => {
  const havuzRef = useRef<Clip[] | null>(null);
  if (!havuzRef.current) havuzRef.current = havuzKur(tamHavuz); // mount'ta bir kez kurulur
  const HAVUZ = havuzRef.current;
  const [durum, setDurum] = useState(() => ({ indexA: 0, indexB: HAVUZ.length > 1 ? 1 : 0, aktif: "a" as "a" | "b" }));
  const [hareketsiz] = useState(HAREKETSIZ_OLMAMALI);
  const sonrakiRef = useRef(HAVUZ.length > 1 ? 2 : 0);

  // 30 sn'de bir: gizli sekmede dur, pasif katmana sıradaki klibi yerleştir
  const ilerle = useCallback(() => {
    if (HAVUZ.length < 2) return;
    const n = sonrakiRef.current % HAVUZ.length;
    sonrakiRef.current = (n + 1) % HAVUZ.length;
    setDurum((d) => (d.aktif === "a" ? { ...d, indexB: n, aktif: "b" } : { ...d, indexA: n, aktif: "a" }));
  }, [HAVUZ]);

  useEffect(() => {
    if (HAVUZ.length < 2) return;
    const id = window.setInterval(() => { if (!document.hidden) ilerle(); }, DEGISME_MS);
    return () => window.clearInterval(id);
  }, [ilerle, HAVUZ]);

  if (!HAVUZ.length) return null;
  const { indexA, indexB, aktif } = durum;
  return (
    <>
      {/* Taban: sayfa rengi (mosaiklerin altındaki zemin) */}
      <div className="pointer-events-none fixed inset-0 -z-30" style={{ background: "var(--page)" }} />
      {/* Dönen atmosfer katmanı */}
      <div className="pointer-events-none fixed inset-0 -z-20 select-none overflow-hidden" aria-hidden="true">
        <Kat key={`a-${indexA}`} clip={HAVUZ[indexA]} aktif={aktif === "a"} hareketsiz={hareketsiz} />
        <Kat key={`b-${indexB}`} clip={HAVUZ[indexB]} aktif={aktif === "b"} hareketsiz={hareketsiz} />
        {/* Okunabilirlik perdesi: yazıların üstünde gezinmesin diye hafif koyuluk + vinyet */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,12,16,.34) 0%, rgba(10,12,16,.22) 45%, rgba(10,12,16,.42) 100%)" }}
        />
      </div>
    </>
  );
};
