-- ════════════════════════════════════════════════════════
-- ★ V3 → V2 TAŞIMA SEÇENEĞİ — 27 Eylül 2026 (Buffy taslağı)
--
-- KONU: Kodu hazır ve sitede ÇALIŞAN 6 V3 maddesinin oylamaya
--   (V2) taşınması. 27 Eylül kuralı gereği "sitede aktif çalışan
--   tüm özellikler oylamada" — bu 6'sı bu kuralın dışında kalmıştı.
--
-- CANLIDA TEYİT EDİLDİ (27.09): 6 madde de DB'de V3+active durumda.
--
-- ★ GÜVENLİK / IDEMPOTENCE:
--   • Satır SİLME yok — yalnız version alanı güncellenir → MEVCUT
--     OYLAR KORUNUR (nur_roadmap_votes feature_id'ye bağlı, etkilenmez).
--   • `where version <> 'V2'` sayesinde tekrar çalıştırmak zarar vermez.
--   • Uygulama tarafı: RoadmapModal açılışta DB'den çekip MERGE yapar —
--     kod değişikliği GEREKMEZ, taşıma anında herkesin ekranına düşer.
--   • Kullanıcının tarayıcısındaki eski localStorage cache'i ilk
--     açılışta DB ile değişir; sorun çıkarmaz.
--
-- ÇALIŞTIRMA: Supabase SQL Editor → yapıştır → Run.
-- ════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════
-- SEÇENEK A — ÖNERİLEN: SEÇİCİ TAŞIMA (4 + 2 planı)
--   Şimdi 4'ü taşı (tam çalışan, kitle net olanlar);
--   haftanin-videosu fix SQL sonrası taşınır (aşağıda hazır bekliyor).
-- ════════════════════════════════════════════════════════

-- ★ HEMEN TAŞINACAK 4'LÜ (koşulsuz güvenli — kodu tam çalışıyor)
update public.nur_roadmap_features set version = 'V2',
  description = 'Kur''an Dinle ekranında 📖 Mushaf düğmesi: krem sayfa, satır satır akış, ayet numarası altın dairede — gerçek mushaf hissi.'
  where id = 'mushaf-gorunumu' and version <> 'V2';

update public.nur_roadmap_features set version = 'V2',
  description = 'Keşfet''te 16 tecvid kuralı: izhar, idgam, med, şedde, kalkale... tanım + örnek + seviye rozetiyle.'
  where id = 'tajvid' and version <> 'V2';

update public.nur_roadmap_features set version = 'V2',
  description = 'Ayet Kartları''nda 📸 Kendi Fotoğrafınla Hat Kartı: fotoğrafını yükle, ayet altın hat yazısıyla işlensin, PNG indir.'
  where id = 'foto-hat-karti' and version <> 'V2';

update public.nur_roadmap_features set version = 'V2',
  description = 'Her başarılı üretim grafiğine işlenir — kaç video, hangi sure, hangi atmosfer. Yalnız cihazında, sunucuya gitmez.'
  where id = 'uretici-istatistik' and version <> 'V2';

-- ★ FİX SONRASI TAŞINACAK 2'Lİ (fix-rpc-ambiguous-2709.sql ÇALIŞTIRILDIKTAN
--   SONRA aşağıdaki bloğun başındaki '-- ' işaretlerini kaldır ve çalıştır)
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Ürettiğin videonun linkini öner, admin onaylayınca vitrinde yayınlanır; beğenilerle haftanın en iyisi seçilir.'
--   where id = 'haftanin-videosu' and version <> 'V2';
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Dinlediğin ayet mp3''leri cihazına cache''lenir (offline tilavet, max 120 ayet) — İslami Araçlar''da 📥 durum kartı.'
--   where id = 'offline-mod' and version <> 'V2';


-- ════════════════════════════════════════════════════════
-- SEÇENEK B — TAM TAŞIMA (6/6 birden)
--   Seçenek A yerine B'yi kullanmak istersen A bloğunu yorumla,
--   aşağıdakileri aç. (offline-mod açıklaması dürüst "tilavet" kapsamında)
-- ════════════════════════════════════════════════════════
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Kur''an Dinle ekranında 📖 Mushaf düğmesi: krem sayfa, satır satır akış, ayet numarası altın dairede.'
--   where id = 'mushaf-gorunumu' and version <> 'V2';
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Keşfet''te 16 tecvid kuralı: izhar, idgam, med, şedde, kalkale — tanım + örnek + seviye rozetiyle.'
--   where id = 'tajvid' and version <> 'V2';
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Ürettiğin videonun linkini öner, admin onaylayınca vitrinde yayınlanır; beğenilerle haftanın en iyisi seçilir.'
--   where id = 'haftanin-videosu' and version <> 'V2';
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Dinlediğin ayet mp3''leri cihazına cache''lenir (offline tilavet, max 120 ayet).'
--   where id = 'offline-mod' and version <> 'V2';
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = 'Kaç video, hangi sure, hangi atmosfer — üretim grafiğin cihazında.'
--   where id = 'uretici-istatistik' and version <> 'V2';
--
-- update public.nur_roadmap_features set version = 'V2',
--   description = '📸 Kendi Fotoğrafınla Hat Kartı: fotoğrafına altın hat sanatıyla ayet işlenir, PNG indir.'
--   where id = 'foto-hat-karti' and version <> 'V2';


-- ════════════════════════════════════════════════════════
-- GERİ DÖNÜŞ (pişman olursan): istediğin maddeleri V3'e geri alır.
--   Oylar yine korunur — sadece liste yer değiştirir.
-- ════════════════════════════════════════════════════════
--
-- update public.nur_roadmap_features set version = 'V3'
--   where id in ('mushaf-gorunumu','tajvid','haftanin-videosu','offline-mod','uretici-istatistik','foto-hat-karti')
--     and version <> 'V3';


-- ════════════════════════════════════════════════════════
-- DOĞRULAMA (ayrı sorgu olarak çalıştır):
--   select version, count(*) from public.nur_roadmap_features group by version;
--   Seçenek A sonrası beklenti: V2 = 35 + 4 = 39, V3 = 22 - 4 = 18
--   Seçenek B sonrası beklenti: V2 = 41, V3 = 16
--
--   select id, version from public.nur_roadmap_features
--     where id in ('mushaf-gorunumu','tajvid','haftanin-videosu',
--                  'offline-mod','uretici-istatistik','foto-hat-karti');
-- ════════════════════════════════════════════════════════
