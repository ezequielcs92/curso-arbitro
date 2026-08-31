'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  highlight,
  prepare,
  search,
  type PreparedEntry,
  type SearchEntry,
  type SearchHit,
} from '@/lib/search'

/**
 * Buscador de todo el contenido.
 *
 * El índice pesa cerca de 900 KB en crudo, así que se descarga la primera vez
 * que se abre el diálogo y no al cargar la página: quien solo va a leer una
 * lección nunca lo pide.
 */
export function Search() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<PreparedEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  const load = useCallback(async () => {
    if (entries || loading) return
    setLoading(true)
    setFailed(false)
    try {
      const response = await fetch('/search-index')
      if (!response.ok) throw new Error(String(response.status))
      const data = (await response.json()) as SearchEntry[]
      setEntries(prepare(data))
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [entries, loading])

  const show = useCallback(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null
    setOpen(true)
    void load()
  }, [load])

  const hide = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
    restoreFocusTo.current?.focus?.()
  }, [])

  // Atajos globales. La barra sola solo abre si no se está escribiendo en otro
  // control, que si no es imposible escribir una barra en ningún lado.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        open ? hide() : show()
        return
      }

      if (event.key === '/' && !typing && !open) {
        event.preventDefault()
        show()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, show, hide])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Con el diálogo abierto la página de atrás no se desplaza.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const hits = useMemo<SearchHit[]>(() => {
    if (!entries || query.trim().length < 2) return []
    return search(entries, query)
  }, [entries, query])

  useEffect(() => {
    setActive(0)
  }, [query])

  const go = useCallback(
    (hit: SearchHit) => {
      hide()
      router.push(hit.entry.u)
    },
    [hide, router],
  )

  function onInputKey(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      hide()
      return
    }
    if (hits.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % hits.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + hits.length) % hits.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const hit = hits[active]
      if (hit) go(hit)
    }
  }

  // El resultado marcado se mantiene a la vista al moverse con el teclado.
  useEffect(() => {
    const node = listRef.current?.children[active] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Buscar en el contenido"
        className="flex h-9 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 text-[var(--color-ink-subtle)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink-muted)] sm:w-[210px] sm:px-3"
      >
        <SearchIcon />
        <span className="hidden text-[13px] sm:inline">Buscar</span>
        <kbd className="ml-auto hidden rounded border border-[var(--color-line)] px-1.5 py-px font-mono text-[10.5px] text-[var(--color-ink-subtle)] sm:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en el contenido"
        >
          <div
            className="absolute inset-0 bg-[rgb(9_11_14/0.45)] backdrop-blur-sm"
            onClick={hide}
            aria-hidden="true"
          />

          <div className="relative flex max-h-[76vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[16px] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-lift)]">
            <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4">
              <SearchIcon className="text-[var(--color-ink-subtle)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Buscar una regla, un término, una situación…"
                aria-label="Texto a buscar"
                className="h-[52px] flex-1 bg-transparent text-[15px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-subtle)]"
              />
              <button
                type="button"
                onClick={hide}
                className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--color-ink-subtle)] transition-colors hover:text-[var(--color-ink)]"
              >
                esc
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {loading && <Message>Cargando el índice…</Message>}

              {failed && (
                <Message>
                  No se pudo cargar el índice. Si estás sin conexión, la búsqueda
                  necesita haberse abierto al menos una vez con señal.
                </Message>
              )}

              {!loading && !failed && query.trim().length < 2 && (
                <Message>
                  Escribí al menos dos letras. Busca en las 174 lecciones y en las
                  cuatro fichas de formato.
                </Message>
              )}

              {!loading && !failed && query.trim().length >= 2 && hits.length === 0 && (
                <Message>
                  Sin resultados para <strong className="text-[var(--color-ink)]">{query}</strong>.
                </Message>
              )}

              {hits.length > 0 && (
                <ul ref={listRef} className="p-2">
                  {hits.map((hit, i) => (
                    <li key={hit.entry.u}>
                      <button
                        type="button"
                        onClick={() => go(hit)}
                        onMouseMove={() => setActive(i)}
                        aria-current={i === active ? 'true' : undefined}
                        className={`block w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                          i === active ? 'bg-[var(--color-surface-2)]' : ''
                        }`}
                      >
                        <span className="flex items-baseline gap-2">
                          <span className="min-w-0 flex-1 truncate text-[14px] font-[580] text-[var(--color-ink)]">
                            <Marked text={hit.entry.t} query={query} />
                          </span>
                          <span className="flex-none text-[11px] text-[var(--color-ink-subtle)]">
                            {hit.entry.g}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-[var(--color-ink-subtle)]">
                          {hit.entry.c}
                        </span>
                        <span className="mt-1.5 line-clamp-2 block text-[12.5px] leading-[1.5] text-[var(--color-ink-muted)]">
                          <Marked text={hit.snippet} query={query} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-[var(--color-line)] px-4 py-2 text-[11px] text-[var(--color-ink-subtle)]">
              <span>
                <Key>↑</Key> <Key>↓</Key> moverse
              </span>
              <span>
                <Key>↵</Key> abrir
              </span>
              <span>
                <Key>esc</Key> cerrar
              </span>
              {hits.length > 0 && (
                <span className="ml-auto tabular-nums">
                  {hits.length} resultado{hits.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Marked({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((part, i) =>
        part.hit ? (
          <mark
            key={i}
            className="rounded-[3px] bg-[var(--color-brand-soft)] px-px text-[var(--color-brand)]"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 py-8 text-center text-[13.5px] leading-relaxed text-[var(--color-ink-subtle)]">
      {children}
    </p>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-[var(--color-line)] px-1 py-px font-mono text-[10px]">
      {children}
    </kbd>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-[15px] w-[15px] flex-none ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m10.6 10.6 3.1 3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
