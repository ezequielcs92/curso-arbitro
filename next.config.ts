import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // El contenido son 174 archivos Markdown que no cambian en runtime: se lee
  // todo en build y cada leccion queda prerenderizada.
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
}

export default nextConfig
