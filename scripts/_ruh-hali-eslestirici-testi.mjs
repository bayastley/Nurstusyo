// ═══ AI RUH HALİ EŞLEŞTİRİCİ BİRİM TESTİ (02.10) ═════════════════════════
// src/data/ruhHalleri.ts'teki trKucult + ruhHaliEsle birebir kopyalanır
// (api yok, saf fonksiyon — Node'da koşar). 30 örnek cümle: HER ruh hali
// en az 1 cümleyle KENDİ mood'una düşmeli (AyetKarti mood'u = ayet havuzu
// + kart ayarı önerisinin seçildiği yer). Ek: fallback (skor 0 → huzur),
// ruh adı aşımları ve yapısal denetimler.
// Çalıştır: node scripts/_ruh-hali-eslestirici-testi.mjs
// Not: RUH_HALLERI kopyasında yalnız eşleştiricinin kullandığı alanlar var
// (id, ad, mood, anahtarlar); emoji/adI18n eşleştirmede rol oynamaz.
// ═════════════════════════════════════════════════════════════════════════

const RUH_HALLERI = [
  { id: "huzur", ad: "Huzur", mood: "huzur", anahtarlar: ["huzur", "dingin", "sakin", "rahat", "ferah", "keyif", "icim rahat", "içim rahat", "ses"] },
  { id: "sabir", ad: "Sabır", mood: "sabir", anahtarlar: ["sabir", "sabretmek", "dayanamiyorum", "sikildim", "yorgun", "yorgunum", "biktım", "bitkin", "tasıyamıyorum", "taşıyamıyorum"] },
  { id: "sukur", ad: "Şükür", mood: "sukur", anahtarlar: ["sukur", "sükrediyorum", "minnettarım", "elhamdulillah", "hamd", "nimet"] },
  { id: "tevekkul", ad: "Tevekkül", mood: "tevekkul", anahtarlar: ["tevekkul", "emanet", "bırakıyorum", "olur", "reddedilmedi", "inşallah"] },
  { id: "rahmet", ad: "Rahmet", mood: "rahmet", anahtarlar: ["rahmet", "merhamet", "magfiret", "mağfiret", "bagıslanma", "bağışlanma"] },
  { id: "sevgi", ad: "Sevgi", mood: "sevgi", anahtarlar: ["sevgi", "aşk", "ask", "seviyorum", "kalp", "düşkün", "sevdalı"] },
  { id: "zafer", ad: "Zafer", mood: "zafer", anahtarlar: ["zafer", "başarı", "basaracagim", "başaracağım", "motivasyon", "kazanmak", "galibiyet", "mücadele", "mucadele"] },
  { id: "af", ad: "Af & Tövbe", mood: "af", anahtarlar: ["af", "affet", "tovbe", "tövbe", "pişmanım", "pişmanlık", "günah", "bagisla", "bağışla", "kusurum", "hatam"] },
  { id: "imtihan", ad: "İmtihan", mood: "imtihan", anahtarlar: ["imtihan", "sınav", "sinav", "stres", "kaygi", "kaygı", "panik", "zorlanıyorum", "zor", "ödev", "giriş"] },
  { id: "cennet", ad: "Cennet Özlemi", mood: "cennet", anahtarlar: ["cennet", "özlem", "ozluyorum", "özlüyorum", "ahiret", "kabir", "vefat", "merhum", "rahmetli"] },
  { id: "ilim", ad: "İlim", mood: "ilim", anahtarlar: ["ilim", "öğrenmek", "öğreniyorum", "okul", "kurs", "bilgi", "araştırıyorum", "okumak", "ders", "çalışıyorum", "calisiyorum"] },
  { id: "aile", ad: "Aile", mood: "aile", anahtarlar: ["aile", "anne", "baba", "çocuk", "çocuğum", "evladım", "kardeş", "ebeveyn"] },
  { id: "gece", ad: "Gece & Yalnızlık", mood: "huzur", anahtarlar: ["yalnızım", "yalnızlık", "gece", "uyuyamıyorum", "sessizlik", "tek başına", "tek basina"] },
  { id: "kalp-kirik", ad: "Kalp Kırıklığı", mood: "rahmet", anahtarlar: ["kalbi kırık", "kalp kırıklığı", "kırıldım", "kırgınım", "incittiler", "ihanet", "aldattılar", "terk ettiler", "kirik kalp"] },
  { id: "uzuntu", ad: "Üzüntü", mood: "sabir", anahtarlar: ["üzgünüm", "üzüntü", "ağlıyorum", "hüzün", "mutsuz", "keder", "yas", "yas tutuyorum"] },
  { id: "umut", ad: "Umut", mood: "rahmet", anahtarlar: ["umut", "umudum", "iyileşeceğim", "geçecek", "umuyorum", "bekliyorum"] },
  { id: "dua", ad: "Dua & Yakarış", mood: "tevekkul", anahtarlar: ["dua", "yakarıyorum", "rica", "ilahi", "rabbi", "yalvarıyorum", "yalvariyorum"] },
  { id: "rizik", ad: "Rızık Endişesi", mood: "tevekkul", anahtarlar: ["rızık", "para", "borç", "maaş", "geçim", "işsiz", "iş arıyorum", "is arıyorum", "borçlarım"] },
  { id: "teselli", ad: "Teselli", mood: "rahmet", anahtarlar: ["teselli", "derdim", "dert", "iyileşiyorum", "geçsin", "sarsılmadım", "sarsildim"] },
  { id: "cesaret", ad: "Cesaret", mood: "zafer", anahtarlar: ["cesaret", "korkuyorum", "üstesinden", "yapamam", "deneyeceğim", "kararlıyım", "kararliyim"] },
  { id: "sifa", ad: "Şifa", mood: "rahmet", anahtarlar: ["şifa", "şifam", "hastayım", "iyileşme", "tedavi", "ameliyat", "sifa"] },
  { id: "adalet", ad: "Adalet", mood: "ilim", anahtarlar: ["adalet", "haksızlık", "haksizlik", "zulüm", "mahkeme", "dava", "hakkımı"] },
  { id: "yeni-baslangic", ad: "Yeni Başlangıç", mood: "af", anahtarlar: ["yeni başlangıç", "yeni baslangic", "sıfırdan", "sifirdan", "başlıyorum", "yeni sayfa", "temiz"] },
  { id: "kararsizlik", ad: "Kararsızlık", mood: "ilim", anahtarlar: ["kararsızım", "kararsızlık", "kararsizim", "hangi", "seçemiyorum", "tereddüt", "yol göster"] },
  { id: "korku", ad: "Korku", mood: "tevekkul", anahtarlar: ["korku", "korkuyorum", "fırtına", "deprem", "dehşet", "endişeliyim", "endiseliyim"] },
  { id: "sevinc", ad: "Sevinç", mood: "sukur", anahtarlar: ["sevinç", "sevinc", "mutluyum", "harika", "kutlama", "müjde", "mujde", "güzel haber"] },
  { id: "bereket", ad: "Bereket", mood: "sukur", anahtarlar: ["bereket", "bolluk", "artıyor", "artıyor", "çok şükür", "çok sukur"] },
  { id: "acele", ad: "Acele", mood: "sabir", anahtarlar: ["acele", "aceleciyim", "bekleyemiyorum", "sabredemiyorum", "geç kaldım", "gec kaldim"] },
  { id: "yolculuk", ad: "Yolculuk", mood: "tevekkul", anahtarlar: ["yolculuk", "taşınıyorum", "tasiniyorum", "göç", "goc", "hicret", "uzak", "ayrılık", "ayrilik"] },
  { id: "es", ad: "Evlilik & Eş", mood: "sevgi", anahtarlar: ["evlilik", "eş", "nişan", "nis", "düğün", "dugun", "evlenmek", "eşim", "cift", "çift"] },
];

