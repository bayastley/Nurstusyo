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
  sayfalar?: string[];
  baslik_en?: string; baslik_ar?: string; baslik_id?: string; baslik_ur?: string;
  hikaye_en?: string; hikaye_ar?: string; hikaye_id?: string; hikaye_ur?: string;
  hikmet_en?: string; hikmet_ar?: string; hikmet_id?: string; hikmet_ur?: string;
  sayfalar_en?: string[]; sayfalar_ar?: string[]; sayfalar_id?: string[]; sayfalar_ur?: string[];
}

export const MENKIBELER: Menkibe[] = [
  ...KISLAR,
  {
    id: "mk-01",
    kategori: "Ölüm & Kabir",
    baslik: "Üç Dostun Son Muhasebesi",
    hikaye: "Ölüm ve kabir konulu bu menkıbe, insanın dünya hayatındaki bağlarını ve asıl kalıcı sermayesini düşünmeye çağırır. Ebu'd-Derdâ (r.a.) ve erken dönem âlimlerinin meclislerinde dünyanın geçiciliği sık sık hatırlatılırdı. Rivayetlerde farklı lafızlarla aktarılan bu kıssada, ölüm döşeğindeki bir adam malını, ailesini ve amelini kendisiyle yolculuk edecek üç dost gibi düşünür.\n\nAdam önce malına döner: 'Benimle gelir misin?' Mal, insana hizmet etse de kabre kadar eşlik edemeyeceğini, geride kalacağını söyler. Bu sahne, servetin faydasını inkâr etmez; fakat onu ebedî bir yoldaş sanmanın yanılgısını gösterir. İslam öğretisinde mal, hayır yolunda kullanıldığında bereket; amaç hâline geldiğinde ise ağır bir imtihan olabilir.\n\nSonra adam ailesine ve sevdiklerine yönelir. Onlar da üzüntüyle uğurlayacaklarını, cenazeyi taşıyacaklarını fakat mezarın başından dönmek zorunda kalacaklarını ifade eder. Bu, yakınların sevgisini küçümsemek değil; insanın kabir ve ahiret yolculuğunda bizzat kendi ameliyle karşılaşacağını hatırlatmaktır.\n\nSon olarak ameline sorar. Amel, 'Ben seninleyim; kabre seninle girer, sorguda yanında bulunurum' der. Bu cevap kıssanın kalbidir. Namaz, oruç, sadaka, doğruluk, adalet, güzel söz ve gizli iyilikler; görünmeyen ama insanla birlikte kalan işlerdir.\n\nRivayet, Kur'ân'ın genel mesajıyla uyumlu bir ibret sunar: mal ve evlat tek başına kurtuluş garantisi değildir. Asıl olan, Allah katında değer kazanan salih ameldir. Bu nedenle menkıbe, dünyayı terk etmeyi değil; dünyayı ahiretin tarlası gibi görmeyi öğütler.\n\nİnsanın hayatı boyunca kurduğu ilişkiler, kazandığı imkânlar ve edindiği itibar önemlidir; fakat ölüm anı bu unsurların hangisinin gerçekten yanında kalacağını ayırt eder. Kıssa, bu ayrımı acı ama öğretici bir sadelikle gösterir.\n\nAmel denince yalnızca şekil olarak yapılan ibadetler anlaşılmamalıdır. Kul hakkına dikkat etmek, emanete sadık kalmak, dili yalandan ve gıybetten korumak, helal kazanmak ve affedici olmak da salih amelin parçalarıdır. İslam'da kalp, dil ve el birlikte sorumludur.\n\nMenkıbe aynı zamanda tevbeye ve hazırlığa davet eder. İnsan, her gün 'benimle kalıcı olan ne?' sorusunu kendine sorabilir. Bu soru, hayatı ertelemeyi değil; bugünden itibaren samimi ve faydalı işler işlemeyi teşvik eder.\n\nErken dönem zühd anlatılarında sık geçen bu tema, korkutmak için değil uyandırmak içindir. Amaç, insanı umutsuzluğa düşürmek değil; ölümü hatırlayarak daha bilinçli, daha merhametli ve daha sorumlu bir hayat kurmasına yardımcı olmaktır.\n\nSonuç ve ibret: Dünyada insanı terk etmeyen dost, salih ameldir. Mal ve yakınlar geride kalabilir; amel ise kulun hesabında yanında yer alır. Bu kıssa, rivayet farklı şekillerde aktarılsa da İslam'ın ahiret bilinci ve amel sorumluluğu mesajını güçlü biçimde hatırlatır.\n\nKaynak: Ebu'd-Derdâ'ya nispet edilen öğütler ve benzer kıssa anlatıları: İbnü'l-Cevzî, Sıfatü's-Safve; el-Gazzâlî, İhyâ'u Ulûmi'd-Dîn (ölüm/ahiret bölümleri, tematik anlatım).",
    hikmet:
      "Dünyada insanı terk etmeyen tek dost, salih ameldir. Mal ve yakınlar geride kalabilir; amel ise kulun hesabında yanında yer alır.",
    kaynak:
      "Ebu'd-Derdâ'ya nispet edilen öğütler ve benzer kıssa anlatıları: İbnü'l-Cevzî, Sıfatü's-Safve; el-Gazzâlî, İhyâ'u Ulûmi'd-Dîn (ölüm/ahiret bölümleri, tematik anlatım).",
    sayfalar: ["Ölüm ve kabir konulu bu menkıbe, insanın dünya hayatındaki bağlarını ve asıl kalıcı sermayesini düşünmeye çağırır. Ebu'd-Derdâ (r.a.) ve erken dönem âlimlerinin meclislerinde dünyanın geçiciliği sık sık hatırlatılırdı. Rivayetlerde farklı lafızlarla aktarılan bu kıssada, ölüm döşeğindeki bir adam malını, ailesini ve amelini kendisiyle yolculuk edecek üç dost gibi düşünür.", "Adam önce malına döner: 'Benimle gelir misin?' Mal, insana hizmet etse de kabre kadar eşlik edemeyeceğini, geride kalacağını söyler. Bu sahne, servetin faydasını inkâr etmez; fakat onu ebedî bir yoldaş sanmanın yanılgısını gösterir. İslam öğretisinde mal, hayır yolunda kullanıldığında bereket; amaç hâline geldiğinde ise ağır bir imtihan olabilir.", "Sonra adam ailesine ve sevdiklerine yönelir. Onlar da üzüntüyle uğurlayacaklarını, cenazeyi taşıyacaklarını fakat mezarın başından dönmek zorunda kalacaklarını ifade eder. Bu, yakınların sevgisini küçümsemek değil; insanın kabir ve ahiret yolculuğunda bizzat kendi ameliyle karşılaşacağını hatırlatmaktır.", "Son olarak ameline sorar. Amel, 'Ben seninleyim; kabre seninle girer, sorguda yanında bulunurum' der. Bu cevap kıssanın kalbidir. Namaz, oruç, sadaka, doğruluk, adalet, güzel söz ve gizli iyilikler; görünmeyen ama insanla birlikte kalan işlerdir.", "Rivayet, Kur'ân'ın genel mesajıyla uyumlu bir ibret sunar: mal ve evlat tek başına kurtuluş garantisi değildir. Asıl olan, Allah katında değer kazanan salih ameldir. Bu nedenle menkıbe, dünyayı terk etmeyi değil; dünyayı ahiretin tarlası gibi görmeyi öğütler.", "İnsanın hayatı boyunca kurduğu ilişkiler, kazandığı imkânlar ve edindiği itibar önemlidir; fakat ölüm anı bu unsurların hangisinin gerçekten yanında kalacağını ayırt eder. Kıssa, bu ayrımı acı ama öğretici bir sadelikle gösterir.", "Amel denince yalnızca şekil olarak yapılan ibadetler anlaşılmamalıdır. Kul hakkına dikkat etmek, emanete sadık kalmak, dili yalandan ve gıybetten korumak, helal kazanmak ve affedici olmak da salih amelin parçalarıdır. İslam'da kalp, dil ve el birlikte sorumludur.", "Menkıbe aynı zamanda tevbeye ve hazırlığa davet eder. İnsan, her gün 'benimle kalıcı olan ne?' sorusunu kendine sorabilir. Bu soru, hayatı ertelemeyi değil; bugünden itibaren samimi ve faydalı işler işlemeyi teşvik eder.", "Erken dönem zühd anlatılarında sık geçen bu tema, korkutmak için değil uyandırmak içindir. Amaç, insanı umutsuzluğa düşürmek değil; ölümü hatırlayarak daha bilinçli, daha merhametli ve daha sorumlu bir hayat kurmasına yardımcı olmaktır.", "Sonuç ve ibret: Dünyada insanı terk etmeyen dost, salih ameldir. Mal ve yakınlar geride kalabilir; amel ise kulun hesabında yanında yer alır. Bu kıssa, rivayet farklı şekillerde aktarılsa da İslam'ın ahiret bilinci ve amel sorumluluğu mesajını güçlü biçimde hatırlatır.\n\nKaynak: Ebu'd-Derdâ'ya nispet edilen öğütler ve benzer kıssa anlatıları: İbnü'l-Cevzî, Sıfatü's-Safve; el-Gazzâlî, İhyâ'u Ulûmi'd-Dîn (ölüm/ahiret bölümleri, tematik anlatım)."],
  },
];