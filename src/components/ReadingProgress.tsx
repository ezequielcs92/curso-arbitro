'use client'

import { useEffect, useRef } from 'react'

/**
 * Barra fina de avance de lectura, pegada bajo el encabezado.
 *
 * Se escribe directo sobre el nodo con un rAF en vez de pasar por estado de
 * React: es un valor que cambia en cada scroll y no debe provocar renders.
 */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const el = ref.current
      if (!el) return

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      el.style.transform = `scaleX(${ratio})`
    }

    function onScroll() {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-14 z-40 h-[2px]"
    >
      <div
        ref={ref}
        className="reading-bar h-full w-full bg-[var(--accent,var(--color-brand))]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
