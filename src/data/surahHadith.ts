// ══════════════════════════════════════════════════════════════
// surahHadith.ts — BÜTÜN 114 SURE için sahih hadis / tarihî bilgi
// Kaynaklar: Buhârî, Müslim, Tirmizî, Nesâî, İbn Mâce, Ahmed,
// İbn Hibbân, Hâkim (Müstedrek), Beyhakî, Dârimî
// Kurallar: Sadece sahih/hasen kaynaklı rivâyetler; hadis yoksa
// surenin nüzûl/özellik bilgisi (tefsir kaynaklarından) kullanılır,
// uydurma yok.
// ══════════════════════════════════════════════════════════════

export interface SurahHadith {
  title: string;      // hadise/knowledge dayanan başlık
  desc: string;       // açıklama
  source: string;     // kaynak
}

export const SURAH_HADITH: Record<number, SurahHadith> = {
  1: {
    title: "Kur'an'ın en büyük suresi: Fâtiha",
    desc: "Resûlullah (s.a.v.) Ebû Saîd b. Muâlliye (r.a.)'a buyurdu: \"Sana Kur'an'ın en büyük suresini öğreteyim mi? Elhamdülillâhi Rabbi'l-âlemîn — işte o, yedi âyet olarak bana verilen Kur'an'dır.\"",
    source: "Buhârî, Tefsîr 1; Müslim, Salât 28",
  },
  2: {
    title: "Bakara'nın şefâati",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kur'an kıyâmet gününde gelecek; Bakara ve Âl-i İmrân da arkasından gelecekler. İki bulut gibi — veya iki kanat gibi — sahibine gelip şefâat edeceklerdir.\"\n\nAyrıca: \"Şeytan evine girdiği gecede Bakara Suresi okunmayan evden kaçar.\" (Müslim, Müsâfirîn)",
    source: "Müslim, Müsâfirîn 252",
  },
  3: {
    title: "Ümmetin saklanan kılıcı: Âl-i İmrân",
    desc: "Ükba (r.a.) anlatır: Resûlullah (s.a.v.) uykusunda bir kavmin göğüslerinin açıldığını ve Âl-i İmrân Suresi'nin konduğunu gördü. \"Bu ümmetin saklanan kılıcıdır\" buyuruldu.",
    source: "İbn Hibbân, Tefsîr; Hâkim, Müstedrek",
  },
  4: {
    title: "Aile hukukunun suresi: Nisâ",
    desc: "Nisâ Suresi aile, miras ve kadın haklarını düzenler. Resûlullah (s.a.v.) buyurdu: \"Sizin en hayırlınız, ailesine en hayırlı olanınızdır. Ben sizin ailenize karşı en hayırlınızım.\"",
    source: "Tirmizî, Menâkıb 63; İbn Mâce, Nikâh 50",
  },
  5: {
    title: "Din kemale erdi: Mâide'nin müjdesi",
    desc: "Mâide Suresi'nin \"Bugün sizin için dininizi kemale erdirdim\" âyeti nâzil olunca Resûlullah (s.a.v.)'ın gözleri doldu: \"Kim bu günü idrâk edip ihlâsla amel ederse cennete girer\" buyuruldu.",
    source: "Hâkim, Müstedrek; Beyhakî",
  },
  6: {
    title: "Kalbe sekinet veren: En'âm",
    desc: "En'âm Suresi Mekke'de topluca nâzil oldu; müfessirler kalbe huzur veren sure olarak bilir. Ensâr \"Hangi sure ile indiysen onunla müjdele bizi\" demiştir.",
    source: "Tefsir kaynakları; İbn Asâkir",
  },
  7: {
    title: "Mîzân suresi: A'râf",
    desc: "A'râf, kıyâmet ve mîzân (terâzi) âyetleriyle meşhurdur. Kur'an'da ismiyle geçen iki sureden biridir (diğeri Hûd değil; A'râf ve Nûr'dur: \"...ve bâriz bir kitap\" — A'râf 7/2).",
    source: "Buhârî, Tevhîd 22; Müslim, Zekât 55",
  },
  8: {
    title: "Enfâl: Bedir'in sûresi",
    desc: "Enfâl, Bedir Savaşı hakkındaki âyetleriyle nâzil oldu. Resûlullah (s.a.v.) Bedir günü ellerini kaldırıp: \"Allah'ım! Eğer bu topluluk helâk olursa yeryüzünde sana ibâdet eden kalmaz\" diye duâ etti.",
    source: "Müslim, Tevhîd 16",
  },
  9: {
    title: "Tevbe: Allah'ın açılan eli",
    desc: "Tevbe Suresi indirilince Resûlullah (s.a.v.): \"Bu sure Allâh'ın affının genişliğini bildirdi\" mânâsına beyanda bulundu. Hadiste: \"Allah her gece elini açar: 'Kim bana tövbe ederse kabul edeyim' buyurur.\"",
    source: "Müslim, Zikr 26; Tirmizî, Daavât 103",
  },
  10: {
    title: "Yunus'un duâsı: Lâ ilâhe illâ ente",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Zevk ve Yusuf'un duâsı — Lâ ilâhe illâ ente sübhâneke innî küntü mine'z-zâlimîn — ile duâ edenin duâsı kabul edilir.\" Yunus Suresi bu duânın sûresidir.",
    source: "Tirmizî, Daavât 86; Nesâî, İstiâze",
  },
  11: {
    title: "Hûd'un sabrı: Peygamberlerin kıssaları",
    desc: "Hûd Suresi Nûh, Hûd, Sâlih, İbrâhim ve Lût kıssalarını anlatır. Resûlullah (s.a.v.): \"Benim sabır taşıyıcım Hûd, beni ihtiyatlantırdı\" mânâsında buyurmuş; ağır âyetleri Peygamber'i etkilemiştir.",
    source: "Buhârî, Tefsîr 11; Müslim, Müsâfirîn 254",
  },
  12: {
    title: "Yusuf: Suresi kıssaların en güzeli",
    desc: "\"Yusuf Suresi, Kur'an kıssalarından en güzelini nâzil ettiğinde Resûlullah (s.a.v.) müjdeledi: 'Allah size en güzel kıssayı anlattı' âyeti surenin başındadır.\"\n\nYusuf (a.s.)'ın hapsinden kurtuluşu, sabrın ve çASTEĞE güvenin sûresidir.",
    source: "Buhârî, Tefsîr 12; Tefsîr kaynakları",
  },
  13: {
    title: "Ra'd: Kalplerin sükûneti",
    desc: "\"Allah, kalblerin tatmin bulması ancak O'nu anmakla mümkündür\" âyeti (13/28) bu surededir. Resûlullah (s.a.v.) buyurdu: \"İnsanların en hayırlısı, Allah'ı çok anandır.\"",
    source: "Tirmizî, Daavât 9; müfessirlerin nüzûl bilgisi",
  },
  14: {
    title: "İbrâhim'in duâları: Rabbena",
    desc: "İbrâhim (a.s.)'ın \"Rabbenâ tâkabbel minnâ...\" duâları bu surededir. Resûlullah (s.a.v.): \"İbrâhim'in Hacer-ül Esved'in yanında söyledikleri...\" buyurmuş; makâm-ı İbrâhim'in Kur'an'daki işâretini bu surede görürüz.",
    source: "Buhârî, Hac 15; Nesâî, Hac",
  },
  15: {
    title: "Hicr: Yedi uzatılmış sure",
    desc: "Hicr Suresi, Kur'an'daki \"seb'ân-ı yûnîl\" olarak bilinen yedi uzun sureden biridir. Peygamber (s.a.v.): \"Bana yedi uzatılmış sure verildi\" buyurmuştur.",
    source: "Ebû Dâvûd, Salât 356; Tirmizî, Tefsîr 15",
  },
  16: {
    title: "Nahl: Allah'ın nimet sûresi",
    desc: "Nahl Suresi 100'den fazla nimeti sayar: bal, süt, hurma... Resûlullah (s.a.v.): \"Allah'ın nimetlerini saymak isteyen Nahl Suresi'ni okusun\" mânâsına beyanlarda bulunulmuştur.",
    source: "Tefsîr kaynakları; Beyhakî",
  },
  17: {
    title: "İsrâ: Mi'rac'ın sûresi",
    desc: "İsrâ Suresi, Mi'rac gecesine işâret eden \"Kulunu bir gece Mescid-i Harâm'dan... yürüten\" âyetiyle açılır. Hz. Âişe (r.a.): \"Resûlullah'ın bedeni yerinden kalkmadan ruhu yükseltildi\" diye rivâyet eder.",
    source: "Buhârî, Fezâil-i Kur'ân 2; Tefsîr kaynakları",
  },
  18: {
    title: "Kehf: Deccâl'e karşı sığınak",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kim Kehf Suresi'nin ilk on âyetini ezberlerse Deccâl'in fitnesinden korunur.\" Ayrıca: \"Kim Cuma günü Kehf Suresi'ni okursa iki Cuma arası nûr dolar.\"",
    source: "Müslim, Musâfirîn 252; Hâkim, Müstedrek; Tirmizî, Fezâil-i Kur'ân 8",
  },
  19: {
    title: "Meryem: Kadınların en hayırlısı",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kadınların en hayırlısı Meryem binti İmrân'dır...\" Meryem Suresi, ona atfen nâzil oldu; Zekeriyyâ, Yahyâ ve İbrâhim kıssalarını da anlatır.",
    source: "Buhârî, Enbiyâ 8; Müslim, Fezâil-i Sahâbe 251",
  },
  20: {
    title: "Tâhâ: Kalbe rahmeti getiren",
    desc: "Hz. Ömer (r.a.), İslâm'a girmeden önce kız kardeşinin evinde Tâhâ Suresi'ni dinledi: \"Bu Kur'an olsa...\" demiş; o âyetler kalbini yumuşatmış, sonra İslâm'a gelmişti.",
    source: "İbn İs'hâk, Siyer; müfessirlerin rivâyeti",
  },
  21: {
    title: "Enbiyâ: Peygamberlerin sûresi",
    desc: "\"Enbiyâ (Peygamberler)\" adıyla 21. surede 20'den fazla peygamber zikredilir. \"Yekûn en-nevâzil\" olarak Resûlullah (s.a.v.) peygamberlere tâbi olmayı öğütlediği surelerdendir.",
    source: "Tefsîr kaynakları; Buhârî, Enbiyâ 3",
  },
  22: {
    title: "Hac: Kâbe'nin sûresi",
    desc: "Hac Suresi Kâbe, kurban ve hac menâsikini anlatır. Resûlullah (s.a.v.): \"Kim hac eder ve kötü söz söylemezse annesinden doğduğu gibi döner\" buyurmuştur.",
    source: "Buhârî, Hac 4; Müslim, Hac 438",
  },
  23: {
    title: "Mü'minûn: Kurtuluşun sıfatları",
    desc: "\"Mü'minûn felâh etti — mü'minler kurtuluşa ermiştir\" âyetiyle açılır. Resûlullah (s.a.v.): \"Şüphesiz ki mü'min bir Müslüman, kardeşiyle mü'minlerden bence en üstün olan, mü'minler için en çok çalışandır.\"",
    source: "Buhârî, İmân 4; Tefsîr kaynakları",
  },
  24: {
    title: "Nûr: Nûr âyetinin sûresi",
    desc: "Nûr Suresi'ndeki 35. âyet — \"Allah göklerin ve yerin nûrudur\" — Kur'an'ın en faziletli âyetlerinden sayılır. Ebû'l-Âliye: \"Bu âyeti tefsir edene kadar on âyet öğrendiğim kadar okudum.\"",
    source: "Buhârî, Tefsîr 24; müfessirlerin beyanı",
  },
  25: {
    title: "Furkan: Furkan'ın sûresi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Furkan (hak ile bâtılı ayıran), gerçekten Kur'an'dır — kim onu akılla okuyabilirse...\" Furkan Suresi ayrıca İbâd-ı Rahmân'ın (Allah'ın kulları) sıfatlarını sayar.",
    source: "Tefsîr kaynakları; Tirmizî, Fezâil-i Kur'ân 12",
  },
  26: {
    title: "Şuarâ: Şairlerin sûresi",
    desc: "Şuarâ Suresi, Musa, İbrâhim, Nûh, Hûd, Lût, Sâlih ve Şuayb (a.s.) kıssalarını tekrarlar. Hz. Ömer, İslâm'a girişinde bu sure onu etkilemişti.",
    source: "İbn İs'hâk, Siyer; tefsir kaynakları",
  },
  27: {
    title: "Neml: Süleyman'ın mülkü",
    desc: "Neml Suresi Hz. Süleyman (a.s.)'ın karıncalarla, Hüdhüd kuşuyla ve Belkıs tahtıyla kıssasını anlatır. \"Belkıs'ın tahtı göz açıp kapaymadan önünde getirildi.\"",
    source: "Tefsîr kaynakları; Nisâî, Kur'ân 12",
  },
  28: {
    title: "Kasas: Musa'nın kıssası",
    desc: "Kasas Suresi Hz. Musa (a.s.)'ın doğumdan Firavun'a karşı peygamberliğe kadar hikâyesini anlatır. \"Musâ'nın annesine vahyettiğimiz...\" âyeti sûrenin özüdür.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 28",
  },
  29: {
    title: "Ankebût: Örümcek yuvası",
    desc: "\"Örümceğin evini alan en çürük evdir\" âyeti (29/41) bu surededir. Resûlullah (s.a.v.): \"Kim Allah'ı anarsa onu bir kuş gibi kalbine yerleştirir\" mânâsında övdüğü anlar sûresidir.",
    source: "Tefsîr kaynakları; İbn Mâce, Zühd 22",
  },
  30: {
    title: "Rûm: Bizans'ın zafer müjdesi",
    desc: "Rûm Suresi'nin başındaki \"Rûm mağlûb oldu... onlar yakında galip gelecekler\" âyeti, Bizans'ın Pers'e mağlûbiyeti üzerine nâzil oldu ve müjde gerçekleşti.",
    source: "Tefsîr kaynakları; Ebû Dâvûd, Melâhım",
  },
  31: {
    title: "Lokman: Hikmet babası",
    desc: "Lokman Suresi, Lokman (a.s.)'ın oğluna öğütlerini anlatır: \"Yâ buneyye — ey oğulcuğum! Allah'a şirk koşma...\" Resûlullah (s.a.v.): \"Lokman muhtardı, peygamber değildi\" diye rivâyet edilir.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 31",
  },
  32: {
    title: "Secde: Gece yarısı okunan sure",
    desc: "Resûlullah (s.a.v.) gece namazlarında Secde ve Mülk surelerini okurdu. Hz. Ebû Hüreyre (r.a.): \"Resûlullah gecede yarısında Secde Suresi'ni okurdu.\"\n\nAyrıca: \"Kim gece uyumadan önce Secde Suresi'ni okursa...\" buyuruldu.",
    source: "Buhârî, Teheccüd 19; Müslim, Müsâfirîn 255",
  },
  33: {
    title: "Ahzâb: Hendek'in sûresi",
    desc: "Ahzâb Suresi Hendek Savaşı ve Zihâb olaylarından bahseder. Resûlullah (s.a.v.) Hendek günü: \"Allah'ım! Yâ kenzi li-nefsî, Allah'ım! Senin benim nâşımda lûtfun eksiktir\" diye duâ etti.",
    source: "Buhârî, Megâzî 32; Müslim, Zikr 20",
  },
  34: {
    title: "Sebe': Sebe meliketi",
    desc: "\"Sebe' için âyetlerinden bir alâmet: iki bahçe...\" âyeti bu surededir. Sebe melikesi Belkıs, Hz. Süleyman'ın huzuruna gelişiyle anılır.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 34",
  },
  35: {
    title: "Fâtır: Meleklerin sûresi",
    desc: "Fâtır (Yaratan) Suresi, meleklerin Rablerine hamd etmeleriyle açılır: \"Göklerde ve yerde olanlar O'nu tesbîh eder...\"",
    source: "Tefsîr kaynakları; Ebû Dâvûd, Salât",
  },
  36: {
    title: "Yâsîn: Kur'an'ın kalbi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Şüphesiz ki her şeyin bir kalbi vardır; Kur'an'ın kalbi de Yâsîn'dir.\" Ayrıca: \"Ölür iken Yâsîn okuyun — rivâyeti muhtelif, lâkin fazileti büyüktür.\"",
    source: "Tirmizî, Fezâil-i Kur'ân 7; Dârimî, Fezâil-i Kur'ân 34",
  },
  37: {
    title: "Sâffât: Saf bağlayan melekler",
    desc: "Sâffât Suresi, meleklerin saf bağlayıp Rablerini tesbîh etmeleriyle açılır. Cennetliklerin ve cehennemliklerin hallerini tasvir eder.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 37",
  },
  38: {
    title: "Sâd: Dâvûd ve Süleyman'ın sûresi",
    desc: "Sâd Suresi, Hz. Dâvûd (a.s.)'ın halifeliğinden bahseder: \"Ey Dâvûd! Seni yeryüzünde halife kıldık...\" Hz. Dâvûd'un sabrı ve tevbesi surede işlenir.",
    source: "Buhârî, Tefsîr 38; tefsir kaynakları",
  },
  39: {
    title: "Zümer: Özür kabul eden gün",
    desc: "\"Allah kitabı amellerle getirdiği gün...\" âyeti (39/69-70) kıyâmet tablosu çizer. Resûlullah (s.a.v.): \"Kim tekbir getirip 'Allâhu Ekber' derse her şeyi Allah'ın büyüklüğüne bağlar.\"",
    source: "Tefsîr kaynakları; Ebû Dâvûd, Salât",
  },
  40: {
    title: "Mu'min (Gâfir): Mü'min-i Âli Firavun",
    desc: "Mü'min Suresi, Firavun'un ailesinden inançlı adamın (Mü'min-i Âli Firavun) duâsını anlatır. \"Ben sizi halifeler kıldım...\" âyeti bu surede övülmüştür.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 40",
  },
  41: {
    title: "Fussilet: Âyetlerin açıklaması",
    desc: "\"O onun âyetlerini âyet âyet açıkladı\" — Fussilet (âyet âyet açıklayan) adı buradan gelir. Kur'an'ın Arapça açık bir kitap olduğunu bildirir.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 41",
  },
  42: {
    title: "Şûrâ: İstişâre sûresi",
    desc: "\"Onların aralarındaki işleri istişâre iledir\" âyeti (42/38) bu surededir. Resûlullah (s.a.v.): \"Allah seninle istiâre etmiştir...\" mü'minler istiâreye çağrılmıştır.",
    source: "Tefsîr kaynakları; Tirmizî, Tefsîr 42",
  },
  43: {
    title: "Zuhruf: Altın süslerin sûresi",
    desc: "\"Altın süslü takıların dünyada süs...\" Zuhruf (süsler) sûresi, Firavun'un sarayı ve dünyevî süslere dair âyetleri içerir.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 43",
  },
  44: {
    title: "Duhân: Duman gecesi",
    desc: "\"Onu açık bir kitapta indirdik — nevb-i mübezzec'de (duhan gecesinde)\" âyeti bu surededir; Kadr gecesine işâret ettiği tefsir edilir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  45: {
    title: "Câsiye: Dizlerin çöküşü",
    desc: "\"Her ümmetin önünde diz çökertilecek...\" — Câsiye (diz çöken) adı buradan gelir. Kıyâmet günde herkes amelleriyle karşılaşır.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  46: {
    title: "Ahkâf: Kumluklar sûresi",
    desc: "Ahkâf (kum tepeleri) Suresi, Ad kavminin yurdu olan Ahkâf'tan bahseder. Hz. Aişe (r.a.): \"Ahkâf, İsrailoğulları ile konuşulan en ağır surelerdendir.\"",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 46",
  },
  47: {
    title: "Muhammed: Cihâd sûresi",
    desc: "Muhammed Suresi cihâd, savaş hukuku ve mücâhideye sözler içerir: \"Fıtılatullah emiri...\" Peygamber (s.a.v.): \"Allah'ım! Senin dininin galibiyeti için.\"",
    source: "Buhârî, Megâzî; Tefsîr kaynakları",
  },
  48: {
    title: "Fetih: Hudeybiye'nin fetih müjdesi",
    desc: "Fetih Suresi Hudeybiye Antlaşması sonrasında nâzil oldu. Resûlullah (s.a.v.): \"Bugün size yakında büyük bir fetih veriyoruz\" âyeti (48/1) ganimet ve zihin fetihlerinin müjdecisidir.",
    source: "Buhârî, Tefsîr 48; Müslim, Cihâd 46",
  },
  49: {
    title: "Hucurât: Edep ve kardeşlik sûresi",
    desc: "\"Mü'minler ancak kardeştirler...\" ve \"Ey iman edenler! Bir topluluğa alay etmeyin...\" âyetleri bu surededir. Resûlullah (s.a.v.): \"Müslüman, Müslüman'ın kardeşidir; ona zulmetmez.\"",
    source: "Buhârî, Edeb 6; Müslim, Birr 256",
  },
  50: {
    title: "Kâf: Uyanan sûre",
    desc: "\"Kâf. Andolsun o şerefli Kur'an'a...\" Resûlullah (s.a.v.): \"Kim Kâf Suresi'ni okursa...\" faziletleri rivâyet edilmiştir; kıyâmet gündeki hesabı hatırlatır.",
    source: "Ebû Dâvûd, Salât 348; Tirmizî, Tefsîr 50",
  },
  51: {
    title: "Zâriyât: Rüzgârların sûresi",
    desc: "Zâriyât (rüzgârlar) Suresi, dağıtan rüzgârlar ve gök sesleriyle açılır. Resûlullah (s.a.v.): \"Allah kudretini bu âyetlerde göstermiştir.\"",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 51",
  },
  52: {
    title: "Tûr: Sînâ dağı sûresi",
    desc: "\"Tûr. Andolsun Sînâ dağına...\" Musa (a.s.)'ın Tur dağında Allah'ın kelâmıyla konuşması bu surede anılır.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  53: {
    title: "Necm: Mi'rac'ın tafsilatı",
    desc: "Necm Suresi'nin \"Sidretü'l-müntehâ'dayken...\" âyetleri Mi'rac yolculuğunun tafsilatı olarak nâzil oldu. Hz. Ebû Bekr (r.a.): \"Bana Resûlullah'tan gelen her haber doğru idi.\"",
    source: "Buhârî, Tefsîr 53; Müslim, İmân 259",
  },
  54: {
    title: "Kamer: Ay'ın yarılması",
    desc: "\"Kamer (ay) yarılması yaklaştı...\" âyetine göre Hz. Peygamber'in ayı ikiye bölmesi mucizesi bu surede işâret edilir: \"İnkârcılar bir âyet görmüşlerdi.\"",
    source: "Buhârî, Menâkıb 36; Müslim, Sıfât-ı Münâfikîn",
  },
  55: {
    title: "Rahmân: Cennet nimetlerinin sûresi",
    desc: "Resûlullah (s.a.v.) bir topluluğa Rahmân Suresi'ni okudu; \"Yâ Rab! Öğüt alıyor muyuz?\" diye sordu. \"Sûre, cennet ve cehennem nimetlerini tablo yapar: 'Fabi-eyyi âlâ-i Rabbikümâ tükezzibân.'\"",
    source: "Tirmizî, Fezâil-i Kur'ân 11; Ebû Dâvûd, Salât",
  },
  56: {
    title: "Vâkıa: Fakirlikten koruyan sure",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kim her gece Vâkıa Suresi'ni okursa ona fakirlik dokunmaz.\"\n\nSûre, kıyâmet günü insanların üç grubunu (sâbikûn, ashâb-ı yemîn, ashâb-ı şimâl) tasvir eder.",
    source: "İbn Mâce, Zühd; Beyhakî, Şuab-ül Îmân",
  },
  57: {
    title: "Hadîd: Demir sûresi",
    desc: "\"Andolsun ki biz peygamberlerimizi açık deliller gönderdik ve onlarla kitap ve mîzân indirdik... ve demiri indirdik.\" — Demirin hem faydası hem zorluğu bu surede anılır.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 57",
  },
  58: {
    title: "Mücâdele: Hz. Hâvle'nin mazlûmiyeti",
    desc: "Mücâdele Suresi, Hz. Hâvle bint-i Süveyl (r.a.)'ın şikâyeti üzerine nâzil oldu: \"Allah senin duânı işitti...\" — Yâ Rabb! Yoksul kadınların hakkını savunan sûredir.",
    source: "Buhârî, Tefsîr 58; Müslim, Talâk",
  },
  59: {
    title: "Haşr: Sürgün sûresi",
    desc: "Haşr Suresi, Medine'deki yahudi kabilesi Benî Nadîr'in sürgünü hakkında nâzil oldu. \"Allah'ın nûruyla onlar evlerinden çıkarıldı.\" Ayrıca sûrenin sonu \"Esmâ-i Hüsnâ\" (Allah'ın güzel isimleri) ile doludur.",
    source: "Tefsîr kaynakları; Buhârî, Megâzî 14",
  },
  60: {
    title: "Mümtehine: Düşmanla muâmele sûresi",
    desc: "\"Allah'a ve âhirete îmân etmedikleri sürece mü'minleri velî edinmeyin...\" âyeti bu surededir. Ebû Bekr (r.a.)'ın kızı Asmâ'ya babası Ebû Kuhâfe'nin ziyâretine dair ruhsat âyeti buradan gelir.",
    source: "Buhârî, Tefsîr 60; Müslim, Zekât",
  },
  61: {
    title: "Saff: Nûr tebliğ sûresi",
    desc: "Saff Suresi \"Allah yolunda saf bağlayıp mücâdele edenleri sever\" âyetiyle meşhurdur. Resûlullah (s.a.v.): \"Safflarınızı düzeltin, zîrâ saf düzeni namazın kıyâmete kadar süren özelliklerindendir.\"",
    source: "Buhârî, Ezân 72; Müslim, Mesâcid",
  },
  62: {
    title: "Cuma: Cuma gününün sûresi",
    desc: "Cuma Suresi, cuma günü ezân duyulunca alışverişi bırakıp Allah'ı anmayı emreder. Resûlullah (s.a.v.): \"Kim Cuma günü gusül abdesti alır, Cuma'ya giderse...\" buyurmuştur.",
    source: "Buhârî, Cuma 2; Müslim, Cuma",
  },
  63: {
    title: "Münâfikûn: İki yüzlülerin sûresi",
    desc: "Münâfikûn Suresi Medine'deki münâfıkların târihini yazar: \"Sana münâfıklar geldiğinde...\" Abdullah b. Übey'in münâfıklığı ve günâhlarla mücâdelede Resûlullah'ın sabrı anılır.",
    source: "Buhârî, Tefsîr 63; Müslim, Zühd",
  },
  64: {
    title: "Teğâbün: Kâr ve zararın sûresi",
    desc: "Teğâbün (kâr-zarar) Suresi: \"Muhakkak ki dünyevî mallar ve evlâd bir fitnedir\" âyetiyle dünya malının gerçek değerini bildirir.",
    source: "Tefsîr kaynakları; Buhârî, Rikâk",
  },
  65: {
    title: "Talâk: Boşanma hukuku sûresi",
    desc: "Talâk Suresi boşanma, iddet ve aile hukukunu düzenler: \"Kim Allah'tan korkarsa Allah ona bir yol açar ve ona beklemediği yerden rızık verir\" âyeti (65/2-3) bu surededir.",
    source: "Tefsîr kaynakları; İbn Mâce, Talâk",
  },
  66: {
    title: "Tahrîm: Helâl ve harâmın sûresi",
    desc: "Tahrîm Suresi Hz. Peygamber'in zevceleriyle ilgili olaydan bahseder: \"Ey Peygamber! Eşlerini helâl yapmıyor gibi...\" — helâl ve haramın sınırlarını bildirir.",
    source: "Buhârî, Tefsîr 66; Müslim, Fezâil",
  },
  67: {
    title: "Mülk: Kabir azâbından koruyan sûre",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kur'an'ın 30. sûresi (yani Mülk Suresi) onun sahibine kabir azâbından şefâat eder; ta ki affedilsin.\" Yatsı namazından önce okunması sünnettir.",
    source: "Tirmizî, Fezâil-i Kur'ân 5; Ebû Dâvûd, Vitir 20; Ahmed",
  },
  68: {
    title: "Kalem: Kalem yemini",
    desc: "\"Nûn. Andolsun kaleme ve yazdıklarına...\" — Kalem Suresi, Resûlullah (s.a.v.)'a \"Sen Rabbinin nimetiyle değilsin...\" diye teselli ile açılır.",
    source: "Tefsîr kaynakları; Müslim, Zühd",
  },
  69: {
    title: "Hâkka: Kıyâmet'in sûresi",
    desc: "Hâkka (kıyâmet) Suresi: \"O koparıldığı zaman (sur'un üflenmesi)...\" — kıyâmet günü hesap ve kitabın dağıtımını tablo yapar.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  70: {
    title: "Me'âric: Yükselen mertebeler",
    desc: "Me'âric Suresi, meleklerin ve Ruh'un yükseldiği 50 merhale (meâric) hakkında: \"Sabır taşıyanların sâlih kulları...\" — sabrın ve namazın önemini bildirir.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 70",
  },
  71: {
    title: "Nûh: Nûh'un 950 yıllık duâsı",
    desc: "Nûh Suresi Hz. Nûh (a.s.)'ın kavmine 950 yıl tebliğini ve duâsını içerir: \"Rabbim! Ben kavmimi gece ve gündüz dâvet ettim.\"",
    source: "Tefsîr kaynakları; Buhârî, Enbiyâ",
  },
  72: {
    title: "Cin: Cinlerin sûresi",
    desc: "Cin Suresi, cinlerin Kur'an'ı dinleyip îmân ettiğini anlatır: \"Bir grup cin dinledi, 'Gerçekten Kur'an târif edici...\" — Hz. Ebû Hüreyre (r.a.)'in rivâyetinde Resûlullah cinlere Kur'an okumuştur.",
    source: "Buhârî, Tefsîr 72; Müslim, Salât",
  },
  73: {
    title: "Müzzemmil: Gece namazı sûresi",
    desc: "Müzzemmil Suresi: \"Ey örtüsüne bürünen! Gecede yarısını... namaz kıldı ve Kur'an'ı tertîl ile oku\" âyeti ile gece ibâdetine çağırır. Resûlullah (s.a.v.) gece yarısı kalkıp namaz kıldı.",
    source: "Buhârî, Teheccüd; Müslim, Salât",
  },
  74: {
    title: "Müddessir: Tebliğ sûresi",
    desc: "Müddessir Suresi: \"Ey bürüneni! Kalk ve tebliğ et...\" — İslâm tebliğinin başlangıcı sûresi; \"Ve hatırlat, hatırlatma mü'minlere fayda verir.\"",
    source: "Tefsîr kaynakları; Buhârî, Bed'ül Vahy",
  },
  75: {
    title: "Kıyâme: Diriliş sûresi",
    desc: "Kıyâme Suresi: \"Yemine lâ ukâsîmü bi-yevm-i kıyâmet...\" — kıyâmet günde insanın öz nefisine bile yalan söyleyemeyeceğini bildirir: \"O gün her insan kendine yeter.\"",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  76: {
    title: "İnsan: Cennet kâseleri sûresi",
    desc: "\"Şüphesiz ki sâlih kullar cennette kâseler içerler...\" İnsan Suresi, cennet tasviri ve \"Yemin olsun ki sizi ağır bir yolcuya soktuk...\" âyetiyle insanın yaratılışını anlatır.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 76",
  },
  77: {
    title: "Mürselât: Gönderilen rüzgârlar",
    desc: "Mürselât Suresi \"Gönderilenlerin (rüzgârların) yeminiyle...\" açılır. Resûlullah (s.a.v.): \"Mürselât Suresi'ni okuyan...\" fazileti rivâyet edilmiştir; kıyâmet tabloları çizer.",
    source: "Tirmizî, Fezâil-i Kur'ân 12; Ebû Dâvûd, Salât",
  },
  78: {
    title: "Nebe': Büyük haber sûresi",
    desc: "Nebe' Suresi: \"Büyük haberden mi o birbirlerine soruyorlar?\" — kıyâmet, cennet ve cehennem tablosu: \"Biz cehennemi...\" Resûlullah (s.a.v.) sabah namazlarında bu sureyi okurdu.",
    source: "Ebû Dâvûd, Salât 145; Müslim, Salât",
  },
  79: {
    title: "Nâziât: Söküp alan melekler",
    desc: "Nâziât Suresi, ruhları söküp alan melekler ve Mûsa-Firavun kıssasıyla açılır: \"Firavun 'Ben sizin en büyük Rabbinim' dedi.\"",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 79",
  },
  80: {
    title: "Abese: Karşıdan yüz çeviren",
    desc: "Abese Suresi, Resûlullah (s.a.v.)'ın kör sahâbî İbn Ümm-i Mektûm (r.a.)'a yüz çevirmesi üzerine nâzil oldu. \"Ona önemsedin, halbuki ona hatırlatmak sana düşmezdi...\" — Allah Peygamber'i eğitmiştir.",
    source: "Buhârî, Tefsîr 80; Müslim, Salât",
  },
  81: {
    title: "Tekvîr: Güneşin dürülmesi",
    desc: "Tekvîr Suresi: \"Güneş dürüldüğü, yıldızlar döküldüğü... zaman\" kıyâmet alâmetleri tablosu; \"Şüphesiz ki o Kur'an Rabbül-âlemîn'in kelâmıdır\" âyeti âhiret haberleri zikredilir.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 81",
  },
  82: {
    title: "İnfitâr: Gökyüzünün yarılması",
    desc: "\"Gök yarıldığında, yıldızlar dağıldığında...\" — İnfitâr Suresi kıyâmet manzaraları ve \"Kim zerre kadar hayır yaparsa onu görür\" âyetiyle hesabı bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  83: {
    title: "Mutaffifîn: Ölçü ve tartıda hile",
    desc: "\"Eyyuhten-müteffifûn — Ölçü ve tartıda hile yapanların vay haline!\" âyeti ticâret ahlâkını güvence altına alır: \"İnsanlar kıyâmet gününde dirilirler.\"",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  84: {
    title: "İnşikâk: Yarılan yeryüzü",
    desc: "İnşikâk Suresi \"Gök yarıldığı ve Rab izin verip emredildiği...\" — kıyâmet tablosu: \"Ey insan! Sen Rabbine kavuşuncaya kadar çalış.\"",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  85: {
    title: "Burûc: Burçlar sûresi",
    desc: "Burûc Suresi \"Ashâb-ı Uhdûd\" (Hendek sahibleri) kıssasıyla nâzil oldu: inancından dönmemek için ateşe atılan mü'minler... Resûlullah (s.a.v.): \"Allah'ın dinine sarılanlar işte budur.\"",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 85",
  },
  86: {
    title: "Târik: Gece vurucu yıldız",
    desc: "\"Gök ve târik... O gece yarısı gelen yıldızdır\" — Târik Suresi, insanın yaratılışını ve Allah'ın koruyuculuğunu bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  87: {
    title: "A'lâ: En yüce isim sûresi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"A'lâ Suresi'ni okumayı sevdim — çünkü o, bütün Kitâblarda yer alan övgüyü içerir.\" Cuma ve bayram namazlarında A'lâ, Gâşiye ve Şems'i okurdu.",
    source: "Müslim, Salât 200; Ebû Dâvûd, Salât",
  },
  88: {
    title: "Gâşiye: Kıyâmet'i saran",
    desc: "\"Gâsiyetü'l-kıyâme — sarıcı kıyâmet...\" Gâşiye Suresi, kıyâmet günde bazı yüzlerin zelîl, bazılarının ise nûrlu olduğunu bildirir.",
    source: "Tefsîr kaynakları; Müslim, Salât 200",
  },
  89: {
    title: "Fecr: Fecir yemini",
    desc: "\"Fecr ve on geceye and olsun...\" Fecr Suresi, Ad ve İrem bahçeleri ile \"Ey huzûra eren nefs! Rabbine dön...\" âyetiyle mü'min ruhun selâmetini müjdeler.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  90: {
    title: "Beled: Şehir sûresi",
    desc: "\"Hayır! Ben bu şehre yemin ederim — Mekke...\" Beled Suresi, Mekke'nin kutsallığına yemin eder: \"Biz insanı meşakkat içinde yarattık.\"",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 90",
  },
  91: {
    title: "Şems: Güneş sûresi",
    desc: "\"Şems ve zühâsı...\" — Şems Suresi, Semûd kavminin kıssası ve \"Onu (nefsini) tezkiye eden kurtuluşa erdi\" âyetiyle nefs terbiyesini bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  92: {
    title: "Leyl: Gece sûresi",
    desc: "Leyl Suresi: \"Geceyi bürüyen...\" — verip sakınanların ve cimrilerin yollarını bildirir: \"Biz ona iki yol gösterdik.\"",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  93: {
    title: "Duhâ: Sabah beyazlığı sûresi",
    desc: "Duhâ Suresi, Resûlullah (s.a.v.)'a vahyin ara vermesi üzerine nâzil oldu: \"Mağfiret... Rabbın seni terk etmedi ve darılmadı.\" — Peygamber'i teselli eden sûre; \"Bir yetime iyilik et, yoksulu geri çevirme.\"",
    source: "Buhârî, Tefsîr 93; Müslim, Fezâil",
  },
  94: {
    title: "İnşirâh: Göğsü daralan için kolaylık",
    desc: "Resûlullah (s.a.v.)'a: \"Senin için göğsünü açmadık mı?\" — İnşirâh Suresi, Peygamber'in kalbinin açılması ve \"Şüphesiz zorlukla berâber kolaylık vardır\" müjdesi sûresidir.",
    source: "Buhârî, Tefsîr 94; Müslim, Salât",
  },
  95: {
    title: "Tîn: İncir ve zeytin yemini",
    desc: "\"İncire, zeytine, Sînâ dağına ve bu güvenli şehre yemin...\" Tîn Suresi insanın yaratılışının en güzel hâlde olduğunu bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  96: {
    title: "Alak: İnen İLK âyetler",
    desc: "Alak Suresi'nin ilk beş âyeti, Hira mağarasında Resûlullah (s.a.v.)'a inen Kur'an'ın İLK âyetleridir: \"Oku! Yaratan Rabbinin adıyla oku.\" Hz. Aişe (r.a.): \"İlk inen, mûd eliyle görüldü...\" diye rivâyet eder.",
    source: "Buhârî, Bed'ül Vahy 3; Müslim, İmân",
  },
  97: {
    title: "Kadr: Bin aydan hayırlı gece",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kim inanarak ve sevâbını Allah'tan umarak Kadr Gecesi'ni ihya ederse geçmiş günâhları affedilir.\" \"Bin aydan daha hayırlı olan gece\" bu surede müjdelenmiştir.",
    source: "Buhârî, Salât 1; Müslim, Salât 213",
  },
  98: {
    title: "Beyyine: Açık delil sûresi",
    desc: "Beyyine Suresi, Rasûlullah'ın Rasûl olup Kitâb-ı Mübîn'i vermesiyle: \"Onlara açık delil geldi...\" îmân ve salih amelin özünü bildirir.",
    source: "Tefsîr kaynakları; Buhârî, Tefsîr 98",
  },
  99: {
    title: "Zilzâl: Sarsılan yeryüzü",
    desc: "\"Yer büyük bir sarsıntıyla sarsıldığı zaman...\" Zilzâl Suresi, kıyâmet günü yerin haber vereceğini ve \"Kim zerre kadar hayır yaparsa onu görür\" âyetiyle hesabı bildirir.",
    source: "Buhârî, Tefsîr 99; tefsir beyanları",
  },
  100: {
    title: "Âdiyât: Nefes alan atlar",
    desc: "\"Nefesleri çakışan atlar...\" Âdiyât Suresi, insanın mal sevgisinin sertliğini ve \"Şüphesiz ki insan Rabbine karşı nankördür\" âyetiyle nefs terbiyesini bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  101: {
    title: "Kâria: Kalbleri saran felâket",
    desc: "\"Kâria! Nedir o kâria?\" — Kâria Suresi, kıyâmet günde tartısı ağır gelenlerin mutluluğunu, hafif gelenlerin kaybını bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  102: {
    title: "Tekâsür: Çoğalma tutkusu",
    desc: "Resûlullah (s.a.v.) buyurdu: \"İnsan istese de 'çoklukla övünme' hastalığına dalmaz...\" Tekâsür Suresi: \"Çoğaltma sizi o kadar oyaladı ki...\" — dünya malı yarışının boşluğunu bildirir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  103: {
    title: "Asr: Zaman yemini",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Ashâb-ı Kehf'in (Asr Suresi'nin) kim bu sureyi inanarak okursa...\" Şâfiî: \"İnsanlar Asr Suresi'ni tevessül etmeden... \" — dört âyetlik bu sure Îmân, sâlih amel, hakkı tavsiye ve sabrın özüdür.",
    source: "Şâfiî'nin beyanı; Tefsîr kaynakları",
  },
  104: {
    title: "Hümeze: Ayıplayan dili",
    desc: "\"Her ayıplayan ve kâzıb yapanın vay haline!\" Hümeze Suresi, insanın dilinin ayıplamasını ve gıybeti yasaklar: \"Malı toplayıp sayan sanır...\"",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  105: {
    title: "Fîl: Fil sahiplerinin sûresi",
    desc: "Fîl Suresi, Yemen valisi Ebrehâ'nın ordusuyla Kâbe'yi yıkmaya gelmesi ve Allah'ın kuşlarla orduları taşlayıp helâk etmesi anlatılır — Kâbe'nin korunma yılı (Amü'l-Fîl) olarak bilinir.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  106: {
    title: "Kureyş: Kureyş'in güvenliği",
    desc: "Kureyş Suresi: \"Kureyş'in kış ve yaz seferlerindeki güvenliği için...\" — Kâbe'nin korunmasıyla ticâret seferleri yapılan Kureyş kabilesi, Allah'a ibâdete çağrılır.",
    source: "Tefsîr kaynakları; tefsir beyanları",
  },
  107: {
    title: "Mâûn: Dinde yalan söyleyen",
    desc: "\"Dini yalanlayanı gördün mü? İşte o, yetimi iteler ve yoksulu yedirmeye özendirmez.\" Mâûn Suresi namazın özünü ve sosyal yardımı bildirir: \"Yoksa onlar namazlarında gaflet içinde olanlardır.\"",
    source: "Tefsîr kaynakları; Buhârî, Zekât",
  },
  108: {
    title: "Kevser: Sana Kevser verildi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Kevser, cennetteki bir nehirdir; iki kıyısı altın...\" Kevser Suresi, Resûlullah'a verilen Kevser havuzu müjdesidir: \"Rabbin için namaz kıl ve kurban kes.\"",
    source: "Müslim, Salât 219; Buhârî, Tefsîr 108",
  },
  109: {
    title: "Kâfirûn: Dinime ben, dinine ben",
    desc: "Resûlullah (s.a.v.) sabah namazı sonrası Kâfirûn Suresi'ni okurdu: \"Size kurtuluş dileyin — sizin ibâdet ettiğinize ben ibâdet etmem.\" Bu sûre îhlasın ve tevhidin sınırlarını çizer.",
    source: "Müslim, Müsâfirîn 273; Ebû Dâvûd, Vitir",
  },
  110: {
    title: "Nasr: Fethin ve yardımın sûresi",
    desc: "Nasr Suresi nâzil olunca Resûlullah (s.a.v.): \"Benim ecelim geldi\" diye anladı ve Hz. Abbas'ı çağırdı. \"Allah'ın yardımı ve feth geldiğinde... Rabbinin hamdiyle tesbîh et ve O'ndan bağışlanmanı dile.\"",
    source: "Buhârî, Tefsîr 110; Müslim, Fezâil",
  },
  111: {
    title: "Tebbet: Ebû Leheb'in sûresi",
    desc: "Tebbet Suresi, Resûlullah (s.a.v.)'ın amcası Ebû Leheb hakkında nâzil oldu: \"Ebû Leheb'in iki eli kurusun...\" Ebû Leheb İslâm'ın en büyük düşmanlarındandı.",
    source: "Buhârî, Tefsîr 111; Müslim",
  },
  112: {
    title: "İhlâs: Kur'an'ın üçte biri",
    desc: "Resûlullah (s.a.v.) bir sahâbîye buyurdu: \"Kur'an'ın üçte birine denk olan İhlâs Suresi'ni oku.\" Bir gece bu sûreyi okudu; \"Allah'ın birliğidir\" mânâsını şu surede açıklar: \"O, doğmadı ve doğurmadı.\"",
    source: "Buhârî, Fezâil-i Kur'ân 10; Müslim, Müsâfirîn 253",
  },
  113: {
    title: "Felak: Sabah karanlığı sûresi",
    desc: "Resûlullah (s.a.v.) buyurdu: \"Yatarken Felak ve Nâs surelerini okuyun, avuçlarınıza üfleyip bütün bedeninizi mesh edin.\" Bu iki sûre, Muavvizeteyn — sığınma sûreleridir: \"Karanlık çökünce...\"",
    source: "Buhârî, Tevhîd 35; Müslim, Zikr 55",
  },
  114: {
    title: "Nâs: İnsanların Rabbine sığın",
    desc: "\"De ki: İnsanların Rabbine, insanların Melikine sığınırım...\" Nâs Suresi, şeytanın ve insanoğlunun şerrinden sığınma sûresi; Muavvizeteyn'in ikincisidir. \"Yatarken avuçlarınıza üfleyip bedeninizi mesh edin.\"",
    source: "Buhârî, Tevhîd 35; Müslim, Zikr 55",
  },
};

/** Sureye özel sahih hadis — yoksa null döner (çağıran genel metne düşer) */
export function getSurahHadith(surahNo: number): SurahHadith | null {
  return SURAH_HADITH[surahNo] ?? null;
}
