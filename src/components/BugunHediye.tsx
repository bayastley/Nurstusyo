// ════════════════════════════════════════════════════════
// BUGÜNÜN HEDİYESİ — günlük RASTGELE kilit açma (20.11 yeniden yazım)
// Günde bir kez: rastgele bir özellik 4 saatliğine açılır
//   🎬 Tam Sürüm · 🗂️ Toplu Üretim · 🤖 Akıllı AI · 🖋️ Hat Sanatı
// ELİT üyede süre 12 saat + ikinci bir hediye.
// Seçim (e-posta + gün) tohumlu → aynı gün kutu kapanıp açılsa da hediye değişmez.
// Açılan kilitler microUnlock.ts üzerinden yazılır; özellik kapıları
// (Tam Sürüm / Toplu / Akıllı AI / Hat paleti) bu anahtarları okur.
// Cihazda saklanır, sunucuya gitmez.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Gift, X } from "lucide-react";
import { grantMicroUnlock, tierAtLeast, type MicroUnlockKey, type Tier } from "../tier";
import { translate, type Lang } from "../i18n";

const HEDIYE_GUN_KEY = "nur_hediye_gun";       // son alınan gün "YYYY-MM-DD"
const HEDIYE_CLAIM_KEY = "nur_hediye_claim";   // bugün alınan hediyenin özeti (kalan süre için)

const bugunStr = () => new Date().toISOString().slice(0, 10);

interface Perk {
  key: MicroUnlockKey;
  adK: string;
  acK: string;
  emoji: string;
}

/** Hediye havuzu — her biri GERÇEKTEN kilitli olan bir özelliği açar. */
const PERKLER: Perk[] = [
  { key: "full_mode", adK: "bhPerkFull", acK: "bhPerkFullD", emoji: "🎬" },
  { key: "batch",     adK: "bhPerkBatch", acK: "bhPerkBatchD", emoji: "🗂️" },
  { key: "ai_smart",  adK: "bhPerkAi", acK: "bhPerkAiD", emoji: "🤖" },
  { key: "hat",       adK: "bhPerkHat", acK: "bhPerkHatD", emoji: "🖋️" },
];

