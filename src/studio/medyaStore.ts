// ════════════════════════════════════════════════════════
// MEDYA DEPOSU (28.09) — kullanıcı yüklediği video/resim/ses
// dosyalarını IndexedDB'de KALICI saklar (videoStore.ts deseni).
//
// NEDEN: ZipExplorer eskiden yalnız metadata'yı localStorage'a
// yazıyor, blob'lar bellekte kalıyordu → sayfa yenilenince
// dosyalar KAYBOLUYORDU ("Eklendi ✓" ama sonraki açılışta yok).
//
// KURALLAR (videoStore.ts ile aynı felsefe):
//  - Blob IndexedDB'de; tarayıcı kapansa da kalır
//  - MAX_FILES adetten fazlasında en eskiler silinir
//  - MAX_TOTAL_BYTES aşımında en eskiler silinir
//  - IndexedDB yoksa (gizli mod/eski tarayıcı) her şey sessizce
//    atlanır — site ASLA bozulmaz
// ════════════════════════════════════════════════════════

const DB_NAME = "nur_medya_store";
const DB_VERSION = 1;
const STORE = "medya";
const MAX_FILES = 60;
const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // ~500 MB

export interface StoredMedia {
  id: string;
  name: string;
  tur: "video" | "resim" | "ses";
  mime: string;
  size: number;
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

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

/** Tüm kalıcı medyayı okur (en yeni önce). Hata → boş liste (site bozulmaz). */
export async function loadStoredMedia(): Promise<StoredMedia[]> {
  const db = await openDb();
  if (!db) return [];
  try {
    return await new Promise<StoredMedia[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const rows = (req.result ?? []) as StoredMedia[];
        rows.sort((a, b) => b.createdAt - a.createdAt);
        resolve(rows);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/** Tek medyayı okur (arka plan seçilirken blob URL'i tazelemek için). */
export async function getStoredMedia(id: string): Promise<StoredMedia | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    return await new Promise<StoredMedia | null>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as StoredMedia) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/** Medyayı yazar; kapasite aşımında en eskileri siler. */
export async function storeMedia(media: Omit<StoredMedia, "createdAt">): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  try {
    const record: StoredMedia = { ...media, createdAt: Date.now() };
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
    await pruneMedia(db);
    return true;
  } catch {
    return false; // kota dolu vs. — sessiz geç, site bozulmasın
  }
}

export async function deleteStoredMedia(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    await txDone(tx);
  } catch { /* yoksay */ }
}

export async function clearStoredMedia(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    await txDone(tx);
  } catch { /* yoksay */ }
}

/** Dosya adedi / toplam boyut aşımında en eskileri sil. */
async function pruneMedia(db: IDBDatabase): Promise<void> {
  try {
    const rows = await new Promise<StoredMedia[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result ?? []) as StoredMedia[]);
      req.onerror = () => resolve([]);
    });
    let total = rows.reduce((sum, r) => sum + (r.size || 0), 0);
    const silinecekler: string[] = [];
    for (const row of rows.slice().sort((a, b) => a.createdAt - b.createdAt)) {
      if (rows.length - silinecekler.length <= MAX_FILES && total <= MAX_TOTAL_BYTES) break;
      silinecekler.push(row.id);
      total -= row.size || 0;
    }
    if (!silinecekler.length) return;
    const tx = db.transaction(STORE, "readwrite");
    for (const id of silinecekler) tx.objectStore(STORE).delete(id);
    await txDone(tx);
  } catch { /* yoksay */ }
}
