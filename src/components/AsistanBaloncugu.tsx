import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

// ════════════════════════════════════════════════════════
// ASİSTAN BALONCUĞU (19.10) — ÜCRETSİZ (AI'sız) DESTEK ASİSTANI
//
// Sağ altta yüzücü balon 🕌 → açınca mini sohbet penceresi.
// Beyin = asistanCevap.ts (kural motoru, cevap bankası).
// Yapay zekâ çağrısı YOK, sunucuya hiçbir istek YOK — tamamen local.
//
// ★ GÜVENLİK (kullanıcı emri): kişisel/admin/üye verisi ASLA gösterilmez;
//   motor tarafında sabit güvenlik cevabına yönlendirilir.
//
// ★ YERLEŞİM: PwaKurulumBanneri z-[88] bottom-right kullanıyor → balon
//   bottom-20 (mobil) / bottom-5 md (masaüstü) & z-[86] ile çakışmaz;
//   BugunHediye sol kolonundadır (bottom-left), çakışma yok.
// ════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import { asistanCevap, asistanRastgeleCipler, type AsistanSonuc, type AsistanSeviye } from "../asistan/asistanCevap";

/** ★ 19.10: PremiumModal + mailto açılış köprüsü — StudioApp bu prop'ları doldurur */
interface AsistanBaloncuguProps {
  /** üyelik satın alma panelini (PremiumModal, uyelik tab'i) açar */
  openPremiumUyelik: () => void;
  /** cüzdan/paket panelini (PremiumModal, jeton tab'i) açar */
  openPremiumCuzdan: () => void;
  /** ★ 22.10: üyenin plan seviyesi — "nelere sahibim" satış hat ifadesi
   *  (free→Pro öner, pro→Elit öner). Yoksa "free" varsayılır. */
  seviye?: AsistanSeviye;
}

interface Mesaj {
  kim: "ai" | "kullanici";
  metin: string;
  kural?: string;
  /** ★ cevapla gelen yönlendirme butonu ('uyelik'|'cuzdan'|'mail') */
  aksiyon?: AsistanSonuc["aksiyon"];
}

const ACIK_KEY = "nur_asistan_okundu"; // balon rozetini susturmak için

