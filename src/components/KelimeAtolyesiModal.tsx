// ════════════════════════════════════════════════════════
// KELİME ATÖLYESİ — İş 3: Kelime Tabanlı Video Üretimi
// Kullanıcı bir kelime yazar ("sabır", "deniz", "huzur"...)
// → sistem o kelimeye uygun AYET + ATMOSFER + hazır satır önerir,
//   tek tıkla stüdyoya aktarır (ayet seçimine + atmosfere işlenir).
//
// Mimari:
// • Ayet havuzu = AYET_KARTILARI (Ayet Kütüphanesi verisi, mood etiketli)
// • Atmosfer = mevcut CatId kategorileri (clips.ts) — randomizeBackgrounds
//   ile atanır (stüdyodaki "rastgele atmosfer" ile AYNI kod yolu)
// • Aktarım = stüdyonun KENDİ addAyah akışı (API'den gerçek ayet çekilir,
//   Akıllı AI açıksa atmosferi kendisi seçer) + kategoriye rastgele klip.
// • API'siz, V2 modal deseniyle birebir aynı (open/onClose/notify).
// • Tier duyarlı: ücretsiz kullanıcıya PRO/ELİT atmosfer önerilmez,
//   tüm öneriler kilitliyken herkese açık kategorilere düşer (göl/desen/bulut).
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState } from "react";
import { translate, type Lang } from "../i18n";
import { ArrowRight, Check, Loader2, Search, X } from "lucide-react";
import { Modal } from "./UIElements";
import {
  KELIME_ONERILERI, ayetOner, normalizeKelime, receteBul,
  type KelimeRecete,
} from "../data/kelimeAtolyesi";
import { CATEGORIES, CATEGORY_PALETTE, KATEGORI_TIER, type CatId } from "../clips";
import { sureNoFromSource, type AyetKarti } from "../data/ayetKartlariData";

export interface KelimeAtolyesiModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
  /** Stüdyonun gerçek ayet-ekleme akışı — API'den ar+tr çeker, Akıllı AI atmosfer seçer */
  addAyah: (s: number, a: number, knownTranslation?: string) => Promise<void> | void;
  /** Stüdyonun rastgele atmosfer atama akışı — aynı kod yolu, aynı üretim davranışı */
  randomizeBackgrounds: (scopeCat?: CatId) => void;
  /** Erişim seviyesi — tier'ın açmadığı atmosfer kategorileri öneriden düşer */
  accessTier?: "free" | "pro" | "elit";
  /** Admin/master modu — tüm kategoriler açık sayılır */
  isMasterSurum?: boolean;
  /** Aktarım SONRASI çağrılır — stüdyo öne çıkar (isteğe bağlı) */
  onAfterImport?: () => void;
}

