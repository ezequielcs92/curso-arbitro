import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CourseSidebar } from '@/components/CourseSidebar'
import { LessonFooter } from '@/components/LessonFooter'
import { ReadingProgress } from '@/components/ReadingProgress'
import { Toc } from '@/components/Toc'
import { accentClass } from '@/lib/accent'
import {
  DISCIPLINE_SLUGS,
  getCourse,
  getLesson,
  getLessonSequence,
  getQuestionBank,
  type DisciplineSlug,
} from '@/lib/content'

type Params = { slug: string; lessonId: string }

export function generateStaticParams(): Params[] {
  return DISCIPLINE_SLUGS.flatMap((slug) =>
    getLessonSequence(slug).map((lesson) => ({ slug, lessonId: lesson.id })),
  )
}

function parse(slug: string): DisciplineSlug | null {
  return (DISCIPLINE_SLUGS as readonly string[]).includes(slug) ? (slug as DisciplineSlug) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug, lessonId } = await params
  const parsed = parse(slug)
  if (!parsed) return {}

  const page = getLesson(parsed, lessonId)
  if (!page) return {}

  return {
    title: page.lesson.title,
    description: `${page.module.title} · ${page.course.title} · ${page.course.rulesVersion}`,
  }
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { slug, lessonId } = await params
  const parsed = parse(slug)
  if (!parsed) notFound()

  const page = getLesson(parsed, lessonId)
  if (!page) notFound()

  const course = getCourse(parsed)
  const accent = accentClass(parsed)

  // El cuestionario se ofrece al cerrar el módulo, que es cuando tiene sentido
  // ponerlo a prueba: antes, la mitad de las preguntas serían sobre lecciones
  // que todavía no se leyeron.
  const isLastOfModule =
    page.module.lessons[page.module.lessons.length - 1].id === lessonId
  const bank = isLastOfModule ? getQuestionBank(parsed, page.module.id) : null

  return (
    <div className={accent}>
      <ReadingProgress />

      <div className="mx-auto flex max-w-[1440px] gap-0 px-4 sm:px-6">
        {/* ------------------------------------------------------- lateral */}
        <aside className="no-print hidden w-[276px] flex-none lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain py-6 pr-6">
            <CourseSidebar
              slug={parsed}
              courseTitle={course.short}
              rulesVersion={course.rulesVersion}
              modules={course.modules.map((m) => ({
                id: m.id,
                order: m.order,
                title: m.title,
                critical: m.critical,
                laws: m.laws,
                lessons: m.lessons.map((l) => ({ id: l.id, order: l.order, title: l.title })),
              }))}
              currentLessonId={lessonId}
            />
          </div>
        </aside>

        {/* ------------------------------------------------------ contenido */}
        <article className="min-w-0 flex-1 border-[var(--color-line)] py-8 sm:py-10 lg:border-x lg:px-10 xl:px-14">
          <header>
            <nav aria-label="Ubicación" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
              <Link
                href={`/curso/${parsed}`}
                className="font-[560] text-[var(--accent)] transition-opacity hover:opacity-75"
              >
                {course.short}
              </Link>
              <span aria-hidden="true" className="text-[var(--color-line-strong)]">
                /
              </span>
              <span className="text-[var(--color-ink-muted)]">{page.module.title}</span>
            </nav>

            <h1 className="mt-3 text-[30px] font-[650] leading-[1.14] tracking-[-0.024em] sm:text-[38px]">
              {page.lesson.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-[var(--color-ink-subtle)]">
              <span className="tabular-nums">
                Lección {page.index} de {page.total}
              </span>
              {page.ruleReference && (
                <>
                  <span aria-hidden="true" className="text-[var(--color-line-strong)]">
                    ·
                  </span>
                  <span className="rounded-md bg-[var(--color-surface-2)] px-2 py-0.5 font-[560] text-[var(--color-ink-muted)]">
                    {page.ruleReference}
                  </span>
                </>
              )}
              {page.rulesVersion && (
                <>
                  <span aria-hidden="true" className="text-[var(--color-line-strong)]">
                    ·
                  </span>
                  <span>{page.rulesVersion}</span>
                </>
              )}
            </div>
          </header>

          {/* Índice en pantallas donde la columna derecha no entra. */}
          {page.doc.headings.length > 2 && (
            <details className="no-print group mt-7 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] xl:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[12.5px] font-[600] uppercase tracking-[0.07em] text-[var(--color-ink-muted)]">
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3 transition-transform duration-200 group-open:rotate-90"
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
                En esta lección
              </summary>
              <ul className="px-4 pb-3 text-[13.5px]">
                {page.doc.headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="block py-1.5 text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div
            className="prose mt-10 max-w-[70ch]"
            dangerouslySetInnerHTML={{ __html: page.doc.html }}
          />

          {bank && (
            <aside className="no-print mt-14 max-w-[70ch] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-5 sm:p-6">
              <p className="text-[12px] font-[620] uppercase tracking-[0.08em] text-[var(--color-ink-subtle)]">
                Fin del módulo
              </p>
              <h2 className="mt-2 text-[17px] font-[640] tracking-[-0.014em]">
                Poné a prueba {page.module.title.toLowerCase()}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
                {bank.questions.length} preguntas con su explicación y su referencia
                reglamentaria. Se aprueba con {page.module.requiredScore} %
                {page.module.critical && ', porque es un módulo clave'}.
              </p>
              <Link
                href={`/curso/${parsed}/test/${page.module.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-[14px] font-[580] text-white transition-colors hover:bg-[var(--color-brand-strong)] dark:text-[#06231a]"
              >
                Hacer el cuestionario
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path
                    d="M6 3.5 10.5 8 6 12.5"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </aside>
          )}

          <div className="max-w-[70ch]">
            <LessonFooter
              slug={parsed}
              lessonId={lessonId}
              previous={
                page.previous ? { id: page.previous.id, title: page.previous.title } : null
              }
              next={page.next ? { id: page.next.id, title: page.next.title } : null}
            />
          </div>
        </article>

        {/* ---------------------------------------------------------- índice */}
        <aside className="no-print hidden w-[228px] flex-none xl:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto py-10 pl-8">
            <Toc headings={page.doc.headings} />
          </div>
        </aside>
      </div>
    </div>
  )
}
