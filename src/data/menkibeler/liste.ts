// Üstteki bu dosya scripts/derle_menkibeler.py ile üretilmiştir (elle duzenleme yok).
import type { Menkibe } from "../menkibeler";

const KISLAR: Menkibe[] = [
  {
    id: "mk-02",
    kategori: "Nebiler",
    baslik: "Ateşe Yürüyen Sevgili",
    hikaye: "Nemrud, halkını toplayıp İbrâhîm Aleyhisselâm'ı büyük bir ateşe atmayı emretti. Ovada ateş için kuru odunlar günlerce yığıldı; yağ dökülüp ateş yükseldi, gökyüzüne kadar uzanan alevler hep birlikte ağlarcasına şiddetlendi. Halk birbirine baktı ve âdeta beklemeden yaktı. İbrâhîm'in elleri kelepçelendi; gözü hüzünle göğe döndü. Zindana çekilirken bile kalbi sarsılmadı, çünkü kalbinde bel bağladığı bir Zât vardı. Ateşe fırlatıldığı an Cenab-ı Hak: Ey ateş! İbrâhîm'e serinlik ve selâm ol buyurdu. Ateş yandı ama yakmadı; kızgın közler, onun için zümrüt gibi bir bahçeye dönüştü. Halk bu âcaip hâdiseyi görüp şaştı; yolunu geriye değil İbrâhîm'e çevirdi. İbrâhîm, Allah'a sığındığı için o ateşten selâmetle çıktı. Nemrud bile bu uğraşa kendi azâbıyla şaşırarak karanlıkta kaldı.",
    hikmet: "Allah'a îmân eden için ateş bile soğaktır; îmân, zülmet kapısında nur olur; kulluğa hasbî bakış en büyük güçtür.",
    kaynak: "Kur'ân: Tâhâ 21:68-69; İbn Kesîr, el-Bidâye ve'n-Nihâye",
  },
  {
    id: "mk-03",
    kategori: "Ashab",
    baslik: "Mus‘ab bin Umeyr: Kokuda Denen Genç",
    hikaye: "Mus‘ab bin Umeyr, Mekke'nin en zengin delikanlısıydı. Sarışı, giysisi, mis kokusu ile dönüyordu. İslâm ile tanışınca Müslüman oldu. Annesi kızıp ona evinden kovdu. Onu evinden bir kenara bırakıp Medine'ye yolladı. Mus‘ab, Medine'de İslâm halkının arayı âdeta peygambere yolladı. Ezan sesini okşadı. \"İşte bu imânı olağan halk entem, göstermelik haz yum'ın.\" Hz. Ömer baktı ve Mus‘ab: \"İmân « Hz. Ömer, Mus‘ab’ın gayretini gördü; Mus‘ab daha sonra Uhud’da şehît oldu.»",
    hikmet: "İslâm’a duyduğu sevgi, Mus‘ab’i dünya zığsı gibi hazırlıyorsun; İslâm’ın en güzel örnek sahâbesi oldu.",
    kaynak: "İbnül-Esîr, Usdü'l-Gâbe",
  },
  {
    id: "mk-04",
    kategori: "Sâlihler",
    baslik: "Veysel Karânî: Annesine Hizmet",
    hikaye: "Veysel Karânî, Yemen'den Mekke'ye geldi. Peygamberimiz onu arıyordu. Ama Veysel, annesine bakmak için Medine'ye gidememişti. Yıllarca annesini doyurup temizledi. Peygamberimiz onun yüzünü görünse de dua etmişti: \"O, annesinden duasın.\" Veysel sonunda İslâm'a katıldı ve üstadlara yol gösterdi.",
    hikmet: "Annesine hizmet eden kimsenin duası, kader kapısını açar.",
    kaynak: "Sıfatu's-Safve (İbnül-Cevzî)",
  },
  {
    id: "mk-05",
    kategori: "Nebiler",
    baslik: "Hz. Eyyûb: Belâ üzerinde Sabır",
    hikaye: "Hz. Eyyûb, servetini, evlâtını ve sağlığını kaybetti. Yıllarca yatakta yattı; çıbanlar bedenini sarardı. Tek sözü şuydu: \"Allah'a hamd ederim.\" Karısı ona hizmet etmeyi sürdürdü. Sonra Hz. Eyyûb dua etti ve Allah ona sağlık ve iki kat nimet verdi. Herkes ona \"sabır efendisi\" dedi.",
    hikmet: "Sabır, belâ kapısını açan anahtardır; sabreden hüsrâna uğramaz.",
    kaynak: "Kur'an-ı Kerîm (Sâd: 41-44); İbn Kesîr, Kısasü'l-Enbiyâ",
  },
  {
    id: "mk-06",
    kategori: "Ashab",
    baslik: "Bilâl-i Habeşî: Kayadan Ezan",
    hikaye: "Bilâl, köle olduğu için işkence gördü. Efendisi onu çölde kızgın kumaşa yatırdı. Kırbaçlar altında tek kelime söyledi: \"Ehad, Ehad!\" Sonra Hz. Ebû Bekir onu kurtardı. Bilâl, azat olunca İslâm'ın ilk müezzini oldu. Mekke'de Kâbe'nin üstünde ilk ezanı okudu.",
    hikmet: "Sabır, eziyeti şerefe çevirir. Allah, sabreden kulunu yüceltir.",
    kaynak: "İbn Hişâm, Sîretü'n-Nebî; Ebû Nuaym, Hilyetü'l-Evliyâ",
  },
  {
    id: "mk-07",
    kategori: "Yöneticiler & Adalet",
    baslik: "Hz. Ömer: Gece Gezen Halife",
    hikaye: "Hz. Ömer halife oldu; geceyi Medine sokaklarında dolaşarak geçirirdi. Bir gece bir evden sesler duydu: ev halkı açtır. Sabah olunca beytü'l-mâl'dan una, yağa ve hurma getirdi, daha yüzüne bakmadan eve bıraktı. \"Hepiniz çobansınız; verdiğiniz emânetten sorumlusunuz\" felsefesiyle yaşadı.",
    hikmet: "Yetki, güç değil sorumluluktur; adalet, halkın derdine kalkıp koşmadır.",
    kaynak: "İbn Cevzî, Sıfatü's-Safve; Gazâlî, İhyâu Ulûmi'd-dîn (Adalet faslı)",
  },
  {
    id: "mk-08",
    kategori: "İslâm Alimleri",
    baslik: "Zünnûn-i Mısrî: Denizde Balıklar",
    hikaye: "Zünnûn-i Mısrî, valinin iftirâsı ile gemiden atıldı. Denizin ortasında kaldı. O anda iki büyük balık onu sırtlarına alıp kıyıya taşıdı. Vali bu durumu görünce utandı ve pişman oldu.",
    hikmet: "Hak, samimi kulunu imtihanda yalnız bırakmaz.",
    kaynak: "Attâr, Tezkiretü'l-Evliyâ",
  },
  {
    id: "mk-09",
    kategori: "Hanımlar",
    baslik: "Hz. Âişe: Bilginler Okulu",
    hikaye: "Hz. Âişe, Peygamber'den dinlediği hadîsleri ashâba anlatırdı. Âlimler onun evine gelip ondan dinlerdi; ondan binlerce hadîs rivâyet etmişlerdir. O, ümmetin ilk kadın müftilerinden sayılır.",
    hikmet: "Bilgi kapısı herkese açıktır; kadınlar da Peygamber'in ilminin hâfızası oldu.",
    kaynak: "Buhârî, Sahîh; İbn Hacer, Fethü'l-Bârî",
  },
  {
    id: "mk-10",
    kategori: "Sabır",
    baslik: "Ebû Zer: Kanâatın Zenginliği",
    hikaye: "Hz. Ebû Zer, dünyadan sakınan sahâbîydi. Elinde az nimet olsa da kanaat ederdi; az yemekle doyar, az giyinmeyle yetinirdi. \"Kim malı çok tutarsa doymaz; kim kanaat tutarsa zengindir\" derdi.",
    hikmet: "Kanâat, kalbin zenginliğidir; az ile doyan kimse fakir değildir.",
    kaynak: "Ebû Nuaym, Hilyetü'l-Evliyâ; Gazâlî, İhyâu Ulûmi'd-dîn (Kanâat faslı)",
  },
];

export default KISLAR;
