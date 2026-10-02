import { useState, useEffect } from "react";
import { fetchJSON } from "./studioHelpers";

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

  useEffect(() => {
    let live = true;
    localStorage.setItem("nur_city", prayerCity);
    const fetchByCoords = (lat: number, lng: number) => {
      fetchJSON(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`).then((json: any) => {
        if (live) setPrayerTimings(json?.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
    };
    const fetchByCity = () => {
      fetchJSON(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(prayerCity)}&country=Turkey&method=13`).then((json: any) => {
        if (live) setPrayerTimings(json?.data?.timings ?? null);
      }).catch(() => { if (live) setPrayerTimings(null); });
    };
    // ★ KULLANICI EMRİ (28.09): açılışta konum izni ASLA sorulmaz — tarayıcı onayı
    //   çıkmasın. Şehir bazlı vakitler (varsayılan İstanbul) yeterli. Koordinat
    //   yalnız izin DAHA ÖNCE verilmişse (localStorage işareti) sessizce kullanılır.
    // ★ NATİVE PENCERE FIX (02.10): bayrak "1" olsa bile Permissions API "granted"
    //   demeden getCurrentPosition ÇAĞRILMAZ — denied/prompt'ta OS "Allow geolocation?"
    //   penceresi her açılışta patlıyordu. denied/prompt → sessizce şehir bazlı.
    const izinDahaOnceVerilmis = localStorage.getItem("nur_konum_izin") === "1";
    const sessizKonumDene = () => {
      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: "geolocation" }).then((p) => {
          if (p.state === "granted" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
              () => fetchByCity(),
              { timeout: 5000 }
            );
          } else {
            fetchByCity(); // denied/prompt → pencere yok, şehirle devam
          }
        }).catch(() => fetchByCity());
      } else {
        fetchByCity(); // Permissions API yok → izni asla tetikleme
      }
    };
    if (izinDahaOnceVerilmis && navigator.geolocation) {
      sessizKonumDene();
    } else {
      fetchByCity();
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
