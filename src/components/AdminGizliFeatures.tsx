import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
// ════════════════════════════════════════════════════════════
// ADMINGIZLIFEATURES.TSX — ÖZELLİK KONTROL MERKEZİ (26.11 yeniden yazıldı)
//
// Kullanıcı emri: "bizde oylama sistemi yok ki onu düzelt; projede hangi
// özellik varsa buraya ekle, hepsini kapatıp açılır — elite/pro'ya ya da
// komple gizleme — açılır kapanır çalışır vaziyette yap."
//
// • OYLAMA / yol haritası metinleri ve "Oylama Listesini Sıfırla" düğmesi
//   TAMAMEN KALDIRILDI. Panel artık yalnızca gerçek kilit yazıyor.
// • Liste OZELLIK_KATALOGU'ndan gelir (Keşfet 28 sekme + 6 üst bar düğmesi
//   + 10 modül = 44 özellik). Her satır arayüzde gerçekten okunur:
//   ozellikGorunur(id) → nur_feature_locks.feature_id.
// • Dört durum: HERKESE AÇIK (free) · PRO · ELİT · GİZLİ (hiç görünmez).
//   Yazma: DELETE /api/roadmap { action:"setLock" | "bulkLock" }.
// ════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Search, Save, RotateCcw } from "lucide-react";
import { OZELLIK_KATALOGU, OZELLIK_GRUPLARI, type OzellikSatiri } from "../features/ozellikKatalogu";
import { ozellikDurumu, type OzellikDurumu } from "../features/ozellikKilit";
import { fetchRemoteConfig, setFeatureLock } from "../services/adminSyncService";
import type { FeatureLock } from "../services/adminSyncService";

interface Props {
  notify: (msg: string) => void;
}

const DURUMLAR: Array<{ id: OzellikDurumu; etiket: string; renk: string }> = [
  { id: "free", etiket: "agmFree", renk: "bg-emerald-500/25 text-emerald-200 ring-emerald-400/40" },
  { id: "pro", etiket: "agmPro", renk: "bg-sky-500/25 text-sky-200 ring-sky-400/40" },
  { id: "elit", etiket: "agmElit", renk: "bg-fuchsia-500/25 text-fuchsia-200 ring-fuchsia-400/40" },
  { id: "hidden", etiket: "agmGizli", renk: "bg-red-500/25 text-red-200 ring-red-400/40" },
];

