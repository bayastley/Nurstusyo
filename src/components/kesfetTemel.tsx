// ════════════════════════════════════════════════════════
// KESFETTEMEL.TSX — Keşfet Modal temel parçaları
// KesfetModal.tsx'den ayrıldı (SRP adım 4, 30.09)
// Kitaplık okuma · Dua TTS ses motoru · Kâriler · Sekmeler
// ════════════════════════════════════════════════════════

import React, { useState } from "react";

// ★ KİTAPLIK (madde 56) — kullanıcının işaretledikleri tek ekranda
export const ISARET_KEY = "nur_kitaplik_ayetler"; // işaretli ayetler ("2:255" listesi)
export const NOTLAR_KEY = "nur_ayet_notlari_v1";  // AyetNotlariModal ile aynı anahtar (şifreli)
export interface KitaplikNot { k: string; metin: string; ts: number }
export function kitaplikOku(): { isaretler: string[]; notlar: KitaplikNot[] } {
  let isaretler: string[] = [];
  try { isaretler = JSON.parse(localStorage.getItem(ISARET_KEY) || "[]"); } catch {}
  let notlar: KitaplikNot[] = [];
  try { notlar = JSON.parse(localStorage.getItem(NOTLAR_KEY) || "[]"); } catch {}
  return { isaretler, notlar };
}

// ★ KELİME ↔ ATÖLYE BAĞI (03.10): "bilinen" kelimeler cihazda tutulur —
//   atölyeden stüdyoya aktarılan kelime kartı yeşil tik alır; tik elle de işaretlenip kaldırılabilir.
export const BILINEN_KELIME_KEY = "nur_kelime_bilinen";
export function bilinenKelimelerOku(): string[] {
  try { return JSON.parse(localStorage.getItem(BILINEN_KELIME_KEY) || "[]") as string[]; } catch { return []; }
}
export function bilinenKelimeIsaretle(ar: string, isaretle = true): void {
  try {
    const liste = new Set(bilinenKelimelerOku());
    if (isaretle) liste.add(ar); else liste.delete(ar);
    localStorage.setItem(BILINEN_KELIME_KEY, JSON.stringify([...liste]));
    window.dispatchEvent(new CustomEvent("nur_kelime_bilinen"));
  } catch { /* yoksay */ }
}

