// ════════════════════════════════════════════════════════
// KELİME ATÖLYESİ DATA — İş 3: Kelime Tabanlı Video Üretimi
// Kullanıcı tek kelime yazar ("sabır", "deniz", "huzur"...)
// → sistem o kelimeye uygun AYET önerisi + ATMOSFER kategorisi
//   + videoya hazır bir SATIR üretir. Tek tıkla stüdyoya aktarılır.
//
// Ayet havuzu: AYET_KARTILARI (Ayet Kütüphanesi verisi — mood etiketli,
// ar + tr + source alanlı). Böylece veri tek yerde yaşar, kartlarla
// ve stüdyo aynı metinleri kullanır.
//
// ★ Tüm anahtarlar normalize (ASCII) formda tutulur — "sabır" değil
//   "sabir". Kullanıcının girdisi de normalize edilerek aranır.
// ════════════════════════════════════════════════════════

import { AYET_KARTILARI, type AyetKarti } from "./ayetKartlariData";
import type { CatId } from "../clips";

export interface KelimeRecete {
  id: string;
  /** Kullanıcıya gösterilen tema başlığı */
  etiket: string;
  emoji: string;
  /** Normalize edilmiş kelime varyantları (sorgu bunlarla eşlenir) */
  anahtarlar: string[];
  /** Bu temaya uygun ayet duygu etiketleri → ayet havuzunu süzer */
  moods: Array<AyetKarti["mood"]>;
  /** Atmosfer kategori önerileri (sıra = öncelik) */
  cats: CatId[];
  /** Videonun üstüne/altına hazır satır — kopyalanıp başlık/açıklamaya yapıştırılır */
  satir: string;
  /** "Neden bu ayetler?" — dürüst kısa açıklama */
  aciklama: string;
}

