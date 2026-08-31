'use client'

import { useCallback, useEffect, useState } from 'react'

type Props = {
  slug: string
  courseTitle: string
  lessonIds: string[]
}

type State =
  | { kind: 'checking' }
  | { kind: 'unsupported' }
  | { kind: 'idle'; cached: number; total: number }
  | { kind: 'saving'; done: number; total: number }
  | { kind: 'saved'; total: number; failed: number }

/**
 * Guarda un curso entero para consultarlo sin señal.
 *
 * El service worker ya deja disponible lo que se visitó, pero eso sirve al
 * revés de como se usa: nadie abre las sesenta lecciones por las dudas. El
 * caso real es dejarlo descargado la noche antes de ir a dirigir.
 */
export function OfflineCourse({ slug, courseTitle, lessonIds }: Props) {
  const [state, setState] = useState<State>({ kind: 'checking' })

  const urls = useCallback(
    () => [
      `/curso/${slug}`,
      ...lessonIds.map((id) => `/curso/${slug}/${id}`),
      '/search-index',
    ],
    [slug, lessonIds],
  )

  /** Habla con el service worker por un canal propio para cada pedido. */
  const ask = useCallback(
    (message: Record<string, unknown>, onMessage: (data: any) => void) => {
      const worker = navigator.serviceWorker?.controller
      if (!worker) return false

      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => onMessage(event.data)
      worker.postMessage(message, [channel.port2])
      return true
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!('serviceWorker' in navigator)) {
        setState({ kind: 'unsupported' })
        return
      }

      // El service worker puede tardar en tomar control tras la primera carga.
      await navigator.serviceWorker.ready.catch(() => undefined)
      if (cancelled) return

      const list = urls()
      const sent = ask({ type: 'course-status', urls: list }, (data) => {
        if (cancelled || data?.type !== 'status') return
        setState({ kind: 'idle', cached: data.cached, total: data.total })
      })

      if (!sent) setState({ kind: 'unsupported' })
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [urls, ask])

  function save() {
    const list = urls()
    setState({ kind: 'saving', done: 0, total: list.length })

    ask({ type: 'cache-course', urls: list }, (data) => {
      if (data?.type === 'progress') {
        setState({ kind: 'saving', done: data.done, total: data.total })
      } else if (data?.type === 'done') {
        setState({ kind: 'saved', total: data.total, failed: data.failed })
      }
    })
  }

  function forget() {
    const list = urls()
    ask({ type: 'forget-course', urls: list }, (data) => {
      if (data?.type === 'forgotten') setState({ kind: 'idle', cached: 0, total: list.length })
    })
  }

  // En desarrollo no hay service worker: no se muestra un botón que no hace nada.
  if (state.kind === 'checking' || state.kind === 'unsupported') return null

  const complete =
    state.kind === 'saved' || (state.kind === 'idle' && state.cached === state.total)

  return (
    <section className="no-print mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start gap-3">
        <CloudIcon complete={complete} />

        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-[640] tracking-[-0.012em]">
            {complete ? 'Guardado para usar sin conexión' : 'Usar sin conexión'}
          </h2>

          <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[var(--color-ink-muted)]">
            {state.kind === 'saving' ? (
              <>
                Descargando el curso de {courseTitle}…{' '}
                <span className="tabular-nums">
                  {state.done} de {state.total}
                </span>
              </>
            ) : complete ? (
              <>
                Las {lessonIds.length} lecciones y el buscador están en este
                dispositivo. Podés consultarlas en una cancha sin señal.
              </>
            ) : (
              <>
                Guardá las {lessonIds.length} lecciones y el buscador ahora, para
                consultarlos después en una cancha sin señal.
              </>
            )}
          </p>

          {state.kind === 'saving' && (
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-3)]"
              role="progressbar"
              aria-valuenow={Math.round((state.done / state.total) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avance de la descarga"
            >
              <div
                className="h-full rounded-full bg-[var(--accent,var(--color-brand))] transition-[width] duration-200"
                style={{ width: `${(state.done / state.total) * 100}%` }}
              />
            </div>
          )}

          {state.kind === 'saved' && state.failed > 0 && (
            <p className="mt-2 text-[12.5px] text-[var(--color-warn)]">
              {state.failed} {state.failed === 1 ? 'página no se pudo' : 'páginas no se pudieron'}{' '}
              guardar. Probá de nuevo con mejor señal.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!complete && (
              <button
                type="button"
                onClick={save}
                disabled={state.kind === 'saving'}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line-strong)] px-3.5 py-2 text-[13.5px] font-[560] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)] disabled:cursor-progress disabled:opacity-60"
              >
                {state.kind === 'saving' ? 'Guardando…' : 'Guardar el curso'}
              </button>
            )}

            {complete && (
              <button
                type="button"
                onClick={forget}
                className="rounded-lg px-3 py-2 text-[13px] font-[540] text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
              >
                Borrar la copia
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CloudIcon({ complete }: { complete: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg ${
        complete
          ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
          : 'bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]'
      }`}
    >
      {complete ? (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none">
          <path
            d="m4.6 10.4 3.5 3.5 7.3-7.8"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none">
          <path
            d="M10 3v8m0 0L7 8m3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 13v2a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  )
}
