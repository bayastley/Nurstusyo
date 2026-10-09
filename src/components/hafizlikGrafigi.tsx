// ════════════════════════════════════════════════════════
// HAFIZLIKGRAFIGI.TSX — Hafızlık testi performans çizgisi
// HafizlikTestiModal.tsx'den ayrıldı (09.10): i18n'li birebir sürüm —
//   eski TR-sabit kopya yetim parçaydı (bağlantı raporu ⚠).
// ════════════════════════════════════════════════════════

import React from "react";

//   Kayan pencere: her nokta, o ana kadarki pencere-doğruluğunun yüzdesi — çizgi
//   düşüyorsa son sorularda zorlanıyorsun, yükseliyorsa formdasın. Yalnız sınırsız
//   modda görünür (sınırlı tur zaten kısa; 5/15/30 soruda grafiğin anlamı yok).
//   Kırmızı nokta = o soruya yanlış, yeşil = doğru. %50 kesikli referans çizgisi var.
export const PerformansCizgisi: React.FC<{ gecmis: Array<{ dogru: boolean }>; tt: (k: string) => string }> = ({ gecmis, tt }) => {
  const W = 100, H = 40, PAD = 3;
  const son20 = gecmis.slice(-20);
  if (son20.length < 2) return null;
  const degerler = son20.map((_, i) => (son20.slice(0, i + 1).filter((g) => g.dogru).length / (i + 1)) * 100);
  const pts = degerler.map((v, i) => ({
    x: (i / (son20.length - 1)) * (W - 2 * PAD) + PAD,
    y: H - PAD - (v / 100) * (H - 2 * PAD),
  }));
  const cizgi = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const alan = `${cizgi} L${pts[pts.length - 1].x.toFixed(2)},${H - PAD} L${pts[0].x.toFixed(2)},${H - PAD} Z`;
  const son = degerler[degerler.length - 1];
  const sonRenk = son >= 80 ? "text-emerald-300" : son >= 60 ? "text-amber-300" : "text-red-300";
  const ortaY = H - PAD - (H - 2 * PAD) / 2;
  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-2.5">
      <div className="mb-1 flex items-center justify-between text-[8.5px] font-black uppercase tracking-widest">
        <span className="text-white/40">{tt("hafizlikPerformans").replace("{n}", String(son20.length))}</span>
        <span className={sonRenk}>{tt("hafizlikSon").replace("{n}", String(Math.round(son)))}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full" role="img" aria-label="Son 20 sorunun doğruluk çizgisi">
        <defs>
          <linearGradient id="haf-perf-alan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity=".32" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="haf-perf-cizgi" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={ortaY} x2={W - PAD} y2={ortaY} stroke="rgba(255,255,255,.09)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        <path d={alan} fill="url(#haf-perf-alan)" />
        <path d={cizgi} fill="none" stroke="url(#haf-perf-cizgi)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={son20[i].dogru ? 0.9 : 1.4} fill={son20[i].dogru ? "#34d399" : "#f87171"} />
        ))}
      </svg>
    </div>
  );
}
