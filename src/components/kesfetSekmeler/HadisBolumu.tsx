import React from "react";
import { translate, type Lang } from "../../i18n";
import { ChevronDown, Search, X } from "lucide-react";
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
import { hadisHikayesi } from "../../data/hadisHikaye";
import { HadisKulliyat } from "./HadisKulliyat";

// ── 28.11 KATEGORİ ARAMA ───────────────────────────────────────────────────
// ★ Kullanıcı emri: kategori butonlarında da arama olsun; "polıs" yazan
//   "Polis"i bulsun. Kural: harf aksanı/şapka farkı önemsiz (ş=s, ı=i, â=a),
//   Arapça hareke silinir, kısa yazım hatası (1-2 harf) tolere edilir.
const harfSadelestir = (s: string): string =>
  s
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** İki kelime arasındaki düzenleme (Levenshtein) mesafesi — küçük yazım hatası için. */
function duzenlemeMesafesi(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let onceki = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const simdiki: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      simdiki[j] = Math.min(
        onceki[j] + 1,
        simdiki[j - 1] + 1,
        onceki[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    onceki = simdiki;
  }
  return onceki[b.length];
}

/** Etiket, normalize edilmiş sorguyla eşleşiyor mu? (tam, önek veya 1-2 harf hata) */
function kategoriEslesiyor(etiket: string, sorgu: string): boolean {
  if (!sorgu) return true;
  const hedef = harfSadelestir(etiket);
  if (hedef.includes(sorgu)) return true;
  const kelimeler = hedef.split(" ").filter(Boolean);
  return sorgu
    .split(" ")
    .filter(Boolean)
    .every((q) => {
      const tolerans = q.length <= 3 ? 0 : q.length <= 6 ? 1 : 2;
      return kelimeler.some((k) => {
        if (q.length >= 2 && k.length >= 2 && (k.startsWith(q) || q.startsWith(k))) return true;
        return tolerans > 0 && duzenlemeMesafesi(k, q) <= tolerans;
      });
    });
}

// ── HİKÂYESİ / NASIL SÖYLENDİ ──────────────────────────────────────────────
// ★ 27.11 (kullanıcı emri): panel artık KÜNYE ETİKETİ dökmez. Hadisin
// söylenmesine yol açan GERÇEK olay `data/hadisHikaye.ts`ten gelir; kaydı
// olmayan rivayette tek cümlelik dürüst not gösterilir. Uydurma yok.

export function HadisBolumu({
  tt, hadisTema, setHadisTema, hadisTemaAdi, filtreliHadisler,
  kuliyatYukleniyor, kuliyatSonuc, kuliyatOffline, dereceAdi,
  rivayetci, setRivayetci, rivayetciSayilari, arama, dil,
}: {
  tt: (k: string) => string;
  /** ★ 27.11: külliyat çevirisinin dili (Arapça metin sabit) */
  dil?: Lang;
  hadisTema: string;
  setHadisTema: (id: string) => void;
  hadisTemaAdi: (id: string) => string;
  filtreliHadisler: Array<{ metin: string; kaynak: string; tema: string; derece?: string }>;
  kuliyatYukleniyor: boolean;
  kuliyatSonuc: Array<{ metin: string; kaynak: string; derece: string; dil: string; url?: string; bab?: string; kitab?: string; dereceEtiket?: string }>;
  kuliyatOffline?: boolean;
  dereceAdi: (d?: string) => string;
  rivayetci: string;
  setRivayetci: (id: string) => void;
  rivayetciSayilari: Record<string, number>;
  arama?: string;
}) {
  // ★ 26.11: karta tıklayınca ALTINDA hikâyesi (kaynağın kitâb/bâb/derece bağlamı) açılır.
  const [acikKart, setAcikKart] = React.useState<string | null>(null);
  // ★ 28.11: kategori arama — yazım/aksan farkı tolere edilir, "Tümü" hep durur.
  const [kategoriAra, setKategoriAra] = React.useState("");
  const kategoriSorgu = harfSadelestir(kategoriAra);
  const gorunenTemalar = HADIS_TEMALARI.filter(
    (t) => t.id === "tumu" || kategoriEslesiyor(hadisTemaAdi(t.id), kategoriSorgu),
  );
  const kategoriEslesen = gorunenTemalar.filter((t) => t.id !== "tumu").length;
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
              title={`${r.ad} — ${tt("ksKulliyatToplam")}: ${r.kulliyat} · ${tt("ksBankadaN")}: ${rivayetciSayilari[r.id] ?? 0}`}
              onClick={() => setRivayetci(r.id)}
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${rivayetci === r.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
              style={rivayetci === r.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
              {r.emoji} {r.ad} · {tt("ksKulliyatteN")} {r.kulliyat}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[7.5px] text-white/30">{tt("ksKulliyatToplam")}: {RIVAYETCILER.map((r) => `${r.ad} ${r.kulliyat}`).join(" · ")}</p>
      </div>

      {/* derece lejandı — yalnız sahih/hasen (kaynaklı) */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.02] px-2 py-1.5">
        <span className="text-[8.5px] font-bold uppercase tracking-wide text-white/40">{tt("ksDereceLejand")}</span>
        {(["sahih", "hasan"] as const).map((d) => (
          <span key={d} title={HADIS_DERECE_ETIKETI[d]?.aciklama} className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${dereceSinif(d)}`}>
            {dereceAdi(d)}
          </span>
        ))}
        <span className="ml-auto text-[8.5px] font-bold text-emerald-300/80">{filtreliHadisler.length} {tt("ksSonuc")}</span>
      </div>
      <p className="mb-2 text-[9px] text-white/40">{arama ? `🔎 "${arama}" · ${filtreliHadisler.length} ${tt("ksSonuc")} · ` : ""}{tt("ksKaynakliNot")}</p>
      {arama && kuliyatOffline && !kuliyatYukleniyor && (
        <p className="mb-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-2.5 py-1.5 text-[10px] text-amber-100/90">{tt("ksCevrimdisiUyari")}</p>
      )}
      {arama && kuliyatYukleniyor && (
        <p className="mb-2 text-[10px] text-white/35">{tt("ksKulliyatTaranıyor")}</p>
      )}
      <div className="mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-2.5 py-1.5 focus-within:border-emerald-400/40">
        <Search size={12} className="shrink-0 text-white/35" />
        <input
          type="text"
          value={kategoriAra}
          onChange={(e) => setKategoriAra(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const tek = gorunenTemalar.filter((t) => t.id !== "tumu");
            if (tek.length === 1) setHadisTema(tek[0].id);
          }}
          placeholder={tt("ksKategoriAra")}
          aria-label={tt("ksKategoriAra")}
          className="min-w-0 flex-1 bg-transparent text-[10px] text-white/85 outline-none placeholder:text-white/30"
        />
        {kategoriAra ? (
          <button type="button" onClick={() => setKategoriAra("")} aria-label={tt("ksHadisKapat")} className="shrink-0 text-white/40 hover:text-white">
            <X size={12} />
          </button>
        ) : null}
        {kategoriSorgu ? (
          <span className="shrink-0 text-[8px] font-bold text-emerald-300/70">{kategoriEslesen} {tt("ksSonuc")}</span>
        ) : null}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {gorunenTemalar.map((t) => (
          <button key={t.id} type="button" onClick={() => setHadisTema(t.id)}
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hadisTema === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
            style={hadisTema === t.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
            {t.emoji} {hadisTemaAdi(t.id)}
          </button>
        ))}
        {kategoriSorgu && kategoriEslesen === 0 && (
          <p className="px-1 py-1 text-[9.5px] text-white/45">{tt("ksKategoriYok")}</p>
        )}
      </div>
      <div className="space-y-2">
        {filtreliHadisler.map((h, i) => {
          const dr = h.derece ? HADIS_DERECE_ETIKETI[h.derece] : null;
          const anahtar = `y-${i}-${h.metin.slice(0, 24)}`;
          const acik = acikKart === anahtar;
          const hikaye = hadisHikayesi(h.kaynak);
          return (
          <div key={anahtar} className={`rounded-xl border p-3 transition ${acik ? "border-emerald-400/25 bg-emerald-500/[.05]" : "border-white/10 bg-white/[.03]"}`}>
            <button type="button" onClick={() => setAcikKart(acik ? null : anahtar)} aria-expanded={acik} className="block w-full text-left">
              <p className="text-[11px] leading-relaxed text-white/85">"{h.metin}"</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <p className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>{tt("ksKaynakEtiket")} {h.kaynak}</p>
                {dr ? (<span title={`${dereceAdi(h.derece)} — ${dr.aciklama}`} className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${dereceSinif(h.derece)}`}>{dereceAdi(h.derece)}</span>) : null}
                <span title={tt("ksRivayetciler")} className="rounded-full bg-white/[.06] px-1.5 py-0.5 text-[8.5px] font-bold text-white/60">{kaynaktanRivayetci(h.kaynak)}</span>
                <span className="ml-auto flex items-center gap-0.5 text-[8px] font-bold text-emerald-300/60">
                  {acik ? tt("ksHadisKapat") : tt("ksHadisHikaye")}
                  <ChevronDown size={10} className={acik ? "rotate-180 transition" : "transition"} />
                </span>
              </div>
            </button>
            {acik && (
              <div className="mt-2 rounded-lg border border-emerald-400/20 bg-black/25 p-2.5">
                <p className="text-[8.5px] font-black uppercase tracking-widest text-emerald-300/70">{tt("ksHadisHikaye")}</p>
                {hikaye ? (
                  <>
                    {hikaye.olay.split("\n\n").map((paragraf, j) => (
                      <p key={j} className="mt-1.5 text-[10px] leading-relaxed text-white/75">{paragraf}</p>
                    ))}
                    <p className="mt-2 text-[8.5px] font-bold text-emerald-300/60">📖 {hikaye.kaynak}</p>
                  </>
                ) : (
                  <p className="mt-1 text-[9.5px] leading-relaxed text-white/55">{tt("ksHadisHikayeNot")}</p>
                )}
              </div>
            )}
          </div>
          );
        })}
        {filtreliHadisler.length === 0 && !kuliyatYukleniyor && kuliyatSonuc.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-[11px] text-white/40">{arama ? (kuliyatOffline ? tt("ksCevrimdisiUyari") : tt("ksKulliyatYok")) : tt("ksYerelBulunamadi")}</p>
          </div>
        )}
        {/* ★ ÇEVRİMİÇİ SONUÇLAR — aramada internetten (Sünnetimiz vb.), derece/kaynakla */}
        {kuliyatSonuc.length > 0 && (
          <div className="pt-1">
            <p className="mb-1.5 text-[9px] font-bold text-amber-200/80">{tt("ksCevrimiciSonuclar")} · {kuliyatSonuc.length}</p>
          </div>
        )}
        {kuliyatSonuc.map((h, i) => {
          const anahtar = `k-${i}-${h.kaynak.slice(0, 20)}`;
          const acik = acikKart === anahtar;
          return (
          <div key={anahtar} className={`rounded-xl border p-3 transition ${acik ? "border-amber-400/40 bg-amber-500/[.08]" : "border-amber-400/20 bg-amber-500/[.04]"}`}>
            <button type="button" onClick={() => setAcikKart(acik ? null : anahtar)} aria-expanded={acik} className="block w-full text-left">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-[10.5px] leading-relaxed ${h.dil === "ar" ? "text-right font-arabic text-[13px]" : "text-white/80"}`} dir={h.dil === "ar" ? "rtl" : undefined}>
                  {h.metin}
                </p>
                <span title={dereceAdi(h.derece) || h.kaynak} className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black ${dereceSinif(h.derece)}`}>{dereceAdi(h.derece) || kaynaktanRivayetci(h.kaynak) || ""}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <p className="text-[8.5px] text-white/40">— {h.kaynak}</p>
                <span className="ml-auto flex items-center gap-0.5 text-[8px] font-bold text-amber-200/60">
                  {acik ? tt("ksHadisKapat") : tt("ksHadisHikaye")}
                  <ChevronDown size={10} className={acik ? "rotate-180 transition" : "transition"} />
                </span>
              </div>
            </button>
            {acik && (
              <div className="mt-2 rounded-lg border border-amber-400/20 bg-black/25 p-2.5">
                <p className="text-[8.5px] font-black uppercase tracking-widest text-amber-200/70">{tt("ksHadisHikaye")}</p>
                {(() => {
                  const hikaye = hadisHikayesi(h.kaynak);
                  if (!hikaye) return <p className="mt-1 text-[9.5px] leading-relaxed text-white/55">{tt("ksHadisHikayeNot")}</p>;
                  return (
                    <>
                      {hikaye.olay.split("\n\n").map((paragraf, j) => (
                        <p key={j} className="mt-1.5 text-[10px] leading-relaxed text-white/75">{paragraf}</p>
                      ))}
                      <p className="mt-2 text-[8.5px] font-bold text-amber-200/60">📖 {hikaye.kaynak}</p>
                    </>
                  );
                })()}
                {h.url && (
                  <a href={h.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-[8.5px] font-bold text-amber-200/70 underline">
                    {h.kaynak} →
                  </a>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>
      {/* ★ 27.11 (kullanıcı emri): tam külliyat tarayıcısı — Buhârî 7.589, Müslim 7.603… */}
      <HadisKulliyat tt={tt} dil={dil ?? "tr"} />
    </>
  );
}

// ── 19a: MEZHEPLER — üst 4 buton + alt detay (02.11 kullanıcı emri) ──
