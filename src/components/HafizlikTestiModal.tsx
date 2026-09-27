// ════════════════════════════════════════════════════════
// HAFIZLIK TESTİ — yol haritası madde 44
// "Devamını getir" modu: ayetin ilk kısmı gösterilir, kullanıcı
// 4 seçenekten devamını bulur. Rastgele ayet + bulanıklaştırma yok —
// sade, hızlı, çalışır. Sure seçilirse o sureden, seçilmezse meşhur
// surelerden sorulur. Veri: api.alquran.cloud.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState } from "react";
import { Brain, Check, X, BarChart3 } from "lucide-react";
import { Modal } from "./UIElements";
import {
  hafizlikIstKaydet, hafizlikIstOku, hafizlikDevamOku, hafizlikDevamKaydet,
  rozetleriTazele, type HafizlikIstatistik,
} from "../hafizlikIstatistik";

interface HafizlikTestiModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
}

interface Soru {
  s: number;
  sn: string;
  a: number;
  bas: string;      // ayetin ilk ~60 karakteri
  devam: string;    // doğru devam
  secenekler: string[]; // 4 seçenek (doğru dahil)
}

// Meşhur sureler — test havuzu (yeterli ayet sayısı + tanınırlık)
// ★ ÇOĞALTILDI (25.09 genişleme): 59 → 114 sure. Sorular canlı API'den
//   (alquran.cloud, Diyanet meal) geldiği için içerik uydurma YOK — havuz
//   ne kadar genişse test o kadar zengin. Kısa sureler Kolay'da; Zor'da
//   uzun ayetli sureler (Bakara, Âl-i İmrân, Nisâ…).
const TEST_SURELERI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 31, 33, 36, 39, 40, 41, 43, 45, 46, 49, 55, 62, 67, 87, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
// ★ KOLAY — kısa meşhur sureler + son cüz (Cüz 30'un tamamı: 78-114) + Fâtiha: 38 sure
const KOLAY_SURELER = [1, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
// ★ ORTA — orta uzunluk, hafızlarda popüler sureler: 24 sure
const ORTA_SURELER = [12, 13, 14, 17, 18, 19, 20, 21, 22, 24, 25, 27, 28, 29, 31, 34, 35, 36, 47, 49, 55, 57, 62, 67, 71, 76];
// ★ ZOR — uzun ayetli sureler (devam kısmı garantili): 52 sure
const ZOR_SURELER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 23, 26, 30, 32, 33, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 48, 50, 51, 52, 53, 54, 56, 58, 59, 60, 61, 63, 64, 65, 66, 68, 69, 70, 72, 73, 74, 75, 77, 88, 104];
const SEVIYELER = [
  { id: "kolay", ad: "Kolay", emoji: "🌱", sureler: KOLAY_SURELER, aciklama: "Kısa meşhur sureler — Yâsîn, İhlâs, Felak tarzı" },
  { id: "orta", ad: "Orta", emoji: "🌿", sureler: ORTA_SURELER, aciklama: "Orta sureler — Kehf, Yâsîn, MÜlk, Rahmân" },
  { id: "zor", ad: "Zor", emoji: "🏔️", sureler: ZOR_SURELER, aciklama: "Uzun ayetli sureler — Bakara, Âl-i İmrân, Nisâ" },
] as const;
type SeviyeId = typeof SEVIYELER[number]["id"];
// ★ TUR BOYUTU SEÇİLEBİLİR (28.09, kullanıcı kararı): "5 soru ne demek, daha çok olsun,
//   yüzlerce gerekirse insanlar vakit harcasın" → 5/15/30/Sınırsız mod. Havuz canlı
//   API'den geldiği için sınırsız modda sorular bitmez.
const TUR_BOYUTLARI = [
  { id: 5, label: "5 soru", emoji: "⚡" },
  { id: 15, label: "15 soru", emoji: "🔥" },
  { id: 30, label: "30 soru", emoji: "🏆" },
  { id: 0, label: "Sınırsız", emoji: "♾️" },
] as const;
const TUR_BOYUTU = 5; // varsayılan — kullanıcı seçer

