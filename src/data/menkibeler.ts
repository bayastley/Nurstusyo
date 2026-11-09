import KISLAR from "./menkibeler/liste";
// ════════════════════════════════════════════════════════
// MENKIBELER.TS (02.11, kullanıcı emri: "İslami menkıbeler olsun; butona
// tıklayınca uzunca bir İslami hikâye açılsın; kaynak varsa ver, önemli
// olan kıssadan hisse alabilmektir") — İslâmî kıssa kasası.
//   · her kıssa: başlık + uzun hikâye + hikmet (kıssadan hisse) + kaynak
//   · kategoriler: Ölüm & Kabir, Nebiler, Ashab, Sâlihler, Hükümdarlar,
//     Hanımlar, İlim, Sabır, Tefekkür, Adalet — 100 kıssa yol haritası
//   · kaynaklar klasik eserler (İbn Kesir, Taberî, İbnül-Cevzî, ez-Zehebî…)
//   · kıssalar edebî anlatımdır; raviler eser adıyla yön gösterilir.
// ════════════════════════════════════════════════════════

export interface Menkibe {
  id: string;
  kategori: string;
  baslik: string;
  hikaye: string;
  hikmet: string;
  kaynak: string;
  baslik_en?: string; baslik_ar?: string; baslik_id?: string; baslik_ur?: string;
  hikaye_en?: string; hikaye_ar?: string; hikaye_id?: string; hikaye_ur?: string;
  hikmet_en?: string; hikmet_ar?: string; hikmet_id?: string; hikmet_ur?: string;
}

