# 🔔 HATIRLATMA LİSTESİ — Buffy bunları hatırlatır

> Kural: Buffy her işin sonunda bu listeyi hatırlatır; "neyi hatırlatacaksın?"
> diye sorduğumda da aynen buradakileri sayar. Son güncelleme: 09.10.2026

1. **Supabase Free → Pro (~25$/ay)** — Free'de 7 gün inaktivlik pause riski +
   limit dayasında kilitlenme var. **Lansman haftasında şart.**

2. **Pooler 6543 env'i** — kod bugün REST kullandığı için zorunlu değil; ama
   gelecekteki pg bağlantıları için `SUPABASE_DB_POOLER_URL` + Transaction mode +
   Max Clients 200 ayarı **runbook'ta adım adım yazıyor**.

3. **Upstash Redis (ücretsiz)** — `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   ikilisini Vercel env'e ekle → rate limit instance'lar arası ortak olur.
   (Durum: env2.txt'de şu an YOK; quran proxy'nin 2. katmanı pasif bekliyor —
   edge cache zaten yükü taşıyor, ekleyince otomatik devreye girer.)
   ⚠ **CANLI KANIT (30.09):** admin-akis-testi 65 istekte 429 YAKALAYAMADI —
   admin:session 60/dk limiti şimdilik instance-içi; Vercel dağıtınca aşılabilir.
   Saldırı kapısı değil (403 zaten duruyor) ama lansmandan ÖNCE eklensin.
   Doğrulama: `node scripts/admin-akis-testi.mjs <site> <env>` → 13/14 PASS.

4. ~~**SQL dosyalarını Supabase SQL Editor'de koştur**~~ ✅ **ÜÇÜ DE KOŞTURULDU + CANLIDA DOĞRULANDI:**
   - ~~`admin-audit-metadata-3009.sql`~~ ✅ deny kaydı metadata ile DB'ye düşüyor
     (`node scripts/admin-audit-dogrula.mjs`)
   - ~~`zikir-gunluk-grafik-2909.sql` + `zikir-arsiv-cron-2909.sql`~~ ✅ (30.09)
     canlıda grafik çiziliyor (Zikirmatik → "Günlük topluluk zikirleri"), RPC atomik
     (toplam+kova birlikte), arşiv RPC idempotent, cron izi son_arsiv güncel.
     Doğrulama: `node scripts/zikir-grafik-dogrula.mjs <site> <env>` (7/8 + 1 test-hatası → düzeltildi).
     NOT: grafik serisi bugün başladı (tablo yeni kuruldu) — öncesi uydurulmaz, dürüst.

5. **🔴 Kırmızı Kod planı** — DB zorlanırsa ne yapılacağı (compute resize, sorgu
   iptal, tek-bayraklı bakım modu) **runbook B5'te** yazıyor. Lansman günü panik
   yok, takip et.

6. **SRP parçalama görevi (30.09 denetimi, "şimdilik dokunma" dendi):**
   `src/studio` ✅ uyumlu (33 dosya, en büyük 484). **500+ dosyalar**:
   StudioApp.tsx ~2368, QuranLearnModal 2121, IslamicToolsPanel 1383,
   AdminDashboardModal 1285, ModalsContainer 821, AyetKartlariModal 920,
   KesfetModal 690, DesignSettingsPanel 686, RoadmapModal 617, PremiumModal 616,
   tier.ts 573, HafizlikTestiModal 563, api/admin/action.ts 593.
   (data/ayetKartlariMega*.ts = içerik verisi, ihlal değil.)
   → **Adım 1 TAMAM (30.09): AtmosferSeciciModal (331) ModalsContainer'dan çıktı, canlı GO ✅.**
   → **Adım 2 (30.09, LOCAL — push/commit YOK): 8 dosya 500 altına indi** (tier 406,
     HafizlikTestiModal 431, action.ts 468, PremiumModal 477, DesignSettingsPanel 481,
     RoadmapModal 484, KesfetModal 485 + ModalsContainer 591). 20 yeni parça dosyası.
     esm-tarama'ya İMPORT BÜTÜNLÜĞÜ + IMPORT↔YEREL ÇAKIŞMA güvenlik ağları eklendi.
     Preview UI doğrulaması: Premium/Quran/Tefsir/AyetKart/Keşfet/Dua/Roadmap modalları ✅.
     Kalan 500+: AyetKartlariModal 642, AdminDashboardModal 842, IslamicToolsPanel 1117,
     QuranLearnModal 1860, StudioApp 2182.
   → **BAĞLANTI RAPORU (30.09): 20/20 parça↔ana bağlantısı sağlam** — scripts/_baglanti-raporu.mjs
     ile kanıtlandı (import var + semboller gerçekten kullanımda + yanlış-ad yok).
     2 küçük temizlik: AyetKartlariModal'da wrapCanvasText, QuranLearnModal'da SurahInfo
     import'u kullanılmıyor (zararsız; parçalama push'unda temizlenir).
   → ★ DİKKAT: HafizlikTestiModal'ın parçalı yedeği (scripts/_tmp-hafizlik-parcali.tsx)
     UZUNLUK-EŞİTLİĞİ fix'siz! Parçalama push'lanırken fix'i parçalıya taşı (4ac6f5f'teki
     yanlışHavuz bloğu). Yedekler: scripts/_srp-yedek/ (parçalı M dosyaları).
   → **CANLIYA GİDENLER (30.09): 4ac6f5f hafızlık fix + 0d97881 jeton dürüstlüğü +
     header çakışma fix — ikisi de canlı GO ✅**
   → **SRP 2. TUR (09.10, pushlandı: 7d51511) — 5 büyük dosya daha bölündü (hepsi
     600 üstündekilerdi; 500 eşiğine hedef YOK, 600+ hedef):**
     AdminDashboardModal 777→482 (+src/hooks/useAdminYonetim.ts 365),
     KesfetModal 855→532 (+src/components/kesfetSekmeler.tsx 390; KelimeKarti+5 sekme bloğu),
     QuranLearnModal 1562→1113 (+src/components/quranLearnEkranlar.tsx 577; öğren+dinle ekranı),
     ModalsContainer 682→~628 (Google OAuth handleGoogleAuth → modalHelpers.tsx),
     StudioApp 1732→1689 (+src/studio/useDilSenkron.ts 83; meal-dil+paylaşım+RTL efektleri).
     Doğrulama: tsc 0 hata + build ✓ + esm-tarama PASS + duman 68/68 PASS
     + npm test (ai-match) 17/17 — test artık StudioApp'ten el-çıkarım yerine
     gerçek studio/ayetKategori.ts motorunu esbuild'le derleyip çalıştırıyor.
     Kalan 500+: IslamicToolsPanel ~684/1117, QuranLearnModal 1113, StudioApp 1689,
     KesfetModal 532'den büyük olanlar... (600+ takip: QuranLearnModal 1113,
     StudioApp 1689, AyetKartlariModal ~642 — sonraki turda).
---
*Bu dosya bilerek repo'da untracked bırakıldı; Buffy sen istemedikçe
commit'lemez, push'lamaz.*
7. **💡 Stüdyo video canvas'ına kullanıcı mesaj katmanı (30.09 mimari plan hazır, kod YOK):**
   Video = preview canvas'ının captureStream'i → useCanvasDraw'a eklenen çizim videoya otomatik düşer.
   Desen = brandSignature'ın kopyası (state+localStorage+hook ref+draw sonunda çizim).
   Çekirdek src/studio/mesajKatmani.ts (ayetKartMotoru ile paylaşımlı drawMesaj).
   Karar bekliyor: tier kuralı (öneri: temel herkese, hat paleti PRO+), sabit/fade, konum seti.
   Tahmin ~240 satır / 5 dosya. Detaylı plan sohbet raporunda (30.09).

8. **🔓 V2_TEST_ACIK bayrağı AÇIK (01.10, canlı — `src/config/ozellikBayraklari.ts`):**
   Oylamadaki 6 V2 modalı (ayetKartlari/kesfet/hafizlikTesti/ayetNotlari/ayetPaketleri/ozelGunTakvimi)
   test süresince HERKESE AÇIK (0d66c02). Oylama havuzu korundu — yol haritasında oylamaya devam ediyorlar.
   **Oylama ile açma devreye alınırken bayrağı FALSE yap** → kilitler birebir geri gelir.
   Atmosfer/açıklama (fallback "free") ve üyelik (tier) kilitlerine DOKUNULMADI.
   Doğrulama zinciri: build + esm-tarama + duman 66/66 (V2 modallar artık gerçek açılış turunda)
   + local preview girişsiz açılış + canlı UI kanıtı + canlı tarama GO.
   Ayrıca: HafizlikTestiModal'da i18n turundan kalan eksik `translate` import'u bu turda yakalanıp
   düzeltildi (0d66c02) — V2 açılınca ReferenceError patlıyordu.
   ★ KURAL (sahibin emri): her işlemden sonra build + LOCAL test zorunlu, asla atlanmaz.
