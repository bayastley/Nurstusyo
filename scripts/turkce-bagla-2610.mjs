// ════════════════════════════════════════════════════════
// 26.10 — TÜRKÇE KALATI BAGLAMA: kullanıcı-yüzlü dosyalarda kalan
//   Turkish literalleri sozluk-ekle-2610-9.mjs anahtarlarına bağlar;
//   dosyada translate importu ve ttX köprüsü yoksa ekler.
//   Her eşleşme bağımsız — bulamazsa atlar ve rapor verir (kırmızı).
//   Çalıştırma: node scripts/turkce-bagla-2610.mjs
// ════════════════════════════════════════════════════════
import fs from "node:fs";

const DIL = "src";
const bes = ["tr", "en", "ar", "id", "ur"];

// dosya → [{eski, yeni, k}, …] ; yeni zaten ttX("k") biçiminde
const PL = (k) => `ttX2610("${k}")`;
const KAYNAK = [
  ["src/App.tsx", [["NUR STUDYO yükleniyor...", PL("appYukle").replace("ttX2610", "TX").replace("(\"appYukle\")", "(\"appYukle\")")]]],
  ["src/components/ErrorBoundary.tsx", [["Diğer bölümler çalışmaya devam ediyor.", PL("ebNot")]]],
  ["src/components/KabeCanliModal.tsx", [
    ["🕋 Kâbe — Mescid-i Haram Canlı Yayın", PL("ckBaslik")],
    ["title=\"Suudi resmî Quran TV — kesintisiz Kur'an tilaveti ve Mekke/Medine ibadet görüntüleri\"", `title={${PL("ckTitleTvl")}}`],
    ["title=\"Mescid-i Nebi (Medine) resmî Suudi Sunnah TV — kesintisiz yayın, YouTube'suz\"", `title={${PL("ckTitleNebi")}}`],
    ["🔇 Ses için ekrana dokun", PL("ckSes")],
    ["Canlı yayına bağlanıyor…", PL("ckBaglaniyor")],
    ["Yayın şu an açılamadı", PL("ckAçilamadı")],
  ]],
  ["src/components/MaintenanceScreen.tsx", [
    ["Nûr Stüdyo kısa süreli bakımda", PL("mtBaslik")],
    ["Bakım tamamlandı — site açılıyor…", PL("mtBitti")],
    ["✅ Tamam — bakım bitince bildirim alacaksın", PL("mtOk")],
    ["Güncelleme tamamlandığında site otomatik olarak açılacaktır.", PL("mtNot")],
  ]],
  ["src/components/AsistanBaloncugu.tsx", [
    ["title=\"Nûr Asistan — SSS & Yardım\"", `title={${PL("asBalonTitle")}}`],
    ["aria-label=\"Nûr Asistan Sohbetini Aç\"", `aria-label={${PL("asSohtai")}}`],
    ["💚 Ücretsiz · Anında · SSS", PL("asUcretsiz")],
    ["title=\"Başka soru çipleri getir\"", `title={${PL("asBaskaKipler")}}`],
    ["aria-label=\"Başka soru çipleri getir\"", `aria-label={${PL("asBaskaKipler")}}`],
    ["placeholder=\"Sorunuzu yazın…\"", `placeholder={${PL("asPlaceholder")}}`],
    ["aria-label=\"Gönder\"", `aria-label={${PL("asGonder")}}`],
  ]],
  ["src/components/SiteHakkindaModal.tsx", [
    ["Siteyi 2 dakikada tanı — girince aç, izleyin", PL("shTanitim")],
    ["title=\"Nûr Stüdyo Tanıtım Videosu\"", `title={${PL("shVideoTitle")}}`],
  ]],
  ["src/components/QuranLearnModal.tsx", [
    ["Gözlerini dinlendir… ses sürüyor · kilit ekranından kontrol edebilirsin", PL("qkKilitUyku")],
    ["title=\"Mescid-i Haram'dan 7/24 kesintisiz canlı yayın\"", `title={${PL("qkKabeTitle")}}`],
    ["title=\"Mushaf sayfaları — büyüt/küçült, tam ekran, kaldığın yerden devam + hatim sayacı\"", `title={${PL("qkMushafTitle")}}`],
    ["title=\"Devamını getir: ayetin yarısını gösterir, sen tamamını seç\"", `title={${PL("qkDevamTitle")}}`],
    ["title=\"Nûr Araçları — hatim takibi, sevap sayacı, zikirmatik\"", `title={${PL("qkAraclarTitle")}}`],
    ["title=\"Radyo kanalı seç\"", `title={${PL("qkRadyoSec")}}`],
  ]],
  ["src/components/quranLearnVeri.tsx", [
    ["Tefsir yükleniyor…", PL("tfYukle")],
    ["Bu ayet için bu tefsirde metin bulunamadı — başka tefsir seç.", PL("tfBulunamadi")],
  ]],
  ["src/components/kesfetDuaBolumu.tsx", [
    ["Duruma göre dualar — ✓ ile okundu işaretle (takibin cihazında kalır)", PL("ksfDuaNot")],
    ["🌟 GÜNÜN DUASI", PL("ksfGununDua")],
  ]],
  ["src/components/kesfetSekmeler.tsx", [
    ["⚠️ Buradaki cevaplar genel bilgi amaçlıdır — kendi fetvamızı vermeyiz, Diyanet'e", PL("ksfUyari")],
    ["🌟 GÜNÜN KELİMELERİ", PL("ksfGunun")],
    ["her gün 5 yeni kelime — günlük seçim cihazının tarihine göre", PL("ksfGununNot")],
    ["title=\"Genişlet\"", `title={${PL("ksfGenislet")}}`],
    ["Aradığın sure listede yok — Arapça adıyla da deneyebilirsin (örn. الملك) ya da n", PL("ksfSureBulunamadi")],
  ]],
  ["src/components/HafizlikTestiModal.tsx", [
    ["aria-label=\"Turun soru soru doğruluk grafiği\"", `aria-label={${PL("htGrafikTitle")}}`],
    ["title=\"Kur'an Öğren/Dinle ekranına dön\"", `title={${PL("htDonLinki")}}`],
    ["Kaldığın yerden devam", PL("htDevam")],
  ]],
  ["src/components/hafizlikGrafigi.tsx", [["aria-label=\"Son 20 sorunun doğruluk çizgisi\"", `aria-label={${PL("htGrafik20")}}`]]],
  ["src/components/KelimeAtolyesiModal.tsx", [["yaklaşık eşleşme", PL("yaklasikVurus")]]],
  ["src/components/ArkaPlanUreticiModal.tsx", [["yaklaşık eşleşme", PL("yaklasikVurus")]]],
  ["src/components/seslendirmeKontroller.tsx", [
    ["📖 KÜTÜPHANE &amp; AYET ARAMA", PL("skKutuphane")],
    ["📚 Tüm Sureyi Ekle", PL("skSureEkle")],
    ["title=\"Bölüm sayısını azalt — fazla parçalar komşu birleşimiyle birleşir\"", `title={${PL("skAzalt")}}`],
    ["title=\"Tüm bölümleri tek seferde temizle\"", `title={${PL("skTemizle")}}`],
    ["title=\"Bu bölümü dinle — aynı zaman arka plan paneli de açılır\"", `title={${PL("skDinle")}}`],
    ["🔊 SESLENDİR", PL("skSeslendir")],
    ["title=\"Bölümleri (yoksa seçili ayet/meti) tek ses dosyası olarak indir (WAV — tamamı işlenemezse parçalı uyarı verir)\"", `title={${PL("skIndir")}}`],
    ["title=\"Bölümlerin atmosferini zekice yeniden seç — emin olmadığını Musaf yapar\"", `title={${PL("skAkilliAI")}}`],
    ["🤖 Akıllı AI", PL("skAI")],
  ]],
  ["src/components/SeslendirmeModal.tsx", [
    ["SESLİ MEAL", PL("smBaslik")],
    ["Seslendirme şu an geliştirme özelliği", PL("smGelistirme")],
    ["çalıştır → sayfayı yenile", PL("smAksiyon")],
  ]],
  ["src/components/OnerilenVideolar.tsx", [
    ["bugün hazır", PL("ovBugun")],
    ["title=\"Yeni taslaklar öner\"", `title={${PL("ovOnerTitle")}}`],
    ["tek tıkla üretim", PL("ovTekTik")],
  ]],
  ["src/components/studioAppBolumler.tsx", [
    ["Yüksek Telif Riski", PL("rsRiskYuksek")],
    ["Bilgilendirilmiş onay gerekiyor", PL("rsOnay")],
    ["YÜKSEK", PL("rsYuksek")],
    ["• YouTube/Instagram vb. platformlarda Content ID telif uyarısı alabilirsiniz", PL("rsYoutube")],
    ["• Video kaldırılabilir veya kanalınız tehlikeye girebilir", PL("rsKalkabilir")],
    ["• Tüm yayın sorumluluğu size aittir (Nûr Stüdyo hukuki sorumluluk kabul etmez)", PL("rsSorumluluk")],
    ["Üretim Onayı", PL("rsOnayBaslik")],
    ["Üretim türü", PL("rsTur")],
    ["Format sayısı", PL("rsFormat")],
    ["Üretim sonrası", PL("rsSonra")],
  ]],
  ["src/components/KendiSesModal.tsx", [
    ["🕌 Hanım kardeşlerimiz için hatırlatma", PL("ks2Hanim")],
    ["KENDİ SESİNLE ÜRET", PL("ks2Baslik")],
    ["🎙️ Tüm Sure Ses", PL("ks2TamSure")],
    ["🔢 Ayet Başına", PL("ks2AyetBasi")],
    ["ELİT ÜYELİK GEREKLİ", PL("ks2Elit")],
    ["Kendi okuyuşunla video üret, ayet geçişleri sesine birebir senkron olsun. Her ay", PL("ks2ElitM")],
    ["Şimdilik kapat", PL("ks2Kapat")],
    ["— Sure seç —", PL("ks2SecSure")],
    ["⏱ Maks süre", PL("ks2Maks")],
    ["0 sn = mod sınırı (kısa 59 · uzun 600 · tam 7200) — sınırın fazlası üretimde kul", PL("ks2SureNot")],
  ]],
];

