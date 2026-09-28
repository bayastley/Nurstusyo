#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// KEŞFET HOCA SES TESTİ — her kâri için everyayah mp3 kontrolü
//
// NE YAPAR: Keşfet → "Hoca Karşılaştır" sekmesindeki TÜM kâriler
// için ayet mp3'ünün everyayah.com'da gerçekten 200/206 döndüğünü
// otomatik doğrular (Varsayılan: Zümer 39:53 → 039053.mp3).
//
// LİSTE KAYNAĞI: src/components/KesfetModal.tsx → KARILER dizisi
//   Script listede regex'le okur — sitede hoca eklenir/çıkarılırsa
//   test otomatik güncel kalır, senkron bozulmaz. Parse başarısızsa
//   gömülü yedek liste kullanılır (uyarı basılır).
//
// KULLANIM:
//   npm run test:ses                                  → Zümer 53
//   npm run test:ses -- --sure=1 --ayet=1             → başka ayet
// ÇIKIŞ: kâri tablosu + özet; biri bile 200/206 değilse exit 1.
//
// TEKNİK: Range GET (bytes=0-0) — ilk byte'ta bağlantı bırakılır,
// mp3'ün tamamı inmez → test ~saniyeler sürer. 1 ağ teklemesinde
// yeniden dener (retry), 8 istek eşzamanlı, 15sn timeout.
// ═══════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYNAK = path.join(KOK, "src", "components", "KesfetModal.tsx");

// Parametreler: --sure=39 --ayet=53 (varsayılan Zümer 53)
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([a-z]+)=(.+)$/i);
    return m ? [m[1], m[2]] : [a, true];
  })
);
const SURE = Math.max(1, Math.min(114, parseInt(args.sure ?? "39", 10) || 39));
const AYET = Math.max(1, parseInt(args.ayet ?? "53", 10) || 53);
const ESZAMANLI = 8;
const TIMEOUT_MS = 15000;

// Parse başarısızsa kullanılan yedek liste (28.09 KARILER anlık görüntüsü)
const YEDEK_KARILER = [
  { id: "Abdul_Basit_Murattal_192kbps", ad: "Abdulbasit (Murattal)" },
  { id: "Abdul_Basit_Mujawwad_128kbps", ad: "Abdulbasit (Mücavved)" },
  { id: "Husary_128kbps", ad: "el-Husari (Murattal)" },
  { id: "Husary_Mujawwad_64kbps", ad: "el-Husari (Mücavved)" },
  { id: "Minshawy_Murattal_128kbps", ad: "el-Minşavi" },
  { id: "Minshawy_Mujawwad_192kbps", ad: "el-Minşavi (Mücavved)" },
  { id: "Alafasy_128kbps", ad: "Mişari Raşid el-Afasi" },
  { id: "MaherAlMuaiqly128kbps", ad: "Mahir el-Muaykli (Kabe İmamı)" },
  { id: "Saood_ash-Shuraym_128kbps", ad: "Sud eş-Şuraym (Kabe İmamı)" },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps", ad: "Ebu Bekir eş-Şatri" },
  { id: "Hani_Rifai_192kbps", ad: "Hani er-Rifai" },
  { id: "Ghamadi_40kbps", ad: "Saad el-Gamidi" },
  { id: "Hudhaify_128kbps", ad: "Ali el-Hudaifi (Medine)" },
  { id: "Muhammad_Ayyoub_128kbps", ad: "Muhammed Eyyub (Medine)" },
  { id: "Yasser_Ad-Dussary_128kbps", ad: "Yaser ed-Dossari" },
  { id: "Salah_Al_Budair_128kbps", ad: "Salah el-Budeyr" },
  { id: "Sahl_Yassin_128kbps", ad: "Sehl Yasin (Medine)" },
  { id: "Nasser_Alqatami_128kbps", ad: "Nasser el-Katami" },
  { id: "Abdullah_Matroud_128kbps", ad: "Abdullah el-Metroud" },
  { id: "Mahmoud_Ali_Al_Banna_32kbps", ad: "Mahmud Ali el-Benna" },
  { id: "Muhammad_Jibreel_64kbps", ad: "Muhammed Cibril" },
  { id: "Fares_Abbad_64kbps", ad: "Fares Abbad" },
  { id: "Ali_Jaber_64kbps", ad: "Ali Cabir (Mescid-i Haram)" },
  { id: "Ayman_Sowaid_64kbps", ad: "Eyman es-Suvayd" },
  { id: "Akram_AlAlaqimy_128kbps", ad: "Ekrem el-Alakmi" },
  { id: "Ibrahim_Akhdar_32kbps", ad: "İbrahim El-Ehdar" },
  { id: "Muhsin_Al_Qasim_192kbps", ad: "Muhsin el-Kasım (Medine)" },
  { id: "Menshawi_16kbps", ad: "el-Minşavi (Eski Kayıt)" },
];

