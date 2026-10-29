import { translate } from "../i18n";
// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);

// ════════════════════════════════════════════════════════
// STUDIOAPPBOLUMLER.TSX — StudioApp tam-ekran blokları
// StudioApp.tsx'den ayrıldı (SRP adım 12, 30.09)
// Üretim Onay Balonu · Ban Engel Ekranı · Akıllı Hata Kılavuzu
// ════════════════════════════════════════════════════════

import React from "react";
import { X, AlertTriangle, Ban, Zap, ShieldAlert } from "lucide-react";
import type { DebugGuideMessage } from "../debugGuide";
import { ModalsContainer } from "./ModalsContainer";
import { denemeKalan, denemeAktifMi, DENEME_TOPLAM } from "../studio/deneme";

interface GenConfirmData { mode: string; formatCount: number; cost: number; remaining: number }

// ── ★ TELİF RİSK ONAYI — high-risk kâri bilgilendirilmiş onayı (09.10) ──
// Pro/Elit üye, telif riski %30 ÜZERİ bir kâriyle üretim yapmadan ÖNCE
// ayrı bir bilgilendirilmiş-onay penceresi görür. Kabul ederse bu kâri
// cihazda kalıcı kaydedilir — bir daha sorulmaz (KVKK/AB „bilgilendirilmiş
// rıza" akışı; kullanıcının kendisi sorumluluğu üstlenir).
export const RISK_ONAY_ESIGI = 30;

export function TelifRiskOnayBalonu({
  reciterName,
  riskPercent,
  onConfirm,
}: {
  reciterName: string;
  riskPercent: number;
  onConfirm: (ok: boolean) => void;
}) {
  const YEREL_KEY = `nur_telif_risk_onay_${reciterName}`;
  const prevState = React.useRef<string | null>(null);
  React.useEffect(() => {
    // İşaretlenmiş kâri için onayı kalıcı kayıt et — bir daha sorulmasın
    prevState.current = null;
    try { prevState.current = localStorage.getItem(YEREL_KEY); } catch { prevState.current = null; }
    if (prevState.current === "1") onConfirm(true);
  }, [reciterName]);

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => onConfirm(false)}>
      <div className="glass modal-in max-w-sm w-[90%] rounded-3xl border border-amber-500/30 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="font-display text-base font-black text-white">{ttX2610("rsRiskYuksek")}</h3>
            <p className="text-[10px] text-white/50">{ttX2610("rsOnay")}</p>
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-2xl bg-black/30 p-4 text-[11px]">
          <p className="text-white/70">
            <span className="font-black text-white">{reciterName}</span> kârisinin telif riski{" "}
            <span className="font-black text-amber-400">{ttX2610("rsYuksek")}</span>.{" "}
            Bu kâriyle üretim yaparsanız:
          </p>
          <ul className="list-none space-y-1 text-white/60">
            <li>{ttX2610("rsYoutube")}</li>
            <li>{ttX2610("rsKalkabilir")}</li>
            <li>{ttX2610("rsSorumluluk")}</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(false)}
            className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            {ttX2610("mcbVazgec")}
          </button>
          <button
            onClick={() => { try { localStorage.setItem(YEREL_KEY, "1"); } catch { /* yoksay */ } onConfirm(true); }}
            className="flex-1 rounded-xl bg-amber-500/30 border border-amber-500/40 px-4 py-2.5 text-[11px] font-black text-amber-300 transition hover:bg-amber-500/40"
          >
            Riski Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ★ ÜRETİM ONAY BALONU — free/pro maliyet uyarısı ──
