'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DecisionForm, Options, isAnswered } from './QuestionInput'
import { useExamProgress } from '@/lib/examProgress'
import { RULEBOOK_READING_MINUTES, type ExamPart, type Rulebook } from '@/lib/exam'
import { score, shuffle, type Question, type Scored } from '@/lib/quiz'

type Props = {
  slug: string
  discipline: string
  courseTitle: string
  part: ExamPart
  title: string
  count: number
  pass: number
  /** Pozo del que se sortea. En la parte C viene del reglamento elegido. */
  pool: Question[]
  rulebooks?: Rulebook[]
}

type Answered = { question: Question; given: unknown; result: Scored }

/**
 * Corre una parte del examen final.
 *
 * A diferencia del cuestionario de módulo, acá no se corrige pregunta por
 * pregunta: se responde todo y recién al final se ve el resultado. Es un
 * examen, no una práctica, y la explicación inmediata convertiría la segunda
 * mitad en una lección.
 *
 * La otra diferencia es la puntuación: en las decisiones el examen cuenta
 * acierto completo, no crédito parcial. La especificación pide 24 de 30
 * situaciones, no un promedio.
 */
export function ExamRunner({
  slug,
  discipline,
  courseTitle,
  part,
  title,
  count,
  pass,
  pool,
  rulebooks,
}: Props) {
  const { recordPart, courseExam } = useExamProgress()
  const previous = courseExam(slug).parts[part]

  const [book, setBook] = useState<Rulebook | null>(null)
  const [reading, setReading] = useState(part === 'c')
  const [secondsLeft, setSecondsLeft] = useState(RULEBOOK_READING_MINUTES * 60)

  const [order, setOrder] = useState<Question[] | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answered[]>([])
  const [draft, setDraft] = useState<unknown>(undefined)
  const [attempt, setAttempt] = useState(0)
  const [saved, setSaved] = useState(false)

  // El sorteo ocurre en el cliente: hacerlo en el servidor daría un orden
  // distinto al hidratar.
  const start = useCallback(() => {
    if (part === 'c') {
      const chosen = rulebooks && rulebooks.length > 0 ? shuffle(rulebooks)[0] : null
      setBook(chosen)
      setOrder(chosen ? shuffle(chosen.questions).slice(0, count) : [])
      setReading(true)
      setSecondsLeft(RULEBOOK_READING_MINUTES * 60)
    } else {
      setOrder(shuffle(pool).slice(0, count))
      setReading(false)
    }
    setIndex(0)
    setAnswers([])
    setDraft(undefined)
    setSaved(false)
  }, [part, pool, rulebooks, count])

  useEffect(() => {
    start()
  }, [start, attempt])

  // Cuenta atrás de lectura del reglamento privado.
  useEffect(() => {
    if (!reading) return
    if (secondsLeft <= 0) {
      setReading(false)
      return
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [reading, secondsLeft])

  const finished = order !== null && !reading && index >= order.length

  const result = useMemo(() => {
    if (!finished) return null
    const correct = answers.filter((a) => a.result.correct).length
    return { correct, total: answers.length, passed: correct >= pass }
  }, [finished, answers, pass])

  useEffect(() => {
    if (result && !saved && result.total > 0) {
      recordPart(slug, part, result.correct, result.total, pass)
      setSaved(true)
    }
  }, [result, saved, recordPart, slug, part, pass])

  const current = order?.[index]

  function submit() {
    if (!current || !isAnswered(current, draft)) return
    setAnswers((a) => [...a, { question: current, given: draft, result: score(current, draft) }])
    setIndex((i) => i + 1)
    setDraft(undefined)
  }

  if (order === null) {
    return <div className="mt-10 h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-2)]" />
  }

  // --------------------------------------------------- lectura del reglamento
  if (reading && book) {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60

    return (
      <div className="mt-8">
        <div className="sticky top-16 z-10 flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] px-4 py-3 backdrop-blur">
          <span className="font-mono text-[20px] font-[650] tabular-nums text-[var(--color-ink)]">
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[13px] text-[var(--color-ink-muted)]">
            para leer el reglamento
          </span>
          <button
            type="button"
            onClick={() => setReading(false)}
            className="ml-auto rounded-lg bg-[var(--color-brand)] px-3.5 py-2 text-[13.5px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
          >
            Ya lo leí
          </button>
        </div>

        <article className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6">
          <h2 className="text-[18px] font-[640] tracking-[-0.014em]">{book.name}</h2>
          <p className="mt-1.5 text-[13.5px] text-[var(--color-ink-muted)]">{book.intro}</p>

          <ol className="mt-5 grid gap-3">
            {book.articles.map((article) => (
              <li key={article.n} className="flex gap-3 text-[14px] leading-[1.6]">
                <span className="flex-none font-mono text-[12px] font-[620] text-[var(--color-ink-subtle)]">
                  {article.n}.
                </span>
                <span>{article.text}</span>
              </li>
            ))}
          </ol>
        </article>

        <p className="mt-4 text-[13px] leading-relaxed text-[var(--color-ink-subtle)]">
          Después de este bloque no vas a poder volver a leerlo. Fijate qué cambia
          respecto de las Reglas, qué es adaptación permitida y qué es norma propia
          del torneo.
        </p>
      </div>
    )
  }

  // ----------------------------------------------------------------- resultado
  if (finished && result) {
    const wrong = answers.filter((a) => !a.result.correct)

    return (
      <div className="mt-8">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8">
          <p className="text-[12px] font-[620] uppercase tracking-[0.09em] text-[var(--color-ink-subtle)]">
            {result.passed ? `Parte ${part.toUpperCase()} aprobada` : 'Todavía no alcanza'}
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span
              className={`text-[54px] font-[660] leading-none tabular-nums tracking-[-0.03em] ${
                result.passed ? 'text-[var(--color-brand)]' : 'text-[var(--color-ink)]'
              }`}
            >
              {result.correct}
              <span className="text-[26px] text-[var(--color-ink-muted)]"> / {result.total}</span>
            </span>
            <span className="text-[14px] text-[var(--color-ink-muted)]">
              Se necesitan {pass}
            </span>
          </div>

          {part === 'b' && (
            <p className="mt-4 text-[13.5px] leading-[1.65] text-[var(--color-ink-muted)]">
              En el examen una decisión cuenta solo si los cuatro componentes están
              bien. El crédito parcial es para practicar; acá se mide la decisión
              completa.
            </p>
          )}

          {previous && previous.attempts > 1 && (
            <p className="mt-2 text-[12.5px] text-[var(--color-ink-subtle)]">
              Tu mejor resultado: {Math.max(previous.correct, result.correct)} de {result.total}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
            >
              Volver a intentar
            </button>
            <Link
              href={`/curso/${slug}/examen`}
              className="rounded-lg border border-[var(--color-line-strong)] px-4 py-2.5 text-[14px] font-[540] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            >
              Volver al examen
            </Link>
          </div>
        </div>

        {wrong.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[13px] font-[620] uppercase tracking-[0.09em] text-[var(--color-ink-subtle)]">
              Para repasar · {wrong.length}
            </h2>
            <div className="mt-4 grid gap-3">
              {wrong.map((a) => (
                <details
                  key={a.question.id}
                  className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3">
                    <svg
                      viewBox="0 0 16 16"
                      className="mt-1 h-3 w-3 flex-none text-[var(--color-ink-subtle)] transition-transform duration-200 group-open:rotate-90"
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
                    <span className="min-w-0 flex-1 text-[14px] font-[560] leading-snug">
                      {a.question.question}
                    </span>
                    {a.result.components && (
                      <span className="flex-none font-mono text-[11px] text-[var(--color-ink-subtle)]">
                        {a.result.earnedPoints}/{a.result.totalPoints}
                      </span>
                    )}
                  </summary>
                  <div className="px-4 pb-4 pl-10">
                    {a.result.components && (
                      <ul className="mb-3 grid gap-1">
                        {a.result.components
                          .filter((c) => !c.correct)
                          .map((c) => (
                            <li key={c.key} className="text-[12.5px] text-[var(--color-ink-muted)]">
                              <span className="font-[580] text-[var(--color-ink)]">{c.label}:</span>{' '}
                              respondiste {c.given} · correcto: {c.expected}
                            </li>
                          ))}
                      </ul>
                    )}
                    <p className="text-[13.5px] leading-[1.65] text-[var(--color-ink-muted)]">
                      {a.question.explanation}
                    </p>
                    <p className="mt-2 text-[12px] text-[var(--color-ink-subtle)]">
                      {a.question.ruleReference}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  if (!current) return null

  // ------------------------------------------------------------------ pregunta
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-3)]"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={order.length}
          aria-label={`Avance de la parte ${part.toUpperCase()}`}
        >
          <div
            className="h-full rounded-full bg-[var(--accent,var(--color-brand))] transition-[width] duration-300"
            style={{ width: `${(index / order.length) * 100}%` }}
          />
        </div>
        <span className="flex-none font-mono text-[12px] tabular-nums text-[var(--color-ink-subtle)]">
          {index + 1}/{order.length}
        </span>
      </div>

      <article className="mt-7">
        <h2 className="text-[19px] font-[620] leading-[1.4] tracking-[-0.012em] sm:text-[21px]">
          {current.question}
        </h2>

        <div className="mt-6">
          {current.type === 'multiple_choice' && current.options && (
            <Options
              options={current.options}
              selected={draft as number | undefined}
              revealed={false}
              onSelect={setDraft}
            />
          )}

          {current.type === 'true_false' && (
            <Options
              options={['Verdadero', 'Falso']}
              selected={draft === undefined ? undefined : draft === true ? 0 : 1}
              revealed={false}
              onSelect={(i) => setDraft(i === 0)}
            />
          )}

          {current.type === 'decision' && (
            <DecisionForm
              discipline={discipline}
              value={(draft ?? {}) as Record<string, never>}
              disabled={false}
              onChange={setDraft}
            />
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={!isAnswered(current, draft)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-all hover:bg-[var(--color-brand-strong)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#06231a]"
          >
            {index + 1 === order.length ? 'Terminar y ver resultado' : 'Siguiente'}
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="text-[12.5px] text-[var(--color-ink-subtle)]">
            En el examen no se corrige hasta el final
          </span>
        </div>
      </article>

      <p className="mt-8 text-[12px] text-[var(--color-ink-subtle)]">
        {courseTitle} · {title}
      </p>
    </div>
  )
}
