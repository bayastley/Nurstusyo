// ════════════════════════════════════════════════════════
// İÇERİK TAKVİMİ — yol haritası madde 20
// Stüdyodaki "hazır taslak" yuvasının üçüncü sekmesi: 7/30 günlük
// üretim planı. Her satır gerçek bir ayet; "Yükle" ayeti stüdyoya ekler,
// "Üretildi" işareti cihazda saklanır (src/studio/icerikTakvimi.ts).
// ════════════════════════════════════════════════════════

import React from "react";
import { translate } from "../i18n";
import {
  takvimOlustur,
  uretilenleriOku,
  uretildiIsaretle,
  type TakvimGunu,
} from "../studio/icerikTakvimi";

export interface IcerikTakvimiProps {
  /** Ayeti stüdyoya ekler (aynı ayet zaten seçiliyse dokunmaz) */
  ayetEkle: (s: number, a: number) => void;
}

export const IcerikTakvimi: React.FC<IcerikTakvimiProps> = ({ ayetEkle }) => {
  const dil = (typeof localStorage !== "undefined" ? localStorage.getItem("nur_lang") : "tr") || "tr";
  const gt = (k: string): string => translate(dil, k);

  const [gunSayisi, setGunSayisi] = React.useState<7 | 30>(7);
  const [uretilen, setUretilen] = React.useState<Record<string, boolean>>(() => uretilenleriOku());
  const [yuklenen, setYuklenen] = React.useState<string | null>(null);

  const gunler: TakvimGunu[] = React.useMemo(() => takvimOlustur(gunSayisi), [gunSayisi]);
  const tamam = gunler.filter((g) => uretilen[g.tarih]).length;
  const yuzde = gunler.length ? Math.round((tamam / gunler.length) * 100) : 0;

  const yukle = (gun: TakvimGunu) => {
    ayetEkle(gun.sure, gun.ayet);
    setYuklenen(gun.tarih);
    window.setTimeout(() => setYuklenen(null), 2500);
  };

  const isaretle = (gun: TakvimGunu) => {
    setUretilen(uretildiIsaretle(gun.tarih, !uretilen[gun.tarih]));
  };

  const gunEtiketi = (gun: TakvimGunu): string => {
    if (gun.sira === 1) return gt("ictBugun");
    if (gun.sira === 2) return gt("ictYarin");
    return gun.tarih.slice(5).split("-").reverse().join(".");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[.02] p-3.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
            {gt("ictBaslik")}
          </p>
          <p className="mt-0.5 text-[11.5px] font-black leading-snug text-white/90">{gt("ictSub")}</p>
        </div>
        <div className="flex shrink-0 rounded-xl border border-white/10 p-0.5">
          {([7, 30] as const).map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={gunSayisi === n}
              onClick={() => setGunSayisi(n)}
              className={`rounded-lg px-2 py-1 text-[9px] font-black transition ${gunSayisi === n ? "text-black" : "text-white/60 hover:text-white"}`}
              style={gunSayisi === n ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
            >
              {n === 7 ? gt("ictHafta") : gt("ictAy")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${yuzde}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))" }}
          />
        </div>
        <span className="shrink-0 text-[9.5px] font-black text-white/70">
          {gt("ictIlerleme").replace("{d}", String(tamam)).replace("{t}", String(gunler.length))}
        </span>
      </div>

      <ul className="mt-2 max-h-[260px] space-y-1 overflow-y-auto pr-0.5">
        {gunler.map((gun) => {
          const bitti = !!uretilen[gun.tarih];
          return (
            <li
              key={gun.tarih}
              className="flex items-center gap-2 rounded-xl border px-2 py-1.5"
              style={{
                borderColor: bitti ? "rgba(215,170,82,.4)" : "rgba(255,255,255,.08)",
                background: bitti ? "rgba(215,170,82,.09)" : "transparent",
              }}
            >
              <span className="w-[52px] shrink-0 text-[8.5px] font-black uppercase leading-tight text-white/55">
                {gunEtiketi(gun)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold text-white/85">
                {gun.sureAdi} {gun.sure}:{gun.ayet}
              </span>
              <button
                type="button"
                onClick={() => yukle(gun)}
                className="shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black text-black transition hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              >
                {yuklenen === gun.tarih ? "✓" : gt("ictYukle")}
              </button>
              <button
                type="button"
                onClick={() => isaretle(gun)}
                aria-pressed={bitti}
                title={gt("ictUretildi")}
                className={`shrink-0 rounded-lg border px-1.5 py-1 text-[9px] font-black transition ${bitti ? "border-amber-400/60 text-amber-200" : "border-white/15 text-white/45 hover:text-white/80"}`}
              >
                {bitti ? "✓" : "○"}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 text-[9px] font-semibold leading-snug text-white/40">{gt("ictNot")}</p>
    </div>
  );
};
