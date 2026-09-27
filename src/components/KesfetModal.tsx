// ════════════════════════════════════════════════════════
// KESFET MODAL — yol haritasının içerik maddeleri tek çatı:
// 18 Hadis Bankası · 19 Kıssa Köşesi · 20 Soru-Cevap Arşivi
// 21 Kelime Kartları · 22 Sure Bilgileri · 28 Namaz Öğretici
// 35 Bebek Duası Köşesi · 61 Dua Vakit Rehberi
// Sekme yapısı mevcut Segmented/Modal diliyle aynı; her sekme
// kendi içinde filtre/arama taşır. Stüdyoya dokunmaz.
// ════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import { Search, ChevronLeft } from "lucide-react";
import { Modal } from "./UIElements";
import {
  HADIS_BANKASI, HADIS_TEMALARI, HADIS_DERECE_ETIKETI, KISSA_LISTESI, SORU_CEVAP_ARŞIVI, TECVID_KURALLARI, TECVID_SEVIYE_ETIKETI,
  KELIME_KARTLARI, SURE_BİLGİLERİ, NAMAZ_REHBERİ, DUA_REHBERİ, BES_SART_SORULARI,
  HOCA_KARSILASTIRMA_AYETLER, camiHaritaUrl, camiListeUrl, KANAL_REHBERI,
} from "../data/kesfetData";
import { SURAHS } from "../data/surahs";

// ★ KİTAPLIK (madde 56) — kullanıcının işaretledikleri tek ekranda
const ISARET_KEY = "nur_kitaplik_ayetler"; // işaretli ayetler ("2:255" listesi)
const NOTLAR_KEY = "nur_ayet_notlari_v1";  // AyetNotlariModal ile aynı anahtar (şifreli)
interface KitaplikNot { k: string; metin: string; ts: number }
function kitaplikOku(): { isaretler: string[]; notlar: KitaplikNot[] } {
  let isaretler: string[] = [];
  try { isaretler = JSON.parse(localStorage.getItem(ISARET_KEY) || "[]"); } catch {}
  let notlar: KitaplikNot[] = [];
  try { notlar = JSON.parse(localStorage.getItem(NOTLAR_KEY) || "[]"); } catch {}
  return { isaretler, notlar };
}

