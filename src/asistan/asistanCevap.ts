// ════════════════════════════════════════════════════════
// ASİSTAN CEVAP BANKASI (19.10) — ÜCRETSİZ (AI'sız) ASİSTAN
//
// Nûr Stüdyo destek asistanının beyni. Yapay zekâ çağrısı YOK;
// kelime-eşleşmeli kural motoru + hazır cevap bankası ile çalışır.
//
// ★ GÜVENLİK KURALLARI (kullanıcı emri, 19.10):
//   1. KİŞİSEL BİLGİ VERMEZ — jeton bakiyesi, abonelik durumu, ban geçmişi,
//      e-posta gibi hiçbir kullanıcıya özel veri cevaplarlara GİRMEZ.
//      Kullanıcı KENDİ verisini sorarsa bile sayı verilmez, nereye
//      bakacağı gösterilir. (Durum-sızması + istismar riski = 0)
//   2. ADMİN / BAŞKA KİŞİLERİN BİLGİSİNİ VERMEZ — admin listesi, e-posta,
//      şifre, telefon, kullanıcı sorgulama asla yapılamaz; bu anahtarlı
//      sorular güvenlik-kapısı cevabına yönlendirilir.
//   3. Fail-closed: hiçbir kural eşleşmezse bilmiyorum + iletişim yönlendirme.
//   4. Normalleştirme sadece KARŞILAŞTIRMA için; cevaplar sabit metindir —
//      kullanıcının yazdığı hiçbir metin cevaba yansımaz (injection yok).
//
// ★ SATIŞ HATTE (kullanıcı emri, 22.10): "nelere sahibim" sorusu seviyeye göre
//   cevaplanır — FREE sorarsa plandakiler + PRO'NU önerir ("daha kapsamlı"),
//   PRO sorarsa plandakiler + ELİT'i dikkat çekerek önerir. ELİT sorarsa zirve
//   listesi gelir, upsell YOK. Admin/kişisel veri hâlâ her koşulda KAPALI:
//   sahiplik cevabı planın GENEL içeriğidir (kota, abonelik durumu, admin
//   listesi gibi kişisel/veren veri asla girmez).
// ════════════════════════════════════════════════════════

// ★ 22.10 MEGA BİLGİ TABANI — asistanBilgi.ts'ten ek kural havuzu import edilir:
//   aynı kural motoruyla skorlanır, güvenlik kapısı ÖNCE çalışmaya devam eder.
import { ASISTAN_BILGI_KURALLARI } from "./asistanBilgi";
import { ASISTAN_RULES } from "./asistanKurallari";
export { ASISTAN_RULES } from "./asistanKurallari";
import type { AsistanSeviye, AsistanRule } from "./asistanKurallari";
export type { AsistanSeviye, AsistanRule } from "./asistanKurallari";


/** Kullanıcının plan seviyesi — AsistanBaloncugu StudioApp'ten `tier`'ı taşır.
 *  ★ Sadece planİN GENEL ağırlığını belirler; kişisel veri (kalan hak, bakiye,
 *  abonelik durumu, ban) asisten cevaplarına ZATEN HİÇBİR koşulda giremez. */

/** ★ GÜVENLİK KAPISI — bu anahtarlar soruda geçiyorsa kural motoru ÇALIŞMAZ,
 *   sabit güvenlik cevabı döner. Kişisel/admin veri avcısı sorular burada yakalanır. */
