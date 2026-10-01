import React, { useMemo, useState } from "react";
import { Mic, Upload, Trash2, Check, Image as ImageIcon, Scissors, Loader2, Crown, X } from "lucide-react";
import { SURAHS } from "../data";
import type { Clip } from "../clips";
import type { KendiSesAktif } from "../studio/useKendiSes";
import type { StoredSes } from "../studio/sesDeposu";
import { baslangicKaydir, type SesSegmenti } from "../studio/sesZamanlama";

// ═══════════════════════════════════════════════════════════════
// KENDİ SESİNİ YÜKLE MODALI (30.09) — ELİT ÜYELERE ÖZEL
//
// Kullanıcı senaryosu:
//  • Nûr / İhlâs suresini kendi okur, tek dosya olarak yükler
//    → sistem ayet geçişlerini KENDİ okuyuşundan milisanielik algılar
//  • İsterse her ayeti AYRI dosya olarak yükler (ayet-başına mod)
//  • Algılanan ayet sınırını milisanielik düzenler (audio player)
//  • Ayetler arasına nefes aralığı ekler
//  • Her ayete ayrı arka plan seçebilir ("arka plan bizden, ses ondan")
// ELİT olmayan kullanıcı tıkladığında premium satın almaya yönlendirilir.
// ═══════════════════════════════════════════════════════════════

interface Props {
  open: boolean;
  onClose: () => void;
  sure: number;
  /** Seçili ayet listesi (sıra = senkron sırası) */
  seciliAyetler: Array<{ s: number; a: number; sName?: string }>;
  aktifSes: KendiSesAktif | null;
  kayitlar: StoredSes[];
  yukleniyor: boolean;
  isElit: boolean;
  nefes: number;
  yukle: (dosya: File, sure: number, ayetSayisi: number, konum: "tum" | number) => Promise<unknown>;
  yukleAyetAyri: (dosya: File, sure: number, ayet: number) => Promise<boolean>;
  sec: (id: string) => Promise<boolean>;
  sil: (id: string) => Promise<void>;
  zamanlamaKaydet: (id: string, segments: SesSegmenti[], nefes?: number) => Promise<void>;
  kaldirAktif: () => void;
  /** Eski kaydı güncel motorla yeniden tara (01.10) — donmuş yanlış zamanlamaları düzeltir */
  yenidenTara: (id: string, ayetSayisi: number) => Promise<boolean>;
  /** Ayet kartına arka plan ata (pickingFor mekanizmasıyla aynı kapı) */
  setPickingFor: (id: string | null) => void;
  setModal: (m: "atmos" | null) => void;
  ayahBackgrounds: Record<string, Clip>;
  openPremium: (tab?: "uyelik" | "jeton") => void;
  notify: (msg: string) => void;
}

const fmt = (sn: number) => `${Math.floor(sn / 60)}:${String(Math.floor(sn % 60)).padStart(2, "0")}.${String(Math.floor((sn % 1) * 100)).padStart(2, "0")}`;

