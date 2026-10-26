// ★ 26.10.2 — gv*/ov* kart sözlük anahtarlarını 5 dile ekle (canlı sızıntı fixi)
// Kaynak: src/data/gununVideosu.ts + src/components/OnerilenVideolar.tsx
// Sonuç: 5 sözlük de 1886 → 1959 anahtar; eksik anahtar 0.
import fs from "node:fs";

const E = [];
const a = (k, tr, en, ar, id, ur) => E.push({ k, tr, en, ar, id, ur });

// ── GÜNÜN VİDEOSU — haftanın 7 günü ──────────────────────────────
a("gvB0", "Pazar Nuru", "Sunday Light", "نور الأحد", "Cahaya Ahad", "اتوار کی روشنی");
a("gvA0", "İhlâs 112:1 ve Asr 103:1 — samimiyetle zamana tutun.", "Al-Ikhlas 112:1 and Al-Asr 103:1 — hold to time with sincerity.", "الإخلاص 112:1 والعصر 103:1 — تمسك بالوقت بصدق.", "Al-Ikhlas 112:1 dan Al-Asr 103:1 — genggam waktu dengan ikhlas.", "الإخلاص 112:1 اور العصر 103:1 — وقت کو اخلاص سے تھام لو۔");
a("gvB1", "Zorlukla Beraber Feth", "Ease Within Hardship", "اليسر مع العسر", "Kemudahan Dalam Ujian", "مشکل میں آسانی");
a("gvA1", "İnşirâh 94:6 ve Talâk 65:3 — her zorlukla beraber bir kolaylık.", "Ash-Sharh 94:6 and At-Talaq 65:3 — with every hardship comes ease.", "الشرح 94:6 والطلاق 65:3 — مع كل عسر يسراً.", "Asy-Syarh 94:6 dan At-Talaq 65:3 — bersama setiap kesulitan ada kemudahan.", "الشرح 94:6 اور الطلاق 65:3 — ہر تنگی کے ساتھ آسانی ہے۔");
a("gvB2", "Sabır Ve Dua", "Patience And Prayer", "الصبر والدعاء", "Sabar Dan Doa", "صبر اور دعا");
a("gvA2", "Bakara 2:153 ve Âl-i İmrân 3:139 — sabredin, Allah sabredenlerle beraberdir.", "Al-Baqarah 2:153 and Aal-i-Imran 3:139 — be patient; Allah is with the patient.", "البقرة 2:153 وآل عمران 3:139 — اصبروا، إن الله مع الصابرين.", "Al-Baqarah 2:153 dan Ali Imran 3:139 — bersabarlah, Allah bersama yang sabar.", "البقرة 2:153 اور آل عمران 3:139 — صبر کرو، اللہ صبر کرنے والوں کے ساتھ ہے۔");
a("gvB3", "Ümit Pınarı", "Fountain of Hope", "نبع الرجاء", "Mata Air Harapan", "امید کا چشمہ");
a("gvA3", "Zümer 39:53 — 'Allah'ın rahmetinden ümit kesmeyin.'", "Az-Zumar 39:53 — 'Do not despair of Allah's mercy.'", "الزمر 39:53 — «لا تقنطوا من رحمة الله».", "Az-Zumar 39:53 — 'Jangan berputus asa dari rahmat Allah.'", "الزمر 39:53 — «اللہ کی رحمت سے مایوس نہ ہو۔»");
a("gvB4", "İlâhi Salavât", "Divine Salawat", "الصلاة على النبي", "Shalawat Ilahi", "درود پاک");
a("gvA4", "Ahzâb 33:56 — 'Allah ve melekleri peygambere salavât getirir.'", "Al-Ahzab 33:56 — 'Allah and His angels send blessings upon the Prophet.'", "الأحزاب 33:56 — «إن الله وملائكته يصلون على النبي».", "Al-Ahzab 33:56 — 'Allah dan malaikat-Nya bershalawat atas Nabi.'", "الأحزاب 33:56 — «اللہ اور اس کے فرشتے نبی پر درود بھیجتے ہیں۔»");
a("gvB5", "Cuma Huzuru", "The Peace of Friday", "سكينة الجمعة", "Ketenangan Jumat", "جمعہ کا سکون");
a("gvA5", "Cuma 62:9 ve Kehf 18:10 — mübarek günü zikirle onurlandır.", "Al-Jumuah 62:9 and Al-Kahf 18:10 — honor the blessed day with dhikr.", "الجمعة 62:9 والكهف 18:10 — أمّن يوم مبارك بالذكر.", "Al-Jumuah 62:9 dan Al-Kahf 18:10 — muliakan hari berkah dengan zikir.", "الجمعة 62:9 اور الكهف 18:10 — مبارک دن کو ذکر سے عزت بخشو۔");
a("gvB6", "Kalbin Huzuru", "Tranquility of the Heart", "طمأنينة القلب", "Ketenangan Hati", "دل کا سکون");
a("gvA6", "Ra'd 13:28 — 'kalpler ancak Allah'ı anmakla mutmain olur.'", "Ar-Rad 13:28 — 'hearts find rest in the remembrance of Allah.'", "الرعد 13:28 — «ألا بذكر الله تطمئن القلوب».", "Ar-Rad 13:28 — 'hati menjadi tenteram mengingat Allah.'", "الرعد 13:28 — «یادِ اللہ سے دلیں اطمینان پاتے ہیں۔»");

