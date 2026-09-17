// ═══════════════════════════════════════════════════════════
// AKILLI ATMOSFER DEMO (beta) — v2 lansman özelliği
// Kullanıcı doğal dil yazar: "1. ayette deniz olsun, 2. ayette gece"
// → sistem cümledeki anahtar kelimeleri R2 kategorileriyle eşleştirir.
// Ayet numarası yoksa cümleler sahnelere bölünür ve BÜTÜN videoya yayılır.
//
// ★ ÖNEMLİ: Tüm havuz anahtarları normalize() edilmiş (ASCII) formda tutulur —
//   "fırtına" değil "firtina", "çölde" değil "colde". Arama da normalize edilir.
// ═══════════════════════════════════════════════════════════

export interface AtmosferAtama {
  /** Bu sahnenin kapladığı ilk ayet (1 tabanlı) */
  baslangic: number;
  /** Bu sahnenin kapladığı son ayet (tek ayet ise baslangic ile aynı) */
  bitis: number;
  kategori: string;
  klipId: string;
  url: string;
  poster: string;
  etiket: string;
  emoji: string;
}

// ★ Tüm ID'ler R2 CDN'de 200 OK ile test edilmiştir (Eylül 2026)
const R2_TEST_EDILMIS: Record<string, Array<{ id: string; ad: string }>> = {
  namaz:     [{ id: "35110882", ad: "Kâbe" }, { id: "35110842", ad: "Mescid-i Harâm" }],
  musaf:     [{ id: "13643568", ad: "Mushaf" }, { id: "13643567", ad: "Kur'an Okuma" }],
  deniz:     [{ id: "6981297", ad: "Dalgalar" }, { id: "5668613", ad: "Mavi Su" }],
  gece:      [{ id: "28180439", ad: "Gece Gökü" }, { id: "37171416", ad: "Ay Işığı" }],
  gunbatimi: [{ id: "10221670", ad: "Gün Batımı" }, { id: "36466614", ad: "Akşam Kızıllığı" }],
  yildizlar: [{ id: "5338469", ad: "Yıldızlar" }, { id: "5651047", ad: "Samanyolu" }],
  cicekler:  [{ id: "6319631", ad: "Gül Bahçesi" }, { id: "6441720", ad: "Çiçek Açan Dal" }],
  cami:      [{ id: "36177743", ad: "Cami" }, { id: "36178460", ad: "Mescit" }],
  bulut:     [{ id: "4060762", ad: "Bulutlar" }, { id: "4103458", ad: "Gökyüzü" }],
  gol:       [{ id: "10506706", ad: "Sakin Göl" }, { id: "28043352", ad: "Durgun Su" }],
  kar:       [{ id: "19493781", ad: "Kar" }, { id: "38682192", ad: "Beyaz Örtü" }],
  daglar:    [{ id: "13883796", ad: "Dağlar" }, { id: "35632406", ad: "Zirve" }],
  selale:    [{ id: "7220614", ad: "Şelale" }, { id: "10706309", ad: "Su Coşkusu" }],
  col:       [{ id: "2055056", ad: "Çöl" }, { id: "33911366", ad: "Kum Tepeleri" }],
  sehir:     [{ id: "34432938", ad: "Şehir" }, { id: "16224290", ad: "Medeniyet" }],
  desen:     [{ id: "35619112", ad: "Geometrik Desen" }, { id: "37646178", ad: "İslami Desen" }],
  cennet:    [{ id: "3690677", ad: "Cennet Bahçesi" }, { id: "17367728", ad: "Adn Bahçeleri" }],
  orman:     [{ id: "18209572", ad: "Orman" }, { id: "27921683", ad: "Yeşil Doğa" }],
};

