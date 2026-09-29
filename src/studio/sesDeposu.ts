// ═══════════════════════════════════════════════════════════════
// KENDİ SES DEPOSU (30.09) — kullanıcının yüklediği okuma sesleri
// IndexedDB'de KALICI saklanır (medyaStore.ts deseni).
//
// - Blob tarayıcı kapansa da kalır
// - Sure başına 1 "tüm sure" kaydı + ayet-başına ayrı kayıtlar tutulur
// - Zamanlamalar (algılanan/düzenlenen) blob'dan AYRI, metadata'da saklanır
// - IndexedDB yoksa her şey sessizce atlanır — site ASLA bozulmaz
// ═══════════════════════════════════════════════════════════════

const DB_NAME = "nur_ses_store";
const DB_VERSION = 1;
const STORE = "sesler";
const MAX_KAYIT = 80;
const MAX_TOTAL_BYTES = 400 * 1024 * 1024; // ~400 MB ses

export interface ZamanlamaKaydi {
  start: number;
  dur: number;
}

export interface StoredSes {
  id: string;
  /** "tum" | ayet numarası — sure içindeki konum */
  konum: "tum" | number;
  sure: number;
  ad: string;
  mime: string;
  size: number;
  createdAt: number;
  blob: Blob;
  /** Algılanan veya kullanıcı düzenlemesi sonrası segmentler */
  zamanlamalar: ZamanlamaKaydi[];
  /** Kullanıcı ayet başına ayrı dosya yüklediyse zamanlamalar [0] tabanlıdır */
  kaynak: "tum-sure" | "ayet-basina";
  /** Toplam süre (sn) */
  sure_sn: number;
  /** Ayetler arasına nefes aralığı (sn) — 0 ise yok */
  nefes: number;
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

export async function sesleriOku(sure?: number): Promise<StoredSes[]> {
  const db = await openDb();
  if (!db) return [];
  try {
    return await new Promise<StoredSes[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        let rows = (req.result ?? []) as StoredSes[];
        rows = rows.filter((r) => (sure ? r.sure === sure : true));
        rows.sort((a, b) => b.createdAt - a.createdAt);
        resolve(rows);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function sesYaz(ses: Omit<StoredSes, "createdAt">): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  try {
    const kayit: StoredSes = { ...ses, createdAt: Date.now() };
    // kapasite denetimi: aşarsa en eskileri sil
    const mevcut = await sesleriOku();
    let toplam = mevcut.reduce((s, r) => s + (r.size || 0), 0) + kayit.size;
    const silinecekler: string[] = [];
    for (const eski of [...mevcut].sort((a, b) => a.createdAt - b.createdAt)) {
      if (toplam <= MAX_TOTAL_BYTES && mevcut.length + 1 - silinecekler.length <= MAX_KAYIT) break;
      silinecekler.push(eski.id);
      toplam -= eski.size || 0;
    }
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const id of silinecekler) store.delete(id);
    store.put(kayit);
    await txDone(tx);
    return true;
  } catch {
    return false;
  }
}

export async function sesSil(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    await txDone(tx);
  } catch { /* ignore */ }
}

/** Zamanlama düzenlemesini kalıcıya yaz (blob yeniden yazılmaz). */
export async function zamanlamalariGuncelle(id: string, zamanlamalar: ZamanlamaKaydi[], nefes?: number): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      const row = req.result as StoredSes | undefined;
      if (!row) return;
      row.zamanlamalar = zamanlamalar;
      if (typeof nefes === "number") row.nefes = nefes;
      store.put(row);
    };
    await txDone(tx);
  } catch { /* ignore */ }
}

/** Tek kayıt oku (blob URL tazelerken). */
export async function sesOku(id: string): Promise<StoredSes | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    return await new Promise<StoredSes | null>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as StoredSes) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
