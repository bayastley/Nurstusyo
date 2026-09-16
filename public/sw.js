// ═══════════════════════════════════════════════════════════
// Nûr Stüdyo Service Worker (PWA)
// - "Ana Ekrana Ekle" için gerekli
// - İleriye dönük push bildirimleri (Öğüt Vakti) için altyapı
// Strateji: app shell network-first (veri hep taze), statik
// varlıklar cache-first. Kur'an/API istekleri ASLA önbelleklenmez.
// ═══════════════════════════════════════════════════════════

const CACHE = "nurstudyo-v1";
const SHELL = ["/", "/logo.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Sadece GET önbelleklenir; API/çapraz kaynak istekleri geçer
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Statik varlıklar: cache-first
  if (/\.(png|jpg|jpeg|svg|ico|woff2?|css|js|json|webmanifest)$/.test(url.pathname) || url.pathname === "/") {
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
