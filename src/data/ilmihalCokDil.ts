// ════════════════════════════════════════════════════════
// ILMIHALCOKDIL.TS — İlmihal ders adı / alt açıklama / soru kökü çevirileri
// Kullanıcı emri (24.11): "41 dersin adı + alt açıklaması ve 131 soru kökü
// en/ar/id/ur; dil değişince bunlar da dönsün."
//
// ★ Kural: yalnız BAŞLIKLAR çevriliyor; madde metinleri, seçenekler ve
//   açıklamalar TR kalır (orada isteğe bağlı otomatik çeviri devrede).
// ★ Sıra: her kayıt [en, ar, id, ur]. Dizi sırası derslerdeki soru sırasıyla
//   BİREBİR aynı olmalı — yeni soru eklenirse buraya da eklenmeli.
// ★ Terimler: mezhep/din terimleri yerleşik karşılıklarıyla (wudu, ghusl,
//   nisab, mahr, iddah, khuffayn, qard hasan…) verildi; uydurma yok.
// ════════════════════════════════════════════════════════

export type IlmihalCeviriDili = "en" | "ar" | "id" | "ur";

/** [en, ar, id, ur] */
type Dort = [string, string, string, string];

const SIRA: Record<IlmihalCeviriDili, number> = { en: 0, ar: 1, id: 2, ur: 3 };

const AD: Record<string, Dort> = {
  temizlik: ["Purification and Wudu", "الطهارة والوضوء", "Bersuci dan Wudu", "طہارت اور وضو"],
  gusul: ["Ghusl and Tayammum", "الغسل والتيمم", "Mandi Wajib dan Tayamum", "غسل اور تیمم"],
  namaz: ["The Prayer (Salah)", "الصلاة", "Salat", "نماز"],
  oruc: ["Fasting (Sawm)", "الصوم", "Puasa", "روزہ"],
  zekat: ["Zakat and Fitrah", "الزكاة والفطرة", "Zakat dan Fitrah", "زکوٰۃ اور فطرہ"],
  hac: ["Hajj and Umrah", "الحج والعمرة", "Haji dan Umrah", "حج اور عمرہ"],
  "helal-haram": ["Halal, Haram and the Rights of Others", "الحلال والحرام وحقوق العباد", "Halal, Haram dan Hak Orang Lain", "حلال و حرام اور حقوق العباد"],
  aile: ["Family and Daily Life", "الأسرة والحياة اليومية", "Keluarga dan Kehidupan Sehari-hari", "خاندان اور روزمرہ زندگی"],
  iman: ["Articles of Faith", "أركان الإيمان", "Rukun Iman", "ارکان ایمان"],
  cuma: ["Friday, Eid and Congregation", "الجمعة والعيد والجماعة", "Jumat, Id dan Berjamaah", "جمعہ، عید اور جماعت"],
  kurban: ["Sacrifice and Vows", "الأضحية والنذر", "Kurban dan Nadzar", "قربانی اور نذر"],
  ticaret: ["Trade and Debt", "التجارة والدَّين", "Perdagangan dan Utang", "تجارت اور قرض"],
  "oruc-kaza": ["Fasting: Make-up, Fidyah and I'tikaf", "الصوم: القضاء والفدية والاعتكاف", "Puasa: Qada, Fidyah dan I'tikaf", "روزہ: قضا، فدیہ اور اعتکاف"],
  "zekat-detay": ["Zakat: Wealth and Recipients", "الزكاة: الأموال والأصناف", "Zakat: Harta dan Penerima", "زکوٰۃ: اموال اور مستحقین"],
  sehiv: ["Prostration of Forgetfulness and Make-up Prayer", "سجود السهو وقضاء الصلاة", "Sujud Sahwi dan Qada Salat", "سجدۂ سہو اور قضا نماز"],
  "namaz-sunnet": ["Sunnahs and Necessary Acts of the Prayer", "سنن الصلاة وواجباتها", "Sunnah dan Wajib Salat", "نماز کی سنتیں اور واجبات"],
  "ezan-cemaat": ["Adhan, Iqamah and Congregation", "الأذان والإقامة والجماعة", "Azan, Iqamah dan Berjamaah", "اذان، اقامت اور جماعت"],
  "vitir-nafile": ["Witr, Sunnah and Voluntary Prayers", "الوتر والسنن والنوافل", "Witir, Sunnah dan Salat Sunnah", "وتر، سنتیں اور نوافل"],
  "namazi-bozan": ["What Invalidates the Prayer and Disliked Acts", "مبطلات الصلاة والمكروهات", "Hal yang Membatalkan dan Dimakruhkan dalam Salat", "نماز توڑنے والی اور مکروہ چیزیں"],
  "yemin-adak": ["Oaths, Vows and Expiation", "الأيمان والنذور والكفارات", "Sumpah, Nadzar dan Kafarat", "قسم، نذر اور کفارہ"],
  "dua-zikir": ["Supplication, Remembrance and Qur'an Etiquette", "الدعاء والذكر وأدب القرآن", "Doa, Zikir dan Adab Al-Qur'an", "دعا، ذکر اور قرآن کے آداب"],
  cenaze: ["Death and Funeral Rulings", "أحكام الموت والجنازة", "Hukum Kematian dan Jenazah", "موت اور جنازے کے احکام"],
  ruhsat: ["Concessions and Ease in Worship", "الرخص والتيسير في العبادات", "Rukhsah dan Kemudahan dalam Ibadah", "عبادات میں رخصت اور آسانیاں"],
  hayiz: ["Specific Rulings for Women", "أحكام خاصة بالنساء", "Hukum Khusus bagi Perempuan", "خواتین کے مخصوص احکام"],
  "nikah-hukuku": ["Marriage, Divorce and Iddah", "النكاح والطلاق والعدة", "Nikah, Talak dan Iddah", "نکاح، طلاق اور عدت"],
  miras: ["Inheritance and Shares", "الميراث والفرائض", "Waris dan Faraid", "وراثت اور فرائض"],
  "av-kesim": ["Hunting and Animal Slaughter", "الصيد والذكاة", "Berburu dan Penyembelihan", "شکار اور جانوروں کا ذبح"],
  akitler: ["Endowments, Gifts, Pledges and Guarantees", "الوقف والهبة والرهن والكفالة", "Wakaf, Hibah, Gadai dan Jaminan", "وقف، ہبہ، رہن اور کفالت"],
  ceza: ["Fixed Penalties, Retaliation and Blood Money", "الحدود والقصاص والدية", "Hudud, Kisas dan Diyat", "حدود، قصاص اور دیت"],
  sadaka: ["Charity and Spending", "الصدقة والإنفاق", "Sedekah dan Infak", "صدقہ اور انفاق"],
  "sular-necaset": ["Water and Impurity", "المياه والنجاسة", "Air dan Najis", "پانی اور نجاست"],
  "tilavet-secdesi": ["Prostration of Recitation", "سجدة التلاوة", "Sujud Tilawah", "سجدۂ تلاوت"],
  "hac-menasik": ["Rites of Hajj and Umrah", "مناسك الحج والعمرة", "Manasik Haji dan Umrah", "حج و عمرہ کے مناسک"],
  akika: ["Aqiqah and Children's Rights", "العقيقة وحقوق الأطفال", "Akikah dan Hak Anak", "عقیقہ اور بچوں کے حقوق"],
  "faiz-banka": ["Interest, Banking and Insurance", "الربا والبنوك والتأمين", "Riba, Bank dan Asuransi", "سود، بینک اور بیمہ"],
  "yeme-giyim": ["Etiquette of Food and Dress", "آداب الطعام واللباس", "Adab Makan dan Berpakaian", "کھانے پینے اور لباس کے آداب"],
  "buyuk-gunahlar": ["Major Sins and Repentance", "الكبائر والتوبة", "Dosa Besar dan Tobat", "کبیرہ گناہ اور توبہ"],
  komsuluk: ["Rights of Family, Neighbours and Kin", "حقوق الأهل والجار وذي الرحم", "Hak Keluarga, Tetangga dan Kerabat", "اہل، ہمسایہ اور رشتہ داروں کے حقوق"],
  mezhepler: ["Schools of Law and Ijtihad", "المذاهب والاجتهاد", "Mazhab dan Ijtihad", "مذاہب اور اجتہاد"],
  "fikih-terimleri": ["Fiqh Terminology", "المصطلحات الفقهية", "Istilah Fikih", "فقہی اصطلاحات"],
  "ibadet-hikmet": ["Wisdom of Worship and Intention", "حكمة العبادة والنية", "Hikmah Ibadah dan Niat", "عبادت کی حکمت اور نیت"],
};

