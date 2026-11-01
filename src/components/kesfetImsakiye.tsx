// KESFETIMSAKIYE.TSX — Keşfet > 🌙 Ramazan İmsakiyesi sekmesi (01.11, kullanıcı emri:
// "ramazan yaklaşıyor, eski duvar takvimleri gibi: gün yazardı, altında o günüyle ilgili
// yazı olurdu — bizde her gün o güne özel bir hadis olsun")
// • Vakit kaynağı: aladhan.com aylık takvim ucu (method=13 = Diyanet), kullanıcı şehri
//   Namaz Vakti sekmende kayıtlı olan (localStorage "nur_city") — yeni izin SORULMAZ.
// • Pencere: bugünden itibaren 30 gün (ay sonunu aşıyorsa sıradaki ay da çekilir).
// • Her satır tıklanır → üstteki büyük "Günün Hadisi" kartı o güne döner (duvar takvimi gibi).
// • Hicri ay Ramazan (9. ay) olan satırlarda günün yani "1🌙, 2🌙" ibaresi görünür.

import React from "react";
import { HADIS_BANKASI, HADIS_DERECE_ETIKETI } from "../data/hadisData";

type Gunluk = {
  tarih: Date;
  imsak: string;
  iftar: string;
  /** Hicri ay Ramazan olduğunda gün numarası (1–30), değilse null */
  ramazanGunu: number | null;
};

/** aladhan dönüşündeki "05:02 (TRT)" biçimini "05:02"e indirir */
const vakitTemizle = (s: string): string => (s || "").replace(/\s*\(.*?\)\s*/g, "").trim();

/** Dil kodu → Intl locale (tarihleri 5 dilde yazmak için) */
const LOCALE: Record<string, string> = { tr: "tr-TR", en: "en-US", ar: "ar", id: "id-ID", ur: "ur" };

const DERECE_RENK: Record<string, string> = { sahih: "text-emerald-300", hasan: "text-sky-300", zayif: "text-amber-300" };

