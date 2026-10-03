// ════════════════════════════════════════════════════════
// TECVIDDATA.TS — Keşfet > Tecvid Rehberi (madde 48) — temel/orta/ileri kurallar
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 48: TECVİD REHBERİ (madde 48) — temel kurallar, örneklerle ──
export interface TecvidKurali { baslik: string; tanim: string; ornek: string; seviye: "temel" | "orta" | "ileri" }
export const TECVID_KURALLARI: TecvidKurali[] = [
  { baslik: "Nûn-u Sâkin ve Tenvîn: İzhar", tanim: "Nûn sâkin veya tenvînden sonra harf-i hal (ا هـ ع ح غ خ) gelirse nûn, ġunnasız ve açık okunur.", ornek: "مِنْ آمَنَ (min â-mene) · أَنْتُمْ (entüm) · أَنْعَمْتَ (en'amte)", seviye: "temel" },
  { baslik: "Nûn-u Sâkin ve Tenvîn: İdgam", tanim: "ي ر م ل و ن harflerinden biri gelirse nûn, sonraki harfe karışır (bazılarıyla ġunna: ي ن م و; ġunnasız: ر ل).", ornek: "مَنْ يَعْمَلْ (men ya'mel — ġunnalı) · مِنْ رَبِّهِمْ (mir-rabbihim — ġunnasız)", seviye: "temel" },
  { baslik: "Nûn-u Sâkin ve Tenvîn: İklab", tanim: "ب (bâ) gelirse nûn, gizlice mîm'e çevrilir ve ġunnayla okunur — hatta üzerinde م yazılır.", ornek: "مِنْ بَعْدِ (mim-be'di) · سَمِيعٌ بَصِيرٌ (semî'um-basîrun)", seviye: "temel" },
  { baslik: "Nûn-u Sâkin ve Tenvîn: İhfa", tanim: "Kalan 15 harf gelirse nûn, ġunnayla gizlenir — dil harfe dokunmaz, burundan 2-3 vakt ġunna.", ornek: "مِنْ قَبْلِ (mink-kabli) · أَنْتَ (ante) · انْتُمْ (intum)", seviye: "temel" },
  { baslik: "Mîm-i Sâkin: İzhar-ı Şefevî", tanim: "Mîm sâkinden sonra harf-i şefevî (ف ب م و) gelirse mîm açık okunur — dudaklar hafif ayrılır.", ornek: "الْحَمْدُ لِلَّهِ (el-hamdu lillâh) · تَمْ كُنتُم (tum-kuntum)", seviye: "temel" },
  { baslik: "Mîm-i Sâkin: İdgam-ı Şefevî (Ġunna)", tanim: "Mîm sâkinden sonra yine م veya ن gelirse mîm, ġunnayla sonraki harfe karışır (2 vakit).", ornek: "لَهُمْ مَا (lehum-mâ) · مِنْهُمْ مَنْ (minhum-men)", seviye: "orta" },
  { baslik: "Mîm-i Sâkin: İhfa-ı Şefevî", tanim: "Bâ gelirse mîm ile bâ arasında ġunna yapılır (ihfa-ı şefevî).", ornek: "تَرْمِيهِمْ بِحِجَارَةٍ (termîhim-bi-hicâre)", seviye: "orta" },
  { baslik: "Med: Tabiî (Doğal Uzatma)", tanim: "Harf-i med (ا و ي) üzerinde hiçbir sebep ve zaıd yoksa 1 vakit uzatılır — fazlası hata.", ornek: "قَالَ (kâle) · يَقُولُ (yekûlu) · قِيلَ (kîle)", seviye: "temel" },
  { baslik: "Med: Muttasıl (Bitişik Uzatma)", tanim: "Aynı kelimede harf-i medden sonra hemze gelirse 4-5 vakit uzatılır (tevassut 4 müstahsen).", ornek: "جَاءَ (câe) · السُّوءَ (es-sûe) · سِيئَتْ (sîet)", seviye: "orta" },
  { baslik: "Med: Münfasıl (Ayrı Uzatma)", tanim: "Kelimede harf-i med, sonraki kelimede hemze gelirse 4-5 vakit uzatılır (vamcelerin tercihi farklı).", ornek: "يَا أَيُّهَا (yâ eyyühâ) · بِمَا أُنزِلَ (bimâ unzile)", seviye: "orta" },
  { baslik: "Med: Lâzım (Zorunlu Uzatma)", tanim: "Harf-i medden sonra şedde gelirse 6 vakit uzatılır — en uzun meddir.", ornek: "الضَّالِّينَ (ed-dâl-lîne) · الحَاقَّةُ (el-hâk-ketü) · كُفَّارًا (küf-fâren)", seviye: "orta" },
  { baslik: "Med: Arız-ı Sükûn", tanim: "Vakfedince harf-i med üzerine sükûn arız olursa 2, 4 veya 6 vakit uzatılabilir (vakfa mahsus).", ornek: "نَسْتَعِينُ ۝ vakıf: nâs-ta'î-nû (2/4/6)", seviye: "ileri" },
  { baslik: "Şedde ve Ġunna", tanim: "Şeddeli harfin ilk harfi sâkin gibi, ikincisi harekeli okunur; ن و م şeddeliyse 2 vakit ġunna şart.", ornek: "إِنَّ (in-ne) · ثُمَّ (thum-me) · مِنَّ (min-ne)", seviye: "temel" },
  { baslik: "Kalkale", tanim: "Vakıfta ق ط ب ج د harfleri sâkin kalırsa ses, boğazda hafif zıplamayla (kalkale) vurgulanır — büyük/küçük kalkale.", ornek: "أَقْرَبْ (ak-rab) · وَتَبَّ (ve teb-bet)", seviye: "ileri" },
  { baslik: "Lâm-ı Şemsî ve Kamrî", tanim: "Şemsî harflerde (14 adet) elifteki LÂM okunmaz, sonraki harf şeddeli; kamrîde LÂM açık okunur.", ornek: "Şemsî: اَلرَّحْمَن (er-rahmân) · Kamrî: اَلْقَمَر (el-kamer)", seviye: "temel" },
  { baslik: "Lâm ve Râ'nın Okunuş Özellikleri", tanim: "Lâm kalın (talık) veya ince okunabilir; Râ önceki harekete göre kalın/ince olur — tilavetin tadı buradadır.", ornek: "اللَّهُ (kalın) · بِسْمِ الرَّبِّ (ince)", seviye: "ileri" },
];

export const TECVID_SEVIYE_ETIKETI: Record<string, { label: string; renk: string }> = {
  temel: { label: "Temel", renk: "emerald" },
  orta: { label: "Orta", renk: "sky" },
  ileri: { label: "İleri", renk: "fuchsia" },
};
