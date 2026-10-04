import { Sparkles } from "lucide-react";
import { translate } from "../i18n";

// ★ i18n (03.10): başlık + tagline'lar t() anahtarlarına taşındı (05: prompt-1).
//   Dil değişince track yeniden kurulur — CSS animasyonu içerik uzunluğundan
//   bağımsız (yarıçap kaydırma), key={lang} sadece React listesini tazeler.
const TAG_KEYS = ["heroTag1", "heroTag2", "heroTag3", "heroTag4"] as const;

export function StudioHeroSection() {
  const lang = localStorage.getItem("nur_lang");
  const t = (key: string) => translate(lang, key);
  return (
    <section className="relative mx-auto max-w-[1500px] px-4 pb-3 pt-10 text-center sm:pt-14">
      {/* ★ 04.10: Basmala — U+FDFD ligatürü yerine sabit Arapça yazım + notranslate.
          Ligatürü Google Translate "Bismillahirrahmanirrahim" diye çeviriyordu;
          basmala hiçbir dilde çevrilmez, Arapça kalır. */}
      <div className="ornament whitespace-nowrap font-arabic notranslate text-[clamp(26px,7.5vw,42px)] leading-none" style={{ color: "var(--accent)" }} translate="no" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <h1 className="shimmer-text mt-4 font-display text-[clamp(28px,4.8vw,56px)] font-black tracking-[.12em]">{t("heroBaslik")}</h1>
      <div className="tagline-viewport mx-auto mt-3 w-full max-w-3xl overflow-hidden">
        <div className="tagline-track">
          {[0, 1].map((loop) => (
            <span key={loop} className="tagline-seq" aria-hidden={loop === 1}>
              {TAG_KEYS.map((key) => (
                <span key={key} className="tagline-item">
                  <Sparkles size={12} className="tagline-star" strokeWidth={2.6} />
                  <span className="tagline-text">{t(key)}</span>
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
