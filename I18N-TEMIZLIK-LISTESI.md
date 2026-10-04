# i18n Temizlik Listesi — Hardcode Türkçe Taraması

> Tarih: 04.10.2026 · Yöntem: `_tr-tarayici.mjs` (string literal + JSX metin düğümü taraması; yorumlar hariç, teknik stringler filtreli). Aday sayıları **üst sınırdır** — template literal içindeki değişken adları/CSS sınıfları da sayılır; gerçek yeni anahtar sayısı ≈ %70-80.
> Mevcut sözlük: **651 anahtar × 5 dil** (tr/en/ar/id/ur). Zaten hazır yardımcılar: `vakitAdi()`, `sureceCevir()`, `sureBirlestir()`, `uretimHakki` anahtarı (dicts L222), `getPaymentCopy()`.

---

## TUR A — P1 KRİTİK AKIŞLAR (~90-100 yeni anahtar)

**Neden önce:** Kesinti, çökme, giriş ve para/jeton akışları — kullanıcı en savunmasız anında yanlış dil görüyor. Hepsi küçük dosyalar, hızlı kazanım.

| # | Dosya | Aday | İçerik örneği |
|---|---|---|---|
| 1 | `src/components/MaintenanceScreen.tsx` | 14 | "şimdi açılıyor", "yaklaşık ${saat} saat ${dakika} dakika sonra açılacaktır", "Tarayıcın bildirimleri desteklemiyor" |
| 2 | `src/utils/safeFetch.ts` | 5 | "İnternet bağlantısı yok", "Sunucu hatası (${res.status})", "Bağlantı kurulamadı" → **tüm notify akışına besleniyor** |
| 3 | `src/components/ErrorBoundary.tsx` | 5 | "⚠️ geçici bir sorun yaşadı", "↻ Tekrar dene" |
| 4 | `src/components/OfflineBar.tsx` | 1 | "📶 Bağlantı yok — işlemler bekletiliyor…" |
| 5 | `src/studio/useAuth.ts` + `useAuthSession.ts` | 15 | Google giriş hataları: "⚠️ Google giriş oturumu doğrulanamadı…", "Google ile giriş başarılı · hoş geldiniz" |
| 6 | `src/studio/useManualAuthActions.ts` | 16 | "Giriş başarılı! Hoş geldiniz.", "${rl.message} (${…} sn kaldı)" |
| 7 | `src/studio/useWallet.ts` | 6 | "⚠️ Sistem saatiniz gerçek zamanla uyuşmuyor…", "🕌 Cuma bonusu: +${friday} jeton" |
| 8 | `src/studio/useTier.ts` | 11 | "${featureLabel} için ${n} jeton gerekiyor · mevcut: ${x}", "⚠️ …hakkın düşülemedi — sayfayı yenile" |
| 9 | `src/studio/useBan.ts` | 11 | Ban sebep etiketi "Sistem Güvenlik & Yasal Hak İhlali", kullanıcı bildirimleri |
| 10 | `src/studio/useVideoGenerator.ts` | 26 | "🌙 Bugünkü deneme hakkın doldu…", "🎁 Ücretsiz deneme hakkın bitti…", "Önce en az bir ayet seçin" |
| 11 | `src/rateLimiter.ts` | 5 | "⏱️ Çok hızlı üretim yapıyorsunuz…" |
| 12 | `src/components/SevapSayaciKarti.tsx` | 2 | "BU AY NÛR STÜDYO'DA", "Sen de okudukçana eklenir — Kur'an Sayfaları'nda ✓ OKUDUM'a basman yeterli." |

**Özel notlar:**
- MaintenanceScreen süre cümleleri dinamik → `sureceCevir()`/`sureBirlestir()` mevcut yardımcılarıyla yaz.
- useAuth.ts ile useAuthSession.ts **aynı Google akışının kopyası** → çevirirken birleştirme fırsatı (teknik borç).
- useGuestTrial'daki "günlük-sınır" LS anahtarı — çevrilmez, yalnız value mesajları.

---