/** "Ra'd Suresi • 28. Ayet" → 28 (çözülemezse 0) */
function ayetNoFromSource(source: string): number {
  const after = source.split("•")[1] ?? "";
  const n = parseInt(after.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

const catLabel = (cat: CatId): string => CATEGORIES.find((c) => c.id === cat)?.label ?? cat;

// ── Tier duyarlı kategori filtresi — KATEGORI_TIER ile aynı kaynak ──
const TIER_SIRA: Record<"free" | "pro" | "elit", number> = { free: 0, pro: 1, elit: 2 };
function catsForTier(cats: CatId[], accessTier: "free" | "pro" | "elit", isMasterSurum: boolean): CatId[] {
  if (isMasterSurum) return cats;
  const seviye = TIER_SIRA[accessTier] ?? 0;
  return cats.filter((c) => seviye >= (TIER_SIRA[(KATEGORI_TIER[c] ?? "free") as "free" | "pro" | "elit"] ?? 0));
}
// Reçetenin tüm kategorileri kilitliyse kullanılan herkese açık sıra
const HERKESE_ACIK: CatId[] = ["gol", "desen", "bulut"];

export const KelimeAtolyesiModal: React.FC<KelimeAtolyesiModalProps> = ({
  open, onClose, notify, addAyah, randomizeBackgrounds,
  accessTier = "free", isMasterSurum = false, onAfterImport,
  lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [kelime, setKelime] = useState("");
  const [aktifRecete, setAktifRecete] = useState<KelimeRecete | null>(null);
  const [tamEslesme, setTamEslesme] = useState(false);
  const [ayetler, setAyetler] = useState<AyetKarti[]>([]);
  const [catsGorunen, setCatsGorunen] = useState<CatId[]>([]);
  const [seciliCat, setSeciliCat] = useState<CatId | null>(null);
  /** Çoklu seçim: işaretli ayet indeksleri (varsayılan: ilk öneri) */
  const [seciliAyetler, setSeciliAyetler] = useState<Set<number>>(new Set([0]));
  const toggleAyet = useCallback((i: number) => {
    setSeciliAyetler((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  // ── Reçete çözümle (kelime değişince) ─────────────────────
  useEffect(() => {
    if (!open) return;
    const q = normalizeKelime(kelime);
    if (q.length < 2) {
      setAktifRecete(null);
      setAyetler([]);
      setSeciliCat(null);
      return;
    }
    const sonuc = receteBul(kelime);
    const gorunen = catsForTier(sonuc.recete.cats, accessTier, isMasterSurum);
    setAktifRecete(sonuc.recete);
    setTamEslesme(sonuc.tam);
    setAyetler(ayetOner(sonuc.recete, kelime, 6));
    setSeciliAyetler(new Set([0])); // varsayılan: ilk öneri işaretli
    setCatsGorunen(gorunen.length ? gorunen : HERKESE_ACIK);
    setSeciliCat(null); // null = reçetenin ilk görünür kategorisi kullanılır
  }, [kelime, open, accessTier, isMasterSurum]);

  // ── Aktar: tek tık → stüdyo (seçilen TÜM ayetler sırayla) ──
  const aktar = useCallback(async () => {
    if (!aktifRecete || gonderiliyor) return;
    if (seciliAyetler.size === 0) {
      notify?.("Önce en az bir ayet işaretle — kartlara tıklayarak seçebilirsin");
      return;
    }
    setGonderiliyor(true);
    try {
      const hedefler = ayetler.filter((_, i) => seciliAyetler.has(i));
      const gecerli: typeof hedefler = [];
      for (const hedef of hedefler) {
        const s = sureNoFromSource(hedef.source);
        const a = ayetNoFromSource(hedef.source);
        if (s > 0 && a > 0) {
          // Stüdyonun gerçek akışı: API'den ar+tr çeker, Akıllı AI atmosferi seçer
          await addAyah(s, a, hedef.tr);
          gecerli.push(hedef);
        }
      }
      if (gecerli.length === 0) {
        notify?.("Ayet kaynakları çözümlenemedi — atmosfer yine de uygulandı");
      }
      // Atmosfer: seçilen (veya reçetenin ilk görünür) kategoriden rastgele klip
      const cat: CatId | undefined = seciliCat ?? catsGorunen[0];
      if (cat) randomizeBackgrounds(cat);
      const adet = gecerli.length;
      notify?.(adet === 1
        ? `✨ "${aktifRecete.etiket}" stüdyoya aktarıldı — ayet + atmosfer hazır!`
        : `✨ ${adet} ayet "${aktifRecete.etiket}" temasıyla stüdyoya aktarıldı — atmosfer hazır!`);
      onAfterImport?.();
      onClose();
    } catch {
      notify?.("Aktarım sırasında bir sorun oldu — tekrar dene");
    } finally {
      setGonderiliyor(false);
    }
  }, [aktifRecete, ayetler, seciliAyetler, seciliCat, catsGorunen, gonderiliyor, addAyah, randomizeBackgrounds, notify, onAfterImport, onClose]);

  // ★ Hook'lardan SONRA erken dönüş
  if (!open) return null;

  // ★ KAPATMA FIX (30.09, kullanıcı bildirimi): onClose prop'u hiç geçilmemişti —
  //   Modal'ın X butonu ve dış-tıklama kapatması onClose'u çağırır; undefined olunca
  //   hiçbir şey yapmıyordu (modal takılı kalıyordu). Esc desteği Modal'da zaten var.
  return (
    <Modal title={tt("v2KelimeAtolyesiTitle")} sub={tt("v2KelimeAtolyesiSub")} wide onClose={onClose}>
      {/* Arama satırı */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={kelime}
          onChange={(e) => setKelime(e.target.value)}
          placeholder="Bir kelime yaz... (ör: sabır, deniz, huzur)"
          className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-9 text-[11px] outline-none placeholder:text-white/30"
        />
        {kelime && (
          <button type="button" onClick={() => setKelime("")} title="Temizle"
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/50 transition hover:bg-red-500/25 hover:text-red-300">
            <X size={11} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Öneri çipleri — kelime yazılmamışken */}
      {!aktifRecete && (
        <div className="mb-1 flex flex-wrap gap-1.5">
          {KELIME_ONERILERI.map((o) => (
            <button key={o} type="button" onClick={() => setKelime(o)}
              className="glass-soft rounded-full px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:text-white">
              {o}
            </button>
          ))}
        </div>
      )}

      {/* Reçete kartı */}
      {aktifRecete && (
        <div className="space-y-3">
          {/* Tema başlığı + hazır satır */}
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3.5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[18px]">{aktifRecete.emoji}</span>
              <h4 className="font-display text-[13px] font-bold" style={{ color: "var(--accent-2)" }}>
                {aktifRecete.etiket} Teması
              </h4>
              {!tamEslesme && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold text-white/50">yaklaşık eşleşme</span>
              )}
            </div>
            <p className="text-[10px] leading-relaxed text-white/55">{aktifRecete.aciklama}</p>
            <p className="mt-2 rounded-lg border border-white/5 bg-black/20 p-2 text-center text-[11px] italic text-white/80">
              "{aktifRecete.satir}"
            </p>
          </div>

          {/* Ayet önerileri — çoklu seçim: istediğin kadar kartı işaretle */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[9px] font-black tracking-wider text-white/40">Ayet önerileri · işaretlediklerin aktarılır</p>
              {ayetler.length > 0 && (
                <button type="button"
                  onClick={() => setSeciliAyetler(seciliAyetler.size === ayetler.length ? new Set() : new Set(ayetler.map((_, i) => i)))}
                  className="text-[8.5px] font-bold text-white/45 underline-offset-2 transition hover:text-white/80 hover:underline">
                  {seciliAyetler.size === ayetler.length ? "hiçbiri" : "tümünü seç"}
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ayetler.map((k, i) => {
                const secili = seciliAyetler.has(i);
                return (
                  <button key={k.id} type="button" onClick={() => toggleAyet(i)}
                    className="relative rounded-xl border p-2.5 text-left transition"
                    style={{
                      borderColor: secili ? "var(--accent)" : "rgba(255,255,255,.10)",
                      background: secili ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)",
                    }}>
                    {k.kelimeGecti && (
                      <span className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[7px] font-black"
                        style={{ background: "rgba(255,255,255,.10)", color: "var(--accent-2)" }}>
                        ✍️ kelime geçiyor
                      </span>
                    )}
                    <p className={`mb-1 text-right font-arabic text-[15px] leading-relaxed ${secili ? "" : "opacity-80"} ${k.kelimeGecti ? "pt-4" : ""}`} style={{ color: "var(--accent-2)" }}>{k.ar}</p>
                    <p className="mb-1.5 line-clamp-2 text-[9.5px] leading-relaxed text-white/60">{k.tr}</p>
                    <p className="text-[8.5px] font-bold" style={{ color: "var(--accent)" }}>{k.source}</p>
                    {secili && (
                      <span className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                        <Check size={10} strokeWidth={4} className="text-black" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[8.5px] leading-relaxed text-white/35">
              İşaretlediğin ayetler sırayla stüdyoya eklenir (API'den tam metinleri gelir); stüdyo listesinden ekleyip çıkarabilirsin.
              "✍️ kelime geçiyor" rozeti, yazdığın kelimenin ayetin mealinde bulunduğunu gösterir.
              Ayet havuzu Ayet Kütüphanesi'nden, atmosfer R2 kütüphanesinden seçilir.
            </p>
          </div>

          {/* Atmosfer önerileri */}
          <div>
            <p className="mb-1.5 text-[9px] font-black tracking-wider text-white/40">Atmosfer önerileri</p>
            <div className="flex flex-wrap gap-1.5">
              {catsGorunen.map((cat) => {
                const pal = CATEGORY_PALETTE[cat];
                const secili = seciliCat === cat;
                return (
                  <button key={cat} type="button" onClick={() => setSeciliCat(secili ? null : cat)}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition"
                    style={{
                      borderColor: secili ? pal.primary : "rgba(255,255,255,.12)",
                      background: secili ? `${pal.primary}22` : "rgba(255,255,255,.04)",
                      color: secili ? pal.secondary : "rgba(255,255,255,.6)",
                    }}>
                    {catLabel(cat)}
                    {secili && <Check size={11} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[8.5px] text-white/35">
              Aktarırken seçtiğin kategoriden rastgele klip atanır; stüdyoda tek tıkla değiştirebilirsin.
            </p>
          </div>

          {/* Aktar butonu */}
          <button type="button" onClick={aktar} disabled={gonderiliyor}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-black text-black transition hover:brightness-110 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            {gonderiliyor ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} strokeWidth={3} />}
            {gonderiliyor
              ? "Stüdyoya aktarılıyor..."
              : seciliAyetler.size > 1
                ? `${seciliAyetler.size} Ayeti Stüdyoya Aktar`
                : "Stüdyoya Aktar"}
          </button>
        </div>
      )}
    </Modal>
  );
};
