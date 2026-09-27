// ════════════════════════════════════════════════════════
// DAVET MODAL — İş 5: Davet / Referans Sistemi
// Girişli kullanıcı: kişisel davet kodu + linkini kopyalar,
// kaç dost davet ettiğini ve kazandığı hakları görür.
// Girişsiz/davet edilen: kodu girer → karşılıklı +3 kısa video.
//
// ★ ÖDÜL SUNUCUDA VERİLİR (nur_referans_kullan RPC — atomik);
//   local jeton yazılmaz, wallet sync zaten cüzdanı çeker.
// ★ Tablolar seed edilmeden önce API { aktif:false } döner →
//   modal dürüstçe "yakında" gösterir, site bozulmaz.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2, Users, X } from "lucide-react";
import { Modal } from "./UIElements";

export interface DavetModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
  /** Girişli kullanıcı — null ise sadece kod girme bölümü gösterilir */
  user?: { id?: string; name?: string; email?: string } | null;
  /** Kayıt olunca yakalanan davet kodu (?davet=KOD) — otomatik kullanılır */
  bekleyenDavetKodu?: string | null;
  /** Davet kodu kullanılıp ödül verilince çağrılır — cüzdanı tazeler */
  onOdulAlindi?: () => void;
}

interface ReferansDurum {
  aktif: boolean;
  kod?: string;
  link?: string;
  davetSayisi?: number;
  toplamOdul?: number;
  kademe?: string | null;
}

