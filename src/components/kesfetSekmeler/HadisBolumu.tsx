import React from "react";
import { translate } from "../../i18n";
import { ChevronDown } from "lucide-react";
import { HADIS_TEMALARI, HADIS_DERECE_ETIKETI, RIVAYETCILER, kaynaktanRivayetci } from "../../data/hadisData";
import { KELIME_KARTLARI, type KelimeKart } from "../../data/kelimeData";
import { SURAHS } from "../../data/surahs";
import { SURE_ARAPCA } from "../../data/sureArapca";
import { sureAdGorunum as sureAdX2910 } from "../../data/surelerCokDil";
import { kelimeOku, bilinenKelimeIsaretle } from "../kesfetTemel";
import { ESMA_HUSNA, ESMA_KAYNAK_NOTU, type Esma } from "../../data/esmaHusna";
import { KISSA_UZUN } from "../../data/kissaUzun";
import { MEZHEPLER, type MezhepKaydi } from "../../data/mezheplerData";
import { dereceSinif } from "./derece";

export function HadisBolumu({
  tt, hadisTema, setHadisTema, hadisTemaAdi, filtreliHadisler,
  kuliyatYukleniyor, kuliyatSonuc, dereceAdi,
  rivayetci, setRivayetci, rivayetciSayilari,
}: {
  tt: (k: string) => string;
  hadisTema: string;
  setHadisTema: (id: string) => void;
  hadisTemaAdi: (id: string) => string;
  filtreliHadisler: Array<{ metin: string; kaynak: string; derece?: string }>;
  kuliyatYukleniyor: boolean;
  kuliyatSonuc: Array<{ metin: string; kaynak: string; derece: string; dil: string }>;
  dereceAdi: (d?: string) => string;
  rivayetci: string;
  setRivayetci: (id: string) => void;
  rivayetciSayilari: Record<string, number>;
}) {
  return (
    <>
      {/* ★ 02.11 RİVAYET EDENLER (kullanıcı emri): derece kısmında artık Buhâri/Müslim/Tirmizî
          gibi sahih kabul edilen kaynaklar buton olarak durur; tıklayınca yalnız ondan
          rivâyet edilen hadisler listelenir; külliyat toplamı + bankadaki sayı açık yazar. */}
      <div className="mb-2.5 rounded-lg border border-white/10 bg-white/[.02] px-2 py-1.5">
        <p className="text-[8.5px] font-bold uppercase tracking-wide text-white/40">{tt("ksRivayetciler")}</p>
        <p className="mt-0.5 text-[8px] leading-snug text-white/35">{tt("ksRivayetAlt")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button type="button" data-hadis-rivayetci="tumu"
            onClick={() => setRivayetci("tumu")}
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${rivayetci === "tumu" ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
            style={rivayetci === "tumu" ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
            ✦ {tt("ksTemaTumu")}
          </button>
          {RIVAYETCILER.map((r) => (
            <button key={r.id} type="button" data-hadis-rivayetci={r.id}
              title={`${r.ad} — ${tt("ksKulliyatToplam")}: ${r.kulliyat}`}
              onClick={() => setRivayetci(r.id)}
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${rivayetci === r.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
              style={rivayetci === r.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
              {r.emoji} {r.ad} · {tt("ksBankadaN")} {rivayetciSayilari[r.id] ?? 0}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[7.5px] text-white/30">{tt("ksKulliyatToplam")}: {RIVAYETCILER.map((r) => `${r.ad} ${r.kulliyat}`).join(" · ")}</p>
      </div>
      {/* derece renk lejandı — isimleriyle birlikte küçük tutuldu */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.02] px-2 py-1.5">
        <span className="text-[8.5px] font-bold uppercase tracking-wide text-white/40">{tt("ksDereceLejand")}</span>
        {(["sahih", "hasan", "zayif"] as const).map((d) => (
          <span key={d} title={HADIS_DERECE_ETIKETI[d]?.aciklama} className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${dereceSinif(d)}`}>
            {dereceAdi(d)}
          </span>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {HADIS_TEMALARI.map((t) => (
          <button key={t.id} type="button" onClick={() => setHadisTema(t.id)}
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hadisTema === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
            style={hadisTema === t.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
            {t.emoji} {hadisTemaAdi(t.id)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtreliHadisler.map((h, i) => {
          const dr = h.derece ? HADIS_DERECE_ETIKETI[h.derece] : null;
          return (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
            <p className="text-[11px] leading-relaxed text-white/85">"{h.metin}"</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <p className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {h.kaynak}</p>
              {dr ? (
                <span title={`${kaynaktanRivayetci(h.kaynak)} — ${dr.aciklama}`} className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${dereceSinif(h.derece)}`}>
                  {kaynaktanRivayetci(h.kaynak)}
                </span>
              ) : (
                <span title={tt("ksDereceKaynak")} className="rounded-full bg-white/[.06] px-1.5 py-0.5 text-[8.5px] font-bold text-white/50">
                  {tt("ksDereceKaynak")}
                </span>
              )}
            </div>
          </div>
          );
        })}
        {filtreliHadisler.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-[11px] text-white/40">{tt("ksYerelBulunamadi")}</p>
            {kuliyatYukleniyor && <p className="mt-2 text-[10px] text-white/30">{tt("ksKulliyatTaranıyor")}</p>}
            {!kuliyatYukleniyor && kuliyatSonuc.length > 0 && (
              <p className="mt-1 text-[9.5px] text-emerald-300">✓ {kuliyatSonuc.length} hadis bulundu — aşağıda</p>
            )}
            {!kuliyatYukleniyor && kuliyatSonuc.length === 0 && (
              <p className="mt-1 text-[9.5px] text-white/30">{tt("ksKulliyatYok")}</p>
            )}
          </div>
        )}
        {/* ★ KÜLLİYAT SONUÇLARI — Buhârî/Müslim'den gelen hadisler (derece etiketiyle) */}
        {kuliyatSonuc.map((h, i) => (
          <div key={`k-${i}`} className="rounded-xl border border-amber-400/20 bg-amber-500/[.04] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[10.5px] leading-relaxed ${h.dil === "ar" ? "text-right font-arabic text-[13px]" : "text-white/80"}`} dir={h.dil === "ar" ? "rtl" : undefined}>
                {h.metin}
              </p>
              <span title={dereceAdi(h.derece) || ""} className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black ${dereceSinif(h.derece)}`}>
                {kaynaktanRivayetci(h.kaynak) || ""}
              </span>
            </div>
            <p className="mt-1.5 text-[8.5px] text-white/40">— {h.kaynak}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 19a: MEZHEPLER — üst 4 buton + alt detay (02.11 kullanıcı emri) ──
