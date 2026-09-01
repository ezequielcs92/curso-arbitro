'use client'

import { useState } from 'react'
import { useExamProgress, type PracticeMatch } from '@/lib/examProgress'
import {
  RUBRIC_MAX_PER_ITEM,
  RUBRIC_PASS,
  RUBRIC_TOTAL,
  rubricFor,
} from '@/lib/exam'

type Props = {
  slug: string
  discipline: string
  formats: string[]
}

/**
 * Parte D: registro de dos partidos dirigidos, el segundo evaluado con la
 * rúbrica de 100 puntos.
 *
 * Es autoinformado y no puede ser otra cosa: la app no tiene forma de
 * verificar que un partido se dirigió. Se guarda como lo que es, y tanto esta
 * pantalla como el certificado lo dicen.
 */
export function PracticeLog({ slug, discipline, formats }: Props) {
  const { courseExam, addMatch, removeMatch, recordPart } = useExamProgress()
  const exam = courseExam(slug)
  const matches = exam.matches

  const [open, setOpen] = useState(false)
  const rubric = rubricFor(discipline)

  const needsRubric = matches.length >= 1
  const [scores, setScores] = useState<Record<string, number>>({})

  const rubricTotal = rubric.reduce((sum, item) => sum + (scores[item.key] ?? 0), 0)
  const rubricComplete = rubric.every((item) => scores[item.key] !== undefined)

  function save(form: HTMLFormElement) {
    const data = new FormData(form)
    const isSecond = matches.length === 1

    const match: PracticeMatch = {
      id: `m-${matches.length + 1}-${Date.now()}`,
      date: String(data.get('date') ?? ''),
      competition: String(data.get('competition') ?? ''),
      format: String(data.get('format') ?? ''),
      teams: String(data.get('teams') ?? ''),
      notes: String(data.get('notes') ?? ''),
      ...(isSecond ? { rubric: scores, rubricTotal } : {}),
    }

    addMatch(slug, match)

    // La parte D se aprueba con dos partidos registrados y el segundo evaluado
    // con al menos 75 de 100.
    if (isSecond) {
      recordPart(slug, 'd', rubricTotal >= RUBRIC_PASS ? 2 : 1, 2, 2)
    }

    setOpen(false)
    setScores({})
    form.reset()
  }

  return (
    <div className="mt-8">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-5">
        <p className="text-[13.5px] leading-[1.65] text-[var(--color-ink-muted)]">
          Esta parte la completás vos: la app no puede verificar que dirigiste un
          partido. Queda registrada como declaración propia, y el certificado lo
          aclara.
        </p>
      </div>

      {/* ---------------------------------------------------- registrados */}
      {matches.length > 0 && (
        <ol className="mt-6 grid gap-3">
          {matches.map((match, i) => (
            <li
              key={match.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-[620] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
                    Partido {i + 1}
                    {i === 1 && ' · evaluado'}
                  </p>
                  <p className="mt-1.5 text-[15px] font-[600]">
                    {match.teams || 'Sin equipos anotados'}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
                    {[match.date, match.competition, match.format]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {match.rubricTotal !== undefined && (
                  <span
                    className={`flex-none rounded-lg px-2.5 py-1 font-mono text-[13px] font-[620] ${
                      match.rubricTotal >= RUBRIC_PASS
                        ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                        : 'bg-[var(--color-surface-3)] text-[var(--color-ink-muted)]'
                    }`}
                  >
                    {match.rubricTotal}/{RUBRIC_TOTAL}
                  </span>
                )}
              </div>

              {match.notes && (
                <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-[13.5px] leading-[1.6] text-[var(--color-ink-muted)]">
                  {match.notes}
                </p>
              )}

              <button
                type="button"
                onClick={() => removeMatch(slug, match.id)}
                className="mt-3 text-[12.5px] text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-danger)]"
              >
                Borrar este registro
              </button>
            </li>
          ))}
        </ol>
      )}

      {/* --------------------------------------------------------- alta */}
      {matches.length < 2 && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
        >
          Registrar el {matches.length === 0 ? 'primer' : 'segundo'} partido
        </button>
      )}

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save(e.currentTarget)
          }}
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6"
        >
          <h2 className="text-[16px] font-[640] tracking-[-0.014em]">
            Partido {matches.length + 1}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Fecha" name="date" type="date" required />
            <Field label="Competición" name="competition" placeholder="Liga, torneo o amistoso" />
            <Select label="Formato" name="format" options={formats} />
            <Field label="Equipos" name="teams" placeholder="Local vs. visitante" required />
          </div>

          <label className="mt-4 block">
            <span className="text-[12.5px] font-[600] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
              Qué cambiarías
            </span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Una decisión que repetirías distinto, y por qué."
              className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2 text-[14px] outline-none transition-colors focus:border-[var(--color-brand)]"
            />
          </label>

          {/* ------------------------------------------------------ rúbrica */}
          {needsRubric && (
            <fieldset className="mt-7 border-t border-[var(--color-line)] pt-6">
              <legend className="text-[13px] font-[620] uppercase tracking-[0.07em] text-[var(--color-ink-subtle)]">
                Rúbrica · se aprueba con {RUBRIC_PASS} de {RUBRIC_TOTAL}
              </legend>

              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                Diez áreas de {RUBRIC_MAX_PER_ITEM} puntos. Puntuá con honestidad:
                el valor de esto está en detectar qué entrenar, no en el número.
              </p>

              <div className="mt-5 grid gap-4">
                {rubric.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <label
                        htmlFor={`r-${item.key}`}
                        className="text-[14px] font-[580]"
                      >
                        {item.label}
                      </label>
                      <span className="font-mono text-[13px] tabular-nums text-[var(--color-ink-muted)]">
                        {scores[item.key] ?? 0}/{RUBRIC_MAX_PER_ITEM}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-subtle)]">
                      {item.hint}
                    </p>
                    <input
                      id={`r-${item.key}`}
                      type="range"
                      min={0}
                      max={RUBRIC_MAX_PER_ITEM}
                      step={1}
                      value={scores[item.key] ?? 0}
                      onChange={(e) =>
                        setScores((s) => ({ ...s, [item.key]: Number(e.target.value) }))
                      }
                      className="mt-2 w-full accent-[var(--color-brand)]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-baseline justify-between border-t border-[var(--color-line)] pt-4">
                <span className="text-[13px] font-[620] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
                  Total
                </span>
                <span
                  className={`font-mono text-[22px] font-[650] tabular-nums ${
                    rubricTotal >= RUBRIC_PASS
                      ? 'text-[var(--color-brand)]'
                      : 'text-[var(--color-ink)]'
                  }`}
                >
                  {rubricTotal}/{RUBRIC_TOTAL}
                </span>
              </div>
            </fieldset>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={needsRubric && !rubricComplete}
              className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#06231a]"
            >
              Guardar el registro
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[13.5px] font-[540] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {matches.length >= 2 && (
        <p className="mt-6 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Los dos partidos están registrados. Podés borrar uno y volver a
          cargarlo si querés rehacer la evaluación.
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-[600] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2 text-[14px] outline-none transition-colors focus:border-[var(--color-brand)]"
      />
    </label>
  )
}

function Select({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-[600] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
        {label}
      </span>
      <select
        name={name}
        className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2 text-[14px] outline-none transition-colors focus:border-[var(--color-brand)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
