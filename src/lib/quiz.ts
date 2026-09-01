import { DECISION_POINTS, DECISION_TOTAL } from '@/domain/types'

export type QuestionType = 'multiple_choice' | 'true_false' | 'decision'

export type DecisionAnswer = {
  isOffence: boolean
  technical: string
  disciplinary: string
  restart: string
}

export type Question = {
  id: string
  moduleId: string
  type: QuestionType
  difficulty: 1 | 2 | 3 | 4 | 5
  question: string
  options?: string[]
  correctAnswer: number | boolean | DecisionAnswer
  explanation: string
  ruleReference: string
  tags: string[]
}

export type QuestionBank = {
  moduleId: string
  discipline: string
  rulesVersion: string
  questions: Question[]
}

// ---------------------------------------------------------------------------
// Puntuación
// ---------------------------------------------------------------------------

export type ComponentResult = {
  key: keyof typeof DECISION_POINTS
  label: string
  points: number
  earned: number
  given: string
  expected: string
  correct: boolean
}

export type Scored = {
  /** Fracción de 0 a 1. Una decisión puede quedar en 0.7. */
  fraction: number
  correct: boolean
  /** Solo en decisiones: el desglose de los 10 puntos. */
  components?: ComponentResult[]
  earnedPoints?: number
  totalPoints?: number
}

export const TECHNICAL_LABELS: Record<string, string> = {
  direct_free_kick: 'Tiro libre directo',
  indirect_free_kick: 'Tiro libre indirecto',
  penalty_kick: 'Tiro penal',
  dropped_ball: 'Balón a tierra',
  play_on: 'Se sigue jugando',
  advantage: 'Ventaja',
  dfksaf: 'Tiro libre desde la sexta falta',
}

export const DISCIPLINARY_LABELS: Record<string, string> = {
  none: 'Sin tarjeta',
  caution: 'Amonestación',
  send_off: 'Expulsión',
}

export const RESTART_LABELS: Record<string, string> = {
  place_of_offence: 'En el lugar de la infracción',
  penalty_mark: 'Desde el punto penal',
  ten_metre_mark: 'Desde la marca de 10 m',
  centre_of_pitch: 'Desde el centro de la cancha',
  penalty_area_line: 'Desde la línea del área',
  goal_line: 'Desde la línea de meta',
  corner: 'Saque de esquina',
}

/**
 * Opciones ofrecidas en cada componente de una decisión.
 *
 * Se filtran por disciplina: `dfksaf` es el tiro libre desde la sexta falta
 * acumulada y solo existe en futsal, así que ofrecerlo en los otros dos cursos
 * sería enseñar que existe algo que no existe.
 */
export function technicalOptions(discipline: string): string[] {
  const all = Object.keys(TECHNICAL_LABELS)
  return discipline === 'futsal' ? all : all.filter((k) => k !== 'dfksaf')
}

export const DISCIPLINARY_OPTIONS = Object.keys(DISCIPLINARY_LABELS)

export function restartOptions(discipline: string): string[] {
  const all = Object.keys(RESTART_LABELS)
  // La marca de 10 m es la del tiro desde la sexta falta acumulada.
  return discipline === 'futsal' ? all : all.filter((k) => k !== 'ten_metre_mark')
}

const COMPONENT_LABELS: Record<keyof typeof DECISION_POINTS, string> = {
  isOffence: '¿Hay infracción?',
  technical: 'Decisión técnica',
  disciplinary: 'Decisión disciplinaria',
  restart: 'Reanudación',
}

function describe(key: keyof typeof DECISION_POINTS, value: unknown): string {
  if (key === 'isOffence') return value ? 'Sí, hay infracción' : 'No hay infracción'
  if (key === 'technical') return TECHNICAL_LABELS[String(value)] ?? String(value)
  if (key === 'disciplinary') return DISCIPLINARY_LABELS[String(value)] ?? String(value)
  return RESTART_LABELS[String(value)] ?? String(value)
}

/**
 * Puntúa una respuesta.
 *
 * Las decisiones se evalúan componente por componente y devuelven una fracción,
 * no sus 10 puntos en bruto: si una decisión valiera diez veces más que una
 * pregunta de opción múltiple, cuatro decisiones decidirían el resultado de un
 * módulo de cuarenta preguntas. La fracción conserva el crédito parcial sin
 * desbalancear el módulo.
 */
export function score(question: Question, given: unknown): Scored {
  if (question.type === 'decision') {
    const expected = question.correctAnswer as DecisionAnswer
    const answer = (given ?? {}) as Partial<DecisionAnswer>

    let earned = 0
    const components: ComponentResult[] = (
      Object.keys(DECISION_POINTS) as (keyof typeof DECISION_POINTS)[]
    ).map((key) => {
      const points = DECISION_POINTS[key]
      const correct = answer[key] !== undefined && answer[key] === expected[key]
      if (correct) earned += points

      return {
        key,
        label: COMPONENT_LABELS[key],
        points,
        earned: correct ? points : 0,
        given: answer[key] === undefined ? '—' : describe(key, answer[key]),
        expected: describe(key, expected[key]),
        correct,
      }
    })

    return {
      fraction: earned / DECISION_TOTAL,
      correct: earned === DECISION_TOTAL,
      components,
      earnedPoints: earned,
      totalPoints: DECISION_TOTAL,
    }
  }

  const correct = given === question.correctAnswer
  return { fraction: correct ? 1 : 0, correct }
}

/** Nota del módulo, de 0 a 100. */
export function percentage(fractions: number[]): number {
  if (fractions.length === 0) return 0
  const sum = fractions.reduce((a, b) => a + b, 0)
  return Math.round((sum / fractions.length) * 100)
}

/**
 * Mezcla sin sesgo (Fisher-Yates). Se usa al reintentar, para que repetir un
 * módulo no sea memorizar el orden.
 */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
