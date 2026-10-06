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
import { HADIS_BANKASI, HADIS_TEMALARI, HADIS_DERECE_ETIKETI } from "../data/hadisData";
import { KISSA_LISTESI } from "../data/kissaData";
import { kissaCevir } from "../data/kissaCokDil"; // ★ KISSA ÇOKDİL (06.10): 19 kıssa 5 dilde — TR asıl, çeviri yoksa fallback
import { SORU_CEVAP_ARŞIVI, BES_SART_SORULARI } from "../data/soruData";
import { KELIME_KARTLARI, type KelimeKart } from "../data/kelimeData";
import { SURE_BİLGİLERİ } from "../data/sureData";
import { NAMAZ_REHBERİ } from "../data/namazData";
import { DUA_REHBERİ } from "../data/duaData";
import { HOCA_KARSILASTIRMA_AYETLER } from "../data/hocaData";
import { camiHaritaUrl, camiListeUrl } from "../data/camiData";
import { KANAL_REHBERI } from "../data/kanalData";
import { TECVID_KURALLARI, TECVID_SEVIYE_ETIKETI } from "../data/tecvidData";
import { SURAHS } from "../data/surahs";
import { SURE_ARAPCA } from "../data/sureArapca"; // ★ AKILLI SURE ARAMASI (03.10): Arapça adla arama
import { kitaplikOku, kelimeOku, bilinenKelimelerOku, bilinenKelimeIsaretle, KARILER, everyAyetUrl, SEKMELER, type SekmeId, type KitaplikNot } from "./kesfetTemel";
import { sesUrlYedegi } from "../reciters"; // ★ YEDEK SES KAYNAĞI (02.10)
import { DuaRehberBolumu } from "./kesfetDuaBolumu";

// ══ AKILLI SURE ARAMASI (03.10, kullanıcı kararı) ══════════
// Türkçe şapka/ağız + Arapça harakat normalizasyonu + harf hatası toleransı:
// "fatiah"→Fâtiha · "bakra"→Bakara · "yasin"→Yâsîn · "الملك"→Mülk · "36"→Yâsîn
function metniHazirla(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[âàáä]/g, "a").replace(/[îìíï]/g, "i").replace(/[ûùúü]/g, "u")
    .replace(/[êèéë]/g, "e").replace(/[ôòóö]/g, "o").replace(/ñ/g, "n")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ı/g, "i")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