export const AsistanBaloncugu: React.FC<AsistanBaloncuguProps> = ({ openPremiumUyelik, openPremiumCuzdan, seviye = "free" }) => {
  const [acik, setAcik] = useState(false);
  const [rozet, setRozet] = useState(false);
  const [giris, setGiris] = useState("");
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([
    // ★ 20.10 (kullanıcı emri: "sadece sık sorular diye durmasın, güzel cevaplar
    //   versin, Nur Stüdyo asistanıyım size nasıl yardımcı olurum desin"):
    //   samimi, kendini-tanıtan karşılama — SSS kalıbı yok.
    { kim: "ai", metin: "Merhaba! 🌙 Ben Nûr Stüdyo Asistanıyım — size nasıl yardımcı olurum? Video üretimi, üyelik, jetonlar, paylaşım, Kur'an bölümü… aklınıza takılan ne varsa sorun, anında cevap hazır! ✨" },
  ]);
  const listeRef = useRef<HTMLDivElement>(null);

  // ★ 20.10: rastgele çipler — HER AÇILIŞTA ve sayfa yenilemesinde değişir
  const [cipler, setCipler] = useState<string[]>(() => asistanRastgeleCipler(3));
  const cipleriYenile = () => setCipler(asistanRastgeleCipler(3));

  // İlk ziyaret rozetini göster; açıldığında sustur
  useEffect(() => {
    try { if (!localStorage.getItem(ACIK_KEY)) setRozet(true); } catch { /* yut */ }
  }, []);

  // Yeni mesaj → otomatik aşağı kaydır
  useEffect(() => {
    const el = listeRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mesajlar, acik]);

  const gonder = (metin: string) => {
    const temiz = metin.trim();
    if (!temiz || temiz.length > 300) return; // uzun spam-pasta kalsın
    let sonuc: AsistanSonuc;
    try { sonuc = asistanCevap(temiz, seviye); } catch { return; } // motor hata etmesin — sessiz yut
    setMesajlar((onceki) => [
      ...onceki.slice(-40), // pencere şişmesin
      { kim: "kullanici", metin: temiz },
      { kim: "ai", metin: sonuc.cevap, kural: sonuc.kural, aksiyon: sonuc.aksiyon },
    ]);
    setGiris("");
  };

  const ac = () => {
    setAcik(true);
    setRozet(false);
    try { localStorage.setItem(ACIK_KEY, "1"); } catch { /* yut */ }
  };

  return (
    <>
      {/* ★ 19.10 ÇAKIŞMA REHBERİ: sağ-alt köşede Crisp deste balonu + PWA kurulum
          bandı (z-[88], 300px) kalıcı yerleşik; asistan SOL alt köşeye taşındı —
          BugunHediye (md:left-4, w-11 → sağ kenar 60px) balonunun SAĞINA
          (md:left-20 = 80px). Mobilde bottom-36 ile hediye/çerez balonlarının
          üstünde ayrı satırda. */}
      {!acik && (
        <button
          type="button"
          onClick={ac}
          className="fixed bottom-36 left-3 z-[86] flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition hover:scale-110 active:scale-95 md:bottom-4 md:left-20"
          style={{ background: "linear-gradient(135deg,#0f3d2e,var(--accent))", border: "1px solid rgba(215,170,82,.45)" }}
          title={ttX2610("asBalonTitle")}
          aria-label={ttX2610("asSohtai")}
        >
          <span className="text-xl" aria-hidden>🕌</span>
          {rozet && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-amber-300 ring-2 ring-black/40" />}
        </button>
      )}

      {/* Mini sohbet penceresi */}
      {acik && (
        <div
          className="fixed bottom-28 left-2 z-[90] flex max-h-[70vh] w-[calc(100vw-20px)] flex-col overflow-hidden rounded-2xl border shadow-2xl md:bottom-4 md:left-20 md:w-[340px]"
          style={{ background: "#0d1117", borderColor: "rgba(215,170,82,.35)" }}
          role="dialog"
          aria-label="Nûr Asistan Sohbet"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5" style={{ background: "linear-gradient(135deg,#0f3d2e,#072018)" }}>
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>🕌</span>
              <div>
                <p className="text-[12px] font-black text-white">Nûr Asistan</p>
                <p className="text-[8.5px] font-bold text-emerald-200/70">ttX2610("asUcretsiz")</p>
              </div>
            </div>
            <button type="button" onClick={() => setAcik(false)} className="text-white/50 transition hover:text-white" aria-label="Kapat">✕</button>
          </div>

          <div ref={listeRef} className="scrollbar-thin flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
            {mesajlar.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${m.kim === "ai" ? "self-start bg-white/[.06] text-white/85" : "self-end bg-emerald-500/25 text-emerald-50"}`}>
                {m.metin}
                {m.aksiyon === "uyelik" && (
                  <button
                    type="button"
                    onClick={() => { openPremiumUyelik(); setAcik(false); }}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10.5px] font-black text-black transition active:scale-95"
                    style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                  >
                    <span aria-hidden>💎</span> Üyelik Planlarını Gör
                  </button>
                )}
                {m.aksiyon === "cuzdan" && (
                  <button
                    type="button"
                    onClick={() => { openPremiumCuzdan(); setAcik(false); }}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10.5px] font-black text-black transition active:scale-95"
                    style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                  >
                    <span aria-hidden>⚡</span> Cüzdanı Aç — Paketler & Jetonlar
                  </button>
                )}
                {m.aksiyon === "mail" && (
                  <a
                    href="mailto:destek@nurstudyo.com"
                    onClick={() => setAcik(false)}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10.5px] font-black text-black transition active:scale-95"
                    style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                  >
                    <span aria-hidden>📧</span> Destek'e Yaz (E-posta)
                  </a>
                )}
              </div>
            ))}
            {/* ★ 20.10 Rastgele soru çipleri — her açılışta 3 farklı konudan,
                sayfa yenilemesinde değişir; 🎲 ile anında yenilenir (kullanıcı:
                "sürekli de değişsin, sayfa yenilendikçe soru değişsin") */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5 self-start">
              {cipler.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => gonder(s)}
                  className="rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[9.5px] font-bold text-white/70 transition hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={cipleriYenile}
                className="rounded-full border border-emerald-400/25 px-2 py-1 text-[9.5px] font-bold text-emerald-300/80 transition hover:bg-emerald-400/10 hover:text-emerald-200"
                title={ttX2610("asBaskaKipler")}
                aria-label={ttX2610("asBaskaKipler")}
              >
                🎲
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 px-2.5 py-2">
            <input
              type="text"
              value={giris}
              onChange={(e) => setGiris(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") gonder(giris); }}
              maxLength={300}
              placeholder={ttX2610("asPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.05] px-3 py-2 text-[11px] text-white placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none"
              aria-label="Soru yaz"
            />
            <button
              type="button"
              onClick={() => gonder(giris)}
              className="rounded-xl px-3 py-2 text-[10px] font-black text-black transition active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
              aria-label={ttX2610("asGonder")}
            >
              Gönder
            </button>
          </div>
        </div>
      )}
    </>
  );
};
