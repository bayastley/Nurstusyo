// ════════════════════════════════════════════════════════
// ADMINDASHBOARD BOLUMLER — AdminDashboardModal sekme bileşenleri
// AdminDashboardModal.tsx'den ayrıldı (SRP adım 10, 30.09)
// BanLogs · Feedback (yanıtlı) · Errors (filtre+sayfalama+alarm)
// ════════════════════════════════════════════════════════

import React from "react";
import { Ban, Lightbulb, UserCheck } from "lucide-react";
import type { BanLog } from "../services/adminSyncService";

// ─── TAB 4: BAN & SİBER DENETİM LOGLARI ─────────────────
export function AdminBanLogsTab({ banLogs }: { banLogs: BanLog[] }) {
  return (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                    <Lightbulb size={18} className="animate-pulse" fill="currentColor" />
                  </span>
                  <div>
                    <h4 className="text-[12px] font-black text-white">Siber Denetim ve Ban Geçmişi Kayıtları</h4>
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
                          <b>Gerekçe / Yasal Suç:</b> {log.reason}
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
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Toplam görüş</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-black text-amber-300">{feedbackStats?.puanOrtalama ? `${feedbackStats.puanOrtalama} ⭐` : "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Ortalama puan</p>
                </div>
              </div>

              {/* Tür dağılımı */}
              {feedbackStats && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/45">Tür dağılımı</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">💡 Öneri: {feedbackStats.turDagilimi.oneri ?? 0}</span>
                    <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300">✨ Özellik: {feedbackStats.turDagilimi.ozellik ?? 0}</span>
                    <span className="rounded-lg bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-300">😔 Şikayet: {feedbackStats.turDagilimi.sikayet ?? 0}</span>
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60">✉️ Diğer: {feedbackStats.turDagilimi.diger ?? 0}</span>
                  </div>
                  <p className="mb-2 mt-3 text-[9px] font-bold uppercase tracking-widest text-white/45">Puan dağılımı</p>
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
                            <span>↩️ Verilen yanıt</span>
                            <span className="flex items-center gap-1 font-bold normal-case tracking-normal">
                              {fb.mail_gonderildi
                                ? <span className="rounded bg-emerald-500/20 px-1.5 py-px text-emerald-300">📧 e-posta gönderildi</span>
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
                            placeholder="Kullanıcıya yanıtını yaz — gönderince e-posta olarak gider…"
                            className="w-full resize-none rounded-lg border border-white/10 bg-black/40 p-2 text-[10.5px] text-white/85 outline-none placeholder:text-white/25 focus:border-amber-400/50"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] text-white/30">{feedbackYanitMetni.length}/2000 · {fb.user_email ? `📧 ${fb.user_email}` : "⚠️ misafir — e-posta gönderilemez"}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => { setFeedbackYanitAcik(null); setFeedbackYanitMetni(""); }}
                                className="rounded-md bg-white/10 px-2.5 py-1 font-bold text-white/60 transition hover:bg-white/20">İptal</button>
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
export function AdminErrorsTab({
  errorLogs,
  errorStats,
  errorLoading,
  loadErrorLogs,
  errorFilter,
  setErrorFilter,
  errorPage,
  setErrorPage,
  errorGrouped,
  setErrorGrouped,
  deleteErrorLog,
  clearAllErrorLogs,
  notify,
}: {
  errorLogs: any[];
  errorStats: { total24h: number; unique24h: number; turDagilimi?: Record<string, number> } | null;
  errorLoading: boolean;
  loadErrorLogs: () => void;
  errorFilter: string;
  setErrorFilter: (v: string) => void;
  errorPage: number;
  setErrorPage: (v: number) => void;
  errorGrouped: boolean;
  setErrorGrouped: (v: boolean) => void;
  deleteErrorLog: (id: unknown) => Promise<void>;
  clearAllErrorLogs: () => Promise<void>;
  notify: (m: string) => void;
}) {
  return (() => {
            // ★ SAYFALAMA + FİLTRE: her sayfada 10 kayıt, sayfa sayfa gezilir
            const PAGE_SIZE = 10;
            const turEtiketleri: Record<string, string> = {
              video: "🎬 Video", payment: "💳 Ödeme", auth: "🔐 Giriş", upload: "☁️ Yükleme", audio: "🎧 Ses", network: "🌐 Bağlantı", genel: "⚠️ Genel",
            };
            const turRenkleri: Record<string, string> = {
              video: "bg-purple-500/15 text-purple-300 border-purple-500/30",
              payment: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
              auth: "bg-sky-500/15 text-sky-300 border-sky-500/30",
              upload: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
              audio: "bg-pink-500/15 text-pink-300 border-pink-500/30",
              network: "bg-orange-500/15 text-orange-300 border-orange-500/30",
              genel: "bg-white/10 text-white/60 border-white/20",
            };
            const okunurMesaj = (msg: string): string => {
              const m = String(msg || "");
              if (/failed to fetch|networkerror|network error/i.test(m)) return "İnternet bağlantısı kesildi — istek sunucuya ulaşamadı";
              if (/401|unauthorized|yetkisiz/i.test(m)) return "Oturum süresi doldu — kullanıcı yeniden giriş yapmalı";
              if (/403|forbidden/i.test(m)) return "Yetkisiz işlem denemesi";
              if (/404/i.test(m)) return "Aranan kaynak bulunamadı";
              if (/429|too many/i.test(m)) return "Çok fazla istek — hız limiti devreye girdi";
              if (/500|internal server/i.test(m)) return "Sunucu hatası — Vercel fonksiyonu patladı";
              if (/mediarecorder|canvas|capturestream|render/i.test(m)) return "Video oluşturma (render) sırasında tarayıcı kısıtı";
              if (/iyzico|payment|checkout/i.test(m)) return "Ödeme akışında sorun";
              if (/supabase/i.test(m)) return "Veritabanı bağlantı sorunu";
              if (/storage|quota|bellek|memory/i.test(m)) return "Bellek/disk sınırı aşıldı";
              return m.length > 90 ? m.slice(0, 90) + "…" : m;
            };
            // ★ GRUPLAMA: aynı fingerprint'ten EN YENİSİ + ×N sayacı + İLK GÖRÜLME zamanı
            const grupla = (list: any[]) => {
              const map = new Map<string, { log: any; adet: number; ilkZaman: string }>();
              // liste created_at.desc sıralı — döngü biterken ilkZaman en eski kayıt olur
              let sonSonuc: { log: any; adet: number; ilkZaman: string }[] = [];
              const temp = new Map<string, { log: any; adet: number; ilkZaman: string }>();
              for (const l of list) {
                const key = String(l.fingerprint || l.id);
                const cur = temp.get(key);
                if (cur) { cur.adet++; cur.ilkZaman = l.created_at; } // desc sıralı → son gelen en eski
                else temp.set(key, { log: l, adet: 1, ilkZaman: l.created_at });
              }
              sonSonuc = [...temp.values()];
              return sonSonuc;
            };
            const ham = errorFilter === "all"
              ? errorLogs
              : errorFilter === "unique"
                ? errorLogs.filter((l, i, arr) => arr.findIndex((x) => x.fingerprint === l.fingerprint) === i)
                : errorFilter === "server"
                  ? errorLogs.filter((l) => String(l.source || "").startsWith("server:"))
                  : errorFilter === "browser"
                    ? errorLogs.filter((l) => !String(l.source || "").startsWith("server:"))
                    : errorLogs.filter((l) => String(l.kind || "genel") === errorFilter);
            const gorunen: any[] = errorGrouped && errorFilter !== "unique"
              ? grupla(ham).map((g) => ({ ...g.log, __adet: g.adet, __ilk: g.ilkZaman }))
              : ham;
            const sayfaSayisi = Math.max(1, Math.ceil(gorunen.length / PAGE_SIZE));
            const guvenliSayfa = Math.min(errorPage, sayfaSayisi - 1);
            const sayfadaki = gorunen.slice(guvenliSayfa * PAGE_SIZE, guvenliSayfa * PAGE_SIZE + PAGE_SIZE);
            const turlar = Array.from(new Set(errorLogs.map((l) => String(l.kind || "genel"))));
            return (
            <div className="space-y-4">
              {/* İstatistik özeti — BUTONLAR: tıklayınca filtre uygular */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setErrorFilter("all"); setErrorPage(0); }}
                  className={`rounded-2xl border p-4 text-center transition ${errorFilter === "all" ? "border-amber-400/60 bg-amber-500/20 ring-1 ring-amber-400/40" : "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"}`}>
                  <p className="text-2xl font-black text-amber-300">{errorStats?.total24h ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Son 24 saat · toplam</p>
                </button>
                <button onClick={() => { setErrorFilter("unique"); setErrorPage(0); }}
                  className={`rounded-2xl border p-4 text-center transition ${errorFilter === "unique" ? "border-white/40 bg-white/15 ring-1 ring-white/30" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                  <p className="text-2xl font-black text-white">{errorStats?.unique24h ?? "—"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Benzersiz hata</p>
                </button>
              </div>

              {/* ★ SUNUCU / TARAYICI ayrım filtresi — 🖥️ server hataları tek tıkla */}
              {(() => {
                const serverAdet = errorLogs.filter((l) => String(l.source || "").startsWith("server:")).length;
                if (serverAdet === 0 && errorFilter !== "server") return null;
                const butonlar = [
                  { key: "server", etiket: `🖥️ Sunucu · ${serverAdet}`, stil: "border-red-500/40 bg-red-500/15 text-red-300" },
                  { key: "browser", etiket: `🌐 Tarayıcı · ${errorLogs.length - serverAdet}`, stil: "border-sky-500/40 bg-sky-500/15 text-sky-300" },
                ];
                return (
                  <div className="flex flex-wrap gap-2">
                    {butonlar.map((b) => (
                      <button key={b.key} onClick={() => { setErrorFilter(b.key); setErrorPage(0); }}
                        className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${errorFilter === b.key ? b.stil + " ring-1 ring-white/40" : b.stil + " opacity-60 hover:opacity-100"}`}>
                        {b.etiket}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* ★ ENDPOINT KIRILIMI — 🖥️ Sunucu filtresi seçiliyken hangi API kaç hata vermiş, çoktan aza sıralı */}
              {errorFilter === "server" && (() => {
                const endpointMap = new Map<string, { adet: number; sonZaman: string }>();
                for (const l of errorLogs) {
                  const src = String(l.source || "");
                  if (!src.startsWith("server:")) continue;
                  const ep = src.slice(7) || "bilinmeyen";
                  const cur = endpointMap.get(ep);
                  if (cur) { cur.adet++; if (l.created_at > cur.sonZaman) cur.sonZaman = l.created_at; }
                  else endpointMap.set(ep, { adet: 1, sonZaman: l.created_at });
                }
                const sirali = [...endpointMap.entries()].sort((a, b) => b[1].adet - a[1].adet);
                if (sirali.length === 0) return null;
                const enCok = sirali[0][1].adet;
                return (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/[.06] p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-red-300">
                      <span>🖥️</span> Endpoint Kırılımı — hangi API kaç hata verdi
                      <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[8px] font-black text-red-300">{sirali.length} endpoint</span>
                    </p>
                    <div className="space-y-1.5">
                      {sirali.map(([ep, bilgi]) => (
                        <button
                          key={ep}
                          onClick={() => notify(`🔍 ${ep} — son hata: ${new Date(bilgi.sonZaman).toLocaleString("tr-TR")}`)}
                          className="group block w-full text-left"
                          title={`${ep} · ${bilgi.adet} hata · son: ${new Date(bilgi.sonZaman).toLocaleString("tr-TR")}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-20 shrink-0 truncate font-mono text-[9px] font-bold text-white/75 group-hover:text-white">/{ep}{bilgi.adet === enCok && <span title="En çok hata veren endpoint"> 👑</span>}</span>
                            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[.06]">
                              <span
                                className="block h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.max(6, Math.round((bilgi.adet / enCok) * 100))}%`,
                                  background: "linear-gradient(90deg,#ef4444,#f87171)",
                                }}
                              />
                            </span>
                            <span className={`w-8 shrink-0 text-right text-[9.5px] font-black ${bilgi.adet === enCok ? "text-red-300" : "text-white/55"}`}>{bilgi.adet}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[8px] text-white/35">Çubuk uzunluğu = hata sayısı oranı · en üstte en çok hata veren endpoint · tıkla → son hata zamanını gör</p>
                  </div>
                );
              })()}

              {/* ★ ALARM BANDI — 24 saatte sunucu hatası 10'u aşarsa kırmızı uyarı + en çok hata veren endpoint */}
              {(() => {
                const serverAdet = errorLogs.filter((l) => String(l.source || "").startsWith("server:")).length;
                if (serverAdet <= 10) return null;
                const endpointMap = new Map<string, number>();
                for (const l of errorLogs) {
                  const src = String(l.source || "");
                  if (src.startsWith("server:")) endpointMap.set(src.slice(7) || "bilinmeyen", (endpointMap.get(src.slice(7) || "bilinmeyen") || 0) + 1);
                }
                const enKotu = [...endpointMap.entries()].sort((a, b) => b[1] - a[1])[0];
                return (
                  <div
                    className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-500/20 to-red-500/[.08] px-3 py-2.5"
                    role="alert"
                    style={{ boxShadow: "0 0 18px rgba(239,68,68,.25)" }}
                  >
                    <span className="animate-pulse text-base" aria-hidden>🚨</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-black text-red-200">
                        SON 24 SAATTE {serverAdet} SUNUCU HATASI — KRİTİK EŞİK (10) AŞILDI
                      </p>
                      <p className="text-[9px] text-red-200/70">
                        Sorunlu endpoint: <b className="font-mono text-red-100">/{enKotu[0]}</b> ({enKotu[1]} hata) — 🖥️ Sunucu filtresinden kırılımı incele
                      </p>
                    </div>
                    <button
                      onClick={() => { setErrorFilter("server"); setErrorPage(0); }}
                      className="shrink-0 rounded-lg bg-red-500/30 px-2.5 py-1.5 text-[9px] font-black text-red-100 transition hover:bg-red-500/50"
                    >
                      Kırılımı Gör
                    </button>
                  </div>
                );
              })()}

              {/* Tür filtresi — varsa tür butonları */}
              {turlar.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {turlar.map((t) => {
                    const adet = errorLogs.filter((l) => String(l.kind || "genel") === t).length;
                    const aktif = errorFilter === t;
                    return (
                      <button key={t} onClick={() => { setErrorFilter(t); setErrorPage(0); }}
                        className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${aktif ? turRenkleri[t] + " ring-1 ring-white/40" : turRenkleri[t] + " opacity-60 hover:opacity-100"}`}>
                        {turEtiketleri[t] || t} · {adet}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Yenile / temizle */}
              <div className="flex gap-2">
                <button onClick={loadErrorLogs} disabled={errorLoading}
                  className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold text-white/80 transition hover:bg-white/20 disabled:opacity-50">
                  {errorLoading ? "Yükleniyor…" : "↻ Yenile"}
                </button>
                <button onClick={() => { setErrorGrouped(!errorGrouped); setErrorPage(0); }}
                  title={errorGrouped ? "Aynı hatalar tek satırda ×N sayacıyla birleştiriliyor — tıkla, her kaydı tek tek gör" : "Kayıtlar tek tek listeleniyor — tıkla, aynı hatalar tek satırda birleşsin"}
                  className={`rounded-xl border px-3 py-2 text-[10px] font-bold transition ${errorGrouped ? "border-sky-400/40 bg-sky-500/15 text-sky-300" : "border-white/15 bg-white/5 text-white/50 hover:bg-white/10"}`}>
                  📚 {errorGrouped ? "Gruplu" : "Tek tek"}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("30 günden eski hata kayıtları silinsin mi?")) return;
                    await fetch("/api/admin/action", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "clear_errors" }) });
                    notify("Eski kayıtlar temizlendi");
                    loadErrorLogs();
                  }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-300 transition hover:bg-red-500/20">
                  🗑 Eskileri temizle
                </button>
                <button onClick={clearAllErrorLogs}
                  className="rounded-xl border border-red-500/40 bg-red-500/20 px-3 py-2 text-[10px] font-black text-red-200 transition hover:bg-red-500/30">
                  🔥 Tümünü temizle
                </button>
              </div>

              {/* Liste */}
              <div className="space-y-2">
                {sayfadaki.length > 0 ? sayfadaki.map((log) => {
                  const cihaz = String(log.user_agent || "");
                  const cihazKisa = cihaz.includes("Mobile") ? "📱 Mobil" : cihaz.includes("Tablet") ? "📟 Tablet" : "💻 Masaüstü";
                  const tarayici = cihaz.includes("Edg/") ? "Edge" : cihaz.includes("Chrome/") ? "Chrome" : cihaz.includes("Firefox/") ? "Firefox" : cihaz.includes("Safari/") ? "Safari" : "Diğer";
                  const kind = String(log.kind || "genel");
                  return (
                    <div key={log.id} className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10.5px] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-black ${turRenkleri[kind] || turRenkleri.genel}`}>{turEtiketleri[kind] || kind}</span>
                        <span className="flex-1 truncate px-1 font-bold text-amber-300" title={log.message}>{okunurMesaj(log.message)}</span>
                        {/* ★ GRUP SAYACI — aynı hata N kez tekrarladıysa ×N rozeti */}
                        {log.__adet > 1 && (
                          <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[8.5px] font-black text-sky-300" title={`Aynı hata son 500 kayıtta ${log.__adet} kez tekrarladı`}>
                            ×{log.__adet}
                          </span>
                        )}
                        <span className="flex shrink-0 items-center gap-1">
                          <span className={`rounded px-1.5 py-0.5 text-[8px] font-black ${String(log.source || "").startsWith("server:") ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/60"}`} title={String(log.source || "").startsWith("server:") ? "Sunucu (Vercel API) hatası" : "Tarayıcı hatası"}>{String(log.source || "").startsWith("server:") ? `🖥️ ${String(log.source).slice(7)}` : log.source}</span>
                          <button onClick={() => deleteErrorLog(log.id)} title="Bu kaydı sil"
                            className="rounded px-1 py-0.5 text-[8px] font-black text-white/30 transition hover:bg-red-500/20 hover:text-red-300">✕</button>
                        </span>
                      </div>
                      {/* ★ KİM YAŞADI — kullanıcı e-postası (misafirde ghost) */}
                      <div className={`flex items-center gap-1 text-[9.5px] font-bold ${log.user_email ? "text-sky-300" : "text-white/35"}`}>
                        {log.user_email ? <><UserCheck size={11} /> {log.user_email}</> : "👻 Misafir kullanıcı (giriş yapmamış)"}
                      </div>
                      {log.stack && (
                        <details className="text-white/40">
                          <summary className="cursor-pointer text-[9px] hover:text-white/70">Yığın izi (stack)</summary>
                          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-black/60 p-2 text-[8.5px] text-white/50">{log.stack}</pre>
                        </details>
                      )}
                      <div className="flex items-center justify-between text-[8.5px] text-white/40 pt-1 border-t border-white/5">
                        <span>{cihazKisa} · {tarayici} · {log.path || "/"}</span>
                        <span title={log.__ilk && log.__ilk !== log.created_at ? `İlk görülme: ${new Date(log.__ilk).toLocaleString("tr-TR")}` : undefined}>
                          {log.__ilk && log.__ilk !== log.created_at ? (
                            <>ilk: {new Date(log.__ilk).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} · son: {new Date(log.created_at).toLocaleString("tr-TR")}</>
                          ) : (
                            new Date(log.created_at).toLocaleString("tr-TR")
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="p-6 text-center text-[10px] text-white/40 italic">
                    {errorLoading ? "Yükleniyor…" : errorFilter === "all" ? "Henüz hata kaydı yok — sistem temiz çalışıyor ✨" : "Bu filtrede kayıt yok"}
                  </p>
                )}
              </div>

              {/* Sayfalama: her sayfada 10, aşağıda sayfa butonları */}
              {sayfaSayisi > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <button onClick={() => setErrorPage(Math.max(0, guvenliSayfa - 1))} disabled={guvenliSayfa === 0}
                    className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 disabled:opacity-30 hover:bg-white/20">‹</button>
                  {Array.from({ length: sayfaSayisi }, (_, i) => i).slice(Math.max(0, guvenliSayfa - 2), Math.max(0, guvenliSayfa - 2) + 5).map((i) => (
                    <button key={i} onClick={() => setErrorPage(i)}
                      className={`h-7 w-7 rounded-lg text-[10px] font-black transition ${i === guvenliSayfa ? "bg-amber-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setErrorPage(Math.min(sayfaSayisi - 1, guvenliSayfa + 1))} disabled={guvenliSayfa === sayfaSayisi - 1}
                    className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/70 disabled:opacity-30 hover:bg-white/20">›</button>
                  <span className="ml-1 text-[9px] text-white/35">{gorunen.length} kayıt · sayfa {guvenliSayfa + 1}/{sayfaSayisi}</span>
                </div>
              )}
            </div>
            );
          }
  );
}
