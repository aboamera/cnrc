const CACHE_NAME = "nrc-site-v2";

// Core assets to cache
const CORE_ASSETS = [
  "/assets/css/style.css",
  "/assets/icons/favicon-32x32.png",
  "/assets/icons/favicon-16x16.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/manifest.json",
  "/assets/img/slide1.jpg",
  "/assets/img/slide2.jpg",
  "/assets/img/slide3.jpg",
  "/assets/img/logo_cnrc.png",
  "/assets/img/logo_nrc.jpg",
  "/assets/img/logo_inv.jpg"
];

// Install: pre-cache pages + assets
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        // Get urls.json
        const res = await fetch("/urls.json");
        const urls = await res.json();

        // Clean and normalize
        const cleaned = urls
          .map(u => u.trim().replace(/\/+$/, "/")) // enforce trailing slash
          .filter(u => !!u && u.startsWith("/"));

        // Cache pages
        for (const url of cleaned) {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("⚠️ Failed to cache page:", url, err);
          }
        }

        // Cache core assets
        for (const asset of CORE_ASSETS) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn("⚠️ Failed to cache asset:", asset, err);
          }
        }

        console.log("✅ Service Worker install complete");
      } catch (err) {
        console.error("❌ Failed during install:", err);
      }
    })()
  );
});

// Fetch handler
self.addEventListener("fetch", event => {
  const req = event.request;

  // Handle HTML navigation
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const normalizedUrl = new URL(req.url);
        if (!normalizedUrl.pathname.endsWith("/")) {
          normalizedUrl.pathname += "/";
        }

        // Try cache first
        const cached = await cache.match(normalizedUrl.pathname);
        if (cached) {
          // Update cache in background
          fetch(req).then(networkRes => {
            if (networkRes && networkRes.ok) {
              cache.put(req, networkRes.clone());
            }
          }).catch(() => {});
          return cached;
        }

        // Try network
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.ok) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch {
          return new Response("<h1>⚠️ Page not available offline</h1>", {
            headers: { "Content-Type": "text/html" },
            status: 503
          });
        }
      })()
    );
    return;
  }

  // Handle assets: cache-first, fallback to network
  event.respondWith(
    (async () => {
      try {
        const cachedRes = await caches.match(req);
        if (cachedRes) return cachedRes;

        // Try network
        return await fetch(req);
      } catch (err) {
        // ✅ Always return something
        if (req.destination === "image") {
          return new Response("", { status: 404 }); // blank image placeholder
        }
        return new Response("", { status: 503 }); // fallback for other assets
      }
    })()
  );
});


// Activate: remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Messages: support skipWaiting
self.addEventListener("message", event => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
