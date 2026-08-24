import { Sparkles } from "lucide-react";

const TAGLINES = [
  "⚡ 1080p ve 4K Ultra HD çözünürlükte, sıfır kayıpsız sinematik render gücü.",
  "🤖 Yeni nesil AI asistanı ile otomatik SEO başlığı, açıklama ve viral hashtag üretimi.",
  "🎯 Küresel dil paketleri (i18n) ile tüm dünyaya hitap eden çok dilli içerik fabrikası.",
  "🎵 Mücevved ve Murattal kâri tilavetleriyle milisaniyelik karaoke tarzı altyazı senkronizasyonu.",
];

export function StudioHeroSection() {
  return (
    <section className="relative mx-auto max-w-[1500px] px-4 pb-3 pt-10 text-center sm:pt-14">
      <div className="ornament font-arabic text-[42px] leading-none" style={{ color: "var(--accent)" }}>﷽</div>
      <h1 className="shimmer-text mt-4 font-display text-[clamp(28px,4.8vw,56px)] font-black tracking-[.12em]">İSLAMÎ VİDEO ÜRETİCİ</h1>
      <div className="tagline-viewport mx-auto mt-3 w-full max-w-3xl overflow-hidden">
        <div className="tagline-track">
          {[0, 1].map((loop) => (
            <span key={loop} className="tagline-seq" aria-hidden={loop === 1}>
              {TAGLINES.map((line) => (
                <span key={line} className="tagline-item">
                  <Sparkles size={12} className="tagline-star" strokeWidth={2.6} />
                  <span className="tagline-text">{line}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-5 h-px w-52 animate-glow" style={{ background: "linear-gradient(90deg,transparent,var(--accent),transparent)" }} />
    </section>
  );
}