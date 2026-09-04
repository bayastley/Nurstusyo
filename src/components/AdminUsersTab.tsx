import React from "react";
import { UserCheck, Crown, Ban, CheckCircle, History, Search, Package, Clock, Wallet } from "lucide-react";
import { isAdminEmail } from "../tier";
import type { ManagedUser } from "../services/adminSyncService";
import type { Tier } from "../types";

interface AdminUsersTabProps {
  emailSearchQuery: string;
  setEmailSearchQuery: (v: string) => void;
  emailSearchResult: ManagedUser | null;
  handleEmailSearch: () => void;
  handleSetTierViaEmail: (email: string, tier: Tier) => void;
  giftAmount: number;
  setGiftAmount: (v: number) => void;
  giftTier: Tier;
  setGiftTier: (v: Tier) => void;
  handleGiftRights: (email: string, amount: number, tier?: Tier) => void;
  selectedUser: ManagedUser | undefined;
  banReasonInput: string;
  setBanReasonInput: (v: string) => void;
  handleBan: (email: string, reason: string) => void;
  handleUnban: (email: string) => void;
  handleTierChange: (email: string, tier: Tier) => void;
  handleResetRights: (email: string) => void;
  jetonDelta: number;
  setJetonDelta: (v: number) => void;
  handleDirectJetonSet: (email: string, amount: number) => void;
  selectedEmail: string;
  setSelectedEmail: (v: string) => void;
  filteredUsers: ManagedUser[];
  currentUserEmail: string;
  handleUserHistory: (email: string) => void;
  userHistory: any;
  loadingHistory: boolean;
  historyEmail: string;
  setHistoryEmail: (v: string) => void;
  setUserHistory: (v: any) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  emailSearchQuery, setEmailSearchQuery, emailSearchResult,
  handleEmailSearch, handleSetTierViaEmail,
  giftAmount, setGiftAmount, giftTier, setGiftTier, handleGiftRights,
  selectedUser, banReasonInput, setBanReasonInput,
  handleBan, handleUnban, handleTierChange, handleResetRights,
  jetonDelta, setJetonDelta, handleDirectJetonSet,
  selectedEmail, setSelectedEmail, filteredUsers, currentUserEmail,
  handleUserHistory, userHistory, loadingHistory, historyEmail, setHistoryEmail, setUserHistory,
}) => {
  return (
    <>
      {/* 0. EMAIL ile Kullanıcı Bul & Yönet */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <label className="mb-2 block text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--accent-2)" }}>
           Email ile Kullanıcı Bul ve Yönet
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={emailSearchQuery}
            onChange={(e) => setEmailSearchQuery(e.target.value)}
            placeholder="ornek@gmail.com"
            className="glass-soft flex-1 min-w-[200px] rounded-xl py-2.5 px-3 text-[12px] font-medium text-white outline-none placeholder:text-white/30 focus:border-[color:var(--accent)]"
          />
          <button
            onClick={handleEmailSearch}
            className="rounded-xl px-3 py-2 text-[10px] font-black text-black"
            style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
          >
            ARA
          </button>
        </div>

        {emailSearchResult && (
          <div className="mt-3 rounded-xl bg-black/40 p-3 text-[11px]">
            <div className="mb-1 font-bold text-white">
              {emailSearchResult.email}
            </div>
            <div className="mb-2 text-white/70">
              Tier: {emailSearchResult.tier.toUpperCase()} · Hak: {emailSearchResult.jeton} ⚡
              {emailSearchResult.isBanned ? " · BANLI" : ""}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSetTierViaEmail(emailSearchResult.email, "free")}
                className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white hover:bg-white/20"
              >
                FREE
              </button>
              <button
                onClick={() => handleSetTierViaEmail(emailSearchResult.email, "pro")}
                className="rounded-lg bg-amber-500/20 px-2 py-1 text-[9px] font-bold text-amber-200 hover:bg-amber-500/30"
              >
                PRO YAP
              </button>
              <button
                onClick={() => handleSetTierViaEmail(emailSearchResult.email, "elit")}
                className="rounded-lg bg-amber-400/30 px-2 py-1 text-[9px] font-bold text-amber-100 hover:bg-amber-400/40"
              >
                ELİT YAP
              </button>
              <input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(Number(e.target.value) || 0)}
                className="w-20 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white outline-none"
                placeholder="100"
              />
              <button
                onClick={() => handleGiftRights(emailSearchResult.email, giftAmount, giftTier)}
                className="rounded-lg bg-emerald-500/25 px-2 py-1 text-[9px] font-bold text-emerald-200 hover:bg-emerald-500/35"
              >
                HAK HEDİYE ET
              </button>
              {emailSearchResult.isBanned ? (
                <button
                  onClick={() => handleUnban(emailSearchResult.email)}
                  className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white hover:bg-white/20"
                >
                  BAN KALDIR
                </button>
              ) : (
                <button
                  onClick={() => handleBan(emailSearchResult.email, banReasonInput || "Admin kararı")}
                  className="rounded-lg bg-red-500/25 px-2 py-1 text-[9px] font-bold text-red-200 hover:bg-red-500/35"
                >
                  BANLA
                </button>
              )}
            </div>
            {/* GEÇMİŞ GÖR BUTONU */}
            <button
              onClick={() => handleUserHistory(emailSearchResult.email)}
              disabled={loadingHistory}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500/15 px-3 py-2 text-[10px] font-bold text-blue-300 hover:bg-blue-500/25 transition disabled:opacity-50"
            >
              <History size={13} />
              {loadingHistory ? "Yükleniyor..." : "Son 10 İşlem Geçmişi"}
            </button>
          </div>
        )}

        {/* ★ KULLANICI GEÇMİŞİ GÖRÜNTÜLEMESİ */}
        {userHistory && (
          <div className="mt-3 rounded-xl bg-black/50 border border-blue-500/20 p-3">
            <div className="mb-2 flex items-center gap-2">
              <History size={13} className="text-blue-400" />
              <span className="text-[11px] font-bold text-blue-300">
                {historyEmail} — İşlem Geçmişi
              </span>
            </div>

            {/* Kullanıcı Bilgileri */}
            {userHistory.user ? (
              <>
                <div className="mb-2 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="text-white/40">Tier</div>
                    <div className="font-bold text-white uppercase">{userHistory.user.tier}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="text-white/40">Kayıt</div>
                    <div className="font-bold text-white">{userHistory.user.created_at ? new Date(userHistory.user.created_at).toLocaleDateString("tr-TR") : "—"}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="text-white/40">Son Güncelleme</div>
                    <div className="font-bold text-white">{userHistory.user.updated_at ? new Date(userHistory.user.updated_at).toLocaleDateString("tr-TR") : "—"}</div>
                  </div>
                </div>

                {/* Cüzdan Durumu */}
                {userHistory.wallet && (
                  <div className="mb-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
                    <div className="mb-1 flex items-center gap-1">
                      <Wallet size={11} className="text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-300">Cüzdan Durumu</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[9px]">
                      <div><span className="text-white/50">Kısa:</span> <span className="font-bold text-white">{userHistory.wallet.purchased_kisa || 0}</span></div>
                      <div><span className="text-white/50">Uzun:</span> <span className="font-bold text-white">{userHistory.wallet.purchased_uzun || 0}</span></div>
                      <div><span className="text-white/50">Tam:</span> <span className="font-bold text-white">{userHistory.wallet.purchased_tam || 0}</span></div>
                    </div>
                  </div>
                )}

                {/* Abonelikler */}
                {userHistory.subscriptions?.length > 0 && (
                  <div className="mb-2 rounded-lg bg-purple-500/10 border border-purple-500/20 p-2">
                    <div className="mb-1 flex items-center gap-1">
                      <Package size={11} className="text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-300">Abonelikler</span>
                    </div>
                    {userHistory.subscriptions.map((sub: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[9px] text-white/60">
                        <span>{sub.product_code}</span>
                        <span className={sub.status === "active" ? "text-green-400" : "text-red-400"}>{sub.status}</span>
                        <span>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("tr-TR") : "—"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Son 10 Sipariş */}
                {userHistory.orders?.length > 0 ? (
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="mb-1 flex items-center gap-1">
                      <Package size={11} className="text-white/50" />
                      <span className="text-[10px] font-bold text-white/70">Son {userHistory.orders.length} Sipariş</span>
                    </div>
                    <div className="space-y-1">
                      {userHistory.orders.map((order: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2 py-1.5 text-[9px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white/40">{order.id?.slice(0, 8)}</span>
                            <span className="font-bold text-white">{order.product_code}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white/50">{order.amount ? `${order.amount}₺` : "—"}</span>
                            <span className={order.status === "completed" ? "text-green-400 font-bold" : order.status === "pending" ? "text-yellow-400" : "text-red-400"}>
                              {order.status}
                            </span>
                            <span className="text-white/30">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[10px] text-white/30 py-2">
                    Henüz sipariş kaydı yok
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-[10px] text-white/30 py-2">
                Bu email adresinde kayıtlı kullanıcı bulunamadı
              </div>
            )}

            <button
              onClick={() => setUserHistory(null)}
              className="mt-2 w-full rounded-lg bg-white/5 px-2 py-1 text-[9px] text-white/40 hover:bg-white/10 transition"
            >
              Geçmişi Kapat
            </button>
          </div>
        )}
      </div>

      {/* Kayıtlı Kullanıcılar Listesi */}
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-white/60">
          🔍 Kayıtlı Kullanıcılar
        </label>
        <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin p-1 rounded-xl bg-black/20">
          {filteredUsers.map((u) => {
            const isSelected = u.email.toLowerCase() === selectedEmail.toLowerCase();
            const isKurucu = isAdminEmail(u.email);
            return (
              <button
                key={u.id}
                onClick={() => setSelectedEmail(u.email)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10.5px] font-semibold transition ${
                  isSelected
                    ? "text-black shadow-md font-bold"
                    : "glass-soft text-white/70 hover:text-white"
                }`}
                style={
                  isSelected
                    ? { background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }
                    : undefined
                }
              >
                {isKurucu ? <Crown size={11} className={isSelected ? "text-black" : "text-amber-400"} /> : <UserCheck size={11} />}
                <span>{u.email}</span>
                <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? "bg-black/20 text-black" : "bg-white/10 text-white/60"
                }`}>
                  {u.tier.toUpperCase()} · {u.jeton}J
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Seçili kullanıcı profili ve Üretim hakkı yönetimi */}
      {selectedUser && (
        <div
          className="relative overflow-hidden rounded-3xl border p-5 transition-all"
          style={{
            background: "linear-gradient(160deg, rgba(215,170,82,.12) 0%, rgba(12,13,18,.95) 100%)",
            border: "1px solid rgba(215,170,82,.35)",
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          }}
        >
          {isAdminEmail(selectedUser.email) && (
            <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 text-[8.5px] font-black text-amber-300">
              <Crown size={10} /> KURUCU HESABI
            </span>
          )}

          <div className="mb-4">
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40">Seçili Kullanıcı Kartı</div>
            <h4 className="font-display text-lg font-black text-white mt-0.5">{selectedUser.name}</h4>
            <p className="text-[11px] font-mono text-[color:var(--accent-2)]">{selectedUser.email}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Paket Tanımlama Dropdown */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
                📦 Paket Tanımlama Menüsü
              </label>
              <select
                value={selectedUser.tier}
                onChange={(e) => handleTierChange(selectedUser.email, e.target.value as Tier)}
                className="glass-soft w-full rounded-xl px-3 py-2.5 text-[12px] font-bold outline-none cursor-pointer"
                style={{ color: "var(--accent-2)" }}
              >
                <option value="free">🌱 Ücretsiz (Free)</option>
                <option value="pro">💎 Nûr Pro (Tüm videolar & 1080p)</option>
                <option value="elit">👑 Nûr Elit (%100 Logosuz & Tüm Kâriler)</option>
              </select>
              <p className="text-[9px] text-white/45 leading-relaxed">
                Değiştirdiğiniz anda tüm kilitler bu kullanıcı için canlı güncellenir.
              </p>
              <button
                type="button"
                onClick={() => { if (window.confirm(`⚠️ ${selectedUser.email} kullanıcısının TÜM hakları sıfırlanacak:\n\n• Kısa/Uzun/Tam video hakları\n• Jeton bakiyesi\n• Abonelik iptal edilecek\n• Tier FREE yapılacak\n\nEmin misiniz?`)) handleResetRights(selectedUser.email); }}
                className="w-full rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-400 hover:bg-red-500/25 transition mt-1"
              >
                🗑️ TÜM HAKLARI SIFIRLA (Free Yap + Paketleri Sil)
              </button>
            </div>

            {/* Üretim hakkı bakiyesi yönetimi */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
                🪙 ⚡ Üretim Hakkı Bakiye Yönetimi
              </label>
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-2">
                <span className="text-[10px] text-white/50 font-medium">Mevcut Bakiye:</span>
                <span className="font-display text-xl font-black tabular-nums" style={{ color: "var(--accent-2)" }}>
                  {selectedUser.jeton} <span className="text-[10px] text-white/40 font-bold">⚡ ENERJİ</span>
                </span>
              </div>

              {/* Elle bakiye tanımlama */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  min="0"
                  placeholder="Miktar yaz..."
                  value={jetonDelta}
                  onChange={(e) => setJetonDelta(Math.max(0, parseInt(e.target.value) || 0))}
                  className="glass-soft h-9 flex-1 rounded-xl px-3 font-mono text-[12px] font-bold text-white outline-none placeholder:text-white/30"
                />
                <button
                  onClick={() => handleDirectJetonSet(selectedUser.email, jetonDelta)}
                  className="flex h-9 items-center justify-center gap-1 rounded-xl px-4 text-[11px] font-black text-black transition hover:brightness-110 active:scale-95"
                  style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
                >
                  TANIMLA
                </button>
              </div>

              {/* Hızlı seçim butonları */}
              <div className="flex items-center gap-1 pt-1">
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleDirectJetonSet(selectedUser.email, amt)}
                    className="flex-1 rounded-lg bg-white/5 py-1 text-[9px] font-bold text-white/60 hover:bg-white/10 hover:text-white transition"
                  >
                    ={amt}
                  </button>
                ))}
              </div>

              {/* Bakiye Sıfırla */}
              <button
                onClick={() => handleDirectJetonSet(selectedUser.email, 0)}
                className="mt-1 w-full rounded-lg border border-red-500/30 bg-red-500/10 py-1.5 text-[9.5px] font-black text-red-400 transition hover:bg-red-500/20 active:scale-95"
              >
                🔄 BAKİYEYİ SIFIRLA
              </button>
            </div>
          </div>

          {/* 2.3 SÜRESİZ BANLA / BANINI KALDIR SİBER DENETİM BÖLÜMÜ */}
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                <Ban size={13} className="text-red-400" /> Siber Denetim & Yasal Ban Modülü
              </label>
              {selectedUser.isBanned && (
                <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[8.5px] font-black text-red-300 animate-pulse">
                  ⛔ SÜRESİZ BANLI
                </span>
              )}
            </div>

            {selectedUser.isBanned ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-black/40 p-2.5 text-[10px] leading-relaxed text-red-200 border border-red-500/20">
                  <b className="text-red-400">Mevcut Ban Gerekçesi:</b> {selectedUser.banReason || "Belirtilmedi"}
                  <span className="block text-[8.5px] text-white/40 mt-1">
                    Tarih: {selectedUser.bannedAt ? new Date(selectedUser.bannedAt).toLocaleString("tr-TR") : "-"} · Banned By: {selectedUser.bannedBy || "Admin"}
                  </span>
                </div>

                <button
                  onClick={() => handleUnban(selectedUser.email)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black text-black shadow-lg transition hover:brightness-110 active:scale-95 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
                >
                  <CheckCircle size={14} /> BANINI KALDIR (Sisteme Erişimi Geri Aç)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-[9px] font-bold text-white/50 mb-1">
                    Ban Gerekçesi / Yasal Suç Nedeni:
                  </label>
                  <input
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    placeholder="Örn: Telif ihlali, sahte jeton müdahalesi veya yasal suç..."
                    className="glass-soft w-full rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-red-500"
                  />
                </div>

                <button
                  onClick={() => handleBan(selectedUser.email, banReasonInput)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-black text-white shadow-lg transition hover:brightness-110 active:scale-95 bg-red-600 border border-red-500 cursor-pointer"
                >
                  <Ban size={14} /> SÜRESİZ BANLA
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
