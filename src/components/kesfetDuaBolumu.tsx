// ════════════════════════════════════════════════════════
// KESFETDUABOLUMU.TSX — Keşfet > Dua Rehberi sekmesi
// KesfetModal.tsx'den ayrıldı (SRP adım 4b, 30.09)
// ★ SESLENDİRME KALDIRILDI (01.10, kullanıcı kararı): TTS ses
//   + kadın/erkek ses seçici çıkarıldı; ✓ okundu takibi kaldı.
// ════════════════════════════════════════════════════════

import React from "react";
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
  return (
        <div className="space-y-1.5">
          {/* ★ OKUNDU TAKİBİ (madde 58) — ✓ işaret cihazda kalır; seslendirme yok (01.10 kullanıcı kararı) */}
          <p className="text-center text-[9px] text-white/40">Duruma göre dualar — ✓ ile okundu işaretle (takibin cihazında kalır)</p>
          {filtreliDuaRehber.map((d, i) => {
            const anahtar = `nur_dua_okundu_${i}`;
            const okundu = (() => { try { return localStorage.getItem(anahtar) === "1"; } catch { return false; } })();
            const isaretle = () => {
              try {
                if (okundu) localStorage.removeItem(anahtar);
                else localStorage.setItem(anahtar, "1");
                duaOkunduArttir?.();
              } catch { /* yoksay */ }
            };
            return (
              <div key={i} className={`rounded-xl border p-3 ${okundu ? "border-emerald-400/30 bg-emerald-500/[.07]" : "border-white/10 bg-white/[.03]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10.5px] font-black text-white/90">🤲 {d.durum}</p>
                  <button type="button" onClick={isaretle} title={okundu ? "İşareti kaldır" : "Okundu işaretle"}
                    className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-black transition ${okundu ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50 hover:bg-white/20"}`}>✓</button>
                </div>
                <p className="mt-1 text-[10.5px] italic leading-relaxed" style={{ color: "var(--accent-2)" }}>{d.dua}</p>
                <p className="mt-1 text-[8.5px] text-white/40">— {d.kaynak}{okundu ? " · ✓ okundu" : ""}</p>
              </div>
            );
          })}
        </div>
  );
}