// ── Kelime → tema reçeteleri ──────────────────────────────
export const KELIME_RECETELERI: KelimeRecete[] = [
  { id: "sabir", emoji: "🌿", etiket: "Sabır",
    anahtarlar: ["sabir", "sabret", "sabreden", "sabrederek", "tahammul", "metanet", "azim", "sebat"],
    moods: ["sabir", "imtihan"], cats: ["daglar", "orman", "gol", "col", "kar"],
    satir: "Sabret — sabır, sıkıntıyı eriten ilk yağmurdur.",
    aciklama: "Sabır ve imtihan temalı ayetler + ayakta kalan dağ atmosferi." },
  { id: "huzur", emoji: "🌙", etiket: "Huzur",
    anahtarlar: ["huzur", "sukun", "dingin", "rahat", "mutluluk", "ferah"],
    moods: ["huzur"], cats: ["gece", "gol", "desen", "orman", "deniz"],
    satir: "Kalbini yorma; huzur zikirle gelir.",
    aciklama: "Kalbin huzuruna dair ayetler + sakin gece atmosferi." },
  { id: "sukur", emoji: "🤍", etiket: "Şükür",
    anahtarlar: ["sukur", "sukret", "hamd", "nimet", "bereket"],
    moods: ["sukur", "aile"], cats: ["cicekler", "orman", "gunbatimi", "gol", "cennet"],
    satir: "Nimetin hesabını tutan, bereketin kapısını açar.",
    aciklama: "Şükür ve nimet temalı ayetler + açan çiçek atmosferi." },
  { id: "tevekkul", emoji: "🕊️", etiket: "Tevekkül",
    anahtarlar: ["tevekkul", "guven", "emanet", "baglanmak"],
    moods: ["tevekkul", "huzur"], cats: ["yildizlar", "gece", "deniz", "bulut", "gol"],
    satir: "Planını yap, sonunu O'na bırak.",
    aciklama: "Tevekkül temalı ayetler + sonsuzluk hissi veren yıldız atmosferi." },
  { id: "rahmet", emoji: "💧", etiket: "Rahmet",
    anahtarlar: ["rahmet", "merhamet", "affedicilik", "sefkat"],
    moods: ["rahmet", "af"], cats: ["deniz", "selale", "bulut", "kar", "cicekler"],
    satir: "Rahmet yağmuru, umudu kurutan her yere iner.",
    aciklama: "Rahmet ve mağfiret temalı ayetler + su atmosferi." },
  { id: "sevgi", emoji: "🌸", etiket: "Sevgi",
    anahtarlar: ["sevgi", "ask", "muhabbet", "dostluk", "kardeslik"],
    moods: ["sevgi", "aile"], cats: ["cicekler", "gol", "gunbatimi", "orman", "cennet"],
    satir: "Sevgiyle ekilen kalp, gülle açar.",
    aciklama: "Sevgi temalı ayetler + gül bahçesi atmosferi." },
  { id: "umut", emoji: "✨", etiket: "Umut",
    anahtarlar: ["umut", "umid", "beklenti", "iyimserlik", "zafer", "ferahlik"],
    moods: ["zafer", "tevekkul"], cats: ["gunbatimi", "yildizlar", "daglar", "deniz", "cicekler"],
    satir: "Karanlık ne kadar uzun olursa olsun, fecir doğar.",
    aciklama: "Umut ve zafer temalı ayetler + gün batımı atmosferi." },
  { id: "tovbe", emoji: "🤲", etiket: "Tövbe & Af",
    anahtarlar: ["tovbe", "tövbe", "gunah", "af", "mağfiret", "magfiret", "pismanlik"],
    moods: ["af", "rahmet"], cats: ["gece", "gunbatimi", "bulut", "kar", "deniz"],
    satir: "Tövbe, gökten inen merdiven gibidir.",
    aciklama: "Tövbe ve af temalı ayetler + akşam kızıllığı atmosferi." },
  { id: "imtihan", emoji: "⚡", etiket: "İmtihan",
    anahtarlar: ["imtihan", "sınav", "sinav", "zorluk", "musibet", "deneme"],
    moods: ["imtihan", "sabir"], cats: ["col", "daglar", "deniz", "bulut", "kar"],
    satir: "Her imtihan, sana uygun ölçüyle indirilir.",
    aciklama: "İmtihan temalı ayetler + geniş çöl atmosferi." },
  { id: "cennet", emoji: "🌴", etiket: "Cennet",
    anahtarlar: ["cennet", "adn", "ahiret", "mukafat", "janna"],
    moods: ["cennet"], cats: ["cennet", "orman", "cicekler", "selale", "gol"],
    satir: "Sabredenin sonu, cennet bahçelerinde açar.",
    aciklama: "Cennet temalı ayetler + yeşil bahçe atmosferi." },
  { id: "ilim", emoji: "📚", etiket: "İlim",
    anahtarlar: ["ilim", "bilgi", "ogrenmek", "kitap", "hikmet", "akil"],
    moods: ["ilim"], cats: ["musaf", "desen", "cami", "gece", "yildizlar"],
    satir: "Oku — ilim, karanlıkta kalan tek kandildir.",
    aciklama: "İlim ve hikmet temalı ayetler + mushaf atmosferi." },
  { id: "aile", emoji: "🏡", etiket: "Aile & Yuva",
    anahtarlar: ["aile", "yuva", "anne", "baba", "cocuk", "evlilik", "es"],
    moods: ["aile", "sevgi"], cats: ["cicekler", "gol", "orman", "gunbatimi", "cennet"],
    satir: "Yuva, iki kalbin secdeyle buluştuğu yerdir.",
    aciklama: "Aile ve yuva temalı ayetler + sakin doğa atmosferi." },
  { id: "deniz", emoji: "🌊", etiket: "Deniz",
    anahtarlar: ["deniz", "okyanus", "dalga", "dalgalar", "su", "gemi"],
    moods: ["huzur", "rahmet"], cats: ["deniz", "gol", "selale"],
    satir: "Dalgalar dağılmaz; içinde rızık, altında hikmet taşır.",
    aciklama: "Deniz ve rızık temalı ayetler + dalga atmosferi." },
  { id: "gece", emoji: "🌌", etiket: "Gece & Ay",
    anahtarlar: ["gece", "ay", "leyl", "gece yarısı", "uyku", "sessizlik"],
    moods: ["huzur", "tevekkul"], cats: ["gece", "yildizlar", "bulut"],
    satir: "Gece, secdeye en yakın saattir.",
    aciklama: "Gece ibadeti temalı ayetler + ay ışığı atmosferi." },
  { id: "yildiz", emoji: "⭐", etiket: "Yıldızlar",
    anahtarlar: ["yildiz", "yıldızlar", "uzay", "gokyuzu", "kainat", "evren", "galaksi"],
    moods: ["zafer", "ilim"], cats: ["yildizlar", "gece", "daglar"],
    satir: "Yıldızlar, karanlığı sayılarıyla yener.",
    aciklama: "Gök ve yaratılış temalı ayetler + yıldız atmosferi." },
  { id: "dag", emoji: "🏔️", etiket: "Dağ & Zirve",
    anahtarlar: ["dag", "dağlar", "zirve", "kaya", "yukseklik"],
    moods: ["sabir", "imtihan"], cats: ["daglar", "kar", "col"],
    satir: "Zirve, sabredenin mührünü taşır.",
    aciklama: "Sabır ve güç temalı ayetler + dağ atmosferi." },
  { id: "orman", emoji: "🌲", etiket: "Orman",
    anahtarlar: ["orman", "agac", "ağaç", "yesil", "yaprak", "doga"],
    moods: ["sukur", "cennet"], cats: ["orman", "cicekler", "gol"],
    satir: "Her yeşil dal, bir nimetin elçisidir.",
    aciklama: "Nimet ve yaratılış temalı ayetler + orman atmosferi." },
  { id: "cicek", emoji: "🌷", etiket: "Çiçekler",
    anahtarlar: ["cicek", "çiçek", "gul", "bahce", "bahçe", "tomurcuk"],
    moods: ["sevgi", "sukur"], cats: ["cicekler", "cennet", "orman"],
    satir: "Gül, dikeniyle beraber kokar.",
    aciklama: "Güzellik ve şükür temalı ayetler + çiçek atmosferi." },
  { id: "gunbatimi", emoji: "🌅", etiket: "Gün Batımı",
    anahtarlar: ["gunbatimi", "gün batımı", "aksam", "akşam", "sonus", "kizillik"],
    moods: ["zafer", "af"], cats: ["gunbatimi", "bulut", "deniz"],
    satir: "Güneş her akşam batar; her sabah sözünü tutar.",
    aciklama: "Vakit ve söz temalı ayetler + gün batımı atmosferi." },
  { id: "kabe", emoji: "🕋", etiket: "Kâbe",
    anahtarlar: ["kabe", "kâbe", "hac", "umre", "mekke", "kible", "kıble"],
    moods: ["huzur", "af"], cats: ["namaz", "cami", "desen"],
    satir: "Yön vermek için dönmen gerekmez; kalbini çevir.",
    aciklama: "Beytullah temalı ayetler + Kâbe atmosferi." },
  { id: "cami", emoji: "🕌", etiket: "Cami",
    anahtarlar: ["cami", "mescit", "mescid", "secde", "namaz", "ibadet"],
    moods: ["huzur", "ilim"], cats: ["cami", "namaz", "desen"],
    satir: "Secde, kalbin yeryüzüne en yakın olduğu andır.",
    aciklama: "Secde ve ibadet temalı ayetler + İslam mimarisi atmosferi." },
  { id: "kuran", emoji: "📖", etiket: "Kur'an",
    anahtarlar: ["kuran", "kur'an", "mushaf", "vahiy", "tilavet", "meal", "ayet", "kerim"],
    moods: ["ilim", "huzur"], cats: ["musaf", "desen", "cami"],
    satir: "Kitap, okuyanın diline tercüman iner.",
    aciklama: "Kur'an temalı ayetler + mushaf atmosferi." },
  { id: "zikir", emoji: "📿", etiket: "Zikir",
    anahtarlar: ["zikir", "tespih", "tesbih", "anmak", "dua", "subhanallah"],
    moods: ["huzur", "sukur"], cats: ["gol", "desen", "cami"],
    satir: "Bir kelime; kalbi ağırlığından kurtarır.",
    aciklama: "Zikir temalı ayetler + sakin göl atmosferi." },
  { id: "firtina", emoji: "⛈️", etiket: "Fırtına",
    anahtarlar: ["firtina", "fırtına", "ruzgar", "rüzgar", "yildirim", "fırtınalı"],
    moods: ["imtihan", "sabir"], cats: ["bulut", "deniz", "daglar"],
    satir: "Fırtınadan korkma; gemiyi gemi yapan dalgalardır.",
    aciklama: "Sınanma temalı ayetler + bulut ve rüzgâr atmosferi." },
  { id: "kar", emoji: "❄️", etiket: "Kar",
    anahtarlar: ["kar", "buz", "kis", "kış", "beyaz", "arinma", "arınma"],
    moods: ["af", "huzur"], cats: ["kar", "bulut", "gol"],
    satir: "Kar gibi iner rahmet; toprağı beyaza, kalbi huzura boyar.",
    aciklama: "Arınma ve rahmet temalı ayetler + kar atmosferi." },
  { id: "col", emoji: "🏜️", etiket: "Çöl",
    anahtarlar: ["col", "çöl", "kum", "deve", "vaha", "kuraklik"],
    moods: ["imtihan", "tevekkul"], cats: ["col", "daglar", "gunbatimi"],
    satir: "Çöl, yürüyene vaha vadeder.",
    aciklama: "Yol ve tevekkül temalı ayetler + çöl atmosferi." },
  { id: "selale", emoji: "💦", etiket: "Şelale",
    anahtarlar: ["selale", "şelale", "sifa", "cosku", "coşku", "su dusmesi"],
    moods: ["rahmet", "zafer"], cats: ["selale", "deniz", "orman"],
    satir: "Coşku, yüksekten dökülen her damlada yenilenir.",
    aciklama: "Şifa ve rahmet temalı ayetler + şelale atmosferi." },
  { id: "baslangic", emoji: "🌱", etiket: "Yeni Başlangıç",
    anahtarlar: ["baslangic", "başlangıç", "yeni", "ilk", "hamle", "degisim", "değişim", "hicret"],
    moods: ["zafer", "tevekkul"], cats: ["gunbatimi", "orman", "yildizlar"],
    satir: "Yol, ilk adımı atanın olur.",
    aciklama: "Başlangıç ve güven temalı ayetler + şafak atmosferi." },
  { id: "korku", emoji: "🛡️", etiket: "Korku & Sığınma",
    anahtarlar: ["korku", "korkmak", "korkan", "endise", "endişe", "kaygi", "kaygı", "dusman", "düşman", "siginmak", "sığınmak", "korunmak", "himaye"],
    moods: ["imtihan", "tevekkul"], cats: ["gece", "deniz", "daglar"],
    satir: "Korkunun yerini, yanında O olduğunu bilmek alır.",
    aciklama: "Güven ve koruma temalı ayetler + koruyan gece atmosferi." },
  { id: "rizik", emoji: "🌾", etiket: "Rızık & Geçim",
    anahtarlar: ["rizik", "rızık", "gecim", "geçim", "para", "maas", "maaş", "zenginlik", "bolluk", "borc", "borç", "ekmek", "istisna"],
    moods: ["sukur", "tevekkul"], cats: ["deniz", "cicekler", "bulut"],
    satir: "Rızkın Yaratan, seni de yaratmıştı — kaygı bırakıp bağlan.",
    aciklama: "Rızık ve bereket temalı ayetler + bolluk veren doğa atmosferi." },
  { id: "olum", emoji: "🍃", etiket: "Ölüm & Ebediyet",
    anahtarlar: ["olum", "ölüm", "olmek", "ölmek", "ebediyet", "veda", "can alma"],
    moods: ["imtihan", "af"], cats: ["gece", "gunbatimi", "bulut"],
    satir: "Her can ölümü tadacaktır; tadı güzel çıkaran, imanıdır.",
    aciklama: "Ölüm ve ahiret temalı ayetler + akşam sükûneti atmosferi." },
  { id: "kabir", emoji: "🪨", etiket: "Kabir",
    anahtarlar: ["kabir", "kabr", "mezar", "toprak altı", "berzah"],
    moods: ["imtihan", "af"], cats: ["col", "gece", "bulut"],
    satir: "Kabir bir son değil; yazının ilk satırıdır.",
    aciklama: "Kabir ve ahiret temalı ayetler + sessiz çöl atmosferi." },
  { id: "kiyamet", emoji: "🌪️", etiket: "Kıyamet",
    anahtarlar: ["kiyamet", "kıyamet", "kıyamet günü", "sur", "mahser", "mahşer", "saat"],
    moods: ["imtihan", "zafer"], cats: ["sehir", "daglar", "bulut"],
    satir: "Kıyamet, her şeyin gerçek yerini bulacağı gündür.",
    aciklama: "Kıyamet temalı ayetler + dramatik gökyüzü atmosferi." },
  { id: "cehennem", emoji: "🔥", etiket: "Cehennem",
    anahtarlar: ["cehennem", "nar", "saqar", "sakar", "hutame", "ateşten"],
    moods: ["imtihan", "af"], cats: ["ates", "col", "gunbatimi"],
    satir: "Cehennemden söz etmek, ateşten koruyan korkuluktur.",
    aciklama: "Uyarı ve mağfiret temalı ayetler + alev atmosferi." },
  { id: "seytan", emoji: "👻", etiket: "Şeytan & Hile",
    anahtarlar: ["seytan", "şeytan", "iblis", "iblis", "vesvese", "hile", "tuzak", "cin", "cinn", "müzzemmil", "muzemmil"],
    moods: ["imtihan", "af"], cats: ["gece", "col", "bulut"],
    satir: "Şeytanın en büyük hilesi, 'yarın' demektir.",
    aciklama: "Şeytan hilelerinden korunma temalı ayetler + karanlık gece atmosferi." },
  { id: "kalp", emoji: "🫀", etiket: "Kalp Temizliği",
    anahtarlar: ["kibir", "riya", "enaniyet", "gurur", "göbek", "nyaz", "östünme", "övgü", "nifak", "kalp", "kalbi", "gonul", "gönül"],
    moods: ["af", "huzur"], cats: ["gol", "bulut", "cicekler"],
    satir: "Kalp aynasıdır; kibir damlası düşmüşse, tevbeyle parlat.",
    aciklama: "Kibir ve riya temalı ayetler + sakin göl atmosferi." },
  { id: "ibadet", emoji: "🕌", etiket: "İbadet & Oruç",
    anahtarlar: ["ibadet", "oruç", "oruç", "ramazan", "sahur", "iftar", "teravih", "kulluk"],
    moods: ["huzur", "sukur"], cats: ["cami", "musaf", "desen"],
    satir: "Oruç, bedenin dilini kesip kalbin dilini açandır.",
    aciklama: "İbadet ve oruç temalı ayetler + cami atmosferi." },
  { id: "sadaka", emoji: "🤝", etiket: "Zekât & Sadaka",
    anahtarlar: ["zekat", "zekât", "sadaka", "infak", "hayir", "hayır", "bagis", "bağış", "yardim", "yardım", "paylaşmak", "paylaşım"],
    moods: ["sukur", "aile"], cats: ["cicekler", "gol", "orman"],
    satir: "Sadaka malı eksiltmez; bereketle büyütür.",
    aciklama: "Zekât ve infak temalı ayetler + açan çiçek atmosferi." },
  { id: "dua", emoji: "🙌", etiket: "Dua",
    anahtarlar: ["dua", "dilek", "rica", "bagir", "bağır", "yakarma", "dualar"],
    moods: ["tevekkul", "rahmet"], cats: ["gece", "cami", "gol"],
    satir: "Dua, kapıyı çalan el değil; kapının ardını bilen kalptir.",
    aciklama: "Dua ve icabet temalı ayetler + gece atmosferi." },
  { id: "yetim", emoji: "🤍", etiket: "Yetim & Şefkat",
    anahtarlar: ["yetim", "yoksul", "muhtaç", "muptac", "fukara", "garip"],
    moods: ["rahmet", "aile"], cats: ["cicekler", "orman", "gol"],
    satir: "Yetimin başına dokunan el, Arş'a değen ele benzer.",
    aciklama: "Yetim ve şefkat temalı ayetler + çiçek atmosferi." },
  { id: "selam", emoji: "🕊️", etiket: "Selam",
    anahtarlar: ["selam", "selâm", "selamet", "huzur içinde", "eslik", "eslik"],
    moods: ["huzur", "sevgi"], cats: ["gol", "desen", "cami"],
    satir: "Selam, kalpten çıkan ilk güzelliktir.",
    aciklama: "Selam ve selamet temalı ayetler + sakin göl atmosferi." },
  { id: "hidayet", emoji: "🧭", etiket: "Hidayet",
    anahtarlar: ["hidayet", "doğru yol", "sırat", "sirat", "yol göstermek", "keşif"],
    moods: ["ilim", "tevekkul"], cats: ["musaf", "yildizlar", "cami"],
    satir: "Hidayet bulan, yolunu kaybetmişin feneri olur.",
    aciklama: "Hidayet temalı ayetler + mushaf atmosferi." },
  { id: "sifa", emoji: "🌿", etiket: "Şifa",
    anahtarlar: ["sifa", "şifa", "iyileşmek", "iyiles", "hasta", "derman", "şifacı"],
    moods: ["rahmet", "huzur"], cats: ["selale", "deniz", "gol"],
    satir: "Şifa, doktorun elinde değil; vericinin iznidir.",
    aciklama: "Şifa temalı ayetler + şelale atmosferi." },
  { id: "nefes", emoji: "🌬️", etiket: "Nefes & Yaşam",
    anahtarlar: ["nefes", "yaşamak", "yasamak", "hayat", "canlı", "canli"],
    moods: ["huzur", "sukur"], cats: ["orman", "gol", "bulut"],
    satir: "Her nefes, dünyaya dağıtılmış bir hediyedir.",
    aciklama: "Yaşam ve nimet temalı ayetler + orman atmosferi." },
  { id: "yagmur", emoji: "🌧️", etiket: "Gök & Yağmur",
    anahtarlar: ["yagmur", "yağmur", "gok", "gök", "sema", "gokten", "gökten", "inmek", "hüner"],
    moods: ["rahmet", "sukur"], cats: ["bulut", "deniz", "selale"],
    satir: "Yağmur, gökyüzünün toprağa verdiği sözüdür.",
    aciklama: "Yağmur ve rahmet temalı ayetler + bulut atmosferi." },
  { id: "nur", emoji: "💡", etiket: "Nur & Işık",
    anahtarlar: ["nur", "isik", "ışık", "aydinlik", "aydınlık", "kandil", "lamba"],
    moods: ["huzur", "ilim"], cats: ["yildizlar", "gece", "cami", "musaf", "gunbatimi"],
    satir: "Nur, kalbe düşen ilk ay ışığıdır.",
    aciklama: "Nur temalı ayetler + yıldız atmosferi." },
  { id: "vakit", emoji: "⏳", etiket: "Vakit & Zaman",
    anahtarlar: ["vakit", "zaman", "saat", "an", "gun", "yil", "asir", "devir", "firsat"],
    moods: ["tevekkul", "imtihan"], cats: ["gunbatimi", "gece", "bulut", "deniz", "col"],
    satir: "Zaman, satılmayan tek hazinedir; alabildiğince al.",
    aciklama: "Vakit ve yemin temalı ayetler + gün batımı atmosferi." },
  { id: "namaz", emoji: "🧎", etiket: "Namaz",
    anahtarlar: ["namaz", "salat", "kilmak", "recat", "cemaat", "cuma", "bayram namazi"],
    moods: ["huzur", "ilim"], cats: ["namaz", "cami", "musaf", "desen", "gece"],
    satir: "Namaz, mü'minin miracıdır; gecenin sükûnetinde yükselir.",
    aciklama: "Namaz temalı ayetler + Kâbe ve cami atmosferi." },
  { id: "hac", emoji: "🕋", etiket: "Hac & Umre",
    anahtarlar: ["hac", "umre", "tavaf", "sa'y", "arem", "zikir", "tekbir", "saç", "ihram", "kurban"],
    moods: ["huzur", "af"], cats: ["namaz", "cami", "bulut", "desen"],
    satir: "Beytullah'a yürüyen her adım, bir duanın peşinden.",
    aciklama: "Hac ve umre temalı ayetler + Kâbe atmosferi." },
  { id: "hatirlat", emoji: "🔔", etiket: "Hatırlatma",
    anahtarlar: ["hatirlatma", "tezkir", "ogut", "nasihat", "uyari", "düşünmek", "düsünmek", "tefekkür", "tefekkur"],
    moods: ["ilim", "imtihan"], cats: ["musaf", "desen", "gece", "daglar", "bulut"],
    satir: "Öğüt, canlılara fayda verir; kalbin gözüyle bak.",
    aciklama: "Hatırlatma ve tefekkür temalı ayetler + mushaf atmosferi." },
  { id: "sabirla-guc", emoji: "💪", etiket: "Güç ve Yükseklik",
    anahtarlar: ["guc", "güç", "kudret", "izzet", "yukseklik", "galibiyet", "zafer", "nusrat", "destek", "yardim"],
    moods: ["zafer", "sabir"], cats: ["daglar", "yildizlar", "deniz", "kar", "bulut"],
    satir: "Güç, Yaratan'ın izniyle; zafer sabredenin hakkıdır.",
    aciklama: "Kudret ve zafer temalı ayetler + dağ atmosferi." },
  { id: "selamet", emoji: "🕊️", etiket: "Selamet",
    anahtarlar: ["selamet", "esenlik", "afiyet", "guvenlik", "korunma", "eman"],
    moods: ["huzur", "tevekkul"], cats: ["gol", "orman", "gece", "cami", "deniz"],
    satir: "Esenlik, O'na yönelen kalbin konutudur.",
    aciklama: "Selamet ve güven temalı ayetler + sakin göl atmosferi." },
  { id: "kardeslik", emoji: "🤝", etiket: "Kardeşlik",
    anahtarlar: ["kardeslik", "kardes", "birlik", "beraberlik", "ittihat", "itifak", "topluluk"],
    moods: ["sevgi", "aile"], cats: ["cami", "desen", "cicekler", "gol", "cennet"],
    satir: "Kardeşlik bir duygu değil; O'nun ipe bir sarılmaktır.",
    aciklama: "Kardeşlik ve birlik temalı ayetler + cami atmosferi." },
  { id: "hastalik", emoji: "🩺", etiket: "Hastalık & Şifa Duası",
    anahtarlar: ["hastalik", "hasta", "agri", "acı", "acri", "tedavi", "doktor", "iyilesme", "sifa duasi"],
    moods: ["rahmet", "tevekkul"], cats: ["selale", "deniz", "gol", "cicekler", "orman"],
    aciklama: "Şifa ve tevekkül temalı ayetler + şelale atmosferi.",
    satir: "Şifa, O'nun izniyle iner; dua elini hiç bırakma." },
  { id: "yolculuk", emoji: "🧭", etiket: "Yolculuk",
    anahtarlar: ["yolculuk", "sefer", "yol", "gurbet", "uzak", "memleket", "hicret"],
    moods: ["tevekkul", "huzur"], cats: ["col", "deniz", "daglar", "gunbatimi", "yildizlar"],
    satir: "Yol uzun olsa da, Yaratan yolcunun refakatçisidir.",
    aciklama: "Yolculuk ve güven temalı ayetler + çöl atmosferi." },
  { id: "risale", emoji: "📜", etiket: "Vahiy & Risale",
    anahtarlar: ["vahiy", "risale", "kitap", "mushaf", "sahife", "nur", "kindil"],
    moods: ["ilim", "huzur"], cats: ["musaf", "desen", "cami", "gece", "yildizlar"],
    satir: "Vahiy, gökten kalbe inen en büyük ihsandır.",
    aciklama: "Vahiy ve kitap temalı ayetler + mushaf atmosferi." },
];

