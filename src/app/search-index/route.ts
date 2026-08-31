import { getSearchIndex } from '@/lib/content'

/**
 * El índice de búsqueda, servido como archivo estático.
 *
 * Se genera durante la compilación y no cambia en runtime, así que se
 * prerenderiza igual que las páginas. El buscador lo pide la primera vez que
 * se abre, no al cargar la aplicación.
 */
export const dynamic = 'force-static'

export function GET() {
  return Response.json(getSearchIndex(), {
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
