// MONTAJ v4 — overlay kayıtta CSS ile gizlendi → drawbox perdesi YOK, gerçek site ilerlemesi görünür.
// Yazılar: otomatik font-fit + 2 satır bölme + üst üste binme yasağı + render penceresine girmeme.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const FF = path.join(process.env.LOCALAPPDATA, "ms-playwright", "ffmpeg-1011", "ffmpeg-win64.exe");
const KAYIT = path.join(process.cwd(), "scripts", "demo-kayit");
const MASA = path.join(os.homedir(), "Desktop");

const VIDEOLAR = ["1-kevser", "2-asr", "3-nas", "4-ihlas"];
const FONT = "C\\:/Windows/Fonts/arialbd.ttf";

function escapeText(t) {
  return t.replace(/✔|✅|☑/g, "").replace(/\s+$/, "").replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\u2019").replace(/%/g, "\\%");
}
function fitSize(text, maxWidth = 990, base = 44) {
  const enUzun = Math.max(...text.split("\n").map((l) => l.length), 1);
  return Math.max(26, Math.min(base, Math.floor(maxWidth / (0.66 * enUzun))));
}
function ikiyeBol(t) {
  if (t.length <= 32) return t;
  const orta = Math.floor(t.length / 2);
  let i = t.lastIndexOf(" ", orta);
  if (i < 10) i = t.indexOf(" ", orta);
  if (i < 0) return t;
  return t.slice(0, i).trim() + "\n" + t.slice(i).trim();
}
const stil = (boyut, y) => `fontfile='${FONT}':fontsize=${boyut}:fontcolor=white:borderw=4:bordercolor=black:box=1:boxcolor=black@0.65:boxborderw=14:x=(w-text_w)/2:y=${y}`;

function yazilar(caps, sure, uretAni, videoAni) {
  const f = [];
  for (let i = 0; i < caps.length; i++) {
    const metin0 = caps[i].text;
    if (/URET/i.test(metin0) || /ISTE VIDEO/i.test(metin0) || /nurstudyo\.com/i.test(metin0)) continue;
    if (caps[i].t > uretAni + 0.5 && caps[i].t < videoAni + 4.5) continue; // render penceresi: kendi yazılarımız var
    const basla = Math.max(0, caps[i].t - 0.3);
    const sonrakiT = i + 1 < caps.length ? caps[i + 1].t : sure;
    let son = Math.min(sonrakiT - 0.6, caps[i].t + 7, sure); // sonraki yazıdan ÖNCE biter — üst üste binme yok
    if (i === 0 && caps.length > 1) son = Math.min(sonrakiT - 0.6, sure); // açılış yazısı site açılana kadar dursun (siyah intro)
    if (caps[i].t < uretAni) son = Math.min(son, uretAni + 0.5); // render penceresine taşma yok
    if (son - basla < 0.8) continue;
    const metin = ikiyeBol(metin0);
    const satirlar = metin.split("\n");
    const boyut = fitSize(metin);
    satirlar.forEach((satir, k) => {
      const y = satirlar.length === 1 ? "h-170" : `h-210+${k * 58}`;
      f.push(`drawtext=${stil(boyut, y)}:text='${escapeText(satir)}':enable='between(t,${basla.toFixed(2)},${son.toFixed(2)})'`);
    });
  }
  return f;
}

