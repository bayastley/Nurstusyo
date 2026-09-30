// ════════════════════════════════════════════════════════
// ROADMAPVERI.TS — Yol haritası ikon tablosu + V2/V3 özellik tanımları
// RoadmapModal.tsx'den ayrıldı (SRP adım 3, 30.09)
// ════════════════════════════════════════════════════════

export interface Feature {
  iconId: string;
  title: string;
  desc: string;
  tag: string;
  votes: number;
  id: string;
  active: boolean;
}

// ★ Icon'lar string olarak tutulur — JSON.parse'ta kaybolmaz
export const ICON_EMOJI: Record<string, string> = {
  ai_meal: "🧠", kendi_ses: "🎤", kelime_video: "✍️", ai_arkaplan: "✨",
  push: "🔔", ucretsiz_deneme: "🎁", referans: "👥", arsiv: "🌐",
  e_fatura: "💳", meal_dinle: "🎧", mobil: "📱", koleksiyon: "🔖",
  notlar: "📝", seriler: "🎬", reklam: "🛡️", coklu_kullanici: "👥", api: "⚡", kurumsal: "👑",
  namaz_bildirim: "🕌", zikirmatik: "📿", hatim: "📖", seri_uretim: "⚡", uyku_tilaveti: "🌙", kandil: "🌟",
  akilli_radyo: "📻",
  hafizlik_testi: "🧠", paket: "📦", takvim: "📅", tefsir: "📚", latin: "🔤", kanal: "🚀",
  cami: "🕌", kible: "🧭", hediye: "🎁", whatsapp: "💬",  kelime_kartlari: "🔤", wbw_video: "📖", soru: "❓",
  hoca: "🎧", seri: "🔥", gece: "🌙", oruc: "🌙", toplu: "⬇️", mushaf: "📖", tajvid: "🎓",
  hafta_video: "🎬", offline: "📥", uretici_ist: "📊", cocuk: "🎈", telaffuz: "🗣️", widget: "🖥️",
  cok_dilli: "🌐", foto_hat: "🖼️",
};
export function getIcon(id: string): string {
  return ICON_EMOJI[id] || "✨";
}

const DEFAULT_V2: Omit<Feature, "votes">[] = [
  // ★ 28 EYLÜL KURALI (kullanıcı kararı): OYLAMADA YALNIZ 10 ÇEKİRDEK ÖZELLİK —
  //   "para kazandıracak + kullanıcıyı sitede tutan + tam ihtiyaç" ölçütü:
  //   5 üretim/viral (kelime-video, ai-arkaplan, wbw_video, ayet-kutuphanesi, whatsapp-kart)
  //   + 3 alışkanlık (devam-serisi, bugun-hediye, hafizlik-testi)
  //   + 2 dönüşüm (referans, ucretsiz-deneme).
  //   Diğer her şey V3 uzun vadeli bölümde KALICI olarak durur (silinmedi).
  { id: "kelime-video", iconId: "kelime_video", title: "Kelime Atölyesi", desc: "Tek kelime yaz: ayet önerileri, atmosfer ve video taslağı tek tıkla gelir.", tag: "V2", active: true },
  { id: "ai-arkaplan", iconId: "ai_arkaplan", title: "AI Arka Plan Üretici", desc: "Yazdığın metnin ruhuna uygun arka plan sahnesi üretir, stüdyoya aktarırsın.", tag: "V2", active: true },
  { id: "wbw_video", iconId: "wbw_video", title: "Video Üzerinde Kelime Kelime (WbW)", desc: "Okunan ayetin kelimeleri videoda tek tek vurgulanır — dinlerken anlamı takip et.", tag: "V2", active: true },
  { id: "ayet-kutuphanesi", iconId: "arsiv", title: "Ayet & Dua Kütüphanesi", desc: "616 ayet, 13 mood filtresi, Günün Ayeti ve kart tasarımı — tamamı çalışıyor.", tag: "V2", active: true },
  { id: "whatsapp-kart", iconId: "whatsapp", title: "WhatsApp Ayet Kartı", desc: "9:16 dikey ayet kartı üret; durum ve hikaye boyutunda tek tuşla paylaş.", tag: "V2", active: true },
  { id: "devam-serisi", iconId: "seri", title: "Günlük Devam Serisi", desc: "Üst üste üretim günlerin seriyi büyütür — alev kaybolmasın!", tag: "V2", active: true },
  { id: "bugun-hediye", iconId: "hediye", title: "Günlük Sürpriz Hediye", desc: "Her gün girişte üretim hakkı ya da jeton sürprizi — sadaka-i cariye motoru.", tag: "V2", active: true },
  { id: "hafizlik-testi", iconId: "hafizlik_testi", title: "Hafızlık Testi", desc: "Ayeti tamamla testiyle hafızanı sına; seviye atladıkça sorular zorlaşır.", tag: "V2", active: true },
  { id: "referans", iconId: "referans", title: "Arkadaşını Davet Et", desc: "Davet ettiğin her arkadaşta ikinize de üretim hakkı; kademele Tohum'dan Orman'a.", tag: "V2", active: true },
  { id: "ucretsiz-deneme", iconId: "ucretsiz_deneme", title: "7 Gün Ücretsiz PRO Denemesi", desc: "Bütün güç keşfetme şansı — kredi kartı gerekmez, otomatik başlar.", tag: "V2", active: true },
];

