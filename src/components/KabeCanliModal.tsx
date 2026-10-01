// ════════════════════════════════════════════════════════
// KABECANLIMODAL.TSX — QuranLearnModal'dan ayrıldı (SRP, 01.10)
// Kâbe/Mescid-i Nebi canlı yayın overlay'i: HLS bağlama, 3 kanal sekmesi,
// ses kontrolü, tam ekran — HEPSİ bu bileşende. Dışa yalnız open/onClose
// yüzeyi; QuranLearnModal yalnız "açıldı/kapandı" bilir.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Hls from "hls.js";
import { kabeSourcesFor } from "../data/liveStreams";

type KabeTab = "quran" | "live" | "mekke";

export const KabeCanliModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [kabeStatus, setKabeStatus] = useState<"loading" | "playing" | "error">("loading");
  const [kabeMuted, setKabeMuted] = useState(true); // ★ tarayıcı ses engelini aşmak için sessiz başlar, tek tıkla açılır
  const [kabeVolume, setKabeVolume] = useState(0.8);
  const [kabeTab, setKabeTab] = useState<KabeTab>("quran"); // 1) Suudi Quran TV 2) Katar Quran TV HD 3) Mescid-i Nebi (Medine)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null); // ★ tam ekran kapsayıcısı

  // ★ Kâbe canlı HLS bağlama — doğrudan kaynak + başarısızlıkta proxy yedeği
  const startHls = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // önceki hls örneğini temizle
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const sources = kabeSourcesFor(kabeTab);
    let srcIdx = 0;
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30 });
      hlsRef.current = hls;
      hls.loadSource(sources[srcIdx]);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => undefined);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        // ★ Kaynak patladı → sıradaki kaynağa (proxy yedeği) otomatik geç
        srcIdx += 1;
        if (srcIdx < sources.length) {
          setKabeStatus("loading");
          hls.loadSource(sources[srcIdx]);
          hls.startLoad();
        } else {
          setKabeStatus("error");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari doğrudan HLS oynatır
      video.src = sources[0];
      video.play().catch(() => undefined);
    } else {
      setKabeStatus("error");
    }
  }, [kabeTab]); // ★ yalnız sekme değişince yeniden bağlanır; ses aç/kapa asla yayını kesmez

  // Modal açılınca yayına bağlan, kapatınca temizle (yalnız Kur'an TV sekmesinde HLS çalışır)
  useEffect(() => {
    if (!open) {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      return;
    }
    setKabeStatus("loading");
    const t = setTimeout(() => startHls(), 60);
    return () => { clearTimeout(t); if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [open, kabeTab, startHls]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gold/30 bg-[#131322] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-[12px] font-black text-gold">🕋 Kâbe — Mescid-i Haram Canlı Yayın</p>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-[11px] font-bold text-white/50 hover:text-white"><X size={16} /></button>
        </div>
        {/* ★ KANAL SEKMELERİ */}
        <div className="flex gap-2 border-b border-white/10 px-4 py-2">
          <button onClick={() => setKabeTab("quran")} className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition ${kabeTab === "quran" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[.04] text-[#8f8870] hover:text-white"}`} title="Suudi resmî Quran TV — kesintisiz Kur'an tilaveti ve Mekke/Medine ibadet görüntüleri">
            📖 KUR'AN TV
          </button>
          <button onClick={() => setKabeTab("live")} className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition ${kabeTab === "live" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[.04] text-[#8f8870] hover:text-white"}`} title="Katar resmî Quran TV — HD kesintisiz Kur'an tilaveti (YouTube'suz)">
            📖 KUR'AN TV HD
          </button>
          <button onClick={() => setKabeTab("mekke")} className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition ${kabeTab === "mekke" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[.04] text-[#8f8870] hover:text-white"}`} title="Mescid-i Nebi (Medine) resmî Suudi Sunnah TV — kesintisiz yayın, YouTube'suz">
            🕌 MEDİNE CANLI
          </button>
        </div>
        <div ref={wrapRef} className="relative aspect-video w-full bg-black [&:fullscreen]:aspect-auto [&:fullscreen]:h-full [&:fullscreen]:w-full">
          {/* ★ TAM EKRAN BUTONU — sağ üstte, üç kanalda da çalışır */}
          <button
            onClick={() => {
              const el = wrapRef.current;
              if (!el) return;
              if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
              else el.requestFullscreen().catch(() => undefined);
            }}
            className="absolute right-2 top-2 z-20 rounded-lg bg-black/70 px-2.5 py-1.5 text-[13px] leading-none text-white/90 backdrop-blur-sm transition hover:bg-black/90 hover:text-gold"
            title="Tam ekran (çıkmak için tekrar bas veya ESC)"
          >
            ⛶
          </button>
          {/* ★ ÜÇ KANAL DA YouTube'suz kendi proxy'mizden HLS oynar — hata 153 ve iframe kalıntısı yok */}
          <video
            ref={videoRef}
            key={kabeTab}
            autoPlay
            muted={kabeMuted}
            playsInline
            onClick={() => {
              // ★ EKRANA TIKLA = SES AÇ/KAPA: en doğal yol, yayın kesilmez
              const nm = !kabeMuted;
              setKabeMuted(nm);
              const v = videoRef.current;
              if (v) { v.muted = nm; v.volume = nm ? 0 : kabeVolume; }
            }}
            className="h-full w-full cursor-pointer"
            onPlaying={() => setKabeStatus("playing")}
            onError={() => setKabeStatus("error")}
          />
          {kabeMuted && kabeStatus === "playing" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-12 flex justify-center">
              <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-black text-white/85 backdrop-blur-sm">🔇 Ses için ekrana dokun</span>
            </div>
          )}
          {kabeStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
              <p className="text-[10px] font-bold text-gold/70">Canlı yayına bağlanıyor…</p>
            </div>
          )}
          {kabeStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <p className="text-[11px] font-black text-[#f5dda6]">Yayın şu an açılamadı</p>
              <button onClick={() => { setKabeStatus("loading"); startHls(); }} className="rounded-lg bg-gold/20 px-3 py-1.5 text-[10px] font-black text-gold transition hover:bg-gold/30">↻ Tekrar Dene</button>
            </div>
          )}
          {/* ★ SES KONTROLÜ — sağ altta: aç/kapa + kaydırıcılı seviye (yayını KESMEDEN çalışır) */}
          {kabeStatus === "playing" && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-1 backdrop-blur-sm">
              <button onClick={() => setKabeMuted(m => {
                const nm = !m;
                const v = videoRef.current;
                if (v) { v.muted = nm; v.volume = nm ? 0 : kabeVolume; }
                return nm;
              })} className="text-[13px] leading-none text-white/90 transition hover:text-gold" title={kabeMuted ? "Sesi aç" : "Sesi kapat"}>
                {kabeMuted || kabeVolume === 0 ? "🔇" : kabeVolume < 0.5 ? "🔉" : "🔊"}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={kabeMuted ? 0 : kabeVolume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  setKabeVolume(vol);
                  setKabeMuted(vol === 0);
                  const v = videoRef.current;
                  if (v) { v.volume = vol; v.muted = vol === 0; }
                }}
                className="h-1 w-16 cursor-pointer accent-[#D7AA41]"
                title="Ses seviyesi"
              />
            </div>
          )}
        </div>
        <p className="px-4 py-2 text-center text-[8px] font-bold uppercase tracking-widest text-[#5a5443]">
          {kabeTab === "quran" ? "📖 Suudi Quran TV — kesintisiz Kur'an tilaveti + Mekke/Medine ibadet görüntüleri (ses düğmesi sağ altta)" : kabeTab === "live" ? "📖 Katar Quran TV HD — kesintisiz Kur'an tilaveti, YouTube'suz Akamai CDN (ses düğmesi sağ altta)" : "🕌 Mescid-i Nebi — Medine canlı yayın, Suudi Sunnah TV (ses düğmesi sağ altta)"}
        </p>
      </div>
    </div>
  );
};
