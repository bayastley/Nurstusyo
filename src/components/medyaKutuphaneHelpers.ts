// ════════════════════════════════════════════════════════
// MEDYA KÖPRÜSÜ (28.09) — IndexedDB'deki kullanıcı dosyalarını
// stüdyonun Clip tipine çevirir. ZipExplorer'dan "Arka Plan Yap"
// → StudioApp medyaClip'lerini yükler → atmosfer galerisinde
// "📁 Yüklediklerim" kategorisinde seçilebilir.
//
// - blob URL'ler sayfa yenilenince ölür → açılışta IndexedDB'den
//   blob okunup URL.createObjectURL ile TAZELENİR
// - bütünlük: kayıt sırasında SHA-256 özeti; açılışta eşleşmezse
//   dosya sessizce atlanır (bozuk blob stüdyoyu asla etkilemesin)
// - cat: "yuklenenler" (mevcut kategori — admin kilit zincirinden geçer)
// ════════════════════════════════════════════════════════

import type { Clip } from "../clips";
import { loadStoredMedia, getStoredMedia, type StoredMedia } from "../studio/medyaStore";

const INTEGRITY_KEY = "nur_medya_integrity";

export interface MedyaClipKayit {
  id: string;
  name: string;
  tur: StoredMedia["tur"];
  blobUrl: string;
  sha256: string;
}

/** Blob'un SHA-256 özetini hex üretir (bütünlük için). */
export async function sha256Hex(blob: Blob): Promise<string> {
  try {
    const buf = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return ""; // özet üretilemezse bütünlük kontrolü yapılamaz — dosyayı yine kabul et
  }
}

type IntegrityMap = Record<string, string>;

function integrityOku(): IntegrityMap {
  try { return JSON.parse(localStorage.getItem(INTEGRITY_KEY) || "{}") as IntegrityMap; } catch { return {}; }
}

function integrityYaz(map: IntegrityMap): void {
  try { localStorage.setItem(INTEGRITY_KEY, JSON.stringify(map)); } catch { /* kota — sessiz */ }
}

/** Yükleme anında çağrılır: özeti kaydeder. */
export function medyaOzetKaydet(id: string, sha256: string): void {
  if (!sha256) return;
  const map = integrityOku();
  map[id] = sha256;
  // En fazla 200 kayıt — eski özetleri temizle (kota şişmesin)
  const keys = Object.keys(map);
  if (keys.length > 200) {
    for (const k of keys.slice(0, keys.length - 200)) delete map[k];
  }
  integrityYaz(map);
}

export function medyaOzetSil(id: string): void {
  const map = integrityOku();
  delete map[id];
  integrityYaz(map);
}

/** StoredMedia → stüdyo Clip. video → vid, resim → img, ses → vid + ses kaynağı. */
export function medyaToClip(m: StoredMedia, blobUrl: string): Clip {
  return {
    id: `medya-${m.id}`,
    label: m.name,
    cat: "yuklenenler",
    kind: m.tur === "resim" ? "img" : "vid",
    src: blobUrl,
  };
}

/**
 * IndexedDB'den tüm medyayı okuyup stüdyo Clip'lerine çevirir.
 * Bozuk (özet eşleşmeyen) dosyalar sessizce atlanır; hiçbiri patlamaz.
 */
export async function medyaClipYukle(): Promise<Clip[]> {
  const rows = await loadStoredMedia();
  if (!rows.length) return [];
  const map = integrityOku();
  const clips: Clip[] = [];
  for (const row of rows) {
    try {
      if (row.tur === "ses") continue; // ★ ses arka plan olamaz — yalnız yükleyicide listelenir
      const expected = map[row.id];
      if (expected) {
        const actual = await sha256Hex(row.blob);
        if (actual && actual !== expected) continue; // bozuk — atla
      }
      const url = URL.createObjectURL(row.blob);
      clips.push(medyaToClip(row, url));
    } catch { /* tek dosya hatası hepsini bozmasın */ }
  }
  return clips;
}

/** "Arka Plan Yap" öncesi blob URL tazeleme (sayfa yenilendiyse ölü olabilir). */
export async function medyaBlobUrlTazele(id: string): Promise<string | null> {
  const row = await getStoredMedia(id);
  if (!row) return null;
  try {
    return URL.createObjectURL(row.blob);
  } catch {
    return null;
  }
}

/** Bir medya kaydının Clip'idinden gerçek medya kimliğini çıkarır ("medya-" öneki arındırma). */
export function clipIdToMedyaId(clipId: string): string {
  return clipId.startsWith("medya-") ? clipId.slice(6) : clipId;
}
