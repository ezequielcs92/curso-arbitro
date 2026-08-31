'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/content'

/**
 * Índice de la lección con resaltado de la sección visible.
 *
 * Se marca activo el último encabezado que quedó por encima de la línea de
 * lectura, no el primero que entra en pantalla: al bajar, la sección que se
 * está leyendo es la que ya cruzó hacia arriba.
 */
export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? '')

  useEffect(() => {
    if (headings.length === 0) return

    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((n): n is HTMLElement => n !== null)

    if (nodes.length === 0) return

    function update() {
      const line = window.scrollY + 140
      let current = nodes[0].id

      for (const node of nodes) {
        if (node.offsetTop <= line) current = node.id
        else break
      }

      // Al final de la página se marca la última, que si no nunca se alcanza.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 60
      if (atBottom) current = nodes[nodes.length - 1].id

      setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="En esta lección" className="text-[13px]">
      <p className="mb-3 text-[11px] font-[620] uppercase tracking-[0.09em] text-[var(--color-ink-subtle)]">
        En esta lección
      </p>
      <ul className="space-y-px border-l border-[var(--color-line)]">
        {headings.map((h) => {
          const isActive = h.id === active
          return (
            <li key={h.id} className="relative">
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -left-px top-1 bottom-1 w-[2px] rounded-full bg-[var(--accent,var(--color-brand))]"
                />
              )}
              <a
                href={`#${h.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`block py-1.5 pl-3 pr-2 leading-snug transition-colors ${
                  isActive
                    ? 'font-[580] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