function karistir<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const HafizlikTestiModal: React.FC<HafizlikTestiModalProps> = ({ open, onClose, notify }) => {
  const [soru, setSoru] = useState<Soru | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secim, setSecim] = useState<number | null>(null); // seçilen index
  const [puan, setPuan] = useState({ dogru: 0, toplam: 0 });
  // ★ Zorluk seviyesi + tur takibi (5 soruluk turlar)
  const [seviye, setSeviye] = useState<SeviyeId>("kolay");
  const [seviyeSecili, setSeviyeSecili] = useState(false);
  // ★ Tur boyutu seçimi (28.09): 0 = sınırsız
  const [turBoyu, setTurBoyu] = useState<number>(5);
  // ★ İstatistik görünümü (madde 52)
  const [istGoster, setIstGoster] = useState(false);
  const [ist, setIst] = useState<HafizlikIstatistik>(() => hafizlikIstOku());
  // ★ Kaldığın yerden devam (madde 38)
  const [devam, setDevam] = useState(() => hafizlikDevamOku());

  const soruHazirla = useCallback(async () => {
    setYukleniyor(true);
    setSecim(null);
    setSoru(null);
    try {
      // Seçili zorluk seviyesinin havuzundan rastgele sure çek
      // ★ Retry: kısa surelerde uzun ayet bulunamayabilir → 8 farklı sure dene (havuz genişledi)
      const havuz = [...(SEVIYELER.find(s => s.id === seviye)?.sureler ?? TEST_SURELERI)];
      let soruPaket: { sn: number; d: any } | null = null;
      for (let deneme = 0; deneme < 8 && !soruPaket; deneme++) {
        const sn = havuz.splice(Math.floor(Math.random() * havuz.length), 1)[0] ?? TEST_SURELERI[0];
        const r = await fetch(`https://api.alquran.cloud/v1/surah/${sn}/editions/quran-uthmani,tr.diyanet`);
        const d = await r.json();
        if (d.code !== 200) continue;
        const ayahsTmp: Array<{ text: string }> = d.data[0].ayahs;
        const enUzun = Math.max(...ayahsTmp.map(a => a.text.length));
        if (enUzun < 55) continue; // bu sure çok kısa → başka sure dene
        soruPaket = { sn, d };
      }
      if (!soruPaket) throw new Error("havuz-bos");
      const sn = soruPaket.sn;
      const d = soruPaket.d;
      const ayahs: Array<{ text: string }> = d.data[0].ayahs;
      const meal: Array<{ text: string }> = d.data[1].ayahs;
      const snAdi: string = d.data[0].name;
      // Ayet sayısı 4'ten azsa kısa sure — uygun ayet bul (devam kısmı olsun diye uzun olanı seç)
      const uzunlukSirası = ayahs.map((a, i) => ({ i, len: a.text.length })).sort((x, y) => y.len - x.len);
      const hedef = uzunlukSirası[uzunlukSirası.length > 1 ? Math.floor(Math.random() * Math.min(3, uzunlukSirası.length)) : 0];
      const tam = ayahs[hedef.i].text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "").trim();
      if (tam.length < 50) throw new Error("kisa");
      const kesme = tam.indexOf(" ", 30);
      const bas = tam.slice(0, kesme > 0 ? kesme : 40);
      const devam = tam.slice(bas.length).trim();
      // Yanlış seçenekler: aynı sureden VEYA komşu surelerden diğer devam parçaları
      const yanlisHavuz: string[] = [];
      for (const a of ayahs) {
        const t = a.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "").trim();
        if (t !== tam && t.length > 25) {
          const k = t.slice(Math.floor(t.length / 3));
          if (k !== devam) yanlisHavuz.push(k.slice(0, devam.length));
        }
      }
      while (yanlisHavuz.length < 3) {
        yanlisHavuz.push(devam.split(" ").reverse().join(" ").slice(0, devam.length)); // kelimeleri ters çevir
      }
      const secenekler = karistir([devam, ...yanlisHavuz.slice(0, 3)]);
      setSoru({ s: sn, sn: snAdi, a: hedef.i + 1, bas, devam, secenekler });
    } catch {
      notify?.("⚠️ Soru hazırlanamadı — tekrar dener misin?");
    } finally {
      setYukleniyor(false);
    }
  }, [notify, seviye]);

  useEffect(() => {
    if (open && seviyeSecili && !soru && !yukleniyor) soruHazirla();
    if (!open) {
      setSoru(null); setPuan({ dogru: 0, toplam: 0 }); setSeviyeSecili(false);
      // ★ Açılışta taze oku — kapanınca sıfırla ki sonraki açılışta devam/istatistik güncel olsun (madde 38 & 52)
      setDevam(hafizlikDevamOku()); setIst(hafizlikIstOku());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seviyeSecili]);

  if (!open) return null;

  const cevapla = (i: number) => {
    if (secim !== null || !soru) return;
    setSecim(i);
    const dogruMu = soru.secenekler[i] === soru.devam;
    setPuan((p) => ({ dogru: p.dogru + (dogruMu ? 1 : 0), toplam: p.toplam + 1 }));
    // ★ İstatistik + rozet kaydı (madde 52 & 16) — yalnız cihazda
    hafizlikIstKaydet(soru.s, dogruMu);
    setIst(hafizlikIstOku());
    rozetleriTazele();
  };

  return (
    <Modal title="Hafızlık Testi" sub="Devamını getir — ayeti tamamla, hafızanı test et 🧠" onClose={onClose}>
      {/* ★ ZORLUK SEÇİMİ — seviye seçilmeden soru başlamaz */}
      {!seviyeSecili ? (
        <div className="space-y-2">
          {/* ★ KALDIĞIN YERDEN DEVAM (madde 38) */}
          {devam && !istGoster && (
            <button type="button"
              onClick={() => { setSeviye((devam.seviye as SeviyeId) ?? "kolay"); setSeviyeSecili(true); setPuan({ dogru: 0, toplam: 0 }); }}
              className="flex w-full items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[.08] p-3 text-left transition hover:border-amber-400/50">
              <span className="text-xl">⚡</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-amber-200">Kaldığın yerden devam</p>
                <p className="text-[8.5px] text-white/50">
                  Son turun: {SEVIYELER.find((s) => s.id === devam.seviye)?.ad ?? devam.seviye} · {devam.dogru}/{devam.toplam}
                  {devam.tarih ? ` · ${new Date(devam.tarih).toLocaleDateString("tr-TR")}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-amber-500/20 px-2 py-1 text-[8.5px] font-black text-amber-200">Başla →</span>
            </button>
          )}

          {/* ★ İSTATİSTİK GÖRÜNÜMÜ (madde 52) */}
          <button type="button" onClick={() => setIstGoster((v) => !v)} className="flex w-full items-center justify-center gap-1.5 rounded-lg glass-soft py-1.5 text-[9.5px] font-bold text-white/60 transition hover:text-white">
            <BarChart3 size={11} /> {istGoster ? "İstatistiği Gizle" : "Hafızlık İstatistiklerim"}
          </button>
          {istGoster && (
            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              {ist.toplamSoru === 0 ? (
                <p className="text-center text-[9.5px] text-white/40">Henüz soru çözmedin — ilk turunla istatistik başlar 📊</p>
              ) : (
                <>
                  <div className="mb-2 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-[13px] font-black text-emerald-300">{ist.toplamDogru}</p>
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Doğru</p>
                    </div>
                    <div className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-[13px] font-black text-white/80">{ist.toplamSoru}</p>
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Soru</p>
                    </div>
                    <div className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-[13px] font-black text-amber-300">{Math.round((ist.toplamDogru / ist.toplamSoru) * 100)}%</p>
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Başarı</p>
                    </div>
                  </div>
                  {Object.entries(ist.sureler).length > 0 && (
                    <>
                      <p className="mb-1 text-[8.5px] font-black uppercase tracking-widest text-white/40">Sure dağılımı (en çok çalıştıkların)</p>
                      <div className="space-y-1">
                        {Object.entries(ist.sureler)
                          .sort((a, b) => b[1].tekrar - a[1].tekrar).slice(0, 5)
                          .map(([sureNo, k]) => (
                            <div key={sureNo} className="flex items-center gap-2 text-[9px]">
                              <span className="w-16 shrink-0 truncate text-white/70">Sure {sureNo}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full" style={{ width: `${Math.round((k.dogru / k.tekrar) * 100)}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }} />
                              </div>
                              <span className="shrink-0 text-white/45">{k.dogru}/{k.tekrar}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  {ist.zorlanilan.length > 0 && (
                    <p className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-[9px] leading-relaxed text-amber-200/90">
                      💡 Zorlandığın sureler: {ist.zorlanilan.slice(0, 5).join(", ")} — bu sureleri tekrar okumanı öneririz
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <p className="mb-2 text-center text-[10px] text-white/50">Zorluk seviyesi seç:</p>
          {SEVIYELER.map((s) => (
            <button key={s.id} type="button"
              onClick={() => { setSeviye(s.id); setSeviyeSecili(true); setPuan({ dogru: 0, toplam: 0 }); hafizlikDevamKaydet(s.id, 0, 0); }}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3.5 text-left transition hover:border-white/25 hover:bg-white/[.05]">
              <span className="text-2xl">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-black text-white/90">{s.ad}</p>
                <p className="text-[9px] text-white/50">{s.aciklama}</p>
              </div>
              <span className="shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                {turBoyu === 0 ? "♾️" : `${turBoyu} soru`}
              </span>
            </button>
          ))}
          {/* ★ TUR BOYUTU SEÇİCİ (28.09) — 5/15/30/Sınırsız */}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[.03] p-3">
            <p className="mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/40">Tur boyutu — kaç soru?</p>
            <div className="grid grid-cols-4 gap-1.5">
              {TUR_BOYUTLARI.map((t) => (
                <button key={t.id} type="button" onClick={() => setTurBoyu(t.id)}
                  className={`rounded-lg py-1.5 text-[9px] font-black transition ${turBoyu === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                  style={turBoyu === t.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
            {turBoyu === 0 && <p className="mt-1.5 text-center text-[8.5px] text-white/35">♾️ Sınırsız modda sorular bitmez — durmak istediğinde X ile çık, istatistiğin kayıtlı kalır</p>}
          </div>
        </div>
      ) : (
      <>
      {/* Seviye göstergesi + puan bandı */}
      <div className="mb-3 flex items-center justify-center gap-3 rounded-xl bg-white/[.04] py-2 text-[10px] font-bold text-white/60">
        <Brain size={13} style={{ color: "var(--accent)" }} />
        <span>{SEVIYELER.find(s => s.id === seviye)?.emoji} {SEVIYELER.find(s => s.id === seviye)?.ad}</span>
        <span>·</span>
        <span>Doğru: <b className="text-emerald-300">{puan.dogru}</b></span>
        <span>·</span>
        <span>Tur: <b className="text-white/80">{turBoyu === 0 ? `${puan.toplam + (soru ? 1 : 0)}` : `${Math.min(puan.toplam + (soru ? 1 : 0), turBoyu)}/${turBoyu}`}</b></span>
      </div>

      {yukleniyor && (
        <div className="flex h-32 items-center justify-center gap-2 text-[11px] font-bold text-white/40">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          Soru hazırlanıyor…
        </div>
      )}

      {soru && !yukleniyor && (
        <>
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-4">
            <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-white/40">{soru.sn} · {soru.a}. Ayet</p>
            <p className="text-right font-arabic text-[17px] leading-relaxed" dir="rtl" style={{ color: "var(--accent-2)" }}>{soru.bas} …</p>
            <p className="mt-1.5 text-center text-[9px] text-white/35">Bu ayetin DEVAMI hangisi?</p>
          </div>

          <div className="space-y-1.5">
            {soru.secenekler.map((sec, i) => {
              const dogruSecenek = sec === soru.devam;
              const secildi = secim === i;
              const goster = secim !== null;
              return (
                <button key={i} type="button" onClick={() => cevapla(i)} disabled={goster}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-right font-arabic text-[13px] leading-relaxed transition ${
                    goster && dogruSecenek ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                    : goster && secildi && !dogruSecenek ? "border-red-400/50 bg-red-500/15 text-red-200"
                    : goster ? "border-white/5 bg-white/[.02] text-white/35"
                    : "border-white/10 bg-white/[.03] text-white/85 hover:border-white/25 hover:bg-white/[.05]"
                  }`}
                  dir="rtl">
                  {goster && dogruSecenek && <Check size={13} className="shrink-0 text-emerald-400" />}
                  {goster && secildi && !dogruSecenek && <X size={13} className="shrink-0 text-red-400" />}
                  <span className="flex-1">{sec}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              soruHazirla();
              // ★ Tur bitince devam et — sınırsız modda tur özeti gösterilmez
              if (turBoyu > 0 && puan.toplam + 1 >= turBoyu) hafizlikDevamKaydet(seviye, puan.dogru + (secim !== null && soru.secenekler[secim] === soru.devam ? 1 : 0), puan.toplam + 1);
            }}
            className="mt-4 w-full rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            {turBoyu > 0 && puan.toplam + 1 >= turBoyu ? "Turu Bitir → Özet" : "Sıradaki Soru →"}
          </button>
          {/* Tur özeti — seçilen boyut dolunca (sınırsızda çıkmaz) */}
          {turBoyu > 0 && puan.toplam >= turBoyu && (
            <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-center">
              <p className="text-[12px] font-black text-emerald-200">
                {puan.dogru === turBoyu ? `🏆 Mükemmel! ${puan.dogru}/${turBoyu} — sen gerçek bir hafızsın!` : puan.dogru >= turBoyu * 0.6 ? `🎉 Güzel! ${puan.dogru}/${turBoyu} — devam et!` : `📖 ${puan.dogru}/${turBoyu} — tekrar denemek güçlendirir`}
              </p>
              <button type="button" onClick={() => { setSeviyeSecili(false); setSoru(null); setPuan({ dogru: 0, toplam: 0 }); }}
                className="mt-2 rounded-lg glass-soft px-3 py-1.5 text-[9.5px] font-bold text-white/70 transition hover:text-white">
                ← Seviye değiştir / yeni tur
              </button>
            </div>
          )}
        </>
        )}
      </>
      )}
    </Modal>
  );
};
