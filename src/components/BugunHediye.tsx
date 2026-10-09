// ════════════════════════════════════════════════════════
// BUGÜNÜN HEDİYESİ — yol haritası madde 14
// Günlük girişte küçük sürpriz: sahih hadis, zikir önerisi, ara sıra
// +1 deneme video hakkı. localStorage ile günde BİR kez görünür,
// ertesi gün yeniden açılır → günlük dönüş alışkanlığı.
// Zikirmatik/Hatim paneliyle aynı ruh: cihazda saklanır, sunucuya gitmez.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, X } from "lucide-react";
import { grantMicroUnlock } from "../tier";
import { translate, type Lang } from "../i18n";
import { HEDIYE_HADIS_COKDIL, HEDIYE_HAFIZLIK_COKDIL, HEDIYE_ZIKIR_COKDIL } from "../data/hediyeCokDil";

const HEDIYE_GUN_KEY = "nur_hediye_gun";       // son alınan gün "YYYY-MM-DD"
const HEDIYE_VIDEO_KEY = "nur_hediye_video_hakki"; // bu gün video hediyesi alındı işareti (gösterim amaçlı)

const bugunStr = () => new Date().toISOString().slice(0, 10);

/** Gün numarasından deterministik seçim (her gün farklı içerik) */
function gunSecimi<T>(havuz: T[], salt: number): T {
  const idx = (salt * 7919 + 104729) % havuz.length; // asal çarpan — düzgün dağılım
  return havuz[Math.abs(idx)];
}

export interface BugunHediyeProps {
  /** Video üretim hakkına ekstra deneme verir (StudioApp'teki hakka dokunmadan, ayrı kasa) */
  notify: (msg: string) => void;
  /** Header'daki üretim hakkı sayacını anında tazelemek için — hak gerçek cüzdana yazıldıktan sonra çağrılır */
  onHakDegisti?: () => void;
  /** ★ GİRİŞ KONTROLÜ (04.10): hediye YALNIZ girişli kullanıcılara verilir —
   *  girişsiz ziyaretçiye gösterilmez (kullanıcı kararı). Email oturumdan gelir. */
  userEmail?: string | null;
  /** ★ SEÇİLİ DİL (05.10): hadis tercümesi/zikir/hafızlık metinleri bu dilde;
   *  hadisin ASLI ve kaynak adı (Buhari...) hiçbir dile çevrilmez. */
  lang?: Lang;
}

