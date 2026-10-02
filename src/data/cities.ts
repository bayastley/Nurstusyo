export const TURKISH_CITIES: string[] = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep",
  "Şanlıurfa", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri",
  "Samsun", "Balıkesir", "Kahramanmaraş", "Van", "Aydın", "Tekirdağ", "Sakarya",
  "Denizli", "Muğla", "Eskişehir", "Erzurum", "Mardin", "Trabzon", "Malatya",
  "Ordu", "Erzincan", "Rize", "Sivas",
];

// ═══════════════════════════════════════════════════════════
// ★ DÜNYA ŞEHİRLERİ (02.10, kullanıcı emri): Nûr Araçları → Namaz Vakti
//   artık yurtdışı dahil BÜTÜN şehirleri sunar. Her kayıt: [ad, ülke, enlem, boylam].
//   • Koordinatlar aladhan.com timings API'sine doğrudan gider (timingsByCity
//     yerine) → ülke adı eşleşme riski sıfır; vakitler şehrin gerçek noktasından.
//   • Ülke etiketi listede "Mekke · Suudi Arabistan" biçiminde görünür.
//   • Liste alfabetik değil "önem + bölge" sırasında; arama kutusu zaten filtreler.
//   • method=13 (Diyanet) TR şehirlerinde korunur; yurtdışında method=2 (ISNA /
//     Kuzey Amerika) yerine 3 (MWL / Müslüman Dünya Ligi) daha evrenseldir —
//     hook şehre göre otomatik seçer.
// ═══════════════════════════════════════════════════════════
export interface SehirKayit {
  ad: string;
  ulke: string;
  lat: number;
  lon: number;
}

