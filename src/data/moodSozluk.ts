// ════════════════════════════════════════════════════════
// MOOD SÖZLÜĞÜ (23.10, kullanıcı emri) — "tek tek anahtar eklemeyeyim,
// sözlükte ne varsa olsun" → geniş kelime bankası: kullanıcı hangi dilde
// ne yazarsa yazsın mood tahmin edilir.
//
// • HER GİRİŞ: kelime → mood preset id (MOOD_PRESETLERI id'leriyle aynı).
// • 5 DİL: TR + EN + AR + ID + UR kelimeleri AYNI tabloda.
// • TR girişler normalizeMood biçimindedir (ç→c, ş→s, ö→o…) — kullanıcı
//   "çölde" yazsa da kök "col" ile prefix kademesinde yakalanır.
// • ÇOK DİLLİ NORM: arapça/urduca girişler ham yazılır; arama motoru
//   (arkaplanUretici.moodBul) alef/hamza benzerlerini katlamadan önce
//   hem anahtar hem sorguya aynı normu uygular.
// • ÇAKIŞMA KURALI: aynı kelime iki grupta ise İLK GRUP kazanır.
//   YENİ GRUP EKLENİRSE buraya [mood, kelimeler] satırı eklemek yeterli.
// ════════════════════════════════════════════════════════

/** Mood id — MOOD_PRESETLERI id'leriyle aynı olmalı */
export type MoodId =
  | "huzur" | "nur" | "gece" | "gunbatimi" | "kabe" | "col" | "yesil"
  | "deniz" | "vahset" | "imtihan" | "saf" | "sanat" | "kuranyolu";

