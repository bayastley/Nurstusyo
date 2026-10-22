// ════════════════════════════════════════════════════════
// ASİSTAN MEGA BİLGİ TABANI (22.10) — kural motoruna ikinci
// kural havuzu → "bilmiyorum" oranını aşağı çeker.
// KAYNAKLAR: tier.ts, premiumModalHelpers.ts, pricingData.ts,
// KOD-HARİTASI.md, site modalları. Güvenlik kapısı
// asistanCevap.ts'te kalır ve buraya TAŞINMAZ.
// ════════════════════════════════════════════════════════

import type { AsistanRule } from "./asistanCevap";

export const ASISTAN_BILGI_KURALLARI: AsistanRule[] = [
  // ── ÜRETİM ──
  {
    id: "uret-limit",
    anahtar: ["gunluk hak", "gunluk kota", "gunde kac video", "kac kisa", "kac uzun", "uretim limiti", "gunluk uretim", "kac video uretebilir"],
    cevap: "Günlük üretim hakları: FREE günde 3 kısa video (59 sn), PRO günde 8 kısa + 3 uzun (600 sn), ELİT günde 15 kısa + 5 uzun + 1 tam sure sürümü (120 dk'ya kadar). Haklar her gece yenilenir. 💎",
  },
  {
    id: "sure-modu",
    anahtar: ["sure modu", "kisa uzun tam", "59 saniye", "600 saniye", "tam sure modu", "tam sure", "sure videosu", "mod ne demek"],
    cevap: "Süre Modu: KISA (59 sn — Reels/Shorts), UZUN (600 sn) ve TAM SÜRE (120 dk'ya kadar, tam sure baştan sona). Kısa FREE'de, uzun PRO'dan itibaren, tam sure ELİT'tedir.",
  },
  {
    id: "ekran-format",
    anahtar: ["ekran formati", "9:16", "16:9", "1:1", "4:5", "dikey mi", "yatay mi", "reels format", "shorts format", "video boyutu"],
    cevap: "Ekran formatları: 9:16 dikey (Reels/TikTok/Shorts), 1:1 kare, 16:9 yatay (YouTube), 4:5 (Instagram gönderi). Hepsi FREE'den itibaren açık; ELİT'te üstelik toplu üretim var — tek tıkla üç format birden.",
  },
  {
    id: "atmosfer-secim",
    anahtar: ["atmosfer sec", "atmosfer nasil", "arka plan nasil", "rastgele al", "atmosfer kategorisi", "atico"],
    cevap: "Atmosfer Tasarımı panelinden arka plan klip seçilir: kategoriler (deniz, dağlar, gökyüzü, cami, gece, yıldızlar, orman, çiçekler, şelale…) tier katmanlıdır — temel ücretsiz, sinematik filtreler PRO, özel kategoriler ELİT. 'Rastgele Al' tek tıkla seçer.",
  },
  {
    id: "kari-secimi",
    anahtar: ["hoca sec", "kari sec", "hangi kari", "reciter", "tilavet sesi", "kac kari", "kac hoca", "ses karti"],
    cevap: "45 kâri sesi var: FREE 10 ücretsiz kâri, PRO 25 kâri (+15 PRO-özel), ELİT tüm 45. Abdullah Al-Juhany, Mishary Alafasy, Abdul Basit, Sudais, Shuraim, Maher gibi isimler. Stüdyoda Hoca/Tilavet sekmesinden seçilir.",
  },
  {
    id: "renk-cubugu",
    anahtar: ["renk cubugu", "mesaj katmani", "cerceve rengi", "gokkusagi serit", "kalinlik ayari", "ozel yazı ekle"],
    cevap: "Renk Çubuğu + Özel Yazı: çerçeve iç kenarına gökkuşağı şeridi ekler; 12 renk düğmesi çubuğu 30° adımlarla döndürür, kalınlık kaydırıcısı inceltir/kalınlaştırır. Arapça ve meal metinlerinin renkleri ayrı seçilir. PRO üyelere açıktır; FREE'de buton PRO rozeti taşır. 🎨",
  },
  {
    id: "tema-sayisi",
    anahtar: ["tema sayisi", "kac tema", "tema nereden", "tema degistir", "tema rengi"],
    cevap: "106 tema toplam: 9 ücretsiz, 51 PRO, 46 ELİT. Ayarlar → Tasarım ekranından tema seçilir; kilidi planınla açılır. 💎",
  },
  {
    id: "ai-arkaplan",
    anahtar: ["akilli ai", "ai arka plan", "akilli secim", "yapay zeka arka plan"],
    cevap: "Akıllı AI arka plan seçimi: seçtiğin ayetin ruhuna uygun atmosferi yapay zekâ önerir. ELİT özelliğidir ('Akıllı AI' düğmesi ELİT'te görünür).",
  },
  {
    id: "baslik-aciklama",
    anahtar: ["baslik uret", "aciklama uret", "hashtag", "title üret", "varyasyon üret"],
    cevap: "Başlık üretimi HERKESE ücretsizdir. Açıklama üretimi (AI varyasyonları) ELİT'te, AI hashtag paketleri de ELİT'tedir — satın alma panelinden yükselt.",
  },
  {
    id: "gunun-videosu-bolum",
    anahtar: ["gunun videosu", "bugünün videosu", "gunun hazir", "onerilen video", "onerilen videolar", "hazir taslak"],
    cevap: "Önerilen Videolar / Günün Hazır Videosu: bugüne özel ayet+kâri+atmosfer atanmış hazır taslaklar — tek tıkla üretirsin. Ürettikten sonra da üstte kalır. Cuma'da Cuma suresi + Kehf, Kadir Gecesi'nde Kadr 97:1 gibi mübarek gün özel seçimleri Hicri takvimle otomatik kayar. 🎬",
  },
  {
    id: "kendi-sesin",
    anahtar: ["kendi sesinle", "kendi sesimle", "mikrofon kaydi", "kendi ses"],
    cevap: "Kendi Sesinle Üretim (ELİT): mikrofon kaydını seçtiğin ayetlere senkron edebilirsin. FREE/PRO'da buton premium panelin ELİT kartına yönlendirir.",
  },
  {
    id: "toplu-uretim",
    anahtar: ["toplu uretim", "toplu", "batch", "birden fazla format", "ayni anda uc format"],
    cevap: "Toplu üretim ELİT özelliğidir: 9:16 + 1:1 + 16:9 tek tıkla birden. Her format için ayrı hak düşer — üretim butonunda toplam maliyet önceden yazar.",
  },
  {
    id: "oynerilen-videolar",
    anahtar: ["gunun hediyesi nerede", "hediye kutusu nerede", "sol alt"],
    cevap: "Günlük hediye kutusu ekranın SOL ALT köşesindeki 🎁 butonudur — hadis, zikir ya da üretim hakkı gibi sürprizler verir. Her gün gelir. 🎁",
  },
  // ── KUR'AN / İÇERİK MODÜLLERİ ──
  {
    id: "quran-bolumu",
    anahtar: ["kuran bolumu", "kuran sayfasi", "sure okuma", "ayet gezinme", "kuran modulu", "kuran ekran"],
    cevap: "Kur'an bölümü sağ üstteki '📖 Kur'an' butonudur: Oku (sure/ayet gezinme + meal), Dinle (40+ kâri) ve Hafızlık Testi sekmeleri. Kur'an Radyo modu da sürekli tilavet dinletir. 📖",
  },
  {
    id: "hafizlik-testi",
    anahtar: ["hafizlik testi", "hafizligimi", "ezber testi", "hafizlik nasil"],
    cevap: "Hafızlık Testi: Kur'an ekranının 3. sekmesinde — sure seç, ezberini dene, rozet kazan. İstatistik grafiği profilinde görünür. 🧠",
  },
  {
    id: "kesfet-modul",
    anahtar: ["kesfet", "kesfette ne var", "kesfet modul"],
    cevap: "Keşfet modalı: içerik keşif ekranı — arama (kesfetArama.ts), ayet kartları, dua bölümü ve özel gün içerikleri. Menüden açılır, ücretsizdir. ✨",
  },
  {
    id: "hadis-modul",
    anahtar: ["hadis nasil", "hadis arama", "hadisi nereden", "hadis", "hadis bul"],
    cevap: "Hadis arama modülü konu/kelime araması sunar (api/hadis/ara.ts); PWA kuruluysa günlük hadis bildirimi de gelir (api/push/hadisler.ts).",
  },
  {
    id: "kelime-atolyesi",
    anahtar: ["kelime atolyesi", "kelime ogren", "kelime oyunu"],
    cevap: "Kelime Atölyesi: Kur'an kelimelerini öğreten mini atölye modülü — menüden açılır, ücretsizdir.",
  },
  {
    id: "zikir-modul",
    anahtar: ["zikir modul", "zikirmatik", "tesbih sayaci", "tespih"],
    cevap: "Zikir/tesbihat modülü: tıklayıp sayar, api/zikir/* ile tutulur. Sevap Sayacı'na katkısı belirtilmez — yalnız kendi takibin içindir.",
  },
  {
    id: "sevap-sayac",
    anahtar: ["sevap sayaci", "harf sayisi", "bu ay okunana"],
    cevap: "Sevap Sayacı: 'bu ay bu sitede bu kadar harf okundu' dürüst sayacıdır — Kur'an sayfalarında '✓ Okudum', ayet gezinme, dua tamamlama gibi GERÇEK eylemlerden beslenir. Topluluk toplamıdır, ay değişince arşivlenip sıfırlanır. Sahte artış yok — ne görüyorsan o.",
  },
  {
    id: "ayet-kartlari",
    anahtar: ["ayet karti", "ayet kartlari", "kart üret", "foto üzerine ayet", "gorsel kart"],
    cevap: "Ayet Kartları Modal: 423 hazır ayet kartı galerisi + ayeti fotoğraf üzerine yerleştirme (Ayet & Dua Kütüphanesi). Parça'ları mega veri dosyalarından beslenir. Kartlıkla mesaj katmanı çekirdeği aynıdır (mesajKatmani.ts).",
  },
  {
    id: "dualar-modul",
    anahtar: ["dua bolumu", "dualar nerede", "günlük dua"],
    cevap: "Dualar: Keşfet içindeki dua bölümünde; okuyunca Sevap Sayacı'na harf katkısı eklenir.",
  },
  {
    id: "ozel-gun-takvim",
    anahtar: ["ozel gun takvim", "mubarek gunler", "kandil takvim", "ramazan takvim"],
    cevap: "Özel Gün Takvimi: menüde ramazan/bayram/kandil özel kartlarını gezdiren modal; tarihler Hicri (Umm al-Qura) olduğu için her yıl otomatik kayar. Ramazan Modal iftar/sahur zamanlarını da gösterir. 🌙",
  },
  {
    id: "kissa-uretimi",
    anahtar: ["kissa uret", "peygamber kissasi", "ai kissa"],
    cevap: "Kıssa üretimi: hazır Peygamber kıssaları ya da AI Kıssa Üretimi (jetonla). api/ai/kissa-generate.ts sunucuda çalışır, anahtar tarayıcıya asla inmez. Seslendirme eklenebilir. 📖",
  },
  {
    id: "seslendirme-modul",
    anahtar: ["seslendirme", "seslendirme modul", "nur ses", "tts", "tts modul", "tts nedir", "seslendir nedir"],
    cevap: "Seslendirme (NÛR SES): seçili ayetleri TTS motoruyla okur — 5 dil destekli, kâri sesinden bağımsız. Önizleme + indirilebilir (seslendirmeIndir.ts).",
  },
  {
    id: "mini-tur",
    anahtar: ["mini tur", "rehber tur", "siteyi tanimiyor", "tutorial", "yeni girdim"],
    cevap: "MiniTur: yeni gelenlere adım adım rehber — üretim akışını ve menüleri gezdirir. Menüden 'Rehber' seçerek tekrar açabilirsin.",
  },
  {
    id: "roadmap-modal",
    anahtar: ["yol haritasi", "roadmap oss", "modul oylama", "oyum nasıl"],
    cevap: "Roadmap: menüden 🚀 açılır — hangi modülün kaç oy aldığı görünüp oy lideri modül otomatik 'free' açılır. Oyunu ver! 🚀",
  },
  {
    id: "rozet-sistem",
    anahtar: ["rozet", "badge", "achieve"],
    cevap: "Rozet sistemi: hafızlık testi ve diğer aktivitelerde rozetler kazanırsın; profilinde durur.",
  },
  // ── ÜYELİK / ÖDEME ──
  {
    id: "fiyat-listesi",
    anahtar: ["fiyat", "pro fiyat", "elit fiyat", "fiyat listesi", "abonelik fiyati", "kac para pro", "kac para elit", "ne kadar ücret"],
    cevap: "Fiyatlar (TRY): PRO aylık 149₺, yıllık 1.610₺ (%10 indirim ≈134₺/ay). ELİT aylık 249₺, yıllık 2.540₺ (%15 indirim ≈212₺/ay). Yıllıkta peşin ödersin, dönem sonunda pasife döner — zorunlu yenileme yok.",
  },
  {
    id: "bolgesel-fiyat",
    anahtar: ["dolar fiyat", "euro fiyat", "sterlin", "yabancı fiyat", "bolgesel fiyat"],
    cevap: "Bölgesel fiyat şu an kapalı: sunucu HERKESİ TRY ücretlendirir ve arayüz TRY gösterir (NUR_MULTI_CURRENCY kapalı). Anahtar açılınca bölgesel gösterim + ücretlendirme birlikte devreye girer: TR ₺, AB €, İngiltere £, diğer ülkeler $.",
  },
  {
    id: "cuzdan-paneli",
    anahtar: ["cuzdan paneli", "cuzdana gir", "paket satın al", "tek seferlik paket", "⚡ buton"],
    cevap: "Cüzdan ('⚡ Cüzdanı Aç'): tükenmeyen paket haklarını ve jeton paketlerini gösteren panel. Tek seferlik paketler: 15/35/70 kısa (35₺/69₺/119₺), 8/20/40 uzun (45₺/89₺/149₺), 2/5/10 tam sürüm (39₺/89₺/159₺). Üyeliğinden AYRIDIR — hak bittiğinde buradan paket eklenebilir.",
  },
  {
    id: "odeme-yontemi",
    anahtar: ["odeme yontemi", "kredi karti", "banka", "iyzico nedir", "kart bilgi"],
    cevap: "Ödeme: satın alma panelinde kartla güvenli ödeme sağlanır — kart bilgileri sitede SAKLANMAZ, doğrudan iyzico ödeme sağlayıcısına gider. Sorun olursa 📧 destek@nurstudyo.com'a yaz; webhook idempotenttir — çifte ödeme korunur.",
  },
  {
    id: "vidje-refund",
    anahtar: ["video iade", "hak iade", "başarısız üretim iade", "refund video"],
    cevap: "Video iade: başarısız üretimlerde jeton/hak otomatik iade olur (09.10 SQL'inden beri); bayat üretimde hak düşmez. İade görünmüyorsa sayfayı yenile, bitmezse Geri Bildirim.",
  },
  {
    id: "abone-iptal",
    anahtar: ["abonelik iptal", "iptal", "nasıl iptal", "iptal ederim", "iptal nasil", "aboneligimi kapat", "üyelik bitir"],
    cevap: "Aboneliği kapatmak: dönem sonunda pasife bırakabilirsin (zorunlu yenileme yok) ya da otomatik yenilemeyi kapatmak için destek hattına yazabilirsin. Hesap silme tamamen AYRI özellik — KVKK/GDPR gereği 📧 destek@nurstudyo.com'a yazılır.",
  },
  {
    id: "sadik-uye-kota",
    anahtar: ["sadık üye", "sadik ödül", "haftalık kota"],
    cevap: "Sadık üye haftalık kotası (07.10): siteye devamlı bağlanan üyelere haftalık ek üretim hakkı tanınır — profiline yansır, ücret yok.",
  },
  // ── HESAP / GÜVENLİK ──
  {
    id: "sifre-hash",
    anahtar: ["sifre sakliyor", "sakliyor", "sifre hash", "şifre saklanır", "şifreleme", "veri güvenliği"],
    cevap: "Şifre: sunucuda HASH'lenir ve kimse görmez. Oturum HMAC imzalı çerezle taşınır (NUR_SESSION_SECRET sunucu gizi — tarayıcıya inmez). Kart bilgilerini sitemizde saklamıyoruz. 🔒",
  },
  {
    id: "sifre-unuttum2",
    anahtar: ["sifre sifirlama", "Şifre güncelle", "şifre değişikliği", "şifre nasıl değişir"],
    cevap: "Şifre sıfırlama: giriş ekranında 'Şifremi unuttum' → e-posta linki. Gelmediyse spam klasörüne bak, 2-3 dakika bekle. Sıfırlama sonrası ESKİ çerezler geçersiz olur.",
  },
  {
    id: "admin-nasıl",
    anahtar: ["admin nasıl", "admin yetki", "admin panel girişi", "admin olmak"],
    cevap: "Admin yetkisi env-gated ve sunucu koşullarına bağlıdır — istemle verilmez. Yönetici işlerinin dışında sorun varsa 📧 destek@nurstudyo.com'a yaz.",
  },
  // ── TEKNİK / GENEL ──
  {
    id: "beyaz-ekran2",
    anahtar: ["beyaz ekran", "siyah ekran", "gorsel bozuk", "goruntu bozuk", "ekran gri"],
    cevap: "Beyaz/siyah ekran: Ctrl+Shift+R ile sert yenile; tarayıcı önbelleğini temizle; başka tarayıcı dene. PWA kuruluysa uygulama sürümünü tetikle. Sorun sürerse ekran görüntüsüyle Geri Bildirim gönder.",
  },
  {
    id: "offline-mod",
    anahtar: ["offline", "çevrimdışı", "internet yok", "baglanti yok"],
    cevap: "Offline: servis çalışanı (sw.js) temel kabuğu önbellekten gösterir; ayet getirme ve üretim internet gerektirir. Bağlantı gelince otomatik senkron dener.",
  },
  {
    id: "bakim-ekran",
    anahtar: ["bakim", "bakim ekran", "site kapalı mı", "maintenance"],
    cevap: "Bakım ekranı (MaintenanceScreen): sunucu bakımdaysa üretim yürümez; bitince otomatik geri gelir. Duyuru barı ve Telegram kanalında anons edilir.",
  },
  {
    id: "ayet-fetch",
    anahtar: ["ayet getirilmiyor", "meal gelmiyor", "ayet yüklenmiyor", "çeviri gelmiyor"],
    cevap: "Ayet/meal getirilirken sorun: api/quran/fetch.ts güvenilir kaynaklardan çeker — genelde internet kesintisi. Sert yenile (Ctrl+Shift+R) ve bağlantıyı kontrol et; sürerse Geri Bildirim.",
  },
  {
    id: "reset-bildirim",
    anahtar: ["bildirim izni", "push izni", "bildirimleri aç", "iOS bildirim"],
    cevap: "Bildirim izni: sağ üst 📲 ile PWA'yı kur, sonra cihaz ayarlarından Nûr Stüdyo bildirimlerini aç. iOS'ta önce 'Ana ekrana ekle' gerekir.",
  },
  {
    id: "asistan-teknik",
    anahtar: ["asistan nasil çalışır", "asistana nasıl", "sen nasıl çalışıyorsun", "asistan tarafından"],
    cevap: "Ben Nûr Stüdyo'nun kural-tabanlı asistanıyım — sorunu anahtar kelimelerle eşleştirip HAZIR cevabımı veririm; kişisel veri ya da admin bilgisi ASLA aktarmam. Garanti: sunucuda 'bilinen' yalnız genel site bilgileridir.",
  },
  {
    id: "destek-mail",
    anahtar: ["destek-mail", "mail atmak istiyorum", "ekibe nasıl yaz"],
    cevap: "Ekibe yazmak: sağ üst → 'Geri Bildirim' kutusu en hızlısı (mesajına sürüm numarası eklemeyi unutma) ya da 📧 destek@nurstudyo.com. Ban itirazlarında konu: 'İTİRAZ'.",
  },
  {
    id: "uyelik-free-ne-var",
    anahtar: ["free plan", "ucretsiz plan", "ucretsizde ne var", "ücretsiz üyelikte"],
    cevap: "FREE plan: günde 3 kısa video, 10 kâri, 9 tema, 1300+ atmosfer klip, başlık üretimi, 16:9 format, Kâbe canlı + Kur'an okuma/dinleme + hafızlık + Nur araçları ÜCRETSİZ. Çıktı köşesinde 'nurstudyo.com' etiketi görünür (kaldırılamaz). PRO'ya yükseltip etiketsiz üretim + renk çubuğu + 25 kâri açılır. 💎",
  },
];
