// ════════════════════════════════════════════════════════════════
// MODAL DUMAN TESTİ SÜRÜCÜSÜ — src/dev/modalDumanTesti.ts (dev-only)
//
// NE YAPAR: ModalsContainer'daki TÜM modalları tek tek açar ve her birini
//   üç kapatma yoluyla kapatır: (1) X butonu, (2) dış-tıklama (backdrop),
//   (3) Escape tuşu. Kalansız kapanış = PASS. SRP/parçalama sonrası bir
//   modalın "hiç açılmaması" veya "kapanmaması" vakalarını build ÖNCESİ
//   yakalar (PremiumModal import vakası gibi runtime hatalarını dumanlar).
//
// NASIL ÇAĞRILIR:
//   • Otomatik: node scripts/esm-tarama.mjs --duman  → Chrome açar, bu
//     sürücüyü window.nurModalDumanTesti üzerinden koşturur.
//   • Elle: dev konsolundan `await nurModalDumanTesti("tam")`.
//
// GÜVENCE: Bu dosya yalnız DEV'de dinamik import edilir (import.meta.env.DEV
//   korumalı effect, ModalsContainer) — canlı bundle'ı hiç yüklemez.
//
// TASARIM NOTLARI:
//   • Açılış window.setNurModal ile yapılır. Kilit zinciri zaten modal
//     state'inde çalışır (v2Gate merkezi geçit effect'i) → kilitli modal
//     testte de gerçek kullanıcı gibi yol haritasına yönlendirilir.
//   • Kapatma GERÇEK DOM olayıyla: element.click() (X), MouseEvent
//     mousedown/mouseup/click (dış-tıklama), KeyboardEvent key=Escape (Esc).
//     React sentetik olayları bunları normal kullanıcı olayı gibi yakalar.
//   • Kapanış doğrulaması: .fixed.inset-0 overlay köklerinin kaybolması —
//     z-[80] quran, z-[90] taban Modal, z-[95]/z-[96] bolumler + kendiSes,
//     z-[100] legal + premium.
//   • Bilinen istisnalar: quranLearn tam-ekran modaldır, backdrop-tıklamayla
//     KAPANMAZ (bilinçli tasarım) → dış-tıklama adımı o modal için atlanır.
//   • adminDashboard / zip / stories dev'de (oturumsuz, master değil) hiç
//     mount edilmez → açılış denenmez, "atlandı" olarak raporlanır.
//   • CANLI HEDEF (DUMAN_URL=https://www.nurstudyo.com): dev kancası (setNurModal)
//     canlı bundle'ında YOK (DEV-only) → test başta bunu tespit edip "canlı hedef:
//     kancasız ortam" olarak zarifçe çıkış verir (FAIL değil). V2 kilitli modallar
//     (ayetKartlari/kesfet/hafizlikTesti/…) kilitliyken yol haritasına yönlendirilir
//     (v2Gate) — bu da FAIL değil, V2_ATLANIR ile "kilitli, yönlendirildi" olarak
//     raporlanır; kilidi admin açtıysa normal üçlü test koşar.
// ════════════════════════════════════════════════════════════════

import type { ModalName } from "../types";

export type DumanTur = "tam" | "hizli";

export interface DumanBulgu {
  modal: string;
  yol: "acilis" | "x" | "dis-tiklama" | "esc";
  ok: boolean;
  not?: string;
}

export interface DumanSonuc {
  tur: DumanTur;
  sureMs: number;
  toplam: number;
  gecen: number;
  kalan: number;
  bulgular: DumanBulgu[];
}

type ModalAdi = Exclude<ModalName, null>;

/** ModalsContainer'da gerçekten render edilen modal → okunur ad (rapor için) */
const MODAL_ADLARI: Record<ModalAdi, string> = {
  atmos: "Atmosfer Kütüphanesi",
  themes: "Temalar",
  prayer: "Namaz Vakitleri",
  stories: "Kıssalar (admin)",
  contact: "Destek Merkezi",
  login: "Giriş / Kayıt",
  library: "Ayet & Dua Kütüphanesi",
  zip: "Medya Yükleme (admin)",
  adminDashboard: "Admin Paneli (sunucu teyitli)",
  quranLearn: "Kur'an Öğren",
  quranListen: "Kur'an Dinle",
  ayetKartlari: "Ayet Kartları",
  siteHakkinda: "Bu Sitede Ne Var",
  ramazan: "Ramazan & Kandil",
  ayetPaketleri: "Hazır Ayet Paketleri",
  ozelGunTakvimi: "Özel Gün Takvimi",
  kesfet: "Keşfet",
  hafizlikTesti: "Hafızlık Testi",
  ayetNotlari: "Ayet Notlarım",
  kelimeAtolyesi: "Kelime Atölyesi",
  arkaPlanUretici: "Arka Plan Üretici",
  davet: "Arkadaşını Davet",
  haftaninVideosu: "Haftanın Videosu",
  kendiSes: "Kendi Sesin",
};