// briding adı her dosyada tek seferlik
function ttEklemesiGerekli(metin) {
  return !metin.includes("ttX2610(");
}

const rapor = [];
for (const [dosya, repl] of KAYNAK) {
  if (!fs.existsSync(dosya)) { rapor.push(`⛔ ${dosya} YOK`); continue; }
  let m = fs.readFileSync(dosya, "utf8");
  const orijinal = m;
  let bag = 0;
  for (const [eski, yeni] of repl) {
    if (m.includes(eski)) { m = m.split(eski).join(yeni); bag++; }
  }
  // ★ ttX köprüsü: her dosyada bir kez
// ★ 26.10 I18N KÖPRÜSÜ koşulu düzeltildi: replaceler ttX2610'i metne EKLEDİĞİ için
  //   eski kontrol (m includes ttX2610) her zaman false'a düşüyordu — köprü hiç
  //   eklenmiyordu. Doğru yöntem: orijinal metne bak.
  // ★ 2. turda replaceler artık bulunmaz (bag=0) ama köprü hâlâ eksik olabilir:
  //   kuralı "metin ttX2610 kullanıyor ama köprü yok" yapalım.
  if (m.includes("ttX2610(") && !m.includes("const ttX2610 =")) {
    const satirlar = m.split("\n");
    const translateVar = /import[^;\n]*\btranslate\b[^;\n]*from/.test(m);
    let eklendi = false;
    for (let i = 0; i < Math.min(satirlar.length, 60); i++) {
      // sadece import satırından sonraya ekle
      if (/^import /.test(satirlar[i]) || satirlar[i].trim() === "") continue;
      const yol = dosya === "src/App.tsx" ? "./i18n" : "../i18n";
      const bridge = (translateVar ? "" : `import { translate } from "${yol}";\n`) +
        `// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur\nconst ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);\n`;
      satirlar.splice(i, 0, bridge);
      eklendi = true;
      break;
    }
    if (!eklendi) rapor.push(`⚠ ${dosya}: import ekleme noktası bulunamadı`);
    m = satirlar.join("\n");
  }
  if (m !== orijinal) {
    fs.writeFileSync(dosya, m, "utf8");
    rapor.push(`✓ ${dosya}: ${bag}/{${repl.length}} bağlandı`);
  } else {
    rapor.push(`· ${dosya}: her şeyi zaten bağlı`);
  }
}
console.log(rapor.join("\n"));
