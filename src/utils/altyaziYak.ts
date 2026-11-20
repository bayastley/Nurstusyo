// ════════════════════════════════════════════════════════
// ALTYAZIYAK.TS — Altyazıyı videoya yakma (burn-in)
//
// SRT/VTT indirmenin yanında, altyazıyı videonun üzerine kalıcı olarak
// yazar. Sunucu/ffmpeg yok: <video> → canvas.drawImage → canvas.captureStream
// → MediaRecorder. Ses kanalı varsa videodan alınır.
//
// ★ Notlar:
//   • Kayıt gerçek zamanlıdır: video süresi kadar bekler (59 sn video = ~59 sn).
//   • Tarayıcı MediaRecorder desteklemiyorsa hata fırlatır; çağıran taraf
//     kullanıcıya "desteklenmiyor" mesajı gösterir.
//   • Video ile aynı kaynak (blob) kullanılmalı; aksi hâlde canvas kirlenebilir.
// ════════════════════════════════════════════════════════

export interface AltyaziSatiri {
  /** saniye */
  bas: number;
  /** saniye */
  bit: number;
  metin: string;
}

export interface AltyaziYakSecenek {
  /** çıktı genişliği (varsayılan 1280, kaynak daha küçükse kaynak genişliği) */
  genislik?: number;
  /** 0-1 arası ilerleme */
  ilerleme?: (oran: number) => void;
}

const MIME_ADAYLARI = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

function uygunMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of MIME_ADAYLARI) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* sıradaki */
    }
  }
  return "";
}

/** Metni satırlara böl (canvas genişliğine göre) */
function satirlaraBol(ctx: CanvasRenderingContext2D, metin: string, maxGenislik: number): string[] {
  const kelimeler = metin.split(/\s+/).filter(Boolean);
  const satirlar: string[] = [];
  let mevcut = "";
  for (const k of kelimeler) {
    const deneme = mevcut ? `${mevcut} ${k}` : k;
    if (ctx.measureText(deneme).width <= maxGenislik || !mevcut) mevcut = deneme;
    else {
      satirlar.push(mevcut);
      mevcut = k;
    }
  }
  if (mevcut) satirlar.push(mevcut);
  return satirlar;
}

function altyaziCiz(ctx: CanvasRenderingContext2D, metin: string, w: number, h: number) {
  const boyut = Math.max(14, Math.round(h * 0.045));
  ctx.save();
  ctx.font = `700 ${boyut}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const satirlar = satirlaraBol(ctx, metin, w * 0.86);
  const satirYuksekligi = Math.round(boyut * 1.32);
  const blok = satirlar.length * satirYuksekligi;
  const altBosluk = Math.round(h * 0.055);
  const ust = h - altBosluk - blok;
  // arka plan şeridi
  ctx.fillStyle = "rgba(0,0,0,0.58)";
  const kutuUst = ust - Math.round(boyut * 0.42);
  ctx.fillRect(0, kutuUst, w, blok + Math.round(boyut * 0.84));
  // metin
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 6;
  satirlar.forEach((s, i) => {
    ctx.fillText(s, w / 2, ust + satirYuksekligi * i + satirYuksekligi / 2);
  });
  ctx.restore();
}

/**
 * Videoyu canvas üzerinde oynatıp altyazıyı yakarak yeni bir kayıt üretir.
 * @returns blob + dosya uzantısı
 */
export async function altyaziYak(
  kaynakUrl: string,
  satirlar: AltyaziSatiri[],
  secenek: AltyaziYakSecenek = {},
): Promise<{ blob: Blob; uzanti: string }> {
  if (typeof MediaRecorder === "undefined") throw new Error("mediarecorder-yok");
  const mime = uygunMime();
  if (!mime) throw new Error("mime-yok");

  const video = document.createElement("video");
  video.src = kaynakUrl;
  video.playsInline = true;
  video.preload = "auto";
  video.volume = 1;

  await new Promise<void>((coz, red) => {
    video.onloadedmetadata = () => coz();
    video.onerror = () => red(new Error("video-yuklenemedi"));
  });

  const kaynakW = video.videoWidth || 1280;
  const kaynakH = video.videoHeight || 720;
  const w = Math.max(320, Math.min(secenek.genislik ?? 1280, kaynakW));
  const h = Math.round((w * kaynakH) / kaynakW);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-yok");

  const akis = canvas.captureStream(30);
  // Ses: tarayıcı destekliyorsa videonun ses kanalını kayda ekle
  type AkisliVideo = HTMLVideoElement & { captureStream?: () => MediaStream };
  try {
    const videoAkis = (video as AkisliVideo).captureStream?.();
    videoAkis?.getAudioTracks().forEach((t) => akis.addTrack(t));
  } catch {
    /* ses yok — sessiz video üretilir */
  }

  const parcalar: BlobPart[] = [];
  const kayit = new MediaRecorder(akis, {
    mimeType: mime,
    videoBitsPerSecond: 6_000_000,
    audioBitsPerSecond: 128_000,
  });
  kayit.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) parcalar.push(e.data);
  };
  const bitis = new Promise<Blob>((coz) => {
    kayit.onstop = () => coz(new Blob(parcalar, { type: mime.split(";")[0] }));
  });

  const ciz = () => {
    if (video.readyState >= 2) ctx.drawImage(video, 0, 0, w, h);
    const t = video.currentTime;
    const aktifSatir = satirlar.find((s) => t >= s.bas && t < s.bit);
    if (aktifSatir) altyaziCiz(ctx, aktifSatir.metin, w, h);
    if (video.duration > 0) secenek.ilerleme?.(Math.min(1, t / video.duration));
    if (!video.ended) requestAnimationFrame(ciz);
  };

  kayit.start(250);
  try {
    await video.play();
  } catch {
    kayit.stop();
    throw new Error("video-oynatilamadi");
  }
  requestAnimationFrame(ciz);

  await new Promise<void>((coz) => {
    video.onended = () => coz();
  });
  kayit.stop();
  const blob = await bitis;
  video.pause();
  video.removeAttribute("src");
  video.load();
  secenek.ilerleme?.(1);
  return { blob, uzanti: mime.includes("mp4") ? "mp4" : "webm" };
}
