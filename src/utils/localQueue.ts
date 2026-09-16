// ═══════════════════════════════════════════════════════════
// localQueue — internet yokken küçük yazmaları localStorage'da
// bekletir, bağlantı gelince otomatik gönderir.
// Amaç: zikir/hatim gibi veriler hiçbir koşulda kaybolmasın.
// Kullanım: enqueue({ type: "zikir", payload: { adet: 1 } })
// ═══════════════════════════════════════════════════════════

import { isOffline } from "./safeFetch";

const QUEUE_KEY = "nur_sync_queue_v1";

export type QueueItem = {
  type: string;
  payload: Record<string, unknown>;
  ts: number; // oluşturulma zamanı
};

function yukle(): QueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  } catch {
    return [];
  }
}

function sakla(liste: QueueItem[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(liste.slice(-500))); // en fazla 500 kayıt
  } catch { /* localStorage dolu — sessiz geç */ }
}

/** Bağlantı yoksa kuyruğa ekler, varsa hemen gönderir. Asla throw etmez. */
export async function enqueue(
  type: string,
  payload: Record<string, unknown>,
  gonder: (payload: Record<string, unknown>) => Promise<boolean>
): Promise<void> {
  if (isOffline()) {
    const liste = yukle();
    liste.push({ type, payload, ts: Date.now() });
    sakla(liste);
    return;
  }
  const basarili = await gonder(payload).catch(() => false);
  if (!basarili) {
    // Gönderim başarısız → kuyruğa al, bağlantı gelince tekrar deneriz
    const liste = yukle();
    liste.push({ type, payload, ts: Date.now() });
    sakla(liste);
  }
}

/** Kuyruktaki bekleyen kayıtları gönderir; başarılı olanlar silinir. */
export async function flushQueue(
  gonder: (item: QueueItem) => Promise<boolean>
): Promise<number> {
  if (isOffline()) return 0;
  const liste = yukle();
  if (!liste.length) return 0;
  const kalan: QueueItem[] = [];
  let gonderildi = 0;
  for (const item of liste) {
    const ok = await gonder(item).catch(() => false);
    if (ok) gonderildi++;
    else kalan.push(item); // başarısız olanlar kuyrukta kalır, sıradaki turda tekrar denenir
  }
  sakla(kalan);
  return gonderildi;
}

/** Kuyrukta bekleyen kayıt sayısı */
export function pendingCount(): number {
  return yukle().length;
}