export const DUNYA_SEHIRLERI: SehirKayit[] = [
  // ── Kutsal topraklar & Orta Doğu ──
  { ad: "Mekke", ulke: "Suudi Arabistan", lat: 21.4225, lon: 39.8262 },
  { ad: "Medine", ulke: "Suudi Arabistan", lat: 24.4686, lon: 39.6142 },
  { ad: "Riyad", ulke: "Suudi Arabistan", lat: 24.7136, lon: 46.6753 },
  { ad: "Cidde", ulke: "Suudi Arabistan", lat: 21.4858, lon: 39.1925 },
  { ad: "Kudüs", ulke: "Filistin", lat: 31.7683, lon: 35.2137 },
  { ad: "Dubai", ulke: "BAE", lat: 25.2048, lon: 55.2708 },
  { ad: "Abu Dabi", ulke: "BAE", lat: 24.4539, lon: 54.3773 },
  { ad: "Doha", ulke: "Katar", lat: 25.2854, lon: 51.531 },
  { ad: "Kuveyt", ulke: "Kuveyt", lat: 29.3759, lon: 47.9774 },
  { ad: "Manama", ulke: "Bahreyn", lat: 26.2285, lon: 50.586 },
  { ad: "Maskat", ulke: "Umman", lat: 23.588, lon: 58.3829 },
  // ── Avrupa (diaspora yoğun) ──
  { ad: "Berlin", ulke: "Almanya", lat: 52.52, lon: 13.405 },
  { ad: "Köln", ulke: "Almanya", lat: 50.9375, lon: 6.9603 },
  { ad: "Münih", ulke: "Almanya", lat: 48.1351, lon: 11.582 },
  { ad: "Frankfurt", ulke: "Almanya", lat: 50.1109, lon: 8.6821 },
  { ad: "Hamburg", ulke: "Almanya", lat: 53.5511, lon: 9.9937 },
  { ad: "Amsterdam", ulke: "Hollanda", lat: 52.3676, lon: 4.9041 },
  { ad: "Lahey", ulke: "Hollanda", lat: 52.0705, lon: 4.3007 },
  { ad: "Brüksel", ulke: "Belçika", lat: 50.8503, lon: 4.3517 },
  { ad: "Paris", ulke: "Fransa", lat: 48.8566, lon: 2.3522 },
  { ad: "Londra", ulke: "İngiltere", lat: 51.5074, lon: -0.1278 },
  { ad: "Birmingham", ulke: "İngiltere", lat: 52.4862, lon: -1.8904 },
  { ad: "Viyana", ulke: "Avusturya", lat: 48.2082, lon: 16.3738 },
  { ad: "Zürih", ulke: "İsviçre", lat: 47.3769, lon: 8.5417 },
  { ad: "Stockholm", ulke: "İsveç", lat: 59.3293, lon: 18.0686 },
  { ad: "Kopenhag", ulke: "Danimarka", lat: 55.6761, lon: 12.5683 },
  { ad: "Oslo", ulke: "Norveç", lat: 59.9139, lon: 10.7522 },
  { ad: "Moskova", ulke: "Rusya", lat: 55.7558, lon: 37.6173 },
  // ── Balkanlar & Kafkasya ──
  { ad: "Saraybosna", ulke: "Bosna-Hersek", lat: 43.8563, lon: 18.4131 },
  { ad: "Üsküp", ulke: "Kuzey Makedonya", lat: 41.9981, lon: 21.4254 },
  { ad: "Priştine", ulke: "Kosova", lat: 42.6629, lon: 21.1655 },
  { ad: "Tiran", ulke: "Arnavutluk", lat: 41.3275, lon: 19.8187 },
  { ad: "Bakü", ulke: "Azerbaycan", lat: 40.4093, lon: 49.8671 },
  { ad: "Taşkent", ulke: "Özbekistan", lat: 41.2995, lon: 69.2401 },
  { ad: "Almatı", ulke: "Kazakistan", lat: 43.222, lon: 76.8512 },
  { ad: "Bişkek", ulke: "Kırgızistan", lat: 42.8746, lon: 74.5698 },
  { ad: "Duşanbe", ulke: "Tacikistan", lat: 38.5598, lon: 68.787 },
  { ad: "Aşkabat", ulke: "Türkmenistan", lat: 37.9601, lon: 58.3261 },
  // ── Asya ──
  { ad: "Jakarta", ulke: "Endonezya", lat: -6.2088, lon: 106.8456 },
  { ad: "Surabaya", ulke: "Endonezya", lat: -7.2575, lon: 112.7521 },
  { ad: "Kuala Lumpur", ulke: "Malezya", lat: 3.139, lon: 101.6869 },
  { ad: "Karaci", ulke: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { ad: "Lahor", ulke: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { ad: "İslamabad", ulke: "Pakistan", lat: 33.6844, lon: 73.0479 },
  { ad: "Dakka", ulke: "Bangladeş", lat: 23.8103, lon: 90.4125 },
  { ad: "Dehli", ulke: "Hindistan", lat: 28.6139, lon: 77.209 },
  { ad: "Haydarabad", ulke: "Hindistan", lat: 17.385, lon: 78.4867 },
  // ── Afrika ──
  { ad: "Kahire", ulke: "Mısır", lat: 30.0444, lon: 31.2357 },
  { ad: "İskenderiye", ulke: "Mısır", lat: 31.2001, lon: 29.9187 },
  { ad: "Kazablanka", ulke: "Marokko", lat: 33.5731, lon: -7.5898 },
  { ad: "Tunus", ulke: "Tunus", lat: 36.8065, lon: 10.1815 },
  { ad: "Cezayir", ulke: "Cezayir", lat: 36.7538, lon: 3.0588 },
  { ad: "Bağdat", ulke: "Irak", lat: 33.3152, lon: 44.3661 },
  { ad: "Şam", ulke: "Suriye", lat: 33.5138, lon: 36.2765 },
  { ad: "Beyrut", ulke: "Lübnan", lat: 33.8938, lon: 35.5018 },
  { ad: "Amman", ulke: "Ürdün", lat: 31.9454, lon: 35.9284 },
  { ad: "Sana", ulke: "Yemen", lat: 15.3694, lon: 44.191 },
  { ad: "Hartum", ulke: "Sudan", lat: 15.5007, lon: 32.5599 },
  { ad: "Moğadişu", ulke: "Somali", lat: 2.0469, lon: 45.3182 },
  { ad: "Niamey", ulke: "Nijer", lat: 13.5127, lon: 2.1128 },
  { ad: "Lagos", ulke: "Nijerya", lat: 6.5244, lon: 3.3792 },
  // ── Kuzey Amerika & Okyanusya ──
  { ad: "New York", ulke: "ABD", lat: 40.7128, lon: -74.006 },
  { ad: "Chicago", ulke: "ABD", lat: 41.8781, lon: -87.6298 },
  { ad: "Los Angeles", ulke: "ABD", lat: 34.0522, lon: -118.2437 },
  { ad: "Houston", ulke: "ABD", lat: 29.7604, lon: -95.3698 },
  { ad: "Toronto", ulke: "Kanada", lat: 43.6532, lon: -79.3832 },
  { ad: "Montreal", ulke: "Kanada", lat: 45.5019, lon: -73.5674 },
  { ad: "Sidney", ulke: "Avustralya", lat: -33.8688, lon: 151.2093 },
  { ad: "Melbourne", ulke: "Avustralya", lat: -37.8136, lon: 144.9631 },
];

/**
 * Şehir adına göre dünya kaydını bulur (büyük/küçük harf duyarsız).
 * TR şehirleri için null döner — onlar timingsByCity (country=Turkey) ile gider.
 */
export const dunyaSehriBul = (ad: string): SehirKayit | null =>
  DUNYA_SEHIRLERI.find((s) => s.ad.toLocaleLowerCase("tr") === (ad || "").toLocaleLowerCase("tr")) ?? null;
