// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GÄ°RÄ°Å ARKA PLANI (22.10 â€” kullanÄ±cÄ±: "kabe namaz ve kuran mushaf
// kategorisindeki atmosfer videolarÄ± ana sayfada arka planda hafif
// gÃ¶rÃ¼nsÃ¼n, 5 saniyede bir deÄŸiÅŸsin, sÃ¼rekli")
//
// â–¸ Havuz: MOTION_CLIPS iÃ§indeki `namaz` (Namaz & KÃ¢be) + `musaf`
//   (Kur'an & Mushaf) VÄ°DEOLARI â€” sadece var olan kÃ¼tÃ¼phane.
// â–¸ Katman: fixed -z-20 â†’ tÃ¼m iÃ§eriÄŸin altÄ±nda, sayfa renginin
//   (-z-30) Ã¼stÃ¼nde. Mevcut Ä±ÅŸÄ±ma/gradyan (-z-10) Ã¼stÃ¼nde kalÄ±r.
// â–¸ 5 sn'de bir Ä°KÄ° katmanlÄ± Ã§apraz geÃ§iÅŸ (1.2 s fade) â€” video
//   kaynaÄŸÄ±nÄ± aktif olmayan katman canlÄ±dayken Ã¶nceden imzalar
//   (videoUrl kuyruÄŸu), dolayÄ±sÄ±yla geÃ§iÅŸte boÅŸluk olmaz.
// â–¸ Hafif gÃ¶rÃ¼nÃ¼m: video opaklÄ±ÄŸÄ± ~0.38 + koyuluk perdesi â†’
//   cam kartlarÄ±n ve yazÄ±larÄ±n okunuruluÄŸu hiÃ§ dÃ¼ÅŸmez.
// â–¸ KESTÄ°RME (kesin Ã§alÄ±ÅŸÄ±r kÄ±lan gÃ¼venceler):
//   â€¢ sayfa gizliyse (document.hidden) sayaÃ§ ilerlemez
//   â€¢ prefers-reduced-motion / veri tasarrufu â†’ sadece POSTER dÃ¶ngÃ¼sÃ¼
//   â€¢ video aÃ§Ä±lmazsa poster kalÄ±r, arkaplan hiÃ§ boÅŸ/kara kalmaz
//   â€¢ URL imza limitine takÄ±lÄ±rsa r2 public adresine dÃ¼ÅŸer
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MOTION_CLIPS, ACTIVE_CATEGORIES, type Clip } from "../clips";
import { getVideoUrl, getPosterUrlSync } from "../videoUrl";
import { getDataSaverMode } from "../studio/useRenderQuality";

/** Ana sayfa arka planÄ± iÃ§in katmanlar â€” Namaz & KÃ¢be + Kur'an & Mushaf
 *  (ADMIN: tamHavuz=true â†’ TÃœM aktif kategoriler â€” kullanÄ±cÄ±: "her ÅŸey admine aÃ§Ä±k olsun") */
const KATEGORILER: readonly string[] = ["namaz", "musaf"];
/** DÃ¶ngÃ¼ hÄ±zÄ± (â˜… 22.10 kullanÄ±cÄ± emri: "arka plandakiler hep aynÄ± gibi kanka
 *  30 saniyeye Ã§Ä±kar") â€” atmosfer videosu artÄ±k 30 saniyede bir deÄŸiÅŸir. */
const DEGISME_MS = 30000;
/** Ã‡apraz geÃ§iÅŸ sÃ¼resi (CSS transition) */
const GECIS_MS = 1200;
/** Video katmanÄ±nÄ±n opaklÄ±ÄŸÄ± â€” "hafif gÃ¶rÃ¼necek" */
const VIDEO_OPASITE = 0.38;

/** Havuz kurucu: Ã¼cretsiz kullanÄ±cÄ± â†’ namaz+musaf (12 klip); ADMIN â†’ TÃœM aktif
 *  kategoriler (30 klip). Oturum baÅŸÄ±na karÄ±ÅŸtÄ±rÄ±lÄ±r â€” imza API limiti dostu. */
