// ════════════════════════════════════════════════════════
// ÖZEL GÜN TAKVİMİ — yol haritası madde 10
// "Cuma/Mevlid/Regaib/Miraç'ta tema önerisi + üreticilere otomatik
// bildirim" — tarayıcı Notification izni varsa sıradaki mühim gün için
// kullanıcı isterse hatırlatma alır. Hicri takvim cihazdan hesaplanır.
// ════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, BellRing, Sparkles } from "lucide-react";
import { Modal } from "./UIElements";

interface OzelGunTakvimiModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
}

// ─── Mühim günler (hicri ay.gün) — öneri temalarıyla ──────
interface MuhimGun {
  ad: string;
  ay: number;
  gun: number;
  emoji: string;
  /** Üreticilere tema önerisi — atmosfer kategorileriyle hizalı */
  tema: string;
  /** Önerilen atmosfer kategorileri (clips.ts CatId'leri) */
  kategoriler: string[];
}

const MUHIM_GUNLER: MuhimGun[] = [
  { ad: "Cuma Günü", ay: 0, gun: 0, emoji: "🕌", tema: "Cuma: namaz/cami atmosferi + salavat temalı ayet", kategoriler: ["cami", "namaz"] },
  { ad: "Mevlid Kandili", ay: 3, gun: 12, emoji: "💚", tema: "Mevlid: rahmet ve sevgi temalı, salavat ağırlıklı video", kategoriler: ["cami", "cicekler", "bulut"] },
  { ad: "Regaib Kandili", ay: 7, gun: 1, emoji: "🌟", tema: "Regaib: bereket ve dua temalı açılış videosu", kategoriler: ["yildizlar", "cami", "gece"] },
  { ad: "Miraç Kandili", ay: 7, gun: 27, emoji: "🪜", tema: "Miraç: yükseliş temalı — gökyüzü, yıldız, kubbe atmosferi", kategoriler: ["yildizlar", "gece", "cami"] },
  { ad: "Berat Kandili", ay: 8, gun: 15, emoji: "🌕", tema: "Berat: temizlenme ve tövbe temalı, gece atmosferi", kategoriler: ["gece", "ay-yıldız", "gol"] },
  { ad: "Ramazan Başlangıcı", ay: 9, gun: 1, emoji: "🌙", tema: "Ramazan girişi: imsak/iftar duyuru videosu, iftar daveti", kategoriler: ["gece", "cami", "desen"] },
  { ad: "Kadir Gecesi", ay: 9, gun: 27, emoji: "✨", tema: "Kadir Gecesi: 'bin aydan hayırlı' — yıldızlar ve nur atmosferi", kategoriler: ["yildizlar", "gece", "cami"] },
  { ad: "Arefe (Kurban)", ay: 12, gun: 9, emoji: "🤲", tema: "Arefe: dua ve kıyam temalı, semavi atmosfer", kategoriler: ["gol", "bulut", "cami"] },
];

const HICRI_AY_ADLARI = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];

interface HicriTarih { yil: number; ay: number; gun: number }

function hicriTarihAl(date = new Date()): HicriTarih | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" });
    const parts = fmt.formatToParts(date);
    const al = (t: string) => Number(parts.find((p) => p.type === t)?.value?.replace(/\D/g, "") ?? 0);
    return { yil: al("year"), ay: al("month"), gun: al("day") };
  } catch { return null; }
}

/** Cuma kontrolü: JS getDay() 5 = Cuma */
const cumaMi = (d: Date) => d.getDay() === 5;

