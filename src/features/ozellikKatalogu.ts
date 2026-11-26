// ════════════════════════════════════════════════════════════
// OZELLIKKATALOGU.TS — projedeki kapısı gerçekten bağlı özellikler (26.11)
// Her satırın "id"si nur_feature_locks.feature_id olarak yazılır ve
// arayüzde gerçekten okunur (Keşfet sekmeleri, üst bar, modal kapıları).
// Yeni özellik eklerken: buraya satır + arayüzde ozellikGorunur(id) kapısı.
// ════════════════════════════════════════════════════════════

export interface OzellikSatiri {
  id: string;
  ad: string;
  aciklama: string;
  emoji: string;
  grup: string;
}

const KESFET: Array<[string, string, string, string]> = [
  ["hadis", "Hadis Bankası", "Külliyat + konu/tema araması", "📚"],
  ["menkibeler", "İslâmi Menkıbeler", "Evliya menkıbeleri, sayfa çevirmeli", "📜"],
  ["evliyalar", "Evliyalar", "Evliya biyografileri", "🌟"],
  ["siyer", "Siyer-i Nebi", "Kronolojik siyer kategorileri", "🕋"],
  ["tarih", "İslam Tarihi", "Olaylar, harita ve zaman çizgisi", "🕰️"],
  ["sahabeler", "Sahabeler", "Sahabe hayatları ve çeviri", "⭐"],
  ["kissa", "Kur'an Kıssaları", "Peygamber kıssaları", "🕌"],
  ["mezhepler", "Mezhepler", "Dört mezhep ve fıkıh özellikleri", "🏛️"],
  ["ilmihal", "İlmihal Akademisi", "41 ders, 242 madde, 131 soru", "📗"],
  ["ahlak", "Ahlâk Mektebi", "Edep ve ahlâk dersleri", "💎"],
  ["yarisma", "Bilgi Yarışması", "Seviyeli soru oyunu", "🏆"],
  ["peygamber", "Peygamberler Hayatı", "25 peygamberin hayatı", "🌙"],
  ["soru", "Soru-Cevap", "168 soruluk arşiv + soru bankası", "❓"],
  ["kelime", "Kelime Kartları", "Arapça kelime öğrenme", "🔤"],
  ["sure", "Sure Bilgileri", "114 sure: konu, fazilet, arama", "📖"],
  ["namaz", "Namaz Öğretici", "Kılınış, dualar, takip", "🧎"],
  ["dua", "Dua Rehberi", "Vakit ve durum duaları", "🤲"],
  ["adab", "Adab-ı Muaşeret", "Günlük edep kuralları", "🤝"],
  ["sunnet", "Sünnetler", "Sünnet-i seniyye listesi", "🌟"],
  ["imsakiye", "Ramazan İmsakiyesi", "İl bazlı imsak/iftar", "🌙"],
  ["hoca", "Hoca Karşılaştır", "Ayetleri hocalardan dinle", "🎧"],
  ["cami", "Cami Bulucu", "Yakındaki camiler", "📍"],
  ["rehber", "Kanal Rehberi", "Güvenilir ilim kanalları", "🚀"],
  ["tecvid", "Tecvid Rehberi", "Tecvid kuralları", "🎓"],
  ["kitaplik", "Kitaplığım", "Favoriler, notlar, ezber, takip", "🔖"],
  ["klasikEserler", "Klasik Eserler", "Klasik kaynak kitaplar", "🗂️"],
  ["kuranOkulu", "Kur'an Okulu", "Harflerden okumaya dersler", "🎓"],
  ["topluluk", "Topluluk", "Topluluk bağlantıları", "👥"],
];

const USTBAR: Array<[string, string, string, string]> = [
  ["kabe-canli", "Kâbe Canlı Yayın", "Üst barda canlı yayın düğmesi", "🕋"],
  ["kuran-bolumu", "Kur'an Öğreniyorum", "Üst barda Kur'an ekranı düğmesi", "📖"],
  ["site-arama", "Site Arama", "Üst barda arama (Ctrl+K)", "🔎"],
  ["kible", "Kıble Pusulası", "Üst barda kıble düğmesi", "🧭"],
  ["islami-ogreniyorum", "İslâmî Öğreniyorum", "Üst barda Keşfet düğmesi", "🧭"],
  ["icindekiler", "İçindekiler", "Üst barda site rehberi", "📑"],
];

const MODAL: Array<[string, string, string, string]> = [
  ["ayetKartlari", "Ayet & Dua Kütüphanesi", "616 ayet, mood filtreleri", "📚"],
  ["ayetNotlari", "Ayet Notlarım", "Ayetlere kişisel not", "📝"],
  ["ayetPaketleri", "Hazır Ayet Paketleri", "Kandil/cuma/sabır setleri", "📦"],
  ["ozelGunTakvimi", "Özel Gün Takvimi", "Kandil ve dini günler", "🗓️"],
  ["haftaninVideosu", "Haftanın Videosu", "Vitrin + oynatıcı", "🎬"],
  ["kelimeAtolyesi", "Kelime Atölyesi", "Kelime → ayet/atmosfer önerisi", "✍️"],
  ["arkaPlanUretici", "AI Arka Plan Üretici", "Metne uygun sahne üretimi", "✨"],
  ["kendiSes", "Kendi Sesinle Üret", "Ses klonlama ile üretim", "🎤"],
  ["seslendirme", "Sesli Meal", "TTS ile ayet seslendirme", "🔊"],
  ["zip", "ZIP / Medya Yükleme", "Kendi resim-ses dosyaların", "⬇️"],
];

export const OZELLIK_KATALOGU: OzellikSatiri[] = [
  ...KESFET.map(([id, ad, aciklama, emoji]) => ({ id: `kesfet:${id}`, ad, aciklama, emoji, grup: "Keşfet içerikleri" })),
  ...USTBAR.map(([id, ad, aciklama, emoji]) => ({ id: `hdr:${id}`, ad, aciklama, emoji, grup: "Üst bar düğmeleri" })),
  ...MODAL.map(([id, ad, aciklama, emoji]) => ({ id, ad, aciklama, emoji, grup: "Modüller" })),
];

export const OZELLIK_GRUPLARI = ["Keşfet içerikleri", "Üst bar düğmeleri", "Modüller"] as const;
