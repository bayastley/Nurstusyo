// ════════════════════════════════════════════════════════
// SITEARAMAINDEKSI.TS — Site içi arama motoru (sunucusuz, çevrimdışı)
// Kullanıcı emri (24.11): "arama çubuğu koy ki Google'a ihtiyaç duymasın"
//
// ★ Tüm veri paketin içinde; hiçbir istek atılmaz, indeks cihazda kurulur.
// ★ Kapsam: ilmihal, hadis, kıssa, sure bilgisi, dua, sahabe, klasik eser,
//   peygamber, siyer, sünnet, edep, kelime kartı, soru-cevap.
// ════════════════════════════════════════════════════════

import { ILMIHAL_DERSLERI } from "./ilmihalData";
import { HADIS_BANKASI } from "./hadisData";
import { KISSA_LISTESI } from "./kissaData";
import { KISSA_EK } from "./kissaEk";
import { SURE_BİLGİLERİ } from "./sureData";
import { BEBEK_DUALARI, DUA_REHBERİ } from "./duaData";
import { SAHABELER } from "./sahabelerDetayData";
import { KLASIK_ESERLER } from "./klasikEserler";
import { PEYGAMBERLER } from "./peygamberler";
import { SIYER_KATEGORILER } from "./siyer";
import { SÜNNETLER } from "./sunnetler";
import { ADABI_MUASERET } from "./adabiMuaseret";
import { KELIME_KARTLARI } from "./kelimeData";
import { SORU_BANKASI } from "./sorular";
// ★ 24.11 ÇOKDİLLİ ARAMA: ilmihal ders adları/açıklamaları 4 dilde indekse girer
import { dersAdi, dersAlt } from "./ilmihalCokDil";

export type AramaGrup =
  | "ilmihal" | "hadis" | "kissa" | "sure" | "dua" | "sahabe" | "eser"
  | "peygamber" | "siyer" | "sunnet" | "adab" | "kelime" | "soru";

/**
 * ★ 24.11 ÇOKDİLLİ EŞANLAM SÖZLÜĞÜ
 * Bir dizi = aynı kavramın 5 dildeki yaygın yazılışları. Sorgu kelimesi
 * hangi dilde gelirse gelsin (prayer / صلاة / salat / نماز) aynı gruba düşer
 * ve Türkçe kayıtları da bulur. Tamamen cihazda; ağ isteği yok.
 * Kural: yalnız yerleşik dinî terimler; uydurma karşılık yok.
 */
