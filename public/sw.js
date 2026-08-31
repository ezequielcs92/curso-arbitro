/*
 * Service worker de Árbitro Amateur.
 *
 * La app se usa al costado de una cancha, donde la señal es mala o no hay.
 * Todo el contenido es estático, así que lo que se visitó una vez queda
 * disponible sin conexión.
 *
 * Escrito a mano y sin dependencias: la app no tiene datos que sincronizar ni
 * peticiones que reintentar, así que una librería de caché sería más código
 * del que hace falta.
 */

const VERSION = 'v1'
const SHELL = `aa-shell-${VERSION}`
const PAGES = `aa-pages-${VERSION}`
const ASSETS = `aa-assets-${VERSION}`

// Lo mínimo para que la app abra sin red aunque sea la primera vez.
const PRECACHE = ['/', '/formatos', '/offline', '/manifest.webmanifest', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      // Si alguna URL del precache falla, la instalación no debe abortar:
      // la app funciona igual y el resto se cachea al navegar.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL, PAGES, ASSETS])
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

/** Los archivos de Next llevan hash en el nombre: nunca cambian de contenido. */
function isImmutableAsset(url) {
  return url.pathname.startsWith('/_next/static/')
}

function isAsset(url) {
  return (
    isImmutableAsset(url) ||
    /\.(png|svg|ico|webmanifest|woff2?)$/.test(url.pathname)
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navegación: primero la red, para no servir una lección vieja si hay señal.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(PAGES).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached

          const offline = await caches.match('/offline')
          if (offline) return offline

          return new Response('Sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }),
    )
    return
  }

  // Recursos con hash: la caché primero, que siempre es correcta y más rápida.
  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached

        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(ASSETS).then((cache) => cache.put(request, copy))
          }
          return response
        })
      }),
    )
  }
})
