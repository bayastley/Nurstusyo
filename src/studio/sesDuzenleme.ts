// ════════════════════════════════════════════════════════
// GELİŞMİŞ SES DÜZENLEME — yol haritası madde 21
//   • ses seviyesi dengeleme  → gain zarfının tepe değeri
//   • sessizlik temizleme     → buffer başı/sonu sessizliği kırpılır
//   • ses başlangıcını ayarlama → baştan N sn kırpılır
//   • fade-in / fade-out      → giriş-çıkış rampaları
//   • ses önizleme            → offline render + gerçek çalma
// Üretim hattı (studio/useVideoGenerator) bu ayarları okur; varsayılanlar
// ESKİ davranışla birebir aynıdır (0.92 · 0.06 · 0.15), yani ayar
// değiştirilmezse çıktı bugünküyle aynı kalır.
// ════════════════════════════════════════════════════════

const AYAR_KEY = "nur_ses_duzenleme_v1";

export interface SesAyar {
  /** Tepe kazanç (0.1 – 1) */
  seviye: number;
  /** Buffer başındaki/sonundaki sessizliği kırp */
  sessizlik: boolean;
  /** Her ayet sesinin başından kırpılacak saniye */
  baslangic: number;
  /** Giriş rampası (sn) */
  fadeIn: number;
  /** Çıkış rampası (sn) */
  fadeOut: number;
}

export const VARSAYILAN_SES_AYAR: SesAyar = { seviye: 0.92, sessizlik: false, baslangic: 0, fadeIn: 0.06, fadeOut: 0.15 };

/** Sessizlik eşiği (~-42 dB) */
const SESSIZLIK_ESIK = 0.008;

const sinirla = (n: number, alt: number, ust: number): number => Math.min(ust, Math.max(alt, n));

export function sesAyarOku(): SesAyar {
  try {
    const ham = localStorage.getItem(AYAR_KEY);
    if (!ham) return VARSAYILAN_SES_AYAR;
    const veri: unknown = JSON.parse(ham);
    if (!veri || typeof veri !== "object") return VARSAYILAN_SES_AYAR;
    const v = veri as Partial<SesAyar>;
    return {
      seviye: sinirla(typeof v.seviye === "number" ? v.seviye : VARSAYILAN_SES_AYAR.seviye, 0.1, 1),
      sessizlik: v.sessizlik === true,
      baslangic: sinirla(typeof v.baslangic === "number" ? v.baslangic : 0, 0, 2),
      fadeIn: sinirla(typeof v.fadeIn === "number" ? v.fadeIn : VARSAYILAN_SES_AYAR.fadeIn, 0, 1.5),
      fadeOut: sinirla(typeof v.fadeOut === "number" ? v.fadeOut : VARSAYILAN_SES_AYAR.fadeOut, 0, 1.5),
    };
  } catch (hata) {
    console.warn("[sesDuzenleme] ayar okunamadı", hata);
    return VARSAYILAN_SES_AYAR;
  }
}

export function sesAyarYaz(ayar: SesAyar): void {
  try {
    localStorage.setItem(AYAR_KEY, JSON.stringify(ayar));
  } catch (hata) {
    console.warn("[sesDuzenleme] ayar yazılamadı", hata);
  }
}

/** Sinyalin üstünde ses kalan son örnek (kanalların en uzunu). */
function sessizlikSonu(buffer: AudioBuffer, basla: number): number {
  let son = basla;
  for (let kanal = 0; kanal < buffer.numberOfChannels; kanal += 1) {
    const veri = buffer.getChannelData(kanal);
    for (let i = veri.length - 1; i >= basla; i -= 1) {
      if (Math.abs(veri[i]) > SESSIZLIK_ESIK) {
        if (i + 1 > son) son = i + 1;
        break;
      }
    }
  }
  return son;
}

/**
 * Başlangıç kırpma + sessizlik temizleme uygulanmış buffer.
 * Kırpılacak yer yoksa AYNI buffer döner (gereksiz kopya yok).
 */
export function sesBufferiniDuzenle(buffer: AudioBuffer, ayar: SesAyar): AudioBuffer {
  const oran = buffer.sampleRate;
  const basla = Math.min(Math.round(Math.max(0, ayar.baslangic) * oran), Math.max(0, buffer.length - 1));
  const son = ayar.sessizlik ? Math.max(basla, sessizlikSonu(buffer, basla)) : buffer.length;
  // 200 ms'den kısa kalacaksa kırpma yapılmaz — ses kaybolmasın.
  if (son - basla < oran * 0.2) return buffer;
  if (basla === 0 && son === buffer.length) return buffer;

  const yeni = new AudioBuffer({ length: son - basla, numberOfChannels: buffer.numberOfChannels, sampleRate: oran });
  for (let kanal = 0; kanal < buffer.numberOfChannels; kanal += 1) {
    const kaynak = buffer.getChannelData(kanal);
    const hedef = new Float32Array(son - basla);
    hedef.set(kaynak.subarray(basla, son));
    yeni.copyToChannel(hedef, kanal);
  }
  return yeni;
}

/** Gain zarfı: tepe seviye + fade-in/fade-out rampaları. */
export function fadeEgrisi(gain: GainNode, start: number, sure: number, ayar: SesAyar): void {
  const seviye = sinirla(ayar.seviye, 0.1, 1);
  const giris = Math.min(Math.max(0, ayar.fadeIn), sure * 0.4);
  const cikis = Math.min(Math.max(0, ayar.fadeOut), sure * 0.4);
  gain.gain.setValueAtTime(giris > 0.001 ? 0 : seviye, start);
  if (giris > 0.001) gain.gain.linearRampToValueAtTime(seviye, start + giris);
  gain.gain.setValueAtTime(seviye, Math.max(start + giris, start + sure - cikis));
  if (cikis > 0.001) gain.gain.linearRampToValueAtTime(0.001, start + sure);
}

/** Önizleme: ayarları uygulanmış buffer'ı offline olarak üretir. */
export async function onizlemeRenderEt(buffer: AudioBuffer, ayar: SesAyar): Promise<AudioBuffer> {
  const duzenli = sesBufferiniDuzenle(buffer, ayar);
  const ctx = new OfflineAudioContext(2, Math.ceil((duzenli.duration + 0.15) * 48000), 48000);
  const kaynak = ctx.createBufferSource();
  kaynak.buffer = duzenli;
  const gain = ctx.createGain();
  fadeEgrisi(gain, 0, duzenli.duration, ayar);
  kaynak.connect(gain).connect(ctx.destination);
  kaynak.start(0);
  return ctx.startRendering();
}
