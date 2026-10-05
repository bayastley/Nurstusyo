// ════════════════════════════════════════════════════════
// DESIGNAYARBOLUMLERI.TSX — Tasarım ayar paneli alt bileşenleri
// DesignSettingsPanel.tsx'den ayrıldı (SRP adım 5, 30.09)
// InceAyarSlider (3× tekrar) · FontGalerisi · MarkaImza · MetinKonumPedi
// ════════════════════════════════════════════════════════

import React from "react";
import { ChevronDown } from "lucide-react";
import { translate } from "../i18n"; // ★ TUR 6: title/etiket kalıntıları LS bazlı çeviri
const ttDA = (k: string): string => translate(localStorage.getItem("nur_lang"), k);
// ★ 05.10: font etiketi — TR'de tam etiket, diğer dillerde parantez içi TR niteleyici kırpılır
const fontKisa = (label: string): string => {
  if ((localStorage.getItem("nur_lang") ?? "tr") === "tr") return label;
  const m = label.match(/\s*\([^)]*\)$/);
  return m ? label.slice(0, label.length - m[0].length) : label;
};

// ── İNCE AYAR SLIDER — −/+ butonlu, yüzdeli, sıfırlamalı (3 kullanım: yazı/meal/ışıltı) ──
export function InceAyarSlider({
  deger,
  setDeger,
  adim = 0.05,
  min = 0.5,
  max = 2,
  accent = "#fbbf24",
  etiketSinif = "text-white/70",
  etiketGenislik = "w-[46px]",
  onEtiket,
  title,
  sifirlaTitle,
}: {
  deger: number;
  setDeger: (v: number) => void;
  adim?: number;
  min?: number;
  max?: number;
  accent?: string;
  etiketSinif?: string;
  etiketGenislik?: string;
  onEtiket?: string;
  title?: string;
  sifirlaTitle?: string;
}) {
  return (
    <span className="mt-1 flex w-full min-w-0 items-center gap-1" title={title}>
      {onEtiket && (
        <span className="shrink-0 text-[7.5px] font-bold uppercase tracking-wider text-white/40">{onEtiket}</span>
      )}
      <button
        type="button"
        onClick={() => setDeger(deger - adim)}
        disabled={deger <= min}
        title={ttDA("daKucult")}
        className="h-6 w-6 shrink-0 rounded-md bg-white/10 text-[12px] font-black leading-none text-white/80 transition hover:bg-white/20 disabled:opacity-30"
      >−</button>
      <input
        type="range"
        min={min}
        max={max}
        step={adim}
        value={deger}
        onChange={(e) => setDeger(parseFloat(e.target.value))}
        title={title}
        className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/15"
        style={{ accentColor: accent }}
      />
      {/* ★ KAYMA DÜZELTMESİ (28.09): min-w yerine sabit w — dar panelde %170 yazısı
          slider üstüne biniyordu; shrink-0 + sabit genişlik hizayı korur */}
      <span className={`${etiketGenislik} shrink-0 rounded-md bg-black/40 px-1 py-0.5 text-center text-[9px] font-black tabular-nums ${etiketSinif}`} title={ttDA("dafInceCarpan")}>
        %{Math.round(deger * 100)}
      </span>
      <button
        type="button"
        onClick={() => setDeger(deger + adim)}
        disabled={deger >= max}
        title={ttDA("daBuyut")}
        className="h-6 w-6 shrink-0 rounded-md bg-white/10 text-[12px] font-black leading-none text-white/80 transition hover:bg-white/20 disabled:opacity-30"
      >+</button>
      {deger !== 1 && (
        <button
          type="button"
          onClick={() => setDeger(1)}
          title={sifirlaTitle ?? ttDA("dafVarsayilanBoyut")}
          className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-white/50 transition hover:bg-white/15 hover:text-white/80"
        >{ttDA("daSifirla")}</button>
      )}
    </span>
  );
}

// ── FONT GALERİSİ — 4'lü mini galeri: her font KENDİ yazı tarzıyla örnek gösterir ──
// <option> tarayıcıda özel fontla çizilemediği için (kısıt) galeri yaklaşımı kullanıldı.
// Tembel yüklemeyle uyumlu: fontun CSS'i tıklanınca yüklenir.
export function FontGalerisi({
  fonts,
  secili,
  onSec,
  galeriRef,
}: {
  fonts: Array<{ id: string; label: string; css: string }>;
  secili: string;
  onSec: (id: string) => void;
  galeriRef: React.RefObject<HTMLDetailsElement | null>;
}) {
  return (
    <details ref={galeriRef} className="mt-1">
      <summary className="cursor-pointer text-[8px] font-bold text-white/40 hover:text-white/70">{ttDA("dafFontGalerisi")}</summary>
      <div className="mt-1 grid max-h-52 grid-cols-2 gap-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-1">
        {fonts.map((f) => {
          const seciliMi = f.id === secili;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSec(f.id)}
              title={fontKisa(f.label)}
              className={`rounded-md border px-1.5 py-1 text-center transition ${seciliMi ? "border-amber-400/60 bg-amber-500/15" : "border-white/5 bg-white/[.03] hover:bg-white/[.08]"}`}
            >
              {/* ★ Tema uyumlu ALTIN yazı — beyaz değil */}
              <span className="block truncate text-base leading-snug text-amber-200/95" dir="rtl" lang="ar" style={{ fontFamily: f.css }}>
                بِسْمِ ٱللَّهِ
              </span>
              <span className="mt-0.5 block truncate text-[7px] font-bold text-white/50">{fontKisa(f.label)}</span>
            </button>
          );
        })}
      </div>
    </details>
  );
}