// Arapça: harakat/tatveel/işaretleri at; elif-hamza çeşitlerini birleştir,
// te-mervuta→he, elif-maksura→ya — "الفاتحه" ile "الفاتحة" aynı bulunsun
function arapcaHazirla(s: string): string {
  return s
    .replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08F3]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ؤئ]/g, "ي")
    .replace(/\s+/g, "");
}
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let onceki = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const simdiki = [i];
    for (let j = 1; j <= b.length; j++) {
      simdiki[j] = Math.min(onceki[j] + 1, simdiki[j - 1] + 1, onceki[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    onceki = simdiki;
  }
  return onceki[b.length];
}
// kelime ↔ metin eşleşmesi: düz alt dize + harf hatası toleransı + "el/al" takısı
function kelimeUyar(metin: string, kelime: string): boolean {
  if (!kelime) return true;
  if (metin.includes(kelime)) return true;
  const tolerans = kelime.length <= 3 ? 0 : kelime.length <= 5 ? 1 : 2;
  if (tolerans === 0) return false;
  const parcalar = metin.split(" ");
  if (parcalar.some((p) => levenshtein(p, kelime) <= tolerans)) return true;
  const kisa = kelime.length >= 5 ? kelime.replace(/^(al|el)/, "") : kelime; // "alfatiha" → "fatiha"
  return kisa !== kelime && (metin.includes(kisa) || parcalar.some((p) => levenshtein(p, kisa) <= tolerans));
}

// ★ GÜNÜN KELİMELERİ (03.10): güne göre deterministik 5 kelime — yerel gün no × 5 kaydırma;
//   her gün öncekiyle kesişmeyen 5'li gelir, havuzda tam tur (100 kelime) 100 günde döner
function gununKelimeleriHesapla(): KelimeKart[] {
  const gunNo = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const adet = Math.min(5, KELIME_KARTLARI.length);
  const bas = (gunNo * adet) % KELIME_KARTLARI.length;
  return Array.from({ length: adet }, (_, i) => KELIME_KARTLARI[(bas + i) % KELIME_KARTLARI.length]);
}
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
      {/* ★ BİLİNDİ TİKİ (03.10): atölyeden stüdyoya aktarılan kelime yeşil tik alır; elle de işaretlenir/kaldırılır */}
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
function atolyeKelimeOner(d: KelimeKart): string {
  return d.tr.split(/[,(]/)[0].trim() || d.tr;
}

// ★ SRP adım 4 (30.09): kitaplık okuma + TTS ses motoru + kâriler + sekme tanımları kesfetTemel.tsx'e taşındı
interface KesfetModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  initialSekme?: SekmeId;
  notify?: (msg: string) => void;
  /** ★ 03.10: karttaki ✨ butonu — Kelime Atölyesi'ni bu kelimeyle açar (ModalsContainer bağlar) */
  atolyeAc?: (kelime: string, kelimeAr: string) => void;
}

export const KesfetModal: React.FC<KesfetModalProps> = ({ open, onClose, initialSekme, notify , atolyeAc, lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);
  // ★ 04.10 TUR 2: sekme/hadis teması/derece adları 5 dilde — TR veri anahtarları sabit kalır
  const SEKME_KEY: Record<string, string> = {
    hadis: "ksHadisBankasi", kissa: "ksKissaKosesi", soru: "ksSoruCevap", kelime: "ksKelimeKartlari",
    sure: "ksSureBilgileri", namaz: "ksNamazOgretici", dua: "ksDuaRehberi", hoca: "ksHocaKarsilastir",
    cami: "ksCamiBulucu", rehber: "ksKanalRehberi", tecvid: "ksTecvidRehberi", kitaplik: "ksKitapligim",
  };
  const sekmeAdi = (id: string): string => (SEKME_KEY[id] ? tt(SEKME_KEY[id]) : id);
  const TEMA_KEY: Record<string, string> = {
    tumu: "ksTemaTumu", sabir: "ksTemaSabir", sukur: "ksTemaSukur", "ana-baba": "ksTemaAnaBaba",
    "komşuluk": "ksTemaKomsuluk", ahlak: "ksTemaAhlak", zikir: "ksTemaZikir", hayir: "ksTemaHayir",
    namaz: "ksTemaNamaz", ilim: "ksTemaIlim", dua: "ksTemaDua", tovbe: "ksTemaTovbe", yetim: "ksTemaYetim",
    iffet: "ksTemaIffet", dil: "ksTemaDil", "cömertlik": "ksTemaComertlik", merhamet: "ksTemaMerhamet",
  };
  const hadisTemaAdi = (id: string): string => (TEMA_KEY[id] ? tt(TEMA_KEY[id]) : id);
  const DERECE_KEY: Record<string, string> = { sahih: "ksDereceSahih", hasan: "ksDereceHasan", zayif: "ksDereceZayif", kulliyat: "ksDereceKulliyat" };
  const dereceAdi = (d?: string): string => (d && DERECE_KEY[d] ? tt(DERECE_KEY[d]) : (d && HADIS_DERECE_ETIKETI[d]?.label) || "");

  const [sekme, setSekme] = useState<SekmeId>(initialSekme ?? "hadis");
  const [arama, setArama] = useState("");
  const [hadisTema, setHadisTema] = useState("tumu");
  const [kartCevrildi, setKartCevrildi] = useState<string | null>(null); // ★ 03.10: index yerine kelime anahtarı — sıralama değişse de çevrilen kart kaymaz
  // ★ SURE AKORDEONU (01.10): tıkla-aç/kapa — liste yer kaplamasın, uzun açıklama sadece açık karta girsin
  const [acikSure, setAcikSure] = useState<number | null>(null);
  // ★ KISSA AKORDEONU (01.10): aynı ilke — kapalı kart tek satır özet, açık kartta kıssa+ders+dua
  const [acikKissa, setAcikKissa] = useState<string | null>(null);
  // ★ SORU-C EVAP AKORDEONU (03.10, kullanıcı kararı): üç büyük liste aynı tıkla-aç deseninde —
  //   kapalı kartta soru + tek satır cevap özeti, açık kartta mezhep bazlı cevaplar/kaynak
  const [acikSoru, setAcikSoru] = useState<number | null>(null);
  const [acikGenelSoru, setAcikGenelSoru] = useState<number | null>(null);
  // ★ KELİME YENİLE (01.10): sahih havuzdan her seferinde rastgele 15 keşif kartı — günün 5'i hariç (03.10)
  const [kelimeKartlari, setKelimeKartlari] = useState<KelimeKart[]>([]);
  // ★ GÜNÜN KELİMELERİ (03.10): deterministik — oturum boyunca sabit, gün değişince yenilenir
  const gununKelimeleri = React.useMemo(gununKelimeleriHesapla, []);
  const kelimeYenile = React.useCallback(() => {
    const gununAr = new Set(gununKelimeleri.map((k) => k.ar));
    const havuz = KELIME_KARTLARI.filter((k) => !gununAr.has(k.ar));
    for (let i = havuz.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [havuz[i], havuz[j]] = [havuz[j], havuz[i]]; }
    setKelimeKartlari(havuz.slice(0, 15));
    setKartCevrildi(null);
  }, [gununKelimeleri]);
  React.useEffect(() => { if (sekme === "kelime") kelimeYenile(); }, [sekme, kelimeYenile]);
  // ★ BİLİNEN KELİMELER (03.10): atölyeden stüdyoya aktarılan kart yeşil tik alır — event ile anında tazelenir
  const [bilinenTick, setBilinenTick] = useState(0);
  React.useEffect(() => {
    const tazele = () => setBilinenTick((v) => v + 1);
    window.addEventListener("nur_kelime_bilinen", tazele);
    return () => window.removeEventListener("nur_kelime_bilinen", tazele);
  }, []);
  const bilinenSet = React.useMemo(() => new Set(bilinenKelimelerOku()), [bilinenTick]);
  // ★ Hoca karşılaştırma state'leri (madde 41)
  // ★ Kitaplık (madde 56) — sekme açılınca taze okunur
  const [kitaplikVeri, setKitaplikVeri] = useState<{ isaretler: string[]; notlar: KitaplikNot[] }>({ isaretler: [], notlar: [] });
  const [camiKonum, setCamiKonum] = useState("");
  const [camiAranan, setCamiAranan] = useState<string | null>(null);
  // ★ CAMİ BULUCU — KONUMDAN AÇ (01.10, kullanıcı kararı): ortadaki büyük buton cihaz konumunu alıp haritayı açar
  const [camiKonumAliniyor, setCamiKonumAliniyor] = useState(false);
  const camiKonumAl = () => {
    if (!navigator.geolocation) { notify?.(tt("ksKonumDestekYok")); return; }
    setCamiKonumAliniyor(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { try { localStorage.setItem("nur_konum_izin", "1"); } catch { /* yoksay */ } setCamiAranan(`${pos.coords.latitude},${pos.coords.longitude}`); setCamiKonumAliniyor(false); },
      () => { notify?.(tt("ksKonumIzinYok")); setCamiKonumAliniyor(false); },
      { timeout: 8000 },
    );
  };
  const [hocaAyet, setHocaAyet] = useState<number>(0); // seçili ayet index'i (-1 = aramadan gelen özel ayet)
  const [hocaOzel, setHocaOzel] = useState<{ sure: number; sureAdi: string; ayet: number; etiket?: string } | null>(null); // ★ 01.10: "bakara 250" araması istediğin ayeti çalar
  const [hocaIdx, setHocaIdx] = useState<number>(0);   // çalan kari index'i
  const [hocaCaliyor, setHocaCaliyor] = useState(false);
  const hocaAudioRef = React.useRef<HTMLAudioElement | null>(null);
  if (!hocaAudioRef.current && typeof Audio !== "undefined") {
    const hocaSes = new Audio();
    hocaSes.preload = "none";
    // ★ YEDEK SES DİNLEYİCİSİ (02.10): patlayan everyayah URL'si varsa islamic.network yedeği
    hocaSes.addEventListener("error", () => {
      const mevcut = hocaSes.currentSrc || hocaSes.src || "";
      if (!mevcut) return;
      const yedek = sesUrlYedegi(mevcut);
      if (!yedek || hocaSes.dataset.sesYedek === yedek) return;
      // ★ state kapanı (closure) bayat — canlı paused özelliğine bakılır
      const caliyordu = !hocaSes.paused;
      hocaSes.dataset.sesYedek = yedek;
      hocaSes.src = yedek;
      hocaSes.load();
      if (!caliyordu) return; // preload hatası — sessizce yedeği ısıtıyor
      hocaSes.play().catch(() => setHocaCaliyor(false));
    });
    hocaAudioRef.current = hocaSes;
  }

  const hocaCal = (kariIdx: number) => {
    const a = hocaAudioRef.current;
    const ayet = hocaAktifAyet;
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

  // ★ İSTEDİĞİN AYETİ OKUSUN (01.10): "bakara 250" / "2 255" / "2:255" gibi aramayı sure+ayet'e çevir
  //   (Türkçe yazım toleranslı: â→a, î→i, kesme işareti ve tire yok sayılır) — q tanımlandıktan SONRA gelmeli
  const hocaOzelAday = useMemo(() => {
    if (sekme !== "hoca" || !q) return null;
    const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/[âàä]/g, "a").replace(/[îìï]/g, "i").replace(/[ûùü]/g, "u").replace(/[‘’'-]/g, "").trim();
    const sayiya = (sn: number, an: number): { sure: number; sureAdi: string; ayet: number; etiket?: string } | null => {
      const sur = SURAHS.find((x) => x.n === sn);
      if (!sur || an < 1 || an > sur.count) return null;
      return { sure: sn, sureAdi: sur.name, ayet: an };
    };
    const mRakam = q.match(/^(\d{1,3})\s*[\s:.]\s*(\d{1,3})$/); // "2 255" / "2:255"
    if (mRakam) return sayiya(Number(mRakam[1]), Number(mRakam[2]));
    const mAd = q.match(/^(.+?)\s+(\d{1,3})$/); // "bakara 250"
    if (mAd) {
      const adN = norm(mAd[1]);
      const sur = SURAHS.find((x) => norm(x.name) === adN || norm(x.name).includes(adN) || adN.includes(norm(x.name)));
      if (sur) return sayiya(sur.n, Number(mAd[2]));
    }
    return null;
  }, [sekme, q]);
  React.useEffect(() => {
    if (!hocaOzelAday) return;
    setHocaOzel(hocaOzelAday); setHocaAyet(-1); setHocaCaliyor(false);
    hocaAudioRef.current?.pause();
  }, [hocaOzelAday]);
  const hocaAktifAyet = hocaAyet === -1 && hocaOzel ? hocaOzel : HOCA_KARSILASTIRMA_AYETLER[hocaAyet] ?? null;

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
  // ★ KISSA ÇOKDİL (06.10): önce dile çevir, sonra arama çevrilmiş ad/özet üzerinden koşsun
  const filtreliKissalar = useMemo(() => kissaCevir(lang, KISSA_LISTESI).filter((k) => !q || k.ad.toLocaleLowerCase("tr").includes(q) || k.ozet.toLocaleLowerCase("tr").includes(q)), [q, lang]);
  const filtreliSorular = useMemo(() => SORU_CEVAP_ARŞIVI.filter((s) => !q || s.soru.toLocaleLowerCase("tr").includes(q) || s.cevap.toLocaleLowerCase("tr").includes(q)), [q]);
  // ★ 03.10: mezhepli soru-cevap filtresi ayrı değişkene alındı (akordeon + sayaç için)
  const filtreliBesSart = useMemo(() => BES_SART_SORULARI.filter((b) => !q || b.soru.toLocaleLowerCase("tr").includes(q) || b.cevaplar.some((c) => c.metin.toLocaleLowerCase("tr").includes(q)) || b.sart.toLocaleLowerCase("tr").includes(q)), [q]);
  // ★ 03.10 AKILLI SURE ARAMASI: ad + ARAPÇA AD + numara + konu/açıklama;
  //   kelime bazlı (sıra serbest), "sure" dolgu kelimesi yoksayılır.
  //   Örn: "fatiah"→Fâtiha · "bakra"→Bakara · "sure mulk"→Mülk · "36"→Yâsîn · "الرحمن"→Rahmân
  const filtreliSureler = useMemo(() => {
    if (!q) return SURE_BİLGİLERİ;
    const ham = q.split(/\s+/).filter(Boolean);
    const kelimeler = ham
      .filter((k) => ham.length <= 1 || k !== "sure")
      // ★ Arapça kelime metniHazirla'da siliniyor → Arapça normalize'a düş ("الملك" → Mülk)
      .map((k) => metniHazirla(k) || arapcaHazirla(k))
      .filter(Boolean);
    if (!kelimeler.length) return SURE_BİLGİLERİ;
    return SURE_BİLGİLERİ.filter((s) =>
      kelimeler.every((w) => {
        if (/^\d{1,3}$/.test(w) && s.n === parseInt(w, 10)) return true; // "36" → Yâsîn
        return (
          kelimeUyar(metniHazirla(s.ad), w) ||
          kelimeUyar(arapcaHazirla(SURE_ARAPCA[s.n] ?? ""), w) ||
          metniHazirla(s.konu).includes(w) ||
          metniHazirla(s.aciklama ?? "").includes(w)
        );
      }),
    );
  }, [q]);
  // ★ 03.10: arama tam bir sure adına/numarasına/Arapça adına denk gelirse akordeon otomatik açılır
  React.useEffect(() => {
    if (sekme !== "sure" || !q) return;
    const nq = metniHazirla(q);
    const sayi = /^\d{1,3}$/.test(nq) ? parseInt(nq, 10) : null;
    const aq = /[\u0600-\u06FF]/.test(q) ? arapcaHazirla(q) : "";
    if (!nq && !sayi && !aq) return;
    const tam = SURE_BİLGİLERİ.find((s) => metniHazirla(s.ad) === nq || s.n === sayi || (aq !== "" && arapcaHazirla(SURE_ARAPCA[s.n] ?? "") === aq));
    if (tam) setAcikSure(tam.n);
  }, [q, sekme]);
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
            onClick={() => { setSekme(s.id); setArama(""); setKartCevrildi(null); setAcikSure(null); setAcikKissa(null); setAcikSoru(null); setAcikGenelSoru(null); if (s.id === "kitaplik") setKitaplikVeri(kitaplikOku()); }}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${sekme === s.id ? "text-black shadow-md" : "glass-soft text-white/55 hover:text-white"}`}
            style={sekme === s.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            {s.emoji} {sekmeAdi(s.id)}
          </button>
        ))}
      </div>

      {/* Arama (kelime kartları hariç — kendi akışı var) */}
      {sekme !== "kelime" && (
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder={tt("ksAraPlaceholder")} className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30" />
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
      )}

      {/* ── 19: KISSA KÖŞESİ — akordeon (01.10): başlığa dokun → aç/kapa; kapalı tek satır, açık tam kıssa+ders+dua ──
        ★ 03.10 (kullanıcı isteği): kapalı kartın ÖZET YAZISI da tıklanınca AÇILIR — küçültme başlık/chevron'dan */}
      {sekme === "kissa" && (
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
                  </div>
                )}
              </div>
            );
          })}
          {filtreliKissalar.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">{tt("ksKissaYok")}</p>}
          <p className="pt-1 text-center text-[8px] text-white/25">{tt("ksKissaSayaci").replace("{n}", String(filtreliKissalar.length))}</p>
        </div>
      )}

      {/* ── 20: SORU-CEVAP — akordeon (03.10, kullanıcı kararı): üç büyük liste aynı tıkla-aç deseninde ──
        Kapalı kart: soru + tek satır cevap özeti (yazısı da tıklanınca açılır) · Açık kart: mezhep bazlı cevaplar + kaynak.
        Küçültme başlık/chevron'dan — kıssa/sure akordeonlarıyla birebir aynı davranış. */}
      {sekme === "soru" && (
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
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {b.cevaplar.map((c) => (
                        <div key={c.mezhep} className="rounded-lg border border-white/10 bg-white/[.03] p-2.5">
                          <p className="text-[9px] font-black" style={{ color: "var(--accent-2)" }}>{c.mezhep}</p>
                          <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{c.metin}</p>
                        </div>
                      ))}
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
                  <button type="button" onClick={() => setAcikGenelSoru(i)} title="Genişlet" className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
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
          <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[9px] text-amber-200/80">⚠️ Buradaki cevaplar genel bilgi amaçlıdır — kendi fetvamızı vermeyiz, Diyanet'e yönlendiririz.</p>
        </div>
      )}

      {/* ── 21: KELİME KARTLARI (flashcard) ──
        ★ 03.10: GÜNÜN KELİMELERİ — güne göre deterministik 5 kelime üstte altın rozetli;
        altında rastgele keşif kartları (günün 5'i hariç) */}
      {sekme === "kelime" && (
        <>
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-lg px-2 py-0.5 text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>🌟 GÜNÜN KELİMELERİ</span>
            <p className="text-[9px] text-white/40">her gün 5 yeni kelime — günlük seçim cihazının tarihine göre</p>
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
      )}

      {/* ── 22: SURE BİLGİLERİ — akordeon (01.10): başlığa dokun → aç/kapa; kapalı kart tek satır konu, açık kart uzun açıklama+fazilet ──
        ★ 03.10: kapalı kartın KONU YAZISI da tıklanınca açılır (kıssa sekmesiyle aynı davranış) */}
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
                  onClick={() => setAcikSure(acik ? (q ? s.n : null) : s.n)}
                  className="flex w-full items-center gap-2 p-3 text-left"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{s.n}</span>
                  <h4 className="text-[12px] font-black text-white/90">Sure {s.ad}</h4>
                  {/* ★ 03.10: Arapça ad kartta görünsün — akıllı aramaya ipucu */}
                  {SURE_ARAPCA[s.n] && <span dir="rtl" className="font-arabic text-[11px] text-white/40">{SURE_ARAPCA[s.n]}</span>}
                  {ayetSayisi != null && <span className="text-[8.5px] font-bold text-white/35">{ayetSayisi} ayet</span>}
                  <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[8.5px] font-bold text-white/50">{s.inis}'de inmiştir</span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 ${acik ? "rotate-180" : ""}`} />
                </button>
                {!acik && (
                  <button type="button" onClick={() => setAcikSure(s.n)} title="Genişlet" className="block w-full cursor-pointer truncate px-3 pb-3 text-left text-[10px] leading-relaxed text-white/50 transition-colors hover:text-white/80">
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
          {filtreliSureler.length === 0 && <p className="py-6 text-center text-[10px] text-white/40">Aradığın sure listede yok — Arapça adıyla da deneyebilirsin (örn. الملك) ya da numara yaz.</p>}
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
      {sekme === "dua" && <DuaRehberBolumu filtreliDuaRehber={filtreliDuaRehber} duaOkunduTick={duaOkunduTick} duaOkunduArttir={() => setDuaOkunduTick((v) => v + 1)} />}

      {/* ── 41: HOCA KARŞILAŞTIRMA ── */}
      {sekme === "hoca" && (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">Aynı ayeti farklı hocalardan dinle — "bu kelimeyi kim nasıl okuyor" 🎧 · üstteki aramaya <b className="text-white/70">bakara 250</b> gibi yaz, istediğin ayeti dinle</p>
          <div className="flex flex-wrap gap-1.5">
            {hocaOzel && (
              <button key="ozel" type="button" onClick={() => { setHocaAyet(-1); setHocaCaliyor(false); hocaAudioRef.current?.pause(); }}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hocaAyet === -1 ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={hocaAyet === -1 ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                🔍 {hocaOzel.sureAdi} {hocaOzel.ayet}
              </button>
            )}
            {HOCA_KARSILASTIRMA_AYETLER.map((ay, i) => (
              <button key={i} type="button" onClick={() => { setHocaAyet(i); setHocaCaliyor(false); hocaAudioRef.current?.pause(); }}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hocaAyet === i ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={hocaAyet === i ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                {ay.sureAdi} {ay.ayet}
              </button>
            ))}
          </div>
          {(() => { const ay = hocaAktifAyet; if (!ay) return null; return (
            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{hocaAyet === -1 ? "Aramadan seçtin" : ay.etiket}</p>
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
          {/* ★ ORTADAKİ KONUM BUTONU (01.10): tıkla → cihaz konumu → harita anında açılır */}
          <button type="button" onClick={camiKonumAl} disabled={camiKonumAliniyor}
            className="mx-auto flex w-full max-w-[280px] items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-[11px] font-black text-white transition hover:brightness-110 active:scale-[.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,rgba(215,170,82,.25),rgba(215,170,82,.08))" }}>
            {camiKonumAliniyor ? "⏳ Konum alınıyor…" : "📍 Konumumdan Bul"}
          </button>
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
                if (!camiKonum.trim()) camiKonumAl(); else setCamiAranan(camiKonum.trim());
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
          {!camiAranan && <p className="rounded-xl bg-white/[.03] px-3 py-3 text-center text-[9.5px] leading-relaxed text-white/45"><b className="text-white/70">📍 Konumumdan Bul</b>'a bas ya da şehir yazıp Enter'a bas — yakınınızdaki camiler haritada listelenir.</p>}
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
