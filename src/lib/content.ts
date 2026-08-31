import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import GithubSlugger from 'github-slugger'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'
import type { Discipline } from '@/domain/types'

const ROOT = process.cwd()

/**
 * URL slug for each discipline. Kept identical to the content directory names
 * so a route and a folder never drift apart.
 */
export const DISCIPLINE_SLUGS = ['football', 'futsal', 'beach-soccer'] as const
export type DisciplineSlug = (typeof DISCIPLINE_SLUGS)[number]

type CourseLocation = {
  slug: DisciplineSlug
  discipline: Discipline
  dir: string
  /** Short label used in navigation, where the full title is too long. */
  short: string
  accent: string
  tagline: string
}

export const COURSES: Record<DisciplineSlug, CourseLocation> = {
  football: {
    slug: 'football',
    discipline: 'football',
    dir: 'content/football/ifab-2026-27',
    short: 'Fútbol',
    accent: 'grass',
    tagline: 'De F5 a F11, bajo las Reglas de IFAB.',
  },
  futsal: {
    slug: 'futsal',
    discipline: 'futsal',
    dir: 'content/futsal/fifa-2025-26',
    short: 'Futsal',
    accent: 'court',
    tagline: 'Tiempo efectivo, faltas acumuladas, reglamento propio de FIFA.',
  },
  'beach-soccer': {
    slug: 'beach-soccer',
    discipline: 'beach_soccer',
    dir: 'content/beach-soccer/fifa-2025-26',
    short: 'Fútbol playa',
    accent: 'sand',
    tagline: 'Tres períodos, sin barrera, con el reparto de puntos en la Ley.',
  },
}

// ---------------------------------------------------------------------------
// Shapes read from disk
// ---------------------------------------------------------------------------

export type RawLesson = {
  id: string
  moduleId: string
  order: number
  title: string
  contentPath: string
}

export type RawModule = {
  id: string
  discipline: Discipline
  order: number
  title: string
  laws: number[]
  critical: boolean
  requiredScore: number
  lessons: RawLesson[]
}

export type RawCourse = {
  discipline: Discipline
  title: string
  rulesVersion: string
  sourcePdf: string
  modules: RawModule[]
}

export type CourseData = RawCourse & {
  slug: DisciplineSlug
  short: string
  accent: string
  tagline: string
  lessonCount: number
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

const courseCache = new Map<DisciplineSlug, CourseData>()

export function getCourse(slug: DisciplineSlug): CourseData {
  const cached = courseCache.get(slug)
  if (cached) return cached

  const location = COURSES[slug]
  const file = path.join(ROOT, location.dir, 'curso.json')
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as RawCourse

  const course: CourseData = {
    ...raw,
    slug,
    short: location.short,
    accent: location.accent,
    tagline: location.tagline,
    lessonCount: raw.modules.reduce((n, m) => n + m.lessons.length, 0),
  }

  courseCache.set(slug, course)
  return course
}

export function getAllCourses(): CourseData[] {
  return DISCIPLINE_SLUGS.map(getCourse)
}

/** Every lesson of a course, flattened in reading order. */
export function getLessonSequence(slug: DisciplineSlug): RawLesson[] {
  return getCourse(slug).modules.flatMap((m) => m.lessons)
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export type Heading = { id: string; text: string }

export type RenderedDoc = {
  html: string
  headings: Heading[]
  frontmatter: Record<string, unknown>
}

/**
 * Envuelve cada tabla en un contenedor con desplazamiento propio. Las fichas
 * de formato son casi todas tabla, y en un telefono tienen que poder
 * desplazarse solas sin que se mueva la pagina entera.
 */
function rehypeWrapTables() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return
      if ((parent as Element).properties?.className) {
        const cls = (parent as Element).properties.className
        if (Array.isArray(cls) && cls.includes('table-scroll')) return
      }

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [node],
      } as Element
    })
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // The lessons carry hand-written <details> blocks for the mini test answers,
  // so raw HTML has to survive the pipeline.
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeWrapTables)
  .use(rehypeStringify, { allowDangerousHtml: true })

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Convierte las opciones del mini test en una lista real.
 *
 * En el Markdown estan escritas como cuatro lineas seguidas:
 *
 *     A. Si, cualquier parte del cuerpo cuenta
 *     B. No: manos y brazos no se tienen en cuenta
 *
 * Sin linea en blanco entre ellas, Markdown las une en un solo parrafo y las
 * cuatro opciones terminan corridas en el mismo renglon. Se las reescribe como
 * HTML antes de parsear, en vez de tocar los 178 archivos: la fuente sigue
 * siendo comoda de escribir y de leer en el repositorio.
 *
 * Las opciones pueden continuar en la linea siguiente con sangria, y esas
 * continuaciones se pegan al texto de su opcion.
 */
