const megaBitz = "mega-bitz-v2.0"
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
    caches.open(megaBitz).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})
