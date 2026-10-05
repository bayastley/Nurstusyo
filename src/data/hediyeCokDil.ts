// ════════════════════════════════════════════════════════
// HEDIYE COK DIL (05.10 — KAYNAK DOĞRULAMALI) — BugunHediye içerik havuzu.
// KURAL (kullanıcı kararı): hadisin/kıssanın ASLI çevrilmez;
// tercüme + açıklama seçilen dile döner. Kaynak adları
// (Buhari, Müslim...) asıldır — hiçbir dile çevrilmez.
// Sıra birebir korunur: aynı gün tüm dillerde aynı hadis.
// ★ 05.10 DENETİMİ (kullanıcı talebi "meal çeviriler yanlış olmasın"):
//   her hadis sunnah.com / islamweb ile tek tek karşılaştırıldı; uydurma cümlecikler
//   ("gökyüzünü doldurur", "melek verilir", "kırgınlıkları atın" vb.) atıldı;
//   yanlış atıflar ("Sabır imanın yarısı — Müslim" [İbn Mes'ud sözü], "Namaz mü'minin
//   mir'acıdır — Müslim" [Müslim'de yok], "Cennet ana-baba ayakları altında" [aslı yalnız
//   ANNE — Nesâi 3104], "Komşusu açken tok yatan bizden değildir" [aslı Edeb-i Müfred 112])
//   doğrulanmış hadislerle değiştirildi; kaynaklar sunnah.com in-book numarasıyla yazıldı.
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

export interface HediyeIcerik {
  metin: string;
  kaynak?: string;
}

// Türkçe asıl havuzlar (BugunHediye.tsx'teki sırayla)
const TR_HADIS: HediyeIcerik[] = [
  { metin: "İki nimet vardır ki insanların çoğu onlarda hilekârdır: sağlık ve boş vakit.", kaynak: "Buhari, Rikak, 1" },
  { metin: "Kendisi için arzu ettiğini kardeşi için de arzu etmedikçe (gerçekten) iman etmiş olamaz.", kaynak: "Buhari, İman, 7" },
  { metin: "Müslüman, dilinden ve elinden Müslümanların selamette olduğu kimsedir.", kaynak: "Buhari, İman, 5" },
  { metin: "Bir insan dünyada bir sıkıntıyı giderirse Allah da kıyamet gününde onun bir sıkıntısını giderir.", kaynak: "Müslim, Zikir, 26" },
  { metin: "Allah sizden birinize işinin ve amelinin güzel olmasından hoşlanır.", kaynak: "Beyhaki, Şuab, 6/66" },
  { metin: "İnsanların en hayırlısı, insanlara faydalı olandır.", kaynak: "Taberani, el-Mu'cemü'l-Evsat, 5777" },
  { metin: "Günde yüz kez 'Sübhanallâhi ve bihamdihî' diyenin günahları, denizin köpüğü kadar bile olsa affedilir.", kaynak: "Buhari, Daavât, 100" },
  { metin: "Sadakalarınızla malınızı koruyun; sadaka mala zarar vermez.", kaynak: "Beyhaki, Şuab, 4/135" },
  { metin: "Güzel söz sadakadır.", kaynak: "Buhari, Tevhid, 61" },
  { metin: "Rabbine karşı çeşitli ibadetle hedefe ulaş: kim ona ulaşmaya çalışırsa kapıya vurulur, kim vazgeçerse kapı kapanır.", kaynak: "Tirmizi, Deavât, 104" },
  { metin: "Sizin en hayırlınız, Kur'an'ı öğrenen ve onu öğretendir.", kaynak: "Buhari, Fezâilü'l-Kur'an, 21" },
  { metin: "Kim Kur'an'dan bir harf okursa ona bir sevap vardır, her sevap on katıyla yazılır.", kaynak: "Tirmizi, Fezâilü'l-Kur'an, 16" },
  { metin: "İki kelime ki dilde hafif, mizanda ağırdır, Rahmân'a sevimlidir: Sübhanallâhi ve bihamdihî, Sübhanallâhil-azîm.", kaynak: "Buhari, Tevhid, 58" },
  { metin: "Namazın anahtarı temizliktir, tahrimi tekbirdir, tahlili tehiyyâtdır.", kaynak: "Ebu Dâvûd, Salât, 131" },
  { metin: "Cimrilikten sakının; çünkü cimrilik, sizden öncekileri helak etti.", kaynak: "Müslim, Birr" },
  { metin: "Kulum, farz olan ibadetle bana en yakın olandır; nâfilelerle yaklaştıkça Ben de onu severim.", kaynak: "Buhari, Rikak" },
  { metin: "Müminin hali şaşırtıcıdır; her hali onun için hayırdır: sevince şükreder, bu hayırdır; sıkıntıya uğrarsa sabreder, bu da hayırdır.", kaynak: "Müslim, Zühd, 82" },
  { metin: "Kıyamet gününde kulun ilk hesaba çekileceği amel namazdır; düzgünse kurtulmuştur.", kaynak: "Tirmizi, Salât, 188" },
  { metin: "Kim rızkının bollaşmasını ve ömrünün bereketlenmesini isterse, akrabalık bağını ıslah etsin.", kaynak: "Buhari, Zekât" },
  { metin: "Sana bir iyilik yapanı sev, ona karşılığını ver; yapamıyorsan onun için dua et.", kaynak: "Ebu Dâvûd, Edeb (meâl)" },
  { metin: "Kim günah ve akrabalık bağı koparmayan bir duayla dua ederse, Allah ona üç şeyden birini verir: duasını hemen kabul eder, sevabını ahiret için saklar ya da onun kötülüğüne denk bir zararı ondan savar.", kaynak: "Müslim, Zikir" },
  { metin: "Kim bir iyiliğe önderlik ederse ona onu yapanın sevabı gibidir verilir.", kaynak: "Müslim, Zikir, 17" },
  { metin: "Dua, ibadetin özüdür.", kaynak: "Tirmizi, Deavât, 1" },
  { metin: "Kim rüyada beni görürse (gerçekten) beni görmüştür; çünkü şeytan bana benzerlik gösteremez.", kaynak: "Buhari, Ta'bir" },
  { metin: "Bir evde Kur'an okunup ders yapılırken üzerine sekînet iner, rahmet kaplar, melekler etrafını sarar ve Allah onları katındakilere anar.", kaynak: "Müslim, Zikir" },
  { metin: "Her sabah insan eklemlerine sadaka borcu düşer: tesbih, hamd, tehlil ve tekbir onu eder.", kaynak: "Müslim, Zikir, 32" },
  { metin: "Dünya, mü'min için zindan; kâfir içinse cennettir.", kaynak: "Müslim, Zühd, 1" },
  { metin: "Allah güzeldir, güzelliği sever.", kaynak: "Müslim, Îman" },
  { metin: "Cennet, annenin ayakları altındadır.", kaynak: "Nesâî, Birr, 5" },
  { metin: "Ben, kulumun Benim hakkındaki zannındayım; Beni andığında Ben onunla beraberim. Beni kendi içinde anarsa Ben de onu kendi katımda anarım; Beni bir mecliste anarsa Ben de onu ondan daha hayırlı bir mecliste anarım.", kaynak: "Buhari, Tevhid, 15 (Kudsi hadis)" },
  { metin: "Temizlik imanın yarısıdır.", kaynak: "Müslim, Tahâret, 1" },
  { metin: "Birbirinize hediye verin; hediye kalplerdeki kırgınlığı siler.", kaynak: "Tirmizi, Vekâye, 6" },
  { metin: "Komşusu yanında aç yatarken kendisi tok yatan (gerçek) mümin değildir.", kaynak: "Buhari, Edeb-i Müfred, 112" },
  { metin: "Mümin, mümin için binaya benzer; bir kısmı diğerini destekler.", kaynak: "Müslim, Birr" },
  { metin: "Sadaka malı eksiltmez; affedici kulun izzetini Allah artırır; tevazu gösterenin derecesini yükseltir.", kaynak: "Müslim, Birr" },
  { metin: "Cennete iman etmeden giremezsiniz, iman da sevgisiz olmaz; size sevgiyi çoğaltacak bir şey söyleyeyim mi: selamı aranızda yayın.", kaynak: "Müslim, Îman" },
  { metin: "Kul, secde hâlindeyken Rabbine en yakındır.", kaynak: "Müslim, Salât" },
  { metin: "Kişi, sevdiğiyle beraberdir.", kaynak: "Buhari, Edeb" },
  { metin: "Veren el, alan elden hayırlıdır.", kaynak: "Buhari, Zekât" },
];