function wrapQuizOptions(markdown: string): string {
  const lines = markdown.split('\n')
  const out: string[] = []
  let inFence = false
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Dentro de un bloque de codigo no se toca nada: las fichas de formato
    // tienen bloques para completar a mano que pueden empezar con una letra.
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      out.push(line)
      i++
      continue
    }

    if (inFence || !/^[A-D]\.\s/.test(line)) {
      out.push(line)
      i++
      continue
    }

    const items: { letter: string; text: string }[] = []
    while (i < lines.length && /^[A-D]\.\s/.test(lines[i])) {
      const match = /^([A-D])\.\s+(.*)$/.exec(lines[i])!
      let text = match[2].trim()
      i++

      while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
        text += ' ' + lines[i].trim()
        i++
      }

      items.push({ letter: match[1], text })
    }

    out.push('')
    out.push('<ol class="options">')
    for (const item of items) {
      out.push(
        `<li><span class="opt-letter">${item.letter}</span>` +
          `<span class="opt-text">${escapeHtml(item.text)}</span></li>`,
      )
    }
    out.push('</ol>')
    out.push('')
  }

  return out.join('\n')
}

/**
 * Renders one Markdown file. The first `# ` heading is dropped: the page
 * already shows the title in its own header, so keeping it would print it
 * twice.
 */
function renderMarkdown(absolutePath: string): RenderedDoc {
  const source = fs.readFileSync(absolutePath, 'utf8')
  const { data, content } = matter(source)

  const body = wrapQuizOptions(content.replace(/^#\s+.+$/m, '').trimStart())

  // Un slugger por documento, igual que rehype-slug, para que los anclas del
  // indice coincidan exactamente con los ids que termina emitiendo el HTML.
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  for (const line of body.split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(line)
    if (m) {
      const text = m[1].replace(/[*`]/g, '')
      headings.push({ id: slugger.slug(text), text })
    }
  }

  const html = String(processor.processSync(body))
  return { html, headings, frontmatter: data }
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export type LessonPage = {
  slug: DisciplineSlug
  course: CourseData
  module: RawModule
  lesson: RawLesson
  /** Position within the whole course, 1-based. */
  index: number
  total: number
  previous: RawLesson | null
  next: RawLesson | null
  ruleReference?: string
  rulesVersion?: string
  doc: RenderedDoc
}

export function getLesson(slug: DisciplineSlug, lessonId: string): LessonPage | null {
  const course = getCourse(slug)

  const module = course.modules.find((m) => m.lessons.some((l) => l.id === lessonId))
  if (!module) return null

  const lesson = module.lessons.find((l) => l.id === lessonId)!
  const sequence = getLessonSequence(slug)
  const index = sequence.findIndex((l) => l.id === lessonId)

  const doc = renderMarkdown(path.join(ROOT, lesson.contentPath))

  return {
    slug,
    course,
    module,
    lesson,
    index: index + 1,
    total: sequence.length,
    previous: index > 0 ? sequence[index - 1] : null,
    next: index < sequence.length - 1 ? sequence[index + 1] : null,
    ruleReference: doc.frontmatter.ruleReference as string | undefined,
    rulesVersion: doc.frontmatter.rulesVersion as string | undefined,
    doc,
  }
}

// ---------------------------------------------------------------------------
// Format sheets
// ---------------------------------------------------------------------------

export type FormatSheetMeta = {
  id: string
  format: string
  title: string
  contentPath: string
  summary: string
}

type FormatSheetIndex = {
  discipline: Discipline
  rulesVersion: string
  note: string
  sheets: FormatSheetMeta[]
}

const SHEETS_FILE = 'content/football/ifab-2026-27/formatos/formatos.json'

export function getFormatSheets(): FormatSheetIndex {
  const raw = fs.readFileSync(path.join(ROOT, SHEETS_FILE), 'utf8')
  return JSON.parse(raw) as FormatSheetIndex
}

export function getFormatSheet(
  format: string,
): { meta: FormatSheetMeta; doc: RenderedDoc } | null {
  const index = getFormatSheets()
  const meta = index.sheets.find((s) => s.format.toLowerCase() === format.toLowerCase())
  if (!meta) return null

  return { meta, doc: renderMarkdown(path.join(ROOT, meta.contentPath)) }
}
