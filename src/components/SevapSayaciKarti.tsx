// ══════════════════════════════════════════════════════════════
// SEVAPSAYACIKARTI.TSX — "Bu ay bu sitede şu kadar harf okundu" kartı
//   (madde 4, 02.10.2026). Ana ekranda hafif, kapatılabilir şerit.
//   Kaynak: sevapSayaci.ts — yalnız gerçek okuma eylemleri besler.
//   Dürüstlük: sayı bu cihazın aylık kaydıdır; "topluluk" kelimemiz
//   abartı içermez — tek cihazsa tek kişi olarak görünür.
// ══════════════════════════════════════════════════════════════
import React, { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { sevapYukle, sevapKisa, type SevapKaydi } from "../data/sevapSayaci";
import type { Lang } from "../i18n";

const KAPAT_KEY = "nur_sevap_kart_kapali";

const METINLER = {
  tr: { etiket: "BU AY NÛR STÜDYO'DA", harf: "harf okundu", sure: "≈", sureSon: "sayfa Kur'an", ipucu: "Sen de okudukçana eklenir — Kur'an Sayfaları'nda ✓ OKUDUM'a basman yeterli.", kapat: "Kapat" },
  en: { etiket: "THIS MONTH ON NÛR STUDIO", harf: "letters recited", sure: "≈", sureSon: "Qur'an pages", ipucu: "Your readings add up — just tap ✓ DONE in Qur'an Pages.", kapat: "Close" },
  ar: { etiket: "هذا الشهر في نور ستوديو", harf: "حرف تمت قراءته", sure: "≈", sureSon: "صفحة قرآن", ipucu: "قراءتك تُضاف — فقط اضغط ✓ في صفحات القرآن.", kapat: "إغلاق" },
  id: { etiket: "BULAN INI DI NÛR STUDIO", harf: "huruf dibaca", sure: "≈", sureSon: "halaman Al-Qur'an", ipucu: "Bacaanmu terhitung — cukup tekan ✓ SELESAI di Halaman Al-Qur'an.", kapat: "Tutup" },
  ur: { etiket: "اس ماہ نور اسٹوڈیو میں", harf: "حروف پڑھے گئے", sure: "≈", sureSon: "قرآن صفحات", ipucu: "آپ کی تلاوت شامل ہوتی ہے — قرآن صفحات میں ✓ دبائیں۔", kapat: "بند کریں" },
} as const;

export const SevapSayaciKarti: React.FC<{ lang: Lang }> = ({ lang }) => {
  const [kayit, setKayit] = useState<SevapKaydi | null>(null);
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(KAPAT_KEY) === "1") return; } catch { /* yut */ }
    setKayit(sevapYukle());
    setGorunur(true);
  }, []);

  if (!gorunur || !kayit || kayit.harf <= 0) return null;

  const m = METINLER[lang] ?? METINLER.tr;
  const sayfaTahmini = Math.max(1, Math.round(kayit.harf / 1250)); // mushaf sayfası ≈ 1250 harf (quranSayfaKelime)

  return (
    <div className="mx-auto mb-1 flex w-full max-w-[1500px] items-center gap-2 border-b border-white/5 bg-[#0d1a2c]/60 px-4 py-1.5 text-[10px] text-white/60">
      <Sparkles size={11} className="shrink-0 animate-glow" style={{ color: "var(--accent)" }} />
      <span className="shrink-0 font-bold uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>{m.etiket}</span>
      <span className="min-w-0 flex-1 truncate">
        <b className="tabular-nums text-[#f5dda6]">{sevapKisa(kayit.harf, lang === "tr")}</b> {m.harf}
        <span className="mx-1.5 text-white/20">·</span>
        {m.sure} <b className="tabular-nums text-white/80">{sevapKisa(sayfaTahmini, lang === "tr")}</b> {m.sureSon}
      </span>
      <span className="hidden shrink-0 text-white/30 lg:inline">{m.ipucu}</span>
      <button
        onClick={() => { try { localStorage.setItem(KAPAT_KEY, "1"); } catch { /* yut */ } setGorunur(false); }}
        aria-label={m.kapat}
        className="shrink-0 text-white/25 transition hover:text-white/60"
      >
        <X size={12} />
      </button>
    </div>
  );
};