const GUVENLIK_ANAHTARLARI = [
  "epostam", "e-postam", "mailim", "emailim", "e mail",
  "admin", "yonetici", "moderator",
  "telefonu", "telefon numara", "kisinin", "baskasinin", "başkasının", "kullanıcıya ait", "kullaniciya ait",
  "sifresi", "sifreleri", "sifrem",
  "jetonum", "bakiyem", "kotam", "aboneligim", "uyeligim ne",
  "ban yedim mi", "banlimi", "banlı mı", "askidami", "askıya alındım",
  // ★ 20.10 GENİŞLETME: kod/altyapı/gizli-bilgi sızdırma avcıları — kural motoruna düşmez
  // ★ 22.10: " kodu" / " kodunu" serbest kelimei KAPI'dan ÇIKARILDI — kelime-eşleşsayıda
  //   "virüs yazma KODU" tarzı ZARARLI kapılara yakalançası soruları güvenlik kapısına
  //   çarpıyordu; kaynak-kod soruları "kaynak kod(u)" çift-kelime anahtarlarıyla yakalanır.
  "kaynak kodu", "kaynak kod",  "repo", "githubin", "git reposu", "commit listesi",
  "api anahtar", "apı key", "apikey", "secret", "gizli anahtar", "env dosya", "env deger", "ornek env",
  "veritabani sifre", "supabase sifre", "service role key", "hmac sifre", "oturum sifre",
  "log kayitlar", "hatayi goster", "hic hatayi da", "console hata", "sunucu logu", "veritabani sorgusu",
  "kisininSure kimligi", "kullanicilarin listesi", "tum kullanicilar", "uye listesi", "eposta listesi",
  "kullanici listesi", "tum uyeler", "uyeler kimler", "uyeleri listele", "uye kayitlari",  "eposta listele", "kota kismim", "askida miyim", "banlandim mi", "sunucu loglarını", "log kayitlari", "console hatayı", "console hatasi", "veritabani girisi", "supabase gizli", "redis sifre", "iyzico bilgileri", "oturum anahtar", "oturum anahtarı", "oturum anahtarları", "oturum anaharları", "anahar", "anahtar listesi", "oturum sifresi",
];