// ── MARKA / KANAL İMZASI — Elit üyeler + God Mode · konum seçilebilir ──
export function MarkaImza({
  isMasterSurum,
  brandSignature,
  setBrandSignature,
  brandOn,
  setBrandOn,
  brandPos,
  setBrandPos,
}: {
  isMasterSurum: boolean;
  brandSignature: string;
  setBrandSignature: (v: string) => void;
  brandOn: boolean;
  setBrandOn: (v: boolean) => void;
  brandPos: "sol-ust" | "sag-ust" | "sol-alt" | "sag-alt";
  setBrandPos: (v: "sol-ust" | "sag-ust" | "sol-alt" | "sag-alt") => void;
}) {
  return (
    <div className="mt-2 space-y-1.5">
      <span className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider text-amber-300">
        🛡️ {ttDA("dafMarkaImza")}
        <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[6.5px] font-black text-amber-300">
          {isMasterSurum ? "ADMİN" : "ELİT"}
        </span>
        {/* ★ WATERMARK AÇ/KAPA — imza metnini silmeden videodan kaldır */}
        <button
          type="button"
          onClick={() => setBrandOn(!brandOn)}
          role="switch"
          aria-checked={brandOn}
          title={brandOn ? ttDA("dafImzaAcik") : ttDA("dafImzaKapali")}
          className={`relative ml-auto inline-flex h-4 w-8 shrink-0 items-center rounded-full transition ${brandOn ? "bg-amber-400" : "bg-white/15"}`}
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition ${brandOn ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </span>
      <input
        value={brandSignature}
        onChange={(e) => setBrandSignature(e.target.value)}
        maxLength={28}
        placeholder="@nurstudyo"
        disabled={!brandOn}
        className="glass-soft w-full rounded-lg px-2 py-1.5 text-[10px] font-bold text-white outline-none focus:border-[color:var(--accent)] disabled:opacity-40"
      />

      <span className="block text-[8px] font-bold uppercase tracking-wider text-white/45">
        {ttDA("dafImzaKonumu")}
      </span>
      <div className="grid grid-cols-2 gap-1">
        {([
          { id: "sol-ust", label: "↖" },
          { id: "sag-ust", label: "↗" },
          { id: "sol-alt", label: "↙" },
          { id: "sag-alt", label: "↘" },
        ] as const).map((pos) => (
          <button
            key={pos.id}
            type="button"
            onClick={() => setBrandPos(pos.id)}
            className={`rounded-lg px-2 py-1.5 text-[9px] font-bold transition ${
              brandPos === pos.id
                ? "text-black shadow-md"
                : "glass-soft text-white/50 hover:text-white/80"
            }`}
            style={brandPos === pos.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            {pos.label} {pos.id === "sol-ust" ? ttDA("dafSolUst") : pos.id === "sag-ust" ? ttDA("dafSagUst") : pos.id === "sol-alt" ? ttDA("dafSolAlt") : ttDA("dafSagAlt")}
          </button>
        ))}
      </div>
      <span className="block text-[8px] leading-relaxed text-white/35">
        {ttDA("dafImzaIpucu1")} <b className="text-white/50">{ttDA("dafSolUst")}</b> {ttDA("dafImzaIpucu2")}
      </span>
    </div>
  );
}

// ── METİN KONUM PEDİ — ok tuşlarıyla 5'er adım kaydırma ──
export function MetinKonumPedi({
  setTextOffset,
}: {
  setTextOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/45">{ttDA("dafMetinKonumu")}</span>
      <div className="grid grid-cols-3 gap-0.5">
        <span />
        <button onClick={() => setTextOffset((o) => ({ ...o, y: Math.max(-30, o.y - 5) }))} aria-label={ttDA("dafYukari")} className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} className="rotate-180" /></button>
        <span />
        <button onClick={() => setTextOffset((o) => ({ ...o, x: Math.max(-40, o.x - 5) }))} aria-label={ttDA("dafSola")} className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} className="rotate-90" /></button>
        <button onClick={() => setTextOffset({ x: 0, y: 0 })} aria-label={ttDA("daSifirla")} className="glass-soft flex h-5 w-6 items-center justify-center rounded text-[8px] font-black text-[color:var(--accent)] hover:brightness-125">⟲</button>
        <button onClick={() => setTextOffset((o) => ({ ...o, x: Math.min(40, o.x + 5) }))} aria-label={ttDA("dafSaga")} className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} className="-rotate-90" /></button>
        <span />
        <button onClick={() => setTextOffset((o) => ({ ...o, y: Math.min(30, o.y + 5) }))} aria-label={ttDA("dafAsagi")} className="glass-soft flex h-5 w-6 items-center justify-center rounded text-white/60 hover:text-white"><ChevronDown size={10} /></button>
        <span />
      </div>
    </div>
  );
}