export const AdminGizliFeaturesTab: React.FC<Props> = ({ notify }) => {
  const [durumlar, setDurumlar] = useState<Record<string, OzellikDurumu>>({});
  const [arama, setArama] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const oku = () => {
    const yeni: Record<string, OzellikDurumu> = {};
    for (const s of OZELLIK_KATALOGU) yeni[s.id] = ozellikDurumu(s.id);
    setDurumlar(yeni);
  };

  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        await fetchRemoteConfig();
      } catch {
        /* çevrimdışı: yerel önbellekle devam */
      }
      if (!iptal) { oku(); setYukleniyor(false); }
    })();
    return () => { iptal = true; };
  }, []);

  const yaz = async (ids: string[], tier: OzellikDurumu) => {
    if (!ids.length) return;
    setBusy(ids.length === 1 ? ids[0] : "__toplu__");
    try {
      const r = await fetch("/api/roadmap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids.length === 1 ? { action: "setLock", featureId: ids[0], tier } : { action: "bulkLock", ids, tier }),
      });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; count?: number } | null;
      if (r.ok && d?.ok) {
        // DB "hidden" kabul etmiyor → "off" yazılır; ikisi de arayüzde gizli sayılır.
        for (const id of ids) setFeatureLock(id, (tier === "hidden" ? "off" : tier) as FeatureLock);
        setDurumlar((cur) => {
          const yeni = { ...cur };
          for (const id of ids) yeni[id] = tier;
          return yeni;
        });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("nur_kilit_guncel"));
        notify(ttX2610("agmKaydedildi").replace("{n}", String(d.count ?? ids.length)).replace("{s}", ttX2610(DURUMLAR.find((x) => x.id === tier)?.etiket ?? "agmFree")));
      } else {
        notify(d?.error || "Kaydetme başarısız");
      }
    } catch {
      notify(ttX2610("asSunucu"));
    } finally {
      setBusy(null);
    }
  };

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    if (!q) return OZELLIK_KATALOGU;
    return OZELLIK_KATALOGU.filter((s) => `${s.ad} ${s.aciklama} ${s.grup}`.toLocaleLowerCase("tr").includes(q));
  }, [arama]);

  const say = (grup?: string) => {
    const liste = grup ? OZELLIK_KATALOGU.filter((s) => s.grup === grup) : OZELLIK_KATALOGU;
    return {
      toplam: liste.length,
      gizli: liste.filter((s) => (durumlar[s.id] ?? "free") === "hidden").length,
      uyeli: liste.filter((s) => ["pro", "elit"].includes(durumlar[s.id] ?? "free")).length,
    };
  };

  const kart = (s: OzellikSatiri) => {
    const durum = durumlar[s.id] ?? "free";
    return (
      <div key={s.id} className="glass-soft rounded-xl border border-white/10 px-3 py-2.5 space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-sm">{s.emoji}</span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[11px] font-bold text-white">{s.ad}</b>
            <p className="text-[9px] leading-snug text-white/40">{s.aciklama}</p>
          </div>
          <span className="shrink-0 rounded bg-black/40 px-1.5 py-0.5 font-mono text-[7.5px] text-white/30">{s.id}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {DURUMLAR.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={busy !== null}
              onClick={() => void yaz([s.id], d.id)}
              className={`rounded-lg px-2 py-1 text-[8.5px] font-black ring-1 transition disabled:opacity-40 ${durum === d.id ? d.renk : "bg-white/[.04] text-white/40 ring-white/10 hover:bg-white/[.09]"}`}
              title={ttX2610(d.etiket)}
            >
              {ttX2610(d.etiket)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (yukleniyor) {
    return <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center text-[11px] text-white/50">{ttX2610("agfYukleniyor")}</div>;
  }

  const genel = say();

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4 space-y-2">
        <h4 className="font-display text-sm font-black text-white">🎛️ {ttX2610("agmBaslik")}</h4>
        <p className="text-[10px] leading-relaxed text-white/60">{ttX2610("agmAciklama")}</p>
        <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] font-bold">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-white/60">{genel.toplam} {ttX2610("agmOzellik")}</span>
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-200">{genel.gizli} {ttX2610("agmGizliSayi")}</span>
          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-200">{genel.uyeli} {ttX2610("agmUyeliSayi")}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <button type="button" disabled={busy !== null} onClick={() => void yaz(OZELLIK_KATALOGU.map((s) => s.id), "free")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-2.5 py-1.5 text-[9.5px] font-black text-emerald-200 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/30 disabled:opacity-40">
            <Eye size={11} /> {ttX2610("agmHepsiAc")}
          </button>
          <button type="button" disabled={busy !== null} onClick={() => void yaz(OZELLIK_KATALOGU.map((s) => s.id), "hidden")}
            className="flex items-center gap-1.5 rounded-xl bg-red-500/20 px-2.5 py-1.5 text-[9.5px] font-black text-red-200 ring-1 ring-red-400/30 transition hover:bg-red-500/30 disabled:opacity-40">
            <EyeOff size={11} /> {ttX2610("agmHepsiGizle")}
          </button>
          <button type="button" disabled={busy !== null} onClick={() => { oku(); notify(ttX2610("agmYenilendi")); }}
            className="flex items-center gap-1.5 rounded-xl bg-white/[.06] px-2.5 py-1.5 text-[9.5px] font-black text-white/60 ring-1 ring-white/10 transition hover:bg-white/[.12] disabled:opacity-40">
            <RotateCcw size={11} /> {ttX2610("agmYenile")}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
        <Search size={12} className="text-white/30" />
        <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder={ttX2610("agmAra")}
          className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/25" />
        {arama && <button type="button" onClick={() => setArama("")} className="text-[9px] font-bold text-white/40 hover:text-white/70">✕</button>}
        {busy && <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-300"><Save size={10} /> {ttX2610("agmYaziliyor")}</span>}
      </div>

      {OZELLIK_GRUPLARI.map((grup) => {
        const liste = filtreli.filter((s) => s.grup === grup);
        if (!liste.length) return null;
        const g = say(grup);
        return (
          <div key={grup} className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/70">{grup}</h5>
              <span className="rounded-full bg-white/[.06] px-1.5 py-0.5 text-[8px] font-bold text-white/40">{liste.length}</span>
              <span className="ml-auto flex gap-1">
                <button type="button" disabled={busy !== null} onClick={() => void yaz(liste.map((s) => s.id), "free")}
                  className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-black text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40">{ttX2610("agmFree")}</button>
                <button type="button" disabled={busy !== null} onClick={() => void yaz(liste.map((s) => s.id), "hidden")}
                  className="rounded-md bg-red-500/15 px-1.5 py-0.5 text-[8px] font-black text-red-200 hover:bg-red-500/25 disabled:opacity-40">{ttX2610("agmGizli")}</button>
              </span>
            </div>
            <p className="text-[8px] text-white/30">{g.toplam} {ttX2610("agmOzellik")} · {g.gizli} {ttX2610("agmGizliSayi")} · {g.uyeli} {ttX2610("agmUyeliSayi")}</p>
            <div className="grid gap-1.5 lg:grid-cols-2">{liste.map(kart)}</div>
          </div>
        );
      })}
    </div>
  );
};