function karileriOku() {
  try {
    const kod = fs.readFileSync(KAYNAK, "utf8");
    const blok = kod.match(/const KARILER\s*=\s*\[([\s\S]*?)\];/);
    if (!blok) return null;
    const satirlar = [...blok[1].matchAll(/\{\s*id:\s*"([^"]+)",\s*ad:\s*"([^"]+)"\s*\}/g)];
    if (satirlar.length < 5) return null;
    return satirlar.map((m) => ({ id: m[1], ad: m[2] }));
  } catch {
    return null;
  }
}

async function kontrol(kari, url) {
  const t0 = Date.now();
  for (let deneme = 0; deneme < 2; deneme++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0", "User-Agent": "NurstudyoSesTesti/1.0 (+kelime-ses-saglik)" },
        signal: ctl.signal,
      });
      // İlk byte'ta bağlantıyı bırak — tam mp3 indirmeyelim
      const reader = res.body?.getReader();
      if (reader) {
        try { await reader.read(); } catch { /* yoksay */ }
        try { reader.cancel(); } catch { /* yoksay */ }
      }
      clearTimeout(timer);
      const ms = Date.now() - t0;
      const ok = res.status === 200 || res.status === 206;
      const tip = res.headers.get("content-type") || "";
      const boyut = res.headers.get("content-range") || res.headers.get("content-length") || "?";
      return { kari, ok, status: res.status, ms, tip, boyut, hata: "" };
    } catch (e) {
      clearTimeout(timer);
      if (deneme === 1) {
        return { kari, ok: false, status: 0, ms: Date.now() - t0, tip: "", boyut: "", hata: String(e?.cause?.code || e?.message || e) };
      }
      await new Promise((r) => setTimeout(r, 800)); // tek seferlik yeniden deneme
    }
  }
}

const kariler = karileriOku();
let kaynaktan = true;
if (!kariler) {
  kaynaktan = false;
  console.log("⚠️  KesfetModal.tsx'ten KARILER okunamadı — gömülü yedek liste kullanılıyor.");
}
const liste = kariler ?? YEDEK_KARILER;

const pad = (n, w = 3) => String(n).padStart(w, "0");
const url = (id) => `https://everyayah.com/data/${id}/${pad(SURE)}${pad(AYET)}.mp3`;

console.log(`\n🎧 KEŞFET HOCA SES TESTİ — ${kaynaktan ? "liste kaynaktan okundu (KesfetModal KARILER)" : "yedek liste"}`);
console.log(`   ${liste.length} kâri · Sure ${SURE}:${AYET} → ${pad(SURE)}${pad(AYET)}.mp3 · ${ESZAMANLI} eşzamanlı\n`);
console.log("─".repeat(100));

const sonuc = new Array(liste.length);
let isaretci = 0;
await Promise.all(
  Array.from({ length: ESZAMANLI }, async () => {
    while (isaretci < liste.length) {
      const i = isaretci++;
      const k = liste[i];
      sonuc[i] = await kontrol(k, url(k.id));
    }
  })
);

for (const s of sonuc) {
  const ad = (s.kari.ad + " ").padEnd(34, "·");
  if (s.ok) {
    console.log(`✓ ${ad} HTTP ${s.status}  ${s.tip.padEnd(12)} ${s.boyut.padEnd(22)} ${s.ms}ms`);
  } else {
    console.log(`✗ ${ad} HTTP ${s.status}${s.hata ? " (" + s.hata + ")" : ""}  ← SORUN!`);
  }
}
console.log("─".repeat(100));

const basarili = sonuc.filter((s) => s.ok);
const hatali = sonuc.filter((s) => !s.ok);
console.log(`\nÖZET: ${basarili.length}/${liste.length} kâri Zümer ${SURE}:${AYET} mp3'ü sağlıklı (${hatali.length} hata)`);
if (hatali.length) {
  console.log("\n❌ SES TESTİ BAŞARISIZ — şu kârilerde dosya yok/erişilemiyor:");
  for (const s of hatali) console.log(`   · ${s.kari.ad} (${s.kari.id}) → ${url(s.kari.id)}`);
  process.exit(1);
}
console.log("✅ SES TESTİ GEÇTİ\n");
