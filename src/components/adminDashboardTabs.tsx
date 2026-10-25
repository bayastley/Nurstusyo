// ════════════════════════════════════════════════════════
// ADMIN TAB'LARI — AdminDashboardModal'dan ayrıldı (dosya küçültme, 27.09)
//   • AdminHaftaVideoTab  → Haftanın Videosu onay kuyruğu (madde 17)
//   • AdminHaftalikRaporTab → haftalık rapor + hız testi (madde 25 & 26)
// ★ PANEL CRASH DÜZELTMESİ (28.09): bu dosyada React importu YOKTU —
//   useState/React.useCallback runtime'da "React is not defined" patlatıyordu;
//   Haftanın Videosu + Haftalık Rapor sekmeleri BÜTÜN admin panelini düşürüyordu.
// ════════════════════════════════════════════════════════
import React, { useState } from "react";
// ★ OY LİDERLERİ İSİM EŞLEŞTİRME (09.10): API ham feature_id döner ("kelime-video" gibi)
//   — roadmapVeri'deki V2/V3 tanımlarından başlıkla eşleyip adminin okuyabileceği isim gösteriyoruz.
import { DEFAULT_V2, DEFAULT_V3 } from "./roadmapVeri";

const OZELLIK_ISIMLERI: Record<string, string> = {};
for (const f of [...DEFAULT_V2, ...DEFAULT_V3]) OZELLIK_ISIMLERI[f.id] = f.title;

function ozellikAdi(fid: string): string {
  if (OZELLIK_ISIMLERI[fid]) return OZELLIK_ISIMLERI[fid];
  // legacy/admin özel ID'leri — bilinen takma adlar
  const takma: Record<string, string> = {
    "kelime-video": "Kelime Atölyesi",
    "ai-arkaplan": "AI Arka Plan Üretici",
    "ayet-kutuphanesi": "Ayet & Dua Kütüphanesi",
    "whatsapp-kart": "WhatsApp Ayet Kartı",
    "devam-serisi": "Günlük Devam Serisi",
    "bugun-hediye": "Günlük Sürpriz Hediye",
    "hafizlik-testi": "Hafızlık Testi",
    "referans": "Arkadaşını Davet Et",
    "ucretsiz-deneme": "7 Gün Ücretsiz PRO Denemesi",
  };
  return takma[fid] || fid;
}

