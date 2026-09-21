// ═══════════════════════════════════════════════════════════
// MaintenanceScreen — bakım modu tam ekranı
// ★ Canlı geri sayım: "yaklaşık 8 dakika sonra açılacaktır"
//   metni her 15 saniyede bir kendiliğinden güncellenir; süre
//   bittiğinde sayfa otomatik yenilenir ve site açılır.
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { pushDestekliyor, pushAboneOl } from "../utils/pushClient";

export interface MaintenanceScreenProps {
  message: string;
  endsAt: string | null;
}

// Kalan süreyi Türkçe okunur metne çevirir
export function kalanSureMetni(endsAt: string, now: number = Date.now()): string {
  const kalanMs = new Date(endsAt).getTime() - now;
  if (kalanMs <= 0) return "şimdi açılıyor";
  const toplamDakika = Math.max(1, Math.ceil(kalanMs / 60000));
  const saat = Math.floor(toplamDakika / 60);
  const dakika = toplamDakika % 60;
  if (saat >= 1) return dakika > 0 ? `yaklaşık ${saat} saat ${dakika} dakika sonra açılacaktır` : `yaklaşık ${saat} saat sonra açılacaktır`;
  return `yaklaşık ${toplamDakika} dakika sonra açılacaktır`;
}

export function MaintenanceScreen({ message, endsAt }: MaintenanceScreenProps) {
  const [simdi, setSimdi] = useState(() => Date.now());
  const [haberIsteniyor, setHaberIsteniyor] = useState(false);
  const [haberDurum, setHaberDurum] = useState<"bos" | "kaydediliyor" | "tamam" | "hata">("bos");
  const [haberMesaj, setHaberMesaj] = useState("");

  // ★ BAKIM BİTİNCE HABER VER — checkbox: push aboneliği kurup
  //   aboneliği notify_maintenance=true ile sunucuya kaydeder.
  const haberVerKaydet = async () => {
    if (haberIsteniyor || haberDurum === "kaydediliyor") return;
    if (!pushDestekliyor()) { setHaberDurum("hata"); setHaberMesaj("Tarayıcın bildirimleri desteklemiyor"); return; }
    setHaberDurum("kaydediliyor");
    const sonuc = await pushAboneOl();
    if (sonuc.ok) {
      // Abonelik kuruldu — sunucu tarafında onayı işaretle
      try {
        const reg = await navigator.serviceWorker.ready;
        const abonelik = await reg.pushManager.getSubscription();
        const json = abonelik?.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } } | undefined;
        if (json?.endpoint && json.keys?.p256dh && json.keys?.auth) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, notify_maintenance: true }),
          });
          setHaberIsteniyor(true);
          setHaberDurum("tamam");
          setHaberMesaj("");
          return;
        }
      } catch { /* aşağıya düş */ }
      setHaberDurum("hata"); setHaberMesaj("Kayıt tamamlanamadı — tekrar dene");
    } else {
      setHaberDurum("hata"); setHaberMesaj(sonuc.error ?? "Bildirim izni verilmedi");
    }
  };

  // 15 saniyede bir kalan süreyi tazele
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setSimdi(Date.now());
    const interval = window.setInterval(tick, 15000);
    return () => window.clearInterval(interval);
  }, [endsAt]);

  // Süre dolduysa sayfayı bir kez yenile — kullanıcı siteyi kendisi beklemesin
  const sureDoldu = !!endsAt && new Date(endsAt).getTime() <= simdi;
  useEffect(() => {
    if (!sureDoldu) return;
    const timer = window.setTimeout(() => window.location.reload(), 4000);
    return () => window.clearTimeout(timer);
  }, [sureDoldu]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 text-center">
      <div className="max-w-md rounded-3xl border border-amber-300/30 bg-white/[.05] p-8 shadow-2xl">
        <div className="mb-4 text-4xl">🔧</div>
        <h1 className="text-xl font-black text-white">Nûr Stüdyo kısa süreli bakımda</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/65">{message}</p>
        {endsAt && !sureDoldu && (
          <p className="mt-4 text-sm font-bold text-amber-200 tabular-nums">{kalanSureMetni(endsAt, simdi)}</p>
        )}
        {sureDoldu && <p className="mt-4 text-sm font-bold text-emerald-300">Bakım tamamlandı — site açılıyor…</p>}
        {endsAt && !sureDoldu && <p className="mt-2 text-[10px] text-white/35">Tahmini bitiş: {new Date(endsAt).toLocaleString("tr-TR")}</p>}

        {/* ★ BAKIM BİTİNCE HABER VER — push bildirim onayı */}
        {!haberIsteniyor && haberDurum !== "tamam" ? (
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-[11px] text-white/60 hover:text-white/90 transition">
            <input
              type="checkbox"
              checked={haberIsteniyor}
              onChange={haberVerKaydet}
              disabled={haberDurum === "kaydediliyor"}
              className="h-4 w-4 cursor-pointer accent-amber-400"
            />
            {haberDurum === "kaydediliyor" ? "Kaydediliyor…" : "🔔 Bakım bitince haber ver"}
          </label>
        ) : haberDurum === "tamam" && (
          <p className="mt-4 text-[11px] font-bold text-emerald-300">✅ Tamam — bakım bitince bildirim alacaksın</p>
        )}
        {haberDurum === "hata" && haberMesaj && <p className="mt-2 text-[10px] text-red-300/80">⚠️ {haberMesaj}</p>}
        <p className="mt-5 text-[10px] text-white/35">Güncelleme tamamlandığında site otomatik olarak açılacaktır.</p>
      </div>
    </div>
  );
}
