import React, { useState, useEffect } from "react";
import { X, Gem, Crown, Check, Sparkles, Coins, Star, MapPin, Wallet, Loader2 } from "lucide-react";
import { PRICING, JETON_PAKETLERI, setCurrentTier, getJeton, addPurchasedJeton, type Tier } from "../tier";
// ★ Fiyat kilidi + gerçek PayTR/iyzico entegrasyonu için TEK gerçek fiyat kaynağı.
// LIVE mode: import.meta.env.VITE_PAYMENTS_LIVE === "true" olursa startCheckout()
// gerçek backend'e (/api/payments/create) POST atar, PayTR/iyzico iframe açılır.
// DEMO mode (default): mevcut sahte akış çalışır, tier/jeton yerelde güncellenir.
import { startCheckout, PRODUCTS } from "../payments/pricing";

const PAYMENTS_LIVE =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_PAYMENTS_LIVE ?? "false") === "true";

/** Jeton adedine göre ürün kodunu bul (pricing.server.ts'teki TOK_50, TOK_100…) */
const jetonProductCode = (jeton: number): string | null => {
  const map: Record<number, string> = { 50: "TOK_50", 100: "TOK_100", 300: "TOK_300", 800: "TOK_800", 2000: "TOK_2000" };
  return map[jeton] ?? null;
};

/** ★ TL ANA FİYATTIR (sabit). USD karşılığı güncel kurdan anlık hesaplanır. */
const FALLBACK_USD_TRY = 47;

