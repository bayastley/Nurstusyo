import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
// ════════════════════════════════════════════════════════
// ADMINGIZLIFEATURES.TSX — Admin'de GİZLİ özellikler sekmesi (10.10 · 17.10 güncellendi)
// ★ Öncelik-1 GİZLE/BAKIM PLANI: 6 özellik kullanıcıdan "yok gibi" gizli tutulur;
//   admin tek tıkla istediğini free/pro/elit'e açar → kullanıcı ekranında
//   "yeni güncelleme geldi" gibi belirir (duyuru adminSyncService üzerinden).
//
// ★ Not: hiçbir sunucu çağrısı ayrı yapılmaz — /api/roadmap POST { action:
//   "revealFeature" } ve { action: "hideFeature" } iş vardır; feature_locks
//   DB'de güncellenir ve sync sonucu her kullanıcıya otomatik yansır.
// ════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, RotateCcw } from "lucide-react";

interface GizliOzellik {
  id: string;
  title: string;
  desc: string;
  icon: string;
  /** ★ 25.10 KİLİT BAĞI: v2 modül kapısının okuduğu camelCase kimlik (ayetKartlari
   *  vb.). Aç/Gizle çağrısında featureId olarak gönderilir → nur_feature_locks'a
   *  GERÇEK kapının okuduğu satır da yazılır; eski davranışta sadece "adm-..."
   *  roadmap satırı güncelleniyordu ve buton davranış üretmiyordu. */
  modul?: string;
  /** hangi tier'a henüz açılmadı (hidden = admin-gizli; v3 = admin-gizli + V3 etiketi) */
  lock_level: "free" | "pro" | "elit" | "v3" | "hidden";
  hidden_feature?: boolean;
}

interface Props {
  notify: (msg: string) => void;
}

const TIER_ETIKET: Record<GizliOzellik["lock_level"], string> = {
  hidden: "🔒 ADMIN-GİZLİ",
  free: "FREE üyelere açıldı ✅",
  pro: "PRO üyelere açıldı ✅",
  elit: "ELİT üyelere açıldı ✅",
  v3: "🎬 V3 uzun vadeli — admin açabilir",
};

