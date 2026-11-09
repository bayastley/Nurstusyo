// ══════════════════════════════════════════════════════════════════
// SIYER.TS (31.10) — Hz. Muhammed (s.a.v.) Hayatı: kronolojik kategoriler
// ★ Talep (31.10): sekmede sağda kategoriler açılır; her olay kısa metin
//   + sahih kaynak. İsrâiliyât yok; olaylar Buhârî, Müslim, Muvatta ve
//   klâsik sîre kaynaklarından (İbn Hişâm, Vâkıdî, İbn Sa'd) seçilir.
//   Metinler TR; kategori adları siyerCokDil.ts ile 5 dilde.
// ══════════════════════════════════════════════════════════════════

export type SiyerDonem = "Mekke" | "Medine";

export interface SiyerOlay {
  metin: string;  // olay özeti (TR)
  metin_en?: string; metin_ar?: string; metin_id?: string; metin_ur?: string;
  kaynak: string; // sahih kaynak
}

export interface SiyerKategori {
  id: string; // çokdil anahtarı — siyerCokDil'de aynı id geçer
  ad: string; // TR kategori adı
  donem: SiyerDonem;
  olaylar: SiyerOlay[];
}

export const SIYER_KATEGORILER: SiyerKategori[] = [
  {
    "id": "dogum",
    "ad": "Doğum, Soy ve Çocukluk",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "Resûlullah ﷺ’ın soyu Kureyş kabilesi içinde Hâşimoğulları’na dayanır. Sîre ve tabakât kaynakları onun nesebini bilinen bir Arap soy zinciri içinde aktarır. Bu kayıt, biyografik bir ayrıntı olmanın ötesinde, İslam davetinin cahili kabile üstünlüğü yerine tevhit, ahlak ve sorumluluk ölçüsünü getireceğini anlamaya da zemin hazırlar. Kur’an’ın İbrâhimî çizgiyi hatırlatması, bu soy anlatımını salt gurur meselesi olmaktan çıkarır ve Allah’a yönelen bir teslimiyet geleneğiyle ilişkilendirir. Bu yüzden doğum ve soy bölümü, olayları bir şecere bilgisi gibi değil, tevhid tarihi içindeki bir başlangıç olarak okumayı gerektirir.",
        "metin_en": "The lineage of the Prophet (peace and blessings be upon him) is traced to Banu Hashim within Quraysh. Sirah and tabakat sources transmit his genealogy through a known Arab chain. This is more than a biographical detail: it helps show that the Islamic call would replace tribal pride with monotheism, moral character, and responsibility. The Quran’s reminder of the Abrahamic line removes lineage from mere boasting and connects it to a tradition of turning to Allah. For this reason, the section on birth and lineage should be read not only as genealogy but as a beginning within the history of monotheism.",
        "metin_ar": "ينتسب رسول الله صلى الله عليه وسلم إلى بني هاشم من قريش. وتذكر كتب السيرة والطبقات نسبه في سلسلة عربية معروفة. وليس هذا مجرد تفصيل سيرة، بل يساعد على فهم أن الدعوة الإسلامية جاءت لتجعل الميزان التوحيد والأخلاق والمسؤولية لا الفخر القبلي. وربط القرآن الخط الإبراهيمي بهذا المعنى يخرج النسب من مجرد الاعتزاز إلى صلة بتقليد الاستسلام لله. لذلك ينبغي قراءة هذا الباب بوصفه بداية في تاريخ التوحيد لا مجرد سجل أنساب.",
        "metin_id": "Nasab Rasulullah ditelusuri kepada Bani Hasyim dalam suku Quraisy. Sumber sirah dan tabakat menyampaikan silsilahnya dalam rantai Arab yang dikenal. Ini bukan sekadar detail biografi: ia membantu menunjukkan bahwa dakwah Islam akan menggantikan kebanggaan suku dengan tauhid, akhlak, dan tanggung jawab. Pengingat Al-Qur’an tentang garis Ibrahim menjauhkan nasab dari sekadar kebanggaan dan menghubungkannya dengan tradisi berpaling kepada Allah. Karena itu, bagian kelahiran dan nasab perlu dibaca sebagai awal dalam sejarah tauhid, bukan hanya catatan silsilah.",
        "metin_ur": "رسول اللہ صلی اللہ علیہ وسلم کا نسب قریش کے اندر بنو ہاشم تک پہنچتا ہے۔ سیرت اور طبقات کی کتب آپ کا نسب معروف عربی سلسلے میں بیان کرتی ہیں۔ یہ محض سوانحی تفصیل نہیں بلکہ اس بات کو سمجھنے میں مدد دیتی ہے کہ اسلامی دعوت قبائلی فخر کے بجائے توحید، اخلاق اور ذمہ داری کو معیار بنائے گی۔ قرآن کا ابراہیمی سلسلے کی طرف اشارہ نسب کو محض فخر سے نکال کر اللہ کی طرف رجوع کی روایت سے جوڑتا ہے۔ اس لیے پیدائش اور نسب کے باب کو صرف شجرہ نہیں بلکہ تاریخِ توحید کی ابتدا کے طور پر پڑھنا چاہیے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Babası Abdullah, Resûlullah ﷺ doğmadan önce vefat etmişti. Bu bilgi sîre kaynaklarında onun doğumundan önceki aile durumunu açıklamak için aktarılır ve Peygamber’in yetim olarak dünyaya gelişine işaret eder. Kur’an’da da Peygamber’e yöneltilen ‘seni yetim bulup barındırmadı mı?’ hitabı, bu gerçeği bir kırılma hikâyesi olmaktan çıkarıp ilahi koruma ve terbiyenin delili hâline getirir. Böylece yetimlik, onun hayatında bir eksiklik damgası değil; sabır, merhamet ve başkalarının acısını anlama kapasitesiyle ilişkili bir arka plan olur.",
        "metin_en": "His father Abdullah died before the Prophet was born. Sirah sources mention this to explain the family situation before his birth and to show that he came into the world as an orphan. In the Quran, the address to the Prophet—asking whether Allah found him an orphan and gave shelter—transforms this fact from a story of deprivation into a sign of divine care and nurturing. Orphanhood thus becomes not a mark of deficiency but part of a background connected to patience, mercy, and understanding the pain of others.",
        "metin_ar": "توفي والد النبي صلى الله عليه وسلم عبد الله قبل مولده. وتذكر مصادر السيرة ذلك لبيان حال أسرته قبل الولادة وأنه ولد يتيما. وقد حول القرآن هذا الواقع من صورة حرمان إلى علامة رعاية إلهية بقوله: ألم يجدك يتيما فآوى. فلا يكون اليتم وصمة نقص، بل سياقا يرتبط بالصبر والرحمة وفهم ألم الآخرين.",
        "metin_id": "Ayah Nabi, Abdullah, wafat sebelum beliau lahir. Sumber sirah menyebutkan ini untuk menjelaskan keadaan keluarga sebelum kelahiran dan menunjukkan bahwa beliau lahir sebagai yatim. Dalam Al-Qur’an, firman yang mengingatkan bahwa Allah mendapati beliau yatim lalu memberi perlindungan mengubah kenyataan ini dari kisah kekurangan menjadi tanda pemeliharaan ilahi. Dengan demikian, keadaan yatim bukan cap kekurangan, melainkan latar yang berkaitan dengan kesabaran, kasih sayang, dan memahami penderitaan orang lain.",
        "metin_ur": "نبی صلی اللہ علیہ وسلم کے والد عبداللہ آپ کی پیدائش سے پہلے وفات پا چکے تھے۔ سیرت کی کتب یہ بات پیدائش سے پہلے کے خاندانی حالات اور آپ کی یتیمی کو واضح کرنے کے لیے بیان کرتی ہیں۔ قرآن مجید نے اس حقیقت کو محرومی کی کہانی کے بجائے الٰہی حفاظت کی نشانی بنا دیا: کیا اس نے تمہیں یتیم پا کر پناہ نہ دی؟ اس طرح یتیمی کمی کا داغ نہیں بلکہ صبر، رحمت اور دوسروں کے درد کو سمجھنے کے پس منظر سے جڑتی ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an, Duhâ 93:6; İbn Kesîr"
      }
    ]
  },
  {
    "id": "genclik",
    "ad": "Gençlik, Ticaret ve Aile",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "Resûlullah ﷺ gençlik yıllarında Mekke toplumunun içinde ticaretle uğraştı. Bu dönem, onu hem yerel toplumsal ilişkilerin hem de Şam gibi güzergâhlar üzerinden daha geniş ekonomik ağların içine soktu. Kaynaklar, onun bu işlerde dürüst, sözünde duran ve emanete riayet eden bir kişi olarak tanındığını aktarır. Bu özellikler, sonraki tebliğ döneminde insanların ona karşı tutumunu anlamak için önemlidir; çünkü peygamberlik geldiğinde muhalifler dahi uzun yıllar boyunca onun doğruluğunu inkâr etmekte zorlanmıştır. Gençlik yılları bu nedenle sıradan bir biyografi detayı değil, güvenilirlik zemininin oluştuğu dönemdir.",
        "metin_en": "In his youth, the Prophet engaged in trade within Makkan society, which brought him into local relations and wider economic networks connected to routes such as Syria. Sources report that he became known as honest, reliable in speech, and careful with trusts. These qualities matter for understanding reactions to his later message, because even opponents struggled for years to deny his truthfulness. His youth was therefore not a minor biographical detail but a period in which the foundation of trustworthiness was formed.",
        "metin_ar": "عمل النبي صلى الله عليه وسلم في التجارة في شبابه داخل مجتمع مكة، فارتبط بالعلاقات المحلية وبشبكات اقتصادية أوسع عبر طرق مثل الشام. وتذكر المصادر أنه عرف بالصدق والوفاء وحفظ الأمانة. ولهذه الصفات أهمية في فهم موقف الناس من دعوته لاحقا، إذ وجد خصومه صعوبة في الطعن بصدقه الشخصي. فليست سنو الشباب تفصيلا عاديا، بل مرحلة تأسست فيها الثقة.",
        "metin_id": "Pada masa muda, Nabi berdagang dalam masyarakat Makkah dan terhubung dengan jaringan ekonomi yang lebih luas melalui rute seperti Syam. Sumber menyebut beliau dikenal jujur, menepati ucapan, dan menjaga amanah. Sifat-sifat ini penting untuk memahami respons terhadap dakwah beliau, karena para penentang pun sulit menyangkal kejujurannya. Masa muda beliau bukan detail biasa, tetapi tahap terbentuknya fondasi kepercayaan.",
        "metin_ur": "جوانی میں نبی صلی اللہ علیہ وسلم نے مکہ کے معاشرے میں تجارت کی، جس سے آپ مقامی تعلقات اور شام جیسے راستوں سے جڑی وسیع معاشی دنیا سے وابستہ ہوئے۔ مصادر بتاتے ہیں کہ آپ سچائی، وعدے کی پابندی اور امانت داری کے لیے معروف تھے۔ یہ صفات بعد کی دعوت کے ردعمل کو سمجھنے کے لیے اہم ہیں، کیونکہ مخالفین بھی آپ کی ذاتی سچائی پر طعن کرنے میں دشواری محسوس کرتے رہے۔ اس لیے جوانی محض ایک تفصیل نہیں بلکہ اعتماد کی بنیاد بننے کا دور ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hilfü’l-Fudûl, Mekke’de zulme uğrayan bir kişinin hakkını savunmak için yapılan bir ahit olarak anlatılır. Resûlullah ﷺ bu yeminde yer aldı ve İslam’dan sonra da bu tür adalet amaçlı bir çağrıya olumlu baktığını ifade ettiği rivayet edilir. Bu olay, İslam’ın geldiği toplumda her şeyin karanlık olmadığını; aynı zamanda cahiliye döneminde bile adalet duygusunun bazı izlerinin bulunduğunu gösterir. Ancak İslam, bu sınırlı ahlaki girişimleri ilahi vahiy, tevhid ve kapsamlı sorumluluk ilkeleriyle daha sağlam bir zemine oturtmuştur. Bu nedenle Hilfü’l-Fudûl, süreklilik ve tamamlanma ilişkisini anlamak için önemli bir örnektir.",
        "metin_en": "Hilf al-Fudul is described as a pact in Makkah to defend the rights of a wronged person. The Prophet took part in it, and reports state that after Islam he still spoke positively about a call made for justice. This shows that not everything in pre-Islamic society was devoid of moral concern; traces of justice existed even then. Islam, however, placed such limited moral efforts on a firmer foundation through revelation, monotheism, and comprehensive responsibility. Hilf al-Fudul is therefore an important example of continuity and completion.",
        "metin_ar": "يذكر حلف الفضول بوصفه عهدا في مكة لنصرة المظلوم. وشارك فيه النبي صلى الله عليه وسلم، وتذكر الروايات أنه أثنى على مثل هذا المعنى بعد الإسلام. ويدل ذلك على أن المجتمع الجاهلي لم يكن خاليا تماما من بقايا العدل، لكن الإسلام وضع هذه الجهود المحدودة على أساس أثبت بالوحي والتوحيد والمسؤولية الشاملة. فحلف الفضول مثال مهم لفهم علاقة الاستمرار والتكميل.",
        "metin_id": "Hilf al-Fudul digambarkan sebagai perjanjian di Makkah untuk membela hak orang yang dizalimi. Nabi ikut serta, dan riwayat menyebut beliau tetap memandang positif seruan keadilan semacam itu setelah Islam. Ini menunjukkan bahwa masyarakat pra-Islam tidak sepenuhnya tanpa kepedulian moral; jejak keadilan tetap ada. Namun Islam menempatkan upaya moral terbatas itu di atas dasar yang lebih kokoh melalui wahyu, tauhid, dan tanggung jawab menyeluruh. Hilf al-Fudul penting untuk memahami kesinambungan dan penyempurnaan.",
        "metin_ur": "حلف الفضول کو مکہ میں مظلوم کے حق کی حمایت کے عہد کے طور پر بیان کیا جاتا ہے۔ نبی صلی اللہ علیہ وسلم اس میں شامل ہوئے اور روایات کے مطابق اسلام کے بعد بھی انصاف کی ایسی پکار کو سراہا۔ یہ بتاتا ہے کہ جاہلی معاشرہ اخلاقی احساس سے مکمل خالی نہ تھا، مگر ایسے محدود اقدامات کو اسلام نے وحی، توحید اور جامع ذمہ داری کے ذریعے مضبوط بنیاد پر قائم کیا۔ اس لیے حلف الفضول تسلسل اور تکمیل کے تعلق کو سمجھنے کی اہم مثال ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hatice binti Huveylid (r.a.), Mekke’de saygın bir tüccar ve akıllı bir yöneticiydi. Resûlullah ﷺ’ın güvenilirliğini ve iş ahlakını fark edince ticaret işinde onu görevlendirdiği aktarılır. Bu görev, iki taraf arasında karşılıklı güvene dayalı bir ilişkinin başlangıcı oldu. Sîre kaynakları, yolculuk dönüşünde elde edilen sonuçların ve Resûlullah’ın dürüst tutumunun bu güveni pekiştirdiğini anlatır. Hatice ile evlilik, yalnızca bir aile kurulması değil; ilk vahiy döneminde manevi ve toplumsal destek sağlayacak güçlü bir ortaklığın da başlangıcıdır.",
        "metin_en": "Khadijah bint Khuwaylid was a respected merchant and capable manager in Makkah. Recognizing the Prophet’s trustworthiness and business ethics, she entrusted him with trade responsibilities. This began a relationship grounded in mutual trust. Sirah sources report that the results of the journey and the Prophet’s honest conduct strengthened that trust. His marriage to Khadijah was not only the formation of a family but also the beginning of a strong partnership that would provide moral and social support during the first years of revelation.",
        "metin_ar": "كانت خديجة بنت خويلد رضي الله عنها تاجرة ذات شأن وحسن تدبير في مكة. ولما رأت أمانة النبي صلى الله عليه وسلم وخلقه في التجارة أوكلت إليه عملا تجاريا. فبدأت علاقة قائمة على الثقة المتبادلة. وتذكر مصادر السيرة أن نجاح الرحلة وصدق سلوكه عززا هذه الثقة. ولم يكن الزواج من خديجة تكوين أسرة فقط، بل بداية شراكة قوية قدمت دعما معنويا واجتماعيا في سنوات الوحي الأولى.",
        "metin_id": "Khadijah binti Khuwailid adalah pedagang terhormat dan pengelola yang cakap di Makkah. Melihat amanah dan etika dagang Nabi, ia mempercayakan urusan perdagangan kepadanya. Ini memulai hubungan yang dibangun atas saling percaya. Sumber sirah menyebut hasil perjalanan dan kejujuran Nabi memperkuat kepercayaan itu. Pernikahan dengan Khadijah bukan hanya pembentukan keluarga, tetapi awal kemitraan kuat yang memberi dukungan moral dan sosial pada tahun-tahun awal wahyu.",
        "metin_ur": "خدیجہ بنت خویلد رضی اللہ عنہا مکہ میں باوقار تاجر اور سمجھدار منتظم تھیں۔ نبی صلی اللہ علیہ وسلم کی امانت داری اور کاروباری اخلاق دیکھ کر انہوں نے آپ کو تجارتی کام سونپا۔ یہ باہمی اعتماد پر مبنی تعلق کی ابتدا تھی۔ سیرت کی کتب کے مطابق سفر کے نتائج اور آپ کی دیانت نے اس اعتماد کو مزید مضبوط کیا۔ خدیجہ سے نکاح صرف خاندان کی تشکیل نہیں تھا بلکہ ایک مضبوط رفاقت کا آغاز تھا جس نے وحی کے ابتدائی برسوں میں اخلاقی اور سماجی سہارا دیا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Resûlullah ﷺ ile Hatice (r.a.) arasındaki evlilik, sîrede sevgi, sadakat ve dayanışma örneği olarak aktarılır. Bu evlilikten çocukları oldu; Kâsım ve Abdullah’ın küçük yaşta vefatı aile için üzüntü kaynağıydı. Zeyneb, Rukiyye, Ümmü Gülsüm ve Fâtıma ise Peygamber ailesinin Medine ve Mekke dönemlerinde anılan fertleri oldular. Bu aile tablosu, Peygamber’in hayatının yalnızca toplumsal mücadeleden ibaret olmadığını; aynı zamanda baba, eş ve aile ferdi olarak sorumluluklar taşıdığını gösterir. Sîreyi okurken bu insanî yönü görmek, olayları daha dengeli anlamaya yardımcı olur.",
        "metin_en": "The marriage between the Prophet and Khadijah is presented in sirah as an example of love, loyalty, and support. They had children; the early deaths of Qasim and Abdullah were sources of grief. Zaynab, Ruqayyah, Umm Kulthum, and Fatimah became well-known members of the Prophet’s family in the Makkan and Madinan periods. This family picture shows that the Prophet’s life was not only public struggle but also carried responsibilities as a husband, father, and family member. Seeing this human dimension helps readers understand the sirah more balancedly.",
        "metin_ar": "يقدم زواج النبي صلى الله عليه وسلم بخديجة رضي الله عنها في السيرة نموذجا للمودة والوفاء والدعم. وكان لهما أولاد، فكان موت القاسم وعبد الله صغيرين مصدرا للحزن. وعرفت زينب ورقية وأم كلثوم وفاطمة بوصفهن من بنات بيت النبوة في مرحلتي مكة والمدينة. ويبين هذا الجانب الأسري أن حياة النبي صلى الله عليه وسلم لم تكن صراعا عاما فقط، بل شملت مسؤوليات الزوج والأب والفرد في أسرته. ورؤية هذا البعد الإنساني تعين على فهم السيرة فهما متوازنا.",
        "metin_id": "Pernikahan Nabi dengan Khadijah digambarkan dalam sirah sebagai teladan kasih, kesetiaan, dan dukungan. Mereka memiliki anak; wafatnya Qasim dan Abdullah saat kecil menjadi duka. Zainab, Ruqayyah, Ummu Kultsum, dan Fatimah dikenal sebagai bagian keluarga Nabi pada periode Makkah dan Madinah. Gambaran keluarga ini menunjukkan bahwa hidup Nabi bukan hanya perjuangan publik, tetapi juga tanggung jawab sebagai suami, ayah, dan anggota keluarga. Melihat sisi manusiawi ini membantu memahami sirah secara lebih seimbang.",
        "metin_ur": "نبی صلی اللہ علیہ وسلم اور خدیجہ رضی اللہ عنہا کا نکاح سیرت میں محبت، وفاداری اور باہمی سہارا کی مثال کے طور پر آتا ہے۔ آپ کی اولاد ہوئی؛ قاسم اور عبداللہ کا کم عمری میں انتقال خاندان کے لیے غم تھا۔ زینب، رقیہ، ام کلثوم اور فاطمہ مکی اور مدنی ادوار میں نبی کے گھرانے کے معروف افراد بنیں۔ یہ خاندانی تصویر بتاتی ہے کہ نبی کی زندگی صرف اجتماعی جدوجہد نہیں تھی بلکہ شوہر، والد اور خاندان کے فرد کی ذمہ داریاں بھی شامل تھیں۔ اس انسانی پہلو کو دیکھنا سیرت کو متوازن طور پر سمجھنے میں مدد دیتا ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hatice (r.a.), İslam’ın ilk yıllarında yalnızca aile içi bir destek değil, tebliğin güven bulduğu ilk çevrelerden biri oldu. İlk vahiy sonrası Resûlullah ﷺ’ı tasdik etmesi, onu sakinleştirmesi ve sonraki süreçte yanında durması, sîrede çok merkezi bir yer tutar. Bu destek, maddi imkânların paylaşılması kadar manevi güvenin verilmesi anlamına da geliyordu. Bu nedenle Hatice’nin rolü, erken İslam tarihinde bireysel bir biyografi notu değil, davetin ayakta kalmasına katkı sunan güçlü bir dayanak olarak görülür. Resûlullah ﷺ’ın onun vefatından sonra da Hatice’yi saygı ve sevgiyle anması bu bağın derinliğini gösterir.",
        "metin_en": "Khadijah was not only family support in the earliest years of Islam; she was part of the first circle in which the message found trust. Her affirmation, reassurance, and continued support after the first revelation hold a central place in sirah. This support included sharing material means as well as giving moral confidence. Her role should therefore be seen not as a minor biographical note but as a strong pillar contributing to the survival of the early call. The Prophet’s continued respect and loving remembrance of Khadijah after her death shows the depth of that bond.",
        "metin_ar": "لم تكن خديجة رضي الله عنها دعما أسريا فقط في صدر الإسلام، بل كانت من أول محيط وجد فيه الوحي والثقة. وتصديقها للنبي صلى الله عليه وسلم وتطمينها له وثباتها معه بعد أول الوحي له مكانة مركزية في السيرة. ولم يكن دعمها ماليا فحسب، بل كان دعما نفسيا ومعنويا عميقا. لذلك ينبغي فهم دورها بوصفه ركنا قويا أسهم في قيام الدعوة الأولى، لا مجرد تفصيل شخصي. واستمرار النبي صلى الله عليه وسلم في ذكرها بالوفاء والمحبة بعد وفاتها يدل على عمق هذه العلاقة.",
        "metin_id": "Khadijah bukan hanya dukungan keluarga pada tahun-tahun awal Islam; ia adalah bagian dari lingkaran pertama tempat risalah menemukan kepercayaan. Pembenaran, penenangan, dan dukungan berkelanjutannya setelah wahyu pertama memiliki tempat sentral dalam sirah. Dukungan ini mencakup berbagi sarana materi sekaligus memberi keyakinan moral. Karena itu perannya perlu dipahami bukan sebagai catatan biografis kecil, tetapi sebagai pilar kuat yang membantu dakwah awal bertahan. Penghormatan dan kenangan penuh kasih Nabi kepada Khadijah setelah wafatnya menunjukkan kedalaman ikatan itu.",
        "metin_ur": "خدیجہ رضی اللہ عنہا اسلام کے ابتدائی برسوں میں صرف خاندانی سہارا نہیں تھیں بلکہ پہلے حلقوں میں سے تھیں جہاں دعوت کو اعتماد ملا۔ پہلی وحی کے بعد آپ کی تصدیق، تسلی اور مسلسل ساتھ سیرت میں مرکزی حیثیت رکھتا ہے۔ یہ سہارا مال کی شراکت کے ساتھ ساتھ اخلاقی اعتماد بھی تھا۔ اس لیے خدیجہ کا کردار محض ذاتی سوانح نہیں بلکہ ابتدائی دعوت کے قائم رہنے میں مدد دینے والا مضبوط ستون ہے۔ آپ کی وفات کے بعد بھی نبی ﷺ کا انہیں محبت اور وفا سے یاد کرنا اس تعلق کی گہرائی دکھاتا ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Peygamberlik öncesi aile ve ticaret hayatında Resûlullah ﷺ’ın adaletli davranması, öfkeye kapılmadan çözüm araması ve emanete sadakati, toplumsal hafızada yer etti. Bu saygınlık, Mekke’de herkesin Müslüman olmasını sağlamadı; fakat davetin ilk aşamasında söylenen sözün kimden çıktığı konusunda güçlü bir arka plan oluşturdu. İnsanlar bir tebliği değerlendirirken çoğu zaman tebliğcinin geçmişini de hatırlar. Bu nedenle gençlik ve evlilik dönemi, vahiy sonrası yaşanacak olayların ahlaki zeminini anlamak için gereklidir. Siyer, mucizevî anlarla birlikte bu uzun karakter inşasını da içerir.",
        "metin_en": "Before prophethood, the Prophet’s fairness in family and trade, his search for solutions without uncontrolled anger, and his loyalty to trusts became part of social memory. This respect did not make everyone in Makkah accept Islam, but it formed a strong background for the early stage of the message by clarifying the character of the one delivering it. People often assess a message in light of the speaker’s past. Therefore, the years of youth and marriage are necessary for understanding the moral ground of later events after revelation. Sirah includes miraculous moments, but also this long formation of character.",
        "metin_ar": "رسخت في الذاكرة الاجتماعية قبل البعثة صورة النبي صلى الله عليه وسلم في العدل في الأسرة والتجارة، وطلب الحلول دون طيش، وحفظ الأمانة. ولم تجعل هذه المكانة كل أهل مكة يؤمنون، لكنها وفرت خلفية قوية لمرحلة الدعوة الأولى من حيث شخصية الداعي. فالناس كثيرا ما ينظرون إلى الرسالة في ضوء سيرة صاحبها. لذلك لا بد من فهم سنوات الشباب والزواج لفهم الأرضية الأخلاقية لما حدث بعد الوحي. والسيرة تجمع بين اللحظات العظيمة وبين بناء الشخصية الطويل.",
        "metin_id": "Sebelum kenabian, keadilan Nabi dalam keluarga dan perdagangan, sikap mencari solusi tanpa amarah berlebihan, dan kesetiaan pada amanah tertanam dalam ingatan sosial. Penghormatan ini tidak membuat semua orang Makkah menerima Islam, tetapi memberi latar kuat pada tahap awal dakwah tentang siapa pembawa pesannya. Orang sering menilai pesan melalui masa lalu pembawanya. Karena itu masa muda dan pernikahan penting untuk memahami landasan moral peristiwa setelah wahyu. Sirah mencakup momen-momen besar sekaligus pembentukan karakter yang panjang.",
        "metin_ur": "نبوت سے پہلے خاندان اور تجارت میں نبی صلی اللہ علیہ وسلم کا عدل، غصے کے بغیر حل تلاش کرنا اور امانت کی پابندی معاشرتی یادداشت کا حصہ بن گئی۔ اس عزت نے سب کو مسلمان نہیں کیا، مگر ابتدائی دعوت میں یہ مضبوط پس منظر فراہم کیا کہ پیغام لانے والا کون ہے۔ لوگ اکثر پیغام کو اس کے بیان کرنے والے کے ماضی کی روشنی میں بھی دیکھتے ہیں۔ اس لیے جوانی اور نکاح کے سال وحی کے بعد کے واقعات کی اخلاقی زمین سمجھنے کے لیے ضروری ہیں۔ سیرت میں غیر معمولی لمحات کے ساتھ طویل کردار سازی بھی شامل ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Gençlik döneminin bir başka önemli yönü, Resûlullah ﷺ’ın Mekke’nin sosyal yaralarını yakından görmesiydi. Kabilecilik, güçlülerin zayıfı ezmesi, adaletsiz ticaret ve ahlaki çürüme gibi sorunlar şehir hayatında görünürdü. Bu gözlemler, sonraki vahyin adalet, ahiret sorumluluğu, yetim hakkı, ölçü ve emanete verdiği önemle daha iyi anlaşılır. Vahiy elbette insan gözleminin ürünü değildir; fakat vahyin indiği toplumsal bağlamı bilmek, mesajın hangi yaralara temas ettiğini gösterir. Bu nedenle gençlik yılları, tebliğ sonrasının dili ve hedefleri için bir hazırlık sahnesi olarak okunabilir.",
        "metin_en": "Another important aspect of his youth was his close view of Makkah’s social wounds. Tribalism, oppression of the weak by the strong, unfair trade, and moral decay were visible in city life. These observations help readers better understand why revelation later emphasized justice, accountability in the Hereafter, the rights of orphans, fair measure, and trust. Revelation is not a product of human observation, but knowing the social context in which it came shows which wounds the message addressed. The years of youth can therefore be read as a preparatory scene for the language and aims of the later call.",
        "metin_ar": "ومن الجوانب المهمة في شبابه اطلاع النبي صلى الله عليه وسلم القريب على جراح مجتمع مكة. فقد كانت العصبية، وتسليط القوي على الضعيف، والغش في التجارة، والفساد الأخلاقي ظاهرة في حياة المدينة. وتعين هذه المعرفة على فهم تأكيد الوحي لاحقا على العدل والمسؤولية الأخروية وحق اليتيم والميزان والأمانة. والوحي ليس نتاج ملاحظة بشرية، لكن معرفة السياق الاجتماعي تبين مواطن الألم التي خاطبها. لذلك يمكن قراءة سنوات الشباب بوصفها مشهدا تمهيديا للغة الدعوة وأهدافها.",
        "metin_id": "Aspek penting lain dari masa muda beliau adalah kedekatannya dengan luka sosial Makkah. Kesukuan, penindasan orang lemah oleh yang kuat, perdagangan curang, dan kerusakan moral tampak dalam kehidupan kota. Pengamatan ini membantu memahami mengapa wahyu kemudian menekankan keadilan, pertanggungjawaban akhirat, hak anak yatim, takaran yang adil, dan amanah. Wahyu bukan produk pengamatan manusia, tetapi mengetahui konteks sosial turunnya wahyu menunjukkan luka mana yang disentuh pesan itu. Karena itu masa muda dapat dibaca sebagai panggung persiapan bagi bahasa dan tujuan dakwah.",
        "metin_ur": "جوانی کا ایک اہم پہلو یہ تھا کہ نبی صلی اللہ علیہ وسلم نے مکہ کے سماجی زخموں کو قریب سے دیکھا۔ قبائلیت، طاقتور کا کمزور پر ظلم، ناپ تول میں خیانت اور اخلاقی زوال شہر کی زندگی میں نمایاں تھے۔ یہ مشاہدات بعد میں وحی کے عدل، آخرت کی جوابدہی، یتیم کے حق، پیمانے اور امانت پر زور کو بہتر سمجھنے میں مدد دیتے ہیں۔ وحی انسانی مشاہدے کی پیداوار نہیں، مگر سماجی پس منظر جاننا بتاتا ہے کہ پیغام کن زخموں کو چھوتا ہے۔ اس لیے جوانی کو بعد کی دعوت کی زبان اور مقاصد کی تیاری کے منظر کے طور پر دیکھا جا سکتا ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      }
    ]
  },
  {
    "id": "hira",
    "ad": "Hira, Tahannüs, İlk Vahiy ve Fetre",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "Resûlullah ﷺ kırk yaşlarına yaklaşırken Mekke toplumundaki putperestlik, ahlaki çözülme ve kabile çıkarları arasında içten bir arayış içindeydi. Sîre kaynakları bu dönemde Hira Mağarası’na çekildiğini, burada tefekkür ettiği, düşünceye daldığı ve Mekke’nin gürültüsünden uzaklaştığını aktarır. Bu yalnız bir inziva alışkanlığı değil; kalbin hakikate hazırlanması, vahyin ağırlığını taşıyacak bir ruhî olgunluğa yönelmesi olarak anlaşılır. Böylece ilk vahiy, ansızın gelen bir boşlukta değil, uzun bir iç hazırlığın ardından gerçekleşmiştir.",
        "metin_en": "As the Prophet approached forty, he experienced a deep inner search amid idolatry, moral decline, and tribal interests in Makkah. Sirah sources report that he would withdraw to the Cave of Hira to reflect, contemplate, and step away from the noise of the city. This was not merely a habit of seclusion; it can be understood as preparation of the heart for truth and spiritual readiness to bear the weight of revelation. The first revelation thus came after a long inner preparation, not in an empty moment.",
        "metin_ar": "كان النبي صلى الله عليه وسلم قبيل بلوغه الأربعين يعيش بحثا قلبيا في ظل الشرك والانحلال الأخلاقي والمصالح القبلية في مكة. وتذكر مصادر السيرة أنه كان يخلو في غار حراء يتفكر ويبتعد عن صخب المجتمع. ولم يكن ذلك عادة اعتزال فقط، بل تهيئة للقلب لاستقبال الحق وتحمل ثقل الوحي. فجاء أول الوحي بعد إعداد داخلي طويل.",
        "metin_id": "Menjelang usia empat puluh tahun, Nabi mengalami pencarian batin di tengah penyembahan berhala, kemerosotan moral, dan kepentingan kabilah di Makkah. Sumber sirah menyebut beliau menyendiri di Gua Hira untuk bertafakur, merenung, dan menjauh dari hiruk pikuk kota. Ini bukan sekadar kebiasaan menyepi, tetapi dapat dipahami sebagai persiapan hati untuk menerima kebenaran dan kesiapan ruhani memikul wahyu. Wahyu pertama pun datang setelah persiapan batin yang panjang.",
        "metin_ur": "چالیس برس کی عمر کے قریب نبی صلی اللہ علیہ وسلم مکہ میں بت پرستی، اخلاقی گراوٹ اور قبائلی مفادات کے درمیان گہری داخلی تلاش میں تھے۔ سیرت کی کتب میں آتا ہے کہ آپ غار حرا میں خلوت اختیار کرتے، غور و فکر کرتے اور شہر کے شور سے دور رہتے۔ یہ محض تنہائی کی عادت نہیں تھی بلکہ حق کی تیاری اور وحی کا بوجھ اٹھانے کے لیے روحانی آمادگی تھی۔ پہلی وحی اچانک خالی لمحے میں نہیں بلکہ طویل داخلی تیاری کے بعد آئی۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Bu inziva dönemine kaynaklarda tahannüs adı da verilir. Rivayetlerde Resûlullah ﷺ’ın Hira’da geceler geçirdiği, yanında azık bulundurduğu, azığı bitince ailesinin yanına dönüp yeniden hazırlık yaparak mağaraya çıktığı aktarılır. Bu düzenli gidiş-geliş, onun tefekkürünün geçici bir merak değil, derin ve süreklilik taşıyan bir arayış olduğunu gösterir. Tefekkür burada kaçış değil; insanın kendisini, toplumunu ve yaratılışın anlamını sorgulamasıydı. Böyle bir arayış, sonraki tebliğde ortaya çıkacak olan hakikat, sorumluluk ve ahiret bilinciyle uyum içindedir.",
        "metin_en": "This period of withdrawal is also referred to in sources as tahannuth. Reports state that the Prophet would spend nights in Hira, bring provisions, return to his family when supplies ended, and go back again prepared. This regular pattern shows that his reflection was not a passing curiosity but a deep and sustained search. Reflection here was not escape; it was questioning oneself, society, and the meaning of creation. Such searching aligns with the truth, responsibility, and awareness of the Hereafter that would appear in the later call.",
        "metin_ar": "وتسمى هذه الخلوة في بعض الروايات التحنث. وتذكر الروايات أنه كان يمكث في حراء الليالي، ومعه زاد، فإذا نفد عاد إلى أهله ثم يرجع مستعدا. ويدل هذا التردد المنتظم على أن تفكره لم يكن فضولا عابرا، بل بحثا عميقا متصلا. ولم يكن التفكر هنا هروبا، بل تساؤلا عن النفس والمجتمع ومعنى الخلق. وهذا البحث ينسجم مع الحق والمسؤولية والوعي بالآخرة التي ظهرت لاحقا في الدعوة.",
        "metin_id": "Masa menyepi ini dalam sumber juga disebut tahannuts. Riwayat menyebut Nabi bermalam di Hira, membawa bekal, pulang kepada keluarganya ketika bekal habis, lalu kembali lagi. Pola yang teratur ini menunjukkan bahwa tafakur beliau bukan rasa ingin tahu sesaat, melainkan pencarian yang dalam dan berkelanjutan. Tafakur di sini bukan pelarian, tetapi pertanyaan tentang diri, masyarakat, dan makna penciptaan. Pencarian ini selaras dengan kebenaran, tanggung jawab, dan kesadaran akhirat yang muncul dalam dakwah berikutnya.",
        "metin_ur": "اس خلوت کو بعض روایات میں تحنث کہا جاتا ہے۔ روایات کے مطابق آپ غار حرا میں راتیں گزارتے، ساتھ زادِ راہ رکھتے، ختم ہونے پر گھر آتے اور پھر تیار ہو کر واپس جاتے۔ یہ مسلسل آمد و رفت بتاتی ہے کہ آپ کا غور و فکر عارضی دلچسپی نہیں بلکہ گہری اور پائیدار تلاش تھی۔ یہاں فکر فرار نہیں تھی بلکہ خود، معاشرے اور پیدائش کے معنی پر سوال تھا۔ یہی تلاش آگے کی دعوت میں ظاہر ہونے والے حق، ذمہ داری اور آخرت کے شعور سے ہم آہنگ تھی۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hira’da ilk vahiy geldiğinde Cebrâil (a.s.) Resûlullah ﷺ’a ‘Oku’ dedi. Bu hadise Buhârî’de Bed’ü’l-vahy bölümünde ayrıntılı biçimde rivayet edilir. Resûlullah’ın ‘Ben okuma bilmem’ ya da benzer anlamdaki cevabı, karşılaştığı deneyimin olağanüstü ağırlığını gösterir. Cebrâil’in onu sıkması ve emri tekrarlaması, vahyin insanî bir kurgu olmadığını, ilahi bir hitap olarak geldiğini hissettirir. Ardından Alak Suresi’nin ilk ayetleri indi: Yaratan Rabbin adıyla oku; insanı alaktan yaratan; insana bilmediğini öğreten Rab. Bu ayetler okuma, ilim, yaratılış ve Rabb’e nispet temellerini bir araya getirir.",
        "metin_en": "When the first revelation came in Hira, Jibril (peace be upon him) said to the Prophet, ‘Read.’ This event is reported in detail in Bukhari’s chapter on the beginning of revelation. The Prophet’s response, meaning that he could not read, shows the overwhelming nature of the experience. Jibril’s embrace and repetition of the command convey that this was not a human invention but a divine address. Then came the opening verses of Surah al-Alaq: Read in the name of your Lord who created; created the human being from a clinging form; taught the human being what he did not know. These verses unite reading, knowledge, creation, and relation to the Lord.",
        "metin_ar": "لما جاء الوحي الأول في حراء قال جبريل عليه السلام للنبي صلى الله عليه وسلم: اقرأ. وقد ورد هذا الحديث مفصلا في كتاب بدء الوحي من صحيح البخاري. وجواب النبي صلى الله عليه وسلم بأنه ما هو بقارئ يدل على ثقل ما واجهه من أمر عظيم. وتكرار الأمر مع الضمة يدل على أن الأمر ليس تصورا بشريا بل خطاب إلهي. ثم نزلت أوائل سورة العلق: اقرأ باسم ربك الذي خلق، خلق الإنسان من علق، علم الإنسان ما لم يعلم. وتجمع هذه الآيات بين القراءة والعلم والخلق ونسبة الأمر إلى الرب.",
        "metin_id": "Ketika wahyu pertama datang di Hira, Jibril berkata kepada Nabi, ‘Bacalah.’ Peristiwa ini diriwayatkan secara rinci dalam bab permulaan wahyu di Sahih Bukhari. Jawaban Nabi bahwa beliau tidak dapat membaca menunjukkan betapa dahsyat pengalaman itu. Pelukan Jibril dan pengulangan perintah menunjukkan bahwa ini bukan rekaan manusia, melainkan firman ilahi. Kemudian turun ayat-ayat awal Surah Al-Alaq: Bacalah dengan nama Tuhanmu yang menciptakan; menciptakan manusia dari segumpal darah; mengajarkan manusia apa yang tidak diketahuinya. Ayat-ayat ini menyatukan bacaan, ilmu, penciptaan, dan hubungan dengan Tuhan.",
        "metin_ur": "جب غار حرا میں پہلی وحی آئی تو جبریل علیہ السلام نے نبی صلی اللہ علیہ وسلم سے فرمایا: پڑھو۔ یہ واقعہ صحیح بخاری کے بدء الوحي باب میں تفصیل سے مذکور ہے۔ نبی صلی اللہ علیہ وسلم کا یہ جواب کہ میں پڑھا ہوا نہیں، اس تجربے کی غیر معمولی heaviness کو ظاہر کرتا ہے۔ جبریل علیہ السلام کا زور سے تھامنا اور حکم کو دہرانا بتاتا ہے کہ یہ انسانی تصور نہیں بلکہ الٰہی خطاب تھا۔ پھر سورہ علق کی ابتدائی آیات نازل ہوئیں: اپنے رب کے نام سے پڑھ جو پیدا کرنے والا ہے، جس نے انسان کو علَق سے پیدا کیا، اور انسان کو وہ سکھایا جو وہ نہیں جانتا تھا۔ یہ آیات پڑھنے، علم، پیدائش اور رب سے نسبت کو ایک ساتھ جوڑتی ہیں۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim, Alak 96:1-5; Duhâ 93; İnşirâh 94; Müddessir 74; Müzzemmil 73"
      },
      {
        "metin": "İlk vahyin hemen ardından Resûlullah ﷺ sarsılmış bir halde evine döndü. Bu sarsıntı, zayıflık değil; büyük bir ilahi sorumluluğun insana temasının doğal etkisidir. Hatice validemiz (r.a.) onu sakinleştirdi, üzerini örttürdü ve geçmiş hayatındaki güzel huylarını hatırlatarak güven verdi: O, akrabalık bağını gözeten, zor durumda olana yardım eden, misafiri ağırlayan, doğru sözlü ve emanete sadık bir insandı. Hatice’nin bu yaklaşımı, ilk vahiy anında hem duygusal destek hem de doğru değerlendirme sundu. Peygamberlik yolunun ilk yakın şahidi ve destekçisi olarak onun rolü sîrede çok önemlidir.",
        "metin_en": "After the first revelation, the Prophet returned home shaken. This was not weakness; it was a natural human response to contact with a tremendous divine responsibility. Khadijah (may Allah be pleased with her) calmed him, covered him, and reassured him by recalling his noble qualities: he maintained family ties, helped those in hardship, hosted guests, spoke truthfully, and kept trusts. Her response offered both emotional support and sound judgment at the moment of the first revelation. Her role as the first close witness and supporter of prophethood is highly significant in the sirah.",
        "metin_ar": "بعد نزول الوحي الأول عاد النبي صلى الله عليه وسلم إلى بيته مرتاعا. ولم يكن ذلك ضعفا، بل أثرا طبيعيا لملاقاة تكليف إلهي عظيم. فطمأنته خديجة رضي الله عنها وغطته وذكرته بخصاله الكريمة: كان يصل الرحم، ويحمل الكل، ويقري الضيف، ويعين على نوائب الحق، ويصدق الحديث، ويؤدي الأمانة. وكان موقفها دعما عاطفيا وحكما رشيدا في لحظة الوحي الأولى. ولذلك كان دورها بوصفها أول شاهد قريب وداعم للنبوة عظيما في السيرة.",
        "metin_id": "Setelah wahyu pertama, Nabi pulang dalam keadaan terguncang. Ini bukan kelemahan, melainkan respons manusiawi terhadap tanggung jawab ilahi yang besar. Khadijah menenangkannya, menyelimutinya, dan meyakinkannya dengan mengingat sifat-sifat mulia beliau: menyambung keluarga, membantu orang yang kesulitan, menjamu tamu, berkata benar, dan menjaga amanah. Sikap Khadijah memberi dukungan emosional sekaligus penilaian yang tepat saat wahyu pertama. Perannya sebagai saksi dekat pertama dan pendukung kenabian sangat penting dalam sirah.",
        "metin_ur": "پہلی وحی کے فوراً بعد نبی صلی اللہ علیہ وسلم لرزتے ہوئے گھر واپس آئے۔ یہ کمزوری نہیں تھی بلکہ عظیم الٰہی ذمہ داری کے سامنے انسانی فطری کیفیت تھی۔ خدیجہ رضی اللہ عنہا نے آپ کو تسلی دی، چادر اوڑھائی اور آپ کی خوبیاں یاد دلا کر اعتماد دلایا: آپ صلہ رحمی کرتے، محتاج کی مدد کرتے، مہمان نوازی کرتے، سچ بولتے اور امانت ادا کرتے تھے۔ خدیجہ رضی اللہ عنہا کا یہ رویہ پہلی وحی کے لمحے میں جذباتی سہارا بھی تھا اور درست رائے بھی۔ نبوت کے پہلے قریب گواہ اور حامی کے طور پر ان کا کردار سیرت میں بہت اہم ہے۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim, Alak 96:1-5; Duhâ 93; İnşirâh 94; Müddessir 74; Müzzemmil 73"
      },
      {
        "metin": "Hatice validemiz olayı anlamak için amcaoğlu Varaka b. Nevfel’e danıştı. Varaka, Yahudi-Hıristiyan kutsal metin geleneği hakkında bilgi sahibi bir isim olarak anılır. O, gelen meleğin daha önce Musa’ya (a.s.) gelen elçi/namus olduğunu söyledi ve Resûlullah’ın kavmi tarafından yalanlanıp eziyet edilebileceğini belirtti. Varaka’nın bu değerlendirmesi, vahiy deneyimini boş bir hayal olarak değil, ciddi bir peygamberlik habercisi olarak ele alır. Aynı zamanda davetin kolay olmayacağını da haber vererek, ileride Mekke’de yaşanacak baskılara işaret eder. Bu görüşme, ilk vahyin ardından yaşanan şaşkınlığı anlaşılır bir çerçeveye oturtmaya yardımcı olmuştur.",
        "metin_en": "Khadijah consulted her cousin Waraqah ibn Nawfal to understand the event. Waraqah is described as knowledgeable about earlier scriptural traditions. He said that the angelic messenger who came was the same kind of messenger who came to Moses (peace be upon him), and he warned that the Prophet might be rejected and harmed by his people. Waraqah’s assessment treated the experience not as an empty imagination but as a serious sign of prophethood. At the same time, it indicated that the call would not be easy, pointing ahead to pressure in Makkah. This consultation helped place the shock of the first revelation into an understandable framework.",
        "metin_ar": "وعرضت خديجة رضي الله عنها الأمر على ابن عمها ورقة بن نوفل ليبينه. وكان ورقة ممن له علم بما سبق من أخبار الكتب. فقال إن الذي جاءه هو الناموس الذي كان يأتي موسى عليه السلام، وأن قومه سيكذبونه ويؤذونه. وقد تعامل ورقة مع الحدث بوصفه أمرا ذا شأن يتعلق بالنبوة لا مجرد تصور. كما أشار إلى أن طريق الدعوة لن يكون سهلا، وفي ذلك إشارة إلى ما سيقع من أذى بمكة. وقد ساعد هذا اللقاء على فهم ما جرى بعد أول الوحي في إطار أوضح.",
        "metin_id": "Khadijah berkonsultasi dengan sepupunya Waraqah bin Nawfal untuk memahami peristiwa itu. Waraqah dikenal memiliki pengetahuan tentang tradisi kitab sebelumnya. Ia mengatakan bahwa utusan malaikat yang datang adalah seperti yang pernah datang kepada Musa, dan memperingatkan bahwa Nabi mungkin akan didustakan serta disakiti oleh kaumnya. Penilaian Waraqah menempatkan pengalaman itu bukan sebagai khayalan kosong, tetapi sebagai tanda kenabian yang serius. Ia juga menunjukkan bahwa dakwah tidak akan mudah, mengarah pada tekanan yang kelak terjadi di Makkah. Konsultasi ini membantu memberi kerangka pemahaman setelah wahyu pertama.",
        "metin_ur": "خدیجہ رضی اللہ عنہا نے واقعے کی سمجھ کے لیے اپنے چچا زاد ورقہ بن نوفل سے مشورہ کیا۔ ورقہ کا ذکر سابق آسمانی روایات سے واقفیت رکھنے والے شخص کے طور پر آتا ہے۔ انہوں نے کہا کہ آنے والا فرشتہ وہی ناموس ہے جو موسیٰ علیہ السلام کے پاس آتا تھا، اور یہ بھی بتایا کہ آپ کی قوم آپ کو جھٹلائے گی اور اذیت دے گی۔ ورقہ کی رائے نے اس تجربے کو محض خیال نہیں بلکہ نبوت کی سنجیدہ علامت کے طور پر دیکھا۔ ساتھ ہی یہ بھی ظاہر کیا کہ دعوت آسان نہ ہوگی، جو مکہ میں آنے والے دباؤ کی طرف اشارہ تھا۔ اس مشاورت نے پہلی وحی کے بعد کی حیرانی کو سمجھنے میں مدد دی۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim, Alak 96:1-5; Duhâ 93; İnşirâh 94; Müddessir 74; Müzzemmil 73"
      },
      {
        "metin": "Vahyin bir süre kesilmesi, fetretü’l-vahy olarak bilinir. Sahih rivayetlerde bu dönemin Resûlullah ﷺ için üzüntü ve bekleyiş taşıdığı ifade edilir. Bu kesinti, vahyin Peygamber’in kendi isteğiyle ürettiği bir söz olmadığını da dolaylı biçimde gösterir; çünkü vahiy geldiğinde de bir ilahi irade vardır, kesildiğinde de. Duhâ ve İnşirâh surelerinin bu dönemin duygusal ve manevi bağlamıyla ilişkili okunması, Resûlullah’a teselli ve güç verme yönünü ortaya koyar: Rabbin seni terk etmedi, sana dar gelen göğsünü açmadı mı? Bu ayetler, peygamberlik görevindeki yalnızlık ve yük duygusuna karşı ilahi teselliyi gösterir.",
        "metin_en": "A temporary pause in revelation is known as fatrat al-wahy. Authentic reports indicate that this period brought sorrow and waiting for the Prophet. The pause also indirectly shows that revelation was not produced by his own desire; it came and paused by divine will. Surahs ad-Duha and al-Inshirah are often read in relation to the emotional and spiritual context of this period, offering consolation and strength: your Lord has not abandoned you, and did He not expand your breast? These verses show divine reassurance in the face of the burden and loneliness that can accompany prophetic responsibility.",
        "metin_ar": "يعرف انقطاع الوحي مدة بفترة الوحي. وتشير الروايات الصحيحة إلى أن هذه الفترة كانت موضع حزن وانتظار للنبي صلى الله عليه وسلم. ويدل الانقطاع أيضا على أن الوحي ليس كلاما يصدر عن هوى النبي، بل يأتي ويتوقف بإرادة إلهية. وترتبط سورة الضحى والشرح بسياق التسلية والتقوية في هذه المرحلة: ما ودعك ربك وما قلى، ألم نشرح لك صدرك. وتظهر هذه الآيات العناية الإلهية في مواجهة ثقل المسؤولية والشعور بالوحدة.",
        "metin_id": "Terhentinya wahyu untuk sementara dikenal sebagai fatrat al-wahy. Riwayat sahih menunjukkan masa ini membawa kesedihan dan penantian bagi Nabi. Jeda ini juga secara tidak langsung menunjukkan bahwa wahyu bukan hasil keinginan beliau sendiri; ia datang dan berhenti dengan kehendak ilahi. Surah Ad-Duha dan Al-Insyirah sering dibaca terkait konteks emosional dan spiritual masa ini, memberi penghiburan dan kekuatan: Tuhanmu tidak meninggalkanmu, dan bukankah Kami melapangkan dadamu? Ayat-ayat ini menunjukkan dukungan ilahi menghadapi beban dan kesendirian tanggung jawab kenabian.",
        "metin_ur": "وحی کا کچھ عرصہ رک جانا فترۃ الوحی کہلاتا ہے۔ صحیح روایات سے معلوم ہوتا ہے کہ یہ دور نبی صلی اللہ علیہ وسلم کے لیے انتظار اور رنج کا تھا۔ یہ وقفہ اس بات کی بھی طرف اشارہ کرتا ہے کہ وحی آپ کی اپنی خواہش سے پیدا شدہ کلام نہیں تھی؛ آنا اور رکنا الٰہی ارادے کے تحت تھا۔ سورہ ضحیٰ اور سورہ انشراح کو اس دور کی تسلی اور تقویت کے سیاق میں دیکھا جاتا ہے: تمہارے رب نے تمہیں نہ چھوڑا اور نہ ناراض ہوا، کیا ہم نے تمہارا سینہ کھول نہیں دیا؟ یہ آیات نبوی ذمہ داری کے بوجھ اور تنہائی کے مقابلے میں الٰہی تسلی کو ظاہر کرتی ہیں۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim, Alak 96:1-5; Duhâ 93; İnşirâh 94; Müddessir 74; Müzzemmil 73"
      },
      {
        "metin": "Vahyin yeniden başlamasıyla tebliğ görevi daha açık bir şekil aldı. Müddessir Suresi’nin ilk ayetlerinde ‘örtüsüne bürünen’ hitabından sonra ‘kalk ve uyar’ emri, tebliğin aktif sorumluluğunu gösterir. Müzzemmil Suresi’nin başlangıcı ise gece ibadeti, Kur’an’ı tertil üzere okuma ve ağır sözü taşıma bağlamında Peygamber’i hazırlayan bir zemin sunar. Bu iki sûrenin mesajı birlikte düşünüldüğünde, peygamberlik yalnızca bir manevi deneyim değil; ibadet, hazırlık, ahlaki arınma ve insanları uyarma sorumluluğudur. İlk vahiyden sonraki bu adım, bireysel sarsıntıdan topluma yönelen bir çağrıya geçiştir.",
        "metin_en": "When revelation resumed, the duty of conveying the message became clearer. The opening of Surah al-Muddaththir follows the address to the one wrapped in his cloak with the command to arise and warn, showing the active responsibility of calling others. The opening of Surah al-Muzzammil provides preparation through night worship, measured recitation of the Quran, and bearing a weighty word. Taken together, these surahs show that prophethood is not only a spiritual experience; it involves worship, preparation, moral refinement, and warning people. This step after the first revelation marks a transition from personal shock to a call directed toward society.",
        "metin_ar": "لما عاد الوحي اتضح التكليف بالتبليغ أكثر. فجاء في افتتاح سورة المدثر بعد النداء: يا أيها المدثر، قم فأنذر، وهو أمر بمباشرة مسؤولية الإنذار. وتهيئ افتتاح سورة المزمل النبي صلى الله عليه وسلم بقيام الليل وترتيل القرآن وحمل القول الثقيل. ويظهر من السورتين أن النبوة ليست تجربة وجدانية فقط، بل عبادة واستعداد وتهذيب ودعوة. وتمثل هذه المرحلة انتقالا من أثر التجربة الأولى إلى دعوة موجهة إلى الناس.",
        "metin_id": "Ketika wahyu kembali turun, tugas menyampaikan pesan menjadi lebih jelas. Pembukaan Surah Al-Muddaththir memerintahkan bangkit dan memberi peringatan, menunjukkan tanggung jawab aktif dakwah. Pembukaan Surah Al-Muzzammil memberi persiapan melalui ibadah malam, bacaan Qur’an yang tartil, dan memikul firman yang berat. Kedua surah ini menunjukkan bahwa kenabian bukan hanya pengalaman spiritual, tetapi juga ibadah, persiapan, pemurnian akhlak, dan peringatan kepada manusia. Tahap ini menandai peralihan dari guncangan pribadi menuju seruan kepada masyarakat.",
        "metin_ur": "وحی کے دوبارہ آغاز کے بعد تبلیغ کی ذمہ داری زیادہ واضح ہوئی۔ سورہ مدثر کے آغاز میں کپڑے میں لپٹنے والے کے خطاب کے بعد قم فأنذر کا حکم دعوت کی عملی ذمہ داری کو ظاہر کرتا ہے۔ سورہ مزمل کا آغاز رات کی عبادت، قرآن کی ترتیل اور بھاری قول اٹھانے کے ذریعے تیاری فراہم کرتا ہے۔ ان دونوں سورتوں سے ظاہر ہوتا ہے کہ نبوت صرف روحانی تجربہ نہیں بلکہ عبادت، تیاری، اخلاقی اصلاح اور لوگوں کو خبردار کرنے کی ذمہ داری ہے۔ پہلی وحی کے بعد یہ مرحلہ ذاتی کیفیت سے معاشرے کی طرف دعوت کی منتقلی ہے۔",
        "kaynak": "Buhârî, Sahîh (Bed’ü’l-vahy); Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim, Alak 96:1-5; Duhâ 93; İnşirâh 94; Müddessir 74; Müzzemmil 73"
      }
    ]
  },
  {
    "id": "davet",
    "ad": "Gizli Davet, İlk Müslümanlar ve Daru’l-Erkam",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "İlk iman edenler, Resûlullah ﷺ’ın kişiliğini ve güvenilirliğini yakından tanıyan insanlardı. Hatice (r.a.) ilk vahiy anında onu destekleyen eş olarak öne çıkar; Ali (r.a.) genç yaşta İslam’a yönelmiş, Zeyd b. Hârise ev halkından kabul edilen yakın bir isim olmuş, Ebû Bekir (r.a.) ise tebliğin dışa açılmasında önemli rol oynamıştır. Bu ilk kabul, yalnızca bireysel kararlar değil; Peygamber’in peygamberlik öncesi hayatındaki doğruluğunun gördüğü karşılıktır. Sîre kaynakları bu ilk çevreyi, İslam’ın çekirdeği ve güven halkası olarak anlatır. Böylece davet, bir anda kalabalığa yönelen bir çağrıdan önce, güvene dayalı yakın bir çevrede kök salmıştır.",
        "metin_en": "The first believers were people who knew the Prophet’s character and trustworthiness closely. Khadijah stands out as the spouse who supported him at the moment of revelation; Ali turned to Islam at a young age; Zayd ibn Harithah was a close member of the household; and Abu Bakr played a major role in spreading the message outward. Their acceptance was not only a set of personal decisions but also a response to the Prophet’s integrity before prophethood. Sirah sources describe this early circle as the nucleus and trusted core of Islam. The call therefore took root in a circle of trust before becoming a public message to wider society.",
        "metin_ar": "كان أول المؤمنين ممن عرفوا أخلاق النبي صلى الله عليه وسلم وأمانته عن قرب. فبرزت خديجة رضي الله عنها بدعمها عند نزول الوحي، وأسلم علي رضي الله عنه صغيرا، وكان زيد بن حارثة من أهل البيت المقربين، وكان لأبي بكر رضي الله عنه دور كبير في نشر الدعوة. ولم يكن إيمانهم مجرد قرارات فردية، بل كان أيضا ثمرة لما عرفوه من صدقه قبل البعثة. وتذكر مصادر السيرة هذه الحلقة الأولى بوصفها نواة الإسلام وحلقة الثقة فيه. فاستقرت الدعوة في محيط قريب قائم على الثقة قبل أن تتسع إلى الناس.",
        "metin_id": "Orang-orang pertama yang beriman adalah mereka yang mengenal akhlak dan amanah Nabi dari dekat. Khadijah menonjol sebagai pendukung saat wahyu turun; Ali masuk Islam di usia muda; Zayd bin Haritsah adalah bagian dekat dari rumah tangga; dan Abu Bakr berperan besar membawa dakwah ke luar. Penerimaan mereka bukan hanya keputusan pribadi, tetapi juga tanggapan atas integritas Nabi sebelum kenabian. Sumber sirah menggambarkan lingkaran awal ini sebagai inti dan jaringan kepercayaan Islam. Karena itu dakwah berakar dalam lingkungan dekat yang penuh kepercayaan sebelum menjadi seruan publik.",
        "metin_ur": "سب سے پہلے ایمان لانے والے وہ لوگ تھے جو نبی صلی اللہ علیہ وسلم کے اخلاق اور امانت کو قریب سے جانتے تھے۔ خدیجہ رضی اللہ عنہا وحی کے وقت سہارا دینے والی ساتھی کے طور پر نمایاں ہیں؛ علی رضی اللہ عنہ کم عمری میں اسلام لائے؛ زید بن حارثہ گھرانے کے قریب فرد تھے؛ اور ابو بکر رضی اللہ عنہ نے دعوت کو آگے بڑھانے میں بڑا کردار ادا کیا۔ ان کا ایمان صرف ذاتی فیصلوں کا مجموعہ نہیں تھا بلکہ نبوت سے پہلے آپ کی سچائی کا جواب تھا۔ سیرت کی کتب اس ابتدائی حلقے کو اسلام کا مرکز اور اعتماد کا دائرہ بتاتی ہیں۔ یوں دعوت وسیع عوامی پکار بننے سے پہلے اعتماد کے قریبی حلقے میں مضبوط ہوئی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Ebû Bekir (r.a.), Mekke’de saygın ve güvenilir bir tacir olarak tanındığı için davetine olumlu cevap veren erken Müslümanlar arasında etkili oldu. Sîre ve tabakât kaynakları, Osman b. Affân, Zübeyr b. Avvâm, Abdurrahman b. Avf, Sa‘d b. Ebî Vakkâs ve Talha b. Ubeydullah gibi isimlerin İslam’a girişinde onun rolünü aktarır. Bu durum, tebliğin yalnızca bir kişinin konuşmasıyla değil, güven ilişkileri ve örnek şahsiyetler üzerinden yayıldığını gösterir. Erken sahâbenin farklı sosyal konumları, İslam’ın sadece tek bir sınıfa hitap etmediğini de ortaya koyar. Böylece Mekke’nin baskıcı ortamında küçük ama sağlam bir topluluk oluşmaya başladı.",
        "metin_en": "Because Abu Bakr was known in Makkah as a respected and trustworthy merchant, he was influential among early Muslims who responded to his invitation. Sirah and tabakat sources report his role in the acceptance of Islam by figures such as Uthman ibn Affan, Zubayr ibn al-Awwam, Abdurrahman ibn Awf, Sa‘d ibn Abi Waqqas, and Talhah ibn Ubaydullah. This shows that the message spread not only through one person’s speech but also through trust relationships and exemplary individuals. The varied social positions of early Companions show that Islam addressed more than a single class. In the oppressive environment of Makkah, a small but firm community began to form.",
        "metin_ar": "كان أبو بكر رضي الله عنه معروفا في مكة بالتجارة والسمعة الحسنة والثقة، فكان له أثر في إسلام نفر من السابقين. وتذكر مصادر السيرة والطبقات دوره في إسلام عثمان بن عفان والزبير بن العوام وعبد الرحمن بن عوف وسعد بن أبي وقاص وطلحة بن عبيد الله. ويدل ذلك على أن الدعوة لم تنتشر بالكلمة المجردة فقط، بل بعلاقات الثقة والنماذج المؤثرة. كما يظهر اختلاف أوضاع السابقين أن الإسلام لم يخاطب طبقة واحدة. وهكذا بدأ يتكون في مكة مجتمع صغير لكنه ثابت رغم الضغط.",
        "metin_id": "Karena Abu Bakr dikenal di Makkah sebagai pedagang yang terhormat dan terpercaya, ia berpengaruh dalam ajakannya kepada para Muslim awal. Sumber sirah dan tabakat menyebut perannya dalam keislaman tokoh seperti Utsman bin Affan, Zubair bin Awwam, Abdurrahman bin Auf, Sa‘d bin Abi Waqqas, dan Thalhah bin Ubaidullah. Ini menunjukkan bahwa dakwah menyebar bukan hanya melalui ucapan satu orang, tetapi juga melalui relasi kepercayaan dan teladan pribadi. Posisi sosial para sahabat awal yang beragam menunjukkan bahwa Islam tidak hanya ditujukan kepada satu kelas. Di tengah tekanan Makkah, terbentuklah komunitas kecil yang kokoh.",
        "metin_ur": "ابو بکر رضی اللہ عنہ مکہ میں باوقار اور قابل اعتماد تاجر کے طور پر معروف تھے، اس لیے آپ کی دعوت سے ابتدائی مسلمانوں میں کئی افراد متاثر ہوئے۔ سیرت اور طبقات کی کتب عثمان بن عفان، زبیر بن عوام، عبدالرحمن بن عوف، سعد بن ابی وقاص اور طلحہ بن عبیداللہ کے اسلام لانے میں آپ کے کردار کا ذکر کرتی ہیں۔ یہ ظاہر کرتا ہے کہ دعوت صرف ایک شخص کی تقریر سے نہیں بلکہ اعتماد کے تعلقات اور مؤثر نمونوں سے پھیلی۔ ابتدائی صحابہ کے مختلف سماجی حالات یہ بھی بتاتے ہیں کہ اسلام ایک طبقے تک محدود نہیں تھا۔ یوں مکہ کے دباؤ میں ایک چھوٹا مگر مضبوط گروہ وجود میں آیا۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "İlk yıllarda tebliğ gizlilikle yürütüldü. Müslümanlar, Kureyş’in tepkisini çekmemek ve yeni iman edenleri korumak için Daru’l-Erkam gibi güvenli sayılan yerlerde bir araya geldi. Bu dönem, iman bilgisinin sessizce öğrenildiği, Kur’an ayetlerinin sindirildiği ve kardeşlik bağlarının kurulduğu bir hazırlık evresiydi. Gizlilik bir korkaklık değil; savunmasız insanların korunması ve davetin temelinin sağlam atılmasıydı. Böylece açık tebliğ başladığında, ortada yalnızca dağınık bireyler değil, inanç ve dayanışma ile bağlanmış bir topluluk bulunuyordu.",
        "metin_en": "In the early years, the call was carried out privately. Muslims gathered in relatively safe places such as Dar al-Arqam to avoid provoking Quraysh and to protect new believers. This period was a preparatory stage in which faith was learned quietly, Quranic verses were absorbed, and bonds of brotherhood were formed. Privacy was not cowardice; it was a way to protect vulnerable people and lay a firm foundation for the message. When public preaching began, there was not merely a scattered set of individuals but a community connected by faith and solidarity.",
        "metin_ar": "سارت الدعوة في سنواتها الأولى بصورة خاصة. وكان المسلمون يجتمعون في أماكن آمنة نسبيا مثل دار الأرقم لتجنب استفزاز قريش وحماية من أسلم حديثا. وكانت هذه المرحلة إعدادا يتعلم فيه الإيمان بهدوء، وتتدبر فيه الآيات، وتتشكل فيه روابط الأخوة. ولم تكن الخصوصية جبنا، بل حماية للمستضعفين وبناء لأساس متين للدعوة. فلما بدأ الجهر كان هناك مجتمع مترابط بالإيمان لا أفراد متفرقون فقط.",
        "metin_id": "Pada tahun-tahun awal, dakwah berjalan secara tertutup. Kaum Muslim berkumpul di tempat yang relatif aman seperti Darul Arqam untuk menghindari provokasi Quraisy dan melindungi pemeluk baru. Masa ini merupakan tahap persiapan: iman dipelajari dengan tenang, ayat-ayat Qur’an direnungkan, dan ikatan persaudaraan dibangun. Sikap tertutup ini bukan pengecut, melainkan cara melindungi orang-orang rentan dan meletakkan dasar dakwah yang kuat. Ketika dakwah terbuka dimulai, yang ada bukan sekadar individu terpisah, tetapi komunitas yang terikat iman dan solidaritas.",
        "metin_ur": "ابتدائی برسوں میں دعوت زیادہ تر پوشیدگی سے چلتی رہی۔ مسلمان قریش کے ردعمل سے بچنے اور نئے ایمان والوں کی حفاظت کے لیے دار ارقم جیسے نسبتاً محفوظ مقامات پر جمع ہوتے تھے۔ یہ دور تیاری کا تھا: ایمان خاموشی سے سیکھا گیا، قرآنی آیات کو سمجھا گیا اور بھائی چارے کے تعلقات بنے۔ یہ پوشیدگی بزدلی نہیں تھی بلکہ کمزور افراد کی حفاظت اور دعوت کی مضبوط بنیاد رکھنے کا ذریعہ تھی۔ جب کھلی دعوت شروع ہوئی تو وہاں بکھرے افراد نہیں بلکہ ایمان اور یکجہتی سے جڑا ہوا گروہ موجود تھا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Yaklaşık üç yıl süren bu ilk dönemin ardından tebliğ daha görünür hale geldi. Kur’an’da ‘emrolunduğun şeyi açıkça bildir’ anlamındaki ayetler, davetin kamusal boyutunu güçlendiren ilahi yönlendirme olarak anlaşılır. Açıklık, hem davetin genişlemesi hem de baskının artması demekti; çünkü Mekke’de putperest düzen, tevhid çağrısını yalnızca bireysel bir inanç farkı olarak görmedi. Bu çağrı, kabile otoritesini, ekonomik çıkarları ve dini alışkanlıkları sorguluyordu. Bu nedenle açık tebliğ, İslam tarihindeki ilk büyük toplumsal yüzleşmelerden biri olmuştur.",
        "metin_en": "After an early phase lasting about three years, the message became more visible. Quranic verses commanding the Prophet to proclaim openly are understood as divine guidance strengthening the public dimension of the call. Openness meant both expansion of the message and increase in pressure, because the polytheistic order in Makkah did not view monotheism as a mere private belief. The call questioned tribal authority, economic interests, and religious habits. Public preaching therefore became one of the first major social confrontations in Islamic history.",
        "metin_ar": "بعد مرحلة أولى استمرت نحو ثلاث سنوات أصبحت الدعوة أكثر ظهورا. وتفهم الآيات الآمرة بالجهر بالدعوة بوصفها توجيها إلهيا يقوي جانبها العام. وكان الجهر يعني اتساع الدعوة وزيادة الضغط معا، لأن نظام الشرك في مكة لم ير التوحيد مجرد اختلاف اعتقادي خاص. بل كانت الدعوة تمس سلطة القبيلة والمصالح الاقتصادية والعادات الدينية. لذلك كان الجهر بداية مواجهة اجتماعية كبرى في تاريخ الإسلام.",
        "metin_id": "Setelah fase awal sekitar tiga tahun, dakwah menjadi lebih terlihat. Ayat-ayat yang memerintahkan penyampaian secara terbuka dipahami sebagai petunjuk ilahi yang memperkuat dimensi publik dakwah. Keterbukaan berarti perluasan pesan sekaligus peningkatan tekanan, karena tatanan musyrik Makkah tidak melihat tauhid sebagai sekadar keyakinan pribadi. Seruan ini mempertanyakan otoritas kabilah, kepentingan ekonomi, dan kebiasaan religius. Karena itu dakwah terbuka menjadi salah satu konfrontasi sosial besar pertama dalam sejarah Islam.",
        "metin_ur": "تقریباً تین سال کے ابتدائی مرحلے کے بعد دعوت زیادہ نمایاں ہوئی۔ قرآن کی وہ آیات جو کھلم کھلا دعوت کا حکم دیتی ہیں، اس دعوت کے عوامی پہلو کو مضبوط کرنے والی الٰہی رہنمائی سمجھی جاتی ہیں۔ کھلم کھلا دعوت کا مطلب پیغام کی وسعت بھی تھا اور دباؤ میں اضافہ بھی، کیونکہ مکہ کا شرک پر مبنی نظام توحید کو محض ذاتی عقیدہ نہیں سمجھتا تھا۔ یہ دعوت قبائلی اقتدار، معاشی مفادات اور مذہبی عادات پر سوال اٹھاتی تھی۔ اس لیے کھلی تبلیغ اسلامی تاریخ کے ابتدائی بڑے سماجی تصادموں میں سے ایک بنی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an, Hicr 15:94; Şuarâ 26:214"
      },
      {
        "metin": "Bu dönemde inen ayetler, tevhidi merkeze alırken ahiret, adalet, insan onuru ve ahlaki sorumluluğu da güçlü biçimde işledi. Kur’an’ın mesajı yalnızca puta tapmayı reddetmek değildi; aynı zamanda yetimi ezmemek, ölçüde hile yapmamak, yalan şahitlikten kaçınmak ve güçlünün zayıfa hükmetmesine karşı durmak gibi ilkeleri de içeriyordu. Bu yüzden İslam daveti, Mekke’de yalnızca bir ibadet tartışması değil, insan ilişkilerini düzenleyen kapsamlı bir ahlak çağrısı olarak ortaya çıktı. Davetin ilk yıllarını anlamak için bu iki boyutu birlikte görmek gerekir: Allah’a yöneliş ve toplumda adalet.",
        "metin_en": "The verses revealed in this period centered on monotheism while strongly addressing the Hereafter, justice, human dignity, and moral responsibility. The Quranic message was not limited to rejecting idol worship; it also included principles such as not oppressing the orphan, avoiding fraud in measure, rejecting false testimony, and resisting domination of the weak by the powerful. For this reason, the Islamic call in Makkah appeared not merely as a debate about worship but as a comprehensive moral call shaping human relations. To understand the early years of the message, both dimensions must be seen together: turning to Allah and justice in society.",
        "metin_ar": "كانت الآيات النازلة في هذه المرحلة تتمحور حول التوحيد، مع تأكيد قوي على الآخرة والعدل وكرامة الإنسان والمسؤولية الأخلاقية. ولم تكن الرسالة القرآنية رفضا لعبادة الأصنام فقط، بل تضمنت مبادئ مثل عدم ظلم اليتيم، واجتناب الغش في الميزان، وترك شهادة الزور، ومقاومة تسلط القوي على الضعيف. لذلك ظهرت الدعوة الإسلامية في مكة بوصفها دعوة أخلاقية شاملة تنظّم علاقات الناس، لا مجرد نقاش في العبادة. ولا يفهم صدر الدعوة إلا برؤية البعدين معا: التوجه إلى الله والعدل في المجتمع.",
        "metin_id": "Ayat-ayat yang turun pada periode ini berpusat pada tauhid sekaligus menekankan akhirat, keadilan, martabat manusia, dan tanggung jawab moral. Pesan Al-Qur’an tidak terbatas pada penolakan penyembahan berhala; ia juga mencakup prinsip seperti tidak menzalimi anak yatim, menghindari kecurangan dalam takaran, menjauhi kesaksian palsu, dan menolak penindasan orang lemah oleh yang kuat. Karena itu dakwah Islam di Makkah muncul bukan sekadar perdebatan ibadah, tetapi sebagai seruan moral menyeluruh yang mengatur hubungan antarmanusia. Memahami tahun-tahun awal dakwah berarti melihat dua dimensi ini bersama-sama: berpaling kepada Allah dan keadilan dalam masyarakat.",
        "metin_ur": "اس دور میں نازل ہونے والی آیات کا مرکز توحید تھا، ساتھ ہی آخرت، عدل، انسانی عزت اور اخلاقی ذمہ داری کو بھی مضبوطی سے بیان کیا گیا۔ قرآنی پیغام صرف بت پرستی کے انکار تک محدود نہیں تھا بلکہ یتیم پر ظلم نہ کرنے، ناپ تول میں خیانت سے بچنے، جھوٹی گواہی سے اجتناب کرنے اور طاقتور کے کمزور پر غلبے کے خلاف کھڑے ہونے جیسے اصول بھی دیتا تھا۔ اس لیے مکہ میں اسلامی دعوت محض عبادت کی بحث نہیں بلکہ انسانی تعلقات کو سنوارنے والی جامع اخلاقی دعوت کے طور پر سامنے آئی۔ ابتدائی دعوت کو سمجھنے کے لیے دونوں پہلو ایک ساتھ دیکھنے ضروری ہیں: اللہ کی طرف رجوع اور معاشرے میں عدل۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      }
    ]
  },
  {
    "id": "eziyet",
    "ad": "Açık Tebliğ, Baskı ve Habeşistan Hicretleri",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "Mekke’de tebliğ açık hâle gelince Kureyş’in tepkisi yalnızca fikrî bir tartışma olarak kalmadı. Putlara tapınan düzenin temsilcileri, tevhid çağrısının siyasi, ekonomik ve sosyal sonuçlarından rahatsız oldu. Bu yüzden alay, iftira, tehdit, baskı ve ayrımcılık gibi yöntemlere başvuruldu. Bazı Müslümanlar kabile koruması sayesinde daha az hedef olurken, köleler, yoksullar ve kabilesizler ağır zulme maruz kaldı. Bu dönem, imanın bir sözden ibaret olmadığını; kişi için baskı, yalnızlık ve maddi kayıp anlamına gelebileceğini gösterdi. Buna rağmen ilk Müslümanların bir kısmı, gördükleri baskıya rağmen inancını korudu.",
        "metin_en": "When the call became public in Makkah, Quraysh’s response did not remain an intellectual disagreement. Representatives of the idolatrous order were disturbed by the political, economic, and social implications of the call to monotheism. They resorted to ridicule, slander, threats, pressure, and discrimination. Some Muslims were less exposed because of clan protection, while slaves, the poor, and those without tribal support faced severe persecution. This period showed that faith was not merely a statement; it could mean pressure, isolation, and material loss. Yet many early Muslims held to their belief despite the harm they faced.",
        "metin_ar": "لما جُهرت الدعوة في مكة لم تبق معارضة قريش في حدود النقاش الفكري. فقد انزعج ممثلو نظام الشرك من آثار دعوة التوحيد السياسية والاقتصادية والاجتماعية. فلجؤوا إلى السخرية والافتراء والتهديد والضغط والتمييز. وكان بعض المسلمين أقل استهدافا بسبب الحماية القبلية، بينما تعرض العبيد والفقراء ومن لا عصبة لهم لأذى شديد. وأظهرت هذه المرحلة أن الإيمان ليس كلمة فقط، بل قد يعني ضيقا ووحدة وخسارة مادية. ومع ذلك ثبت كثير من أوائل المسلمين على إيمانهم.",
        "metin_id": "Ketika dakwah menjadi terbuka di Makkah, respons Quraisy tidak tinggal pada perbedaan pendapat. Para pemegang tatanan musyrik merasa terganggu oleh implikasi politik, ekonomi, dan sosial dari seruan tauhid. Mereka menggunakan ejekan, fitnah, ancaman, tekanan, dan diskriminasi. Sebagian Muslim lebih terlindungi karena kabilah, sementara budak, orang miskin, dan yang tanpa perlindungan kabilah menghadapi penganiayaan berat. Masa ini menunjukkan bahwa iman bukan sekadar ucapan; ia bisa berarti tekanan, keterasingan, dan kerugian materi. Namun banyak Muslim awal tetap teguh.",
        "metin_ur": "جب مکہ میں دعوت کھل کر سامنے آئی تو قریش کا ردعمل محض فکری اختلاف تک محدود نہ رہا۔ شرک پر قائم نظام کے نمائندے توحید کی دعوت کے سیاسی، معاشی اور سماجی اثرات سے پریشان ہوئے۔ اس لیے مذاق، بہتان، دھمکی، دباؤ اور امتیازی سلوک اختیار کیا گیا۔ بعض مسلمانوں کو قبائلی حفاظت کی وجہ سے کم نشانہ بنایا گیا، مگر غلاموں، غریبوں اور بے سہارا لوگوں نے سخت ظلم برداشت کیا۔ اس دور نے دکھایا کہ ایمان صرف ایک بات نہیں بلکہ دباؤ، تنہائی اور مالی نقصان کا سبب بن سکتا ہے۔ پھر بھی بہت سے ابتدائی مسلمان ثابت قدم رہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mekke’de eziyet görenler arasında Bilâl-i Habeşî (r.a.) özel bir yer tutar. Kabile koruması olmayan bir köle olduğu için baskı ona daha ağır biçimde yöneltildi. Rivayetlerde, imandan vazgeçmesi istendiğinde tevhidi bırakmadığı ve sabırla direndiği aktarılır. Bilâl’in bu direnişi, İslam tarihindeki ilk büyük sabır örneklerinden biri sayılır. Daha sonra özgürlüğüne kavuşması ve Medine’de ezanla özdeşleşmesi, onun hayatında hem acının hem de onurun iz bıraktığını gösterir. Bu kıssa, imanın kişinin toplumsal konumundan daha güçlü bir değer hâline gelebileceğini anlatır.",
        "metin_en": "Among those persecuted in Makkah, Bilal ibn Rabah holds a special place. As a slave without clan protection, he was targeted with especially harsh pressure. Reports state that he refused to abandon monotheism when forced to recant and remained steadfast. Bilal’s endurance is counted among the early examples of patience in Islamic history. His later freedom and association with the adhan in Madinah show that both suffering and honor left marks on his life. His story teaches that faith can become stronger than a person’s social status.",
        "metin_ar": "ويحتل بلال بن رباح رضي الله عنه مكانة خاصة بين من أوذي في مكة. ولأنه كان مملوكا بلا حماية قبلية فقد اشتد عليه الأذى. وتذكر الروايات أنه لم يترك التوحيد عندما أُرغم على الرجوع وصبر وثبت. ويعد صبره من أمثلة الثبات الأولى في تاريخ الإسلام. ثم كان عتقه وارتباطه بالأذان في المدينة دلالة على أن الألم والكرامة اجتمعا في سيرته. وتعلم قصته أن الإيمان قد يكون أعظم من المكانة الاجتماعية.",
        "metin_id": "Di antara mereka yang dianiaya di Makkah, Bilal bin Rabah memiliki tempat khusus. Sebagai budak tanpa perlindungan kabilah, ia menjadi sasaran tekanan yang sangat berat. Riwayat menyebut ia menolak meninggalkan tauhid ketika dipaksa dan tetap sabar. Keteguhan Bilal termasuk contoh kesabaran awal dalam sejarah Islam. Pembebasannya kemudian dan kaitannya dengan azan di Madinah menunjukkan bahwa penderitaan dan kehormatan sama-sama hadir dalam hidupnya. Kisahnya mengajarkan bahwa iman dapat lebih kuat daripada status sosial.",
        "metin_ur": "مکہ میں اذیت پانے والوں میں بلال بن رباح رضی اللہ عنہ کا خاص مقام ہے۔ قبائلی حفاظت نہ ہونے کی وجہ سے آپ پر سخت دباؤ ڈالا گیا۔ روایات میں آتا ہے کہ ایمان چھوڑنے کے لیے مجبور کیے جانے پر بھی آپ توحید پر قائم رہے۔ بلال رضی اللہ عنہ کا صبر اسلامی تاریخ کی ابتدائی مثالوں میں شمار ہوتا ہے۔ بعد میں آزادی اور مدینہ میں اذان سے وابستگی آپ کی زندگی میں تکلیف اور عزت دونوں کو ظاہر کرتی ہے۔ یہ واقعہ سکھاتا ہے کہ ایمان سماجی حیثیت سے زیادہ مضبوط قدر بن سکتا ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Ammâr b. Yâsir’in ailesi de Mekke’deki baskının ağır örneklerindendir. Babası Yâsir, annesi Sümeyye ve kendisi, imanları nedeniyle işkenceye maruz kaldı. Sümeyye (r.a.), bu baskı karşısında imanından dönmediği için şehadetle anılan ilk isimlerdendir. Bu olay, erken Müslümanların karşılaştığı tehlikenin ciddiyetini gösterir; mesele yalnızca sosyal dışlanma değil, can güvenliğinin tehdit edilmesiydi. Resûlullah ﷺ’ın bu aileye sabır telkin ettiği rivayet edilir; bu da zulmü hemen ortadan kaldıramayan bir durumda bile manevi dayanışmanın önemini gösterir.",
        "metin_en": "The family of Ammar ibn Yasir is also among the severe examples of persecution in Makkah. Ammar, his father Yasir, and his mother Sumayyah were harmed because of their faith. Sumayyah is remembered among the earliest to be martyred for refusing to abandon belief. This shows the seriousness of danger faced by early Muslims; the issue was not only social exclusion but threats to life. The Prophet is reported to have encouraged this family to patience, showing the importance of moral support even when oppression could not be removed immediately.",
        "metin_ar": "وكان آل عمار بن ياسر من أشد أمثلة الأذى في مكة. فقد أوذي عمار وأبوه ياسر وأمه سمية بسبب إيمانهم. وتذكر سمية رضي الله عنها ممن ثبتت حتى الاستشهاد. ويدل ذلك على خطورة ما واجهه أوائل المسلمين، فلم يكن الأمر مقاطعة اجتماعية فقط بل تهديدا للحياة. وتذكر الروايات أن النبي صلى الله عليه وسلم كان يصبرهم، وفي ذلك بيان لأهمية المواساة عندما لا يرفع الظلم فورا.",
        "metin_id": "Keluarga Ammar bin Yasir juga termasuk contoh berat penganiayaan di Makkah. Ammar, ayahnya Yasir, dan ibunya Sumayyah disakiti karena iman mereka. Sumayyah dikenang sebagai salah satu yang tetap teguh hingga wafat syahid. Ini menunjukkan seriusnya bahaya yang dihadapi Muslim awal; bukan hanya pengucilan sosial, tetapi ancaman terhadap keselamatan jiwa. Nabi diriwayatkan menasihati keluarga ini untuk sabar, menunjukkan pentingnya dukungan moral ketika kezaliman belum dapat dihilangkan segera.",
        "metin_ur": "عمار بن یاسر کا خاندان بھی مکہ کے ظلم کی سخت مثالوں میں ہے۔ عمار، ان کے والد یاسر اور والدہ سمیہ کو ایمان کی وجہ سے اذیت دی گئی۔ سمیہ رضی اللہ عنہا ایمان پر قائم رہنے کے سبب شہادت سے یاد کی جاتی ہیں۔ یہ واقعہ ابتدائی مسلمانوں کے سامنے موجود خطرے کی شدت دکھاتا ہے؛ مسئلہ صرف سماجی بائیکاٹ نہیں بلکہ جان کا خطرہ بھی تھا۔ روایات میں آتا ہے کہ نبی ﷺ نے اس خاندان کو صبر کی تلقین کی، جو اس بات کو ظاہر کرتا ہے کہ ظلم فوراً ختم نہ ہو سکے تب بھی اخلاقی سہارا اہم ہوتا ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Ebû Bekir (r.a.), Mekke’de eziyet edilen bazı Müslümanlara yardım etmiş, özellikle köle ve zayıf konumdaki iman sahiplerinin özgürlüğe kavuşmasına katkı sunduğu rivayet edilir. Bilâl’in satın alınıp azat edilmesi bu bağlamda sıkça anılır. Bu davranış, erken İslam toplumunda imanın yalnızca bireysel bir iç deneyim olmadığını; dayanışma, fedakârlık ve mazlumun yanında durma sorumluluğu doğurduğunu gösterir. Kureyş baskıyı artırırken, Müslümanlar arasında da birbirinin yükünü hafifletme bilinci oluşuyordu. Böylece zulüm dönemi, aynı zamanda kardeşlik ve paylaşma ahlakının da görünür olduğu bir dönem oldu.",
        "metin_en": "Abu Bakr is reported to have helped some Muslims persecuted in Makkah, especially believers who were enslaved or socially vulnerable, contributing to their freedom. The freeing of Bilal is often mentioned in this context. This shows that in the early Muslim community, faith was not only an inward experience; it created responsibility for solidarity, sacrifice, and standing with the oppressed. While Quraysh increased pressure, Muslims developed a consciousness of easing one another’s burdens. The period of persecution thus also became a period in which brotherhood and generosity were made visible.",
        "metin_ar": "تذكر الروايات أن أبا بكر رضي الله عنه أعان بعض المسلمين الذين أوذوا في مكة، ولا سيما المستضعفين والمملوكين منهم، وساهم في تحرير بعضهم. ويذكر في هذا السياق عتق بلال رضي الله عنه. ويدل ذلك على أن الإيمان في المجتمع الإسلامي الأول لم يكن تجربة داخلية فردية فقط، بل ترتب عليه واجب التضامن والتضحية ونصرة المظلوم. وبينما اشتد ضغط قريش كان المسلمون يتعلمون تخفيف الأعباء عن بعضهم. فكانت مرحلة الأذى أيضا مرحلة ظهور الأخوة والعطاء.",
        "metin_id": "Abu Bakar diriwayatkan membantu sebagian Muslim yang dianiaya di Makkah, terutama orang beriman yang diperbudak atau lemah secara sosial, dan turut membantu pembebasan mereka. Pembebasan Bilal sering disebut dalam konteks ini. Ini menunjukkan bahwa dalam komunitas Muslim awal, iman bukan hanya pengalaman batin pribadi; ia melahirkan tanggung jawab solidaritas, pengorbanan, dan membela yang tertindas. Saat Quraisy meningkatkan tekanan, kaum Muslim menumbuhkan kesadaran untuk saling meringankan beban. Masa penganiayaan juga menjadi masa tampaknya persaudaraan dan kedermawanan.",
        "metin_ur": "ابو بکر رضی اللہ عنہ کے بارے میں روایات ملتی ہیں کہ انہوں نے مکہ میں ستائے گئے بعض مسلمانوں کی مدد کی، خاص طور پر کمزور اور غلام ایمان والوں کی آزادی میں حصہ لیا۔ بلال رضی اللہ عنہ کی آزادی اسی ضمن میں ذکر ہوتی ہے۔ یہ ظاہر کرتا ہے کہ ابتدائی مسلم معاشرے میں ایمان صرف داخلی کیفیت نہیں تھا بلکہ ہمدردی، قربانی اور مظلوم کے ساتھ کھڑے ہونے کی ذمہ داری پیدا کرتا تھا۔ قریش کا دباؤ بڑھ رہا تھا، مگر مسلمانوں میں ایک دوسرے کا بوجھ ہلکا کرنے کا شعور بھی بڑھ رہا تھا۔ یوں ظلم کا دور بھائی چارے اور ایثار کے ظہور کا دور بھی بنا۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mekke’de baskılar arttıkça Habeşistan’a hicret gündeme geldi. Habeşistan, adil bir hükümdarın bulunduğu ülke olarak biliniyordu; bu nedenle Müslümanlar ibadetlerini daha güvenli bir ortamda yaşayabilmek için oraya yöneldi. Habeşistan hicretleri, İslam tarihinin ilk hicret tecrübesidir ve inancı korumak için coğrafi bir değişikliğin göze alınabildiğini gösterir. Bu hicret, kaçıştan ibaret değildi; aynı zamanda zulüm karşısında bir korunma stratejisiydi. Müslümanlar, imanlarını bırakmakla baskı altında kalmak arasında sıkıştırılınca, dinlerini yaşama imkânı bulabilecekleri bir yol aradılar.",
        "metin_en": "As pressure increased in Makkah, migration to Abyssinia became an option. Abyssinia was known for a just ruler, so Muslims turned there seeking a safer place to practice their faith. The migrations to Abyssinia were the first migration experiences in Islamic history and showed that believers could consider a change of place to preserve their faith. This migration was not merely escape; it was also a strategy of protection against oppression. When Muslims were pressed between abandoning faith and remaining under persecution, they sought a path where they could live their religion.",
        "metin_ar": "لما اشتد الأذى في مكة طُرحت الهجرة إلى الحبشة. وكانت الحبشة تعرف بملك عادل، فتوجه إليها المسلمون طلبا لمكان أأمن يعبدون الله فيه. وكانت هجرتا الحبشة أول تجربة هجرة في تاريخ الإسلام، ودلت على أن حفظ الدين قد يقتضي الانتقال من مكان إلى آخر. ولم تكن الهجرة فرارا مجردا، بل كانت تدبيرا للحماية من الظلم. فعندما ضيق على المسلمين بين ترك الإيمان والبقاء تحت الأذى بحثوا عن سبيل يعيشون فيه دينهم.",
        "metin_id": "Ketika tekanan meningkat di Makkah, hijrah ke Habasyah menjadi pilihan. Habasyah dikenal memiliki penguasa yang adil, sehingga kaum Muslim pergi ke sana mencari tempat yang lebih aman untuk beribadah. Hijrah ke Habasyah adalah pengalaman hijrah pertama dalam sejarah Islam dan menunjukkan bahwa menjaga iman dapat menuntut perpindahan tempat. Hijrah ini bukan sekadar pelarian; ia juga strategi perlindungan dari penindasan. Ketika kaum Muslim terdesak antara meninggalkan iman dan tetap dalam penganiayaan, mereka mencari jalan untuk tetap menjalankan agama.",
        "metin_ur": "مکہ میں دباؤ بڑھنے پر حبشہ کی ہجرت سامنے آئی۔ حبشہ ایک منصف حکمران کے ملک کے طور پر جانا جاتا تھا، اس لیے مسلمان زیادہ محفوظ ماحول میں عبادت کی غرض سے وہاں گئے۔ حبشہ کی ہجرتیں اسلامی تاریخ کا پہلا ہجرتی تجربہ ہیں اور بتاتی ہیں کہ ایمان کی حفاظت کے لیے جگہ بدلنا بھی اختیار کیا جا سکتا ہے۔ یہ محض فرار نہیں تھا بلکہ ظلم کے مقابلے میں تحفظ کی حکمت عملی تھی۔ جب مسلمانوں کو ایمان چھوڑنے یا ظلم سہنے کے درمیان گھیر دیا گیا تو انہوں نے ایسا راستہ تلاش کیا جہاں وہ اپنا دین ادا کر سکیں۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Habeşistan’da Necâşî’nin huzurunda yaşananlar, Müslümanların inançlarını savunma biçimi açısından önemlidir. Kureyş temsilcileri, hicret edenleri geri almak için baskı kurmaya çalıştı. Buna karşı Müslümanlar, özellikle Ca‘fer b. Ebî Tâlib’in diliyle, cahiliye dönemindeki ahlaksızlıklardan nasıl çıkıp tevhid, namaz, ahlak ve adalete yöneldiklerini anlattı. Bu savunma, İslam’ın özünü kısa ve açık bir dille ifade etmesi bakımından dikkat çekicidir. Necâşî’nin adaletli tutumu ve Müslümanlara koruma sağlaması, zulmün her yerde aynı karşılığı bulmadığını gösterdi. Böylece Habeşistan hicreti, dışarıda bir güvenlik kapısı olduğu kadar İslam’ın ilk uluslararası tanıtım sahnelerinden biri oldu.",
        "metin_en": "Events in Abyssinia before the Negus are important for understanding how Muslims defended their faith. Quraysh representatives tried to pressure for the return of the migrants. In response, Muslims—especially through Ja‘far ibn Abi Talib—explained how they had moved away from pre-Islamic wrongdoing toward monotheism, prayer, moral conduct, and justice. This defense is notable for expressing the essence of Islam clearly and briefly. The Negus’s just stance and protection of the Muslims showed that oppression did not meet the same response everywhere. The Abyssinian migration thus became not only a door to safety but also one of the first international presentations of Islam.",
        "metin_ar": "وكان ما جرى في الحبشة أمام النجاشي مهما في بيان أسلوب المسلمين في الدفاع عن عقيدتهم. فقد حاول وفد قريش الضغط لاسترجاع المهاجرين. فشرح المسلمون، ولا سيما جعفر بن أبي طالب، كيف انتقلوا من أخلاق الجاهلية إلى التوحيد والصلاة ومكارم الأخلاق والعدل. ويتميز هذا الدفاع بإيجازه ووضوحه في عرض جوهر الإسلام. وأظهر موقف النجاشي العادل وحمايته للمسلمين أن الظلم لا يجد القبول نفسه في كل مكان. فكانت هجرة الحبشة باب أمان، ومشهدا مبكرا من مشاهد عرض الإسلام خارج مكة.",
        "metin_id": "Peristiwa di Habasyah di hadapan Najasyi penting untuk memahami cara kaum Muslim membela keyakinannya. Utusan Quraisy berusaha menekan agar para muhajir dikembalikan. Kaum Muslim, terutama melalui Ja‘far bin Abi Thalib, menjelaskan bagaimana mereka berpaling dari kebiasaan Jahiliah menuju tauhid, salat, akhlak mulia, dan keadilan. Pembelaan ini menonjol karena menyampaikan inti Islam secara ringkas dan jelas. Sikap adil Najasyi dan perlindungannya kepada kaum Muslim menunjukkan bahwa kezaliman tidak selalu mendapat sambutan yang sama. Hijrah Habasyah menjadi pintu keamanan sekaligus salah satu presentasi Islam pertama di tingkat internasional.",
        "metin_ur": "نجاشی کے دربار میں حبشہ کے واقعات مسلمانوں کے اپنے عقیدے کے دفاع کے طریقے کو سمجھنے کے لیے اہم ہیں۔ قریش کے نمائندوں نے مہاجرین کو واپس لینے کے لیے دباؤ ڈالا۔ مسلمانوں نے خصوصاً جعفر بن ابی طالب کی زبان سے بیان کیا کہ وہ جاہلیت کی برائیوں سے نکل کر توحید، نماز، اخلاق اور عدل کی طرف آئے ہیں۔ یہ دفاع اس لیے اہم ہے کہ اس میں اسلام کی اصل بات مختصر اور واضح انداز میں بیان ہوئی۔ نجاشی کا منصفانہ رویہ اور مسلمانوں کو پناہ دینا ظاہر کرتا ہے کہ ظلم کو ہر جگہ ایک جیسا جواب نہیں ملتا۔ یوں حبشہ کی ہجرت تحفظ کا دروازہ بھی بنی اور اسلام کی ابتدائی بین الاقوامی پیشکش کا منظر بھی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "boykot",
    "ad": "Boykot, Hüzün Yılı ve Tâif",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "Kureyş, İslam davetinin yayılmasını durdurmak için Hâşimoğulları ve Muttaliboğulları’na karşı sosyal ve ekonomik boykot kararı aldı. Bu boykot, evlilik ilişkilerini, alışverişi ve gündelik teması sınırlamayı hedefliyordu. Müslümanlar ve onları koruyan yakınları Şi‘b-i Ebî Tâlib denilen bölgede sıkışmış bir hayat yaşamak zorunda kaldı. Rivayetlerde bu dönemde yiyecek sıkıntısının arttığı, çocukların açlık çektiği ve baskının yalnızca bireysel değil toplumsal bir kuşatma biçimi aldığı aktarılır. Boykot, tebliğin bedelinin sadece sözle değil, günlük yaşamın bütün alanlarında ödendiğini gösterir.",
        "metin_en": "To stop the spread of Islam, Quraysh imposed a social and economic boycott against Banu Hashim and Banu Muttalib. The boycott aimed to restrict marriage ties, trade, and daily contact. Muslims and relatives who protected them were forced into a confined life in the area known as Shi‘b Abi Talib. Reports describe increasing shortages of food, hunger among children, and pressure that became a social siege rather than only individual harm. The boycott shows that the cost of the message was paid not only in words but across every part of daily life.",
        "metin_ar": "فرضت قريش حصارا اجتماعيا واقتصاديا على بني هاشم وبني المطلب لإيقاف انتشار الإسلام. وكان الحصار يهدف إلى تضييق الزواج والتجارة والاختلاط اليومي. واضطر المسلمون ومن ناصرهم من أقاربهم إلى حياة ضيقة في شعب أبي طالب. وتذكر الروايات شدة الحاجة إلى الطعام وجوع الأطفال، وأن الضغط صار حصارا اجتماعيا لا أذى فرديا فقط. ويبين الحصار أن ثمن الدعوة كان يدفع في تفاصيل الحياة اليومية لا في الكلام وحده.",
        "metin_id": "Untuk menghentikan penyebaran Islam, Quraisy memberlakukan boikot sosial dan ekonomi terhadap Bani Hasyim dan Bani Muthalib. Boikot ini bertujuan membatasi pernikahan, perdagangan, dan kontak sehari-hari. Kaum Muslim dan kerabat yang melindungi mereka terpaksa hidup terhimpit di Syi‘b Abi Thalib. Riwayat menyebut meningkatnya kekurangan makanan, kelaparan anak-anak, dan tekanan yang berubah menjadi pengepungan sosial, bukan hanya gangguan individu. Boikot menunjukkan bahwa harga dakwah dibayar dalam seluruh aspek kehidupan sehari-hari.",
        "metin_ur": "اسلام کی اشاعت روکنے کے لیے قریش نے بنو ہاشم اور بنو مطلب کے خلاف سماجی و معاشی بائیکاٹ نافذ کیا۔ اس کا مقصد شادی بیاہ، خرید و فروخت اور روزمرہ رابطوں کو محدود کرنا تھا۔ مسلمان اور ان کی حمایت کرنے والے رشتہ دار شعب ابی طالب میں تنگ زندگی گزارنے پر مجبور ہوئے۔ روایات میں خوراک کی کمی، بچوں کی بھوک اور ایسے دباؤ کا ذکر ہے جو صرف انفرادی اذیت نہیں بلکہ سماجی محاصرہ بن گیا تھا۔ یہ بائیکاٹ دکھاتا ہے کہ دعوت کی قیمت صرف گفتگو میں نہیں بلکہ روزمرہ زندگی کے ہر پہلو میں ادا کی گئی۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Taberî, Târîh; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Boykot yılları, Resûlullah ﷺ ve yakın çevresi için büyük sabır imtihanıydı. Ebû Tâlib, Müslüman olmadığı halde kabile onuru ve akrabalık sorumluluğu sebebiyle yeğenini korumayı sürdürdü. Bu durum, Mekke toplumunda herkesin aynı nedenle saf tutmadığını da gösterir: bazıları inançtan, bazıları kabile bağına sadakatten hareket ediyordu. Boykotun hedefi Peygamber’i yalnız bırakmaktı; ancak bu süreç, iman edenlerle onu koruyan aile çevresi arasındaki dayanışmayı da görünür kıldı. Uzun vadede baskı, daveti yok etmedi; aksine adaletsizliğin çirkin yüzünü daha açık gösterdi.",
        "metin_en": "The boycott years were a major test of patience for the Prophet and those close to him. Abu Talib, though not a Muslim, continued to protect his nephew out of clan honor and family responsibility. This also shows that not everyone in Makkah acted for the same reason: some moved by faith, others by loyalty to kinship. The boycott aimed to isolate the Prophet, but it also made visible the solidarity between believers and the family circle protecting him. In the long term, pressure did not erase the call; it exposed the ugliness of injustice more clearly.",
        "metin_ar": "كانت سنوات الحصار ابتلاء عظيما في الصبر للنبي صلى الله عليه وسلم ومن حوله. واستمر أبو طالب في حماية ابن أخيه بدافع المروءة والقرابة وإن لم يكن مسلما. ويدل ذلك على أن مواقف أهل مكة لم تكن بدافع واحد: فبعضهم تحرك بالإيمان وبعضهم بالالتزام القرابي. وقد هدف الحصار إلى عزل النبي صلى الله عليه وسلم، لكنه أظهر أيضا تضامن المؤمنين ومن يحميهم من أهله. وعلى المدى البعيد لم يمح الضغط الدعوة، بل كشف قبح الظلم أكثر.",
        "metin_id": "Tahun-tahun boikot adalah ujian kesabaran besar bagi Nabi dan orang-orang dekatnya. Abu Thalib, meski bukan Muslim, terus melindungi keponakannya karena kehormatan kabilah dan tanggung jawab keluarga. Ini juga menunjukkan bahwa tidak semua orang di Makkah bertindak dengan alasan yang sama: sebagian karena iman, sebagian karena loyalitas kekerabatan. Boikot bertujuan mengisolasi Nabi, tetapi juga memperlihatkan solidaritas antara orang beriman dan keluarga yang melindunginya. Dalam jangka panjang, tekanan tidak menghapus dakwah; ia justru menyingkap keburukan kezaliman.",
        "metin_ur": "بائیکاٹ کے سال نبی صلی اللہ علیہ وسلم اور آپ کے قریبی لوگوں کے لیے صبر کی بڑی آزمائش تھے۔ ابو طالب اگرچہ مسلمان نہ تھے مگر قبائلی غیرت اور رشتہ داری کی وجہ سے اپنے بھتیجے کی حفاظت کرتے رہے۔ اس سے یہ بھی ظاہر ہوتا ہے کہ مکہ میں سب ایک ہی وجہ سے حرکت نہیں کر رہے تھے: کچھ ایمان کی بنا پر اور کچھ رشتہ داری کی وفاداری سے۔ بائیکاٹ کا مقصد نبی ﷺ کو تنہا کرنا تھا، مگر اس نے ایمان والوں اور حفاظت کرنے والے خاندان کے درمیان یکجہتی کو بھی نمایاں کیا۔ طویل مدت میں دباؤ دعوت کو ختم نہ کر سکا بلکہ ظلم کی بدصورتی کو مزید واضح کر گیا۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Boykotun sona ermesi, Mekkeli bazı kişilerin bu adaletsizliğe karşı vicdani tepki göstermesiyle ilişkilendirilir. Sîre kaynakları, boykot metninin asıldığı belgeyle ilgili anlatımlar aktarır; ayrıntılar rivayetlerde farklılık gösterebilir. Kesin olan husus, boykotun kaldırılmasıyla birlikte Müslümanların Mekke içinde yeniden hareket alanı bulması, fakat temel düşmanlığın tamamen bitmemesidir. Kureyş, İslam’ın sosyal etkisinden rahatsız olmaya devam etti. Bu yüzden boykot sonrası dönem bir rahatlama sağlasa da, asıl kırılma henüz gerçekleşmemişti ve davet zor bir zeminde sürüyordu.",
        "metin_en": "The end of the boycott is associated with moral objection by some people in Makkah to its injustice. Sirah sources transmit accounts about the document on which the boycott was written; details may vary across reports. What is clear is that lifting the boycott gave Muslims more room to move within Makkah, but it did not fully end hostility. Quraysh remained uneasy about Islam’s social influence. The post-boycott period brought some relief, yet the decisive turning point had not arrived and the call continued on difficult ground.",
        "metin_ar": "يرتبط انتهاء الحصار باعتراض بعض أهل مكة على ظلمه. وتنقل مصادر السيرة روايات حول الصحيفة التي كتبت فيها المقاطعة، وقد تختلف تفاصيلها. والثابت أن رفع الحصار أتاح للمسلمين حركة أوسع في مكة، لكنه لم ينهي العداء كله. فقد بقيت قريش منزعجة من أثر الإسلام الاجتماعي. لذلك كانت المرحلة بعد الحصار انفراجا نسبيا، لكن التحول الحاسم لم يقع بعد واستمرت الدعوة في ظروف صعبة.",
        "metin_id": "Berakhirnya boikot dikaitkan dengan keberatan moral sebagian orang Makkah terhadap ketidakadilannya. Sumber sirah menyampaikan riwayat tentang dokumen boikot; rinciannya dapat berbeda antar laporan. Yang jelas, pencabutan boikot memberi ruang gerak lebih bagi Muslim di Makkah, tetapi tidak sepenuhnya mengakhiri permusuhan. Quraisy tetap resah terhadap pengaruh sosial Islam. Masa setelah boikot membawa sedikit kelonggaran, namun titik balik penentu belum datang dan dakwah tetap berjalan di medan sulit.",
        "metin_ur": "بائیکاٹ کا ختم ہونا مکہ کے بعض لوگوں کی اس ناانصافی پر اخلاقی اعتراض سے جوڑا جاتا ہے۔ سیرت کی کتب میں بائیکاٹ کے تحریری معاہدے سے متعلق روایات ملتی ہیں جن کی تفصیلات مختلف ہو سکتی ہیں۔ واضح بات یہ ہے کہ بائیکاٹ ختم ہونے سے مسلمانوں کو مکہ میں کچھ حرکت کی گنجائش ملی، مگر بنیادی دشمنی مکمل ختم نہ ہوئی۔ قریش اسلام کے سماجی اثر سے پریشان رہی۔ اس لیے بائیکاٹ کے بعد کچھ آسانی آئی، لیکن فیصلہ کن موڑ ابھی نہیں آیا تھا اور دعوت مشکل حالات میں جاری رہی۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hüzün Yılı, boykotun ardından gelen ve Resûlullah ﷺ’ın en yakın destekçilerinden ikisini kaybettiği ağır bir dönemdir. Önce Ebû Tâlib vefat etti; onun kabile içindeki koruması, özellikle dış baskılara karşı bir kalkan işlevi görüyordu. Ardından Hatice (r.a.) vefat etti; o, ilk vahiyden beri evde güven, teselli ve maddi-manevi destek sunmuştu. Bu iki kayıp, aynı yıl içinde gerçekleştiği için sîrede ‘âmü’l-huzn’ diye anılır. Peygamber’in görevi sona ermedi, fakat bu dönemde kişisel yalnızlığı ve dış baskısı daha görünür hale geldi. Bu da Tâif yolculuğu gibi yeni arayışların zeminini oluşturdu.",
        "metin_en": "The Year of Sorrow followed the boycott and brought the loss of two of the Prophet’s closest supporters. Abu Talib died first; his protection within the clan had served as a shield against external pressure. Then Khadijah passed away; from the first revelation onward she had provided reassurance, comfort, and material and emotional support at home. Because these losses occurred close together, the year is known in sirah as the Year of Sorrow. The Prophet’s mission did not end, but his personal loneliness and external pressure became more visible. This set the stage for new efforts, including the journey to Ta’if.",
        "metin_ar": "جاء عام الحزن بعد الحصار ففقد فيه النبي صلى الله عليه وسلم اثنين من أقرب الداعمين له. فقد توفي أبو طالب أولا، وكانت حمايته داخل القبيلة بمثابة درع أمام الضغط الخارجي. ثم توفيت خديجة رضي الله عنها، وكانت منذ أول الوحي مصدر سكينة ودعم نفسي ومادي في البيت. ولوقوع هذين الفقدين متقاربين سمي العام عام الحزن. ولم تتوقف رسالة النبي صلى الله عليه وسلم، لكن وحدته الشخصية واشتداد الضغط الخارجي أصبحا أوضح. ومهد ذلك لمساع جديدة مثل رحلة الطائف.",
        "metin_id": "Tahun Duka datang setelah boikot dan membawa wafatnya dua pendukung terdekat Nabi. Abu Thalib wafat terlebih dahulu; perlindungannya di dalam kabilah berfungsi sebagai perisai dari tekanan luar. Kemudian Khadijah wafat; sejak wahyu pertama ia memberi ketenangan, penghiburan, serta dukungan material dan emosional di rumah. Karena dua kehilangan ini terjadi berdekatan, tahun itu dikenal sebagai Tahun Duka. Misi Nabi tidak berhenti, tetapi kesendirian pribadi dan tekanan luar menjadi lebih tampak. Hal ini menyiapkan upaya baru, termasuk perjalanan ke Thaif.",
        "metin_ur": "سالِ حزن بائیکاٹ کے بعد آیا اور اس میں نبی صلی اللہ علیہ وسلم نے اپنے دو قریبی سہارا دینے والوں کو کھو دیا۔ پہلے ابو طالب کا انتقال ہوا؛ قبیلے کے اندر ان کی حفاظت بیرونی دباؤ کے خلاف ڈھال تھی۔ پھر خدیجہ رضی اللہ عنہا وفات پا گئیں؛ پہلی وحی سے وہ گھر میں سکون، تسلی اور مالی و جذباتی سہارا تھیں۔ یہ دو نقصانات قریب واقع ہوئے اس لیے اسے عام الحزن کہا جاتا ہے۔ نبی ﷺ کی رسالت ختم نہیں ہوئی، مگر ذاتی تنہائی اور بیرونی دباؤ زیادہ نمایاں ہو گیا۔ اسی نے طائف کے سفر جیسے نئے اقدامات کی زمین بنائی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Tâif yolculuğu, Mekke’de destek daraldığında Resûlullah ﷺ’ın tebliği başka bir topluma taşıma çabasıdır. Sîre kaynakları, Tâif ileri gelenlerinden beklenen karşılığın alınmadığını, hatta Peygamber’in incitildiğini aktarır. Rivayet ayrıntıları farklı derecelerde nakledilebilir; bu nedenle olayın özü üzerinden konuşmak daha sağlıklıdır: Tâif’ta davet kabul görmedi ve Resûlullah ﷺ ağır bir reddedişle karşılaştı. Bu an, peygamberlik tarihindeki yalnızlık sahnelerinden biridir; fakat aynı zamanda duanın, sabrın ve intikam yerine hidayet umudunun öne çıktığı bir dönüm noktasıdır. Tâif’ten sonra İsrâ ve Mi‘râc ile Akabe temasları, Mekke dışındaki yeni kapıların açılmasına zemin hazırlamıştır.",
        "metin_en": "The journey to Ta’if was the Prophet’s effort to carry the message to another community when support narrowed in Makkah. Sirah sources report that the leaders of Ta’if did not respond positively and that the Prophet was harmed. Details may vary in narration, so it is best to focus on the core: the call was not accepted in Ta’if and the Prophet faced severe rejection. This is one of the scenes of loneliness in prophetic history, yet it is also a turning point where prayer, patience, and hope for guidance outweighed revenge. After Ta’if, the Isra and Mi‘raj and contacts at Aqabah helped open new doors beyond Makkah.",
        "metin_ar": "كانت رحلة الطائف محاولة من النبي صلى الله عليه وسلم لنقل الدعوة إلى مجتمع آخر بعدما ضاق النصير في مكة. وتذكر مصادر السيرة أن وجوه الطائف لم يستجيبوا، وأن النبي صلى الله عليه وسلم لقي أذى. وقد تختلف تفاصيل الروايات، والأولى التركيز على أصل الحدث: لم تقبل الدعوة في الطائف وواجه النبي صلى الله عليه وسلم رفضا شديدا. وهذا من مشاهد الوحدة في تاريخ النبوة، لكنه أيضا نقطة تحول برز فيها الدعاء والصبر ورجاء الهداية فوق الانتقام. وبعد الطائف مهد الإسراء والمعراج ولقاءات العقبة لفتح أبواب جديدة خارج مكة.",
        "metin_id": "Perjalanan ke Thaif adalah upaya Nabi membawa dakwah ke masyarakat lain ketika dukungan di Makkah menyempit. Sumber sirah menyebut para pemuka Thaif tidak merespons baik dan Nabi mengalami gangguan. Rincian riwayat dapat berbeda, sehingga lebih tepat berfokus pada inti peristiwa: dakwah tidak diterima di Thaif dan Nabi menghadapi penolakan berat. Ini adalah salah satu gambaran kesendirian dalam sejarah kenabian, namun juga titik balik ketika doa, kesabaran, dan harapan hidayah lebih menonjol daripada balasan. Setelah Thaif, Isra Mi‘raj dan kontak di Aqabah membantu membuka pintu baru di luar Makkah.",
        "metin_ur": "طائف کا سفر اس وقت کی کوشش تھی جب مکہ میں حمایت تنگ ہو رہی تھی اور نبی صلی اللہ علیہ وسلم دعوت کو دوسرے معاشرے تک لے جانا چاہتے تھے۔ سیرت کی کتب میں آتا ہے کہ طائف کے سرداروں نے مثبت جواب نہ دیا اور نبی ﷺ کو اذیت کا سامنا کرنا پڑا۔ روایتی تفصیلات مختلف ہو سکتی ہیں، اس لیے اصل بات پر توجہ مناسب ہے: طائف میں دعوت قبول نہ ہوئی اور آپ کو سخت ردعمل ملا۔ یہ نبوی تاریخ کے تنہائی کے مناظر میں سے ہے، مگر اسی کے ساتھ دعا، صبر اور انتقام کے بجائے ہدایت کی امید کا موڑ بھی ہے۔ طائف کے بعد اسراء و معراج اور عقبہ کی ملاقاتوں نے مکہ سے باہر نئی راہیں کھولیں۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "akabe",
    "ad": "İsrâ-Mi‘râc, Akabe Biatları ve Hicret Hazırlığı",
    "donem": "Mekke",
    "olaylar": [
      {
        "metin": "İsrâ ve Mi‘râc Kur’an ve sahih rivayetlerle anılır; namaz ibadetinin merkezi yeri bu bağlamda vurgulanır.",
        "metin_en": "Isra and Mi‘raj are mentioned in the Quran and authentic reports; prayer’s central place is emphasized in this context.",
        "metin_ar": "يذكر الإسراء والمعراج في القرآن والروايات الصحيحة، وتبرز فيهما مكانة الصلاة.",
        "metin_id": "Isra dan Mi‘raj disebut dalam Al-Qur’an dan riwayat sahih; kedudukan salat ditekankan.",
        "metin_ur": "اسراء و معراج قرآن و صحیح روایات میں مذکور ہیں؛ نماز کی اہمیت نمایاں ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Birinci Akabe’de Medineli bir grubun iman ve ahlaki taahhüt verdiği aktarılır.",
        "metin_en": "At the First Aqabah, a group from Madinah pledged faith and moral commitments.",
        "metin_ar": "في العقبة الأولى بايع نفر من أهل المدينة على الإيمان والأخلاق.",
        "metin_id": "Pada Aqabah Pertama, sekelompok orang Madinah berjanji pada iman dan akhlak.",
        "metin_ur": "عقبہ اولیٰ میں مدینہ کے لوگوں نے ایمان اور اخلاق کا عہد کیا۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mus‘ab b. Umeyr Medine’de öğretim faaliyeti yürüttü; davet orada güçlendi.",
        "metin_en": "Mus‘ab ibn Umayr taught in Madinah, strengthening the call there.",
        "metin_ar": "قام مصعب بن عمير بالتعليم في المدينة فقويت الدعوة.",
        "metin_id": "Mus‘ab bin Umair mengajar di Madinah dan dakwah menguat.",
        "metin_ur": "مصعب بن عمیر نے مدینہ میں تعلیم دی، دعوت مضبوط ہوئی۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "İkinci Akabe Biatı hicret için güvenlik ve destek zemini oluşturdu.",
        "metin_en": "The Second Aqabah pledge created a basis of support and security for Hijrah.",
        "metin_ar": "هيأت بيعة العقبة الثانية أرضية للنصرة والهجرة.",
        "metin_id": "Baiat Aqabah Kedua menyiapkan dukungan dan keamanan untuk hijrah.",
        "metin_ur": "عقبہ ثانیہ نے ہجرت کے لیے حمایت کی بنیاد رکھی۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mekke’de artan tehditler üzerine Medine’ye hicret süreci başladı.",
        "metin_en": "As threats in Makkah increased, migration to Madinah began.",
        "metin_ar": "مع ازدياد الخطر في مكة بدأت الهجرة إلى المدينة.",
        "metin_id": "Saat ancaman meningkat, hijrah ke Madinah dimulai.",
        "metin_ur": "مکہ میں خطرہ بڑھا تو مدینہ کی ہجرت شروع ہوئی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "hicret",
    "ad": "Hicret ve Medine’ye Yerleşme",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Resûlullah ﷺ ve Ebû Bekir hicret yolunda Sevr’de gizlendi; Tevbe Suresi bu yolculuğa işaret eder.",
        "metin_en": "The Prophet and Abu Bakr hid at Thawr during Hijrah; Surah at-Tawbah alludes to this journey.",
        "metin_ar": "اختبأ النبي صلى الله عليه وسلم وأبو بكر في ثور، وتشير سورة التوبة إلى ذلك.",
        "metin_id": "Nabi dan Abu Bakar bersembunyi di Tsur; Surah At-Taubah menyinggung perjalanan ini.",
        "metin_ur": "نبی ﷺ اور ابو بکر ثور میں چھپے؛ سورہ توبہ اس کا ذکر کرتی ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye; Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Ali (r.a.)’nin emanetleri teslim etmesi hicretin güven ve sorumluluk yönünü gösterir.",
        "metin_en": "Ali’s returning of trusts shows the responsibility and trust involved in Hijrah.",
        "metin_ar": "تأدية علي رضي الله عنه للأمانات تظهر جانب المسؤولية في الهجرة.",
        "metin_id": "Ali mengembalikan amanah, menunjukkan sisi tanggung jawab hijrah.",
        "metin_ur": "علی کا امانتیں واپس کرنا ہجرت کی ذمہ داری دکھاتا ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Kuba’ya varış ve Kuba Mescidi’nin temelleri Medine döneminin ilk adımlarıdır.",
        "metin_en": "Arrival at Quba and the beginnings of Quba Mosque were early steps of the Madinan period.",
        "metin_ar": "الوصول إلى قباء وبدايات مسجد قباء من أولى خطوات المرحلة المدنية.",
        "metin_id": "Tiba di Quba dan awal Masjid Quba adalah langkah awal periode Madinah.",
        "metin_ur": "قباء آمد اور مسجد قباء کی ابتدا مدنی دور کے پہلے قدم تھے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Medine’ye girişte Ensar’ın karşılaması güçlü bir sosyal bağ oluşturdu.",
        "metin_en": "The Ansar’s welcome in Madinah formed strong social bonds.",
        "metin_ar": "استقبال الأنصار في المدينة أسس رابطة اجتماعية قوية.",
        "metin_id": "Sambutan Ansar di Madinah membentuk ikatan sosial kuat.",
        "metin_ur": "انصار کا استقبال مضبوط سماجی تعلق بنا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mescid-i Nebevî ve suffe, ibadet, eğitim ve danışma merkezi oldu.",
        "metin_en": "Masjid an-Nabawi and the Suffah became centers of worship, learning, and consultation.",
        "metin_ar": "صار المسجد النبوي والسُّفة مركزا للعبادة والعلم والشورى.",
        "metin_id": "Masjid Nabawi dan Suffah menjadi pusat ibadah, belajar, dan musyawarah.",
        "metin_ur": "مسجد نبوی اور صفہ عبادت، تعلیم اور مشاورت کا مرکز بنے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Muhacir-Ensar kardeşliği, Medine’de yeni toplumsal düzenin temel taşlarından biri oldu.",
        "metin_en": "Muhajir-Ansar brotherhood became a cornerstone of Madinah’s social order.",
        "metin_ar": "كانت المؤاخاة بين المهاجرين والأنصار ركنا من أركان نظام المدينة.",
        "metin_id": "Persaudaraan Muhajirin-Ansar menjadi pilar tatanan Madinah.",
        "metin_ur": "مہاجرین و انصار کی مواخات مدینہ کے نظم کی بنیاد بنی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mekke’den Medine’ye hicret eden muhacirler mal ve memleket bırakarak yeni bir toplumsal düzenin parçası oldu.",
        "metin_en": "Muhajirun left property and homeland for Madinah, becoming part of a new social order.",
        "metin_ar": "ترك المهاجرون المال والوطن فكانوا جزءا من بناء مجتمع جديد.",
        "metin_id": "Muhajirin meninggalkan harta dan tanah air, menjadi bagian tatanan baru.",
        "metin_ur": "مہاجرین مال و وطن چھوڑ کر نئے معاشرتی نظم کا حصہ بنے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "medine",
    "ad": "Medine Sözleşmesi, İbadetler ve Toplumsal Düzen",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Medine Vesikası/Anlaşması, şehirdeki topluluklar arasında güvenlik ve sorumluluk çerçevesi kurdu.",
        "metin_en": "The Madinah document established a framework of security and responsibility among the city’s communities.",
        "metin_ar": "وضعت صحيفة المدينة إطارا للأمن والمسؤولية بين سكان المدينة.",
        "metin_id": "Dokumen Madinah menetapkan kerangka keamanan dan tanggung jawab warga kota.",
        "metin_ur": "میثاق مدینہ نے شہر کے باشندوں میں امن و ذمہ داری کا ڈھانچہ دیا۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Kıble Mescid-i Haram’a yöneltildi; bu değişim ayetlerle sabittir.",
        "metin_en": "The qiblah was directed to Masjid al-Haram, established by Quranic verses.",
        "metin_ar": "وُجهت القبلة إلى المسجد الحرام بنص قرآني.",
        "metin_id": "Kiblat diarahkan ke Masjidil Haram berdasarkan ayat Al-Qur’an.",
        "metin_ur": "قبلہ مسجد الحرام کی طرف کیا گیا، جیسا کہ قرآن میں ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Ezan, namaza toplu çağrı olarak yerleşti.",
        "metin_en": "The adhan became established as the communal call to prayer.",
        "metin_ar": "استقر الأذان دعوة جماعية للصلاة.",
        "metin_id": "Azan ditetapkan sebagai panggilan salat berjamaah.",
        "metin_ur": "اذان اجتماعی دعوت کے طور پر قائم ہوا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Ramazan orucu ve zekât uygulamaları Medine toplumunun ibadet düzeninde belirginleşti.",
        "metin_en": "Ramadan fasting and zakat practices became clear parts of Madinah’s worship order.",
        "metin_ar": "برز صيام رمضان والزكاة في تنظيم العبادة بالمدينة.",
        "metin_id": "Puasa Ramadhan dan zakat menjadi bagian jelas ibadah di Madinah.",
        "metin_ur": "رمضان اور زکوٰۃ مدینہ کے نظام عبادت میں نمایاں ہوئے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye; Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Pazar ve toplumsal ilişkilerde adalet, sözleşmeye bağlılık ve ahlak vurgusu sürdürüldü.",
        "metin_en": "Justice, covenant loyalty, and moral conduct were emphasized in public and social relations.",
        "metin_ar": "استمر التأكيد على العدل والوفاء بالعهد والأخلاق في العلاقات العامة.",
        "metin_id": "Keadilan, kesetiaan pada perjanjian, dan akhlak ditekankan dalam hubungan sosial.",
        "metin_ur": "عدل، عہد کی پاسداری اور اخلاق پر زور رہا۔",
        "kaynak": "Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye; Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "bedir",
    "ad": "Bedir: Sebepler, Savaş ve Sonrası",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Bedir, Hicri 2. yılda Müslümanlarla Mekkeli müşrikler arasında meydana geldi.",
        "metin_en": "Badr occurred in 2 AH between Muslims and the Makkan polytheists.",
        "metin_ar": "وقعت بدر في السنة الثانية للهجرة بين المسلمين ومشركي مكة.",
        "metin_id": "Badar terjadi pada 2 H antara Muslim dan musyrik Makkah.",
        "metin_ur": "بدر 2 ہجری میں مسلمانوں اور مشرکین مکہ کے درمیان ہوئی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Müslümanların sayıca az ve teçhizatça sınırlı olduğu kaynaklarda belirtilir.",
        "metin_en": "Sources note the Muslims were fewer and had limited equipment.",
        "metin_ar": "تذكر المصادر قلة عدد المسلمين وضعف العدة.",
        "metin_id": "Sumber mencatat jumlah Muslim sedikit dan perlengkapan terbatas.",
        "metin_ur": "مسلمان کم تعداد اور محدود سازوسامان کے ساتھ تھے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Bedir günü dua, sabır ve kararlılık sahâbenin tutumunda öne çıktı.",
        "metin_en": "Supplication, patience, and resolve marked the Companions’ conduct at Badr.",
        "metin_ar": "برز الدعاء والصبر والثبات في موقف الصحابة يوم بدر.",
        "metin_id": "Doa, sabar, dan keteguhan menonjol pada sikap sahabat di Badar.",
        "metin_ur": "بدر کے دن دعا، صبر اور ثابت قدمی نمایاں تھی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Bedir sonrası esirler konusunda istişare ve farklı hükümler/uygulamalar rivayet edilir.",
        "metin_en": "Consultation and different rulings/practices regarding captives after Badr are reported.",
        "metin_ar": "وردت مشاورة وأحكام مختلفة في شأن أسرى بدر.",
        "metin_id": "Musyawarah dan ketentuan berbeda tentang tawanan Badar diriwayatkan.",
        "metin_ur": "بدر کے قیدیوں کے بارے میں مشاورت اور مختلف احکام منقول ہیں۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Bedir öncesi su kuyuları, konaklama ve istişare gibi hazırlıklar sîre/megâzî kaynaklarında anlatılır.",
        "metin_en": "Preparations before Badr, including water, position, and consultation, are described in sirah/maghazi sources.",
        "metin_ar": "تذكر المصادر الاستعداد قبل بدر من ماء وموقع ومشورة.",
        "metin_id": "Persiapan sebelum Badar seperti air, posisi, dan musyawarah disebut dalam sumber.",
        "metin_ur": "بدر سے پہلے پانی، مقام اور مشاورت کی تیاری مذکور ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Bedir’de şehit olan Müslümanlar sahabe arasında fedakârlık örneği olarak anılır.",
        "metin_en": "Muslims martyred at Badr are remembered for sacrifice among the Companions.",
        "metin_ar": "يذكر شهداء بدر بوصفهم نموذجا في التضحية.",
        "metin_id": "Muslim yang syahid di Badar dikenang sebagai teladan pengorbanan.",
        "metin_ur": "بدر کے شہداء قربانی کی مثال ہیں۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "uhud",
    "ad": "Uhud: Başlangıç, Bozulma ve Dersler",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Uhud, Hicri 3. yılda Bedir sonrası yaşanan büyük bir imtihandır.",
        "metin_en": "Uhud, in 3 AH, was a major trial after Badr.",
        "metin_ar": "كانت أحد في السنة الثالثة ابتلاء كبيرا بعد بدر.",
        "metin_id": "Uhud pada 3 H adalah ujian besar setelah Badar.",
        "metin_ur": "احد 3 ہجری میں بدر کے بعد بڑی آزمائش تھی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Savaşın başında Müslümanlar ilerleme kaydetti; okçuların konumunu terk etmesi sonucu durum değişti.",
        "metin_en": "Muslims advanced early, but the situation changed when archers left their position.",
        "metin_ar": "تقدم المسلمون أولا ثم تغير الحال بمخالفة الرماة.",
        "metin_id": "Muslim maju di awal, lalu keadaan berubah saat pemanah meninggalkan posisi.",
        "metin_ur": "شروع میں برتری ملی، پھر تیر اندازوں کے مقام چھوڑنے سے حالت بدلی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Hamza (r.a.)’nın şehadeti ve birçok sahâbenin yaralanması/şehadeti bu günün ağır sonuçlarıdır.",
        "metin_en": "Hamza’s martyrdom and many casualties were among the day’s heavy losses.",
        "metin_ar": "استشهاد حمزة وإصابة واستشهاد عدد من الصحابة من نتائج اليوم.",
        "metin_id": "Syahadah Hamzah dan banyak korban adalah dampak berat hari itu.",
        "metin_ur": "حمزہ کی شہادت اور دیگر نقصانات اس دن کے ciężے نتائج تھے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Âl-i İmrân ayetleri Uhud’da itaat, sabır ve tökezledikten sonra toparlanma derslerini işler.",
        "metin_en": "Verses in Aal Imran address obedience, patience, and recovery after setback at Uhud.",
        "metin_ar": "عالجت آيات آل عمران أحدا بالدروس في الطاعة والصبر والتعافي بعد الزلة.",
        "metin_id": "Ayat Ali Imran membahas ketaatan, sabar, dan bangkit setelah tergelincir di Uhud.",
        "metin_ur": "آل عمران کی آیات احد میں اطاعت، صبر اور سنبھلنے کے اسباق دیتی ہیں۔",
        "kaynak": "Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      }
    ]
  },
  {
    "id": "handak",
    "ad": "Hendek Kuşatması ve İlgili Gelişmeler",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Ahzâb/Hendek, Medine’nin kuşatıldığı kritik bir savunma dönemidir.",
        "metin_en": "Al-Ahzab/Trench was a critical period of siege and defense of Madinah.",
        "metin_ar": "كانت الأحزاب فترة حصار ودفاع حاسمة عن المدينة.",
        "metin_id": "Ahzab/Khandaq adalah masa kritis pengepungan dan pertahanan Madinah.",
        "metin_ur": "احزاب/خندق مدینہ کے محاصرے اور دفاع کا نازک دور تھا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Hendek kazılması savunma için uygulanan önemli bir tedbirdir; Selmân’ın önerisi rivayet edilir.",
        "metin_en": "Digging the trench was a key defensive measure; Salman’s suggestion is reported.",
        "metin_ar": "كان حفر الخندق تدبيرا دفاعيا مهما، وتذكر مشورة سلمان.",
        "metin_id": "Menggali parit adalah langkah pertahanan penting; usulan Salman diriwayatkan.",
        "metin_ur": "خندق کھودنا اہم دفاعی تدبیر تھی؛ سلمان کی رائے منقول ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Kuşatma sırasında korku, açlık ve soğuk yaşandı; Ahzâb Suresi bu durumu anlatır.",
        "metin_en": "Fear, hunger, and cold occurred during the siege; Surah al-Ahzab describes this.",
        "metin_ar": "وقع الخوف والجوع والبرد أثناء الحصار، ووصفت سورة الأحزاب ذلك.",
        "metin_id": "Ketakutan, lapar, dan dingin terjadi saat pengepungan; Surah Al-Ahzab menggambarkannya.",
        "metin_ur": "محاصرے میں خوف، بھوک اور سردی تھی؛ سورہ احزاب بیان کرتی ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Benî Kurayza ile ilgili gelişmeler Hendek sonrası kaynaklarda ayrıntılı ele alınır; değerlendirmede rivayet çeşitliliği dikkate alınır.",
        "metin_en": "Developments concerning Banu Qurayzah after the Trench are detailed in sources, with varied reports.",
        "metin_ar": "تفصل المصادر ما جرى مع بني قريظة بعد الخندق مع مراعاة اختلاف الروايات.",
        "metin_id": "Perkembangan terkait Bani Quraizhah setelah Khandaq dirinci dalam sumber dengan variasi riwayat.",
        "metin_ur": "بنو قریظہ کے امور خندق کے بعد تفصیل سے مذکور ہیں؛ روایتی اختلاف کا لحاظ لازم ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "hudaybiye",
    "ad": "Hudeybiye, Umre Kazâsı ve Davet Mektupları",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Hudeybiye Antlaşması 6 H.’de yapıldı; bazı maddeleri tartışılmış olsa da tebliğ alanını genişletti.",
        "metin_en": "The Treaty of Hudaybiyyah was made in 6 AH; despite debated terms, it expanded outreach.",
        "metin_ar": "وقع صلح الحديبية سنة 6 هـ، ومع جدل بعض بنوده فقد وسع مجال الدعوة.",
        "metin_id": "Perjanjian Hudaibiyah terjadi pada 6 H; meski sebagian klausul diperdebatkan, ia memperluas dakwah.",
        "metin_ur": "صلح حدیبیہ 6 ہجری میں ہوئی؛ بعض شرائط پر بحث ہوئی مگر دعوت کا دائرہ وسیع ہوا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Rıdvân Biatı, Hudeybiye bağlamında sahâbenin sadakatini gösterdi.",
        "metin_en": "The Pledge of Ridwan showed the Companions’ loyalty at Hudaybiyyah.",
        "metin_ar": "أظهرت بيعة الرضوان وفاء الصحابة في الحديبية.",
        "metin_id": "Baiat Ridhwan menunjukkan kesetiaan sahabat di Hudaibiyah.",
        "metin_ur": "بیعت رضوان حدیبیہ میں وفاداری کی علامت تھی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye; Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Bazı liderlere davet mektupları gönderildiği rivayet edilir; bu, tebliğin bölgesel boyutunu gösterir.",
        "metin_en": "Invitation letters were reportedly sent to some leaders, showing a regional dimension of outreach.",
        "metin_ar": "تذكر الروايات إرسال رسائل دعوة إلى بعض القادة، بما يدل على امتداد الدعوة.",
        "metin_id": "Surat dakwah diriwayatkan dikirim kepada beberapa pemimpin, menunjukkan jangkauan lebih luas.",
        "metin_ur": "بعض رہنماؤں کو خطوط بھیجے جانے کا ذکر دعوت کی وسعت دکھاتا ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hayber ve Mûte gibi olaylar bu dönemde siyasi-askeri bağlamda anılır; ayrıntılar megâzî kaynaklarındadır.",
        "metin_en": "Events such as Khaybar and Mu’tah are mentioned in this period’s political-military context; details are in maghazi sources.",
        "metin_ar": "تذكر خيبر ومؤتة في سياق تلك المرحلة، وتفاصيلها في كتب المغازي.",
        "metin_id": "Khaibar dan Mu’tah disebut dalam konteks periode ini; rinciannya ada di sumber maghazi.",
        "metin_ur": "خیبر اور مؤتہ اس دور کے سیاق میں آتے ہیں؛ تفصیل مغازی میں ہے۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "8 H.’de Mekke’nin Fethi gerçekleşti; bu, Arabistan’da geniş kabul sürecini hızlandırdı.",
        "metin_en": "The conquest of Makkah occurred in 8 AH, accelerating wider acceptance in Arabia.",
        "metin_ar": "كان فتح مكة سنة 8 هـ فسرّع انتشار الإسلام في الجزيرة.",
        "metin_id": "Penaklukan Makkah terjadi pada 8 H dan mempercepat penerimaan Islam.",
        "metin_ur": "فتح مکہ 8 ہجری میں ہوا اور قبولیت کی رفتار بڑھی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Umre niyetiyle Mekke’ye gidiş, savaş amacı taşımadığını göstermek için ihram ve kurban düzeniyle yapıldı.",
        "metin_en": "The journey to Makkah was for Umrah, undertaken in ihram with sacrificial animals to show no intent of war.",
        "metin_ar": "كان الخروج للعمرة بالإحرام والهدي دلالة على عدم قصد الحرب.",
        "metin_id": "Perjalanan dilakukan untuk umrah dengan ihram dan hewan kurban, menunjukkan bukan niat perang.",
        "metin_ur": "مکہ کا سفر عمرے کی نیت سے احرام اور ہدی کے ساتھ تھا، جنگ کا ارادہ نہ تھا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hudeybiye maddeleri arasında o yıl umrenin ertelenmesi ve belirli iade/ateşkes şartları vardı; sahâbe bunu zor bulsa da Resûlullah ﷺ anlaşmaya uydu.",
        "metin_en": "Hudaybiyyah included postponing Umrah that year and specific truce terms; though difficult for some Companions, the Prophet upheld the agreement.",
        "metin_ar": "اشتملت هدنة الحديبية على تأجيل العمرة وشروط صلح، فالتزم بها النبي صلى الله عليه وسلم رغم صعوبتها على بعض الصحابة.",
        "metin_id": "Hudaibiyah mencakup penundaan umrah tahun itu dan syarat gencatan; Nabi mematuhinya meski terasa berat bagi sebagian sahabat.",
        "metin_ur": "حدیبیہ میں اس سال عمرے کی تاخیر اور صلح کی شرائط تھیں؛ صحابہ کو سخت لگا مگر نبی ﷺ نے عہد نبھایا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Antlaşma sonrası dönemde Müslümanlarla müşrikler arasında temas arttı; bu, tebliğ ve bilgi akışını kolaylaştırdı.",
        "metin_en": "After the treaty, contact between Muslims and Quraysh increased, easing outreach and exchange.",
        "metin_ar": "زاد الاحتكاك بعد الصلح، فسهل ذلك تبليغ الدعوة وتبادل الأخبار.",
        "metin_id": "Setelah perjanjian, kontak meningkat sehingga dakwah dan pertukaran informasi lebih mudah.",
        "metin_ur": "صلح کے بعد رابطے بڑھے، جس سے دعوت اور معلومات کا تبادلہ آسان ہوا۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Farklı bölge liderlerine İslam’a davet mektupları gönderildiği; bu girişimin zamanlaması ve sonuçları rivayetlerde çeşitlilik gösterir.",
        "metin_en": "Letters inviting various leaders to Islam are reported; timing and outcomes vary across narrations.",
        "metin_ar": "تذكر الروايات إرسال رسائل دعوة إلى بعض القادة، مع اختلاف في التوقيت والتفاصيل.",
        "metin_id": "Surat ajakan kepada para pemimpin diriwayatkan; waktu dan hasilnya berbeda dalam riwayat.",
        "metin_ur": "مختلف رہنماؤں کو دعوتی خطوط بھیجے گئے؛ تفصیلات روایات میں مختلف ہیں۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "huneyn",
    "ad": "Hayber, Mûte, Fethin Ardından Huneyn ve Tâif",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Hayber seferi 7 H. civarında gerçekleşti; kalelerin ele geçirilmesi ve sonrasında yapılan düzenlemeler megâzî kaynaklarında ayrıntılıdır.",
        "metin_en": "The Khaybar expedition occurred around 7 AH; capture of fortresses and later arrangements are detailed in maghazi sources.",
        "metin_ar": "وقعت خيبر نحو السنة السابعة للهجرة، وتفصل كتب المغازي فتح الحصون وما تلاه من تنظيم.",
        "metin_id": "Ekspedisi Khaibar terjadi sekitar 7 H; penaklukan benteng dan pengaturan setelahnya dirinci dalam sumber maghazi.",
        "metin_ur": "خیبر تقریباً 7 ہجری میں ہوئی؛ قلعوں کی فتح اور بعد کے انتظامات مغازی میں تفصیل سے ہیں۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Hayber’de Yahudilerle yapılan tarım anlaşmasına dair farklı hukuki rivayetler vardır; konu fıkıh ve sîre literatüründe tartışılır.",
        "metin_en": "There are varied legal reports about the agricultural agreement at Khaybar; it is discussed in fiqh and sirah literature.",
        "metin_ar": "ترد روايات مختلفة في ترتيبات الزراعة بعد خيبر، وهي موضع بحث في الفقه والسيرة.",
        "metin_id": "Ada riwayat hukum berbeda tentang perjanjian pertanian di Khaibar; dibahas dalam fikih dan sirah.",
        "metin_ur": "خیبر کے زرعی انتظامات پر مختلف روایات ہیں؛ فقہ و سیرت میں بحث موجود ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Umretü’l-kazâ (kaza umresi) Hudeybiye anlaşması çerçevesinde ertesi yıl eda edildi.",
        "metin_en": "The compensatory Umrah (Umrat al-Qada) was performed the following year under the Hudaybiyyah terms.",
        "metin_ar": "أُديت عمرة القضاء في العام التالي وفق شروط الحديبية.",
        "metin_id": "Umrah qada ditunaikan tahun berikutnya sesuai perjanjian Hudaibiyah.",
        "metin_ur": "عمرۃ القضاء حدیبیہ کی شرائط کے مطابق اگلے سال ادا ہوئی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mûte hadisesi 8 H. civarında Bizans sınır bölgesinde yaşanan zorlu bir çarpışma olarak aktarılır; Zeyd, Ca‘fer ve Abdullah b. Revâha’nın şehadeti anılır.",
        "metin_en": "The Mu’tah encounter around 8 AH is reported as a difficult clash near Byzantine frontiers; the martyrdoms of Zayd, Ja‘far, and Abdullah ibn Rawahah are remembered.",
        "metin_ar": "وقعت مؤتة نحو السنة الثامنة في سياق صعب، وتذكر شهادة زيد وجعفر وعبد الله بن رواحة.",
        "metin_id": "Peristiwa Mu’tah sekitar 8 H adalah benturan sulit; syahadah Zayd, Ja‘far, dan Abdullah bin Rawahah dikenang.",
        "metin_ur": "مؤتہ تقریباً 8 ہجری میں سخت مواجهہ تھا؛ زید، جعفر اور عبداللہ بن رواحہ کی شہادت یاد کی جاتی ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Mekke’nin fethi 8 H. Ramazan’ında gerçekleşti; Kâbe’deki putların kaldırıldığı ve genel af uygulandığı rivayet edilir.",
        "metin_en": "Makkah was conquered in Ramadan 8 AH; removal of idols at the Kaaba and a general pardon are reported.",
        "metin_ar": "كان فتح مكة في رمضان سنة 8 هـ، وتذكر الروايات إزالة الأصنام والعفو العام.",
        "metin_id": "Fathu Makkah terjadi Ramadhan 8 H; penyingkiran berhala dan pengampunan umum diriwayatkan.",
        "metin_ur": "فتح مکہ 8 ہجری رمضان میں ہوا؛ بتوں کی برطرفی اور عام معافی کا ذکر ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Huneyn’de başlangıçta Müslüman saflarında sarsılma yaşandı, ardından toparlanma ve zafer rivayet edilir.",
        "metin_en": "At Hunayn, Muslims initially faced disorder, followed by regrouping and victory in reports.",
        "metin_ar": "وقعت جولة في بداية حنين ثم ثبت المسلمون وكان النصر.",
        "metin_id": "Di Hunain terjadi guncangan awal lalu kaum Muslim bertahan dan menang menurut riwayat.",
        "metin_ur": "حنین میں ابتدا میں انتشار ہوا پھر مسلمان سنبھلے اور فتح ہوئی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye; Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Huneyn sonrası ganimetlerin dağıtımı ve kalplerin telifi uygulamaları tartışılmış; konu hadis ve sîre kaynaklarında geçer.",
        "metin_en": "Distribution of spoils and reconciliation measures after Hunayn were discussed in hadith and sirah sources.",
        "metin_ar": "نوقش تقسيم الغنائم والتألف بعد حنين في مصادر الحديث والسيرة.",
        "metin_id": "Pembagian rampasan dan upaya melunakkan hati setelah Hunain dibahas dalam hadis dan sirah.",
        "metin_ur": "حنین کے بعد مال غنیمت اور تالیف القلوب کے اقدامات احادیث و سیرت میں مذکور ہیں۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Tâif kuşatması sonuç vermedi ve kaldırıldı; sabır ve hikmet gerektiren bir süreçti.",
        "metin_en": "The siege of Ta’if did not succeed and was lifted, a process requiring patience and wisdom.",
        "metin_ar": "لم ينجح حصار الطائف فرفع، وكان موضع صبر وحكمة.",
        "metin_id": "Pengepungan Thaif tidak berhasil dan dihentikan; memerlukan kesabaran dan hikmah.",
        "metin_ur": "طائف کا محاصرہ کامیاب نہ ہوا؛ صبر اور حکمت درکار تھی۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  },
  {
    "id": "veda",
    "ad": "Veda Haccı, Veda Hutbesi, Son Hastalık, Vefat ve Miras",
    "donem": "Medine",
    "olaylar": [
      {
        "metin": "Veda Haccı 10 H.’de yapıldı; büyük bir sahâbe topluluğu katıldı.",
        "metin_en": "The Farewell Pilgrimage took place in 10 AH with a large gathering of Companions.",
        "metin_ar": "وقعت حجة الوداع سنة 10 هـ بحضور جمع كبير من الصحابة.",
        "metin_id": "Haji Wada terjadi pada 10 H dengan banyak sahabat hadir.",
        "metin_ur": "حجۃ الوداع 10 ہجری میں بڑے اجتماع کے ساتھ ہوا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Veda Hutbesi’nde can, mal, namus güvenliği; faiz ve kan davalarının bıraktırılması; kadınlara iyi muamele ve takva vurgulandı.",
        "metin_en": "The Farewell Sermon stressed safety of life, property, and honor; ending usury and blood feuds; kind treatment of women; and taqwa.",
        "metin_ar": "أكدت خطبة الوداع حرمة الدماء والأموال والأعراض، وترك الربا والثأر، والوصية بالنساء والتقوى.",
        "metin_id": "Khutbah Wada menekankan perlindungan jiwa-harta-kehormatan, penghapusan riba dan dendam, perlakuan baik kepada wanita, dan takwa.",
        "metin_ur": "خطبہ وداع میں جان، مال، عزت، سود و انتقام کے خاتمے، عورتوں سے حسن سلوک اور تقویٰ پر زور تھا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Resûlullah ﷺ’ın ümmeti Kur’an ve sünnet yönlendirmesiyle emanet ettiği rivayet edilir.",
        "metin_en": "He is reported to have entrusted the community to guidance through the Quran and Sunnah.",
        "metin_ar": "ورد التأكيد على التمسك بالقرآن والسنة بعده.",
        "metin_id": "Beliau menekankan berpegang pada Al-Qur’an dan Sunnah.",
        "metin_ur": "قرآن و سنت کو تھامنے کی تاکید منقول ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh"
      },
      {
        "metin": "Son hastalığında Ebû Bekir’in (r.a.) namaz kıldırdığı rivayet edilir.",
        "metin_en": "During his final illness, Abu Bakr is reported to have led prayer.",
        "metin_ar": "تذكر الروايات أن أبا بكر صلى بالناس في مرضه الأخير.",
        "metin_id": "Saat sakit terakhir, Abu Bakar diriwayatkan mengimami salat.",
        "metin_ur": "آخری بیماری میں ابو بکر کے امامت کرنے کا ذکر ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Resûlullah ﷺ 11 H.’de Medine’de vefat etti. Sahâbe derin üzüntü yaşadı; ümmetin istikrarı için tevhit ve sabır vurgusu yapıldı.",
        "metin_en": "He passed away in Madinah in 11 AH. The Companions grieved deeply; calls to patience and monotheism steadied the community.",
        "metin_ar": "توفي بالمدينة سنة 11 هـ فحزن الصحابة، وثبت الناس بالتوحيد والصبر.",
        "metin_id": "Beliau wafat di Madinah pada 11 H; para sahabat berduka, dan umat diteguhkan dengan tauhid serta sabar.",
        "metin_ur": "11 ہجری میں مدینہ میں وفات ہوئی؛ صحابہ غمگین ہوئے، امت کو توحید اور صبر سے سنبھالا گیا۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Resûlullah ﷺ’ın kabri, Medine’de Mescid-i Nebevî yakınında bulunmaktadır; ziyaret adabı İslam kaynaklarında saygı ve sükûnet çerçevesinde ele alınır.",
        "metin_en": "His grave is in Madinah near Masjid an-Nabawi; Islamic sources discuss visitation with manners of respect and calm.",
        "metin_ar": "قبره في المدينة قرب المسجد النبوي، وتذكر المصادر آداب الزيارة بالوقار والسكينة.",
        "metin_id": "Makam beliau di Madinah dekat Masjid Nabawi; sumber membahas adab ziarah dengan hormat dan tenang.",
        "metin_ur": "آپ کا مزار مدینہ میں مسجد نبوی کے قریب ہے؛ زیارت کے آداب وقار کے ساتھ بیان ہوتے ہیں۔",
        "kaynak": "İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Buhârî, Sahîh; Müslim, Sahîh"
      },
      {
        "metin": "Son hastalığında ümmete namaz, emanetler ve insan hakları konusunda hassasiyet tavsiye ettiği rivayet edilir.",
        "metin_en": "In his final illness he is reported to have advised care regarding prayer, trusts, and people’s rights.",
        "metin_ar": "وردت وصايا في مرضه الأخير بالعناية بالصلاة والأمانات وحقوق الناس.",
        "metin_id": "Dalam sakit terakhir beliau menasihati perhatian pada salat, amanah, dan hak manusia.",
        "metin_ur": "آخری بیماری میں نماز، امانتوں اور حقوق العباد کی تاکید منقول ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      },
      {
        "metin": "Vefat haberi Medine’de büyük sarsıntı yarattı; Ömer’in ilk tepkisi ve Ebû Bekir’in Kur’an ayetiyle insanları sükûnete daveti rivayet edilir.",
        "metin_en": "His death shocked Madinah; reports mention Umar’s reaction and Abu Bakr calming people with a Quranic verse.",
        "metin_ar": "أحدثت وفاته صدمة بالمدينة، وتذكر الروايات موقف عمر وتثبيت أبي بكر الناس بآية من القرآن.",
        "metin_id": "Wafatnya mengguncang Madinah; riwayat menyebut reaksi Umar dan Abu Bakar menenangkan dengan ayat Al-Qur’an.",
        "metin_ur": "وفات سے مدینہ میں صدمہ ہوا؛ عمر کا ردعمل اور ابو بکر کا قرآنی آیت سے لوگوں کو سنبھالنا منقول ہے۔",
        "kaynak": "Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât; Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye"
      },
      {
        "metin": "Resûlullah ﷺ’ın mirası mal birikimi değil; Kur’an, sünnet, adalet, tevazu ve güzel ahlak olarak yaşadı.",
        "metin_en": "His legacy was not material accumulation but the Quran, Sunnah, justice, humility, and good character.",
        "metin_ar": "لم يكن ميراثه مالا، بل القرآن والسنة والعدل والتواضع وحسن الخلق.",
        "metin_id": "Warisan beliau bukan harta, melainkan Al-Qur’an, Sunnah, keadilan, kerendahan hati, dan akhlak baik.",
        "metin_ur": "آپ کا ورثہ مال نہیں بلکہ قرآن، سنت، عدل، عاجزی اور حسن اخلاق تھا۔",
        "kaynak": "Kur’an-ı Kerim ilgili ayetler; İbn Kesîr, el-Bidâye ve’n-Nihâye; Buhârî, Sahîh; Müslim, Sahîh; İbn Hişâm, es-Sîre; İbn Sa'd, et-Tabakât"
      }
    ]
  }
];
