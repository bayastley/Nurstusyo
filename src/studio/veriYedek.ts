// ════════════════════════════════════════════════════════
// VERIYEDEK.TS — Yedekleme ve Geri Yükleme Tatbikatı (yol haritası madde 88)
// Yalnız "nur_" önekli cihaz-yerel anahtarlar yedeklenir (sunucu verisi değil).
// Geri yüklemede önce doğrulama yapılır; bozuk/yanlış dosya uygulanmaz.
// ════════════════════════════════════════════════════════

const ONEK = "nur_";
const SURUM = 1;
const TEK_ANAHTAR_SINIRI = 2 * 1024 * 1024; // 2 MB — localStorage kotasını korur

export type YedekDosyasi = { surum: number; tarih: string; anahtarlar: Record<string, string> };
export type YedekOzet = { anahtar: number; kayit: number; gecersiz: string[] };

function depo(): Storage | null {
  try {
    return window.localStorage;
  } catch (hata) {
    console.warn("Yerel depo açılamadı:", hata);
    return null;
  }
}

function yedekMi(deger: unknown): deger is YedekDosyasi {
  if (!deger || typeof deger !== "object") return false;
  const kayit = deger as Record<string, unknown>;
  const anahtarlar = kayit.anahtarlar;
  return kayit.surum === SURUM && typeof kayit.tarih === "string" && !!anahtarlar && typeof anahtarlar === "object";
}

/** Cihazdaki nur_* anahtarlarını okur */
export function yedekAl(): YedekDosyasi {
  const anahtarlar: Record<string, string> = {};
  const s = depo();
  if (s) {
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (!k || !k.startsWith(ONEK)) continue;
      const v = s.getItem(k);
      if (typeof v === "string" && v.length <= TEK_ANAHTAR_SINIRI) anahtarlar[k] = v;
    }
  }
  return { surum: SURUM, tarih: new Date().toISOString(), anahtarlar };
}

/** Yedeği JSON dosyası olarak indirir; yedeklenen anahtar sayısını döndürür */
export function yedekIndir(): number {
  const yedek = yedekAl();
  const blob = new Blob([JSON.stringify(yedek, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nurstudyo-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return Object.keys(yedek.anahtarlar).length;
}

/** Metni yedek dosyasına çözer — hata varsa yedek null döner */
export function yedekCoz(metin: string): { yedek: YedekDosyasi | null; hata: string | null } {
  let ham: unknown;
  try {
    ham = JSON.parse(metin);
  } catch (hata) {
    return { yedek: null, hata: hata instanceof Error ? hata.message : "Geçersiz JSON" };
  }
  if (!yedekMi(ham)) return { yedek: null, hata: "Bu dosya Nûr Stüdyo yedeği değil (sürüm 1 bekleniyor)." };
  return { yedek: ham, hata: null };
}

/** Tatbikat: dosyayı yazmadan önce kaç anahtar/kayıt var, hangileri geçersiz */
export function yedekDogrula(yedek: YedekDosyasi): YedekOzet {
  const gecersiz: string[] = [];
  let kayit = 0;
  for (const [k, v] of Object.entries(yedek.anahtarlar)) {
    if (!k.startsWith(ONEK) || typeof v !== "string" || v.length > TEK_ANAHTAR_SINIRI) {
      gecersiz.push(k);
      continue;
    }
    try {
      const cozulen: unknown = JSON.parse(v);
      if (Array.isArray(cozulen)) kayit += cozulen.length;
      else if (cozulen && typeof cozulen === "object") kayit += Object.keys(cozulen).length;
      else kayit += 1;
    } catch {
      kayit += 1; // düz metin değer (ör. "tr", "1")
    }
  }
  return { anahtar: Object.keys(yedek.anahtarlar).length, kayit, gecersiz };
}

/** Doğrulanmış yedeği uygular. mod="degistir" → mevcut nur_* anahtarları önce silinir. */
export function yedekGeriYukle(yedek: YedekDosyasi, mod: "birlestir" | "degistir"): { yazilan: number; silinen: number; gecersiz: string[] } {
  const s = depo();
  if (!s) return { yazilan: 0, silinen: 0, gecersiz: Object.keys(yedek.anahtarlar) };
  const { gecersiz } = yedekDogrula(yedek);
  const gecersizSet = new Set(gecersiz);
  let silinen = 0;
  if (mod === "degistir") {
    const mevcut: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(ONEK)) mevcut.push(k);
    }
    mevcut.forEach((k) => { s.removeItem(k); silinen++; });
  }
  let yazilan = 0;
  for (const [k, v] of Object.entries(yedek.anahtarlar)) {
    if (gecersizSet.has(k)) continue;
    s.setItem(k, v);
    yazilan++;
  }
  return { yazilan, silinen, gecersiz };
}