/** FNV-1a — e-posta + gün tohumundan deterministik seçim */
function karisim(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

interface VerilenHediye {
  key: MicroUnlockKey;
  adK: string;
  acK: string;
  emoji: string;
  saat: number;
  bitis: number;
}

/** Bugünün hediyesi — gün + e-posta tohumlu (her gün, herkese farklı) */
function hediyeUret(email: string, elit: boolean): { saat: number; elit: boolean; perks: Perk[] } {
  const gun = Math.floor(Date.now() / 86_400_000);
  const h = karisim(`${email}|${gun}|nur-hediye`);
  const saat = elit ? 12 : 4;
  const ilk = PERKLER[h % PERKLER.length];
  const perks: Perk[] = [ilk];
  if (elit) {
    const ikinci = PERKLER[(Math.floor(h / 7) + 1) % PERKLER.length];
    if (ikinci.key !== ilk.key) perks.push(ikinci);
  }
  return { saat, elit, perks };
}

export interface BugunHediyeProps {
  notify: (msg: string) => void;
  /** Ödül gerçek cüzdana yazıldıysa sayaç tazelenir (bu hediyede kullanılmaz, uyum için durur) */
  onHakDegisti?: () => void;
  /** Hediye YALNIZ girişli kullanıcılara — e-posta oturumdan gelir */
  userEmail?: string | null;
  lang?: Lang;
  /** ELİT üye → süre uzar (12 saat) + ekstra hediye */
  tier?: Tier;
}

export const BugunHediye: React.FC<BugunHediyeProps> = ({ notify, onHakDegisti, userEmail, lang = "tr", tier }) => {
  const [acik, setAcik] = useState(false);
  const [alindi, setAlindi] = useState<VerilenHediye[] | null>(null);
  const [simdi, setSimdi] = useState(() => Date.now());

  const tt = useCallback((k: string): string => translate(lang, k), [lang]);
  const elit = tier ? tierAtLeast(tier, "elit") : false;

  // ── Bugünün teklifi: gün + e-posta tohumlu, gün içinde sabit ──
  const teklif = useMemo(() => (userEmail ? hediyeUret(userEmail, elit) : null), [userEmail, elit]);

  // ── Alındıysa kalan süreyi canlı tut ──
  useEffect(() => {
    const t = window.setInterval(() => setSimdi(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // ── 31.10: hafızlık testi özetindeki ipucu 'nur-hediye-ac' olayı ile kutuyu açar ──
  useEffect(() => {
    const hediyeAc = () => {
      if (!userEmail) { notify(tt("bhGirisGerekli")); return; }
      try {
        if (localStorage.getItem(HEDIYE_GUN_KEY) === bugunStr()) { notify(tt("bhYarin")); return; }
      } catch { /* yut */ }
      setAcik(true);
    };
    window.addEventListener("nur-hediye-ac", hediyeAc);
    return () => window.removeEventListener("nur-hediye-ac", hediyeAc);
  }, [userEmail, notify, tt]);

  // ── Al: kilitleri gerçekten aç, günü damgala, kalan süreyle göster ──
  const al = useCallback(() => {
    if (!teklif) return;
    const bitis = Date.now() + teklif.saat * 3_600_000;
    const verilen: VerilenHediye[] = teklif.perks.map((p) => ({ ...p, saat: teklif.saat, bitis }));
    try {
      for (const p of verilen) grantMicroUnlock(p.key, p.saat);
      localStorage.setItem(HEDIYE_GUN_KEY, bugunStr());
      localStorage.setItem(HEDIYE_CLAIM_KEY, JSON.stringify({ gun: bugunStr(), perks: verilen }));
    } catch { /* localStorage kapalıysa sessizce atla */ }
    // Açık sayfadaki kilitli düğmeler (Akıllı AI, hat paleti…) hemen tazelensin
    try { window.dispatchEvent(new CustomEvent("nur-micro-unlock")); } catch { /* yut */ }
    notify(tt("bhPerkAlindiBildirim").replace("{x}", tt(verilen[0].adK)));
    setAcik(false);
    setAlindi(verilen);
    try { onHakDegisti?.(); } catch { /* yut */ }
    setSimdi(Date.now());
  }, [teklif, notify, tt, onHakDegisti]);

  // ── Kalan süre metni ──
  const kalan = (bitis: number): string => {
    const ms = Math.max(0, bitis - simdi);
    const sa = Math.floor(ms / 3_600_000);
    const dk = Math.floor((ms % 3_600_000) / 60_000);
    return tt("bhPerkKalan").replace("{h}", String(sa)).replace("{m}", String(dk));
  };

  if (!teklif || !userEmail) return null;
  // Bugün alındıysa ve onay ekranı kapandıysa hiçbir şey gösterme
  if (!acik && !alindi) {
    try {
      if (localStorage.getItem(HEDIYE_GUN_KEY) === bugunStr()) return null;
    } catch { /* yut */ }
  }

  return (
    <>
      {/* 🎁 Buton — sol alt (mini turun hedefi) */}
      {!acik && !alindi && (
        <button
          type="button"
          data-minitur="bugun-hediye"
          onClick={() => setAcik(true)}
          className="fixed bottom-20 left-3 z-[85] flex h-10 w-10 items-center justify-center rounded-full shadow-2xl transition hover:scale-110 active:scale-95 md:bottom-4 md:left-4 md:h-11 md:w-11"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          title={tt("bhPerkBaslik")}
        >
          <Gift size={18} className="text-black" />
        </button>
      )}

      {/* HEDİYE KUTUSU — bugün ne açılacağı açık yazılı */}
      {acik && !alindi && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setAcik(false)}>
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 text-center shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.4)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAcik(false)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={14} /></button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl animate-bounce" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              <Gift size={26} className="text-black" />
            </div>

            <h3 className="font-display text-[15px] font-black" style={{ color: "var(--accent-2)" }}>{tt("bhPerkBaslik")}</h3>

            <div className="mt-3 space-y-2">
              {teklif.perks.map((p) => (
                <div key={p.key} className="rounded-xl bg-white/[.04] px-4 py-3">
                  <p className="text-[20px] leading-none">{p.emoji}</p>
                  <p className="mt-1 text-[13px] font-black text-white">{tt(p.adK)}</p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-white/60">{tt(p.acK)}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 flex items-center justify-center gap-1 text-[10px] font-black" style={{ color: "var(--accent)" }}>
              <Clock size={11} /> {tt("bhPerkSure").replace("{h}", String(teklif.saat))}
            </p>
            {elit && <p className="mt-1 text-[9px] font-bold text-amber-200/80">{tt("bhPerkElitNot").replace("{h}", String(teklif.saat))}</p>}

            <button
              type="button"
              onClick={al}
              className="mt-4 w-full rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {tt("bhPerkAl")}
            </button>
            <p className="mt-2 text-[8px] text-white/30">{tt("bhYarin")}</p>
          </div>
        </div>
      )}

      {/* ALINDI EKRANI — ne açıldı, ne kadar kaldı */}
      {alindi && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setAlindi(null)}>
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 text-center shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.4)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAlindi(null)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={14} /></button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#34d399,var(--accent))" }}>
              <span className="text-2xl">🎉</span>
            </div>

            <h3 className="font-display text-[15px] font-black text-emerald-300">{tt("bhKazandi")}</h3>

            <div className="mt-3 space-y-2">
              {alindi.map((p) => (
                <div key={p.key} className="rounded-xl bg-white/[.04] px-4 py-2.5 text-left">
                  <p className="text-[12px] font-black text-white">{p.emoji} {tt(p.adK)}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[9.5px] font-bold" style={{ color: "var(--accent)" }}>
                    <Clock size={10} /> {tt("bhPerkSure").replace("{h}", String(p.saat))} · {kalan(p.bitis)}
                  </p>
                </div>
              ))}
            </div>

            {elit && <p className="mt-2 text-[9px] font-bold text-amber-200/80">{tt("bhPerkElitNot").replace("{h}", String(alindi[0].saat))}</p>}
            <p className="mt-1.5 text-[8.5px] text-white/35">{tt("bhPerkNasil")}</p>

            <button
              type="button"
              onClick={() => setAlindi(null)}
              className="mt-3 w-full rounded-xl py-2.5 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {tt("bhKapat")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
