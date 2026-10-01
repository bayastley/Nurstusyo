// ════════════════════════════════════════════════════════
// KESFET MODAL — yol haritasının içerik maddeleri tek çatı:
// 18 Hadis Bankası · 19 Kıssa Köşesi · 20 Soru-Cevap Arşivi
// 21 Kelime Kartları · 22 Sure Bilgileri · 28 Namaz Öğretici
// 35 Bebek Duası Köşesi · 61 Dua Vakit Rehberi
// Sekme yapısı mevcut Segmented/Modal diliyle aynı; her sekme
// kendi içinde filtre/arama taşır. Stüdyoya dokunmaz.
// ════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import { translate, type Lang } from "../i18n";
import { Search, ChevronLeft, ChevronDown } from "lucide-react";
import { Modal } from "./UIElements";
import {
  HADIS_BANKASI, HADIS_TEMALARI, HADIS_DERECE_ETIKETI, KISSA_LISTESI, SORU_CEVAP_ARŞIVI, TECVID_KURALLARI, TECVID_SEVIYE_ETIKETI,
  KELIME_KARTLARI, SURE_BİLGİLERİ, NAMAZ_REHBERİ, DUA_REHBERİ, BES_SART_SORULARI, type KelimeKart,
  HOCA_KARSILASTIRMA_AYETLER, camiHaritaUrl, camiListeUrl, KANAL_REHBERI,
} from "../data/kesfetData";
import { SURAHS } from "../data/surahs";
import { kitaplikOku, DuaSesSecici, kelimeOku, KARILER, everyAyetUrl, SEKMELER, type SekmeId, type KitaplikNot } from "./kesfetTemel";
import { DuaRehberBolumu } from "./kesfetDuaBolumu";

// ★ SRP adım 4 (30.09): kitaplık okuma + TTS ses motoru + kâriler + sekme tanımları kesfetTemel.tsx'e taşındı
interface KesfetModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  initialSekme?: SekmeId;
  notify?: (msg: string) => void;
}

