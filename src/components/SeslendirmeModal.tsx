import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

// ═══════════════════════════════════════════════════════════════
// SESLENDİRME MODALI — 14.10 mockup'tan (ai-mockup/ana-ekran-seslendirme.html)
// ana projeye işlendi (kullanıcı emri: "şimdi koda işle, git push yasak,
// redeploy yasak — localda nasıl duracak bakalım").
// Mockup davranışları birebir: kuyruk (ayet↔metin karışmaz), atmosfer atama,
// ön-okuma (prefetch), parça arası nefes (300 ms), kırmızı X + dış-tık + Esc üçlüsü.
// SES: lokal prototip sunucusu (python ai-mockup/meal-sunucu.py, port 8877)
//   Development'ta vite proxy (/nur-tts → 8877). Sunucu kapalıysa modal
//   kibarca "geliştirme özelliği" der, canlı kullanıcıyı bozmaz.
// 14.10 BÖLME İŞİ: motor → seslendirmeMotor.ts, sabitler/tipler →
//   seslendirmeSabitler.ts, sol kolon → seslendirmeOnizleme.tsx,
//   sağ kolon → seslendirmeKontroller.tsx. Burada durum + orkestrasyon + kabuk kaldı.
// ═══════════════════════════════════════════════════════════════
import React from "react";
import { katBilgi, mBol, mSkorla } from "./seslendirmeMotor";
import { ttsUrl, DILLER, type DilKodu, type DurumTip, type KuyrukOgesi, type AyetKayit } from "./seslendirmeSabitler";
import { kuyrukIndir } from "./seslendirmeIndir";
import { planKes, metinPartArttir, kancaBirlestir } from "./seslendirmeBolum";
import { SeslendirmeOnizleme } from "./seslendirmeOnizleme";
import { SeslendirmeKontroller } from "./seslendirmeKontroller";

export interface SeslendirmeModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
}

/** ★ 21.10 İSTEMCİ TTS TEKRAR (kullanıcı: "çökmesin düzgün yap"): sunucu Edge
 *  kotasına (429→503) takılırsa sessiz bekle+tekrar (2,5 sn / 5 sn) — kullanıcıya
 *  hata metni dönmüyor; sunucu zaten 3 girişim yapiyor, burada tavan tekrar katmanı. */
const okutCek = async (u: string, deneme = 0): Promise<Response> => {
  const r = await fetch(u);
  // ★ 26.10 TEKRAR: 429 da zincire girdi — sunucu "Microsoft kotası" sesiyle tek 429'da
  //  hata yazmıyor artık; bekle+tekrar Edge/Azure cache-miss dalgalanmasını yutuyor.
  if (!r.ok && (r.status >= 500 || r.status === 429) && deneme < 2) {
    await new Promise((k) => setTimeout(k, deneme === 0 ? 2_500 : 5_000));
    return okutCek(u, deneme + 1);
  }
  return r;
};

