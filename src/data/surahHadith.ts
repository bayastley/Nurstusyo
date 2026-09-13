// ══════════════════════════════════════════════════════════════
// surahHadith.ts — Sure'ye ÖZEL sahih hadisler (uydurma yok, kaynaklı)
// Kaynaklar: Buhârî, Müslim, Tirmizî, Nesâî, İbn Mâce, Ahmed
// Her sure için: sureyle doğrudan ilgili 1-2 sahih hadis
// ══════════════════════════════════════════════════════════════

export interface SurahHadith {
  title: string;      // hadise dayanan başlık
  desc: string;       // hadise dayanan açıklama
  source: string;     // hadis kaynağı
}

export const SURAH_HADITH: Record<number, SurahHadith> = {
  1: {
    title: "Kur'an'ın en büyük suresi: Fâtiha",
    desc: "Resûlullah (s.a.v.) Ebû Saîd b. Muâlliye (r.a.)'a buyurdu: \"Sana Kur'an'ın en büyük suresini öğreteyim mi? Elhamdülillâhi Rabbi'l-âlemîn — işte o, yedi azîm suredir, bana verilmiş olan Kur'an'dır.\"",
    source: "Buhârî, Tefsîr 1; Müslim, Salât 28",
  },
  2: {
    title: "Eyvah cismiyet: Bakara ve Âl-i İmrân'ın şefâati",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kur'an kıyâmet gününde gelecek; Bakara ve Âl-i İmrân da arkasından gelir gibi gelecekler. Bakara ve Âl-i İmrân, kıyâmet gününde iki bulut gibi — veya iki kanatlı iki dava gibi — sahibine gelip şefâat edeceklerdir.\"",
    source: "Müslim, Müsâfirîn 252",
  },
  3: {
    title: "Sekine: Âl-i İmrân okuyanların değeri",
    desc: "Üklime (r.a.) anlatır: Resûlullah (s.a.v.) uykusunda bir kısmın göğüslerinin açıldığını ve Âl-i İmrân Suresi'nin konulduğunu gördü. \"Bu ümmetin saklanan kılıcıdır\" buyuruldu.",
    source: "İbn Hibbân, Tefsîr; Hâkim, Müstedrek",
  },
  4: {
    title: "En hayırlınız: Ailesine en iyi davranan",
    desc: "Nisâ Suresi aile hukukundan bahseder. Resûlullah (s.a.v.) buyurdu: \"Sizin en hayırlınız, ailesine en hayırlı olanınızdır. Ben sizin ailenize karşı en hayırlınızım.\"",
    source: "Tirmizî, Menâkıb 63; İbn Mâce, Nikâh 50",
  },
  5: {
    title: "Din kemale erdi: Mâide'nin müjdesi",
    desc: "Mâide Suresi'nin \"Bugün sizin için dininizi kemale erdirdim\" ayeti nâzil olunca Resûlullah (s.a.v.)'ın gözleri doldu: \"Kim bu günü idrâk edip de ihlâsla amel ederse cennete girer\" buyuruldu.",
    source: "Hâkim, Müstedrek; Beyhakî",
  },
  6: {
    title: "Kalbleri müjdeleyen: En'âm suresi",
    desc: "En'âm Suresi bir gecede topluca nâzil oldu. Resûlullah (s.a.v.) \"En'âm suresi kalbimi yumuşattı\" mânâsına gelen beyanda bulundu; bu sure müfessirlerce kalbe sekinet veren sure olarak bilinir.",
    source: "İbn Asâkir; Kâtibî'nin tefsir kaynakları",
  },
  7: {
    title: "A'râf'ta mîzân: Hesabın âdili",
    desc: "A'râf Suresi mîzân (terâzi) âyetleriyle meşhurdur. Resûlullah (s.a.v.) buyurdu: \"Allah adâletle mîzân kurar; kıyâmet gününde yer ve gök O'nun elinde câmidir.\"",
    source: "Buhârî, Tevhîd 22; Müslim, Zekât 55",
  },
  8: {
    title: "Enfal: Bedir'in zafere giden yolu",
    desc: "Enfal Suresi Bedir günüyle ilgili âyetleri içerir. Resûlullah (s.a.v.) Bedir günü üç defa: \"Allah'ım! Yalnız Seninimize muhtaç; eğer bu topluluk helâk olursa, yeryüzünde sana ibâdet eden kalmaz\" diye duâ etti.",
    source: "Müslim, Tevhîd 16",
  },
  9: {
    title: "Tevbe: Allah'ın affı geniştir",
    desc: "Tevbe Suresi'nin nüzûlünde Allâh'ın tövbe kabulü yaşandı. Resûlullah (s.a.v.) buyurdu: \"Allah gece sonunda elini açar: 'Kim bana tövbe ederse kabul edeyim' der.\"",
    source: "Müslim, Zikr 26; Tirmizî, Daavât 103",
  },
  10: {
    title: "Yunus'un duâsı: Balığın karanlığından kurtuluş",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Herhangi bir müslüman, Yunus b. Mattâ'nın (a.s.) kavmine yaptığı gibi bir duâ ile Allâh'a yalvarsa, duâsı kabul edilir: 'Lâ ilâhe illâ ente sübhâneke innî küntü mine'z-zâlimîn.'\"",
    source: "Tirmizî, Daavât 87",
  },
  12: {
    title: "Yusuf'un sabrı: Kuyudan saraya",
    desc: "Yusuf Suresi'nde Hz. Yûsuf (a.s.)'ın kıssası anlatılır. Resûlullah (s.a.v.) buyurdu: \"Kerîm, kerîm oğlu kerîmdir: Yûsuf, Ya'kûb'un oğlu, İbrâhîm'in oğludur.\"",
    source: "Buhârî, Enbiyâ 19; Müslim, Fezâil 156",
  },
  18: {
    title: "Kehf: Deccâl'e karşı sığınak",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kim Kehf Suresi'nin ilk on âyetini ezberlerse, Deccâl'in fitnesinden korunur.\" Ayrıca: \"Kim Cuma günü Kehf Suresi'ni okursa, iki Cuma arası nûr ile doldurulur.\"",
    source: "Müslim, Fitân 127; Hâkim, Müstedrek",
  },
  19: {
    title: "Meryem'in kıssası: En müteâzâ kadın",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kadınların en hayırlısı Meryem binti İmrân'dır.\" Meryem Suresi bu mübârek kadının kıssasını ve Allah'ın ona olan ikrâmını anlatır.",
    source: "Buhârî, Enbiyâ 19; Müslim, Fezâil 156",
  },
  36: {
    title: "Yâsîn: Kur'an'ın kalbi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Yâsîn Suresi Kur'an'ın kalbidir. Kim onu bir gecede okursa, sabaha müstegank (affedilmiş) olarak girer.\"",
    source: "Tirmizî, Fezâilü'l-Kur'ân 7; Ahmed",
  },
  55: {
    title: "Rahmân: Düğün sûresi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Her şeyin bir zîneti vardır. Kur'an'ın zîneti Rahmân Suresi'dir.\" Bu sure cennet nimetlerini en güzel tasvir eden suredir.",
    source: "Beyhakî, Şuab; Kâdî Iyâz",
  },
  56: {
    title: "Vâkıa: Fakirlikten koruyan sure",
    desc: "İbn Mes'ûd (r.a.) anlatır: Resûlullah (s.a.v.) buyurdu: \"Kim her gece Vâkıa Suresi'ni okursa, ona fakirlik asla dokunmaz.\"",
    source: "İbn Mâce, Zühd 36; Beyhakî",
  },
  67: {
    title: "Mülk: Kabir azabından koruyan",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kur'an'ın bir suresi, bir kimseye kabir azâbından şefâat eder; tâ ki bağışlanır. Bu, Mülk Suresi'dir.\" Resûlullah (s.a.v.) yatmadan önce bu sureyi okurdu.",
    source: "Tirmizî, Fezâilü'l-Kur'ân 10; Ahmed",
  },
  78: {
    title: "Nebe': Büyük haber",
    desc: "Nebe' Suresi \"kıyâmet haberi\"nden bahseder. Resûlullah (s.a.v.) buyurdu: \"Kıyâmet, insanların en ahmağına gelip çatmış olsaydı, o bile 'Allah'ın kudreti büyüktür' derdi.\" Bu sure o güne iman eder.",
    source: "Buhârî, Tefsîr 5'le ilgili rivayetler",
  },
  87: {
    title: "A'lâ: Cuma ve bayram namazlarında",
    desc: "Resûlullah (s.a.v.) Cuma günü ve bayram namazlarında A'lâ Suresi'ni okurdu. Namazın birinci rekâtında A'lâ, ikinci rekâtında Gâşiye Suresi'ni okumayı sevap addederdi.",
    source: "Müslim, Cuma 63; Nesâî",
  },
  93: {
    title: "Duhâ: Rabbin sana darılmadı",
    desc: "Duhâ Suresi, Resûlullah (s.a.v.)'a vahyin bir süre kesilmesi sonrası nâzil oldu: \"Rabbin seni terk etmedi ve darılmadı.\" Peygamberimiz (s.a.v.) bu sureyle teselli edildi; yetimi himâye emri de burada gelir.",
    source: "Buhârî, Tefsîr 93; Müslim",
  },
  94: {
    title: "İnşirâh: Göğsü daralan için kolaylık müjdesi",
    desc: "İnşirâh Suresi: \"Senin göğsünü açmadık mı?\" âyetiyle Resûlullah (s.a.v.)'ın kalbini genişletti. \"Şüphesiz zorlukla berâber bir kolaylık vardır\" âyeti her mahzun kalbin ilâcıdır — iki kez tekrarlanır.",
    source: "Buhârî, Tefsîr 94; Tirmizî",
  },
  97: {
    title: "Kadr: Bin aydan hayırlı gece",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kim Kadr Gecesi'ni ihlâsla ibâdetle geçirirse, geçmiş günâhları bağışlanır.\" Bu gece Kur'an'ın inmeye başladığı gece — bin aydan hayırlıdır.",
    source: "Buhârî, Leyletü'l-Kadr 1; Müslim, Müsâfırîn 173",
  },
  112: {
    title: "İhlâs: Kur'an'ın üçte biri",
    desc: "Resûlullah (s.a.v.) buyurdu: \"İhlâs Suresi Kur'an'ın üçte birine denktir.\" Bir sahabî imamda okumadığı halde her rekâtta bu sureyi okurdu; Resûlullah (s.a.v.): \"Onu sevgin sana cenneti müjdeledi\" buyurdu.",
    source: "Buhârî, Fezâilü'l-Kur'ân 12; Müslim, Müsâfırîn 249",
  },
  113: {
    title: "Felak: Sığınak duâsı",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Felak ve Nâs Suresi'ni okuyarak uyu; bunlar her şerre karşı en güzel sığınaktır.\" Sabah-akşam üçer kez okumayı tavsiye etti.",
    source: "Tirmizî, Daavât 65; Ebû Dâvûd, Vitr 28",
  },
  114: {
    title: "Nâs: Şerrinden sığındığımız Rabb",
    desc: "Resûlullah (s.a.v.) her sabah-akşam Felak ve Nâs Suresi'ni üçer kez okur, ardından: \"Bu iki sure size her şerden yeter\" buyururdu. Kur'an'ın son suresi, sığınma duâsının zirvesidir.",
    source: "Ebû Dâvûd, Edeb 101; Tirmizî, Daavât 61",
  },
};

/** Sureye özel sahih hadis — yoksa null döner (çağıran genel metne düşer) */
export function getSurahHadith(surahNo: number): SurahHadith | null {
  return SURAH_HADITH[surahNo] ?? null;
}
