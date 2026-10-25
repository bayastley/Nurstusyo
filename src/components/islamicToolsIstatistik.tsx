// ─── İSTATİSTİK / ROZET / ÇEVRİMDIŞI bloğu (03.10 parçalama) ───
// islamicToolsVucut.tsx'ten bağlamı korunarak taşındı; islamicToolsVucut
// dışa açık adları re-export eder — mevcut import edenler KIRILMAZ.
import React, { useState } from "react";
import { rozetlerOku, rozetleriTazele, ROZET_LISTESI, rozetOzelOku, rozetGuncelEsik, rozetEsikCarpani, rozetOduluHesapla } from "../hafizlikIstatistik";
// ★ 26.10 i18n — LS diline göre çeviri
import { translate } from "../i18n";
const tt = (k: string): string => translate(typeof localStorage !== "undefined" ? localStorage.getItem("nur_lang") : "tr", k);

// ★ ÇEVRİMDIŞI TİLAVET (İş 24+59) — Service Worker dinlenen ayet seslerini
//   cache'e yazar. Bu kart yalnızca DURUMU gösterir:
//   kaç ayet sesi cihazda + çevrimdışı mı. Bilgi amaçlı, tek kart.
// ★ AD DÜRÜSTLÜĞÜ (29.09): kart eskiden nurstudyo-audio-v3'e bakıyordu, SW ise
//   v4'e yazıyordu → sayaç hep boş görünüyordu. Ses cache'i artık SÜRÜMSÜZ adla
//   yaşar (sw.js AUDIO_CACHE); kabuk sürümü artsay da kullanıcı sesleri korunur.
export const AUDIO_CACHE_ADI = "nurstudyo-audio"; // sw.js AUDIO_CACHE ile birebir
export function CevrimdisiKart() {
  const [adet, setAdet] = useState<number | null>(null);
  const [cevrimdisi, setCevrimdisi] = useState(!navigator.onLine);
  const [destek, setDestek] = useState(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;
    setDestek(true);
    let live = true;
    (async () => {
      try {
        const cache = await caches.open(AUDIO_CACHE_ADI);
        const keys = await cache.keys();
        if (live) setAdet(keys.length);
      } catch { /* yoksay */ }
    })();
    const online = () => setCevrimdisi(false);
    const offline = () => setCevrimdisi(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => { live = false; window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);

  if (!destek) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden>📥</span>
        <div>
          <p className="text-[10px] font-bold text-white">{tt("itCevrimdisiTilavet")}</p>
          <p className="text-[8px] text-white/40">
            {cevrimdisi
              ? tt("itSimdiCevrimdisisun")
              : adet === null
                ? tt("itSesSayiliyor")
                : adet === 0
                  ? tt("itOtomatikKayit")
                  : `${adet} ${tt("itAyetSesiHazir")}`}
          </p>
        </div>
      </div>
      <span className={`shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black ${cevrimdisi ? "bg-amber-500/25 text-amber-200" : "bg-emerald-500/15 text-emerald-300"}`}>
        {cevrimdisi ? tt("itCevrimdisiEtiket") : tt("itHazirEtiket")}
      </span>
    </div>
  );
}


// ★ ÜRETİCİ İSTATİSTİKLERİ (İş 42) — yerel üretim sayacı (yalnız cihazda,
//   sunucuya GİTMEZ). useVideoGenerator başarılı üretimde +1 yazar.

// ═══════════ ISLAMICTOOLSBOLUMLERI.TSX BLOK: rozet (kaynak 740-926) ═══════════
export const URETIM_IST_KEY = "nur_uretim_istatistik_v1";
export interface UretimIst {
  toplam: number;
  kisa: number;
  uzun: number;
  tam: number;
  ilkTarih: number;
  sonTarih: number;
}
export function uretimIstOku(): UretimIst {
  try {
    const raw = localStorage.getItem(URETIM_IST_KEY);
    if (raw) return JSON.parse(raw) as UretimIst;
  } catch { /* yoksay */ }
  return { toplam: 0, kisa: 0, uzun: 0, tam: 0, ilkTarih: 0, sonTarih: 0 };
}
export function uretimIstYaz(mode: "short" | "long" | "full"): void {
  try {
    const ist = uretimIstOku();
    ist.toplam += 1;
    if (mode === "short") ist.kisa += 1;
    else if (mode === "long") ist.uzun += 1;
    else ist.tam += 1;
    if (!ist.ilkTarih) ist.ilkTarih = Date.now();
    ist.sonTarih = Date.now();
    localStorage.setItem(URETIM_IST_KEY, JSON.stringify(ist));
  } catch { /* yoksay */ }
}

// ★ ROZETLER (madde 16) — başarımlar: test, zikir, hatim, üretim
//   Veri: hafizlikIstatistik.ts rozetleriTazele() — yalnız cihazda
export function RozetlerKarti() {
  const [rozetler, setRozetler] = useState(() => rozetlerOku());
  const [yeniRozet, setYeniRozet] = useState<string | null>(null);
  // ★ ÖDÜL DÖNGÜSÜ (28.09): tur sayısı + rozet başına kazanım (kırmızı yıldız) + ödül bildirimi
  const [ozel, setOzel] = useState(() => rozetOzelOku());
  const [odulMsg, setOdulMsg] = useState<string | null>(null);
  React.useEffect(() => {
    rozetleriTazele();
    setRozetler(rozetlerOku());
    setOzel(rozetOzelOku());
    const kazanildi = (e: Event) => {
      const liste = (e as CustomEvent<string[]>).detail || [];
      if (liste.length) {
        setYeniRozet(liste[0]);
        window.setTimeout(() => setYeniRozet(null), 4000);
        if (String(liste[0]).includes("🎁")) setOdulMsg(String(liste[0]));
      }
      setRozetler(rozetlerOku());
      setOzel(rozetOzelOku());
    };
    window.addEventListener("nur-rozet-kazanildi", kazanildi);
    return () => window.removeEventListener("nur-rozet-kazanildi", kazanildi);
  }, []);
  const kazanimSayisi = Object.keys(rozetler.kazanim).length;
  const odulHak = rozetOduluHesapla(ozel.turNo);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>🏅</span>
          <p className="text-[10px] font-bold text-white">{tt("itRozetlerIni")}</p>
        </div>
        <div className="flex items-center gap-1">
          {ozel.turNo > 1 && (
            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[8px] font-black text-red-300" title={tt("itRozetSerisi").replace("{n}", String(ozel.turNo - 1))}>★ {ozel.turNo - 1}</span>
          )}
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[8.5px] font-black text-amber-200">{kazanimSayisi}/{ROZET_LISTESI.length}</span>
        </div>
      </div>
      {odulMsg && (
        <p className="mb-1.5 animate-pulse rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-center text-[9px] font-black text-emerald-200">
          {odulMsg}
        </p>
      )}
      {yeniRozet && (
        <p className="mb-1.5 animate-pulse rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-center text-[9px] font-black text-emerald-200">
          🎉 {tt("itYeniRozet")} {yeniRozet}!
        </p>
      )}
      <div className="grid grid-cols-7 gap-1">
        {ROZET_LISTESI.map((r) => {
          const acik = !!rozetler.kazanim[r.id];
          // ★ KIRMIZI KÜÇÜK YILDIZ: rozet kaç turda kazanıldıysa sol üstünde o sayı yazar
          const tur = ozel.kazanimSayisi[r.id] || 0;
          const esik = rozetGuncelEsik(r.id, ozel.turNo);
          const esikMetni = esik !== null ? ` · ${tt("itBuTurda")}${esik}` : "";
          // ★ MİNİ İLERLEME ÇUBUĞU (29.09, kullanıcı isteği): kilitli rozette bu turdaki
          //   hedefe ne kadar kaldı tek bakışta görünür. Değer = mevcut sayaç (taban
          //   üstünden), hedef = taban + eşik×çarpan (rozetGuncelEsik). Açık rozet ve
          //   meta'sız rozet (streak) çubuksuz — görsel gürültü olmasın.
          const metaAlan = r.kosulMeta?.alan;
          const mevcut = metaAlan ? (rozetler[metaAlan] as number) ?? 0 : 0;
          const hedef = esik ?? 0;
          const tabanDeger = metaAlan ? (ozel.taban[metaAlan] as number) ?? 0 : 0;
          const turIlerleme = Math.max(0, mevcut - tabanDeger);
          const turHedef = Math.max(1, hedef - tabanDeger);
          const oran = acik ? 1 : esik !== null ? Math.min(1, turIlerleme / turHedef) : 0;
          const kalan = Math.max(0, hedef - mevcut);
          return (
            <div key={r.id} className="relative" title={`${r.ad} — ${r.aciklama}${esikMetni}${tur > 0 ? ` · ${tt("itKazanildiXS").replace("{n}", String(tur))}` : ""}${!acik && esik !== null ? ` · ${tt("itKalanXS").replace("{n}", String(kalan))}` : ""}`}>
              <div className={`flex aspect-square items-center justify-center rounded-lg text-base transition ${
                acik ? "bg-amber-500/20 ring-1 ring-amber-400/40" : "bg-white/5 opacity-30 grayscale"
              }`}>
                {r.emoji}
              </div>
              {/* mini ilerleme çubuğu — hücrenin altına yapışık, 3px */}
              {!acik && esik !== null && (
                <div className="absolute inset-x-1 bottom-0.5 h-[3px] overflow-hidden rounded-full bg-black/50" aria-hidden>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(oran * 100)}%`,
                      background: oran >= 1 ? "var(--accent-2)" : "linear-gradient(90deg, rgba(215,170,82,.55), rgba(215,170,82,.95))",
                    }}
                  />
                </div>
              )}
              {tur > 0 && (
                <span className="absolute -left-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[6.5px] font-black text-white shadow" title={`${r.ad}: ${tt("itKazanildiYenis").replace("{n}", String(tur))}`}>★{tur > 1 ? tur : ""}</span>
              )}
            </div>
          );
        })}
      </div>
      {/* ★ DÖNGÜ BİLGİSİ: sıradaki ödül + zorluk çarpanı */}
      <p className="mt-1.5 text-center text-[7.5px] text-white/35">
        {ozel.turNo > 1
          ? <>🔄 {tt("itTurNo").replace("{n}", String(ozel.turNo))} · <b className="text-red-300">{rozetEsikCarpani(ozel.turNo)}×</b> · {tt("itBitinceOdul").replace("{h}", String(odulHak))}</>
          : <>{tt("itRozetOdulOnay")} <b className="text-amber-300">+{odulHak}</b>{" "}{tt("itUretimHakki")}{tt("itSonraZorlasir")}</>}
      </p>
      {ozel.sonOdul > 0 && (
        <p className="mt-0.5 text-center text-[7px] text-white/25">{tt("itSonOdul").replace("{n}", String(ozel.sonOdul)).replace("{d}", new Date(ozel.sonOdulTarih).toLocaleDateString("tr-TR"))} · {tt("itRozetAltYildiz")}</p>
      )}
      <p className="mt-1 text-center text-[7.5px] text-white/30">{tt("itRozetCihazDipnot")}</p>
    </div>
  );
}

export function UreticiIstatistikKarti() {
  const [ist, setIst] = useState<UretimIst>(() => uretimIstOku());
  React.useEffect(() => {
    const tazele = () => setIst(uretimIstOku());
    window.addEventListener("uretim-istatistik", tazele);
    return () => window.removeEventListener("uretim-istatistik", tazele);
  }, []);
  const gun = ist.toplam && ist.ilkTarih ? Math.max(1, Math.ceil((ist.sonTarih - ist.ilkTarih) / 86_400_000)) : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-base" aria-hidden>📊</span>
        <p className="text-[10px] font-bold text-white">{tt("itUreticiIst")}</p>
      </div>
      {ist.toplam === 0 ? (
        <p className="text-[8px] leading-relaxed text-white/40">{tt("itUreticiBos")}</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-emerald-300">{ist.toplam}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">{tt("itToplamK")}</p>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-sky-300">{ist.kisa}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">{tt("itKisaK")}</p>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-amber-300">{ist.uzun}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">{tt("itUzunK")}</p>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className="text-[13px] font-black text-fuchsia-300">{ist.tam}</p>
              <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">{tt("itTamK")}</p>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[8px] text-white/35">
            {gun > 0 ? tt("itUretimGun").replace("{g}", String(gun)).replace("{o}", (ist.toplam / gun).toFixed(1)) : ""} · {tt("itYalnizCihaz")}
          </p>
        </>
      )}
    </div>
  );
}
