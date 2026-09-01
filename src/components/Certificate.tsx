'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BrandMark } from './Brand'
import { useExamProgress } from '@/lib/examProgress'
import { useProgress } from '@/lib/progress'
import { useQuizProgress } from '@/lib/quizProgress'
import { EXAM_SPECS, RUBRIC_TOTAL } from '@/lib/exam'

type Props = {
  slug: string
  courseTitle: string
  discipline: string
  rulesVersion: string
  lessonIds: string[]
  moduleIds: string[]
  totalQuestions: number
}

/**
 * Certificado interno de finalización (§ 76) y credencial (§ 77).
 *
 * El texto obligatorio y la aclaración de que no es una habilitación oficial
 * están fijos en el componente: no son configurables ni se pueden ocultar. Y
 * no se usa ningún logo de instituciones externas.
 */
export function Certificate({
  slug,
  courseTitle,
  discipline,
  rulesVersion,
  lessonIds,
  moduleIds,
  totalQuestions,
}: Props) {
  const { courseExam, setName } = useExamProgress()
  const { progress } = useProgress()
  const { results } = useQuizProgress()

  const exam = courseExam(slug)
  const spec = EXAM_SPECS[discipline]

  const parts = (['a', 'b', 'c', 'd'] as const).map((key) => ({
    key,
    spec: spec[key],
    result: exam.parts[key],
  }))

  const complete = parts.every((p) => p.result?.passed)

  const lessonsRead = lessonIds.filter((id) => progress[slug]?.[id]).length
  const modulesPassed = moduleIds.filter((id) => results[slug]?.[id]?.passed).length
  const secondMatch = exam.matches[1]

  const [draftName, setDraftName] = useState('')

  if (!complete) {
    return (
      <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="text-[17px] font-[640] tracking-[-0.014em]">
          El certificado todavía no está disponible
        </h2>
        <p className="mt-2.5 text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
          Aparece al aprobar las cuatro partes del examen final de{' '}
          {courseTitle.toLowerCase()}.
        </p>
        <Link
          href={`/curso/${slug}/examen`}
          className="mt-4 inline-block rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
        >
          Ir al examen
        </Link>
      </div>
    )
  }

  if (!exam.name) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (draftName.trim()) setName(slug, draftName.trim())
        }}
        className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="text-[17px] font-[640] tracking-[-0.014em]">
          ¿A nombre de quién?
        </h2>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--color-ink-muted)]">
          Se guarda solo en este dispositivo, junto con el resto de tu avance.
        </p>
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Nombre y apellido"
          className="mt-4 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2.5 text-[15px] outline-none transition-colors focus:border-[var(--color-brand)]"
        />
        <button
          type="submit"
          disabled={!draftName.trim()}
          className="mt-4 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] disabled:opacity-40 dark:text-[#06231a]"
        >
          Emitir el certificado
        </button>
      </form>
    )
  }

  const issued = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mt-8">
      {/* ---------------------------------------------------- certificado */}
      <article className="rounded-[var(--radius-card)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-7 sm:p-10">
        <header className="flex items-center gap-3 border-b border-[var(--color-line)] pb-6">
          <BrandMark className="h-8 w-8 text-[var(--color-brand)]" />
          <div>
            <p className="text-[15px] font-[640] tracking-[-0.014em]">Árbitro Amateur</p>
            <p className="text-[12px] text-[var(--color-ink-subtle)]">
              Programa de formación
            </p>
          </div>
        </header>

        <p className="mt-8 text-[12.5px] font-[620] uppercase tracking-[0.1em] text-[var(--color-ink-subtle)]">
          Certificado de finalización
        </p>

        <h2 className="mt-4 text-[30px] font-[650] leading-tight tracking-[-0.024em] sm:text-[36px]">
          {exam.name}
        </h2>

        <p className="mt-5 max-w-[60ch] text-[16px] leading-[1.7]">
          Certificado interno de finalización del programa de formación
          «Árbitro Amateur», curso de{' '}
          <strong className="font-[640]">{courseTitle}</strong>, según la edición
          reglamentaria <strong className="font-[640]">{rulesVersion}</strong>.
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-[var(--color-line)] pt-6 sm:grid-cols-2">
          <Row label="Fecha de emisión" value={issued} />
          <Row label="Edición reglamentaria" value={rulesVersion} />
          <Row label="Lecciones leídas" value={`${lessonsRead} de ${lessonIds.length}`} />
          <Row label="Módulos aprobados" value={`${modulesPassed} de ${moduleIds.length}`} />
          <Row label="Preguntas del banco" value={String(totalQuestions)} />
          <Row
            label="Partidos prácticos"
            value={`${exam.matches.length} registrados`}
          />
        </dl>

        <div className="mt-6 border-t border-[var(--color-line)] pt-6">
          <p className="text-[12px] font-[620] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
            Examen final
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {parts.map(({ key, spec: partSpec, result }) => (
              <li key={key} className="flex items-baseline gap-2 text-[13.5px]">
                <span className="font-mono text-[11px] font-[620] text-[var(--color-ink-subtle)]">
                  {key.toUpperCase()}
                </span>
                <span className="flex-1">{partSpec.title}</span>
                <span className="font-mono tabular-nums text-[var(--color-ink-muted)]">
                  {result ? `${result.correct}/${result.total}` : '—'}
                </span>
              </li>
            ))}
          </ul>

          {secondMatch?.rubricTotal !== undefined && (
            <p className="mt-3 text-[13px] text-[var(--color-ink-muted)]">
              Rúbrica del segundo partido:{' '}
              <span className="font-mono tabular-nums">
                {secondMatch.rubricTotal}/{RUBRIC_TOTAL}
              </span>
            </p>
          )}
        </div>

        {/* ---- La aclaración es obligatoria y no se puede ocultar (§ 76) --- */}
        <p className="mt-8 rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-4 py-3.5 text-[13px] leading-[1.65] text-[var(--color-ink)]">
          Este certificado no constituye una licencia, matrícula, habilitación
          federativa ni certificación oficial de AFA, IFAB u otra asociación.
        </p>

        <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-ink-subtle)]">
          Los partidos prácticos son declarados por la persona que rinde: el
          programa no los verifica.
        </p>
      </article>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[var(--color-line-strong)] px-4 py-2.5 text-[14px] font-[540] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          Imprimir o guardar como PDF
        </button>
        <Link
          href={`/curso/${slug}/examen`}
          className="rounded-lg px-3 py-2.5 text-[13.5px] font-[540] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
        >
          Volver al examen
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11.5px] font-[600] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-[14.5px] font-[560]">{value}</dd>
    </div>
  )
}
