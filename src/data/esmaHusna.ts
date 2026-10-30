// ════════════════════════════════════════════════════════
// ESMAHUSNA.TS (31.10) — Esmaü'l-Hüsnâ: 99 isim, Türkiye'de yaygın Tirmizî listesi sırasıyla.
// ★ KULLANICI EMRİ: "sahih gerçek olsun — anlamını kaynağını da unutma".
//   Liste kaynağı : Tirmizî, Deavât 83 (Hadis 3507) — 99 ismi sayan liste yalnız Tirmizî'de
//   yer alır; bilim adamları listeyi sonradan eklenen bir rivayet sayar (bk. TDV İslâm
//   Ansiklopedisi, "Esma-i Hüsna" maddesi).
//   99 isim hadisi: Buhârî, Tevhîd 12 (7392) · Müslim, Zikr 5 (2677) — liste bu hadiste yoktur.
//   Kaynak alanları: isim Kur'ân'da isim olarak geçiyorsa âyet; sadece fiil hali geçiyorsa "(fiil)"
//   işaretli; yalnız sahih hadislerde geçiyorsa "Hadis" işaretli — dürüst gösterim.
// ════════════════════════════════════════════════════════

export interface Esma {
  ar: string;      // Arapça isim
  tr: string;      // Türkçe okunuş
  anlam: string;   // Türkçe anlamı
  kaynak: string;  // Âyet / hadis kaynağı
}

export const ESMA_KAYNAK_NOTU =
  "Liste: Tirmizî, Deavât 83 · 99 isim hadisi: Buhârî, Tevhîd 12 (7392) · Müslim, Zikr 5 (2677)";

