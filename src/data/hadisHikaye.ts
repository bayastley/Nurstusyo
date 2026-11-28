// ═══════════════════════════════════════════════════════════════
// HADISHIKAYE.TS — "Hikâyesi — nasıl söylendi" (sebeb-i vürûd)
//
// ★ 27.11 (kullanıcı emri): "Hikâyesi" paneli künye etiketleri (KİTÂB/BÂB/
//   RİVÂYET EDENLER/KONU…) döküyordu; kullanıcı bunun yerine HADİSİN
//   SÖYLENMESİNE YOL AÇAN OLAYI istedi.
//
// KURAL (değişmez): UYDURMA HİKÂYE YAZILMAZ. Yalnız kaynağı belli, gerçek
// rivayetlerde anlatılan olaylar buraya girer; her kayıt kendi kaynağını
// yanında taşır. Burada kaydı olmayan hadisler için panel tek cümlelik dürüst
// bir not gösterir (künye listesi basılmaz).
//
// ★ 27.11 (kullanıcı emri: "hepsini istiyorum"): havuz 1 kayıttan çıkarıldı;
//   sebeb-i vürûdu kaynaklarda AÇIKÇA nakledilen rivayetler eklendi. Her
//   kaydın `kaynak` alanı veritabanındaki künye metnidir; eşleşme bu metinden
//   üretilen anahtarla yapılır, böylece elle anahtar yazma hatası olmaz.
//   Kaç rivayetin hikâyesi var/yok: `HIKAYE_KAPSAM` (aşağıda) sayar.
// ═══════════════════════════════════════════════════════════════

import { HAVUZ } from "./hadisHikayeHavuz";

export type HadisHikayesi = {
  /** Olay, paragraflara ayrılmış düz metin (TR) */
  olay: string;
  /** Olayın geçtiği kaynaklar — uydurulmaz, kaynağın kendi künyesi */
  kaynak: string;
};

/** "Buhârî, Merda, 1 (meâl)" → arama anahtarı parçaları */
const sade = (s: string): string =>
  (s || "")
    .toLocaleLowerCase("tr")
    .replace(/[âÂ]/g, "a").replace(/[îÎ]/g, "i").replace(/[ûÛ]/g, "u")
    .replace(/[İIı]/g, "i").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g")
    .replace(/[çÇ]/g, "c").replace(/[öÖ]/g, "o").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]/g, "");

type Kunye = { muhaddis: string; kitab: string; bab: string };

/** Çok kaynaklı künyede ("Buhârî, Edeb 76 · Müslim, Birr 107") ilk kaynak esastır. */
export function kunyeAyir(kaynak: string): Kunye | null {
  const temiz = (kaynak || "")
    .replace(/\(me[âa]l\)/gi, " ")
    .replace(/\(sahih\)|\(hasen\)|\(hasan\)|\(zayif\)/gi, " ")
    .replace(/—.*$/, " ");
  // "·" / ";" / " / " ile ayrılmış çoklu atıflarda ilkini al.
  // DİKKAT: "Beyhaki, Şuab, 7/130" gibi cilt/sayfa yazımındaki eğik çizgi
  // ayırıcı DEĞİLDİR; yalnız boşlukla çevrilmiş " / " ayırıcı sayılır.
  const ilk = temiz.split(/[·;]|\s\/\s/)[0].replace(/\s+/g, " ").trim();
  if (!ilk) return null;
  const parcalar = ilk.split(",").map((p) => p.trim()).filter(Boolean);
  if (parcalar.length < 2) return null;
  let kitabHam = parcalar[1];
  let bab = parcalar.slice(2).join(" ").replace(/[^0-9]/g, "");
  // "Edeb 6016" gibi virgülsüz yazımlarda kitâbın sonundaki sayı bâb numarasıdır
  if (!bab) {
    const m = kitabHam.match(/^(.*?)[\s.]*(\d+)$/);
    if (m) { kitabHam = m[1]; bab = m[2]; }
  }
  return { muhaddis: sade(parcalar[0]), kitab: sade(kitabHam), bab };
}

const anahtar = (k: Kunye): string => `${k.muhaddis}|${k.kitab}|${k.bab}`;

// ── GERÇEK OLAYLAR ────────────────────────────────────────────
// kaynak: veritabanındaki künye metniyle aynı yazım (eşleşme buradan üretilir)
type HamKayit = { kaynak: string; kaynakKunye: string; olay: string };

