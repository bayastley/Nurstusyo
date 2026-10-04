// ════════════════════════════════════════════════════════
// ARKA PLAN ÜRETİCİ MODAL — İş 4: AI Arka Plan Üretici LİTE
// Kullanıcı ruh hâlini (mood) yazar → sistem bir SAHNE PLANI
// kurar: ana/destek kategoriler + sinematik filtre + senaryo
// ritmi. "Stüdyoya Uygula" ile MEVCUT stüdyo akışları çalışır:
//   • randomizeBackgrounds(kategori) → klipler atanır
//   • setCinematic(filtre) → sinematik ton uygulanır
// API'siz, maliyetsiz; gerçek AI üretimi ayrı karar.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState } from "react";
import { translate, type Lang } from "../i18n";
import { Check, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { Modal } from "./UIElements";
import {
  MOOD_ONERILERI, SENARYO_MODLARI, catsForTierMood, moodBul,
  type MoodPreset,
} from "../data/arkaplanUretici";
import { CATEGORIES, CATEGORY_PALETTE, type CatId } from "../clips";

export interface ArkaPlanUreticiModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
  /** Stüdyonun rastgele atmosfer atama akışı (klip kompozitörü) */
  randomizeBackgrounds: (scopeCat?: CatId) => void;
  /** Stüdyonun sinematik filtre state'i */
  setCinematic: (id: string) => void;
  /** Kaç ayet seçili — 0 ise bilgilendirme gösterir */
  seciliAyetSayisi: number;
  /** Erişim seviyesi — tier'ın açmadığı kategoriler öneriden düşer */
  accessTier?: "free" | "pro" | "elit";
  /** Admin/master modu */
  isMasterSurum?: boolean;
}

const catLabel = (cat: CatId): string => CATEGORIES.find((c) => c.id === cat)?.label ?? cat;