// ★ 17.10 YENİ DON — 22 + 18.10'da 6 Kur'an-ekrani maddesi = 28 gizli madde (kullanıcının
//   verdiği sıra, DEĞİŞMEZ): 1·Ayet & Dua Kütüphanesi 2·Ayet Notlarım 3·Keşfet Hadis/
//   Kıssa/Rehber 4·Haftanın Videosu 5·Kelime Atölyesi 6·AI Arka Plan 7·Paketler
//   8–14·Kur'an ekranı (Kâbe, Sayfalar, Ekransız, Karşılaştırma, Latin, Uyku)
//   15–29·Atmosfer kategorileri · +V3'lü ZIP/KendiSes
const GIZLI_MADDELER: Array<Omit<GizliOzellik, "lock_level">> = [
  // ★ 18.10 (kullanıcı emri): Ayet & Dua Kütüphanesi GİZLİ MADDELER listesine EKLENDİ —
  //   panelde görünür, tek tıkla free/pro/elit'e açılabilir. KODDA ayrıca ADMIN_HARD_KILITLI
  //   (modalsContainerV2.ts) onu admin-godmode haricinde herkese kapalı tutar; bu satır
  //   admin'in kilit YÖNETİMİ'nin görünür yüzü olarak burada durur.
  { id: "adm-ayet-kutuphanesi", title: "Ayet & Dua Kütüphanesi", desc: "616 ayet, 13 mood filtresi, Günün Ayeti ve kart tasarımı.", icon: "📚", modul: "ayetKartlari" },
  // ★ 25.10 KALICI EMİR: Ayet Notlarım herkese ücretsiz — modül bağına rağmen v2KilitliMi
  //   neon ayetNotlari muafiyetiyle AÇIK kalır; admin dahi kapatabilmez.
  { id: "adm-ayet-notlari", title: "Ayet Notlarım", desc: "Seçili ayetlere kendi notunu ekle; manevi arşiv şifreli durur.", icon: "📝", modul: "ayetNotlari" },
  { id: "adm-kesfet-rehber", title: "Keşfet: Hadis · Kıssa · Rehber", desc: "Hadis bankası, kıssalar ve dua rehberi tek Keşfet ekranında.", icon: "❓", modul: "kesfet" },
  { id: "adm-haftanin-videosu", title: "Haftanın Videosu", desc: "En beğenilen üretimler her hafta vitrinde.", icon: "🎬", modul: "haftaninVideosu" },
  { id: "adm-kelime-atolyesi", title: "Kelime Atölyesi", desc: "Tek kelime yaz: ayet önerileri, atmosfer ve video taslağı.", icon: "✍️", modul: "kelimeAtolyesi" },
  { id: "adm-ai-arkaplan", title: "AI Arka Plan Üretici", desc: "Metnin ruhuna uygun arka plan sahnesi üretir.", icon: "✨", modul: "arkaPlanUretici" },
  { id: "adm-ayet-paketleri", title: "Hazır Ayet Paketleri", desc: "Kandil, cuma, sabır — tek tıkla paketlenmiş ayet setleri.", icon: "📦", modul: "ayetPaketleri" },
  // ★ 25.10: Sesli Meal artık RevealFeature bağında — admin free/pro/elit seçimi
  //   UYE_GATE davranışı doğrudan değiştirir (getFeatureLock seviyesinden okulur).
  { id: "adm-seslendirme", title: "Sesli Meal · Seslendirme", desc: "Ayet metnini TTS'le okut, 5 dil + 15 atmosfer.", icon: "🔊", modul: "seslendirme" },
  // ★ 18.10 UZUN VADELİ GÜN (Kur'an ekranı): kodda ÇALIŞAN özellikler — admin-gizli;
  //   revealFeature ile free/pro/elit'e açılınca butonları kullanıcıda belirir.
  { id: "adm-kabe-canli", title: "Kâbe Canlı Yayın", desc: "Mescid-i Haram'dan 7/24 canlı yayın (Kur'an modal üst barında).", icon: "🕋" },
  { id: "adm-kuran-sayfalar", title: "Kur'an Sayfaları · Mushaf", desc: "604 sayfa mushaf görüşü + hatim takibi (Kur'an modal üst barında).", icon: "📖" },
  { id: "adm-ekransiz-dinleme", title: "Ekransız Meal Dinleme", desc: "Ekran karartılır, ses sürer; kilit ekranı kontrolleri (MediaSession).", icon: "🌙" },
  { id: "adm-karsilastirmali-okuma", title: "Karşılaştırmalı Okuma", desc: "İkinci meal yan yana (öğren ekranı düğmesi).", icon: "🔀" },
  { id: "adm-latin-okunus", title: "Latin Okunuş", desc: "Ayet altında latin okunuş (öğren ekranı 'Aa Latin' düğmesi).", icon: "🔤" },
  { id: "adm-uyku-tilavet", title: "Uyku Tilaveti · Zamanlayıcı", desc: "Süre dolunca ses durur (dinle ekranı 'Uyku' düğmesi).", icon: "⏰" },
  // ★ 18.10 V3: Sesli Meal (Seslendirme) — admin-gizli; kod tarafı admin-godmode haricinde kapalı
  { id: "adm-seslendirme", title: "Sesli Meal · Seslendirme", desc: "V3 kilitli · ayet metnini TTS'le okut, 5 dil + 15 atmosfer.", icon: "🔊" },
  // ★ 18.10 UZUN VADELI PLAN (kullanıcı emri — gerçek, henüz yapılmamış özellikler; ilgi çeksin):
  { id: "adm-tajvid-egitimi", title: "Tajvid Eğitimi", desc: "Harflerin makharij'i + kurallar ders/ad/sınav — ÜCRETSİZ öğrenme içeriği.", icon: "🔤" },
  { id: "adm-telaffuz-egitimi", title: "Telaffuz Eğitimi", desc: "Kâri örnek ayet dinle/karlaştır + telaffuz kalibrasyon testi. ÜCRETSİZ.", icon: "🎙️" },
  { id: "adm-haftanin-videosu-v2", title: "Haftanın Videosu V2", desc: "Oylamalı vitrin + topluluk yorumu + otomatik sosyal kart.", icon: "🎬" },
  { id: "adm-hatim-takip-v2", title: "Hatim Takip V2 · Grup", desc: "Aynı hatimi ailenle/arkadaşlarla birlikte yap; grup sayacı.", icon: "🕋" },
  { id: "adm-gece-rehberi", title: "Gece İbadet Rehberi", desc: "Teheccüd/tesbih seansları + uyku tilaveti planlayıcı.", icon: "🌙" },
  // ★ 17.10 (2. tur): ZIP ve Kendi Sesinle Üret V3'e kilitlendi (+ 15 atmosfer)
  { id: "adm-atmos-aurora_borealis_sky", title: "Atmosfer: Kuzey Işıkları", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-black_hole_space", title: "Atmosfer: Kara Delik ve Uzay", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-hellfire_volcano_lava", title: "Atmosfer: Cehennem Ateşi ve Lav", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-paradise_garden_palace", title: "Atmosfer: Cennet Bahçesi ve Saray", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-stormy_sea_boat", title: "Atmosfer: Fırtınalı Deniz ve Gemi", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-lunar_phases_orbit", title: "Atmosfer: Ayın Evreleri ve Yörüngesi", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-meteor_shower_stars", title: "Atmosfer: Meteor Yağmuru", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-gushing_spring_river", title: "Atmosfer: Çağlayan Pınar ve Nehir", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-date_palm_branches", title: "Atmosfer: Hurma Dalları", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-olive_grove_trees", title: "Atmosfer: Zeytinlik Ağaçları", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-honeybee_hive_comb", title: "Atmosfer: Bal Arısı ve Petek", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-pearl_coral_diving", title: "Atmosfer: İnci ve Mercan Dalışı", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-justice_scales_balance", title: "Atmosfer: Adalet Terazisi", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-deep_canyon_passages", title: "Atmosfer: Derin Kanyon Geçitleri", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-atmos-wolf_howling_night", title: "Atmosfer: Gece Uluyan Kurt", desc: "Atmosfer arka plan kategorisi.", icon: "✨" },
  { id: "adm-zip-resim-ses", title: "ZIP Resim / Ses Yükleme", desc: "V3 kilitli · admin düzenlemesinde.", icon: "⬇️" },
  { id: "adm-kendi-ses", title: "Kendi Sesinle Üret", desc: "V3 kilitli · admin düzenlemesinde.", icon: "🎤" },
];

