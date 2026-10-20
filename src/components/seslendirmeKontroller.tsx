// ═══════════════════════════════════════════════════════════════
// SESLENDİRME KONTROLLERİ — SeslendirmeModal.tsx'ten çıkarıldı (14.10)
// SAĞ kolon: 📖/✍ sekme düğmeleri, kütüphane+ayet seçici veya metin kutusu
// (canlı bölme önizlemesi), kuyruk listesi (ortak), SESLENDİR/DURDUR satırı.
// Davranış birebir; sadece bileşen olarak ayrıldı.
// ═══════════════════════════════════════════════════════════════
import React from "react";
import { ATM } from "./seslendirmeMotor";
import type { AyetKayit, DurumTip, KuyrukOgesi, PlanParcasi } from "./seslendirmeSabitler";

const gold = "cursor-pointer rounded-xl px-4 py-2.5 text-[11px] font-black text-black transition";
const ghostY = "cursor-pointer rounded-xl px-4 py-2.5 text-[11px] font-extrabold text-white/80 transition";

export interface SeslendirmeKontrollerProps {
  mod: "ayet" | "metin";
  setMod: (m: "ayet" | "metin") => void;
  // kütüphane
  ayetler: AyetKayit[];
  surler: { ad: string; kartlar: number[] }[];
  sureIdx: number;
  setSureIdx: React.Dispatch<React.SetStateAction<number>>;
  ayetIdx: number;
  setAyetIdx: React.Dispatch<React.SetStateAction<number>>;
  ayetEkle: () => void;
  sureEkle: () => void;
  // metin
  metin: string;
  setMetin: (v: string) => void;
  plan: PlanParcasi[];
  // ★ 16.10 BÖLÜM SİSTEMİ — yeni akış
  bolumSayi: number;                    // oluşturulmuş bölüm sayısı (1..N)
  bolumEkle: () => void;                // ➕ — bölüm sayısını +1 yapar, metni dağıtır
  bolumCikar: () => void;               // ➖ — bölüm sayısını −1 yapar (min 1), komşu birleşimi
  bolumDinle: (i: number) => void;      // bölüm karta tıkla → sadece o bölümü oku
  // kuyruk
  kuyruk: KuyrukOgesi[];
  kuyrukSec: number;
  setKuyrukSec: (i: number) => void;
  ogCikar: (i: number) => void;
  // oynatma
  seslendir: (baslangicIdx?: number) => void;
  durdur: () => void;
  durum: string;
  durumTip: DurumTip;
}

