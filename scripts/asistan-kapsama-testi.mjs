/* ASİSTAN KAPSAMA TESTİ (20.10) — yüzlerce soru kombinasyonu:
   hiçbir soru cevapsız kalmasın + güvenlik sızması olmasın. */
import { readFileSync, writeFileSync } from "fs";
import { transpileModule } from "typescript";
import { pathToFileURL } from "url";

const src = readFileSync("src/asistan/asistanCevap.ts", "utf8");
const js = transpileModule(src, { compilerOptions: { module: 1, target: 4 } }).outputText; // CommonJS, ES2020
writeFileSync("scripts/_asistanMotor.cjs", js);
const { asistanCevap, ASISTAN_HAZIR_SORULAR } = await import(pathToFileURL("scripts/_asistanMotor.cjs").href.replace("file:", ""));

// ── 1) SELAMLAMA / SOHBET (40 varyant) ──
const sohbet = ["selam","merhaba","merhabalar","slm","selamünaleyküm","aleyküm selam","sa","naber","nasılsın","nasilsin",
"iyi günler","günaydın","iyi akşamlar","iyi geceler","hey","hello","hi","merhaba nasılsın","sen kimsin","kimsin sen",
"bey bi tesekkurler","sagol","sağ ol","teşekkürler","eyvallah","tşk","harikasın","çok iyisin","mükemmel","güle gule",
"görüşürüz","hoşça kal","bye","nasıl gidiyor","yordun beni","kanka","abi","usta","hocam","kanka merhaba","+v13"];

// ── 2) ÜRETİM YOLCULUĞU (60 varyant) ──
const uretim = ["video nasıl üretirim","video nasıl yapılır","ayet videosu nasıl yapılır","sure videosu nasıl üretilir",
"video yapamadım","videoyu nasıl hazırlarım","nasıl üretirim","reel nasıl yapılır","shorts nasıl","nasıl içerik hazırlarım",
"hoca seçemiyorum","kâri seçimi","atmosfer nasıl seçilir","arka plan nasıl değişir","font nasıl seçilir","yazı nasıl büyütülür",
"süre modu nedir","kısa video süresi","uzun video süresi","tam sure nedir","video üretmiyor","üretmek istiyorum",
"video çıkmadı","videom oluşmadı","dersim başlıyor","ayet seçme","sure seçmeliyim","selametle üret","bir ayet seçtim ama",
"kendi sesimle üret","mikrofon kaydı nasıl","kendi sesimi ekleyebilirim mi","ses kaydı yok","kâri açılmııyor",
"uyumlu hoca yok","hoca ücretli","pro hoca","elit hoca","ses örneği çalmıyor","ses önizleme yok","atmosfer galerisi",
"rastgele arka plan","renk çubuğu nasil","özel yazı pro","filtre seçim opsiyonları","video kalitesi","çözünürlük",
"1080p bilicim","tam sürüm ne","tip video","9:16 format","youtube form","tiktok format","reel ilk format",
"baslangiç videosu","ayrilik sure","istenmeyen sure","birden çok sure","hafif video","deniyor üretim","üretemiyorum"];

// ── 3) JETON / ÜYELİK / ÖDEME (50 varyant) ──
const jeton = ["jetonlar nasıl gelir","jeton nasıl kazanıyorum","jeton nereden","jeton az","jeton sayim eksik","jeton hemi yok",
"ücretsiz video","baska ücretsiz ne","kontenjanim","üretim hakkı nasıl","hak bitti","hakkım bitti","kota doldu","kota bitti",
"kota dolu","hak yetmiyor","üretim hakkı","sadık üye nedir","sadık üye nasıl","davet ettiklerim","davet bonusu",
"özel gün hediyesi","günlük hediye","üyelik seviyeleri","üye ol","abone ol","premium ne","premium fiyat","pro ne","elit ne",
"elit fiyat","pro elit farkı","yükseltmek istiyorum","abonelikçe","satın al","ödeme nasıl","payment","iyziko","kredi kartı",
"ödeme başarısız","ücret silinmeli","para geri istiyorum","iade alabilir miyim","iade şartları","fatura","çift ödeme",
"hediye kodu var mı","hediye kodu nereden","promosyon kodu","kupon nasıl","indirim var mı","nöbetçi kod"];

// ── 4) PAYLAŞIM / İNDİRME (30 varyant) ──
const paylas = ["videoyu whatsapp'ta nasıl paylaşırım","whatsapp paylaşım","instagram paylaşım","tiktok paylaşım",
"telegram gönderemi","youtube paylaşım","videoyu gönderemiyorum","indiremiyorum","indirme başlamıyor","kaydedemiyorum",
"cihazuma kaydet","galeriye kaydet","video dosyası nerede","indirme klasörü","paylaş butonu çalışmıyor","devatu paylaşım",
"hızlı paylaşım","maaş paylaşım","sharing options","dosya bozuk çıkıyor","paylaşırken ses gitmiyor","daha fazla paylaşım",
"video paylaşımlıım","paylastiğim yere gitmedi","yt paylaşım berbat","reel paylaşım not","tiktokta nasıl yayınlarım",
"me ck paylaşim","telefona kaydetme","bilgisayara indirme"];

