// MEZHEPLERDATA.TS — 02.11 (kullanıcı emri)
// Üstte 4 hak mezhep; tıklayınca eksiksiz özellikleri gösterilir.
// Kaynaksız hiçbir bilgi yazılmaz; kaynak yerine klasik kitaplardır.
// Kullanılan kaynaklar:
//   el-Fıkhu'l-Ekber · el-Hidâye · Fethu'l-Kadîr (Hanefî)
//   el-Muvatta · el-Mudavvene (Mâlikî)
//   er-Risâle · el-Um (Şâfi'î)
//   el-Müsned · el-Muğni (Hanbelî)
//   İbn Hallikân, Vefeyâtu'l-A'yân (tabakât bilgileri).

export interface MezhepKaydi {
  id: string;
  ad: string;
  imam: string;
  imamKisa: string;
  usul: string[];
  ozellikler: string[];
  temelKitaplar: string;
  kaynaklar: string;
}

export const MEZHEPLER: MezhepKaydi[] = [
  {
    id: "hanefi",
    ad: "Hanefîlik",
    imam: "Ebu Hanîfe Nu'man b. Sâbit (80-150 H.)",
    imamKisa: "Kûfe'de doğup yetişti; Hammad b. Ebî Süleyman'ın öğrencisi; İbn Mes'ûd (r.a.) çizgisini sürdürdü.",
    usul: [
      "Kur'an: nâsıh âyetler kesin hüküm verir.",
      "Sünnet: sahih ve meşhûr rivâyetler esas alınır.",
      "İcma': sahabenin ittifakına dayanan görüş.",
      "Kıyas: nassın hükmü benzer olaya taşınır.",
      "İstıhsân ve âdet: kıyasın sert sonucunu yumuşatan âdet hükmü.",
    ],
    ozellikler: [
      "Abdestin dört farzı: yüzü yıkamak, kolları dirseğe kadar yıkamak, başın dörtte birini mesh, ayakları yıkamak.",
      "Namazın rekât sayıları: sabah 2, öğle 4, ikindi 4, akşam 3, yatsı 4.",
      "Zekât: mal nisâb'a ulaşır ve bir yıl geçerse 1/40 oranında verilir.",
      "Vitir namazı vâciptir; bayram namazları farz-ı ayndır.",
    ],
    temelKitaplar: "el-Fıkhu'l-Ekber · el-Hidâye · Fethu'l-Kadîr",
    kaynaklar: "Ebû Hanîfe el-Fıkhu'l-Ekber; el-Mergînânî el-Hidâye; İbnü'l-Humâm Fethu'l-Kadîr",
  },
  {
    id: "maliki",
    ad: "Mâlikîlik",
    imam: "İmam Mâlik b. Enes (93-179 H.)",
    imamKisa: "Medine'de doğup yetişti; Nâfi', ez-Zühri gibi büyüklerin öğrencisi; Medine ameline dayanır.",
    usul: [
      "Kur'an ve Sünnet: nass önce gelir.",
      "Medine ameli: icmâ' sayılır (el-Muvatta).",
      "Mesâlih-i mürsele: zarar verecek hüküm engellenir.",
      "İstishâb ve âdet: durumu koruyan bölgesel âdet.",
    ],
    ozellikler: [
      "Namaz: Fâtihâ'dan sonra sure okunur.",
      "Abdest: dört farz sağdır.",
      "Zekât: mal nisâb'a ulaşırsa sekiz kısım.",
    ],
    temelKitaplar: "el-Muvatta · el-Mudavvene",
    kaynaklar: "Mâlik b. Enes, el-Muvatta; Sahnûn, el-Mudavvene",
  },
  {
    id: "safii",
    ad: "Şâfi'îlik",
    imam: "İmam Şâfi'î (150-204 H.)",
    imamKisa: "Gazze'de doğdu, Mekke'de yetişti; Medine'de İmam Mâlik'in öğrencisi oldu; ardından Bağdat ve Mısır'da ders verdi.",
    usul: [
      "Kur'an ve Sünnet: nâsıh önce gelir.",
      "İcma' ve kıyas: Risâle'de açıklanır.",
      "İstihsân reddedilir; nâsın dışına yol açmaz.",
    ],
    ozellikler: [
      "Namaz: secdelerde üç kez tesbih.",
      "Abdest: belirtilen organları tam yıkamak.",
      "Zekât: nisâb'a ulaşırsa sekiz kısım.",
    ],
    temelKitaplar: "er-Risâle · el-Um",
    kaynaklar: "İmam Şâfi'î, er-Risâle; el-Um",
  },
  {
    id: "hanbeli",
    ad: "Hanbelîlik",
    imam: "İmam Ahmed b. Hanbel (164-241 H.)",
    imamKisa: "Bağdat'ta doğup yetişti; İmam Şâfi'î'nin öğrencisi; hadisleri toplayıp Müsned'ini yazdı.",
    usul: [
      "Kur'an ve Sünnet: nass önce gelir.",
      "Sahabe kavli: sahih rivâyetler esas.",
    ],
    ozellikler: [
      "Namaz: rükû ve secdelerde üç kez tesbih okunur.",
      "Abdest: dört farz; yüz, kollar, baş, ayaklar.",
    ],
    temelKitaplar: "el-Müsned · el-Muğni",
    kaynaklar: "İmam Ahmed b. Hanbel, el-Müsned; İbn Kudâme, el-Muğni",
  },
];
