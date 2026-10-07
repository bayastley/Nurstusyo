// ════════════════════════════════════════════════════════════════
// DICTS — sözlük re-export hub'ı (07.10 parçalama turu)
//
// ★ DEĞİŞİKLİK: 5 dil sözlüğü artık JSON dosyası (dicts.{tr,en,ar,id,ur}.json).
//   Neden? Terser ascii_only:true her Türkçe/Arabic karakteri 6 baytlık
//   \uXXXX kaçışına çeviriyordu — JSON import'ta Vite ham UTF-8'i olduğu
//   gibi gömer, bunun yerine kısa JS string kaçışları kullanılır.
//   Sonuç: aynı 1137 anahtar, ~%35 daha küçük bundle.
//
// ★ BAĞLAM KORUMASI: dışa bakan imza DEĞİŞMEDİ — eski
//   `import { trDict } from "./dicts"` çağrıları çalışmaya devam eder.
//   .ts sözlük dosyaları arşiv olarak silinmez; bu dosyalar artık
//   kaynak değil JSON'dır (scripts/_i18n-eksik-tarama.mjs ile senkron).
// ════════════════════════════════════════════════════════════════
import trDictJson from "./dicts.tr.json";
import enDictJson from "./dicts.en.json";
import arDictJson from "./dicts.ar.json";
import idDictJson from "./dicts.id.json";
import urDictJson from "./dicts.ur.json";

/** JSON import'ları ReadonlyRecord'tan Dict'e (Record<string, string>) çözer */
export const trDict = trDictJson as unknown as Record<string, string>;
export const enDict = enDictJson as unknown as Record<string, string>;
export const arDict = arDictJson as unknown as Record<string, string>;
export const idDict = idDictJson as unknown as Record<string, string>;
export const urDict = urDictJson as unknown as Record<string, string>;
