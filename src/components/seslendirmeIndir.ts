// ═══════════════════════════════════════════════════════════════
// SESLİ MEAL İNDİRME V2 (21.10 — kullanıcı: "AV ses dosyası, VLC'de
// görüntü yok; düzgün yap şunu ayete de metine de"): İNDİR artık WAV
// değil TAM VİDEO çıkarır — seçili atmosfer (CDN videosu/posteri)
// arka planda oynar, ses üstüne bindirilir. Stüdyo üreticisinin
// (useVideoGenerator) kanıtlanmış hattı: canvas.captureStream +
// MediaStreamDestination + MediaRecorder. Sunucuda ffmpeg yok → saf
// tarayıcı kaydı; kayıt ses süresi kadar sürer (gerçek zamanlı),
// durum satırı ilerleme gösterir.
// ═══════════════════════════════════════════════════════════════

/** Bölümler arası sesli nefes payı (sn) — motor çalarken de nefes bırakır. */
const NEFES_SN = 0.35;

/** Çıktı: 9:16 · 720p · 30fps — mobilde de akıcı kayıt; VLC/galeri dostu. */
const G = { W: 720, H: 1280, FPS: 30 };

export type IndirYaz = (mesaj: string, tip?: "hata") => void;
export type BgKaynak = { url?: string; poster?: string; ad?: string } | null;

/**
 * CANLIDA okut yanıtı "data:audio/mpeg;base64,…" döner — CSP connect-src'te
 * 'data:' yok, fetch(data:) engellenir. data-URL'i fetch etmeden atob ile çözeriz.
 */
async function sesBaytları(url: string): Promise<ArrayBuffer> {
  if (!url.startsWith("data:")) return (await fetch(url)).arrayBuffer();
  const virgül = url.indexOf(",");
  const bin = atob(url.slice(virgül + 1));
  const dizi = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) dizi[i] = bin.charCodeAt(i);
  return dizi.buffer;
}

/** Stüdyo pickMime benzeri — MP4 öncelikli (VLC + galeri uyumu), WebM yedek. */
function pickMime(): string | undefined {
  const adaylar = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4;codecs="avc1.64001E,mp4a.40.2"',
    "video/mp4",
    'video/webm;codecs="vp9,opus"',
    'video/webm;codecs="vp8,opus"',
    "video/webm",
  ];
  for (const m of adaylar) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* sıradaki */ }
  }
  return undefined;
}

/** metni genişliğe göre satırlara böler (canvas ölçümü ile — arapça/meal için) */
function satirBol(g: CanvasRenderingContext2D, metin: string, maxGen: number): string[] {
  const kelimeler = metin.split(/\s+/).filter(Boolean);
  const satirlar: string[] = [];
  let satir = "";
  for (const kelime of kelimeler) {
    const aday = satir ? `${satir} ${kelime}` : kelime;
    if (!satir || g.measureText(aday).width <= maxGen) satir = aday;
    else { satirlar.push(satir); satir = kelime; }
  }
  if (satir) satirlar.push(satir);
  return satirlar;
}

/** medyayı cover (taşan, ortalı) çizer — dikey 9:16 panele uygun */
function coverCiz(ctx: CanvasRenderingContext2D, el: CanvasImageSource, vw: number, vh: number): void {
  if (!vw || !vh) return;
  const s = Math.max(G.W / vw, G.H / vh);
  const w = vw * s, h = vh * s;
  ctx.drawImage(el, (G.W - w) / 2, (G.H - h) / 2, w, h);
}

