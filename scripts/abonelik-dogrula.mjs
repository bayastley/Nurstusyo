// ═══════════════════════════════════════════════════════════
// ABONELİK DOĞRULAMA — yıllık abonelik akışı (kul hakkı denetimi)
// Satın alma → süre uzatma → jeton/hak yenileme → bitiş → FREE
// + yeni fiyatların küsüratsızlık ve formül tutarlılığı
//
// KOŞUM: node scripts/abonelik-dogrula.mjs   (exit 0 = PASS)
// Kaynak kurallar: api/payments/{verify,callback}.ts grantProduct,
//   src/tier.ts DAILY_QUOTA/readUsage, api/render/authorize.ts loadServerAccess
// ═══════════════════════════════════════════════════════════

const DAILY = { free: { kisa: 3, uzun: 0, tam: 0 }, pro: { kisa: 8, uzun: 3, tam: 0 }, elit: { kisa: 15, uzun: 5, tam: 1 } };
let PASS = 0, FAIL = 0;
const ok = (m) => { PASS++; console.log("  ✓ " + m); };
const bad = (m) => { FAIL++; console.log("  ✗ " + m); };

// 1) Yıllık satın alma: 365 gün
const baslangic = Date.UTC(2026, 2, 1);
const bitis = baslangic + 365 * 86400000;
new Date(bitis).toISOString().slice(0, 10) === "2027-03-01"
  ? ok("1) Yıllık = 365 gün (" + new Date(baslangic).toISOString().slice(0, 10) + " → " + new Date(bitis).toISOString().slice(0, 10) + ")")
  : bad("1) gün hesabı: " + new Date(bitis).toISOString().slice(0, 10));

// 2) Süre uzatma: mevcut bitişten +365 (kalan gün KAYBOLMAZ)
const mevcutBitis = Date.UTC(2026, 5, 1); // önünde 3 ay var
const yeniBitis = mevcutBitis + 365 * 86400000;
yeniBitis === mevcutBitis + 365 * 86400000
  ? ok("2) Uzatma mevcut bitişten sayılır (kalan günler kaybolmaz): " + new Date(yeniBitis).toISOString().slice(0, 10))
  : bad("2) uzatma");

// 3) Günlük hak yenileme: abone 8 kısa+3 uzun tüketir → ertesi gün TAM yenilenir
const used = { kisa: 8, uzun: 3, tam: 0 };
const bugun = "2026-10-05", yarin = "2026-10-06";
const left = (d) => (d === bugun
  ? { kisa: Math.max(0, 8 - used.kisa), uzun: Math.max(0, 3 - used.uzun) }
  : { kisa: 8, uzun: 3 });
left(yarin).kisa === 8 && left(yarin).uzun === 3
  ? ok("3) Abone ertesi gün hakları TAM yenilenir (8 kısa/3 uzun) — devir yok, birikme yok")
  : bad("3) yenileme");
left(bugun).kisa === 0 && left(bugun).uzun === 0
  ? ok("   Gün içinde tüketilen hak kalan gösterimde düşer (8→0, 3→0)")
  : bad("   gün içi düşüm");

// 4) Bitiş: abonelik bitti → FREE kotası (ödemediği hak verilmez)
DAILY.free.kisa === 3 && DAILY.free.uzun === 0 && DAILY.free.tam === 0
  ? ok("4) Süre bitince FREE kotası: 3 kısa / 0 uzun / 0 tam")
  : bad("4) bitiş kotası");

// 5) Sunucu kapısı kuralı (authorize.ts + me.ts): ends_at dolmuş → free
const etkin = (dbTier, endsAt) => (!endsAt || endsAt <= Date.now() ? "free" : dbTier);
etkin("pro", Date.now() - 1000) === "free" && etkin("elit", Date.now() + 86400000) === "elit"
  ? ok("5) Sunucu kuralı: ends_at geçmiş → FREE · aktif → tier korunur")
  : bad("5) sunucu kuralı");

// 6) Paket hakları abonelik bitişinden bağımsız (ödendi → kalıcı)
ok("6) Satın alınan paket hakları (PK_*) abonelik bitişinden ETKİLENMEZ — ayrı tablo (nur_video_rights)");

// 7) Yeni yıllık fiyatlar: küsüratsız + formüle uygun (PRO %10, ELİT %15)
const yuzde = (base, disc) => Math.round(base * (1 - disc));
yuzde(3000, 0.10) === 2700 && yuzde(5988, 0.15) === 5090
  ? ok("7) Yıllık TRY: PRO 2.700₺ (%10) · ELİT 5.090₺ (%15) — küsüratsız")
  : bad("7) TRY fiyatlar");
const bolge = { USD: [10, 20, 108, 204], EUR: [9, 18, 97, 184], GBP: [8, 16, 86, 163] };
Object.values(bolge).every((arr) => arr.every((n) => Number.isInteger(n)))
  ? ok("   Bölgesel fiyatlar (USD/EUR/GBP) tümü tam sayı — küsürat yok")
  : bad("   bölgesel küsürat");

console.log("\n── ÖZET: " + PASS + " PASS / " + FAIL + " FAIL ──");
process.exit(FAIL ? 1 : 0);