const ESANLAM: string[][] = [
  ["namaz", "prayer", "salah", "صلاة", "salat", "shalat", "نماز"],
  ["abdest", "wudu", "ablution", "وضوء", "wudhu", "وضو"],
  ["gusül", "ghusl", "غسل", "mandi", "غسل"],
  ["teyemmüm", "tayammum", "تيمم", "tayamum", "تیمم"],
  ["oruç", "fasting", "sawm", "صوم", "puasa", "روزہ"],
  ["zekât", "zakat", "alms", "زكاة", "زکوٰۃ"],
  ["fitre", "fitrah", "فطرة", "fitrah", "فطرہ"],
  ["hac", "hajj", "pilgrimage", "حج", "haji", "حج"],
  ["umre", "umrah", "عمرة", "umrah", "عمرہ"],
  ["kurban", "sacrifice", "أضحية", "kurban", "قربانی"],
  ["dua", "supplication", "دعاء", "doa", "دعا"],
  ["zikir", "remembrance", "ذكر", "zikir", "ذکر"],
  ["tövbe", "repentance", "توبة", "tobat", "توبہ"],
  ["iman", "faith", "إيمان", "iman", "ایمان"],
  ["tevhid", "oneness", "monotheism", "توحيد", "tauhid", "توحید"],
  ["cennet", "paradise", "جنة", "surga", "جنت"],
  ["cehennem", "hell", "جهنم", "neraka", "جہنم"],
  ["melek", "angel", "ملك", "malaikat", "فرشتہ"],
  ["peygamber", "prophet", "نبي", "nabi", "نبی"],
  ["sahabe", "companion", "صحابي", "sahabat", "صحابی"],
  ["hadis", "hadith", "حديث", "hadis", "حدیث"],
  ["sure", "surah", "سورة", "surah", "سورت"],
  ["ayet", "verse", "آية", "ayat", "آیت"],
  ["kuran", "quran", "koran", "قرآن", "quran", "قرآن"],
  ["mehir", "mahr", "dowry", "مهر", "mahar", "مہر"],
  ["nikah", "marriage", "نكاح", "nikah", "نکاح"],
  ["talak", "divorce", "طلاق", "talak", "طلاق"],
  ["iddet", "iddah", "عدة", "idah", "عدت"],
  ["miras", "inheritance", "ميراث", "warisan", "وراثت"],
  ["faiz", "interest", "usury", "ربا", "riba", "سود"],
  ["zina", "adultery", "زنا", "zina", "زنا"],
  ["içki", "alcohol", "خمر", "khamar", "شراب"],
  ["domuz", "pork", "pig", "خنزير", "babi", "خنزیر"],
  ["helal", "halal", "lawful", "حلال", "حلال"],
  ["haram", "forbidden", "حرام", "haram", "حرام"],
  ["farz", "obligatory", "فرض", "fardu", "فرض"],
  ["vacip", "necessary", "واجب", "wajib", "واجب"],
  ["sünnet", "sunnah", "سنة", "sunnah", "سنت"],
  ["mekruh", "disliked", "مكروه", "makruh", "مکروہ"],
  ["cuma", "friday", "جمعة", "jumat", "جمعہ"],
  ["bayram", "eid", "عيد", "id", "عید"],
  ["ezan", "adhan", "أذان", "azan", "اذان"],
  ["imam", "إمام", "imam", "امام"],
  ["cami", "mosque", "مسجد", "masjid", "مسجد"],
  ["kâbe", "kaaba", "كعبة", "kabah", "کعبہ"],
  ["kıble", "qibla", "قبلة", "kiblat", "قبلہ"],
  ["cenaze", "funeral", "جنازة", "jenazah", "جنازہ"],
  ["ölüm", "death", "موت", "kematian", "موت"],
  ["ahiret", "afterlife", "آخرة", "akhirat", "آخرت"],
  ["kıyamet", "resurrection", "قيامة", "kiamat", "قیامت"],
  ["sadaka", "charity", "صدقة", "sedekah", "صدقہ"],
  ["infak", "spending", "إنفاق", "infak", "انفاق"],
  ["yetim", "orphan", "يتيم", "yatim", "یتیم"],
  ["anne", "mother", "أم", "ibu", "ماں"],
  ["baba", "father", "أب", "ayah", "باپ"],
  ["komşu", "neighbour", "neighbor", "جار", "tetangga", "ہمسایہ"],
  ["aile", "family", "أسرة", "keluarga", "خاندان"],
  ["sabır", "patience", "صبر", "sabar", "صبر"],
  ["şükür", "gratitude", "شكر", "syukur", "شکر"],
  ["gıybet", "backbiting", "غيبة", "ghibah", "غیبت"],
  ["iftira", "slander", "بهتان", "tuduhan", "بہتان"],
  ["yalan", "lie", "كذب", "dusta", "جھوٹ"],
  ["cihad", "jihad", "جهاد", "jihad", "جہاد"],
  ["ilim", "knowledge", "علم", "ilmu", "علم"],
  ["tecvid", "tajweed", "تجويد", "tajwid", "تجوید"],
  ["hatim", "khatm", "ختم", "khatam", "ختم"],
  ["kıraat", "recitation", "قراءة", "qiraah", "قرات"],
  ["vakıf", "endowment", "وقف", "wakaf", "وقف"],
  ["rehin", "pledge", "رهن", "gadai", "رہن"],
  ["kefalet", "guarantee", "كفالة", "jaminan", "کفالت"],
  ["yemin", "oath", "يمين", "sumpah", "قسم"],
  ["adak", "vow", "نذر", "nadzar", "نذر"],
  ["kefaret", "expiation", "كفارة", "kafarat", "کفارہ"],
  ["nisap", "nisab", "نصاب", "nisab", "نصاب"],
  ["av", "hunting", "صيد", "berburu", "شکار"],
  ["kesim", "slaughter", "ذبح", "sembelih", "ذبح"],
  ["hayvan", "animal", "حيوان", "hewan", "جانور"],
  ["deniz", "sea", "بحر", "laut", "سمندر"],
  ["su", "water", "ماء", "air", "پانی"],
  ["temizlik", "purity", "طهارة", "bersuci", "طہارت"],
  ["necaset", "impurity", "نجاسة", "najis", "نجاست"],
  ["hastalık", "illness", "مرض", "sakit", "بیماری"],
  ["sefer", "travel", "سفر", "perjalanan", "سفر"],
  ["ruhsat", "concession", "رخصة", "rukhsah", "رخصت"],
  ["kaza", "makeup", "قضاء", "qada", "قضا"],
  ["vitir", "witr", "وتر", "witir", "وتر"],
  ["teravih", "tarawih", "تراويح", "tarawih", "تراویح"],
  ["itikaf", "itikaf", "اعتكاف", "itikaf", "اعتکاف"],
  ["imsak", "imsak", "إمساك", "imsak", "امساک"],
  ["iftar", "iftar", "إفطار", "iftar", "افطار"],
  ["sahur", "suhoor", "سحور", "sahur", "سحری"],
];