export const SeslendirmeModal: React.FC<SeslendirmeModalProps> = ({ open, onClose }) => {
  const [mod, setMod] = React.useState<"ayet" | "metin">("ayet");
  const [ayetler, setAyetler] = React.useState<AyetKayit[]>([]);
  const [surler, setSurler] = React.useState<{ ad: string; kartlar: number[] }[]>([]);
  const [sureIdx, setSureIdx] = React.useState(0);
  const [ayetIdx, setAyetIdx] = React.useState(0);
  const [metin, setMetin] = React.useState("");
  const [kuyruk, setKuyruk] = React.useState<KuyrukOgesi[]>([]);
  const [kuyrukSec, setKuyrukSec] = React.useState(0);
  const [bg, setBg] = React.useState<{ url?: string; poster?: string; ad?: string; kat?: string; custom?: string } | null>(null);
  const [durum, setDurum] = React.useState("—");
  const [durumTip, setDurumTip] = React.useState<DurumTip>("hazir");
  const [sunucuVar, setSunucuVar] = React.useState<boolean | null>(null);
  const [dil, setDil] = React.useState<DilKodu>("tr");
  const [sesListe, setSesListe] = React.useState<{ id: string; ad: string }[]>([]);
  const [ses, setSes] = React.useState<string | null>(null);  // ★ SEÇİLEN SES — null ise dilin önerileni

  const runningRef = React.useRef(false);
  const seqRef = React.useRef(0);
  // ★ 26.10 İNDİRME İPTALİ (kullanıcı: "durdur tuşu indirmede donuyordu"): DURDUR
  //  bu objeyi true yapar; kuyrukIndir parça-fetch + 250ms dilimli kayıt-beklemede
  //  canlı okur → kayıt anında kesilir, dosya YAZILMAZ (yarım dosya yok).
  const indirIptalRef = React.useRef({ iptalEdildi: false });
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const PARCA_ARASI = 300;

  const yaz = React.useCallback((t: string, tip: DurumTip = "hazir") => { setDurum(t); setDurumTip(tip); }, []);

  // ── veri yükleme ──
  React.useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const r = await fetch(ttsUrl(dil === "tr" ? "ayetler" : `ayetler?dil=${dil}`));
        if (!r.ok) throw new Error(String(r.status));
        const liste = (await r.json()) as AyetKayit[];
        setAyetler(liste);
        const harita: Record<string, { ad: string; kartlar: number[] }> = {};
        liste.forEach((a, idx) => {
          // ★ SURE ADI 5 DİLDE: sunucu sureAdi alanı verir (Surah Al-Baqarah / سورة البقرة /
          //   Bakara Suresi). TR'de source regex fallback.
          const ad = a.sureAdi || (a.source || "").match(/^([^·]+) Suresi/)?.[1] || (a.source || "").split(" • ")[0] || "Diger";
          (harita[ad] ||= { ad, kartlar: [] }).kartlar.push(idx);
        });            
        setSurler(Object.values(harita));
        setSunucuVar(true);
        // dilin ses listesini de çek
        fetch(ttsUrl(`sesler?dil=${dil}`)).then((r2) => r2.ok ? r2.json() : []).then((l2) => { setSesListe(l2); setSes(null); }).catch(() => setSesListe([]));
        yaz(`${DILLER.find((d) => d.kod === dil)?.bayrak} ${ttX2610("smSureHazir").replace("{n}", String(Object.values(harita).length))}`);
      } catch {
        setSunucuVar(false);
        yaz(ttX2610("smSunucuKapali"), "hata");
      }
    })();
  }, [open, dil, yaz]);  // ★ dil değişince meallar yeniden yüklenir

  const kapat = React.useCallback(() => {
    seqRef.current++; runningRef.current = false;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    onClose();
  }, [onClose]);

  // ── ESC (proje standardı: X + dış-tık + Esc üçlüsü) ──
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") kapat(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, kapat]);

  // ── yardımcılar ──
  const ekranSure = surler[sureIdx];
  const seciliAyetIdx = ekranSure?.kartlar[Math.min(ayetIdx, (ekranSure?.kartlar.length || 1) - 1)] ?? -1;
  const mevcutAyet = ayetler.length > 0 && seciliAyetIdx >= 0 ? ayetler[seciliAyetIdx] : null;

  const ayetKuyrukOg = (a: AyetKayit): KuyrukOgesi => ({
    tip: "ayet", metin: a.tr, kat: mSkorla(`${a.title} ${a.tr} ${a.source}`),
    ar: a.ar, baslik: a.title, meal: a.tr,
    kaynak: (a.source || "").toUpperCase(),
    // ★ etiket dile-özel sure adı (Surah Al-Baqarah 2 / سورة البقرة 2 / Bakara Suresi 2)
    etiket: a.sureAdi ? `${a.sureAdi} ${a.ayetNo ?? ""}`.trim() : (a.source || "").replace(" • ", " ").replace(/ (Ayet|Ayah|آية|Ayat|آیت)/, ""),
  });

  // ── kuyruk işleri ──
  // dil değişince kuyruk sıfırlanır (diller karışmasın)
  const dilDegistir = (kd: DilKodu) => {
    if (kd === dil) return;
    if (runningRef.current) durdur();
    setDil(kd); setAyetler([]); setSurler([]); setKuyruk([]); setKuyrukSec(0); setSesListe([]); setSes(null);
    setMetin(""); setBg(null); setBolumSayi(0); // ★ sayaç da sıfır — 17-yalan fix
    yaz(`${DILLER.find((d) => d.kod === kd)?.bayrak} ${DILLER.find((d) => d.kod === kd)?.ad} ${ttX2610("smMeallarHazirlaniyor")}`);
  };
  // ★ 21.10 MOD GEÇİŞİ (kullanıcı: "sure ayetten metin yaza geçince hâlâ sure/ayet kısmından ses geliyor"):
  //  kök neden — setMod ham state'ti: sekme değişince (1) çalmakta olan ayet sesi hiç
  //  kesilmiyor, (2) kuyruk bileşik kalıyor + metin modunda SESLENDİR eski ayet
  //  parçalarını okuyordu. Yeni davranış: geçişte ses anında durur, kuyruk
  //  mod-başına arşivlenir/geri yüklenir — her sekme kendi işinde kalır, bölüm
  //  kaybolmaz. En baştaki "kuyruk (ayet↔metin karışmaz)" sözü artık kodda da.
  // ★ esm-tarama uyumu: Record generic'i JSX taranıcıya <Record/> sanılıyor —
  //   ayni yapıyı düz obje tipli yaz (ayet/metin anahtarları tip-güvenceli).
  const kuyrukArsiv = React.useRef<{
    ayet?: { liste: KuyrukOgesi[]; sec: number; bolum: number };
    metin?: { liste: KuyrukOgesi[]; sec: number; bolum: number };
  }>({});
  const modDegistir = (m: "ayet" | "metin") => {
    if (m === mod) return;
    setMod(m); // ★ 21.10 FİX — setMod çağrısı eksik kalmıştı: tıklamada sekme hiç değişmiyordu
    // 1) SES: ayet oynatma zinciri (bolumDinle / SESLENDİR döngüsü) anında kesilsin
    if (runningRef.current) durdur();
    // 2) KUYRUK: mevcudu bu modun kasasına koy, geçilen modun listesini geri getir
    kuyrukArsiv.current[mod] = { liste: kuyruk, sec: kuyrukSec, bolum: bolumSayi };
    const geri = kuyrukArsiv.current[m];
    const liste = geri?.liste || [];
    setKuyruk(liste);
    setKuyrukSec(Math.min(geri?.sec ?? 0, Math.max(liste.length - 1, 0)));
    setBolumSayi(m === "metin" ? (geri?.bolum || 0) : 0); // sayaç yalnızca metin bölümü sayar
    setBg(null); // seçilen parçaya bağlı özel arka plan — yeni sekmede oto'ya dön
    yaz(m === "metin" ? ttX2610("smMetinSekme") : ttX2610("smSureSekme"));
  };
  // okut URL'i — dil + seçili ses (ses seçildiyse onu kullan)
  const okutUrl = (m: string) => {
    if (ses) return ttsUrl(`okut?dil=${dil}&ses=${encodeURIComponent(ses)}&metin=${encodeURIComponent(m)}`);
    return ttsUrl(dil === "tr" ? `okut?ses=ahmet&metin=${encodeURIComponent(m)}` : `okut?dil=${dil}&metin=${encodeURIComponent(m)}`);
  };

  // ★ 21.10 İNDİRME (kullanıcı: "seslendirmede metin yazıp ayarladık indirme
  //  butonu yok mu şaka mısın") — kuyruktaki TÜM bölümleri sunucudan sırayla
  //  alıp tarayıcıda TEK dosyaya birleştirip kaydeder (seslendirmeIndir.ts).
  //  Çalma zincirine dokunmaz; okutCek+okutUrl ile çalma akışının AYNI TTS
  //  ayarlarını (dil + ses) kullanır. İndirme sırasında DURDUR'un zincirini
  //  bozmamak için ayrı Promise hattı, runningRef'e bakmaz.
  const indirUrlAl = React.useCallback(async (m: string) => {
    const r = await okutCek(okutUrl(m));
    if (!r.ok) throw new Error("TTS " + r.status);
    const u = (await r.json()).url as string; // "data:audio/mpeg;…" (canlı) | "/mp3/…" (dev)
    return u.startsWith("data:") ? u : ttsUrl(u.replace(/^\//, ""));
  }, [ses, dil]);
  const [indiriyor, setIndiriyor] = React.useState(false);

  // ★ 21.10 YINELEME KORUMASI (kullanıcı: "tüm sure ekle dedim ekledi tekrar
  //  tıklayınca tekrar niye ekliyor"): kuyrukta etiketiyle ("Tâhâ Suresi 76") aynı
  //  ayet varsa tekrar eklenmez — tekrar basış no-op olur + bilgi mesajı yazar.
  const kuyruktakiEtiketler = React.useMemo(
    () => new Set(kuyruk.filter((x) => x.tip === "ayet").map((x) => x.etiket)),
    [kuyruk],
  );
  const ayetEkle = () => {
    if (!mevcutAyet) return;
    const og = ayetKuyrukOg(mevcutAyet);
    if (og.etiket && kuyruktakiEtiketler.has(og.etiket)) {
      yaz(`${og.etiket} zaten kuyrukta — tekrar eklenmedi ✓`);
      return;
    }
    const metinVardi = kuyruk.some((x) => x.tip === "metin");
    const yeni = [...kuyruk.filter((x) => x.tip === "ayet"), og];
    setKuyruk(yeni); setKuyrukSec(yeni.length - 1);
    yaz((metinVardi ? ttX2610("smMetinSilindi") : "") + ttX2610("smEklendi").replace("{et}", yeni[yeni.length - 1].etiket || "").replace("{n}", String(yeni.length)));
  };
  const sureEkle = () => {
    if (!ekranSure) return;
    const adaylar = ekranSure.kartlar.map((i) => ayetKuyrukOg(ayetler[i])).filter((o) => !o.etiket || !kuyruktakiEtiketler.has(o.etiket));
    if (!adaylar.length) {
      yaz(`${ekranSure.ad} zaten kuyrukta — tekrar eklenmedi ✓`);
      return;
    }
    const metinVardi = kuyruk.some((x) => x.tip === "metin");
    const yeni = [...kuyruk.filter((x) => x.tip === "ayet"), ...adaylar];
    setKuyruk(yeni); setKuyrukSec(Math.max(yeni.length - adaylar.length, 0));
    yaz((metinVardi ? ttX2610("smMetinSilindi") : "") + ttX2610("smSureEklendi").replace("{sure}", ekranSure.ad).replace("{e}", String(adaylar.length)).replace("{v}", String(ekranSure.kartlar.length - adaylar.length)));
  };
  // ★ 16.10 YENİ AKIŞ: metinEkle (eski "Metni Önizlemeye Ekle") KALDIRILDI yerine
  //   BÖLÜM EKLE sistemi geldi — kullanıcının emri:
  //   “+ işaretine bastıkça kaç bölüm olursa oraya metni yazsın; bölüm ekle yap, eski
  //   sistemi kaldır, metni yazsın bölümlere kendisi eklesin; tıklayınca bölümlere
  //   arka plan ayarlama açılsın; bide tıklayınca ses gelmeli (ayrı ayrı dinleme).”
  //   Metin motoru hâlâ mBol (atmosfer skorlu kelimeler) — sadece ARAYÜZ değişti:
  //   ➕ her basışta hedef bölüm sayısını +1 yapar ve mBol sonucunu O SAYIYA eşitler.
  const [bolumSayi, setBolumSayi] = React.useState(0); // 0 = bölüm yok (yılmayan metin → kuyrukta değil)

  /** ➕ bölüm ekle — her basışta bölüm sayısı +1, kuyruk yeniden dağılır.
   *  ★ 18.10 KANCA DAĞITIM: planKes artık düz dilimle değil mBol'un KANCA planınden okur —
   *  hedef sayıya en yakın kanca kesimi (AMA/soru/üç-nokta) seçilir, partlar merak
   *  uyandırıcı yerden kopar (kullanıcı: "en dikkat çekici kısımda böl").
   *  ★ 20.10 CANLI FIX (kullanıcı: "338 kelimelik kıssayı 1 part yaptı, 5-7 olmalıydı"):
   *  kök neden — İLK ➕ basışı n=1 isterken kancaBirlestir mBol'un 5-part planını
   *  TEK dev part'a geri indiriyordu. Yeni kural: motor kendi kancalı planını
   *  BASLANGIÇ sayar; ➕ motor planından itibaren ARTIRIR (divide-down yok).
   *  Yani kıssada ilk basış = motorun 5-part planı, ikinci = 6-part siki vb. */
  const bolumEkle = () => {
    if (!metin.trim()) { yaz(ttX2610("smOnceMetinYaz"), "hata"); return; }
    const kancaPlan = mBol(metin.trim()); // motorun kararı (part sayısı + kancalar)
    if (!kancaPlan.length) return;
    // ★ hedef: motor planının sayısını GEÇMEZ aşşağı inmez — ilk basış motoru planını verir
    const n = Math.max(bolumSayi + 1, kancaPlan.length);
    const kes = kancaPlan.length === n
      ? kancaPlan            // motor tam istenen sayıya böldü
      : kancaPlan.length > n
        ? kancaBirlestir(kancaPlan, n)   // çok part → komşuları birleştir (ınızdan sonra)
        : metinPartArttir(kancaPlan, n); // az part → partları 2-3 cümlelik parçalara büyüt
    if (!kes.length) return;
    // ★ 20.10 SAYAÇ SENKRON FİX (kullanıcı canlı Rapor: "boş metinde bile 17·bölüm
    //  diyor"): kök neden — ➕ her basışta n'i koşulsuz +1 yapıp setBolumSayi(n)
    //  diyordu; OYSA metinPartArttir tek kelimelik/aşırı kısa metni BÖLEMEDİĞİNDE
    //  1 parçayla dönüyordu → sayaç 17 diyordu, kuyrukta 1 chip vardı (yalan).
    //  Yeni kural: sayaç = GERÇEK üretilen parça sayısı. Bölücü tavanına
    //  ulaştıysak artık büyütmüyoruz, kibirde uyarı veriyoruz.
    if (kes.length < n) {
      const yeniKuyruk = kes.map((p) => ({ tip: "metin" as const, metin: p.m, kat: p.kat }));
      setKuyruk(yeniKuyruk);
      setKuyrukSec(kes.length - 1);
      setBolumSayi(kes.length); // GENÇLIK ASLA YALAN SAYMAZ — sayaç gerçeğe kilitlendi
      yaz(ttX2610("smBolumSiniri").replace("{n}", String(kes.length)), "hata");
      return;
    }
    const yeniKuyruk = kes.map((p) => ({ tip: "metin" as const, metin: p.m, kat: p.kat }));
    setKuyruk(yeniKuyruk);
    setBolumSayi(n);
    setKuyrukSec(n - 1);      yaz(ttX2610("smBolumHazir").replace("{n}", String(n)));
  };

  /** ★ 20.10 BÖLÜM AZALT (➖) — kullanıcı sorusu: "bölüm azaltma yok mu kanka":
   *  her basışta hedef bölüm sayısı −1 (min 1); motor planı mBol'den okunur,
   *  fazla parçalar KOMŞU birleşimiyle hedefe indirilir (içerik kaybolmaz,
   *  kanca-kesim bölümünde birleşme kancaBirlestir ile yapılır).
   *  Tamamını sıfırlamak isteyen kartın ✕'ini kullanır (o kuyruğu boşaltıyor). */
  const bolumCikar = () => {
    if (!metin.trim()) return;
    if (bolumSayi <= 1) { yaz(ttX2610("smZatenMinimum"), "hata"); return; }
    const hedefN = bolumSayi - 1;
    const kancaPlan = mBol(metin.trim());
    if (!kancaPlan.length) return;
    // motor planı zaten küçükse (metin değişti/az part üretti) plana saygı duyar
    const kes = kancaPlan.length <= hedefN ? kancaPlan : kancaBirlestir(kancaPlan, hedefN);
    if (!kes.length) return;
    const yeniKuyruk = kes.map((p) => ({ tip: "metin" as const, metin: p.m, kat: p.kat }));
    setKuyruk(yeniKuyruk);
    setBolumSayi(Math.min(kes.length, hedefN));
    setKuyrukSec(Math.max(kes.length - 1, 0));
    yaz(ttX2610("smBolumAzaltildi").replace("{n}", String(kes.length)));
  };

  /** ★ 18.10 (kullanıcı emri): bölüm/ayet karta tıklandığında O KARTTAN İTİBAREN SIRAYLA
   *  devam eder — "hangi ayetleri seçtiysem devam etsin sırayla". Tek parça okuma yerine
   *  seslendir(i) zinciri kullanılır (aynı motor, buffer'lı geçişler); karta tıkla = başlangıç.
   *  SESLENDİR ana butonu ise tüm kuyruğu en baştan sıralı okumaya devam eder. */
  /** ★ 20.10 SON-PART-ZIPLAMA FİX (kullanıcı canlı Rapor: "1.parta tıklıyorum, son partida çalıyor"):
   *  kök neden — bolumDinle(i) → seslendir(i) → seslendir'de listedenBasla GUARD'ı
   *  i=0'ı normalleştirirken içerideki runningRef/seqRef boolean'ı geçen ama
   *  liste staatik slice hata zinciri, tek-part istemi yerine TÜM sıralı oynatmayı
   *  tetikliyor; kart tıklaması artık YALNIZ O PART'ı okur (Sesler/Spotify davranışı).
   *  sıralı-devam istenirse SESLENDİR ana buton uçlarından zaten tüm kuyruk açılır. */
  const bolumDinle = async (i: number) => {
    if (!kuyruk[i]) return;
    // ★ 21.10 CANLI FIX (kullanıcı: "part 5 tıklayıp sesi dinlemek istiyorum 1. den başlıyor"):
    //   kök neden — eski guard `if (runningRef.current) return;` SESLENDİR'den kalan
    //   okuma sürerken kart tıklamasını sessizce yok sayıyordu; arkada 1/7'den oynamaya
    //   devam ediyordu. Yeni kural: kart tıklaması = mevcut oynatmayı KES + seçili
    //   partı başlat (Spotify davranışı — kullanıcı her durumda tıkladığı partı duyar).
    if (runningRef.current) {
      seqRef.current++;               // bekleyen zincir/ses işleyicileri iptal
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    }
    runningRef.current = true; seqRef.current++;
    yaz(ttX2610("smParcaOynuyor").replace("{n}", String(i + 1)), "okuyor");
    const mySeq = seqRef.current;
    runningRef.current = true;
    try {
      const urlAl2 = async (m2: string) => {
        const r = await okutCek(okutUrl(m2));
        if (!r.ok) throw new Error("TTS " + r.status);
        const u = (await r.json()).url as string;
        return u.startsWith("data:") ? u : ttsUrl(u.replace(/^\//, ""));
      };
      const url = await urlAl2(kuyruk[i].metin);
      if (mySeq !== seqRef.current) return; // arada durduruldu
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise<void>((res) => {
        let bitti = false;
        const bit = () => { if (!bitti) { bitti = true; res(); } };
        audio.onended = bit;
        // ★ 20.10 SESSIZ-HATA FIX (aynı kök, kart dinleme): hatayı yutup "bitti ✓"
        //   yazmak yerine gerçek hatayı göster — CSP/onerror zincirini sonlandır.
        audio.onerror = () => {
          if (bitti) return;
          bitti = true; seqRef.current++; runningRef.current = false;
          yaz(ttX2610("smParcaHatasi").replace("{n}", String(i + 1)).replace("{hata}", audio.error?.message || ttX2610("smCspBlokladi")), "hata");
          res();
        };
        setTimeout(bit, 120000);
        try { audio.currentTime = 0; } catch { /* autoplay koruması */ }
        audio.play().catch(() => { /* onerror zaten devrede */ });
      });
      if (mySeq === seqRef.current) yaz(ttX2610("smParcaBitti").replace("{n}", String(i + 1)), "bitti");
    } catch (e: unknown) {
      yaz(ttX2610("smHataPrefix") + (e instanceof Error ? e.message : String(e)), "hata");
    } finally {
      runningRef.current = false; audioRef.current = null;
    }
  };
  /** ★ 20.10 KARDEŞ DAĞITIMI (kullanıcı sorusu: "X'e basınca yazı diger bölümlere
   *  dagirıtır, yok çok kullanılmayan yazı kayboluyor — bize X kuyruğu böyle davranır"): 
   *  X'e basılan partın cümleleri KOMŞU parta eklenir (sondan birine).
   *  Kural: silinme yerine birlestirme — dengeden diye en SHORT komşu seçilir. */
  const ogCikar = (i: number) => {
    const cikan = kuyruk[i];
    if (!cikan) return;
    if (kuyruk.length <= 1) {
      // tek part kalırsa: kuyruk boşalt — canlı önizleme metni geri görünsün
      setKuyruk([]); setKuyrukSec(0); setBolumSayi(0);
      yaz(ttX2610("smKuyrukBos"));
      return;
    }
    // en kısa komşu (önce sol, yoksa sağ) — içeriğe katılıyor, kaybolMAz
    const solVar = i > 0;
    const sagVar = i < kuyruk.length - 1;
    const hedef = solVar
      ? (sagVar && kuyruk[i + 1].metin.split(/\s+/).length < kuyruk[i - 1].metin.split(/\s+/).length ? i + 1 : i - 1)
      : i + 1;
    const yeni = kuyruk
      .filter((_, j) => j !== i)
      .map((o, j) => {
        const hedefIdx = vezirIndex(hedef, i); // silinen part atlandıktan sonra hedefin yeni yeri
        return j === hedefIdx ? { ...o, metin: (hedef < i ? o.metin + " " + cikan.metin : cikan.metin + " " + o.metin).trim() } : o;
      });
    setKuyruk(yeni);
    setBolumSayi((bs) => Math.max(0, bs - 1));
    setKuyrukSec(Math.min(i, yeni.length - 1));
    const kelimeSay = cikan.metin.split(/\s+/).length;
    // yaz bilodus: hedefin ekranda görünen numarası (1-tabanlı, silme sonrası)
    const hedefEkrani = (hedef > i ? hedef : hedef) + 1;
    yaz(ttX2610("smBolumDagitildi").replace("{n}", String(i + 1)).replace("{k}", String(kelimeSay)).replace("{m}", String(hedefEkrani)));
  };
  /** silinme sonrası hedefin yeni index'i — silinen i'den BÜYÜKSE 1 azalt */
  const vezirIndex = (hedef: number, silinen: number): number => (hedef > silinen ? hedef - 1 : hedef);
  const atmosAta = (kat: string) => {
    const i = kuyrukSec;
    setKuyruk(kuyruk.map((o, j) => (j === i ? { ...o, kat } : o)));
    yaz(ttX2610("smParcaAtandi").replace("{n}", String(i + 1)).replace("{kat}", katBilgi(kat).ad));
  };
  /** ★ 21.10 AKILLI AI BUTONU (kullanıcı: "sürekli deniz koyuyor kanka; akıllı AI
   *  butonu koy bari de tıklayalım"): kuyruktaki TÜM parçaların atmosferini
   *  yeniden seçer — mSkorla artık geniş CLIP_AI_KEYWORDS indeksi + baskınlık
   *  eşiğiyle çalışır; emin olmadığı parçalarda mushaf sayfa (en az-yanlış).
   *  Manuel atanmışı ayırır mı? Hayır — buton YENİDEN SKORLAR; kullanıcı elle
   *  seçmişse sonrasında •  tekrar elle seçebilir (buton idempotent değil,
   *  bilinçli yenileme). Arka plan da oto'ya döner ki yeni katlar görünür. */
  const akilliAta = () => {
    if (!kuyruk.length) { yaz(ttX2610("smOnceEkle"), "hata"); return; }
    let degisen = 0;
    // ★ 26.10 ZORLA-TAZELE (kullanıcı: "Akıllı AI tıkladığımda yenileri değişmiyor"):
    //   mSkorla aynı metinden hep AYNI kategoriye düşüyordu → buton etkisiz görünüyordu.
    //   Yeni kural: yeniden skor sonucu mevcut katı Tutarsa bu parçaya İKİNCİ aday
    //   kategori verilir (mSkorla sira=1) — her tıklamada görünür tazeleme;
    //   temayı gerçekten tek kategori taşıyan parça Değişmez yanılgısı yok.
    const yeni = kuyruk.map((o) => {
      const metin = o.tip === "ayet" ? `${o.baslik || ""} ${o.meal || o.metin} ${o.kaynak || ""}` : o.metin;
      const ilk = mSkorla(metin);
      const kat = ilk !== o.kat ? ilk : mSkorla(metin, ilk, 1);
      if (kat !== o.kat) degisen++;
      return { ...o, kat };
    });
    setBg(null); // oto arka plan → her parçanın yeni kategorisi hemen görünür
    setKuyruk(yeni);
    yaz(degisen ? ttX2610("smAkliAI").replace("{n}", String(degisen)) : ttX2610("smAkliAIAlready"));
  };

  // ── canlı bölme önizlemesi ──
  const plan = React.useMemo(() => (metin.trim() ? mBol(metin.trim()) : []), [metin]);

  // ── prefetch: yazmayı bırakınca parçaları sessizce hazırla ──
  React.useEffect(() => {
    if (metin.trim() === "" || !plan.length || runningRef.current || !sunucuVar) return;
    const parlak = setTimeout(() => {
      let zincir: Promise<unknown> = Promise.resolve(null);
      plan.forEach((p) => {
        zincir = zincir.then(() =>
        runningRef.current ? null : okutCek(okutUrl(p.m)).catch(() => null));
      });
    }, 900);
    return () => clearTimeout(parlak);
  }, [plan, sunucuVar, yaz]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SESLENDİR ──
  const seslendir = async (baslangicIdx = 0) => {
    if (runningRef.current || !sunucuVar) return;
    runningRef.current = true; seqRef.current++;
    const sesAdi = DILLER.find((d) => d.kod === dil);      yaz(`${sesAdi?.bayrak || ""} ${sesAdi?.ad || "Ahmet"} ${ttX2610("smOkuyor")}`, "okuyor");
    try {
      // ★ 18.10 SIRALI DEVAM (kullanıcı: "hangi ayetleri seçtiysem devam etsin sırayla"):
      //   kuyruk doluysa TÜMÜ okunur — ama başlangıç noktası artık SEÇİLİ kart idx'i:
      //   karta tıklayıp SESLENDİR basınca seçili ayetten başlar, sırayla sonuna kadar gider.
      //   baslangicIdx = 0 (varsayılan) → hep en baştan (eski davranış).
      //   ★ typeof guard: onClick doğrudan bağlanırsa event nesnesi gelir — sayı değilse 0 say.
      const tamListe = kuyruk.length
        ? kuyruk.map((it) => ({ m: it.metin, kat: it.kat }))
        : mod === "ayet" && mevcutAyet
          ? [{ m: mevcutAyet.tr, kat: mSkorla(`${mevcutAyet.title} ${mevcutAyet.tr} ${mevcutAyet.source}`) }]
          : plan.map((p) => ({ m: p.m, kat: p.kat }));
      const listedenBasla = typeof baslangicIdx === "number" && Number.isFinite(baslangicIdx) ? baslangicIdx : 0;
      const liste = listedenBasla > 0 && listedenBasla < tamListe.length ? tamListe.slice(listedenBasla) : tamListe;
      if (!liste.length) { yaz(ttX2610("smOnceEkleKisa"), "hata"); return; }

      const urlAl = async (m2: string) => {
        const r = await okutCek(okutUrl(m2));
        if (!r.ok) throw new Error("TTS " + r.status);
        const u = (await r.json()).url as string; // "data:audio/mpeg;…" (canlı) | "/mp3/…" (dev)
        // ★ 18.10: canlı data-URL direkt; dev disk yolu ttsUrl ile ön eklenir
        return u.startsWith("data:") ? u : ttsUrl(u.replace(/^\//, ""));
      };
      // ★ 16.10 GECİKME DÜZELTME (kullanıcı: "ses çok yavaş başlıyor, 6 sn bekliyor"):
      //   eski akış: urlAl → Audio(canplay wait 6-20sn) — TTS üretimi + mp3 indirilmesi
      //   AYNI anda bekleme yapıyordu). Yeni akış: url'i al → hemen resolve → play()
      //   tarayıcının kendi streaming buffer'ı (IIS lstm + blob hızlı). Gecikme 6-20sn
      //   → ~0.3 sn'e indi.
      const audioHazirla = (m2: string) => urlAl(m2).then((url) => ({ audio: new Audio(url) }));
      // ★ 26.10 503 TAKILMA (kullanıcı: "biçim iş düzgün yap, indirmiyor"): tek bölümün
      //   TTS 503 hatası ZİNCİRİ kırıyordu → zincir sonunda "Tamamlandı ✓" yanılgısı.
      //   Yeni kural: başarısız bölüm ⚠ uyarıyla atlanır, okuma sıradaki bölümle sürer.
      const audioHazirlaGüvenli = async (m2: string, n: number): Promise<{ audio: HTMLAudioElement } | null> => {
        try { return await audioHazirla(m2); } catch (e2: unknown) {
          if (runningRef.current) yaz(`⚠ bölüm ${n + 1} alınamadı (TTS: ${(e2 as Error)?.message || "hata"}) — atlandı`, "hata");
          return null;
        }
      };
      let siradaki: Promise<{ audio: HTMLAudioElement } | null> = audioHazirlaGüvenli(liste[0].m, 0);
      for (let i = 0; i < liste.length; i++) {
        if (!runningRef.current) break;
        const p = liste[i];
        if (kuyruk.length) setKuyrukSec(listedenBasla + i); // ★ 18.10: toplam kuyrukta doğru kart işaretlenir
        yaz(ttX2610("smParcaOkur").replace("{n}", String(i + 1)).replace("{m}", String(liste.length)).replace("{kat}", katBilgi(p.kat).ad).replace("{ses}", sesAdi?.ad || "Ahmet"), "okuyor");
        const sonuc = await siradaki;
        const my = seqRef.current; // ★ 21.10 SIZINTI FIX: döngü scope'u — break kontrolü buradan okur
        // ★ 26.10: bölüm fetch'i başarısız → ATLA (zincir kırılır mı hiç — sıradakiyle sürer)
        if (!sonuc) continue;
        const { audio: a } = sonuc;
        audioRef.current = a;
        // mevcut parça çalarken sıradakini hazırla (buffer doluyor — geçiş anında)
        siradaki = i + 1 < liste.length ? audioHazirlaGüvenli(liste[i + 1].m, i + 1) : Promise.resolve(null);
        await new Promise<void>((res) => {
          let bitti = false;
          // ★ 21.10 SIZINTI FIX: `bit` koşulsuz resolve eder — kart kesmesi (seq++ +
          //   pause) sonrası onended/onerror tetikLENMEZ ve eski zincirin promise'i
          //   sonsuza dek askıda kalıyordu (aynı awaiting bellekte stkta). Döngü,
          //   sonra my !== seqRef kontrolüyle temiz break eder (aşağıda).
          const bit = () => { if (!bitti) { bitti = true; res(); } };
          a.onended = bit;
          // ★ 20.10 SESSIZ-HATA FIX (kullanıcı: "seslendire tıkladım son parta geçti ses yok"):
          //   kök neden — CSP media-src data: YOKTU; tarayıcı data-URL sesini blokluyordu,
          //   a.onerror sessizce bit() tetikliyor → sıradaki parta geçiçiyordu; 5 part 1 sn'de
          //   "Tamamlandı ✓" yalanı. İki katman: (1) vercel.json media-src'ye data: eklendi
          //   (kalıcı fix, redeploy gerektirir); (2) onerror artık yutmadan DURUR ve
          //   gerçek hatayı yazar — sıradaki parta geçmez (bitKes atık bağı).
          a.onerror = () => {
            if (bitti) return;
            bitti = true;
            seqRef.current++;
            runningRef.current = false;
            const kisaKat = a.error?.message || ttX2610("smCspBlokladiDetay");
            yaz(ttX2610("smParcaHatasi").replace("{n}", String(i + 1)).replace("{hata}", kisaKat), "hata");
            res();
          };
          setTimeout(bit, 120000);
          try { a.currentTime = 0; } catch { /* autoplay koruması */ }
          a.play().catch(() => {
            // play() reddi (autoplay bloğu) — zaten onerror/mobile-guard devrede
          });
        });
        // ★ 21.10 SIZINTI FIX (devam): kart kesmesi sonrası bu döngünün kimliği
        //   artık geçersiz — seq uyuşmaz + running bayrağı bolumDinle'ye geçti.
        //   Sessiz break: sıradaki partı hazırlamaya/okumaya devam ETMEZ.
        if (my !== seqRef.current) break;
        if (i + 1 < liste.length && runningRef.current) {
          await new Promise((r) => setTimeout(r, PARCA_ARASI)); // parça arası nefes
        }
      }
      if (runningRef.current) yaz(ttX2610("smTamamlandi").replace("{n}", String(liste.length)), "bitti");
    } catch (e: unknown) {
      if (runningRef.current) yaz(ttX2610("smHataPrefix") + (e instanceof Error ? e.message : String(e)), "hata");
    } finally { runningRef.current = false; audioRef.current = null; }
  };
  const durdur = () => {
    seqRef.current++; runningRef.current = false;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    // ★ 26.10 DURDUR = İNDİRME KESİCİ: indirme sürerken basılan durdur, kuyrukIndir'in
    //  dilimli bekleme döngüsünde (250ms) yakalanır — kayıt anında biter, dosya yazılmaz.
    indirIptalRef.current.iptalEdildi = true;
    yaz(ttX2610("smDurduruldu"));
  };
  // ★ 21.10 HEPSİNİ TEMİZLE (kullanıcı: "seçilileri komple temizleme olsun" —
  //  seçililer ekranındaki "Temizle" ile aynı davranış): okuma vardsa KES,
  //  kuyruk + seçim + bölüm sayacıkomple sıfır → canlı önizlemeye dön.
  const kuyrukTemizle = () => {
    if (!kuyruk.length) return;
    if (runningRef.current) {
      seqRef.current++; runningRef.current = false;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    }
    const n = kuyruk.length;
    setKuyruk([]); setKuyrukSec(0); setBolumSayi(0);
    yaz(ttX2610("smTemizlendi").replace("{n}", String(n)));
  };

  // ★ 21.10 İNDİR: kuyruk doluyken çalma zincirini DURDUR (sonu okunur bir dosya
  //  istiyor) — parça parça sunucudan al tek parça birleştir kaydet (seslendirmeIndir).
  // ★ Sure/Ayet sekmesinde de (kullanıcı: "sure ayette neden indir koymadın kanka"):
  //  kuyruk boşsa mevcut seçim indirilir — ayet modunda seçili ayet, metin
  //  modunda yazİlmiş metnin plan parsaları. SESLENDİR'in tamListe mantığı aynısı.
  const indirHazir = !!kuyruk.length || (mod === "ayet" ? !!mevcutAyet : !!metin.trim());
  const indir = React.useCallback(async () => {
    if (indiriyor) return;
    const liste: { metin: string; kat?: string; etiket?: string }[] = kuyruk.length
      ? kuyruk
      : mod === "ayet" && mevcutAyet
        ? [ayetKuyrukOg(mevcutAyet)]
        : plan.map((p) => ({ metin: p.m, kat: p.kat }));
    if (!liste.length) { yaz(ttX2610("smIndirilecekYok"), "hata"); return; }
    setIndiriyor(true);
    // çalma duruyorsa zinciri kes — indirme sırasında çakışmasın (★ önce bayrak düşürülür:
    //  durdur() 26.10'dan beri iptal bayrağını true YAPIYOR, sonra temizlenir — kendi
    //  indirmemizi kendimiz iptal etmemek için sıralama kritik)
    if (runningRef.current) durdur();
    indirIptalRef.current.iptalEdildi = false;
    try {
      // ★ İNDİRME V2: dosya artık atmosfer görseli + sesi birleştiren TAM VİDEO —
      //   seçili arka plan (bg) kayda verilir; videosu yüklenmezse poster/gradyan dener.
      //   ★ 26.10: iptal objesi geçirildi → DURDUR kaydı canlı kesebilir.
      await kuyrukIndir(liste, indirUrlAl, (t: string) => yaz(t, /✅|⚠/.test(t) ? "hazir" : "okuyor"), bg, indirIptalRef.current);
    } finally { setIndiriyor(false); }
  }, [kuyruk, mod, mevcutAyet, plan, indiriyor, indirUrlAl, durdur, yaz, bg]);

  // ── önizleme öğesi — kuyruk doluysa onu, değilse sekmenin canlı seçimini göster ──
  const onizOg: KuyrukOgesi | null = (() => {
    if (kuyruk.length) return kuyruk[Math.min(kuyrukSec, kuyruk.length - 1)];
    if (mod === "metin" && metin.trim()) return { tip: "metin", metin: metin.trim(), kat: plan[0]?.kat || "musaf" };
    return mevcutAyet ? ayetKuyrukOg(mevcutAyet) : null;
  })();
  const onizKat = onizOg?.kat || "musaf";
  // ★ 21.10 YÜZLERCE ATMOSFER — admin kategorileri de katBilgi ile doğru ad/ikon/gradyan alır
  const kb = katBilgi(onizKat);
  const atmos = [kb.ad, kb.ikon, kb.gradyan] as readonly [string, string, string];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] overflow-auto bg-black/80 p-4 backdrop-blur-md" onMouseDown={kapat}>
      <div className="glass modal-in mx-auto my-4 max-w-5xl rounded-2xl p-4 shadow-2xl sm:p-5" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(215,170,82,.15)" }}>🎧</div>
            <h3 className="font-display text-base font-bold" style={{ color: "var(--accent-2)" }}>{ttX2610("smBaslik")}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* ★ 5 DİL: meal + TTS sesi seçilen dilde */}
            <div className="flex items-center gap-1">
              {DILLER.map((d) => (
                <button key={d.kod} onClick={() => dilDegistir(d.kod)} title={d.ad}
                  className="cursor-pointer rounded-full border transition hover:scale-110"
                  style={dil === d.kod
                    ? { width: 30, height: 30, borderColor: "var(--accent)", background: "rgba(215,170,82,.25)", boxShadow: "0 0 0 2px rgba(215,170,82,.25)" }
                    : { width: 30, height: 30, borderColor: "rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)" }}>
                  {d.bayrak}
                </button>
              ))}
            </div>
            {/* ★ SES SEÇİCİ — seçilen dilin erkek sesleri; seçilen ses TTS'e gider */}
            {sesListe.length > 0 ? (
              <select value={ses || sesListe[0]?.id || ""}                onChange={(e) => { setSes(e.target.value); yaz(ttX2610("smSesGuncel").replace("{ad}", sesListe.find((s) => s.id === e.target.value)?.ad || e.target.value)); }}
                className="cursor-pointer rounded-xl px-2 py-1.5 text-[10px] font-bold outline-none"
                style={{ width: 160, background: "rgba(0,0,0,.35)", color: "var(--accent-2)", border: "1px solid rgba(255,255,255,.14)" }}>
                {sesListe.map((s) => <option key={s.id} value={s.id}>{s.ad}</option>)}
              </select>
            ) : null}
            <button onClick={kapat} aria-label="Kapat" title="Kapat"
              className="rounded-xl px-4 py-2 text-[11px] font-extrabold text-white transition hover:brightness-110"
              style={{ background: "#e04a5a", border: "1px solid #e04a5a" }}>
              {ttX2610("smKapat")}
            </button>
          </div>
        </div>

        {sunucuVar === false ? (
          <div className="rounded-xl p-8 text-center text-[11px] text-white/70">
            🔒 <b className="text-white">{ttX2610("smGelistirme")}</b> — {ttX2610("smCanliKapali")}.
            <div className="mt-1 text-[10px] text-white/40">Lokal: <code>python ai-mockup/meal-sunucu.py</code> {ttX2610("smAksiyon")}</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-[290px_1fr]">
            {/* SOL: önizleme */}
            <SeslendirmeOnizleme
              onizOg={onizOg}
              atmos={atmos}
              kuyrukSayi={kuyruk.length}
              kuyrukSec={kuyrukSec}
              planSayi={plan.length}
              bg={bg}
              setBg={setBg}
              atmosAta={atmosAta}
              yaz={yaz}
            />
            {/* SAĞ: kontroller */}
            <SeslendirmeKontroller
              mod={mod} setMod={modDegistir}
              ayetler={ayetler} surler={surler}
              sureIdx={sureIdx} setSureIdx={setSureIdx}
              ayetIdx={ayetIdx} setAyetIdx={setAyetIdx}
              ayetEkle={ayetEkle} sureEkle={sureEkle}
              metin={metin} setMetin={setMetin} plan={plan}
              bolumSayi={bolumSayi} bolumEkle={bolumEkle} bolumCikar={bolumCikar} bolumDinle={bolumDinle}
              kuyruk={kuyruk} kuyrukSec={kuyrukSec} setKuyrukSec={setKuyrukSec} ogCikar={ogCikar} kuyrukTemizle={kuyrukTemizle}
              akilliAta={akilliAta}
              indir={indir} indiriyor={indiriyor} indirHazir={indirHazir}
              seslendir={seslendir} durdur={durdur}
              durum={durum} durumTip={durumTip}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeslendirmeModal;