export const KesfetModal: React.FC<KesfetModalProps> = ({ open, onClose, initialSekme, notify , lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [sekme, setSekme] = useState<SekmeId>(initialSekme ?? "hadis");
  const [arama, setArama] = useState("");
  const [hadisTema, setHadisTema] = useState("tumu");
  const [kartCevrildi, setKartCevrildi] = useState<number | null>(null);
  // ★ SURE AKORDEONU (01.10): tıkla-aç/kapa — liste yer kaplamasın, uzun açıklama sadece açık karta girsin
  const [acikSure, setAcikSure] = useState<number | null>(null);
  // ★ KISSA AKORDEONU (01.10): aynı ilke — kapalı kart tek satır özet, açık kartta kıssa+ders+dua
  const [acikKissa, setAcikKissa] = useState<string | null>(null);
  // ★ KELİME YENİLE (01.10): 61 kelimelik sahih havuzdan her seferinde rastgele 15 kart — sürekli değişsin
  const [kelimeKartlari, setKelimeKartlari] = useState<KelimeKart[]>([]);
  const kelimeYenile = React.useCallback(() => {
    const havuz = [...KELIME_KARTLARI];
    for (let i = havuz.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [havuz[i], havuz[j]] = [havuz[j], havuz[i]]; }
    setKelimeKartlari(havuz.slice(0, 15));
    setKartCevrildi(null);
  }, []);
  React.useEffect(() => { if (sekme === "kelime") kelimeYenile(); }, [sekme, kelimeYenile]);
  // ★ Hoca karşılaştırma state'leri (madde 41)
  // ★ Kitaplık (madde 56) — sekme açılınca taze okunur
  const [kitaplikVeri, setKitaplikVeri] = useState<{ isaretler: string[]; notlar: KitaplikNot[] }>({ isaretler: [], notlar: [] });
  const [camiKonum, setCamiKonum] = useState("");
  const [camiAranan, setCamiAranan] = useState<string | null>(null);
  const [hocaAyet, setHocaAyet] = useState<number>(0); // seçili ayet index'i
  const [hocaIdx, setHocaIdx] = useState<number>(0);   // çalan kari index'i
  const [hocaCaliyor, setHocaCaliyor] = useState(false);
  const hocaAudioRef = React.useRef<HTMLAudioElement | null>(null);
  if (!hocaAudioRef.current && typeof Audio !== "undefined") { hocaAudioRef.current = new Audio(); hocaAudioRef.current.preload = "none"; }

  const hocaCal = (kariIdx: number) => {
    const a = hocaAudioRef.current;
    const ayet = HOCA_KARSILASTIRMA_AYETLER[hocaAyet];
    if (!a || !ayet) return;
    a.pause();
    a.src = everyAyetUrl(KARILER[kariIdx].id, ayet.sure, ayet.ayet);
    setHocaIdx(kariIdx);
    setHocaCaliyor(true);
    a.play().catch(() => setHocaCaliyor(false));
  };
  const hocaDurdur = () => {
    hocaAudioRef.current?.pause();
    setHocaCaliyor(false);
  };
  React.useEffect(() => () => { hocaAudioRef.current?.pause(); }, []);

  const q = arama.trim().toLocaleLowerCase("tr");

  const filtreliHadisler = useMemo(
    () => HADIS_BANKASI.filter((h) => (hadisTema === "tumu" || h.tema === hadisTema) && (!q || h.metin.toLocaleLowerCase("tr").includes(q) || h.kaynak.toLocaleLowerCase("tr").includes(q))),
    [hadisTema, q],
  );
  // ★ KÜLLİYAT ARAMASI (28.09): yerel bankada sonuç yoksa Buhârî+Müslim külliyatı
  //   /api/hadis/ara'dan çekilir (dorar.net + opsiyonel sunnah.com). "aile" gibi
  //   yerel bankada olmayan kelimelerde artık boş değil, külliyattan sonuç gelir.
  const [kuliyatYukleniyor, setKuliyatYukleniyor] = useState(false);
  const [kuliyatSonuc, setKuliyatSonuc] = useState<Array<{ metin: string; kaynak: string; derece: string; kitap: string; dil: string }>>([]);
  React.useEffect(() => {
    if (sekme !== "hadis" || q.length < 2 || filtreliHadisler.length > 0) { setKuliyatSonuc([]); setKuliyatYukleniyor(false); return; }
    let canli = true;
    setKuliyatYukleniyor(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/hadis/ara?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        if (canli) setKuliyatSonuc(Array.isArray(data?.sonuclar) ? data.sonuclar : []);
      } catch { if (canli) setKuliyatSonuc([]); }
      finally { if (canli) setKuliyatYukleniyor(false); }
    }, 400); // debounce — her tuşta istek atılmaz
    return () => { canli = false; clearTimeout(t); };
  }, [sekme, q, filtreliHadisler.length]);
  const filtreliKissalar = useMemo(() => KISSA_LISTESI.filter((k) => !q || k.ad.toLocaleLowerCase("tr").includes(q) || k.ozet.toLocaleLowerCase("tr").includes(q)), [q]);
  const filtreliSorular = useMemo(() => SORU_CEVAP_ARŞIVI.filter((s) => !q || s.soru.toLocaleLowerCase("tr").includes(q) || s.cevap.toLocaleLowerCase("tr").includes(q)), [q]);
  // ★ 01.10: arama ad + numara + konu/açıklama metnine bakar
  const filtreliSureler = useMemo(() => SURE_BİLGİLERİ.filter((s) => !q || s.ad.toLocaleLowerCase("tr").includes(q) || s.konu.toLocaleLowerCase("tr").includes(q) || (s.aciklama ?? "").toLocaleLowerCase("tr").includes(q) || String(s.n) === q), [q]);
  const filtreliDuaRehber = useMemo(() => DUA_REHBERİ.filter((d) => !q || d.durum.toLocaleLowerCase("tr").includes(q)), [q]);
  // ★ SESLİ DUA TAKİBİ (madde 58) — okundu işaretleri refresh için
  const [duaOkunduTick, setDuaOkunduTick] = useState(0);

  if (!open) return null;

  return (
    <Modal title={tt("v2KesfetTitle")} sub={tt("v2KesfetSub")} onClose={onClose} wide>
      {/* Sekmeler */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SEKMELER.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setSekme(s.id); setArama(""); setKartCevrildi(null); setAcikSure(null); setAcikKissa(null); if (s.id === "kitaplik") setKitaplikVeri(kitaplikOku()); }}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${sekme === s.id ? "text-black shadow-md" : "glass-soft text-white/55 hover:text-white"}`}
            style={sekme === s.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Arama (kelime kartları hariç — kendi akışı var) */}
      {sekme !== "kelime" && (
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Ara…" className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30" />
        </div>
      )}

      {/* ── 18: HADİS BANKASI ── */}
      {sekme === "hadis" && (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {HADIS_TEMALARI.map((t) => (
              <button key={t.id} type="button" onClick={() => setHadisTema(t.id)}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hadisTema === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={hadisTema === t.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtreliHadisler.map((h, i) => {
              const dr = h.derece ? HADIS_DERECE_ETIKETI[h.derece] : null;
              return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                <p className="text-[11px] leading-relaxed text-white/85">"{h.metin}"</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <p className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {h.kaynak}</p>
                  {dr && (
                    <span
                      title={dr.aciklama}
                      className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${
                        h.derece === "sahih" ? "bg-emerald-500/20 text-emerald-300" :
                        h.derece === "hasan" ? "bg-sky-500/20 text-sky-300" :
                        "bg-amber-500/20 text-amber-300"}`}
                    >
                      {dr.label}
                    </span>
                  )}
                </div>
              </div>
              );
            })}
            {filtreliHadisler.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-[11px] text-white/40">Yerel bankada bulunamadı — külliyatta aranıyor…</p>
                {kuliyatYukleniyor && <p className="mt-2 text-[10px] text-white/30">📚 Buhârî + Müslim taranıyor</p>}
                {!kuliyatYukleniyor && kuliyatSonuc.length > 0 && (
                  <p className="mt-1 text-[9.5px] text-emerald-300">✓ {kuliyatSonuc.length} hadis bulundu — aşağıda</p>
                )}
                {!kuliyatYukleniyor && kuliyatSonuc.length === 0 && (
                  <p className="mt-1 text-[9.5px] text-white/30">Külliyatta da bulunamadı — farklı bir kelime dene</p>
                )}
              </div>
            )}
            {/* ★ KÜLLİYAT SONUÇLARI — Buhârî/Müslim'den gelen hadisler (derece etiketiyle) */}
            {kuliyatSonuc.map((h, i) => (
              <div key={`k-${i}`} className="rounded-xl border border-amber-400/20 bg-amber-500/[.04] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[10.5px] leading-relaxed ${h.dil === "ar" ? "text-right font-arabic text-[13px]" : "text-white/80"}`} dir={h.dil === "ar" ? "rtl" : undefined}>
                    {h.metin}
                  </p>
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] font-black text-emerald-300">
                    {h.derece === "sahih" ? "Sahih" : h.derece === "hasan" ? "Hasan" : h.derece === "zayif" ? "Zayıf" : "Külliyat"}
                  </span>
                </div>
                <p className="mt-1.5 text-[8.5px] text-white/40">— {h.kaynak}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 19: KISSA KÖŞESİ — akordeon (01.10): başlığa dokun → aç/kapa; kapalı tek satır, açık tam kıssa+ders+dua ── */}
      {sekme === "kissa" && (
        <div className="space-y-1.5">
          {filtreliKissalar.map((k) => {
            const acik = acikKissa === k.ad;
            return (
              <div key={k.ad} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
                <button
                  type="button"
                  aria-expanded={acik}
                  onClick={() => setAcikKissa(acik ? null : k.ad)}
                  className="flex w-full items-center gap-2 p-3 text-left"
                >
                  <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{k.sure}</span>
                  <h4 className="min-w-0 truncate text-[12px] font-black text-white/90">{k.ad}</h4>
                  <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
                </button>
                {!acik && <p className="truncate px-3 pb-3 text-[10px] leading-relaxed text-white/50">{k.ozet}</p>}
                {acik && (
                  <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                    <p className="text-[10.5px] leading-relaxed text-white/70">{k.ozet}</p>
                    <p className="mt-2 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[9.5px] leading-relaxed text-emerald-200">💡 {k.ders}</p>
                    {/* ★ KISSANIN DUASI (28.09) — kıssanın sonunda, kıssanın ruhuyla ilgili okunacak dua */}
                    <p className="mt-2 rounded-lg px-2.5 py-1.5 text-[9.5px] leading-relaxed" style={{ background: "rgba(215,170,82,.08)", color: "var(--accent-2)" }}>
                      <span className="font-black">🤲 Bu kıssanın duası:</span> {k.dua}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {filtreliKissalar.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">Aradığın kıssa listede yok — başka bir ad dene.</p>}
          <p className="pt-1 text-center text-[8px] text-white/25">{filtreliKissalar.length} kıssa · detay için karta dokun</p>
        </div>
      )}

      {/* ── 20: SORU-CEVAP ── */}
      {sekme === "soru" && (
        <div className="space-y-2">
          {/* ★ İSLAM'IN 5 ŞARTI — MEZHEPLERE GÖRE FIKHİ SORU-CEVAP (28.09, kullanıcı kararı) */}
          <p className="mt-1 mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">🕌 İslam'ın 5 Şartı — mezheplere göre fıkhi soru-cevap</p>
          {BES_SART_SORULARI.filter((b) => !q || b.soru.toLocaleLowerCase("tr").includes(q) || b.cevaplar.some((c) => c.metin.toLocaleLowerCase("tr").includes(q)) || b.sart.toLocaleLowerCase("tr").includes(q)).map((b, bi) => (
            <div key={`bs-${bi}`} className="rounded-xl border border-emerald-400/20 bg-emerald-500/[.04] p-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black text-emerald-300">{b.sart}</span>
                <p className="text-[11.5px] font-black text-white/90">❓ {b.soru}</p>
              </div>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {b.cevaplar.map((c) => (
                  <div key={c.mezhep} className="rounded-lg border border-white/10 bg-white/[.03] p-2.5">
                    <p className="text-[9px] font-black" style={{ color: "var(--accent-2)" }}>{c.mezhep}</p>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{c.metin}</p>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {b.kaynak}</p>
            </div>
          ))}
          <p className="mt-3 rounded-xl bg-white/[.04] px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">Genel soru-cevap arşivi</p>
          {filtreliSorular.map((s, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
              <p className="text-[11.5px] font-black text-white/90">❓ {s.soru}</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/65">{s.cevap}</p>
              <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {s.kaynak} · Kesin hüküm için Diyanet İşleri Başkanlığı'na danışın</p>
            </div>
          ))}
          <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[9px] text-amber-200/80">⚠️ Buradaki cevaplar genel bilgi amaçlıdır — kendi fetvamızı vermeyiz, Diyanet'e yönlendiririz.</p>
        </div>
      )}

      {/* ── 21: KELİME KARTLARI (flashcard) ── */}
      {sekme === "kelime" && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2.5">
            <p className="text-[9px] text-white/40">Karta tıkla — anlamını gör · 🔊 ile okunuşu dinle · Kur'an'da en sık geçen kelimeler 🔤</p>
            <button type="button" onClick={kelimeYenile}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[.05] px-2.5 py-1 text-[9px] font-black text-white/70 transition hover:border-[color:var(--accent)] hover:text-white"
              title="Kartları yenile — havuzdan rastgele 15 kelime gelir">
              🔄 Yenile
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {kelimeKartlari.map((k, i) => (
              <div key={k.ar} className="relative">
                <button type="button" onClick={() => setKartCevrildi(kartCevrildi === i ? null : i)}
                  className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-1.5 text-center transition ${kartCevrildi === i ? "border-[color:var(--accent)] bg-amber-500/10" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}>
                  {kartCevrildi === i ? (
                    <>
                      <p className="text-[10.5px] font-black leading-tight text-amber-200">{k.tr}</p>
                      <p className="mt-0.5 px-1 text-[7px] leading-tight text-white/40">{k.ornek.slice(0, 26)}</p>
                    </>
                  ) : (
                    <p className="font-arabic text-lg text-white/90">{k.ar}</p>
                  )}
                </button>
                {/* ★ OKUNUŞ SESİ (28.09, kullanıcı kararı): tarayıcı TTS ile Arapça okunuş —
                    latin okunuş öncelikli okunur; cihaz Arapça sesi yoksa latin metin okunur */}
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); kelimeOku(k); }}
                  title={`Okunuşu dinle: ${k.okunus}`}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] shadow-md ring-1 ring-white/20 transition hover:scale-110 hover:bg-black/90"
                >🔊</button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[8px] text-white/25">Havuz: {KELIME_KARTLARI.length} kelime · her yenilemede rastgele {kelimeKartlari.length} kart</p>
        </>
      )}

      {/* ── 22: SURE BİLGİLERİ — akordeon (01.10): başlığa dokun → aç/kapa; kapalı kart tek satır konu, açık kart uzun açıklama+fazilet ── */}
      {sekme === "sure" && (
        <div className="space-y-1.5">
          {filtreliSureler.map((s) => {
            const acik = acikSure === s.n;
            const ayetSayisi = SURAHS.find((x) => x.n === s.n)?.count;
            return (
              <div key={s.n} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
                <button
                  type="button"
                  aria-expanded={acik}
                  onClick={() => setAcikSure(acik ? null : s.n)}
                  className="flex w-full items-center gap-2 p-3 text-left"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{s.n}</span>
                  <h4 className="text-[12px] font-black text-white/90">Sure {s.ad}</h4>
                  {ayetSayisi != null && <span className="text-[8.5px] font-bold text-white/35">{ayetSayisi} ayet</span>}
                  <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[8.5px] font-bold text-white/50">{s.inis}'de inmiştir</span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
                </button>
                {!acik && <p className="truncate px-3 pb-3 text-[10px] leading-relaxed text-white/50">{s.konu}</p>}
                {acik && (
                  <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] leading-relaxed text-white/60"><b className="text-white/80">Konu:</b> {s.konu}</p>
                    {s.aciklama && <p className="mt-1.5 text-[10px] leading-relaxed text-white/55">{s.aciklama}</p>}
                    <p className="mt-2 text-[10px] leading-relaxed text-emerald-200/80"><b>Fazilet:</b> {s.fazilet}</p>
                  </div>
                )}
              </div>
            );
          })}
          {filtreliSureler.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">Aradığın sure listede yok — başka bir ad dene.</p>}
          <p className="pt-1 text-center text-[8px] text-white/25">{filtreliSureler.length} sure · detay için karta dokun</p>
        </div>
      )}

      {/* ── 28: NAMAZ ÖĞRETİCİ ── */}
      {sekme === "namaz" && (
        <div className="space-y-1.5">
          {NAMAZ_REHBERİ.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[.03] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-black text-white/90">{a.adim}</p>
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/60">{a.yazi}</p>
                {a.arapca && <p className="mt-1 text-right font-arabic text-[13px] leading-relaxed" style={{ color: "var(--accent-2)" }}>{a.arapca}</p>}
              </div>
            </div>
          ))}
          <p className="pt-1 text-center text-[8px] text-white/25">Vakit namazlarında rekat sayıları: Sabah 2 farz · Öğle 4 · İkindi 4 · Akşam 3 · Yatsı 4</p>
        </div>
      )}

      {/* ── 35: BEBEK DUASI — KALDIRILDI (kullanıcı kararı 28.09: doğum köşesi sitede olmayacak) ── */}

      {/* ── 61: DUA REHBERİ — SRP adım 4b: kesfetDuaBolumu ── */}
      {sekme === "dua" && <DuaRehberBolumu notify={notify} filtreliDuaRehber={filtreliDuaRehber} duaOkunduTick={duaOkunduTick} />}

      {/* ── 41: HOCA KARŞILAŞTIRMA ── */}
      {sekme === "hoca" && (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">Aynı ayeti farklı hocalardan dinle — "bu kelimeyi kim nasıl okuyor" 🎧</p>
          <div className="flex flex-wrap gap-1.5">
            {HOCA_KARSILASTIRMA_AYETLER.map((ay, i) => (
              <button key={i} type="button" onClick={() => { setHocaAyet(i); setHocaCaliyor(false); hocaAudioRef.current?.pause(); }}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hocaAyet === i ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={hocaAyet === i ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                {ay.sureAdi} {ay.ayet}
              </button>
            ))}
          </div>
          {(() => { const ay = HOCA_KARSILASTIRMA_AYETLER[hocaAyet]; return (
            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{ay.etiket}</p>
              <p className="mt-0.5 text-[11px] font-bold text-white/85">{ay.sureAdi} Suresi · {ay.ayet}. Ayet</p>
              <div className="mt-2.5 grid max-h-[320px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {KARILER.map((k, i) => (
                  <button key={k.id} type="button" onClick={() => hocaCaliyor && hocaIdx === i ? hocaDurdur() : hocaCal(i)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] font-bold transition ${hocaIdx === i && hocaCaliyor ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40" : "bg-white/5 text-white/65 hover:bg-white/10"}`}>
                    <span className="text-sm">{hocaIdx === i && hocaCaliyor ? "⏸" : "▶"}</span>
                    <span className="flex-1 truncate">{k.ad}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[8px] text-white/25">Ses kaynağı: everyayah.com · ayet bazlı kayıtlar</p>
            </div>
          ); })()}
        </div>
      )}

      {/* ── 47: CAMİ BULUCU ── */}
      {sekme === "cami" && (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">Bulunduğun yerin veya aradığın şehrin camilerini haritada gör 📍</p>
          <div className="flex gap-2">
            <input
              value={camiKonum}
              onChange={(e) => setCamiKonum(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && camiKonum.trim()) setCamiAranan(camiKonum.trim()); }}
              placeholder="Şehir/ilçe yaz — örn. İstanbul Fatih..."
              className="glass-soft flex-1 rounded-xl px-3 py-2.5 text-[11px] outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => {
                if (!camiKonum.trim()) {
                  // Konum izni varsa koordinat bazlı ara, yoksa şehir iste
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => { try { localStorage.setItem("nur_konum_izin", "1"); } catch { /* yoksay */ } setCamiAranan(`${pos.coords.latitude},${pos.coords.longitude}`); },
                      () => notify?.("⚠️ Konum izni verilmedi — şehir adı yazarak arayabilirsin"),
                      { timeout: 8000 },
                    );
                  } else notify?.("⚠️ Tarayıcın konumu desteklemiyor — şehir adı yaz");
                } else setCamiAranan(camiKonum.trim());
              }}
              className="shrink-0 rounded-xl px-3.5 py-2.5 text-[10px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Ara
            </button>
          </div>
          {camiAranan && (
            <>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <iframe
                  title="Cami haritası"
                  src={camiHaritaUrl(camiAranan)}
                  className="h-[260px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href={camiListeUrl(camiAranan)} target="_blank" rel="noopener noreferrer" className="block rounded-xl glass-soft py-2.5 text-center text-[10px] font-bold text-white/60 transition hover:text-white">
                📋 Liste görünümünde aç (Google Maps)
              </a>
            </>
          )}
          {!camiAranan && <p className="rounded-xl bg-white/[.03] px-3 py-3 text-center text-[9.5px] leading-relaxed text-white/45">Şehir yazıp Enter'a bas ya da <b className="text-white/70">Ara</b>'ya tıklayıp konum izni ver — yakınınızdaki camiler haritada listelenir.</p>}
        </div>
      )}

      {/* ── 12: KANAL REHBERİ ── */}
      {sekme === "rehber" && (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">Ürettiğin videolarla büyümen için kanal ipuçları 🚀</p>
          {KANAL_REHBERI.map((k, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[7.5px] font-black ${k.kategori === "YouTube" ? "bg-red-500/15 text-red-300" : k.kategori === "Instagram" ? "bg-pink-500/15 text-pink-300" : "bg-white/10 text-white/60"}`}>{k.kategori}</span>
                <h4 className="text-[11px] font-black text-white/90">{k.baslik}</h4>
              </div>
              <p className="mt-1 text-[9.5px] leading-relaxed text-white/60">{k.metin}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 48: TECVİD REHBERİ ── */}
      {sekme === "tecvid" && (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">Tilavetin kuralları — her kural tanım + örnekle 🎓</p>
          {TECVID_KURALLARI.filter((t) => !q || t.baslik.toLocaleLowerCase("tr").includes(q) || t.tanim.toLocaleLowerCase("tr").includes(q)).map((t, i) => {
            const sv = TECVID_SEVIYE_ETIKETI[t.seviye];
            return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[11px] font-black text-white/90">{t.baslik}</h4>
                  <span className={`rounded-full px-1.5 py-0.5 text-[7.5px] font-black ${
                    t.seviye === "temel" ? "bg-emerald-500/20 text-emerald-300" :
                    t.seviye === "orta" ? "bg-sky-500/20 text-sky-300" :
                    "bg-fuchsia-500/20 text-fuchsia-300"
                  }`}>
                    {sv?.label ?? t.seviye}
                  </span>
                </div>
                <p className="mt-1 text-[9.5px] leading-relaxed text-white/65">{t.tanim}</p>
                <p className="mt-1.5 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-white/85" dir="rtl">{t.ornek}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 56: KİTAPLIĞIM ── */}
      {sekme === "kitaplik" && (
        <div className="space-y-3">
          {/* İşaretli ayetler */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">🔖 İşaretli Ayetler ({kitaplikVeri.isaretler.length})</p>
            {kitaplikVeri.isaretler.length === 0 ? (
              <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] text-white/40">Henüz işaret yok — Kur'an ekranında sureyi açıp ayetlerin yanındaki 🔖 simgesiyle işaretleyince burada birikir.</p>
            ) : (
              <div className="space-y-1">
                {kitaplikVeri.isaretler.map((k) => {
                  const [s, a] = k.split(":").map(Number);
                  return (
                    <div key={k} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[.02] px-3 py-1.5 text-[10px]">
                      <span className="font-bold text-white/80">{SURAHS[s - 1]?.name ?? s} · {a}. ayet</span>
                      <span className="text-[8.5px] text-white/35">{k}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Notlar (şifreli secureStore'dan okunur — AyetNotlariModal ile aynı kaynak) */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">📝 Notlarım ({kitaplikVeri.notlar.length})</p>
            {kitaplikVeri.notlar.length === 0 ? (
              <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] text-white/40">Not yok — menüden "Ayet Notlarım"a girip ilk notunu yaz.</p>
            ) : (
              <div className="space-y-1">
                {kitaplikVeri.notlar.slice(0, 10).map((n) => {
                  const [s, a] = n.k.split(":").map(Number);
                  return (
                    <div key={n.k} className="rounded-lg border border-white/10 bg-white/[.02] px-3 py-2">
                      <p className="text-[9px] font-black" style={{ color: "var(--accent-2)" }}>{SURAHS[s - 1]?.name ?? s} {n.k}</p>
                      <p className="mt-0.5 line-clamp-2 text-[9.5px] text-white/60">{n.metin}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* İndirilen videolar — IndexedDB'de saklananlar */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">🎬 İndirdiğin Videolar</p>
            <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] leading-relaxed text-white/45">İndirdiğin videolar cihazında (IndexedDB) saklanır — video üretim ekranının sonuç listesinden istediğin zaman tekrar indirebilirsin. Kitaplıkta liste boyutu cihazına göre gösterilir.</p>
          </div>
        </div>
      )}
    </Modal>
  );
};
