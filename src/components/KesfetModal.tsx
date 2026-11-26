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
import { HADIS_TEMALARI, HADIS_DERECE_ETIKETI, hadisBankasiGorunum, RIVAYETCILER, rivayetciUyar } from "../data/hadisData";
import { MenkibelerBolumu } from "./kesfetMenkibeler";
import { EvliyalatBolumu } from "./kesfetEvliyalat";
import { KISSA_LISTESI } from "../data/kissaData";
import { KISSA_EK } from "../data/kissaEk"; // ★ 25.10 GENİŞLETME: +12 kıssa (sahih kaynaklı, çevirisiz)
import { MezheplerBolumu } from "./kesfetSekmeler";
import { kissaCevir } from "../data/kissaCokDil"; // ★ KISSA ÇOKDİL (06.10): 19 kıssa 5 dilde — TR asıl, çeviri yoksa fallback
import { SORU_CEVAP_ARŞIVI, BES_SART_SORULARI } from "../data/soruData";
// ★ 31.10 SORU BANKASI GENİŞLETME: 8 konu bloğu (iman/günah/abdest/namaz/oruç-zekât/hac/aile/gündelik) — akıllı arama + dil görünümü
import { SORU_BANKASI, soruGorunum } from "../data/sorular";
import { KELIME_KARTLARI, type KelimeKart } from "../data/kelimeData";
import { SURE_BİLGİLERİ } from "../data/sureData";
import { NamazOgreticiBolumu, type NamazPanelKey } from "./kesfetNamazBolumu";
import { DUA_REHBERİ } from "../data/duaData";
import { ADABI_MUASERET } from "../data/adabiMuaseret";
import { SÜNNETLER } from "../data/sunnetler";
import { HOCA_KARSILASTIRMA_AYETLER } from "../data/hocaData";
import { camiHaritaUrl, camiListeUrl } from "../data/camiData";
import { KANAL_REHBERI } from "../data/kanalData";
import { TECVID_KURALLARI } from "../data/tecvidData";
// ★ 20.11 DAĞITIM: İlmihal derslerinin başlıkları diğer sekmelerdeki köprü çiplerinde kullanılır
import { ILMIHAL_DERSLERI } from "../data/ilmihalData";
import { TARIH_TOPLAM } from "../data/islamTarihiData";
// ★ 31.10 PEYGAMBERLER HAYATI: Kur'ân'da adı geçen 25 peygamber — kıssa + olaylar + ders + kaynak
import { PEYGAMBERLER } from "../data/peygamberler";
// ★ 31.10 SİYER-İ NEBİ: Hz. Muhammed (s.a.v.) hayatı — kronolojik kategoriler + sahih kaynak
import { SIYER_KATEGORILER } from "../data/siyer";
import { siyerIsim } from "../data/siyerCokDil";
import { SURAHS } from "../data/surahs";
// ★ 29.10 SURE ADI 5 DİLDE (kullanıcı emri)
import { sureAdGorunum as sureAdX2910 } from "../data/surelerCokDil";
import { SURE_ARAPCA } from "../data/sureArapca"; // ★ AKILLI SURE ARAMASI (03.10): Arapça adla arama
import { kitaplikOku, kelimeOku, bilinenKelimelerOku, bilinenKelimeIsaretle, KARILER, everyAyetUrl, SEKMELER, type SekmeId, type KitaplikNot, DuaSesSecici } from "./kesfetTemel";
import { sesUrlYedegi } from "../reciters"; // ★ YEDEK SES KAYNAĞI (02.10)
import { DuaRehberBolumu } from "./kesfetDuaBolumu";
// ★ SRP adım 9 (09.10 2. tur): 5 büyük sekme JSX bloğu + KelimeKarti kesfetSekmeler.tsx'e taşındı
import { HadisBolumu, KissaBolumu, SoruBolumu, KelimeBolumu, SureBolumu, IlmihalBolumu, AhlakBolumu, YarismaBolumu, TarihBolumu, SahabelerBolumu, KitapBolumu, KuranOkuluBolumu, ToplulukBolumu, atolyeKelimeOner } from "./kesfetSekmeler";
import { CamiBolumu, KanalRehberiBolumu, AdabBolumu, SunnetBolumu, TecvidBolumu, KitaplikBolumu } from "./kesfetKucukSekmeler";
import { KesfetImsakiye } from "./kesfetImsakiye";
import { metniHazirla, arapcaHazirla, levenshtein, kelimeUyar } from "./kesfetArama"; // ★ SRP (09.10): akıllı arama saf yardımcıları kesfetArama.ts'e taşındı
import { ozellikGorunur, kesfetKilitId } from "../features/ozellikKilit";

// ★ AKILLI SURE ARAMASI — yardımcılar kesfetArama.ts'e taşındı (09.10 parçalama); import en üstte

// ★ GÜNÜN KELİMELERİ (03.10): güne göre deterministik 5 kelime — yerel gün no × 5 kaydırma;
//   her gün öncekiyle kesişmeyen 5'li gelir, havuzda tam tur (100 kelime) 100 günde döner
function gununKelimeleriHesapla(): KelimeKart[] {
  const gunNo = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const adet = Math.min(5, KELIME_KARTLARI.length);
  const bas = (gunNo * adet) % KELIME_KARTLARI.length;
  return Array.from({ length: adet }, (_, i) => KELIME_KARTLARI[(bas + i) % KELIME_KARTLARI.length]);
}
// Kelime kartı bileşeni + atolyeKelimeOner — SRP adım 9: kesfetSekmeler.tsx


// ★ SRP adım 4 (30.09): kitaplık okuma + TTS ses motoru + kâriler + sekme tanımları kesfetTemel.tsx'e taşındı
/** ★ 20.11 DAĞITIM KÖPRÜSÜ — bir sekmenin içinden ilgili ilmihal dersine geçiş.
 *  Modal kapanmaz; yalnız sekme değişir ve ders seçili açılır (mevcut akışlara dokunmaz). */
