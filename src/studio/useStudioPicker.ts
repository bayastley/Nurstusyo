import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
// ════════════════════════════════════════════════════════
// USESTUDIOPICKER.TS — StudioApp parçalama turu (25.10):
// öneri taslağı motoru + misafir kapısı + pickClip/alıntı atama + altar çızleri.
// Birebir taşınma (davranış aynı).
// ════════════════════════════════════════════════════════
import { useCallback, useMemo } from "react";
import { PRAYERS } from "./studioConstants";
import { tierAtLeast } from "../tier";
import { reciterRequiredTier } from "../tier";
import { isR2Media, getVideoUrlSync, getVideoUrl, getPosterUrl } from "../videoUrl";
import { GUEST_FREE_VIDEOS } from "./useGuestTrial";
import { TURKISH_CITIES, DUNYA_SEHIRLERI } from "../data";
import type { Clip, CatId } from "../clips";
import { KATEGORI_TIER, FREE_VIDEOS_PER_CATEGORY } from "../clips";
import type { SelectedAyah } from "../types";
import type { ModalName } from "../types";
import type { Tier } from "../tier";
import { RECITERS } from "../reciters";
import type { OneriVideo } from "../components/OnerilenVideolar";

interface UseStudioPickerParam {
  combinedAllClips: Clip[];
  clipKind: "img" | "vid";
  isClipAccessible: (clip: Clip) => boolean;
  sortedReciters: typeof RECITERS;
  accessTier: Tier;
  generating: boolean;
  notify: (m: string) => void;
  setSelected: React.Dispatch<React.SetStateAction<SelectedAyah[]>>;
  setReciterId: React.Dispatch<React.SetStateAction<string>>;
  addAyah: (s: number, a: number) => Promise<void>;
  setAyahBackgrounds: React.Dispatch<React.SetStateAction<Record<string, Clip>>>;
  setBackground: React.Dispatch<React.SetStateAction<Clip>>;
  handleGenerate: () => void | Promise<void>;
  background: Clip;
  ayahBackgrounds: Record<string, Clip>;
  selectedRef: React.MutableRefObject<SelectedAyah[]>;
  ayahBackgroundsRef: React.MutableRefObject<Record<string, Clip>>;
  backgroundRef: React.MutableRefObject<Clip>;
  prayerTimings: Record<string, string> | null;
  now: Date;
  prayerSearch: string;
  atmosCategory: CatId | "all";
  atmosQuery: string;
  pickingFor: string | null;
  setModal: (m: ModalName | null) => void;
  setPickingFor: React.Dispatch<React.SetStateAction<string | null>>;
  ensureVideo: (url: string, fallbackUrl?: string) => HTMLVideoElement;
}