export interface AramaKaydi {
  id: string;
  grup: AramaGrup;
  kaynak: string;
  emoji: string;
  baslik: string;
  metin: string;
  /** kaynak künyesi (ayet, hadis kitabı, tarih…) */
  ek?: string;
}

export const ARAMA_GRUPLARI: Array<{ id: AramaGrup; ad: string; emoji: string }> = [
  { id: "ilmihal", ad: "İlmihal", emoji: "📗" },
  { id: "hadis", ad: "Hadis", emoji: "📜" },
  { id: "kissa", ad: "Kıssa", emoji: "📖" },
  { id: "sure", ad: "Sure", emoji: "🕌" },
  { id: "dua", ad: "Dua", emoji: "🤲" },
  { id: "sahabe", ad: "Sahabe", emoji: "⭐" },
  { id: "eser", ad: "Klasik Eser", emoji: "📚" },
  { id: "peygamber", ad: "Peygamber", emoji: "🌿" },
  { id: "siyer", ad: "Siyer", emoji: "🕋" },
  { id: "sunnet", ad: "Sünnet", emoji: "✅" },
  { id: "adab", ad: "Edep", emoji: "🌸" },
  { id: "kelime", ad: "Kelime", emoji: "🔤" },
  { id: "soru", ad: "Soru-Cevap", emoji: "❓" },
];

