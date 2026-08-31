import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CourseHeader } from '@/components/CourseHeader'
import { ModuleList } from '@/components/ModuleList'
import { OfflineCourse } from '@/components/OfflineCourse'
import { accentClass } from '@/lib/accent'
import { DISCIPLINE_SLUGS, getCourse, type DisciplineSlug } from '@/lib/content'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return DISCIPLINE_SLUGS.map((slug) => ({ slug }))
}

function parse(slug: string): DisciplineSlug | null {
  return (DISCIPLINE_SLUGS as readonly string[]).includes(slug) ? (slug as DisciplineSlug) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const parsed = parse(slug)
  if (!parsed) return {}

  const course = getCourse(parsed)
  return { title: course.short, description: course.tagline }
}

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const parsed = parse(slug)
  if (!parsed) notFound()

  const course = getCourse(parsed)
  const modules = course.modules.map((m) => ({
    id: m.id,
    order: m.order,
    title: m.title,
    critical: m.critical,
    laws: m.laws,
    lessons: m.lessons.map((l) => ({ id: l.id, order: l.order, title: l.title })),
  }))

  return (
    <div className={`${accentClass(parsed)} mx-auto max-w-[1000px] px-4 pb-24 sm:px-6`}>
      <nav aria-label="Ubicación" className="pt-8 text-[12.5px]">
        <Link
          href="/"
          className="text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]"
        >
          Cursos
        </Link>
      </nav>

      <CourseHeader
        slug={parsed}
        title={course.short}
        tagline={course.tagline}
        rulesVersion={course.rulesVersion}
        modules={modules}
      />

      <OfflineCourse
        slug={parsed}
        courseTitle={course.short}
        lessonIds={modules.flatMap((m) => m.lessons.map((l) => l.id))}
      />

      <h2 className="mt-14 text-[13px] font-[620] uppercase tracking-[0.09em] text-[var(--color-ink-subtle)]">
        Módulos
      </h2>
      <div className="mt-5">
        <ModuleList slug={parsed} modules={modules} />
      </div>

      {parsed === 'football' && (
        <section className="mt-14 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-5 sm:p-6">
          <h2 className="text-[16px] font-[640] tracking-[-0.014em]">
            ¿Vas a dirigir F5, F7, F8 o F9?
          </h2>
          <p className="mt-2 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
            Los formatos reducidos son fútbol bajo las mismas Reglas, así que
            comparten este curso. Lo que cambia en cada uno está en su ficha, para
            consultar antes del partido.
          </p>
          <Link
            href="/formatos"
            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-[580] text-[var(--color-brand)] transition-opacity hover:opacity-75"
          >
            Ver las fichas de formato
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M6 3.5 10.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </section>
      )}
    </div>
  )
}
