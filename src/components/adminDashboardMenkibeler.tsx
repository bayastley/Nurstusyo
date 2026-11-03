// ════════════════════════════════════════════════════════════════════
// ADMINDASHBOARDMENKIBELER.TSX (02.11, kullanıcı emri: admin panele
// "Ekle / Yayınla" butonu bağlı olsun, eklediği kıssa tüm kullanıcılara
// gitsin, 5 dile otomatik çevirsin)
//   · TR metni yaz → "5 dile Çevir" → en/ar/id/ur üretimi (GPT-4o-mini)
//   · "Yayınla" → Supabase nur_kissalar tablosuna eklenir
//   · Kesfet ekranındaki İslâmi Menkıbeler bölümü /api/kissalar ucuyla
//     herkesin ekranında gösterir; "Çıkar" ile listeden düşer.
//   · Supabase tablosu kurulu değilse ekran NUR-KISSALAR-SQL.sql'i hatırlatır.
// ════════════════════════════════════════════════════════════════════
import React from "react";
import { BookOpen, Languages, Rocket, Trash2, RefreshCw, LoaderCircle, AlertTriangle } from "lucide-react";
import { safeFetch } from "../utils/safeFetch";

const KATEGORILER = [
  "Nebiler",
  "Ashab",
  "Hanımlar",
  "Yöneticiler & Adalet",
  "İslâm Alimleri",
  "Sâlihler",
  "Sabır",
] as const;

type Dil = "en" | "ar" | "id" | "ur";
type DilMetin = { baslik: string; hikaye: string; hikmet: string };
type Ceviri = Partial<Record<Dil, DilMetin | null>>;

type KissaSatir = {
  id: string;
  kategori: string;
  baslik: string;
  hikaye?: string;
  hikmet?: string;
  kaynak?: string;
  created_by?: string;
};

interface Props {
  notify?: (mesaj: string) => void;
}

