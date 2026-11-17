// FinEXP service worker. Built into dist/sw.js by the plugin in vite.config.js, which fills in the
// cache version and the list of files of that build.
//
// Offline strategy:
//  - the app itself (HTML, JS, CSS, icons) is cached when the worker installs, so the app opens
//    even without a connection;
//  - page navigations try the network first and fall back to the cached app (every route works
//    offline, since the app is a single page);
//  - other static files: cache first, network as a fallback (and cached for next time).
// Calls to the API are never cached: financial data is not stored on the device and is always
// fresh when there is a connection.

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

// A new build replaces the previous cache.
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

  // Only this site's GET requests; the API lives on another origin and is left alone.
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