function IlmihalKopru({ baslik, dersler, git }: { baslik: string; dersler: string[]; git: (id: string) => void }) {
  const secili = ILMIHAL_DERSLERI.filter((d) => dersler.includes(d.id));
  if (!secili.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.04] p-2.5">
      <p className="text-[8.5px] font-black uppercase tracking-widest" style={{ color: "var(--accent)" }}>{baslik}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {secili.map((d) => (
          <button
            key={d.id}
            type="button"
            data-minitur={`kopru-${d.id}`}
            onClick={() => git(d.id)}
            className="rounded-lg border border-white/10 bg-white/[.03] px-2 py-1 text-[9px] font-bold text-white/65 transition hover:bg-white/[.08] hover:text-white"
          >
            {d.emoji} {d.ad}
          </button>
        ))}
      </div>
    </div>
  );
}

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
    imsakiye: "ksTabImsakiye", hadis: "ksHadisBankasi", kissa: "ksKuranKissalari", siyer: "ksSiyerNebi", soru: "ksSoruCevap", kelime: "ksKelimeKartlari",
    sure: "ksSureBilgileri", namaz: "ksNamazOgretici", dua: "ksDuaRehberi", adab: "ksAdabiMuaseret",
    menkibeler: "ksMenkibeler", evliyalar: "ksEvliyalar", sunnet: "ksSunnetler", hoca: "ksHocaKarsilastir", peygamber: "ksPeygamberHayati",
    cami: "ksCamiBulucu", rehber: "ksKanalRehberi", tecvid: "ksTecvidRehberi", kitaplik: "ksKitapligim", mezhepler: "ksMezhepler",
    ilmihal: "ksIlmihal", tarih: "ksTarih", ahlak: "ksAhlak", yarisma: "ksYarisma", sahabeler: "ksSahabeler",
    klasikEserler: "ksKlasikEserler", kuranOkulu: "ksKuranOkulu", topluluk: "ksTopluluk",
  };
  // ★ 20.11: sözlükte karşılığı olmayan yeni sekmeler SEKMELER etiketine düşer (ham anahtar görünmez)
  const sekmeAdi = (id: string): string =>
    SEKME_KEY[id] ? tt(SEKME_KEY[id]) : (SEKMELER.find((s) => s.id === id)?.label ?? id);
  const TEMA_KEY: Record<string, string> = {
    tumu: "ksTemaTumu", sabir: "ksTemaSabir", sukur: "ksTemaSukur", "ana-baba": "ksTemaAnaBaba",
    "komşuluk": "ksTemaKomsuluk", ahlak: "ksTemaAhlak", zikir: "ksTemaZikir", hayir: "ksTemaHayir",
    namaz: "ksTemaNamaz", ilim: "ksTemaIlim", dua: "ksTemaDua", tovbe: "ksTemaTovbe", yetim: "ksTemaYetim",
    iffet: "ksTemaIffet", dil: "ksTemaDil", "cömertlik": "ksTemaComertlik", merhamet: "ksTemaMerhamet",
  };
  const hadisTemaAdi = (id: string): string => (TEMA_KEY[id] ? tt(TEMA_KEY[id]) : id);
  const DERECE_KEY: Record<string, string> = { sahih: "ksDereceSahih", hasan: "ksDereceHasan", zayif: "ksDereceZayif", kulliyat: "ksDereceKulliyat" };
  const dereceAdi = (d?: string): string => (d && DERECE_KEY[d] ? tt(DERECE_KEY[d]) : (d && HADIS_DERECE_ETIKETI[d]?.label) || "");

  // ★ 02.11 (kullanıcı emri): İslâmi Öğreniyorum ilk tıklamada Hadis Bankası açılsın
  const [sekme, setSekme] = useState<SekmeId>(initialSekme ?? "hadis");
  // ★ 26.11 ÖZELLİK KİLİDİ: admin panelinden gizlenen/üyelik seviyesine çekilen
  //   sekmeler listeden düşer; açık sekme gizlenirse ilk görünüre geçilir.
  const gorunurSekmeler = useMemo(
    () => SEKMELER.filter((s) => ozellikGorunur(kesfetKilitId(s.id))),
    // kilit yayını değiştiğinde liste yeniden hesaplansın
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, sekme],
  );
  React.useEffect(() => {
    if (!gorunurSekmeler.some((s) => s.id === sekme) && gorunurSekmeler[0]) setSekme(gorunurSekmeler[0].id);
  }, [gorunurSekmeler, sekme]);
  const [arama, setArama] = useState("");
  // ★ 20.11 DAĞITIM: sekmeler arası ilmihal köprüsü — hangi dersin açılacağı burada tutulur
  const [ilmihalDers, setIlmihalDers] = useState<string>("temizlik");
  const gitIlmihal = (ders: string) => { setIlmihalDers(ders); setSekme("ilmihal"); };
  const [hadisTema, setHadisTema] = useState("tumu");
  // ★ 02.11 RİVAYET EDENLER (kullanıcı emri): derece kısmına Buhâri/Tirmizî gibi
  //   sahih kabul edilen_rnn kişiler buton olarak girer; tıklayınca yalnız ondan
  //   rivâyet edilen hadisler listelenir.
  const [rivayetci, setRivayetci] = useState("tumu");
  const [kartCevrildi, setKartCevrildi] = useState<string | null>(null); // ★ 03.10: index yerine kelime anahtarı — sıralama değişse de çevrilen kart kaymaz
  // ★ SURE AKORDEONU (01.10): tıkla-aç/kapa — liste yer kaplamasın, uzun açıklama sadece açık karta girsin
  const [acikSure, setAcikSure] = useState<number | null>(null);
  // ★ KISSA AKORDEONU (01.10): aynı ilke — kapalı kart tek satır özet, açık kartta kıssa+ders+dua
  const [acikKissa, setAcikKissa] = useState<string | null>(null);
  // ★ SORU-C EVAP AKORDEONU (03.10, kullanıcı kararı): üç büyük liste aynı tıkla-aç deseninde —
  //   kapalı kartta soru + tek satır cevap özeti, açık kartta mezhep bazlı cevaplar/kaynak
  const [acikSoru, setAcikSoru] = useState<number | null>(null);
  const [acikGenelSoru, setAcikGenelSoru] = useState<number | null>(null);
  // ★ 02.11/03.11 NAMAZ PANEL SEÇİMİ (kullanıcı emri): ilk buton (Namaz Çeşitleri) OTOMATİK açık gelsin;
  // render bölümü SRP ile kesfetNamazBolumu.tsx'e ayrıldı (bağlamlar prop ile korunur)
  const [namazPanel, setNamazPanel] = useState<NamazPanelKey>("cesitler");
  // ★ PEYGAMBER AKORDEONU (31.10): kıssa kartı tıkla-aç — kapalı satır özet, açık kartta olaylar+ ders kaynağı
  const [acikPeygamber, setAcikPeygamber] = useState<number | null>(null);
  // ★ 31.10 SİYER: açık kategori idx — akordeon
  const [acikSiyer, setAcikSiyer] = useState<number | null>(null);
  const [siyerSayfa, setSiyerSayfa] = useState(0);
  const [siyerYon, setSiyerYon] = useState<"ileri" | "geri">("ileri");
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
  const [kitaplikEk, setKitaplikEk] = useState<{ kart: number; dua: number; ders: number; ezber: string; namaz: string; hayir: number; takvim: number; sesTaslak: boolean; kartTasarim: boolean; marka: boolean; mushaf: number }>({ kart: 0, dua: 0, ders: 0, ezber: tt("itBildirimYok"), namaz: tt("itBildirimYok"), hayir: 0, takvim: 0, sesTaslak: false, kartTasarim: false, marka: false, mushaf: 0 });
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

  // ★ 31.10 5-DİL: banka dile göre derlenmesin (hadisGenis çevirileri de karışır); arama çevirisiz metin üzerinden
  const hadisBanka = React.useMemo(() => hadisBankasiGorunum(lang), [lang]);
  const rivayetciSayilari = React.useMemo(() => Object.fromEntries(RIVAYETCILER.map((r) => [r.id, hadisBanka.filter((h) => rivayetciUyar(h.kaynak, r.id)).length])), [hadisBanka]);
  const filtreliHadisler = useMemo(
    () => hadisBanka.filter((h) => (hadisTema === "tumu" || h.tema === hadisTema) && (rivayetci === "tumu" || rivayetciUyar(h.kaynak, rivayetci)) && (!q || h.metin.toLocaleLowerCase("tr").includes(q) || h.kaynak.toLocaleLowerCase("tr").includes(q))),
    [hadisTema, q, rivayetci],
  );
  // ★ ÇEVRİMİÇİ HADİS ARAMASI: arama yapıldığında yerel sonuçların yanında internetten de
  //   sonuç getirir. Önce sunucu proxy (/api/hadis/ara), dev/erişimsiz ortamda doğrudan
  //   Sünnetimiz araması fallback. Kod büyümez, veriler koda gömülmez.
  const [kuliyatYukleniyor, setKuliyatYukleniyor] = useState(false);
  const [kuliyatSonuc, setKuliyatSonuc] = useState<Array<{ metin: string; kaynak: string; derece: string; kitap: string; dil: string; url?: string; bab?: string; kitab?: string; dereceEtiket?: string }>>([]);
  const [kuliyatOffline, setKuliyatOffline] = useState(false);
  React.useEffect(() => {
    if (sekme !== "hadis" || q.length < 2) { setKuliyatSonuc([]); setKuliyatYukleniyor(false); setKuliyatOffline(false); return; }
    if (typeof navigator !== "undefined" && !navigator.onLine) { setKuliyatSonuc([]); setKuliyatYukleniyor(false); setKuliyatOffline(true); return; }
    let canli = true;
    setKuliyatOffline(false);
    setKuliyatYukleniyor(true);
    const kitap = ["buhari", "muslim", "tirmizi", "ebudavud", "nesai", "ibnmace"].includes(rivayetci) ? `&kitap=${encodeURIComponent(rivayetci)}` : "";
    const kitapQ = kitap ? rivayetci : "buhari,muslim,ebudavud,tirmizi,nesai,ibnmace";
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/hadis/ara?q=${encodeURIComponent(q)}${kitap}`);
        const data = await r.json().catch(() => ({}));
        let sonuclar = Array.isArray(data?.sonuclar) ? data.sonuclar : [];
        if (!sonuclar.length) {
          // Fallback: dev/erişimsiz proxy’de tarayıcıdan Sünnetimiz araması (CORS açık)
          const sr = await fetch(`https://sunnetimiz.com/api/v1/search?q=${encodeURIComponent(q)}&book=${encodeURIComponent(kitapQ)}&limit=12`);
          if (sr.ok) {
            const sd = await sr.json();
            const normD = (label?: string) => {
              const v = (label || "").toLocaleLowerCase("tr");
              if (/sahih|صحيح/.test(v)) return "sahih";
              if (/hasen|hasan|حسن/.test(v)) return "hasan";
              if (/zay[ıi]f|ضعيف|mevzu/.test(v)) return "zayif";
              return "bilinmiyor";
            };
            sonuclar = (Array.isArray(sd?.results) ? sd.results : []).slice(0, 12).map((h: any) => {
              const metin = (h.turkish || h.arabic || "").trim();
              const bname = h.book?.name || h.book?.slug || "Hadis";
                            const bolum = h.bab?.title || "";
                return metin ? {
                metin,
                kaynak: `${bname}${h.ref ? ` · ${h.ref}` : ""}${bolum ? ` · ${bolum}` : ""} · Sünnetimiz`,
                derece: normD(h.grade?.label),
                kitap: bname,
                dil: h.turkish ? "tr" : "ar",
                url: h.url,
                bab: bolum,
                kitab: h.kitab?.title || "",
                dereceEtiket: [h.grade?.label, h.grade?.by].filter(Boolean).join(" · "),
              } : null;
            }).filter(Boolean);
          }
        }
        if (canli) { setKuliyatSonuc(sonuclar); if (!sonuclar.length && typeof navigator !== "undefined" && !navigator.onLine) setKuliyatOffline(true); }
      } catch { if (canli) { setKuliyatSonuc([]); if (typeof navigator !== "undefined" && !navigator.onLine) setKuliyatOffline(true); } }
      finally { if (canli) setKuliyatYukleniyor(false); }
    }, 400); // debounce — her tuşta istek atılmaz
    return () => { canli = false; clearTimeout(t); };
  }, [sekme, q, rivayetci]);
  // ★ KISSA ÇOKDİL (06.10): önce dile çevir, sonra arama çevrilmiş ad/özet üzerinden koşsun
  // ★ 25.10 GENİŞLETME: çeviri hizası 19 referansta korunur; 12 yeni kıssa (KISSA_EK) çevirisiz eklenir — TR görünür
  const filtreliKissalar = useMemo(() => [...kissaCevir(lang, KISSA_LISTESI), ...KISSA_EK].filter((k) => !q || k.ad.toLocaleLowerCase("tr").includes(q) || k.ozet.toLocaleLowerCase("tr").includes(q)), [q, lang]);
  // ★ 31.10: genel arşiv + 8 konu bloğu BİRAKTA — dil görünümü soruGorunum üzerinden (en kartları İngilizce gösterir)
  const filtreliSorular = useMemo(() => {
    const listeGenel = SORU_CEVAP_ARŞIVI.map((s) => ({ ...s, _banka: false }));
    const listeBanka = SORU_BANKASI.map((s) => { const g = soruGorunum(s, lang); return { ...g, _banka: true }; });
    const hepsi = [...listeBanka, ...listeGenel];
    if (!q) return hepsi;
    const ham = q.split(/\s+/).filter(Boolean).map((k) => metniHazirla(k) || k).filter(Boolean);
    const kelimeler = ham.length ? ham : [q];
    return hepsi.filter((s) => {
      const metin = metniHazirla(`${s.soru} ${s.cevap} ${s.kaynak}`);
      return kelimeler.every((w) => kelimeUyar(metin, w));
    });
  }, [q, lang]);
  // ★ 31.10 PEYGAMBERLER: ad + arapça ad + özet üzerinden akıllı arama
  const filtreliPeygamberler = useMemo(() => {
    if (!q) return PEYGAMBERLER;
    const ham = q.split(/\s+/).filter(Boolean).map((k) => metniHazirla(k) || arapcaHazirla(k)).filter(Boolean);
    if (!ham.length) return PEYGAMBERLER;
    return PEYGAMBERLER.filter((p) =>
      ham.every((w) => kelimeUyar(metniHazirla(`${p.ad} ${p.ozet} ${p.ders} ${p.kaynak}`), w) || kelimeUyar(arapcaHazirla(p.adAr), w)),
    );
  }, [q]);
  // ★ 31.10 SİYER: kategori adı + olay metinleri üzerinde akıllı arama
  const filtreliSiyer = useMemo(() => {
    if (!q) return SIYER_KATEGORILER;
    const ham = q.split(/\s+/).filter(Boolean).map((k) => metniHazirla(k) || k).filter(Boolean);
    if (!ham.length) return SIYER_KATEGORILER;
    return SIYER_KATEGORILER.filter((k) =>
      ham.every((w) => kelimeUyar(metniHazirla(`${k.ad} ${k.donem} ${k.olaylar.map((o) => `${o.metin} ${o.kaynak}`).join(" ")}`), w)),
    );
  }, [q]);
  // ★ 03.10: mezhepli soru-cevap filtresi ayrı değişkene alındı (akordeon + sayaç için)
  const filtreliBesSart = useMemo(() => {
    if (!q) return BES_SART_SORULARI;
    const ham = q.split(/\s+/).filter(Boolean).map((k) => metniHazirla(k) || k).filter(Boolean);
    const kelimeler = ham.length ? ham : [q];
    return BES_SART_SORULARI.filter((b) => {
      const metin = metniHazirla(`${b.soru} ${b.sart} ${b.cevaplar.map((c) => `${c.mezhep} ${c.metin}`).join(" ")} ${b.kaynak}`);
      return kelimeler.every((w) => kelimeUyar(metin, w));
    });
  }, [q]);
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
    // ★ 30.10 (kullanıcı emri): "küçük panel yapma, büyüt" — tam panel boyutu (huge):
    //   genişlik ~95vw / yükseklik 90vh; kategoriler SOL MENÜDE dikey durur, tıklayınca
    //   sağdaki arayüz değişir. Mobilde sol menü gizlenir, eski yatay çipler döner (kuplu).
    <Modal title={tt("v2KesfetTitle")} sub={tt("v2KesfetSub")} onClose={onClose} wide huge>
      <div className="flex items-start gap-3">
        {/* ── SOL MENÜ (md+): kategoriler dikey, uzun listede kaydırılabilir ── */}
        <aside className="sticky top-0 hidden max-h-[calc(90vh-9rem)] w-[190px] shrink-0 self-start flex-col gap-1 overflow-y-auto overscroll-contain border-r border-white/10 pr-2 scrollbar-thin md:flex">
          {gorunurSekmeler.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setSekme(s.id); setArama(""); setKartCevrildi(null); setAcikSure(null); setAcikKissa(null); setAcikSoru(null); setAcikGenelSoru(null); if (s.id === "kitaplik") { setKitaplikVeri(kitaplikOku()); try { const kart = JSON.parse(localStorage.getItem("nur_kart_favori_v1")||"[]").length||0; const dua = JSON.parse(localStorage.getItem("nur_kisisel_dualar_v1")||"[]").length||0; const ders = Object.keys(JSON.parse(localStorage.getItem("nur_offline_dersler_v1")||"{}")).length||0; const hedef = JSON.parse(localStorage.getItem("nur_ezber_hedef_v1")||"{}"); const tekrar = JSON.parse(localStorage.getItem("nur_ezber_tekrar_v1")||"[]"); const ezber = (hedef.gunluk||hedef.haftalik||hedef.aylik) ? `${hedef.gunluk||0}/${hedef.haftalik||0}/${hedef.aylik||0} · ${Array.isArray(tekrar)?tekrar.length:0}` : tt("itBildirimYok"); const namazL = JSON.parse(localStorage.getItem("nur_namaz_takip_v1")||"[]"); const kaza = JSON.parse(localStorage.getItem("nur_kaza_plan_v1")||"null"); const namaz = (Array.isArray(namazL)&&namazL.length)||kaza ? `${Array.isArray(namazL)?namazL.length:0} · ${kaza?"✓":"-"}` : tt("itBildirimYok"); const hayirL = JSON.parse(localStorage.getItem("nur_hayir_takip_v1")||"[]"); const hayir = Array.isArray(hayirL)?hayirL.length:0; const plan = JSON.parse(localStorage.getItem("nur_icerik_takvimi_v1")||"{}"); const takvim = Object.values(plan||{}).filter(Boolean).length; const sesTaslak = !!localStorage.getItem("nur_seslendirme_taslak_v1"); const kartTasarim = !!localStorage.getItem("nur_kart_tasarim_preset_v1"); const marka = !!localStorage.getItem("nur_marka_preset_v1"); setKitaplikEk({ kart, dua, ders, ezber, namaz, hayir, takvim, sesTaslak, kartTasarim, marka, mushaf: 0 }); } catch { setKitaplikEk({ kart:0, dua:0, ders:0, ezber: tt("itBildirimYok"), namaz: tt("itBildirimYok"), hayir:0, takvim:0, sesTaslak:false, kartTasarim:false, marka:false, mushaf:0 }); } } }}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-bold transition ${sekme === s.id ? "text-black shadow-md" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              style={sekme === s.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
            >
              <span className="text-[13px]">{s.emoji}</span> {sekmeAdi(s.id)}
            </button>
          ))}
        </aside>

        {/* ── SAĞ İÇERİK ALANI ── */}
        <div className="min-w-0 flex-1">
          {/* Mobilde sol menü yok — yatay çipler, taşarsa yatay kaydırılabilir */}
          <div className="mb-3 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto overscroll-contain pr-1 scrollbar-thin md:hidden">
            {gorunurSekmeler.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setSekme(s.id); setArama(""); setKartCevrildi(null); setAcikSure(null); setAcikKissa(null); setAcikSoru(null); setAcikGenelSoru(null); if (s.id === "kitaplik") { setKitaplikVeri(kitaplikOku()); try { const kart = JSON.parse(localStorage.getItem("nur_kart_favori_v1")||"[]").length||0; const dua = JSON.parse(localStorage.getItem("nur_kisisel_dualar_v1")||"[]").length||0; const ders = Object.keys(JSON.parse(localStorage.getItem("nur_offline_dersler_v1")||"{}")).length||0; const hedef = JSON.parse(localStorage.getItem("nur_ezber_hedef_v1")||"{}"); const tekrar = JSON.parse(localStorage.getItem("nur_ezber_tekrar_v1")||"[]"); const ezber = (hedef.gunluk||hedef.haftalik||hedef.aylik) ? `${hedef.gunluk||0}/${hedef.haftalik||0}/${hedef.aylik||0} · ${Array.isArray(tekrar)?tekrar.length:0}` : tt("itBildirimYok"); const namazL = JSON.parse(localStorage.getItem("nur_namaz_takip_v1")||"[]"); const kaza = JSON.parse(localStorage.getItem("nur_kaza_plan_v1")||"null"); const namaz = (Array.isArray(namazL)&&namazL.length)||kaza ? `${Array.isArray(namazL)?namazL.length:0} · ${kaza?"✓":"-"}` : tt("itBildirimYok"); const hayirL = JSON.parse(localStorage.getItem("nur_hayir_takip_v1")||"[]"); const hayir = Array.isArray(hayirL)?hayirL.length:0; const plan = JSON.parse(localStorage.getItem("nur_icerik_takvimi_v1")||"{}"); const takvim = Object.values(plan||{}).filter(Boolean).length; const sesTaslak = !!localStorage.getItem("nur_seslendirme_taslak_v1"); const kartTasarim = !!localStorage.getItem("nur_kart_tasarim_preset_v1"); const marka = !!localStorage.getItem("nur_marka_preset_v1"); setKitaplikEk({ kart, dua, ders, ezber, namaz, hayir, takvim, sesTaslak, kartTasarim, marka, mushaf: 0 }); } catch { setKitaplikEk({ kart:0, dua:0, ders:0, ezber: tt("itBildirimYok"), namaz: tt("itBildirimYok"), hayir:0, takvim:0, sesTaslak:false, kartTasarim:false, marka:false, mushaf:0 }); } } }}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${sekme === s.id ? "text-black shadow-md" : "glass-soft text-white/55 hover:text-white"}`}
                style={sekme === s.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
              >
                {s.emoji} {sekmeAdi(s.id)}
              </button>
            ))}
          </div>

          
          {/* Arama (kelime kartları hariç — kendi akışı var) */}
          {sekme !== "kelime" && (
            <div className="mb-3 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={arama} onChange={(e) => setArama(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} placeholder={tt("ksAraPlaceholder")} className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30" />
              </div>
              <button type="button" onClick={() => { /* canlı filtre; buton odak/erişim için */ }} className="shrink-0 rounded-xl px-3 py-2.5 text-[10px] font-bold text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{tt("ksAraButon")}</button>
            </div>
          )}

      {/* ── 112: RAMAZAN İMSAKİYESİ (01.11) — kesfetImsakiye.tsx: en üst sekme ── */}
      {sekme === "imsakiye" && (
        <div className="space-y-2">
          <IlmihalKopru baslik={tt("kopruRamazan")} dersler={["oruc", "zekat", "cuma"]} git={gitIlmihal} />
          <KesfetImsakiye tt={tt} lang={String(lang)} />
        </div>
      )}

      {/* ── 18: HADİS BANKASI — SRP adım 9 (09.10 2. tur): kesfetSekmeler.tsx ── */}
      {sekme === "hadis" && (
        <HadisBolumu
          tt={tt} hadisTema={hadisTema} setHadisTema={setHadisTema}
          hadisTemaAdi={hadisTemaAdi} filtreliHadisler={filtreliHadisler}
          kuliyatYukleniyor={kuliyatYukleniyor} kuliyatSonuc={kuliyatSonuc}
          kuliyatOffline={kuliyatOffline}
          dereceAdi={dereceAdi}
          rivayetci={rivayetci} setRivayetci={setRivayetci} rivayetciSayilari={rivayetciSayilari}
          arama={q}
        />
      )}

      {/* ── 19: KISSA KÖŞESİ — SRP adım 9: kesfetSekmeler.tsx ── */}
      {sekme === "kissa" && (
        <KissaBolumu tt={tt} filtreliKissalar={filtreliKissalar} acikKissa={acikKissa} setAcikKissa={setAcikKissa} />
      )}

      {/* ── 19b: MEZHEPLER — 02.11 kullanıcı emri: üstte 4 hak mezhep ── */}
      {sekme === "mezhepler" && (
        <div className="space-y-2">
          <IlmihalKopru baslik={tt("kopruHanefi")} dersler={["temizlik", "namaz", "oruc", "zekat"]} git={gitIlmihal} />
          <MezheplerBolumu tt={tt} />
        </div>
      )}

      {/* ── 11: İLMİHAL AKADEMİSİ (20.11) — Hanefî esaslı 12 ders · 72 madde · 36 soru · 5 dil ── */}
      {sekme === "ilmihal" && <IlmihalBolumu tt={tt} lang={lang} q={q} baslangicDers={ilmihalDers} onSekme={(s) => setSekme(s as SekmeId)} />}
      {sekme === "ahlak" && <AhlakBolumu tt={tt} lang={lang} q={q} onSekme={(s) => setSekme(s as SekmeId)} />}
      {sekme === "yarisma" && <YarismaBolumu tt={tt} lang={lang} />}

      {/* ── 24.11: KLASİK ESERLER (madde 15) + KUR'AN OKULU (madde 1 & 8) ── */}
      {sekme === "klasikEserler" && <KitapBolumu tt={tt} lang={lang} q={q} />}
      {sekme === "kuranOkulu" && <KuranOkuluBolumu tt={tt} lang={lang} />}
      {sekme === "topluluk" && <ToplulukBolumu tt={tt} lang={lang} />}

      {/* ── 9: İSLAM TARİHİ ZAMAN TÜNELİ (20.11) — 5 dönem · 41 olay, kaynaklı ── */}
      {sekme === "tarih" && (
        <div className="space-y-2">
          <button
            type="button"
            data-minitur="tarih-siyer-kopru"
            onClick={() => setSekme("siyer")}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/[.12] bg-white/[.04] px-3 py-2 text-left transition hover:bg-white/[.07]"
          >
            <span className="text-[9.5px] font-bold text-white/70">🕋 {tt("kopruSiyer")}</span>
            <span className="shrink-0 text-[9px] font-black" style={{ color: "var(--accent)" }}>{tt("kopruAc")} →</span>
          </button>
          <TarihBolumu tt={tt} lang={lang} q={q} />
        </div>
      )}

      {/* ── 21.11 SAHABELER: 20 önemli sahabe · her biri 500+ kelimelik biyografi ── */}
      {sekme === "sahabeler" && <SahabelerBolumu tt={tt} lang={lang} q={q} />}

      {/* ── 19a: SİYER-İ NEBİ (31.10): Hz. Muhammed (s.a.v.) hayatı — kronolojik kategoriler ── */}
      {sekme === "menkibeler" && <MenkibelerBolumu tt={tt} />}
      {sekme === "evliyalar" && <EvliyalatBolumu tt={tt} onGeri={() => setSekme("menkibeler")} lang={lang} />}

      {sekme === "siyer" && (
        <div className="space-y-2">
          {/* ★ 20.11 DAĞITIM: siyerin kronolojik omurgası zaman tünelinde — buradan tek tıkla açılır */}
          <button
            type="button"
            data-minitur="siyer-tarih-kopru"
            onClick={() => setSekme("tarih")}
            className="w-full rounded-xl border border-white/[.12] bg-white/[.04] px-3 py-2 text-left transition hover:bg-white/[.07]"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] font-bold text-white/75">🕰️ {tt("trZaman")} · {TARIH_TOPLAM} {tt("trOlay")}</span>
              <span className="shrink-0 text-[9px] font-black" style={{ color: "var(--accent)" }}>{tt("kopruAc")} →</span>
            </span>
            <span className="mt-1 block text-[8.5px] leading-relaxed text-white/40">{tt("kopruSiyerOzet")}</span>
          </button>
          <p className="mb-1 text-center text-[10px] leading-relaxed text-white/45">{tt("knSiyerMetin")}</p>
          {filtreliSiyer.map((k, i) => {
            const c = siyerIsim(k.id, lang);
            const kAd = c ? c.ad : k.ad;
            const kDonem = c ? c.donem : k.donem;
            return (
              <div key={k.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
                {/* kapalı satır: sıra + kategori adı + dönem etiketi; tıkla-aç akordeon */}
                <button
                  type="button"
                  onClick={() => {
                    const yeni = acikSiyer === i ? null : i;
                    setAcikSiyer(yeni);
                    setSiyerSayfa(0);
                    setSiyerYon("ileri");
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-white/[.04]"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{i + 1}</span>
                    <span className="truncate text-[12px] font-black text-white/90">{kAd}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-bold text-white/60">{kDonem}</span>
                  </span>
                  <ChevronDown size={12} className={`shrink-0 text-white/40 transition ${acikSiyer === i ? "rotate-180" : ""}`} />
                </button>
                {acikSiyer === i && (() => {
                  const olaylar = k.olaylar || [];
                  const sayfaBoyutu = 1;
                  const toplamSayfa = Math.max(1, Math.ceil(olaylar.length / sayfaBoyutu));
                  const guvenliSayfa = Math.min(siyerSayfa, toplamSayfa - 1);
                  const bas = guvenliSayfa * sayfaBoyutu;
                  const gorunenOlaylar = olaylar.slice(bas, bas + sayfaBoyutu);
                  const degistir = (hedef: number) => {
                    const yeni = Math.min(Math.max(0, hedef), toplamSayfa - 1);
                    if (yeni === guvenliSayfa) return;
                    setSiyerYon(yeni > guvenliSayfa ? "ileri" : "geri");
                    setSiyerSayfa(yeni);
                  };
                  const okBtn = "flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/[.04] text-[11px] font-black text-white/70 transition hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-30";
                  const kumanda = (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <button type="button" className={okBtn} onClick={() => degistir(guvenliSayfa - 1)} disabled={guvenliSayfa <= 0}>◀</button>
                      <span className="min-w-20 text-center text-[10px] font-black tracking-wide text-white/55">
                        {tt("evSayfa").replace("{p}", String(guvenliSayfa + 1)).replace("{t}", String(toplamSayfa))}
                      </span>
                      <button type="button" className={okBtn} onClick={() => degistir(guvenliSayfa + 1)} disabled={guvenliSayfa >= toplamSayfa - 1}>▶</button>
                    </div>
                  );
                  return (
                    <div className="border-t border-white/10 px-3 pb-3 pt-2 space-y-2">
                      {toplamSayfa > 1 && kumanda}
                      <div className="nur-book-perspective">
                        <div className="nur-book-shell">
                          <div key={`${k.id}-${guvenliSayfa}`} className={`nur-book-page p-4 sm:p-5 min-h-[280px] ${siyerYon === "ileri" ? "nur-page-turn-next" : "nur-page-turn-prev"}`}>
                            <ul className="space-y-3">
                              {gorunenOlaylar.map((o, j) => {
                                const idx = bas + j;
                                const dm = lang !== "tr" ? ((o as any)[`metin_${lang}`] as string | undefined) : undefined;
                                return (
                                  <li key={idx} className="leading-relaxed">
                                    <p className="whitespace-pre-line text-justify text-[13px] leading-[1.95] text-[#352512]">{dm || o.metin}</p>
                                    <p className="mt-3 text-[10px] font-bold leading-relaxed text-[#6b4a1e]">📖 {tt("knSiyerKaynak")}: {o.kaynak}</p>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="mt-4 flex items-center justify-between text-[10px] text-[#6b4a1e]/70">
                              <span>{guvenliSayfa > 0 ? "◀ önceki" : ""}</span>
                              <span>❦ {guvenliSayfa + 1}/{toplamSayfa}</span>
                              <span>{guvenliSayfa < toplamSayfa - 1 ? "sonraki ▶" : ""}</span>
                            </div>
                            {guvenliSayfa > 0 && <button type="button" aria-label="Önceki sayfa" className="nur-page-click-zone left" onClick={() => degistir(guvenliSayfa - 1)} />}
                            {guvenliSayfa < toplamSayfa - 1 && <button type="button" aria-label="Sonraki sayfa" className="nur-page-click-zone right" onClick={() => degistir(guvenliSayfa + 1)} />}
                          </div>
                        </div>
                      </div>
                      {toplamSayfa > 1 && kumanda}
                    </div>
                  );
                })()}
              </div>
            );
          })}
          {filtreliSiyer.length === 0 && (
            <p className="rounded-xl bg-white/[.03] px-3 py-3 text-center text-[9.5px] text-white/45">{tt("ksAraBos")}</p>
          )}
          <p className="pt-1 text-center text-[8px] text-white/25">{tt("knSiyerFooter")}</p>
        </div>
      )}

      {/* ── 19b: PEYGAMBERLER HAYATI (31.10): Kur'ân'da adı geçen 25 peygamber ── */}
      {sekme === "peygamber" && (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">{tt("ktPeygamberMetin")}</p>
          {filtreliPeygamberler.map((p, i) => (
            <div key={p.ad} className="overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
              {/* kapalı satır: ad + arapça yazım + kısa özet; tıkla-aç akordeon */}
              <button
                type="button"
                onClick={() => setAcikPeygamber(acikPeygamber === i ? null : i)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-white/[.04]"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8.5px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{i + 1}</span>
                  <span className="truncate text-[11px] font-black text-white/90">{p.ad}</span>
                  <span dir="rtl" className="font-arabic text-[13px]" style={{ color: "var(--accent-2)" }}>{p.adAr}</span>
                  {!q && <span className="hidden truncate text-[9px] text-white/40 sm:inline">{p.ozet}</span>}
                </span>
                <ChevronDown size={12} className={`shrink-0 text-white/40 transition ${acikPeygamber === i ? "rotate-180" : ""}`} />
              </button>
              {acikPeygamber === i && (
                <div className="border-t border-white/10 px-3 pb-3 pt-2">
                  <p className="text-[9.5px] leading-relaxed text-white/70">{p.ozet}</p>
                  <p className="mt-2 text-[8.5px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{tt("ktPeyOlaylar")}</p>
                  <ul className="mt-1 space-y-1">
                    {p.olaylar.map((o, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-white/60">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--accent-2)" }} />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[8.5px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{tt("ktPeyDers")}</p>
                  <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{p.ders}</p>
                  <p className="mt-2 text-[8.5px] font-bold" style={{ color: "var(--accent)" }}>📖 {tt("ktPeyKaynak")}: {p.kaynak}</p>
                </div>
              )}
            </div>
          ))}
          {filtreliPeygamberler.length === 0 && (
            <p className="rounded-xl bg-white/[.03] px-3 py-3 text-center text-[9.5px] text-white/45">{tt("ksAraBos")}</p>
          )}
          <p className="pt-1 text-center text-[8px] text-white/25">{tt("ktPeyFooter")}</p>
        </div>
      )}

      {/* ── 20: SORU-CEVAP — SRP adım 9: kesfetSekmeler.tsx ── */}
      {sekme === "soru" && (
        <div className="space-y-2">
          <IlmihalKopru
            baslik={tt("kopruSoru")}
            dersler={["iman", "temizlik", "gusul", "namaz", "oruc", "zekat", "hac", "cuma"]}
            git={gitIlmihal}
          />
          <SoruBolumu
            tt={tt} filtreliBesSart={filtreliBesSart} filtreliSorular={filtreliSorular}
            acikSoru={acikSoru} setAcikSoru={setAcikSoru}
            acikGenelSoru={acikGenelSoru} setAcikGenelSoru={setAcikGenelSoru}
          />
        </div>
      )}

      {/* ── 21: KELİME KARTLARI — SRP adım 9: kesfetSekmeler.tsx ── */}
      {sekme === "kelime" && (
        <KelimeBolumu
          tt={tt} lang={lang} gununKelimeleri={gununKelimeleri}
          kartCevrildi={kartCevrildi} setKartCevrildi={setKartCevrildi}
          bilinenSet={bilinenSet} atolyeAc={atolyeAc}
          kelimeKartlari={kelimeKartlari} kelimeYenile={kelimeYenile}
        />
      )}

      {/* ── 22: SURE BİLGİLERİ — SRP adım 9: kesfetSekmeler.tsx ── */}
      {sekme === "sure" && (
        <SureBolumu filtreliSureler={filtreliSureler} acikSure={acikSure} setAcikSure={setAcikSure} q={q} lang={String(lang||"tr")} />
      )}

      {/* ── 28: NAMAZ ÖĞRETİCİ — SRP ayrıldı: kesfetNamazBolumu.tsx (bağlamlar prop korundu); ilk buton (Namaz Çeşitleri) otomatik açık ── */}
      {sekme === "namaz" && (
        <div className="space-y-2">
          <IlmihalKopru baslik={tt("kopruNamaz")} dersler={["temizlik", "gusul", "namaz", "cuma"]} git={gitIlmihal} />
          <NamazOgreticiBolumu tt={tt} lang={lang} namazPanel={namazPanel} setNamazPanel={setNamazPanel} />
        </div>
      )}

      {/* ── 35: BEBEK DUASI — KALDIRILDI (kullanıcı kararı 28.09: doğum köşesi sitede olmayacak) ── */}

      {/* ── 61: DUA REHBERİ — SRP adım 4b: kesfetDuaBolumu; ★ 03.10 ses seçici başlarında */}
      {sekme === "dua" && (
        <>
          <DuaSesSecici notify={notify} />
          <DuaRehberBolumu filtreliDuaRehber={filtreliDuaRehber} duaOkunduTick={duaOkunduTick} duaOkunduArttir={() => setDuaOkunduTick((v) => v + 1)} />
        </>
      )}

      {/* ── 41: HOCA KARŞILAŞTIRMA ── */}
      {sekme === "hoca" && (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">{tt("ktHocaOn")} <b className="text-white/70">{tt("ktHocaBold")}</b> {tt("ktHocaSon")}</p>
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
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{hocaAyet === -1 ? tt("ktHocaSectin") : ay.etiket}</p>
              <p className="mt-0.5 text-[11px] font-bold text-white/85">{ay.sureAdi} · {tt("ktSureSonek").replace("{a}", String(ay.ayet))}</p>
              <div className="mt-2.5 grid max-h-[320px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {KARILER.map((k, i) => (
                  <button key={k.id} type="button" onClick={() => hocaCaliyor && hocaIdx === i ? hocaDurdur() : hocaCal(i)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] font-bold transition ${hocaIdx === i && hocaCaliyor ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40" : "bg-white/5 text-white/65 hover:bg-white/10"}`}>
                    <span className="text-sm">{hocaIdx === i && hocaCaliyor ? "⏸" : "▶"}</span>
                    <span className="flex-1 truncate">{k.ad}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[8px] text-white/25">{tt("ktSesKaynak")}</p>
            </div>
          ); })()}
        </div>
      )}

      {/* ── 47: CAMİ BULUCU ── */}
      {sekme === "cami" && (
        <CamiBolumu tt={tt} camiKonum={camiKonum} setCamiKonum={setCamiKonum} camiAranan={camiAranan} setCamiAranan={setCamiAranan} camiKonumAl={camiKonumAl} camiKonumAliniyor={camiKonumAliniyor} />
      )}

      {/* ── 12: KANAL REHBERİ ── */}
      {sekme === "rehber" && <KanalRehberiBolumu tt={tt} />}

      {/* ── 20c: ADAB-I MUAŞERET REHBERİ (30.10, +100 sahih kaynaklı) ── */}
      {sekme === "adab" && <AdabBolumu tt={tt} q={q} kopru={<IlmihalKopru baslik={tt("kopruAhlak")} dersler={["helal-haram", "aile"]} git={gitIlmihal} />} />}

      {/* ── 20d: SÜNNETLER REHBERİ (30.10, +100 sahih kaynaklı) ── */}
      {sekme === "sunnet" && <SunnetBolumu tt={tt} q={q} />}

      {/* ── 48: TECVİD REHBERİ ── */}
      {sekme === "tecvid" && <TecvidBolumu tt={tt} q={q} />}

      {/* ── 56: KİTAPLIĞIM ── */}
      {sekme === "kitaplik" && <KitaplikBolumu tt={tt} lang={lang} kitaplikVeri={kitaplikVeri} kitaplikEk={kitaplikEk} />}
        </div>
      </div>
    </Modal>
  );
};
