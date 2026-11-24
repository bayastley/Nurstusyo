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

export type AramaGrup =
  | "ilmihal" | "hadis" | "kissa" | "sure" | "dua" | "sahabe" | "eser"
  | "peygamber" | "siyer" | "sunnet" | "adab" | "kelime" | "soru";

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
    ekle({
      id: `ilmihal:${d.id}`, grup: "ilmihal", kaynak: "İlmihal", emoji: d.emoji,
      baslik: d.ad, metin: d.alt, ek: `${d.maddeler.length} madde · ${d.sorular.length} soru`,
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

export interface AramaSonucu {
  kayit: AramaKaydi;
  puan: number;
}

/** Çok kelimeli, sıralı, çevrimdışı arama. Tüm kelimeler geçmeli (AND). */
export function siteAra(sorgu: string, grup: AramaGrup | "tumu" = "tumu", limit = 60): AramaSonucu[] {
  const q = aramaNormal(sorgu);
  if (q.length < 2) return [];
  const kelimeler = q.split(" ").filter(Boolean);
  const veri = onbellegeAl();
  const sonuc: AramaSonucu[] = [];

  for (const satir of veri) {
    if (grup !== "tumu" && satir.k.grup !== grup) continue;
    let puan = 0;
    let tamam = true;
    for (const w of kelimeler) {
      const bas = satir.bas.includes(w);
      const tam = satir.tam.includes(w);
      if (!bas && !tam) { tamam = false; break; }
      if (bas) puan += satir.bas.startsWith(w) ? 9 : 6;
      else puan += 2;
    }
    if (!tamam) continue;
    // Tam ifade başlıkta geçiyorsa büyük avantaj
    if (satir.bas.includes(q)) puan += 10;
    if (satir.bas.startsWith(q)) puan += 8;
    sonuc.push({ kayit: satir.k, puan });
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