// ── Popüler öneri çipleri (input boşken gösterilir) ────────
export const KELIME_ONERILERI: string[] = [
  "huzur", "sabır", "şükür", "tevekkül", "rahmet", "umut",
  "rızık", "dua", "deniz", "gece", "ilim", "cennet",
  "tövbe", "sadaka", "şifa", "nur", "yağmur", "ölüm",
  "namaz", "kıble", "hac", "sevgi", "aile", "anne",
  "korku", "kalp", "zikir", "cami", "oruç", "yetim",
  "vakit", "yolculuk", "kar", "yıldız", "orman", "vahiy",
];

// ── Normalize: TR harfleri ASCII'ye indirger, alt temizler ─
export function normalizeKelime(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[âÂ]/g, "a")
    .replace(/[îÎ]/g, "i")
    .replace(/[ûÛ]/g, "u")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Kelime boşluğunda düzeltilmiş arama önerisi (fallback başlığı için) */
const basHarfBuyut = (s: string): string => (s ? s.charAt(0).toLocaleUpperCase("tr") + s.slice(1) : s);

const FALLBACK_MOODS: Array<AyetKarti["mood"]> = ["huzur", "tevekkul", "sabir"];

/** Reçete bulunamadığında dürüst fallback — huzur/tevekkül/sabır havuzu */
export function fallbackRecete(kelime: string): KelimeRecete {
  const temiz = basHarfBuyut(kelime.trim().slice(0, 24)) || "Kelime";
  return {
    id: "fallback",
    emoji: "✦",
    etiket: temiz,
    anahtarlar: [],
    moods: FALLBACK_MOODS,
    cats: ["gol", "desen", "gunbatimi"],
    satir: `"${temiz}" dedin; en güzel ayetleri ve sakin bir atmosfer hazırladık.`,
    aciklama: "Bu kelime için birebir tema bulamadık — huzur, tevekkül ve sabır temalı ayetlerle yola çıktık.",
  };
}

