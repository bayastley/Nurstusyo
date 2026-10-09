// ════════════════════════════════════════════════════════
// ISLAMICTOOLSTAKIP.TSX — islamicToolsVucut'tan taşındı (SRP parçalama, 09.10)
// Dua/Ezkâr takibi + Salah Tracker + Toplu Hatim + Hatim Takibi.
// Dışa açık adlar birebir korunur — import edenlerin bağlantısı KOPMAZ.
// ════════════════════════════════════════════════════════

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { SURE_LISTESI, CUZ_SURELER, DAILY_DUAS } from "./islamicToolsVeri";

// ═══════════ ISLAMICTOOLSBOLUMLERI.TSX BLOK: takip (kaynak 287-523) ═══════════
export function DuaTakip() {
  const KEY = "nur_dua_takip_v1";
  const [okunan, setOkunan] = useState<Record<string, number[]>>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  });
  const bugun = new Date().toISOString().slice(0, 10);
  const bugunku = okunan[bugun] || [];
  void DAILY_DUAS;

  const toggle = (idx: number) => {
    const mevcut = okunan[bugun] || [];
    const yeni = mevcut.includes(idx) ? mevcut.filter((x) => x !== idx) : [...mevcut, idx];
    const yeniKayit = { ...okunan, [bugun]: yeni };
    setOkunan(yeniKayit);
    try { localStorage.setItem(KEY, JSON.stringify(yeniKayit)); } catch {}
  };

  // Sabah/akşam ezkârı indeksleri (DAILY_DUAS dizisindeki sıraları)
  const EZKAR_IDX = [0, 1]; // 0: Sabah Ezkârı, 1: Akşam Ezkârı
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[.06] p-3">
      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">🗣️ Ezkâr Takibi — bugün</p>
      <div className="flex gap-1.5">
        {EZKAR_IDX.map((idx) => {
          const isaretli = bugunku.includes(idx);
          return (
            <button key={idx} type="button" onClick={() => toggle(idx)}
              className={`flex-1 rounded-lg px-2 py-2 text-[9.5px] font-bold transition active:scale-95 ${isaretli ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-white/5 text-white/45 hover:bg-white/10"}`}>
              {isaretli ? "✓ " : "○ "}{idx === 0 ? "Sabah Ezkârı" : "Akşam Ezkârı"}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[8px] text-white/35">Okuduktan sonra işaretle — kayıtlar cihazında kalır, seri alışkanlık kazan.</p>
    </div>
  );
}

// ★ SALAH TRACKER (madde 45) — 5 vakiti işaretle, seri (streak) sayacı
export const SALAH_KEY = "nur_salah_tracker_v1";
export const SALAH_5 = ["İmsak", "Öğle", "İkindi", "Akşam", "Yatsı"];
export function SalahTracker() {
  const [kayit, setKayit] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem(SALAH_KEY) || "{}"); } catch { return {}; }
  });
  const bugun = new Date().toISOString().slice(0, 10);
  const bugunVakitler = kayit[bugun] || [];

  const toggle = (vakit: string) => {
    const mevcut = kayit[bugun] || [];
    const yeni = mevcut.includes(vakit) ? mevcut.filter((v) => v !== vakit) : [...mevcut, vakit];
    const yeniKayit = { ...kayit, [bugun]: yeni };
    setKayit(yeniKayit);
    try { localStorage.setItem(SALAH_KEY, JSON.stringify(yeniKayit)); } catch {}
  };

  // Seri (streak): dünden geriye doğru tam günleri say (5 vakit birden)
  const streak = (() => {
    let s = 0;
    const d = new Date();
    for (;;) {
      const key = d.toISOString().slice(0, 10);
      const liste = kayit[key];
      if (liste && liste.length === 5) s++;
      else if (key !== bugun) break; // bugün henüz eksik olabilir, devam et
      else if (s === 0 && liste && liste.length < 5) { /* bugün yarım — streak dünden devam edebilir */ }
      d.setDate(d.getDate() - 1);
      if (key < "2020-01-01") break;
    }
    return s;
  })();

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[.07] p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300/80">✅ Bugünün Vakitleri</p>
          {streak > 0 && <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-black text-orange-300">🔥 {streak} gün seri</span>}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SALAH_5.map((v) => {
            const isaretli = bugunVakitler.includes(v);
            return (
              <button key={v} type="button" onClick={() => toggle(v)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[9px] font-bold transition active:scale-95 ${isaretli ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-white/5 text-white/45 hover:bg-white/10"}`}>
                <span className="text-sm">{isaretli ? "✅" : "⭕"}</span>
                {v}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[8.5px] text-white/40">Bugün {bugunVakitler.length}/5 vakit işaretli · kayıtlar cihazında kalır</p>
      </div>
    </div>
  );
}

// ★ TOPLU HATİM (madde 60) — cüz al, toplam sayaca katkı (cihaz simülasyonu + R2-ready)
export const TOPLU_HATIM_KEY = "nur_toplu_hatim_v1";
export function TopluHatim() {
  const [durum, setDurum] = useState<{ cüzler: number[]; toplamKatki: number }>(() => {
    try { return JSON.parse(localStorage.getItem(TOPLU_HATIM_KEY) || "") ?? { cüzler: [], toplamKatki: 0 }; } catch { return { cüzler: [], toplamKatki: 0 }; }
  });
  const benim = durum.cüzler.length;
  const kalanCüz = 30 - benim;

  const cüzAl = () => {
    if (kalanCüz === 0) return;
    // En küçük boş cüzü al — eşit dağılım simülasyonu
    const bos = Array.from({ length: 30 }, (_, i) => i + 1).find((c) => !durum.cüzler.includes(c)) ?? 0;
    const yeni = { cüzler: [...durum.cüzler, bos], toplamKatki: durum.toplamKatki + 1 };
    setDurum(yeni);
    try { localStorage.setItem(TOPLU_HATIM_KEY, JSON.stringify(yeni)); } catch {}
  };

  const yuzde = Math.round((benim / 30) * 100);
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[.07] p-3.5">
      <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-amber-300/80">🤲 Bu Ay Toplu Hatim</p>
      <p className="text-[10px] leading-relaxed text-white/65">Bu ayın toplu hatim kampanyasına katıl — bir cüz al, toplam hatim hedefine sen de katkı ver.</p>
      <div className="mt-2.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-white/80">Senin cüzlerin: <b className="text-amber-200">{benim}/30</b></p>
          <p className="text-[8.5px] text-white/40">Toplam katkı: {durum.toplamKatki} cüz · %{yuzde} tamam</p>
        </div>
        {kalanCüz > 0 && (
          <button type="button" onClick={cüzAl}
            className="rounded-lg px-3 py-2 text-[10px] font-black text-black transition hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            Cüz Al
          </button>
        )}
      </div>
      {benim > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {durum.cüzler.map((c) => (
            <span key={c} className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-200">{c}. cüz ✓</span>
          ))}
        </div>
      )}
      {benim === 30 && <p className="mt-2 text-center text-[9.5px] font-black text-emerald-300">🎉 Sen de bu ayın hatim halkasındasın — Allah kabul etsin!</p>}
    </div>
  );
}