export async function kuyrukIndir(
  // ★ 23.10 AYET+MEAL (kullanıcı emri): `ar` verildiğinde indirilen videoya
  //  arapça ayet SABİT yazılır, `meal` (yoksa metin) okuma başladığında
  //  ~300ms fade-in ile ekrana gelir — ayet-bazlı senkron.
  liste: readonly { metin: string; kat?: string; etiket?: string; ar?: string; meal?: string }[],
  urlAl: (m: string) => Promise<string>,
  yaz: IndirYaz,
  bg: BgKaynak = null, // seçili atmosfer: videosu/posteri varsa arka planda oynar
): Promise<void> {
  if (typeof MediaRecorder === "undefined") { yaz("Bu tarayıcı video kaydını desteklemiyor — Chrome / Edge / güncel Safari dene", "hata"); return; }
  if (!liste.length) { yaz("İndirilecek bölüm yok — önce ayet seç ya da metin yaz", "hata"); return; }
  const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!AC) { yaz("Bu tarayıcı ses kaydını desteklemiyor", "hata"); return; }

  const ctx = new AC();
  try {
    if (ctx.state === "suspended") await ctx.resume().catch(() => undefined);

    // 1) SES: tüm parçaların baytlarını al + çöz
    const parcalar: AudioBuffer[] = [];
    for (let i = 0; i < liste.length; i++) {
      yaz(`📥 İndirme — bölüm ${i + 1}/${liste.length} sunucudan alınıyor…`);
      const url = await urlAl(liste[i].metin);
      parcalar.push(await ctx.decodeAudioData(await sesBaytları(url)));
    }
    const toplamSn = parcalar.reduce((a, p) => a + p.duration, 0) + NEFES_SN * (parcalar.length - 1);

    // 2) GRAFİK: atmosfer kaynağı — video > poster > düz gradyan
    const c = document.createElement("canvas");
    c.width = G.W; c.height = G.H;
    const g = c.getContext("2d")!;
    let videoEl: HTMLVideoElement | null = null;
    if (bg?.url) {
      const v = document.createElement("video");
      v.src = bg.url; v.crossOrigin = "anonymous"; v.muted = true; v.loop = true; v.playsInline = true;
      try {
        await new Promise<void>((res, rej) => {
          v.oncanplay = () => res();
          v.onerror = () => rej(new Error("atmosfer videosu yüklenemedi"));
          window.setTimeout(() => rej(new Error("atmosfer videosu zaman aşımı")), 8000);
        });
        await v.play().catch(() => undefined);
        videoEl = v;
      } catch { videoEl = null; }
    }
    let posterEl: HTMLImageElement | null = null;
    if (!videoEl && bg?.poster) {
      const im = new Image();
      im.src = bg.poster; im.crossOrigin = "anonymous";
      try {
        await new Promise<void>((res, rej) => {
          im.onload = () => res(); im.onerror = () => rej(new Error("atmosfer posteri yüklenemedi"));
          window.setTimeout(() => rej(new Error("atmosfer posteri zaman aşımı")), 8000);
        });
        posterEl = im;
      } catch { posterEl = null; }
    }

    // 3) SES+GÖRÜNTÜ KAYIT HATTI — stüdyo ile aynı yol
    const canvasStream = c.captureStream(G.FPS);
    const hedef = ctx.createMediaStreamDestination();
    const kaynaklar = parcalar.map((b) => { const s = ctx.createBufferSource(); s.buffer = b; return s; });
    const başAn = ctx.currentTime + 0.3;
    let ofset = 0;
    kaynaklar.forEach((s) => { s.connect(hedef); s.start(başAn + ofset); ofset += (s.buffer?.duration || 0) + NEFES_SN; });
    const kombine = new MediaStream([...canvasStream.getVideoTracks(), ...hedef.stream.getAudioTracks()]);
    const mime = pickMime();
    const rec = mime
      ? new MediaRecorder(kombine, { mimeType: mime, videoBitsPerSecond: 5_500_000, audioBitsPerSecond: 128_000 })
      : new MediaRecorder(kombine);
    const kayitlar: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) kayitlar.push(e.data); };
    const durduMu = new Promise<void>((r) => { rec.onstop = () => r(); });

    // 4) ÇİZİM DÖNGÜSÜ — kayıt süresi boyunca her frame
    const başZam = başAn; // ses zaman çizgisiyle aynı saat
    const etikets = liste.map((o) => o.etiket || "");
    // ★ 23.10 AYET+MEAL: segment başlangıçları (sn) — sesin ofset döngüsüyle AYNI hesap;
    //   arapça = o.meal yoksa o.metin ("3:12" gibi anahtar metin overlay'e alınmaz)
    const baslar: number[] = [];
    let birikim = 0;
    for (const b of parcalar) { baslar.push(birikim); birikim += (b.duration || 0) + NEFES_SN; }
    const arMetinler = liste.map((o) => (o.ar || "").trim());
    const mealMetinler = liste.map((o) => ((o.meal || o.metin) || "").trim());
    const anahtarGibi = (m: string) => /^\d+:\d+$/.test(m);
    let sonPct = -1;
    let döngüId: number | null = null;
    const ciz = () => {
      const t = Math.max(0, ctx.currentTime - başZam);
      g.fillStyle = "#0b0c11";
      g.fillRect(0, 0, G.W, G.H);
      if (videoEl && videoEl.readyState >= 2 && videoEl.videoWidth) coverCiz(g, videoEl, videoEl.videoWidth, videoEl.videoHeight);
      else if (posterEl && posterEl.naturalWidth) coverCiz(g, posterEl, posterEl.naturalWidth, posterEl.naturalHeight);
      g.fillStyle = "rgba(0,0,0,.25)"; // metin okunurluğu için hafif koyuluk
      g.fillRect(0, 0, G.W, G.H);
      // şuan okunan parçanın etiketi (ayet: "Fâtiha 1:1" · metin: yok)
      let idx = -1, toplamP = 0;
      for (let i = 0; i < parcalar.length; i++) {
        if (t >= toplamP && t < toplamP + parcalar[i].duration + NEFES_SN) break;
        toplamP += parcalar[i].duration + NEFES_SN;
        if (i < parcalar.length - 1) idx = i + 1;
      }
      const okunan = t < toplamSn ? Math.min(parcalar.length - 1, Math.max(0, idx)) : -1;
      if (okunan >= 0 && etikets[okunan]) {
        g.font = "700 34px Inter, system-ui, sans-serif";
        g.textAlign = "center";
        g.shadowColor = "rgba(0,0,0,.8)"; g.shadowBlur = 12;
        g.fillStyle = "#f5dda6";
        g.fillText(etikets[okunan], G.W / 2, 96);
        g.shadowBlur = 0;
      }
      // ★ 23.10 AYET+MEAL — AudioContext saatiyle milisaniye senkronu:
      //   arapça ayet okunduğu sürece SABİT (üst bölge, RTL), meal ayetin sesi
      //   başladığı andan ~300ms'de fade-in olup alt bölgede kaç satırsa okunur.
      if (okunan >= 0) {
        const baslangic = baslar[okunan] ?? 0;
        const arMetin = arMetinler[okunan];
        if (arMetin) {
          g.direction = "rtl";
          g.font = '600 42px "Amiri", "Scheherazade New", "Noto Naskh Arabic", "Times New Roman", serif';
          g.textAlign = "center";
          g.fillStyle = "rgba(245,221,166,.95)";
          g.shadowColor = "rgba(0,0,0,.85)"; g.shadowBlur = 10;
          const arSatirlar = satirBol(g, arMetin, G.W - 100).slice(0, 4);
          arSatirlar.forEach((s, k) => g.fillText(s, G.W / 2, 196 + k * 58));
          g.shadowBlur = 0;
          g.direction = "ltr";
        }
        const mealMetin = mealMetinler[okunan];
        if (mealMetin && !anahtarGibi(mealMetin)) {
          const alfa = Math.min(1, Math.max(0, (t - baslangic) / 0.3));
          if (alfa > 0) {
            g.font = "500 25px Inter, system-ui, sans-serif";
            g.textAlign = "center";
            g.fillStyle = `rgba(255,255,255,${(0.93 * alfa).toFixed(3)})`;
            g.shadowColor = "rgba(0,0,0,.85)"; g.shadowBlur = 10;
            const satirlar = satirBol(g, mealMetin, G.W - 110).slice(0, 6);
            const yBas = G.H - 64 - (satirlar.length - 1) * 36;
            satirlar.forEach((s, k) => g.fillText(s, G.W / 2, yBas + k * 36));
            g.shadowBlur = 0;
          }
        }
      }
      const pct = Math.min(99, Math.round((t / toplamSn) * 100));
      if (pct !== sonPct) { sonPct = pct; yaz(`📥 Video kaydı — %${pct} (${Math.round(Math.min(t, toplamSn))} sn / ${Math.round(toplamSn)} sn)`); }
      döngüId = requestAnimationFrame(ciz);
    };
    ciz();

    // ★ Zamanlama AudioContext saati ile belirlendi — kayıt hemen başlar.
    rec.start(1000);
    await new Promise<void>((r) => setTimeout(r, (toplamSn + 1.2) * 1000));
    if (döngüId !== null) cancelAnimationFrame(döngüId);
    try { if (rec.state !== "inactive") rec.stop(); } catch { /* güvence */ }
    await durduMu;
    canvasStream.getTracks().forEach((t) => t.stop());
    hedef.stream.getTracks().forEach((t) => t.stop());
    videoEl?.pause();

    const blob = new Blob(kayitlar, { type: mime ? mime.split(";")[0] : "video/webm" });
    const ad = new Date();
    const damga = `${ad.getFullYear()}${String(ad.getMonth() + 1).padStart(2, "0")}${String(ad.getDate()).padStart(2, "0")}-${String(ad.getHours()).padStart(2, "0")}${String(ad.getMinutes()).padStart(2, "0")}`;
    const uzantı = blob.type.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sesli-meal-${damga}.${uzantı}`;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    yaz(`✅ İndirildi — ${liste.length} bölüm · ${Math.round(toplamSn)} sn ${uzantı.toUpperCase()} video kaydedildi ✓`);
  } catch (e) {
    yaz(`⚠ İndirme hatası — lütfen tekrar dene: ${(e as Error)?.message || "bilinmeyen"}`);
  } finally {
    ctx.close().catch(() => undefined);
  }
}
