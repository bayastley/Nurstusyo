import React, { Suspense } from "react";

// ★ 16.10 CHUNK BÖLÜMÜ YARDIMCISI — lazy panellerin ilk yüklemesi sırasında
//   layout zıplamasın diye aynı kutu boyutlarını koruyan hafif iskeletler.
//   Yükleme genelde <100ms (aynı CDN, öncelikli fetch); fallback yalnızca
//   ilk boya ile chunk hazır olması arasındaki kısa pencerede görünür.

/** Text tabanlı paneller için (AyahLibrary ~300x640, SocialShare ~120 yükseklik) */
export function PanelSuspense({ children, minHeight = 280 }: { children: React.ReactNode; minHeight?: number }) {
  return (
    <Suspense fallback={
      <div className="space-y-2.5" style={{ minHeight }}>
        <div className="h-9 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="h-24 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

/** Video önizleme ortası için (canvas uzunluğuna sadık, mevcut boyutları korur) */
export function PreviewSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex aspect-[9/16] max-h-[70vh] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent)]" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

/** Studios hero bölümünde zaten Suspense yok — header chunk'ı küçük olduğu için
 *   header'ı da lazy YAPMADIK (ilk zengin boyama içeriğinde görünürlük şart). */
export function StudioHeroSectionLazySuspense({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
