// ════════════════════════════════════════════════════════
// KENDISESSABITLER.TSX — Kendi Sesin paneli sabitleri
// ★ 24.11 DOSYA BÖLME: KendiSesPanel 940 satırdı; limit, ipuçları,
//   atmosfer/AI/yazı stilleri, AyetSegment tipi ve PauseIcon buraya taşındı.
// ════════════════════════════════════════════════════════

import React from "react";

export const MB = 60 * 1024 * 1024;

export const KENDI_SES_TIPS: Record<string, { title: string; desc: string }> = {
  tr: { title: "Kendi Sesinle Kur'an", desc: "Sadece ses dosyası yükleyin, sure seçin, waveform'da ayet ayırın, Arapça+meal ekleyin, atmosfere seçin ve önizleyin." },
  en: { title: "Qur'an with Your Voice", desc: "Upload audio only, select surah, split verses on waveform, add Arabic+translation, choose atmosphere, preview." },
  ar: { title: "القرآن بصوتك", desc: "ارفع ملف صوتي فقط، اختر السورة، قسم الآيات على الموجة، أضف العربية والترجمة، اختر الجو، وشاهد المعاينة." },
  id: { title: "Al-Qur'an dengan Suara Anda", desc: "Unggah audio saja, pilih surat, bagi ayat pada waveform, tambahkan Arab+terjemahan, pilih atmosfer, pratinjau." },
  ur: { title: "اپنی آواز قرآن کریم کے ساتھ", desc: "صرف آڈیو فائل اپ لوڈ کریں، سورہ منتخب کریں، Waveform پر آیات الگ کریں، عربی+مطالعہ شامل کریں، ماحول منتخب کریں اور پیش نظارہ دیکھیں۔" },
};

export const ATMOSPRESETLER: Array<{ id: string; ad: string; emoji: string }> = [
  { id: "nature", ad: "Doğa", emoji: "🌿" },
  { id: "mosque", ad: "Camii", emoji: "🕌" },
  { id: "space", ad: "Uzay", emoji: "🌌" },
  { id: "water", ad: "Su", emoji: "💧" },
  { id: "fire", ad: "Ateş/Nur", emoji: "🔥" },
  { id: "none", ad: "Yok", emoji: "⚪" },
];

export const AI_VIDEO_PRESETLER: Array<{ id: string; ad: string; emoji: string; url?: string }> = [
  { id: "ai-noor", ad: "Nûr Işığı", emoji: "✨" },
  { id: "ai-masjid", ad: "Camii İçerisi", emoji: "🕌" },
  { id: "ai-desert", ad: "Gece Çölü", emoji: "🏜️" },
  { id: "ai-sea", ad: "Deniz Yıldızı", emoji: "🌊" },
  { id: "ai-candle", ad: "Mum Işığı", emoji: "🕯️" },
  { id: "ai-none", ad: "Video Yok", emoji: "⚪" },
];

export const YAZI_STILLERI: Array<{ id: string; ad: string; fontFamily: string }> = [
  { id: "amiri", ad: "Amiri Kur'an", fontFamily: "'Amiri Quran', serif" },
  { id: "katibeh", ad: "Katibeh", fontFamily: "'Katibeh', serif" },
  { id: "lalezar", ad: "Lalezar", fontFamily: "'Lalezar', cursive" },
];

export interface AyetSegment {
  id: string;
  ayetNo: number;
  start: number;
  dur: number;
  arabic: string;
  meal: string;
  atmos: string;
  videoBg: string;
  showArabic: boolean;
  showMeal: boolean;
}

export const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m4-3v3m4-9v9" />
  </svg>
);