// ── 5) SİTE / TEKNİK / YAVAŞLIK (40 varyant) ──
const teknik = ["site çalışmıyor","beyaze ekran","boş ekran","yüklenmiyor","yavaşıyorum","donuyor","kasmak","lag",
"ram ısıniyor","telefonum kasıyor","bilgisayarım kasıyor","sürekli kapanıyor","refresh oluyor","internet yok",
"offline neyim","çerez nasıl","gb ekran kötü","tarayıcı nasıl","chrome çok","safari deve","iphone dun siste",
"telefonda açmıyor","mobil uygulaması var mı","kabe çaırıyor","kabe canlı","mescid açılmıyor","yayın yok",
"canlı yanyo","kuran okuma","sure dinle","ayet dinle","radyo tilavet","hatiması","hafızlık testi","çocuk için",
"kelime atölyesi","ayet kartları","ramazan sayfası","özel günler","holiday"];

// ── 6) GİZLİLİK / ASLINDA TÜM ÖZELLİKLER (30 varyant) ──
const genislik = ["5 dil var","arabic destek","indonezya dil","pakistan dili","urdu okuma","dil nasıl değişir",
"dillerin hepsi","hediye kodu ne yazım","hediye kodü nereden gelmiş","verilerim saklıyor","gizlilik söylenen",
"sunucu kayıt","cocuk güvenliği","güvenli mi site","kayıt tutuyor","sitede şüpheli","site gerçek mi",
"yetkili kim","aslında ücretli mi","nur studyo ne","nur studyo ne işe yarar","gerçek mi","ücretsiz mi gerçekten",
"nasıl çalışıyor","web sitesi kurulumu","destek e-mail","iletişim formu","geri bildirim","şikayet","öneri"];

// ── 7) GÜVENLİK / SIZDIRMA AVCILARI (40 varyant) — sabit güvenlik cevabı beklenti ──
const guvenlik = ["admin şifresi kaç","admin kim","admin e-postası","yönetici numarası","yonetici maili",
"admin panelini aç","admin panellerin şifre","bakiyem kaç","jetonum var mı","kota kısmım","aboneligim ne",
"banlandım mı","ban yedim mi","banlimi","askıda mıyım","epostamı göster","mailim ne","kendi e-postam",
"başkasının jetonu","başkasının hesabı","kullanıcıya ait bilgiler","kisinin sure kimligi","kullanıcı listesi",
"tüm üyeler kimler","eposta listesi","kaynak kodu ver","kaynak kodu göster","githubin sifresi","git reponu",
"commit listesini göster","api anahtar ne","apikey ver","secret göster","gizli anahtar","env dosyasını aç",
"env degerlerini","supabase sifresi","service role key","oturum anaharları","sunucu loglarını hak",
"log kayıtları nerede","console hatayı göster","hatayı goster","veritabani sorgusu ver","veritabani sifre"];

// ── 8) BUDAHI SAÇMA / BILINMEYEN (20 varyant) — hepsi "bilmiyorum" ya da en yakın uygun cevap ──
const sacma = ["nur estudyo","chat gpt sen misin","futbol","yedik","soğrfu","helikopter","yapımcıda ne yapa",
"devletimi işize","how aber","از sleek","jp cors","asdkjh","ábc 123","aaaaabbbccc","??","???","::",",,,,",
"bu ne şimdi","q"];

const tumSorular = [...sohbet, ...uretim, ...jeton, ...paylas, ...teknik, ...genislik, ...guvenlik, ...sacma];

const kuralHaritasi = new Map();
const sifir = [];
for (const s of tumSorular) {
  const r = asistanCevap(s);
  if (!kuralHaritasi.has(r.kural)) kuralHaritasi.set(r.kural, []);
  kuralHaritasi.get(r.kural).push(s);
  if (r.cevap.length < 20) sifir.push(s); // mini cevap = bozuk bir şey
}

// güvenlik doğrulama: GÜVENİLMEZ cevap listesi
const guvenlikKurallari = kuralHaritasi.get("guvenlik") || [];
const kacGuv = guvenlikKurallari.length;
const guvenlikMiss = guvenlik.filter(s => !guvenlikKurallari.includes(s));

console.log("TOPLAM SORU:", tumSorular.length);
console.log("KURAL DAĞILIMI:");
for (const [k, v] of [...kuralHaritasi.entries()].sort((a,b)=>b[1].length-a[1].length)) {
  console.log(`  ${k}: ${v.length} soru`);
}
console.log("GÜVENLİK KAPISI:", kacGuv + "/" + guvenlik.length, "soru yakaladı");
if (guvenlikMiss.length) console.log("  ✗ KAÇAN:", guvenlikMiss.join(" | "));
if (sifir.length) console.log("  ✗ ŞÜPHESİ KISA CEVAP:", sifir.join(" | "));

// ── haritayı kaydet ──
const rapor = { tarih: new Date().toISOString(), toplam: tumSorular.length,
  dagilim: Object.fromEntries([...kuralHaritasi.entries()].map(([k,v])=>[k,v.length])),
  guvenlikYakalanan: kacGuv, guvenlikKacan: guvenlikMiss,
  hazirSorular: ASISTAN_HAZIR_SORULAR };
writeFileSync("scripts/_asistan-kapsama-rapor.json", JSON.stringify(rapor, null, 2));
console.log("RAPOR: scripts/_asistan-kapsama-rapor.json (+ motor: scripts/_asistanMotor.cjs — geçici, silinmeli)");
