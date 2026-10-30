// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

// ════════════════════════════════════════════════════════
// KESFETSEKMELER.TSX — KesfetModal'dan taşındı (SRP adım 9, 09.10 2. tur)
// Büyük 5 sekme JSX bloğu: Hadis Bankası · Kıssa Köşesi · Soru-Cevap ·
//   Kelime Kartları (flashcard) · Sure Bilgileri. DAVRANIŞ BİREBİR AYNIDIR —
//   state modal'da kalır, burada saf görünümdür.
// ════════════════════════════════════════════════════════

import React from "react";
import { translate } from "../i18n";
import { ChevronDown } from "lucide-react";
import { HADIS_TEMALARI, HADIS_DERECE_ETIKETI } from "../data/hadisData";
import { KELIME_KARTLARI, type KelimeKart } from "../data/kelimeData";
import { SURAHS } from "../data/surahs";
import { SURE_ARAPCA } from "../data/sureArapca";
// ★ 29.10 SURE ADI 5 DİLDE (kullanıcı emri): sure bilgi kartlarında ad seçili dile döner
import { sureAdGorunum as sureAdX2910 } from "../data/surelerCokDil";
import { kelimeOku, bilinenKelimeIsaretle } from "./kesfetTemel";

// ── KELİME KARTI — KesfetModal'dan taşındı (birebir) ──────────
// Kelime kartı — günün kelimelerinde altın çerçeve; keşif kartlarında varsayılan kenar
// ★ 03.10: ✨ atölye butonu + ✓ bilinen tiki eklendi (atölye aktarımı otomatik tikler)
// ★ 04.10: title metinleri 5 dile — dil prop ile
function KelimeKarti({ k, cevrildi, cevir, altin, bilinen, bilinenToggle, atolyeye, dil = "tr" }: { k: KelimeKart; cevrildi: boolean; cevir: () => void; altin?: boolean; bilinen?: boolean; bilinenToggle?: () => void; atolyeye?: () => void; dil?: string }) {
  const ktt = (key: string): string => translate(dil, key);
  return (
    <div className="relative">
      <button type="button" onClick={cevir}
        className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-1.5 text-center transition ${cevrildi ? "border-[color:var(--accent)] bg-amber-500/10" : altin ? "border-white/25 bg-white/[.06] hover:border-white/40" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}
        style={altin && !cevrildi ? { borderColor: "var(--accent-2)", boxShadow: "0 0 10px rgba(215,170,82,.18)" } : undefined}>
        {cevrildi ? (
          <>
            <p className="text-[10.5px] font-black leading-tight text-amber-200">{k.tr}</p>
            {k.meal ? (
              <>
                {/* ★ 03.10: havuzdaki yeni kelimeler ayet ifadesi + meal satırıyla geliyor */}
                <p dir="rtl" className="mt-0.5 font-arabic text-[7.5px] leading-tight text-white/45 line-clamp-2">{k.ornek}</p>
                <p className="mt-0.5 px-1 text-[6.5px] leading-tight text-white/40 line-clamp-2">{k.meal}</p>
              </>
            ) : (
              <p className="mt-0.5 px-1 text-[7px] leading-tight text-white/40">{k.ornek.slice(0, 26)}</p>
            )}
          </>
        ) : (
          <p className="font-arabic text-lg text-white/90">{k.ar}</p>
        )}
      </button>
      {/* ★ OKUNUŞ SESİ (28.09, kullanıcı kararı): tarayıcı TTS ile Arapça okunuş —
          latin okunuş öncelikli okunur; cihaz Arapça sesi yoksa latin metin okunur */}
      <button type="button"
        onClick={(e) => { e.stopPropagation(); kelimeOku(k); }}
        title={`${ktt("ksOkunusDinle")} ${k.okunus}`}
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] shadow-md ring-1 ring-white/20 transition hover:scale-110 hover:bg-black/90"
      >🔊</button>
      {/* ★ ATÖLYEDE ÇALIŞ (03.10): bu kelimeyi Kelime Atölyesi'nde çalış — ayet+atmosfer öner, stüdyoya aktar */}
      {atolyeye && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); atolyeye(); }}
          title={ktt("ksAtolyedeCalis")}
          className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] shadow-md ring-1 ring-white/20 transition hover:scale-110 hover:bg-black/90"
        >✨</button>
      )}
      {/* ★ BİLDİM TİKİ (03.10): atölyeden stüdyoya aktarılan kelime yeşil tik alır; elle de işaretlenir/kaldırılır */}
      {bilinenToggle && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); bilinenToggle(); }}
          title={bilinen ? ktt("ksBilinenTitle") : ktt("ksOgrenTitle")}
          className={`absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shadow-md transition hover:scale-110 ${bilinen ? "bg-emerald-500 text-black ring-1 ring-emerald-300/60" : "bg-black/70 text-white/40 ring-1 ring-white/20 hover:bg-black/90"}`}
        >{bilinen ? "✓" : "＋"}</button>
      )}
    </div>
  );
}

