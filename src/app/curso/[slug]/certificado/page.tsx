import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Certificate } from '@/components/Certificate'
import { accentClass } from '@/lib/accent'
import {
  DISCIPLINE_SLUGS,
  getAllQuestions,
  getCourse,
  type DisciplineSlug,
} from '@/lib/content'

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
    title: `Certificado · ${course.short}`,
    description: 'Certificado interno de finalización. No es una habilitación oficial.',
  }
}

export default async function CertificatePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const parsed = parse(slug)
  if (!parsed) notFound()

  const course = getCourse(parsed)

  return (
    <div className={`${accentClass(parsed)} mx-auto max-w-[760px] px-4 pb-24 sm:px-6`}>
      <nav aria-label="Ubicación" className="no-print pt-8 text-[12.5px]">
        <Link
          href={`/curso/${parsed}/examen`}
          className="font-[560] text-[var(--accent)] transition-opacity hover:opacity-75"
        >
          Examen final
        </Link>
      </nav>

      <header className="no-print mt-3">
        <h1 className="text-[30px] font-[650] leading-[1.14] tracking-[-0.024em] sm:text-[36px]">
          Certificado
        </h1>
      </header>

      <Certificate
        slug={parsed}
        courseTitle={course.short}
        discipline={course.discipline}
        rulesVersion={course.rulesVersion}
        lessonIds={course.modules.flatMap((m) => m.lessons.map((l) => l.id))}
        moduleIds={course.modules.map((m) => m.id)}
        totalQuestions={getAllQuestions(parsed).length}
      />
    </div>
  )
}
