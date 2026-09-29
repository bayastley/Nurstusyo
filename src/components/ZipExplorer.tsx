import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, X, Check, AlertCircle,
  Video, Music, ImageIcon, Loader2, FolderUp,
} from "lucide-react";
import { storeMedia, deleteStoredMedia, clearStoredMedia, loadStoredMedia } from "../studio/medyaStore";
import { sha256Hex, medyaOzetKaydet, medyaOzetSil } from "./medyaKutuphaneHelpers";

// ════════════════════════════════════════════════════════
// MEDYA YÜKLEYİCİ (28.09, kullanıcı kararı) — eski ZIP Dosya Gezgini
// KALDIRILDI. Yeni davranış:
//   • SADECE video / resim / ses kabul edilir
//   • Diğer her şey (zip, pdf, kod, exe...) anında REDDEDİLİR
//   • Başarıda "Eklendi ✓ Onaylandı" rozeti ile önizlemede görünür
//   • Dosyalar IndexedDB'ye kaydedilir (cihazdan çıkmaz)
// ════════════════════════════════════════════════════════

export interface MedyaDosya {
  id: string;
  name: string;
  tur: "video" | "resim" | "ses";
  mime: string;
  size: number;
  blobUrl: string;
  eklenmeAt: string;
  /** ★ IndexedDB'de kalıcı mı? (eski oturumdan gelen bellek-içi kayıtlar false) */
  kalici?: boolean;
}

const KABUL: Array<{ tur: MedyaDosya["tur"]; mimeTest: (m: string) => boolean; extTest: (e: string) => boolean; etiket: string }> = [
  { tur: "video", etiket: "Video", mimeTest: (m) => m.startsWith("video/"), extTest: (e) => ["mp4", "webm", "mov", "mkv", "avi"].includes(e) },
  { tur: "resim", etiket: "Resim", mimeTest: (m) => m.startsWith("image/"), extTest: (e) => ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(e) },
  { tur: "ses", etiket: "Ses", mimeTest: (m) => m.startsWith("audio/"), extTest: (e) => ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(e) },
];

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB — uzun videolar için

const turRengi: Record<MedyaDosya["tur"], string> = {
  video: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30",
  resim: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  ses: "bg-amber-500/15 text-amber-300 border-amber-400/30",
};

function TurIkonu({ tur, size = 20 }: { tur: MedyaDosya["tur"]; size?: number }) {
  if (tur === "video") return <Video size={size} className="text-fuchsia-300" />;
  if (tur === "resim") return <ImageIcon size={size} className="text-sky-300" />;
  return <Music size={size} className="text-amber-300" />;
}

