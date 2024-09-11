const cacheName = "mega-bitz-v2.0"
const assets = [
  "/",
  "/index.html",
  "/images/icon512_maskable.png",
  "/images/icon512_rounded.png",
  "/css/style.css",
  "/js/cli.js",
  "/js/commands.js",
  "/js/filesystem.js",
  "/js/app.js",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  if (event.request.mode === "navigate" &&
        event.request.method === "GET" &&
        registration.waiting &&
        (await clients.matchAll()).length < 2
        ) {
            registration.waiting.postMessage('skipWaiting');
            return new Response("", {headers: {"Refresh": "0"}});
        }
  fetchEvent.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);

      try {
        const cachedResponse = await cache.match(fetchEvent.request);
        if (cachedResponse) {
          console.log("cachedResponse: ", fetchEvent.request.url);
          return cachedResponse;
        }

        const fetchResponse = await fetch(fetchEvent.request);
        if (fetchResponse) {
          console.log("fetchResponse: ", fetchEvent.request.url);
          await cache.put(fetchEvent.request, fetchResponse.clone());
          return fetchResponse;
        }
      } catch (error) {
        console.log("Fetch failed: ", error);
        const cachedResponse = await cache.match("index.html");
        return cachedResponse;
      }
    })()
  );
})
