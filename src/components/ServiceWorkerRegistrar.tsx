'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker. Solo en producción: en desarrollo una caché
 * activa haría que los cambios no se vean.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Sin service worker la app sigue andando; solo pierde el offline.
      })
    }

    // Se espera al load para no competir por ancho de banda con la página.
    if (document.readyState === 'complete') register()
    else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
