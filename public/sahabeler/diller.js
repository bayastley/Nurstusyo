/* Sahabeler Ansiklopedisi — 5 dilli arayüz katmanı.
   İçerik verisi Türkçedir (sahabeler.json). Başka dilde içerik dosyası
   (sahabeler.en.json vb.) eklendiğinde otomatik olarak o dosya okunur. */
(function () {
  "use strict";

  var DILLER = {
    tr: { ad: "Türkçe", kisa: "TR", yon: "ltr", htmlLang: "tr" },
    en: { ad: "English", kisa: "EN", yon: "ltr", htmlLang: "en" },
    ar: { ad: "العربية", kisa: "AR", yon: "rtl", htmlLang: "ar" },
    ru: { ad: "Русский", kisa: "RU", yon: "ltr", htmlLang: "ru" },
    id: { ad: "Indonesia", kisa: "ID", yon: "ltr", htmlLang: "id" }
  };

  var METIN = {
    tr: {
      ansiklopedi: "Sahabeler Ansiklopedisi",
      baslik: "Peygamberimizin Arkadaşları",
      giris: "Hayatları, önemli olayları ve Peygamberimizle yaşadıkları hatıralar — sade ve kaynaklı bir dille.",
      aramaYer: "İsim, künye, olay veya bölüm ara…",
      aramaEtiket: "Sahabe ve bölüm ara",
      temizle: "Aramayı temizle",
      sahabe: "sahabe",
      bulundu: "bulundu",
      ipucu: "Karta dokun, hayatını oku.",
      aramaIpucu: "Arama: “{q}”",
      bolumBaslik: "Bölüm sonuçları",
      bolumAlt: "{n} bölüm eşleşti · okumak için dokun",
      bolumYok: "Bölümlerde eşleşme yok.",
      sonucYokBaslik: "Sonuç bulunamadı",
      sonucYokMetin: "Farklı bir isim, künye ya da olay adı deneyin.",
      veriBosBaslik: "Veri boş",
      veriBosMetin: "sahabeler.json içine en az bir sahabe ekleyin.",
      hataBaslik: "Veri yüklenemedi",
      hataMetin: "sahabeler.json dosyasına ulaşılamadı ({hata}). Dosyayı bir sunucu üzerinden açın.",
      altBilgi: "Veriler sahabeler.json dosyasından okunur. Yeni sahabe eklemek için yalnız bu dosyaya kayıt ekleyin.",
      dilEtiket: "Dil",
      icekTürkçe: "İçerik Türkçe gösteriliyor; bu dilde çeviri hazırlanıyor.",
      sayfa: "sayfa",
      hayati: "Hayatı",
      hayatini: "Hayatını oku",
      vefat: "vefat",
      geri: "← Tüm sahabeler",
      onceki: "← Önceki",
      sonraki: "Sonraki →",
      bolumler: "Bölümler",
      kaynaklar: "Kaynaklar",
      hatira: "Peygamberimizle hatırası",
      ilkSayfa: "1. {baslik}",
      bulunamadi: "Sahabe bulunamadı",
      bulunamadiMetin: "Bağlantıdaki sahabe kaydı veride yok. Listeye dönüp tekrar deneyin."
    },
    en: {
      ansiklopedi: "Companions Encyclopedia",
      baslik: "The Companions of the Prophet",
      giris: "Their lives, key events and memories with the Prophet — in plain language, with sources.",
      aramaYer: "Search a name, epithet, event or chapter…",
      aramaEtiket: "Search companions and chapters",
      temizle: "Clear search",
      sahabe: "companions",
      bulundu: "found",
      ipucu: "Tap a card to read the life.",
      aramaIpucu: "Search: “{q}”",
      bolumBaslik: "Chapter matches",
      bolumAlt: "{n} chapters matched · tap to read",
      bolumYok: "No matching chapters.",
      sonucYokBaslik: "No results",
      sonucYokMetin: "Try another name, epithet or event.",
      veriBosBaslik: "No data",
      veriBosMetin: "Add at least one companion to sahabeler.json.",
      hataBaslik: "Could not load data",
      hataMetin: "sahabeler.json could not be reached ({hata}). Open the page from a server.",
      altBilgi: "Data is read from sahabeler.json. To add a companion, add a record to that file only.",
      dilEtiket: "Language",
      icekTürkçe: "Content is shown in Turkish; a translation for this language is being prepared.",
      sayfa: "pages",
      hayati: "Life",
      hayatini: "Read the life",
      vefat: "died",
      geri: "← All companions",
      onceki: "← Previous",
      sonraki: "Next →",
      bolumler: "Chapters",
      kaynaklar: "Sources",
      hatira: "A memory with the Prophet",
      ilkSayfa: "1. {baslik}",
      bulunamadi: "Companion not found",
      bulunamadiMetin: "The linked record is not in the data. Go back to the list and try again."
    },
    ar: {
      ansiklopedi: "موسوعة الصحابة",
      baslik: "أصحاب النبي ﷺ",
      giris: "حياتهم وأحداثهم وذكرياتهم مع النبي ﷺ — بلغة واضحة ومع المصادر.",
      aramaYer: "ابحث باسم أو كنية أو حدث أو فصل…",
      aramaEtiket: "البحث في الصحابة والفصول",
      temizle: "مسح البحث",
      sahabe: "صحابيًا",
      bulundu: "نتيجة",
      ipucu: "اضغط على البطاقة لقراءة السيرة.",
      aramaIpucu: "بحث: ”{q}“",
      bolumBaslik: "نتائج الفصول",
      bolumAlt: "{n} فصلًا مطابقًا · اضغط للقراءة",
      bolumYok: "لا توجد فصول مطابقة.",
      sonucYokBaslik: "لا نتائج",
      sonucYokMetin: "جرّب اسمًا أو كنية أو حدثًا آخر.",
      veriBosBaslik: "لا توجد بيانات",
      veriBosMetin: "أضف صحابيًا واحدًا على الأقل إلى sahabeler.json.",
      hataBaslik: "تعذّر تحميل البيانات",
      hataMetin: "تعذّر الوصول إلى sahabeler.json ({hata}). افتح الصفحة عبر خادم.",
      altBilgi: "تُقرأ البيانات من ملف sahabeler.json. لإضافة صحابي أضف سجلًا في هذا الملف فقط.",
      dilEtiket: "اللغة",
      icekTürkçe: "يُعرض المحتوى بالتركية؛ الترجمة إلى هذه اللغة قيد الإعداد.",
      sayfa: "صفحة",
      hayati: "سيرته",
      hayatini: "اقرأ سيرته",
      vefat: "الوفاة",
      geri: "→ جميع الصحابة",
      onceki: "→ السابق",
      sonraki: "التالي ←",
      bolumler: "الفصول",
      kaynaklar: "المصادر",
      hatira: "ذكرى مع النبي ﷺ",
      ilkSayfa: "١. {baslik}",
      bulunamadi: "لم يُعثر على الصحابي",
      bulunamadiMetin: "السجل المطلوب غير موجود. ارجع إلى القائمة وحاول مجددًا."
    },
    ru: {
      ansiklopedi: "Энциклопедия сподвижников",
      baslik: "Сподвижники Пророка",
      giris: "Их жизнь, важные события и воспоминания о Пророке — простым языком и с источниками.",
      aramaYer: "Имя, кунья, событие или глава…",
      aramaEtiket: "Поиск по сподвижникам и главам",
      temizle: "Очистить поиск",
      sahabe: "сподвижников",
      bulundu: "найдено",
      ipucu: "Нажмите на карточку, чтобы прочитать жизнеописание.",
      aramaIpucu: "Поиск: «{q}»",
      bolumBaslik: "Совпадения в главах",
      bolumAlt: "Совпало глав: {n} · нажмите, чтобы читать",
      bolumYok: "Совпадений в главах нет.",
      sonucYokBaslik: "Ничего не найдено",
      sonucYokMetin: "Попробуйте другое имя, кунью или событие.",
      veriBosBaslik: "Нет данных",
      veriBosMetin: "Добавьте хотя бы одного сподвижника в sahabeler.json.",
      hataBaslik: "Не удалось загрузить данные",
      hataMetin: "Файл sahabeler.json недоступен ({hata}). Откройте страницу через сервер.",
      altBilgi: "Данные читаются из sahabeler.json. Чтобы добавить сподвижника, добавьте запись только в этот файл.",
      dilEtiket: "Язык",
      icekTürkçe: "Текст показывается по-турецки; перевод на этот язык готовится.",
      sayfa: "стр.",
      hayati: "Жизнеописание",
      hayatini: "Читать жизнеописание",
      vefat: "смерть",
      geri: "← Все сподвижники",
      onceki: "← Назад",
      sonraki: "Далее →",
      bolumler: "Главы",
      kaynaklar: "Источники",
      hatira: "Воспоминание о Пророке",
      ilkSayfa: "1. {baslik}",
      bulunamadi: "Сподвижник не найден",
      bulunamadiMetin: "Записи по ссылке нет в данных. Вернитесь к списку и попробуйте снова."
    },
    id: {
      ansiklopedi: "Ensiklopedia Sahabat",
      baslik: "Para Sahabat Nabi",
      giris: "Kehidupan, peristiwa penting, dan kenangan bersama Nabi — dengan bahasa sederhana dan sumber.",
      aramaYer: "Cari nama, kunyah, peristiwa, atau bab…",
      aramaEtiket: "Cari sahabat dan bab",
      temizle: "Hapus pencarian",
      sahabe: "sahabat",
      bulundu: "ditemukan",
      ipucu: "Ketuk kartu untuk membaca riwayatnya.",
      aramaIpucu: "Pencarian: “{q}”",
      bolumBaslik: "Hasil bab",
      bolumAlt: "{n} bab cocok · ketuk untuk membaca",
      bolumYok: "Tidak ada bab yang cocok.",
      sonucYokBaslik: "Tidak ada hasil",
      sonucYokMetin: "Coba nama, kunyah, atau peristiwa lain.",
      veriBosBaslik: "Data kosong",
      veriBosMetin: "Tambahkan setidaknya satu sahabat ke sahabeler.json.",
      hataBaslik: "Data gagal dimuat",
      hataMetin: "sahabeler.json tidak dapat diakses ({hata}). Buka halaman melalui server.",
      altBilgi: "Data dibaca dari sahabeler.json. Untuk menambah sahabat, tambahkan catatan pada berkas itu saja.",
      dilEtiket: "Bahasa",
      icekTürkçe: "Isi ditampilkan dalam bahasa Turki; terjemahan untuk bahasa ini sedang disiapkan.",
      sayfa: "halaman",
      hayati: "Riwayat hidup",
      hayatini: "Baca riwayatnya",
      vefat: "wafat",
      geri: "← Semua sahabat",
      onceki: "← Sebelumnya",
      sonraki: "Berikutnya →",
      bolumler: "Bab",
      kaynaklar: "Sumber",
      hatira: "Kenangan bersama Nabi",
      ilkSayfa: "1. {baslik}",
      bulunamadi: "Sahabat tidak ditemukan",
      bulunamadiMetin: "Catatan pada tautan tidak ada dalam data. Kembali ke daftar dan coba lagi."
    }
  };

  var anahtar = "sahabeler-dil";

  function dilBul() {
    var d = null;
    try { d = localStorage.getItem(anahtar); } catch (e) { d = null; }
    if (d && METIN[d]) return d;
    var tarayici = (navigator.language || "tr").slice(0, 2).toLowerCase();
    return METIN[tarayici] ? tarayici : "tr";
  }

  function cevir(dilKodu, anahtarAdi, veriler) {
    var sozluk = METIN[dilKodu] || METIN.tr;
    var metin = sozluk[anahtarAdi];
    if (metin == null) metin = METIN.tr[anahtarAdi];
    if (metin == null) return "";
    if (veriler) {
      Object.keys(veriler).forEach(function (k) {
        metin = metin.split("{" + k + "}").join(String(veriler[k]));
      });
    }
    return metin;
  }

  function uygula(dilKodu) {
    var dil = DILLER[dilKodu] || DILLER.tr;
    document.documentElement.lang = dil.htmlLang;
    document.documentElement.dir = dil.yon;
    document.documentElement.setAttribute("data-dil", dilKodu);
    var dugmeler = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < dugmeler.length; i++) {
      var e = dugmeler[i];
      var anahtarAdi = e.getAttribute("data-i18n");
      var metin = cevir(dilKodu, anahtarAdi);
      if (anahtarAdi === "aramaYer" && e.tagName !== "INPUT") metin = cevir(dilKodu, anahtarAdi);
      if (e.tagName === "INPUT") e.placeholder = metin;
      else e.textContent = metin;
    }
    var etiketler = document.querySelectorAll("[data-i18n-aria]");
    for (var j = 0; j < etiketler.length; j++) {
      etiketler[j].setAttribute("aria-label", cevir(dilKodu, etiketler[j].getAttribute("data-i18n-aria")));
    }
    var seciciler = document.querySelectorAll("[data-dil-secici]");
    for (var k = 0; k < seciciler.length; k++) seciciler[k].value = dilKodu;
    var uyari = document.querySelector("[data-icerik-uyari]");
    if (uyari) {
      uyari.hidden = dilKodu === "tr";
      uyari.textContent = dilKodu === "tr" ? "" : cevir(dilKodu, "icekTürkçe");
    }
  }

  function dilDegistir(dilKodu) {
    if (!METIN[dilKodu]) dilKodu = "tr";
    try { localStorage.setItem(anahtar, dilKodu); } catch (e) { /* gizli mod */ }
    uygula(dilKodu);
    document.dispatchEvent(new CustomEvent("sahabeler:dil", { detail: { dil: dilKodu } }));
  }

  function seciciKur() {
    var seciciler = document.querySelectorAll("[data-dil-secici]");
    for (var i = 0; i < seciciler.length; i++) {
      var sec = seciciler[i];
      if (sec.getAttribute("data-kuruldu")) continue;
      sec.innerHTML = Object.keys(DILLER).map(function (kod) {
        return '<option value="' + kod + '">' + DILLER[kod].ad + "</option>";
      }).join("");
      sec.value = dilBul();
      sec.addEventListener("change", function (e) { dilDegistir(e.target.value); });
      sec.setAttribute("data-kuruldu", "1");
    }
  }

  window.SahabelerDil = {
    diller: DILLER,
    metin: METIN,
    suanki: dilBul,
    cevir: cevir,
    uygula: uygula,
    degistir: dilDegistir,
    kur: function () { seciciKur(); uygula(dilBul()); },
    icerikYolu: function () {
      var d = dilBul();
      return d === "tr" ? "sahabeler.json" : "sahabeler." + d + ".json";
    }
  };

  document.addEventListener("DOMContentLoaded", function () { window.SahabelerDil.kur(); });
})();
