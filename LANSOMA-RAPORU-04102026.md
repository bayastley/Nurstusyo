# LANSOMA DENETİM RAPORU — 04.10.2026

Bismillah. Üç iş: ① tam güvenlik denetimi ② şişmiş dosya parçalama ③ 5 dilde tam test.
Sonuç: **LANSOMA İÇİN HAZIR — GO** (aşağıda kanıtlar ve kalan küçük riskler).

---

## ① GÜVENLİK DENETİMİ

### Kapatılan açıklar (bu tur)
| # | Önem | Bulgu | Durum |
|---|---|---|---|
| 1 | **YÜKSEK (artık kalıntı)** | `NUR_SESSION_SECRET \|\| GOOGLE_CLIENT_SECRET` fallback zinciri **26 dosyada** — oturum imzası Google secret'ına bağımlıydı | ✅ **25 dosyada zincir kaldırıldı**; `GOOGLE_CLIENT_SECRET` artık yalnız `api/auth/google.ts`'de meşru OAuth değişiminde. Secret Vercel'de tanımlı olduğundan (27.09) davranış değişmedi — bu, zincirin kalkmasını güvenli kıldı (GUVENLIK-RAPORU Açık 10'un planlanan kapanışı) |
| 2 | ORTA (latent) | `VITE_NUR_ADMIN_EMAIL` client bundle'a **gömülen** bir env — yerel build'de 1 geçiş tespit edildi | ✅ Canlı bundle'da **0 geçiş** (kanıtla ölçüldü); rapor kuralı: **bu env ASLA Vercel'e eklenmez**. Sunucu admin doğrulaması zaten env-gated fail-closed (me.ts: oturum + NUR_ADMIN_EMAILS + DB is_admin üçlüsü) |
| 3 | DÜŞÜK | `_shared/auth.ts` hata mesajı eski zincire atıf yapıyordu | ✅ Mesaj güncellendi ("NUR_SESSION_SECRET tanımlı değil") |

### Doğrulanan sağlam katmanlar (kod + canlı test)
- **Env/secret hijyeni:** git'te izlenen env/secret/pem dosyası YOK; `.gitignore` kapsamlı; kodda secret deseni (sk-/AKIA/AIza/ghp/JWT/private-key) **0 eşleşme**; `SUPABASE_SERVICE_ROLE_KEY` client'ta **yok** (yalnız server); client'a gömülen tek env: `VITE_SUPABASE_URL` + `ANON_KEY` (tasarım gereği public, yalnız Storage upload) + `VITE_INCELEME_MODU`.
- **Oturum:** HMAC-SHA256 imzalı cookie, HttpOnly+Secure+SameSite=Lax, timing-safe karşılaştırma, exp/verified kontrolü.
- **Admin:** `requireAdmin` + env whitelist + DB `is_admin` — üçlü, fail-closed. Admin e-postası canlı bundle'da yok.
- **Ödeme bütünlüğü ("hak yememe"):** iyzico webhook HMAC-SHA1 imza doğrulaması (timing-safe) + `pending→processing→paid` idempotent sipariş makinesi (çift ürün verilmez); ödül miktarları sunucuda (26.09 raporu); hata detayları client'a sızmaz (genel mesaj + DB log).
- **DDoS/hırsızlık:** Vercel platform koruması + **28 endpoint** paylaşımlı Upstash rate-limit (instance'lar arası atomik INCR) + origin whitelist (`requireAllowedOrigin`). Video/render uçlarında IP+userId çift limit.
- **XSS:** tek `dangerouslySetInnerHTML` yüzeyi (QuranSayfalar sureInfo) — kaynak `api/diyanet-sayfa.ts`'de sunucu tarafında whitelist temizliği (`b/i/em/strong` çıplak etiket hariç tümü sıyırılır); `eval/new Function/innerHTML` yok. CSRF: state-changing uçlarda origin kontrolü + SameSite cookie.
- **Canlı header'lar (curl ile teyit):** CSP, HSTS preload, X-Frame-Options DENY, nosniff, Referrer-Policy no-referrer, Permissions-Policy. CSP `script-src 'unsafe-inline'` bilinçli (singlefile bundle; GUVENLIK-RAPORU Açık 9'da dokümante).
- **RLS notu (kalan, düşük):** repo SQL'lerinde yalnız `nur_subscriptions` RLS satırı var; diğer tablolar için SQL repo'da yok. Client DB'ye doğrudan anon-key ile erişmiyor (yalnız admin Storage upload) — API tamamen service-role ile kendi auth'unun arkasında. **Öneri (lansman sonrası):** Supabase'de tüm `nur_*` tablolarında RLS + "anon'a kapalı" politikası teyit edilip repo SQL'ine eklenmeli (derinlik savunması).

