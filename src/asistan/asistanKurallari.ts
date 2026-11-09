// Kural tipleri — asistanCevap.ts'ten taşındı (içerik aynı; asistanCevap re-export eder)

export type AsistanSeviye = "free" | "pro" | "elit";

export interface AsistanRule {
  /** kural kimliği (test için) */
  id: string;
  /** soruyu lowercase+TR-fold edip bu kelimelerle içeride arar */
  anahtar: string[];
  /** TR cevap (sabit metin — kullanıcı girdisi eklemez) */
  cevap: string;
}

/** Kural bankası — asistanCevap.ts'ten taşındı (içerik bayt-bayt aynı). */
export const ASISTAN_RULES: AsistanRule[] = [
  {
    id: "uretmiyor",
    // ★ LISTENİN BAŞINDA (19.10): "video uretmiyor" içinde "video uret" substring'i
    //   video-nasil'a da puan verir; berabere kalınca ÖNCE GELEN kazanır — sorunun
    //   çözümü (uretmiyor) genel rehberden (video-nasil) önceliklidir.
    anahtar: ["uretmiyor", "uretemiyorum", "olusturulamadi", "buton calismiyor", "video cikmadi", "bitmıyor", "bitmiyor", "sureasiyor", "donup kaldi", "butona bastim", "bastım olmadı", "ürettim ama", "takılıda kaldı", "takildı kaldı" ],
    cevap: "1) Üretim tarayıcınızda yürür — sekme açık ve görünür kalsın. 2) Süre modunu Kısa'dan başlatın. 3) Kontrol edilmediyse Ctrl+Shift+R ile sert tazeleyin. 4) 'Kalan Haklarım' kutusunda kısa-video hakkı görünmüyorsa kota tükenmiştir (aşağıdaki ⚡ butonuna bakın). Sorun sürerse 📧 Destek'e yazın.",
  },
  {
    id: "selam",
    anahtar: ["selam", "selamlar", "merhaba", "gunaydin", "gunaydinlar", "hey", "naber", "nasilsin", "iyi aksamlar", "iyi geceler", "iyi gunler", "aleykum", "hos geldin", "hos bulduk", "sen kimsin", "kimsin", "napiyorsun"],
    cevap: "Merhaba! 🌙 Ben Nûr Asistan — Nûr Stüdyo'nun canlı asistanıyım. Video üretimi, üyelik, jetonlar, paylaşım, ayet kartları… her konuda anlatırım. Sor beni, ne yapabileceğimi göreceksin! Aşağıdaki hazır sorulardan da birine tıklayabilirsin. 🎧",
  },
  {
    id: "tesekkur",
    anahtar: ["tesekkur", "tesekkurler", "sagol", "sag ol", "eyvallah", "cok iyisin", "mukemmel", "harika", "super is", "maalesef yok", "zaten yaptim"],
    cevap: "Ne demek, o benim görevim! 🌙 Her zaman buradayım — başka sorman olursa çekinmeden yaz. Kolay gelsin! ✨",
  },
  {
    id: "veda",
    anahtar: ["gorusuruz", "hosca kal", "gule gule", "bye", "kapaniyorum", "cikiyorum", "larda görüşmek"],
    cevap: "Güle güle! 🌙 Yolun açık olsun — faydalı bir video ürettiysen paylaşmanda sesleri duymamak mümkün değil. Yeniden gelince burada olacağım. 👋",
  },
  {
    id: "video-nasil",
    anahtar: ["video nasil", "video uret", "nasil uret", "nasil yaparim", "video yap", "uretim", "ayet video", "sure video", "kuran videosu", "ayetli", "reel nasil", "shorts nasil", "kari sec", "hoca sec", "atmosfer sec", "sesini sec", "sure sec"],
    cevap: "Video üretim akışı: 1) Sol panelde Kütüphane & Ayet Arama ile ayet(ler)i seçin. 2) Atmosfer Tasarımı'ndan arka plan seçin (Rastgele Al da olur). 3) Hoca/Tilavet'ten ses kartını seçin. 4) Süre Modu (Kısa/Uzun/Tam Sure) + Ekran Formatı (9:16 / 1:1 / 16:9 / 4:5) seçin. 5) 'Videoyu Üret' butonuna basın. Üretim tarayıcınızda gerçekleşir — sekme açık kalsın.",
  },
  {
    id: "jeton",
    anahtar: ["jeton", "kontenjan", "token", "sur hakki", "sure hakki", "jeton kazan", "jeton nereden", "jeton az", "jeton eksik", "jetonum yok", "ucresiz video", "baska vera", "jeton nereden gelir", "jeton artması", "jeton artırmak" ],
    cevap: "Jetonlar video üretiminde harcanır; üret butonunda kaç jeton gideceği önceden yazar. Jeton kazanç yolları: günlük hediye, sadık üye kotası, davet ettikleriniz ve özel gün ödülleri. Jetonlarınızın dağılımını Profil → Jeton kutusundan görebilirsiniz.",
  },
  {
    // ★ 21.10 TAM PRO LİSTESİ (kullanıcı: "pro ne getirir dediginde pro özellikleri
    //   saysın komple") — sayılar premiumModalHelpers PRO_FEATURES + tier.ts
    //   DAILY_QUOTA/FEATURE_GATES kaynaklı; panelde gösterilenle birebir.
    //   ★ Kurallar uyelik'ten ÖNDE durmaktadır — beraberlikte İLK gelen kazanır:
    //     "Elit üyelik avantajları?" genel uyelik yerine tam Elit listesine düşer.
    id: "pro-paket",
    anahtar: ["pro paket", "pro getirir", "pro getirdiği", "pro avantaj", "pro fark", "pro neler", "pro içerir", "nen var proda", "proda ne var", "nur pro", "proya", "pro abone"],
    cevap: "NÛR PRO paketinin kazandırdıkları 💎 — 1) Üretim kotası: günde 8 kısa + 3 uzun video (600 sn) üretme hakkı (Free: 3 kısa). 2) 25 kâri sesi — 10 ücretsiz kârinin üstüne 15 PRO-özel kâri. 3) 60 tema erişimi (51 PRO + 9 ücretsiz tema). 4) Sinematik filtreler: videoya sinematik atmosfer klip havuzu ve kategori filtreleri. 5) AI başlık ve açıklama varyasyonları: metni/başlığı tek tıkla yenile, varyasyon üret. 6) Uzun video modu + 16:9 yatay ekran formatı açılır. 7) Etiketsiz üretim (22.10): videonda nurstudyo.com imzası ÇIKMAZ — Ücretsiz'in bir üst avantajı. Aylık ya da yıllık (%10 indirim) seçeneklerle satın alım panelinden hemen açılır — aşağıdaki 💎 butonu. 🌙",
  },
  {
    // ★ 21.10 ELİT LİSTESİ — ELIT_FEATURES birebir (PremiumModal ile aynı kaynaktan)
    id: "elit-paket",
    anahtar: ["elit paket", "elit getirir", "elit avantaj", "elit fark", "elit neler", "elit içerir", "elit what", "nur elit", "en üst seviye", "elit", "elit uyelik", "elit ne getirir", "elit ne", "elitde", "elit>Welcome"],
    cevap: "NÛR ELİT paketinin kazandırdıkları 👑 — 1) Üretim kotası: günde 15 kısa + 5 uzun video (600 sn) + 1 tam sure sürümü. 2) Tüm 45 kâri sesi — hepsi açık. 3) Tüm 106 tema. 4) Filigransız 1080p + KENDİ marka etiketin — videonu kendi imzânla paylaşırsın (Marka İmza). 5) Açıklama üretimi (AI varyasyonları). 6) AI hashtag paketleri. 7) Gelişmiş sosyal paylaşım araçları. 8) Tasarım stüdyosu + kendi imzân. 9) Seslendirme (NÛR SES içerikleri). 10) Kendi sesinle üretim. 11) Haftanın Videosu vitrine ekleme. 12) Akıllı AI arka plan seçimi. Üstelik toplu üretim (birden fazla format bir seferde) ELİT'tedir. Aşağıdaki 💎 butonundan plan paneline bakabilirsin. 🌙",
  },
  {
    id: "uyelik",
    //   ★ 22.10: "yıllık/aylık üyelik alalım" sorusuz kalmasın — anahtarlar hem
    //   üyelik kuralına, hem ayrı kısa verilen yıllık tanımlı kurala geçirildi.
    anahtar: ["uyelik", "uye ol", "abone", "premium", "pro ne", "elit ne kim", "fiyat", "fiyatlari", "parali", "ücret", "abone ol", "abonelik", "pro ol", "yükselt", "uyelik nasil", "satın al", "ode", "uyelik seviye", "seviyeleri nedir", "yıllık", "yillik", "yıllık satın", "aylık", "aylik", "aylık satın"],
    cevap: "Üyelik seviyeleri: Free (temel), Pro ve Elit. Üst seviyeler daha yüksek üretim hakkı, etiketsiz üretim, renk çubuğu ve premium atmosfer kategorileri açar (22.10 kuralı: Ücretsiz = nurstudyo.com etiketi, Pro = etiketsiz, Elit = kendi etiketin). AYLIK ya da YILLIK (%10 indirimli) iki ödeme planı da satın alma panelinde durur — aşağıdaki '💎 Üyelik Planlarını Gör' butonuyla aç, PRO/ELİT kartında periyot seçicisinden 'Yıllık'ı seç.",
  },
  {
    id: "yillik-uyelik",
    // ★ 22.10: sadece yıllık/aylık ödeme periyodu sorusu — ayrı kısa cevap (vurgu: yıllıkta %10 indirim).
    //   Çok-kelimeli anahtarlar substring olarak aranır: "yıllık üyelik nasıl alınır?" → "yıllık üyelik" ✓
    anahtar: ["yıllık üyelik", "yıllık üye", "yıllık paket", "yıllık abonelik", "yıllık satın al", "yıllık alma", "yıllık nasıl", "yıllık plan", "yıllık indirim", "yıllık ne kadar", "yıllık alım", "yıllık alınır", "yıllık mi aylık mi", "aylık mi yıllık mi", "yıllık kayıt"],
    cevap: "Yıllık üyelik 💎 — tüm planlarda (Pro/Elit) aylıkla aynı avantajlar, YILLIK ödemede %10 indirimli fiyat. Satın alma panelinde (aşağıdaki 💎 butonu) PRO veya ELİT kartını seçip periyot seçicisinden 'Yıllık'a bak; fiyat yıllık toplam olarak güncellenir ve ödemeyi kartla güvenle yapabilirsin. İptal/yenileme istemezsen dönem sonunda pasife döner — zorunlu yenileme yok. 🌙",
  },
  {
    id: "calismiyor",
    anahtar: ["calismiyor", "ise yaramiyor", "hata", "beyaz ekran", "bos ekran", "yuklenmıyor", "yuklenmiyor", "acilmiyor", "acilmadi", "dondu", "bozuk", "görünmüyor", "goremiyor", "hiçbir sey olmuyor", "para vermeden", "odemesiz", "kayit olmadan" ],
    cevap: "Küçük pürüzler için 3 adım: 1) Sayfayı sert tazeleyin (Ctrl+Shift+R ya da üst bardaki 'Güncellemeyi Al'). 2) İnternet bağlantısını kontrol edin — offline olduğunda işlemler bekletilir. 3) Tarayıcı önbelleğini temizleyin. Düzelmezse sağ üst → Geri Bildirim ile durumu bize yazın; sürüm numarasıyla teşhis çok hızlanır.",
  },
  {
    id: "ban-genel",
    anahtar: ["ban ne", "ban how", "kural ihlal", "banin sebebi", "banin", "yasak ne demek", "yasaklandim", "banlandim", "yasakli", "kisitlama", "engellendim", "bloklandi", "erisim kapatıldı", "ban yedim", "kisitlandi", "kisitlandim", "bloklandım", "bloklandim", "kısıtlandım", "kisitlandim" ],
    cevap: "Erişim kısıtları kural ihlalleri üzerine uygulanır: kısa sürede aşırı üretim denemesi, otomasyon/robot davranışı veya topluluk ilkelerine aykırı içerik. Süreler otomatik işler. İtiraz için sağ üst → Geri Bildirim kullanın ve konu kısmına 'İTİRAZ' yazın — ekip inceler. (Asistan bireysel ban durumu göstermez; Profil sayfanızda görünür.)",
  },
  {
    id: "kilitli-modul",
    anahtar: ["kilitli", "acilmiyor", "goremiyorum", "gizli", "odul", "oylama", "roadmap"],
    cevap: "Bazı modüller topluluk oylaması ya da yol haritası kilidindedir: Roadmap modalında hangi modülün kaç oy aldığı görünür; oy lideri modül otomatik 'free' açılır. Admin kilitli bazı modüller ise ilerleyen sürümlerde planlıdır — kapanasınız diye değil, hazırlaktır.",
  },
  {
    id: "paylas-indir",
    anahtar: ["paylas", "whatsapp", "instagram", "indir", "indiremiyorum", "indirilemiyor", "videoyu gonder", "tiktok", "telegram", "kaydet", "kaydedemiyorum", "indiremedim", "kaydetme", "kaydetmek", "videoyu kaydet", "galeriye" ],
    cevap: "Video hazır olunca 'İndir' ile cihaza iner; 'Paylaş' cihazın gerçek paylaşım penceresini açar — WhatsApp, Instagram, Telegram, Signal vb. seçersiniz. Hızlı çipler tek tıkla uygulamaya gider; 'Daha fazla +' çipi video dosyayla birlikte tüm uygulamalar listesini açar. İndirme başlamadıysa tarayıcı izinlerini ('Dosya indirme') kontrol edin.",
  },
  {
    id: "giris-sifre",
    anahtar: ["sifremi unuttum", "giris yapam", "giremiyorum", "oturum kapatıldı", "oturum kapandi", "giris", "oturum", "hesap acamadi", "kayit olamiyor", "sifre degistir", "sifre"],
    cevap: "Giriş sorunları: 1) Profil butonundan tekrar giriş yapın (e-posta + şifre). 2) Şifre sıfırlama e-postası gelmediyse spam klasörüne bakın, 2-3 dakika bekleyin. 3) Kısa sürede çok deneme yapıldıysa sistem geçici bekletir — birkaç dakika sonra tekrar deneyin. Sürerse Geri Bildirim ile yazın.",
  },
  {
    id: "tasarim",
    anahtar: ["tasarim", "tema", "renk", "atmosfer", "arka plan", "font", "yazi boyutu", "kilid", "filtre", "renk cubugu"],
    cevap: "Atmosfer Tasarımı panelinden arka plan klibini seçin ya da 'Rastgele Al'a basın. Tema renkleri ve yazı boyutları Ayarlar → Tasarım'dan değişir. Önizlemecide gördüğünüz katmanlar üretimde birebir aynen çıkar.",
  },
  {
    id: "yavaslik",
    anahtar: ["yavas", "donuyor", "kasiyor", "takiliyor", "uyari veriyor", "kasma", "lag", "ram", "telefonum kasıyor", "bilgisayar kasıyor", "kasmıyor", "kasiyor mu", "kasabilir mi", "kasma olur", "telefon nasıl" ],
    cevap: "Üretim tarayıcınızda yürür; sekme dışı uygulamalar RAM'i böler. 1) Diğer sekmeleri kapatın. 2) Kısa videodan başlayın, uzatın. 3) 4K yerine HD arka plan seçin. 4) Üretim sırasında sekme açık ve görünür kalsın (arka planda sekmeler yavaşlar).",
  },
  {
    id: "kissa-ses",
    anahtar: ["kıssa", "kissa", "seslendir", "tts", "eleven", "kendi sesim", "hikaye", "kissa oku", "yapay ses", "okut", "kendi sesimle", "narration", "seslendirme nasil", "seslendirme nasıl", "sesi nasıl", "okutma" ],
    cevap: "Kıssa üretimi + seslendirme: hazır kıssaları seslendirebilir, AI Kıssa Üretimi jetonla çalışır. Kendi sesinizi kullanmak isterseniz 'Kendi Sesim' modu mikrofon kaydını kabul eder; kayıt yalnız sizin hesabınıza bağlanır.",
  },
  {
    id: "dil",
    anahtar: ["dil", "ingilizce", "arapca", "indonezya", "urdu", "turkce", "dil degistirme", "diller", "arabic", "english", "bahasa"],
    cevap: "Site 5 dilli: Türkçe, English, العربية, Indonesia, اردو. Profil → Dil seçeneğinden anında değişir; seçim cihazınızda hatırlanır, kayıt gerekmez.",
  },
  {
    id: "silinen",
    anahtar: ["silindi", "geri getir", "kayboldu", "kayip", "kopyasi", "galeri", "eski videolarım", "geri gelmez mi"],
    cevap: "Silinen bir çıktı geri getirilemez — üretim sizin cihazınızda yapılır, sunucumuzda üretimlerin kopyası tutulmaz (gizlilik ilkesi). Önemli videoları 'İndir' ile cihaza kaydetmeniz önerilir.",
  },
  {
    id: "hatirlatma",
    anahtar: ["hatirlat", "push", "bildirim", "vakit", "pwa", "uygulamayı kur", "kur", "ana ekrana ekle", "bildirim gelmiyor", "hatirlatici", "uygulama kurulumu", "kurulum", "pwa kurulumu", "telefona kurulum", "telefona kur", "kurarim", "ana ekranda", "hatirlatma gelmiyor", "hatırlatma gelmiyor", "bildirim gelmiyor" ],
    cevap: "Vakit hatırlatmaları için uygulamayı cihaza kurun: sağ üst köşedeki 📲 butonuyla PWA kurulumu yapın; kurulumdan sonra günlük hatırlatmalar otomatik gelir. Kuruluysa cihaz ayarlarından Nûr Stüdyo bildirimlerini açın.",
  },
  {
    id: "iletisim",
    anahtar: ["iletisim", "destek", "geri bildirim", "geribildirim", "sikayet", "oneri", "mail", "mailin", "mail adresin", "numara", "telefonla arapplicant"],
    cevap: "Destek hattı: 📧 destek@nurstudyo.com ya da sağ üst → 'Geri Bildirim' kutusu. Mesajınıza sürüm numarası ekleyin (About penceresinde yazar) — teşhis hızlanır. Ban itirazlarında konu kısmına 'İTİRAZ' yazın.",
  },
  {
    id: "uyesayisi",
    anahtar: ["kac uye", "uye sayisi", "kac kullanici", "istatistik", "trafik", "bu ay kaç kişi", "zaman artışı"],
    cevap: "Üyelik ve trafik sayıları halka açık olarak paylaşılmıyor — sayıya bağlı duyuru barlarımızı ve Sadık Üye oranını topbarda görebilirsin. Sayıları kamuoyuna bir gün duyuracağız, o an haber on kanalında gelir. 📊",
  },
  {
    id: "reklam",
    anahtar: ["reklam", "reklamsiz", "popup", "spam", "reklami kaldir", "reklam var mi"],
    cevap: "Reklam yok — Nûr Stüdyo'da popup/redirect türü reklam YOKTUR; hiçbir şeye zorlanmazsın. Kazanç yalnız isteyen üyelerin Pro/Elit tercihinden gelir. Dikkatini dağıtacak hiçbir şey yok, huzurla üret. ✅",
  },
  {
    id: "hak-bitti",
    anahtar: ["hak bitti", "hakim bitti", "hakkim bitti", "kota bitti", "kota doldu", "hak yok", "hak yetmiyor", "bitti ne yapayim", "kotasız", "kota tükendi", "tukendi", "bittimi", "yenilenir mi", "yenilenme", "her gun yenilenir", "ne zaman yenilenir" ],
    cevap: "Üyelik hakları her gecede yenilenir (Free: 3 kısa/gün) — yenilenene kadar bekleyebilir ya da tek seferlik paket alabilirsiniz: '⚡ Cüzdanı Aç' butonu, tükenmeyen paket haklarını ve jeton paketlerini gösteren cüzdan panelini açar.",
  },
  {
    id: "iade",
    anahtar: ["iade", "iadesi", "iadesini", "refund", "para geri", "odeme sorun", "kart cekildi", "çift odemе", "çift odeme", "fatura"],
    cevap: "İade şartları: tek seferlik paket hiç üretim yapılmadan kullanılmadıysa satın almadan itibaren 7 gün içinde 📧 destek@nurstudyo.com'a ödeme kanıtını ekleyerek yazın (en geç 2 iş günü). Üretim başlamış paketlerde iade yok. Aylık üyelik dönem sonunda pasif olur — yenileme zorunlu değil.",
  },
  {
    id: "hesap-sil",
    anahtar: ["hesabimi sil", "hesap sil", "verilerimi sil", "veri silme", "kvkk", "gdpr", "uyelik iptal"],
    cevap: "Hesabınızı ve verilerinizi tamamen silmek için 📧 destek@nurstudyo.com'a kayıtlı e-postanızdan yazın — KVKK/gizlilik politikası gereği talebiniz işler. Aylık üyeliği yalnız pasifleştirmek için beklemeye almanız yeterli.",
  },
  {
    id: "kabe-canli",
    anahtar: ["kabe", "canli", "mescid", "o kadır", "senik yayin", "yayin acilmiyor", "yayın yok"],
    cevap: "Kâbe/Mescid-i Nebevi canlı yayını sağ üstteki '🕋 Kâbe Canlı' butonundadır. Yayın açılmıyorsa: 1) Bağlantı hızını kontrol edin (4K/60fps yüksek bant ister). 2) Diğer video sekmelerini kapatın. 3) Yayın kaynağı geçici kapalıysa kısa süre sonra tekrar deneyin.",
  },
  {
    id: "kurani-oku",
    anahtar: ["kuran oku", "sure oku", "okurum", "dinle", "radyo", "tilavet dinle", "ayet dinle", "kalici", "hatim", "her sureyi oku", "sureyi ac", "adin", "sure nereden", "sureyi sec", "sure okuyorum", "kuran okurum"],
    cevap: "Kur'an bölümü: sağ üstteki '📖 Kur'an' butonu — sure okuma, dinleme (40+ kâri) ve ezber testi modları içerir. '🔊 Seslendirme' ile seçili ayeti 5 dilde anlatım alıntılarıyla dinleyebilirsiniz. Radyo ihtiyacına canlı tilavet istasyonu hazırdır.",
  },
  {
    id: "hediye-kodu",
    anahtar: ["hediye kodu", "promosyon", "kupon", "kod nereden", "indirim kodu"],
    cevap: "Hediye kodu: menü'de '🎁 Hediye Kodu' kutusuna yazılır — kod başarılıysa jeton/paket anında hesabınıza yüklenir. Kodlar admin duyurularda (Ana Ekran barı ya da Telegram duyuru kanalı) dağıtılır.",
  },
  {
    id: "cesit-tarayici",
    anahtar: ["tarayici", "safari ok", "chrome ok", "internet explor", "travers", "react", "uyumlu tarayici", "telefondan vcir"],
    cevap: "Site modern tarayıcılar için: Chrome, Edge, Firefox, Safari (iOS 15+) desteklenir. Eski WebView/AOSP tarayıcılar ve Internet Explorer üretim yürütmez. Telefonda mümkünse Chrome/Safari kullanın.",
  },
  {
    id: "gizlilik",
    anahtar: ["gizlilik", "kayit tutuyor", "verimi sakliyor", "cocuk", "cocuk guvenliği", "cocuk guvenligi", "güvenli mi", "guvenli mi", "verilerim", "guvende", "güvende", "verilerim saklanir", "verilerim saklanır", "videolarim saklanir", "videolarım saklanır", "kopyası tutulur" ],
    cevap: "Gizlilik: üretimler cihazında yapılır, sunucuda video kopyası tutulmaz; e-posta dışında (giriş için) kişisel bilgi istenmez. Tam metin: alt bardaki '📜 Yasal/Gizlilik' bağlantılarındadır. İçerik Kur'an-meal temellidir — topluluk ilkelerine aykırı paylaşımlar engellenir.",
  },
  {
    id: "site-merac",
    anahtar: ["site ne", "nur studyo ne", "amac", "kimin icin", "ücretsiz mi", "ucretsiz mi", "gerçek mi"],
    cevap: "Nûr Stüdyo: Kur'an ayetleriyle dinî videolar üreten ücretsiz araç — ayet seç, atmosfer + kâri sesiyle videoyu cihazında üret, sosyal medyaya paylaş. Temel üretim ücretsizdir; Pro/Elit daha çok hak + ayrıcalık açar (aşağıdaki 💎 butonu).",
  },
  // ── ★ 20.10 GENİŞLETME DALGASI (kullanıcı emri: "soru sorma ihtimali olan her
  //   soruyu tahmin et, cevaplarını entegre et") — bilinen konu setini büyütür,
  //   'bilinmiyor' oranı düşer: ──
  {
    id: "asistan-varsam",
    anahtar: ["asistan nasil", "asistan kim", "asistan ne", "sen nasilsin", "nasil gidiyor", "insan misin", "real mi", "gercek kisi", "canli mi", "bot musun", "robot musun", "ai misin", "yapay zeka"],
    cevap: "Ben Nûr Stüdyo destek asistanıyım! 🕌 Kural-tabanlı, anında cevap veren bir yardımcıyım — gerçek kişi değilim ama sorularınızı cevaplamak için buradayım. Video üretimden üyeliğe, jetonlardan paylaşıma kadar her konuda size nasıl yardımcı olurum? 🌙",
  },
  {
    id: "асьстан-ne-yapabilir",
    anahtar: ["ne yapabilirsin", "neler sorabilirim", "neyi biliyorsun", "yardım edermisin", "nasil kullanirim", "ne konularında yardım", "konular"],
    cevap: "Size nasıl yardımcı olurum? 🌙 Video üretimi, üyelik/Pro/Elit, jetonlar, günlük haklar, paylaşım/indirme, atmosfer-tasarım, Kur'an bölümü (dinle/hafızlık), Kâbe canlı, kıssa/seslendirme, dil seçimi, iade/fatura, gizlilik, hesap/şifre, uygulama kurulumu… Sen sor, ben cevaplarım.",
  },
  {
    id: "gunun-hediyesi",
    anahtar: ["hediye", "gunun hediyesi", "bugun hediye", "gunluk hediye", "günlük ödül", "günlük surpiz"],
    cevap: "Günlük hediye (yorumla alınır): ekranın sol altındaki 🎁 hediye kutusuna tıklayın — hadis, zikir ya da üretim hakkı gibi günlük sürprizler açar. Her gün gelir, dünü kaçırdıysanız üzülme, bugünü al! 🎁",
  },
  {
    id: "hafizlik",
    anahtar: ["hafizlik", "hafizlik testi", "ezber", "hafizlk", "hafız test", "memorization"],
    cevap: "Hafızlık Testi: sağ üstteki '📖 Kur'an' butonundan açılır (3. sekme) — sure seç, ezberini dene, rozet kazan. Test sonunda okumuş olduğun sure/hşi sürpriz rozet ağı gelir!🧠",
  },
  {
    id: "sure-dinle",
    anahtar: ["sure dinle", "kuran dinle", "tilavet", "kari", "hoca", "sesi sec", "ses seç", "hangisi ses", "hangi hoca"],
    cevap: "Kur'an dinleme: sağ üst 📖 butonundaki Kur'an ekranının DINLE modunda 40+ kâri (hoca) sesi sunulur — Abdullah Al-Juhany, Mishary Alafasy, Abdul Basit vb. Ses seçimini ayarlar → Tilavet'ten istediğiniz an değişebilirsiniz. 🎧",
  },
  {
    id: "coklu-uretim",
    anahtar: ["coklu", "birden fazla video", "toplu", "ayni anda", "aynı anda birden", "kac video ayni", "batch"],
    cevap: "Toplu üretim sadece ELİT üyeliK'tedir — bir tıklamayla 9:16 + 1:1 + 16:9 formatlarının hepsi seris devam pistır. Pro da tek format üretir, Free tek format + günlük kota. 💎 Üyelik planları nda paketi büyütmeyi görün.",
  },
  {
    id: "video-kalite",
    anahtar: ["kalite", "net değil", "blurlu", "çözünürlük", "hd", "4k", "video kalitesi", "video netlii", "Video bulanık", "bulanık", "bulank", "video bulanik", "net degil cikti" ],
    cevap: "Video kalitesi: üretim şunlara bağlı — 1) Orjinal arka plan klip kalitesi (HD/4K hangisi seçildise). 2) Ekran formatı (4:5'te 1080p genişlik). 3) Cihaz performansı. Blur/arize oluşmuşsa HD klip seçmeyi ve arka planı tekrar atamayı deneyin.",
  },
  {
    id: "filigran",
    anahtar: ["filigran", "watermark", "logo yaziyor", "marka yazisi", "video üstünde yazı", "video altındaki yazı"],
    // ★ 22.10 ETİKET KURALI (kullanıcı emri): FREE = etiket zorunlu · PRO = etiketsiz · ELİT = kendi etiketin
    cevap: "Etiket kuralı: Ücretsiz üretimlerde köşede küçük 'nurstudyo.com' imzası görünür ve kaldırılamaz. PRO'da çıktın tamamen etiketsiz çıkar. ELİT'te üstelik KENDİ marka etiketini/imzâni ekleyebilirsin (Marka İmza özelliği). 💎 Üyelik Planları'ndan yükseltebilirsin.",
  },
  {
    id: "uyari-kayit",
    anahtar: ["kayit şart mi", "kayıt gerekiyor", "üye olmadan", "misafir", "giriş yapmadan", "kayıt olmazsam"],
    cevap: "Kayıt olmadan da deneyebilirsin — misafir olarak sınırlı deneme üretimi sunulur; üye olunca günlük haklar, jetonlar ve hediye sistemi açılır. Ücretsizdir, tek tıkla e-postayla kaydolabilirsin. 🌙",
  },
  {
    id: "odeme-yontemler",
    anahtar: ["odeme", "kart", "havale", "kredi karti", "banka", "papara", "iyzico", "nasıl öderim"],
    cevap: "Ödeme: satın alma panelinde kredi/banka kartı ile güvenli ödeme altyapısı (iyzico) kullanılır — kart bilgileri sitede SAKLANMAZ, doğrudan ödeme sağlayıcısına gider. Sorun olursa 📧 destek@nurstudyo.com'a yaz.",
  },
  {
    id: "guncelleme",
    anahtar: ["guncelleme", "yeni ozellik", "roadmap ne zaman", "yakinda ne var", "gelecek ozellik"],
    cevap: "Yakın gelenler: menüdeki 🚀 Yol Haritası'nda oylanan modüller var — hangi modül ne zaman gelir, oy sayılarıyla görünür. Oyunu verin, lider modülün kilidi tüm topluluğa açılır. 🚀",
  },
];