## TUR B — P2 ANA EKRAN & STÜDYO ÇEKİRDEĞİ (~120-150 yeni anahtar)

**Neden:** Her oturumda görünen ana ekran, sağ panel, kilit rozetleri ve ödeme kartları.

| # | Dosya | Aday | İçerik örneği |
|---|---|---|---|
| 1 | `src/studio/studioConstants.ts` | 36 | Vakit adları (İmsak/Öğle/Akşam…) → **`vakitAdi()` zaten var, yeniden bağla**; format sub'ları ("Reel", "Kare", "Kısa") |
| 2 | `src/components/modalsContainerBolumler.tsx` | 47 | Vakit adları tekrar, "Şifre gerekmez · Anında +5 ⚡ Üretim hakkı", mikro kilit metinleri |
| 3 | `src/components/LockBadge.tsx` | 6 | "Pro Üyelik Gerekir", "Elit Üyelik Gerekir", "V2/V3 Güncellemesi Yakında", "Bakımda" |
| 4 | `src/components/DesignSettingsPanel.tsx` | 33 | title'lar: "Ses örneğini çal", "Üyelik gerekli"; "⚡ Üretim hakkı" etiketleri (`uretimHakki` anahtarı hazır) |
| 5 | `src/components/VideoPreviewSection.tsx` | 15 | "Video çıktınız burada görünür", "Videoyu cihazına kaydet", indirme hataları |
| 6 | `src/StudioApp.tsx` | 42 | "Video üretimi devam ediyor. Sekmeyi kapatırsanız…", meal güncelleme bildirimleri, font uyarısı |
| 7 | `src/payments/pricingData.ts` + `pricing.ts` | 38 | Plan kartları: "Kısa Video", "59 saniye · Reels & Shorts" (**ödeme ekranı — getPaymentCopy desenine uy**) |
| 8 | `src/tier.ts` | 8 | "Kısa Video (59 sn)" plan/feature etiketleri |
| 9 | `src/components/HeaderTopBar.tsx` | 4 | "Yakında Gelecek Modüller", "STÜDYO" |
| 10 | `src/components/PwaKurulumBanneri.tsx` | 26 | "Ana Ekrana Ekle", "Uygulamayı yükle", "✓ Güncellendi" |
| 11 | `src/components/TelifDisclaimer.tsx` | 7 | "Telif Hakkı Uyarısı", "Content ID telif uyarısı" bloğu |
| 12 | `src/components/SocialSharePanel.tsx` | 5 | "Paylaşım metni kopyalandı", "AI başlık üretilemedi, lokale geçiliyor" |
| 13 | `src/utils/errorReport.ts` | 7 | Hata kategori etiketleri: "🎬 Video üretim hatası" vb. |
| 14 | `src/studio/useShareActions.ts` | 7 | "📱 Videoyu cihazından Reels'e yükle…" |
| 15 | `src/data/reciters.ts` (+`src/reciters.ts` — **iki kopya var, birleştir!**) | 6+6 | "Telif Riski Düşük", riskAciklamasi "Tahmini dusuk risk.", ülke adları |
| 16 | `src/components/MiniTur.tsx`, `UIElements.tsx`, `renkCubuguSecici.tsx`, `hatFontuSeridi.tsx`, `useAudioPreview.ts`, `studioHelpers/studioAppBolumler` | ~50 | Çeşitli küçük etiketler/aria'lar |

---

## TUR C — P3 MODAL UI İSKELETLERİ (~80-120 yeni anahtar, içerik hariç)

**Neden:** Modalların buton/sekme/boş-durum metinleri; içerik gövdeleri (ayet/hadis metinleri) bu turda ÇEVİRİLMEZ — Veri katmanına bırakılır.

