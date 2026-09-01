import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Quiz } from '@/components/Quiz'
import { accentClass } from '@/lib/accent'
import {
  DISCIPLINE_SLUGS,
  getCourse,
  getQuestionBank,
  type DisciplineSlug,
} from '@/lib/content'

type Params = { slug: string; moduleId: string }

export function generateStaticParams(): Params[] {
  return DISCIPLINE_SLUGS.flatMap((slug) =>
    getCourse(slug)
      .modules.filter((m) => getQuestionBank(slug, m.id) !== null)
      .map((m) => ({ slug, moduleId: m.id })),
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
  const { slug, moduleId } = await params
  const parsed = parse(slug)
  if (!parsed) return {}

  const course = getCourse(parsed)
  const module = course.modules.find((m) => m.id === moduleId)
  if (!module) return {}

  return {
    title: `Cuestionario · ${module.title}`,
    description: `Pon a prueba el módulo ${module.title} del curso de ${course.short}.`,
  }
}

export default async function QuizPage({ params }: { params: Promise<Params> }) {
  const { slug, moduleId } = await params
  const parsed = parse(slug)
  if (!parsed) notFound()

  const course = getCourse(parsed)
  const module = course.modules.find((m) => m.id === moduleId)
  if (!module) notFound()

  const bank = getQuestionBank(parsed, moduleId)
  if (!bank) notFound()

  return (
    <div className={`${accentClass(parsed)} mx-auto max-w-[720px] px-4 pb-24 sm:px-6`}>
      <nav
        aria-label="Ubicación"
        className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-[12.5px]"
      >
        <Link
          href={`/curso/${parsed}`}
          className="font-[560] text-[var(--accent)] transition-opacity hover:opacity-75"
        >
          {course.short}
        </Link>
        <span aria-hidden="true" className="text-[var(--color-line-strong)]">
          /
        </span>
        <span className="text-[var(--color-ink-muted)]">{module.title}</span>
      </nav>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11.5px] font-[620] uppercase tracking-[0.05em] text-[var(--color-ink-subtle)]">
            {module.id}
          </span>
          {module.critical && (
            <span className="rounded bg-[var(--color-surface-3)] px-1.5 py-px text-[10px] font-[640] uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
              clave
            </span>
          )}
        </div>

        <h1 className="mt-2 text-[28px] font-[650] leading-[1.15] tracking-[-0.022em] sm:text-[34px]">
          Cuestionario
        </h1>
        <p className="mt-2 text-[16px] text-[var(--color-ink-muted)]">{module.title}</p>

        <p className="mt-4 text-[12.5px] text-[var(--color-ink-subtle)]">
          {bank.questions.length} preguntas · se aprueba con {module.requiredScore} % ·{' '}
          {course.rulesVersion}
        </p>
      </header>

      <Quiz
        slug={parsed}
        discipline={course.discipline}
        moduleId={module.id}
        moduleTitle={module.title}
        courseTitle={course.short}
        critical={module.critical}
        requiredScore={module.requiredScore}
        questions={bank.questions}
      />
    </div>
  )
}
