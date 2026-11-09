import { translate } from "../../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);
// ════════════════════════════════════════════════════════
// ADMINDASHBOARD BOLUMLER — AdminDashboardModal sekme bileşenleri
// AdminDashboardModal.tsx'den ayrıldı (SRP adım 10, 30.09)
// BanLogs · Feedback (yanıtlı) · Errors (filtre+sayfalama+alarm)
// ════════════════════════════════════════════════════════

import React from "react";
import { Ban, ChevronLeft, ChevronRight, Lightbulb, Loader2, ShieldOff, UserCheck } from "lucide-react";
import type { BanLog } from "../../services/adminSyncService";

/** Sunucudaki aktif ban kaydı (nur_ban_logs, unbanned=false) */

const BAN_SAYFA_BOYUTU = 10;
export interface BannedUserRow {
  id?: string;
  user_email: string;
  reason: string;
  banned_by?: string;
  created_at?: string;
}

// ─── TAB 4: BAN & SİBER DENETİM LOGLARI ─────────────────
// ★ 04.10: üstte AKTİF BANLI KULLANICILAR listesi (sunucu nur_ban_logs'tan,
//   10'ar sayfalı + ◀▶ ok butonları + her satırda çalışan "Banı Kaldır" butonu);
//   altta yerel ban geçmişi (eski davranış korundu).

export function AdminBanLogsTab({
  banLogs,
  bannedUsers,
  bannedLoading,
  banPage,
  setBanPage,
  onUnban,
  unbanBusy,
  onReload,
}: {
  banLogs: BanLog[];
  bannedUsers: BannedUserRow[];
  bannedLoading: boolean;
  banPage: number;
  setBanPage: (p: number) => void;
  onUnban: (email: string) => void;
  unbanBusy: string | null;
  onReload: () => void;
}) {
  const sayfaSayisi = Math.max(1, Math.ceil(bannedUsers.length / BAN_SAYFA_BOYUTU));
  const guvenliSayfa = Math.min(Math.max(0, banPage), sayfaSayisi - 1);
  const sayfadaki = bannedUsers.slice(guvenliSayfa * BAN_SAYFA_BOYUTU, guvenliSayfa * BAN_SAYFA_BOYUTU + BAN_SAYFA_BOYUTU);
  return (
            <div className="space-y-4">
              {/* ─── AKTİF BANLI KULLANICILAR (sunucu) ─── */}
              <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                      <ShieldOff size={18} />
                    </span>
                    <div>
                      <h4 className="text-[12px] font-black text-white">Aktif Banlı Kullanıcılar ({bannedUsers.length})</h4>
                      <p className="text-[9.5px] text-white/50 leading-relaxed">
                        Sunucudaki canlı ban kayıtları — bu listedeki kullanıcı siteye giremez ve video üretemez.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onReload}
                    disabled={bannedLoading}
                    className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1.5 text-[9px] font-bold text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-40"
                    title="Listeyi yenile"
                  >
                    {bannedLoading ? <Loader2 size={11} className="animate-spin" /> : "↻ Yenile"}
                  </button>
                </div>

                {bannedLoading && bannedUsers.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-[11px] text-white/50">
                    <Loader2 size={14} className="animate-spin" /> Ban listesi yükleniyor…
                  </div>
                ) : sayfadaki.length === 0 ? (
                  <p className="p-4 text-center text-[10px] text-white/40 italic">
                    Şu anda aktif banlı kullanıcı yok — tüm hesaplar erişimde.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 pt-1">
                      {sayfadaki.map((u) => (
                        <div key={u.id || u.user_email} className="rounded-xl border border-red-500/25 bg-black/40 p-3 text-[10.5px]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-1.5 font-bold text-red-300">
                              <Ban size={12} className="shrink-0" />
                              <span className="truncate" dir="ltr">{u.user_email}</span>
                            </span>
                            <button
                              onClick={() => onUnban(u.user_email)}
                              disabled={unbanBusy === u.user_email}
                              className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-[9.5px] font-black text-emerald-300 transition hover:bg-emerald-500/30 active:scale-95 disabled:opacity-50"
                              title={ttX2610("adbBanKaldirTitle")}
                            >
                              {unbanBusy === u.user_email ? <Loader2 size={11} className="inline animate-spin" /> : "🔓 BANI KALDIR"}
                            </button>
                          </div>
                          <p className="mt-1 text-white/80 leading-relaxed">
                            <b>{ttX2610("adbGerekce")}</b> {u.reason || "Belirtilmedi"}
                          </p>
                          <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-1 text-[8.5px] text-white/40">
                            <span>Banlayan: {u.banned_by || "Admin"}</span>
                            <span>{u.created_at ? new Date(u.created_at).toLocaleString("tr-TR") : "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* ★ 10'ar sayfalama — ok yönleri ile sıradaki/önceki kullanıcıya */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <button
                        onClick={() => setBanPage(Math.max(0, guvenliSayfa - 1))}
                        disabled={guvenliSayfa === 0}
                        className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black text-white/80 transition hover:bg-white/20 disabled:opacity-30"
                      >
                        ◀ Önceki
                      </button>
                      <span className="text-[9.5px] font-bold text-white/50">
                        Sayfa {guvenliSayfa + 1} / {sayfaSayisi} · {bannedUsers.length} banlı
                      </span>
                      <button
                        onClick={() => setBanPage(Math.min(sayfaSayisi - 1, guvenliSayfa + 1))}
                        disabled={guvenliSayfa >= sayfaSayisi - 1}
                        className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black text-white/80 transition hover:bg-white/20 disabled:opacity-30"
                      >
                        Sonraki ▶
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                    <Lightbulb size={18} className="animate-pulse" fill="currentColor" />
                  </span>
                  <div>
                    <h4 className="text-[12px] font-black text-white">ttX2610("adbSiberKayitlar")</h4>
                    <p className="text-[9.5px] text-white/50 leading-relaxed">
                      Sistem tarafından otomatik tespit edilen güvenlik ihlalleri ve Admin tarafından uygulanan yasal ban işlemleri.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {banLogs.length > 0 ? (
                    banLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-300 flex items-center gap-1">
                            <Ban size={12} /> {log.userEmail} ({log.userName})
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                            log.unbanned ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                          }`}>
                            {log.unbanned ? "BAN KALKTI" : log.isAuto ? "SİSTEM OTOMATİK" : "ADMİN BAN"}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed">
                          <b>ttX2610("adbGerekceSuclama")</b> {log.reason}
                        </p>
                        <div className="flex items-center justify-between text-[8.5px] text-white/40 pt-1 border-t border-white/5">
                          <span>Yetkili: {log.bannedBy}</span>
                          <span>{new Date(log.timestamp).toLocaleString("tr-TR")}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-[10px] text-white/40 italic">
                      Henüz kayıtlı bir ban olayı bulunmamaktadır.
                    </p>
                  )}
                </div>
              </div>
            </div>
  );
}

// ─── TAB 5: GERİ BİLDİRİM (yanıt + e-posta) ─────────────
