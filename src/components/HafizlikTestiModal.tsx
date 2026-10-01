// ════════════════════════════════════════════════════════
// HAFIZLIK TESTİ — yol haritası madde 44
// "Devamını getir" modu: ayetin ilk kısmı gösterilir, kullanıcı
// 4 seçenekten devamını bulur. Rastgele ayet + bulanıklaştırma yok —
// sade, hızlı, çalışır. Sure seçilirse o sureden, seçilmezse meşhur
// surelerden sorulur. Veri: api.alquran.cloud.
// ════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useState } from "react";
import { Brain, Check, X, BarChart3 } from "lucide-react";
import { Modal } from "./UIElements";
import { fetchSurahEditions } from "../studio/studioHelpers"; // ★ kayma korumalı çekim (28.09)
import { MEAL_EDITIONS, type Lang } from "../i18n";
import {
  hafizlikIstKaydet, hafizlikIstOku, hafizlikDevamOku, hafizlikDevamKaydet,
  rozetleriTazele, type HafizlikIstatistik,
} from "../hafizlikIstatistik";

interface HafizlikTestiModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
  /** ★ SORU MEALİ DİLİ (01.10): cevap sonrası "doğrusu" satırı seçili dilin mealinden gelir */
  lang?: Lang;
}

interface Soru {
  s: number;
  sn: string;
  a: number;
  bas: string;      // ayetin ilk ~60 karakteri
  devam: string;    // doğru devam
  secenekler: string[]; // 4 seçenek (doğru dahil)
  /** ★ SEÇİLİ DİLİN MEALİ (01.10): cevap sonrası "doğrusu" satırında gösterilir */
  meal: string;
}

// Meşhur sureler — test havuzu (yeterli ayet sayısı + tanınırlık)
// ★ ÇOĞALTILDI (25.09 genişleme): 59 → 114 sure. Sorular canlı API'den
//   (alquran.cloud, Diyanet meal) geldiği için içerik uydurma YOK — havuz
//   ne kadar genişse test o kadar zengin. Kısa sureler Kolay'da; Zor'da
//   uzun ayetli sureler (Bakara, Âl-i İmrân, Nisâ…).
// (101 çıkarıldı — en uzun ayeti 51 kr, soru formatı için kısa; 28.09 canlı tarama kanıtı)
const TEST_SURELERI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 31, 33, 36, 39, 40, 41, 43, 45, 46, 49, 55, 62, 67, 87, 93, 94, 95, 96, 97, 98, 99, 100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
// ★ KOLAY — kısa meşhur sureler + son cüz (Cüz 30'un tamamı: 78-114) + Fâtiha: 37 sure
const KOLAY_SURELER = [1, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
// ★ ORTA — orta uzunluk, hafızlarda popüler sureler: 26 sure
const ORTA_SURELER = [12, 13, 14, 17, 18, 19, 20, 21, 22, 24, 25, 27, 28, 29, 31, 34, 35, 36, 47, 49, 55, 57, 62, 67, 71, 76];
// ★ ZOR — uzun ayetli sureler (devam kısmı garantili): 52 sure
const ZOR_SURELER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 23, 26, 30, 32, 33, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 48, 50, 51, 52, 53, 54, 56, 58, 59, 60, 61, 63, 64, 65, 66, 68, 69, 70, 72, 73, 74, 75, 77, 88, 104];
const SEVIYELER = [
  { id: "kolay", ad: "Kolay", emoji: "🌱", sureler: KOLAY_SURELER, aciklama: "Kısa meşhur sureler — Yâsîn, İhlâs, Felak tarzı" },
  { id: "orta", ad: "Orta", emoji: "🌿", sureler: ORTA_SURELER, aciklama: "Orta sureler — Kehf, Yâsîn, MÜlk, Rahmân" },
  { id: "zor", ad: "Zor", emoji: "🏔️", sureler: ZOR_SURELER, aciklama: "Uzun ayetli sureler — Bakara, Âl-i İmrân, Nisâ" },
] as const;
type SeviyeId = typeof SEVIYELER[number]["id"];
// ★ TUR BOYUTU SEÇİLEBİLİR (28.09, kullanıcı kararı): "5 soru ne demek, daha çok olsun,
//   yüzlerce gerekirse insanlar vakit harcasın" → 5/15/30/Sınırsız mod. Havuz canlı
//   API'den geldiği için sınırsız modda sorular bitmez.
const TUR_BOYUTLARI = [
  { id: 5, label: "5 soru", emoji: "⚡" },
  { id: 15, label: "15 soru", emoji: "🔥" },
  { id: 30, label: "30 soru", emoji: "🏆" },
  { id: 0, label: "Sınırsız", emoji: "♾️" },
] as const;
const TUR_BOYUTU = 5; // varsayılan — kullanıcı seçer

