// ════════════════════════════════════════════════════════
// RAMAZAN / KANDİL SAYFASI — yol haritası madde 6
// "Ramazan'da trafik 10 katına çıkar, hazır beklemeli" şartı:
//   • Hicri takvimle RAMAZAN otomatik tespit edilir (ay=9) → sayfa
//     Ramazan moduna geçer: iftar/imsak canlı sayacı + kaçınıcı gün.
//   • Ramazan dışında: kandil geceleri takvimi + günlük amel önerisi.
//   • Tüm tarihler Intl Islamic Calendar ile cihazdan hesaplanır —
//     sabit miladi tarih gömülmez, her yıl doğru çalışır.
// ════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from "react";
import { Moon, Sunrise, Sunset, Star, Heart } from "lucide-react";
import { Modal } from "./UIElements";

interface RamazanModalProps {
  open: boolean;
  onClose: () => void;
  /** Bugünün namaz vakitleri ("HH:MM") — İftar=Maghrib, İmsak=Fajr */
  prayerTimings?: Record<string, string> | null;
  notify?: (msg: string) => void;
}

// ─── HİCRİ TARİH YARDIMCILARI ──────────────────────────────
interface HicriTarih { yil: number; ay: number; gun: number; ayAdi: string }

function hicriTarihAl(date = new Date()): HicriTarih | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" });
    const parts = fmt.formatToParts(date);
    const al = (t: string) => Number(parts.find((p) => p.type === t)?.value?.replace(/\D/g, "") ?? 0);
    const ayFmt = new Intl.DateTimeFormat("tr-u-ca-islamic-umalqura", { month: "long" });
    return { yil: al("year"), ay: al("month"), gun: al("day"), ayAdi: ayFmt.format(date) };
  } catch { return null; }
}

const HICRI_AY_ADLARI = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];

// Kandil geceleri — hicri sabit (ay, gün)
const KANDILLER: Array<{ ad: string; ay: number; gun: number; emoji: string }> = [
  { ad: "Recep Ayının İlk Cuma Gecesi (Regaib)", ay: 7, gun: 1, emoji: "🌟" },
  { ad: "Miraç Kandili", ay: 7, gun: 27, emoji: "🪜" },
  { ad: "Berat Kandili", ay: 8, gun: 15, emoji: "🌕" },
  { ad: "Ramazan Bayramı Öncesi (Arefe)", ay: 9, gun: 29, emoji: "🌙" },
  { ad: "Kadir Gecesi", ay: 9, gun: 27, emoji: "✨" },
  { ad: "Kurban Bayramı Arefesi", ay: 12, gun: 9, emoji: "🤲" },
  { ad: "Mevlid Kandili", ay: 3, gun: 12, emoji: "💚" },
];

