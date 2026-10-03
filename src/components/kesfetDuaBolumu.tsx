// ════════════════════════════════════════════════════════
// KESFETDUABOLUMU.TSX — Keşfet > Dua Rehberi sekmesi
// KesfetModal.tsx'den ayrıldı (SRP adım 4b, 30.09)
// ★ SESLENDİRME KALDIRILDI (01.10, kullanıcı kararı): TTS ses
//   + kadın/erkek ses seçici çıkarıldı; ✓ okundu takibi kaldı.
// ★ GÜNÜN DUASI (03.10): güne göre deterministik dua seçilir,
//   altın çerçeveli İLK kart olarak öne çıkar (filtrede varsa);
//   ✓ anahtarları sıralamadan bağımsız content-based.
// ════════════════════════════════════════════════════════

import React from "react";
import { DUA_REHBERİ } from "../data/kesfetData";
import type { DuaRehber } from "../data/kesfetData";

export function DuaRehberBolumu({
  filtreliDuaRehber,
  duaOkunduTick,
  duaOkunduArttir,
}: {
  filtreliDuaRehber: DuaRehber[];
  duaOkunduTick: number;
  duaOkunduArttir?: () => void;
}) {
  void duaOkunduTick; // okundu işaretleme localStorage'da — tick yeniden çizim tetikler

  // ── GÜNÜN DUASI — yerel gece yarısına göre gün no; 12 dua sırayla döner, cihaz günü değişince yenilenir
  const gununDuasi = (() => {
    const simdi = new Date();
    const gunNo = Math.floor((simdi.getTime() - simdi.getTimezoneOffset() * 60000) / 86400000);
    return DUA_REHBERİ[gunNo % DUA_REHBERİ.length];
  })();
  const filtredeVar = filtreliDuaRehber.some((d) => d.durum === gununDuasi.durum);
  const gosterilecek: DuaRehber[] = filtredeVar
    ? [gununDuasi, ...filtreliDuaRehber.filter((d) => d.durum !== gununDuasi.durum)]
    : filtreliDuaRehber;

  return (
    <div className="space-y-1.5">
      {/* ★ OKUNDU TAKİBİ — ✓ cihazda kalır; anahtar durum metnine bağlı, sıra değişse de işaret kaymaz */}
      <p className="text-center text-[9px] text-white/40">Duruma göre dualar — ✓ ile okundu işaretle (takibin cihazında kalır)</p>
      {gosterilecek.map((d) => {
        const gununMu = filtredeVar && d.durum === gununDuasi.durum;
        const anahtar = `nur_dua_okundu_${encodeURIComponent(d.durum)}`;
        const okundu = (() => { try { return localStorage.getItem(anahtar) === "1"; } catch { return false; } })();
        const isaretle = () => {
          try {
            if (okundu) localStorage.removeItem(anahtar);
            else localStorage.setItem(anahtar, "1");
            duaOkunduArttir?.();
          } catch { /* yoksay */ }
        };
        const govde = (
          <>
            {gununMu && (
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="rounded-lg px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>🌟 GÜNÜN DUASI</span>
                <button type="button" onClick={isaretle} title={okundu ? "İşareti kaldır" : "Okundu işaretle"}
                  className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-black transition ${okundu ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50 hover:bg-white/20"}`}>✓</button>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-black text-white/90">🤲 {d.durum}</p>
              {!gununMu && (
                <button type="button" onClick={isaretle} title={okundu ? "İşareti kaldır" : "Okundu işaretle"}
                  className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-black transition ${okundu ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50 hover:bg-white/20"}`}>✓</button>
              )}
            </div>
            <p className="mt-1 text-[10.5px] italic leading-relaxed" style={{ color: "var(--accent-2)" }}>{d.dua}</p>
            <p className="mt-1 text-[8.5px] text-white/40">— {d.kaynak}{okundu ? " · ✓ okundu" : ""}</p>
          </>
        );
        return gununMu ? (
          <div key={anahtar} className="rounded-xl p-[1.5px]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))", boxShadow: "0 0 16px rgba(215,170,82,.22)" }}>
            <div className={`rounded-[10.5px] p-3 ${okundu ? "bg-emerald-500/[.07]" : "bg-white/[.05]"}`}>{govde}</div>
          </div>
        ) : (
          <div key={anahtar} className={`rounded-xl border p-3 ${okundu ? "border-emerald-400/30 bg-emerald-500/[.07]" : "border-white/10 bg-white/[.03]"}`}>
            {govde}
          </div>
        );
      })}
    </div>
  );
}