export const BugunHediye: React.FC<BugunHediyeProps> = ({ notify, onHakDegisti, userEmail, lang = "tr" }) => {
  const [acik, setAcik] = useState(false);
  const [hediye, setHediye] = useState<{ tur: "hadis" | "zikir" | "video" | "hafizlik"; baslik: string; metin: string; kaynak?: string } | null>(null);
  const [hakkiAlindi, setHakkiAlindi] = useState(false);
  const [alindi, setAlindi] = useState<{ tur: "hadis" | "zikir" | "video" | "hafizlik"; baslik: string; metin: string; kaynak?: string } | null>(null);
  // ★ ALINAN HEDİYE GÖSTERİMİ: "Al" dedikten sonra kutu kapanıp ne aldığı kayboluyordu —
  //   artık onay ekranında NE alındığı açıkça yazıyor (kullanıcı kararı 28.09).

  // ── Gün değişince hediyeyi hazırla (ama sadece butonla açılır) ──
  // ★ 5 DİL (05.10): içerik havuzları hediyeCokDil.ts'ten, seçili dilde;
  //   sıra birebir korunur → aynı gün tüm dillerde AYNI hadis/zikir gelir.
  //   Hadis metni = seçilen dilde TERÇÜME; kaynak adı asıl kalır.
  useEffect(() => {
    try {
      const son = localStorage.getItem(HEDIYE_GUN_KEY);
      const bugun = bugunStr();
      if (son === bugun) return; // bugün alındı — bir daha gösterme
      const salt = Math.floor(Date.now() / 86_400_000);
      const tur = salt % 10; // 10 günde 1 video hakkı, kalanı içerik hediyesi
      const tt = (k: string): string => translate(lang, k);
      if (tur === 0) {
        setHediye({ tur: "video", baslik: tt("bhVideoBaslik"), metin: tt("bhVideoMetin") });
      } else if (tur % 2 === 1) {
        const h = gunSecimi(HEDIYE_HADIS_COKDIL[lang] ?? HEDIYE_HADIS_COKDIL.tr, salt);
        setHediye({ tur: "hadis", baslik: tt("bhHadisBaslik"), metin: h.metin, kaynak: h.kaynak });
      } else if (salt % 4 === 3) {
        const h = gunSecimi(HEDIYE_HAFIZLIK_COKDIL[lang] ?? HEDIYE_HAFIZLIK_COKDIL.tr, salt);
        setHediye({ tur: "hafizlik", baslik: h.baslik, metin: h.metin, kaynak: h.kaynak });
      } else {
        const z = gunSecimi(HEDIYE_ZIKIR_COKDIL[lang] ?? HEDIYE_ZIKIR_COKDIL.tr, salt);
        setHediye({ tur: "zikir", baslik: tt("bhZikirBaslik"), metin: z });
      }
    } catch { /* localStorage kapalıysa sessizce atla */ }
  }, []);

  // ── Al: günü damgala, video ise hakkı biriktir; onay ekranında ne alındığını göster ──
  const ttH = (k: string): string => translate(lang, k);
  const al = useCallback(() => {
    if (!hediye) return;
    try {
      localStorage.setItem(HEDIYE_GUN_KEY, bugunStr());
      if (hediye.tur === "video") {
        // ★ GERÇEK HAKKİYET: hediye artık sunucu senkronunun EZEMEDIĞİ gerçek
        //   mikro-kilit mekanizmasıyla veriliyor: Tam Sürüm modu 24 saat ücretsiz.
        //   ESKİ HATA: sahte localStorage anahtarına (nur_hediye_video_hakki) yazılıyordu,
        //   onu OKUYAN kod yoktu → kullanıcı hak aldım sanıyor, hiçbir şey değişmiyordu.
        //   NOT: grantPack kullanılmadı çünkü girişli kullanıcıda /api/payments/wallet
        //   30 sn'de bir cüzdanı EZEREK yazıyor → local hediye silinirdi (yeni sahtelik).
        //   grantMicroUnlock("full_mode") ise useTier.tryUnlockFullMode'un GERÇEK
        //   tükettiği, wallet sync'inin dokunmadığı kanıtlı mekanizmadır.
        grantMicroUnlock("full_mode");
        try { localStorage.setItem(HEDIYE_VIDEO_KEY, "1"); } catch {}
        setHakkiAlindi(true);
        notify(ttH("bhVideoBildirim"));
        try { onHakDegisti?.(); } catch {}
      } else {
        notify(ttH("bhIcerikBildirim"));
      }
    } catch { /* yut */ }
    // ★ Kutuyu kapatma — "ne aldım?" ekranına geç (kullanıcı kararı 28.09)
    // ★ KAPAT FİX (04.10): setAcik(false) yoktu — onay ekranı "Harika, Kapat" ile
    //   kapanınca acik:true kaldığı için hediye kutusu GERİ AÇILIYORDU. Artık kapanır.
    setAcik(false);
    setAlindi(hediye);
  }, [hediye, notify, lang]);

  if (!hediye || !userEmail || (!acik && (() => { try { return localStorage.getItem(HEDIYE_GUN_KEY) === bugunStr(); } catch { return false; } })()) && !alindi) {
    // Bugün alındıysa (onay ekranı kapalıysa) veya kullanıcı girişsizse hiçbir şey gösterme
    return null;
  }

  return (
    <>
      {/* 🎁 Buton — sağ üstte imza konumu (header dışı, her ekranda görünür) */}
      {!acik && (
        <button
          type="button"
          data-minitur="bugun-hediye"
          onClick={() => setAcik(true)}
          className="fixed bottom-20 left-3 z-[85] flex h-10 w-10 items-center justify-center rounded-full shadow-2xl transition hover:scale-110 active:scale-95 md:bottom-4 md:left-4 md:h-11 md:w-11"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          title={translate(localStorage.getItem("nur_lang"), "bhHediyeTitle")}
        >
          <Gift size={18} className="text-black" />
        </button>
      )}

      {/* Hediye kutusu */}
      {acik && hediye && !alindi && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setAcik(false)}>
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 text-center shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.4)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAcik(false)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={14} /></button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl animate-bounce" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
              <Gift size={26} className="text-black" />
            </div>

            <h3 className="font-display text-[15px] font-black" style={{ color: "var(--accent-2)" }}>{hediye.tur === "hafizlik" ? `${ttH("bhBaslikOnek")}${hediye.baslik}` : hediye.tur === "hadis" || hediye.tur === "zikir" ? `${ttH("bhBaslikOnek")}${hediye.baslik}` : hediye.baslik}</h3>

            {(hediye.tur === "hadis" || hediye.tur === "hafizlik") ? (
              <blockquote className="mt-3 rounded-xl bg-white/[.04] px-4 py-3">
                <p className="text-[11.5px] leading-relaxed text-white/80">"{hediye.metin}"</p>
                <p className="mt-2 text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {hediye.kaynak}</p>
              </blockquote>
            ) : (
              <p className="mt-3 rounded-xl bg-white/[.04] px-4 py-3 text-[11.5px] leading-relaxed text-white/80">{hediye.metin}</p>
            )}

            <button
              type="button"
              onClick={al}
              className="mt-4 w-full rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {hediye.tur === "video" ? ttH("bhVideoButon") : ttH("bhIcerikButon")}
            </button>
            <p className="mt-2 text-[8px] text-white/30">{ttH("bhYarin")}</p>
          </div>
        </div>
      )}

      {/* ★ "NE ALDIM?" ONAY EKRANI — hediyeyi alınca kutu kapanıp ne alındığı kayboluyordu;
          artık alındı ekranında NE alındığı açıkça yazıyor (kullanıcı kararı 28.09) */}
      {alindi && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onMouseDown={() => setAlindi(null)}>
          <div
            className="glass modal-in relative w-full max-w-sm rounded-2xl p-5 text-center shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.4)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAlindi(null)} className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Kapat"><X size={14} /></button>

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#34d399,var(--accent))" }}>
              <span className="text-2xl">{alindi.tur === "video" ? "🎬" : alindi.tur === "hadis" ? "📿" : alindi.tur === "hafizlik" ? "🧠" : "🤲"}</span>
            </div>

            <h3 className="font-display text-[15px] font-black text-emerald-300">{ttH("bhKazandi")}</h3>

            <div className="mt-3 rounded-xl bg-white/[.04] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{ttH("bhBugunAldigin")}</p>
              <p className="mt-1 text-[13px] font-black text-white">{alindi.tur === "video" ? ttH("bhVideoAd") : alindi.tur === "hadis" ? ttH("bhHadisAd") : alindi.tur === "hafizlik" ? ttH("bhHafizlikAd") : ttH("bhZikirAd")}</p>
              {(alindi.tur === "hadis" || alindi.tur === "hafizlik") ? (
                <blockquote className="mt-2">
                  <p className="text-[11.5px] leading-relaxed text-white/80">"{alindi.metin}"</p>
                  <p className="mt-1.5 text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {alindi.kaynak}</p>
                </blockquote>
              ) : (
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/70">{alindi.metin}</p>
              )}
            </div>

            <p className="mt-2 text-[9px] text-white/40">
              {alindi.tur === "video" ? ttH("bhVideoAciklama") : ttH("bhIcerikAciklama")}
            </p>
            {/* ★ CUMA HEDİYE BİLGİSİ (09.10 — sahibin emri: "ne hediyesi alacak onu da yaz"):
                üst bar Cuma hediyesi ayrı mekanizma (AnnouncementBar) — kullanıcıya
                Cuma +2 kısa video hediyesinin buradan bağımsız geldiğini net söyle */}
            {(() => { try { return new Date().getDay() === 5; } catch { return false; } })() && (
              <p className="mt-1.5 rounded-lg bg-amber-400/10 px-3 py-1.5 text-[9px] font-bold text-amber-200">
                {ttH("cumaHediyeAciklama")}
              </p>
            )}

            <button
              type="button"
              onClick={() => setAlindi(null)}
              className="mt-3 w-full rounded-xl py-2.5 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              {ttH("bhKapat")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
