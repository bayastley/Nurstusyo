import React, { useState, useEffect } from "react";
import { X, ThumbsUp, Plus, Trash2, RotateCcw, Clock, Settings, Rocket, Edit3 } from "lucide-react";
import { isAdminEmail } from "../tier";
// ★ SRP adım 3 (30.09): ikon tablosu + V2/V3 özellik tanımları roadmapVeri.ts'e taşındı
import { ICON_EMOJI as R_ICONS, DEFAULT_V2, DEFAULT_V3, getIcon, loadFeatures, saveFeatures, getStoredVotes, getDeadline, VOTE_KEY, DEADLINE_KEY, type Feature } from "./roadmapVeri";

export interface RoadmapModalProps {
  open: boolean;
  onClose: () => void;
  adminEmail?: string;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ open, onClose, adminEmail }) => {
  const isAdmin = adminEmail ? isAdminEmail(adminEmail) : false;
  const [data, setData] = useState<{ v2: Feature[]; v3: Feature[] }>(() => loadFeatures());
  const [localVotes, setLocalVotes] = useState<Record<string, boolean>>(() => getStoredVotes());
  const [myVote, setMyVote] = useState<string | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [deadline, setDeadline] = useState(() => getDeadline());
  const [adminMode, setAdminMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVersion, setNewVersion] = useState<"V2" | "V3">("V2");
  const [showAddForm, setShowAddForm] = useState(false);
  const [voteMsg, setVoteMsg] = useState("");

  // ★ GERÇEK OYLAMA: veritabanından özellikler + gerçek oy toplamları çekilir.
  //   Eski localStorage sistemi herkesin kendi oylarını kendi gösteriyordu —
  //   admin gerçek toplamı ASLA göremiyordu. Artık tek gerçek sayaç DB'de.
  //   DİKKAT: useEffect, `if (!open) return null`'dan ÖNCE olmalı —
  //   yoksa hook sayısı render'lar arası değişir ve React çöker.
  useEffect(() => {
    if (!open || dbLoaded) return;
    let live = true;
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((d: any) => {
        if (!live || !d?.ok) return;
        // DB boşsa (tablo henüz seed edilmediyse) varsayılan planları EZME
        if ((d.v2?.length || 0) === 0 && (d.v3?.length || 0) === 0) {
          setMyVote(null);
          setDbLoaded(true);
          return;
        }
        // ★ MERGE: DB'de olmayan YENİ default maddeler de görünsün —
        //   SQL seed güncellenmemişken bile liste eksik kalmaz (27.09 fix)
        // ★ 28.09: DB satırları icon alanını `icon` olarak gönderiyor →
        //   norm without iconId tüm emojiler ✨ fallback'e düşüyordu.
        const norm0 = (f: any): Feature => ({
          id: String(f.id),
          iconId: String(f.iconId || f.icon || "ai_arkaplan"),
          title: String(f.title || ""),
          desc: String(f.desc || f.description || ""),
          tag: f.tag === "V3" ? "V3" : f.tag === "V2" ? "V2" : f.version === "V3" ? "V3" : "V2",
          votes: Number(f.votes) || 0,
          active: f.active !== false,
        });
        const dbIds = new Set([...(d.v2 || []), ...(d.v3 || [])].map((f: any) => String(f.id)));
        const eksikV2 = DEFAULT_V2.filter((f) => !dbIds.has(f.id)).map((f) => ({ ...f, votes: 0 }));
        const eksikV3 = DEFAULT_V3.filter((f) => !dbIds.has(f.id)).map((f) => ({ ...f, votes: 0 }));
        setData({ v2: [...(d.v2 || []).map(norm0), ...eksikV2], v3: [...(d.v3 || []).map(norm0), ...eksikV3] });
        setMyVote(d.myVote || null);
        setDbLoaded(true);
      })
      .catch(() => undefined); // DB yoksa localStorage yedeği ekranda kalır
    return () => { live = false; };
  }, [open, dbLoaded]);

  if (!open) return null;

  const isDeadlinePassed = deadline && new Date(deadline) < new Date();
  const daysLeft = deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)) : null;

  const save = (newData: { v2: Feature[]; v3: Feature[] }) => {
    setData(newData);
    saveFeatures(newData);
  };

  const handleVote = (id: string) => {
    if (isDeadlinePassed) return;
    // ★ GERÇEK OY: veritabanına yazılır (kullanıcı başına 1 özellik, toggle)
    const oncekiDurum = { myVote, v2: data.v2, v3: data.v3 };
    const wasVoted = myVote === id;
    setMyVote(wasVoted ? null : id);
    setData((prev) => ({
      v2: prev.v2.map((f) => {
        if (f.id === id) return { ...f, votes: Math.max(0, f.votes + (wasVoted ? -1 : 1)) };
        if (myVote === f.id) return { ...f, votes: Math.max(0, f.votes - 1) };
        return f;
      }),
      v3: prev.v3.map((f) => {
        if (f.id === id) return { ...f, votes: Math.max(0, f.votes + (wasVoted ? -1 : 1)) };
        if (myVote === f.id) return { ...f, votes: Math.max(0, f.votes - 1) };
        return f;
      }),
    }));
    try { localStorage.setItem(VOTE_KEY, JSON.stringify({ [id]: true })); } catch {}
    setVoteMsg("");
    const gonder = (deneme: number): void => {
      fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId: id }),
      })
        .then((r) => r.json().catch(() => null).then((d: any) => ({ http: r.status, d })))
        .then(({ http, d }) => {
          if (d?.ok) {
            setVoteMsg("");
            // Sunucudan taze gerçek toplamları al (başkasının oyu değişmiş olabilir)
            fetch("/api/roadmap")
              .then((r2) => r2.json())
              .then((d2: any) => {
                if (!d2?.ok || (d2.v2?.length || 0) === 0) return;
                const norm2 = (f: any): Feature => ({
                  id: String(f.id),
                  iconId: String(f.iconId || f.icon || "ai_arkaplan"),
                  title: String(f.title || ""),
                  desc: String(f.desc || f.description || ""),
                  tag: f.tag === "V3" ? "V3" : f.tag === "V2" ? "V2" : f.version === "V3" ? "V3" : "V2",
                  votes: Number(f.votes) || 0,
                  active: f.active !== false,
                });
                setData({ v2: (d2.v2 || []).map(norm2), v3: (d2.v3 || []).map(norm2) });
                setMyVote(d2.myVote || null);
              })
              .catch(() => undefined);
            return;
          }
          // ★ Misafir oyu: API 401 döner — nazikçe girişe yönlendir
          if (http === 401 || (typeof d?.error === "string" && d.error.includes("giriş"))) {
            setMyVote(oncekiDurum.myVote);
            setData({ v2: oncekiDurum.v2, v3: oncekiDurum.v3 });
            setVoteMsg("🔐 Oy vermek için giriş yapman gerekiyor — sol üst menüden Kayıt Ol / Giriş Yap.");
            return;
          }
          // ★ 28.09: otomatik 1 retry (Vercel fonksiyonunun Supabase'e ara sıra
          //   ulaşamaması — kablolu olarak doğrulandı). Başarısızsa optimistic
          //   değişiklik GERİ alınıyor; eskiden ekranda "Oyun Verildi ✓" kalıyordu!
          if (deneme < 1) { window.setTimeout(() => gonder(deneme + 1), 1200); return; }
          setMyVote(oncekiDurum.myVote);
          setData({ v2: oncekiDurum.v2, v3: oncekiDurum.v3 });
          setVoteMsg("⚠️ Oyun şu an alınamadı — birazdan tekrar dener misin?");
        })
        .catch(() => {
          if (deneme < 1) { window.setTimeout(() => gonder(deneme + 1), 1200); return; }
          setMyVote(oncekiDurum.myVote);
          setData({ v2: oncekiDurum.v2, v3: oncekiDurum.v3 });
          setVoteMsg("⚠️ Oyun şu an alınamadı — birazdan tekrar dener misin?");
        });
    };
    gonder(0);
  };

  // ★ ADMIN İŞLEMLERİ ARTIK DB'YE YAZILIR — adminin eklediği/sildiği/düzenlediği
  //   madde HERKESE görünür ve oydamaya açılır (eskiden yalnızca adminin kendi
  //   tarayıcısında kalıyor, kimse göremiyordu).
  //   DİKKAT: burada useCallback/useMemo KULLANILMAZ — `if (!open) return null`
  //   sonrasında hook tanımlanamaz, hook sayısı değişir ve React çöker.
  //   Sıradan fonksiyon oldukları için hook kuralına takılmazlar.
  // ★ 28.09: "Oyun şu an alınamadı" uyarısının kök nedeni — optimistic güncelleme
  //   POST başarısız olunca geri alınıyordu... AMA hiç geri alınmıyordu! Ekran
  //   "Oyun Verildi ✓" gösteriyor, uyarı çıkıyor, DB'de oy yok. Ayrıca GET'ten
  //   dönen DB satırları icon alanını `icon` olarak taşıdığından DB listesi
  //   uygulanmışsa tüm emojiler fallback'e düşüyordu. İkisi de giderildi:
  //   • POST başarısız → optimistic değişiklik GERİ alınıyor + otomatik 1 retry
  //   • DB satırı { icon } → { iconId } normalizasyonu (emoji kaybı yok)
  const reloadFromDb = () => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((d: any) => {
        if (!d?.ok) return;
        if ((d.v2?.length || 0) === 0 && (d.v3?.length || 0) === 0) return;
        const norm = (f: any): Feature => ({
          id: String(f.id),
          iconId: String(f.iconId || f.icon || "ai_arkaplan"),
          title: String(f.title || ""),
          desc: String(f.desc || f.description || ""),
          tag: f.tag === "V3" ? "V3" : f.tag === "V2" ? "V2" : f.version === "V3" ? "V3" : "V2",
          votes: Number(f.votes) || 0,
          active: f.active !== false,
        });
        setData({ v2: (d.v2 || []).map(norm), v3: (d.v3 || []).map(norm) });
        setMyVote(d.myVote || null);
      })
      .catch(() => undefined);
  };

  const adminApi = (body: Record<string, unknown>) =>
    fetch("/api/roadmap", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d: any) => { if (d?.ok) reloadFromDb(); else if (typeof d?.error === "string") setVoteMsg(`⚠️ ${d.error}`); return d; })
      .catch(() => undefined);

  const handleResetVotes = () => {
    if (!confirm("Tüm oyları sıfırlamak istediğine emin misin?")) return;
    adminApi({ action: "resetVotes" });
    const v2 = data.v2.map(f => ({ ...f, votes: 0 }));
    const v3 = data.v3.map(f => ({ ...f, votes: 0 }));
    save({ v2, v3 });
    setLocalVotes({});
    try { localStorage.removeItem(VOTE_KEY); } catch {}
  };

  const handleDeleteFeature = (id: string, version: "V2" | "V3") => {
    if (!confirm("Bu özelliği silmek istediğine emin misin?")) return;
    adminApi({ action: "delete", id });
    if (version === "V2") save({ ...data, v2: data.v2.filter(f => f.id !== id) });
    else save({ ...data, v3: data.v3.filter(f => f.id !== id) });
  };    const handleAddFeature = () => {
    if (!newTitle.trim()) return;
    const newFeature: Feature = {
      id: `custom-${Date.now()}`,
      iconId: "ai_arkaplan",
      title: newTitle.trim(),
      desc: newDesc.trim() || "Yakında eklenecek.",
      tag: newVersion,
      votes: 0,
      active: true,
    };
    // ★ DB'ye yaz → herkes görür; DB yoksa localStorage yedeği kalır
    adminApi({ action: "add", version: newVersion, title: newFeature.title, desc: newFeature.desc });
    if (newVersion === "V2") save({ ...data, v2: [...data.v2, newFeature] });
    else save({ ...data, v3: [...data.v3, newFeature] });
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string, version: "V2" | "V3") => {
    if (!editTitle.trim()) return;
    adminApi({ action: "edit", id, title: editTitle.trim(), desc: editDesc.trim() });
    const updater = (f: Feature) => f.id === id ? { ...f, title: editTitle.trim(), desc: editDesc.trim() } : f;
    if (version === "V2") save({ ...data, v2: data.v2.map(updater) });
    else save({ ...data, v3: data.v3.map(updater) });
    setEditingId(null);
  };

  const handleSaveDeadline = () => {
    try { localStorage.setItem(DEADLINE_KEY, deadline); } catch {}
  };

  // ★ GERÇEK toplam: V2 + V3 oylarının gerçek DB toplamı (artık sadece kendi oyn değil)
  const totalVotes = [...data.v2, ...data.v3].reduce((sum, f) => sum + f.votes, 0);
  // ★ ADMIN OY ÖZETİ — admin modunda en çok oy alan 3 madde burada listelenir
  const liderler = [...data.v2, ...data.v3].filter((f) => f.votes > 0).sort((a, b) => b.votes - a.votes).slice(0, 3);

  const MEDALS = ["🥇", "🥈", "🥉"];

  const renderFeature = (f: Feature, version: "V2" | "V3", rank: number = -1) => {
    const isEditing = editingId === f.id;
    const emoji = getIcon(f.iconId);
    const lider = rank === 0 && f.votes > 0;

    return (
      <div key={f.id} className={`relative flex items-start gap-3 rounded-xl border p-3.5 transition group ${lider ? "border-amber-300/50 bg-gradient-to-r from-amber-400/[0.16] to-emerald-400/[0.08] shadow-[0_0_26px_rgba(245,190,70,.14)]" : version === "V2" ? "border-amber-400/20 bg-gradient-to-r from-amber-400/[0.12] to-emerald-400/[0.06] shadow-[0_0_22px_rgba(245,190,70,.06)] hover:border-amber-300/45" : "border-indigo-300/15 bg-gradient-to-r from-slate-800/55 via-indigo-950/45 to-blue-950/45 hover:border-indigo-300/30"}`}>
        {/* ★ MADALYA — en çok oy alan 3 yenilik */}
        {rank >= 0 && rank < 3 && f.votes > 0 && (
          <span className="absolute -left-2 -top-2 rounded-full bg-gray-950 px-1 text-base drop-shadow-[0_2px_6px_rgba(0,0,0,.8)]" title={`${rank + 1}. sırada — ${f.votes} oy`}>{MEDALS[rank]}</span>
        )}
        <div className={`mt-0.5 rounded-lg p-2 text-base transition group-hover:scale-110 ${version === "V2" ? "bg-amber-300/15" : "bg-indigo-400/15"}`}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1.5">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Özellik adı" />
              <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Açıklama" />
              <div className="flex gap-1.5">
                <button onClick={() => handleSaveEdit(f.id, version)} className="rounded-lg bg-green-500/20 px-2 py-0.5 text-[9px] font-bold text-green-300">Kaydet</button>
                <button onClick={() => setEditingId(null)} className="rounded-lg bg-white/10 px-2 py-0.5 text-[9px] text-white/50">İptal</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-[12.5px] font-bold ${version === "V2" ? "text-white" : "text-indigo-100/85"}`}>{f.title}</span>
              </div>
              <p className={`mt-1 text-[11px] leading-relaxed ${version === "V2" ? "text-white/70" : "text-indigo-100/55"}`}>{f.desc}</p>
            </>
          )}
        </div>

        {/* Oy + Admin Kontrolleri — ★ sayı ve buton AYRI; "0 oy" ASLA gösterilmez (yeni site sıfır göstermez) */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {!adminMode && version === "V2" ? (
            <>
              {f.votes > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black tabular-nums ${myVote === f.id ? "bg-amber-500/25 text-amber-200" : "bg-white/10 text-white/45"}`}>
                  {f.votes.toLocaleString("tr-TR")} oy
                </span>
              )}
              <button
                onClick={() => handleVote(f.id)}
                disabled={isDeadlinePassed}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9.5px] font-black transition ${myVote === f.id ? "bg-amber-500/25 text-amber-200 ring-1 ring-amber-300/50" : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25"}`}
              >
                <ThumbsUp size={10} />
                {myVote === f.id ? "Oyun Verildi ✓ (değiştirmek için tekrar bas)" : "Oy Ver"}
              </button>
            </>
          ) : isAdmin && adminMode ? (
            <>
              <button onClick={() => { setEditingId(f.id); setEditTitle(f.title); setEditDesc(f.desc); }} className="p-1 rounded bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition" title="Düzenle">
                <Edit3 size={10} />
              </button>
              <button onClick={() => handleDeleteFeature(f.id, version)} className="p-1 rounded bg-red-500/15 text-red-300 hover:bg-red-500/25 transition" title="Sil">
                <Trash2 size={10} />
              </button>
              <span className="text-[8px] text-white/20">{f.votes}</span>
            </>
          ) : f.votes > 0 ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold tabular-nums text-white/40">{f.votes.toLocaleString("tr-TR")} oy</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 via-gray-950 to-black shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-950/90 backdrop-blur px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Rocket size={20} style={{ color: "var(--accent-2)" }} />
              Güncelleme Yol Haritası
            </h2>
            <p className="text-[11px] text-white/40 mt-0.5">Nûr Stüdyo — Gelecek planları ve v2-v3 yenilikleri</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setAdminMode(!adminMode)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[9px] font-bold transition ${adminMode ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/30 hover:bg-white/10"}`}>
                <Settings size={11} />
                {adminMode ? "Admin Açık" : "Admin"}
              </button>
            )}
            <button onClick={onClose} aria-label="Kapat" className="p-1.5 rounded-full hover:bg-white/10 transition">
              <X size={18} className="text-white/50" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Admin Paneli */}
          {isAdmin && adminMode && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={13} className="text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300">Admin Kontrol Paneli</span>
              </div>

              {/* Oylama Süresi */}
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-white/50" />
                <span className="text-[10px] text-white/60">Oylama Bitiş Tarihi:</span>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none"
                />
                <button onClick={handleSaveDeadline} className="rounded-lg bg-green-500/20 px-2 py-1 text-[9px] font-bold text-green-300">Kaydet</button>
                {deadline && (
                  <button onClick={() => { setDeadline(""); try { localStorage.removeItem(DEADLINE_KEY); } catch {} }} className="rounded-lg bg-white/10 px-2 py-1 text-[9px] text-white/40">Kaldır</button>
                )}
              </div>
              {daysLeft !== null && (
                <p className="text-[9px] text-white/30">
                  {isDeadlinePassed ? "⏰ Oylama süresi doldu" : `📅 ${daysLeft} gün kaldı`}
                </p>
              )}

              {/* Yeni Özellik Ekleme */}
              {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:bg-white/10 transition">
                  <Plus size={12} /> Yeni Özellik Ekle
                </button>
              ) : (
                <div className="rounded-lg bg-black/30 p-3 space-y-2">
                  <div className="flex gap-2">
                    <select value={newVersion} onChange={e => setNewVersion(e.target.value as "V2" | "V3")} className="rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none">
                      <option value="V2">V2</option>
                      <option value="V3">V3</option>
                    </select>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Özellik adı (ör: AI Meal Seslendirme)" />
                  </div>
                  <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none" placeholder="Kısa açıklama (opsiyonel)" />
                  <div className="flex gap-2">
                    <button onClick={handleAddFeature} className="rounded-lg bg-green-500/20 px-3 py-1 text-[9px] font-bold text-green-300">Ekle</button>
                    <button onClick={() => { setShowAddForm(false); setNewTitle(""); setNewDesc(""); }} className="rounded-lg bg-white/10 px-3 py-1 text-[9px] text-white/40">İptal</button>
                  </div>
                </div>
              )}

              {/* Toplu İşlemler */}
              <div className="flex gap-2 pt-1">
                <button onClick={handleResetVotes} className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1 text-[9px] font-bold text-red-300 hover:bg-red-500/25 transition">
                  <RotateCcw size={10} /> Oyları Sıfırla
                </button>
                <button onClick={() => { save({ v2: [], v3: [] }); setLocalVotes({}); }} className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[9px] text-white/40 hover:bg-white/10 transition">
                  <RotateCcw size={10} /> Planları Temizle
                </button>
              </div>
            </div>
          )}

          {/* ★ OYLAMA BANNERI — hangi özellik önce gelsin? (kart tasarımıyla uyumlu) */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.12] via-amber-500/[0.07] to-transparent p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-emerald-500/25 px-2.5 py-1 text-[10px] font-black tracking-widest text-emerald-300 ring-1 ring-emerald-400/40">OYLAMA</span>
              <h3 className="text-[15px] font-black text-white">Hangi Özellik Önce Gelsin?</h3>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">
              Menüdeki yeniliklere oyunu ver — en çok oy alanları ekibimiz sırayla hayata geçirir. Her özelliğe 1 oy, istersen oyunu değiştirebilirsin.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* ★ Toplam oy sayacı kaldırıldı — yeni sitede 0 gösterip güven sarsılmaz;
                  admin özeti yalnız admin modunda görünür */}
              {deadline && !isDeadlinePassed && daysLeft !== null && (
                <span className="rounded-full bg-white/5 px-3 py-1 text-[9.5px] font-bold text-white/50">⏰ {daysLeft} gün kaldı</span>
              )}
              {isDeadlinePassed && (
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-[9.5px] font-bold text-red-300">⏰ Oylama süresi doldu</span>
              )}
              {totalVotes === 0 && !isDeadlinePassed && (
                <span className="animate-pulse rounded-full bg-emerald-500/15 px-3 py-1 text-[9.5px] font-black text-emerald-300">✨ İlk oyu sen ver!</span>
              )}
            </div>
            {isAdmin && adminMode && liderler.length > 0 && (
              <div className="mt-2.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-300">👑 Admin Özeti — En Çok Oy Alanlar</p>
                <ol className="mt-1 space-y-0.5">
                  {liderler.map((f, i) => (
                    <li key={f.id} className="flex items-center gap-2 text-[10px] text-white/75">
                      <span>{["🥇", "🥈", "🥉"][i]}</span>
                      <span className="flex-1 truncate font-bold">{f.title}</span>
                      <span className="font-black tabular-nums text-amber-200">{f.votes} oy</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <p className="mt-2 text-[9.5px] text-amber-200/60">🏆 En çok oy alan yenilikler oylama sonunda sırayla hayata geçirilir</p>
            {voteMsg && <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-500/15 px-2.5 py-1.5 text-[9.5px] font-bold text-amber-200">{voteMsg}</p>}
          </div>

          {/* V2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-gradient-to-r from-amber-300 to-emerald-300 px-2.5 py-1 text-[10px] font-black tracking-wider text-black shadow-[0_0_16px_rgba(245,190,70,.25)]">V2</div>
              <span className="text-sm font-bold text-white">Yakında Gelen Güncellemeler</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold text-emerald-300">{data.v2.filter(f => f.active).length} özellik · 1 oy seç</span>
            </div>
            <div className="space-y-2">
              {data.v2.filter(f => f.active).sort((a, b) => b.votes - a.votes).map((f, i) => renderFeature(f, "V2", i))}
              {data.v2.filter(f => f.active).length === 0 && <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-[10px] text-white/30">Henüz V2 planı eklenmedi. İlk fikri sen belirle.</p>}
            </div>
          </div>

          {/* V3 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg border border-indigo-300/25 bg-indigo-500/25 px-2.5 py-1 text-[10px] font-black tracking-wider text-indigo-100">V3</div>
              <span className="text-sm font-bold text-indigo-100/85">Uzun Vadeli Planlar</span>
              <span className="rounded-full border border-indigo-300/20 bg-indigo-400/10 px-2 py-0.5 text-[9px] font-bold text-indigo-200/60">{data.v3.filter(f => f.active).length} özellik · uzun vade</span>
            </div>
            <div className="space-y-2">
              {data.v3.filter(f => f.active).sort((a, b) => b.votes - a.votes).map((f, i) => renderFeature(f, "V3", i))}
              {data.v3.filter(f => f.active).length === 0 && <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-[10px] text-white/30">Henüz uzun vadeli plan eklenmedi. Birlikte şekillendireceğiz.</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 pb-4 space-y-1">
            <p className="text-[10px] text-white/30">🕌 Nûr Stüdyo — Dünyada tek "Kur'an Video Üreten AI Stüdyo"</p>
            <p className="text-[9px] text-white/20">Özellikler developmental sırayla eklenecektir</p>
          </div>
        </div>
      </div>
    </div>
  );
};
