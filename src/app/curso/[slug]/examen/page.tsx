import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExamOverview } from '@/components/ExamOverview'
import { accentClass } from '@/lib/accent'
import { EXAM_SPECS } from '@/lib/exam'
import { DISCIPLINE_SLUGS, getCourse, type DisciplineSlug } from '@/lib/content'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return DISCIPLINE_SLUGS.map((slug) => ({ slug }))
}

function parse(slug: string): DisciplineSlug | null {
  return (DISCIPLINE_SLUGS as readonly string[]).includes(slug) ? (slug as DisciplineSlug) : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const parsed = parse(slug)
  if (!parsed) return {}

  const course = getCourse(parsed)
  return {
    title: `Examen final · ${course.short}`,
    description: `Las cuatro partes del examen final del curso de ${course.short}.`,
  }
}

export default async function ExamPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const parsed = parse(slug)
  if (!parsed) notFound()

  const course = getCourse(parsed)
  const spec = EXAM_SPECS[course.discipline]

  return (
    <div className={`${accentClass(parsed)} mx-auto max-w-[760px] px-4 pb-24 sm:px-6`}>
      <nav aria-label="Ubicación" className="pt-8 text-[12.5px]">
        <Link
          href={`/curso/${parsed}`}
          className="font-[560] text-[var(--accent)] transition-opacity hover:opacity-75"
        >
          {course.short}
        </Link>
      </nav>

      <header className="mt-3">
        <h1 className="text-[32px] font-[650] leading-[1.12] tracking-[-0.024em] sm:text-[40px]">
          Examen final
        </h1>
        <p className="mt-3 max-w-[58ch] text-[16px] leading-[1.65] text-[var(--color-ink-muted)]">
          Cuatro partes: el reglamento, las jugadas, un reglamento privado que hay
          que leer y aplicar, y dos partidos dirigidos.
        </p>
      </header>

      <ExamOverview
        slug={parsed}
        courseTitle={course.short}
        rulesVersion={course.rulesVersion}
        spec={spec}
      />
    </div>
  )
}