function karistir<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ★ SINIRSIZ MOD CANLI PERFORMANS GRAFİĞİ (28.09): son 20 sorunun doğruluk çizgisi.
//   Kayan pencere: her nokta, o ana kadarki pencere-doğruluğunun yüzdesi — çizgi
//   düşüyorsa son sorularda zorlanıyorsun, yükseliyorsa formdasın. Yalnız sınırsız
//   modda görünür (sınırlı tur zaten kısa; 5/15/30 soruda grafiğin anlamı yok).
//   Kırmızı nokta = o soruya yanlış, yeşil = doğru. %50 kesikli referans çizgisi var.
const PerformansCizgisi: React.FC<{ gecmis: Array<{ dogru: boolean }> }> = ({ gecmis }) => {
  const W = 100, H = 40, PAD = 3;
  const son20 = gecmis.slice(-20);
  if (son20.length < 2) return null;
  const degerler = son20.map((_, i) => (son20.slice(0, i + 1).filter((g) => g.dogru).length / (i + 1)) * 100);
  const pts = degerler.map((v, i) => ({
    x: (i / (son20.length - 1)) * (W - 2 * PAD) + PAD,
    y: H - PAD - (v / 100) * (H - 2 * PAD),
  }));
  const cizgi = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const alan = `${cizgi} L${pts[pts.length - 1].x.toFixed(2)},${H - PAD} L${pts[0].x.toFixed(2)},${H - PAD} Z`;
  const son = degerler[degerler.length - 1];
  const sonRenk = son >= 80 ? "text-emerald-300" : son >= 60 ? "text-amber-300" : "text-red-300";
  const ortaY = H - PAD - (H - 2 * PAD) / 2;
  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-2.5">
      <div className="mb-1 flex items-center justify-between text-[8.5px] font-black uppercase tracking-widest">
        <span className="text-white/40">📈 Canlı performans — son {son20.length} soru</span>
        <span className={sonRenk}>%{Math.round(son)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full" role="img" aria-label="Son 20 sorunun doğruluk çizgisi">
        <defs>
          <linearGradient id="haf-perf-alan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity=".32" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="haf-perf-cizgi" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={ortaY} x2={W - PAD} y2={ortaY} stroke="rgba(255,255,255,.09)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        <path d={alan} fill="url(#haf-perf-alan)" />
        <path d={cizgi} fill="none" stroke="url(#haf-perf-cizgi)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={son20[i].dogru ? 0.9 : 1.4} fill={son20[i].dogru ? "#34d399" : "#f87171"} />
        ))}
      </svg>
    </div>
  );
}

// ★ TUR DOĞRULUK GRAFİĞİ (29.09, kullanıcı isteği): özet ekranda turun TAMAMININ
//   soru-soru dökümü — yeşil sütun = doğru, kırmızı = yanlış; üstünde altın çizgi
//   turun içindeki anlık doğruluk yüzdesini gösterir (başta düştün mü, toparladın mı
//   tek bakışta görünür). Sınırsız modda 60+ soru olsa da sütunlar ölçeklenir.
const TurDogrulukGrafigi: React.FC<{ gecmis: Array<{ dogru: boolean }> }> = ({ gecmis }) => {
  const n = gecmis.length;
  if (n < 2) return null;
  const H = 40, COL = 10, PAD = 4;
  const W = n * COL + PAD * 2;
  const degerler = gecmis.map((_, i) => (gecmis.slice(0, i + 1).filter((g) => g.dogru).length / (i + 1)) * 100);
  const pts = degerler.map((v, i) => ({ x: PAD + i * COL + COL / 2, y: H - PAD - (v / 100) * (H - 2 * PAD) }));
  const cizgi = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const son = Math.round(degerler[degerler.length - 1]);
  const sonRenk = son >= 80 ? "text-emerald-300" : son >= 60 ? "text-amber-300" : "text-red-300";
  const ortaY = H - PAD - (H - 2 * PAD) / 2;
  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-2.5">
      <div className="mb-1 flex items-center justify-between text-[8.5px] font-black uppercase tracking-widest">
        <span className="text-white/40">📊 Turun doğruluk grafiği — {n} soru</span>
        <span className={sonRenk}>son: %{son}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full" role="img" aria-label="Turun soru soru doğruluk grafiği">
        <defs>
          <linearGradient id="haf-tur-cizgi" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <line x1={PAD} y1={ortaY} x2={W - PAD} y2={ortaY} stroke="rgba(255,255,255,.09)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        {gecmis.map((g, i) => (
          <rect key={i} x={PAD + i * COL + 2.5} y={PAD} width={COL - 5} height={H - 2 * PAD} rx={1.5}
            fill={g.dogru ? "#34d399" : "#f87171"} opacity={g.dogru ? 0.85 : 0.9} />
        ))}
        <path d={cizgi} fill="none" stroke="url(#haf-tur-cizgi)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mt-1 text-center text-[7.5px] text-white/30">🟩 doğru · 🟥 yanlış · 📈 çizgi = o ana kadarki doğruluk</p>
    </div>
  );
}

