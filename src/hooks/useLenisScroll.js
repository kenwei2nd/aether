import { useEffect } from 'react'
import Lenis from 'lenis'
import { syncWithLenis } from '@animations/gsap.config'

export function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    })
    syncWithLenis(lenis)
    return () => lenis.destroy()
  }, [])
}