// ★ 29.10 DÜRÜST KAYNAK GÖSTERİMİ (kullanıcı: "2. yazandan düşmedi, 1. yazandan düştü"):
//   balon HER DURUMDA jeton projeksiyonunu yazıyordu — lansman bedava hakkı (deneme)
//   aktifken bile "jeton 150→149" diyordu, oysa sunucu (nur_consume_video RPC) üretimi
//   ÖNCE deneme hakkından (5 bedava) düşer, jetona dokunmaz. Artık deneme aktifse
//   balon açıkça bedava kaynağı gösterir; jeton satırı yalnız gerçek jeton kapısında.
export function UretimOnayBalonu({
  genConfirmData,
  handleGenConfirm,
}: {
  genConfirmData: GenConfirmData;
  handleGenConfirm: (ok: boolean) => void;
}) {
  const denemeHakkiAktif = denemeAktifMi() && (denemeKalan() ?? 0) > 0;
  return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => handleGenConfirm(false)}>
          <div className="glass modal-in max-w-sm w-[90%] rounded-3xl border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}>
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-display text-base font-black text-white">{ttX2610("rsOnayBaslik")}</h3>
                <p className="text-[10px] text-white/50">Maliyet bilgisi</p>
              </div>
            </div>

            <div className="mb-4 space-y-2 rounded-2xl bg-black/30 p-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">{ttX2610("rsTur")}</span>
                <span className="font-bold text-white">{genConfirmData.mode === "short" ? ttX2610("rsKisa") : genConfirmData.mode === "long" ? ttX2610("rsUzun") : ttX2610("rsTam")}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">{ttX2610("rsFormat")}</span>
                <span className="font-bold text-white">{genConfirmData.formatCount} {ttX2610("rsAdet")}</span>
              </div>
              <div className="my-2 h-px bg-white/10" />
              {denemeHakkiAktif ? (
                <>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-white/70">{ttX2610("rsKaynak")}</span>
                    <span className="font-black" style={{ color: "var(--accent-2)" }}>🎁 {ttX2610("rsDenemeKaynak")}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/50">{ttX2610("rsKalanLansman")}</span>
                    <span className="font-bold text-white">{denemeKalan()} / {DENEME_TOPLAM}</span>
                  </div>
                  <p className="rounded-xl bg-emerald-400/10 px-3 py-1.5 text-[9px] font-bold text-emerald-300/90 text-center">✓ {ttX2610("rsDenemeNot")}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-white/70">{ttX2610("rsJetonHarca")}</span>
                    <span className="font-black" style={{ color: "var(--accent)" }}>{genConfirmData.cost} ⚡</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/50">{ttX2610("rsJetonKalan")}</span>
                    <span className="font-bold text-white">{genConfirmData.remaining} ⚡</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/50">{ttX2610("rsSonra")}</span>
                    <span className="font-bold" style={{ color: genConfirmData.remaining - genConfirmData.cost <= 0 ? "#ef4444" : "var(--accent-2)" }}>
                      {Math.max(0, genConfirmData.remaining - genConfirmData.cost)} ⚡
                    </span>
                  </div>
                </>
              )}
            </div>

            {!denemeHakkiAktif && genConfirmData.remaining - genConfirmData.cost <= 0 && (
              <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-300 text-center">
                ⚠️ Jetonun yetersiz! {ttX2610("rsSonra")} bakiyen 0 olacak.
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleGenConfirm(false)}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={() => handleGenConfirm(true)}
                className="flex-1 rounded-xl px-4 py-2.5 text-[11px] font-black text-white transition shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent))" }}
              >
                {denemeHakkiAktif ? `Üret · ${ttX2610("rsBedava")}` : `Üret ⚡ ${genConfirmData.cost}`}
              </button>
            </div>
          </div>
        </div>
  );
}

// ── ⛔ SÜRESİZ BAN ENGEL EKRANI ──
export function BanEngelEkrani({ localBanReason }: { localBanReason: string }) {
  return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-2xl text-center modal-in select-none">
          <div
            className="glass relative max-w-md w-full rounded-3xl p-8 border text-center space-y-4 shadow-2xl"
            style={{ borderColor: "rgba(239, 68, 68, 0.5)", background: "linear-gradient(160deg, rgba(127,29,29,0.3) 0%, rgba(12,13,18,0.98) 100%)" }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-xl animate-pulse">
              <Ban size={36} strokeWidth={2.5} />
            </div>

            <div>
              <span className="rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-300">
                ERİŞİM SÜRESİZ DONDURULDU
              </span>
              <h2 className="font-display text-xl font-black text-white mt-3 tracking-wide">
                SİSTEM ERİŞİMİNİZ ENGELLENMİŞTİR
              </h2>
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-black/60 p-4 text-left space-y-1.5">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-red-400">
                Yasal Suç / İhlal Gerekçesi:
              </div>
              <p className="text-[11.5px] font-semibold text-white/90 leading-relaxed">
                "{localBanReason}"
              </p>
            </div>

            <p className="text-[10px] leading-relaxed text-white/45">
              Hesabınız yasal suç veya platform güvenlik şartlarının ihlali nedeniyle süresiz olarak askıya alınmıştır. Ban itirazları ve yasal talepleriniz için <b className="text-white/80">destek@nurstudyo.com</b> adresiyle iletişime geçebilirsiniz.
            </p>

            <div className="pt-2 text-[9px] font-mono text-white/30 border-t border-white/10">
              nurstudyo.com · Siber Güvenlik Denetim Protokolü
            </div>
          </div>
        </div>
  );
}

