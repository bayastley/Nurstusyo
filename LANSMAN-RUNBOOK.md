# 🚀 1 Ekim Lansmanı — Altyapı Risk Yönetimi Runbook'u

> Tek amaç: **binlerce kullanıcı anında gelirse site ayakta kalsın.**
> Bu dosya iki bölümdür: (A) kodla çözülenler — zaten deploy edildi,
> (B) panelde senin tıklayacakların — lansman haftası yapılacak checklist.

---

## A) Kodla çözülenler (28.09'da deploy edildi ✅)

### A1. `/api/config` — en sıcak endpoint, iki katmanlı cache
Her açık sekme 60-90 sn'de bir config poll ediyor. Eskiden her poll = 3 Supabase sorgusu.
Artık:
- **45 sn in-memory snapshot** aynı instance'a gelen istekler DB'ye hiç gitmez
- **CDN cache** (`s-maxage=45, stale-while-revalidate=300`) farklı instance'ları bile tek talebe indirger
- **DB çökerse son sağlıklı snapshot dönülür** — config yüzünden tüm site kapanmaz (panel sigortası felsefesiyle aynı)
- Frontend poll aralığı 60→90 sn, `no-store` kalktı (CDN cache çalışabilsin diye)

**Etki:** 1.000 açık sekme ≈ eskiden saniyede ~50 DB sorgusu → şimdi ~0,06 sorgu/sn (Yaklaşık **800× azalma**).

### A2. `/api/roadmap` — büyüyen tablo aggregate cache'i
GET her istekte **tüm oylar tablosunu** çekiyordu (kullanıcı arttıkça satır artıyor).
- 20 sn in-memory aggregate cache + oy ver/sil/taşı anında cache bust (bayat sayaç görünmez)
- `myVote` kullanıcıya özel → CDN cache yok, yalnız instance-içi cache

### A3. DB indeksleri — `supabase/lansman-performans-indeksleri-2809.sql`
Roadmap oyları, duyuru penceresi, ban kontrolü, push lookup, sipariş/cüzdan,
page-views BRIN — hepsi `IF NOT EXISTS`, tekrar koşmak güvenli.
**Nereye:** Supabase Dashboard → SQL Editor → yapıştır → Run.

### A4. Zaten vardı (denetimde teyit edildi)
- Merkezî rate limit (Upstash Redis destekli) tüm yazma uçlarında: analytics 60/dk,
  zikir 60/dk, push-subscribe 20/dk, roadmap-oy 20/dk
- Auth/giriş uçlarında origin kontrolü; SSRF/dış-adres koruması
- Mimari: DB erişimi **REST (PostgREST) üstünden** → klasik "connection pool
  tükendi" kilitlenmesi **mimari olarak mümkün değil** (kalıcı pg bağlantısı açılmıyor)

---

## B) Panelde YAPILACAKLAR — lansman haftası checklist'i