const ALT: Record<string, Dort> = {
  temizlik: [
    "The essentials of purity, the obligatory acts of wudu and what invalidates it",
    "أصول الطهارة وفرائض الوضوء ونواقضه",
    "Dasar-dasar bersuci, fardu wudu dan hal yang membatalkannya",
    "طہارت کے اصول، وضو کے فرائض اور اسے توڑنے والی چیزیں",
  ],
  gusul: [
    "The obligatory acts of ghusl, what requires it and the ruling of tayammum",
    "فرائض الغسل وموجباته وحكم التيمم",
    "Fardu mandi wajib, hal yang mewajibkannya dan hukum tayamum",
    "غسل کے فرائض، اسے واجب کرنے والی چیزیں اور تیمم کا حکم",
  ],
  namaz: [
    "The five daily obligatory prayers, rak'ahs, conditions and the prostration of forgetfulness",
    "الصلوات الخمس وعدد الركعات وشروط الصلاة وسجود السهو",
    "Lima salat fardu, jumlah rakaat, syarat salat dan sujud sahwi",
    "پانچ وقت کی فرض نمازیں، رکعتیں، نماز کے فرائض اور سجدۂ سہو",
  ],
  oruc: [
    "Ramadan fasting, what breaks it, and make-up, expiation and fidyah",
    "صوم رمضان ومفطراته والقضاء والكفارة والفدية",
    "Puasa Ramadan, hal yang membatalkan, qada, kaffarah dan fidyah",
    "رمضان کا روزہ، اسے توڑنے والی چیزیں، قضا، کفارہ اور فدیہ",
  ],
  zekat: [
    "Nisab, rate, the eight categories and the charity of Eid al-Fitr",
    "النصاب والمقدار والأصناف الثمانية وصدقة الفطر",
    "Nisab, kadar, delapan golongan dan sedekah fitrah",
    "نصاب، شرح، آٹھ مستحق طبقات اور صدقۂ فطر",
  ],
  hac: [
    "The obligatory and necessary acts of Hajj and the ruling of Umrah",
    "فرائض الحج وواجباته وحكم العمرة",
    "Fardu dan wajib haji serta hukum umrah",
    "حج کے فرائض و واجبات اور عمرہ کا حکم",
  ],
  "helal-haram": [
    "Earnings, interest, backbiting, slander and the weight of violating others' rights",
    "الكسب والربا والغيبة والبهتان وعِظم حقوق العباد",
    "Penghasilan, riba, ghibah, fitnah dan beratnya hak orang lain",
    "کمائی، سود، غیبت، بہتان اور حقوق العباد کی سنگینی",
  ],
  aile: [
    "Marriage, mahr, maintenance and the halal-haram boundaries of daily life",
    "النكاح والمهر والنفقة وحدود الحلال والحرام في الحياة اليومية",
    "Nikah, mahar, nafkah dan batas halal-haram dalam kehidupan sehari-hari",
    "نکاح، مہر، نفقہ اور روزمرہ زندگی کی حلال و حرام حدود",
  ],
  iman: [
    "The six articles of faith and the proofs of divine oneness",
    "أركان الإيمان الستة وأدلة التوحيد",
    "Enam rukun iman dan dalil tauhid",
    "ایمان کے چھ ارکان اور توحید کے دلائل",
  ],
  cuma: [
    "Friday prayer, the sermon, Eid, tarawih and the etiquette of congregation",
    "صلاة الجمعة والخطبة والعيد والتراويح وأدب الجماعة",
    "Salat Jumat, khutbah, Id, tarawih dan adab berjamaah",
    "جمعہ کی نماز، خطبہ، عید، تراویح اور جماعت کے آداب",
  ],
  kurban: [
    "The ruling of sacrifice, conditions of slaughter and the debt of a vow",
    "حكم الأضحية وشروط الذبح ودَين النذر",
    "Hukum kurban, syarat penyembelihan dan utang nadzar",
    "قربانی کا حکم، ذبح کی شرائط اور نذر کا قرض",
  ],
  ticaret: [
    "Lawful earnings, measure, contracts, trusts and the goodly loan",
    "الكسب الحلال والمكيال والعقود والأمانة والقرض الحسن",
    "Penghasilan halal, takaran, akad, amanah dan qard hasan",
    "حلال کمائی، پیمائش، معاہدہ، امانت اور قرضِ حسن",
  ],
  "oruc-kaza": [
    "Missed days, the measure of fidyah and worship in the last ten days",
    "الأيام الفائتة ومقدار الفدية وعبادة العشر الأواخر",
    "Hari yang terlewat, kadar fidyah dan ibadah sepuluh hari terakhir",
    "چھوٹے ہوئے دن، فدیے کی مقدار اور آخری دس دن کی عبادت",
  ],
  "zekat-detay": [
    "Nisab, rates, trade goods and the eight categories",
    "النصاب والمقادير وعروض التجارة والأصناف الثمانية",
    "Nisab, kadar, barang dagangan dan delapan golongan",
    "نصاب، شرح، مالِ تجارت اور آٹھ طبقات",
  ],
  sehiv: [
    "Forgetfulness, deficiencies and prayers missed in their time",
    "النسيان والنقصان والصلوات الفائتة",
    "Lupa, kekurangan dan salat yang terlewat waktunya",
    "بھول، کمی اور وقت پر نہ پڑھی گئی نمازیں",
  ],
  "namaz-sunnet": [
    "Rulings beyond the obligatory acts and what happens when they are omitted",
    "الأحكام خارج الفرائض وما يترتب على تركها",
    "Hukum di luar fardu dan akibat meninggalkannya",
    "فرائض کے علاوہ احکام اور ان کے ترک کا نتیجہ",
  ],
  "ezan-cemaat": [
    "The ruling of the call to prayer, the virtue of congregation and following the imam",
    "حكم الأذان وفضل الجماعة والاقتداء بالإمام",
    "Hukum azan, keutamaan berjamaah dan mengikuti imam",
    "اذان کا حکم، جماعت کی فضیلت اور امام کی پیروی",
  ],
  "vitir-nafile": [
    "The obligatory witr, the emphasised sunnahs and voluntary worship",
    "الوتر الواجب والسنن المؤكدة والنوافل",
    "Witir wajib, sunnah muakkadah dan ibadah sukarela",
    "واجب وتر، مؤکدہ سنتیں اور نفلی عبادات",
  ],
  "namazi-bozan": [
    "Acts that void the prayer and behaviour contrary to its etiquette",
    "الأفعال التي تبطل الصلاة وما يخالف أدبها",
    "Perbuatan yang membatalkan salat dan yang menyalahi adabnya",
    "نماز باطل کرنے والے افعال اور آداب کے خلاف حرکات",
  ],
  "yemin-adak": [
    "The binding nature of a word, rulings of vows and measures of expiation",
    "لزوم اليمين وأحكام النذر ومقادير الكفارة",
    "Mengikatnya sumpah, hukum nadzar dan kadar kafarat",
    "قول کی پابندی، نذر کے احکام اور کفارے کی مقدار",
  ],
  "dua-zikir": [
    "The manners of supplication, the measure of remembrance and etiquette of recitation",
    "آداب الدعاء ومقدار الذكر وأدب التلاوة",
    "Adab berdoa, kadar zikir dan adab membaca Al-Qur'an",
    "دعا کے آداب، ذکر کی مقدار اور تلاوت کے آداب",
  ],
  cenaze: [
    "The moment of death, the funeral prayer, burial and condolence etiquette",
    "ساعة الموت وصلاة الجنازة والدفن وأدب التعزية",
    "Saat kematian, salat jenazah, pemakaman dan adab takziah",
    "موت کا لمحہ، نمازِ جنازہ، دفن اور تعزیت کے آداب",
  ],
  ruhsat: [
    "Concessions given in travel, illness and necessity",
    "الرخص في السفر والمرض والضرورة",
    "Keringanan dalam perjalanan, sakit dan darurat",
    "سفر، بیماری اور ضرورت کے موقع کی رخصتیں",
  ],
  hayiz: [
    "Menstruation, post-natal bleeding and istihadah: durations, worship rulings, purity",
    "الحيض والنفاس والاستحاضة: المدد وأحكام العبادة والطهارة",
    "Haid, nifas dan istihadah: durasi, hukum ibadah, bersuci",
    "حیض، نفاس اور استحاضہ: مدتیں، عبادت کے احکام، طہارت",
  ],
  "nikah-hukuku": [
    "Marriage impediments, mahr, types of divorce and the waiting period",
    "موانع النكاح والمهر وأنواع الطلاق والعدة",
    "Penghalang nikah, mahar, jenis talak dan masa iddah",
    "نکاح کی رکاوٹیں، مہر، طلاق کی اقسام اور عدت",
  ],
  miras: [
    "Order of the estate, shares of spouse, parents, children and siblings",
    "ترتيب التركة وأنصبة الزوجين والوالدين والأولاد والإخوة",
    "Urutan tirkah, bagian pasangan, orang tua, anak dan saudara",
    "ترکہ کی ترتیب، زوجین، والدین، اولاد اور بہن بھائیوں کے حصے",
  ],
  "av-kesim": [
    "Conditions of slaughter, the basmalah, hunting, sea food and forbidden meats",
    "شروط الذبح والتسمية والصيد وطعام البحر واللحوم المحرمة",
    "Syarat sembelih, basmalah, berburu, hasil laut dan daging haram",
    "ذبح کی شرائط، بسم اللہ، شکار، سمندری غذا اور حرام گوشت",
  ],
  akitler: [
    "Charitable contracts, security and the fiqh framework of debt relations",
    "العقود الخيرية والضمانات والإطار الفقهي للديون",
    "Akad kebajikan, jaminan dan kerangka fikih utang",
    "خیراتی عقود، ضمانتیں اور قرض کے فقہی احکام",
  ],
  ceza: [
    "Balance of crime and punishment, pardon, blood money and who applies penalties",
    "التوازن بين الجريمة والعقوبة والعفو والدية وجهة تنفيذ الحدود",
    "Keseimbangan kejahatan dan hukuman, pemaafan, diyat dan pelaksana hukuman",
    "جرم و سزا کا توازن، معافی، دیت اور سزا نافذ کرنے کا اختیار",
  ],
  sadaka: [
    "Obligatory, necessary and voluntary charity; ongoing charity and etiquette of giving",
    "الصدقة الفرض والواجب والنافلة والصدقة الجارية وأدب الإنفاق",
    "Sedekah fardu, wajib dan sunnah; sedekah jariyah dan adab berinfak",
    "فرض، واجب اور نفل صدقہ؛ صدقۂ جاریہ اور انفاق کے آداب",
  ],
  "sular-necaset": [
    "Measures of pure water, types of impurity, istinja and toilet etiquette",
    "مقادير الماء الطهور وأنواع النجاسة والاستنجاء وأدب الخلاء",
    "Ukuran air suci, jenis najis, istinja dan adab toilet",
    "پاک پانی کے پیمانے، نجاست کی اقسام، استنجا اور بیت الخلا کے آداب",
  ],
  "tilavet-secdesi": [
    "Verses of prostration, its necessary ruling and how it is done in and out of prayer",
    "آيات السجدة وحكمها الوجوبي وكيفية أدائها داخل الصلاة وخارجها",
    "Ayat sajdah, hukum wajibnya dan cara melakukannya di dalam dan luar salat",
    "سجدے کی آیات، اس کا وجوبی حکم اور نماز کے اندر و باہر طریقہ",
  ],
  "hac-menasik": [
    "From ihram to shaving: the steps of Hajj and Umrah",
    "من الإحرام إلى الحلق: خطوات الحج والعمرة",
    "Dari ihram hingga mencukur: langkah haji dan umrah",
    "احرام سے حلق تک: حج و عمرہ کے مراحل",
  ],
  akika: [
    "The birth sacrifice, naming, circumcision, maintenance and the orphan's right",
    "ذبيحة الشكر والتسمية والختان والنفقة وحق اليتيم",
    "Kurban syukur kelahiran, penamaan, khitan, nafkah dan hak anak yatim",
    "شکرانے کی قربانی، نام، ختنہ، نفقہ اور یتیم کا حق",
  ],
  "faiz-banka": [
    "Types of riba, loans, Islamic banking and the ruling of insurance",
    "أنواع الربا والقروض والمصرفية الإسلامية وحكم التأمين",
    "Jenis riba, kredit, bank syariah dan hukum asuransi",
    "سود کی اقسام، قرض، اسلامی بینکاری اور بیمہ کا حکم",
  ],
  "yeme-giyim": [
    "Table manners, wastefulness, the limits of awrah and hijab",
    "أدب المائدة والإسراف وحدود العورة والحجاب",
    "Adab di meja makan, israf, batas aurat dan hijab",
    "دسترخوان کے آداب، اسراف، حدودِ ستر اور پردہ",
  ],
  "buyuk-gunahlar": [
    "The major sins, conditions of repentance and settling the rights of others",
    "الكبائر وشروط التوبة والتحلل من حقوق العباد",
    "Dosa besar, syarat tobat dan menyelesaikan hak orang lain",
    "کبائر، توبہ کی شرائط اور حقوق العباد کی ادائیگی",
  ],
  komsuluk: [
    "Rights of parents, kinship ties, neighbours and guests",
    "حق الوالدين وصلة الرحم وحق الجار والضيف",
    "Hak orang tua, silaturahmi, tetangga dan tamu",
    "والدین کا حق، صلہ رحمی، ہمسایہ اور مہمان کا حق",
  ],
  mezhepler: [
    "The need for madhhabs, the four imams, taqlid and etiquette of disagreement",
    "الحاجة إلى المذاهب والأئمة الأربعة والتقليد وأدب الخلاف",
    "Perlunya mazhab, empat imam, taklid dan adab ikhtilaf",
    "مذاہب کی ضرورت، چار امام، تقلید اور اختلاف کے آداب",
  ],
  "fikih-terimleri": [
    "Concepts of fard, wajib, sunnah, makruh, valid-void and concession",
    "مفاهيم الفرض والواجب والسنة والمكروه والصحيح والفاسد والرخصة",
    "Konsep fardu, wajib, sunnah, makruh, sahih-batal dan rukhsah",
    "فرض، واجب، سنت، مکروہ، صحیح-فاسد اور رخصت کے مفاہیم",
  ],
  "ibadet-hikmet": [
    "Intention, sincerity, consistency, innovation and conditions of acceptance",
    "النية والإخلاص والمداومة والبدعة وشروط القبول",
    "Niat, ikhlas, istiqamah, bidah dan syarat diterimanya ibadah",
    "نیت، اخلاص، دوام، بدعت اور قبولیت کی شرائط",
  ],
};

