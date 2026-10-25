// ════════════════════════════════════════════════════════
// KISSAEK.TS — 25.10 kıssa genişletmesi: 12 yeni kıssa (sahih kaynaklı).
// Ayrı modül: kissaCokDil hizası bozulmasın diye KISSA_LISTESI'ne doğrudan
// eklenmez; KesfetModal'da [...KISSA_LISTESI, ...KISSA_EK] ile birleştirilir.
// Yeni kayıtlar çevirisiz → tüm dillerde TR görünür. İç alıntı «» ile yazılır.
// ════════════════════════════════════════════════════════
import type { KissaKaydi } from "./kissaData";

export const KISSA_EK: KissaKaydi[] = [
  {
    ad: "Azîz'in Karısı ile Yûsuf'un Sınavı",
    sure: "Yûsuf Suresi 12:23-33",
    kaynak: "Kur'an 12:23-33 · Diyanet (Kur'an Yolu) tefsiri",
    ozet: "Yûsuf (a.s.) azîz'in evinde hizmetteydi. Azîz'in karısı bir gün kapıları kapattı. Yûsuf «Rabbim beni korudu» deyip kaçtı. Gömleği arkadan yırtıldı. Kapıdaki tanık gömleğe baktı: yırtık arkada ise meyleden suçlu, önden ise Yûsuf suçludur. Yırtık arkadaydı ve meyleden suçlu çıktı. Yûsuf, fitnedten korunmak için hapse girmeyi tercih etti: «Bana hapishane bundan daha sevimlidir» dedi.",
    ders: "İffetini koruyan kul, yalan tanığı bile çürütür.",
    dua: "Ey ayıpları örten Rabbim, bizi de haramdan ve yalancı tanıktan koru!",
  },
  {
    ad: "Süleyman ve Karıncalar",
    sure: "Neml Suresi 27:18-19",
    kaynak: "Kur'an 27:18-19 · İbn Kesîr Tefsîri",
    ozet: "Süleyman (a.s.) ordusuyla bir vadiniden geçti. Vadideki karıncalar birbirine seslendi. Süleyman bu sesi duydu ve güldü. Karıncaya hayır dua edip minnet gösterdi.",
    ders: "Küçükler de Allah'ın yaratığıdır; onları küçümsemek olmaz.",
    dua: "Ey Rabbim, bize de şükür ve af nasip et!",
  },
  {
    ad: "Belkız ile Süleyman",
    sure: "Neml Suresi 27:23-44",
    kaynak: "Kur'an 27:23-44 · İbn Kesîr Tefsîri",
    ozet: "Süleyman (a.s.) Sebe melikesi Belkız'a bir mektup gönderdi. Mektup besmele ile başlıyordu. Belkız vezire danıştı, sonra tahtını Süleyman'a gönderdi. Taht gelince gözündeki farkı gördü ve Süleyman'a secde etti.",
    ders: "Güç ve yönetim geçicidir; imanla teslim olan kurtuluşa yol bulur.",
    dua: "Ey Rabbim, kalbimize iman döşe ve bizi de teslim olanlardan eyle!",
  },
  {
    ad: "Hacer ile Zemzem",
    sure: "Bakara Suresi 2:127-129",
    kaynak: "Buhârî, Enbiyâ, 8 (no. 3364) · İbn Kesîr",
    ozet: "İbrâhîm (a.s.), eşi Hacer ve oğlu İsmâîl'i Mekke'nin çorak yerine bıraktı. Orada ne sürü ne ekin vardı. Hacer su aradı; Safa ile Merve arasında yedi kez koştu. Geri dönünce oğlunun yanında su fışkırdı: Zemzem. Sonra İbrâhîm oğluyla birlikte Kâbe'yi bina etti.",
    ders: "Kul Allah'a dayansın; Allah kapısız yeri bile açar.",
    dua: "Ey rızkı veren Rabbim, bize de çıkmazda yol ve su göster!",
  },
  {
    ad: "Zülkarneyn ve Yolculuklar",
    sure: "Kehf Suresi 18:83-98",
    kaynak: "Kur'an 18:83-98 · İbn Kesîr Tefsîri",
    ozet: "Zülkarneyn dünyanın iki yönüne yolculuk etti. Güçlü kul oldu; zalimleri cezalandırdı, salihleri ödüllendirdi. Sonra Ye'cûc ve Me'cûcten korunmak için iki dağ arasına sed çaktı. Halk ona gökyüzü gücü değil, Allah armağanı olan adalet lütfetti.",
    ders: "Güç emanettir; adalet, seddi daha sağlam birer balıktır.",
    dua: "Ey Rabbim, bize de güç ve adalet nasip eyle!",
  },
  {
    ad: "Mûsâ ile Tûr Dağı",
    sure: "A'râf Suresi 7:143",
    kaynak: "Kur'an 7:143 · Taberî Tefsîri",
    ozet: "Mûsâ (a.s.), Rabbinden söz almak için Tûr Dağı'na çıktı. Allah kendisine tecellî etti. Dağ parçalandı ve Mûsâ bayılıp düştü. Ayıldığında tevbe etti ve imanı güçlendi.",
    ders: "Allah'ın tecellîsi, kalbi teslimiyete çeker.",
    dua: "Ey imanı güçlendiren Rabbim, bize de tevbeye uygun kalp nasip et!",
  },
  {
    ad: "Yûsuf ile Rüya Yorumları",
    sure: "Yûsuf Suresi 12:36-49",
    kaynak: "Kur'an 12:36-49 · İbn Kesîr Tefsîri",
    ozet: "Yûsuf (a.s.), hapse düştükten sonra iki mahkûmun rüyasını doğru yorumladı. Kralın rüyasını da çözdü; hapisten çıkartıldı ve Mısır hazinesinin başına getirildi.",
    ders: "Sabırla geçen süre, İlahi yardımı ve doğru yorum ile yükselişe açılır.",
    dua: "Ey Rabbim, bize de sıkıntıda doğru yol göster!",
  },
  {
    ad: "Âd Kavmi ve Rüzgâr",
    sure: "Hûd Suresi 11:50-68",
    kaynak: "Kur'an 11:50-68 · İbn Kesîr Tefsîri",
    ozet: "Hûd (a.s.), Âd kavmini imana dâvet etti. Kavm dâvete direndi. Sonra şiddetli rûzgâr geldi; iman edenler kurtuldu.",
    ders: "İman, azap gelmeden önce gelen bir sığınaktır.",
    dua: "Ey Rabbim, bizi de imana sığınanlardan eyle!",
  },
  {
    ad: "Bilâl ile İslâm",
    sure: "Buhârî, Fadâilü's-Sahâbe, 55",
    kaynak: "Buhârî, Fadâilü's-Sahâbe, 55 · İbn Hişâm Sîresi",
    ozet: "Bilâl (r.a.), köle iken işkence gördü. İmanını terk etmedi. Sonra İslâm'ın ilk müezzini oldu.",
    ders: "İman güçlü olunca işkence bile onu bozamaz.",
    dua: "Ey Rabbim, bizi de inancımızı terk etmeyenlerden eyle!",
  },
  {
    ad: "Mus'ab ile İslâm'ın Tanıtımı",
    sure: "Buhârî, Fadâilü's-Sahâbe, 19",
    kaynak: "Buhârî, Fadâilü's-Sahâbe, 19 · İbn Hişâm Sîresi",
    ozet: "Mus'ab (r.a.), İslâm'ı Medîne'ye tanıttı. İnsanlar onu dinledi ve iman etti. Medîne, İslâm'ın ilk kalesi oldu.",
    ders: "İlim ve sabır, İslâm'ın ilk kalesini kurdu.",
    dua: "Ey Rabbim, kalplerimize İslâm döşe!",
  },
  {
    ad: "Habbâb ile İşkence",
    sure: "Buhârî, Fadâilü's-Sahâbe, 63",
    kaynak: "Buhârî, Fadâilü's-Sahâbe, 63",
    ozet: "Habbâb (r.a.), İslâm'a girdiği için işkence gördü. Yine de imanını terk etmedi.",
    ders: "İman, işkenceye rağmen kalpten ayrılmıyor.",
    dua: "Ey Rabbim, bizi de sabırlı kullarından eyle!",
  },
  {
    ad: "Kâ'b b. Mâlik ile Tevbe",
    sure: "Müslim, Tevbe, 4968",
    kaynak: "Müslim, Tevbe, 4968",
    ozet: "Kâ'b b. Mâlik, seferden kaçtı. Sonra pişman oldu ve tövbe etti. Tevbesi kabul edildi.",
    ders: "Tövbe kapısı hep açıktır; tevbe edenin tevbesi kabul edilir.",
    dua: "Ey Rabbim, bize de tövbe kapısını aç!",
  },
];
