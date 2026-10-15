// ════════════════════════════════════════════════════════
// ATMOSFER BAG — Akıllı AI tekrar-düşman seçici (16.10)
// Sorun: seçiciler Math.random() ile anlık seçince 50 klipli klasörde aynı
// sahneler videoyu videoya tekrar ediyordu. Çözüm: kategori+tür başına DÖNEN
// TORBA — torbada bir id tam tükene kadar bir daha çıkmaz; torba boşalınca
// taze karışım ile yenilenir ve önceki turda SON seçilen id yeni turun ilk
// elemanı yapılmaz (arka arkaya aynı sahne asla gelmez). Torba localStorage'da
// kalıcı: bugün seçilen sahne, klasörün tam turu bitmedikçe tekrar seçilmez.
// ════════════════════════════════════════════════════════

import type { Clip } from "../clips";

const STORE_KEY = "nur-atmos-bag-v1";
/** Dev havuzlarda (tam tür yedeği ~1600 klip) storage şişmesin: turda en çok bu kadar id saklanır */
const MAX_CYCLE = 120;

type BagBucket = { q: string[]; son?: string };
type BagStore = Record<string, BagBucket>;

function readStore(): BagStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as BagStore) : {};
  } catch {
    return {}; // localStorage yok/bozuk → boş torba, seçim yine çalışır
  }
}

function writeStore(store: BagStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* kota dolu vs. — sessiz geç, seçim yine çalışır */
  }
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Havuzdan tekrar etmeyen klip seçer: akilliKlipSec(havuz) → Clip | null.
 * Aynı turda art arda çağrılarda (bir videoya birden çok ayet atandığında)
 * sırayla birbirinden farklı klipler dağıtılır.
 */
export function akilliKlipSec(havuz: Clip[]): Clip | null {
  const pool = havuz ?? [];
  if (!pool.length) return null;

  const ilk = pool[0];
  // Bucket anahtarı: tek kategorili havuzda cat, karışık yedek havuzda "karisik" + tür
  const tekCat = pool.every((clip) => clip.cat === ilk.cat);
  const bucketKey = `${tekCat ? ilk.cat : "karisik"}|${ilk.kind}`;

  const idMap = new Map(pool.map((clip) => [clip.id, clip] as const));
  const store = readStore();
  const bucket = store[bucketKey] ?? { q: [] };

  // Torbayı mevcut havuza uyan id'lerle temizle (klasör küçülüp eski id düşmüş olabilir)
  let queue = bucket.q.filter((id) => idMap.has(id));
  if (!queue.length) {
    const taze = shuffle([...idMap.keys()]).slice(0, Math.max(1, Math.min(MAX_CYCLE, pool.length)));
    // Yeni turun ilk elemanı, son seçilen ile aynıysa sona al — arka arkaya aynı sahne gelmesin
    if (taze.length > 1 && taze[0] === bucket.son) {
      taze.push(taze.shift() as string);
    }
    queue = taze;
  }

  // Havuzdan düşmüş bayat id'ler atlanarak torbadaki ilk gerçek klip seçilir
  let chosenId = "";
  while (queue.length) {
    const id = queue.shift() as string;
    if (idMap.has(id)) { chosenId = id; break; }
  }
  if (!chosenId) { writeStore(store); return null; }

  bucket.q = queue;
  bucket.son = chosenId;
  store[bucketKey] = bucket;
  writeStore(store);
  return idMap.get(chosenId) ?? null;
}