// ── GÜNÜN VİDEOSU — mübarek günler (Hicri) ───────────────────────
a("gvBKadir", "Kadr Gecesi", "Laylat Al-Qadr", "ليلة القدر", "Malam Lailatul Qadar", "شبِ قدر");
a("gvAKadir", "Kadr 97:1 — 'bin aydan hayırlıdır o gece.'", "Al-Qadr 97:1 — 'better than a thousand months.'", "القدر 97:1 — «خير من ألف شهر».", "Al-Qadr 97:1 — 'lebih baik dari seribu bulan.'", "القدر 97:1 — «ہزار مہینوں سے بہتر ہے۔»");
a("gvBRamazan", "Ramazan Bayramı", "Eid Al-Fitr", "عيد الفطر", "Idul Fitri", "عید الفطر");
a("gvARamazan", "Nasr 110:1 — zafer sabahı, şükür vakti.", "An-Nasr 110:1 — victory at dawn, a time of gratitude.", "النصر 110:1 — صباح النصر، وقت الشكر.", "An-Nasr 110:1 — fajar kemenangan, waktu syukur.", "النصر 110:1 — فتح کی صبح، شکر کا وقت۔");
a("gvBArefe", "Arefe Günü", "Day of Arafah", "يوم عرفة", "Hari Arafah", "دنِ عرفہ");
a("gvAArefe", "Bakara 2:201 — 'bize dünyada hayır, âhirette de hayır ver.'", "Al-Baqarah 2:201 — 'give us good in this world and the Hereafter.'", "البقرة 2:201 — «آتنا في الدنيا حسنة وفي الآخرة حسنة».", "Al-Baqarah 2:201 — 'beri kami kebaikan dunia dan akhirat.'", "البقرة 2:201 — «ہمیں دنیا اور آخرت میں بھلائی عطا فرما۔»");
a("gvBKurban", "Kurban Bayramı", "Eid Al-Adha", "عيد الأضحى", "Idul Adha", "عید الاضحی");
a("gvAKurban", "Kevser 108:1 — kurban günü nehir gibi akan şükür.", "Al-Kawthar 108:1 — gratitude flowing like a river on the day of sacrifice.", "الكوثر 108:1 — شكر ينساب كالنهر يوم الأضحى.", "Al-Kautsar 108:1 — syukur mengalir seperti sungai pada hari kurban.", "الكوثر 108:1 — قربانی کے دن دریائے شکر بہتا ہے۔");
a("gvBMevlid", "Mevlid Kandili", "Mawlid Night", "ليلة المولد", "Malam Maulid", "شبِ ولادت");
a("gvAMevlid", "Enbiyâ 21:107 — 'sen âlemlere ancak rahmet olarak gönderildin.'", "Al-Anbiya 21:107 — 'sent as a mercy to the worlds.'", "الأنبياء 21:107 — «وما أرسلناك إلا رحمة للعالمين».", "Al-Anbiya 21:107 — 'diutuskan sebagai rahmat bagi semesta.'", "الأنبياء 21:107 — «آپ رحمت بنا کر دنیا میں بھیجے گئے۔»");
a("gvBBerat", "Berat Kandili", "Night of Bara'ah", "ليلة البراءة", "Malam Nisfu Syaban", "شبِ برات");
a("gvABerat", "Zümer 39:53 — ümit kapısı ayın on beşinde yeniden açılır.", "Az-Zumar 39:53 — the door of hope reopens on the fifteenth.", "الزمر 39:53 — باب الرجاء يفتح في الخامس عشر.", "Az-Zumar 39:53 — pintu harapan terbuka kembali di tanggal lima belas.", "الزمر 39:53 — امید کا دروازہ پندرہ تاریخ کو دوبارہ کھلتا ہے۔");
a("gvBAsure", "Aşure Günü", "Day of Ashura", "يوم عاشوراء", "Hari Asyura", "دنِ عاشورہ");
a("gvAAsure", "Bakara 2:50 — 'denizin ikiye bölündüğü kurtuluş günü.'", "Al-Baqarah 2:50 — 'the day the sea was split in two.'", "البقرة 2:50 — «يوم فرقنا البحر».", "Al-Baqarah 2:50 — 'hari laut terbelah dua.'", "البقرة 2:50 — «جس دن سمندر دو حصوں میں چیر دیا گیا۔»");
a("gvBHicri", "Hicri Yeni Yıl", "Islamic New Year", "رأس السنة الهجرية", "Tahun Baru Hijri", "ہجری سال نو");
a("gvAHicri", "Tövbe 9:40 — 'üzülmeyin, Allah bizimle beraber.'", "At-Tawbah 9:40 — 'do not grieve; Allah is with us.'", "التوبة 9:40 — «لا تحزن إن الله معنا».", "At-Tawbah 9:40 — 'jangan bersedih, Allah bersama kami.'", "التوبة 9:40 — «غم نہ کرو، اللہ ہمارے ساتھ ہے۔»");
a("gvBMirac", "Mîraç Kandili", "Night of Isra and Miraj", "ليلة الإسراء والمعراج", "Malam Isra Miraj", "شبِ معراج");
a("gvAMirac", "İsrâ 17:1 — 'sevilmekte olan, bir gece yolculuğu.'", "Al-Isra 17:1 — 'a blessed night journey.'", "الإسراء 17:1 — «رحلة الليل المباركة».", "Al-Isra 17:1 — 'perjalanan malam yang diberkahi.'", "الإسراء 17:1 — «مبارک رات کا سفر۔»");