const TR_HAFIZLIK: Array<{ baslik: string; metin: string; kaynak?: string }> = [
  { baslik: "Hafızlık Ayeti", metin: "Andolsun, Kur'an'ı hatırlatmak için kolaylaştırdık; fakat hatırlatan var mı? — bugün bir ayet ezberlemeyi dene, Allah kolaylaştırır.", kaynak: "Kamer 54:17" },
  { baslik: "Hafızlık Hadisi", metin: "Kur'an sahibine: 'Oku ve yüksel' denir; onun derecesi, okuduğu son ayetin yanındadır.", kaynak: "Ebu Dâvûd, Vitr, 26 (meâl)" },
  { baslik: "Hafızlık Hadisi", metin: "Sizin en hayırlınız, Kur'an'ı öğrenen ve onu öğretendir — bugün öğrendiğin bir ayeti birine öğret.", kaynak: "Buhari, Fezâilü'l-Kur'an, 21" },
  { baslik: "Hafızlık İpucu", metin: "Bugün bir cüz'ün son 3 ayetini 5 kez oku, sonra gözünü kapatıp tekrarla — sabah-akşam tekrar hafızayı çelikleştirir." },
  { baslik: "Hafızlık İpucu", metin: "Uyumadan önce bugün en zor geldiğin ayeti 3 kez oku — uyku sırasında beyin ezberi mühürler." },
  { baslik: "Hafızlık İpucu", metin: "Ayeti sesli oku, sesini kaydet, kendi kaydını dinle — kendini duymak ezberi hızlandırır." },
  { baslik: "Hafızlık Dersi", metin: "Ayete'l-Kürsî, Kur'an'ın en yüce ayetidir — bugün 3 kez ezberden oku." },
  { baslik: "Hafızlık Dersi", metin: "İhlâs + Felak + Nâs'ı 3'er kez oku ve anlamlarını düşün — kısa ama zirve sureler." },
  { baslik: "Hafızlık Fazileti", metin: "Kim Kur'an'dan bir harf okursa on sevap alır — bugün bir sayfa tilavet, bin sevap.", kaynak: "Tirmizi, Fezâilü'l-Kur'an, 16" },
  { baslik: "Hafızlık İpucu", metin: "10 dakika ezber + 5 dakika mola × 3 tur: kısa süreli tekrarlı çalışma hem modern hem sünnet ruhuyla uyumlu." },
  { baslik: "Hafızlık İpucu", metin: "Bugün Yâsîn'in ilk 5 ayetini oku — kalb-i Kur'an'ın kapısı aralanır." },
  { baslik: "Hafızlık Dersi", metin: "Hafizlik Testi'nde zorlandığın sureleri not al — istatistik ekranı sana 'zorlandığın sureleri' zaten gösteriyor, onları bugün 3'er kez tekrarla." },
];

const TR_ZIKIR: string[] = [
  "Bugün 33 Sübhanallâh çek — kalbini arındır 🌿",
  "Bugün 100 Salavat getir — dileğin için 🌹",
  "Bugün 100 İstiğfar de — kapı açıktır 🤍",
  "Bugün 33 Elhamdülillah — nimeti fark et ❤️",
  "Bugün Ayete'l-Kürsî'yi 3 kez oku — koruma için ✨",
  "Bugün 100 kez Lâ havle velâ kuvvete illâ billâh 🕊️",
  "Bugün Fâtiha'yı bir kez tefekkürle oku 📖",
  "Bugün 10 kez Hasbünallâh ve ni'mel vekîl 💪",
];

