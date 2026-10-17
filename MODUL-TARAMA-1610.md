# 16.10 Kullanıcı Raporu Geri Bildirimi — Modülleri Geri Getirme

## Şikayet
"Hafızlık testi nerde, haftanın videosu nerde kanka ekranda yok — kitledin mi? Diğer eksikler nerde?"

## Soruşturma Sonuçları

### 1. Kullanıcın istediği modüller NEREYE GİTTİ?
Git потому-log analizi: bunlar BENDEN ÖNCE kaldırılmış (08.10 commit 268975a
"SW v7 + menü trim: menü kullanıcı emriyle sadeleşti") — o trime göre
şunlar menüden çıkartılmış:
- Hafızlık Testi
- Haftanın Videosu (HaftaninVideosuModal)
- Keşfet Merkezi (Hadis & Kıssa & Rehber)
- Özel Gün Takvimi
- Ramazan / Kandil modülü
- Kâbe Canlı (sonradan geri geldi!)
- Kur'an Öğren (sonradan geri geldi!)

### 2. Şu an menüde neler var? (canlı doğrulama — 16.10)
- Kayıt Ol / Giriş Yap
- Güncellemeler (11)
- Araçlar
- Kur'an Öğren · Dinle (GERİ GELDİ rozetli)
- Ayet Kütüphanesi
- Ayet Notlarım
- Kelime Atölyesi
- Arka Plan Üretici
- Arkadaşını Davet Et
- Hazır Ayet Paketleri
- Tema Galerisi
- Öneri Bildir / Sorun Bildir
- Premium Pro
- Hediye Kodu

### 3. Kod analizi
- Modal bileşenleri hâlâ mevcut (silinmemiş): ModalsContainer.tsx
  hafizlikTesti, kesfet, haftaninVideosu, ayetKartlari, ozelGunTakvimi
  render'ları duruyor — sadece MENÜ GİRİŞİ kaldırıldı.
- i18n anahtarları duruyor: menuHafizlikTesti, menuHaftaninVideosu, menuKesfet,
  menuOzelGunTakvimi.
- V2 kili: hafizlikTesti/kesfet/ozelGunTakvimi v2Acik() aşamasına
  takılıyor — v2TestAcik/inceleme/master dışında kilitli (V2_KILITLI
  modülünde). Bu "kadar" blok yalnızca UI raporluyor.

## Sonuç / Aksiyon
Bu modüller görünmüyor — yok silinmiş, yok kırılmış. 08.10 tarihli menü-trim
kararıyla menüden bilinçli olarak çıkartılmışlar; tamamı kodda duruyor ve
tek butonla geri eklenebilir (HeaderTopBar.tsx L247 civarına ek 4-8 satır).

Hafızlık Testi ve Haftanın Videosu menüye GPA-getirilir.
Diğer eksikler için kullanıcıya sorulacak:
- Keşfet Merkezi de geri gelsin mi (Hadis & Kıssa & Rehber)?
- Özel Gün Takvimi geri gelsin mi?
- Ramazan/Kandil modülünü de geri getir mi? (şu an Ramazan mevsimi değil ama)