// ★ Hatim takibi — 114 sureyi işaretle, yüzde ilerleme gör + cüz-cüz görsel dolum
export function HatimTakibi() {
  const STORAGE = "nur_hatim_v1";
  const [okunan, setOkunan] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE) || "[]") as number[]); } catch { return new Set(); }
  });
  const [arama, setArama] = useState("");

  const kaydet = (yeni: Set<number>) => {
    setOkunan(yeni);
    try { localStorage.setItem(STORAGE, JSON.stringify([...yeni])); } catch {}
  };

  const toggle = (n: number) => {
    const yeni = new Set(okunan);
    if (yeni.has(n)) yeni.delete(n); else yeni.add(n);
    kaydet(yeni);
    if (yeni.size === 114 && !okunan.has(n)) {
      // Hatim tamamlandı
      setTimeout(() => alert("🎉 Tebrikler! Hatim tamamladın. Allah kabul etsin! 🤲"), 100);
    }
  };

  const yuzde = Math.round((okunan.size / 114) * 100);
  const filtreli = SURE_LISTESI.filter((s) => s.ad.toLocaleLowerCase("tr").includes(arama.toLocaleLowerCase("tr")));
  // ★ Cüz dolum durumu — her cüz kendi surelerinin işaretlenme oranıyla dolar
  const cuzDurum = CUZ_SURELER.map((sureler) => {
    const okunanSayi = sureler.filter((n) => okunan.has(n)).length;
    return { oran: sureler.length ? okunanSayi / sureler.length : 0, tam: sureler.length > 0 && okunanSayi === sureler.length };
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Kur'an İlerlemen</p>
        <p className="mt-1 text-2xl font-black text-amber-200">%{yuzde}</p>
        <div className="mx-auto mt-2 h-2 w-full max-w-[240px] overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-500" style={{ width: `${yuzde}%` }} />
        </div>
        <p className="mt-1.5 text-[9px] text-white/50">{okunan.size} / 114 sure okundu {okunan.size === 114 && "· 🎉 Hatim tamam!"}</p>
      </div>
      {/* ★ CÜZ-CÜZ GÖRSEL DOLUM — 30 hücre, işaretledikçe altın renkle dolar (madde 5) */}
      <div className="grid grid-cols-10 gap-1">
        {cuzDurum.map((c, i) => (
          <div key={i}
            title={`${i + 1}. Cüz — %${Math.round(c.oran * 100)} işaretli${c.tam ? " · tamamlandı ✅" : ""}`}
            className={`flex h-7 items-center justify-center rounded-md text-[8px] font-black tabular-nums transition-all ${c.tam ? "bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,.45)]" : c.oran > 0 ? "text-amber-200" : "text-white/30"}`}
            style={!c.tam ? { background: `rgba(245,158,11,${0.06 + c.oran * 0.28})` } : undefined}>
            {i + 1}
          </div>
        ))}
      </div>
      <p className="text-center text-[8px] text-white/30">30 cüz · {cuzDurum.filter((c) => c.tam).length} cüz tamamlandı</p>
      {/* ★ HAFIZLIK İSTATİSTİĞİ (madde 52) — en çok işaretlenenler ve zor gelinenler */}
      {okunan.size > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
          <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">📊 Hafızlık İstatistiği</p>
          {(() => {
            // En uzun sureler = en zor iş (az işaretlenme beklentisi) — işaretlenmişler arasında en uzun 3
            const enUzun = [...okunan].sort((a, b) => (SURE_LISTESI.find(s => s.n === b)?.ayet ?? 0) - (SURE_LISTESI.find(s => s.n === a)?.ayet ?? 0)).slice(0, 3);
            // Kısa sureler = hızlı kazanımlar — işaretlenmemiş en kısa 3
            const hizli = SURE_LISTESI.filter(s => !okunan.has(s.n)).sort((a, b) => a.ayet - b.ayet).slice(0, 3);
            return (
              <div className="space-y-1.5 text-[9.5px]">
                <p className="text-white/60">💪 En büyük işler (işaretlediklerin): {enUzun.map(n => SURE_LISTESI.find(s => s.n === n)?.ad).filter(Boolean).join(", ")}</p>
                {hizli.length > 0 && <p className="text-white/60">⚡ Hızlı kazanım (kısa sureler): {hizli.map(s => s.ad).join(", ")}</p>}
                <p className="text-white/50">Toplam <b className="text-amber-200">{okunan.size}</b> sure · kalan <b className="text-white/80">{114 - okunan.size}</b> sure</p>
              </div>
            );
          })()}
        </div>
      )}
      <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Sure ara..."
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white outline-none placeholder:text-white/30" />
      <div className="max-h-[240px] space-y-1 overflow-y-auto pr-1">
        {filtreli.map((s) => (
          <button key={s.n} onClick={() => toggle(s.n)}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition ${okunan.has(s.n) ? "bg-amber-500/15" : "bg-white/5 hover:bg-white/10"}`}>
            {okunan.has(s.n) ? <CheckCircle2 size={13} className="shrink-0 text-amber-400" /> : <Circle size={13} className="shrink-0 text-white/25" />}
            <span className="w-6 text-[9px] font-bold text-white/40 tabular-nums">{s.n}.</span>
            <span className={`flex-1 text-[10px] font-bold ${okunan.has(s.n) ? "text-amber-200" : "text-white/80"}`}>{s.ad}</span>
            <span className="text-[8px] text-white/30">{s.ayet} ayet</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[8px] text-white/25">İşaretler cihazında saklanır · V2'de hesabıyla senkronize olacak</p>
    </div>
  );
}