// ─── 30 GÜNLÜK AMEL ÖNERİLERİ (deterministik: gün → öneri) ──
const AMELLER: Array<{ amel: string; detay: string }> = [
  { amel: "100 İstiğfar", detay: "Gün içinde 100 kez 'Estağfirullah' de — kalbini arıt." },
  { amel: "100 Salavat", detay: "Peygamberimize (s.a.v.) 100 kez salavat getir." },
  { amel: "Ayete'l-Kürsî ×10", detay: "Sabah ve akşam 10 kez oku — koruma niyetiyle." },
  { amel: "2 Rekat Tahiyyetü'l-Mescid", detay: "Namaza girince önce 2 rekat mescid selamı kıl." },
  { amel: "1 Cüz Kur'an", detay: "Bugün 1 cüz oku — 30 günde hatim tamamlanır." },
  { amel: "Sadaka-i Cariye", detay: "Küçük bir sadaka ver — bir bardak su bile yeter." },
  { amel: "5 Vakit Namazda Kunut Dikkati", detay: "Her namazda kalbin ne dediğine kulak ver." },
  { amel: "Anne Babayı Ara", detay: "Sıla-i rahim: bugün annene/babana ara, dualarını al." },
  { amel: "33 Sübhanallah ×3", detay: "Tahmid-tesbih-takbir: 33+33+34 — namaz sonrası." },
  { amel: "Bir Oruçlu Doyur", detay: "İftarda bir oruçluya yemek ver — sevabı katlanır." },
  { amel: "Elhamdülillah Şükür Defteri", detay: "Bugün 5 şey yaz: şükredeceğin 5 nimet." },
  { amel: "Keffaret Kısa Tilavet", detay: "Fâtiha + İhlâs + Felak + Nâs — sabah 3'er kez." },
  { amel: "Günah İtirafı (kalbende)", detay: "Rabbinle arasında tövbe et — kapı açıktır." },
  { amel: "Komşuya İftar İkramı", detay: "Komşuna bir tabak ikram et — Peygamber sünneti." },
  { amel: "100 Kez 'Lâ Havle'", detay: "Lâ havle velâ kuvvete illâ billâh — sıkıntıya karşı." },
  { amel: "Vesvese Ayetleri", detay: "Bakara 285-286'yı oku — rızık ve koruma duası." },
  { amel: "Bir Hatim İçin Dua", detay: "Hasta bir kardeşin şifası için niyetlen, dua et." },
  { amel: "Teheccüd Niyeti", detay: "Gece 2 rekat niyetiyle uyan — Allah çağırır." },
  { amel: "Hayır Sözü", detay: "Bugün 1 kişiye güzel söz söyle — sadakadır." },
  { amel: "Duha (Kuşluk) Namazı", detay: "Kuşluk vaktinde 2-4 rekat — şükür namazı." },
  { amel: "Sure Yâsîn", detay: "Bir okuma: Yâsîn Suresi — kalbe rahmet." },
  { amel: "Müslüman Kardeşine Dua", detay: "Gıyabında bir kardeşin için dua et — melek 'Amin' der." },
  { amel: "100 'Lâ İlâhe İllallah'", detay: "Kelime-i tevhid zikri — kalbi mühürler." },
  { amel: "Tesbih Namazı", detay: "4 rekat tesbih namazı kıl — günahlar affedilir." },
  { amel: "Vaadi Edilen Dua", detay: "Eyvah dediğin konu için bugün özel dua et." },
  { amel: "Hisset: Rahmet Kapısı", detay: "Seccadende 5 dakika kal — sadece konuş Rabbinle." },
  { amel: "Kadir Gecesi Duası", detay: "Allâhümme inneke afüvvün... — af diliyor, af ol." },
  { amel: "Tam Hatim Duası", detay: "Bugün Kur'an'ı tamamla — hatim duasını unutma." },
  { amel: "Bayram Şükür Listesi", detay: "Ramazan'ın kazanımlarını yaz — kalıcı olsun." },
  { amel: "Sevap Hediyesi", detay: "Vefat etmiş yakınlarına 1 hatim hediye et." },
];

const bugunStr = () => new Date().toISOString().slice(0, 10);

// ★ HAYIRLI GÜNLER SAYACI (madde 36): Cuma'ya kalan süre, Ramazan'a X gün
function hayirliGunBilgisi(simdi: Date, hicri: HicriTarih | null) {
  const cumaKalan = (5 - simdi.getDay() + 7) % 7; // 0 = bugün Cuma
  const cumaMetni = cumaKalan === 0 ? "Bugün Cuma! 🕌" : `Cuma'ya ${cumaKalan} gün`;
  // Ramazan'a kalan (yaklaşık, aylık ortalama): ay 9'a kaç ay var
  let ramazanGun = -1;
  if (hicri) {
    const ayFark = (9 - hicri.ay + 12) % 12;
    ramazanGun = hicri.ay === 9 ? 0 : Math.round(ayFark * 29.53 + (1 - hicri.gun));
    if (ramazanGun > 355) ramazanGun = -1; // fazladan tur dönmesin
  }
  return { cumaMetni, ramazanGun };
}