export const OzelGunTakvimiModal: React.FC<OzelGunTakvimiModalProps> = ({ open, onClose, notify }) => {
  const [bildirimIstek, setBildirimIstek] = useState<"" | "ok" | "yok">("");
  // ★ CANLI TAKVİM (28.09): "bugün" sabit useMemo'da donuyordu — uygulama açık kaldıkça
  //   sayaçlar hep aynı kalıyordu. Artık modal açıkken her 60 sn'de bir tazelenir;
  //   gün değişince (gece yarısı) sayaçlar otomatik güncellenir.
  const [bugun, setBugun] = useState(() => new Date());
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      const simdi = new Date();
      setBugun((eski) => (eski.toDateString() !== simdi.toDateString() ? simdi : eski));
    }, 60_000);
    return () => clearInterval(t);
  }, [open]);
  const hicri = useMemo(() => (open ? hicriTarihAl(bugun) : null), [open, bugun]);

  // Bugünün özel günü — Cuma her hafta; diğerleri hicri eşleşmeyle
  const bugununOzelGunu = useMemo(() => {
    if (!hicri) return cumaMi(bugun) ? MUHIM_GUNLER[0] : null;
    if (cumaMi(bugun)) return MUHIM_GUNLER[0];
    return MUHIM_GUNLER.find((g) => g.ay === hicri.ay && g.gun === hicri.gun && g.ay > 0) ?? null;
  }, [hicri, bugun]);

  // ★ SIRADAKİ GÜNLER — GÜN GÜN TARANARAK hesaplanır (29.53 ortalama uydurması kaldırıldı);
  //   Umm al-Qura hicri takvimine birebir uyar, her gün gerçekten 1 azalır.
  //   Cuma her hafta: en yakın Cuma'ya gerçek gün farkı (bugün Cumaysa "bugün").
  const siradaki = useMemo(() => {
    if (!hicri) return [];
    // 400 gün tara — hicri yıl 354-355 gün olduğundan her özel gün mutlaka bir kez denk gelir
    const hicriGunNo = (d: Date) => {
      const h = hicriTarihAl(d);
      return h ? h.ay * 40 + h.gun : -1; // ay*40+gun: eşleşme için yeterli anahtar
    };
    const hedefler = new Map<number, MuhimGun>();
    for (const g of MUHIM_GUNLER) if (g.ay > 0) hedefler.set(g.ay * 40 + g.gun, g);
    const bulunan = new Map<string, { gun: MuhimGun; tarih: Date }>();
    for (let i = 0; i < 400; i++) {
      const d = new Date(bugun);
      d.setDate(d.getDate() + i);
      const h = hicriTarihAl(d);
      if (!h) continue;
      const hedef = hedefler.get(h.ay * 40 + h.gun);
      if (hedef && !bulunan.has(hedef.ad)) bulunan.set(hedef.ad, { gun: hedef, tarih: d });
    }
    // ★ TARİH GÖSTERİMİ (28.09, kullanıcı kararı): "süreleri bide tarihleri yazsın
    //   örneğin 1 nisan" — her sıradaki gün artık GREGORYEN tarihini de taşıyor
    //   (örn. "1 Nisan 2027, Çarşamba"). Cuma için tarih bugünden hesaplanır.
    const tarihStr = (d: Date) =>
      d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
    const liste = [...bulunan.values()].map(({ gun, tarih }) => ({
      ...gun,
      gunFark: Math.round((tarih.getTime() - new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate()).getTime()) / 86_400_000),
      gTarih: tarihStr(tarih),
    }));
    // Cuma: bugün Cuma ise 0, değilse gelecek Cumaya kalan gün
    const cumaFark = (5 - bugun.getDay() + 7) % 7;
    const cumaTarihi = new Date(bugun);
    cumaTarihi.setDate(cumaTarihi.getDate() + cumaFark);
    liste.push({ ...MUHIM_GUNLER[0], gunFark: cumaFark, gTarih: tarihStr(cumaTarihi) });
    return liste.sort((a, b) => a.gunFark - b.gunFark).slice(0, 5);
  }, [hicri, bugun]);

  if (!open) return null;

  const bildirimIste = async () => {
    if (typeof Notification === "undefined") { setBildirimIstek("yok"); return; }
    const izin = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (izin === "granted") {
      try {
        new Notification("🌟 Mühim Gün Hatırlatıcısı açık", { body: "Cuma ve kandil gecelerinden tema önerisi alacaksın.", icon: "/logo.png" });
      } catch { /* SW gerekli platformlarda sessiz */ }
      setBildirimIstek("ok");
      notify?.("✅ Mühim gün hatırlatıcısı açıldı — sıradaki özel günde tema önerisi gelecek");
    } else {
      setBildirimIstek("yok");
      notify?.("⚠️ Bildirim izni verilmedi — tarayıcı ayarlarından açabilirsin");
    }
  };

  return (
    <Modal title="Özel Gün Takvimi" sub="Cuma, kandiller ve mühim geceler — üreticiler için tema önerileriyle" onClose={onClose}>
      {/* ── 36: HAYIRLI GÜNLER SAYACI — üstte büyük sayaç ── */}
      {siradaki[0] && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/[.12] to-emerald-500/[.06] px-4 py-3">
          <div>
            <p className="text-[8.5px] font-black uppercase tracking-widest text-amber-300/70">Sıradaki hayırlı gün</p>
            <p className="text-[13px] font-black text-white">{siradaki[0].emoji} {siradaki[0].ad}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black leading-none" style={{ color: "var(--accent-2)" }}>
              {siradaki[0].gunFark === 0 ? "BUGÜN" : siradaki[0].gunFark}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-wider text-white/40">{siradaki[0].gunFark === 0 ? "hayırlı olsun" : "gün kaldı"}</p>
          </div>
        </div>
      )}

      {/* ── BUGÜN ─────────────────────────────────────── */}
      <div className={`mb-3 rounded-xl border p-3.5 ${bugununOzelGunu ? "border-amber-400/30 bg-amber-500/10" : "border-white/10 bg-white/[.03]"}`}>
        <p className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">
          <CalendarDays size={11} style={{ color: "var(--accent)" }} />
          Bugün {bugun.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}
          {hicri && <span className="text-white/30">· {HICRI_AY_ADLARI[hicri.ay - 1]} {hicri.gun}</span>}
        </p>
        {bugununOzelGunu ? (
          <>
            <h4 className="text-[14px] font-black text-amber-200">{bugununOzelGunu.emoji} Bugün {bugununOzelGunu.ad}!</h4>
            <p className="mt-1 text-[10px] leading-relaxed text-white/70">💡 Tema önerisi: {bugununOzelGunu.tema}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {bugununOzelGunu.kategoriler.map((k) => (
                <span key={k} className="rounded-full bg-white/8 px-2 py-0.5 text-[8.5px] font-bold text-white/60">🏷️ {k}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[10.5px] text-white/55">Bugün mühim bir gün değil — sıradaki özel güne hazırlan, videosunu önceden kuyruğa koy.</p>
        )}
      </div>

      {/* ── SIRADAKİ GÜNLER — kalıcı tarihler gösterilir (örn. "1 Nisan 2027, Çarşamba") ── */}
      <div className="mb-3 space-y-1.5">
        {siradaki.map((g) => (
          <div key={g.ad} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[.02] px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold text-white/85">{g.emoji} {g.ad}</p>
              {g.gTarih && <p className="text-[9px] font-bold" style={{ color: "var(--accent-2)" }}>📅 {g.gTarih}</p>}
              <p className="truncate text-[9px] text-white/45">{g.tema}</p>
            </div>
            <span className="ml-2 shrink-0 rounded-lg px-2 py-1 text-[9.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              {g.gunFark === 0 ? "BUGÜN" : g.gunFark === 1 ? "yarın" : `${g.gunFark} gün`}
            </span>
          </div>
        ))}
      </div>

      {/* ── BİLDİRİM ──────────────────────────────────── */}
      {bildirimIstek === "ok" ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
          <BellRing size={12} /> Hatırlatıcı açık — sıradaki mühim günde tema önerisi bildirimi gelecek
        </div>
      ) : (
        <button
          type="button"
          onClick={bildirimIste}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          <BellRing size={13} /> Mühim gün hatırlatıcısını aç
        </button>
      )}
      <p className="mt-2 text-center text-[8px] text-white/25">
        <Sparkles size={9} className="mr-1 inline" />Hicri tarihler cihazından hesaplanır · Ramazan sayfasıyla birlikte çalışır
      </p>
    </Modal>
  );
};