export const HafizlikTestiModal: React.FC<HafizlikTestiModalProps> = ({ open, onClose, notify, lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [soru, setSoru] = useState<Soru | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secim, setSecim] = useState<number | null>(null); // seçilen index
  const [puan, setPuan] = useState({ dogru: 0, toplam: 0 });
  // ★ YANLIŞ SAYACI + SORU GEÇMİŞİ (28.09, kullanıcı kararı): "doğru var ama yanlış kaç
  //   tane yok" + özette her soruya "neden yanlış" açıklaması istendi. Geçmişte her soru
  //   için sure/ayet + doğru devam metni tutulur; özet ekranda listelenir.
  const [yanlis, setYanlis] = useState(0);
  const [gecmis, setGecmis] = useState<Array<{ sn: string; a: number; dogru: boolean; devam: string }>>([]);
  // ★ TUR ÖZETİ (28.09): "Turu Bitir → Özet" — İyi/Orta/Zayıf tabiri + neden/açıklama listesi
  const [ozetAcik, setOzetAcik] = useState(false);
  // ★ Zorluk seviyesi + tur takibi (5 soruluk turlar)
  const [seviye, setSeviye] = useState<SeviyeId>("kolay");
  const [seviyeSecili, setSeviyeSecili] = useState(false);
  // ★ Tur boyutu seçimi (28.09): 0 = sınırsız
  const [turBoyu, setTurBoyu] = useState<number>(5);
  // ★ İstatistik görünümü (madde 52)
  const [istGoster, setIstGoster] = useState(false);
  const [ist, setIst] = useState<HafizlikIstatistik>(() => hafizlikIstOku());
  // ★ Kaldığın yerden devam (madde 38)
  const [devam, setDevam] = useState(() => hafizlikDevamOku());
  // ★ Sınırsız mod otomatik-tekrar referansları (28.09): modal kapanınca zamanlayıcı durur
  const yenidenDeneRef = React.useRef(0);
  const openRef = React.useRef(open);
  const seviyeSeciliRef = React.useRef(seviyeSecili);
  React.useEffect(() => { openRef.current = open; }, [open]);
  React.useEffect(() => { seviyeSeciliRef.current = seviyeSecili; }, [seviyeSecili]);

  // ★ SORU ÜRETİMİ (28.09): sınırsız modda "1 sorudan başka yok" sorunu — soruHazirla
  //   başarısız olunca (API yavaş/hata) kullanıcı boş ekranda kalıyordu. Artık: havuz
  //   TAZELENİR (splice havuzu tüketmişti) + 12 sure denenir + hata olursa 2 sn sonra
  //   OTOMATİK yeniden dener (maks. 5 kez). "1000 yap" isteği böylece karşılanır —
  //   sorular API'den gelmeye devam eder, kullanıcı durmak istediğinde X ile çıkar.
  const soruHazirla = useCallback(async (sessiz = false) => {
    setYukleniyor(true);
    if (!sessiz) { setSecim(null); setSoru(null); }
    try {
      const havuz = [...(SEVIYELER.find(s => s.id === seviye)?.sureler ?? TEST_SURELERI)];
      let soruPaket: { sn: number; d: Awaited<ReturnType<typeof fetchSurahEditions>> } | null = null;
      for (let deneme = 0; deneme < 12 && !soruPaket; deneme++) {
        // Havuz boşaldıysa tazele — uzun turlarda aynı sureler tekrar gelebilir (istenen davranış)
        if (havuz.length === 0) havuz.push(...(SEVIYELER.find(s => s.id === seviye)?.sureler ?? TEST_SURELERI));
        const sn = havuz.splice(Math.floor(Math.random() * havuz.length), 1)[0];
        // ★ KAYMA KORUMASI (28.09): merkezî çekim — tr.diyanet şüpheliyse tr.yazir → tr.vakfi fallback
        // ★ 429 KORUMASI (28.09): alquran.cloud Limit'e takıldıysa havuzu taramayı bırak —
        //   her deneme yeni istek atar, durumu daha da kötüleştirir. Catch bloğu halleder.
        let d: Awaited<ReturnType<typeof fetchSurahEditions>>;
        // ★ SORU MEALİ DİLİ (01.10): edition seçili dilden gelir (MEAL_EDITIONS[lang]) —
        //   tr.diyanet yerine en.sahih / ar.alafasy / id.indonesian / ur.jalandhry…
        //   Arapça-devam testinin KENDİSİ hep Arapça (değişmez); meal yalnız
        //   cevap sonrası "doğrusu" satırında gösterilir. Kayma koruması aynen:
        //   Türkçe edition'larda yazir→vakfi fallback devrede.
        try { d = await fetchSurahEditions(sn, MEAL_EDITIONS[lang] ?? "tr.diyanet"); }
        catch (e) {
          if ((e as Error & { status?: number })?.status === 429) throw e;
          continue; // bu sure uymadı (kısa/boş) — başka sure dene
        }
        const ayahsTmp = d.arabic;
        const enUzun = Math.max(...ayahsTmp.map(a => a.text.length));
        if (enUzun < 55) continue; // bu sure çok kısa → başka sure dene
        soruPaket = { sn, d };
      }
      if (!soruPaket) throw new Error("havuz-bos");
      const sn = soruPaket.sn;
      const d = soruPaket.d;
      const ayahs: Array<{ text: string }> = d.arabic;
      const secilenMealler: string[] = d.tr; // ★ seçili dilin mealleri (arabic ile hizalı)
      const snAdi: string = d.name;
      // Ayet sayısı 4'ten azsa kısa sure — uygun ayet bul (devam kısmı olsun diye uzun olanı seç)
      const uzunlukSirası = ayahs.map((a, i) => ({ i, len: a.text.length })).sort((x, y) => y.len - x.len);
      const hedef = uzunlukSirası[uzunlukSirası.length > 1 ? Math.floor(Math.random() * Math.min(3, uzunlukSirası.length)) : 0];
      const tam = ayahs[hedef.i].text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "").trim();
      if (tam.length < 50) throw new Error("kisa");
      const kesme = tam.indexOf(" ", 30);
      const bas = tam.slice(0, kesme > 0 ? kesme : 40);
      const devam = tam.slice(bas.length).trim();
      // Yanlış seçenekler: aynı sureden VEYA komşu surelerden diğer devam parçaları
      // ★ UZUNLUK EŞİTLİĞİ FIX (30.09, kullanıcı bildirimi): eski kesim `k.slice(0, devam.length)`
      //   yanlış şıkları doğru devamdan ÇOK KISA yapabiliyordu (ör. devam 180 kar.
      //   yanlış 40 kar.) → "en uzun şık doğru" taktiği testi bozuyordu. Artık her
      //   yanlış şık, doğru devamla AYNI kelime sayısına kadar kesilir (kelime bazlı),
      //   yani uzunluk ipucu ortadan kalkar; doğru/yanlış ayrımı yalnız hafızadan olur.
      // ★ KARAKTER BANDI YAMASI (01.10, kullanıcı isteği): kelime sayısı eşit olsa bile
      //   harf uzunlukları farklı olabilir (kısa kelimeler → belirgin kısa şık). Şimdi
      //   her yanlış aday, doğru devamın %70–130 bandına çekilir: kısaysa kaynak metinden
      //   ek kelimeler eklenir, uzarsa kesilir. Böylece karakter düzeyinde de ipucu kalmaz.
      const devamKelime = devam.split(/\s+/).filter(Boolean).length;
      const kelimeKes = (t: string, n: number) => { const w = t.split(/\s+/).filter(Boolean); return w.slice(0, Math.max(1, n)).join(" "); };
      // %70–130 karakter bandına çekme: kisaysa fazladan kelime ekle, uzarsa kelime sınırında kes
      const bandaCek = (aday: string, kaynak: string): string => {
        let s = aday.trim();
        const minLen = Math.floor(devam.length * 0.7);
        const maxLen = Math.ceil(devam.length * 1.3);
        const kaynakKelime = kaynak.split(/\s+/).filter(Boolean);
        // Kaynak kelimeler biterse BAŞA SARAR (modulo) — kısa kaynakta bile minLen'e ulaşılır.
        let guven = 0;
        while (s.length < minLen && kaynakKelime.length > 0 && guven < 500) { s += " " + kaynakKelime[guven % kaynakKelime.length]; guven += 1; }
        if (s.length > maxLen) {
          const w = s.split(/\s+/).filter(Boolean);
          while (w.length > 1 && w.join(" ").length > maxLen) w.pop();
          s = w.join(" ");
          if (s.length > maxLen) s = s.slice(0, Math.max(minLen, maxLen - 1)).trim();
        }
        return s;
      };
      const yanlisHavuz: string[] = [];
      for (const a of ayahs) {
        const t = a.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "").trim();
        if (t !== tam && t.length > 25) {
          const k = t.slice(Math.floor(t.length / 3));
          const aday = bandaCek(kelimeKes(k, devamKelime), k);
          if (aday !== devam && !yanlisHavuz.includes(aday)) yanlisHavuz.push(aday);
        }
      }
      while (yanlisHavuz.length < 3) {
        // ★ Dolgu üretici çeşitlilik: aynı ters-çevrilmiş metni tekrar etmesin diye her
        //   turda farklı bir permütasyon/kesim üretir; yine de tekil olmayan atılır.
        const baz = yanlisHavuz.length === 0 ? devam : yanlisHavuz[yanlisHavuz.length - 1];
        let aday = bandaCek(baz.split(/\s+/).reverse().join(" "), tam);
        if (yanlisHavuz.includes(aday) || aday === devam) aday = bandaCek(kelimeKes(tam, devamKelime), tam);
        if (yanlisHavuz.includes(aday) || aday === devam) aday = bandaCek(devam.split(/\s+/).slice().sort().join(" "), tam);
        if (yanlisHavuz.includes(aday) || aday === devam) aday = bandaCek((baz + " " + tam).split(/\s+/).slice(0, Math.max(1, devamKelime)).join(" "), tam);
        if (!yanlisHavuz.includes(aday) && aday !== devam) yanlisHavuz.push(aday);
        else {
          // ★ BANT KORUMASI (01.10): " ﴿﴾" eki bandaCek'ten SONRA ekleniyordu ve
          //   bant üstüne taşıyordu (devam 68 kar. iken şık 91 = %134 kaçtı). Artık
          //   ekli hâl önce maxLen'e sığdırılır, sonra eklenir — bant asla delinmez.
          let ekle = aday + " ﴿﴾";
          if (ekle.length > maxLen) ekle = aday.slice(0, Math.max(minLen, maxLen - 4)).trim() + " ﴿﴾";
          yanlisHavuz.push(ekle);
        }
      }
      const secenekler = karistir([devam, ...yanlisHavuz.slice(0, 3)]);
      setSoru({ s: sn, sn: snAdi, a: hedef.i + 1, bas, devam, secenekler, meal: secilenMealler[hedef.i] ?? "" });
    } catch {
      // ★ 429 (rate limit) ise uzun bekleme: 1sn'lik kısa tekrarlar API'yi döver,
      //   sürekli "soru hazırlanamadı" döngüsüne girer. 6 sn bekle → limit nefes alır.
      notify?.("⚠️ Soru hazırlanamadı — birkaç saniye içinde otomatik tekrar denecek…");
      // ★ OTOMATİK TEKRAR: sınırsız modda takılma olmasın — 6 sn sonra sessizce yeniden dener
      if (yenidenDeneRef.current < 5) {
        yenidenDeneRef.current += 1;
        window.setTimeout(() => { if (openRef.current && seviyeSeciliRef.current) soruHazirla(true); }, 6000);
      } else {
        notify?.("❌ Soru üretilemedi — internet bağlantını kontrol et, seviye ekranına dönmek için üstteki ← tuşunu kullan");
        // ★ BOŞ EKRAN KALMASIN: 5 tekrar da tükendi → seviye ekranına otomatik dön.
        //   Kullanıcı en azından seviye/tur seçimine geri döner, kilitli kalmaz.
        window.setTimeout(() => { if (openRef.current) seviyeEkraninaDon(); }, 1500);
      }
    } finally {
      setYukleniyor(false);
    }
  }, [notify, seviye]);

  useEffect(() => {
    if (open && seviyeSecili && !soru && !yukleniyor) soruHazirla();
    if (!open) {
      setSoru(null); setPuan({ dogru: 0, toplam: 0 }); setSeviyeSecili(false);
      setYanlis(0); setGecmis([]); setOzetAcik(false); yenidenDeneRef.current = 0;
      // ★ Açılışta taze oku — kapanınca sıfırla ki sonraki açılışta devam/istatistik güncel olsun (madde 38 & 52)
      setDevam(hafizlikDevamOku()); setIst(hafizlikIstOku());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seviyeSecili]);

  if (!open) return null;

  const cevapla = (i: number) => {
    if (secim !== null || !soru) return;
    setSecim(i);
    const dogruMu = soru.secenekler[i] === soru.devam;
    setPuan((p) => ({ dogru: p.dogru + (dogruMu ? 1 : 0), toplam: p.toplam + 1 }));
    if (!dogruMu) setYanlis((v) => v + 1);
    // ★ Geçmişe kaydet — özette "neden yanlış" listesi bununla kurulur
    setGecmis((g) => [...g, { sn: soru.sn, a: soru.a, dogru: dogruMu, devam: soru.devam }]);
    // ★ İstatistik + rozet kaydı (madde 52 & 16) — yalnız cihazda
    hafizlikIstKaydet(soru.s, dogruMu);
    setIst(hafizlikIstOku());
    rozetleriTazele();
  };

  // ★ GERİ TUŞU (28.09, kullanıcı kararı): "hafızlık zorluk derecesi kısmı seçildikten
  //   sonra geri tuşu ekle" — soru ekranından seviye ekranına döner; tur istatistiği
  //   istatistiğe işlenmiş olarak kalır (hak edilmemiş puan silinmez).
  const seviyeEkraninaDon = () => {
    hocaAudioPauseGuvenli();
    setSeviyeSecili(false);
    setSoru(null);
    setSecim(null);
  };
  // Turu istediği an bitirmek için: "Turu Bitir" de özete götürür
  const turOzetiGoster = () => {
    if (soru && secim !== null) hafizlikDevamKaydet(seviye, puan.dogru, puan.toplam);
    setOzetAcik(true);
  };
  // Yeni tur: sayaçlar sıfır, özet kapanır, ilk soru gelir.
  // ★ FIX (28.09): soruHazirla çağrılmıyordu — useEffect bağımlılıkları (open, seviyeSecili)
  //   değişmediği için yeni turda soru HİÇ istenmiyor, boş ekranda kalınıyordu.
  const yeniTurBaslat = () => {
    setOzetAcik(false); setSoru(null); setSecim(null);
    setPuan({ dogru: 0, toplam: 0 }); setYanlis(0); setGecmis([]);
    yenidenDeneRef.current = 0;
    hafizlikDevamKaydet(seviye, 0, 0);
    soruHazirla();
  };
  // Ses ref'i yok — güvenlik için boş; geri tuşu sadece state temizler.
  const hocaAudioPauseGuvenli = () => { /* future-proof: ses durdurma gerekirse */ };

  return (
    <Modal title={tt("v2HafizlikTitle")} sub={tt("v2HafizlikSub")} onClose={onClose}>
      {/* ★ ZORLUK SEÇİMİ — seviye seçilmeden soru başlamaz */}
      {!seviyeSecili ? (
        <div className="space-y-2">
          {/* ★ KALDIĞIN YERDEN DEVAM (madde 38) */}
          {devam && !istGoster && (
            <button type="button"
              onClick={() => { setSeviye((devam.seviye as SeviyeId) ?? "kolay"); setSeviyeSecili(true); setPuan({ dogru: 0, toplam: 0 }); setYanlis(0); setGecmis([]); setOzetAcik(false); yenidenDeneRef.current = 0; }}
              className="flex w-full items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[.08] p-3 text-left transition hover:border-amber-400/50">
              <span className="text-xl">⚡</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-amber-200">Kaldığın yerden devam</p>
                <p className="text-[8.5px] text-white/50">
                  Son turun: {SEVIYELER.find((s) => s.id === devam.seviye)?.ad ?? devam.seviye} · {devam.dogru}/{devam.toplam}
                  {devam.tarih ? ` · ${new Date(devam.tarih).toLocaleDateString("tr-TR")}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-amber-500/20 px-2 py-1 text-[8.5px] font-black text-amber-200">Başla →</span>
            </button>
          )}

          {/* ★ İSTATİSTİK GÖRÜNÜMÜ (madde 52) */}
          <button type="button" onClick={() => setIstGoster((v) => !v)} className="flex w-full items-center justify-center gap-1.5 rounded-lg glass-soft py-1.5 text-[9.5px] font-bold text-white/60 transition hover:text-white">
            <BarChart3 size={11} /> {istGoster ? "İstatistiği Gizle" : "Hafızlık İstatistiklerim"}
          </button>
          {istGoster && (
            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              {ist.toplamSoru === 0 ? (
                <p className="text-center text-[9.5px] text-white/40">Henüz soru çözmedin — ilk turunla istatistik başlar 📊</p>
              ) : (
                <>
                  <div className="mb-2 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-[13px] font-black text-emerald-300">{ist.toplamDogru}</p>
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Doğru</p>
                    </div>
                    <div className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-[13px] font-black text-white/80">{ist.toplamSoru}</p>
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Soru</p>
                    </div>
                    <div className="rounded-lg bg-white/5 py-1.5">
                      <p className="text-[13px] font-black text-amber-300">{Math.round((ist.toplamDogru / ist.toplamSoru) * 100)}%</p>
                      <p className="text-[7.5px] font-bold uppercase tracking-wider text-white/40">Başarı</p>
                    </div>
                  </div>
                  {Object.entries(ist.sureler).length > 0 && (
                    <>
                      <p className="mb-1 text-[8.5px] font-black uppercase tracking-widest text-white/40">Sure dağılımı (en çok çalıştıkların)</p>
                      <div className="space-y-1">
                        {Object.entries(ist.sureler)
                          .sort((a, b) => b[1].tekrar - a[1].tekrar).slice(0, 5)
                          .map(([sureNo, k]) => (
                            <div key={sureNo} className="flex items-center gap-2 text-[9px]">
                              <span className="w-16 shrink-0 truncate text-white/70">Sure {sureNo}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full" style={{ width: `${Math.round((k.dogru / k.tekrar) * 100)}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }} />
                              </div>
                              <span className="shrink-0 text-white/45">{k.dogru}/{k.tekrar}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  {ist.zorlanilan.length > 0 && (
                    <p className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-[9px] leading-relaxed text-amber-200/90">
                      💡 Zorlandığın sureler: {ist.zorlanilan.slice(0, 5).join(", ")} — bu sureleri tekrar okumanı öneririz
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <p className="mb-2 text-center text-[10px] text-white/50">Zorluk seviyesi seç:</p>
          {SEVIYELER.map((s) => (
            <button key={s.id} type="button"
              onClick={() => { setSeviye(s.id); setSeviyeSecili(true); setPuan({ dogru: 0, toplam: 0 }); setYanlis(0); setGecmis([]); setOzetAcik(false); yenidenDeneRef.current = 0; hafizlikDevamKaydet(s.id, 0, 0); }}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3.5 text-left transition hover:border-white/25 hover:bg-white/[.05]">
              <span className="text-2xl">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-black text-white/90">{s.ad}</p>
                <p className="text-[9px] text-white/50">{s.aciklama}</p>
              </div>
              <span className="shrink-0 rounded-lg px-2 py-1 text-[8.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                {turBoyu === 0 ? "♾️" : `${turBoyu} soru`}
              </span>
            </button>
          ))}
          {/* ★ TUR BOYUTU SEÇİCİ (28.09) — 5/15/30/Sınırsız */}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[.03] p-3">
            <p className="mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/40">Tur boyutu — kaç soru?</p>
            <div className="grid grid-cols-4 gap-1.5">
              {TUR_BOYUTLARI.map((t) => (
                <button key={t.id} type="button" onClick={() => setTurBoyu(t.id)}
                  className={`rounded-lg py-1.5 text-[9px] font-black transition ${turBoyu === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                  style={turBoyu === t.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
            {turBoyu === 0 && <p className="mt-1.5 text-center text-[8.5px] text-white/35">♾️ Sınırsız modda sorular bitmez — durmak istediğinde üstteki "Turu Bitir" ile özet gör, X ile çıkarsan istatistiğin kayıtlı kalır</p>}
          </div>
        </div>
      ) : ozetAcik ? (
        <>
        {/* ★ TUR ÖZETİ (28.09): İyi/Orta/Zayıf tabiri + yanlışların neden/açıklaması */}
        {(() => {
          const toplam = puan.toplam || 1;
          const yuzde = Math.round((puan.dogru / toplam) * 100);
          const tabir = yuzde >= 80 ? { ad: "İYİ", emoji: "🌟", renk: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-400/30", mesaj: "Maşâallah! Hafızanın sağlam — bu tempoyla devam!" }
            : yuzde >= 60 ? { ad: "ORTA", emoji: "🌿", renk: "text-amber-300", bg: "bg-amber-500/10 border-amber-400/30", mesaj: "Fena değil — zorlandığın yerleri tekrar edince İyi olacak." }
            : { ad: "ZAYIF", emoji: "🌱", renk: "text-red-300", bg: "bg-red-500/10 border-red-400/30", mesaj: "Endişelenme — tekrar, hafızlığın anası. Aynı sureleri bir daha oku." };
          const yanlislar = gecmis.filter((g) => !g.dogru);
          return (
            <>
              <div className={`mb-3 rounded-xl border p-4 text-center ${tabir.bg}`}>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/45">Tur özeti</p>
                <p className={`mt-1 font-display text-[22px] font-black ${tabir.renk}`}>{tabir.emoji} {tabir.ad}</p>
                <p className="mt-0.5 text-[13px] font-black text-white">✓ {puan.dogru} doğru · ✗ {yanlis} yanlış · {puan.dogru}/{puan.toplam} (%{yuzde})</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-white/70">{tabir.mesaj}</p>
                {yuzde >= 80 && <p className="mt-1 text-[9px] font-bold text-emerald-300/80">🎁 İpucu: Bugünün Hediyesi'nde sana hafızlığa uygun hediyeler var — ana ekrandaki 🎁 butonuna bak!</p>}
                {yanlislar.length > 0 && <p className="mt-1 text-[9px] text-amber-200/70">📖 Hafızlığa uygun: aşağıdaki ayetleri bugün 3 kez oku, yarın aynı testte zorlanmazsın.</p>}
              </div>

              {/* ★ TURUN TAMAMININ GRAFİĞİ (29.09): soru-soru yeşil/kırmızı sütunlar + anlık doğruluk çizgisi */}
              {puan.toplam >= 2 && <TurDogrulukGrafigi gecmis={gecmis} />}

              {yanlislar.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/45">Neden yanlış? — doğrusuyla birlikte</p>
                  {yanlislar.map((y, i) => (
                    <div key={i} className="rounded-xl border border-red-400/20 bg-red-500/[.06] p-2.5">
                      <p className="text-[9.5px] font-black text-red-200">✗ {y.sn} · {y.a}. Ayet — devamını bilemedin</p>
                      <p className="mt-1 text-right font-arabic text-[12px] leading-relaxed text-emerald-200/90" dir="rtl">{y.devam}</p>
                      <p className="mt-1 text-[8.5px] text-white/45">↑ Doğrusu bu — bugün 3 kez okuman yeterli</p>
                    </div>
                  ))}
                </div>
              )}

              {yanlislar.length === 0 && puan.toplam > 0 && (
                <p className="mb-3 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-center text-[10px] font-bold text-emerald-200">🏆 Tek yanlışın yok — kurban ol, sen gerçek hafızsın!</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={yeniTurBaslat}
                  className="rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
                  style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                  Yeni Tur Başlat →
                </button>
                <button type="button" onClick={() => { setOzetAcik(false); seviyeEkraninaDon(); }}
                  className="rounded-xl border border-white/15 py-3 text-[11px] font-bold text-white/70 transition hover:bg-white/5 hover:text-white">
                  ← Seviye Değiştir
                </button>
              </div>
            </>
          );
        })()}
        </>
      ) : (
      <>
      {/* ★ GERİ TUŞU + Seviye göstergesi + puan bandı (28.09) */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/[.04] px-2.5 py-2 text-[10px] font-bold text-white/60">
        <button type="button" onClick={seviyeEkraninaDon} title="Seviye ekranına dön"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white">←</button>
        <Brain size={13} className="shrink-0" style={{ color: "var(--accent)" }} />
        <span className="shrink-0">{SEVIYELER.find(s => s.id === seviye)?.emoji} {SEVIYELER.find(s => s.id === seviye)?.ad}</span>
        <span className="shrink-0">·</span>
        <span className="shrink-0">✓ <b className="text-emerald-300">{puan.dogru}</b> · ✗ <b className="text-red-300">{yanlis}</b></span>
        <span className="ml-auto shrink-0">Tur: <b className="text-white/80">{turBoyu === 0 ? `${puan.toplam}` : `${Math.min(puan.toplam + (soru ? 1 : 0), turBoyu)}/${turBoyu}`}</b></span>
      </div>

      {/* ★ CANLI PERFORMANS GRAFİĞİ — yalnız sınırsız modda; her cevaptan sonra güncellenir */}
      {turBoyu === 0 && gecmis.length >= 2 && <PerformansCizgisi gecmis={gecmis} />}

      {yukleniyor && (
        <div className="flex h-32 items-center justify-center gap-2 text-[11px] font-bold text-white/40">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          Soru hazırlanıyor…
        </div>
      )}

      {soru && !yukleniyor && (
        <>
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] p-4">
            <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-white/40">{soru.sn} · {soru.a}. Ayet</p>
            <p className="text-right font-arabic text-[17px] leading-relaxed" dir="rtl" style={{ color: "var(--accent-2)" }}>{soru.bas} …</p>
            <p className="mt-1.5 text-center text-[9px] text-white/35">Bu ayetin DEVAMI hangisi?</p>
          </div>

          <div className="space-y-1.5">
            {soru.secenekler.map((sec, i) => {
              const dogruSecenek = sec === soru.devam;
              const secildi = secim === i;
              const goster = secim !== null;
              return (
                <button key={i} type="button" onClick={() => cevapla(i)} disabled={goster}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-right font-arabic text-[13px] leading-relaxed transition ${
                    goster && dogruSecenek ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                    : goster && secildi && !dogruSecenek ? "border-red-400/50 bg-red-500/15 text-red-200"
                    : goster ? "border-white/5 bg-white/[.02] text-white/35"
                    : "border-white/10 bg-white/[.03] text-white/85 hover:border-white/25 hover:bg-white/[.05]"
                  }`}
                  dir="rtl">
                  {goster && dogruSecenek && <Check size={13} className="shrink-0 text-emerald-400" />}
                  {goster && secildi && !dogruSecenek && <X size={13} className="shrink-0 text-red-400" />}
                  <span className="flex-1">{sec}</span>
                </button>
              );
            })}
          </div>

          {/* ★ SEÇİLİ DİLİN MEALİ (01.10): cevap verildikten sonra ayetin mealini göster —
              MEAL_EDITIONS[lang]'tan gelen edition'dır (en.sahih / tr.diyanet / …).
              LTR metin dir="ltr" + sol hizalı; Arapça kaynak zaten üstte. */}
          {secim !== null && soru.meal && (
            <div className="mt-2 rounded-xl border border-white/10 bg-white/[.03] p-3" dir="ltr">
              <p className="text-[8.5px] font-black uppercase tracking-widest text-white/35">{MEAL_EDITIONS[lang] === "tr.diyanet" ? "Meal" : "Translation"} · {MEAL_EDITIONS[lang]}</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-white/70">{soru.meal}</p>
            </div>
          )}

          {/* ★ TURU BİTİR — sınırlı turda tur boyutu dolduğunda, sınırsızda her zaman görünür (28.09) */}
          {(turBoyu === 0 || puan.toplam + 1 < turBoyu) && puan.toplam > 0 && (
            <button type="button" onClick={turOzetiGoster}
              className="mt-2 w-full rounded-xl border border-white/15 py-2 text-[10px] font-bold text-white/60 transition hover:bg-white/5 hover:text-white">
              Turu Bitir → Özet
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              // ★ FIX (29.09, canlı testte yakalandı): tur dolunca (toplam >= turBoyu) altın buton
              //   "Turu Bitir → Özet" yazıyordu ama onClick soruHazirla() çağırıyordu — özet ASLA
              //   açılmıyor, soru soru sonsuz turaya giriliyordu. Artık tur dolduysa özet açılır;
              //   tur dolmadıysa sıradaki soru gelir (eski davranış, devam kaydı aynı).
              if (turBoyu > 0 && puan.toplam >= turBoyu) { turOzetiGoster(); return; }
              const sonCevapDogru = secim !== null && soru.secenekler[secim] === soru.devam;
              soruHazirla();
              // ★ Tur bitince devam kaydı — "Kaldığın yerden devam" bundan okur
              if (turBoyu > 0 && puan.toplam + 1 >= turBoyu) hafizlikDevamKaydet(seviye, puan.dogru + (sonCevapDogru ? 1 : 0), puan.toplam + 1);
              else hafizlikDevamKaydet(seviye, puan.dogru, puan.toplam);
            }}
            className="mt-4 w-full rounded-xl py-3 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-[.98]"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            {turBoyu > 0 && puan.toplam >= turBoyu ? "Turu Bitir → Özet" : "Sıradaki Soru →"}
          </button>
        </>
        )}
      </>
      )}
    </Modal>
  );
};
