import React, { useState } from "react";
import { MessageSquareHeart, Send, X } from "lucide-react";

// ════════════════════════════════════════════════════════
// GERİ BİLDİRİM KUTUSU — öneri / şikayet / özellik isteği
// Misafir + üye herkes yazabilir. POST /api/marketing/feedback
// Kullanıcı bilgisi sunucu oturumundan gelir (istemciden gönderilmez).
// ════════════════════════════════════════════════════════

type FeedbackTur = "oneri" | "sikayet" | "ozellik" | "diger";

const TUR_SECENEKLERI: Array<{ key: FeedbackTur; label: string; emoji: string }> = [
  { key: "oneri", label: "Öneri", emoji: "💡" },
  { key: "ozellik", label: "Özellik İsteği", emoji: "✨" },
  { key: "sikayet", label: "Şikayet", emoji: "😔" },
  { key: "diger", label: "Diğer", emoji: "✉️" },
];

export const FeedbackBox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tur, setTur] = useState<FeedbackTur>("oneri");
  const [puan, setPuan] = useState<number | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const [sonuc, setSonuc] = useState<"ok" | "hata" | null>(null);

  async function gonder() {
    if (mesaj.trim().length < 5 || gonderiyor) return;
    setGonderiyor(true);
    setSonuc(null);
    try {
      const res = await fetch("/api/marketing/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tur, puan, mesaj: mesaj.trim() }),
      });
      if (res.ok) {
        setSonuc("ok");
        setMesaj("");
        setPuan(null);
        setTimeout(() => { setSonuc(null); setOpen(false); }, 2500);
      } else {
        setSonuc("hata");
      }
    } catch {
      setSonuc("hata");
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <>
      {/* Footer satırındaki tetikleyici */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 transition hover:text-[color:var(--accent-2)] cursor-pointer"
      >
        <span>💬</span> Görüş & Öneri
      </button>

      {/* Açılır panel */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={() => !gonderiyor && setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <MessageSquareHeart size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-[15px] text-white">Görüşünü Payla 🌙</h3>
                  <p className="text-[10px] text-white/40">Seninle daha iyisi yapalım — sadakatimiz sana</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 transition hover:text-white" aria-label="Kapat">
                <X size={18} />
              </button>
            </div>

            {sonuc === "ok" ? (
              <div className="py-8 text-center">
                <p className="text-3xl">✨</p>
                <p className="mt-2 font-bold text-[14px] text-emerald-400">Mesajın ulaştı!</p>
                <p className="mt-1 text-[11px] text-white/50">Görüşün için teşekkürler. Hayra vesile oldun 🌙</p>
              </div>
            ) : (
              <>
                {/* Tür seçimi */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {TUR_SECENEKLERI.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTur(t.key)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                        tur === t.key
                          ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>

                {/* Puan (opsiyonel) */}
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="text-[11px] text-white/40">Sitemizi puanla:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPuan(puan === n ? null : n)}
                      className={`text-lg transition ${puan && n <= puan ? "grayscale-0" : "opacity-30 grayscale"}`}
                      aria-label={`${n} yıldız`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>

                {/* Mesaj */}
                <textarea
                  value={mesaj}
                  onChange={(e) => setMesaj(e.target.value.slice(0, 1000))}
                  placeholder="Önerin, şikayetin ya da isteğin… (en az 5 karakter)"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-[12px] text-white placeholder-white/25 outline-none transition focus:border-amber-500/50"
                />
                <div className="mt-0.5 mb-3 text-right text-[9px] text-white/25">{mesaj.length}/1000</div>

                {sonuc === "hata" && (
                  <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
                    Mesaj gönderilemedi, birazdan tekrar dene 🙏
                  </p>
                )}

                <button
                  onClick={gonder}
                  disabled={mesaj.trim().length < 5 || gonderiyor}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}
                >
                  <Send size={14} />
                  {gonderiyor ? "Gönderiliyor…" : "Gönder"}
                </button>
                <p className="mt-2 text-center text-[9px] text-white/25">Mesajın admin paneline gelir — kimlik bilgisi otomatik eklenir</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
