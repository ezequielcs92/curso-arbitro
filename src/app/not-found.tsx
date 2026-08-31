import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[560px] flex-col justify-center px-4 sm:px-6">
      <p className="font-mono text-[13px] font-[620] text-[var(--color-ink-subtle)]">404</p>
      <h1 className="mt-3 text-[30px] font-[650] tracking-[-0.024em]">
        Esa página no existe
      </h1>
      <p className="mt-3 text-[15.5px] leading-[1.65] text-[var(--color-ink-muted)]">
        Puede que la lección haya cambiado de dirección o que el enlace esté mal
        escrito.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
        >
          Ir a los cursos
        </Link>
        <Link
          href="/formatos"
          className="rounded-lg border border-[var(--color-line-strong)] px-4 py-2.5 text-[14px] font-[540] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
        >
          Fichas de formato
        </Link>
      </div>
    </div>
  )
}
