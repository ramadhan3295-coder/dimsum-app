const CACHE_NAME = "dimsum-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",           // ✅ ganti dari script.js
  "/manifest.json",    // ✅ ikut dicache
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install service worker & cache file
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: caching files...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate service worker & hapus cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: menghapus cache lama", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});