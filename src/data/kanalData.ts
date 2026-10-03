// ════════════════════════════════════════════════════════
// KANALDATA.TS — Keşfet > Kanal Rehberi (madde 12) — YouTube/Instagram algoritma ipuçları
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 12: KANAL REHBERİ — YouTube/Instagram algoritma ipuçları ──
export interface KanalIpucu { baslik: string; metin: string; kategori: string }
export const KANAL_REHBERI: KanalIpucu[] = [
  { kategori: "YouTube", baslik: "İlk 3 saniye kuralı", metin: "Videonun ilk 3 saniyesinde en etkileyici ayet bölümünü koy — algoritma izlenme süresine bakar, izlenme süresi yüksek olan videoya daha çok gösterim verir." },
  { kategori: "YouTube", baslik: "Başlık formülü", metin: '"[Ayet konusu] | [Sure adı] [Ayet no]" formatı kullan: "Huzur Arayanlara | Ra"d 28". Emoji başlığın başına, değil sonuna.' },
  { kategori: "YouTube", baslik: "Açıklama ve etiket", metin: "İlk satırda ayetin özeti, sonra kaynak, sonra 5-8 etiket (#kuran #ayet #huzur). Açıklamaya site linkini koy — trafik geri döner." },
  { kategori: "YouTube", baslik: "Shorts döngüsü", metin: "Shorts videolarını 30-45 saniye yap; döngüsel his veren (sonu başla uyumlu) videolar tekrar izlenir ve algoritma bunu ödüllendirir." },
  { kategori: "Instagram", baslik: "Reels + Carousel ikilisi", metin: "Reels ile dikkat çek, carousel (4:5 ayet kartları) ile kaydet — kaydedilen gönderi algoritmada en güçlü sinyaldir." },
  { kategori: "Instagram", baslik: "Sabit hikaye", metin: "En iyi videonuzu 'Öne Çıkanlar'a sabitleyin; profil ziyaretçisi ilk 10 saniyede ne yaptığınızı görsün." },
  { kategori: "Instagram", baslik: "Paylaşılabilir açıklama", metin: "»Bir kardeşine ilet» gibi nazik paylaşım çağrısı paylaşımı artırır; zorlamayan cümleler daha çok paylaşılır." },
  { kategori: "Genel", baslik: "Düzenli saat", metin: "Her gün aynı saatte paylaş (öneri: sabah 07-08 veya yatsı sonrası 21-22). Topluluk alışkanlığı algoritmadan da önemlidir." },
  { kategori: "Genel", baslik: "Özel günler", metin: "Cuma günleri ve kandil gecelerinde paylaşımlar 3-5 kat daha çok etkileşim alır — Özel Gün Takvimi'ni takip et." },
  { kategori: "Genel", baslik: "Telif güvenliği", metin: "Sitedeki videolar telifsiz şablonlar + izinli kari kayıtlarıyla üretilir; yine de YouTube Content ID bazlı uyarı çıkabilir — itiraz mektubu hazır bulundur." },
];
