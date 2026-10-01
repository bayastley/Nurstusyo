import { useCallback, useEffect, useState } from "react";
import type { Clip } from "../clips";
import { getStoredMedia } from "./medyaStore";
import { medyaClipYukle } from "../components/medyaKutuphaneHelpers";

/**
 * ★ KULLANICI MEDYASI hook'u (28.09 → 01.10 StudioApp'ten çıkarıldı)
 *
 * IndexedDB'de KALICI saklanan kullanıcı medyasını (video/resim) yönetir:
 *  - medyaClips: "📁 Yüklediklerim" galeri klipleri (Clip olarak)
 *  - yuklenenleriYukle: açılışta IndexedDB'den galeriyi kurar (boşsa da yazar — hayalet kalmaz)
 *  - medyaArkaPlanYap: "Stüdyoya Arka Plan Yap" — blob → taze URL → Clip → arka plan/slot ataması
 *  - onMedyaSenkron: ZipExplorer yükle/sil/temizle sonrası galeri tazeleme
 *
 * Arka plan atama kararı dönebilir (secilsinMi / pickingFor / seçili ayetler) —
 * StudioApp kendi state'ine (setBackground, setAyahBackgrounds) kendisi uygular.
 */
export function useMedyaYukleme(options: {
  notify: (msg: string) => void;
  setBackground: (clip: Clip) => void;
  setAyahBackgrounds: (updater: (current: Record<string, Clip>) => Record<string, Clip>) => void;
  pickingFor: string | null;
  selected: { id: string }[];
}) {
  const { notify, setBackground, setAyahBackgrounds, pickingFor, selected } = options;

  const [medyaClips, setMedyaClips] = useState<Clip[]>([]);

  // ★ MEDYA → ARKA PLAN (28.09): Medya Yükleme'deki "Stüdyoya Arka Plan Yap" buraya gelir.
  //   IndexedDB'den blob okunur → taze blob URL'i → Clip → arka plan (+ pickingFor ise ayete atanır).
  const medyaArkaPlanYap = useCallback(async (medyaId: string, secilsinMi = true) => {
    const row = await getStoredMedia(medyaId);
    if (!row) { notify("⚠️ Dosya kalıcı depoda bulunamadı — yeniden yüklemeyi dene"); return; }
    if (row.tur === "ses") { notify("🎵 Ses dosyası arka plan olamaz — arka plan için video/resim seç"); return; }
    try {
      const url = URL.createObjectURL(row.blob);
      const clip: Clip = { id: `medya-${row.id}`, label: row.name, cat: "yuklenenler", kind: row.tur === "resim" ? "img" : "vid", src: url };
      setMedyaClips((cur) => (cur.some((c) => c.id === clip.id) ? cur : [clip, ...cur]));
      // ★ secilsinMi=false: yalnız galeriye kaydet (Yüklediklerim klasörü), arka planı DEĞİŞTİRME
      if (!secilsinMi) { notify(`📁 "${row.name}" Yüklediklerim klasörüne kaydedildi`); return; }
      if (pickingFor) {
        setAyahBackgrounds((current) => ({ ...current, [pickingFor]: clip }));
      } else {
        // ★ KULLANICI SEÇİMİ KUTSAL (30.09): kullanıcı kendi dosyasını "arka plan yap"
        //   dediğinde atmosfer kalmaz — TÜM seçili ayetlere uygulanır + ana arka plan olur.
        //   (Önceki davranış: yalnız ana arka plan; ayet slotlarındaki eski atmosferler
        //   ezmeye devam ediyordu — kullanıcının şikâyetinin kök nedeni.)
        setBackground(clip);
        const items = selected;
        if (items.length) {
          setAyahBackgrounds((current) => {
            const next = { ...current };
            items.forEach((item) => { next[item.id] = clip; });
            return next;
          });
        }
      }
      notify(`💾 "${row.name}" arka plan olarak seçildi — kalıcı depodan`);
    } catch {
      notify("⚠️ Dosya açılamadı — depolama erişimi engellenmiş olabilir");
    }
  }, [pickingFor, notify, setBackground, setAyahBackgrounds, selected]);

  // ★ YÜKLEDİKLERİM KLASÖRÜ (30.09): açılışta IndexedDB'deki tüm kalıcı medya
  //   galeriye yüklenir — kişinin cihazından ekledikleri her oturumda yerinde kalsın.
  //   (Sunucumuz yok; her şey kullanıcının kendi tarayıcısında.)
  //   medyaClipYukle: SHA-256 bütünlük kontrolü yapar; bozuk dosyayı sessizce atlar.
  //   Bütünlük özeti olmayan eski kayıtlar da kabul edilir — veri kaybı yok.
  const yuklenenleriYukle = useCallback(async () => {
    try {
      const klipler = await medyaClipYukle();
      setMedyaClips(klipler); // boşsa da yaz — silinen dosya galeride hayalet kalmasın
    } catch { /* depo yoksa sessiz — site ASLA bozulmaz */ }
  }, []);

  useEffect(() => { void yuklenenleriYukle(); }, [yuklenenleriYukle]);

  // ★ Galeri senkronu: ZipExplorer yükle/sil/temizle sonrası çağırır
  const onMedyaSenkron = useCallback(() => { void yuklenenleriYukle(); }, [yuklenenleriYukle]);

  return { medyaClips, setMedyaClips, medyaArkaPlanYap, yuklenenleriYukle, onMedyaSenkron };
}
