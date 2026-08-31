export type SearchEntry = {
  u: string
  t: string
  c: string
  g: string
  b: string
}

export type SearchHit = {
  entry: SearchEntry
  score: number
  /** Fragmento del cuerpo alrededor de la primera coincidencia. */
  snippet: string
}

/**
 * Normaliza sin cambiar la longitud del texto.
 *
 * `normalize('NFD')` mas quitar diacriticos seria mas corto, pero descompone
 * cada vocal acentuada en dos caracteres y los indices dejan de coincidir con
 * el texto original: el fragmento saldria corrido. Con un mapeo uno a uno, la
 * posicion que encuentra la busqueda es la misma posicion del texto que se
 * muestra.
 */
const FOLD: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
  ñ: 'n', ç: 'c',
}

export function fold(text: string): string {
  let out = ''
  const lower = text.toLowerCase()
  for (const ch of lower) out += FOLD[ch] ?? ch
  return out
}

export type PreparedEntry = SearchEntry & {
  ft: string
  fc: string
  fb: string
}

export function prepare(entries: SearchEntry[]): PreparedEntry[] {
  return entries.map((e) => ({
    ...e,
    ft: fold(e.t),
    fc: fold(e.c),
    fb: fold(e.b),
  }))
}

function countOccurrences(haystack: string, needle: string, cap: number): number {
  let n = 0
  let from = 0
  while (n < cap) {
    const at = haystack.indexOf(needle, from)
    if (at === -1) break
    n++
    from = at + needle.length
  }
  return n
}

/**
 * Busca los terminos en todos los documentos.
 *
 * Se exigen todos los terminos (Y logico, no O): con 178 documentos sobre el
 * mismo tema, buscar "cesion arquero" tiene que devolver donde aparecen los
 * dos, no cualquier leccion que nombre a un arquero.
 */
export function search(entries: PreparedEntry[], query: string, limit = 24): SearchHit[] {
  const terms = fold(query.trim()).split(/\s+/).filter((t) => t.length > 1)
  if (terms.length === 0) return []

  const hits: SearchHit[] = []

  for (const entry of entries) {
    let score = 0
    let matchesAll = true

    for (const term of terms) {
      const inTitle = entry.ft.includes(term)
      const inSection = entry.fc.includes(term)
      const inBody = countOccurrences(entry.fb, term, 8)

      if (!inTitle && !inSection && inBody === 0) {
        matchesAll = false
        break
      }

      if (inTitle) score += 12
      if (inSection) score += 5
      score += inBody
    }

    if (!matchesAll) continue

    // Un titulo que empieza con lo buscado va primero: es lo que se espera al
    // escribir "fuera de juego".
    if (entry.ft.startsWith(terms[0])) score += 6

    hits.push({ entry, score, snippet: makeSnippet(entry, terms[0]) })
  }

  hits.sort((a, b) => b.score - a.score || a.entry.t.localeCompare(b.entry.t))
  return hits.slice(0, limit)
}

function makeSnippet(entry: PreparedEntry, term: string): string {
  const at = entry.fb.indexOf(term)
  if (at === -1) return entry.b.slice(0, 150).trim()

  const start = Math.max(0, at - 70)
  const end = Math.min(entry.b.length, at + term.length + 110)

  let snippet = entry.b.slice(start, end).trim()
  if (start > 0) snippet = '…' + snippet
  if (end < entry.b.length) snippet = snippet + '…'
  return snippet
}

/** Parte el texto en tramos, marcando cuales coinciden, para resaltarlos. */
export function highlight(text: string, query: string): { text: string; hit: boolean }[] {
  const terms = fold(query.trim()).split(/\s+/).filter((t) => t.length > 1)
  if (terms.length === 0) return [{ text, hit: false }]

  const folded = fold(text)
  const marks: boolean[] = new Array(text.length).fill(false)

  for (const term of terms) {
    let from = 0
    for (;;) {
      const at = folded.indexOf(term, from)
      if (at === -1) break
      for (let i = at; i < at + term.length; i++) marks[i] = true
      from = at + term.length
    }
  }

  const parts: { text: string; hit: boolean }[] = []
  let current = ''
  let currentHit = marks[0] ?? false

  for (let i = 0; i < text.length; i++) {
    if (marks[i] === currentHit) {
      current += text[i]
    } else {
      parts.push({ text: current, hit: currentHit })
      current = text[i]
      currentHit = marks[i]
    }
  }
  if (current) parts.push({ text: current, hit: currentHit })

  return parts
}