export const MENKIBELER: Menkibe[] = [
  ...KISLAR,
  {
    id: "mk-01",
    kategori: "Ölüm & Kabir",
    baslik: "Üç Dostun Son Muhasebesi",
    hikaye:
      "Ebu'd-Derdâ (r.a.) ve diğer erken dönem âlimlerinin meclislerinde sık sık dünya hayatının geçiciliği hatırlatılırdı. Bu temayı anlatan meşhur bir kıssada, ölüm döşeğindeki bir adamın malını, ailesini ve amelini kendisiyle temsil eden üç dost gibi düşündüğü aktarılır. Adam malına sorar: 'Benimle gelir misin?' Mal, kabre kadar değil ancak geride kalacağını söyler. Ailesine döner; onlar da uğurlayacaklarını fakat mezarın başından döneceklerini ifade eder. Son olarak ameline yönelir; amel, 'Ben seninleyim; kabre seninle girer, sorguda yanında bulunurum' der.\n\n" +
      "Bu anlatı, Kur’an’ın insanı hesaba çağıran genel mesajıyla aynı yöndedir: mal ve evlat, insanı Rabbine yaklaştıran salih amelin yerini tutmaz. Rivayetlerde lafızlar farklı biçimlerde aktarılsa da verilen ders aynıdır. Ebu'd-Derdâ’nın nasihatleri de insanı dünyayı terk etmeye değil, dünyayı ahiretin tarlası gibi görmeye çağırır. İnsanın en çok güvendiği şeylerin hangisinin gerçekten kalıcı olduğu, ölüm anında daha net anlaşılır.\n\n" +
      "Kıssanın özü şudur: insan, geride bırakacaklarını değil, yanında götüreceklerini önemsemelidir. Namaz, doğruluk, helal kazanç, affedicilik, ilim ve faydalı işler; görünmez ama kalıcı sermayedir.",
    hikmet:
      "Dünyada insanı terk etmeyen tek dost, salih ameldir. Mal ve yakınlar geride kalabilir; amel ise kulun hesabında yanında yer alır.",
    kaynak:
      "Ebu'd-Derdâ’ya nispet edilen öğütler ve benzer kıssa anlatıları: İbnü’l-Cevzî, Sıfatü’s-Safve; el-Gazzâlî, İhyâ’u Ulûmi’d-Dîn (ölüm/ahiret bölümleri, tematik anlatım).",
    baslik_en: "The Final Reckoning of Three Friends",
    hikaye_en:
      "In gatherings of early scholars such as Abu ad-Darda (may Allah be pleased with him), people were often reminded that worldly life is temporary. A well-known moral story on this theme describes a dying person who thinks of wealth, family, and deeds as three companions. He asks wealth whether it will stay with him; wealth answers that it will remain behind. He turns to family; they say they will escort him but then return. Finally he turns to his deeds; they reply, 'I am with you. I enter the grave with you and remain with you in accountability.'\n\n" +
      "This story reflects a broad Quranic message: wealth and children do not replace righteous deeds that draw a person closer to Allah. Even when narrations differ in wording, the lesson remains the same. The counsel attributed to Abu ad-Darda does not ask people to abandon the world, but to see it as a place where deeds for the Hereafter are planted. At the moment of death, a person sees more clearly which attachments are lasting.\n\n" +
      "The heart of the story is simple: people should value what they can carry forward, not only what they leave behind. Prayer, honesty, lawful work, forgiveness, knowledge, and beneficial action are an unseen but lasting provision.",
    hikmet_en:
      "The only companion that remains with a person is righteous action. Wealth and loved ones may stay behind, while deeds accompany the servant in accountability.",
    baslik_ar: "محاسبة الأصدقاء الثلاثة الأخيرة",
    hikaye_ar:
      "كان العلماء الأوائل، ومنهم أبو الدرداء رضي الله عنه، يذكرون الناس كثيرا بزوال الدنيا. وتعرض قصة وعظية مشهورة هذا المعنى على صورة رجل يحتضر يرى ماله وأهله وعمله كأصدقاء ثلاثة. يسأل المال: هل تبقى معي؟ فيجيب بأنه سيبقى خلفه. ويسأل أهله، فيقولون إنهم يشيعونه ثم يعودون. ثم يسأل عمله فيقول: أنا معك، أدخل معك القبر وأبقى معك في الحساب.\n\n" +
      "وهذه القصة توافق معنى قرآنيا واسعا: فالأموال والأولاد لا تغني عن العمل الصالح الذي يقرب العبد إلى الله. وقد تختلف ألفاظ الروايات، لكن العبرة واحدة. ولم تكن مواعظ أبي الدرداء دعوة إلى ترك الدنيا، بل إلى اعتبارها مزرعة للآخرة. وعند الموت يتضح للإنسان أي المتعلقات باقية وأيها زائلة.\n\n" +
      "وخلاصة القصة أن يهتم الإنسان بما ينفعه فيما يستقبله، لا بما يتركه فقط. فالصلاة والصدق والكسب الحلال والعفو والعلم والعمل النافع زاد خفي لكنه باق.",
    hikmet_ar:
      "الرفيق الذي يبقى مع الإنسان هو العمل الصالح. فالمال والأهل قد يتخلفون، أما العمل فيلازم العبد في حسابه.",
    baslik_id: "Perhitungan Terakhir Tiga Sahabat",
    hikaye_id:
      "Dalam majelis para ulama awal seperti Abu Darda radhiyallahu anhu, manusia sering diingatkan bahwa kehidupan dunia bersifat sementara. Sebuah kisah nasihat yang terkenal menggambarkan orang yang menjelang wafat memandang harta, keluarga, dan amalnya seperti tiga sahabat. Ia bertanya kepada hartanya apakah akan ikut bersamanya; harta menjawab akan tertinggal. Ia berpaling kepada keluarga; mereka berkata akan mengantar tetapi kemudian kembali. Lalu ia bertanya kepada amalnya; amal menjawab, 'Aku bersamamu. Aku masuk ke kubur bersamamu dan tetap bersamamu saat perhitungan.'\n\n" +
      "Kisah ini sejalan dengan pesan Al-Qur’an yang luas: harta dan anak tidak menggantikan amal saleh yang mendekatkan hamba kepada Allah. Meskipun redaksi riwayat dapat berbeda, pelajarannya tetap sama. Nasihat yang dinisbahkan kepada Abu Darda tidak mengajak manusia meninggalkan dunia, tetapi memandang dunia sebagai ladang amal untuk akhirat. Saat ajal tiba, seseorang lebih jelas melihat keterikatan mana yang benar-benar bertahan.\n\n" +
      "Inti kisah ini sederhana: manusia hendaknya menghargai apa yang dapat dibawanya, bukan hanya apa yang ditinggalkannya. Salat, kejujuran, penghasilan yang halal, pemaafan, ilmu, dan amal bermanfaat adalah bekal yang tidak terlihat tetapi bertahan.",
    hikmet_id:
      "Sahabat yang tetap menyertai manusia adalah amal saleh. Harta dan orang terdekat bisa tertinggal, sedangkan amal menyertai hamba dalam perhitungan.",
    baslik_ur: "تین دوستوں کا آخری محاسبہ",
    hikaye_ur:
      "ابتدائی علما کی مجالس میں، جن میں ابو الدرداء رضی اللہ عنہ بھی شامل ہیں، لوگوں کو اکثر دنیا کی عارضی حیثیت یاد دلائی جاتی تھی۔ اسی موضوع پر ایک معروف نصیحت آموز قصہ بیان کیا جاتا ہے جس میں مرنے کے قریب شخص اپنے مال، خاندان اور عمل کو تین دوستوں کی صورت میں دیکھتا ہے۔ وہ مال سے پوچھتا ہے: کیا تم میرے ساتھ رہو گے؟ مال جواب دیتا ہے کہ وہ پیچھے رہ جائے گا۔ پھر وہ خاندان سے پوچھتا ہے؛ وہ کہتے ہیں کہ جنازے تک ساتھ جائیں گے مگر واپس لوٹ آئیں گے۔ آخر میں وہ اپنے عمل سے پوچھتا ہے؛ عمل کہتا ہے: میں تمہارے ساتھ ہوں، قبر میں بھی ساتھ جاؤں گا اور حساب کے وقت بھی تمہارے ساتھ رہوں گا۔\n\n" +
      "یہ قصہ قرآن کے وسیع پیغام کے مطابق ہے کہ مال اور اولاد اس نیک عمل کا بدل نہیں بن سکتے جو بندے کو اللہ کے قریب کرے۔ اگرچہ روایتوں کے الفاظ مختلف ہو سکتے ہیں، مگر سبق ایک ہی رہتا ہے۔ ابو الدرداء رضی اللہ عنہ سے منسوب نصیحتوں کا مقصد دنیا چھوڑ دینا نہیں بلکہ دنیا کو آخرت کی کھیتی سمجھنا ہے۔ موت کے وقت انسان زیادہ واضح طور پر دیکھ لیتا ہے کہ کون سی وابستگی باقی رہنے والی ہے.\n\n" +
      "اس قصے کا خلاصہ یہ ہے کہ انسان کو وہ چیز اہم سمجھنی چاہیے جو وہ ساتھ لے جا سکتا ہے، نہ کہ صرف وہ جو پیچھے چھوڑ جاتا ہے۔ نماز، سچائی، حلال کمائی، درگزر، علم اور نفع دینے والا عمل ایسا سرمایہ ہے جو نظر نہیں آتا مگر باقی رہتا ہے۔",
    hikmet_ur:
      "انسان کے ساتھ رہ جانے والا دوست نیک عمل ہے۔ مال اور عزیز پیچھے رہ سکتے ہیں، جبکہ عمل حساب کے وقت بندے کے ساتھ رہتا ہے۔",
  },
];