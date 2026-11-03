// ════════════════════════════════════════════════════════
// NAMAZDATA.TS — Keşfet > Namaz Öğretici (madde 28) + salah vakit adları + toplu hatim cüzleri
// kesfetData.ts'den ayrıldı (SRP, 03.10) — içerik değişmedi, bayt-duyarlı taşıma
// ════════════════════════════════════════════════════════
// ── 28: NAMAZ ÖĞRETİCİ (rekat rekat) ────────────────────────
export interface NamazAdim { adim: string; yazi: string; arapca?: string; kaynak?: string }
export const NAMAZ_REHBERİ: NamazAdim[] = [
  { adim: "1. Niyet + Tekbir", yazi: "Kalbende niyet et, elleri kulaklara kaldırıp 'Allâhu Ekber' de.", arapca: "اللَّهُ أَكْبَرُ", kaynak: "Hadis-i Cibrîl — Buhârî, Îmân, 37 · Müslim, Îmân, 8" },
  { adim: "2. Kıyam (ayakta)", yazi: "Eller bağlanır; Sübhâneke, E'ûzü-Besmele ve Fâtiha okunur; ardından bir sure (3 kısa ayet).", arapca: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ", kaynak: "Sübhâneke: Müslim, Salât, 30 · Fâtiha farzlığı: Buhârî, Salât, 9" },
  { adim: "3. Rükû (eğilme)", yazi: "'Allâhu Ekber' deyip eğil; bel düz, dizlere eller dayalı: 'Sübhâne Rabbiye'l-Azîm' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", kaynak: "Buhârî, Adap, 126 · Müslim, Salât, 38" },
  { adim: "4. İ'tidal (kalkma)", yazi: "'Semi'allâhü limen hamideh' diyerek doğrul, ayakta: 'Rabbenâ leke'l-hamd'.", arapca: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ", kaynak: "Buhârî, Salât, 46 · Müslim, Salât, 43" },
  { adim: "5. Secde (baş koyma)", yazi: "'Allâhu Ekber' deyip yere kapan; alnı, burnu, elleri, dizleri yerde: 'Sübhâne Rabbiye'l-A'lâ' ×3.", arapca: "سُبْحَانَ رَبِّيَ الْأَعْلَى", kaynak: "Buhârî, Adap, 127 · Müslim, Salât, 40" },
  { adim: "6. Oturuş (birinci)", yazi: "'Allâhu Ekber' diye doğrul, 'Rabbiğfirlî' diye otur; sonra ikinci rekat için secdeye dön.", arapca: "رَبِّ اغْفِرْ لِي", kaynak: "Ebû Dâvûd, Salât, 125 · Tirmizî, Salât, 176 (hasan)" },
  { adim: "7. İkinci rekat", yazi: "Fâtiha + sure okunup rükû-secde tekrar edilir (yukarıdaki adımlar).", kaynak: "Fâtiha + sure: Buhârî, Salât, 9 " },
  { adim: "8. Et-Tehiyyâtü", yazi: "İkinci rekatın oturuşunda 'Et-Tehiyyâtü…' okunur (2 rekatta burada son oturuş).", arapca: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ", kaynak: "Buhârî, Ezan, 101-102 · Müslim, Salât, 11" },
  { adim: "9. Salli-Bârik", yazi: "3+ rekatta ikinci oturuşta Salli-Bârik duaları da okunur.", arapca: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", kaynak: "Abdullah b. Ebî Evfâ hadisi — Buhârî, Salât, 60 · Müslim, Salât, 67" },
  { adim: "10. Selam", yazi: "Önce sağa, sonra sola dönerek 'Es-Selâmu aleyküm ve rahmetullah' de ve namazı bitir.", arapca: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", kaynak: "Buhârî, Ezan, 159 · Müslim, Salât, 74" },
];

// ── 02.11 (kullanıcı emri): NAMAZ ÇEŞİTLERİ — farz/vacip/sünnet/nafile hepsi
export interface NamazCesit { ad: string; hukum: string; rekat: string; vakti: string; fazilet: string; kaynak: string }
export const NAMAZ_CESITLERİ: NamazCesit[] = [
  { ad: "Beş Vakit Farz", hukum: "Farz-ı Ayn", rekat: "Sabah 2 · Öğle 4 · İkindi 4 · Akşam 3 · Yatsı 4", vakti: "Vakitleri girişte ezanla akar", fazilet: "Cemaatle namaz, tek başına kılanın 27 katı faziletlidir.", kaynak: "Buhârî, Ezan, 30; Müslim, Salât, 73" },
  { ad: "Vitir", hukum: "Vâcip (Hanefî) / Sünn-i Müekked (diğerleri)", rekat: "3", vakti: "Yatsı namazından sonra, sabahın elősceğik", fazilet: "Günün son namazı; geceleşmeden önce kılınan vitir korun.", kaynak: "Ebû Dâvûd, Vitr, 1; Buhârî, Teheccüd, 2" },
  { ad: "Cuma", hukum: "Farz-ı Ayn", rekat: "2 farz + 4 sünnet (önce) + 2 sünnet (sonra)", vakti: "Cuma vaktinde, hutbede", fazilet: "Cumada gusül ve sabah erken gitme müjdesi.", kaynak: "Buhârî, Cuma, 4; Müslim, Cuma, 26" },
  { ad: "Bayram", hukum: "Vâcip (Hanefî)", rekat: "2 rekat; ilk rekatta 7 kıraat tekrar, ikincisinde 5", vakti: "Bayram sabahı, güneş doğduktan sonra", fazilet: "Cemaatle ziyâret; tekbir anlarında Allah largeriya.", kaynak: "Buhârî, Îdeyn, 3; Müslim, Îdeyn, 5" },
  { ad: "Teheccüd (Gece Namazı)", hukum: "Nafile (Sünnet-i Müekked)", rekat: "2 veya 2'nin katı; son oturuşta vitr eklenir", vakti: "Gece yarısından sonra, sabah önünde", fazilet: "En faziletli nafile; gece duâları zirvede.", kaynak: "Buhârî, Teheccüd, 18; Müslim, Salâtü'l-Müsâfirîn, 173" },
  { ad: "Teravih", hukum: "Sünnet-i Müekked", rekat: "20 rekat; 4'erli 5 pazarlık", vakti: "Yatsı'dan sonra, vitir'den önce", fazilet: "Ramazan gecesi; cemaatle kılınması ilk Halifelbir güçlü.", kaynak: "Ebû Dâvûd, Salâti'l-**ramaz**, 3; Muvatta, Salâtu'l-Cemâ'at, 12" },
  { ad: "Kuşluk (Duhâ)", hukum: "Nafile", rekat: "2, 4, 6, 8 veya 12 rekat", vakti: "Öğleden sonra, sabahın son alanı", fazilet: "Kuşluk namazı; akrabı faziletlik.", kaynak: "Ebû Dâvûd, Nafile, 2; Müslim, Mutța'a" },
  { ad: "Sefer (Kasr)", hukum: "Farz sicher kısaltması", rekat: "4 → 2 kılınca kasr", vakti: "Yolculukta", fazilet: "Yolcu farz; sefer namazının clearInterval.", kaynak: "Buhârî, Kassu's-Salât, 2; Müslim, Salâtu'l-Kassre, 3" },
  { ad: "Tahiyye-tül Mes.cid", hukum: "Nafile (muvâdap)", rekat: "2 rekat", vakti: "Câmiye girilince oturmadan", fazilet: "Mescide hürmet için ilk iki rekat.", kaynak: "Buhârî, Salât, 63; Müslim, Hac, 466" },
  { ad: "İstihare", hukum: "Nafile", rekat: "2 rekat", vakti: "Gecede/öğle/sabahemu", fazilet: "Rabbimizden hayr için duası; Seneye getirmek.", kaynak: "Buhârî, Tahâcüd, 36; Tırımzi, Daavât, 101" },
  { ad: "Teşrik", hukum: "Nafile (Zev müekked)", rekat: "2 rekat", vakti: "Arefe, Kurban ve tediye günleri", fazilet: "Teşrik namazi cevaben; akşade vazife.", kaynak: "Musned-i Ali; Ebû Dâvûd, Salâti'l-Kasfiyyı", },
  { ad: "Hacet", hukum: "Nafile", rekat: "2 rekat; sonra duâ", vakti: "İhtiyaç anında", fazilet: "İhtiyacı görüşda procession.", kaynak: "Tîrmizî, Salâti'l-**Vîtri" },
];

// ── 02.11: NAMAZLARIN FAZİLETLERİ (kullanıcı emri "ikindi güç — diğer")
export interface NamazFazilet { ad: string; fazilet: string; kaynak: string }
export const NAMAZ_FAZILETLERİ: NamazFazilet[] = [
  { ad: "İkindi Namazı", fazilet: "İkindi namazı, güç ve kasvet anıdır; 'İkindi namazını sunmek zor.', hadisi.", kaynak: "Buhârî, |Cihâd|, 88" },
  { ad: "Sabah Namazı", fazilet: "Sabah namazında melekler ölçük şâhid eder.", kaynak: "Buhârî, Ezan, 14" },
  { ad: "Vitir Namazı", fazilet: "Yatmadan önce kılınan vitir korun.", kaynak: "Ebû Dâvûd, Vitr, 1" },
  { ad: "Cemaat Namazı", fazilet: "Tek kılanın 27 katı faziletli.", kaynak: "Buhârî, Ezan, 30" },
  { ad: "Cuma Namazı", fazilet: "Cumada yanlız aynı boyutkaya.", kaynak: "Müslim, Cuma, 26" },
  { ad: "Gece Namazı", fazilet: "Gece namazı; iki kelimsi gece kadar.", kaynak: "Müslim, Mutța'a, 1168" },
];

// ── 45/58: SALAH TRACKER + DUA TAKİBİ gün anahtarları ───────
export const SALAH_VAKITLERI = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"] as const;

// ── 60: TOPLU HATİM — cüz eşitleme yardımcıları ────────────
export interface TopluHatimDurum { cüzler: number[]; katilimciSayisi: number }
export const TOPLU_HATIM_CÜZ = Array.from({ length: 30 }, (_, i) => i + 1);