export interface ReceteSonuc {
  recete: KelimeRecete;
  /** true = kelime bir temayla eşleşti; false = fallback kullanıldı */
  tam: boolean;
  /** Eşleşen normalize kelime (fallback'ta "") */
  eslesen: string;
}

/**
 * Kelimeye en uygun reçeteyi bulur.
 * Öncelik: tam cümle > tekil kelime (birebir) > kelime başlangıcı (çekimler: "sabirla", "denizin")
 */
export function receteBul(girdi: string): ReceteSonuc {
  const q = normalizeKelime(girdi);
  const tokenler = q.split(" ").filter(Boolean);
  const adaylar = [q, ...tokenler].filter(Boolean);
  for (const token of adaylar) {
    for (const r of KELIME_RECETELERI) {
      if (r.anahtarlar.includes(token)) return { recete: r, tam: true, eslesen: token };
    }
  }
  for (const token of adaylar) {
    for (const r of KELIME_RECETELERI) {
      const hit = r.anahtarlar.find((a) => a.length >= 3 && token.startsWith(a));
      if (hit) return { recete: r, tam: true, eslesen: token };
    }
  }
  return { recete: fallbackRecete(girdi), tam: false, eslesen: "" };
}

/** Reçeteye uygun ayetleri döndürür.
 *  ★ 2 KADEMELİ ÖNERİ:
 *  1) Kullanıcının kelimesi ayetin TÜRKÇE mealinde geçiyorsa → öne çıkar (en alakalı)
 *  2) Kalanlar mood havuzundan tamamlanır
 *  Dönen her ayet kelimeGecti işaretli gelir (UI'da "kelime ayette geçiyor" rozeti).
 */
