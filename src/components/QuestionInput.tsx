'use client'

import {
  DISCIPLINARY_LABELS,
  DISCIPLINARY_OPTIONS,
  RESTART_LABELS,
  TECHNICAL_LABELS,
  restartOptions,
  technicalOptions,
  type DecisionAnswer,
  type Question,
} from '@/lib/quiz'

/**
 * Controles de respuesta, compartidos por los cuestionarios de módulo y por el
 * examen final. La diferencia entre ambos no está acá sino en cuándo se
 * corrige: el cuestionario explica al instante, el examen al final.
 */

export function isCompleteDecision(value: unknown): boolean {
  const d = value as Partial<DecisionAnswer> | undefined
  return (
    d !== undefined &&
    d.isOffence !== undefined &&
    Boolean(d.technical) &&
    Boolean(d.disciplinary) &&
    Boolean(d.restart)
  )
}

export function isAnswered(question: Question, draft: unknown): boolean {
  return question.type === 'decision' ? isCompleteDecision(draft) : draft !== undefined
}

export function Options({
  options,
  selected,
  correctIndex,
  revealed,
  onSelect,
}: {
  options: string[]
  selected: number | undefined
  correctIndex?: number
  revealed: boolean
  onSelect: (index: number) => void
}) {
  return (
    <ul className="grid gap-2">
      {options.map((option, i) => {
        const isSelected = selected === i
        const isCorrect = revealed && correctIndex !== undefined && i === correctIndex
        const isWrongPick =
          revealed && isSelected && correctIndex !== undefined && i !== correctIndex

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
                      : isSelected
                        ? 'bg-[var(--color-line-strong)] text-[var(--color-ink)]'
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

export function DecisionForm({
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
        <span className="font-mono text-[10.5px] normal-case tracking-normal">{points} pts</span>
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
