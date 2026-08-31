/*
 * Service worker de Árbitro Amateur.
 *
 * La app se usa al costado de una cancha, donde la señal es mala o no hay.
 * Todo el contenido es estático, así que lo que se visitó una vez queda
 * disponible sin conexión, y un curso entero se puede dejar guardado a mano
 * antes de salir.
 *
 * Escrito a mano y sin dependencias: la app no tiene datos que sincronizar ni
 * peticiones que reintentar, así que una librería de caché sería más código
 * del que hace falta.
 */

const VERSION = 'v2'
const SHELL = `aa-shell-${VERSION}`
const PAGES = `aa-pages-${VERSION}`
const ASSETS = `aa-assets-${VERSION}`
const FLIGHT = `aa-flight-${VERSION}`

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
  const keep = new Set([SHELL, PAGES, ASSETS, FLIGHT])
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
  return isImmutableAsset(url) || /\.(png|svg|ico|webmanifest|woff2?)$/.test(url.pathname)
}

/**
 * Next no pide el HTML al navegar dentro de la app: pide una carga propia del
 * router con la cabecera `RSC`. Si eso no está en caché, moverse entre
 * lecciones sin conexión falla aunque el HTML sí esté guardado. Se guarda
 * aparte, con la ruta como clave, porque la URL lleva un parámetro que cambia.
 */
function isFlightRequest(request) {
  return request.headers.get('RSC') === '1'
}

function flightKey(url) {
  return url.origin + url.pathname
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (isFlightRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(FLIGHT).then((cache) => cache.put(flightKey(url), copy))
          return response
        })
        .catch(() => caches.open(FLIGHT).then((cache) => cache.match(flightKey(url)))),
    )
    return
  }

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

  // El índice de búsqueda: red primero, y queda guardado para usarlo sin señal.
  if (url.pathname === '/search-index') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(PAGES).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request)),
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

// ---------------------------------------------------------------------------
// Guardar un curso entero
// ---------------------------------------------------------------------------

/**
 * Guarda una página completa: el HTML, la carga del router y —la primera vez—
 * los archivos estáticos que esa página referencia. Sin esto último, un curso
 * guardado sin haber abierto nunca una lección se quedaría sin su JavaScript.
 */
async function cachePage(url, pages, flight, assets, assetsSeen) {
  const response = await fetch(url, { credentials: 'same-origin' })
  if (!response.ok) throw new Error(`${response.status} en ${url}`)

  const html = await response.clone().text()
  await pages.put(url, response)

  try {
    const flightResponse = await fetch(url, {
      headers: { RSC: '1' },
      credentials: 'same-origin',
    })
    if (flightResponse.ok) {
      await flight.put(flightKey(new URL(url, self.location.origin)), flightResponse)
    }
  } catch {
    // Sin la carga del router la página igual abre; solo obliga a recargar.
  }

  if (assetsSeen.size === 0) {
    const found = html.match(/\/_next\/static\/[^"'\s]+?\.(?:js|css)/g) ?? []
    for (const asset of found) {
      if (assetsSeen.has(asset)) continue
      assetsSeen.add(asset)
      try {
        const assetResponse = await fetch(asset, { credentials: 'same-origin' })
        if (assetResponse.ok) await assets.put(asset, assetResponse)
      } catch {
        // Un archivo suelto que falla no invalida la descarga.
      }
    }
  }
}

async function cacheCourse(urls, port) {
  const pages = await caches.open(PAGES)
  const flight = await caches.open(FLIGHT)
  const assets = await caches.open(ASSETS)
  const assetsSeen = new Set()

  let done = 0
  let failed = 0

  for (const url of urls) {
    try {
      await cachePage(url, pages, flight, assets, assetsSeen)
    } catch {
      failed++
    }
    done++
    port?.postMessage({ type: 'progress', done, total: urls.length, failed })
  }

  port?.postMessage({ type: 'done', done, total: urls.length, failed })
}

async function courseStatus(urls, port) {
  const pages = await caches.open(PAGES)

  let cached = 0
  for (const url of urls) {
    if (await pages.match(url)) cached++
  }

  port?.postMessage({ type: 'status', cached, total: urls.length })
}

async function forgetCourse(urls, port) {
  const pages = await caches.open(PAGES)
  const flight = await caches.open(FLIGHT)

  for (const url of urls) {
    await pages.delete(url)
    await flight.delete(flightKey(new URL(url, self.location.origin)))
  }

  port?.postMessage({ type: 'forgotten', total: urls.length })
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return

  const port = event.ports && event.ports[0]

  if (data.type === 'cache-course' && Array.isArray(data.urls)) {
    event.waitUntil(cacheCourse(data.urls, port))
  } else if (data.type === 'course-status' && Array.isArray(data.urls)) {
    event.waitUntil(courseStatus(data.urls, port))
  } else if (data.type === 'forget-course' && Array.isArray(data.urls)) {
    event.waitUntil(forgetCourse(data.urls, port))
  }
})
