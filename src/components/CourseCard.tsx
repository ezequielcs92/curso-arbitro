'use client'

import Link from 'next/link'
import { ProgressRing } from './ProgressRing'
import { useProgress } from '@/lib/progress'
import { accentClass } from '@/lib/accent'

type Props = {
  slug: string
  title: string
  tagline: string
  rulesVersion: string
  moduleCount: number
  lessonIds: string[]
  firstLessonId: string
}

export function CourseCard({
  slug,
  title,
  tagline,
  rulesVersion,
  moduleCount,
  lessonIds,
  firstLessonId,
}: Props) {
  const { progress } = useProgress()
  const read = progress[slug] ?? {}

  const done = lessonIds.reduce((n, id) => (read[id] ? n + 1 : n), 0)
  const started = done > 0
  const complete = done >= lessonIds.length

  // Se retoma en la primera lección sin leer, no en la última visitada: es lo
  // que espera alguien que avanza en orden.
  const resumeId = lessonIds.find((id) => !read[id]) ?? firstLessonId

  return (
    <Link
      href={`/curso/${slug}/${started ? resumeId : firstLessonId}`}
      className={`${accentClass(slug)} group relative flex flex-col rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-card)] sm:p-6`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-5 top-0 h-px bg-[var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-60 sm:inset-x-6"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 flex-none rounded-full bg-[var(--accent)]"
            />
            <h2 className="truncate text-[19px] font-[640] tracking-[-0.016em]">{title}</h2>
          </span>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
            {tagline}
          </p>
        </div>

        <ProgressRing
          value={done}
          total={lessonIds.length}
          size={44}
          showLabel
          className="mt-0.5"
        />
      </div>

      <dl className="mt-5 border-t border-[var(--color-line)] pt-4 text-[12.5px]">
        <div className="flex items-baseline gap-4">
          <div className="flex items-baseline gap-1.5">
            <dt className="sr-only">Módulos</dt>
            <dd className="font-[640] tabular-nums">{moduleCount}</dd>
            <dd className="text-[var(--color-ink-subtle)]">módulos</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="sr-only">Lecciones</dt>
            <dd className="font-[640] tabular-nums">{lessonIds.length}</dd>
            <dd className="text-[var(--color-ink-subtle)]">lecciones</dd>
          </div>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <dt className="text-[var(--color-ink-subtle)]">Reglamento</dt>
          <dd className="font-[560] text-[var(--color-ink-muted)]">{rulesVersion}</dd>
        </div>
      </dl>

      <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-[580] text-[var(--accent)]">
        {complete ? 'Repasar el curso' : started ? 'Continuar' : 'Empezar el curso'}
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3.5 10.5 8 6 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  )
}
