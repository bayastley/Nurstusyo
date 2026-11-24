import React from "react";
import { Copy, Plus, Share2, Trash2, Users } from "lucide-react";
import type { Lang } from "../../i18n";
import {
  geriBildirimYaz, grupOlustur, grupSil, hedefDegistir, iceAktar, ilerleme, kodCoz, kodUret,
  toplulukOku, uyeEkle, uyeSil, type Topluluk, type ToplulukTuru, type ToplulukVeri, type Uye,
} from "../../studio/topluluk";

// ════════════════════════════════════════════════════════
// TOPLULUKBOLUMU.TSX — Sunucusuz topluluk (madde 46, 47, 56, 57)
// Hafızlık grubu · Kur'an halkası · İlim kulübü · Hoca-öğrenci
// Veri cihazda; paylaşım "davet kodu" (base64 metin) ile yapılır. Ağ yok.
// ════════════════════════════════════════════════════════

const TURLER: Array<{ id: ToplulukTuru; key: string }> = [
  { id: "hafizlik", key: "tpTurHafizlik" },
  { id: "kuran", key: "tpTurKuran" },
  { id: "ilim", key: "tpTurIlim" },
  { id: "hoca", key: "tpTurHoca" },
];

export function ToplulukBolumu({ tt }: { tt?: (k: string) => string; lang?: Lang }) {
  const t = tt ?? ((k: string) => k);
  const [veri, setVeri] = React.useState<ToplulukVeri>(() => toplulukOku());
  const [tur, setTur] = React.useState<ToplulukTuru>("hafizlik");
  const [ad, setAd] = React.useState("");
  const [hedefler, setHedefler] = React.useState("");
  const [acik, setAcik] = React.useState<string | null>(null);
  const [uyeAd, setUyeAd] = React.useState("");
  const [kod, setKod] = React.useState("");
  const [mesaj, setMesaj] = React.useState("");

  const bildir = (m: string) => {
    setMesaj(m);
    setTimeout(() => setMesaj(""), 3000);
  };

  const olustur = () => {
    if (!ad.trim()) return;
    const liste = hedefler.split("\n").map((h) => h.trim()).filter(Boolean);
    if (!liste.length) return;
    const yeni = grupOlustur(tur, ad, liste);
    setVeri(yeni);
    setAd("");
    setHedefler("");
  };

  const kopyala = async (grup: Topluluk, uyeId?: string) => {
    const metin = kodUret(grup, uyeId);
    setKod(metin);
    try {
      await navigator.clipboard.writeText(metin);
      bildir(t("tpKopyalandi"));
    } catch (hata) {
      console.warn("Panoya yazılamadı, kod kutuda:", hata);
      bildir(t("tpKodKutuda"));
    }
  };

  const iceAl = () => {
    const { grup, hata } = kodCoz(kod);
    if (!grup) { bildir(`${t("tpKodHata")}: ${hata ?? "-"}`); return; }
    setVeri(iceAktar(grup));
    setKod("");
    bildir(t("tpIceAlindi"));
  };

  const ortalama = (grup: Topluluk): number => {
    if (!grup.uyeler.length) return 0;
    return Math.round(grup.uyeler.reduce((n, u) => n + ilerleme(grup, u), 0) / grup.uyeler.length);
  };

  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-black text-white/85">
          <Users size={12} /> {t("ksTopluluk")}
        </p>
        <p className="text-[9px] leading-relaxed text-white/45">{t("tpNot")}</p>
      </div>

      {/* Yeni grup */}
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="mb-1.5 text-[9.5px] font-black text-white/75">{t("tpYeni")}</p>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {TURLER.map((x) => (
            <button key={x.id} type="button" onClick={() => setTur(x.id)}
              className={`rounded-full border px-2.5 py-1 text-[8.5px] font-bold transition ${tur === x.id ? "border-transparent bg-white/15 text-white" : "border-white/10 bg-white/[.03] text-white/50"}`}>
              {t(x.key)}
            </button>
          ))}
        </div>
        <input value={ad} onChange={(e) => setAd(e.target.value)} placeholder={t("tpAd")}
          className="mb-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[9.5px] text-white/85 outline-none placeholder:text-white/25" />
        <textarea value={hedefler} onChange={(e) => setHedefler(e.target.value)} rows={3}
          placeholder={t("tpHedefIpucu")}
          className="mb-1.5 w-full resize-y rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-[9.5px] text-white/85 outline-none placeholder:text-white/25" />
        <button type="button" onClick={olustur} disabled={!ad.trim() || !hedefler.trim()}
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-white/10 py-1.5 text-[9px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-40">
          <Plus size={11} /> {t("tpOlustur")}
        </button>
      </div>

      {mesaj && <p className="text-center text-[8.5px] font-bold text-emerald-300">{mesaj}</p>}

      {veri.gruplar.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/[.02] py-4 text-center text-[9.5px] text-white/40">{t("tpGrupYok")}</p>
      )}

      {veri.gruplar.map((grup) => {
        const acikMi = acik === grup.id;
        const yuzde = ortalama(grup);
        return (
          <div key={grup.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
            <button type="button" onClick={() => { setAcik(acikMi ? null : grup.id); setUyeAd(""); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-bold text-white/90">{grup.ad}</span>
                <span className="block text-[8px] text-white/45">
                  {t(TURLER.find((x) => x.id === grup.tur)?.key ?? "tpTurHafizlik")} · {grup.uyeler.length} {t("tpUye")} · {grup.hedefler.length} {t("tpHedef")}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-black" style={{ color: "var(--accent)" }}>{yuzde}%</span>
            </button>

            {acikMi && (
              <div className="space-y-2 border-t border-white/[.07] px-3 py-2.5">
                {grup.uyeler.length === 0 && <p className="text-[8.5px] text-white/35">{t("tpUyeYok")}</p>}
                {grup.uyeler.map((uye) => (
                  <div key={uye.id} className="rounded-lg bg-white/[.04] px-2 py-1.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="min-w-0 flex-1 truncate text-[9px] font-bold text-white/80">{uye.ad}</span>
                      <span className="text-[8.5px] font-black" style={{ color: "var(--accent)" }}>{ilerleme(grup, uye)}%</span>
                      <button type="button" aria-label={t("tpUyeSil")} onClick={() => setVeri(uyeSil(grup.id, uye.id))} className="text-white/25 hover:text-red-300">
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${ilerleme(grup, uye)}%`, background: "linear-gradient(90deg,var(--accent-2),var(--accent))" }} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {grup.hedefler.map((h, i) => (
                        <button key={i} type="button" onClick={() => setVeri(hedefDegistir(grup.id, uye.id, i))}
                          className={`rounded-md border px-1.5 py-0.5 text-[7.5px] font-bold transition ${uye.tamam.includes(i) ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200" : "border-white/10 bg-white/[.03] text-white/45"}`}>
                          {uye.tamam.includes(i) ? "✓ " : ""}{h}
                        </button>
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button type="button" onClick={() => void kopyala(grup, uye.id)}
                        className="flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[7.5px] font-bold text-white/65">
                        <Share2 size={9} /> {t("tpTeslimKodu")}
                      </button>
                      {grup.tur === "hoca" && <GeriBildirim tt={t} grupId={grup.id} uye={uye} kaydet={(m) => setVeri(geriBildirimYaz(grup.id, uye.id, m))} />}
                    </div>
                    {uye.geriBildirim ? (
                      <p className="mt-1 rounded-md bg-amber-500/[.08] px-1.5 py-1 text-[8px] leading-relaxed text-amber-200/85">
                        {t("tpGeriBildirim")}: {uye.geriBildirim}
                      </p>
                    ) : null}
                  </div>
                ))}

                <div className="flex gap-1.5">
                  <input value={uyeAd} onChange={(e) => setUyeAd(e.target.value)} placeholder={t("tpUyeAd")}
                    className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[8.5px] text-white/85 outline-none placeholder:text-white/25" />
                  <button type="button" disabled={!uyeAd.trim()}
                    onClick={() => { setVeri(uyeEkle(grup.id, uyeAd)); setUyeAd(""); }}
                    className="rounded-md bg-white/10 px-2 py-1 text-[8px] font-bold text-white/75 disabled:opacity-40">
                    {t("tpUyeEkle")}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-white/[.07] pt-1.5">
                  <button type="button" onClick={() => void kopyala(grup)}
                    className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[8px] font-bold text-white/70">
                    <Copy size={9} /> {t("tpKodAl")}
                  </button>
                  <button type="button" onClick={() => { if (window.confirm(`${grup.ad} — ${t("tpSilOnay")}`)) setVeri(grupSil(grup.id)); }}
                    className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[8px] font-bold text-red-200/80">
                    <Trash2 size={9} /> {t("tpSil")}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Davet / teslim kodu içe aktarma */}
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
        <p className="mb-1.5 text-[9px] font-black text-white/70">{t("tpKodIce")}</p>
        <textarea value={kod} onChange={(e) => setKod(e.target.value)} rows={2} placeholder={t("tpKodIpucu")}
          className="mb-1.5 w-full resize-y rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-[8.5px] text-white/80 outline-none placeholder:text-white/25" />
        <button type="button" onClick={iceAl} disabled={!kod.trim()}
          className="w-full rounded-lg bg-white/10 py-1.5 text-[8.5px] font-bold text-white/75 disabled:opacity-40">
          {t("tpIceAl")}
        </button>
      </div>
    </div>
  );
}

function GeriBildirim({
  tt, grupId, uye, kaydet,
}: { tt: (k: string) => string; grupId: string; uye: Uye; kaydet: (m: string) => void }) {
  const [metin, setMetin] = React.useState(uye.geriBildirim ?? "");
  React.useEffect(() => { setMetin(uye.geriBildirim ?? ""); }, [uye.id, uye.geriBildirim, grupId]);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <input value={metin} onChange={(e) => setMetin(e.target.value)} placeholder={tt("tpGeriBildirimYaz")}
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[7.5px] text-white/80 outline-none placeholder:text-white/25" />
      <button type="button" onClick={() => kaydet(metin)}
        className="rounded-md bg-white/10 px-1.5 py-0.5 text-[7.5px] font-bold text-white/70">
        {tt("tpKaydet")}
      </button>
    </div>
  );
}
