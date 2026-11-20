import React from "react";
import type { Lang } from "../../i18n";
import { IlmihalBolumu } from "./IlmihalBolumu";
import { AHLAK_DERSLERI, AHLAK_KAYNAK_NOTU, AHLAK_TOPLAM } from "../../data/ahlakData";

// ════════════════════════════════════════════════════════
// AHLAKBOLUMU.TSX — Ahlâk ve Tasavvuf Mektebi (madde 12)
// 8 ders · 40 madde · 24 soru. IlmihalBolumu'nun ders+sınav düzenini
// yeniden kullanır; yalnız veri ve kaynak notu değişir.
// Metinler TR asıl; en/ar/id/ur seçiliyse çeviri katmanı devreye girer.
// ════════════════════════════════════════════════════════

export function AhlakBolumu({
  tt, q = "", lang = "tr", onSekme,
}: {
  tt?: (k: string) => string;
  q?: string;
  lang?: Lang;
  onSekme?: (sekme: string) => void;
}) {
  return (
    <IlmihalBolumu
      tt={tt}
      q={q}
      lang={lang}
      onSekme={onSekme}
      derslerVeri={AHLAK_DERSLERI}
      kaynakNotu={AHLAK_KAYNAK_NOTU}
      toplam={AHLAK_TOPLAM}
      miniturOnek="ahlak"
    />
  );
}
