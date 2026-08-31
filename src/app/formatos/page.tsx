import type { Metadata } from 'next'
import Link from 'next/link'
import { getFormatSheets } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Fichas de formato',
  description:
    'F5, F7, F8 y F9: qué cambia en cada formato reducido, qué fija IFAB y qué define cada torneo.',
}

export default function FormatosPage() {
  const index = getFormatSheets()

  return (
    <div className="accent-football mx-auto max-w-[1000px] px-4 pb-24 sm:px-6">
      <header className="pt-12 sm:pt-16">
        <p className="text-[12.5px] font-[600] uppercase tracking-[0.11em] text-[var(--color-ink-subtle)]">
          Consulta previa al partido
        </p>
        <h1 className="mt-4 max-w-[16ch] text-[34px] font-[650] leading-[1.1] tracking-[-0.026em] sm:text-[44px]">
          Fichas de formato
        </h1>
        <p className="mt-5 max-w-[60ch] text-[16px] leading-[1.65] text-[var(--color-ink-muted)]">
          F5 a F11 son el mismo deporte bajo las mismas Reglas, así que comparten
          el curso de fútbol. Lo que cambia por formato está acá, en una página
          por formato, para revisar antes de entrar a la cancha.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        {index.sheets.map((sheet) => (
          <Link
            key={sheet.id}
            href={`/formatos/${sheet.format.toLowerCase()}`}
            className="group flex flex-col rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-card)] sm:p-6"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[13px] font-[640] tracking-[0.03em] text-[var(--color-brand)]">
                {sheet.format}
              </span>
              <h2 className="text-[18px] font-[630] tracking-[-0.016em]">{sheet.title}</h2>
            </div>

            <p className="mt-3 flex-1 text-[14px] leading-[1.6] text-[var(--color-ink-muted)]">
              {sheet.summary}
            </p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-[580] text-[var(--color-brand)]">
              Abrir la ficha
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3.5 10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-12 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-5 sm:p-6">
        <h2 className="text-[15px] font-[640] tracking-[-0.012em]">
          Por qué las fichas tienen casilleros vacíos
        </h2>
        <p className="mt-2.5 max-w-[68ch] text-[14px] leading-[1.7] text-[var(--color-ink-muted)]">
          Porque IFAB no fija <strong className="font-[620] text-[var(--color-ink)]">ningún</strong>{' '}
          valor para los formatos reducidos. Su sección{' '}
          <em>Adaptación de las Reglas</em> solo enumera qué aspectos organizativos
          puede modificar una federación —dimensiones, balón, arco, duración,
          número de jugadores, sustituciones, exclusiones temporales—, y solo en
          fútbol juvenil, de veteranos, de personas con discapacidad y fútbol base.
          Los valores concretos los pone cada organización, así que rellenarlos acá
          con una cifra plausible sería enseñar algo falso.
        </p>
        <p className="mt-3 max-w-[68ch] text-[14px] leading-[1.7] text-[var(--color-ink-muted)]">
          El corolario aparece en las cuatro fichas:{' '}
          <strong className="font-[620] text-[var(--color-ink)]">
            el fuera de juego no está en esa lista
          </strong>
          . Jugar sin él, o con una línea reducida, es regla privada aunque lo
          aplique una federación. Tampoco son adaptables los 9.15 m de la barrera
          ni los 8 segundos del guardameta.
        </p>
      </section>
    </div>
  )
}
