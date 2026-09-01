import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExamRunner } from '@/components/ExamRunner'
import { PracticeLog } from '@/components/PracticeLog'
import { accentClass } from '@/lib/accent'
import { EXAM_SPECS, RULEBOOK_READING_MINUTES, type ExamPart } from '@/lib/exam'
import { FORMATS_BY_DISCIPLINE } from '@/domain/types'
import {
  DISCIPLINE_SLUGS,
  getAllQuestions,
  getCourse,
  getExamDecisions,
  getRulebooks,
  type DisciplineSlug,
} from '@/lib/content'

type Params = { slug: string; part: string }

const PARTS: ExamPart[] = ['a', 'b', 'c', 'd']

export function generateStaticParams(): Params[] {
  return DISCIPLINE_SLUGS.flatMap((slug) => PARTS.map((part) => ({ slug, part })))
}

function parse(slug: string): DisciplineSlug | null {
  return (DISCIPLINE_SLUGS as readonly string[]).includes(slug) ? (slug as DisciplineSlug) : null
}

function parsePart(part: string): ExamPart | null {
  return (PARTS as string[]).includes(part) ? (part as ExamPart) : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, part } = await params
  const parsed = parse(slug)
  const parsedPart = parsePart(part)
  if (!parsed || !parsedPart) return {}

  const course = getCourse(parsed)
  const spec = EXAM_SPECS[course.discipline][parsedPart]

  return {
    title: `Parte ${parsedPart.toUpperCase()} · ${spec.title}`,
    description: spec.subtitle,
  }
}

export default async function ExamPartPage({ params }: { params: Promise<Params> }) {
  const { slug, part } = await params
  const parsed = parse(slug)
  const parsedPart = parsePart(part)
  if (!parsed || !parsedPart) notFound()

  const course = getCourse(parsed)
  const spec = EXAM_SPECS[course.discipline][parsedPart]

  const pool =
    parsedPart === 'a'
      ? getAllQuestions(parsed)
      : parsedPart === 'b'
        ? getExamDecisions(parsed)
        : []

  const rulebooks = parsedPart === 'c' ? getRulebooks(parsed) : undefined

  return (
    <div className={`${accentClass(parsed)} mx-auto max-w-[760px] px-4 pb-24 sm:px-6`}>
      <nav
        aria-label="Ubicación"
        className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-[12.5px]"
      >
        <Link
          href={`/curso/${parsed}/examen`}
          className="font-[560] text-[var(--accent)] transition-opacity hover:opacity-75"
        >
          Examen final
        </Link>
        <span aria-hidden="true" className="text-[var(--color-line-strong)]">
          /
        </span>
        <span className="text-[var(--color-ink-muted)]">{course.short}</span>
      </nav>

      <header className="mt-3">
        <p className="font-mono text-[12px] font-[620] uppercase tracking-[0.06em] text-[var(--color-ink-subtle)]">
          Parte {parsedPart.toUpperCase()}
        </p>
        <h1 className="mt-1.5 text-[30px] font-[650] leading-[1.14] tracking-[-0.024em] sm:text-[36px]">
          {spec.title}
        </h1>
        <p className="mt-2.5 max-w-[58ch] text-[15.5px] leading-[1.6] text-[var(--color-ink-muted)]">
          {spec.subtitle}
        </p>

        <p className="mt-4 text-[12.5px] text-[var(--color-ink-subtle)]">
          {parsedPart === 'd'
            ? `Dos partidos registrados; el segundo evaluado con la rúbrica de 100 puntos · ${course.rulesVersion}`
            : `${spec.count} preguntas · se aprueba con ${spec.pass} · ${course.rulesVersion}`}
        </p>

        {parsedPart === 'c' && (
          <p className="mt-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-3 text-[13.5px] leading-[1.6] text-[var(--color-ink-muted)]">
            Vas a tener {RULEBOOK_READING_MINUTES} minutos para leer un reglamento
            de torneo. Después no vas a poder volver a mirarlo.
          </p>
        )}
      </header>

      {parsedPart === 'd' ? (
        <PracticeLog
          slug={parsed}
          discipline={course.discipline}
          formats={[...FORMATS_BY_DISCIPLINE[course.discipline]]}
        />
      ) : (
        <ExamRunner
          slug={parsed}
          discipline={course.discipline}
          courseTitle={course.short}
          part={parsedPart}
          title={spec.title}
          count={spec.count}
          pass={spec.pass}
          pool={pool}
          rulebooks={rulebooks}
        />
      )}
    </div>
  )
}
