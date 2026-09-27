// ════════════════════════════════════════════════════════
// HAFTANIN VİDEOSU — yol haritası madde 17
// Vitrin: admin onaylı üye videoları (begeni + link dışarıda)
// Öneri: üye kendi videosunun linkini gönderir (haftada 1)
// ★ Sunucuda video SAKLANMAZ — yalnızca metadata + paylaşım linki.
// ════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { X, ThumbsUp, Film, Send, Sparkles, ExternalLink, Loader2 } from "lucide-react";

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
    if (baslik.trim().length < 4) { notify?.("Başlık en az 4 karakter olmalı"); return; }
    if (!/^https?:\/\//i.test(link.trim())) { notify?.("Video linki http(s) ile başlamalı (YouTube, Instagram vb.)"); return; }
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
    } catch { notify?.("Sunucuya ulaşılamadı"); }
    finally { setGonderiyor(false); }
  };

  const begen = async (videoId: string) => {
    if (!oturumlu) { notify?.("🔐 Beğenmek için giriş yapman gerekiyor"); return; }
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
              Haftanın Videosu
            </h2>
            <p className="mt-0.5 text-[11px] text-white/40">Topluluğun en beğenilen üretimleri — admin onaylı vitrin</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 transition hover:bg-white/10">
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
            🏆 Vitrin
          </button>
          <button
            onClick={() => setSekme("gonder")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${sekme === "gonder" ? "text-black" : "text-white/60 hover:text-white"}`}
            style={sekme === "gonder" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Send size={11} className="mr-1 inline" /> Videomu Öner
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
          {/* ── VİTRİN ── */}
          {sekme === "vitrin" && (
            yukleniyor ? (
              <p className="flex items-center justify-center gap-2 py-10 text-[11px] text-white/40">
                <Loader2 size={14} className="animate-spin" /> Yükleniyor…
              </p>
            ) : vitrin.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl">🎬</p>
                <p className="mt-3 text-[12px] font-bold text-white/70">İlk ışıklar yakında ✨</p>
                <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-white/40">
                  Topluluğun en beğenilen videoları burada sergilenecek — moderasyon ekibimiz onayladıkça vitrin dolmaya başlar. Sen de stüdyoda ürettiğin videoyu "Videomu Öner" sekmesinden gönderebilirsin 🚀
                </p>
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
                          <ExternalLink size={10} /> İzle
                        </a>
                        <button
                          onClick={() => begen(v.id)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9.5px] font-black transition ${
                            v.begendim ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-300/50" : "bg-white/10 text-white/60 hover:bg-white/20"
                          }`}
                        >
                          <ThumbsUp size={10} /> {v.begeni > 0 ? v.begeni : "Beğen"}
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
                <p className="mt-3 text-[12px] font-bold text-white/70">Giriş yapman gerekiyor</p>
                <p className="mx-auto mt-1 max-w-sm text-[10.5px] leading-relaxed text-white/40">
                  Video önerisi gönderebilmek için Google ile giriş yap — sol üst menüden 3 saniyede üye ol.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-sky-400/25 bg-sky-500/[0.08] p-3">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-sky-200">
                    <Sparkles size={11} /> Nasıl çalışır?
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-white/55">
                    Ürettiğin videoyu YouTube/Instagram gibi bir platforma yükle, linkini buraya yapıştır.
                    Admin onayladıktan sonra videon vitrinde sergilenir; beğeni toplayanlar haftanın birincisi olur.
                    Her hafta 1 öneri hakkın var. <b className="text-white/75">Videonun kendisi sitede saklanmaz</b> — yalnızca link ve başlık.
                  </p>
                </div>

                {benim.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                    <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">Benim önerilerim</p>
                    <div className="space-y-1.5">
                      {benim.map((b) => (
                        <div key={b.id} className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="min-w-0 flex-1 truncate text-white/75">{b.baslik}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-black ${
                            b.durum === "onayli" ? "bg-emerald-500/20 text-emerald-300" :
                            b.durum === "reddedildi" ? "bg-red-500/20 text-red-300" :
                            "bg-amber-500/20 text-amber-300"
                          }`}>
                            {b.durum === "onayli" ? "✓ Vitrinde" : b.durum === "reddedildi" ? "Reddedildi" : "⏳ Onay bekliyor"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">Video başlığı *</label>
                  <input
                    value={baslik}
                    onChange={(e) => setBaslik(e.target.value)}
                    maxLength={100}
                    placeholder="ör: Fatiha Suresi — Gün Batımı atmosferi"
                    className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">Video linki *</label>
                  <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    maxLength={500}
                    placeholder="https://youtube.com/watch?v=…"
                    className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">Ayet / sure bilgisi</label>
                  <input
                    value={sureBilgi}
                    onChange={(e) => setSureBilgi(e.target.value)}
                    maxLength={120}
                    placeholder="ör: Bakara 255 — Ayete'l-Kürsî"
                    className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-white/25 focus:bg-white/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/45">Açıklama</label>
                  <textarea
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Videonu bir-iki cümleyle anlat…"
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
                  {gonderiyor ? "Gönderiliyor…" : "Önerimi Gönder"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
