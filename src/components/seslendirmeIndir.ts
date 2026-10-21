// ═══════════════════════════════════════════════════════════════
// SESLİ MEAL İNDİRME (21.10 — kullanıcı: "seslendirmede metin yazıp
// ayarladık indirme butonu yok mu şaka mısın") — kuyruktaki TÜM
// bölümleri sırayla sunucudan alır, tarayıcıda birleştirir ve TEK
// dosya olarak kaydeder. Sunucuda ffmpeg yok → decodeAudioData +
// WAV (PCM 16-bit) yazımı ile saf tarayıcı çözümü: TTS üretim
// hattına hiç dokunmaz, çalma akışını etkilemez.
// ═══════════════════════════════════════════════════════════════
import type { KuyrukOgesi } from "./seslendirmeSabitler";

/** Bölümler arası sesli nefes payı (sn) — motor çalarken de nefes bırakır. */
const NEFES_SN = 0.35;

/**
 * CANLIDA okut yanıtı "data:audio/mpeg;base64,…" döner — CSP connect-src'te
 * 'data:' yok, fetch(data:) engellenir (Canlı deneme 21.10: "Failed to fetch").
 * Bu yüzden data-URL'i fetch ETMEDEN atob ile Uint8Array'e çözeriz;
 * http(s) URL'lerde normal fetch gider.
 */
async function sesBaytları(url: string): Promise<ArrayBuffer> {
  if (!url.startsWith("data:")) return (await fetch(url)).arrayBuffer();
  const virgül = url.indexOf(",");
  const b64 = url.slice(virgül + 1);
  const bin = atob(b64);
  const dizi = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) dizi[i] = bin.charCodeAt(i);
  return dizi.buffer;
}

/** AudioBuffer → mono/stereo korunarak WAV (16-bit PCM) Blob */
function wavYaz(buf: AudioBuffer): Blob {
  const kanal = buf.numberOfChannels, örnek = buf.sampleRate;
  const adet = buf.length, bayt = adet * kanal * 2;
  const hesap = new DataView(new ArrayBuffer(44 + bayt));
  const metin = (o: number, s: string) => { for (let i = 0; i < s.length; i++) hesap.setUint8(o + i, s.charCodeAt(i)); };
  metin(0, "RIFF"); hesap.setUint32(4, 36 + bayt, true); metin(8, "WAVE");
  metin(12, "fmt "); hesap.setUint32(16, 16, true); hesap.setUint16(20, 1, true);
  hesap.setUint16(22, kanal, true); hesap.setUint32(24, örnek, true);
  hesap.setUint32(28, örnek * kanal * 2, true); hesap.setUint16(32, kanal * 2, true);
  hesap.setUint16(34, 16, true); metin(36, "data"); hesap.setUint32(40, bayt, true);
  let os = 44;
  const yollar: Float32Array[] = [];
  for (let c = 0; c < kanal; c++) yollar.push(buf.getChannelData(c));
  for (let i = 0; i < adet; i++) {
    for (let c = 0; c < kanal; c++) {
      let v = yollar[c][i];
      v = v < -1 ? -1 : v > 1 ? 1 : v;
      hesap.setInt16(os, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      os += 2;
    }
  }
  return new Blob([hesap.buffer], { type: "audio/wav" });
}

export type IndirYaz = (mesaj: string) => void;

/**
 * Kuyruğun tamamını indirir. urlAl: bölüm metni → çalınabilir ses URL'i
 * (data: veya /api/nur-tts) — modal'daki urlAl ile aynı kaynak.
 */
export async function kuyrukIndir(
  kuyruk: KuyrukOgesi[],
  urlAl: (m: string) => Promise<string>,
  yaz: IndirYaz,
): Promise<void> {
  if (!kuyruk.length) { yaz("İndirilecek bölüm yok — önce metin yazıp bölümleri oluştur"); return; }
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!AC) { yaz("Bu tarayıcı ses kaydını desteklemiyor — DURDUR-un tam yanı gerekmez ama indirme şimdilik Chrome/Edge/Safari'de"); return; }
  const ctx = new AC();

  // ★ Yükleme ilerlemesi kaba ama dürüst: "parça 2/5 alınıyor…"
  const parcalar: AudioBuffer[] = [];
  try {
    for (let i = 0; i < kuyruk.length; i++) {
      yaz(`📥 İndirme — bölüm ${i + 1}/${kuyruk.length} sunucudan alınıyor…`);
      const url = await urlAl(kuyruk[i].metin);
      const ab = await sesBaytları(url);
      // data: URL grupları da decodeAudioData'dan geçebilir; hafıza dostu gemeinsame ctx
      const dec = await ctx.decodeAudioData(ab);
      parcalar.push(dec);
    }
    const örnekS = parcalar[0].sampleRate;
    const kanalN = Math.max(...parcalar.map((p) => p.numberOfChannels));
    const nefes = Math.round(NEFES_SN * örnekS);
    const toplam = parcalar.reduce((a, p) => a + p.length, 0) + nefes * (parcalar.length - 1);
    const birleşik = ctx.createBuffer(kanalN, toplam, örnekS);
    let ötak = 0;
    for (const p of parcalar) {
      for (let c = 0; c < kanalN; c++) {
        const kaynak = p.getChannelData(Math.min(c, p.numberOfChannels - 1));
        birleşik.getChannelData(c).set(kaynak, ötak);
      }
      ötak += p.length + nefes; // bölümler arası nefes sessizce kalır (0 = sıfır)
    }
    const wav = wavYaz(birleşik);
    const ad = new Date();
    const damga = `${ad.getFullYear()}${String(ad.getMonth() + 1).padStart(2, "0")}${String(ad.getDate()).padStart(2, "0")}-${String(ad.getHours()).padStart(2, "0")}${String(ad.getMinutes()).padStart(2, "0")}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(wav);
    a.download = `sesli-meal-${damga}.wav`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 20000);
    const sn = (toplam / örnekS).toFixed(0);
    yaz(`✅ İndirildi — ${kuyruk.length} bölüm birleşik, ${sn} sn WAV dosyası kaydedildi ✓`);
  } catch (e) {
    yaz(`⚠ İndirme hatası — lütfen tekrar dene: ${(e as Error)?.message || "bilinmeyen"}`);
  } finally {
    ctx.close().catch(() => { /* sessiz */ });
  }
}
