'use client'

import Link from 'next/link'
import { useProgress } from '@/lib/progress'
import type { SidebarModule } from './CourseSidebar'

type Props = {
  slug: string
  title: string
  tagline: string
  rulesVersion: string
  modules: SidebarModule[]
}

export function CourseHeader({ slug, title, tagline, rulesVersion, modules }: Props) {
  const { progress, resetCourse } = useProgress()
  const read = progress[slug] ?? {}

  const lessons = modules.flatMap((m) => m.lessons)
  const done = lessons.reduce((n, l) => (read[l.id] ? n + 1 : n), 0)
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0

  const resume = lessons.find((l) => !read[l.id]) ?? lessons[0]
  const complete = done === lessons.length

  return (
    <header className="mt-4">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
        <h1 className="text-[34px] font-[650] leading-tight tracking-[-0.026em] sm:text-[42px]">
          {title}
        </h1>
      </div>

      <p className="mt-3 max-w-[58ch] text-[16px] leading-[1.6] text-[var(--color-ink-muted)]">
        {tagline}
      </p>

      <p className="mt-4 text-[13px] text-[var(--color-ink-subtle)]">
        {modules.length} módulos · {lessons.length} lecciones ·{' '}
        <span className="font-[560] text-[var(--color-ink-muted)]">{rulesVersion}</span>
      </p>

      {/* -------------------------------------------------------- avance */}
      <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[13px] font-[600] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
            Tu avance
          </span>
          <span className="text-[13px] tabular-nums text-[var(--color-ink-muted)]">
            <span className="text-[17px] font-[650] text-[var(--color-ink)]">{done}</span>
            {' de '}
            {lessons.length} lecciones
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-3)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Avance del curso de ${title}`}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/curso/${slug}/${resume.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white shadow-[var(--shadow-subtle)] transition-all hover:bg-[var(--color-brand-strong)] active:scale-[0.985] dark:text-[#06231a]"
          >
            {complete ? 'Repasar desde el principio' : done > 0 ? 'Continuar' : 'Empezar el curso'}
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {done > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Borrar tu avance en el curso de ${title}?`)) resetCourse(slug)
              }}
              className="rounded-lg px-3 py-2.5 text-[13px] font-[540] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            >
              Borrar avance
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
