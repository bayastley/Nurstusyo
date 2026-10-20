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
import { ATM, mBol, mSkorla } from "./seslendirmeMotor";
import { ttsUrl, DILLER, type DilKodu, type DurumTip, type KuyrukOgesi, type AyetKayit } from "./seslendirmeSabitler";
import { SeslendirmeOnizleme } from "./seslendirmeOnizleme";
import { SeslendirmeKontroller } from "./seslendirmeKontroller";

export interface SeslendirmeModalProps {
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
}

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
        yaz(`${DILLER.find((d) => d.kod === dil)?.bayrak} ${Object.values(harita).length} sure hazır ✓`);
      } catch {
        setSunucuVar(false);
        yaz("🔒 Ses sunucusu kapalı — geliştirici notu: python ai-mockup/meal-sunucu.py", "hata");
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
    setMetin(""); setBg(null);
    yaz(`${DILLER.find((d) => d.kod === kd)?.bayrak} ${DILLER.find((d) => d.kod === kd)?.ad} — meallar hazırlanıyor…`);
  };
  // okut URL'i — dil + seçili ses (ses seçildiyse onu kullan)
  const okutUrl = (m: string) => {
    if (ses) return ttsUrl(`okut?dil=${dil}&ses=${encodeURIComponent(ses)}&metin=${encodeURIComponent(m)}`);
    return ttsUrl(dil === "tr" ? `okut?ses=ahmet&metin=${encodeURIComponent(m)}` : `okut?dil=${dil}&metin=${encodeURIComponent(m)}`);
  };

  const ayetEkle = () => {
    if (!mevcutAyet) return;
    const metinVardi = kuyruk.some((x) => x.tip === "metin");
    const yeni = [...kuyruk.filter((x) => x.tip === "ayet"), ayetKuyrukOg(mevcutAyet)];
    setKuyruk(yeni); setKuyrukSec(yeni.length - 1);
    yaz((metinVardi ? "Önizlemedeki metin silindi — " : "") + `Eklendi: ${yeni[yeni.length - 1].etiket} (kuyruk ${yeni.length}) ✓`);
  };
  const sureEkle = () => {
    if (!ekranSure) return;
    const metinVardi = kuyruk.some((x) => x.tip === "metin");
    const yeni = [...kuyruk.filter((x) => x.tip === "ayet"), ...ekranSure.kartlar.map((i) => ayetKuyrukOg(ayetler[i]))];
    setKuyruk(yeni); setKuyrukSec(Math.max(yeni.length - ekranSure.kartlar.length, 0));
    yaz((metinVardi ? "Önizlemedeki metin silindi — " : "") + `${ekranSure.ad} Suresi eklendi (${ekranSure.kartlar.length} ayet) ✓`);
  };
  // ★ 16.10 YENİ AKIŞ: metinEkle (eski "Metni Önizlemeye Ekle") KALDIRILDI yerine
  //   BÖLÜM EKLE sistemi geldi — kullanıcının emri:
  //   “+ işaretine bastıkça kaç bölüm olursa oraya metni yazsın; bölüm ekle yap, eski
  //   sistemi kaldır, metni yazsın bölümlere kendisi eklesin; tıklayınca bölümlere
  //   arka plan ayarlama açılsın; bide tıklayınca ses gelmeli (ayrı ayrı dinleme).”
  //   Metin motoru hâlâ mBol (atmosfer skorlu kelimeler) — sadece ARAYÜZ değişti:
  //   ➕ her basışta hedef bölüm sayısını +1 yapar ve mBol sonucunu O SAYIYA eşitler.
  const [bolumSayi, setBolumSayi] = React.useState(0); // 0 = bölüm yok (yılmayan metin → kuyrukta değil)

  /** mBol sonucunu hedefN parçaya indir/büyüt — oransal köprüleme. */
  const planKes = (hedefN: number): { m: string; kat: string }[] => {
    const tamPlan = mBol(metin.trim());
    if (tamPlan.length <= hedefN) {
      // büyükten bölünerek alt parçaya genişlet — metin motoru uluslar arası bir bölme yoksa
      // kelime yarı bölme (saf + güvenli) devreye girer
      const ek = hedefN - tamPlan.length;
      const out = [...tamPlan];
      while (out.length < hedefN) {
        // en uzun parçayı yarı kes
        let maxI = 0, maxLen = 0;
        out.forEach((p, j) => { const l = p.m.split(/\s+/).length; if (l > maxLen) { maxLen = l; maxI = j; } });
        if (maxLen < 4) break;          // çok kısa — daha bölünmez
        const buyuk = out[maxI];
        const kel = buyuk.m.split(/\s+/);
        const yari = Math.ceil(maxLen / 2);
        const ilk = kel.slice(0, yari).join(" "), ikinci = kel.slice(yari).join(" ");
        out.splice(maxI, 1, { ...buyuk, m: ilk }, { ...buyuk, m: ikinci });
      }
      // hala eksikse minimum metinli parçalara boş kart (boş değil, birleştirilmiş)
      while (out.length < hedefN && out.length) {
        const last = out[out.length - 1];
        const kel = last.m.split(/\s+/);
        if (kel.length < 4) break;
        const yari = Math.ceil(kel.length / 2);
        out.splice(out.length - 1, 1,
          { ...last, m: kel.slice(0, yari).join(" ") },
          { ...last, m: kel.slice(yari).join(" ") });
      }
      return out;
    }
    // çok parça → komşuları birleştirerek hedefe indir
    const out = [...tamPlan];
    while (out.length > hedefN) {
      // en kısa ardışık çifti birleştir (metin yetisi korunur)
      let minI = 0, minTop = Infinity;
      for (let i = 0; i < out.length - 1; i++) {
        const t = out[i].m.split(/\s+/).length + out[i + 1].m.split(/\s+/).length;
        if (t < minTop) { minTop = t; minI = i; }
      }
      const a = out[minI], b = out[minI + 1];
      out.splice(minI, 2, { m: `${a.m} ${b.m}`.trim(), kat: mSkorla(`${a.m} ${b.m}`) });
    }
    return out;
  };

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
    if (!metin.trim()) { yaz("Önce metin yaz", "hata"); return; }
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
    const yeniKuyruk = kes.map((p) => ({ tip: "metin" as const, metin: p.m, kat: p.kat }));
    setKuyruk(yeniKuyruk);
    setBolumSayi(n);
    setKuyrukSec(n - 1);
    yaz(`🧩 ${n}·bölüm hazır — kanca noktalarında kesildi, kartlara tıkla: dinle / arka plan ayarla`);
  };

  /** ★ 20.10: mBol az part (2-3) ürettiyse ve kullanıcı daha fazla bölüm istedi →
   *  mevcut partları EN UZUN cümle-sonundan yararak çoğalt (kelime yarı bölme YOK,
   *  cümle bütünlüğü korunur). planKes'ten farkı: daha uzun DAĞTIK — part ARAMIŞZ. */
  const metinPartArttir = (planParcalar: { m: string; kat: string }[], hedefN: number): { m: string; kat: string }[] => {
    const out = planParcalar.map((p) => ({ ...p }));
    let turSayisi = 0;
    while (out.length < hedefN && turSayisi < 20) {
      turSayisi++;
      // en uzun partı bul ve cümle sınırında ikiye böl
      let maxI = 0, maxLen = 0;
      out.forEach((p, j) => { const l = p.m.split(/[^.!?…]+[.!?…]+/).length; if (l > maxLen) { maxLen = l; maxI = j; } });
      const buyuk = out[maxI];
      const cumleler = buyuk.m.trim().match(/[^.!?…]+[.!?…]+["»')\]]*\s*|[^.!?…]+$/g) || [buyuk.m];
      if (cumleler.length < 2) break; // daha bölünmez
      const yari = Math.ceil(cumleler.length / 2);
      const ilk = cumleler.slice(0, yari).join("").trim(), ikinci = cumleler.slice(yari).join("").trim();
      if (!ikinci) break;
      out.splice(maxI, 1, { m: ilk, kat: mSkorla(ilk) }, { m: ikinci, kat: mSkorla(ikinci) });
    }
    return out;
  };

  /** ★ 18.10 kanca planı hedef sayıya inince: en kısa komşu çiftlerini birleştir
   *  (düz planKes'inin aynısı ama kanca-kesim metinlerine dokunmadan). */
  const kancaBirlestir = (planParcalar: { m: string; kat: string }[], hedefN: number) => {
    const out = [...planParcalar];
    while (out.length > hedefN) {
      let minI = 0, minTop = Infinity;
      for (let i = 0; i < out.length - 1; i++) {
        const t = out[i].m.split(/\s+/).length + out[i + 1].m.split(/\s+/).length;
        if (t < minTop) { minTop = t; minI = i; }
      }
      const a = out[minI], b = out[minI + 1];
      out.splice(minI, 2, { m: `${a.m} ${b.m}`.trim(), kat: mSkorla(`${a.m} ${b.m}`) });
    }
    return out;
  };

  /** ★ 18.10 (kullanıcı emri): bölüm/ayet karta tıklandığında O KARTTAN İTİBAREN SIRAYLA
   *  devam eder — "hangi ayetleri seçtiysem devam etsin sırayla". Tek parça okuma yerine
   *  seslendir(i) zinciri kullanılır (aynı motor, buffer'lı geçişler); karta tıkla = başlangıç.
   *  SESLENDİR ana butonu ise tüm kuyruğu en baştan sıralı okumaya devam eder. */
  const bolumDinle = async (i: number) => {
    if (runningRef.current || !kuyruk[i]) return;
    await seslendir(i);
  };
  const ogCikar = (i: number) => {
    const yeni = kuyruk.filter((_, j) => j !== i);
    setKuyruk(yeni);
    if (!yeni.length) { setKuyrukSec(0); yaz("Kuyruk boş — canlı önizlemeye dönüldü"); }
    else setKuyrukSec(Math.min(kuyrukSec, yeni.length - 1));
  };
  const atmosAta = (kat: string) => {
    const i = kuyrukSec;
    setKuyruk(kuyruk.map((o, j) => (j === i ? { ...o, kat } : o)));
    yaz(`Parça ${i + 1} → ${ATM[kat]?.[0] || kat} atandı ✓`);
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
          runningRef.current ? null : fetch(okutUrl(p.m)).catch(() => null));
      });
    }, 900);
    return () => clearTimeout(parlak);
  }, [plan, sunucuVar, yaz]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SESLENDİR ──
  const seslendir = async (baslangicIdx = 0) => {
    if (runningRef.current || !sunucuVar) return;
    runningRef.current = true; seqRef.current++;
    const sesAdi = DILLER.find((d) => d.kod === dil);
    yaz(`${sesAdi?.bayrak || ""} ${sesAdi?.ad || "Ahmet"} okuyor…`, "okuyor");
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
      if (!liste.length) { yaz("Önce ayet veya metin ekle", "hata"); return; }

      const urlAl = async (m2: string) => {
        const r = await fetch(okutUrl(m2));
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
      let siradaki: Promise<{ audio: HTMLAudioElement }> = audioHazirla(liste[0].m);
      for (let i = 0; i < liste.length; i++) {
        if (!runningRef.current) break;
        const p = liste[i];
        if (kuyruk.length) setKuyrukSec(listedenBasla + i); // ★ 18.10: toplam kuyrukta doğru kart işaretlenir
        yaz(`Parça ${i + 1}/${liste.length} · ${ATM[p.kat]?.[0] || p.kat} · Ahmet okuyor…`, "okuyor");
        const { audio: a } = await siradaki;
        audioRef.current = a;
        // mevcut parça çalarken sıradakini hazırla (buffer doluyor — geçiş anında)
        siradaki = i + 1 < liste.length ? audioHazirla(liste[i + 1].m) : siradaki;
        await new Promise<void>((res) => {
          const my = seqRef.current; let bitti = false;
          const bit = () => { if (!bitti) { bitti = true; if (my === seqRef.current) res(); } };
          a.onended = bit; a.onerror = bit;
          setTimeout(bit, 120000);
          try { a.currentTime = 0; } catch { /* autoplay koruması */ }
          a.play().catch(bit);
        });
        if (i + 1 < liste.length && runningRef.current) {
          await new Promise((r) => setTimeout(r, PARCA_ARASI)); // parça arası nefes
        }
      }
      if (runningRef.current) yaz(`Tamamlandı ✓ (${liste.length} parça)`, "bitti");
    } catch (e: unknown) {
      if (runningRef.current) yaz("Hata: " + (e instanceof Error ? e.message : String(e)), "hata");
    } finally { runningRef.current = false; audioRef.current = null; }
  };
  const durdur = () => {
    seqRef.current++; runningRef.current = false;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    yaz("⏹ durduruldu");
  };

  // ── önizleme öğesi — kuyruk doluysa onu, değilse sekmenin canlı seçimini göster ──
  const onizOg: KuyrukOgesi | null = (() => {
    if (kuyruk.length) return kuyruk[Math.min(kuyrukSec, kuyruk.length - 1)];
    if (mod === "metin" && metin.trim()) return { tip: "metin", metin: metin.trim(), kat: plan[0]?.kat || "musaf" };
    return mevcutAyet ? ayetKuyrukOg(mevcutAyet) : null;
  })();
  const onizKat = onizOg?.kat || "musaf";
  const atmos = ATM[onizKat] || ATM.musaf;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] overflow-auto bg-black/80 p-4 backdrop-blur-md" onMouseDown={kapat}>
      <div className="glass modal-in mx-auto my-4 max-w-5xl rounded-2xl p-4 shadow-2xl sm:p-5" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(215,170,82,.15)" }}>🎧</div>
            <h3 className="font-display text-base font-bold" style={{ color: "var(--accent-2)" }}>SESLİ MEAL</h3>
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
              <select value={ses || sesListe[0]?.id || ""} onChange={(e) => { setSes(e.target.value); yaz(`🎙️ Ses: ${sesListe.find((s) => s.id === e.target.value)?.ad || e.target.value}`); }}
                className="cursor-pointer rounded-xl px-2 py-1.5 text-[10px] font-bold outline-none"
                style={{ width: 160, background: "rgba(0,0,0,.35)", color: "var(--accent-2)", border: "1px solid rgba(255,255,255,.14)" }}>
                {sesListe.map((s) => <option key={s.id} value={s.id}>{s.ad}</option>)}
              </select>
            ) : null}
            <button onClick={kapat} aria-label="Kapat" title="Kapat"
              className="rounded-xl px-4 py-2 text-[11px] font-extrabold text-white transition hover:brightness-110"
              style={{ background: "#e04a5a", border: "1px solid #e04a5a" }}>
              ✕ Kapat
            </button>
          </div>
        </div>

        {sunucuVar === false ? (
          <div className="rounded-xl p-8 text-center text-[11px] text-white/70">
            🔒 <b className="text-white">Seslendirme şu an geliştirme özelliği</b> — canlı yayında kapalı.
            <div className="mt-1 text-[10px] text-white/40">Lokal: <code>python ai-mockup/meal-sunucu.py</code> çalıştır → sayfayı yenile</div>
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
              mod={mod} setMod={setMod}
              ayetler={ayetler} surler={surler}
              sureIdx={sureIdx} setSureIdx={setSureIdx}
              ayetIdx={ayetIdx} setAyetIdx={setAyetIdx}
              ayetEkle={ayetEkle} sureEkle={sureEkle}
              metin={metin} setMetin={setMetin} plan={plan}
              bolumSayi={bolumSayi} bolumEkle={bolumEkle} bolumDinle={bolumDinle}
              kuyruk={kuyruk} kuyrukSec={kuyrukSec} setKuyrukSec={setKuyrukSec} ogCikar={ogCikar}
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
