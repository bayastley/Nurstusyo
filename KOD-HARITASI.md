# KOD HARİTASI — Nurstudyo (arama kolaylığı için)

> Ampirik: `rg "sembol" src/...` ile hızlı hedefleme. i18n anahtar sözlükleri: `src/i18n/dicts.{tr,en,ar,id,ur}.ts` (651 anahtar × 5 dil; parite kontrolü: `comm -3 <(grep -o '^  [a-zA-Z0-9]*:' src/i18n/dicts.tr.ts | sort -u) <(aynısı f)`).

## Giriş ve kabuk
| Dosya | Sorumluluk |
|---|---|
| `src/App.tsx` | Root — sayfa düzeni, sağ panel, üst bar yerleşimi |
| `src/StudioApp.tsx` | **Ana stüdyo (TEK FC, 1716 satır — lansman sonrası bölünecek)**; durum kancaları aşağıda |
| `src/studio/studioAppBolumler.tsx` | StudioApp'in çıkarılmış bölümleri (bolumler deseni) |
| `src/components/HeaderTopBar.tsx` | Üst bar: jeton pill (hbr* anahtarları), ADMIN butonu, dil seçici |
| `src/components/ModalsContainer.tsx` + `modalsContainerBolumler.tsx` | Tüm modal yönlendirme; `window.setNurModal` dev kancası burada |
| `src/components/modalHelpers.tsx` | Ortak modal kabukları, atmosfer etiket listeleri |

## Stüdyo kancaları (`src/studio/`)
`useAuth.ts` + `useAuthSession.ts` (Google oturum — KOPYA, birleştirilecek) · `useManualAuthActions.ts` (e-posta/şifre) · `useWallet.ts` (jeton/cüzdan) · `useTier.ts` (özellik kilidi + jeton düşümü) · `useBan.ts` · `useVideoGenerator.ts` (üretim akışı) · `useKendiSes.ts` (kendi sesin) · `useShareActions.ts` · `useVideoPreload.ts` · `useCanvasDraw.ts` (canvas render) · `useMicroUnlocks.ts` · `useGuestTrial.ts` · `usePrayerTime.ts` · `useSecurityGuards.ts` · `sesZamanlama.ts` (ses-senkron) · `studioHelpers.ts` (aspect boyutları) · `studioConstants.ts` (vakit adları, format listeleri)

## Modallar (`src/components/*Modal.tsx`)
`QuranLearnModal` (1798 — TEK FC, bölünecek; veri: `quranLearnVeri.tsx`) · `KesfetModal` (+`kesfetTemel/kesfetDuaBolumu`) · `HafizlikTestiModal` (+`hafizlikVeri/Istatistik/Grafigi`) · `RamazanModal` · `AyetPaketleriModal` · `OzelGunTakvimiModal` · `PremiumModal` (+`premiumModalHelpers`, `payments/pricing*`) · `AdminDashboardModal` (+`adminDashboard*` 4 dosya) · `RoadmapModal` (+`roadmapVeri`) · `SiteHakkindaModal` · `KendiSesModal` · `ArkaPlanUreticiModal` · `DavetModal` · `KelimeAtolyesiModal` · `AyetKartlariModal` (+`ayetKartBolumleri`, `ayetKartMotoru`) · `KabeCanliModal` · `HaftaninVideosuModal` · `LegalModal` (yasal; metinler `getPaymentCopy` Dict'inde)

## Veri katmanı (`src/data/`)
`ayetKartlariMega/` + `ayetKartlariMega2/` (parca1-3 + index; toplam 423 kart) · `ayetKartlariData.ts` (tip + havuz birleştirme) · `hadisData.ts` · `soruData.ts` · `sureBilgileriEk.ts`, `surahDescriptionsDataPart1/2` · `kelimeData.ts`, `kelimeAtolyesi.ts` · `ruhHalleri.ts` · `kissas.ts` · `reciters.ts` (kari; **`src/reciters.ts` ile KOPYA — birleştirilecek**) · `arkaplanUretici.ts` · `titleData.templates.ts` (AI fallback şablonlar) · `kanalData.ts` · `holidayCalendar` → `src/services/`

## Klip kütüphanesi
`src/clips/*.ts` (kategorik: daglar, deniz, cami… — modüler) · `src/clips.ts` + `clipsData1/2.ts` (eski agregalar, hâlâ import ediliyor) · `clips-r2.ts` (R2 CDN)

## API (`api/` — Vercel functions, tümü ESM)
- **Ortak:** `_shared/auth.ts` (HMAC oturum — `NUR_SESSION_SECRET` TEK kaynak), `_shared/rateLimit.ts` (Upstash paylaşımlı), `_shared/security.ts` (origin whitelist), `_shared/serverErrorLog.ts` (nur_error_logs)
- **Auth:** `auth/google.ts` (OAuth değişimi — GOOGLE_CLIENT_SECRET'in TEK meşru yeri), `auth/me.ts` (isAdmin env-gated fail-closed), `auth/logout.ts`
- **Ödeme:** `payments/webhook.ts` (iyzico HMAC + idempotent), `create/verify/wallet/wallet-consume/callback.ts`
- **İçerik:** `quran/fetch.ts`, `hadis/ara.ts`, `diyanet-sayfa.ts` (sureInfo whitelist temizliği BURADA), `ai/title-generate.ts`, `ai/kissa-generate.ts`
- **Admin:** `admin/action.ts` + `actionYardimcilar.ts` (üçlü doğrulama), `admin/session.ts`, `admin/kill-session.ts`
- **Diğer:** `roadmap.ts`, `rewards/claim.ts` (miktar sunucuda), `referans.ts`, `trial.ts`, `push/*`, `marketing/*`, `video/sign.ts`, `render/authorize.ts`, `ban/*`, `analytics/*`, `zikir/*`, `hafta/video.ts`, `live/kabe.ts`, `config.ts`

## Servisler & güvenlik
`src/services/adminSyncService.ts` · `src/security/serverSync.ts` · `src/utils/safeFetch.ts` (tüm fetch sarmalayıcı; hata mesajları burada) · `src/utils/errorReport.ts` (hata kategorileri) · `src/utils/pushClient.ts` · `src/rateLimiter.ts` (client tarafı) · `src/tier.ts` + `adminConfig.ts` (tier/jeton/özellik kilidi) · `src/legalTabs.ts` · `secureStore` (şifreli LS zarfı)

## DB şemaları
`supabase/*.sql` — `schema.sql` (nur_users/wallets/orders/…), migration'lar tarihli. RLS teyidi lansman sonrası iş (rapor: LANSOMA-RAPORU-04102026.md)

## Test araçları
`scripts/esm-tarama.mjs` (ESM ihlal + `--duman` 26 modal üçlü test) · `scripts/canli-tarama.mjs` (canlı API/DB GO/NO-GO) · geçici taramalar `_*.mjs` (iş sonunda silinir)