// ── birebir kopya: normalizasyon + eşleştirici ─────────────
const TR_MAP = { "ı": "i", "İ": "i", "ğ": "g", "Ğ": "g", "ü": "u", "Ü": "u", "ş": "s", "Ş": "s", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c" };

function trKucult(metin) {
  return metin.toLocaleLowerCase("tr").replace(/[ıİğĞüÜşŞöÖçÇ]/g, (h) => TR_MAP[h] ?? h);
}

function ruhHaliEsle(metin) {
  const metinN = ` ${trKucult(metin).replace(/\s+/g, " ").trim()} `;
  let enIyi = RUH_HALLERI[0];
  let enIyiSkor = 0;
  for (const ruh of RUH_HALLERI) {
    let skor = 0;
    if (metinN.includes(` ${trKucult(ruh.ad)} `)) skor += 3;
    for (const anahtar of ruh.anahtarlar) {
      if (metinN.includes(trKucult(anahtar))) skor += anahtar.length >= 6 ? 2 : 1;
    }
    if (skor > enIyiSkor) { enIyi = ruh; enIyiSkor = skor; }
  }
  return { ruh: enIyi, skor: enIyiSkor };
}

// ── test iskeleti ───────────────────────────────────────────
let gecen = 0, toplam = 0;
const kos = (ad, kosul) => { toplam++; if (kosul) gecen++; else console.error("  ✗ FAIL:", ad); };

const moodById = Object.fromEntries(RUH_HALLERI.map((r) => [r.id, r.mood]));

// 30 ÖRNEK CÜMLE — [ruhId, cümle]: her ruh hali tam 1 cümleyle temsil edilir.
// Cümleler gerçek kullanıcı dili gibi yazıldı (çip adını aynen geçmek yerine
// doğal varyantlar + eşik fazlasıyla açık: kazanan ruh eşiği belli olsun).
const CUMLELER = [
  ["huzur", "bugün içim rahat, huzur doluyum"],
  ["sabir", "sabretmek zor ama taşıyamıyorum artık"],
  ["sukur", "elhamdulillah, her şeye minnettarım"],
  ["tevekkul", "her şeyi Allah'a emanet ettim, tevekkül ediyorum"],
  ["rahmet", "Allah'ın rahmeti ve merhameti ile"],
  ["sevgi", "ona olan sevgim sınırsız, seviyorum"],
  ["zafer", "başaracağım, bu mücadeleyi kazanmak istiyorum"],
  ["af", "günahlarım için pişmanım, bağışla"],
  ["imtihan", "bu imtihanın sınav stresinden panik atak geçiriyorum"],
  ["cennet", "cennette rahmetli annemi özlüyorum"],
  ["ilim", "her gün ders çalışıyorum, okula gidiyorum"],
  ["aile", "annem, babam ve çocuklarımla ailecek toplandık"],
  ["gece", "gece uyuyamıyorum, yalnızlık bastırıyor"],
  ["kalp-kirik", "kalbi kırık bir haldeyim, terk ettiler"],
  ["uzuntu", "çok üzgünüm, ağlıyorum durmadan"],
  ["umut", "her şeyin iyi olacağına umuyorum, iyileşeceğim"],
  ["dua", "gece yarısı yakarıyorum, dua ediyorum"],
  ["rizik", "borçlarım arttı, iş arıyorum"],
  ["teselli", "derdim büyük, bir teselli arıyorum"],
  ["cesaret", "korkuyorum ama deneyeceğim, kararlıyım"],
  ["sifa", "ameliyattan sonra iyileşme sürecindeyim, şifa bekliyorum"],
  ["adalet", "başımıza gelen zulüm karşısında dava açtık"],
  ["yeni-baslangic", "sıfırdan başlıyorum, yeni bir sayfa açıyorum"],
  ["kararsizlik", "iki yol arasında kararsızım, seçemiyorum"],
  ["korku", "fırtına korkusuyla endişeliyim"],
  ["sevinc", "harika bir haber aldım, çok mutluyum"],
  ["bereket", "ekonomim bolluk içinde, bereketi artıyor"],
  ["acele", "aceleciyim, geç kaldım diye bekleyemiyorum"],
  ["yolculuk", "taşınıyorum, uzun bir yolculuk beni bekliyor"],
  ["es", "düğün hazırlığındayız, evlenmek istiyoruz"],
];

// 1) 30 cümle → doğru ruhun mood'u
for (const [id, c] of CUMLELER) {
  const es = ruhHaliEsle(c);
  const beklenenMood = moodById[id];
  kos(`${id} · "${c}" → ${beklenenMood}`, es.ruh.mood === beklenenMood);
  if (es.ruh.mood !== beklenenMood) {
    console.error(`      gelen: ${es.ruh.id} (${es.ruh.mood}) · skor ${es.skor}`);
  }
}

// 2) Kapsama: her ruh hali en az 1 cümleyle test ediliyor
kos("kapsama: 30 ruhun tamamı en az 1 cümleyle temsil ediliyor", new Set(CUMLELER.map((x) => x[0])).size === RUH_HALLERI.length);

// 3) Mood dağılımı: 30 ruh, AyetKarti'nin 12 mood'unun hepsini kapsıyor
const MOODS = ["huzur", "sabir", "sukur", "tevekkul", "rahmet", "sevgi", "zafer", "af", "imtihan", "cennet", "ilim", "aile"];
const yayilan = new Set(RUH_HALLERI.map((r) => r.mood));
kos("dağılım: 12 mood'un tamamı kaplı", MOODS.every((m) => yayilan.has(m)) && yayilan.size === MOODS.length);

// 4) Fallback: hiçbir anahtar tutmazsa ilk ruh (huzur) + skor 0
kos("fallback: 'yanımda ol' → huzur, skor 0", (() => { const es = ruhHaliEsle("yanımda ol"); return es.ruh.id === "huzur" && es.skor === 0; })());
kos("fallback: 'sadece İngilizce ya da boş' → huzur, skor 0", (() => { const es = ruhHaliEsle("sadece İngilizce ya da boş"); return es.ruh.id === "huzur" && es.skor === 0; })());
kos("fallback: 'Firdevs' (isim) → huzur, skor 0", (() => { const es = ruhHaliEsle("Firdevs"); return es.ruh.id === "huzur" && es.skor === 0; })());

// 5) Ad aşımı: ruh adı doğrudan geçince +3 ile kendine düşer
kos("ad aşımı: 'tevekkül' doğrudan tevekkül ruhuna düşer", (() => { const es = ruhHaliEsle("tevekkül"); return es.ruh.id === "tevekkul" && es.skor >= 3; })());

console.log(toplam === gecen
  ? `✅ RUH HALİ EŞLEŞTİRİCİ TESTİ ${gecen}/${toplam} PASS (30 cümle + 5 yapısal)`
  : `❌ RUH HALİ TESTİ: ${toplam - gecen}/${toplam} FAIL`);
process.exit(toplam === gecen ? 0 : 1);