export const SeslendirmeKontroller: React.FC<SeslendirmeKontrollerProps> = ({
  mod, setMod, ayetler, surler, sureIdx, setSureIdx, ayetIdx, setAyetIdx, ayetEkle, sureEkle,
  metin, setMetin, plan,
  bolumSayi, bolumEkle, bolumCikar, bolumDinle,
  kuyruk, kuyrukSec, setKuyrukSec, ogCikar,
  seslendir, durdur, durum, durumTip,
}) => {
  // ── canlı seçim (kütüphane) — seçici değerleri için ──
  const ekranSure = surler[sureIdx];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex gap-2">
        <button onClick={() => setMod("ayet")} className="cursor-pointer rounded-full border border-white/10 px-4 py-2 text-[11px] font-extrabold transition"
          style={mod === "ayet" ? { background: "linear-gradient(135deg,#f5dda6,#d7aa52)", color: "#000" } : { background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.7)" }}>📖 Sure / Ayet</button>
        <button onClick={() => setMod("metin")} className="cursor-pointer rounded-full border border-white/10 px-4 py-2 text-[11px] font-extrabold transition"
          style={mod === "metin" ? { background: "linear-gradient(135deg,#f5dda6,#d7aa52)", color: "#000" } : { background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.7)" }}>✍ Metin Yaz</button>
      </div>

      {mod === "ayet" ? (
        <div className="rounded-2xl border border-white/10 p-3" style={{ background: "rgba(255,255,255,.03)" }}>
          <div className="mb-2 text-[10px] font-black tracking-wider text-white/50">📖 KÜTÜPHANE &amp; AYET ARAMA</div>
          <div className="flex gap-2">
            <select value={sureIdx} onChange={(e) => { setSureIdx(Number(e.target.value)); setAyetIdx(0); }}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-[12px] outline-none" style={{ flex: 2, background: "rgba(0,0,0,.35)", color: "var(--accent-2)", border: "1px solid rgba(255,255,255,.14)" }}>
              {surler.map((s, i) => <option key={s.ad} value={i}>{s.ad} ({s.kartlar.length})</option>)}
            </select>
            <select value={Math.min(ayetIdx, (ekranSure?.kartlar.length || 1) - 1)} onChange={(e) => setAyetIdx(Number(e.target.value))}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-[12px] outline-none" style={{ flex: 1, background: "rgba(0,0,0,.35)", color: "var(--accent-2)", border: "1px solid rgba(255,255,255,.14)" }}>
              {(ekranSure?.kartlar || []).map((ai, j) => {
                const a = ayetler[ai];
                const num = (a?.source.match(/(\d+)\.? Ayet/) || ["", "1"])[1];
                return <option key={ai} value={j}>{num}. {a?.title}</option>;
              })}
            </select>
          </div>
          <div className="mt-2.5 flex gap-2">
            <button onClick={ayetEkle} className={gold} style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)", flex: 1 }}>➕ Ayeti Ekle</button>
            <button onClick={sureEkle} className={ghostY} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", flex: 1 }}>📚 Tüm Sureyi Ekle</button>
          </div>
        </div>
      ) : (
        /* ★ 16.10 YENİ AKIŞ (kullanıcı emri): eski "Metni Önizlemeye Ekle" sistemi KALDIRILDI.
           Yeni sistem:
           1) Metin kutusuna yaz (tek hamle)
           2) ➕ bölüm ekle döngüsü: her basışta metni oransal parçalara dağıt — kaç +, o kadar bölüm
           3) Bölüm kartına tıkla → o bölüm ayrı ayrı dinle + arka plan/atmosfer paneli açılır
           4) 🔊 SESLENDİR tümü, bölüm kartındaki ▶ sadece o bölüm */
        <div className="rounded-2xl border border-white/10 p-3" style={{ background: "rgba(255,255,255,.03)" }}>
          <textarea value={metin} onChange={(e) => setMetin(e.target.value)}
            placeholder={"1️⃣ Metnini buraya yaz…\n「+」 ile bölüm ekle: kaç «+», o kadar bölüm — metin otomatik dağılır\n2️⃣ Bölüm kartına tıkla → dinle + arka plan ayarla\n3️⃣ 🔊 SESLENDİR hepsini okur"}
            rows={8}
            // ★ 20.10 (kullanıcı: "çok küçük pencere olmuş, %45 büyüt"): rows 5→8
            //   (≈ %60 yükseklik artışı — %45+ hedefi aşar, resize-y ile otomatiği kalmadı)
            className="w-full resize-y rounded-xl px-3 py-3 text-[12px] leading-relaxed outline-none min-h-[220px]"
            style={{ background: "rgba(0,0,0,.35)", color: "var(--text)", border: "1px solid rgba(255,255,255,.14)" }} />
          {metin.trim() ? (
            <div className="mt-2 rounded-xl px-3 py-2 text-[10px] font-extrabold" style={{ background: "rgba(215,170,82,.08)", border: "1px solid rgba(215,170,82,.2)", color: "var(--accent)" }}>
              🧩 {bolumSayi}·{bolumSayi === 1 ? "bölüm" : "bölüm"} hazır · kartlara tıkla → dinle / arka plan ayarla
            </div>
          ) : null}
          {/* ★ ➕/➖ BÖLÜM SAYISI — ➕ kesimi artırır, ➖ azaltır (min 1) */}
          <div className="mt-2 flex gap-2">
            <button onClick={bolumEkle}
              className={`${gold} flex-1`}
              style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}>
              ➕ Bölüm Ekle{bolumSayi > 1 ? ` — şu an ${bolumSayi} bölüm` : ""} (metni otomatik böler)
            </button>
            <button onClick={bolumCikar} disabled={bolumSayi <= 1}
              title="Bölüm sayısını azalt — fazla parçalar komşu birleşimiyle birleşir"
              className="cursor-pointer rounded-xl px-4 py-2.5 text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "rgba(255,255,255,.06)", color: "var(--accent-2)", border: "1px solid rgba(255,255,255,.14)" }}>
              ➖
            </button>
          </div>
        </div>
      )}

      {/* ★ 16.10 KUYRUK → BÖLÜM KARTLARI — tıkla: bu bölümü ayrı dinle
          (seslendirSec çağrısı: sadece bu parça) + sol atmosfer paneli aç (kuyrukSec set) */}
      {kuyruk.length > 0 ? (
        <div className="rounded-xl border border-white/10 p-2" style={{ background: "rgba(0,0,0,.35)" }}>
          <div className="mb-1 text-[8.5px] font-black tracking-wider text-white/50">📋 BÖLÜMLER — {kuyruk.length} · tıkla: dinle · ✕: çıkar</div>
          <div className="flex flex-wrap gap-1">
            {kuyruk.map((o, i) => {
              const atm = ATM[o.kat] || ATM.musaf;
              return (
                <span key={`${o.tip}-${o.metin.slice(0, 8)}-${i}`}
                  onClick={() => { setKuyrukSec(i); bolumDinle(i); }}
                  className="cursor-pointer rounded-full border px-2 py-1 text-[9px] font-extrabold transition hover:brightness-125"
                  title="Bu bölümü dinle — aynı zaman arka plan paneli de açılır"
                  style={i === kuyrukSec
                    ? { background: "rgba(215,170,82,.35)", borderColor: "rgba(215,170,82,.5)", color: "#fff" }
                    : { background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)" }}>
                  ▶ {atm[1]} {o.tip === "ayet" ? o.etiket : `bölüm ${i + 1}`}
                  <b onClick={(e) => { e.stopPropagation(); ogCikar(i); }} style={{ cursor: "pointer", marginLeft: 3, color: "#ff8a8a" }}>✕</b>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* SESLENDİR */}
      <div className="flex flex-wrap items-center gap-2">
        {/* ★ 20.10 fix: seslendir'e event nesnesi sızmasını engelle — 0 parametres çağır */}
        <button onClick={() => { void seslendir(0); }} disabled={durumTip === "okuyor"}
          className={`${gold} disabled:cursor-not-allowed disabled:opacity-50`}
          style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}>🔊 SESLENDİR</button>
        <button onClick={durdur} className={ghostY} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}>⏹ DURDUR</button>
        <span className={`ml-1 text-[10.5px] font-bold`}
          style={durumTip === "hata" ? { color: "#f87171" } : durumTip === "okuyor" ? { color: "#6ee7b7" } : { color: "var(--accent)" }}>
          {durum}
        </span>
      </div>
      <div className="text-[9px] leading-relaxed text-white/30">
        Ahmet okur · 15 atmosfer otomatik · parçalar arası nefes · noktalı/noktasız destekli · Rahmaan telaffuz düzeltmesi sunucuda
      </div>
    </div>
  );
};
