// ════════════════════════════════════════════════════════
// NAMAZDATA.TS — Keşfet > Namaz Öğretici (madde 28) + salah vakit adları + toplu hatim cüzleri
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 28: NAMAZ ÖĞRETİCİ (rekat rekat) ────────────────────────
export interface NamazAdim { adim: string; yazi: string; arapca?: string }
export const NAMAZ_REHBERİ: NamazAdim[] = [
  { adim: "1. Niyet + Tekbir", yazi: "Kalbende niyet et, elleri kulaklara kaldırıp 'Allâhu Ekber' de.", arapca: "اللَّهُ أَكْبَرُ" },
  { adim: "2. Kıyam (ayakta)", yazi: "Eller bağlanır; Sübhâneke, E'ûzü-Besmele ve Fâtiha okunur; ardından bir sure (3 kısa ayet).", arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ" },
  { adim: "3. Rükû (eğilme)", yazi: "'Allâhu Ekber' deyip eğil; bel düz, dizlere eller dayalı: 'Sübhâne Rabbiye'l-Azîm' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْعَظِيمِ" },
  { adim: "4. İ'tidal (kalkma)", yazi: "'Semi'allâhü limen hamideh' diyerek doğrul, ayakta: 'Rabbenâ leke'l-hamd'.", arapca: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ" },
  { adim: "5. Secde (baş koyma)", yazi: "'Allâhu Ekber' deyip yere kapan; alnı, burnu, elleri, dizleri yerde: 'Sübhâne Rabbiye'l-A'lâ' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْأَعْلَى" },
  { adim: "6. Oturuş (birinci)", yazi: "'Allâhu Ekber' diye doğrul, 'Rabbiğfirlî' diye otur; sonra ikinci rekat için secdeye dön.", arapca: "رَبِّ اغْفِرْ لِي" },
  { adim: "7. İkinci rekat", yazi: "Fâtiha + sure okunup rükû-secde tekrar edilir (yukarıdaki adımlar)." },
  { adim: "8. Et-Tehiyyâtü", yazi: "İkinci rekatın oturuşunda 'Et-Tehiyyâtü…' okunur (2 rekatta burada son oturuş).", arapca: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ" },
  { adim: "9. Salli-Bârik", yazi: "3+ rekatta ikinci oturuşta Salli-Bârik duaları da okunur.", arapca: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ" },
  { adim: "10. Selam", yazi: "Önce sağa, sonra sola dönerek 'Es-Selâmu aleyküm ve rahmetullah' de ve namazı bitir.", arapca: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ" },
];

// ── 45/58: SALAH TRACKER + DUA TAKİBİ gün anahtarları ───────
export const SALAH_VAKITLERI = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"] as const;

// ── 60: TOPLU HATİM — cüz eşitleme yardımcıları ────────────
export interface TopluHatimDurum { cüzler: number[]; katilimciSayisi: number }
export const TOPLU_HATIM_CÜZ = Array.from({ length: 30 }, (_, i) => i + 1);
