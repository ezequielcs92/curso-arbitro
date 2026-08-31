import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import { TopBar } from '@/components/TopBar'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Serif para el cuerpo de las lecciones: son textos largos y se leen mejor.
const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

// Monoespaciada para los bloques que se completan a mano antes del partido.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Árbitro Amateur',
    template: '%s · Árbitro Amateur',
  },
  description:
    'Curso de arbitraje amateur para fútbol, futsal y fútbol playa, escrito contra los reglamentos oficiales de IFAB y FIFA.',
  applicationName: 'Árbitro Amateur',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Árbitro Amateur',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0c0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/**
 * Se aplica el tema antes del primer pintado. Si esto corriera como efecto de
 * React, la página parpadearía en claro antes de pasar a oscuro.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('aa-theme');
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-[var(--shadow-lift)]"
        >
          Saltar al contenido
        </a>
        <TopBar />
        <main id="contenido">{children}</main>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
