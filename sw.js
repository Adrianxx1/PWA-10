// Plantilla de Service Worker

// 1. Nombre y archivos a cachear
const CACHE_NAME = "mi-pwa-cache-v1";
const BASE_PATH = "/pwa-ejemplo/";
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}icons/icon-192x192.png`,
  `${BASE_PATH}icons/icon-512x512.png`
];

// 2. INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 3. ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  return self.clients.claim();
});

// 4. FETCH
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // Si es una navegación, intenta red -> offline.html si falla
    event.respondWith(
      fetch(event.request).catch(() => caches.match(`${BASE_PATH}offline.html`))
    );
  } else {
    // Para otros recursos, primero busca en caché
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// 5. PUSH (Opcional)
self.addEventListener("push", event => {
  const data = event.data ? event.data.text() : "Notificación sin datos";
  event.waitUntil(
    self.registration.showNotification("Mi PWA", { body: data })
  );
});