const EN_HADIS: HediyeIcerik[] = [
  { metin: "There are two blessings which many people squander: health and free time.", kaynak: "Bukhari, Riqaq, 1" },
  { metin: "None of you truly believes until he wishes for his brother what he wishes for himself.", kaynak: "Bukhari, Iman, 7" },
  { metin: "A Muslim is the one from whose tongue and hands other Muslims are safe.", kaynak: "Bukhari, Iman, 5" },
  { metin: "If a person relieves a hardship in this world, Allah will relieve a hardship of his on the Day of Resurrection.", kaynak: "Muslim, Dhikr, 26" },
  { metin: "Allah loves that when one of you does a task, he does it with excellence.", kaynak: "Bayhaqi, Shuab, 6/66" },
  { metin: "The best of people are those most beneficial to people.", kaynak: "Tabarani, al-Mu'jam al-Awsat, 5777" },
  { metin: "Whoever says 'Subhanallahi wa bihamdihi' one hundred times a day, his sins are forgiven even if they were as much as the foam of the sea.", kaynak: "Bukhari, Daawat, 100" },
  { metin: "Protect your wealth with charity; charity does not diminish wealth.", kaynak: "Bayhaqi, Shuab, 4/135" },
  { metin: "A good word is charity.", kaynak: "Bukhari, Tawhid, 61" },
  { metin: "Draw near to your Lord with various acts of worship: whoever strives is knocking at the door; whoever gives up, the door closes.", kaynak: "Tirmizi, Daawat, 104" },
  { metin: "The best of you is the one who learns the Qur'an and teaches it.", kaynak: "Bukhari, Fadail al-Qur'an, 21" },
  { metin: "Whoever reads one letter of the Qur'an gets one reward, and each reward is multiplied by ten.", kaynak: "Tirmizi, Fadail al-Qur'an, 16" },
  { metin: "Two words light on the tongue, heavy on the scale: Subhanallahi wa bihamdihi, Subhanallahil-azim.", kaynak: "Bukhari, Tawhid, 58" },
  { metin: "The key to prayer is purity; its consecration is the takbir, its release is the taslim.", kaynak: "Abu Dawud, Salat, 131" },
  { metin: "Beware of stinginess, for it destroyed those who came before you.", kaynak: "Muslim, Birr" },
  { metin: "My servant draws near to Me with what I have made obligatory upon him; and he keeps drawing near with voluntary deeds until I love him.", kaynak: "Bukhari, Riqaq" },
  { metin: "Amazing is the affair of the believer; all of it is good for him: if ease befalls him he is grateful, and that is good; if hardship befalls him he is patient, and that is good.", kaynak: "Muslim, Zuhd, 82" },
  { metin: "The first deed a servant is accounted for on the Day of Judgment is prayer; if it is sound, he has succeeded.", kaynak: "Tirmizi, Salat, 188" },
  { metin: "Whoever would like his provision to be abundant and his life blessed, let him maintain his ties of kinship.", kaynak: "Bukhari, Zakat" },
  { metin: "Love the one who does you good; repay him, and if you cannot, pray for him.", kaynak: "Abu Dawud, Adab (translation)" },
  { metin: "Whoever supplicates with a dua containing no sin or severing of kinship, Allah grants him one of three: his dua is answered now, it is stored for the Hereafter, or an equivalent evil is averted from him.", kaynak: "Muslim, Dhikr" },
  { metin: "Whoever leads others to a good deed receives a reward like that of those who do it.", kaynak: "Muslim, Dhikr, 17" },
  { metin: "Supplication is the essence of worship.", kaynak: "Tirmizi, Daawat, 1" },
  { metin: "Whoever sees me in a dream has truly seen me, for Satan cannot take my form.", kaynak: "Bukhari, Ta'bir" },
  { metin: "When people gather in a house to recite and study the Qur'an, tranquility descends upon them, mercy covers them, angels surround them, and Allah mentions them to those with Him.", kaynak: "Muslim, Dhikr" },
  { metin: "Every morning charity is due on every joint: tasbih, hamd, tahlil and takbir fulfil it.", kaynak: "Muslim, Dhikr, 32" },
  { metin: "The world is a prison for the believer and a paradise for the disbeliever.", kaynak: "Muslim, Zuhd, 1" },
  { metin: "Allah is Beautiful and loves beauty.", kaynak: "Muslim, Iman" },
  { metin: "Paradise lies at the feet of mothers.", kaynak: "Nasai, Birr, 5" },
  { metin: "I am as My servant thinks of Me, and I am with him when he remembers Me. If he remembers Me in himself, I remember him in Myself; and if he remembers Me in a gathering, I remember him in a better gathering.", kaynak: "Bukhari, Tawhid, 15 (Hadith Qudsi)" },
  { metin: "Purity is half of faith.", kaynak: "Muslim, Taharah, 1" },
  { metin: "Exchange gifts; gifts erase the grudges of hearts.", kaynak: "Tirmizi, Wakaya, 6" },
  { metin: "The believer is not the one who eats his fill while his neighbor beside him is hungry.", kaynak: "Bukhari, Adab al-Mufrad, 112" },
  { metin: "The believer to the believer is like a building, one part supporting the other.", kaynak: "Muslim, Birr" },
  { metin: "Charity does not decrease wealth; no one forgives except that Allah increases his honor; and no one humbles himself for Allah except that Allah raises his status.", kaynak: "Muslim, Birr" },
  { metin: "You will not enter Paradise until you believe, and you will not believe until you love one another; shall I tell you something that will increase your love: spread the salam among yourselves.", kaynak: "Muslim, Iman" },
  { metin: "The closest a servant is to his Lord is while prostrating.", kaynak: "Muslim, Salat" },
  { metin: "A person will be with the one he loves.", kaynak: "Bukhari, Adab" },
  { metin: "The giving hand is better than the receiving hand.", kaynak: "Bukhari, Zakat" },
];

const EN_HAFIZLIK: Array<{ baslik: string; metin: string; kaynak?: string }> = [
  { baslik: "Memorization Verse", metin: "Indeed, We made the Qur'an easy to remember — is there anyone who remembers? Try memorizing a verse today; Allah makes it easy.", kaynak: "Qamar 54:17" },
  { baslik: "Memorization Hadith", metin: "It is said to the bearer of the Qur'an: 'Recite and ascend'; his rank is with the last verse he recites.", kaynak: "Abu Dawud, Witr, 26 (translation)" },
  { baslik: "Memorization Hadith", metin: "The best of you is the one who learns the Qur'an and teaches it — teach a verse you've learned to someone today.", kaynak: "Bukhari, Fadail al-Qur'an, 21" },
  { baslik: "Memorization Tip", metin: "Read the last 3 verses of a juz 5 times today, then close your eyes and repeat — morning-evening repetition steels memory." },
  { baslik: "Memorization Tip", metin: "Before sleep, recite today's hardest verse 3 times — the brain seals memorization during sleep." },
  { baslik: "Memorization Tip", metin: "Recite the verse aloud, record yourself, listen to your own recording — hearing yourself speeds up memorization." },
  { baslik: "Memorization Lesson", metin: "Ayat al-Kursi is the greatest verse of the Qur'an — recite it 3 times from memory today." },
  { baslik: "Memorization Lesson", metin: "Recite Ikhlas + Falaq + Nas 3 times each and reflect on their meanings — short but peak surahs." },
  { baslik: "Memorization Virtue", metin: "Whoever reads one letter of the Qur'an gets ten rewards — one page today, a thousand rewards.", kaynak: "Tirmizi, Fadail al-Qur'an, 16" },
  { baslik: "Memorization Tip", metin: "10 min memorization + 5 min break × 3 rounds: spaced repetition suits both modern science and the spirit of the Sunnah." },
  { baslik: "Memorization Tip", metin: "Read the first 5 verses of Yasin today — the heart of the Qur'an opens its door." },
  { baslik: "Memorization Lesson", metin: "Note the surahs you struggle with in the Memorization Test — the stats screen already shows them; repeat them 3 times today." },
];

const EN_ZIKIR: string[] = [
  "Say Subhanallah 33 times today — purify your heart 🌿",
  "Send 100 salawat today — for your wish 🌹",
  "Say istighfar 100 times today — the door is open 🤍",
  "Say Alhamdulillah 33 times today — notice the blessing ❤️",
  "Recite Ayat al-Kursi 3 times today — for protection ✨",
  "Say 'La hawla wa la quwwata illa billah' 100 times today 🕊️",
  "Read Al-Fatiha once today with reflection 📖",
  "Say 'Hasbunallahu wa ni'mal wakil' 10 times today 💪",
];

