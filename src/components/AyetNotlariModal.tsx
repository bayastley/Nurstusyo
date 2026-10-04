// ════════════════════════════════════════════════════════
// AYET NOTLARI — yol haritası madde 57
// "Ayete özel kişisel not alma (özel, şifreli, sunucuya gitmez);
//  tefsir okurken düşüncesini yazanlar için"
// • Notlar secureStore (AES + HMAC + tarayıcı parmak izi) ile şifreli
//   localStorage'da tutulur — hiçbir API'ye gönderilmez.
// • Sure:ayet anahtarıyla saklanır; Keşfet'ten açılır.
// ════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useState } from "react";
import { translate, type Lang } from "../i18n";
import { NotebookPen, Trash2, Search, Lock } from "lucide-react";
import { Modal } from "./UIElements";
import { secureGet, secureSet } from "../secureStore";
import { SURAHS } from "../data/surahs";

const NOT_KEY = "nur_ayet_notlari_v1"; // secureStore ile şifreli

interface NotKaydi {
  /** "2:255" biçiminde ayet anahtarı */
  k: string;
  metin: string;
  ts: number;
}

interface AyetNotlariModalProps {
  /** ★ FULL I18N (01.10): başlık/sub seçili dile döner */
  lang?: Lang;
  open: boolean;
  onClose: () => void;
  notify?: (msg: string) => void;
}

const oku = (): NotKaydi[] => {
  try { return secureGet<NotKaydi[]>(NOT_KEY, []); } catch { return []; }
};
const yaz = (notlar: NotKaydi[]) => {
  try { secureSet(NOT_KEY, notlar); } catch { /* saklama kapalıysa sessiz */ }
};

export const AyetNotlariModal: React.FC<AyetNotlariModalProps> = ({ open, onClose, notify , lang = "tr" }) => {
  // ★ FULL I18N (01.10): prop lang → sözlük; eksik anahtar TR fallback
  const tt = (k: string): string => translate(lang, k);

  const [notlar, setNotlar] = useState<NotKaydi[]>([]);
  const [yeniSure, setYeniSure] = useState(1);
  const [yeniAyet, setYeniAyet] = useState(1);
  const [yeniMetin, setYeniMetin] = useState("");
  const [arama, setArama] = useState("");

  useEffect(() => { if (open) setNotlar(oku()); }, [open]);

  const surahMeta = SURAHS[yeniSure - 1];
  const maxAyet = surahMeta?.count ?? 7;

  const ekle = () => {
    const metin = yeniMetin.trim();
    if (!metin) { notify?.(tt("anNotBos")); return; }
    const k = `${yeniSure}:${yeniAyet}`;
    const yeni: NotKaydi[] = [
      { k, metin, ts: Date.now() },
      ...notlar.filter((n) => n.k !== k), // aynı ayede tek not — güncelleme
    ];
    setNotlar(yeni);
    yaz(yeni);
    setYeniMetin("");
    notify?.(tt("anKaydedildi").replace("{k}", k));
  };

  const sil = (k: string) => {
    const yeni = notlar.filter((n) => n.k !== k);
    setNotlar(yeni);
    yaz(yeni);
  };

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    if (!q) return notlar;
    return notlar.filter((n) => {
      const [s, a] = n.k.split(":").map(Number);
      const ad = SURAHS[s - 1]?.name ?? "";
      return ad.toLocaleLowerCase("tr").includes(q) || n.metin.toLocaleLowerCase("tr").includes(q) || n.k.includes(q);
    });
  }, [notlar, arama]);

  if (!open) return null;

  return (
    <Modal title={tt("v2AyetNotlariTitle")} sub={tt("v2AyetNotlariSub")} onClose={onClose}>
      {/* Gizlilik bandı */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-[9px] font-bold text-emerald-200/80 ring-1 ring-emerald-400/20">
        <Lock size={11} /> {tt("anGizlilik")}
      </div>

      {/* Yeni not */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[.03] p-3.5">
        <p className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--accent-2)" }}>
          <NotebookPen size={11} style={{ color: "var(--accent)" }} /> {tt("anYeniNot")}
        </p>
        <div className="mb-2 flex gap-1.5">
          <select value={yeniSure} onChange={(e) => { const n = Number(e.target.value); setYeniSure(n); setYeniAyet(1); }} className="flex-1 rounded-lg bg-white/5 px-2 py-2 text-[10px] font-bold text-white/80 outline-none">
            {SURAHS.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
          </select>
          <select value={yeniAyet} onChange={(e) => setYeniAyet(Number(e.target.value))} className="w-24 rounded-lg bg-white/5 px-2 py-2 text-[10px] font-bold text-white/80 outline-none">
            {Array.from({ length: maxAyet }, (_, i) => <option key={i + 1} value={i + 1}>{tt("anAyetSecenek").replace("{n}", String(i + 1))}</option>)}
          </select>
        </div>
        <textarea
          value={yeniMetin}
          onChange={(e) => setYeniMetin(e.target.value)}
          rows={3}
          placeholder={tt("anNotPlaceholder")}
          className="mb-2 w-full resize-none rounded-xl bg-white/5 px-3 py-2.5 text-[11px] leading-relaxed text-white outline-none placeholder:text-white/25"
        />
        <button type="button" onClick={ekle} className="w-full rounded-xl py-2.5 text-[10.5px] font-black text-black transition hover:brightness-110 active:scale-[.98]" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
          {tt("anNotuKaydet")}
        </button>
      </div>

      {/* Arama */}
      <div className="relative mb-2.5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder={tt("anAra")} className="glass-soft w-full rounded-xl py-2.5 pl-9 pr-3 text-[11px] outline-none placeholder:text-white/30" />
      </div>

      {/* Not listesi */}
      <div className="space-y-2">
        {filtreli.map((n) => {
          const [s, a] = n.k.split(":").map(Number);
          const ad = SURAHS[s - 1]?.name ?? s;
          return (
            <div key={n.k} className="rounded-xl border border-white/10 bg-white/[.02] p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black" style={{ color: "var(--accent-2)" }}>{ad} {s}:{a}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-white/30">{new Date(n.ts).toLocaleDateString(lang === "ar" ? "ar" : lang === "ur" ? "ur-PK" : lang === "id" ? "id-ID" : lang === "en" ? "en-US" : "tr-TR")}</span>
                  <button type="button" onClick={() => sil(n.k)} className="rounded-md p-1 text-white/30 transition hover:bg-red-500/10 hover:text-red-400" title={tt("anSilTitle")}><Trash2 size={12} /></button>
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[10.5px] leading-relaxed text-white/75">{n.metin}</p>
            </div>
          );
        })}
        {filtreli.length === 0 && (
          <p className="py-6 text-center text-[10.5px] text-white/40">{arama ? tt("anAramaBos") : tt("anBos")}</p>
        )}
      </div>
    </Modal>
  );
};
