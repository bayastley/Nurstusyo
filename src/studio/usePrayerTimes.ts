import { useEffect, useMemo, useState } from "react";
import { TURKISH_CITIES } from "../data";
import { PRAYERS } from "./studioConstants";
import { fetchJSON } from "./studioHelpers";

export function usePrayerTimes(prayerCity: string, prayerSearch: string) {
  const [prayerTimings, setPrayerTimings] = useState<Record<string, string> | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let live = true;
    localStorage.setItem("nur_city", prayerCity);

    const fetchByCoords = (lat: number, lng: number) => {
      fetchJSON(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`)
        .then((json) => { if (live) setPrayerTimings(json.data?.timings ?? null); })
        .catch(() => { if (live) setPrayerTimings(null); });
    };

    const fetchByCity = () => {
      fetchJSON(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(prayerCity)}&country=Turkey&method=13`)
        .then((json) => { if (live) setPrayerTimings(json.data?.timings ?? null); })
        .catch(() => { if (live) setPrayerTimings(null); });
    };

    // ★ KULLANICI EMRİ (28.09): açılışta konum izni ASLA sorulmaz — tarayıcı
    //   onayı çıkmasın. Koordinat yalnız izin DAHA ÖNCE verilmişse sessizce kullanılır.
    // ★ NATİVE PENCERE FIX (02.10, kullanıcı bildirimi "allow sen otomatik bas"):
    //   localStorage bayrağı "1" olan cihazda her yüklemede getCurrentPosition çağrılıyordu;
    //   tarayıcı izni kalıcı değilse (kullanıcı eskiden redetti / WebView kaydetmiyor)
    //   OS "Allow geolocation?" penceresi HER AÇILIŞTA patlıyordu. Artık önce
    //   navigator.permissions ile durum okunur: yalnız "granted" ise sessiz koordinat,
    //   "denied"/"prompt" ise HİÇ sorulmadan şehir bazlı vakitler kullanılır.
    const izinDahaOnceVerilmis = localStorage.getItem("nur_konum_izin") === "1";
    const sessizKonumDene = () => {
      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: "geolocation" }).then((p) => {
          if (p.state === "granted" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
              () => fetchByCity(),
              { timeout: 5000 },
            );
          } else {
            fetchByCity(); // denied/prompt → pencere HİÇ çıkmasın, şehirle devam
          }
        }).catch(() => fetchByCity());
      } else {
        fetchByCity(); // Permissions API yok → sessiz şehir bazlı (izni asla tetikleme)
      }
    };
    if (izinDahaOnceVerilmis && navigator.geolocation) {
      sessizKonumDene();
    } else {
      fetchByCity();
    }

    return () => { live = false; };
  }, [prayerCity]);

  const nextPrayer = useMemo(() => {
    if (!prayerTimings) return null;
    // name = TR ad (PRAYERS sabiti); render tarafında vakitAdi() ile dile çevrilir
    let next: { name: string; key: string; diff: number } | null = null;
    for (const [name, key] of PRAYERS) {
      const value = prayerTimings[key];
      if (!value) continue;
      const [hour, minute] = value.slice(0, 5).split(":").map(Number);
      const target = new Date(now);
      target.setHours(hour, minute, 0, 0);
      let diff = target.getTime() - now.getTime();
      if (diff <= 0) diff += 86400000;
      if (!next || diff < next.diff) next = { name, key, diff };
    }
    return next;
  }, [now, prayerTimings]);

  const filteredCities = useMemo(() => {
    const value = prayerSearch.trim().toLocaleLowerCase("tr");
    return value ? TURKISH_CITIES.filter((city) => city.toLocaleLowerCase("tr").includes(value)) : TURKISH_CITIES;
  }, [prayerSearch]);

  return { prayerTimings, nextPrayer, filteredCities };
}