'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Resultados de los cuestionarios, guardados en el navegador.
 *
 * Se guarda el mejor intento y no el último: repetir un módulo para repasar no
 * debería borrar una nota que ya se había conseguido.
 */

const KEY = 'aa-quiz'

export type ModuleResult = {
  /** Mejor nota obtenida, de 0 a 100. */
  best: number
  attempts: number
  passed: boolean
  /** Fecha ISO del último intento. */
  at: string
}

export type QuizMap = Record<string, Record<string, ModuleResult>>

let snapshot: QuizMap = {}
let loaded = false
const listeners = new Set<() => void>()

const EMPTY: QuizMap = {}

function read(): QuizMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as QuizMap) : {}
  } catch {
    return {}
  }
}

function write(next: QuizMap) {
  snapshot = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin almacenamiento el resultado se pierde al cerrar, pero el
    // cuestionario se puede responder igual.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  if (!loaded) {
    snapshot = read()
    loaded = true
  }
  listeners.add(listener)

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

function getSnapshot(): QuizMap {
  if (!loaded) {
    snapshot = read()
    loaded = true
  }
  return snapshot
}

function getServerSnapshot(): QuizMap {
  return EMPTY
}

export function useQuizProgress() {
  const results = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const resultFor = useCallback(
    (slug: string, moduleId: string): ModuleResult | null =>
      results[slug]?.[moduleId] ?? null,
    [results],
  )

  const record = useCallback(
    (slug: string, moduleId: string, scoreValue: number, requiredScore: number) => {
      const current = getSnapshot()
      const previous = current[slug]?.[moduleId]

      const next: ModuleResult = {
        best: Math.max(scoreValue, previous?.best ?? 0),
        attempts: (previous?.attempts ?? 0) + 1,
        passed: (previous?.passed ?? false) || scoreValue >= requiredScore,
        at: new Date().toISOString(),
      }

      write({ ...current, [slug]: { ...(current[slug] ?? {}), [moduleId]: next } })
    },
    [],
  )

  const resetCourse = useCallback((slug: string) => {
    const current = getSnapshot()
    const next = { ...current }
    delete next[slug]
    write(next)
  }, [])

  return { results, resultFor, record, resetCourse }
}
