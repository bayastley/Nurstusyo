# NÛR STÜDYO — LANSMA PLANI (v1.0 Genel Erişim)

**Tarih:** 26 Ekim 2026, Pazartesi (takvim bu tarihe göre hizalandı)
**Kapsam:** Sitenin ilk kamu lansmanı — "kimsenin haberi yok" durumundan çıkıp gerçek bir açılış gününe
**Durum:** PLAN AŞAMASI. Bu doküman hazırlandığı sırada **hiçbir kod dosyasına, hiçbir veriye, hiçbir ayara dokunulmadı.** Aşağıdaki her şey öneri/plan niteliğindedir; uygulama senin onayınla yapılacak.

---

## 0. TEZ (tek cümle)

> Site bitmemiş değil — **ilan edilmemiş.** Kod tarafı lansmana hazır; eksik olan tek şey **duyuru + dağıtım**, ve 7 gün boyunca **yeni iş eklemek yerine eldekini duyurmak**.

---

## 1. ÖLÇÜLEN DURUM (canlı, 21 Ekim 2026 21:20 UTC)

Hepsi `https://www.nurstudyo.com` üzerinden gerçek sorgularla ölçüldü.

| # | Ölçüm | Değer | Anlamı |
|---|--------|-------|--------|
| 1 | Ana sayfa | HTTP 200, uygulama yükleniyor | Site **çalışıyor** |
| 2 | JS/CSS chunk'ları | tamamı 200, 404 yok | Asset zinciri sağlam |
| 3 | `/api/analytics/track` | `{"ok":true,"logged":true}` | Sayaç canlı |
| 4 | **`/api/config → announcement`** | **`null`** | Ziyaretçi **"Duyuru yok · Lütfen takipte kalın"** görüyor |
| 5 | **`/api/config → maintenance`** | **`enabled:true`**, 08–08 Ekim penceresi (tarih geçmiş) | Şu an site **açık**, ama **bayrak hâlâ açık** |
| 6 | `sadikUye` | **19 / 100** | Tohum kitlen = 19 kişi |
| 7 | `/api/roadmap` | 10 madde, **toplam 2 oy** | İlgi ölçümü ≈ 0 |
| 8 | Derin linkler | `/fiyat` `/blog` `/kayit` `/admin` → **404** | **Path'li her link ölü** (Vercel'de rewrite sadece `/` → `index.html`) |
| 9 | `sitemap.xml` | **1 `<loc>`** | Arama motorunun gördüğü yüzey = tek sayfa |
| 10 | `featureLocks` | `full-mode`, `v2_test_acik`, `maher`, `namaz`, `ayetKartlari` → hepsi `free` | Arayüzdeki PRO/ELİT rozetleri canlıda karşılığı zayıf |
| 11 | Commit temposu | son 30 günde **319 commit** (toplam 1051'in %30'u) ≈ **günde 10** | Emek ürüne değil iterasyona gidiyor |
| 12 | Son commit | 21 Ekim — "İndir düğmesi WAV yerine tam video üretiyor" | Hâlâ üretim modundayız |

**İlk ekran (yabancı gözüyle, 21 Ekim):** çerez modalı → üst bantta **"Duyuru yok · Lütfen takipte kalın"** → ardından "Sadık Üye: 19/100…" → sonra tam çalışan stüdyo. Yani ürün **mükemmel görünüyor ama "henüz açılmadım" diyor.**

---

## 2. TEŞHİS — üç cümle

1. **"Kimsenin haberi yok" bir kod kusuru değil, dağıtım eksikliği.** Duyuru alanı boş, sitemap tek URL, paylaşılacak linkler ölü, hedef kitle 19 kişi. Reklam/SEO/kanal yok — sadece ürün var.
2. **"Yetişemiyorum"nun sebebi hız, eksiklik değil.** 319 commit / 30 gün; her özellik 5 dile (tr, en, ur, id, ar) çevriliyor → her küçük fikir 6 katına mal oluyor. Bitmeyen şey ürün değil, **kapsam**.
3. **Lansman, yeni özellikle değil mevcut olanın ilanıyla olur.** Elinde 114 sure, 20 yazı fontu, 40+ kâri sesi, 4 video formatı, otomatik sosyal metin, 7 gün PRO denemesi, davet sistemi var. Bunların **tek bir cümleyle** anlatılması gerekiyor — bugün değil, dün.

---

## 3. KESİM LİSTESİ (lansmandan sonraya kadar dondurulan iş)

**7 gün boyunca aşağıdakilerin hiçbirine başlanmaz:**