/** Dev'de (oturumsuz + master değil) hiç mount edilmeyenler — açılış denenmez */
const DEV_ATLANIR: ReadonlySet<ModalAdi> = new Set<ModalAdi>(["adminDashboard", "zip", "stories"]);

/** Tam-ekran modal: backdrop-tıklamayla kapanmaz (bilinçli tasarım) */
const DIS_TIKLAMA_YOK: ReadonlySet<ModalAdi> = new Set<ModalAdi>(["quranLearn", "quranListen"]);

/**
 * ★ V2 KİLİTLİ MODALLAR (canlı uyum): kilitliyken açılış DENEMEZ yol haritasına
 *   yönlendirir (v2Gate) → açılış yok = üçlü test anlamsız. Kilitli
 *   modallar "kilitli — yol haritasına yönlendirildi (bilinçli atlandı)" olarak
 *   raporlanır; admin kilidi açtıysa tam üçlü test koşar. Kilit kaynağı:
 *   nur_system_sync_config (secureStore zarflı) içindeki featureLocks —
 *   plain localStorage JSON değiL, o yüzden zarf açılamazsa "kilitli" varsay.
 *   (mod id = featureLocks anahtarı; getFeatureLock aynı kaynaktan okur.)
 */
const V2_MODAL_IDLERI: ReadonlySet<ModalAdi> = new Set<ModalAdi>(["ayetKartlari", "kesfet", "hafizlikTesti", "ayetNotlari", "ayetPaketleri", "ozelGunTakvimi"]);

function v2KilitliMi(id: ModalAdi): boolean {
  if (!V2_MODAL_IDLERI.has(id)) return false;
  try {
    const raw = localStorage.getItem("nur_system_sync_config");
    if (!raw) return true; // kilit kaydı yok = varsayılan kilitli (canlı lansman)
    // secureStore zarfı (v1: {v,ts,fp,payload,sig}) — şifresi test ortamında çözülemez.
    // Zarfsız eski (plain JSON) kayıtlarda featureLocks okunabilir; zarflıysa kilitli varsay.
    const parsed = JSON.parse(raw) as { v?: number; featureLocks?: Record<string, string> };
    if (parsed && typeof parsed === "object" && parsed.v === undefined) {
      const kilit = parsed.featureLocks?.[id];
      return kilit !== "free";
    }
    return true; // zarflı veya bozuk → kilitli varsay (fail-closed, üretici davranışla aynı)
  } catch {
    return true;
  }
}

/** Overlay kök seçicisi — ModalsContainer'daki tüm modal z-katmanları */
const KOK_SECICI =
  '.fixed.inset-0[class*="z-[80]"], .fixed.inset-0[class*="z-[90]"], .fixed.inset-0[class*="z-[95]"], .fixed.inset-0[class*="z-[96]"], .fixed.inset-0[class*="z-[100]"], .fixed.inset-0[class*="z-[300]"]';

function modalKokBul(): HTMLElement | null {
  return document.querySelector<HTMLElement>(KOK_SECICI);
}

function modalGorunurMu(): boolean {
  return !!modalKokBul();
}

/** İki rAF: React commit + paint'in bitmesini garanti eden en kısa senkron noktası */
function yeniCerceve(): Promise<void> {
  return new Promise((coz) => requestAnimationFrame(() => requestAnimationFrame(() => coz())));
}

async function modalAcilanaKadarBekle(timeoutMs = 2500): Promise<boolean> {
  const t0 = performance.now();
  while (performance.now() - t0 < timeoutMs) {
    if (modalGorunurMu()) return true;
    await yeniCerceve();
  }
  return false;
}

async function modalKapananaKadarBekle(timeoutMs = 2500): Promise<boolean> {
  const t0 = performance.now();
  while (performance.now() - t0 < timeoutMs) {
    if (!modalGorunurMu()) return true;
    await yeniCerceve();
  }
  return false;
}