// ★ ORUÇ TAKİBİ (madde 50): günlük işaretleme + kaza sayacı — cihazda kalır
const ORUC_KEY = "nur_oruc_takip_v1";
function OrucTakibi({ ramazanda }: { ramazanda: boolean }) {
  const [kayit, setKayit] = useState<{ tutulan: string[]; kaza: number }>(() => {
    try { return JSON.parse(localStorage.getItem(ORUC_KEY) || "") ?? { tutulan: [], kaza: 0 }; } catch { return { tutulan: [], kaza: 0 }; }
  });
  const bugun = bugunStr();
  const bugunTutmus = kayit.tutulan.includes(bugun);

  const isaretle = () => {
    const yeni = bugunTutmus
      ? { ...kayit, tutulan: kayit.tutulan.filter((g) => g !== bugun) }
      : { ...kayit, tutulan: [...kayit.tutulan, bugun] };
    setKayit(yeni);
    try { localStorage.setItem(ORUC_KEY, JSON.stringify(yeni)); } catch {}
  };
  const kazaEkle = (d: number) => {
    const yeni = { ...kayit, kaza: Math.max(0, kayit.kaza + d) };
    setKayit(yeni);
    try { localStorage.setItem(ORUC_KEY, JSON.stringify(yeni)); } catch {}
  };

  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-3.5">
      <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/45">🌙 Oruç Takibi {ramazanda ? "· Ramazan" : ""}</p>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10.5px] font-bold text-white/85">Bugün oruçtum</p>
          <p className="text-[8.5px] text-white/40">Toplam {kayit.tutulan.length} gün işaretli · bu yılın kaydı cihazında kalır</p>
        </div>
        <button type="button" onClick={isaretle}
          className={`rounded-lg px-3 py-2 text-[10px] font-black transition active:scale-95 ${bugunTutmus ? "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
          {bugunTutmus ? "✓ İşaretli" : "İşaretle"}
        </button>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2.5">
        <p className="text-[9.5px] text-white/55">Kaza borcu: <b className="text-amber-200">{kayit.kaza} gün</b></p>
        <div className="flex gap-1">
          <button type="button" onClick={() => kazaEkle(1)} className="rounded-md bg-white/8 px-2 py-1 text-[9px] font-bold text-white/60 hover:bg-white/15">+</button>
          <button type="button" onClick={() => kazaEkle(-1)} className="rounded-md bg-white/8 px-2 py-1 text-[9px] font-bold text-white/60 hover:bg-white/15">−</button>
        </div>
      </div>
    </div>
  );
}

/** "HH:MM" → bugünkü o saatin Date'i */
function bugununSaati(hhmm: string): Date | null {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export const RamazanModal: React.FC<RamazanModalProps> = ({ open, onClose, prayerTimings, notify }) => {
  const [simdi, setSimdi] = useState(new Date());

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setSimdi(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [open]);

  const hicri = useMemo(() => (open ? hicriTarihAl(simdi) : null), [open, simdi]);
  const ramazanda = hicri?.ay === 9;

  // ── İftar / İmsak geri sayımı (Ramazan modunda) ──
  const sayac = useMemo(() => {
    if (!ramazanda || !prayerTimings) return null;
    const fmt = (ms: number) => {
      if (ms <= 0) return "vakti girdi 🌙";
      const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      return `${h}s ${m}dk`;
    };
    const maghrib = bugununSaati(prayerTimings.Maghrib ?? "");
    const fajr = bugununSaati(prayerTimings.Fajr ?? "");
    const iftara = maghrib ? maghrib.getTime() - simdi.getTime() : null;
    const imsaka = fajr ? (fajr.getTime() - simdi.getTime() > 0 ? fajr.getTime() - simdi.getTime() : fajr.getTime() + 86_400_000 - simdi.getTime()) : null;
    return { iftar: prayerTimings.Maghrib ?? "--:--", imsak: prayerTimings.Fajr ?? "--:--", iftara, imsaka, fmt };
  }, [ramazanda, prayerTimings, simdi]);

  // ── Günlük amel — hicri gün numarasına göre deterministik ──
  const amel = useMemo(() => {
    const idx = ((hicri?.gun ?? new Date().getDate()) - 1) % AMELLER.length;
    return AMELLER[Math.max(0, idx)];
  }, [hicri, simdi]);

  // ── Sıradaki kandil ──
  const siradakiKandil = useMemo(() => {
    if (!hicri) return null;
    // Aylık ortalama ile yaklaşık gün farkı (±1 gün — takvim teyidi admin duyurusuyla yapılır)
    const kalan = (ayFark: number, hedefGun: number) => ayFark * 29.53 + (hedefGun - hicri.gun);
    let enIyi: { ad: string; emoji: string; gun: number } | null = null;
    for (const k of KANDILLER) {
      let fark = kalan(k.ay - hicri.ay, k.gun);
      if (fark <= 0) fark += 12 * 29.53; // geçti — gelecek yıl
      if (!enIyi || fark < enIyi.gun) enIyi = { ad: k.ad, emoji: k.emoji, gun: Math.round(fark) };
    }
    return enIyi;
  }, [hicri, simdi]);

  if (!open) return null;

  return (
    <Modal
      title={ramazanda ? "🌙 Ramazan'ın " + hicri?.gun + ". Günü" : "🌙 Ramazan & Kandil Merkezi"}
      sub={hicri ? `${hicri.ayAdi} ${hicri.gun} · ${hicri.yil} Hicri` : undefined}
      onClose={onClose}
    >
      {/* ── HAYIRLI GÜNLER SAYACI (madde 36) ────────── */}
      {(() => { const g = hayirliGunBilgisi(simdi, hicri); return (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className={`rounded-xl border p-2.5 text-center ${g.cumaMetni.startsWith("Bugün") ? "border-emerald-400/30 bg-emerald-500/10" : "border-white/10 bg-white/[.03]"}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/45">🕌 Cuma</p>
            <p className={`mt-0.5 text-[11px] font-black ${g.cumaMetni.startsWith("Bugün") ? "text-emerald-200" : "text-white/80"}`}>{g.cumaMetni}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-2.5 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/45">🌙 Ramazan</p>
            <p className="mt-0.5 text-[11px] font-black text-white/80">{g.ramazanGun === 0 ? "Ramazan'dayız!" : g.ramazanGun > 0 ? `${g.ramazanGun} gün kaldı` : "≈"}</p>
          </div>
        </div>
      ); })()}

      {/* ── ORUÇ TAKİBİ (madde 50) ─────────────────── */}
      <OrucTakibi ramazanda={ramazanda} />

      {/* ── RAMAZAN MODU ─────────────────────────────── */}
      {ramazanda && sayac && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-amber-400/25 bg-gradient-to-b from-amber-500/15 to-transparent p-3 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-300/80"><Sunrise size={11} /> İmsak</p>
              <p className="mt-1 text-xl font-black tabular-nums text-amber-200">{sayac.imsak}</p>
              <p className="text-[8.5px] text-white/45">{sayac.imsaka !== null ? `${sayac.fmt(sayac.imsaka)} kaldı` : ""}</p>
            </div>
            <div className="rounded-xl border border-orange-400/25 bg-gradient-to-b from-orange-500/15 to-transparent p-3 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-orange-300/80"><Sunset size={11} /> İftar</p>
              <p className="mt-1 text-xl font-black tabular-nums text-orange-200">{sayac.iftar}</p>
              <p className="text-[8.5px] text-white/45">{sayac.iftara !== null ? `${sayac.fmt(sayac.iftara)} kaldı` : ""}</p>
            </div>
          </div>
          <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-white/[.04] py-2 text-[10px] font-bold text-white/60">
            <Moon size={12} style={{ color: "var(--accent)" }} /> 30 günlük yolculuğun {hicri?.gun}. günündesin · {30 - (hicri?.gun ?? 0)} gün kaldı
          </div>
        </>
      )}

      {/* ── GÜNLÜK AMEL ÖNERİSİ ──────────────────────── */}
      <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[.07] p-3.5">
        <p className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">
          <Heart size={11} /> Bugünün Ameli
        </p>
        <h4 className="text-[13px] font-black text-emerald-200">{amel.amel}</h4>
        <p className="mt-1 text-[9.5px] leading-relaxed text-white/60">{amel.detay}</p>
      </div>

      {/* ── SIRADAKİ KANDİL ──────────────────────────── */}
      {siradakiKandil && (
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">
            <Star size={11} style={{ color: "var(--accent)" }} /> Sıradaki Kandil / Mühim Gün
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold text-white/85">{siradakiKandil.emoji} {siradakiKandil.ad}</p>
            <span className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              ≈ {siradakiKandil.gun} gün
            </span>
          </div>
        </div>
      )}

      {/* ── KANDİL TAKVİMİ ───────────────────────────── */}
      <div className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/45">Kandil & Mühim Geceler (Hicri)</p>
        <div className="space-y-1.5">
          {KANDILLER.map((k) => {
            const buAyda = hicri?.ay === k.ay;
            return (
              <div key={k.ad} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] ${buAyda ? "bg-amber-500/10 text-amber-200" : "text-white/60"}`}>
                <span>{k.emoji} {k.ad}</span>
                <span className="shrink-0 text-[9px] font-bold text-white/40">{HICRI_AY_ADLARI[k.ay - 1]} {k.gun}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[8px] text-white/25">Tarihler Hicri takvimle cihazından hesaplanır · Ramazan girdiğinde bu sayfa otomatik iftar/imsak sayacına döner</p>
      </div>
    </Modal>
  );
};