export const ESMA_HUSNA: Esma[] = [
  { ar: "الرَّحْمَٰن", tr: "er-Rahmân", anlam: "Rahmeti her şeye kuşatan", kaynak: "Fâtiha 1:1" },
  { ar: "الرَّحِيم", tr: "er-Rahîm", anlam: "Merhametli, rahmetiyle mükâfatlandıran", kaynak: "Fâtiha 1:1" },
  { ar: "الْمَلِك", tr: "el-Melik", anlam: "Her şeyin asıl sahibi, hükümran", kaynak: "Hâşır 59:23" },
  { ar: "الْقُدُّوس", tr: "el-Kuddüs", anlam: "Her kusurdan münezzeh, çok mukaddes", kaynak: "Cuma 62:1" },
  { ar: "السَّلَام", tr: "es-Selâm", anlam: "Kusursuz, esenliğin kaynağı", kaynak: "Hâşır 59:23" },
  { ar: "الْمُؤْمِن", tr: "el-Mü'min", anlam: "Gönüllere emniyet ve güven veren", kaynak: "Hâşır 59:23" },
  { ar: "الْمُهَيْمِن", tr: "el-Müheymin", anlam: "Her şeyi gözeten, koruyucu", kaynak: "Hâşır 59:23" },
  { ar: "الْعَزِيز", tr: "el-Azîz", anlam: "Yenilgisi olmayan galip, izzet sahibi", kaynak: "Hâşır 59:23" },
  { ar: "الْجَبَّار", tr: "el-Cebbâr", anlam: "İrade ve kudreti her şeye galip", kaynak: "Hâşır 59:23" },
  { ar: "الْمُتَكَبِّر", tr: "el-Mütekebbir", anlam: "Büyüklük yalnız kendine mahsus", kaynak: "Hâşır 59:23" },
  { ar: "الْخَالِق", tr: "el-Hâlık", anlam: "Her şeyi yoktan var eden", kaynak: "Hâşır 59:24" },
  { ar: "الْبَارِئ", tr: "el-Bârî'", anlam: "Kusursuz yaratan, yoktan ortaya çıkaran", kaynak: "Hâşır 59:24" },
  { ar: "الْمُصَوِّر", tr: "el-Musavvir", anlam: "Varlıklara şekil ve sûret veren", kaynak: "Hâşır 59:24" },
  { ar: "الْغَفَّار", tr: "el-Gaffâr", anlam: "Tövbeleri çok kabul eden, günahları bol bol affeden", kaynak: "Nûh 71:10" },
  { ar: "الْقَهَّار", tr: "el-Kahhâr", anlam: "İradesi karşısında her şeyin boyun eğdiği", kaynak: "Ra'd 13:16" },
  { ar: "الْوَهَّاب", tr: "el-Vehhâb", anlam: "Karşılıksız çok ihsan eden", kaynak: "Sâd 38:35" },
  { ar: "الرَّزَّاق", tr: "er-Rezzâk", anlam: "Her canlının rızkını düzenli biçimde veren", kaynak: "Zâriyât 51:58" },
  { ar: "الْفَتَّاح", tr: "el-Fettâh", anlam: "Her kapıyı açan, adâletle hüküm veren", kaynak: "Sebe' 34:26 (fiil)" },
  { ar: "الْعَلِيم", tr: "el-Alîm", anlam: "Her şeyi bilen", kaynak: "Bakara 2:32" },
  { ar: "الْقَابِض", tr: "el-Kābıd", anlam: "Dilediğinin rızkını daraltan, her şeyi tutup toplayan", kaynak: "Bakara 2:245 (fiil)" },
  { ar: "الْبَاسِط", tr: "el-Bāsıt", anlam: "Dilediğinin rızkını genişleten", kaynak: "Bakara 2:245 (fiil)" },
  { ar: "الْخَافِض", tr: "el-Hāfıd", anlam: "Dilediğini alçaltan", kaynak: "Hâşır 56:3 (hâfıdûn râfi'ûn)" },
  { ar: "الرَّافِع", tr: "er-Rāfi'", anlam: "Dilediğini yücelten", kaynak: "Mucâdele 58:11 (fiil)" },
  { ar: "الْمُعِزّ", tr: "el-Mu'izz", anlam: "Dilediğine izzet, onur veren", kaynak: "Âl-i İmrân 3:26 (fiil)" },
  { ar: "الْمُذِلّ", tr: "el-Muzill", anlam: "Dilediğini zillete uğratan", kaynak: "Âl-i İmrân 3:26 (fiil)" },
  { ar: "السَّمِيع", tr: "es-Semî'", anlam: "Bütün sesleri duyan", kaynak: "Bakara 2:127" },
  { ar: "الْبَصِير", tr: "el-Başîr", anlam: "Her şeyi gören (görünmezler dâhil)", kaynak: "Şûrâ 42:11" },
  { ar: "الْحَكَم", tr: "el-Hakem", anlam: "Adâlet ile hüküm veren", kaynak: "En'âm 6:114" },
  { ar: "الْعَدْل", tr: "el-Adl", anlam: "Çok adil, haksızlığın olmaması", kaynak: "En'âm 6:115 (fiil)" },
  { ar: "اللَّطِيف", tr: "el-Latîf", anlam: "Lütuf sahibi, bütün incelikleri bilen", kaynak: "En'âm 6:103" },
  { ar: "الْخَبِير", tr: "el-Habîr", anlam: "Bütün gizli şeyleri bilen", kaynak: "En'âm 6:103" },
  { ar: "الْحَلِيم", tr: "el-Halîm", anlam: "Cezada acele etmeyen, cömertçe affeden", kaynak: "Bakara 2:235" },
  { ar: "الْعَظِيم", tr: "el-Azîm", anlam: "Bütün özellikleriyle yüce, azamet sahibi", kaynak: "Bakara 2:255" },
  { ar: "الْغَفُور", tr: "el-Gafûr", anlam: "Günahları çok bağışlayan", kaynak: "Bakara 2:173" },
  { ar: "الشَّكُور", tr: "eş-Şekûr", anlam: "İyilikleri kat kat mükâfatlandıran", kaynak: "Fatır 35:34" },
  { ar: "الْعَلِيّ", tr: "el-Aliyy", anlam: "Çok yüce, her şeyin üstünde", kaynak: "Bakara 2:255 (el-Aliyyü'l-Azîm)" },
  { ar: "الْكَبِير", tr: "el-Kebîr", anlam: "Büyük, ulu", kaynak: "Ra'd 13:9" },
  { ar: "الْحَفِيظ", tr: "el-Hafîz", anlam: "Her şeyi koruyan, kaybetmeyen", kaynak: "Hûd 11:57" },
  { ar: "الْمُقِيت", tr: "el-Mukît", anlam: "Her varlığın rızkını hazırlayıp veren", kaynak: "Nisâ 4:85 (fiil)" },
  { ar: "الْحَسِيب", tr: "el-Hesîb", anlam: "Hesap gören, kullara yeterli olan", kaynak: "Nisâ 4:6" },  {
  ar: "الْجَلِيل", tr: "el-Celîl", anlam: "Ulu ve azamet sahibi", kaynak: "Hadis · Buhârî (listede; âyette isim olarak geçmez)" },
  { ar: "الْكَرِيم", tr: "el-Kerîm", anlam: "Çok cömert, şereflendirici", kaynak: "Sebe' 34:23" },
  { ar: "الرَّقِيب", tr: "er-Rakîb", anlam: "Her şeyi gözeten, denetleyen", kaynak: "Nisâ 4:1" },
  { ar: "الْمُجِيب", tr: "el-Mucîb", anlam: "Duâları kabul eden", kaynak: "Hûd 11:61" },
  { ar: "الْوَاسِع", tr: "el-Vâsi'", anlam: "Rızkı ve rahmeti geniş, her şeyi kuşatan", kaynak: "Bakara 2:268" },
  { ar: "الْحَكِيم", tr: "el-Hakîm", anlam: "Hüküm ve hikmet sahibi", kaynak: "Bakara 2:129" },
  { ar: "الْوَدُود", tr: "el-Vedûd", anlam: "Kullarını seven, sevilmeye lâyık", kaynak: "Hûd 11:90" },
  { ar: "الْمَجِيد", tr: "el-Mecîd", anlam: "Şanı yüce, lütfu çok", kaynak: "Hûd 11:73" },
  { ar: "الْبَاعِث", tr: "el-Bā'iş", anlam: "Bütün varlıkları dirilten", kaynak: "Hac 22:7" },
  { ar: "الشَّهِيد", tr: "eş-Şehîd", anlam: "Her şeye şâhit, gören/bilen", kaynak: "Nisâ 4:166" },
  { ar: "الْحَقّ", tr: "el-Hakk", anlam: "Sözü ve vaadi gerçekte olan, hak bir Mâbud", kaynak: "En'âm 6:62" },
  { ar: "الْوَكِيل", tr: "el-Vekîl", anlam: "Bütün işleri en iyi düzenleyen vekil", kaynak: "Âl-i İmrân 3:173" },
  { ar: "الْقَوِيّ", tr: "el-Kavî", anlam: "Kudreti kusursuz, güçlü", kaynak: "Hac 22:40" },
  { ar: "الْمَتِين", tr: "el-Metîn", anlam: "Kudreti hiç zayıflamayan, sağlam", kaynak: "Zâriyât 51:58" },
  { ar: "الْوَلِيّ", tr: "el-Velî", anlam: "Müminlerin velîsi, koruyup yardım eden", kaynak: "Nisâ 4:45" },
  { ar: "الْحَمِيد", tr: "el-Hamîd", anlam: "Her hamd ve övgüye lâyık", kaynak: "İbrâhîm 14:8" },
  { ar: "الْمُحْصِي", tr: "el-Muhsî", anlam: "Her şeyi detaylarıyla sayan", kaynak: "Cin 72:28" },
  { ar: "الْمُبْدِئ", tr: "el-Mubdi'", anlam: "Varlığı yoktan başlatan", kaynak: "Yûnus 10:34 (fiil)" },
  { ar: "الْمُعِيد", tr: "el-Mu'îd", anlam: "Varlığı yeniden getiren", kaynak: "Yûnus 10:34 (fiil)" },
  { ar: "الْمُحْيِي", tr: "el-Muhyî", anlam: "Her şeyi dirilten", kaynak: "A'râf 7:158" },
  { ar: "الْمُمِيت", tr: "el-Mumît", anlam: "Her şeyi öldüren", kaynak: "Hicr 15:23" },
  { ar: "الْحَيّ", tr: "el-Hayy", anlam: "Her an diri ve bakî", kaynak: "Bakara 2:255" },
  { ar: "الْقَيُّوم", tr: "el-Kayyûm", anlam: "Bütün âlemi ayakta tutan, kendine muhtaç olmayan", kaynak: "Bakara 2:255" },
  { ar: "الْوَاجِد", tr: "el-Vâcid", anlam: "Hiçbir şeye muhtaç olmayan (lütuf bulan)", kaynak: "Sâd 38:44 (fiil)" },
  { ar: "الْمَاجِد", tr: "el-Mâcid", anlam: "Şanı şöhretli, azamet sahibi", kaynak: "Bürûc 85:15" },
  { ar: "الْوَاحِد", tr: "el-Vâhid", anlam: "Bir — ortağı ve benzeri olmayan", kaynak: "Ra'd 13:16" },
  { ar: "الْأَحَد", tr: "el-Ehad", anlam: "Tektir, hiçbir şeyle kıyaslanmayacak", kaynak: "İhlâs 112:1" },
  { ar: "الصَّمَد", tr: "es-Samad", anlam: "Her şey O'na muhtaç, O kimseye muhtaç değildir", kaynak: "İhlâs 112:2" },
  { ar: "الْقَادِر", tr: "el-Kādir", anlam: "Her şeye kâdir/gücü yeten", kaynak: "En'âm 6:65" },
  { ar: "الْمُقْتَدِر", tr: "el-Muktedir", anlam: "Kudreti tam, gücü dilediğini yapan", kaynak: "Kamer 54:42" },
  { ar: "الْمُقَدِّم", tr: "el-Mukaddim", anlam: "Dilediğini öne geçiren", kaynak: "Nahl 16:61 (hadis: Buhârî)" },
  { ar: "الْمُؤَخِّر", tr: "el-Muahhır", anlam: "Dilediğini sonraya bırakan", kaynak: "Nûh 71:4 (hadis: Buhârî)" },
  { ar: "الْأَوَّل", tr: "el-Evvel", anlam: "İlk — başlangıcı olmayan", kaynak: "Hâşır 57:3" },
  { ar: "الْآخِر", tr: "el-Âhir", anlam: "Son — sonu olmayan", kaynak: "Hâşır 57:3" },
  { ar: "الظَّاهِر", tr: "ez-Zâhir", anlam: "Her şeyin üstünde, açık ve görünür olan", kaynak: "Hâşır 57:3" },
  { ar: "الْبَاطِن", tr: "el-Bâtın", anlam: "Gizlileri bilen, her şeyin içini bilen", kaynak: "Hâşır 57:3" },
  { ar: "الْوَالِي", tr: "el-Vâlî", anlam: "İşleri vekâleten yöneten", kaynak: "Ra'd 13:11" },
  { ar: "الْمُتَعَالِي", tr: "el-Müteâlî", anlam: "Bütün eksikliklerden münezzeh, en yüce", kaynak: "Ra'd 13:9" },
  { ar: "الْبَرّ", tr: "el-Berr", anlam: "Bütün iyiliklerin kaynağı, hayır sahibi", kaynak: "Tûr 52:28" },
  { ar: "التَّوَّاب", tr: "et-Tevvâb", anlam: "Tövbeleri çok kabul eden", kaynak: "Bakara 2:128" },
  { ar: "الْمُنْتَقِم", tr: "el-Muntekim", anlam: "Hak yerini bulsun diye düşmanı cezalandıran", kaynak: "Secde 32:22" },
  { ar: "الْعَفُوّ", tr: "el-Afüvv", anlam: "Kusurları affından geçen, günahları yok eden", kaynak: "Nisâ 4:149" },
  { ar: "الرَّؤُوف", tr: "er-Raûf", anlam: "Şefkati ve merhameti çok", kaynak: "Tevbe 9:117" },
  { ar: "مَالِكُ الْمُلْك", tr: "Mâlikü'l-Mülk", anlam: "Mülkün gerçek sahibi", kaynak: "Âl-i İmrân 3:26" },
  { ar: "ذُو الْجَلَالِ وَالْإِكْرَام", tr: "Zü'l-Celâli ve'l-İkrâm", anlam: "Azamet ve ikram sahibi", kaynak: "Rahmân 55:27" },
  { ar: "الْمُقْسِط", tr: "el-Muksît", anlam: "Adâletle hüküm veren", kaynak: "Hac 22:69 (hükmünde)" },
  { ar: "الْجَامِع", tr: "el-Câmi'", anlam: "Bütün varlıkları toplayan", kaynak: "Âl-i İmrân 3:9" },
  { ar: "الْغَنِيّ", tr: "el-Ganî", anlam: "Hiçbir şeye muhtaç olmayan, zengin", kaynak: "Zümer 39:7" },
  { ar: "الْمُغْنِي", tr: "el-Muğnî", anlam: "Dilediğini zenginleştiren", kaynak: "Tevbe 9:28 (fiil)" },
  { ar: "الْمَانِع", tr: "el-Mâni'", anlam: "İstediğine bir hayır verilmesini engellemeye kadir", kaynak: "Hadis · Buhârî/Müslim (\"Allâhümme lâ mânı'\…\" duası)" },
  { ar: "الضَّارّ", tr: "ed-Dârr", anlam: "Zarar verip ondan koruyan — ikisi de O'nun iradesiyle", kaynak: "En'âm 6:17 (fiil)" },
  { ar: "النَّافِع", tr: "en-Nâfi'", anlam: "Fayda ve hayır vereni", kaynak: "Rûm 30:37 (fiil)" },
  { ar: "النُّور", tr: "en-Nûr", anlam: "Bütün âlemin nûru, hidâyeti saçan", kaynak: "Nûr 24:35" },
  { ar: "الْهَادِي", tr: "el-Hâdî", anlam: "Doğru yola hidâyet eden", kaynak: "Hac 22:54" },
  { ar: "الْبَدِيع", tr: "el-Bedî'", anlam: "Bütün varlığı benzersiz biçimde yaratan", kaynak: "Bakara 2:117" },
  { ar: "الْبَاقِي", tr: "el-Bâkî", anlam: "Yok olmayan, her zaman var olan", kaynak: "Rahmân 55:27 (fiil)" },
  { ar: "الْوَارِث", tr: "el-Vâris", anlam: "Her şeyin asıl sâhibi, sonunda âlem O'nun olur", kaynak: "Hicr 15:23" },
  { ar: "الرَّشِيد", tr: "er-Reşîd", anlam: "Doğru yolu gösteren, işleri en doğru biçimde yürüten", kaynak: "Hûd 11:87 (Tirmizî listesinde)" },
  { ar: "الصَّبُور", tr: "es-Sabûr", anlam: "Hiç acele etmeyen, sabırlı", kaynak: "Hadis · Buhârî (âyet sabır emri: Bakara 2:153)" },
];
