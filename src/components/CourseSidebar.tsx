'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useProgress } from '@/lib/progress'
import { ProgressRing } from './ProgressRing'

export type SidebarModule = {
  id: string
  order: number
  title: string
  critical: boolean
  laws: number[]
  lessons: { id: string; order: number; title: string }[]
}

type Props = {
  slug: string
  courseTitle: string
  rulesVersion: string
  modules: SidebarModule[]
  currentLessonId: string
}

export function CourseSidebar({
  slug,
  courseTitle,
  rulesVersion,
  modules,
  currentLessonId,
}: Props) {
  const { progress } = useProgress()
  const read = progress[slug] ?? {}

  const currentModuleId =
    modules.find((m) => m.lessons.some((l) => l.id === currentLessonId))?.id ?? modules[0]?.id

  // Arranca con el módulo actual abierto y el resto plegado: 31 módulos
  // desplegados a la vez no son navegables.
  const [open, setOpen] = useState<Record<string, boolean>>({ [currentModuleId]: true })

  const allLessons = modules.flatMap((m) => m.lessons)
  const doneTotal = allLessons.reduce((n, l) => (read[l.id] ? n + 1 : n), 0)

  return (
    <nav aria-label={`Contenido de ${courseTitle}`} className="text-[13.5px]">
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] pb-4">
        <ProgressRing value={doneTotal} total={allLessons.length} size={38} showLabel />
        <div className="min-w-0">
          <p className="truncate font-[640] tracking-[-0.012em] text-[var(--color-ink)]">
            {courseTitle}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-[var(--color-ink-subtle)]">
            {doneTotal} de {allLessons.length} · {rulesVersion}
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-0.5">
        {modules.map((module) => {
          const moduleDone = module.lessons.reduce((n, l) => (read[l.id] ? n + 1 : n), 0)
          const isOpen = open[module.id] ?? false
          const hasCurrent = module.id === currentModuleId
          const complete = moduleDone === module.lessons.length

          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [module.id]: !isOpen }))}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-surface-2)] ${
                  hasCurrent ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'
                }`}
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-3 w-3 flex-none text-[var(--color-ink-subtle)] transition-transform duration-200 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3.5 10.5 8 6 12.5"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono text-[10.5px] font-[600] uppercase text-[var(--color-ink-subtle)]">
                      {module.id}
                    </span>
                    {module.critical && (
                      <span
                        title="Módulo crítico: exige 85 % para avanzar"
                        className="rounded bg-[var(--color-surface-3)] px-1 py-px text-[9.5px] font-[620] uppercase tracking-[0.04em] text-[var(--color-ink-muted)]"
                      >
                        clave
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[13px] font-[560] leading-snug [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                    {module.title}
                  </span>
                </span>

                <span
                  className={`flex-none font-mono text-[10.5px] tabular-nums ${
                    complete
                      ? 'text-[var(--accent,var(--color-brand))]'
                      : 'text-[var(--color-ink-subtle)]'
                  }`}
                >
                  {moduleDone}/{module.lessons.length}
                </span>
              </button>

              {isOpen && (
                <ul className="mb-1 ml-[1.42rem] border-l border-[var(--color-line)] pl-2">
                  {module.lessons.map((lesson) => {
                    const active = lesson.id === currentLessonId
                    const isRead = Boolean(read[lesson.id])

                    return (
                      <li key={lesson.id} className="relative">
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-[9px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-[var(--accent,var(--color-brand))]"
                          />
                        )}
                        <Link
                          href={`/curso/${slug}/${lesson.id}`}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-start gap-2 rounded-md px-2 py-1.5 leading-snug transition-colors ${
                            active
                              ? 'bg-[var(--color-surface-2)] font-[580] text-[var(--color-ink)]'
                              : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-[5px] h-3 w-3 flex-none rounded-full border transition-colors ${
                              isRead
                                ? 'border-[var(--accent,var(--color-brand))] bg-[var(--accent,var(--color-brand))]'
                                : 'border-[var(--color-line-strong)]'
                            }`}
                          >
                            {isRead && (
                              <svg
                                viewBox="0 0 12 12"
                                className="h-full w-full text-[var(--color-surface)]"
                                fill="none"
                              >
                                <path
                                  d="m3 6.2 2 2 4-4.4"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="text-[12.5px]">{lesson.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
