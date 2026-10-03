// ════════════════════════════════════════════════════════
// GÜNÜN HAZIR VİDEOSU (01.10, kullanıcı kararı)
// Her güne özel 1 hazır video: günün ruhuna uygun ayet + atmosfer.
// "Önizlemeye yükle" → ayetler stüdyoya eklenir, atmosfer tier'a göre
// atanır. TIER KURALI: free kullanıcıya PRO/ELİT atmosfer ASLA
// yüklenmez — kartın kategori havuzu her üyelikte kendi katmanından
// seçilir (free → free kategoriler, pro → pro, elit → elit).
// Ayrıca atanan her klip isClipAccessible ile ikinci kez süzülür.
// ════════════════════════════════════════════════════════

import React from "react";
import { translate } from "../i18n";
import { gununVideosunuBul, type GununVideoKarti } from "../data/gununVideosu";
import { KATEGORI_TIER, type CatId, type Clip } from "../clips";
import { tierAtLeast, type Tier } from "../tier";

export interface GununHazirVideosuProps {
  accessTier: Tier;
  /** Ayetleri stüdyoya ekler (aynı ayet zaten seçiliyse dokunmaz) */
  ayetEkle: (s: number, a: number) => void;
  /** Ana arka planı atar — yalnızca tier'ın açtığı kliplerden */
  arkaPlanAta: (clip: Clip) => void;
  /** Kategori havuzundan kullanıcının erişebildiği klibi seçer */
  erisilebilirKlipBul: (cat: CatId) => Clip | null;
  clipKind: "img" | "vid";
}

export const GununHazirVideosu: React.FC<GununHazirVideosuProps> = ({ accessTier, ayetEkle, arkaPlanAta, erisilebilirKlipBul, clipKind }) => {
  // ★ 04.10 TUR 2: kart etiketleri seçili dilde (başlık verisi TR havuzundan gelir)
  const dil = (typeof localStorage !== "undefined" ? localStorage.getItem("nur_lang") : "tr") || "tr";
  const gt = (k: string): string => translate(dil, k);
  const { kart, ozelMi } = React.useMemo(() => gununVideosunuBul(), []);
  const [yuklendi, setYuklendi] = React.useState(false);

  const tierKatmani = (cat: CatId): Tier => KATEGORI_TIER[cat as string] ?? "free";
  // ★ TIER KURALI: kullanıcıdan KATMAN Kadar AŞAĞI — elit kartın elit kategorisi, pro'nunki
  //   pro kategorisi; free kullanıcının havuzunda yalnız free kategoriler kalır.
  const uygunKategoriler = React.useMemo(
    () => kart.kategoriler.filter((cat) => tierAtLeast(accessTier, tierKatmani(cat))),
    [kart, accessTier],
  );
  const kilitliKategoriler = kart.kategoriler.length - uygunKategoriler.length;

  const onizlemeyeYukle = () => {
    kart.ayetler.forEach((ayet) => ayetEkle(ayet.s, ayet.a));
    // ★ Atmosfer: kategori sırasıyla dene — erişilebilir klip yoksa diğer kategori
    let atanan = false;
    for (const cat of uygunKategoriler) {
      const clip = erisilebilirKlipBul(cat);
      if (clip) { arkaPlanAta(clip); atanan = true; break; }
    }
    setYuklendi(true);
    window.setTimeout(() => setYuklendi(false), 4000);
    void atanan; void kilitliKategoriler; void clipKind; // log temizliği — tier süzücü yukarıda
  };

  // ★ Ayet referansı (02.10, kullanıcı kararı): kartın ALTINDA tek satır — "Cuma 62:9 · Kehf 18:10"
  const ayetReferansi = kart.ayetler.map((a) => `${a.sName} ${a.s}:${a.a}`).join(" · ");

  return (
    <div className="relative overflow-hidden rounded-2xl border p-3.5" style={{ borderColor: ozelMi ? "rgba(215,170,82,.55)" : "rgba(255,255,255,.12)", background: ozelMi ? "linear-gradient(135deg,rgba(215,170,82,.14),rgba(215,170,82,.04))" : "rgba(255,255,255,.02)" }}>
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none" aria-hidden>{kart.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
            {gt("gvBaslik")}
            {ozelMi && <span className="rounded-full bg-amber-500/25 px-2 py-0.5 text-[8px] font-black text-amber-200">{gt("gvMubarek")}</span>}
          </p>
          <p className="mt-0.5 text-[11.5px] font-black leading-snug text-white/90">{kart.baslik}</p>
        </div>
        <button
          type="button"
          onClick={onizlemeyeYukle}
          className="shrink-0 rounded-xl px-3 py-2 text-[9.5px] font-black text-black transition hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          {yuklendi ? gt("gvYuklendi") : gt("gvYukle")}
        </button>
      </div>
      <p className="mt-1.5 truncate text-[10px] font-bold" style={{ color: "var(--accent-2)" }} title={ayetReferansi}>
        {ayetReferansi}
      </p>
    </div>
  );
};
