// ════════════════════════════════════════════════════════
// KESFETDUABOLUMU.TSX — Keşfet > Dua Rehberi sekmesi
// KesfetModal.tsx'den ayrıldı (SRP adım 4b, 30.09)
// Sesli dua takibi: 🔊 dinle (TTS + kaliteli ses seçimi) + ✓ okundu
// ════════════════════════════════════════════════════════

import React from "react";
import { DuaSesSecici, duaSesTercihiOku, enIyiTurkceSes } from "./kesfetTemel";
import type { DuaRehber } from "../data/kesfetData";

export function DuaRehberBolumu({
  notify,
  filtreliDuaRehber,
  duaOkunduTick,
}: {
  notify?: (m: string) => void;
  filtreliDuaRehber: DuaRehber[];
  duaOkunduTick: number;
}) {
  void duaOkunduTick; // okundu işaretleme localStorage'da — tick yeniden çizim tetikler
  return (
        <div className="space-y-1.5">
          {/* ★ SESLİ DUA TAKİBİ (madde 58) — 🔊 dinle (tarayıcı TTS) + ✓ okundu */}
          {/* ★ SES SEÇİMİ (28.09): kaliteli kadın/erkek sesi tercihi — cihazdaki Türkçe sesler
              arasından en iyisi otomatik seçilir (Emel/Filiz/Yelda/Google = kadın; Tolga = erkek) */}
          <DuaSesSecici notify={notify} />
          <p className="text-center text-[9px] text-white/40">Duruma göre dualar — 🔊 ile dinleyerek oku, ✓ ile işaretle (takibin cihazında kalır)</p>
          {filtreliDuaRehber.map((d, i) => {
            const anahtar = `nur_dua_okundu_${i}`;
            const okundu = (() => { try { return localStorage.getItem(anahtar) === "1"; } catch { return false; } })();
            const dinle = async () => {
              try {
                if (!("speechSynthesis" in window)) { notify?.("Tarayıcın sesli okumayı desteklemiyor"); return; }
                window.speechSynthesis.cancel();
                const utt = new SpeechSynthesisUtterance(d.dua);
                utt.lang = "tr-TR"; utt.rate = 0.92; utt.pitch = 1.0;
                // ★ KALİTELİ SES SEÇİMİ — async ses listesi bekle + kadın/erkek tercihi
                const tercih = duaSesTercihiOku();
                const ses = await enIyiTurkceSes(tercih);
                if (ses) utt.voice = ses;
                window.speechSynthesis.speak(utt);
              } catch { notify?.("Sesli okuma başlatılamadı"); }
            };
            const isaretle = () => {
              try {
                if (okundu) localStorage.removeItem(anahtar);
                else localStorage.setItem(anahtar, "1");
                setDuaOkunduTick((v) => v + 1);
              } catch { /* yoksay */ }
            };
            return (
              <div key={i} className={`rounded-xl border p-3 ${okundu ? "border-emerald-400/30 bg-emerald-500/[.07]" : "border-white/10 bg-white/[.03]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10.5px] font-black text-white/90">🤲 {d.durum}</p>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={dinle} title="Sesli dinle"
                      className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-black text-white/70 transition hover:bg-white/20">🔊</button>
                    <button type="button" onClick={isaretle} title={okundu ? "İşareti kaldır" : "Okundu işaretle"}
                      className={`rounded-lg px-2 py-1 text-[9px] font-black transition ${okundu ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50 hover:bg-white/20"}`}>✓</button>
                  </div>
                </div>
                <p className="mt-1 text-[10.5px] italic leading-relaxed" style={{ color: "var(--accent-2)" }}>{d.dua}</p>
                <p className="mt-1 text-[8.5px] text-white/40">— {d.kaynak}{okundu ? " · ✓ okundu" : ""}</p>
              </div>
            );
          })}
        </div>
  );
}
