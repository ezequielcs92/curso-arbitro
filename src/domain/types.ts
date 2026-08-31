/**
 * Domain types for Árbitro Amateur.
 *
 * Three independent courses, one per discipline. `Discipline` is the axis that
 * runs through every piece of content: a football question is never drawn for a
 * futsal exam, and futsal skill scores never count towards beach soccer.
 *
 * See docs/cursos.md for the curriculum and AGENTS.md for the domain rules.
 */

// ---------------------------------------------------------------------------
// Disciplines and rule sources
// ---------------------------------------------------------------------------

export type Discipline = 'football' | 'futsal' | 'beach_soccer'

export const DISCIPLINES: Discipline[] = ['football', 'futsal', 'beach_soccer']

/**
 * Where a rule comes from. Never collapse these: presenting a private tournament
 * rule as if it were the official rulebook is the one unrecoverable failure of
 * this product.
 *
 * - `official`   the discipline's own rulebook (IFAB for football, FIFA for
 *                futsal and beach soccer)
 * - `competition` a modification the rulebook allows the organiser to make
 * - `private`     a rule specific to one amateur tournament
 */
export type RuleSource = 'official' | 'competition' | 'private'

/** The rulebook edition a piece of content was written against. */
export type RulesVersion = string

export type DisciplineInfo = {
  id: Discipline
  /** Display name, Spanish. */
  name: string
  governingBody: 'IFAB' | 'FIFA'
  rulesVersion: RulesVersion
  /** Date the edition came into force, ISO 8601. */
  effectiveFrom: string
  /** Content root, relative to the repository. */
  contentPath: string
}

export const DISCIPLINE_INFO: Record<Discipline, DisciplineInfo> = {
  football: {
    id: 'football',
    name: 'Fútbol',
    governingBody: 'IFAB',
    rulesVersion: 'IFAB 2026/27',
    effectiveFrom: '2026-07-01',
    contentPath: 'content/football/ifab-2026-27',
  },
  futsal: {
    id: 'futsal',
    name: 'Futsal',
    governingBody: 'FIFA',
    rulesVersion: 'FIFA Futsal 2025-26',
    effectiveFrom: '2025-09-05',
    contentPath: 'content/futsal/fifa-2025-26',
  },
  beach_soccer: {
    id: 'beach_soccer',
    name: 'Fútbol playa',
    governingBody: 'FIFA',
    rulesVersion: 'FIFA Beach Soccer 2025-26',
    effectiveFrom: '2025-12-17',
    contentPath: 'content/beach-soccer/fifa-2025-26',
  },
}

/**
 * Match formats. The reduced football formats are football, not separate
 * sports: they run under IFAB with permitted competition modifications.
 */
export type MatchFormat =
  | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F11'
  | 'FUTSAL'
  | 'BEACH'

export const FORMATS_BY_DISCIPLINE: Record<Discipline, MatchFormat[]> = {
  football: ['F5', 'F6', 'F7', 'F8', 'F9', 'F11'],
  futsal: ['FUTSAL'],
  beach_soccer: ['BEACH'],
}

/**
 * A pre-match reference sheet for one reduced football format.
 *
 * These are not lessons: they carry no mini test and do not count towards
 * course progress. They exist because IFAB fixes no value whatsoever for F5,
 * F7, F8 or F9 — the Laws only list which organisational aspects a national
 * association may adapt. So a sheet contrasts the format against F11, the one
 * format the Laws do specify, and leaves the rest blank for the referee to
 * fill in from the tournament's own rulebook.
 */
export type FormatSheet = {
  id: string
  format: MatchFormat
  title: string
  /** Path to the Markdown file holding the sheet. */
  contentPath: string
  summary: string
}

// ---------------------------------------------------------------------------
// Course structure
// ---------------------------------------------------------------------------

export type Course = {
  discipline: Discipline
  title: string
  rulesVersion: RulesVersion
  modules: Module[]
}

export type Module = {
  id: string
  discipline: Discipline
  order: number
  title: string
  /** Rules or Laws this module covers, e.g. [13] or [1, 2, 3, 4]. */
  laws: number[]
  /**
   * Critical modules require a higher pass mark. Offside and fouls in football;
   * timing, accumulated fouls and no-wall free kicks in the other two.
   */
  critical: boolean
  /** Percentage needed to unlock the next module. 80, or 85 when critical. */
  requiredScore: number
  lessons: Lesson[]
}

export type Lesson = {
  id: string
  moduleId: string
  order: number
  title: string
  /** Path to the Markdown file holding the lesson body. */
  contentPath: string
  /** Rule reference for the lesson, e.g. "Ley 13.5" or "Regla 12". */
  ruleReference?: string
}

/**
 * The teaching block every lesson follows (specification § 106). Stored as
 * headings inside the Markdown file rather than as separate fields, so the
 * content stays readable and editable on its own.
 */
export type LessonSection =
  | 'regla'
  | 'explicacion-simple'
  | 'ejemplo'
  | 'error-comun'
  | 'mini-test'

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'decision_tree'
  | 'image_case'
  | 'video_case'
  | 'positioning'

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Question = {
  id: string
  discipline: Discipline
  moduleId: string
  rulesVersion: RulesVersion
  type: QuestionType
  difficulty: Difficulty
  question: string
  options?: string[]
  correctAnswer: unknown
  /** Always required. A question without an explanation teaches nothing. */
  explanation: string
  ruleReference?: string
  tags: string[]
}