// ════════════════════════════════════════════════════════
// ★ HAFTANIN VİDEOSU — admin onay/ret/sil tab'ı (madde 17)
// ════════════════════════════════════════════════════════
export const AdminHaftaVideoTab: React.FC<{ notify: (msg: string) => void }> = ({ notify }) => {
  const [videolar, setVideolar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  const yukle = React.useCallback(async () => {
    setYukleniyor(true);
    try {
      const r = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hafta_video_list" }),
      });
      const d = await r.json().catch(() => null) as any;
      if (d?.ok) setVideolar(d.videolar || []);
      else notify(d?.error || "Liste alınamadı");
    } catch { notify("Sunucuya ulaşılamadı"); }
    finally { setYukleniyor(false); }
  }, [notify]);

  React.useEffect(() => { yukle(); }, [yukle]);

  const islem = async (id: string, aksiyon: "hafta_video_onay" | "hafta_video_sil", durum?: string) => {
    try {
      const r = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: aksiyon, id, durum }),
      });
      const d = await r.json().catch(() => null) as any;
      if (d?.ok) { notify(durum === "onayli" ? "✓ Vitrine eklendi" : durum === "reddedildi" ? "Öneri reddedildi" : "Silindi"); yukle(); }
      else notify(d?.error || "İşlem başarısız");
    } catch { notify("Sunucuya ulaşılamadı"); }
  };

  const durumRozet = (d: string) =>
    d === "onayli" ? "bg-emerald-500/20 text-emerald-300" :
    d === "reddedildi" ? "bg-red-500/20 text-red-300" :
    "bg-amber-500/20 text-amber-300";
  const durumAd = (d: string) => d === "onayli" ? "✓ Onaylı" : d === "reddedildi" ? "Reddedildi" : "⏳ Beklemede";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/[0.08] p-4">
        <p className="text-[11px] font-black text-fuchsia-200">🎬 Haftanın Videosu — Onay Kuyruğu</p>
        <p className="mt-1 text-[10px] leading-relaxed text-white/55">
          Üyelerin önerdiği videolar (link + başlık). Onayladığın vitrinde herkese görünür; reddettiğin gerekçesiyle kullanıcıya gösterilir. Sunucuda video saklanmaz.
        </p>
      </div>
      <button onClick={yukle} disabled={yukleniyor}
        className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
        {yukleniyor ? "Yükleniyor…" : "↻ Yenile"}
      </button>
      {videolar.length === 0 ? (
        <p className="p-6 text-center text-[10px] text-white/40 italic">Henüz öneri yok.</p>
      ) : (
        <div className="space-y-2">
          {videolar.map((v) => (
            <div key={v.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">{v.baslik}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-black ${durumRozet(v.durum)}`}>{durumAd(v.durum)}</span>
              </div>
              {v.aciklama && <p className="text-white/60">{v.aciklama}</p>}
              <div className="flex flex-wrap items-center gap-2 text-[8.5px] text-white/40">
                <span>👤 {v.user_ad}</span>
                {v.sure_bilgi && <span>📖 {v.sure_bilgi}</span>}
                <span>❤️ {v.begeni}</span>
                <span>{new Date(v.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
              <a href={v.video_link} target="_blank" rel="noopener noreferrer" className="inline-block truncate text-[9.5px] text-sky-300 underline decoration-sky-300/30">{v.video_link}</a>
              <div className="flex gap-2 pt-1">
                {v.durum !== "onayli" && (
                  <button onClick={() => islem(v.id, "hafta_video_onay", "onayli")} className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[9px] font-black text-emerald-300 hover:bg-emerald-500/30">✓ Onayla</button>
                )}
                {v.durum !== "reddedildi" && (
                  <button onClick={() => islem(v.id, "hafta_video_onay", "reddedildi")} className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[9px] font-black text-amber-300 hover:bg-amber-500/30">✕ Reddet</button>
                )}
                <button onClick={() => islem(v.id, "hafta_video_sil")} className="rounded-lg bg-red-500/15 px-2.5 py-1 text-[9px] font-black text-red-300 hover:bg-red-500/25">🗑 Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// ★ HAFTALIK RAPOR — 7 günlük özet (madde 25)
// ════════════════════════════════════════════════════════
export const AdminHaftalikRaporTab: React.FC<{ notify: (msg: string) => void }> = ({ notify }) => {
  const [rapor, setRapor] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const yukle = React.useCallback(async () => {
    setYukleniyor(true);
    try {
      const r = await fetch("/api/admin/action", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "haftalik_rapor" }),
      });
      const d = await r.json().catch(() => null) as any;
      if (d?.ok) setRapor(d.rapor);
      else notify(d?.error || "Rapor alınamadı");
    } catch { notify("Sunucuya ulaşılamadı"); }
    finally { setYukleniyor(false); }
  }, [notify]);

  React.useEffect(() => { yukle(); }, [yukle]);

  const kart = (deger: string | number, etiket: string, renk = "text-white") => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
      <p className={`text-xl font-black ${renk}`}>{deger}</p>
      <p className="mt-0.5 text-[8.5px] font-bold uppercase tracking-widest text-white/40">{etiket}</p>
    </div>
  );

  // ★ İŞ 26 — HIZ TESTİ: cihaz performansı (adminin kendi tarayıcısında)
  const [perf, setPerf] = useState<{ acilisMs: number; girisimler: Record<string, number>; onBellekKb: number } | null>(null);
  React.useEffect(() => {
    try {
      // Sayfa açılış süresi (navigation timing)
      let acilisMs = 0;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) acilisMs = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      // Kaynak yükleme süreleri (en yavaş 5)
      const kaynaklar: Record<string, number> = {};
      for (const r of performance.getEntriesByType("resource") as PerformanceResourceTiming[]) {
        const tur = r.initiatorType || "diger";
        const sure = Math.round(r.duration);
        if (!kaynaklar[tur] || kaynaklar[tur] < sure) kaynaklar[tur] = sure;
      }
      let onBellekKb = 0;
      // performance.storage bazı tarayıcı tiplerinde tanımlı değil — güvenli erişim
      const perfStorage = (performance as unknown as { storage?: { estimate?: () => Promise<{ usage?: number }> } }).storage;
      if (perfStorage?.estimate) {
        perfStorage.estimate().then((e) => setPerf({ acilisMs, girisimler: kaynaklar, onBellekKb: Math.round((e.usage ?? 0) / 1024) })).catch(() => setPerf({ acilisMs, girisimler: kaynaklar, onBellekKb: 0 }));
      } else setPerf({ acilisMs, girisimler: kaynaklar, onBellekKb: 0 });
    } catch { setPerf(null); }
  }, []);

  return (
    <div className="space-y-3">
      {/* ★ 26: HIZ TESTİ — bu cihazın durumu (yalnız adminin tarayıcısı) */}
      <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.07] p-3.5">
        <p className="text-[10px] font-black text-sky-200">⚡ Hız Testi — bu cihazın performansı</p>
        {!perf ? (
          <p className="mt-1 text-[9px] text-white/40">Ölçülüyor… (yenile)</p>
        ) : (
          <div className="mt-2 grid grid-cols-4 gap-1.5 text-center">
            <div className="rounded-lg bg-white/5 py-1.5">
              <p className={`text-[12px] font-black ${perf.acilisMs < 1500 ? "text-emerald-300" : perf.acilisMs < 3000 ? "text-amber-300" : "text-red-300"}`}>{perf.acilisMs}ms</p>
              <p className="text-[7px] font-bold uppercase tracking-wider text-white/40">Açılış</p>
            </div>
            {Object.entries(perf.girisimler).slice(0, 3).map(([tur, sure]) => (
              <div key={tur} className="rounded-lg bg-white/5 py-1.5">
                <p className="text-[12px] font-black text-white/75">{sure}ms</p>
                <p className="text-[7px] font-bold uppercase tracking-wider text-white/40">{tur}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-[8px] leading-relaxed text-white/35">
          Yalnızca senin tarayıcın — kullanıcı verisi DEĞİL. Açılış 1500ms altı = hızlı, üstü = CDN/internet yavaş demektir. Önbellek: {perf ? Math.round(perf.onBellekKb / 1024) : "—"} MB
        </p>
      </div>

      <div className="rounded-2xl border border-teal-500/30 bg-teal-500/[0.08] p-4">
        <p className="text-[11px] font-black text-teal-200">📊 Haftalık Rapor — son 7 gün</p>
        <p className="mt-1 text-[10px] text-white/55">Kullanıcı, gelir, trafik ve topluluk özeti. Lider özellikler = oylama birincileri.</p>
      </div>
      <button onClick={yukle} disabled={yukleniyor}
        className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
        {yukleniyor ? "Yükleniyor…" : "↻ Yenile"}
      </button>
      {!rapor ? (
        <p className="p-6 text-center text-[10px] text-white/40 italic">{yukleniyor ? "Hesaplanıyor…" : "Rapor yüklenemedi."}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {kart(rapor.kullanicilar?.yeniKayit ?? "—", "Yeni üye", "text-emerald-300")}
            {kart(rapor.kullanicilar?.aktif7gun ?? "—", "Aktif üye", "text-sky-300")}
            {kart(rapor.trafik?.sayfaGoruntuleme ?? "—", "Sayfa görüntüleme", "text-amber-300")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {kart(rapor.gelir?.odemeAdedi ?? "—", "Ödeme")}
            {kart(rapor.gelir?.ciroOkunur ?? "—", "Ciro", "text-emerald-300")}
            {kart(rapor.kullanicilar?.toplamJeton ?? "—", "Dolaşan jeton")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {kart(rapor.topluluk?.oyToplam ?? "—", "Oylama oyu", "text-fuchsia-300")}
            {kart(rapor.topluluk?.feedbackAdet ?? "—", "Geri bildirim")}
            {kart(rapor.topluluk?.davetSayisi ?? "—", "Davet", "text-teal-300")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {kart(rapor.topluluk?.haftaVideoOneri ?? "—", "Video önerisi")}
            {kart(rapor.topluluk?.haftaVideoOnayli ?? "—", "Onaylı video", "text-fuchsia-300")}
            {kart(Number(rapor.topluluk?.toplamZikir ?? 0).toLocaleString("tr-TR"), "Topluluk zikri", "text-amber-300")}
          </div>
          {Array.isArray(rapor.topluluk?.oyLiderler) && rapor.topluluk.oyLiderler.length > 0 && (
            <div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/[0.07] p-3.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-fuchsia-300">👑 Oylama liderleri (haftalık oy dağılımı)</p>
              <ol className="mt-1.5 space-y-1">
                {rapor.topluluk.oyLiderler.map((l: any, i: number) => (
                  <li key={l.ozellik} className="flex items-center gap-2 text-[10px] text-white/75">
                    <span>{["🥇", "🥈", "🥉", "4.", "5."][i] ?? "·"}</span>
                    <span className="flex-1 truncate font-bold" title={l.ozellik}>{ozellikAdi(l.ozellik)}</span>
                    <span className="font-black tabular-nums text-fuchsia-200">{l.adet} oy</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="text-center text-[8.5px] text-white/30">
            Hata (7g): {rapor.trafik?.hataSayisi ?? 0} · Ortalama puan: {rapor.topluluk?.feedbackPuanOrtalama || "—"} ⭐
          </p>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// ★ 25.10 BÖLÜM KULLANIM ANALİZ TAB'I — sahibin emri: "bütün kullanıcıları
//   test eden, en çok hangi bölüm kullanılıyor gösteren özellik, admin panelde,
//   yüzde kaç hangisi, haftalık güncellenen +50 kayıt saklanan, listede tarih
//   seçtikçe bakılabilen". Veri tamamen sunucu tarafı (nur_bolum_kullanim);
//   istemci sadece görüntüler — normal kullanıcı erişemez.
// ════════════════════════════════════════════════════════

/** ★ 25.10: /api/admin/usage (mod11 API) satırı — AdminKullanimTab + AdminDashboardModal ortak tip */
export type KullanimHafta = { pazar: string; bolumler: Array<{ bolum: string; adet: number; yuzde: number }> };
const BOLUM_ADLARI: Record<string, string> = {
  "video-uret": "🎬 Üret (Video Üretim)",
  kesfet: "📖 Keşfet Merkezi",
  atmos: "🎨 Atmosfer Kataloğu",
  themes: "🖼️ Tema Galeri",
  prayer: "🕌 Namaz Rehberi",
  history: "📜 Namaz Duaları",
  guide: "🧭 İslam Rehberi",
  stories: "📚 Kıssalar",
  library: "📚 Kütüphane",
  quranLearn: "📗 Kuran Öğret",
  quranListen: "🎧 Kuran Dinle",
  ayetKartlari: "🌙 Ayet Kartları",
  ayetPaketleri: "📦 Ayet Paketleri",
  hafizlikTesti: "🧠 Hafızlık Testi",
  kelimeAtolyesi: "🔤 Kelime Atölyesi",
  ayetNotlari: "📝 Ayet Notlarım",
  arkaPlanUretici: "🌌 Arka Plan Üretici",
  ramazan: "🌙 Ramazan Özel",
  ozelGunTakvimi: "📅 Özel Gün Takvimi",
  davet: "🤝 Arkadaşını Davet Et",
  haftaninVideosu: "👑 Haftanın Videosu",
  kendiSes: "🎙️ Kendi sesinle üret",
  seslendirme: "🔊 Seslendirme",
  zip: "📦 Zip Load",
  login: "🔐 Giriş / Üyelik",
  siteHakkinda: "ℹ️ Site Hakkında",
  adminDashboard: "🛠 Admin Panel",
};

function bolumAdi(id: string): string { return BOLUM_ADLARI[id] || id; }

function haftaEtiketi(iso: string): string {
  const bas = new Date(`${iso}T00:00:00Z`);
  const son = new Date(`${iso}T00:00:00Z`);
  son.setUTCDate(son.getUTCDate() + 6);
  const fmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", timeZone: "UTC" });
  return `${fmt.format(bas)} – ${fmt.format(son)}`;
}

export const AdminKullanimTab: React.FC<{
  rows: KullanimHafta[];
  seciliHafta: string | null;
  setSeciliHafta: (v: string | null) => void;
  onYenile: () => void;
  notify: (msg: string) => void;
}> = ({ rows, seciliHafta, setSeciliHafta, onYenile }) => {
  const secili = rows.find((r) => r.pazar === seciliHafta) ?? rows[0] ?? null;
  const toplam = secili ? secili.bolumler.reduce((s, b) => s + b.adet, 0) : 0;
  const tr = new Intl.NumberFormat("tr-TR");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.08] p-4">
        <p className="text-[12px] font-black text-sky-200">📈 Bölüm Kullanım Analizi</p>
        <p className="mt-1 text-[10px] text-white/55">
          {secili ? `${haftaEtiketi(secili.pazar)} haftasında toplam ${tr.format(toplam)} bölüm açılışı kaydedildi.` : "Henüz kayıt yok — kullanıcılar siteyi kullandıkça haftalık satırlar burada birikir."}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="p-6 text-center text-[10px] text-white/40 italic">Henüz haftalık kayıt oluşmamış. Kullanıcılar bölümleri açtıkça satırlar burada birikir; her hafta ayrı bir tarih etiketiyle listelenir.</p>
      ) : (
        <>
          {/* Hafta seçici — tarihe göre tıkla */}
          <div className="flex flex-wrap gap-1.5">
            {rows.map((h) => (
              <button key={h.pazar}
                onClick={() => setSeciliHafta(h.pazar)}
                className={`rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold transition ${h.pazar === seciliHafta ? "bg-sky-400/90 text-black" : "bg-white/10 text-white/65 hover:bg-white/20"}`}
                title={`${haftaEtiketi(h.pazar)} — ${tr.format(h.bolumler.reduce((s, b) => s + b.adet, 0))} açılış`}>
                {haftaEtiketi(h.pazar)}
              </button>
            ))}
          </div>

          {secili && secili.bolumler.length > 0 ? (
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-3.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Haftalık dağılım — {haftaEtiketi(secili.pazar)}</p>
              <div className="mt-2.5 space-y-2">
                {secili.bolumler.map((b, i) => (
                  <div key={b.bolum}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white/80">{i + 1}. {bolumAdi(b.bolum)}</span>
                      <span className="font-black tabular-nums text-sky-200">{tr.format(b.adet)} · %{b.yuzde.toFixed(1).replace(".", ",")}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(b.yuzde, 2)}%`, background: i === 0 ? "linear-gradient(90deg,#7dd3fc,#0284c7)" : "linear-gradient(90deg,#a5b4fc,#6366f1)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="p-6 text-center text-[10px] text-white/40 italic">Seçilen haftada kayıt yok.</p>
          )}

          <p className="text-[8.5px] text-white/30">
            Veriler sunucuda haftalık satırlar (tablo başına en fazla 50 hafta) olarak saklanır. Rapor yalnızca senin admin oturumunla okunabilir.
          </p>
        </>
      )}

      <button onClick={onYenile}
        className="w-full rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
        ↻ Yenile
      </button>
    </div>
  );
};
