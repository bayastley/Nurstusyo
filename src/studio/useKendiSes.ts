import { useState, useEffect, useCallback, useRef, type MutableRefObject } from "react";
import { taramaYap, duzelt, nefesAraliklariEkle, type SesSegmenti } from "./sesZamanlama";
import { sesleriOku, sesYaz, sesSil, zamanlamalariGuncelle, sesOku, type StoredSes } from "./sesDeposu";

// ═══════════════════════════════════════════════════════════════
// USE KENDİ SESİNİ YÜKLE (30.09) — ELİT özelliği
//
// Kullanıcı kendi okuyuşunu yükler →
//   1) decodeAudioData ile PCM'e açılır
//   2) sessizlik-sınırı taramasıyla ayet segmentleri bulunur (sesZamanlama.ts)
//   3) segmentler ayet-başına düzenlenebilir (milisanielik AudioContext saati)
//   4) IndexedDB'de kalıcı saklanır (blob + zamanlamalar)
//   5) önizleme AudioContext örnek-saatiyle oynar — kart/arka plan geçişi
//      kullanıcının kendi sesine birebir kilitli
// ═══════════════════════════════════════════════════════════════

export interface KendiSesAktif {
  /** Kayıt id (depo) */
  id: string;
  sure: number;
  kaynak: "tum-sure" | "ayet-basina";
  /** Etkin segmentler (nefes aralığı uygulanmış, sıralı) */
  segments: SesSegmenti[];
  /** Ham blob — üretim ve önizleme için */
  blob: Blob;
  /** Nesne URL (yaşam döngüsü hook'ta) */
  url: string;
  /** Nefes aralığı (sn) */
  nefes: number;
}

interface UseKendiSesParams {
  notify: (msg: string) => void;
}

