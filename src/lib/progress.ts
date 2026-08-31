'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Avance de lectura, guardado en el navegador.
 *
 * No hay cuentas ni servidor todavía: el curso es contenido estático y el
 * único estado propio del usuario es qué lecciones leyó. Se guarda en
 * localStorage bajo una sola clave.
 *
 * Es un store externo y no estado de React porque hay varios componentes
 * mostrando lo mismo a la vez —la barra lateral, el anillo de la portada, el
 * botón del pie de la lección— y todos tienen que moverse juntos.
 */

const KEY = 'aa-progress'

export type ProgressMap = Record<string, Record<string, true>>

let snapshot: ProgressMap = {}
let loaded = false
const listeners = new Set<() => void>()

const EMPTY: ProgressMap = {}

function read(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as ProgressMap) : {}
  } catch {
    return {}
  }
}

function write(next: ProgressMap) {
  snapshot = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Modo privado o almacenamiento lleno: el avance se pierde al cerrar,
    // pero la app sigue funcionando.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  if (!loaded) {
    snapshot = read()
    loaded = true
  }
  listeners.add(listener)

  // Otra pestaña de la misma app también puede marcar lecciones.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      snapshot = read()
      listener()
    }
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot(): ProgressMap {
  if (!loaded) {
    snapshot = read()
    loaded = true
  }
  return snapshot
}

/** En el servidor no hay avance: se renderiza el estado vacío. */
function getServerSnapshot(): ProgressMap {
  return EMPTY
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isDone = useCallback(
    (slug: string, lessonId: string) => Boolean(progress[slug]?.[lessonId]),
    [progress],
  )

  const countFor = useCallback(
    (slug: string, lessonIds: string[]) => {
      const done = progress[slug]
      if (!done) return 0
      let n = 0
      for (const id of lessonIds) if (done[id]) n++
      return n
    },
    [progress],
  )

  const toggle = useCallback((slug: string, lessonId: string) => {
    const current = getSnapshot()
    const forSlug = { ...(current[slug] ?? {}) }

    if (forSlug[lessonId]) {
      delete forSlug[lessonId]
    } else {
      forSlug[lessonId] = true
    }

    write({ ...current, [slug]: forSlug })
  }, [])

  const markDone = useCallback((slug: string, lessonId: string) => {
    const current = getSnapshot()
    if (current[slug]?.[lessonId]) return
    write({ ...current, [slug]: { ...(current[slug] ?? {}), [lessonId]: true } })
  }, [])

  const resetCourse = useCallback((slug: string) => {
    const current = getSnapshot()
    const next = { ...current }
    delete next[slug]
    write(next)
  }, [])

  return { progress, isDone, countFor, toggle, markDone, resetCourse }
}