/**
 * A full match decision, evaluated component by component so the answer can
 * earn partial credit (specification § 102). Getting the foul right but the
 * restart wrong is not the same as getting everything wrong.
 */
export type DecisionAnswer = {
  /** Is there an offence at all? 3 points. */
  isOffence: boolean
  /** Technical decision: what the restart is. 3 points. */
  technical: TechnicalDecision
  /** Disciplinary decision. 2 points. */
  disciplinary: DisciplinaryDecision
  /** Where and how play restarts. 2 points. */
  restart: RestartLocation
}

export type TechnicalDecision =
  | 'direct_free_kick'
  | 'indirect_free_kick'
  | 'penalty_kick'
  | 'dropped_ball'
  | 'play_on'
  | 'advantage'
  /** Futsal only: direct free kick from the sixth accumulated foul. */
  | 'dfksaf'

export type DisciplinaryDecision = 'none' | 'caution' | 'send_off'

export type RestartLocation =
  | 'place_of_offence'
  | 'penalty_mark'
  | 'ten_metre_mark'
  | 'centre_of_pitch'
  | 'penalty_area_line'
  | 'goal_line'
  | 'corner'

export const DECISION_POINTS = {
  isOffence: 3,
  technical: 3,
  disciplinary: 2,
  restart: 2,
} as const

/** Total available for one fully answered decision. */
export const DECISION_TOTAL = 10

// ---------------------------------------------------------------------------
// Skills and progress
// ---------------------------------------------------------------------------

/**
 * Skill scores, 0-100. Tracked per discipline: being sharp on football fouls
 * says nothing about futsal, where the accumulated-foul count changes what a
 * foul costs.
 */
export type Skills = {
  rules: number
  fouls: number
  discipline: number
  /** Football only. Always 0 for futsal and beach soccer, which have no offside. */
  offside: number
  restarts: number
  penalties: number
  positioning: number
  communication: number
  matchControl: number
  privateRules: number
  /** Futsal only: accumulated fouls and the DFKSAF. */
  accumulatedFouls?: number
  /** Futsal and beach soccer: running the clock and the four-second count. */
  timing?: number
}

export type CourseProgress = {
  discipline: Discipline
  currentLevel: number
  xp: number
  streak: number
  skills: Skills
  moduleProgress: ModuleProgress[]
  completedAt?: string
}

export type ModuleProgress = {
  moduleId: string
  score: number
  completed: boolean
  completedAt?: string
  attempts: number
}

export type Profile = {
  id: string
  name: string
  /** One progress record per discipline. Courses are enrolled independently. */
  courses: Partial<Record<Discipline, CourseProgress>>
}

// ---------------------------------------------------------------------------
// Complementary videos (specification § 89.1)
// ---------------------------------------------------------------------------

/**
 * Third-party YouTube material attached to a lesson. Curated by hand, never
 * fetched by live search: the lesson is the source, the video is support.
 */
export type LessonVideo = {
  youtubeId: string
  title: string
  channel: string
  language: 'es' | 'en' | 'pt'
  durationSeconds: number

  /** Optional trim, for when the topic starts partway into a long video. */
  startSeconds?: number
  endSeconds?: number

  discipline: Discipline
  lessonIds: string[]
  tags: string[]

  /** Unreviewed videos are never shown. */
  reviewed: boolean
  reviewedAt?: string
  rulesVersionAtReview: RulesVersion

  /** Shown next to the card when the video is right except on one point. */
  caveat?: string

  lastCheckedAt?: string
  available: boolean
}

// ---------------------------------------------------------------------------
// Competitions and matches
// ---------------------------------------------------------------------------

/** A private tournament's rulebook, as captured by the user. */
export type Competition = {
  id: string
  name: string
  discipline: Discipline
  format: MatchFormat
  rules: CompetitionRules
  createdAt: string
}

export type CompetitionRules = {
  periods: number
  periodMinutes: number
  /** Whether the clock stops on every stoppage, as in futsal and beach soccer. */
  stoppedClock: boolean
  playersPerSide: number
  substitutions: 'unlimited' | 'limited' | 'unlimited_no_reentry'
  maxSubstitutes?: number
  offside: 'full' | 'reduced' | 'none'
  throwIn: 'hands' | 'feet' | 'either'
  slidingTackles: 'allowed' | 'forbidden' | 'block_only' | 'custom'
  accumulatedFouls: boolean
  accumulatedFoulThreshold?: number
  blueCard: boolean
  temporaryExclusion: boolean
  wallDistanceMetres: number | null
  /** Free-text rules that do not fit any field above. */
  specialRules?: string
}

export type Match = {
  id: string
  discipline: Discipline
  competitionId?: string
  date: string
  venue: string
  format: MatchFormat
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
  incidents: MatchIncident[]
  selfAssessment?: SelfAssessment
  notes?: string
}

export type MatchIncident = {
  id: string
  minute: number
  period: number
  type: 'goal' | 'caution' | 'send_off' | 'accumulated_foul' | 'timeout' | 'other'
  team: 'A' | 'B'
  /** Shirt number or initials only — never full names (specification § 114). */
  player?: string
  description?: string
}

/** Post-match self-assessment, 1 to 5 per area (specification § 60). */
export type SelfAssessment = {
  rules: number
  positioning: number
  fitness: number
  signals: number
  whistle: number
  communication: number
  discipline: number
  advantage: number
  control: number
  concentration: number
  wouldChange?: string
  didWell?: string
  willTrain?: string
}