/** StudioApp seçim/öneri/misafir kancası — parçalama turu (25.10). */
export function useStudioPicker(p: UseStudioPickerParam) {
  const {
    combinedAllClips, clipKind, isClipAccessible, sortedReciters, accessTier, generating, notify,
    setSelected, setReciterId, addAyah, setAyahBackgrounds, setBackground, handleGenerate,
    background, ayahBackgrounds, selectedRef, ayahBackgroundsRef, backgroundRef,
    prayerTimings, now, prayerSearch, atmosCategory, atmosQuery, pickingFor, setModal, setPickingFor, ensureVideo,
  } = p;
  // ★ 22.10 ÖNERİLEN VİDEOLAR — HAZIR TASLAK (kullanıcı emri: "önerilen ATMOSFER değil,
  //   ÖNERİLEN VİDEO. Cuma ise cumayı anlatan video: kâri seçilmiş, atmosfer atanmış,
  //   ayet yazılmış. Perşembe başka bir şey; sürekli değişsin"): OnerilenVideolar
  //   güne/mübarek güne özel taslakları rotasyonla önerir; "Üret" → seçim temizlenir,
  //   ayetler çekilir, kâri + atmosfer atanır ve üretim NORMAL yolculuğuyla başlar
  //   (misafir kapısı, jeton onayı, /api/render/authorize… — öneriye bedava yetki yok).
  const oneriHavuzu = useMemo(
    () => combinedAllClips.filter((clip) => clip.kind === clipKind && clip.cat !== "yuklenenler" && isClipAccessible(clip)),
    [combinedAllClips, clipKind, isClipAccessible],
  );
  const oneriKullanilanlar = useMemo(
    () => Array.from(new Set([background, ...Object.values(ayahBackgrounds)].map((c) => c?.cat).filter(Boolean))) as string[],
    [background, ayahBackgrounds],
  );
  const oneriKabileleri = useMemo(
    () => sortedReciters.filter((r) => tierAtLeast(accessTier, reciterRequiredTier(r))).map((r) => ({ id: r.id, name: r.name })),
    [sortedReciters, accessTier],
  );
  const oneriUygulaVeUret = useCallback((oneri: OneriVideo) => {
    if (generating) return;
    setSelected([]);
    setReciterId(oneri.reciterId);
    notify(ttX2610("spTaslak").replace("{x}", String(oneri.baslik)));
    void (async () => {
      for (const a of oneri.ayetler) { await addAyah(a.s, a.a); }
      // Ayet metinleri (ar/tr) gelmeden üretimde boş ekran çıkar — bekle (max ~6 sn)
      const bas = Date.now();
      while (Date.now() - bas < 6000) {
        const eksik = oneri.ayetler.some((a) => {
          const sl = selectedRef.current.find((x) => x.id === `${a.s}:${a.a}`);
          return !sl || !sl.ar;
        });
        if (!eksik && selectedRef.current.length > 0) break;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      // Atmosfer: taslağın klibi tüm ayet slotlarına (kullanıcının kendi dosyası hariç)
      const sonraki: Record<string, Clip> = {};
      selectedRef.current.forEach((item) => {
        sonraki[item.id] = ayahBackgroundsRef.current[item.id]?.cat === "yuklenenler" ? ayahBackgroundsRef.current[item.id] : oneri.katliClip;
      });
      setAyahBackgrounds(sonraki);
      if (backgroundRef.current?.cat !== "yuklenenler") setBackground(oneri.katliClip);
      window.setTimeout(() => handleGenerate(), 500);
    })();
  }, [generating, notify, setSelected, setReciterId, addAyah, setAyahBackgrounds, setBackground, handleGenerate]);
  const nextPrayer = useMemo(() => {
    if (!prayerTimings) return null;
    let next: { name: string; key: string; diff: number } | null = null;
    for (const [name, key] of PRAYERS) {
      const value = prayerTimings[key]; if (!value) continue;
      const [hour, minute] = value.slice(0, 5).split(":").map(Number), target = new Date(now);
      target.setHours(hour, minute, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff <= 0) diff += 86400000;
      if (!next || diff < next.diff) next = { name, key, diff };
    }
    return next;
  }, [now, prayerTimings]);

  const filteredClips = useMemo(() => {
    let pool = combinedAllClips;
    pool = pool.filter((clip) => clip.kind === clipKind);
    if (atmosCategory !== "all") { pool = pool.filter((clip) => clip.cat === atmosCategory); }
    else { pool = pool.filter((clip) => isClipAccessible(clip)); } // ★ "Tümü": sadece erişilebilir (kullanıcının açabildiği) klipler — boş grid olmasın
    const value = atmosQuery.trim().toLocaleLowerCase("tr");
    if (value) { pool = pool.filter((clip) => clip.label.toLocaleLowerCase("tr").includes(value)); }
    // ★ Performans: eski karşılaştırıcı her adımda tüm arşivi tarıyordu (O(n²)) ve
    //   mobilde/site genelinde donmaya yol açıyordu. Kilit durumu tek geçişte hesaplanıyor (O(n)).
    const idxMap = new Map<string, number>();
    const seen = new Map<string, number>();
    for (const clip of pool) {
      const key = clip.cat as string;
      const n = seen.get(key) ?? 0;
      idxMap.set(clip.id, n);
      seen.set(key, n + 1);
    }
    const lockMap = new Map<string, number>();
    for (const clip of pool) {
      const catTier = KATEGORI_TIER[clip.cat as CatId] ?? "free";
      const nextTier: Tier = catTier === "free" ? "pro" : catTier === "pro" ? "elit" : "elit";
      const unlocked = tierAtLeast(accessTier, catTier);
      const idx = idxMap.get(clip.id) ?? 0;
      const locked = !unlocked || (idx >= FREE_VIDEOS_PER_CATEGORY && !tierAtLeast(accessTier, nextTier));
      lockMap.set(clip.id, locked ? 1 : 0);
    }
    return [...pool].sort((a, b) => (lockMap.get(a.id) ?? 0) - (lockMap.get(b.id) ?? 0));
  }, [atmosCategory, atmosQuery, clipKind, combinedAllClips, accessTier, isClipAccessible]);

  // ★ ŞEHİR ARAMASI (02.10): TR + DÜNYA şehirleri birlikte aranır; dünya kayıtları
  //   "Mekke · Suudi Arabistan" etiketiyle listelenir, seçilince gerçek ad setPrayerCity'ye gider.
  const filteredCities = useMemo(() => {
    const value = prayerSearch.trim().toLocaleLowerCase("tr");
    const dunyaEtiketleri = DUNYA_SEHIRLERI.map((s) => `${s.ad} · ${s.ulke}`);
    const havuz = [...TURKISH_CITIES, ...dunyaEtiketleri];
    return value ? havuz.filter((city) => city.toLocaleLowerCase("tr").includes(value)) : havuz;
  }, [prayerSearch]);

  const pickClip = (clip: Clip) => {
    // ★ TIKLAMA ANINDA ÖN İMZA: useEffect render'ı bekler, biz beklemeden imzayı
    //   kuyruğun en önüne şimdi atıyoruz — seçim ile imza isteği aynı milisaniyede başlar.
    if (clip.kind === "vid" && isR2Media(clip) && !getVideoUrlSync(clip)) {
      getVideoUrl(clip, true).then((url) => { if (url) ensureVideo(url, clip.src); }).catch(() => undefined);
      void getPosterUrl(clip).catch(() => undefined);
    }
    if (pickingFor) setAyahBackgrounds((current) => ({ ...current, [pickingFor]: clip }));
    else {
      setBackground(clip);
      // ★ KULLANICI MEDYASI KUTSAL (30.09): galeriden kendi dosyası (Yüklediklerim)
      //   seçilirse TÜM ayet slotlarına uygulanır — eski atmosferler üretimi ezemesin.
      if (clip.cat === "yuklenenler") {
        const items = selectedRef.current;
        if (items.length) {
          setAyahBackgrounds((current) => {
            const next = { ...current };
            items.forEach((item) => { next[item.id] = clip; });
            return next;
          });
        }
      }
    }
    notify(ttX2610("spSecildi").replace("{x}", String(clip.label)));
    setModal(null);
    setPickingFor(null);
  };



  // ★ MİSAFİR MODU — üye olmadan deneme hakkı
  //   Sayaç + gün çıpası + zaman damgası useGuestTrial'daki bumpGuestUsed ile yönetilir:
  //   günde en fazla GUEST_DAILY_CAP üretim, aralarında GUEST_COOLDOWN_SEC fren (F5 spam engeli).
  //   GUEST_FREE_VIDEOS tek doğruluk kaynağı useGuestTrial export'u (kopya değil).
  const getGuestUsed = () => {
    try { return Number(localStorage.getItem("nur_guest_videos") || 0); } catch { return 0; }
  };
  const handleGuestContinue = useCallback(() => {
    const used = getGuestUsed();
    const left = Math.max(0, GUEST_FREE_VIDEOS - used);
    if (left <= 0) {
      notify(ttX2610("spMisafirDoldu"));
      return;
    }
    setModal(null);
    notify(ttX2610("spMisafirModu").replace("{x}", String(left)));
  }, [notify]);
  return {
    oneriHavuzu, oneriKullanilanlar, oneriKabileleri, oneriUygulaVeUret,
    nextPrayer, filteredClips, filteredCities, pickClip, getGuestUsed, handleGuestContinue,
  };
}