// ★ Anahtar kelime havuzu — anahtarlar normalize (ASCII) formda!
const KELIME_HAVUZU: Record<string, string> = {
  // deniz
  deniz: "deniz", denizi: "deniz", dalgalar: "deniz", dalga: "deniz",
  okyanus: "deniz", su: "deniz", sular: "deniz", mavi: "deniz", rizik: "deniz",
  balik: "deniz", baliklar: "deniz", gemi: "deniz", gemici: "deniz",
  // gece
  gece: "gece", gecesi: "gece", ay: "gece", karanlik: "gece", sessiz: "gece",
  sessizlik: "gece", tefekkur: "gece", geceyarisi: "gece", azap: "gece",
  korku: "gece", dehset: "gece", zulmet: "gece", "ay isigi": "gece",
  // günbatımı
  gunbatimi: "gunbatimi", gunbatmasi: "gunbatimi", aksam: "gunbatimi",
  "gun batimi": "gunbatimi", sonus: "gunbatimi", kizillik: "gunbatimi",
  // yıldızlar
  yildiz: "yildizlar", yildizlar: "yildizlar", uzay: "yildizlar",
  galaksi: "yildizlar", evren: "yildizlar", gokyuzu: "yildizlar",
  semalar: "yildizlar", kainat: "yildizlar", gok: "yildizlar", gokte: "yildizlar",
  kus: "yildizlar", kuslar: "yildizlar",
  // çiçekler
  cicek: "cicekler", cicekler: "cicekler", gul: "cicekler", bahce: "cicekler",
  bahcesi: "cicekler", rahmet: "cicekler", guzellik: "cicekler", nefs: "cicekler",
  kelebek: "cicekler", ari: "cicekler", arilar: "cicekler",
  // cami
  cami: "cami", mescit: "cami", mimari: "cami", ibadet: "cami", secde: "cami", osmanli: "cami",
  // namaz / Kâbe
  kabe: "namaz", hac: "namaz", umre: "namaz", namaz: "namaz",
  mekke: "namaz", kible: "namaz", tevhid: "namaz",
  // bulut
  bulut: "bulut", bulutlar: "bulut", yagmur: "bulut",
  firtina: "bulut", ruzgar: "bulut", yildirim: "bulut",
  // göl
  gol: "gol", golu: "gol", sakin: "gol", durgun: "gol", huzur: "gol", zikir: "gol",
  // kar
  kar: "kar", buz: "kar", kis: "kar", beyaz: "kar", temizlik: "kar", arinma: "kar",
  // dağlar
  dag: "daglar", daglar: "daglar", zirve: "daglar", sabir: "daglar", azim: "daglar", guc: "daglar",
  // şelale
  selale: "selale", selalesi: "selale", sifa: "selale", cosku: "selale",
  // çöl
  col: "col", colde: "col", deve: "col", develer: "col", kum: "col",
  imtihan: "col", peygamber: "col", kervan: "col", ordu: "col",
  savas: "col", musrikler: "col", "kum firtinasi": "col",
  // şehir
  sehir: "sehir", medeniyet: "sehir", toplum: "sehir", adalet: "sehir", kiyamet: "sehir",
  // desen
  desen: "desen", geometri: "desen", sanat: "desen", olcu: "desen", intizam: "desen",
  // musaf
  kuran: "musaf", mushaf: "musaf", kitap: "musaf", vahiy: "musaf",
  okuma: "musaf", tilavet: "musaf",
  // cennet
  cennet: "cennet", vaat: "cennet", mumin: "cennet", ebed: "cennet", adn: "cennet",
  // orman
  orman: "orman", yesil: "orman", agac: "orman", doga: "orman",
  hayat: "orman", nimet: "orman", karinca: "orman",
};

// ★ Sahne ayırıcıları: virgül, nokta, "sonra", "arkasından", "arkadan"...
const SAHNE_AYIRICI = /[,;.]|\bsonra\b|\barkasindan\b|\barkadan\b|\bdaha sonra\b|\bsonrasinda\b/gi;

// "ayet", "ayette", "ayetler" gibi kelimeler kategori DEĞİL — taramada atlanır
const AYET_KELIME = /^ayet/;

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Kelime dizisinde havuzdan ilk eşleşmeyi bulur: önce 2'li birleşik ifadeler, sonra tek kelimeler */
function havuzTara(kelimeler: string[]): string | null {
  for (let i = 0; i < kelimeler.length - 1; i++) {
    const ikili = `${kelimeler[i]} ${kelimeler[i + 1]}`;
    if (KELIME_HAVUZU[ikili]) return KELIME_HAVUZU[ikili];
  }
  for (const w of kelimeler) {
    if (AYET_KELIME.test(w)) continue; // "ayet" kelimesinin kendisi kategori değildir
    if (KELIME_HAVUZU[w]) return KELIME_HAVUZU[w];
  }
  return null;
}

/**
 * Doğal dil metninden sahneleri çıkarır.
 *
 * 1) Ayet numarası varsa → o ayetlere doğrudan atanır.
 *    Örn: "2. ayette günbatımı, 4. ayette dağlar" → ayet 2 + ayet 4.
 * 2) Ayet numarası YOKSA → metin virgül/"sonra"/"arkadan" ile sahnelere bölünür,
 *    her sahnenin kategorisi bulunur ve SAHNELER BÜTÜN AYETLERE EŞİT PARÇALARA BÖLÜNEREK yayılır.
 *    Örn: 7 ayetlik surede 3 sahne → 1-2 / 3-4 / 5-7.
 */