// ═══ DUA REHBERİ SES MOTORU (28.09) ═══
// Kullanıcı kararı: TTS sesi çirkin geliyordu. Cihazdaki Türkçe sesler kalite sırasına
// göre seçilir + kadın/erkek tercihi localStorage'da saklanır. Microsoft/Google nöral
// sesler (Emel, Filiz, Yelda, Ahmet, Tolga) varsa onlar öncelikli — çok daha doğal.
export const DUA_SES_KEY = "nur_dua_ses_tercihi"; // "kadin" | "erkek"
export function duaSesTercihiOku(): "kadin" | "erkek" {
  try { return localStorage.getItem(DUA_SES_KEY) === "erkek" ? "erkek" : "kadin"; } catch { return "kadin"; }
}
// ★ 27.09 SESİYİLEŞTİRME: getVoices() ilk çağrıda boş döner (Chrome/Edge async yükler)
//   → voicesChanged gelene kadar bekleyen yardımcı. Yoksa 1sn'de pes et.
export function sesleriBekle(ms = 1200): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    try {
      const syn = window.speechSynthesis;
      if (!syn) return resolve([]);
      const ilk = syn.getVoices?.() ?? [];
      if (ilk.length) return resolve(ilk);
      let bitti = false;
      const tamamla = () => { if (!bitti) { bitti = true; resolve(syn.getVoices?.() ?? []); } };
      syn.addEventListener("voiceschanged", tamamla, { once: true });
      window.setTimeout(tamamla, ms);
    } catch { resolve([]); }
  });
}
/** Cihazdaki Türkçe sesler arasından tercihe göre en kalitelisini bulur (nöral > premium > normal). */
export async function enIyiTurkceSes(tercih: "kadin" | "erkek"): Promise<SpeechSynthesisVoice | null> {
  try {
    const sesler = await sesleriBekle();
    const tr = sesler.filter((s) => s.lang?.toLowerCase().startsWith("tr"));
    if (!tr.length) return null;
    const kadinIpucu = /emel|filiz|yelda|seda|zeynep|woman|female|kadın/i;
    const erkekIpucu = /ahmet|tolga|man|male|erkek/i; // Ahmet (nöral) Tolga'dan önce gelsin
    const sinif: SpeechSynthesisVoice[] = [];
    const diger: SpeechSynthesisVoice[] = [];
    for (const s of tr) (tercih === "kadin" ? kadinIpucu : erkekIpucu).test(s.name) ? sinif.push(s) : diger.push(s);
    const havuz = sinif.length ? sinif : diger;
    // Nöral/premium sesler en doğal — adında geçenlere öncelik (Emel Online Natural > Tolga SAPI)
    havuz.sort((a, b) => {
      const puan = (s: SpeechSynthesisVoice) => (/natural|neural|premium|enhanced/i.test(s.name) ? 3 : /online/i.test(s.name) ? 2 : /google|microsoft/i.test(s.name) ? 1 : 0);
      return puan(b) - puan(a);
    });
    return havuz[0] ?? null;
  } catch { return null; }
}
/** 🔊/🔇 ses tercihi seçici — Dua Rehberi başlığının altında durur. */
export const DuaSesSecici: React.FC<{ notify?: (m: string) => void }> = ({ notify }) => {
  const [tercih, setTercih] = useState<"kadin" | "erkek">(() => duaSesTercihiOku());
  const degistir = async (yeni: "kadin" | "erkek") => {
    setTercih(yeni);
    try { localStorage.setItem(DUA_SES_KEY, yeni); } catch {}
    // sesleri bekle-yükle (async) + kısa örnek oku — nöral ses varsa onu seçer
    try {
      window.speechSynthesis?.cancel();
      const utt = new SpeechSynthesisUtterance("Dualar kabul olsun");
      utt.lang = "tr-TR"; utt.rate = 0.92; utt.pitch = 1.0;
      const ses = await enIyiTurkceSes(yeni); if (ses) utt.voice = ses;
      window.speechSynthesis?.speak(utt);
      // Cihazda sadece eski SAPI sesi varsa kullanıcıya doğal ses yolunu göster
      if (ses && !/natural|neural|online/i.test(ses.name) && notify) {
        notify("🔊 Ses seçildi · Daha doğal ses için Microsoft Edge kullan (Emel/Ahmet sesleri)");
        return;
      }
    } catch { /* yoksay */ }
    notify?.(yeni === "kadin" ? "🔊 Kadın sesi seçildi" : "🔊 Erkek sesi seçildi");
  };
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/35">Ses:</span>
      {(["kadin", "erkek"] as const).map((t) => (
        <button key={t} type="button" onClick={() => degistir(t)}
          className={`rounded-full px-2.5 py-1 text-[9px] font-black transition ${tercih === t ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
          style={tercih === t ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
          {t === "kadin" ? "♀ Kadın" : "♂ Erkek"}
        </button>
      ))}
    </div>
  );
};

/** 🔊 Kelime kartı okunuşu (28.09): önce Arapça sesle dene; cihazda Arapça TTS yoksa
 *  latin okunuşu Türkçe sesle oku ("kalb" → kullanıcı okunuşunu duyar). */
export const kelimeOku = async (k: { ar: string; okunus: string }) => {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const sesler = await sesleriBekle();
    const arSes = sesler.find((s) => s.lang?.toLowerCase().startsWith("ar"));
    const utt = new SpeechSynthesisUtterance(arSes ? k.ar : k.okunus);
    utt.lang = arSes ? arSes.lang : "tr-TR";
    if (arSes) utt.voice = arSes;
    utt.rate = 0.85; // öğrenme için yavaş
    window.speechSynthesis.speak(utt);
  } catch { /* yoksay */ }
};

// Ayet-bazlı (everyayah) kâriler — QuranLearnModal'ın RECITERS listesiyle hizalı.
// ★ GENİŞLETİLDİ (28.09, kullanıcı kararı): 6 → 28 kari — "hocaları çoğalt".
// ★ et-Tablavi ÇIKARILDI (28.09, kullanıcı kararı): okuması bozuk/hatalı geliyordu —
//   "sesler kötü okuma yanlış seslendirme kaldır iptal". QuranLearnModal'da da çıkarıldı.
export const KARILER = [
  { id: "Abdul_Basit_Murattal_192kbps", ad: "Abdulbasit (Murattal)" },
  { id: "Abdul_Basit_Mujawwad_128kbps", ad: "Abdulbasit (Mücavved)" },
  { id: "Husary_128kbps", ad: "el-Husari (Murattal)" },
  { id: "Husary_Mujawwad_64kbps", ad: "el-Husari (Mücavved)" },
  { id: "Minshawy_Murattal_128kbps", ad: "el-Minşavi" },
  { id: "Minshawy_Mujawwad_192kbps", ad: "el-Minşavi (Mücavved)" },
  { id: "Alafasy_128kbps", ad: "Mişari Raşid el-Afasi" },
  { id: "MaherAlMuaiqly128kbps", ad: "Mahir el-Muaykli (Kabe İmamı)" },
  { id: "Saood_ash-Shuraym_128kbps", ad: "Sud eş-Şuraym (Kabe İmamı)" },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps", ad: "Ebu Bekir eş-Şatri" },
  { id: "Hani_Rifai_192kbps", ad: "Hani er-Rifai" },
  { id: "Ghamadi_40kbps", ad: "Saad el-Gamidi" },
  { id: "Hudhaify_128kbps", ad: "Ali el-Hudaifi (Medine)" },
  { id: "Muhammad_Ayyoub_128kbps", ad: "Muhammed Eyyub (Medine)" },
  { id: "Yasser_Ad-Dussary_128kbps", ad: "Yaser ed-Dossari" },
  { id: "Salah_Al_Budair_128kbps", ad: "Salah el-Budeyr" },
  { id: "Sahl_Yassin_128kbps", ad: "Sehl Yasin (Medine)" },
  { id: "Nasser_Alqatami_128kbps", ad: "Nasser el-Katami" },
  { id: "Abdullah_Matroud_128kbps", ad: "Abdullah el-Metroud" },
  { id: "Mahmoud_Ali_Al_Banna_32kbps", ad: "Mahmud Ali el-Benna" },
  { id: "Muhammad_Jibreel_64kbps", ad: "Muhammed Cibril" },
  { id: "Fares_Abbad_64kbps", ad: "Fares Abbad" },
  { id: "Ali_Jaber_64kbps", ad: "Ali Cabir (Mescid-i Haram)" },
  { id: "Ayman_Sowaid_64kbps", ad: "Eyman es-Suvayd" },
  { id: "Akram_AlAlaqimy_128kbps", ad: "Ekrem el-Alakmi" },
  { id: "Ibrahim_Akhdar_32kbps", ad: "İbrahim El-Ehdar" },
  { id: "Muhsin_Al_Qasim_192kbps", ad: "Muhsin el-Kasım (Medine)" },
  { id: "Menshawi_16kbps", ad: "el-Minşavi (Eski Kayıt)" },
];

export const everyAyetUrl = (reciterId: string, s: number, a: number) =>
  `https://everyayah.com/data/${reciterId}/${String(s).padStart(3, "0")}${String(a).padStart(3, "0")}.mp3`;

export type SekmeId = "hadis" | "kissa" | "soru" | "kelime" | "sure" | "namaz" | "dua" | "hoca" | "cami" | "rehber" | "kitaplik" | "tecvid";

export const SEKMELER: Array<{ id: SekmeId; label: string; emoji: string }> = [
  { id: "hadis", label: "Hadis Bankası", emoji: "📚" },
  { id: "kissa", label: "Kıssa Köşesi", emoji: "🕌" },
  { id: "soru", label: "Soru-Cevap", emoji: "❓" },
  { id: "kelime", label: "Kelime Kartları", emoji: "🔤" },
  { id: "sure", label: "Sure Bilgileri", emoji: "📖" },
  { id: "namaz", label: "Namaz Öğretici", emoji: "🧎" },
  { id: "dua", label: "Dua Rehberi", emoji: "🤲" },
  { id: "hoca", label: "Hoca Karşılaştır", emoji: "🎧" },
  { id: "cami", label: "Cami Bulucu", emoji: "📍" },
  { id: "rehber", label: "Kanal Rehberi", emoji: "🚀" },
  { id: "tecvid", label: "Tecvid Rehberi", emoji: "🎓" },
  { id: "kitaplik", label: "Kitaplığım", emoji: "🔖" },
];