- ❌ Yeni özellik, yeni render modu, yeni video şablonu, yeni atmosfer kategorisi
- ❌ Yeni dil paketi / yeni çeviri
- ❌ Roadmap'a yeni madde ekleme (mevcut 10 madde oylanmadan yeni madde yok)
- ❌ Refactor, optimizasyon, kod temizliği
- ❌ "Şunu da ekleyeyim, 10 dakika" işleri

**Tek istisna:** aşağıdaki 8 maddelik DoD kapısındaki kusurlar. Bunlar lansmanı bozan kusurlar, özellik değil.

### Park edilmiş iş (buralara değil, §10'a bak)

---

## 4. DoD KAPISI — "Lansman" diyebilmek için 8 madde

| # | Madde | Nasıl doğrulanır | Durum |
|---|-------|-------------------|-------|
| 1 | Duyuru metni dolu | Ziyaretçi ilk ekranda lansman cümlesi görüyor | ⬜ |
| 2 | Bakım bayrağı kapalı | `GET /api/config` → `maintenance.enabled = false` | ⬜ |
| 3 | Derin linkler açık | `/fiyat`, `/kayit` → 200 (catch-all rewrite gerekir) | ⬜ |
| 4 | Analitik tek yazıyor | Kaynak reddedilince **0 satır**, kabul edince **1 satır** | ⬜ |
| 5 | Üyelik/ödeme uçtan uca | PRO butonu → ödeme → üretim hakkı artar (gerçek test) | ⬜ |
| 6 | Sitemap gerçek | En az 4–5 `<loc>` (ana sayfa + fiyat + kayıt + hakkımızda + iletişim) | ⬜ |
| 7 | Video indirilebiliyor | Üret → "İndir" → dosya gerçekten iniyor (21 Ekim commit'i bunu düzeltti, doğrula) | ⬜ |
| 8 | Canlı tarama temiz | Asset 404 yok, 5xx yok, `/api/*` 200, ana sayfa 200 | ⬜ |

**8/8 yeşil = "Lansman" diyebilirsin.** 8'den azı yeşilse lansman yapma, çünkü ilk 5 dakikadaki hata 2. gün trafiğini öldürür.

---

## 5. İLK 60 DAKİKA (bugün, kod yok)

| Dakika | İş | Nerede | Süre |
|--------|-----|--------|------|
| 0–10 | Duyuru metnini yapıştır (§6 taslaklardan birini seç) | Admin panel → Duyuru | 10 dk |
| 10–15 | Bakım bayrağını kapat (bitmiş inşaat modu) | Admin panel → Bakım | 5 dk |
| 15–30 | **19 kayıtlı kullanıcıya mesaj** (§7.6 metnini kullan) | WhatsApp / e-posta | 15 dk |
| 30–40 | YouTube'da 90 sn gerçek ekran videosu çek | Telefon + site | 10 dk |
| 40–50 | YouTube/TikTok/Instagram için ilk 3 gönderi metnini yapıştır | §7.2 | 10 dk |
| 50–60 | Günlük ölçüm defterini aç (4 sayı) | Notlar / ölçüm panosu | 10 dk |

> **Not:** 19 kullanıcıya mesaj atlamak, 19 kişiye ulaşmanın **tek** yolu. Onlar zaten ürünü denemiş — en kolay satış havuzu. "Açıldım" mesajı onları geri getirir.

---

## 6. DUYURU METNİ TASLAKLARI (paneldeki duyuru alanına yapıştırılacak)

Üç uzunluk hazır. **A** en hızlı, **C** en net. Biri değişirse hepsi güncellenir.

**Taslak A — tek satır (acil, 2 dakika)**
> 🌙 Nûr Stüdyo açıldı — ayetini seç, saniyeler içinde İslamî videoya dönüştür. İlk 100 üreticiye ömür boyu +1 üretim hakkı (19/100).

**Taslak B — iki satır (önerilen)**
> 🌙 Nûr Stüdyo yayında! Kur'an ayetini seç → atmosferi kur → kâri sesinle video hazır. 9:16 Reels, 16:9 YouTube, 1:1, 4:5 — tek tıkla. YouTube/TikTok/Instagram açıklaması otomatik. İlk 100 üreticiye ömür boyu +1 üretim hakkı: **19/100**.

**Taslak C — üç satır + CTA (daha uzun, banner genişse)**
> 🌙 Nûr Stüdyo yayında.
> Kur'an ayetini seç, atmosferini kur, kâri sesini seç — İslamî video saniyeler içinde hazır. 114 sure, 20 yazı fontu, sinematik filtreler, otomatik sosyal medya metni.
> İlk 100 üreticiye **ömür boyu +1 üretim hakkı**. Şu an 19/100.
> 👉 nurstudyo.com

### Yayınlama adımları (kod değil, panel verisi)
1. Admin paneline gir (üst banttaki **Sadık Üye** rozetine ya da üst menüdeki **Admin** girdisine tıkla).
2. **Duyuru** bölümü → metni yapıştır → **Yayınla**.
3. Ana sayfayı **önbelleksiz** (Ctrl+Shift+R) aç → üst bantta mesajı doğrula.
4. Yayın sonrası `/api/config` çıktısında `announcement` alanı dolu görünmeli.

> ⚠️ **Bakım bayrağını kapatmayı unutma.** Şu an `enabled=true` ama tarih geçtiği için site açık görünüyor. Tarihi ileri götürürsen veya `endsAt` boş kalırsa, **tüm halk sitenin bakım ekranına düşer** — 19 kullanıcı dahil. Lansman günü en tehlikeli tek tuş budur.

---

## 7. 7 GÜNLÜK DAĞITIM TAKVİMİ

### 7.1 Gün gün

| Gün | Tarih | Tek iş | Kanal | Hedef |
|-----|-------|--------|-------|-------|
| **G0** | 26 Ekim Pzt | Duyuru yayınla + 19 kullanıcıya mesaj | Panel + WhatsApp | 19 bildirim |
| **G1** | 27 Ekim Salı | 90 sn gerçek ekran videosu | YouTube | 1 video + link |
| **G2** | 28 Ekim Çarş | 3 kısa klip (Reels/TikTok) | TikTok + IG | 3 klip |
| **G3** | 29 Ekim Perş | WhatsApp durumu + 5 üreticiye özel hediye | WhatsApp | 5 kişiye 1'e1 |
| **G4** | 30 Ekim Cuma | "Ücretsiz İslamî video aracı" formatında topluluk paylaşımı | Reddit + IG topluluk | 3 paylaşım |
| **G5** | 31 Ekim Cmt | Kâfi / WbW seri içeriği (senin en ayırt edici kozun) | YouTube Shorts | 3 klip |
| **G6** | 1 Kasım Paz | Geri bildirim turu + ilk ölçüm raporu | E-posta/DM | 10 cevap |
| **G7** | 2 Kasım Pzt | 2. dalga: "ilk 100'e 81 kaldı" geri sayımı | Tüm kanallar | 50 ziyaretçi |

### 7.2 Hazır gönderi metinleri

**YouTube (G1) — başlık**
> Ayetini Yaz, Saniyeler İçinde İslamî Video Olsun | Nûr Stüdyo

**YouTube açıklaması**
> Nûr Stüdyo: Kur'an ayetini seçiyorsun, gerisini yapıyorum. Atmosfer, kâri sesi, sinematik filtre, 9:16 / 16:9 / 1:1 / 4:5 ve otomatik YouTube açıklaması.
> 🌙 nurstudyo.com
> #İslamiVideo #KurAn #Shorts #NûrStüdyo

**TikTok / Reels (G2)**
> Ayet seç → video hazır. 9:16 İslamî video üreticisi. 🌙 nurstudyo.com #shorts #islam #kuran #reels

**WhatsApp durumu (G3)**
> 🌙 Nûr Stüdyo yayında. Ayetini seç, İslamî videon saniyeler içinde hazır. İlk 100 üreticiye ömür boyu +1 üretim hakkı — şu an 19/100. nurstudyo.com

**Reddit (G4) — topluluk kuralına uygun, spam yapmayan ton**
> Bir şey yaptım, umarım işinize yarar. **Nûr Stüdyo**: Kur'an ayetini seçtiğinizde atmosfer, kâri sesi ve sinematik filtre seçip 9:16/16:9/1:1/4:5 formatında bir video üreten ücretsiz bir araç. Otomatik YouTube/TikTok açıklaması da yazıyor. Kur'an sesleri açık arşivlerden (everyayah/mp3quran) geliyor, telif konusu yayın öncesi teyit gerektiriyor — bu yüzden reklam vermiyorum, sadece paylaşıyorum: nurstudyo.com. Geri bildirim verirseniz (özellikle neyi beğenmediniz) çok iyi olur.

**19 kullanıcıya mesaj (G0) — 1'e1, kişiselleştirilmiş olsun**
> Selam {isim}, Nûr Stüdyo'yu bugün halka açtım. Sen zaten ilk 19 üreticiden birisin, o yüzden senden özel bir şey var: hesabına **ömür boyu +1 üretim hakkı** tanımladım. Bakabilir misin? Bir video üretip bana neyi beğenmediğini yazarsan, ilk düzeltmeleri ona göre yaparım. 🌙 nurstudyo.com

### 7.3 Aralık hatırlatması
Her gün 1 gönderi. 7 günde 7 gönderi. **Yeni ürün çıkarma.** Dağıtım bir kanal değil, bir ritim işidir.

---

## 8. ÖLÇÜM PANOSU (günlük 4 sayı)

| Sayı | Nereden | Hedef (ilk hafta) | Hedef (30 gün) |
|------|---------|-------------------|-----------------|
| Ziyaretçi | admin panel / sayaç | 100 | 1.000 |
| Yeni kayıt | `sadikUye` (şu an 19) | 10 → **29/100** | 60 → 79/100 |
| Üretilen video | admin panel | 5 | 60 |
| Ücretli dönüşüm | ödeme kaydı | 1 | 10 |

**Ek ölçütler (varsa):** Hangi kanaldan geliyor (referrer), hangi ayet seçiliyor, hangi format (9:16 mı 16:9 mu), kaç kişi geri dönüyor.

> ⚠️ **Ölçüm şu an güvenilir değil** — analitik iki yerden gidiyor (çift sayım) ve çerez reddedildiğinde de yazıyor. DoD madde 4 kapanmadan bu tabloyu karar verisi olarak kullanma; sadece yön gösterici olarak bak.

---

## 9. RİSKLER VE ÖNLEMLER

| Risk | Belirti | Önlem |
|------|---------|-------|
| **Bakım bayrağı yanlışlıkla açılır** | Halka bakım ekranı | Lansman günü bayrağı kapat; paneldeki "bitiş" alanını boş bırakma |
| **Paylaşılan link ölür** | `/fiyat`, `/kayit` → 404 | DoD madde 3: catch-all rewrite |
| **Yanlış veriyle karar** | Çift sayım + KVKK ihlali | DoD madde 4 |
| **"Satıyorsun ama ücretsiz" algısı** | PRO rozetli ama `free` seviyesindeki özellikler | DoD madde 5: ya ödeme çalışsın ya rozetler gizlensin |
| **Tekrar inşaat moduna dönmek** | 10 commit/gün | §3 kesim listesi + "bir günde bir gönderi" kuralı |
| **Teknik kusur ilk gün çıkarsa** | 5xx, 404 asset | DoD madde 8: canlı tarama |

---

## 10. PARK EDİLEN İŞ (kesim listesine alındı — kaybolmadı, sıraya girdi)

Bunlar **iptal edilmedi**, lansman sonrasına kaldırıldı. Roadmap oyları gelince öncelik bunlara verilecek.

**Roadmap'teki 10 madde (canlı oy durumuyla):**

| Madde | Oy | Not |
|-------|-----|-----|
| Kelime Tabanlı Video Üretimi (V2) | 1 | En çok oy alan — ilk sıra |
| Günlük Sürpriz Hediye | 1 | — |
| AI Arka Plan Üretici | 0 | — |
| Ücretsiz 7 Gün PRO Denemesi | 0 | Deneme akışı var, tanıtımı yok → **sadece duyuru meselesi** |
| Davet Ettikçe Büyüyen Topluluk | 0 | 19/100 doluluk oranını artırır |
| Video Üzerinde Kelime Kelime (WbW) | 0 | Farklılaştırıcı |
| Ayet & Dua Kütüphanesi | 0 | İçerik yüzeyi |
| Hafızlık Testi | 0 | Büyüme kozu |
| WhatsApp Ayet Kartı | 0 | Paylaşım kozu (WOM) |
| Günlük Devam Serisi | 0 | Geri dönüş kozu |

**Ayrıca park edilenler:** 5 dilli paket genişletmesi, yeni atmosfer kategorileri, Efes/kanal içerikleri, sinematik filtre seti, admin panel genişletmeleri.

---

## 11. LANSMAN SONRASI (ilk 2 hafta)

- Günlük ölçüm panosunu doldur (4 sayı) → ilk rapor: **30 Ekim**
- DoD'deki kalan maddeleri kapat (özellikle 3, 4, 5)
- 19 kullanıcıdan 10 cevap topla → ilk geri bildirim döngüsü
- **Ancak bundan sonra** yeni özellik: o gün itibaren roadmap oylarına göre sıra al
- İlk ay: "ilk 100 üretici" kampanyasını bitir (81 kişi kaldı) → bu bir lansman değil, bir **görev** olarak kapat

---

## 12. TEK SATIR ÖZET

> **Yeni özellik ekleme. Duyuruyu doldur, bayrağı kapat, 19 kişiye mesaj at, 7 gün boyunca günde bir gönderi yap, 4 sayıyı ölç. Gerisi zaten hazır.**

---

*Bu plan 21–22 Ekim 2026 tarihinde canlı site üzerinde yapılan gerçek ölçümlere dayanır; takvim 26 Ekim 2026'ya hizalanmıştır. Uygulama için gereken her değişiklik senin onayına bağlıdır.*
