import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

// ══════════════════════════════════════════════════════════════════
// ÖNERİLEN VİDEOLAR — HAZIR TASLAK SÜRÜMÜ (22.10, kullanıcı emri)
//
// Kullanıcı istedi: "önerilen atmosfer değil, ÖNERİLEN VİDEO. Cuma günü ise
// cumayı anlatan, namazı çağıran bir video: kâri seçilmiş, atmosfer atanmış,
// ayet yazılmış. Perşembe günü başka bir şey. Sürekli değişsin; herkese farklı
// da olabilir aynı da olabilir fark etmez."
//
// ▸ Kart = tam bir video TASLAĞI: güne/mübarek güne uygun ayet(ler) +
//   üyeliğiğin açtığı kâri + erişebildiği atmosfer. "🎬 Üret" → seçim
//   temizlenir, ayetler çekilir, kâri + atmosfer atanır ve üretim NORMAL
//   akışla (misafir kapısı, jeton onayı, sunucu yetkisi) başlar — öneri
//   üretimine yalancı bedava yetki verilmez.
// ▸ Rotasyon: 10 dakikalık pencere + kullanıcı karması → için sürekli
//   değişir, kullanıcıdan kullanıcıya dağılır. 🔄 ile hemen yenilenir.
// ══════════════════════════════════════════════════════════════════

import React from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import type { Clip, CatId } from "../clips";
import { gununVideosunuBul, type GununVideoKarti } from "../data/gununVideosu";

export interface OneriVideo {
  baslik: string;
  emoji: string;
  ayetler: Array<{ s: number; a: number; sName: string }>;
  katliClip: Clip;
  reciterId: string;
  reciterName: string;
}

export interface OnerilenVideolarProps {
  /** Kullanıcının erişebildiği klipler (aynı görüntü türünden) */
  havuz: Clip[];
  /** Kullanıcının ZATEN kullandığı kategoriler — öneri bunlardan kaçınır */
  kullanilanKategoriler: string[];
  /** Üyeliğin açtığı kâriler (tier süzülmüş) */
  kabileler: Array<{ id: string; name: string }>;
  generating: boolean;
  /** Çeşitlilik karması: e-posta/misafir kimliği — herkese farklı dağılır */
  userAnahtar: string;
  onUret: (oneri: OneriVideo) => void;
}

export interface OneriPaketi {
  emoji: string;
  baslik: string;
  aciklama: string;
  ayetler: Array<{ s: number; a: number; sName: string }>;
  kategoriler: CatId[];
}

