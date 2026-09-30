// ════════════════════════════════════════════════════════
// QURANLEARNVERI.TSX — Kur'an Öğren/Dinle veri + alt bileşenler
// QuranLearnModal.tsx'den ayrıldı (SRP adım 11, 30.09)
// 114 sure · 28 kari · 13 meal · Tefsir kutusu · saf yardımcılar
// ════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { elmaliliTefsirGetir } from "./elmaliliTefsir";

export interface Reciter { id: string; name: string; everyayah?: string; full?: [string, number]; }
export interface Ayah { n: number; ar: string; tr: string; juz: number; page: number; }

// ★ SES→KELİME ORANTILI TAKİP: kelimeleri harf sayısına göre tartar —
//    hoca uzun kelimeyi uzunca okurken takip yanına kayar (eşit bölünce 4 kelime geride kalıyordu)
export const weightedWordIndex = (ratio: number, text: string, count: number): number => {
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || count === 0) return 0;
  const weights = parts.slice(0, count).map(p => Math.max(2, p.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").length));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (ratio * total <= acc) return i;
  }
  return weights.length - 1;
};

// ★ TEFSİR KUTUSU — 5 kaynak:
//   Türkçe tam tefsir: Elmalılı "Hak Dini Kur'an Dili" (kurancilar/json CDN — jsDelivr)
//   quran.com v4 API: 169 İbn Kesîr özeti (EN) · 16 Müyeccar (AR) · 15 Taberî (AR) · 90 Kurtubî (AR)
//   Not: quran.com'da ve quranenc'te Türkçe tefsir YOK — İbn Kesîr Türkçe çevirisi yayımlanmamış,
//   o yüzden Türkçe isteyenler için varsayılan kaynak Elmalılı (tam tefsir, ayet ayet bölümü).
export const TAFSIRS: Array<{ id: number | "elmalili"; name: string }> = [
  { id: "elmalili", name: "Elmalılı (Türkçe)" },
  { id: 169, name: "İbn Kesîr (özet, EN)" },
  { id: 16, name: "Tefsîrü'l-Müyesser (AR)" },
  { id: 15, name: "Taberî (AR)" },
  { id: 90, name: "Kurtubî (AR)" },
];
export const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// ★ İNGİLİZCE MEAL TESPİTİ: quran.com id 77 bazen bazı kelimeler için İngilizce döndürür
//   (their plea, they said…). Bunu yakalayıp Türkçe sözlükteki karşılığı varsa onu kullanırız.
export const isEnglishMeal = (t: string) => /^[A-Za-z][A-Za-z'’.,;!?()\- ]{2,}$/.test(t.trim());
const TAFSIR_CACHE = new Map<string, string>();
export const TafsirBox: React.FC<{ surahNo: number; ayahNo: number }> = ({ surahNo, ayahNo }) => {
  const [tafsirId, setTafsirId] = useState<number | "elmalili">("elmalili");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const key = `${tafsirId}:${surahNo}:${ayahNo}`;
    const cached = TAFSIR_CACHE.get(key);
    if (cached !== undefined) { setText(cached); return; }
    let live = true;
    setLoading(true); setText("");
    if (tafsirId === "elmalili") {
      // ★ ELMALILI: surenin TAM tefsiri CDN'den gelir ve AKIŞ olarak gösterilir.
      //   Kaynak metinde ayet sınırları güvenilir işaretli DEĞİL (dipnot numaraları ve
      //   "TEFSİR VE TE'VİL" gibi bölüm başlıkları aynı biçimde yazılmış) — otomatik
      //   bölme yanlış ayete bölüm atıyordu. Kaydırılabilir kutuda surenin tefsiri
      //   baştan sona sunulur; kullanıcı kendi ayetinin bölümüne kayar.
      elmaliliTefsirGetir(surahNo)
        .then(tumMetin => {
          if (!live) return;
          TAFSIR_CACHE.set(key, tumMetin);
          setText(tumMetin);
        })
        .catch(() => { if (live) setText(""); })
        .finally(() => { if (live) setLoading(false); });
      return () => { live = false; };
    }
    fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surahNo}:${ayahNo}`)
      .then(r => r.json())
      .then(d => { const t = stripHtml(d?.tafsir?.text ?? ""); if (live) { TAFSIR_CACHE.set(key, t); setText(t); } })
      .catch(() => { if (live) setText(""); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [open, tafsirId, surahNo, ayahNo]);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-4">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#6e6853]">📖 Tefsir — {TAFSIRS.find(t => t.id === tafsirId)?.name}</span>
        <span className="text-[9px] font-black text-[#D7AA41]">{open ? "− Kapat" : "+ Aç"}</span>
      </button>
      {open && (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TAFSIRS.map(t => (
              <button key={t.id} onClick={() => setTafsirId(t.id)} className={`rounded-lg border px-2 py-1 text-[8px] font-black transition ${tafsirId === t.id ? "border-[#D7AA41]/60 bg-[#D7AA41]/20 text-[#f5dda6]" : "border-white/10 bg-white/[.04] text-[#8f8870] hover:text-[#d8cfae]"}`}>{t.name}</button>
            ))}
          </div>
          {loading ? <p className="mt-2 text-[10px] text-[#7a745f]">Tefsir yükleniyor…</p>
          : text ? <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-line text-[11px] leading-relaxed text-[#b8b093] scrollbar-thin" dir="ltr">{text}</p>
          : <p className="mt-2 text-[10px] text-[#7a745f]">Bu ayet için bu tefsirde metin bulunamadı — başka tefsir seç.</p>}
        </>
      )}
    </div>
  );
};

// ★ KARİ LİSTESİ — everyayah.com AYET BAZLI sesler (her hoca, her ayet için ayrı mp3:
//    001001.mp3 = 1. sure 1. ayet). Kelime/ayet tekrar sistemi bu yüzden tam-sure değil
//    ayet-ayet dosyalarla çalışır. 30 kari tek tek test edildi (hepsi 200 OK).
export const RECITERS: Reciter[] = [
  { id: "Alafasy_128kbps", name: "Mishary Rashid Al-Afasy", full: ["afs", 8] },
  { id: "MaherAlMuaiqly128kbps", name: "Mahir el-Muaykli (Kabe İmamı)", full: ["maher", 12] },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdulbasit Abdussamed (Murattal)", full: ["basit", 7] },
  { id: "Abdul_Basit_Mujawwad_128kbps", name: "Abdulbasit Abdussamed (Mücavved)" },
  { id: "Husary_128kbps", name: "Mahmud Halil el-Husari (Murattal)", full: ["husr", 13] },
  { id: "Husary_Mujawwad_64kbps", name: "Mahmud Halil el-Husari (Mücavved)" },
  { id: "Minshawy_Murattal_128kbps", name: "Muhammed Siddik el-Minşavi (Murattal)", full: ["minsh", 10] },
  { id: "Minshawy_Mujawwad_192kbps", name: "Muhammed Siddik el-Minşavi (Mücavved)" },
  { id: "Menshawi_16kbps", name: "Muhammed Siddik el-Minşavi (Eski Kayıt)" },
  { id: "Ghamadi_40kbps", name: "Saad el-Gamidi", full: ["s_gmd", 7] },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps", name: "Ebu Bekir eş-Şatri", full: ["shatri", 11] },
  { id: "Akram_AlAlaqimy_128kbps", name: "Ekrem el-Alakmi" },
  { id: "Ali_Jaber_64kbps", name: "Ali Cabir (Mescid-i Haram)" },
  { id: "Ayman_Sowaid_64kbps", name: "Eyman es-Suvayd" },
  { id: "Fares_Abbad_64kbps", name: "Fares Abbad" },
  { id: "Hani_Rifai_192kbps", name: "Hani er-Rifai", full: ["hani", 8] },
  { id: "Hudhaify_128kbps", name: "Ali el-Hudaifi (Medine)" },
  { id: "Ibrahim_Akhdar_32kbps", name: "İbrahim El-Ehdar" },
  { id: "Mahmoud_Ali_Al_Banna_32kbps", name: "Mahmud Ali el-Benna" },
  // ★ et-Tablavi ÇIKARILDI (28.09, kullanıcı kararı): okuması hatalı geliyordu —
  //   "sesler kötü okuma yanlış seslendirme kaldır iptal". KesfetModal KARİLER'den de çıkarıldı.
  { id: "Muhammad_Ayyoub_128kbps", name: "Muhammed Eyyub (Medine)", full: ["ayyub", 8] },
  { id: "Muhammad_Jibreel_64kbps", name: "Muhammed Cibril", full: ["jbrl", 8] },
  { id: "Muhsin_Al_Qasim_192kbps", name: "Muhsin el-Kasım (Medine)" },
  // Mustafa İsmail çıkarıldı: everyayah kopyasında birçok surenin ayet dosyası eksik (404) — sessiz kalıyordu
  { id: "Nasser_Alqatami_128kbps", name: "Nasser el-Katami", full: ["ajm", 10] },
  { id: "Sahl_Yassin_128kbps", name: "Sehl Yasin (Medine)" },
  { id: "Salah_Al_Budair_128kbps", name: "Salah el-Budeyr", full: ["sds", 11] },
  { id: "Saood_ash-Shuraym_128kbps", name: "Sud eş-Şuraym (Kabe İmamı)", full: ["shur", 7] },
  { id: "Yasser_Ad-Dussary_128kbps", name: "Yaser ed-Dossari", full: ["yasser", 11] },
  { id: "Abdullah_Matroud_128kbps", name: "Abdullah el-Metroud" },
];

export const MEALS = [
  { id: "tr.diyanet", name: "Diyanet İşleri Başkanlığı" },
  { id: "tr.vakfi", name: "Elmalılı Hamdi Yazır (Truefed)" },
  { id: "tr.yazir", name: "Elmalılı Hamdi Yazır (Hak Dini)" },
  { id: "tr.golpinarli", name: "Abdulbaki Gölpınarlı" },
  { id: "tr.yildirim", name: "Suat Yıldırım" },
  { id: "tr.bulac", name: "Ali Bulaç" },
  { id: "tr.ates", name: "Süleyman Ateş" },
  // ★ ÇOK DİLLİ MEAL (madde 49) — EN/DE/FR öncelikli uluslararası açılım
  { id: "en.sahih", name: "English — Sahih International" },
  { id: "en.pickthall", name: "English — Pickthall" },
  { id: "de.aburida", name: "Deutsch — Abu Rida" },
  { id: "de.bubenheim", name: "Deutsch — Bubenheim & Elyas" },
  { id: "fr.hamidullah", name: "Français — Hamidullah" },
  { id: "es.cortes", name: "Español — Julio Cortés" },
] as const;

// ── 114 sure verisi ──
export interface SurahInfo { n: number; name: string; en: string; ayahs: number; type: string; }
export const SURAHS_DATA: SurahInfo[] = [
  { n: 1, name: "Fâtiha", en: "Al-Faatiha", ayahs: 7, type: "Mekkî" },
  { n: 2, name: "Bakara", en: "Al-Baqara", ayahs: 286, type: "Medenî" },
  { n: 3, name: "Âl-i İmrân", en: "Aal-i-Imraan", ayahs: 200, type: "Medenî" },
  { n: 4, name: "Nisâ", en: "An-Nisaa", ayahs: 176, type: "Medenî" },
  { n: 5, name: "Mâide", en: "Al-Maaida", ayahs: 120, type: "Medenî" },
  { n: 6, name: "En'âm", en: "Al-An'aam", ayahs: 165, type: "Mekkî" },
  { n: 7, name: "A'râf", en: "Al-Araaf", ayahs: 206, type: "Mekkî" },
  { n: 8, name: "Enfâl", en: "Al-Anfaal", ayahs: 75, type: "Medenî" },
  { n: 9, name: "Tevbe", en: "At-Tawba", ayahs: 129, type: "Medenî" },
  { n: 10, name: "Yûnus", en: "Yunus", ayahs: 109, type: "Mekkî" },
  { n: 11, name: "Hûd", en: "Hud", ayahs: 123, type: "Mekkî" },
  { n: 12, name: "Yûsuf", en: "Yusuf", ayahs: 111, type: "Mekkî" },
  { n: 13, name: "Ra'd", en: "Ar-Ra'd", ayahs: 43, type: "Medenî" },
  { n: 14, name: "İbrâhîm", en: "Ibrahim", ayahs: 52, type: "Mekkî" },
  { n: 15, name: "Hicr", en: "Al-Hijr", ayahs: 99, type: "Mekkî" },
  { n: 16, name: "Nahl", en: "An-Nahl", ayahs: 128, type: "Mekkî" },
  { n: 17, name: "İsrâ", en: "Al-Israa", ayahs: 111, type: "Mekkî" },
  { n: 18, name: "Kehf", en: "Al-Kahf", ayahs: 110, type: "Mekkî" },
  { n: 19, name: "Meryem", en: "Maryam", ayahs: 98, type: "Mekkî" },
  { n: 20, name: "Tâhâ", en: "Taa-Haa", ayahs: 135, type: "Mekkî" },
  { n: 21, name: "Enbiyâ", en: "Al-Anbiyaa", ayahs: 112, type: "Mekkî" },
  { n: 22, name: "Hac", en: "Al-Hajj", ayahs: 78, type: "Medenî" },
  { n: 23, name: "Mü'minûn", en: "Al-Muminoon", ayahs: 118, type: "Mekkî" },
  { n: 24, name: "Nûr", en: "An-Noor", ayahs: 64, type: "Medenî" },
  { n: 25, name: "Furkân", en: "Al-Furqaan", ayahs: 77, type: "Mekkî" },
  { n: 26, name: "Şuarâ", en: "Ash-Shuaraa", ayahs: 227, type: "Mekkî" },
  { n: 27, name: "Neml", en: "An-Naml", ayahs: 93, type: "Mekkî" },
  { n: 28, name: "Kasas", en: "Al-Qasas", ayahs: 88, type: "Mekkî" },
  { n: 29, name: "Ankebût", en: "Al-Ankaboot", ayahs: 69, type: "Mekkî" },
  { n: 30, name: "Rûm", en: "Ar-Room", ayahs: 60, type: "Mekkî" },
  { n: 31, name: "Lokmân", en: "Luqman", ayahs: 34, type: "Mekkî" },
  { n: 32, name: "Secde", en: "As-Sajda", ayahs: 30, type: "Mekkî" },
  { n: 33, name: "Ahzâb", en: "Al-Ahzaab", ayahs: 73, type: "Medenî" },
  { n: 34, name: "Sebe'", en: "Saba", ayahs: 54, type: "Mekkî" },
  { n: 35, name: "Fâtır", en: "Faatir", ayahs: 45, type: "Mekkî" },
  { n: 36, name: "Yâsîn", en: "Yaseen", ayahs: 83, type: "Mekkî" },
  { n: 37, name: "Sâffât", en: "As-Saaffaat", ayahs: 182, type: "Mekkî" },
  { n: 38, name: "Sâd", en: "Saad", ayahs: 88, type: "Mekkî" },
  { n: 39, name: "Zümer", en: "Az-Zumar", ayahs: 75, type: "Mekkî" },
  { n: 40, name: "Mü'min", en: "Ghafir", ayahs: 85, type: "Mekkî" },
  { n: 41, name: "Fussilet", en: "Fussilat", ayahs: 54, type: "Mekkî" },
  { n: 42, name: "Şûrâ", en: "Ash-Shura", ayahs: 53, type: "Mekkî" },
  { n: 43, name: "Zuhruf", en: "Az-Zukhruf", ayahs: 89, type: "Mekkî" },
  { n: 44, name: "Duhân", en: "Ad-Dukhan", ayahs: 59, type: "Mekkî" },
  { n: 45, name: "Câsiye", en: "Al-Jaathiya", ayahs: 37, type: "Mekkî" },
  { n: 46, name: "Ahkâf", en: "Al-Ahqaf", ayahs: 35, type: "Mekkî" },
  { n: 47, name: "Muhammed", en: "Muhammad", ayahs: 38, type: "Medenî" },
  { n: 48, name: "Fetih", en: "Al-Fath", ayahs: 29, type: "Medenî" },
  { n: 49, name: "Hucurât", en: "Al-Hujuraat", ayahs: 18, type: "Medenî" },
  { n: 50, name: "Kâf", en: "Qaaf", ayahs: 45, type: "Mekkî" },
  { n: 51, name: "Zâriyât", en: "Adh-Dhaariyat", ayahs: 60, type: "Mekkî" },
  { n: 52, name: "Tûr", en: "At-Tur", ayahs: 49, type: "Mekkî" },
  { n: 53, name: "Necm", en: "An-Najm", ayahs: 62, type: "Mekkî" },
  { n: 54, name: "Kamer", en: "Al-Qamar", ayahs: 55, type: "Mekkî" },
  { n: 55, name: "Rahmân", en: "Ar-Rahmaan", ayahs: 78, type: "Medenî" },
  { n: 56, name: "Vâkıa", en: "Al-Waaqia", ayahs: 96, type: "Mekkî" },
  { n: 57, name: "Hadîd", en: "Al-Hadid", ayahs: 29, type: "Medenî" },
  { n: 58, name: "Mucâdele", en: "Al-Mujaadila", ayahs: 22, type: "Medenî" },
  { n: 59, name: "Haşr", en: "Al-Hashr", ayahs: 24, type: "Medenî" },
  { n: 60, name: "Mümtehine", en: "Al-Mumtahana", ayahs: 13, type: "Medenî" },
  { n: 61, name: "Saf", en: "As-Saff", ayahs: 14, type: "Medenî" },
  { n: 62, name: "Cuma", en: "Al-Jumuaa", ayahs: 11, type: "Medenî" },
  { n: 63, name: "Münâfikûn", en: "Al-Munaafiqoon", ayahs: 11, type: "Medenî" },
  { n: 64, name: "Teğâbun", en: "At-Taghaabun", ayahs: 18, type: "Medenî" },
  { n: 65, name: "Talâk", en: "At-Talaaq", ayahs: 12, type: "Medenî" },
  { n: 66, name: "Tahrîm", en: "At-Tahrim", ayahs: 12, type: "Medenî" },
  { n: 67, name: "Mülk", en: "Al-Mulk", ayahs: 30, type: "Mekkî" },
  { n: 68, name: "Kalem", en: "Al-Qalam", ayahs: 52, type: "Mekkî" },
  { n: 69, name: "Hâkka", en: "Al-Haaqqa", ayahs: 52, type: "Mekkî" },
  { n: 70, name: "Meâric", en: "Al-Maarij", ayahs: 44, type: "Mekkî" },
  { n: 71, name: "Nûh", en: "Nooh", ayahs: 28, type: "Mekkî" },
  { n: 72, name: "Cin", en: "Al-Jinn", ayahs: 28, type: "Mekkî" },
  { n: 73, name: "Müzzemmil", en: "Al-Muzzammil", ayahs: 20, type: "Mekkî" },
  { n: 74, name: "Müddessir", en: "Al-Muddassir", ayahs: 56, type: "Mekkî" },
  { n: 75, name: "Kıyâme", en: "Al-Qiyaama", ayahs: 40, type: "Mekkî" },
  { n: 76, name: "İnsân", en: "Al-Insaan", ayahs: 31, type: "Medenî" },
  { n: 77, name: "Mürselât", en: "Al-Mursalaat", ayahs: 50, type: "Mekkî" },
  { n: 78, name: "Nebe'", en: "An-Naba", ayahs: 40, type: "Mekkî" },
  { n: 79, name: "Nâziât", en: "An-Naaziaat", ayahs: 46, type: "Mekkî" },
  { n: 80, name: "Abese", en: "Abasa", ayahs: 42, type: "Mekkî" },
  { n: 81, name: "Tekvîr", en: "At-Takwir", ayahs: 29, type: "Mekkî" },
  { n: 82, name: "İnfitâr", en: "Al-Infitaar", ayahs: 19, type: "Mekkî" },
  { n: 83, name: "Mutaffifîn", en: "Al-Mutaffifin", ayahs: 36, type: "Mekkî" },
  { n: 84, name: "İnşikâk", en: "Al-Inshiqaar", ayahs: 25, type: "Mekkî" },
  { n: 85, name: "Burûc", en: "Al-Burooj", ayahs: 22, type: "Mekkî" },
  { n: 86, name: "Târik", en: "At-Taariq", ayahs: 17, type: "Mekkî" },
  { n: 87, name: "A'lâ", en: "Al-Aalaa", ayahs: 19, type: "Mekkî" },
  { n: 88, name: "Ğâşiye", en: "Al-Ghaashiya", ayahs: 26, type: "Mekkî" },
  { n: 89, name: "Fecr", en: "Al-Fajr", ayahs: 30, type: "Mekkî" },
  { n: 90, name: "Beled", en: "Al-Balad", ayahs: 20, type: "Mekkî" },
  { n: 91, name: "Şems", en: "Ash-Shams", ayahs: 15, type: "Mekkî" },
  { n: 92, name: "Leyl", en: "Al-Layl", ayahs: 21, type: "Mekkî" },
  { n: 93, name: "Duhâ", en: "Ad-Duhaa", ayahs: 11, type: "Mekkî" },
  { n: 94, name: "İnşirâh", en: "Ash-Sharh", ayahs: 8, type: "Mekkî" },
  { n: 95, name: "Tîn", en: "At-Tiin", ayahs: 8, type: "Mekkî" },
  { n: 96, name: "Alak", en: "Al-Alaq", ayahs: 19, type: "Mekkî" },
  { n: 97, name: "Kadr", en: "Al-Qadr", ayahs: 5, type: "Mekkî" },
  { n: 98, name: "Beyyine", en: "Al-Bayina", ayahs: 8, type: "Medenî" },
  { n: 99, name: "Zilzâl", en: "Az-Zalzala", ayahs: 8, type: "Medenî" },
  { n: 100, name: "Âdiyât", en: "Al-Aadiyaat", ayahs: 11, type: "Mekkî" },
  { n: 101, name: "Kâria", en: "Al-Qaaria", ayahs: 11, type: "Mekkî" },
  { n: 102, name: "Tekâsür", en: "At-Takaathur", ayahs: 8, type: "Mekkî" },
  { n: 103, name: "Asr", en: "Al-Asr", ayahs: 3, type: "Mekkî" },
  { n: 104, name: "Hümeze", en: "Al-Humaza", ayahs: 9, type: "Mekkî" },
  { n: 105, name: "Fîl", en: "Al-Fil", ayahs: 5, type: "Mekkî" },
  { n: 106, name: "Kureyş", en: "Quraish", ayahs: 4, type: "Mekkî" },
  { n: 107, name: "Mâûn", en: "Al-Maun", ayahs: 7, type: "Mekkî" },
  { n: 108, name: "Kevser", en: "Al-Kawthar", ayahs: 3, type: "Mekkî" },
  { n: 109, name: "Kâfirûn", en: "Al-Kaafiroon", ayahs: 6, type: "Mekkî" },
  { n: 110, name: "Nasr", en: "An-Nasr", ayahs: 3, type: "Medenî" },
  { n: 111, name: "Tebbet", en: "Al-Masad", ayahs: 5, type: "Mekkî" },
  { n: 112, name: "İhlâs", en: "Al-Ikhlaas", ayahs: 4, type: "Mekkî" },
  { n: 113, name: "Felak", en: "Al-Falak", ayahs: 5, type: "Mekkî" },
  { n: 114, name: "Nâs", en: "An-Naas", ayahs: 6, type: "Mekkî" },
];

