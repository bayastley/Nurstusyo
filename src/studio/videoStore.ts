// ════════════════════════════════════════════════════════
// VIDEO STORE — üretilen videoları IndexedDB'de saklar
//
// AMAÇ: Misafir videoyu üretir → sitede izler → indirmek için üye olur →
// Google girişi sayfayı yeniler → ESKİ VIDEO KAYBOLUYORDU (bellek blob'u).
// Artık video üretim bitince IndexedDB'ye yazılır; yenileme sonrası
// otomatik geri yüklenir ve (üyeyse) indirilebilir.
//
// KURALLAR:
//  - En fazla MAX_VIDEOS video tutulur (en yeniler), toplam MAX_TOTAL_BYTES aşılırsa
//    en eskiler silinir — tarayıcı deposu şişmez.
//  - İndirme üyelik şartına bağlıdır; bu modül SAKLAMA yapar, YETKİ vermez.
//    (VideoPreviewSection'daki user kontrolü indirmeyi yine kilitler.)
//  - IndexedDB yoksa (çok eski tarayıcı / gizli mod kısıtı) her şey sessizce atlanır.
// ════════════════════════════════════════════════════════

const DB_NAME = "nur_video_store";
const DB_VERSION = 1;
const STORE = "videos";
const MAX_VIDEOS = 5;
const MAX_TOTAL_BYTES = 350 * 1024 * 1024; // ~350 MB üst sınır

export interface StoredOutput {
  id: string;
  label: string;
  mime: string;
  ext: string;
  size: number;
  duration: number;
  createdAt: number;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Üretilen videoyu depoya yazar; kapasite aşımında eski kayıtları siler. */
export async function storeVideo(output: Omit<StoredOutput, "createdAt">): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const record: StoredOutput = { ...output, createdAt: Date.now() };
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
    await pruneOldVideos(db);
  } catch {
    // Depolama hatası (kota dolu vb.) — siteyi asla etkilemesin
  }
}

/** En yeniler hariç fazlalığı siler: MAX_VIDEOS adet ve MAX_TOTAL_BYTES üst sınırına göre. */
async function pruneOldVideos(db: IDBDatabase): Promise<void> {
  try {
    const all = await new Promise<StoredOutput[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => resolve((request.result ?? []) as StoredOutput[]);
      request.onerror = () => resolve([]);
    });
    if (!all.length) return;
    const sorted = all.sort((a, b) => b.createdAt - a.createdAt);
    const keep: StoredOutput[] = [];
    let total = 0;
    for (const item of sorted) {
      if (keep.length < MAX_VIDEOS && total + item.size <= MAX_TOTAL_BYTES) {
        keep.push(item);
        total += item.size;
      }
    }
    const keepIds = new Set(keep.map((item) => item.id));
    const deleteIds = all.filter((item) => !keepIds.has(item.id)).map((item) => item.id);
    if (!deleteIds.length) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      deleteIds.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch {
    // ignore
  }
}

/** Depodaki videoları en yeniden eskiye listeler (sayfa açılışında geri yükleme için). */
export async function loadStoredVideos(): Promise<StoredOutput[]> {
  const db = await openDb();
  if (!db) return [];
  try {
    const all = await new Promise<StoredOutput[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => resolve((request.result ?? []) as StoredOutput[]);
      request.onerror = () => resolve([]);
    });
    return all.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Tek bir kaydı siler (kullanıcı çıktıyı listeden kaldırırsa ileride kullanılabilir). */
export async function deleteStoredVideo(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch {
    // ignore
  }
}