/** Karşılaştırma metni: lowercase + TR harf fold + noktalama silme */
export function asistanNormallestir(s: string): string {
  return s
    .toLowerCase()
    // ★ 21.10 nokta-kombinesi FIX: JS'te "İ".toLowerCase() → "i̇" (i + U+0307).
    //   Nokta-kombinesi harf-sınıfı regex'te HAYATTA kalıyor ve kelimeyi BÖLÜYORDU:
    //   "İade" → "i" + "ade", "İngilizce" → "i" + "ngilizce" — çip soruları kendi
    //   anahtarlarına bile eşleşmiyordu ("Hmm bunu tam bilemedim" yüzü). U+0307
    //   burada temizlenir → "iade", "ingilizce" doğru kelime olur.
    .replace(/\u0307/g, "")
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .replace(/ş/g, "s").replace(/Ş/g, "s")
    .replace(/ğ/g, "g").replace(/Ğ/g, "g")
    .replace(/ü/g, "u").replace(/Ü/g, "u")
    .replace(/ö/g, "o").replace(/Ö/g, "o")
    .replace(/ç/g, "c").replace(/Ç/g, "c")
    // ★ 22.10 ŞAPKA HARFLERİ: "kâri"  ilk anahtarlarla eşişiyordu (â→a) — kâri/karî/îdare şapkalı yazımlar düs uniform:
    .replace(/â/g, "a").replace(/Â/g, "A")
    .replace(/î/g, "i").replace(/Î/g, "I")
    .replace(/û/g, "u").replace(/Û/g, "U")
    // ★ 22.10 APOSTROF SİLİMİ — "Kur'an" karakter-punc Run'te "kur, an" bölünüyordu; silini → "kuran" bir kelime:
    .replace(/[\u2019'`\u00B4]/g, "")
    // ★ 22.10 RUN-SEKME (canlı-test fix): artı işareti遮めし字集、"nasil?" → "nasil," gibi DİP-bileşik virgül bırakıyordu
    //   → kelime-setine "nasil," geçiyor ve word-match KAYBEDİYORDU. Tümú işaret/boşluk RUN'ı TEK ", " olur:
    .replace(/[^\p{L}\p{N}]+/gu, ", ")
    .replace(/(?:,\s*)+$/, "")
    .trim();
}

/** ★ 22.10 KAPI EŞLEŞTİRİCİ — kök-çip panzehirinin kapı uyarlaması.
 *  (a) DÜZ includes kötüydü: kelime-sırası cinsi dizilişler kapıyı kaçırtıyordu.
 *  (b) kesfetArama.kelimeUyar'ın Levenshtein toleransı İSE envy fazla cömert:
 *      "kota" ↔ "kotam" (lev 1) gibi NORMAL soruları güvenlik kapısına
 *      düşürüyordu. Kapılar kapı KEŞKİN kesinlik istedi aşağıdaki kurallarla:
 *      tek kelime anahtarlar: metin word'ü birebir ya da anahtarın uzun-türevi
 *      ("m" eki: "epostam"→"epostami"), 4-harf-altı için word-set exact.
 *      çok-kelimeli anahtar: HER kelimesi yukarıdaki kurala uymalı. */
function kapiEslestir(metin: string, anahtar: string): boolean {
  const nk = asistanNormallestir(anahtar);
  if (!nk) return false;
  const kelimeler = new Set(metin.split(", "));
  const kelimeBul = (p: string): boolean => {
    if (!p) return false;
    if (kelimeler.has(p)) return true;
    for (const w of kelimeler) {
      if (w.length > p.length && w.startsWith(p)) return true; // uzun-türev ek
    }
    return false;
  };
  // nk asistanNormallestir'den virgüllü gelir — kapı-motoru virgülleri boşluğa çevirir
  return nk.replace(/,\s*/g, " ").split(" ").filter(Boolean).every(kelimeBul);
}


/** ★ 22.10 SAHIP OLMA TESBİT — "nelere sahibim / sahip olduklarım" sorularının
 *  kavrayıcıları. Güvenlik kapısından ÖNCE ama kişisel-markalardan SONRA bakılır:
 *  "üyeliğimde nelere sahibim" → plan listesi (meşru), "kotam ne, nelere sahibim"
 *  → güvenlik kapısı (kişisel veri avcısı). */
const SAHIP_TESBITLERI = [
  "nelere sahip", "neye sahip", "sahip olduk", "sahip oldugum",
  "uyeligim nelere", "uyeligimde neler",
];

/** ★ Sahiplik sorusunda bile şüphe varsa özel cevabı KAPATAN kişisel/admin
 *  işaretleri — varsa akış normal güvenlik kapısına yönlenir. */
const SAHIP_KORUMA_MARKALARI = [
  "admin", "yonetici", "moderator", "baskasin", "kisinin", "sifre",
  "epostam", "mailim", "telefon", "bakiyem", "jetonum", "kotam",
  "banlimi", "ban yedim", "askida", "uye listesi", "kullanicilar",
];

/** ★ 22.10 SATIŞ HATTE — seviyeye göre detaylı "nelere sahiptir" cevabı.
 *  Sayılar premiumModalHelpers PRO_FEATURES / ELIT_FEATURES + plan kartlarıyla
 *  BİREBİR aynı kaynaktan (kullanıcı panelde farklı görürse anında kendini ele
 *  veritesi yok). Upsell hattı: free→Pro önerisi, pro→Elit önerisi, elit→zirve.
 *  ★ Kişisel/admin veri YOK: yalnız planın genel içeriği anlatılır. */
function sahiplikCevabi(seviye: AsistanSeviye): { cevap: string; aksiyon?: AsistanSonuc["aksiyon"] } {
  if (seviye === "pro") {
    return {
      cevap: "NÛR PRO'da neler var 💎 — 1) Günde 8 kısa + 3 uzun video (600 sn). 2) 25 kâri sesi (10 ücretsiz + 15 PRO-özel). 3) 60 tema (51 PRO + 9 ücretsiz). 4) Sinematik filtreler. 5) Renk çubuğu + özel yazı. 6) Foto üzerine ayet — Ayet & Dua Kütüphanesi. 7) Uzun video modu + 16:9 yatay ekran. 8) Etiketsiz üretim — videonda nurstudyo.com ÇIKMAZ. — Bu paket zaten güçlü, ama bir adım ötede NÛR ELİT farkı gözle görülür 👑: günde 15 kısa + 5 uzun + 1 tam sure sürümü, TÜM 45 kâri sesi + TÜM 106 tema, açıklama üretimi, AI hashtag paketleri, gelişmiş sosyal paylaşım araçları, Tasarım stüdyosu + marka imza, Seslendirme, Kendi sesinle üretim, Haftanın Videosu vitrine ekleme ve Akıllı AI arka plan seçimi DAHİL. Paylaştığın videoda sergilenen imza senin olur — büyütmek istersen aşağıdaki 💎 butonu seni plan paneline götürür. 🌙",
      aksiyon: "uyelik",
    };
  }
  if (seviye === "elit") {
    return {
      cevap: "NÛR ELİT'te neler var 👑 — 1) Günde 15 kısa + 5 uzun video (600 sn) + 1 tam sure sürümü. 2) Tüm 45 kâri sesi — hepsi açık. 3) Tüm 106 tema. 4) Filigransız 1080p üretim + KENDİ marka etiketin — videonu kendi adınla imzalarsın. 5) Açıklama üretimi (AI varyasyonları). 6) AI hashtag paketleri. 7) Gelişmiş sosyal paylaşım araçları. 8) Tasarım stüdyosu + kendi imzan. 9) Seslendirme (NÛR SES). 10) Kendi sesinle üretim. 11) Haftanın Videosu vitrine ekleme. 12) Akıllı AI arka plan seçimi. 13) Toplu üretim: 9:16 + 1:1 + 16:9 formatları tek tıkla. Elit, zirve plandır — platformun en yüksek gücü tamamı senin. 👑",
    };
  }
  // free → Pro önerisi daha kapsamlı diye öne çıkarılır
  return {
    cevap: "Ücretsiz planda neler var 🌿 — 1) Her gün 3 kısa video (59 sn). 2) 10 kâri sesi. 3) 1300+ atmosfer klibi. 4) 9 ücretsiz tema. 5) Başlık üretimi + 16:9 format. 6) Kâbe canlı, Kur'an okuma/dinleme, hafızlık testi, Nur araçları ve radyo — HERKESE ÜCRETSİZ. 7) Çıktılarda köşede 'nurstudyo.com' etiketi olur (kaldırılamaz). — Başlamak için birebir! Ama sana NÛR PRO'yu öneririm 💎: günde 8 kısa + 3 uzun (600 sn) video, 25 kâri sesi, 60 tema, sinematik filtreler, renk çubuğu + özel yazı, Foto üzerine ayet (Ayet & Dua Kütüphanesi), 16:9 yatay format VE etiketsiz üretim (nurstudyo.com yazmaz). Kısacası Ücretsiz'in en az 2 katı hak. Aşağıdaki 💎 butonundan plan panelini açıp hemen inceleyebilirsin. 🌙",
    aksiyon: "uyelik",
  };
}

/** ★ Güvenlik-kapısı cevabı — kişisel/admin veri okumaya çalışan soruların tek sabit cevabı */
const GUVENLIK_MESAJI =
  "Bu asistan güvenlik gereği KİŞİSEL VERİ sunmaz — kendi hesabınızın bakiye/ban/seviye bilgisi de, başka bir kişinin ya da admin'in e-posta/şifre/telefon bilgisi de vermez. Hesabınızla ilgili bilgi Profil sayfanızda, ekibe soru Geri Bildirim kutusundan gider. Başka bir konuda yardımcı olabilir miyim? 🌙";

/** ★ 22.10 ZARARLI İÇERİK KAPISI — bomba/patlayıcı/silah/uyuşturucu tarzı
 *  sorular "bilinmiyor" cevabına düşüp muştra gibi görülmemeli; net red döner. */
const ZARARLI_ANAHTARLARI = [
  "patlayici", "patlayıcı", "bomba", "el yapımı bomba", "el yapimi bomba",
  "bombasi", "bombası",
  "silah yap", "silah nasıl", "silah nasil", "silah evde", "tabanca yap",
  "uyusturucu", "uyuşturucu", "uyuşturucu yap", "uyusturucu yap", "esrar", "metamfetamin",
  "zehir yap", "zehir nasıl", "zehir nasil", "virüs yaz", "virus yaz", "virüs yap", "virus yap",
  "virüs olustur", "virus olustur", "virüs yazilim", "virus yazilim",
  "troyan", "trojan", "malware", "keylogger", "keylogger yaz",
  "ddos saldiri", "ddos saldırı", "ddos saldirmasi", "hiz bilgisayar", "hiz bilgisayarları",
  "hesap çal", "hesap cal", "hesap çalın", "hesap calin", "hesap hırsızligi",
];
const ZARARLI_MESAJI =
  "Bu konuda yardım edemem 🙏 — Zarar verici içerik (bomba/silah/uyuşturucu/virüs/hesap hırsızlığı vb.) sorularına asistan cevap vermez; Nûr Stüdyo yalnızca Kur'an/dua/İslamî içerik üretimi içindir. Başka bir konuda yardımcı olabilir miyim? 🌙";

export interface AsistanSonuc {
  /** eşleşen kural kimliği ('guvenlik' | kural id | 'bilinmiyor' | 'bos') */
  kural: string;
  cevap: string;
  /** güvenlik kapısı devrede miydi (test/sayaç için) */
  guvenlikKapisi: boolean;
  /** ★ 19.10: cevapla gösterilecek yönlendirme butonu —
   *   'uyelik'  = üyelik satın alma paneli (PremiumModal, uyelik tab'i)
   *   'cuzdan'  = cüzdan/paket paneli (PremiumModal, jeton tab'i) — hak/paket tükenmişse
   *   'mail'    = 📧 destek@nurstudyo.com mailto aç */
  aksiyon?: "uyelik" | "cuzdan" | "mail";
}

/** ★ Çekirdek — GÜVENLİK ÖNCE
 *   ★ 22.10: seviye parametresi üyenin planıdır (StudioApp `tier`) —
 *   "nelere sahibim" sorusuna seviyeye uygun satış kodu döner:
 *   free→PRO öner, pro→ELİT öner, elit→zirve listesi (upsell yok).
 *   Admin/kişisel veri HER koşulda kapalıdır. */
export function asistanCevap(soru: string, seviye: AsistanSeviye = "free"): AsistanSonuc {
  const n = asistanNormallestir(soru);
  if (!n) {
    return {
      kural: "bos",
      cevap: "Sorunuzu yazın — ya da aşağıdaki hazır sorulardan birini seçin. 🌙",
      guvenlikKapisi: false,
    };
  }

  // ★ 22.10 SAHIP OLMA (satış hatte): soru "nelere sahibim" tarzındaysa ve
  //   kişisel/admin işareti taşıMıyorsa, seviyeye göre detaylı plandaki
  //   kazandırdıkları cevap döner — güvenlik kapısı bu yolu BÜTÜN halde
  //   korur (şüphe varsa özel cevap atlanır, kapı çalışır).
  const sahipVardi = SAHIP_TESBITLERI.some((m) => n.includes(m))
    && !SAHIP_KORUMA_MARKALARI.some((m) => n.includes(m));
  if (sahipVardi) {
    const s = sahiplikCevabi(seviye);
    return { kural: "sahiplik", cevap: s.cevap, guvenlikKapisi: false, aksiyon: s.aksiyon };
  }

  // ★ 22.10 (kök-çip panzehiri v2): kapılar da kelime-bütünlüklü + harf-hata toleranslı
  //   kelimeVardimi ile aranır — düz includes kelime sırası ve "trojan"↔"troyan"
  //   tarzı yanlışlamaları kapıdan kaçırtıyordu.
  const guvenlikVardi = GUVENLIK_ANAHTARLARI.some((m) => kapiEslestir(n, m));
  if (guvenlikVardi) {
    return { kural: "guvenlik", cevap: GUVENLIK_MESAJI, guvenlikKapisi: true };
  }
  // ★ zararlı içerik red kapısı — kişisel veri kapısından sonra, kural motorundan önce
  const zararliVardi = ZARARLI_ANAHTARLARI.some((m) => kapiEslestir(n, m));
  if (zararliVardi) {
    return { kural: "zararli", cevap: ZARARLI_MESAJI, guvenlikKapisi: true };
  }

  let enIyiRule: AsistanRule | null = null;
  let enIyiSkor = 0;
  // ★ KELİME-TABANLI eşleşme (19.10 canlı-test fix): "as" gibi kısa anahtarlar
  //   substring olarak "kasmıyor" içinde yanlış eşleşiyordu. Tek-kelime
  //   anahtarlar yalnız WORD bütünlüğüyle, çok-kelimeli ifadeler substring
  //   olarak aranır.
  // ★ ÇOĞUL EŞLEME (19.10 fix v2): "Jetonlar nasıl gelir?" → "jetonlar"
  //   kelimesi "jeton" anahtarıyla eşleşmiyordu → bilmiyorum cevabı. Tek-kelime
  //   anahtarla çoğul biçimler (key+lar/ler) de denenir — substring riski yok.
  // ★ KÖK EŞLEME (21.10, kullanıcı: "soru senin çiplerinden çıkıyor, cevap
  //   bilemiyor bu ne alaka"): çipler "paylaşırım/indirebilirim/dinlerim" gibi
  //   EK理解和 biçimdiler; anahtar kelimesi eşleşmezdi. Artık 5+ harf kök
  //   anahtar kelime Başına eşleşir ("indir"→"indirebilirim" ✓, "paylas"→
  //   "paylasirim" ✓, "dinle"→"dinlerim" ✓). 4- ve al takılı hiç eşleşmez.
  const kelimeler = new Set(n.split(", "));
  const kelimeVardimi = (nk: string): boolean => {
    if (kelimeler.has(nk) || kelimeler.has(nk + "lar") || kelimeler.has(nk + "ler")) return true;
    if (nk.length >= 5) {
      for (const w of kelimeler) if (w.startsWith(nk) && w.length >= nk.length) return true;
    }
    return false;
  };
  // ★ 22.10 MEGA BİLGİ TABANI: ana kuralların ARKASINDA ek haven —
  //   skor beraberliğinde İLK gelen (ana kurallar) kazanır, önceki öncelikler
  //   korunur; bilgi tabanı yalnız daha iyi eşleşirse devreye girer.
  for (const r of [...ASISTAN_RULES, ...ASISTAN_BILGI_KURALLARI]) {
    const skor = r.anahtar.reduce((s, a) => {
      const nk = asistanNormallestir(a);
      if (!nk) return s;
      // anahtar birden çok kelime içeriyorsa substring, tek kelimeyse word-match
      return s + (nk.includes(", ") ? (n.includes(nk) ? 1 : 0) : (kelimeVardimi(nk) ? 1 : 0));
    }, 0);
    if (skor > enIyiSkor) { enIyiSkor = skor; enIyiRule = r; }
  }
  if (enIyiRule && enIyiSkor > 0) {
    // ★ YÖNLENDİRME BUTONU (19.10): hangi kurala hangi buton?
    //   uyelik → satın alma paneli · hak-bitti/iade/hediye-kodu → cüzdan · iletişim/hesap-sil/üretmiyor → mailto
    //   ★ 22.10 MEGA BİLGİ TABANI yönlendirmeleri eklendi.
    const AKSIYON_MAP: Record<string, AsistanSonuc["aksiyon"]> = {
      uyelik: "uyelik", "pro-paket": "uyelik", "elit-paket": "uyelik", "hak-bitti": "cuzdan", iade: "cuzdan", "hediye-kodu": "cuzdan",
      iletisim: "mail", "hesap-sil": "mail", uretmiyor: "mail",
      "fiyat-listesi": "uyelik", "bolgesel-fiyat": "uyelik", "fiyat-abonelik": "uyelik",
      "cuzdan-paneli": "cuzdan", "cuzdan-nedir": "cuzdan", "vidje-refund": "cuzdan", "video-refund": "cuzdan",
      "destek-mail": "mail", "oynerilen-videolar": "cuzdan",
    };
    const aksiyon = AKSIYON_MAP[enIyiRule.id];
    return { kural: enIyiRule.id, cevap: enIyiRule.cevap, guvenlikKapisi: false, aksiyon };
  }

  return {
    kural: "bilinmiyor",
    cevap: "Hmm bunu tam bilemedim 🤔 Ama şunu deneyebilirsin: yukarıdaki ⬆️ sık sorulanlardan birine tıkla ya da kendi cümlemle bana video üretimi, üyelik, jetonlar, paylaşım, seslendirme, Kur'an bölümü, iade, dil, gizlilik… gibi konularda soru yaz — bunların hepsinfo anında cevapları hazırdır. Aklında başka bir şey varsa sağ üst → Geri Bildirim ile ekibimize yaz, biz buradan cevap veririz. 🌙",
    guvenlikKapisi: false,
  };
}

/** Sohbet penceresinde tek-tıkla denenen hazır sorular
 *  ★ 20.10 RASTGELE ÇİP HAVUZU (kullanıcı emri: "sık soruları kaldır, her girişte
 *  rastgele 1-2 tane çıksın, sürekli de değişsin, sayfa yenilendikçe değişsin"):
 *  tek listeden seçilmez — KONU x İFADE kombinasyon havuzu ücret; açılışta
 *  Math.random ile 3 farklı çip seçilir (her seferinde başka varyant). */

/** Çip varyantları — aynı konunun farklı kullanıcı-dilli şiveleri */
export const ASISTAN_CIP_HAVUZU: string[][] = [
  // video üretimi
  ["Video nasıl üretirim?", "Ayet videosu nasıl yapılır?", "Kısa video üretimi nasıl?"],
  // üretim sorunları
  ["Video üretmiyor", "Videoyu üretirken takılıyor", "Video butonu çalışmıyor"],
  // üyelik
  ["Üyelik seviyeleri nelerdir?", "Pro paket ne getirir?", "Elit üyelik avantajları?", "Nelere sahibim?"],
  // jeton / hak
  ["Jetonlar nasıl gelir?", "Üretim hakkımı nasıl artırırım?", "Günlük haklarım ne zaman yenilenir?"],
  // paylaşım
  ["Videoyu WhatsApp'ta nasıl paylaşırım?", "Videoyu TikTok'a nasıl koyarım?", "Videoyu nasıl indiririm?"],
  // site/tarayıcı sorunları
  ["Site çalışmıyor", "Sayfa açılmıyor", "Beyaz ekran geliyor"],
  // iade / para
  ["İade alabilir miyim?", "Paket iadesi nasıl yapılır?"],
  // asistan kendini tanıtma
  ["Nûr Asistan kim?", "Asistan ne işe yarar?", "Sen kimsin?"],
  // Kâbe canlı
  ["Kâbe canlı yayını nerede?", "Mescid yayınını nereden bulurum?"],
  // Kur'an bölümü
  ["Kur'an'ı nasıl dinlerim?", "Hafızlık testi nasıl yapılır?", "Sure nasıl okurum?"],
  // atmosfer/tasarım
  ["Arka plan nasıl değişir?", "Video tasarımını nasıl seçirim?"],
  // dil
  ["Siteyi İngilizce yapabilir miyim?", "Arapça destekleniyor mu?"],
  // gizlilik
  ["Videolarım saklanır mı?", "Verilerim güvende mi?"],
  // günün hediyesi
  ["Günlük hediye nasıl alınır?", "Bugünün hediyesi nerede?"],
  // hatırlatma / PWA
  ["Uygulamayı telefona nasıl kurarım?", "Vakit hatırlatması nasıl gelir?"],
  // hesap
  ["Şifremi unuttum", "Giriş yapamıyorum"],
  // ban
  ["Ban yedim, ne yapmalıyım?", "Erişimim neden kısıtlandı?"],
  // kıssa/seslendirme
  ["Kıssa nasıl üretirim?", "Kendi sesimi nasıl eklerim?"],
];

/** ★ Açılışta rastgele konulardan çip çeker — her çağrıda farklı olabilir
 *  (Math.random → sayfa yenilemesinde FARKLI kombinasyon). Adet: konu sayısı
 *  kadar; çip tekrar yok (konu başına 1). */
export function asistanRastgeleCipler(kaç: number = 3): string[] {
  const konuEndeksleri = ASISTAN_CIP_HAVUZU.map((_, i) => i);
  // Fisher-Yates — JavaScript'de kütüphane yok, temiz shuffle
  for (let i = konuEndeksleri.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [konuEndeksleri[i], konuEndeksleri[j]] = [konuEndeksleri[j], konuEndeksleri[i]];
  }
  const n = Math.max(1, Math.min(kaç, konuEndeksleri.length));
  return konuEndeksleri.slice(0, n).map((k) => {
    const varyantlar = ASISTAN_CIP_HAVUZU[k];
    return varyantlar[Math.floor(Math.random() * varyantlar.length)];
  });
}