const DEFAULT_V3: Omit<Feature, "votes">[] = [
  // ★ V3 = UZUN VADELİ PLANLAR — oylamada DEĞİL; büyük/kod-olmayan işler burada durur.
  { id: "ai-meal", iconId: "ai_meal", title: "AI Meal Seslendirme", desc: "Ayetlerin anlamını doğal bir sesle dinle. Bir sure seç, kendi meal videonu dakikalar içinde hazırla.", tag: "V3", active: true },
  { id: "kendi-ses", iconId: "kendi_ses", title: "Kendi Sesinle Seslendirme", desc: "Kendi anlatım tarzını videolarına taşı. Sesini seçtiğin ayetlerle buluştur.", tag: "V3", active: true },
  { id: "e-fatura", iconId: "e_fatura", title: "Satın Alımlarda E-Fatura", desc: "Ödeme sonrası faturaların otomatik hazırlanması; aradığını tek yerde bul.", tag: "V3", active: true },
  { id: "kurumsal", iconId: "kurumsal", title: "Kurumsal Üyelik ve Ajans", desc: "Camiler, yayıncılar ve medya ekipleri için toplu üretim paketleri.", tag: "V3", active: true },
  { id: "mushaf-gorunumu", iconId: "mushaf", title: "Mushaf Görünümü", desc: "Gerçek mushaf sayfası gibi ayet sayfaları — sayfa çevirme hissiyle okuma.", tag: "V3", active: true },
  { id: "tajvid", iconId: "tajvid", title: "Tajvid Eğitimi", desc: "Harf harf tecvid kuralları: uzatma, gunne, gırla — renkli işaretlerle öğrenme.", tag: "V3", active: true },
  { id: "haftanin-videosu", iconId: "hafta_video", title: "Haftanın Videosu", desc: "En beğenilen üretimler her hafta vitrinde; topluluğa ilham versin.", tag: "V3", active: true },
  { id: "offline-mod", iconId: "offline", title: "Çevrimdışı Kullanım", desc: "İnternet yokken bile okunan sayılar, seçilen ayetler ve kartlar cebinde kalsın.", tag: "V3", active: true },
  { id: "uretici-istatistik", iconId: "uretici_ist", title: "Üretici İstatistikleri", desc: "Kaç video, hangi sure, hangi atmosfer — kendi üretim grafiğini gör.", tag: "V3", active: true },
  // Çocuklar İçin Yarışma KALDIRILDI (kullanıcı kararı 28.09 — sitede olmayacak)
  { id: "telaffuz", iconId: "telaffuz", title: "Telaffuz Eğitimi", desc: "Harfleri doğru çıkarmak için sesli örneklerle telaffuz pratiği.", tag: "V3", active: true },
  { id: "masaustu-widget", iconId: "widget", title: "Masaüstü Widget", desc: "Günün ayeti ve namaz vakti ekranında dursun — widget desteği.", tag: "V3", active: true },
  { id: "cok-dilli-meal", iconId: "cok_dilli", title: "Çok Dilli Meal Paketi", desc: "İngilizce, Endonezce ve daha fazlası — ayet kartlarına çok dilli meal.", tag: "V3", active: true },
  { id: "foto-hat-karti", iconId: "foto_hat", title: "Fotoğraf ve Hat Sanatı Kartı", desc: "Kendi fotoğrafının üzerine hat sanatı ayet — bireysel, sanatsal kartlar.", tag: "V3", active: true },
  { id: "mobil-uygulama", iconId: "mobil", title: "Cebindeki Kur'an Stüdyosu", desc: "İlham nerede gelirse gelsin, üretim orada başlasın. Telefonundan hazırla, indir ve paylaş.", tag: "V3", active: true },
  { id: "koleksiyonlar", iconId: "koleksiyon", title: "Ayet Koleksiyonları", desc: "Sana dokunan ayetleri tek bir yerde biriktir. Huzur, sabır veya şükür gibi kendi koleksiyonlarını oluştur.", tag: "V3", active: true },
  { id: "icerik-serileri", iconId: "seriler", title: "Temalı İçerik Serileri", desc: "Tek bir ayetten fazlasını anlat. Sabırdan şükre, her tema için izlenebilir ve paylaşılabilir video serileri hazırla.", tag: "V3", active: true },
  { id: "reklam", iconId: "reklam", title: "Ücretsiz Üretime Destek", desc: "Daha fazla kişi Nûr Stüdyo'ya ulaşsın, ücretsiz üretim imkânı büyüsün. Pro deneyim ise reklamsız kalsın.", tag: "V3", active: true },
  { id: "coklu-kullanici", iconId: "coklu_kullanici", title: "Birlikte Üretim Alanı", desc: "Ailen, arkadaşların veya ekibinle aynı üretim alanında buluş. Herkes kendi hesabıyla, ortak bir amaçla.", tag: "V3", active: true },
  { id: "api", iconId: "api", title: "Toplu İçerik ve API", desc: "Tek tek uğraşmadan yüzlerce içeriği planla. Camiler, yayıncılar ve medya ekipleri için güçlü otomasyon.", tag: "V3", active: true },
  { id: "seri-uretim", iconId: "seri_uretim", title: "Seri Üretim (Çoklu Ayet Videosu)", desc: "Onlarca ayet seç, hepsine tek tasarımı uygula, videolar sırayla kendiliğinden hazır olsun.", tag: "V3", active: true },
  // ★ 28.09: oylama 10'a indirildi — aşağıdaki 25 madde oylamadan V3 uzun vadeye taşındı (SİLİNMEDİ, burada kalıcı)
  { id: "akilli-radyo", iconId: "akilli_radyo", title: "Bölgeye Akıllı Radyo", desc: "16 canlı kanal: tilavet, sohbet, hadis — bulunduğun bölgeye göre önerilir.", tag: "V3", active: true },
  { id: "zikirmatik", iconId: "zikirmatik", title: "Zikirmatik ve Topluluk Sayacı", desc: "Salavatını, tespihini siteden çek; topluluk sayısı ekranda canlı büyüsün.", tag: "V3", active: true },
  { id: "hatim-takibi", iconId: "hatim", title: "Hatim ve Cüz Haritası", desc: "Okuduğun cüzleri işaretle, hatim ilerlemen yüzde olarak kayıt altında.", tag: "V3", active: true },
  { id: "uyku-tilaveti", iconId: "uyku_tilaveti", title: "Uyku Tilaveti", desc: "Yatarken sure seç, zamanlayıcıyı kur, sessizce dinle.", tag: "V3", active: true },
  { id: "kandil-sayfasi", iconId: "kandil", title: "Ramazan ve Kandil Sayfası", desc: "Kandil gecelerinde site süslenir; oruç takibi, imsak ve ibadet önerisi hazır gelir.", tag: "V3", active: true },
  { id: "namaz-bildirim", iconId: "namaz_bildirim", title: "Namaz Vakti Hatırlatıcısı", desc: "Şehrini seç, vakit gelince tarayıcından nazik bir hatırlatma al.", tag: "V3", active: true },
  { id: "push", iconId: "push", title: "Akıllı Push Bildirimi", desc: "Cuma, kandil ve özel geceleri kaçırma — doğru zamanda küçük hatırlatma.", tag: "V3", active: true },
  { id: "meal-dinle", iconId: "meal_dinle", title: "Ekransız Meal Dinleme", desc: "Gözlerini kapat, sadece dinle — ekransız tilavet modu.", tag: "V3", active: true },
  { id: "ayet-notlari", iconId: "notlar", title: "Ayet Notlarım", desc: "Seçtiğin ayetlere kendi notunu ekle; manevi arşivin cihazında şifreli durur.", tag: "V3", active: true },
  { id: "ayet-paketleri", iconId: "paket", title: "Hazır Ayet Paketleri", desc: "Kandil, cuma, sabır ve daha fazlası — tek tıkla paketlenmiş ayet setleri.", tag: "V3", active: true },
  { id: "ozel-gun-takvimi", iconId: "takvim", title: "Özel Gün Takvimi", desc: "Cuma, kandil ve mübarek geceler günü gününe; temaya hazır video önerisi gelir.", tag: "V3", active: true },
  { id: "hadisler", iconId: "push", title: "Hadis Bankası", desc: "Sahih, hasan ve zayıf etiketli hadis bankası — derecesi ve kaynağıyla ara, videoya taşı.", tag: "V3", active: true },
  { id: "kissalar", iconId: "seriler", title: "Kıssa ve Hikayeler", desc: "Peygamber kıssaları ve ibretli hikayeler — her kıssanın bir dersi var.", tag: "V3", active: true },
  { id: "dualar-zikirler", iconId: "notlar", title: "Dua Rehberi", desc: "Doğum, yolculuk, hastalık... her durumun duası ve günlük zikir listeleri.", tag: "V3", active: true },
  { id: "tefsir", iconId: "tefsir", title: "Elmalılı Tefsiri", desc: "Ayetin altında Elmalılı Hamdi Yazır tefsiri — oku, anla, videoya taşı.", tag: "V3", active: true },
  { id: "latin-okunus", iconId: "latin", title: "Latin Okunuş", desc: "Arapça bilmeyen için harf harf okunuş — tilavete kolay başlangıç.", tag: "V3", active: true },
  { id: "kanal-rehberi", iconId: "kanal", title: "Kanal Rehberi", desc: "Huzur, tilavet, sohbet kanalları tek listede — keşfet ekranından erişilir.", tag: "V3", active: true },
  { id: "cami-bulucu", iconId: "cami", title: "Cami Bulucu", desc: "Yakınındaki camileri haritada bul; adres ve mesafe bilgisiyle.", tag: "V3", active: true },
  { id: "kible", iconId: "kible", title: "Kıble Pusulası", desc: "Bulunduğun yere göre kıble yönü ve açısı — pusula ekranı.", tag: "V3", active: true },
  { id: "kelime-kartlari", iconId: "kelime_kartlari", title: "Kur'an Kelime Kartları", desc: "En sık geçen 40 kelime, anlamı ve örneğiyle — Kur'an'ı anlamaya giriş.", tag: "V3", active: true },
  { id: "soru-cevap", iconId: "soru", title: "Soru-Cevap Arşivi", desc: "Abdest, oruç, zekât... Diyanet kaynaklı kısa ve güvenilir cevaplar.", tag: "V3", active: true },
  { id: "hoca-karsilastir", iconId: "hoca", title: "Hoca Ses Karşılaştırma", desc: "İki kâriyi yan yana dinle; videona en uygun sesi seç.", tag: "V3", active: true },
  { id: "gece-mushafi", iconId: "gece", title: "Gece Mushafı", desc: "Gözü yormayan kehribar temasıyla gece okuması.", tag: "V3", active: true },
  { id: "oruc-takibi", iconId: "oruc", title: "Oruç Takibi", desc: "Ramazan günlerini işaretle; tuttuğun oruçları takip et.", tag: "V3", active: true },
  { id: "toplu-indirme", iconId: "toplu", title: "Üç Format Tek İndirme", desc: "ELİT üyelikle 9:16, 1:1 ve 16:9 formatlarını tek seferde indir.", tag: "V3", active: true },
];

export { DEFAULT_V2, DEFAULT_V3 };

// ★ Depolama yardımcıları (RoadmapModal'dan, SRP adım 3) — localStorage + DEFAULT birleştirme
const STORAGE_KEY = "nur_roadmap_data_v9";
const VOTE_KEY = "nur_roadmap_votes";
const DEADLINE_KEY = "nur_roadmap_deadline";

export function loadFeatures(): { v2: Feature[]; v3: Feature[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    v2: DEFAULT_V2.map((feature) => ({ ...feature, votes: 0 })),
    v3: DEFAULT_V3.map((feature) => ({ ...feature, votes: 0 })),
  };
}

export function saveFeatures(data: { v2: Feature[]; v3: Feature[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function getStoredVotes(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(VOTE_KEY) || "{}"); } catch { return {}; }
}

export function getDeadline(): string {
  try { return localStorage.getItem(DEADLINE_KEY) || ""; } catch { return ""; }
}