export const KesfetImsakiye: React.FC<{ tt: (k: string) => string; lang?: string }> = ({ tt, lang = "tr" }) => {
  const [gunler, setGunler] = React.useState<Gunluk[] | null>(null);
  const [hata, setHata] = React.useState(false);
  // Seçili gün: 0 = bugün (açılışta duvar takviminin "o gün"ü — duvar takvimi gibi bugün açılır)
  const [secili, setSecili] = React.useState(0);

  const sehir = React.useMemo(() => {
    try { const c = localStorage.getItem("nur_city"); return c && c.trim() ? c.trim() : "İstanbul"; } catch { return "İstanbul"; }
  }, []);

  const bugun = React.useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  React.useEffect(() => {
    let live = true;
    const ayCek = async (y: number, m: number): Promise<any[]> => {
      const r = await fetch(`https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(sehir)}&country=Turkey&method=13&month=${m}&year=${y}`);
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    };
    (async () => {
      try {
        const y = bugun.getFullYear();
        const m = bugun.getMonth() + 1;
        const buAy = await ayCek(y, m);
        // 30 günlük pencere: bugünden itibaren; ay sonunu aşıyorsa sıradaki ayı da al
        let ham: any[] = buAy.slice(bugun.getDate() - 1);
        if (ham.length < 30) {
          const nmY = m === 12 ? y + 1 : y;
          const nmM = m === 12 ? 1 : m + 1;
          ham = ham.concat(await ayCek(nmY, nmM));
        }
        if (!live) return;
        if (ham.length < 10) { setHata(true); return; }
        const liste: Gunluk[] = ham.slice(0, 30).map((k) => {
          // ★ aladhan dönüş biçimi: gregorian.month NESNE ({number, en}), hijri k.date.hijri altında
          const g = k?.date?.gregorian; const h = k?.date?.hijri; const t = k?.timings ?? {};
          const varsa = g?.day && g?.year ? new Date(Number(g.year), Number(g.month?.number) - 1, Number(g.day)) : null;
          return {
            tarih: varsa ?? bugun,
            imsak: vakitTemizle(t.Fajr),
            iftar: vakitTemizle(t.Maghrib),
            ramazanGunu: h?.month?.number === 9 ? Number(h.day) : null,
          };
        });
        setGunler(liste);
      } catch {
        if (live) setHata(true);
      }
    })();
    return () => { live = false; };
  }, [sehir, bugun]);

  // Günün hadisi: tarihe göre havuzdan SABİT seçim (her gün farklı, aynı gün herkeste aynı)
  const havuz = HADIS_BANKASI.length > 0 ? HADIS_BANKASI : [];
  const gunNo = (d: Date) => Math.floor(d.getTime() / 86_400_000);
  const gununHadisi = (d: Date) => (havuz.length ? havuz[((gunNo(d) % havuz.length) + havuz.length) % havuz.length] : null);

  const secilenGun = gunler && gunler[secili] ? gunler[secili] : null;
  const secilenHadis = secilenGun ? gununHadisi(secilenGun.tarih) : null;
  const locale = LOCALE[lang] || "tr-TR";

  return (
    <div className="space-y-3">
      {/* ── ÜST AÇIKLAMA ── */}
      <p className="text-center text-[9px] text-white/40">{tt("ksImsMetin")}</p>

      {/* ── BÜYÜK KART (duvar takviminin "ildan kağıdı"): gün + hadis + imsak/iftar ── */}
      <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 to-transparent p-4 text-center">
        {secilenGun ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300/80">{tt(secili === 0 ? "ksImsBugun" : "ksImsGun")} · {secili + 1}</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-white">
              {secilenGun.tarih.getDate()}
              <span className="ml-1 text-[11px] font-bold text-white/55">
                {secilenGun.tarih.toLocaleDateString(locale, { month: "long", year: "numeric" })}
              </span>
              {secilenGun.ramazanGunu ? <span className="ml-1.5 text-base" title="Ramazan">🌙{secilenGun.ramazanGunu}</span> : null}
            </p>
            <div className="mt-2 flex items-center justify-center gap-5 text-[11px] font-bold">
              <span className="text-amber-200">🌅 {tt("ksImsImsak")} <span className="tabular-nums text-white">{secilenGun.imsak || "--:--"}</span></span>
              <span className="text-orange-200">🌇 {tt("ksImsIftar")} <span className="tabular-nums text-white">{secilenGun.iftar || "--:--"}</span></span>
            </div>
            {secilenHadis && (
              <>
                <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-white/40">✦ {tt("ksImsGununHadisi")}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/90">“{secilenHadis.metin}”</p>
                <p className="mt-1.5 text-[9.5px] text-white/45">
                  {secilenHadis.kaynak}
                  {secilenHadis.derece && <span className={`ml-1.5 font-bold ${DERECE_RENK[secilenHadis.derece] || "text-white/50"}`}>· {HADIS_DERECE_ETIKETI[secilenHadis.derece]?.label || secilenHadis.derece}</span>}
                </p>
              </>
            )}
          </>
        ) : (
          <p className="py-6 text-[11px] font-bold text-white/60">{hata ? tt("ksImsHata") : tt("ksImsYukleniyor")}</p>
        )}
      </div>

      {/* ── 30 GÜNLÜK TABLO ── */}
      {!gunler && !hata && <p className="text-center text-[9.5px] text-white/40">{tt("ksImsYukleniyor")}</p>}
      {gunler && gunler.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-[10.5px]">
            <thead>
              <tr className="bg-white/5 text-[9px] uppercase tracking-wider text-white/45">
                <th className="px-2.5 py-1.5 font-black">{tt("ksImsGun")}</th>
                <th className="px-2.5 py-1.5 font-black">{tt("ksImsTarih")}</th>
                <th className="px-2.5 py-1.5 font-black">{tt("ksImsImsak")}</th>
                <th className="px-2.5 py-1.5 font-black">{tt("ksImsIftar")}</th>
              </tr>
            </thead>
            <tbody>
              {gunler.map((g, i) => {
                const bugunku = i === 0;
                const secilmi = i === secili;
                return (
                  <tr
                    key={i}
                    onClick={() => setSecili(i)}
                    className={`cursor-pointer transition ${secilmi ? "bg-amber-400/15" : bugunku ? "bg-white/[.04]" : "hover:bg-white/[.06]"}`}
                  >
                    <td className="px-2.5 py-1.5 font-black tabular-nums text-white/80">
                      {i + 1}{g.ramazanGunu ? <span className="text-amber-300"> 🌙</span> : null}
                    </td>
                    <td className="px-2.5 py-1.5 text-white/70">
                      {bugun.getTime() === g.tarih.getTime() && <span className="mr-1 rounded bg-amber-400/25 px-1 text-[8px] font-black text-amber-200">{tt("ksImsBugun")}</span>}
                      {g.tarih.getDate()} {new Intl.DateTimeFormat(locale, { month: "short" }).format(g.tarih)}
                    </td>
                    <td className="px-2.5 py-1.5 tabular-nums text-amber-200/90">{g.imsak}</td>
                    <td className="px-2.5 py-1.5 tabular-nums text-orange-200/90">{g.iftar}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