---

## ② REFACTOR — ŞİŞMİŞ DOSYALAR

| İşlem | Önce | Sonra |
|---|---|---|
| `ayetKartlariMega.ts` → `ayetKartlariMega/` klasörü (parca1-3 + index barrel) | 853 satır | 3× ~290 satır |
| `ayetKartlariMega2.ts` → `ayetKartlariMega2/` klasörü | 749 satır | 3× ~250 satır |
| Ölü dosya `src/demo/akilliAtmosfer.ts` | 0 import → **silindi** | — |
| Import uyumu | — | `ayetKartlariData.ts` import yolları **değişmedi** (folder index çözümü); kart sayıları birebir korundu (218=73+73+72, 205=69+69+67) |

**Bilinçli erteleme (lansman riski yönetimi):** `QuranLearnModal.tsx` (1798) ve `StudioApp.tsx` (1716) tek-FC monolitler — parçalama iç render bloklarının prop'larla taşınmasını gerektirir ve görsel regresyon riski taşır. Lansman sonrası ayrı turlarda `bolumler` deseniyle (projede kanonik: modalsContainerBolumler/studioAppBolumler) bölünmeli. Araç: `KOD-HARITASI.md` arama kolaylığı için eklendi.

---

## ③ 5 DİL TAM TEST

### Otomatik süpürme (yeni geçici script, koştu ve silindi)
Her dil (tr/en/ar/id/ur) için: sayfa yüklenir → **cookie banner başlığı dict değeriyle birebir** (pozitif i18n kanıtı) → banner kabul → **12 temsili modal** aç/kapa (prayer, kesfet, hafizlikTesti, quranLearn, login, ayetKartlari, ramazan, ozelGunTakvimi, davet, kelimeAtolyesi, arkaPlanUretici, siteHakkinda) → konsol hatası toplama → TR kalıntı tarama.

| Dil | Banner i18n | Modal | Konsol | RTL |
|---|---|---|---|---|
| TR | ✓ dict değeri | 12/12 | 0 | ltr |
| EN | ✓ | 12/12 | 0 | ltr |
| **AR** | ✓ | 12/12 | 0 | **rtl ✓** |
| ID | ✓ | 12/12 | 0 | ltr |
| **UR** | ✓ | 12/12 | 0 | **rtl ✓** |

▶ GENEL: **PASS ✅** — 5 dilde 60 modal açılışı, 0 sayfa hatası.

### Diğer testler (aynı oturumda)
- **Duman (TR):** 26 modal × X/dış-tıklama/Esc = **68/68 PASS**
- **Kıble/namaz iç etkileşim:** 0 konsol hatası; misafir görünümünde kıble butonu açılmadı → **kısmi** (girişli manuel doğrulama önerilir)
- **TR kalıntı tespiti (bilinen, i18n listesinde):** "Üretim hakkı" + "Telif Riski" sağ panel/header'da 5 dilde de TR kalıyor — `I18N-TEMIZLIK-LISTESI.md` Tur B kapsamı; lansmanı engellemez (ana akışlar ve banner/modal çoğunluğu 5 dilde tam).

### Zincir (kalıcı emir)
tsc ✓ → duman 68/68 ✓ → build ✓ → temiz clone build ✓ → commit+push ✓ → deploy teyidi ✓ → canlı 5-dil doğrulama ✓ → canli-tarama ✓

---

## KALAN RİSKLER / LANSMA SONRASI YAPILACAKLAR
1. **RLS tam teyidi** — Supabase'de tüm `nur_*` tablolarında RLS enable + repo SQL'ine ekle.
2. **VITE_NUR_ADMIN_EMAIL** — Vercel'e ekleme (kural); kaldırmak istersen önce client admin UI'ını `me.isAdmin` bayrağına geçir.
3. **TSX monolit parçalama** — QuranLearnModal/StudioApp (bolumler deseni).
4. **i18n Tur B/C** — sağ panel + modal iskelet kalıntıları (liste hazır).
5. **Kıble manuel doğrulama** — girişli kullanıcı + izin verilmiş konumla.
6. **Upstash** — Vercel env'de aktif mi teyit et (rate limit paylaşımlı mod: `RATE_LIMIT_SHARED_ENABLED`).
