'use client'

import Link from 'next/link'
import { useExamProgress } from '@/lib/examProgress'
import type { ExamSpec, PartSpec } from '@/lib/exam'

type Props = {
  slug: string
  courseTitle: string
  rulesVersion: string
  spec: ExamSpec
}

const ORDER: (keyof ExamSpec)[] = ['a', 'b', 'c', 'd']

export function ExamOverview({ slug, courseTitle, rulesVersion, spec }: Props) {
  const { courseExam, reset } = useExamProgress()
  const exam = courseExam(slug)

  const passedCount = ORDER.filter((k) => exam.parts[k]?.passed).length
  const complete = passedCount === ORDER.length

  return (
    <div className="mt-8">
      {/* --------------------------------------------------------- estado */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[13px] font-[600] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
            Partes aprobadas
          </span>
          <span className="text-[13px] tabular-nums text-[var(--color-ink-muted)]">
            <span className="text-[17px] font-[650] text-[var(--color-ink)]">{passedCount}</span>
            {' de 4'}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {ORDER.map((key) => (
            <div
              key={key}
              className={`h-2 rounded-full ${
                exam.parts[key]?.passed
                  ? 'bg-[var(--accent,var(--color-brand))]'
                  : 'bg-[var(--color-surface-3)]'
              }`}
            />
          ))}
        </div>

        {complete ? (
          <div className="mt-5">
            <p className="text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
              Completaste las cuatro partes del examen de {courseTitle.toLowerCase()}.
            </p>
            <Link
              href={`/curso/${slug}/certificado`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
            >
              Ver el certificado
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
          </div>
        ) : (
          <p className="mt-4 text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
            Las cuatro partes son independientes: se pueden rendir en cualquier
            orden y repetir las veces que haga falta. El certificado aparece al
            aprobar las cuatro.
          </p>
        )}
      </div>

      {/* ---------------------------------------------------------- partes */}
      <ol className="mt-6 grid gap-3">
        {ORDER.map((key) => (
          <li key={key}>
            <PartCard slug={slug} spec={spec[key]} result={exam.parts[key]} />
          </li>
        ))}
      </ol>

      <p className="mt-8 text-[12.5px] leading-relaxed text-[var(--color-ink-subtle)]">
        Este examen es interno del programa. No constituye licencia, matrícula,
        habilitación federativa ni certificación oficial de ninguna asociación.
        · {rulesVersion}
      </p>

      {passedCount > 0 && (
        <button
          type="button"
          onClick={() => {
            if (confirm(`¿Borrar tu examen de ${courseTitle}, incluidos los partidos registrados?`)) {
              reset(slug)
            }
          }}
          className="mt-4 text-[12.5px] text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-danger)]"
        >
          Borrar el examen y empezar de nuevo
        </button>
      )}
    </div>
  )
}

function PartCard({
  slug,
  spec,
  result,
}: {
  slug: string
  spec: PartSpec
  result: { correct: number; total: number; passed: boolean; attempts: number } | undefined
}) {
  const passed = Boolean(result?.passed)

  return (
    <Link
      href={`/curso/${slug}/examen/${spec.part}`}
      className={`group flex items-start gap-4 rounded-[var(--radius-card)] border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] ${
        passed
          ? 'border-[var(--accent,var(--color-brand))] bg-[var(--color-brand-soft)]'
          : 'border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-line-strong)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg font-[660] ${
          passed
            ? 'bg-[var(--color-brand)] text-white dark:text-[#06231a]'
            : 'bg-[var(--color-surface-3)] text-[var(--color-ink-muted)]'
        }`}
      >
        {passed ? (
          <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none">
            <path
              d="m4.6 10.4 3.5 3.5 7.3-7.8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          spec.part.toUpperCase()
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[16px] font-[630] tracking-[-0.014em]">
            Parte {spec.part.toUpperCase()} · {spec.title}
          </span>
          {result && (
            <span className="font-mono text-[12px] tabular-nums text-[var(--color-ink-subtle)]">
              {result.correct}/{result.total}
            </span>
          )}
        </span>

        <span className="mt-1 block text-[13.5px] leading-[1.6] text-[var(--color-ink-muted)]">
          {spec.subtitle}
        </span>

        <span className="mt-2 block text-[12.5px] text-[var(--color-ink-subtle)]">
          {spec.part === 'd'
            ? 'Dos partidos registrados; el segundo con al menos 75 de 100'
            : `${spec.count} preguntas · se aprueba con ${spec.pass}`}
          {result && result.attempts > 0 && ` · ${result.attempts} intento${result.attempts === 1 ? '' : 's'}`}
        </span>
      </span>

      <svg
        viewBox="0 0 16 16"
        className="mt-1 h-3.5 w-3.5 flex-none text-[var(--color-ink-subtle)] transition-transform duration-200 group-hover:translate-x-0.5"
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
  )
}
