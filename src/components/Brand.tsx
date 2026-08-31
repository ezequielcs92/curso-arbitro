/**
 * Marca. Un cuadrado con una diagonal y dos puntos: la línea de fuera de juego
 * y el sistema de diagonal del árbitro. Deliberadamente abstracta — un silbato
 * dibujado habría quedado infantil para un curso de reglamento.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="1.25"
        y="1.25"
        width="25.5"
        height="25.5"
        rx="7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.32"
      />
      <path
        d="M6.5 21.5 21.5 6.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <circle cx="9.4" cy="9.4" r="2.15" fill="currentColor" />
      <circle cx="18.6" cy="18.6" r="2.15" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark className="h-[26px] w-[26px] text-[var(--color-brand)]" />
      <span className="text-[15px] font-[620] tracking-[-0.014em] text-[var(--color-ink)]">
        Árbitro Amateur
      </span>
    </span>
  )
}