export const DavetModal: React.FC<DavetModalProps> = ({
  open, onClose, notify, user, bekleyenDavetKodu, onOdulAlindi,
}) => {
  const [durum, setDurum] = useState<ReferansDurum | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kodGiris, setKodGiris] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [kopyalandi, setKopyalandi] = useState<"kod" | "link" | null>(null);

  // ── Durumu çek (girişliyken) ──────────────────────────────
  useEffect(() => {
    if (!open || !user?.id) { setDurum(null); return; }
    let live = true;
    setYukleniyor(true);
    fetch("/api/referans", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (live) setDurum(d as ReferansDurum); })
      .catch(() => { if (live) setDurum({ aktif: false }); })
      .finally(() => { if (live) setYukleniyor(false); });
    return () => { live = false; };
  }, [open, user?.id]);

  // ── Bekleyen davet kodu (linkten gelmiş) otomatik kullan ──
  useEffect(() => {
    if (!open || !bekleyenDavetKodu || !user?.id || gonderiliyor) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch("/api/referans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ kod: bekleyenDavetKodu }),
        });
        const d = await res.json();
        if (!live) return;
        if (d?.ok) {
          notify?.(d.mesaj || "Davet ödülün hesabına eklendi!");
          onOdulAlindi?.();
        }
      } catch { /* sessiz — kod girerek tekrar denenebilir */ }
    })();
    return () => { live = false; };
  }, [open, bekleyenDavetKodu, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const kodKullan = useCallback(async () => {
    const kod = kodGiris.trim().toUpperCase();
    if (kod.length < 4 || gonderiliyor) return;
    setGonderiliyor(true);
    try {
      const res = await fetch("/api/referans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kod }),
      });
      const d = await res.json();
      if (d?.ok) {
        notify?.(d.mesaj || "Davet ödülün hesabına eklendi!");
        setKodGiris("");
        onOdulAlindi?.();
      } else {
        notify?.(d?.error || "Davet kodu kullanılamadı");
      }
    } catch {
      notify?.("Sunucuya ulaşılamadı — tekrar dene");
    } finally {
      setGonderiliyor(false);
    }
  }, [kodGiris, gonderiliyor, notify, onOdulAlindi]);

  const kopyala = useCallback(async (metin: string, tur: "kod" | "link") => {
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(tur);
      window.setTimeout(() => setKopyalandi(null), 2000);
      notify?.(tur === "kod" ? "Davet kodu kopyalandı 📋" : "Davet linki kopyalandı 📋");
    } catch {
      notify?.("Kopyalanamadı — elle seçip kopyala");
    }
  }, [notify]);

  if (!open) return null;

  const girisli = Boolean(user?.id);

  return (
    <Modal title="🎁 Arkadaşını Davet Et" sub="İkiniz de +3 kısa video hakkı kazanın — davet ettiğin kadar büyüsün" wide>
      {/* GİRİŞLİ: kodum + istatistik */}
      {girisli && (
        yukleniyor ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[11px] text-white/50">
            <Loader2 size={14} className="animate-spin" /> Davet kartın hazırlanıyor...
          </div>
        ) : durum?.aktif && durum.kod ? (
          <div className="space-y-3">
            {/* Kod kartı */}
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3.5">
              <p className="mb-2 text-[9px] font-black tracking-wider text-white/40">DAVET KODUN</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 rounded-xl border border-dashed border-[color:var(--accent)]/50 bg-black/30 py-2.5 text-center font-display text-[22px] font-black tracking-[0.3em]" style={{ color: "var(--accent-2)" }}>
                  {durum.kod}
                </span>
                <button type="button" onClick={() => kopyala(durum.kod!, "kod")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:brightness-125"
                  style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                  title="Kodu kopyala">
                  {kopyalandi === "kod" ? <Check size={15} strokeWidth={3} className="text-black" /> : <Copy size={15} className="text-black" />}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex-1 truncate rounded-xl bg-black/30 px-3 py-2 text-[9.5px] text-white/45">{durum.link}</span>
                <button type="button" onClick={() => kopyala(durum.link!, "link")}
                  className="glass-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition hover:text-white"
                  title="Linki kopyala">
                  {kopyalandi === "link" ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* İstatistik */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[20px] font-black" style={{ color: "var(--accent-2)" }}>
                  <Users size={16} /> {durum.davetSayisi ?? 0}
                </div>
                <p className="mt-0.5 text-[8.5px] font-bold tracking-wider text-white/40">DAVET EDİLEN DOST</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[20px] font-black" style={{ color: "var(--accent-2)" }}>
                  <Gift size={16} /> +{durum.toplamOdul ?? 0}
                </div>
                <p className="mt-0.5 text-[8.5px] font-bold tracking-wider text-white/40">KAZANILAN KISA VİDEO</p>
              </div>
            </div>

            {durum.kademe && (
              <p className="text-center text-[10px] font-bold" style={{ color: "var(--accent)" }}>
                Seviyen: {durum.kademe}
              </p>
            )}

            <p className="rounded-xl border border-white/5 bg-black/20 p-2.5 text-[9px] leading-relaxed text-white/40">
              Dostum kayıt olup kodunu girdiğinde ikinize de anında +3 kısa video hakkı yazılır.
              Haklar sunucuda verildiği için hangi cihazdan girersen geçerlidir.
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-[10px] leading-relaxed text-amber-200/90">
            ⏳ Davet sistemi şu anda hazırlanıyor — veritabanı açılınca kodun burada görünecek.
          </p>
        )
      )}

      {/* KOD GİRME — girişli (başkasının kodunu girme) veya girişsiz (kaydet yönlendirme) */}
      {girisli ? (
        <div className="mt-4 border-t border-white/5 pt-3">
          <p className="mb-2 text-[9px] font-black tracking-wider text-white/40">ELİNDE KOD VAR MI?</p>
          <div className="flex gap-2">
            <input
              value={kodGiris}
              onChange={(e) => setKodGiris(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
              onKeyDown={(e) => { if (e.key === "Enter") kodKullan(); }}
              placeholder="DOST KODU (ör: NUR7KX)"
              className="glass-soft flex-1 rounded-xl px-3 py-2.5 text-center text-[13px] font-black tracking-[0.25em] text-white outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-white/25"
            />
            <button type="button" onClick={kodKullan} disabled={gonderiliyor || kodGiris.length < 4}
              className="flex items-center gap-1.5 rounded-xl px-4 text-[11px] font-black text-black transition hover:brightness-110 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              {gonderiliyor ? <Loader2 size={13} className="animate-spin" /> : <Gift size={13} />}
              Kullan
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 border-t border-white/5 pt-3">
          <p className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-[10px] leading-relaxed text-white/60">
            🎁 Elinde bir davet kodu mu var? Kayıt olduktan sonra buraya gir — sen de +3 kısa video hakkı kazanırsın.
            Henüz üye değilsen <strong style={{ color: "var(--accent-2)" }}>kayıt ol</strong>, sonra bu kodu kullan.
          </p>
        </div>
      )}

      {/* Kapat */}
      <button type="button" onClick={onClose}
        className="glass-soft mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-bold text-white/60 transition hover:text-white">
        <X size={12} /> Kapat
      </button>
    </Modal>
  );
};

