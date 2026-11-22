# AGENTS.md — Nûr Stüdyo · Kalıcı çalışma kuralları

Bu dosya, sahibin kalıcı emirlerini taşır. Her oturumda ve her işlemde geçerlidir; silinmez, gevşetilmez.

## 1. Build kuralı (pazarlıksız)

- **Her değişiklikten sonra build al** ve 0 hata olduğundan emin ol.
- Küçük işlerde en az `npx tsc --noEmit`; önemli işlerde tam `npm run build` (içinde `esm-tarama` + `tsc --noEmit` + `vite build`).
- 0 hata olmadan iş bitmiş sayılmaz.

## 2. Hata susturma yasağı

Hataları gizlemek için **asla** şunlar kullanılmaz:

- `@ts-ignore`, `@ts-expect-error`
- `any` tipi (`: any`, `as any`, `<any>`) veya `unknown`'a kaçış amaçlı cast
- boş `catch {}` / hatayı yutan `catch (e) {}` (log'suz, işlevsiz)
- testi devre dışı bırakma, assertion zayıflatma, lint/ts kuralı kapatma

Bunun yerine **kök neden** düzeltilir: tip doğru tanımlanır, daraltma (narrowing) yapılır, hata gerçekten ele alınır (kullanıcıya mesaj, log, yeniden deneme vb.).

## 3. Özellik koruma

- Mevcut özellikler **silinmez**, kapatılmaz, davranışı bozulmaz.
- Düzeltme yaparken başka şeylerin yeri/yerleşimi değiştirilmez.

## 4. Diğer kalıcı emirler

- **Türkçe konuşulur** (her yanıt Türkçe).
- **Satır ekonomisi:** 10 satırlık iş 10 satırla yapılır; gereksiz kod ve fazlalıklar temizlenir.
- **Tahmin yok, soru var:** emin olunmayan yerde tahmin edilmez, sorulur.
- **Dokunma sınırı:** sadece söylenen şeye dokunulur; ama görülen hata düzeltilir.
- 5 dil (tr/en/ar/id/ur) ve dini içerikte sahihlik kuralları (hadis numarası uydurulmaz, ihtilaflı tarihler "yaklaşık/~" ile, kaynak gösterilir) korunur.
