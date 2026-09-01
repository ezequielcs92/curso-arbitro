'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuizProgress } from '@/lib/quizProgress'
import {
  DISCIPLINARY_LABELS,
  DISCIPLINARY_OPTIONS,
  RESTART_LABELS,
  TECHNICAL_LABELS,
  percentage,
  restartOptions,
  score,
  shuffle,
  technicalOptions,
  type DecisionAnswer,
  type Question,
  type Scored,
} from '@/lib/quiz'

type Props = {
  slug: string
  discipline: string
  moduleId: string
  moduleTitle: string
  courseTitle: string
  critical: boolean
  requiredScore: number
  questions: Question[]
}

type Answered = { question: Question; given: unknown; result: Scored }

export function Quiz({
  slug,
  discipline,
  moduleId,
  moduleTitle,
  courseTitle,
  critical,
  requiredScore,
  questions,
}: Props) {
  const { record, resultFor } = useQuizProgress()

  // El orden se mezcla en el cliente. Hacerlo durante el renderizado del
  // servidor daría un orden distinto al hidratar.
  const [order, setOrder] = useState<Question[] | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answered[]>([])
  const [draft, setDraft] = useState<unknown>(undefined)
  const [revealed, setRevealed] = useState<Scored | null>(null)
  const [attempt, setAttempt] = useState(0)

  const start = useCallback(() => {
    setOrder(shuffle(questions))
    setIndex(0)
    setAnswers([])
    setDraft(undefined)
    setRevealed(null)
  }, [questions])

  useEffect(() => {
    start()
  }, [start, attempt])

  const previous = resultFor(slug, moduleId)
  const current = order?.[index]
  const finished = order !== null && index >= order.length

  const result = useMemo(() => {
    if (!finished) return null
    const value = percentage(answers.map((a) => a.result.fraction))
    return { value, passed: value >= requiredScore }
  }, [finished, answers, requiredScore])

  // Se guarda una sola vez, al llegar al final.
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (result && !saved) {
      record(slug, moduleId, result.value, requiredScore)
      setSaved(true)
    }
  }, [result, saved, record, slug, moduleId, requiredScore])

  const canSubmit =
    current !== undefined &&
    (current.type === 'decision'
      ? isCompleteDecision(draft)
      : draft !== undefined)

  function submit() {
    if (!current || !canSubmit || revealed) return
    const scored = score(current, draft)
    setRevealed(scored)
    setAnswers((a) => [...a, { question: current, given: draft, result: scored }])
  }

  function next() {
    setIndex((i) => i + 1)
    setDraft(undefined)
    setRevealed(null)
  }

  function retry() {
    setSaved(false)
    setAttempt((a) => a + 1)
  }

  // Enter avanza; los números eligen opción en las preguntas simples.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (event.key === 'Enter') {
        event.preventDefault()
        if (revealed) next()
        else if (canSubmit) submit()
        return
      }

      if (!current || revealed) return

      if (current.type === 'multiple_choice' && current.options) {
        const n = Number(event.key)
        if (n >= 1 && n <= current.options.length) setDraft(n - 1)
      } else if (current.type === 'true_false') {
        if (event.key === '1') setDraft(true)
        if (event.key === '2') setDraft(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (order === null) {
    return (
      <div className="mt-10 h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-2)]" />
    )
  }

  // ------------------------------------------------------------- resultado
  if (finished && result) {
    return (
      <Results
        slug={slug}
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        courseTitle={courseTitle}
        requiredScore={requiredScore}
        critical={critical}
        value={result.value}
        passed={result.passed}
        previousBest={previous?.best ?? 0}
        answers={answers}
        onRetry={retry}
      />
    )
  }

  if (!current) return null

  const answeredCount = answers.length

  return (
    <div className="mt-8">
      {/* ------------------------------------------------------- progreso */}
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-3)]"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={order.length}
          aria-label="Avance del cuestionario"
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

      {/* -------------------------------------------------------- pregunta */}
      <article className="mt-7">
        <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
          <span className="rounded-md bg-[var(--color-surface-2)] px-2 py-0.5 font-[560] text-[var(--color-ink-muted)]">
            {current.ruleReference}
          </span>
          {current.type === 'decision' && (
            <span className="rounded-md bg-[var(--color-brand-soft)] px-2 py-0.5 font-[600] uppercase tracking-[0.04em] text-[var(--color-brand)]">
              Decisión completa · 10 puntos
            </span>
          )}
          <span className="text-[var(--color-ink-subtle)]">
            Dificultad {current.difficulty}/5
          </span>
        </div>

        <h2 className="mt-3 text-[19px] font-[620] leading-[1.4] tracking-[-0.012em] sm:text-[21px]">
          {current.question}
        </h2>

        <div className="mt-6">
          {current.type === 'multiple_choice' && current.options && (
            <Options
              options={current.options}
              selected={draft as number | undefined}
              correctIndex={current.correctAnswer as number}
              revealed={Boolean(revealed)}
              onSelect={setDraft}
            />
          )}

          {current.type === 'true_false' && (
            <Options
              options={['Verdadero', 'Falso']}
              selected={draft === undefined ? undefined : draft === true ? 0 : 1}
              correctIndex={current.correctAnswer === true ? 0 : 1}
              revealed={Boolean(revealed)}
              onSelect={(i) => setDraft(i === 0)}
            />
          )}

          {current.type === 'decision' && (
            <DecisionForm
              discipline={discipline}
              value={(draft ?? {}) as Partial<DecisionAnswer>}
              disabled={Boolean(revealed)}
              onChange={setDraft}
            />
          )}
        </div>

        {/* ------------------------------------------------------ feedback */}
        {revealed && (
          <Feedback question={current} result={revealed} />
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {!revealed ? (
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-all hover:bg-[var(--color-brand-strong)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#06231a]"
            >
              Responder
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-all hover:bg-[var(--color-brand-strong)] active:scale-[0.985] dark:text-[#06231a]"
            >
              {index + 1 === order.length ? 'Ver resultado' : 'Siguiente'}
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
          )}

          {answeredCount > 0 && (
            <span className="text-[12.5px] tabular-nums text-[var(--color-ink-subtle)]">
              {percentage(answers.map((a) => a.result.fraction))} % hasta acá
            </span>
          )}
        </div>
      </article>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Opciones de las preguntas simples
// ---------------------------------------------------------------------------

function Options({
  options,
  selected,
  correctIndex,
  revealed,
  onSelect,
}: {
  options: string[]
  selected: number | undefined
  correctIndex: number
  revealed: boolean
  onSelect: (index: number) => void
}) {
  return (
    <ul className="grid gap-2">
      {options.map((option, i) => {
        const isSelected = selected === i
        const isCorrect = revealed && i === correctIndex
        const isWrongPick = revealed && isSelected && i !== correctIndex

        return (
          <li key={option}>
            <button
              type="button"
              onClick={() => !revealed && onSelect(i)}
              disabled={revealed}
              aria-pressed={isSelected}
              className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-[14.5px] leading-[1.5] transition-colors ${
                isCorrect
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                  : isWrongPick
                    ? 'border-[var(--color-danger)] bg-[color-mix(in_oklab,var(--color-danger)_10%,transparent)]'
                    : isSelected
                      ? 'border-[var(--color-line-strong)] bg-[var(--color-surface-2)]'
                      : 'border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-line-strong)] hover:bg-[var(--color-surface-2)]'
              } ${revealed ? 'cursor-default' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`mt-px flex h-5 w-5 flex-none items-center justify-center rounded-md text-[11px] font-[660] ${
                  isCorrect
                    ? 'bg-[var(--color-brand)] text-white dark:text-[#06231a]'
                    : isWrongPick
                      ? 'bg-[var(--color-danger)] text-white'
                      : 'bg-[var(--color-surface-3)] text-[var(--color-ink-muted)]'
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1">{option}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Decisión completa
// ---------------------------------------------------------------------------

function isCompleteDecision(value: unknown): boolean {
  const d = value as Partial<DecisionAnswer> | undefined
  return (
    d !== undefined &&
    d.isOffence !== undefined &&
    Boolean(d.technical) &&
    Boolean(d.disciplinary) &&
    Boolean(d.restart)
  )
}

function DecisionForm({
  discipline,
  value,
  disabled,
  onChange,
}: {
  discipline: string
  value: Partial<DecisionAnswer>
  disabled: boolean
  onChange: (next: Partial<DecisionAnswer>) => void
}) {
  function set<K extends keyof DecisionAnswer>(key: K, v: DecisionAnswer[K]) {
    if (!disabled) onChange({ ...value, [key]: v })
  }

  return (
    <div className="grid gap-4">
      <Group label="¿Hay infracción?" points={3}>
        <Chip active={value.isOffence === true} disabled={disabled} onClick={() => set('isOffence', true)}>
          Sí
        </Chip>
        <Chip active={value.isOffence === false} disabled={disabled} onClick={() => set('isOffence', false)}>
          No
        </Chip>
      </Group>

      <Group label="Decisión técnica" points={3}>
        {technicalOptions(discipline).map((key) => (
          <Chip
            key={key}
            active={value.technical === key}
            disabled={disabled}
            onClick={() => set('technical', key)}
          >
            {TECHNICAL_LABELS[key]}
          </Chip>
        ))}
      </Group>

      <Group label="Decisión disciplinaria" points={2}>
        {DISCIPLINARY_OPTIONS.map((key) => (
          <Chip
            key={key}
            active={value.disciplinary === key}
            disabled={disabled}
            onClick={() => set('disciplinary', key)}
          >
            {DISCIPLINARY_LABELS[key]}
          </Chip>
        ))}
      </Group>

      <Group label="Reanudación" points={2}>
        {restartOptions(discipline).map((key) => (
          <Chip
            key={key}
            active={value.restart === key}
            disabled={disabled}
            onClick={() => set('restart', key)}
          >
            {RESTART_LABELS[key]}
          </Chip>
        ))}
      </Group>
    </div>
  )
}

function Group({
  label,
  points,
  children,
}: {
  label: string
  points: number
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline gap-2 text-[12px] font-[620] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
        {label}
        <span className="font-mono text-[10.5px] normal-case tracking-normal">
          {points} pts
        </span>
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  )
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-[13px] font-[540] transition-colors ${
        active
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
          : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]'
      } ${disabled ? 'cursor-default opacity-70' : ''}`}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Explicación
// ---------------------------------------------------------------------------

function Feedback({ question, result }: { question: Question; result: Scored }) {
  return (
    <div
      className={`mt-6 rounded-[var(--radius-card)] border p-4 sm:p-5 ${
        result.correct
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
          : 'border-[var(--color-line-strong)] bg-[var(--color-surface-2)]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            result.correct ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-ink-subtle)]'
          }`}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white dark:text-[#06231a]" fill="none">
            {result.correct ? (
              <path
                d="m3 6.2 2 2 4-4.4"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M3.5 3.5l5 5m0-5l-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            )}
          </svg>
        </span>
        <p className="text-[13.5px] font-[620]">
          {result.correct
            ? 'Correcto'
            : result.components
              ? `${result.earnedPoints} de ${result.totalPoints} puntos`
              : 'Incorrecto'}
        </p>
      </div>

      {result.components && (
        <ul className="mt-3.5 grid gap-1.5">
          {result.components.map((c) => (
            <li
              key={c.key}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg bg-[var(--color-surface)] px-3 py-2 text-[13px]"
            >
              <span className="font-[580]">{c.label}</span>
              <span
                className={`font-mono text-[11px] ${
                  c.correct ? 'text-[var(--color-brand)]' : 'text-[var(--color-danger)]'
                }`}
              >
                {c.earned}/{c.points}
              </span>
              <span className="w-full text-[12.5px] text-[var(--color-ink-muted)]">
                {c.correct ? (
                  c.expected
                ) : (
                  <>
                    Respondiste <span className="text-[var(--color-ink)]">{c.given}</span>
                    {' · '}
                    Correcto: <span className="text-[var(--color-ink)]">{c.expected}</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3.5 text-[14px] leading-[1.65] text-[var(--color-ink)]">
        {question.explanation}
      </p>
      <p className="mt-2 text-[12px] text-[var(--color-ink-subtle)]">{question.ruleReference}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Resultado del módulo
// ---------------------------------------------------------------------------

function Results({
  slug,
  moduleId,
  moduleTitle,
  courseTitle,
  requiredScore,
  critical,
  value,
  passed,
  previousBest,
  answers,
  onRetry,
}: {
  slug: string
  moduleId: string
  moduleTitle: string
  courseTitle: string
  requiredScore: number
  critical: boolean
  value: number
  passed: boolean
  previousBest: number
  answers: Answered[]
  onRetry: () => void
}) {
  const wrong = answers.filter((a) => !a.result.correct)

  return (
    <div className="mt-8">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8">
        <p className="text-[12px] font-[620] uppercase tracking-[0.09em] text-[var(--color-ink-subtle)]">
          {passed ? 'Módulo aprobado' : 'Todavía no alcanza'}
        </p>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span
            className={`text-[54px] font-[660] leading-none tabular-nums tracking-[-0.03em] ${
              passed ? 'text-[var(--color-brand)]' : 'text-[var(--color-ink)]'
            }`}
          >
            {value}
            <span className="text-[26px]"> %</span>
          </span>
          <span className="text-[14px] text-[var(--color-ink-muted)]">
            Se necesita {requiredScore} %{critical && ' · módulo clave'}
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-3)]">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${
              passed ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-warn)]'
            }`}
            style={{ width: `${value}%` }}
          />
        </div>

        <p className="mt-4 text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
          {passed
            ? `Respondiste bien lo suficiente del módulo ${moduleTitle.toLowerCase()}. Repetirlo mezcla el orden, así que sirve para repasar.`
            : `Faltan ${requiredScore - value} puntos. Las preguntas que erraste están abajo, con su explicación y la Regla de la que salen.`}
        </p>

        {previousBest > 0 && (
          <p className="mt-2 text-[12.5px] text-[var(--color-ink-subtle)]">
            Tu mejor nota en este módulo: {Math.max(previousBest, value)} %
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
          >
            Volver a intentar
          </button>
          <Link
            href={`/curso/${slug}`}
            className="rounded-lg border border-[var(--color-line-strong)] px-4 py-2.5 text-[14px] font-[540] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            Volver a {courseTitle}
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
