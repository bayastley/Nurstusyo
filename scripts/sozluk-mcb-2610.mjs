// ★ 26.10 — Giriş/Tam sürüm modal anahtarlarını 5 sözlüğe ekler
import fs from "node:fs";

const K = {
  tr: {
    mcbHosGeldinAlt: "Telifsiz sinematik Kur\u2019an videolar\u0131 \u00FCretin ve payla\u015F\u0131n",
    mcbGoogleDevam: "Google ile Devam Et",
    mcbAdminGeriDon: "ADMIN OLARAK GER\u0130 D\u00D6N",
    mcbHesapNotu: "Yeni hesap \u2192 otomatik olu\u015Fturulur \u00B7 Mevcut hesap \u2192 do\u011Frudan girilir",
    mcbSifreGerekmez: "\u015Eifre gerekmez \u00B7 An\u0131nda",
    mcbHediyeKelime: "hediye",
    mcbKvkkRiza: "Yeni \u00F6zellikler, indirim ve hat\u0131rlatmalardan haberdar olmak i\u00E7in e-posta almak istiyorum. (\u0130ste\u011Fe ba\u011Fl\u0131, diledi\u011Finiz zaman iptal edebilirsiniz.)",
    mcbMisafirDene: "\u00DCye Olmadan Dene",
    mcbDenemeKalan: "deneme videosu kald\u0131",
    mcb6Haneli: "6 haneli kod",
    mcbKapat: "Kapat",
    mcb40Dakika: "40 dakikaya kadar video modu",
    mcbMevcutBakiye: "Mevcut bakiye",
    mcbOdeVeAc: "\u00DCretim hakk\u0131 \u00D6de ve A\u00E7",
  },
  en: {
    mcbHosGeldinAlt: "Create royalty-free cinematic Qur'an videos and share them",
    mcbGoogleDevam: "Continue with Google",
    mcbAdminGeriDon: "RETURN AS ADMIN",
    mcbHesapNotu: "New account \u2192 auto-created \u00B7 Existing account \u2192 direct login",
    mcbSifreGerekmez: "No password needed \u00B7 Instantly",
    mcbHediyeKelime: "gift",
    mcbKvkkRiza: "I would like to receive e-mail updates about new features, discounts and reminders. (Optional, can be cancelled at any time.)",
    mcbMisafirDene: "Try Without Signing Up",
    mcbDenemeKalan: "trial videos left",
    mcb6Haneli: "6-digit code",
    mcbKapat: "Close",
    mcb40Dakika: "Video mode for up to 40 minutes",
    mcbMevcutBakiye: "Current balance",
    mcbOdeVeAc: "Production Right Pay & Unlock",
  },
  ar: {
    mcbHosGeldinAlt: "\u0623\u0646\u0634\u0626 \u0648\u0634\u0627\u0631\u0643 \u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u0642\u0631\u0622\u0646\u064A\u0629 \u0633\u064A\u0646\u0645\u0627\u0626\u064A\u0629 \u0628\u0644\u0627 \u062D\u0642\u0648\u0642 \u0645\u0644\u0643\u064A\u0629",
    mcbGoogleDevam: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0639\u0628\u0631 Google",
    mcbAdminGeriDon: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0643\u0645\u0633\u0623\u0648\u0644",
    mcbHesapNotu: "\u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F \u2192 \u064A\u064F\u0646\u0634\u0623 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u00B7 \u062D\u0633\u0627\u0628 \u0645\u0648\u062C\u0648\u062F \u2192 \u062F\u062E\u0648\u0644 \u0645\u0628\u0627\u0634\u0631",
    mcbSifreGerekmez: "\u0644\u0627 \u062D\u0627\u062C\u0629 \u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u00B7 \u0641\u0648\u0631\u0627\u064B",
    mcbHediyeKelime: "\u0647\u062F\u064A\u0629",
    mcbKvkkRiza: "\u0623\u0648\u062F\u0651 \u062A\u0644\u0642\u0651\u064A \u0631\u0633\u0627\u0626\u0644 \u0628\u0631\u064A\u062F\u064A\u0629 \u0639\u0646 \u0627\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0648\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A. (\u0627\u062E\u062A\u064A\u0627\u0631\u064A\u060C \u064A\u0645\u0643\u0646 \u0627\u0644\u0625\u0644\u063A\u0627\u0621 \u0641\u064A \u0623\u064A \u0648\u0642\u062A.)",
    mcbMisafirDene: "\u062C\u0631\u0651\u0628 \u0628\u062F\u0648\u0646 \u062A\u0633\u062C\u064A\u0644",
    mcbDenemeKalan: "\u0641\u064A\u062F\u064A\u0648 \u062A\u062C\u0631\u064A\u0628\u064A \u0645\u062A\u0628\u0642\u064D",
    mcb6Haneli: "\u0631\u0645\u0632 \u0645\u0646 6 \u0623\u062E\u0627\u0646\u0629",
    mcbKapat: "\u0625\u063A\u0644\u0627\u0642",
    mcb40Dakika: "\u0648\u0636\u0639 \u0627\u0644\u0641\u064A\u062F\u064A\u0648 \u062D\u062A\u0649 40 \u062F\u0642\u064A\u0642\u0629",
    mcbMevcutBakiye: "\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u062D\u0627\u0644\u064A",
    mcbOdeVeAc: "\u062D\u0642\u0627\u0642 \u0625\u0646\u062A\u0627\u062C \u062F\u0641\u0639 \u0648\u0641\u062A\u062D",
  },
  id: {
    mcbHosGeldinAlt: "Buat dan bagikan video Qur'an sinematik tanpa royalti",
    mcbGoogleDevam: "Lanjut dengan Google",
    mcbAdminGeriDon: "KEMBALI SEBAGAI ADMIN",
    mcbHesapNotu: "Akun baru \u2192 dibuat otomatis \u00B7 Akun sudah ada \u2192 langsung masuk",
    mcbSifreGerekmez: "Tanpa kata sandi \u00B7 Instan",
    mcbHediyeKelime: "hadiah",
    mcbKvkkRiza: "Saya ingin menerima pembaruan email tentang fitur baru, diskon, dan pengingat. (Opsional, dapat dibatalkan kapan saja.)",
    mcbMisafirDene: "Coba Tanpa Mendaftar",
    mcbDenemeKalan: "video percobaan tersisa",
    mcb6Haneli: "kode 6 digit",
    mcbKapat: "Tutup",
    mcb40Dakika: "Mode video hingga 40 menit",
    mcbMevcutBakiye: "Saldo saat ini",
    mcbOdeVeAc: "Hak Produksi Bayar & Buka",
  },
  ur: {
    mcbHosGeldinAlt: "\u0628\u0644\u0627 \u062D\u0642\u0648\u0642 \u0633\u06CC\u0646\u0645\u0627\u0626\u06CC \u0642\u0631\u0622\u0646\u06CC \u0648\u06CC\u0688\u06CC\u0648\u0632 \u0628\u0646\u0627\u0626\u06CC\u06BA \u0648 \u0634\u06CC\u0626\u0631 \u06A9\u0631\u06CC\u06BA",
    mcbGoogleDevam: "\u06AF\u0648\u06AF\u0644 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u062C\u0627\u0631\u06CC \u0631\u06A9\u06BE\u06CC\u06BA",
    mcbAdminGeriDon: "\u0628\u0637\u0648\u0631 \u0627\u06CC\u0688\u0645\u0646 \u0648\u0627\u067E\u0633 \u0622\u0626\u06CC\u06BA",
    mcbHesapNotu: "\u0646\u06CC\u0627 \u0627\u06A9\u0627\u0624\u0646\u0679 \u2192 \u062E\u0648\u062F\u06A9\u0627\u0631 \u0628\u0646\u062A\u0627 \u06C1\u06D2 \u00B7 \u0645\u0648\u062C\u0648\u062F\u06C1 \u0627\u06A9\u0627\u0624\u0646\u0679 \u2192 \u0628\u0631\u0627\u06C1ِ \u0631\u0627\u0633\u062A \u0644\u0627\u06AF \u0627\u0655\u0646",
    mcbSifreGerekmez: "\u067E\u0627\u0633\u0648\u0631\u0688 \u0646\u06C1\u06CC\u06BA \u0686\u0627\u06C1\u06CC\u06D2 \u00B7 \u0641\u0648\u0631\u06CC",
    mcbHediyeKelime: "\u062A\u062D\u0641\u06C1",
    mcbKvkkRiza: "\u0646\u0626\u06CC \u0635\u0644\u0627\u062D\u06CC\u062A\u0648\u06BA\u060C \u0631\u0639\u0627\u06CC\u062A\u0648\u06BA \u0627\u0648\u0631 \u06CC\u0627\u062F \u062F\u06C1\u0627\u0646\u06CC \u06A9\u06CC \u0627\u06CC \u0645\u06CC\u0644 \u062E\u0628\u0631\u06CC\u06BA \u0627\u0644\u0646\u0627 \u0686\u0627\u06C1\u062A\u0627 \u06C1\u0648\u06BA\u0664 (\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC\u060C \u06A9\u0633\u06CC \u0628\u06BE\u06CC \u0648\u0642\u062A \u0645\u0646\u0633\u0648\u062E \u06A9\u0644\u0648\u06BA\u0664)",
    mcbMisafirDene: "\u067E\u06CC\u0627\u0633 \u0628\u0631\u06AF\u0627\u0647 \u0631\u062C\u0633\u0679\u0631 \u06A9\u0626\u06CC\u06D2",
    mcbDenemeKalan: "\u0645\u06CC\u0641 \u0648\u06CC\u0688\u06CC\u0648 \u0628\u0627\u0642\u06CC",
    mcb6Haneli: "6 \u0647\u0646\u062F\u0633\u0648\u06BA \u06A9\u0627 \u06A9\u0648\u0688",
    mcbKapat: "\u0628\u0646\u062F \u06A9\u0631\u06CC\u06BA",
    mcb40Dakika: "40 \u0645\u0646\u0679 \u062A\u06A9 \u0648\u06CC\u0688\u06CC\u0648 \u0645\u0648\u0688",
    mcbMevcutBakiye: "\u0645\u0648\u062C\u0648\u062F\u06C1 \u0628\u06CC\u0644\u0646\u0633",
    mcbOdeVeAc: "\u067E\u0631\u0648\u0688\u06A9\u0634\u0646 \u062D\u0642 \u0627\u062F\u0627\u06A9\u0631\u0646 \u0648 \u06A9\u06BE\u0648\u0644\u06CC\u06BA",
  },
};

let rapor = {};
for (const dil of Object.keys(K)) {
  const dosya = `src/i18n/dicts.${dil}.json`;
  const sozluk = JSON.parse(fs.readFileSync(dosya, "utf8"));
  let yeni = 0;
  for (const [anahtar, deger] of Object.entries(K[dil])) {
    if (!(anahtar in sozluk)) { sozluk[anahtar] = deger; yeni++; }
  }
  fs.writeFileSync(dosya, JSON.stringify(sozluk, null, 2) + "\n");
  rapor[dil] = { yeni, toplam: Object.keys(sozluk).length };
}
console.log(JSON.stringify(rapor, null, 1));