### B1. Supabase Free → **Pro'ya geç** (en kritik adım, ~25$/ay)
Free katmanda iki ölümcül risk var:
1. **7 gün inaktiflik → proje pause** (Pro'da yok)
2. Free plan limite dayanınca bağlantı reddi / yavaşlama

**Yol:** supabase.com → projen → Settings → Billing → Upgrade to Pro
**Pro ile gelen:** compute 8× (Small), günlük yedek, pause yok, daha yüksek bağlantı limiti.

### B2. **Pooler (6543) portunu env'e ekle** — 5 dakikalık işlem
Kodun REST üstünden çalıştığı için bu bir zorunluluk değil, ama gelecekte
RPC/edge-function'dan doğrudan pg bağlantısı açarsan (ör. toplu rapor)
**ayrılmış 5432 portu değil, pooler kullanılmalı**:

```
# Supabase Dashboard → Project Settings → Database → Connection Pooling
# "Connection string" → 6543 portlu URI'yi kopyala
# Vercel → Project → Settings → Environment Variables:
SUPABASE_DB_POOLER_URL = postgresql://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:6543/postgres
```
Ayrıca: Dashboard → Database → **Connection Pooling** sekmesi → Pool Mode: **Transaction**,
Max Clients: **200** (Small compute'ta güvenli tavan; gerektiğinde artırılır).

### B3. **Upstash Redis** ekleyerek rate limit'i instance'lar arası yap (ücretsiz katman yeter)
Şu an env'de UPSTASH anahtarları yok → rate limit instance-başına in-memory düşüyor.
Vercel'in çok instance'a ölçeklendiği lansman günü gerçek koruma için şart:

1. upstash.com → ücretsiz hesap → **Create Database** (region: **eu-central-1** — Vercel fra1'e yakın)
2. REST API sekmesinden kopyala:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Vercel → Settings → Environment Variables → ikisini de ekle (Production)
4. Kontrol: `RATE_LIMIT_SHARED_ENABLED` true olmalı (kod otomatik algılar; log'da görünür)

### B4. Lansman sabahı kontrol listesi (10 dakika)
```
□ Supabase Dashboard → Reports: DB aktif, pause yok
□ Vercel Dashboard → Deployments: son deploy LIVE
□ node scripts/canli-tarama.mjs → GO
□ /api/config curl → Cache-Control: s-maxage=45 görünmeli
□ Upstash env Production'da tanımlı mı (Vercel → Settings → Env)
□ Supabase → Database → Backups: daily backup görünüyor (Pro)
□ Acil plân baskıda: aşağıdaki "Kırmızı Kod" bölümü
```

### B5. 🔴 Kırmızı Kod — lansman günü DB zorlanırsa (acil plan)
**Semptom:** canli-tarama 5xx/timeout dönmeye başladı, Supabase Reports CPU %90+.

1. **Önce bak bakalım gerçekten DB mi:** canli-tarama API listesinde hangi uç 500?
   - Yalnız roadmap/config değil, HER ŞEY yavaşsa → Supabase Reports → CPU/IO
2. **Supabase → Settings → Infrastructure → Resize compute** (Small→Medium, 2 dk, düşük risk)
3. **Şişkinlik varsa:** Supabase → Database → Extensions değil; **SQL Editor**:
   ```sql
   SELECT pid, now() - query_start AS sure, left(query, 80)
   FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds';
   ```
   Uzun süren sorgu görürsen: `SELECT pg_cancel_backend(<pid>);`
4. **En kötü senaryo (bakım moduna al):**
   - Supabase → Table Editor → nur_site_settings → `maintenance` → `{"enabled": true, "message": "Çok yoğun ilgi! Birkaç dakika içinde dönüyoruz 🌙"}`
   - Site tek bayrakla okuma trafiğini keser; ziyaretçilere zarif mesaj gider
5. **Kural:** Kesinti sırasında deploy/SQL/migration YOK — sadece ölç ve bekla. Yanlış müdahale, kesintiyi uzatır.

### B6. Lansman sonrası (1 hafta içinde — isteğe bağlı güçlendirme)
- Supabase Reports'tan **slow query'leri** incele (>200ms olanlar) → eksik indeks varsa ekle
- `nur_page_views` büyüyorsa aylık arşiv tablosuna taşı
- Upstash ücretli katman gerekirse: Production Analytics → limit aşımına bak

---

## Risk Haritası (denetim özeti)

| Risk | Durum | Koruma |
|---|---|---|
| Config poll yükü | ✅ Kodla çözüldü | 45sn snapshot + CDN cache + fail-open snapshot |
| Roadmap tablo taraması | ✅ Kodla çözüldü | 20sn aggregate cache + bust |
| Eksik indeksler | ✅ SQL hazır | `lansman-performans-indeksleri-2809.sql` (çalıştırman yeterli) |
| Rate limit instance-başına | ⚠️ Env bekliyor | B3: Upstash anahtarlarını Vercel'e ekle |
| Free plan pause/limit | ⚠️ Panel bekliyor | B1: Pro'ya geçiş |
| Gelecek pg bağlantısı | ⚠️ Env bekliyor | B2: pooler 6543 env'e tanımlansın |
| DB çöküp tüm siteyi götürmesi | ✅ Kodla çözüldü | config fail-open snapshot + zikir/roadmap try-catch |