for (const v of VIDEOLAR) {
  const webm = path.join(KAYIT, `${v}.webm`);
  const zamanJson = path.join(KAYIT, `zaman-${v}.json`);
  if (!fs.existsSync(webm)) { console.log(`⚠️ ${v}.webm yok`); continue; }
  let sure = 0;
  try {
    const d = execSync(`"${FF.replace(/\\/g, "/")}" -i "${webm.replace(/\\/g, "/")}" 2>&1 | grep Duration`, { encoding: "utf8", shell: "bash", timeout: 60000 });
    sure = d.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)?.slice(1).reduce((a, x) => a * 60 + parseFloat(x), 0) ?? 0;
  } catch {}
  if (!sure) sure = 95;
  console.log(`${v}: ~${sure.toFixed(1)} sn`);

  let caps = [];
  try { caps = JSON.parse(fs.readFileSync(zamanJson, "utf8")); } catch {}
  const uretAni = caps.find((c) => /URET/i.test(c.text))?.t ?? 36;
  const videoAni = Math.min(caps.find((c) => /ISTE VIDEO/i.test(c.text))?.t ?? uretAni + 30, sure - 6);
  const sonCTA = caps.find((c) => /nurstudyo\.com/i.test(c.text))?.t ?? sure - 8;

  const f = [];
  f.push("scale=1080:1920:force_original_aspect_ratio=increase", "crop=1080:1920");
  // render penceresi: site gerçekte çalışıyor (overlay kayıtta gizli) → sadece ilerleme yazıları
  const r1 = Math.min(uretAni + 0.8, videoAni).toFixed(2), r2 = videoAni.toFixed(2);
  if (videoAni > uretAni + 1) {
    f.push(`drawtext=${stil(46, "h-180")}:text='${escapeText("Video isleniyor...")}':enable='between(t,${r1},${r2})'`);
    f.push(`drawtext=${stil(34, "h-118")}:text='${escapeText("ses + ayet + Kâbe klipi birlesiyor")}':enable='between(t,${Math.min(uretAni + 2.5, videoAni).toFixed(2)},${r2})'`);
  }
  // adım yazıları (sığan font, bölünmüş satır, çakışmasız)
  f.push(...yazilar(caps, sure, uretAni, videoAni));
  // siyah açılış intro'u: site açılana kadar marka (ilk damga 0'da, panel ~10-17 sn'de açılıyor)
  const acilis = Math.min(caps[1]?.t ?? 14, 16) - 0.6;
  if (acilis > 2) {
    f.push(`drawtext=${stil(64, "(h-text_h)/2-70")}:text='${escapeText("NUR STÜDYO")}':fontcolor=#FFD700:enable='between(t,0.3,${acilis.toFixed(2)})'`);
    f.push(`drawtext=${stil(34, "(h-text_h)/2+10")}:text='${escapeText("Islami video uretici — aciliyor...")}':enable='between(t,0.8,${acilis.toFixed(2)})'`);
  }
  // özel anlar
  f.push(`drawtext=${stil(52, "(h-text_h)/2")}:text='${escapeText("URET'e basiyoruz!")}' :enable='between(t,${uretAni.toFixed(2)},${(uretAni + 1.4).toFixed(2)})'`);
  f.push(`drawtext=${stil(52, "(h-text_h)/2")}:text='${escapeText("ISTE VIDEO - hazir!")}' :enable='between(t,${videoAni.toFixed(2)},${(videoAni + 3.2).toFixed(2)})'`);
  // final CTA
  f.push(`drawtext=${stil(48, "h-300")}:text='${escapeText("Siz de icerik ureticisi olun")}':enable='between(t,${sonCTA.toFixed(2)},${sure.toFixed(2)})'`);
  f.push(`drawtext=${stil(56, "h-220")}:text='${escapeText("nurstudyo.com")}':fontcolor=#FFD700:enable='between(t,${(sonCTA + 1).toFixed(2)},${sure.toFixed(2)})'`);

  const vf = f.join(",");
  const cikti = path.join(MASA, `demo-${v}.mp4`);
  try {
    execSync(`"${FF}" -y -i "${webm}" -vf "${vf}" -c:v h264_nvenc -preset p5 -cq 23 -c:a aac -b:a 160k -movflags +faststart "${cikti}"`, { timeout: 900000, stdio: ["ignore", "ignore", "pipe"], shell: "bash" });
    console.log(`  ✅ demo-${v}.mp4 (${(fs.statSync(cikti).size / 1048576).toFixed(1)} MB)`);
  } catch {
    try {
      execSync(`"${FF}" -y -i "${webm}" -vf "${vf}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 160k -movflags +faststart "${cikti}"`, { timeout: 1200000, stdio: ["ignore", "ignore", "ignore"], shell: "bash" });
      console.log(`  ✅ demo-${v}.mp4 libx264 (${(fs.statSync(cikti).size / 1048576).toFixed(1)} MB)`);
    } catch (e) { console.log(`  ❌ ${v}: ${String(e.message).slice(0, 100)}`); }
  }
}
console.log("\nMONTAJ v4 BİTTİ");
