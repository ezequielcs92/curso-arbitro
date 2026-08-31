'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wordmark } from './Brand'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { href: '/', label: 'Cursos', match: (p: string) => p === '/' || p.startsWith('/curso') },
  { href: '/formatos', label: 'Fichas de formato', match: (p: string) => p.startsWith('/formatos') },
]

export function TopBar() {
  const pathname = usePathname() ?? '/'

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-canvas)_82%,transparent)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-lg transition-opacity hover:opacity-80"
          aria-label="Árbitro Amateur, inicio"
        >
          <Wordmark />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = link.match(pathname)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <nav className="flex items-center gap-1 sm:hidden">
            {LINKS.map((link) => {
              const active = link.match(pathname)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)]'
                      : 'text-[var(--color-ink-muted)]'
                  }`}
                >
                  {link.href === '/' ? 'Cursos' : 'Fichas'}
                </Link>
              )
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