// ═══ DUA REHBERİ SES MOTORU (28.09) ═══
// Kullanıcı kararı: TTS sesi çirkin geliyordu. Cihazdaki Türkçe sesler kalite sırasına
// göre seçilir + kadın/erkek tercihi localStorage'da saklanır. Microsoft/Google nöral
// sesler (Emel, Filiz, Yelda, Ahmet, Tolga) varsa onlar öncelikli — çok daha doğal.
const DUA_SES_KEY = "nur_dua_ses_tercihi"; // "kadin" | "erkek"
function duaSesTercihiOku(): "kadin" | "erkek" {
  try { return localStorage.getItem(DUA_SES_KEY) === "erkek" ? "erkek" : "kadin"; } catch { return "kadin"; }
}
// ★ 27.09 SESİYİLEŞTİRME: getVoices() ilk çağrıda boş döner (Chrome/Edge async yükler)
//   → voicesChanged gelene kadar bekleyen yardımcı. Yoksa 1sn'de pes et.
function sesleriBekle(ms = 1200): Promise<SpeechSynthesisVoice[]> {
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
async function enIyiTurkceSes(tercih: "kadin" | "erkek"): Promise<SpeechSynthesisVoice | null> {
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
const DuaSesSecici: React.FC<{ notify?: (m: string) => void }> = ({ notify }) => {
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
const kelimeOku = async (k: { ar: string; okunus: string }) => {
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
const KARILER = [
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
const everyAyetUrl = (reciterId: string, s: number, a: number) =>
  `https://everyayah.com/data/${reciterId}/${String(s).padStart(3, "0")}${String(a).padStart(3, "0")}.mp3`;

type SekmeId = "hadis" | "kissa" | "soru" | "kelime" | "sure" | "namaz" | "dua" | "hoca" | "cami" | "rehber" | "kitaplik" | "tecvid";

const SEKMELER: Array<{ id: SekmeId; label: string; emoji: string }> = [
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

interface KesfetModalProps {
  open: boolean;
  onClose: () => void;
  initialSekme?: SekmeId;
  notify?: (msg: string) => void;
}

export const KesfetModal: React.FC<KesfetModalProps> = ({ open, onClose, initialSekme, notify }) => {
  const [sekme, setSekme] = useState<SekmeId>(initialSekme ?? "hadis");
  const [arama, setArama] = useState("");
  const [hadisTema, setHadisTema] = useState("tumu");
  const [kartCevrildi, setKartCevrildi] = useState<number | null>(null);
  // ★ Hoca karşılaştırma state'leri (madde 41)
  // ★ Kitaplık (madde 56) — sekme açılınca taze okunur
  const [kitaplikVeri, setKitaplikVeri] = useState<{ isaretler: string[]; notlar: KitaplikNot[] }>({ isaretler: [], notlar: [] });
  const [camiKonum, setCamiKonum] = useState("");
  const [camiAranan, setCamiAranan] = useState<string | null>(null);
  const [hocaAyet, setHocaAyet] = useState<number>(0); // seçili ayet index'i
  const [hocaIdx, setHocaIdx] = useState<number>(0);   // çalan kari index'i
  const [hocaCaliyor, setHocaCaliyor] = useState(false);
  const hocaAudioRef = React.useRef<HTMLAudioElement | null>(null);
  if (!hocaAudioRef.current && typeof Audio !== "undefined") { hocaAudioRef.current = new Audio(); hocaAudioRef.current.preload = "none"; }

  const hocaCal = (kariIdx: number) => {
    const a = hocaAudioRef.current;
    const ayet = HOCA_KARSILASTIRMA_AYETLER[hocaAyet];
    if (!a || !ayet) return;
    a.pause();
    a.src = everyAyetUrl(KARILER[kariIdx].id, ayet.sure, ayet.ayet);
    setHocaIdx(kariIdx);
    setHocaCaliyor(true);
    a.play().catch(() => setHocaCaliyor(false));
  };
  const hocaDurdur = () => {
    hocaAudioRef.current?.pause();
    setHocaCaliyor(false);
  };
  React.useEffect(() => () => { hocaAudioRef.current?.pause(); }, []);

  const q = arama.trim().toLocaleLowerCase("tr");

  const filtreliHadisler = useMemo(
    () => HADIS_BANKASI.filter((h) => (hadisTema === "tumu" || h.tema === hadisTema) && (!q || h.metin.toLocaleLowerCase("tr").includes(q) || h.kaynak.toLocaleLowerCase("tr").includes(q))),
    [hadisTema, q],
  );
  // ★ KÜLLİYAT ARAMASI (28.09): yerel bankada sonuç yoksa Buhârî+Müslim külliyatı
  //   /api/hadis/ara'dan çekilir (dorar.net + opsiyonel sunnah.com). "aile" gibi
  //   yerel bankada olmayan kelimelerde artık boş değil, külliyattan sonuç gelir.
  const [kuliyatYukleniyor, setKuliyatYukleniyor] = useState(false);
  const [kuliyatSonuc, setKuliyatSonuc] = useState<Array<{ metin: string; kaynak: string; derece: string; kitap: string; dil: string }>>([]);
  React.useEffect(() => {
    if (sekme !== "hadis" || q.length < 2 || filtreliHadisler.length > 0) { setKuliyatSonuc([]); setKuliyatYukleniyor(false); return; }
    let canli = true;
    setKuliyatYukleniyor(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/hadis/ara?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        if (canli) setKuliyatSonuc(Array.isArray(data?.sonuclar) ? data.sonuclar : []);
      } catch { if (canli) setKuliyatSonuc([]); }
      finally { if (canli) setKuliyatYukleniyor(false); }
    }, 400); // debounce — her tuşta istek atılmaz
    return () => { canli = false; clearTimeout(t); };
  }, [sekme, q, filtreliHadisler.length]);
  const filtreliKissalar = useMemo(() => KISSA_LISTESI.filter((k) => !q || k.ad.toLocaleLowerCase("tr").includes(q) || k.ozet.toLocaleLowerCase("tr").includes(q)), [q]);
  const filtreliSorular = useMemo(() => SORU_CEVAP_ARŞIVI.filter((s) => !q || s.soru.toLocaleLowerCase("tr").includes(q) || s.cevap.toLocaleLowerCase("tr").includes(q)), [q]);
  const filtreliSureler = useMemo(() => SURE_BİLGİLERİ.filter((s) => !q || s.ad.toLocaleLowerCase("tr").includes(q)), [q]);
  const filtreliDuaRehber = useMemo(() => DUA_REHBERİ.filter((d) => !q || d.durum.toLocaleLowerCase("tr").includes(q)), [q]);
  // ★ SESLİ DUA TAKİBİ (madde 58) — okundu işaretleri refresh için
  const [duaOkunduTick, setDuaOkunduTick] = useState(0);

  if (!open) return null;

  return (
    <Modal title="Keşfet" sub="Hadis bankası, kıssalar, kelime kartları, namaz rehberi ve daha fazlası — sahih kaynaklarla" onClose={onClose} wide>
      {/* Sekmeler */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SEKMELER.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setSekme(s.id); setArama(""); setKartCevrildi(null); if (s.id === "kitaplik") setKitaplikVeri(kitaplikOku()); }}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${sekme === s.id ? "text-black shadow-md" : "glass-soft text-white/55 hover:text-white"}`}
            style={sekme === s.id ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Arama (kelime kartları hariç — kendi akışı var) */}
      {sekme !== "kelime" && (
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Ara…" className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30" />
        </div>
      )}

      {/* ── 18: HADİS BANKASI ── */}
      {sekme === "hadis" && (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {HADIS_TEMALARI.map((t) => (
              <button key={t.id} type="button" onClick={() => setHadisTema(t.id)}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hadisTema === t.id ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={hadisTema === t.id ? { background: "linear-gradient(135deg,#6ee7b7,#10b981)" } : undefined}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtreliHadisler.map((h, i) => {
              const dr = h.derece ? HADIS_DERECE_ETIKETI[h.derece] : null;
              return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                <p className="text-[11px] leading-relaxed text-white/85">"{h.metin}"</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <p className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>— {h.kaynak}</p>
                  {dr && (
                    <span
                      title={dr.aciklama}
                      className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${
                        h.derece === "sahih" ? "bg-emerald-500/20 text-emerald-300" :
                        h.derece === "hasan" ? "bg-sky-500/20 text-sky-300" :
                        "bg-amber-500/20 text-amber-300"}`}
                    >
                      {dr.label}
                    </span>
                  )}
                </div>
              </div>
              );
            })}
            {filtreliHadisler.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-[11px] text-white/40">Yerel bankada bulunamadı — külliyatta aranıyor…</p>
                {kuliyatYukleniyor && <p className="mt-2 text-[10px] text-white/30">📚 Buhârî + Müslim taranıyor</p>}
                {!kuliyatYukleniyor && kuliyatSonuc.length > 0 && (
                  <p className="mt-1 text-[9.5px] text-emerald-300">✓ {kuliyatSonuc.length} hadis bulundu — aşağıda</p>
                )}
                {!kuliyatYukleniyor && kuliyatSonuc.length === 0 && (
                  <p className="mt-1 text-[9.5px] text-white/30">Külliyatta da bulunamadı — farklı bir kelime dene</p>
                )}
              </div>
            )}
            {/* ★ KÜLLİYAT SONUÇLARI — Buhârî/Müslim'den gelen hadisler (derece etiketiyle) */}
            {kuliyatSonuc.map((h, i) => (
              <div key={`k-${i}`} className="rounded-xl border border-amber-400/20 bg-amber-500/[.04] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[10.5px] leading-relaxed ${h.dil === "ar" ? "text-right font-arabic text-[13px]" : "text-white/80"}`} dir={h.dil === "ar" ? "rtl" : undefined}>
                    {h.metin}
                  </p>
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[8px] font-black text-emerald-300">
                    {h.derece === "sahih" ? "Sahih" : h.derece === "hasan" ? "Hasan" : h.derece === "zayif" ? "Zayıf" : "Külliyat"}
                  </span>
                </div>
                <p className="mt-1.5 text-[8.5px] text-white/40">— {h.kaynak}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 19: KISSA KÖŞESİ ── */}
      {sekme === "kissa" && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtreliKissalar.map((k) => (
            <div key={k.ad} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{k.sure}</p>
              <h4 className="mt-0.5 text-[12px] font-black text-white/90">{k.ad}</h4>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/60">{k.ozet}</p>
              <p className="mt-2 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[9.5px] leading-relaxed text-emerald-200">💡 {k.ders}</p>
              {/* ★ KISSANIN DUASI (28.09) — kıssanın sonunda, kıssanın ruhuyla ilgili okunacak dua */}
              <p className="mt-2 rounded-lg px-2.5 py-1.5 text-[9.5px] leading-relaxed" style={{ background: "rgba(215,170,82,.08)", color: "var(--accent-2)" }}>
                <span className="font-black">🤲 Bu kıssanın duası:</span> {k.dua}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── 20: SORU-CEVAP ── */}
      {sekme === "soru" && (
        <div className="space-y-2">
          {/* ★ İSLAM'IN 5 ŞARTI — MEZHEPLERE GÖRE FIKHİ SORU-CEVAP (28.09, kullanıcı kararı) */}
          <p className="mt-1 mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">🕌 İslam'ın 5 Şartı — mezheplere göre fıkhi soru-cevap</p>
          {BES_SART_SORULARI.filter((b) => !q || b.soru.toLocaleLowerCase("tr").includes(q) || b.cevaplar.some((c) => c.metin.toLocaleLowerCase("tr").includes(q)) || b.sart.toLocaleLowerCase("tr").includes(q)).map((b, bi) => (
            <div key={`bs-${bi}`} className="rounded-xl border border-emerald-400/20 bg-emerald-500/[.04] p-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black text-emerald-300">{b.sart}</span>
                <p className="text-[11.5px] font-black text-white/90">❓ {b.soru}</p>
              </div>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {b.cevaplar.map((c) => (
                  <div key={c.mezhep} className="rounded-lg border border-white/10 bg-white/[.03] p-2.5">
                    <p className="text-[9px] font-black" style={{ color: "var(--accent-2)" }}>{c.mezhep}</p>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/65">{c.metin}</p>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {b.kaynak}</p>
            </div>
          ))}
          <p className="mt-3 rounded-xl bg-white/[.04] px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-white/45">Genel soru-cevap arşivi</p>
          {filtreliSorular.map((s, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
              <p className="text-[11.5px] font-black text-white/90">❓ {s.soru}</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/65">{s.cevap}</p>
              <p className="mt-1.5 text-[8.5px] text-white/40">📌 Kaynak: {s.kaynak} · Kesin hüküm için Diyanet İşleri Başkanlığı'na danışın</p>
            </div>
          ))}
          <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[9px] text-amber-200/80">⚠️ Buradaki cevaplar genel bilgi amaçlıdır — kendi fetvamızı vermeyiz, Diyanet'e yönlendiririz.</p>
        </div>
      )}

      {/* ── 21: KELİME KARTLARI (flashcard) ── */}
      {sekme === "kelime" && (
        <>
          <p className="mb-3 text-center text-[9px] text-white/40">Karta tıkla — anlamını gör · 🔊 ile okunuşu dinle. Kur'an'da en sık geçen kelimeler 🔤</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {KELIME_KARTLARI.map((k, i) => (
              <div key={i} className="relative">
                <button type="button" onClick={() => setKartCevrildi(kartCevrildi === i ? null : i)}
                  className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-1.5 text-center transition ${kartCevrildi === i ? "border-[color:var(--accent)] bg-amber-500/10" : "border-white/10 bg-white/[.03] hover:border-white/25"}`}>
                  {kartCevrildi === i ? (
                    <>
                      <p className="text-[10.5px] font-black leading-tight text-amber-200">{k.tr}</p>
                      <p className="mt-0.5 px-1 text-[7px] leading-tight text-white/40">{k.ornek.slice(0, 26)}</p>
                    </>
                  ) : (
                    <p className="font-arabic text-lg text-white/90">{k.ar}</p>
                  )}
                </button>
                {/* ★ OKUNUŞ SESİ (28.09, kullanıcı kararı): tarayıcı TTS ile Arapça okunuş —
                    latin okunuş öncelikli okunur; cihaz Arapça sesi yoksa latin metin okunur */}
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); kelimeOku(k); }}
                  title={`Okunuşu dinle: ${k.okunus}`}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] shadow-md ring-1 ring-white/20 transition hover:scale-110 hover:bg-black/90"
                >🔊</button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[8px] text-white/25">Kart 1: {KELIME_KARTLARI.length} kelime · V2'de 80 karta çıkacak</p>
        </>
      )}

      {/* ── 22: SURE BİLGİLERİ ── */}
      {sekme === "sure" && (
        <div className="space-y-2">
          {filtreliSureler.map((s) => (
            <div key={s.n} className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{s.n}</span>
                <h4 className="text-[12px] font-black text-white/90">Sure {s.ad}</h4>
                <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[8.5px] font-bold text-white/50">{s.inis}'de inmiştir</span>
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/60"><b className="text-white/80">Konu:</b> {s.konu}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-emerald-200/80"><b>Fazilet:</b> {s.fazilet}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 28: NAMAZ ÖĞRETİCİ ── */}
      {sekme === "namaz" && (
        <div className="space-y-1.5">
          {NAMAZ_REHBERİ.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[.03] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-black text-white/90">{a.adim}</p>
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-white/60">{a.yazi}</p>
                {a.arapca && <p className="mt-1 text-right font-arabic text-[13px] leading-relaxed" style={{ color: "var(--accent-2)" }}>{a.arapca}</p>}
              </div>
            </div>
          ))}
          <p className="pt-1 text-center text-[8px] text-white/25">Vakit namazlarında rekat sayıları: Sabah 2 farz · Öğle 4 · İkindi 4 · Akşam 3 · Yatsı 4</p>
        </div>
      )}

      {/* ── 35: BEBEK DUASI — KALDIRILDI (kullanıcı kararı 28.09: doğum köşesi sitede olmayacak) ── */}

      {/* ── 61: DUA REHBERİ ── */}
      {sekme === "dua" && (
        <div className="space-y-1.5">
          {/* ★ SESLİ DUA TAKİBİ (madde 58) — 🔊 dinle (tarayıcı TTS) + ✓ okundu */}
          {/* ★ SES SEÇİMİ (28.09): kaliteli kadın/erkek sesi tercihi — cihazdaki Türkçe sesler
              arasından en iyisi otomatik seçilir (Emel/Filiz/Yelda/Google = kadın; Tolga = erkek) */}
          <DuaSesSecici notify={notify} />
          <p className="text-center text-[9px] text-white/40">Duruma göre dualar — 🔊 ile dinleyerek oku, ✓ ile işaretle (takibin cihazında kalır)</p>
          {filtreliDuaRehber.map((d, i) => {
            const anahtar = `nur_dua_okundu_${i}`;
            const okundu = (() => { try { return localStorage.getItem(anahtar) === "1"; } catch { return false; } })();
            const dinle = async () => {
              try {
                if (!("speechSynthesis" in window)) { notify?.("Tarayıcın sesli okumayı desteklemiyor"); return; }
                window.speechSynthesis.cancel();
                const utt = new SpeechSynthesisUtterance(d.dua);
                utt.lang = "tr-TR"; utt.rate = 0.92; utt.pitch = 1.0;
                // ★ KALİTELİ SES SEÇİMİ — async ses listesi bekle + kadın/erkek tercihi
                const tercih = duaSesTercihiOku();
                const ses = await enIyiTurkceSes(tercih);
                if (ses) utt.voice = ses;
                window.speechSynthesis.speak(utt);
              } catch { notify?.("Sesli okuma başlatılamadı"); }
            };
            const isaretle = () => {
              try {
                if (okundu) localStorage.removeItem(anahtar);
                else localStorage.setItem(anahtar, "1");
                setDuaOkunduTick((v) => v + 1);
              } catch { /* yoksay */ }
            };
            return (
              <div key={i} className={`rounded-xl border p-3 ${okundu ? "border-emerald-400/30 bg-emerald-500/[.07]" : "border-white/10 bg-white/[.03]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10.5px] font-black text-white/90">🤲 {d.durum}</p>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={dinle} title="Sesli dinle"
                      className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-black text-white/70 transition hover:bg-white/20">🔊</button>
                    <button type="button" onClick={isaretle} title={okundu ? "İşareti kaldır" : "Okundu işaretle"}
                      className={`rounded-lg px-2 py-1 text-[9px] font-black transition ${okundu ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/50 hover:bg-white/20"}`}>✓</button>
                  </div>
                </div>
                <p className="mt-1 text-[10.5px] italic leading-relaxed" style={{ color: "var(--accent-2)" }}>{d.dua}</p>
                <p className="mt-1 text-[8.5px] text-white/40">— {d.kaynak}{okundu ? " · ✓ okundu" : ""}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 41: HOCA KARŞILAŞTIRMA ── */}
      {sekme === "hoca" && (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">Aynı ayeti farklı hocalardan dinle — "bu kelimeyi kim nasıl okuyor" 🎧</p>
          <div className="flex flex-wrap gap-1.5">
            {HOCA_KARSILASTIRMA_AYETLER.map((ay, i) => (
              <button key={i} type="button" onClick={() => { setHocaAyet(i); setHocaCaliyor(false); hocaAudioRef.current?.pause(); }}
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold transition ${hocaAyet === i ? "text-black" : "glass-soft text-white/55 hover:text-white"}`}
                style={hocaAyet === i ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" } : undefined}>
                {ay.sureAdi} {ay.ayet}
              </button>
            ))}
          </div>
          {(() => { const ay = HOCA_KARSILASTIRMA_AYETLER[hocaAyet]; return (
            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>{ay.etiket}</p>
              <p className="mt-0.5 text-[11px] font-bold text-white/85">{ay.sureAdi} Suresi · {ay.ayet}. Ayet</p>
              <div className="mt-2.5 grid max-h-[320px] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {KARILER.map((k, i) => (
                  <button key={k.id} type="button" onClick={() => hocaCaliyor && hocaIdx === i ? hocaDurdur() : hocaCal(i)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] font-bold transition ${hocaIdx === i && hocaCaliyor ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40" : "bg-white/5 text-white/65 hover:bg-white/10"}`}>
                    <span className="text-sm">{hocaIdx === i && hocaCaliyor ? "⏸" : "▶"}</span>
                    <span className="flex-1 truncate">{k.ad}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[8px] text-white/25">Ses kaynağı: everyayah.com · ayet bazlı kayıtlar</p>
            </div>
          ); })()}
        </div>
      )}

      {/* ── 47: CAMİ BULUCU ── */}
      {sekme === "cami" && (
        <div className="space-y-3">
          <p className="text-center text-[9px] text-white/40">Bulunduğun yerin veya aradığın şehrin camilerini haritada gör 📍</p>
          <div className="flex gap-2">
            <input
              value={camiKonum}
              onChange={(e) => setCamiKonum(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && camiKonum.trim()) setCamiAranan(camiKonum.trim()); }}
              placeholder="Şehir/ilçe yaz — örn. İstanbul Fatih..."
              className="glass-soft flex-1 rounded-xl px-3 py-2.5 text-[11px] outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => {
                if (!camiKonum.trim()) {
                  // Konum izni varsa koordinat bazlı ara, yoksa şehir iste
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setCamiAranan(`${pos.coords.latitude},${pos.coords.longitude}`),
                      () => notify?.("⚠️ Konum izni verilmedi — şehir adı yazarak arayabilirsin"),
                      { timeout: 8000 },
                    );
                  } else notify?.("⚠️ Tarayıcın konumu desteklemiyor — şehir adı yaz");
                } else setCamiAranan(camiKonum.trim());
              }}
              className="shrink-0 rounded-xl px-3.5 py-2.5 text-[10px] font-black text-black transition hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Ara
            </button>
          </div>
          {camiAranan && (
            <>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <iframe
                  title="Cami haritası"
                  src={camiHaritaUrl(camiAranan)}
                  className="h-[260px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href={camiListeUrl(camiAranan)} target="_blank" rel="noopener noreferrer" className="block rounded-xl glass-soft py-2.5 text-center text-[10px] font-bold text-white/60 transition hover:text-white">
                📋 Liste görünümünde aç (Google Maps)
              </a>
            </>
          )}
          {!camiAranan && <p className="rounded-xl bg-white/[.03] px-3 py-3 text-center text-[9.5px] leading-relaxed text-white/45">Şehir yazıp Enter'a bas ya da <b className="text-white/70">Ara</b>'ya tıklayıp konum izni ver — yakınınızdaki camiler haritada listelenir.</p>}
        </div>
      )}

      {/* ── 12: KANAL REHBERİ ── */}
      {sekme === "rehber" && (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">Ürettiğin videolarla büyümen için kanal ipuçları 🚀</p>
          {KANAL_REHBERI.map((k, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[7.5px] font-black ${k.kategori === "YouTube" ? "bg-red-500/15 text-red-300" : k.kategori === "Instagram" ? "bg-pink-500/15 text-pink-300" : "bg-white/10 text-white/60"}`}>{k.kategori}</span>
                <h4 className="text-[11px] font-black text-white/90">{k.baslik}</h4>
              </div>
              <p className="mt-1 text-[9.5px] leading-relaxed text-white/60">{k.metin}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 48: TECVİD REHBERİ ── */}
      {sekme === "tecvid" && (
        <div className="space-y-2">
          <p className="mb-1 text-center text-[9px] text-white/40">Tilavetin kuralları — her kural tanım + örnekle 🎓</p>
          {TECVID_KURALLARI.filter((t) => !q || t.baslik.toLocaleLowerCase("tr").includes(q) || t.tanim.toLocaleLowerCase("tr").includes(q)).map((t, i) => {
            const sv = TECVID_SEVIYE_ETIKETI[t.seviye];
            return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[11px] font-black text-white/90">{t.baslik}</h4>
                  <span className={`rounded-full px-1.5 py-0.5 text-[7.5px] font-black ${
                    t.seviye === "temel" ? "bg-emerald-500/20 text-emerald-300" :
                    t.seviye === "orta" ? "bg-sky-500/20 text-sky-300" :
                    "bg-fuchsia-500/20 text-fuchsia-300"
                  }`}>
                    {sv?.label ?? t.seviye}
                  </span>
                </div>
                <p className="mt-1 text-[9.5px] leading-relaxed text-white/65">{t.tanim}</p>
                <p className="mt-1.5 rounded-lg bg-black/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-white/85" dir="rtl">{t.ornek}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 56: KİTAPLIĞIM ── */}
      {sekme === "kitaplik" && (
        <div className="space-y-3">
          {/* İşaretli ayetler */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">🔖 İşaretli Ayetler ({kitaplikVeri.isaretler.length})</p>
            {kitaplikVeri.isaretler.length === 0 ? (
              <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] text-white/40">Henüz işaret yok — Kur'an ekranında sureyi açıp ayetlerin yanındaki 🔖 simgesiyle işaretleyince burada birikir.</p>
            ) : (
              <div className="space-y-1">
                {kitaplikVeri.isaretler.map((k) => {
                  const [s, a] = k.split(":").map(Number);
                  return (
                    <div key={k} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[.02] px-3 py-1.5 text-[10px]">
                      <span className="font-bold text-white/80">{SURAHS[s - 1]?.name ?? s} · {a}. ayet</span>
                      <span className="text-[8.5px] text-white/35">{k}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Notlar (şifreli secureStore'dan okunur — AyetNotlariModal ile aynı kaynak) */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">📝 Notlarım ({kitaplikVeri.notlar.length})</p>
            {kitaplikVeri.notlar.length === 0 ? (
              <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] text-white/40">Not yok — menüden "Ayet Notlarım"a girip ilk notunu yaz.</p>
            ) : (
              <div className="space-y-1">
                {kitaplikVeri.notlar.slice(0, 10).map((n) => {
                  const [s, a] = n.k.split(":").map(Number);
                  return (
                    <div key={n.k} className="rounded-lg border border-white/10 bg-white/[.02] px-3 py-2">
                      <p className="text-[9px] font-black" style={{ color: "var(--accent-2)" }}>{SURAHS[s - 1]?.name ?? s} {n.k}</p>
                      <p className="mt-0.5 line-clamp-2 text-[9.5px] text-white/60">{n.metin}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* İndirilen videolar — IndexedDB'de saklananlar */}
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">🎬 İndirdiğin Videolar</p>
            <p className="rounded-xl bg-white/[.03] px-3 py-2.5 text-center text-[9.5px] leading-relaxed text-white/45">İndirdiğin videolar cihazında (IndexedDB) saklanır — video üretim ekranının sonuç listesinden istediğin zaman tekrar indirebilirsin. Kitaplıkta liste boyutu cihazına göre gösterilir.</p>
          </div>
        </div>
      )}
    </Modal>
  );
};