export interface OnerilenAyet extends AyetKarti {
  /** true = kullanıcının kelimesi bu ayetin mealinde geçiyor */
  kelimeGecti: boolean;
}

export function ayetOner(recete: KelimeRecete, kelime: string, limit = 6): OnerilenAyet[] {
  const karistir = <X,>(dizi: X[]): X[] => [...dizi].sort(() => Math.random() - 0.5);
  const q = normalizeKelime(kelime);
  const gecenKelimeler = recete.anahtarlar.includes(q) ? [q] : [];

  // 1) Kelime geçen ayetler (mood havuzunda olanlar öncelikli, sonra diğerleri)
  const gecenTum = AYET_KARTILARI.filter((k) => gecenKelimeler.length > 0 && gecenKelimeler.some((w) => normalizeKelime(k.tr).includes(w)));
  const gecenMoodlu = gecenTum.filter((k) => recete.moods.includes(k.mood));
  const gecenDiger = gecenTum.filter((k) => !recete.moods.includes(k.mood));

  // 2) Mood havuzundan tamamlama
  const moodHavuzu = AYET_KARTILARI.filter((k) => recete.moods.includes(k.mood) && !gecenTum.includes(k));

  const secilen: Array<{ kart: AyetKarti; gecti: boolean }> = [
    ...karistir(gecenMoodlu).map((kart) => ({ kart, gecti: true })),
    ...karistir(gecenDiger).map((kart) => ({ kart, gecti: true })),
    ...karistir(moodHavuzu).map((kart) => ({ kart, gecti: false })),
  ];

  return secilen.slice(0, limit).map(({ kart, gecti }) => ({ ...kart, kelimeGecti: gecti }));
}
