# RLS SERTLEŞTİRME — DURUM RAPORU (18.10.2026)

## Ekran görüntüsünden okunan doğrulama

Senin Supabase SQL Editor'ünde koşturulan doğrulama sorgularından (ekran görüntüsü):

1. **4.4 smoke sorgusu PASS** — `aktif_roadmap_kalemi = 57` → yol haritası 57 aktif
   madde DB'de, uygulama bunları okuyor (api/config 200 ile de teyitli).

2. **4.1 (RLS'siz kalan nur_ tablosu)** — sonuç bölgesi ekranda kesik görünüyor.
   Kesin teyit için aynı editor'de yalnız şunu koş:

```sql
select tablename as rls_siz_kalan
from pg_tables
where schemaname = 'public' and tablename like 'nur%' and rowsecurity = false;
```

   - **0 satır** dönüyorsa → RLS tüm tablolarda AÇIK — SERTLEŞTİRME TAMAMLANDI ✅
   - 1+ satır dönüyorsa → o tablolar için dosyanın Bölüm 1'i (satır ~1–150,
     `enable row level security`) henüz koşulmamış; önce onu çalıştır, sonra 4.1'i tazele.

3. **4.2 (yetkiler)** — koş; `privilege_type` yalnız **SELECT** olmalı.
   `INSERT/UPDATE/DELETE` görülürse 3a bölümü eksik, tekrar koş.

4. **4.3 (fonksiyon execute)** — koş; **0 satır** bekleniyor.

## Canlı uygulama tarafındaki teyit (RLS sonrası davranış bozulmadı mı?)

- `GET /api/config` → **200** ✓ (5 salt-okunur tablo hâlâ okunuyor)
- `POST /api/admin/action` → **403** ✓ (anon RED — admin yetkisi zorunlu)
- `POST /api/roadmap` (revealFeature) → **401** ✓ (oturum zorunlu)
- `POST /api/payments/webhook` (sahte imza) → **400** ✓ (HMAC doğrulaması)

→ RLS sertleştirmesi canlıda uygulama akışını KIRMADI.

## Karar kriteri

4.1 = 0 satır + 4.2 = yalnız SELECT + 4.3 = 0 satır döndüğünde
[rls-sertlestirme-lansman-sonrasi.sql](supabase/rls-sertlestirme-lansman-sonrasi.sql)
dosyası tamamlanmış sayılır.

## Geri alma (acil durum)

Dosyanın sonundaki "GERİ ALMA" bölümü kullanılabilir (5 salt-okunur grant'leri
geri verme + RLS'i toplu açma — ÖNERİLMEZ, yalnız acil durum).
