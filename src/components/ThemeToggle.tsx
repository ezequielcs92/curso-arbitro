'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    setReady(true)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('aa-theme', next ? 'dark' : 'light')
    } catch {
      // Sin almacenamiento el tema no persiste, pero el cambio se aplica igual.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={dark ? 'Tema claro' : 'Tema oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
    >
      {/* Hasta saber el tema real se reserva el espacio sin dibujar nada, para
          no mostrar un ícono que cambie apenas hidrata. */}
      {ready ? (
        dark ? (
          <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="3.6" fill="currentColor" />
            <path
              d="M10 1.6v2.1M10 16.3v2.1M18.4 10h-2.1M3.7 10H1.6M15.94 4.06l-1.48 1.48M5.54 14.46l-1.48 1.48M15.94 15.94l-1.48-1.48M5.54 5.54 4.06 4.06"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" fill="none" aria-hidden="true">
            <path
              d="M17 12.3A7.5 7.5 0 0 1 7.7 3a7.5 7.5 0 1 0 9.3 9.3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )
      ) : (
        <span className="h-[17px] w-[17px]" />
      )}
    </button>
  )
}
