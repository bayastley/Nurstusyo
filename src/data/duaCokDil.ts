// ════════════════════════════════════════════════════════════════════
// DUACOKDIL.TS — GÜNÜN DUALARI çok dilli veri (26.10, kullanıcı emri)
//   "günün dualarını çoğalt · 5 dil entegre de dikkat et" — DAILY_DUAS
//   22 sahih duaya sıra-index'iyle hizalı başlık + manas çevirisi.
//   • t = başlık (tr/en/ar/id/ur) · m = manas metni (tr/en/id/ur).
//     ar manası: Arapça kullanıcı zaten okuyabildiği için ARAPÇA
//     asıl metin (dua.arabic) manas yerine gösterilir — m.ar bilinçli boş.
//   • Fallback: eksik dil → tr (asla boş metin gösterilmez).
//   • Kaynaklama (Buhârî/Müslim/…) olanca dilde aynı kalır — literatür adı.
// ════════════════════════════════════════════════════════════════════

export interface DuaDilPaketi {
  t: { tr: string; en?: string; ar?: string; id?: string; ur?: string };
  m: { tr: string; en?: string; id?: string; ur?: string; ar?: string };
}

export const DUA_COKDIL: DuaDilPaketi[] = [
  {
    t: { tr: "Sabah Ezkarı", en: "Morning Adhkar", ar: "أذكار الصباح", id: "Zikir Pagi", ur: "صبح کے اذکار" },
    m: {
      tr: "Sabaha erdik; mülk Allah'ındır, hamd Allah'adır. Allah'tan başka ilah yoktur; O tektir, ortağı yoktur.",
      en: "We have entered the morning; sovereignty belongs to Allah, and all praise belongs to Allah. There is no deity but Allah alone, without partner.",
      id: "Kami memasuki pagi; kerajaan milik Allah, segala puji bagi Allah. Tiada tuhan selain Allah semata, tanpa sekutu.",
      ur: "ہم صبح میں داخل ہوئے؛ ملک اللہ کا ہے، حمد اللہ کے لیے ہے۔ اللہ کے سوا کوئی معبود نہیں، وہ یکتا ہے اور اس کا کوئی شریک نہیں۔",
    },
  },
  {
    t: { tr: "Akşam Ezkarı", en: "Evening Adhkar", ar: "أذكار المساء", id: "Zikir Petang", ur: "شام کے اذکار" },
    m: {
      tr: "Akşama erdik; mülk Allah'ındır, hamd Allah'adır. Allah'tan başka ilah yoktur; O tektir, ortağı yoktur.",
      en: "We have entered the evening; sovereignty belongs to Allah, and all praise belongs to Allah. There is no deity but Allah alone, without partner.",
      id: "Kami memasuki petang; kerajaan milik Allah, segala puji bagi Allah. Tiada tuhan selain Allah semata, tanpa sekutu.",
      ur: "ہم شام میں داخل ہوئے؛ ملک اللہ کا ہے، حمد اللہ کے لیے ہے۔ اللہ کے سوا کوئی معبود نہیں، وہ یکتا ہے اور اس کا کوئی شریک نہیں۔",
    },
  },
  {
    t: { tr: "Yemek Öncesi Duası", en: "Before Eating", ar: "دعاء قبل الطعام", id: "Doa Sebelum Makan", ur: "کھانے سے پہلے کی دعا" },
    m: {
      tr: "Allah'ın adıyla ve Allah'ın bereketiyle.",
      en: "In the name of Allah and with the blessing of Allah.",
      id: "Dengan nama Allah dan dengan keberkahan Allah.",
      ur: "اللہ کے نام سے اور اللہ کی برکت سے۔",
    },
  },
  {
    t: { tr: "Yemek Sonrası Duası", en: "After Eating", ar: "دعاء بعد الطعام", id: "Doa Setelah Makan", ur: "کھانے کے بعد کی دعا" },
    m: {
      tr: "Bizi yediren, içiren ve Müslüman kılan Allah'a hamd olsun.",
      en: "Praise be to Allah who fed us, gave us drink, and made us Muslims.",
      id: "Puji bagi Allah yang memberi kami makan, minum, dan menjadikan kami muslim.",
      ur: "تعریف اس اللہ کے لیے جس نے ہمیں کھلایا، پلایا اور مسلمان بنایا۔",
    },
  },
  {
    t: { tr: "Uykudan Uyanınca", en: "On Waking Up", ar: "دعاء الاستيقاظ", id: "Doa Bangun Tidur", ur: "نیند سے بیدار ہونے کی دعا" },
    m: {
      tr: "Bizi öldürdükten sonra dirilten Allah'a hamd olsun; dönüş O'nadır.",
      en: "Praise be to Allah who revived us after death, and to Him is the return.",
      id: "Puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kita kembali.",
      ur: "تعریف اس اللہ کے لیے جس نے موت کے بعد ہمیں زندگی بخشی، اور لوٹنا اسی کی طرف ہے۔",
    },
  },
  {
    t: { tr: "Uyumadan Önce", en: "Before Sleeping", ar: "دعاء النوم", id: "Doa Sebelum Tidur", ur: "سونے سے پہلے کی دعا" },
    m: {
      tr: "Allah'ım! Senin adınla ölür ve dirilirim.",
      en: "In Your name, O Allah, I die and I live.",
      id: "Dengan nama-Mu, ya Allah, aku mati dan aku hidup.",
      ur: "اے اللہ! تیرے نام سے مرتا ہوں اور جیتا ہوں۔",
    },
  },
  {
    t: { tr: "Yola Çıkınca (Seyahat Duası)", en: "Upon Traveling", ar: "دعاء السفر", id: "Doa Bepergian", ur: "سفر کی دعا" },
    m: {
      tr: "Bunu bizim emrimize veren (Allah) ne yücedir; biz bunu kendimize bağlayamayacaktık.",
      en: "Glory to Him who subjected this to us; we could never have bound it ourselves.",
      id: "Mahasuci Dzat yang menundukkan ini untuk kami; kami tak akan mampu menundukkannya sendiri.",
      ur: "پاک ہے وہ جس نے یہ ہمارے لیے رام کیا؛ ہم اسے خود قابو کرنے میں توانا نہ ہوتے۔",
    },
  },
  {
    t: { tr: "Tuvalete Girerken", en: "Entering the Toilet", ar: "دعاء دخول الخلاء", id: "Doa Masuk Toilet", ur: "بیت الخلا میں داخل ہونے کی دعا" },
    m: {
      tr: "Allah'ım! Erkek ve dişi şeytanların şerrinden Sana sığınırım.",
      en: "O Allah, I seek refuge in You from male and female devils.",
      id: "Ya Allah, aku berlindung pada-Mu dari setan laki-laki dan perempuan.",
      ur: "اے اللہ! میں تیری پناہ مانگتا ہوں نر اور مادہ شیطانوں کے شر سے۔",
    },
  },
  {
    t: { tr: "Tuvalete Çıkınca", en: "Leaving the Toilet", ar: "دعاء الخروج من الخلاء", id: "Doa Keluar Toilet", ur: "بیت الخلا سے نکلنے کی دعا" },
    m: {
      tr: "Senin mağfiretini (bağışlanmanı) dilerim.",
      en: "Your forgiveness, I seek.",
      id: "Aku memohon maaf-Mu.",
      ur: "میں تیری بخشش چاہتا ہوں۔",
    },
  },
  {
    t: { tr: "Evden Çıkarken", en: "Leaving Home", ar: "دعاء الخروج من المنزل", id: "Doa Keluar Rumah", ur: "گھر سے نکلنے کی دعا" },
    m: {
      tr: "Allah'ın adıyla (çıkarım), Allah'a tevekkül ettim; güç ve kuvvet ancak Allah'ın yardımıyladır.",
      en: "In the name of Allah I go out; I place my trust in Allah; there is no power except with Allah.",
      id: "Dengan nama Allah aku keluar; aku bertawakal kepada Allah; tiada daya kecuali dengan Allah.",
      ur: "اللہ کے نام سے نکلتا ہوں؛ اللہ پر بھروسا کرتا ہوں؛ طاقت اور قوت صرف اللہ کی مدد سے ہے۔",
    },
  },
  {
    t: { tr: "Eve Girerken", en: "Entering Home", ar: "دعاء دخول المنزل", id: "Doa Masuk Rumah", ur: "گھر میں داخل ہونے کی دعا" },
    m: {
      tr: "Allah'ın adıyla girdik, Allah'ın adıyla çıktık; Rabbimize tevekkül ettik.",
      en: "In the name of Allah we entered; in the name of Allah we went out; upon our Lord we rely.",
      id: "Dengan nama Allah kami masuk; dengan nama Allah kami keluar; kepada Tuhan kami bertawakal.",
      ur: "اللہ کے نام سے داخل ہوئے؛ اللہ کے نام سے نکلے؛ اپنے رب پر توکل کیا۔",
    },
  },
  {
    t: { tr: "Korku Duası", en: "Prayer for Fear", ar: "دعاء الخوف", id: "Doa Saat Takut", ur: "خوف کی دعا" },
    m: {
      tr: "Aziz ve Halim olan Allah'tan başka ilah yoktur; büyük Arş'ın Rabbi Allah'tan başka ilah yoktur.",
      en: "There is no deity but Allah, the Mighty, the Forbearing; there is no deity but Allah, Lord of the magnificent Throne.",
      id: "Tiada tuhan selain Allah, Yang Perkasa, Penyantun; tiada tuhan selain Allah, Tuhan 'Arsy Yang Agung.",
      ur: "اللہ کے سوا کوئی معبود نہیں، وہ عظیم والا اور بردبار ہے؛ عظیم عرش کا رب اللہ کے سوا کوئی معبود نہیں۔",
    },
  },
  {
    t: { tr: "Sıkıntı ve Üzüntü Duası", en: "Prayer in Distress", ar: "دعاء الهم والغم", id: "Doa Saat Cemas", ur: "غم و پریشانی کی دعا" },
    m: {
      tr: "Kerim ve Halim olan Allah'tan başka ilah yoktur; büyük Arş'ın Rabbi olan Allah ne yücedir.",
      en: "There is no deity but Allah, the Noble, the Forbearing; glory to Allah, Lord of the magnificent Throne.",
      id: "Tiada tuhan selain Allah, Yang Mulia, Penyantun; Maha suci Allah, Tuhan 'Arsy Yang Agung.",
      ur: "اللہ کے سوا کوئی معبود نہیں، وہ کریم اور بردبار ہے؛ پاک ہے اللہ، عظیم عرش کا رب۔",
    },
  },
  {
    t: { tr: "Keder ve Kaygı Duası", en: "Prayer for Anxiety", ar: "دعاء الهم والحزن", id: "Doa Saat Cemas & Sedih", ur: "غم و فکر کی دعا" },
    m: {
      tr: "Allah'ım! Ben Senin kulun... Kur'an'ı gönlümün baharı, göğsümün nûru eyle. Hüznümü gider, derdimi çöz.",
      en: "O Allah, I am Your servant… I ask You to make the Qur'an the spring of my heart and the light of my chest; remove my sorrow, resolve my distress.",
      id: "Ya Allah, aku hamba-Mu… Aku memohon agar Al-Qur'an menjadi sembuh hatiku dan terang dadaku; hilangkan kesedihanku, selesaikan masalahku.",
      ur: "اے اللہ! میں تیرا بندہ ہوں… التجا ہے کہ قرآن میرے دل کا بہار، سینے کا نور بنائے؛ غم دور کر، پریشانی حل فرما۔",
    },
  },
  {
    t: { tr: "Hayırlı İşe Başlarken", en: "Before a Good Deed", ar: "دعاء بدء العمل الصالح", id: "Doa Sebelum Amal Baik", ur: "نیک کام سے پہلے کی دعا" },
    m: {
      tr: "Rahman ve Rahîm Allah'ın adıyla. Allah'ım! Kolaylaştırmadığın hiçbir şey kolay değildir.",
      en: "In the name of Allah, the Most Gracious, the Most Merciful. O Allah, nothing is easy except what You make easy.",
      id: "Dengan nama Allah Yang Maha Pengasih… Ya Allah, tiada yang mudah kecuali yang Engkau mudahkan.",
      ur: "اللہ کے نام سے جو بہت رحم فرمانے والا ہے… اے اللہ! تیرے بنانے سے کوئی چیز آسان نہیں۔",
    },
  },
  {
    t: { tr: "Zorluk Anında", en: "In Times of Hardship", ar: "دعاء الشدة", id: "Doa Saat Sulit", ur: "مشکل کے وقت کی دعا" },
    m: {
      tr: "Senden başka ilah yoktur, Sen yücesin; gerçekten ben zalimlerden oldum. (Yunus Duası)",
      en: "There is no deity but You; glory be to You; indeed I have been among the wrongdoers. (Prayer of Yunus)",
      id: "Tiada tuhan selain Engkau; Maha suci Engkau; sungguh aku termasuk orang-orang zalim. (Doa Yunus)",
      ur: "تیرے سوا کوئی معبود نہیں، تو پاک ہے؛ میں واقعی ظالموں میں سے ہوں۔ (یونس کی دعا)",
    },
  },
  {
    t: { tr: "Borçlu İken", en: "In Debt", ar: "دعاء الدين", id: "Doa Saat Berutang", ur: "قرض کی دعا" },
    m: {
      tr: "Allah'ım! Helâlınla haramından beni kâfî kıl; fazlınla Sen'den başkasından beni müstağni kıl.",
      en: "O Allah, suffice me with Your lawful against Your unlawful; enrich me by Your bounty from all besides You.",
      id: "Ya Allah, cukupkan aku dengan yang halal-Mu dari yang haram-Mu; kayakan aku dengan karunia-Mu dari apa pun selain-Mu.",
      ur: "اے اللہ! اپنے حلال سے مجھے حرمت سے کاف ہرما؛ اپنے فضل سے مجھے تیرے سوا سب سے نیاز فرما۔",
    },
  },
  {
    t: { tr: "Yağmur Duası", en: "Prayer for Rain", ar: "دعاء المطر", id: "Doa Hujan", ur: "بارش کی دعا" },
    m: {
      tr: "Allah'ım! Faydalı yağmur yağdır.",
      en: "O Allah, send beneficial rain!",
      id: "Ya Allah, turunkan hujan yang bermanfaat!",
      ur: "اے اللہ! نفع دینے والی بارش برسا!",
    },
  },
  {
    t: { tr: "Rüya Görünce / Sevinince", en: "On Good News & Joy", ar: "دعاء الفرح", id: "Doa Saat Senang", ur: "خوشخبری کی دعا" },
    m: {
      tr: "Nimetleriyle hayırların tamamlandığı Allah'a hamd olsun.",
      en: "Praise be to Allah, with whose favor good things are completed.",
      id: "Puji bagi Allah, dengan nikmat-Nya kebaikan-kebaikan itu lengkap.",
      ur: "تعریف اس اللہ کے لیے جس کی نعمت سے اچھی چیزیں کامل ہوتی ہیں۔",
    },
  },
  {
    t: { tr: "Aksirince", en: "Upon Sneezing", ar: "دعاء العطس", id: "Doa Saat Bersin", ur: "چھینک کی دعا" },
    m: {
      tr: "Aksıran 'Allah size merhamet etsin' der, duyan 'Allah size hidayet versin, hâlinizi ıslah etsin' karşılığını verir.",
      en: "The sneezer says 'May Allah have mercy on you'; the hearer replies 'May Allah guide you and rectify your condition.'",
      id: "Yang bersin berkata 'yarhamukallah', yang mendengar menjawab 'yahdikumullah wa yushlihu balakum'.",
      ur: "چھینکنے والا کہے 'اللہ تم پر رحم فرمائے'، جواب دینے والا کہے 'اللہ تمہیں ہدایت دے اور حال درست فرمائے'۔",
    },
  },
  {
    t: { tr: "Camiye Girerken", en: "Entering the Mosque", ar: "دعاء دخول المسجد", id: "Doa Masuk Masjid", ur: "مسجد میں داخل ہونے کی دعا" },
    m: {
      tr: "Allah'ım! Benim için rahmet kapılarını aç.",
      en: "O Allah, open for me the gates of Your mercy.",
      id: "Ya Allah, bukakan untukku pintu-pintu rahmat-Mu.",
      ur: "اے اللہ! میری لیے اپنی رحمت کے دروازے کھول۔",
    },
  },
  {
    t: { tr: "Camiden Çıkarken", en: "Leaving the Mosque", ar: "دعاء الخروج من المسجد", id: "Doa Keluar Masjid", ur: "مسجد سے نکلنے کی دعا" },
    m: {
      tr: "Allah'ım! Senden fazlını diliyorum.",
      en: "O Allah, I ask from Your bounty.",
      id: "Ya Allah, aku memohon dari karunia-Mu.",
      ur: "اے اللہ! میں تیرے فضل سے مانگتا ہوں۔",
    },
  },
  { // ★ 26.10: 11 yeni sahih dua (Buhârî/Müslim/Tirmizî/Ebû Dâvûd) — 22. sıradan devam
    t: { tr: "Namaza Girerken (İftitah)", en: "Entering Prayer (Iftitah)", ar: "دعاء الافتتاح", id: "Awal Salat (Iftitah)", ur: "نماز کے آغاز کی دعا" },
    m: {
      tr: "Yüzümü gökleri ve yeri yaratana çevirdim; ben hanîfim, müşriklerden değilim.",
      en: "I turn my face to the One who created the heavens and the earth; I follow the pure faith, and I am not among those who associate partners.",
      id: "Aku menghadapkan wajahku kepada yang menciptakan langit dan bumi; aku mengikuti agama yang lurus, dan aku bukan dari pemuja syirik.",
      ur: "میں اپنا رخ اُسی کی طرف پھیرتا ہوں جس نے آسمانوں اور زمین کو پیدا کیا؛ میں حنیف ہوں اور مشرکوں میں سے نہیں۔",
    },
  },
  {
    t: { tr: "Namazdan Çıkarken", en: "After Prayer", ar: "دعاء بعد الصلاة", id: "Setelah Salat", ur: "نماز کے بعد کی دعا" },
    m: {
      tr: "Allah'tan bağışlanma dilerim. Allah'ım! Sen Selâm'sın, selâm Sendendir; ey Celâl ve İkrâm sahibi, bereketlisin!",
      en: "I seek forgiveness from Allah. O Allah, You are Peace, and peace comes from You; blessed are You, Lord of Majesty and Honour!",
      id: "Aku memohon ampun kepada Allah. Ya Allah, Engkau adalah Kedamaian, kedamaian datang dari-Mu; mahasuci Engkau, Tuhan Yang Agung dan Terhormat!",
      ur: "میں اللہ سے بخشش مانگتا ہوں۔ اے اللہ! تُو سلام ہے اور سلام تجھ سے؛ بےشک تُو بابرکت ہے، اے بزرگی اور عزت والے!",
    },
  },
  {
    t: { tr: "Abdest Aldıktan Sonra", en: "After Ablution (Wudu)", ar: "دعاء بعد الوضوء", id: "Setelah Wudhu", ur: "وضو کے بعد کی دعا" },
    m: {
      tr: "Allah'tan başka ilah olmadığına, tek ve ortağı olmayışına; Muhammed'in (s.a.v) O'nun kulu ve elçisi olduğuna şehadet ediyorum.",
      en: "I bear witness that there is no god but Allah alone without partner, and that Muhammad (saw) is His servant and messenger.",
      id: "Aku bersaksi tiada tuhan selain Allah semata tanpa sekutu, dan Muhammad (saw) adalah hamba dan utusan-Nya.",
      ur: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ یکتا ہے، اس کا کوئی شریک نہیں؛ اور محمد (صلی اللہ علیہ وسلم) اس کے بندے اور رسول ہیں۔",
    },
  },
  {
    t: { tr: "Ezanı Duyunca", en: "On Hearing the Adhan", ar: "دعاء بعد الأذان", id: "Saat Mendengar Adzan", ur: "اذان سننے کے بعد کی دعا" },
    m: {
      tr: "Allah'ım! Bu tam dâvetin Rabb'i ve kılınmakta olan namazın sahibi olarak Hz. Muhammed'e (s.a.v) vesile ve fazileti bahşeyle!",
      en: "O Allah, by this complete call and the standing prayer, grant Muhammad (saw) the intercession and high rank.",
      id: "Ya Allah, dengan seruan yang sempurna ini dan salat yang sedang tegak, anugerahkan pada Muhammad (saw) sapatu dan kemuliaan.",
      ur: "اے اللہ! اس کامل دعوت اور قائم نماز کے ذریعے محمد (صلی اللہ علیہ وسلم) کو وسيلہ اور فضیلت عطا فرما!",
    },
  },
  {
    t: { tr: "Dua Etmeye Başlarken", en: "Before Making a Supplication", ar: "دعاء استفتاح الدعاء", id: "Awal Doa", ur: "دعا کے آغاز میں" },
    m: {
      tr: "Allah'ım! Senden, Senin hamda lâyık oluşun, Senden başka ilah yokluğu ve Senin sonsuz ihsan sahibi olduğun hasebiyle istiyorum.",
      en: "O Allah, I ask You because all praise is Yours, there is no god but You, the Giver of abundant gifts.",
      id: "Ya Allah, aku memohon kepada-Mu karena segala pujian milik-Mu, tiada tuhan selain-Mu, Engkau Pemberi karunia.",
      ur: "اے اللہ! میں تجھ سے اس لئے مانگتا ہوں کہ حمد تیرے لیے ہے، تیرے سوا کوئی معبود نہیں، تُو کرم کرنے والا ہے۔",
    },
  },
  {
    t: { tr: "Gece Konaklandığında", en: "Overnight Rest (Dua)", ar: "دعاء المبيت", id: "Tempat Bermalam", ur: "رات اقامے کی دعا" },
    m: {
      tr: "Allah'ın kâmil kelimeleriyle yaratılmışların şerrinden Sana sığınırım.",
      en: "I seek refuge in the perfect words of Allah from every evil created being.",
      id: "Aku berlindung dengan kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan.",
      ur: "میں اللہ کے کامل کلمات سے تمام مخلوقات کی برائیوں سے پناہ مانگتا ہوں۔",
    },
  },
  {
    t: { tr: "Hasta Ziyaretinde", en: "Visiting the Sick", ar: "دعاء المريض", id: "Menjenguk Orang Sakit", ur: "بیمار کی عیادت میں" },
    m: {
      tr: "Zarar yok, inşallah bu hâlet (keffâret) ecrini artıracak.",
      en: "No harm, may this illness, God willing, purify you and raise your reward.",
      id: "Tidak apa-apa, semoga fitnah ini menyucikanmu dan menambah pahalamu, izinkan Allah.",
      ur: "کوئی خدشہ نہیں، اللہ کے نصیب سے یہ بیماری تمہیں پاک کرے گی اور اجر بڑھائے گی۔",
    },
  },
  {
    t: { tr: "Seyahat Duası (Kapsamlı)", en: "Integral Travel Dua", ar: "دعاء السفر الكامل", id: "Doa Perjalanan Lengkap", ur: "سفر کی مکمل دعا" },
    m: {
      tr: "Allah'ım! Bu seyahatimizde bize hayırlılık ve takvâ ihsan ediver.",
      en: "O Allah, we ask You on this journey for righteousness and precaution.",
      id: "Ya Allah, dalam perjalanan ini kami memohon kebaikan dan takwa dari-Mu.",
      ur: "اے اللہ! ہم اس سفر میں تعرض اور تقوی تجھ سے مانگتے ہیں۔",
    },
  },
  {
    t: { tr: "Yolculuktan Dönünce", en: "Returning from a Journey", ar: "دعاء الرجوع من السفر", id: "Kembali dari Perjalanan", ur: "سفر سے واپسی کی دعا" },
    m: {
      tr: "Döndük, tövbekâr olduk, Rabbimize kulluk ettik ve O'na hamd ettik.",
      en: "We return, repenting, worshiping our Lord and praising Him.",
      id: "Kami kembali, bertaubat, menyembah Tuhan kami dan memuji-Nya.",
      ur: "ہم لوٹ آئے، توبہ کرکے، ہمارے رب کی عبادت کرتے اور اس کی حمد کرتے ہیں۔",
    },
  },
  {
    t: { tr: "Kabir Ziyaretinde", en: "Visiting the Graveyard", ar: "دعاء زيارة القبور", id: "Ziarah Kuburan", ur: "قبر زيارت کی دعا" },
    m: {
      tr: "Ey mü'min ve müslüman ahâli, selâm size; acı haber erişirse bize de erişecek.",
      en: "Peace be upon you, O people of the graves, believers; we shall follow you when appointed time comes.",
      id: "Salam semoga bagi penduduk kubur yang beriman; bila ajal tiba kami akan mengikuti kalian.",
      ur: "اے ایمان والمیں لوگو، تم پر سلام ہو؛ جب اجال آئے گی تو ہم بھی تمہارے دنبال آئیں گے۔",
    },
  },
  {
    t: { tr: "Toplantıya Girerken", en: "Entering a Gathering", ar: "دعاء دخول المجلس", id: "Masuk Majelis", ur: "محفل میں داخل ہونے کی دعا" },
    m: {
      tr: "Allah'ım! Seni noksanlıklardan tenzih eder, Sana hamd ederim; Senden başka ilah olmadığına şehadet ederim; bağışlanmamı dilerim.",
      en: "Glory be to You, O Allah; I praise You; I bear witness there is no god but You; I seek forgiveness and turn to You.",
      id: "Mahasuci Engkau, ya Allah; aku memuji-Mu; aku bersaksi tiada tuhan selain-Mu; aku memohon ampun dan kembali kepada-Mu.",
      ur: "اے اللہ! تُو پاک ہے، تیری حمد ہو؛ میں گواہی دیتا ہوں کہ تیرے سوا کوئی معبود نہیں؛ میں بخشش مانگتا ہوں اور تیری طرف رجعت کرتا ہوں۔",
    },
  },
];

/** Dil güvenli seçim: paketi olanca dil doldurur, eksik dil → tr */
export function duaDilSec(lang: string | null | undefined, i: number, trVarayilan: { title: string; text: string }): { title: string; text: string } {
  const paket = DUA_COKDIL[i];
  if (!paket) return trVarayilan;
  const kod = String(lang || "tr").trim().toLowerCase();
  return {
    title: (paket.t as Record<string, string | undefined>)[kod] || paket.t.tr || trVarayilan.title,
    text: (paket.m as Record<string, string | undefined>)[kod] || paket.m.tr || trVarayilan.text,
  };
}
