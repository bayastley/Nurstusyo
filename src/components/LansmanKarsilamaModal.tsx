// ════════════════════════════════════════════════════════════════════════════
// LANSMANKARSILAMAMODAL.TSX — 26.10 ORTA EKRAN KAMPANYA BİLDİRİMİ (sahibin emri)
//
// Sahibin emri: kampanya bildirimleri üst şeritte DEĞİL, EKRANIN ORTASINDA çıksın:
//   • KARŞILAMA: kullanıcı ilk girişinde (kampanya penceresi içinde) —
//     "Nûr Stüdyo'ya Hoş Geldin! 7 haftalık PRO deneme hesabına yüklendi" +
//     kısa özellik listesi + "Anladım" butonu.
//   • BİTİŞ: kampanya bittikten SONRAKİ İLK GİRİŞTE (27.10 fix: 7 günlük pencere
//     kaldırıldı — sahibin emri "7 hafta sonra ilk giriş yaptığında"; "bir kez"
//     bayrağı tekrarı zaten engelliyor, pencere kimseyi bildirimden mahrum bırakıyordu) —
//     "7 haftalık PRO denemen bitti, ücretsiz üretime devam edebilirsin;
//     dilersen üyelikle avantajlı dünyaya geçebilirsin" + "Üyelikle Devam Et"
//     butonu (tık → PremiumModal üyelik tab'ı).
//   • Her iki durumda da SOL ÜSTTE kırmızı X: basınca ekran kapanır.
//   • "Bir kez" mantığı: kullanıcı id'si + localStorage bayrağı — aynı kullanıcıya
//     aynı bildirim ikinci kez görünmez (karşılama ve bitiş bayrakları ayrı).
//   • Dil: seçili oturum dili (nur_lang) — sözlükten çeviri, TR fallback.
// ════════════════════════════════════════════════════════════════════════════
import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { User } from "../types";
import { translate } from "../i18n";
// ★ 27.10 İLK-500 + 1 HAFTA (sahibin emri): kampanya tarih-penceresi YOK —
//   bildirim kullanıcının KENDİ 7 günlük (1 haftalık) sunucu denemesine bağlanır:
//   deneme aktif → KARŞILAMA; deneme bitti → BİTİŞ (bir kez, bayrakla).
import { denemeBitisTarihiMetni } from "../tier";

interface Props {
  user: User | null;
  /** PremiumModal üyelik tab'ını açar (bitiş bildirimi butonu) — useTier.openPremium imzası */
  openPremium: (tab?: "uyelik" | "jeton", hedefTier?: "pro" | "elit") => void;
}

type Mod = "karsilama" | "bitis" | null;

/** Bildirim bir kez gösterilsin bayrakları (kullanıcı başına) */
const karGorulduAnahtar = (id: string): string => `nur_lans_karsilama_goruldu_${id}`;
const bitGorulduAnahtar = (id: string): string => `nur_lans_bitis_goruldu_${id}`;

