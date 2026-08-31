import Link from 'next/link'
import { CourseCard } from '@/components/CourseCard'
import { getAllCourses, getFormatSheets } from '@/lib/content'

export default function HomePage() {
  const courses = getAllCourses()
  const sheets = getFormatSheets()

  const totalLessons = courses.reduce((n, c) => n + c.lessonCount, 0)
  const totalModules = courses.reduce((n, c) => n + c.modules.length, 0)

  return (
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
      {/* ---------------------------------------------------------------- hero */}
      <section className="pt-14 pb-12 sm:pt-20 sm:pb-16">
        <p className="text-[12.5px] font-[600] uppercase tracking-[0.11em] text-[var(--color-ink-subtle)]">
          Fútbol · Futsal · Fútbol playa
        </p>

        <h1 className="mt-4 max-w-[19ch] text-[38px] font-[650] leading-[1.08] tracking-[-0.028em] sm:text-[52px]">
          Aprendé a arbitrar, regla por regla.
        </h1>

        <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.65] text-[var(--color-ink-muted)] sm:text-[17.5px]">
          Tres cursos independientes, escritos contra los reglamentos oficiales
          de IFAB y FIFA. Sin reglas de memoria, sin reglas inventadas: cada
          lección dice de qué Ley sale lo que afirma.
        </p>

        <dl className="mt-10 flex flex-wrap items-baseline gap-x-9 gap-y-4">
          {[
            { n: totalLessons, label: 'lecciones' },
            { n: totalModules, label: 'módulos' },
            { n: 3, label: 'reglamentos oficiales' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <dd className="text-[26px] font-[650] tabular-nums tracking-[-0.02em]">
                {stat.n}
              </dd>
              <dt className="text-[13.5px] text-[var(--color-ink-subtle)]">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------------- cursos */}
      <section aria-labelledby="cursos" className="scroll-mt-24">
        <h2 id="cursos" className="sr-only">
          Los tres cursos
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.slug}
              slug={course.slug}
              title={course.short}
              tagline={course.tagline}
              rulesVersion={course.rulesVersion}
              moduleCount={course.modules.length}
              lessonIds={course.modules.flatMap((m) => m.lessons.map((l) => l.id))}
              firstLessonId={course.modules[0].lessons[0].id}
            />
          ))}
        </div>

        <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--color-ink-subtle)]">
          Son cursos separados porque son deportes separados, con reglamentos
          que se contradicen entre sí. IFAB 2026/27 permite joyería que no sea
          peligrosa y esté cubierta; futsal y fútbol playa la prohíben toda.
        </p>
      </section>

      {/* ------------------------------------------------------------ fichas */}
      <section aria-labelledby="fichas" className="mt-20 sm:mt-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 id="fichas" className="text-[22px] font-[640] tracking-[-0.02em]">
              Fichas de formato
            </h2>
            <p className="mt-2 max-w-[58ch] text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
              Para consultar antes del partido. IFAB no fija ninguna medida para
              los formatos reducidos, así que cada ficha contrasta contra F11 y
              deja en blanco lo que define cada torneo.
            </p>
          </div>
          <Link
            href="/formatos"
            className="hidden flex-none items-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-[580] text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)] sm:inline-flex"
          >
            Ver todas
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
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sheets.sheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/formatos/${sheet.format.toLowerCase()}`}
              className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-card)]"
            >
              <span className="font-mono text-[12px] font-[600] tracking-[0.04em] text-[var(--color-brand)]">
                {sheet.format}
              </span>
              <h3 className="mt-1.5 text-[15px] font-[620] tracking-[-0.012em]">{sheet.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.55] text-[var(--color-ink-muted)]">
                {sheet.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- fuente */}
      <section aria-labelledby="fuente" className="mt-20 mb-24 sm:mt-24">
        <h2 id="fuente" className="text-[22px] font-[640] tracking-[-0.02em]">
          Cómo está escrito
        </h2>

        <div className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-3">
          {[
            {
              t: 'Contra la fuente, no de memoria',
              d: 'Cada lección se escribió leyendo el PDF oficial. Donde el reglamento no dice nada, la lección lo dice en vez de rellenar el hueco.',
            },
            {
              t: 'Oficial, de competición o privada',
              d: 'Una regla del torneo no se presenta nunca como si fuera IFAB o FIFA. Jugar sin fuera de juego es válido; llamarlo reglamento no lo es.',
            },
            {
              t: 'No habilita a arbitrar',
              d: 'Es material de estudio para arbitraje amateur. La habilitación oficial la da un colegio de árbitros, no un curso.',
            },
          ].map((item) => (
            <div key={item.t}>
              <h3 className="text-[15px] font-[620] tracking-[-0.012em]">{item.t}</h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[var(--color-ink-muted)]">
                {item.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