`AyetPaketleriModal` (127 aday — çoğu paket içeriği; UI kısmı ~20) · `RamazanModal` (87) · `QuranLearnModal` (85) · `KendiSesModal` (65) · `KesfetModal` + `kesfetTemel/kesfetDuaBolumu` (77) · `RoadmapModal` + `roadmapVeri` (150 — UI etiketleri) · `BugunHediye.tsx` (113 — hadis alıntıları içerik, ~10 UI) · `SiteHakkindaModal` (26) · `OzelGunTakvimiModal` (34) · `HaftaninVideosuModal` (35) · `DavetModal` (18) · `KelimeAtolyesiModal` (18) · `AyetKartlariModal` (17) · `AtmosferSeciciModal` (17) · `KabeCanliModal` (15) · `AyetNotlariModal` (8) · `HafizlikTestiModal` kalıntıları (9) · `hafizlikIstatistik/Veri/Grafigi` (37) · `IslamicToolsPanel` + `islamicTools*` (144) · `adminAtmosphereCategories` (68 — atmosfer kategori adları UI'de görünür) · `holidayCalendar` (26 — bayram adları) · `feedbackBox` (4)

---

## P4 — KARAR BEKLEYEN

1. **Admin panelleri TR kalsın mı?** `AdminBroadcastPanel` (118), `adminDashboardBolumler/Tabs/Modal/Kabuk` (~170), `AdminUsersTab` (49), `ZipExplorer` (17), `UserUploadPanel` (12), `api/admin/action.ts` (57) — yalnızca admin görüyor. Öneri: **TR kalır**, listeden düşer (kullanıcı kararı).
2. **api/ sunucu hata mesajları (~150 aday, 25+ dosya):** `api/referans.ts` ("Çok hızlı — biraz bekle"), `api/rewards/claim.ts` (12), `api/roadmap.ts` (12), `api/payments/*` (~40), `api/push/send.ts` (15), `api/render/authorize.ts` (14), `api/auth/google.ts` (19). **Mimari karar:** (a) önerilen → API `error-code` döndürsün, client `t("err."+kod)` ile çevirsin; (b) Accept-Language/NUR_LANG parametresi. (a) kontrat değişikliği gerektirir, tek turda yapılmaz — alt turlara bölünür.
3. **`src/data/titleData.templates.ts` (140):** AI başlık şablonları. i18n tur 1'de AI üretimi 5 dile bağlandı — bu dosyanın rolü (lokal fallback mı, aktif mi) `api/ai/title-generate.ts` ile birlikte kontrol edilmeli; aktifse fallback şablonlar da dile göre seçilmeli.

---

## VERİ KATMANI — AYRI İÇERİK PROJESİ (kapsam kararı; UI taramasından düşüldü)

~3.500 aday, dini içerik çevirisi (meal/hadis/kıssa kalitesi riski taşır — mütercim onayı gerekir):
`ayetKartlariMega1/2/Ek/Data` (~1.700) · `hadisData` (211) · `sureBilgileriEk` + `surahDescriptionsDataPart1/2` (~330) · `soruData` (184) · `kelimeAtolyesi` + `kelimeData` (363) · `dualar.ts` (110) · `ruhHalleri.ts` (137 — "biktım/tasıyamıyorum" kullanıcı girdi etiketleri!) · `clipsData1/2` + `clips/*.ts` (~1.000 klip adı/açıklaması — atmosfer seçicide görünür) · `meal_fixes.ts` (104) · `kissas.ts` (39) · `api/push/hadisler.ts` (72 — push bildirimleri kullanıcının dilinde gitmeli → P3-P4 arası önceliklendirilebilir)

---

## ÖZET

| Tur | Kapsam | ~Yeni anahtar | Sözlük sonrası |
|---|---|---|---|
| A (P1) | Kritik akışlar | ~90-100 | ~750 |
| B (P2) | Ana ekran/stüdyo çekirdeği | ~120-150 | ~900 |
| C (P3) | Modal UI iskeletleri | ~80-120 | ~1000 |
| Karar | Admin (TR kalsın?), api hata mimarisi, içerik datasetleri | — | — |

Her tur kalıcı emir zincirinden geçer: tsc → duman 68/68 → build → temiz clone → commit → push → deploy teyidi → canlı doğrulama (her dilde örnek ekran) → canli-tarama GO.