const SORU: Record<string, Dort[]> = {
  temizlik: [
    ["According to the Hanafi school, how many obligatory acts does wudu have?", "كم عدد فرائض الوضوء عند الحنفية؟", "Menurut mazhab Hanafi, berapa fardu wudu?", "حنفی مذہب کے مطابق وضو کے کتنے فرض ہیں؟"],
    ["How long may a traveller wipe over leather socks (khuffayn)?", "كم مدة المسح على الخفين للمسافر؟", "Berapa lama musafir boleh mengusap khuff (mest)?", "مسافر کے لیے موزوں پر مسح کی مدت کتنی ہے؟"],
    ["Which of the following does not invalidate wudu?", "أي مما يلي لا ينقض الوضوء؟", "Manakah berikut ini yang tidak membatalkan wudu?", "درج ذیل میں سے کون سی چیز وضو نہیں توڑتی؟"],
  ],
  gusul: [
    ["According to the Hanafi school, how many obligatory acts does ghusl have?", "كم عدد فرائض الغسل عند الحنفية؟", "Menurut mazhab Hanafi, berapa fardu mandi wajib?", "حنفی مذہب میں غسل کے کتنے فرض ہیں؟"],
    ["Which of the following does not require ghusl?", "أي مما يلي لا يوجب الغسل؟", "Manakah yang tidak mewajibkan mandi?", "کون سی چیز غسل واجب نہیں کرتی؟"],
    ["When is tayammum permitted?", "متى يجوز التيمم؟", "Kapan tayamum dibolehkan?", "تیمم کب جائز ہے؟"],
  ],
  namaz: [
    ["How many rak'ahs are obligatory in the Maghrib prayer?", "كم عدد ركعات فرض المغرب؟", "Berapa rakaat fardu salat Magrib?", "مغرب کی فرض نماز کتنی رکعت ہے؟"],
    ["According to the Hanafi school, how many obligatory acts does the prayer have?", "كم عدد فرائض الصلاة عند الحنفية؟", "Menurut mazhab Hanafi, berapa fardu salat?", "حنفی مذہب میں نماز کے کتنے فرائض ہیں؟"],
    ["How many rak'ahs does a traveller pray for the four-rak'ah obligatory prayers?", "كم يصلي المسافر من الفرائض الرباعية؟", "Berapa rakaat musafir mengerjakan salat fardu empat rakaat?", "مسافر چار رکعت والی فرض نمازیں کتنی رکعت پڑھتا ہے؟"],
  ],
  oruc: [
    ["Which verse establishes the obligation of fasting in Ramadan?", "أي آية تثبت وجوب صوم رمضان؟", "Ayat manakah yang menetapkan kewajiban puasa Ramadan?", "کون سی آیت رمضان کے روزے کی فرضیت بیان کرتی ہے؟"],
    ["What is required of someone who breaks a fast without an excuse?", "ماذا يجب على من أفطر بغير عذر؟", "Apa yang wajib bagi orang yang membatalkan puasa tanpa uzur?", "بلا عذر روزہ توڑنے والے پر کیا لازم ہے؟"],
    ["What does a person too ill to fast do?", "ماذا يفعل من كان مريضًا لا يستطيع الصيام؟", "Apa yang dilakukan orang yang sakit hingga tidak mampu berpuasa?", "جو شخص بیماری کی وجہ سے روزہ نہ رکھ سکے وہ کیا کرے؟"],
  ],
  zekat: [
    ["What is the rate of zakat?", "كم مقدار الزكاة؟", "Berapa kadar zakat?", "زکوٰۃ کی شرح کتنی ہے؟"],
    ["Which verse lists the categories eligible for zakat?", "أي آية تذكر الأصناف المستحقة للزكاة؟", "Ayat mana yang menyebut golongan penerima zakat?", "زکوٰۃ کے مستحقین کا ذکر کس آیت میں ہے؟"],
    ["When is the fitrah charity given?", "متى تُؤدى صدقة الفطر؟", "Kapan fitrah diberikan?", "فطرہ کب ادا کیا جاتا ہے؟"],
  ],
  hac: [
    ["Which of the following is not one of the obligatory acts of Hajj?", "أي مما يلي ليس من فرائض الحج؟", "Manakah yang bukan termasuk fardu haji?", "درج ذیل میں کون سا حج کے فرائض میں سے نہیں؟"],
    ["In which verse is Hajj made obligatory?", "في أي آية فُرض الحج؟", "Dalam ayat mana haji diwajibkan?", "حج کس آیت میں فرض کیا گیا ہے؟"],
    ["What is the ruling of Umrah?", "ما حكم العمرة؟", "Apa hukum umrah?", "عمرہ کا حکم کیا ہے؟"],
  ],
  "helal-haram": [
    ["In which verses is the prohibition of interest explicitly stated?", "في أي آيات صُرّح بتحريم الربا؟", "Dalam ayat mana larangan riba dinyatakan tegas?", "سود کی حرمت کس آیات میں صریحاً بیان ہوئی ہے؟"],
    ["In which verse is backbiting forbidden?", "في أي آية نُهي عن الغيبة؟", "Dalam ayat mana ghibah dilarang?", "غیبت کس آیت میں ممنوع ہے؟"],
    ["What is required regarding the rights of others?", "ما المطلوب في حقوق العباد؟", "Apa yang diperlukan terkait hak orang lain?", "حقوق العباد کے لیے کیا ضروری ہے؟"],
  ],
  aile: [
    ["Which of the following is required for a marriage to be valid?", "أي مما يلي شرط لصحة النكاح؟", "Manakah yang menjadi syarat sah nikah?", "نکاح کے صحیح ہونے کے لیے کون سی چیز شرط ہے؟"],
    ["Who is entitled to maintenance (nafaqah)?", "لمن تجب النفقة؟", "Siapa yang berhak atas nafkah?", "نفقہ کس کا حق ہے؟"],
    ["Which ruling about pork is correct?", "أي حكم في لحم الخنزير هو الصحيح؟", "Hukum manakah tentang daging babi yang benar?", "خنزیر کے گوشت کے بارے میں کون سا حکم درست ہے؟"],
  ],
  iman: [
    ["In which hadith are the six articles of faith listed?", "في أي حديث ذُكرت أركان الإيمان الستة؟", "Dalam hadis mana enam rukun iman disebutkan?", "ایمان کے چھ ارکان کس حدیث میں بیان ہوئے ہیں؟"],
    ["Which surah expresses divine oneness most concisely?", "أي سورة تعبّر عن التوحيد بأوجز عبارة؟", "Surah mana yang menyatakan tauhid paling ringkas?", "کون سی سورت توحید کو سب سے مختصر انداز میں بیان کرتی ہے؟"],
    ["Which statement about divine decree (qadar) is correct?", "أي عبارة عن القدر صحيحة؟", "Pernyataan mana tentang takdir yang benar?", "تقدیر کے بارے میں کون سی بات درست ہے؟"],
  ],
  cuma: [
    ["How many rak'ahs are obligatory in the Friday prayer?", "كم عدد ركعات فرض الجمعة؟", "Berapa rakaat fardu salat Jumat?", "جمعہ کی فرض نماز کتنی رکعت ہے؟"],
    ["How many times more rewarding is prayer in congregation than alone?", "بكم درجة تفضل صلاة الجماعة صلاة الفرد؟", "Berapa derajat keutamaan salat berjamaah dibanding sendirian?", "جماعت سے نماز تنہا نماز سے کتنا درجہ افضل ہے؟"],
    ["According to the Hanafi school, what is the ruling of the Eid prayer?", "ما حكم صلاة العيد عند الحنفية؟", "Menurut mazhab Hanafi, apa hukum salat Id?", "حنفی مذہب میں عید کی نماز کا حکم کیا ہے؟"],
  ],
  kurban: [
    ["According to the Hanafi school, what is the ruling of the sacrificial offering?", "ما حكم الأضحية عند الحنفية؟", "Menurut mazhab Hanafi, apa hukum kurban?", "حنفی مذہب میں قربانی کا حکم کیا ہے؟"],
    ["What is the maximum number of partners for a cow or camel sacrifice?", "كم أقصى عدد للمشتركين في البقرة أو البدنة؟", "Paling banyak berapa orang bersekutu dalam sapi atau unta?", "گائے یا اونٹ میں زیادہ سے زیادہ کتنے لوگ شریک ہو سکتے ہیں؟"],
    ["When does the sacrifice begin?", "متى يبدأ وقت الأضحية؟", "Kapan penyembelihan kurban dimulai?", "قربانی کب شروع ہوتی ہے؟"],
  ],
  ticaret: [
    ["In which surah are those who give short measure condemned?", "في أي سورة ذُمّ المطففون؟", "Dalam surah mana orang yang curang dalam takaran dicela?", "کم تولنے والوں کی مذمت کس سورت میں ہے؟"],
    ["What is recommended when taking a loan?", "ما المستحب عند أخذ الدَّين؟", "Apa yang dianjurkan saat berutang?", "قرض لیتے وقت کس چیز کی تاکید ہے؟"],
    ["What does qard hasan mean?", "ما معنى القرض الحسن؟", "Apa arti qard hasan?", "قرضِ حسن کا مطلب کیا ہے؟"],
  ],
  "oruc-kaza": [
    ["What does an elderly person with no hope of recovery do about fasting?", "ماذا يفعل الشيخ الذي لا يُرجى شفاؤه في الصيام؟", "Apa yang dilakukan orang tua yang tidak ada harapan sembuh soal puasa?", "وہ بوڑھا شخص جس کے صحت یاب ہونے کی امید نہ ہو روزے کے بارے میں کیا کرے؟"],
    ["When is i'tikaf observed?", "متى يكون الاعتكاف؟", "Kapan i'tikaf dilakukan?", "اعتکاف کب کیا جاتا ہے؟"],
    ["What should one do if he eats forgetfully while fasting?", "ماذا يفعل من أكل ناسيًا وهو صائم؟", "Apa yang dilakukan orang yang makan karena lupa saat berpuasa?", "روزے میں بھول کر کھانے والا کیا کرے؟"],
  ],
  "zekat-detay": [
    ["What is the nisab for gold in grams?", "كم نصاب الذهب بالغرام؟", "Berapa nisab emas dalam gram?", "سونے کا نصاب کتنے گرام ہے؟"],
    ["What is the zakat rate on crops watered by rain?", "ما مقدار زكاة الزرع المسقي بالمطر؟", "Berapa kadar zakat tanaman yang diairi hujan?", "بارش سے سیراب ہونے والی فصل پر زکوٰۃ کی شرح کیا ہے؟"],
    ["Which verse lists the categories to whom zakat is given?", "أي آية تعدّد أصناف الزكاة؟", "Ayat mana yang menyebut golongan penerima zakat?", "زکوٰۃ کے مستحقین کس آیت میں گنوائے گئے ہیں؟"],
  ],
  sehiv: [
    ["How many prostrations make up the prostration of forgetfulness?", "كم عدد سجدتي السهو؟", "Berapa sujud dalam sujud sahwi?", "سجدۂ سہو کتنے سجدے ہیں؟"],
    ["What should one do who doubts the number of rak'ahs?", "ماذا يفعل من شك في عدد الركعات؟", "Apa yang dilakukan orang yang ragu jumlah rakaat?", "رکعتوں کی تعداد میں شک کرنے والا کیا کرے؟"],
    ["What is done for an obligatory prayer missed in its time?", "ماذا يُصنع بالفرض الفائت؟", "Apa yang dilakukan untuk salat fardu yang terlewat?", "وقت پر نہ پڑھی گئی فرض نماز کا کیا حکم ہے؟"],
  ],
  "namaz-sunnet": [
    ["In the Hanafi school, what is required if one of the prayer's necessary acts is omitted?", "عند الحنفية، ماذا يجب إذا تُرك واجب من واجبات الصلاة؟", "Dalam mazhab Hanafi, apa yang wajib bila salah satu wajib salat ditinggalkan?", "حنفی مذہب میں نماز کا کوئی واجب چھوٹ جائے تو کیا لازم ہے؟"],
    ["Which of the following is one of the prayer's necessary acts?", "أي مما يلي من واجبات الصلاة؟", "Manakah yang termasuk wajib salat?", "درج ذیل میں کون سا نماز کے واجبات میں سے ہے؟"],
    ["How many rak'ahs is the sunnah of the dawn prayer and what is its ruling?", "كم عدد ركعات سنة الفجر وما حكمها؟", "Berapa rakaat sunnah salat Subuh dan apa hukumnya?", "فجر کی سنت کتنی رکعت ہے اور اس کا حکم کیا ہے؟"],
    ["In which rak'ahs is an additional surah recited?", "في أي الركعات تُقرأ السورة بعد الفاتحة؟", "Pada rakaat mana surah tambahan dibaca?", "زائد سورت کس رکعت میں پڑھی جاتی ہے؟"],
  ],
  "ezan-cemaat": [
    ["How many times more rewarding is prayer in congregation than alone?", "بكم درجة تفضل صلاة الجماعة صلاة الفرد؟", "Berapa derajat keutamaan salat berjamaah dibanding sendirian?", "جماعت سے نماز تنہا نماز سے کتنا درجہ افضل ہے؟"],
    ["Which statement about the iqamah is correct?", "أي عبارة عن الإقامة صحيحة؟", "Pernyataan mana tentang iqamah yang benar?", "اقامت کے بارے میں کون سی بات درست ہے؟"],
    ["How does one who follows the imam act?", "كيف يتصرف المقتدي بالإمام؟", "Bagaimana gerakan orang yang bermakmum?", "مقتدی کیسے عمل کرتا ہے؟"],
    ["Which prayer is performed upon entering the mosque before sitting?", "ما الصلاة التي تُصلى عند دخول المسجد قبل الجلوس؟", "Salat apa yang dikerjakan saat masuk masjid sebelum duduk?", "مسجد میں داخل ہو کر بیٹھنے سے پہلے کون سی نماز پڑھی جاتی ہے؟"],
  ],
  "vitir-nafile": [
    ["According to the Hanafi school, what is the ruling of the witr prayer?", "ما حكم صلاة الوتر عند الحنفية؟", "Menurut mazhab Hanafi, apa hukum salat Witir?", "حنفی مذہب میں وتر کا حکم کیا ہے؟"],
    ["Under which ruling is the tarawih prayer performed?", "بأي حكم تُصلى التراويح؟", "Dengan hukum apa salat tarawih dikerjakan?", "تراویح کس حکم کے تحت پڑھی جاتی ہے؟"],
    ["In which prayer is the qunut supplication recited?", "في أي صلاة يُقرأ دعاء القنوت؟", "Dalam salat apa doa qunut dibaca?", "قنوت کی دعا کس نماز میں پڑھی جاتی ہے؟"],
    ["Which voluntary prayer is performed in the mid-morning?", "ما صلاة الضحى؟", "Salat sunnah apa yang dikerjakan di waktu dhuha?", "چاشت کے وقت کون سی نفل نماز پڑھی جاتی ہے؟"],
  ],
  "namazi-bozan": [
    ["How does loud laughter in the prayer affect the prayer and wudu?", "كيف تؤثر القهقهة في الصلاة على الصلاة والوضوء؟", "Bagaimana tertawa terbahak dalam salat memengaruhi salat dan wudu?", "نماز میں قہقہہ لگانا نماز اور وضو پر کیا اثر ڈالتا ہے؟"],
    ["Which of the following invalidates the prayer?", "أي مما يلي يبطل الصلاة؟", "Manakah yang membatalkan salat?", "کون سی چیز نماز توڑ دیتی ہے؟"],
    ["Does excessive movement (amal kathir) invalidate the prayer?", "هل العمل الكثير يبطل الصلاة؟", "Apakah gerakan banyak (amal katsir) membatalkan salat?", "عملِ کثیر (زیادہ حرکت) نماز توڑتا ہے؟"],
    ["For how long may the private area remain uncovered before the prayer is voided?", "كم مدة انكشاف العورة تبطل بها الصلاة؟", "Berapa lama aurat terbuka hingga salat batal?", "نماز میں ستر کتنی دیر کھلا رہے تو نماز باطل ہو جاتی ہے؟"],
  ],
  "yemin-adak": [
    ["What does one who cannot afford the oath expiation do?", "ماذا يفعل من عجز عن كفارة اليمين؟", "Apa yang dilakukan orang yang tidak mampu kafarat sumpah?", "قسم کا کفارہ ادا نہ کر سکنے والا کیا کرے؟"],
    ["Which statement about vows is correct?", "أي عبارة عن النذر صحيحة؟", "Pernyataan mana tentang nadzar yang benar?", "نذر کے بارے میں کون سی بات درست ہے؟"],
    ["What is the ruling of an oath uttered carelessly out of habit?", "ما حكم اليمين اللغو؟", "Apa hukum sumpah yang terucap tanpa niat (laghw)?", "بغیر سوچے عادتاً کہی گئی قسم کا حکم کیا ہے؟"],
    ["What is the first option in the expiation for zihar?", "ما أول خيارات كفارة الظهار؟", "Apa pilihan pertama kafarat zihar?", "ظہار کے کفارے میں پہلا اختیار کیا ہے؟"],
  ],
  "dua-zikir": [
    ["What are we commanded to do when beginning to recite the Qur'an?", "بماذا نُؤمر عند بدء قراءة القرآن؟", "Apa yang diperintahkan saat mulai membaca Al-Qur'an?", "قرآن پڑھنا شروع کرتے وقت کس چیز کا حکم ہے؟"],
    ["Which verse ties the heart's tranquillity to remembrance of Allah?", "أي آية تربط طمأنينة القلوب بذكر الله؟", "Ayat mana yang mengaitkan ketenangan hati dengan zikir?", "دلوں کے سکون کو کس آیت میں ذکر سے جوڑا گیا ہے؟"],
    ["What does the Qur'an advise when supplicating?", "بماذا يوصي القرآن في الدعاء؟", "Apa nasihat Al-Qur'an saat berdoa?", "دعا کرتے وقت قرآن کی نصیحت کیا ہے؟"],
    ["How did Aisha describe the Prophet's character?", "كيف وصفت عائشة خُلق النبي ﷺ؟", "Bagaimana Aisyah menggambarkan akhlak Nabi ﷺ?", "حضرت عائشہ نے نبی ﷺ کے اخلاق کو کیسے بیان کیا؟"],
  ],
  cenaze: [
    ["What is the ruling of the funeral prayer?", "ما حكم صلاة الجنازة؟", "Apa hukum salat jenazah?", "نمازِ جنازہ کا حکم کیا ہے؟"],
    ["Which of the following is not part of the funeral prayer?", "أي مما يلي ليس في صلاة الجنازة؟", "Manakah yang tidak ada dalam salat jenazah?", "نمازِ جنازہ میں کون سی چیز نہیں ہے؟"],
    ["What is it called to remind the dying person of the declaration of faith?", "ماذا يُسمى تلقين المحتضر كلمة التوحيد؟", "Apa sebutan mengingatkan kalimat tauhid kepada orang yang sedang sakratul maut?", "موت کے بستر پر کلمۂ توحید یاد دلانے کو کیا کہتے ہیں؟"],
    ["Which statement about condolence is correct?", "أي عبارة عن التعزية صحيحة؟", "Pernyataan mana tentang takziah yang benar?", "تعزیت کے بارے میں کون سی بات درست ہے؟"],
  ],
  ruhsat: [
    ["How many rak'ahs does a traveller pray for the four-rak'ah obligatory prayers?", "كم يصلي المسافر الفرائض الرباعية؟", "Berapa rakaat musafir mengerjakan salat fardu empat rakaat?", "مسافر چار رکعت والی فرض نمازیں کتنی پڑھتا ہے؟"],
    ["How does a sick person pray?", "كيف يصلي المريض؟", "Bagaimana orang sakit mengerjakan salat?", "بیمار نماز کیسے پڑھتا ہے؟"],
    ["How long may a resident wipe over leather socks?", "كم مدة المسح على الخفين للمقيم؟", "Berapa lama orang mukim boleh mengusap khuff?", "مقیم موزوں پر کتنی مدت مسح کر سکتا ہے؟"],
    ["What does an elderly or seriously ill person who cannot fast do?", "ماذا يفعل الشيخ الكبير والمريض شديد المرض العاجز عن الصيام؟", "Apa yang dilakukan orang tua atau sakit berat yang tidak mampu berpuasa?", "روزہ نہ رکھ سکنے والا بوڑھا یا سخت بیمار کیا کرے؟"],
  ],
  hayiz: [
    ["According to the Hanafi school, what is the maximum duration of menstruation?", "ما أقصى مدة الحيض عند الحنفية؟", "Menurut Hanafi, berapa lama maksimal haid?", "حنفی کے نزدیک حیض کی زیادہ سے زیادہ مدت کتنی ہے؟"],
    ["Which act of worship does a menstruating woman make up later?", "أي عبادة تقضيها الحائض؟", "Ibadah apa yang diqada oleh perempuan haid?", "حائضہ کون سی عبادت بعد میں قضا کرتی ہے؟"],
    ["How does a woman with istihadah bleeding worship?", "كيف تعبد المستحاضة؟", "Bagaimana perempuan mustahadah beribadah?", "استحاضہ والی عورت کیسے عبادت کرتی ہے؟"],
  ],
  "nikah-hukuku": [
    ["According to the Hanafi school, what suffices for witnessing a marriage?", "ما يكفي في الشهادة على النكاح عند الحنفية؟", "Menurut Hanafi, apa yang cukup untuk saksi nikah?", "حنفی کے نزدیک نکاح پر گواہی کے لیے کیا کافی ہے؟"],
    ["What is the iddah of a widow?", "كم عدة المتوفى عنها زوجها؟", "Berapa iddah perempuan yang ditinggal mati suaminya?", "شوہر کے انتقال پر بیوہ کی عدت کتنی ہے؟"],
    ["What happens if the mahr is not specified in the marriage?", "ماذا يترتب إذا لم يُذكر المهر في النكاح؟", "Apa yang terjadi jika mahar tidak disebutkan dalam nikah?", "نکاح میں مہر ذکر نہ ہو تو کیا ہوتا ہے؟"],
  ],
  miras: [
    ["How much does a childless wife receive from her husband's estate?", "كم ترث الزوجة التي لا ولد لها من زوجها؟", "Berapa bagian istri tanpa anak dari harta suami?", "بے اولاد بیوی شوہر کے ترکے سے کتنا حصہ پاتی ہے؟"],
    ["Up to what share of the estate may a bequest be valid?", "إلى أي حد تصح الوصية من التركة؟", "Sampai berapa bagian wasiat sah dari harta warisan?", "وصیت ترکے کے زیادہ سے زیادہ کتنے حصے تک نافذ ہے؟"],
    ["Which of the following cannot inherit?", "أي مما يلي لا يرث؟", "Manakah yang tidak dapat mewarisi?", "درج ذیل میں کون وارث نہیں ہو سکتا؟"],
  ],
  "av-kesim": [
    ["What must be recited at the time of slaughter?", "ماذا يُقرأ عند الذبح؟", "Apa yang dibaca saat menyembelih?", "ذبح کے وقت کیا پڑھنا لازم ہے؟"],
    ["Which sea creature is definitely lawful?", "أي من طعام البحر حلال قطعًا؟", "Hasil laut mana yang pasti halal?", "سمندری غذا میں کون سی چیز قطعی حلال ہے؟"],
    ["What is the minimum age for a sacrificial sheep?", "ما أقل سن للشاة في الأضحية؟", "Berapa usia minimal kambing/domba kurban?", "قربانی کے بھیڑ کی کم از کم عمر کتنی ہونی چاہیے؟"],
  ],
  akitler: [
    ["What is a pledge (rahn) made for?", "لماذا يُشرع الرهن؟", "Untuk apa gadai (rahn) dilakukan?", "رہن کس لیے کیا جاتا ہے؟"],
    ["What does a guarantor do if the debt is not paid?", "ماذا يفعل الكفيل إذا لم يُوفَّ الدَّين؟", "Apa yang dilakukan penjamin bila utang tidak dibayar?", "ضامن قرض ادا نہ ہونے پر کیا کرتا ہے؟"],
    ["Which statement about endowed property is correct?", "أي عبارة عن المال الموقوف صحيحة؟", "Pernyataan mana tentang harta wakaf yang benar?", "وقف کیے گئے مال کے بارے میں کون سی بات درست ہے؟"],
  ],
  ceza: [
    ["When is retaliation (qisas) waived or reduced?", "متى يسقط القصاص أو يخف؟", "Kapan kisas gugur atau diringankan?", "قصاص کب ساقط یا ہلکا ہوتا ہے؟"],
    ["Who carries out the fixed penalties (hudud)?", "من يقيم الحدود؟", "Siapa yang melaksanakan hukuman hudud?", "حدود کون نافذ کرتا ہے؟"],
    ["How is the right of a person absolved?", "كيف تسقط حقوق العباد؟", "Bagaimana hak orang lain gugur?", "حق العبد کیسے ساقط ہوتا ہے؟"],
  ],
  sadaka: [
    ["What is ongoing charity (sadaqah jariyah)?", "ما الصدقة الجارية؟", "Apa itu sedekah jariyah?", "صدقۂ جاریہ کیا ہے؟"],
    ["Why is giving charity secretly more virtuous?", "لماذا إخفاء الصدقة أفضل؟", "Mengapa sedekah sembunyi lebih utama?", "صدقہ چھپا کر دینا کیوں افضل ہے؟"],
    ["What is the ruling of the fitrah charity?", "ما حكم صدقة الفطر؟", "Apa hukum zakat fitrah?", "فطرہ کا حکم کیا ہے؟"],
  ],
  "sular-necaset": [
    ["May one perform wudu with water whose colour, smell or taste has changed through impurity?", "هل يُتوضأ بماء تغيّر لونه أو ريحه أو طعمه بالنجاسة؟", "Bolehkah berwudu dengan air yang berubah warna, bau atau rasanya karena najis?", "جس پانی کا رنگ، بو یا ذائقہ نجاست سے بدل گیا ہو اس سے وضو ہو سکتا ہے؟"],
    ["According to the Hanafi school, what amount of heavy impurity does not prevent prayer?", "عند الحنفية، ما مقدار النجاسة الغليظة التي لا تمنع الصلاة؟", "Menurut Hanafi, berapa kadar najis berat yang tidak menghalangi salat?", "حنفی کے نزدیک نجاستِ غلیظہ کی وہ مقدار کتنی ہے جو نماز میں مانع نہیں؟"],
    ["What is done when no water is available?", "ما الحل عند فقد الماء؟", "Apa solusinya bila tidak ada air?", "پانی نہ ہونے پر کیا حل ہے؟"],
  ],
  "tilavet-secdesi": [
    ["According to the Hanafi school, what is the ruling of the prostration of recitation?", "ما حكم سجدة التلاوة عند الحنفية؟", "Menurut Hanafi, apa hukum sujud tilawah?", "حنفی کے نزدیک سجدۂ تلاوت کا حکم کیا ہے؟"],
    ["What happens if a verse of prostration is recited during the prayer?", "ماذا يحدث إذا قُرئت آية سجدة في الصلاة؟", "Apa yang terjadi bila ayat sajdah dibaca dalam salat?", "نماز میں آیتِ سجدہ پڑھی جائے تو کیا ہوتا ہے؟"],
    ["According to the Hanafi school, how many verses of prostration are there?", "كم عدد آيات السجدة عند الحنفية؟", "Menurut Hanafi, berapa jumlah ayat sajdah?", "حنفی کے نزدیک سجدے کی آیات کتنی ہیں؟"],
  ],
  "hac-menasik": [
    ["Which is the most important pillar of Hajj?", "ما أهم ركن في الحج؟", "Apa rukun haji yang paling penting?", "حج کا سب سے اہم رکن کون سا ہے؟"],
    ["Where is sa'i performed?", "أين يُؤدى السعي؟", "Di mana sai dilakukan?", "سعی کہاں کی جاتی ہے؟"],
    ["Which act of worship is not part of Umrah?", "أي عبادة ليست في العمرة؟", "Ibadah apa yang tidak ada dalam umrah?", "کون سی عبادت عمرہ میں نہیں ہے؟"],
  ],
  akika: [
    ["For what purpose is the aqiqah offered?", "لماذا تُذبح العقيقة؟", "Untuk apa akikah disembelih?", "عقیقہ کس مقصد کے لیے ذبح کیا جاتا ہے؟"],
    ["According to the Hanafi school, how many animals suffice for aqiqah?", "عند الحنفية، كم حيوانًا يكفي في العقيقة؟", "Menurut Hanafi, berapa hewan cukup untuk akikah?", "حنفی کے نزدیک عقیقے کے لیے کتنے جانور کافی ہیں؟"],
    ["Whose duty is the child's maintenance?", "على من تجب نفقة الطفل؟", "Siapa yang berkewajiban menafkahi anak?", "بچے کا نفقہ کس پر لازم ہے؟"],
  ],
  "faiz-banka": [
    ["In which verses is interest explicitly forbidden?", "في أي آيات حُرّم الربا صراحة؟", "Dalam ayat mana riba diharamkan secara tegas?", "سود کس آیات میں صریحاً حرام کیا گیا ہے؟"],
    ["In Hanafi fiqh, which statement about interest-bearing loans is correct?", "في الفقه الحنفي، أي عبارة عن القرض بفائدة صحيحة؟", "Dalam fikih Hanafi, pernyataan mana tentang kredit berbunga yang benar?", "حنفی فقہ میں سودی قرض کے بارے میں کون سی بات درست ہے؟"],
    ["What solidarity model is proposed instead of conventional insurance?", "ما نموذج التكافل المقترح بدل التأمين التقليدي؟", "Model tolong-menolong apa yang ditawarkan sebagai ganti asuransi konvensional?", "روایتی بیمہ کے متبادل کون سا تعاونی ماڈل تجویز کیا جاتا ہے؟"],
  ],
  "yeme-giyim": [
    ["How does one begin a meal?", "كيف يُبدأ الطعام؟", "Bagaimana memulai makan?", "کھانا کیسے شروع کیا جاتا ہے؟"],
    ["Which statement about wastefulness is correct?", "أي عبارة عن الإسراف صحيحة؟", "Pernyataan mana tentang israf yang benar?", "اسراف کے بارے میں کون سی بات درست ہے؟"],
    ["What is the awrah limit for men?", "ما حد العورة عند الرجل؟", "Apa batas aurat laki-laki?", "مرد کا ستر کہاں تک ہے؟"],
  ],
  "buyuk-gunahlar": [
    ["What is required for repentance to be valid?", "ما يشترط لصحة التوبة؟", "Apa syarat sahnya tobat?", "توبہ کے درست ہونے کے لیے کیا ضروری ہے؟"],
    ["How is the right of a person absolved?", "كيف تسقط حقوق العباد؟", "Bagaimana hak orang lain gugur?", "حق العبد کیسے ساقط ہوتا ہے؟"],
    ["Which of the following is among the major sins?", "أي مما يلي من الكبائر؟", "Manakah yang termasuk dosa besar?", "درج ذیل میں کون سا کبیرہ گناہ ہے؟"],
  ],
  komsuluk: [
    ["What is the basic standard towards parents?", "ما الأصل في التعامل مع الوالدين؟", "Apa sikap dasar terhadap orang tua?", "والدین کے ساتھ بنیادی رویہ کیا ہے؟"],
    ["How is severing kinship ties judged?", "كيف يُحكم على قطع الرحم؟", "Bagaimana hukum memutus silaturahmi?", "رشتہ داری توڑنے کا حکم کیا ہے؟"],
    ["Which verse mentions the rights of neighbours?", "أي آية تذكر حق الجار؟", "Ayat mana yang menyebut hak tetangga?", "ہمسایہ کے حق کا ذکر کس آیت میں ہے؟"],
  ],
  mezhepler: [
    ["What does a school of law (madhhab) express?", "ماذا يعبّر عنه المذهب الفقهي؟", "Apa yang dimaksud mazhab fikih?", "فقہی مذہب کیا بیان کرتا ہے؟"],
    ["Which of the following is not one of the four main Sunni schools?", "أي مما يلي ليس من المذاهب السنية الأربعة؟", "Manakah yang bukan salah satu empat mazhab Sunni utama?", "درج ذیل میں کون سا چار مشہور سنی مذاہب میں سے نہیں؟"],
    ["What is the correct attitude regarding disagreement?", "ما الموقف الصحيح في الخلاف؟", "Sikap yang benar dalam ikhtilaf?", "اختلاف کے بارے میں درست رویہ کیا ہے؟"],
  ],
  "fikih-terimleri": [
    ["Which ruling is sinful to omit and disbelief to deny?", "أي حكم يُأثم تاركه ويكفر جاحده؟", "Hukum mana yang berdosa bila ditinggalkan dan kufur bila diingkari?", "کون سا حکم چھوڑنا گناہ اور انکار کفر ہے؟"],
    ["What is the difference between makruh and haram?", "ما الفرق بين المكروه والحرام؟", "Apa beda makruh dan haram?", "مکروہ اور حرام میں کیا فرق ہے؟"],
    ["What is a concession granted in case of excuse called?", "ماذا تُسمى الرخصة عند العذر؟", "Apa sebutan keringanan saat ada uzur?", "عذر کی حالت میں دی گئی آسانی کو کیا کہتے ہیں؟"],
  ],
  "ibadet-hikmet": [
    ["By what are deeds valued?", "بم تُقدَّر قيمة الأعمال؟", "Berdasarkan apa nilai amal ditentukan?", "اعمال کی قدر کس چیز سے متعین ہوتی ہے؟"],
    ["What does showing off (riya) do?", "ماذا يفعل الرياء؟", "Apa yang dilakukan riya?", "ریا کیا کرتا ہے؟"],
    ["What is a newly invented practice in religion called?", "ماذا يُسمى ما أُحدث في الدين؟", "Apa sebutan praktik baru yang diada-adakan dalam agama?", "دین میں بعد میں ایجاد کی گئی چیز کو کیا کہتے ہیں؟"],
  ],
};

// ═══ ERİŞİM YARDIMCILARI ═══════════════════════════════════
/** Seçili dilde çeviri varsa döner; yoksa undefined → çağıran TR'ye düşer. */
function dilIndeksi(lang: string): number {
  const i = SIRA[lang as IlmihalCeviriDili];
  return typeof i === "number" ? i : -1;
}

export function dersAdi(d: { id: string; ad: string }, lang: string): string | undefined {
  const i = dilIndeksi(lang);
  return i < 0 ? undefined : AD[d.id]?.[i];
}

export function dersAlt(d: { id: string }, lang: string): string | undefined {
  const i = dilIndeksi(lang);
  return i < 0 ? undefined : ALT[d.id]?.[i];
}

/** Ders içindeki soru sırası (0 tabanlı) ile eşleşir. */
export function soruKoku(dersId: string, sira: number, lang: string): string | undefined {
  const i = dilIndeksi(lang);
  return i < 0 ? undefined : SORU[dersId]?.[sira]?.[i];
}