/** Kullanıcı konumu — Intl + ip-api fallback */
type GeoInfo = { country: string; flag: string; currency: string } | null;
async function detectGeo(): Promise<GeoInfo> {
  // 1. IP ülke bilgisi — gerçek ülkeye locale'den daha yakın sonuç verir.
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      return { country: data.country_code || "TR", flag: countryToFlag(data.country_code || "TR"), currency: data.currency || "TRY" };
    }
  } catch { /* ignore */ }
  // 2. Browser locale fallback (konum servisi kapalıysa izin istemeden çalışır)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = navigator.language || "tr-TR";
    const countryFromLocale = locale.split("-")[1]?.toUpperCase() || "";
    const tzCountry = tz.split("/")[0] || "";
    const guess = countryFromLocale || tzCountry;
    if (guess) {
      const flag = countryToFlag(guess);
      const currency = guess === "TR" ? "₺" : guess === "US" ? "$" : guess === "EU" ? "€" : "$";
      return { country: guess, flag, currency };
    }
  } catch { /* ignore */ }
  // 3. Güvenli varsayılan
  return { country: "TR", flag: "🇹🇷", currency: "₺" };
}
function countryToFlag(cc: string): string {
  if (!cc || cc.length !== 2) return "🌍";
  return cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

interface PremiumModalProps {
  onClose: () => void;
  /** Başlangıç sekmesi */
  initialTab?: "uyelik" | "jeton";
  /** Mevcut tier — geçiş kısıtlaması için */
  currentTier?: Tier;
  /** Satın alma başarılı olunca (şimdilik demo) */
  onPurchase?: (tier: Tier) => void;
  onTokenPurchase?: (amount: number) => void;
}

const UYELIK_OZELLIKLERI: Record<"pro" | "elit", string[]> = {
  pro: [
    "15 hoca (10 Kâbe imamı + 5 popüler telif)",
    "İlk 5 kategoride TÜM videolar (250 içerik)",
    "20 tema (10 Pro tonu)",
    "1080p render · watermark'sız",
    "Sinematik renk filtreleri (8 ton)",
    "Yazı/başlık yenileme AI",
    "Günlük 40 jeton · tavan 100 · Cuma +15",
  ],
  elit: [
    "TÜM hocalar (36+) · telif kâriler dahil",
    "TÜM 10 aktif kategori (500 içerik)",
    "TÜM 20 tema (5 Elit tonu)",
    "Batch üretim + Akıllı AI arama sınırsız",
    "Hashtag ekleme · tek tık sosyal paylaşım",
    "Yazı tipi & tasarım stüdyosu (5 hat fontu)",
    "Günlük 150 jeton tavan · Ramazan 200",
    "Öncelikli destek (destek@nurstudyo.com · max 3 iş günü)",
  ],
};

export const PremiumModal: React.FC<PremiumModalProps> = ({
  onClose,
  initialTab = "uyelik",
  currentTier = "free",
  onPurchase,
  onTokenPurchase,
}) => {
  // Tier geçiş kuralları: Free → Pro/Elit, Pro → Elit, Elit → hiçbir şey
  const proLocked = currentTier === "pro" || currentTier === "elit";
  const elitLocked = currentTier === "elit";
  const proLabel = currentTier === "pro" ? "Mevcut planın" : currentTier === "elit" ? "Elit üyeliğin var" : undefined;
  const elitLabel = currentTier === "elit" ? "Mevcut planın" : undefined;
  const [tab, setTab] = useState<"uyelik" | "jeton">(initialTab);
  const [processing, setProcessing] = useState<string | null>(null);
  const [jeton, setJeton] = useState<number>(() => getJeton());
  const [geo, setGeo] = useState<GeoInfo>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [usdTry, setUsdTry] = useState(FALLBACK_USD_TRY);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    let live = true;
    setGeoLoading(true);
    detectGeo().then((g) => { if (live) { setGeo(g); setGeoLoading(false); } });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((response) => response.json())
      .then((data: { rates?: { TRY?: number } }) => {
        const rate = data.rates?.TRY;
        if (live && typeof rate === "number" && rate > 0) setUsdTry(rate);
      })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);

  const handleSubscribe = async (tier: "pro" | "elit") => {
    // Tier geçiş kısıtlaması
    if (tier === "pro" && proLocked) return;
    if (tier === "elit" && elitLocked) return;
    if (!termsAccepted) {
      setTermsOpen(true);
      return;
    }
    setProcessing(tier);

    // ★ LIVE mode → gerçek PayTR/iyzico akışı
    // Fiyat istemciden ASLA gönderilmez, sunucu PRODUCTS'tan okur.
    if (PAYMENTS_LIVE) {
      const productCode = tier === "pro" ? "SUB_PRO_1M" : "SUB_ELIT_1M";
      const res = await startCheckout({
        productCode,
      });
      setProcessing(null);
      if (!res.ok) {
        // Hata: kullanıcıya konsol/toast yerine termsOpen benzeri UI göstermek istersen genişletilebilir
        alert(res.error || "Ödeme başlatılamadı");
        return;
      }
      // Ödeme sayfasına yönlendir (PayTR iframe URL veya iyzico checkout URL)
      if (res.paymentUrl) window.location.href = res.paymentUrl;
      // Webhook başarılı olunca sunucu tier'ı yükler; UI onPurchase callback'i webhook sonrası tetiklenir
      return;
    }

    // ★ DEMO mode → önceki yerel akış (backend yokken test için)
    setTimeout(() => {
      setCurrentTier(tier);
      onPurchase?.(tier);
      setProcessing(null);
      onClose();
    }, 900);
  };

  const handleBuyJeton = async (paket: typeof JETON_PAKETLERI[number]) => {
    if (!termsAccepted) {
      setTermsOpen(true);
      return;
    }
    setProcessing(`jeton-${paket.jeton}`);

    // ★ LIVE mode → gerçek PayTR/iyzico akışı
    // Tutar istemciden gönderilmez; sunucu productCode ile PRODUCTS'tan okur.
    if (PAYMENTS_LIVE) {
      const productCode = jetonProductCode(paket.jeton);
      if (!productCode) {
        setProcessing(null);
        alert("Bu paket için ürün kodu tanımlı değil (pricing.server.ts)");
        return;
      }
      // Ek güvenlik: sunucudaki fiyat listesinin bu paket kodunu tanıdığından emin ol
      if (!PRODUCTS[productCode]) {
        setProcessing(null);
        alert("Ürün fiyat kaynağında yok — satışa kapalı olabilir");
        return;
      }
      const res = await startCheckout({
        productCode,
      });
      setProcessing(null);
      if (!res.ok) {
        alert(res.error || "Ödeme başlatılamadı");
        return;
      }
      if (res.paymentUrl) window.location.href = res.paymentUrl;
      return;
    }

    // ★ DEMO mode → Satın alınan jeton TAVANDAN (CAP) %100 MUAF VE SÜRESİZDİR!
    setTimeout(() => {
      addPurchasedJeton(paket.jeton);
      const next = getJeton();
      setJeton(next);
      onTokenPurchase?.(paket.jeton);
      setProcessing(null);
      // ★ Jeton alındıktan sonra modal kapanmasın — kullanıcı devam edebilsin
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-3 md:p-6 backdrop-blur-md modal-in"
      onMouseDown={onClose}
      onClick={onClose}
    >
      <div
        className="glass modal-in relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid rgba(215,170,82,.25)" }}
      >
        {/* Üst geometrik motif şeridi */}
        <div
          className="relative h-24 shrink-0 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(215,170,82,.28), transparent 55%), radial-gradient(ellipse at 80% 0%, rgba(245,221,166,.22), transparent 55%), linear-gradient(180deg, #1a1408 0%, #0c0d12 100%)",
          }}
        >
          {/* İslami geometrik SVG desen */}
          <svg
            className="absolute inset-0 h-full w-full opacity-[.18]"
            viewBox="0 0 800 120"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <pattern id="nur-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#d7aa52" strokeWidth="0.8" />
                <circle cx="40" cy="40" r="14" fill="none" stroke="#f5dda6" strokeWidth="0.6" />
                <path d="M40 26 L54 40 L40 54 L26 40 Z" fill="none" stroke="#d7aa52" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="120" fill="url(#nur-geo)" />
          </svg>

          {/* ★ JETON SAYACI + KONUM — sağ üst */}
          <div className="absolute right-4 top-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-black tabular-nums text-[color:var(--accent-2)] backdrop-blur-sm" style={{ border: "1px solid rgba(215,170,82,.3)" }}>
              <Wallet size={11} style={{ color: "var(--accent)" }} />
              {jeton}
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">jeton</span>
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white/70 backdrop-blur-sm" style={{ border: "1px solid rgba(255,255,255,.1)" }}>
              {geoLoading ? <Loader2 size={10} className="animate-spin" /> : <MapPin size={10} style={{ color: "var(--accent)" }} />}
              {geoLoading ? "…" : <>{geo?.flag} {geo?.country === "TR" ? "Türkiye" : geo?.country}</>}
            </span>
            <button
              type="button"
              onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="relative z-30 rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/80 hover:text-white hover:scale-110"
              style={{ border: "1px solid rgba(255,255,255,.12)" }}
              aria-label="Kapat"
            >
              <X size={14} />
            </button>
          </div>

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.4em] text-[color:var(--accent-2)]">
              <span className="h-px w-8" style={{ background: "linear-gradient(90deg,transparent,var(--accent))" }} />
              NÛR STÜDYO
              <span className="h-px w-8" style={{ background: "linear-gradient(90deg,var(--accent),transparent)" }} />
            </div>
            <h2
              className="mt-1 font-display text-2xl font-black tracking-[.08em] md:text-3xl"
              style={{
                background: "linear-gradient(110deg,#f5dda6 0%,#ffffff 40%,#d7aa52 70%,#f5dda6 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              ÜYELİK & JETON
            </h2>
            <p className="mt-1 text-[9px] text-white/40">
              {geoLoading ? "Konumun belirleniyor…" : `Konumun: ${geo?.flag} · güncel kur ₺${usdTry.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Sekme başlıkları */}
        <div className="flex shrink-0 gap-1 border-b border-white/5 bg-black/30 p-2">
          <button
            onClick={() => setTab("uyelik")}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider transition ${
              tab === "uyelik" ? "text-black" : "text-white/50 hover:text-white/80"
            }`}
            style={tab === "uyelik" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Crown size={13} /> Üyelik
          </button>
          <button
            onClick={() => setTab("jeton")}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider transition ${
              tab === "jeton" ? "text-black" : "text-white/50 hover:text-white/80"
            }`}
            style={tab === "jeton" ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            <Coins size={13} /> Jeton Paketi
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {tab === "uyelik" ? (
            <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
              {/* PRO kartı */}
              <UyelikKarti
                tier="pro"
                icon={Gem}
                isim="NÛR PRO"
                altbaslik="İçerik üreticisi"
                fiyatTL={PRICING.PRO.tl}
                ozellikler={UYELIK_OZELLIKLERI.pro}
                vurgu={false}
                processing={processing === "pro"}
                onSec={() => handleSubscribe("pro")}
                rate={usdTry}
                disabled={proLocked}
                disabledLabel={proLabel}
              />
              {/* ELİT kartı — daha büyük, daha parlak */}
              <UyelikKarti
                tier="elit"
                icon={Crown}
                isim="NÛR ELİT"
                altbaslik="Kurucu · hoca · ajans"
                fiyatTL={PRICING.ELIT.tl}
                ozellikler={UYELIK_OZELLIKLERI.elit}
                vurgu
                processing={processing === "elit"}
                onSec={() => handleSubscribe("elit")}
                rate={usdTry}
                disabled={elitLocked}
                disabledLabel={elitLabel}
              />
            </div>
          ) : (
            <div>
              <p className="mb-4 text-center text-[11px] text-white/55">
                Abone olmadan, tek seferlik jeton satın al — kendi hızında üret.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {JETON_PAKETLERI.map((p, i) => {
                  const vurgu = i === 2; // "Orta" paketi vurgulu
                  const busy = processing === `jeton-${p.jeton}`;
                  return (
                    <button
                      key={p.jeton}
                      onClick={() => handleBuyJeton(p)}
                      disabled={busy}
                      className={`group relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all duration-300 ${
                        vurgu
                          ? "border-[color:var(--accent)] shadow-xl lg:-translate-y-2 lg:scale-[1.04]"
                          : "border-white/10 hover:border-white/30 hover:-translate-y-1"
                      }`}
                      style={{
                        background: vurgu
                          ? "linear-gradient(160deg, rgba(215,170,82,.18) 0%, rgba(12,13,18,.9) 100%)"
                          : "rgba(255,255,255,.03)",
                        boxShadow: vurgu ? "0 12px 40px rgba(215,170,82,.25)" : undefined,
                      }}
                    >
                      {vurgu && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                          POPÜLER
                        </span>
                      )}
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(215,170,82,.15)" }}>
                        <Coins size={16} style={{ color: "var(--accent-2)" }} />
                      </div>
                      <div className="font-display text-xl font-black tabular-nums" style={{ color: "var(--accent-2)" }}>
                        {p.jeton}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">jeton</div>
                      <div className="mt-2 text-[8px] font-semibold text-white/55">{p.label}</div>
                      <div className="mt-3 flex items-baseline gap-0.5">
                        <span className="font-display text-lg font-black text-white tabular-nums">₺{p.tl.toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="mt-0.5 text-[8px] font-medium tabular-nums text-white/35">
                        ≈ ${(p.tl / usdTry).toFixed(2)} USD · kur ₺{usdTry.toFixed(2)}
                      </div>
                      <div className="mt-1 text-[8.5px] font-medium text-white/40">
                        {p.unitPrice}
                      </div>
                      <span
                        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-black uppercase tracking-wider text-black transition group-hover:brightness-110"
                        style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                      >
                        {busy ? "İşleniyor…" : "Satın Al"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/40">
                <MapPin size={10} style={{ color: "var(--accent)" }} />
                {geoLoading ? "Konumun belirleniyor…" : `Konumun: ${geo?.flag} ${geo?.country === "TR" ? "Türkiye" : geo?.country} · güncel kur ₺${usdTry.toFixed(2)}`}
              </p>
            </div>
          )}
        </div>

        {/* Alt şerit — tek satır, hiç uzamaz, butonlar her zaman görünür */}
        <div className="shrink-0 border-t border-white/5 bg-black/55 px-4 py-2.5 backdrop-blur-sm">
          <label className="flex cursor-pointer items-center justify-center gap-2 text-[9px] leading-relaxed text-white/55">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>
              Satın alma koşullarını okudum ve kabul ediyorum.
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsOpen(true); }}
                className="ml-1 font-bold text-[color:var(--accent-2)] underline underline-offset-2 hover:text-white"
              >
                Koşulları oku
              </button>
            </span>
          </label>
        </div>
      </div>

      {/* ★ Koşullar mini-modalı — ana modalı uzatmaz, üstüne biner, butonlar hep görünür */}
      {termsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-rise"
          onMouseDown={() => setTermsOpen(false)}
          onClick={() => setTermsOpen(false)}
        >
          <div
            className="glass relative w-full max-w-md rounded-2xl p-5 shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.3)" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setTermsOpen(false)}
              className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white/60 transition hover:bg-black/60 hover:text-white"
              aria-label="Kapat"
            >
              <X size={14} />
            </button>
            <h4 className="mb-3 font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
              Satın Alma Koşulları
            </h4>
            <ul className="space-y-2 text-[10px] leading-relaxed text-white/65">
              <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>•</span><span>Satın alınan üyelik ve jetonlar dijital üründür; teslim sonrası iade yapılmaz.</span></li>
              <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>•</span><span>Jetonlar hesabına otomatik yüklenir ve üretimlerde anlık düşer.</span></li>
              <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>•</span><span>Üyelikler aylık yenilenir; iptal etmediğin sürece aktif kalır.</span></li>
              <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>•</span><span>Üretim iptal edilirse jeton düşmez — sadece tamamlanan render ücretlenir.</span></li>
              <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>•</span><span>Jeton/üyelik kötüye kullanım, sahte hesap veya bot tespitinde durdurulabilir.</span></li>
              <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>•</span><span>Telif riski yüksek kârilerde oluşabilecek platform itirazları kullanıcı sorumluluğundadır.</span></li>
            </ul>
            <button
              type="button"
              onClick={() => { setTermsAccepted(true); setTermsOpen(false); }}
              className="mt-4 w-full rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider text-black"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Okudum, kabul ediyorum
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Üyelik Kartı ──────────────────────────────────────────────────
const UyelikKarti: React.FC<{
  tier: "pro" | "elit";
  icon: React.ElementType;
  isim: string;
  altbaslik: string;
  fiyatTL: number;
  ozellikler: string[];
  vurgu: boolean;
  processing: boolean;
  onSec: () => void;
  rate: number;
  disabled?: boolean;
  disabledLabel?: string;
}> = ({ tier: _tier, icon: Icon, isim, altbaslik, fiyatTL, ozellikler, vurgu, processing, onSec, rate, disabled, disabledLabel }) => {
  void _tier;
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl border p-5 transition-all duration-300 ${
        vurgu ? "border-[color:var(--accent)] shadow-2xl" : "border-white/10"
      }`}
      style={{
        background: vurgu
          ? "linear-gradient(160deg, rgba(215,170,82,.22) 0%, rgba(139,105,20,.08) 40%, rgba(12,13,18,.95) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,.04) 0%, rgba(12,13,18,.9) 100%)",
        boxShadow: vurgu ? "0 20px 60px rgba(215,170,82,.3), inset 0 1px 0 rgba(245,221,166,.2)" : undefined,
      }}
    >
      {vurgu && (
        <>
          {/* Elit'e özel köşe parıltısı */}
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
            style={{ background: "radial-gradient(circle, var(--accent-2), transparent 70%)" }}
          />
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            <Star size={8} strokeWidth={3} /> KURUCU
          </span>
        </>
      )}

      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-black shadow-md"
          style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
        >
          <Icon size={16} strokeWidth={2.5} />
        </span>
        <div>
          <div className="font-display text-sm font-black tracking-[.15em]" style={{ color: "var(--accent-2)" }}>
            {isim}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-white/40">{altbaslik}</div>
        </div>
      </div>

      {/* Fiyat — TL sabit fiyat, USD yaklaşık küçük altında (sadece aylık, yıllık satış yok) */}
      <div className="mt-4 flex items-end gap-2">
        <span className="font-display text-4xl font-black tabular-nums text-white">
          ₺{fiyatTL.toLocaleString("tr-TR")}
        </span>
        <span className="mb-1 text-[10px] text-white/40">/ ay</span>
      </div>
      <div className="mt-0.5 text-[9px] text-white/30 tabular-nums">
        ≈ ${(fiyatTL / rate).toFixed(2)} USD · kur ₺{rate.toFixed(2)}
      </div>

      {/* Özellikler */}
      <ul className="mt-4 space-y-1.5">
        {ozellikler.map((oz) => (
          <li key={oz} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-white/75">
            <Check size={11} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} strokeWidth={3} />
            <span>{oz}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSec}
        disabled={processing || disabled}
        className={`mt-5 flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-wider transition ${
          disabled ? "cursor-not-allowed text-white/50" : vurgu ? "text-black" : "text-white"
        }`}
        style={{
          background: disabled
            ? "rgba(255,255,255,.06)"
            : vurgu
            ? "linear-gradient(135deg,var(--accent-2),var(--accent))"
            : "rgba(255,255,255,.08)",
          boxShadow: vurgu && !disabled ? "0 8px 24px rgba(215,170,82,.4)" : undefined,
        }}
      >
        {disabled ? (
          <>
            <Check size={13} /> {disabledLabel ?? "Mevcut planın"}
          </>
        ) : processing ? (
          <>
            <Sparkles size={13} className="animate-spin" /> İşleniyor…
          </>
        ) : vurgu ? (
          <>
            <Crown size={13} /> Elit Ol
          </>
        ) : (
          <>
            <Gem size={13} /> Pro'ya Geç
          </>
        )}
      </button>
    </div>
  );
};
