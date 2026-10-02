// ════════════════════════════════════════════════════════
// _urdu-imza-check.mjs — dist/canlı HTML'de Urduca imza doğrulama
// Kullanım: node scripts/_urdu-imza-check.mjs <dosya-veya-url>
// Minifier (esbuild) ASCII-dışı karakterleri \uXXXX (küçük harf hex)
// olarak escape'ler — imza bu biçime çevrilip aranır.
// ════════════════════════════════════════════════════════
const IMZALAR = [
  "رکنیت کے حقوق روزانہ", // rightsFooterNote (UR, yeni)
  "کوکی ترجیحات",        // cookieTitle (UR, yeni)
  "شرائط پڑھیں",          // readTermsBtn (UR, yeni)
  "آج کی آیت",           // dailyAyah (UR, eski — kontrol grubu)
];

// UTF-16 kod birimi bazında \uXXXX (küçük harf hex) kaçışı üret
function esc(str) {
  let out = "";
  for (let i = 0; i < str.length; i += 1) {
    const p = str.charCodeAt(i);
    if (p > 0x7f) out += `\\u${p.toString(16).padStart(4, "0")}`;
    else out += str[i];
  }
  return out;
}

async function load(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(`${src}${src.includes("?") ? "&" : "?"}nocache=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }
  return (await import("node:fs")).readFileSync(src, "utf8");
}

const src = process.argv[2] || "dist/index.html";
const html = await load(src);
let fail = 0;
for (const imza of IMZALAR) {
  const hit = html.includes(esc(imza));
  if (!hit) fail += 1;
  console.log(`${hit ? "✓" : "✗"} ${imza}`);
}
console.log(fail === 0 ? `▶ SONUÇ: PASS ✅ (${src})` : `▶ SONUÇ: FAIL ❌ — ${fail} imza yok (${src})`);
process.exit(fail === 0 ? 0 : 1);
