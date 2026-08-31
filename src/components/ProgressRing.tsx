type Props = {
  value: number
  total: number
  size?: number
  stroke?: number
  className?: string
  /** Muestra el porcentaje en el centro. */
  showLabel?: boolean
}

export function ProgressRing({
  value,
  total,
  size = 40,
  stroke = 3,
  className = '',
  showLabel = false,
}: Props) {
  const pct = total > 0 ? Math.min(1, value / total) : 0
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const complete = total > 0 && value >= total

  return (
    <span
      className={`relative inline-flex flex-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent, var(--color-brand))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center">
          {complete ? (
            <svg
              viewBox="0 0 20 20"
              className="h-[45%] w-[45%] text-[var(--accent,var(--color-brand))]"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m4.5 10.5 3.6 3.6L15.5 6.7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span
              className="font-sans font-[620] tabular-nums text-[var(--color-ink-muted)]"
              style={{ fontSize: size * 0.27 }}
            >
              {Math.round(pct * 100)}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