function formatBytes(b: number) {
  if (b > 1024 * 1024 * 1024) return `${(b / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

export const ZipExplorer: React.FC<{ onClose: () => void; onArkaPlanYap?: (medyaId: string, secilsinMi?: boolean) => void; onMedyaDegisti?: () => void }> = ({ onClose, onArkaPlanYap, onMedyaDegisti }) => {
  const [dosyalar, setDosyalar] = useState<MedyaDosya[]>(() => {
    try { return JSON.parse(localStorage.getItem("nur_medya_kutuphanesi") || "[]"); } catch { return []; }
  });
  const [redEdilen, setRedEdilen] = useState<Array<{ name: string; neden: string }> | null>(null);
  const [isleniyor, setIsleniyor] = useState(false);
  const [drag, setDrag] = useState(false);
  const [secili, setSecili] = useState<MedyaDosya | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ★ KALICI AÇILIŞ: IndexedDB'deki blob'ları oku, blob URL tazele —
  //   eski oturumdan kalan localStorage-metadata kayıtları da gerçeğe bağlanır.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const rows = await loadStoredMedia();
      if (!alive || !rows.length) return;
      setDosyalar((cur) => {
        const dbIds = new Set(rows.map((r) => r.id));
        // localStorage'da olup IndexedDB'de karşılığı olan kayıtlar blob URL ile tazelenir;
        // IndexedDB'de karşılığı olmayan (çok eski) kayıtlar düşürülür — ölü blob kalmasın.
        const taze = cur.filter((d) => dbIds.has(d.id)).map((d) => {
          const row = rows.find((r) => r.id === d.id)!;
          if (d.blobUrl && d.kalici) return d; // zaten canlı
          return { ...d, blobUrl: URL.createObjectURL(row.blob), kalici: true, size: row.size };
        });
        // IndexedDB'de olup listede görünmeyen (farklı sekmede eklenen) varsa ekle
        const listeIds = new Set(taze.map((d) => d.id));
        const eksik = rows.filter((r) => !listeIds.has(r.id)).map((r) => ({
          id: r.id, name: r.name, tur: r.tur, mime: r.mime, size: r.size,
          blobUrl: URL.createObjectURL(r.blob), eklenmeAt: new Date(r.createdAt).toISOString(), kalici: true,
        }));
        return [...eksik, ...taze].sort((a, b) => (b.eklenmeAt > a.eklenmeAt ? 1 : -1));
      });
    })();
    return () => { alive = false; };
  }, []);

  const kaydet = (liste: MedyaDosya[]) => {
    // blobUrl'ler sayfa yenilenince ölür — metadata'yı sakla, blob'ları yeniden üretmek için
    // yalnızca metadata kalıcı; dosyalar oturum boyunca bellekte kalır.
    try {
      localStorage.setItem("nur_medya_kutuphanesi", JSON.stringify(liste.map(({ blobUrl, ...rest }) => ({ ...rest, blobUrl: "" }))));
    } catch { /* kota dolabilir — sessiz */ }
  };

  const ekle = useCallback(async (files: FileList | File[]) => {
    setIsleniyor(true);
    const redListe: Array<{ name: string; neden: string }> = [];
    const eklenen: MedyaDosya[] = [];
    for (const f of Array.from(files)) {
      const ext = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "";
      const kurallar = KABUL.find((k) => k.mimeTest(f.type) || k.extTest(ext));
      if (!kurallar) {
        redListe.push({ name: f.name, neden: ext ? `.${ext} desteklenmiyor — yalnızca video/resim/ses kabul edilir` : "desteklenmeyen dosya" });
        continue;
      }
      if (f.size > MAX_SIZE) {
        redListe.push({ name: f.name, neden: `çok büyük (${formatBytes(f.size)}) — en fazla 200 MB` });
        continue;
      }
      const yeniKayit: MedyaDosya = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        tur: kurallar.tur,
        mime: f.type || kurallar.tur,
        size: f.size,
        blobUrl: URL.createObjectURL(f),
        eklenmeAt: new Date().toISOString(),
      };
      // ★ INDEXEDDB KALICI KAYIT (28.09): blob'u diske yaz + SHA-256 özetini tut.
      //   Yazılamazsa (gizli mod/kota) dosya yine bu oturumda çalışır ama "kalıcı" işareti konmaz.
      const ozet = await sha256Hex(f);
      const yazildi = await storeMedia({ id: yeniKayit.id, name: f.name, tur: kurallar.tur, mime: yeniKayit.mime, size: f.size, blob: f });
      if (yazildi) { medyaOzetKaydet(yeniKayit.id, ozet); yeniKayit.kalici = true; }
      eklenen.push(yeniKayit);
    }
    if (eklenen.length) {
      const yeni = [...eklenen, ...dosyalar].slice(0, 100);
      setDosyalar(yeni);
      kaydet(yeni);
      setSecili((s) => s ?? eklenen[0]);
      onMedyaDegisti?.(); // ★ galeri (Yüklediklerim) anında tazelensin
    }
    setRedEdilen(redListe.length ? redListe : null);
    setIsleniyor(false);
  }, [dosyalar]);

  const sil = (id: string) => {
    const yeni = dosyalar.filter((d) => d.id !== id);
    setDosyalar(yeni);
    kaydet(yeni);
    if (secili?.id === id) setSecili(null);
    void deleteStoredMedia(id).then(() => onMedyaDegisti?.()); // ★ IndexedDB'den de sil + galeriyi tazele
    medyaOzetSil(id);
  };

  const temizle = () => {
    setDosyalar([]);
    setSecili(null);
    try { localStorage.removeItem("nur_medya_kutuphanesi"); } catch { /* yoksay */ }
    void clearStoredMedia().then(() => onMedyaDegisti?.()); // ★ IndexedDB'yi boşalt + galeriyi tazele
  };

  /** ★ ARKA PLAN YAP: seçili dosyayı stüdyo atmosferine gönder (video/resim; ses hariç) */
  const arkaPlanYap = (d: MedyaDosya) => {
    if (!onArkaPlanYap) return;
    onArkaPlanYap(d.id);
    onClose();
  };

  return (
    <div className="flex h-full flex-col text-[12px]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
            <Upload size={15} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/90">Medya Yükleme</p>
            <p className="text-[10px] text-white/40">Video · Resim · Ses — diğer dosyalar reddedilir</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition">
          <X size={14} />
        </button>
      </div>

      {/* Yükleme alanı */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void ekle(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition
          ${drag ? "scale-[1.01] border-[color:var(--accent)] bg-[color:var(--accent)]/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"}`}
      >
        <input ref={fileRef} type="file" multiple className="hidden"
          onChange={(e) => { if (e.target.files?.length) void ekle(e.target.files); e.currentTarget.value = ""; }} />
        {isleniyor ? (
          <Loader2 size={22} className="animate-spin text-white/60" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15"><Video size={20} className="text-fuchsia-300" /></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15"><ImageIcon size={20} className="text-sky-300" /></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15"><Music size={20} className="text-amber-300" /></span>
          </div>
        )}
        <p className="text-[12px] font-bold text-white">Dosyaları sürükle ya da tıkla — video, resim, ses</p>
        <p className="text-[10px] text-white/40">ZIP, PDF, kod vb. reddedilir · en fazla 200 MB</p>
      </div>

      {/* RED bildirimi */}
      {redEdilen && (
        <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 p-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-black text-red-300"><AlertCircle size={11} /> {redEdilen.length} dosya reddedildi:</p>
          {redEdilen.slice(0, 4).map((r, i) => (
            <p key={i} className="mt-0.5 truncate text-[9.5px] text-red-200/80">✕ {r.name} — {r.neden}</p>
          ))}
        </div>
      )}

      {/* Liste */}
      {dosyalar.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[11px] text-white/30">Henüz dosya yok — yukarıdan ekle</div>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
          {dosyalar.map((d) => (
            <div key={d.id}
              onClick={() => setSecili(d)}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border p-2 transition ${secili?.id === d.id ? "border-[color:var(--accent)] bg-white/[.06]" : "border-white/10 bg-white/[.02] hover:border-white/30"}`}>
              {/* ★ EKLENDİ ✓ ONAYLANDI rozeti — önizlemede görünür; kalıcıysa DB rozeti */}
              <span className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[7.5px] font-black text-black shadow">
                <Check size={8} strokeWidth={4} /> Eklendi
              </span>
              {d.kalici && (
                <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[7px] font-black text-emerald-300 ring-1 ring-emerald-400/40" title="Cihazında kalıcı saklandı — sayfayı yenilesen de kaybolmaz">
                  💾 Kalıcı
                </span>
              )}
              <div className="flex h-16 items-center justify-center overflow-hidden rounded-lg bg-black/40">
                {d.tur === "resim" && d.blobUrl ? <img src={d.blobUrl} alt={d.name} className="h-full w-full object-cover" />
                  : d.tur === "video" && d.blobUrl ? <video src={d.blobUrl} muted className="h-full w-full object-cover" />
                  : <TurIkonu tur={d.tur} size={26} />}
              </div>
              <p className="mt-1 truncate text-[10px] font-bold text-white/85" title={d.name}>{d.name}</p>
              <div className="mt-0.5 flex items-center justify-between gap-1">
                <span className={`rounded border px-1 py-px text-[7.5px] font-black ${turRengi[d.tur]}`}>{d.tur.toUpperCase()}</span>
                <span className="text-[8px] text-white/35">{formatBytes(d.size)}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); sil(d.id); }}
                className="absolute bottom-1.5 right-1.5 hidden rounded-md bg-red-500/80 px-1.5 py-0.5 text-[8px] font-black text-white group-hover:block">Sil</button>
            </div>
          ))}
        </div>
      )}

      {/* Önizleme + onay şeridi */}
      {secili && (
        <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/[.06] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TurIkonu tur={secili.tur} size={14} />
              <span className="truncate text-[10px] font-bold text-white/85">{secili.name}</span>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[8px] font-black text-black">
                <Check size={9} strokeWidth={4} /> Eklendi ✓ Onaylandı
              </span>
            </div>
            <button onClick={() => setSecili(null)} className="shrink-0 text-[9px] font-bold text-white/40 hover:text-white">kapat</button>
          </div>
          <div className="mt-2 flex max-h-40 items-center justify-center overflow-hidden rounded-lg bg-black/50">
            {secili.tur === "resim" && secili.blobUrl && <img src={secili.blobUrl} alt={secili.name} className="max-h-40 rounded-lg object-contain" />}
            {secili.tur === "video" && secili.blobUrl && <video src={secili.blobUrl} controls className="max-h-40 rounded-lg" />}
            {secili.tur === "ses" && secili.blobUrl && <audio src={secili.blobUrl} controls className="w-full p-2" />}
          </div>
          {/* ★ ARKA PLAN YAP (28.09): video/resim dosyasını stüdyo atmosferine gönder */}
          {secili.tur !== "ses" && secili.blobUrl && (
            <button
              type="button"
              onClick={() => arkaPlanYap(secili)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[10.5px] font-black text-black transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              <FolderUp size={13} /> Stüdyoya Arka Plan Yap
            </button>
          )}
        </div>
      )}

      {/* Alt şerit */}
      {dosyalar.length > 0 && (
        <div className="mt-2 flex items-center justify-between text-[9px] text-white/35">
          <span>{dosyalar.length} dosya · {dosyalar.filter((d) => d.tur === "video").length} video · {dosyalar.filter((d) => d.tur === "resim").length} resim · {dosyalar.filter((d) => d.tur === "ses").length} ses · {dosyalar.filter((d) => d.kalici).length} kalıcı 💾</span>
          <button onClick={temizle} className="rounded-md bg-white/5 px-2 py-1 font-bold text-white/50 transition hover:bg-red-500/20 hover:text-red-300">Tümünü temizle</button>
        </div>
      )}
    </div>
  );
};
