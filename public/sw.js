// ═══════════════════════════════════════════════════════════
// Nûr Stüdyo Service Worker (PWA)
// - "Ana Ekrana Ekle" için gerekli
// - İleriye dönük push bildirimleri (Öğüt Vakti) için altyapı
// Strateji: app shell network-first (veri hep taze), statik
// varlıklar cache-first. Kur'an/API istekleri ASLA önbelleklenmez.
// ═══════════════════════════════════════════════════════════

// ★ Her deployda bu sürümü 1 artır — önbellek eski sürümde takılı kalmasın
const CACHE = "nurstudyo-v5";
// ★ SES CACHE'İ SÜRÜMSÜZ (29.09 düzeltme): adına ASLA sürüm ekleme! Dinlenen ayet
//   sesleri (çevrimdışı tilavet) kullanıcının cihazında BİRİKİR; ad sürümlü olsaydı
//   her kabuk sürüm artışında activate temizliği indirilen sesleri silerdi.
//   Eski sürümlü adlar (v3/v4) activate'te bu adına TAŞINIR (aşağıda).
const AUDIO_CACHE = "nurstudyo-audio";
const AUDIO_ESKI_ADLAR = ["nurstudyo-audio-v3", "nurstudyo-audio-v4"];
const SHELL = ["/logo.png", "/manifest.json"];
const AUDIO_LIMIT = 120; // en fazla 120 ayet sesi (~45MB) saklanır — en eskiler silinir

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// ★ Yeni sürüm beklemedeyken sayfadan gelen SKIP_WAITING mesajı → anında devreye gir
// ★ SÜRÜM RAPORLAMA (29.09 — "güncelleme bandı sürekli geliyor" fix):
//   Sayfa GET_VERSION sorar; SW kendi sürümünü döner:
//   - BEKLEYEN_SURUM: bu worker henüz kontrolü almamışsa (gerçek beklemedeki sürüm)
//   - AKTIF_SURUM: bu worker kontrol ediyorsa (sayfanın üzerindeki sürüm)
//   Bant artık "installing→installed geçici anında" değil, yalnız GERÇEK bekleyen
//   sürüm varsa basılır; kapatılan sürüm localStorage'a yazılıp bir daha nag etmez.
self.addEventListener("message", (event) => {
  const tip = event.data && event.data.type;
  if (tip === "SKIP_WAITING") { self.skipWaiting(); return; }
  if (tip !== "GET_VERSION") return;
  // Bu worker pencere kontrol EDİYORSA aktiftir; etmiyorsa beklemededir.
  self.clients.matchAll({ type: "window", includeUncontrolled: false })
    .then((musteriler) => {
      const bekliyorMu = musteriler.length === 0;
      const cevap = (type) => event.source && event.source.postMessage({ type, v: CACHE });
      if (bekliyorMu) cevap("BEKLEYEN_SURUM"); else cevap("AKTIF_SURUM");
    })
    .catch(() => { if (event.source) event.source.postMessage({ type: "AKTIF_SURUM", v: CACHE }); });
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then(async (keys) => {
        // ★ FIX (29.09, güçlendirildi): AUDIO_CACHE korunur — eskiden her aktivasyonda
        //   siliniyordu, çevrimdışı tilavet cache'i deploy başına çöpe gidiyordu.
        //   Sürümsüz ad dönemine geçiş: eski sürümlü ses cache'lerindeki (v3/v4)
        //   ayet sesleri AUDIO_CACHE'e TAŞINIR, sonra eskiler silinir — kullanıcının
        //   indirdiği sesler hiç kaybolmaz (taşıma için eşleşen URL'ler atlanır).
        for (const eski of AUDIO_ESKI_ADLAR) {
          if (!keys.includes(eski)) continue;
          try {
            const hedef = await caches.open(AUDIO_CACHE);
            const mevcut = new Set((await hedef.keys()).map((r) => r.url));
            const kaynak = await caches.open(eski);
            for (const istek of await kaynak.keys()) {
              if (mevcut.has(istek.url)) continue;
              const cevap = await kaynak.match(istek);
              if (cevap) { await hedef.put(istek, cevap); mevcut.add(istek.url); }
            }
            await caches.delete(eski);
          } catch { /* taşıma başarısız olsa da site bozulmaz; eski cache yine silinmez */ }
        }
        // Yabancı/eski kabuk cache'leri sil — ses cache'i (sürümsüz ad) korunur
        return Promise.all(keys.filter((k) => k !== CACHE && !k.startsWith("nurstudyo-audio")).map((k) => caches.delete(k)));
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Sadece GET önbelleklenir; çapraz kaynak istekleri aşağıda ses özel işlenir
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) {
    // ★ KUR'AN SESİ CACHE-FIRST (İş 24+59 — ÇEVRİMDIŞI TİLAVET):
    //   everyayah/mp3quran mp3'leri dinlendikçe cache'e yazılır; bir daha
    //   dinlenen ayet İNTERNETSİZ de çalar. Sadece audio uzantıları yakalanır.
    //   ★ v4: audio.qurancdn.com (kelime-kartı sesleri) yakalanmaz — eski
    //     SW bu isteklerde hata yuttu; tarayıcı kendi çalar, cache'e gerek yok.
    if (!url.hostname.includes("qurancdn") && (/\.(mp3|ogg|wav)(\?|$)/.test(url.pathname) || url.hostname.includes("everyayah") || url.hostname.includes("mp3quran"))) {
      event.respondWith(
        caches.open(AUDIO_CACHE).then(async (cache) => {
          const hit = await cache.match(event.request);
          if (hit) return hit;
          try {
            const res = await fetch(event.request);
            if (res.ok && (res.status === 200)) {
              // Range istekleri cache'lenemez — yalnız tam cevap saklanır
              if (!event.request.headers.has("range")) {
                await cache.put(event.request, res.clone());
                await audioKirp(cache);
              }
            }
            return res;
          } catch {
            // Çevrimdışı + cache'te yok → net hata (UI zaten "indirilemedi" gösterir)
            throw new Error("Çevrimdışı — bu ayet daha önce dinlenmemiş");
          }
        })
      );
    }
    return; // diğer çapraz kaynaklar geçer
  }
  if (url.pathname.startsWith("/api/")) return;

  /** En eskilerini sil — depo şişmesin */
  async function audioKirp(cache) {
    try {
      const keys = await cache.keys();
      if (keys.length <= AUDIO_LIMIT) return;
      // Cache API sıra garantisi vermez; basit yaklaşım: fazlalığı sil
      const fazla = keys.length - AUDIO_LIMIT;
      for (let i = 0; i < fazla; i++) await cache.delete(keys[i]);
    } catch { /* yoksay */ }
  }

  // ★ Ana sayfa: NETWORK-FIRST — yeni deploy anında kullanıcıya ulaşsın.
  //   (Eskiden cache-first idi; güncellemeler önbellekte takılı kalıyordu.)
  if (url.pathname === "/") {
    event.respondWith(
      fetch(event.request).then((res) => {
        const kopya = res.clone();
        caches.open(CACHE).then((cache) => cache.put("/", kopya));
        return res;
      }).catch(() => caches.match("/") || fetch(event.request))
    );
    return;
  }

  // Statik varlıklar (hash'li dosya adları): cache-first
  // Not: index.html referansı değişince hash değişir, bu yüzden güvenli.
  if (/\.(png|jpg|jpeg|svg|ico|woff2?|css|js|json|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((hit) => {
        if (hit) return hit;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const kopya = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, kopya));
          }
          return res;
        }).catch(() => hit);
      })
    );
  }
  // Diğer same-origin istekler (SPA rotaları) → network-first, çevrimdışında shell
  else {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    );
  }
});

// İleriye dönük: push bildirim altyapısı (Öğüt Vakti V2)
self.addEventListener("push", (event) => {
  let data = { title: "Nûr Stüdyo", body: "Bugünün ögüdü hazır 🌙" };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch { /* düz metin */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
      badge: "/logo.png",
      lang: "tr",
      tag: data.tag || "nur-ogut",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const acik = clients.find((c) => c.url.includes(self.location.origin));
      if (acik) return acik.focus();
      return self.clients.openWindow("/");
    })
  );
});