// ── Hazır taslak havuzu — haftanın HER günü 3 paket ──────────────
const HAFTA_PAKETLERI: Record<number, OneriPaketi[]> = {
  0: [ // Pazar
    { emoji: "✨", baslik: "ovB0_0", aciklama: "ovA0_0", ayetler: [{ s: 112, a: 1, sName: "İhlâs" }, { s: 103, a: 1, sName: "Asr" }], kategoriler: ["yildizlar", "gece"] },
    { emoji: "🌟", baslik: "ovB0_1", aciklama: "ovA0_1", ayetler: [{ s: 13, a: 28, sName: "Ra'd" }], kategoriler: ["gece", "gol"] },
    { emoji: "🌌", baslik: "ovB0_2", aciklama: "ovA0_2", ayetler: [{ s: 56, a: 75, sName: "Vâkıa" }], kategoriler: ["yildizlar", "deniz"] },
  ],
  1: [ // Pazartesi
    { emoji: "🌱", baslik: "ovB1_0", aciklama: "ovA1_0", ayetler: [{ s: 94, a: 6, sName: "İnşirâh" }, { s: 65, a: 3, sName: "Talâk" }], kategoriler: ["gunbatimi", "daglar"] },
    { emoji: "🌿", baslik: "ovB1_1", aciklama: "ovA1_1", ayetler: [{ s: 2, a: 153, sName: "Bakara" }], kategoriler: ["orman", "cicekler"] },
    { emoji: "🌄", baslik: "ovB1_2", aciklama: "ovA1_2", ayetler: [{ s: 1, a: 1, sName: "Fâtiha" }], kategoriler: ["gunbatimi", "bulut"] },
  ],
  2: [ // Salı
    { emoji: "🌿", baslik: "ovB2_0", aciklama: "ovA2_0", ayetler: [{ s: 3, a: 139, sName: "Âl-i İmrân" }], kategoriler: ["orman", "cicekler"] },
    { emoji: "🌸", baslik: "ovB2_1", aciklama: "ovA2_1", ayetler: [{ s: 14, a: 7, sName: "İbrâhîm" }], kategoriler: ["cicekler", "cennet"] },
    { emoji: "🤍", baslik: "ovB2_2", aciklama: "ovA2_2", ayetler: [{ s: 34, a: 13, sName: "Sebe" }], kategoriler: ["desen", "orman"] },
  ],
  3: [ // Çarşamba
    { emoji: "💧", baslik: "ovB3_0", aciklama: "ovA3_0", ayetler: [{ s: 39, a: 53, sName: "Zümer" }], kategoriler: ["deniz", "selale"] },
    { emoji: "🌊", baslik: "ovB3_1", aciklama: "ovA3_1", ayetler: [{ s: 13, a: 28, sName: "Ra'd" }], kategoriler: ["deniz", "bulut"] },
    { emoji: "⛈️", baslik: "ovB3_2", aciklama: "ovA3_2", ayetler: [{ s: 24, a: 43, sName: "Nûr" }], kategoriler: ["bulut", "deniz"] },
  ],
  4: [ // Perşembe
    { emoji: "🤍", baslik: "ovB4_0", aciklama: "ovA4_0", ayetler: [{ s: 33, a: 56, sName: "Ahzâb" }], kategoriler: ["gece", "yildizlar"] },
    { emoji: "🌙", baslik: "ovB4_1", aciklama: "ovA4_1", ayetler: [{ s: 17, a: 79, sName: "İsrâ" }], kategoriler: ["gece", "yildizlar"] },
    { emoji: "✋", baslik: "ovB4_2", aciklama: "ovA4_2", ayetler: [{ s: 71, a: 10, sName: "Nûh" }], kategoriler: ["gece", "deniz"] },
  ],
  5: [ // Cuma
    { emoji: "🕌", baslik: "ovB5_0", aciklama: "ovA5_0", ayetler: [{ s: 62, a: 9, sName: "Cuma" }], kategoriler: ["cami", "musaf"] },
    { emoji: "📖", baslik: "ovB5_1", aciklama: "ovA5_1", ayetler: [{ s: 18, a: 10, sName: "Kehf" }], kategoriler: ["musaf", "daglar"] },
    { emoji: "🕊️", baslik: "ovB5_2", aciklama: "ovA5_2", ayetler: [{ s: 21, a: 107, sName: "Enbiyâ" }], kategoriler: ["cami", "gece"] },
  ],
  6: [ // Cumartesi
    { emoji: "🌊", baslik: "ovB6_0", aciklama: "ovA0_1", ayetler: [{ s: 13, a: 28, sName: "Ra'd" }], kategoriler: ["deniz", "gol"] },
    { emoji: "🏞️", baslik: "ovB6_1", aciklama: "ovA6_1", ayetler: [{ s: 55, a: 13, sName: "Rahmân" }], kategoriler: ["gol", "orman"] },
    { emoji: "⭐", baslik: "ovB6_2", aciklama: "ovA6_2", ayetler: [{ s: 108, a: 1, sName: "Kevser" }], kategoriler: ["yildizlar", "gece"] },
  ],
};

/** Mübarek gün kartını öneri paketine çevirir */
function karttanPaket(kart: GununVideoKarti): OneriPaketi {
  return { emoji: kart.emoji, baslik: kart.baslik, aciklama: kart.aciklama, ayetler: kart.ayetler, kategoriler: kart.kategoriler };
}

