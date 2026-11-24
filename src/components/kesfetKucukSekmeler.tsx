// ════════════════════════════════════════════════════════
// KESFETKUCUKSEKMELER.TSX — Keşfet'in küçük sekmeleri
// ★ 24.11 DOSYA BÖLME: KesfetModal 954 satırdı; cami, kanal rehberi,
//   edep, sünnet, tecvid ve kitaplık gövdeleri buraya taşındı.
//   Davranış birebir aynı: prop adları eski closure adlarıyla eşleşir.
// ════════════════════════════════════════════════════════

import React from "react";
import type { Lang } from "../i18n";
import { KANAL_REHBERI } from "../data/kanalData";
import { ADABI_MUASERET } from "../data/adabiMuaseret";
import { SÜNNETLER } from "../data/sunnetler";
import { TECVID_KURALLARI } from "../data/tecvidData";
import { camiHaritaUrl, camiListeUrl } from "../data/camiData";
import { SURAHS } from "../data/surahs";
import { sureAdGorunum as sureAdX2910 } from "../data/surelerCokDil";
import type { KitaplikNot } from "./kesfetTemel";

type TT = (k: string) => string;
type KitaplikVeri = { isaretler: string[]; notlar: KitaplikNot[] };
type KitaplikEk = { kart: number; dua: number; ders: number; ezber: string; namaz: string; hayir: number; takvim: number; sesTaslak: boolean; kartTasarim: boolean; marka: boolean; mushaf: number };

export const CamiBolumu: React.FC<{
  tt: TT; camiKonum: string; setCamiKonum: (v: string) => void;
  camiAranan: string | null; setCamiAranan: (v: string | null) => void;
  camiKonumAl: () => void; camiKonumAliniyor: boolean;
}> = ({ tt, camiKonum, setCamiKonum, camiAranan, setCamiAranan, camiKonumAl, camiKonumAliniyor }) => (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">{tt("ktCamiMetin")}</p>
          {/* ★ ORTADAKİ KONUM BUTONU (01.10): tıkla → cihaz konumu → harita anında açılır */}
          <button type="button" onClick={camiKonumAl} disabled={camiKonumAliniyor}
            className="mx-auto flex w-full max-w-[280px] items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-[11px] font-black text-white transition hover:brightness-110 active:scale-[.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,rgba(215,170,82,.25),rgba(215,170,82,.08))" }}>
            {camiKonumAliniyor ? tt("ktCamiAliniyor") : tt("ktCamiBul")}
          </button>
          <div className="flex gap-2">
            <input
              value={camiKonum}
              onChange={(e) => setCamiKonum(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && camiKonum.trim()) setCamiAranan(camiKonum.trim()); }}
              placeholder={tt("ktCamiPlaceholder")}
              className="glass-soft flex-1 rounded-xl px-3 py-2.5 text-[11px] outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => {
                if (!camiKonum.trim()) camiKonumAl(); else setCamiAranan(camiKonum.trim());
              }}
              className="shrink-0 rounded-xl px-3.5 py-2.5 text-[10px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {tt("ktAra")}
            </button>
          </div>
          {camiAranan && (
            <>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <iframe
                  title={tt("ktCamiHarita")}
                  src={camiHaritaUrl(camiAranan)}
                  className="h-[260px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href={camiListeUrl(camiAranan)} target="_blank" rel="noopener noreferrer" className="block rounded-xl glass-soft py-2.5 text-center text-[10px] font-bold text-white/60 transition hover:text-white">
                {tt("ktCamiListe")}
              </a>
            </>
          )}
          {!camiAranan && <p className="rounded-xl bg-white/[.03] px-3 py-3 text-center text-[9.5px] leading-relaxed text-white/45">{tt("ktCamiBos")}</p>}
        </div>
);