export function metniAyarlaraCevir(metin: string, toplamAyet: number): AtmosferAtama[] {
  const temiz = normalize(metin);
  const kelimeler = temiz.split(" ");

  const rakamlar = ["birinci", "ikinci", "ucuncu", "dorduncu", "besinci", "altinci", "yedinci", "sekizinci", "dokuzuncu", "onuncu"];
  const numaraliAtamalar: Array<{ ayet: number; kategori: string }> = [];
  let sonAyet = 0;

  for (let i = 0; i < kelimeler.length; i++) {
    const w = kelimeler[i];
    let ayetNo = 0;

    // "2. ayette" / "2 ayet" — bulduysak "ayette" kelimesini atla (çift sayma olmasın)
    const rakamOnce = w.match(/^(\d+)[.\s]?/);
    if (rakamOnce && kelimeler[i + 1] && AYET_KELIME.test(kelimeler[i + 1])) {
      ayetNo = parseInt(rakamOnce[1], 10);
      sonAyet = ayetNo;
      const kalan: string[] = [];
      for (let j = i + 2; j < kelimeler.length; j++) {
        const w2 = kelimeler[j];
        if (/^\d+[.\s]?\d*$/.test(w2) || rakamlar.indexOf(w2) >= 0) break;
        kalan.push(w2);
      }
      const kat = havuzTara(kalan);
      if (kat && ayetNo >= 1 && ayetNo <= toplamAyet) numaraliAtamalar.push({ ayet: ayetNo, kategori: kat });
      i++; // "ayette" kelimesini atla
      continue;
    }
    // "ayet 2"
    if (AYET_KELIME.test(w) && i > 0 && /^\d+$/.test(kelimeler[i - 1])) {
      ayetNo = parseInt(kelimeler[i - 1], 10);
    }
    // "ikinci ayette"
    if (!ayetNo && rakamlar.indexOf(w) >= 0 && kelimeler[i + 1] && AYET_KELIME.test(kelimeler[i + 1])) {
      ayetNo = rakamlar.indexOf(w) + 1;
    }

    if (ayetNo >= 1 && ayetNo <= toplamAyet) {
      sonAyet = ayetNo;
      // bu ayetten sonraki kelimelerde kategori ara (yeni ayet numarasına kadar)
      const kalan: string[] = [];
      for (let j = i + 1; j < kelimeler.length; j++) {
        const w2 = kelimeler[j];
        if (/^\d+[.\s]?\d*$/.test(w2) || rakamlar.indexOf(w2) >= 0) break;
        kalan.push(w2);
      }
      const kat = havuzTara(kalan);
      if (kat) numaraliAtamalar.push({ ayet: sonAyet, kategori: kat });
    }
  }

  // ── DURUM 1: ayet numarası verildi → doğrudan atama ──
  if (numaraliAtamalar.length > 0) {
    return numaraliAtamalar.map(({ ayet, kategori }) => klipUret(kategori, ayet, ayet));
  }

  // ── DURUM 2: ayet numarası YOK → sahnelere böl, bütün videoya yay ──
  const sahneler = metin
    .split(SAHNE_AYIRICI)
    .map(s => normalize(s))
    .filter(s => s.length > 0);

  const sahneKategorileri: string[] = [];
  for (const sahne of sahneler) {
    const kat = havuzTara(sahne.split(" "));
    if (kat) sahneKategorileri.push(kat);
  }

  // hiç sahne bulunamadıysa tüm metinde tek geçiş
  if (sahneKategorileri.length === 0) {
    const kat = havuzTara(kelimeler);
    if (kat) sahneKategorileri.push(kat);
  }

  if (sahneKategorileri.length === 0) return [];

  // ★ SAHNE BÖLÜŞÜMÜ: n sahne × toplamAyet → eşit parçalar
  //   Örn: 7 ayet, 3 sahne → 1-2 / 3-4 / 5-7
  const n = sahneKategorileri.length;
  return sahneKategorileri.map((kategori, idx) => {
    const baslangic = Math.floor((idx * toplamAyet) / n) + 1;
    const bitis = Math.floor(((idx + 1) * toplamAyet) / n);
    return klipUret(kategori, baslangic, Math.max(bitis, baslangic));
  });
}

function klipUret(kategori: string, baslangic: number, bitis: number): AtmosferAtama {
  const klipler = R2_TEST_EDILMIS[kategori] || R2_TEST_EDILMIS.namaz;
  const klip = klipler[Math.floor(Math.random() * klipler.length)];
  return {
    baslangic,
    bitis,
    kategori,
    klipId: klip.id,
    url: `https://cdn.nurstudyo.com/videos/${kategori}/${klip.id}.mp4`,
    poster: `https://cdn.nurstudyo.com/posters/${kategori}/${klip.id}.jpg`,
    etiket: klip.ad,
    emoji: EMOJILER[kategori] || "🎬",
  };
}

const EMOJILER: Record<string, string> = {
  namaz: "🕋", musaf: "📖", deniz: "🌊", gece: "🌙", gunbatimi: "🌅",
  yildizlar: "✨", cicekler: "🌸", cami: "🕌", bulut: "☁️", gol: "🏞️",
  kar: "❄️", daglar: "🏔️", selale: "💧", col: "🏜️", sehir: "🏙️",
  desen: "🔷", cennet: "🌿", orman: "🌲",
};