function yeniId(): string {
  return `kses-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function useKendiSesiniYukle({ notify }: UseKendiSesParams) {
  const [aktif, setAktif] = useState<KendiSesAktif | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kayitlar, setKayitlar] = useState<StoredSes[]>([]);
  const urlRef = useRef<string>("");

  const urlTasi = useCallback((blob: Blob): string => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const u = URL.createObjectURL(blob);
    urlRef.current = u;
    return u;
  }, []);

  // Açılışta kayıtları oku; aktif seçim ilk uygun kayıt DEĞİL — kullanıcı seçer (dürüst boş başlangıç)
  useEffect(() => {
    let live = true;
    sesleriOku().then((rows) => { if (live) setKayitlar(rows); });
    return () => {
      live = false;
      if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = ""; }
    };
  }, []);

  const kayitlariTazele = useCallback(async () => {
    const rows = await sesleriOku();
    setKayitlar(rows);
    return rows;
  }, []);

  /** PCM taraması + depoya yaz. Dönen segmentler UI'da gösterilir. */
  const yukle = useCallback(async (dosya: File, sure: number, ayetSayisi: number, konum: "tum" | number): Promise<{ segments: SesSegmenti[]; id: string; total: number } | null> => {
    if (!dosya) return null;
    if (dosya.size > 60 * 1024 * 1024) { notify("⚠️ Ses dosyası 60 MB'den büyük olamaz"); return null; }
    if (!/^(audio|video)\//.test(dosya.type || "")) { notify("⚠️ Lütfen ses dosyası yükleyin (mp3, m4a, wav, ogg)"); return null; }
    setYukleniyor(true);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      try {
        const buf = await ctx.decodeAudioData(await dosya.arrayBuffer());
        const tarama = taramaYap(buf, konum === "tum" ? Math.max(ayetSayisi, 1) : 1);
        if (tarama.segments.length === 0) {
          notify("⚠️ Seste okunan bölüm algılanamadı — dosya sessiz veya bozuk olabilir");
          return null;
        }
        const segments = duzelt(tarama.segments, tarama.total);
        const id = yeniId();
        const gonderi: Omit<StoredSes, "createdAt"> = {
          id,
          konum,
          sure,
          ad: dosya.name.slice(0, 80),
          mime: dosya.type || "audio/mpeg",
          size: dosya.size,
          blob: dosya,
          zamanlamalar: segments.map((s) => ({ start: +s.start.toFixed(3), dur: +s.dur.toFixed(3) })),
          kaynak: konum === "tum" ? "tum-sure" : "ayet-basina",
          sure_sn: +tarama.total.toFixed(3),
          nefes: 0,
        };
        const yazildi = await sesYaz(gonderi);
        await kayitlariTazele();
        const url = urlTasi(dosya);
        setAktif({ id, sure, kaynak: gonderi.kaynak, segments, blob: dosya, url, nefes: 0 });
        const ekstra = Math.abs(tarama.segments.length - (konum === "tum" ? ayetSayisi : 1));
        notify(yazildi
          ? `🎙️ Ses yüklendi · ${konum === "tum" ? `${ayetSayisi} ayet için` : "ayet için"} ${segments.length} bölüm algılandı${ekstra > 0 ? " — ayet sınırını düzenleyebilirsin" : " · senkron hazır"}`
          : "🎙️ Ses yüklendi (bu oturum için) · kalıcı kayıt yapılamadı");
        return { segments, id, total: tarama.total };
      } finally {
        ctx.close().catch(() => undefined);
      }
    } catch {
      notify("⚠️ Ses dosyası çözümlenemedi — mp3/m4a/wav deneyin");
      return null;
    } finally {
      setYukleniyor(false);
    }
  }, [kayitlariTazele, notify, urlTasi]);

  /** Ayet başına ayrı dosya yüklerken: her dosyanın zamanlaması [0] tek segment olur. */
  const yukleAyetAyri = useCallback(async (dosya: File, sure: number, ayet: number): Promise<boolean> => {
    const sonuc = await yukle(dosya, sure, 1, ayet);
    return Boolean(sonuc);
  }, [yukle]);

  /** Aktif kaydı seç (depo) */
  const sec = useCallback(async (id: string): Promise<boolean> => {
    const row = await sesOku(id);
    if (!row) { notify("⚠️ Kayıt bulunamadı"); return false; }
    const url = urlTasi(row.blob);
    const segments = nefesAraliklariEkle(duzelt(row.zamanlamalar, row.sure_sn), row.nefes);
    setAktif({ id: row.id, sure: row.sure, kaynak: row.kaynak, segments, blob: row.blob, url, nefes: row.nefes });
    return true;
  }, [notify, urlTasi]);

  const sil = useCallback(async (id: string) => {
    await sesSil(id);
    const rows = await kayitlariTazele();
    setAktif((cur) => (cur?.id === id ? null : cur));
    notify(rows.length ? "Kayıt silindi" : "Kayıt silindi · deposu boş");
  }, [kayitlariTazele, notify]);

  /** Zamanlama düzenini kalıcıya yaz + aktifi tazele */
  const zamanlamaKaydet = useCallback(async (id: string, yeni: SesSegmenti[], nefes?: number) => {
    await zamanlamalariGuncelle(id, yeni.map((s) => ({ start: +s.start.toFixed(3), dur: +s.dur.toFixed(3) })), nefes);
    await kayitlariTazele();
    setAktif((cur) => {
      if (!cur || cur.id !== id) return cur;
      const segments = nefesAraliklariEkle(duzelt(yeni, cur.segments[cur.segments.length - 1].start + cur.segments[cur.segments.length - 1].dur), nefes ?? cur.nefes);
      return { ...cur, segments, nefes: nefes ?? cur.nefes };
    });
    notify("✅ Ayet zamanlamaları kaydedildi");
  }, [kayitlariTazele, notify]);

  const kaldirAktif = useCallback(() => setAktif(null), []);

  return { aktif, yukleniyor, kayitlar, yukle, yukleAyetAyri, sec, sil, zamanlamaKaydet, kaldirAktif };
}
