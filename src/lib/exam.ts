import type { Question } from './quiz'

/**
 * Composición del examen final, según las secciones 70 a 75 de la
 * especificación. Cada curso tiene el suyo y no se mezclan: un examen de
 * fútbol nunca sortea una pregunta de futsal.
 */

export type ExamPart = 'a' | 'b' | 'c' | 'd'

export type PartSpec = {
  part: ExamPart
  title: string
  subtitle: string
  /** Cuántas preguntas se sortean. La parte D no tiene. */
  count: number
  /** Cuántas hay que acertar. */
  pass: number
}

export type ExamSpec = {
  a: PartSpec
  b: PartSpec
  c: PartSpec
  d: PartSpec
}

function spec(count: number, pass: number, part: ExamPart, title: string, subtitle: string): PartSpec {
  return { part, title, subtitle, count, pass }
}

export const EXAM_SPECS: Record<string, ExamSpec> = {
  football: {
    a: spec(60, 48, 'a', 'Reglamento', 'Sesenta preguntas sorteadas de los nueve módulos.'),
    b: spec(30, 24, 'b', 'Jugadas', 'Treinta decisiones completas de partido.'),
    c: spec(10, 8, 'c', 'Reglamento privado', 'Se lee un reglamento y se decide qué aplica.'),
    d: spec(2, 2, 'd', 'Práctica', 'Dos partidos registrados; el segundo se evalúa.'),
  },
  futsal: {
    a: spec(40, 32, 'a', 'Reglamento', 'Cuarenta preguntas sorteadas de los once módulos.'),
    b: spec(25, 20, 'b', 'Jugadas', 'Veinticinco decisiones completas de partido.'),
    c: spec(10, 8, 'c', 'Reglamento privado', 'Se lee un reglamento y se decide qué aplica.'),
    d: spec(2, 2, 'd', 'Práctica', 'Dos partidos registrados; el segundo se evalúa.'),
  },
  beach_soccer: {
    a: spec(40, 32, 'a', 'Reglamento', 'Cuarenta preguntas sorteadas de los once módulos.'),
    b: spec(25, 20, 'b', 'Jugadas', 'Veinticinco decisiones completas de partido.'),
    c: spec(10, 8, 'c', 'Reglamento privado', 'Se lee un reglamento y se decide qué aplica.'),
    d: spec(2, 2, 'd', 'Práctica', 'Dos partidos registrados; el segundo se evalúa.'),
  },
}

/** Minutos para leer el reglamento privado antes de responder (§ 73). */
export const RULEBOOK_READING_MINUTES = 10

// ---------------------------------------------------------------------------
// Reglamentos privados
// ---------------------------------------------------------------------------

export type RulebookArticle = { n: string; text: string }

export type Rulebook = {
  id: string
  name: string
  format: string
  intro: string
  articles: RulebookArticle[]
  questions: Question[]
}

// ---------------------------------------------------------------------------
// Rúbrica práctica (§ 75)
// ---------------------------------------------------------------------------

export type RubricItem = { key: string; label: string; hint: string }

/**
 * Diez áreas de 10 puntos. La especificación sustituye el ítem de ventaja por
 * el de faltas acumuladas en futsal y por el conteo de cuatro segundos en
 * fútbol playa, porque es lo equivalente en cada disciplina.
 */
export function rubricFor(discipline: string): RubricItem[] {
  const shared: RubricItem[] = [
    { key: 'rules', label: 'Reglamento', hint: '¿Aplicaste la regla correcta, y supiste cuál era privada?' },
    { key: 'positioning', label: 'Posicionamiento', hint: '¿Tuviste ángulo para ver lo que decidiste?' },
    { key: 'signals', label: 'Señales', hint: '¿Fueron claras, completas y sostenidas lo que corresponde?' },
    { key: 'whistle', label: 'Silbato', hint: '¿Variaste la intensidad según la gravedad?' },
    { key: 'discipline', label: 'Disciplina', hint: '¿La escala fue coherente durante todo el partido?' },
    { key: 'communication', label: 'Comunicación', hint: '¿Explicaste sin discutir, y con quién correspondía?' },
  ]

  const specific: RubricItem =
    discipline === 'futsal'
      ? {
          key: 'accumulatedFouls',
          label: 'Faltas acumuladas',
          hint: '¿El recuento fue correcto y comunicado a tiempo?',
        }
      : discipline === 'beach_soccer'
        ? {
            key: 'timing',
            label: 'Conteo de cuatro segundos',
            hint: '¿Contaste visiblemente y con criterio parejo?',
          }
        : {
            key: 'advantage',
            label: 'Ventaja',
            hint: '¿Aplicaste la ventaja cuando correspondía, y volviste atrás si no se concretó?',
          }

  return [
    ...shared,
    specific,
    { key: 'safety', label: 'Seguridad', hint: '¿Actuaste a tiempo sobre lo peligroso?' },
    { key: 'control', label: 'Control', hint: '¿El partido se mantuvo dentro de cauces manejables?' },
    { key: 'report', label: 'Informe', hint: '¿El acta quedó completa y entregada como correspondía?' },
  ]
}

export const RUBRIC_MAX_PER_ITEM = 10
export const RUBRIC_TOTAL = 100
export const RUBRIC_PASS = 75

// ---------------------------------------------------------------------------
// Estado del examen
// ---------------------------------------------------------------------------

export type PartResult = {
  /** Aciertos, en las partes A, B y C. */
  correct: number
  total: number
  passed: boolean
  attempts: number
  at: string
}

export function isPartPassed(result: PartResult | null | undefined): boolean {
  return Boolean(result?.passed)
}
