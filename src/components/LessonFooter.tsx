'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useProgress } from '@/lib/progress'

type Neighbour = { id: string; title: string } | null

type Props = {
  slug: string
  lessonId: string
  previous: Neighbour
  next: Neighbour
}

export function LessonFooter({ slug, lessonId, previous, next }: Props) {
  const router = useRouter()
  const { isDone, toggle, markDone } = useProgress()
  const done = isDone(slug, lessonId)

  // Flechas para pasar de lección, como en un lector. Se ignora si el foco
  // está en un control o si hay modificadores: ahí las flechas son del sistema.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return

      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return
        }
      }

      if (event.key === 'ArrowRight' && next) router.push(`/curso/${slug}/${next.id}`)
      if (event.key === 'ArrowLeft' && previous) router.push(`/curso/${slug}/${previous.id}`)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, slug, next, previous])

  function continueOn() {
    markDone(slug, lessonId)
    if (next) router.push(`/curso/${slug}/${next.id}`)
  }

  return (
    <div className="mt-16 border-t border-[var(--color-line)] pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={next ? continueOn : () => markDone(slug, lessonId)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white shadow-[var(--shadow-subtle)] transition-all hover:bg-[var(--color-brand-strong)] active:scale-[0.985] dark:text-[#06231a]"
        >
          {next ? 'Marcar leída y seguir' : 'Marcar leída'}
          {next && (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => toggle(slug, lessonId)}
          aria-pressed={done}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13.5px] font-[540] transition-colors ${
            done
              ? 'border-[var(--accent,var(--color-brand))] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
              : 'border-[var(--color-line-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
              done
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]'
                : 'border-[var(--color-line-strong)]'
            }`}
          >
            {done && (
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-white dark:text-[#06231a]" fill="none">
                <path
                  d="m3 6.2 2 2 4-4.4"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          {done ? 'Leída' : 'Marcar como leída'}
        </button>
      </div>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Lección anterior y siguiente">
        {previous ? (
          <Link
            href={`/curso/${slug}/${previous.id}`}
            className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-all hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-subtle)]"
          >
            <span className="flex items-center gap-1.5 text-[11.5px] font-[600] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                <path
                  d="M10 3.5 5.5 8 10 12.5"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Anterior
            </span>
            <span className="mt-1.5 block text-[14px] font-[560] leading-snug text-[var(--color-ink-muted)] transition-colors group-hover:text-[var(--color-ink)]">
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link
            href={`/curso/${slug}/${next.id}`}
            className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-right transition-all hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-subtle)]"
          >
            <span className="flex items-center justify-end gap-1.5 text-[11.5px] font-[600] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
              Siguiente
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                <path
                  d="M6 3.5 10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="mt-1.5 block text-[14px] font-[560] leading-snug text-[var(--color-ink-muted)] transition-colors group-hover:text-[var(--color-ink)]">
              {next.title}
            </span>
          </Link>
        )}
      </nav>

      <p className="mt-6 hidden text-[12px] text-[var(--color-ink-subtle)] lg:block">
        Podés moverte entre lecciones con las flechas ← y →.
      </p>
    </div>
  )
}
