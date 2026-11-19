// service worker: guarda os arquivos do app pra abrir offline. chamada da api nunca vai pro cache

const CACHE_VERSION = "__CACHE_VERSION__";
const CACHE_NAME = `finexp-${CACHE_VERSION}`;
const PRECACHE_URLS = ["__PRECACHE_URLS__"];
const APP_SHELL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// apaga os caches velhos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("finexp-") && name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isApiCall = (url) =>
  url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // só os GET desse site
  if (request.method !== "GET" || url.origin !== self.location.origin || isApiCall(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(APP_SHELL, { cacheName: CACHE_NAME })),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
