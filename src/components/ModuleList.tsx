'use client'

import Link from 'next/link'
import { useProgress } from '@/lib/progress'
import { useQuizProgress } from '@/lib/quizProgress'
import { ProgressRing } from './ProgressRing'
import type { SidebarModule } from './CourseSidebar'

type Props = {
  slug: string
  modules: SidebarModule[]
  /** Preguntas por módulo. Un módulo sin banco no ofrece cuestionario. */
  questionCounts: Record<string, number>
  requiredScores: Record<string, number>
}

export function ModuleList({ slug, modules, questionCounts, requiredScores }: Props) {
  const { progress } = useProgress()
  const { resultFor } = useQuizProgress()
  const read = progress[slug] ?? {}

  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {modules.map((module) => {
        const done = module.lessons.reduce((n, l) => (read[l.id] ? n + 1 : n), 0)
        const complete = done === module.lessons.length
        const resume = module.lessons.find((l) => !read[l.id]) ?? module.lessons[0]

        const questions = questionCounts[module.id] ?? 0
        const quiz = resultFor(slug, module.id)
        const required = requiredScores[module.id] ?? 80

        return (
          <li key={module.id}>
            <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-line-strong)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-[620] uppercase tracking-[0.05em] text-[var(--color-ink-subtle)]">
                      {module.id}
                    </span>
                    {module.critical && (
                      <span
                        title={`Módulo clave: exige ${required} % para aprobar`}
                        className="rounded bg-[var(--color-surface-3)] px-1.5 py-px text-[9.5px] font-[640] uppercase tracking-[0.05em] text-[var(--color-ink-muted)]"
                      >
                        clave
                      </span>
                    )}
                  </span>
                  <h3 className="mt-1.5 text-[16px] font-[620] leading-snug tracking-[-0.014em]">
                    <Link
                      href={`/curso/${slug}/${resume.id}`}
                      className="transition-opacity hover:opacity-75"
                    >
                      {module.title}
                    </Link>
                  </h3>
                </div>
                <ProgressRing value={done} total={module.lessons.length} size={34} showLabel />
              </div>

              <p className="mt-3 text-[12.5px] text-[var(--color-ink-subtle)]">
                {module.lessons.length} lecciones
                {module.laws.length > 0 && (
                  <>
                    {' · '}
                    {module.laws.length === 1
                      ? `Regla ${module.laws[0]}`
                      : `Reglas ${module.laws[0]}–${module.laws[module.laws.length - 1]}`}
                  </>
                )}
              </p>

              <div className="mt-4 flex flex-1 flex-wrap items-end justify-between gap-3">
                <Link
                  href={`/curso/${slug}/${resume.id}`}
                  className="group inline-flex items-center gap-1.5 text-[13px] font-[560] text-[var(--accent,var(--color-brand))]"
                >
                  {complete ? 'Repasar' : done > 0 ? 'Continuar' : 'Empezar'}
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
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
                </Link>

                {questions > 0 && (
                  <Link
                    href={`/curso/${slug}/test/${module.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-[560] transition-colors ${
                      quiz?.passed
                        ? 'border-[var(--accent,var(--color-brand))] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                        : 'border-[var(--color-line)] text-[var(--color-ink-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]'
                    }`}
                    title={`${questions} preguntas · se aprueba con ${required} %`}
                  >
                    {quiz?.passed && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
                        <path
                          d="m2.5 6.2 2 2 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {quiz ? `Test ${quiz.best} %` : `Test · ${questions}`}
                  </Link>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
