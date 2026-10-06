// ════════════════════════════════════════════════════════
// KUTUPHANECOKDIL.TS — Ayet & Dua Kütüphanesi çok dil (06.10)
// İSTEK: "Kütüphane sekmesindeki hadis ve kıssa kartlarının TR
//   anlamlarını 5 dile çevir."
//  • Kartların AR ASILLARI (ar alanı) hiçbir dile çevrilmez —
//    yalnızca anlam (tr), başlık (title) ve kaynak (source) dillendirilir.
//  • LIBRARY_COKDIL id-HİZALIDIR (indeks değil) — dualar.ts'e yeni kayıt
//    eklenirse çevirisi olmayan kart TR'de kalır, kırılmaz.
//  • TR referans değerleri dualar.ts'te durur; burada yalnız çeviriler.
// Tüketiciler: modalsContainerBolumler.tsx (LibraryBolum), StudioApp.tsx
//   (useFromLibrary + libraryFiltered), ModalsContainer.tsx (lang geçişi)
// ════════════════════════════════════════════════════════

import type { Lang } from "../i18n";
import type { LibraryItem, LibraryType, Emotion } from "../dualar";

export interface KutuphaneCeviri { title: string; tr: string; source: string }

const LIBRARY_COKDIL: Partial<Record<Lang, Record<string, KutuphaneCeviri>>> = {
  en: {
    "ay-255": { title: "Ayat al-Kursi", tr: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of all; He watches over His creation at every moment.", source: "Surah Al-Baqarah, verse 255" },
    "ay-35": { title: "The Light of the Heavens and the Earth", tr: "Allah is the Light of the heavens and the earth.", source: "Surah An-Nur, verse 35" },
    "ay-6": { title: "With Hardship Comes Ease", tr: "Indeed, with hardship comes ease.", source: "Surah Ash-Sharh, verse 6" },
    "ay-286": { title: "Do Not Burden Us Beyond Our Strength", tr: "Our Lord, do not take us to task if we forget or err.", source: "Surah Al-Baqarah, verse 286" },
    "ay-186": { title: "I Am Truly Near", tr: "When My servants ask about Me, I am near; I answer the call of the caller when he calls upon Me.", source: "Surah Al-Baqarah, verse 186" },
    "ay-233": { title: "Hearts Find Rest in Remembrance", tr: "Know that hearts find rest in the remembrance of Allah.", source: "Surah Ar-Ra'd, verse 28" },
    "ay-13": { title: "If You Are Grateful, I Will Give You More", tr: "If you are grateful, I will surely increase you in favor.", source: "Surah Ibrahim, verse 7" },
    "ay-3": { title: "Whoever Trusts in Allah", tr: "Whoever places his trust in Allah — He is sufficient for him.", source: "Surah At-Talaq, verse 3" },
    "ay-11": { title: "Allah Wrong No One", tr: "Indeed, Allah does not wrong anyone even by an atom's weight.", source: "Surah An-Nisa, verse 40" },
    "ay-90": { title: "Allah Commands Justice", tr: "Indeed, Allah commands justice, excellence, and giving to relatives.", source: "Surah An-Nahl, verse 90" },
    "ay-45": { title: "Prayer Restrains from Evil", tr: "Observe the prayer; indeed, the prayer restrains from immorality and wrongdoing.", source: "Surah Al-Ankabut, verse 45" },
    "ay-87": { title: "The Call of Yunus", tr: "There is no deity except You; exalted are You. Indeed, I have been among the wrongdoers.", source: "Surah Al-Anbiya, verse 87" },
    "hd-niyet": { title: "Actions Are by Intentions", tr: "Actions are judged by intentions, and everyone will get what he intended.", source: "Bukhari & Muslim" },
    "hd-tebessum": { title: "A Smile Is Charity", tr: "Your smile in the face of your brother is charity.", source: "Tirmidhi, Al-Birr, 36" },
    "hd-ahlak": { title: "Fine Character", tr: "The most complete of the believers in faith are those with the finest character.", source: "Tirmidhi, Ar-Rada, 11" },
    "hd-kolay": { title: "Make Things Easy", tr: "Make things easy and do not make them difficult; give glad tidings and do not turn people away.", source: "Bukhari, Al-Ilm, 11" },
    "hd-merhamet": { title: "The Merciful Shows Mercy to the Merciful", tr: "The Most Merciful shows mercy to those who are merciful; be merciful to those on earth and the One above the heavens will be merciful to you.", source: "Tirmidhi, Al-Birr, 16" },
    "hd-zikir": { title: "The Best of You Learn the Qur'an", tr: "The best of you are those who learn the Qur'an and teach it.", source: "Bukhari, Fadail al-Qur'an, 21" },
    "du-rabbi": { title: "Rabbi Yassir Dua", tr: "My Lord, make it easy and do not make it hard. My Lord, complete it with good.", source: "Hadith / Ancient prayer" },
    "du-dunya": { title: "Good in This World and the Next", tr: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.", source: "Surah Al-Baqarah, verse 201" },
    "du-istihare": { title: "The Istikhara Dua", tr: "O Allah, I seek Your guidance by Your knowledge and Your power...", source: "Dua of Istikhara" },
    "du-sabah": { title: "Morning & Evening Remembrance", tr: "O Allah, by You we enter the morning and by You we enter the evening.", source: "Tirmidhi, Ad-Daawat, 13" },
    "du-tovbe": { title: "Sayyid al-Istighfar", tr: "O Allah, You are my Lord; there is no deity but You. You created me and I am Your servant.", source: "Bukhari, Ad-Daawat, 2" },
    "zk-subhan": { title: "Subhanallahi wa Bihamdihi", tr: "Glory be to Allah and all praise is His; glory be to Allah the Almighty.", source: "Bukhari, At-Tawhid, 58" },
    "zk-hasbuna": { title: "Hasbunallah", tr: "Allah is sufficient for us, and He is the best disposer of affairs.", source: "Surah Ali 'Imran, verse 173" },
    "zk-lailahe": { title: "The Word of Tawhid", tr: "There is no deity except Allah alone, without any partner.", source: "Bukhari, Beginning of Creation, 11" },
    "zk-esta": { title: "Istighfar", tr: "I seek forgiveness from Allah the Almighty and turn to Him in repentance.", source: "Muslim, Adh-Dhikr, 41" },
    "zk-lahavle": { title: "La Hawla wa La Quwwata", tr: "There is no power and no strength except through Allah.", source: "Bukhari, Adhan, 7" },
  },
  ar: {
    "ay-255": { title: "آية الكرسي", tr: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ — لا إله إلا هو الحي القيوم، لا تعوزه سنة ولا نوم.", source: "سورة البقرة، آية 255" },
    "ay-35": { title: "نور السماوات والأرض", tr: "الله نور السماوات والأرض.", source: "سورة النور، آية 35" },
    "ay-6": { title: "مع العسر يُسرًا", tr: "إن مع العسر يسرًا.", source: "سورة الشرح، آية 6" },
    "ay-286": { title: "لا يُكلّف الله نفسًا", tr: "ربنا لا تؤاخذنا إن نسينا أو أخطأنا.", source: "سورة البقرة، آية 286" },
    "ay-186": { title: "أنا قريب", tr: "وإذا سألك عبادي عني فإني قريب؛ أجيب دعوة الداع إذا دعان.", source: "سورة البقرة، آية 186" },
    "ay-233": { title: "القلوب تطمئن بالذكر", tr: "ألا بذكر الله تطمئن القلوب.", source: "سورة الرعد، آية 28" },
    "ay-13": { title: "لئن شكرتم لأزيدنكم", tr: "لئن شكرتم لأزيدنكم.", source: "سورة إبراهيم، آية 7" },
    "ay-3": { title: "ومن يتوكل على الله", tr: "ومن يتوكل على الله فهو حسبه.", source: "سورة الطلاق، آية 3" },
    "ay-11": { title: "الله لا يظلم", tr: "إن الله لا يظلم مثقال ذرة.", source: "سورة النساء، آية 40" },
    "ay-90": { title: "الله يأمر بالعدل", tr: "إن الله يأمر بالعدل والإحسان وإيتاء ذي القربى.", source: "سورة النحل، آية 90" },
    "ay-45": { title: "الصلاة تنهى عن الفحشاء", tr: "أقم الصلاة؛ إن الصلاة تنهى عن الفحشاء والمنكر.", source: "سورة العنكبوت، آية 45" },
    "ay-87": { title: "نداء يونس", tr: "لا إله إلا أنت سبحانك إني كنت من الظالمين.", source: "سورة الأنبياء، آية 87" },
    "hd-niyet": { title: "الأعمال بالنيات", tr: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.", source: "البخاري ومسلم" },
    "hd-tebessum": { title: "تبسمك صدقة", tr: "تبسمك في وجه أخيك لك صدقة.", source: "الترمذي، البر، 36" },
    "hd-ahlak": { title: "حسن الخلق", tr: "أكمل المؤمنين إيمانًا أحسنهم خلقًا.", source: "الترمذي، الرضاع، 11" },
    "hd-kolay": { title: "يسّروا ولا تعسّروا", tr: "يسروا ولا تعسروا، وبشروا ولا تنفروا.", source: "البخاري، العلم، 11" },
    "hd-merhamet": { title: "الرحماء يرحمهم الرحمن", tr: "الرحماء يرحمهم الرحمن؛ ارحموا من في الأرض يرحمكم من في السماء.", source: "الترمذي، البر، 16" },
    "hd-zikir": { title: "خيركم من تعلم القرآن", tr: "خيركم من تعلم القرآن وعلمه.", source: "البخاري، فضائل القرآن، 21" },
    "du-rabbi": { title: "دعاء رب يسر", tr: "رب يسر ولا تعسر، رب تمم بالخير.", source: "حديث شريف / دعاء" },
    "du-dunya": { title: "حسن الدنيا والآخرة", tr: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.", source: "سورة البقرة، آية 201" },
    "du-istihare": { title: "دعاء الاستخارة", tr: "اللهم إني أستخيرك بعلمك وأستقدرك بقدرتك...", source: "دعاء الاستخارة" },
    "du-sabah": { title: "ذكر الصباح والمساء", tr: "اللهم بك أصبحنا وبك أمسينا.", source: "الترمذي، الدعوات، 13" },
    "du-tovbe": { title: "سيد الاستغفار", tr: "اللهم أنت ربي لا إله إلا أنت؛ خلقتني وأنا عبدك.", source: "البخاري، الدعوات، 2" },
    "zk-subhan": { title: "سبحان الله وبحمده", tr: "سبحان الله وبحمده، سبحان الله العظيم.", source: "البخاري، التوحيد، 58" },
    "zk-hasbuna": { title: "حسبنا الله", tr: "حسبنا الله ونعم الوكيل.", source: "سورة آل عمران، آية 173" },
    "zk-lailahe": { title: "كلمة التوحيد", tr: "لا إله إلا الله وحده لا شريك له.", source: "البخاري، بدء الخلق، 11" },
    "zk-esta": { title: "الاستغفار", tr: "أستغفر الله العظيم وأتوب إليه.", source: "مسلم، الذكر، 41" },
    "zk-lahavle": { title: "لا حول ولا قوة إلا بالله", tr: "لا حول ولا قوة إلا بالله.", source: "البخاري، الأذان، 7" },
  },
  id: {
    "ay-255": { title: "Ayat Kursi", tr: "Allah, tidak ada tuhan selain Dia, Yang Mahahidup lagi terus-menerus mengurus makhluk-Nya.", source: "Surah Al-Baqarah ayat 255" },
    "ay-35": { title: "Cahaya Langit dan Bumi", tr: "Allah adalah cahaya langit dan bumi.", source: "Surah An-Nur ayat 35" },
    "ay-6": { title: "Bersama Kesulitan Ada Kemudahan", tr: "Sesungguhnya bersama kesulitan ada kemudahan.", source: "Surah Asy-Syarh ayat 6" },
    "ay-286": { title: "Jangan Bebankan yang Tak Mampu", tr: "Ya Tuhan kami, janganlah Engkau hukumi kami jika kami lupa atau tersalah.", source: "Surah Al-Baqarah ayat 286" },
    "ay-186": { title: "Aku Sangat Dekat", tr: "Jika hamba-hamba-Ku bertanya tentang Aku, sesungguhnya Aku dekat; Aku kabulkan doa orang yang berdoa.", source: "Surah Al-Baqarah ayat 186" },
    "ay-233": { title: "Hati Tenteram dengan Zikir", tr: "Ketahuilah, hanya dengan mengingat Allah hati menjadi tenteram.", source: "Surah Ar-Ra'd ayat 28" },
    "ay-13": { title: "Jika Bersyukur, Aku Tambahkan", tr: "Jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu.", source: "Surah Ibrahim ayat 7" },
    "ay-3": { title: "Siapa Bertawakal kepada Allah", tr: "Barangsiapa bertawakal kepada Allah, niscaya Allah mencukupinya.", source: "Surah At-Talaq ayat 3" },
    "ay-11": { title: "Allah Tidak Menzalimi", tr: "Sesungguhnya Allah tidak menzalimi seberat zarah pun.", source: "Surah An-Nisa ayat 40" },
    "ay-90": { title: "Allah Memerintahkan Keadilan", tr: "Sesungguhnya Allah memerintahkan berlaku adil, berbuat kebajikan, dan memberi kepada kerabat.", source: "Surah An-Nahl ayat 90" },
    "ay-45": { title: "Salat Mencegah Perbuatan Tercela", tr: "Dirikanlah salat; sesungguhnya salat mencegah dari perbuatan keji dan mungkar.", source: "Surah Al-Ankabut ayat 45" },
    "ay-87": { title: "Seruan Yunus", tr: "Tidak ada tuhan selain Engkau, Mahasuci Engkau; sesungguhnya aku termasuk orang zalim.", source: "Surah Al-Anbiya ayat 87" },
    "hd-niyet": { title: "Amal Bergantung pada Niat", tr: "Setiap amal bergantung pada niatnya, dan setiap orang mendapatkan apa yang ia niatkan.", source: "Bukhari & Muslim" },
    "hd-tebessum": { title: "Senyummu Sedekah", tr: "Senyummu di hadapan saudaramu adalah sedekah.", source: "Tirmidzi, Al-Birr, 36" },
    "hd-ahlak": { title: "Akhlak Terbaik", tr: "Orang mukmin yang paling sempurna imannya adalah yang paling baik akhlaknya.", source: "Tirmidzi, Ar-Rada, 11" },
    "hd-kolay": { title: "Permudahkanlah", tr: "Permudahkanlah dan jangan menyulitkan; gembirakanlah dan jangan menjauhkan.", source: "Bukhari, Al-Ilm, 11" },
    "hd-merhamet": { title: "Orang Penyayang Disayangi", tr: "Orang yang menyayangi akan disayangi Ar-Rahman; sayangilah yang di bumi, niscaya yang di langit menyayangimu.", source: "Tirmidzi, Al-Birr, 16" },
    "hd-zikir": { title: "Sebaik-baik Kalian Belajar Al-Qur'an", tr: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.", source: "Bukhari, Fadhail Al-Qur'an, 21" },
    "du-rabbi": { title: "Doa Rabbi Yassir", tr: "Ya Tuhanku, permudahkan dan jangan persulit. Ya Tuhanku, sempurnakan dengan kebaikan.", source: "Hadis / Doa kuno" },
    "du-dunya": { title: "Kebaikan Dunia dan Akhirat", tr: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.", source: "Surah Al-Baqarah ayat 201" },
    "du-istihare": { title: "Doa Istikharah", tr: "Ya Allah, aku meminta petunjuk dengan ilmu-Mu dan kekuatan-Mu...", source: "Doa Istikharah" },
    "du-sabah": { title: "Zikir Pagi & Petang", tr: "Ya Allah, dengan-Mu kami memasuki pagi dan dengan-Mu kami memasuki petang.", source: "Tirmidzi, Ad-Daawat, 13" },
    "du-tovbe": { title: "Sayyidul Istighfar", tr: "Ya Allah, Engkaulah Tuhanku, tidak ada tuhan selain Engkau; Engkau menciptakanku dan aku hamba-Mu.", source: "Bukhari, Ad-Daawat, 2" },
    "zk-subhan": { title: "Subhanallahi wa Bihamdihi", tr: "Mahasuci Allah dan segala puji bagi-Nya; Mahasuci Allah Yang Mahabesar.", source: "Bukhari, At-Tauhid, 58" },
    "zk-hasbuna": { title: "Hasbunallah", tr: "Cukuplah Allah sebagai penolong kami dan Dia sebaik-baik pelindung.", source: "Surah Ali 'Imran ayat 173" },
    "zk-lailahe": { title: "Kalimat Tauhid", tr: "Tidak ada tuhan selain Allah semata, tiada sekutu bagi-Nya.", source: "Bukhari, Awalul Khalq, 11" },
    "zk-esta": { title: "Istighfar", tr: "Aku memohon ampun kepada Allah Yang Mahabesar dan bertaubat kepada-Nya.", source: "Muslim, Az-Dzikr, 41" },
    "zk-lahavle": { title: "La Hawla wa La Quwwata", tr: "Tiada daya dan kekuatan kecuali dengan pertolongan Allah.", source: "Bukhari, Adzan, 7" },
  },
  ur: {
    "ay-255": { title: "آیت الکرسی", tr: "اللہ، اس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ ہے، سب کا نگہبان ہے۔", source: "سورہ البقرہ، آیت 255" },
    "ay-35": { title: "آسمانوں اور زمین کا نور", tr: "اللہ آسمانوں اور زمین کا نور ہے۔", source: "سورہ النور، آیت 35" },
    "ay-6": { title: "مشکل کے ساتھ آسانی", tr: "بے شک مشکل کے ساتھ آسانی ہے۔", source: "سورہ الشرح، آیت 6" },
    "ay-286": { title: "ہماری طاقت سے زیادہ بار نہ ڈال", tr: "اے ہمارے رب! اگر ہم بھول جائیں یا غلطی کریں تو ہمیں پکڑ نہ لے۔", source: "سورہ البقرہ، آیت 286" },
    "ay-186": { title: "میں بہت قریب ہوں", tr: "جب میرے بندے مجھ سے پوچھیں تو بے شک میں قریب ہوں؛ پکارنے والے کی پکار قبول کرتا ہوں۔", source: "سورہ البقرہ، آیت 186" },
    "ay-233": { title: "دل اللہ کے ذکر سے سکون پاتے ہیں", tr: "جان لو، اللہ کے ذکر سے ہی دل سکون پاتے ہیں۔", source: "سورہ الرعد، آیت 28" },
    "ay-13": { title: "شکر کرو گے تو زیادہ دوں گا", tr: "اگر تم شکر کرو گے تو میں تمہیں یقیناً زیادہ دوں گا۔", source: "سورہ ابراہیم، آیت 7" },
    "ay-3": { title: "جو اللہ پر بھروسہ کرے", tr: "جو اللہ پر توکل کرے، اللہ اس کے لیے کافی ہے۔", source: "سورہ الطلاق، آیت 3" },
    "ay-11": { title: "اللہ ظلم نہیں کرتا", tr: "بے شک اللہ ذرے کے برابر بھی ظلم نہیں کرتا۔", source: "سورہ النساء، آیت 40" },
    "ay-90": { title: "اللہ انصاف کا حکم دیتا ہے", tr: "بے شک اللہ انصاف، احسان اور رشتہ داروں کو دینے کا حکم دیتا ہے۔", source: "سورہ النحل، آیت 90" },
    "ay-45": { title: "نماز برائی سے روکتی ہے", tr: "نماز قائم کرو؛ بے شک نماز بے حیائی اور برائی سے روکتی ہے۔", source: "سورہ العنکبوت، آیت 45" },
    "ay-87": { title: "یونس علیہ السلام کی پکار", tr: "اس کے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ظالموں سے تھا۔", source: "سورہ الانبیاء، آیت 87" },
    "hd-niyet": { title: "اعمال کا دارومدار نیت پر ہے", tr: "اعمال کا دارومدار نیتوں پر ہے؛ ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔", source: "بخاری و مسلم" },
    "hd-tebessum": { title: "مسکراہنا صدقہ ہے", tr: "اپنے بھائی کے چہرے پر مسکراہنا بھی تمہارا صدقہ ہے۔", source: "ترمذی، البر، 36" },
    "hd-ahlak": { title: "اچھے اخلاق", tr: "ایمان میں سب سے کامل مومن وہ ہے جس کے اخلاق سب سے اچھے ہوں۔", source: "ترمذی، الرضاع، 11" },
    "hd-kolay": { title: "آسانی کرو", tr: "آسانی کرو، مشکل نہ کرو؛ خوشخبری دو، نفرت نہ دو۔", source: "بخاری، علم، 11" },
    "hd-merhamet": { title: "رحم کرنے والوں پر رحم", tr: "رحم کرنے والوں پر رحمان رحم کرتا ہے؛ زمین والوں پر رحم کرو، آسمان والا تم پر رحم کرے گا۔", source: "ترمذی، البر، 16" },
    "hd-zikir": { title: "تم میں بہترین قرآن سیکھنے والا", tr: "تم میں بہترین وہ ہے جو قرآن سیکھے اور سکھائے۔", source: "بخاری، فضائل القرآن، 21" },
    "du-rabbi": { title: "رب یسر دعا", tr: "اے میرے رب! آسانی فرما، مشکل نہ فرما۔ اے میرے رب! بھلائی کے ساتھ مکمل فرما۔", source: "حدیث شریف / قدیم دعا" },
    "du-dunya": { title: "دنیا و آخرت کی بھلائی", tr: "اے ہمارے رب! ہمیں دنیا میں بھلائی دے اور آخرت میں بھلائی دے اور ہمیں آگ کے عذاب سے بچا۔", source: "سورہ البقرہ، آیت 201" },
    "du-istihare": { title: "استخارہ کی دعا", tr: "اے اللہ! میں تیرے علم کے ساتھ بھلائی چاہتا ہوں اور تیری قدرت سے طاقت مانگتا ہوں...", source: "استخارہ کی دعا" },
    "du-sabah": { title: "صبح و شام کا ذکر", tr: "اے اللہ! تیرے ہی سے ہم صبح کرتے ہیں اور تیرے ہی سے شام کرتے ہیں۔", source: "ترمذی، الدعوات، 13" },
    "du-tovbe": { title: "سیدالاستغفار", tr: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں؛ تو نے مجھے پیدا کیا، میں تیرا بندہ ہوں۔", source: "بخاری، الدعوات، 2" },
    "zk-subhan": { title: "سبحان اللہ وبحمدہ", tr: "اللہ پاک ہے اور اس کی حمد ہے؛ عظمت والے اللہ کی پاکی ہے۔", source: "بخاری، التوحید، 58" },
    "zk-hasbuna": { title: "حسبنا اللہ", tr: "اللہ ہمارے لیے کافی ہے اور وہ بہترین کارساز ہے۔", source: "سورہ آل عمران، آیت 173" },
    "zk-lailahe": { title: "کلمہ توحید", tr: "اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں۔", source: "بخاری، بدء الخلق، 11" },
    "zk-esta": { title: "استغفار", tr: "میں عظمت والے اللہ سے بخشش مانگتا ہوں اور اس کی طرف رجوع کرتا ہوں۔", source: "مسلم، الذکر، 41" },
    "zk-lahavle": { title: "لا حول ولا قوۃ الا باللہ", tr: "گنجائش اور طاقت صرف اللہ کی طرف سے ہے۔", source: "بخاری، اذان، 7" },
  },
};

// ── Sekme etiketleri (TYPE_TABS) ──────────────────────────
const TIP_COKDIL: Partial<Record<Lang, Record<string, string>>> = {
  en: { tumu: "All", ayet: "Verses", hadis: "Hadith", dua: "Classic Prayers", zikir: "Dhikr / Tasbih" },
  ar: { tumu: "الكل", ayet: "الآيات", hadis: "الأحاديث", dua: "الأدعية", zikir: "الأذكار" },
  id: { tumu: "Semua", ayet: "Ayat", hadis: "Hadits", dua: "Doa-Doa", zikir: "Zikir / Tasbih" },
  ur: { tumu: "تمام", ayet: "آیات", hadis: "احادیث", dua: "دعائیں", zikir: "اذکار / تسبیح" },
};

// ── Duygu etiketleri (EMOTIONS) ───────────────────────────
const DUYGU_COKDIL: Partial<Record<Lang, Record<string, string>>> = {
  en: { tum: "All Moods", huzur: "Peace & Calm", sukur: "Gratitude & Blessings", sabir: "Patience & Relief", tevekkul: "Trust in Allah", rahmet: "Mercy & Repentance", ilim: "Knowledge & Wisdom", namaz: "Prayer & Worship" },
  ar: { tum: "كل المشاعر", huzur: "السكينة والهدوء", sukur: "الشكر والنعم", sabir: "الصبر والفرج", tevekkul: "التوكل والثقة", rahmet: "الرحمة والتوبة", ilim: "العلم والحكمة", namaz: "الصلاة والعبادة" },
  id: { tum: "Semua Suasana", huzur: "Tenang & Damai", sukur: "Syukur & Nikmat", sabir: "Sabar & Keringanan", tevekkul: "Tawakal & Percaya", rahmet: "Rahmat & Taubat", ilim: "Ilmu & Hikmah", namaz: "Salat & Ibadah" },
  ur: { tum: "تمام کیفیات", huzur: "سکون اور اطمینان", sukur: "شکر اور نعمتیں", sabir: "صبر اور راحت", tevekkul: "توکل اور بھروسہ", rahmet: "رحمت اور توبہ", ilim: "علم اور حکمت", namaz: "نماز اور عبادت" },
};

// ── Kart rozet etiketleri (TYPE_BADGE.label) ──────────────
const ROZET_COKDIL: Partial<Record<Lang, Record<string, string>>> = {
  en: { ayet: "VERSE", hadis: "HADITH", dua: "PRAYER", zikir: "DHIKR" },
  ar: { ayet: "آية", hadis: "حديث", dua: "دعاء", zikir: "ذكر" },
  id: { ayet: "AYAT", hadis: "HADITS", dua: "DOA", zikir: "ZIKIR" },
  ur: { ayet: "آیت", hadis: "حدیث", dua: "دعا", zikir: "ذکر" },
};

// ── TR fallback'ler (dualar.ts'teki referans değerler) ────
const TIP_TR: Record<string, string> = { tumu: "Tümü", ayet: "Ayet-i Kerime", hadis: "Hadis-i Şerif", dua: "Kadim Dua", zikir: "Zikir / Tesbih" };
const DUYGU_TR: Record<string, string> = { tum: "Tüm Duygular", huzur: "Huzur & Sükunet", sukur: "Şükür & Nimet", sabir: "Sabır & Ferahlık", tevekkul: "Tevekkül & Güven", rahmet: "Rahmet & Tövbe", ilim: "İlim & Hikmet", namaz: "Namaz & İbadet" };
const ROZET_TR: Record<string, string> = { ayet: "AYET", hadis: "HADİS", dua: "DUA", zikir: "ZİKİR" };

function dilKod(lang: Lang | string | null | undefined): Lang {
  return String(lang || "tr").trim().toLowerCase() as Lang;
}

/** Kartı seçili dile çevirir — çeviri yoksa orijinal (TR) kart döner. */
export function kutuphaneItem(lang: Lang | string | null | undefined, item: LibraryItem): LibraryItem {
  const c = LIBRARY_COKDIL[dilKod(lang)]?.[item.id];
  return c ? { ...item, title: c.title, tr: c.tr, source: c.source } : item;
}

/** Sekme etiketi — çeviri yoksa TR referans. */
export function kutuphaneSekme(lang: Lang | string | null | undefined, id: LibraryType | "tumu"): string {
  return TIP_COKDIL[dilKod(lang)]?.[id] ?? TIP_TR[id] ?? id;
}

/** Duygu etiketi — çeviri yoksa TR referans. */
export function kutuphaneDuygu(lang: Lang | string | null | undefined, id: Emotion | "tum"): string {
  return DUYGU_COKDIL[dilKod(lang)]?.[id] ?? DUYGU_TR[id] ?? id;
}

/** Kart rozet etiketi — çeviri yoksa TR referans. */
export function kutuphaneRozet(lang: Lang | string | null | undefined, type: LibraryType): string {
  return ROZET_COKDIL[dilKod(lang)]?.[type] ?? ROZET_TR[type] ?? type;
}