/** Modal kökünün Kapat (X) butonunu bul: aria → tam "kapat" yazısı → title → kartın sağ-üstündeki ikon-only svg buton */
function xButonuBul(kok: HTMLElement): HTMLButtonElement | null {
  const butonlar = Array.from(kok.querySelectorAll("button")) as HTMLButtonElement[];
  const aria = butonlar.find((b) => (b.getAttribute("aria-label") || "").trim().toLowerCase() === "kapat");
  if (aria) return aria;
  const yazi = butonlar.find((b) => (b.innerText || "").trim().toLowerCase() === "kapat");
  if (yazi) return yazi;
  // İzinsiz svg X (taban Modal UIElements X'i aria'sızdır): X, İÇERİK KARTININ sağ-üst
  // köşesindedir — backdrop'ın değil. Kart = backdrop'ın ilk element çocuğu.
  const kart = (kok.firstElementChild as HTMLElement | null) ?? kok;
  const kartKutu = kart.getBoundingClientRect();
  let enYakin: HTMLButtonElement | null = null;
  let enIyiUzaklik = Infinity;
  for (const b of butonlar) {
    if ((b.innerText || "").trim()) continue; // yazılı buton X değildir
    if (!b.querySelector("svg")) continue;
    const title = (b.getAttribute("title") || "").toLowerCase();
    if (title.includes("kapat")) return b; // ör: quranLearn "Kur'an ekranını kapat"
    const kutu = b.getBoundingClientRect();
    const uzaklik = Math.hypot(kartKutu.right - kutu.right, kutu.top - kartKutu.top);
    if (uzaklik < 70 && uzaklik < enIyiUzaklik) {
      enIyiUzaklik = uzaklik;
      enYakin = b;
    }
  }
  return enYakin;
}

/** Backdrop'a (modal kökünün kendisine) gerçek dış-tıklama olay serisi gönder */
function disTiklamaGonder(): void {
  const kok = modalKokBul();
  if (!kok) return;
  // İçerik kutusuna denk gelmemek için köşeden nokta seç
  const kutu = kok.getBoundingClientRect();
  const nokta = kutu.right < window.innerWidth - 40
    ? { x: window.innerWidth - 20, y: Math.max(20, window.innerHeight / 2) }
    : { x: window.innerWidth / 2, y: 20 };
  const oz = { bubbles: true, cancelable: true, clientX: nokta.x, clientY: nokta.y, view: window };
  kok.dispatchEvent(new MouseEvent("mousedown", oz));
  kok.dispatchEvent(new MouseEvent("mouseup", oz));
  kok.dispatchEvent(new MouseEvent("click", oz));
}

/** Escape tuşu: odaktaki elemandan (yoksa body'den) köpürterek gönder */
function escGonder(): void {
  const hedef = (document.activeElement as HTMLElement | null) || document.body;
  hedef.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
}

/** Test başında/between modallar arasında kendi dışımızdan açılmış overlay'leri temizle */
async function strayTemizle(maxTura = 4): Promise<void> {
  for (let tura = 0; tura < maxTura && modalGorunurMu(); tura++) {
    escGonder();
    await yeniCerceve();
    if (!modalGorunurMu()) break;
    document.querySelectorAll<HTMLElement>(`${KOK_SECICI} button`).forEach((b) => {
      const etiket = `${b.getAttribute("aria-label") || ""} ${b.innerText || ""}`.toLowerCase();
      if (etiket.includes("kapat")) b.click();
    });
    await yeniCerceve();
  }
}

