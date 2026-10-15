// ════════════════════════════════════════════════════════════════
// DICTS — sözlük re-export hub'ı (07.10 parçalama turu + 16.10 LAZY)
//
// ★ LAZY SÖZLÜK (16.10, mobil hız fix): 5 dil sözlüğü (~380KB JSON) eskiden
//   ana chunk'a statik gömülüyordu — açılış zinciri gzip 460KB yapıyordu ve
//   4G telefon LCP 4-6sn tutuyordu. Artık yalnız TR sözlük eager gömülür
//   (çeviri fälläck + varsayıal dil); diğer 4 dil mount'tan ÖNCE tek JSON
//   fetch'iyle cürallaılır (main.tsx await eder — TR kullanıcı 0 gecikme,
//   diğer dillerde tek küçük istek, parıldama yok).
//
//   Neden JSON import'ları hâlâ burada? Vite dynamic import JSON'u kendi
//   chunk'ına koyar — Terser ascii_only şışkinliği de yine yaşanmaz.
//   İmza koruması: `import { trDict } from "./dicts"` çağrıları aynen çalışır.
//
// ★ BAĞLAM KORUMASI: dışa bakan imza DEĞİŞMEDİ — eski
//   `import { trDict } from "./dicts"` çağrıları çalışmaya devam eder.
// ════════════════════════════════════════════════════════════════
import trDictJson from "./dicts.tr.json";

/** JSON import'ları ReadonlyRecord'tan Dict'e (Record<string, string>) çözer */
export const trDict = trDictJson as unknown as Record<string, string>;

// ★ MUTABLE placeholder'lar: cürallama Object.assign ile DOLAR — T en/ar/id/ur
//   referansları aynı objeyi tuttuğu için tüm bileşenler yeni değerleri görür.
export const enDict = {} as Record<string, string>;
export const arDict = {} as Record<string, string>;
export const idDict = {} as Record<string, string>;
export const urDict = {} as Record<string, string>;

const YUKLU = new Set<string>(["tr"]);
const YUKLENIYOR = new Map<string, Promise<void>>();

/** Bir dilin sözlüğünü dinamik chunk'tan yükler (idempotent — tekrar çağrı atr bileşenlerin yazmasın) */
export function dilSozluguCuralla(lang: string): Promise<void> {
  const kod = String(lang || "tr").trim().toLowerCase();
  if (YUKLU.has(kod)) return Promise.resolve();
  const vardi = YUKLENIYOR.get(kod);
  if (vardi) return vardi;
  const gef = (async () => {
    try {
      const mod = await import(`./dicts.${kod}.json`) as { default?: Record<string, string> };
      const dict = (mod.default ?? (mod as unknown as Record<string, string>)) as Record<string, string>;
      const hedef: Record<string, string> =
        kod === "en" ? enDict : kod === "ar" ? arDict : kod === "id" ? idDict : urDict;
      Object.assign(hedef, dict);
      YUKLU.add(kod);
    } catch { /* sözlük gelmezse translate TR fallback ile çalışır */ }
    finally { YUKLENIYOR.delete(kod); }
  })();
  YUKLENIYOR.set(kod, gef);
  return gef;
}
