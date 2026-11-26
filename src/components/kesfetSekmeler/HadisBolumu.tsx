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

// ── HİKÂYESİ / NASIL SÖYLENDİ ──────────────────────────────────────────────
// Karttaki künye ("Buhari, Merda, 1") kaynağın kendi kitâb/bâb bilgisidir; bâb
// başlığı hadisin hangi konu üzerine söylendiğini gösterir. Uydurma hikâye
// yazılmaz — yalnız kaynağın verdiği künye, derece ve râvi gösterilir.
const KITAB_ADI: Record<string, string> = {
  merda: "Hastalıklar", edeb: "Edeb (güzel ahlâk)", ezan: "Ezan", savm: "Oruç",
  iman: "İman", tevhid: "Tevhid", zikir: "Zikir", birr: "İyilik ve akrabalık",
  ilim: "İlim", daavat: "Dualar", salat: "Namaz", menakib: "Menkıbeler",
  etime: "Yemekler", suab: "Şuabu'l-Îmân", müsned: "Müsned", cihad: "Cihad",
  zekat: "Zekât", taharet: "Temizlik", nikah: "Nikâh", talak: "Talâk",
  fiten: "Fitneler", rikak: "Rikâk (zühd)", tefsir: "Tefsir", cenaiz: "Cenazeler",
  hac: "Hac", buyu: "Alışveriş", ferâiz: "Miras", hudud: "Hudûd", eyman: "Yeminler",
  libas: "Giyim", esribe: "İçecekler", tib: "Tıp", rüya: "Rüyalar",
  fezail: "Faziletler", itisam: "Sünnete bağlılık", megazi: "Gazveler",
};

const _sade = (s: string): string =>
  (s || "")
    .toLocaleLowerCase("tr")
    .replace(/[âÂ]/g, "a").replace(/[îÎ]/g, "i").replace(/[ûÛ]/g, "u")
    .replace(/[İIı]/g, "i").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g")
    .replace(/[çÇ]/g, "c").replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]/g, "");

/** "Buhari, Merda, 1" → { muhaddis: "Buhari", kitab: "Merda", bab: "1" } */
function kunyeParcala(kaynak: string): { muhaddis: string; kitab: string; bab: string } | null {
  const temiz = (kaynak || "").replace(/\(me[âa]l\)/gi, "").replace(/\s+/g, " ").trim();
  const parcalar = temiz.split(",").map((p) => p.trim()).filter(Boolean);
  if (parcalar.length < 2) return null;
  return { muhaddis: parcalar[0], kitab: parcalar[1], bab: parcalar.slice(2).join(", ") };
}

function BaglamSatiri({ etiket, deger }: { etiket: string; deger: string }) {
  if (!deger) return null;
  return (
    <div className="flex gap-1 text-[9.5px] leading-relaxed">
      <dt className="shrink-0 font-black uppercase tracking-wide text-white/35">{etiket}</dt>
      <dd className="text-white/65">{deger}</dd>
    </div>
  );
}

export function HadisBolumu({
  tt, hadisTema, setHadisTema, hadisTemaAdi, filtreliHadisler,
  kuliyatYukleniyor, kuliyatSonuc, kuliyatOffline, dereceAdi,
  rivayetci, setRivayetci, rivayetciSayilari, arama,
}: {
  tt: (k: string) => string;
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
          const anahtar = `y-${i}-${h.metin.slice(0, 24)}`;
          const acik = acikKart === anahtar;
          const kunye = kunyeParcala(h.kaynak);
          const kitabAdi = kunye ? KITAB_ADI[_sade(kunye.kitab)] ?? kunye.kitab : "";
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
                <p className="mt-0.5 text-[9px] leading-relaxed text-white/50">{tt("ksHadisHikayeNot")}</p>
                <dl className="mt-1.5 space-y-0.5">
                  <BaglamSatiri etiket={tt("ksHadisKitab")} deger={kitabAdi} />
                  <BaglamSatiri etiket={tt("ksHadisBab")} deger={kunye?.bab ?? ""} />
                  <BaglamSatiri etiket={tt("ksRivayetciler")} deger={kunye?.muhaddis ?? kaynaktanRivayetci(h.kaynak)} />
                  <BaglamSatiri etiket={tt("ksHadisKonu")} deger={hadisTemaAdi(h.tema)} />
                  <BaglamSatiri etiket={tt("ksDereceLejand")} deger={dr ? `${dereceAdi(h.derece)} — ${dr.aciklama}` : ""} />
                  <BaglamSatiri etiket={tt("ksKaynakEtiket")} deger={h.kaynak} />
                </dl>
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
                <p className="mt-0.5 text-[9px] leading-relaxed text-white/50">{tt("ksHadisHikayeNot")}</p>
                <dl className="mt-1.5 space-y-0.5">
                  <BaglamSatiri etiket={tt("ksHadisKitab")} deger={h.kitab ?? ""} />
                  <BaglamSatiri etiket={tt("ksHadisBab")} deger={h.bab ?? ""} />
                  <BaglamSatiri etiket={tt("ksDereceLejand")} deger={h.dereceEtiket ?? (dereceAdi(h.derece) || h.kaynak)} />
                </dl>
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
    </>
  );
}

// ── 19a: MEZHEPLER — üst 4 buton + alt detay (02.11 kullanıcı emri) ──
