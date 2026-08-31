import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sin conexión',
  description: 'Esta página todavía no está guardada para consultar sin conexión.',
}

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[560px] flex-col justify-center px-4 sm:px-6">
      <p className="text-[12.5px] font-[600] uppercase tracking-[0.11em] text-[var(--color-ink-subtle)]">
        Sin conexión
      </p>
      <h1 className="mt-3 text-[30px] font-[650] tracking-[-0.024em]">
        Esta página todavía no está guardada
      </h1>
      <p className="mt-3 text-[15.5px] leading-[1.65] text-[var(--color-ink-muted)]">
        Las lecciones quedan disponibles sin conexión después de abrirlas una
        vez. Si vas a dirigir en una cancha sin señal, conviene abrir antes lo
        que quieras consultar.
      </p>
      <div className="mt-7">
        <Link
          href="/"
          className="inline-block rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
        >
          Volver a los cursos
        </Link>
      </div>
    </div>
  )
}