export const LansmanKarsilamaModal: React.FC<Props> = ({ user, openPremium }) => {
  const [mod, setMod] = useState<Mod>(null);
  // Dil sayfa yüklenmesinden sonra da değişebilir (nur_lang_degisti) — çeviri anahtarı
  const [dilDokunu, setDilDokunu] = useState(0);
  useEffect(() => {
    const on = () => setDilDokunu((v) => v + 1);
    window.addEventListener("nur_lang_degisti", on);
    return () => window.removeEventListener("nur_lang_degisti", on);
  }, []);
  void dilDokunu; // çeviri render'da okunur; sadece yeniden-render tetikler

  // ★ TETİKLEME (27.10): tarih kampanyası kaldırıldı — "pro hakkı 500 kişiye
  //   kadar, her giren 1 hafta pro". Novum: deneme başlangıcına bakılır:
  //   • deneme AKTİF + karşılama bayrağı yok → KARŞILAMA
  //   • deneme SÖNMÜŞ + bitiş bayrağı yok → BİTİŞ (ücretsiz devam + üyelik)
  //   • hiç denemesi olmayan kullanıcı (ilk-500 dışı / admin) → hiçbir bildirim.
  useEffect(() => {
    if (!user?.id) return;
    // Giriş animasyonu/toast'ları ile çakışmasın: kısa gecikme
    const zaman = window.setTimeout(() => {
      try {
        const start = Number(localStorage.getItem("nur_trial_start") || 0);
        const simdi = Date.now();
        if (start > 0 && simdi - start < 7 * 86400000) {
          if (!localStorage.getItem(karGorulduAnahtar(user.id))) { setMod("karsilama"); return; }
        } else if (start > 0 && simdi - start >= 7 * 86400000) {
          if (!localStorage.getItem(bitGorulduAnahtar(user.id))) { setMod("bitis"); return; }
        }
      } catch { /* localStorage kapalıysa sessizce pas */ }
    }, 900);
    return () => { window.clearTimeout(zaman); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /** Kapatır + "bir kez gösterildi" bayrağını basar */
  const kapat = useCallback(() => {
    if (user?.id && mod) {
      try {
        localStorage.setItem(mod === "karsilama" ? karGorulduAnahtar(user.id) : bitGorulduAnahtar(user.id), "1");
      } catch { /* yut */ }
    }
    setMod(null);
  }, [user?.id, mod]);

  // ESC ile de kapansın (X ile aynı akış — bayrak basılır)
  useEffect(() => {
    if (!mod) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") kapat(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mod, kapat]);

  if (!mod || !user) return null;

  // ★ Oturum dili — mod açılınca güncel değerle çevir
  const dil = typeof localStorage !== "undefined" ? localStorage.getItem("nur_lang") : null;
  const t = (key: string): string => translate(dil, key);

  const bitis = mod === "bitis";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      style={{ background: "rgba(3,5,10,.72)", backdropFilter: "blur(6px)" }}
    >
      {/* ★ ORTA KART — dikkat çekici altın/yeşil lansman teması */}
      <div
        className="relative w-full max-w-md modal-in overflow-hidden rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(160deg,#141824 0%,#0e1119 60%,#10151f 100%)",
          border: bitis
            ? "1px solid rgba(251,113,133,.35)"
            : "1px solid rgba(215,170,82,.45)",
          boxShadow: bitis
            ? "0 30px 80px rgba(0,0,0,.75), 0 0 40px rgba(251,113,133,.18)"
            : "0 30px 80px rgba(0,0,0,.75), 0 0 40px rgba(215,170,82,.22)",
        }}
      >
        {/* ★ SOL ÜST KIRMIZI X (sahibin emri) — basınca kapanır */}
        <button
          onClick={kapat}
          title={t("lansModalKapat")}
          aria-label={t("lansModalKapat")}
          className="absolute left-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white transition hover:brightness-125 active:scale-95"
          style={{ boxShadow: "0 0 0 1px rgba(255,80,80,.5), 0 2px 10px rgba(220,38,38,.55)" }}
          data-testid="lans-modal-x"
        >
          <X size={14} strokeWidth={3} />
        </button>

        {!bitis ? (
          <>
            {/* ═══ KARŞILAMA — ilk giriş ═══ */}
            <div className="mb-3 text-4xl">🎉</div>
            <h2 className="mb-2 text-lg font-black text-white">{t("lansKarBaslik")}</h2>
            <div
              className="mx-auto mb-3 inline-block rounded-full px-3 py-1.5 text-[10px] font-black tracking-wide text-amber-200 notranslate"
              style={{ background: "linear-gradient(135deg,rgba(215,170,82,.18),rgba(215,170,82,.06))", border: "1px solid rgba(215,170,82,.45)", boxShadow: "0 0 14px rgba(215,170,82,.25)" }}
            >
              ✨ {t("lansKarRozet")}
            </div>
            {/* ★ 27.10 KESİN BİTİŞ TARİHİ (sahibin emri): süre başladığında ne zaman
                biteceği görünmüyordu — oturum dilinde tarih satırı ekildi */}
            <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11.5px] font-semibold text-amber-100/90 notranslate" data-testid="lans-bitis-tarih">
              {t("lansKarBitisTarih").replace("$1", denemeBitisTarihiMetni(dil))}
            </div>
            <p className="mb-3 text-[12px] leading-relaxed text-white/75">{t("lansKarMetin")}</p>
            <ul className="mb-4 space-y-1.5 text-left text-[11.5px] text-white/85">
              {[
                ["lansKarF1", "🎬"],
                ["lansKarF2", "🎨"],
                ["lansKarF3", "📖"],
                ["lansKarF4", "🎁"],
              ].map(([key, ikon]) => (
                <li key={key} className="flex items-start gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                  <span className="mt-0.5">{ikon}</span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={kapat}
              data-testid="lans-modal-anladim"
              className="w-full cursor-pointer rounded-xl px-4 py-3 text-[12.5px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)", boxShadow: "0 0 0 1px rgba(215,170,82,.5), 0 0 18px rgba(215,170,82,.35)" }}
            >
              {t("lansKarAnladim")}
            </button>
          </>
        ) : (
          <>
            {/* ═══ BİTİŞ — 7 hafta sonraki ilk giriş ═══ */}
            <div className="mb-3 text-4xl">⏳</div>
            <h2 className="mb-2 text-lg font-black text-white">{t("lansBitBaslik")}</h2>
            <div
              className="mx-auto mb-3 inline-block rounded-full px-3 py-1.5 text-[10px] font-black tracking-wide text-rose-200"
              style={{ background: "linear-gradient(135deg,rgba(251,113,133,.16),rgba(251,113,133,.05))", border: "1px solid rgba(251,113,133,.4)", boxShadow: "0 0 14px rgba(251,113,133,.22)" }}
            >
              {t("lansBitRozet")}
            </div>
            <p className="mb-2 text-[12px] leading-relaxed text-white/80">{t("lansBitUcretsiz")}</p>
            <p className="mb-4 text-[12px] leading-relaxed text-white/60">{t("lansBitIcerde")}</p>
            <button
              onClick={() => { kapat(); openPremium("uyelik"); }}
              data-testid="lans-modal-uyelik-devam"
              className="w-full cursor-pointer rounded-xl px-4 py-3 text-[12.5px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,#a7f3d0,#34d399)", boxShadow: "0 0 0 1px rgba(52,211,153,.45), 0 0 18px rgba(52,211,153,.3)" }}
            >
              💎 {t("lansBitUyelikBtn")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