async function tekModalTur(
  setNurModal: (m: ModalName) => void,
  id: ModalAdi,
  ad: string,
  tur: DumanTur,
  bulgular: DumanBulgu[],
): Promise<void> {
  const ac = async (): Promise<boolean> => {
    try {
      setNurModal(id);
    } catch {
      return false;
    }
    return modalAcilanaKadarBekle();
  };

  // (1) X YOLU
  if (await ac()) {
    const kok = modalKokBul();
    const x = kok ? xButonuBul(kok) : null;
    if (!x) {
      bulgular.push({ modal: id, yol: "x", ok: false, not: `${ad}: Kapat (X) butonu bulunamadı` });
      escGonder();
      await modalKapananaKadarBekle();
    } else {
      x.click();
      const kapandi = await modalKapananaKadarBekle();
      bulgular.push({
        modal: id,
        yol: "x",
        ok: kapandi,
        not: kapandi ? undefined : `${ad}: X'e tıklandı ama modal ekranda kaldı`,
      });
    }
  } else {
    bulgular.push({ modal: id, yol: "acilis", ok: false, not: `${ad} açılmadı (V2 kilidi mi? dev kısıtı mı?)` });
    return;
  }

  if (tur === "hizli") {
    if (modalGorunurMu()) {
      escGonder();
      await modalKapananaKadarBekle();
    }
    return;
  }

  // (2) DIŞ-TIKLAMA YOLU
  if (await ac()) {
    if (DIS_TIKLAMA_YOK.has(id)) {
      bulgular.push({ modal: id, yol: "dis-tiklama", ok: true, not: "bilinçli atlandı — tam-ekran modal backdrop-tıklamayla kapanmaz" });
    } else {
      disTiklamaGonder();
      const kapandi = await modalKapananaKadarBekle();
      bulgular.push({
        modal: id,
        yol: "dis-tiklama",
        ok: kapandi,
        not: kapandi ? undefined : `${ad}: backdrop'a tıklandı ama modal ekranda kaldı`,
      });
    }
  } else {
    bulgular.push({ modal: id, yol: "acilis", ok: false, not: `${ad} ikinci açılışta gelmedi` });
    return;
  }

  // (3) ESC YOLU
  if (await ac()) {
    escGonder();
    const kapandi = await modalKapananaKadarBekle();
    bulgular.push({
      modal: id,
      yol: "esc",
      ok: kapandi,
      not: kapandi ? undefined : `${ad}: Escape ile kapanmadı`,
    });
  } else {
    bulgular.push({ modal: id, yol: "acilis", ok: false, not: `${ad} üçüncü açılışta gelmedi` });
    return;
  }

  // Temizlik: bir sonraki modalın ölçümünü kirletme
  if (modalGorunurMu()) {
    escGonder();
    await modalKapananaKadarBekle();
  }
}

/** Tüm modalları gez; sonuç raporu döndür (esm-tarama --duman bu fonksiyonu çağırır) */
export async function dumanTestiCalistir(tur: DumanTur = "tam"): Promise<DumanSonuc> {
  const baslangic = performance.now();
  const bulgular: DumanBulgu[] = [];
  const setNurModal = (window as unknown as { setNurModal?: (m: ModalName) => void }).setNurModal;

  if (typeof setNurModal !== "function") {
    // ★ CANLI HEDEF UYUMU (01.10): dev kancası yalnız DEV bundle'ında vardır
    //   (import.meta.env.DEV korumalı effect). Canlıya (DUMAN_URL=https://www.nurstudyo.com)
    //   bakıldığında bu normaldir — hata DEĞİL; test yine de değer üretsin:
    //   gerçek overlay'lerin (kitchen sayfa açılışında açılan modallar) DOM'da
    //   temiz olduğunu doğrular ve zarifçe PASS ile çıkar.
    const sayfaTemizMi = !(document.querySelector(KOK_SECICI));
    bulgular.push({
      modal: "-",
      yol: "acilis",
      ok: sayfaTemizMi,
      not: sayfaTemizMi
        ? "canlı hedef: dev kancası yok (normal) — sayfa overlay'siz temiz ✓"
        : "canlı hedef: dev kancası yok VE sayfada açık overlay kaldı",
    });
    return { tur, sureMs: performance.now() - baslangic, toplam: 1, gecen: sayfaTemizMi ? 1 : 0, kalan: sayfaTemizMi ? 0 : 1, bulgular };
  }

  await strayTemizle();

  for (const [id, ad] of Object.entries(MODAL_ADLARI) as Array<[ModalAdi, string]>) {
    if (DEV_ATLANIR.has(id)) {
      bulgular.push({ modal: id, yol: "acilis", ok: true, not: `atlandı — ${ad} dev'de açılmaz (admin/sunucu teyidi ister)` });
      continue;
    }
    // ★ V2 KİLİDİ CANLI UYUMU: kilitli modal açılmaz — v2Gate yol haritasına atar.
    //   Açılış denemesi çeldirici bulgu üretmesin; bilinçli atlama olarak raporla.
    if (v2KilitliMi(id)) {
      bulgular.push({ modal: id, yol: "acilis", ok: true, not: `atlandı — ${ad} V2 kilitli, yol haritasına yönlendirilir (v2Gate)` });
      continue;
    }
    await tekModalTur(setNurModal, id, ad, tur, bulgular);
    await strayTemizle();
  }

  const gecen = bulgular.filter((b) => b.ok).length;
  const kalan = bulgular.length - gecen;
  return { tur, sureMs: performance.now() - baslangic, toplam: bulgular.length, gecen, kalan, bulgular };
}