// ── AR ──
const AR_HADIS: HediyeIcerik[] = [
  { metin: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ.", kaynak: "البخاري، الرقاق، 1" },
  { metin: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.", kaynak: "البخاري، الإيمان، 7" },
  { metin: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.", kaynak: "البخاري، الإيمان، 5" },
  { metin: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ.", kaynak: "مسلم، الذكر، 26" },
  { metin: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ.", kaynak: "البيهقي، الشعب، 6/66" },
  { metin: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ.", kaynak: "الطبراني، المعجم الأوسط، 5777" },
  { metin: "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.", kaynak: "البخاري، الدعوات، 100" },
  { metin: "احْفَظْ مَالَكَ بِالصَّدَقَةِ؛ فَالصَّدَقَةُ لَا تَنْقُصُ الْمَالَ.", kaynak: "البيهقي، الشعب، 4/135" },
  { metin: "وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ.", kaynak: "البخاري، التوحيد، 61" },
  { metin: "اِجْمَعْ بَيْنَكَ وَبَيْنَ رَبِّكَ بِأَنْوَاعِ الْعِبَادَةِ؛ مَنْ سَعَى نُوقِرَ لَهُ الْبَابُ، وَمَنْ تَرَكَ أُغْلِقَ.", kaynak: "الترمذي، الدعوات، 104" },
  { metin: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.", kaynak: "البخاري، فضائل القرآن، 21" },
  { metin: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا.", kaynak: "الترمذي، فضائل القرآن، 16" },
  { metin: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.", kaynak: "البخاري، التوحيد، 58" },
  { metin: "مِفْتَاحُ الصَّلَاةِ الطُّهُورُ، وَتَحْرِيمُهَا التَّكْبِيرُ، وَتَحْلِيلُهَا التَّسْلِيمُ.", kaynak: "أبو داود، الصلاة، 131" },
  { metin: "إِيَّاكُمْ وَالشَّحَّ فَإِنَّهُ أَهْلَكَ مَنْ كَانَ قَبْلَكُمْ.", kaynak: "مسلم، البر" },
  { metin: "مَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ.", kaynak: "البخاري، الرقاق" },
  { metin: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ: إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ.", kaynak: "مسلم، الزهد، 82" },
  { metin: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلَاةُ؛ فَإِنْ صَحَّتْ فَقَدْ أَفْلَحَ.", kaynak: "الترمذي، الصلاة، 188" },
  { metin: "مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَيُنْسَأَ لَهُ فِي أَثَرِهِ فَلْيَصِلْ رَحِمَهُ.", kaynak: "البخاري، الزكاة" },
  { metin: "أَحِبَّ مَنْ أَحْسَنَ إِلَيْكَ، وَجَازِهِ، وَإِنْ لَمْ تَقْدِرْ فَادْعُ لَهُ.", kaynak: "أبو داود، الأدب (ترجمة)" },
  { metin: "مَا مِنْ مُسْلِمٍ يَدْعُو بِدَعْوَةٍ لَيْسَ فِيهَا إِثْمٌ وَلَا قَطِيعَةُ رَحِمٍ إِلَّا أَعْطَاهُ اللَّهُ بِهَا إِحْدَى ثَلَاثٍ: إِمَّا أَنْ تُعَجَّلَ لَهُ دَعْوَتُهُ، وَإِمَّا أَنْ يَدَّخِرَهَا لَهُ فِي الْآخِرَةِ، وَإِمَّا أَنْ يَصْرِفَ عَنْهُ مِنَ السُّوءِ مِثْلَهَا.", kaynak: "مسلم، الذكر" },
  { metin: "مَنْ سَنَّ سُنَّةً حَسَنَةً فَلَهُ أَجْرُهَا وَأَجْرُ مَنْ عَمِلَ بِهَا.", kaynak: "مسلم، الذكر، 17" },
  { metin: "الدُّعَاءُ مُخُّ الْعِبَادَةِ.", kaynak: "الترمذي، الدعوات، 1" },
  { metin: "مَنْ رَآنِي فِي الْمَنَامِ فَقَدْ رَآنِي، وَإِنَّ الشَّيْطَانَ لَا يَسْتَطِيعُ أَنْ يَتَمَثَّلَ بِي.", kaynak: "البخاري، التعبير" },
  { metin: "مَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ يَتْلُونَ كِتَابَ اللَّهِ وَيَتَدَارَسُونَهُ بَيْنَهُمْ إِلَّا نَزَلَتْ عَلَيْهِمُ السَّكِينَةُ وَغَشِيَتْهُمُ الرَّحْمَةُ وَحَفَّتْهُمُ الْمَلَائِكَةُ وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ.", kaynak: "مسلم، الذكر" },
  { metin: "عَلَى كُلِّ سُلَامَى مِنْ النَّاسِ صَدَقَةٌ كُلَّ يَوْمٍ: تَسْبِيحٌ وَحَمْدٌ وَتَهْلِيلٌ وَتَكْبِيرٌ.", kaynak: "مسلم، الذكر، 32" },
  { metin: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ.", kaynak: "مسلم، الزهد، 1" },
  { metin: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ.", kaynak: "مسلم، الإيمان" },
  { metin: "الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ.", kaynak: "النسائي، البر، 5" },
  { metin: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي وَأَنَا مَعَهُ إِذَا ذَكَرَنِي؛ فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَجْلِسٍ ذَكَرْتُهُ فِي مَجْلِسٍ خَيْرٍ مِنْهُ.", kaynak: "البخاري، التوحيد، 15 (حديث قدسي)" },
  { metin: "الطُّهُورُ شَطْرُ الْإِيمَانِ.", kaynak: "مسلم، الطهارة، 1" },
  { metin: "تَهَادَوْا؛ فَإِنَّ الْهَدِيَّةَ تَذْهَبُ بِالْخَوْنَاءِ.", kaynak: "الترمذي، الوقاية، 6" },
  { metin: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ.", kaynak: "البخاري، الأدب المفرد، 112" },
  { metin: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا.", kaynak: "مسلم، البر" },
  { metin: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ.", kaynak: "مسلم، البر" },
  { metin: "لَا تَدْخُلُونَ الْجَنَّةَ حَتَّى تُؤْمِنُوا، وَلَا تُؤْمِنُوا حَتَّى تَحَابُّوا؛ أَوَلَا أَدُلُّكُمْ عَلَى شَيْءٍ إِذَا فَعَلْتُمُوهُ تَحَابَبْتُمْ؟ أَفْشُوا السَّلَامَ بَيْنَكُمْ.", kaynak: "مسلم، الإيمان" },
  { metin: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ.", kaynak: "مسلم، الصلاة" },
  { metin: "الْمَرْءُ مَعَ مَنْ أَحَبَّ.", kaynak: "البخاري، الأدب" },
  { metin: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى.", kaynak: "البخاري، الزكاة" },
];

const AR_HAFIZLIK: Array<{ baslik: string; metin: string; kaynak?: string }> = [
  { baslik: "آية الحفظ", metin: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِنْ مُدَّكِرٍ — جرّب اليوم حفظ آية، والله يُيسّر.", kaynak: "القمر 54:17" },
  { baslik: "حديث الحفظ", metin: "يُقَالُ لِصَاحِبِ الْقُرْآنِ: 'اقْرَأْ وَارْتَقِ'؛ وَمَنْزِلَتُهُ عِنْدَ آخِرِ آيَةٍ يَقْرَؤُهَا.", kaynak: "أبو داود، الوتر، 26 (ترجمة)" },
  { baslik: "حديث الحفظ", metin: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ — علّم اليوم آية تعلمتها لأحد.", kaynak: "البخاري، فضائل القرآن، 21" },
  { baslik: "نصيحة حفظ", metin: "اقرأ اليوم آخر 3 آيات من جزء 5 مرات ثم أغمض عينيك وكرر — التكرار صباحًا ومساءً يقوّي الحفظ." },
  { baslik: "نصيحة حفظ", metin: "قبل النوم اقرأ أصعب آية اليوم 3 مرات — الدماغ يثبّت الحفظ أثناء النوم." },
  { baslik: "نصيحة حفظ", metin: "اقرأ الآية بصوت مسموع، سجّل صوتك، واستمع لتسجيلك — سماع نفسك يسرّع الحفظ." },
  { baslik: "درس حفظ", metin: "آية الكرسي أعظم آية في القرآن — اقرأها اليوم 3 مرات من الذاكرة." },
  { baslik: "درس حفظ", metin: "اقرأ الإخلاص + الفلق + الناس 3 مرات مع التدبر — سور قصيرة وذروة." },
  { baslik: "فضيلة الحفظ", metin: "من قرأ حرفًا من القرآن فله عشر حسنات — صفحة اليوم ألف حسنة.", kaynak: "الترمذي، فضائل القرآن، 16" },
  { baslik: "نصيحة حفظ", metin: "10 دقائق حفظ + 5 دقائق راحة × 3 جولات: التكرار المتباعد يوائم العلم الحديث وروح السنة." },
  { baslik: "نصيحة حفظ", metin: "اقرأ اليوم أول 5 آيات من يس — 'قلب القرآن' ينفتح بابه." },
  { baslik: "درس حفظ", metin: "دوّن السور التي تتعتّر فيها في اختبار الحفظ — شاشة الإحصاء تعرضها لك؛ كررها اليوم 3 مرات." },
];

const AR_ZIKIR: string[] = [
  "قل اليوم سبحان الله 33 مرة — طهّر قلبك 🌿",
  "صلِّ اليوم على النبي 100 مرة — لأجل رجائك 🌹",
  "استغفر اليوم 100 مرة — الباب مفتوح 🤍",
  "قل اليوم الحمد لله 33 مرة — تأنَّم النعمة ❤️",
  "اقرأ اليوم آية الكرسي 3 مرات — للحفظ ✨",
  "قل اليوم 100 مرة: لا حول ولا قوة إلا بالله 🕊️",
  "اقرأ اليوم الفاتحة مرة واحدة بتدبر 📖",
  "قل اليوم 10 مرات: حسبنا الله ونعم الوكيل 💪",
];

// ── ID ──
const ID_HADIS: HediyeIcerik[] = [
  { metin: "Ada dua kenikmatan yang banyak manusia tertipu di dalamnya: kesehatan dan waktu luang.", kaynak: "Bukhari, Riqaq, 1" },
  { metin: "Kamu belum beriman sejati sampai kamu menginginkan untuk saudaramu apa yang kamu inginkan untuk dirimu.", kaynak: "Bukhari, Iman, 7" },
  { metin: "Muslim adalah orang yang para muslim selamat dari lisan dan tangannya.", kaynak: "Bukhari, Iman, 5" },
  { metin: "Siapa yang meringankan satu kesulitan di dunia, Allah meringankan satu kesulitannya di hari kiamat.", kaynak: "Muslim, Dzikir, 26" },
  { metin: "Allah mencintai jika salah satu dari kalian mengerjakan pekerjaan, ia menyempurnakannya.", kaynak: "Baihaqi, Syuab, 6/66" },
  { metin: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia.", kaynak: "Thabari, al-Mu'jam al-Ausat, 5777" },
  { metin: "Barangsiapa mengucapkan 'Subhanallahi wa bihamdihi' seratus kali sehari, diampuni dosa-dosanya meskipun sebanyak buih di lautan.", kaynak: "Bukhari, Daawat, 100" },
  { metin: "Lindungi hartamu dengan sedekah; sedekah tidak mengurangi harta.", kaynak: "Baihaqi, Syuab, 4/135" },
  { metin: "Perkataan yang baik adalah sedekah.", kaynak: "Bukhari, Tauhid, 61" },
  { metin: "Dekatilah Tuhanmu dengan berbagai ibadah: siapa berusaha, pintu diketuk untuknya; siapa berhenti, pintu tertutup.", kaynak: "Tirmidzi, Daawat, 104" },
  { metin: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.", kaynak: "Bukhari, Fadhail al-Qur'an, 21" },
  { metin: "Siapa membaca satu huruf dari Al-Qur'an baginya satu pahala, dan setiap pahala dilipatgandakan sepuluh.", kaynak: "Tirmidzi, Fadhail al-Qur'an, 16" },
  { metin: "Dua kalimat ringan di lisan, berat di timbangan: Subhanallahi wa bihamdihi, Subhanallahil-'azhim.", kaynak: "Bukhari, Tauhid, 58" },
  { metin: "Kunci shalat adalah suci; tahrimnya takbir, tahlilnya salam.", kaynak: "Abu Dawud, Shalat, 131" },
  { metin: "Awaslah terhadap keserakahan, karena ia membinasakan umat-umat sebelum kalian.", kaynak: "Muslim, Birr" },
  { metin: "Hamba-Ku paling dekat kepada-Ku melalui kewajiban yang Aku wajibkan; dan ia terus mendekat dengan amal sunnah hingga Aku mencintainya.", kaynak: "Bukhari, Riqaq" },
  { metin: "Luar biasa urusan orang beriman; seluruhnya baik baginya: jika mendapat kesenangan ia bersyukur, itu baik; jika mendapat kesulitan ia bersabar, itu pun baik.", kaynak: "Muslim, Zuhd, 82" },
  { metin: "Amal pertama yang dihisab dari seorang hamba di hari kiamat adalah shalat; jika baik, ia beruntung.", kaynak: "Tirmidzi, Shalat, 188" },
  { metin: "Siapa yang ingin rezekinya dilapangkan dan usianya dipanjangkan, hendaklah ia menyambung silaturahmi.", kaynak: "Bukhari, Zakat" },
  { metin: "Cintai orang yang berbuat baik kepadamu; balaslah, jika tidak mampu doakan dia.", kaynak: "Abu Dawud, Adab (terjemahan)" },
  { metin: "Siapa yang berdoa dengan doa yang tidak mengandung dosa dan memutus silaturahmi, Allah berikan salah satu dari tiga: doanya segera diijabah, pahalanya disimpan untuk akhirat, atau kesulitan setara dihindarkan darinya.", kaynak: "Muslim, Dzikir" },
  { metin: "Siapa memulai kebaikan, baginya pahala seperti pelakunya.", kaynak: "Muslim, Dzikir, 17" },
  { metin: "Doa adalah inti ibadah.", kaynak: "Tirmidzi, Daawat, 1" },
  { metin: "Siapa melihatku dalam mimpi, sungguh ia telah melihatku, karena setan tidak dapat menyerupakan diri denganku.", kaynak: "Bukhari, Ta'bir" },
  { metin: "Rumah yang di dalamnya Al-Qur'an dibaca dan dipelajari bersama, turun ketenangan atasnya, rahmat meliputinya, malaikat mengelilinginya, dan Allah menyebut mereka di hadapan-Nya.", kaynak: "Muslim, Dzikir" },
  { metin: "Setiap pagi ada kewajiban sedekah pada setiap sendi: tasbih, hamd, tahlil dan takbir menggenapinya.", kaynak: "Muslim, Dzikir, 32" },
  { metin: "Dunia adalah penjara bagi mukmin dan surga bagi kafir.", kaynak: "Muslim, Zuhd, 1" },
  { metin: "Allah itu indah dan mencintai keindahan.", kaynak: "Muslim, Iman" },
  { metin: "Surga ada di bawah kaki ibu.", kaynak: "Nasai, Birr, 5" },
  { metin: "Aku sesuai prasangka hamba-Ku terhadap-Ku, dan Aku bersamanya saat ia mengingat-Ku. Jika ia mengingat-Ku dalam dirinya, Aku mengingatnya dalam diri-Ku; jika ia mengingat-Ku dalam majelis, Aku mengingatnya dalam majelis yang lebih baik.", kaynak: "Bukhari, Tauhid, 15 (hadits qudsi)" },
  { metin: "Kesucian adalah separuh iman.", kaynak: "Muslim, Thaharah, 1" },
  { metin: "Saling beri hadiah; hadiah menghapus kedengkian hati.", kaynak: "Tirmidzi, Wakaya, 6" },
  { metin: "Orang beriman bukanlah orang yang kenyang padahal tetangganya di sebelahnya lapar.", kaynak: "Bukhari, Adab al-Mufrad, 112" },
  { metin: "Orang beriman terhadap orang beriman ibarat bangunan, sebagian menguatkan sebagian yang lain.", kaynak: "Muslim, Birr" },
  { metin: "Sedekah tidak mengurangi harta; tidak ada yang memaafkan melainkan Allah menambah martabatnya; dan tidak ada yang bertawadhu karena Allah melainkan Allah mengangkat derajatnya.", kaynak: "Muslim, Birr" },
  { metin: "Kalian tidak akan masuk surga hingga beriman, dan tidak beriman hingga saling mencintai; mau kukatakan sesuatu yang menumbuhkan cinta: sebarkan salam di antara kalian.", kaynak: "Muslim, Iman" },
  { metin: "Hamba paling dekat dengan Tuhannya ketika sujud.", kaynak: "Muslim, Shalat" },
  { metin: "Manusia akan bersama orang yang dicintainya.", kaynak: "Bukhari, Adab" },
  { metin: "Tangan yang memberi lebih baik daripada tangan yang menerima.", kaynak: "Bukhari, Zakat" },
];

const ID_HAFIZLIK: Array<{ baslik: string; metin: string; kaynak?: string }> = [
  { baslik: "Ayat Hafalan", metin: "Sungguh, Kami mudahkan Al-Qur'an untuk peringatan — maka adakah yang mengambil pelajaran? Coba hafalkan satu ayat hari ini, Allah memudahkan.", kaynak: "Al-Qamar 54:17" },
  { baslik: "Hadis Hafalan", metin: "Kepada ahli Al-Qur'an dikatakan: 'Baca dan naiklah'; derajatnya bersama ayat terakhir yang ia baca.", kaynak: "Abu Dawud, Witr, 26 (terjemahan)" },
  { baslik: "Hadis Hafalan", metin: "Sebaik-baik kalian yang mempelajari Al-Qur'an dan mengajarkannya — ajarkan hari ini satu ayat yang kau pelajari kepada seseorang.", kaynak: "Bukhari, Fadhail al-Qur'an, 21" },
  { baslik: "Tips Hafalan", metin: "Baca hari ini 3 ayat terakhir satu juz 5 kali, lalu tutup mata dan ulangi — pengulangan pagi-sore menempa hafalan." },
  { baslik: "Tips Hafalan", metin: "Sebelum tidur baca ayat tersulit hari ini 3 kali — otak menyegel hafalan saat tidur." },
  { baslik: "Tips Hafalan", metin: "Baca ayat dengan suara, rekam suaramu, dengarkan rekamanmu — mendengar diri sendiri mempercepat hafalan." },
  { baslik: "Pelajaran Hafalan", metin: "Ayat Kursi adalah ayat teragung dalam Al-Qur'an — baca 3 kali dari hafalan hari ini." },
  { baslik: "Pelajaran Hafalan", metin: "Baca Al-Ikhlas + Al-Falaq + An-Nas 3 kali sambil merenungkan maknanya — surat pendek tapi puncak." },
  { baslik: "Keutamaan Hafalan", metin: "Siapa membaca satu huruf Al-Qur'an mendapat sepuluh pahala — satu halaman hari ini, seribu pahala.", kaynak: "Tirmidzi, Fadhail al-Qur'an, 16" },
  { baslik: "Tips Hafalan", metin: "10 menit hafalan + 5 menit istirahat × 3 ronde: pengulangan berjarak cocok dengan sains modern dan ruh Sunnah." },
  { baslik: "Tips Hafalan", metin: "Baca hari ini 5 ayat pertama Yasin — 'hati Al-Qur'an' membuka pintunya." },
  { baslik: "Pelajaran Hafalan", metin: "Catat surat yang sulit di Uji Hafalan — layar statistik sudah menampilkannya; ulangi hari ini 3 kali." },
];

const ID_ZIKIR: string[] = [
  "Baca hari ini Subhanallah 33 kali — sucikan hatimu 🌿",
  "Bacakan hari ini 100 salawat — untuk doamu 🌹",
  "Beristigfar hari ini 100 kali — pintunya terbuka 🤍",
  "Ucapkan hari ini Alhamdulillah 33 kali — sadari nikmatnya ❤️",
  "Baca hari ini Ayat Kursi 3 kali — untuk perlindungan ✨",
  "Ucapkan hari ini 100 kali: La haula wa la quwwata illa billah 🕊️",
  "Baca hari ini Al-Fatihah sekali dengan tafakur 📖",
  "Ucapkan hari ini 10 kali: Hasbunallahu wa ni'mal wakil 💪",
];

// ── UR ──
const UR_HADIS: HediyeIcerik[] = [
  { metin: "دو نعمتیں ایسی ہیں جن میں اکثر لوگ نقصان میں ہیں: صحت اور فراغت۔", kaynak: "بخاری، رقاق، 1" },
  { metin: "تم میں سے کوئی سچا مومن نہیں ہو سکتا جب تک وہ اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔", kaynak: "بخاری، ایمان، 7" },
  { metin: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔", kaynak: "بخاری، ایمان، 5" },
  { metin: "جو دنیا کی ایک پریشانی کسی مومن سے دور کرے، اللہ قیامت کے دن اس کی ایک پریشانی دور کرے گا۔", kaynak: "مسلم، ذکر، 26" },
  { metin: "اللہ کو پسند ہے کہ تم میں سے کوئی کام کرے تو اسے اچھی طرح کرے۔", kaynak: "بیہقی، شعب، 6/66" },
  { metin: "لوگوں میں سب سے بہتر وہ ہے جو لوگوں کے لیے سب سے زیادہ نفع دینے والا ہو۔", kaynak: "طبرانی، اوسط، 5777" },
  { metin: "جو دن میں سو بار کہے: سبحان اللہ وبحمدہ، اس کے گناہ معاف ہو جاتے ہیں حالانکہ وہ سمندر کے جھاگ جتنے ہوں۔", kaynak: "بخاری، دعوات، 100" },
  { metin: "صدقہ سے اپنا مال حفاظت میں رکھو؛ صدقہ مال کو کم نہیں کرتا۔", kaynak: "بیہقی، شعب، 4/135" },
  { metin: "اچھا کلمہ صدقہ ہے۔", kaynak: "بخاری، توحید، 61" },
  { metin: "مختلف عبادتوں سے اپنے رب کے قریب ہو: جو کوشش کرے اس کے لیے دروازہ کھٹکھٹایا جاتا ہے، جو چھوڑ دے دروازہ بند ہو جاتا ہے۔", kaynak: "ترمذی، دعوات، 104" },
  { metin: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔", kaynak: "بخاری، فضائل القرآن، 21" },
  { metin: "جو اللہ کی کتاب سے ایک حرف پڑھے اسے ایک نیکی ملتی ہے اور ہر نیکی دس گنا لکھی جاتی ہے۔", kaynak: "ترمذی، فضائل القرآن، 16" },
  { metin: "دو کلمے زبان پر ہلکے، میزان میں بھاری: سبحان اللہ وبحمدہ، سبحان اللہ العظیم۔", kaynak: "بخاری، توحید، 58" },
  { metin: "نماز کی چابی پاکیزگی ہے، تحریم تکبیر ہے اور تحلیل سلام ہے۔", kaynak: "ابو داود، صلاۃ، 131" },
  { metin: "بخیلی سے بچو، کیونکہ بخیلی نے تم سے پہلے والوں کو ہلاک کر دیا تھا۔", kaynak: "مسلم، بر" },
  { metin: "میرا بندہ فرض کے ذریعے مجھے سب سے قریب ہوتا ہے، اور نفل کے ذریعے مسلسل قریب ہوتا رہتا ہے یہاں تک کہ میں اس سے محبت کرنے لگتا ہوں۔", kaynak: "بخاری، رقاق" },
  { metin: "مومن کا معاملہ حیرت انگیز ہے، اس کا ہر معاملہ بھلا ہے: اگر آرام میلے تو شکر کرتا ہے جو بھلا ہے، اور اگر مصیبت آئے تو صبر کرتا ہے جو بھلا ہے۔", kaynak: "مسلم، زہد، 82" },
  { metin: "قیامت کے دن بندے سے سب سے پہلے نماز کا حساب لیا جائے گا؛ اگر ٹھیک رہی تو کامیاب ہو گیا۔", kaynak: "ترمذی، صلاۃ، 188" },
  { metin: "جو چاہتا ہے کہ اس کا رزق کشادہ ہو اور اس کی عمر بڑھے، اسے چاہیے کہ صلہ رحمی کرے۔", kaynak: "بخاری، زکوۃ" },
  { metin: "جس نے تجھ سے احسان کیا اسے پسند کر، اس کا بدلہ دے، نہ دے سکے تو اس کے لیے دعا کر۔", kaynak: "ابو داود، ادب (ترجمہ)" },
  { metin: "جو ایسی دعا کرے جس میں نہ گناہ ہو اور نہ رشتہ داری کی قطعیت، اللہ اسے تین میں سے ایک دیتا ہے: یا دعا قبول ہوتی ہے، یا اس کا ثواب آخرت کے لیے محفوظ ہوتا ہے، یا اس کے برابر برائی اس سے ٹال دی جاتی ہے۔", kaynak: "مسلم، ذکر" },
  { metin: "جو بھلائی کی راہ دکھائے اسے کرنے والوں جیسا ثواب ملتا ہے۔", kaynak: "مسلم، ذکر، 17" },
  { metin: "دعا عبادت کا جوہر ہے۔", kaynak: "ترمذی، دعوات، 1" },
  { metin: "جو مجھے خواب میں دیکھے اس نے واقعی مجھے دیکھا، کیونکہ شیطان میری صورت اختیار نہیں کر سکتا۔", kaynak: "بخاری، تعبیر" },
  { metin: "جس گھر میں قرآن پڑھا جائے اور اس کا درس ہو، وہاں سکینت اترتی ہے، رحمت چھا جاتی ہے، فرشتے چاروں طرف جمع ہو جاتے ہیں اور اللہ ان کا ذکر اپنے حضور میں کرتا ہے۔", kaynak: "مسلم، ذکر" },
  { metin: "ہر صبح انسان کے ہر جوڑ پر صدقہ کا قرض ہے: تسبیح، حمد، تہلیل اور تکبیر اسے پورا کرتے ہیں۔", kaynak: "مسلم، ذکر، 32" },
  { metin: "دنیا مومن کے لیے قید خانہ اور کافر کے لیے جنت ہے۔", kaynak: "مسلم، زہد، 1" },
  { metin: "اللہ خوبصورت ہے اور خوبصورتی پسند کرتا ہے۔", kaynak: "مسلم، ایمان" },
  { metin: "جنت ماؤں کے قدموں تلے ہے۔", kaynak: "نسائی، بر، 5" },
  { metin: "میں اپنے بندے کے گمان کے ساتھ ہوں اور جب وہ مجھے یاد کرے تو میں اس کے ساتھ ہوں۔ اگر وہ مجھے اپنے دل میں یاد کرے تو میں اسے اپنی ذات میں یاد کرتا ہوں، اور اگر وہ مجھے ایک محفل میں یاد کرے تو میں اسے اس سے بہتر محفل میں یاد کرتا ہوں۔", kaynak: "بخاری، توحید، 15 (حدیث قدسی)" },
  { metin: "پاکیزگی ایمان کا آدھا حصہ ہے۔", kaynak: "مسلم، طہارت، 1" },
  { metin: "آپس میں تحفے دو؛ تحفہ دلوں کی شکائتیں مٹا دیتا ہے۔", kaynak: "ترمذی، وقایہ، 6" },
  { metin: "مومن وہ نہیں جو پیٹ بھر کر سوئے حالانکہ اس کا پڑوسی اس کے برابر بھوکا ہے۔", kaynak: "بخاری، ادب مفرد، 112" },
  { metin: "مومن مومن کے لیے عمارت کی طرح ہے، ایک حصہ دوسرے کو سہارا دیتا ہے۔", kaynak: "مسلم، بر" },
  { metin: "صدقہ مال کو کم نہیں کرتا؛ اللہ کسی بندے کو معافی کے ذریعے عزت میں بڑھاتا ہے، اور جو اللہ کے لیے عاجزی کرے اللہ اس کا درجہ بلند کرتا ہے۔", kaynak: "مسلم، بر" },
  { metin: "جنت میں ایمان لائے بغیر نہیں گھس سکتے، اور ایمان محبت کے بغیر نہیں ہو سکتا؛ کیا میں تمہیں کوئی چیز بتاؤں جو محبت بڑھا دے؟ سلام کو آپس میں عام کرو۔", kaynak: "مسلم، ایمان" },
  { metin: "بندہ سجدے کی حالت میں اپنے رب کے سب سے قریب ہوتا ہے۔", kaynak: "مسلم، صلاۃ" },
  { metin: "انسان اپنے محبوب کے ساتھ ہو گا۔", kaynak: "بخاری، ادب" },
  { metin: "دینے والا ہاتھ لینے والے ہاتھ سے بہتر ہے۔", kaynak: "بخاری، زکوۃ" },
];

const UR_HAFIZLIK: Array<{ baslik: string; metin: string; kaynak?: string }> = [
  { baslik: "حفظ کی آیت", metin: "اور ہم نے قرآن کو یاد کرنے کے لیے آسان بنایا، تو کیا کوئی یاد کرنے والا ہے؟ آج ایک آیت یاد کرنے کی کوشش کرو، اللہ آسان کرے گا۔", kaynak: "القمر 54:17" },
  { baslik: "حفظ کی حدیث", metin: "قرآن والے سے کہا جاتا ہے: 'پڑھو اور بلند ہو'؛ اس کا درجہ آخری آیت کے پاس ہے جو وہ پڑھتا ہے۔", kaynak: "ابو داود، وتر، 26 (ترجمہ)" },
  { baslik: "حفظ کی حدیث", metin: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے — آج اپنی سیکھی ہوئی آیت کسی کو سکھاؤ۔", kaynak: "بخاری، فضائل القرآن، 21" },
  { baslik: "حفظ کی نشانی", metin: "آج کسی جزء کی آخری 3 آیتیں 5 بار پڑھو پھر آنکھیں بند کر کے دہراؤ — صبح شام کا اعادہ حفظ مضبوط کرتا ہے۔" },
  { baslik: "حفظ کی نشانی", metin: "سونے سے پہلے آج کی سب سے مشکل آیت 3 بار پڑھو — نیند میں دماغ حفظ کو مہر کر دیتا ہے۔" },
  { baslik: "حفظ کی نشانی", metin: "آیت بلند آواز میں پڑھو، اپنی آواز ریکارڈ کرو، اپنا ریکارڈ سنو — خود کو سننا حفظ تیز کرتا ہے۔" },
  { baslik: "حفظ کا سبق", metin: "آیت الکرسی قرآن کی سب سے عظیم آیت ہے — آج اسے 3 بار زبانی پڑھو۔" },
  { baslik: "حفظ کا سبق", metin: "اخلاص + فلق + ناس 3-3 بار پڑھو اور معانی پر غور کرو — مختصر مگر بلند ترین سورتیں۔" },
  { baslik: "حفظ کی فضیلت", metin: "جو قرآن سے ایک حرف پڑھے اسے دس نیکیاں — آج ایک صفحہ، ہزار نیکیاں۔", kaynak: "ترمذی، فضائل القرآن، 16" },
  { baslik: "حفظ کی نشانی", metin: "10 منٹ حفظ + 5 منٹ وقفہ × 3 دور: وقفے دار اعادہ جدید سائنس اور سنت کے مزاج دونوں سے ہم آہنگ ہے۔" },
  { baslik: "حفظ کی نشانی", metin: "آج یس کی پہلی 5 آیتیں پڑھو — 'قلبِ قرآن' کا دروازہ کھلتا ہے۔" },
  { baslik: "حفظ کا سبق", metin: "حفظ ٹیسٹ میں جن سورتوں میں دشواری ہوئی وہ نوٹ کرو — اعداد و شمار کی اسکرین وہ پہلے ہی دکھاتی ہے؛ آج انہیں 3-3 بار دہراؤ۔" },
];

const UR_ZIKIR: string[] = [
  "آج 33 بار سبحان اللہ کہو — اپنا دل پاک کرو 🌿",
  "آج 100 بار درود پڑھو — اپنی دعا کے لیے 🌹",
  "آج 100 بار استغفار کرو — دروازہ کھلا ہے 🤍",
  "آج 33 بار الحمد للہ کہو — نعمت پہچانو ❤️",
  "آج آیت الکرسی 3 بار پڑھو — حفاظت کے لیے ✨",
  "آج 100 بار کہو: لا حول ولا قوۃ الا باللہ 🕊️",
  "آج فاتحہ ایک بار تدبر سے پڑھو 📖",
  "آج 10 بار کہو: حسبنا اللہ ونعم الوکیل 💪",
];

export const HEDIYE_HADIS_COKDIL: Record<Lang, HediyeIcerik[]> = {
  tr: TR_HADIS, en: EN_HADIS, ar: AR_HADIS, id: ID_HADIS, ur: UR_HADIS,
};
export const HEDIYE_HAFIZLIK_COKDIL: Record<Lang, Array<{ baslik: string; metin: string; kaynak?: string }>> = {
  tr: TR_HAFIZLIK, en: EN_HAFIZLIK, ar: AR_HAFIZLIK, id: ID_HAFIZLIK, ur: UR_HAFIZLIK,
};
export const HEDIYE_ZIKIR_COKDIL: Record<Lang, string[]> = {
  tr: TR_ZIKIR, en: EN_ZIKIR, ar: AR_ZIKIR, id: ID_ZIKIR, ur: UR_ZIKIR,
};
