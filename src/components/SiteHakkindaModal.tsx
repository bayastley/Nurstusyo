// ════════════════════════════════════════════════════════
// SITE HAKKINDA MODAL — "Bu sitede ne var?" (yol haritası madde 4)
// Kaynak listesi (Diyanet, sahih hadis, mp3quran), telif bildirimi,
// iletişim formuna köprü. Yol haritasındaki 3 şartın hepsi burada.
// ════════════════════════════════════════════════════════

import React, { useState } from "react";
import { translate, type Lang } from "../i18n";
import { BookOpen, Radio, ShieldCheck, Mail, ExternalLink, HeartHandshake, Video, Sparkles, Clapperboard, PlayCircle } from "lucide-react";
import { Modal } from "./UIElements";

// ★ TANITIM VİDEOSU — "Bu Sitede Ne Var?" modalında oynatılır.
//   Boş string = bölüm hiç görünmez. Link geldiğinde buraya yapıştır (27.09).
const TANITIM_VIDEO_YOUTUBE = "";

interface SiteHakkindaModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  /** İletişim formunu (Destek Merkezi) açar — ModalsContainer içindeki setModal("contact") */
  onIletisim: () => void;
}

const KAYNAKLAR: Array<{ baslik: string; aciklama: string; url?: string }> = [
  { baslik: "Diyanet İşleri Başkanlığı", aciklama: "shKaynak1", url: "https://diyanet.gov.tr" },
  { baslik: "mp3quran.net / qurango.net", aciklama: "shKaynak2", url: "https://mp3quran.net" },
  { baslik: "AlQuran Cloud API", aciklama: "shKaynak3", url: "https://alquran.cloud" },
  { baslik: "Sahih Hadis Kaynakları", aciklama: "shKaynak4" },
  { baslik: "Kâbe & Mescid-i Nebi Canlı", aciklama: "shKaynak5" },
];

const OZELLIKLER: Array<{ ikon: React.ElementType; baslik: string; metin: string }> = [
  { ikon: Video, baslik: "shOzellikVideo", metin: "shOzellikVideoMetin" },
  { ikon: BookOpen, baslik: "shOzellikKuran", metin: "shOzellikKuranMetin" },
  { ikon: Radio, baslik: "shOzellikKabe", metin: "shOzellikKabeMetin" },
  { ikon: Sparkles, baslik: "shOzellikKutuphane", metin: "shOzellikKutuphaneMetin" },
];

export const SiteHakkindaModal: React.FC<SiteHakkindaModalProps> = ({ open, onClose, onIletisim , lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [mesajGoster, setMesajGoster] = useState(false);

  // YouTube linkini embed'e çevir (watch?v=, youtu.be, shorts — hepsi)
  const videoEmbed = (() => {
    const l = TANITIM_VIDEO_YOUTUBE.trim();
    if (!l) return "";
    const m = l.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : "";
  })();

  if (!open) return null;

  return (
    <Modal title={tt("v2SiteHakkindaTitle")} sub={tt("v2SiteHakkindaSub")} onClose={onClose} wide>
      {/* ── TANITIM VİDEOSU ────────────────────────────── */}
      {videoEmbed && (
        <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={videoEmbed}
              title="Nûr Stüdyo Tanıtım Videosu"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[9.5px] font-bold text-white/60">
              <Clapperboard size={12} className="text-red-400" /> Siteyi 2 dakikada tanı — video rehber
            </p>
            <a
              href={TANITIM_VIDEO_YOUTUBE.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-lg glass-soft px-2 py-1 text-[8.5px] font-bold text-white/60 transition hover:text-white"
            >
              <PlayCircle size={9} /> YouTube'da izle
            </a>
          </div>
        </div>
      )}

      {/* ── ÖZELLİKLER ─────────────────────────────────── */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {OZELLIKLER.map(({ ikon: Icon, baslik, metin }) => (
          <div key={baslik} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
            <div className="mb-1 flex items-center gap-2">
              <Icon size={14} style={{ color: "var(--accent)" }} />
              <h4 className="text-[11px] font-bold text-white/90">{tt(baslik)}</h4>
            </div>
            <p className="text-[9.5px] leading-relaxed text-white/55">{tt(metin)}</p>
          </div>
        ))}
      </div>

      {/* ── KAYNAKLAR ──────────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[.03] p-3.5">
        <h3 className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
          <BookOpen size={13} style={{ color: "var(--accent)" }} /> {tt("shKaynaklarBaslik")}
        </h3>
        <div className="space-y-2">
          {KAYNAKLAR.map((k) => (
            <div key={k.baslik} className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold text-white/85">{k.baslik}</p>
                <p className="text-[9px] leading-relaxed text-white/50">{tt(k.aciklama)}</p>
              </div>
              {k.url && (
                <a
                  href={k.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-lg glass-soft px-2 py-1 text-[8.5px] font-bold text-white/60 transition hover:text-white"
                >
                  <ExternalLink size={9} /> {tt("shKaynakBtn")}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TELİF BİLDİRİMİ ────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/[.07] p-3.5">
        <h3 className="mb-1.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-amber-200">
          <ShieldCheck size={13} /> {tt("shTelifBaslik")}
        </h3>
        <p className="text-[9.5px] leading-relaxed text-amber-100/75">
          {tt("shTelifMetni")}
        </p>
      </div>

      {/* ── İLETİŞİM KÖPRÜSÜ ───────────────────────────── */}
      {mesajGoster ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[.07] p-3.5 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-[10.5px] font-bold text-emerald-200">
            <HeartHandshake size={13} /> {tt("shIletisimMesaj")}
          </p>
          <button
            type="button"
            onClick={() => { onClose(); onIletisim(); }}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[10.5px] font-black text-black transition hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            <Mail size={12} /> {tt("shDestekAc")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMesajGoster(true)}
          className="w-full rounded-xl glass-soft py-2.5 text-[10px] font-bold text-white/60 transition hover:text-white"
        >
          {tt("shIletisimBtn")}
        </button>
      )}
    </Modal>
  );
};