export const MenkibelerYonetimTab: React.FC<Props> = ({ notify }) => {
  const [kategori, setKategori] = React.useState<string>(KATEGORILER[0]);
  const [baslik, setBaslik] = React.useState("");
  const [hikaye, setHikaye] = React.useState("");
  const [hikmet, setHikmet] = React.useState("");
  const [kaynak, setKaynak] = React.useState("");

  const [ceviri, setCeviri] = React.useState<Ceviri | null>(null);
  const [ceviriliyor, setCeviriliyor] = React.useState(false);
  const [yayinlaniyor, setYayinlaniyor] = React.useState(false);
  const [liste, setListe] = React.useState<KissaSatir[]>([]);
  const [listeyuklaniyor, setListeYuklaniyor] = React.useState(true);
  const [akil, setAkil] = React.useState<string>("");

  const bildir = React.useCallback((mesaj: string) => {
    setAkil(mesaj);
    notify?.(mesaj);
    window.setTimeout(() => setAkil((s) => (s === mesaj ? "" : s)), 5000);
  }, [notify]);

  const listeyiYukle = React.useCallback(async () => {
    setListeYuklaniyor(true);
    const r = await safeFetch<{ ok: boolean; kissalar: KissaSatir[] }>("/api/kissalar", { timeoutMs: 12000 });
    if (r.ok && r.data?.kissalar) setListe(r.data.kissalar);
    else bildir("Kıssa listesi yüklenemedi.");
    setListeYuklaniyor(false);
  }, [bildir]);

  React.useEffect(() => { void listeyiYukle(); }, [listeyiYukle]);

  const ceviriYap = async () => {
    if (!hikaye.trim() || !hikmet.trim()) { bildir("Hikâye ve hikmet dolu olmalı; önce TR metni yaz."); return; }
    setCeviriliyor(true);
    const r = await safeFetch<{ ok: boolean; ceviri: Record<Dil, DilMetin>; error?: string }>("/api/ai/kissa-cevir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baslik: baslik.trim(), hikaye: hikaye.trim(), hikmet: hikmet.trim() }),
      timeoutMs: 90000,
      retries: 0,
    });
    setCeviriliyor(false);
    if (!r.ok || !r.data?.ok) {
      bildir(r.ok ? (r.data.error || "Çeviri başarısız.") : (r.error || "Çeviri ucu erişilemedi."));
      return;
    }
    const temiz: Ceviri = {};
    for (const dil of ["en", "ar", "id", "ur"] as Dil[]) {
      const o = r.data.ceviri?.[dil];
      temiz[dil] = { baslik: o?.baslik || baslik, hikaye: o?.hikaye || hikaye, hikmet: o?.hikmet || hikmet };
    }
    setCeviri(temiz);
    bildir("5 dile çevrildi — Türkçe dahil metinler hazır. Şimdi Yayınla'ya bas.");
  };

  const yayinla = async () => {
    if (!baslik.trim() || !hikaye.trim() || !hikmet.trim()) { bildir("Başlık, hikâye ve hikmet dolu olmalı."); return; }
    if (!ceviri || !("en" in ceviri)) { bildir("Önce '5 dile Çevir'e bas; yayın şartı — çevirili kıssa herkes için okunaklı olsun."); return; }
    setYayinlaniyor(true);
    const r = await safeFetch<{ ok: boolean; id?: string; error?: string; detay?: string }>("/api/kissalar/ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ekle", kategori, baslik: baslik.trim(), hikaye: hikaye.trim(), hikmet: hikmet.trim(), kaynak: kaynak.trim(), ceviri }),
      timeoutMs: 20000,
      retries: 0,
    });
    setYayinlaniyor(false);
    if (!r.ok || !r.data?.ok) {
      const hat = r.ok ? (r.data.error || "Yayın başarısız.") : (r.error || "Yayın ucu erişilemedi.");
      const detay = r.ok ? r.data.detay || "" : "";
      const supabaseEksik = (detay.includes("404") || hat.includes("Supabase")) && !liste.length;
      bildir(supabaseEksik
        ? "Supabase'e yazılamadı — önce NUR-KISSALAR-SQL.sql'i Supabase SQL Editor'de 1 kez çalıştır, sonra tekrar Yayınla."
        : `Yayın başarısız: ${hat}${detay ? ` — ${detay}` : ""}`);
      return;
    }
    bildir(`Kıssa yayınlandı (id: ${r.data.id}) — artık tüm kullanıcılar eli menkibeler ekranında görüyor.`);
    setBaslik(""); setHikaye(""); setHikmet(""); setKaynak(""); setCeviri(null);
    await listeyiYukle();
  };

  const cikar = async (id: string) => {
    const r = await safeFetch<{ ok: boolean; error?: string }>("/api/kissalar/ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sil", id }),
      timeoutMs: 15000,
      retries: 0,
    });
    if (!r.ok || !r.data?.ok) { bildir(r.ok ? (r.data.error || "Çıkarma başarısız.") : (r.error || "Sil ucu erişilemedi.")); return; }
    bildir("Kıssa listeden çıkarıldı — herkesin ekranında kayboldu.");
    await listeyiYukle();
  };

  const herYeriTopla = baslik.trim() && hikaye.trim() && hikmet.trim();

  return (
    <div className="space-y-4" data-minitur="admin-menkibeler">
      <div className="rounded-2xl border border-sky-400/30 bg-sky-500/[.07] p-3">
        <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-sky-200">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span><span className="font-black">İslâmi Menkıbeler yönetimi.</span> Türkçe yaz →
            <span className="font-black"> 5 dile Çevir</span> (en/ar/id/ur otomatik) →
            <span className="font-black"> Yayınla.</span> Yayınlanan kıssa tüm kullanıcılara menkibeler ekranında görünür; "Çıkar" ile listeden düşer.
            Supabase tablosu yoksa kök: <code className="font-mono text-[9px]">NUR-KISSALAR-SQL.sql</code> (SQL Editor, 1 kez).</span>
        </p>
      </div>

      {akil && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/[.08] p-2.5 text-[10px] font-bold text-amber-200">
          <AlertTriangle className="mr-1.5 inline h-3 w-3" />
          {akil}
        </div>
      )}

      {/* FORM */}
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 space-y-2.5">
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Kategori</span>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-white outline-none focus:border-sky-400/50"
            >
              {KATEGORILER.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label className="flex-[2]">
            <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Başlık (TR)</span>
            <input
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Hz. …: …"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-white outline-none focus:border-sky-400/50"
            />
          </label>
        </div>
        <label className="block">
          <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Hikâye (TR — paragrafları boş satırla ayır)</span>
          <textarea
            value={hikaye}
            onChange={(e) => setHikaye(e.target.value)}
            rows={6}
            placeholder="Bir gece Hz. …, …"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] leading-relaxed text-white outline-none focus:border-sky-400/50"
          />
        </label>
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Kıssadan hisse (TR)</span>
            <input
              value={hikmet}
              onChange={(e) => setHikmet(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-white outline-none focus:border-sky-400/50"
            />
          </label>
          <label className="flex-1">
            <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Kaynak</span>
            <input
              value={kaynak}
              onChange={(e) => setKaynak(e.target.value)}
              placeholder="İbn Kesir, el-Bidâye"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] text-white outline-none focus:border-sky-400/50"
            />
          </label>
        </div>

        {/* ÇEVİRİ ÖNİZLEME */}
        {ceviri && (
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[.07] p-2 space-y-1.5">
            <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
              <Languages className="h-3 w-3" /> Çeviri önizleme — 4 dil
            </p>
            {(["en", "ar", "id", "ur"] as Dil[]).map((dil) => (
              <p key={dil} className="text-[9.5px] leading-snug text-white/70" dir={dil === "ar" || dil === "ur" ? "rtl" : undefined}>
                <span className="font-black text-emerald-300">{dil.toUpperCase()}: </span>
                {(ceviri[dil]?.hikaye || "").slice(0, 120)}…
              </p>
            ))}
          </div>
        )}

        {/* BUTONLAR */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            data-minitur="admin-menkibeler-cevir"
            onClick={ceviriYap}
            disabled={ceviriliyor || !herYeriTopla}
            className="flex items-center gap-1.5 rounded-full bg-sky-500/90 px-3.5 py-1.5 text-[10px] font-black text-white transition hover:bg-sky-400 disabled:opacity-40"
          >
            {ceviriliyor ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
            {ceviriliyor ? "Çeviriliyor…" : "5 dile Çevir"}
          </button>
          <button
            type="button"
            data-minitur="admin-menkibeler-yayinla"
            onClick={yayinla}
            disabled={yayinlaniyor || !herYeriTopla}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3.5 py-1.5 text-[10px] font-black text-white transition hover:bg-emerald-500 disabled:opacity-40"
          >
            {yayinlaniyor ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            {yayinlaniyor ? "Yayınlanıyor…" : "Ekle / Yayınla"}
          </button>
        </div>
      </div>

      {/* YAYINLI KISSA LİSTESİ */}
      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-white/40">
            <BookOpen className="h-3 w-3" /> Yayında: {listeyuklaniyor ? "…" : liste.length} kıssa
          </p>
          <button
            type="button"
            onClick={() => void listeyiYukle()}
            className="flex items-center gap-1 rounded-full bg-white/[.06] px-2.5 py-1 text-[9px] font-bold text-white/70 hover:bg-white/[.12]"
          >
            <RefreshCw className="h-3 w-3" /> Yenile
          </button>
        </div>
        <div className="space-y-1.5">
          {listeyuklaniyor && <p className="text-[10px] text-white/40">Yükleniyor…</p>}
          {!listeyuklaniyor && liste.length === 0 && (
            <p className="text-[10px] text-white/40">Henüz yayınlı kıssa yok — ilk kıssayı yukarıdan Ekle / Yayınla ile gönder.</p>
          )}
          {liste.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-lg bg-black/30 px-2 py-1.5">
              <span className="truncate text-[10px] text-white/80">
                <span className="font-black text-sky-300">{k.kategori}</span> · {k.baslik}
                {k.created_by ? <span className="ml-1.5 text-[8px] text-white/35">{k.created_by}</span> : null}
              </span>
              <button
                type="button"
                data-minitur={`admin-menkibeler-sil-${k.id}`}
                onClick={() => void cikar(k.id)}
                className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-300 hover:bg-red-500/40"
              >
                <Trash2 className="h-3 w-3" /> Çıkar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