/** Türkçe + Arapça duyarsız arama normalizasyonu (ş/s, ı/i, harekeler…). */
export function aramaNormal(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // Arapça harekeler, uzatma
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[âàáä]/g, "a")
    .replace(/[îìíï]/g, "i")
    .replace(/[ûùúü]/g, "u")
    .replace(/[ôòóö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/[ş]/g, "s")
    .replace(/[ğ]/g, "g")
    .replace(/[ı]/g, "i")
    .replace(/[’'`´]/g, "")
    .replace(/[‐-–—]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const KISALT = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

let onbellek: Array<{ k: AramaKaydi; bas: string; tam: string }> | null = null;

/** Tüm içerikten tek indeks — ilk aramada kurulur, sonra bellekte kalır. */
export function siteIndeksi(): AramaKaydi[] {
  const kayitlar: AramaKaydi[] = [];
  const ekle = (k: AramaKaydi) => kayitlar.push(k);

  for (const d of ILMIHAL_DERSLERI) {
    // ★ 24.11 ÇOKDİLLİ: 4 dildeki ders adı + açıklaması indekse eklenir (kayıt sayısı değişmez)
    const yerelAdlar = (["en", "ar", "id", "ur"] as const)
      .flatMap((l) => [dersAdi(d, l), dersAlt(d, l)]).filter(Boolean).join(" · ");
    ekle({
      id: `ilmihal:${d.id}`, grup: "ilmihal", kaynak: "İlmihal", emoji: d.emoji,
      baslik: d.ad, metin: `${d.alt} — ${yerelAdlar}`, ek: `${d.maddeler.length} madde · ${d.sorular.length} soru`,
    });
    d.maddeler.forEach((m, i) => ekle({
      id: `ilmihal:${d.id}:${i}`, grup: "ilmihal", kaynak: "İlmihal", emoji: d.emoji,
      baslik: `${d.ad} — ${m.baslik}`, metin: m.metin, ek: m.delil,
    }));
  }

  HADIS_BANKASI.forEach((h, i) => ekle({
    id: `hadis:${i}`, grup: "hadis", kaynak: "Hadis", emoji: "📜",
    baslik: h.tema, metin: h.metin, ek: h.kaynak,
  }));

  [...KISSA_LISTESI, ...KISSA_EK].forEach((k, i) => ekle({
    id: `kissa:${i}`, grup: "kissa", kaynak: "Kıssa", emoji: "📖",
    baslik: k.ad, metin: `${k.ozet} Ders: ${k.ders}`, ek: [k.sure, k.kaynak].filter(Boolean).join(" · "),
  }));

  for (const s of SURE_BİLGİLERİ) {
    ekle({
      id: `sure:${s.n}`, grup: "sure", kaynak: "Sure", emoji: "🕌",
      baslik: `${s.n}. ${s.ad}`, metin: [s.konu, s.fazilet, s.aciklama].filter(Boolean).join(" "),
      ek: `${s.inis} · ${s.nuzul ? "nüzul bilgisi var" : "nüzul"}`,
    });
  }

  DUA_REHBERİ.forEach((d, i) => ekle({
    id: `dua:${i}`, grup: "dua", kaynak: "Dua", emoji: "🤲",
    baslik: d.durum, metin: d.dua, ek: d.kaynak,
  }));
  BEBEK_DUALARI.forEach((d, i) => ekle({
    id: `dua-bebek:${i}`, grup: "dua", kaynak: "Dua", emoji: "🤲",
    baslik: `Bebek duası — ${d.baslik}`, metin: d.tr, ek: d.kaynak,
  }));

  SAHABELER.forEach((s) => ekle({
    id: `sahabe:${s.id}`, grup: "sahabe", kaynak: "Sahabe", emoji: s.emoji,
    baslik: `${s.ad}${s.unvan ? ` (${s.unvan})` : ""}`, metin: s.hayat.join(" "),
    ek: `${s.tarih}${s.kaynak.length ? ` · ${s.kaynak.join(", ")}` : ""}`,
  }));

  KLASIK_ESERLER.forEach((e) => ekle({
    id: `eser:${e.id}`, grup: "eser", kaynak: "Klasik Eser", emoji: "📚",
    baslik: e.ad, metin: `${e.ozet} ${e.onem}`, ek: `${e.muellif} · ${e.vefat}`,
  }));

  PEYGAMBERLER.forEach((p) => ekle({
    id: `peygamber:${p.ad}`, grup: "peygamber", kaynak: "Peygamber", emoji: "🌿",
    baslik: p.ad, metin: `${p.ozet} ${p.olaylar.join(" ")} Ders: ${p.ders}`, ek: p.kaynak,
  }));

  SIYER_KATEGORILER.forEach((kat, ki) => kat.olaylar.forEach((o, oi) => ekle({
    id: `siyer:${ki}:${oi}`, grup: "siyer", kaynak: "Siyer", emoji: "🕋",
    baslik: `${kat.ad} (${kat.donem})`, metin: o.metin, ek: o.kaynak,
  })));

  SÜNNETLER.forEach((s, i) => ekle({
    id: `sunnet:${i}`, grup: "sunnet", kaynak: "Sünnet", emoji: "✅",
    baslik: s.ad, metin: s.metin, ek: s.kaynak,
  }));

  ADABI_MUASERET.forEach((a, i) => ekle({
    id: `adab:${i}`, grup: "adab", kaynak: "Edep", emoji: "🌸",
    baslik: a.ad, metin: a.metin, ek: a.kaynak,
  }));

  KELIME_KARTLARI.forEach((k, i) => ekle({
    id: `kelime:${i}`, grup: "kelime", kaynak: "Kelime", emoji: "🔤",
    baslik: `${k.ar} — ${k.tr}`, metin: `${k.okunus}. ${k.ornek} ${k.meal ?? ""}`,
  }));

  SORU_BANKASI.forEach((s, i) => ekle({
    id: `soru:${i}`, grup: "soru", kaynak: "Soru-Cevap", emoji: "❓",
    baslik: KISALT(s.soru, 120), metin: s.cevap, ek: s.kaynak,
  }));

  return kayitlar;
}

function onbellegeAl() {
  if (onbellek) return onbellek;
  onbellek = siteIndeksi().map((k) => ({
    k,
    bas: aramaNormal(`${k.baslik} ${k.kaynak}`),
    tam: aramaNormal(`${k.baslik} ${k.metin} ${k.ek ?? ""} ${k.kaynak}`),
  }));
  return onbellek;
}

/** Normalize edilmiş eşanlam haritası: "prayer" → tüm dillerdeki karşılıkları. */
let esanlamHaritasi: Map<string, string[]> | null = null;
function esanlamlariAl(): Map<string, string[]> {
  if (esanlamHaritasi) return esanlamHaritasi;
  const harita = new Map<string, string[]>();
  for (const grup of ESANLAM) {
    const norm = grup.map((s) => aramaNormal(s)).filter(Boolean);
    for (const k of norm) {
      const mevcut = harita.get(k) ?? [];
      harita.set(k, [...new Set([...mevcut, ...norm])]);
    }
  }
  esanlamHaritasi = harita;
  return harita;
}

export interface AramaSonucu {
  kayit: AramaKaydi;
  puan: number;
}

/** Çok kelimeli, sıralı, çevrimdışı arama. Tüm kelimeler geçmeli (AND). */
export function siteAra(sorgu: string, grup: AramaGrup | "tumu" = "tumu", limit = 60): AramaSonucu[] {
  const q = aramaNormal(sorgu);
  if (q.length < 2) return [];
  const harita = esanlamlariAl();
  const kelimeler = q.split(" ").filter(Boolean);
  // ★ 24.11 ÇOKDİLLİ: her kelime kendi eşanlam grubuna açılır (prayer → namaz, salah, صلاة…)
  const gruplar = kelimeler.map((w) => harita.get(w) ?? [w]);
  const veri = onbellegeAl();

  // ★ 24.11: kelime sınırı — "mahr" sorgusu "mahrem"i yakalamasın
  const kelimeVar = (metin: string, w: string): boolean => ` ${metin} `.includes(` ${w} `);

  const tara = (grupListesi: string[][]): AramaSonucu[] => {
    const bulunan: AramaSonucu[] = [];
    for (const satir of veri) {
      if (grup !== "tumu" && satir.k.grup !== grup) continue;
      let puan = 0;
      let tamam = true;
      for (const esler of grupListesi) {
        let grupPuani = 0;
        for (const w of esler) {
          if (kelimeVar(satir.bas, w)) grupPuani = Math.max(grupPuani, satir.bas.startsWith(w) ? 9 : 6);
          else if (kelimeVar(satir.tam, w)) grupPuani = Math.max(grupPuani, 2);
        }
        if (grupPuani === 0) { tamam = false; break; }
        puan += grupPuani;
      }
      if (!tamam) continue;
      if (satir.bas.includes(q)) puan += 10;
      if (satir.bas.startsWith(q)) puan += 8;
      bulunan.push({ kayit: satir.k, puan });
    }
    return bulunan;
  };

  let sonuc = tara(gruplar);
  // Hiç sonuç yoksa: sözlükte karşılığı olmayan tek kelimeleri atıp daraltılmış aramayı dene
  // (ör. "prayer times" → "times" eşleşmezse yalnız "prayer" ile aranır)
  if (sonuc.length === 0 && gruplar.length > 1) {
    const daralt = gruplar.filter((g) => g.length > 1);
    if (daralt.length) sonuc = tara(daralt);
  }

  sonuc.sort((a, b) => b.puan - a.puan || a.kayit.baslik.length - b.kayit.baslik.length);
  return sonuc.slice(0, limit);
}

/** Belirli gruptaki kayıt sayısı — filtre çiplerinde gösterilir. */
export function grupSayilari(): Record<string, number> {
  const sayac: Record<string, number> = { tumu: 0 };
  for (const k of siteIndeksi()) {
    sayac[k.grup] = (sayac[k.grup] ?? 0) + 1;
    sayac.tumu += 1;
  }
  return sayac;
}