// ── Grup tanımları (okunabilir dizi) — altta düz map'e açılır
const GRUPLAR: Array<[MoodId, string[]]> = [
  // ── HUZUR — sakinlik, gönül rahatlığı, minnettarlık
  ["huzur", [
    // TR
    "huzur", "huzurlu", "sakin", "sakinlik", "dingin", "dinginlik", "rahat",
    "rahatlik", "baris", "sessiz", "sukun", "ferah", "ferahlik", "mutlu",
    "mutluluk", "gonul", "gol", "keyif", "sukur", "tesekkur", "sevincli",
    "hediye", "anne kucağı", "anne", "cocuk", "dua", "zikir", "tespih",
    // EN
    "peace", "peaceful", "calm", "serene", "serenity", "quiet", "rest",
    "comfort", "joy", "happy", "happiness", "gratitude", "thankful",
    // AR
    "سكينة", "هدوء", "طمأنينة", "سلام", "سعادة", "رضا",
    // ID
    "damai", "tenang", "hening", "nyaman", "bahagia", "syukur",
    // UR
    "سکون", "پرسکون", "آرام", "خوشی", "شکر",
  ]],

  // ── NUR & IŞIK — şafak, kandil, parlaklık
  ["nur", [
    // TR
    "nur", "isik", "isiklar", "isilti", "aydinlik", "aydin", "parlak",
    "parilti", "kandil", "kandiller", "safak", "seher", "gun dogumu",
    "lamba", "mesale", "cer",
    // EN
    "light", "glow", "glowing", "bright", "radiant", "shine", "lantern",
    "lamp", "candle", "dawn", "sunrise",
    // AR
    "نور", "ضوء", "إشراق", "فجر", "شموع",
    // ID
    "cahaya", "terang", "sinar", "fajar", "lentera", "lilin",
    // UR
    "نور", "روشنی", "چراغ", "طلوع",
  ]],

  // ── GECE & DERİNLİK — ay, yıldız, tefekkür, hüzün
  ["gece", [
    // TR
    "gece", "gece yarisi", "karanlik", "ay isigi", "ay", "aylik", "yildiz",
    "yildizlar", "gokyuzu", "gok", "bulut", "tefekkur", "dusunmek", "yalniz",
    "yalnizlik", "uyku", "uyumak", "ruya", "gizem", "derin", "derinlik",
    "huzun",
    // EN
    "night", "midnight", "moon", "moonlight", "star", "stars", "dark",
    "darkness", "sky", "clouds", "lonely", "solitude", "dream", "sleep",
    "deep", "melancholy",
    // AR
    "ليل", "قمر", "نجوم", "سحاب", "ظلام", "تأمل", "وحدة",
    // ID
    "malam", "bulan", "bintang", "gelap", "langit", "awan", "sendiri",
    "mimpi", "tidur",
    // UR
    "رات", "چاند", "ستارے", "اندھیرا", "خواب", "تنہائی",
  ]],

  // ── ALTIN SAAT — gün batımı, akşam, ufuk, sıcak ışık
  ["gunbatimi", [
    // TR
    "gunbatimi", "gun batimi", "batim", "batimi", "aksam", "alisiklean",
    "alacakaranlik", "kizil", "ufuk", "turuncu", "sicak", "gunes",
    "gunes batisi",
    // EN
    "sunset", "dusk", "twilight", "evening", "horizon", "golden", "warm",
    "amber",
    // AR
    "غروب", "مغرب", "شفق", "أفق", "ذهبي",
    // ID
    "senja", "matahari terbenam", "ufuk", "hangat", "keemasan",
    // UR
    "غروب", "شام", "غروبِ آفتاب", "افق",
  ]],

  // ── KÂBE & HAC — ibadet, cami, cemaat
  ["kabe", [
    // TR
    "kabe", "kabeye", "hac", "hacca", "hacc", "umre", "mekke", "medine",
    "mescid", "mescit", "cami", "namaz", "secde", "kible", "tavaf",
    "abdest", "ezan", "salavat", "hutbe", "cemaat", "ihram", "islam",
    "musluman",
    // EN
    "kaaba", "mecca", "medina", "mosque", "prayer", "pilgrimage", "hajj",
    "umrah", "tawaf", "islam", "muslim", "prostration",
    // AR
    "كعبة", "حج", "مكة", "المدينة", "مسجد", "صلاة", "طواف", "عمرة",
    "بيت",
    // ID
    "kabah", "haji", "umrah", "mekah", "masjid", "sholat", "ibadah",
    "islam",
    // UR
    "کعبہ", "حج", "عمرہ", "مکہ", "مدینہ", "مسجد", "نماز", "سجدہ",
  ]],

  // ── ÇÖL & HİCRET — kum, kervan, peygamber yolu
  ["col", [
    // TR
    "col", "colde", "kum", "kumlar", "kumul", "sahra", "kurak", "deve",
    "kervan", "kervansaray", "peygamber", "nebi", "hicret", "yolculuk",
    "yol yorgunlugu",
    // EN
    "desert", "dune", "dunes", "sand", "sahara", "camel", "caravan",
    "hijrah", "prophet", "journey",
    // AR
    "صحراء", "رمل", "كثبان", "هجرة", "نبي", "قافلة", "جمل", "سفر",
    // ID
    "gurun", "pasir", "unta", "kafilah", "hijrah", "nabi", "perjalanan",
    // UR
    "صحرا", "ریت", "اونٹ", "قافلہ", "ہجرت", "نبی", "سفر",
  ]],

  // ── CENNET YEŞİLİ — bahçe, orman, çiçek, yağmur
  ["yesil", [
    // TR
    "cennet", "yesil", "bahce", "orman", "agac", "cicek", "cicekler",
    "gul", "guller", "tomurcuk", "toprak", "bahar", "ilkbahar", "yaprak",
    "sonbahar", "yagmur", "yagmurlar", "nem", "taze", "buyume", "sevda",
    // EN
    "paradise", "garden", "gardens", "forest", "trees", "tree", "flower",
    "flowers", "rose", "roses", "green", "rain", "rainy", "spring",
    "bloom", "blossom", "nature", "leaf", "autumn",
    // AR
    "جنة", "حديقة", "غابة", "شجرة", "ورد", "زهور", "مطر", "ربيع",
    "خضراء",
    // ID
    "surga", "taman", "hutan", "pohon", "bunga", "mawar", "hijau",
    "hujan", "musim semi", "musim",
    // UR
    "جنت", "باغ", "جنگل", "درخت", "پھول", "گلاب", "بارش", "سبز",
  ]],

  // ── SU & AKIŞ — deniz, dalga, ırmak, şelale
  ["deniz", [
    // TR
    "deniz", "sular", "su", "dalga", "dalgalar", "selale", "irmak",
    "nehir", "okyanus", "mavi", "liman", "gemi", "balik", "akis", "kumsal",
    "plaj", "sahil", "ada", "kiyi",
    // EN
    "sea", "ocean", "water", "wave", "waves", "river", "waterfall",
    "blue", "harbor", "ship", "beach", "shore", "island", "flow",
    "stream",
    // AR
    "بحر", "ماء", "موجة", "نهر", "شلال", "سفينة", "خليج",
    // ID
    "laut", "air", "ombak", "sungai", "terjun", "biru", "kapal", "pulau",
    // UR
    "سمندر", "پانی", "لہر", "دریا", "آبشار",
  ]],

  // ── BÜYÜK DOĞA — dağ, zirve, heybet, azim
  ["vahset", [
    // TR
    "dag", "daglar", "zirve", "heybet", "heybetli", "azim", "guc",
    "guclu", "vahsi", "yuce", "kartal", "ucurum", "vadi", "vadiler",
    "manzara", "doga", "doruk",
    // EN
    "mountain", "mountains", "peak", "summit", "grand", "wild", "mighty",
    "power", "cliff", "canyon", "landscape", "eagle", "majestic",
    // AR
    "جبل", "قمة", "عظمة", "شموخ", "هضة",
    // ID
    "gunung", "puncak", "agung", "liar", "tebing", "pemandangan",
    // UR
    "پہاڑ", "چوٹی", "عظمت", "زبردست", "گھاٹی",
  ]],

  // ── İMTİHAN & FIRTINA — zorluk, keder, sabır (23.10: sabır buraya taşındı)
  ["imtihan", [
    // TR
    "imtihan", "firtina", "firtinali", "zorluk", "musibet", "siddet",
    "rizgar", "keder", "aci", "sikinti", "sinav", "kasirga", "deneme",
    "kader", "hasret", "gozyasi", "sabir", "sabretmek", "sabirli",
    // EN
    "storm", "stormy", "trial", "test", "struggle", "hardship", "wind",
    "windy", "grief", "pain", "sad", "sorrow", "turbulent", "thunder",
    "patience",
    // AR
    "عاصفة", "ابتلاء", "شدّة", "رياح", "حزن", "ألم", "صبر",
    // ID
    "badai", "ujian", "angin", "sedih", "derita", "perjuangan", "sabar",
    // UR
    "طوفان", "آزمائش", "مصیبت", "دکھ", "گرفت", "صبر",
  ]],

  // ── SAF & BERRAK — kar, buz, saflık
  ["saf", [
    // TR
    "kar", "karlar", "beyaz", "bembeyaz", "saflik", "berrak", "temiz",
    "temizlik", "arinma", "arinmak", "buz", "soguk", "seffaf", "masum",
    "masumane", "donmus",
    // EN
    "snow", "snowy", "white", "pure", "clarity", "clear", "clean", "ice",
    "icy", "cold", "frost", "innocent", "crystal",
    // AR
    "ثلج", "نقي", "صفاء", "جليد", "برودة", "نقاء",
    // ID
    "salju", "putih", "jernih", "es", "dingin", "suci",
    // UR
    "برف", "سفید", "پاکی", "سرد", "برفانی",
  ]],

  // ── DESEN & SANAT — motif, musiki, zarafet
  ["sanat", [
    // TR
    "desen", "geometri", "geometrik", "sanat", "sanatci", "estetik",
    "zarif", "zarafet", "intizam", "olcu", "musiki", "muzik", "cini",
    "motif", "el isi", "hat", "tezhip", "muset",
    // EN
    "pattern", "patterns", "geometric", "art", "aesthetic", "elegant",
    "elegance", "ornament", "ornamental", "calligraphy", "tile",
    "harmony",
    // AR
    "زخرفة", "فن", "هندسي", "خطاط", "تذهيب", "موسيقى",
    // ID
    "pola", "seni", "estetika", "geometris", "ornamen", "kaligrafi",
    // UR
    "نقش", "فن", "خوبصورت", "ہندسی", "خطاطی", "موسیقی",
  ]],

  // ── MUSHAF & OKUMA — Kur'an, meal, tilavet
  ["kuranyolu", [
    // TR
    "kuran", "kurani", "mushaf", "okuma", "okumak", "tilavet", "kitap",
    "meal", "vahiy", "sure", "ayet", "ayetler", "hatim", "harf",
    "tefsir", "hafizlik",
    // EN
    "quran", "mushaf", "reading", "verse", "verses", "recite",
    "recitation", "book", "revelation", "scripture",
    // AR
    "قرآن", "مصحف", "قراءة", "آية", "آيات", "وحي", "سورة",
    // ID
    "alquran", "mushaf", "bacaan", "ayat", "wahyu", "surah",
    // UR
    "قرآن", "مصحف", "تلاوت", "آیت", "وحی", "سورت",
  ]],
];

// ── Düz map'e aç: kelime(ler) → mood id ──────────────────
const buildSozluk = (): Record<string, MoodId> => {
  const m: Record<string, MoodId> = {};
  for (const [mood, kelimeler] of GRUPLAR) {
    for (const k of kelimeler) {
      const key = k
        .toLocaleLowerCase("tr-TR")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!key) continue;
      // önce gelen mood kazanır
      if (!m[key]) m[key] = mood;
      // "gun batimi" gibi anlamlı birleşiklerin parçaları da tek başına
      // aynı duyguyu taşır → parçaları da aynı mood'a bağla
      if (key.includes(" ")) {
        for (const tok of key.split(" ")) {
          if (tok.length >= 3 && !m[tok]) m[tok] = mood;
        }
      }
    }
  }
  return m;
};

export const MOOD_SOZLUK: Readonly<Record<string, MoodId>> = Object.freeze(buildSozluk());

/** Diagnostik — sözlük büyüklüğü (testlerde) */
export const MOOD_SOZLUK_BOYUT = Object.keys(MOOD_SOZLUK).length;
