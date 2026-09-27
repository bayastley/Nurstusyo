# Nurstudyo — Güvenlik Açıkları Kapatma Raporu (26.09.2026)

Push yok · son commit `0c254aa` · tüm değişiklikler localda.

## Kapatılan açıklar

### 1 — YÜKSEK: Ödül miktarı istemciden geliyordu ✅ (önceki turda kapandı)
`api/rewards/claim.ts`: amount ve event tarihleri artık sunucuda belirleniyor;
geçmiş event tarihiyle paket toplama engellendi.

### 2 — ORTA: Rate limit'ler instance-başınaydı → PAYLAŞIMLI OLDU ✅ (bu tur)
**28 endpoint** güncellendi. Yeni çekirdek:
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env'de tanımlıysa sayaçlar
  **paylaşımlı Redis'te** (INCR + EXPIRE NX pipeline, atomik) — Vercel instance sayısı
  ne olursa olsun limit geçerli.
- Env yoksa eski in-memory davranışa düşer (local dev kırılmaz).
- Kapsanan uçlar: config, roadmap, rewards/claim, ban/report, ban/status, admin/action
  (adminRateLimit), admin/kill-session, admin/session, push/subscribe, push/send,
  marketing/consent, marketing/send-campaign, marketing/feedback, analytics/track,
  analytics/error, payments/callback, payments/create, payments/verify, payments/wallet,
  payments/webhook, wallet-consume, video/sign (IP+userId çift limit), render/authorize,
  live/kabe, auth/google, auth/logout, auth/me, ai/title-generate, ai/kissa-generate.
- Tüm çağrılar `await`'e geçirildi; eski senkron çağrı kalmadı.
- Kurulum: Vercel → Settings → Environment Variables → Upstash anahtarlarını ekle.
  (Upstash konsolundan ücretsiz Redis DB oluşturup REST URL+token al.)

### 3 — ORTA: Admin yetki tutarsızlığı ✅ (zaten kapalıydı — teyit edildi)
`send-campaign.ts` ve `kill-session.ts` DB teyidi (`verifyAdminInDb`) çağırıyor.

### 4 — ORTA: /api/api/ duplicate klasör ✅ (canlıda yok — teyit edildi)
Arşiv/zip kopyalarında olabilir; canlı klasör temiz.

### 5 — ORTA: src/payments ölü sunucu dosyaları ✅ (temizlenmiş — teyit)
Geriye kalan `pricing.ts` + `pricingData.ts` istemci tarafından kullanılıyor (ölü değil).

### 6 — DÜŞÜK: ban/status e-posta numaralandırma ✅ (zaten kapalıydı — teyit)
Oturumsuz sorgu 403; başkasının e-postası adminlik ister.

### 7 — DÜŞÜK: Hata detay sızıntısı ✅ (bu turda kapandı)
`payments/wallet.ts` + `payments/verify.ts` 500 yanıtları artık genel mesaj
("İşlem şimdi gerçekleştirilemiyor") döndürüyor; gerçek detay `logServerError`
ile `nur_error_logs`'a yazılıyor + console'da kalıyor.

### 8 — DÜŞÜK: kill-session ölü kod ✅ (bu turda kapandı)
- `nur_bans` yazımı **önceki turlarda** zaten `nur_ban_logs`'a çevrilmişti (teyit).
- Kullanılmayan `sessionKillToken` üretimi ve yanıttaki alanı kaldırıldı.
- Admin DB teyidi zaten üçlüydü (JWT + env listesi + DB).

### 9 — DÜŞÜK: CSP 'unsafe-inline' ⚠️ bilinçli, dokümante edildi
`vercel.json`'daki `script-src 'unsafe-inline'` ŞU AN ZORUNLU: `vite-plugin-singlefile`
tüm JS'i index.html'e inline gömer; kaldırılırsa site beyaz ekran olur. Kalıcı çözüm
build çıktısına hash/nonce enjekte eden ayrı bir iş (V3 önerisi) — bu turda kod
değişikliği yapılmadı, kırılma riski alınmadı.

### 10 — DÜŞÜK: Oturum sırrı fallback zinciri ⚠️ aşamalı plan
22 dosyada `NUR_SESSION_SECRET || GOOGLE_CLIENT_SECRET` zinciri var. Anında kaldırmak
Vercel'de `NUR_SESSION_SECRET` tanımlı değilse TÜM OTURUMLARI KIRAR (giriş çöker).
Bu turda: oturum üreten uçta (`auth/google.ts`) fallback kullanılıyorsa sunucu log'una
yüksek sesle uyarı eklendi. **Yapılacak:** Vercel env'ine `NUR_SESSION_SECRET` (32+
karakter) ekle → log'daki uyarı kaybolur → sonra tek commit'le fallback zincirini
tüm dosyalardan kaldırırım.

## Doğrulama
- `npx tsc --noEmit` → proje kaynaklarında 0 hata (node_modules dts gürültüsü hariç)
- `npm run build` → ✓ built in 44s, 0 hata

## Vercel'e eklenecek env'ler (özet)
| Anahtar | Zorunluluk | Amaç |
|---|---|---|
| `NUR_SESSION_SECRET` | Önerilen (acil değil) | Oturum imzasını Google secret'tan bağımsızlaştırır (Açık 10) |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Önerilen | Rate limit'i instance'lar arası paylaşımlı yapar (Açık 2) |