export const KendiSesModal: React.FC<Props> = ({
  open, onClose, sure, seciliAyetler, aktifSes, kayitlar, yukleniyor, isElit, nefes,
  yukle, yukleAyetAyri, sec, sil, zamanlamaKaydet, kaldirAktif, yenidenTara,
  setPickingFor, setModal, ayahBackgrounds, openPremium, notify,
}) => {
  const [mod, setMod] = useState<"tum" | "ayet">("tum");
  const [duzenleIdx, setDuzenleIdx] = useState<number | null>(null);
  const [nefesDeger, setNefesDeger] = useState(nefes);
  const [sesliIdx, setSesliIdx] = useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  // ★ DÜZENLE MODU (01.10): taslak = HAM (nefes'siz) segment kopyası — sürgüyle ayet başlangıcı kaydırılır
  const [taslaklar, setTaslaklar] = useState<SesSegmenti[] | null>(null);

  const sureMeta = useMemo(() => SURAHS[sure - 1], [sure]);
  const sureAdi = seciliAyetler[0]?.sName || sureMeta?.name || `Sure ${sure}`;
  const ayetSayisi = seciliAyetler.length;

  if (!open) return null;

  /** Nefes uygulanmış segmentleri HAM (depo) biçimine döndür — çifte-nefes koruması:
   *  zamanlamaKaydet ham bekler, hook gösterirken nefesi kendisi ekler. */
  const hamSegmentler = (applied: SesSegmenti[], nefesSn: number): SesSegmenti[] =>
    applied.map((s, i) => ({ start: Math.max(0, +(s.start - i * nefesSn).toFixed(3)), dur: s.dur }));
  /** Editörde gösterilen: taslak varsa ham + anlık nefes kayması (çalınan gerçek zaman) */
  const gosterilen: SesSegmenti[] =
    aktifSes && taslaklar
      ? taslaklar.map((s, i) => ({ start: s.start + i * (aktifSes.nefes || 0), dur: s.dur }))
      : aktifSes?.segments ?? [];

  const elitKapisi = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    notify("👑 Kendi sesinle üretim ELİT üyelere özel — premium sayfasına yönlendiriliyorsun");
    openPremium("uyelik");
  };

  const dosyaSec = (konum: "tum" | number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      if (mod === "tum") await yukle(f, sure, ayetSayisi, konum);
      else await yukleAyetAyri(f, sure, konum as number);
    };
    input.click();
  };

  const sesCalDurdur = (idx: number, baslangicSn?: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    if (sesliIdx === idx) { setSesliIdx(null); return; }
    if (!aktifSes) return;
    const seg = aktifSes.segments[idx];
    if (!seg) return;
    const a = new Audio(aktifSes.url);
    const hedefBas = baslangicSn ?? seg.start;
    // ★ ESKİ-KAYIT KORUMASI (01.10): metadata süresi hedefin altındaysa segment oynatılamaz
    //   (WhatsApp mp4 vakası) — sessizlik yerine net yönlendirme ver.
    a.onloadedmetadata = () => {
      if (Number.isFinite(a.duration) && hedefBas >= a.duration - 0.05) {
        notify("⚠️ Bu kaydın zamanlamaları eski taramadan kalma ve sesin süresini aşıyor — '🔬 Yeniden analiz et' ile düzelt");
      }
    };
    a.currentTime = hedefBas;
    // ★ FIX (01.10): bitiş sınırı — segment sonunda dursun. Önceden dosyanın
    //   sonuna kadar çalıyordu ("hepsi bütün sesi okuyor" şikayetinin ikinci yarısı).
    const son = idx < aktifSes.segments.length - 1
      ? aktifSes.segments[idx + 1].start
      : seg.start + seg.dur + 0.8;
    const bitis = Math.max(hedefBas + 0.2, son);
    a.onended = () => { setSesliIdx(null); audioRef.current = null; };
    a.ontimeupdate = () => { if (a.currentTime >= bitis) { a.pause(); setSesliIdx(null); audioRef.current = null; } };
    audioRef.current = a;
    setSesliIdx(idx);
    a.play().catch(() => setSesliIdx(null));
  };

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md modal-in" onMouseDown={onClose}>
      <div className="glass modal-in relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5" onMouseDown={(e) => e.stopPropagation()} style={{ border: "1px solid rgba(215,170,82,.3)" }}>
        <button aria-label="Kapat" className="absolute right-3 top-3 text-white/50 hover:text-white" onClick={onClose}><X size={18} /></button>

        {/* Başlık */}
        <div className="mb-3 flex items-start gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}><Mic size={18} /></span>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>KENDİ SESİNLE ÜRET</h3>
            <p className="text-[9.5px] leading-relaxed text-white/45">
              {sureAdi} · {ayetSayisi} ayet — okuyuşun ne kadar hızlı/yavaş olursa olsun ayetler ve arka planlar sesine <b className="text-white/70">milisanielik</b> kilitlenir.
            </p>
          </div>
        </div>

        {/* ELİT kilidi — admin değilse ve elit değilse tüm içerik kilitli görünüm */}
        {!isElit && (
          <div className="relative">
            <div className="pointer-events-none select-none opacity-25 blur-[1.5px]">
              <div className="mb-2 flex gap-2">
                <span className="flex-1 rounded-xl bg-white/5 py-2 text-center text-[10px] font-bold text-white/60">🎙️ Tüm Sure Ses</span>
                <span className="flex-1 rounded-xl bg-white/5 py-2 text-center text-[10px] font-bold text-white/60">🔢 Ayet Başına</span>
              </div>
              <div className="space-y-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[.04] px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="h-2 flex-1 rounded bg-white/10" />
                    <span className="text-[9px] text-white/30">{fmt(1.2 + i)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-400/40"><Crown size={20} className="text-amber-300" /></span>
              <p className="text-[11px] font-black text-amber-200">ELİT ÜYELİK GEREKLİ</p>
              <p className="max-w-[260px] text-[9.5px] leading-relaxed text-white/55">Kendi okuyuşunla video üret, ayet geçişleri sesine birebir senkron olsun. Her ayete ayrı arka plan seç.</p>
              <button onClick={elitKapisi} className="mt-1 rounded-xl px-5 py-2.5 text-[11px] font-black text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                👑 ELİT'e Geç
              </button>
              <button onClick={onClose} className="text-[9px] text-white/35 hover:text-white/70">Şimdilik kapat</button>
            </div>
          </div>
        )}

        {isElit && (
          <>
            {/* Mod seçimi */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button onClick={() => setMod("tum")} className={`rounded-xl px-3 py-2.5 text-left text-[10px] font-bold ring-1 transition ${mod === "tum" ? "bg-[color:var(--accent)]/15 text-white ring-[color:var(--accent)]/60" : "bg-white/[.04] text-white/55 ring-white/10 hover:bg-white/[.07]"}`}>
                🎙️ Tek dosya (tüm okuyuş)<br /><span className="text-[8.5px] font-normal text-white/40">Ayetleri sistem otomatik bulur</span>
              </button>
              <button onClick={() => setMod("ayet")} className={`rounded-xl px-3 py-2.5 text-left text-[10px] font-bold ring-1 transition ${mod === "ayet" ? "bg-[color:var(--accent)]/15 text-white ring-[color:var(--accent)]/60" : "bg-white/[.04] text-white/55 ring-white/10 hover:bg-white/[.07]"}`}>
                🔢 Ayet başına dosya<br /><span className="text-[8.5px] font-normal text-white/40">Her ayeti ayrı yükle, sırayla birleşir</span>
              </button>
            </div>

            {/* Aktif ses özeti */}
            {aktifSes && (
              <div className="mb-3 rounded-xl bg-emerald-500/10 px-3 py-2 ring-1 ring-emerald-400/30">
                <p className="text-[10px] font-bold text-emerald-300">✅ Aktif ses hazır · {aktifSes.kaynak === "tum-sure" ? "tek dosya" : "ayet başına"} · {aktifSes.segments.length} bölüm</p>
                {aktifSes.kaynak === "tum-sure" && aktifSes.segments.length !== ayetSayisi && (
                  <p className="mt-1 text-[9px] font-bold text-amber-300">⚠ {aktifSes.segments.length} bölüm ≠ {ayetSayisi} ayet — geçiş sayısı uyuşmuyor, yeniden analiz öner</p>
                )}
                <div className="mt-1 flex items-center gap-3">
                  <button onClick={async () => { setTaslaklar(null); setDuzenleIdx(null); await yenidenTara(aktifSes.id, ayetSayisi); }} disabled={yukleniyor} className="text-[9px] font-bold text-[color:var(--accent-2)] hover:underline disabled:opacity-40">🔬 Yeniden analiz et</button>
                  <button onClick={() => { kaldirAktif(); setDuzenleIdx(null); setTaslaklar(null); }} className="text-[9px] text-white/50 hover:text-white">Kaldır (kayıtlar saklanır)</button>
                </div>
              </div>
            )}

            {/* Yükleme alanı */}
            <div className="mb-3 space-y-1.5">
              {mod === "tum" ? (
                <button disabled={yukleniyor} onClick={() => dosyaSec("tum")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[.03] py-4 text-[11px] font-bold text-white/70 transition hover:border-[color:var(--accent)]/50 hover:bg-white/[.06] disabled:opacity-50">
                  {yukleniyor ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {yukleniyor ? "Ses çözümleniyor…" : `${sureAdi} okuyuşunu yükle (mp3 / m4a / wav)`}
                </button>
              ) : (
                <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                  {seciliAyetler.map((ay, i) => (
                    <div key={`${ay.s}:${ay.a}`} className="flex items-center gap-2 rounded-lg bg-white/[.04] px-2.5 py-1.5">
                      <span className="w-14 shrink-0 text-[9.5px] font-bold text-white/70">{sureAdi.slice(0, 8)} {ay.a}</span>
                      <button onClick={() => dosyaSec(ay.a)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 py-1.5 text-[9.5px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white">
                        <Upload size={11} /> ses yükle
                      </button>
                      {/* Ayet başına arka plan: "arka plan bizden seçer" */}
                      <button
                        onClick={() => { setPickingFor(`${ay.s}:${ay.a}`); setModal("atmos"); }}
                        className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1.5 text-[9px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                        title="Bu ayete özel arka plan seç"
                      >
                        <ImageIcon size={11} />
                        {ayahBackgrounds[`${ay.s}:${ay.a}`] ? <Check size={10} className="text-emerald-400" /> : "arka plan"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Algılanan segmentler + düzenleyici */}
            {aktifSes && aktifSes.segments.length > 0 && (
              <div className="mb-3 rounded-xl bg-white/[.03] p-3 ring-1 ring-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-white/70"><Scissors size={11} /> Ayet geçişleri (milisanielik)</p>
                  {taslaklar === null ? (
                    <button onClick={() => { setTaslaklar(hamSegmentler(aktifSes.segments, aktifSes.nefes || 0)); setDuzenleIdx(0); }} className="text-[9px] font-bold text-[color:var(--accent-2)] hover:underline">Düzenle</button>
                  ) : (
                    <span className="flex items-center gap-2">
                      <button onClick={async () => { await zamanlamaKaydet(aktifSes.id, taslaklar, aktifSes.nefes || 0); setTaslaklar(null); setDuzenleIdx(null); }} className="rounded-lg bg-[color:var(--accent)]/20 px-2.5 py-0.5 text-[9px] font-black text-[color:var(--accent-2)] hover:bg-[color:var(--accent)]/30">Kaydet</button>
                      <button onClick={() => { setTaslaklar(null); setDuzenleIdx(null); }} className="text-[9px] font-bold text-white/50 hover:text-white">Vazgeç</button>
                    </span>
                  )}
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {gosterilen.map((seg, i) => {
                    const ay = seciliAyetler[i];
                    const bgVar = ay && ayahBackgrounds[`${ay.s}:${ay.a}`];
                    return (
                      <React.Fragment key={i}>
                        <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[9.5px] ${duzenleIdx === i ? "bg-[color:var(--accent)]/10 ring-1 ring-[color:var(--accent)]/50" : "bg-white/[.04]"}`}>
                          <button onClick={() => sesCalDurdur(i, taslaklar ? seg.start : undefined)} className="w-5 shrink-0 rounded-full bg-white/10 p-1 text-white/70 hover:bg-white/20" title={i === sesliIdx ? "Durdur" : "Bu ayetin sesini dinle"}>
                            {sesliIdx === i ? "⏸" : "▶"}
                          </button>
                          <span className="w-16 shrink-0 font-bold text-white/75">{ay ? `Ayet ${ay.a}` : `Bölüm ${i + 1}`}</span>
                          <span className="w-20 shrink-0 tabular-nums text-white/45">{fmt(seg.start)}</span>
                          <span className="flex-1 h-1.5 rounded-full bg-white/10">
                            <span className="block h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${Math.min(100, (seg.dur / Math.max(gosterilen[gosterilen.length - 1]?.start + gosterilen[gosterilen.length - 1]?.dur || 1, 1)) * 100)}%` }} />
                          </span>
                          {bgVar && <span title="Ayet arka planı atanmış"><Check size={11} className="shrink-0 text-emerald-400" /></span>}
                          {taslaklar === null && duzenleIdx === i && (
                            <span className="shrink-0 text-[8.5px] text-white/40">→ okuyuşunla hizalı</span>
                          )}
                        </div>
                        {taslaklar && duzenleIdx === i && (() => {
                          const hamToplam = taslaklar[taslaklar.length - 1].start + taslaklar[taslaklar.length - 1].dur;
                          const altSinir = i > 0 ? taslaklar[i - 1].start + 0.2 : 0;
                          const ustSinir = i < taslaklar.length - 1 ? taslaklar[i + 1].start - 0.2 : Math.max(0.3, hamToplam - 0.3);
                          return (
                            <div className="px-2.5 pb-1.5">
                              <input
                                type="range"
                                min={altSinir}
                                max={Math.max(altSinir + 0.05, ustSinir)}
                                step={0.05}
                                value={taslaklar[i].start}
                                onChange={(e) => setTaslaklar(baslangicKaydir(taslaklar, i, Number(e.target.value), hamToplam))}
                                className="h-1 w-full accent-[color:var(--accent)]"
                              />
                              <p className="text-[8px] text-white/35">Başlangıcı kaydır ({taslaklar[i].start.toFixed(2)} sn) — ayeti kendi okuyuşundaki yerine hizala</p>
                            </div>
                          );
                        })()}
                      </React.Fragment>
                    );
                  })}
                </div>
                {/* Nefes aralığı */}
                <div className="mt-2.5 flex items-center gap-2.5">
                  <span className="text-[9px] font-bold text-white/50">Ayetler arası nefes</span>
                  <input type="range" min={0} max={2} step={0.1} value={nefesDeger} onChange={(e) => setNefesDeger(Number(e.target.value))} className="h-1 flex-1 accent-[color:var(--accent)]" />
                  <span className="w-10 text-right text-[9px] tabular-nums text-white/60">{nefesDeger.toFixed(1)} sn</span>
                  <button
                    onClick={() => zamanlamaKaydet(aktifSes.id, hamSegmentler(aktifSes.segments, aktifSes.nefes || 0), nefesDeger)}
                    className="rounded-lg bg-[color:var(--accent)]/20 px-2.5 py-1 text-[9px] font-black text-[color:var(--accent-2)] hover:bg-[color:var(--accent)]/30"
                  >Uygula</button>
                </div>
                <p className="mt-1.5 text-[8.5px] leading-relaxed text-white/35">Bölümler sıraya birebir bağlıdır: i. bölüm = listedeki i. ayet (Fatiha'da besmele = Ayet 1). Hizalama eski kayıttan kaymışsa "🔬 Yeniden analiz et" ile güncel motorle tekrar tara; milimetrik ayar için "Düzenle" sürgüsünü kullan.</p>
              </div>
            )}

            {/* Kayıtlar */}
            {kayitlar.length > 0 && (
              <div className="rounded-xl bg-white/[.02] p-3 ring-1 ring-white/5">
                <p className="mb-1.5 text-[10px] font-black text-white/60">Kayıtlı sesler ({kayitlar.length})</p>
                <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                  {kayitlar.map((k) => (
                    <div key={k.id} className="flex items-center gap-2 rounded-lg bg-white/[.04] px-2.5 py-1.5 text-[9.5px]">
                      <button onClick={() => { void sec(k.id); setTaslaklar(null); setDuzenleIdx(null); }} className="min-w-0 flex-1 truncate text-left font-bold text-white/75 hover:text-white" title={k.ad}>
                        {SURAHS[k.sure - 1]?.name ?? k.sure} · {k.kaynak === "tum-sure" ? "tüm sure" : `ayet ${k.konum}`} · {k.ad}
                      </button>
                      <span className="shrink-0 tabular-nums text-white/35">{fmt(k.sure_sn)}</span>
                      {aktifSes?.id === k.id && <Check size={11} className="shrink-0 text-emerald-400" />}
                      <button onClick={() => sil(k.id)} className="shrink-0 text-white/30 hover:text-red-400" title="Sil"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-3 text-center text-[8.5px] leading-relaxed text-white/30">
              Ses yalnızca senin tarayıcında saklanır · sunucuya yüklenmez · üretimde ayetler sesine kilitlenir
            </p>
          </>
        )}
      </div>
    </div>
  );
};
