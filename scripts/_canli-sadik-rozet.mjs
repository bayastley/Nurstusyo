// ════════════════════════════════════════════════════════════════
// CANLI SADIK ROZET KONTROLÜ (geçici, commit'lenmez)
// Yayındaki JS bundle'larında "(★sadık)" etiketini arar.
// esbuild Unicode'u ASCII kaçışa çevirdiği için \uXXXX/\xXX çözülür.
// Kullanım: node scripts/_canli-sadik-rozet.mjs [site]
// ════════════════════════════════════════════════════════════════
const SITE = (process.argv[2] || "https://www.nurstudyo.com").replace(/\/+$/, "");

function kacisCoz(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
          .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

async function metinAl(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return await r.text();
}

const html = await metinAl(SITE + "/");
const scriptler = [...html.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((m) => new URL(m[1], SITE).href);
console.log(`Ana sayfa: ${html.length} bayt, ${scriptler.length} dış script bulundu (yoksa tüm JS index.html'e gömülü)`);

const hedefler = ["(\u2605sad\u0131k)", "\u2605 SADIK \u00dcYE", "sadikUyeEtiketTitle"];
let bulundu = {};
// 1) Dış scriptler
for (const js of scriptler) {
  try {
    const ham = await metinAl(js);
    const cozulmus = kacisCoz(ham);
    for (const h of hedefler) {
      if (cozulmus.includes(h)) bulundu[h] = (bulundu[h] || 0) + 1;
    }
  } catch (e) {
    console.log(`  ⚠ script okunamadı: ${String(e.message || e).slice(0, 80)}`);
  }
}
// 2) Ana HTML (Vite gömülü bundle) — hem ham hem kaçış-çözülmüş
const htmlCozulmus = kacisCoz(html);
for (const h of hedefler) {
  if (htmlCozulmus.includes(h) || html.includes(h)) bulundu[h] = (bulundu[h] || 0) + 1;
}

console.log("\n── CANLI BUNDLE ARAMA ──");
let tamam = true;
for (const h of hedefler) {
  const adet = bulundu[h] || 0;
  console.log(`  ${adet > 0 ? "✓" : "✗"} "${h}" → ${adet} bundle'da`);
  if (h === "(\u2605sad\u0131k)" && adet === 0) tamam = false;
}
console.log(`\n▶ SONUÇ: ${tamam ? "GO ✅ — (★sadık) rozeti yayında" : "NO-GO ❌ — rozet bundle'da yok (önbellek olabilir, 1-2 dk sonra tekrar dene)"}`);
process.exit(tamam ? 0 : 1);