function karma(anahtar: string): number {
  let h = 0;
  for (const ch of anahtar) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** 10 dakikalık pencere — "sürekli değişsin" */
const PENCERE = 10 * 60 * 1000;

export const OnerilenVideolar: React.FC<OnerilenVideolarProps> = ({ havuz, kullanilanKategoriler, kabileler, generating, userAnahtar, onUret }) => {
  const [dagitucu, setDagitucu] = React.useState(0); // "🔄" ile anında yeniden dağıt
  const oneriler = React.useMemo(() => {
    if (!havuz.length || !kabileler.length) return [];
    const { kart: bugunku } = gununVideosunuBul();
    const gun = new Date().getDay();
    // Mübarek gün varsa gün kartı ÖN sıraya koyulur; yoksa hafta paketleri
    const uzunliste = HAFTA_PAKETLERI[gun] ?? HAFTA_PAKETLERI[5];
    const paketler = bugunku && bugunku.baslik !== uzunliste[0]?.baslik ? [karttanPaket(bugunku), ...uzunliste] : uzunliste;
    const pencere = Math.floor(Date.now() / PENCERE);
    const temel = pencere * 7 + karma(userAnahtar) + dagitucu * 11;
    // Kullanıcının zaten kullandığı kategorilerden kaçınan klip seçeni
    const kullanilan = new Set(kullanilanKategoriler);
    const klipTerzihi = (paket: OneriPaketi): Clip => {
      const katmanlar = havuz.filter((c) => paket.kategoriler.includes(c.cat as CatId));
      // önce KULLANILMIYAN kategoriden dene, sonra paket kategorilerinden
      const tercih = katmanlar.filter((c) => !kullanilan.has(c.cat));
      const katmanli = tercih.length ? tercih : katmanlar;
      if (!katmanli.length) return havuz[temel % havuz.length];
      return katmanli[temel % katmanli.length];
    };
    const oneriler: OneriVideo[] = [];
    const gorulenler = new Set<string>();
    for (let i = 0; i < 2 && i < paketler.length; i++) {
      const paket = paketler[(temel + i * 3) % paketler.length];
      if (gorulenler.has(paket.baslik)) continue;
      gorulenler.add(paket.baslik);
      const kabile = kabileler[(temel + i * 5) % kabileler.length];
      oneriler.push({
        baslik: paket.baslik,
        emoji: paket.emoji,
        ayetler: paket.ayetler,
        katliClip: klipTerzihi(paket),
        reciterId: kabile.id,
        reciterName: kabile.name,
      });
    }
    return oneriler;
  }, [havuz, kabileler, kullanilanKategoriler, userAnahtar, dagitucu]);

  if (!oneriler.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.02] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
          <Sparkles size={12} />
          {ttX2610("ovBaslik")}
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-black text-white/60">{ttX2610("ovBugun")}</span>
        </p>
        <button
          type="button"
          onClick={() => setDagitucu((d) => d + 1)}
          title={ttX2610("ovOnerTitle")}
          className="rounded-lg bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95"
        >
          <RefreshCw size={11} />
        </button>
      </div>
      <p className="mb-2 text-[9.5px] leading-relaxed text-white/45">
        {ttX2610("ovOzelIntro")} <b className="text-white/70">{ttX2610("ovTekTik")}</b>.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {oneriler.map((o) => (
          <div key={o.baslik} className="group relative overflow-hidden rounded-xl border border-white/10 transition hover:border-[color:var(--accent)]">
            <img
              src={o.katliClip.r2Poster || o.katliClip.poster || o.katliClip.src}
              alt={o.katliClip.label}
              onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              className="h-24 w-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2">
              <p className="truncate text-[9.5px] font-black text-white/90">{o.emoji} {ttX2610(o.baslik)}</p>
              <p className="mt-px truncate text-[8px] text-white/55">
                {o.ayetler.map((a) => `${a.sName} ${a.s}:${a.a}`).join(" · ")} · 🎤 {o.reciterName}
              </p>
              <button
                type="button"
                disabled={generating}
                onClick={() => onUret(o)}
                className="mt-1 w-full rounded-lg py-1 text-[8.5px] font-black text-black transition hover:brightness-110 active:scale-[.97] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                {generating ? ttX2610("ovUretimSuruyor") : ttX2610("ovUret")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