export const AdminGizliFeaturesTab: React.FC<Props> = ({ notify }) => {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [liste, setListe] = useState<GizliOzellik[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ★ Listeyi sistem-config'den değil — nur_roadmap_features GET'ten çekiyoruz;
  //   sadece admin features dönsün (hidden_feature=true olanlar) — şimdilik
  //   FRONTEND konfig yerine roadmap API'den okunması daha doğrudur.
  const yukle = async () => {
    setYukleniyor(true);
    try {
      const response = await fetch("/api/roadmap", { cache: "no-store" });
      const data = await response.json().catch(() => null) as {
        ok?: boolean; v2?: Array<{ id?: string; title?: string; description?: string; icon?: string; hidden_feature?: boolean; target_tier?: string }>;
      } | null;
      if (data?.ok && Array.isArray(data.v2)) {
        const adminMadde = data.v2.filter((f) => f.id?.startsWith("adm-"));
        // Basit tablo: default listeyi DB'den "hidden" state ile birleştir
        const merged = GIZLI_MADDELER.map((def) => {
          const match = adminMadde.find((m) => m.id === def.id);
          return ({
            ...def,
            desc: match?.description ?? def.desc,
            hidden_feature: match?.hidden_feature ?? true,
            lock_level: (match?.target_tier as GizliOzellik["lock_level"]) ?? "hidden",
          });
        });
        setListe(merged);
      } else {
        // API yoksa default state "hidden" göster — admin tıklayınca POST gider
        setListe(GIZLI_MADDELER.map((def) => ({ ...def, lock_level: "hidden" as const, hidden_feature: true })));
      }
    } catch {
      setListe(GIZLI_MADDELER.map((def) => ({ ...def, lock_level: "hidden" as const, hidden_feature: true })));
    } finally {
      setYukleniyor(false);
    }
  };
  useEffect(() => { void yukle(); }, []);

  // ★ Tek tıkla "AÇ": hedef tier seçilip revealFeature çağrılır
  const acF = async (id: string, tier: "free" | "pro" | "elit") => {
    setBusyId(id);
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ★ 25.10 KİLİT BAĞI: v2 modül kapısı camelCase kimlikle kontrol ediyor —
        //   modül bağına eşlenen hesaplar featureId de gönderilerek gerçek kapı
        //   değiştirilir (daha önce sadece "adm-" roadmap satırı güncelleniyordu).
        body: JSON.stringify({ action: "revealFeature", id, tier, featureId: (liste.find((f) => f.id === id)?.modul || "") }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (response.ok && data?.ok) {
        setListe((cur) => cur.map((f) => (f.id === id ? { ...f, lock_level: tier, hidden_feature: false } : f)));
        notify(ttX2610("agAcildi").replace("{a}", String(id)).replace("{b}", String(tier.toUpperCase()))); // 17.10
      } else notify(data?.error || "Açma işlemi başarısız");
    } catch { notify(ttX2610("asSunucu")); }
    finally { setBusyId(null); }
  };

  // ★ Tek tıkla "GİZLE": özelliği tekrar admin-gizliye çek (geri alma)
  const gizleF = async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ★ 25.10 KİLİT BAĞI: gerçek kapı satırını da 'hidden'a çek (ayrıca yazılır).
        body: JSON.stringify({ action: "hideFeature", id, featureId: (liste.find((f) => f.id === id)?.modul || "") }),
      });
      const data = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (response.ok && data?.ok) {
        setListe((cur) => cur.map((f) => (f.id === id ? { ...f, lock_level: "hidden", hidden_feature: true } : f)));
        notify(ttX2610("agGizli").replace("{a}", String(id)));
      } else notify(data?.error || "Gizleme işlemi başarısız");
    } catch { notify(ttX2610("asSunucu")); }
    finally { setBusyId(null); }
  };

  // ★ 23.10 BOŞALTI (sahibin emri): V3 (uzun vadeli) satırlarını DB'den boşalt —
  //   listeyi admin roadmap panelindeki "Ekle" formuyla kendisi doldurur.
  //   V2 oylama satırları ve oylar dokunulmaz.
  const v3Bosalt = async () => {
    setYukleniyor(true);
    try {
      const r = await fetch("/api/roadmap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clearV3" }),
      });
      const d = await r.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (r.ok && d?.ok) {
        notify(ttX2610("abV3Bosaltildi"));
      } else notify(d?.error || "Boşaltma başarısız");
    } catch { notify(ttX2610("asSunucu")); }
    finally { setYukleniyor(false); }
  };

  // ★ Oylama listesini sıfırla + admin maddelerini ekle (tek tık)
  // ★ 23.10 FIX: resetAllFeatures + addAdminFeatures API'de DELETE altındaydı;
  //   POST gönderiliyordu → 400 "Geçersiz özellik" dönüşüp hiç çalışmıyordu.
  const hazirla = async () => {
    setYukleniyor(true);
    try {
      const resetResponse = await fetch("/api/roadmap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetAllFeatures" }),
      });
      const resetData = await resetResponse.json().catch(() => null) as { ok?: boolean } | null;
      if (!resetResponse.ok || !resetData?.ok) { notify(ttX2610("abSifirlamaHata")); return; }
      const addResponse = await fetch("/api/roadmap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addAdminFeatures" }),
      });
      const addData = await addResponse.json().catch(() => null) as { ok?: boolean; added?: number; error?: string } | null;
      if (addResponse.ok && addData?.ok) {
        notify(ttX2610("agOylamaSifir").replace("{a}", String(addData.added ?? 22)));
        await yukle();
      } else notify(addData?.error || "Ekleme başarısız");
    } catch { notify(ttX2610("asSunucu")); }
    finally { setYukleniyor(false); }
  };

  if (yukleniyor && liste.length === 0) {
    return <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center text-[11px] text-white/50">ttX2610("agfYukleniyor")</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4 space-y-3">
        <h4 className="font-display text-sm font-black text-white flex items-center gap-2">
          🎭 Gizli Özellikler — Admin Kontrolü
        </h4>
        <p className="text-[10px] leading-relaxed text-white/60">
          Aşağıdaki 22 özellik (6 ana yenilik + 15 atmosfer kategorisi + 2 V3'lü) kullanıcıların ekranında
          HİÇ yok gibi görünür (menü yok, buton yok); yol haritası oylamasında ise SADECE İSİMLERİ
          oy için görünür. Tek tıkla istediğin tier'a açarsın → kullanıcı ekranında <b>"yeni güncelleme"</b> gibi belirir ve duyuru gider.
          ★ Satın alım kuralı (17.10): admin açtığı üye tier'ına seçer — o seviyeden VIP
            satın alım yapan kullanıcılar özelliği açılmış olarak görür (free'e açılınca herkese, pro/elit'e açılınca
            satın alım yapan üyelere).
        </p>
        <button
          onClick={hazirla}
          disabled={yukleniyor}
          className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-[11px] font-black text-black transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#f5dda6,#d7aa52)" }}
        >
          <RotateCcw size={13} /> Oylama Listesini Sıfırla + 22 Gizli Maddeyi Yerleştir
        </button>
        {/* ★ 23.10 BOŞALTI — V3 uzun vadeli listeyi tek tıkla temizler (sahibin emri:
            "uzun vadelileri boşalt, hiçbir şey yazma, biz dolduralım"). V2 + oylar korunur. */}
        <button
          onClick={v3Bosalt}
          disabled={yukleniyor}
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/15 py-2 text-[10px] font-bold text-white/70 transition hover:bg-white/10 disabled:opacity-50"
        >
          <EyeOff size={12} /> V3 (Uzun Vadeli) Listesini Boşalt — V2 oyuna dokunma
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">{ttX2610("agfBaslik")}</label>
        {liste.map((f) => (
          <div key={f.id} className="glass-soft rounded-xl px-3 py-2.5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">{f.icon}</span>
                  <b className="text-[11px] font-bold text-white">{f.title}</b>
                  <span className={`rounded px-1.5 py-0.5 text-[7.5px] font-black uppercase ${
                    f.lock_level === "hidden" ? "bg-red-500/25 text-red-300 border border-red-400/40" : "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40"
                  }`}>
                    {TIER_ETIKET[f.lock_level]}
                  </span>
                </div>
                <p className="text-[9px] text-white/40 mt-0.5">{f.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                disabled={busyId === f.id || yukleniyor}
                onClick={() => acF(f.id, "free")}
                className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[9px] font-black text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/30 disabled:opacity-40"
              >
                free'e aç
              </button>
              <button
                disabled={busyId === f.id || yukleniyor}
                onClick={() => acF(f.id, "pro")}
                className="rounded-lg bg-sky-500/20 px-2.5 py-1 text-[9px] font-black text-sky-300 ring-1 ring-sky-400/30 transition hover:bg-sky-500/30 disabled:opacity-40"
              >
                pro'ya aç
              </button>
              <button
                disabled={busyId === f.id || yukleniyor}
                onClick={() => acF(f.id, "elit")}
                className="rounded-lg bg-fuchsia-500/20 px-2.5 py-1 text-[9px] font-black text-fuchsia-300 ring-1 ring-fuchsia-400/30 transition hover:bg-fuchsia-500/30 disabled:opacity-40"
              >
                elit'e aç
              </button>
              {/* ★ 17.10: V3 etiketi — admin bu üyeye "V3 kilidi" koyar (kullanıcı haritası yol haritasında oy görmeye devam eder) */}
              <button
                disabled={busyId === f.id || yukleniyor}
                onClick={() => { notify(ttX2610("agKiliteAlindi").replace("{a}", f.title)); }}
                className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[9px] font-black text-indigo-300 ring-1 ring-indigo-400/30 transition hover:bg-indigo-500/30 disabled:opacity-40"
                title={ttX2610("agfV3Title")}
              >
                V3'e kilitle
              </button>
              {f.lock_level !== "hidden" && (
                <button
                  disabled={busyId === f.id || yukleniyor}
                  onClick={() => gizleF(f.id)}
                  className="rounded-lg bg-white/5 px-2.5 py-1 text-[9px] font-black text-white/50 transition hover:bg-white/10 disabled:opacity-40"
                  title={ttX2610("agfGeriTitle")}
                >
                  <EyeOff size={11} className="inline" /> tekrar gizle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2">
        <h4 className="text-[11px] font-black text-white flex items-center gap-2">
          🗿 Atmosfer Kategorileri — Gizli Listesi + Tier Etiketi
        </h4>
        <p className="text-[10px] leading-relaxed text-white/60">
          Atmosfer'de gizli kalan admin kategorileri buradan tier bilgisiyle açılabilir.
          Etiket: <span className="text-sky-300 font-black">PRO</span>, <span className="text-fuchsia-300 font-black">{ttX2610("tierElit")}</span>, <span className="text-emerald-300 font-black">FREE</span>.
          Seçtiğin tier'a açınca atmosfer seçicinde tüm kullanıcılara görünür.
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {(function () {
            // ★ Atmosfer gizli listenin adını adminCategoryAccess.ts'ten çektik
            const GIZLI_KAT = [
              { id: "admin_hudhud_water_suleyman_hoopoe_bird", ad: "Hüdhüd Kuşu", halihazirda: "v2" },
              { id: "admin_lizard_in_desert", ad: "Kertenkele", halihazirda: "v2" },
              { id: "admin_water_cycle_cloud_formation", ad: "Su Döngüsü", halihazirda: "v2" },
              { id: "admin_praying_hands_islamic", ad: "Dua Eden Eller", halihazirda: "v2" },
              { id: "admin_withered_dry_grass", ad: "Kuraklık", halihazirda: "v2" },
              { id: "admin_earth_crust_layers", ad: "Yerkabuğu", halihazirda: "v2" },
              { id: "admin_hadid_iron_metal", ad: "Demir", halihazirda: "v2" },
              { id: "admin_kahf_cave_zara_bowl", ad: "Mağara (Kehf)", halihazirda: "v2" },
              { id: "admin_locust_swarm_flying", ad: "Çekirge", halihazirda: "v2" },
              { id: "admin_luxury_palace_interior", ad: "Saray", halihazirda: "v2" },
              { id: "admin_fil_elephants", ad: "🐘 Fil", halihazirda: "elit" },
              { id: "admin_paradise_rivers_milk", ad: "Cennet Nehirleri", halihazirda: "elit" },
            ] as const;
            return GIZLI_KAT.map((k) => (
              <div key={k.id} className="glass-soft rounded-lg px-2 py-1.5 flex items-center justify-between border border-white/10">
                <span className="text-[9.5px] font-bold text-white truncate">{k.ad}</span>
                <span className={`rounded px-1.5 py-0.5 text-[7px] font-black uppercase shrink-0 ${k.halihazirda === "v2" ? "bg-amber-500/25 text-amber-300" : k.halihazirda === "elit" ? "bg-fuchsia-500/25 text-fuchsia-300" : "bg-sky-500/25 text-sky-300"}`}>
                  {k.halihazirda === "v2" ? "V2 KİLİT" : k.halihazirda}
                </span>
              </div>
            ));
          })()}
        </div>
        <p className="text-[9px] text-white/40">
          Bu liste haritayı [src/adminCategoryAccess.ts](src/adminCategoryAccess.ts) dosyasından çeker — yani oradaki kategorileri istediğini "pro" / "elit"e çekmek için ADMIN_PRO / ADMIN_ELIT dizilerine taşımak yeterli.
        </p>
      </div>
    </div>
  );
};