function havuzKur(tamHavuz: boolean): Clip[] {
  const kesisim = MOTION_CLIPS.filter((k) => k.kind === "vid" && (tamHavuz ? ACTIVE_CATEGORIES.includes(k.cat) : KATEGORILER.includes(k.cat)));
  for (let i = kesisim.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kesisim[i], kesisim[j]] = [kesisim[j], kesisim[i]];
  }
  return kesisim.slice(0, tamHavuz ? 30 : 12);
}

/** dÃ¶ngÃ¼ye ihtiyacÄ± var mÄ±? (sessiz ortam testi) */
const HAREKETSIZ_OLMAMALI = (): boolean => {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  } catch { /* media query yoksa hareketli devam */ }
  try {
    if (getDataSaverMode() === "on") return false;
  } catch { /* ignore */ }
  interface NetBilgisi { saveData?: boolean }
  const baglanti = (navigator as Navigator & { connection?: NetBilgisi }).connection;
  if (baglanti?.saveData) return false; // kullanÄ±cÄ±nÄ±n verisi kutsaldÄ±r â€” poster dÃ¶ngÃ¼sÃ¼
  return true;
};

// â”€â”€â”€ KATMAN: bir klip'i (video+poster) Ã§apraz geÃ§iÅŸle gÃ¶sterir â”€â”€â”€â”€â”€
const Kat: React.FC<{ clip: Clip; aktif: boolean; hareketsiz: boolean }> = ({ clip, aktif, hareketsiz }) => {
  const [url, setUrl] = useState("");
  const [hazir, setHazir] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video adresi: imzalÄ± R2 â†’ istek limitine takÄ±lÄ±nca public r2 â†’ (yoktuysa) pexels src
  useEffect(() => {
    let yasiyor = true;
    setHazir(false);
    setUrl("");
    void getVideoUrl(clip)
      .then((u) => { if (yasiyor && u) setUrl(u); })
      .catch(() => { if (yasiyor) setUrl(clip.r2 || clip.src || ""); });
    return () => { yasiyor = false; };
  }, [clip]);

  // Aktif olunca oynat; canplay geldiÄŸinde de dene (autoplay politikalarÄ±na dayanÄ±klÄ±)
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

// â”€â”€â”€ ANA BÄ°LEÅEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AtmosferGirisArkaPlani: React.FC<{ tamHavuz?: boolean }> = ({ tamHavuz = false }) => {
  const havuzRef = useRef<Clip[] | null>(null);
  if (!havuzRef.current) havuzRef.current = havuzKur(tamHavuz); // mount'ta bir kez kurulur
  const HAVUZ = havuzRef.current;
  const [durum, setDurum] = useState(() => ({ indexA: 0, indexB: HAVUZ.length > 1 ? 1 : 0, aktif: "a" as "a" | "b" }));
  const [hareketsiz] = useState(HAREKETSIZ_OLMAMALI);
  const sonrakiRef = useRef(HAVUZ.length > 1 ? 2 : 0);

  // 30 sn'de bir: gizli sekmede dur, pasif katmana sÄ±radaki klibi yerleÅŸtir
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
      {/* Taban: sayfa rengi (mosaiklerin altÄ±ndaki zemin) */}
      <div className="pointer-events-none fixed inset-0 -z-30" style={{ background: "var(--page)" }} />
      {/* DÃ¶nen atmosfer katmanÄ± */}
      <div className="pointer-events-none fixed inset-0 -z-20 select-none overflow-hidden" aria-hidden="true">
        <Kat key={`a-${indexA}`} clip={HAVUZ[indexA]} aktif={aktif === "a"} hareketsiz={hareketsiz} />
        <Kat key={`b-${indexB}`} clip={HAVUZ[indexB]} aktif={aktif === "b"} hareketsiz={hareketsiz} />
        {/* Okunabilirlik perdesi: yazÄ±larÄ±n Ã¼stÃ¼nde gezinmesin diye hafif koyuluk + vinyet */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,12,16,.34) 0%, rgba(10,12,16,.22) 45%, rgba(10,12,16,.42) 100%)" }}
        />
      </div>
    </>
  );
};