export const ArkaPlanUreticiModal: React.FC<ArkaPlanUreticiModalProps> = ({
  open, onClose, notify, randomizeBackgrounds, setCinematic,
  seciliAyetSayisi = 0, accessTier = "free", isMasterSurum = false,
  lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [metin, setMetin] = useState("");
  const [aktifMood, setAktifMood] = useState<MoodPreset | null>(null);
  const [tamEslesme, setTamEslesme] = useState(false);
  const [cats, setCats] = useState<CatId[]>([]);
  const [senaryo, setSenaryo] = useState<string>("tek");
  const [uygulaniyor, setUygulaniyor] = useState(false);

  // ── Mood çözümle (metin değişince) ────────────────────────
  useEffect(() => {
    if (!open) return;
    const q = metin.trim();
    if (q.length < 2) {
      setAktifMood(null);
      setCats([]);
      return;
    }
    const sonuc = moodBul(q);
    setAktifMood(sonuc.preset);
    setTamEslesme(sonuc.tam);
    setCats(catsForTierMood(sonuc.preset.cats, accessTier, isMasterSurum));
  }, [metin, open, accessTier, isMasterSurum]);

  // ── Uygula: mevcut stüdyo akışlarıyla sahne kur ───────────
  // ★ ÇEŞİTLİLİK DÜZELTMESİ (28.09, kullanıcı kararı): "hep aynı şeyler çıkmasın" —
  //   eskiden tek/cift/yolculuk FARKI YOKTU: hepsi cats[0]'ı atıyordu. Artık:
  //   • Tek Sahne → ana kategori (cats[0])
  //   • İkili Kurgu → ana kategori atanır; sonra 600 ms sonra destek kategorisi (cats[1])
  //     atanarak ayetler iki atmosfer arasında dönüşümlü dağıtılır
  //   • Yolculuk → açılış (cats[0]) + 600ms sonra orta (cats[1]) + 1200ms sonra final
  //     (cats[2]) — hikâye yayı gerçekten 3 farklı kategoride kurulur
  const uygula = useCallback(async () => {
    if (!aktifMood || uygulaniyor) return;
    if (cats.length === 0) {
      notify?.(tt("apErisimYok"));
      return;
    }
    setUygulaniyor(true);
    try {
      const yolu = (cat: CatId) => {
        randomizeBackgrounds(cat);
        if (aktifMood.filtre) setCinematic(aktifMood.filtre);
      };
      const bekle = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

      if (senaryo === "tek") {
        // Tek Sahne: ana kategori
        yolu(cats[0]);
      } else if (senaryo === "cift") {
        // İkili Kurgu: ana şimdi, destek 600 ms sonra — iki kategori dönüşümlü dağıtılır
        yolu(cats[0]);
        if (cats[1] && cats[1] !== cats[0]) { await bekle(600); yolu(cats[1]); }
      } else {
        // Yolculuk: açılış → orta → final — 3 farklı kategori, hikâye yayı
        yolu(cats[0]);
        if (cats[1] && cats[1] !== cats[0]) { await bekle(600); yolu(cats[1]); }
        const final = cats[2] ?? cats[1];
        if (final && final !== cats[0] && final !== cats[1]) { await bekle(600); yolu(final); }
      }
      const kategoriSayisi = senaryo === "tek" ? 1 : senaryo === "cift" ? Math.min(2, cats.length) : Math.min(3, cats.length);
      notify?.(`✨ "${aktifMood.ad}" sahnesi stüdyoya uygulandı — ${kategoriSayisi} kategori ${aktifMood.filtre !== "orijinal" ? "+ sinematik filtre " : ""}kullanıldı!`);
      onClose();
    } catch {
      notify?.(tt("apUygulamaHata"));
    } finally {
      setUygulaniyor(false);
    }
  }, [aktifMood, cats, senaryo, uygulaniyor, randomizeBackgrounds, setCinematic, notify, onClose]);

  // ── Senaryo açıklaması: dürüst, plan diline uygun ─────────
  const senaryoNotu = useCallback((): string => {
    if (!aktifMood) return "";
    if (cats.length === 0) return "";
    if (senaryo === "tek") return `Tüm sahne "${catLabel(cats[0])}" kategorisinden kurulacak.`;
    if (senaryo === "cift") {
      const destek = cats[1] ?? cats[0];
      return `Ana sahne "${catLabel(cats[0])}" + destek sahne "${catLabel(destek)}" — Uygula'ya basınca İKİ kategori birden atanır, ayetler iki atmosfer arasında dönüşümlü dağıtılır.`;
    }
    const orta = cats[1] ?? cats[0];
    const final = cats[2] ?? orta;
    return `Yolculuk planı: açılış "${catLabel(cats[0])}" → orta "${catLabel(orta)}" → final "${catLabel(final)}" — Uygula'ya basınca ÜÇ kategori sırayla atanır, hikâye yayı otomatik kurulur.`;
  }, [aktifMood, cats, senaryo]);

  if (!open) return null;

  return (
    <Modal title={tt("v2ArkaPlanUreticiTitle")} sub={tt("v2ArkaPlanUreticiSub")} wide onClose={onClose}>
      {/* Mood girişi */}
      <div className="relative mb-3">
        <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          placeholder={tt("apSahnePlaceholder")}
          className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-9 text-[11px] outline-none placeholder:text-white/30"
        />
        {metin && (
          <button type="button" onClick={() => setMetin("")} title="Temizle"
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/50 transition hover:bg-red-500/25 hover:text-red-300">
            <X size={11} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Öneri çipleri */}
      {!aktifMood && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {MOOD_ONERILERI.map((o) => (
            <button key={o} type="button" onClick={() => setMetin(o)}
              className="glass-soft rounded-full px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:text-white">
              {o}
            </button>
          ))}
        </div>
      )}

      {/* Sahne planı kartı */}
      {aktifMood && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3.5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[18px]">{aktifMood.emoji}</span>
              <h4 className="font-display text-[13px] font-bold" style={{ color: "var(--accent-2)" }}>
                {aktifMood.ad} Sahnesi
              </h4>
              {!tamEslesme && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold text-white/50">yaklaşık eşleşme</span>
              )}
            </div>
            <p className="text-[10px] leading-relaxed text-white/55">{aktifMood.plan}</p>
            <p className="mt-2 text-[8.5px] italic text-white/35">
              Dürüst not: bu, hazır R2 kütüphanesinden akıllı bir kompozisyon — gerçek AI görsel üretimi şimdilik kapalı.
            </p>
          </div>

          {/* Senaryo modu */}
          <div>
            <p className="mb-1.5 text-[9px] font-black tracking-wider text-white/40">Senaryo ritmi</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {SENARYO_MODLARI.map((m) => {
                const secili = senaryo === m.id;
                return (
                  <button key={m.id} type="button" onClick={() => setSenaryo(m.id)}
                    className="rounded-xl border p-2.5 text-left transition"
                    style={{
                      borderColor: secili ? "var(--accent)" : "rgba(255,255,255,.10)",
                      background: secili ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)",
                    }}>
                    <p className="text-[11px] font-bold text-white/85">{m.emoji} {m.ad}</p>
                    <p className="mt-0.5 text-[8.5px] leading-relaxed text-white/45">{m.aciklama}</p>
                    {secili && <Check size={11} strokeWidth={3} className="mt-1" style={{ color: "var(--accent)" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kategori önizleme */}
          <div>
            <p className="mb-1.5 text-[9px] font-black tracking-wider text-white/40">Sahne kategorileri</p>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((cat, i) => {
                const pal = CATEGORY_PALETTE[cat];
                const rol = i === 0 ? "ana" : i === 1 ? "destek" : "final";
                return (
                  <span key={cat} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold"
                    style={{
                      borderColor: i === 0 ? pal.primary : "rgba(255,255,255,.12)",
                      background: i === 0 ? `${pal.primary}22` : "rgba(255,255,255,.04)",
                      color: i === 0 ? pal.secondary : "rgba(255,255,255,.6)",
                    }}>
                    {catLabel(cat)}
                    <span className="text-[7.5px] font-black tracking-wider text-white/40">{rol}</span>
                  </span>
                );
              })}
            </div>
            <p className="mt-1 text-[8.5px] text-white/35">{senaryoNotu()}</p>
          </div>

          {/* Uyarı: ayet seçili değilse */}
          {seciliAyetSayisi === 0 && (
            <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-2.5 text-[9.5px] leading-relaxed text-amber-200/90">
              ℹ️ Henüz ayet seçmedin — sahne yine de ana arka plan olarak atanır; ayet ekleyince her ayete bu temadan klip dağıtmak için stüdyodaki "Rastgele Ata"yı kullanabilirsin.
            </p>
          )}

          {/* Uygula butonu */}
          <button type="button" onClick={uygula} disabled={uygulaniyor}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-black text-black transition hover:brightness-110 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            {uygulaniyor ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} strokeWidth={3} />}
            {uygulaniyor ? "Stüdyoya uygulanıyor..." : "Stüdyoya Uygula"}
          </button>
        </div>
      )}
    </Modal>
  );
};
