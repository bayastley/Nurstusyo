// ════════════════════════════════════════════════════════
// HAFTANIN VİDEOSU — yol haritası madde 17
// Vitrin: admin onaylı üye videoları (begeni + link dışarıda)
// Öneri: üye kendi videosunun linkini gönderir (haftada 1)
// ★ Sunucuda video SAKLANMAZ — yalnızca metadata + paylaşım linki.
// ════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { X, ThumbsUp, Film, Send, Sparkles, ExternalLink, Loader2 } from "lucide-react";
// ★ 04.10 TUR 6: notify/placeholder kalıntıları LS bazlı çeviri (kullanıcı ekranı)
import { translate } from "../i18n";

interface HaftaninVideosuModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
}

interface VitrinVideo {
  id: string;
  user_ad: string;
  baslik: string;
  aciklama: string;
  video_link: string;
  sure_bilgi: string;
  hafta: string;
  begeni: number;
  begendim?: boolean;
}

interface BenimVideo {
  id: string;
  baslik: string;
  durum: string;
  onay_yok_sebep: string;
  hafta: string;
  created_at: string;
}

export const HaftaninVideosuModal: React.FC<HaftaninVideosuModalProps> = ({ open, onClose, notify }) => {
  const tt = (k: string): string => translate(localStorage.getItem("nur_lang"), k);
  const [vitrin, setVitrin] = useState<VitrinVideo[]>([]);
  const [benim, setBenim] = useState<BenimVideo[]>([]);
  const [oturumlu, setOturumlu] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sekme, setSekme] = useState<"vitrin" | "gonder">("vitrin");
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [link, setLink] = useState("");
  const [sureBilgi, setSureBilgi] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setYukleniyor(true);
    fetch("/api/hafta/video", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (d?.ok) {
          setVitrin(d.vitrin || []);
          setBenim(d.benim || []);
          setOturumlu(!!d.oturumlu);
        }
      })
      .catch(() => undefined)
      .finally(() => { if (live) setYukleniyor(false); });
    return () => { live = false; };
  }, [open]);

  if (!open) return null;

  const gonder = async () => {
    if (gonderiyor) return;
    if (baslik.trim().length < 4) { notify?.(tt("hvBaslikKisa")); return; }
    if (!/^https?:\/\//i.test(link.trim())) { notify?.(tt("hvLinkHata")); return; }
    setGonderiyor(true);
    try {
      const r = await fetch("/api/hafta/video", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ islem: "ekle", baslik, aciklama, video_link: link, sure_bilgi: sureBilgi }),
      });
      const d = await r.json().catch(() => null) as any;
      if (d?.ok) {
        notify?.(d.mesaj || "Önerin alındı 🌟");
        setBaslik(""); setAciklama(""); setLink(""); setSureBilgi("");
        setSekme("vitrin");
        // Benim listemi tazele
        fetch("/api/hafta/video", { credentials: "include" }).then((r) => r.json()).then((d2) => {
          if (d2?.ok) { setBenim(d2.benim || []); setOturumlu(!!d2.oturumlu); }
        }).catch(() => undefined);
      } else {
        notify?.(d?.error || "Öneri gönderilemedi");
      }
    } catch { notify?.(tt("hvUlasilamadi")); }
    finally { setGonderiyor(false); }
  };

  const begen = async (videoId: string) => {
    if (!oturumlu) { notify?.(tt("hvBegenGiris")); return; }
    setVitrin((prev) => prev.map((v) => v.id === videoId ? {
      ...v, begendim: !v.begendim, begeni: Math.max(0, v.begeni + (v.begendim ? -1 : 1)),
    } : v));
    try {
      const r = await fetch("/api/hafta/video", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ islem: "begeni", videoId }),
      });
      const d = await r.json().catch(() => null) as any;
      if (!d?.ok) setVitrin((prev) => [...prev]); // hata → tazele
    } catch { /* sessiz */ }
  };

  const haftaEtiketi = (hafta: string) => {
    try {
      const d = new Date(hafta);
      return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) + " haftası";
    } catch { return hafta; }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-950/90 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <Film size={18} style={{ color: "var(--accent-2)" }} />
              {tt("hvBaslik")}
            </h2>
            <p className="mt-0.5 text-[11px] text-white/40">{tt("hvAltBaslik")}</p>
          </div>
          <button onClick={onClose} aria-label="Kapat" className="rounded-full p-1.5 transition hover:bg-white/10">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-2 border-b border-white/10 bg-black/20 px-5 py-2.5">
          <button
            onClick={() => setSekme("vitrin")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${sekme === "vitrin" ? "text-black" : "text-white/60 hover:text-white"}`}
            style={sekme === "vitrin" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            🏆 {tt("hvVitrin")}
          </button>
          <button
            onClick={() => setSekme("gonder")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${sekme === "gonder" ? "text-black" : "text-white/60 hover:text-white"}`}
            style={sekme === "gonder" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Send size={11} className="mr-1 inline" /> {tt("hvOner")}
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          {/* ── VİTRİN ── */}
          {sekme === "vitrin" && (
            yukleniyor ? (
              <p className="flex items-center justify-center gap-2 py-10 text-[11px] text-white/40">
                <Loader2 size={14} className="animate-spin" /> {tt("hvYukleniyor")}
              </p>
            ) : vitrin.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl">🎬</p>
                <p className="mt-3 text-[12px] font-bold text-white/70">{tt("hvIlkIsiklar")}</p>
                <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-white/40">{tt("hvBosAciklama")}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {vitrin.map((v, i) => (
                  <div key={v.id} className={`relative rounded-xl border p-3.5 ${i === 0 ? "border-amber-300/40 bg-gradient-to-r from-amber-400/[0.14] to-emerald-400/[0.06]" : "border-white/10 bg-white/[.03]"}`}>
                    {i === 0 && (
                      <span className="absolute -left-2 -top-2 rounded-full bg-gray-950 px-1.5 text-base drop-shadow">🥇</span>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[12.5px] font-bold text-white">{v.baslik}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8.5px] font-bold text-white/50">{haftaEtiketi(v.hafta)}</span>
                        </div>
                        {v.aciklama && <p className="mt-1 text-[10.5px] leading-relaxed text-white/60">{v.aciklama}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-[9px] text-white/40">👤 {v.user_ad}</span>
                          {v.sure_bilgi && <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[8.5px] text-white/45">📖 {v.sure_bilgi}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <a
                          href={v.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[9.5px] font-black text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
                        >
                          <ExternalLink size={10} /> {tt("hvIzle")}
                        </a>
                        <button
                          onClick={() => begen(v.id)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9.5px] font-black transition ${
                            v.begendim ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-300/50" : "bg-white/10 text-white/60 hover:bg-white/20"
                          }`}
                        >
                          <ThumbsUp size={10} /> {v.begeni > 0 ? v.begeni : tt("hvBegen")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── ÖNERİ GÖNDER ── */}
          {sekme === "gonder" && (
            !oturumlu ? (
              <div className="py-10 text-center">
                <p className="text-3xl">🔐</p>
                <p className="mt-3 text-[12px] font-bold text-white/70">{tt("hvGirisGerek")}</p>
                <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-white/40">{tt("hvGirisAciklama")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-sky-400/25 bg-sky-500/[0.08] p-3">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-sky-200">
                    <Sparkles size={11} /> {tt("hvNasil")}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-white/55" dangerouslySetInnerHTML={{ __html: tt("hvNasilAciklamaHtml") }} />
                </div>

                {/* ★ MAHREM UYARISI (01.10) — hanım kardeşlerin okuyuş sesi ile üretilen videolar
                    herkese açık vitrine önerilmeden önce saygılı hatırlatma. Kaynak:
                    dinimizislam.com "Kadının sesi haram mı?" (Aid=2987) */}
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-3">
                  <p className="text-[10px] font-bold text-amber-200">🕌 {tt("hvHanimBaslik")}</p>
                  <p className="mt-1 text-[9.5px] leading-relaxed text-white/55">{tt("hvHanimAciklama")}</p>
                  <a
                    href="https://dinimizislam.com/detay.asp?Aid=2987"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[9px] font-bold text-amber-300/90 underline decoration-amber-400/40 underline-offset-2 hover:text-amber-200"
                  >
                    {tt("hvHanimKaynak")}
                  </a>
                </div>

                {benim.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                    <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">{tt("hvBenimOneriler")}</p>
                    <div className="space-y-1.5">
                      {benim.map((b) => (
                        <div key={b.id} className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="min-w-0 flex-1 truncate text-white/75">{b.baslik}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-black ${
                            b.durum === "onayli" ? "bg-emerald-500/20 text-emerald-300" :
                            b.durum === "reddedildi" ? "bg-red-500/20 text-red-300" :
                            "bg-amber-500/20 text-amber-300"
                          }`}>
                            {b.durum === "onayli" ? tt("hvVitrinde") : b.durum === "reddedildi" ? tt("hvReddedildi") : tt("hvOnayBekliyor")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">{tt("hvLabelBaslik")}</label>
                  <input
                    value={baslik}
                    onChange={(e) => setBaslik(e.target.value)}
                    maxLength={100}
                    placeholder={tt("hvBaslikOrnek")}
                    className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">{tt("hvLabelLink")}</label>
                  <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    maxLength={500}
                    placeholder="https://youtube.com/watch?v=…"
                    className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">{tt("hvLabelSure")}</label>
                  <input
                    value={sureBilgi}
                    onChange={(e) => setSureBilgi(e.target.value)}
                    maxLength={120}
                    placeholder={tt("hvAyetOrnek")}
                    className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">{tt("hvLabelAciklama")}</label>
                  <textarea
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder={tt("hvVideoAnlat")}
                    className="w-full resize-none rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <button
                  onClick={gonder}
                  disabled={gonderiyor}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                >
                  {gonderiyor ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                  {gonderiyor ? tt("hvGonderiliyor") : tt("hvGonder")}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
