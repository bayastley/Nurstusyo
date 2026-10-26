// ════════════════════════════════════════════════════════
// 26.10 E TURU (2. geçiş) — düz metin eşleştirme, tüm src
// ════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";

const MAP = [
  ["Admin yetkisi için sunucuya ulaşılamadı", "adAdminSunucu"],
  ["Bakım bitiş saati başlangıçtan sonra olmalı", "abBakimSaat"],
  ["Başlık ve kısa mesaj zorunlu", "abBaslikMesaj"],
  ["Bu işlem tek tuşla geri alınamaz — kilitleri tek tek ayarla", "abTekKlikGeriAl"],
  ["Eski kayıtlar temizlendi", "abEskiKayitlar"],
  ["Google ile admin hesabınızdan giriş yapın", "abGoogleAdmin"],
  ["Konu ve içerik gerekli", "abKonuIcerik"],
  ["Lütfen GitHub Personal Access Token giriniz.", "abGithubToken"],
  ["Lütfen bir hedef seçin", "abHedefSec"],
  ["Lütfen modül başlığı giriniz.", "abModulBaslik"],
  ["Sunucuya ulaşılamadı", "asSunucu"],
  ["Sıfırlama başarısız", "abSifirlamaHata"],
  ["Tüm hata kayıtları silindi", "abHataKayitlari"],
  ["Ödeme sayfası açılamadı", "udSayfaAcilmadi"],
  ["Ödeme servisine ulaşılamadı", "udServis"],
  ["Önce en az bir ayet seçin — senkron seçtiğin ayetlere kurulur", "ksOnceAyetSenkron"],
  ["Üretim kullanıcı tarafından iptal edildi", "udKullaniciIptal"],
  ["Şifreniz sıfırlandı!", "udSifreSifirlandi"],
  ["⏳ Ödeme sayfası hazırlanıyor...", "udOdemeHazirlaniyor"],
  ["⚙️ Google girişi için Client ID tanımlanmalı (.env → VITE_GOOGLE_CLIENT_ID)", "abGoogleClientId"],
  ["⚠️ Aramak için bir e-posta adresi gir", "adEmailGir"],
  ["⚠️ Bitiş zamanı geçmiş — site bakıma girmez, ileri bir saat seç", "abBitisGecmis"],
  ["⚠️ Bu kaydın zamanlamaları eski taramadan kalma ve sesin süresini aşıyor — '🔬 Yeniden analiz et' ile düzelt", "ksEskiZamanlama"],
  ["⚠️ Geçerli bir e-posta adresi gir", "adGecerliEmail"],
  ["⚠️ Hediye miktarı 0'dan büyük olmalı", "abHediye0"],
  ["⚠️ Sunucuya ulaşılamadı", "udSunucu"],
  ["⚠️ Tarayıcınız güvenli Google girişi için gerekli PKCE desteğini sağlamıyor", "uaPkce"],
  ["⛔ Kendi oturum hesabınızı banlayamazsınız.", "adOturumBan"],
  ["⛔ Kurucu Admin hesabı banlanamaz!", "adKurucuBan"],
  ["⛔ Sadece Kurucu Admin ban kaldırma yetkisine sahiptir.", "adBanKaldirma"],
  ["✅ Duyuru bu cihazda yayınlandı (Supabase erişimi yok — admin girişi gerekli)", "abDuyuruCihaz"],
  ["✅ Duyuru tüm kullanıcılara yayınlandı", "abDuyuruYayin"],
  ["✏️ Özel Yazı PRO üyelere açık — premium sayfası açıldı", "vpOzelYaziPro"],
  ["✨ Akıllı AI ELİT özelliğidir — üyelik sayfasından Elite yüksel", "akElitOzellik"],
  ["✨ Modül durumu güncellendi!", "abModulDurum"],
  ["❌ Sunucuya ulaşılamadı — hak verilemedi", "udHakVerilemedi"],
  ["❌ Sunucuya ulaşılamadı — hediye tamamlanamadı", "udHediyeTamamlanamadi"],
  ["🎨 Renk Çubuğu PRO üyelere açık — premium sayfası açıldı", "vpRenkPro"],
  ["👑 Kendi sesinle üretim ELİT üyelere özel — premium sayfasına yönlendiriliyorsun", "vpKendiSesElit"],
  ["👑 Kendi sesinle üretim NÛR ELİT'te — premium panel açıldı", "vpKendiSesElitPanel"],
  ["🔊 Ses seçildi · Daha doğal ses için Microsoft Edge kullan (Emel/Ahmet sesleri)", "ksEdgeSes"],
  ["🔍 Supabase'de aranıyor...", "adSupabaseAra"],
  ["🔐 Bu özellik üyelere özel — önce giriş yap / üye ol!", "vpLoginGerekli"],
  ["🔐 Ödeme için giriş yapmalısınız", "udLoginOdeme"],
  ["🔒 Kendi Sesinle Üret yakında geliyor — hazır olduğunda duyurulacak!", "vpYakinda"],
  ["🗑️ Tüm duyurular kaldırıldı · Sayfa yenilenince tümünde gider", "abDuyuruSil"],
  ["🧹 V3 (uzun vadeli) listesi boşaltıldı — V2 oylaması ve oylar korundu", "abV3Bosaltildi"],
];

const KO = `// ★ 26.10 I18N KÖPRÜSÜ: oturumun dilini her çağrıda okur
const ttX2610 = (k: string): string => translate(typeof localStorage !== "undefined" ? (localStorage.getItem("nur_lang") || "tr") : "tr", k);`;

function tasir(metin) {
  if (metin.includes("const ttX2610 =")) return metin;
  if (!metin.includes('from "../i18n"') && !metin.includes('from "./i18n"')) {
    metin = `import { translate } from "../i18n";\n` + metin;
  }
  const m = metin.match(/^import[\s\S]*?;\n/m);
  metin = m ? metin.replace(m[0], m[0] + KO + "\n") : KO + "\n" + metin;
  return metin;
}

const KOK = "src";
let ok = 0, hata = 0;
const dosyalar = new Set();
const taranir = (dir) => {
  for (const oge of fs.readdirSync(dir, { withFileTypes: true })) {
    const y = path.join(dir, oge.name);
    if (oge.isDirectory()) taranir(y);
    else if (/\.(ts|tsx)$/.test(oge.name)) {
      let metin = fs.readFileSync(y, "utf8");
      let degismi = false;
      for (const [lit, k] of MAP) {
        const bul = `notify("${lit}")`;
        if (metin.includes(bul)) {
          const yeni = `notify(ttX2610("${k}"))`;
          if (!metin.includes(yeni)) { metin = metin.split(bul).join(yeni); degismi = true; ok++; }
          else ok++;
        } else if (metin.includes(`notify(\`${lit}\`)`)) {
          metin = metin.split(`notify(\`${lit}\`)`).join(`notify(ttX2610("${k}"))`);
          degismi = true; ok++;
          console.log("⚠️ backtick:", path.relative(KOK, y), k);
        }
      }
      if (degismi) {
        metin = tasir(metin);
        fs.writeFileSync(y, metin);
        dosyalar.add(path.relative(KOK, y));
      }
    }
  }
};
taranir(KOK);
console.log(`BAĞLAMA: ${ok} değişim · ${hata} bulunamadı · ${dosyalar.size} dosya`);
for (const d of dosyalar) console.log("  •", d);
