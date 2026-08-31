import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReadingProgress } from '@/components/ReadingProgress'
import { Toc } from '@/components/Toc'
import { getFormatSheet, getFormatSheets } from '@/lib/content'

type Params = { format: string }

export function generateStaticParams(): Params[] {
  return getFormatSheets().sheets.map((s) => ({ format: s.format.toLowerCase() }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { format } = await params
  const sheet = getFormatSheet(format)
  if (!sheet) return {}

  return {
    title: `Ficha ${sheet.meta.format} · ${sheet.meta.title}`,
    description: sheet.meta.summary,
  }
}

export default async function FormatSheetPage({ params }: { params: Promise<Params> }) {
  const { format } = await params
  const sheet = getFormatSheet(format)
  if (!sheet) notFound()

  const index = getFormatSheets()
  const others = index.sheets.filter((s) => s.format !== sheet.meta.format)

  return (
    <div className="accent-football">
      <ReadingProgress />

      <div className="mx-auto flex max-w-[1200px] gap-0 px-4 sm:px-6">
        <article className="min-w-0 flex-1 py-8 sm:py-10">
          <nav
            aria-label="Ubicación"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]"
          >
            <Link
              href="/formatos"
              className="font-[560] text-[var(--color-brand)] transition-opacity hover:opacity-75"
            >
              Fichas de formato
            </Link>
            <span aria-hidden="true" className="text-[var(--color-line-strong)]">
              /
            </span>
            <span className="text-[var(--color-ink-muted)]">{sheet.meta.format}</span>
          </nav>

          <header className="mt-3">
            <h1 className="text-[30px] font-[650] leading-[1.14] tracking-[-0.024em] sm:text-[38px]">
              {sheet.meta.title}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.6] text-[var(--color-ink-muted)]">
              {sheet.meta.summary}
            </p>
            <p className="mt-4 text-[12.5px] text-[var(--color-ink-subtle)]">
              {index.rulesVersion}
            </p>
          </header>

          <div
            className="prose mt-10 max-w-[70ch]"
            dangerouslySetInnerHTML={{ __html: sheet.doc.html }}
          />

          <nav
            aria-label="Otras fichas"
            className="mt-16 max-w-[70ch] border-t border-[var(--color-line)] pt-8"
          >
            <p className="text-[12.5px] font-[620] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
              Otras fichas
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/formatos/${other.format.toLowerCase()}`}
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 transition-all hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-subtle)]"
                >
                  <span className="font-mono text-[11.5px] font-[620] text-[var(--color-brand)]">
                    {other.format}
                  </span>
                  <span className="mt-1 block text-[13.5px] font-[560]">{other.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </article>

        <aside className="hidden w-[228px] flex-none xl:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto py-10 pl-8">
            <Toc headings={sheet.doc.headings} />
          </div>
        </aside>
      </div>
    </div>
  )
}