// ── ÖNERİLEN KLİPLER — haftanın 7 günü × 3 paket ─────────────────
a("ovB0_0", "Gece Yıldızları", "Stars of the Night", "نجوم الليل", "Bintang Malam", "رات کے ستارے");
a("ovA0_0", "İhlâs 112:1 ve Asr 103:1 — geceye samimiyet getir.", "Al-Ikhlas 112:1 and Al-Asr 103:1 — bring sincerity to the night.", "الإخلاص 112:1 والعصر 103:1 — أحضر الإخلاص إلى الليل.", "Al-Ikhlas 112:1 dan Al-Asr 103:1 — hadirkan keikhlasan pada malam.", "الإخلاص 112:1 اور العصر 103:1 — رات میں اخلاص لائیں۔");
a("ovB0_1", "Huzur Suları", "Waters of Tranquility", "مياه السكينة", "Air Ketenangan", "سکون کے پانی");
a("ovA0_1", "Ra'd 13:28 — kalpler Allah'ı anmakla mutmain.", "Ar-Rad 13:28 — hearts find rest in Allah's remembrance.", "الرعد 13:28 — القلوب تطمئن بذكر الله.", "Ar-Rad 13:28 — hati tenteram mengingat Allah.", "الرعد 13:28 — دل یادِ اللہ سے مطمئن. ۔");
a("ovB0_2", "Vâkıa'nın Göğü", "The Sky of Al-Waqiah", "سماء الواقعة", "Langit Al-Waqiah", "الواقعة کا آسمان");
a("ovA0_2", "Vâkıa 56:75 — 'yıldızların konumuna yemin ederim.'", "Al-Waqiah 56:75 — 'the positions of the stars.'", "الواقعة 56:75 — «والمواقع النجوم».", "Al-Waqiah 56:75 — 'posisi bintang-bintang.'", "الواقعة 56:75 — «ستاروں کی جگہوں کی قسم»۔");
a("ovB1_0", "Feth Günbatımı", "Sunset of Triumph", "غروب النصر", "Senja Kemenangan", "فتح کی شام");
a("ovA1_0", "İnşirâh 94:6 ve Talâk 65:3 — zorluk yakın, kolaylık daha yakın.", "Ash-Sharh 94:6 and At-Talaq 65:3 — hardship is near, ease is nearer.", "الشرح 94:6 والطلاق 65:3 — العسر قريب واليسر أقرب.", "Asy-Syarh 94:6 dan At-Talaq 65:3 — kesulitan dekat, kemudahan lebih dekat.", "الشرح 94:6 اور الطلاق 65:3 — مشکل قریب، آسانی اس سے بھی قریب۔");
a("ovB1_1", "Orman Duası", "Prayer of the Forest", "دعاء الغابة", "Doa Hutan", "جنگل کی دعا");
a("ovA1_1", "Bakara 2:153 — sabır ve duada yardımcılarınız.", "Al-Baqarah 2:153 — patience and prayer are your helpers.", "البقرة 2:153 — الصبر والدعاء أنهما أعوانكم.", "Al-Baqarah 2:153 — sabar dan doa adalah penolongmu.", "البقرة 2:153 — صبر اور دعا تمہارے مددگار. ۔");
a("ovB1_2", "Günbatımı Fâtihası", "Al-Fatihah at Sunset", "الفاتحة عند الغروب", "Al-Fatihah Senja", "غروب میں الفاتحہ");
a("ovA1_2", "Fâtiha 1:1 — her yolculuk 'bismillâh' ile başlar.", "Al-Fatihah 1:1 — every journey begins with 'Bismillah.'", "الفاتحة 1:1 — كل رحلة تبدأ بـ«بسم الله».", "Al-Fatihah 1:1 — setiap perjalanan dimulai dengan 'Bismillah.'", "الفاتحة 1:1 — ہر سفر «بسم اللہ» سے شروع ہوتا ہے۔");
a("ovB2_0", "İman Gökleri", "Skies of Faith", "سماء الإيمان", "Langit Iman", "ایمان کے آسمان");
a("ovA2_0", "Âl-i İmrân 3:139 — 'üzülmeyin, iman edenler en üstündür.'", "Aal-i-Imran 3:139 — 'do not despair; believers are supreme.'", "آل عمران 3:139 — «ولا تهنوا وتكونوا أعلى إن كنتم مؤمنين».", "Ali Imran 3:139 — 'jangan bersedih, orang beriman yang terunggul.'", "آل عمران 3:139 — «مایوس نہ ہو، مومن سب سے بلند ہیں»۔");
a("ovB2_1", "Şükür Çiçekleri", "Flowers of Gratitude", "أزهار الشكر", "Bunga Syukur", "شکر کے پھول");
a("ovA2_1", "İbrâhîm 14:7 — 'şükrederseniz artırırım.'", "Ibrahim 14:7 — 'give thanks and I will increase.'", "إبراهيم 14:7 — «لأزيدنكم إن شكرتم».", "Ibrahim 14:7 — 'bersyukurlah, akan Ku tambah.'", "إبراهيم 14:7 — «شکر کرو گے تو میں زیادہ کروں گا»۔");
a("ovB2_2", "Desen Hikmeti", "Patterns of Wisdom", "أنماط الحكمة", "Corak Hikmah", "حکمت کے نقش");
a("ovA2_2", "Sebe 34:13 — mübarek işlerin şerhi.", "Saba 34:13 — the trace of blessed work.", "سبأ 34:13 — أثر العمل المبارك.", "Saba 34:13 — jejak amal yang berkah.", "سبأ 34:13 — مبارک کام کا نشان۔");
a("ovB3_0", "Umudun Sesi", "Voice of Hope", "صوت الأمل", "Suara Harapan", "امید کی آواز");
a("ovA3_0", "Zümer 39:53 — rahmet kapısı hiç kapanmaz.", "Az-Zumar 39:53 — the door of mercy never closes.", "الزمر 39:53 — باب الرحمة لا يغلق.", "Az-Zumar 39:53 — pintu rahmat tak pernah tertutup.", "الزمر 39:53 — رحمت کا دروازہ کبھی بند نہیں ہوتا۔");
a("ovB3_1", "Ra'd'ın Dalgası", "Waves of Ar-Rad", "موج الرعد", "Ombak Ar-Rad", "الرعد کی لہر");
a("ovA3_1", "Ra'd 13:28 — kalbin dirilişi zikrin sularında.", "Ar-Rad 13:28 — the heart revives in the waters of dhikr.", "الرعد 13:28 — القلب يحيى بماء الذكر.", "Ar-Rad 13:28 — hati hidup dalam air zikir.", "الرعد 13:28 — دل ذکر کے پانی میں زندہ ہوتا ہے۔");
a("ovB3_2", "Nûr Damlası", "Rain of Light", "مطر النور", "Hujan Cahaya", "روشنائی کا باران");
a("ovA3_2", "Nûr 24:43 — gökten indirilen nur yağmuru.", "An-Nur 24:43 — the light rain sent from the sky.", "النور 24:43 — مطر النور المنزل من السماء.", "An-Nur 24:43 — hujan cahaya diturunkan dari langit.", "النور 24:43 — آسمان سے نور کا مینہ برسا۔");
a("ovB4_0", "Gece Salavâtı", "Nighttime Salawat", "صلاة الليل", "Shalawat Malam", "رات کا درود");
a("ovA4_0", "Ahzâb 33:56 — gece salavât ile başlar ve biter.", "Al-Ahzab 33:56 — the night begins and ends with salawat.", "الأحزاب 33:56 — الليل يبدأ وينتهي بالصلوات.", "Al-Ahzab 33:56 — malam diawali dan diakhiri shalawat.", "الأحزاب 33:56 — رات درود سے شروع اور ختم ہوتی ہے۔");
a("ovB4_1", "İsrâ Yolculuğu", "The Journey of Al-Isra", "رحلة الإسراء", "Perjalanan Al-Isra", "الإسراء کا سفر");
a("ovA4_1", "İsrâ 17:79 — 'geceye kalk, teheccüde dur.'", "Al-Isra 17:79 — 'rise for worship in the night.'", "الإسراء 17:79 — «وَمِنَ اللَّيْلِ فَتَهَجَّدُ».", "Al-Isra 17:79 — 'bangunlah beribadah pada malam.'", "الإسراء 17:79 — «رات میں اٹھو تہجد پڑھو»۔");
a("ovB4_2", "Tövbe Çağrısı", "Call to Repentance", "دعوة التوبة", "Seruan Taubat", "توبہ کی دعوت");
a("ovA4_2", "Nûh 71:10 — 'Rabbinizden af dileyin; O çok bağışlayıcıdır.'", "Nuh 71:10 — 'seek forgiveness of your Lord; He is ever-forgiving.'", "نوح 71:10 — «استغفروا ربكم إنه كان غفاراً».", "Nuh 71:10 — 'mohon ampun kepada Tuhanmu, Dia Maha Pengampun.'", "نوح 71:10 — «اپنے رب سے بخشش مانگو، وہ بہت بخشنے والا ہے»۔");
a("ovB5_0", "Cuma Namazı", "Friday Prayer", "صلاة الجمعة", "Shalat Jumat", "جمعہ کی نماز");
a("ovA5_0", "Cuma 62:9 — hutbenin ve namazın vakti.", "Al-Jumuah 62:9 — time for the sermon and the prayer.", "الجمعة 62:9 — موعد الخطبة والصلاة.", "Al-Jumuah 62:9 — waktunya khutbah dan shalat.", "الجمعة 62:9 — خطبہ اور نماز کا وقت۔");
a("ovB5_1", "Kehf Kaleleri", "The Tales of Al-Kahf", "قصص الكهف", "Kisah Al-Kahf", "الكهف کی کہانیاں");
a("ovA5_1", "Kehf 18:10 — 'Rabbi, bize katından bir rahmet ver.'", "Al-Kahf 18:10 — 'Our Lord, grant us mercy from Yourself.'", "الكهف 18:10 — «رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً».", "Al-Kahf 18:10 — 'Ya Rabb kami, berilah rahmat dari sisi-Mu.'", "الكهف 18:10 — «اے ہمارے رب، ہمیں اپنی طرف سے رحمت دے»۔");
a("ovB5_2", "Barış Güvercini", "Dove of Peace", "حمامة السلام", "Merpati Damai", "امن کا فاختہ");
a("ovA5_2", "Enbiyâ 21:107 — âlemlere rahmet.", "Al-Anbiya 21:107 — a mercy to all the worlds.", "الأنبياء 21:107 — رحمة للعالمين.", "Al-Anbiya 21:107 — rahmat bagi semesta.", "الأنبياء 21:107 — رحمۃ للعالمین۔");
a("ovB6_0", "Gölden Huzur", "Tranquility by the Lake", "سكينة على البحيرة", "Ketenangan di Danau", "جھیل کنارے سکون");
a("ovA6_1", "Rahmân 55:13 — 'hangisi nimetlerinden inkar edersiniz?'", "Ar-Rahman 55:13 — 'which of the favors will you deny?'", "الرحمن 55:13 — «فبأي آلاء ربكما تكذبان».", "Ar-Rahman 55:13 — 'nikmat mana yang kalian dustakan?'", "الرحمن 55:13 — «الرحمٰن کی کس نعمت کو جھٹلاؤ گے؟»");
a("ovB6_1", "Rahmân'ın Nimetleri", "Blessings of Ar-Rahman", "نِعَم الرحمن", "Anugerah Ar-Rahman", "الرحمٰن کی نعمتیں");
a("ovA6_2", "Kevser 108:1 — 'şüphesiz sana Kevser'i verdik.'", "Al-Kawthar 108:1 — 'We have given you al-Kawthar.'", "الكوثر 108:1 — «إنا أعطيناك الكوثر».", "Al-Kautsar 108:1 — 'sungguh, Kami beri kepadamu al-Kautsar.'", "الكوثر 108:1 — «بیشک ہم نے تمہیں کوثر عطا کیا»۔");
a("ovB6_2", "Kevser Yıldızı", "The Star of Al-Kawthar", "نجم الكوثر", "Bintang Al-Kautsar", "الكوثر کا ستارہ");

const DILLER = { tr: "tr", en: "en", ar: "ar", id: "id", ur: "ur" };
let eklendi = 0;
for (const [kod, dosya] of Object.entries(DILLER)) {
  const p = `src/i18n/dicts.${kod}.json`;
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const e of E) {
    if (d[e.k] === undefined) { d[e.k] = e[kod]; eklendi++; }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
}
console.log("eklenen anahtar×dil hücresi:", eklendi, "| işlem kümesi:", E.length);
