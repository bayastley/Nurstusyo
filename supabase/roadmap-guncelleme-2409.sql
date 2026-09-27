-- ════════════════════════════════════════════════════════
-- NUR_ROADMAP v3 — 24 Eylül 2026 güncellemesi seed'i
-- Supabase SQL Editor'de çalıştır. Tekrar çalıştırmak ZARAR VERMEZ
-- (on conflict do nothing sayesinde mevcut kayıtlar korunur).
--
-- Bu seed, bugün LANSMAN ÖNCESİ tamamlanan özellikleri kataloglar.
-- Kullanıcı yol haritasında bakıp oy vermeden önce neyin bittiğini
-- görür; admin dilerse bu kayıtları panelden "active=false" yaparak
-- vitrinden çekebilir.
-- ════════════════════════════════════════════════════════

insert into public.nur_roadmap_features (id, version, title, description, icon)
values
  -- ── BUGÜN TAMAMLANANLAR (yol haritası txt'sinden) ──
  ('yabanci-radyo',        'V2', '🌍 Yabancı Dil Radyoları', 'Almanca/İngilizce konuşan kardeşler için uluslararası hoca radyoları eklendi — tarayıcı diliyle otomatik önerilir.', 'akilli_radyo'),
  ('site-hakkinda',        'V2', 'Bu Sitede Ne Var?', 'İçerik kaynaklarımız (Diyanet, mp3quran, sahih hadis), telif bildirimi ve iletişim — tek sayfada şeffaflık.', 'arsiv'),
  ('zikir-halka',          'V2', 'Zikirmatik 33''lük Halka + Günlük Seri', 'Her 33 zikirde dolar halka; üst üste günlerce geldiğinde 🔥 serin büyür.', 'zikirmatik'),
  ('cuz-haritasi',         'V2', '30 Cüz Görsel Haritası', 'Hatim takibinde 30 cüz hücresi işaretledikçe altın renkle dolar — ilerlemen gözünün önünde.', 'hatim'),
  ('ramazan-merkezi',      'V2', 'Ramazan & Kandil Merkezi', 'Hicri takvimle Ramazan''ı otomatik tanır: iftar/imsak sayacı, günlük amel önerisi, kandil takvimi.', 'kandil'),
  ('oruç-takibi',          'V2', 'Oruç Takibi', 'Bugün oruçtum işaretle, kaza borcunu say — Ramazan ve ötesi için.', 'zikirmatik'),
  ('ayet-paketleri',       'V2', 'Hazır Ayet Paketleri', 'Vesveseye karşı, sabır, cuma mesajları… 8 hazır paket tek tuşla stüdyoya — video 2 dakikada.', 'seri_uretim'),
  ('shorts-modu',          'V2', '📱 Shorts Tek Tuş', '9:16 + Kısa modu tek tıkla: "Instagram Reels / YouTube Shorts için ideal".', 'mobil'),
  ('ozel-gun-takvimi',     'V2', 'Özel Gün Takvimi', 'Cuma, Mevlid, Regaib, Miraç, Kadir Gecesi — temaya uygun üretim önerisi + hatırlatma bildirimi.', 'push'),
  ('bugun-hediye',         'V2', 'Bugünün Hediyesi', 'Her gün girişte küçük sürpriz: sahih hadis, zikir daveti, ara sıra +1 deneme video.', 'ucretsiz_deneme'),
  ('kesfet',               'V2', 'Keşfet Köşesi', 'Hadis bankası, kıssalar, soru-cevap, kelime kartları, sure bilgileri, namaz öğretici, dua rehberi — 12 sekme.', 'arsiv'),
  ('hafizlik-testi',       'V2', 'Hafızlık Testi', '"Devamını getir" — ayeti tamamla, 4 seçenek, puan takibiyle hafızanı ölç.', 'kelime_video'),
  ('latin-okunus',         'V2', 'Latin Okunuş (Transliterasyon)', 'Arapça bilmeyenler için ayet altında "Bismillahirrahmanirrahim" tarzı latin okunuş satırı.', 'meal_dinle'),
  ('karisik-hoca',         'V2', 'Karışık Hoca Dinleme', 'Komple Kur''an modunda her sureyi farklı hoca okusun — "hatim karışık hocalarla".', 'meal_dinle'),
  ('hoca-karsilastirma',   'V2', 'Hoca Karşılaştırma', 'Aynı ayeti farklı kârilerden dinle — "bu kelimeyi kim nasıl okuyor" merakı.', 'meal_dinle'),
  ('coklu-dilli-meal',     'V2', 'Çok Dilli Meal', 'İngilizce, Almanca, Fransızca, İspanyolca mealler eklendi — uluslararası kardeşlerimize.', 'arsiv'),
  ('karsilastirmali-meal', 'V2', 'Karşılaştırmalı Okuma', 'İki meali yan yana gör (Diyanet + Elmalılı…) — derin okuyucular için.', 'notlar'),
  ('cami-bulucu',          'V2', 'Cami Bulucu', 'Konumunla ya da şehir aramasıyla yakın camileri haritada bul.', 'mobil'),
  ('ayet-notlari-v2',      'V2', 'Ayet Notlarım (Şifreli)', 'Tefsir okurken düşünceni yaz — AES şifreli, sunucuya gitmez, sadece cihazında.', 'notlar'),
  ('kitaplik',             'V2', 'Kitaplığım', 'İşaretlediğin ayetler, notların, indirdiğin videolar — hepsi tek köşede.', 'koleksiyon'),
  ('gece-modu',            'V2', 'Okuyucu / Gece Modu', 'Kehribar renkli sıcak ton — uykudan önce okumak gözü yormaz.', 'uyku_tilaveti'),
  ('salah-tracker',        'V2', 'Namaz Takibi (Salah Tracker)', '5 vakti işaretle, serini (streak) büyüt — her gün dönmenin en güzel sebebi.', 'namaz_bildirim'),
  ('ezkar-takip',          'V2', 'Ezkâr Takibi', 'Sabah-akşam ezkârını okudukça işaretle — alışkanlık kazan.', 'zikirmatik'),
  ('toplu-hatim',          'V2', 'Topluluk Hatim Programı', 'Bu ayın toplu hatimine bir cüz al, katkı ver — toplam hatim sayacı vitrinde.', 'hatim'),
  ('pwa-sihirbazi',        'V2', 'PWA Kurulum Sihirbazı', '"Ana Ekrana Ekle" öğreticisi — siteyi uygulama gibi kur, bildirimler açılsın.', 'mobil'),
  ('durum-karti',          'V2', 'WhatsApp Durum Kartı (9:16)', 'Ayet Kütüphanesi''nden 9:16 boyutta kart indir — duruma tek tuş koy.', 'mobil'),
  ('kanal-rehberi',        'V2', 'Kanal Rehberi', 'YouTube/Instagram algoritma ipuçları — videolarınla büyümen için pratik rehber.', 'seriler')
on conflict (id) do nothing;
