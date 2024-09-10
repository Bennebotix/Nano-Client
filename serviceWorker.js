const megaBitz = "mega-bitz-v1"
const assets = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/images/icon512_maskable.png",
  "/images/icon512_rounded.png",
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
