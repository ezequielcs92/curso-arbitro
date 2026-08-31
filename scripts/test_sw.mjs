/*
 * Prueba de la lógica de caché del service worker.
 *
 * El navegador embebido del panel no permite registrar service workers, así
 * que el comportamiento se ejerce acá: se simulan `caches`, `fetch` y los
 * eventos, y se corre el mismo archivo que se despliega.
 */

import fs from 'node:fs'

// --- entorno simulado -------------------------------------------------------

class FakeResponse {
  constructor(body, { ok = true, status = 200 } = {}) {
    this.body = body
    this.ok = ok
    this.status = status
  }
  clone() {
    return new FakeResponse(this.body, { ok: this.ok, status: this.status })
  }
  async text() {
    return this.body
  }
}

class FakeCache {
  constructor(name) {
    this.name = name
    this.store = new Map()
  }
  async put(key, response) {
    this.store.set(String(key), response)
  }
  async match(key) {
    return this.store.get(String(key))
  }
  async delete(key) {
    return this.store.delete(String(key))
  }
  async addAll(urls) {
    for (const u of urls) this.store.set(String(u), new FakeResponse('precache'))
  }
}

const cacheStore = new Map()
const caches = {
  async open(name) {
    if (!cacheStore.has(name)) cacheStore.set(name, new FakeCache(name))
    return cacheStore.get(name)
  },
  async keys() {
    return [...cacheStore.keys()]
  },
  async delete(name) {
    return cacheStore.delete(name)
  },
  async match(key) {
    for (const c of cacheStore.values()) {
      const hit = await c.match(key)
      if (hit) return hit
    }
    return undefined
  },
}

const fetched = []
let failNext = new Set()

async function fetch(url, options = {}) {
  const key = String(url)
  fetched.push({ url: key, rsc: options.headers?.RSC === '1' })

  if (failNext.has(key)) return new FakeResponse('', { ok: false, status: 500 })

  // El HTML de una lección referencia sus archivos estáticos.
  const body = key.includes('_next')
    ? 'chunk'
    : '<html><script src="/_next/static/chunks/main-abc123.js"></script>' +
      '<link href="/_next/static/css/app-def456.css"></html>'

  return new FakeResponse(body)
}

const listeners = new Map()
const self = {
  location: { origin: 'https://example.test' },
  addEventListener(name, fn) {
    listeners.set(name, fn)
  },
  skipWaiting: async () => {},
  clients: { claim: async () => {} },
}

globalThis.self = self
globalThis.caches = caches
globalThis.fetch = fetch
globalThis.FakeResponse = FakeResponse
globalThis.Response = FakeResponse

// --- se carga el service worker real ---------------------------------------

const source = fs.readFileSync(
  new URL('../public/sw.js', import.meta.url),
  'utf8',
)
new Function('self', 'caches', 'fetch', 'Response', source)(
  self,
  caches,
  fetch,
  FakeResponse,
)

// --- utilidades de prueba ---------------------------------------------------

let failures = 0
function check(label, condition, detail = '') {
  const mark = condition ? 'OK  ' : 'FALLA'
  if (!condition) failures++
  console.log(`${mark} ${label}${detail ? '  ->  ' + detail : ''}`)
}

function sendMessage(data) {
  const messages = []
  const port = { postMessage: (m) => messages.push(m) }
  const waits = []

  listeners.get('message')({
    data,
    ports: [port],
    waitUntil: (p) => waits.push(p),
  })

  return Promise.all(waits).then(() => messages)
}

// --- pruebas ----------------------------------------------------------------

const urls = ['/curso/football', '/curso/football/f1-l1', '/curso/football/f1-l2', '/search-index']

console.log('\n== guardar un curso ==')
const messages = await sendMessage({ type: 'cache-course', urls })

const done = messages.filter((m) => m.type === 'progress')
const final = messages.find((m) => m.type === 'done')

check('informa avance por cada página', done.length === urls.length, `${done.length} avisos`)
check('termina con el total correcto', final?.total === urls.length && final?.done === urls.length)
check('no reporta fallos', final?.failed === 0)

const pages = await caches.open('aa-pages-v2')
const flight = await caches.open('aa-flight-v2')
const assets = await caches.open('aa-assets-v2')

check('guarda el HTML de cada página', pages.store.size === urls.length, `${pages.store.size}`)
check(
  'guarda la carga del router de cada página',
  flight.store.size === urls.length,
  `${flight.store.size}`,
)
check(
  'la clave del router es la ruta absoluta sin query',
  flight.store.has('https://example.test/curso/football/f1-l1'),
)
check('guarda los archivos estáticos que referencia el HTML', assets.store.size === 2, `${assets.store.size}`)
check(
  'los archivos estáticos se piden una sola vez, no por página',
  fetched.filter((f) => f.url.includes('_next')).length === 2,
)
check(
  'pide la variante RSC de cada página',
  fetched.filter((f) => f.rsc).length === urls.length,
)

console.log('\n== consultar el estado ==')
const status = await sendMessage({ type: 'course-status', urls })
check('informa todo guardado', status[0]?.cached === urls.length, JSON.stringify(status[0]))

console.log('\n== una página que falla no aborta el resto ==')
cacheStore.clear()
fetched.length = 0
failNext = new Set(['/curso/football/f1-l1'])
const partial = await sendMessage({ type: 'cache-course', urls })
const partialFinal = partial.find((m) => m.type === 'done')
check('cuenta el fallo', partialFinal?.failed === 1, JSON.stringify(partialFinal))
check('sigue con las demás', partialFinal?.done === urls.length)
check(
  'guarda las que sí funcionaron',
  (await caches.open('aa-pages-v2')).store.size === urls.length - 1,
)

console.log('\n== borrar la copia ==')
failNext = new Set()
cacheStore.clear()
await sendMessage({ type: 'cache-course', urls })
const forgotten = await sendMessage({ type: 'forget-course', urls })
check('confirma el borrado', forgotten[0]?.type === 'forgotten')
check('la caché de páginas queda vacía', (await caches.open('aa-pages-v2')).store.size === 0)
check('la caché del router queda vacía', (await caches.open('aa-flight-v2')).store.size === 0)

const after = await sendMessage({ type: 'course-status', urls })
check('el estado vuelve a cero', after[0]?.cached === 0, JSON.stringify(after[0]))

console.log(failures === 0 ? '\nTodo bien.\n' : `\n${failures} comprobaciones fallaron.\n`)
process.exit(failures === 0 ? 0 : 1)
