// ════════════════════════════════════════════════════════
// KLASİKESERLER.TS — İslâmî Kitap ve Eser Kütüphanesi (yol haritası madde 15)
// Kaynak künyeleri ve yaygın baskı bilgileri; uydurma eser/isim YOK.
// Vefat tarihleri ihtilaflı olanlarda "~" kullanılır (AGENTS.md sahihlik kuralı).
// ════════════════════════════════════════════════════════

export type EserKategori = "hadis" | "tefsir" | "siyer" | "tabakat" | "fikih" | "tasavvuf" | "dil";

export type KlasikEser = {
  id: string;
  ad: string;
  muellif: string;
  vefat: string;
  kategori: EserKategori;
  ozet: string;
  onem: string;
};

export const ESER_KATEGORILERI: Array<{ id: EserKategori; ad: string }> = [
  { id: "hadis", ad: "Hadis" },
  { id: "tefsir", ad: "Tefsir" },
  { id: "siyer", ad: "Siyer ve Tarih" },
  { id: "tabakat", ad: "Tabakât ve Biyografi" },
  { id: "fikih", ad: "Fıkıh" },
  { id: "tasavvuf", ad: "Tasavvuf ve Ahlâk" },
  { id: "dil", ad: "Dil ve Sözlük" },
];

export const KLASIK_ESERLER: KlasikEser[] = [
  { id: "buhari", ad: "el-Câmiu's-Sahîh", muellif: "İmam Buhârî", vefat: "h. 256 / m. 870", kategori: "hadis",
    ozet: "Sahih hadisleri toplayan, İslâm tarihinin en çok başvurulan hadis kitabı. 100'den fazla bölümde inanç, ibadet, muâmelât ve ahlâk rivayetlerini bir araya getirir.",
    onem: "Kur'ân'dan sonra en sahih kitap kabul edilir; hadislerin sened zinciri titizlikle denetlenmiştir." },
  { id: "muslim", ad: "el-Câmiu's-Sahîh", muellif: "İmam Müslim", vefat: "h. 261 / m. 875", kategori: "hadis",
    ozet: "Buhârî'nin Sahîh'iyle birlikte 'Sahîhayn'ı oluşturan hadis derlemesi. Aynı konudaki rivayetleri bir arada vererek karşılaştırma imkânı sunar.",
    onem: "Hadisleri konu başlıkları altında toplama düzeni, sonraki hadis çalışmalarına örnek olmuştur." },
  { id: "ebu-davud", ad: "Sünen", muellif: "Ebû Dâvûd es-Sicistânî", vefat: "h. 275 / m. 889", kategori: "hadis",
    ozet: "Fıkıh konularına göre düzenlenmiş hadis kitabı; özellikle ahkâm hadisleri için temel kaynaktır.",
    onem: "Kütüb-i Sitte'nin üçüncü kitabı sayılır; müellif rivayetlerin sıhhat derecelerine dair notlar düşmüştür." },
  { id: "tirmizi", ad: "el-Câmiu's-Sünen", muellif: "İmam Tirmizî", vefat: "h. 279 / m. 892", kategori: "hadis",
    ozet: "Hadisleri sıhhat dereceleriyle (sahih, hasen, garîb) birlikte değerlendiren derleme.",
    onem: "Hadis ıstılahının erken dönem kullanımını gösteren 'ilel' notları bakımından ayrıca değerlidir." },
  { id: "nesai", ad: "Sünen", muellif: "İmam Nesâî", vefat: "h. 303 / m. 915", kategori: "hadis",
    ozet: "Ahkâm hadislerini sened tenkidiyle birlikte veren Sünen; özellikle râvî değerlendirmeleriyle tanınır.",
    onem: "Kütüb-i Sitte içinde sened tenkidine en çok yer veren eserlerden biridir." },
  { id: "ibn-mace", ad: "Sünen", muellif: "İbn Mâce", vefat: "h. 273 / m. 887", kategori: "hadis",
    ozet: "Kütüb-i Sitte'nin altıncı kitabı; fıkıh bablarına göre düzenlenmiş hadis derlemesi.",
    onem: "Diğer beş kitapta bulunmayan bazı rivayetleri içermesiyle ayrı bir başvuru kaynağıdır." },
  { id: "muvatta", ad: "el-Muvatta", muellif: "İmam Mâlik b. Enes", vefat: "h. 179 / m. 795", kategori: "hadis",
    ozet: "Medine fıkıh geleneğini hadislerle birlikte sunan erken dönem eseri.",
    onem: "Mâlikî mezhebinin temel kaynağı; hadis ile amel arasındaki ilişkiyi göstermesi bakımından önemlidir." },
  { id: "musned", ad: "el-Müsned", muellif: "Ahmed b. Hanbel", vefat: "h. 241 / m. 855", kategori: "hadis",
    ozet: "Sahâbe adlarına göre düzenlenmiş, on binlerce rivayet içeren büyük hadis derlemesi.",
    onem: "Hanbelî mezhebinin hadis temelini oluşturur; rivayet zenginliğiyle bilinir." },
  { id: "taberi-tefsir", ad: "Câmiu'l-Beyân", muellif: "Taberî", vefat: "h. 310 / m. 923", kategori: "tefsir",
    ozet: "Âyetleri sahâbe ve tâbiîn sözleriyle açıklayan, rivayet tefsirinin temel eseri.",
    onem: "Tefsir tarihinin en kapsamlı rivayet derlemelerinden biridir; isnadlarıyla birlikte nakleder." },
  { id: "ibn-kesir-tefsir", ad: "Tefsîru'l-Kur'âni'l-Azîm", muellif: "İbn Kesîr", vefat: "h. 774 / m. 1373", kategori: "tefsir",
    ozet: "Âyeti âyetle, sonra hadisle, sonra sahâbe sözüyle açıklayan rivayet ağırlıklı tefsir.",
    onem: "Rivayet tefsirinin en yaygın başvuru kaynaklarından biridir." },
  { id: "kurtubi", ad: "el-Câmi' li-Ahkâmi'l-Kur'ân", muellif: "Kurtubî", vefat: "h. 671 / m. 1273", kategori: "tefsir",
    ozet: "Ahkâm âyetlerini fıkıh boyutuyla ele alan kapsamlı tefsir.",
    onem: "Fıkhî tefsir geleneğinin temel eserlerindendir; mezhep görüşlerini karşılaştırır." },
  { id: "razi", ad: "Mefâtîhu'l-Gayb", muellif: "Fahreddîn er-Râzî", vefat: "h. 606 / m. 1210", kategori: "tefsir",
    ozet: "Kelâm ve felsefe meselelerini âyetler bağlamında tartışan geniş hacimli tefsir.",
    onem: "Akıl-vahiy ilişkisini tefsir düzleminde işleyen klasiklerdendir." },
  { id: "zemsahseri", ad: "el-Keşşâf", muellif: "Zemahşerî", vefat: "h. 538 / m. 1144", kategori: "tefsir",
    ozet: "Kur'ân'ın belâgat ve dil inceliklerini öne çıkaran tefsir.",
    onem: "Arap dili ve belâgatı açısından Kur'ân metnini incelemenin klasik örneğidir." },
  { id: "ibn-hisam", ad: "es-Sîretü'n-Nebeviyye", muellif: "İbn Hişâm", vefat: "h. 213 / m. ~828", kategori: "siyer",
    ozet: "İbn İshâk'ın siyer rivayetlerini derleyip düzenleyen temel siyer kaynağı.",
    onem: "Hz. Peygamber'in hayatına dair en erken ve en çok başvurulan metinlerdendir." },
  { id: "ibn-sad", ad: "et-Tabakâtü'l-Kübrâ", muellif: "İbn Sa'd", vefat: "h. 230 / m. 845", kategori: "tabakat",
    ozet: "Sahâbe ve tâbiînin biyografilerini tabakalar hâlinde toplayan hacimli eser.",
    onem: "Sahâbe hayatları için birincil kaynaklardan biridir; rivayetleri senedle verir." },
  { id: "vakidi", ad: "el-Meğâzî", muellif: "Vâkıdî", vefat: "h. 207 / m. 823", kategori: "siyer",
    ozet: "Gazveleri ayrıntılı biçimde anlatan erken dönem siyer-meğâzî eseri.",
    onem: "Askerî seferlerin kronolojisi için temel kaynaklardan biridir; rivayetleri ayrıca tenkide tâbidir." },
  { id: "taberi-tarih", ad: "Târîhu'r-Rusül ve'l-Mülûk", muellif: "Taberî", vefat: "h. 310 / m. 923", kategori: "siyer",
    ozet: "Yaratılış anlatısından müellifin dönemine kadar uzanan büyük tarih eseri.",
    onem: "İslâm tarih yazıcılığının temel kaynaklarından; rivayetleri senedle nakleder." },
  { id: "ibnul-esir", ad: "el-Kâmil fi't-Târîh", muellif: "İbnü'l-Esîr", vefat: "h. 630 / m. 1233", kategori: "siyer",
    ozet: "İslâm öncesinden 13. yüzyıla uzanan olayları yıl yıl anlatan tarih eseri.",
    onem: "Olayları kronolojik düzenle veren, sonraki tarihçilerin sık başvurduğu kaynaktır." },
  { id: "ibn-kesir-tarih", ad: "el-Bidâye ve'n-Nihâye", muellif: "İbn Kesîr", vefat: "h. 774 / m. 1373", kategori: "siyer",
    ozet: "Başlangıçtan müellifin dönemine uzanan, rivayetleri değerlendiren tarih eseri.",
    onem: "Tarih rivayetlerini hadis tenkidi ölçüleriyle ele almasıyla bilinir." },
  { id: "istîab", ad: "el-İstiâb fî Ma'rifeti'l-Ashâb", muellif: "İbn Abdilberr", vefat: "h. 463 / m. 1071", kategori: "tabakat",
    ozet: "Sahâbenin hayatını alfabetik olarak tanıtan biyografi eseri.",
    onem: "Sahâbe hakkındaki erken ve derli toplu kaynaklardan biridir." },
  { id: "isabe", ad: "el-İsâbe fî Temyîzi's-Sahâbe", muellif: "İbn Hacer el-Askalânî", vefat: "h. 852 / m. 1449", kategori: "tabakat",
    ozet: "Sahâbe biyografilerini tenkitli biçimde toplayan en kapsamlı eser.",
    onem: "Sahâbe araştırmalarında son sözü söyleyen başvuru kaynağı kabul edilir." },
  { id: "usdul-gabe", ad: "Üsdü'l-Gâbe fî Ma'rifeti's-Sahâbe", muellif: "İbnü'l-Esîr", vefat: "h. 630 / m. 1233", kategori: "tabakat",
    ozet: "Sahâbe biyografilerini alfabetik düzende veren kapsamlı çalışma.",
    onem: "İbn Abdilberr ve İbn Mende'nin eserlerini birleştiren geniş bir derlemedir." },
  { id: "sifatus-safve", ad: "Sıfatü's-Safve", muellif: "İbnü'l-Cevzî", vefat: "h. 597 / m. 1201", kategori: "tasavvuf",
    ozet: "Zâhid ve sâlihlerin hayatını anlatan biyografi-tasavvuf eseri.",
    onem: "İlk dönem zühd hareketini ve şahıslarını tanımak için kaynaktır." },
  { id: "riyaz", ad: "Riyâzü's-Sâlihîn", muellif: "İmam Nevevî", vefat: "h. 676 / m. 1277", kategori: "tasavvuf",
    ozet: "Ahlâk ve muâmelât konularında seçilmiş sahih hadisleri bir araya getiren eser.",
    onem: "Günlük hayata dair hadisleri konu başlıklarıyla sunmasıyla yaygınlaşmıştır." },
  { id: "nevevi-serh", ad: "el-Minhâc Şerhu Sahîh-i Müslim", muellif: "İmam Nevevî", vefat: "h. 676 / m. 1277", kategori: "hadis",
    ozet: "Müslim'in Sahîh'ini hadis ilmi ölçüleriyle açıklayan şerh.",
    onem: "Hadis şerh geleneğinin temel örneklerindendir." },
  { id: "ihya", ad: "İhyâu Ulûmi'd-Dîn", muellif: "İmam Gazzâlî", vefat: "h. 505 / m. 1111", kategori: "tasavvuf",
    ozet: "İbadet, ahlâk ve kalp amellerini dört ana bölümde ele alan eser.",
    onem: "Ahlâk ve tasavvuf literatürünün en etkili metinlerinden biridir; hadis kullanımı ayrıca tenkit edilmiştir." },
  { id: "kuseyri", ad: "er-Risâletü'l-Kuşeyriyye", muellif: "Kuşeyrî", vefat: "h. 465 / m. 1072", kategori: "tasavvuf",
    ozet: "Sûfî kavramları ve önde gelen zâhidleri tanıtan klasik risale.",
    onem: "Tasavvufun erken dönem ıstılahlarını ve şahıslarını belgeleyen kaynaktır." },
  { id: "zad", ad: "Zâdü'l-Meâd fî Hedyi Hayri'l-İbâd", muellif: "İbn Kayyim el-Cevziyye", vefat: "h. 751 / m. 1350", kategori: "siyer",
    ozet: "Hz. Peygamber'in hayatını ve sünnetini fıkıh boyutuyla ele alan eser.",
    onem: "Siyer ile fıkıh arasında köprü kuran kapsamlı çalışmalardandır." },
  { id: "itkan", ad: "el-İtkân fî Ulûmi'l-Kur'ân", muellif: "Celâleddîn es-Süyûtî", vefat: "h. 911 / m. 1505", kategori: "tefsir",
    ozet: "Kur'ân ilimlerini (nüzûl, cem, kıraat, nâsih-mensûh) sistematik biçimde anlatan eser.",
    onem: "Kur'ân ilimleri alanında ansiklopedik bir başvuru kaynağıdır." },
  { id: "lisan", ad: "Lisânü'l-Arab", muellif: "İbn Manzûr", vefat: "h. 711 / m. 1311", kategori: "dil",
    ozet: "Arap dilinin en geniş klasik sözlüklerinden biri.",
    onem: "Kur'ân ve hadis metinlerindeki kelimelerin klasik Arapça kullanımını görmek için temel kaynaktır." },
  { id: "mukaddime", ad: "el-Mukaddime", muellif: "İbn Haldûn", vefat: "h. 808 / m. 1406", kategori: "dil",
    ozet: "Toplum, devlet ve tarih yazıcılığını kuramsal düzeyde tartışan eser.",
    onem: "Sosyoloji ve tarih felsefesi açısından erken bir klasik kabul edilir." },
  { id: "risale-safii", ad: "er-Risâle", muellif: "İmam Şâfiî", vefat: "h. 204 / m. 820", kategori: "fikih",
    ozet: "Fıkıh usulünün ilk sistematik metinlerinden; delil ve hüküm çıkarma yöntemini anlatır.",
    onem: "Usûl-i fıkıh literatürünün kurucu eserlerindendir." },
  { id: "mebsut", ad: "el-Mebsût", muellif: "Serahsî", vefat: "h. 483 / m. ~1090", kategori: "fikih",
    ozet: "Hanefî fıkhını geniş biçimde açıklayan hacimli eser.",
    onem: "Hanefî mezhebinin temel kaynaklarından biridir." },
  { id: "bidayetul-muctehid", ad: "Bidâyetü'l-Müctehid", muellif: "İbn Rüşd", vefat: "h. 595 / m. 1198", kategori: "fikih",
    ozet: "Mezheplerin fıkhî görüşlerini delilleriyle karşılaştıran eser.",
    onem: "Mukayeseli fıkıh için klasik bir başvuru kaynağıdır." },
  { id: "mugni", ad: "el-Muğnî", muellif: "İbn Kudâme", vefat: "h. 620 / m. 1223", kategori: "fikih",
    ozet: "Hanbelî fıkhını delilleriyle açıklayan kapsamlı eser.",
    onem: "Hanbelî mezhebinin en geniş fıkıh kaynaklarından biridir." },
];

export const ESER_TOPLAM = KLASIK_ESERLER.length;
export const ESER_KAYNAK_NOTU =
  "Künyeler yaygın kabul gören tabakat ve neşir bilgilerine dayanır. Vefat tarihleri ihtilaflı olanlarda yaklaşık (~) işareti kullanılmıştır. Metinler Türkçe asıldır; diğer dillerde çeviri katmanı devreye girer.";
