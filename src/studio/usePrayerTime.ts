import { useState, useEffect, useRef } from "react";
import { fetchJSON } from "./studioHelpers";
import { dunyaSehriBul } from "../data";

// ★ SAVUNMACI AYRIŞTIRMA (02.10): eski kayıtlarda etiket tam haliyle yazılmış olabilir
//   ("Doha · Katar") — hem burada hem seçim kaynaklarında temizlenir (çift emniyet).
const etiketTemizle = (ad: string): string => (ad || "").split(" · ")[0].trim();

interface UsePrayerTimeReturn {
  prayerCity: string;
  setPrayerCity: (city: string) => void;
  prayerSearch: string;
  setPrayerSearch: (s: string) => void;
  prayerTimings: Record<string, string> | null;
}

export function usePrayerTime(): UsePrayerTimeReturn {
  const [prayerCity, setPrayerCity] = useState(() => localStorage.getItem("nur_city") || "İstanbul");
  const [prayerSearch, setPrayerSearch] = useState("");
  const [prayerTimings, setPrayerTimings] = useState<Record<string, string> | null>(null);
  // ★ AÇIK SEÇİM KUTSALDIR (02.10): kullanıcı şehir SEÇTİYSE konum izni onu EZMEZ.
  //   Eski davranışta izin verilmişse her prayerCity değişiminde tekrar koordinata
  //   dönülüyordu — kullanıcı Mekke seçip İstanbul vakitleri görebiliyordu.
  const baslangicSehri = useRef(prayerCity);

  useEffect(() => {
    let live = true;
    localStorage.setItem("nur_city", prayerCity);
    const fetchByCoords = (lat: number, lng: number) => {
      fetchJSON(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`).then((json: any) => {
        if (live) setPrayerTimings(json?.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
    };
    const fetchByCity = () => {
      fetchJSON(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(etiketTemizle(prayerCity))}&country=Turkey&method=13`).then((json: any) => {
        if (live) setPrayerTimings(json?.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
    };
    // ★ YURTDIŞI ŞEHİR DESTEĞİ (02.10, kullanıcı emri: "bütün şehirler olsun, yurtdışı da dahil"):
    //   dünya şehri seçiliyse timingsByCity yerine DOĞRUDAN KOORDİNAT sorgusu yapılır —
    //   ülke adı eşleşme riski sıfır, vakit şehrin gerçek noktasından hesaplanır.
    //   Hesap metodu: TR şehirleri Diyanet (13); yurtdışı için Müslüman Dünya Ligi (3).
    const dunya = dunyaSehriBul(etiketTemizle(prayerCity));
    const fetchByDunyaSehir = () => {
      if (!dunya) return false;
      // NOT: aladhan'da koordinatlar QUERY'de ister — timings/<lat>,<lon> path biçimi 400 döndürür
      fetchJSON(`https://api.aladhan.com/v1/timings?latitude=${dunya.lat}&longitude=${dunya.lon}&method=3`).then((json: any) => {
        if (live) setPrayerTimings(json?.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
      return true;
    };
    // ★ KULLANICI EMRİ (28.09): açılışta konum izni ASLA sorulmaz — tarayıcı onayı
    //   çıkmasın. Şehir bazlı vakitler (varsayılan İstanbul) yeterli. Koordinat
    //   yalnız izin DAHA ÖNCE verilmişse (localStorage işareti) sessizce kullanılır.
    // ★ NATİVE PENCERE FIX (02.10): bayrak "1" olsa bile Permissions API "granted"
    //   demeden getCurrentPosition ÇAĞRILMAZ — denied/prompt'ta OS "Allow geolocation?"
    //   penceresi her açılışta patlıyordu. denied/prompt → sessizce şehir bazlı.
    const izinDahaOnceVerilmis = localStorage.getItem("nur_konum_izin") === "1";
    const kullaniciAcikSecim = etiketTemizle(prayerCity) !== etiketTemizle(baslangicSehri.current);
    const sessizKonumDene = () => {
      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: "geolocation" }).then((p) => {
          if (p.state === "granted" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
              () => { if (!fetchByDunyaSehir()) fetchByCity(); },
              { timeout: 5000 }
            );
          } else {
            if (!fetchByDunyaSehir()) fetchByCity(); // denied/prompt → pencere yok, şehirle devam
          }
        }).catch(() => { if (!fetchByDunyaSehir()) fetchByCity(); });
      } else {
        if (!fetchByDunyaSehir()) fetchByCity(); // Permissions API yok → izni asla tetikleme
      }
    };
    if (izinDahaOnceVerilmis && navigator.geolocation && !kullaniciAcikSecim) {
      sessizKonumDene();
    } else {
      if (!fetchByDunyaSehir()) fetchByCity();
    }
    return () => { live = false; };
  }, [prayerCity]);

  return {
    prayerCity,
    setPrayerCity,
    prayerSearch,
    setPrayerSearch,
    prayerTimings,
  };
}