// Kart anlamından atölye arama kelimesi — virgül/parantez öncesi ilk parça ("Rab (sahip…" → "Rab")
export function atolyeKelimeOner(d: KelimeKart): string {
  return d.tr.split(/[,(]/)[0].trim() || d.tr;
}

// ── 18: HADİS BANKASI ────────────────────────────────────────
export function HadisBolumu({
  tt, hadisTema, setHadisTema, hadisTemaAdi, filtreliHadisler,
  kuliyatYukleniyor, kuliyatSonuc, dereceAdi,
}: {
  tt: (k: string) => string;
  hadisTema: string;
  setHadisTema: (id: string) => void;
  hadisTemaAdi: (id: string) => string;
  filtreliHadisler: Array<{ metin: string; kaynak: string; derece?: string }>;
  kuliyatYukleniyor: boolean;
  kuliyatSonuc: Array<{ metin: string; kaynak: string; derece: string; dil: string }>;
  dereceAdi: (d?: string) => string;
}) {
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {HADIS_TEMALARI.map((t) => (
          <button key={t.id} type="button" onClick={() => setHadisTema(t.id)}
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hadisTema === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
            style={hadisTema === t.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
            {t.emoji} {hadisTemaAdi(t.id)}
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
                  {dereceAdi(h.derece)}
                </span>
              )}
            </div>
          </div>
          );
        })}
        {filtreliHadisler.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-[11px] text-white/40">{tt("ksYerelBulunamadi")}</p>
            {kuliyatYukleniyor && <p className="mt-2 text-[10px] text-white/30">{tt("ksKulliyatTaranıyor")}</p>}
            {!kuliyatYukleniyor && kuliyatSonuc.length > 0 && (
              <p className="mt-1 text-[9.5px] text-emerald-300">✓ {kuliyatSonuc.length} hadis bulundu — aşağıda</p>
            )}
            {!kuliyatYukleniyor && kuliyatSonuc.length === 0 && (
              <p className="mt-1 text-[9.5px] text-white/30">{tt("ksKulliyatYok")}</p>
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
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] font-black text-emerald-300">                      {dereceAdi(h.derece) || ""}
              </span>
            </div>
            <p className="mt-1.5 text-[8.5px] text-white/40">— {h.kaynak}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 19: KISSA KÖŞESİ — akordeon ──────────────────────────────
export function KissaBolumu({
  tt, filtreliKissalar, acikKissa, setAcikKissa,
}: {
  tt: (k: string) => string;
  filtreliKissalar: Array<{ ad: string; sure: string; ozet: string; ders: string; dua: string; kaynak?: string }>;
  acikKissa: string | null;
  setAcikKissa: (v: string | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      {filtreliKissalar.map((k) => {
        const acik = acikKissa === k.ad;
        return (
          <div key={k.ad} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              data-kissa="1"
              aria-expanded={acik}
              onClick={() => setAcikKissa(acik ? null : k.ad)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{k.sure}</span>
              <h4 className="min-w-0 truncate text-[12px] font-black text-white/90">{k.ad}</h4>
              <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikKissa(k.ad)} title={tt("ksGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {k.ozet}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                <p className="text-[10.5px] leading-relaxed text-white/70">{k.ozet}</p>
                <p className="mt-2 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[9.5px] leading-relaxed text-emerald-200">💡 {k.ders}</p>
                {/* ★ KISSANIN DUASI (28.09) — kıssanın sonunda, kıssanın ruhuyla ilgili okunacak dua */}
                <p className="mt-2 rounded-lg px-2.5 py-1.5 text-[9.5px] leading-relaxed" style={{ background: "rgba(215,170,82,.08)", color: "var(--accent-2)" }}>
                  <span className="font-black">{tt("ksKissaDuasi")}</span> {k.dua}
                </p>
                {/* ★ 25.10 (kullanıcı emri): sahih kaynak satırı — kıssanın altında */}
                {k.kaynak && <p className="mt-2 text-[8.5px] font-bold" style={{ color: "var(--accent-2)" }}>📚 {k.kaynak}</p>}
              </div>
            )}
          </div>
        );
      })}
      {filtreliKissalar.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">{tt("ksKissaYok")}</p>}
      <p className="pt-1 text-center text-[8px] text-white/25">{tt("ksKissaSayaci").replace("{n}", String(filtreliKissalar.length))}</p>
    </div>
  );
}

// ── 20: SORU-CEVAP — akordeon (28.09 mezhepli + genel arşiv) ──
// ★ 30.10 (kullanıcı emri "şıkları sola koy alt alta tıklayınca renk değişsin geniş olsun"):
//   Görüşler 1 sütun, sola dayalı, tam genişlik; seçince renk vurgulanır.
export function SoruBolumu({
  tt, filtreliBesSart, filtreliSorular,
  acikSoru, setAcikSoru, acikGenelSoru, setAcikGenelSoru,
}: {
  tt: (k: string) => string;
  filtreliBesSart: Array<{ sart: string; soru: string; kaynak: string; cevaplar: Array<{ mezhep: string; metin: string }> }>;
  filtreliSorular: Array<{ soru: string; cevap: string; kaynak: string }>;
  acikSoru: number | null;
  setAcikSoru: (v: number | null) => void;
  acikGenelSoru: number | null;
  setAcikGenelSoru: (v: number | null) => void;
}) {
  const [secilen, setSecilen] = React.useState<string | null>(null);
  return (
    <div className="space-y-1.5">
      {/* ★ İSLAM'IN 5 ŞARTI — MEZHEPLERE GÖRE FIKHİ SORU-CEVAP (28.09, kullanıcı kararı) */}
      <p className="mt-1 mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ks5Sart")}</p>
      {filtreliBesSart.map((b, bi) => {
        const acik = acikSoru === bi;
        return (
          <div key={`bs-${bi}`} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              aria-expanded={acik}
              onClick={() => setAcikSoru(acik ? null : bi)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black text-emerald-300">{b.sart}</span>
              <h4 className="min-w-0 truncate text-[11.5px] font-black text-white/90">❓ {b.soru}</h4>
              <span className="ml-auto shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-bold text-white/45">{b.cevaplar.length} görüş</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikSoru(bi)} title={tt("ksGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {b.cevaplar[0]?.mezhep}: {b.cevaplar[0]?.metin}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                {/* ★ 30.10: cevaplar TEK sütun — sola dayalı, tam genişlik; seçince renk vurgulanır */}
                <div className="flex flex-col items-stretch gap-1.5">
                  {b.cevaplar.map((c) => {
                    const k = `bs-${bi}-${c.mezhep}`;
                    const sec = secilen === k;
                    return (
                      <button
                        key={c.mezhep}
                        type="button"
                        onClick={() => setSecilen(sec ? null : k)}
                        className={`w-full rounded-lg border p-2.5 text-left transition ${sec ? "border-emerald-400/40 bg-emerald-500/[.08]" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}
                      >
                        <p className="text-[9px] font-black" style={{ color: sec ? "#6ee7b7" : "var(--accent-2)" }}>{sec ? "✓ " : ""}{c.mezhep}</p>
                        <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{c.metin}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {b.kaynak}</p>
              </div>
            )}
          </div>
        );
      })}
      <p className="mt-3 rounded-xl bg-white/[.04] px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">{tt("ksGenelArsiv")}</p>
      {filtreliSorular.map((s, i) => {
        const acik = acikGenelSoru === i;
        return (
          <div key={i} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              aria-expanded={acik}
              onClick={() => setAcikGenelSoru(acik ? null : i)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <h4 className="min-w-0 truncate text-[11.5px] font-black text-white/90">❓ {s.soru}</h4>
              <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikGenelSoru(i)} title={ttX2610("ksfGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {s.cevap}
              </button>
            )}
            {acik && (
              <div className="border-t border-white/10 px-3.5 pb-3.5 pt-2.5">
                <p className="text-[10px] leading-relaxed text-white/65">{s.cevap}</p>
                <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {s.kaynak} · Kesin hüküm için Diyanet İşleri Başkanlığı'na danışın</p>
              </div>
            )}
          </div>
        );
      })}
      <p className="pt-1 text-center text-[8px] text-white/25">{filtreliBesSart.length} mezhepli soru · {filtreliSorular.length} genel soru · detay için karta dokun</p>
      <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[9px] text-amber-200/80">{ttX2610("ksfUyari")} yönlendiririz.</p>
    </div>
  );
}

// ── 21: KELİME KARTLARI (flashcard) ──────────────────────────
export function KelimeBolumu({
  tt, lang, gununKelimeleri, kartCevrildi, setKartCevrildi, bilinenSet, atolyeAc,
  kelimeKartlari, kelimeYenile,
}: {
  tt: (k: string) => string;
  lang: string;
  gununKelimeleri: KelimeKart[];
  kartCevrildi: string | null;
  setKartCevrildi: (v: string | null) => void;
  bilinenSet: Set<string>;
  atolyeAc?: (kelime: string, kelimeAr: string) => void;
  kelimeKartlari: KelimeKart[];
  kelimeYenile: () => void;
}) {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-lg px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{ttX2610("ksfGunun")}</span>
        <p className="text-[9px] text-white/40">{ttX2610("ksfGununNot")}</p>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {gununKelimeleri.map((k) => (
          <KelimeKarti key={k.ar} k={k} altin cevrildi={kartCevrildi === k.ar} cevir={() => setKartCevrildi(kartCevrildi === k.ar ? null : k.ar)} dil={lang}
            bilinen={bilinenSet.has(k.ar)} bilinenToggle={() => bilinenKelimeIsaretle(k.ar, !bilinenSet.has(k.ar))}
            atolyeye={atolyeAc ? () => atolyeAc(atolyeKelimeOner(k), k.ar) : undefined} />
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-center gap-2.5">
        <p className="text-[9px] text-white/40">{tt("ksKesifKartNot")}</p>
        <button type="button" onClick={kelimeYenile}
          className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[.05] px-2.5 py-1 text-[9px] font-black text-white/70 transition hover:border-[color:var(--accent)] hover:text-white"
          title={tt("ksYenileTitle")}>
          {tt("ksYenile")}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {kelimeKartlari.map((k) => (
          <KelimeKarti key={k.ar} k={k} cevrildi={kartCevrildi === k.ar} cevir={() => setKartCevrildi(kartCevrildi === k.ar ? null : k.ar)} dil={lang}
            bilinen={bilinenSet.has(k.ar)} bilinenToggle={() => bilinenKelimeIsaretle(k.ar, !bilinenSet.has(k.ar))}
            atolyeye={atolyeAc ? () => atolyeAc(atolyeKelimeOner(k), k.ar) : undefined} />
        ))}
      </div>
      <p className="mt-3 text-center text-[8px] text-white/25">{tt("ksHavuzNot").replace("{toplam}", String(KELIME_KARTLARI.length)).replace("{bugun}", String(gununKelimeleri.length)).replace("{kesif}", String(kelimeKartlari.length))}</p>
    </>
  );
}

// ── 22: SURE BİLGİLERİ — akordeon ────────────────────────────
export function SureBolumu({
  filtreliSureler, acikSure, setAcikSure, q,
}: {
  filtreliSureler: Array<{ n: number; ad: string; inis: string; konu: string; aciklama?: string; fazilet: string }>;
  acikSure: number | null;
  setAcikSure: (v: number | null) => void;
  q: string;
}) {
  return (
    <div className="space-y-1.5">
      {filtreliSureler.map((s) => {
        const acik = acikSure === s.n;
        const ayetSayisi = SURAHS.find((x) => x.n === s.n)?.count;
        return (
          <div key={s.n} className={`overflow-hidden rounded-xl border transition-colors ${acik ? "border-white/20 bg-white/[.05]" : "border-white/10 bg-white/[.03] hover:bg-white/[.05]"}`}>
            <button
              type="button"
              aria-expanded={acik}
              onClick={() => setAcikSure(acik ? (q ? s.n : null) : s.n)}
              className="flex w-full items-center gap-2 p-3 text-left"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{s.n}</span>
              <h4 className="text-[12px] font-black text-white/90">{sureAdX2910(s.n, s.ad, (typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr") as Parameters<typeof sureAdX2910>[2])}</h4>
              {/* ★ 03.10: Arapça ad kartta görünsün — akıllı aramaya ipucu */}
              {SURE_ARAPCA[s.n] && <span dir="rtl" className="font-arabic text-[11px] text-white/40">{SURE_ARAPCA[s.n]}</span>}
              {ayetSayisi != null && <span className="text-[8.5px] font-bold text-white/35">{ayetSayisi} ayet</span>}
              <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[8.5px] font-bold text-white/50">{s.inis}'de inmiştir</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
            </button>
            {!acik && (
              <button type="button" onClick={() => setAcikSure(s.n)} title={ttX2610("ksfGenislet")} className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
                {s.konu}
              </button>
            )}
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
      {filtreliSureler.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">{ttX2610("ksfSureBulunamadi")}umara yaz.</p>}
      <p className="pt-1 text-center text-[8px] text-white/25">{filtreliSureler.length} sure · detay için karta dokun</p>
    </div>
  );
}