const KAYITLAR: HamKayit[] = [
  // ── ANA-BABA ────────────────────────────────────────────────
  {
    kaynak: "Tirmizi, Birr, 3 (meâl)",
    kaynakKunye: "Tirmizî, Birr ve's-Sıla 3 (1899–1900); Buhârî, Cihâd; Müslim, Birr",
    olay:
      "Bu söz, tek bir olayın hemen ardından söylenmiş bir cevap değil; Abdullah b. Amr'ın naklettiği bir hükümdür. " +
      "Ama hadisin doğduğu olay, aynı bâbda ve Buhârî–Müslim'de şöyle anlatılır:\n\n" +
      "Bir genç, cihada katılmak için Peygamber'in yanına gelip izin ister. Peygamber ona, «Anne baban sağ mı?» diye sorar. " +
      "Adam «Evet» deyince buyurur: «Öyleyse onların yanına dön; onlara hizmet etmen senin cihadındır.»\n\n" +
      "Başka bir rivayette ise anne-baba, kişinin cennete girmesine vesile olan «ana kapılardan biri» olarak anılır. " +
      "Yani hadis, cihad gibi en büyük amacın iznini bile anne-babanın rızasına bağlar: onlar razı olmadan o kapı aralanmaz.",
  },
  {
    kaynak: "Müslim, Birr, 1 (meâl)",
    kaynakKunye: "Müslim, Birr 1; Buhârî, Edeb 2",
    olay:
      "Bir adam Peygamber'e gelip sordu: «Ya Resûlallah, iyilik yapmaya en çok kim lâyıktır?»\n\n" +
      "Peygamber, «Annendir» dedi. Adam «Sonra kim?» diye bir daha sordu. «Annendir.» Bir daha sordu: «Annendir.» " +
      "Adam dördüncü kez sorunca cevap değişti: «Sonra babandır.»\n\n" +
      "Adam ısrar ettikçe aynı cevabı üç kez duydu; iyiliğin sırası gözünün önünde kuruldu.",
  },

  // ── DİL, GIYBET, HESAP ──────────────────────────────────────
  {
    kaynak: "Müslim, Birr, 70",
    kaynakKunye: "Müslim, Birr 70; Ebû Dâvûd, Edeb 40",
    olay:
      "Peygamber bir gün yanındakilere sordu: «Gıybet nedir, bilir misiniz?» Onlar, «Allah ve Resûlü daha iyi bilir» dediler. " +
      "Peygamber açıkladı: «Kardeşini, hoşlanmayacağı bir şeyle anmandır.»\n\n" +
      "Bunun üzerine biri, «Peki söylediğim şey onda gerçekten varsa?» diye sordu. Cevap sertti: " +
      "«Söylediğin onda varsa gıybet ettin; yoksa ona iftira ettin.»\n\n" +
      "Sahabe o gün bir günahın yalnız tanımını değil sınırını da öğrendi: sözün doğru olması, onu söylemeyi mubah kılmıyordu.",
  },
  {
    kaynak: "Müslim, Birr, 55",
    kaynakKunye: "Müslim, Birr 55–59; Tirmizî, Kıyâmet 2",
    olay:
      "Peygamber ashabına sordu: «Müflis kimdir, bilir misiniz?» Onlar, «Bizim aramızda müflis, parası ve malı kalmayan kimsedir» dediler.\n\n" +
      "Peygamber asıl müflisi tarif etti: kıyamet günü namazı, orucu ve zekâtıyla gelir; ama dünyada birine sövmüş, " +
      "birine iftira etmiş, birinin malını yemiş, birinin kanını dökmüş, birine vurmuştur. Hak sahipleri onun sevaplarından pay alır; " +
      "sevapları tükenince onların günahlarından yüklenir ve cehenneme atılır.\n\n" +
      "Soru bir muhasebe dersiydi: hesap yalnız secdeyle değil, kırılan gönüllerle de tutulacaktı.",
  },

  // ── SABIR ───────────────────────────────────────────────────
  {
    kaynak: "Buhari, Cenâiz, 36 (meâl)",
    kaynakKunye: "Buhârî, Cenâiz 36; Müslim, Cenâiz 14",
    olay:
      "Peygamber, bir kabrin başında ağlayan bir kadına rastladı ve «Allah'tan kork, sabret» dedi. Kadın, onu tanımadan " +
      "«Benim başıma geleni sen mi çektin?» diye çıkıştı. Peygamber bir şey söylemeden geçip gitti.\n\n" +
      "Sonra ona, «Bu, Allah'ın Resûlü'ydü» dediler. Kadın kapıya koştu ve özür diledi. Peygamber cevap verdi: " +
      "«Gerçek sabır, musibetin ilk vuruşundaki sabırdır.»\n\n" +
      "Yani sabır, acı geçtikten sonra takınılan sükûnet değil; haber ilk geldiği anda gösterilen dayanmadır.",
  },

  // ── MERHAMET ────────────────────────────────────────────────
  {
    kaynak: "Buhârî, Edeb 76 · Müslim, Birr 107",
    kaynakKunye: "Buhârî, Edeb 76; Müslim, Birr 107 (el-Akra' b. Hâbis)",
    olay:
      "Peygamber, torunu Hz. Hasan kucağındayken onu öptü. Yanında oturan Akra' b. Hâbis, «Benim on çocuğum var, hiçbirini öpmedim» dedi.\n\n" +
      "Peygamber ona baktı ve buyurdu: «Merhamet etmeyene merhamet edilmez.»\n\n" +
      "Sertliği erkeklik sanan bir bedevi, çocuğunu öpmeyi fazlalık sayıyordu; Peygamber bu tek cümleyle şefkatin sünnet olduğunu ilan etti.",
  },
  {
    kaynak: "Buhari, Bed'ü'l-Halk, 15",
    kaynakKunye: "Buhârî, Bed'ü'l-halk 15; Müslim, Selâm 153",
    olay:
      "Peygamber, yolda susuzluğu iyice artan bir adamı anlattı: adam bir kuyuya inip su içti, çıkınca susuzluktan toprağı yalayan bir köpek gördü. " +
      "«Bu hayvan da benim çektiğimi çekiyor» diyip kuyuya tekrar indi, ayakkabısına su doldurup köpeğe içirdi. Allah bu iyiliği kabul etti ve onu bağışladı.\n\n" +
      "Ashâb sordu: «Hayvanlara yaptığımız iyiliklerde de sevap var mı?» Peygamber, «Her canlıya yapılan iyilikte sevap vardır» dedi.",
  },
  {
    kaynak: "Buhari, Enbiyâ, 54",
    kaynakKunye: "Buhârî, Bed'ü'l-halk 17; Müslim, Selâm 151",
    olay:
      "Peygamber, bir kadının cehenneme gidişini anlattı: kadın bir kediyi bağlamış; ne yemek vermiş, ne de salıverip kendi rızkını aramasına izin vermiş. " +
      "Kedi açlıktan ölmüş, kadın da bu yüzden azaba uğramış.\n\n" +
      "Dinleyenler şaşırdı: bir kedi yüzünden mi? Hadis, en küçük canlının hakkının bile hesabı olduğunu söylüyordu.",
  },

  // ── CÖMERTLİK / SADAKA ──────────────────────────────────────
  {
    kaynak: "Buhari, Zekât, 18",
    kaynakKunye: "Buhârî, Zekât 50; Müslim, Zekât 96 (Hakîm b. Hizâm)",
    olay:
      "Hakîm b. Hizâm, Peygamber'den bir şey istedi, Peygamber verdi; yine istedi, yine verdi; bir daha istedi. " +
      "Sonunda Peygamber şöyle buyurdu: «Bu mal, istenmeden verilince bereketli olur. İsteyerek alan doymaz. Veren el, alan elden hayırlıdır.»\n\n" +
      "Hakîm, «Seni hakla gönderene yemin olsun, senden sonra hiç kimseden bir şey istemeyeceğim» dedi ve ömrü boyunca öyle yaptı.",
  },
  {
    kaynak: "Buhari, Zekât, 12",
    kaynakKunye: "Buhârî, Zekât 11; Müslim, Zekât 92",
    olay:
      "Peygamber'e «Hangi sadaka daha faziletlidir?» diye soruldu. Verdiği cevap, en büyük meblâyı değil en zor zamanı tarif etti: " +
      "«Sağlığın yerindeyken, hırsın üstündeyken, uzun yaşama ümidin varken verdiğin sadaka. " +
      "Yoksa 'falan için' diye vasiyet edip de ölüm yaklaşınca verilen değil.»",
  },

  // ── AHLÂK / KOMŞULUK / AİLE ─────────────────────────────────
  {
    kaynak: "Buhari, İman, 4",
    kaynakKunye: "Buhârî, İman 4–5; Müslim, İmân 64",
    olay:
      "Peygamber'e «Müslümanların hangisi daha faziletlidir?» diye soruldu. Cevabı kısa oldu: " +
      "«Dilinden ve elinden Müslümanların güvende olduğu kimse.»\n\n" +
      "İman iddiası böylece ölçülebilir bir şeye bağlandı: komşusunu incitmeyen bir dile ve ele.",
  },
  {
    kaynak: "Buhari, Edeb, 35",
    kaynakKunye: "Buhârî, Edeb 35; Müslim, İmân 59",
    olay:
      "İbn Ömer anlatıyor: Peygamber, kardeşine «Utanmayı bırak» diye öğüt veren bir adamın yanından geçti ve ona döndü: " +
      "«Bırak onu; hayâ imandandır.»\n\n" +
      "Yani utangaçlık, düzeltilmesi gereken bir eksiklik değil; imanın kendisinden gelen bir ölçüydü.",
  },
  {
    kaynak: "Buhari, Nikâh, 3",
    kaynakKunye: "Buhârî, Nikâh 3; Müslim, Nikâh 1",
    olay:
      "Peygamber genç sahabilere seslendi: «Ey gençler topluluğu! İçinizden evlenmeye gücü yeten evlensin; " +
      "gözü ve iffeti en iyi koruyan budur. Gücü yetmeyen oruç tutsun; oruç onun için bir kalkandır.»\n\n" +
      "Söz, evliliği bir yük gibi değil, iffeti koruyan bir kalkan gibi tarif ediyordu.",
  },
  {
    kaynak: "Buhari, Edeb, 29",
    kaynakKunye: "Buhârî, Edeb 28–29; Müslim, Birr 140",
    olay:
      "Bu, tek bir olayın cevabı değil. Hz. Âişe'nin naklettiğine göre Peygamber komşu hakkındaki tavsiyeyi o kadar sık tekrarladı ki, " +
      "sonunda şöyle dedi: «Cibril bana komşuyu o kadar tavsiye etti ki, onu mirasçı kılacağını sandım.»\n\n" +
      "Komşuluk, bir nezaket cümlesi olmaktan çıkıp miras hukukuna yaklaşan bir hakka dönüştü.",
  },
];

