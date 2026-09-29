// ═══════════════════════════════════════════════════════════════
// KENDİ SESİNLE AYET SENKRONU — zamanlama algılama çekirdeği (30.09)
//
// AMAÇ: Kullanıcı Nûr / İhlâs suresini kendi okuyup yüklediğinde, ayet
//   kartlarının ve arka plan geçişlerinin KENDİ okuyuşuna kilitlenmesi.
//   Hızlı okursa geçişler hızlanır, uzatırsa gecikir — sadakat AudioContext
//   örnek-saatine (PCM) bağlıdır, setInterval tahminine değil.
//
// YÖNTEM (sessizlik sınırı): PCM örneklerini pencere bazında RMS'e vur,
//   konuşma/okuma aralarını sessizlik say ve ayet segmenti sınırlarını bul.
// ═══════════════════════════════════════════════════════════════

export interface SesSegmenti {
  /** Segment başlangıcı, saniye (float) */
  start: number;
  /** Segment uzunluğu, saniye (float) */
  dur: number;
}

export interface ZamanlamaSonuc {
  /** Bulunan segmentler; ayet sırasına birebir eşlenir */
  segments: SesSegmenti[];
  /** Toplam ses süresi (sn) */
  total: number;
  /** Taramada kullanılan eşik (hata ayıklama/dürüst gösterim için) */
  esik: number;
  /** Saniye başına pencere sayısı */
  pencereler: number;
}

const PENCERE_SN = 0.04; // 40ms pencere (~1639 örnek @48k) — kelime aralarıyla birebir hassas
const SESLI_SN = 0.08;   // pencere sesli sayılmak için en az bu kadar üst üste sesli olmalı
const SESSIZ_SN = 0.22;  // bu kadar uzun sessizlik → yeni segment (ayet arası nefes)
const MIN_SEG_SN = 0.35; // bundan kısa segment parazittir, öncekine katılır
const BAS_ETIKET_SN = 0.35; // sesin başındaki boşluk 35cm > saniyeye indirilir
const SON_ETIKET_SN = 0.5;

/** RMS tabanlı sessizlik sınırı taraması. PCM dışı girdi → hata fırlatır. */
export function taramaYap(buffer: AudioBuffer, ayetSayisi: number): ZamanlamaSonuc {
  const kanal = buffer.getChannelData(0);
  const ornekHz = buffer.sampleRate;
  const pencereBoyu = Math.max(1, Math.round(PENCERE_SN * ornekHz));
  const toplam = Math.floor(kanal.length / pencereBoyu);

  // 1) pencere RMS'leri
  const rmsler = new Float32Array(toplam);
  for (let p = 0; p < toplam; p += 1) {
    let toplamKare = 0;
    const bas = p * pencereBoyu;
    for (let i = 0; i < pencereBoyu; i += 1) {
      const v = kanal[bas + i];
      toplamKare += v * v;
    }
    rmsler[p] = Math.sqrt(toplamKare / pencereBoyu);
  }

  // 2) eşik: ilk %15 ve son %15 pencere "sessiz varsayım" → ortanca taban gürültü.
  //    Ortanca, tek vuruşlu gürültülere dayanıklıdır.
  const kenar = Math.max(4, Math.floor(toplam * 0.15));
  const kenarDizi = Array.from(rmsler.slice(0, kenar)).concat(Array.from(rmsler.slice(toplam - kenar)));
  kenarDizi.sort((a, b) => a - b);
  const taban = kenarDizi[Math.floor(kenarDizi.length / 2)] || 0.005;
  const esik = Math.max(taban * 2.2, 0.008);

  // 3) pencere → sesli/sessiz ikili dizisi + minimum süre tavanları
  const sesliPencereSay = Math.round(SESLI_SN / PENCERE_SN);
  const sessizPencereSay = Math.round(SESSIZ_SN / PENCERE_SN);
  const sesli = new Array<boolean>(toplam).fill(false);
  for (let p = 0; p < toplam; p += 1) sesli[p] = rmsler[p] > esik;

  // 4) segment sınırları: sesli koşular başlatır, yeterli sessizlik bitirir
  let segments: SesSegmenti[] = [];
  let segBas = -1;
  let sessizUstUste = 0;
  const pencereSn = PENCERE_SN;
  const kapan = (bitisPencere: number) => {
    if (segBas < 0) return;
    const start = Math.max(0, segBas * pencereSn - (segBas === 0 ? 0 : BAS_ETIKET_SN * 0));
    const dur = bitisPencere * pencereSn - start;
    if (dur >= MIN_SEG_SN) segments.push({ start, dur });
    else if (segments.length) {
      // kısa parazit: önceki segmente kat
      const onceki = segments[segments.length - 1];
      onceki.dur = (bitisPencere * pencereSn) - onceki.start;
    } else if (start >= 0) {
      // ilk parça kısa ise bile kaydet (tek kısa kelime yüklemesini yutma)
      segments.push({ start, dur });
    }
    segBas = -1;
  };
  for (let p = 0; p < toplam; p += 1) {      if (sesli[p]) {
      if (segBas < 0) {
        // sesli koşu gerçekten SESLI_SN kadar sürdü mü? — kısa tık atla
        let ileri = 0;
        while (p + ileri < toplam && sesli[p + ileri]) ileri += 1;
        if (ileri >= sesliPencereSay) { segBas = p; sessizUstUste = 0; } // ★ yeni segment: sessizlik sayacı SIFIR
        p += ileri - 1;
        continue;
      }
      sessizUstUste = 0;
    } else if (segBas >= 0) {
      sessizUstUste += 1;
      if (sessizUstUste >= sessizPencereSay) kapan(p - sessizUstUste + 1);
    }
  }
  kapan(toplam);

  // 5) fazladan segment → ayet sayısına katla (uzun surelerde nefes araları
  //    ayet sınırını aşabilir); eksikse per-ayet eşit bölüştür.
  const total = buffer.duration;
  if (segments.length > ayetSayisi && ayetSayisi > 0) {
    segments = birlestir(segments, ayetSayisi);
  } else if (segments.length < ayetSayisi && ayetSayisi > 0) {
    // bazen ayet içinde uzun duraklar kayıt kesiyor → eksikse eşit bölüm
    const esit = boluEsit(total, ayetSayisi);
    return { segments: esit, total, esik, pencereler: toplam };
  }
  // son segmente minimal kuyruk payı — son hece kesilmesin (tüm sessizliği yutmadan)
  if (segments.length) {
    const son = segments[segments.length - 1];
    const uzatma = Math.min(0.15, Math.max(0, total - (son.start + son.dur)));
    son.dur += uzatma;
  }
  return { segments, total, esik, pencereler: toplam };
}

