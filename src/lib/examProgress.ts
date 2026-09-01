'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { ExamPart, PartResult } from './exam'

/**
 * Estado del examen final y de los partidos prácticos, guardado en el
 * navegador.
 *
 * La parte D es autoinformada: la app no puede verificar que un partido se
 * haya dirigido. Se guarda como lo que es, un registro propio, y el
 * certificado lo dice.
 */

const KEY = 'aa-exam'

export type PracticeMatch = {
  id: string
  date: string
  competition: string
  format: string
  teams: string
  notes: string
  /** Solo el segundo partido se evalúa (§ 74). */
  rubric?: Record<string, number>
  rubricTotal?: number
}

export type CourseExam = {
  parts: Partial<Record<ExamPart, PartResult>>
  matches: PracticeMatch[]
  /** Nombre para el certificado. Se pide una sola vez. */
  name?: string
}

export type ExamMap = Record<string, CourseExam>

const EMPTY_COURSE: CourseExam = { parts: {}, matches: [] }

let snapshot: ExamMap = {}
let loaded = false
const listeners = new Set<() => void>()
const EMPTY: ExamMap = {}

function read(): ExamMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as ExamMap) : {}
  } catch {
    return {}
  }
}

function write(next: ExamMap) {
  snapshot = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Sin almacenamiento el examen se puede rendir igual; no queda registrado.
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

function getSnapshot(): ExamMap {
  if (!loaded) {
    snapshot = read()
    loaded = true
  }
  return snapshot
}

function getServerSnapshot(): ExamMap {
  return EMPTY
}

export function useExamProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const courseExam = useCallback(
    (slug: string): CourseExam => state[slug] ?? EMPTY_COURSE,
    [state],
  )

  const update = useCallback((slug: string, change: (current: CourseExam) => CourseExam) => {
    const current = getSnapshot()
    const existing = current[slug] ?? EMPTY_COURSE
    write({ ...current, [slug]: change(existing) })
  }, [])

  const recordPart = useCallback(
    (slug: string, part: ExamPart, correct: number, total: number, pass: number) => {
      update(slug, (current) => {
        const previous = current.parts[part]
        const passed = correct >= pass

        return {
          ...current,
          parts: {
            ...current.parts,
            [part]: {
              correct: Math.max(correct, previous?.correct ?? 0),
              total,
              passed: (previous?.passed ?? false) || passed,
              attempts: (previous?.attempts ?? 0) + 1,
              at: new Date().toISOString(),
            },
          },
        }
      })
    },
    [update],
  )

  const addMatch = useCallback(
    (slug: string, match: PracticeMatch) => {
      update(slug, (current) => ({ ...current, matches: [...current.matches, match] }))
    },
    [update],
  )

  const removeMatch = useCallback(
    (slug: string, id: string) => {
      update(slug, (current) => ({
        ...current,
        matches: current.matches.filter((m) => m.id !== id),
      }))
    },
    [update],
  )

  const setName = useCallback(
    (slug: string, name: string) => {
      update(slug, (current) => ({ ...current, name }))
    },
    [update],
  )

  const reset = useCallback((slug: string) => {
    const current = getSnapshot()
    const next = { ...current }
    delete next[slug]
    write(next)
  }, [])

  return { state, courseExam, recordPart, addMatch, removeMatch, setName, reset }
}
