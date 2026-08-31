/**
 * Clase de acento por disciplina. Cada una define `--accent`, que usan los
 * anillos de avance, los bordes y las citas del reglamento.
 */
const BY_SLUG: Record<string, string> = {
  football: 'accent-football',
  futsal: 'accent-futsal',
  'beach-soccer': 'accent-beach',
}

export function accentClass(slug: string): string {
  return BY_SLUG[slug] ?? 'accent-football'
}
