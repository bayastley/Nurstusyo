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
export function AdminFeedbackTab({
  feedbackStats,
  feedbackList,
  feedbackLoading,
  loadFeedback,
  feedbackYanitAcik,
  setFeedbackYanitAcik,
  feedbackYanitMetni,
  setFeedbackYanitMetni,
  feedbackYanitYukleniyor,
  feedbackYanitGonder,
}: {
  feedbackStats: { turDagilimi: Record<string, number>; puanDagilimi: Record<number, number>; puanOrtalama: number; toplam: number } | null;
  feedbackList: any[];
  feedbackLoading: boolean;
  loadFeedback: () => void;
  feedbackYanitAcik: number | null;
  setFeedbackYanitAcik: (v: number | null) => void;
  feedbackYanitMetni: string;
  setFeedbackYanitMetni: (v: string) => void;
  feedbackYanitYukleniyor: number | null;
  feedbackYanitGonder: (fbId: number) => Promise<void>;
}) {
  return (
            <div className="space-y-4">
              {/* Özet: toplam + ortalama puan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-300">{feedbackStats?.toplam ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">ttX2610("adbToplamGorus")</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-black text-amber-300">{feedbackStats?.puanOrtalama ? `${feedbackStats.puanOrtalama} ⭐` : "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Ortalama puan</p>
                </div>
              </div>

              {/* ttX2610("adbTurDagilimi") */}
              {feedbackStats && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/45">ttX2610("adbTurDagilimi")</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">💡 Öneri: {feedbackStats.turDagilimi.oneri ?? 0}</span>
                    <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300">✨ Özellik: {feedbackStats.turDagilimi.ozellik ?? 0}</span>
                    <span className="rounded-lg bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-300">😔 Şikayet: {feedbackStats.turDagilimi.sikayet ?? 0}</span>
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">✉️ Diğer: {feedbackStats.turDagilimi.diger ?? 0}</span>
                  </div>
                  <p className="mb-2 mt-3 text-[9px] font-bold uppercase tracking-widest text-white/45">ttX2610("adbPuanDagilimi")</p>
                  {[5, 4, 3, 2, 1].map((n) => {
                    const adet = feedbackStats.puanDagilimi[n] ?? 0;
                    const yuzde = feedbackStats.toplam ? Math.round((adet / feedbackStats.toplam) * 100) : 0;
                    return (
                      <div key={n} className="mb-1 flex items-center gap-2">
                        <span className="w-8 text-[10px] text-white/50">{n} ⭐</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full" style={{ width: `${yuzde}%`, background: "linear-gradient(90deg,#fbbf24,#d97706)" }} />
                        </div>
                        <span className="w-8 text-right text-[10px] text-white/50">{adet}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Yenile */}
              <button onClick={loadFeedback} disabled={feedbackLoading}
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
                {feedbackLoading ? "Yükleniyor…" : "↻ Yenile"}
              </button>

              {/* Mesaj listesi — mesaj başına admin yanıtı + e-posta gönderimi */}
              <div className="space-y-2">
                {feedbackList.length > 0 ? feedbackList.map((fb) => {
                  const turRenk = fb.tur === "sikayet" ? "text-red-300" : fb.tur === "ozellik" ? "text-sky-300" : fb.tur === "oneri" ? "text-amber-300" : "text-white/60";
                  const turEtiket = fb.tur === "sikayet" ? "😔 Şikayet" : fb.tur === "ozellik" ? "✨ Özellik" : fb.tur === "oneri" ? "💡 Öneri" : "✉️ Diğer";
                  const yanitAcik = feedbackYanitAcik === fb.id;
                  const buYanitYukleniyor = feedbackYanitYukleniyor === fb.id;
                  return (
                    <div key={fb.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${turRenk}`}>{turEtiket}{fb.puan ? ` · ${"⭐".repeat(fb.puan)}` : ""}</span>
                        <span className="shrink-0 text-[8.5px] text-white/40">{new Date(fb.created_at).toLocaleString("tr-TR")}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-white/80">{fb.mesaj}</p>
                      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1 text-[8.5px] text-white/40">
                        <span>{fb.user_name || fb.user_email ? `${fb.user_name ? fb.user_name + " · " : ""}${fb.user_email || ""}` : "👻 Misafir kullanıcı (e-posta yok — yanıt yalnız kaydedilir)"}</span>
                        <button
                          onClick={() => { setFeedbackYanitAcik(yanitAcik ? null : fb.id); setFeedbackYanitMetni(fb.admin_yanit || ""); }}
                          className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 font-black text-amber-300 transition hover:bg-amber-500/25"
                        >
                          {fb.admin_yanit ? "✏️ Yanıtı düzenle" : "↩️ Yanıtla"}
                        </button>
                      </div>
                      {/* ★ MEVCUT YANIT GÖRÜNÜMÜ */}
                      {fb.admin_yanit && !yanitAcik && (
                        <div className="rounded-lg border border-amber-400/25 bg-amber-500/[.06] p-2">
                          <p className="flex items-center justify-between gap-2 text-[8.5px] font-black uppercase tracking-wider text-amber-300">
                            <span>ttX2610("adbVerilenYanit")</span>
                            <span className="flex items-center gap-1 font-bold normal-case tracking-normal">
                              {fb.mail_gonderildi
                                ? <span className="rounded bg-emerald-500/20 px-1.5 py-px text-emerald-300">ttX2610("adbMailGitti")</span>
                                : <span className="rounded bg-red-500/15 px-1.5 py-px text-red-300" title={fb.mail_hata || ""}>📧 gönderilemedi{fb.mail_hata ? `: ${fb.mail_hata}` : ""}</span>}
                            </span>
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-white/75">{fb.admin_yanit}</p>
                          <p className="mt-1 text-right text-[7.5px] text-white/30">{fb.yanit_admin ? `${fb.yanit_admin} · ` : ""}{fb.yanit_at ? new Date(fb.yanit_at).toLocaleString("tr-TR") : ""}</p>
                        </div>
                      )}
                      {/* ★ YANIT YAZMA KUTUSU */}
                      {yanitAcik && (
                        <div className="rounded-lg border border-amber-400/30 bg-amber-500/[.05] p-2 space-y-1.5">
                          <textarea
                            value={feedbackYanitMetni}
                            onChange={(e) => setFeedbackYanitMetni(e.target.value)}
                            maxLength={2000}
                            rows={4}
                            placeholder={ttX2610("adbYanitP")}
                            className="w-full resize-none rounded-lg border border-white/10 bg-black/40 p-2 text-[10.5px] text-white/85 outline-none placeholder:text-white/25 focus:border-amber-400/50"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] text-white/30">{feedbackYanitMetni.length}/2000 · {fb.user_email ? `📧 ${fb.user_email}` : "⚠️ misafir — e-posta gönderilemez"}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => { setFeedbackYanitAcik(null); setFeedbackYanitMetni(""); }}
                                className="rounded-md bg-white/10 px-2.5 py-1 font-bold text-white/60 transition hover:bg-white/20">{ttX2610("rmIptal")}</button>
                              <button
                                disabled={buYanitYukleniyor || !feedbackYanitMetni.trim()}
                                onClick={() => void feedbackYanitGonder(fb.id)}
                                className="rounded-md bg-amber-500 px-3 py-1 font-black text-black transition hover:brightness-110 disabled:opacity-40"
                              >
                                {buYanitYukleniyor ? "Gönderiliyor…" : "Yanıtla & E-posta Gönder 📧"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="p-6 text-center text-[10px] text-white/40 italic">
                    {feedbackLoading ? "Yükleniyor…" : "Henüz geri bildirim yok — kutu footer'da 💬"}
                  </p>
                )}
              </div>
            </div>
  );
}

// ─── HATA LOGLARI (filtre + sayfalama + endpoint kırılımı + alarm) ───
