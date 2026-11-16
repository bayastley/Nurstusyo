import React, { useState, useEffect } from "react";
import { DUA_REHBERİ } from "../data/duaData";
import type { DuaRehber } from "../data/duaData";
import { translate } from "../i18n";

const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

const KISISEL_DUA_KEY = "nur_kisisel_dualar_v1";

interface KisiselDua {
  id: string;
  metin: string;
  ts: number;
}

function kisiselOku(): KisiselDua[] {
  try { return JSON.parse(localStorage.getItem(KISISEL_DUA_KEY) || "[]"); } catch { return []; }
}
function kisiselYaz(l: KisiselDua[]) {
  try { localStorage.setItem(KISISEL_DUA_KEY, JSON.stringify(l)); } catch { /* ignore */ }
}

export function DuaRehberBolumu({
  filtreliDuaRehber,
  duaOkunduTick,
  duaOkunduArttir,
}: {
  filtreliDuaRehber: DuaRehber[];
  duaOkunduTick: number;
  duaOkunduArttir?: () => void;
}) {
  void duaOkunduTick;

  const [kisisel, setKisisel] = useState<KisiselDua[]>([]);
  const [yeniDua, setYeniDua] = useState("");

  useEffect(() => { setKisisel(kisiselOku()); }, []);

  const gununDuasi = (() => {
    const simdi = new Date();
    const gunNo = Math.floor((simdi.getTime() - simdi.getTimezoneOffset() * 60000) / 86400000);
    return DUA_REHBERİ[gunNo % DUA_REHBERİ.length];
  })();
  const filtredeVar = filtreliDuaRehber.some((d) => d.durum === gununDuasi.durum);
  const gosterilecek: DuaRehber[] = filtredeVar
    ? [gununDuasi, ...filtreliDuaRehber.filter((d) => d.durum !== gununDuasi.durum)]
    : filtreliDuaRehber;

  const ekleKisisel = () => {
    const m = yeniDua.trim();
    if (!m) return;
    const yeni = [{ id: `${Date.now()}`, metin: m, ts: Date.now() }, ...kisisel];
    setKisisel(yeni);
    kisiselYaz(yeni);
    setYeniDua("");
  };
  const silKisisel = (id: string) => {
    const yeni = kisisel.filter((d) => d.id !== id);
    setKisisel(yeni);
    kisiselYaz(yeni);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-400/20 bg-amber-500/[.06] p-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
          {ttX2610("ksfDuaDefterim") || "Dua Defterim"}
        </p>
        <p className="mb-2 text-[9px] text-white/45">
          {ttX2610("ksfDuaDefterimNot") || "Kişisel dualarını yaz ve kaydet. Yalnızca bu cihazda saklanır."}
        </p>
        <textarea
          value={yeniDua}
          onChange={(e) => setYeniDua(e.target.value)}
          rows={2}
          placeholder={ttX2610("ksfDuaDefterimPlaceholder") || "Duanı yaz..."}
          className="mb-2 w-full resize-none rounded-lg bg-white/5 px-3 py-2 text-[10.5px] text-white outline-none placeholder:text-white/25"
        />
        <button type="button" onClick={ekleKisisel}
          className="w-full rounded-lg py-2 text-[10px] font-black text-black transition hover:brightness-110"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
          {ttX2610("ksfDuaDefterimKaydet") || "Kaydet"}
        </button>
        {kisisel.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {kisisel.map((d) => (
              <div key={d.id} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[.03] p-2">
                <p className="flex-1 text-[10px] leading-relaxed text-white/80 whitespace-pre-wrap">{d.metin}</p>
                <button type="button" onClick={() => silKisisel(d.id)} className="text-[10px] text-white/35 hover:text-red-300">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-center text-[9px] text-white/40">{ttX2610("ksfDuaNot")}</p>
        {gosterilecek.map((d) => {
          const gununMu = filtredeVar && d.durum === gununDuasi.durum;
          const anahtar = `nur_dua_okundu_${encodeURIComponent(d.durum)}`;
          const okundu = (() => { try { return localStorage.getItem(anahtar) === "1"; } catch { return false; } })();
          const isaretle = () => {
            try {
              if (okundu) localStorage.removeItem(anahtar);
              else localStorage.setItem(anahtar, "1");
              duaOkunduArttir?.();
            } catch { /* ignore */ }
          };
          const govde = (
            <>
              {gununMu && (
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="rounded-lg px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{ttX2610("ksfGununDua")}</span>
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
    </div>
  );
}