// ── ★ AKILLI HATA KILAVUZU MODALI ──
export function HataKilavuzModal({
  debugGuideModal,
  setDebugGuideModal,
}: {
  debugGuideModal: DebugGuideMessage;
  setDebugGuideModal: (v: DebugGuideMessage | null) => void;
}) {
  return (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md modal-in"
          onMouseDown={() => setDebugGuideModal(null)}
          onClick={() => setDebugGuideModal(null)}
        >
          <div
            className="glass modal-in relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ border: "1px solid rgba(215,170,82,.35)" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDebugGuideModal(null)}
              className="absolute right-3 top-3 rounded-full bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}>
                <AlertTriangle size={18} />
              </span>
              <div>
                <h3 className="font-display text-sm font-black tracking-wider" style={{ color: "var(--accent-2)" }}>
                  {debugGuideModal.title}
                </h3>
                <p className="text-[9.5px] text-white/40">{debugGuideModal.subtitle}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-[11px] leading-relaxed text-white/80">
              {debugGuideModal.steps.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3 font-semibold text-white/90">
                  {step}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setDebugGuideModal(null);
                window.location.reload();
              }}
              className="mt-5 w-full rounded-xl py-3 text-[11px] font-black uppercase tracking-wider text-black"
              style={{ background: "linear-gradient(135deg,var(--accent-2),var(--accent))" }}
            >
              Sayfayı Yenile (F5)
            </button>
          </div>
        </div>
  );
}


// ── 🎬 TAM SAYFA RENDER KAPLANMA EKRANI (25.10 parçalama — StudioApp'ten taşındı) ──
export function RenderKaplanmaEkran({ progress, onIptal }: { progress: number; onIptal: () => void }) {
  return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-md text-center select-none modal-in">
          <div className="max-w-md w-full rounded-3xl border border-gold/30 bg-slate-950/80 p-8 shadow-2xl space-y-5">
            {/* Altın renkli lüks parlayan yükleme efekti */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-gold/30 text-gold shadow-xl">
              <span className="absolute inset-0 rounded-3xl border-2 border-gold border-t-transparent animate-spin"></span>
              <span className="text-xl font-bold animate-pulse">🎬</span>
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-300 animate-pulse">
                {ttX2610("rsSistemModu")}
              </span>
              <h2 className="font-display text-lg font-black text-white leading-normal">
                {ttX2610("rsSekmeKapatma")}
              </h2>
            </div>

            <p className="text-[11.5px] leading-relaxed text-white/70">
              {ttX2610("rsBirlestirmeUyari")}<b className="text-gold">{ttX2610("rsVideoDonma")}</b>{ttX2610("rsBirlestirmeSon")}
            </p>

            {/* İlerleme çubuğu */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-white/50">
                <span>{ttX2610("rsVideoIsleniyor")}</span>
                <span className="text-gold font-black font-mono">%{progress}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={onIptal}
                className="w-full rounded-xl bg-red-500/10 border border-red-500/30 py-3 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20 active:scale-98"
              >
                {ttX2610("rsIptalBtn")}
              </button>
              <p className="text-[9.5px] text-white/35 font-medium leading-normal">
                {ttX2610("rsIptalNot")}
              </p>
            </div>
          </div>
        </div>
  );
}

// ── ★ MODAL KAPSA — 25.10 parçalama: StudioApp'teki 125 satırlık ModalsContainer
//    çağrı bloğu buraya taşındı; üç kanca-objesinin (çekirdek/atmosfer/seçim)
//    içindeki isimler birebir ModalsContainer'a düşer, eksikler `ekstra` ile beslenir.
export const ModalsKatman: React.FC<{
  cekirdek: object;
  arka: object;
  secici: object;
  ekstra: object;
}> = ({ cekirdek, arka, secici, ekstra }) => (
  <ModalsContainer
    {...(cekirdek as Parameters<typeof ModalsContainer>[0])}
    {...(arka as Parameters<typeof ModalsContainer>[0])}
    {...(secici as Parameters<typeof ModalsContainer>[0])}
    {...(ekstra as Parameters<typeof ModalsContainer>[0])}
  />
);