/** Fazla segmentleri azaltarak ayet sayısına eşitle (en kısa boşluğu katlayarak). */
function birlestir(liste: SesSegmenti[], hedef: number): SesSegmenti[] {
  const kopya = liste.map((s) => ({ ...s }));
  while (kopya.length > hedef) {
    // en kısa segmenti sağındaki/solundaki en yakın komşuya kat
    let enKucukIdx = 0;
    let enKucukUzun = Infinity;
    for (let i = 0; i < kopya.length; i += 1) {
      if (kopya[i].dur < enKucukUzun) { enKucukUzun = kopya[i].dur; enKucukIdx = i; }
    }
    const silinen = kopya[enKucukIdx];
    if (enKucukIdx > 0) {
      const onceki = kopya[enKucukIdx - 1];
      onceki.dur = silinen.start + silinen.dur - onceki.start;
    } else {
      const sonraki = kopya[enKucukIdx + 1];
      sonraki.start = silinen.start;
      sonraki.dur = sonraki.start + sonraki.dur - silinen.start;
    }
    kopya.splice(enKucukIdx, 1);
  }
  return kopya;
}

/** Eksik algılama durumunda eşit bölüştür (en azından sıralı-uyumlu başlangıç). */
function boluEsit(total: number, adet: number): SesSegmenti[] {
  const bir = total / Math.max(adet, 1);
  return Array.from({ length: adet }, (_, i) => ({ start: bir * i, dur: bir }));
}

/** Kullanıcı düzenlemesi: bir ayetin başlangıcını kaydır; komşularla çakışmayı önle. */
export function baslangicKaydir(liste: SesSegmenti[], index: number, yeniBas: number, total: number): SesSegmenti[] {
  const kopya = liste.map((s) => ({ ...s }));
  const su = kopya[index];
  if (!su) return kopya;
  const altSinir = index > 0 ? kopya[index - 1].start + 0.2 : 0;
  const ustSinir = index < kopya.length - 1 ? kopya[index + 1].start - 0.2 : total - 0.3;
  const clamped = Math.min(Math.max(yeniBas, Math.max(0, altSinir)), Math.max(0, ustSinir));
  kopya[index - 0].start = clamped;
  if (index > 0) kopya[index - 1].dur = Math.max(0.1, clamped - kopya[index - 1].start);
  if (index < kopya.length - 1) kopya[index].dur = Math.max(0.1, kopya[index + 1].start - clamped);
  else kopya[index].dur = Math.max(0.1, total - clamped);
  return kopya;
}

/** Ayetler arasına nefes boşluğu ekle: her geçişten önce `ekSaniye` sessizlik.
 *  Üretim toplam süresi uzar ama ayet bittiğinde ekran hemen değişmez — doğal. */
export function nefesAraliklariEkle(liste: SesSegmenti[], ekSaniye: number): SesSegmenti[] {
  if (ekSaniye <= 0) return liste;
  const sonuc: SesSegmenti[] = [];
  let tasima = 0;
  for (let i = 0; i < liste.length; i += 1) {
    if (i > 0) tasima += ekSaniye;
    sonuc.push({ start: liste[i].start + tasima, dur: liste[i].dur });
  }
  return sonuc;
}

/** Segment listesinin geçerli ve sıralı olduğunu garantiye al. */
export function duzelt(liste: SesSegmenti[], total: number): SesSegmenti[] {
  const sirali = [...liste].sort((a, b) => a.start - b.start);
  for (let i = 0; i < sirali.length; i += 1) {
    sirali[i].start = Math.max(0, sirali[i].start);
    const sonraki = i < sirali.length - 1 ? sirali[i + 1].start : total;
    sirali[i].dur = Math.max(0.1, Math.min(sirali[i].dur, sonraki - sirali[i].start));
  }
  return sirali;
}