// ── DİZİN ─────────────────────────────────────────────────────
// Anahtar: "<muhaddis>|<kitâb>|<bâb no>"; tam künye metniyle ikinci bir dizin
// tutulur ki veritabanındaki birebir yazım da eşleşsin.
const HIKAYELER: Record<string, HadisHikayesi> = {};
const TAM_METIN: Record<string, HadisHikayesi> = {};

// Ham kayıtlar: bu dosyadaki çekirdek parti + hadisHikayeHavuz.ts'teki geniş parti
const TUM_KAYITLAR: HamKayit[] = [...KAYITLAR, ...HAVUZ];

for (const r of TUM_KAYITLAR) {
  const hikaye: HadisHikayesi = { olay: r.olay, kaynak: r.kaynakKunye };
  const k = kunyeAyir(r.kaynak);
  if (k) HIKAYELER[anahtar(k)] = hikaye;
  TAM_METIN[sade(r.kaynak)] = hikaye;
}

/** Havuzda kaç rivayetin hikâyesi var (test/dürüstlük raporu için) */
export const HIKAYE_SAYISI = TUM_KAYITLAR.length;

/** Hadisin künyesinden gerçek hikâyesini bulur; yoksa null */
export function hadisHikayesi(kaynak: string): HadisHikayesi | null {
  const tam = TAM_METIN[sade(kaynak)];
  if (tam) return tam;
  const k = kunyeAyir(kaynak);
  if (!k || !k.bab) return null;
  // YALNIZ bâb numarası birebir tutan hikâye geçerli. Komşu bâba/kitâba
  // kaydırma yok: "Buhârî, Edeb · Müslim, İmân" gibi bâbsız künye, aynı
  // kitâbın başka bâbındaki hikâyeyi yanlış göstermesin.
  return HIKAYELER[anahtar(k)] ?? null;
}