export const KanalRehberiBolumu: React.FC<{ tt: TT }> = ({ tt }) => (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">{tt("ktRehberMetin")}</p>
          {KANAL_REHBERI.map((k, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[7.5px] font-black ${k.kategori === "YouTube" ? "bg-red-500/15 text-red-300" : k.kategori === "Instagram" ? "bg-pink-500/15 text-pink-300" : "bg-white/10 text-white/60"}`}>{k.kategori}</span>
                <h4 className="text-[11px] font-black text-white/90">{k.baslik}</h4>
              </div>
              <p className="mt-1 text-[9.5px] leading-relaxed text-white/60">{k.metin}</p>
            </div>
          ))}
        </div>
);

export const AdabBolumu: React.FC<{ tt: TT; q: string; kopru?: React.ReactNode }> = ({ tt, q, kopru }) => (
  <div className="space-y-2">
          {kopru}
          <p className="mb-1 text-center text-[9px] text-white/40">{tt("ktAdabMetin")}</p>
          {ADABI_MUASERET.filter((m) => !q || m.ad.toLocaleLowerCase("tr").includes(q) || m.metin.toLocaleLowerCase("tr").includes(q)).map((m, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              <p className="text-[11px] font-black text-white/90">{i + 1}. {m.ad}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{m.metin}</p>
              <p className="mt-1.5 text-[8.5px] font-bold" style={{ color: "var(--accent)" }}>📚 {m.kaynak}</p>
            </div>
          ))}
          <p className="pt-1 text-center text-[8px] text-white/25">{ADABI_MUASERET.length} madde · sahih kaynaklı</p>
        </div>
);

export const SunnetBolumu: React.FC<{ tt: TT; q: string }> = ({ tt, q }) => (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">{tt("ktSunnetMetin")}</p>
          {SÜNNETLER.filter((m) => !q || m.ad.toLocaleLowerCase("tr").includes(q) || m.metin.toLocaleLowerCase("tr").includes(q)).map((m, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              <p className="text-[11px] font-black text-white/90">{i + 1}. {m.ad}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{m.metin}</p>
              <p className="mt-1.5 text-[8.5px] font-bold" style={{ color: "var(--accent)" }}>📚 {m.kaynak}</p>
            </div>
          ))}
          <p className="pt-1 text-center text-[8px] text-white/25">{SÜNNETLER.length} madde · sahih kaynaklı</p>
        </div>
);

export const TecvidBolumu: React.FC<{ tt: TT; q: string }> = ({ tt, q }) => (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">{tt("ktTecvidMetin")}</p>
          {TECVID_KURALLARI.filter((t) => !q || t.baslik.toLocaleLowerCase("tr").includes(q) || t.tanim.toLocaleLowerCase("tr").includes(q)).map((t, i) => {
            return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[11px] font-black text-white/90">{t.baslik}</h4>
                  <span className={`rounded-full px-1.5 py-0.5 text-[7.5px] font-black ${
                    t.seviye === "temel" ? "bg-emerald-500/20 text-emerald-300" :
                    t.seviye === "orta" ? "bg-sky-500/20 text-sky-300" :
                    "bg-fuchsia-500/20 text-fuchsia-300"
                  }`}>
                    {t.seviye === "temel" ? tt("tecvidTemel") : t.seviye === "orta" ? tt("tecvidOrta") : tt("tecvidIleri")}
                  </span>
                </div>
                <p className="mt-1 text-[9.5px] leading-relaxed text-white/65">{t.tanim}</p>
                <p className="mt-1.5 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-white/85" dir="rtl">{t.ornek}</p>
              </div>
            );
          })}
        </div>
);

export const KitaplikBolumu: React.FC<{
  tt: TT; lang: Lang; kitaplikVeri: KitaplikVeri; kitaplikEk: KitaplikEk;
}> = ({ tt, lang, kitaplikVeri, kitaplikEk }) => (
        <div className="space-y-3">
          {/* İşaretli ayetler */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ktKitaplikIsaret")} ({kitaplikVeri.isaretler.length})</p>
            {kitaplikVeri.isaretler.length === 0 ? (
              <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] text-white/40">{tt("ktKitaplikIsaretBos")}</p>
            ) : (
              <div className="space-y-1">
                {kitaplikVeri.isaretler.map((k) => {
                  const [s, a] = k.split(":").map(Number);
                  return (
                    <div key={k} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[.02] px-3 py-1.5 text-[10px]">
                      <span className="font-bold text-white/80">{sureAdX2910(s, SURAHS[s - 1]?.name ?? String(s), lang)} · {tt("ktAyetSonek").replace("{a}", String(a))}</span>
                      <span className="text-[8.5px] text-white/35">{k}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Notlar (şifreli secureStore'dan okunur — AyetNotlariModal ile aynı kaynak) */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ktKitaplikNotlar")} ({kitaplikVeri.notlar.length})</p>
            {kitaplikVeri.notlar.length === 0 ? (
              <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] text-white/40">{tt("ktKitaplikNotBos")}</p>
            ) : (
              <div className="space-y-1">
                {kitaplikVeri.notlar.slice(0, 10).map((n) => {
                  const [s, a] = n.k.split(":").map(Number);
                  return (
                    <div key={n.k} className="rounded-lg border border-white/10 bg-white/[.02] px-3 py-2">
                      <p className="text-[9px] font-black" style={{ color: "var(--accent-2)" }}>{sureAdX2910(s, SURAHS[s - 1]?.name ?? String(s), lang)} {n.k}</p>
                      <p className="mt-0.5 line-clamp-2 text-[9.5px] text-white/60">{n.metin}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Kayıtlı içerikler özeti (C53/C40/83) — cihazdaki verilerden */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ktKitaplikDiger")}</p>
            <div className="space-y-1 rounded-xl border border-white/10 bg-white/[.02] p-2.5">
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikKart")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.kart}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikDua")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.dua}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikDers")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.ders}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikEzber")}</span><span className="font-black text-right" style={{ color: "var(--accent-2)" }}>{String(kitaplikEk.ezber || "-")}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikNamaz")}</span><span className="font-black text-right" style={{ color: "var(--accent-2)" }}>{String(kitaplikEk.namaz || "-")}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikHayir")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.hayir}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikTakvim")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.takvim}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikSesTaslak")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.sesTaslak ? tt("itBildirimVar") : tt("itBildirimYok")}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikKartTasarim")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.kartTasarim ? tt("itBildirimVar") : tt("itBildirimYok")}</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-white/70">{tt("ktKitaplikMarka")}</span><span className="font-black" style={{ color: "var(--accent-2)" }}>{kitaplikEk.marka ? tt("itBildirimVar") : tt("itBildirimYok")}</span></div>
              {(kitaplikEk.kart + kitaplikEk.dua + kitaplikEk.ders + kitaplikEk.hayir + kitaplikEk.takvim) === 0 && !kitaplikEk.sesTaslak && !kitaplikEk.kartTasarim && !kitaplikEk.marka && kitaplikEk.ezber === tt("itBildirimYok") && kitaplikEk.namaz === tt("itBildirimYok") && <p className="pt-1 text-center text-[9px] text-white/35">{tt("ktKitaplikBosOzet")}</p>}
            </div>
          </div>
                    {/* İndirilen videolar — IndexedDB'de saklananlar */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ktKitaplikVideolar")}</p>
            <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] leading-relaxed text-white/45">{tt("ktKitaplikVideoBilgi")}</p>
          </div>
        </div>
);
